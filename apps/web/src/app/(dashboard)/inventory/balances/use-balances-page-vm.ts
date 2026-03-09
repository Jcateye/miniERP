'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildInventoryBalanceSearchQuery,
  filterInventoryBalanceListItems,
  getSeedInventoryBalanceListItems,
  parseInventoryBalanceSearchParams,
  type InventoryBalanceFilter,
} from './balances-page';

export function buildInventoryBalancesNavigationTarget(
  pathname: string,
  filters: { keyword: string; filter: InventoryBalanceFilter },
): string {
  const query = buildInventoryBalanceSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getInventoryBalancesNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; filter: InventoryBalanceFilter },
): string | null {
  const nextTarget = buildInventoryBalancesNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useBalancesPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseInventoryBalanceSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [filterInput, setFilterInput] = useState<InventoryBalanceFilter>(filters.filter);
  const items = useMemo(() => getSeedInventoryBalanceListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setFilterInput(filters.filter);
  }, [filters.filter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getInventoryBalancesNavigationReplaceTarget(pathname, searchParams, {
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

  const visibleItems = useMemo(() => filterInventoryBalanceListItems(items, activeFilters), [activeFilters, items]);

  return {
    keywordInput,
    setKeywordInput,
    filterInput,
    setFilterInput,
    visibleItems,
  };
}
