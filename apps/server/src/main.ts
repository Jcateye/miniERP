import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadAppConfig } from './config/app.config';

async function bootstrap() {
  const config = loadAppConfig();
  const app = await NestFactory.create(AppModule);

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
