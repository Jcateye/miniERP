import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { InvalidStatusTransitionError } from '../../core-document/domain/status-transition';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归（executeAction 非 post 分支）：
// - 业务写路径必须强制 withTenantTx
// - 非 post 分支也必须 CAS（updateMany + previousStatus）保护并发
// - CAS 丢失时应抛 InvalidStatusTransitionError
// - CAS 失败时不应记录 success 审计

describe('SalesShipmentWriteService.executeAction (CAS, non-post)', () => {
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
          status: 'draft',
          deletedAt: null,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
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

  it('throws InvalidStatusTransitionError when CAS is lost (OUT cancel)', async () => {
    const thrown = await service
      .executeAction(
        'OUT',
        '1',
        'cancel',
        'idem-001',
        mockTenantId,
        mockActorId,
        mockRequestId,
      )
      .catch((err) => err);

    expect(thrown).toBeInstanceOf(InvalidStatusTransitionError);

    // Phase1：不自动重试
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

    // CAS 保护：必须走 updateMany（而不是 update）
    expect(mockTx.outbound.updateMany).toHaveBeenCalledTimes(1);

    // Phase1：CAS 失败不应记录 success 审计
    expect(mockAuditService.recordAuthorization).not.toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'success',
        action: 'document.cancel',
      }),
    );

    // Phase1：CAS/状态冲突应记录 deny（事务外）
    expect(mockAuditService.recordAuthorization).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: mockRequestId,
        tenantId: mockTenantId,
        actorId: mockActorId,
        action: 'document.cancel',
        entityType: 'document',
        entityId: '1', // deny 审计使用 error.details.entity_id（已归一化）
        result: 'deny',
        reason: 'INVALID_STATUS_TRANSITION',
        metadata: expect.objectContaining({
          docType: 'OUT',
          fromStatus: 'draft',
          toStatus: 'cancelled',
        }),
      }),
    );
  });
});
