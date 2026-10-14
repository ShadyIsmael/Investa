export type PermissionTestPersona =
  | 'superAdmin'
  | 'globalReadOnlyAdmin'
  | 'fopxScopedAdmin'
  | 'noRequiredPermission';

export interface PermissionTestIdentity {
  persona: PermissionTestPersona;
  authenticated: boolean;
  permissions: string[];
}

/** Test-only identities; these are never seeded into a runtime database. */
export const PERMISSION_TEST_PERSONAS: Record<PermissionTestPersona, PermissionTestIdentity> = {
  superAdmin: { persona: 'superAdmin', authenticated: true, permissions: ['*'] },
  globalReadOnlyAdmin: {
    persona: 'globalReadOnlyAdmin',
    authenticated: true,
    permissions: ['Global.SystemHealth.View', 'Global.Users.View', 'Global.Access.View'],
  },
  fopxScopedAdmin: {
    persona: 'fopxScopedAdmin',
    authenticated: true,
    permissions: ['Dashboard.View', 'FOPX.Opportunities.View'],
  },
  noRequiredPermission: { persona: 'noRequiredPermission', authenticated: true, permissions: [] },
};
