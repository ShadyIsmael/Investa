/**
 * Risk level for investments
 */
export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

/**
 * Investment type enumeration - matches backend InvestmentType enum
 * Supports Founding, Equity, Revenue Sharing, and Loan/Debt
 */
export enum MediaType {
  CoverImage = 0,
  Image = 1,
  Video = 2
}

export enum InvestmentType {
  Founding = 1,
  Equity = 2,
  RevenueSharing = 3,
  Loan = 4
}

/**
 * Equity exit strategy types
 */
export enum EquityExitType {
  Acquisition = 1,
  StrategicBuyout = 2,
  SecondaryShareSale = 3,
  IPO = 4,
  FounderBuyback = 5,
  Undetermined = 6
}

/**
 * Equity investment status lifecycle
 */
export enum EquityInvestmentStatus {
  Draft = 0,
  Active = 1,
  Funded = 2,
  Scaling = 3,
  Exited = 4,
  Acquired = 5,
  Closed = 6
}

/**
 * Revenue sharing investment status lifecycle
 */
export enum RevenueSharingInvestmentStatus {
  Draft = 0,
  Active = 1,
  RevenueDistribution = 2,
  Completed = 3,
  Expired = 4,
  Closed = 5
}

/**
 * Loan investment status lifecycle
 */
export enum LoanInvestmentStatus {
  Draft = 0,
  Active = 1,
  Repayment = 2,
  Completed = 3,
  Defaulted = 4,
  Closed = 5
}

/**
 * Helper to get display name for investment type
 */
export function getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
  if (type === undefined || type === null) return 'Unknown';
  
  switch (type) {
    case InvestmentType.Founding:
      return 'Profit Sharing';
    case InvestmentType.Equity:
      return 'Equity';
    case InvestmentType.RevenueSharing:
      return 'Profit Sharing';
    case InvestmentType.Loan:
      return 'Loan';
    default:
      return 'Unknown';
  }
}

/**
 * Helper to get investment type badge color classes
 */
