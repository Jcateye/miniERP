'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Plus,
  Search,
  Settings,
  Upload,
} from 'lucide-react';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  SkuForm,
  type SkuFormData,
} from '@/components/views/erp/integrated/mdm/skus/sku-form';
import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useSkuList } from '@/lib/hooks/use-sku-list';
import {
  skuCategoryLabelById,
  taxCodeLabelById,
  skuViewMetaByCode,
  type SkuActivity,
} from '@/lib/mocks/erp-list-fixtures';

import type { Sku } from '@minierp/shared';

const DEFAULT_PARAMS = {
  category: '',
  lowStock: '',
  order: 'asc',
  page: '1',
  q: '',
  sort: 'code',
  status: '',
  supplier: '',
  warehouse: '',
};

type SkuRow = {
  activities: readonly SkuActivity[];
  baseUnit: string;
  batchManaged: boolean;
  barcode: string;
  cat: string;
  categoryId: string | null;
  code: string;
  desc: string;
  id: string;
  itemType: string;
  leadTimeDays: number | null;
  maxStockQty: string;
  minStockQty: string;
  name: string;
  serialManaged: boolean;
  shelfLifeDays: number | null;
  specification: string;
  status: Sku['status'];
  statusLabel: string;
  stock: number;
  supp: string;
  supplierSku: string;
  taxCodeId: string;
  taxRate: string;
  threshold: number;
  warehouse: string;
};

type SkuSortField = 'cat' | 'code' | 'name' | 'status' | 'stock' | 'supp' | 'threshold';

type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

type ItemDetailPayload = {
  barcode?: string | null;
  batchManaged?: boolean;
  baseUnit?: string | null;
  categoryId?: string | null;
  code?: string | null;
  isActive?: boolean;
  itemType?: string | null;
  leadTimeDays?: number | null;
  maxStockQty?: string | null;
  minStockQty?: string | null;
  name?: string | null;
  serialManaged?: boolean;
  shelfLifeDays?: number | null;
  specification?: string | null;
  taxCodeId?: string | null;
  taxRate?: string | null;
};

function isItemDetailPayload(value: unknown): value is ItemDetailPayload {
  return typeof value === 'object' && value !== null;
}

