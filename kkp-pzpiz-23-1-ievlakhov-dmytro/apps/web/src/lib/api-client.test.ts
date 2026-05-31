import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api-client';

afterEach(() => vi.restoreAllMocks());

describe('apiFetch', () => {
  it('prefixes the base url and parses JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
    const data = await apiFetch<{ ok: number }>('/products');
    expect(data).toEqual({ ok: 1 });
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('/api/products');
  });

  it('throws ApiError carrying code+message on error responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'CONFLICT', message: 'dup' }), { status: 409, headers: { 'Content-Type': 'application/json' } })));
    await expect(apiFetch('/categories', { method: 'POST' })).rejects.toMatchObject({ code: 'CONFLICT', status: 409 });
  });
});
