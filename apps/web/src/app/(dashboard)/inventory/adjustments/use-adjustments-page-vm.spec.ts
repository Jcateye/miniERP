import { getSeedAdjustmentListItems } from './use-adjustments-page-vm';

describe('inventory adjustments page vm', () => {
  it('returns seeded adjustment items while upstream source is pending', () => {
    expect(getSeedAdjustmentListItems()).toEqual([
      {
        id: 'adj_1',
        documentNumber: 'DOC-ADJ-20260306-002',
        warehouseName: '深圳总仓',
        dateLabel: '2026-03-06',
        lineCountLabel: '3',
        quantityLabel: '-4',
        reasonLabel: '盘点差异调整',
        statusLabel: '已过账',
      },
      {
        id: 'adj_2',
        documentNumber: 'DOC-ADJ-20260307-001',
        warehouseName: '苏州成品仓',
        dateLabel: '2026-03-07',
        lineCountLabel: '2',
        quantityLabel: '+6',
        reasonLabel: '库位纠偏',
        statusLabel: '草稿',
      },
    ]);
  });

  it('uses document numbers that satisfy the ERP invariant format', () => {
    expect(getSeedAdjustmentListItems().map((item) => item.documentNumber)).toEqual([
      'DOC-ADJ-20260306-002',
      'DOC-ADJ-20260307-001',
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedAdjustmentListItems();
    const second = getSeedAdjustmentListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.documentNumber).toBe('DOC-ADJ-20260306-002');
  });
});
