import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as net from 'node:net';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

interface ProbeServer {
  readonly server: net.Server;
  readonly port: number;
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

      resolve({
        server,
        port: address.port,
      });
    });
  });
}

function restoreEnv(
  nodeEnv: string | undefined,
  databaseUrl: string | undefined,
  redisUrl: string | undefined,
): void {
  if (typeof nodeEnv === 'undefined') {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = nodeEnv;
  }

  if (typeof databaseUrl === 'undefined') {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = databaseUrl;
  }

  if (typeof redisUrl === 'undefined') {
    delete process.env.REDIS_URL;
  } else {
    process.env.REDIS_URL = redisUrl;
  }
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

describe('Server foundation (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let databaseProbeServer: net.Server | undefined;
  let redisProbeServer: net.Server | undefined;
  let originalNodeEnv: string | undefined;
  let originalDatabaseUrl: string | undefined;
  let originalRedisUrl: string | undefined;

  beforeEach(async () => {
    originalNodeEnv = process.env.NODE_ENV;
    originalDatabaseUrl = process.env.DATABASE_URL;
    originalRedisUrl = process.env.REDIS_URL;

    const probeResults = await Promise.allSettled([
      startProbeServer(),
      startProbeServer(),
    ]);

    const startedProbeServers = probeResults
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<ProbeServer> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value.server);

    const probeFailure = probeResults.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (probeFailure) {
      await Promise.allSettled(
        startedProbeServers.map((server) => stopProbeServer(server)),
      );
      throw probeFailure.reason;
    }

    const [databaseProbe, redisProbe] = probeResults.map(
      (result) => (result as PromiseFulfilledResult<ProbeServer>).value,
    );

    databaseProbeServer = databaseProbe.server;
    redisProbeServer = redisProbe.server;

    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = `postgres://127.0.0.1:${databaseProbe.port}/test`;
    process.env.REDIS_URL = `redis://127.0.0.1:${redisProbe.port}`;

    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    } catch (error) {
      await Promise.allSettled([
        app ? app.close() : Promise.resolve(),
        stopProbeServer(databaseProbeServer),
        stopProbeServer(redisProbeServer),
      ]);
      app = undefined;
      databaseProbeServer = undefined;
      redisProbeServer = undefined;
      restoreEnv(originalNodeEnv, originalDatabaseUrl, originalRedisUrl);
      throw error;
    }
  });

  afterEach(async () => {
    const cleanupResults = await Promise.allSettled([
      app ? app.close() : Promise.resolve(),
      stopProbeServer(databaseProbeServer),
      stopProbeServer(redisProbeServer),
    ]);

    app = undefined;
    databaseProbeServer = undefined;
    redisProbeServer = undefined;

    restoreEnv(originalNodeEnv, originalDatabaseUrl, originalRedisUrl);

    const cleanupErrors = cleanupResults.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (cleanupErrors.length > 0) {
      throw cleanupErrors[0].reason;
    }
  });

  it('/ (GET) returns wrapped payload', () => {
    return request(app!.getHttpServer())
      .get('/')
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
      .get('/health/live')
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
      .get('/health/ready')
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
});
