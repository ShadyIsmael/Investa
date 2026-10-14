import { describe, expect, it } from 'vitest';
import { COMPANY_NAVIGATION, FOPX_NAVIGATION } from './navigation';
import { CANONICAL_ROUTE_REGISTRY, getCanonicalRoute, LEGACY_ROUTE_REDIRECTS, policyForRoute } from './routeRegistry';
import { PERMISSION_TEST_PERSONAS } from './permissionTestPersonas';
import { canAccessPolicy } from './routePolicy';

describe('canonical admin route registry', () => {
  it('maps every global and FOPX navigation item to a registered policy', () => {
    [...COMPANY_NAVIGATION, ...FOPX_NAVIGATION].forEach(item => {
      const route = getCanonicalRoute(item.route);
      expect(route?.requiredPermissions).toEqual(item.requiredPermissions);
    });
  });

  it('keeps workspace ownership and component metadata explicit', () => {
    expect(getCanonicalRoute('/admin')?.ownership).toBe('company');
    expect(getCanonicalRoute('/admin/fopx/users')?.ownership).toBe('fopx');
    expect(getCanonicalRoute('/admin/fopx/users')?.component).toBe('ClientsList');
    expect(CANONICAL_ROUTE_REGISTRY.length).toBeGreaterThan(20);
    expect(getCanonicalRoute('/admin/fopx/projects')?.availability).toBe('placeholder');
    expect(getCanonicalRoute('/admin/fopx/opportunities')?.component).toBe('OpportunityListPage');
    expect(getCanonicalRoute('/admin/fopx/opportunities')?.availability).toBeUndefined();
    expect(getCanonicalRoute('/admin/fopx/opportunities/:opportunityId')?.component).toBe('OpportunityDetailPage');
    expect(getCanonicalRoute('/admin/customers')?.ownership).toBe('company');
    expect(getCanonicalRoute('/admin/customers')?.component).toBe('CustomerListPage');
    expect(getCanonicalRoute('/admin/customers')?.availability).toBeUndefined();
    expect(getCanonicalRoute('/admin/catalog/products')?.requiredPermissions).toEqual(['Company.Products.View']);
    expect(getCanonicalRoute('/admin/catalog/products')?.component).toBe('CatalogListPage');
    expect(getCanonicalRoute('/admin/catalog/products')?.availability).toBeUndefined();
    expect(getCanonicalRoute('/admin/fopx')?.ownership).toBe('fopx');
  });

  it('returns an authenticated default for unknown metadata lookups', () => {
    expect(policyForRoute('/not-registered')).toEqual({ authenticated: true });
  });

  it('keeps route access behavior aligned for test permission personas', () => {
    expect(canAccessPolicy(policyForRoute('/admin'), PERMISSION_TEST_PERSONAS.globalReadOnlyAdmin.permissions, true)).toBe(true);
    expect(canAccessPolicy(policyForRoute('/admin/fopx/opportunities'), PERMISSION_TEST_PERSONAS.fopxScopedAdmin.permissions, true)).toBe(true);
    expect(canAccessPolicy(policyForRoute('/admin/fopx/opportunities'), PERMISSION_TEST_PERSONAS.noRequiredPermission.permissions, true)).toBe(false);
    expect(canAccessPolicy(policyForRoute('/admin'), PERMISSION_TEST_PERSONAS.fopxScopedAdmin.permissions, false)).toBe(false);
  });

  it('declares legacy redirects without creating a second policy family', () => {
    expect(LEGACY_ROUTE_REDIRECTS['/support']).toBe('/admin-support');
    expect(LEGACY_ROUTE_REDIRECTS['/dashboard']).toBe('/admin/fopx/overview');
  });
});
