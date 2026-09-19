import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { apiLimiter, sensitiveReadLimiter, vaultWriteLimiter } from '../../middleware/rateLimiter.js';
import { vaultItemCreateSchema, vaultItemUpdateSchema, vaultListQuerySchema } from './vault.schemas.js';
import {
  deleteVaultItem,
  getOverview,
  getVaultItem,
  getVaultItems,
  patchVaultItem,
  postVaultItem,
} from './vault.controller.js';

export function createVaultRouter(auth: RequestHandler = requireAuth()): Router {
  const router = Router();

  router.use(apiLimiter);
  router.use(auth);

  router.get('/', validateQuery(vaultListQuerySchema), getVaultItems);
  router.get('/overview', sensitiveReadLimiter, getOverview);
  router.get('/:id', sensitiveReadLimiter, getVaultItem);
  router.post('/', vaultWriteLimiter, validateBody(vaultItemCreateSchema), postVaultItem);
  router.patch('/:id', vaultWriteLimiter, validateBody(vaultItemUpdateSchema), patchVaultItem);
  router.delete('/:id', vaultWriteLimiter, deleteVaultItem);

  return router;
}