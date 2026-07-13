import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export interface MyParticipation {
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
  fileId?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  fileExtension?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  previewUrl?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  purpose?: string | null;
  isPublic?: boolean | null;
  sortOrder?: number | null;
  caption?: string | null;
  mediaType?: string | number | null;
  isCover?: boolean | null;
  isPrimary?: boolean | null;
}

export interface OpportunityDocument {
  id?: number | string;
  fileId?: string | null;
  fileKey?: string | null;
  title?: string | null;
  name?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  fileExtension?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  fileUrl?: string | null;
  purpose?: string | null;
  visibility?: 'Public' | 'Private' | string | null;
  searchTags?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
}

export interface OpportunityEvent {
  id?: number | string;
  title?: string | null;
  description?: string | null;
  eventDate?: string | null;
  date?: string | null;
  createdAt?: string | null;
  eventType?: string | null;
  type?: string | null;
  isPublic?: boolean | null;
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
}

export interface OpportunityParticipationForm {
  opportunityId: number | string;
  opportunityTitle?: string | null;
  investmentModel?: string | number | null;
  fundingTarget?: number | null;
  alreadyFundedAmount?: number | null;
  remainingFundingAmount?: number | null;
  currency?: string | null;
  minimumContribution?: number | null;
  maximumContribution?: number | null;
  returnRate?: number | null;
  returnRateType?: string | null;
  termValue?: number | null;
  termUnit?: string | null;
  repaymentModel?: string | null;
  expectedMaturityDate?: string | null;
  profitSharePercentage?: number | null;
  profitSharingPercentage?: number | null;
  proposedSharePercentage?: number | null;
  expectedProfitAmount?: number | null;
  expectedTotalPayoutAmount?: number | null;
  opportunityTotalExpectedPayout?: number | null;
  expectedDurationMonths?: number | null;
  durationMonths?: number | null;
  exitTerms?: string | null;
  exitStrategy?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  totalShares?: number | null;
  availableShares?: number | null;
  sharePrice?: number | null;
  minimumShares?: number | null;
  maximumShares?: number | null;
  minimumInvestmentAmount?: number | null;
  maximumInvestmentAmount?: number | null;
}

export interface CreateOpportunityJoinRequest {
  requestType: number;
  numberOfShares?: number | null;
  requestedAmount?: number | null;
  proposedSharePercentage?: number | null;
  message?: string | null;
  metadataJson?: string | null;
}

export interface OpportunityRoom {
  overview?: Opportunity | Record<string, any> | null;
  mediaLibrary?: OpportunityMedia[] | Record<string, OpportunityMedia[]> | null;
  media?: OpportunityMedia[] | Record<string, OpportunityMedia[]> | null;
  documentsLibrary?: OpportunityDocument[] | Record<string, OpportunityDocument[]> | null;
  documents?: OpportunityDocument[] | Record<string, OpportunityDocument[]> | null;
  timeline?: OpportunityEvent[] | Record<string, OpportunityEvent[]> | null;
  events?: OpportunityEvent[] | Record<string, OpportunityEvent[]> | null;
  milestones?: OpportunityMilestone[] | Record<string, OpportunityMilestone[]> | null;
  latestMilestone?: OpportunityMilestone | null;
  participantContext?: OpportunityRoomParticipantContext | null;
}

export interface Opportunity {
  id: number | string;
  founderId?: string | null;
  investmentId?: number | null;
  title?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  description?: string | null;
  categoryId?: number | string | null;
  categoryName?: string | null;
  investmentModel?: string | number | null;
  projectStage?: string | number | null;
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
  category?: OpportunityLookup | null;
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
  status?: string | null;
  createdAt?: string | null;
  tags?: Array<string | OpportunityLookup>;
  latestPublicUpdate?: string | null;
  fundingUsage?: string | null;
  risks?: string | null;
  exitStrategy?: string | null;
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
  title: string;
  shortDescription: string;
  fullDescription?: string | null;
  categoryId?: string | number | null;
  projectStage?: string | number | null;
  tagIds?: Array<string | number>;
  investmentModel?: string | number | null;
  fundingGoalId?: string | number | null;
  fundingTarget?: number | null;
  minimumInvestment?: number | null;
  minimumInvestmentAmount?: number | null;
  maximumInvestment?: number | null;
  maximumInvestmentAmount?: number | null;
  expectedDuration?: string | number | null;
  expectedDurationMonths?: string | number | null;
  profitSharePercentage?: number | null;
  profitSharingPayoutFrequency?: string | null;
  profitSharingContractStartDate?: string | null;
  profitSharingContractEndDate?: string | null;
  equityOfferedPercentage?: number | null;
  interestRate?: number | null;
  repaymentFrequency?: string | null;
  finalRepaymentDate?: string | null;
  coverImageUrl?: string | null;
  useOfFunds?: string | null;
  fundingUsage?: string | null;
  risks?: string | null;
  exitStrategy?: string | null;
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

  getViewerState(id: string | number): Promise<OpportunityViewerState> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/viewer-state`);
  }

  requestConversation(id: string | number): Promise<any> {
    return this.send<any>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/conversations`, {});
  }

  getParticipationForm(id: string | number): Promise<OpportunityParticipationForm> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/participation-form`);
  }

  createJoinRequest(id: string | number, payload: CreateOpportunityJoinRequest): Promise<any> {
    return this.send<any>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/join-requests`, payload);
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

  createOpportunity(payload: OpportunityUpsert): Promise<Opportunity> {
    return this.send<Opportunity>('post', '/api/v1/opportunities', this.toOpportunityRequest(payload));
  }

  updateOpportunity(id: string | number, payload: OpportunityUpsert): Promise<Opportunity> {
    return this.send<Opportunity>('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}`, this.toOpportunityRequest(payload));
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

  getCategories(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/opportunity-categories');
  }

  getTags(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/opportunity-tags');
  }

  getFundingGoals(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/funding-goals');
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
      title: payload.title,
      description: payload.fullDescription ?? null,
      shortDescription: payload.shortDescription,
      useOfFunds: payload.useOfFunds ?? payload.fundingUsage ?? null,
      fundingTarget: payload.fundingTarget,
      categoryId: payload.categoryId ?? null,
      fundingGoalId: payload.fundingGoalId ?? null,
      minimumInvestmentAmount: payload.minimumInvestmentAmount ?? payload.minimumInvestment ?? null,
      maximumInvestmentAmount: payload.maximumInvestmentAmount ?? payload.maximumInvestment ?? null,
      expectedDurationMonths: payload.expectedDurationMonths ?? payload.expectedDuration ?? null,
      profitSharePercentage: payload.profitSharePercentage ?? null,
      profitSharingPayoutFrequency: payload.profitSharingPayoutFrequency ?? null,
      profitSharingContractStartDate: payload.profitSharingContractStartDate ?? null,
      profitSharingContractEndDate: payload.profitSharingContractEndDate ?? null,
      equityOfferedPercentage: payload.equityOfferedPercentage ?? null,
      interestRate: payload.interestRate ?? null,
      repaymentFrequency: payload.repaymentFrequency ?? null,
      finalRepaymentDate: payload.finalRepaymentDate ?? null,
      tagIds: (payload.tagIds ?? []).map(value => Number(value)).filter(value => Number.isFinite(value)),
      investmentModel: this.toNumberOrNull(payload.investmentModel),
      projectStage: this.toNumberOrNull(payload.projectStage),
      coverImageUrl: payload.coverImageUrl ?? null
    };
  }

  private toNumberOrNull(value: string | number | null | undefined): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }) : new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}
