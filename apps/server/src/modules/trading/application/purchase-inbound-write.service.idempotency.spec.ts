import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PurchaseInboundWriteService } from './purchase-inbound-write.service';

// Phase1 回归（executeAction 重放语义 - GRN）：
// - post 重放（状态已是 posted）不应返回 deny，而应幂等返回 success
// - posted 但库存台账缺失必须 409
// - 不做自动重试：仍然只允许一次 withTenantTx

describe('PurchaseInboundWriteService.executeAction (idempotent replay)', () => {
  const mockTenantId = '1001';
  const mockActorId = 'user-001';
  const mockRequestId = 'req-001';

  let service: PurchaseInboundWriteService;
  let mockTx: any;
  let mockPlatformDb: any;
  let mockAuditService: any;
  let mockInventoryPostingService: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      grn: {
        findFirst: jest.fn().mockResolvedValue({
          id: BigInt(1),
          tenantId: BigInt(1001),
          status: 'posted',
          warehouseId: BigInt(11),
          poId: null,
          docNo: 'DOC-GRN-20260316-0001',
          deletedAt: null,
        }),
        updateMany: jest.fn(),
      },
      inventoryLedger: {
        findMany: jest.fn().mockResolvedValue([{ id: BigInt(9001) }]),
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

    service = new PurchaseInboundWriteService(
      mockAuditService,
      mockInventoryPostingService,
      mockPlatformDb,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns success for post replay when status already posted (no deny)', async () => {
    const result = await service.executeAction(
      'GRN',
      '001',
      'post',
      'idem-001',
      mockTenantId,
      mockActorId,
      mockRequestId,
    );

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledWith(
      expect.objectContaining({ isolationLevel: 'Serializable' }),
      expect.any(Function),
    );

    expect(
      mockInventoryPostingService.postInTransaction,
    ).not.toHaveBeenCalled();
    expect(mockTx.grn.updateMany).not.toHaveBeenCalled();
    expect(mockTx.outboxEvent.create).not.toHaveBeenCalled();
    expect(mockTx.stateTransitionLog.create).not.toHaveBeenCalled();

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        docType: 'GRN',
        documentId: '1', // 输入 "001" 归一化后仍为 "1"
        previousStatus: 'posted',
        newStatus: 'posted',
        action: 'post',
        inventoryPosted: true,
        ledgerEntryIds: ['9001'],
      }),
    );

    expect(mockAuditService.recordAuthorization).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'success',
      }),
    );

    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'deny',
      }),
    );
  });

  it('throws 409 when status already posted but inventory ledger is missing', async () => {
    mockTx.inventoryLedger.findMany.mockResolvedValueOnce([]);

    const thrown = await service
      .executeAction(
        'GRN',
        '1',
        'post',
        'idem-002',
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((err) => err);

    expect(thrown).toBeInstanceOf(HttpException);
    expect((thrown as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
    expect((thrown as HttpException).getResponse()).toEqual(
      expect.objectContaining({
        code: 'CONSISTENCY_INVENTORY_LEDGER_MISSING',
        category: 'consistency',
      }),
    );

    expect(
      mockInventoryPostingService.postInTransaction,
    ).not.toHaveBeenCalled();
    expect(mockTx.grn.updateMany).not.toHaveBeenCalled();
    expect(mockTx.outboxEvent.create).not.toHaveBeenCalled();
    expect(mockTx.stateTransitionLog.create).not.toHaveBeenCalled();

    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'success',
      }),
    );
  });

  it('throws 400 when Idempotency-Key is missing for post', async () => {
    const thrown = await service
      .executeAction(
        'GRN',
        '1',
        'post',
        '   ',
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((err) => err);

    expect(thrown).toBeInstanceOf(HttpException);
    expect((thrown as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect((thrown as HttpException).getResponse()).toEqual(
      expect.objectContaining({
        code: 'VALIDATION_IDEMPOTENCY_KEY_REQUIRED',
        category: 'validation',
      }),
    );

    expect(mockPlatformDb.withTenantTx).not.toHaveBeenCalled();
  });
});
