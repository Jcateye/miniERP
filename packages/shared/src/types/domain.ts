export const BUSINESS_ENTITY_TYPES = [
  'tenant',
  'company',
  'org_unit',
  'user',
  'role',
  'permission',
  'customer',
  'supplier',
  'item',
  'item_mapping',
  'item_substitution',
  'bom',
  'bom_line',
  'warehouse',
  'warehouse_bin',
  'quotation',
  'purchase_order',
  'goods_receipt',
  'sales_order',
  'shipment',
  'stocktake',
  'inventory_txn',
  'inventory_ledger',
  'inventory_balance',
  'production_order',
  'work_order',
  'qc_record',
  'invoice',
  'receipt',
  'payment',
  'journal_entry',
  'gl_account',
  'cost_center',
  'project',
  'budget',
  'workflow_instance',
  'approval_task',
  'notification',
  'integration_endpoint',
  'integration_job',
  'integration_log',
  'report_definition',
  'dashboard_definition',
  'evidence_asset',
  'evidence_link',
  'attachment_archive',
  'api_client',
  'api_call_log',
  'audit_log',
  'state_transition_log',
  'idempotency_record',
  'outbox_event',
] as const;
export type BusinessEntityType = (typeof BUSINESS_ENTITY_TYPES)[number];

export const BIZ_DOC_TYPES = [
  'PO',
  'GRN',
  'SO',
  'OUT',
  'ADJ',
  'PAY',
  'REC',
  'QUOTE',
  'INV',
  'JE',
  'MO',
  'QC',
] as const;
export type BizDocType = (typeof BIZ_DOC_TYPES)[number];

export const REFERENCE_TYPES = [
  'purchase_order',
  'goods_receipt',
  'sales_order',
  'shipment',
  'stocktake',
  'inventory_txn',
  'quotation',
  'invoice',
  'receipt',
  'payment',
  'journal_entry',
  'production_order',
  'work_order',
  'qc_record',
  'workflow_task',
] as const;
export type ReferenceType = (typeof REFERENCE_TYPES)[number];

export const EVIDENCE_ENTITY_TYPES = [
  'po',
  'grn',
  'so',
  'out',
  'adj',
  'pay',
  'rec',
  'quotation',
  'purchase_order',
  'goods_receipt',
  'sales_order',
  'shipment',
  'stocktake',
  'item',
  'sku',
  'inventory_ledger',
  'invoice',
  'journal_entry',
  'qc_record',
  'workflow_task',
  'customer',
  'supplier',
] as const;
export type EvidenceEntityType = (typeof EVIDENCE_ENTITY_TYPES)[number];

export const MASTER_DATA_STATUSES = ['active', 'inactive', 'archived'] as const;
export type MasterDataStatus = (typeof MASTER_DATA_STATUSES)[number];

export const PURCHASE_DOCUMENT_STATUSES = ['draft', 'confirmed', 'closed', 'cancelled'] as const;
export type PurchaseDocumentStatus = (typeof PURCHASE_DOCUMENT_STATUSES)[number];

export const GOODS_RECEIPT_STATUSES = ['draft', 'validating', 'posted', 'cancelled'] as const;
export type GoodsReceiptStatus = (typeof GOODS_RECEIPT_STATUSES)[number];

export const SALES_DOCUMENT_STATUSES = ['draft', 'confirmed', 'closed', 'cancelled'] as const;
export type SalesDocumentStatus = (typeof SALES_DOCUMENT_STATUSES)[number];

export const SHIPMENT_STATUSES = ['draft', 'picking', 'posted', 'cancelled'] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const STOCKTAKE_STATUSES = ['draft', 'validating', 'posted', 'cancelled'] as const;
export type StocktakeStatus = (typeof STOCKTAKE_STATUSES)[number];

export const QUOTATION_STATUSES = ['draft', 'reviewing', 'published', 'cancelled'] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const PRODUCTION_ORDER_STATUSES = [
  'draft',
  'released',
  'in_progress',
  'completed',
  'closed',
  'cancelled',
] as const;
export type ProductionOrderStatus = (typeof PRODUCTION_ORDER_STATUSES)[number];

export const QC_RECORD_STATUSES = ['draft', 'pending', 'passed', 'failed', 'waived', 'closed'] as const;
export type QcRecordStatus = (typeof QC_RECORD_STATUSES)[number];

export const INVOICE_STATUSES = [
  'draft',
  'issued',
  'partially_settled',
  'settled',
  'reversed',
  'cancelled',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = ['draft', 'confirmed', 'settled', 'cancelled'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const RECEIPT_STATUSES = ['draft', 'confirmed', 'settled', 'cancelled'] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number];

export const JOURNAL_ENTRY_STATUSES = ['draft', 'posted', 'reversed', 'cancelled'] as const;
export type JournalEntryStatus = (typeof JOURNAL_ENTRY_STATUSES)[number];

export const WORKFLOW_TASK_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'delegated',
  'cancelled',
] as const;
export type WorkflowTaskStatus = (typeof WORKFLOW_TASK_STATUSES)[number];
