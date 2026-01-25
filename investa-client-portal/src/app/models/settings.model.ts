export enum ThemePreference {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
}

export enum DashboardDensity {
  Comfortable = 'comfortable',
  Compact = 'compact',
}

export enum DefaultInvestmentTypePreference {
  Any = 'any',
  Founding = 'founding',
  Equity = 'equity',
}

export enum CurrencyPreference {
  USD = 'USD',
  EUR = 'EUR',
  SAR = 'SAR',
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  showPublicProfile: boolean;
  sharePortfolioPerformance: boolean;
}

export interface PersonalizationSettings {
  dashboardDensity: DashboardDensity;
  defaultInvestmentType: DefaultInvestmentTypePreference;
  showRiskIndicators: boolean;
}

export interface SupportSettings {
  available: boolean;
  hours?: string;
}

export interface UserSettings {
  theme: ThemePreference;
  language: string; // 'en' | 'ar' etc.
  currency: CurrencyPreference;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  personalization: PersonalizationSettings;
  support: SupportSettings;
  walletBalance: number;
}
