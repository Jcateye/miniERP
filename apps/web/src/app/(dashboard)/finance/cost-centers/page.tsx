'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildCostCenterListRows,
  COST_CENTER_LIST_COLUMNS,
  COST_CENTER_PAGE_PRESENTATION,
  type CostCenterListRow,
} from './cost-centers-page';
import { CostCentersPageScaffold } from './cost-centers-page-view';
import { useCostCentersPageVm } from './use-cost-centers-page-vm';

function getCostCenterTableColumns(): TableColumn[] {
  return COST_CENTER_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 120
        : column.key === 'name'
          ? 200
          : column.key === 'ownerName'
            ? 140
            : undefined,
  })) satisfies TableColumn[];
}

function CostCentersPageContent() {
  const { items } = useCostCentersPageVm();
  const rows = useMemo<CostCenterListRow[]>(() => buildCostCenterListRows(items), [items]);
  const columns = useMemo(() => getCostCenterTableColumns(), []);

  return (
    <CostCentersPageScaffold
      title={COST_CENTER_PAGE_PRESENTATION.title}
      summary={COST_CENTER_PAGE_PRESENTATION.summary}
      primaryActionLabel={COST_CENTER_PAGE_PRESENTATION.primaryActionLabel}
      seedNotice={COST_CENTER_PAGE_PRESENTATION.seedNotice}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function FinanceCostCentersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载成本中心列表...
        </div>
      }
    >
      <CostCentersPageContent />
    </Suspense>
  );
}
