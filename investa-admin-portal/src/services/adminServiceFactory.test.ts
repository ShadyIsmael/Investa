import { describe, expect, it, vi, beforeEach } from 'vitest';

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() }));
vi.mock('@/services/api', () => ({ api: apiMocks }));

import { createAdminService, unwrapEnvelope, buildListQuery, str, num, bool } from './adminServiceFactory';

describe('adminServiceFactory helpers', () => {
  it('unwraps data / data.items / items envelopes', () => {
    expect(unwrapEnvelope({ data: [1] })).toEqual([1]);
    expect(unwrapEnvelope({ data: { items: [2] } })).toEqual([2]);
    expect(unwrapEnvelope({ items: [3] })).toEqual([3]);
    expect(unwrapEnvelope([4])).toEqual([4]);
  });

  it('builds list query only with provided filters', () => {
    expect(buildListQuery('', '')).toBe('');
    expect(buildListQuery('egypt', 'true')).toBe('?search=egypt&isActive=true');
    expect(buildListQuery('  ', 'false')).toBe('?isActive=false');
  });

  it('safe coercions have sane fallbacks', () => {
    expect(str(1)).toBe('1');
    expect(str(undefined)).toBe('');
    expect(num('abc')).toBe(0);
    expect(num('5')).toBe(5);
    expect(bool('true')).toBe(true);
    expect(bool(0)).toBe(false);
  });
});

describe('createAdminService CRUD contract', () => {
  beforeEach(() => vi.clearAllMocks());

  const service = createAdminService<{ id: number; name: string }, { name: string }, { name: string }, number>({
    basePath: '/api/v1/admin/demo',
    map: (raw) => ({ id: Number(raw['id'] ?? 0), name: String(raw['name'] ?? '') }),
  });

  it('list unwraps envelope and forwards filters', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'A' }] });
    const result = await service.list('a', 'true');
    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/demo?search=a&isActive=true');
    expect(result).toEqual([{ id: 1, name: 'A' }]);
  });

  it('create/update/setActive hit REST conventions', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { id: 1, name: 'A' } });
    apiMocks.put.mockResolvedValueOnce({ data: { id: 1, name: 'B' } });
    apiMocks.patch.mockResolvedValueOnce({ data: { id: 1, name: 'C' } });

    await service.create({ name: 'A' });
    await service.update(1, { name: 'B' });
    await service.setActive(1, false);

    expect(apiMocks.post).toHaveBeenCalledWith('/api/v1/admin/demo', { name: 'A' });
    expect(apiMocks.put).toHaveBeenCalledWith('/api/v1/admin/demo/1', { name: 'B' });
    expect(apiMocks.patch).toHaveBeenCalledWith('/api/v1/admin/demo/1/status', { isActive: false });
  });
});
