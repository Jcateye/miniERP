import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import { resolveTenantDbId } from '../infrastructure/prisma-tenant-id.resolver';

function parseOptionalBoolean(value?: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function mapUomRow(row: {
  id: bigint;
  tenantId: bigint;
  uomCode: string;
  uomName: string;
  precision: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    code: row.uomCode,
    name: row.uomName,
    uomCode: row.uomCode,
    uomName: row.uomName,
    precision: row.precision,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@RequirePermissions('masterdata.uom.read')
@Controller('uoms')
export class UomController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const active = parseOptionalBoolean(isActive);

    const data = await this.prisma.uom.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        uomCode: code ? { contains: code } : undefined,
        uomName: name ? { contains: name } : undefined,
        status: active === undefined ? undefined : active ? 'active' : { not: 'active' },
      },
      orderBy: [{ uomCode: 'asc' }, { id: 'asc' }],
    });

    return {
      data: data.map(mapUomRow),
      total: data.length,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const uomId = toDbId(id);
    if (uomId === null) {
      return null;
    }

    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const row = await this.prisma.uom.findFirst({
      where: {
        id: uomId,
        tenantId: tenantDbId,
        deletedAt: null,
      },
    });

    return row ? mapUomRow(row) : null;
  }
}
