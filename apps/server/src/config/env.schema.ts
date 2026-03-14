export type NodeEnv = 'development' | 'test' | 'production';

export const DEV_FALLBACK_AUTH_CONTEXT_SECRET = 'dev-only-auth-context-secret';

export interface EnvSchema {
  readonly NODE_ENV: NodeEnv;
  readonly PORT: number;
  readonly API_PREFIX: string;
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
  readonly REDIS_KEY_PREFIX: string;
  readonly TENANT_HEADER: string;
  readonly TENANT_HEADER_FALLBACK_ENABLED: boolean;
  readonly AUTH_CONTEXT_SECRET: string;
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  return 'development';
}

function parsePort(value: string | undefined): number {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return 3000;
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
    AUTH_CONTEXT_SECRET: parseAuthContextSecret(
      env.AUTH_CONTEXT_SECRET,
      nodeEnv,
    ),
  };
}
