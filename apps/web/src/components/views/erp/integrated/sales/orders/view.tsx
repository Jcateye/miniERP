'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  SalesOrderForm,
  type SalesOrderFormData,
} from '@/components/views/erp/integrated/sales/orders/order-form';
import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useSalesOrders } from '@/lib/hooks/use-sales-orders';
import type { SalesOrderListItem } from '@/lib/mocks/erp-list-fixtures';

const DEFAULT_PARAMS = {
  order: 'desc',
  page: '1',
  q: '',
  sort: 'date',
  status: '',
};

type SalesOrderSortField = 'amount' | 'customer' | 'date' | 'skuCount' | 'so';
type SalesOrderRow = SalesOrderListItem & { id: string };
type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

export default function SoList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useSalesOrders();
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<SalesOrderRow | null>(null);

  const pageRows = React.useMemo<SalesOrderRow[]>(
    () => data.map((row) => ({ ...row, id: row.so })),
    [data],
  );

  const showNotice = React.useCallback((message: string, tone: Notice['tone']) => {
    setNotice({ id: Date.now(), message, tone });
  }, []);

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  React.useEffect(() => {
    if (loading) {
      return;
    }

    const rawPage = parsePageParam(params.page);
    if (rawPage !== pagination.page) {
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

  const currentPage = pagination.page;
  const totalPages = Math.max(1, pagination.totalPages);
  const pageNumbers = buildPagination(currentPage, totalPages);
  const rangeStart = pagination.total === 0 ? 0 : (currentPage - 1) * pagination.pageSize + 1;
  const rangeEnd = pagination.total === 0 ? 0 : rangeStart + data.length - 1;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: SalesOrderSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'desc';

    updateParams({ order: nextOrder, sort: field });
  };

  const handleCreate = async (formData: SalesOrderFormData) => {
    const response = await requestSalesOrderMutation('/api/bff/sales/orders', {
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

  const handleUpdate = async (formData: SalesOrderFormData) => {
    if (!selectedRow) {
      throw new Error('未选择要编辑的销售订单');
    }

    const response = await requestSalesOrderMutation(
      `/api/bff/sales/orders/${encodeURIComponent(selectedRow.id)}`,
      {
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
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
    if (!selectedRow) {
      showNotice('未选择要删除的销售订单', 'error');
      return;
    }

    setDeleteLoading(true);
    const response = await requestSalesOrderMutation(
      `/api/bff/sales/orders/${encodeURIComponent(selectedRow.id)}`,
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

  return (
    <>
      <div className="relative flex h-full w-full flex-col gap-6 overflow-y-auto p-8 pb-20 sm:p-10">
        <div className="flex w-full items-start justify-between">
          <div>
            <h1 className="font-['var(--font-space-grotesk)'] text-2xl font-bold">销售订单管理</h1>
            <p className="mt-1 text-sm text-muted">销售订单、发运工作台</p>
          </div>

          <div className="flex gap-2">
            <button className="flex h-9 items-center justify-center border border-border bg-white px-4 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50">
              导出
            </button>
            <button
              className="flex h-9 items-center justify-center gap-2 bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-opacity-90"
              onClick={() => setCreateDialogOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              新建销售订单
            </button>
          </div>
        </div>

        {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}

        <form className="w-full border border-border bg-white p-2" onSubmit={handleSearchSubmit}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full bg-transparent pl-10 pr-24 text-sm font-['var(--font-space-grotesk)'] outline-none placeholder:text-muted"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="搜索 SO 编号、客户、物料..."
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

        <div className="mt-2 flex w-full items-center justify-between">
          <div className="flex flex-wrap gap-2 text-sm">
            <FilterButton active={!params.status} label="全部" onClick={() => updateParams({ page: '1', status: '' })} />
            {['待发货', '已发货', '草稿'].map((status) => (
              <FilterButton
                active={params.status === status}
                key={status}
                label={status}
                onClick={() =>
                  updateParams({ page: '1', status: params.status === status ? '' : status })
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            共 {pagination.total} 个 SO · 显示 {rangeStart}-{rangeEnd}
          </div>
        </div>

        <div className="mt-2 flex min-w-[820px] flex-1 flex-col overflow-hidden rounded-sm border border-border bg-white shadow-sm">
          <div className="grid grid-cols-[140px_200px_100px_120px_80px_100px_160px] border-b border-border bg-[#FDFCFB] px-6 py-4 text-sm font-medium text-muted">
            <div>
              <SortButton active={params.sort === 'so'} direction={params.order} label="SO 编号" onClick={() => handleSort('so')} />
            </div>
            <div>
              <SortButton active={params.sort === 'customer'} direction={params.order} label="客户" onClick={() => handleSort('customer')} />
            </div>
            <div>
              <SortButton active={params.sort === 'date'} direction={params.order} label="下单日期" onClick={() => handleSort('date')} />
            </div>
            <div>
              <SortButton active={params.sort === 'amount'} direction={params.order} label="金额" onClick={() => handleSort('amount')} />
            </div>
            <div className="text-center">
              <SortButton active={params.sort === 'skuCount'} direction={params.order} label="项数" onClick={() => handleSort('skuCount')} />
            </div>
            <div className="text-center">状态</div>
            <div className="text-right">操作</div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto bg-white text-sm">
            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-muted">加载销售订单中...</div>
            ) : null}
            {!loading && error ? (
              <div className="px-6 py-8 text-center text-sm text-primary">
                <p>销售订单加载失败：{error.message}</p>
                <button className="mt-3 text-sm font-medium underline underline-offset-4" onClick={reload} type="button">
                  重试
                </button>
              </div>
            ) : null}
            {!loading && !error
              ? pageRows.map((row) => (
                  <div
                    className="grid grid-cols-[140px_200px_100px_120px_80px_100px_160px] items-center border-b border-border px-6 py-4 transition-colors hover:bg-gray-50"
                    key={row.id}
                  >
                    <div className="font-medium text-primary">{row.so}</div>
                    <div>{row.customer}</div>
                    <div>{row.date}</div>
                    <div className="font-mono">¥ {row.amount.toLocaleString('zh-CN')}</div>
                    <div className="text-center">{row.skuCount}</div>
                    <div className="text-center">
                      <span className={getSalesOrderStatusClassName(row.status)}>{row.status}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="inline-flex h-8 items-center gap-1 border border-border bg-white px-3 text-xs font-medium transition-colors hover:bg-gray-50"
                        onClick={() => {
                          setSelectedRow(row);
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
                          setSelectedRow(row);
                          setDeleteDialogOpen(true);
                        }}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </button>
                    </div>
                  </div>
                ))
              : null}
            {!loading && !error && pageRows.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted">没有匹配的销售订单。</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
            <span className="text-muted">
              排序字段: {getSortLabel(params.sort as SalesOrderSortField)} /{' '}
              {params.order === 'asc' ? '升序' : '降序'}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="border border-border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                type="button"
              >
                上一页
              </button>
              {pageNumbers.map((page) => (
                <button
                  className={`border px-3 py-1 text-xs ${
                    page === currentPage
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
                disabled={currentPage === totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                type="button"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      <SalesOrderForm
        mode="create"
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        open={createDialogOpen}
      />

      <SalesOrderForm
        initialData={selectedRow ? toSalesOrderFormData(selectedRow) : undefined}
        mode="edit"
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
        open={editDialogOpen}
      />

      <DeleteConfirmDialog
        description={
          selectedRow
            ? `将删除销售订单「${selectedRow.so} / ${selectedRow.customer}」，此操作无法撤销。`
            : '此操作无法撤销。'
        }
        loading={deleteLoading}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title="确认删除销售订单"
      />
    </>
  );
}

function toSalesOrderFormData(row: SalesOrderRow): SalesOrderFormData {
  return {
    amount: String(row.amount),
    customerId: row.customer,
    orderDate: row.date,
    orderNo: row.so,
    status: row.status,
  };
}

function getSortLabel(field: SalesOrderSortField) {
  switch (field) {
    case 'amount':
      return '金额';
    case 'customer':
      return '客户';
    case 'skuCount':
      return '项数';
    case 'so':
      return 'SO 编号';
    default:
      return '下单日期';
  }
}

function getSalesOrderStatusClassName(status: SalesOrderListItem['status']) {
  if (status === '已发货') {
    return 'rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700';
  }

  if (status === '待发货') {
    return 'rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700';
  }

  return 'rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500';
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

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={active ? 'bg-[#1a1a1a] px-4 py-1.5 font-medium text-white shadow-sm' : 'border border-border bg-white px-4 py-1.5 text-foreground shadow-sm transition-colors hover:bg-gray-50'}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
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

async function requestSalesOrderMutation(input: RequestInfo | URL, init: RequestInit) {
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
