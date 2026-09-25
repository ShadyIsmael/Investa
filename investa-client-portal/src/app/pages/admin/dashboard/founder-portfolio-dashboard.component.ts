import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { get } from 'lodash-es';
import {
  FounderDashboard,
  FounderDashboardMoney,
  FounderDashboardOpportunity,
  FounderDashboardTimeSeriesPoint
} from '../../../models/founder-dashboard.model';
import { FounderDashboardService } from '../../../services/founder-dashboard.service';
import { CurrencyService } from '../../../services/currency.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-founder-portfolio-dashboard',
  templateUrl: './founder-portfolio-dashboard.component.html',
  styleUrls: ['./founder-portfolio-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class FounderPortfolioDashboardComponent {
  private readonly dashboardService = inject(FounderDashboardService);
  private readonly currencyService = inject(CurrencyService);
  private readonly languageService = inject(LanguageService);

  readonly dashboard = signal<FounderDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly direction = computed(() => this.languageService.direction());
  readonly language = computed(() => this.languageService.language());
  readonly metrics = computed(() => this.dashboard()?.metrics);
  readonly projects = computed(() => this.dashboard()?.projects ?? []);
  readonly fundingSeries = computed(() => this.dashboard()?.timeSeries.fundingApprovals ?? []);
  readonly receivedSeries = computed(() => this.dashboard()?.timeSeries.receivedAmounts ?? []);
  readonly maxFundingPoint = computed(() => this.chartMaximum(this.fundingSeries()));
  readonly maxReceivedPoint = computed(() => this.chartMaximum(this.receivedSeries()));
  readonly hasPendingActions = computed(() => (this.metrics()?.pendingActions ?? 0) > 0);
  readonly lastUpdated = computed(() => this.dashboard()?.evaluatedAtUtc ?? null);

  constructor() {
    this.currencyService.ensureLoaded();
    void this.load();
  }

  t(path: string, fallback: string): string {
    return get(this.languageService.dictionary(), path, fallback);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      this.dashboard.set(await this.dashboardService.getDashboard());
    } catch {
      this.dashboard.set(null);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  money(value: FounderDashboardMoney | null | undefined): string {
    if (!value?.available || value.value === null || value.value === undefined) {
      return this.t('dashboard.unavailable', 'Unavailable');
    }
    return this.currencyService.format(value.value, this.dashboard()?.displayCurrency);
  }

  pointMoney(point: FounderDashboardTimeSeriesPoint): string {
    return point.unavailable
      ? this.t('dashboard.unavailable', 'Unavailable')
      : this.currencyService.format(point.value, this.dashboard()?.displayCurrency);
  }

  progress(value: number | null | undefined): number | null {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return null;
    return Math.max(0, Math.min(100, Number(value)));
  }

  rawProgress(value: number | null | undefined): string {
    return value === null || value === undefined
      ? this.t('dashboard.unavailable', 'Unavailable')
      : `${this.number(value)}%`;
  }

  number(value: number | null | undefined): string {
    return new Intl.NumberFormat(this.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 1 })
      .format(Number(value ?? 0));
  }

  date(value: string): string {
    return new Intl.DateTimeFormat(this.language() === 'ar' ? 'ar-EG' : 'en-EG', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(value));
  }

  fullDate(value: string | null): string {
    if (!value) return this.t('dashboard.founder.updatedUnknown', 'Last updated unavailable');
    return new Intl.DateTimeFormat(this.language() === 'ar' ? 'ar-EG' : 'en-EG', {
      day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC'
    }).format(new Date(value));
  }

  status(value: number | string): string {
    const key = String(value).toLowerCase();
    return this.t(`dashboard.founder.status.${key}`, key);
  }

  opportunityStatus(value: number | string): string {
    const key = String(value).toLowerCase();
    return this.t(`dashboard.founder.opportunityStatus.${key}`, key);
  }

  statusTone(value: number | string): string {
    const key = String(value).toLowerCase();
    if (['active', 'published', 'funding', '6', '7', '8'].includes(key)) return 'positive';
    if (['completed', '9'].includes(key)) return 'complete';
    if (['paused', 'archived', '10'].includes(key)) return 'muted';
    return 'neutral';
  }

  barHeight(point: FounderDashboardTimeSeriesPoint, max: number): number {
    if (point.unavailable || max <= 0) return 0;
    return point.value > 0 ? Math.max(5, Math.min(100, point.value / max * 100)) : 0;
  }

  canOpenRoom(opportunity: FounderDashboardOpportunity): boolean {
    const status = String(opportunity.status).toLowerCase();
    return !['draft', '1', 'archived', '10'].includes(status);
  }

  private chartMaximum(points: FounderDashboardTimeSeriesPoint[]): number {
    return Math.max(1, ...points.filter(point => !point.unavailable).map(point => Math.max(0, point.value)));
  }
}
