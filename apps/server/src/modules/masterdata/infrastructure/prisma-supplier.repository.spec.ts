import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { PrismaSupplierRepository } from './prisma-supplier.repository';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('PrismaSupplierRepository', () => {
  const baseRow = {
    id: BigInt(31),
    tenantId: BigInt(1001),
    code: 'SUP-001',
    name: 'Test Supplier',
    contactName: null,
    phone: null,
    email: null,
    address: null,
    isActive: true,
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-02T00:00:00.000Z'),
  };

  let repo: PrismaSupplierRepository;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      supplier: {
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

    repo = new PrismaSupplierRepository(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wraps all operations in withTenantTx', async () => {
    await repo.findById('1001', '31');
    await repo.findByCode('1001', 'SUP-001');
    await repo.findAll('1001', { code: 'SUP' });
    await repo.save('1001', {
      id: '31',
      code: 'SUP-001',
      name: 'Test Supplier',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });
    await repo.update('1001', '31', { name: 'Updated' });
    await repo.delete('1001', '31');
    await repo.existsByCode('1001', 'SUP-001');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(7);
    expect(mockTx.tenant.findFirst).toHaveBeenCalled();
    expect(mockTx.supplier.findFirst).toHaveBeenCalled();
    expect(mockTx.supplier.findMany).toHaveBeenCalled();
    expect(mockTx.supplier.create).toHaveBeenCalled();
    expect(mockTx.supplier.update).toHaveBeenCalled();
    expect(mockTx.supplier.updateMany).toHaveBeenCalled();
    expect(mockTx.supplier.count).toHaveBeenCalled();
  });
});
