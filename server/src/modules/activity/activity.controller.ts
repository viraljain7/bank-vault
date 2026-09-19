import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { writeAudit } from '../../services/audit.service.js';
import { AuditEventModel, type AuditAction, type AuditResourceType } from '../../models/AuditEvent.js';

type AuthedRequest = Request & { auth: Request['auth'] };

/** GET /api/v1/activity?limit=&cursor= — the user's security activity feed. */
export const getActivity = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 30), 100);
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

  const filter: Record<string, unknown> = { userId: req.auth.userId };
  if (cursor) {
    try {
      const createdAt = new Date(cursor);
      if (!Number.isNaN(createdAt.getTime())) filter.createdAt = { $lt: createdAt };
    } catch {
      // ignore malformed cursor
    }
  }

  const events = await AuditEventModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select({ _id: 0, userId: 0, __v: 0 })
    .lean();

  res.json({
    success: true,
    data: events.map((e) => ({
      action: e.action,
      resourceType: e.resourceType,
      resourceId: e.resourceId,
      createdAt: e.createdAt,
    })),
    nextCursor: events.length === limit && events.length > 0 ? events[events.length - 1]?.createdAt.toISOString() : null,
  });
});

const reportableActions = new Set<AuditAction>(['REVEAL', 'COPY', 'LOCK', 'UNLOCK']);

/** POST /api/v1/activity — client-side security events (reveal/copy/lock). */
export const postActivity = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { action, resourceType, resourceId } = req.body as {
    action?: AuditAction;
    resourceType?: AuditResourceType;
    resourceId?: string;
  };

  if (!action || !reportableActions.has(action)) {
    res.status(400).json({ success: false, message: 'Invalid activity action' });
    return;
  }

  await writeAudit(
    {
      userId: req.auth.userId,
      action,
      resourceType: resourceType ?? 'vault',
      resourceId: typeof resourceId === 'string' ? resourceId.slice(0, 64) : undefined,
    },
    req,
  );

  res.status(201).json({ success: true, data: { recorded: true } });
});