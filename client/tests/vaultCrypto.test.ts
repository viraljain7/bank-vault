import { describe, expect, it } from 'vitest';
import {
  VaultUnlockError,
  decryptPayload,
  encryptPayload,
  generateVaultKeyRaw,
  rawToCryptoKey,
  unwrapVaultKey,
  wrapVaultKey,
} from '../src/crypto/vaultCrypto';

describe('client-side vault crypto (Web Crypto)', () => {
  it('wrap -> unwrap round-trips the same vault key', async () => {
    const { wrapper, raw } = await wrapVaultKey('correct horse battery');
    const unwrapped = await unwrapVaultKey(wrapper, 'correct horse battery');
    expect(unwrapped).toEqual(raw);
  });

  it('rejects an incorrect PIN', async () => {
    const { wrapper } = await wrapVaultKey('my-pin-123');
    await expect(unwrapVaultKey(wrapper, 'wrong-pin')).rejects.toBeInstanceOf(VaultUnlockError);
  });

  it('each wrap produces fresh salts/IVs', async () => {
    const a = await wrapVaultKey('pin');
    const b = await wrapVaultKey('pin');
    expect(a.wrapper.salt).not.toBe(b.wrapper.salt);
    expect(a.wrapper.iv).not.toBe(b.wrapper.iv);
  });

  it('encrypt -> decrypt round-trips exactly', async () => {
    const raw = generateVaultKeyRaw();
    const key = await rawToCryptoKey(raw);
    const secret = JSON.stringify({ accountNumber: '1234567890', password: 'pa55word' });
    const payload = await encryptPayload(key, secret);
    const plain = await decryptPayload(key, payload);
    expect(plain).toBe(secret);
  });

  it('ciphertext does not contain the plaintext', async () => {
    const key = await rawToCryptoKey(generateVaultKeyRaw());
    const plain = 'super-secret-credential-value';
    const payload = await encryptPayload(key, plain);
    expect(payload.ciphertext).not.toContain('super-secret');
    expect(payload.ciphertext).not.toContain(plain);
  });

  it('rejects tampering (GCM auth tag verification)', async () => {
    const key = await rawToCryptoKey(generateVaultKeyRaw());
    const payload = await encryptPayload(key, 'keep me intact');
    const tampered = { ...payload, ciphertext: `${payload.ciphertext.slice(0, -2)}AA` };
    await expect(decryptPayload(key, tampered)).rejects.toThrow();
  });

  it('rejects decryption with a different key (ownership check)', async () => {
    const payload = await encryptPayload(await rawToCryptoKey(generateVaultKeyRaw()), 'x');
    await expect(decryptPayload(await rawToCryptoKey(generateVaultKeyRaw()), payload)).rejects.toThrow();
  });
});