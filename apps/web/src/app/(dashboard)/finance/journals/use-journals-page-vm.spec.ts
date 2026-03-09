import { getSeedJournalListItems } from './use-journals-page-vm';

describe('journals page vm', () => {
  it('returns seeded journal items while upstream source is pending', () => {
    expect(getSeedJournalListItems()).toEqual([
      {
        id: 'je_1',
        code: 'DOC-JE-20260307-004',
        journalDate: '2026-03-07',
        summaryLabel: '采购收货暂估入账',
        ledgerName: '总账账簿',
        debitAmountLabel: '¥45,200',
        creditAmountLabel: '¥45,200',
        status: 'posted',
      },
      {
        id: 'je_2',
        code: 'DOC-JE-20260308-001',
        journalDate: '2026-03-08',
        summaryLabel: '销售收款确认',
        ledgerName: '总账账簿',
        debitAmountLabel: '¥18,960',
        creditAmountLabel: '¥18,960',
        status: 'draft',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedJournalListItems();
    const second = getSeedJournalListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.code).toBe('DOC-JE-20260307-004');
  });
});
