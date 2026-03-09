import { getSeedInvoiceListItems } from './use-invoices-page-vm';

describe('invoices page vm', () => {
  it('returns seeded invoice items while upstream source is pending', () => {
    expect(getSeedInvoiceListItems()).toEqual([
      {
        id: 'inv_1',
        code: 'DOC-INV-20260306-003',
        counterpartyName: '华为技术',
        issuedDate: '2026-03-06',
        amountLabel: '¥45,200',
        outstandingAmountLabel: '¥12,000',
        categoryLabel: '增值税专票',
        status: 'issued',
      },
      {
        id: 'inv_2',
        code: 'DOC-INV-20260307-001',
        counterpartyName: '立讯精密',
        issuedDate: '2026-03-07',
        amountLabel: '¥18,960',
        outstandingAmountLabel: '¥18,960',
        categoryLabel: '电子发票',
        status: 'draft',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedInvoiceListItems();
    const second = getSeedInvoiceListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.code).toBe('DOC-INV-20260306-003');
  });
});
