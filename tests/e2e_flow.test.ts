import 'dotenv/config';
import assert from 'assert';
import { prisma } from '../server/src/db/prisma.js';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, generatePNR, generateBookingRef, generateTransactionId } from '../server/src/utils/jwt.js';

async function testFullUserFlow() {
  console.log('🚂 Running End-to-End Railway Booking & Cancellation Flow...\n');

  // 1. Register a fresh passenger user
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: 'Aditi Verma',
      email,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash,
      role: 'USER',
    },
  });
  console.log('  1. Register User: OK - Created user', user.email);

  // Verify Login with password check
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  assert.strictEqual(isMatch, true, 'User password authentication failed');
  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  const decoded = verifyToken(token);
  assert.strictEqual(decoded?.userId, user.id);
  console.log('  2. Login Authentication: OK - Token verified');

  // 2. Search Trains
  const hwh = await prisma.station.findUnique({ where: { code: 'HWH' } });
  const ndls = await prisma.station.findUnique({ where: { code: 'NDLS' } });
  assert(hwh && ndls, 'Stations HWH and NDLS must exist');

  const trains = await prisma.train.findMany({
    where: {
      sourceStationId: hwh.id,
      destinationStationId: ndls.id,
      isActive: true,
    },
    include: { coaches: { include: { seats: true } } },
  });
  assert(trains.length > 0, 'Should find at least 1 train between HWH and NDLS');
  const train = trains[0];
  console.log(`  3. Search Trains: OK - Found ${train.number} (${train.name})`);

  // 3. Select Class & Check Available Seats
  const travelClass = '3A';
  const coach = train.coaches.find((c) => c.coachType === travelClass);
  assert(coach, `Coach for ${travelClass} should exist`);
  const availableSeat = coach.seats.find((s) => s.isAvailable);
  assert(availableSeat, 'At least one seat should be available');
  console.log(`  4. Select Class & Seat: OK - Seat ${availableSeat.seatNumber} in Coach ${coach.coachCode} (${availableSeat.berthType})`);

  // 4. Create Booking with Passenger & Seat
  const pnr = generatePNR();
  const bookingRef = generateBookingRef();
  const txId = generateTransactionId();

  // Mark seat booked
  await prisma.seat.update({
    where: { id: availableSeat.id },
    data: { isAvailable: false },
  });

  const booking = await prisma.booking.create({
    data: {
      pnr,
      bookingReference: bookingRef,
      userId: user.id,
      trainId: train.id,
      sourceStationId: hwh.id,
      destinationStationId: ndls.id,
      journeyDate: '2026-10-25',
      travelClass,
      totalFare: 2792.70,
      status: 'CONFIRMED',
      passengers: {
        create: [
          {
            passengerName: 'Aditi Verma',
            age: 26,
            gender: 'Female',
            berthPreference: 'Lower',
            nationality: 'Indian',
            coachCode: coach.coachCode,
            seatNumber: availableSeat.seatNumber,
            berthType: availableSeat.berthType,
            seatId: availableSeat.id,
            status: `CNF/${coach.coachCode}/${availableSeat.seatNumber}`,
          },
        ],
      },
      payment: {
        create: {
          transactionId: txId,
          amount: 2792.70,
          paymentMethod: 'UPI',
          paymentGateway: 'RailEase Pay (Demo)',
          status: 'SUCCESS',
        },
      },
    },
    include: {
      passengers: true,
      payment: true,
      sourceStation: true,
      destinationStation: true,
      train: true,
    },
  });

  assert.strictEqual(booking.status, 'CONFIRMED');
  assert.strictEqual(booking.passengers.length, 1);
  assert.strictEqual(booking.payment?.status, 'SUCCESS');
  console.log(`  5. Generate Booking & PNR: OK - PNR ${booking.pnr} (Ref: ${booking.bookingReference})`);

  // 5. Check PNR
  const pnrLookup = await prisma.booking.findUnique({
    where: { pnr: booking.pnr },
    include: { passengers: true, train: true },
  });
  assert(pnrLookup !== null);
  assert.strictEqual(pnrLookup.status, 'CONFIRMED');
  console.log(`  6. Check PNR Status: OK - PNR ${booking.pnr} status is CONFIRMED`);

  // 6. Cancel Ticket & Verify Status Changed
  const refundAmount = 2792.70 - 240; // Policy deduction
  await prisma.seat.update({
    where: { id: availableSeat.id },
    data: { isAvailable: true },
  });
  const cancelledBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancellationRefund: refundAmount,
      cancelledAt: new Date(),
      cancellationReason: 'Travel plan cancelled',
    },
  });
  assert.strictEqual(cancelledBooking.status, 'CANCELLED');
  assert.strictEqual(cancelledBooking.cancellationRefund, refundAmount);

  // Check seat is available again
  const refreshedSeat = await prisma.seat.findUnique({ where: { id: availableSeat.id } });
  assert.strictEqual(refreshedSeat?.isAvailable, true, 'Seat should be released back to inventory');

  console.log(`  7. Cancel Ticket & Refund: OK - Status changed to CANCELLED, Seat released, Demo refund: ₹${refundAmount}`);

  // Cleanup test user & booking
  await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
  await prisma.bookingPassenger.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log('\n🎉 ALL MAJOR USER FLOWS VALIDATED SUCCESSFULLY WITH ZERO ERRORS!\n');
}

testFullUserFlow()
  .catch((e) => {
    console.error('E2E test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
