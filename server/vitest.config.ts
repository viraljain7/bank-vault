import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      ENCRYPTION_KEY: 'a'.repeat(64),
      CLERK_SECRET_KEY: 'sk_test_placeholder_for_tests',
      CLIENT_URL: 'http://localhost:5173',
      CORS_ORIGINS: 'http://localhost:5173',
      MONGODB_URI: '',
      LOG_LEVEL: 'silent',
    },
    pool: 'forks',
  },
});