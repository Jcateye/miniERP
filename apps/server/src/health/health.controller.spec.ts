import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  const mockHealthService = {
    getLiveness: jest.fn(),
    getReadiness: jest.fn(),
  } as unknown as jest.Mocked<HealthService>;

  const controller = new HealthController(mockHealthService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns readiness payload when service is ready', async () => {
    const readiness = {
      data: {
        status: 'ready',
        dependencies: [
          { name: 'database', status: 'up' },
          { name: 'redis', status: 'up' },
        ],
      },
      message: 'Service is ready',
    };

    mockHealthService.getReadiness.mockResolvedValue(readiness);

    await expect(controller.getReady()).resolves.toEqual(readiness);
  });

  it('throws ServiceUnavailableException when service is not ready', async () => {
    mockHealthService.getReadiness.mockResolvedValue({
      data: {
        status: 'not_ready',
        dependencies: [
          { name: 'database', status: 'down', error: 'connect ECONNREFUSED 127.0.0.1:5432' },
          { name: 'redis', status: 'up' },
        ],
      },
      message: 'Service is not ready',
    });

    await expect(controller.getReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
