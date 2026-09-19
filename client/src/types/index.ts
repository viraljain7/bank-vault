/** Shared frontend types mirroring the VaultBank API contract. */

export type VaultItemType = 'bank' | 'card';

export interface VaultMetadata {
  bankName?: string;
  cardBrand?: string;
  last4?: string;
}

/** API shape for a vault credential (payloads are always client-side encrypted). */
export interface VaultItem {
  _id: string;
  type: VaultItemType;
  title: string;
  encryptedPayload: string;
  iv: string;
  tag: string;
  encryptionVersion: number;
  metadata: VaultMetadata;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Decrypted payload for a bank credential — only ever exists in memory. */
export interface BankPayload {
  bankName: string;
  nickname: string;
  accountNumber: string;
  customerId: string;
  netbankingUsername: string;
  netbankingPassword: string;
  profilePassword: string;
  notes: string;
}

/** Decrypted payload for a card. CVV is stored encrypted end-to-end (like the card number); card PIN/OTP/3DS are never stored. */
export interface CardPayload {
  cardNickname: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardBrand: string;
  cvv: string;
  notes: string;
}

export type DecryptedPayload = BankPayload | CardPayload;

export type PayloadFor<T extends VaultItemType> = T extends 'bank' ? BankPayload : CardPayload;

/** Input shape for creating/updating a vault credential server-side. */
export interface CreateVaultItemInput {
  type: VaultItemType;
  title: string;
  encryptedPayload: string;
  iv: string;
  tag: string;
  encryptionVersion: number;
  metadata: VaultMetadata;
  favorite: boolean;
}

export interface VaultOverview {
  banks: number;
  cards: number;
  favorites: number;
  status: 'protected';
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'REVEAL'
  | 'COPY'
  | 'LOGIN'
  | 'LOCK'
  | 'UNLOCK'
  | 'SETUP'
  | 'SEARCH'
  | 'READ';

export type AuditResourceType = 'bank' | 'card' | 'vault' | 'key';

export interface AuditEvent {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  createdAt: string;
}

export interface ActivityPage {
  data: AuditEvent[];
  nextCursor: string | null;
}

/** Wrapped vault key (produced client-side, stored server-side). */
export interface WrappedVaultKey {
  salt: string;
  iv: string;
  wrappedKey: string;
  iterations: number;
  keyVersion: number;
}

export interface SecurityStatus {
  userId: string;
  hasUnlockKey: boolean;
  auditCount: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  details?: unknown;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  details?: unknown;
}

export const AUTO_LOCK_OPTIONS = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: 'never', label: 'Never' },
] as const;

export type AutoLockValue = (typeof AUTO_LOCK_OPTIONS)[number]['value'];

export const AUTO_LOCK_DEFAULT: AutoLockValue = '15m';

export const AUTO_LOCK_MS: Record<Exclude<AutoLockValue, 'never'>, number> = {
  '1m': 60_000,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '30m': 30 * 60_000,
};

/** Auto-hide high-sensitivity revealed values after this long (ms). */
export const SENSITIVE_REVEAL_TIMEOUT_MS = 30_000;
/** Clipboard is cleared after this long (ms) when possible. */
export const CLIPBOARD_CLEAR_TIMEOUT_MS = 30_000;