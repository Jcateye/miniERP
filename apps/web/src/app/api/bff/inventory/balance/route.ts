import { NextRequest } from 'next/server';

import type { InventoryBalanceSnapshot } from '@minierp/shared';

import {
  createMockListResponse,
  compareListValues,
  normalizeSortDirection,
  parsePositiveIntParam,
} from '@/lib/bff/mock-list';
import {
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
} from '@/lib/bff/server-fixtures';
import {
  inventoryBalanceListFixtures,
  type InventoryBalanceListItem,
} from '@/lib/mocks/erp-list-fixtures';
import { mergeInventoryBalanceItems, upsertInventoryBalanceDraft } from './_store';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

type SortField = 'available' | 'balance' | 'name' | 'safe' | 'sku';

const WAREHOUSE_LABELS: Record<string, string> = {
  'WH-001': '深圳 A 仓',
  'WH-002': '青岛 B 仓',
  'WH-003': '苏州 周转仓',
};

function mapBackendBalance(item: InventoryBalanceSnapshot): InventoryBalanceListItem {
  const warehouse = WAREHOUSE_LABELS[item.warehouseId] ?? item.warehouseId;
  const fixture = inventoryBalanceListFixtures.find(
    (candidate) =>
      candidate.sku === item.skuId && candidate.warehouse === warehouse,
  );

  const reserved = fixture?.reserved ?? 0;
  const balance = item.onHand;

  return {
    sku: item.skuId,
    name: fixture?.name ?? item.skuId,
    warehouse,
    balance,
    available: fixture?.available ?? Math.max(balance - reserved, 0),
    reserved,
    safe: fixture?.safe ?? 0,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const stockState = (searchParams.get('stockState') || '').trim();
  const warehouse = (searchParams.get('warehouse') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'balance') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');
  let source: readonly InventoryBalanceListItem[] = inventoryBalanceListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<InventoryBalanceSnapshot>(
    '/inventory/balances',
  );
  if (upstream.ok) {
    source = upstream.data.map(mapBackendBalance);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend inventory balance list is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend inventory balance list is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = mergeInventoryBalanceItems(source)
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

  const payload = createMockListResponse(
    filtered,
    page,
    pageSize,
    fallbackReason ? 'fixture' : 'OK',
  );

  return toListRouteResponse(payload, fallbackReason);
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_INVALID_JSON',
          category: 'validation',
          message: 'Request body must be valid JSON',
        },
      },
      { status: 400 },
    );
  }

  try {
    const candidate = payload as Record<string, unknown>;

    if (typeof candidate.skuId !== 'string' || candidate.skuId.trim() === '') {
      throw new Error('skuId is required');
    }

    if (typeof candidate.warehouseId !== 'string' || candidate.warehouseId.trim() === '') {
      throw new Error('warehouseId is required');
    }

    const quantity = Number(candidate.quantity);
    if (!Number.isFinite(quantity)) {
      throw new Error('quantity must be a valid number');
    }

    const threshold =
      candidate.threshold === undefined || candidate.threshold === null || candidate.threshold === ''
        ? 0
        : Number(candidate.threshold);

    if (!Number.isFinite(threshold)) {
      throw new Error('threshold must be a valid number');
    }

    const id = upsertInventoryBalanceDraft({
      quantity,
      skuId: candidate.skuId.trim(),
      threshold,
      warehouseId: candidate.warehouseId.trim(),
    });

    return Response.json(
      {
        data: {
          id,
        },
        message: '新增成功',
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAYLOAD',
          category: 'validation',
          message: error instanceof Error ? error.message : 'Invalid payload',
        },
      },
      { status: 400 },
    );
  }
}

function getSortValue(
  item: InventoryBalanceListItem,
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
