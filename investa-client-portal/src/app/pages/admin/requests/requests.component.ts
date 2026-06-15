import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { RequestsService } from '../../../services/requests.service';
import { FileStoreService } from '../../../services/file-store.service';
import { InvestmentRequest, InvestmentRequestType } from '../../../models/request.model';

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
  private fileStoreService = inject(FileStoreService);

  tab = signal<'incoming' | 'outgoing'>('incoming');

  incoming = this.requestsService.incoming;
  outgoing = this.requestsService.outgoing;

  async refresh() {
    await this.requestsService.refreshRequests();
  }

  switchTab(tab: 'incoming' | 'outgoing') {
    this.tab.set(tab);
  }

  accept(request: InvestmentRequest) {
    this.requestsService.acceptRequest(request);
  }

  decline(request: InvestmentRequest) {
    this.requestsService.declineRequest(request);
  }

  withdraw(request: InvestmentRequest) {
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
  getRequestTypeDisplay(request: InvestmentRequest): string {
    if (!request.requestType) return 'Investment Request';

    switch (request.requestType) {
      case InvestmentRequestType.ContactFounder:
        return 'Contact Founder';
      case InvestmentRequestType.InvestmentInterest:
        return 'Investment Interest';
      default:
        return 'Investment Request';
    }
  }

  /**
   * Get badge class for request type
   */
  getRequestTypeBadgeClass(request: InvestmentRequest): string {
    if (!request.requestType) return 'bg-slate-500/15 text-slate-300 border-slate-500/30';

    switch (request.requestType) {
      case InvestmentRequestType.ContactFounder:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case InvestmentRequestType.InvestmentInterest:
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  }

  /**
   * Check if request has investment interest metadata
   */
  hasInvestmentMetadata(request: InvestmentRequest): boolean {
    return request.requestType === InvestmentRequestType.InvestmentInterest && request.requestMetadata;
  }

  /**
   * Get shares requested from metadata
   */
  getSharesRequested(request: InvestmentRequest): number {
    return request.requestMetadata?.sharesRequested || 0;
  }

  /**
   * Get share price from metadata
   */
  getSharePrice(request: InvestmentRequest): number {
    return request.requestMetadata?.sharePrice || 0;
  }

  /**
   * Get total value from metadata
   */
  getTotalValue(request: InvestmentRequest): number {
    return request.requestMetadata?.totalValue || 0;
  }
}
