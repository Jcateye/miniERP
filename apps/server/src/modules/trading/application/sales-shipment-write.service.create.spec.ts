import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归（create）：
// - 业务写路径必须强制 withTenantTx
// - create 默认也必须走 Serializable（保护 docNo 分配 + 并发写一致性）
// - 不做自动重试：遇到 Prisma 写冲突/单号冲突，直接 fail-fast 并映射为 409

describe('SalesShipmentWriteService.create', () => {
  const mockTenantId = '1001';
  const mockActorId = 'user-001';
  const mockRequestId = 'req-001';

  let service: SalesShipmentWriteService;
  let mockTx: any;
  let mockPlatformDb: any;
  let mockAuditService: any;
  let mockInventoryPostingService: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      sku: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(101) }),
      },
      customer: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(301) }),
      },
      warehouse: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(11) }),
      },
      salesOrder: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: BigInt(1),
          docDate: new Date('2026-03-16T00:00:00.000Z'),
        }),
      },
      salesOrderLine: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((...args: any[]) => {
        const fn = typeof args[0] === 'function' ? args[0] : args[1];
        return fn(mockTx);
      }),
    };

    mockAuditService = {
      recordAuthorization: jest.fn(),
    };

    mockInventoryPostingService = {
      postInTransaction: jest.fn(),
    };

    service = new SalesShipmentWriteService(
      mockPlatformDb,
      mockAuditService,
      mockInventoryPostingService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs create in a single Serializable withTenantTx (SO)', async () => {
    const result = await service.create(
      'SO',
      {
        customerId: '301',
        warehouseId: '11',
        docDate: '2026-03-16',
        lines: [{ skuId: '101', qty: '2', unitPrice: '3' }],
      },
      mockTenantId,
      mockActorId,
      mockRequestId,
    );

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledWith(
      expect.objectContaining({ isolationLevel: 'Serializable' }),
      expect.any(Function),
    );

    // 侧面证明 tenantDbId 解析发生在 tx 内
    expect(mockTx.tenant.findFirst).toHaveBeenCalledTimes(1);

    expect(mockTx.salesOrder.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        docType: 'SO',
        status: 'draft',
        lineCount: 1,
      }),
    );
  });

  it('fails fast and maps P2034 write conflict to 409 (no retry)', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Write conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });

    mockTx.salesOrder.create.mockRejectedValue(error);

    const thrown = await service
      .create(
        'SO',
        {
          customerId: '301',
          warehouseId: '11',
          docDate: '2026-03-16',
          lines: [{ skuId: '101', qty: '2', unitPrice: '3' }],
        },
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((error) => error);

    expect(thrown).toBeInstanceOf(HttpException);
    const http = thrown as HttpException;
    expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(http.getResponse()).toMatchObject({
      category: 'conflict',
      code: 'CONFLICT_WRITE_CONFLICT',
    });

    // Phase1：冲突时不应产生 success 审计
    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalled();

    // Phase1：不自动重试
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.salesOrder.create).toHaveBeenCalledTimes(1);
  });

  it('fails fast and maps P2002(docNo unique) to 409 (no retry)', async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['tenantId', 'docNo'] },
      },
    );

    mockTx.salesOrder.create.mockRejectedValue(error);

    const thrown = await service
      .create(
        'SO',
        {
          customerId: '301',
          warehouseId: '11',
          docDate: '2026-03-16',
          lines: [{ skuId: '101', qty: '2', unitPrice: '3' }],
        },
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((err) => err);

    expect(thrown).toBeInstanceOf(HttpException);
    const http = thrown as HttpException;
    expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(http.getResponse()).toMatchObject({
      category: 'conflict',
      code: 'CONFLICT_DUPLICATE_DOC_NO',
    });

    // Phase1：冲突时不应产生 success 审计
    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalled();

    // Phase1：不自动重试
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.salesOrder.create).toHaveBeenCalledTimes(1);
  });
});
