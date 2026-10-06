import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  generatePNR,
  generateBookingRef,
  generateTransactionId,
  calculateClassFare,
} from '../utils/jwt.js';
import { validateBookingInput } from '../validators/index.js';

export async function createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const {
      trainId,
      sourceStationId,
      destinationStationId,
      journeyDate,
      travelClass,
      passengers,
      paymentMethod = 'UPI',
      selectedSeatIds = [],
    } = req.body;

    const validation = validateBookingInput({
      trainId,
      sourceStationId,
      destinationStationId,
      journeyDate,
      travelClass,
      passengers,
    });

    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    // Verify train & stations exist
    const train = await prisma.train.findUnique({
      where: { id: trainId },
      include: {
        coaches: {
          where: { coachType: travelClass },
          include: {
            seats: true,
          },
        },
      },
    });

    if (!train) {
      res.status(404).json({ success: false, error: 'Train not found' });
      return;
    }

    const srcStation = await prisma.station.findUnique({ where: { id: sourceStationId } });
    const destStation = await prisma.station.findUnique({ where: { id: destinationStationId } });

    if (!srcStation || !destStation) {
      res.status(404).json({ success: false, error: 'Stations not found' });
      return;
    }

    // Calculate total fare
    const perPassengerFare = calculateClassFare(train.baseFare, travelClass);
    const convenienceFee = 17.7; // standard convenience fee
    const totalFare = perPassengerFare * passengers.length + convenienceFee;

    // Collect available seats in this class's coaches
    const availableSeats: { id: string; seatNumber: number; berthType: string; coachCode: string }[] = [];
    for (const coach of train.coaches) {
      for (const seat of coach.seats) {
        if (seat.isAvailable) {
          availableSeats.push({
            id: seat.id,
            seatNumber: seat.seatNumber,
            berthType: seat.berthType,
            coachCode: coach.coachCode,
          });
        }
      }
    }

    // If specific seat IDs were picked by user, prioritize those
    const allocatedSeats: typeof availableSeats = [];
    const usedSeatIds = new Set<string>();

    if (Array.isArray(selectedSeatIds) && selectedSeatIds.length > 0) {
      for (const sId of selectedSeatIds) {
        const found = availableSeats.find((s) => s.id === sId && !usedSeatIds.has(s.id));
        if (found) {
          allocatedSeats.push(found);
          usedSeatIds.add(found.id);
        }
      }
    }

    // Fill remaining passengers with available seats
    for (let i = allocatedSeats.length; i < passengers.length; i++) {
      const remainingSeat = availableSeats.find((s) => !usedSeatIds.has(s.id));
      if (remainingSeat) {
        allocatedSeats.push(remainingSeat);
        usedSeatIds.add(remainingSeat.id);
      }
    }

    const isConfirmed = allocatedSeats.length >= passengers.length;
    const bookingStatus = isConfirmed ? 'CONFIRMED' : 'RAC';

    const pnr = generatePNR();
    const bookingRef = generateBookingRef();
    const transactionId = generateTransactionId();

    // Use Prisma transaction to create booking, passengers, update seats, and create payment
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark seats as unavailable
      for (const allocated of allocatedSeats) {
        await tx.seat.update({
          where: { id: allocated.id },
          data: { isAvailable: false },
        });
      }

      // 2. Create Booking
      const booking = await tx.booking.create({
        data: {
          pnr,
          bookingReference: bookingRef,
          userId: req.user!.id,
          trainId: train.id,
          sourceStationId: srcStation.id,
          destinationStationId: destStation.id,
          journeyDate,
          travelClass,
          totalFare,
          status: bookingStatus,
        },
      });

      // 3. Create Passenger records
      const bookingPassengers = [];
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        const allocated = allocatedSeats[i];

        let statusText = 'CONFIRMED';
        let coachCode = 'B1';
        let seatNum = 20 + i;
        let berth = p.berthPreference || 'Lower';
        let seatId = null;

        if (allocated) {
          coachCode = allocated.coachCode;
          seatNum = allocated.seatNumber;
          berth = allocated.berthType;
          seatId = allocated.id;
          statusText = `CNF/${coachCode}/${seatNum}`;
        } else {
          statusText = `RAC-${i + 1}`;
        }

        const bp = await tx.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            passengerName: p.fullName.trim(),
            age: parseInt(p.age, 10),
            gender: p.gender,
            berthPreference: p.berthPreference || 'No Preference',
            nationality: p.nationality || 'Indian',
            coachCode,
            seatNumber: seatNum,
            berthType: berth,
            seatId,
            status: statusText,
          },
        });
        bookingPassengers.push(bp);
      }

      // 4. Create Payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          transactionId,
          amount: totalFare,
          paymentMethod,
          paymentGateway: 'RailEase Pay (Demo)',
          status: 'SUCCESS',
        },
      });

      return { booking, bookingPassengers, payment };
    });

    // Fetch full created booking with relations for response
    const fullBooking = await prisma.booking.findUnique({
      where: { id: result.booking.id },
      include: {
        train: true,
        sourceStation: true,
        destinationStation: true,
        passengers: true,
        payment: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created and ticket confirmed successfully!',
      booking: fullBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to process ticket booking' });
  }
}

export async function getUserBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { status } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
        status: status && status !== 'ALL' ? String(status) : undefined,
      },
      include: {
        train: {
          include: {
            sourceStation: true,
            destinationStation: true,
          },
        },
        sourceStation: true,
        destinationStation: true,
        passengers: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to load bookings' });
  }
}

