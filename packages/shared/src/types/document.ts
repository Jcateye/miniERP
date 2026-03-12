import type {
  DocumentStatusCode,
  LegacyDocumentType,
} from './erp';
import {
  DOCUMENT_STATUS_CODES,
  LEGACY_DOCUMENT_TYPES,
} from './erp';

/**
 * @deprecated Use `DocumentStatusCode` from `types/erp/trading`.
 */
export const DOCUMENT_STATUSES = DOCUMENT_STATUS_CODES;
/**
 * @deprecated Use `DocumentStatusCode` from `types/erp/trading`.
 */
export type DocumentStatus = DocumentStatusCode;

/**
 * @deprecated Use `LegacyDocumentType` or `CanonicalDocumentType` from `types/erp/trading`.
 */
export const DOCUMENT_TYPES = LEGACY_DOCUMENT_TYPES;
/**
 * @deprecated Use `LegacyDocumentType` or `CanonicalDocumentType` from `types/erp/trading`.
 */
export type DocumentType = LegacyDocumentType;

// 基础单据
export interface BaseDocument {
  id: string;
  docNo: string;
  docType: DocumentType;
  status: DocumentStatus;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// 单据行
export interface BaseDocumentLine {
  id: string;
  docId: string;
  lineNo: number;
  skuId: string;
  qty: number;
  unitPrice: number;
  amount: number;
}
