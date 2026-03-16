import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归（post 校验）：
// - OUT.post 必须有 warehouseId；缺失应 400 fail-fast
// - fail-fast：不调用 inventory posting、不更新状态、不写 outbox/log、也不记录 success 审计

describe('SalesShipmentWriteService.executeAction (warehouse required for post)', () => {
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
      outbound: {
        findFirst: jest.fn().mockResolvedValue({
          id: BigInt(1),
          tenantId: BigInt(1001),
          status: 'picking',
          warehouseId: null,
          deletedAt: null,
        }),
        updateMany: jest.fn(),
      },
      outboundLine: {
        findMany: jest.fn().mockResolvedValue([
          {
            lineNo: 1,
            skuId: BigInt(101),
            binId: BigInt(201),
            qty: { toString: () => '2' },
          },
        ]),
      },
      stateTransitionLog: {
        create: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
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

  it('throws 400 when OUT.post missing warehouseId (no side effects)', async () => {
    const thrown = await service
      .executeAction(
        'OUT',
        '1',
        'post',
        'idem-001',
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((err) => err);

    expect(thrown).toBeInstanceOf(HttpException);
    expect(thrown.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(thrown.getResponse()).toEqual(
      expect.objectContaining({
        code: 'VALIDATION_WAREHOUSE_ID_REQUIRED',
        category: 'validation',
      }),
    );

    // Phase1：依旧只有一次 withTenantTx（不自动重试）
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

    // fail-fast：不调用过账、不更新状态、不写 outbox/log
    expect(
      mockInventoryPostingService.postInTransaction,
    ).not.toHaveBeenCalled();
    expect(mockTx.outbound.updateMany).not.toHaveBeenCalled();
    expect(mockTx.stateTransitionLog.create).not.toHaveBeenCalled();
    expect(mockTx.outboxEvent.create).not.toHaveBeenCalled();

    // 失败不应记录 success 审计
    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'success',
      }),
    );
  });
});
