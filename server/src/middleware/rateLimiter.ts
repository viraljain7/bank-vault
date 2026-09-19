import rateLimit, { type Options, type RateLimitRequestHandler } from 'express-rate-limit';

const standardHeaders = 'draft-7' as const;

function limiterDefaults(overrides: Partial<Options> = {}): Partial<Options> {
  return {
    standardHeaders,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
    ...overrides,
  };
}

/** General API endpoint limiter. */
export const apiLimiter: RateLimitRequestHandler = rateLimit(
  limiterDefaults({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7' }),
);

/** Vault mutation endpoints - stricter. */
export const vaultWriteLimiter: RateLimitRequestHandler = rateLimit(
  limiterDefaults({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7' }),
);

/** Sensitive read / reveal / audit operations - strictest. */
export const sensitiveReadLimiter: RateLimitRequestHandler = rateLimit(
  limiterDefaults({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7' }),
);

/** Vault key setup / unlock endpoints. */
export const keyOperationLimiter: RateLimitRequestHandler = rateLimit(
  limiterDefaults({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7' }),
);

export const strictLimiter: RateLimitRequestHandler = rateLimit(
  limiterDefaults({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-7' }),
);