import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归（executeAction 重放/校验负向用例）：
// - post 重放：如果状态已 posted 但 ledger 缺失，应抛 409（consistency）
// - post 必须要求 Idempotency-Key：缺失/空白应抛 400（validation）

describe('SalesShipmentWriteService.executeAction (idempotent replay, negative cases)', () => {
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
          status: 'posted',
          warehouseId: BigInt(11),
          deletedAt: null,
        }),
        updateMany: jest.fn(),
      },
      inventoryLedger: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      outboxEvent: {
        create: jest.fn(),
      },
      stateTransitionLog: {
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

  it('throws 409 when status already posted but inventory ledger is missing', async () => {
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

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

    expect(thrown).toBeInstanceOf(HttpException);
    expect(thrown.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(thrown.getResponse()).toEqual(
      expect.objectContaining({
        code: 'CONSISTENCY_INVENTORY_LEDGER_MISSING',
        category: 'consistency',
      }),
    );

    // 重放失败也不应记录 success 审计
    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'success',
      }),
    );
  });

  it('throws 400 when post action misses Idempotency-Key', async () => {
    await expect(
      service.executeAction(
        'OUT',
        '1',
        'post',
        '',
        mockTenantId,
        mockActorId,
        mockRequestId,
      ),
    ).rejects.toMatchObject({
      getStatus: expect.any(Function),
      getResponse: expect.any(Function),
    });

    const thrown = await service
      .executeAction(
        'OUT',
        '1',
        'post',
        '   ',
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((err) => err);

    expect(thrown).toBeInstanceOf(HttpException);
    expect(thrown.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(thrown.getResponse()).toEqual(
      expect.objectContaining({
        code: 'VALIDATION_IDEMPOTENCY_KEY_REQUIRED',
        category: 'validation',
      }),
    );

    // 这类输入校验应直接 fail-fast，不应进入 tx
    expect(mockPlatformDb.withTenantTx).not.toHaveBeenCalled();
  });
});