export default function SkuList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useSkuList();
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [selectedId, setSelectedId] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSku, setSelectedSku] = React.useState<SkuRow | null>(null);
  const [editInitialData, setEditInitialData] = React.useState<SkuFormData | undefined>(
    undefined,
  );
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);

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
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice((current) => (current?.id === notice.id ? null : current));
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const pageRows = React.useMemo<SkuRow[]>(
    () =>
      data.map((item) => {
        const meta = skuViewMetaByCode[item.code];
        const categoryLabel =
          meta?.categoryLabel ??
          (item.categoryId ? skuCategoryLabelById[item.categoryId] ?? item.categoryId : '-');

        return {
          activities: meta?.activities ?? [],
          baseUnit: item.unit,
          batchManaged: item.batchManaged,
          barcode: item.barcode ?? '',
          cat: categoryLabel,
          categoryId: item.categoryId,
          code: item.code,
          desc: item.specification ?? '-',
          id: item.id,
          itemType: item.itemType ?? '-',
          leadTimeDays: item.leadTimeDays ?? null,
          maxStockQty: item.maxStockQty ?? '',
          minStockQty: item.minStockQty ?? '',
          name: item.name,
          serialManaged: item.serialManaged,
          shelfLifeDays: item.shelfLifeDays ?? null,
          specification: item.specification ?? '',
          status: item.status,
          statusLabel: getSkuStatusLabel(item.status),
          stock: meta?.stock ?? 0,
          supp: meta?.supplierName ?? '-',
          supplierSku: meta?.supplierSku ?? '-',
          taxCodeId: item.taxCodeId ?? '',
          taxRate: item.taxRate ?? '',
          threshold: meta?.threshold ?? 0,
          warehouse: meta?.warehouseLabel ?? '-',
        };
      }),
    [data],
  );

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
    if (!pageRows.length) {
      setSelectedId('');
      setSelectedSku(null);
      return;
    }

    if (!pageRows.some((row) => row.id === selectedId)) {
      setSelectedId(pageRows[0].id);
    }
  }, [pageRows, selectedId]);

  React.useEffect(() => {
    if (!selectedId) {
      setSelectedSku(pageRows[0] ?? null);
      return;
    }

    setSelectedSku(pageRows.find((row) => row.id === selectedId) ?? pageRows[0] ?? null);
  }, [pageRows, selectedId]);

  React.useEffect(() => {
    if (!editDialogOpen || !selectedSku) {
      return undefined;
    }

    let disposed = false;
    setEditInitialData(toSkuFormData(selectedSku));

    void (async () => {
      const detail = await fetchItemDetail(selectedSku.id);
      if (!detail || disposed) {
        return;
      }

      setEditInitialData(toSkuFormDataFromDetail(detail, selectedSku));
    })();

    return () => {
      disposed = true;
    };
  }, [editDialogOpen, selectedSku]);

  const isEmpty = !loading && !error && pagination.total === 0;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: SkuSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'asc';

    updateParams({ order: nextOrder, sort: field });
  };

  const clearFilters = () => {
    setDraftQuery('');
    updateParams({
      category: '',
      lowStock: '',
      page: '1',
      q: '',
      status: '',
      supplier: '',
      warehouse: '',
    });
  };

  const handleCreate = async (formData: SkuFormData) => {
    const response = await requestSkuMutation('/api/bff/items', {
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': createIdempotencyKey('sku-create'),
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

  const handleUpdate = async (formData: SkuFormData) => {
    if (!selectedSku) {
      throw new Error('未选择要编辑的 SKU');
    }

    const response = await requestSkuMutation(`/api/bff/items/${selectedSku.id}`, {
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': createIdempotencyKey(`sku-update-${selectedSku.id}`),
      },
      method: 'PUT',
    });

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
    if (!selectedSku) {
      showNotice('未选择要删除的 SKU', 'error');
      return;
    }

    setDeleteLoading(true);
    const response = await requestSkuMutation(`/api/bff/items/${selectedSku.id}`, {
      method: 'DELETE',
    });

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
        <div className="flex w-full items-start justify-between">
          <div>
            <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">SKU 管理</h1>
            <p className="mt-2 text-[13px] text-muted">SKU 列表 / 管理及筛选</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex h-10 items-center justify-center gap-2 border border-border bg-white px-5 text-sm font-medium transition-colors hover:bg-gray-50">
              <Upload className="h-4 w-4" /> 导入
            </button>
            <button className="flex h-10 items-center justify-center gap-2 border border-border bg-white px-5 text-sm font-medium transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" /> 导出
            </button>
            <button
              className="flex h-10 items-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-opacity-90"
              onClick={() => setCreateDialogOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" /> 新增 SKU
            </button>
          </div>
        </div>

        {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}

        <div className="flex w-full flex-col gap-3">
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full border border-border bg-white pl-10 pr-24 text-sm outline-none transition-colors focus:border-primary"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="搜索 SKU 编码、名称、品牌型号、条码..."
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
          </form>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            <FilterSelect
              label="类目"
              onChange={(value) => updateParams({ category: value, page: '1' })}
              options={['线材', '连接器', '转换器', '电源', '扩展坞']}
              value={params.category}
            />
            <FilterSelect
              label="状态"
              onChange={(value) => updateParams({ page: '1', status: value })}
              options={['正常', '补货', '下架']}
              value={params.status}
            />
            <FilterSelect
              label="仓库"
              onChange={(value) => updateParams({ page: '1', warehouse: value })}
              options={['深圳 A 仓', '青岛 B 仓', '苏州 周转仓']}
              value={params.warehouse}
            />
            <FilterSelect
              label="供应商"
              onChange={(value) => updateParams({ page: '1', supplier: value })}
              options={['金源科技', '宏发制造', '鸿鹏电子', '立讯精密', '未知供应']}
              value={params.supplier}
            />
            <button
              className={`h-10 border px-3 text-sm font-medium transition-colors ${
                params.lowStock === '1'
                  ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                  : 'border-border bg-white hover:bg-gray-50'
              }`}
              onClick={() => updateParams({ lowStock: params.lowStock === '1' ? '' : '1', page: '1' })}
              type="button"
            >
              库存告急
            </button>
          </div>

          <div className="mt-1 flex w-full items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {params.category ? (
                <ActiveChip label={`类目: ${params.category}`} onClear={() => updateParams({ category: '', page: '1' })} />
              ) : null}
              {params.status ? (
                <ActiveChip label={`状态: ${params.status}`} onClear={() => updateParams({ page: '1', status: '' })} />
              ) : null}
              {params.warehouse ? (
                <ActiveChip label={`仓库: ${params.warehouse}`} onClear={() => updateParams({ page: '1', warehouse: '' })} />
              ) : null}
              {params.supplier ? (
                <ActiveChip label={`供应商: ${params.supplier}`} onClear={() => updateParams({ page: '1', supplier: '' })} />
              ) : null}
              {params.lowStock === '1' ? (
                <ActiveChip label="库存告急" onClear={() => updateParams({ lowStock: '', page: '1' })} />
              ) : null}
              {hasFilters(params) ? (
                <button
                  className="ml-2 flex items-center text-sm font-medium text-primary"
                  onClick={clearFilters}
                  type="button"
                >
                  清除筛选
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="mt-2 flex flex-1 items-center justify-center rounded-sm border border-border bg-white">
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted">没有找到匹配的 SKU</p>
              <button className="mt-3 text-sm font-medium text-primary" onClick={clearFilters} type="button">
                清除筛选
              </button>
            </div>
          </div>
        ) : null}

        {!isEmpty ? (
          <div className="mt-2 flex h-full min-h-0 gap-6">
            <div className="flex min-w-[760px] flex-1 flex-col overflow-hidden rounded-sm border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border bg-[#FDFCFB] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    共 {pagination.total.toLocaleString('zh-CN')} 个 SKU
                  </span>
                  <span className="text-xs text-muted">
                    显示 {rangeStart}-{rangeEnd}
                  </span>
                </div>

                <button className="text-muted hover:text-foreground" type="button">
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              <div className="grid h-10 items-center grid-cols-[40px_160px_1fr_100px_120px_100px_100px_80px_160px] border-b border-border bg-[#FDFCFB] px-4 text-sm font-medium text-muted">
                <div className="flex items-center">
                  <input type="checkbox" />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'code'} direction={params.order} label="SKU 编码" onClick={() => handleSort('code')} />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'name'} direction={params.order} label="名称 / 规格" onClick={() => handleSort('name')} />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'cat'} direction={params.order} label="类目" onClick={() => handleSort('cat')} />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'supp'} direction={params.order} label="默认供应商" onClick={() => handleSort('supp')} />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'stock'} direction={params.order} label="可用库存" onClick={() => handleSort('stock')} />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'threshold'} direction={params.order} label="告急阈值" onClick={() => handleSort('threshold')} />
                </div>
                <div className="flex items-center">
                  <SortButton active={params.sort === 'status'} direction={params.order} label="状态" onClick={() => handleSort('status')} />
                </div>
                <div className="flex items-center">操作</div>
              </div>

              <div className="flex-1 overflow-y-auto text-sm">
                {loading ? <div className="px-4 py-8 text-center text-sm text-muted">加载中...</div> : null}
                {!loading && error ? (
                  <div className="px-4 py-8 text-center text-sm text-red-600">错误: {error.message}</div>
                ) : null}
                {!loading && !error
                  ? pageRows.map((row) => (
                      <TableRow
                        isActive={row.id === selectedSku?.id}
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        onDelete={() => {
                          setSelectedSku(row);
                          setDeleteDialogOpen(true);
                        }}
                        onEdit={() => {
                          setSelectedSku(row);
                          setEditInitialData(toSkuFormData(row));
                          setEditDialogOpen(true);
                        }}
                        row={row}
                      />
                    ))
                  : null}
              </div>

              <div className="flex items-center justify-between border-t border-border p-3">
                <span className="text-sm text-muted">
                  显示 {rangeStart} 到 {rangeEnd} / 共 {pagination.total} 条
                </span>
                <div className="flex gap-1">
                  <button
                    className="flex h-8 items-center justify-center border border-border bg-white px-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={pagination.page === 1 || loading}
                    onClick={() => updateParams({ page: String(pagination.page - 1) })}
                    type="button"
                  >
                    上一页
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      className={`flex h-8 w-8 items-center justify-center border text-xs ${
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
                    className="flex h-8 items-center justify-center border border-border bg-white px-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={pagination.page === totalPages || loading}
                    onClick={() => updateParams({ page: String(pagination.page + 1) })}
                    type="button"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>

            {selectedSku ? (
              <div className="flex w-[300px] flex-col border border-border bg-white">
                <div className="flex items-center justify-between border-b border-border bg-[#FDFCFB] p-4">
                  <h2 className="font-bold">快速预览</h2>
                  <span className="text-xs text-muted">BFF 列表页</span>
                </div>

                <div className="flex flex-col gap-6 overflow-y-auto p-5">
                  <div>
                    <h3 className="text-lg font-bold">{selectedSku.code}</h3>
                    <p className="mt-1 text-sm text-muted">{selectedSku.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="border border-border bg-[#FDFCFB] px-2 py-0.5 text-xs">{selectedSku.cat}</span>
                      <span className="border border-border bg-[#FDFCFB] px-2 py-0.5 text-xs">
                        单位 {selectedSku.baseUnit}
                      </span>
                      <span className="border border-border bg-[#FDFCFB] px-2 py-0.5 text-xs">
                        类型 {selectedSku.itemType}
                      </span>
                      <span className="border border-border bg-[#FDFCFB] px-2 py-0.5 text-xs">
                        {selectedSku.warehouse}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="cursor-pointer bg-gray-100 px-3 py-1 text-xs font-medium">入库单</span>
                    <span className="cursor-pointer border-b-2 border-primary bg-[#E8E4DC] px-3 py-1 text-xs font-medium">
                      最近动态
                    </span>
                    <span className="cursor-pointer bg-gray-100 px-3 py-1 text-xs font-medium">出库单</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="mb-1 text-sm font-bold">可用库存</div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">{selectedSku.warehouse}</span>
                      <span className="font-medium">{selectedSku.stock}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">安全库存</span>
                      <span className="font-medium">{selectedSku.threshold}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">最小库存</span>
                      <span className="font-medium">{selectedSku.minStockQty || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">最大库存</span>
                      <span className="font-medium">{selectedSku.maxStockQty || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">采购提前期</span>
                      <span className="font-medium">
                        {selectedSku.leadTimeDays === null ? '-' : `${selectedSku.leadTimeDays} 天`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">保质期</span>
                      <span className="font-medium">
                        {selectedSku.shelfLifeDays === null ? '-' : `${selectedSku.shelfLifeDays} 天`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">税码</span>
                      <span className="font-medium">
                        {selectedSku.taxCodeId
                          ? taxCodeLabelById[selectedSku.taxCodeId] ?? selectedSku.taxCodeId
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
                      <span className="text-muted">税率</span>
                      <span className="font-medium">{selectedSku.taxRate || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-2 py-2 text-sm font-bold">
                      <span>状态</span>
                      <span>{selectedSku.statusLabel}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-3">
                    <div className="text-xs text-muted">供应商货号/条码</div>
                    <div className="text-sm">{selectedSku.supplierSku}</div>
                    <div className="text-xs text-muted">条码 / 管理模式</div>
                    <div className="text-sm">
                      {selectedSku.barcode || '-'}
                      <span className="ml-2 text-xs text-muted">
                        {selectedSku.batchManaged ? '批次' : '非批次'} / {selectedSku.serialManaged ? '序列号' : '非序列号'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-muted">快捷操作</div>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <button className="bg-[#1a1a1a] py-2 text-sm font-medium text-white" type="button">
                        去补货
                      </button>
                      <button className="border border-border bg-white py-2 text-sm font-medium transition-colors hover:bg-gray-50" type="button">
                        去盘点
                      </button>
                      <button className="col-span-2 border border-border bg-white py-2 text-sm font-medium transition-colors hover:bg-gray-50" type="button">
                        去详情页
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-3 text-xs text-muted">
                      最近动态({selectedSku.activities.length}项)
                    </div>
                    {selectedSku.activities.length ? (
                      <div className="flex flex-col gap-3">
                        {selectedSku.activities.map((item) => (
                          <div className="flex gap-2" key={`${selectedSku.code}-${item.label}`}>
                            <div className={`mt-1 h-1.5 w-1.5 rounded-sm ${item.color}`} />
                            <div className="text-xs">
                              <div className="mb-0.5 font-medium">{item.label}</div>
                              <div className="text-muted">{item.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted">暂无动态记录</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <SkuForm
        mode="create"
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        open={createDialogOpen}
      />

      <SkuForm
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
          selectedSku
            ? `将删除 SKU「${selectedSku.code} / ${selectedSku.name}」，此操作无法撤销。`
            : '此操作无法撤销。'
        }
        loading={deleteLoading}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title="确认删除 SKU"
      />
    </>
  );
}

/**
 * 将表格行数据转换为表单数据（用于编辑）
 *
 * 重要原则：
 * - 必须优先使用后端返回的真实数据（如 categoryId）
 * - 不要使用展示字段（如 cat）作为数据源
 * - 展示字段可能来自 fixture/meta，与后端真实数据不一致
 * - 避免在保存时静默覆盖用户数据
 */
function toSkuFormData(row: SkuRow): SkuFormData {
  return {
    barcode: row.barcode,
    batchManaged: row.batchManaged,
    code: row.code,
    name: row.name,
    specification: row.specification,
    baseUnit: row.baseUnit,
    category: row.categoryId ?? (row.cat === '-' ? '' : row.cat),
    itemType: row.itemType === '-' ? '' : row.itemType,
    leadTimeDays: row.leadTimeDays,
    maxStockQty: row.maxStockQty,
    minStockQty: row.minStockQty,
    serialManaged: row.serialManaged,
    shelfLifeDays: row.shelfLifeDays,
    status: row.status,
    taxCodeId: row.taxCodeId,
    taxRate: row.taxRate,
  };
}

function toSkuFormDataFromDetail(
  detail: ItemDetailPayload,
  fallbackRow: SkuRow,
): SkuFormData {
  const category =
    detail.categoryId === undefined || detail.categoryId === null
      ? fallbackRow.categoryId ?? (fallbackRow.cat === '-' ? '' : fallbackRow.cat)
      : skuCategoryLabelById[detail.categoryId] ?? detail.categoryId;

  return {
    baseUnit: detail.baseUnit ?? fallbackRow.baseUnit,
    barcode: detail.barcode ?? fallbackRow.barcode,
    batchManaged: detail.batchManaged ?? fallbackRow.batchManaged,
    category,
    code: detail.code ?? fallbackRow.code,
    itemType: detail.itemType ?? (fallbackRow.itemType === '-' ? '' : fallbackRow.itemType),
    leadTimeDays: detail.leadTimeDays ?? fallbackRow.leadTimeDays,
    maxStockQty: detail.maxStockQty ?? fallbackRow.maxStockQty,
    minStockQty: detail.minStockQty ?? fallbackRow.minStockQty,
    name: detail.name ?? fallbackRow.name,
    serialManaged: detail.serialManaged ?? fallbackRow.serialManaged,
    shelfLifeDays: detail.shelfLifeDays ?? fallbackRow.shelfLifeDays,
    specification: detail.specification ?? fallbackRow.specification,
    status:
      detail.isActive === undefined
        ? fallbackRow.status
        : detail.isActive
          ? fallbackRow.status === 'disabled'
            ? 'normal'
            : fallbackRow.status
          : 'disabled',
    taxCodeId: detail.taxCodeId ?? fallbackRow.taxCodeId,
    taxRate: detail.taxRate ?? fallbackRow.taxRate,
  };
}

function hasFilters(params: typeof DEFAULT_PARAMS) {
  return Boolean(
    params.category ||
      params.lowStock ||
      params.q ||
      params.status ||
      params.supplier ||
      params.warehouse,
  );
}

function createIdempotencyKey(prefix: string) {
  const random =
    typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${random}`;
}

