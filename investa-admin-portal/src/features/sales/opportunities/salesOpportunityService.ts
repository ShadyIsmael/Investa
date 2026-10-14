import { api } from '@/services/api';

export const SALES_OPPORTUNITY_PERMISSIONS = {
  view: 'Company.Sales.Opportunities.View',
  create: 'Company.Sales.Opportunities.Create',
  edit: 'Company.Sales.Opportunities.Edit',
  manage: 'Company.Sales.Opportunities.Manage',
} as const;

export type SalesOpportunityStage = 'New' | 'Qualified' | 'Proposal' | 'Negotiation';
export type SalesOpportunityStatus = 'Open' | 'Won' | 'Lost';
export type SalesOpportunitySource = 'Referral' | 'Website' | 'Direct' | 'ExistingCustomer' | 'Partner' | 'Other';
export type SalesOpportunitySortBy = 'createdAt' | 'updatedAt' | 'title' | 'customer' | 'stage' | 'status' | 'expectedValue' | 'expectedCloseDate';

export interface SalesOpportunityItem { id: string; catalogItemId: string; code: string; name: string; type: 'Product' | 'Service'; }
export interface SalesOpportunityListItem { id: string; opportunityCode: string; title: string; customerId: string; customerCode: string; customerDisplayName: string; stage: SalesOpportunityStage; status: SalesOpportunityStatus; interestedItems: SalesOpportunityItem[]; expectedValue: number | null; currency: string | null; probability: number | null; expectedCloseDate: string | null; salesOwnerUserId: string | null; salesOwnerName: string | null; createdAt: string; updatedAt: string; }
export interface SalesOpportunityDetail extends SalesOpportunityListItem { primaryContactId: string | null; primaryContactName: string | null; source: SalesOpportunitySource | null; description: string | null; notes: string | null; lostReason: string | null; wonAt: string | null; lostAt: string | null; }
export interface SalesOpportunityListQuery { page: number; pageSize: number; search?: string; stage?: SalesOpportunityStage; status?: SalesOpportunityStatus; customerId?: string; catalogItemId?: string; salesOwnerUserId?: string; expectedCloseFrom?: string; expectedCloseTo?: string; sortBy: SalesOpportunitySortBy; sortDirection: 'asc' | 'desc'; }
export interface SalesOpportunityListResult { page: number; pageSize: number; total: number; items: SalesOpportunityListItem[]; }
export interface SalesOpportunityInput { title: string; customerId: string; primaryContactId?: string | null; stage: SalesOpportunityStage; expectedValue?: number | null; currency?: string; probability?: number | null; expectedCloseDate?: string | null; salesOwnerUserId?: string | null; source?: SalesOpportunitySource | null; description?: string; notes?: string; catalogItemIds: string[]; }
export interface CustomerLookup { id: string; customerCode: string; displayName: string; }
export interface ContactLookup { id: string; name: string; email: string | null; }
export interface CatalogLookup { id: string; code: string; name: string; type: 'Product' | 'Service'; }
export interface OwnerLookup { id: string; name: string; email: string | null; }

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const unwrap = (value: unknown): unknown => object(value).data ?? value;
const field = (value: unknown, name: string): unknown => { const item = object(value); return item[name] ?? item[name[0].toUpperCase() + name.slice(1)]; };
const stringValue = (value: unknown): string => value == null ? '' : String(value);
const nullableString = (value: unknown): string | null => value == null || value === '' ? null : String(value);
const enumValue = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => typeof value === 'number' ? values[value - 1] ?? fallback : values.find(item => item.toLowerCase() === stringValue(value).toLowerCase()) ?? fallback;
const values = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const mapItem = (value: unknown): SalesOpportunityItem => ({ id: stringValue(field(value, 'id')), catalogItemId: stringValue(field(value, 'catalogItemId')), code: stringValue(field(value, 'code')), name: stringValue(field(value, 'name')), type: enumValue(field(value, 'type'), ['Product', 'Service'] as const, 'Product') });
const mapListItem = (value: unknown): SalesOpportunityListItem => ({ id: stringValue(field(value, 'id')), opportunityCode: stringValue(field(value, 'opportunityCode')), title: stringValue(field(value, 'title')), customerId: stringValue(field(value, 'customerId')), customerCode: stringValue(field(value, 'customerCode')), customerDisplayName: stringValue(field(value, 'customerDisplayName')), stage: enumValue(field(value, 'stage'), ['New', 'Qualified', 'Proposal', 'Negotiation'] as const, 'New'), status: enumValue(field(value, 'status'), ['Open', 'Won', 'Lost'] as const, 'Open'), interestedItems: values<unknown>(field(value, 'interestedItems')).map(mapItem), expectedValue: field(value, 'expectedValue') == null ? null : Number(field(value, 'expectedValue')), currency: nullableString(field(value, 'currency')), probability: field(value, 'probability') == null ? null : Number(field(value, 'probability')), expectedCloseDate: nullableString(field(value, 'expectedCloseDate')), salesOwnerUserId: nullableString(field(value, 'salesOwnerUserId')), salesOwnerName: nullableString(field(value, 'salesOwnerName')), createdAt: stringValue(field(value, 'createdAt')), updatedAt: stringValue(field(value, 'updatedAt')) });
const mapDetail = (value: unknown): SalesOpportunityDetail => ({ ...mapListItem(value), primaryContactId: nullableString(field(value, 'primaryContactId')), primaryContactName: nullableString(field(value, 'primaryContactName')), source: field(value, 'source') == null ? null : enumValue(field(value, 'source'), ['Referral', 'Website', 'Direct', 'ExistingCustomer', 'Partner', 'Other'] as const, 'Other'), description: nullableString(field(value, 'description')), notes: nullableString(field(value, 'notes')), lostReason: nullableString(field(value, 'lostReason')), wonAt: nullableString(field(value, 'wonAt')), lostAt: nullableString(field(value, 'lostAt')) });
const mapPage = (value: unknown): SalesOpportunityListResult => { const data = object(unwrap(value)); return { page: Number(field(data, 'page')) || 1, pageSize: Number(field(data, 'pageSize')) || 20, total: Number(field(data, 'total')) || 0, items: values<unknown>(field(data, 'items')).map(mapListItem) }; };
const mapLookup = <T extends object>(value: unknown, mapper: (value: unknown) => T): T[] => values<unknown>(unwrap(value)).map(mapper);

