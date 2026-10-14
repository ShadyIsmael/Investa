import { describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('@/services/api', () => ({ api: apiMocks }));

import { fundingGoalAdminService } from './fundingGoalAdminService';

describe('fundingGoalAdminService', () => {
  it('maps bilingual records and forwards search/status filters', async () => {
    apiMocks.get.mockResolvedValueOnce({
      success: true,
      data: [{
        Id: 7, Code: 'WORKINGCAPITAL', NameEn: 'Working Capital', NameAr: 'رأس المال العامل',
        DescriptionEn: 'Operating cash flow', DescriptionAr: 'التدفقات التشغيلية', SortOrder: 5,
        IsActive: false, ReferenceCount: 4,
      }],
    });

    const result = await fundingGoalAdminService.list('working', 'false');

    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/funding-goals?search=working&isActive=false');
    expect(result[0]).toMatchObject({
      id: 7, code: 'WORKINGCAPITAL', nameEn: 'Working Capital', nameAr: 'رأس المال العامل',
      descriptionAr: 'التدفقات التشغيلية', isActive: false, referenceCount: 4,
    });
  });

  it('keeps code out of edits and uses the immutable id for status changes', async () => {
    apiMocks.put.mockResolvedValueOnce({ data: { Id: 7, Code: 'WORKINGCAPITAL', NameEn: 'Operations', NameAr: 'التشغيل', IsActive: true } });
    apiMocks.patch.mockResolvedValueOnce({ data: { Id: 7, Code: 'WORKINGCAPITAL', IsActive: false } });

    await fundingGoalAdminService.update(7, { nameEn: 'Operations', nameAr: 'التشغيل', sortOrder: 1 });
    await fundingGoalAdminService.setActive(7, false);

    expect(apiMocks.put).toHaveBeenCalledWith('/api/v1/admin/funding-goals/7', expect.not.objectContaining({ code: expect.anything() }));
    expect(apiMocks.patch).toHaveBeenCalledWith('/api/v1/admin/funding-goals/7/status', { isActive: false });
  });
});
