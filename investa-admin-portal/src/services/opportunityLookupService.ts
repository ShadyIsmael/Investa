import { api } from '@/api/api';

export type OpportunityLookupKind = 'categories' | 'tags' | 'funding-goals';

export interface OpportunityLookupItem {
  id: number | string;
  name: string;
  description?: string | null;
  active?: boolean | null;
  sortOrder?: number | null;
}

const ENDPOINTS: Record<OpportunityLookupKind, string> = {
  categories: '/api/v1/lookups/opportunity-categories',
  tags: '/api/v1/lookups/opportunity-tags',
  'funding-goals': '/api/v1/lookups/funding-goals',
};

const unwrapList = (value: any): any[] => {
  const source = value?.data?.items ?? value?.data ?? value?.items ?? value;
  return Array.isArray(source) ? source : [];
};

const toNullableBoolean = (value: any): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'active', 'enabled', '1'].includes(normalized)) return true;
    if (['false', 'inactive', 'disabled', '0'].includes(normalized)) return false;
  }
  return null;
};

const mapLookupItem = (item: any): OpportunityLookupItem => ({
  id: item.id ?? item.lookupId ?? item.key ?? item.name ?? '',
  name: String(item.name ?? item.value ?? item.label ?? item.Name ?? item.Value ?? ''),
  description: item.description ?? item.Description ?? null,
  active: toNullableBoolean(item.active ?? item.isActive ?? item.enabled ?? item.Active ?? item.IsActive),
  sortOrder:
    typeof (item.sortOrder ?? item.SortOrder) === 'number'
      ? item.sortOrder ?? item.SortOrder
      : null,
});

export const opportunityLookupService = {
  async getLookups(kind: OpportunityLookupKind): Promise<OpportunityLookupItem[]> {
    const result = await api.get<any>(ENDPOINTS[kind]);
    return unwrapList(result).map(mapLookupItem);
  },
};
