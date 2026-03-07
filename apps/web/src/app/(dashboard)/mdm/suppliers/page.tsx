'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildSupplierListRows,
  SUPPLIER_LIST_COLUMNS,
  SUPPLIER_PAGE_PRESENTATION,
  type SupplierListRow,
} from './suppliers-page';
import { SuppliersPageScaffold } from './suppliers-page-view';
import { useSuppliersPageVm } from './use-suppliers-page-vm';

function getSupplierTableColumns(): TableColumn[] {
  return SUPPLIER_LIST_COLUMNS.map((column) => {
    if (column.key === 'code') {
      return {
        key: column.key,
        label: column.label,
        width: 110,
        render: (value, row) => (
          <Link href={row.detailHref} style={{ color: '#C05A3C', textDecoration: 'none', fontWeight: 600 }}>
            {value}
          </Link>
        ),
      } satisfies TableColumn;
    }

    return {
      key: column.key,
      label: column.label,
      width: column.key === 'name' ? 220 : 120,
    } satisfies TableColumn;
  });
}

function SuppliersPageContent() {
  const { keywordInput, setKeywordInput, visibleItems } = useSuppliersPageVm();
  const rows = useMemo<SupplierListRow[]>(() => buildSupplierListRows(visibleItems), [visibleItems]);
  const columns = useMemo(() => getSupplierTableColumns(), []);

  return (
    <SuppliersPageScaffold
      title={SUPPLIER_PAGE_PRESENTATION.title}
      summary={SUPPLIER_PAGE_PRESENTATION.summary}
      primaryActionLabel={SUPPLIER_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={SUPPLIER_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} totalPages={1} currentPage={1} totalItems={rows.length} />}
    />
  );
}

export default function SuppliersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载供应商列表...
        </div>
      }
    >
      <SuppliersPageContent />
    </Suspense>
  );
}
