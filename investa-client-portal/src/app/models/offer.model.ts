export enum OfferLegType {
  Equity = 1,
  Loan = 2,
  ProfitSharing = 3
}

export const EQUITY_OWNERSHIP_MODELS = ['PercentageBased', 'ShareBased'] as const;
export type EquityOwnershipModel = typeof EQUITY_OWNERSHIP_MODELS[number];

export const REPAYMENT_MODELS = ['Monthly', 'Quarterly', 'SemiAnnual', 'Annual'] as const;
export type RepaymentModel = typeof REPAYMENT_MODELS[number];
export const PROFIT_SHARING_FREQUENCIES = ['Monthly', 'Quarterly', 'SemiAnnual', 'Annual'] as const;
export type ProfitSharingFrequency = typeof PROFIT_SHARING_FREQUENCIES[number];

export function repaymentModelLabelKey(value: string | null | undefined): string | null {
  const normalized = String(value ?? '').trim();
  return REPAYMENT_MODELS.includes(normalized as RepaymentModel)
    ? 'offerBuilder.repaymentModels.' + normalized
    : null;
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
  equityOwnershipModel?: EquityOwnershipModel | string | null;
  investorShareCount?: number | null;
  totalIssuedShares?: number | null;
  shareClass?: string | null;
  pricePerShare?: number | null;
  preMoneyValuation?: number | null;
  postMoneyValuation?: number | null;
  effectiveOwnershipDate?: string | Date | null;
  sharesTerms?: string | null;
  returnRate?: number | null;
  termMonths?: number | null;
  repaymentModel?: string | null;
  profitSharePercentage?: number | null;
  profitSharingPayoutFrequency?: ProfitSharingFrequency | string | null;
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
