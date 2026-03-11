'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';

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

export default function InvBalList() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useInventoryBalance();
  const [draftQuery, setDraftQuery] = React.useState(params.q);

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

  return (
    <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
      <div className="flex justify-between items-start w-full">
        <div>
          <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">库存余额</h1>
          <p className="text-muted mt-1 text-sm">SKU 现存量数据查询 · 单库层级盘点</p>
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
          共 {pagination.total} 条 · 显示 {rangeStart}-{rangeEnd}
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
          {!loading && !error && data.map((row) => (
            <BalanceRow key={`${row.sku}-${row.warehouse}`} row={row} />
          ))}
          {!loading && !error && data.length === 0 ? (
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

function BalanceRow({ row }: { row: InventoryBalanceListItem }) {
  const lowStock = row.balance < row.safe;

  return (
    <div className="grid grid-cols-[160px_200px_100px_100px_100px_100px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
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
      className={active ? 'bg-[#1a1a1a] text-white px-3 py-1.5 text-sm font-medium shadow-sm' : 'bg-white border border-border text-foreground px-3 py-1.5 text-sm hover:bg-gray-50 shadow-sm transition-colors'}
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
