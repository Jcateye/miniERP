'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildEndpointListRows,
  ENDPOINT_LIST_COLUMNS,
  ENDPOINT_PAGE_PRESENTATION,
  type EndpointListRow,
} from './endpoints-page';
import { EndpointsPageScaffold } from './endpoints-page-view';
import { useEndpointsPageVm } from './use-endpoints-page-vm';

function getEndpointTableColumns(): TableColumn[] {
  return ENDPOINT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'name'
        ? 140
        : column.key === 'type'
          ? 80
          : column.key === 'url'
            ? 200
            : column.key === 'status'
              ? 80
              : undefined,
  })) satisfies TableColumn[];
}

function IntegrationEndpointsPageContent() {
  const { items } = useEndpointsPageVm();
  const rows = useMemo<EndpointListRow[]>(() => buildEndpointListRows(items), [items]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, name, type, url, status, lastSynced }) => ({
        id,
        name,
        type,
        url,
        status,
        lastSynced,
      })),
    [rows],
  );
  const columns = useMemo(() => getEndpointTableColumns(), []);

  return (
    <EndpointsPageScaffold
      title={ENDPOINT_PAGE_PRESENTATION.title}
      summary={ENDPOINT_PAGE_PRESENTATION.summary}
      primaryActionLabel={ENDPOINT_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function IntegrationEndpointsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载集成端点列表...
        </div>
      }
    >
      <IntegrationEndpointsPageContent />
    </Suspense>
  );
}
