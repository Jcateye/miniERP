'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildWorkflowTaskSearchQuery,
  filterWorkflowTaskListItems,
  parseWorkflowTaskSearchParams,
  type WorkflowTaskListItem,
  type WorkflowTaskScope,
} from './tasks-page';

const SEED_WORKFLOW_TASK_LIST_ITEMS: readonly WorkflowTaskListItem[] = [
  {
    id: 'task_001',
    documentNumber: 'PO-20260305-008',
    documentTypeLabel: '采购单',
    applicantName: '张三',
    summary: '华为技术 · 紧急采购网络设备',
    amountLabel: '¥45,200',
    status: 'pending',
    initiatedByMe: false,
  },
  {
    id: 'task_002',
    documentNumber: 'PAY-20260304-012',
    documentTypeLabel: '付款单',
    applicantName: '李四',
    summary: '深圳创新材料 · 货款支付',
    amountLabel: '¥18,960',
    status: 'approved',
    initiatedByMe: true,
  },
];

export function getSeedWorkflowTaskListItems(): WorkflowTaskListItem[] {
  return SEED_WORKFLOW_TASK_LIST_ITEMS.map((item) => ({ ...item }));
}

export function buildWorkflowTasksActiveFilters(filters: {
  keywordInput: string;
  scopeInput: WorkflowTaskScope;
}): {
  keyword: string;
  scope: WorkflowTaskScope;
} {
  return {
    keyword: filters.keywordInput.trim(),
    scope: filters.scopeInput,
  };
}

export function buildWorkflowTasksNavigationTarget(
  pathname: string,
  filters: { keyword: string; scope: WorkflowTaskScope },
): string {
  const query = buildWorkflowTaskSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getWorkflowTasksNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; scope: WorkflowTaskScope },
): string | null {
  const nextTarget = buildWorkflowTasksNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useWorkflowTasksPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseWorkflowTaskSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [scopeInput, setScopeInput] = useState<WorkflowTaskScope>(filters.scope);
  const items = useMemo(() => getSeedWorkflowTaskListItems(), []);
  const activeFilters = useMemo(
    () =>
      buildWorkflowTasksActiveFilters({
        keywordInput,
        scopeInput,
      }),
    [keywordInput, scopeInput],
  );

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setScopeInput(filters.scope);
  }, [filters.scope]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getWorkflowTasksNavigationReplaceTarget(pathname, searchParams, {
        keyword: keywordInput,
        scope: scopeInput,
      });

      if (replaceTarget) {
        router.replace(replaceTarget);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [keywordInput, pathname, router, scopeInput, searchParams]);

  const visibleItems = useMemo(() => filterWorkflowTaskListItems(items, activeFilters), [activeFilters, items]);

  return {
    items,
    keywordInput,
    setKeywordInput,
    scopeInput,
    setScopeInput,
    visibleItems,
  };
}
