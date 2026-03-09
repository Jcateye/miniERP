'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildSalesShipmentListRows,
  SALES_SHIPMENT_LIST_COLUMNS,
  SALES_SHIPMENT_PAGE_PRESENTATION,
} from './shipments-page';
import { SalesShipmentsPageScaffold } from './shipments-page-view';
import { useShipmentsPageVm } from './use-shipments-page-vm';

function getSalesShipmentTableColumns(): TableColumn[] {
  return SALES_SHIPMENT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'shipmentNumber'
        ? 150
        : column.key === 'customerName'
          ? 140
          : column.key === 'relatedSalesOrderNumber'
            ? 120
            : column.key === 'quantity'
              ? 80
              : column.key === 'trackingNumber'
                ? 140
                : column.key === 'status'
                  ? 90
                  : 120,
    render:
      column.key === 'actions'
        ? () => <ActionButton label="查看" tone="secondary" disabled />
        : undefined,
  })) satisfies TableColumn[];
}

function SalesShipmentsPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = useShipmentsPageVm();
  const rows = useMemo(() => buildSalesShipmentListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, shipmentNumber, customerName, relatedSalesOrderNumber, quantity, trackingNumber, status, actions }) => ({
        id,
        shipmentNumber,
        customerName,
        relatedSalesOrderNumber,
        quantity,
        trackingNumber,
        status,
        actions,
      })),
    [rows],
  );
  const columns = useMemo(() => getSalesShipmentTableColumns(), []);

  return (
    <SalesShipmentsPageScaffold
      title={SALES_SHIPMENT_PAGE_PRESENTATION.title}
      summary={SALES_SHIPMENT_PAGE_PRESENTATION.summary}
      primaryActionLabel={SALES_SHIPMENT_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={SALES_SHIPMENT_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function SalesShipmentsPage() {
  return (
    <Suspense fallback={null}>
      <SalesShipmentsPageContent />
    </Suspense>
  );
}
