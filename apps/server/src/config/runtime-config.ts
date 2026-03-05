import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createAuthContextMiddleware } from '../common/iam/auth-context.middleware';
import { createTenantContextMiddleware } from '../common/tenant/tenant-context.middleware';
import type { AppConfig } from './app.config';

export function applyAppRuntimeConfig<TApp = unknown>(
  app: INestApplication<TApp>,
  config: AppConfig,
): void {
  app.use(
    createAuthContextMiddleware({
      secret: config.authContextSecret,
      nodeEnv: config.nodeEnv,
    }),
  );
  app.use(createTenantContextMiddleware(config.tenantHeader, config.nodeEnv));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (config.globalPrefix.length > 0) {
    app.setGlobalPrefix(config.globalPrefix);
  }
}
