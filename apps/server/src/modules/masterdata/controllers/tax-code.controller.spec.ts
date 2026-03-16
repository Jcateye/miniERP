import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';
import { TaxCodeController } from './tax-code.controller';
import {
  TaxCodeService,
  type TaxCodeDto,
  type TaxCodeListResponse,
} from '../application/tax-code.service';

describe('TaxCodeController', () => {
  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockTaxCode: TaxCodeDto = {
    id: '1013',
    tenantId: '1001',
    code: 'VAT13',
    name: '增值税 13%',
    taxCode: 'VAT13',
    taxName: '增值税 13%',
    taxType: 'vat',
    rate: '13.00',
    inclusive: false,
    jurisdiction: null,
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-02T00:00:00.000Z',
  };

  const mockTaxCodeService: Pick<TaxCodeService, 'list' | 'getById'> = {
    list: jest.fn(),
    getById: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  let controller: TaxCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxCodeController],
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
          provide: TaxCodeService,
          useValue: mockTaxCodeService,
        },
      ],
    })
      .overrideProvider(TaxCodeService)
      .useValue(mockTaxCodeService)
      .compile();

    controller = module.get<TaxCodeController>(TaxCodeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists tax codes', async () => {
    const response: TaxCodeListResponse = {
      data: [mockTaxCode],
      total: 1,
    };
    (mockTaxCodeService.list as jest.Mock).mockResolvedValue(response);

    const result = await controller.list('VAT', undefined, 'true');

    expect(mockTaxCodeService.list).toHaveBeenCalledWith('1001', {
      code: 'VAT',
      name: undefined,
      isActive: 'true',
    });
    expect(result).toEqual(response);
  });

  it('gets tax code by id', async () => {
    (mockTaxCodeService.getById as jest.Mock).mockResolvedValue(mockTaxCode);

    const result = await controller.getById('1013');

    expect(mockTaxCodeService.getById).toHaveBeenCalledWith('1001', '1013');
    expect(result).toEqual(mockTaxCode);
  });
});
