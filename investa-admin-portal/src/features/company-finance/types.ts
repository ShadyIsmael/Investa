export type FinanceTransactionStatus = 'Draft' | 'NeedsDocuments' | 'ReadyForReview' | 'Rejected' | 'Confirmed' | 'Reversed' | 'Cancelled';
export type FinanceTransactionType = 'MoneyIn' | 'MoneyOut' | 'InternalTransfer' | 'FounderPaid' | 'FounderReimbursement' | 'CashAdvance' | 'SupplierRefund' | 'AssetPurchase';

export type FinanceAccountType = 'BankAccount' | 'CompanyCard' | 'Cash' | 'PaymentGateway' | 'ForeignCurrencyAccount' | 'Other';
export interface FinanceAccount { id: number; code: string; name: string; description?: string | null; accountType: FinanceAccountType; currency: string; currentBalance: number; bankName?: string | null; bankAccountNumber?: string | null; openingDate?: string | null; isActive: boolean; }
export interface FinanceAccountInput { code: string; name: string; description?: string; accountType: FinanceAccountType; currency: string; bankName?: string; bankAccountNumber?: string; openingDate?: string; isActive: boolean; }
export type FinanceSupplierType = 'Company' | 'IndividualServiceProvider' | 'Freelancer' | 'GlobalServiceProvider' | 'Other';
export interface FinanceSupplier { id: number; supplierCode: string; name: string; nameEn?: string | null; nameAr?: string | null; supplierType: FinanceSupplierType; serviceCategory: string; legalName?: string | null; country?: string | null; email?: string | null; phoneNumber?: string | null; taxId?: string | null; paymentDetails?: string | null; paymentTerms?: string | null; notes?: string | null; isActive: boolean; }
export interface FinanceSupplierInput { name: string; supplierType: FinanceSupplierType; serviceCategory: string; legalName?: string; country?: string; email?: string; phoneNumber?: string; taxId?: string; paymentDetails?: string; paymentTerms?: string; notes?: string; isActive: boolean; }
export interface FinanceCategory { id: number; code: string; name: string; nameEn?: string | null; nameAr?: string | null; description?: string | null; glAccountCode?: string | null; sortOrder: number; isActive: boolean; }
export interface FinanceCategoryInput { code: string; name: string; description?: string; glAccountCode?: string; sortOrder: number; isActive: boolean; }
export interface FinanceTransaction { id: number; referenceNumber: string; transactionType: FinanceTransactionType; incomingMoneyType?: string | null; status: FinanceTransactionStatus; documentationStatus?: string | null; transactionDate: string; postingDate?: string | null; description: string; notes?: string | null; amount: number; currency: string; exchangeRate?: number; amountInBaseCurrency?: number; paymentGatewayFee?: number; netAmountReceived?: number; sourceName?: string | null; incomeCategoryId?: number | null; incomeCategoryName?: string | null; incomeCategoryNameEn?: string | null; incomeCategoryNameAr?: string | null; expenseCategoryId?: number | null; expenseCategoryName?: string | null; supplierId?: number | null; supplierName?: string | null; sourceAccountId?: number | null; sourceAccountName?: string | null; destinationAccountId?: number | null; destinationAccountName?: string | null; paymentMethod?: string | null; invoiceNumber?: string | null; externalReference?: string | null; makerId?: string | null; makerDisplayName?: string | null; submittedAt?: string | null; checkerId?: string | null; checkerDisplayName?: string | null; reviewedAt?: string | null; reviewDecision?: string | null; reviewReason?: string | null; confirmedAt?: string | null; confirmedBy?: string | null; createdAt?: string | null; updatedAt?: string | null; canEdit: boolean; canSubmit: boolean; canReview: boolean; canApprove: boolean; canConfirm: boolean; canReject: boolean; canReverse: boolean; }
export interface CreateFinanceTransactionRequest { transactionType: FinanceTransactionType; incomingMoneyType?: string; transactionDate: string; description: string; notes?: string; amount: number; currency: string; exchangeRate?: number; destinationAccountId?: number; sourceName?: string; incomeCategoryId?: number; expenseCategoryId?: number; paymentMethod?: string; paymentGatewayFee?: number; netAmountReceived?: number; invoiceNumber?: string; externalReference?: string; supplierId?: number; sourceAccountId?: number; }