export const salesOpportunityService = {
  async list(query: SalesOpportunityListQuery): Promise<SalesOpportunityListResult> { const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection }); if (query.search?.trim()) params.set('search', query.search.trim()); if (query.stage) params.set('stage', query.stage); if (query.status) params.set('status', query.status); if (query.customerId) params.set('customerId', query.customerId); if (query.catalogItemId) params.set('catalogItemId', query.catalogItemId); if (query.salesOwnerUserId) params.set('salesOwnerUserId', query.salesOwnerUserId); if (query.expectedCloseFrom) params.set('expectedCloseFrom', query.expectedCloseFrom); if (query.expectedCloseTo) params.set('expectedCloseTo', query.expectedCloseTo); return mapPage(await api.get<unknown>(`/api/v1/admin/sales/opportunities?${params.toString()}`)); },
  async get(id: string): Promise<SalesOpportunityDetail> { return mapDetail(unwrap(await api.get<unknown>(`/api/v1/admin/sales/opportunities/${encodeURIComponent(id)}`))); },
  async create(input: SalesOpportunityInput): Promise<SalesOpportunityDetail> { return mapDetail(unwrap(await api.post<unknown>('/api/v1/admin/sales/opportunities', input))); },
  async update(id: string, input: SalesOpportunityInput): Promise<SalesOpportunityDetail> { return mapDetail(unwrap(await api.put<unknown>(`/api/v1/admin/sales/opportunities/${encodeURIComponent(id)}`, input))); },
  async setStage(id: string, stage: SalesOpportunityStage): Promise<SalesOpportunityDetail> { return mapDetail(unwrap(await api.patch<unknown>(`/api/v1/admin/sales/opportunities/${encodeURIComponent(id)}/stage`, { stage }))); },
  async won(id: string): Promise<SalesOpportunityDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/opportunities/${encodeURIComponent(id)}/won`, {}))); },
  async lost(id: string, lostReason: string): Promise<SalesOpportunityDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/opportunities/${encodeURIComponent(id)}/lost`, { lostReason }))); },
  async customers(search = ''): Promise<CustomerLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/opportunities/lookup/customers?search=${encodeURIComponent(search)}`), value => ({ id: stringValue(field(value, 'id')), customerCode: stringValue(field(value, 'customerCode')), displayName: stringValue(field(value, 'displayName')) })); },
  async contacts(customerId: string): Promise<ContactLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/opportunities/lookup/customers/${encodeURIComponent(customerId)}/contacts`), value => ({ id: stringValue(field(value, 'id')), name: stringValue(field(value, 'name')), email: nullableString(field(value, 'email')) })); },
  async catalog(search = ''): Promise<CatalogLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/opportunities/lookup/catalog-items?search=${encodeURIComponent(search)}`), value => ({ id: stringValue(field(value, 'id')), code: stringValue(field(value, 'code')), name: stringValue(field(value, 'name')), type: enumValue(field(value, 'type'), ['Product', 'Service'] as const, 'Product') })); },
  async owners(search = ''): Promise<OwnerLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/opportunities/lookup/owners?search=${encodeURIComponent(search)}`), value => ({ id: stringValue(field(value, 'id')), name: stringValue(field(value, 'name')), email: nullableString(field(value, 'email')) })); },
};
