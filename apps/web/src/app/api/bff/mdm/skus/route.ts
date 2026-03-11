import { NextRequest, NextResponse } from 'next/server';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import { skuListFixtures, skuViewMetaByCode } from '@/lib/mocks/erp-list-fixtures';

function matchesKeyword(code: string, name: string, search: string) {
  const meta = skuViewMetaByCode[code];
  const keyword = search.toLowerCase();

  return [code, name, meta?.categoryLabel ?? '', meta?.supplierName ?? '', meta?.warehouseLabel ?? '']
    .some((value) => value.toLowerCase().includes(keyword));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 5);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const supplier = (searchParams.get('supplier') || '').trim();
  const warehouse = (searchParams.get('warehouse') || '').trim();
  const lowStock = searchParams.get('lowStock') === '1';
  const sortBy = (searchParams.get('sortBy') || 'code') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'));

  const filtered = skuListFixtures
    .filter((item) => {
      const meta = skuViewMetaByCode[item.code];
      if (!meta) {
        return false;
      }

      if (q && !matchesKeyword(item.code, item.name, q)) {
        return false;
      }

      if (category && meta.categoryLabel !== category) {
        return false;
      }

      if (status && item.status !== mapStatusLabelToValue(status)) {
        return false;
      }

      if (supplier && meta.supplierName !== supplier) {
        return false;
      }

      if (warehouse && meta.warehouseLabel !== warehouse) {
        return false;
      }

      if (lowStock && meta.stock > meta.threshold) {
        return false;
      }

      return true;
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

function mapStatusLabelToValue(label: string) {
  switch (label) {
    case '下架':
      return 'disabled';
    case '补货':
      return 'warning';
    default:
      return 'normal';
  }
}

type SortField = 'cat' | 'code' | 'name' | 'status' | 'stock' | 'supp' | 'threshold';

function getSortValue(item: (typeof skuListFixtures)[number], sortBy: SortField) {
  const meta = skuViewMetaByCode[item.code];

  switch (sortBy) {
    case 'cat':
      return meta?.categoryLabel ?? '';
    case 'name':
      return item.name;
    case 'status':
      return item.status;
    case 'stock':
      return meta?.stock ?? 0;
    case 'supp':
      return meta?.supplierName ?? '';
    case 'threshold':
      return meta?.threshold ?? 0;
    default:
      return item.code;
  }
}
