import { api } from '@/services/api';

export const QUOTATION_PERMISSIONS = {
  view: 'Company.Sales.Quotations.View',
  create: 'Company.Sales.Quotations.Create',
  edit: 'Company.Sales.Quotations.Edit',
  manage: 'Company.Sales.Quotations.Manage',
} as const;

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
export type QuotationDiscountType = 'None' | 'Percentage' | 'FixedAmount';
export type QuotationSortBy = 'createdAt' | 'updatedAt' | 'quotationNumber' | 'customer' | 'issueDate' | 'validUntil' | 'status' | 'grandTotal';

export interface QuotationLineInput {
  catalogItemId: string | null;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number | null;
  discountType: QuotationDiscountType;
  discountValue: number;
  taxRate: number;
  sortOrder?: number;
}

export interface QuotationInput {
  customerId: string;
  salesOpportunityId: string | null;
  contactId: string | null;
  issueDate: string;
  validUntil: string | null;
  currency: string;
  paymentTerms: string;
  commercialTerms: string;
  notes: string;
  lines: QuotationLineInput[];
}

export interface QuotationLine {
  id: string;
  lineNumber: number;
  catalogItemId: string | null;
  itemCode: string | null;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: QuotationDiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineSubtotal: number;
  lineTotal: number;
}

export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  salesOpportunityId: string | null;
  salesOpportunityCode: string | null;
  salesOpportunityTitle: string | null;
  status: QuotationStatus;
  issueDate: string;
  validUntil: string | null;
  isExpired: boolean;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  updatedAt: string;
}

export interface QuotationDetail extends QuotationListItem {
  contractId?: string | null;
  contactId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  customerNameSnapshot: string;
  customerCodeSnapshot: string;
  paymentTerms: string | null;
  commercialTerms: string | null;
  notes: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  lines: QuotationLine[];
}

export interface QuotationListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: QuotationStatus;
  customerId?: string;
  salesOpportunityId?: string;
  currency?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  validUntilFrom?: string;
  validUntilTo?: string;
  sortBy: QuotationSortBy;
  sortDirection: 'asc' | 'desc';
}

