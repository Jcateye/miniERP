import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLive() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  async getReady() {
    const readiness = await this.healthService.getReadiness();

    if (readiness.data.status !== 'ready') {
      throw new ServiceUnavailableException(readiness.message);
    }

    return readiness;
  }
}
