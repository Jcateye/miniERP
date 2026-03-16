import { Injectable } from '@nestjs/common';
import { PlatformDbService } from '../../../database/platform-db.service';
import type {
  SkuEntity,
  SkuQueryFilter,
  SkuRepository,
  UpdateSkuCommand,
} from '../domain/sku.types';
import { resolveTenantDbId } from './prisma-tenant-id.resolver';

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function mapSkuEntity(row: {
  id: bigint;
  tenantId: bigint;
  skuCode: string;
  name: string;
  specification: string | null;
  categoryId: string | null;
  unit: string | null;
  itemType: string | null;
  taxCodeId: bigint | null;
  taxRate: { toString(): string } | null;
  barcode: string | null;
  batchManaged: boolean;
  serialManaged: boolean;
  shelfLifeDays: number | null;
  minStockQty: { toString(): string } | null;
  maxStockQty: { toString(): string } | null;
  leadTimeDays: number | null;
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
    itemType: row.itemType,
    taxCodeId: row.taxCodeId?.toString() ?? null,
    taxRate: row.taxRate?.toString() ?? null,
    barcode: row.barcode,
    batchManaged: row.batchManaged,
    serialManaged: row.serialManaged,
    shelfLifeDays: row.shelfLifeDays,
    minStockQty: row.minStockQty?.toString() ?? null,
    maxStockQty: row.maxStockQty?.toString() ?? null,
    leadTimeDays: row.leadTimeDays,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaSkuRepository implements SkuRepository {
  constructor(private readonly platformDb: PlatformDbService) {}

  async findById(tenantId: string, id: string): Promise<SkuEntity | null> {
    const skuId = toDbId(id);
    if (skuId === null) {
      return null;
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.sku.findFirst({
        where: {
          tenantId: tenantDbId,
          id: skuId,
          deletedAt: null,
        },
      });

      return row ? mapSkuEntity(row) : null;
    });
  }

  async findByCode(tenantId: string, code: string): Promise<SkuEntity | null> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.sku.findFirst({
        where: {
          tenantId: tenantDbId,
          skuCode: code,
          deletedAt: null,
        },
      });

      return row ? mapSkuEntity(row) : null;
    });
  }

  async findAll(
    tenantId: string,
    filter?: SkuQueryFilter,
  ): Promise<readonly SkuEntity[]> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const rows = await tx.sku.findMany({
        where: {
          tenantId: tenantDbId,
          deletedAt: null,
          skuCode: filter?.code ? { contains: filter.code } : undefined,
          name: filter?.name ? { contains: filter.name } : undefined,
          categoryId:
            filter?.categoryId !== undefined ? filter.categoryId : undefined,
          isActive:
            filter?.isActive !== undefined ? filter.isActive : undefined,
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });

      return rows.map((row) => mapSkuEntity(row));
    });
  }

  async save(
    tenantId: string,
    entity: Omit<SkuEntity, 'tenantId'>,
  ): Promise<SkuEntity> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.sku.create({
        data: {
          tenantId: tenantDbId,
          skuCode: entity.code,
          name: entity.name,
          specification: entity.specification,
          categoryId: entity.categoryId,
          unit: entity.baseUnit,
          itemType: entity.itemType,
          taxCodeId: toDbId(entity.taxCodeId ?? ''),
          taxRate: entity.taxRate,
          barcode: entity.barcode,
          batchManaged: entity.batchManaged,
          serialManaged: entity.serialManaged,
          shelfLifeDays: entity.shelfLifeDays,
          minStockQty: entity.minStockQty,
          maxStockQty: entity.maxStockQty,
          leadTimeDays: entity.leadTimeDays,
          isActive: entity.isActive,
        },
      });

      return mapSkuEntity(row);
    });
  }

  async update(
    tenantId: string,
    id: string,
    updates: UpdateSkuCommand,
  ): Promise<SkuEntity | null> {
    const skuId = toDbId(id);
    if (skuId === null) {
      return null;
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const row = await tx.sku.findFirst({
        where: {
          tenantId: tenantDbId,
          id: skuId,
          deletedAt: null,
        },
      });

      if (!row) {
        return null;
      }

      const updated = await tx.sku.update({
        where: { id: row.id },
        data: {
          name: updates.name,
          specification: updates.specification,
          categoryId: updates.categoryId,
          unit: updates.baseUnit,
          itemType: updates.itemType,
          taxCodeId:
            updates.taxCodeId === undefined
              ? undefined
              : toDbId(updates.taxCodeId ?? ''),
          taxRate: updates.taxRate,
          barcode: updates.barcode,
          batchManaged: updates.batchManaged,
          serialManaged: updates.serialManaged,
          shelfLifeDays: updates.shelfLifeDays,
          minStockQty: updates.minStockQty,
          maxStockQty: updates.maxStockQty,
          leadTimeDays: updates.leadTimeDays,
          isActive: updates.isActive,
        },
      });

      return mapSkuEntity(updated);
    });
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const skuId = toDbId(id);
    if (skuId === null) {
      return false;
    }

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const result = await tx.sku.updateMany({
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
    });
  }

  async existsByCode(tenantId: string, code: string): Promise<boolean> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const count = await tx.sku.count({
        where: {
          tenantId: tenantDbId,
          skuCode: code,
          deletedAt: null,
        },
      });

      return count > 0;
    });
  }
}
