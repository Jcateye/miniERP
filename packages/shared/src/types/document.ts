export const DOCUMENT_STATUSES = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'completed',
  'cancelled',
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const DOCUMENT_TYPES = ['PO', 'SO', 'GRN', 'OUT', 'ADJ', 'PAY', 'REC'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

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
