import { api } from '@/services/api';

export const CATALOG_PERMISSIONS = {
  view: 'Company.Products.View',
  create: 'Company.Products.Create',
  edit: 'Company.Products.Edit',
  manage: 'Company.Products.Manage',
} as const;

export type CatalogItemType = 'Product' | 'Service';
export type CatalogItemStatus = 'Active' | 'Inactive';
export type CatalogSortBy = 'code' | 'name' | 'type' | 'basePrice' | 'createdAt' | 'updatedAt' | 'status';
export type CatalogUnit = 'Unit' | 'User' | 'Seat' | 'Month' | 'Year' | 'Project' | 'Hour' | 'Day';

export interface CatalogItemListItem {
  id: string;
  code: string;
  name: string;
  type: CatalogItemType;
  defaultUnit: CatalogUnit | null;
  basePrice: number | null;
  currency: string | null;
  supportsLicense: boolean;
  supportsSubscription: boolean;
  supportsWorkspace: boolean;
  status: CatalogItemStatus;
  updatedAt: string;
}

export interface CatalogItemDetail extends CatalogItemListItem {
  description: string | null;
  workspaceKey: string | null;
  createdAt: string;
}

export interface CatalogListQuery {
  page: number;
  pageSize: number;
  search?: string;
  type?: CatalogItemType;
  status?: CatalogItemStatus;
  supportsLicense?: boolean;
  supportsSubscription?: boolean;
  supportsWorkspace?: boolean;
  sortBy: CatalogSortBy;
  sortDirection: 'asc' | 'desc';
}

export interface CatalogListResult { page: number; pageSize: number; total: number; items: CatalogItemListItem[]; }

export interface CatalogItemInput {
  name: string;
  description?: string;
  type: CatalogItemType;
  defaultUnit?: CatalogUnit | '';
  basePrice?: number | null;
  currency?: string;
  supportsLicense: boolean;
  supportsSubscription: boolean;
  supportsWorkspace: boolean;
  workspaceKey?: string;
}

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const unwrap = (value: unknown): unknown => object(value).data ?? value;
const field = (value: unknown, name: string): unknown => { const item = object(value); return item[name] ?? item[name[0].toUpperCase() + name.slice(1)]; };
const stringValue = (value: unknown): string => value == null ? '' : String(value);
const nullableString = (value: unknown): string | null => value == null || value === '' ? null : String(value);
const booleanValue = (value: unknown): boolean => value === true || value === 'true';
const enumValue = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => {
  if (typeof value === 'number') return values[value - 1] ?? fallback;
  return values.find(item => item.toLowerCase() === stringValue(value).toLowerCase()) ?? fallback;
};

const mapListItem = (value: unknown): CatalogItemListItem => ({
  id: stringValue(field(value, 'id')),
  code: stringValue(field(value, 'code')),
  name: stringValue(field(value, 'name')),
  type: enumValue(field(value, 'type'), ['Product', 'Service'] as const, 'Product'),
  defaultUnit: nullableString(field(value, 'defaultUnit')) as CatalogUnit | null,
  basePrice: field(value, 'basePrice') == null ? null : Number(field(value, 'basePrice')),
  currency: nullableString(field(value, 'currency')),
  supportsLicense: booleanValue(field(value, 'supportsLicense')),
  supportsSubscription: booleanValue(field(value, 'supportsSubscription')),
  supportsWorkspace: booleanValue(field(value, 'supportsWorkspace')),
  status: enumValue(field(value, 'status'), ['Active', 'Inactive'] as const, 'Active'),
  updatedAt: stringValue(field(value, 'updatedAt')),
});

const mapDetail = (value: unknown): CatalogItemDetail => ({
  ...mapListItem(value),
  description: nullableString(field(value, 'description')),
  workspaceKey: nullableString(field(value, 'workspaceKey')),
  createdAt: stringValue(field(value, 'createdAt')),
});

const mapPage = (value: unknown): CatalogListResult => {
  const data = object(unwrap(value));
  return {
    page: Number(field(data, 'page')) || 1,
    pageSize: Number(field(data, 'pageSize')) || 20,
    total: Number(field(data, 'total')) || 0,
    items: Array.isArray(field(data, 'items')) ? (field(data, 'items') as unknown[]).map(mapListItem) : [],
  };
};

export const catalogService = {
  async list(query: CatalogListQuery): Promise<CatalogListResult> {
    const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection });
    if (query.search?.trim()) params.set('search', query.search.trim());
    if (query.type) params.set('type', query.type);
    if (query.status) params.set('status', query.status);
    if (query.supportsLicense !== undefined) params.set('supportsLicense', String(query.supportsLicense));
    if (query.supportsSubscription !== undefined) params.set('supportsSubscription', String(query.supportsSubscription));
    if (query.supportsWorkspace !== undefined) params.set('supportsWorkspace', String(query.supportsWorkspace));
    return mapPage(await api.get<unknown>(`/api/v1/admin/catalog/products?${params.toString()}`));
  },
  async get(id: string): Promise<CatalogItemDetail> { return mapDetail(unwrap(await api.get<unknown>(`/api/v1/admin/catalog/products/${encodeURIComponent(id)}`))); },
  async create(input: CatalogItemInput): Promise<CatalogItemDetail> { return mapDetail(unwrap(await api.post<unknown>('/api/v1/admin/catalog/products', input))); },
  async update(id: string, input: CatalogItemInput): Promise<CatalogItemDetail> { return mapDetail(unwrap(await api.put<unknown>(`/api/v1/admin/catalog/products/${encodeURIComponent(id)}`, input))); },
  async setStatus(id: string, status: CatalogItemStatus): Promise<CatalogItemDetail> { return mapDetail(unwrap(await api.patch<unknown>(`/api/v1/admin/catalog/products/${encodeURIComponent(id)}/status`, { status }))); },
};
