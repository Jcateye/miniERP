import { parseEnv, type EnvSchema } from './env.schema';

export interface AppConfig {
  readonly nodeEnv: EnvSchema['NODE_ENV'];
  readonly port: number;
  readonly globalPrefix: string;
  readonly databaseUrl: string;
  readonly redisUrl: string;
  readonly redisKeyPrefix: string;
  readonly tenantHeader: string;
  readonly authContextSecret: string;
}

function normalizePrefix(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return '';
  }

  return trimmed.replace(/^\/+|\/+$/g, '');
}

export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const {
    NODE_ENV,
    PORT,
    API_PREFIX,
    DATABASE_URL,
    REDIS_URL,
    REDIS_KEY_PREFIX,
    TENANT_HEADER,
    AUTH_CONTEXT_SECRET,
  } = parseEnv(env);

  return {
    nodeEnv: NODE_ENV,
    port: PORT,
    globalPrefix: normalizePrefix(API_PREFIX),
    databaseUrl: DATABASE_URL,
    redisUrl: REDIS_URL,
    redisKeyPrefix: REDIS_KEY_PREFIX,
    tenantHeader: TENANT_HEADER,
    authContextSecret: AUTH_CONTEXT_SECRET,
  };
}
