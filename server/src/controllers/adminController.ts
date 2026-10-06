import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getAdminDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const confirmedTickets = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const cancelledTickets = await prisma.booking.count({ where: { status: 'CANCELLED' } });
    const racTickets = await prisma.booking.count({ where: { status: 'RAC' } });
    const totalTrains = await prisma.train.count();

    // Total revenue from successful payments
    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Bookings by class
    const bookingsByClass = await prisma.booking.groupBy({
      by: ['travelClass'],
      _count: { id: true },
    });

    // Recent 10 bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        train: { select: { number: true, name: true } },
        sourceStation: { select: { code: true, name: true } },
        destinationStation: { select: { code: true, name: true } },
        passengers: true,
      },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        confirmedTickets,
        cancelledTickets,
        racTickets,
        totalTrains,
        totalRevenue: Math.round(totalRevenue),
        bookingsByClass: bookingsByClass.map((b) => ({
          travelClass: b.travelClass,
          count: b._count.id,
        })),
        recentBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard metrics' });
  }
}

export async function getAdminTrains(req: Request, res: Response): Promise<void> {
  try {
    const trains = await prisma.train.findMany({
      include: {
        sourceStation: true,
        destinationStation: true,
        _count: {
          select: { coaches: true, bookings: true, routes: true },
        },
      },
      orderBy: { number: 'asc' },
    });

    res.json({ success: true, trains });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve trains' });
  }
}

export async function createAdminTrain(req: Request, res: Response): Promise<void> {
  try {
    const {
      number,
      name,
      type,
      sourceStationId,
      destinationStationId,
      departureTime,
      arrivalTime,
      durationHours,
      runsOnDays = 'Daily',
      classesAvailable = '1A,2A,3A,SL',
      baseFare = 450,
    } = req.body;

    if (!number || !name || !sourceStationId || !destinationStationId) {
      res.status(400).json({ success: false, error: 'Missing required train fields' });
      return;
    }

    const train = await prisma.train.create({
      data: {
        number,
        name,
        type: type || 'Superfast',
        sourceStationId,
        destinationStationId,
        departureTime: departureTime || '08:00',
        arrivalTime: arrivalTime || '18:00',
        durationHours: parseFloat(durationHours) || 10,
        runsOnDays,
        classesAvailable,
        baseFare: parseFloat(baseFare) || 450,
        isActive: true,
      },
    });

    // Create default coaches for the train
    const classList = classesAvailable.split(',');
    for (let i = 0; i < classList.length; i++) {
      const cType = classList[i].trim();
      const coachCode = `${cType[0]}${i + 1}`;
      const coach = await prisma.coach.create({
        data: {
          trainId: train.id,
          coachCode,
          coachType: cType,
          totalSeats: 32,
        },
      });

      const seats = [];
      for (let s = 1; s <= 32; s++) {
        seats.push({
          coachId: coach.id,
          seatNumber: s,
          berthType: s % 3 === 1 ? 'Lower' : s % 3 === 2 ? 'Middle' : 'Upper',
          isAvailable: true,
        });
      }
      await prisma.seat.createMany({ data: seats });
    }

    res.status(201).json({ success: true, message: 'Train created successfully', train });
  } catch (error) {
    console.error('Error creating train:', error);
    res.status(500).json({ success: false, error: 'Failed to create train' });
  }
}

export async function updateAdminTrain(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, type, departureTime, arrivalTime, durationHours, runsOnDays, baseFare, isActive } = req.body;

    const train = await prisma.train.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(type ? { type } : {}),
        ...(departureTime ? { departureTime } : {}),
        ...(arrivalTime ? { arrivalTime } : {}),
        ...(durationHours ? { durationHours: parseFloat(durationHours) } : {}),
        ...(runsOnDays ? { runsOnDays } : {}),
        ...(baseFare ? { baseFare: parseFloat(baseFare) } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });

    res.json({ success: true, message: 'Train updated successfully', train });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update train' });
  }
}

export async function deleteAdminTrain(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.train.delete({ where: { id } });
    res.json({ success: true, message: 'Train deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete train' });
  }
}

export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
}

export async function getAdminBookings(req: Request, res: Response): Promise<void> {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        train: { select: { number: true, name: true, type: true } },
        sourceStation: true,
        destinationStation: true,
        passengers: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
}

export async function toggleSeatStatus(req: Request, res: Response): Promise<void> {
  try {
    const { seatId } = req.params;
    const seat = await prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) {
      res.status(404).json({ success: false, error: 'Seat not found' });
      return;
    }

    const updated = await prisma.seat.update({
      where: { id: seatId },
      data: { isAvailable: !seat.isAvailable },
    });

    res.json({ success: true, seat: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update seat status' });
  }
}
