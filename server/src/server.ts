import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './app.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ event: 'SERVER_STARTED', port: env.PORT, env: env.NODE_ENV }, 'VaultBank API started');
  });

  const shutdown = (signal: string): void => {
    logger.info({ event: 'SHUTDOWN', signal }, 'Shutting down');
    server.close(() => {
      void import('./config/db.js')
        .then(({ disconnectDatabase }) => disconnectDatabase())
        .finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err: unknown) => {
  logger.error(
    { event: 'BOOT_FAILED', message: err instanceof Error ? err.message : 'unknown' },
    'Failed to start server',
  );
  process.exit(1);
});