export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  // Accepts standard Indian mobile format, with or without +91 or spaces
  const cleaned = phone.replace(/[\s+-]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
}

export function validateRegisterInput(data: any): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    return { valid: false, error: 'Full name is required (minimum 2 characters)' };
  }
  if (!data.email || !validateEmail(data.email)) {
    return { valid: false, error: 'Valid email address is required' };
  }
  if (!data.phone || !validatePhone(data.phone)) {
    return { valid: false, error: 'Valid 10-digit mobile number is required' };
  }
  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
}

export function validateLoginInput(data: any): { valid: boolean; error?: string } {
  if (!data.email || !validateEmail(data.email)) {
    return { valid: false, error: 'Valid email address is required' };
  }
  if (!data.password || typeof data.password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  return { valid: true };
}

export function validateBookingInput(data: any): { valid: boolean; error?: string } {
  if (!data.trainId) {
    return { valid: false, error: 'Train ID is required' };
  }
  if (!data.sourceStationId || !data.destinationStationId) {
    return { valid: false, error: 'Source and destination stations are required' };
  }
  if (data.sourceStationId === data.destinationStationId) {
    return { valid: false, error: 'Source and destination stations cannot be identical' };
  }
  if (!data.journeyDate) {
    return { valid: false, error: 'Journey date is required' };
  }
  if (!data.travelClass) {
    return { valid: false, error: 'Travel class is required' };
  }
  if (!Array.isArray(data.passengers) || data.passengers.length === 0) {
    return { valid: false, error: 'At least one passenger must be added' };
  }
  if (data.passengers.length > 6) {
    return { valid: false, error: 'Maximum 6 passengers per booking ticket' };
  }
  for (let i = 0; i < data.passengers.length; i++) {
    const p = data.passengers[i];
    if (!p.fullName || p.fullName.trim().length < 2) {
      return { valid: false, error: `Passenger #${i + 1} valid name is required` };
    }
    const age = parseInt(p.age, 10);
    if (isNaN(age) || age < 1 || age > 120) {
      return { valid: false, error: `Passenger #${i + 1} valid age (1-120) is required` };
    }
    if (!p.gender || !['Male', 'Female', 'Transgender', 'Other'].includes(p.gender)) {
      return { valid: false, error: `Passenger #${i + 1} valid gender is required` };
    }
  }
  return { valid: true };
}