export function getInvestmentTypeBadgeClass(type: InvestmentType | number | undefined): string {
  switch (type) {
    case InvestmentType.Founding:
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case InvestmentType.Equity:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case InvestmentType.RevenueSharing:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case InvestmentType.Loan:
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

/**
 * Helper to get display name for equity exit type
 */
export function getEquityExitTypeDisplay(type: EquityExitType | number | undefined): string {
  if (type === undefined || type === null) return 'Undetermined';
  
  switch (type) {
    case EquityExitType.Acquisition:
      return 'Acquisition';
    case EquityExitType.StrategicBuyout:
      return 'Strategic Buyout';
    case EquityExitType.SecondaryShareSale:
      return 'Secondary Share Sale';
    case EquityExitType.IPO:
      return 'IPO';
    case EquityExitType.FounderBuyback:
      return 'Founder Buyback';
    case EquityExitType.Undetermined:
    default:
      return 'Undetermined';
  }
}

/**
 * Investment status lifecycle - matches backend
 * All investment types share these statuses
 */
export enum InvestmentStatus {
  Draft = 'Draft',
  Active = 'Active',
  ReviewingParticipants = 'Reviewing Participants',
  InProgress = 'In Progress',
  FullyFunded = 'Fully Funded',
  Paused = 'Paused',
  Completed = 'Completed',
  Archived = 'Archived'
}

/**
 * Investment category (will be loaded from BusinessCategory API)
 */
export interface InvestmentCategory {
  id: number;
  key: string;
  value: string;
  valueAr: string;
}

/**
 * Team member / Partner in an investment opportunity.
 * Team members must be registered platform users with ClientType of Founder or Both.
 * User profile data (name, avatar, bio, LinkedIn) is retrieved from the linked User/UserProfile.
 */
export interface TeamMember {
  /**
   * Required member id (maps to internal Application User id).
   * Team members must be registered Founder/Partner users.
   */
  id: string;
  name: string;
  role: string;
  avatar?: string;
  linkedIn?: string;
  bio?: string;
  /** The user's client type (Founder, Both) */
  clientType?: string;
}

/**
 * Individual investor participation in an investment opportunity
 */
export interface InvestorParticipation {
  id: number;
  investmentId: number;
  investorId: string;
  investorName: string;
  investorAvatar?: string;
  sharesPurchased: number;
  amountInvested: number;
  investmentDate: Date;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  isAnonymous: boolean;
}

/**
 * Investment model for UI - Enhanced with exit strategy support
 */
export interface Investment {
  id: number;
  opportunityId?: number | string;
  readSource?: 'public-opportunity';
  founderId: string;
  founderDisplay?: string;
  businessRole?: string;
  
  // Equity Crowdfunding Structure
  sharePrice?: number;
  totalShares?: number;
  availableShares?: number;
  soldShares?: number;
  minInvestment?: number;
  maxInvestment?: number;
  valuationCap?: number;
  expectedROI?: number;
  investmentType?: InvestmentType;
  status: InvestmentStatus;
  
  // Financial Amounts
  initialCapital: number;  // Founder's initial contribution
  currentFunding: number;  // Total raised from investors
  investedAmount?: number; // Per-user invested amount (UI convenience)
  targetFund?: number;     // Fundraising goal
  fundingPercentage: number;
  
  // Core Details
  name: string;  // maps from businessName
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  
  // Dates
  date: Date;
  startDate?: Date;
  endDate?: Date;
  
  // Category and classification
  businessCategoryId?: number;
  businessCategoryName?: string;
  businessCategoryNameAr?: string;
  businessStageId?: number;
  projectPhaseId?: number;
  milestone?: string;
  projectStage?: string;
  shortDescription?: string;
  fullDescription?: string;
  fundingGoalName?: string;
  expectedReturnSummary?: string;
  publicInvestmentTermsSummary?: string;
  fundingPurpose?: string;
  tags?: string[];
  publicEvents?: Array<{
    id?: number | string;
    title?: string | null;
    description?: string | null;
    date?: Date | string | null;
    type?: string | null;
    isPublic?: boolean | null;
  }>;
  publicDocuments?: Array<{
    id?: number | string;
    fileName?: string | null;
    fileExtension?: string | null;
    fileSize?: number | null;
    fileUrl?: string | null;
    previewUrl?: string | null;
    purpose?: string | null;
    visibility?: string | null;
  }>;
  riskLevel: RiskLevel;
  currency?: string;
  momentumScore?: number;
  momentumLabel?: string;
  lastActivityAt?: Date;
  publicActivityCount?: number;
  participantOnlyActivityCount?: number;
  visibilityLabel?: string;

  // Founding-specific fields
  durationMonths?: number;
  profitPercentage?: number;
  payoutFrequency?: string;
  
  // ==================== Equity Exit Strategy Fields ====================
  
  /// Current company valuation (Equity type only)
  currentValuation?: number;
  
  /// Estimated future company valuation at exit (Equity type only)
  estimatedFutureValuation?: number;
  
  /// Planned exit strategy type (Equity type only)
  equityExitType?: EquityExitType;
  
  /// Target date for planned exit event (Equity type only)
  exitTargetDate?: Date;
  
  /// Detailed description of expected exit strategy (Equity type only)
  expectedExitStrategy?: string;

  // ==================== Revenue Sharing Exit Strategy Fields ====================
  
  /// Start date of revenue sharing contract (Revenue Sharing type only)
  contractStartDate?: Date;
  
  /// End date of revenue sharing contract (Revenue Sharing type only)
  contractEndDate?: Date;
  
  /// Total expected payout amount (Revenue Sharing type only)
  totalExpectedPayout?: number;
  
  /// Remaining payout amount to be distributed (Revenue Sharing type only)
  remainingPayoutAmount?: number;
  
  /// Frequency of revenue distribution (Revenue Sharing type only)
  revenueDistributionFrequency?: string;
  
  /// Contract completion status (Revenue Sharing type only)
  contractCompletionStatus?: string;

  // ==================== Loan/Debt Exit Strategy Fields ====================
  
  /// Start date of loan repayment schedule (Loan type only)
  repaymentStartDate?: Date;
  
  /// Final repayment date when loan is fully matured (Loan type only)
  finalRepaymentDate?: Date;
  
  /// Remaining principal balance to be repaid (Loan type only)
  remainingBalance?: number;
  
  /// Total amount paid so far (principal + interest) (Loan type only)
  totalPaidAmount?: number;
  
  /// Date of next scheduled installment payment (Loan type only)
  nextInstallmentDate?: Date;
  
  /// Default risk level assessment (Loan type only)
  defaultRiskLevel?: string;
  
  /// Loan completion status (Loan type only)
  loanCompletionStatus?: string;
  
  // Social Proof
  credibilityScore: number;
  investorCount: number;
  investors?: InvestorParticipation[];
  
  // Team & Partners
  teamMembers?: TeamMember[];
  
  // UI state
  favorited: boolean;
  images?: Array<{ id: number; mediaType: number; url: string; thumbnailUrl?: string; fileName?: string; caption?: string; sortOrder?: number; isPrimary?: boolean; uploadedBy?: string }>
}
