import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { PurchaseInboundWriteService } from './purchase-inbound-write.service';

// Phase1 回归：一次 action 不应开启两次 withTenantTx
// - tenantDbId 的解析必须发生在同一个 tenant tx 内

describe('PurchaseInboundWriteService.executeAction', () => {
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
      purchaseOrder: {
        findFirst: jest.fn().mockResolvedValue({
          id: BigInt(1),
          tenantId: BigInt(1001),
          status: 'draft',
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      stateTransitionLog: {
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

    service = new PurchaseInboundWriteService(
      mockAuditService,
      mockInventoryPostingService,
      mockPlatformDb,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs confirm action in a single withTenantTx', async () => {
    const result = await service.executeAction(
      'PO',
      '1',
      'confirm',
      'idem-001',
      mockTenantId,
      mockActorId,
      mockRequestId,
    );

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

    const [confirmFirstArg] = (mockPlatformDb.withTenantTx as jest.Mock).mock
      .calls[0] as any[];

    // confirm 不应强制 Serializable（避免绑定 overload 形态）
    if (confirmFirstArg && typeof confirmFirstArg === 'object') {
      expect(confirmFirstArg).not.toMatchObject({
        isolationLevel: 'Serializable',
      });
    }

    // 侧面证明 tenantDbId 解析发生在 tx 内
    expect(mockTx.tenant.findFirst).toHaveBeenCalledTimes(1);

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        docType: 'PO',
        documentId: '1',
        previousStatus: 'draft',
        newStatus: 'confirmed',
        action: 'confirm',
      }),
    );
  });

  it('runs post action in a single Serializable withTenantTx', async () => {
    mockTx.grn = {
      findFirst: jest.fn().mockResolvedValue({
        id: BigInt(1),
        tenantId: BigInt(1001),
        status: 'validating',
        warehouseId: BigInt(11),
        poId: null,
        docNo: 'DOC-GRN-20260316-0001',
      }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    mockTx.grnLine = {
      findMany: jest.fn().mockResolvedValue([
        {
          lineNo: 1,
          skuId: BigInt(101),
          binId: BigInt(201),
          qty: { toString: () => '1' },
        },
      ]),
    };
    mockTx.outboxEvent = {
      create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
    };

    mockInventoryPostingService.postInTransaction.mockResolvedValue({
      ledgerEntries: [{ id: 'le-001' }],
    });

    const result = await service.executeAction(
      'GRN',
      '1',
      'post',
      'idem-002',
      mockTenantId,
      mockActorId,
      mockRequestId,
    );

    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledWith(
      expect.objectContaining({ isolationLevel: 'Serializable' }),
      expect.any(Function),
    );

    // 侧面证明 tenantDbId 解析发生在 tx 内（与 confirm 一致）
    expect(mockTx.tenant.findFirst).toHaveBeenCalledTimes(1);

    expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalledTimes(
      1,
    );
    expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalledWith(
      mockTenantId,
      expect.objectContaining({
        idempotencyKey: 'idem-002',
        referenceType: 'GRN',
        referenceId: '1',
      }),
      mockRequestId,
      expect.anything(),
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        docType: 'GRN',
        documentId: '1',
        previousStatus: 'validating',
        newStatus: 'posted',
        action: 'post',
        inventoryPosted: true,
      }),
    );
  });

  it('fails fast when inventory posting fails (no retry, no outbox, no status update)', async () => {
    mockTx.grn = {
      findFirst: jest.fn().mockResolvedValue({
        id: BigInt(1),
        tenantId: BigInt(1001),
        status: 'validating',
        warehouseId: BigInt(11),
        poId: null,
        docNo: 'DOC-GRN-20260316-0001',
      }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    mockTx.grnLine = {
      findMany: jest.fn().mockResolvedValue([
        {
          lineNo: 1,
          skuId: BigInt(101),
          binId: BigInt(201),
          qty: { toString: () => '1' },
        },
      ]),
    };
    mockTx.outboxEvent = {
      create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
    };

    const inventoryError = new Error('inventory failed');
    mockInventoryPostingService.postInTransaction.mockRejectedValue(
      inventoryError,
    );

    await expect(
      service.executeAction(
        'GRN',
        '1',
        'post',
        'idem-003',
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
    expect(mockTx.grn.updateMany).not.toHaveBeenCalled();
    expect(mockTx.stateTransitionLog.create).not.toHaveBeenCalled();
    expect(mockTx.outboxEvent.create).not.toHaveBeenCalled();
  });
});
