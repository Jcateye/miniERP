import { createHmac } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as net from 'node:net';
import request from 'supertest';
import type { App } from 'supertest/types';
import { loadAppConfig, type AppConfig } from '../src/config/app.config';
import { applyAppRuntimeConfig } from '../src/config/runtime-config';
import { AppModule } from '../src/app.module';

interface ProbeServer {
  readonly server: net.Server;
  readonly port: number;
}

interface EnvSnapshot {
  readonly nodeEnv: string | undefined;
  readonly databaseUrl: string | undefined;
  readonly redisUrl: string | undefined;
  readonly authContextSecret: string | undefined;
}

const TEST_AUTH_CONTEXT_SECRET = 'test-only-auth-context-secret';

function snapshotEnv(): EnvSnapshot {
  return {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    authContextSecret: process.env.AUTH_CONTEXT_SECRET,
  };
}

function restoreEnv(snapshot: EnvSnapshot): void {
  if (typeof snapshot.nodeEnv === 'undefined') {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = snapshot.nodeEnv;
  }

  if (typeof snapshot.databaseUrl === 'undefined') {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = snapshot.databaseUrl;
  }

  if (typeof snapshot.redisUrl === 'undefined') {
    delete process.env.REDIS_URL;
  } else {
    process.env.REDIS_URL = snapshot.redisUrl;
  }

  if (typeof snapshot.authContextSecret === 'undefined') {
    delete process.env.AUTH_CONTEXT_SECRET;
  } else {
    process.env.AUTH_CONTEXT_SECRET = snapshot.authContextSecret;
  }
}

function applyTestEnv(databasePort: number, redisPort: number): void {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = `postgres://127.0.0.1:${databasePort}/test`;
  process.env.REDIS_URL = `redis://127.0.0.1:${redisPort}`;
  process.env.AUTH_CONTEXT_SECRET = TEST_AUTH_CONTEXT_SECRET;
}

function extractRejectedReasons(
  results: PromiseSettledResult<unknown>[],
): unknown[] {
  return results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )
    .map((result) => result.reason);
}

function encodeAuthContext(payload: {
  tenantId: string;
  actorId: string;
  permissions: string[];
  role: 'platform_admin' | 'tenant_admin' | 'operator';
}): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function signAuthContext(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function createRequestHeaders(
  requestId: string,
  config: AppConfig,
  options: {
    role?: 'platform_admin' | 'tenant_admin' | 'operator';
    tenantId?: string;
    actorId?: string;
    permissions?: string[];
  } = {},
): Record<string, string> {
  const tenantId = options.tenantId ?? '1001';
  const actorId = options.actorId ?? '9001';
  const role = options.role ?? 'tenant_admin';
  const permissions = options.permissions ?? [
    'evidence:*',
    'masterdata.warehouse.read',
  ];

  const encodedContext = encodeAuthContext({
    tenantId,
    actorId,
    permissions,
    role,
  });

  return {
    [config.tenantHeader]: tenantId,
    'x-request-id': requestId,
    'x-auth-context': encodedContext,
    'x-auth-context-signature': signAuthContext(
      encodedContext,
      config.authContextSecret,
    ),
  };
}

function toApiPath(path: string, config: AppConfig): string {
  if (config.globalPrefix.length === 0) {
    return path;
  }

  if (path === '/') {
    return `/${config.globalPrefix}`;
  }

  return `/${config.globalPrefix}${path}`;
}

function startProbeServer(): Promise<ProbeServer> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => {
          reject(new Error('Failed to get probe server address'));
        });
        return;
      }

      resolve({ server, port: address.port });
    });
  });
}

