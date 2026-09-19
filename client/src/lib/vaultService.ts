import type { BankPayload, CardPayload, CreateVaultItemInput, VaultItem } from '../types';
import { decryptPayload, encryptPayload } from '../crypto/vaultCrypto';
import { getActiveKey, getOwnerUserId } from '../crypto/sessionKey';

/**
 * Maps plaintext credential objects <-> encrypted vault items.
 * Only ever operates in memory with the active vault key; the encrypted
 * result is the only thing that touches the network / storage layer.
 */

function assertBankPayload(value: unknown): BankPayload {
  const v = value as Partial<BankPayload>;
  return {
    bankName: String(v.bankName ?? ''),
    nickname: String(v.nickname ?? ''),
    accountNumber: String(v.accountNumber ?? ''),
    customerId: String(v.customerId ?? ''),
    netbankingUsername: String(v.netbankingUsername ?? ''),
    netbankingPassword: String(v.netbankingPassword ?? ''),
    profilePassword: String(v.profilePassword ?? ''),
    notes: String(v.notes ?? ''),
  };
}

function assertCardPayload(value: unknown): CardPayload {
  const v = value as Partial<CardPayload>;
  return {
    cardNickname: String(v.cardNickname ?? ''),
    cardholderName: String(v.cardholderName ?? ''),
    cardNumber: String(v.cardNumber ?? ''),
    expiryMonth: String(v.expiryMonth ?? ''),
    expiryYear: String(v.expiryYear ?? ''),
    cardBrand: String(v.cardBrand ?? ''),
    notes: String(v.notes ?? ''),
  };
}

const utf8 = (value: unknown): string => JSON.stringify(value);

export async function encryptBankItem(payload: BankPayload, favorite = false): Promise<CreateVaultItemInput> {
  const key = getActiveKey();
  const type = 'bank';
  const title = payload.nickname || payload.bankName || 'Bank account';
  const encrypted = await encryptPayload(key, utf8(payload));
  const items = assertBankPayload(payload).accountNumber.replace(/\D/g, '').slice(-4);
  return {
    type,
    title: title.slice(0, 120),
    encryptedPayload: encrypted.ciphertext,
    iv: encrypted.iv,
    tag: encrypted.tag,
    encryptionVersion: encrypted.encryptionVersion,
    metadata: {
      bankName: payload.bankName.trim().slice(0, 120),
      last4: items.length === 4 ? items : undefined,
    },
    favorite,
  };
}

export async function encryptCardItem(payload: CardPayload, favorite = false): Promise<CreateVaultItemInput> {
  const key = getActiveKey();
  const type = 'card';
  const title = payload.cardNickname || `${payload.cardBrand} ending ${payload.cardNumber.slice(-4)}`;
  const encrypted = await encryptPayload(key, utf8(payload));
  const last4 = payload.cardNumber.replace(/\D/g, '').slice(-4);
  return {
    type,
    title: title.slice(0, 120),
    encryptedPayload: encrypted.ciphertext,
    iv: encrypted.iv,
    tag: encrypted.tag,
    encryptionVersion: encrypted.encryptionVersion,
    metadata: {
      cardBrand: payload.cardBrand.trim().slice(0, 60),
      last4: last4.length === 4 ? last4 : undefined,
    },
    favorite,
  };
}

export async function decryptItem(item: VaultItem): Promise<BankPayload | CardPayload> {
  const key = getActiveKey();
  const plain = await decryptPayload(key, {
    ciphertext: item.encryptedPayload,
    iv: item.iv,
    tag: item.tag,
    encryptionVersion: item.encryptionVersion,
  });
  const parsed = JSON.parse(plain) as unknown;
  return item.type === 'bank' ? assertBankPayload(parsed) : assertCardPayload(parsed);
}

/** Guard: only the vault owner may attempt decryption (extra safety). */
export function ensureVaultOwner(expectedUserId: string): void {
  const owner = getOwnerUserId();
  if (owner && expectedUserId && owner !== expectedUserId) {
    throw new Error('Vault ownership mismatch');
  }
}