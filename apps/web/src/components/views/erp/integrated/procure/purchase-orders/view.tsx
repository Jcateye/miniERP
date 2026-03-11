'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';

import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { usePurchaseOrders } from '@/lib/hooks/use-purchase-orders';
import type { PurchaseOrderListItem } from '@/lib/mocks/erp-list-fixtures';

const DEFAULT_PARAMS = {
  order: 'desc',
  page: '1',
  q: '',
  sort: 'date',
  status: '',
};

type PurchaseOrderSortField = 'amount' | 'date' | 'po' | 'skuCount' | 'supplier';

export default function PoManage() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination, reload } = usePurchaseOrders();
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

  const handleSort = (field: PurchaseOrderSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'desc';

    updateParams({ order: nextOrder, sort: field });
  };

  return (
    <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto relative w-full">
      <div className="flex justify-between items-start w-full">
        <div>
          <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">采购单管理</h1>
          <p className="text-muted mt-1 text-sm">采购单、物流及工作台</p>
        </div>

        <div className="flex gap-2">
          <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            导入
          </button>
          <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            导出
          </button>
          <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
            新建采购单
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
            placeholder="搜索 PO 编号、供应商名称、SKU..."
            className="w-full h-10 pl-10 pr-24 text-sm outline-none placeholder:text-muted bg-transparent border border-transparent focus:border-border transition-colors font-['var(--font-space-grotesk)']"
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

      <div className="flex justify-between items-center w-full mt-2">
        <div className="flex flex-wrap gap-2 text-sm">
          <FilterButton active={!params.status} label="全部" onClick={() => updateParams({ page: '1', status: '' })} />
          {['草稿', '待审批', '待收货', '已完成'].map((status) => (
            <FilterButton
              key={status}
              active={params.status === status}
              label={status}
              onClick={() => updateParams({ page: '1', status: params.status === status ? '' : status })}
            />
          ))}
        </div>
        <div className="text-xs text-muted flex items-center gap-2">
          共 {pagination.total} 个 PO · 显示 {rangeStart}-{rangeEnd}
        </div>
      </div>

      <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
        <div className="grid grid-cols-[140px_200px_100px_120px_80px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
          <div>
            <SortButton active={params.sort === 'po'} direction={params.order} label="PO 编号" onClick={() => handleSort('po')} />
          </div>
          <div>
            <SortButton active={params.sort === 'supplier'} direction={params.order} label="供应商" onClick={() => handleSort('supplier')} />
          </div>
          <div>
            <SortButton active={params.sort === 'date'} direction={params.order} label="下单日期" onClick={() => handleSort('date')} />
          </div>
          <div>
            <SortButton active={params.sort === 'amount'} direction={params.order} label="金额" onClick={() => handleSort('amount')} />
          </div>
          <div className="text-center">
            <SortButton active={params.sort === 'skuCount'} direction={params.order} label="SKU数" onClick={() => handleSort('skuCount')} />
          </div>
          <div className="text-center">状态</div>
          <div className="text-center">操作</div>
        </div>

        <div className="flex flex-col text-sm bg-white overflow-y-auto">
          {loading ? (
            <div className="px-6 py-8 text-center text-sm text-muted">加载采购单中...</div>
          ) : null}
          {!loading && error ? (
            <div className="px-6 py-8 text-center text-sm text-primary">
              <p>采购单加载失败：{error.message}</p>
              <button className="mt-3 text-sm font-medium underline underline-offset-4" onClick={reload} type="button">
                重试
              </button>
            </div>
          ) : null}
          {!loading && !error && data.map((row) => (
            <PurchaseOrderTableRow key={row.po} row={row} />
          ))}
          {!loading && !error && data.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted">没有匹配的采购单。</div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
          <span className="text-muted">
            排序字段: {getSortLabel(params.sort as PurchaseOrderSortField)} / {params.order === 'asc' ? '升序' : '降序'}
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

function getSortLabel(field: PurchaseOrderSortField) {
  switch (field) {
    case 'amount':
      return '金额';
    case 'po':
      return 'PO 编号';
    case 'skuCount':
      return 'SKU数';
    case 'supplier':
      return '供应商';
    default:
      return '下单日期';
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

function PurchaseOrderTableRow({ row }: { row: PurchaseOrderListItem }) {
  const statusType =
    row.status === '已完成' ? 'success' : row.status === '待收货' ? 'warning' : row.status === '待审批' ? 'info' : 'default';

  return (
    <div className="grid grid-cols-[140px_200px_100px_120px_80px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
      <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">{row.po}</div>
      <div className="font-medium truncate pr-4">{row.supplier}</div>
      <div className="font-['var(--font-space-grotesk)'] text-muted">{row.date}</div>
      <div className="font-['var(--font-space-grotesk)'] font-medium">¥{row.amount.toLocaleString('zh-CN')}.00</div>
      <div className="text-center font-['var(--font-space-grotesk)']">{row.skuCount}</div>
      <div className="text-center">
        <span className={`px-2 py-0.5 text-xs font-medium border ${getStatusColor(statusType)}`}>
          {row.status}
        </span>
      </div>
      <div className="text-center text-muted tracking-widest cursor-pointer hover:text-foreground text-lg leading-none">...</div>
    </div>
  );
}

function getStatusColor(type: 'default' | 'info' | 'success' | 'warning') {
  switch (type) {
    case 'success':
      return 'bg-[#EAF3EB] text-[#549363] border-transparent';
    case 'warning':
      return 'bg-[#FFF8F6] text-primary border-transparent';
    case 'info':
      return 'bg-[#F2F5FF] text-[#3D63DD] border-transparent';
    default:
      return 'bg-gray-100 text-gray-600 border-transparent';
  }
}