export interface FinanceOverviewQuery { dateFrom: string; dateTo: string; accountId?: number; currency?: string; }
export interface FinancePendingSummary { draftCount: number; pendingReviewCount: number; approvedNotConfirmedCount: number; rejectedCount: number; pendingMoneyInAmount: number; pendingMoneyOutAmount: number; }
export interface FinanceAccountBalance { accountId: number; accountCode: string; accountName: string; accountType: string; currency: string; openingBalance: number; confirmedMoneyIn: number; confirmedMoneyOut: number; internalTransfersIn: number; internalTransfersOut: number; currentBalance: number; pendingIn: number; pendingOut: number; }
export interface FinanceMoneyInBreakdown { type: Exclude<string, 'InternalTransfer'>; transactionCount: number; amount: number; percentageOfTotalMoneyIn: number; }
export interface FinanceMoneyOutBreakdown { categoryId?: number | null; categoryCode?: string | null; categoryNameEn?: string | null; categoryNameAr?: string | null; transactionCount: number; amount: number; percentageOfTotalMoneyOut: number; }
export interface FinanceDocumentationSummary { documentedCount: number; partiallyDocumentedCount: number; undocumentedCount: number; undocumentedAmount: number; }
export interface FinancePeriodComparison { previousPeriodMoneyIn: number; previousPeriodMoneyOut: number; previousPeriodNetCashFlow: number; moneyInChangePercentage: number; moneyOutChangePercentage: number; netCashFlowChangePercentage: number; }
export interface FinanceRecentActivity { id: number; reference: string; transactionDate: string; transactionType: FinanceTransactionType; incomingMoneyType?: string | null; description: string; amount: number; currency: string; status: FinanceTransactionStatus; sourceAccountName?: string | null; destinationAccountName?: string | null; createdByDisplayName?: string | null; }
export interface FinanceOverview { dateFrom: string; dateTo: string; accountId?: number | null; currency?: string | null; totalMoneyIn: number; totalMoneyOut: number; netCashFlow: number; pending: FinancePendingSummary; accounts: FinanceAccountBalance[]; moneyInBreakdown: FinanceMoneyInBreakdown[]; moneyOutBreakdown: FinanceMoneyOutBreakdown[]; documentation: FinanceDocumentationSummary; periodComparison: FinancePeriodComparison; recentActivity: FinanceRecentActivity[]; }

export type FinanceReconciliationStatus = 'Draft' | 'Matched' | 'DifferenceFound' | 'Confirmed';
export interface FinanceReconciliationListDto {
  id: number;
  financeAccountId: number;
  financeAccountName: string | null;
  financeAccountCode: string | null;
  financeAccountCurrency: string | null;
  reconciliationDate: string;
  periodStartDate: string;
  periodEndDate: string;
  openingBalance: number;
  periodActivity: number;
  systemCalculatedBalance: number;
  actualStatementBalance: number;
  difference: number;
  status: FinanceReconciliationStatus;
  notes: string | null;
  createdBy: string | null;
  createdByDisplayName: string | null;
  createdAt: string;
  confirmedBy: string | null;
  confirmedByDisplayName: string | null;
  confirmedAt: string | null;
  canEdit: boolean;
  canRecalculate: boolean;
  canConfirm: boolean;
  canDelete: boolean;
}
export interface FinanceReconciliationDetailDto extends FinanceReconciliationListDto {
  updatedBy: string | null;
  updatedByDisplayName: string | null;
  updatedAt: string | null;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  timestamp: string;
}

