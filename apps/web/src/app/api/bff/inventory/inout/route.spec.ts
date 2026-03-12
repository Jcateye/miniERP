import { NextRequest } from 'next/server';

import { resetInventoryBalanceStore } from '../balance/_store';
import { resetInventoryLedgerStore } from '../ledger/_store';
import { resetInventoryInoutIdempotencyStore } from './_idempotency-store';
import { POST } from './route';

describe('bff inventory inout route', () => {
  afterEach(() => {
    resetInventoryBalanceStore();
    resetInventoryLedgerStore();
    resetInventoryInoutIdempotencyStore();
  });

  it('creates inbound transaction and updates balance', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/bff/inventory/inout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': 'demo-inbound-1',
        },
        body: JSON.stringify({
          operation: 'INBOUND',
          quantity: 100,
          skuId: 'CAB-HDMI-2M',
          warehouseId: '深圳 A 仓',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe('入库成功');
    expect(body.data.balanceBefore).toBe(342);
    expect(body.data.balanceAfter).toBe(442);
  });

  it('blocks outbound transaction when stock is insufficient', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/bff/inventory/inout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': 'demo-outbound-1',
        },
        body: JSON.stringify({
          operation: 'OUTBOUND',
          quantity: 999,
          skuId: 'CAB-HDMI-2M',
          warehouseId: '深圳 A 仓',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe('INVENTORY_INSUFFICIENT_STOCK');
    expect(body.error.message).toContain('库存不足');
  });

  it('returns cached response when idempotency key repeats', async () => {
    const request = () =>
      new NextRequest('http://localhost/api/bff/inventory/inout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': 'demo-repeat-1',
        },
        body: JSON.stringify({
          operation: 'INBOUND',
          quantity: 100,
          skuId: 'CAB-HDMI-2M',
          warehouseId: '深圳 A 仓',
        }),
      });

    const firstResponse = await POST(request());
    const firstBody = await firstResponse.json();
    const secondResponse = await POST(request());
    const secondBody = await secondResponse.json();

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);
    expect(secondBody.data.balanceAfter).toBe(442);
    expect(secondBody).toEqual(firstBody);
  });

  it('requires idempotency key header', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/bff/inventory/inout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'INBOUND',
          quantity: 100,
          skuId: 'CAB-HDMI-2M',
          warehouseId: '深圳 A 仓',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });
});
