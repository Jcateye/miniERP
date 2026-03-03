import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadAppConfig } from './config/app.config';
import { createAuthContextMiddleware } from './common/iam/auth-context.middleware';
import { createTenantContextMiddleware } from './common/tenant/tenant-context.middleware';

async function bootstrap() {
  const config = loadAppConfig();
  const app = await NestFactory.create(AppModule);

  app.use(createAuthContextMiddleware({ secret: config.authContextSecret }));
  app.use(createTenantContextMiddleware(config.tenantHeader));

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

  await app.listen(config.port);
}

void bootstrap();
