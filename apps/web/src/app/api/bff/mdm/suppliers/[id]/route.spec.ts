import { NextRequest } from 'next/server';

import { DELETE, PUT } from './route';

describe('bff mdm supplier detail route', () => {
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

  it('forwards PUT to backend patch endpoint with normalized payload', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init });
      return Response.json({ id: 'sup_001', name: '华为技术有限公司' }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers/sup_001', {
      method: 'PUT',
      body: JSON.stringify({
        name: ' 华为技术有限公司 ',
        contact: ' 安经理 ',
        phone: ' ',
        email: ' buyer@vendor.test ',
        address: ' 深圳市龙岗区 ',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'sup_001' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'sup_001', name: '华为技术有限公司' });
    expect(String(calls[0]?.input)).toBe(
      'http://backend.test/api/suppliers/sup_001',
    );
    expect(calls[0]?.init?.method).toBe('PATCH');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      name: '华为技术有限公司',
      contactPerson: '安经理',
      contactPhone: null,
      email: 'buyer@vendor.test',
      address: '深圳市龙岗区',
    });
  });

  it('returns 400 when PUT body is invalid JSON', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers/sup_001', {
      method: 'PUT',
      body: '{',
      headers: { 'content-type': 'application/json' },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'sup_001' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_JSON');
  });

  it('returns 400 when PUT name is empty', async () => {
    process.env.NODE_ENV = 'test';

    const response = await PUT(
      new NextRequest('http://localhost/api/bff/mdm/suppliers/sup_001', {
        method: 'PUT',
        body: JSON.stringify({ name: '   ' }),
        headers: { 'content-type': 'application/json' },
      }),
      {
        params: Promise.resolve({ id: 'sup_001' }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe('name cannot be empty');
  });

  it('returns 400 when PUT email format is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const response = await PUT(
      new NextRequest('http://localhost/api/bff/mdm/suppliers/sup_001', {
        method: 'PUT',
        body: JSON.stringify({ email: 'invalid-email' }),
        headers: { 'content-type': 'application/json' },
      }),
      {
        params: Promise.resolve({ id: 'sup_001' }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe('email must be a valid email address');
  });

  it('returns 503 when upstream is unavailable for PUT', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers/sup_001', {
      method: 'PUT',
      body: JSON.stringify({ name: '华为技术有限公司' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'sup_001' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });

  it('forwards DELETE to backend with supplier id', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init });
      return Response.json({ id: 'sup_001', deleted: true }, { status: 200 });
    }) as typeof fetch;

    const response = await DELETE(
      new NextRequest('http://localhost/api/bff/mdm/suppliers/sup_001', {
        method: 'DELETE',
      }),
      {
        params: Promise.resolve({ id: 'sup_001' }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'sup_001', deleted: true });
    expect(String(calls[0]?.input)).toBe(
      'http://backend.test/api/suppliers/sup_001',
    );
    expect(calls[0]?.init?.method).toBe('DELETE');
  });
});
