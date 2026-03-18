export type NodeEnv = 'development' | 'test' | 'production';

export const DEV_FALLBACK_AUTH_CONTEXT_SECRET = 'dev-only-auth-context-secret';

export type AuthMode = 'hmac' | 'jwt' | 'both';

function parseAuthMode(value: string | undefined): AuthMode {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return 'both';
  }

  const normalized = value.trim();
  if (normalized === 'hmac' || normalized === 'jwt' || normalized === 'both') {
    return normalized;
  }

  throw new Error('AUTH_MODE must be hmac, jwt, or both');
}

function parseOptionalJwtHs256Secret(
  value: string | undefined,
): string | undefined {
  if (typeof value === 'undefined') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export interface EnvSchema {
  readonly NODE_ENV: NodeEnv;
  readonly PORT: number;
  readonly API_PREFIX: string;
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
  readonly REDIS_KEY_PREFIX: string;
  readonly TENANT_HEADER: string;
  readonly TENANT_HEADER_FALLBACK_ENABLED: boolean;

  /**
   * Auth mode for server-side authentication.
   * - hmac: x-auth-context + signature only
   * - jwt: Authorization Bearer JWT only
   * - both: accept either, prefer JWT when both present
   */
  readonly AUTH_MODE: AuthMode;

  /** Shared secret for x-auth-context signature validation. */
  readonly AUTH_CONTEXT_SECRET: string;

  /** HS256 secret for validating JWT tokens. */
  readonly JWT_HS256_SECRET?: string;
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return 'production';
  }

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error('NODE_ENV must be development, test, or production');
}

function parsePort(value: string | undefined): number {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return 3001;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

function parseApiPrefix(value: string | undefined): string {
  if (typeof value === 'undefined') {
    return 'api';
  }

  return value.trim();
}

function parseRequiredEnv(
  value: string | undefined,
  key: 'DATABASE_URL' | 'REDIS_URL',
): string {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function parseTenantHeader(value: string | undefined): string {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return 'x-tenant-id';
  }

  return value.trim();
}

function parseTenantHeaderFallbackEnabled(value: string | undefined): boolean {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  throw new Error('TENANT_HEADER_FALLBACK_ENABLED must be true or false');
}

function parseRedisKeyPrefix(value: string | undefined): string {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return 'erp_';
  }

  return value.trim();
}

function parseAuthContextSecret(
  value: string | undefined,
  nodeEnv: NodeEnv,
): string {
  if (typeof value !== 'undefined' && value.trim().length > 0) {
    return value.trim();
  }

  if (nodeEnv === 'test') {
    return 'test-only-auth-context-secret';
  }

  if (nodeEnv === 'development') {
    return DEV_FALLBACK_AUTH_CONTEXT_SECRET;
  }

  throw new Error('AUTH_CONTEXT_SECRET is required');
}

export function parseEnv(env: NodeJS.ProcessEnv = process.env): EnvSchema {
  const nodeEnv = parseNodeEnv(env.NODE_ENV);
  const authMode = parseAuthMode(env.AUTH_MODE);
  const jwtHs256Secret = parseOptionalJwtHs256Secret(env.JWT_HS256_SECRET);

  if (authMode === 'jwt' && !jwtHs256Secret) {
    throw new Error('JWT_HS256_SECRET is required when AUTH_MODE=jwt');
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: parsePort(env.PORT),
    API_PREFIX: parseApiPrefix(env.API_PREFIX),
    DATABASE_URL: parseRequiredEnv(env.DATABASE_URL, 'DATABASE_URL'),
    REDIS_URL: parseRequiredEnv(env.REDIS_URL, 'REDIS_URL'),
    REDIS_KEY_PREFIX: parseRedisKeyPrefix(env.REDIS_KEY_PREFIX),
    TENANT_HEADER: parseTenantHeader(env.TENANT_HEADER),
    TENANT_HEADER_FALLBACK_ENABLED: parseTenantHeaderFallbackEnabled(
      env.TENANT_HEADER_FALLBACK_ENABLED,
    ),
    AUTH_MODE: authMode,
    AUTH_CONTEXT_SECRET: parseAuthContextSecret(
      env.AUTH_CONTEXT_SECRET,
      nodeEnv,
    ),
    JWT_HS256_SECRET: jwtHs256Secret,
  };
}