export interface QuotationListResult { page: number; pageSize: number; total: number; items: QuotationListItem[]; }
export interface QuotationCustomerLookup { id: string; customerCode: string; displayName: string; }
export interface QuotationContactLookup { id: string; name: string; email: string | null; phone: string | null; }
export interface QuotationOpportunityLookup { id: string; opportunityCode: string; title: string; customerId: string; contactId: string | null; customerDisplayName: string; status: 'Open' | 'Won'; currency: string | null; interestedCatalogItemIds: string[]; }
export interface QuotationCatalogLookup { id: string; code: string; name: string; description: string | null; type: 'Product' | 'Service'; defaultUnit: string | null; basePrice: number | null; currency: string | null; supportsLicense: boolean; supportsSubscription: boolean; }
export interface QuotationCurrencyLookup { code: string; name: string; symbol: string; }
export interface QuotationPreviewLine extends QuotationLineInput { unitPriceValue: number; subtotal: number; discountAmount: number; taxAmount: number; total: number; }
export interface QuotationPreview { lines: QuotationPreviewLine[]; subtotal: number; discountTotal: number; taxTotal: number; grandTotal: number; }

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const unwrap = (value: unknown): unknown => object(value).data ?? value;
const field = (value: unknown, name: string): unknown => { const item = object(value); return item[name] ?? item[name[0].toUpperCase() + name.slice(1)]; };
const stringValue = (value: unknown): string => value == null ? '' : String(value);
const nullableString = (value: unknown): string | null => value == null || value === '' ? null : String(value);
const numberValue = (value: unknown): number => value == null || value === '' ? 0 : Number(value);
const nullableNumber = (value: unknown): number | null => value == null || value === '' ? null : Number(value);
const booleanValue = (value: unknown): boolean => Boolean(value);
const values = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const enumValue = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => typeof value === 'number' ? allowed[value - 1] ?? fallback : allowed.find(item => item.toLowerCase() === stringValue(value).toLowerCase()) ?? fallback;
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const mapLine = (value: unknown): QuotationLine => ({ id: stringValue(field(value, 'id')), lineNumber: numberValue(field(value, 'lineNumber')), catalogItemId: nullableString(field(value, 'catalogItemId')), itemCode: nullableString(field(value, 'itemCode')), itemName: stringValue(field(value, 'itemName')), description: stringValue(field(value, 'description')), quantity: numberValue(field(value, 'quantity')), unit: stringValue(field(value, 'unit')), unitPrice: numberValue(field(value, 'unitPrice')), discountType: enumValue(field(value, 'discountType'), ['None', 'Percentage', 'FixedAmount'] as const, 'None'), discountValue: numberValue(field(value, 'discountValue')), discountAmount: numberValue(field(value, 'discountAmount')), taxRate: numberValue(field(value, 'taxRate')), taxAmount: numberValue(field(value, 'taxAmount')), lineSubtotal: numberValue(field(value, 'lineSubtotal')), lineTotal: numberValue(field(value, 'lineTotal')) });
const mapListItem = (value: unknown): QuotationListItem => ({ id: stringValue(field(value, 'id')), quotationNumber: stringValue(field(value, 'quotationNumber')), customerId: stringValue(field(value, 'customerId')), customerCode: stringValue(field(value, 'customerCode')), customerName: stringValue(field(value, 'customerName')), salesOpportunityId: nullableString(field(value, 'salesOpportunityId')), salesOpportunityCode: nullableString(field(value, 'salesOpportunityCode')), salesOpportunityTitle: nullableString(field(value, 'salesOpportunityTitle')), status: enumValue(field(value, 'status'), ['Draft', 'Sent', 'Accepted', 'Rejected'] as const, 'Draft'), issueDate: stringValue(field(value, 'issueDate')), validUntil: nullableString(field(value, 'validUntil')), isExpired: booleanValue(field(value, 'isExpired')), currency: stringValue(field(value, 'currency')), subtotal: numberValue(field(value, 'subtotal')), discountTotal: numberValue(field(value, 'discountTotal')), taxTotal: numberValue(field(value, 'taxTotal')), grandTotal: numberValue(field(value, 'grandTotal')), updatedAt: stringValue(field(value, 'updatedAt')) });
const mapDetail = (value: unknown): QuotationDetail => ({ ...mapListItem(value), contractId: nullableString(field(value, 'contractId')), contactId: nullableString(field(value, 'contactId')), contactName: nullableString(field(value, 'contactName')), contactEmail: nullableString(field(value, 'contactEmail')), contactPhone: nullableString(field(value, 'contactPhone')), customerNameSnapshot: stringValue(field(value, 'customerNameSnapshot')), customerCodeSnapshot: stringValue(field(value, 'customerCodeSnapshot')), paymentTerms: nullableString(field(value, 'paymentTerms')), commercialTerms: nullableString(field(value, 'commercialTerms')), notes: nullableString(field(value, 'notes')), sentAt: nullableString(field(value, 'sentAt')), acceptedAt: nullableString(field(value, 'acceptedAt')), rejectedAt: nullableString(field(value, 'rejectedAt')), rejectionReason: nullableString(field(value, 'rejectionReason')), createdAt: stringValue(field(value, 'createdAt')), lines: values<unknown>(field(value, 'lines')).map(mapLine) });
const mapPage = (value: unknown): QuotationListResult => { const data = object(unwrap(value)); return { page: numberValue(field(data, 'page')) || 1, pageSize: numberValue(field(data, 'pageSize')) || 20, total: numberValue(field(data, 'total')), items: values<unknown>(field(data, 'items')).map(mapListItem) }; };
const mapLookup = <T>(value: unknown, mapper: (value: unknown) => T): T[] => values<unknown>(unwrap(value)).map(mapper);

export function calculateQuotationPreview(input: Pick<QuotationInput, 'lines'>): QuotationPreview {
  const lines = input.lines.map(line => {
    const unitPriceValue = Math.max(0, Number(line.unitPrice ?? 0));
    const subtotal = roundMoney(Math.max(0, Number(line.quantity || 0)) * unitPriceValue);
    const discountAmount = line.discountType === 'Percentage' ? roundMoney(subtotal * Math.min(100, Math.max(0, Number(line.discountValue || 0))) / 100) : line.discountType === 'FixedAmount' ? roundMoney(Math.min(subtotal, Math.max(0, Number(line.discountValue || 0)))) : 0;
    const taxable = roundMoney(Math.max(0, subtotal - discountAmount));
    const taxAmount = roundMoney(taxable * Math.min(100, Math.max(0, Number(line.taxRate || 0))) / 100);
    return { ...line, unitPriceValue, subtotal, discountAmount, taxAmount, total: roundMoney(taxable + taxAmount) };
  });
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const discountTotal = roundMoney(lines.reduce((sum, line) => sum + line.discountAmount, 0));
  const taxTotal = roundMoney(lines.reduce((sum, line) => sum + line.taxAmount, 0));
  return { lines, subtotal, discountTotal, taxTotal, grandTotal: roundMoney(lines.reduce((sum, line) => sum + line.total, 0)) };
}

