import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('provides test-only auth context secret in test env when value is missing', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
    });

    expect(env.AUTH_CONTEXT_SECRET).toBe('test-only-auth-context-secret');
  });

  it('defaults redis key prefix to erp_', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
    });

    expect(env.REDIS_KEY_PREFIX).toBe('erp_');
  });

  it('uses provided redis key prefix', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      REDIS_KEY_PREFIX: 'erp_custom_',
    });

    expect(env.REDIS_KEY_PREFIX).toBe('erp_custom_');
  });

  it('defaults tenant header fallback to false', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
    });

    expect(env.TENANT_HEADER_FALLBACK_ENABLED).toBe(false);
  });

  it('parses tenant header fallback when provided', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      TENANT_HEADER_FALLBACK_ENABLED: 'true',
    });

    expect(env.TENANT_HEADER_FALLBACK_ENABLED).toBe(true);
  });

  it('throws when tenant header fallback is invalid', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'test',
        DATABASE_URL: 'postgres://u:p@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        TENANT_HEADER_FALLBACK_ENABLED: 'maybe',
      }),
    ).toThrow('TENANT_HEADER_FALLBACK_ENABLED must be true or false');
  });
});
