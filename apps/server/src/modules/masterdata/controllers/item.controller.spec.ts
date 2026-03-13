import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { SkuService } from '../application/sku.service';
import { ItemController } from './item.controller';

describe('ItemController', () => {
  let controller: ItemController;

  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockSkuService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  beforeEach(() => {
    controller = new ItemController(
      mockSkuService as unknown as SkuService,
      mockTenantContextService as unknown as TenantContextService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list items with total', async () => {
    const data = [
      {
        id: 'sku_001',
        tenantId: '1001',
        code: 'ITEM-A',
        name: '测试物料',
        specification: 'SPEC',
        baseUnit: 'PCS',
        categoryId: null,
        taxCodeId: null,
        barcode: null,
        batchManaged: false,
        serialManaged: false,
        minStockQty: null,
        maxStockQty: null,
        leadTimeDays: null,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    mockSkuService.findAll.mockResolvedValue(data);

    const result = await controller.list('ITEM', undefined, undefined, 'true');

    expect(mockSkuService.findAll).toHaveBeenCalledWith('1001', {
      code: 'ITEM',
      name: undefined,
      categoryId: undefined,
      isActive: true,
    });
    expect(result).toEqual({ data, total: 1 });
  });

  it('should create item through sku service compatibility layer', async () => {
    const created = {
      id: 'sku_002',
      tenantId: '1001',
      code: 'ITEM-B',
      name: 'ITEM-B',
        specification: null,
        baseUnit: 'PCS',
        categoryId: null,
        itemType: 'finished_goods',
        taxCodeId: '1013',
        taxRate: '13.00',
        barcode: '6901001000123',
        batchManaged: true,
        serialManaged: false,
        shelfLifeDays: 365,
        minStockQty: '10',
      maxStockQty: '100',
      leadTimeDays: 9,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockSkuService.create.mockResolvedValue(created);

    const result = await controller.create({
      code: ' ITEM-B ',
      name: ' ITEM-B ',
      specification: ' ',
      baseUnit: ' PCS ',
      categoryId: null,
      itemType: ' finished_goods ',
      taxCodeId: ' 1013 ',
      taxRate: ' 13.00 ',
      barcode: ' 6901001000123 ',
      batchManaged: true,
      serialManaged: false,
      shelfLifeDays: 365,
      minStockQty: '10',
      maxStockQty: '100',
      leadTimeDays: 9,
    });

    expect(mockSkuService.create).toHaveBeenCalledWith('1001', {
      code: 'ITEM-B',
      name: 'ITEM-B',
      specification: null,
      baseUnit: 'PCS',
      categoryId: null,
      itemType: 'finished_goods',
      taxCodeId: '1013',
      taxRate: '13.00',
      barcode: '6901001000123',
      batchManaged: true,
      serialManaged: false,
      shelfLifeDays: 365,
      minStockQty: '10',
      maxStockQty: '100',
      leadTimeDays: 9,
    });
    expect(result).toEqual(created);
  });

  it('should get item by id', async () => {
    const entity = {
      id: 'sku_001',
      tenantId: '1001',
      code: 'ITEM-A',
      name: 'ITEM-A',
      specification: 'SPEC',
      baseUnit: 'PCS',
      categoryId: null,
      barcode: null,
      batchManaged: false,
      serialManaged: false,
      minStockQty: null,
      maxStockQty: null,
      leadTimeDays: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockSkuService.findById.mockResolvedValue(entity);

    const result = await controller.getById('sku_001');

    expect(mockSkuService.findById).toHaveBeenCalledWith('1001', 'sku_001');
    expect(result).toEqual(entity);
  });
});
