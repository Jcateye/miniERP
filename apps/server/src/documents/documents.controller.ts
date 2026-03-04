import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CORE_DOCUMENT_TYPES,
  type CoreDocumentType,
  type CoreDocumentStatus,
  getAllowedNextStatuses,
  InvalidStatusTransitionError,
} from '../modules/core-document/domain/status-transition';
import { IamGuard } from '../common/iam/iam.guard';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { AuditService } from '../audit/application/audit.service';

export interface DocumentListItemDto {
  id: string;
  tenantId: string;
  docNo: string;
  docType: string;
  docDate: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  lineCount: number;
  totalQty: string;
  totalAmount: string;
}

export interface DocumentLineDto {
  id: string;
  docId: string;
  lineNo: number;
  skuId: string;
  qty: string;
  unitPrice: string;
  amount: string;
  taxAmount: string;
}

export interface DocumentDetailDto extends DocumentListItemDto {
  lines: DocumentLineDto[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface InMemoryDocument {
  id: string;
  tenantId: string;
  docNo: string;
  docType: CoreDocumentType;
  docDate: string;
  status: CoreDocumentStatus;
  remarks: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy: string | null;
  lines: InMemoryDocumentLine[];
}

interface InMemoryDocumentLine {
  id: string;
  docId: string;
  lineNo: number;
  skuId: string;
  qty: number;
  unitPrice: number;
  amount: number;
  taxAmount: number;
}

// In-memory store for P0 MVP
const documentStore = new Map<string, InMemoryDocument>();
let docSequence = 1;

function generateDocNo(docType: CoreDocumentType): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `DOC-${docType}-${date}-${String(docSequence++).padStart(3, '0')}`;
}

function createMockDocument(
  tenantId: string,
  docType: CoreDocumentType,
  id: string,
): InMemoryDocument {
  const now = new Date();
  return {
    id,
    tenantId,
    docNo: generateDocNo(docType),
    docType,
    docDate: now.toISOString().slice(0, 10),
    status: 'draft',
    remarks: null,
    createdAt: now,
    createdBy: 'system',
    updatedAt: now,
    updatedBy: 'system',
    deletedAt: null,
    deletedBy: null,
    lines: [
      {
        id: `${id}-L1`,
        docId: id,
        lineNo: 1,
        skuId: 'SKU-001',
        qty: 100,
        unitPrice: 10.0,
        amount: 1000.0,
        taxAmount: 0,
      },
    ],
  };
}

// Initialize with sample data
function ensureSampleData(tenantId: string): void {
  const sampleDocs: Array<{ id: string; docType: CoreDocumentType }> = [
    { id: '2001', docType: 'PO' },
    { id: '2002', docType: 'PO' },
    { id: '3001', docType: 'GRN' },
    { id: '3002', docType: 'GRN' },
    { id: '4001', docType: 'SO' },
    { id: '4002', docType: 'SO' },
    { id: '5001', docType: 'OUT' },
    { id: '5002', docType: 'OUT' },
  ];

  for (const sample of sampleDocs) {
    const key = `${tenantId}:${sample.docType}:${sample.id}`;
    if (!documentStore.has(key)) {
      documentStore.set(
        key,
        createMockDocument(tenantId, sample.docType, sample.id),
      );
    }
  }
}

function toListItemDto(doc: InMemoryDocument): DocumentListItemDto {
  return {
    id: doc.id,
    tenantId: doc.tenantId,
    docNo: doc.docNo,
    docType: doc.docType,
    docDate: doc.docDate,
    status: doc.status,
    remarks: doc.remarks,
    createdAt: doc.createdAt.toISOString(),
    createdBy: doc.createdBy,
    updatedAt: doc.updatedAt.toISOString(),
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt?.toISOString() ?? null,
    deletedBy: doc.deletedBy,
    lineCount: doc.lines.length,
    totalQty: doc.lines.reduce((sum, l) => sum + l.qty, 0).toString(),
    totalAmount: doc.lines.reduce((sum, l) => sum + l.amount, 0).toFixed(2),
  };
}

function toDetailDto(doc: InMemoryDocument): DocumentDetailDto {
  return {
    ...toListItemDto(doc),
    lines: doc.lines.map((line) => ({
      id: line.id,
      docId: line.docId,
      lineNo: line.lineNo,
      skuId: line.skuId,
      qty: line.qty.toString(),
      unitPrice: line.unitPrice.toFixed(2),
      amount: line.amount.toFixed(2),
      taxAmount: line.taxAmount.toFixed(2),
    })),
  };
}

const ACTION_TO_STATUS: Record<string, CoreDocumentStatus> = {
  confirm: 'confirmed',
  validate: 'validating',
  post: 'posted',
  pick: 'picking',
  close: 'closed',
  cancel: 'cancelled',
};

@ApiTags('documents')
@Controller('documents')
@UseGuards(IamGuard)
export class DocumentsController {
  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List documents by type' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  @ApiQuery({ name: 'docType', enum: CORE_DOCUMENT_TYPES, required: false })
  listDocuments(
    @Query('docType') docType?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ): PaginatedResponse<DocumentListItemDto> {
    const context = this.tenantContextService.getRequiredContext();
    const tenantId = context.tenantId;

    ensureSampleData(tenantId);

    const filterType =
      (docType?.toUpperCase() as CoreDocumentType) ?? undefined;
    const docs: InMemoryDocument[] = [];

    for (const [key, doc] of documentStore.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        if (!filterType || doc.docType === filterType) {
          docs.push(doc);
        }
      }
    }

