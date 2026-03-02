import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getLiveness() {
    return {
      data: {
        status: 'live',
      },
      message: 'Service is alive',
    };
  }

  getReadiness() {
    return {
      data: {
        status: 'ready',
      },
      message: 'Service is ready',
    };
  }
}
