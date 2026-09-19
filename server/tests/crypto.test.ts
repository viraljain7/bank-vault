import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ENCRYPTION_VERSION,
  decryptWithServerKey,
  encryptWithServerKey,
  secretsEqual,
} from '../src/services/crypto.service.js';

describe('server encryption service', () => {
  it('decrypt(encrypt(value)) === value', () => {
    const plain = 'the-most-sensitive-secret-12345';
    const payload = encryptWithServerKey(plain);
    expect(payload.encryptionVersion).toBe(DEFAULT_ENCRYPTION_VERSION);
    const recovered = decryptWithServerKey(payload).toString('utf8');
    expect(recovered).toBe(plain);
  });

  it('produces unique ciphertext + iv each time (fresh IV per encryption)', () => {
    const first = encryptWithServerKey('same input');
    const second = encryptWithServerKey('same input');
    expect(first.ciphertext).not.toBe(second.ciphertext);
    expect(first.iv).not.toBe(second.iv);
  });

  it('never stores plaintext in the persisted payload', () => {
    const plain = 'SuperSecretPassw0rd';
    const payload = encryptWithServerKey(plain);
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain(plain);
    expect(serialized).not.toContain('secret');
  });

  it('rejects tampered ciphertext via GCM authentication tag', () => {
    const payload = encryptWithServerKey('integrity-check');
    const tampered = { ...payload, ciphertext: `${payload.ciphertext.slice(0, -2)}AA` };
    expect(() => decryptWithServerKey(tampered)).toThrow();
  });

  it('rejects unsupported encryption versions', () => {
    const payload = encryptWithServerKey('x');
    expect(() => decryptWithServerKey({ ...payload, encryptionVersion: 2 })).toThrow();
  });

  it('secretsEqual is constant-time and accurate', () => {
    expect(secretsEqual('abc123', 'abc123')).toBe(true);
    expect(secretsEqual('abc123', 'abc124')).toBe(false);
    expect(secretsEqual('short', 'differenthashvalue')).toBe(false);
  });
});