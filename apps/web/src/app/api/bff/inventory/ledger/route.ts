import { NextRequest, NextResponse } from 'next/server';

import {
  createMockListResponse,
  compareListValues,
  normalizeSortDirection,
  parsePositiveIntParam,
} from '@/lib/bff/mock-list';
import { inventoryLedgerListFixtures } from '@/lib/mocks/erp-list-fixtures';

type SortField = 'balance' | 'date' | 'skuId' | 'type' | 'warehouse';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const type = (searchParams.get('type') || '').trim();
  const warehouse = (searchParams.get('warehouse') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'date') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');

  const filtered = inventoryLedgerListFixtures
    .filter((item) => {
      if (type && item.type !== type) {
        return false;
      }

      if (warehouse && item.warehouse !== warehouse) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [item.skuId, item.warehouse, item.source, item.operator]
        .some((value) => value.toLowerCase().includes(q));
    })
    .toSorted((left, right) => {
      return compareListValues(
        getSortValue(left, sortBy),
        getSortValue(right, sortBy),
        sortOrder,
      );
    });

  return NextResponse.json(createMockListResponse(filtered, page, pageSize));
}

function getSortValue(
  item: (typeof inventoryLedgerListFixtures)[number],
  sortBy: SortField,
) {
  switch (sortBy) {
    case 'balance':
      return item.balance;
    case 'skuId':
      return item.skuId;
    case 'type':
      return item.type;
    case 'warehouse':
      return item.warehouse;
    default:
      return item.date;
  }
}
