'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildBudgetListRows,
  BUDGET_LIST_COLUMNS,
  BUDGET_PAGE_PRESENTATION,
  type BudgetListRow,
} from './budgets-page';
import { BudgetsPageScaffold } from './budgets-page-view';
import { useBudgetsPageVm } from './use-budgets-page-vm';

function getBudgetTableColumns(): TableColumn[] {
  return BUDGET_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 120
        : column.key === 'name'
          ? 140
          : column.key === 'period'
            ? 100
            : column.key === 'budgetAmount'
              ? 100
              : column.key === 'usedAmount'
                ? 80
                : column.key === 'remainingAmount'
                  ? 80
                  : undefined,
  })) satisfies TableColumn[];
}

function BudgetsPageContent() {
  const { items } = useBudgetsPageVm();
  const rows = useMemo<BudgetListRow[]>(() => buildBudgetListRows(items), [items]);
  const columns = useMemo(() => getBudgetTableColumns(), []);

  return (
    <BudgetsPageScaffold
      title={BUDGET_PAGE_PRESENTATION.title}
      summary={BUDGET_PAGE_PRESENTATION.summary}
      primaryActionLabel={BUDGET_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function FinanceBudgetsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载预算列表...
        </div>
      }
    >
      <BudgetsPageContent />
    </Suspense>
  );
}
