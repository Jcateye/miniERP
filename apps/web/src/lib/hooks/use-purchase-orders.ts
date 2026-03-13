'use client';

import * as React from 'react';

import type { FilterParams, PaginationParams, SortParams } from '@minierp/shared';

import type { PurchaseOrderListItem } from '@/lib/mocks/erp-list-fixtures';

import { useListResource } from './use-list-resource';

export function usePurchaseOrders() {
  return useListResource<PurchaseOrderListItem>({
    path: '/purchase-orders',
    buildRequest: React.useCallback((searchParams) => {
      const page = Number.parseInt(searchParams.get('page') || '1', 10) || 1;
      const q = searchParams.get('q') || '';
      const sort = searchParams.get('sort') || 'date';
      const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
      const status = searchParams.get('status') || '';

      const request: PaginationParams & FilterParams & SortParams = {
        page,
        pageSize: 4,
        search: q || undefined,
        sortBy: sort,
        sortOrder: order,
      };

      return {
        base: request,
        extras: {
          q,
          status,
        },
      };
    }, []),
  });
}
