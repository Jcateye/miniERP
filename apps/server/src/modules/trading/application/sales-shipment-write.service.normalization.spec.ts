import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { SalesShipmentWriteService } from './sales-shipment-write.service';

// Phase1 回归（id 归一化）：
// - 输入 "001" 应归一化为 "1"，并贯穿：
//   - DocumentActionResult.documentId
//   - InventoryPosting.referenceId
//   - success audit entityId

describe('SalesShipmentWriteService.executeAction (normalized documentId)', () => {
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

  it('normalizes "001" to "1" across result + inventory referenceId + audit entityId', async () => {
    mockInventoryPostingService.postInTransaction.mockResolvedValue({
      ledgerEntries: [{ id: 'le-001' }],
    });

    const result = await service.executeAction(
      'OUT',
      '001',
      'post',
      'idem-001',
      mockTenantId,
      mockActorId,
      mockRequestId,
    );

    expect(result.documentId).toBe('1');

    expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalledWith(
      mockTenantId,
      expect.objectContaining({
        referenceType: 'OUT',
        referenceId: '1',
      }),
      mockRequestId,
      expect.anything(),
    );

    expect(mockAuditService.recordAuthorization).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'document.post',
        result: 'success',
        entityId: '1',
      }),
    );
  });
});
