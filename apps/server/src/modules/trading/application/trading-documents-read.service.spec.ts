import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TradingDocumentsReadService } from './trading-documents-read.service';

// Phase1（read）回归：非法 id 不应抛 500（应返回 null，由 controller 映射为 404）

describe('TradingDocumentsReadService.getDetail', () => {
  const mockTenantId = '1001';

  let service: TradingDocumentsReadService;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
      },
      purchaseOrder: {
        findFirst: jest.fn(),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((fn: any) => fn(mockTx)),
    };

    service = new TradingDocumentsReadService(mockPlatformDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when id is invalid bigint (no prisma queries executed)', async () => {
    const result = await service.getDetail('PO', 'abc', mockTenantId);

    expect(result).toBeNull();
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);

    // tenantDbId resolve happens, but doc query should not
    expect(mockTx.tenant.findFirst).toHaveBeenCalledTimes(1);
    expect(mockTx.purchaseOrder.findFirst).not.toHaveBeenCalled();
  });
});
