'use client';

import * as React from 'react';

import type {
  FilterParams,
  PaginationParams,
  SortParams,
  Supplier,
} from '@minierp/shared';

import { useListResource } from './use-list-resource';

export function useSupplierList() {
  return useListResource<Supplier>({
    path: '/mdm/suppliers',
    buildRequest: React.useCallback((searchParams) => {
      const page = Number.parseInt(searchParams.get('page') || '1', 10) || 1;
      const q = searchParams.get('q') || '';
      const sort = searchParams.get('sort') || 'id';
      const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';

      const request: PaginationParams & FilterParams & SortParams = {
        page,
        pageSize: 4,
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
