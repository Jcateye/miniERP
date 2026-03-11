import { NextRequest } from 'next/server';

import type { Sku } from '@minierp/shared';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import {
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
} from '@/lib/bff/server-fixtures';
import {
  skuCategoryIdByLabel,
  skuListFixtures,
  skuViewMetaByCode,
} from '@/lib/mocks/erp-list-fixtures';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

interface BackendSkuDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  specification: string | null;
  baseUnit: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function matchesKeyword(item: Sku, search: string) {
  const code = item.code;
  const name = item.name;
  const meta = skuViewMetaByCode[code];
  const keyword = search.toLowerCase();

  return [code, name, item.specification ?? '', meta?.categoryLabel ?? '', meta?.supplierName ?? '', meta?.warehouseLabel ?? '']
    .some((value) => value.toLowerCase().includes(keyword));
}

function mapBackendSku(item: BackendSkuDto): Sku {
  const meta = skuViewMetaByCode[item.code];

  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    name: item.name,
    specification: item.specification,
    unit: item.baseUnit,
    categoryId:
      item.categoryId ??
      (meta ? skuCategoryIdByLabel[meta.categoryLabel] ?? null : null),
    barcode: null,
    batchManaged: false,
    serialManaged: false,
    status: item.isActive
      ? meta && meta.stock <= meta.threshold
        ? 'warning'
        : 'normal'
      : 'disabled',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
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
  let source: readonly Sku[] = skuListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<BackendSkuDto>('/skus');
  if (upstream.ok) {
    source = upstream.data.map(mapBackendSku);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend SKU list is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend SKU list is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = source
    .filter((item) => {
      const meta = skuViewMetaByCode[item.code];
      const hasMeta = Boolean(meta);

      if ((supplier || warehouse || lowStock) && !hasMeta) {
        return false;
      }

      if (q && !matchesKeyword(item, q)) {
        return false;
      }

      if (category && meta?.categoryLabel !== category) {
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

  const payload = createMockListResponse(
    filtered,
    page,
    pageSize,
    fallbackReason ? 'fixture' : 'OK',
  );

  return toListRouteResponse(payload, fallbackReason);
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

function getSortValue(item: Sku, sortBy: SortField) {
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
