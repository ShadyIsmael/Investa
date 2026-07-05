export type RequestType = 'conversation' | 'participation';

export type RequestDirection = 'incoming' | 'outgoing';

export type RequestStatus = 'Requested' | 'Pending' | 'Negotiating' | 'Partner' | 'Rejected' | 'Accepted' | 'Declined' | 'Withdrawn' | 'Cancelled' | 'Closed';

export enum OpportunityRequestKind {
  Conversation = 'conversation',
  Participation = 'participation'
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
  opportunityId?: number;
  investorId?: string | number;
  founderId?: string | number;
  requestType?: OpportunityRequestKind;
  requestMetadata?: any;
  investorCredibilityScore?: number;
  founderCredibilityScore?: number;
  investorTrustLevel?: string;
  founderTrustLevel?: string;
  acceptedConversationId?: string | number | null;
  canAccept?: boolean;
  canReject?: boolean;
  canWithdraw?: boolean;
}
