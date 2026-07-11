import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { LoanTermsSnapshot, OpportunityRequest, OpportunityRequestKind, ProfitSharingTermsSnapshot } from '../models/request.model';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private authService = inject(AuthService);
  private apiBase = inject(API_BASE);

  private _incoming = signal<OpportunityRequest[]>([]);
  private _outgoing = signal<OpportunityRequest[]>([]);

  incoming = this._incoming.asReadonly();
  outgoing = this._outgoing.asReadonly();

  constructor() {}

  async refreshRequests(): Promise<void> {
    await this.loadRequests();
  }

  clearState(): void {
    this._incoming.set([]);
    this._outgoing.set([]);
  }

  async createOpportunityRequest(investment: { id?: string | number; opportunityId?: string | number | null }, ..._args: any[]): Promise<void> {
    const opportunityId = investment.opportunityId ?? investment.id;
    if (!opportunityId) {
      throw new Error('Opportunity is not available.');
    }

    await firstValueFrom(
      this.http.post(`${this.apiBase}/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/conversations`, {}, this.authService.getAuthorizedJsonOptions())
    );
    await this.loadRequests();
  }

  async acceptRequest(request: OpportunityRequest): Promise<string | number | null | undefined> {
    let acceptedConversationId: string | number | null | undefined;
    if (request.requestType === OpportunityRequestKind.Conversation) {
      const raw = await this.postConversationRequestAction(request.id, 'accept');
      const data = raw?.data ?? raw;
      acceptedConversationId = data?.acceptedConversationId;
    } else {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/approve`, {}, this.authService.getAuthorizedJsonOptions()));
    }

    await this.loadRequests();
    this.notifications.showToast({
      title: request.requestType === OpportunityRequestKind.Conversation ? 'Chat Accepted' : 'Participation Approved',
      message: `${request.projectName} request accepted.`,
      type: 'success'
    });
    return acceptedConversationId;
  }

  async declineRequest(request: OpportunityRequest): Promise<void> {
    if (request.requestType === OpportunityRequestKind.Conversation) {
      await this.postConversationRequestAction(request.id, 'reject');
    } else {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/reject`, { reason: 'Declined from Client Portal' }, this.authService.getAuthorizedJsonOptions()));
    }

    await this.loadRequests();
    this.notifications.showToast({
      title: request.requestType === OpportunityRequestKind.Conversation ? 'Chat Declined' : 'Participation Rejected',
      message: `${request.projectName} request declined.`,
      type: 'warning'
    });
  }

  async withdrawRequest(request: OpportunityRequest): Promise<void> {
    if (request.requestType === OpportunityRequestKind.Conversation) {
      await this.postConversationRequestAction(request.id, 'withdraw');
    } else {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/cancel`, {}, this.authService.getAuthorizedJsonOptions()));
    }

    await this.loadRequests();
    this.notifications.showToast({
      title: 'Request Withdrawn',
      message: `${request.projectName} request withdrawn.`,
      type: 'success'
    });
  }

  private async loadRequests(): Promise<void> {
    try {
      const [conversationRequestRaw, joinRaw] = await Promise.all([
        firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/conversation-requests`, this.authService.getAuthorizedJsonOptions())),
        firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/opportunities/my-join-requests`, this.authService.getAuthorizedJsonOptions()))
      ]);

      const conversationRequests = this.extractArray(conversationRequestRaw).map(row => this.mapConversationRequest(row));
      const joinRequests = this.extractArray(joinRaw).map(row => this.mapJoinRequest(row));
      const all = [...conversationRequests, ...joinRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this._incoming.set(all.filter(request => request.direction === 'incoming'));
      this._outgoing.set(all.filter(request => request.direction === 'outgoing'));
    } catch (error) {
      console.error('Failed to load opportunity requests:', error);
      this._incoming.set([]);
      this._outgoing.set([]);
    }
  }

  private mapConversationRequest(data: any): OpportunityRequest {
    const opportunity = data.opportunity || {};
    return {
      id: data.id ?? data.conversationRequestId ?? data.requestId,
      type: 'conversation',
      direction: this.normalizeDirection(data.direction),
      projectName: data.opportunityTitle || data.title || opportunity.title || 'Opportunity',
      projectImageUrl: '',
      counterpartName: data.counterpartyFullName || data.counterpartyName || data.investorFullName || data.founderFullName || 'Participant',
      senderName: data.requesterFullName || data.requesterName || data.investorFullName,
      receiverName: data.recipientFullName || data.recipientName || data.founderFullName,
      businessName: data.businessName || opportunity.businessName,
      shortDescription: data.message || data.shortDescription || opportunity.shortDescription,
      status: this.normalizeConversationRequestStatus(data.status ?? data.requestStatus ?? data.statusText),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      opportunityId: this.toNumber(data.opportunityId ?? opportunity.id),
      investorId: data.requesterUserId,
      founderId: data.recipientUserId,
      requestType: OpportunityRequestKind.Conversation,
      acceptedConversationId: data.acceptedConversationId ?? null,
      canAccept: !!data.canAccept,
      canReject: !!data.canReject,
      canWithdraw: !!data.canWithdraw,
      requestMetadata: data
    };
  }

  private mapJoinRequest(data: any): OpportunityRequest {
    const terms = this.parseTermsSnapshot(data.termsSnapshotJson);
    const loanTerms = this.toLoanTermsSnapshot(terms);
    const profitSharingTerms = this.toProfitSharingTermsSnapshot(terms);
    const investmentModel = data.investmentModel ?? terms.InvestmentModel ?? terms.investmentModel ?? null;
    return {
      id: data.id,
      type: 'participation',
      direction: this.normalizeDirection(data.direction),
      projectName: data.opportunityTitle || 'Opportunity',
      projectImageUrl: '',
      counterpartName: data.counterpartyFullName || data.counterpartyName || data.investorFullName || data.investorName || data.founderFullName || data.founderName || 'Participant',
      senderName: data.requesterFullName || data.requesterName || data.investorFullName || data.investorName,
      receiverName: data.recipientFullName || data.recipientName || data.founderFullName || data.founderName,
      status: this.normalizeStatus(data.status),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      requestedAmount: data.requestedAmount ?? data.calculatedTotalAmount ?? terms.TotalInvestmentAmount ?? terms.CalculatedTotalAmount ?? loanTerms?.requestedAmount ?? loanTerms?.contributionAmount ?? profitSharingTerms?.requestedAmount ?? profitSharingTerms?.contributionAmount,
      shares: data.numberOfShares ?? data.shares ?? terms.SelectedShares,
      sharePriceSnapshot: data.sharePriceSnapshot ?? terms.SharePriceSnapshot,
      calculatedTotalAmount: data.calculatedTotalAmount ?? data.totalAmount ?? terms.CalculatedTotalAmount ?? terms.TotalInvestmentAmount ?? loanTerms?.expectedTotalRepaymentAmount ?? profitSharingTerms?.calculatedTotalAmount,
      currencySnapshot: data.currency ?? terms.CurrencySnapshot ?? loanTerms?.currencySnapshot ?? profitSharingTerms?.currencySnapshot,
      opportunityId: this.toNumber(data.opportunityId),
      investorId: data.investorId,
      founderId: data.founderId,
      requestType: OpportunityRequestKind.Participation,
      investmentModel: investmentModel ? String(investmentModel) : null,
      loanTermsSnapshot: loanTerms,
      profitSharingTermsSnapshot: profitSharingTerms,
      requestMetadata: { ...data, termsSnapshot: terms }
    };
  }

  private parseTermsSnapshot(value: unknown): Record<string, any> {
    if (!value || typeof value !== 'string') return {};
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private toLoanTermsSnapshot(terms: Record<string, any>): LoanTermsSnapshot | null {
    const model = terms.InvestmentModel ?? terms.investmentModel;
    const modelKey = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    const hasLoanShape = modelKey === 'loaninvestment' || modelKey === 'loan' || modelKey === '3' || terms.ContributionAmount !== undefined || terms.ReturnRateSnapshot !== undefined;
    if (!hasLoanShape) return null;
    return {
      investmentModel: model ? String(model) : 'LoanInvestment',
      contributionAmount: this.toNullableNumber(terms.ContributionAmount),
      requestedAmount: this.toNullableNumber(terms.RequestedAmount),
      currencySnapshot: terms.CurrencySnapshot ?? null,
      returnRateSnapshot: this.toNullableNumber(terms.ReturnRateSnapshot),
      returnRateTypeSnapshot: terms.ReturnRateTypeSnapshot ?? null,
      termValueSnapshot: this.toNullableNumber(terms.TermValueSnapshot),
      termUnitSnapshot: terms.TermUnitSnapshot ?? null,
      repaymentModelSnapshot: terms.RepaymentModelSnapshot ?? null,
      expectedReturnAmount: this.toNullableNumber(terms.ExpectedReturnAmount),
      expectedTotalRepaymentAmount: this.toNullableNumber(terms.ExpectedTotalRepaymentAmount),
      calculatedTotalAmount: this.toNullableNumber(terms.CalculatedTotalAmount)
    };
  }

  private toProfitSharingTermsSnapshot(terms: Record<string, any>): ProfitSharingTermsSnapshot | null {
    const model = terms.InvestmentModel ?? terms.investmentModel;
    const modelKey = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    const hasProfitSharingShape = modelKey === 'capitalcontributionprofitsharing'
      || modelKey === 'profitsharing'
      || modelKey === 'profitshare'
      || modelKey === '2'
      || terms.ProposedSharePercentage !== undefined
      || terms.proposedSharePercentage !== undefined
      || terms.ProfitSharePercentageSnapshot !== undefined
      || terms.profitSharePercentage !== undefined;
    if (!hasProfitSharingShape) return null;
    return {
      investmentModel: model ? String(model) : 'CapitalContributionProfitSharing',
      contributionAmount: this.toNullableNumber(terms.ContributionAmount ?? terms.contributionAmount ?? terms.RequestedAmount ?? terms.requestedAmount),
      requestedAmount: this.toNullableNumber(terms.RequestedAmount ?? terms.requestedAmount),
      currencySnapshot: terms.CurrencySnapshot ?? terms.currencySnapshot ?? null,
      profitSharePercentageSnapshot: this.toNullableNumber(terms.ProfitSharePercentage ?? terms.profitSharePercentage ?? terms.ProfitSharePercentageSnapshot ?? terms.profitSharePercentageSnapshot ?? terms.ProfitSharingPercentageSnapshot),
      proposedSharePercentage: this.toNullableNumber(terms.ProposedSharePercentage ?? terms.proposedSharePercentage),
      expectedProfitAmount: this.toNullableNumber(terms.ExpectedProfitAmount ?? terms.expectedProfitAmount),
      expectedTotalPayoutAmount: this.toNullableNumber(terms.ExpectedTotalPayoutAmount ?? terms.expectedTotalPayoutAmount),
      opportunityTotalExpectedPayout: this.toNullableNumber(terms.OpportunityTotalExpectedPayout ?? terms.opportunityTotalExpectedPayout),
      termValueSnapshot: this.toNullableNumber(terms.TermValueSnapshot ?? terms.termValueSnapshot ?? terms.termValue),
      termUnitSnapshot: terms.TermUnitSnapshot ?? terms.termUnitSnapshot ?? terms.termUnit ?? null,
      expectedDurationMonthsSnapshot: this.toNullableNumber(terms.ExpectedDurationMonthsSnapshot ?? terms.expectedDurationMonthsSnapshot ?? terms.expectedDurationMonths),
      exitTermsSnapshot: terms.ExitTerms ?? terms.exitTerms ?? terms.ExitTermsSnapshot ?? terms.exitTermsSnapshot ?? null,
      contractStartDate: terms.ContractStartDate ?? terms.contractStartDate ?? null,
      contractEndDate: terms.ContractEndDate ?? terms.contractEndDate ?? null,
      calculatedTotalAmount: this.toNullableNumber(terms.CalculatedTotalAmount ?? terms.calculatedTotalAmount)
    };
  }

  private normalizeStatus(value: unknown): OpportunityRequest['status'] {
    const raw = String(value || 'Pending').toLowerCase();
    if (raw === '0') return 'Pending';
    if (raw.includes('accepted') || raw.includes('approved')) return 'Accepted';
    if (raw.includes('partner')) return 'Partner';
    if (raw.includes('reject')) return 'Rejected';
    if (raw.includes('declin')) return 'Declined';
    if (raw.includes('withdraw')) return 'Withdrawn';
    if (raw.includes('cancel')) return 'Cancelled';
    if (raw.includes('clos')) return 'Closed';
    if (raw.includes('negotiat') || raw.includes('progress')) return 'Negotiating';
    return 'Pending';
  }

  private normalizeConversationRequestStatus(value: unknown): OpportunityRequest['status'] {
    const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    switch (raw) {
      case '0':
      case 'pending':
        return 'Pending';
      case '1':
      case 'accepted':
        return 'Accepted';
      case '2':
      case 'rejected':
        return 'Rejected';
      case '3':
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return this.normalizeStatus(value);
    }
  }

  private async postConversationRequestAction(id: string | number, action: 'accept' | 'reject' | 'withdraw'): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/api/v1/conversation-requests/${encodeURIComponent(String(id))}/${action}`, {}, this.authService.getAuthorizedJsonOptions())
    );
  }

  private extractArray(raw: any): any[] {
    const data = raw?.data ?? raw;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.conversations)) return data.conversations;
    if (Array.isArray(data?.requests)) return data.requests;
    return [];
  }

  private normalizeDirection(value: unknown): 'incoming' | 'outgoing' {
    const raw = String(value || '').toLowerCase();
    return raw.includes('incoming') ? 'incoming' : 'outgoing';
  }

  private toNumber(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  private toNullableNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

}
