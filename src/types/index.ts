export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  totalBookings?: number;
  savedPassengers?: SavedPassenger[];
}

export interface SavedPassenger {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  berthPreference: string;
  nationality: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  zone?: string;
}

export interface TrainClassInfo {
  classCode: string;
  className: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  status: string; // 'AVAILABLE' | 'RAC' | 'WAITING_LIST'
  badgeText: string;
  isAc: boolean;
}

export interface TrainSearchResult {
  id: string;
  number: string;
  name: string;
  type: string;
  sourceStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  durationHours: number;
  runsOnDays: string;
  classes: TrainClassInfo[];
  minFare: number;
}

export interface Seat {
  id: string;
  coachId?: string;
  seatNumber: number;
  berthType: string;
  isAvailable: boolean;
}

export interface Coach {
  id: string;
  coachCode: string;
  coachType: string;
  totalSeats: number;
  seats: Seat[];
}

export interface TrainScheduleStop {
  stopNumber: number;
  stationCode: string;
  stationName: string;
  city: string;
  state: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  distanceKm: number;
  dayNumber: number;
}

export interface PassengerInput {
  fullName: string;
  age: number | string;
  gender: string;
  berthPreference: string;
  nationality: string;
}

export interface BookingPassenger {
  id: string;
  passengerName: string;
  age: number;
  gender: string;
  berthPreference: string;
  nationality: string;
  coachCode: string;
  seatNumber: number;
  berthType: string;
  seatId?: string | null;
  status: string;
}

export interface PaymentInfo {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentGateway: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paidAt: string;
}

export interface Booking {
  id: string;
  pnr: string;
  bookingReference: string;
  userId: string;
  trainId: string;
  sourceStationId: string;
  destinationStationId: string;
  journeyDate: string;
  travelClass: string;
  totalFare: number;
  status: 'CONFIRMED' | 'RAC' | 'WAITING_LIST' | 'CANCELLED';
  cancellationRefund?: number | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  train: {
    id: string;
    number: string;
    name: string;
    type: string;
    departureTime: string;
    arrivalTime: string;
    durationHours?: number;
    sourceStation?: Station;
    destinationStation?: Station;
  };
  sourceStation: Station;
  destinationStation: Station;
  passengers: BookingPassenger[];
  payment?: PaymentInfo | null;
}

export interface PnrStatusData {
  pnr: string;
  bookingReference: string;
  trainNumber: string;
  trainName: string;
  trainType: string;
  journeyDate: string;
  travelClass: string;
  fromStation: { code: string; name: string; city: string };
  toStation: { code: string; name: string; city: string };
  departureTime: string;
  arrivalTime: string;
  totalFare: number;
  bookingStatus: string;
  cancellationRefund?: number | null;
  passengers: {
    number: number;
    name: string;
    age: number;
    gender: string;
    bookingStatus: string;
    currentStatus: string;
    coach: string;
    berth: string;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  confirmedTickets: number;
  cancelledTickets: number;
  racTickets: number;
  totalTrains: number;
  totalRevenue: number;
  bookingsByClass: { travelClass: string; count: number }[];
  recentBookings: any[];
}
