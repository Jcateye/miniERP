'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  LedgerForm,
  type LedgerFormData,
} from '@/components/views/erp/integrated/inventory/ledger/ledger-form';
import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useInventoryLedger } from '@/lib/hooks/use-inventory-ledger';
import type { InventoryLedgerListItem } from '@/lib/mocks/erp-list-fixtures';

const DEFAULT_PARAMS = {
  order: 'desc',
  page: '1',
  q: '',
  sort: 'date',
  type: '',
  warehouse: '',
};

type LedgerSortField = 'balance' | 'date' | 'skuId' | 'type' | 'warehouse';

type LedgerRow = InventoryLedgerListItem & { id: string };

type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

export default function InvLedgerList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useInventoryLedger();

  React.useEffect(() => {
    const handler = () => {
      reload();
    };

    window.addEventListener('minierp:inventory-mutated', handler);

    return () => {
      window.removeEventListener('minierp:inventory-mutated', handler);
    };
  }, [reload]);
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<LedgerRow | null>(null);

  const pageRows = React.useMemo<LedgerRow[]>(
    () =>
      data.map((item) => ({
        ...item,
        id: createLedgerRowId(item),
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

  const handleSort = (field: LedgerSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'desc';

    updateParams({ order: nextOrder, sort: field });
  };

  const handleCreate = async (formData: LedgerFormData) => {
    const response = await requestLedgerMutation('/api/bff/inventory/ledger', {
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

  const handleUpdate = async (formData: LedgerFormData) => {
    if (!selectedRow) {
      throw new Error('未选择要编辑的库存流水');
    }

    const response = await requestLedgerMutation(
      `/api/bff/inventory/ledger/${encodeURIComponent(selectedRow.id)}`,
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
      showNotice('未选择要删除的库存流水', 'error');
      return;
    }

    setDeleteLoading(true);
    const response = await requestLedgerMutation(
      `/api/bff/inventory/ledger/${encodeURIComponent(selectedRow.id)}`,
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
            <h1 className="font-['var(--font-space-grotesk)'] text-2xl font-bold">库存流水</h1>
            <p className="mt-1 text-sm text-muted">库存变动查询 · 入出库与盘点追踪</p>
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
              新增流水
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
              placeholder="搜索 SKU、仓库、来源单号、操作人..."
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

        <div className="flex flex-wrap gap-2 text-sm">
          <FilterButton active={!params.type} label="全部类型" onClick={() => updateParams({ page: '1', type: '' })} />
          {['入库', '出库', '调拨', '盘点'].map((type) => (
            <FilterButton
              active={params.type === type}
              key={type}
              label={type}
              onClick={() => updateParams({ page: '1', type: params.type === type ? '' : type })}
            />
          ))}
        </div>

        <div className="mt-2 flex w-full items-center justify-between">
          <div className="text-xs text-muted">
            当前类型筛选: {params.type || '全部'} / 仓库: {params.warehouse || '全部'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            共 {pagination.total} 条 · 显示 {rangeStart}-{rangeEnd}
          </div>
        </div>

        <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden rounded-sm border border-border bg-white shadow-sm">
          <div className="grid grid-cols-[140px_120px_100px_90px_100px_160px_100px_160px] border-b border-border bg-[#FDFCFB] px-6 py-4 text-sm font-medium text-muted">
            <div>
              <SortButton active={params.sort === 'date'} direction={params.order} label="时间" onClick={() => handleSort('date')} />
            </div>
            <div>
              <SortButton active={params.sort === 'skuId'} direction={params.order} label="SKU" onClick={() => handleSort('skuId')} />
            </div>
            <div>
              <SortButton active={params.sort === 'warehouse'} direction={params.order} label="仓库" onClick={() => handleSort('warehouse')} />
            </div>
            <div>
              <SortButton active={params.sort === 'type'} direction={params.order} label="类型" onClick={() => handleSort('type')} />
            </div>
            <div className="text-right">变动</div>
            <div>来源</div>
            <div className="text-right">
              <SortButton active={params.sort === 'balance'} direction={params.order} label="余额" onClick={() => handleSort('balance')} />
            </div>
            <div className="text-right">操作</div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto bg-white text-sm">
            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-muted">加载库存流水中...</div>
            ) : null}
            {!loading && error ? (
              <div className="px-6 py-8 text-center text-sm text-primary">
                <p>库存流水加载失败：{error.message}</p>
                <button className="mt-3 text-sm font-medium underline underline-offset-4" onClick={reload} type="button">
                  重试
                </button>
              </div>
            ) : null}
            {!loading && !error
              ? pageRows.map((row) => (
                  <div
                    className="grid grid-cols-[140px_120px_100px_90px_100px_160px_100px_160px] items-center border-b border-border px-6 py-4 transition-colors hover:bg-gray-50"
                    key={row.id}
                  >
                    <div>{row.date}</div>
                    <div className="font-mono font-medium text-primary">{row.skuId}</div>
                    <div>{row.warehouse}</div>
                    <div>
                      <span className={getLedgerTypeClassName(row.type)}>{row.type}</span>
                    </div>
                    <div className={`text-right font-mono ${row.direction.startsWith('-') ? 'text-[#B54A4A]' : 'text-[#2E7D32]'}`}>
                      {row.direction}
                    </div>
                    <div className="truncate text-muted" title={row.source}>
                      {row.source}
                    </div>
                    <div className="text-right font-mono">{row.balance}</div>
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
              <div className="px-6 py-8 text-center text-sm text-muted">没有匹配的库存流水记录。</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
            <span className="text-muted">
              排序字段: {getSortLabel(params.sort as LedgerSortField)} /{' '}
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

      <LedgerForm
        mode="create"
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        open={createDialogOpen}
      />

      <LedgerForm
        initialData={selectedRow ? toLedgerFormData(selectedRow) : undefined}
        mode="edit"
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
        open={editDialogOpen}
      />

      <DeleteConfirmDialog
        description={
          selectedRow
            ? `将删除流水记录「${selectedRow.skuId} / ${selectedRow.source}」，此操作无法撤销。`
            : '此操作无法撤销。'
        }
        loading={deleteLoading}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title="确认删除库存流水"
      />
    </>
  );
}

function toLedgerFormData(row: LedgerRow): LedgerFormData {
  return {
    quantity: row.direction.replace('+', '').replace('-', ''),
    reason: row.source.startsWith('MANUAL-') ? '' : row.source,
    skuId: row.skuId,
    type: row.type === '出库' ? '出库' : row.type === '入库' ? '入库' : '调整',
    warehouseId: row.warehouse,
  };
}

function createLedgerRowId(row: InventoryLedgerListItem) {
  return `${row.date}::${row.skuId}::${row.warehouse}::${row.source}`;
}

function getSortLabel(field: LedgerSortField) {
  switch (field) {
    case 'balance':
      return '余额';
    case 'skuId':
      return 'SKU';
    case 'type':
      return '类型';
    case 'warehouse':
      return '仓库';
    default:
      return '时间';
  }
}

function getLedgerTypeClassName(type: InventoryLedgerListItem['type']) {
  if (type === '出库') {
    return 'rounded-full bg-[#FFF5F5] px-2 py-0.5 text-[10px] font-bold text-[#B54A4A]';
  }

  if (type === '调拨') {
    return 'rounded-full bg-[#F6F2FF] px-2 py-0.5 text-[10px] font-bold text-[#6B4EA2]';
  }

  if (type === '盘点') {
    return 'rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2E6A9E]';
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

async function requestLedgerMutation(input: RequestInfo | URL, init: RequestInit) {
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
