import { Inject, Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export interface MyParticipation {
  projectId: number;
  projectDisplayName: string;
  projectTotalInvestment: number;
  opportunityTotalInvestment: number;
  participations: ParticipationItem[];
  id: number | string;
  opportunityId: number | string | null;
  opportunityTitle: string | null;
  founderDisplayName: string | null;
  investmentModel: string | number | null;
  shortDescription: string | null;
  coverImageUrl: string | null;
  approvedContributionAmount: number | null;
  fundedAmount: number | null;
  fundingTarget: number | null;
  fundingProgressPercentage: number | null;
  remainingFundingAmount: number | null;
  approvedParticipantCount: number | null;
  participationStatus: string | number | null;
  contractAvailable: boolean | null;
  currentContractId: string | number | null;
  currentContractVersion: string | number | null;
  canOpenProjectRoom: boolean | null;
  currency: string | null;
  categoryName: string | null;
  categoryNameAr: string | null;
  businessRole: string | null;

  // Loan-specific fields
  principal: number | null;
  interestRate: number | null;
  expectedDurationMonths: number | null;
  repaymentFrequency: string | null;
  finalRepaymentDate: string | null;
  expectedReturn: number | null;
  expectedTotalRepayment: number | null;

  // Equity-specific fields
  approvedShares: number | null;
  sharePrice: number | null;
  ownershipPercentage: number | null;
  soldShares: number | null;
  remainingShares: number | null;

  // Profit Sharing-specific fields
  contribution: number | null;
  profitSharePercentage: number | null;
  payoutFrequency: string | null;
  expectedProfit: number | null;
  expectedTotalPayout: number | null;
}

export interface OpportunityLookup {
  id: number | string;
  name?: string | null;
  value?: string | null;
  label?: string | null;
  key?: string | null;
}

export interface OpportunityMedia {
  id?: number | string;
  opportunityId?: number | string;
  fileId?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  fileExtension?: string | null;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  previewUrl?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  purpose?: string | number | null;
  isPublic?: boolean | null;
  sortOrder?: number | null;
  caption?: string | null;
  mediaType?: string | number | null;
  isCover?: boolean | null;
  isPrimary?: boolean | null;
  createdByUserId?: string | null;
  createdAt?: string | null;
}

export interface OpportunityDocument {
  id?: number | string;
  opportunityId?: number | string;
  fileId?: string | null;
  fileKey?: string | null;
  title?: string | null;
  name?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  fileExtension?: string | null;
  documentType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  fileUrl?: string | null;
  purpose?: string | number | null;
  visibility?: 'Public' | 'Private' | string | number | null;
  searchTags?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
  createdByUserId?: string | null;
  createdAt?: string | null;
}

export interface OpportunityEvent {
  id?: number | string;
  opportunityId?: number | string;
  title?: string | null;
  description?: string | null;
  eventDate?: string | null;
  date?: string | null;
  createdAt?: string | null;
  eventType?: string | null;
  type?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  isPublic?: boolean | null;
  createdByUserId?: string | null;
  titleKey?: string | null;
  descriptionKey?: string | null;
  actorType?: 'System' | 'Founder' | 'Admin' | string | null;
  occurredAt?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  metadata?: Record<string, string | null> | null;
}

export interface OpportunityProjectContext {
  id: number;
  displayName: string;
  legalName?: string | null;
  slug?: string | null;
  summary?: string | null;
  description?: string | null;
  categoryId?: number | null;
  category?: OpportunityLookup | null;
  industry?: string | null;
  businessStage?: string | number | null;
  geography?: string | null;
  foundedOn?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  teamDescription?: string | null;
  businessModel?: string | null;
  riskLevel?: string | null;
  riskDisclosure?: string | null;
  status?: string | number | null;
  defaultCurrency?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ParticipationItem {
  participationId: number;
  sequenceNumber: number;
  approvedAmount: number;
  fundingCurrency: string;
  approvedAt: string | null;
  contractId: number | null;
  contractNumber: string | null;
  contractVersion: number | null;
  contractDocumentHash: string | null;
}

export interface CurrencyReference {
  isoCode: string;
  englishName: string;
  arabicName: string;
  symbol: string;
  decimalDigits: number;
  isActive: boolean;
  supportsFunding: boolean;
  supportsSettlement: boolean;
  supportsWallet: boolean;
}

export interface ApprovedInvestor {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  approvedAt: string;
  totalApprovedContribution: number;
  participations: ApprovedParticipationSummary[];
}

export interface ApprovedParticipationSummary {
  participationRequestId: number;
  investmentModel: string;
  approvedContribution: number;
  currency: string | null;
  approvedAt: string;
}

export interface InvestorPaymentSummary {
  investorId: string;
  displayName: string;
  avatarUrl: string | null;
  totalApprovedContribution: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  nextDueDate: string | null;
  unpaidInstallmentCount: number;
  status: string;
  currency: string | null;
  investmentModelLabel: string;
  legTypes?: string[];
}

export interface ExpectedPaymentScheduleItem {
  dueDate: string;
  expectedInterest: number;
  expectedPrincipal: number;
  expectedTotal: number;
  actualPaid: number | null;
  remainingAmount: number;
  paymentDate: string | null;
  paymentReference: string | null;
  status: string;
}

export interface ParticipationPaymentSchedule {
  participationRequestId: number;
  opportunityId: number;
  opportunityTitle: string;
  currency: string | null;
  principal: number;
  annualInterestRate: number;
  durationMonths: number;
  repaymentFrequency: string;
  principalRepaymentMethod: number;
  startDate: string;
  finalRepaymentDate: string;
  totalExpectedInterest: number;
  averageExpectedMonthlyIncome: number;
  receivedToDate: number | null;
  remainingPrincipal: number | null;
  payments: ExpectedPaymentScheduleItem[];
  legs?: ParticipationLeg[];
}

export interface ParticipationLeg {
  legNumber: number;
  legType: string;
  amount: number;
  currency?: string | null;
  equityPercentage?: number | null;
  sharesTerms?: string | null;
  returnRate?: number | null;
  termMonths?: number | null;
  repaymentModel?: string | null;
  profitSharePercentage?: number | null;
  exitTerms?: string | null;
  status: string;
  cashFlows: ExpectedPaymentScheduleItem[];
  obligations: ParticipationObligation[];
}

export interface ParticipationObligation {
  party: string;
  description: string;
  status: string;
}

export interface OpportunityRoomContract {
  contractId: number;
  contractNumber: string;
  currentVersionNumber: number;
  status: string | number;
  documentHash: string;
  activatedAt?: string | null;
}

export interface OpportunityRoomParticipation {
  participationId: number;
  sequenceNumber: number;
  investorId: string;
  investorDisplayName: string;
  status: string | number;
  approvedAmount: number;
  fundingCurrency: string;
  acceptedAt?: string | null;
  acceptedOfferId?: number | null;
  termsImmutable: boolean;
  termsSnapshotHash: string;
  legs: ParticipationLeg[];
  contract?: OpportunityRoomContract | null;
}

export interface PaymentAllocationDetail {
  installmentNumber: number;
  allocatedAmount: number;
}

export interface PaymentTransactionDetail {
  id: number;
  participationRequestId: number;
  amount: number;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  isReversed: boolean;
  reversalReason: string | null;
  reversedAt: string | null;
  createdByName: string | null;
  createdAt: string;
  allocations: PaymentAllocationDetail[];
}

export interface RecordPaymentRequest {
  participationRequestId: number;
  amount: number;
  paymentDate: string;
  reference?: string | null;
  notes?: string | null;
}

export interface ReversePaymentRequest {
  paymentTransactionId: number;
  reason: string;
}

export interface InvestorPaymentDetail {
  investorId: string;
  displayName: string;
  avatarUrl: string | null;
  investmentModel: string;
  currency: string | null;
  participations: ParticipationPaymentSchedule[];
  paymentTransactions: PaymentTransactionDetail[];
}

export interface MonthlyUnpaidInstallmentItem {
  participationRequestId: number;
  investorId: string;
  investorDisplayName: string;
  installmentNumber: number;
  dueDate: string;
  expectedTotal: number;
  alreadyPaid: number;
  remainingAmount: number;
}

export interface MonthlyBulkConfirmPreview {
  year: number;
  month: number;
  investorCount: number;
  installmentCount: number;
  totalRemainingAmount: number;
  installments: MonthlyUnpaidInstallmentItem[];
}

export interface BulkConfirmMonthlyRequest {
  year?: number | null;
  month?: number | null;
}

export interface BulkConfirmMonthlyResult {
  confirmedCount: number;
  totalAmount: number;
  reputationPointsAwarded: number;
  founderNotificationId: number;
  investorNotificationIds: number[];
}

export interface PublicProjectActivityPage {
  items: OpportunityEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OpportunityMilestone {
  milestoneId?: number | string;
  id?: number | string;
  title?: string | null;
  description?: string | null;
  targetDate?: string | null;
  status?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
}

export interface OpportunityRoomParticipantContext {
  role?: 'Founder' | 'ApprovedInvestor' | string | null;
  userRole?: 'Founder' | 'ApprovedInvestor' | string | null;
  roomRole?: 'Founder' | 'ApprovedInvestor' | string | null;
  isFounder?: boolean | null;
  isAdmin?: boolean | null;
  isApprovedParticipant?: boolean | null;
  approvedParticipantCount?: number | null;
  canAccessProjectRoom?: boolean | null;
  canEditCoreProject?: boolean | null;
  canAddUpdate?: boolean | null;
  canAddDocument?: boolean | null;
  canAddMilestone?: boolean | null;
  canViewPrivateFiles?: boolean | null;
  canDownloadFiles?: boolean | null;
  canUpload?: boolean | null;
  canPostUpdate?: boolean | null;
}

export interface OpportunityViewerState {
  opportunityId?: number | string | null;
  isFounder?: boolean | null;
  canViewAuthorizedDetails?: boolean | null;
  hasConversationRequest?: boolean | null;
  conversationRequestId?: string | number | null;
  conversationRequestStatus?: string | number | null;
  conversationRequestStatusText?: string | null;
  hasConversation?: boolean | null;
  canRequestChat?: boolean | null;
  conversationId?: string | number | null;
  conversationStatus?: string | number | null;
  conversationStatusText?: string | null;
  founderReady?: boolean | null;
  investorReady?: boolean | null;
  canContinueConversation?: boolean | null;
  canMarkReadyToProceed?: boolean | null;
  participationRequestId?: string | number | null;
  participationStatus?: string | number | null;
  hasPendingParticipationRequest?: boolean | null;
  projectRoomUnlocked?: boolean | null;
  canOpenProjectRoom?: boolean | null;
  canSubmitDirectOffer?: boolean | null;
  directOfferStatus?: string | number | null;
  directOfferId?: string | number | null;
  directOfferVersion?: number | null;
  contractAvailable?: boolean | null;
  contractId?: string | number | null;
}

export interface OpportunityRoom {
  projectId?: number | null;
  projectDisplayName?: string | null;
  overview?: Opportunity | Record<string, any> | null;
  mediaLibrary?: OpportunityMedia[] | Record<string, OpportunityMedia[]> | null;
  media?: OpportunityMedia[] | Record<string, OpportunityMedia[]> | null;
  documentsLibrary?: OpportunityDocument[] | Record<string, OpportunityDocument[]> | null;
  documents?: OpportunityDocument[] | Record<string, OpportunityDocument[]> | null;
  timeline?: OpportunityEvent[] | Record<string, OpportunityEvent[]> | null;
  events?: OpportunityEvent[] | Record<string, OpportunityEvent[]> | null;
  milestones?: OpportunityMilestone[] | Record<string, OpportunityMilestone[]> | null;
  latestMilestone?: OpportunityMilestone | null;
  participations?: OpportunityRoomParticipation[] | null;
  participantContext?: OpportunityRoomParticipantContext | null;
}

export interface Opportunity {
  id: number | string;
  projectId?: number | string | null;
  projectDisplayName?: string | null;
  projectSummary?: string | null;
  projectDescription?: string | null;
  projectIndustry?: string | null;
  projectLogoUrl?: string | null;
  sequenceNumber?: number | null;
  purpose?: string | null;
  type?: string | null;
  founderId?: string | null;
  favorited?: boolean;
  title?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  description?: string | null;
  investmentModel?: string | number | null;
  projectStage?: string | number | null;
  projectStageCustomName?: string | null;
  fundingGoalId?: number | string | null;
  fundingGoalName?: string | null;
  fundingPurpose?: string | null;
  useOfFunds?: string | null;
  fundingTarget?: number | null;
  minimumInvestment?: number | null;
  minimumInvestmentAmount?: number | null;
  maximumInvestment?: number | null;
  maximumInvestmentAmount?: number | null;
  expectedDuration?: string | number | null;
  expectedDurationMonths?: string | number | null;
  currency?: string | null;
  equityOfferedPercentage?: number | null;
  totalShares?: number | null;
  offeredShares?: number | null;
  soldShares?: number | null;
  remainingShares?: number | null;
  allocatedEquityPercentage?: number | null;
  remainingEquityPercentage?: number | null;
  sharePrice?: number | null;
  profitSharePercentage?: number | null;
  profitSharingPayoutFrequency?: string | null;
  profitSharingContractStartDate?: string | null;
  profitSharingContractEndDate?: string | null;
  interestRate?: number | null;
  repaymentFrequency?: string | null;
  finalRepaymentDate?: string | null;
  coverImageUrl?: string | null;
  founder?: {
    id?: string | null;
    userId?: string | null;
    displayName?: string | null;
    name?: string | null;
    fullName?: string | null;
    businessRole?: string | null;
    summary?: string | null;
    avatarUrl?: string | null;
  } | null;
  fundingGoal?: OpportunityLookup | null;
  publicInvestmentTermsSummary?: string | null;
  expectedReturnSummary?: string | null;
  fundingProgressPercent?: number | null;
  fundingProgressPercentage?: number | null;
  approvedParticipantCount?: number | null;
  fundedAmount?: number | null;
  alreadyFundedAmount?: number | null;
  remainingFundingAmount?: number | null;
  currentUserParticipationStatus?: string | number | null;
  canAccessProjectRoom?: boolean | null;
  mediaCount?: number | null;
  documentCount?: number | null;
  hasCover?: boolean | null;
  hasMedia?: boolean | null;
  hasDocuments?: boolean | null;
  founderSummary?: string | null;
  status?: string | number | null;
  moderationStatus?: string | number | null;
  fundingStatus?: string | number | null;
  fundingOpensAt?: string | null;
  fundingClosesAt?: string | null;
  closedAt?: string | null;
  closureReason?: string | number | null;
  obligationCompletionStatus?: string | number | null;
  acceptingParticipations?: boolean;
  createdAt?: string | null;
  tags?: Array<string | OpportunityLookup>;
  latestPublicUpdate?: string | null;
  fundingUsage?: string | null;
  risks?: string | null;
  exitStrategy?: string | null;
  media?: OpportunityMedia[];
  documents?: OpportunityDocument[];
  events?: OpportunityEvent[];
  recentProjectActivity?: OpportunityEvent[];
  projectActivityTotalCount?: number;
  projectContext?: OpportunityProjectContext | null;
  isLockedForEditing?: boolean | null;
  firstInvestorJoinedAt?: string | null;
  updatedAt?: string | null;
}

export interface OpportunityObligationCompletion {
  opportunityId:number; status:string|number; requiredParticipationCount:number; completedParticipationCount:number;
  participations:Array<{participationRequestId:number;participationSequence:number;investorId:string;isCompleted:boolean;
    confirmations:Array<{id:number;partyRole:string|number;requiredUserId:string;status:string|number;confirmedByUserId?:string;confirmedAt?:string;confirmationStatement?:string}>}>;
}

export interface OpportunityFilters {
  search?: string;
  investmentModel?: string;
  categoryId?: string | number;
  fundingGoalId?: string | number;
  projectStage?: string;
  minFunding?: number | null;
  maxFunding?: number | null;
  minimumInvestment?: number | null;
  tagIds?: Array<string | number>;
}

export interface OpportunityUpsert {
  projectId?: number | null;
  purpose?: string | null;
  type?: string | null;
  title: string;
  shortDescription: string;
  fullDescription?: string | null;
  projectStage?: string | number | null;
  projectStageCustomName?: string | null;
  tagIds?: Array<string | number>;
  fundingGoalId?: string | number | null;
  fundingTarget?: number | null;
  fundingCurrency?: string | null;
  coverImageUrl?: string | null;
  useOfFunds?: string | null;
  fundingUsage?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  constructor(private http: HttpClient, @Inject(API_BASE) private apiBase: string) {}

  getPublicOpportunities(filters: OpportunityFilters = {}): Promise<Opportunity[]> {
    return this.getList('/api/v1/public/opportunities', filters);
  }

  getPublicOpportunity(id: string | number): Promise<Opportunity> {
    return this.getOne(`/api/v1/public/opportunities/${encodeURIComponent(String(id))}`);
  }

  getPublicProjectActivity(id: string | number, page = 1, pageSize = 20): Promise<PublicProjectActivityPage> {
    return this.getOne(`/api/v1/public/opportunities/${encodeURIComponent(String(id))}/project-activity?page=${page}&pageSize=${pageSize}`);
  }

  getFavoriteOpportunities(): Promise<Opportunity[]> {
    return this.getList('/api/v1/opportunities/favorites');
  }

  getFavoriteStatus(id: string | number): Promise<{ opportunityId: number; favorited: boolean }> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/favorite`);
  }

  setFavorite(id: string | number, favorited: boolean): Promise<{ opportunityId: number; favorited: boolean }> {
    return this.send('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}/favorite`, { favorited });
  }

  getViewerState(id: string | number): Promise<OpportunityViewerState> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/viewer-state`);
  }

  requestConversation(id: string | number): Promise<any> {
    return this.send<any>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/conversations`, {});
  }

  getMyOpportunities(): Promise<Opportunity[]> {
    return this.getList('/api/v1/opportunities/my');
  }

  getMyParticipations(): Promise<MyParticipation[]> {
    return this.getList('/api/v1/opportunities/my-participations');
  }

  getFounderOpportunity(id: string | number): Promise<Opportunity> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}`);
  }

  getOpportunityRoom(id: string | number): Promise<OpportunityRoom> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/room`);
  }

  transitionFunding(id: string | number, payload: {
    targetStatus: 'Scheduled'|'Open'|'Paused'|'Closed';
    fundingOpensAt?: string | null;
    fundingClosesAt?: string | null;
    closureReason?: 'TargetReached'|'DeadlineReached'|'FounderClosed'|'Cancelled'|'ComplianceClosed'|null;
    reason?: string | null;
  }): Promise<Opportunity> {
    return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/funding-status`, payload);
  }

  getObligationCompletion(id:string|number):Promise<OpportunityObligationCompletion>{
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/obligations`);
  }

  initiateObligationCompletion(id:string|number):Promise<OpportunityObligationCompletion>{
    return this.send('post',`/api/v1/opportunities/${encodeURIComponent(String(id))}/obligations/initiate`,{});
  }

  confirmObligationCompletion(id:string|number,participationId:number,statement:string,idempotencyKey:string):Promise<OpportunityObligationCompletion>{
    return this.send('post',`/api/v1/opportunities/${encodeURIComponent(String(id))}/obligations/participations/${participationId}/confirm`,
      {statement,idempotencyKey,acknowledgeNoPaymentProof:true});
  }

  getApprovedInvestors(id: string | number): Promise<ApprovedInvestor[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/approved-investors`);
  }

  getOpportunityPayments(id: string | number): Promise<InvestorPaymentSummary[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/payments`);
  }

  getInvestorPaymentDetails(id: string | number, investorId: string): Promise<InvestorPaymentDetail> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/investors/${encodeURIComponent(investorId)}`);
  }

  recordPayment(id: string | number, payload: RecordPaymentRequest): Promise<PaymentTransactionDetail> {
    return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments`, payload);
  }

  reversePayment(id: string | number, payload: ReversePaymentRequest): Promise<PaymentTransactionDetail> {
    return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/reverse`, payload);
  }

  getMonthlyUnpaidPreview(id: string | number, year?: number | null, month?: number | null): Promise<MonthlyBulkConfirmPreview> {
    let path = `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/monthly-unpaid`;
    const params: string[] = [];
    if (year != null) params.push(`year=${encodeURIComponent(year)}`);
    if (month != null) params.push(`month=${encodeURIComponent(month)}`);
    if (params.length) path += '?' + params.join('&');
    return this.getOne(path);
  }

  bulkConfirmMonthlyPayments(id: string | number, payload: BulkConfirmMonthlyRequest): Promise<BulkConfirmMonthlyResult> {
    return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/bulk-confirm-monthly`, payload);
  }

  createOpportunity(payload: OpportunityUpsert): Promise<Opportunity> {
    const request = this.toOpportunityRequest(payload);
    if (isDevMode()) console.debug('[Opportunity Create] payload', request);
    return this.send<Opportunity>('post', '/api/v1/opportunities', request);
  }

  updateOpportunity(id: string | number, payload: OpportunityUpsert): Promise<Opportunity> {
    const request = this.toOpportunityRequest(payload);
    if (isDevMode()) console.debug('[Opportunity Update] payload', request);
    return this.send<Opportunity>('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}`, request);
  }

  publishOpportunity(id: string | number): Promise<Opportunity> {
    return this.send<Opportunity>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/publish`, {});
  }

  getMedia(id: string | number): Promise<OpportunityMedia[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/media`);
  }

  getDocuments(id: string | number): Promise<OpportunityDocument[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/documents`);
  }

  getEvents(id: string | number): Promise<OpportunityEvent[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/events`);
  }

  createMedia(id: string | number, payload: Partial<OpportunityMedia>): Promise<OpportunityMedia> {
    return this.send<OpportunityMedia>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/media`, payload);
  }

  createDocument(id: string | number, payload: Partial<OpportunityDocument>): Promise<OpportunityDocument> {
    return this.send<OpportunityDocument>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/documents`, payload);
  }

  createEvent(id: string | number, payload: Partial<OpportunityEvent>): Promise<OpportunityEvent> {
    return this.send<OpportunityEvent>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/events`, payload);
  }

  completeMilestone(id: string | number, milestoneId: string | number): Promise<OpportunityMilestone> {
    return this.send<OpportunityMilestone>(
      'post',
      `/api/v1/opportunities/${encodeURIComponent(String(id))}/milestones/${encodeURIComponent(String(milestoneId))}/complete`,
      {}
    );
  }

  getCategories(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/opportunity-categories');
  }

  getTags(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/opportunity-tags');
  }

  getFundingGoals(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/funding-goals');
  }

  getCurrencies(purpose?: 'funding' | 'settlement' | 'wallet'): Promise<CurrencyReference[]> {
    return this.getList(`/api/currency${purpose ? `?purpose=${encodeURIComponent(purpose)}` : ''}`);
  }

  label(value: OpportunityLookup | string | number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return value.name || value.value || value.label || value.key || String(value.id);
  }

  private async getList<T = any>(path: string, filters: OpportunityFilters = {}): Promise<T[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<T[] | { items: T[] }> | T[] | { items: T[] }>(
        `${this.apiBase}${path}`,
        { headers: this.authHeaders(), params: this.toParams(filters) }
      )
    );
    const data = this.extractData<T[] | { items: T[] }>(raw, 'Failed to load data.');
    return Array.isArray(data) ? data : data?.items ?? [];
  }

  private async getOne<T = any>(path: string): Promise<T> {
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<T> | T>(`${this.apiBase}${path}`, { headers: this.authHeaders() })
    );
    return this.extractData<T>(raw, 'Failed to load data.');
  }

  private async send<T>(method: 'post' | 'put', path: string, payload: any): Promise<T> {
    const request = method === 'post' ? this.http.post : this.http.put;
    const raw = await firstValueFrom(
      request.call(this.http, `${this.apiBase}${path}`, payload, { headers: this.authHeaders() })
    );
    return this.extractData<T>(raw as ApiResponse<T> | T, 'Request failed.');
  }

  private extractData<T>(raw: ApiResponse<T> | T | null | undefined, fallbackMessage: string): T {
    if (!raw) throw new Error(fallbackMessage);
    const wrapped = raw as ApiResponse<T>;
    if (wrapped.data !== undefined) {
      if (wrapped.success === false) throw new Error(wrapped.message || fallbackMessage);
      return wrapped.data;
    }
    return raw as T;
  }

  private toParams(filters: OpportunityFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return;
      if (Array.isArray(value)) {
        value.forEach(item => params = params.append(key, String(item)));
      } else {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  private toOpportunityRequest(payload: OpportunityUpsert): Record<string, unknown> {
    return {
      projectId: payload.projectId ?? null,
      purpose: payload.purpose ?? null,
      type: payload.type ?? null,
      title: payload.title,
      description: payload.fullDescription ?? null,
      shortDescription: payload.shortDescription,
      useOfFunds: payload.useOfFunds ?? payload.fundingUsage ?? null,
      fundingTarget: payload.fundingTarget,
      fundingGoalId: payload.fundingGoalId ?? null,
      fundingCurrency: payload.fundingCurrency ?? null,
      tagIds: (payload.tagIds ?? []).map(value => Number(value)).filter(value => Number.isFinite(value)),
      projectStage: this.toNumberOrNull(payload.projectStage),
      projectStageCustomName: payload.projectStageCustomName?.trim() || null,
      coverImageUrl: payload.coverImageUrl ?? null
    };
  }

  private toNumberOrNull(value: string | number | null | undefined): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private authHeaders(): HttpHeaders {
    // Authorization is attached and refreshed centrally by AuthInterceptor.
    // Avoid copying a possibly expired token into this service's request options.
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}
