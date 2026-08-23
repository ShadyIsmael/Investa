export enum OfferLegType {
  Equity = 1,
  Loan = 2,
  ProfitSharing = 3
}

export enum OfferStatus {
  Pending = 1,
  Replaced = 2,
  Accepted = 3,
  Rejected = 4,
  Withdrawn = 5
}

export interface OfferLeg {
  id?: number;
  legType: OfferLegType;
  amount: number;
  equityPercentage?: number | null;
  sharesTerms?: string | null;
  returnRate?: number | null;
  termMonths?: number | null;
  repaymentModel?: string | null;
  profitSharePercentage?: number | null;
  exitTerms?: string | null;
}

export interface OfferVersion {
  id: number;
  opportunityId?: number | string | null;
  opportunityTitle?: string | null;
  conversationId?: string | null;
  createdByUserId?: string | null;
  createdByName?: string | null;
  createdByRole?: string | null;
  version: number;
  replacesOfferId?: number | null;
  status: OfferStatus;
  note?: string | null;
  currency: string;
  createdAt: string | Date;
  legs: OfferLeg[];
  canAccept?: boolean;
  canReject?: boolean;
  canRespond?: boolean;
  canWithdraw?: boolean;
}

export interface CreateOfferPayload {
  currency: string;
  note?: string | null;
  legs: OfferLeg[];
}

export function isTerminalOfferStatus(status: OfferStatus): boolean {
  return status === OfferStatus.Accepted || status === OfferStatus.Rejected || status === OfferStatus.Withdrawn;
}

export function canAcceptOffer(offer: Pick<OfferVersion, 'status' | 'canAccept'>): boolean {
  return offer.status === OfferStatus.Pending && offer.canAccept === true;
}

export function canRejectOffer(offer: Pick<OfferVersion, 'status' | 'canReject'>): boolean {
  return offer.status === OfferStatus.Pending && offer.canReject === true;
}

export function canRespondToOffer(offer: Pick<OfferVersion, 'status' | 'canRespond'>): boolean {
  return offer.status === OfferStatus.Pending && offer.canRespond === true;
}
