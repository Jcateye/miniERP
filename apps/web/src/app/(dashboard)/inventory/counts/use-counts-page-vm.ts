'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildInventoryCountSearchQuery,
  filterInventoryCountListItems,
  getSeedInventoryCountListItems,
  parseInventoryCountSearchParams,
  type InventoryCountFilter,
} from './counts-page';

export function buildInventoryCountsNavigationTarget(
  pathname: string,
  filters: { keyword: string; filter: InventoryCountFilter },
): string {
  const query = buildInventoryCountSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getInventoryCountsNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; filter: InventoryCountFilter },
): string | null {
  const nextTarget = buildInventoryCountsNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useCountsPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseInventoryCountSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [filterInput, setFilterInput] = useState<InventoryCountFilter>(filters.filter);
  const items = useMemo(() => getSeedInventoryCountListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setFilterInput(filters.filter);
  }, [filters.filter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getInventoryCountsNavigationReplaceTarget(pathname, searchParams, {
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

  const visibleItems = useMemo(() => filterInventoryCountListItems(items, activeFilters), [activeFilters, items]);

  return {
    keywordInput,
    setKeywordInput,
    filterInput,
    setFilterInput,
    visibleItems,
  };
}
