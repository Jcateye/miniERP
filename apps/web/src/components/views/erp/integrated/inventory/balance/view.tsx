'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';

import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';

const PAGE_SIZE = 4;
const DEFAULT_PARAMS = {
  order: 'desc',
  page: '1',
  q: '',
  sort: 'balance',
  stockState: '',
  warehouse: '',
};

const BALANCE_ROWS = [
  { sku: 'RAW-488B-2M', name: 'ROHM 电源稳压管', warehouse: '深圳 A 仓', balance: 320, available: 280, reserved: 40, safe: 50 },
  { sku: 'ADR-LED50-V9A', name: 'LED大灯灯珠模组', warehouse: '青岛 B 仓', balance: 10, available: 10, reserved: 0, safe: 50 },
  { sku: 'CAB-HDMI-2M', name: 'HDMI 高清视频线 2米', warehouse: '深圳 A 仓', balance: 342, available: 300, reserved: 42, safe: 60 },
  { sku: 'CON-RJ45-CAT6', name: 'RJ45 水晶头 CAT6', warehouse: '苏州 周转仓', balance: 18, available: 12, reserved: 6, safe: 100 },
  { sku: 'ADP-USBC-VGA', name: 'USB-C 转 VGA 转换器', warehouse: '青岛 B 仓', balance: 80, available: 72, reserved: 8, safe: 30 },
  { sku: 'PWR-65W-PD', name: '65W PD 快充电源适配器', warehouse: '深圳 A 仓', balance: 560, available: 510, reserved: 50, safe: 120 },
] as const;

type BalanceRow = (typeof BALANCE_ROWS)[number];
type BalanceSortField = 'available' | 'balance' | 'name' | 'safe' | 'sku';

export default function InvBalList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const [draftQuery, setDraftQuery] = React.useState(params.q);

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  const filteredRows = React.useMemo(() => {
    const keyword = params.q.trim().toLowerCase();
    const sortField = (params.sort as BalanceSortField) || 'balance';
    const sortOrder = params.order === 'asc' ? 'asc' : 'desc';

    return BALANCE_ROWS.filter((row) => {
      if (params.warehouse && row.warehouse !== params.warehouse) {
        return false;
      }

      if (params.stockState === 'low' && row.balance >= row.safe) {
        return false;
      }

      if (params.stockState === 'cycle' && row.balance < row.safe) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [row.sku, row.name, row.warehouse].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    }).toSorted((left, right) => compareBalances(left, right, sortField, sortOrder));
  }, [params.order, params.q, params.sort, params.stockState, params.warehouse]);

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

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: BalanceSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'desc';

    updateParams({ order: nextOrder, sort: field });
  };

  const pageNumbers = buildPagination(currentPage, totalPages);
  const rangeStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = filteredRows.length === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  return (
    <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
      <div className="flex justify-between items-start w-full">
        <div>
          <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">库存余额</h1>
          <p className="text-muted mt-1 text-sm">SKU现存量数据查询 · 单库层级盘点</p>
        </div>

        <div className="flex gap-2">
          <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            导出
          </button>
        </div>
      </div>

      <form className="w-full bg-white border border-border p-2" onSubmit={handleSearchSubmit}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="搜索物料编码、型号、仓库..."
            className="w-full h-10 pl-10 pr-24 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
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
              key={warehouse}
              active={params.warehouse === warehouse}
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
            onClick={() => updateParams({ page: '1', stockState: params.stockState === 'low' ? '' : 'low' })}
          />
          <FilterButton
            active={params.stockState === 'cycle'}
            label="推荐盘点"
            onClick={() => updateParams({ page: '1', stockState: params.stockState === 'cycle' ? '' : 'cycle' })}
          />
        </div>
      </div>

      <div className="flex justify-between items-center w-full mt-2">
        <div className="text-xs text-muted">
          当前筛选: {params.warehouse || '全部仓库'} / {params.stockState === 'low' ? '低于安全库存' : params.stockState === 'cycle' ? '推荐盘点' : '全部'}
        </div>
        <div className="text-xs text-muted flex items-center gap-2">
          共 {filteredRows.length} 条 · 显示 {rangeStart}-{rangeEnd}
        </div>
      </div>

      <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
        <div className="grid grid-cols-[160px_200px_100px_100px_100px_100px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
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
        </div>

        <div className="flex flex-col text-sm bg-white overflow-y-auto">
          {pageRows.map((row) => {
            const lowStock = row.balance < row.safe;

            return (
              <div key={`${row.sku}-${row.warehouse}`} className="grid grid-cols-[160px_200px_100px_100px_100px_100px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">{row.sku}</div>
                <div className="font-medium truncate pr-4">{row.name}</div>
                <div className="font-['var(--font-space-grotesk)']">{row.warehouse}</div>
                <div className={`font-['var(--font-space-grotesk)'] font-bold text-right ${lowStock ? 'text-primary' : ''}`}>{row.balance}</div>
                <div className="font-['var(--font-space-grotesk)'] text-right">{row.available}</div>
                <div className="font-['var(--font-space-grotesk)'] text-right">{row.reserved}</div>
                <div className="font-['var(--font-space-grotesk)'] text-right text-muted">{row.safe}</div>
                <div className="text-center">
                  <span className={lowStock ? 'bg-[#FFF8F6] text-primary px-2 py-0.5 text-xs font-medium border-transparent border' : 'bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium border-transparent border'}>
                    {lowStock ? '缺货警示' : '正常'}
                  </span>
                </div>
              </div>
            );
          })}
          {pageRows.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted">没有匹配的库存余额记录。</div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
          <span className="text-muted">排序字段: {getSortLabel(params.sort as BalanceSortField)} / {params.order === 'asc' ? '升序' : '降序'}</span>
          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 border border-border bg-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => updateParams({ page: String(currentPage - 1) })}
              type="button"
            >
              上一页
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`px-3 py-1 border text-xs ${
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
              className="px-3 py-1 border border-border bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
  );
}

function compareBalances(
  left: BalanceRow,
  right: BalanceRow,
  field: BalanceSortField,
  order: 'asc' | 'desc',
) {
  const direction = order === 'asc' ? 1 : -1;

  if (field === 'balance' || field === 'available' || field === 'safe') {
    return (left[field] - right[field]) * direction;
  }

  return String(left[field]).localeCompare(String(right[field]), 'zh-CN') * direction;
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

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={active ? 'bg-[#1a1a1a] text-white px-4 py-1.5 font-medium shadow-sm' : 'bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors'}
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
