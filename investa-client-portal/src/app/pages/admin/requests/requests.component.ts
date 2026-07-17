import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';

import { RequestsService } from '../../../services/requests.service';
import { RoleContextService } from '../../../services/role-context.service';

import { FileStoreService } from '../../../services/file-store.service';

import { OpportunityRequest, OpportunityRequestKind } from '../../../models/request.model';



@Component({

  standalone: true,

  selector: 'app-requests',

  templateUrl: './requests.component.html',

  styleUrls: ['./requests.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CommonModule, TranslatePipe]

})

export class RequestsComponent {

  private requestsService = inject(RequestsService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private fileStoreService = inject(FileStoreService);
  private roleContext = inject(RoleContextService);



  tab = signal<'incoming' | 'outgoing'>('incoming');



  incoming = this.requestsService.incoming;

  outgoing = this.requestsService.outgoing;

  incomingCount = computed(() => this.incoming().length);
  outgoingCount = computed(() => this.outgoing().length);
  currentConversationCount = computed(() => this.currentTabRequests().filter(request => request.requestType === OpportunityRequestKind.Conversation).length);
  currentParticipationCount = computed(() => this.currentTabRequests().filter(request => request.requestType === OpportunityRequestKind.Participation).length);



  // Filter state

  statusFilter = signal<string>('pending');

  typeFilter = signal<string>('all');

  dateFilter = signal<string>('all');
  searchTerm = signal('');
  loading = signal(false);
  loadError = signal<string | null>(null);



  // Pagination state

  currentPage = signal<number>(1);

  pageSize = 6;



  constructor() {
    void this.refresh();
  }

  t(path: string, fallback?: string): string {
    const result = this.languageService.translate(path);
    return result === path ? (fallback ?? path) : result;
  }



  // Computed filtered requests

  filteredRequests = computed(() => {

    const requests = this.tab() === 'incoming' ? this.incoming() : this.outgoing();



    return requests.filter(request => {
      const query = this.searchTerm().trim().toLocaleLowerCase('en');
      if (query && ![
        request.projectName,
        request.counterpartName,
        request.senderName,
        request.receiverName,
        request.businessName
      ].filter((value): value is string => !!value).some(value => value.toLocaleLowerCase('en').includes(query))) return false;


      // Status filter

      if (this.statusFilter() !== 'all') {

        if (this.statusFilter() === 'pending' && !this.isPendingRequest(request)) return false;

        if (this.statusFilter() === 'accepted' && request.status !== 'Accepted' && request.status !== 'Partner') return false;

        if (this.statusFilter() === 'rejected' && request.status !== 'Declined' && request.status !== 'Rejected') return false;

      }



      // Type filter

      if (this.typeFilter() !== 'all') {

        if (this.typeFilter() === 'conversation' && request.requestType !== OpportunityRequestKind.Conversation) return false;

        if (this.typeFilter() === 'participation' && request.requestType !== OpportunityRequestKind.Participation) return false;

      }



      // Date filter

      if (this.dateFilter() !== 'all') {

        const now = new Date();

        const requestDate = new Date(request.createdAt);

        const daysDiff = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));



        if (this.dateFilter() === 'today' && daysDiff > 0) return false;

        if (this.dateFilter() === '7days' && daysDiff > 7) return false;

        if (this.dateFilter() === '30days' && daysDiff > 30) return false;

      }



      return true;

    }).sort((a, b) => {
      const typeDelta = this.requestTypeOrder(a) - this.requestTypeOrder(b);
      return typeDelta || b.createdAt.getTime() - a.createdAt.getTime();
    });

  });



  // Computed paginated requests

  paginatedRequests = computed(() => {

    const filtered = this.filteredRequests();

    const startIndex = (this.currentPage() - 1) * this.pageSize;

    return filtered.slice(startIndex, startIndex + this.pageSize);

  });



  // Computed total pages

  totalPages = computed(() => {

    return Math.ceil(this.filteredRequests().length / this.pageSize);

  });



  // Computed display range

  displayRange = computed(() => {

    const filtered = this.filteredRequests();

    const startIndex = (this.currentPage() - 1) * this.pageSize;

    const endIndex = Math.min(startIndex + this.pageSize, filtered.length);

    return filtered.length > 0 ? `${startIndex + 1}-${endIndex}` : '0-0';

  });



  async refresh() {
    try {
      this.loading.set(true);
      this.loadError.set(null);
      await this.requestsService.refreshRequests();
    } catch {
      this.loadError.set(this.t('requests.states.loadError', 'Unable to load requests.'));
    } finally {
      this.loading.set(false);
    }

  }

  currentTabRequests(): OpportunityRequest[] {
    return this.tab() === 'incoming' ? this.incoming() : this.outgoing();
  }

  shouldShowSectionHeader(request: OpportunityRequest, index: number): boolean {
    if (this.typeFilter() !== 'all') return index === 0;
    const previous = this.paginatedRequests()[index - 1];
    return !previous || previous.requestType !== request.requestType;
  }

  getSectionTitle(request: OpportunityRequest): string {
    return request.requestType === OpportunityRequestKind.Conversation
      ? this.t('requests.sections.conversationRequests', 'Conversation Requests')
      : this.t('requests.sections.participationRequests', 'Participation Requests');
  }

  getSectionCount(request: OpportunityRequest): number {
    return request.requestType === OpportunityRequestKind.Conversation
      ? this.currentConversationCount()
      : this.currentParticipationCount();
  }

  getEmptyTitle(): string {
    if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
      return this.t('requests.empty.noMatch', 'No requests match the selected filters.');
    }

    if (this.typeFilter() === 'participation') {
      if (this.tab() === 'incoming' && this.roleContext.isActiveFounderContext()) {
        return this.t('requests.empty.noIncomingParticipation', 'No incoming participation requests');
      }
      if (this.tab() === 'outgoing') {
        return this.t('requests.empty.noOutgoingParticipation', 'No participation requests submitted');
      }
    }

    return this.tab() === 'incoming'
      ? this.t('requests.noIncoming', 'No incoming requests.')
      : this.t('requests.noOutgoing', 'No outgoing requests.');
  }

  getEmptySubtitle(): string {
    if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
      return this.t('requests.empty.tryAdjustFilters', 'Try adjusting your filter criteria.');
    }
    if (this.typeFilter() === 'participation') {
      return this.t('requests.empty.participationHelper', 'Participation requests are shown separately from conversation requests.');
    }
    return this.tab() === 'incoming'
      ? this.t('requests.noIncomingSubtitle', 'Incoming requests will appear here.')
      : this.t('requests.noOutgoingSubtitle', 'Outgoing requests will appear here.');
  }



  switchTab(tab: 'incoming' | 'outgoing') {

    this.tab.set(tab);

    this.currentPage.set(1);

  }



  setStatusFilter(status: string) {

    this.statusFilter.set(status);

    this.currentPage.set(1);

  }



  setTypeFilter(type: string) {

    this.typeFilter.set(type);

    this.currentPage.set(1);

  }



  setDateFilter(date: string) {

    this.dateFilter.set(date);

    this.currentPage.set(1);

  }

  setSearchTerm(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }



  goToPage(page: number) {

    if (page >= 1 && page <= this.totalPages()) {

      this.currentPage.set(page);

    }

  }



  nextPage() {

    if (this.currentPage() < this.totalPages()) {

      this.currentPage.set(this.currentPage() + 1);

    }

  }



  previousPage() {

    if (this.currentPage() > 1) {

      this.currentPage.set(this.currentPage() - 1);

    }

  }



  async accept(request: OpportunityRequest) {
    const acceptedConversationId = await this.requestsService.acceptRequest(request);
    if (request.requestType === OpportunityRequestKind.Conversation && acceptedConversationId) {
      await this.router.navigate(['/admin/chat'], { queryParams: { conversationId: acceptedConversationId } });
    }

  }



  decline(request: OpportunityRequest) {

    this.requestsService.declineRequest(request);

  }



  withdraw(request: OpportunityRequest) {

    this.requestsService.withdrawRequest(request);

  }



  resolveImageUrl(url?: string | null): string {

    return this.fileStoreService.getPublicUrl(url);

  }



  getTimeAgo(date: Date): string {

    const now = new Date();

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);



    let interval = seconds / 31536000;

    if (interval > 1) { const years = Math.floor(interval); return `${years} year${years > 1 ? 's' : ''} ago`; }

    interval = seconds / 2592000;

    if (interval > 1) { const months = Math.floor(interval); return `${months} month${months > 1 ? 's' : ''} ago`; }

    interval = seconds / 86400;

    if (interval > 1) { const days = Math.floor(interval); return `${days} day${days > 1 ? 's' : ''} ago`; }

    interval = seconds / 3600;

    if (interval > 1) { const hours = Math.floor(interval); return `${hours} hour${hours > 1 ? 's' : ''} ago`; }

    interval = seconds / 60;

    if (interval > 1) { const minutes = Math.floor(interval); return `${minutes} minute${minutes > 1 ? 's' : ''} ago`; }

    return `${Math.floor(seconds)} second${seconds > 1 ? 's' : ''} ago`;

  }



  /**

   * Get display text for request type

   */

  getRequestTypeDisplay(request: OpportunityRequest): string {

    if (!request.requestType) return this.t('requests.types.participationRequest', 'Participation Request');



    switch (request.requestType) {

      case OpportunityRequestKind.Conversation:

        return this.t('requests.types.conversationRequest', 'Conversation Request');

      case OpportunityRequestKind.Participation:

        return `${this.getInvestmentModelDisplay(request)} ${this.t('requests.types.participation', 'Participation')}`;

      default:

        return this.t('requests.types.participationRequest', 'Participation Request');

    }

  }



  /**

   * Get badge class for request type

   */

  getRequestTypeBadgeClass(request: OpportunityRequest): string {
    return request.requestType === OpportunityRequestKind.Participation
      ? 'request-type-badge participation'
      : 'request-type-badge conversation';

  }



  /**

   * Check if request has investment interest metadata

   */

  hasParticipationMetadata(request: OpportunityRequest): boolean {

    return request.requestType === OpportunityRequestKind.Participation && request.requestMetadata;

  }



  /**

   * Get shares requested from metadata

   */

  getSharesRequested(request: OpportunityRequest): number {

    return request.shares || request.requestMetadata?.sharesRequested || request.requestMetadata?.numberOfShares || request.requestMetadata?.termsSnapshot?.SelectedShares || 0;

  }



  /**

   * Get share price from metadata

   */

  getSharePrice(request: OpportunityRequest): number {

    return request.sharePriceSnapshot || request.requestMetadata?.sharePrice || request.requestMetadata?.termsSnapshot?.SharePriceSnapshot || 0;

  }

  isLoanRequest(request: OpportunityRequest): boolean {
    const model = request.investmentModel ?? request.loanTermsSnapshot?.investmentModel ?? request.requestMetadata?.termsSnapshot?.InvestmentModel;
    const key = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    return key === 'loaninvestment' || key === 'loan' || key === '3' || !!request.loanTermsSnapshot;
  }

  isProfitSharingRequest(request: OpportunityRequest): boolean {
    const model = request.investmentModel ?? request.profitSharingTermsSnapshot?.investmentModel ?? request.requestMetadata?.termsSnapshot?.InvestmentModel;
    const key = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    return key === 'capitalcontributionprofitsharing'
      || key === 'profitsharing'
      || key === 'profitshare'
      || key === '2'
      || !!request.profitSharingTermsSnapshot;
  }

  getInvestmentModelDisplay(request: OpportunityRequest): string {
    if (this.isLoanRequest(request)) return this.t('requests.types.loan', 'Loan');
    if (this.isProfitSharingRequest(request)) return this.t('requests.types.profitSharing', 'Profit Sharing');
    return this.t('requests.types.equity', 'Equity');
  }

  getLoanContributionAmount(request: OpportunityRequest): number {
    return request.loanTermsSnapshot?.contributionAmount
      ?? request.loanTermsSnapshot?.requestedAmount
      ?? request.requestedAmount
      ?? 0;
  }

  getLoanReturnRate(request: OpportunityRequest): string {
    const snapshot = request.loanTermsSnapshot;
    const rate = snapshot?.returnRateSnapshot;
    if (rate === null || rate === undefined) return this.unavailableLabel();
    const suffix = snapshot?.returnRateTypeSnapshot ? ` ${this.localizedTermValue(snapshot.returnRateTypeSnapshot)}` : '';
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(rate)}%${suffix}`;
  }

  getLoanTerm(request: OpportunityRequest): string {
    const snapshot = request.loanTermsSnapshot;
    if (!snapshot?.termValueSnapshot) return this.unavailableLabel();
    return `${snapshot.termValueSnapshot} ${snapshot.termUnitSnapshot ? this.localizedTermValue(snapshot.termUnitSnapshot) : ''}`.trim();
  }

  getLoanRepaymentModel(request: OpportunityRequest): string {
    const value = request.loanTermsSnapshot?.repaymentModelSnapshot;
    return value ? this.localizedTermValue(value) : this.unavailableLabel();
  }

  getLoanExpectedReturn(request: OpportunityRequest): number {
    return request.loanTermsSnapshot?.expectedReturnAmount ?? 0;
  }

  getLoanExpectedTotalRepayment(request: OpportunityRequest): number {
    return request.loanTermsSnapshot?.expectedTotalRepaymentAmount
      ?? request.loanTermsSnapshot?.calculatedTotalAmount
      ?? request.calculatedTotalAmount
      ?? 0;
  }

  getProfitSharingContributionAmount(request: OpportunityRequest): number {
    return request.profitSharingTermsSnapshot?.contributionAmount
      ?? request.profitSharingTermsSnapshot?.requestedAmount
      ?? request.requestedAmount
      ?? 0;
  }

  getProfitSharePercentage(request: OpportunityRequest): string {
    const percentage = request.profitSharingTermsSnapshot?.profitSharePercentageSnapshot
      ?? request.profitSharingTermsSnapshot?.proposedSharePercentage
      ?? request.requestMetadata?.termsSnapshot?.ProfitSharePercentageSnapshot
      ?? request.requestMetadata?.termsSnapshot?.ProposedSharePercentage;
    if (percentage === null || percentage === undefined) return this.unavailableLabel();
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(Number(percentage))}%`;
  }

  getProfitSharingTerm(request: OpportunityRequest): string {
    const snapshot = request.profitSharingTermsSnapshot;
    const term = snapshot?.termValueSnapshot ?? snapshot?.expectedDurationMonthsSnapshot;
    if (!term) return this.unavailableLabel();
    return `${term} ${this.localizedTermValue(snapshot?.termUnitSnapshot || 'Months')}`.trim();
  }

  getProfitSharingExitTerms(request: OpportunityRequest): string {
    return request.profitSharingTermsSnapshot?.exitTermsSnapshot
      ?? request.requestMetadata?.termsSnapshot?.ExitTermsSnapshot
      ?? request.requestMetadata?.termsSnapshot?.ExitTerms
      ?? this.unavailableLabel();
  }

  getProfitSharingExpectedProfit(request: OpportunityRequest): number | null {
    return request.profitSharingTermsSnapshot?.expectedProfitAmount
      ?? request.requestMetadata?.termsSnapshot?.ExpectedProfitAmount
      ?? null;
  }

  getProfitSharingExpectedTotalPayout(request: OpportunityRequest): number | null {
    return request.profitSharingTermsSnapshot?.expectedTotalPayoutAmount
      ?? request.requestMetadata?.termsSnapshot?.ExpectedTotalPayoutAmount
      ?? request.calculatedTotalAmount
      ?? null;
  }

  getProfitSharingOpportunityTotalPayout(request: OpportunityRequest): number | null {
    return request.profitSharingTermsSnapshot?.opportunityTotalExpectedPayout
      ?? request.requestMetadata?.termsSnapshot?.OpportunityTotalExpectedPayout
      ?? null;
  }

  getProfitSharingContractPeriod(request: OpportunityRequest): string {
    const start = this.formatSnapshotDate(request.profitSharingTermsSnapshot?.contractStartDate ?? request.requestMetadata?.termsSnapshot?.ContractStartDate);
    const end = this.formatSnapshotDate(request.profitSharingTermsSnapshot?.contractEndDate ?? request.requestMetadata?.termsSnapshot?.ContractEndDate);
    const unavailable = this.unavailableLabel();
    if (start === unavailable && end === unavailable) return unavailable;
    if (start !== unavailable && end !== unavailable) return `${start} - ${end}`;
    return start !== unavailable
      ? this.t('requests.values.starts', 'Starts {date}').replace('{date}', start)
      : this.t('requests.values.ends', 'Ends {date}').replace('{date}', end);
  }

  private requestTypeOrder(request: OpportunityRequest): number {
    return request.requestType === OpportunityRequestKind.Participation ? 0 : 1;
  }

  formatOptionalMoney(request: OpportunityRequest, value: number | null): string {
    if (value === null || value === undefined) return this.unavailableLabel();
    return `${this.getRequestCurrency(request)} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value))}`;
  }

  private formatSnapshotDate(value: unknown): string {
    if (!value) return this.unavailableLabel();
    const date = new Date(String(value));
    const locale = this.languageService.language() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
    return Number.isNaN(date.getTime()) ? this.unavailableLabel() : new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }



  /**

   * Get total value from metadata

   */

  getTotalValue(request: OpportunityRequest): number {

    return request.calculatedTotalAmount || request.requestedAmount || request.requestMetadata?.totalValue || request.requestMetadata?.termsSnapshot?.TotalInvestmentAmount || request.requestMetadata?.termsSnapshot?.CalculatedTotalAmount || 0;

  }

  getRequestCurrency(request: OpportunityRequest): string {

    return request.currencySnapshot || request.requestMetadata?.termsSnapshot?.CurrencySnapshot || 'Credits';

  }



  /**

   * Get credibility score display

   */

  getCredibilityScore(request: OpportunityRequest): string {

    const score = request.investorCredibilityScore ?? 0;

    return `${Math.round(score)}/100`;

  }



  /**

   * Get founder score display

   */

  getFounderScore(request: OpportunityRequest): string {

    const score = request.founderCredibilityScore ?? 0;

    return `${Math.round(score)}/100`;

  }



  /**

   * Get trust level display

   */

  getTrustLevel(request: OpportunityRequest): string {

    // Use appropriate trust level based on request direction

    if (request.direction === 'incoming') {

      return request.investorTrustLevel ?? 'Basic';

    } else {

      return request.founderTrustLevel ?? 'Basic';

    }

  }



  /**

   * Get status display with friendly labels

   */

  getStatusDisplay(request: OpportunityRequest): string {

    const status = request.status;

    switch (status) {

      case 'Pending':
      case 'Requested':
        return request.requestType === OpportunityRequestKind.Conversation
          ? this.t('requests.status.waitingFounderResponse', 'Waiting for founder response')
          : this.t('requests.status.participationPending', 'Participation pending');

      case 'Negotiating':

        return this.t('requests.status.negotiationInProgress', 'Negotiation in progress');

      case 'Partner':

        return this.t('requests.status.projectParticipant', 'Project Participant');

      case 'Accepted':

        return request.requestType === OpportunityRequestKind.Conversation
          ? this.t('requests.status.chatAccepted', 'Chat accepted')
          : this.t('requests.status.participationApproved', 'Participation approved');

      case 'Declined':

      case 'Rejected':

        return this.t('requests.status.declined', 'Declined');

      case 'Cancelled':

      case 'Withdrawn':

        return this.t('requests.status.withdrawn', 'Withdrawn');

      default:
        return this.t('requests.status.closed', 'Closed');

    }

  }

  getDirectionCopy(request: OpportunityRequest): string {
    if (request.type === 'conversation') {
      if (request.direction === 'incoming') {
        return this.t('requests.direction.incomingConversation', 'This Investor wants to start a conversation about your Opportunity.');
      }
      return this.t('requests.direction.outgoingConversation', 'Conversation request sent. Waiting for the Founder to respond.');
    }

    if (request.direction === 'incoming') {
      return this.t('requests.direction.incomingParticipation', '{model} participation request received. Review the final submitted terms.')
        .replace('{model}', this.getInvestmentModelDisplay(request));
    }
    return this.t('requests.direction.outgoingParticipation', '{model} participation request sent. Waiting for Founder review.')
      .replace('{model}', this.getInvestmentModelDisplay(request));
  }

  getPrimaryActionLabel(request: OpportunityRequest): string {
    if (request.type === 'conversation') {
      return request.direction === 'incoming'
        ? this.t('requests.actions.acceptChat', 'Accept Chat')
        : this.t('requests.actions.withdraw', 'Withdraw');
    }
    return request.direction === 'incoming'
      ? this.t('requests.actions.approveParticipation', 'Approve {model}').replace('{model}', this.getInvestmentModelDisplay(request))
      : this.t('requests.actions.withdraw', 'Withdraw');
  }

  canShowWithdraw(request: OpportunityRequest): boolean {
    if (request.type === 'conversation') {
      return request.direction === 'outgoing' && request.status === 'Pending' && request.canWithdraw !== false;
    }
    return request.direction === 'outgoing' && request.status === 'Pending';
  }

  canShowAcceptReject(request: OpportunityRequest): boolean {
    if (request.type === 'conversation') {
      return request.direction === 'incoming' && request.status === 'Pending' && request.canAccept !== false && request.canReject !== false;
    }
    return request.direction === 'incoming' && request.status === 'Pending';
  }

  isPendingRequest(request: OpportunityRequest): boolean {
    return request.type === 'conversation'
      ? request.status === 'Pending'
      : request.status === 'Pending';
  }

  getCounterpartyName(request: OpportunityRequest): string {
    if (request.direction === 'incoming') {
      return request.senderName || request.counterpartName || 'Investor';
    }
    return request.receiverName || request.counterpartName || 'Founder';
  }



  /**

   * Get exact date/time display

   */

  getExactDateTime(date: Date): string {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return this.unavailableLabel();
    const locale = this.languageService.language() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);

  }

  initials(name?: string): string {
    return (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '—';
  }

  isConversationRequest(request: OpportunityRequest): boolean {
    return request.requestType === OpportunityRequestKind.Conversation;
  }

  statusTone(request: OpportunityRequest): 'pending' | 'success' | 'danger' | 'neutral' {
    if (request.status === 'Accepted' || request.status === 'Partner') return 'success';
    if (request.status === 'Declined' || request.status === 'Rejected' || request.status === 'Withdrawn' || request.status === 'Cancelled') return 'danger';
    if (this.isPendingRequest(request) || request.status === 'Negotiating') return 'pending';
    return 'neutral';
  }

  private unavailableLabel(): string {
    return this.t('requests.values.unavailable', 'Unavailable');
  }

  private localizedTermValue(value: string): string {
    const key = value.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const known: Record<string, string> = {
      month: 'month', months: 'months', year: 'year', years: 'years',
      monthly: 'monthly', quarterly: 'quarterly', annually: 'annually', bullet: 'bullet',
      fixed: 'fixed', variable: 'variable', simple: 'simple', compound: 'compound'
    };
    return known[key] ? this.t(`requests.values.${known[key]}`, value) : value;
  }



  /**

   * Get progress percentage for timeline

   */

  getProgressPercentage(request: OpportunityRequest): number {

    const status = request.status;

    switch (status) {

      case 'Pending':

        return 33;

      case 'Negotiating':

        return 66;

      case 'Partner':

      case 'Accepted':

        return 100;

      case 'Declined':

      case 'Rejected':

        return 100;

      default:

        return 33;

    }

  }



  /**

   * Get progress label for timeline

   */

  getProgressLabel(request: OpportunityRequest): string {

    const status = request.status;

    switch (status) {

      case 'Pending':

        return this.t('requests.progress.inReview', 'In Review');

      case 'Negotiating':

        return this.t('requests.progress.negotiating', 'Negotiating');

      case 'Partner':

      case 'Accepted':

        return this.t('requests.progress.completed', 'Completed');

      case 'Declined':

      case 'Rejected':

        return this.t('requests.progress.ended', 'Ended');

      default:

        return this.t('requests.progress.inReview', 'In Review');

    }

  }

}

