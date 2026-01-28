export const DEFAULT_API_BASE = 'http://DESKTOP-DIH7CQH:5235';

export function getApiBase(): string {
  // Allow overriding via global window var set by hosting environment
  const w = (window as any) || {};
  return w.__INVESTA_API_BASE || DEFAULT_API_BASE;
}