import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { apiLimiter, sensitiveReadLimiter } from '../../middleware/rateLimiter.js';
import { getActivity, postActivity } from './activity.controller.js';

export function createActivityRouter(auth: RequestHandler = requireAuth()): Router {
  const router = Router();

  router.use(apiLimiter);
  router.use(auth);

  router.get('/', sensitiveReadLimiter, getActivity);
  router.post('/', sensitiveReadLimiter, postActivity);

  return router;
}