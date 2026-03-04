/**
 * Supplier 主数据类型定义
 */

export interface SupplierEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateSupplierCommand {
  readonly code: string;
  readonly name: string;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
}

export interface UpdateSupplierCommand {
  readonly name?: string;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
  readonly isActive?: boolean;
}

export interface SupplierQueryFilter {
  readonly code?: string;
  readonly name?: string;
  readonly isActive?: boolean;
}

export interface SupplierRepository {
  findById(tenantId: string, id: string): Promise<SupplierEntity | null>;
  findByCode(tenantId: string, code: string): Promise<SupplierEntity | null>;
  findAll(tenantId: string, filter?: SupplierQueryFilter): Promise<readonly SupplierEntity[]>;
  save(tenantId: string, entity: Omit<SupplierEntity, 'tenantId'>): Promise<SupplierEntity>;
  update(tenantId: string, id: string, updates: UpdateSupplierCommand): Promise<SupplierEntity | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  existsByCode(tenantId: string, code: string): Promise<boolean>;
}
