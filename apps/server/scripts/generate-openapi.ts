/**
 * OpenAPI 文档生成脚本
 *
 * 运行方式：bun run --filter server openapi:generate
 * 输出文件：apps/server/openapi.json
 *
 * 注意：此脚本需要 DATABASE_URL 和 REDIS_URL 环境变量。
 * CI 环境可设置占位值：DATABASE_URL=postgresql://localhost:5432/test REDIS_URL=redis://localhost:6379
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function generateOpenApi() {
  // 为 OpenAPI 生成提供最小环境变量（仅用于文档生成，不会实际连接数据库）
  process.env.DATABASE_URL ??= 'postgresql://localhost:5432/minierp';
  process.env.REDIS_URL ??= 'redis://localhost:6379';
  process.env.AUTH_CONTEXT_SECRET ??= 'openapi-generation-secret';
  process.env.NODE_ENV ??= 'development';

  // 动态导入以使用上述环境变量
  const { loadAppConfig } = await import('../src/config/app.config');
  const config = loadAppConfig();
  const app = await NestFactory.create(AppModule);

  if (config.globalPrefix.length > 0) {
    app.setGlobalPrefix(config.globalPrefix);
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('miniERP API')
    .setDescription('miniERP 后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const outputPath = path.resolve(__dirname, '../openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');

  console.log(`OpenAPI 文档已生成: ${outputPath}`);

  await app.close();
}

generateOpenApi().catch((error) => {
  console.error('生成 OpenAPI 文档失败:', error);
  process.exit(1);
});
