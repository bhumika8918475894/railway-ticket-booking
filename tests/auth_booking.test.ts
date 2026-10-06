import assert from 'assert';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, generatePNR, generateBookingRef, calculateClassFare } from '../server/src/utils/jwt.js';
import { validateRegisterInput, validateLoginInput, validateBookingInput } from '../server/src/validators/index.js';

async function runTests() {
  console.log('🧪 Starting Unit Tests for RailEase Authentication & Booking Logic...\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // 1. Password Hashing & Verification
  await (async () => {
    const rawPass = 'RailEaseSecure2026';
    const hash = await bcrypt.hash(rawPass, 10);
    const valid = await bcrypt.compare(rawPass, hash);
    const invalid = await bcrypt.compare('WrongPassword', hash);

    test('Password hash and verify succeeds with correct password', () => {
      assert.strictEqual(valid, true);
    });

    test('Password verification rejects mismatched password', () => {
      assert.strictEqual(invalid, false);
    });
  })();

  // 2. JWT Generation & Verification
  test('JWT token generation and decoding carries correct payload', () => {
    const payload = { userId: 'usr-1234', email: 'test@railease.in', role: 'USER' };
    const token = generateToken(payload);
    assert(typeof token === 'string' && token.length > 20);

    const decoded = verifyToken(token);
    assert(decoded !== null);
    assert.strictEqual(decoded?.userId, 'usr-1234');
    assert.strictEqual(decoded?.email, 'test@railease.in');
    assert.strictEqual(decoded?.role, 'USER');
  });

  test('JWT token verification fails for invalid token', () => {
    const invalidPayload = verifyToken('invalid.garbage.token');
    assert.strictEqual(invalidPayload, null);
  });

  // 3. Input Validation
  test('Registration validator accepts valid user inputs', () => {
    const res = validateRegisterInput({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      password: 'password123',
      confirmPassword: 'password123',
    });
    assert.strictEqual(res.valid, true);
  });

  test('Registration validator flags mismatched passwords', () => {
    const res = validateRegisterInput({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });
    assert.strictEqual(res.valid, false);
    assert(res.error?.includes('do not match'));
  });

  test('Login validator enforces email and password presence', () => {
    const res = validateLoginInput({ email: 'bad-email', password: '' });
    assert.strictEqual(res.valid, false);
  });

  // 4. Booking Logic & PNR
  test('PNR generation returns standard 10-digit numeric string', () => {
    const pnr = generatePNR();
    assert.strictEqual(pnr.length, 10);
    assert(/^\d{10}$/.test(pnr), 'PNR should be 10 numeric digits');
  });

  test('Booking reference code format is valid', () => {
    const ref = generateBookingRef();
    assert(ref.startsWith('RE-2026-'));
  });

  test('Class fare calculation applies correct tier multiplier', () => {
    const base = 1000;
    assert.strictEqual(calculateClassFare(base, '1A'), 3200);
    assert.strictEqual(calculateClassFare(base, '2A'), 2100);
    assert.strictEqual(calculateClassFare(base, '3A'), 1500);
    assert.strictEqual(calculateClassFare(base, 'SL'), 1000);
  });

  test('Booking validation ensures passenger details are complete', () => {
    const validBooking = validateBookingInput({
      trainId: 't-1',
      sourceStationId: 'st-src',
      destinationStationId: 'st-dest',
      journeyDate: '2026-10-20',
      travelClass: '3A',
      passengers: [
        { fullName: 'Ankit Gupta', age: 34, gender: 'Male', berthPreference: 'Lower' },
      ],
    });
    assert.strictEqual(validBooking.valid, true);

    const invalidBooking = validateBookingInput({
      trainId: 't-1',
      sourceStationId: 'st-src',
      destinationStationId: 'st-dest',
      journeyDate: '2026-10-20',
      travelClass: '3A',
      passengers: [], // Empty passengers
    });
    assert.strictEqual(invalidBooking.valid, false);
  });

  console.log(`\n========================================`);
  console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
