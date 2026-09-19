import { useEffect, useState } from 'react';
import { decryptItem } from '../lib/vaultService';
import type { DecryptedPayload, VaultItem } from '../types';
import { useVault } from '../contexts/VaultContext';

/**
 * Decrypts a single vault item in memory. Decrypted secrets are never
 * written to storage, never logged, and are dropped when the vault locks.
 */
export function useDecrypt(item?: VaultItem | null): DecryptedPayload | null {
  const { phase } = useVault();
  const [payload, setPayload] = useState<DecryptedPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPayload(null);
    if (!item || phase !== 'unlocked') return;
    void decryptItem(item)
      .then((decrypted) => {
        if (!cancelled) setPayload(decrypted);
      })
      .catch(() => {
        if (!cancelled) setPayload(null);
      });
    return () => {
      cancelled = true;
    };
  }, [item, phase]);

  return payload;
}