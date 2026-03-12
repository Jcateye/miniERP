import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from '../application/warehouse.service';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';

describe('WarehouseController', () => {
  let controller: WarehouseController;

  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockWarehouseService = {
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
      controllers: [WarehouseController],
      providers: [
        {
          provide: WarehouseService,
          useValue: mockWarehouseService,
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

    controller = module.get<WarehouseController>(WarehouseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject invalid isActive query', async () => {
    await expect(controller.list(undefined, undefined, 'abc')).rejects.toThrow(
      'isActive must be true or false',
    );
  });

  it('should reject non-object create payload', async () => {
    await expect(controller.create('bad-payload')).rejects.toThrow(
      'Request body must be an object',
    );
  });

  it('should reject invalid update payload', async () => {
    await expect(
      controller.update('wh_001', { isActive: 'yes' }),
    ).rejects.toThrow('isActive must be boolean');
  });

  it('should list warehouses with total', async () => {
    const data = [
      {
        id: 'wh_001',
        tenantId: '1001',
        code: 'WH-A',
        name: '主仓',
        address: null,
        contactPerson: null,
        contactPhone: null,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    mockWarehouseService.findAll.mockResolvedValue(data);

    const result = await controller.list(undefined, undefined, 'true');

    expect(mockWarehouseService.findAll).toHaveBeenCalledWith('1001', {
      code: undefined,
      name: undefined,
      isActive: true,
    });
    expect(result).toEqual({ data, total: 1 });
  });

  it('should create warehouse', async () => {
    const created = {
      id: 'wh_002',
      tenantId: '1001',
      code: 'WH-B',
      name: '备仓',
      address: null,
      contactPerson: null,
      contactPhone: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockWarehouseService.create.mockResolvedValue(created);

    const result = await controller.create({
      code: ' WH-B ',
      name: ' 备仓 ',
      address: ' ',
    });

    expect(mockWarehouseService.create).toHaveBeenCalledWith('1001', {
      code: 'WH-B',
      name: '备仓',
      address: null,
      contactPerson: undefined,
      contactPhone: undefined,
    });
    expect(result).toEqual(created);
  });

  it('should update warehouse', async () => {
    const updated = {
      id: 'wh_001',
      tenantId: '1001',
      code: 'WH-A',
      name: '主仓(更新)',
      address: null,
      contactPerson: null,
      contactPhone: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    };

    mockWarehouseService.update.mockResolvedValue(updated);

    const result = await controller.update('wh_001', {
      name: ' 主仓(更新) ',
      isActive: true,
    });

    expect(mockWarehouseService.update).toHaveBeenCalledWith('1001', 'wh_001', {
      name: '主仓(更新)',
      address: undefined,
      contactPerson: undefined,
      contactPhone: undefined,
      isActive: true,
    });
    expect(result).toEqual(updated);
  });

  it('should get warehouse by id', async () => {
    const entity = {
      id: 'wh_001',
      tenantId: '1001',
      code: 'WH-A',
      name: '主仓',
      address: null,
      contactPerson: null,
      contactPhone: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockWarehouseService.findById.mockResolvedValue(entity);

    const result = await controller.getById('wh_001');

    expect(mockWarehouseService.findById).toHaveBeenCalledWith(
      '1001',
      'wh_001',
    );
    expect(result).toEqual(entity);
  });

  it('should delete warehouse', async () => {
    mockWarehouseService.delete.mockResolvedValue(true);

    const result = await controller.remove('wh_001');

    expect(mockWarehouseService.delete).toHaveBeenCalledWith('1001', 'wh_001');
    expect(result).toEqual({ id: 'wh_001', deleted: true });
  });
});
