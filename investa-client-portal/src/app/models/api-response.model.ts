/**
 * Generic API response wrapper used by backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
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
  investmentTypeId?: number; // 1 = Founding, 2 = Equity
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
  projectPhaseId?: number;
  targetFund?: number;
  milestone?: string;
  riskLevel?: string;
  currency?: string;
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  
  // Enriched data
  founderDisplay?: string;
  credibilityScore: number;
  participants?: any[];
  
  // Team members from backend
  teamMembers?: TeamMemberDto[];
}

/**
 * Create investment request DTO - matches backend CreateInvestmentDto
 * Used by founders to submit new investment opportunities
 */
export interface CreateInvestmentDto {
  // Founder info (set from auth token on backend)
  founderId?: string;
  
  // Financial structure - Required for equity crowdfunding
  initialCapital: number;       // Founder's initial capital contribution
  sharePrice: number;           // Price per share
  totalShares: number;          // Total shares available for this round
  targetFund?: number;          // Total fundraising goal
  
  // Optional financial limits
  minInvestment?: number;       // Minimum investment per investor
  maxInvestment?: number;       // Maximum investment per investor
  valuationCap?: number;        // Company valuation cap
  expectedROI?: number;         // Expected return on investment (percentage)
  
  // Business details - Required
  businessName: string;
  description: string;
  
  // Classification - Required
  businessCategoryId: number;
  businessStageId: number;
  
  // Classification - Optional
  projectPhaseId?: number;
  milestone?: string;           // Current milestone
  riskLevel?: string;           // Low, Medium, High
  currency?: string;            // USD, EUR, SAR, EGP
  
  // Investment type
  investmentTypeId?: number;    // 1 = Founding, 2 = Equity
  
  // Timeline
  startDate?: string;           // ISO date string
  endDate?: string;             // ISO date string - investment deadline
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
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
