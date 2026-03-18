import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TradingDocumentsReadService } from './trading-documents-read.service';

function decimalLike(value: string) {
  return {
    toString: () => value,
  };
}

function makeHeader(
  id: number,
  docNo: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: BigInt(id),
    docNo,
    docDate: new Date('2026-03-18T00:00:00.000Z'),
    status: 'draft',
    supplierId: null,
    customerId: null,
    counterpartyId: null,
    remarks: 'fixture',
    createdAt: new Date('2026-03-18T01:00:00.000Z'),
    createdBy: '9001',
    updatedAt: new Date('2026-03-18T02:00:00.000Z'),
    updatedBy: '9001',
    deletedAt: null,
    deletedBy: null,
    totalQty: decimalLike('3'),
    totalAmount: decimalLike('99'),
    ...overrides,
  };
}

function makeLine(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id: BigInt(id),
    lineNo: 1,
    skuId: BigInt(501),
    binId: null,
    itemNameSnapshot: 'Item A',
    specModelSnapshot: 'Spec A',
    uom: 'PCS',
    qty: decimalLike('2'),
    unitPrice: decimalLike('33'),
    amount: decimalLike('66'),
    taxAmount: decimalLike('0'),
    ...overrides,
  };
}

describe('TradingDocumentsReadService', () => {
  const mockTenantId = '1001';

  let service: TradingDocumentsReadService;
  let mockTx: any;
  let mockPlatformDb: any;

  beforeEach(() => {
    mockTx = {
      purchaseOrder: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          makeHeader(11, 'DOC-PO-20260318-001', { supplierId: BigInt(21) }),
        ]),
        findFirst: jest.fn().mockResolvedValue(
          makeHeader(11, 'DOC-PO-20260318-001', { supplierId: BigInt(21) }),
        ),
      },
      purchaseOrderLine: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ poId: BigInt(11), _count: { _all: 2 } }]),
        findMany: jest.fn().mockResolvedValue([makeLine(101)]),
      },
      grn: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          makeHeader(31, 'DOC-GRN-20260318-001'),
        ]),
        findFirst: jest
          .fn()
          .mockResolvedValue(makeHeader(31, 'DOC-GRN-20260318-001')),
      },
      grnLine: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ grnId: BigInt(31), _count: { _all: 1 } }]),
        findMany: jest
          .fn()
          .mockResolvedValue([makeLine(301, { binId: BigInt(701) })]),
      },
      salesOrder: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          makeHeader(41, 'DOC-SO-20260318-001', { customerId: BigInt(41) }),
        ]),
        findFirst: jest.fn().mockResolvedValue(
          makeHeader(41, 'DOC-SO-20260318-001', { customerId: BigInt(41) }),
        ),
      },
      salesOrderLine: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ soId: BigInt(41), _count: { _all: 1 } }]),
        findMany: jest.fn().mockResolvedValue([makeLine(401)]),
      },
      outbound: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          makeHeader(51, 'DOC-OUT-20260318-001'),
        ]),
        findFirst: jest
          .fn()
          .mockResolvedValue(makeHeader(51, 'DOC-OUT-20260318-001')),
      },
      outboundLine: {
        groupBy: jest.fn().mockResolvedValue([
          { outboundId: BigInt(51), _count: { _all: 1 } },
        ]),
        findMany: jest
          .fn()
          .mockResolvedValue([makeLine(501, { binId: BigInt(801) })]),
      },
    };

    mockPlatformDb = {
      withTenantTx: jest.fn().mockImplementation((fn: any) => fn(mockTx)),
    };

    service = new TradingDocumentsReadService(mockPlatformDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists purchase orders without tenantId filters once schema isolation is active', async () => {
    const result = await service.list(
      { docType: 'PO', page: 1, pageSize: 20 },
      mockTenantId,
    );

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: '11',
      tenantId: mockTenantId,
      docType: 'PO',
      lineCount: 2,
    });

    expect(mockTx.purchaseOrder.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
    expect(mockTx.purchaseOrder.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 20,
    });
    expect(mockTx.purchaseOrderLine.groupBy).toHaveBeenCalledWith({
      by: ['poId'],
      where: { poId: { in: [BigInt(11)] } },
      _count: { _all: true },
    });
  });

  it('lists GRN documents without tenantId filters once schema isolation is active', async () => {
    const result = await service.list(
      { docType: 'GRN', page: 1, pageSize: 20 },
      mockTenantId,
    );

    expect(result.data[0]).toMatchObject({
      id: '31',
      tenantId: mockTenantId,
      docType: 'GRN',
      lineCount: 1,
    });
    expect(mockTx.grn.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
    expect(mockTx.grn.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 20,
    });
    expect(mockTx.grnLine.groupBy).toHaveBeenCalledWith({
      by: ['grnId'],
      where: { grnId: { in: [BigInt(31)] } },
      _count: { _all: true },
    });
  });

  it('lists SO documents without tenantId filters once schema isolation is active', async () => {
    const result = await service.list(
      { docType: 'SO', page: 1, pageSize: 20 },
      mockTenantId,
    );

    expect(result.data[0]).toMatchObject({
      id: '41',
      tenantId: mockTenantId,
      docType: 'SO',
      lineCount: 1,
    });
    expect(mockTx.salesOrder.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
    expect(mockTx.salesOrder.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 20,
    });
    expect(mockTx.salesOrderLine.groupBy).toHaveBeenCalledWith({
      by: ['soId'],
      where: { soId: { in: [BigInt(41)] } },
      _count: { _all: true },
    });
  });

  it('lists OUT documents without tenantId filters once schema isolation is active', async () => {
    const result = await service.list(
      { docType: 'OUT', page: 1, pageSize: 20 },
      mockTenantId,
    );

    expect(result.data[0]).toMatchObject({
      id: '51',
      tenantId: mockTenantId,
      docType: 'OUT',
      lineCount: 1,
    });
    expect(mockTx.outbound.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
    expect(mockTx.outbound.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 20,
    });
    expect(mockTx.outboundLine.groupBy).toHaveBeenCalledWith({
      by: ['outboundId'],
      where: { outboundId: { in: [BigInt(51)] } },
      _count: { _all: true },
    });
  });

  it('returns null for invalid bigint id without tenant lookup queries', async () => {
    const result = await service.getDetail('PO', 'abc', mockTenantId);

    expect(result).toBeNull();
    expect(mockPlatformDb.withTenantTx).toHaveBeenCalledTimes(1);
    expect(mockTx.purchaseOrder.findFirst).not.toHaveBeenCalled();
    expect(mockTx.purchaseOrderLine.findMany).not.toHaveBeenCalled();
  });

  it('loads purchase order detail without tenantId filters once schema isolation is active', async () => {
    const result = await service.getDetail('PO', '11', mockTenantId);

    expect(result).toMatchObject({
      id: '11',
      tenantId: mockTenantId,
      docType: 'PO',
      lineCount: 1,
    });
    expect(result?.lines).toHaveLength(1);

    expect(mockTx.purchaseOrder.findFirst).toHaveBeenCalledWith({
      where: { id: BigInt(11), deletedAt: null },
    });
    expect(mockTx.purchaseOrderLine.findMany).toHaveBeenCalledWith({
      where: { poId: BigInt(11) },
      orderBy: { lineNo: 'asc' },
    });
  });

  it('loads GRN detail without tenantId filters once schema isolation is active', async () => {
    const result = await service.getDetail('GRN', '31', mockTenantId);

    expect(result).toMatchObject({
      id: '31',
      tenantId: mockTenantId,
      docType: 'GRN',
      lineCount: 1,
    });
    expect(mockTx.grn.findFirst).toHaveBeenCalledWith({
      where: { id: BigInt(31), deletedAt: null },
    });
    expect(mockTx.grnLine.findMany).toHaveBeenCalledWith({
      where: { grnId: BigInt(31) },
      orderBy: { lineNo: 'asc' },
    });
  });

  it('loads SO detail without tenantId filters once schema isolation is active', async () => {
    const result = await service.getDetail('SO', '41', mockTenantId);

    expect(result).toMatchObject({
      id: '41',
      tenantId: mockTenantId,
      docType: 'SO',
      lineCount: 1,
    });
    expect(mockTx.salesOrder.findFirst).toHaveBeenCalledWith({
      where: { id: BigInt(41), deletedAt: null },
    });
    expect(mockTx.salesOrderLine.findMany).toHaveBeenCalledWith({
      where: { soId: BigInt(41) },
      orderBy: { lineNo: 'asc' },
    });
  });

  it('loads OUT detail without tenantId filters once schema isolation is active', async () => {
    const result = await service.getDetail('OUT', '51', mockTenantId);

    expect(result).toMatchObject({
      id: '51',
      tenantId: mockTenantId,
      docType: 'OUT',
      lineCount: 1,
    });
    expect(mockTx.outbound.findFirst).toHaveBeenCalledWith({
      where: { id: BigInt(51), deletedAt: null },
    });
    expect(mockTx.outboundLine.findMany).toHaveBeenCalledWith({
      where: { outboundId: BigInt(51) },
      orderBy: { lineNo: 'asc' },
    });
  });
});
