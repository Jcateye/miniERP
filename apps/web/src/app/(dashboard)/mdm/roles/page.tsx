'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildRoleListRows,
  ROLE_LIST_COLUMNS,
  ROLE_PAGE_PRESENTATION,
  type RoleListRow,
} from './roles-page';
import { RolesPageScaffold } from './roles-page-view';
import { useRolesPageVm } from './use-roles-page-vm';

function getRoleTableColumns(): TableColumn[] {
  return ROLE_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'name'
        ? 160
        : column.key === 'description'
          ? 220
          : column.key === 'permissionCount'
            ? 100
            : column.key === 'userCount'
              ? 100
              : 80,
  })) satisfies TableColumn[];
}

function RolesPageContent() {
  const { items } = useRolesPageVm();
  const rows = useMemo<RoleListRow[]>(() => buildRoleListRows(items), [items]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, name, description, permissionCount, userCount, status }) => ({
        id,
        name,
        description,
        permissionCount,
        userCount,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getRoleTableColumns(), []);

  return (
    <RolesPageScaffold
      title={ROLE_PAGE_PRESENTATION.title}
      summary={ROLE_PAGE_PRESENTATION.summary}
      primaryActionLabel={ROLE_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载角色列表...
        </div>
      }
    >
      <RolesPageContent />
    </Suspense>
  );
}
