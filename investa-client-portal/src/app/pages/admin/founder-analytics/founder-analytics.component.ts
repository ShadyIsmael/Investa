import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../../services/analytics.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

interface FounderSummary {
  totalOpportunities: number;
  publishedOpportunities: number;
  totalViews: number;
  uniqueViews: number;
  learnMoreOpens: number;
  uniqueLearnMoreOpens: number;
  requestsReceived: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
  activeConversations: number;
}

interface InvestmentPerformance {
  investmentId: number;
  investmentName: string;
  coverImage: string | null;
  investmentType: string;
  status: string;
  createdDate: string;
  totalViews: number;
  uniqueViews: number;
  learnMoreOpens: number;
  uniqueLearnMoreOpens: number;
  requestsReceived: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeChats: number;
}

interface TopPerformingOpportunity {
  investmentId: number;
  investmentName: string;
  coverImage: string | null;
  views: number;
  uniqueViews: number;
  requests: number;
  approvalRate: number;
  learnMoreConversion: number;
}

interface LowPerformingOpportunity {
  investmentId: number;
  investmentName: string;
  views: number;
  uniqueViews: number;
  learnMore: number;
  uniqueLearnMore: number;
  requests: number;
}

interface ConversionFunnel {
  views: number;
  uniqueViews: number;
  learnMore: number;
  uniqueLearnMore: number;
  requests: number;
  approvals: number;
  chats: number;
}

@Component({
  selector: 'app-founder-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './founder-analytics.component.html',
  styleUrls: ['./founder-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FounderAnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private languageService = inject(LanguageService);

  // Time filter options
  readonly timeFilters = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'All Time', value: null }
  ];

  selectedTimeFilter = signal<number | null>(30);
  currentLang = signal<'en' | 'ar'>('en');

  // Data signals
  summary = signal<FounderSummary | null>(null);
  conversionFunnel = signal<ConversionFunnel | null>(null);
  topPerforming = signal<TopPerformingOpportunity[]>([]);
  lowPerforming = signal<LowPerformingOpportunity[]>([]);
  opportunities = signal<InvestmentPerformance[]>([]);

  // Loading states
  loading = signal(true);
  loadingSummary = signal(true);
  loadingFunnel = signal(true);
  loadingTopPerforming = signal(true);
  loadingLowPerforming = signal(true);

  // Insights
  insights = signal<string[]>([]);

  ngOnInit(): void {
    this.currentLang.set(this.languageService.getCurrentLanguage());
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.loading.set(true);
    this.loadingSummary.set(true);
    this.loadingFunnel.set(true);
    this.loadingTopPerforming.set(true);
    this.loadingLowPerforming.set(true);

    const startDate = this.calculateStartDate(this.selectedTimeFilter());
    const endDate = new Date().toISOString();

    // Load all analytics data in parallel
    Promise.all([
      this.analyticsService.getFounderSummary(startDate, endDate).toPromise(),
      this.analyticsService.getConversionFunnel(startDate, endDate).toPromise(),
      this.analyticsService.getTopPerformingOpportunities(5, startDate, endDate).toPromise(),
      this.analyticsService.getLowPerformingOpportunities(5, startDate, endDate).toPromise(),
      this.analyticsService.getOpportunitiesPerformance(startDate, endDate).toPromise()
    ]).then(([summary, funnel, top, low, opportunities]) => {
      this.summary.set(summary.data);
      this.conversionFunnel.set(funnel.data);
      this.topPerforming.set(top.data);
      this.lowPerforming.set(low.data);
      this.opportunities.set(opportunities.data);
      
      this.generateInsights();
      
      this.loadingSummary.set(false);
      this.loadingFunnel.set(false);
      this.loadingTopPerforming.set(false);
      this.loadingLowPerforming.set(false);
      this.loading.set(false);
    }).catch(error => {
      console.error('Error loading analytics:', error);
      this.loading.set(false);
    });
  }

  private calculateStartDate(days: number | null): string | undefined {
    if (!days) return undefined;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }

  onTimeFilterChange(days: number | null): void {
    this.selectedTimeFilter.set(days);
    this.loadAnalytics();
  }

  private generateInsights(): void {
    const summary = this.summary();
    const top = this.topPerforming();
    const low = this.lowPerforming();
    const insights: string[] = [];

    if (summary) {
      if (summary.approvalRate >= 70) {
        insights.push(`✅ Your approval rate is ${summary.approvalRate.toFixed(1)}%, which is excellent.`);
      } else if (summary.approvalRate < 30) {
        insights.push(`⚠️ Your approval rate is ${summary.approvalRate.toFixed(1)}%. Consider reviewing your investment terms.`);
      }

      if (summary.totalViews > 0 && summary.requestsReceived === 0) {
        insights.push(`💡 You have ${summary.totalViews} views but no requests. Consider improving your pitch and investment details.`);
      }
    }

    if (top && top.length > 0) {
      const best = top[0];
      insights.push(`🏆 "${best.investmentName}" is your top performing opportunity with ${best.requests} requests.`);
    }

    if (low && low.length > 0) {
      const worst = low[0];
      if (worst.views < 50 && worst.requests === 0) {
        insights.push(`📉 "${worst.investmentName}" needs attention. Consider updating content or promoting it.`);
      }
    }

    this.insights.set(insights.slice(0, 3)); // Show top 3 insights
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(this.currentLang(), { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
