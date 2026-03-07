'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildWarehouseSearchQuery,
  filterWarehouseListItems,
  parseWarehouseListPayload,
  parseWarehouseSearchParams,
  WAREHOUSE_PAGE_PRESENTATION,
  type WarehouseListItem,
} from './warehouses-page';

async function requestWarehouses(path: string): Promise<WarehouseListItem[]> {
  const response = await fetch(path, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
    },
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error(`仓库列表响应不是有效 JSON（status: ${response.status}）`);
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'message' in payload.error &&
      typeof payload.error.message === 'string'
        ? payload.error.message
        : `仓库列表加载失败（status: ${response.status}）`;

    throw new Error(errorMessage);
  }

  return parseWarehouseListPayload(payload);
}

export function buildWarehousesRequestPath(_filters: { keyword: string }): string {
  return WAREHOUSE_PAGE_PRESENTATION.apiBasePath;
}

export function buildWarehousesNavigationTarget(pathname: string, filters: { keyword: string }): string {
  const query = buildWarehouseSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function useWarehousesPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseWarehouseSearchParams(searchParams), [searchParams]);

  const [items, setItems] = useState<WarehouseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keywordInput, setKeywordInput] = useState(filters.keyword);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const nextItems = await requestWarehouses(buildWarehousesRequestPath(filters));
      setItems(nextItems);
    } catch (requestError) {
      setItems([]);
      setError(requestError instanceof Error ? requestError.message : '仓库列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.replace(
        buildWarehousesNavigationTarget(pathname, {
          keyword: keywordInput,
        }),
      );
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [keywordInput, pathname, router]);

  return {
    error,
    items,
    keywordInput,
    loading,
    setKeywordInput,
    loadItems,
    visibleItems: filterWarehouseListItems(items, filters),
  };
}
