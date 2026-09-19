import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@clerk/express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { UnauthorizedError } from '../utils/ApiError.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionId?: string;
      };
    }
  }
}

export type ClerkTokenVerifier = (token: string) => Promise<{ userId: string; sessionId?: string }>;

/**
 * Verifies a Clerk session JWT. The signed token is validated against the
 * Clerk public key / JWKS endpoint. The authenticated `sub` claim is the
 * only identity source trusted by the backend — never a client-supplied id.
 */
export async function verifyClerkToken(token: string): Promise<{ userId: string; sessionId?: string }> {
  if (!env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY.length < 10) {
    throw new UnauthorizedError('Clerk is not configured');
  }

  const claims = await verifyToken(token, {
    secretKey: env.CLERK_SECRET_KEY,
    clockSkewInMs: 30_000,
  });

  const userId = typeof claims.sub === 'string' && claims.sub.startsWith('user_') ? claims.sub : undefined;
  if (!userId) {
    throw new UnauthorizedError('Invalid session token');
  }

  return {
    userId,
    sessionId: typeof claims.sid === 'string' ? claims.sid : undefined,
  };
}

/** Factory so tests can inject a deterministic verifier. */
export function requireAuth(verify: ClerkTokenVerifier = verifyClerkToken) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;

    if (!token) {
      next(new UnauthorizedError('Missing bearer token'));
      return;
    }

    try {
      const { userId, sessionId } = await verify(token);
      req.auth = { userId, sessionId };
      next();
    } catch (err) {
      logger.warn({ event: 'AUTH_VERIFY_FAILED', reason: err instanceof Error ? err.message : 'unknown' });
      next(new UnauthorizedError('Invalid or expired session token'));
    }
  };
}