import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  type CoreDocumentType,
  CORE_DOCUMENT_TYPES,
} from '../../core-document/domain/status-transition';
import {
  type DocumentCreateInput,
  DocumentNotFoundError,
  DocumentsService,
  OutboundStockInsufficientError,
  UnknownDocumentActionError,
} from '../services/documents.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  return '';
}

function parseCreateDocumentPayload(
  payload: unknown,
  normalizeDocType: (docType?: string) => CoreDocumentType,
): { docType: CoreDocumentType; input: DocumentCreateInput } {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;
  const docType = normalizeDocType(toStringValue(candidate.docType));
  const linesRaw = candidate.lines;

  if (!Array.isArray(linesRaw) || linesRaw.length === 0) {
    throw new Error('lines must be a non-empty array');
  }

  const lines = linesRaw.map((line, index) => {
    if (!line || typeof line !== 'object') {
      throw new Error(`lines[${index}] must be an object`);
    }

    const row = line as Record<string, unknown>;
    const skuId = toStringValue(row.skuId ?? row.sku ?? row.code).trim();
    const qty = toStringValue(row.qty ?? row.quantity ?? row.expected ?? row.actual ?? row.diff).trim();
    const unitPrice = toStringValue(row.unitPrice ?? row.price).trim();

    if (!isNonEmptyString(skuId)) {
      throw new Error(`lines[${index}].skuId is required`);
    }

    if (!isNonEmptyString(qty)) {
      throw new Error(`lines[${index}].qty is required`);
    }

    return {
      skuId,
      qty,
      unitPrice: unitPrice.length > 0 ? unitPrice : undefined,
    };
  });

  return {
    docType,
    input: {
      docDate: isNonEmptyString(candidate.docDate) ? candidate.docDate.trim() : undefined,
      remarks: isNonEmptyString(candidate.remarks)
        ? candidate.remarks.trim()
        : undefined,
      supplierId: isNonEmptyString(candidate.supplierId)
        ? candidate.supplierId.trim()
        : undefined,
      customerId: isNonEmptyString(candidate.customerId)
        ? candidate.customerId.trim()
        : undefined,
      warehouseId: isNonEmptyString(candidate.warehouseId)
        ? candidate.warehouseId.trim()
        : undefined,
      sourceDocId: isNonEmptyString(candidate.sourceDocId)
        ? candidate.sourceDocId.trim()
        : undefined,
      lines,
    },
  };
}

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('docType') docType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const normalizedDocType = this.normalizeDocType(docType);
    const normalizedPage = this.normalizePositiveInt(page, 'page');
    const normalizedPageSize = this.normalizePositiveInt(pageSize, 'pageSize');

    return this.documentsService.list({
      docType: normalizedDocType,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    }, ctx.tenantId);
  }

  @Get(':docType/:id')
  async getDetail(
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const normalizedDocType = this.normalizeDocType(docType);

    const doc = await this.documentsService.getDetail(
      normalizedDocType,
      id,
      ctx.tenantId,
    );

    if (!doc) {
      return {
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: `Document ${docType}/${id} not found`,
        },
      };
    }

    return doc;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDocument(
    @Headers('idempotency-key') idempotencyKey?: string,
    @Body() body?: unknown,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();

    if (!idempotencyKey || idempotencyKey.trim() === '') {
      return {
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for document create',
          category: 'validation',
        },
      };
    }

    let parsed: { docType: CoreDocumentType; input: DocumentCreateInput };
    try {
      parsed = parseCreateDocumentPayload(body, (value) =>
        this.normalizeDocType(value),
      );
    } catch (error) {
      return {
        error: {
          code: 'VALIDATION_INVALID_PAYLOAD',
          message: error instanceof Error ? error.message : 'Invalid payload',
          category: 'validation',
        },
      };
    }

    const result = await this.documentsService.create(
      parsed.docType,
      parsed.input,
      ctx.tenantId,
      ctx.actorId ?? 'unknown',
      ctx.requestId,
      idempotencyKey,
    );

    return result;
  }

  @Post(':docType/:id/:action')
  @HttpCode(HttpStatus.OK)
  async executeAction(
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Param('action') action: string,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Body() body?: Record<string, unknown>,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();

    if (!idempotencyKey || idempotencyKey.trim() === '') {
      return {
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for document actions',
          category: 'validation',
        },
      };
    }

    const normalizedDocType = this.normalizeDocType(docType);

    try {
      const result = await this.documentsService.executeAction(
        normalizedDocType,
        id,
        action,
        idempotencyKey,
        ctx.tenantId,
        ctx.actorId ?? 'unknown',
        ctx.requestId,
      );

      return result;
    } catch (error) {
      if (error instanceof DocumentNotFoundError) {
        return {
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: error.message,
          },
        };
      }
      if (error instanceof UnknownDocumentActionError) {
        return {
          error: {
            code: 'UNKNOWN_ACTION',
            message: error.message,
          },
        };
      }
      if (error instanceof OutboundStockInsufficientError) {
        return {
          error: {
            code: 'OUTBOUND_STOCK_INSUFFICIENT',
            message: error.message,
            category: 'conflict',
          },
        };
      }
      throw error;
    }
  }

  private normalizeDocType(docType?: string): CoreDocumentType {
    const upper = (docType ?? 'PO').toUpperCase();
    if (!CORE_DOCUMENT_TYPES.includes(upper as CoreDocumentType)) {
      throw new Error(`Invalid document type: ${docType}`);
    }
    return upper as CoreDocumentType;
  }

  private normalizePositiveInt(
    value: string | undefined,
    field: 'page' | 'pageSize',
  ): number | undefined {
    if (!value) {
      return undefined;
    }

    if (!/^[1-9]\d*$/.test(value)) {
      throw new Error(`${field} must be a positive integer`);
    }

    return Number(value);
  }
}
