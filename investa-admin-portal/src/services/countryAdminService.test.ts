import { describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() }));
vi.mock('@/services/api', () => ({ api: apiMocks }));
import { countryAdminService } from './countryAdminService';

describe('countryAdminService', () => {
  it('maps bilingual ISO metadata and status filters', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: [{ Id: 1, Code: 'EGYPT', IsoAlpha2: 'EG', IsoAlpha3: 'EGY', NameEn: 'Egypt', NameAr: 'مصر', PhoneCode: '+20', IsActive: true, ReferenceCount: 3 }] });
    const result = await countryAdminService.list('egypt', 'true');
    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/countries?search=egypt&isActive=true');
    expect(result[0]).toMatchObject({ id: 1, isoAlpha2: 'EG', isoAlpha3: 'EGY', nameAr: 'مصر', phoneCode: '+20', referenceCount: 3 });
  });

  it('keeps ISO Alpha-2 out of update payloads', async () => {
    apiMocks.put.mockResolvedValueOnce({ data: { Id: 1, Code: 'EGYPT', IsoAlpha2: 'EG', NameEn: 'Egypt', NameAr: 'مصر' } });
    await countryAdminService.update(1, { nameEn: 'Egypt', nameAr: 'مصر', sortOrder: 1 });
    expect(apiMocks.put).toHaveBeenCalledWith('/api/v1/admin/countries/1', expect.not.objectContaining({ isoAlpha2: expect.anything() }));
  });
});
