import { ValidationPipe } from '@nestjs/common';
import type { AppConfig } from './app.config';
import { applyAppRuntimeConfig } from './runtime-config';

describe('applyAppRuntimeConfig', () => {
  const baseConfig: AppConfig = {
    nodeEnv: 'test',
    port: 3000,
    globalPrefix: 'api',
    databaseUrl: 'postgres://127.0.0.1:5432/test',
    redisUrl: 'redis://127.0.0.1:6379',
    redisKeyPrefix: 'erp_',
    tenantHeader: 'x-tenant-id',
    authContextSecret: 'test-secret',
  };

  function createAppMock() {
    return {
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
    };
  }

  it('applies auth/tenant middlewares in order and sets validation pipe', () => {
    const app = createAppMock();

    applyAppRuntimeConfig(app as never, baseConfig);

    expect(app.use).toHaveBeenCalledTimes(2);
    const authMiddleware = app.use.mock.calls[0]?.[0];
    const tenantMiddleware = app.use.mock.calls[1]?.[0];
    expect(typeof authMiddleware).toBe('function');
    expect(typeof tenantMiddleware).toBe('function');

    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
    const validationPipe = app.useGlobalPipes.mock
      .calls[0]?.[0] as ValidationPipe;
    expect(validationPipe).toBeInstanceOf(ValidationPipe);
    expect(validationPipe).toEqual(
      expect.objectContaining({
        isTransformEnabled: true,
        validatorOptions: expect.objectContaining({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      }),
    );

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('does not set global prefix when prefix is empty', () => {
    const app = createAppMock();

    applyAppRuntimeConfig(app as never, {
      ...baseConfig,
      globalPrefix: '',
    });

    expect(app.setGlobalPrefix).not.toHaveBeenCalled();
  });
});
