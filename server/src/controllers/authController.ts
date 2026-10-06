import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { validateRegisterInput, validateLoginInput } from '../validators/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    const validation = validateRegisterInput({ name, email, phone, password, confirmPassword });
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: phone.trim() }],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        res.status(409).json({ success: false, error: 'An account with this email address already exists' });
        return;
      }
      res.status(409).json({ success: false, error: 'An account with this mobile number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        role: 'USER',
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed due to a server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email address or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email address or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Authentication service error' });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        savedPassengers: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        savedPassengers: user.savedPassengers,
        totalBookings: user._count.bookings,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.json({ success: true, message: 'Profile updated successfully', user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}

export async function addSavedPassenger(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const { fullName, age, gender, berthPreference, nationality } = req.body;
    if (!fullName || !age || !gender) {
      res.status(400).json({ success: false, error: 'Name, age, and gender are required' });
      return;
    }

    const passenger = await prisma.savedPassenger.create({
      data: {
        userId: req.user.id,
        fullName: fullName.trim(),
        age: parseInt(age, 10),
        gender,
        berthPreference: berthPreference || 'No Preference',
        nationality: nationality || 'Indian',
      },
    });

    res.status(201).json({ success: true, passenger });
  } catch (error) {
    console.error('Add saved passenger error:', error);
    res.status(500).json({ success: false, error: 'Failed to add saved passenger' });
  }
}

export async function deleteSavedPassenger(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    await prisma.savedPassenger.deleteMany({
      where: {
        id,
        userId: req.user.id,
      },
    });
    res.json({ success: true, message: 'Saved passenger removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete passenger' });
  }
}
