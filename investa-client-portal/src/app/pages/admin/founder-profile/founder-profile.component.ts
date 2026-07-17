import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FileStoreService } from '../../../services/file-store.service';
import { LanguageService } from '../../../services/language.service';
import { Opportunity, OpportunityService } from '../../../services/opportunity.service';
import { ProfileService, PublicProfile } from '../../../services/profile.service';
import { ReportReasonCode, ReportService } from '../../../services/report.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-founder-profile',
  templateUrl: './founder-profile.component.html',
  styleUrls: ['./founder-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe]
})
export class FounderProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  private readonly opportunityService = inject(OpportunityService);
  private readonly fileStoreService = inject(FileStoreService);
  private readonly reportService = inject(ReportService);
  readonly languageService = inject(LanguageService);

  readonly founderId = signal('');
  readonly profile = signal<PublicProfile | null>(null);
  readonly opportunities = signal<Opportunity[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly avatarFailed = signal(false);
  readonly reportModalOpen = signal(false);
  readonly reportSubmitting = signal(false);
  readonly reportSuccess = signal(false);
  readonly reportError = signal<string | null>(null);
  readonly reportReason = signal<ReportReasonCode>('Spam');
  readonly reportDescription = signal('');
  readonly reportReasons: ReportReasonCode[] = ['Spam', 'Abuse', 'FraudConcern', 'InappropriateContent', 'Other'];

  readonly isOwner = computed(() => this.profileService.profile()?.userId === this.founderId());
  readonly founderOpportunities = computed(() => this.opportunities().filter(item => this.opportunityFounderId(item) === this.founderId()));
  readonly stats = computed(() => {
    const projects = this.founderOpportunities();
    return {
      total: projects.length,
      active: projects.filter(item => this.normalizedStatus(item.status) === 'active').length,
      funded: projects.filter(item => this.normalizedStatus(item.status) === 'funded').length
    };
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const id = (this.route.snapshot.paramMap.get('id') ?? '').trim();
    this.founderId.set(id);
    if (!id || id === 'undefined' || id === 'null') {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    try {
      const [profile, opportunities] = await Promise.all([
        this.profileService.getPublicProfile(id),
        this.opportunityService.getPublicOpportunities()
      ]);
      this.profile.set(profile);
      this.opportunities.set(opportunities);
      this.error.set(!profile);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  get displayName(): string {
    const profile = this.profile();
    return this.clean(profile?.displayName) || this.clean(profile?.fullName) ||
      [profile?.firstName, profile?.lastName].map(value => this.clean(value)).filter(Boolean).join(' ') ||
      this.t('userProfile.member');
  }

  get avatarInitials(): string {
    return this.displayName.split(/\s+/u).filter(Boolean).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() || 'U';
  }

  avatarUrl(value?: string | null): string {
    if (!value || this.avatarFailed()) return '';
    return value.startsWith('http') ? value : this.fileStoreService.getPublicUrl(value);
  }

  opportunityImage(item: Opportunity): string {
    const value = this.clean(item.coverImageUrl);
    return value ? (value.startsWith('http') ? value : this.fileStoreService.getPublicUrl(value)) : '';
  }

  location(profile: PublicProfile): string {
    return this.clean(profile.location) || [profile.city, profile.country].map(value => this.clean(value)).filter(Boolean).join(', ');
  }

  roleLabel(value?: string | null): string {
    return this.enumLabel('roles', value, 'member');
  }

  verificationLabel(value?: string | null): string {
    return this.enumLabel('verification', value, 'none');
  }

  accountLabel(value?: string | null): string {
    return this.enumLabel('account', value, 'inactive');
  }

  opportunityStatusLabel(value?: string | number | null): string {
    return this.enumLabel('opportunityStatus', value, 'unknown');
  }

  westernNumber(value: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
  }

  westernDate(value?: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date);
  }

  openUserReport(): void {
    if (!this.profile()?.userId || this.isOwner()) return;
    this.reportReason.set('Spam');
    this.reportDescription.set('');
    this.reportError.set(null);
    this.reportSuccess.set(false);
    this.reportModalOpen.set(true);
  }

  closeReportModal(): void {
    if (this.reportSubmitting()) return;
    this.reportModalOpen.set(false);
    this.reportError.set(null);
    this.reportSuccess.set(false);
  }

  async submitUserReport(): Promise<void> {
    const targetId = this.profile()?.userId;
    if (!targetId || this.reportSubmitting()) return;
    try {
      this.reportSubmitting.set(true);
      this.reportError.set(null);
      await this.reportService.createReport({
        targetType: 'User', targetId, reasonCode: this.reportReason(), description: this.reportDescription().trim() || null
      });
      this.reportSuccess.set(true);
    } catch (error: unknown) {
      this.reportError.set(this.reportErrorMessage(error));
    } finally {
      this.reportSubmitting.set(false);
    }
  }

  reportReasonLabel(reason: ReportReasonCode): string {
    return this.t(`reports.reasons.${reason}`);
  }

  private opportunityFounderId(item: Opportunity): string {
    return String(item.founderId ?? item.founder?.userId ?? item.founder?.id ?? '');
  }

  private normalizedStatus(value: string | number | null | undefined): string {
    return String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/gu, '');
  }

  private enumLabel(group: string, value: string | number | null | undefined, fallback: string): string {
    const normalized = this.normalizedStatus(value) || fallback;
    const key = `userProfile.enums.${group}.${normalized}`;
    const translated = this.t(key);
    return translated === key ? this.t(`userProfile.enums.${group}.${fallback}`) : translated;
  }

  private clean(value?: string | null): string {
    const result = value?.trim() ?? '';
    return result === 'null' || result === 'undefined' ? '' : result;
  }

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  private reportErrorMessage(error: unknown): string {
    const record = typeof error === 'object' && error !== null ? error as Record<string, unknown> : null;
    const nested = record && typeof record['error'] === 'object' && record['error'] !== null ? record['error'] as Record<string, unknown> : null;
    const raw = String(nested?.['message'] ?? record?.['message'] ?? '').toLowerCase();
    if (raw.includes('duplicate') || raw.includes('pending')) return this.t('reports.errors.duplicatePending');
    if (raw.includes('invalid') || raw.includes('target')) return this.t('reports.errors.invalidTarget');
    if (raw.includes('self')) return this.t('reports.errors.selfReport');
    return this.t('reports.errors.generic');
  }
}
