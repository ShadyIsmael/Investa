export type RequestType = 'conversation' | 'participation';

export type RequestDirection = 'incoming' | 'outgoing';

export type RequestStatus = 'Requested' | 'Pending' | 'Negotiating' | 'Partner' | 'Rejected' | 'Accepted' | 'Declined' | 'Withdrawn' | 'Cancelled' | 'Closed';

export enum OpportunityRequestKind {
  Conversation = 'conversation',
  Participation = 'participation'
}

export interface LoanTermsSnapshot {
  investmentModel?: string | null;
  contributionAmount?: number | null;
  requestedAmount?: number | null;
  currencySnapshot?: string | null;
  returnRateSnapshot?: number | null;
  returnRateTypeSnapshot?: string | null;
  termValueSnapshot?: number | null;
  termUnitSnapshot?: string | null;
  repaymentModelSnapshot?: string | null;
  expectedReturnAmount?: number | null;
  expectedTotalRepaymentAmount?: number | null;
  calculatedTotalAmount?: number | null;
}

export interface ProfitSharingTermsSnapshot {
  investmentModel?: string | null;
  contributionAmount?: number | null;
  requestedAmount?: number | null;
  currencySnapshot?: string | null;
  profitSharePercentageSnapshot?: number | null;
  proposedSharePercentage?: number | null;
  expectedProfitAmount?: number | null;
  expectedTotalPayoutAmount?: number | null;
  opportunityTotalExpectedPayout?: number | null;
  termValueSnapshot?: number | null;
  termUnitSnapshot?: string | null;
  expectedDurationMonthsSnapshot?: number | null;
  exitTermsSnapshot?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  calculatedTotalAmount?: number | null;
}

export interface OpportunityRequest {
  id: number | string;
  type: RequestType;
  direction: RequestDirection;
  projectName: string;
  projectImageUrl: string;
  counterpartName: string;
  senderName?: string;
  receiverName?: string;
  businessName?: string;
  shortDescription?: string;
  status: RequestStatus;
  createdAt: Date;
  requestedAmount?: number;
  shares?: number;
  sharePriceSnapshot?: number;
  calculatedTotalAmount?: number;
  currencySnapshot?: string;
  opportunityId?: number;
  investorId?: string | number;
  founderId?: string | number;
  requestType?: OpportunityRequestKind;
  requestMetadata?: any;
  investmentModel?: string | null;
  loanTermsSnapshot?: LoanTermsSnapshot | null;
  profitSharingTermsSnapshot?: ProfitSharingTermsSnapshot | null;
  investorCredibilityScore?: number;
  founderCredibilityScore?: number;
  investorTrustLevel?: string;
  founderTrustLevel?: string;
  acceptedConversationId?: string | number | null;
  canAccept?: boolean;
  canReject?: boolean;
  canWithdraw?: boolean;
}
