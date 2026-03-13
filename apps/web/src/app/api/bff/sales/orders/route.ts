import { NextRequest } from 'next/server';

import type { DocumentListItemDto } from '@minierp/shared';

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
  salesOrderListFixtures,
  type SalesOrderListItem,
} from '@/lib/mocks/erp-list-fixtures';
import {
  mapBackendSalesOrder,
  mapSalesOrderDraftStatusCodeToLabel,
  type SalesOrderStatusCode,
} from '../../_shared/trading-order-mappers';
import { mergeSalesOrderItems, upsertSalesOrderDraft } from './_store';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

type SortField = 'amount' | 'customer' | 'date' | 'skuCount' | 'so';

type SalesOrderDraftLinePayload = {
  itemId: string;
  itemLabel?: string;
  qty: string;
  unitPrice: string;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim();
  const sortBy = (searchParams.get('sortBy') || 'date') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'), 'desc');
  let source: readonly SalesOrderListItem[] = salesOrderListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<DocumentListItemDto>(
    '/documents?docType=SO&page=1&pageSize=200',
  );
  if (upstream.ok) {
    source = upstream.data.map(mapBackendSalesOrder);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend sales order list is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend sales order list is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = mergeSalesOrderItems(source)
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

    if (typeof candidate.orderNo !== 'string' || candidate.orderNo.trim() === '') {
      throw new Error('orderNo is required');
    }

    if (typeof candidate.customerId !== 'string' || candidate.customerId.trim() === '') {
      throw new Error('customerId is required');
    }

    const customerLabel =
      typeof candidate.customerLabel === 'string' ? candidate.customerLabel.trim() : '';

    if (typeof candidate.orderDate !== 'string' || candidate.orderDate.trim() === '') {
      throw new Error('orderDate is required');
    }

    if (typeof candidate.status !== 'string' || candidate.status.trim() === '') {
      throw new Error('status is required');
    }

    if (
      candidate.status !== 'draft' &&
      candidate.status !== 'confirmed' &&
      candidate.status !== 'posted'
    ) {
      throw new Error('status must be draft, confirmed, or posted');
    }

    if (!Array.isArray(candidate.lines) || candidate.lines.length === 0) {
      throw new Error('lines must contain at least one item');
    }

    const lines = candidate.lines.map((line, index) =>
      parseSalesOrderLine(line, index),
    );
    const amount = lines.reduce(
      (sum, line) => sum + Number(line.qty) * Number(line.unitPrice),
      0,
    );

    const id = upsertSalesOrderDraft({
      amount,
      customerId: candidate.customerId.trim(),
      customerLabel,
      lines,
      orderDate: candidate.orderDate.trim(),
      orderNo: candidate.orderNo.trim(),
      status: mapSalesOrderDraftStatusCodeToLabel(
        candidate.status as SalesOrderStatusCode,
      ),
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

function parseSalesOrderLine(
  payload: unknown,
  index: number,
): SalesOrderDraftLinePayload {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error(`line[${index}] must be an object`);
  }

  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.itemId !== 'string' || candidate.itemId.trim() === '') {
    throw new Error(`line[${index}].itemId is required`);
  }

  if (typeof candidate.qty !== 'string' || candidate.qty.trim() === '') {
    throw new Error(`line[${index}].qty is required`);
  }

  if (typeof candidate.unitPrice !== 'string' || candidate.unitPrice.trim() === '') {
    throw new Error(`line[${index}].unitPrice is required`);
  }

  const qty = Number(candidate.qty);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error(`line[${index}].qty must be greater than 0`);
  }

  const unitPrice = Number(candidate.unitPrice);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error(`line[${index}].unitPrice must be a valid number`);
  }

  return {
    itemId: candidate.itemId.trim(),
    itemLabel:
      typeof candidate.itemLabel === 'string' ? candidate.itemLabel.trim() : undefined,
    qty: candidate.qty.trim(),
    unitPrice: candidate.unitPrice.trim(),
  };
}

function getSortValue(
  item: SalesOrderListItem,
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
