import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RailEase database seed...');

  // 1. Clean existing records (in reverse order of dependencies)
  await prisma.payment.deleteMany();
  await prisma.bookingPassenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.trainRoute.deleteMany();
  await prisma.train.deleteMany();
  await prisma.savedPassenger.deleteMany();
  await prisma.user.deleteMany();
  await prisma.station.deleteMany();

  console.log('Cleared existing data.');

  // 2. Seed Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const userPasswordHash = await bcrypt.hash('Traveler@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'RailEase System Admin',
      email: 'admin@railease.in',
      phone: '+91 98765 43210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Rohan Sharma',
      email: 'traveler@railease.in',
      phone: '+91 91234 56789',
      passwordHash: userPasswordHash,
      role: 'USER',
      savedPassengers: {
        create: [
          {
            fullName: 'Rohan Sharma',
            age: 29,
            gender: 'Male',
            berthPreference: 'Lower',
            nationality: 'Indian',
          },
          {
            fullName: 'Priya Sharma',
            age: 27,
            gender: 'Female',
            berthPreference: 'Window',
            nationality: 'Indian',
          },
          {
            fullName: 'Arun Sharma',
            age: 58,
            gender: 'Male',
            berthPreference: 'Lower',
            nationality: 'Indian',
          },
        ],
      },
    },
  });

  console.log('Seeded users:', { admin: admin.email, demoUser: demoUser.email });

  // 3. Seed Stations
  const stationsData = [
    { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', zone: 'Northern Railway' },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'Eastern Railway' },
    { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', zone: 'Eastern Railway' },
    { code: 'KOAA', name: 'Kolkata Terminal', city: 'Kolkata', state: 'West Bengal', zone: 'Eastern Railway' },
    { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'Western Railway' },
    { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'Central Railway' },
    { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'Southern Railway' },
    { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', zone: 'South Western Railway' },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', zone: 'East Central Railway' },
    { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'Northern Railway' },
    { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', zone: 'Northern Railway' },
    { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'Central Railway' },
    { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', zone: 'South Central Railway' },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'Western Railway' },
    { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'North Western Railway' },
    { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', zone: 'North Central Railway' },
    { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', zone: 'North Central Railway' },
    { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn.', city: 'Mughalsarai', state: 'Uttar Pradesh', zone: 'East Central Railway' },
    { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'West Central Railway' },
    { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', zone: 'Central Railway' },
  ];

  const stationMap: Record<string, string> = {};
  for (const st of stationsData) {
    const created = await prisma.station.create({ data: st });
    stationMap[st.code] = created.id;
  }
  console.log(`Seeded ${stationsData.length} stations.`);

  // 4. Seed Trains with Coaches & Seats & Routes
  const trainsList = [
    {
      number: '12301',
      name: 'Howrah Rajdhani Express',
      type: 'Rajdhani',
      sourceCode: 'HWH',
      destCode: 'NDLS',
      departureTime: '16:50',
      arrivalTime: '10:05',
      durationHours: 17.25,
      runsOnDays: 'Mon,Tue,Wed,Thu,Fri,Sun',
      classesAvailable: '1A,2A,3A',
      baseFare: 1850,
      routes: [
        { code: 'HWH', stopNumber: 1, arr: '16:50', dep: '16:50', km: 0, day: 1, halt: 0 },
        { code: 'DDU', stopNumber: 2, arr: '00:45', dep: '00:55', km: 672, day: 2, halt: 10 },
        { code: 'PRYJ', stopNumber: 3, arr: '02:43', dep: '02:45', km: 825, day: 2, halt: 2 },
        { code: 'CNB', stopNumber: 4, arr: '04:40', dep: '04:45', km: 1019, day: 2, halt: 5 },
        { code: 'NDLS', stopNumber: 5, arr: '10:05', dep: '10:05', km: 1451, day: 2, halt: 0 },
      ],
      coaches: [
        { code: 'H1', type: '1A', seatsCount: 18 },
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
        { code: 'B2', type: '3A', seatsCount: 48 },
      ],
    },
    {
      number: '12302',
      name: 'New Delhi - Howrah Rajdhani',
      type: 'Rajdhani',
      sourceCode: 'NDLS',
      destCode: 'HWH',
      departureTime: '16:55',
      arrivalTime: '09:55',
      durationHours: 17.0,
      runsOnDays: 'Mon,Tue,Wed,Thu,Sat,Sun',
      classesAvailable: '1A,2A,3A',
      baseFare: 1850,
      routes: [
        { code: 'NDLS', stopNumber: 1, arr: '16:55', dep: '16:55', km: 0, day: 1, halt: 0 },
        { code: 'CNB', stopNumber: 2, arr: '21:32', dep: '21:37', km: 432, day: 1, halt: 5 },
        { code: 'PRYJ', stopNumber: 3, arr: '23:43', dep: '23:45', km: 626, day: 1, halt: 2 },
        { code: 'DDU', stopNumber: 4, arr: '01:42', dep: '01:52', km: 779, day: 2, halt: 10 },
        { code: 'HWH', stopNumber: 5, arr: '09:55', dep: '09:55', km: 1451, day: 2, halt: 0 },
      ],
      coaches: [
        { code: 'H1', type: '1A', seatsCount: 18 },
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
      ],
    },
    {
      number: '22436',
      name: 'Vande Bharat Express',
      type: 'Vande Bharat',
      sourceCode: 'NDLS',
      destCode: 'BSB',
      departureTime: '06:00',
      arrivalTime: '14:00',
      durationHours: 8.0,
      runsOnDays: 'Tue,Wed,Fri,Sat,Sun',
      classesAvailable: 'CC,EC',
      baseFare: 1450,
      routes: [
        { code: 'NDLS', stopNumber: 1, arr: '06:00', dep: '06:00', km: 0, day: 1, halt: 0 },
        { code: 'CNB', stopNumber: 2, arr: '10:08', dep: '10:10', km: 440, day: 1, halt: 2 },
        { code: 'PRYJ', stopNumber: 3, arr: '12:08', dep: '12:10', km: 635, day: 1, halt: 2 },
        { code: 'BSB', stopNumber: 4, arr: '14:00', dep: '14:00', km: 759, day: 1, halt: 0 },
      ],
      coaches: [
        { code: 'C1', type: 'CC', seatsCount: 52 },
        { code: 'C2', type: 'CC', seatsCount: 52 },
        { code: 'E1', type: 'EC', seatsCount: 40 },
      ],
    },
    {
      number: '22435',
      name: 'Varanasi - New Delhi Vande Bharat',
      type: 'Vande Bharat',
      sourceCode: 'BSB',
      destCode: 'NDLS',
      departureTime: '15:00',
      arrivalTime: '23:00',
      durationHours: 8.0,
      runsOnDays: 'Tue,Wed,Fri,Sat,Sun',
      classesAvailable: 'CC,EC',
      baseFare: 1450,
      routes: [
        { code: 'BSB', stopNumber: 1, arr: '15:00', dep: '15:00', km: 0, day: 1, halt: 0 },
        { code: 'PRYJ', stopNumber: 2, arr: '16:30', dep: '16:32', km: 124, day: 1, halt: 2 },
        { code: 'CNB', stopNumber: 3, arr: '18:30', dep: '18:32', km: 319, day: 1, halt: 2 },
        { code: 'NDLS', stopNumber: 4, arr: '23:00', dep: '23:00', km: 759, day: 1, halt: 0 },
      ],
      coaches: [
        { code: 'C1', type: 'CC', seatsCount: 52 },
        { code: 'E1', type: 'EC', seatsCount: 40 },
      ],
    },
    {
      number: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'Rajdhani',
      sourceCode: 'MMCT',
      destCode: 'NDLS',
      departureTime: '17:00',
      arrivalTime: '08:32',
      durationHours: 15.53,
      runsOnDays: 'Daily',
      classesAvailable: '1A,2A,3A',
      baseFare: 1950,
      routes: [
        { code: 'MMCT', stopNumber: 1, arr: '17:00', dep: '17:00', km: 0, day: 1, halt: 0 },
        { code: 'ADI', stopNumber: 2, arr: '23:00', dep: '23:10', km: 491, day: 1, halt: 10 },
        { code: 'NDLS', stopNumber: 3, arr: '08:32', dep: '08:32', km: 1384, day: 2, halt: 0 },
      ],
      coaches: [
        { code: 'H1', type: '1A', seatsCount: 18 },
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
        { code: 'B2', type: '3A', seatsCount: 48 },
      ],
    },
    {
      number: '12621',
      name: 'Tamil Nadu Express',
      type: 'Superfast',
      sourceCode: 'MAS',
      destCode: 'NDLS',
      departureTime: '22:00',
      arrivalTime: '06:30',
      durationHours: 32.5,
      runsOnDays: 'Daily',
      classesAvailable: '1A,2A,3A,SL',
      baseFare: 840,
      routes: [
        { code: 'MAS', stopNumber: 1, arr: '22:00', dep: '22:00', km: 0, day: 1, halt: 0 },
        { code: 'NGP', stopNumber: 2, arr: '13:50', dep: '14:00', km: 1091, day: 2, halt: 10 },
        { code: 'BPL', stopNumber: 3, arr: '20:10', dep: '20:20', km: 1481, day: 2, halt: 10 },
        { code: 'NDLS', stopNumber: 4, arr: '06:30', dep: '06:30', km: 2182, day: 3, halt: 0 },
      ],
      coaches: [
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
        { code: 'S1', type: 'SL', seatsCount: 64 },
        { code: 'S2', type: 'SL', seatsCount: 64 },
      ],
    },
    {
      number: '12002',
      name: 'Bhopal Shatabdi Express',
      type: 'Shatabdi',
      sourceCode: 'NDLS',
      destCode: 'BPL',
      departureTime: '06:00',
      arrivalTime: '14:40',
      durationHours: 8.67,
      runsOnDays: 'Daily',
      classesAvailable: 'CC,EC',
      baseFare: 1120,
      routes: [
        { code: 'NDLS', stopNumber: 1, arr: '06:00', dep: '06:00', km: 0, day: 1, halt: 0 },
        { code: 'BPL', stopNumber: 2, arr: '14:40', dep: '14:40', km: 708, day: 1, halt: 0 },
      ],
      coaches: [
        { code: 'C1', type: 'CC', seatsCount: 52 },
        { code: 'C2', type: 'CC', seatsCount: 52 },
        { code: 'E1', type: 'EC', seatsCount: 40 },
      ],
    },
    {
      number: '12393',
      name: 'Sampoorna Kranti Express',
      type: 'Superfast',
      sourceCode: 'PNBE',
      destCode: 'NDLS',
      departureTime: '19:25',
      arrivalTime: '07:55',
      durationHours: 12.5,
      runsOnDays: 'Daily',
      classesAvailable: '1A,2A,3A,SL',
      baseFare: 720,
      routes: [
        { code: 'PNBE', stopNumber: 1, arr: '19:25', dep: '19:25', km: 0, day: 1, halt: 0 },
        { code: 'DDU', stopNumber: 2, arr: '22:20', dep: '22:30', km: 211, day: 1, halt: 10 },
        { code: 'CNB', stopNumber: 3, arr: '02:25', dep: '02:30', km: 556, day: 2, halt: 5 },
        { code: 'NDLS', stopNumber: 4, arr: '07:55', dep: '07:55', km: 998, day: 2, halt: 0 },
      ],
      coaches: [
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
        { code: 'S1', type: 'SL', seatsCount: 64 },
      ],
    },
    {
      number: '12124',
      name: 'Deccan Queen Superfast Express',
      type: 'Superfast',
      sourceCode: 'PUNE',
      destCode: 'CSMT',
      departureTime: '07:15',
      arrivalTime: '10:25',
      durationHours: 3.16,
      runsOnDays: 'Daily',
      classesAvailable: 'CC,EC',
      baseFare: 380,
      routes: [
        { code: 'PUNE', stopNumber: 1, arr: '07:15', dep: '07:15', km: 0, day: 1, halt: 0 },
        { code: 'CSMT', stopNumber: 2, arr: '10:25', dep: '10:25', km: 192, day: 1, halt: 0 },
      ],
      coaches: [
        { code: 'C1', type: 'CC', seatsCount: 52 },
        { code: 'E1', type: 'EC', seatsCount: 40 },
      ],
    },
    {
      number: '12245',
      name: 'Howrah - SMVT Bengaluru Duronto',
      type: 'Duronto',
      sourceCode: 'HWH',
      destCode: 'SBC',
      departureTime: '10:50',
      arrivalTime: '15:50',
      durationHours: 29.0,
      runsOnDays: 'Tue,Wed,Fri,Sat,Sun',
      classesAvailable: '1A,2A,3A,SL',
      baseFare: 1650,
      routes: [
        { code: 'HWH', stopNumber: 1, arr: '10:50', dep: '10:50', km: 0, day: 1, halt: 0 },
        { code: 'MAS', stopNumber: 2, arr: '09:10', dep: '09:20', km: 1661, day: 2, halt: 10 },
        { code: 'SBC', stopNumber: 3, arr: '15:50', dep: '15:50', km: 1948, day: 2, halt: 0 },
      ],
      coaches: [
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
        { code: 'S1', type: 'SL', seatsCount: 64 },
      ],
    },
    {
      number: '12723',
      name: 'Telangana Express',
      type: 'Superfast',
      sourceCode: 'HYB',
      destCode: 'NDLS',
      departureTime: '06:00',
      arrivalTime: '07:40',
      durationHours: 25.66,
      runsOnDays: 'Daily',
      classesAvailable: '1A,2A,3A,SL',
      baseFare: 780,
      routes: [
        { code: 'HYB', stopNumber: 1, arr: '06:00', dep: '06:00', km: 0, day: 1, halt: 0 },
        { code: 'NGP', stopNumber: 2, arr: '15:20', dep: '15:30', km: 585, day: 1, halt: 10 },
        { code: 'BPL', stopNumber: 3, arr: '21:40', dep: '21:50', km: 975, day: 1, halt: 10 },
        { code: 'NDLS', stopNumber: 4, arr: '07:40', dep: '07:40', km: 1676, day: 2, halt: 0 },
      ],
      coaches: [
        { code: 'A1', type: '2A', seatsCount: 32 },
        { code: 'B1', type: '3A', seatsCount: 48 },
        { code: 'S1', type: 'SL', seatsCount: 64 },
      ],
    },
    {
      number: '12009',
      name: 'Mumbai - Ahmedabad Shatabdi',
      type: 'Shatabdi',
      sourceCode: 'MMCT',
      destCode: 'ADI',
      departureTime: '06:20',
      arrivalTime: '12:45',
      durationHours: 6.41,
      runsOnDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
      classesAvailable: 'CC,EC',
      baseFare: 980,
      routes: [
        { code: 'MMCT', stopNumber: 1, arr: '06:20', dep: '06:20', km: 0, day: 1, halt: 0 },
        { code: 'ADI', stopNumber: 2, arr: '12:45', dep: '12:45', km: 491, day: 1, halt: 0 },
      ],
      coaches: [
        { code: 'C1', type: 'CC', seatsCount: 52 },
        { code: 'E1', type: 'EC', seatsCount: 40 },
      ],
    },
  ];

  // Helper function to assign berth type based on seat number and coach type
  function getBerthType(seatNum: number, coachType: string): string {
    if (coachType === 'CC' || coachType === 'EC') {
      const col = (seatNum - 1) % 5;
      if (col === 0 || col === 4) return 'Window';
      if (col === 1 || col === 3) return 'Aisle';
      return 'Middle';
    }
    // Sleeper / 3A layout (blocks of 8)
    const mod = (seatNum - 1) % 8;
    switch (mod) {
      case 0:
      case 3:
        return 'Lower';
      case 1:
      case 4:
        return 'Middle';
      case 2:
      case 5:
        return 'Upper';
      case 6:
        return 'Side Lower';
      case 7:
        return 'Side Upper';
      default:
        return 'Lower';
    }
  }

  let createdTrainsCount = 0;
  for (const t of trainsList) {
    const srcId = stationMap[t.sourceCode];
    const destId = stationMap[t.destCode];
    if (!srcId || !destId) continue;

    const train = await prisma.train.create({
      data: {
        number: t.number,
        name: t.name,
        type: t.type,
        sourceStationId: srcId,
        destinationStationId: destId,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        durationHours: t.durationHours,
        runsOnDays: t.runsOnDays,
        classesAvailable: t.classesAvailable,
        baseFare: t.baseFare,
        isActive: true,
      },
    });
    createdTrainsCount++;

    // Routes
    for (const r of t.routes) {
      const stId = stationMap[r.code];
      if (stId) {
        await prisma.trainRoute.create({
          data: {
            trainId: train.id,
            stationId: stId,
            stopNumber: r.stopNumber,
            arrivalTime: r.arr,
            departureTime: r.dep,
            distanceKm: r.km,
            dayNumber: r.day,
            haltMinutes: r.halt,
          },
        });
      }
    }

    // Coaches & Seats
    for (const c of t.coaches) {
      const coach = await prisma.coach.create({
        data: {
          trainId: train.id,
          coachCode: c.code,
          coachType: c.type,
          totalSeats: c.seatsCount,
        },
      });

      // Create seats for this coach
      const seatData = [];
      for (let s = 1; s <= c.seatsCount; s++) {
        seatData.push({
          coachId: coach.id,
          seatNumber: s,
          berthType: getBerthType(s, c.type),
          isAvailable: true,
        });
      }
      await prisma.seat.createMany({
        data: seatData,
      });
    }
  }

  console.log(`Created ${createdTrainsCount} trains with full route stations and seat inventories.`);

  // 5. Seed an Initial Demo Booking for Rohan Sharma
  const rajdhani = await prisma.train.findUnique({
    where: { number: '12301' },
    include: { coaches: { include: { seats: true } } },
  });

  if (rajdhani && demoUser) {
    const coachB1 = rajdhani.coaches.find((c) => c.coachCode === 'B1') || rajdhani.coaches[0];
    const seatsToBook = coachB1.seats.slice(0, 2);

    // Mark seats as booked
    for (const seat of seatsToBook) {
      await prisma.seat.update({
        where: { id: seat.id },
        data: { isAvailable: false },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        pnr: '2456891024',
        bookingReference: 'RE-2026-904128',
        userId: demoUser.id,
        trainId: rajdhani.id,
        sourceStationId: stationMap['HWH'],
        destinationStationId: stationMap['NDLS'],
        journeyDate: '2026-10-15',
        travelClass: '3A',
        totalFare: 3700.0,
        status: 'CONFIRMED',
        passengers: {
          create: [
            {
              passengerName: 'Rohan Sharma',
              age: 29,
              gender: 'Male',
              berthPreference: 'Lower',
              nationality: 'Indian',
              coachCode: coachB1.coachCode,
              seatNumber: seatsToBook[0].seatNumber,
              berthType: seatsToBook[0].berthType,
              seatId: seatsToBook[0].id,
              status: 'CONFIRMED (CNF/B1/' + seatsToBook[0].seatNumber + ')',
            },
            {
              passengerName: 'Priya Sharma',
              age: 27,
              gender: 'Female',
              berthPreference: 'Window',
              nationality: 'Indian',
              coachCode: coachB1.coachCode,
              seatNumber: seatsToBook[1].seatNumber,
              berthType: seatsToBook[1].berthType,
              seatId: seatsToBook[1].id,
              status: 'CONFIRMED (CNF/B1/' + seatsToBook[1].seatNumber + ')',
            },
          ],
        },
        payment: {
          create: {
            transactionId: 'TXN-RAIL-9812401',
            amount: 3700.0,
            paymentMethod: 'UPI',
            paymentGateway: 'RailEase Pay (Demo)',
            status: 'SUCCESS',
          },
        },
      },
    });

    console.log(`Seeded demo booking with PNR: ${booking.pnr}`);
  }

  console.log('✅ RailEase Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
