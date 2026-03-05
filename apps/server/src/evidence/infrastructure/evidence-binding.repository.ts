import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type EvidenceScope = 'document' | 'line';

export interface EvidenceAssetRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly objectKey: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: string;
  readonly status: string;
  readonly uploadedBy: string | null;
  readonly createdAt: string;
}

export interface EvidenceLinkRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly assetId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: EvidenceScope;
  readonly lineRef: string | null;
  readonly tag: string;
  readonly createdAt: string;
  readonly createdBy: string | null;
  readonly fileName: string;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
  readonly status: string;
}

export interface EvidenceCollectionQuery {
  readonly tenantId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: EvidenceScope;
  readonly lineRef?: string;
  readonly tag?: string;
}

export interface CreateUploadIntentParams {
  readonly tenantId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: EvidenceScope;
  readonly lineRef?: string;
  readonly tag: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: string;
  readonly actorId?: string;
}

export interface UploadIntentRecord {
  readonly asset: EvidenceAssetRecord;
  readonly uploadUrl: string;
  readonly objectKey: string;
  readonly expiresAt: string;
}

export interface AttachEvidenceLinkParams {
  readonly tenantId: string;
  readonly assetId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly scope: EvidenceScope;
  readonly lineRef?: string;
  readonly tag: string;
  readonly actorId?: string;
}

export interface EvidenceBindingRepository {
  findAssetById(
    tenantId: string,
    assetId: string,
  ): Promise<EvidenceAssetRecord | null>;
  createUploadIntent(
    params: CreateUploadIntentParams,
  ): Promise<UploadIntentRecord>;
  attachLink(params: AttachEvidenceLinkParams): Promise<EvidenceLinkRecord>;
  listLinks(
    query: EvidenceCollectionQuery,
  ): Promise<readonly EvidenceLinkRecord[]>;
}

export const EVIDENCE_BINDING_REPOSITORY_TOKEN = 'EVIDENCE_BINDING_REPOSITORY';

interface InMemoryTenantState {
  readonly assets: Map<string, EvidenceAssetRecord>;
  readonly links: Map<string, EvidenceLinkRecord>;
}

function createInMemoryTenantState(): InMemoryTenantState {
  return {
    assets: new Map<string, EvidenceAssetRecord>(),
    links: new Map<string, EvidenceLinkRecord>(),
  };
}

@Injectable()
export class InMemoryEvidenceBindingRepository implements EvidenceBindingRepository {
  private readonly tenantStates = new Map<string, InMemoryTenantState>();

  private assetSequence = 1000;

  private linkSequence = 1000;

  private getTenantState(tenantId: string): InMemoryTenantState {
    const existing = this.tenantStates.get(tenantId);
    if (existing) {
      return existing;
    }

    const created = createInMemoryTenantState();
    this.tenantStates.set(tenantId, created);
    return created;
  }

  findAssetById(
    tenantId: string,
    assetId: string,
  ): Promise<EvidenceAssetRecord | null> {
    const tenantState = this.getTenantState(tenantId);
    return Promise.resolve(tenantState.assets.get(assetId) ?? null);
  }

  createUploadIntent(
    params: CreateUploadIntentParams,
  ): Promise<UploadIntentRecord> {
    const tenantState = this.getTenantState(params.tenantId);
    const now = new Date();
    const assetId = String(++this.assetSequence);
    const safeFileName = params.fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `evidence/${params.entityType}/${params.entityId}/${assetId}-${safeFileName}`;

    const asset: EvidenceAssetRecord = {
      id: assetId,
      tenantId: params.tenantId,
      objectKey,
      fileName: params.fileName,
      contentType: params.contentType,
      sizeBytes: params.sizeBytes,
      status: 'pending_upload',
      uploadedBy: params.actorId ?? null,
      createdAt: now.toISOString(),
    };

    tenantState.assets.set(asset.id, asset);

    return Promise.resolve({
      asset,
      objectKey,
      uploadUrl: `${resolveObjectStorageBase()}/${objectKey}`,
      expiresAt: new Date(now.getTime() + 3600_000).toISOString(),
    });
  }

