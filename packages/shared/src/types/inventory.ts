/**
 * ADR-006 P1 Contract: Inventory 类型定义
 * 统一 Server/Web/BFF 三端的库存类型
 */
import type { PaginatedResponse } from './api';
import type {
  CanonicalInventoryBalancePage,
  CanonicalInventoryLedgerPage,
  InventoryBalanceRecord,
  InventoryLedgerRecord,
} from './erp';

// 库存引用类型
export const INVENTORY_REFERENCE_TYPES = [
  'GRN',
  'OUT',
  'STOCKTAKE',
  'ADJUSTMENT',
  'REVERSAL',
] as const;
export type InventoryReferenceType =
  (typeof INVENTORY_REFERENCE_TYPES)[number];

// 库存 Key
export interface InventoryKey {
  skuId: string;
  warehouseId: string;
}

// 库存过账行
export interface InventoryPostingLine extends InventoryKey {
  quantityDelta: number;
}

// 库存过账命令
export interface InventoryPostingCommand {
  idempotencyKey: string;
  referenceType: InventoryReferenceType;
  referenceId: string;
  lines: InventoryPostingLine[];
}

// 库存冲销命令
export interface InventoryReversalCommand {
  idempotencyKey: string;
  referenceId: string;
  ledgerIds: string[];
}

// 库存分类账条目
export interface InventoryLedgerEntry {
  id: string;
  tenantId: string;
  skuId: string;
  warehouseId: string;
  quantityDelta: number;
  referenceType: InventoryReferenceType;
  referenceId: string;
  reversalOfLedgerId: string | null;
  postedAt: string;
  createdAt?: string;
}

// 库存余额快照
export interface InventoryBalanceSnapshot extends InventoryKey {
  onHand: number;
}

// 库存过账结果
export interface InventoryPostingResult {
  ledgerEntries: InventoryLedgerEntry[];
  balanceSnapshots: readonly InventoryBalanceSnapshot[];
}

export interface InventoryMovementCommand {
  skuId: string;
  warehouseId: string;
  quantity: number;
  referenceId?: string;
}

export interface InventoryMovementResponse {
  movementType: 'INBOUND' | 'OUTBOUND';
  referenceType: Extract<InventoryReferenceType, 'GRN' | 'OUT'>;
  referenceId: string;
  quantity: number;
  ledgerEntries: readonly InventoryLedgerEntry[];
  balance: InventoryBalanceSnapshot;
}

export type InventoryBalancePage = PaginatedResponse<InventoryBalanceSnapshot>;
export type InventoryLedgerPage = PaginatedResponse<InventoryLedgerEntry>;

// 库存错误类型
export const INVENTORY_ERROR_CODES = {
  VALIDATION_ERROR: 'INVENTORY_VALIDATION_ERROR',
  INSUFFICIENT_STOCK: 'INVENTORY_INSUFFICIENT_STOCK',
  IDEMPOTENCY_CONFLICT: 'INVENTORY_IDEMPOTENCY_CONFLICT',
  LEDGER_NOT_FOUND: 'INVENTORY_LEDGER_NOT_FOUND',
  ALREADY_REVERSED: 'INVENTORY_ALREADY_REVERSED',
} as const;

// 库存 Ledger DTO（用于 API 响应）
export interface InventoryLedgerDto {
  id: string;
  skuId: string;
  warehouseId: string;
  docType: string;
  docNo: string;
  qtyDelta: string;
  balanceAfter: string;
  postedAt: string;
}

export type CanonicalInventoryLedger = InventoryLedgerRecord;
export type CanonicalInventoryBalance = InventoryBalanceRecord;
export type CanonicalInventoryLedgerList = CanonicalInventoryLedgerPage;
export type CanonicalInventoryBalanceList = CanonicalInventoryBalancePage;
