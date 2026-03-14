import { ValidationPipe } from '@nestjs/common';
import type { AppConfig } from './app.config';
import { applyAppRuntimeConfig } from './runtime-config';

describe('applyAppRuntimeConfig', () => {
  type AppMock = {
    readonly middlewares: unknown[];
    readonly pipes: ValidationPipe[];
    readonly prefixes: string[];
    use(handler: unknown): void;
    useGlobalPipes(pipe: ValidationPipe): void;
    setGlobalPrefix(prefix: string): void;
  };

  const baseConfig: AppConfig = {
    nodeEnv: 'test',
    port: 3000,
    globalPrefix: 'api',
    databaseUrl: 'postgres://127.0.0.1:5432/test',
    redisUrl: 'redis://127.0.0.1:6379',
    redisKeyPrefix: 'erp_',
    tenantHeader: 'x-tenant-id',
    tenantHeaderFallbackEnabled: false,
    authContextSecret: 'test-secret',
  };

  function createAppMock(): AppMock {
    return {
      middlewares: [],
      pipes: [],
      prefixes: [],
      use(this: AppMock, handler) {
        this.middlewares.push(handler);
      },
      useGlobalPipes(this: AppMock, pipe) {
        this.pipes.push(pipe);
      },
      setGlobalPrefix(this: AppMock, prefix) {
        this.prefixes.push(prefix);
      },
    };
  }

  it('applies auth/tenant middlewares in order and sets validation pipe', () => {
    const app = createAppMock();

    applyAppRuntimeConfig(app, baseConfig);

    expect(app.middlewares).toHaveLength(2);
    const authMiddleware = app.middlewares[0];
    const tenantMiddleware = app.middlewares[1];
    expect(typeof authMiddleware).toBe('function');
    expect(typeof tenantMiddleware).toBe('function');

    expect(app.pipes).toHaveLength(1);
    const validationPipe = app.pipes[0];
    expect(validationPipe).toBeInstanceOf(ValidationPipe);
    expect(validationPipe).toMatchObject({
      isTransformEnabled: true,
      validatorOptions: {
        whitelist: true,
        forbidNonWhitelisted: true,
      },
    });

    expect(app.prefixes).toEqual(['api']);
  });

  it('does not set global prefix when prefix is empty', () => {
    const app = createAppMock();

    applyAppRuntimeConfig(app, {
      ...baseConfig,
      globalPrefix: '',
    });

    expect(app.prefixes).toEqual([]);
  });
});
