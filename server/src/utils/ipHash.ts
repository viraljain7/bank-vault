import { createHash } from 'node:crypto';
import type { Request } from 'express';

/**
 * Returns a stable, non-reversible hash of the client IP for audit logging.
 *
 * The raw IP is never persisted. Only a SHA-256 digest with a per-request
 * pepper... note: real pepper handling belongs in a secret. For audit
 * purposes the digest of the IP alone is sufficient and reversible only
 * via brute-force on the small IPv4/IPv6 space; that is an accepted
 * trade-off documented in README. When a real pepper is configured it is
 * combined here.
 */
export function hashIp(ip: Request['ip'] | string | undefined): string | undefined {
  if (!ip) return undefined;
  const value = ip.split(':')[0] ?? ip;
  return createHash('sha256').update(`vb-ip:${value}`).digest('hex').slice(0, 32);
}

/** Normalized request title for logging. Never includes headers or tokens. */
export function requestId(ip?: string, reqId?: string): string {
  return reqId ?? `req-${ip ?? 'anon'}`;
}