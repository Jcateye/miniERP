import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadAppConfig, type AppConfig } from './config/app.config';
import { createAuthContextMiddleware } from './common/iam/auth-context.middleware';
import { createTenantContextMiddleware } from './common/tenant/tenant-context.middleware';

function setupSwagger(app: INestApplication, config: AppConfig) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('miniERP API')
    .setDescription('miniERP 后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // 使用 config.globalPrefix 动态设置 docs 路径，保持与 API 路由一致
  const docsPath = config.globalPrefix.length > 0 ? `${config.globalPrefix}/docs` : 'docs';
  SwaggerModule.setup(docsPath, app, document, {
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

  setupSwagger(app, config);

  await app.listen(config.port);
}

void bootstrap();
