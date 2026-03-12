import {
  getCanonicalTradingDocumentType,
  getTradingModuleBoundary,
  isTradingBoundaryStatus,
} from './trading-document.catalog';
import { purchaseDocumentBoundary } from '../../purchase/application/purchase-document.boundary';
import { inboundDocumentBoundary } from '../../inbound/application/inbound-document.boundary';
import { salesDocumentBoundary } from '../../sales/application/sales-document.boundary';
import { outboundDocumentBoundary } from '../../outbound/application/outbound-document.boundary';

describe('trading-document.catalog', () => {
  it('maps legacy document types to canonical document types', () => {
    expect(getCanonicalTradingDocumentType('PO')).toBe('purchase_order');
    expect(getCanonicalTradingDocumentType('GRN')).toBe('goods_receipt');
    expect(getCanonicalTradingDocumentType('OUT')).toBe('shipment');
  });

  it('returns stable trading module boundaries', () => {
    expect(getTradingModuleBoundary('sales')).toEqual({
      module: 'sales',
      entityType: 'SO',
      initialStatus: 'draft',
      statuses: ['draft', 'confirmed', 'closed', 'cancelled'],
      commands: [
        'createSalesOrder',
        'confirmSalesOrder',
        'closeSalesOrder',
        'cancelSalesOrder',
      ],
      queries: ['getSalesOrder', 'listSalesOrders'],
    });
  });

  it('checks boundary status membership against canonical status source', () => {
    expect(isTradingBoundaryStatus('purchase', 'confirmed')).toBe(true);
    expect(isTradingBoundaryStatus('purchase', 'picking')).toBe(false);
    expect(isTradingBoundaryStatus('outbound', 'picking')).toBe(true);
    expect(isTradingBoundaryStatus('inbound', 'closed')).toBe(false);
  });

  it('keeps existing boundary exports aligned with the catalog', () => {
    expect(
      purchaseDocumentBoundary.statuses.every((status) =>
        isTradingBoundaryStatus('purchase', status),
      ),
    ).toBe(true);
    expect(
      inboundDocumentBoundary.statuses.every((status) =>
        isTradingBoundaryStatus('inbound', status),
      ),
    ).toBe(true);
    expect(
      salesDocumentBoundary.statuses.every((status) =>
        isTradingBoundaryStatus('sales', status),
      ),
    ).toBe(true);
    expect(
      outboundDocumentBoundary.statuses.every((status) =>
        isTradingBoundaryStatus('outbound', status),
      ),
    ).toBe(true);
  });
});
