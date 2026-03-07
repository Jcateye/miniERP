'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildGoodsReceiptListRows,
  GOODS_RECEIPT_LIST_COLUMNS,
  GOODS_RECEIPT_PAGE_PRESENTATION,
  type GoodsReceiptListRow,
} from './receipts-page';
import { ProcureReceiptsPageScaffold } from './receipts-page-view';
import { useReceiptsPageVm } from './use-receipts-page-vm';

function getGoodsReceiptTableColumns(): TableColumn[] {
  return GOODS_RECEIPT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'grnNumber'
        ? 150
        : column.key === 'purchaseOrderNumber'
          ? 140
          : column.key === 'supplierName'
            ? 120
            : column.key === 'warehouseName'
              ? 120
              : column.key === 'quantity'
                ? 80
                : column.key === 'postedAt'
                  ? 100
                  : undefined,
  })) satisfies TableColumn[];
}

function ProcureReceiptsPageContent() {
  const { keywordInput, setKeywordInput, visibleItems } = useReceiptsPageVm();
  const rows = useMemo<GoodsReceiptListRow[]>(() => buildGoodsReceiptListRows(visibleItems), [visibleItems]);
  const columns = useMemo(() => getGoodsReceiptTableColumns(), []);

  return (
    <ProcureReceiptsPageScaffold
      title={GOODS_RECEIPT_PAGE_PRESENTATION.title}
      summary={GOODS_RECEIPT_PAGE_PRESENTATION.summary}
      primaryActionLabel={GOODS_RECEIPT_PAGE_PRESENTATION.primaryActionLabel}
      primaryActionHref="/procure/receipts/new"
      searchPlaceholder={GOODS_RECEIPT_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function ProcureReceiptsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载收货单列表...
        </div>
      }
    >
      <ProcureReceiptsPageContent />
    </Suspense>
  );
}
