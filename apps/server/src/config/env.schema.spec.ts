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

  it('throws in production when auth context secret is missing', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgres://u:p@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      }),
    ).toThrow('AUTH_CONTEXT_SECRET is required');
  });
});
