'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildGlAccountListRows,
  GL_ACCOUNT_LIST_COLUMNS,
  GL_ACCOUNT_PAGE_PRESENTATION,
  type GlAccountListRow,
} from './gl-accounts-page';
import { GlAccountsPageScaffold } from './gl-accounts-page-view';
import { useGlAccountsPageVm } from './use-gl-accounts-page-vm';

function getGlAccountTableColumns(): TableColumn[] {
  return GL_ACCOUNT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 120
        : column.key === 'name'
          ? 160
          : column.key === 'category'
            ? 100
            : column.key === 'currencyControlled'
              ? 80
              : column.key === 'parentAccount'
                ? 140
                : undefined,
  })) satisfies TableColumn[];
}

function GlAccountsPageContent() {
  const { items } = useGlAccountsPageVm();
  const rows = useMemo<GlAccountListRow[]>(() => buildGlAccountListRows(items), [items]);
  const columns = useMemo(() => getGlAccountTableColumns(), []);

  return (
    <GlAccountsPageScaffold
      title={GL_ACCOUNT_PAGE_PRESENTATION.title}
      summary={GL_ACCOUNT_PAGE_PRESENTATION.summary}
      primaryActionLabel={GL_ACCOUNT_PAGE_PRESENTATION.primaryActionLabel}
      seedNotice={GL_ACCOUNT_PAGE_PRESENTATION.seedNotice}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function FinanceGlAccountsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载科目表...
        </div>
      }
    >
      <GlAccountsPageContent />
    </Suspense>
  );
}
