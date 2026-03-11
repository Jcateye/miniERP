import { NextRequest, NextResponse } from 'next/server';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import { supplierListFixtures, supplierViewMetaByCode } from '@/lib/mocks/erp-list-fixtures';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const sortBy = (searchParams.get('sortBy') || 'id') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'));

  const filtered = supplierListFixtures
    .filter((item) => {
      if (!q) {
        return true;
      }

      const meta = supplierViewMetaByCode[item.code];
      return [item.code, item.name, item.contactName ?? '', meta?.cert ?? '']
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

type SortField = 'contact' | 'id' | 'name' | 'orders' | 'status';

function getSortValue(item: (typeof supplierListFixtures)[number], sortBy: SortField) {
  const meta = supplierViewMetaByCode[item.code];

  switch (sortBy) {
    case 'contact':
      return item.contactName ?? '';
    case 'name':
      return item.name;
    case 'orders':
      return meta?.orders ?? 0;
    case 'status':
      return item.status;
    default:
      return item.code;
  }
}
