/**
 * ADR-006 P1 Contract: Documents 类型定义
 * 统一 Server/Web/BFF 三端的文档类型
 */

import type { DecimalString, BigIntString } from './api';

// 重新导出数值类型供其他模块使用
export type { DecimalString, BigIntString } from './api';

// 核心单据类型
export const CORE_DOCUMENT_TYPES = ['PO', 'GRN', 'SO', 'OUT', 'ADJ'] as const;
export type CoreDocumentType = (typeof CORE_DOCUMENT_TYPES)[number];

// 核心单据状态
export const CORE_DOCUMENT_STATUSES = [
  'draft',
  'confirmed',
  'validating',
  'posted',
  'picking',
  'closed',
  'cancelled',
] as const;
export type CoreDocumentStatus = (typeof CORE_DOCUMENT_STATUSES)[number];

// 动作到状态映射
export const DOCUMENT_ACTION_TO_STATUS: Record<string, CoreDocumentStatus> = {
  confirm: 'confirmed',
  validate: 'validating',
  post: 'posted',
  pick: 'picking',
  close: 'closed',
  cancel: 'cancelled',
} as const;

// 审计字段
export interface DocumentAuditFields {
  tenantId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

// 单据行 DTO
export interface DocumentLineDto {
  id: string;
  docId: string;
  lineNo: number;
  skuId: string;
  qty: DecimalString;
  unitPrice: DecimalString;
  amount: DecimalString;
  taxAmount?: DecimalString | null;
}

// 单据列表项 DTO
export interface DocumentListItemDto extends DocumentAuditFields {
  id: string;
  docNo: string;
  docType: CoreDocumentType;
  docDate: string;
  status: CoreDocumentStatus;
  remarks?: string | null;
  lineCount: number;
  totalQty: DecimalString;
  totalAmount: DecimalString;
}

// 单据详情 DTO
export interface DocumentDetailDto extends DocumentListItemDto {
  lines: DocumentLineDto[];
}

// 单据动作结果 DTO
export interface DocumentActionResult {
  success: true;
  documentId: string;
  docType: CoreDocumentType;
  previousStatus: CoreDocumentStatus;
  newStatus: CoreDocumentStatus;
  action: string;
  inventoryPosted?: boolean;
  ledgerEntryIds?: string[];
}

// 分页查询参数
export interface DocumentListQuery {
  docType?: CoreDocumentType;
  page?: number;
  pageSize?: number;
}

// 分页响应包装
export interface PaginationEnvelope<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
