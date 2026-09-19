import pino from 'pino';
import { env } from './env.js';

/**
 * Application logger.
 *
 * SECURITY RULE: never log secret values (passwords, card numbers,
 * account numbers, customer IDs, encryption keys, tokens, cookies or
 * authorization headers). Only ever log structured, non-sensitive fields.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'password',
      '*.password',
      'cardNumber',
      'accountNumber',
      'customerId',
      'cvv',
      'cvc',
      'pin',
      'otp',
      'token',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      '*.secret',
      'encryptedPayload',
      'ciphertext',
    ],
    censor: '[REDACTED]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export type Logger = typeof logger;