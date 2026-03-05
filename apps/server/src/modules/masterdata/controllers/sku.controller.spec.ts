import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { SkuService } from '../application/sku.service';
import { SkuController } from './sku.controller';

describe('SkuController', () => {
  let controller: SkuController;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkuController],
      providers: [
        {
          provide: SkuService,
          useValue: mockSkuService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn().mockReturnValue([]) },
        },
        {
          provide: AuditService,
          useValue: { recordAuthorization: jest.fn() },
        },
        {
          provide: PlatformAccessService,
          useValue: { assertCrossTenantAllowed: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SkuController>(SkuController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject invalid isActive query', async () => {
    await expect(
      controller.list(undefined, undefined, undefined, 'abc'),
    ).rejects.toThrow('isActive must be true or false');
  });

  it('should reject non-object create payload', async () => {
    await expect(controller.create('bad-payload')).rejects.toThrow(
      'Request body must be an object',
    );
  });

  it('should reject invalid update payload', async () => {
    await expect(
      controller.update('sku_001', { isActive: 'yes' }),
    ).rejects.toThrow('isActive must be boolean');
  });

  it('should list skus with total', async () => {
    const data = [
      {
        id: 'sku_001',
        tenantId: '1001',
        code: 'SKU-A',
        name: '测试SKU',
        specification: 'SPEC',
        baseUnit: 'PCS',
        categoryId: null,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    mockSkuService.findAll.mockResolvedValue(data);

    const result = await controller.list('SKU', undefined, undefined, 'true');

    expect(mockSkuService.findAll).toHaveBeenCalledWith('1001', {
      code: 'SKU',
      name: undefined,
      categoryId: undefined,
      isActive: true,
    });
    expect(result).toEqual({ data, total: 1 });
  });

  it('should create sku', async () => {
    const created = {
      id: 'sku_002',
      tenantId: '1001',
      code: 'SKU-B',
      name: 'SKU-B',
      specification: null,
      baseUnit: 'PCS',
      categoryId: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockSkuService.create.mockResolvedValue(created);

    const result = await controller.create({
      code: ' SKU-B ',
      name: ' SKU-B ',
      specification: ' ',
      baseUnit: ' PCS ',
      categoryId: null,
    });

    expect(mockSkuService.create).toHaveBeenCalledWith('1001', {
      code: 'SKU-B',
      name: 'SKU-B',
      specification: null,
      baseUnit: 'PCS',
      categoryId: null,
    });
    expect(result).toEqual(created);
  });

  it('should update sku with PUT contract', async () => {
    const updated = {
      id: 'sku_001',
      tenantId: '1001',
      code: 'SKU-A',
      name: 'SKU-A(更新)',
      specification: null,
      baseUnit: 'PCS',
      categoryId: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    };

    mockSkuService.update.mockResolvedValue(updated);

    const result = await controller.update('sku_001', {
      name: ' SKU-A(更新) ',
      baseUnit: ' PCS ',
      isActive: true,
    });

    expect(mockSkuService.update).toHaveBeenCalledWith('1001', 'sku_001', {
      name: 'SKU-A(更新)',
      specification: undefined,
      baseUnit: 'PCS',
      categoryId: undefined,
      isActive: true,
    });
    expect(result).toEqual(updated);
  });

  it('should get sku by id', async () => {
    const entity = {
      id: 'sku_001',
      tenantId: '1001',
      code: 'SKU-A',
      name: 'SKU-A',
      specification: 'SPEC',
      baseUnit: 'PCS',
      categoryId: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockSkuService.findById.mockResolvedValue(entity);

    const result = await controller.getById('sku_001');

    expect(mockSkuService.findById).toHaveBeenCalledWith('1001', 'sku_001');
    expect(result).toEqual(entity);
  });

  it('should delete sku', async () => {
    mockSkuService.delete.mockResolvedValue(true);

    const result = await controller.remove('sku_001');

    expect(mockSkuService.delete).toHaveBeenCalledWith('1001', 'sku_001');
    expect(result).toEqual({ id: 'sku_001', deleted: true });
  });
});
