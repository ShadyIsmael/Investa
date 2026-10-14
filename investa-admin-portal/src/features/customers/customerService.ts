import { api } from '@/services/api';

export const CUSTOMER_PERMISSIONS = {
  view: 'Company.Customers.View',
  create: 'Company.Customers.Create',
  edit: 'Company.Customers.Edit',
  manage: 'Company.Customers.Manage',
} as const;

export type CustomerType = 'Organization' | 'Individual';
export type CustomerStatus = 'Active' | 'Inactive';
export type CustomerSortBy = 'customerCode' | 'name' | 'createdAt' | 'updatedAt' | 'status';

export interface CustomerListItem {
  id: string;
  customerCode: string;
  type: CustomerType;
  displayName: string;
  legalName: string;
  primaryContactName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  city: string | null;
  country: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends Omit<CustomerListItem, 'primaryContactName'> {
  taxId: string | null;
  commercialRegistrationNumber: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  contacts: CustomerContact[];
}

export interface CustomerListQuery {
  page: number;
  pageSize: number;
  search?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  sortBy: CustomerSortBy;
  sortDirection: 'asc' | 'desc';
}

export interface CustomerListResult {
  page: number;
  pageSize: number;
  total: number;
  items: CustomerListItem[];
}

export interface CustomerInput {
  type: CustomerType;
  legalName: string;
  displayName: string;
  taxId?: string;
  commercialRegistrationNumber?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  address?: string;
  country?: string;
  city?: string;
  notes?: string;
}

export interface CustomerContactInput {
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  isActive: boolean;
}

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const unwrap = (value: unknown): unknown => object(value).data ?? value;
const field = (value: unknown, name: string): unknown => {
  const item = object(value);
  return item[name] ?? item[name[0].toUpperCase() + name.slice(1)];
};
const stringValue = (value: unknown): string => value == null ? '' : String(value);
const nullableString = (value: unknown): string | null => value == null || value === '' ? null : String(value);
const booleanValue = (value: unknown): boolean => value === true || value === 'true';
const enumValue = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => {
  if (typeof value === 'number') return values[value - 1] ?? fallback;
  const match = values.find(item => item.toLowerCase() === stringValue(value).toLowerCase());
  return match ?? fallback;
};

const mapContact = (value: unknown): CustomerContact => ({
  id: stringValue(field(value, 'id')),
  name: stringValue(field(value, 'name')),
  jobTitle: nullableString(field(value, 'jobTitle')),
  email: nullableString(field(value, 'email')),
  phone: nullableString(field(value, 'phone')),
  isPrimary: booleanValue(field(value, 'isPrimary')),
  isActive: booleanValue(field(value, 'isActive')),
  createdAt: stringValue(field(value, 'createdAt')),
  updatedAt: stringValue(field(value, 'updatedAt')),
});

const mapListItem = (value: unknown): CustomerListItem => ({
  id: stringValue(field(value, 'id')),
  customerCode: stringValue(field(value, 'customerCode')),
  type: enumValue(field(value, 'type'), ['Organization', 'Individual'] as const, 'Organization'),
  displayName: stringValue(field(value, 'displayName')),
  legalName: stringValue(field(value, 'legalName')),
  primaryContactName: nullableString(field(value, 'primaryContactName')),
  primaryEmail: nullableString(field(value, 'primaryEmail')),
  primaryPhone: nullableString(field(value, 'primaryPhone')),
  city: nullableString(field(value, 'city')),
  country: nullableString(field(value, 'country')),
  status: enumValue(field(value, 'status'), ['Active', 'Inactive'] as const, 'Active'),
  createdAt: stringValue(field(value, 'createdAt')),
  updatedAt: stringValue(field(value, 'updatedAt')),
});

const mapDetail = (value: unknown): CustomerDetail => ({
  ...mapListItem(value),
  taxId: nullableString(field(value, 'taxId')),
  commercialRegistrationNumber: nullableString(field(value, 'commercialRegistrationNumber')),
  website: nullableString(field(value, 'website')),
  address: nullableString(field(value, 'address')),
  notes: nullableString(field(value, 'notes')),
  contacts: Array.isArray(field(value, 'contacts')) ? (field(value, 'contacts') as unknown[]).map(mapContact) : [],
});

const mapPage = (value: unknown): CustomerListResult => {
  const data = object(unwrap(value));
  return {
    page: Number(field(data, 'page')) || 1,
    pageSize: Number(field(data, 'pageSize')) || 20,
    total: Number(field(data, 'total')) || 0,
    items: Array.isArray(field(data, 'items')) ? (field(data, 'items') as unknown[]).map(mapListItem) : [],
  };
};

export const customerService = {
  async list(query: CustomerListQuery): Promise<CustomerListResult> {
    const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection });
    if (query.search?.trim()) params.set('search', query.search.trim());
    if (query.type) params.set('type', query.type);
    if (query.status) params.set('status', query.status);
    return mapPage(await api.get<unknown>(`/api/v1/admin/customers?${params.toString()}`));
  },
  async get(id: string): Promise<CustomerDetail> {
    return mapDetail(unwrap(await api.get<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}`)));
  },
  async create(input: CustomerInput): Promise<CustomerDetail> {
    return mapDetail(unwrap(await api.post<unknown>('/api/v1/admin/customers', input)));
  },
  async update(id: string, input: CustomerInput): Promise<CustomerDetail> {
    return mapDetail(unwrap(await api.put<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}`, input)));
  },
  async setStatus(id: string, status: CustomerStatus): Promise<CustomerDetail> {
    return mapDetail(unwrap(await api.patch<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}/status`, { status })));
  },
  async addContact(id: string, input: CustomerContactInput): Promise<CustomerContact> {
    return mapContact(unwrap(await api.post<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}/contacts`, input)));
  },
  async updateContact(id: string, contactId: string, input: CustomerContactInput): Promise<CustomerContact> {
    return mapContact(unwrap(await api.put<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}/contacts/${encodeURIComponent(contactId)}`, input)));
  },
  async setContactStatus(id: string, contactId: string, isActive: boolean): Promise<CustomerContact> {
    return mapContact(unwrap(await api.patch<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}/contacts/${encodeURIComponent(contactId)}/status`, { isActive })));
  },
  async setPrimaryContact(id: string, contactId: string): Promise<CustomerContact> {
    return mapContact(unwrap(await api.patch<unknown>(`/api/v1/admin/customers/${encodeURIComponent(id)}/contacts/${encodeURIComponent(contactId)}/primary`, {})));
  },
};
