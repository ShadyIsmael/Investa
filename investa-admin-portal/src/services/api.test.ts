import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, setAuthToken, setUseMocks } from './api';

describe('api connection health signaling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setUseMocks(false);
    setAuthToken(null, false);
  });

  it('does not report the backend unreachable for an HTTP business error', async () => {
    const unreachable = vi.fn();
    window.addEventListener('investa:backend:unreachable', unreachable);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, code: 'CUSTOMER_NOT_FOUND', message: 'Customer was not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    await expect(api.get('/api/v1/admin/customers/00000000-0000-0000-0000-000000000000'))
      .rejects.toMatchObject({ status: 404 });
    expect(unreachable).not.toHaveBeenCalled();

    window.removeEventListener('investa:backend:unreachable', unreachable);
  });

  it('still reports the backend unreachable when the request cannot connect', async () => {
    const unreachable = vi.fn();
    window.addEventListener('investa:backend:unreachable', unreachable);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));

    await expect(api.get('/api/v1/admin/customers'))
      .rejects.toMatchObject({ status: 0 });
    expect(unreachable).toHaveBeenCalledTimes(1);

    window.removeEventListener('investa:backend:unreachable', unreachable);
  });

  it('preserves ApiError details for Company validation failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, code: 'CATALOG_WORKSPACE_INVALID', message: 'A supported workspace key is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    try {
      await api.post('/api/v1/admin/catalog/products', {});
      throw new Error('Expected api.post to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status: 400, response: { code: 'CATALOG_WORKSPACE_INVALID' } });
    }
  });
});
