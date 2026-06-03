// Progressive Trust System - Angular Models

export enum TrustLevel {
  Visitor = 0,
  Registered = 1,
  Interactive = 2,
  Verified = 3
}

export enum VerificationType {
  Email = 0,
  Phone = 1,
  GovernmentId = 2,
  Selfie = 3,
  LinkedIn = 4,
  Address = 5,
  LegalAgreement = 6
}

export enum VerificationStatus {
  None = 0,
  Pending = 1,
  Verified = 2
}

export interface TrustPermissionsDto {
  canBrowseOpportunities: boolean;
  canViewOpportunityDetails: boolean;
  canSaveOpportunities: boolean;
  canFollowUsers: boolean;
  canComment: boolean;
  canRequestJoinOpportunity: boolean;
  canParticipateInDiscussions: boolean;
  canPublishOpportunity: boolean;
  canJoinVerifiedDeals: boolean;
  canDirectMessage: boolean;
  canAccessAnalytics: boolean;
}

export interface TrustRequirementDto {
  key: string;
  labelEn: string;
  labelAr: string;
  isMet: boolean;
}

export interface UserVerificationDto {
  id: number;
  userId: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  provider?: string;
  submittedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface TrustProfileDto {
  userId: string;
  trustLevel: TrustLevel;
  reputationScore: number;
  profileCompletionPercentage: number;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  nextLevelRequirements: TrustRequirementDto[];
  permissions: TrustPermissionsDto;
  verifications: UserVerificationDto[];
}

export interface SubmitVerificationRequest {
  verificationType: VerificationType;
  documentUrl?: string;
  provider?: string;
  providerReferenceId?: string;
}

export const TRUST_LEVEL_LABELS: Record<TrustLevel, { en: string; ar: string }> = {
  [TrustLevel.Visitor]: { en: 'Visitor', ar: 'زائر' },
  [TrustLevel.Registered]: { en: 'Registered', ar: 'مسجل' },
  [TrustLevel.Interactive]: { en: 'Interactive', ar: 'تفاعلي' },
  [TrustLevel.Verified]: { en: 'Verified', ar: 'موثق' }
};

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  [TrustLevel.Visitor]: '#9ca3af',
  [TrustLevel.Registered]: '#3b82f6',
  [TrustLevel.Interactive]: '#f59e0b',
  [TrustLevel.Verified]: '#10b981'
};
