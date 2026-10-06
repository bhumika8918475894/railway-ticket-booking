import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'railease_super_secret_jwt_key_2026_indian_railways';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Generate realistic 10-digit Indian Railway PNR (e.g. 2456891024)
export function generatePNR(): string {
  const first = Math.floor(1 + Math.random() * 8); // 1-8
  const rest = Math.floor(100000000 + Math.random() * 900000000);
  return `${first}${rest}`.slice(0, 10);
}

// Generate Booking reference ID (e.g. RE-2026-849102)
export function generateBookingRef(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return `RE-2026-${code}`;
}

// Generate Transaction ID (e.g. TXN-RAIL-582910)
export function generateTransactionId(): string {
  const code = Math.floor(1000000 + Math.random() * 9000000);
  return `TXN-RAIL-${code}`;
}

// Fare multiplier per class relative to base fare
export const CLASS_FARE_MULTIPLIERS: Record<string, number> = {
  '1A': 3.2,
  '2A': 2.1,
  '3A': 1.5,
  'CC': 1.2,
  'EC': 2.4,
  'SL': 1.0,
  '2S': 0.6,
};

export function calculateClassFare(baseFare: number, travelClass: string): number {
  const multiplier = CLASS_FARE_MULTIPLIERS[travelClass] || 1.0;
  return Math.round(baseFare * multiplier);
}
