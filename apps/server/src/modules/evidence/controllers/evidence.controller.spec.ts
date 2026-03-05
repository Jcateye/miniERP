import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { EvidenceBindingService } from '../../../evidence/application/evidence-binding.service';
import { EvidenceController } from './evidence.controller';

describe('EvidenceController', () => {
  let controller: EvidenceController;

  const mockEvidenceBindingService = {
    getCollection: jest.fn(),
    bindEvidence: jest.fn(),
    createUploadIntent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenceController],
      providers: [
        {
          provide: EvidenceBindingService,
          useValue: mockEvidenceBindingService,
        },
        {
          provide: TenantContextService,
          useValue: {
            getRequiredContext: jest.fn().mockReturnValue({
              tenantId: '1001',
              actorId: '9001',
              requestId: 'req-001',
            }),
          },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn().mockReturnValue([]) },
        },
        {
          provide: AuditService,
          useValue: { recordAuthorization: jest.fn() },
        },
        {
          provide: PlatformAccessService,
          useValue: { assertCrossTenantAllowed: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<EvidenceController>(EvidenceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should normalize lineId to lineRef for GET query', async () => {
    mockEvidenceBindingService.getCollection.mockResolvedValue({
      entityType: 'grn',
      entityId: '3001',
      scope: 'line',
      lineRef: '3001-L1',
      stats: [],
      tags: [],
      items: [],
    });

    await controller.getLinks('grn', '3001', 'line', undefined, '3001-L1');

    expect(mockEvidenceBindingService.getCollection).toHaveBeenCalledWith({
      entityType: 'grn',
      entityId: '3001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: undefined,
    });
  });

  it('should throw when GET query is invalid', async () => {
    await expect(controller.getLinks(undefined, '3001')).rejects.toThrow(
      'entityType is required',
    );
  });

  it('should parse scope/lineRef payload for bindEvidence', async () => {
    mockEvidenceBindingService.bindEvidence.mockResolvedValue({
      linkId: '9001',
      assetId: '5001',
    });

    const result = await controller.bindEvidence({
      evidenceId: '5001',
      entityType: 'stocktake',
      entityId: '6001',
      bindingLevel: 'line',
      lineId: '3001-L1',
      tag: 'damage',
    });

    expect(mockEvidenceBindingService.bindEvidence).toHaveBeenCalledWith({
      assetId: '5001',
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'damage',
    });

    expect(result).toEqual({
      linkId: '9001',
      assetId: '5001',
    });
  });

  it('should throw when bindEvidence payload is invalid', async () => {
    await expect(
      controller.bindEvidence({ entityType: 'stocktake', entityId: '6001' }),
    ).rejects.toThrow('assetId (or evidenceId) is required');
  });

  it('should parse upload intent payload', async () => {
    mockEvidenceBindingService.createUploadIntent.mockResolvedValue({
      assetId: '6001',
      uploadUrl: 'http://localhost:9000/evidence/grn/3001/6001-doc.jpg',
      objectKey: 'evidence/grn/3001/6001-doc.jpg',
      expiresAt: '2026-03-05T12:00:00.000Z',
    });

    const result = await controller.createUploadIntent({
      entityType: 'grn',
      entityId: '3001',
      scope: 'document',
      tag: 'label',
      fileName: 'doc.jpg',
      contentType: 'image/jpeg',
      sizeBytes: '123',
    });

    expect(mockEvidenceBindingService.createUploadIntent).toHaveBeenCalledWith({
      entityType: 'grn',
      entityId: '3001',
      scope: 'document',
      lineRef: undefined,
      tag: 'label',
      fileName: 'doc.jpg',
      contentType: 'image/jpeg',
      sizeBytes: '123',
    });

    expect(result.assetId).toBe('6001');
  });

  it('should throw when upload intent payload is invalid', async () => {
    await expect(controller.createUploadIntent({})).rejects.toThrow(
      'fileName is required',
    );
  });
});
