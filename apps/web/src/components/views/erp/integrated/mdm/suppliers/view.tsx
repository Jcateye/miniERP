'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Plus, Search } from 'lucide-react';

import { parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';
import { useSupplierList } from '@/lib/hooks/use-supplier-list';
import { supplierViewMetaByCode } from '@/lib/mocks/erp-list-fixtures';

const DEFAULT_PARAMS = {
  order: 'asc',
  page: '1',
  q: '',
  sort: 'id',
};

type SupplierSortField = 'contact' | 'id' | 'name' | 'orders' | 'status';
type SupplierRow = {
  cert: string;
  contact: string;
  id: string;
  name: string;
  orders: number;
  status: string;
};

export default function SuppliersPage() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const { data, error, loading, pagination } = useSupplierList();
  const [draftQuery, setDraftQuery] = React.useState(params.q);

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  React.useEffect(() => {
    if (loading) {
      return;
    }

    const rawPage = parsePageParam(params.page);
    if (pagination.page !== rawPage) {
      updateParams({ page: String(pagination.page) }, { replace: true });
    }
  }, [loading, pagination.page, params.page, updateParams]);

  const pageRows = React.useMemo<SupplierRow[]>(
    () =>
      data.map((item) => {
        const meta = supplierViewMetaByCode[item.code];

        return {
          cert: meta?.cert ?? '-',
          contact: item.contactName ?? '-',
          id: item.code,
          name: item.name,
          orders: meta?.orders ?? 0,
          status: getStatusLabel(item.status),
        };
      }),
    [data],
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: SupplierSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'asc';

    updateParams({ order: nextOrder, sort: field });
  };

  const totalPages = Math.max(1, pagination.totalPages);
  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = pagination.total === 0 ? 0 : rangeStart + pageRows.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">供应商管理</h1>
          <p className="text-sm text-muted mt-1">Suppliers - 供应链协作</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
          <Plus className="w-4 h-4" />
          新增供应商
        </button>
      </div>

      <form className="bg-white border border-border rounded-sm p-2" onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="搜索供应商名称、联系人、编号..."
            className="w-full h-10 pl-10 pr-24 bg-transparent text-sm outline-none"
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

      <div className="flex justify-between items-center text-xs text-muted">
        <span>共 {pagination.total} 家供应商</span>
        <span>
          排序: {getSortLabel(params.sort as SupplierSortField)} / {params.order === 'desc' ? '降序' : '升序'}
        </span>
      </div>

      <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'id'} direction={params.order} label="编号" onClick={() => handleSort('id')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'name'} direction={params.order} label="供应商名称" onClick={() => handleSort('name')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton active={params.sort === 'contact'} direction={params.order} label="联系人" onClick={() => handleSort('contact')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">联系资质</th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">
                <SortButton active={params.sort === 'orders'} direction={params.order} label="合作订单" onClick={() => handleSort('orders')} />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">
                <SortButton active={params.sort === 'status'} direction={params.order} label="状态" onClick={() => handleSort('status')} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted" colSpan={6}>
                  加载中...
                </td>
              </tr>
            ) : null}
            {!loading && error ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-red-600" colSpan={6}>
                  错误: {error.message}
                </td>
              </tr>
            ) : null}
            {!loading && !error && pageRows.map((item) => (
              <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                <td className="px-4 py-4 text-primary font-mono font-bold italic tracking-wider">{item.id}</td>
                <td className="px-4 py-4 font-bold text-foreground">{item.name}</td>
                <td className="px-4 py-4 text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {item.contact[0]}
                    </span>
                    {item.contact}
                  </div>
                </td>
                <td className="px-4 py-4 text-muted text-xs">{item.cert}</td>
                <td className="px-4 py-4 text-right font-bold text-foreground font-mono">{item.orders}</td>
                <td className="px-4 py-4 text-right">
                  <span className={getStatusClassName(item.status)}>{item.status}</span>
                </td>
              </tr>
            ))}
            {!loading && !error && pageRows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-muted" colSpan={6}>
                  没有匹配的供应商记录。
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
              disabled={pagination.page === 1 || loading}
              onClick={() => updateParams({ page: String(pagination.page - 1) })}
              type="button"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 border text-xs ${
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
              className="px-3 py-1 border border-border bg-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pagination.page === totalPages || loading}
              onClick={() => updateParams({ page: String(pagination.page + 1) })}
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

function getSortLabel(field: SupplierSortField) {
  switch (field) {
    case 'contact':
      return '联系人';
    case 'name':
      return '供应商名称';
    case 'orders':
      return '合作订单';
    case 'status':
      return '状态';
    default:
      return '编号';
  }
}

function getStatusClassName(status: SupplierRow['status']) {
  if (status === '停用') {
    return 'px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-tight';
  }

  if (status === '审核中') {
    return 'px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-tight';
  }

  return 'px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tight';
}

function getStatusLabel(status: 'disabled' | 'normal' | 'warning') {
  switch (status) {
    case 'disabled':
      return '停用';
    case 'warning':
      return '审核中';
    default:
      return '启用';
  }
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
