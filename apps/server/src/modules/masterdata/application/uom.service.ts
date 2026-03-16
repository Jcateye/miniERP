import { BadRequestException, Injectable } from '@nestjs/common';
import type { PlatformDbService } from '../../../database/platform-db.service';
import { resolveTenantDbId } from '../infrastructure/prisma-tenant-id.resolver';

export interface UomListQuery {
  readonly code?: string;
  readonly name?: string;
  readonly isActive?: string;
}

export interface UomListResponse {
  readonly data: readonly UomDto[];
  readonly total: number;
}

export interface UomDto {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly uomCode: string;
  readonly uomName: string;
  readonly precision: number | null;
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

function mapUomRow(row: {
  id: bigint;
  tenantId: bigint;
  uomCode: string;
  uomName: string;
  precision: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): UomDto {
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

@Injectable()
export class UomService {
  constructor(private readonly platformDb: PlatformDbService) {}

  async list(tenantId: string, query: UomListQuery): Promise<UomListResponse> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const active = parseOptionalBoolean(query.isActive);

      const data = await tx.uom.findMany({
        where: {
          tenantId: tenantDbId,
          deletedAt: null,
          uomCode: query.code ? { contains: query.code } : undefined,
          uomName: query.name ? { contains: query.name } : undefined,
          status:
            active === undefined ? undefined : active ? 'active' : 'inactive',
        },
        orderBy: [{ uomCode: 'asc' }, { id: 'asc' }],
      });

      return {
        data: data.map(mapUomRow),
        total: data.length,
      };
    });
  }

  async getById(tenantId: string, id: string): Promise<UomDto | null> {
    const uomId = toDbId(id);
    if (uomId === null) {
      return null;
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.uom.findFirst({
        where: {
          id: uomId,
          tenantId: tenantDbId,
          deletedAt: null,
        },
      });

      return row ? mapUomRow(row) : null;
    });
  }
}
