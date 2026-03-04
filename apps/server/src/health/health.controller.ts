import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOperation({
    summary: '存活探针',
    description:
      'Kubernetes 存活探针接口，返回服务是否存活。如果响应 200 则服务正在运行。',
  })
  @ApiOkResponse({
    description: '服务存活',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'live' },
          },
        },
        message: { type: 'string', example: 'Service is alive' },
      },
    },
  })
  getLive() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({
    summary: '就绪探针',
    description:
      'Kubernetes 就绪探针接口，检查服务依赖（数据库、Redis 等）是否可用。只有所有依赖正常时才返回 200。',
  })
  @ApiOkResponse({
    description: '服务就绪，所有依赖正常',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ready' },
            dependencies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'database' },
                  status: { type: 'string', example: 'up' },
                },
              },
            },
          },
        },
        message: { type: 'string', example: 'Service is ready' },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: '服务未就绪，部分依赖不可用',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 503 },
        message: { type: 'string', example: 'Service is not ready' },
      },
    },
  })
  async getReady() {
    const readiness = await this.healthService.getReadiness();

    if (readiness.data.status !== 'ready') {
      throw new ServiceUnavailableException(readiness.message);
    }

    return readiness;
  }
}
