import { TenantContextService } from './tenant-context.service';
import { tenantContextStorage } from './tenant-context';

describe('TenantContextService', () => {
  const service = new TenantContextService();

  it('throws when context is not available', () => {
    expect(() => service.getRequiredContext()).toThrow(
      'Tenant context is not available in current execution context',
    );
  });

  it('returns context when available in async storage', () => {
    tenantContextStorage.run(
      {
        tenantId: '1001',
        requestId: 'req-1',
        actorId: '2001',
      },
      () => {
        expect(service.getRequiredContext()).toEqual({
          tenantId: '1001',
          requestId: 'req-1',
          actorId: '2001',
        });
      },
    );
  });

  it('does not leak tenant context across concurrent runs', async () => {
    function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function resolveTenantId(tenantId: string): Promise<string> {
      return await new Promise((resolve, reject) => {
        tenantContextStorage.run(
          {
            tenantId,
            requestId: `req-${tenantId}`,
          },
          () => {
            void (async () => {
              try {
                await sleep(1);
                const first = service.getRequiredContext().tenantId;
                await sleep(1);
                const second = service.getRequiredContext().tenantId;
                resolve(`${first}/${second}`);
              } catch (error) {
                reject(
                  error instanceof Error ? error : new Error(String(error)),
                );
              }
            })();
          },
        );
      });
    }

    const results = await Promise.all(
      Array.from({ length: 100 }, (_, index) => resolveTenantId(`t${index}`)),
    );

    results.forEach((value, index) => {
      expect(value).toBe(`t${index}/t${index}`);
    });
  });
});
