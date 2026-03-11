import { NextRequest, NextResponse } from 'next/server';

import {
  createMockListResponse,
  compareListValues,
  normalizeSortDirection,
  parsePositiveIntParam,
} from '@/lib/bff/mock-list';
import { inventoryBalanceListFixtures } from '@/lib/mocks/erp-list-fixtures';

type SortField = 'available' | 'balance' | 'name' | 'safe' | 'sku';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const stockState = (searchParams.get('stockState') || '').trim();
  const warehouse = (searchParams.get('warehouse') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'balance') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');

  const filtered = inventoryBalanceListFixtures
    .filter((item) => {
      if (warehouse && item.warehouse !== warehouse) {
        return false;
      }

      if (stockState === 'low' && item.balance >= item.safe) {
        return false;
      }

      if (stockState === 'cycle' && item.balance < item.safe) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [item.sku, item.name, item.warehouse]
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
  item: (typeof inventoryBalanceListFixtures)[number],
  sortBy: SortField,
) {
  switch (sortBy) {
    case 'available':
      return item.available;
    case 'name':
      return item.name;
    case 'safe':
      return item.safe;
    case 'sku':
      return item.sku;
    default:
      return item.balance;
  }
}
