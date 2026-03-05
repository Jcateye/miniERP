import {
  Body,
  Controller,
  Get,
  Header,
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
  DocumentNotFoundError,
  DocumentsService,
  OutboundStockInsufficientError,
  UnknownDocumentActionError,
} from '../services/documents.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  list(@Query('docType') docType?: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    const normalizedDocType = this.normalizeDocType(docType);

    return this.documentsService.list(
      { docType: normalizedDocType },
      ctx.tenantId,
    );
  }

  @Get(':docType/:id')
  getDetail(
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const normalizedDocType = this.normalizeDocType(docType);

    const doc = this.documentsService.getDetail(
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
}
