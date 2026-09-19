import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Server-side authenticated encryption (AES-256-GCM).
 *
 * Role in VaultBank
 * -----------------
 * Vault payload encryption happens on the CLIENT with Web Crypto and a
 * client-side vault key — the server never sees plaintext credentials.
 * This service provides a separate, layered defense-in-depth protection
 * for server-stored unlock-key wrappers and any supporting material, using
 * the ENCRYPTION_KEY secret injected at deploy time.
 *
 * Key rotation
 * ------------
 * `encryptionVersion` is explicit so future versions can be introduced.
 * The repository is designed so a key-ring (map version -> key) can back
 * `currentKey()` later: retain the old key for decryption while encrypting
 * new data with the latest key, then re-encrypt at rest in a background job.
 */

export const DEFAULT_ENCRYPTION_VERSION = 1;

export interface EncryptedPaylod {
  ciphertext: string;
  iv: string;
  tag: string;
  encryptionVersion: number;
}

function keyBytesFromSecret(secret: string): Buffer {
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }
  // Allow any sufficiently long secret by deriving a fixed 32-byte key.
  return createHash('sha256').update(secret).digest();
}

function currentKey(): Buffer {
  const key = keyBytesFromSecret(env.ENCRYPTION_KEY);
  if (key.length !== 32) {
    throw new ApiError('Invalid encryption key length', { status: 500, code: 'ENCRYPTION_CONFIG' });
  }
  return key;
}

export function encryptWithServerKey(
  plaintextRaw: string | Buffer,
  version: number = DEFAULT_ENCRYPTION_VERSION,
): EncryptedPaylod {
  const key = currentKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintextRaw), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    encryptionVersion: version,
  };
}

export function decryptWithServerKey(payload: EncryptedPaylod): Buffer {
  if (payload.encryptionVersion !== DEFAULT_ENCRYPTION_VERSION) {
    // Future: look up the old key from the key-ring by version.
    throw new ApiError('Unsupported encryption version', { status: 500, code: 'ENCRYPTION_VERSION' });
  }
  try {
    const key = currentKey();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    const plain = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, 'base64')), decipher.final()]);
    return plain;
  } catch {
    throw new ApiError('Failed to decrypt protected data', { status: 500, code: 'DECRYPT_FAILED' });
  }
}

/** Constant-time secret comparison helper. */
export function secretsEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}