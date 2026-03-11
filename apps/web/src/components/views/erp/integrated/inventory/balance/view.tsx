'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  BalanceForm,
  type BalanceFormData,
} from '@/components/views/erp/integrated/inventory/balance/balance-form';
import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useInventoryBalance } from '@/lib/hooks/use-inventory-balance';
import type { InventoryBalanceListItem } from '@/lib/mocks/erp-list-fixtures';

const DEFAULT_PARAMS = {
  order: 'desc',
  page: '1',
  q: '',
  sort: 'balance',
  stockState: '',
  warehouse: '',
};

type BalanceSortField = 'available' | 'balance' | 'name' | 'safe' | 'sku';

type BalanceRow = InventoryBalanceListItem & {
  id: string;
  statusLabel: string;
};

type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

export default function InvBalList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useInventoryBalance();
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<BalanceRow | null>(null);

  const pageRows = React.useMemo<BalanceRow[]>(
    () =>
      data.map((item) => ({
        ...item,
        id: createBalanceRowId(item),
        statusLabel: getStockStatusLabel(item),
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

  const handleSort = (field: BalanceSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'desc';

    updateParams({ order: nextOrder, sort: field });
  };

  const handleCreate = async (formData: BalanceFormData) => {
    const response = await requestBalanceMutation('/api/bff/inventory/balance', {
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

  const handleUpdate = async (formData: BalanceFormData) => {
    if (!selectedRow) {
      throw new Error('未选择要编辑的库存余额');
    }

    const response = await requestBalanceMutation(
      `/api/bff/inventory/balance/${encodeURIComponent(selectedRow.id)}`,
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
      showNotice('未选择要删除的库存余额', 'error');
      return;
    }

    setDeleteLoading(true);
    const response = await requestBalanceMutation(
      `/api/bff/inventory/balance/${encodeURIComponent(selectedRow.id)}`,
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
            <h1 className="font-['var(--font-space-grotesk)'] text-2xl font-bold">库存余额</h1>
            <p className="mt-1 text-sm text-muted">SKU 现存量数据查询 · 单库层级盘点</p>
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
              新增库存
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
              placeholder="搜索物料编码、型号、仓库..."
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <FilterButton
              active={!params.warehouse}
              label="全部仓库"
              onClick={() => updateParams({ page: '1', warehouse: '' })}
            />
            {['深圳 A 仓', '青岛 B 仓', '苏州 周转仓'].map((warehouse) => (
              <FilterButton
                active={params.warehouse === warehouse}
                key={warehouse}
                label={warehouse}
                onClick={() => updateParams({ page: '1', warehouse }, { resetPage: true })}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <FilterButton
              active={!params.stockState}
              label="全部状态"
              onClick={() => updateParams({ page: '1', stockState: '' })}
            />
            <FilterButton
              active={params.stockState === 'low'}
              label="低于安全库存"
              onClick={() =>
                updateParams({
                  page: '1',
                  stockState: params.stockState === 'low' ? '' : 'low',
                })
              }
            />
            <FilterButton
              active={params.stockState === 'cycle'}
              label="推荐盘点"
              onClick={() =>
                updateParams({
                  page: '1',
                  stockState: params.stockState === 'cycle' ? '' : 'cycle',
                })
              }
            />
          </div>
        </div>

        <div className="mt-2 flex w-full items-center justify-between">
          <div className="text-xs text-muted">
            当前筛选: {params.warehouse || '全部仓库'} /{' '}
            {params.stockState === 'low'
              ? '低于安全库存'
              : params.stockState === 'cycle'
                ? '推荐盘点'
                : '全部'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            共 {pagination.total} 条 · 显示 {rangeStart}-{rangeEnd}
          </div>
        </div>

        <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden rounded-sm border border-border bg-white shadow-sm">
          <div className="grid grid-cols-[160px_200px_120px_100px_100px_100px_100px_90px_160px] border-b border-border bg-[#FDFCFB] px-6 py-4 text-sm font-medium text-muted">
            <div>
              <SortButton active={params.sort === 'sku'} direction={params.order} label="物料编码" onClick={() => handleSort('sku')} />
            </div>
            <div>
              <SortButton active={params.sort === 'name'} direction={params.order} label="物料名称" onClick={() => handleSort('name')} />
            </div>
            <div>仓库</div>
            <div className="text-right">
              <SortButton active={params.sort === 'balance'} direction={params.order} label="当前余额" onClick={() => handleSort('balance')} />
            </div>
            <div className="text-right">
              <SortButton active={params.sort === 'available'} direction={params.order} label="可用数量" onClick={() => handleSort('available')} />
            </div>
            <div className="text-right">预留数量</div>
            <div className="text-right">
              <SortButton active={params.sort === 'safe'} direction={params.order} label="安全库存" onClick={() => handleSort('safe')} />
            </div>
            <div className="text-center">状态</div>
            <div className="text-right">操作</div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto bg-white text-sm">
            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-muted">加载库存余额中...</div>
            ) : null}
            {!loading && error ? (
              <div className="px-6 py-8 text-center text-sm text-primary">
                <p>库存余额加载失败：{error.message}</p>
                <button className="mt-3 text-sm font-medium underline underline-offset-4" onClick={reload} type="button">
                  重试
                </button>
              </div>
            ) : null}
            {!loading && !error
              ? pageRows.map((row) => (
                  <div
                    className="grid grid-cols-[160px_200px_120px_100px_100px_100px_100px_90px_160px] items-center border-b border-border px-6 py-4 transition-colors hover:bg-gray-50"
                    key={row.id}
                  >
                    <div className="font-mono font-medium text-primary">{row.sku}</div>
                    <div className="font-medium text-foreground">{row.name}</div>
                    <div>{row.warehouse}</div>
                    <div className="text-right font-mono">{row.balance}</div>
                    <div className="text-right font-mono">{row.available}</div>
                    <div className="text-right font-mono">{row.reserved}</div>
                    <div className="text-right font-mono">{row.safe}</div>
                    <div className="text-center">
                      <span className={getStockStatusClassName(row)}>{row.statusLabel}</span>
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
              <div className="px-6 py-8 text-center text-sm text-muted">没有匹配的库存余额记录。</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
            <span className="text-muted">
              排序字段: {getSortLabel(params.sort as BalanceSortField)} /{' '}
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

      <BalanceForm
        mode="create"
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        open={createDialogOpen}
      />

      <BalanceForm
        initialData={selectedRow ? toBalanceFormData(selectedRow) : undefined}
        mode="edit"
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
        open={editDialogOpen}
      />

      <DeleteConfirmDialog
        description={
          selectedRow
            ? `将删除库存记录「${selectedRow.sku} / ${selectedRow.warehouse}」，此操作无法撤销。`
            : '此操作无法撤销。'
        }
        loading={deleteLoading}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title="确认删除库存余额"
      />
    </>
  );
}

function toBalanceFormData(row: BalanceRow): BalanceFormData {
  return {
    quantity: String(row.balance),
    skuId: row.sku,
    threshold: String(row.safe),
    warehouseId: row.warehouse,
  };
}

function createBalanceRowId(row: InventoryBalanceListItem) {
  return `${row.sku}::${row.warehouse}`;
}

function getSortLabel(field: BalanceSortField) {
  switch (field) {
    case 'available':
      return '可用数量';
    case 'name':
      return '物料名称';
    case 'safe':
      return '安全库存';
    case 'sku':
      return '物料编码';
    default:
      return '当前余额';
  }
}

function getStockStatusLabel(row: InventoryBalanceListItem) {
  if (row.balance < row.safe) {
    return '低库存';
  }

  if (row.available === 0) {
    return '待补货';
  }

  return '正常';
}

function getStockStatusClassName(row: InventoryBalanceListItem) {
  if (row.balance < row.safe) {
    return 'rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700';
  }

  if (row.available === 0) {
    return 'rounded-full bg-[#FFF5F5] px-2 py-0.5 text-[10px] font-bold text-[#B54A4A]';
  }

  return 'rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700';
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

async function requestBalanceMutation(input: RequestInfo | URL, init: RequestInit) {
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
