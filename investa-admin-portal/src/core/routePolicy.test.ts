import { describe, expect, it } from 'vitest';
import { canAccessPolicy, matchesPermission } from './routePolicy';

describe('central route policy compatibility', () => {
  it('accepts a canonical policy through a legacy permission alias', () => {
    expect(matchesPermission('Global.Users.View', ['User.Manage'])).toBe(true);
  });

  it('supports wildcard administrator access', () => {
    expect(canAccessPolicy({ requiredPermissions: ['FOPX.Opportunities.View'] }, ['*'], true)).toBe(true);
  });

  it('denies unauthenticated access and missing permissions', () => {
    expect(canAccessPolicy({ requiredPermissions: ['Global.Users.View'] }, ['User.View'], false)).toBe(false);
    expect(canAccessPolicy({ requiredPermissions: ['Global.Users.View'] }, ['Finance.View'], true)).toBe(false);
  });

  it('supports any-of and all-of policy requirements', () => {
    expect(canAccessPolicy({ anyOf: ['Global.Users.View', 'Global.Users.Manage'] }, ['User.View'], true)).toBe(true);
    expect(canAccessPolicy({ allOf: ['Global.Users.View', 'Global.Access.View'] }, ['User.View', 'RBAC.View'], true)).toBe(true);
    expect(canAccessPolicy({ allOf: ['Global.Users.View', 'Global.Access.View'] }, ['User.View'], true)).toBe(false);
  });

});

