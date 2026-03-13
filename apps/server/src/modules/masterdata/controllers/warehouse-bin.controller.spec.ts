import { PrismaService } from '../../../database/prisma.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { WarehouseBinController } from './warehouse-bin.controller';

describe('WarehouseBinController', () => {
  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockPrisma = {
    tenant: {
      findFirst: jest.fn(),
    },
    warehouse: {
      findFirst: jest.fn(),
    },
    warehouseBin: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  let controller: WarehouseBinController;

  beforeEach(() => {
    controller = new WarehouseBinController(
      mockPrisma as unknown as PrismaService,
      mockTenantContextService as unknown as TenantContextService,
    );

    mockPrisma.tenant.findFirst.mockResolvedValue({ id: BigInt(1001) });
    mockPrisma.warehouse.findFirst.mockResolvedValue({ id: BigInt(11) });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists warehouse bins', async () => {
    mockPrisma.warehouseBin.findMany.mockResolvedValue([
      {
        id: BigInt(201),
        tenantId: BigInt(1001),
        warehouseId: BigInt(11),
        binCode: 'A-01-01',
        binName: '成品货架 A-01-01',
        zoneCode: 'FG-A',
        binType: 'pick',
        status: 'active',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      },
    ]);

    const result = await controller.list('11', 'A-', undefined, 'true');

    expect(mockPrisma.warehouseBin.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      data: [
        {
          id: '201',
          tenantId: '1001',
          warehouseId: '11',
          code: 'A-01-01',
          name: '成品货架 A-01-01',
          binCode: 'A-01-01',
          binName: '成品货架 A-01-01',
          zoneCode: 'FG-A',
          binType: 'pick',
          status: 'active',
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-02T00:00:00.000Z',
        },
      ],
      total: 1,
    });
  });

  it('gets warehouse bin by id', async () => {
    mockPrisma.warehouseBin.findFirst.mockResolvedValue({
      id: BigInt(201),
      tenantId: BigInt(1001),
      warehouseId: BigInt(11),
      binCode: 'A-01-01',
      binName: '成品货架 A-01-01',
      zoneCode: 'FG-A',
      binType: 'pick',
      status: 'active',
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
    });

    const result = await controller.getById('201');

    expect(result).toEqual({
      id: '201',
      tenantId: '1001',
      warehouseId: '11',
      code: 'A-01-01',
      name: '成品货架 A-01-01',
      binCode: 'A-01-01',
      binName: '成品货架 A-01-01',
      zoneCode: 'FG-A',
      binType: 'pick',
      status: 'active',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });
  });

  it('creates warehouse bin', async () => {
    mockPrisma.warehouseBin.create.mockResolvedValue({
      id: BigInt(202),
      tenantId: BigInt(1001),
      warehouseId: BigInt(11),
      binCode: 'A-01-03',
      binName: '成品货架 A-01-03',
      zoneCode: 'FG-A',
      binType: 'pick',
      status: 'active',
      createdAt: new Date('2026-03-03T00:00:00.000Z'),
      updatedAt: new Date('2026-03-03T00:00:00.000Z'),
    });

    const result = await controller.create({
      warehouseId: '11',
      code: ' A-01-03 ',
      name: ' 成品货架 A-01-03 ',
      zoneCode: ' FG-A ',
      binType: ' pick ',
    });

    expect(mockPrisma.warehouseBin.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: BigInt(1001),
        warehouseId: BigInt(11),
        binCode: 'A-01-03',
        binName: '成品货架 A-01-03',
        zoneCode: 'FG-A',
        binType: 'pick',
        status: 'active',
        createdBy: 'user-001',
        updatedBy: 'user-001',
      }),
    });
    expect(result).toEqual({
      id: '202',
      tenantId: '1001',
      warehouseId: '11',
      code: 'A-01-03',
      name: '成品货架 A-01-03',
      binCode: 'A-01-03',
      binName: '成品货架 A-01-03',
      zoneCode: 'FG-A',
      binType: 'pick',
      status: 'active',
      createdAt: '2026-03-03T00:00:00.000Z',
      updatedAt: '2026-03-03T00:00:00.000Z',
    });
  });

  it('updates warehouse bin', async () => {
    mockPrisma.warehouseBin.findFirst.mockResolvedValue({
      id: BigInt(201),
      tenantId: BigInt(1001),
      warehouseId: BigInt(11),
      binCode: 'A-01-01',
      binName: '成品货架 A-01-01',
      zoneCode: 'FG-A',
      binType: 'pick',
      status: 'active',
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
    });
    mockPrisma.warehouseBin.update.mockResolvedValue({
      id: BigInt(201),
      tenantId: BigInt(1001),
      warehouseId: BigInt(11),
      binCode: 'A-01-01',
      binName: '成品货架 A-01-01-改',
      zoneCode: 'FG-B',
      binType: 'reserve',
      status: 'inactive',
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-04T00:00:00.000Z'),
    });

    const result = await controller.update('201', {
      name: ' 成品货架 A-01-01-改 ',
      zoneCode: ' FG-B ',
      binType: ' reserve ',
      status: 'inactive',
    });

    expect(mockPrisma.warehouseBin.update).toHaveBeenCalledWith({
      where: { id: BigInt(201) },
      data: {
        binName: '成品货架 A-01-01-改',
        zoneCode: 'FG-B',
        binType: 'reserve',
        status: 'inactive',
        updatedBy: 'user-001',
      },
    });
    expect(result).toEqual({
      id: '201',
      tenantId: '1001',
      warehouseId: '11',
      code: 'A-01-01',
      name: '成品货架 A-01-01-改',
      binCode: 'A-01-01',
      binName: '成品货架 A-01-01-改',
      zoneCode: 'FG-B',
      binType: 'reserve',
      status: 'inactive',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-04T00:00:00.000Z',
    });
  });

  it('deletes warehouse bin', async () => {
    mockPrisma.warehouseBin.updateMany.mockResolvedValue({ count: 1 });

    const result = await controller.remove('201');

    expect(mockPrisma.warehouseBin.updateMany).toHaveBeenCalledWith({
      where: {
        id: BigInt(201),
        tenantId: BigInt(1001),
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date),
        deletedBy: 'user-001',
        updatedBy: 'user-001',
      },
    });
    expect(result).toEqual({
      id: '201',
      deleted: true,
    });
  });
});
