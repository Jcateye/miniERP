import { Test, type TestingModule } from '@nestjs/testing';
import { DATABASE_URL_TOKEN, REDIS_URL_TOKEN } from './database.constants';
import { DatabaseModule } from './database.module';

describe('DatabaseModule', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalRedisUrl = process.env.REDIS_URL;

  afterEach(() => {
    if (typeof originalDatabaseUrl === 'undefined') {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    if (typeof originalRedisUrl === 'undefined') {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = originalRedisUrl;
    }
  });

  async function createTestingModule(): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
  }

  it('throws when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';

    await expect(createTestingModule()).rejects.toThrow(
      'DATABASE_URL is required',
    );
  });

  it('throws when REDIS_URL is missing', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@127.0.0.1:5432/minierp';
    delete process.env.REDIS_URL;

    await expect(createTestingModule()).rejects.toThrow(
      'REDIS_URL is required',
    );
  });

  it('provides DATABASE_URL and REDIS_URL tokens when env exists', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@127.0.0.1:5432/minierp';
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';

    const moduleRef = await createTestingModule();

    expect(moduleRef.get<string>(DATABASE_URL_TOKEN)).toBe(
      'postgres://user:pass@127.0.0.1:5432/minierp',
    );
    expect(moduleRef.get<string>(REDIS_URL_TOKEN)).toBe(
      'redis://127.0.0.1:6379',
    );

    await moduleRef.close();
  });
});
