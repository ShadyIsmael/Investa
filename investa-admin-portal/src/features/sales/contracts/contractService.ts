import { api } from '@/services/api';
import { quotationService, type QuotationCustomerLookup, type QuotationCurrencyLookup } from '../quotations/quotationService';

export const CONTRACT_PERMISSIONS = {
  view: 'Company.Sales.Contracts.View',
  create: 'Company.Sales.Contracts.Create',
  edit: 'Company.Sales.Contracts.Edit',
  manage: 'Company.Sales.Contracts.Manage',
} as const;

export type ContractStatus = 'Draft' | 'Active' | 'Completed' | 'Terminated';
export type ContractDiscountType = 'None' | 'Percentage' | 'FixedAmount';
export type ContractSortBy = 'createdAt' | 'updatedAt' | 'contractNumber' | 'customer' | 'effectiveDate' | 'startDate' | 'endDate' | 'status' | 'grandTotal';

export interface ContractLine {
  id: string;
  sourceQuotationLineId: string;
  lineNumber: number;
  catalogItemId: string | null;
  itemCode: string | null;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: ContractDiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineSubtotal: number;
  lineTotal: number;
  supportsLicense: boolean;
  supportsSubscription: boolean;
}

export interface ContractListItem {
  id: string;
  contractNumber: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  sourceQuotationId: string;
  sourceQuotationNumber: string;
  salesOpportunityId: string | null;
  salesOpportunityCode: string | null;
  salesOpportunityTitle: string | null;
  status: ContractStatus;
  currency: string;
  effectiveDate: string | null;
  startDate: string | null;
  endDate: string | null;
  grandTotal: number;
  updatedAt: string;
}

export interface ContractDetail extends ContractListItem {
  contactId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  customerCodeSnapshot: string;
  customerNameSnapshot: string;
  customerLegalNameSnapshot: string | null;
  signedDate: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  paymentTerms: string | null;
  commercialTerms: string | null;
  notes: string | null;
  activatedAt: string | null;
  completedAt: string | null;
  terminatedAt: string | null;
  terminationReason: string | null;
  createdAt: string;
  lines: ContractLine[];
}

export interface ContractListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: ContractStatus;
  customerId?: string;
  salesOpportunityId?: string;
  currency?: string;
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy: ContractSortBy;
  sortDirection: 'asc' | 'desc';
}

