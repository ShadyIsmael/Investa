export const DEFAULT_API_BASE = 'http://desktop-dih7cqh:5235';
export const DEFAULT_FILE_STORE_BASE = 'http://localhost:5240';
export const FILE_STORE_API_KEY = 'investa-filestore-key-change-in-production';

export function getApiBase(): string {
  // Allow overriding via global window var set by hosting environment
  const w = (window as any) || {};
  return w.__INVESTA_API_BASE || DEFAULT_API_BASE;
}

export function getFileStoreBase(): string {
  const w = (window as any) || {};
  return w.__INVESTA_FILE_STORE_BASE || DEFAULT_FILE_STORE_BASE;
}