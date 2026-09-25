export interface FounderDashboardMoney {
  value: number | null;
  available: boolean;
  approximate: boolean;
  unavailableReason?: string | null;
}

export interface FounderDashboardMetrics {
  totalProjects: number;
  activeOpportunities: number;
  uniqueActiveInvestors: number;
  totalFundingTarget: FounderDashboardMoney;
  totalFunded: FounderDashboardMoney;
  fundingProgressPercentage: number | null;
  receivedAmount: FounderDashboardMoney;
  earnings: FounderDashboardMoney;
  pendingActions: number;
}

export interface FounderDashboardOpportunity {
  id: number;
  sequenceNumber: number;
  title: string;
  status: number | string;
  fundingStatus: number | string;
  fundingTarget: number;
  fundingCurrency: string;
  totalFundingTarget: FounderDashboardMoney;
  totalFunded: FounderDashboardMoney;
  activeInvestorCount: number;
  fundingProgressPercentage: number | null;
}

export interface FounderDashboardProject {
  id: number;
  displayName: string;
  status: number | string;
  defaultCurrency: string;
  opportunityCount: number;
  totalFundingTarget: FounderDashboardMoney;
  totalFunded: FounderDashboardMoney;
  fundingProgressPercentage: number | null;
  opportunities: FounderDashboardOpportunity[];
}

export interface FounderDashboardTimeSeriesPoint {
  periodStartUtc: string;
  value: number;
  currency: string;
  approximate: boolean;
  unavailable?: boolean;
}

export interface FounderDashboard {
  evaluatedAtUtc: string;
  displayCurrency: string;
  metrics: FounderDashboardMetrics;
  projects: FounderDashboardProject[];
  timeSeries: {
    fundingApprovals: FounderDashboardTimeSeriesPoint[];
    receivedAmounts: FounderDashboardTimeSeriesPoint[];
    earnings: FounderDashboardTimeSeriesPoint[];
  };
  availability: {
    followers: string;
    earnings: string;
    receivedAmount: string;
  };
}
