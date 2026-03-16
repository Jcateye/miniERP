import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { PrismaSkuRepository } from './prisma-sku.repository';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('PrismaSkuRepository', () => {
  const decimal = (value: string) => ({ toString: () => value });

  const baseRow = {
    id: BigInt(11),
    tenantId: BigInt(1001),
    skuCode: 'SKU-001',
    name: 'Test SKU',
    specification: null,
    categoryId: null,
    unit: 'PCS',
    itemType: null,
    taxCodeId: null,
    taxRate: decimal('13.00'),
    barcode: null,
    batchManaged: false,
    serialManaged: false,
    shelfLifeDays: null,
    minStockQty: decimal('1'),
    maxStockQty: decimal('10'),
    leadTimeDays: null,
    isActive: true,
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-02T00:00:00.000Z'),
  };

  let repo: PrismaSkuRepository;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      sku: {
        findFirst: jest.fn().mockResolvedValue(baseRow),
        findMany: jest.fn().mockResolvedValue([baseRow]),
        create: jest.fn().mockResolvedValue(baseRow),
        update: jest.fn().mockResolvedValue(baseRow),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((fn: any) => fn(mockTx)),
    };

    repo = new PrismaSkuRepository(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wraps all operations in withTenantTx', async () => {
    await repo.findById('1001', '11');
    await repo.findByCode('1001', 'SKU-001');
    await repo.findAll('1001', { code: 'SKU' });
    await repo.save('1001', {
      id: '11',
      code: 'SKU-001',
      name: 'Test SKU',
      specification: null,
      baseUnit: 'PCS',
      categoryId: null,
      itemType: null,
      taxCodeId: null,
      taxRate: '13.00',
      barcode: null,
      batchManaged: false,
      serialManaged: false,
      shelfLifeDays: null,
      minStockQty: '1',
      maxStockQty: '10',
      leadTimeDays: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });
    await repo.update('1001', '11', { name: 'Updated' });
    await repo.delete('1001', '11');
    await repo.existsByCode('1001', 'SKU-001');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(7);
    expect(mockTx.tenant.findFirst).toHaveBeenCalled();
    expect(mockTx.sku.findFirst).toHaveBeenCalled();
    expect(mockTx.sku.findMany).toHaveBeenCalled();
    expect(mockTx.sku.create).toHaveBeenCalled();
    expect(mockTx.sku.update).toHaveBeenCalled();
    expect(mockTx.sku.updateMany).toHaveBeenCalled();
    expect(mockTx.sku.count).toHaveBeenCalled();
  });
});