async function requestSkuMutation(input: RequestInfo | URL, init: RequestInit) {
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

async function fetchItemDetail(id: string): Promise<ItemDetailPayload | null> {
  try {
    const response = await fetch(`/api/bff/items/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as
      | ItemDetailPayload
      | { data?: ItemDetailPayload };

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data ?? null;
    }

    return isItemDetailPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <select
        className="h-10 border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
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

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex items-center gap-1 rounded-sm bg-[#E8E4DC] px-2 py-1 text-xs">
      <span>{label}</span>
      <button className="cursor-pointer" onClick={onClear} type="button">
        ×
      </button>
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

function getSkuStatusLabel(status: 'disabled' | 'normal' | 'warning') {
  switch (status) {
    case 'disabled':
      return '下架';
    case 'warning':
      return '补货';
    default:
      return '正常';
  }
}

function TableRow({
  isActive,
  onClick,
  onDelete,
  onEdit,
  row,
}: {
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  row: SkuRow;
}) {
  const isWarning = row.status === 'warning';
  const isDisabled = row.status === 'disabled';

  return (
    <div
      className={`grid grid-cols-[40px_160px_1fr_100px_120px_100px_100px_80px_160px] items-center border-b border-border px-4 py-3 text-left ${
        isActive ? 'bg-[#FFF8F6]' : 'hover:bg-gray-50'
      } ${isDisabled ? 'opacity-50' : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div>
        <input readOnly type="checkbox" />
      </div>
      <div className={`font-medium ${isActive ? 'text-primary' : ''} ${isDisabled ? 'text-muted line-through' : ''}`}>
        {row.code}
      </div>
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="max-w-[220px] truncate text-xs text-muted">{row.desc}</div>
      </div>
      <div>{row.cat}</div>
      <div className="truncate">{row.supp}</div>
      <div className={`font-medium ${isWarning ? 'text-primary' : ''}`}>{row.stock}</div>
      <div>{row.threshold}</div>
      <div>
        <span
          className={`inline-flex min-w-14 justify-center px-2 py-0.5 text-xs font-medium ${
            row.status === 'disabled'
              ? 'bg-gray-100 text-muted'
              : row.status === 'warning'
                ? 'bg-[#FCE9E0] text-primary'
                : 'bg-[#EAF3EB] text-[#549363]'
          }`}
        >
          {row.statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
        <button className="text-xs font-medium text-primary hover:underline" onClick={onEdit} type="button">
          编辑
        </button>
        <button className="text-xs font-medium text-[#B54A4A] hover:underline" onClick={onDelete} type="button">
          删除
        </button>
      </div>
    </div>
  );
}
