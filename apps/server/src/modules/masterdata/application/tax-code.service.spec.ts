import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { TaxCodeService } from './tax-code.service';
import type { PlatformDbService } from '../../../database/platform-db.service';

describe('TaxCodeService', () => {
  const mockTenantId = '1001';

  const baseRow = {
    id: BigInt(1013),
    tenantId: BigInt(1001),
    taxCode: 'VAT13',
    taxName: '增值税 13%',
    taxType: 'vat',
    rate: { toString: () => '13.00' },
    inclusive: false,
    jurisdiction: null,
    status: 'active',
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-02T00:00:00.000Z'),
  };

  let service: TaxCodeService;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      taxCode: {
        findMany: jest.fn().mockResolvedValue([baseRow]),
        findFirst: jest.fn().mockResolvedValue(baseRow),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((fn: any) => fn(mockTx)),
    };

    service = new TaxCodeService(mockPlatformDb as PlatformDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists tax codes', async () => {
    const result = await service.list(mockTenantId, {
      code: 'VAT',
      isActive: 'true',
    });

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.taxCode.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: BigInt(1001),
          deletedAt: null,
          taxCode: { contains: 'VAT' },
          status: 'active',
        }),
      }),
    );

    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe('1013');
  });

  it('gets tax code by id', async () => {
    const result = await service.getById(mockTenantId, '1013');

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.taxCode.findFirst).toHaveBeenCalled();
    expect(result?.id).toBe('1013');
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
