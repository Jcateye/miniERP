import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type {
  UpdateWarehouseCommand,
  WarehouseEntity,
  WarehouseQueryFilter,
  WarehouseRepository,
} from '../domain/warehouse.types';
import { resolveTenantDbId } from './prisma-tenant-id.resolver';

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function mapWarehouseEntity(row: {
  id: bigint;
  tenantId: bigint;
  code: string;
  name: string;
  address: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): WarehouseEntity {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    code: row.code,
    name: row.name,
    address: row.address,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaWarehouseRepository implements WarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    tenantId: string,
    id: string,
  ): Promise<WarehouseEntity | null> {
    const warehouseId = toDbId(id);
    if (warehouseId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.warehouse.findFirst({
      where: {
        tenantId: tenantDbId,
        id: warehouseId,
        deletedAt: null,
      },
    });

    return row ? mapWarehouseEntity(row) : null;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<WarehouseEntity | null> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.warehouse.findFirst({
      where: {
        tenantId: tenantDbId,
        code,
        deletedAt: null,
      },
    });

    return row ? mapWarehouseEntity(row) : null;
  }

  async findAll(
    tenantId: string,
    filter?: WarehouseQueryFilter,
  ): Promise<readonly WarehouseEntity[]> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const rows = await this.prisma.warehouse.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        code: filter?.code ? { contains: filter.code } : undefined,
        name: filter?.name ? { contains: filter.name } : undefined,
        isActive: filter?.isActive !== undefined ? filter.isActive : undefined,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => mapWarehouseEntity(row));
  }

  async save(
    tenantId: string,
    entity: Omit<WarehouseEntity, 'tenantId'>,
  ): Promise<WarehouseEntity> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.warehouse.create({
      data: {
        tenantId: tenantDbId,
        code: entity.code,
        name: entity.name,
        address: entity.address,
        contactPerson: entity.contactPerson,
        contactPhone: entity.contactPhone,
        isActive: entity.isActive,
      },
    });

    return mapWarehouseEntity(row);
  }

  async update(
    tenantId: string,
    id: string,
    updates: UpdateWarehouseCommand,
  ): Promise<WarehouseEntity | null> {
    const warehouseId = toDbId(id);
    if (warehouseId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.warehouse.findFirst({
      where: {
        tenantId: tenantDbId,
        id: warehouseId,
        deletedAt: null,
      },
    });

    if (!row) {
      return null;
    }

    const updated = await this.prisma.warehouse.update({
      where: { id: row.id },
      data: {
        name: updates.name,
        address: updates.address,
        contactPerson: updates.contactPerson,
        contactPhone: updates.contactPhone,
        isActive: updates.isActive,
      },
    });

    return mapWarehouseEntity(updated);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const warehouseId = toDbId(id);
    if (warehouseId === null) {
      return false;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const result = await this.prisma.warehouse.updateMany({
      where: {
        tenantId: tenantDbId,
        id: warehouseId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: 'system',
      },
    });

    return result.count > 0;
  }

  async existsByCode(tenantId: string, code: string): Promise<boolean> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const count = await this.prisma.warehouse.count({
      where: {
        tenantId: tenantDbId,
        code,
        deletedAt: null,
      },
    });

    return count > 0;
  }
}
