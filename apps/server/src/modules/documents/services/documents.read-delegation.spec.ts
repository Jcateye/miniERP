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

describe('DocumentsService read delegation', () => {
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
    canHandle: jest.fn(),
    list: jest.fn(),
    getDetail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates persisted list to trading read service', async () => {
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

    mockTradingDocumentsReadService.canHandle.mockReturnValue(true);
    mockTradingDocumentsReadService.list.mockResolvedValue({
      data: [{ id: '1', docType: 'SO', status: 'draft' }],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const result = await service.list({ docType: 'SO' }, '1001');

    expect(mockTradingDocumentsReadService.list).toHaveBeenCalledWith(
      { docType: 'SO' },
      '1001',
    );
    expect(result.total).toBe(1);
  });

  it('delegates persisted detail to trading read service', async () => {
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

    mockTradingDocumentsReadService.canHandle.mockReturnValue(true);
    mockTradingDocumentsReadService.getDetail.mockResolvedValue({
      id: '1',
      tenantId: '1001',
      docNo: 'DOC-SO-20260313-001',
      docType: 'SO',
      docDate: '2026-03-13',
      status: 'draft',
      remarks: null,
      createdAt: '2026-03-13T00:00:00.000Z',
      createdBy: 'user-001',
      updatedAt: '2026-03-13T00:00:00.000Z',
      updatedBy: 'user-001',
      deletedAt: null,
      deletedBy: null,
      lineCount: 1,
      totalQty: '10',
      totalAmount: '20',
      lines: [],
    });

    const result = await service.getDetail('SO', '1', '1001');

    expect(mockTradingDocumentsReadService.getDetail).toHaveBeenCalledWith(
      'SO',
      '1',
      '1001',
    );
    expect(result?.docType).toBe('SO');
  });

  it('keeps ADJ list on facade compatibility store', async () => {
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

    mockTradingDocumentsReadService.canHandle.mockReturnValue(false);

    const result = await service.list({ docType: 'ADJ' }, '1001');

    expect(mockTradingDocumentsReadService.list).not.toHaveBeenCalled();
    expect(result.total).toBe(2);
    expect(result.data.every((item) => item.docType === 'ADJ')).toBe(true);
  });
});