const queryString = (query: object) => { const params = new URLSearchParams(); Object.entries(query as Record<string, string | number | undefined>).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); };

export const quotationService = {
  async list(query: QuotationListQuery): Promise<QuotationListResult> { return mapPage(await api.get<unknown>(`/api/v1/admin/sales/quotations?${queryString(query)}`)); },
  async get(id: string): Promise<QuotationDetail> { return mapDetail(unwrap(await api.get<unknown>(`/api/v1/admin/sales/quotations/${encodeURIComponent(id)}`))); },
  async create(input: QuotationInput): Promise<QuotationDetail> { return mapDetail(unwrap(await api.post<unknown>('/api/v1/admin/sales/quotations', input))); },
  async update(id: string, input: QuotationInput): Promise<QuotationDetail> { return mapDetail(unwrap(await api.put<unknown>(`/api/v1/admin/sales/quotations/${encodeURIComponent(id)}`, input))); },
  async send(id: string): Promise<QuotationDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/quotations/${encodeURIComponent(id)}/send`, {}))); },
  async accept(id: string): Promise<QuotationDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/quotations/${encodeURIComponent(id)}/accept`, {}))); },
  async reject(id: string, rejectionReason: string): Promise<QuotationDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/quotations/${encodeURIComponent(id)}/reject`, { rejectionReason }))); },
  async customers(search = ''): Promise<QuotationCustomerLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/quotations/lookup/customers?search=${encodeURIComponent(search)}`), value => ({ id: stringValue(field(value, 'id')), customerCode: stringValue(field(value, 'customerCode')), displayName: stringValue(field(value, 'displayName')) })); },
  async contacts(customerId: string): Promise<QuotationContactLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/quotations/lookup/customers/${encodeURIComponent(customerId)}/contacts`), value => ({ id: stringValue(field(value, 'id')), name: stringValue(field(value, 'name')), email: nullableString(field(value, 'email')), phone: nullableString(field(value, 'phone')) })); },
  async opportunities(customerId?: string, search = ''): Promise<QuotationOpportunityLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/quotations/lookup/opportunities?${queryString({ customerId, search })}`), value => ({ id: stringValue(field(value, 'id')), opportunityCode: stringValue(field(value, 'opportunityCode')), title: stringValue(field(value, 'title')), customerId: stringValue(field(value, 'customerId')), contactId: nullableString(field(value, 'contactId')), customerDisplayName: stringValue(field(value, 'customerDisplayName')), status: enumValue(field(value, 'status'), ['Open', 'Won'] as const, 'Open'), currency: nullableString(field(value, 'currency')), interestedCatalogItemIds: values<unknown>(field(value, 'interestedCatalogItemIds')).map(stringValue) })); },
  async catalog(search = ''): Promise<QuotationCatalogLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/quotations/lookup/catalog-items?search=${encodeURIComponent(search)}`), value => ({ id: stringValue(field(value, 'id')), code: stringValue(field(value, 'code')), name: stringValue(field(value, 'name')), description: nullableString(field(value, 'description')), type: enumValue(field(value, 'type'), ['Product', 'Service'] as const, 'Product'), defaultUnit: nullableString(field(value, 'defaultUnit')), basePrice: nullableNumber(field(value, 'basePrice')), currency: nullableString(field(value, 'currency')), supportsLicense: booleanValue(field(value, 'supportsLicense')), supportsSubscription: booleanValue(field(value, 'supportsSubscription')) })); },
  async currencies(search = ''): Promise<QuotationCurrencyLookup[]> { return mapLookup(await api.get<unknown>(`/api/v1/admin/sales/quotations/lookup/currencies?search=${encodeURIComponent(search)}`), value => ({ code: stringValue(field(value, 'code')), name: stringValue(field(value, 'name')), symbol: stringValue(field(value, 'symbol')) })); },
};
