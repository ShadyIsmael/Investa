import { api } from '@/api/api';
import type { CreateFinanceTransactionRequest, FinanceAccount, FinanceAccountInput, FinanceCategory, FinanceCategoryInput, FinanceOverview, FinanceOverviewQuery, FinanceReconciliationDetailDto, FinanceReconciliationListDto, FinanceSupplier, FinanceSupplierInput, FinanceTransaction, PaginatedApiResponse } from '@/features/company-finance/types';

const base = '/api/v1/admin/company-finance';
const unwrap = <T>(value: T | { data?: T }): T => (value as { data?: T }).data ?? value as T;
type PagedTransactions = { data: FinanceTransaction[]; pageNumber: number; pageSize: number; totalCount: number };
const transactionRows = (value: PagedTransactions | FinanceTransaction[] | { data?: PagedTransactions | FinanceTransaction[] }): FinanceTransaction[] => {
  const outer = value as { data?: PagedTransactions | FinanceTransaction[] };
  const payload = outer.data ?? value;
  if (Array.isArray(payload)) return payload;
  return Array.isArray((payload as PagedTransactions).data) ? (payload as PagedTransactions).data : [];
};

type PagedResponse<T> = { data: T[]; pageNumber: number; pageSize: number; totalCount: number };
const extractPaged = <T,>(value: PagedResponse<T> | { data?: PagedResponse<T> }): PagedResponse<T> => {
  const outer = value as { data?: PagedResponse<T> };
  return outer.data ?? (value as PagedResponse<T>);
};

export const companyFinanceService = {
  getOverview: async (query: FinanceOverviewQuery) => {
    const params = new URLSearchParams({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    if (query.accountId) params.set('accountId', String(query.accountId));
    if (query.currency) params.set('currency', query.currency);
    return unwrap(await api.get<FinanceOverview | { data?: FinanceOverview }>(`${base}/overview?${params.toString()}`));
  },
  getTransactions: async () => transactionRows(await api.get<PagedTransactions | FinanceTransaction[] | { data?: PagedTransactions | FinanceTransaction[] }>(`${base}/transactions?pageNumber=1&pageSize=100`)),
  getMyReviewQueue: async (params: { pageNumber: number; pageSize: number; search?: string; transactionType?: string; incomingMoneyType?: string; dateFrom?: string; dateTo?: string; currency?: string; accountId?: number; minAmount?: number; maxAmount?: number }): Promise<PagedResponse<FinanceTransaction>> => {
    const searchParams = new URLSearchParams({ assignedToMe: 'true', pageNumber: String(params.pageNumber), pageSize: String(params.pageSize) });
    if (params.search) searchParams.set('search', params.search);
    if (params.transactionType) searchParams.set('transactionType', params.transactionType);
    if (params.incomingMoneyType) searchParams.set('incomingMoneyType', params.incomingMoneyType);
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params.currency) searchParams.set('currency', params.currency);
    if (params.accountId) searchParams.set('accountId', String(params.accountId));
    if (params.minAmount) searchParams.set('minAmount', String(params.minAmount));
    if (params.maxAmount) searchParams.set('maxAmount', String(params.maxAmount));
    return extractPaged(await api.get<PagedResponse<FinanceTransaction> | { data?: PagedResponse<FinanceTransaction> }>(`${base}/transactions?${searchParams.toString()}`));
  },
  getTransaction: async (id: number) => unwrap(await api.get<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}`)),
  createTransaction: async (input: CreateFinanceTransactionRequest) => unwrap(await api.post<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions`, input)),
  updateTransaction: async (id: number, input: Omit<CreateFinanceTransactionRequest, 'transactionType'>) => unwrap(await api.put<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}`, input)),
  submitTransaction: async (id: number) => unwrap(await api.post<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}/submit`, { submissionNotes: null })),
  approveTransaction: async (id: number) => unwrap(await api.post<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}/approve`, { approvalNotes: null })),
  rejectTransaction: async (id: number, rejectionReason: string) => unwrap(await api.post<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}/reject`, { rejectionReason })),
  confirmTransaction: async (id: number) => unwrap(await api.post<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}/confirm`, { note: null })),
  reverseTransaction: async (id: number, reversalReason: string) => unwrap(await api.post<FinanceTransaction | { data?: FinanceTransaction }>(`${base}/transactions/${id}/reverse`, { reversalReason })),
  getAccounts: async () => unwrap(await api.get<FinanceAccount[] | { data?: FinanceAccount[] }>(`${base}/accounts`)),
  createAccount: async (input: FinanceAccountInput) => unwrap(await api.post<FinanceAccount | { data?: FinanceAccount }>(`${base}/accounts`, input)),
  updateAccount: async (id: number, input: FinanceAccountInput) => unwrap(await api.put<FinanceAccount | { data?: FinanceAccount }>(`${base}/accounts/${id}`, input)),
  getSuppliers: async () => unwrap(await api.get<FinanceSupplier[] | { data?: FinanceSupplier[] }>(`${base}/suppliers`)),
  createSupplier: async (input: FinanceSupplierInput) => unwrap(await api.post<FinanceSupplier | { data?: FinanceSupplier }>(`${base}/suppliers`, input)),
  updateSupplier: async (id: number, input: FinanceSupplierInput) => unwrap(await api.put<FinanceSupplier | { data?: FinanceSupplier }>(`${base}/suppliers/${id}`, input)),
  getIncomeCategories: async () => unwrap(await api.get<FinanceCategory[] | { data?: FinanceCategory[] }>(`${base}/income-categories`)),
  createIncomeCategory: async (input: FinanceCategoryInput) => unwrap(await api.post<FinanceCategory | { data?: FinanceCategory }>(`${base}/income-categories`, input)),
  updateIncomeCategory: async (id: number, input: FinanceCategoryInput) => unwrap(await api.put<FinanceCategory | { data?: FinanceCategory }>(`${base}/income-categories/${id}`, input)),
  getExpenseCategories: async () => unwrap(await api.get<FinanceCategory[] | { data?: FinanceCategory[] }>(`${base}/expense-categories`)),
  createExpenseCategory: async (input: FinanceCategoryInput) => unwrap(await api.post<FinanceCategory | { data?: FinanceCategory }>(`${base}/expense-categories`, input)),
  updateExpenseCategory: async (id: number, input: FinanceCategoryInput) => unwrap(await api.put<FinanceCategory | { data?: FinanceCategory }>(`${base}/expense-categories/${id}`, input)),
  getReconciliations: async (params: { pageNumber: number; pageSize: number; search?: string; status?: string; dateFrom?: string; dateTo?: string; accountId?: number; onlyWithDifference?: boolean }): Promise<{ data: FinanceReconciliationListDto[]; pageNumber: number; pageSize: number; totalCount: number }> => {
    const searchParams = new URLSearchParams({ pageNumber: String(params.pageNumber), pageSize: String(params.pageSize) });
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.dateFrom) searchParams.set('fromDate', params.dateFrom);
    if (params.dateTo) searchParams.set('toDate', params.dateTo);
    if (params.accountId) searchParams.set('accountId', String(params.accountId));
    if (params.onlyWithDifference) searchParams.set('onlyWithDifference', 'true');
    const response = await api.get<PaginatedApiResponse<FinanceReconciliationListDto>>(`${base}/reconciliations?${searchParams.toString()}`);
    return { data: response.data, pageNumber: response.pageNumber, pageSize: response.pageSize, totalCount: response.totalCount };
  },
  getReconciliationById: async (id: number) => api.get<FinanceReconciliationDetailDto>(`${base}/reconciliations/${id}`),
};
