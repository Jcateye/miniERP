'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildQuotationListRows,
  QUOTATION_LIST_COLUMNS,
  QUOTATION_PAGE_PRESENTATION,
} from './quotations-page';
import { SalesQuotationsPageScaffold } from './quotations-page-view';
import { useQuotationsPageVm } from './use-quotations-page-vm';

function getQuotationTableColumns(): TableColumn[] {
  return QUOTATION_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'quoteNumber'
        ? 150
        : column.key === 'customerName'
          ? 140
          : column.key === 'createdAt'
            ? 110
            : column.key === 'validUntil'
              ? 110
              : column.key === 'amount'
                ? 100
                : column.key === 'version'
                  ? 80
                  : 100,
  })) satisfies TableColumn[];
}

function SalesQuotationsPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = useQuotationsPageVm();
  const rows = useMemo(() => buildQuotationListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, quoteNumber, customerName, createdAt, validUntil, amount, version, status }) => ({
        id,
        quoteNumber,
        customerName,
        createdAt,
        validUntil,
        amount,
        version,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getQuotationTableColumns(), []);

  return (
    <SalesQuotationsPageScaffold
      title={QUOTATION_PAGE_PRESENTATION.title}
      summary={QUOTATION_PAGE_PRESENTATION.summary}
      primaryActionLabel={QUOTATION_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={QUOTATION_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function SalesQuotationsPage() {
  return (
    <Suspense fallback={null}>
      <SalesQuotationsPageContent />
    </Suspense>
  );
}
