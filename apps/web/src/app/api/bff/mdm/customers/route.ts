import { NextRequest, NextResponse } from 'next/server';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import { customerListFixtures } from '@/lib/mocks/erp-list-fixtures';

const SORT_FIELDS = {
  contact: (item: (typeof customerListFixtures)[number]) => item.contactName ?? '',
  credit: (item: (typeof customerListFixtures)[number]) => Number(item.creditLimit ?? '0'),
  id: (item: (typeof customerListFixtures)[number]) => item.code,
  name: (item: (typeof customerListFixtures)[number]) => item.name,
  status: (item: (typeof customerListFixtures)[number]) => item.status,
} as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const sortBy = (searchParams.get('sortBy') || 'id') as keyof typeof SORT_FIELDS;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'));

  const filtered = customerListFixtures
    .filter((item) => {
      if (!q) {
        return true;
      }

      return [item.code, item.name, item.contactName ?? '', item.phone ?? '']
        .some((value) => value.toLowerCase().includes(q));
    })
    .toSorted((left, right) => {
      const getter = SORT_FIELDS[sortBy] ?? SORT_FIELDS.id;
      return compareListValues(getter(left), getter(right), sortOrder);
    });

  return NextResponse.json(createMockListResponse(filtered, page, pageSize));
}
