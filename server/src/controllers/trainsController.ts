import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { calculateClassFare } from '../utils/jwt.js';

export async function getStations(req: Request, res: Response): Promise<void> {
  try {
    const { query } = req.query;
    let stations;
    if (query && typeof query === 'string' && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      // SQLite LIKE query
      stations = await prisma.station.findMany({
        where: {
          OR: [
            { code: { contains: q.toUpperCase() } },
            { name: { contains: q } },
            { city: { contains: q } },
          ],
        },
        take: 15,
        orderBy: { name: 'asc' },
      });
    } else {
      stations = await prisma.station.findMany({
        orderBy: { name: 'asc' },
      });
    }

    res.json({ success: true, stations });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, error: 'Could not fetch stations' });
  }
}

export async function searchTrains(req: Request, res: Response): Promise<void> {
  try {
    const {
      from,
      to,
      date,
      travelClass,
      trainType,
      isAc,
      sortBy,
      departureSlot,
    } = req.query;

    if (!from || !to) {
      res.status(400).json({ success: false, error: 'From and To station parameters are required' });
      return;
    }

    // Resolve source & destination station IDs
    const sourceStation = await prisma.station.findFirst({
      where: {
        OR: [
          { id: String(from) },
          { code: String(from).toUpperCase() },
          { name: { contains: String(from) } },
        ],
      },
    });

    const destinationStation = await prisma.station.findFirst({
      where: {
        OR: [
          { id: String(to) },
          { code: String(to).toUpperCase() },
          { name: { contains: String(to) } },
        ],
      },
    });

    if (!sourceStation || !destinationStation) {
      res.status(404).json({ success: false, error: 'One or both specified stations could not be found' });
      return;
    }

    if (sourceStation.id === destinationStation.id) {
      res.status(400).json({ success: false, error: 'Source and destination stations cannot be the same' });
      return;
    }

    // Find trains that either run directly between source & destination OR have both in their route stops with source before dest
    const allTrains = await prisma.train.findMany({
      where: { isActive: true },
      include: {
        sourceStation: true,
        destinationStation: true,
        routes: {
          include: { station: true },
          orderBy: { stopNumber: 'asc' },
        },
        coaches: {
          include: { seats: true },
        },
      },
    });

    const matchedTrains = [];

    for (const train of allTrains) {
      // Check direct source/dest or intermediate route
      const srcStop = train.routes.find((r) => r.stationId === sourceStation.id);
      const destStop = train.routes.find((r) => r.stationId === destinationStation.id);

      let isValidRoute = false;
      let depTime = train.departureTime;
      let arrTime = train.arrivalTime;
      let duration = train.durationHours;

      if (srcStop && destStop && srcStop.stopNumber < destStop.stopNumber) {
        isValidRoute = true;
        depTime = srcStop.departureTime;
        arrTime = destStop.arrivalTime;
        // Calculate approximate segment duration
        const depParts = depTime.split(':').map(Number);
        const arrParts = arrTime.split(':').map(Number);
        const depMin = depParts[0] * 60 + depParts[1];
        let arrMin = arrParts[0] * 60 + arrParts[1];
        if (destStop.dayNumber > srcStop.dayNumber) {
          arrMin += (destStop.dayNumber - srcStop.dayNumber) * 24 * 60;
        } else if (arrMin < depMin) {
          arrMin += 24 * 60;
        }
        duration = Math.round(((arrMin - depMin) / 60) * 10) / 10;
      } else if (
        train.sourceStationId === sourceStation.id &&
        train.destinationStationId === destinationStation.id
      ) {
        isValidRoute = true;
      }

      if (!isValidRoute) continue;

      // Filter by trainType if provided
      if (trainType && trainType !== 'ALL' && train.type !== trainType) {
        continue;
      }

      // Filter by departure slot if provided
      if (departureSlot && departureSlot !== 'ALL') {
        const hour = parseInt(depTime.split(':')[0], 10);
        if (departureSlot === 'EARLY_MORNING' && (hour >= 6 || hour < 0)) continue;
        if (departureSlot === 'MORNING' && (hour < 6 || hour >= 12)) continue;
        if (departureSlot === 'AFTERNOON' && (hour < 12 || hour >= 18)) continue;
        if (departureSlot === 'NIGHT' && (hour < 18 || hour >= 24)) continue;
      }

      // Parse available classes & compute fares and real-time seat availability
      const classCodes = train.classesAvailable.split(',').map((c) => c.trim());

      // If user filtered by class
      if (travelClass && travelClass !== 'ALL' && !classCodes.includes(String(travelClass))) {
        continue;
      }

      // If user filtered by isAc
      if (isAc === 'true' && !classCodes.some((c) => ['1A', '2A', '3A', 'CC', 'EC'].includes(c))) {
        continue;
      }
      if (isAc === 'false' && !classCodes.some((c) => ['SL', '2S'].includes(c))) {
        continue;
      }

      const classesData = classCodes.map((code) => {
        const coachesOfClass = train.coaches.filter((c) => c.coachType === code);
        let totalSeats = 0;
        let availableSeats = 0;

        coachesOfClass.forEach((coach) => {
          totalSeats += coach.seats.length;
          availableSeats += coach.seats.filter((s) => s.isAvailable).length;
        });

        const fare = calculateClassFare(train.baseFare, code);
        let statusString = 'AVAILABLE';
        let statusBadge = `AVL ${availableSeats}`;
        if (availableSeats === 0) {
          statusString = 'WAITING_LIST';
          statusBadge = 'WL 12';
        } else if (availableSeats < 10) {
          statusString = 'RAC';
          statusBadge = `RAC ${availableSeats}`;
        }

        return {
          classCode: code,
          className: getClassName(code),
          fare,
          totalSeats: totalSeats || 64,
          availableSeats: availableSeats,
          status: statusString,
          badgeText: statusBadge,
          isAc: ['1A', '2A', '3A', 'CC', 'EC'].includes(code),
        };
      });

      matchedTrains.push({
        id: train.id,
        number: train.number,
        name: train.name,
        type: train.type,
        sourceStation: {
          id: sourceStation.id,
          code: sourceStation.code,
          name: sourceStation.name,
          city: sourceStation.city,
        },
        destinationStation: {
          id: destinationStation.id,
          code: destinationStation.code,
          name: destinationStation.name,
          city: destinationStation.city,
        },
        departureTime: depTime,
        arrivalTime: arrTime,
        durationHours: duration,
        runsOnDays: train.runsOnDays,
        classes: classesData,
        minFare: Math.min(...classesData.map((c) => c.fare)),
      });
    }

    // Apply sorting
    if (sortBy === 'CHEAPEST') {
      matchedTrains.sort((a, b) => a.minFare - b.minFare);
    } else if (sortBy === 'FASTEST') {
      matchedTrains.sort((a, b) => a.durationHours - b.durationHours);
    } else if (sortBy === 'EARLIEST') {
      matchedTrains.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    res.json({
      success: true,
      totalCount: matchedTrains.length,
      fromStation: sourceStation,
      toStation: destinationStation,
      journeyDate: date || new Date().toISOString().split('T')[0],
      trains: matchedTrains,
    });
  } catch (error) {
    console.error('Error searching trains:', error);
    res.status(500).json({ success: false, error: 'Train search query failed' });
  }
}

export async function getTrainById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const train = await prisma.train.findUnique({
      where: { id },
      include: {
        sourceStation: true,
        destinationStation: true,
        routes: {
          include: { station: true },
          orderBy: { stopNumber: 'asc' },
        },
        coaches: {
          include: { seats: true },
        },
      },
    });

    if (!train) {
      res.status(404).json({ success: false, error: 'Train not found' });
      return;
    }

    const classCodes = train.classesAvailable.split(',').map((c) => c.trim());
    const classesData = classCodes.map((code) => {
      const coachesOfClass = train.coaches.filter((c) => c.coachType === code);
      let total = 0;
      let avail = 0;
      coachesOfClass.forEach((c) => {
        total += c.seats.length;
        avail += c.seats.filter((s) => s.isAvailable).length;
      });
      return {
        classCode: code,
        className: getClassName(code),
        fare: calculateClassFare(train.baseFare, code),
        totalSeats: total,
        availableSeats: avail,
      };
    });

    res.json({
      success: true,
      train: {
        ...train,
        classes: classesData,
      },
    });
  } catch (error) {
    console.error('Error fetching train by id:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve train details' });
  }
}

