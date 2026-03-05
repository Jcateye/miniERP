import { NextRequest } from 'next/server';

import { GET } from './route';

describe('bff inventory balances route', () => {
  const originalFetch = globalThis.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (typeof originalNodeEnv === 'undefined') {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (typeof originalApiBase === 'undefined') {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    }
  });

  it('forwards query params for GET', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [{ skuId: 'SKU-1', qty: '10' }] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/balances?skuId=SKU-1&warehouseId=WH-1');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/inventory/balances?skuId=SKU-1&warehouseId=WH-1');
  });

  it('passes through upstream error for GET', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'VALIDATION_INVALID_FILTER', message: 'bad filter' },
        },
        { status: 400 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/balances?warehouseId=WH-1');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_FILTER');
  });

  it('returns 503 when upstream is unavailable', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/balances');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
