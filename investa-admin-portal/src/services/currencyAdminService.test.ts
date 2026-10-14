import { describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('@/services/api', () => ({ api: apiMocks }));

import { currencyAdminService } from './currencyAdminService';

describe('currencyAdminService', () => {
  it('maps bilingual admin records and sends list filters to the backend', async () => {
    apiMocks.get.mockResolvedValueOnce({
      success: true,
      data: [{
        ISOCode: 'EGP', EnglishName: 'Egyptian Pound', ArabicName: 'الجنيه المصري', Symbol: 'E£', DecimalDigits: 2,
        IsActive: true, SupportsFunding: true, SupportsSettlement: true, SupportsWallet: true,
        CreatedAt: '2026-01-01T00:00:00Z', Usage: { TotalReferences: 3, IsReferenced: true },
      }],
    });

    const result = await currencyAdminService.list('egypt', 'true');

    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/currencies?search=egypt&isActive=true');
    expect(result[0]).toMatchObject({
      isoCode: 'EGP', englishName: 'Egyptian Pound', arabicName: 'الجنيه المصري', symbol: 'E£', decimalDigits: 2,
      isActive: true, supportsFunding: true, supportsSettlement: true, supportsWallet: true,
      usage: { totalReferences: 3, isReferenced: true },
    });
  });

  it('uses immutable ISO route keys for update and status changes', async () => {
    apiMocks.put.mockResolvedValueOnce({ data: { ISOCode: 'USD', EnglishName: 'US Dollar', ArabicName: 'الدولار الأمريكي', Symbol: '$', DecimalDigits: 2, IsActive: true } });
    apiMocks.patch.mockResolvedValueOnce({ data: { ISOCode: 'USD', IsActive: false } });

    await currencyAdminService.update('USD', {
      englishName: 'US Dollar', arabicName: 'الدولار الأمريكي', symbol: '$', decimalDigits: 2,
      isActive: true, supportsFunding: true, supportsSettlement: true, supportsWallet: true,
    });
    await currencyAdminService.setActive('USD', false);

    expect(apiMocks.put).toHaveBeenCalledWith('/api/v1/admin/currencies/USD', expect.objectContaining({ englishName: 'US Dollar' }));
    expect(apiMocks.patch).toHaveBeenCalledWith('/api/v1/admin/currencies/USD/status', { isActive: false });
  });
});
