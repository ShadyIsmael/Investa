import { Opportunity, OpportunityLookup } from '../../../services/opportunity.service';

export function lookupLabel(items: OpportunityLookup[], id: string | number | null | undefined, fallback?: string | null): string {
  if (fallback) return fallback;
  if (id === null || id === undefined || id === '') return '-';
  const found = items.find(item => String(item.id) === String(id));
  return found?.name || found?.value || found?.label || found?.key || String(id);
}

export function opportunityTitle(opportunity: Opportunity | null | undefined): string {
  return opportunity?.title || 'Untitled opportunity';
}

export function opportunityDescription(opportunity: Opportunity | null | undefined): string {
  return opportunity?.shortDescription || opportunity?.description || opportunity?.fullDescription || '';
}

export function money(value: number | null | undefined): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value ?? 0);
}
