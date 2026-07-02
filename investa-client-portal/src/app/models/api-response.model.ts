/**
 * Generic API response wrapper used by backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Standard error/failed response returned by backend when `success` is false
 */
export interface ApiErrorResponse {
  success: boolean; // typically false
  message?: string;
  code?: number | string;
  errors?: Record<string, any> | any[];
  data?: any;
}

/**
 * Business category from backend
 */
export interface BusinessCategory {
  id: number;
  key: string;
  value: string;
  valueAr: string;
  sortOrder: number;
  createdAt: string;
}

/**
 * Team member DTO from backend.
 * Team members must be registered users (Founder or Both ClientType).
 * User profile data (name, avatar, bio, LinkedIn) is retrieved from the linked User/UserProfile.
 */
export interface TeamMemberDto {
  id: number;
  userId: string;  // Required - team members must be registered Founder/Partner users
  name: string;
  role: string;
  avatar?: string;
  linkedIn?: string;
  bio?: string;
  clientType?: string;  // The user's client type (Founder, Both)
}

/**
 * Investment DTO matching backend InvestmentDto
 * Supports Founding, Equity, Revenue Sharing, and Loan/Debt investment types
 */
export interface InvestmentDto {
  id: number;
  founderId: string;
  investorId?: string; // Deprecated, use founderId
  initialCapital: number;
  amount?: number; // Deprecated, use initialCapital
  date: string;
  
  // Equity crowdfunding fields
  sharePrice?: number;
  totalShares?: number;
  availableShares?: number;
  soldShares?: number;
  minInvestment?: number;
  maxInvestment?: number;
  valuationCap?: number;
  expectedROI?: number;
  investmentTypeId?: number; // 1 = Founding, 2 = Equity, 3 = Revenue Sharing, 4 = Loan
  status?: string;
  endDate?: string;
  
  // Computed properties
  currentFunding?: number;
  fundingPercentage?: number;
  investorCount?: number;
  // Investment amount specific to the requesting user (if available from API)
  investedAmount?: number;
  
  // Business details
  businessName?: string;
  description?: string;
  startDate?: string;
  businessStageId?: number;
  businessCategoryId?: number;
  businessCategoryName?: string;
  businessCategoryNameAr?: string;
  projectPhaseId?: number;
  targetFund?: number;
  milestone?: string;
  riskLevel?: string;
  currency?: string;
  momentumScore?: number;
  momentumLabel?: string;
  lastActivityAt?: string;
  publicActivityCount?: number;
  participantOnlyActivityCount?: number;
  visibilityLabel?: string;

  // Founding-specific fields
  durationMonths?: number;
  profitPercentage?: number;
  payoutFrequency?: string;
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  
  // Enriched data
  founderDisplay?: string;
  businessRole?: string;
  credibilityScore: number;
  participants?: any[];
  
// Team members from backend
   teamMembers?: TeamMemberDto[];

   // Image gallery for the investment (ordered by SortOrder)
   images?: Array<{ id: number; mediaType: number; url: string; thumbnailUrl?: string; fileName?: string; caption?: string; sortOrder?: number; isPrimary?: boolean; uploadedBy?: string }>;

   // Indicates whether the current requesting user has favorited this investment.
   favorited?: boolean;

  // ==================== Equity Exit Strategy Fields ====================
  currentValuation?: number;
  estimatedFutureValuation?: number;
  equityExitType?: number;
  exitTargetDate?: string;
  expectedExitStrategy?: string;

  // ==================== Revenue Sharing Exit Strategy Fields ====================
  contractStartDate?: string;
  contractEndDate?: string;
  totalExpectedPayout?: number;
  remainingPayoutAmount?: number;
  revenueDistributionFrequency?: string;
  contractCompletionStatus?: string;

  // ==================== Loan/Debt Exit Strategy Fields ====================
  repaymentStartDate?: string;
  finalRepaymentDate?: string;
  remainingBalance?: number;
  totalPaidAmount?: number;
  nextInstallmentDate?: string;
  defaultRiskLevel?: string;
  loanCompletionStatus?: string;
  interestRate?: number;
  repaymentFrequency?: string;
  gracePeriodMonths?: number;
  estimatedInstallment?: number;
  totalRepaymentAmount?: number;
}

/**
 * Create investment request DTO - matches backend CreateInvestmentDto
 * Used by founders to submit new investment opportunities
 */
export interface CreateInvestmentDto {
  // Founder info (set from auth token on backend)
  founderId?: string;
  
  // Financial structure
  initialCapital: number;
  sharePrice?: number;
  totalShares?: number;
  targetFund?: number;
  
  // Optional financial limits
  minInvestment?: number;
  maxInvestment?: number;
  valuationCap?: number;
  expectedROI?: number;
  
  // Business details - Required
  businessName: string;
  description: string;
  
  // Classification - Required
  businessCategoryId: number;
  businessStageId: number;
  
  // Classification - Optional
  projectPhaseId?: number;
  fundingGoalId?: number;
  fundingPurposeDetails?: string;
  milestone?: string;
  riskLevel?: string;
  currency?: string;
  
  // Investment type (1=Founding, 2=Equity, 3=RevenueSharing, 4=Loan)
  investmentTypeId?: number;
  
  // Founding-specific fields
  durationMonths?: number;
  profitPercentage?: number;
  payoutFrequency?: string;
  
  // Timeline
  startDate?: string;
  endDate?: string;
  
  // Media
  imageUrl?: string;
  videoUrl?: string;

  // ==================== Equity Exit Strategy Fields ====================
  currentValuation?: number;
  estimatedFutureValuation?: number;
  equityExitType?: number;
  exitTargetDate?: string;
  expectedExitStrategy?: string;

  // ==================== Revenue Sharing Exit Strategy Fields ====================
  contractStartDate?: string;
  contractEndDate?: string;
  totalExpectedPayout?: number;
  remainingPayoutAmount?: number;
  revenueDistributionFrequency?: string;
  contractCompletionStatus?: string;

  // ==================== Loan/Debt Exit Strategy Fields ====================
  repaymentStartDate?: string;
  finalRepaymentDate?: string;
  remainingBalance?: number;
  totalPaidAmount?: number;
  nextInstallmentDate?: string;
  defaultRiskLevel?: string;
  loanCompletionStatus?: string;
  interestRate?: number;
  repaymentFrequency?: string;
  gracePeriodMonths?: number;
  estimatedInstallment?: number;
  totalRepaymentAmount?: number;
}

/**
 * Business Stage lookup
 */
export interface BusinessStage {
  id: number;
  key: string;
  value: string;
  valueAr: string;
  sortOrder?: number;
}

/**
 * Project Phase lookup
 */
export interface ProjectPhase {
  id: number;
  key: string;
  value: string;
  valueAr: string;
  sortOrder?: number;
}
