'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildOrganizationListRows,
  ORGANIZATION_LIST_COLUMNS,
  ORGANIZATION_PAGE_PRESENTATION,
  type OrganizationListRow,
} from './organizations-page';
import { OrganizationsPageScaffold } from './organizations-page-view';
import { useOrganizationsPageVm } from './use-organizations-page-vm';

function getOrganizationTableColumns(): TableColumn[] {
  return ORGANIZATION_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 100
        : column.key === 'name'
          ? 160
          : column.key === 'type'
            ? 100
            : column.key === 'parentName'
              ? 160
              : undefined,
  })) satisfies TableColumn[];
}

function OrganizationsPageContent() {
  const { items } = useOrganizationsPageVm();
  const rows = useMemo<OrganizationListRow[]>(() => buildOrganizationListRows(items), [items]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, code, name, type, parentName, status }) => ({
        id,
        code,
        name,
        type,
        parentName,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getOrganizationTableColumns(), []);

  return (
    <OrganizationsPageScaffold
      title={ORGANIZATION_PAGE_PRESENTATION.title}
      summary={ORGANIZATION_PAGE_PRESENTATION.summary}
      primaryActionLabel={ORGANIZATION_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function OrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载组织列表...
        </div>
      }
    >
      <OrganizationsPageContent />
    </Suspense>
  );
}
