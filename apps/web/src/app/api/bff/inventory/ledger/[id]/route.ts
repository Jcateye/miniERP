import { NextResponse } from 'next/server';

import {
  removeInventoryLedgerDraft,
  upsertInventoryLedgerDraft,
} from '../_store';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseNumber(value: unknown, field: string) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error(`${field} must be a valid number`);
}

function parseLedgerPayload(payload: unknown) {
  if (!isRecord(payload)) {
    throw new Error('Request body must be an object');
  }

  if (!isNonEmptyString(payload.skuId)) {
    throw new Error('skuId is required');
  }

  if (!isNonEmptyString(payload.warehouseId)) {
    throw new Error('warehouseId is required');
  }

  if (!isNonEmptyString(payload.type)) {
    throw new Error('type is required');
  }

  const quantity = parseNumber(payload.quantity, 'quantity');
  const normalizedType = payload.type.trim();

  return {
    binId:
      isNonEmptyString(payload.binId)
        ? payload.binId.trim()
        : null,
    binLabel:
      isNonEmptyString(payload.binLabel)
        ? payload.binLabel.trim()
        : null,
    quantity: normalizedType === '出库' ? -Math.abs(quantity) : Math.abs(quantity),
    reason:
      typeof payload.reason === 'string'
        ? payload.reason.trim()
        : '',
    skuId: payload.skuId.trim(),
    type: normalizedType as '入库' | '出库' | '调整',
    warehouseId: payload.warehouseId.trim(),
    warehouseLabel:
      isNonEmptyString(payload.warehouseLabel)
        ? payload.warehouseLabel.trim()
        : payload.warehouseId.trim(),
  };
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const payload = parseLedgerPayload(await request.json());
    upsertInventoryLedgerDraft({
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
  removeInventoryLedgerDraft(id);

  return NextResponse.json({
    data: {
      deleted: true,
      id,
    },
    message: '删除成功',
  });
}
