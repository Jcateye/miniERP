/**
 * ADR-006 P1 Contract: Documents 类型定义
 * 统一 Server/Web/BFF 三端的文档类型
 */

import type { DecimalString, PageResult } from './api';
import type {
  CanonicalDocumentDetail,
  CanonicalDocumentHeader,
  CanonicalDocumentLine,
  CoreDocumentType,
  DocumentStatusCode,
} from './erp';
import {
  CORE_DOCUMENT_TYPES,
  DOCUMENT_ACTION_TO_STATUS,
  DOCUMENT_STATUS_CODES,
} from './erp';

// 重新导出数值类型供其他模块使用
export type { DecimalString, BigIntString } from './api';

// 核心单据类型与状态统一转发 canonical trading source
export { CORE_DOCUMENT_TYPES, DOCUMENT_ACTION_TO_STATUS };
export type { CoreDocumentType };

export const CORE_DOCUMENT_STATUSES = DOCUMENT_STATUS_CODES;
export type CoreDocumentStatus = DocumentStatusCode;

// 审计字段
export type DocumentAuditFields = Omit<
  CanonicalDocumentHeader,
  'docType' | 'status'
>;

// 单据行 DTO
export interface DocumentLineDto
  extends Omit<CanonicalDocumentLine, 'itemId' | 'uom'> {
  skuId: string;
  unitPrice: DecimalString;
  amount: DecimalString;
}

// 单据列表项 DTO
export interface DocumentListItemDto
  extends Omit<CanonicalDocumentHeader, 'docType' | 'status'> {
  docType: CoreDocumentType;
  status: CoreDocumentStatus;
  lineCount: number;
}

// 单据详情 DTO
export interface DocumentDetailDto
  extends Omit<CanonicalDocumentDetail, 'docType' | 'status' | 'lines'>,
    DocumentListItemDto {
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
export type PaginationEnvelope<T> = PageResult<T>;
