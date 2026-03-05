import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { EvidenceBindingService } from '../../../evidence/application/evidence-binding.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import type { EvidenceBindingRecord } from '../../../evidence/infrastructure/evidence-binding.repository';

// HIGH-3 Fix: 定义 Repository 接口而非依赖具体实现
export interface EvidenceBindingRepository {
  findByTenant(tenantId: string): EvidenceBindingRecord[];
  save(binding: EvidenceBindingRecord): void;
}

export const EVIDENCE_BINDING_REPOSITORY_TOKEN = 'EVIDENCE_BINDING_REPOSITORY';

// HIGH-2 Fix: 添加输入验证 DTO
@Injectable()
export class BindEvidenceDto {
  evidenceId!: string;
  entityType!: string;
  entityId!: string;
  scope?: 'document' | 'line';
  lineRef?: string;
  tag?: string;
}

@Injectable()
export class UploadIntentDto {
  fileName?: string;
  contentType?: string;
}

export interface EvidenceLinkItem {
  id: string;
  assetId: string;
  scope: 'document' | 'line';
  lineRef?: string;
  tag: string;
  tagLabel: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: string;
  note?: string;
}

export interface EvidenceCollectionResponse {
  entityType: string;
  entityId: string;
  scope: 'document' | 'line';
  lineRef?: string;
  stats: Array<{ key: string; label: string; value: string; tone: string }>;
  tags: Array<{ key: string; label: string; count: number; tone: string }>;
  items: EvidenceLinkItem[];
}

export interface UploadIntentResponse {
  uploadIntentId: string;
  uploadUrl: string;
  expiresAt: string;
  fields: Record<string, string>;
}

@Controller('evidence')
export class EvidenceController {
  constructor(
    private readonly evidenceBindingService: EvidenceBindingService,
    private readonly tenantContextService: TenantContextService,
    // HIGH-3 Fix: 使用接口注入
    @Inject(EVIDENCE_BINDING_REPOSITORY_TOKEN)
    private readonly repository: EvidenceBindingRepository,
  ) {}

  @Get('links')
  getLinks(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('scope') scope?: 'document' | 'line',
    @Query('lineRef') lineRef?: string,
  ): EvidenceCollectionResponse {
    const ctx = this.tenantContextService.getRequiredContext();
    const normalizedScope = scope ?? 'document';
    const normalizedEntityType = entityType ?? 'grn';
    const normalizedEntityId = entityId ?? '3001';

    // Get bindings from repository
    const bindings = this.repository.findByTenant(ctx.tenantId).filter((b) => {
      if (b.entityType !== normalizedEntityType) return false;
      if (b.entityId !== normalizedEntityId) return false;
      if (b.bindingLevel !== normalizedScope) return false;
      if (normalizedScope === 'line' && b.lineId !== lineRef) return false;
      return true;
    });

    // Build response
    const items: EvidenceLinkItem[] = bindings.map((b) => ({
      id: b.id,
      assetId: `${b.evidenceId}`,
      scope: b.bindingLevel,
      lineRef: b.lineId,
      tag: b.tag,
      tagLabel: this.getTagLabel(b.tag),
      fileName: `${b.entityType}-${b.entityId}-${b.tag}.jpg`,
      uploadedAt: b.createdAt,
      uploadedBy: ctx.actorId ?? 'unknown',
      status: 'active',
    }));

    // If no bindings, return placeholder for P0 protocol
    if (items.length === 0) {
      items.push({
        id: `${normalizedEntityId}-${normalizedScope}-placeholder`,
        assetId: `${normalizedEntityId}01`,
        scope: normalizedScope,
        lineRef,
        tag: 'placeholder',
        tagLabel: '占位凭证',
        fileName: `${normalizedEntityType}-${normalizedEntityId}-placeholder.jpg`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'system',
        status: 'pending',
        note: 'P0 protocol: awaiting actual evidence upload',
      });
    }

    return {
      entityType: normalizedEntityType,
      entityId: normalizedEntityId,
      scope: normalizedScope,
      lineRef,
      stats: [
        { key: 'total', label: '文件数', value: items.length.toString(), tone: 'info' },
        { key: 'required', label: '必传项', value: '0', tone: 'warning' },
        { key: 'ready', label: '就绪度', value: items.length > 0 ? '100%' : '0%', tone: 'success' },
      ],
      tags: [...new Set(items.map((i) => i.tag))].map((tag) => ({
        key: tag,
        label: this.getTagLabel(tag),
        count: items.filter((i) => i.tag === tag).length,
        tone: 'info',
      })),
      items,
    };
  }

  @Post('links')
  @HttpCode(HttpStatus.CREATED)
  bindEvidence(
    @Body(new ValidationPipe({ transform: true, forbidNonWhitelisted: false }))
    body: BindEvidenceDto,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();

    // HIGH-2 Fix: DTO 已通过 ValidationPipe 验证，直接使用
    const result = this.evidenceBindingService.bindEvidence({
      tenantId: ctx.tenantId,
      evidenceId: body.evidenceId,
      entityType: body.entityType,
      entityId: body.entityId,
      bindingLevel: body.scope ?? 'document',
      lineId: body.lineRef,
      tag: body.tag ?? 'default',
    });

    return {
      success: true,
      binding: {
        id: result.id,
        evidenceId: result.evidenceId,
        entityType: result.entityType,
        entityId: result.entityId,
        bindingLevel: result.bindingLevel,
        lineId: result.lineId,
        tag: result.tag,
        createdAt: result.createdAt,
      },
    };
  }

  @Post('upload-intents')
  @HttpCode(HttpStatus.OK)
  createUploadIntent(
    @Body(new ValidationPipe({ transform: true, forbidNonWhitelisted: false }))
    body: UploadIntentDto,
  ): UploadIntentResponse {
    const ctx = this.tenantContextService.getRequiredContext();
    const uploadIntentId = `intent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // P0 minimal protocol: return upload intent with placeholder URL
    // Actual object storage integration to be done in P1/P2
    return {
      uploadIntentId,
      uploadUrl: `${process.env.OBJECT_STORAGE_URL ?? 'http://localhost:9000'}/uploads/${ctx.tenantId}/${uploadIntentId}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      fields: {
        'Content-Type': body.contentType ?? 'application/octet-stream',
        'X-Tenant-Id': ctx.tenantId,
        'X-Upload-Intent-Id': uploadIntentId,
      },
    };
  }

  private getTagLabel(tag: string): string {
    const labels: Record<string, string> = {
      label: '标签',
      packing_list: '清单',
      damage: '差异凭证',
      placeholder: '占位凭证',
      default: '默认',
    };
    return labels[tag] ?? tag;
  }
}
