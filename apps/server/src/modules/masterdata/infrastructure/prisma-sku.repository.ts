import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type {
  SkuEntity,
  SkuQueryFilter,
  SkuRepository,
  UpdateSkuCommand,
} from '../domain/sku.types';
import { resolveTenantDbId } from './prisma-tenant-id.resolver';

function mapSkuEntity(row: {
  id: bigint;
  tenantId: bigint;
  skuCode: string;
  name: string;
  specification: string | null;
  categoryId: string | null;
  unit: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SkuEntity {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    code: row.skuCode,
    name: row.name,
    specification: row.specification,
    baseUnit: row.unit ?? 'PCS',
    categoryId: row.categoryId,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaSkuRepository implements SkuRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDbId(value: string): bigint | null {
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }

  async findById(tenantId: string, id: string): Promise<SkuEntity | null> {
    const skuId = this.toDbId(id);
    if (skuId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);

    const row = await this.prisma.sku.findFirst({
      where: {
        tenantId: tenantDbId,
        id: skuId,
        deletedAt: null,
      },
    });

    return row ? mapSkuEntity(row) : null;
  }

  async findByCode(tenantId: string, code: string): Promise<SkuEntity | null> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);

    const row = await this.prisma.sku.findFirst({
      where: {
        tenantId: tenantDbId,
        skuCode: code,
        deletedAt: null,
      },
    });

    return row ? mapSkuEntity(row) : null;
  }

  async findAll(
    tenantId: string,
    filter?: SkuQueryFilter,
  ): Promise<readonly SkuEntity[]> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);

    const rows = await this.prisma.sku.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        skuCode: filter?.code ? { contains: filter.code } : undefined,
        name: filter?.name ? { contains: filter.name } : undefined,
        categoryId:
          filter?.categoryId !== undefined ? filter.categoryId : undefined,
        isActive: filter?.isActive !== undefined ? filter.isActive : undefined,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => mapSkuEntity(row));
  }

  async save(
    tenantId: string,
    entity: Omit<SkuEntity, 'tenantId'>,
  ): Promise<SkuEntity> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);

    const row = await this.prisma.sku.create({
      data: {
        tenantId: tenantDbId,
        skuCode: entity.code,
        name: entity.name,
        specification: entity.specification,
        categoryId: entity.categoryId,
        unit: entity.baseUnit,
        isActive: entity.isActive,
      },
    });

    return mapSkuEntity(row);
  }

  async update(
    tenantId: string,
    id: string,
    updates: UpdateSkuCommand,
  ): Promise<SkuEntity | null> {
    const skuId = this.toDbId(id);
    if (skuId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);

    const row = await this.prisma.sku.findFirst({
      where: {
        tenantId: tenantDbId,
        id: skuId,
        deletedAt: null,
      },
    });

    if (!row) {
      return null;
    }

    const updated = await this.prisma.sku.update({
      where: { id: row.id },
      data: {
        name: updates.name,
        specification: updates.specification,
        categoryId: updates.categoryId,
        unit: updates.baseUnit,
        isActive: updates.isActive,
      },
    });

    return mapSkuEntity(updated);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const skuId = this.toDbId(id);
    if (skuId === null) {
      return false;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);

    const result = await this.prisma.sku.updateMany({
      where: {
        tenantId: tenantDbId,
        id: skuId,
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

    const count = await this.prisma.sku.count({
      where: {
        tenantId: tenantDbId,
        skuCode: code,
        deletedAt: null,
      },
    });

    return count > 0;
  }
}
