import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryPostingService } from '../application/inventory-posting.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

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
      { skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 20 },
    ]);

    const result = await controller.getBalances('SKU-1', 'WH-1');

    expect(mockInventoryPostingService.getBalanceSnapshot).toHaveBeenCalledWith('1001', [
      { skuId: 'SKU-1', warehouseId: 'WH-1' },
    ]);
    expect(result).toEqual({
      data: [{ skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 20 }],
      total: 1,
    });
  });

  it('should return all balances when no filters provided', async () => {
    mockInventoryStore.getAllBalanceSnapshots.mockResolvedValue([
      { skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 20 },
      { skuId: 'SKU-2', warehouseId: 'WH-1', onHand: 10 },
    ]);

    const result = await controller.getBalances();

    expect(mockInventoryStore.getAllBalanceSnapshots).toHaveBeenCalledWith('1001');
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
        quantityDelta: 10,
        referenceType: 'GRN',
        referenceId: 'GRN-1',
        postedAt: '2026-03-05T10:00:00.000Z',
        reversalOfLedgerId: null,
      },
    ]);

    const result = await controller.getLedger(undefined, undefined, undefined, '1', '1');

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
        quantityDelta: -2,
        referenceType: 'OUT',
        referenceId: 'OUT-1',
        postedAt: '2026-03-05T11:00:00.000Z',
        reversalOfLedgerId: null,
      },
    ]);

    const result = await controller.getLedger(undefined, undefined, 'GRN');

    expect(result.total).toBe(1);
    expect(result.data[0]?.referenceType).toBe('GRN');
  });

  it('should reject non-numeric page value', async () => {
    await expect(
      controller.getLedger(undefined, undefined, undefined, '1abc'),
    ).rejects.toThrow('page must be a positive integer');
  });

  it('should reject pageSize overflow', async () => {
    await expect(
      controller.getLedger(undefined, undefined, undefined, '1', '201'),
    ).rejects.toThrow('pageSize must be <= 200');
  });
});
