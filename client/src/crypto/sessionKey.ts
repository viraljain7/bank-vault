/**
 * Module-level vault key holder.
 *
 * The active decrypted vault key lives here in memory ONLY while the vault is
 * unlocked. Nothing is persisted to localStorage/IndexedDB. `lockVault` must be
 * called to null it out (auto-lock, manual lock, sign out).
 */
import type { AuditAction, AuditResourceType } from '../types';
import { activityApi } from '../lib/api';

let activeKey: CryptoKey | null = null;
let activeKeyRaw: Uint8Array | null = null;
let ownerUserId: string | null = null;

export function setSessionKey(key: CryptoKey | null, raw: Uint8Array | null, userId: string | null): void {
  activeKey = key;
  activeKeyRaw = raw;
  ownerUserId = userId;
}

export function getActiveKey(): CryptoKey {
  if (!activeKey) throw new VaultLockedError();
  return activeKey;
}

export function getActiveKeyRaw(): Uint8Array {
  if (!activeKeyRaw) throw new VaultLockedError();
  return activeKeyRaw;
}

export function getOwnerUserId(): string | null {
  return ownerUserId;
}

export function getVaultUnlocked(): boolean {
  return activeKey !== null;
}

class VaultLockedError extends Error {
  constructor() {
    super('Vault is locked');
    this.name = 'VaultLockedError';
  }
}

/** Activity reporter used by secret interactions (fire-and-forget). */
export const reportActivity = (action: AuditAction, resourceType: AuditResourceType, resourceId?: string): void => {
  void activityApi.report(action, resourceType, resourceId);
};