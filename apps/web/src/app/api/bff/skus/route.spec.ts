import { NextRequest } from 'next/server';

import { GET, POST } from './route';

describe('bff skus route', () => {
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

  it('forwards normalized query params for GET', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [{ id: 'sku-1' }] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/skus?code=CAB&name=HDMI&categoryId=cat_cable&isActive=true&cursor=abc',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: [{ id: 'sku-1' }] });
    expect(String(calls[0]?.input)).toBe(
      'http://backend.test/api/skus?code=CAB&name=HDMI&categoryId=cat_cable&isActive=true&cursor=abc',
    );
  });

  it('removes empty query values before forwarding GET upstream request', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [{ id: 'sku-1' }] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/skus?code=&name=&categoryId=&cursor=abc',
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/skus?cursor=abc');
  });

  it('returns filtered fixtures when GET upstream is unavailable in test', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/skus?code=LAN&categoryId=cat_cable&isActive=true',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('fixture');
    expect(body.total).toBe(1);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: 'sku_003',
        code: 'CAB-LAN-CAT6',
        categoryId: 'cat_cable',
        isActive: true,
      }),
    ]);
  });

  it('treats empty query values as absent during fixture fallback', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/skus?code=&name=&categoryId=&isActive=true',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('fixture');
    expect(body.total).toBe(3);
    expect(body.data).toHaveLength(3);
  });

  it('returns 400 when GET isActive query is invalid', async () => {
    process.env.NODE_ENV = 'test';
    const fetchSpy = jest.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/skus?isActive=invalid');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_QUERY');
    expect(body.error.message).toBe('isActive must be true or false');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('passes through upstream error for GET when fixture fallback is enabled', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'PERMISSION_UNEXPECTED', message: 'Permission denied' },
        },
        { status: 403 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/skus');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe('PERMISSION_UNEXPECTED');
  });

  it('returns 503 when GET upstream is unavailable and fixture fallback is disabled', async () => {
    process.env.NODE_ENV = 'production';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/skus');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });

  it('returns 400 when POST idempotency key is missing', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/skus', {
      method: 'POST',
      body: JSON.stringify({ code: 'SKU001', name: 'HDMI高清线 2米' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });

  it('returns 400 when POST body is invalid JSON', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/skus', {
      method: 'POST',
      body: '{',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'sku-create-1',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('INVALID_JSON');
  });

  it('passes through upstream error for POST', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'MASTERDATA_DUPLICATE_CODE', message: 'duplicate code' },
        },
        { status: 409 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/skus', {
      method: 'POST',
      body: JSON.stringify({ code: 'SKU001', name: 'HDMI高清线 2米' }),
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'sku-create-1',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe('MASTERDATA_DUPLICATE_CODE');
  });
});
