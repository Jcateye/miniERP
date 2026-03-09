import { getSeedGoodsReceiptListItems } from './use-receipts-page-vm';

describe('procure receipts page vm', () => {
  it('returns seeded goods receipt items while upstream source is pending', () => {
    expect(getSeedGoodsReceiptListItems()).toEqual([
      {
        id: 'grn_1',
        grnNumber: 'DOC-GRN-20260306-005',
        purchaseOrderNumber: 'DOC-PO-20260305-008',
        supplierName: '华为技术',
        warehouseName: '深圳总仓',
        quantityLabel: '150',
        postedAtLabel: '03-06 14:30',
        statusLabel: '已过账',
      },
      {
        id: 'grn_2',
        grnNumber: 'DOC-GRN-20260307-002',
        purchaseOrderNumber: 'DOC-PO-20260306-013',
        supplierName: '立讯精密',
        warehouseName: '苏州成品仓',
        quantityLabel: '80',
        postedAtLabel: '03-07 09:10',
        statusLabel: '草稿',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedGoodsReceiptListItems();
    const second = getSeedGoodsReceiptListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.grnNumber).toBe('DOC-GRN-20260306-005');
  });
});
