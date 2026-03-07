import { getSeedBudgetListItems } from './use-budgets-page-vm';

describe('budgets page vm', () => {
  it('returns seeded budget items while upstream source is pending', () => {
    expect(getSeedBudgetListItems()).toEqual([
      {
        id: 'bdg_2026_q1',
        code: 'BDG-2026-Q1',
        name: '采购部Q1预算',
        periodLabel: '2026-Q1',
        budgetAmountLabel: '¥500K',
        usedAmountLabel: '¥320K',
        remainingAmountLabel: '¥180K',
        statusLabel: '执行中',
      },
      {
        id: 'bdg_2026_q2',
        code: 'BDG-2026-Q2',
        name: '市场部Q2预算',
        periodLabel: '2026-Q2',
        budgetAmountLabel: '¥300K',
        usedAmountLabel: '¥120K',
        remainingAmountLabel: '¥180K',
        statusLabel: '草稿',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedBudgetListItems();
    const second = getSeedBudgetListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('采购部Q1预算');
  });
});
