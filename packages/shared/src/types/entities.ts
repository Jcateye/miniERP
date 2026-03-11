import type { DecimalString } from './api';
import type { Family, OrderStatus, Status } from './enums';

/**
 * 共享实体的最小审计字段。
 */
export interface AuditedEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * 带编号、名称和状态的基础主数据实体。
 */
export interface NamedEntity extends AuditedEntity {
  readonly code: string;
  readonly name: string;
  readonly status: Status;
}

/**
 * 物料（SKU）基础实体。
 */
export interface Sku extends NamedEntity {
  readonly specification: string | null;
  readonly unit: string;
  readonly categoryId: string | null;
  readonly barcode: string | null;
  readonly batchManaged: boolean;
  readonly serialManaged: boolean;
}

/**
 * 客户基础实体。
 */
export interface Customer extends NamedEntity {
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly creditLimit: DecimalString | null;
}

/**
 * 供应商基础实体。
 */
export interface Supplier extends NamedEntity {
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
}

/**
 * 仓库基础实体。
 */
export interface Warehouse extends NamedEntity {
  readonly address: string | null;
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly supportsBinManagement: boolean;
}

/**
 * 订单基类。
 * 作为采购、销售等单据的共享最小契约，不承载具体业务字段。
 */
export interface Order extends AuditedEntity {
  readonly orderNo: string;
  readonly family: Family;
  readonly status: OrderStatus;
  readonly orderDate: string;
  readonly counterpartyId: string | null;
  readonly warehouseId: string | null;
  readonly remarks: string | null;
  readonly totalAmount: DecimalString | null;
}

/**
 * 库存余额实体。
 * `inventory_ledger` 仍是事实源，此类型仅表达查询层余额快照。
 */
export interface InventoryBalance extends AuditedEntity {
  readonly skuId: string;
  readonly warehouseId: string;
  readonly onHandQuantity: DecimalString;
  readonly reservedQuantity: DecimalString;
  readonly availableQuantity: DecimalString;
  readonly lastTransactionAt: string | null;
}
