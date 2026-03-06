import { NextRequest } from 'next/server';

import { DELETE, PATCH } from './route';

describe('bff warehouse detail route', () => {
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

  it('forwards PATCH to backend with id and payload', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init });
      return Response.json({ id: 'w1', name: 'Main Warehouse' }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/warehouses/w1', {
      method: 'PATCH',
      body: JSON.stringify({ name: ' Main Warehouse ', isActive: true, address: ' ' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'w1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'w1', name: 'Main Warehouse' });
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/warehouses/w1');
    expect(calls[0]?.init?.method).toBe('PATCH');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      name: 'Main Warehouse',
      isActive: true,
      address: null,
    });
  });

  it('returns 400 when PATCH body is invalid JSON', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/warehouses/w1', {
      method: 'PATCH',
      body: '{',
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'w1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_JSON');
  });

  it('returns 400 when PATCH body contains unsupported fields', async () => {
    process.env.NODE_ENV = 'test';

    const response = await PATCH(
      new NextRequest('http://localhost/api/bff/warehouses/w1', {
        method: 'PATCH',
        body: JSON.stringify({ code: 'WH-001' }),
        headers: { 'content-type': 'application/json' },
      }),
      {
        params: Promise.resolve({ id: 'w1' }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe('Request body contains unsupported fields');
  });

  it('returns 400 when PATCH name is empty', async () => {
    process.env.NODE_ENV = 'test';

    const response = await PATCH(
      new NextRequest('http://localhost/api/bff/warehouses/w1', {
        method: 'PATCH',
        body: JSON.stringify({ name: '   ' }),
        headers: { 'content-type': 'application/json' },
      }),
      {
        params: Promise.resolve({ id: 'w1' }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe('name cannot be empty');
  });

  it('returns 400 when PATCH isActive is not boolean', async () => {
    process.env.NODE_ENV = 'test';

    const response = await PATCH(
      new NextRequest('http://localhost/api/bff/warehouses/w1', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: 'true' }),
        headers: { 'content-type': 'application/json' },
      }),
      {
        params: Promise.resolve({ id: 'w1' }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe('isActive must be boolean');
  });

  it('passes through upstream PATCH error', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'MASTERDATA_DUPLICATE_CODE', message: 'duplicate code' },
        },
        { status: 409 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/warehouses/w1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Main Warehouse' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'w1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe('MASTERDATA_DUPLICATE_CODE');
  });

  it('returns 503 when upstream is unavailable for PATCH', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/warehouses/w1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Main Warehouse' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'w1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });

  it('forwards DELETE to backend with id', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init });
      return Response.json({ id: 'w1', deleted: true }, { status: 200 });
    }) as typeof fetch;

    const response = await DELETE(new NextRequest('http://localhost/api/bff/warehouses/w1', {
      method: 'DELETE',
    }), {
      params: Promise.resolve({ id: 'w1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'w1', deleted: true });
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/warehouses/w1');
    expect(calls[0]?.init?.method).toBe('DELETE');
  });

  it('returns 503 when upstream is unavailable for DELETE', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const response = await DELETE(new NextRequest('http://localhost/api/bff/warehouses/w1', {
      method: 'DELETE',
    }), {
      params: Promise.resolve({ id: 'w1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});

