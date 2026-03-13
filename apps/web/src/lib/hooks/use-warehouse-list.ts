'use client';

import * as React from 'react';

import type {
  FilterParams,
  PaginationParams,
  SortParams,
  Warehouse,
} from '@minierp/shared';

import { useListResource } from './use-list-resource';

export function useWarehouseList() {
  return useListResource<Warehouse>({
    path: '/warehouses',
    buildRequest: React.useCallback((searchParams) => {
      const page = Number.parseInt(searchParams.get('page') || '1', 10) || 1;
      const q = searchParams.get('q') || '';
      const sort = searchParams.get('sort') || 'code';
      const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';

      const request: PaginationParams & FilterParams & SortParams = {
        page,
        pageSize: 20,
        search: q || undefined,
        sortBy: sort,
        sortOrder: order,
      };

      return {
        base: request,
        extras: { q },
      };
    }, []),
  });
}
