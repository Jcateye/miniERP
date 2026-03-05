import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AuditService } from '../../audit/application/audit.service';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import {
  createEvidenceLinkSchema,
  createEvidenceUploadIntentSchema,
  evidenceCollectionQuerySchema,
  type CreateEvidenceLinkInput,
  type CreateEvidenceUploadIntentInput,
  type EvidenceCollectionQueryInput,
} from '../domain/evidence-binding.schema';
import {
  EVIDENCE_BINDING_REPOSITORY_TOKEN,
  type EvidenceBindingRepository,
  type EvidenceLinkRecord,
} from '../infrastructure/evidence-binding.repository';

export interface EvidenceCollectionResponse {
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: 'document' | 'line';
  readonly lineRef?: string;
  readonly stats: Array<{
    readonly key: string;
    readonly label: string;
    readonly value: string;
    readonly tone: string;
  }>;
  readonly tags: Array<{
    readonly key: string;
    readonly label: string;
    readonly count: number;
    readonly tone: string;
  }>;
  readonly items: Array<{
    readonly id: string;
    readonly assetId: string;
    readonly scope: 'document' | 'line';
    readonly lineRef?: string | null;
    readonly tag: string;
    readonly tagLabel: string;
    readonly fileName: string;
    readonly uploadedAt: string;
    readonly uploadedBy: string;
    readonly status: string;
  }>;
}

export interface CreateUploadIntentResponse {
  readonly assetId: string;
  readonly uploadUrl: string;
  readonly objectKey: string;
  readonly expiresAt: string;
}

export interface AttachEvidenceResponse {
  readonly linkId: string;
  readonly assetId: string;
}

const TAG_LABELS: Record<string, string> = {
  label: '标签',
  packing_list: '清单',
  damage: '差异凭证',
  serial: '序列号',
  handover: '交接签收',
  shelf: '货位',
  product_photo: '产品照',
  datasheet: '规格书',
  other: '其他',
};

interface NormalizedEvidenceCollectionQuery {
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: 'document' | 'line';
  readonly lineRef?: string;
  readonly tag?: string;
}

interface NormalizedCreateUploadIntentInput {
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: 'document' | 'line';
  readonly lineRef?: string;
  readonly tag: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: string;
}

interface NormalizedCreateEvidenceLinkInput {
  readonly assetId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: 'document' | 'line';
  readonly lineRef?: string;
  readonly tag: string;
}

@Injectable()
export class EvidenceBindingService {
  constructor(
    @Inject(EVIDENCE_BINDING_REPOSITORY_TOKEN)
    private readonly repository: EvidenceBindingRepository,
    private readonly tenantContextService: TenantContextService,
    private readonly auditService: AuditService,
  ) {}

  async getCollection(
    input: EvidenceCollectionQueryInput,
  ): Promise<EvidenceCollectionResponse> {
    const parsedInput = this.parseEvidenceCollectionQuery(input);
    const context = this.tenantContextService.getRequiredContext();

    const links = await this.repository.listLinks({
      tenantId: context.tenantId,
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      scope: parsedInput.scope,
      lineRef: parsedInput.lineRef,
      tag: parsedInput.tag,
    });

    this.auditService.recordEvidenceBinding({
      requestId: context.requestId,
      tenantId: context.tenantId,
      actorId: context.actorId ?? 'unknown',
      action: 'evidence.query',
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      result: 'success',
      metadata: {
        scope: parsedInput.scope,
        lineRef: parsedInput.lineRef,
        tag: parsedInput.tag,
        itemCount: links.length,
      },
    });

    return {
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      scope: parsedInput.scope,
      lineRef: parsedInput.lineRef,
      stats: [
        {
          key: 'total',
          label: '文件数',
          value: String(links.length),
          tone: 'info',
        },
        {
          key: 'required',
          label: '必传项',
          value: '0',
          tone: 'warning',
        },
        {
          key: 'ready',
          label: '就绪度',
          value: links.length > 0 ? '100%' : '0%',
          tone: links.length > 0 ? 'success' : 'warning',
        },
      ],
      tags: this.toTags(links),
      items: links.map((link) => this.toItem(link)),
    };
  }

  async createUploadIntent(
    input: CreateEvidenceUploadIntentInput,
  ): Promise<CreateUploadIntentResponse> {
    const parsedInput = this.parseUploadIntent(input);
    const context = this.tenantContextService.getRequiredContext();

    const created = await this.repository.createUploadIntent({
      tenantId: context.tenantId,
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      scope: parsedInput.scope,
      lineRef: parsedInput.lineRef,
      tag: parsedInput.tag,
      fileName: parsedInput.fileName,
      contentType: parsedInput.contentType,
      sizeBytes: parsedInput.sizeBytes,
      actorId: context.actorId,
    });

    this.auditService.recordEvidenceBinding({
      requestId: context.requestId,
      tenantId: context.tenantId,
      actorId: context.actorId ?? 'unknown',
      action: 'evidence.upload_intent',
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      result: 'success',
      metadata: {
        scope: parsedInput.scope,
        lineRef: parsedInput.lineRef,
        tag: parsedInput.tag,
        assetId: created.asset.id,
        objectKey: created.objectKey,
      },
    });

    return {
      assetId: created.asset.id,
      uploadUrl: created.uploadUrl,
      objectKey: created.objectKey,
      expiresAt: created.expiresAt,
    };
  }

