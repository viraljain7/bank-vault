import { z } from 'zod';

/**
 * Client-side zod schemas. The backend re-validates every request and never
 * trusts what the frontend sends; these protect the richer inner fields
 * (card number format, expiry sanity, etc.) that live inside the ENCRYPTED
 * payload and are therefore invisible to the server.
 */

export const bankPayloadSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank name is required').max(120),
  nickname: z.string().trim().max(120, 'Nickname is too long'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^[\d ]{9,24}$/, 'Enter a valid account number (9–18 digits)')
    .transform((v) => v.replace(/\s+/g, '')),
  customerId: z.string().trim().max(40, 'Customer ID is too long'),
  netbankingUsername: z.string().trim().max(60, 'Username is too long'),
  netbankingPassword: z.string().max(128, 'Password is too long'),
  profilePassword: z.string().max(128, 'Password is too long'),
  notes: z.string().max(500, 'Notes are limited to 500 characters'),
});

export type BankPayloadInput = z.infer<typeof bankPayloadSchema>;

export const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express', 'RuPay', 'Discover', 'Other'] as const;

export function detectCardBrand(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (/^4/.test(digits) && digits.length >= 13) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^(6(0|5|2|7)|8[12])/.test(digits)) return 'RuPay';
  if (/^6(011|5|4|2[01]|2[2-9])/.test(digits)) return 'Discover';
  return 'Other';
}

const currentYear = () => Number(new Date().getFullYear());

export const cardPayloadSchema = z.object({
  cardNickname: z.string().trim().min(1, 'Card nickname is required').max(60),
  cardholderName: z
    .string()
    .trim()
    .min(2, 'Cardholder name is required')
    .max(60)
    .regex(/^[a-zA-Z .'’-]+$/, 'Name should contain letters, spaces, dots or hyphens'),
  cardNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^\d{13,19}$/, 'Enter a valid card number (13–19 digits)')),
  expiryMonth: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Invalid year')
    .refine((v) => {
      const year = Number(v);
      return year >= currentYear() && year <= currentYear() + 20;
    }, 'Expiry year is out of range'),
  cardBrand: z.enum(CARD_BRANDS),
  cvv: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{3,4}$/.test(v), 'CVV must be 3–4 digits'),
  notes: z.string().max(300, 'Notes are limited to 300 characters'),
});

export type CardPayloadInput = z.infer<typeof cardPayloadSchema>;

/** Sensitive field auto-hide duration is fixed; this schema enforces minimums. */
export const pinSchema = z
  .object({
    pin: z.string().min(6, 'Use at least 6 characters').max(64, 'PIN is too long'),
    confirm: z.string(),
  })
  .refine((data) => data.pin === data.confirm, {
    path: ['confirm'],
    message: 'PINs do not match',
  });

export type PinInput = z.infer<typeof pinSchema>;

export const unlockSchema = z.object({
  pin: z.string().min(1, 'Enter your unlock PIN'),
});

export type UnlockInput = z.infer<typeof unlockSchema>;

export const changePinSchema = z
  .object({
    currentPin: z.string().min(1, 'Current PIN is required'),
    pin: z.string().min(6, 'Use at least 6 characters').max(64, 'PIN is too long'),
    confirm: z.string(),
  })
  .refine((data) => data.pin === data.confirm, {
    path: ['confirm'],
    message: 'PINs do not match',
  });

export type ChangePinInput = z.infer<typeof changePinSchema>;