/**
 * Permission-Based Authentication Context
 * Enterprise-grade permission management with JWT parsing
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  setAuthToken,
  getAuthToken,
  ADMIN_AUTHENTICATED_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  ADMIN_TOKEN_EXPIRES_AT_KEY,
  ADMIN_REFRESH_EXPIRES_AT_KEY,
  ADMIN_ACCESS_TOKEN_KEY,
} from '../services/api';
import { storage } from '../utils/environment';

// Permission types - extend as needed
export type Permission = string; // e.g., 'Chat.View', 'Account.Audit', 'User.Delete'

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permissions: Permission[];
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  permissions: Permission[];
  login: (token: string, redirect?: string) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasAllPermissions: (...permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Parse JWT token and extract permissions claim
 * Expects JWT with a "permissions" claim as array of strings
 */
export function parseJWT(token: string): { permissions: Permission[]; roles: string[]; user: Partial<AuthUser> } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    // Extract permissions - support various claim formats
    let permissions: Permission[] = [];
    
    // Try different common claim names for permissions (plural and singular)
    let permClaim: any = payload.permissions || 
                     payload.Permissions || 
                     payload.permission || 
                     payload.Permission || 
                     payload.scope || 
                     payload.scopes ||
                     [];

    // If still not found, search for any claim key that includes 'permission' (case-insensitive)
    if ((!permClaim || (Array.isArray(permClaim) && permClaim.length === 0) || (typeof permClaim === 'string' && permClaim.trim() === '')) && payload) {
      for (const k of Object.keys(payload)) {
        if (/permission/i.test(k) && payload[k]) {
          permClaim = payload[k];
          break;
        }
      }
    }

    // Normalize to array
    if (Array.isArray(permClaim)) {
      // If entries look like objects with nested permissions (e.g., [{ groupId, permissions: [] }]) flatten them
      if (permClaim.length > 0 && typeof permClaim[0] === 'object' && permClaim[0] !== null) {
        const flat: string[] = [];
        for (const entry of permClaim as any[]) {
          if (!entry) continue;
          if (Array.isArray(entry.permissions) && entry.permissions.length) {
            for (const p of entry.permissions) flat.push(String(p));
          } else if (Array.isArray(entry.perms) && entry.perms.length) {
            for (const p of entry.perms) flat.push(String(p));
          } else {
            // If object keys are direct permission strings, collect string values
            Object.values(entry).forEach(v => {
              if (typeof v === 'string') flat.push(v);
              else if (Array.isArray(v)) v.forEach((x:any) => flat.push(String(x)));
            });
          }
        }
        permissions = flat;
      } else {
        permissions = permClaim.map(p => String(p));
      }
    } else if (typeof permClaim === 'string') {
      // Support space or comma separated strings and single values like '*.*'
      permissions = permClaim.split(/[\s,]+/).filter(Boolean);
    } else if (permClaim != null) {
      // Other convetions - try to coerce
      permissions = [String(permClaim)];
    }

    // Fallback: if no permissions present but token contains role(s), map common admin roles to wildcard
    let roleClaim = payload.role || payload.roles || payload.Role || payload.Roles;
    // If still not found, search for any claim key that includes 'role' (case-insensitive)
    if (!roleClaim) {
      for (const k of Object.keys(payload)) {
        if (/role/i.test(k) && payload[k]) {
          roleClaim = payload[k];
          break;
        }
      }
    }

    const roleList = Array.isArray(roleClaim) ? roleClaim.map((r: any) => String(r)) : (typeof roleClaim === 'string' ? [String(roleClaim)] : []);

    if (permissions.length === 0 && roleList.length > 0) {
      const adminLike = roleList.some(r => /admin/i.test(r) || /super/i.test(r));
      if (adminLike) {
        // Grant wildcard permission for admin-like roles as a safe fallback
        permissions = ['*'];
        // Log for easier debugging in dev

      }
    }

    // Extract user info from JWT
    const user: Partial<AuthUser> = {
      id: payload.sub || payload.userId || payload.id || '',
      name: payload.name || payload.fullName || payload.userName || '',
      email: payload.email || payload.emailAddress || '',
      avatar: payload.avatar || payload.picture || undefined,
    };

    return { permissions, roles: roleList, user };
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode; onRedirect?: (path: string) => void }> = ({ 
  children, 
  onRedirect 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const scoped = storage.get(ADMIN_AUTHENTICATED_KEY);
    if (scoped !== null) return scoped === 'true';

    const legacy = storage.get('is-authenticated');
    if (legacy !== null) {
      storage.set(ADMIN_AUTHENTICATED_KEY, legacy);
      storage.remove('is-authenticated');
      return legacy === 'true';
    }

    return false;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    // Try to restore from stored token on mount
    const token = getAuthToken();
    if (token) {
      const parsed = parseJWT(token);
      if (parsed) {
        return {
          ...parsed.user,
          id: parsed.user.id || '',
          name: parsed.user.name || '',
          email: parsed.user.email || '',
          permissions: parsed.permissions,
        } as AuthUser;
      }
    }
    return null;
  });

  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const userPerms = user?.permissions || [];
    // Developer override: force all permissions when localStorage key set
    try {
      const forceAll = storage.get('forceAllPermissions') === 'true';
      if (forceAll) return ['*'];
    } catch (e) {
      // ignore
    }
    // In development, provide wildcard access so all nav items are visible
    if (userPerms.length === 0 && process.env.NODE_ENV === 'development') {
      return ['*'];
    }
    return userPerms;
  });

  // Sync with localStorage
  useEffect(() => {
    storage.set(ADMIN_AUTHENTICATED_KEY, String(isAuthenticated));
  }, [isAuthenticated]);

  // Dev helper: if developer wants to force all perms and no token exists,
  // inject a mock JWT containing permissions: ['*'] so tools that read token behave consistently.
  useEffect(() => {
    try {
      const forceAll = storage.get('forceAllPermissions') === 'true';
      const existingToken = getAuthToken();
      if (forceAll && !existingToken) {
        const header = { alg: 'none', typ: 'JWT' };
        const payload = {
          sub: 'dev-user',
          name: 'Dev Admin',
          email: 'dev@local',
          permissions: ['*'],
          role: 'Admin',
          iat: Math.floor(Date.now() / 1000),
        };
        const base64Url = (obj: any) => {
          const s = btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          return s;
        };
        const token = `${base64Url(header)}.${base64Url(payload)}.`; // unsigned token for dev
        try {
          setAuthToken(token, true);
        } catch (e) {}
        try { storage.set(ADMIN_ACCESS_TOKEN_KEY, token); } catch (e) {}

        // Also initialize in-memory state for immediate UX
        setUser({ id: 'dev-user', name: 'Dev Admin', email: 'dev@local', permissions: ['*'] });
        setPermissions(['*']);
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore dev injection errors
    }
  }, []);

  const login = useCallback((token: string, redirect?: string) => {
    // Parse JWT and extract permissions
    const parsed = parseJWT(token);
    
    if (!parsed) {
      console.error('Invalid token - cannot extract permissions');
      return;
    }

    // Store token (persist) and also explicitly mirror into storage for robustness
    setAuthToken(token, true);
    try { storage.set(ADMIN_ACCESS_TOKEN_KEY, token); } catch (e) { /* ignore */ }

    // Set user with permissions
    const authUser: AuthUser = {
      ...parsed.user,
      id: parsed.user.id || '',
      name: parsed.user.name || '',
      email: parsed.user.email || '',
      permissions: parsed.permissions,
    } as AuthUser;

    // Respect developer override to force all permissions
    try {
      const forceAll = storage.get('forceAllPermissions') === 'true';
      if (forceAll) {
        setUser({ ...authUser, permissions: ['*'] });
        setPermissions(['*']);
      } else {
        setUser(authUser);
        setPermissions(parsed.permissions);
      }
    } catch (e) {
      setUser(authUser);
      setPermissions(parsed.permissions);
    }
    setIsAuthenticated(true);

    // Log extracted permissions for debugging


    // Emit login event
    try {
      window.dispatchEvent(new CustomEvent('investa:auth:login', { 
        detail: { user: authUser, permissions: parsed.permissions }
      }));
    } catch (e) {
      // Ignore
    }

    // Handle redirect
    if (redirect && onRedirect) {
      onRedirect(redirect);
    }
  }, [onRedirect]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    setAuthToken(null);
    // Clean all auth storage to avoid stale tokens
    try { storage.remove(ADMIN_AUTHENTICATED_KEY); } catch (e) {}
    try { storage.remove(ADMIN_ACCESS_TOKEN_KEY); } catch (e) {}
    try { storage.remove(ADMIN_REFRESH_TOKEN_KEY); } catch (e) {}
    try { storage.remove(ADMIN_TOKEN_EXPIRES_AT_KEY); } catch (e) {}
    try { storage.remove(ADMIN_REFRESH_EXPIRES_AT_KEY); } catch (e) {}
    // Remove legacy shared keys to prevent cross-portal contamination.
    try { storage.remove('token'); } catch (e) {}
    try { storage.remove('refreshToken'); } catch (e) {}
    try { storage.remove('tokenExpiresAt'); } catch (e) {}
    try { storage.remove('refreshExpiresAt'); } catch (e) {}
    try { storage.remove('is-authenticated'); } catch (e) {}

    // Emit logout event
    try {
      window.dispatchEvent(new CustomEvent('investa:auth:logout'));
    } catch (e) {
      // Ignore
    }
  }, []);

  // Permission checking helpers
  const hasPermission = useCallback((permission: Permission): boolean => {
    // Wildcard support: if user has '*' or '*.*' treat as full access
    if (permissions.includes('*') || permissions.includes('*.*')) return true;
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((...requiredPermissions: Permission[]): boolean => {
    if (permissions.includes('*') || permissions.includes('*.*')) return true;
    return requiredPermissions.some(perm => permissions.includes(perm));
  }, [permissions]);

  const hasAllPermissions = useCallback((...requiredPermissions: Permission[]): boolean => {
    if (permissions.includes('*') || permissions.includes('*.*')) return true;
    return requiredPermissions.every(perm => permissions.includes(perm));
  }, [permissions]);

  // Listen for unauthorized events
  useEffect(() => {
    const handler = () => {
      logout();
    };
    
    window.addEventListener('investa:unauthorized', handler as EventListener);
    
    return () => {
      window.removeEventListener('investa:unauthorized', handler as EventListener);
    };
  }, [logout]);

  const value: AuthContextValue = {
    isAuthenticated,
    user,
    permissions,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function usePermissions(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('usePermissions must be used within AuthProvider');
  }
  return context;
}

// Convenience hook with legacy naming for backward compatibility
export function useAuth(): AuthContextValue {
  return usePermissions();
}
