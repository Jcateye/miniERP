'use client';

import * as React from 'react';

import type { FilterParams, PaginationParams, SortParams } from '@minierp/shared';

import type { InventoryLedgerListItem } from '@/lib/mocks/erp-list-fixtures';

import { useListResource } from './use-list-resource';

export function useInventoryLedger() {
  return useListResource<InventoryLedgerListItem>({
    path: '/inventory/ledger',
    buildRequest: React.useCallback((searchParams) => {
      const page = Number.parseInt(searchParams.get('page') || '1', 10) || 1;
      const q = searchParams.get('q') || '';
      const sort = searchParams.get('sort') || 'date';
      const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
      const type = searchParams.get('type') || '';
      const warehouse = searchParams.get('warehouse') || '';

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
          type,
          warehouse,
        },
      };
    }, []),
  });
}
