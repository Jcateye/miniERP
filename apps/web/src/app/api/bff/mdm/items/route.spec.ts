import { NextRequest } from 'next/server';

import { GET, POST } from './route';

const originalFetch = global.fetch;

describe('/api/bff/mdm/items route', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    process.env.NODE_ENV = 'development';
    process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK = 'false';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;
  });

  it('forwards list query to backend items endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    });

    const request = new NextRequest(
      'http://localhost/api/bff/mdm/items?code=CAB&name=HDMI&isActive=true',
    );
    const response = await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://backend.test/api/items?code=CAB&name=HDMI&isActive=true',
      expect.objectContaining({
        cache: 'no-store',
      }),
    );
    expect(response.status).toBe(200);
  });

  it('rejects create without idempotency key', async () => {
    const request = new NextRequest('http://localhost/api/bff/mdm/items', {
      method: 'POST',
      body: JSON.stringify({ code: 'ITEM-001' }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });
});
