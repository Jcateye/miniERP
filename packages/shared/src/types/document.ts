// 单据状态
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

// 单据类型
export type DocumentType = 'PO' | 'SO' | 'GRN' | 'OUT' | 'ADJ' | 'PAY' | 'REC';

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
