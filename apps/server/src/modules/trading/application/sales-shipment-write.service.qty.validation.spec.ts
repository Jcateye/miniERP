import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归（库存过账数量校验）：
// - OUT.post 的 line.qty 必须是整数（string 化后匹配 ^-?\d+$）
// - 否则 400 fail-fast，并且不应产生后续副作用（不调用 inventory posting、不更新状态、不写 outbox/log、无 success 审计）

describe('SalesShipmentWriteService.executeAction (OUT post qty validation)', () => {
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
          warehouseId: BigInt(1),
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
            // Decimal-like: toString() -> '2.5'
            qty: { toString: () => '2.5' },
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

  it('throws 400 when outbound line qty is not an integer (e.g. 2.5)', async () => {
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
        code: 'VALIDATION_OUTBOUND_LINE_QTY_INVALID',
        category: 'validation',
      }),
    );

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

    expect(
      mockInventoryPostingService.postInTransaction,
    ).not.toHaveBeenCalled();
    expect(mockTx.outbound.updateMany).not.toHaveBeenCalled();
    expect(mockTx.stateTransitionLog.create).not.toHaveBeenCalled();
    expect(mockTx.outboxEvent.create).not.toHaveBeenCalled();

    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'success',
      }),
    );
  });
});
