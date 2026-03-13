'use client';

import * as React from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import type { Warehouse, WarehouseBin } from '@minierp/shared';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useBffGet } from '@/hooks/use-bff-get';
import {
  buildPagination,
  parsePageParam,
  useUrlListState,
} from '@/hooks/use-url-list-state';
import { useWarehouseBinList } from '@/lib/hooks/use-warehouse-bin-list';
import { useWarehouseList } from '@/lib/hooks/use-warehouse-list';

import {
  WarehouseForm,
  type WarehouseFormData,
} from './warehouse-form';
import {
  WarehouseBinForm,
  type WarehouseBinFormData,
} from './warehouse-bin-form';

const DEFAULT_PARAMS = {
  order: 'asc',
  page: '1',
  q: '',
  sort: 'code',
};

type Notice = {
  id: number;
  message: string;
  tone: 'error' | 'success';
};

type WarehouseBinPagePayload = {
  data?: WarehouseBin[];
};

function isWarehousePayload(value: unknown): value is Warehouse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}

export default function WarehouseList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useWarehouseList();
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [selectedId, setSelectedId] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [createBinDialogOpen, setCreateBinDialogOpen] = React.useState(false);
  const [editBinDialogOpen, setEditBinDialogOpen] = React.useState(false);
  const [deleteBinDialogOpen, setDeleteBinDialogOpen] = React.useState(false);
  const [editInitialData, setEditInitialData] = React.useState<
    WarehouseFormData | undefined
  >(undefined);
  const [editBinInitialData, setEditBinInitialData] = React.useState<
    WarehouseBinFormData | undefined
  >(undefined);
  const [selectedBin, setSelectedBin] = React.useState<WarehouseBin | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [deleteBinLoading, setDeleteBinLoading] = React.useState(false);

  const allBinsState = useBffGet<WarehouseBinPagePayload>(
    '/warehouse-bins?isActive=true',
  );

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  React.useEffect(() => {
    if (!loading && data.length > 0 && !data.some((item) => item.id === selectedId)) {
      setSelectedId(data[0]?.id ?? '');
    }

    if (!loading && data.length === 0) {
      setSelectedId('');
    }
  }, [data, loading, selectedId]);

  React.useEffect(() => {
    const rawPage = parsePageParam(params.page);
    if (rawPage !== pagination.page) {
      updateParams({ page: String(pagination.page) }, { replace: true });
    }
  }, [pagination.page, params.page, updateParams]);

  React.useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice((current) => (current?.id === notice.id ? null : current));
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const binCountByWarehouse = React.useMemo(() => {
    return (allBinsState.data?.data ?? []).reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.warehouseId] = (acc[item.warehouseId] ?? 0) + 1;
        return acc;
      },
      {},
    );
  }, [allBinsState.data?.data]);

  const selectedWarehouse = React.useMemo(
    () => data.find((item) => item.id === selectedId) ?? data[0] ?? null,
    [data, selectedId],
  );

  const detailState = useBffGet<Warehouse>(
    selectedWarehouse ? `/warehouses/${selectedWarehouse.id}` : '/warehouses/0',
    Boolean(selectedWarehouse),
  );
  const binState = useWarehouseBinList(selectedWarehouse?.id);
  const pages = React.useMemo(
    () => buildPagination(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );

  const warehouseDetail = detailState.data ?? selectedWarehouse;

  React.useEffect(() => {
    if (!editDialogOpen || !selectedWarehouse) {
      return undefined;
    }

    let disposed = false;
    setEditInitialData(toWarehouseFormData(warehouseDetail ?? selectedWarehouse));

    void (async () => {
      const detail = await fetchWarehouseDetail(selectedWarehouse.id);
      if (!detail || disposed) {
        return;
      }

      setEditInitialData(toWarehouseFormData(detail));
    })();

    return () => {
      disposed = true;
    };
  }, [editDialogOpen, selectedWarehouse, warehouseDetail]);

  React.useEffect(() => {
    if (!editBinDialogOpen || !selectedBin) {
      return undefined;
    }

    let disposed = false;
    setEditBinInitialData(toWarehouseBinFormData(selectedBin));

    void (async () => {
      const detail = await fetchWarehouseBinDetail(selectedBin.id);
      if (!detail || disposed) {
        return;
      }

      setEditBinInitialData(toWarehouseBinFormData(detail));
    })();

    return () => {
      disposed = true;
    };
  }, [editBinDialogOpen, selectedBin]);

  const showNotice = React.useCallback((message: string, tone: Notice['tone']) => {
    setNotice({
      id: Date.now(),
      message,
      tone,
    });
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ q: draftQuery }, { resetPage: true });
  };

  const reloadWarehouseViews = React.useCallback(() => {
    reload();
    detailState.reload();
    binState.reload();
    allBinsState.reload();
  }, [allBinsState, binState, detailState, reload]);

  const handleCreate = async (formData: WarehouseFormData) => {
    const response = await requestWarehouseMutation('/api/bff/warehouses', {
      body: JSON.stringify(toCreateWarehousePayload(formData)),
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

    const created = await parseWarehouseResponse(response);
    setCreateDialogOpen(false);
    if (created) {
      setSelectedId(created.id);
    }
    reloadWarehouseViews();
    showNotice('新增成功', 'success');
  };

  const handleUpdate = async (formData: WarehouseFormData) => {
    if (!selectedWarehouse) {
      throw new Error('未选择要编辑的仓库');
    }

    const response = await requestWarehouseMutation(
      `/api/bff/warehouses/${selectedWarehouse.id}`,
      {
        body: JSON.stringify(toUpdateWarehousePayload(formData)),
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
    reloadWarehouseViews();
    showNotice('更新成功', 'success');
  };

  const handleCreateBin = async (formData: WarehouseBinFormData) => {
    if (!selectedWarehouse) {
      throw new Error('未选择所属仓库');
    }

    const response = await requestWarehouseMutation('/api/bff/warehouse-bins', {
      body: JSON.stringify(toCreateWarehouseBinPayload(selectedWarehouse.id, formData)),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response, '新增仓位失败');
      showNotice(message, 'error');
      throw new Error(message);
    }

    setCreateBinDialogOpen(false);
    binState.reload();
    allBinsState.reload();
    showNotice('新增仓位成功', 'success');
  };

  const handleUpdateBin = async (formData: WarehouseBinFormData) => {
    if (!selectedBin) {
      throw new Error('未选择要编辑的仓位');
    }

    const response = await requestWarehouseMutation(
      `/api/bff/warehouse-bins/${selectedBin.id}`,
      {
        body: JSON.stringify(toUpdateWarehouseBinPayload(formData)),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response, '更新仓位失败');
      showNotice(message, 'error');
      throw new Error(message);
    }

    setEditBinDialogOpen(false);
    binState.reload();
    allBinsState.reload();
    showNotice('更新仓位成功', 'success');
  };

  const handleDeleteBin = async () => {
    if (!selectedBin) {
      showNotice('未选择要删除的仓位', 'error');
      return;
    }

    setDeleteBinLoading(true);
    const response = await requestWarehouseMutation(
      `/api/bff/warehouse-bins/${selectedBin.id}`,
      {
        method: 'DELETE',
      },
    );
    setDeleteBinLoading(false);

    if (!response.ok) {
      const message = await extractErrorMessage(response, '删除仓位失败');
      showNotice(message, 'error');
      return;
    }

    setDeleteBinDialogOpen(false);
    setSelectedBin(null);
    binState.reload();
    allBinsState.reload();
    showNotice('删除仓位成功', 'success');
  };

  return (
    <>
      <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-8 pb-20 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">
              仓库管理
            </h1>
            <p className="mt-2 text-[13px] text-muted">
              仓库 · 仓位主数据 canonical 视图
            </p>
          </div>

          <button
            className="inline-flex h-10 items-center gap-2 bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            onClick={() => setCreateDialogOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            新建仓库
          </button>
        </div>

        {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}

        <form className="w-full border border-border bg-white p-2" onSubmit={handleSearchSubmit}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full bg-transparent pl-10 pr-24 text-sm font-['var(--font-space-grotesk)'] outline-none placeholder:text-muted"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="搜索仓库编号、名称、地址..."
              value={draftQuery}
            />
            <button
              className="absolute right-2 top-1/2 h-8 -translate-y-1/2 border border-border px-3 text-xs font-bold uppercase tracking-wide"
              type="submit"
            >
              搜索
            </button>
          </div>
        </form>

        {error ? (
          <div className="border border-[#E7B9B9] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B54A4A]">
            {error.message}
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="flex min-h-0 flex-col overflow-hidden border border-border bg-white shadow-sm">
            <div className="grid grid-cols-[160px_160px_110px_1fr_120px_100px_90px] items-center border-b border-border bg-[#FDFCFB] px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted">
              <div>仓库编号</div>
              <div>仓库名称</div>
              <div>库位模式</div>
              <div>地址</div>
              <div>联系人</div>
              <div className="text-center">仓位数量</div>
              <div className="text-center">状态</div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="px-6 py-8 text-sm text-muted">加载仓库列表中...</div>
              ) : data.length === 0 ? (
                <div className="px-6 py-8 text-sm text-muted">当前筛选条件下没有仓库数据。</div>
              ) : (
                data.map((warehouse) => {
                  const isSelected = warehouse.id === selectedWarehouse?.id;
                  const binCount = binCountByWarehouse[warehouse.id] ?? 0;

                  return (
                    <button
                      key={warehouse.id}
                      className={`grid w-full grid-cols-[160px_160px_110px_1fr_120px_100px_90px] items-center border-b border-border px-6 py-4 text-left transition-colors ${
                        isSelected ? 'bg-[#F6F2EA]' : 'hover:bg-background/50'
                      }`}
                      onClick={() => setSelectedId(warehouse.id)}
                      type="button"
                    >
                      <div className="font-mono text-sm font-medium italic text-[#C05A3C]">
                        {warehouse.code}
                      </div>
                      <div className="truncate pr-4 text-[14px] font-bold text-[#1a1a1a]">
                        {warehouse.name}
                      </div>
                      <div className="text-sm text-muted">
                        {warehouse.supportsBinManagement ? '库位仓' : '平面仓'}
                      </div>
                      <div className="truncate pr-4 text-[13px] text-muted">
                        {warehouse.address || '-'}
                      </div>
                      <div className="text-[13px] font-bold text-[#1a1a1a]">
                        {warehouse.contactName || '-'}
                      </div>
                      <div className="text-center font-mono text-[15px] font-bold text-[#22C55E]">
                        {warehouse.supportsBinManagement ? binCount : '--'}
                      </div>
                      <div className="text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${
                            warehouse.status === 'disabled'
                              ? 'bg-[#F4F4F4] text-muted'
                              : warehouse.status === 'warning'
                                ? 'bg-[#FFF8E8] text-[#C0841A]'
                                : 'bg-[#F6FFF8] text-[#22C55E]'
                          }`}
                        >
                          {warehouseStatusLabel(warehouse.status)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {pagination.total > 0 ? (
              <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted">
                <span>共 {pagination.total} 个仓库</span>
                <div className="flex gap-1">
                  {pages.map((page) => (
                    <button
                      key={page}
                      className={`min-w-8 border px-2 py-1 ${
                        page === pagination.page
                          ? 'border-primary bg-primary text-white'
                          : 'border-border'
                      }`}
                      onClick={() => updateParams({ page }, { replace: true })}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col border border-border bg-white shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted">
                    仓库详情
                  </div>
                  <h2 className="mt-2 text-xl font-bold">
                    {warehouseDetail ? warehouseDetail.name : '请选择仓库'}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {warehouseDetail
                      ? `${warehouseDetail.code} · ${
                          warehouseDetail.address || '未填写地址'
                        }`
                      : '选择左侧仓库后查看仓位'}
                  </p>
                </div>

                {warehouseDetail ? (
                  <button
                    className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-bold transition-colors hover:bg-background/50"
                    onClick={() => {
                      setEditInitialData(toWarehouseFormData(warehouseDetail));
                      setEditDialogOpen(true);
                    }}
                    type="button"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    编辑
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto p-5">
              {warehouseDetail ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailStat
                      label="仓库状态"
                      value={warehouseStatusLabel(warehouseDetail.status)}
                    />
                    <DetailStat
                      label="库位模式"
                      value={
                        warehouseDetail.supportsBinManagement
                          ? '启用仓位管理'
                          : '未启用仓位管理'
                      }
                    />
                    <DetailStat label="联系人" value={warehouseDetail.contactName || '-'} />
                    <DetailStat label="联系电话" value={warehouseDetail.phone || '-'} />
                  </div>

                  <div className="border border-border bg-[#FDFCFB] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">仓位清单</div>
                        <div className="mt-1 text-xs text-muted">
                          {warehouseDetail.supportsBinManagement
                            ? '选中仓库下的全部仓位，可直接维护'
                            : '当前仓库未启用仓位管理'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted">
                          {binState.loading ? '加载中...' : `${binState.data.length} 个仓位`}
                        </div>
                        {warehouseDetail.supportsBinManagement ? (
                          <button
                            className="inline-flex h-8 items-center gap-1 border border-border bg-white px-3 text-xs font-bold transition-colors hover:bg-background/50"
                            onClick={() => setCreateBinDialogOpen(true)}
                            type="button"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            新增仓位
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {!warehouseDetail.supportsBinManagement ? (
                        <div className="border border-dashed border-border px-3 py-4 text-sm text-muted">
                          该仓库当前未启用仓位管理。
                        </div>
                      ) : binState.error ? (
                        <div className="border border-[#E7B9B9] bg-[#FFF5F5] px-3 py-3 text-sm text-[#B54A4A]">
                          {binState.error.message}
                        </div>
                      ) : binState.data.length === 0 ? (
                        <div className="border border-dashed border-border px-3 py-4 text-sm text-muted">
                          暂无仓位数据。
                        </div>
                      ) : (
                        binState.data.map((bin) => (
                          <div
                            key={bin.id}
                            className="grid grid-cols-[110px_1fr_90px_72px] items-center gap-3 border border-border bg-white px-3 py-3 text-sm"
                          >
                            <div className="font-mono text-[#C05A3C]">{bin.code}</div>
                            <div>
                              <div className="font-medium">{bin.name}</div>
                              <div className="text-xs text-muted">
                                {bin.zoneCode || '-'} · {warehouseBinTypeLabel(bin.binType)}
                              </div>
                            </div>
                            <div className="text-right text-xs font-bold text-muted">
                              {warehouseStatusLabel(bin.status)}
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="inline-flex h-8 items-center gap-1 border border-border bg-white px-2 text-xs font-bold transition-colors hover:bg-background/50"
                                onClick={() => {
                                  setSelectedBin(bin);
                                  setEditBinInitialData(toWarehouseBinFormData(bin));
                                  setEditBinDialogOpen(true);
                                }}
                                type="button"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                编辑
                              </button>
                              <button
                                className="inline-flex h-8 items-center gap-1 border border-[#E7B9B9] bg-white px-2 text-xs font-bold text-[#B54A4A] transition-colors hover:bg-[#FFF5F5]"
                                onClick={() => {
                                  setSelectedBin(bin);
                                  setDeleteBinDialogOpen(true);
                                }}
                                type="button"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                删除
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted">当前没有可展示的仓库。</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <WarehouseForm
        mode="create"
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        open={createDialogOpen}
      />

      <WarehouseForm
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

      <WarehouseBinForm
        mode="create"
        onOpenChange={setCreateBinDialogOpen}
        onSubmit={handleCreateBin}
        open={createBinDialogOpen}
      />

      <WarehouseBinForm
        initialData={editBinInitialData}
        mode="edit"
        onOpenChange={(open) => {
          setEditBinDialogOpen(open);
          if (!open) {
            setEditBinInitialData(undefined);
            setSelectedBin(null);
          }
        }}
        onSubmit={handleUpdateBin}
        open={editBinDialogOpen}
      />

      <DeleteConfirmDialog
        description={
          selectedBin
            ? `将删除仓位「${selectedBin.code} / ${selectedBin.name}」，此操作无法撤销。`
            : '此操作无法撤销。'
        }
        loading={deleteBinLoading}
        onConfirm={handleDeleteBin}
        onOpenChange={setDeleteBinDialogOpen}
        open={deleteBinDialogOpen}
        title="确认删除仓位"
      />
    </>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-[#FDFCFB] px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-sm font-bold">{value}</div>
    </div>
  );
}

function InlineNotice({ message, tone }: { message: string; tone: Notice['tone'] }) {
  return (
    <div
      className={`border px-4 py-3 text-sm ${
        tone === 'success'
          ? 'border-[#B6D7BD] bg-[#F2FBF4] text-[#2E7D32]'
          : 'border-[#E7B9B9] bg-[#FFF5F5] text-[#B54A4A]'
      }`}
    >
      {message}
    </div>
  );
}

function warehouseStatusLabel(status: Warehouse['status'] | WarehouseBin['status']) {
  if (status === 'disabled') {
    return '停用';
  }

  if (status === 'warning') {
    return '预警';
  }

  return '启用';
}

function warehouseBinTypeLabel(binType: string | null | undefined) {
  switch (binType) {
    case 'pick':
      return '拣货位';
    case 'reserve':
      return '储备位';
    case 'staging':
      return '暂存位';
    case 'qc':
      return '质检位';
    case 'return':
      return '退货位';
    default:
      return '-';
  }
}

function toWarehouseFormData(warehouse: Warehouse): WarehouseFormData {
  return {
    address: warehouse.address ?? '',
    code: warehouse.code,
    contactName: warehouse.contactName ?? '',
    manageBin: warehouse.supportsBinManagement,
    name: warehouse.name,
    phone: warehouse.phone ?? '',
    status: warehouse.status === 'disabled' ? 'disabled' : 'normal',
  };
}

function toCreateWarehousePayload(formData: WarehouseFormData) {
  return {
    address: formData.address?.trim() || null,
    code: formData.code.trim(),
    contactPerson: formData.contactName?.trim() || null,
    contactPhone: formData.phone?.trim() || null,
    manageBin: formData.manageBin,
    name: formData.name.trim(),
  };
}

function toUpdateWarehousePayload(formData: WarehouseFormData) {
  return {
    address: formData.address?.trim() || null,
    contactPerson: formData.contactName?.trim() || null,
    contactPhone: formData.phone?.trim() || null,
    manageBin: formData.manageBin,
    name: formData.name.trim(),
    isActive: formData.status !== 'disabled',
  };
}

function toWarehouseBinFormData(bin: WarehouseBin): WarehouseBinFormData {
  return {
    binType: bin.binType ?? '',
    code: bin.code,
    name: bin.name,
    status: bin.status === 'disabled' ? 'disabled' : 'normal',
    zoneCode: bin.zoneCode ?? '',
  };
}

function toCreateWarehouseBinPayload(
  warehouseId: string,
  formData: WarehouseBinFormData,
) {
  return {
    warehouseId,
    code: formData.code.trim(),
    name: formData.name.trim(),
    zoneCode: formData.zoneCode?.trim() || null,
    binType: formData.binType?.trim() || null,
    status: formData.status,
  };
}

function toUpdateWarehouseBinPayload(formData: WarehouseBinFormData) {
  return {
    name: formData.name.trim(),
    zoneCode: formData.zoneCode?.trim() || null,
    binType: formData.binType?.trim() || null,
    status: formData.status,
  };
}

async function requestWarehouseMutation(input: RequestInfo | URL, init: RequestInit) {
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

async function parseWarehouseResponse(response: Response): Promise<Warehouse | null> {
  try {
    const payload = (await response.json()) as Warehouse | { data?: Warehouse };

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data ?? null;
    }

    return isWarehousePayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

async function fetchWarehouseDetail(id: string): Promise<Warehouse | null> {
  try {
    const response = await fetch(`/api/bff/warehouses/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return parseWarehouseResponse(response);
  } catch {
    return null;
  }
}

async function fetchWarehouseBinDetail(id: string): Promise<WarehouseBin | null> {
  try {
    const response = await fetch(`/api/bff/warehouse-bins/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WarehouseBin | { data?: WarehouseBin };

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data ?? null;
    }

    return (
      typeof payload === 'object' &&
      payload !== null &&
      typeof (payload as { id?: unknown }).id === 'string'
    )
      ? (payload as WarehouseBin)
      : null;
  } catch {
    return null;
  }
}
