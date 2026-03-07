import { renderToStaticMarkup } from 'react-dom/server';

import FinanceBudgetsPage from './page';
import {
  buildBudgetListRows,
  BUDGET_LIST_COLUMNS,
  BUDGET_PAGE_PRESENTATION,
  type BudgetListItem,
} from './budgets-page';
import { BudgetsPageScaffold } from './budgets-page-view';

describe('budgets page contract', () => {
  it('uses budget-specific T2 page presentation', () => {
    expect(BUDGET_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '预算管理',
      summary: 'Budgets · 预算编制与控制',
      primaryActionLabel: '新建预算',
      detailHrefBase: '/finance/budgets',
    });
  });

  it('uses design-aligned budget table columns', () => {
    expect(BUDGET_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '编号',
      '预算名称',
      '期间',
      '预算金额',
      '已使用',
      '剩余',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped budget rows', () => {
    const rows = buildBudgetListRows([
      {
        id: 'bdg_2026_q1',
        code: 'BDG-2026-Q1',
        name: '采购部Q1预算',
        periodLabel: '2026-Q1',
        budgetAmountLabel: '¥500K',
        usedAmountLabel: '¥320K',
        remainingAmountLabel: '¥180K',
        statusLabel: '执行中',
      } satisfies BudgetListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'bdg_2026_q1',
        code: 'BDG-2026-Q1',
        name: '采购部Q1预算',
        period: '2026-Q1',
        budgetAmount: '¥500K',
        usedAmount: '¥320K',
        remainingAmount: '¥180K',
        status: '执行中',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildBudgetListRows([
      {
        id: 'bdg_2026_q2',
        code: 'BDG-2026-Q2',
        name: '营销部Q2预算',
        periodLabel: null,
        budgetAmountLabel: null,
        usedAmountLabel: null,
        remainingAmountLabel: null,
        statusLabel: null,
      } satisfies BudgetListItem,
    ]);

    expect(rows[0]).toMatchObject({
      period: '—',
      budgetAmount: '—',
      usedAmount: '—',
      remainingAmount: '—',
      status: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildBudgetListRows([
      {
        id: 'budget/with-slash',
        code: 'BDG-SLASH',
        name: '测试预算',
        periodLabel: '2026-Q3',
        budgetAmountLabel: '¥100K',
        usedAmountLabel: '¥50K',
        remainingAmountLabel: '¥50K',
        statusLabel: '草稿',
      } satisfies BudgetListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the budgets page', () => {
    const markup = renderToStaticMarkup(
      <BudgetsPageScaffold
        title={BUDGET_PAGE_PRESENTATION.title}
        summary={BUDGET_PAGE_PRESENTATION.summary}
        primaryActionLabel={BUDGET_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="budgets-topbar"');
    expect(markup).toContain('data-testid="budgets-table"');
    expect(markup).not.toContain('data-testid="budgets-seed-notice"');
    expect(markup).not.toContain('data-testid="budgets-search"');
    expect(markup).not.toContain('data-testid="budgets-filter-chips"');
    expect(markup).toContain('预算管理');
    expect(markup).toContain('Budgets · 预算编制与控制');
    expect(markup).toContain('新建预算');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<FinanceBudgetsPage />);

    expect(markup).toContain('预算管理');
    expect(markup).toContain('Budgets · 预算编制与控制');
    expect(markup).toContain('编号');
    expect(markup).toContain('预算名称');
    expect(markup).toContain('期间');
    expect(markup).toContain('预算金额');
    expect(markup).toContain('已使用');
    expect(markup).toContain('剩余');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建预算');
    expect(markup).toContain('disabled');
    expect(markup).toContain('BDG-2026-Q1');
    expect(markup).toContain('采购部Q1预算');
    expect(markup).toContain('2026-Q1');
    expect(markup).toContain('¥500K');
    expect(markup).toContain('¥320K');
    expect(markup).toContain('¥180K');
    expect(markup).toContain('执行中');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
  });
});
