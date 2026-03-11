/**
 * Warehouse 主数据类型定义
 */

export interface WarehouseEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly address: string | null;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateWarehouseCommand {
  readonly code: string;
  readonly name: string;
  readonly address?: string | null;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
}

export interface UpdateWarehouseCommand {
  readonly name?: string;
  readonly address?: string | null;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly isActive?: boolean;
}

export interface WarehouseQueryFilter {
  readonly code?: string;
  readonly name?: string;
  readonly isActive?: boolean;
}

export interface WarehouseRepository {
  findById(tenantId: string, id: string): Promise<WarehouseEntity | null>;
  findByCode(tenantId: string, code: string): Promise<WarehouseEntity | null>;
  findAll(
    tenantId: string,
    filter?: WarehouseQueryFilter,
  ): Promise<readonly WarehouseEntity[]>;
  save(
    tenantId: string,
    entity: Omit<WarehouseEntity, 'tenantId'>,
  ): Promise<WarehouseEntity>;
  update(
    tenantId: string,
    id: string,
    updates: UpdateWarehouseCommand,
  ): Promise<WarehouseEntity | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  existsByCode(tenantId: string, code: string): Promise<boolean>;
}
