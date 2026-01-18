export enum InvestmentType {
  Stock = 'Stock',
  Crypto = 'Crypto',
  Fund = 'Fund',
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Investment {
  id: number;
  name: string;
  type: InvestmentType;
  author: string;
  authorImage: string;
  score: number;
  description: string;
  riskLevel: RiskLevel;
  targetFund: number;
  currentFund: number;
  favorited: boolean;
  investors: { name: string; imageUrl: string }[];
  investedAmount?: number;
  isOwnProject?: boolean;
}