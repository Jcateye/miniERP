import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';
import { UomController } from './uom.controller';
import {
  UomService,
  type UomDto,
  type UomListResponse,
} from '../application/uom.service';

describe('UomController', () => {
  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockUom: UomDto = {
    id: '11',
    tenantId: '1001',
    code: 'PCS',
    name: '件',
    uomCode: 'PCS',
    uomName: '件',
    precision: 0,
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-02T00:00:00.000Z',
  };

  const mockUomService: Pick<UomService, 'list' | 'getById'> = {
    list: jest.fn(),
    getById: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  let controller: UomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UomController],
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
          provide: UomService,
          useValue: mockUomService,
        },
      ],
    })
      .overrideProvider(UomService)
      .useValue(mockUomService)
      .compile();

    controller = module.get<UomController>(UomController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists uoms', async () => {
    const response: UomListResponse = {
      data: [mockUom],
      total: 1,
    };
    (mockUomService.list as jest.Mock).mockResolvedValue(response);

    const result = await controller.list('PC', undefined, 'true');

    expect(mockUomService.list).toHaveBeenCalledWith('1001', {
      code: 'PC',
      name: undefined,
      isActive: 'true',
    });
    expect(result).toEqual(response);
  });

  it('gets uom by id', async () => {
    (mockUomService.getById as jest.Mock).mockResolvedValue(mockUom);

    const result = await controller.getById('11');

    expect(mockUomService.getById).toHaveBeenCalledWith('1001', '11');
    expect(result).toEqual(mockUom);
  });
});
