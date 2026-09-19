import { Schema, model, type InferSchemaType } from 'mongoose';

export const VAULT_ITEM_TYPES = ['bank', 'card'] as const;
export type VaultItemType = (typeof VAULT_ITEM_TYPES)[number];

/**
 * Vault schema is defined inline so indexes / population stay simple while
 * the runtime shape is validated by zod before persistence.
 */
const vaultItemSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },

    type: { type: String, enum: VAULT_ITEM_TYPES, required: true },

    /** Non-secret nickname / title. Safe for display and search. */
    title: { type: String, required: true, trim: true, maxlength: 120 },

    /** AES-256-GCM ciphertext (client-side encryption). Base64. */
    encryptedPayload: { type: String, required: true },

    /** GCM initialization vector. Base64. */
    iv: { type: String, required: true },

    /** GCM authentication tag. Base64. */
    tag: { type: String, required: true },

    encryptionVersion: { type: Number, required: true, default: 1 },

    /** Safe searchable metadata — never contains secrets, only derived bits. */
    metadata: {
      type: new Schema(
        {
          bankName: { type: String, trim: true, maxlength: 120 },
          cardBrand: { type: String, trim: true, maxlength: 60 },
          last4: { type: String, trim: true, maxlength: 4 },
        },
        { _id: false },
      ),
      default: {},
    },

    favorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

vaultItemSchema.index({ userId: 1, type: 1 });
vaultItemSchema.index({ userId: 1, favorite: 1 });
vaultItemSchema.index({ userId: 1, title: 1 });
vaultItemSchema.index({ 'metadata.bankName': 1 });
vaultItemSchema.index({ 'metadata.cardBrand': 1 });
vaultItemSchema.index({ 'metadata.last4': 1 });

export type VaultItem = InferSchemaType<typeof vaultItemSchema>;

export const VaultItemModel = model<VaultItem>('VaultItem', vaultItemSchema);