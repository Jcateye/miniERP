import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { WarehouseBinController } from './warehouse-bin.controller';
import {
  WarehouseBinService,
  type WarehouseBinDto,
  type WarehouseBinListResponse,
} from '../application/warehouse-bin.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';

describe('WarehouseBinController', () => {
  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockWarehouseBin: WarehouseBinDto = {
    id: '201',
    tenantId: '1001',
    warehouseId: '11',
    code: 'A-01-01',
    name: '成品货架 A-01-01',
    binCode: 'A-01-01',
    binName: '成品货架 A-01-01',
    zoneCode: 'FG-A',
    binType: 'pick',
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-02T00:00:00.000Z',
  };

  const mockWarehouseBinService: Pick<
    WarehouseBinService,
    'list' | 'getById' | 'create' | 'update' | 'remove'
  > = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  let controller: WarehouseBinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseBinController],
      providers: [
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
        {
          provide: WarehouseBinService,
          useValue: mockWarehouseBinService,
        },
      ],
    })
      // NOTE: WarehouseBinService 是 class provider，这里用 override 方式更明确
      .overrideProvider(WarehouseBinService)
      .useValue(mockWarehouseBinService)
      .compile();

    controller = module.get<WarehouseBinController>(WarehouseBinController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists warehouse bins', async () => {
    const response: WarehouseBinListResponse = {
      data: [mockWarehouseBin],
      total: 1,
    };
    (mockWarehouseBinService.list as jest.Mock).mockResolvedValue(response);

    const result = await controller.list('11', 'A-', undefined, 'true');

    expect(mockWarehouseBinService.list).toHaveBeenCalledWith('1001', {
      warehouseId: '11',
      code: 'A-',
      name: undefined,
      isActive: 'true',
    });
    expect(result).toEqual(response);
  });

  it('gets warehouse bin by id', async () => {
    (mockWarehouseBinService.getById as jest.Mock).mockResolvedValue(
      mockWarehouseBin,
    );

    const result = await controller.getById('201');

    expect(mockWarehouseBinService.getById).toHaveBeenCalledWith('1001', '201');
    expect(result).toEqual(mockWarehouseBin);
  });

  it('creates warehouse bin (trims values)', async () => {
    (mockWarehouseBinService.create as jest.Mock).mockResolvedValue(
      mockWarehouseBin,
    );

    const result = await controller.create({
      warehouseId: '11',
      code: ' A-01-03 ',
      name: ' 成品货架 A-01-03 ',
      zoneCode: ' FG-A ',
      binType: ' pick ',
    });

    expect(mockWarehouseBinService.create).toHaveBeenCalledWith(
      '1001',
      'user-001',
      {
        warehouseId: '11',
        code: 'A-01-03',
        name: '成品货架 A-01-03',
        zoneCode: 'FG-A',
        binType: 'pick',
        status: 'active',
      },
    );
    expect(result).toEqual(mockWarehouseBin);
  });

  it('updates warehouse bin (trims values)', async () => {
    (mockWarehouseBinService.update as jest.Mock).mockResolvedValue(
      mockWarehouseBin,
    );

    const result = await controller.update('201', {
      name: ' 成品货架 A-01-01-改 ',
      zoneCode: ' FG-B ',
      binType: ' reserve ',
      status: 'inactive',
    });

    expect(mockWarehouseBinService.update).toHaveBeenCalledWith(
      '1001',
      'user-001',
      '201',
      {
        name: '成品货架 A-01-01-改',
        zoneCode: 'FG-B',
        binType: 'reserve',
        status: 'inactive',
      },
    );
    expect(result).toEqual(mockWarehouseBin);
  });

  it('deletes warehouse bin', async () => {
    (mockWarehouseBinService.remove as jest.Mock).mockResolvedValue({
      id: '201',
      deleted: true,
    });

    const result = await controller.remove('201');

    expect(mockWarehouseBinService.remove).toHaveBeenCalledWith(
      '1001',
      'user-001',
      '201',
    );
    expect(result).toEqual({ id: '201', deleted: true });
  });
});
