import { NextRequest } from 'next/server';

import type { InventoryLedgerEntry } from '@minierp/shared';

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
  inventoryLedgerListFixtures,
  type InventoryLedgerListItem,
} from '@/lib/mocks/erp-list-fixtures';
import { mergeInventoryLedgerItems, upsertInventoryLedgerDraft } from './_store';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

type SortField = 'balance' | 'date' | 'skuId' | 'type' | 'warehouse';

const INVENTORY_TYPE_LABELS: Record<string, InventoryLedgerListItem['type']> = {
  ADJUSTMENT: '调拨',
  GRN: '入库',
  OUT: '出库',
  STOCKTAKE: '盘点',
};

const WAREHOUSE_LABELS: Record<string, string> = {
  'WH-001': '深圳总仓',
  'WH-002': '青岛 B 仓',
  'WH-003': '苏州周转仓',
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function computeBalanceByLedgerId(entries: readonly InventoryLedgerEntry[]) {
  const balanceByKey = new Map<string, number>();
  const balanceByLedgerId = new Map<string, number>();
  const sorted = [...entries].sort((left, right) =>
    left.postedAt.localeCompare(right.postedAt),
  );

  for (const entry of sorted) {
    const key = `${entry.skuId}::${entry.warehouseId}`;
    const nextBalance =
      (balanceByKey.get(key) ?? 0) + Number(entry.quantityDelta);
    balanceByKey.set(key, nextBalance);
    balanceByLedgerId.set(entry.id, nextBalance);
  }

  return balanceByLedgerId;
}

function mapBackendLedger(entries: readonly InventoryLedgerEntry[]) {
  const balanceByLedgerId = computeBalanceByLedgerId(entries);

  return entries.map<InventoryLedgerListItem>((entry) => ({
    balance: balanceByLedgerId.get(entry.id) ?? Number(entry.quantityDelta),
    date: formatDateTime(entry.postedAt),
    direction: `${entry.quantityDelta >= 0 ? '+' : ''}${entry.quantityDelta}`,
    operator: '-',
    skuId: entry.skuId,
    source: `${entry.referenceType}-${entry.referenceId}`,
    type: INVENTORY_TYPE_LABELS[entry.referenceType] ?? '调拨',
    warehouse: WAREHOUSE_LABELS[entry.warehouseId] ?? entry.warehouseId,
  }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const type = (searchParams.get('type') || '').trim();
  const warehouse = (searchParams.get('warehouse') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'date') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');
  let source: readonly InventoryLedgerListItem[] = inventoryLedgerListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<InventoryLedgerEntry>(
    '/inventory/ledger?page=1&pageSize=200',
  );
  if (upstream.ok) {
    source = mapBackendLedger(upstream.data);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend inventory ledger is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend inventory ledger is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = mergeInventoryLedgerItems(source)
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

    if (typeof candidate.type !== 'string' || candidate.type.trim() === '') {
      throw new Error('type is required');
    }

    const quantity = Number(candidate.quantity);
    if (!Number.isFinite(quantity)) {
      throw new Error('quantity must be a valid number');
    }

    const id = upsertInventoryLedgerDraft({
      quantity: candidate.type.trim() === '出库' ? -Math.abs(quantity) : Math.abs(quantity),
      reason:
        typeof candidate.reason === 'string'
          ? candidate.reason.trim()
          : '',
      skuId: candidate.skuId.trim(),
      type: candidate.type.trim() as '入库' | '出库' | '调整',
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
  item: InventoryLedgerListItem,
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
