import type { Request, Response } from 'express';
import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sensitiveReadLimiter } from '../../middleware/rateLimiter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getVaultKey } from '../keys/keys.service.js';
import { AuditEventModel } from '../../models/AuditEvent.js';

export function createSecurityRouter(auth: RequestHandler = requireAuth()): Router {
  const router = Router();

  router.use(sensitiveReadLimiter);
  router.use(auth);

  /** GET /api/v1/security/status — vault setup readiness for the signed-in user. */
  router.get(
    '/status',
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth.userId;
      const [wrapper, auditCount] = await Promise.all([
        getVaultKey(userId),
        AuditEventModel.countDocuments({ userId }),
      ]);

      res.json({
        success: true,
        data: {
          userId,
          hasUnlockKey: wrapper !== null,
          auditCount,
        },
      });
    }),
  );

  return router;
}