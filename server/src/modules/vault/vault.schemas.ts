import { z } from 'zod';

/**
 * Data left unencrypted by design (safe to search / dedupe):
 * title, metadata (bankName/brand/last4), favorite, type.
 * Everything sensitive travels only as the AES-256-GCM ciphertext delivered
 * in `encryptedPayload` along with its `iv` and `tag`.
 */

const base64Ciphertext = z
  .string()
  .min(16, 'Encrypted payload is too short')
  .max(65_536, 'Encrypted payload is too large')
  .regex(/^[A-Za-z0-9+/=]+$/, 'Encrypted payload must be base64');

const base64Iv = z
  .string()
  .regex(/^[A-Za-z0-9+/=]+$/, 'IV must be base64')
  .refine((v) => Buffer.from(v, 'base64').length === 12, 'IV must decode to 12 bytes');

const base64Tag = z
  .string()
  .regex(/^[A-Za-z0-9+/=]+$/, 'Tag must be base64')
  .refine((v) => Buffer.from(v, 'base64').length === 16, 'Tag must decode to 16 bytes');

const last4 = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'last4 must be exactly 4 digits');

const metadataSchema = z
  .object({
    bankName: z.string().trim().max(120).optional(),
    cardBrand: z.string().trim().max(60).optional(),
    last4: last4.optional(),
  })
  .strict()
  .default({});

export const vaultItemCreateSchema = z
  .object({
    type: z.enum(['bank', 'card']),
    title: z.string().trim().min(1, 'A name is required').max(120, 'Name is too long'),
    encryptedPayload: base64Ciphertext,
    iv: base64Iv,
    tag: base64Tag,
    encryptionVersion: z.literal(1).default(1),
    metadata: metadataSchema,
    favorite: z.boolean().default(false),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === 'bank' && !data.metadata.bankName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['metadata', 'bankName'], message: 'Bank name is required for bank credentials' });
    }
    if (data.type === 'card') {
      if (!data.metadata.cardBrand) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['metadata', 'cardBrand'], message: 'Card brand is required for cards' });
      }
      if (!data.metadata.last4) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['metadata', 'last4'], message: 'Last 4 digits are required for cards' });
      }
    }
  });

export type VaultItemCreateInput = z.infer<typeof vaultItemCreateSchema>;

export const vaultItemUpdateSchema = z
  .object({
    type: z.enum(['bank', 'card']).optional(),
    title: z.string().trim().min(1, 'A name is required').max(120, 'Name is too long').optional(),
    encryptedPayload: base64Ciphertext.optional(),
    iv: base64Iv.optional(),
    tag: base64Tag.optional(),
    encryptionVersion: z.literal(1).optional(),
    metadata: metadataSchema.optional(),
    favorite: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'Nothing to update');

export type VaultItemUpdateInput = z.infer<typeof vaultItemUpdateSchema>;

export const vaultListQuerySchema = z
  .object({
    type: z.enum(['bank', 'card']).optional(),
    favorite: z.enum(['true', 'false']).optional(),
    q: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export type VaultListQuery = z.infer<typeof vaultListQuerySchema>;