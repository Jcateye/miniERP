import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WarehouseBinService } from './warehouse-bin.service';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('WarehouseBinService', () => {
  const mockTenantId = '1001';
  const mockActorId = 'user-001';

  const baseRow = {
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
  };

  let service: WarehouseBinService;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      warehouse: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(11) }),
      },
      warehouseBin: {
        create: jest.fn().mockResolvedValue(baseRow),
        findMany: jest.fn().mockResolvedValue([baseRow]),
        findFirst: jest.fn().mockResolvedValue(baseRow),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({
          ...baseRow,
          binName: '成品货架 A-01-01-改',
          zoneCode: 'FG-B',
          binType: 'reserve',
          status: 'inactive',
          updatedAt: new Date('2026-03-04T00:00:00.000Z'),
        }),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((fn: any) => fn(mockTx)),
    };

    service = new WarehouseBinService(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists warehouse bins', async () => {
    const result = await service.list(mockTenantId, {
      warehouseId: '11',
      code: 'A-',
      isActive: 'true',
    });

    expect(mockTx.warehouseBin.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: BigInt(1001),
          deletedAt: null,
          warehouseId: BigInt(11),
          status: 'active',
        }),
      }),
    );

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

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
    const result = await service.getById(mockTenantId, '201');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.warehouseBin.findFirst).toHaveBeenCalled();

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

  it('returns null when getById has invalid bigint id', async () => {
    const result = await service.getById(mockTenantId, 'not-a-bigint');

    expect(result).toBeNull();
    expect(mockPlatformDb.withTenantTx).not.toHaveBeenCalled();
  });

  it('creates warehouse bin', async () => {
    const result = await service.create(mockTenantId, mockActorId, {
      warehouseId: '11',
      code: 'A-01-03',
      name: '成品货架 A-01-03',
      zoneCode: 'FG-A',
      binType: 'pick',
      status: 'active',
    });

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.warehouse.findFirst).toHaveBeenCalled();
    expect(mockTx.warehouseBin.create).toHaveBeenCalled();

    expect(result.id).toBe('201');
  });

  it('throws when create has invalid warehouseId', async () => {
    await expect(
      service.create(mockTenantId, mockActorId, {
        warehouseId: 'x',
        code: 'A',
        name: 'N',
        status: 'active',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when list has invalid warehouseId', async () => {
    await expect(
      service.list(mockTenantId, {
        warehouseId: 'not-a-bigint',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when list has invalid isActive', async () => {
    await expect(
      service.list(mockTenantId, {
        isActive: 'yes',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates warehouse bin', async () => {
    const result = await service.update(mockTenantId, mockActorId, '201', {
      name: '成品货架 A-01-01-改',
      zoneCode: 'FG-B',
      binType: 'reserve',
      status: 'inactive',
    });

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.warehouseBin.findFirst).toHaveBeenCalled();
    expect(mockTx.warehouseBin.update).toHaveBeenCalled();

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

  it('throws NotFound when updating missing bin', async () => {
    mockTx.warehouseBin.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.update(mockTenantId, mockActorId, '999', {
        name: 'X',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes warehouse bin', async () => {
    const result = await service.remove(mockTenantId, mockActorId, '201');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.warehouseBin.updateMany).toHaveBeenCalled();
    expect(result).toEqual({ id: '201', deleted: true });
  });
});
