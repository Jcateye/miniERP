'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildCustomerListRows,
  CUSTOMER_LIST_COLUMNS,
  CUSTOMER_PAGE_PRESENTATION,
  type CustomerListRow,
} from './customers-page';
import { CustomersPageScaffold } from './customers-page-view';
import { useCustomersPageVm } from './use-customers-page-vm';

function getCustomerTableColumns(): TableColumn[] {
  return CUSTOMER_LIST_COLUMNS.map((column) => {
    if (column.key === 'code') {
      return {
        key: column.key,
        label: column.label,
        width: 100,
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
      width: column.key === 'name' ? 180 : 120,
    } satisfies TableColumn;
  });
}

function CustomersPageContent() {
  const { error, keywordInput, loading, setKeywordInput, loadItems, visibleItems } = useCustomersPageVm();
  const rows = useMemo<CustomerListRow[]>(() => buildCustomerListRows(visibleItems), [visibleItems]);
  const columns = useMemo(() => getCustomerTableColumns(), []);

  const tableContent = loading ? (
    <div style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E8E4DD', borderRadius: 4 }}>正在加载客户列表...</div>
  ) : error ? (
    <div style={{ display: 'grid', gap: 12, padding: '24px', background: '#FFFFFF', border: '1px solid #E8E4DD', borderRadius: 4 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>客户列表加载失败</div>
      <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{error}</div>
      <div>
        <ActionButton label="重试" tone="secondary" onClick={() => void loadItems()} />
      </div>
    </div>
  ) : rows.length === 0 ? (
    <div style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E8E4DD', borderRadius: 4, fontSize: 13, color: '#666666' }}>
      暂无匹配客户。
    </div>
  ) : (
    <DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} totalPages={1} currentPage={1} totalItems={rows.length} />
  );

  return (
    <CustomersPageScaffold
      title={CUSTOMER_PAGE_PRESENTATION.title}
      summary={CUSTOMER_PAGE_PRESENTATION.summary}
      primaryActionLabel={CUSTOMER_PAGE_PRESENTATION.primaryActionLabel}
      primaryActionHref={CUSTOMER_PAGE_PRESENTATION.createHref}
      searchPlaceholder={CUSTOMER_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      table={tableContent}
    />
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersPageContent />
    </Suspense>
  );
}
