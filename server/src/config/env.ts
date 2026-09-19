import 'dotenv/config';

export interface Env {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  MONGODB_URI: string;
  CLERK_SECRET_KEY: string;
  CLIENT_URL: string;
  CORS_ORIGINS: string[];
  ENCRYPTION_KEY: string;
  TRUST_PROXY: boolean;
  LOG_LEVEL: string;
}

function requireEnv(name: string, phase: 'runtime' | 'test' = 'runtime'): string {
  const value = process.env[name];
  if (!value) {
    // Tests set everything they need; optional in dev until first boot.
    if (phase === 'test') return '';
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadEnv(): Env {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isTest = nodeEnv === 'test';

  return {
    NODE_ENV: nodeEnv as Env['NODE_ENV'],
    PORT: Number(process.env.PORT ?? 5000),
    MONGODB_URI: process.env.MONGODB_URI ?? (isTest ? '' : 'mongodb://127.0.0.1:27017/vaultbank'),
    CLERK_SECRET_KEY: requireEnv('CLERK_SECRET_KEY', isTest ? 'test' : 'runtime'),
    CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
    CORS_ORIGINS: (process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    ENCRYPTION_KEY: requireEnv('ENCRYPTION_KEY', isTest ? 'test' : 'runtime'),
    TRUST_PROXY: (process.env.TRUST_PROXY ?? '0') === '1',
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  };
}

export const env: Env = loadEnv();