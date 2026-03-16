import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

function expectBadRequestPayload(
  error: unknown,
  expected: { code: string; message: string },
) {
  expect(error).toBeInstanceOf(BadRequestException);
  const payload = (error as BadRequestException).getResponse() as {
    readonly code: string;
    readonly category: string;
    readonly message: string;
  };
  expect(payload.category).toBe('validation');
  expect(payload.code).toBe(expected.code);
  expect(payload.message).toBe(expected.message);
}

function expectNotFoundPayload(
  error: unknown,
  expected: { code: string; message: string },
) {
  expect(error).toBeInstanceOf(NotFoundException);
  const payload = (error as NotFoundException).getResponse() as {
    readonly code: string;
    readonly category: string;
    readonly message: string;
  };
  expect(payload.category).toBe('not_found');
  expect(payload.code).toBe(expected.code);
  expect(payload.message).toBe(expected.message);
}

function expectConflictPayload(
  error: unknown,
  expected: { code: string; message: string },
) {
  expect(error).toBeInstanceOf(ConflictException);
  const payload = (error as ConflictException).getResponse() as {
    readonly code: string;
    readonly category: string;
    readonly message: string;
  };
  expect(payload.category).toBe('conflict');
  expect(payload.code).toBe(expected.code);
  expect(payload.message).toBe(expected.message);
}

function expectForbiddenPayload(
  error: unknown,
  expected: { code: string; message: string },
) {
  expect(error).toBeInstanceOf(ForbiddenException);
  const payload = (error as ForbiddenException).getResponse() as {
    readonly code: string;
    readonly category: string;
    readonly message: string;
  };
  expect(payload.category).toBe('permission');
  expect(payload.code).toBe(expected.code);
  expect(payload.message).toBe(expected.message);
}

import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizeGuard } from '../../../common/iam/authorize/authorize.guard';
import { DocumentsController } from './documents.controller';

