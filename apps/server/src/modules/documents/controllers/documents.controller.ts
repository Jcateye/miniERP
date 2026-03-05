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
import { DocumentsService } from '../services/documents.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

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
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return {
            error: {
              code: 'DOCUMENT_NOT_FOUND',
              message: error.message,
            },
          };
        }
        if (error.message.includes('Unknown action')) {
          return {
            error: {
              code: 'UNKNOWN_ACTION',
              message: error.message,
            },
          };
        }
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
