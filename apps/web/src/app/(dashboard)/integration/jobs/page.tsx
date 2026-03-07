'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildIntegrationJobListRows,
  INTEGRATION_JOB_LIST_COLUMNS,
  INTEGRATION_JOB_PAGE_PRESENTATION,
  type IntegrationJobListRow,
} from './jobs-page';
import { IntegrationJobsPageScaffold } from './jobs-page-view';
import { useIntegrationJobsPageVm } from './use-jobs-page-vm';

function getIntegrationJobTableColumns(): TableColumn[] {
  return INTEGRATION_JOB_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'name'
        ? 180
        : column.key === 'endpoint'
          ? 140
          : column.key === 'schedule'
            ? 160
            : column.key === 'lastRun'
              ? 120
              : column.key === 'nextRun'
                ? 120
                : 90,
  })) satisfies TableColumn[];
}

function IntegrationJobsPageContent() {
  const { items } = useIntegrationJobsPageVm();
  const rows = useMemo<IntegrationJobListRow[]>(() => buildIntegrationJobListRows(items), [items]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, name, endpoint, schedule, lastRun, nextRun, status }) => ({
        id,
        name,
        endpoint,
        schedule,
        lastRun,
        nextRun,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getIntegrationJobTableColumns(), []);

  return (
    <IntegrationJobsPageScaffold
      title={INTEGRATION_JOB_PAGE_PRESENTATION.title}
      summary={INTEGRATION_JOB_PAGE_PRESENTATION.summary}
      primaryActionLabel={INTEGRATION_JOB_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function IntegrationJobsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载集成任务列表...
        </div>
      }
    >
      <IntegrationJobsPageContent />
    </Suspense>
  );
}
