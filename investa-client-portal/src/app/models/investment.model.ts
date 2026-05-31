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
 */
export enum InvestmentType {
  Founding = 1,
  Equity = 2
}

/**
 * Helper to get display name for investment type
 */
export function getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
  if (type === undefined || type === null) return 'Unknown';
  
  switch (type) {
    case InvestmentType.Founding:
      return 'Founding Investment';
    case InvestmentType.Equity:
      return 'Equity Investment';
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
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

/**
 * Investment status lifecycle
 */
export enum InvestmentStatus {
  Draft = 'Draft',
  Active = 'Active',
  Funded = 'Funded',
  Closed = 'Closed'
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
 * Investment model for UI - Enhanced for equity crowdfunding
 * Maps from backend InvestmentDto
 */
export interface Investment {
  id: number;
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
  riskLevel: RiskLevel;
  currency?: string;

  // Founding-specific fields
  durationMonths?: number;
  profitPercentage?: number;
  payoutFrequency?: string;
  
  // Social Proof
  credibilityScore: number;
  investorCount: number;
  investors?: InvestorParticipation[];
  
  // Team & Partners
  teamMembers?: TeamMember[];
  
  // UI state
  favorited: boolean;
  images?: Array<{ id: number; url: string; caption?: string; sortOrder?: number; isPrimary?: boolean }>
}