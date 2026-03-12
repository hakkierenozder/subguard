// src/utils/validation.ts
// Backend FluentValidation kurallarıyla birebir eşleştirilmiş frontend kuralları

export const emailRules = {
  required: 'E-posta zorunludur.',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Geçerli bir e-posta adresi giriniz.',
  },
};

export const passwordRules = {
  required: 'Şifre zorunludur.',
  minLength: { value: 8, message: 'Şifre en az 8 karakter olmalıdır.' },
  validate: {
    hasUpperCase:    (v: string) => /[A-Z]/.test(v) || 'Şifre en az bir büyük harf içermelidir.',
    hasLowerCase:    (v: string) => /[a-z]/.test(v) || 'Şifre en az bir küçük harf içermelidir.',
    hasNumber:       (v: string) => /[0-9]/.test(v) || 'Şifre en az bir rakam içermelidir.',
    hasSpecialChar:  (v: string) => /[^a-zA-Z0-9]/.test(v) || 'Şifre en az bir özel karakter içermelidir (örn: !@#$%).',
  },
};

// Şifre gücü indikatörü için yardımcı
export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very_strong';

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return 'weak';
  if (score === 2) return 'medium';
  if (score === 3) return 'strong';
  return 'very_strong';
}

export const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak:        'Zayıf',
  medium:      'Orta',
  strong:      'İyi',
  very_strong: 'Güçlü',
};

export const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak:        '#EF4444',
  medium:      '#F97316',
  strong:      '#FBBF24',
  very_strong: '#10B981',
};
