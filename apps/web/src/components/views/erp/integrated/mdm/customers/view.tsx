'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Plus, Search, User } from 'lucide-react';

import { buildPagination, parsePageParam, useUrlListState } from '@/hooks/use-url-list-state';

const PAGE_SIZE = 4;
const DEFAULT_PARAMS = {
  order: 'asc',
  page: '1',
  q: '',
  sort: 'id',
};

const CUSTOMER_ROWS = [
  { id: 'C-001', name: '华为技术有限公司', contact: '王经理', phone: '138-0000-0000', credit: 500000, status: '启用' },
  { id: 'C-002', name: '极客智联网络', contact: '李倩', phone: '138-0000-1002', credit: 220000, status: '启用' },
  { id: 'C-003', name: '蓝桥智能制造', contact: '周岩', phone: '138-0000-1208', credit: 180000, status: '暂停' },
  { id: 'C-004', name: '星海数字设备', contact: '赵琳', phone: '138-0000-2311', credit: 320000, status: '启用' },
  { id: 'C-005', name: '深湾信息科技', contact: '陈翔', phone: '138-0000-5568', credit: 96000, status: '启用' },
  { id: 'C-006', name: '远航电子贸易', contact: '韩梅', phone: '138-0000-7782', credit: 86000, status: '停用' },
] as const;

type CustomerRow = (typeof CUSTOMER_ROWS)[number];
type CustomerSortField = 'contact' | 'credit' | 'id' | 'name' | 'status';

export default function CustomersPage() {
  const { params, updateParams } = useUrlListState(DEFAULT_PARAMS);
  const [draftQuery, setDraftQuery] = React.useState(params.q);

  React.useEffect(() => {
    setDraftQuery(params.q);
  }, [params.q]);

  const filteredRows = React.useMemo(() => {
    const keyword = params.q.trim().toLowerCase();
    const sortField = (params.sort as CustomerSortField) || 'id';
    const sortOrder = params.order === 'desc' ? 'desc' : 'asc';

    const result = CUSTOMER_ROWS.filter((row) => {
      if (!keyword) {
        return true;
      }

      return [row.id, row.name, row.contact, row.phone].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    }).toSorted((left, right) => compareCustomers(left, right, sortField, sortOrder));

    return result;
  }, [params.order, params.q, params.sort]);

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

  const pageNumbers = buildPagination(currentPage, totalPages);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ page: '1', q: draftQuery });
  };

  const handleSort = (field: CustomerSortField) => {
    const nextOrder =
      params.sort === field ? (params.order === 'asc' ? 'desc' : 'asc') : 'asc';

    updateParams({ order: nextOrder, sort: field });
  };

  const rangeStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = filteredRows.length === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">客户管理</h1>
          <p className="text-sm text-muted mt-1">Customers - 客户关系维护</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
          <Plus className="w-4 h-4" />
          新增客户
        </button>
      </div>

      <form className="bg-white border border-border rounded-sm p-2" onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="搜索客户名称、联系人、编号..."
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
        <span>共 {filteredRows.length} 位客户</span>
        <span>排序: {getSortLabel(params.sort as CustomerSortField)} / {params.order === 'desc' ? '降序' : '升序'}</span>
      </div>

      <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton
                  active={params.sort === 'id'}
                  direction={params.order}
                  label="编号"
                  onClick={() => handleSort('id')}
                />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton
                  active={params.sort === 'name'}
                  direction={params.order}
                  label="客户名称"
                  onClick={() => handleSort('name')}
                />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">
                <SortButton
                  active={params.sort === 'contact'}
                  direction={params.order}
                  label="联系人"
                  onClick={() => handleSort('contact')}
                />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">电话</th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">
                <SortButton
                  active={params.sort === 'credit'}
                  direction={params.order}
                  label="信用额度"
                  onClick={() => handleSort('credit')}
                />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">
                <SortButton
                  active={params.sort === 'status'}
                  direction={params.order}
                  label="状态"
                  onClick={() => handleSort('status')}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((item) => (
              <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                <td className="px-4 py-4 text-primary font-mono font-bold italic">{item.id}</td>
                <td className="px-4 py-4 font-bold text-foreground">{item.name}</td>
                <td className="px-4 py-4 text-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted" />
                    {item.contact}
                  </div>
                </td>
                <td className="px-4 py-4 text-muted font-mono">{item.phone}</td>
                <td className="px-4 py-4 text-right font-bold font-mono text-foreground">
                  {formatCurrency(item.credit)}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={getStatusClassName(item.status)}>{item.status}</span>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-muted" colSpan={6}>
                  没有匹配的客户记录。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted">
            显示 {rangeStart}-{rangeEnd} / 共 {filteredRows.length} 条
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

function compareCustomers(
  left: CustomerRow,
  right: CustomerRow,
  field: CustomerSortField,
  order: 'asc' | 'desc',
) {
  const direction = order === 'asc' ? 1 : -1;

  if (field === 'credit') {
    return (left.credit - right.credit) * direction;
  }

  return String(left[field]).localeCompare(String(right[field]), 'zh-CN') * direction;
}

function formatCurrency(value: number) {
  return `¥ ${value.toLocaleString('zh-CN')}`;
}

function getSortLabel(field: CustomerSortField) {
  switch (field) {
    case 'contact':
      return '联系人';
    case 'credit':
      return '信用额度';
    case 'name':
      return '客户名称';
    case 'status':
      return '状态';
    default:
      return '编号';
  }
}

function getStatusClassName(status: CustomerRow['status']) {
  if (status === '停用') {
    return 'px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-tight';
  }

  if (status === '暂停') {
    return 'px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-tight';
  }

  return 'px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tight';
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
