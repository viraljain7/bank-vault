import { Schema, model, type InferSchemaType } from 'mongoose';

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'REVEAL',
  'COPY',
  'LOGIN',
  'LOCK',
  'UNLOCK',
  'SETUP',
  'SEARCH',
  'READ',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_RESOURCE_TYPES = ['bank', 'card', 'vault', 'key'] as const;
export type AuditResourceType = (typeof AUDIT_RESOURCE_TYPES)[number];

const auditEventSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    resourceType: { type: String, enum: AUDIT_RESOURCE_TYPES, required: true },
    resourceId: { type: String },
    ipHash: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

auditEventSchema.index({ userId: 1, createdAt: -1 });
auditEventSchema.index({ userId: 1, action: 1, createdAt: -1 });

export type AuditEvent = InferSchemaType<typeof auditEventSchema>;

export const AuditEventModel = model<AuditEvent>('AuditEvent', auditEventSchema);