/**
 * Environment Configuration Utility
 * Provides dynamic environment-based URL resolution
 */

/**
 * Gets the dynamic base URL for API requests
 * Uses window.location.hostname to avoid hardcoded IPs
 */
export function getDynamicBaseUrl(): string {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // Dynamically construct based on current hostname
  const hostname = window.location.hostname;
  const port = import.meta.env.VITE_API_PORT || '5000'; // Match Vite proxy target
  
  return `http://${hostname}:${port}`;
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

  // Dynamically construct based on current hostname
  const hostname = window.location.hostname;
  const port = import.meta.env.VITE_HUB_PORT || '5000';
  
  return `http://${hostname}:${port}${hubPath}`;
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
