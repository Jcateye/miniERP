'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildQualityRecordSearchQuery,
  filterQualityRecordListItems,
  parseQualityRecordSearchParams,
  type QualityRecordListItem,
  type QualityRecordScope,
} from './records-page';

const SEED_QUALITY_RECORD_LIST_ITEMS: readonly QualityRecordListItem[] = [
  {
    id: 'qc_001',
    recordNumber: 'QC-20260308-001',
    inspectionTypeLabel: '来料检验',
    sourceNumber: 'DOC-PO-20260305-008',
    subjectLabel: '网络交换机批次 A01',
    inspectorName: '王五',
    conclusionLabel: '待检',
    status: 'pending',
    initiatedByMe: false,
  },
  {
    id: 'qc_002',
    recordNumber: 'QC-20260308-002',
    inspectionTypeLabel: '出货检验',
    sourceNumber: 'DOC-SHP-20260308-003',
    subjectLabel: '客户订单 SO-91',
    inspectorName: '赵六',
    conclusionLabel: '合格',
    status: 'passed',
    initiatedByMe: true,
  },
];

export function getSeedQualityRecordListItems(): QualityRecordListItem[] {
  return SEED_QUALITY_RECORD_LIST_ITEMS.map((item) => ({ ...item }));
}

export function buildQualityRecordsActiveFilters(filters: {
  keywordInput: string;
  scopeInput: QualityRecordScope;
}): {
  keyword: string;
  scope: QualityRecordScope;
} {
  return {
    keyword: filters.keywordInput.trim(),
    scope: filters.scopeInput,
  };
}

export function buildQualityRecordsNavigationTarget(
  pathname: string,
  filters: { keyword: string; scope: QualityRecordScope },
): string {
  const query = buildQualityRecordSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getQualityRecordsNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; scope: QualityRecordScope },
): string | null {
  const nextTarget = buildQualityRecordsNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useQualityRecordsPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseQualityRecordSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [scopeInput, setScopeInput] = useState<QualityRecordScope>(filters.scope);
  const items = useMemo(() => getSeedQualityRecordListItems(), []);
  const activeFilters = useMemo(
    () =>
      buildQualityRecordsActiveFilters({
        keywordInput,
        scopeInput,
      }),
    [keywordInput, scopeInput],
  );
  const visibleItems = useMemo(() => filterQualityRecordListItems(items, activeFilters), [activeFilters, items]);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setScopeInput(filters.scope);
  }, [filters.scope]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getQualityRecordsNavigationReplaceTarget(pathname, searchParams, {
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