  attachLink(
    params: AttachEvidenceLinkParams,
  ): Promise<EvidenceLinkRecord> {
    const tenantState = this.getTenantState(params.tenantId);
    const asset = tenantState.assets.get(params.assetId);
    if (!asset) {
      throw new Error(`Evidence asset not found: ${params.assetId}`);
    }

    const uniqueKey = [
      params.assetId,
      params.entityType,
      params.entityId,
      params.scope,
      params.lineRef ?? '',
    ].join('::');

    const existing = [...tenantState.links.values()].find(
      (link) =>
        [
          link.assetId,
          link.entityType,
          link.entityId,
          link.scope,
          link.lineRef ?? '',
        ].join('::') === uniqueKey,
    );
    if (existing) {
      return Promise.resolve(existing);
    }

    const now = new Date().toISOString();
    const id = String(++this.linkSequence);

    const link: EvidenceLinkRecord = {
      id,
      tenantId: params.tenantId,
      assetId: params.assetId,
      entityType: params.entityType,
      entityId: params.entityId,
      scope: params.scope,
      lineRef: params.lineRef ?? null,
      tag: params.tag,
      createdAt: now,
      createdBy: params.actorId ?? null,
      fileName: asset.fileName,
      uploadedAt: asset.createdAt,
      uploadedBy: asset.uploadedBy ?? params.actorId ?? 'unknown',
      status: 'active',
    };

    tenantState.links.set(link.id, link);
    tenantState.assets.set(asset.id, {
      ...asset,
      status: 'active',
      uploadedBy: asset.uploadedBy ?? params.actorId ?? null,
    });

    return Promise.resolve(link);
  }

  listLinks(
    query: EvidenceCollectionQuery,
  ): Promise<readonly EvidenceLinkRecord[]> {
    const tenantState = this.getTenantState(query.tenantId);

    return Promise.resolve(
      [...tenantState.links.values()]
        .filter((link) => {
          if (link.entityType !== query.entityType) {
            return false;
          }

          if (link.entityId !== query.entityId) {
            return false;
          }

          if (link.scope !== query.scope) {
            return false;
          }

          if (
            query.scope === 'line' &&
            link.lineRef !== (query.lineRef ?? null)
          ) {
            return false;
          }

          if (query.tag && link.tag !== query.tag) {
            return false;
          }

          return true;
        })
        .sort((left, right) =>
          `${right.createdAt}-${right.id}`.localeCompare(
            `${left.createdAt}-${left.id}`,
          ),
        ),
    );
  }
}

function resolveObjectStorageBase(): string {
  return process.env.OBJECT_STORAGE_URL?.trim() ?? 'http://localhost:9000';
}

function tenantCodeCandidates(tenantId: string): string[] {
  const normalized = tenantId.trim();
  const candidates = new Set<string>([normalized]);

  if (!normalized.toUpperCase().startsWith('TENANT-')) {
    candidates.add(`TENANT-${normalized}`);
  }

  return [...candidates];
}

async function resolveTenantDbId(
  prisma: PrismaService,
  tenantId: string,
): Promise<bigint> {
  const normalized = tenantId.trim();
  if (normalized.length === 0) {
    throw new Error('tenantId is required');
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      code: {
        in: tenantCodeCandidates(normalized),
      },
    },
    select: { id: true },
  });

  if (tenant) {
    return tenant.id;
  }

  try {
    return BigInt(normalized);
  } catch {
    throw new Error(
      `tenantId is not bigint-compatible and no tenant code matched: ${tenantId}`,
    );
  }
}

function mapAsset(row: {
  id: bigint;
  tenantId: bigint;
  objectKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: bigint;
  status: string;
  uploadedBy: string | null;
  createdAt: Date;
}): EvidenceAssetRecord {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    objectKey: row.objectKey,
    fileName: row.fileName,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes.toString(),
    status: row.status,
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapLink(
  row: {
    id: bigint;
    tenantId: bigint;
    assetId: bigint;
    entityType: string;
    entityId: string;
    scope: EvidenceScope;
    lineRef: string | null;
    tag: string;
    createdAt: Date;
    createdBy: string | null;
  },
  asset: {
    fileName: string;
    createdAt: Date;
    uploadedBy: string | null;
    status: string;
  },
): EvidenceLinkRecord {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    assetId: row.assetId.toString(),
    entityType: row.entityType,
    entityId: row.entityId,
    scope: row.scope,
    lineRef: row.lineRef,
    tag: row.tag,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    fileName: asset.fileName,
    uploadedAt: asset.createdAt.toISOString(),
    uploadedBy: asset.uploadedBy ?? row.createdBy ?? 'unknown',
    status: asset.status,
  };
}

