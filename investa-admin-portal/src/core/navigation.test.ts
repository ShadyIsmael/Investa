import { describe, expect, it } from 'vitest';
import { COMPANY_NAVIGATION, FOPX_NAVIGATION, GLOBAL_NAVIGATION, getNavigationForPath } from './navigation';

describe('central navigation configuration', () => {
  it('keeps Company Core and product workspace navigation separate', () => {
    expect(getNavigationForPath('/admin')).toBe(COMPANY_NAVIGATION);
    expect(GLOBAL_NAVIGATION).toBe(COMPANY_NAVIGATION);
    expect(getNavigationForPath('/admin/fopx/overview')).toBe(FOPX_NAVIGATION);
    expect(getNavigationForPath('/operations/pricing')).toBe(FOPX_NAVIGATION);
    expect(getNavigationForPath('/company-finance')).toBe(COMPANY_NAVIGATION);
  });

  it('exposes the MVP Company Core groups without adding future products', () => {
    expect(COMPANY_NAVIGATION.map(item => item.route)).toEqual(expect.arrayContaining([
      '/admin',
      '/admin/customers',
      '/admin/sales/opportunities',
      '/admin/catalog/products',
      '/admin/licensing/subscriptions',
      '/admin/finance/invoices',
      '/admin/accounting/general-ledger',
      '/admin/fopx',
      '/admin/users',
      '/admin/access',
      '/admin/settings',
    ]));
    expect(COMPANY_NAVIGATION.some(item => item.labelKey.toLowerCase().includes('nexus'))).toBe(false);
  });

  it('does not expose a second workspace selector', () => {
    expect(FOPX_NAVIGATION.some(item => item.key === 'nexus')).toBe(false);
  });
});

