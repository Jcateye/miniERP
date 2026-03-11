import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from '../application/customer.service';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';

describe('CustomerController', () => {
  let controller: CustomerController;
  let customerService: CustomerService;

  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockCustomerService = {
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
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
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

    controller = module.get<CustomerController>(CustomerController);
    customerService = module.get<CustomerService>(CustomerService);
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
      controller.update('cust_001', { isActive: 'yes' }),
    ).rejects.toThrow('isActive must be boolean');
  });

  it('should list customers with total', async () => {
    const data = [
      {
        id: 'cust_001',
        tenantId: '1001',
        code: 'CUST-A',
        name: '客户A',
        contactPerson: null,
        contactPhone: null,
        email: null,
        address: null,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    mockCustomerService.findAll.mockResolvedValue(data);

    const result = await controller.list(undefined, undefined, 'true');

    expect(customerService.findAll).toHaveBeenCalledWith('1001', {
      code: undefined,
      name: undefined,
      isActive: true,
    });
    expect(result).toEqual({ data, total: 1 });
  });

  it('should create customer', async () => {
    const created = {
      id: 'cust_002',
      tenantId: '1001',
      code: 'CUST-B',
      name: '客户B',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockCustomerService.create.mockResolvedValue(created);

    const result = await controller.create({
      code: ' CUST-B ',
      name: ' 客户B ',
      contactPerson: ' ',
    });

    expect(customerService.create).toHaveBeenCalledWith('1001', {
      code: 'CUST-B',
      name: '客户B',
      contactPerson: null,
      contactPhone: undefined,
      email: undefined,
      address: undefined,
    });
    expect(result).toEqual(created);
  });

  it('should update customer', async () => {
    const updated = {
      id: 'cust_001',
      tenantId: '1001',
      code: 'CUST-A',
      name: '客户A(更新)',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    };

    mockCustomerService.update.mockResolvedValue(updated);

    const result = await controller.update('cust_001', {
      name: ' 客户A(更新) ',
      isActive: true,
    });

    expect(customerService.update).toHaveBeenCalledWith('1001', 'cust_001', {
      name: '客户A(更新)',
      contactPerson: undefined,
      contactPhone: undefined,
      email: undefined,
      address: undefined,
      isActive: true,
    });
    expect(result).toEqual(updated);
  });

  it('should get customer by id', async () => {
    const entity = {
      id: 'cust_001',
      tenantId: '1001',
      code: 'CUST-A',
      name: '客户A',
      contactPerson: null,
      contactPhone: null,
      email: null,
      address: null,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    mockCustomerService.findById.mockResolvedValue(entity);

    const result = await controller.getById('cust_001');

    expect(customerService.findById).toHaveBeenCalledWith('1001', 'cust_001');
    expect(result).toEqual(entity);
  });

  it('should delete customer', async () => {
    mockCustomerService.delete.mockResolvedValue(true);

    const result = await controller.remove('cust_001');

    expect(customerService.delete).toHaveBeenCalledWith('1001', 'cust_001');
    expect(result).toEqual({ id: 'cust_001', deleted: true });
  });
});
