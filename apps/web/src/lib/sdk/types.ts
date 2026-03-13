import type {
  ApiResponse,
  BigIntString,
  DecimalString,
  DocumentStatus,
  DocumentType,
  PaginatedResponse,
} from '@minierp/shared';

import type {
  DetailTemplateContract,
  EvidenceAttachInput,
  EvidenceCollectionContract,
  EvidenceUploadIntent,
  EvidenceUploadIntentInput,
  OverviewTemplateContract,
  WizardTemplateContract,
  WorkbenchTemplateContract,
} from '@/contracts';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;
export type ApiEnvelope<T> = ApiResponse<T>;
export type PaginationEnvelope<T> = PaginatedResponse<T>;

export interface SdkRequestDescriptor {
  path: string;
  method?: HttpMethod;
  query?: QueryParams;
  body?: unknown;
  headers?: Record<string, string>;
  mockKey?: string;
  parseAs?: 'response' | 'pagination';
}

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  idempotencyKey?: string;
}

export interface SdkClient {
  request<T>(
    descriptor: string | SdkRequestDescriptor,
    options?: RequestOptions,
  ): Promise<ApiEnvelope<T>>;
  requestPage<T>(
    descriptor: string | SdkRequestDescriptor,
    options?: RequestOptions,
  ): Promise<PaginationEnvelope<T>>;
}

export interface DfpAuditFields {
  id: BigIntString;
  tenantId: BigIntString;
  createdAt: string;
  createdBy: BigIntString;
  updatedAt: string;
  updatedBy: BigIntString;
  deletedAt?: string | null;
  deletedBy?: BigIntString | null;
}

export interface DfpDocumentHeaderRecord extends DfpAuditFields {
  docNo: string;
  docType: DocumentType;
  docDate: string;
  status: DocumentStatus | string;
  counterpartyId?: BigIntString | null;
  supplierId?: BigIntString | null;
  customerId?: BigIntString | null;
  remarks?: string | null;
}

export interface DfpDocumentLineRecord {
  id: BigIntString;
  docId: BigIntString;
  lineNo: number;
  skuId: BigIntString;
  binId?: BigIntString | null;
  itemNameSnapshot?: string | null;
  specModelSnapshot?: string | null;
  uom?: string | null;
  qty: DecimalString;
  unitPrice: DecimalString;
  amount: DecimalString;
  taxAmount?: DecimalString | null;
}

export interface DocumentListItemDto extends DfpDocumentHeaderRecord {
  lineCount: number;
  totalQty: DecimalString;
  totalAmount: DecimalString;
}

export interface DocumentDetailDto extends DfpDocumentHeaderRecord {
  lines: DfpDocumentLineRecord[];
}

export interface DocumentCommandAck {
  id: BigIntString;
  status: string;
  updatedAt: string;
}

export interface DocumentCreateLineInput {
  binId?: string;
  skuId: string;
  qty: DecimalString;
  unitPrice?: DecimalString;
}

export interface DocumentCreateInput {
  docType: DocumentType;
  docDate?: string;
  remarks?: string;
  supplierId?: string;
  customerId?: string;
  warehouseId?: string;
  sourceDocId?: string;
  lines: DocumentCreateLineInput[];
}

export interface DocumentCreateAck {
  id: BigIntString;
  docNo: string;
  docType: DocumentType;
  status: string;
  docDate: string;
  lineCount: number;
}

export interface InventoryLedgerEntryDto {
  id: BigIntString;
  skuId: BigIntString;
  docType: DocumentType;
  docNo: string;
  qtyDelta: DecimalString;
  balanceAfter: DecimalString;
  postedAt: string;
}

export interface TemplateSeedDto {
  overview?: OverviewTemplateContract;
  workbench?: WorkbenchTemplateContract;
  detail?: DetailTemplateContract;
  wizard?: WizardTemplateContract;
}

export interface WorkbenchQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string[];
  docDateFrom?: string;
  docDateTo?: string;
}

export type TemplateSeedKind = 'overview' | 'workbench' | 'detail' | 'wizard';

export interface TemplateSeedRequest {
  route: string;
  kind: TemplateSeedKind;
}

export interface EvidenceQuery {
  entityType: string;
  entityId: BigIntString;
  scope: 'document' | 'line';
  lineRef?: BigIntString;
  tag?: string;
}

export interface EvidenceAttachResponse {
  linkId: BigIntString;
  assetId: BigIntString;
}

export interface SdkShapeRegistry {
  listDocuments: PaginationEnvelope<DocumentListItemDto>;
  documentDetail: DocumentDetailDto;
  documentCommandAck: DocumentCommandAck;
  documentCreateAck: DocumentCreateAck;
  templateSeed: TemplateSeedDto;
  evidenceCollection: EvidenceCollectionContract;
  evidenceUploadIntent: EvidenceUploadIntent;
  evidenceAttachAck: EvidenceAttachResponse;
  inventoryLedgerPage: PaginationEnvelope<InventoryLedgerEntryDto>;
}

export type SdkTemplateContracts = Pick<
  TemplateSeedDto,
  'overview' | 'workbench' | 'detail' | 'wizard'
>;

export type EvidenceInputContracts = EvidenceUploadIntentInput | EvidenceAttachInput;

export type {
  DetailTemplateContract,
  EvidenceAttachInput,
  EvidenceCollectionContract,
  EvidenceUploadIntent,
  EvidenceUploadIntentInput,
  OverviewTemplateContract,
  WizardTemplateContract,
  WorkbenchTemplateContract,
};
