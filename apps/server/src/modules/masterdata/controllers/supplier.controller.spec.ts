import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from '../application/supplier.service';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';

describe('SupplierController', () => {
  let controller: SupplierController;

  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockSupplierService = {
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
      controllers: [SupplierController],
      providers: [
        {
          provide: SupplierService,
          useValue: mockSupplierService,
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

    controller = module.get<SupplierController>(SupplierController);
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
      controller.update('sup_001', { isActive: 'yes' }),
    ).rejects.toThrow('isActive must be boolean');
  });

  it('should list suppliers with total', async () => {
    const data = [
      {
        id: 'sup_001',
        tenantId: '1001',
        code: 'SUP-A',
        name: '供应商A',
        contactPerson: null,
        contactPhone: null,
        email: null,
        address: null,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    mockSupplierService.findAll.mockResolvedValue(data);

    const result = await controller.list(undefined, undefined, 'true');

    expect(mockSupplierService.findAll).toHaveBeenCalledWith('1001', {
      code: undefined,
      name: undefined,
      isActive: true,
    });
    expect(result).toEqual({ data, total: 1 });
  });

  it('should create supplier', async () => {
    const created = {
      id: 'sup_002',
      tenantId: '1001',
      code: 'SUP-B',
      name: '供应商B',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockSupplierService.create.mockResolvedValue(created);

    const result = await controller.create({
      code: ' SUP-B ',
      name: ' 供应商B ',
      contactPerson: ' ',
    });

    expect(mockSupplierService.create).toHaveBeenCalledWith('1001', {
      code: 'SUP-B',
      name: '供应商B',
      contactPerson: null,
      contactPhone: undefined,
      email: undefined,
      address: undefined,
    });
    expect(result).toEqual(created);
  });

  it('should update supplier', async () => {
    const updated = {
      id: 'sup_001',
      tenantId: '1001',
      code: 'SUP-A',
      name: '供应商A(更新)',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    };

    mockSupplierService.update.mockResolvedValue(updated);

    const result = await controller.update('sup_001', {
      name: ' 供应商A(更新) ',
      isActive: true,
    });

    expect(mockSupplierService.update).toHaveBeenCalledWith('1001', 'sup_001', {
      name: '供应商A(更新)',
      contactPerson: undefined,
      contactPhone: undefined,
      email: undefined,
      address: undefined,
      isActive: true,
    });
    expect(result).toEqual(updated);
  });

  it('should get supplier by id', async () => {
    const entity = {
      id: 'sup_001',
      tenantId: '1001',
      code: 'SUP-A',
      name: '供应商A',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockSupplierService.findById.mockResolvedValue(entity);

    const result = await controller.getById('sup_001');

    expect(mockSupplierService.findById).toHaveBeenCalledWith(
      '1001',
      'sup_001',
    );
    expect(result).toEqual(entity);
  });

  it('should delete supplier', async () => {
    mockSupplierService.delete.mockResolvedValue(true);

    const result = await controller.remove('sup_001');

    expect(mockSupplierService.delete).toHaveBeenCalledWith('1001', 'sup_001');
    expect(result).toEqual({ id: 'sup_001', deleted: true });
  });
});
