import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

interface SafeErrorBody {
  success: false;
  message: string;
  details?: readonly unknown[];
}

/** Centralized error handler. Never leaks stack traces, internals nor secrets. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    const body: SafeErrorBody = { success: false, message: err.message };
    if (err.details && env.NODE_ENV !== 'production') {
      body.details = err.details;
    }
    res.status(err.status).json(body);
    return;
  }

  const status = 500;
  logger.error(
    {
      event: 'UNHANDLED_ERROR',
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message : 'Unknown error',
    },
    'Unhandled error',
  );

  const body: SafeErrorBody =
    env.NODE_ENV === 'production'
      ? { success: false, message: 'Unable to process request' }
      : { success: false, message: err instanceof Error ? err.message : 'Unable to process request' };

  res.status(status).json(body);
}