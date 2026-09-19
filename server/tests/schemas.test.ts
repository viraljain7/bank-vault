import { describe, expect, it } from 'vitest';
import { vaultItemCreateSchema, vaultItemUpdateSchema } from '../src/modules/vault/vault.schemas.js';
import { vaultKeyUpsertSchema } from '../src/modules/keys/keys.schemas.js';

const VALID_BANK = {
  type: 'bank',
  title: 'Personal HDFC',
  encryptedPayload: 'a'.repeat(64),
  iv: Buffer.alloc(12, 8).toString('base64'),
  tag: Buffer.alloc(16, 7).toString('base64'),
  encryptionVersion: 1,
  metadata: { bankName: 'HDFC Bank', last4: '4821' },
  favorite: false,
};

const VALID_CARD = {
  type: 'card',
  title: 'Amex Platinum',
  encryptedPayload: 'b'.repeat(64),
  iv: Buffer.alloc(12, 1).toString('base64'),
  tag: Buffer.alloc(16, 2).toString('base64'),
  encryptionVersion: 1,
  metadata: { cardBrand: 'American Express', last4: '1005' },
};

describe('vault validation', () => {
  it('accepts a valid bank item', () => {
    expect(vaultItemCreateSchema.safeParse(VALID_BANK).success).toBe(true);
  });

  it('accepts a valid card item', () => {
    expect(vaultItemCreateSchema.safeParse(VALID_CARD).success).toBe(true);
  });

  it('rejects invalid card data (bad last4)', () => {
    const bad = { ...VALID_CARD, metadata: { cardBrand: 'Visa', last4: 'ab12' } };
    const result = vaultItemCreateSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects cards missing brand or last4', () => {
    expect(vaultItemCreateSchema.safeParse({ ...VALID_CARD, metadata: { cardBrand: 'Visa' } }).success).toBe(false);
    expect(vaultItemCreateSchema.safeParse({ ...VALID_CARD, metadata: { last4: '1005' } }).success).toBe(false);
  });

  it('rejects invalid bank data (missing bank name)', () => {
    const result = vaultItemCreateSchema.safeParse({ ...VALID_BANK, metadata: { last4: '4821' } });
    expect(result.success).toBe(false);
  });

  it('rejects unexpected (unknown) fields', () => {
    const result = vaultItemCreateSchema.safeParse({
      ...VALID_BANK,
      password: 'MyPassword123', // must never be accepted as a plaintext field
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malicious 90-byte ciphertext', () => {
    const result = vaultItemCreateSchema.safeParse({
      ...VALID_BANK,
      encryptedPayload: 'too short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-base64 IV/tag', () => {
    expect(
      vaultItemCreateSchema.safeParse({ ...VALID_BANK, iv: '!!!not-base64!!' }).success,
    ).toBe(false);
  });

  it('rejects secret fields sent in plaintext (cvv/pin/otp)', () => {
    for (const key of ['cvv', 'pin', 'otp', 'cardNumber', 'password']) {
      const result = vaultItemCreateSchema.safeParse({ ...VALID_CARD, [key]: 'should-not-pass' });
      expect(result.success).toBe(false);
    }
  });

  it('requires at least one field on update and rejects unknown fields', () => {
    expect(vaultItemUpdateSchema.safeParse({}).success).toBe(false);
    expect(vaultItemUpdateSchema.safeParse({ favorite: true }).success).toBe(true);
    expect(vaultItemUpdateSchema.safeParse({ favorite: true, hacker: 'x' }).success).toBe(false);
  });
});

describe('vault key wrapper validation', () => {
  const valid = {
    salt: Buffer.alloc(16, 3).toString('base64'),
    iv: Buffer.alloc(12, 4).toString('base64'),
    wrappedKey: Buffer.alloc(48, 5).toString('base64'),
    iterations: 210_000,
  };

  it('accepts a valid wrapper', () => {
    expect(vaultKeyUpsertSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects weak iteration counts', () => {
    expect(vaultKeyUpsertSchema.safeParse({ ...valid, iterations: 100 }).success).toBe(false);
  });

  it('rejects malformed base64 / wrong byte lengths', () => {
    expect(vaultKeyUpsertSchema.safeParse({ ...valid, salt: 'AB==' }).success).toBe(false);
    expect(vaultKeyUpsertSchema.safeParse({ ...valid, iv: 'a'.repeat(64) }).success).toBe(false);
  });
});