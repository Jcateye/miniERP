import { NextRequest } from 'next/server';

import { GET, POST } from './route';

describe('bff mdm suppliers route', () => {
  const originalFetch = globalThis.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const originalFixtureFallback = process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;

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

    if (typeof originalFixtureFallback === 'undefined') {
      delete process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;
    } else {
      process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK =
        originalFixtureFallback;
    }
  });

  it('maps backend suppliers and applies query sort pagination on GET', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK = 'false';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json(
        {
          data: [
            {
              id: 'sup_001',
              tenantId: '1001',
              code: 'V-001',
              name: '华为技术有限公司',
              contactPerson: '安经理',
              contactPhone: '136-1000-0001',
              email: 'an@example.com',
              address: '深圳市龙岗区',
              isActive: true,
              createdAt: '2026-03-01T08:00:00.000Z',
              updatedAt: '2026-03-08T08:00:00.000Z',
            },
            {
              id: 'sup_002',
              tenantId: '1001',
              code: 'V-002',
              name: '南方连接器制造',
              contactPerson: '郭峰',
              contactPhone: '136-1000-0002',
              email: 'guo@example.com',
              address: '东莞市厚街镇',
              isActive: true,
              createdAt: '2026-03-01T08:00:00.000Z',
              updatedAt: '2026-03-08T08:00:00.000Z',
            },
            {
              id: 'sup_005',
              tenantId: '1001',
              code: 'V-005',
              name: '鸿鹏电子器件',
              contactPerson: '刘欣',
              contactPhone: '136-1000-0005',
              email: 'liu@example.com',
              address: '苏州市高新区',
              isActive: true,
              createdAt: '2026-03-04T08:00:00.000Z',
              updatedAt: '2026-03-09T08:00:00.000Z',
            },
          ],
        },
        { status: 200 },
      );
    }) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/mdm/suppliers?q=rohs&sortBy=orders&sortOrder=desc&page=1&pageSize=1',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/suppliers');
    expect(body.message).toBe('OK');
    expect(body.data.total).toBe(2);
    expect(body.data.page).toBe(1);
    expect(body.data.pageSize).toBe(1);
    expect(body.data.data).toHaveLength(1);
    expect(body.data.data[0]).toMatchObject({
      code: 'V-005',
      status: 'normal',
    });
  });

  it('returns 400 when POST body is invalid JSON', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers', {
      method: 'POST',
      body: '{',
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_JSON');
  });

  it('normalizes POST payload before forwarding to backend', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init });
      return Response.json({ id: 'sup_007', code: 'V-007' }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        code: ' V-007 ',
        name: ' 新供应商 ',
        contact: ' 张三 ',
        phone: ' ',
        email: ' buyer@vendor.test ',
        address: ' ',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'sup_007', code: 'V-007' });
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/suppliers');
    expect(calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      code: 'V-007',
      name: '新供应商',
      contactPerson: '张三',
      contactPhone: null,
      email: 'buyer@vendor.test',
      address: null,
    });
  });

  it('returns 400 when POST email is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        code: 'V-008',
        name: '无效邮箱供应商',
        email: 'invalid-email',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe('email must be a valid email address');
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

    const request = new NextRequest('http://localhost/api/bff/mdm/suppliers', {
      method: 'POST',
      body: JSON.stringify({ code: 'V-001', name: '重复供应商' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe('MASTERDATA_DUPLICATE_CODE');
  });
});
