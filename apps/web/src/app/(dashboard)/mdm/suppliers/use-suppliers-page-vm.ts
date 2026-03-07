'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildSupplierSearchQuery,
  filterSupplierListItems,
  parseSupplierSearchParams,
  type SupplierListItem,
} from './suppliers-page';

const SEED_SUPPLIER_LIST_ITEMS: readonly SupplierListItem[] = [
  {
    id: 'supplier_001',
    code: 'V-001',
    name: '华为技术有限公司',
    contactPerson: '赵经理',
    qualificationExpiryLabel: '2026-06-15',
    cooperativeOrdersLabel: '42',
    statusLabel: '合格',
  },
  {
    id: 'supplier_002',
    code: 'V-002',
    name: '比亚迪供应链有限公司',
    contactPerson: '李经理',
    qualificationExpiryLabel: '2026-08-20',
    cooperativeOrdersLabel: '19',
    statusLabel: '合格',
  },
];

export function getSeedSupplierListItems(): SupplierListItem[] {
  return SEED_SUPPLIER_LIST_ITEMS.map((item) => ({ ...item }));
}

export function buildSuppliersNavigationTarget(pathname: string, filters: { keyword: string }): string {
  const query = buildSupplierSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getSuppliersNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string },
): string | null {
  const nextTarget = buildSuppliersNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useSuppliersPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseSupplierSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const items = useMemo(() => getSeedSupplierListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getSuppliersNavigationReplaceTarget(pathname, searchParams, {
        keyword: keywordInput,
      });

      if (replaceTarget) {
        router.replace(replaceTarget);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [keywordInput, pathname, router, searchParams]);

  const visibleItems = useMemo(() => filterSupplierListItems(items, filters), [items, filters]);

  return {
    items,
    keywordInput,
    setKeywordInput,
    visibleItems,
  };
}
