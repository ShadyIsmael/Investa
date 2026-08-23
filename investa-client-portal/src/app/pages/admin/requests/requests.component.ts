import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';

import { RequestsService } from '../../../services/requests.service';

import { FileStoreService } from '../../../services/file-store.service';

import { OpportunityRequest, OpportunityRequestKind } from '../../../models/request.model';
import { DirectOfferInboxComponent } from '../../../components/direct-offer-inbox/direct-offer-inbox.component';



@Component({

  standalone: true,

  selector: 'app-requests',

  templateUrl: './requests.component.html',

  styleUrls: ['./requests.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CommonModule, TranslatePipe, DirectOfferInboxComponent]

})

export class RequestsComponent {

  private requestsService = inject(RequestsService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private fileStoreService = inject(FileStoreService);



  tab = signal<'incoming' | 'outgoing'>('incoming');



  incoming = this.requestsService.incoming;

  outgoing = this.requestsService.outgoing;

  incomingCount = computed(() => this.incoming().length);
  outgoingCount = computed(() => this.outgoing().length);
  currentConversationCount = computed(() => this.currentTabRequests().filter(request => request.requestType === OpportunityRequestKind.Conversation).length);



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
      return b.createdAt.getTime() - a.createdAt.getTime();
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

  getEmptyTitle(): string {
    if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
      return this.t('requests.empty.noMatch', 'No requests match the selected filters.');
    }

    return this.tab() === 'incoming'
      ? this.t('requests.noIncoming', 'No incoming requests.')
      : this.t('requests.noOutgoing', 'No outgoing requests.');
  }

  getEmptySubtitle(): string {
    if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
      return this.t('requests.empty.tryAdjustFilters', 'Try adjusting your filter criteria.');
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

  getStatusDisplay(request: OpportunityRequest): string {

    const status = request.status;

    switch (status) {

      case 'Pending':
      case 'Requested':
        return this.t('requests.status.waitingFounderResponse', 'Waiting for founder response');

      case 'Negotiating':

        return this.t('requests.status.negotiationInProgress', 'Negotiation in progress');

      case 'Partner':

        return this.t('requests.status.projectParticipant', 'Project Participant');

      case 'Accepted':
        return this.t('requests.status.chatAccepted', 'Chat accepted');

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
    if (request.direction === 'incoming') {
      return this.t('requests.direction.incomingConversation', 'This Investor wants to start a conversation about your Opportunity.');
    }
    return this.t('requests.direction.outgoingConversation', 'Conversation request sent. Waiting for the Founder to respond.');
  }

  getPrimaryActionLabel(request: OpportunityRequest): string {
    return request.direction === 'incoming'
      ? this.t('requests.actions.acceptChat', 'Accept Chat')
      : this.t('requests.actions.withdraw', 'Withdraw');
  }

  canShowWithdraw(request: OpportunityRequest): boolean {
    return request.direction === 'outgoing' && request.status === 'Pending' && request.canWithdraw !== false;
  }

  canShowAcceptReject(request: OpportunityRequest): boolean {
    return request.direction === 'incoming' && request.status === 'Pending' && request.canAccept !== false && request.canReject !== false;
  }

  isPendingRequest(request: OpportunityRequest): boolean {
    return request.status === 'Pending';
  }

  getCounterpartyName(request: OpportunityRequest): string {
    if (request.direction === 'incoming') {
      return request.senderName || request.counterpartName || 'Investor';
    }
    return request.receiverName || request.counterpartName || 'Founder';
  }

  getCounterpartyUserId(request: OpportunityRequest): string | number | null {
    const id = request.direction === 'incoming' ? request.investorId : request.founderId;
    if (id === null || id === undefined) return null;
    const normalized = String(id).trim();
    return normalized && normalized !== 'undefined' && normalized !== 'null' ? id : null;
  }

  canOpenCounterpartyProfile(request: OpportunityRequest): boolean {
    return this.getCounterpartyUserId(request) !== null;
  }

  openCounterpartyProfile(request: OpportunityRequest): void {
    const userId = this.getCounterpartyUserId(request);
    if (userId === null) return;
    void this.router.navigate(['/admin/founders', String(userId)]);
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

