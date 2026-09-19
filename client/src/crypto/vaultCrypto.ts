/**
 * Client-side crypto — the vault's security core.
 *
 * Design (documented for reviewers):
 *
 * 1. A random 256-bit AES-GCM vault key is generated in the browser the very
 *    first time the user sets up their vault.
 * 2. The user chooses an "Unlock PIN" (min length enforced). The vault key is
 *    wrapped (encrypted) with a Key Encryption Key (KEK) derived from the PIN
 *    via PBKDF2-SHA256 with 210_000 iterations and a random 128-bit salt.
 *    The wrapped blob { salt, iv, wrappedKey, iterations } is sent to the
 *    server — the raw vault key and the PIN never leave the client.
 * 3. Every credential payload is encrypted with the vault key using
 *    AES-256-GCM before it is transmitted. The server only ever sees the
 *    ciphertext, its IV and its authentication tag.
 * 4. Unlock = unwrap the vault key with the PIN in memory. Auto-lock = drop
 *    the key from memory. Locking the vault never requires a network call.
 * 5. Recovery: if the PIN is lost, the vault key can never be recovered —
 *    a resettable vault wipes the wrapped key and all ciphertext. This is the
 *    unavoidable trade-off of zero-knowledge client-side encryption (the same
 *    model 1Password uses for its master password).
 *
 * All values returned by this module are only ever held in memory.
 */

export const PBKDF2_ITERATIONS = 210_000;
export const VAULT_KEY_BYTES = 32;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
export const ENCRYPTION_VERSION = 1;
export const TAG_BYTES = 16;

export interface VaultEncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  encryptionVersion: number;
}

export interface WrappedVaultKeyBlob {
  salt: string;
  iv: string;
  wrappedKey: string;
  iterations: number;
}

export class VaultUnlockError extends Error {
  constructor() {
    super('Invalid unlock PIN');
    this.name = 'VaultUnlockError';
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function generateVaultKeyRaw(): Uint8Array {
  return randomBytes(VAULT_KEY_BYTES);
}

async function deriveKek(pin: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Raw vault key -> AES-GCM CryptoKey that never leaves memory. */
export async function rawToCryptoKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    raw as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Wraps a vault key under a PIN-derived KEK. */
export async function wrapVaultKey(
  pin: string,
  raw: Uint8Array = generateVaultKeyRaw(),
  iterations: number = PBKDF2_ITERATIONS,
): Promise<{ wrapper: WrappedVaultKeyBlob; raw: Uint8Array }> {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const kek = await deriveKek(pin, salt, iterations);
  const wrapped = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    kek,
    raw as BufferSource,
  );

  return {
    wrapper: {
      salt: toBase64(salt),
      iv: toBase64(iv),
      wrappedKey: toBase64(new Uint8Array(wrapped)),
      iterations,
    },
    raw,
  };
}

/** Unwraps the vault key. Throws VaultUnlockError on wrong PIN or tampered blob. */
export async function unwrapVaultKey(wrapper: WrappedVaultKeyBlob, pin: string): Promise<Uint8Array> {
  const { salt, iv, wrappedKey, iterations } = wrapper;
  if (iterations < 100_000) {
    throw new VaultUnlockError();
  }
  try {
    const kek = await deriveKek(pin, fromBase64(salt), iterations);
    const rawBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) as BufferSource },
      kek,
      fromBase64(wrappedKey) as BufferSource,
    );
    return new Uint8Array(rawBuffer);
  } catch {
    throw new VaultUnlockError();
  }
}

/** Encrypts a secret string (the credential JSON) with the vault key. */
export async function encryptPayload(
  key: CryptoKey,
  plain: string,
): Promise<VaultEncryptedPayload> {
  const iv = randomBytes(IV_BYTES);
  const encoded = new TextEncoder().encode(plain);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoded as BufferSource,
  );
  // WebCrypto appends the 16-byte GCM auth tag to the ciphertext.
  const combined = new Uint8Array(encrypted);
  const tag = combined.slice(combined.length - TAG_BYTES);
  const ciphertext = combined.slice(0, combined.length - TAG_BYTES);

  return {
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    tag: toBase64(tag),
    encryptionVersion: ENCRYPTION_VERSION,
  };
}

/** Decrypts a payload. Throws on wrong key or tampered data (auth tag check). */
export async function decryptPayload(
  key: CryptoKey,
  payload: VaultEncryptedPayload,
): Promise<string> {
  if (payload.encryptionVersion !== ENCRYPTION_VERSION) {
    throw new Error('Unsupported encryption version');
  }
  const combined = new Uint8Array([
    ...fromBase64(payload.ciphertext),
    ...fromBase64(payload.tag),
  ]);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(payload.iv) as BufferSource },
    key,
    combined as BufferSource,
  );
  return new TextDecoder().decode(plainBuffer);
}

export const vaultCrypto = {
  PBKDF2_ITERATIONS,
  ENCRYPTION_VERSION,
  generateVaultKeyRaw,
  rawToCryptoKey,
  wrapVaultKey,
  unwrapVaultKey,
  encryptPayload,
  decryptPayload,
};