import { PrismaService } from '../../../database/prisma.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { TaxCodeController } from './tax-code.controller';

describe('TaxCodeController', () => {
  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockPrisma = {
    tenant: {
      findFirst: jest.fn(),
    },
    taxCode: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  let controller: TaxCodeController;

  beforeEach(() => {
    controller = new TaxCodeController(
      mockPrisma as unknown as PrismaService,
      mockTenantContextService as unknown as TenantContextService,
    );

    mockPrisma.tenant.findFirst.mockResolvedValue({ id: BigInt(1001) });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists tax codes', async () => {
    mockPrisma.taxCode.findMany.mockResolvedValue([
      {
        id: BigInt(1013),
        tenantId: BigInt(1001),
        taxCode: 'VAT13',
        taxName: '增值税 13%',
        taxType: 'vat',
        rate: { toString: () => '13.00' },
        inclusive: false,
        jurisdiction: null,
        status: 'active',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      },
    ]);

    const result = await controller.list('VAT', undefined, 'true');

    expect(mockPrisma.taxCode.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      data: [
        {
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
        },
      ],
      total: 1,
    });
  });

  it('gets tax code by id', async () => {
    mockPrisma.taxCode.findFirst.mockResolvedValue({
      id: BigInt(1013),
      tenantId: BigInt(1001),
      taxCode: 'VAT13',
      taxName: '增值税 13%',
      taxType: 'vat',
      rate: { toString: () => '13.00' },
      inclusive: false,
      jurisdiction: null,
      status: 'active',
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
    });

    const result = await controller.getById('1013');

    expect(result).toEqual({
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
    });
  });
});
