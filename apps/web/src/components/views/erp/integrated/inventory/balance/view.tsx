'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, Download, Upload } from 'lucide-react';

import type { Warehouse, WarehouseBin } from '@minierp/shared';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  BalanceForm,
  type BalanceFormData,
} from '@/components/views/erp/integrated/inventory/balance/balance-form';
import {
  LedgerForm,
  type LedgerFormData,
} from '@/components/views/erp/integrated/inventory/ledger/ledger-form';
import { useBffGet } from '@/hooks/use-bff-get';
import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useInventoryBalance } from '@/lib/hooks/use-inventory-balance';
import type { InventoryBalanceListItem } from '@/lib/mocks/erp-list-fixtures';

const DEFAULT_PARAMS = {
  bin: '',
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

type LedgerMutationMode = 'stock-in' | 'stock-out';

type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

type LookupPagePayload<T> = {
  data?: T[];
  total?: number;
};

export default function InvBalList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useInventoryBalance();
  const warehousesState = useBffGet<LookupPagePayload<Warehouse>>('/warehouses?page=1&pageSize=100');
  const binsState = useBffGet<LookupPagePayload<WarehouseBin>>(
    params.warehouse ? `/warehouse-bins?warehouseId=${encodeURIComponent(params.warehouse)}` : '/warehouse-bins?warehouseId=__none__',
    Boolean(params.warehouse),
  );
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [ledgerDialogOpen, setLedgerDialogOpen] = React.useState(false);
  const [ledgerMode, setLedgerMode] = React.useState<LedgerMutationMode>('stock-in');
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
  const warehouses = warehousesState.data?.data ?? [];
  const bins = binsState.data?.data ?? [];
  const selectedWarehouseLabel =
    warehouses.find((item) => item.id === params.warehouse)?.name ?? params.warehouse;
  const selectedBinLabel =
    bins.find((item) => item.id === params.bin)?.name ?? params.bin;
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

  const handleLedgerMutation = async (formData: LedgerFormData) => {
    if (!selectedRow) {
      throw new Error('未选择要操作的库存余额');
    }

    const response = await requestLedgerMutation('/api/bff/inventory/ledger', {
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response, '操作失败');
      showNotice(message, 'error');
      throw new Error(message);
    }

    setLedgerDialogOpen(false);
    reload();
    window.dispatchEvent(new Event('minierp:inventory-mutated'));
    showNotice(formData.type === '出库' ? '出库成功' : '入库成功', 'success');
  };

  return (
    <>
      {/* Container Background #F5F3EF matches Design 1VpfS */}
      <div className="relative flex h-full w-full flex-col gap-6 overflow-y-auto bg-[#F5F3EF] px-10 py-8 pb-20">
        <div className="flex w-full items-start justify-between">
          <div>
            <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none tracking-tight text-[#1a1a1a]">库存余额</h1>
            <p className="mt-2 text-[13px] text-[#888888] font-['var(--font-space-grotesk)']">SKU 现存量数据查询 · 单库层级盘点</p>
          </div>

          <div className="flex gap-2.5">
            <button
              className="flex h-10 items-center justify-center border border-[#B6D7BD] bg-[#F2FBF4] px-5 text-sm font-bold text-[#2E7D32] shadow-sm transition-colors hover:bg-[#E8F5E9] uppercase tracking-wider"
              onClick={() => {
                setSelectedRow(null);
                setLedgerMode('stock-in');
                setLedgerDialogOpen(true);
              }}
              type="button"
            >
              入库
            </button>
            <button
              className="flex h-10 items-center justify-center border border-[#E7B9B9] bg-[#FFF5F5] px-5 text-sm font-bold text-[#B54A4A] shadow-sm transition-colors hover:bg-[#FFF0F0] uppercase tracking-wider"
              onClick={() => {
                setSelectedRow(null);
                setLedgerMode('stock-out');
                setLedgerDialogOpen(true);
              }}
              type="button"
            >
              出库
            </button>
            <button className="flex h-10 items-center justify-center rounded-md border border-[#D1CCC4] bg-white px-5 text-[13px] font-medium text-[#666666] shadow-sm transition-colors hover:bg-gray-50">
              导出
            </button>
            <button
              className="flex h-10 items-center justify-center gap-2 bg-[#C05A3C] px-5 text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95"
              onClick={() => setCreateDialogOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              新增库存
            </button>
          </div>
        </div>

        {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}

        {/* Search Bar - Round 6, Stroke #D1CCC4 */}
        <form className="w-full rounded-[6px] border border-[#D1CCC4] bg-white p-2" onSubmit={handleSearchSubmit}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
            <input
              className="h-10 w-full bg-transparent pl-10 pr-24 text-[13px] font-['var(--font-space-grotesk)'] outline-none placeholder:text-[#AAAAAA]"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="搜索物料编号, 名称, 仓库..."
              type="text"
              value={draftQuery}
            />
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <button 
                className="h-8 rounded-sm bg-[#1a1a1a] px-5 text-[12px] font-bold text-white tracking-wide transition-all hover:bg-black active:scale-95" 
                type="submit"
              >
                搜索
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[12px]">
            <FilterButton
              active={!params.stockState}
              label="全部库存"
              onClick={() => updateParams({ page: '1', stockState: '' })}
            />
            <FilterButton
              active={params.stockState === 'low'}
              label="低于安全库存"
              onClick={() => updateParams({ page: '1', stockState: params.stockState === 'low' ? '' : 'low' })}
              variant="outline"
            />
            <FilterButton
              active={params.stockState === 'zero'}
              label="零库存"
              onClick={() => updateParams({ page: '1', stockState: params.stockState === 'zero' ? '' : 'zero' })}
              variant="outline"
            />
            <div className="flex-1" />
            <select
              className="h-9 rounded-sm border border-[#D1CCC4] bg-white px-3 text-[12px] text-[#1a1a1a]"
              onChange={(event) => updateParams({ bin: '', page: '1', warehouse: event.target.value })}
              value={params.warehouse}
            >
              <option value="">全部仓库</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-sm border border-[#D1CCC4] bg-white px-3 text-[12px] text-[#1a1a1a] disabled:bg-[#F5F3EF] disabled:text-[#AAAAAA]"
              disabled={!params.warehouse}
              onChange={(event) => updateParams({ bin: event.target.value, page: '1' })}
              value={params.bin}
            >
              <option value="">{params.warehouse ? '全部仓位' : '先选仓库'}</option>
              {bins.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
            <div className="text-[#888888]">
              仓库 {selectedWarehouseLabel || '全部'} / 仓位 {selectedBinLabel || '全部'} · 共 {pagination.total} 条 · 显示 {rangeStart}-{rangeEnd}
            </div>
          </div>
        </div>

        {/* Table Container - Corner 4, Stroke #E8E4DD */}
        <div className="mt-2 flex min-w-[1080px] flex-1 flex-col overflow-hidden rounded-[4px] border border-[#E8E4DD] bg-white shadow-sm">
          {/* Table Header - BG #F5F3EF */}
          <div className="grid h-[44px] grid-cols-[120px_140px_100px_160px_80px_80px_80px_80px_100px_1fr] items-center border-b border-[#E8E4DD] bg-[#F5F3EF] px-4 text-[12px] font-semibold text-[#888888]">
            <div className="px-1"><SortButton active={params.sort === 'sku'} direction={params.order} label="物料编号" onClick={() => handleSort('sku')} /></div>
            <div className="px-1"><SortButton active={params.sort === 'name'} direction={params.order} label="物料名称" onClick={() => handleSort('name')} /></div>
            <div className="px-1">仓库</div>
            <div className="px-1">仓位</div>
            <div className="px-1 text-center">在库数量</div>
            <div className="px-1 text-center">可用数量</div>
            <div className="px-1 text-center">预留数量</div>
            <div className="px-1 text-center">安全库存</div>
            <div className="px-1 text-center">状态</div>
            <div className="px-1 text-right pr-4">操作</div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto bg-white text-[12px]">
            {loading ? (
              <div className="px-6 py-12 text-center text-[#888888]">加载中...</div>
            ) : null}
            {!loading && error ? (
              <div className="px-6 py-12 text-center text-primary">
                <p>加载失败：{error.message}</p>
                <button className="mt-3 font-medium underline" onClick={reload} type="button">重试</button>
              </div>
            ) : null}
            {!loading && !error
              ? pageRows.map((row) => (
                  <div
                    className="grid grid-cols-[120px_140px_100px_160px_80px_80px_80px_80px_100px_1fr] items-center border-b border-[#E8E4DD] px-4 py-[14px] transition-colors hover:bg-gray-50 bg-white"
                    key={row.id}
                  >
                    <div className="px-1 font-['var(--font-space-grotesk)'] font-bold text-[#C05A3C]">{row.sku}</div>
                    <div className="px-1 text-[#1a1a1a] truncate">{row.name}</div>
                    <div className="px-1 text-[#1a1a1a]">{row.warehouse}</div>
                    <div className="px-1 text-[#666666]">{row.bin ?? '未分仓位'}</div>
                    <div className="px-1 text-center font-['var(--font-space-grotesk)'] text-[#1a1a1a]">{row.balance}</div>
                    <div className="px-1 text-center font-['var(--font-space-grotesk)'] text-[#1a1a1a]">{row.available}</div>
                    <div className="px-1 text-center font-['var(--font-space-grotesk)'] text-[#1a1a1a]">{row.reserved}</div>
                    <div className="px-1 text-center font-['var(--font-space-grotesk)'] text-[#1a1a1a]">{row.safe}</div>
                    <div className="px-1 text-center">
                      <span className={getStockStatusClassName(row)}>{row.statusLabel}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pr-4">
                      <button
                        className="inline-flex h-8 items-center gap-1.5 border border-[#B6D7BD] bg-white px-2.5 text-[10px] font-bold text-[#2E7D32] transition-colors hover:bg-[#F2FBF4] uppercase tracking-wider"
                        onClick={() => {
                          setSelectedRow(row);
                          setLedgerMode('stock-in');
                          setLedgerDialogOpen(true);
                        }}
                        type="button"
                      >
                        <Download className="h-3 w-3" />
                        入库
                      </button>
                      <button
                        className="inline-flex h-8 items-center gap-1.5 border border-[#E7B9B9] bg-white px-2.5 text-[10px] font-bold text-[#B54A4A] transition-colors hover:bg-[#FFF5F5] uppercase tracking-wider"
                        onClick={() => {
                          setSelectedRow(row);
                          setLedgerMode('stock-out');
                          setLedgerDialogOpen(true);
                        }}
                        type="button"
                      >
                        <Upload className="h-3 w-3" />
                        出库
                      </button>
                      <div className="h-4 w-[1px] bg-[#E8E4DD] mx-1" />
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center border border-[#E8E4DD] bg-white text-[#888888] transition-colors hover:bg-gray-50 hover:text-[#1a1a1a]"
                        onClick={() => {
                          setSelectedRow(row);
                          setEditDialogOpen(true);
                        }}
                        title="编辑"
                        type="button"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center border border-[#E8E4DD] bg-white text-[#888888] transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                        onClick={() => {
                          setSelectedRow(row);
                          setDeleteDialogOpen(true);
                        }}
                        title="删除"
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              : null}
          </div>

          <div className="flex items-center justify-between border-t border-[#E8E4DD] px-6 py-4 bg-[#F5F3EF] text-[12px]">
            <div className="text-[#888888]">显示第 {rangeStart} 到 {rangeEnd} 条，共 {pagination.total} 条</div>
            <div className="flex items-center gap-1.5">
              <button
                className="h-8 border border-[#D1CCC4] bg-white px-3 text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                上一页
              </button>
              {pageNumbers.map((page) => (
                <button
                  className={`h-8 w-8 rounded-sm text-[12px] font-bold transition-colors ${
                    page === currentPage
                      ? 'bg-[#1a1a1a] text-[#F5F3EF]'
                      : 'border border-[#D1CCC4] bg-white text-[#1a1a1a] hover:bg-gray-50'
                  }`}
                  key={page}
                  onClick={() => updateParams({ page: String(page) })}
                >
                  {page}
                </button>
              ))}
              <button
                className="h-8 border border-[#D1CCC4] bg-white px-3 text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
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

      <LedgerForm
        key={`${selectedRow?.id ?? 'none'}-${ledgerMode}`}
        initialData={
          selectedRow
            ? {
                quantity: '',
                binId: selectedRow.binId ?? '',
                binLabel: selectedRow.bin ?? '',
                reason: '',
                skuId: selectedRow.sku,
                type: ledgerMode === 'stock-out' ? '出库' : '入库',
                warehouseId: selectedRow.warehouseId,
                warehouseLabel: selectedRow.warehouse,
              }
            : undefined
        }
        mode="create"
        onOpenChange={setLedgerDialogOpen}
        onSubmit={handleLedgerMutation}
        open={ledgerDialogOpen}
        rows={pageRows}
      />

      <DeleteConfirmDialog
        description={
          selectedRow
            ? `将删除库存记录「${selectedRow.sku} / ${selectedRow.warehouse}${selectedRow.bin ? ` / ${selectedRow.bin}` : ''}」，此操作无法撤销。`
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
    binId: row.binId ?? '',
    binLabel: row.bin ?? '',
    quantity: String(row.balance),
    skuId: row.sku,
    threshold: String(row.safe),
    warehouseId: row.warehouseId,
    warehouseLabel: row.warehouse,
  };
}

function createBalanceRowId(row: InventoryBalanceListItem) {
  return `${row.sku}::${row.warehouseId}::${row.binId ?? ''}`;
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
      return '在库数量';
  }
}

function getStockStatusLabel(row: InventoryBalanceListItem) {
  if (row.balance < row.safe) {
    return '低库存';
  }
  if (row.available === 0) {
    return '零库存';
  }
  return '正常';
}

function getStockStatusClassName(row: InventoryBalanceListItem) {
  if (row.balance < row.safe) {
    return 'inline-flex rounded-sm bg-[#FFF3E0] px-2.5 py-1 text-[10px] font-bold text-[#E67E22]';
  }
  if (row.available === 0) {
    return 'inline-flex rounded-sm bg-[#FFEBEE] px-2.5 py-1 text-[10px] font-bold text-[#E53935]';
  }
  return 'inline-flex rounded-sm bg-[#E8F5E9] px-2.5 py-1 text-[10px] font-bold text-[#2E7D32]';
}

function InlineNotice({ message, tone }: { message: string; tone: Notice['tone'] }) {
  return (
    <div className={`rounded-sm border px-4 py-3 text-[13px] ${tone === 'success' ? 'border-[#B6D7BD] bg-[#F2FBF4] text-[#2E7D32]' : 'border-[#E7B9B9] bg-[#FFF5F5] text-[#B54A4A]'}`}>
      {message}
    </div>
  );
}

function FilterButton({ active, label, onClick, variant = 'primary' }: { active: boolean; label: string; onClick: () => void; variant?: 'primary' | 'outline' }) {
  if (active) {
    return (
      <button className="h-9 px-4 bg-[#1a1a1a] text-[#F5F3EF] rounded-[4px] text-[12px] font-bold shadow-sm" onClick={onClick}>
        {label}
      </button>
    );
  }
  return (
    <button className="h-9 px-4 border border-[#D1CCC4] bg-white text-[#666666] rounded-[4px] text-[12px] font-normal transition-colors hover:bg-gray-50" onClick={onClick}>
      {label}
    </button>
  );
}

function SortButton({ active, direction, label, onClick }: { active: boolean; direction: string; label: string; onClick: () => void }) {
  return (
    <button className="inline-flex items-center gap-1 hover:text-[#1a1a1a] transition-colors" onClick={onClick} type="button">
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
    return new Response(JSON.stringify({ error: { message: '请求失败' } }), { status: 503 });
  }
}

async function requestLedgerMutation(input: RequestInfo | URL, init: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    return new Response(JSON.stringify({ error: { message: '请求失败' } }), { status: 503 });
  }
}

async function extractErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.error?.message || data.message || fallback;
  } catch {
    return fallback;
  }
}
