'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Download, Search } from 'lucide-react';

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

export default function InventoryLedgerPage() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = useInventoryLedger();
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

  const handleSort = (field: LedgerSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'desc';

    updateParams({ order: nextOrder, sort: field });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">库存流水</h1>
          <p className="text-sm text-muted mt-1">Inventory Ledger - 全量流水审计</p>
        </div>
        <button className="bg-white border border-border text-foreground px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-background transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          导出
        </button>
      </div>

      <form className="flex items-center gap-3" onSubmit={handleSearchSubmit}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="搜索 SKU、仓库、单据号..."
            className="w-full pl-10 pr-24 py-2 bg-white border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
            <button className="h-7 px-3 bg-primary text-white text-xs font-medium rounded-sm" type="submit">
              搜索
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={!params.type} label="全部类型" onClick={() => updateParams({ page: '1', type: '' })} />
          {['入库', '出库', '调拨', '盘点'].map((type) => (
            <FilterButton
              key={type}
              active={params.type === type}
              label={type}
              onClick={() => updateParams({ page: '1', type: params.type === type ? '' : type })}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={!params.warehouse} label="全部仓库" onClick={() => updateParams({ page: '1', warehouse: '' })} />
          {['深圳总仓', '青岛 B 仓', '苏州周转仓'].map((warehouse) => (
            <FilterButton
              key={warehouse}
              active={params.warehouse === warehouse}
              label={warehouse}
              onClick={() => updateParams({ page: '1', warehouse: params.warehouse === warehouse ? '' : warehouse })}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-sm overflow-hidden mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'date'} direction={params.order} label="日期" onClick={() => handleSort('date')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'skuId'} direction={params.order} label="物料编号" onClick={() => handleSort('skuId')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'warehouse'} direction={params.order} label="仓库" onClick={() => handleSort('warehouse')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'type'} direction={params.order} label="业务类型" onClick={() => handleSort('type')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">方向</th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">
                <SortButton active={params.sort === 'balance'} direction={params.order} label="余额" onClick={() => handleSort('balance')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">来源单据</th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">操作人</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted" colSpan={8}>
                  加载库存流水中...
                </td>
              </tr>
            ) : null}
            {!loading && error ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-primary" colSpan={8}>
                  <p>库存流水加载失败：{error.message}</p>
                  <button className="mt-3 text-sm font-medium underline underline-offset-4" onClick={reload} type="button">
                    重试
                  </button>
                </td>
              </tr>
            ) : null}
            {!loading && !error && data.map((item) => (
              <LedgerTableRow key={`${item.date}-${item.source}`} item={item} />
            ))}
            {!loading && !error && data.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-muted" colSpan={8}>
                  没有匹配的库存流水记录。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted">
            显示 {rangeStart}-{rangeEnd} / 共 {pagination.total} 条
          </span>
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

function LedgerTableRow({ item }: { item: InventoryLedgerListItem }) {
  return (
    <tr className="hover:bg-background/50 transition-colors group text-sm">
      <td className="px-4 py-4 text-muted font-mono whitespace-nowrap">{item.date}</td>
      <td className="px-4 py-4 font-bold text-primary italic">{item.skuId}</td>
      <td className="px-4 py-4 text-foreground">{item.warehouse}</td>
      <td className="px-4 py-4 font-bold">{item.type}</td>
      <td className={`px-4 py-4 text-right font-bold ${item.direction.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        {item.direction}
      </td>
      <td className="px-4 py-4 text-right font-mono font-bold">{item.balance}</td>
      <td className="px-4 py-4 text-primary cursor-pointer hover:underline">{item.source}</td>
      <td className="px-4 py-4 text-foreground">{item.operator}</td>
    </tr>
  );
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
