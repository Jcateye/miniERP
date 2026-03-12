import type { DecimalString, PageResult } from '../api';
import type { CanonicalEntity, CanonicalLineAmount } from './common';

export const LEGACY_DOCUMENT_TYPES = [
  'PO',
  'GRN',
  'SO',
  'OUT',
  'ADJ',
  'PAY',
  'REC',
] as const;
export type LegacyDocumentType = (typeof LEGACY_DOCUMENT_TYPES)[number];

export const CORE_DOCUMENT_TYPES = ['PO', 'GRN', 'SO', 'OUT', 'ADJ'] as const;
export type CoreDocumentType = (typeof CORE_DOCUMENT_TYPES)[number];

export const CANONICAL_DOCUMENT_TYPES = [
  'quotation',
  'purchase_order',
  'goods_receipt',
  'sales_order',
  'shipment',
  'stocktake',
  'invoice',
  'receipt',
  'payment',
  'journal_entry',
] as const;
export type CanonicalDocumentType = (typeof CANONICAL_DOCUMENT_TYPES)[number];

export const DOCUMENT_STATUS_CODES = [
  'draft',
  'confirmed',
  'validating',
  'posted',
  'picking',
  'closed',
  'cancelled',
] as const;
export type DocumentStatusCode = (typeof DOCUMENT_STATUS_CODES)[number];

export const DOCUMENT_APPROVAL_STATUSES = [
  'not_required',
  'pending',
  'approved',
  'rejected',
] as const;
export type DocumentApprovalStatus = (typeof DOCUMENT_APPROVAL_STATUSES)[number];

export const LEGACY_TO_CANONICAL_DOCUMENT_TYPE: Record<
  LegacyDocumentType,
  CanonicalDocumentType
> = {
  ADJ: 'stocktake',
  GRN: 'goods_receipt',
  OUT: 'shipment',
  PAY: 'payment',
  PO: 'purchase_order',
  REC: 'receipt',
  SO: 'sales_order',
};

export const CANONICAL_TO_LEGACY_DOCUMENT_TYPE: Partial<
  Record<CanonicalDocumentType, LegacyDocumentType>
> = {
  goods_receipt: 'GRN',
  payment: 'PAY',
  purchase_order: 'PO',
  receipt: 'REC',
  sales_order: 'SO',
  shipment: 'OUT',
  stocktake: 'ADJ',
};

export const DOCUMENT_ACTION_TO_STATUS: Record<string, DocumentStatusCode> = {
  cancel: 'cancelled',
  close: 'closed',
  confirm: 'confirmed',
  pick: 'picking',
  post: 'posted',
  validate: 'validating',
} as const;

export interface CanonicalDocumentHeader extends CanonicalEntity {
  readonly docNo: string;
  readonly docDate: string;
  readonly docType: CanonicalDocumentType;
  readonly status: DocumentStatusCode;
  readonly approvalStatus?: DocumentApprovalStatus | null;
  readonly currency?: string | null;
  readonly exchangeRate?: DecimalString | null;
  readonly taxIncluded?: boolean | null;
  readonly warehouseId?: string | null;
  readonly counterpartyId?: string | null;
  readonly remarks?: string | null;
  readonly sourceRefType?: string | null;
  readonly sourceRefId?: string | null;
  readonly totalQty: DecimalString;
  readonly totalAmount: DecimalString;
  readonly taxAmount?: DecimalString | null;
  readonly totalWithTax?: DecimalString | null;
}

export interface CanonicalDocumentLine extends CanonicalLineAmount {
  readonly id: string;
  readonly docId: string;
  readonly lineNo: number;
  readonly itemId: string;
  readonly itemNameSnapshot?: string | null;
  readonly specModelSnapshot?: string | null;
  readonly uom: string;
  readonly warehouseId?: string | null;
  readonly binId?: string | null;
  readonly batchNo?: string | null;
  readonly serialNo?: string | null;
  readonly sourceLineId?: string | null;
  readonly lineStatus?: string | null;
  readonly ext?: Record<string, unknown> | null;
}

export interface CanonicalDocumentDetail extends CanonicalDocumentHeader {
  readonly lines: readonly CanonicalDocumentLine[];
}

export type CanonicalDocumentPage = PageResult<CanonicalDocumentHeader>;
