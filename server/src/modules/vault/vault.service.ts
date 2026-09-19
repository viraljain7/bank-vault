import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { VaultItemModel, type VaultItem } from '../../models/VaultItem.js';
import { NotFoundError, ForbiddenError } from '../../utils/ApiError.js';
import type { VaultItemCreateInput, VaultItemUpdateInput } from './vault.schemas.js';

export interface VaultListParams {
  userId: string;
  type?: 'bank' | 'card';
  favorite?: boolean;
  q?: string;
  limit?: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilter(params: VaultListParams): FilterQuery<VaultItem> {
  const filter: FilterQuery<VaultItem> = { userId: params.userId };

  if (params.type) filter.type = params.type;
  if (params.favorite !== undefined) filter.favorite = params.favorite;

  if (params.q) {
    const term = new RegExp(escapeRegex(params.q.trim()), 'i');
    filter.$or = [
      { title: term },
      { 'metadata.bankName': term },
      { 'metadata.cardBrand': term },
      { 'metadata.last4': term },
    ];
  }

  return filter;
}

export async function listVaultItems(params: VaultListParams) {
  const limit = params.limit ?? 50;
  const filter = buildFilter(params);
  return VaultItemModel.find(filter).sort({ updatedAt: -1 }).limit(limit).lean();
}

export async function countVaultItems(userId: string, type?: 'bank' | 'card') {
  const filter: FilterQuery<VaultItem> = { userId };
  if (type) filter.type = type;
  return VaultItemModel.countDocuments(filter);
}

export async function countFavorites(userId: string) {
  return VaultItemModel.countDocuments({ userId, favorite: true });
}

export interface CreateVaultItemParams {
  userId: string;
  input: VaultItemCreateInput;
}

export async function createVaultItem({ userId, input }: CreateVaultItemParams) {
  const doc = await VaultItemModel.create({
    userId,
    type: input.type,
    title: input.title,
    encryptedPayload: input.encryptedPayload,
    iv: input.iv,
    tag: input.tag,
    encryptionVersion: input.encryptionVersion,
    metadata: input.metadata,
    favorite: input.favorite,
  });
  return doc.toObject({ versionKey: false });
}

export async function getOwnVaultItem(userId: string, itemId: string) {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new NotFoundError('Credential not found');
  }
  const item = await VaultItemModel.findOne({ _id: itemId, userId }).lean();
  if (!item) throw new NotFoundError('Credential not found');
  return item;
}

/**
 * Authorization + mutation combined: a user can only ever touch THEIR OWN
 * items. Looking up by `{ _id, userId }` prevents IDOR / cross-user access.
 */
export async function updateOwnVaultItem(userId: string, itemId: string, input: VaultItemUpdateInput) {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new NotFoundError('Credential not found');
  }
  const item = await VaultItemModel.findOneAndUpdate(
    { _id: itemId, userId },
    { $set: input },
    { new: true, runValidators: true },
  ).lean();
  if (!item) throw new NotFoundError('Credential not found');
  return item;
}

export async function deleteOwnVaultItem(userId: string, itemId: string) {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new NotFoundError('Credential not found');
  }
  const item = await VaultItemModel.findOneAndDelete({ _id: itemId, userId }).lean();
  if (!item) throw new NotFoundError('Credential not found');
  return item;
}

/** Sentry method to assert a resource belongs to a user before forbidding access. */
export async function assertOwnership(userId: string, itemId: string): Promise<void> {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new ForbiddenError('Resource not found');
  }
  const owned = await VaultItemModel.exists({ _id: itemId, userId });
  if (!owned) throw new ForbiddenError('Resource not found');
}