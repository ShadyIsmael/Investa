import { matchesPermission } from '@/core/routePolicy';
import type { OpportunityDetail, OpportunityFundingStatus } from './opportunityAdminService';

export const canReviewOpportunity = (opportunity: OpportunityDetail, permissions: string[]): boolean =>
  opportunity.status === 'UnderReview' && (
    matchesPermission('FOPX.Opportunities.Review', permissions) ||
    matchesPermission('FOPX.Opportunities.Manage', permissions)
  );

export const canManageFunding = (permissions: string[]): boolean =>
  matchesPermission('FOPX.Opportunities.Manage', permissions);

export const isValidRejectionReason = (reason: string): boolean => reason.trim().length > 0 && reason.trim().length <= 1000;

/** Mirrors the backend's explicitly supported funding transitions only. */
export const allowedFundingTargets = (current: OpportunityFundingStatus): OpportunityFundingStatus[] => {
  switch (current) {
    case 'NotScheduled': return ['Scheduled', 'Open'];
    case 'Scheduled': return ['Open', 'Closed'];
    case 'Open': return ['Paused', 'Closed'];
    case 'Paused': return ['Open', 'Closed'];
    default: return [];
  }
};
