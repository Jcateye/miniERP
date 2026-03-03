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
});
