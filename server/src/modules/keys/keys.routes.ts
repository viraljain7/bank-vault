import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { keyOperationLimiter } from '../../middleware/rateLimiter.js';
import { vaultKeyUpsertSchema } from './keys.schemas.js';
import { deleteWrappedKey, getWrappedKey, putWrappedKey } from './keys.controller.js';

export function createKeysRouter(auth: RequestHandler = requireAuth()): Router {
  const router = Router();

  router.use(keyOperationLimiter);
  router.use(auth);

  router.get('/', getWrappedKey);
  router.put('/', validateBody(vaultKeyUpsertSchema), putWrappedKey);
  router.delete('/', deleteWrappedKey);

  return router;
}