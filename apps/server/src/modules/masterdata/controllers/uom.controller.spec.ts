import { PrismaService } from '../../../database/prisma.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { UomController } from './uom.controller';

describe('UomController', () => {
  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockPrisma = {
    tenant: {
      findFirst: jest.fn(),
    },
    uom: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  let controller: UomController;

  beforeEach(() => {
    controller = new UomController(
      mockPrisma as unknown as PrismaService,
      mockTenantContextService as unknown as TenantContextService,
    );

    mockPrisma.tenant.findFirst.mockResolvedValue({ id: BigInt(1001) });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists uoms', async () => {
    mockPrisma.uom.findMany.mockResolvedValue([
      {
        id: BigInt(11),
        tenantId: BigInt(1001),
        uomCode: 'PCS',
        uomName: '件',
        precision: 0,
        status: 'active',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      },
    ]);

    const result = await controller.list('PC', undefined, 'true');

    expect(mockPrisma.uom.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      data: [
        {
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
        },
      ],
      total: 1,
    });
  });

  it('gets uom by id', async () => {
    mockPrisma.uom.findFirst.mockResolvedValue({
      id: BigInt(11),
      tenantId: BigInt(1001),
      uomCode: 'PCS',
      uomName: '件',
      precision: 0,
      status: 'active',
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
    });

    const result = await controller.getById('11');

    expect(result).toEqual({
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
    });
  });
});
