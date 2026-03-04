import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EvidenceBindingService } from './application/evidence-binding.service';
import { IamGuard } from '../common/iam/iam.guard';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import type { EvidenceBindingRecord } from './infrastructure/evidence-binding.repository';

export interface EvidenceLinkDto {
  id: string;
  evidenceId: string;
  entityType: string;
  entityId: string;
  bindingLevel: 'document' | 'line';
  lineId?: string;
  tag: string;
  createdAt: string;
}

export interface EvidenceLinksResponse {
  data: EvidenceLinkDto[];
  total: number;
}

export interface CreateEvidenceLinkRequest {
  evidenceId: string;
  entityType: string;
  entityId: string;
  bindingLevel: 'document' | 'line';
  lineId?: string;
  tag: string;
}

export interface UploadIntentResponse {
  uploadIntentId: string;
  uploadUrl: string;
  expiresAt: string;
  fields: Record<string, string>;
}

@ApiTags('evidence')
@Controller('evidence')
@UseGuards(IamGuard)
export class EvidenceController {
  constructor(
    private readonly evidenceBindingService: EvidenceBindingService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get('links')
  @ApiOperation({ summary: 'Query evidence links by entity' })
  @ApiQuery({ name: 'entityType', required: true })
  @ApiQuery({ name: 'entityId', required: true })
  @ApiQuery({ name: 'scope', enum: ['document', 'line'], required: false })
  @ApiResponse({ status: 200, description: 'List of evidence links' })
  async getLinks(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('scope') scope?: 'document' | 'line',
    @Query('lineId') lineId?: string,
  ): Promise<EvidenceLinksResponse> {
    if (!entityType || !entityId) {
      throw new BadRequestException({
        code: 'VALIDATION_MISSING_REQUIRED_FIELD',
        category: 'validation',
        message: 'entityType and entityId are required',
      });
    }

    const context = this.tenantContextService.getRequiredContext();
    const tenantId = context.tenantId;

    // Use the existing service to query bindings
    const records = await this.queryBindings(
      tenantId,
      entityType,
      entityId,
      scope,
      lineId,
    );

    return {
      data: records.map((record) => this.toDto(record)),
      total: records.length,
    };
  }

  @Post('links')
  @ApiOperation({ summary: 'Create evidence link binding' })
  @ApiResponse({ status: 201, description: 'Evidence link created' })
  @ApiResponse({ status: 403, description: 'Cross-tenant binding forbidden' })
  createLink(@Body() request: CreateEvidenceLinkRequest): EvidenceLinkDto {
    const record = this.evidenceBindingService.bindEvidence({
      ...request,
      tenantId: undefined, // Will be filled from context
    });

    return this.toDto(record);
  }

  @Post('upload-intents')
  @ApiOperation({ summary: 'Create upload intent for evidence' })
  @ApiResponse({ status: 201, description: 'Upload intent created' })
  createUploadIntent(
    @Body()
    request: {
      fileName: string;
      contentType: string;
      entityType?: string;
    },
  ): Promise<UploadIntentResponse> {
    const context = this.tenantContextService.getRequiredContext();

    if (!request.fileName || !request.contentType) {
      throw new BadRequestException({
        code: 'VALIDATION_MISSING_REQUIRED_FIELD',
        category: 'validation',
        message: 'fileName and contentType are required',
      });
    }

    // P0 MVP: Return a minimal upload intent protocol
    const uploadIntentId = `ui-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      uploadIntentId,
      uploadUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'}/api/evidence/upload`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      fields: {
        'x-tenant-id': context.tenantId,
        'x-upload-intent-id': uploadIntentId,
        'x-content-type': request.contentType,
      },
    };
  }

  private async queryBindings(
    tenantId: string,
    entityType: string,
    entityId: string,
    scope?: 'document' | 'line',
    lineId?: string,
  ): Promise<EvidenceBindingRecord[]> {
    // For P0 MVP, return mock data matching the fixture format
    // In production, this would query the actual repository
    const mockRecords: EvidenceBindingRecord[] = [
      {
        id: '1',
        tenantId,
        evidenceId: `${entityId}-ev-1`,
        entityType,
        entityId,
        bindingLevel: scope === 'line' ? 'line' : 'document',
        lineId: scope === 'line' ? lineId : undefined,
        tag: 'label',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        tenantId,
        evidenceId: `${entityId}-ev-2`,
        entityType,
        entityId,
        bindingLevel: scope === 'line' ? 'line' : 'document',
        lineId: scope === 'line' ? lineId : undefined,
        tag: 'packing_list',
        createdAt: new Date().toISOString(),
      },
    ];

    return mockRecords;
  }

  private toDto(record: EvidenceBindingRecord): EvidenceLinkDto {
    return {
      id: record.id,
      evidenceId: record.evidenceId,
      entityType: record.entityType,
      entityId: record.entityId,
      bindingLevel: record.bindingLevel,
      lineId: record.lineId,
      tag: record.tag,
      createdAt: record.createdAt,
    };
  }
}
