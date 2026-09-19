import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAuth, type ClerkTokenVerifier } from './middleware/auth.js';
import { createVaultRouter } from './modules/vault/vault.routes.js';
import { createKeysRouter } from './modules/keys/keys.routes.js';
import { createActivityRouter } from './modules/activity/activity.routes.js';
import { createSecurityRouter } from './modules/security/security.routes.js';

/** Strips any leaked incoming sensitive query keys before handling. */
function sanitizeQuery(req: express.Request, _res: express.Response, next: express.NextFunction): void {
  const blocked = ['password', 'cardnumber', 'cvv', 'otp', 'token'];
  for (const key of Object.keys(req.query)) {
    if (blocked.includes(key.toLowerCase())) delete req.query[key];
  }
  next();
}

export interface CreateAppOptions {
  /** Override the Clerk verifier (used by tests). */
  authVerifier?: ClerkTokenVerifier;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY ? 1 : 0);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Vite dev HMR + Clerk
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://*.clerk.accounts.dev'],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true); // non-browser clients
        if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed'));
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '64kb' }));
  app.use(sanitizeQuery);

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', name: 'vaultbank-api' } });
  });

  const auth = options.authVerifier ? requireAuth(options.authVerifier) : requireAuth();

  app.use('/api/v1/vault', createVaultRouter(auth));
  app.use('/api/v1/keys', createKeysRouter(auth));
  app.use('/api/v1/activity', createActivityRouter(auth));
  app.use('/api/v1/security', createSecurityRouter(auth));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}