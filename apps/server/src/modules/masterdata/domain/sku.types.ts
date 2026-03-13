/**
 * SKU 主数据类型定义
 */

export interface SkuEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly specification: string | null;
  readonly baseUnit: string;
  readonly categoryId: string | null;
  readonly barcode: string | null;
  readonly batchManaged: boolean;
  readonly serialManaged: boolean;
  readonly minStockQty: string | null;
  readonly maxStockQty: string | null;
  readonly leadTimeDays: number | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateSkuCommand {
  readonly code: string;
  readonly name: string;
  readonly specification?: string | null;
  readonly baseUnit: string;
  readonly categoryId?: string | null;
  readonly barcode?: string | null;
  readonly batchManaged?: boolean;
  readonly serialManaged?: boolean;
  readonly minStockQty?: string | null;
  readonly maxStockQty?: string | null;
  readonly leadTimeDays?: number | null;
}

export interface UpdateSkuCommand {
  readonly name?: string;
  readonly specification?: string | null;
  readonly baseUnit?: string;
  readonly categoryId?: string | null;
  readonly barcode?: string | null;
  readonly batchManaged?: boolean;
  readonly serialManaged?: boolean;
  readonly minStockQty?: string | null;
  readonly maxStockQty?: string | null;
  readonly leadTimeDays?: number | null;
  readonly isActive?: boolean;
}

export interface SkuQueryFilter {
  readonly code?: string;
  readonly name?: string;
  readonly categoryId?: string;
  readonly isActive?: boolean;
}

export interface SkuRepository {
  findById(tenantId: string, id: string): Promise<SkuEntity | null>;
  findByCode(tenantId: string, code: string): Promise<SkuEntity | null>;
  findAll(
    tenantId: string,
    filter?: SkuQueryFilter,
  ): Promise<readonly SkuEntity[]>;
  save(
    tenantId: string,
    entity: Omit<SkuEntity, 'tenantId'>,
  ): Promise<SkuEntity>;
  update(
    tenantId: string,
    id: string,
    updates: UpdateSkuCommand,
  ): Promise<SkuEntity | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  existsByCode(tenantId: string, code: string): Promise<boolean>;
}
