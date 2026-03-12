import type { DecimalString, PageResult } from '../api';
import type { CanonicalEntity } from './common';

export const CANONICAL_INVENTORY_REFERENCE_TYPES = [
  'goods_receipt',
  'shipment',
  'stocktake',
  'adjustment',
  'reversal',
] as const;
export type CanonicalInventoryReferenceType =
  (typeof CANONICAL_INVENTORY_REFERENCE_TYPES)[number];

export interface InventoryTransactionRecord extends CanonicalEntity {
  readonly txnNo: string;
  readonly txnType: 'receipt' | 'issue' | 'transfer' | 'adjust';
  readonly referenceType?: CanonicalInventoryReferenceType | null;
  readonly referenceId?: string | null;
  readonly postedAt?: string | null;
}

export interface InventoryTransactionLineRecord {
  readonly id: string;
  readonly txnId: string;
  readonly lineNo: number;
  readonly itemId: string;
  readonly warehouseId: string;
  readonly fromBinId?: string | null;
  readonly toBinId?: string | null;
  readonly batchNo?: string | null;
  readonly serialNo?: string | null;
  readonly qty: DecimalString;
  readonly ext?: Record<string, unknown> | null;
}

export interface InventoryLedgerRecord extends CanonicalEntity {
  readonly itemId: string;
  readonly warehouseId: string;
  readonly binId?: string | null;
  readonly batchNo?: string | null;
  readonly serialNo?: string | null;
  readonly quantityDelta: DecimalString;
  readonly referenceType: CanonicalInventoryReferenceType;
  readonly referenceId: string;
  readonly reversalOfLedgerId?: string | null;
  readonly postedAt: string;
  readonly requestId?: string | null;
}

export interface InventoryBalanceRecord extends CanonicalEntity {
  readonly itemId: string;
  readonly warehouseId: string;
  readonly binId?: string | null;
  readonly batchNo?: string | null;
  readonly serialNo?: string | null;
  readonly onHandQuantity: DecimalString;
  readonly reservedQuantity: DecimalString;
  readonly availableQuantity: DecimalString;
  readonly lastTransactionAt?: string | null;
}

export type CanonicalInventoryLedgerPage = PageResult<InventoryLedgerRecord>;
export type CanonicalInventoryBalancePage = PageResult<InventoryBalanceRecord>;
