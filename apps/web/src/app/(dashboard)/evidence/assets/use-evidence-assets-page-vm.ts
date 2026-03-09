'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildEvidenceAssetSearchQuery,
  filterEvidenceAssetListItems,
  getSeedEvidenceAssetListItems,
  parseEvidenceAssetSearchParams,
  type EvidenceAssetFilter,
} from './evidence-assets-page';

export function buildEvidenceAssetsNavigationTarget(
  pathname: string,
  filters: { keyword: string; filter: EvidenceAssetFilter },
): string {
  const query = buildEvidenceAssetSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getEvidenceAssetsNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string; filter: EvidenceAssetFilter },
): string | null {
  const nextTarget = buildEvidenceAssetsNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useEvidenceAssetsPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseEvidenceAssetSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [filterInput, setFilterInput] = useState<EvidenceAssetFilter>(filters.filter);
  const items = useMemo(() => getSeedEvidenceAssetListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    setFilterInput(filters.filter);
  }, [filters.filter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getEvidenceAssetsNavigationReplaceTarget(pathname, searchParams, {
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

  const visibleItems = useMemo(() => filterEvidenceAssetListItems(items, activeFilters), [activeFilters, items]);

  return {
    keywordInput,
    setKeywordInput,
    filterInput,
    setFilterInput,
    visibleItems,
  };
}