  async bindEvidence(
    input: CreateEvidenceLinkInput,
  ): Promise<AttachEvidenceResponse> {
    const parsedInput = this.parseBindEvidenceInput(input);
    const context = this.tenantContextService.getRequiredContext();

    const asset = await this.repository.findAssetById(
      context.tenantId,
      parsedInput.assetId,
    );
    if (!asset) {
      throw new NotFoundException({
        category: 'not_found',
        code: 'EVIDENCE_ASSET_NOT_FOUND',
        message: `Evidence asset not found: ${parsedInput.assetId}`,
      });
    }

    const linked = await this.repository.attachLink({
      tenantId: context.tenantId,
      assetId: parsedInput.assetId,
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      scope: parsedInput.scope,
      lineRef: parsedInput.lineRef,
      tag: parsedInput.tag,
      actorId: context.actorId,
    });

    this.auditService.recordEvidenceBinding({
      requestId: context.requestId,
      tenantId: context.tenantId,
      actorId: context.actorId ?? 'unknown',
      action: 'evidence.bind',
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      result: 'success',
      metadata: {
        scope: parsedInput.scope,
        lineRef: parsedInput.lineRef,
        tag: parsedInput.tag,
        linkId: linked.id,
        assetId: parsedInput.assetId,
      },
    });

    return {
      linkId: linked.id,
      assetId: linked.assetId,
    };
  }

  private toItem(
    link: EvidenceLinkRecord,
  ): EvidenceCollectionResponse['items'][number] {
    return {
      id: link.id,
      assetId: link.assetId,
      scope: link.scope,
      lineRef: link.lineRef,
      tag: link.tag,
      tagLabel: TAG_LABELS[link.tag] ?? link.tag,
      fileName: link.fileName,
      uploadedAt: link.uploadedAt,
      uploadedBy: link.uploadedBy,
      status: link.status,
    };
  }

  private toTags(
    links: readonly EvidenceLinkRecord[],
  ): EvidenceCollectionResponse['tags'] {
    const counter = new Map<string, number>();

    for (const link of links) {
      counter.set(link.tag, (counter.get(link.tag) ?? 0) + 1);
    }

    return [...counter.entries()].map(([tag, count]) => ({
      key: tag,
      label: TAG_LABELS[tag] ?? tag,
      count,
      tone: tag === 'damage' ? 'danger' : 'info',
    }));
  }

  private parseEvidenceCollectionQuery(
    input: EvidenceCollectionQueryInput,
  ): NormalizedEvidenceCollectionQuery {
    const parsed = this.parseWithSchema(
      evidenceCollectionQuerySchema,
      input,
      'VALIDATION_EVIDENCE_QUERY_INVALID',
      'Evidence query validation failed',
    );

    return {
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      scope: parsed.scope ?? 'document',
      lineRef: parsed.lineRef,
      tag: parsed.tag,
    };
  }

  private parseUploadIntent(
    input: CreateEvidenceUploadIntentInput,
  ): NormalizedCreateUploadIntentInput {
    const parsed = this.parseWithSchema(
      createEvidenceUploadIntentSchema,
      input,
      'VALIDATION_EVIDENCE_UPLOAD_INTENT_INVALID',
      'Evidence upload intent validation failed',
    );

    return {
      entityType: parsed.entityType ?? 'unknown',
      entityId: parsed.entityId ?? '0',
      scope: parsed.scope ?? 'document',
      lineRef: parsed.lineRef,
      tag: parsed.tag ?? 'other',
      fileName: parsed.fileName,
      contentType: parsed.contentType ?? 'application/octet-stream',
      sizeBytes: parsed.sizeBytes ?? '0',
    };
  }

  private parseBindEvidenceInput(
    input: CreateEvidenceLinkInput,
  ): NormalizedCreateEvidenceLinkInput {
    const parsed = this.parseWithSchema(
      createEvidenceLinkSchema,
      input,
      'VALIDATION_EVIDENCE_BINDING_INVALID',
      'Evidence binding input validation failed',
    );

    return {
      assetId: parsed.assetId,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      scope: parsed.scope ?? 'document',
      lineRef: parsed.lineRef,
      tag: parsed.tag ?? 'other',
    };
  }

  private parseWithSchema<T>(
    schema: z.ZodType<T>,
    input: unknown,
    code: string,
    message: string,
  ): T {
    try {
      return schema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code,
          message,
          details: {
            issues: error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      throw error;
    }
  }
}
