/** Error sentinels exposed to clients. Never include stack traces or internals. */
export interface ApiErrorOptions {
  status?: number;
  code?: string;
  details?: readonly unknown[];
  expose?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: readonly unknown[];

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, { status: 404, code: 'NOT_FOUND' });
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, { status: 403, code: 'FORBIDDEN' });
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, { status: 401, code: 'UNAUTHENTICATED' });
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Invalid request', details?: readonly unknown[]) {
    super(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(message, { status: 429, code: 'RATE_LIMITED' });
  }
}