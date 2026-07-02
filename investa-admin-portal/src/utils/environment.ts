/**
 * Environment Configuration Utility
 * Provides dynamic environment-based URL resolution
 */

/**
 * Gets the dynamic base URL for API requests
 * Uses window.location.hostname to avoid hardcoded IPs
 */
export function getDynamicBaseUrl(): string {
  // Runtime meta/global override (allows swapping base URL without rebuild)
  var runtimeOverride: string | undefined = undefined;
  try {
    // window.__INVESTA_API_BASE may be set from a meta tag or hosting environment
    runtimeOverride = (window as any).__INVESTA_API_BASE as string | undefined;
  } catch { /* ignore */ }
  if (runtimeOverride) {
    return runtimeOverride.replace(/\/+$/, '');
  }

  // Check for environment variable next
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  return '';
}

/**
 * Gets the dynamic SignalR Hub URL
 * Uses window.location.hostname to avoid hardcoded IPs
 */
export function getDynamicHubUrl(hubPath: string = '/chathub'): string {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_HUB_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '') + hubPath;
  }

  return hubPath;
}

/**
 * Storage utility with error handling
 */
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Silently fail if storage is not available
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Silently fail if storage is not available
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      // Silently fail if storage is not available
    }
  }
};
