import { POST } from './route';

describe('bff document action route', () => {
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

  it('returns 400 when docType is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'idem-1' },
    });

    const response = await POST(request, {
      params: Promise.resolve({ docType: 'invalid', id: '7001', action: 'confirm' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_DOC_TYPE');
  });

  it('returns 400 when id is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'idem-1' },
    });

    const response = await POST(request, {
      params: Promise.resolve({ docType: 'SO', id: 'abc', action: 'confirm' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_ID');
  });

  it('returns 400 when action is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'idem-1' },
    });

    const response = await POST(request, {
      params: Promise.resolve({ docType: 'SO', id: '7001', action: 'delete' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_ACTION');
  });

  it('returns 400 when idempotency key is missing', async () => {
    process.env.NODE_ENV = 'test';

    const request = new Request('http://localhost', {
      method: 'POST',
    });

    const response = await POST(request, {
      params: Promise.resolve({ docType: 'SO', id: '7001', action: 'confirm' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('BFF_IDEMPOTENCY_KEY_REQUIRED');
  });

  it('forwards request with idempotency key to backend', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init: RequestInit | undefined }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init: init as RequestInit | undefined });
      return Response.json({ success: true }, { status: 200 });
    }) as typeof fetch;

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'idem-1' },
    });

    const response = await POST(request, {
      params: Promise.resolve({ docType: 'so', id: '7001', action: 'confirm' }),
    });

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/documents/SO/7001/confirm');
    expect(calls[0]?.init?.method).toBe('POST');
    expect((calls[0]?.init?.headers as Record<string, string>)['Idempotency-Key']).toBe('idem-1');
  });

  it('returns 503 when upstream is unavailable', async () => {
    process.env.NODE_ENV = 'test';

    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'idem-1' },
    });

    const response = await POST(request, {
      params: Promise.resolve({ docType: 'SO', id: '7001', action: 'confirm' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
    expect(response.headers.get('x-bff-fallback-hit')).toBe('0');
  });
});
