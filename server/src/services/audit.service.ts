import type { Request } from 'express';
import { AuditEventModel, type AuditAction, type AuditResourceType } from '../models/AuditEvent.js';
import { logger } from '../config/logger.js';
import { hashIp } from '../utils/ipHash.js';

export interface AuditWriteInput {
  userId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
}

/** Adds a security activity entry. Never stores secrets. */
export async function writeAudit(
  input: AuditWriteInput,
  req?: Pick<Request, 'ip' | 'headers'>,
): Promise<void> {
  try {
    const entry = await AuditEventModel.create({
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      ipHash: req ? hashIp(req.ip) : undefined,
      userAgent: req ? (req.headers['user-agent'] ?? 'unknown').slice(0, 200) : undefined,
    });
    logger.info({
      event: 'AUDIT',
      id: entry._id?.toString(),
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
    });
  } catch (err) {
    // Audit failures must never break the primary request path.
    logger.error(
      { event: 'AUDIT_FAILED', message: err instanceof Error ? err.message : 'audit failed' },
      'Unable to write audit event',
    );
  }
}