import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { PrismaWarehouseRepository } from './prisma-warehouse.repository';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('PrismaWarehouseRepository', () => {
  const baseRow = {
    id: BigInt(41),
    tenantId: BigInt(1001),
    code: 'WH-001',
    name: 'Test Warehouse',
    address: null,
    contactPerson: null,
    contactPhone: null,
    manageBin: false,
    isActive: true,
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-02T00:00:00.000Z'),
  };

  let repo: PrismaWarehouseRepository;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      warehouse: {
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

    repo = new PrismaWarehouseRepository(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wraps all operations in withTenantTx', async () => {
    await repo.findById('1001', '41');
    await repo.findByCode('1001', 'WH-001');
    await repo.findAll('1001', { code: 'WH' });
    await repo.save('1001', {
      id: '41',
      code: 'WH-001',
      name: 'Test Warehouse',
      address: null,
      contactPerson: null,
      contactPhone: null,
      manageBin: false,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });
    await repo.update('1001', '41', { name: 'Updated' });
    await repo.delete('1001', '41');
    await repo.existsByCode('1001', 'WH-001');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(7);
    expect(mockTx.tenant.findFirst).toHaveBeenCalled();
    expect(mockTx.warehouse.findFirst).toHaveBeenCalled();
    expect(mockTx.warehouse.findMany).toHaveBeenCalled();
    expect(mockTx.warehouse.create).toHaveBeenCalled();
    expect(mockTx.warehouse.update).toHaveBeenCalled();
    expect(mockTx.warehouse.updateMany).toHaveBeenCalled();
    expect(mockTx.warehouse.count).toHaveBeenCalled();
  });
});
