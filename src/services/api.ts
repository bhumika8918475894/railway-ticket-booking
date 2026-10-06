import {
  User,
  Station,
  TrainSearchResult,
  Coach,
  TrainScheduleStop,
  Booking,
  PnrStatusData,
  AdminStats,
  PassengerInput,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('railease_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Failed to process request`);
  }
  return data;
}

export const api = {
  // Auth
  async register(body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async login(body: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async getProfile(): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(body: { name?: string; phone?: string }): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async addSavedPassenger(body: {
    fullName: string;
    age: number;
    gender: string;
    berthPreference?: string;
    nationality?: string;
  }): Promise<{ success: boolean; passenger: any }> {
    const res = await fetch(`${API_BASE}/auth/passengers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async deleteSavedPassenger(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/passengers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Trains
  async getStations(query?: string): Promise<{ success: boolean; stations: Station[] }> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    const res = await fetch(`${API_BASE}/trains/stations?${params.toString()}`);
    return handleResponse(res);
  },

  async searchTrains(params: {
    from: string;
    to: string;
    date?: string;
    travelClass?: string;
    trainType?: string;
    isAc?: string;
    sortBy?: string;
    departureSlot?: string;
  }): Promise<{
    success: boolean;
    totalCount: number;
    fromStation: Station;
    toStation: Station;
    journeyDate: string;
    trains: TrainSearchResult[];
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/trains/search?${query.toString()}`);
    return handleResponse(res);
  },

  async getTrainDetails(id: string): Promise<{ success: boolean; train: any }> {
    const res = await fetch(`${API_BASE}/trains/${id}`);
    return handleResponse(res);
  },

  async getTrainSchedule(
    id: string
  ): Promise<{ success: boolean; train: any; schedule: TrainScheduleStop[] }> {
    const res = await fetch(`${API_BASE}/trains/${id}/schedule`);
    return handleResponse(res);
  },

  async getTrainSeats(
    id: string,
    travelClass?: string
  ): Promise<{ success: boolean; coaches: Coach[] }> {
    const params = new URLSearchParams();
    if (travelClass) params.append('travelClass', travelClass);
    const res = await fetch(`${API_BASE}/trains/${id}/seats?${params.toString()}`);
    return handleResponse(res);
  },

  // Bookings
  async createBooking(body: {
    trainId: string;
    sourceStationId: string;
    destinationStationId: string;
    journeyDate: string;
    travelClass: string;
    passengers: PassengerInput[];
    paymentMethod: string;
    selectedSeatIds?: string[];
  }): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async getUserBookings(status?: string): Promise<{ success: boolean; bookings: Booking[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getBookingById(id: string): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async checkPnr(pnr: string): Promise<{ success: boolean; pnrInfo: PnrStatusData }> {
    const res = await fetch(`${API_BASE}/bookings/pnr/${encodeURIComponent(pnr)}`);
    return handleResponse(res);
  },

  async cancelBooking(id: string, reason?: string): Promise<{ success: boolean; booking: Booking; cancellationDetails: any }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats(): Promise<{ success: boolean; stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminTrains(): Promise<{ success: boolean; trains: any[] }> {
    const res = await fetch(`${API_BASE}/admin/trains`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createAdminTrain(trainData: any): Promise<{ success: boolean; message: string; train: any }> {
    const res = await fetch(`${API_BASE}/admin/trains`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(trainData),
    });
    return handleResponse(res);
  },

  async updateAdminTrain(id: string, trainData: any): Promise<{ success: boolean; message: string; train: any }> {
    const res = await fetch(`${API_BASE}/admin/trains/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(trainData),
    });
    return handleResponse(res);
  },

  async deleteAdminTrain(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/trains/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUsers(): Promise<{ success: boolean; users: any[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminBookings(): Promise<{ success: boolean; bookings: any[] }> {
    const res = await fetch(`${API_BASE}/admin/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async toggleSeatStatus(seatId: string): Promise<{ success: boolean; seat: any }> {
    const res = await fetch(`${API_BASE}/admin/seats/${seatId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
