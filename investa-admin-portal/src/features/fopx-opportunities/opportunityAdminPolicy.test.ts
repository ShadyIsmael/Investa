import { describe, expect, it } from 'vitest';
import { allowedFundingTargets, canManageFunding, canReviewOpportunity, isValidRejectionReason } from './opportunityAdminPolicy';
import type { OpportunityDetail } from './opportunityAdminService';

const detail = (status: OpportunityDetail['status']): OpportunityDetail => ({
  id: 1, title: 'Opportunity', projectDisplayName: 'Project', founderId: 'founder', founder: { id: 'founder', name: 'Founder', email: null }, createdAt: '', updatedAt: '', status,
  fundingTarget: 1, projectStage: 'Idea', projectId: 2, sequenceNumber: 1, projectSummary: null,
  projectDescription: null, projectIndustry: null, description: null, shortDescription: null, useOfFunds: null, fundingCurrency: 'USD',
  moderationStatus: 'UnderReview', fundingStatus: 'NotScheduled', fundingOpensAt: null, fundingClosesAt: null, closedAt: null,
  closureReason: null, fundedAmount: 0, committedAmount: 0, confirmedReceivedAmount: 0, remainingFundingAmount: 1, fundingProgress: 0,
  fundingProgressPercent: 0, approvedParticipantCount: 0, coverImageUrl: null, projectContext: null,
  media: [], documents: [], events: [], reviewHistory: [],
});

describe('Opportunity admin policy', () => {
  it('separates page view from review action access and state', () => {
    expect(canReviewOpportunity(detail('UnderReview'), ['FOPX.Opportunities.Review'])).toBe(true);
    expect(canReviewOpportunity(detail('Approved'), ['FOPX.Opportunities.Review'])).toBe(false);
    expect(canReviewOpportunity(detail('UnderReview'), ['FOPX.Opportunities.View'])).toBe(false);
    expect(canReviewOpportunity(detail('UnderReview'), ['Opportunity.Manage'])).toBe(true);
  });

  it('exposes only backend-supported funding transitions', () => {
    expect(allowedFundingTargets('NotScheduled')).toEqual(['Scheduled', 'Open']);
    expect(allowedFundingTargets('Open')).toEqual(['Paused', 'Closed']);
    expect(allowedFundingTargets('Closed')).toEqual([]);
    expect(canManageFunding(['FOPX.Opportunities.Manage'])).toBe(true);
  });

  it('requires a bounded rejection reason', () => {
    expect(isValidRejectionReason('')).toBe(false);
    expect(isValidRejectionReason('  ')).toBe(false);
    expect(isValidRejectionReason('Reason')).toBe(true);
    expect(isValidRejectionReason('x'.repeat(1001))).toBe(false);
  });
});
