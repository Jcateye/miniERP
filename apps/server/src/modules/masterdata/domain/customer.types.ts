/**
 * Customer 主数据类型定义
 */

export interface CustomerEntity {
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

export interface CreateCustomerCommand {
  readonly code: string;
  readonly name: string;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
}

export interface UpdateCustomerCommand {
  readonly name?: string;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
  readonly isActive?: boolean;
}

export interface CustomerQueryFilter {
  readonly code?: string;
  readonly name?: string;
  readonly isActive?: boolean;
}

export interface CustomerRepository {
  findById(tenantId: string, id: string): Promise<CustomerEntity | null>;
  findByCode(tenantId: string, code: string): Promise<CustomerEntity | null>;
  findAll(tenantId: string, filter?: CustomerQueryFilter): Promise<readonly CustomerEntity[]>;
  save(tenantId: string, entity: Omit<CustomerEntity, 'tenantId'>): Promise<CustomerEntity>;
  update(tenantId: string, id: string, updates: UpdateCustomerCommand): Promise<CustomerEntity | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  existsByCode(tenantId: string, code: string): Promise<boolean>;
}
