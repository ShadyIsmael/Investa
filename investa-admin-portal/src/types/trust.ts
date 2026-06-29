// Progressive Trust System - React Admin Portal Types

export enum TrustLevel {
  Visitor = 0,
  Registered = 1,
  Interactive = 2,
  TrustedActive = 3
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
  providerReferenceId?: string;
  documentUrl?: string;
  submittedAt: string;
  verifiedAt?: string;
  expirationDate?: string;
  notes?: string;
}

export interface TrustProfileDto {
  userId: string;
  trustLevel: TrustLevel;
  verificationTrustScore?: number;
  reputationScore: number;
  activityScore?: number;
  riskFlags?: string[];
  profileCompletionPercentage: number;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  nextLevelRequirements: TrustRequirementDto[];
  permissions: TrustPermissionsDto;
  verifications: UserVerificationDto[];
}

export interface ReviewVerificationRequest {
  verificationId: number;
  isApproved: boolean;
  notes?: string;
}

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  [TrustLevel.Visitor]: 'Visitor',
  [TrustLevel.Registered]: 'Registered',
  [TrustLevel.Interactive]: 'Interactive',
  [TrustLevel.TrustedActive]: 'Trusted Active'
};

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  [TrustLevel.Visitor]: 'default',
  [TrustLevel.Registered]: 'primary',
  [TrustLevel.Interactive]: 'warning',
  [TrustLevel.TrustedActive]: 'success'
};

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  [VerificationType.Email]: 'Email',
  [VerificationType.Phone]: 'Phone',
  [VerificationType.GovernmentId]: 'Government ID',
  [VerificationType.Selfie]: 'Selfie',
  [VerificationType.LinkedIn]: 'LinkedIn',
  [VerificationType.Address]: 'Address',
  [VerificationType.LegalAgreement]: 'Legal Agreement'
};

export interface ReputationRuleDto {
  id: number;
  ruleCode: string;
  description: string;
  points: number;
  isEnabled: boolean;
  isSystem: boolean;
  isAutomatic: boolean;
  canRepeat: boolean;
  maximumOccurrences: number;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReputationTransactionDto {
  id: number;
  userId: string;
  reputationRuleId?: number;
  ruleCode?: string;
  points: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
  occurredAt: string;
}
