import { describe, expect, it } from '@jest/globals';
import { PrismaInventoryConsistencyStore } from './prisma-inventory-consistency.store';
import { PlatformDbService } from '../../../database/platform-db.service';

function createPlatformDbMock(tx: unknown): PlatformDbService {
  return {
    withTenantTx: ((...args: any[]) => {
      const fn = args.length === 1 ? args[0] : args[1];
      return fn(tx);
    }) as PlatformDbService['withTenantTx'],
  } as PlatformDbService;
}

describe('PrismaInventoryConsistencyStore (tenant id resolver)', () => {
  it('fails closed when tenantId is unknown', async () => {
    const tx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      inventoryBalance: {
        findMany: jest.fn(),
      },
    };

    const store = new PrismaInventoryConsistencyStore(createPlatformDbMock(tx));

    await expect(
      store.getAllBalanceSnapshots('unknown-tenant'),
    ).rejects.toThrow('Unknown tenantId: unknown-tenant');
  });
});