export async function getTrainSchedule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const train = await prisma.train.findUnique({
      where: { id },
      include: {
        sourceStation: true,
        destinationStation: true,
        routes: {
          include: { station: true },
          orderBy: { stopNumber: 'asc' },
        },
      },
    });

    if (!train) {
      res.status(404).json({ success: false, error: 'Train not found' });
      return;
    }

    res.json({
      success: true,
      train: {
        id: train.id,
        number: train.number,
        name: train.name,
        type: train.type,
        source: train.sourceStation,
        destination: train.destinationStation,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        runsOnDays: train.runsOnDays,
      },
      schedule: train.routes.map((r) => ({
        stopNumber: r.stopNumber,
        stationCode: r.station.code,
        stationName: r.station.name,
        city: r.station.city,
        state: r.station.state,
        arrivalTime: r.arrivalTime,
        departureTime: r.departureTime,
        haltMinutes: r.haltMinutes,
        distanceKm: r.distanceKm,
        dayNumber: r.dayNumber,
      })),
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to load schedule' });
  }
}

export async function getTrainSeats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { travelClass } = req.query;

    const train = await prisma.train.findUnique({
      where: { id },
      include: {
        coaches: {
          where: travelClass ? { coachType: String(travelClass) } : undefined,
          include: {
            seats: {
              orderBy: { seatNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!train) {
      res.status(404).json({ success: false, error: 'Train not found' });
      return;
    }

    res.json({
      success: true,
      coaches: train.coaches.map((c) => ({
        id: c.id,
        coachCode: c.coachCode,
        coachType: c.coachType,
        totalSeats: c.totalSeats,
        seats: c.seats.map((s) => ({
          id: s.id,
          seatNumber: s.seatNumber,
          berthType: s.berthType,
          isAvailable: s.isAvailable,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ success: false, error: 'Failed to load coach seats' });
  }
}

function getClassName(code: string): string {
  const map: Record<string, string> = {
    '1A': 'AC First Class (1A)',
    '2A': 'AC 2 Tier (2A)',
    '3A': 'AC 3 Tier (3A)',
    'CC': 'AC Chair Car (CC)',
    'EC': 'Exec. Chair Car (EC)',
    'SL': 'Sleeper Class (SL)',
    '2S': 'Second Sitting (2S)',
  };
  return map[code] || code;
}
