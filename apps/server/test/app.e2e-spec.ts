import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Server foundation (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) returns wrapped payload', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        message: 'OK',
        data: {
          service: 'miniERP-server',
          status: 'ok',
        },
      });
  });

  it('/health/live (GET) returns liveness', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect({
        message: 'Service is alive',
        data: {
          status: 'live',
        },
      });
  });

  it('/health/ready (GET) returns readiness', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect({
        message: 'Service is ready',
        data: {
          status: 'ready',
        },
      });
  });
});
