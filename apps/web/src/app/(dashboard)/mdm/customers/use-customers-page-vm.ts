'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildCustomerSearchQuery,
  CUSTOMER_PAGE_PRESENTATION,
  filterCustomerListItems,
  parseCustomerListPayload,
  parseCustomerSearchParams,
  type CustomerListItem,
} from './customers-page';

async function requestCustomers(path: string): Promise<CustomerListItem[]> {
  const response = await fetch(path, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
    },
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
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
        : '客户列表加载失败';

    throw new Error(errorMessage);
  }

  return parseCustomerListPayload(payload);
}

export function buildCustomersRequestPath(filters: { keyword: string; status: '' | 'active' | 'inactive' }): string {
  const query = buildCustomerSearchQuery(filters);
  return query ? `${CUSTOMER_PAGE_PRESENTATION.apiBasePath}?${query}` : CUSTOMER_PAGE_PRESENTATION.apiBasePath;
}

export function buildCustomersNavigationTarget(
  pathname: string,
  filters: { keyword: string; status: '' | 'active' | 'inactive' },
): string {
  const query = buildCustomerSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function useCustomersPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseCustomerSearchParams(searchParams), [searchParams]);

  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keywordInput, setKeywordInput] = useState(filters.keyword);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const nextItems = await requestCustomers(buildCustomersRequestPath(filters));
      setItems(nextItems);
    } catch (requestError) {
      setItems([]);
      setError(requestError instanceof Error ? requestError.message : '客户列表加载失败');
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
        buildCustomersNavigationTarget(pathname, {
          keyword: keywordInput,
          status: '',
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
    visibleItems: filterCustomerListItems(items, filters),
  };
}
