'use client';

import * as React from 'react';

import type { FilterParams, PaginationParams, Sku, SortParams } from '@minierp/shared';

import { useListResource } from './use-list-resource';

export function useSkuList() {
  return useListResource<Sku>({
    path: '/items',
    buildRequest: React.useCallback((searchParams) => {
      const page = Number.parseInt(searchParams.get('page') || '1', 10) || 1;
      const q = searchParams.get('q') || '';
      const category = searchParams.get('category') || '';
      const sort = searchParams.get('sort') || 'code';
      const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
      const status = searchParams.get('status') || '';
      const supplier = searchParams.get('supplier') || '';
      const warehouse = searchParams.get('warehouse') || '';
      const lowStock = searchParams.get('lowStock') || '';

      const request: PaginationParams & FilterParams & SortParams = {
        page,
        pageSize: 5,
        search: q || undefined,
        sortBy: sort,
        sortOrder: order,
      };

      return {
        base: request,
        extras: {
          category,
          lowStock,
          q,
          status,
          supplier,
          warehouse,
        },
      };
    }, []),
  });
}
