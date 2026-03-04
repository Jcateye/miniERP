import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('默认')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '服务健康检查',
    description: '返回服务名称与运行状态，用于快速验证服务是否正常启动',
  })
  @ApiOkResponse({
    description: '服务正常运行',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            service: { type: 'string', example: 'miniERP-server' },
            status: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  getHello() {
    return this.appService.getHello();
  }
}
