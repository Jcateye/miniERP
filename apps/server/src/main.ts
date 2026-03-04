import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadAppConfig } from './config/app.config';
import { createAuthContextMiddleware } from './common/iam/auth-context.middleware';
import { createTenantContextMiddleware } from './common/tenant/tenant-context.middleware';

import { INestApplication } from '@nestjs/common';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('miniERP API')
    .setDescription('miniERP 后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

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

  setupSwagger(app);

  await app.listen(config.port);
}

void bootstrap();
