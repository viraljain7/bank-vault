import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * Stores the client-side "wrapped" vault key.
 *
 * The vault key itself is generated in the browser (32 random bytes). It is
 * wrapped (encrypted) with a key derived from the user's Unlock PIN via
 * PBKDF2-SHA256 (a strong KDF) on the client. Only the wrapped blob reaches
 * the server, so the server never sees the vault key or the PIN.
 *
 * The wrapper is additionally encrypted at rest with the server-side
 * ENCRYPTION_KEY (AES-256-GCM) as layered defense-in-depth:
 *   encryptedCiphertext = AESGCM_server( JSON{ salt, iv, wrappedKey, iterations } )
 */
const vaultKeySchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },

    /** Server-side AES-256-GCM ciphertext of the wrapped-key blob. Base64. */
    encryptedCiphertext: { type: String, required: true },

    /** Server-side GCM IV. Base64. */
    iv: { type: String, required: true },

    /** Server-side GCM authentication tag. Base64. */
    tag: { type: String, required: true },

    encryptionVersion: { type: Number, required: true, default: 1 },

    /** Client-facing hint bumped on PIN rotation. */
    keyVersion: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type VaultKeyDoc = InferSchemaType<typeof vaultKeySchema>;

export const VaultKeyModel = model<VaultKeyDoc>('VaultKey', vaultKeySchema);