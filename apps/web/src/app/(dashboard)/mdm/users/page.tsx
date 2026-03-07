'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildUserListRows,
  USER_LIST_COLUMNS,
  USER_PAGE_PRESENTATION,
  type UserListRow,
} from './users-page';
import { UsersPageScaffold } from './users-page-view';
import { useUsersPageVm } from './use-users-page-vm';

function getUserTableColumns(): TableColumn[] {
  return USER_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'username'
        ? 120
        : column.key === 'name'
          ? 100
          : column.key === 'role'
            ? 100
            : column.key === 'department'
              ? 120
              : column.key === 'lastLogin'
                ? 120
                : 80,
  })) satisfies TableColumn[];
}

function UsersPageContent() {
  const { items } = useUsersPageVm();
  const rows = useMemo<UserListRow[]>(() => buildUserListRows(items), [items]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, username, name, role, department, lastLogin, status }) => ({
        id,
        username,
        name,
        role,
        department,
        lastLogin,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getUserTableColumns(), []);

  return (
    <UsersPageScaffold
      title={USER_PAGE_PRESENTATION.title}
      summary={USER_PAGE_PRESENTATION.summary}
      primaryActionLabel={USER_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载用户列表...
        </div>
      }
    >
      <UsersPageContent />
    </Suspense>
  );
}
