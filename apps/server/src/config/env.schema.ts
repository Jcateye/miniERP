export type NodeEnv = 'development' | 'test' | 'production';

export interface EnvSchema {
  readonly NODE_ENV: NodeEnv;
  readonly PORT: number;
  readonly API_PREFIX: string;
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

export function parseEnv(env: NodeJS.ProcessEnv = process.env): EnvSchema {
  return {
    NODE_ENV: parseNodeEnv(env.NODE_ENV),
    PORT: parsePort(env.PORT),
    API_PREFIX: parseApiPrefix(env.API_PREFIX),
  };
}
