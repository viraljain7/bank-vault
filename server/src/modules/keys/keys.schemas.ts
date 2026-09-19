import { z } from 'zod';

const base64 = (min: number, max: number) =>
  z
    .string()
    .regex(/^[A-Za-z0-9+/=]+$/, 'Must be base64')
    .refine((v) => {
      const bytes = Buffer.from(v, 'base64').length;
      return bytes >= min && bytes <= max;
    }, `Must decode to between ${min} and ${max} bytes`);

/**
 * Wrapped vault key as produced by the browser:
 *  - salt       : PBKDF2-SHA256 salt (16 bytes)
 *  - iv         : AES-GCM IV used to wrap the vault key (12 bytes)
 *  - wrappedKey : the vault key encrypted under the PIN-derived KEK
 *  - iterations : PBKDF2 iteration count
 */
export const vaultKeyUpsertSchema = z
  .object({
    salt: base64(16, 16),
    iv: base64(12, 12),
    wrappedKey: base64(32, 256),
    iterations: z.number().int().min(100_000, 'Iterations must be at least 100k').max(2_000_000),
    keyVersion: z.number().int().default(1),
  })
  .strict();

export type VaultKeyUpsertInput = z.infer<typeof vaultKeyUpsertSchema>;