export const DEFAULT_API_BASE = 'http://localhost:5235'; // Use localhost for dev to avoid DNS/resolution issues

export function getApiBase(): string {
  // Allow overriding via global window var set by hosting environment
  // Example: window.__INVESTA_API_BASE = 'http://localhost:5235'
  const w = (window as any) || {};
  return w.__INVESTA_API_BASE || DEFAULT_API_BASE;
}