jest.mock('../../../common/iam/authorize/authz-context', () => ({
  readAuthzResult: jest.fn(),
}));

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
    create: jest.fn(),
    executeAction: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue(mockTenantContext),
  };

  const { readAuthzResult } = jest.requireMock(
    '../../../common/iam/authorize/authz-context',
  );

  beforeEach(async () => {
    readAuthzResult.mockReset();

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
    })
      .overrideGuard(AuthorizeGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

      try {
        await controller.getDetail('PO', '9999');
        throw new Error('expected not found');
      } catch (error) {
        expectNotFoundPayload(error, {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document PO/9999 not found',
        });
      }
    });
  });

  describe('executeAction', () => {
    it('should return error when Idempotency-Key is missing', async () => {
      await expect(
        controller.executeAction('PO', '2001', 'confirm', ''),
      ).rejects.toBeInstanceOf(BadRequestException);

      try {
        await controller.executeAction('PO', '2001', 'confirm', '');
        throw new Error('expected bad request');
      } catch (error) {
        expectBadRequestPayload(error, {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for document actions',
        });
      }

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

      readAuthzResult.mockReturnValue({
        decision: 'allow',
        obligations: {
          workflow: {
            allowTransitions: ['confirm'],
          },
        },
      });

      const result = await controller.executeAction(
        'PO',
        '2001',
        'confirm',
        'idem-key-001',
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

    it('should execute post action when Idempotency-Key is valid', async () => {
      const mockResult = {
        success: true,
        documentId: '2001',
        docType: 'PO',
        previousStatus: 'picked',
        newStatus: 'posted',
        action: 'post',
      };

      mockDocumentsService.executeAction.mockResolvedValue(mockResult);

      readAuthzResult.mockReturnValue({
        decision: 'allow',
        obligations: {
          workflow: {
            allowTransitions: ['post'],
          },
        },
      });

      const result = await controller.executePostAction(
        'PO',
        '2001',
        'idem-key-post-001',
      );

      expect(mockDocumentsService.executeAction).toHaveBeenCalledWith(
        'PO',
        '2001',
        'post',
        'idem-key-post-001',
        '1001',
        'user-001',
        'req-001',
      );
      expect(result).toEqual(mockResult);
    });

    it('should deny post when workflow obligations do not allow post', async () => {
      readAuthzResult.mockReturnValue({
        decision: 'allow',
        obligations: {
          workflow: {
            allowTransitions: ['confirm'],
          },
        },
      });

      try {
        await controller.executeAction(
          'PO',
          '2001',
          'post',
          'idem-key-deny-001',
        );
        throw new Error('expected forbidden');
      } catch (error) {
        expectForbiddenPayload(error, {
          code: 'PERMISSION_DENIED',
          message: 'Permission denied',
        });
      }

      expect(mockDocumentsService.executeAction).not.toHaveBeenCalled();
    });

    it('should deny when workflow obligations are missing', async () => {
      readAuthzResult.mockReturnValue({
        decision: 'allow',
        obligations: {},
      });

      try {
        await controller.executePostAction('PO', '2001', 'idem-key-deny-002');
        throw new Error('expected forbidden');
      } catch (error) {
        expectForbiddenPayload(error, {
          code: 'PERMISSION_AUTHZ_OBLIGATION_MISSING',
          message: 'Permission denied',
        });
      }

      expect(mockDocumentsService.executeAction).not.toHaveBeenCalled();
    });

    it('should return error for unknown action', async () => {
      mockDocumentsService.executeAction.mockRejectedValue(
        new UnknownDocumentActionError('invalid'),
      );

      try {
        await controller.executeAction('PO', '2001', 'invalid', 'idem-key-002');
        throw new Error('expected bad request');
      } catch (error) {
        expectBadRequestPayload(error, {
          code: 'UNKNOWN_ACTION',
          message: 'Unknown action: invalid',
        });
      }
    });

    it('should return error for document not found', async () => {
      mockDocumentsService.executeAction.mockRejectedValue(
        new DocumentNotFoundError('PO', '9999'),
      );

      readAuthzResult.mockReturnValue({
        decision: 'allow',
        obligations: {
          workflow: {
            allowTransitions: ['confirm'],
          },
        },
      });

      try {
        await controller.executeAction('PO', '9999', 'confirm', 'idem-key-003');
        throw new Error('expected not found');
      } catch (error) {
        expectNotFoundPayload(error, {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found: PO/9999',
        });
      }
    });

    it('should map outbound post stock conflict to ConflictException', async () => {
      mockDocumentsService.executeAction.mockRejectedValue(
        new OutboundStockInsufficientError(
          'Insufficient stock for outbound posting',
        ),
      );

      readAuthzResult.mockReturnValue({
        decision: 'allow',
        obligations: {
          workflow: {
            allowTransitions: ['post'],
          },
        },
      });

      try {
        await controller.executeAction('OUT', '5001', 'post', 'idem-key-004');
        throw new Error('expected conflict');
      } catch (error) {
        expectConflictPayload(error, {
          code: 'OUTBOUND_STOCK_INSUFFICIENT',
          message: 'Insufficient stock for outbound posting',
        });
      }
    });
  });

  describe('createDocument', () => {
    it('should parse line-level binId and delegate create to service', async () => {
      const mockResult = {
        id: '3001',
        docNo: 'DOC-GRN-20260313-001',
        docType: 'GRN',
        status: 'draft',
        docDate: '2026-03-13',
        lineCount: 1,
      };

      mockDocumentsService.create.mockResolvedValue(mockResult);

      const result = await controller.createDocument('idem-create-001', {
        docType: 'GRN',
        warehouseId: 'WH-001',
        lines: [
          {
            skuId: 'SKU-001',
            qty: '8',
            unitPrice: '12.5',
            binId: 'BIN-A-01-01',
          },
        ],
      });

      expect(mockDocumentsService.create).toHaveBeenCalledWith(
        'GRN',
        {
          warehouseId: 'WH-001',
          docDate: undefined,
          remarks: undefined,
          supplierId: undefined,
          customerId: undefined,
          sourceDocId: undefined,
          lines: [
            {
              skuId: 'SKU-001',
              qty: '8',
              unitPrice: '12.5',
              binId: 'BIN-A-01-01',
            },
          ],
        },
        '1001',
        'user-001',
        'req-001',
        'idem-create-001',
      );
      expect(result).toEqual(mockResult);
    });

    it('should reject invalid payload before service create', async () => {
      try {
        await controller.createDocument('idem-create-002', {
          docType: 'OUT',
          warehouseId: 'WH-001',
          lines: [{ skuId: 'SKU-001', qty: '3', binId: '   ' }],
        });
        throw new Error('expected bad request');
      } catch (error) {
        expectBadRequestPayload(error, {
          code: 'VALIDATION_INVALID_PAYLOAD',
          message: 'lines[0].binId must be a non-empty string when provided',
        });
      }

      expect(mockDocumentsService.create).not.toHaveBeenCalled();
    });
  });
});
