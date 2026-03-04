import { describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentsService } from './documents.service';
import { AuditService } from '../../../audit/application/audit.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { InMemoryInventoryConsistencyStore } from '../../inventory/infrastructure/in-memory-inventory-consistency.store';
import { InvalidStatusTransitionError } from '../../core-document/domain/status-transition';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let inventoryPostingService: InventoryPostingService;

  beforeEach(() => {
    const auditService = {
      recordAuthorization: jest.fn(),
      recordDocumentAction: jest.fn(),
    } as unknown as AuditService;

    const tenantContextService = {
      getRequiredContext: jest.fn(() => ({
        tenantId: '1001',
        actorId: '9001',
        requestId: 'req-001',
      })),
    } as unknown as TenantContextService;

    const inventoryStore = new InMemoryInventoryConsistencyStore();
    inventoryPostingService = new InventoryPostingService(inventoryStore);

    service = new DocumentsService(
      auditService,
      tenantContextService,
      inventoryPostingService,
    );
  });

  describe('list', () => {
    it('should return documents filtered by docType', () => {
      const result = service.list({ docType: 'PO' }, '1001');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(d => d.docType === 'PO')).toBe(true);
    });

    it('should support pagination', () => {
      const page1 = service.list({ docType: 'PO', page: 1, pageSize: 1 }, '1001');
      const page2 = service.list({ docType: 'PO', page: 2, pageSize: 1 }, '1001');

      expect(page1.data).toHaveLength(1);
      expect(page2.data).toHaveLength(1);
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });
  });

  describe('getDetail', () => {
    it('should return document with lines', () => {
      const doc = service.getDetail('PO', '2001', '1001');

      expect(doc).not.toBeNull();
      expect(doc?.lines).toHaveLength(2);
      expect(doc?.lines[0].skuId).toBe('CAB-HDMI-2M');
    });

    it('should return null for non-existent document', () => {
      const doc = service.getDetail('PO', '9999', '1001');

      expect(doc).toBeNull();
    });
  });

  describe('executeAction', () => {
    it('should transition draft to confirmed', async () => {
      const result = await service.executeAction(
        'PO',
        '2001',
        'confirm',
        'idem-key-001',
        '1001',
        '9001',
        'req-001',
      );

      expect(result.success).toBe(true);
      expect(result.previousStatus).toBe('draft');
      expect(result.newStatus).toBe('confirmed');
    });

    it('should reject invalid status transition', async () => {
      // GRN 3002 is already 'posted', cannot confirm again
      await expect(
        service.executeAction('GRN', '3002', 'confirm', 'idem-key-002', '1001', '9001', 'req-002'),
      ).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('should reject unknown action', async () => {
      await expect(
        service.executeAction('PO', '2001', 'unknown-action', 'idem-key-003', '1001', '9001', 'req-003'),
      ).rejects.toThrow('Unknown action');
    });

    it('should post to inventory on GRN post action', async () => {
      // GRN: draft -> validating -> posted
      await service.executeAction('GRN', '3001', 'validate', 'idem-key-grn-validate', '1001', '9001', 'req-grn-1');

      const result = await service.executeAction(
        'GRN',
        '3001',
        'post',
        'idem-key-grn-post',
        '1001',
        '9001',
        'req-grn-2',
      );

      expect(result.inventoryPosted).toBe(true);
      expect(result.ledgerEntryIds).toHaveLength(2);
    });

    it('should post to inventory on OUT post action', async () => {
      // First, add inventory via GRN to have stock available
      await service.executeAction('GRN', '3001', 'validate', 'idem-key-grn-validate-for-out', '1001', '9001', 'req-grn-for-out');
      await service.executeAction('GRN', '3001', 'post', 'idem-key-grn-post-for-out', '1001', '9001', 'req-grn-post-for-out');

      // OUT: draft -> picking -> posted
      await service.executeAction('OUT', '5001', 'pick', 'idem-key-out-pick', '1001', '9001', 'req-out-1');

      const result = await service.executeAction(
        'OUT',
        '5001',
        'post',
        'idem-key-out-post',
        '1001',
        '9001',
        'req-out-2',
      );

      expect(result.inventoryPosted).toBe(true);
      expect(result.ledgerEntryIds).toHaveLength(2);
    });

    it('should return same result on idempotent replay', async () => {
      const result1 = await service.executeAction(
        'PO',
        '2001',
        'confirm',
        'idem-key-replay-test',
        '1001',
        '9001',
        'req-replay-1',
      );

      expect(result1.success).toBe(true);
      expect(result1.previousStatus).toBe('draft');
      expect(result1.newStatus).toBe('confirmed');

      // Verify document status changed
      const doc = service.getDetail('PO', '2001', '1001');
      expect(doc?.status).toBe('confirmed');
    });

    it('should throw for non-existent document', async () => {
      await expect(
        service.executeAction('PO', '9999', 'confirm', 'idem-key-999', '1001', '9001', 'req-999'),
      ).rejects.toThrow('Document not found');
    });
  });
});
