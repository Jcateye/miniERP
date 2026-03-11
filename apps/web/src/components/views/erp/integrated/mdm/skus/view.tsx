'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Download,
  Plus,
  Search,
  Settings,
  Upload,
} from 'lucide-react';

import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useSkuList } from '@/lib/hooks/use-sku-list';
import { skuViewMetaByCode, type SkuActivity } from '@/lib/mocks/erp-list-fixtures';

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
  cat: string;
  code: string;
  desc: string;
  name: string;
  status: string;
  stock: number;
  supp: string;
  supplierSku: string;
  threshold: number;
  warehouse: string;
};
type SkuSortField = 'cat' | 'code' | 'name' | 'status' | 'stock' | 'supp' | 'threshold';

export default function SkuList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination } = useSkuList();
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [selectedCode, setSelectedCode] = React.useState('');

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  const pageRows = React.useMemo<SkuRow[]>(
    () =>
      data.flatMap((item) => {
        const meta = skuViewMetaByCode[item.code];
        if (!meta) {
          return [];
        }

        return [{
          activities: meta.activities,
          cat: meta.categoryLabel,
          code: item.code,
          desc: item.specification ?? '-',
          name: item.name,
          status: getSkuStatusLabel(item.status),
          stock: meta.stock,
          supp: meta.supplierName,
          supplierSku: meta.supplierSku,
          threshold: meta.threshold,
          warehouse: meta.warehouseLabel,
        }];
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
      setSelectedCode('');
      return;
    }

    if (!pageRows.some((row) => row.code === selectedCode)) {
      setSelectedCode(pageRows[0].code);
    }
  }, [pageRows, selectedCode]);

  const selectedSku = pageRows.find((row) => row.code === selectedCode) ?? pageRows[0];
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

  const totalPages = Math.max(1, pagination.totalPages);
  const pageNumbers = buildPagination(pagination.page, totalPages);
  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = pagination.total === 0 ? 0 : rangeStart + pageRows.length - 1;

  return (
    <div className="p-8 pb-20 sm:p-10 flex flex-col gap-5 h-full">
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">SKU 管理</h1>
          <p className="text-muted mt-1 text-sm">SKU 列表 / 管理及筛选</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-9 px-4 border border-border bg-white flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" /> 导入
          </button>
          <button className="h-9 px-4 border border-border bg-white flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> 导出
          </button>
          <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center gap-2 hover:bg-opacity-90 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> 新增 SKU
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <form className="relative w-full" onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="搜索 SKU 编码、名称、品牌型号、条码..."
            className="w-full h-10 pl-10 pr-24 bg-white border border-border outline-none focus:border-primary transition-colors text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {params.q ? (
              <button
                type="button"
                className="text-xs text-muted hover:text-foreground"
                onClick={() => {
                  setDraftQuery('');
                  updateParams({ page: '1', q: '' });
                }}
              >
                清除
              </button>
            ) : null}
            <button className="h-8 px-3 bg-primary text-white text-xs font-medium rounded-sm" type="submit">
              搜索
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <FilterSelect
            label="类目"
            options={['线材', '连接器', '转换器', '电源', '扩展坞']}
            value={params.category}
            onChange={(value) => updateParams({ category: value, page: '1' })}
          />
          <FilterSelect
            label="状态"
            options={['正常', '补货', '下架']}
            value={params.status}
            onChange={(value) => updateParams({ page: '1', status: value })}
          />
          <FilterSelect
            label="仓库"
            options={['深圳 A 仓', '青岛 B 仓', '苏州 周转仓']}
            value={params.warehouse}
            onChange={(value) => updateParams({ page: '1', warehouse: value })}
          />
          <FilterSelect
            label="供应商"
            options={['金源科技', '宏发制造', '鸿鹏电子', '立讯精密', '未知供应']}
            value={params.supplier}
            onChange={(value) => updateParams({ page: '1', supplier: value })}
          />
          <button
            className={`h-10 px-3 border text-sm font-medium transition-colors ${
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

        <div className="flex justify-between items-center w-full mt-1">
          <div className="flex gap-2 flex-wrap">
            {params.category ? <ActiveChip label={`类目: ${params.category}`} onClear={() => updateParams({ category: '', page: '1' })} /> : null}
            {params.status ? <ActiveChip label={`状态: ${params.status}`} onClear={() => updateParams({ page: '1', status: '' })} /> : null}
            {params.warehouse ? <ActiveChip label={`仓库: ${params.warehouse}`} onClear={() => updateParams({ page: '1', warehouse: '' })} /> : null}
            {params.supplier ? <ActiveChip label={`供应商: ${params.supplier}`} onClear={() => updateParams({ page: '1', supplier: '' })} /> : null}
            {params.lowStock === '1' ? <ActiveChip label="库存告急" onClear={() => updateParams({ lowStock: '', page: '1' })} /> : null}
            {hasFilters(params) ? (
              <button
                className="text-primary text-sm font-medium ml-2 flex items-center"
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
        <div className="flex-1 flex items-center justify-center border border-border bg-white rounded-sm mt-2">
          <div className="text-center px-6 py-12">
            <p className="text-muted text-sm">没有找到匹配的 SKU</p>
            <button className="mt-3 text-primary text-sm font-medium" onClick={clearFilters} type="button">
              清除筛选
            </button>
          </div>
        </div>
      ) : null}

      {!isEmpty ? (
      <div className="flex gap-6 mt-2 h-full min-h-0">
        <div className="flex-1 bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden min-w-[700px]">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">共 {pagination.total.toLocaleString('zh-CN')} 个 SKU</span>
              <span className="text-xs text-muted">
                显示 {rangeStart}-{rangeEnd}
              </span>
            </div>

            <button className="text-muted hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-[40px_160px_1fr_100px_120px_100px_100px_80px_40px] px-4 py-3 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
            <div><input type="checkbox" /></div>
            <div><SortButton active={params.sort === 'code'} direction={params.order} label="SKU 编码" onClick={() => handleSort('code')} /></div>
            <div><SortButton active={params.sort === 'name'} direction={params.order} label="名称 / 规格" onClick={() => handleSort('name')} /></div>
            <div><SortButton active={params.sort === 'cat'} direction={params.order} label="类目" onClick={() => handleSort('cat')} /></div>
            <div><SortButton active={params.sort === 'supp'} direction={params.order} label="默认供应商" onClick={() => handleSort('supp')} /></div>
            <div><SortButton active={params.sort === 'stock'} direction={params.order} label="可用库存" onClick={() => handleSort('stock')} /></div>
            <div><SortButton active={params.sort === 'threshold'} direction={params.order} label="告急阈值" onClick={() => handleSort('threshold')} /></div>
            <div><SortButton active={params.sort === 'status'} direction={params.order} label="状态" onClick={() => handleSort('status')} /></div>
            <div></div>
          </div>

          <div className="overflow-y-auto flex-1 text-sm">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted">加载中...</div>
            ) : null}
            {!loading && error ? (
              <div className="px-4 py-8 text-center text-sm text-red-600">错误: {error.message}</div>
            ) : null}
            {!loading && !error ? pageRows.map((row) => (
              <TableRow
                key={row.code}
                isActive={row.code === selectedSku?.code}
                onClick={() => setSelectedCode(row.code)}
                row={row}
              />
            )) : null}
          </div>

          <div className="p-3 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted">显示 {rangeStart} 到 {rangeEnd} / 共 {pagination.total} 条</span>
            <div className="flex gap-1">
              <button
                className="px-3 h-8 border border-border flex items-center justify-center bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pagination.page === 1 || loading}
                onClick={() => updateParams({ page: String(pagination.page - 1) })}
                type="button"
              >
                上一页
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 border flex items-center justify-center text-xs ${
                    page === pagination.page
                      ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                      : 'border-border bg-white'
                  }`}
                  onClick={() => updateParams({ page: String(page) })}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                className="px-3 h-8 border border-border flex items-center justify-center bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="w-[320px] bg-white border border-border flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
              <h2 className="font-bold">快速预览</h2>
              <span className="text-xs text-muted">BFF Mock</span>
            </div>

            <div className="p-5 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold">{selectedSku.code}</h3>
                <p className="text-sm mt-1 text-muted">{selectedSku.name}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="px-2 py-0.5 border border-border text-xs bg-[#FDFCFB]">{selectedSku.cat}</span>
                  <span className="px-2 py-0.5 border border-border text-xs bg-[#FDFCFB]">{selectedSku.warehouse}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-xs font-medium cursor-pointer">入库单</span>
                <span className="px-3 py-1 bg-[#E8E4DC] border-b-2 border-primary text-xs font-medium cursor-pointer">最近动态</span>
                <span className="px-3 py-1 bg-gray-100 text-xs font-medium cursor-pointer">出库单</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="font-bold text-sm mb-1">可用库存</div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-muted">{selectedSku.warehouse}</span>
                  <span className="font-medium">{selectedSku.stock}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-muted">安全库存</span>
                  <span className="font-medium">{selectedSku.threshold}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm bg-gray-50 px-2 font-bold">
                  <span>状态</span>
                  <span>{selectedSku.status}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <div className="text-xs text-muted">供应商货号/条码</div>
                <div className="text-sm">{selectedSku.supplierSku}</div>

                <div className="text-xs text-muted mt-2">快捷操作</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button className="bg-[#1a1a1a] text-white py-2 text-sm font-medium">去补货</button>
                  <button className="border border-border bg-white py-2 text-sm hover:bg-gray-50 font-medium">去盘点</button>
                  <button className="border border-border bg-white py-2 text-sm hover:bg-gray-50 font-medium col-span-2">去详情页</button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-muted mb-3">最近动态({selectedSku.activities.length}项)</div>
                <div className="flex flex-col gap-3">
                  {selectedSku.activities.map((item) => (
                    <div key={`${selectedSku.code}-${item.label}`} className="flex gap-2">
                      <div className={`w-1.5 h-1.5 rounded-sm mt-1 ${item.color}`} />
                      <div className="text-xs">
                        <div className="font-medium mb-0.5">{item.label}</div>
                        <div className="text-muted">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      ) : null}
    </div>
  );
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
        className="h-10 border border-border bg-white px-3 text-sm outline-none focus:border-primary"
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

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex bg-[#E8E4DC] px-2 py-1 items-center gap-1 rounded-sm text-xs">
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
  row,
}: {
  isActive: boolean;
  onClick: () => void;
  row: SkuRow;
}) {
  const isWarning = row.stock <= row.threshold;
  const isDisabled = row.status === '下架';

  return (
    <button
      className={`grid w-full grid-cols-[40px_160px_1fr_100px_120px_100px_100px_80px_40px] px-4 py-3 border-b border-border items-center text-left ${
        isActive ? 'bg-[#FFF8F6]' : 'hover:bg-gray-50'
      } ${isDisabled ? 'opacity-50' : ''}`}
      onClick={onClick}
      type="button"
    >
      <div><input readOnly type="checkbox" /></div>
      <div className={`font-medium ${isActive ? 'text-primary' : ''} ${isDisabled ? 'line-through text-muted' : ''}`}>{row.code}</div>
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="text-xs text-muted max-w-[200px] truncate">{row.desc}</div>
      </div>
      <div>{row.cat}</div>
      <div>{row.supp}</div>
      <div className={`font-medium font-['var(--font-space-grotesk)'] ${isWarning ? 'text-primary' : ''}`}>{row.stock}</div>
      <div className="text-muted">{row.threshold}</div>
      <div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isWarning ? 'text-primary' : 'text-[#549363]'} ${isDisabled ? 'text-muted' : ''}`}>
          <div className={`w-1.5 h-1.5 rounded-sm ${isWarning ? 'bg-primary' : isDisabled ? 'bg-muted' : 'bg-[#549363]'}`} />
          {row.status}
        </span>
      </div>
      <div className="text-center">
        <ArrowRight className="w-4 h-4 text-muted inline-block" />
      </div>
    </button>
  );
}
