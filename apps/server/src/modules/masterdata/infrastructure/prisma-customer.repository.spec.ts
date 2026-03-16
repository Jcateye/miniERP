import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { PrismaCustomerRepository } from './prisma-customer.repository';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('PrismaCustomerRepository', () => {
  const baseRow = {
    id: BigInt(21),
    tenantId: BigInt(1001),
    code: 'CUST-001',
    name: 'Test Customer',
    contactName: null,
    phone: null,
    email: null,
    address: null,
    isActive: true,
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-02T00:00:00.000Z'),
  };

  let repo: PrismaCustomerRepository;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      customer: {
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

    repo = new PrismaCustomerRepository(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wraps all operations in withTenantTx', async () => {
    await repo.findById('1001', '21');
    await repo.findByCode('1001', 'CUST-001');
    await repo.findAll('1001', { code: 'CUST' });
    await repo.save('1001', {
      id: '21',
      code: 'CUST-001',
      name: 'Test Customer',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });
    await repo.update('1001', '21', { name: 'Updated' });
    await repo.delete('1001', '21');
    await repo.existsByCode('1001', 'CUST-001');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(7);
    expect(mockTx.tenant.findFirst).toHaveBeenCalled();
    expect(mockTx.customer.findFirst).toHaveBeenCalled();
    expect(mockTx.customer.findMany).toHaveBeenCalled();
    expect(mockTx.customer.create).toHaveBeenCalled();
    expect(mockTx.customer.update).toHaveBeenCalled();
    expect(mockTx.customer.updateMany).toHaveBeenCalled();
    expect(mockTx.customer.count).toHaveBeenCalled();
  });
});
