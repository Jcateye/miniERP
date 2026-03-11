import { NextRequest, NextResponse } from 'next/server';

import {
  createMockListResponse,
  compareListValues,
  normalizeSortDirection,
  parsePositiveIntParam,
} from '@/lib/bff/mock-list';
import { salesOrderListFixtures } from '@/lib/mocks/erp-list-fixtures';

type SortField = 'amount' | 'customer' | 'date' | 'skuCount' | 'so';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'date') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');

  const filtered = salesOrderListFixtures
    .filter((item) => {
      if (status && item.status !== status) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [item.so, item.customer].some((value) => value.toLowerCase().includes(q));
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
  item: (typeof salesOrderListFixtures)[number],
  sortBy: SortField,
) {
  switch (sortBy) {
    case 'amount':
      return item.amount;
    case 'customer':
      return item.customer;
    case 'skuCount':
      return item.skuCount;
    case 'so':
      return item.so;
    default:
      return item.date;
  }
}
