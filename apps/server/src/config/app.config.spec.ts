import { loadAppConfig } from './app.config';

describe('loadAppConfig', () => {
  it('loads auth context secret from env', () => {
    const config = loadAppConfig({
      NODE_ENV: 'test',
      PORT: '3001',
      API_PREFIX: 'api',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      TENANT_HEADER: 'x-tenant-id',
      AUTH_CONTEXT_SECRET: 's3cr3t',
    });

    expect(config.authContextSecret).toBe('s3cr3t');
  });
});
