/**
 * MasterData 类型定义
 * 统一 Server/Web/BFF 三端主数据类型
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
