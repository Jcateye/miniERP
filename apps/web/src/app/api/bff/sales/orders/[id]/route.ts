import { NextResponse } from 'next/server';
import {
  mapBackendSalesOrderDetail,
  mapSalesOrderDraftStatusCodeToLabel,
  mapSalesOrderDraftToDetail,
  type SalesOrderStatusCode,
} from '../../../_shared/trading-order-mappers';
import {
  enrichLookupLinesWithItemLabels,
  resolveCustomerLookupLabel,
} from '../../../_shared/masterdata-detail-resolvers';
import type { DocumentDetailDto } from '@/lib/sdk/types';
import {
  buildBackendUrl,
  createServerHeaders,
} from '@/lib/bff/server-fixtures';

import {
  getSalesOrderDraft,
  removeSalesOrderDraft,
  upsertSalesOrderDraft,
} from '../_store';

type SalesOrderDraftLinePayload = {
  itemId: string;
  itemLabel?: string;
  qty: string;
  unitPrice: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseSalesOrderPayload(payload: unknown) {
  if (!isRecord(payload)) {
    throw new Error('Request body must be an object');
  }

  if (!isNonEmptyString(payload.orderNo)) {
    throw new Error('orderNo is required');
  }

  if (!isNonEmptyString(payload.customerId)) {
    throw new Error('customerId is required');
  }

  if (!isNonEmptyString(payload.orderDate)) {
    throw new Error('orderDate is required');
  }

  if (!isNonEmptyString(payload.status)) {
    throw new Error('status is required');
  }

  if (!Array.isArray(payload.lines) || payload.lines.length === 0) {
    throw new Error('lines must contain at least one item');
  }

  const lines = payload.lines.map((line, index) =>
    parseSalesOrderLine(line, index),
  );

  return {
    amount: lines.reduce(
      (sum, line) => sum + Number(line.qty) * Number(line.unitPrice),
      0,
    ),
    customerId: payload.customerId.trim(),
    customerLabel:
      isNonEmptyString(payload.customerLabel) ? payload.customerLabel.trim() : undefined,
    lines,
    orderDate: payload.orderDate.trim(),
    orderNo: payload.orderNo.trim(),
    status: mapSalesOrderDraftStatusCodeToLabel(
      payload.status.trim() as SalesOrderStatusCode,
    ),
  };
}

function parseSalesOrderLine(
  payload: unknown,
  index: number,
): SalesOrderDraftLinePayload {
  if (!isRecord(payload)) {
    throw new Error(`line[${index}] must be an object`);
  }

  if (!isNonEmptyString(payload.itemId)) {
    throw new Error(`line[${index}].itemId is required`);
  }

  if (!isNonEmptyString(payload.qty)) {
    throw new Error(`line[${index}].qty is required`);
  }

  if (!isNonEmptyString(payload.unitPrice)) {
    throw new Error(`line[${index}].unitPrice is required`);
  }

  const qty = Number(payload.qty);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error(`line[${index}].qty must be greater than 0`);
  }

  const unitPrice = Number(payload.unitPrice);
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error(`line[${index}].unitPrice must be a valid number`);
  }

  return {
    itemId: payload.itemId.trim(),
    itemLabel: isNonEmptyString(payload.itemLabel)
      ? payload.itemLabel.trim()
      : undefined,
    qty: payload.qty.trim(),
    unitPrice: payload.unitPrice.trim(),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const draft = getSalesOrderDraft(id);

  if (draft) {
    return NextResponse.json({
      data: mapSalesOrderDraftToDetail(draft),
    });
  }

  if (/^\d+$/.test(id)) {
    try {
      const response = await fetch(buildBackendUrl(`/documents/SO/${id}`), {
        headers: createServerHeaders(),
        cache: 'no-store',
      });

      if (response.ok) {
        const payload = (await response.json()) as { data?: DocumentDetailDto } | DocumentDetailDto;
        const detail =
          payload && typeof payload === 'object' && 'data' in payload
            ? payload.data
            : payload;

        if (detail) {
          const mappedDetail = mapBackendSalesOrderDetail(detail as DocumentDetailDto);
          const lines = await enrichLookupLinesWithItemLabels(mappedDetail.lines);
          const customerLabel = mappedDetail.customerId
            ? await resolveCustomerLookupLabel(mappedDetail.customerId)
            : null;

          return NextResponse.json({
            data: {
              ...mappedDetail,
              lines,
              customerLabel: customerLabel ?? mappedDetail.customerLabel,
            },
          });
        }
      }

      return NextResponse.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            category: 'not_found',
            message: 'Sales order detail was not found',
          },
        },
        { status: response.status === 404 ? 404 : 502 },
      );
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'UPSTREAM_UNAVAILABLE',
            category: 'upstream',
            message: 'Sales order detail is unavailable',
          },
        },
        { status: 503 },
      );
    }
  }

  return NextResponse.json(
    {
      error: {
        code: 'RESOURCE_NOT_FOUND',
        category: 'not_found',
        message: 'Sales order detail was not found',
      },
    },
    { status: 404 },
  );
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const payload = parseSalesOrderPayload(await request.json());
    upsertSalesOrderDraft({
      id,
      ...payload,
    });

    return NextResponse.json({
      data: {
        id,
        updated: true,
      },
      message: '更新成功',
    });
  } catch (error) {
    return NextResponse.json(
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  removeSalesOrderDraft(id);

  return NextResponse.json({
    data: {
      deleted: true,
      id,
    },
    message: '删除成功',
  });
}
