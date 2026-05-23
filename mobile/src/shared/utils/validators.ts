export interface ValidationResult {
  isValid: boolean;
  message: string;
}

const INDONESIAN_PHONE_REGEX = /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: 'Email harus diisi' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'Format email tidak valid' };
  }
  return { isValid: true, message: '' };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, message: 'Nomor telepon harus diisi' };
  }

  // Strip non-digit characters
  const cleaned = phone.replace(/[\s-]/g, '');

  if (!INDONESIAN_PHONE_REGEX.test(cleaned)) {
    return {
      isValid: false,
      message: 'Format nomor telepon Indonesia tidak valid (contoh: 081234567890)',
    };
  }

  if (cleaned.length < 10 || cleaned.length > 15) {
    return {
      isValid: false,
      message: 'Nomor telepon harus 10-15 digit',
    };
  }

  return { isValid: true, message: '' };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: 'Password harus diisi' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password minimal 8 karakter' };
  }

  if (!PASSWORD_REGEX.test(password)) {
    const missing: string[] = [];
    if (!/(?=.*[a-z])/.test(password)) missing.push('huruf kecil');
    if (!/(?=.*[A-Z])/.test(password)) missing.push('huruf besar');
    if (!/(?=.*\d)/.test(password)) missing.push('angka');

    return {
      isValid: false,
      message: `Password harus mengandung ${missing.join(', ')}`,
    };
  }

  return { isValid: true, message: '' };
}

export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, message: 'Konfirmasi password harus diisi' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Password tidak cocok' };
  }

  return { isValid: true, message: '' };
}

export function validateFullName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Nama lengkap harus diisi' };
  }

  if (name.trim().length < 3) {
    return { isValid: false, message: 'Nama lengkap minimal 3 karakter' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, message: 'Nama lengkap maksimal 100 karakter' };
  }

  return { isValid: true, message: '' };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} harus diisi` };
  }
  return { isValid: true, message: '' };
}

export function validateUrl(url: string): ValidationResult {
  if (!url) return { isValid: true, message: '' };

  try {
    new URL(url);
    return { isValid: true, message: '' };
  } catch {
    return { isValid: false, message: 'URL tidak valid' };
  }
}

export function validateNumberRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
  if (isNaN(value)) {
    return { isValid: false, message: `${fieldName} harus berupa angka` };
  }

  if (value < min || value > max) {
    return {
      isValid: false,
      message: `${fieldName} harus antara ${min} dan ${max}`,
    };
  }

  return { isValid: true, message: '' };
}

export function validateEmergencyContactName(name: string): ValidationResult {
  return validateRequired(name, 'Nama kontak darurat');
}

export function validateEmergencyContactPhone(phone: string): ValidationResult {
  const cleaned = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^(\+?62|0)[0-9]{8,13}$/;

  if (!cleaned) {
    return { isValid: false, message: 'Nomor kontak darurat harus diisi' };
  }

  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, message: 'Nomor kontak darurat tidak valid' };
  }

  return { isValid: true, message: '' };
}

export function validatePrice(price: number | string): ValidationResult {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice) || numericPrice <= 0) {
    return { isValid: false, message: 'Harga harus lebih dari 0' };
  }

  if (numericPrice > 1000000000) {
    return { isValid: false, message: 'Harga maksimal Rp 1.000.000.000' };
  }

  return { isValid: true, message: '' };
}
