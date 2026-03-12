import { ValidationPipe, type INestApplication } from '@nestjs/common';
import type { AppConfig } from './app.config';
import { applyAppRuntimeConfig } from './runtime-config';

type RuntimeConfigAppMock = Pick<
  INestApplication,
  'use' | 'useGlobalPipes' | 'setGlobalPrefix'
>;

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

  function createAppMock(): jest.Mocked<RuntimeConfigAppMock> {
    return {
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
    };
  }

  it('applies auth/tenant middlewares in order and sets validation pipe', () => {
    const app = createAppMock();

    applyAppRuntimeConfig(app, baseConfig);

    expect(app.use).toHaveBeenCalledTimes(2);
    const useCalls = app.use.mock.calls as ReadonlyArray<[unknown]>;
    const authMiddleware = useCalls[0]?.[0];
    const tenantMiddleware = useCalls[1]?.[0];
    expect(typeof authMiddleware).toBe('function');
    expect(typeof tenantMiddleware).toBe('function');

    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
    const globalPipeCalls = app.useGlobalPipes.mock.calls as ReadonlyArray<
      [ValidationPipe]
    >;
    const validationPipe = globalPipeCalls[0]?.[0];
    expect(validationPipe).toBeInstanceOf(ValidationPipe);
    const validationPipeState = validationPipe as ValidationPipe & {
      isTransformEnabled: boolean;
      validatorOptions: {
        whitelist: boolean;
        forbidNonWhitelisted: boolean;
      };
    };
    expect(validationPipeState.isTransformEnabled).toBe(true);
    expect(validationPipeState.validatorOptions.whitelist).toBe(true);
    expect(validationPipeState.validatorOptions.forbidNonWhitelisted).toBe(
      true,
    );

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('does not set global prefix when prefix is empty', () => {
    const app = createAppMock();

    applyAppRuntimeConfig(app, {
      ...baseConfig,
      globalPrefix: '',
    });

    expect(app.setGlobalPrefix).not.toHaveBeenCalled();
  });
});
