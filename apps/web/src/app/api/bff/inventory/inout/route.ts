import { NextRequest } from 'next/server';

import { skuListFixtures, skuViewMetaByCode, inventoryBalanceListFixtures } from '@/lib/mocks/erp-list-fixtures';
import {
  createInventoryBalanceId,
  mergeInventoryBalanceItems,
  upsertInventoryBalanceDraft,
} from '../balance/_store';
import { upsertInventoryLedgerDraft } from '../ledger/_store';
import {
  getInventoryInoutIdempotencyStore,
  type SuccessPayload,
} from './_idempotency-store';

type InventoryOperation = 'INBOUND' | 'OUTBOUND';

type InventoryCommandPayload = {
  binId?: string | null;
  binLabel?: string | null;
  operation: InventoryOperation;
  quantity: number;
  skuId: string;
  warehouseId: string;
  warehouseLabel?: string;
};

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('idempotency-key')?.trim();

  if (!idempotencyKey) {
    return Response.json(
      {
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          category: 'validation',
          message: 'Idempotency-Key header is required',
        },
      },
      { status: 400 },
    );
  }

  const responseStore = getInventoryInoutIdempotencyStore();
  const cached = responseStore.get(idempotencyKey);
  if (cached) {
    return Response.json(cached.body, { status: cached.status });
  }

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

  let command: InventoryCommandPayload;

  try {
    command = parseCommand(payload);
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

  const current = mergeInventoryBalanceItems(inventoryBalanceListFixtures).find(
    (item) =>
      item.sku === command.skuId &&
      item.warehouseId === command.warehouseId &&
      (item.binId ?? null) === (command.binId ?? null),
  );
  const balanceBefore = current?.balance ?? 0;

  if (command.operation === 'OUTBOUND' && balanceBefore < command.quantity) {
    return Response.json(
      {
        error: {
          code: 'INVENTORY_INSUFFICIENT_STOCK',
          category: 'business',
          message: `库存不足：当前可用 ${balanceBefore}，无法出库 ${command.quantity}`,
        },
      },
      { status: 409 },
    );
  }

  const balanceAfter =
    command.operation === 'INBOUND'
      ? balanceBefore + command.quantity
      : balanceBefore - command.quantity;
  const sku = skuListFixtures.find(
    (item) => item.code === command.skuId || item.id === command.skuId,
  );
  const meta = sku ? skuViewMetaByCode[sku.code] : undefined;

  const balanceId =
    current
      ? createInventoryBalanceId(current.sku, current.warehouseId, current.binId)
      : createInventoryBalanceId(command.skuId, command.warehouseId, command.binId);
  const ledgerId = upsertInventoryLedgerDraft({
    binId: command.binId,
    binLabel: command.binLabel,
    quantity:
      command.operation === 'OUTBOUND'
        ? -command.quantity
        : command.quantity,
    reason: `${command.operation === 'INBOUND' ? 'DEMO-IN' : 'DEMO-OUT'}-${command.skuId}`,
    skuId: command.skuId,
    type: command.operation === 'INBOUND' ? '入库' : '出库',
    warehouseId: command.warehouseId,
    warehouseLabel: command.warehouseLabel,
  });

  upsertInventoryBalanceDraft({
    id: balanceId,
    binId: command.binId,
    binLabel: command.binLabel,
    name: current?.name ?? sku?.name ?? command.skuId,
    quantity: balanceAfter,
    reserved: current?.reserved ?? 0,
    skuId: command.skuId,
    threshold: current?.safe ?? meta?.threshold ?? 0,
    warehouseId: command.warehouseId,
    warehouseLabel: command.warehouseLabel,
  });

  const body: SuccessPayload = {
    data: {
      balanceAfter,
      balanceBefore,
      balanceId,
      ledgerId,
      operation: command.operation,
      quantity: command.quantity,
      skuId: command.skuId,
      binId: command.binId ?? null,
      warehouseId: command.warehouseId,
    },
    message: command.operation === 'INBOUND' ? '入库成功' : '出库成功',
  };

  responseStore.set(idempotencyKey, {
    body,
    status: 201,
  });

  return Response.json(body, { status: 201 });
}

function parseCommand(payload: unknown): InventoryCommandPayload {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('payload must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (candidate.operation !== 'INBOUND' && candidate.operation !== 'OUTBOUND') {
    throw new Error('operation must be INBOUND or OUTBOUND');
  }

  if (typeof candidate.skuId !== 'string' || candidate.skuId.trim() === '') {
    throw new Error('skuId is required');
  }

  if (
    typeof candidate.warehouseId !== 'string' ||
    candidate.warehouseId.trim() === ''
  ) {
    throw new Error('warehouseId is required');
  }

  const quantity = Number(candidate.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('quantity must be a number greater than 0');
  }

  return {
    binId:
      typeof candidate.binId === 'string' && candidate.binId.trim()
        ? candidate.binId.trim()
        : null,
    binLabel:
      typeof candidate.binLabel === 'string' && candidate.binLabel.trim()
        ? candidate.binLabel.trim()
        : null,
    operation: candidate.operation,
    quantity,
    skuId: candidate.skuId.trim(),
    warehouseId: candidate.warehouseId.trim(),
    warehouseLabel:
      typeof candidate.warehouseLabel === 'string' && candidate.warehouseLabel.trim()
        ? candidate.warehouseLabel.trim()
        : undefined,
  };
}
