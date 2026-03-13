import { Test } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { AuditService } from '../../../audit/application/audit.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  PurchaseInboundWriteService,
  SalesShipmentWriteService,
  TradingDocumentsReadService,
} from '../../trading';

describe('DocumentsService write delegation', () => {
  const mockAuditService = {
    recordAuthorization: jest.fn(),
  };

  const mockInventoryPostingService = {
    post: jest.fn(),
    postInTransaction: jest.fn(),
    reverse: jest.fn(),
    reverseInTransaction: jest.fn(),
  };

  const mockPrismaService = {};

  const mockPurchaseInboundWriteService = {
    create: jest.fn(),
    executeAction: jest.fn(),
  };

  const mockSalesShipmentWriteService = {
    create: jest.fn(),
    executeAction: jest.fn(),
  };

  const mockTradingDocumentsReadService = {
    canHandle: jest.fn().mockReturnValue(false),
    list: jest.fn(),
    getDetail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates persisted purchase creation to purchase inbound write service', async () => {
    const module = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: AuditService, useValue: mockAuditService },
        {
          provide: InventoryPostingService,
          useValue: mockInventoryPostingService,
        },
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: PurchaseInboundWriteService,
          useValue: mockPurchaseInboundWriteService,
        },
        {
          provide: SalesShipmentWriteService,
          useValue: mockSalesShipmentWriteService,
        },
        {
          provide: TradingDocumentsReadService,
          useValue: mockTradingDocumentsReadService,
        },
      ],
    }).compile();

    const service = module.get(DocumentsService);

    mockPurchaseInboundWriteService.create.mockResolvedValue({
      id: '9001',
      docNo: 'DOC-PO-20260313-001',
      docType: 'PO',
      status: 'draft',
      docDate: '2026-03-13',
      lineCount: 1,
    });

    const result = await service.create(
      'PO',
      {
        warehouseId: '1',
        supplierId: '1',
        lines: [{ skuId: '1', qty: '10', unitPrice: '2' }],
      },
      '1001',
      'user-001',
      'req-001',
      'idem-po-001',
    );

    expect(mockPurchaseInboundWriteService.create).toHaveBeenCalledWith(
      'PO',
      expect.objectContaining({
        supplierId: '1',
      }),
      '1001',
      'user-001',
      'req-001',
    );
    expect(result.docType).toBe('PO');
  });

  it('delegates persisted outbound action to sales shipment write service', async () => {
    const module = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: AuditService, useValue: mockAuditService },
        {
          provide: InventoryPostingService,
          useValue: mockInventoryPostingService,
        },
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: PurchaseInboundWriteService,
          useValue: mockPurchaseInboundWriteService,
        },
        {
          provide: SalesShipmentWriteService,
          useValue: mockSalesShipmentWriteService,
        },
        {
          provide: TradingDocumentsReadService,
          useValue: mockTradingDocumentsReadService,
        },
      ],
    }).compile();

    const service = module.get(DocumentsService);

    mockSalesShipmentWriteService.executeAction.mockResolvedValue({
      success: true,
      documentId: '5001',
      docType: 'OUT',
      previousStatus: 'draft',
      newStatus: 'picking',
      action: 'pick',
      inventoryPosted: false,
      ledgerEntryIds: [],
    });

    const result = await service.executeAction(
      'OUT',
      '5001',
      'pick',
      'idem-out-001',
      '1001',
      'user-001',
      'req-001',
    );

    expect(mockSalesShipmentWriteService.executeAction).toHaveBeenCalledWith(
      'OUT',
      '5001',
      'pick',
      'idem-out-001',
      '1001',
      'user-001',
      'req-001',
    );
    expect(result.newStatus).toBe('picking');
  });
});
