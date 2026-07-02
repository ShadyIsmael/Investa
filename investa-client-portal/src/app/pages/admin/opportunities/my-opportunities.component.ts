import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Opportunity, OpportunityService } from '../../../services/opportunity.service';
import { OpportunityStatusBadgeComponent } from '../../../shared/components/opportunity-status-badge/opportunity-status-badge.component';
import { NotificationService } from '../../../services/notification.service';
import { money, opportunityDescription, opportunityTitle } from './opportunity-utils';
import { RoleContextService } from '../../../services/role-context.service';

@Component({
  standalone: true,
  selector: 'app-my-opportunities',
  imports: [CommonModule, RouterLink, OpportunityStatusBadgeComponent],
  templateUrl: './my-opportunities.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOpportunitiesComponent {
  private service = inject(OpportunityService);
  private notifications = inject(NotificationService);
  roleContext = inject(RoleContextService);

  opportunities = signal<Opportunity[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  submittingId = signal<string | number | null>(null);

  title = opportunityTitle;
  description = opportunityDescription;
  money = money;

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.opportunities.set(await this.service.getMyOpportunities());
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load your opportunities.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitForReview(opportunity: Opportunity): Promise<void> {
    try {
      this.submittingId.set(opportunity.id);
      await this.service.submitForReview(opportunity.id);
      this.notifications.showToast({ title: 'Submitted', message: 'Opportunity submitted for review.', type: 'success' });
      await this.load();
    } catch (error: any) {
      this.notifications.showToast({ title: 'Submit failed', message: error?.message || 'Backend rejected the request.', type: 'error' });
    } finally {
      this.submittingId.set(null);
    }
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
  }
}
