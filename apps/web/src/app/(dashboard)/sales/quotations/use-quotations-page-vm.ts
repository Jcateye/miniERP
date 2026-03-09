'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildQuotationSearchQuery,
  filterQuotationListItems,
  getSeedQuotationListItems,
  parseQuotationSearchParams,
  type QuotationFilter,
} from './quotations-page';

export function buildQuotationsNavigationTarget(
  pathname: string,
  filters: { keyword: string; filter: QuotationFilter },
): string {
  const query = buildQuotationSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getQuotationsNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; filter: QuotationFilter },
): string | null {
  const nextTarget = buildQuotationsNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useQuotationsPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseQuotationSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [filterInput, setFilterInput] = useState<QuotationFilter>(filters.filter);
  const items = useMemo(() => getSeedQuotationListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setFilterInput(filters.filter);
  }, [filters.filter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getQuotationsNavigationReplaceTarget(pathname, searchParams, {
        keyword: keywordInput,
        filter: filterInput,
      });

      if (replaceTarget) {
        router.replace(replaceTarget);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filterInput, keywordInput, pathname, router, searchParams]);

  const activeFilters = useMemo(
    () => ({ keyword: keywordInput.trim(), filter: filterInput }),
    [filterInput, keywordInput],
  );

  const visibleItems = useMemo(() => filterQuotationListItems(items, activeFilters), [activeFilters, items]);

  return {
    keywordInput,
    setKeywordInput,
    filterInput,
    setFilterInput,
    visibleItems,
  };
}