@Injectable()
export class PrismaEvidenceBindingRepository implements EvidenceBindingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private parseBigint(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new Error(`Expected bigint string but got: ${value}`);
    }
  }

  async findAssetById(
    tenantId: string,
    assetId: string,
  ): Promise<EvidenceAssetRecord | null> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.evidenceAsset.findFirst({
      where: {
        tenantId: tenantDbId,
        id: this.parseBigint(assetId),
      },
    });

    return row ? mapAsset(row) : null;
  }

  async createUploadIntent(
    params: CreateUploadIntentParams,
  ): Promise<UploadIntentRecord> {
    const tenantDbId = await resolveTenantDbId(this.prisma, params.tenantId);
    const safeFileName = params.fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `evidence/${params.entityType}/${params.entityId}/${Date.now()}-${safeFileName}`;

    const created = await this.prisma.evidenceAsset.create({
      data: {
        tenantId: tenantDbId,
        objectKey,
        fileName: params.fileName,
        contentType: params.contentType,
        sizeBytes: this.parseBigint(params.sizeBytes),
        status: 'pending_upload',
        uploadedBy: params.actorId ?? null,
      },
    });

    const now = new Date();

    return {
      asset: mapAsset(created),
      objectKey,
      uploadUrl: `${resolveObjectStorageBase()}/${objectKey}`,
      expiresAt: new Date(now.getTime() + 3600_000).toISOString(),
    };
  }

  async attachLink(
    params: AttachEvidenceLinkParams,
  ): Promise<EvidenceLinkRecord> {
    const tenantDbId = await resolveTenantDbId(this.prisma, params.tenantId);
    const assetId = this.parseBigint(params.assetId);

    const asset = await this.prisma.evidenceAsset.findFirst({
      where: {
        tenantId: tenantDbId,
        id: assetId,
      },
    });

    if (!asset) {
      throw new Error(`Evidence asset not found: ${params.assetId}`);
    }

    let createdLink: {
      id: bigint;
      tenantId: bigint;
      assetId: bigint;
      entityType: string;
      entityId: string;
      scope: EvidenceScope;
      lineRef: string | null;
      tag: string;
      createdAt: Date;
      createdBy: string | null;
    };

    try {
      createdLink = await this.prisma.evidenceLink.create({
        data: {
          tenantId: tenantDbId,
          assetId,
          entityType: params.entityType,
          entityId: params.entityId,
          scope: params.scope,
          lineRef: params.lineRef ?? null,
          tag: params.tag,
          createdBy: params.actorId ?? null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.evidenceLink.findFirst({
          where: {
            tenantId: tenantDbId,
            assetId,
            entityType: params.entityType,
            entityId: params.entityId,
            scope: params.scope,
            lineRef: params.lineRef ?? null,
          },
        });

        if (!existing) {
          throw error;
        }

        createdLink = existing;
      } else {
        throw error;
      }
    }

    await this.prisma.evidenceAsset.update({
      where: { id: assetId },
      data: {
        status: 'active',
        uploadedBy: asset.uploadedBy ?? params.actorId ?? null,
      },
    });

    return mapLink(createdLink, {
      fileName: asset.fileName,
      createdAt: asset.createdAt,
      uploadedBy: asset.uploadedBy ?? params.actorId ?? null,
      status: 'active',
    });
  }

  async listLinks(
    query: EvidenceCollectionQuery,
  ): Promise<readonly EvidenceLinkRecord[]> {
    const tenantDbId = await resolveTenantDbId(this.prisma, query.tenantId);

    const rows = await this.prisma.evidenceLink.findMany({
      where: {
        tenantId: tenantDbId,
        entityType: query.entityType,
        entityId: query.entityId,
        scope: query.scope,
        lineRef: query.scope === 'line' ? (query.lineRef ?? null) : null,
        tag: query.tag,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const assetIds = [
      ...new Set(rows.map((row) => row.assetId.toString())),
    ].map((id) => BigInt(id));
    const assets = await this.prisma.evidenceAsset.findMany({
      where: {
        tenantId: tenantDbId,
        id: {
          in: assetIds,
        },
      },
    });
    const assetMap = new Map<string, (typeof assets)[number]>(
      assets.map((asset) => [asset.id.toString(), asset]),
    );

    return rows
      .map((row) => {
        const asset = assetMap.get(row.assetId.toString());
        if (!asset) {
          return null;
        }

        return mapLink(row, {
          fileName: asset.fileName,
          createdAt: asset.createdAt,
          uploadedBy: asset.uploadedBy,
          status: asset.status,
        });
      })
      .filter((item): item is EvidenceLinkRecord => item !== null);
  }
}
