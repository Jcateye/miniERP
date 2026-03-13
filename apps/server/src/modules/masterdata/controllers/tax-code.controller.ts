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

function mapTaxCodeRow(row: {
  id: bigint;
  tenantId: bigint;
  taxCode: string;
  taxName: string;
  taxType: string;
  rate: { toString(): string };
  inclusive: boolean;
  jurisdiction: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    code: row.taxCode,
    name: row.taxName,
    taxCode: row.taxCode,
    taxName: row.taxName,
    taxType: row.taxType,
    rate: row.rate.toString(),
    inclusive: row.inclusive,
    jurisdiction: row.jurisdiction,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@RequirePermissions('masterdata.tax-code.read')
@Controller('tax-codes')
export class TaxCodeController {
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

    const data = await this.prisma.taxCode.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        taxCode: code ? { contains: code } : undefined,
        taxName: name ? { contains: name } : undefined,
        status: active === undefined ? undefined : active ? 'active' : { not: 'active' },
      },
      orderBy: [{ taxCode: 'asc' }, { id: 'asc' }],
    });

    return {
      data: data.map(mapTaxCodeRow),
      total: data.length,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const taxCodeId = toDbId(id);
    if (taxCodeId === null) {
      return null;
    }

    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const row = await this.prisma.taxCode.findFirst({
      where: {
        id: taxCodeId,
        tenantId: tenantDbId,
        deletedAt: null,
      },
    });

    return row ? mapTaxCodeRow(row) : null;
  }
}
