import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceController } from './evidence.controller';
import { EvidenceBindingService } from '../../../evidence/application/evidence-binding.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InMemoryEvidenceBindingRepository } from '../../../evidence/infrastructure/evidence-binding.repository';

describe('EvidenceController', () => {
  let controller: EvidenceController;
  let evidenceBindingService: EvidenceBindingService;
  let repository: InMemoryEvidenceBindingRepository;

  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  const mockRepository = {
    findByTenant: jest.fn().mockReturnValue([]),
    save: jest.fn(),
  };

  const mockEvidenceBindingService = {
    bindEvidence: jest.fn(),
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
          useValue: mockTenantContextService,
        },
        {
          provide: InMemoryEvidenceBindingRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<EvidenceController>(EvidenceController);
    evidenceBindingService = module.get<EvidenceBindingService>(EvidenceBindingService);
    repository = module.get<InMemoryEvidenceBindingRepository>(InMemoryEvidenceBindingRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLinks', () => {
    it('should return evidence collection for document scope', () => {
      mockRepository.findByTenant.mockReturnValue([
        {
          id: '1',
          tenantId: '1001',
          evidenceId: 'ev-001',
          entityType: 'grn',
          entityId: '3001',
          bindingLevel: 'document',
          lineId: undefined,
          tag: 'label',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = controller.getLinks('grn', '3001', 'document');

      expect(result.entityType).toBe('grn');
      expect(result.entityId).toBe('3001');
      expect(result.scope).toBe('document');
      expect(result.items).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.tags).toBeDefined();
    });

    it('should return evidence collection for line scope', () => {
      mockRepository.findByTenant.mockReturnValue([
        {
          id: '2',
          tenantId: '1001',
          evidenceId: 'ev-002',
          entityType: 'grn',
          entityId: '3001',
          bindingLevel: 'line',
          lineId: '3001-L1',
          tag: 'damage',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = controller.getLinks('grn', '3001', 'line', '3001-L1');

      expect(result.scope).toBe('line');
      expect(result.lineRef).toBe('3001-L1');
    });

    it('should return placeholder when no bindings exist', () => {
      mockRepository.findByTenant.mockReturnValue([]);

      const result = controller.getLinks('grn', '9999', 'document');

      expect(result.items.length).toBe(1);
      expect(result.items[0].tag).toBe('placeholder');
      expect(result.items[0].status).toBe('pending');
    });

    it('should use default values when params missing', () => {
      mockRepository.findByTenant.mockReturnValue([]);

      const result = controller.getLinks();

      expect(result.entityType).toBe('grn');
      expect(result.entityId).toBe('3001');
      expect(result.scope).toBe('document');
    });
  });

  describe('bindEvidence', () => {
    it('should create evidence binding', () => {
      mockEvidenceBindingService.bindEvidence.mockReturnValue({
        id: '3',
        tenantId: '1001',
        evidenceId: 'ev-003',
        entityType: 'po',
        entityId: '2001',
        bindingLevel: 'document',
        lineId: undefined,
        tag: 'contract',
        createdAt: new Date().toISOString(),
      });

      const result = controller.bindEvidence({
        evidenceId: 'ev-003',
        entityType: 'po',
        entityId: '2001',
        scope: 'document',
        tag: 'contract',
      });

      expect(result.success).toBe(true);
      expect(result.binding.evidenceId).toBe('ev-003');
      expect(result.binding.entityType).toBe('po');
    });

    it('should include tenant from context', () => {
      mockEvidenceBindingService.bindEvidence.mockImplementation((params) => ({
        id: '4',
        ...params,
        createdAt: new Date().toISOString(),
      }));

      controller.bindEvidence({
        evidenceId: 'ev-004',
        entityType: 'so',
        entityId: '4001',
        scope: 'document',
        tag: 'order',
      });

      expect(mockEvidenceBindingService.bindEvidence).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: '1001',
        }),
      );
    });
  });

  describe('createUploadIntent', () => {
    it('should return upload intent with required fields', () => {
      const result = controller.createUploadIntent({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.uploadIntentId).toBeDefined();
      expect(result.uploadUrl).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.fields).toBeDefined();
    });

    it('should include tenant in fields', () => {
      const result = controller.createUploadIntent({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.fields['X-Tenant-Id']).toBe('1001');
      expect(result.fields['Content-Type']).toBe('image/jpeg');
    });

    it('should use default content type if not provided', () => {
      const result = controller.createUploadIntent({
        fileName: 'test.bin',
      });

      expect(result.fields['Content-Type']).toBe('application/octet-stream');
    });
  });
});
