import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { RequestsService } from '../../../services/requests.service';
import { InvestmentRequest } from '../../../models/request.model';

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
}
