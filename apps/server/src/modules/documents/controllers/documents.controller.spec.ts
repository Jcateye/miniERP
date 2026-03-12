import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import {
  DocumentNotFoundError,
  DocumentsService,
  OutboundStockInsufficientError,
  UnknownDocumentActionError,
} from '../services/documents.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;

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

      mockDocumentsService.list.mockResolvedValue(mockResult);

      const result = await controller.list('PO');

      expect(mockDocumentsService.list).toHaveBeenCalledWith(
        { docType: 'PO', page: undefined, pageSize: undefined },
        '1001',
      );
      expect(result).toEqual(mockResult);
    });

    it('should filter by docType', async () => {
      mockDocumentsService.list.mockResolvedValue({ data: [], total: 0 });

      await controller.list('GRN');

      expect(mockDocumentsService.list).toHaveBeenCalledWith(
        { docType: 'GRN', page: undefined, pageSize: undefined },
        '1001',
      );
    });

    it('should support ADJ docType list', async () => {
      mockDocumentsService.list.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

      await controller.list('ADJ');

      expect(mockDocumentsService.list).toHaveBeenCalledWith(
        { docType: 'ADJ', page: undefined, pageSize: undefined },
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

      mockDocumentsService.getDetail.mockResolvedValue(mockDoc);

      const result = await controller.getDetail('PO', '2001');

      expect(mockDocumentsService.getDetail).toHaveBeenCalledWith(
        'PO',
        '2001',
        '1001',
      );
      expect(result).toEqual(mockDoc);
    });

    it('should return error when document not found', async () => {
      mockDocumentsService.getDetail.mockResolvedValue(null);

      const result = await controller.getDetail('PO', '9999');

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
      const result = await controller.executeAction(
        'PO',
        '2001',
        'confirm',
        '',
        {},
      );

      expect(result).toEqual({
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for document actions',
          category: 'validation',
        },
      });
      expect(mockDocumentsService.executeAction).not.toHaveBeenCalled();
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

      expect(mockDocumentsService.executeAction).toHaveBeenCalledWith(
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
        new UnknownDocumentActionError('invalid'),
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
        new DocumentNotFoundError('PO', '9999'),
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

    it('should return semantic stock conflict for outbound post', async () => {
      mockDocumentsService.executeAction.mockRejectedValue(
        new OutboundStockInsufficientError(
          'Insufficient stock for outbound posting',
        ),
      );

      const result = await controller.executeAction(
        'OUT',
        '5001',
        'post',
        'idem-key-004',
        {},
      );

      expect(result).toEqual({
        error: {
          code: 'OUTBOUND_STOCK_INSUFFICIENT',
          message: 'Insufficient stock for outbound posting',
          category: 'conflict',
        },
      });
    });
  });
});
