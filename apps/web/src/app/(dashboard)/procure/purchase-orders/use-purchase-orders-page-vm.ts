'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildPurchaseOrderSearchQuery,
  filterPurchaseOrderListItems,
  getSeedPurchaseOrderListItems,
  parsePurchaseOrderSearchParams,
  type PurchaseOrderFilter,
} from './purchase-orders-page';

export function buildPurchaseOrdersNavigationTarget(
  pathname: string,
  filters: { keyword: string; filter: PurchaseOrderFilter },
): string {
  const query = buildPurchaseOrderSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getPurchaseOrdersNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; filter: PurchaseOrderFilter },
): string | null {
  const nextTarget = buildPurchaseOrdersNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function usePurchaseOrdersPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parsePurchaseOrderSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [filterInput, setFilterInput] = useState<PurchaseOrderFilter>(filters.filter);
  const items = useMemo(() => getSeedPurchaseOrderListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setFilterInput(filters.filter);
  }, [filters.filter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getPurchaseOrdersNavigationReplaceTarget(pathname, searchParams, {
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

  const visibleItems = useMemo(() => filterPurchaseOrderListItems(items, activeFilters), [activeFilters, items]);

  return {
    keywordInput,
    setKeywordInput,
    filterInput,
    setFilterInput,
    visibleItems,
  };
}
