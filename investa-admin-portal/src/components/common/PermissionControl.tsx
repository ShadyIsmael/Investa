import React from 'react';
import { usePermissions } from '@/context/AuthContext';

interface PermissionControlProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  // Backwards-compatible alias used across the codebase
  permissions?: string[];
  // When true and `permissions` is provided, require ALL instead of ANY
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionControl component for UI-level access control.
 * Hides unauthorized elements from the DOM.
 */
const PermissionControl: React.FC<PermissionControlProps> = ({
  permission,
  anyOf,
  allOf,
  // added to destructuring so they are defined in scope
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Support multiple prop shapes for backward-compatibility:
  // - `permission` (single string)
  // - `permissions` (array) with optional `requireAll` flag
  // - `anyOf` / `allOf`
  let isAuthorized = false;
  if (permission) {
    isAuthorized = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions) && permissions.length > 0) {
    isAuthorized = requireAll ? hasAllPermissions(...permissions) : hasAnyPermission(...permissions);
  } else if (anyOf && anyOf.length > 0) {
    isAuthorized = hasAnyPermission(...anyOf);
  } else if (allOf && allOf.length > 0) {
    isAuthorized = hasAllPermissions(...allOf);
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionControl;
