import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import {
  EvidenceBindingService,
  type AttachEvidenceResponse,
  type CreateUploadIntentResponse,
  type EvidenceCollectionResponse,
} from '../../../evidence/application/evidence-binding.service';
import type {
  CreateEvidenceLinkInput,
  CreateEvidenceUploadIntentInput,
  EvidenceCollectionQueryInput,
} from '../../../evidence/domain/evidence-binding.schema';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validationError(code: string, message: string): BadRequestException {
  return new BadRequestException({
    category: 'validation',
    code,
    message,
  });
}

function parseGetLinksQuery(input: {
  readonly entityType?: string;
  readonly entityId?: string;
  readonly scope?: 'document' | 'line';
  readonly lineRef?: string;
  readonly lineId?: string;
  readonly tag?: string;
}): EvidenceCollectionQueryInput {
  const lineRef = input.lineRef ?? input.lineId;

  if (!isNonEmptyString(input.entityType)) {
    throw validationError('VALIDATION_INVALID_QUERY', 'entityType is required');
  }

  if (!isNonEmptyString(input.entityId)) {
    throw validationError('VALIDATION_INVALID_QUERY', 'entityId is required');
  }

  return {
    entityType: input.entityType,
    entityId: input.entityId,
    scope: input.scope ?? 'document',
    lineRef,
    tag: input.tag,
  };
}

function parseAttachEvidencePayload(payload: unknown): CreateEvidenceLinkInput {
  if (typeof payload !== 'object' || payload === null) {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'Request body must be an object',
    );
  }

  const candidate = payload as Record<string, unknown>;
  const assetId = candidate.evidenceId ?? candidate.assetId;
  const scope = candidate.scope ?? candidate.bindingLevel;
  const lineRef = candidate.lineRef ?? candidate.lineId;

  if (!isNonEmptyString(assetId)) {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'assetId (or evidenceId) is required',
    );
  }

  if (!isNonEmptyString(candidate.entityType)) {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'entityType is required',
    );
  }

  if (!isNonEmptyString(candidate.entityId)) {
    throw validationError('VALIDATION_INVALID_PAYLOAD', 'entityId is required');
  }

  if (scope !== undefined && scope !== 'document' && scope !== 'line') {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'scope must be document or line',
    );
  }

  if (lineRef !== undefined && !isNonEmptyString(lineRef)) {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'lineRef must be a non-empty string',
    );
  }

  if (candidate.tag !== undefined && !isNonEmptyString(candidate.tag)) {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'tag must be a non-empty string',
    );
  }

  return {
    assetId: assetId.trim(),
    entityType: candidate.entityType.trim(),
    entityId: candidate.entityId.trim(),
    scope: scope ?? 'document',
    lineRef: lineRef?.trim(),
    tag: isNonEmptyString(candidate.tag) ? candidate.tag.trim() : 'other',
  };
}

function parseCreateUploadIntentPayload(
  payload: unknown,
): CreateEvidenceUploadIntentInput {
  if (typeof payload !== 'object' || payload === null) {
    throw validationError(
      'VALIDATION_INVALID_PAYLOAD',
      'Request body must be an object',
    );
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.fileName)) {
    throw validationError('VALIDATION_INVALID_PAYLOAD', 'fileName is required');
  }

  const lineRef = (candidate.lineRef ?? candidate.lineId) as string | undefined;

  const sizeBytesRaw = candidate.sizeBytes;
  let sizeBytes = '0';

  if (sizeBytesRaw !== undefined) {
    if (
      typeof sizeBytesRaw === 'number' &&
      Number.isInteger(sizeBytesRaw) &&
      sizeBytesRaw >= 0
    ) {
      sizeBytes = String(sizeBytesRaw);
    } else if (
      isNonEmptyString(sizeBytesRaw) &&
      /^\d+$/u.test(sizeBytesRaw.trim())
    ) {
      sizeBytes = sizeBytesRaw.trim();
    } else {
      throw validationError(
        'VALIDATION_INVALID_PAYLOAD',
        'sizeBytes must be a non-negative integer',
      );
    }
  }

  return {
    entityType: isNonEmptyString(candidate.entityType)
      ? candidate.entityType.trim()
      : 'unknown',
    entityId: isNonEmptyString(candidate.entityId)
      ? candidate.entityId.trim()
      : '0',
    scope:
      candidate.scope === 'line' || candidate.scope === 'document'
        ? candidate.scope
        : 'document',
    lineRef: isNonEmptyString(lineRef) ? lineRef.trim() : undefined,
    tag: isNonEmptyString(candidate.tag) ? candidate.tag.trim() : 'other',
    fileName: candidate.fileName.trim(),
    contentType: isNonEmptyString(candidate.contentType)
      ? candidate.contentType.trim()
      : 'application/octet-stream',
    sizeBytes,
  };
}

@RequirePermissions('evidence:link:read')
@Controller('evidence')
export class EvidenceController {
  constructor(
    private readonly evidenceBindingService: EvidenceBindingService,
  ) {}

  @Get('links')
  async getLinks(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('scope') scope?: 'document' | 'line',
    @Query('lineRef') lineRef?: string,
    @Query('lineId') lineId?: string,
    @Query('tag') tag?: string,
  ): Promise<EvidenceCollectionResponse> {
    return this.evidenceBindingService.getCollection(
      parseGetLinksQuery({
        entityType,
        entityId,
        scope,
        lineRef,
        lineId,
        tag,
      }),
    );
  }

  @Post('links')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('evidence:link:create')
  async bindEvidence(@Body() body: unknown): Promise<AttachEvidenceResponse> {
    return this.evidenceBindingService.bindEvidence(
      parseAttachEvidencePayload(body),
    );
  }

  @Post('upload-intents')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('evidence:asset:create')
  async createUploadIntent(
    @Body() body: unknown,
  ): Promise<CreateUploadIntentResponse> {
    return this.evidenceBindingService.createUploadIntent(
      parseCreateUploadIntentPayload(body),
    );
  }
}
