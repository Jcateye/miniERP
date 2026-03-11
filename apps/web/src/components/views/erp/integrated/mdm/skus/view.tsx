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

const PAGE_SIZE = 5;
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

const SKU_ROWS = [
  {
    code: 'CAB-HDMI-2M',
    name: 'HDMI 高清视频线 2米',
    desc: '2.0 / 编织外被 / 镀金',
    cat: '线材',
    supp: '金源科技',
    warehouse: '深圳 A 仓',
    stock: 342,
    threshold: 50,
    status: '正常',
    supplierSku: 'JY-HDMI-2M',
    activities: [
      { color: 'bg-[#549363]', label: '入库 +20 (GRN-2026-0140)', time: '2026-02-27 16:30' },
      { color: 'bg-primary', label: '出库 -5 (OUT-2026-0089)', time: '2026-02-25 10:15' },
    ],
  },
  {
    code: 'CON-RJ45-CAT6',
    name: 'RJ45 水晶头 CAT6',
    desc: '超六类 / 纯铜 / 50个一包',
    cat: '连接器',
    supp: '宏发制造',
    warehouse: '青岛 B 仓',
    stock: 12,
    threshold: 100,
    status: '补货',
    supplierSku: 'HF-RJ45-6',
    activities: [
      { color: 'bg-primary', label: '安全库存告警触发', time: '2026-03-01 09:00' },
      { color: 'bg-[#548093]', label: '调拨 +10 (TRF-2026-011)', time: '2026-02-28 11:20' },
    ],
  },
  {
    code: 'ADP-USBC-VGA',
    name: 'USB-C 转 VGA 转换器',
    desc: '1080P / 铝合金 / 15cm',
    cat: '转换器',
    supp: '鸿鹏电子',
    warehouse: '深圳 A 仓',
    stock: 80,
    threshold: 30,
    status: '正常',
    supplierSku: 'SZ-VGA-80A',
    activities: [
      { color: 'bg-[#549363]', label: '入库 +20 (GRN-2026-0140)', time: '2026-02-27 16:30' },
      { color: 'bg-primary', label: '出库 -5 (OUT-2026-0089)', time: '2026-02-25 10:15' },
      { color: 'bg-[#548093]', label: '盘点 +2 (ST-2026-0012)', time: '2026-01-15 09:00' },
    ],
  },
  {
    code: 'PWR-65W-PD',
    name: '65W PD 快充电源适配器',
    desc: '氮化镓 / 2C1A / 白色中规',
    cat: '电源',
    supp: '立讯精密',
    warehouse: '深圳 A 仓',
    stock: 560,
    threshold: 120,
    status: '正常',
    supplierSku: 'LX-PD-65W',
    activities: [{ color: 'bg-[#549363]', label: '补货完成 +120', time: '2026-02-22 18:10' }],
  },
  {
    code: 'HUB-USB3-7P',
    name: 'USB 3.0 七口集线器',
    desc: '带独立开关 / 12V电源 / 铝壳',
    cat: '扩展坞',
    supp: '未知供应',
    warehouse: '苏州 周转仓',
    stock: 0,
    threshold: 20,
    status: '下架',
    supplierSku: 'N/A',
    activities: [{ color: 'bg-muted', label: '状态变更为下架', time: '2026-02-20 14:08' }],
  },
  {
    code: 'CBL-DP-1M',
    name: 'DisplayPort 视频线 1米',
    desc: '8K / 镀金 / 黑色',
    cat: '线材',
    supp: '金源科技',
    warehouse: '青岛 B 仓',
    stock: 46,
    threshold: 40,
    status: '正常',
    supplierSku: 'JY-DP-1M',
    activities: [{ color: 'bg-[#549363]', label: '入库 +12 (GRN-2026-0091)', time: '2026-02-19 09:22' }],
  },
  {
    code: 'BAT-AA-4P',
    name: 'AA 碱性电池 4 节装',
    desc: '1.5V / 长效版',
    cat: '电源',
    supp: '宏发制造',
    warehouse: '深圳 A 仓',
    stock: 25,
    threshold: 60,
    status: '补货',
    supplierSku: 'HF-AA-4P',
    activities: [{ color: 'bg-primary', label: '低库存预警', time: '2026-02-18 07:50' }],
  },
  {
    code: 'DOCK-TB4-MINI',
    name: 'Thunderbolt 4 扩展坞',
    desc: '双 4K / 千兆网口 / 90W 回充',
    cat: '扩展坞',
    supp: '鸿鹏电子',
    warehouse: '苏州 周转仓',
    stock: 18,
    threshold: 15,
    status: '正常',
    supplierSku: 'HP-TB4-M',
    activities: [{ color: 'bg-[#548093]', label: '调拨入库 +8', time: '2026-02-17 13:10' }],
  },
] as const;