    const total = docs.length;
    const totalPages = Math.ceil(total / pageSize) || 0;
    const start = (page - 1) * pageSize;
    const paged = docs.slice(start, start + pageSize);

    return {
      data: paged.map(toListItemDto),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  @Get(':docType/:id')
  @ApiOperation({ summary: 'Get document detail' })
  @ApiParam({ name: 'docType', enum: CORE_DOCUMENT_TYPES })
  @ApiResponse({ status: 200, description: 'Document detail' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(
    @Param('docType') docType: string,
    @Param('id') id: string,
  ): Promise<DocumentDetailDto> {
    const context = this.tenantContextService.getRequiredContext();
    const tenantId = context.tenantId;
    const upperDocType = docType.toUpperCase() as CoreDocumentType;

    ensureSampleData(tenantId);

    const key = `${tenantId}:${upperDocType}:${id}`;
    const doc = documentStore.get(key);

    if (!doc) {
      throw new BadRequestException({
        code: 'NOT_FOUND_DOCUMENT',
        category: 'not_found',
        message: `Document ${docType}/${id} not found`,
      });
    }

    return toDetailDto(doc);
  }

  @Post(':docType/:id/:action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute document action' })
  @ApiParam({ name: 'docType', enum: CORE_DOCUMENT_TYPES })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for the action',
  })
  @ApiResponse({ status: 200, description: 'Action executed successfully' })
  @ApiResponse({ status: 400, description: 'Missing Idempotency-Key' })
  @ApiResponse({ status: 409, description: 'Invalid status transition' })
  async executeAction(
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Param('action') action: string,
    @Headers('Idempotency-Key') idempotencyKey?: string,
    @Body() _body?: unknown,
  ): Promise<DocumentDetailDto> {
    const context = this.tenantContextService.getRequiredContext();
    const tenantId = context.tenantId;
    const upperDocType = docType.toUpperCase() as CoreDocumentType;
    const normalizedAction = action.toLowerCase();

    // P0: Enforce Idempotency-Key
    if (!idempotencyKey || idempotencyKey.trim() === '') {
      throw new BadRequestException({
        code: 'VALIDATION_IDEMPOTENCY_KEY_REQUIRED',
        category: 'validation',
        message: 'Idempotency-Key header is required for document actions',
      });
    }

    ensureSampleData(tenantId);

    const key = `${tenantId}:${upperDocType}:${id}`;
    const doc = documentStore.get(key);

    if (!doc) {
      throw new BadRequestException({
        code: 'NOT_FOUND_DOCUMENT',
        category: 'not_found',
        message: `Document ${docType}/${id} not found`,
      });
    }

    const targetStatus = ACTION_TO_STATUS[normalizedAction];
    if (!targetStatus) {
      throw new BadRequestException({
        code: 'VALIDATION_ACTION_UNKNOWN',
        category: 'validation',
        message: `Unknown action: ${action}`,
      });
    }

    // Validate status transition using existing state machine
    const allowedNext = getAllowedNextStatuses(upperDocType, doc.status);
    if (!allowedNext.includes(targetStatus)) {
      throw new InvalidStatusTransitionError(
        {
          entityType: upperDocType,
          entityId: id,
          fromStatus: doc.status,
          toStatus: targetStatus,
        },
        allowedNext,
      );
    }

    // Apply transition
    doc.status = targetStatus;
    doc.updatedAt = new Date();
    doc.updatedBy = context.actorId ?? 'system';

    // Record audit
    this.auditService.recordDocumentAction({
      requestId: context.requestId,
      tenantId,
      actorId: context.actorId ?? 'unknown',
      action: `document.${normalizedAction}`,
      entityType: upperDocType,
      entityId: id,
      result: 'success',
      idempotencyKey,
    });

    return toDetailDto(doc);
  }
}
