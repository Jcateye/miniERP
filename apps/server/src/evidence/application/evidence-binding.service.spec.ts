import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuditService } from '../../audit/application/audit.service';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import { InMemoryEvidenceBindingRepository } from '../infrastructure/evidence-binding.repository';
import { EvidenceBindingService } from './evidence-binding.service';

describe('EvidenceBindingService', () => {
  function createService(context: {
    tenantId: string;
    requestId: string;
    actorId?: string;
  }) {
    const tenantContextService = {
      getRequiredContext: jest.fn().mockReturnValue(context),
    } as unknown as TenantContextService;

    const auditService = {
      recordEvidenceBinding: jest.fn(),
    } as unknown as AuditService;

    const repository = new InMemoryEvidenceBindingRepository();

    return {
      service: new EvidenceBindingService(
        repository,
        tenantContextService,
        auditService,
      ),
      repository,
      auditService,
    };
  }

  it('creates upload intent and persists evidence asset', async () => {
    const { service, repository } = createService({
      tenantId: '1001',
      requestId: 'req-1',
      actorId: '2001',
    });

    const result = await service.createUploadIntent({
      entityType: 'grn',
      entityId: '3001',
      scope: 'document',
      tag: 'label',
      fileName: 'grn-label.jpg',
      contentType: 'image/jpeg',
      sizeBytes: '1024',
    });

    expect(result.assetId).toMatch(/^\d+$/u);
    expect(result.objectKey).toContain('grn/3001');

    const asset = await repository.findAssetById('1001', result.assetId);
    expect(asset).not.toBeNull();
    expect(asset?.status).toBe('pending_upload');
  });

  it('attaches evidence link and is idempotent by unique key', async () => {
    const { service, repository } = createService({
      tenantId: '1001',
      requestId: 'req-1',
      actorId: '2001',
    });

    const uploadIntent = await service.createUploadIntent({
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'damage',
      fileName: 'damage.jpg',
      contentType: 'image/jpeg',
      sizeBytes: '512',
    });

    const first = await service.bindEvidence({
      assetId: uploadIntent.assetId,
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'damage',
    });

    const second = await service.bindEvidence({
      assetId: uploadIntent.assetId,
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'damage',
    });

    expect(second.linkId).toBe(first.linkId);

    const items = await repository.listLinks({
      tenantId: '1001',
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'line',
      lineRef: '3001-L1',
    });
    expect(items).toHaveLength(1);
  });

  it('returns scoped collection for document and line', async () => {
    const { service } = createService({
      tenantId: '1001',
      requestId: 'req-1',
      actorId: '2001',
    });

    const docAsset = await service.createUploadIntent({
      entityType: 'grn',
      entityId: '3001',
      scope: 'document',
      tag: 'label',
      fileName: 'doc.jpg',
      contentType: 'image/jpeg',
      sizeBytes: '100',
    });

    const lineAsset = await service.createUploadIntent({
      entityType: 'grn',
      entityId: '3001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'damage',
      fileName: 'line.jpg',
      contentType: 'image/jpeg',
      sizeBytes: '100',
    });

    await service.bindEvidence({
      assetId: docAsset.assetId,
      entityType: 'grn',
      entityId: '3001',
      scope: 'document',
      tag: 'label',
    });

    await service.bindEvidence({
      assetId: lineAsset.assetId,
      entityType: 'grn',
      entityId: '3001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'damage',
    });

    const documentCollection = await service.getCollection({
      entityType: 'grn',
      entityId: '3001',
      scope: 'document',
    });

    const lineCollection = await service.getCollection({
      entityType: 'grn',
      entityId: '3001',
      scope: 'line',
      lineRef: '3001-L1',
    });

    expect(documentCollection.items).toHaveLength(1);
    expect(documentCollection.items[0]?.scope).toBe('document');
    expect(lineCollection.items).toHaveLength(1);
    expect(lineCollection.items[0]?.lineRef).toBe('3001-L1');
  });

  it('throws not found when binding missing asset', async () => {
    const { service } = createService({
      tenantId: '1001',
      requestId: 'req-1',
      actorId: '2001',
    });

    await expect(
      service.bindEvidence({
        assetId: '999999',
        entityType: 'grn',
        entityId: '3001',
        scope: 'document',
        tag: 'label',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws bad request when scope/lineRef is invalid', async () => {
    const { service } = createService({
      tenantId: '1001',
      requestId: 'req-1',
      actorId: '2001',
    });

    await expect(
      service.getCollection({
        entityType: 'grn',
        entityId: '3001',
        scope: 'line',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.bindEvidence({
        assetId: '1001',
        entityType: 'grn',
        entityId: '3001',
        scope: 'document',
        lineRef: '3001-L1',
        tag: 'label',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
