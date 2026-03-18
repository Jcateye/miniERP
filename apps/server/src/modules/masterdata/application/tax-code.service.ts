import { BadRequestException, Injectable } from '@nestjs/common';
import { PlatformDbService } from '../../../database/platform-db.service';
import { resolveTenantDbId } from '../infrastructure/prisma-tenant-id.resolver';

export interface TaxCodeListQuery {
  readonly code?: string;
  readonly name?: string;
  readonly isActive?: string;
}

export interface TaxCodeListResponse {
  readonly data: readonly TaxCodeDto[];
  readonly total: number;
}

export interface TaxCodeDto {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly taxCode: string;
  readonly taxName: string;
  readonly taxType: string;
  readonly rate: string;
  readonly inclusive: boolean;
  readonly jurisdiction: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

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

  throw new BadRequestException('isActive must be true or false');
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
}): TaxCodeDto {
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

@Injectable()
export class TaxCodeService {
  constructor(private readonly platformDb: PlatformDbService) {}

  async list(
    tenantId: string,
    query: TaxCodeListQuery,
  ): Promise<TaxCodeListResponse> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const active = parseOptionalBoolean(query.isActive);

      const data = await tx.taxCode.findMany({
        where: {
          tenantId: tenantDbId,
          deletedAt: null,
          taxCode: query.code ? { contains: query.code } : undefined,
          taxName: query.name ? { contains: query.name } : undefined,
          status:
            active === undefined ? undefined : active ? 'active' : 'inactive',
        },
        orderBy: [{ taxCode: 'asc' }, { id: 'asc' }],
      });

      return {
        data: data.map(mapTaxCodeRow),
        total: data.length,
      };
    });
  }

  async getById(tenantId: string, id: string): Promise<TaxCodeDto | null> {
    const taxCodeId = toDbId(id);
    if (taxCodeId === null) {
      return null;
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.taxCode.findFirst({
        where: {
          id: taxCodeId,
          tenantId: tenantDbId,
          deletedAt: null,
        },
      });

      return row ? mapTaxCodeRow(row) : null;
    });
  }
}
