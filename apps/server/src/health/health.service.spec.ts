import { HealthService } from './health.service';

describe('HealthService', () => {
  const databaseUrl = 'postgres://user:pass@127.0.0.1:5432/minierp';
  const redisUrl = 'redis://127.0.0.1:6379';

  function createServiceWithProbeResult(isUp: boolean): HealthService {
    const service = new HealthService(databaseUrl, redisUrl);

    jest
      .spyOn(service as unknown as { probeTcpConnection: (endpoint: unknown) => Promise<void> }, 'probeTcpConnection')
      .mockImplementation(() => {
        if (isUp) {
          return Promise.resolve();
        }

        return Promise.reject(new Error('connect ECONNREFUSED 127.0.0.1'));
      });

    return service;
  }

  it('returns ready when database and redis checks pass', async () => {
    const service = createServiceWithProbeResult(true);

    const readiness = await service.getReadiness();

    expect(readiness.data.status).toBe('ready');
    expect(readiness.message).toBe('Service is ready');
    expect(readiness.data.dependencies).toEqual([
      { name: 'database', status: 'up' },
      { name: 'redis', status: 'up' },
    ]);
  });

  it('returns not_ready when any dependency check fails', async () => {
    const service = createServiceWithProbeResult(false);

    const readiness = await service.getReadiness();

    expect(readiness.data.status).toBe('not_ready');
    expect(readiness.message).toBe('Service is not ready');
    expect(readiness.data.dependencies[0]).toEqual({
      name: 'database',
      status: 'down',
      error: 'connect ECONNREFUSED 127.0.0.1',
    });
    expect(readiness.data.dependencies[1]).toEqual({
      name: 'redis',
      status: 'down',
      error: 'connect ECONNREFUSED 127.0.0.1',
    });
  });

  it('resolves default port from protocol when URL has no explicit port', async () => {
    const service = new HealthService('postgres://user:pass@db-host/minierp', 'redis://cache-host');
    const probeSpy = jest
      .spyOn(service as unknown as { probeTcpConnection: (endpoint: unknown) => Promise<void> }, 'probeTcpConnection')
      .mockResolvedValue();

    await service.getReadiness();

    expect(probeSpy).toHaveBeenNthCalledWith(1, {
      host: 'db-host',
      port: 5432,
    });
    expect(probeSpy).toHaveBeenNthCalledWith(2, {
      host: 'cache-host',
      port: 6379,
    });
  });

  it('marks dependency down when URL protocol has no default port and no explicit port', async () => {
    const service = new HealthService('custom://db-host/path', 'custom://cache-host/path');

    const readiness = await service.getReadiness();

    expect(readiness.data.status).toBe('not_ready');
    expect(readiness.data.dependencies[0]).toEqual({
      name: 'database',
      status: 'down',
      error: 'Unsupported protocol without explicit port: custom:',
    });
    expect(readiness.data.dependencies[1]).toEqual({
      name: 'redis',
      status: 'down',
      error: 'Unsupported protocol without explicit port: custom:',
    });
  });

  it('returns live status for liveness endpoint', () => {
    const service = new HealthService(databaseUrl, redisUrl);

    expect(service.getLiveness()).toEqual({
      data: {
        status: 'live',
      },
      message: 'Service is alive',
    });
  });
});
