'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildWorkspaceTodoSearchQuery,
  filterWorkspaceTodoListItems,
  parseWorkspaceTodoSearchParams,
  type WorkspaceTodoListItem,
  type WorkspaceTodoScope,
} from './todos-page';

const SEED_WORKSPACE_TODO_LIST_ITEMS: readonly WorkspaceTodoListItem[] = [
  {
    id: 'todo_001',
    documentNumber: 'PO-20260305-008',
    documentTypeLabel: '采购单',
    applicantName: '张三',
    summary: '华为技术 · 紧急采购网络设备',
    amountLabel: '¥45,200',
    status: 'pending',
    initiatedByMe: false,
  },
  {
    id: 'todo_002',
    documentNumber: 'PAY-20260304-012',
    documentTypeLabel: '付款单',
    applicantName: '李四',
    summary: '深圳创新材料 · 货款支付',
    amountLabel: '¥18,960',
    status: 'approved',
    initiatedByMe: true,
  },
];

export function getSeedWorkspaceTodoListItems(): WorkspaceTodoListItem[] {
  return SEED_WORKSPACE_TODO_LIST_ITEMS.map((item) => ({ ...item }));
}

export function buildWorkspaceTodosActiveFilters(filters: {
  keywordInput: string;
  scopeInput: WorkspaceTodoScope;
}): {
  keyword: string;
  scope: WorkspaceTodoScope;
} {
  return {
    keyword: filters.keywordInput.trim(),
    scope: filters.scopeInput,
  };
}

export function buildWorkspaceTodosNavigationTarget(
  pathname: string,
  filters: { keyword: string; scope: WorkspaceTodoScope },
): string {
  const query = buildWorkspaceTodoSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getWorkspaceTodosNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; scope: WorkspaceTodoScope },
): string | null {
  const nextTarget = buildWorkspaceTodosNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useWorkspaceTodosPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseWorkspaceTodoSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [scopeInput, setScopeInput] = useState<WorkspaceTodoScope>(filters.scope);
  const items = useMemo(() => getSeedWorkspaceTodoListItems(), []);
  const activeFilters = useMemo(
    () =>
      buildWorkspaceTodosActiveFilters({
        keywordInput,
        scopeInput,
      }),
    [keywordInput, scopeInput],
  );
  const visibleItems = useMemo(() => filterWorkspaceTodoListItems(items, activeFilters), [activeFilters, items]);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setScopeInput(filters.scope);
  }, [filters.scope]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getWorkspaceTodosNavigationReplaceTarget(pathname, searchParams, {
        keyword: keywordInput,
        scope: scopeInput,
      });

      if (replaceTarget) {
        router.replace(replaceTarget);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [keywordInput, pathname, router, scopeInput, searchParams]);

  return {
    items,
    keywordInput,
    setKeywordInput,
    scopeInput,
    setScopeInput,
    visibleItems,
  };
}
