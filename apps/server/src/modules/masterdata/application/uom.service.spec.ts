import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { UomService } from './uom.service';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('UomService', () => {
  const mockTenantId = '1001';

  const baseRow = {
    id: BigInt(11),
    tenantId: BigInt(1001),
    uomCode: 'PCS',
    uomName: '件',
    precision: 0,
    status: 'active',
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-02T00:00:00.000Z'),
  };

  let service: UomService;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      uom: {
        findMany: jest.fn().mockResolvedValue([baseRow]),
        findFirst: jest.fn().mockResolvedValue(baseRow),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((fn: any) => fn(mockTx)),
    };

    service = new UomService(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists uoms', async () => {
    const result = await service.list(mockTenantId, {
      code: 'PC',
      isActive: 'true',
    });

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.uom.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: BigInt(1001),
          deletedAt: null,
          uomCode: { contains: 'PC' },
          status: 'active',
        }),
      }),
    );

    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe('11');
  });

  it('gets uom by id', async () => {
    const result = await service.getById(mockTenantId, '11');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.uom.findFirst).toHaveBeenCalled();
    expect(result?.id).toBe('11');
  });

  it('returns null when getById has invalid bigint id', async () => {
    const result = await service.getById(mockTenantId, 'not-a-bigint');

    expect(result).toBeNull();
    expect(mockPlatformDb.withTenantTx).not.toHaveBeenCalled();
  });

  it('throws when list has invalid isActive', async () => {
    await expect(
      service.list(mockTenantId, {
        isActive: 'yes',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