export async function getBookingById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        // Allow access if admin or booking owner
        ...(req.user?.role !== 'ADMIN' ? { userId: req.user?.id } : {}),
      },
      include: {
        train: {
          include: {
            routes: {
              include: { station: true },
              orderBy: { stopNumber: 'asc' },
            },
          },
        },
        sourceStation: true,
        destinationStation: true,
        passengers: true,
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ success: false, error: 'Failed to load booking' });
  }
}

export async function checkPNR(req: Request, res: Response): Promise<void> {
  try {
    const { pnr } = req.params;
    if (!pnr || pnr.trim().length === 0) {
      res.status(400).json({ success: false, error: 'PNR number is required' });
      return;
    }

    const cleanedPNR = pnr.trim();
    const booking = await prisma.booking.findUnique({
      where: { pnr: cleanedPNR },
      include: {
        train: true,
        sourceStation: true,
        destinationStation: true,
        passengers: true,
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: `No booking found for PNR: ${cleanedPNR}. Please verify the 10-digit number.`,
      });
      return;
    }

    res.json({
      success: true,
      pnrInfo: {
        pnr: booking.pnr,
        bookingReference: booking.bookingReference,
        trainNumber: booking.train.number,
        trainName: booking.train.name,
        trainType: booking.train.type,
        journeyDate: booking.journeyDate,
        travelClass: booking.travelClass,
        fromStation: {
          code: booking.sourceStation.code,
          name: booking.sourceStation.name,
          city: booking.sourceStation.city,
        },
        toStation: {
          code: booking.destinationStation.code,
          name: booking.destinationStation.name,
          city: booking.destinationStation.city,
        },
        departureTime: booking.train.departureTime,
        arrivalTime: booking.train.arrivalTime,
        totalFare: booking.totalFare,
        bookingStatus: booking.status,
        cancellationRefund: booking.cancellationRefund,
        passengers: booking.passengers.map((p, idx) => ({
          number: idx + 1,
          name: p.passengerName,
          age: p.age,
          gender: p.gender,
          bookingStatus: booking.status === 'CANCELLED' ? 'CANCELLED' : 'CNF',
          currentStatus: booking.status === 'CANCELLED' ? 'CAN' : p.status,
          coach: booking.status === 'CANCELLED' ? '-' : p.coachCode,
          berth: booking.status === 'CANCELLED' ? '-' : `${p.seatNumber} (${p.berthType})`,
        })),
      },
    });
  } catch (error) {
    console.error('Error checking PNR:', error);
    res.status(500).json({ success: false, error: 'PNR lookup failed' });
  }
}

export async function cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { reason = 'Passenger requested cancellation' } = req.body;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {}),
      },
      include: {
        passengers: true,
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    if (booking.status === 'CANCELLED') {
      res.status(400).json({ success: false, error: 'This ticket is already cancelled' });
      return;
    }

    // Calculate Indian Railway cancellation charges:
    // Flat cancellation deduction of Rs. 120 per passenger or 15% whichever is higher
    const cancellationCharge = Math.min(booking.totalFare * 0.15, 240 * booking.passengers.length);
    const refundAmount = Math.max(0, Math.round(booking.totalFare - cancellationCharge));

    await prisma.$transaction(async (tx) => {
      // 1. Release assigned seats
      for (const p of booking.passengers) {
        if (p.seatId) {
          await tx.seat.update({
            where: { id: p.seatId },
            data: { isAvailable: true },
          });
        }
      }

      // 2. Update booking status
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancellationRefund: refundAmount,
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // 3. Update payment status to REFUNDED
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: 'REFUNDED',
          },
        });
      }
    });

    const updated = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        train: true,
        sourceStation: true,
        destinationStation: true,
        passengers: true,
        payment: true,
      },
    });

    res.json({
      success: true,
      message: 'Ticket successfully cancelled. Demo refund has been initiated.',
      cancellationDetails: {
        pnr: booking.pnr,
        totalFare: booking.totalFare,
        cancellationFee: cancellationCharge,
        refundAmount,
        refundStatus: 'INITIATED',
        expectedDays: '3-5 Business Days (Demo)',
      },
      booking: updated,
    });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel ticket' });
  }
}
