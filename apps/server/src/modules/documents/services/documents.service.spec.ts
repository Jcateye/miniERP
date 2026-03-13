import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { AuditService } from '../../../audit/application/audit.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { InvalidStatusTransitionError } from '../../core-document/domain/status-transition';
import { InventoryInsufficientStockError } from '../../inventory/domain/inventory.errors';
import { HttpException } from '@nestjs/common';
import {
  PurchaseInboundWriteService,
  SalesShipmentWriteService,
  TradingDocumentsReadService,
} from '../../trading';

describe('DocumentsService', () => {
  let service: DocumentsService;

  const mockAuditService = {
    recordAuthorization: jest.fn(),
  };

  const mockInventoryPostingService = {
    post: jest.fn(),
    postInTransaction: jest.fn(),
    reverse: jest.fn(),
    reverseInTransaction: jest.fn(),
  };

  function createPurchaseInboundWriteService(prisma?: unknown) {
    return new PurchaseInboundWriteService(
      mockAuditService as unknown as AuditService,
      mockInventoryPostingService as unknown as InventoryPostingService,
      prisma as never,
    );
  }

  function createSalesShipmentWriteService(prisma?: unknown) {
    return new SalesShipmentWriteService(
      mockAuditService as unknown as AuditService,
      mockInventoryPostingService as unknown as InventoryPostingService,
      prisma as never,
    );
  }

  function createTradingDocumentsReadService(prisma?: unknown) {
    return new TradingDocumentsReadService(prisma as never);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: InventoryPostingService,
          useValue: mockInventoryPostingService,
        },
        PurchaseInboundWriteService,
        SalesShipmentWriteService,
        TradingDocumentsReadService,
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated documents filtered by docType', async () => {
      const result = await service.list({ docType: 'PO' }, '1001');

      expect(result.data).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should return adjustment documents for ADJ docType', async () => {
      const result = await service.list({ docType: 'ADJ' }, '1001');

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((doc) => doc.docType === 'ADJ')).toBe(true);
    });

    it('should only return documents matching tenant', async () => {
      const result = await service.list({ docType: 'PO' }, '1001');

      result.data.forEach((doc) => {
        expect(doc.tenantId).toBe('1001');
      });
    });
  });

  describe('getDetail', () => {
    it('should return document with lines', async () => {
      const result = await service.getDetail('PO', '2001', '1001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('2001');
      expect(result?.docType).toBe('PO');
      expect(result?.lines).toBeDefined();
      expect(result?.lines.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent document', async () => {
      const result = await service.getDetail('PO', '9999', '1001');

      expect(result).toBeNull();
    });

    it('should return null for cross-tenant access', async () => {
      const result = await service.getDetail('PO', '2001', '9999');

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

    it('should require idempotency key in service layer', async () => {
      await expect(
        service.executeAction(
          'PO',
          '2001',
          'confirm',
          ' ',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow('Idempotency-Key is required');
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

      expect(mockInventoryPostingService.post).toHaveBeenCalled();
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

      expect(mockInventoryPostingService.post).toHaveBeenCalled();
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

      expect(mockInventoryPostingService.post).toHaveBeenCalledWith(
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

      expect(mockAuditService.recordAuthorization).toHaveBeenCalledWith(
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

      expect(mockAuditService.recordAuthorization).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'deny',
          reason: 'INVALID_STATUS_TRANSITION',
        }),
      );
    });

    it('should deduplicate concurrent posts with the same idempotency key', async () => {
      await service.executeAction(
        'GRN',
        '3001',
        'validate',
        'idem-key-grn-dedup-validate',
        '1001',
        'user-001',
        'req-001',
      );

      mockInventoryPostingService.post.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ledgerEntries: [{ id: 'ledger-dedup-001' }],
                balanceSnapshots: [],
              });
            }, 10);
          }),
      );

      const [first, second] = await Promise.all([
        service.executeAction(
          'GRN',
          '3001',
          'post',
          'idem-key-grn-dedup-post',
          '1001',
          'user-001',
          'req-001',
        ),
        service.executeAction(
          'GRN',
          '3001',
          'post',
          'idem-key-grn-dedup-post',
          '1001',
          'user-001',
          'req-001',
        ),
      ]);

      expect(first).toEqual(second);
      expect(mockInventoryPostingService.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should require warehouseId for GRN documents', async () => {
      await expect(
        service.create(
          'GRN',
          {
            lines: [{ skuId: 'CAB-HDMI-2M', qty: '5' }],
          },
          '1001',
          'user-001',
          'req-001',
          'idem-create-grn-no-warehouse',
        ),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          code: 'VALIDATION_DOCUMENT_WAREHOUSE_REQUIRED',
        }),
      });
    });

    it('should resolve warehouse code and sku code when creating GRN with prisma', async () => {
      const mockPrisma = {
        tenant: {
          findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
        },
        warehouse: {
          findFirst: jest.fn().mockResolvedValue({ id: BigInt(2001) }),
        },
        sku: {
          findFirst: jest.fn().mockResolvedValue({ id: BigInt(3001) }),
        },
        purchaseOrder: {
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        purchaseOrderLine: {
          createMany: jest.fn(),
        },
        grn: {
          findFirst: jest.fn(),
          create: jest.fn().mockResolvedValue({
            id: BigInt(4001),
            docDate: new Date('2026-03-12'),
          }),
        },
        grnLine: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };
      mockPrisma.grn.findFirst.mockResolvedValue(null);

      const persistentService = new DocumentsService(
        mockAuditService as unknown as AuditService,
        mockInventoryPostingService as unknown as InventoryPostingService,
        createPurchaseInboundWriteService(mockPrisma),
        createSalesShipmentWriteService(mockPrisma),
        createTradingDocumentsReadService(mockPrisma),
        mockPrisma as never,
      );

      const result = await persistentService.create(
        'GRN',
        {
          warehouseId: 'WH-A',
          lines: [{ skuId: 'SKU-DEMO-001', qty: '10', unitPrice: '12.50' }],
        },
        '1001',
        'user-001',
        'req-001',
        'idem-create-grn-with-warehouse',
      );

      expect(mockPrisma.warehouse.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: BigInt(1001),
          code: 'WH-A',
          deletedAt: null,
        },
        select: { id: true },
      });
      expect(mockPrisma.sku.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: BigInt(1001),
          skuCode: 'SKU-DEMO-001',
          deletedAt: null,
        },
        select: { id: true },
      });
      expect(mockPrisma.grn.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: BigInt(1001),
          warehouseId: BigInt(2001),
        }),
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: '4001',
          docType: 'GRN',
          lineCount: 1,
        }),
      );
    });

    it('should reject unknown numeric warehouseId for OUT documents', async () => {
      const mockPrisma = {
        tenant: {
          findFirst: jest.fn().mockResolvedValue({ id: BigInt(1001) }),
        },
        warehouse: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
        sku: {
          findFirst: jest.fn().mockResolvedValue({ id: BigInt(3001) }),
        },
        salesOrder: {
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        salesOrderLine: {
          createMany: jest.fn(),
        },
        outbound: {
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        outboundLine: {
          createMany: jest.fn(),
        },
      };
      mockPrisma.outbound.findFirst.mockResolvedValue(null);

      const persistentService = new DocumentsService(
        mockAuditService as unknown as AuditService,
        mockInventoryPostingService as unknown as InventoryPostingService,
        createPurchaseInboundWriteService(mockPrisma),
        createSalesShipmentWriteService(mockPrisma),
        createTradingDocumentsReadService(mockPrisma),
        mockPrisma as never,
      );

      await expect(
        persistentService.create(
          'OUT',
          {
            warehouseId: '9999',
            lines: [{ skuId: 'SKU-DEMO-001', qty: '2' }],
          },
          '1001',
          'user-001',
          'req-001',
          'idem-create-out-unknown-warehouse',
        ),
      ).rejects.toBeInstanceOf(HttpException);

      await expect(
        persistentService.create(
          'OUT',
          {
            warehouseId: '9999',
            lines: [{ skuId: 'SKU-DEMO-001', qty: '2' }],
          },
          '1001',
          'user-001',
          'req-001',
          'idem-create-out-unknown-warehouse',
        ),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          code: 'VALIDATION_WAREHOUSE_NOT_FOUND',
        }),
      });
    });
  });

  describe('stream D persisted sales/outbound', () => {
    const mockSalesOutboundPrisma = {
      tenant: {
        findFirst: jest.fn(),
      },
      salesOrder: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      salesOrderLine: {
        groupBy: jest.fn(),
      },
      outbound: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      outboundLine: {
        findMany: jest.fn(),
      },
      stateTransitionLog: {
        create: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    let streamDService: DocumentsService;

    beforeEach(() => {
      streamDService = new DocumentsService(
        mockAuditService as unknown as AuditService,
        mockInventoryPostingService as unknown as InventoryPostingService,
        createPurchaseInboundWriteService(mockSalesOutboundPrisma),
        createSalesShipmentWriteService(mockSalesOutboundPrisma),
        createTradingDocumentsReadService(mockSalesOutboundPrisma),
        mockSalesOutboundPrisma as never,
      );

      mockSalesOutboundPrisma.tenant.findFirst.mockResolvedValue({
        id: BigInt(1001),
      });
      mockSalesOutboundPrisma.salesOrder.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          tenantId: BigInt(1001),
          docNo: 'DOC-SO-20260305-001',
          docDate: new Date('2026-03-05'),
          status: 'draft',
          remarks: null,
          createdAt: new Date('2026-03-05T10:00:00Z'),
          createdBy: '9001',
          updatedAt: new Date('2026-03-05T10:00:00Z'),
          updatedBy: '9001',
          deletedAt: null,
          deletedBy: null,
          totalQty: { toString: () => '10' },
          totalAmount: { toString: () => '100' },
          _count: { SalesOrderLine: 1 },
        },
      ]);
      mockSalesOutboundPrisma.salesOrder.count.mockResolvedValue(1);
      mockSalesOutboundPrisma.salesOrderLine.groupBy.mockResolvedValue([
        { soId: BigInt(1), _count: { _all: 1 } },
      ]);
      mockSalesOutboundPrisma.outboundLine.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          lineNo: 1,
          skuId: BigInt(11),
          qty: { toString: () => '5' },
        },
      ]);
      mockSalesOutboundPrisma.outbound.updateMany.mockResolvedValue({
        count: 1,
      });
      mockSalesOutboundPrisma.stateTransitionLog.create.mockResolvedValue({
        id: BigInt(1),
      });
      mockSalesOutboundPrisma.outboxEvent.create.mockResolvedValue({
        id: BigInt(1),
      });
      mockSalesOutboundPrisma.$transaction.mockImplementation(
        (work: (tx: typeof mockSalesOutboundPrisma) => unknown) =>
          Promise.resolve(work(mockSalesOutboundPrisma)),
      );
    });

    it('lists SO documents from prisma when prisma is available', async () => {
      const result = await streamDService.list({ docType: 'SO' }, '1001');

      expect(mockSalesOutboundPrisma.salesOrder.findMany).toHaveBeenCalled();
      expect(result.data[0]?.docType).toBe('SO');
      expect(result.total).toBe(1);
    });

    it('returns semantic stock error when OUT post is insufficient', async () => {
      mockSalesOutboundPrisma.outbound.findFirst.mockResolvedValue({
        id: BigInt(5001),
        tenantId: BigInt(1001),
        docNo: 'DOC-OUT-20260305-001',
        docDate: new Date('2026-03-05'),
        status: 'picking',
        soId: null,
        warehouseId: null,
        remarks: null,
        totalQty: { toString: () => '5' },
        createdAt: new Date('2026-03-05T10:00:00Z'),
        createdBy: '9001',
        updatedAt: new Date('2026-03-05T10:00:00Z'),
        updatedBy: '9001',
        deletedAt: null,
        deletedBy: null,
        OutboundLine: [
          {
            id: BigInt(1),
            lineNo: 1,
            skuId: BigInt(11),
            qty: { toString: () => '5' },
          },
        ],
      });

      mockInventoryPostingService.postInTransaction.mockRejectedValue(
        new InventoryInsufficientStockError('11', 'WH-001', 0, 5),
      );

      await expect(
        streamDService.executeAction(
          'OUT',
          '5001',
          'post',
          'idem-out-1',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('executeAction (persistent GRN post)', () => {
    const decimalLike = (value: string) => ({
      toString: () => value,
    });

    const mockPrisma = {
      tenant: {
        findFirst: jest.fn(),
      },
      grn: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      grnLine: {
        findMany: jest.fn(),
      },
      purchaseOrder: {
        findFirst: jest.fn(),
      },
      purchaseOrderLine: {
        findMany: jest.fn(),
      },
      stateTransitionLog: {
        create: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    let persistentService: DocumentsService;

    beforeEach(() => {
      persistentService = new DocumentsService(
        mockAuditService as unknown as AuditService,
        mockInventoryPostingService as unknown as InventoryPostingService,
        createPurchaseInboundWriteService(mockPrisma),
        createSalesShipmentWriteService(mockPrisma),
        createTradingDocumentsReadService(mockPrisma),
        mockPrisma as never,
      );

      mockPrisma.tenant.findFirst.mockResolvedValue({ id: BigInt(1001) });
      mockPrisma.grn.findFirst.mockResolvedValue({
        id: BigInt(3001),
        status: 'validating',
        warehouseId: BigInt(2001),
        poId: BigInt(4001),
        docNo: 'DOC-GRN-20260305-001',
        deletedAt: null,
      });
      mockPrisma.grnLine.findMany.mockResolvedValue([
        { lineNo: 1, skuId: BigInt(9001), qty: decimalLike('3') },
      ]);
      mockPrisma.purchaseOrder.findFirst.mockResolvedValue({
        id: BigInt(4001),
        docNo: 'DOC-PO-20260305-001',
        status: 'confirmed',
      });
      mockPrisma.purchaseOrderLine.findMany.mockResolvedValue([
        { skuId: BigInt(9001), qty: decimalLike('3') },
      ]);
      mockPrisma.grn.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.stateTransitionLog.create.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.outboxEvent.create.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.$transaction.mockImplementation(
        (work: (tx: typeof mockPrisma) => unknown) =>
          Promise.resolve(work(mockPrisma)),
      );
      mockInventoryPostingService.postInTransaction.mockResolvedValue({
        ledgerEntries: [{ id: 'ledger-001' }],
        balanceSnapshots: [],
      });
    });

    it('should fail before inventory posting when GRN status CAS is lost', async () => {
      mockPrisma.grn.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        persistentService.executeAction(
          'GRN',
          '3001',
          'post',
          'idem-key-grn-persistent-cas-fail',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow(InvalidStatusTransitionError);

      expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalled();
      expect(mockPrisma.stateTransitionLog.create).not.toHaveBeenCalled();
      expect(mockPrisma.outboxEvent.create).not.toHaveBeenCalled();
    });

    it('should keep GRN status side effects pending when inventory posting fails in transaction', async () => {
      mockInventoryPostingService.postInTransaction.mockRejectedValueOnce(
        new Error('inventory unavailable'),
      );

      await expect(
        persistentService.executeAction(
          'GRN',
          '3001',
          'post',
          'idem-key-grn-persistent-post-fail',
          '1001',
          'user-001',
          'req-001',
        ),
      ).rejects.toThrow('inventory unavailable');

      expect(mockPrisma.grn.updateMany).not.toHaveBeenCalledWith({
        where: {
          tenantId: BigInt(1001),
          id: BigInt(3001),
          status: 'posted',
          deletedAt: null,
        },
        data: {
          status: 'validating',
          updatedBy: 'user-001',
        },
      });
      expect(mockPrisma.grn.updateMany).not.toHaveBeenCalledWith({
        where: {
          tenantId: BigInt(1001),
          id: BigInt(3001),
          status: 'validating',
          deletedAt: null,
        },
        data: {
          status: 'posted',
          updatedBy: 'user-001',
        },
      });
      expect(mockPrisma.stateTransitionLog.create).not.toHaveBeenCalled();
      expect(mockPrisma.outboxEvent.create).not.toHaveBeenCalled();
    });

    it('should aggregate duplicated SKU quantities from PO lines before GRN validation', async () => {
      mockPrisma.purchaseOrderLine.findMany.mockResolvedValueOnce([
        { skuId: BigInt(9001), qty: decimalLike('1') },
        { skuId: BigInt(9001), qty: decimalLike('2') },
      ]);

      const result = await persistentService.executeAction(
        'GRN',
        '3001',
        'post',
        'idem-key-grn-persistent-po-aggregate',
        '1001',
        'user-001',
        'req-001',
      );

      expect(result.success).toBe(true);
      expect(mockInventoryPostingService.postInTransaction).toHaveBeenCalled();
      expect(mockPrisma.stateTransitionLog.create).toHaveBeenCalled();
      const outboxCreateCalls = mockPrisma.outboxEvent.create.mock
        .calls as ReadonlyArray<
        [
          {
            data: {
              aggregateType: string;
              aggregateId: string;
              eventType: string;
            };
          },
        ]
      >;
      const outboxEvent = outboxCreateCalls.at(-1)?.[0];
      expect(outboxEvent?.data).toMatchObject({
        aggregateType: 'document',
        aggregateId: '3001',
        eventType: 'document.grn.posted',
      });
    });
  });
});