export interface ContractPage { page: number; pageSize: number; total: number; items: ContractListItem[]; }
export interface ContractMetadataInput { effectiveDate: string | null; startDate: string | null; endDate: string | null; signedDate: string | null; paymentTerms: string; commercialTerms: string; notes: string; }

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const unwrap = (value: unknown): unknown => object(value).data ?? value;
const field = (value: unknown, name: string): unknown => { const item = object(value); return item[name] ?? item[name[0].toUpperCase() + name.slice(1)]; };
const stringValue = (value: unknown): string => value == null ? '' : String(value);
const nullableString = (value: unknown): string | null => value == null || value === '' ? null : String(value);
const numberValue = (value: unknown): number => value == null || value === '' ? 0 : Number(value);
const booleanValue = (value: unknown): boolean => Boolean(value);
const values = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const enumValue = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => typeof value === 'number' ? allowed[value - 1] ?? fallback : allowed.find(item => item.toLowerCase() === stringValue(value).toLowerCase()) ?? fallback;
const mapLine = (value: unknown): ContractLine => ({ id: stringValue(field(value, 'id')), sourceQuotationLineId: stringValue(field(value, 'sourceQuotationLineId')), lineNumber: numberValue(field(value, 'lineNumber')), catalogItemId: nullableString(field(value, 'catalogItemId')), itemCode: nullableString(field(value, 'itemCode')), itemName: stringValue(field(value, 'itemName')), description: stringValue(field(value, 'description')), quantity: numberValue(field(value, 'quantity')), unit: stringValue(field(value, 'unit')), unitPrice: numberValue(field(value, 'unitPrice')), discountType: enumValue(field(value, 'discountType'), ['None', 'Percentage', 'FixedAmount'] as const, 'None'), discountValue: numberValue(field(value, 'discountValue')), discountAmount: numberValue(field(value, 'discountAmount')), taxRate: numberValue(field(value, 'taxRate')), taxAmount: numberValue(field(value, 'taxAmount')), lineSubtotal: numberValue(field(value, 'lineSubtotal')), lineTotal: numberValue(field(value, 'lineTotal')), supportsLicense: booleanValue(field(value, 'supportsLicense')), supportsSubscription: booleanValue(field(value, 'supportsSubscription')) });
const mapListItem = (value: unknown): ContractListItem => ({ id: stringValue(field(value, 'id')), contractNumber: stringValue(field(value, 'contractNumber')), customerId: stringValue(field(value, 'customerId')), customerCode: stringValue(field(value, 'customerCode')), customerName: stringValue(field(value, 'customerName')), sourceQuotationId: stringValue(field(value, 'sourceQuotationId')), sourceQuotationNumber: stringValue(field(value, 'sourceQuotationNumber')), salesOpportunityId: nullableString(field(value, 'salesOpportunityId')), salesOpportunityCode: nullableString(field(value, 'salesOpportunityCode')), salesOpportunityTitle: nullableString(field(value, 'salesOpportunityTitle')), status: enumValue(field(value, 'status'), ['Draft', 'Active', 'Completed', 'Terminated'] as const, 'Draft'), currency: stringValue(field(value, 'currency')), effectiveDate: nullableString(field(value, 'effectiveDate')), startDate: nullableString(field(value, 'startDate')), endDate: nullableString(field(value, 'endDate')), grandTotal: numberValue(field(value, 'grandTotal')), updatedAt: stringValue(field(value, 'updatedAt')) });
const mapDetail = (value: unknown): ContractDetail => ({ ...mapListItem(value), contactId: nullableString(field(value, 'contactId')), contactName: nullableString(field(value, 'contactName')), contactEmail: nullableString(field(value, 'contactEmail')), contactPhone: nullableString(field(value, 'contactPhone')), customerCodeSnapshot: stringValue(field(value, 'customerCodeSnapshot')), customerNameSnapshot: stringValue(field(value, 'customerNameSnapshot')), customerLegalNameSnapshot: nullableString(field(value, 'customerLegalNameSnapshot')), signedDate: nullableString(field(value, 'signedDate')), subtotal: numberValue(field(value, 'subtotal')), discountTotal: numberValue(field(value, 'discountTotal')), taxTotal: numberValue(field(value, 'taxTotal')), paymentTerms: nullableString(field(value, 'paymentTerms')), commercialTerms: nullableString(field(value, 'commercialTerms')), notes: nullableString(field(value, 'notes')), activatedAt: nullableString(field(value, 'activatedAt')), completedAt: nullableString(field(value, 'completedAt')), terminatedAt: nullableString(field(value, 'terminatedAt')), terminationReason: nullableString(field(value, 'terminationReason')), createdAt: stringValue(field(value, 'createdAt')), lines: values<unknown>(field(value, 'lines')).map(mapLine) });
const mapPage = (value: unknown): ContractPage => { const data = object(unwrap(value)); return { page: numberValue(field(data, 'page')) || 1, pageSize: numberValue(field(data, 'pageSize')) || 20, total: numberValue(field(data, 'total')), items: values<unknown>(field(data, 'items')).map(mapListItem) }; };
const queryString = (query: object) => { const params = new URLSearchParams(); Object.entries(query as Record<string, string | number | undefined>).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); };

export const contractService = {
  async list(query: ContractListQuery): Promise<ContractPage> { return mapPage(await api.get<unknown>(`/api/v1/admin/sales/contracts?${queryString(query)}`)); },
  async get(id: string): Promise<ContractDetail> { return mapDetail(unwrap(await api.get<unknown>(`/api/v1/admin/sales/contracts/${encodeURIComponent(id)}`))); },
  async getByQuotation(quotationId: string): Promise<ContractDetail> { return mapDetail(unwrap(await api.get<unknown>(`/api/v1/admin/sales/contracts/by-quotation/${encodeURIComponent(quotationId)}`))); },
  async createFromQuotation(quotationId: string, input: Omit<ContractMetadataInput, 'signedDate'> & Pick<ContractMetadataInput, 'signedDate'>): Promise<ContractDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/contracts/from-quotation/${encodeURIComponent(quotationId)}`, { sourceQuotationId: quotationId, ...input }))); },
  async update(id: string, input: ContractMetadataInput): Promise<ContractDetail> { return mapDetail(unwrap(await api.put<unknown>(`/api/v1/admin/sales/contracts/${encodeURIComponent(id)}`, input))); },
  async activate(id: string): Promise<ContractDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/contracts/${encodeURIComponent(id)}/activate`, {}))); },
  async complete(id: string): Promise<ContractDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/contracts/${encodeURIComponent(id)}/complete`, {}))); },
  async terminate(id: string, terminationReason: string): Promise<ContractDetail> { return mapDetail(unwrap(await api.post<unknown>(`/api/v1/admin/sales/contracts/${encodeURIComponent(id)}/terminate`, { terminationReason }))); },
  async customers(search = ''): Promise<QuotationCustomerLookup[]> { return quotationService.customers(search); },
  async currencies(search = ''): Promise<QuotationCurrencyLookup[]> { return quotationService.currencies(search); },
};
