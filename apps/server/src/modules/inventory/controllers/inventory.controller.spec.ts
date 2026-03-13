import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryPostingService } from '../application/inventory-posting.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InventoryInsufficientStockError } from '../domain/inventory.errors';

describe('InventoryController', () => {
  let controller: InventoryController;

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue({
      tenantId: '1001',
      actorId: 'user-001',
      requestId: 'req-001',
    }),
  };

  const mockInventoryPostingService = {
    getBalanceSnapshot: jest.fn(),
    post: jest.fn(),
  };

  const mockInventoryStore = {
    getAllBalanceSnapshots: jest.fn(),
    getAllLedgerEntries: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryPostingService,
          useValue: mockInventoryPostingService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
        {
          provide: 'InventoryConsistencyStore',
          useValue: mockInventoryStore,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return filtered balances when skuId and warehouseId provided', async () => {
    mockInventoryPostingService.getBalanceSnapshot.mockResolvedValue([
      { skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, onHand: 20 },
    ]);

    const result = await controller.getBalances('SKU-1', 'WH-1');

    expect(mockInventoryPostingService.getBalanceSnapshot).toHaveBeenCalledWith(
      '1001',
      [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: null }],
    );
    expect(result).toEqual({
      data: [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, onHand: 20 }],
      total: 1,
    });
  });

  it('should post inbound movement and return latest balance', async () => {
    mockInventoryPostingService.post.mockResolvedValue({
      ledgerEntries: [
        {
          id: '1',
          tenantId: '1001',
          skuId: 'SKU-1',
          warehouseId: 'WH-1',
          binId: null,
          quantityDelta: 100,
          referenceType: 'GRN',
          referenceId: 'DOC-GRN-20260312-000001',
          postedAt: '2026-03-12T10:00:00.000Z',
          reversalOfLedgerId: null,
        },
      ],
      balanceSnapshots: [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, onHand: 100 }],
    });

    const result = await controller.createInbound('idem-in-1', {
      skuId: 'SKU-1',
      warehouseId: 'WH-1',
      quantity: 100,
    });

    expect(mockInventoryPostingService.post).toHaveBeenCalledWith(
      '1001',
      expect.objectContaining({
        idempotencyKey: 'idem-in-1',
        referenceType: 'GRN',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, quantityDelta: 100 }],
        referenceId: expect.stringMatching(/^DOC-GRN-\d{8}-\d{6}$/),
      }),
      'req-001',
    );
    expect(result).toEqual({
      movementType: 'INBOUND',
      referenceType: 'GRN',
      referenceId: expect.stringMatching(/^DOC-GRN-\d{8}-\d{6}$/),
      quantity: 100,
      ledgerEntries: [
        expect.objectContaining({
          skuId: 'SKU-1',
          warehouseId: 'WH-1',
          binId: null,
          quantityDelta: 100,
        }),
      ],
      balance: { skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, onHand: 100 },
    });
  });

  it('should post outbound movement as negative quantity', async () => {
    mockInventoryPostingService.post.mockResolvedValue({
      ledgerEntries: [
        {
          id: '2',
          tenantId: '1001',
          skuId: 'SKU-1',
          warehouseId: 'WH-1',
          binId: null,
          quantityDelta: -30,
          referenceType: 'OUT',
          referenceId: 'DOC-OUT-20260312-000001',
          postedAt: '2026-03-12T10:05:00.000Z',
          reversalOfLedgerId: null,
        },
      ],
      balanceSnapshots: [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, onHand: 70 }],
    });

    const result = await controller.createOutbound('idem-out-1', {
      skuId: 'SKU-1',
      warehouseId: 'WH-1',
      quantity: 30,
    });

    expect(mockInventoryPostingService.post).toHaveBeenCalledWith(
      '1001',
      expect.objectContaining({
        idempotencyKey: 'idem-out-1',
        referenceType: 'OUT',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, quantityDelta: -30 }],
        referenceId: expect.stringMatching(/^DOC-OUT-\d{8}-\d{6}$/),
      }),
      'req-001',
    );
    expect(result.balance.onHand).toBe(70);
  });

  it('should require idempotency key for movement posting', async () => {
    await expect(
      controller.createInbound(undefined, {
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        quantity: 100,
      }),
    ).rejects.toThrow('Idempotency-Key header is required');
  });

  it('should map insufficient stock to conflict exception with details', async () => {
    mockInventoryPostingService.post.mockRejectedValue(
      new InventoryInsufficientStockError('SKU-1', 'WH-1', null, 70, 80),
    );

    try {
      await controller.createOutbound('idem-out-2', {
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        quantity: 80,
      });
      throw new Error('expected conflict exception');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      const response = (error as ConflictException).getResponse() as {
        readonly message: string;
        readonly code: string;
        readonly details: Record<string, unknown>;
      };
      expect(response.message).toBe('库存不足');
      expect(response.code).toBe('CONFLICT_INSUFFICIENT_STOCK');
      expect(response.details).toEqual({
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        binId: null,
        available: 70,
        required: 80,
      });
    }
  });

  it('should return all balances when no filters provided', async () => {
    mockInventoryStore.getAllBalanceSnapshots.mockResolvedValue([
      { skuId: 'SKU-1', warehouseId: 'WH-1', binId: null, onHand: 20 },
      { skuId: 'SKU-2', warehouseId: 'WH-1', binId: null, onHand: 10 },
    ]);

    const result = await controller.getBalances();

    expect(mockInventoryStore.getAllBalanceSnapshots).toHaveBeenCalledWith(
      '1001',
    );
    expect(result.total).toBe(2);
  });

  it('should reject partial balance filter', async () => {
    await expect(controller.getBalances('SKU-1')).rejects.toThrow(
      'warehouseId is required when skuId is provided',
    );
  });

  it('should return paginated ledger entries', async () => {
    mockInventoryStore.getAllLedgerEntries.mockResolvedValue([
      {
        id: '2',
        tenantId: '1001',
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        binId: null,
        quantityDelta: -2,
        referenceType: 'OUT',
        referenceId: 'OUT-1',
        postedAt: '2026-03-05T11:00:00.000Z',
        reversalOfLedgerId: null,
      },
      {
        id: '1',
        tenantId: '1001',
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        binId: null,
        quantityDelta: 10,
        referenceType: 'GRN',
        referenceId: 'GRN-1',
        postedAt: '2026-03-05T10:00:00.000Z',
        reversalOfLedgerId: null,
      },
    ]);

    const result = await controller.getLedger(
      undefined,
      undefined,
      undefined,
      undefined,
      '1',
      '1',
    );

    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(1);
    expect(result.totalPages).toBe(2);
    expect(result.data[0]?.id).toBe('2');
  });

  it('should filter ledger by docType', async () => {
    mockInventoryStore.getAllLedgerEntries.mockResolvedValue([
      {
        id: '1',
        tenantId: '1001',
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        binId: null,
        quantityDelta: 10,
        referenceType: 'GRN',
        referenceId: 'GRN-1',
        postedAt: '2026-03-05T10:00:00.000Z',
        reversalOfLedgerId: null,
      },
      {
        id: '2',
        tenantId: '1001',
        skuId: 'SKU-1',
        warehouseId: 'WH-1',
        binId: null,
        quantityDelta: -2,
        referenceType: 'OUT',
        referenceId: 'OUT-1',
        postedAt: '2026-03-05T11:00:00.000Z',
        reversalOfLedgerId: null,
      },
    ]);

    const result = await controller.getLedger(undefined, undefined, undefined, 'GRN');

    expect(result.total).toBe(1);
    expect(result.data[0]?.referenceType).toBe('GRN');
  });

  it('should reject non-numeric page value', async () => {
    await expect(
      controller.getLedger(undefined, undefined, undefined, undefined, '1abc'),
    ).rejects.toThrow('page must be a positive integer');
  });

  it('should pass binId to filtered balance query', async () => {
    mockInventoryPostingService.getBalanceSnapshot.mockResolvedValue([
      { skuId: 'SKU-1', warehouseId: 'WH-1', binId: 'BIN-1', onHand: 6 },
    ]);

    const result = await controller.getBalances('SKU-1', 'WH-1', 'BIN-1');

    expect(mockInventoryPostingService.getBalanceSnapshot).toHaveBeenCalledWith(
      '1001',
      [{ skuId: 'SKU-1', warehouseId: 'WH-1', binId: 'BIN-1' }],
    );
    expect(result.data[0]?.binId).toBe('BIN-1');
  });

  it('should reject pageSize overflow', async () => {
    await expect(
      controller.getLedger(undefined, undefined, undefined, undefined, '1', '201'),
    ).rejects.toThrow('pageSize must be <= 200');
  });
});
