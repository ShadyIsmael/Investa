/**
 * Generic factory for reference-data Admin services.
 * Eliminates copy-paste across *AdminService.ts files:
 * unwrap envelope + build list query + map + CRUD + setActive.
 *
 * Design goals:
 * - No `any` (uses `unknown` + safe accessors).
 * - Backward compatible: same method signatures as before.
 * - Tolerant to backend casing (camelCase / PascalCase).
 */
import { api } from '@/services/api';

export type RawRecord = Record<string, unknown>;
export type AdminId = string | number;

export interface AdminListOptions {
  /** query param name for status filter, defaults to 'isActive' */
  statusParam?: string;
}

/** Safe field access supporting camelCase + PascalCase backend variants. */
export function field(record: RawRecord, camel: string, pascal?: string): unknown {
  if (camel in record) return record[camel];
  const p = pascal ?? (camel.charAt(0).toUpperCase() + camel.slice(1));
  if (p in record) return record[p];
  return undefined;
}

export function str(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

export function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function nullableStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return str(value);
}

/** Backend returns data directly, or wrapped in { data } / { data: { items } } / { items }. */
export function unwrapEnvelope(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  const record = value as RawRecord;
  const data = record['data'];
  if (data !== undefined) {
    if (data !== null && typeof data === 'object' && 'items' in (data as RawRecord)) {
      return (data as RawRecord)['items'];
    }
    return data;
  }
  if ('items' in record) return record['items'];
  return value;
}

export function unwrapList<TItem>(value: unknown, map: (raw: RawRecord) => TItem): TItem[] {
  const raw = unwrapEnvelope(value);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => map((item ?? {}) as RawRecord));
}

export function unwrapItem<TItem>(value: unknown, map: (raw: RawRecord) => TItem): TItem {
  return map((unwrapEnvelope(value) ?? {}) as RawRecord);
}

export function buildListQuery(search = '', status = '', statusParam = 'isActive'): string {
  const query = new URLSearchParams();
  if (search.trim()) query.set('search', search.trim());
  if (status) query.set(statusParam, status);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export interface CrudAdminService<TItem, TCreate, TUpdate, TId extends AdminId = number> {
  list(search?: string, status?: string): Promise<TItem[]>;
  create(input: TCreate): Promise<TItem>;
  update(id: TId, input: TUpdate): Promise<TItem>;
  setActive(id: TId, isActive: boolean): Promise<TItem>;
}

export interface CreateAdminServiceOptions<TItem, TCreate, TUpdate, TId extends AdminId = number> {
  /** e.g. '/api/v1/admin/countries' (without trailing slash) */
  basePath: string;
  map: (raw: RawRecord) => TItem;
  encodeId?: (id: TId) => string;
  statusParam?: string;
}

/**
 * Creates a standard { list, create, update, setActive } admin service.
 * Keeps the exact REST contract used across the codebase:
 * PATCH {basePath}/{id}/status with { isActive } body.
 */
export function createAdminService<TItem, TCreate, TUpdate, TId extends AdminId = number>(
  options: CreateAdminServiceOptions<TItem, TCreate, TUpdate, TId>,
): CrudAdminService<TItem, TCreate, TUpdate, TId> {
  const { basePath, map, statusParam = 'isActive' } = options;
  const encodeId = options.encodeId ?? ((id: TId) => encodeURIComponent(String(id)));

  return {
    async list(search = '', status = ''): Promise<TItem[]> {
      const result: unknown = await api.get<unknown>(`${basePath}${buildListQuery(search, status, statusParam)}`);
      return unwrapList(result, map);
    },
    async create(input: TCreate): Promise<TItem> {
      const result: unknown = await api.post<unknown>(basePath, input);
      return unwrapItem(result, map);
    },
    async update(id: TId, input: TUpdate): Promise<TItem> {
      const result: unknown = await api.put<unknown>(`${basePath}/${encodeId(id)}`, input);
      return unwrapItem(result, map);
    },
    async setActive(id: TId, isActive: boolean): Promise<TItem> {
      const result: unknown = await api.patch<unknown>(`${basePath}/${encodeId(id)}/status`, { isActive });
      return unwrapItem(result, map);
    },
  };
}
