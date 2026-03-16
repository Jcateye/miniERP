import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformDbService } from '../../../database/platform-db.service';
import { resolveTenantDbId } from '../infrastructure/prisma-tenant-id.resolver';

export interface WarehouseBinListQuery {
  readonly warehouseId?: string;
  readonly code?: string;
  readonly name?: string;
  readonly isActive?: string;
}

export interface WarehouseBinListResponse {
  readonly data: readonly WarehouseBinDto[];
  readonly total: number;
}

export interface WarehouseBinDto {
  readonly id: string;
  readonly tenantId: string;
  readonly warehouseId: string;
  readonly code: string;
  readonly name: string;
  readonly binCode: string;
  readonly binName: string;
  readonly zoneCode: string | null;
  readonly binType: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateWarehouseBinCommand {
  readonly warehouseId: string;
  readonly code: string;
  readonly name: string;
  readonly zoneCode: string | null | undefined;
  readonly binType: string | null | undefined;
  readonly status: 'active' | 'inactive';
}

export interface UpdateWarehouseBinCommand {
  readonly name: string | undefined;
  readonly zoneCode: string | null | undefined;
  readonly binType: string | null | undefined;
  readonly status: 'active' | 'inactive' | undefined;
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

function mapWarehouseBinRow(row: {
  id: bigint;
  tenantId: bigint;
  warehouseId: bigint;
  binCode: string;
  binName: string;
  zoneCode: string | null;
  binType: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): WarehouseBinDto {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    warehouseId: row.warehouseId.toString(),
    code: row.binCode,
    name: row.binName,
    binCode: row.binCode,
    binName: row.binName,
    zoneCode: row.zoneCode,
    binType: row.binType,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class WarehouseBinService {
  constructor(private readonly platformDb: PlatformDbService) {}

  async list(
    tenantId: string,
    query: WarehouseBinListQuery,
  ): Promise<WarehouseBinListResponse> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const active = parseOptionalBoolean(query.isActive);
      const warehouseId =
        query.warehouseId === undefined ? undefined : toDbId(query.warehouseId);

      if (query.warehouseId !== undefined && warehouseId === null) {
        throw new BadRequestException('warehouseId must be bigint-compatible');
      }

      const data = await tx.warehouseBin.findMany({
        where: {
          tenantId: tenantDbId,
          deletedAt: null,
          warehouseId: warehouseId ?? undefined,
          binCode: query.code ? { contains: query.code } : undefined,
          binName: query.name ? { contains: query.name } : undefined,
          status:
            active === undefined ? undefined : active ? 'active' : 'inactive',
        },
        orderBy: [{ warehouseId: 'asc' }, { binCode: 'asc' }, { id: 'asc' }],
      });

      return {
        data: data.map(mapWarehouseBinRow),
        total: data.length,
      };
    });
  }

  async getById(tenantId: string, id: string): Promise<WarehouseBinDto | null> {
    const binId = toDbId(id);
    if (binId === null) {
      return null;
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.warehouseBin.findFirst({
        where: {
          id: binId,
          tenantId: tenantDbId,
          deletedAt: null,
        },
      });

      return row ? mapWarehouseBinRow(row) : null;
    });
  }

  async create(
    tenantId: string,
    actorId: string,
    command: CreateWarehouseBinCommand,
  ): Promise<WarehouseBinDto> {
    const warehouseId = toDbId(command.warehouseId);
    if (warehouseId === null) {
      throw new BadRequestException('warehouseId must be bigint-compatible');
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: warehouseId,
          tenantId: tenantDbId,
          deletedAt: null,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          `Warehouse with id ${command.warehouseId} not found`,
        );
      }

      const row = await tx.warehouseBin.create({
        data: {
          tenantId: tenantDbId,
          warehouseId,
          binCode: command.code,
          binName: command.name,
          zoneCode: command.zoneCode ?? null,
          binType: command.binType ?? null,
          status: command.status,
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      return mapWarehouseBinRow(row);
    });
  }

  async update(
    tenantId: string,
    actorId: string,
    id: string,
    command: UpdateWarehouseBinCommand,
  ): Promise<WarehouseBinDto> {
    const binId = toDbId(id);
    if (binId === null) {
      throw new BadRequestException('id must be bigint-compatible');
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const existing = await tx.warehouseBin.findFirst({
        where: {
          id: binId,
          tenantId: tenantDbId,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new NotFoundException(`Warehouse bin with id ${id} not found`);
      }

      const row = await tx.warehouseBin.update({
        where: { id: existing.id },
        data: {
          binName: command.name,
          zoneCode: command.zoneCode,
          binType: command.binType,
          status: command.status,
          updatedBy: actorId,
        },
      });

      return mapWarehouseBinRow(row);
    });
  }

  async remove(
    tenantId: string,
    actorId: string,
    id: string,
  ): Promise<{ readonly id: string; readonly deleted: true }> {
    const binId = toDbId(id);
    if (binId === null) {
      throw new BadRequestException('id must be bigint-compatible');
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const result = await tx.warehouseBin.updateMany({
        where: {
          id: binId,
          tenantId: tenantDbId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: actorId,
          updatedBy: actorId,
        },
      });

      if (result.count === 0) {
        throw new NotFoundException(`Warehouse bin with id ${id} not found`);
      }

      return {
        id,
        deleted: true,
      };
    });
  }
}
