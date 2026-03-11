import { NextRequest, NextResponse } from 'next/server';

import {
  createMockListResponse,
  compareListValues,
  normalizeSortDirection,
  parsePositiveIntParam,
} from '@/lib/bff/mock-list';
import { purchaseOrderListFixtures } from '@/lib/mocks/erp-list-fixtures';

type SortField = 'amount' | 'date' | 'po' | 'skuCount' | 'supplier';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'date') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');

  const filtered = purchaseOrderListFixtures
    .filter((item) => {
      if (status && item.status !== status) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [item.po, item.supplier].some((value) => value.toLowerCase().includes(q));
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
  item: (typeof purchaseOrderListFixtures)[number],
  sortBy: SortField,
) {
  switch (sortBy) {
    case 'amount':
      return item.amount;
    case 'po':
      return item.po;
    case 'skuCount':
      return item.skuCount;
    case 'supplier':
      return item.supplier;
    default:
      return item.date;
  }
}
