import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService, PublicProfile } from '../../../services/profile.service';
import { Opportunity, OpportunityService } from '../../../services/opportunity.service';
import { FileStoreService } from '../../../services/file-store.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

type FounderOpportunity = Opportunity & Record<string, any>;

@Component({
  standalone: true,
  selector: 'app-founder-profile',
  templateUrl: './founder-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class FounderProfileComponent {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private opportunityService = inject(OpportunityService);
  private fileStoreService = inject(FileStoreService);

  founderId = signal<string>('');
  profile = signal<PublicProfile | null>(null);
  opportunities = signal<FounderOpportunity[]>([]);
  loading = signal(true);
  error = signal(false);

  /** Active investments by this founder */
  founderInvestments = computed<FounderOpportunity[]>(() => {
    const id = this.founderId();
    if (!id) return [];
    return this.opportunities().filter(inv => String(inv.founderId || inv.founder?.id || inv.founder?.userId || '') === id);
  });

  founderStats = computed(() => {
    const investments = this.founderInvestments();
    const totalRaised = investments.reduce((sum, investment) => {
      const target = Number(investment.fundingTarget ?? 0);
      const progress = Number(investment.fundingProgressPercent ?? 0);
      return sum + (target > 0 ? target * (progress / 100) : 0);
    }, 0);
    const activeProjects = investments.filter(investment => String(investment.status || '').toLowerCase().includes('active')).length;
    const fundedProjects = investments.filter(investment => String(investment.status || '').toLowerCase().includes('funded')).length;

    return {
      totalProjects: investments.length,
      activeProjects,
      fundedProjects,
      totalRaised
    };
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.founderId.set(id);
    if (!id) { this.loading.set(false); this.error.set(true); return; }

    try {
      this.opportunities.set(await this.opportunityService.getPublicOpportunities());
      const p = await this.profileService.getPublicProfile(id);
      this.profile.set(p);
      if (!p) this.error.set(true);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  resolveUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return this.fileStoreService.getPublicUrl(url);
  }

  get displayName(): string {
    const p = this.profile();
    return p?.fullName || [p?.firstName, p?.lastName].filter(Boolean).join(' ') || '—';
  }

  get avatarInitials(): string {
    const p = this.profile();
    const fullName = this.displayName;
    const words = fullName.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 0 || fullName === '—') {
      return 'F';
    }

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }

  getInvestmentImage(inv: FounderOpportunity): string {
    const cover = inv.coverImageUrl;
    if (cover) return this.resolveUrl(cover);
    return '';
  }

  fundingPercent(inv: FounderOpportunity): number {
    const pct = Number(inv.fundingProgressPercent ?? 0);
    return Number.isFinite(pct) ? Math.min(Math.max(pct, 0), 100) : 0;
  }
}
