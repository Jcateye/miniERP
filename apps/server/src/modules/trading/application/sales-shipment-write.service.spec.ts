import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归：
// - post action 必须 Serializable
// - inventory posting 失败时 fail-fast（不重试、不产生后续副作用）
// - 一次 action 只允许一次 withTenantTx

describe('SalesShipmentWriteService.executeAction', () => {
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
          warehouseId: BigInt(11),
          deletedAt: null,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
        create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
      },
      outboxEvent: {
        create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
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

  it('runs post action in a single Serializable withTenantTx', async () => {
    mockInventoryPostingService.postInTransaction.mockResolvedValue({
      ledgerEntries: [{ id: 'le-001' }],
    });

    const result = await service.executeAction(
      'OUT',
      '1',
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

    // 侧面证明 tenantDbId 解析发生在 tx 内
    expect(mockTx.tenant.findFirst).toHaveBeenCalledTimes(1);

    expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalledTimes(
      1,
    );
    expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalledWith(
      mockTenantId,
      expect.objectContaining({
        idempotencyKey: 'idem-001',
        referenceType: 'OUT',
        referenceId: '1', // BigInt("1") 归一化为 "1"
      }),
      mockRequestId,
      expect.anything(),
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        docType: 'OUT',
        documentId: '1',
        previousStatus: 'picking',
        newStatus: 'posted',
        action: 'post',
        inventoryPosted: true,
      }),
    );

    expect(mockAuditService.recordAuthorization).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: mockRequestId,
        tenantId: mockTenantId,
        actorId: mockActorId,
        action: 'document.post',
        entityType: 'document',
        entityId: '1',
        result: 'success',
        metadata: expect.objectContaining({
          docType: 'OUT',
          previousStatus: 'picking',
          newStatus: 'posted',
          inventoryPosted: true,
          ledgerEntryIds: ['le-001'],
        }),
      }),
    );

    expect(mockTx.outbound.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('fails fast when inventory posting fails (no retry, no outbox, no status update)', async () => {
    const inventoryError = new Error('inventory failed');
    mockInventoryPostingService.postInTransaction.mockRejectedValue(
      inventoryError,
    );

    await expect(
      service.executeAction(
        'OUT',
        '1',
        'post',
        'idem-002',
        mockTenantId,
        mockActorId,
        mockRequestId,
      ),
    ).rejects.toBe(inventoryError);

    // Phase1：不自动重试
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalledTimes(
      1,
    );

    // 失败应停止在过账阶段，不产生后续副作用
    expect(mockTx.outbound.updateMany).not.toHaveBeenCalled();
    expect(mockTx.stateTransitionLog.create).not.toHaveBeenCalled();
    expect(mockTx.outboxEvent.create).not.toHaveBeenCalled();

    // Phase1：冲突/失败时不应产生 success 审计
    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'success',
        action: 'document.post',
      }),
    );
  });
});
