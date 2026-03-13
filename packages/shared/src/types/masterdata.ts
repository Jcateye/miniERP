/**
 * MasterData 类型定义
 * 统一 Server/Web/BFF 三端主数据类型
 */

import type { DecimalString } from './api';
import type { MasterDataStatus } from './domain';
import type {
  CustomerRecord,
  ItemRecord,
  SupplierRecord,
  TaxCodeRecord,
  UomRecord,
  WarehouseBinRecord,
  WarehouseRecord,
} from './erp';

export interface OrganizationEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly companyId: string;
  readonly code: string;
  readonly name: string;
  readonly type: 'company' | 'business_unit' | 'department' | 'warehouse' | 'finance';
  readonly parentId: string | null;
  readonly status: MasterDataStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ItemEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly specification: string | null;
  readonly baseUnit: string;
  readonly categoryId: string | null;
  readonly itemType: string | null;
  readonly taxCodeId: string | null;
  readonly taxRate: DecimalString | null;
  readonly barcode: string | null;
  readonly batchManaged: boolean;
  readonly serialManaged: boolean;
  readonly shelfLifeDays: number | null;
  readonly minStockQty: DecimalString | null;
  readonly maxStockQty: DecimalString | null;
  readonly leadTimeDays: number | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateItemCommand {
  readonly code: string;
  readonly name: string;
  readonly specification?: string | null;
  readonly baseUnit: string;
  readonly categoryId?: string | null;
  readonly itemType?: string | null;
  readonly taxCodeId?: string | null;
  readonly taxRate?: DecimalString | null;
  readonly barcode?: string | null;
  readonly batchManaged?: boolean;
  readonly serialManaged?: boolean;
  readonly shelfLifeDays?: number | null;
  readonly minStockQty?: DecimalString | null;
  readonly maxStockQty?: DecimalString | null;
  readonly leadTimeDays?: number | null;
}

export interface WarehouseEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly address: string | null;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly manageBin: boolean;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WarehouseBinEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly warehouseId: string;
  readonly code: string;
  readonly name: string;
  readonly zoneCode: string | null;
  readonly binType: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateWarehouseBinCommand {
  readonly warehouseId: string;
  readonly code: string;
  readonly name: string;
  readonly zoneCode?: string | null;
  readonly binType?: string | null;
  readonly status?: 'disabled' | 'normal';
}

export interface UpdateWarehouseBinCommand {
  readonly name?: string;
  readonly zoneCode?: string | null;
  readonly binType?: string | null;
  readonly status?: 'disabled' | 'normal';
}

export interface CreateWarehouseCommand {
  readonly code: string;
  readonly name: string;
  readonly address?: string | null;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly manageBin?: boolean;
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

export type CanonicalItemEntity = ItemRecord;
export type CanonicalCustomerEntity = CustomerRecord;
export type CanonicalSupplierEntity = SupplierRecord;
export type CanonicalWarehouseEntity = WarehouseRecord;
export type CanonicalWarehouseBinEntity = WarehouseBinRecord;
export type CanonicalUomEntity = UomRecord;
export type CanonicalTaxCodeEntity = TaxCodeRecord;
