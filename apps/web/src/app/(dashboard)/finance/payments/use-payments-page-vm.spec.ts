import { getSeedPaymentListItems } from './use-payments-page-vm';

describe('payments page vm', () => {
  it('returns seeded payment items while upstream source is pending', () => {
    expect(getSeedPaymentListItems()).toEqual([
      {
        id: 'pay_1',
        code: 'DOC-PAY-20260304-012',
        supplierName: '华为技术',
        paymentDate: '2026-03-04',
        amountLabel: '¥45,200',
        methodLabel: '电汇',
        reconciledAmountLabel: '¥45,200',
        status: 'confirmed',
      },
      {
        id: 'pay_2',
        code: 'DOC-PAY-20260305-003',
        supplierName: '立讯精密',
        paymentDate: '2026-03-05',
        amountLabel: '¥12,800',
        methodLabel: '承兑汇票',
        reconciledAmountLabel: '¥4,000',
        status: 'settled',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedPaymentListItems();
    const second = getSeedPaymentListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.supplierName).toBe('华为技术');
  });
});
