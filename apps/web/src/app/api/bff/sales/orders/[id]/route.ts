import { NextResponse } from 'next/server';

import {
  removeSalesOrderDraft,
  upsertSalesOrderDraft,
} from '../_store';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseAmount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error('amount must be a valid number');
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

  return {
    amount: parseAmount(payload.amount),
    customerId: payload.customerId.trim(),
    orderDate: payload.orderDate.trim(),
    orderNo: payload.orderNo.trim(),
    status: payload.status.trim() as '待发货' | '已发货' | '草稿',
  };
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
