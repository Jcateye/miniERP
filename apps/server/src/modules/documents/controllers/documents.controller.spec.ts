import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from '../services/documents.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;
  let tenantContextService: TenantContextService;

  const mockTenantContext = {
    tenantId: '1001',
    actorId: 'user-001',
    requestId: 'req-001',
  };

  const mockDocumentsService = {
    list: jest.fn(),
    getDetail: jest.fn(),
    executeAction: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
    tenantContextService = module.get<TenantContextService>(TenantContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated document list', async () => {
      const mockResult = {
        data: [
          { id: '2001', docType: 'PO', status: 'draft' },
          { id: '2002', docType: 'PO', status: 'confirmed' },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      mockDocumentsService.list.mockReturnValue(mockResult);

      const result = controller.list('PO');

      expect(service.list).toHaveBeenCalledWith(
        { docType: 'PO' },
        '1001',
      );
      expect(result).toEqual(mockResult);
    });

    it('should filter by docType', async () => {
      mockDocumentsService.list.mockReturnValue({ data: [], total: 0 });

      controller.list('GRN');

      expect(service.list).toHaveBeenCalledWith(
        { docType: 'GRN' },
        '1001',
      );
    });

    it('should support ADJ docType list', async () => {
      mockDocumentsService.list.mockReturnValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });

      controller.list('ADJ');

      expect(service.list).toHaveBeenCalledWith(
        { docType: 'ADJ' },
        '1001',
      );
    });
  });

  describe('getDetail', () => {
    it('should return document detail with lines', async () => {
      const mockDoc = {
        id: '2001',
        docType: 'PO',
        status: 'draft',
        lines: [{ id: '2001-L1', skuId: 'SKU-001', qty: '100' }],
      };

      mockDocumentsService.getDetail.mockReturnValue(mockDoc);

      const result = controller.getDetail('PO', '2001');

      expect(service.getDetail).toHaveBeenCalledWith('PO', '2001', '1001');
      expect(result).toEqual(mockDoc);
    });

    it('should return error when document not found', async () => {
      mockDocumentsService.getDetail.mockReturnValue(null);

      const result = controller.getDetail('PO', '9999');

      expect(result).toEqual({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document PO/9999 not found',
        },
      });
    });
  });

  describe('executeAction', () => {
    it('should return error when Idempotency-Key is missing', async () => {
      const result = await controller.executeAction('PO', '2001', 'confirm', '', {});

      expect(result).toEqual({
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for document actions',
          category: 'validation',
        },
      });
      expect(service.executeAction).not.toHaveBeenCalled();
    });

    it('should execute action with valid Idempotency-Key', async () => {
      const mockResult = {
        success: true,
        documentId: '2001',
        docType: 'PO',
        previousStatus: 'draft',
        newStatus: 'confirmed',
        action: 'confirm',
      };

      mockDocumentsService.executeAction.mockResolvedValue(mockResult);

      const result = await controller.executeAction(
        'PO',
        '2001',
        'confirm',
        'idem-key-001',
        {},
      );

      expect(service.executeAction).toHaveBeenCalledWith(
        'PO',
        '2001',
        'confirm',
        'idem-key-001',
        '1001',
        'user-001',
        'req-001',
      );
      expect(result).toEqual(mockResult);
    });

    it('should return error for unknown action', async () => {
      mockDocumentsService.executeAction.mockRejectedValue(
        new Error('Unknown action: invalid'),
      );

      const result = await controller.executeAction(
        'PO',
        '2001',
        'invalid',
        'idem-key-002',
        {},
      );

      expect(result).toEqual({
        error: {
          code: 'UNKNOWN_ACTION',
          message: 'Unknown action: invalid',
        },
      });
    });

    it('should return error for document not found', async () => {
      mockDocumentsService.executeAction.mockRejectedValue(
        new Error('Document not found: PO/9999'),
      );

      const result = await controller.executeAction(
        'PO',
        '9999',
        'confirm',
        'idem-key-003',
        {},
      );

      expect(result).toEqual({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found: PO/9999',
        },
      });
    });
  });
});
