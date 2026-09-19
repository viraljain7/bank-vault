import { VaultKeyModel, type VaultKeyDoc } from '../../models/VaultKey.js';
import { encryptWithServerKey, decryptWithServerKey } from '../../services/crypto.service.js';
import { NotFoundError } from '../../utils/ApiError.js';

export interface WrappedVaultKey {
  salt: string;
  iv: string;
  wrappedKey: string;
  iterations: number;
  keyVersion: number;
}

function toClientShape(doc: Pick<VaultKeyDoc, 'encryptedCiphertext' | 'iv' | 'tag' | 'encryptionVersion' | 'keyVersion'>): WrappedVaultKey {
  const stored = decryptWithServerKey({
    ciphertext: doc.encryptedCiphertext,
    iv: doc.iv,
    tag: doc.tag,
    encryptionVersion: doc.encryptionVersion,
  });
  const parsed = JSON.parse(stored.toString('utf8')) as Omit<WrappedVaultKey, 'keyVersion'>;
  return {
    salt: parsed.salt,
    iv: parsed.iv,
    wrappedKey: parsed.wrappedKey,
    iterations: parsed.iterations,
    keyVersion: doc.keyVersion ?? 1,
  };
}

/**
 * The wrapped key blob is encrypted at rest with the server-side
 * ENCRYPTION_KEY, so a hostile database dump yields nothing usable.
 */
export async function upsertVaultKey(userId: string, wrapped: Omit<WrappedVaultKey, 'keyVersion'>): Promise<WrappedVaultKey> {
  const protectedBlob = encryptWithServerKey(JSON.stringify(wrapped));

  const updated = await VaultKeyModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        encryptedCiphertext: protectedBlob.ciphertext,
        iv: protectedBlob.iv,
        tag: protectedBlob.tag,
        encryptionVersion: protectedBlob.encryptionVersion,
      },
      $inc: { keyVersion: 1 },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return toClientShape(updated as unknown as VaultKeyDoc);
}

export async function getVaultKey(userId: string): Promise<WrappedVaultKey | null> {
  const doc = await VaultKeyModel.findOne({ userId }).lean();
  if (!doc) return null;
  try {
    return toClientShape(doc as unknown as VaultKeyDoc);
  } catch {
    throw new NotFoundError('Unlock key is not readable');
  }
}

export async function deleteVaultKey(userId: string): Promise<boolean> {
  const res = await VaultKeyModel.deleteOne({ userId });
  return (res.deletedCount ?? 0) > 0;
}