function stopProbeServer(server: net.Server | undefined): Promise<void> {
  if (!server) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function startProbePair(): Promise<{
  readonly databaseProbe: ProbeServer;
  readonly redisProbe: ProbeServer;
}> {
  const probeResults = await Promise.allSettled([
    startProbeServer(),
    startProbeServer(),
  ]);

  const startedServers = probeResults
    .filter(
      (result): result is PromiseFulfilledResult<ProbeServer> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value.server);

  const probeFailure = probeResults.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (probeFailure) {
    await Promise.allSettled(
      startedServers.map((server) => stopProbeServer(server)),
    );
    throw probeFailure.reason;
  }

  const [databaseProbe, redisProbe] = probeResults.map(
    (result) => (result as PromiseFulfilledResult<ProbeServer>).value,
  );

  return { databaseProbe, redisProbe };
}

async function createTestingApp(): Promise<{
  readonly app: INestApplication<App>;
  readonly config: AppConfig;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const nextApp = moduleFixture.createNestApplication();
  const config = loadAppConfig();

  applyAppRuntimeConfig(nextApp, config);

  await nextApp.init();
  return {
    app: nextApp,
    config,
  };
}

describe('Server foundation (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let appConfig: AppConfig;
  let databaseProbeServer: net.Server | undefined;
  let redisProbeServer: net.Server | undefined;
  let envSnapshot: EnvSnapshot;

  beforeAll(async () => {
    envSnapshot = snapshotEnv();

    const { databaseProbe, redisProbe } = await startProbePair();
    databaseProbeServer = databaseProbe.server;
    redisProbeServer = redisProbe.server;

    applyTestEnv(databaseProbe.port, redisProbe.port);

    try {
      const testingApp = await createTestingApp();
      app = testingApp.app;
      appConfig = testingApp.config;
    } catch (error) {
      const cleanupResults = await Promise.allSettled([
        app ? app.close() : Promise.resolve(),
        stopProbeServer(databaseProbeServer),
        stopProbeServer(redisProbeServer),
      ]);

      app = undefined;
      databaseProbeServer = undefined;
      redisProbeServer = undefined;
      restoreEnv(envSnapshot);

      const cleanupErrors = extractRejectedReasons(cleanupResults);
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [error, ...cleanupErrors],
          'beforeAll failed with cleanup errors',
        );
      }

      throw error;
    }
  });

  afterAll(async () => {
    const cleanupResults = await Promise.allSettled([
      app ? app.close() : Promise.resolve(),
      stopProbeServer(databaseProbeServer),
      stopProbeServer(redisProbeServer),
    ]);

    app = undefined;
    databaseProbeServer = undefined;
    redisProbeServer = undefined;
    restoreEnv(envSnapshot);

    const cleanupErrors = extractRejectedReasons(cleanupResults);
    if (cleanupErrors.length > 0) {
      throw new AggregateError(cleanupErrors, 'afterAll cleanup failed');
    }
  });

  it('/ (GET) returns wrapped payload', () => {
    return request(app!.getHttpServer())
      .get(toApiPath('/', appConfig))
      .set(createRequestHeaders('req-e2e-root', appConfig))
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'OK',
            data: expect.objectContaining({
              service: 'miniERP-server',
              status: 'ok',
            }),
          }),
        );
      });
  });

  it('/health/live (GET) returns liveness', () => {
    return request(app!.getHttpServer())
      .get(toApiPath('/health/live', appConfig))
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Service is alive',
            data: expect.objectContaining({
              status: 'live',
            }),
          }),
        );
      });
  });

  it('/health/ready (GET) returns readiness', () => {
    return request(app!.getHttpServer())
      .get(toApiPath('/health/ready', appConfig))
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Service is ready',
            data: expect.objectContaining({
              status: 'ready',
              dependencies: expect.arrayContaining([
                expect.objectContaining({ name: 'database', status: 'up' }),
                expect.objectContaining({ name: 'redis', status: 'up' }),
              ]),
            }),
          }),
        );
      });
  });

  it('/ (GET) returns 403 when tenant header mismatches auth context', () => {
    const mismatchTenantHeaders = {
      ...createRequestHeaders('req-e2e-tenant-mismatch', appConfig),
      [appConfig.tenantHeader]: '2002',
    };

    return request(app!.getHttpServer())
      .get(toApiPath('/', appConfig))
      .set(mismatchTenantHeaders)
      .expect(403)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'TENANT_MISMATCH',
            }),
          }),
        );
      });
  });

  it('/ (GET) allows tenant mismatch for platform_admin auth context', () => {
    const platformAdminHeaders = {
      ...createRequestHeaders('req-e2e-platform-admin-mismatch', appConfig, {
        role: 'platform_admin',
        permissions: ['platform.audit.read'],
      }),
      [appConfig.tenantHeader]: '2002',
    };

    return request(app!.getHttpServer())
      .get(toApiPath('/', appConfig))
      .set(platformAdminHeaders)
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'OK',
            data: expect.objectContaining({
              service: 'miniERP-server',
              status: 'ok',
            }),
          }),
        );
      });
  });

  it('/ (GET) returns 401 without auth context', () => {
    return request(app!.getHttpServer())
      .get(toApiPath('/', appConfig))
      .set({
        [appConfig.tenantHeader]: '1001',
        'x-request-id': 'req-e2e-no-auth',
      })
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'AUTH_INVALID_CONTEXT',
            }),
          }),
        );
      });
  });

  it('/ (GET) returns 401 with invalid auth signature', () => {
    const invalidSignatureHeaders = {
      ...createRequestHeaders('req-e2e-invalid-signature', appConfig),
      'x-auth-context-signature': 'invalid-signature',
    };

    return request(app!.getHttpServer())
      .get(toApiPath('/', appConfig))
      .set(invalidSignatureHeaders)
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'AUTH_INVALID_CONTEXT',
            }),
          }),
        );
      });
  });

  it('/ (GET) returns 401 with tampered auth payload', () => {
    const tamperedPayloadHeaders = {
      ...createRequestHeaders('req-e2e-tampered-payload', appConfig),
      'x-auth-context': 'invalid-base64-payload',
    };

    return request(app!.getHttpServer())
      .get(toApiPath('/', appConfig))
      .set(tamperedPayloadHeaders)
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'AUTH_INVALID_CONTEXT',
            }),
          }),
        );
      });
  });
});
