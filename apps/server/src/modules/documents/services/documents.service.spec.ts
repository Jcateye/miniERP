import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { AuditService } from '../../../audit/application/audit.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { InvalidStatusTransitionError } from '../../core-document/domain/status-transition';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let auditService: AuditService;
  let inventoryPostingService: InventoryPostingService;

  const mockAuditService = {
    recordAuthorization: jest.fn(),
  };

  const mockTenantContextService = {
    getRequiredContext: jest.fn().mockReturnValue({
      tenantId: '1001',
      actorId: 'user-001',
      requestId: 'req-001',
    }),
  };

  const mockInventoryPostingService = {
    post: jest.fn(),
    reverse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
        {
          provide: InventoryPostingService,
          useValue: mockInventoryPostingService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    auditService = module.get<AuditService>(AuditService);
    inventoryPostingService = module.get<InventoryPostingService>(InventoryPostingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated documents filtered by docType', () => {
      const result = service.list({ docType: 'PO' }, '1001');

      expect(result.data).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should return adjustment documents for ADJ docType', () => {
      const result = service.list({ docType: 'ADJ' }, '1001');

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((doc) => doc.docType === 'ADJ')).toBe(true);
    });

    it('should only return documents matching tenant', () => {
      const result = service.list({ docType: 'PO' }, '1001');

      result.data.forEach((doc) => {
        expect(doc.tenantId).toBe('1001');
      });
    });
  });

  describe('getDetail', () => {
    it('should return document with lines', () => {
      const result = service.getDetail('PO', '2001', '1001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('2001');
      expect(result?.docType).toBe('PO');
      expect(result?.lines).toBeDefined();
      expect(result?.lines.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent document', () => {
      const result = service.getDetail('PO', '9999', '1001');

      expect(result).toBeNull();
    });

    it('should return null for cross-tenant access', () => {
      const result = service.getDetail('PO', '2001', '9999');

      expect(result).toBeNull();
    });
  });

  describe('executeAction', () => {
    it('should transition status on valid action', async () => {
      const result = await service.executeAction(
        'PO',
        '2001',
        'confirm',
        'idem-key-001',
        '1001',
        'user-001',
        'req-001',
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe('confirm');
      expect(result.newStatus).toBe('confirmed');
    });

    it('should throw on invalid status transition', async () => {
      await expect(
        service.executeAction(
          'PO',
          '2002', // already confirmed
          'confirm',
          'idem-key-002',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('should throw on unknown action', async () => {
      await expect(
        service.executeAction(
          'PO',
          '2001',
          'invalid',
          'idem-key-003',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow('Unknown action');
    });

    it('should throw on non-existent document', async () => {
      await expect(
        service.executeAction(
          'PO',
          '9999',
          'confirm',
          'idem-key-004',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow('Document not found');
    });

    it('should call inventory posting on GRN post (from validating)', async () => {
      // GRN 状态流: draft -> validating -> posted
      // 先将 3001 从 draft -> validating
      await service.executeAction(
        'GRN',
        '3001',
        'validate',
        'idem-key-grn-validate',
        '1001',
        'user-001',
        'req-001',
      );

      mockInventoryPostingService.post.mockResolvedValue({
        ledgerEntries: [{ id: 'ledger-001' }],
        balanceSnapshots: [],
      });

      const result = await service.executeAction(
        'GRN',
        '3001',
        'post',
        'idem-key-grn-001',
        '1001',
        'user-001',
        'req-001',
      );

      expect(inventoryPostingService.post).toHaveBeenCalled();
      expect(result.inventoryPosted).toBe(true);
      expect(result.ledgerEntryIds).toContain('ledger-001');
    });

    it('should call inventory posting on OUT post (from picking)', async () => {
      // OUT 状态流: draft -> picking -> posted
      // 先将 5001 从 draft -> picking
      await service.executeAction(
        'OUT',
        '5001',
        'pick',
        'idem-key-out-pick',
        '1001',
        'user-001',
        'req-001',
      );

      mockInventoryPostingService.post.mockResolvedValue({
        ledgerEntries: [{ id: 'ledger-002' }],
        balanceSnapshots: [],
      });

      const result = await service.executeAction(
        'OUT',
        '5001',
        'post',
        'idem-key-out-001',
        '1001',
        'user-001',
        'req-001',
      );

      expect(inventoryPostingService.post).toHaveBeenCalled();
      expect(result.inventoryPosted).toBe(true);
    });

    it('should call inventory posting with ADJUSTMENT reference on ADJ post', async () => {
      await service.executeAction(
        'ADJ',
        '6001',
        'validate',
        'idem-key-adj-validate',
        '1001',
        'user-001',
        'req-001',
      );

      mockInventoryPostingService.post.mockResolvedValue({
        ledgerEntries: [{ id: 'ledger-adj-001' }],
        balanceSnapshots: [],
      });

      const result = await service.executeAction(
        'ADJ',
        '6001',
        'post',
        'idem-key-adj-post',
        '1001',
        'user-001',
        'req-001',
      );

      expect(inventoryPostingService.post).toHaveBeenCalledWith(
        '1001',
        expect.objectContaining({
          referenceType: 'ADJUSTMENT',
          referenceId: '6001',
        }),
        'req-001',
      );
      expect(result.inventoryPosted).toBe(true);
      expect(result.ledgerEntryIds).toContain('ledger-adj-001');
    });

    it('should record audit on successful action', async () => {
      await service.executeAction(
        'PO',
        '2001',
        'confirm',
        'idem-key-005',
        '1001',
        'user-001',
        'req-001',
      );

      expect(auditService.recordAuthorization).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'success',
          action: 'document.confirm',
        }),
      );
    });

    it('should record audit on failed transition', async () => {
      try {
        await service.executeAction(
          'PO',
          '2002',
          'confirm',
          'idem-key-006',
          '1001',
          'user-001',
          'req-001',
        );
      } catch {
        // expected
      }

      expect(auditService.recordAuthorization).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'deny',
          reason: 'INVALID_STATUS_TRANSITION',
        }),
      );
    });
  });
});