type SkuRow = (typeof SKU_ROWS)[number];
type SkuSortField = 'cat' | 'code' | 'name' | 'status' | 'stock' | 'supp' | 'threshold';

export default function SkuList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const [draftQuery, setDraftQuery] = React.useState(params.q);
  const [selectedCode, setSelectedCode] = React.useState('ADP-USBC-VGA');

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  const filteredRows = React.useMemo(() => {
    const keyword = params.q.trim().toLowerCase();
    const sortField = (params.sort as SkuSortField) || 'code';
    const sortOrder = params.order === 'desc' ? 'desc' : 'asc';

    return SKU_ROWS.filter((row) => {
      if (params.category && row.cat !== params.category) {
        return false;
      }

      if (params.status && row.status !== params.status) {
        return false;
      }

      if (params.warehouse && row.warehouse !== params.warehouse) {
        return false;
      }

      if (params.supplier && row.supp !== params.supplier) {
        return false;
      }

      if (params.lowStock === '1' && row.stock > row.threshold) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [row.code, row.name, row.desc, row.cat, row.supp].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    }).toSorted((left, right) => compareSkus(left, right, sortField, sortOrder));
  }, [
    params.category,
    params.lowStock,
    params.order,
    params.q,
    params.sort,
    params.status,
    params.supplier,
    params.warehouse,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(parsePageParam(params.page), totalPages);

  React.useEffect(() => {
    const rawPage = parsePageParam(params.page);

    if (rawPage !== currentPage) {
      updateParams({ page: String(currentPage) }, { replace: true });
    }
  }, [currentPage, params.page, updateParams]);

  const pageRows = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  React.useEffect(() => {
    if (!pageRows.length) {
      return;
    }

    if (!pageRows.some((row) => row.code === selectedCode)) {
      setSelectedCode(pageRows[0].code);
    }
  }, [pageRows, selectedCode]);

  const selectedSku =
    pageRows.find((row) => row.code === selectedCode) ?? pageRows[0] ?? filteredRows[0] ?? SKU_ROWS[0];

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: SkuSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'asc';

    updateParams({ order: nextOrder, sort: field });
  };

  const pageNumbers = buildPagination(currentPage, totalPages);
  const rangeStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = filteredRows.length === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, filteredRows.length);

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
                onClick={() =>
                  updateParams({
                    category: '',
                    lowStock: '',
                    page: '1',
                    q: '',
                    status: '',
                    supplier: '',
                    warehouse: '',
                  })
                }
                type="button"
              >
                清除筛选
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-2 h-full min-h-0">
        <div className="flex-1 bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden min-w-[700px]">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">共 {filteredRows.length.toLocaleString('zh-CN')} 个 SKU</span>
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
            {pageRows.map((row) => (
              <TableRow
                key={row.code}
                isActive={row.code === selectedSku.code}
                onClick={() => setSelectedCode(row.code)}
                row={row}
              />
            ))}
            {pageRows.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted">没有匹配的 SKU 记录。</div>
            ) : null}
          </div>

          <div className="p-3 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted">显示 {rangeStart} 到 {rangeEnd} / 共 {filteredRows.length} 条</span>
            <div className="flex gap-1">
              <button
                className="px-3 h-8 border border-border flex items-center justify-center bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                type="button"
              >
                上一页
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 border flex items-center justify-center text-xs ${
                    page === currentPage
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
                disabled={currentPage === totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                type="button"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <div className="w-[320px] bg-white border border-border flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
            <h2 className="font-bold">快速预览</h2>
            <span className="text-xs text-muted">本地状态</span>
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
      </div>
    </div>
  );
}

function compareSkus(
  left: SkuRow,
  right: SkuRow,
  field: SkuSortField,
  order: 'asc' | 'desc',
) {
  const direction = order === 'asc' ? 1 : -1;

  if (field === 'stock' || field === 'threshold') {
    return (left[field] - right[field]) * direction;
  }

  return String(left[field]).localeCompare(String(right[field]), 'zh-CN') * direction;
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
