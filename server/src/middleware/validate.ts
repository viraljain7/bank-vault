import type { NextFunction, Request, Response } from 'express';
import type { ZodType, ZodTypeDef } from 'zod';
import { ValidationError } from '../utils/ApiError.js';

/**
 * Rejects requests whose body does not match the supplied zod schema.
 * Unexpected properties are stripped (rejected where relevant by the
 * schema's `.strict()`), so unvalidated or unknown fields can never reach
 * the persistence layer.
 */
export function validateBody<T>(schema: ZodType<T, ZodTypeDef, unknown>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError('Invalid request payload', result.error.issues));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T, ZodTypeDef, unknown>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError('Invalid query parameters', result.error.issues));
      return;
    }
    req.query = result.data as Request['query'];
    next();
  };
}