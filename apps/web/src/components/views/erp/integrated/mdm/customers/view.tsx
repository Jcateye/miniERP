'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, User } from 'lucide-react';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  CustomerForm,
  type CustomerFormData,
} from '@/components/views/erp/integrated/mdm/customers/customer-form';
import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useCustomerList } from '@/lib/hooks/use-customer-list';

import type { Customer } from '@minierp/shared';

const DEFAULT_PARAMS = {
  order: 'asc',
  page: '1',
  q: '',
  sort: 'id',
};

type CustomerSortField = 'contact' | 'credit' | 'id' | 'name' | 'status';

type CustomerRow = {
  address: string;
  code: string;
  contact: string;
  credit: string;
  email: string;
  id: string;
  name: string;
  phone: string;
  status: Customer['status'];
  statusLabel: string;
};

type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

type CustomerDetailPayload = {
  address?: string | null;
  code?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  creditLimit?: string | null;
  email?: string | null;
  name?: string | null;
};

function isCustomerDetailPayload(value: unknown): value is CustomerDetailPayload {
  return typeof value === 'object' && value !== null;
}

export default function CustomersPage() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useCustomerList();
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRow | null>(null);
  const [editInitialData, setEditInitialData] = React.useState<CustomerFormData | undefined>(
    undefined,
  );

  const pageRows = React.useMemo<CustomerRow[]>(
    () =>
      data.map((item) => ({
        address: item.address ?? '',
        code: item.code,
        contact: item.contactName ?? '-',
        credit: item.creditLimit ?? '',
        email: item.email ?? '-',
        id: item.id,
        name: item.name,
        phone: item.phone ?? '-',
        status: item.status,
        statusLabel: getStatusLabel(item.status),
      })),
    [data],
  );

  const showNotice = React.useCallback((message: string, tone: Notice['tone']) => {
    setNotice({
      id: Date.now(),
      message,
      tone,
    });
  }, []);

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  React.useEffect(() => {
    if (loading) {
      return;
    }

    const rawPage = parsePageParam(params.page);
    if (pagination.page !== rawPage) {
      updateParams({ page: String(pagination.page) }, { replace: true });
    }
  }, [loading, pagination.page, params.page, updateParams]);

  React.useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice((current) => (current?.id === notice.id ? null : current));
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  React.useEffect(() => {
    if (!editDialogOpen || !selectedCustomer) {
      return undefined;
    }

    let disposed = false;
    setEditInitialData(toCustomerFormData(selectedCustomer));

    void (async () => {
      const detail = await fetchCustomerDetail(selectedCustomer.id);
      if (!detail || disposed) {
        return;
      }

      setEditInitialData(toCustomerFormDataFromDetail(detail, selectedCustomer));
    })();

    return () => {
      disposed = true;
    };
  }, [editDialogOpen, selectedCustomer]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: CustomerSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'asc';

    updateParams({ order: nextOrder, sort: field });
  };

  const handleCreate = async (formData: CustomerFormData) => {
    const response = await requestCustomerMutation('/api/bff/customers', {
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response, '新增失败');
      showNotice(message, 'error');
      throw new Error(message);
    }

    setCreateDialogOpen(false);
    reload();
    showNotice('新增成功', 'success');
  };

  const handleUpdate = async (formData: CustomerFormData) => {
    if (!selectedCustomer) {
      throw new Error('未选择要编辑的客户');
    }

    const response = await requestCustomerMutation(
      `/api/bff/customers/${selectedCustomer.id}`,
      {
        body: JSON.stringify({
          address: formData.address?.trim() || null,
          contactPerson: formData.contact?.trim() || null,
          contactPhone: formData.phone?.trim() || null,
          email: formData.email?.trim() || null,
          name: formData.name.trim(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response, '更新失败');
      showNotice(message, 'error');
      throw new Error(message);
    }

    setEditDialogOpen(false);
    reload();
    showNotice('更新成功', 'success');
  };

  const handleDelete = async () => {
    if (!selectedCustomer) {
      showNotice('未选择要删除的客户', 'error');
      return;
    }

    setDeleteLoading(true);
    const response = await requestCustomerMutation(
      `/api/bff/customers/${selectedCustomer.id}`,
      {
        method: 'DELETE',
      },
    );
    setDeleteLoading(false);

    if (!response.ok) {
      const message = await extractErrorMessage(response, '删除失败');
      showNotice(message, 'error');
      return;
    }

    setDeleteDialogOpen(false);
    reload();
    showNotice('删除成功', 'success');
  };

  const totalPages = Math.max(1, pagination.totalPages);
  const pageNumbers = buildPagination(pagination.page, totalPages);
  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = pagination.total === 0 ? 0 : rangeStart + pageRows.length - 1;

  return (
    <>
      <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">客户管理</h1>
            <p className="mt-1 text-sm text-muted">Customers - 客户关系维护</p>
          </div>
          <button
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            onClick={() => setCreateDialogOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            新增客户
          </button>
        </div>

        {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}

        <form className="rounded-sm border border-border bg-white p-2" onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full bg-transparent pl-10 pr-24 text-sm outline-none"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="搜索客户名称、联系人、编号..."
              type="text"
              value={draftQuery}
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {params.q ? (
                <button
                  className="text-xs text-muted hover:text-foreground"
                  onClick={() => {
                    setDraftQuery('');
                    updateParams({ page: '1', q: '' });
                  }}
                  type="button"
                >
                  清除
                </button>
              ) : null}
              <button className="h-8 rounded-sm bg-primary px-3 text-xs font-medium text-white" type="submit">
                搜索
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between text-xs text-muted">
          <span>共 {pagination.total} 位客户</span>
          <span>
            排序: {getSortLabel(params.sort as CustomerSortField)} /{' '}
            {params.order === 'desc' ? '降序' : '升序'}
          </span>
        </div>

        <div className="overflow-hidden rounded-sm border border-border bg-white text-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  <SortButton
                    active={params.sort === 'id'}
                    direction={params.order}
                    label="编号"
                    onClick={() => handleSort('id')}
                  />
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  <SortButton
                    active={params.sort === 'name'}
                    direction={params.order}
                    label="客户名称"
                    onClick={() => handleSort('name')}
                  />
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  <SortButton
                    active={params.sort === 'contact'}
                    direction={params.order}
                    label="联系人"
                    onClick={() => handleSort('contact')}
                  />
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  电话
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">
                  <SortButton
                    active={params.sort === 'credit'}
                    direction={params.order}
                    label="信用额度"
                    onClick={() => handleSort('credit')}
                  />
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">
                  <SortButton
                    active={params.sort === 'status'}
                    direction={params.order}
                    label="状态"
                    onClick={() => handleSort('status')}
                  />
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-muted" colSpan={7}>
                    加载中...
                  </td>
                </tr>
              ) : null}
              {!loading && error ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-red-600" colSpan={7}>
                    错误: {error.message}
                  </td>
                </tr>
              ) : null}
              {!loading && !error
                ? pageRows.map((item) => (
                    <tr key={item.id} className="group transition-colors hover:bg-background/50">
                      <td className="px-4 py-4 font-mono font-bold italic text-primary">{item.code}</td>
                      <td className="px-4 py-4 font-bold text-foreground">{item.name}</td>
                      <td className="px-4 py-4 text-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted" />
                          {item.contact}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-muted">{item.phone}</td>
                      <td className="px-4 py-4 text-right font-bold font-mono text-foreground">
                        {formatCurrency(item.credit)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={getStatusClassName(item.status)}>{item.statusLabel}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex h-8 items-center gap-1 border border-border bg-white px-3 text-xs font-medium transition-colors hover:bg-gray-50"
                            onClick={() => {
                              setSelectedCustomer(item);
                              setEditInitialData(toCustomerFormData(item));
                              setEditDialogOpen(true);
                            }}
                            type="button"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            编辑
                          </button>
                          <button
                            className="inline-flex h-8 items-center gap-1 border border-[#E7B9B9] bg-white px-3 text-xs font-medium text-[#B54A4A] transition-colors hover:bg-[#FFF5F5]"
                            onClick={() => {
                              setSelectedCustomer(item);
                              setDeleteDialogOpen(true);
                            }}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && !error && pageRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-muted" colSpan={7}>
                    没有匹配的客户记录。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted">
              显示 {rangeStart}-{rangeEnd} / 共 {pagination.total} 条
            </span>
            <div className="flex items-center gap-1">
              <button
                className="border border-border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pagination.page === 1 || loading}
                onClick={() => updateParams({ page: String(pagination.page - 1) })}
                type="button"
              >
                上一页
              </button>
              {pageNumbers.map((page) => (
                <button
                  className={`border px-3 py-1 text-xs ${
                    page === pagination.page
                      ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                      : 'border-border bg-white'
                  }`}
                  key={page}
                  onClick={() => updateParams({ page: String(page) })}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                className="border border-border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pagination.page === totalPages || loading}
                onClick={() => updateParams({ page: String(pagination.page + 1) })}
                type="button"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      <CustomerForm
        mode="create"
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        open={createDialogOpen}
      />

      <CustomerForm
        initialData={editInitialData}
        mode="edit"
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditInitialData(undefined);
          }
        }}
        onSubmit={handleUpdate}
        open={editDialogOpen}
      />

      <DeleteConfirmDialog
        description={
          selectedCustomer
            ? `将删除客户「${selectedCustomer.code} / ${selectedCustomer.name}」，此操作无法撤销。`
            : '此操作无法撤销。'
        }
        loading={deleteLoading}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title="确认删除客户"
      />
    </>
  );
}

function toCustomerFormData(row: CustomerRow): CustomerFormData {
  return {
    address: row.address,
    code: row.code,
    contact: row.contact === '-' ? '' : row.contact,
    credit: row.credit,
    email: row.email === '-' ? '' : row.email,
    name: row.name,
    phone: row.phone === '-' ? '' : row.phone,
  };
}

function toCustomerFormDataFromDetail(
  detail: CustomerDetailPayload,
  fallbackRow: CustomerRow,
): CustomerFormData {
  return {
    address: detail.address ?? fallbackRow.address,
    code: detail.code ?? fallbackRow.code,
    contact: detail.contactPerson ?? (fallbackRow.contact === '-' ? '' : fallbackRow.contact),
    credit: detail.creditLimit ?? fallbackRow.credit,
    email: detail.email ?? (fallbackRow.email === '-' ? '' : fallbackRow.email),
    name: detail.name ?? fallbackRow.name,
    phone: detail.contactPhone ?? (fallbackRow.phone === '-' ? '' : fallbackRow.phone),
  };
}

function getSortLabel(field: CustomerSortField) {
  switch (field) {
    case 'contact':
      return '联系人';
    case 'credit':
      return '信用额度';
    case 'name':
      return '客户名称';
    case 'status':
      return '状态';
    default:
      return '编号';
  }
}

function getStatusClassName(status: Customer['status']) {
  if (status === 'disabled') {
    return 'rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-gray-500';
  }

  if (status === 'warning') {
    return 'rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-amber-700';
  }

  return 'rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-emerald-700';
}

function getStatusLabel(status: Customer['status']) {
  switch (status) {
    case 'disabled':
      return '停用';
    case 'warning':
      return '预警';
    default:
      return '正常';
  }
}

function formatCurrency(value: string) {
  const amount = Number(value || '0');
  return `¥ ${amount.toLocaleString('zh-CN')}`;
}

function InlineNotice({ message, tone }: { message: string; tone: Notice['tone'] }) {
  return (
    <div
      className={`rounded-sm border px-4 py-3 text-sm ${
        tone === 'success'
          ? 'border-[#B6D7BD] bg-[#F2FBF4] text-[#2E7D32]'
          : 'border-[#E7B9B9] bg-[#FFF5F5] text-[#B54A4A]'
      }`}
    >
      {message}
    </div>
  );
}

function SortButton({
  active,
  direction,
  label,
  onClick,
}: {
  active: boolean;
  direction: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={onClick} type="button">
      <span>{label}</span>
      {active ? (
        direction === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
      ) : null}
    </button>
  );
}

async function requestCustomerMutation(input: RequestInfo | URL, init: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          message: '网络请求失败，请稍后重试',
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 503,
      },
    );
  }
}

async function extractErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };

    return payload.error?.message || payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function fetchCustomerDetail(id: string): Promise<CustomerDetailPayload | null> {
  try {
    const response = await fetch(`/api/bff/customers/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as
      | CustomerDetailPayload
      | { data?: CustomerDetailPayload };

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data ?? null;
    }

    return isCustomerDetailPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}
