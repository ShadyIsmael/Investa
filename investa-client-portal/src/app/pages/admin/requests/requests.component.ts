import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../pipes/translate.pipe';

import { RequestsService } from '../../../services/requests.service';

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

  private fileStoreService = inject(FileStoreService);



  tab = signal<'incoming' | 'outgoing'>('incoming');



  incoming = this.requestsService.incoming;

  outgoing = this.requestsService.outgoing;



  // Filter state

  statusFilter = signal<string>('pending');

  typeFilter = signal<string>('all');

  dateFilter = signal<string>('all');



  // Pagination state

  currentPage = signal<number>(1);

  pageSize = 6;



  constructor() {

  }



  // Computed filtered requests

  filteredRequests = computed(() => {

    const requests = this.tab() === 'incoming' ? this.incoming() : this.outgoing();



    return requests.filter(request => {

      // Status filter

      if (this.statusFilter() !== 'all') {

        if (this.statusFilter() === 'pending' && !this.isPendingRequest(request)) return false;

        if (this.statusFilter() === 'accepted' && request.status !== 'Accepted' && request.status !== 'Partner') return false;

        if (this.statusFilter() === 'rejected' && request.status !== 'Declined' && request.status !== 'Rejected') return false;

      }



      // Type filter

      if (this.typeFilter() !== 'all') {

        if (this.typeFilter() === 'contact' && request.requestType !== OpportunityRequestKind.Conversation) return false;

        if (this.typeFilter() === 'investment' && request.requestType !== OpportunityRequestKind.Participation) return false;

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

    await this.requestsService.refreshRequests();

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

    if (!request.requestType) return 'Participation Request';



    switch (request.requestType) {

      case OpportunityRequestKind.Conversation:

        return 'Chat Request';

      case OpportunityRequestKind.Participation:

        return 'Participation Interest';

      default:

        return 'Participation Request';

    }

  }



  /**

   * Get badge class for request type

   */

  getRequestTypeBadgeClass(request: OpportunityRequest): string {

    if (!request.requestType) return 'bg-slate-500/15 text-slate-300 border-slate-500/30';



    switch (request.requestType) {

      case OpportunityRequestKind.Conversation:

        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';

      case OpportunityRequestKind.Participation:

        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';

      default:

        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';

    }

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

    return request.requestMetadata?.sharesRequested || 0;

  }



  /**

   * Get share price from metadata

   */

  getSharePrice(request: OpportunityRequest): number {

    return request.requestMetadata?.sharePrice || 0;

  }



  /**

   * Get total value from metadata

   */

  getTotalValue(request: OpportunityRequest): number {

    return request.requestMetadata?.totalValue || 0;

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

        return 'Waiting for founder approval';

      case 'Negotiating':

        return 'Negotiation in progress';

      case 'Partner':

        return 'Project Participant';

      case 'Accepted':

        return 'Founder accepted';

      case 'Declined':

      case 'Rejected':

        return 'Declined';

      case 'Cancelled':

      case 'Withdrawn':

        return 'Withdrawn';

      default:

        return status;

    }

  }

  getDirectionCopy(request: OpportunityRequest): string {
    if (request.type === 'conversation') {
      if (request.direction === 'incoming') {
        return 'This Investor wants to start a conversation about your Opportunity.';
      }
      return 'Conversation request sent. Waiting for the Founder to respond.';
    }

    if (request.direction === 'incoming') {
      return 'Participation request received. Review whether this investor can join.';
    }
    return 'Participation request sent. Waiting for founder review.';
  }

  getPrimaryActionLabel(request: OpportunityRequest): string {
    if (request.type === 'conversation') {
      return request.direction === 'incoming' ? 'Accept Chat' : 'Withdraw';
    }
    return request.direction === 'incoming' ? 'Approve Participation' : 'Withdraw';
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



  /**

   * Get exact date/time display

   */

  getExactDateTime(date: Date): string {

    const d = new Date(date);

    const day = d.getDate();

    const month = d.toLocaleString('en-US', { month: 'short' });

    const year = d.getFullYear();

    const hours = d.getHours();

    const minutes = d.getMinutes().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    const displayHours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;

  }



  /**

   * Get project type display

   */

  getProjectType(request: OpportunityRequest): string {

    // For now, return a default value - this can be extended when backend provides project type

    return 'Startup';

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

        return 'In Review';

      case 'Negotiating':

        return 'Negotiating';

      case 'Partner':

      case 'Accepted':

        return 'Completed';

      case 'Declined':

      case 'Rejected':

        return 'Ended';

      default:

        return 'In Review';

    }

  }

}

