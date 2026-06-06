import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService, PublicProfile } from '../../../services/profile.service';
import { InvestmentService } from '../../../services/investment.service';
import { FileStoreService } from '../../../services/file-store.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Investment, InvestmentStatus } from '../../../models/investment.model';

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
  private investmentService = inject(InvestmentService);
  private fileStoreService = inject(FileStoreService);

  founderId = signal<string>('');
  profile = signal<PublicProfile | null>(null);
  loading = signal(true);
  error = signal(false);

  /** Active investments by this founder */
  founderInvestments = computed<Investment[]>(() => {
    const id = this.founderId();
    if (!id) return [];
    return this.investmentService.investments().filter(inv => inv.founderId === id);
  });

  founderStats = computed(() => {
    const investments = this.founderInvestments();
    const totalRaised = investments.reduce((sum, investment) => sum + (investment.currentFunding ?? 0), 0);
    const activeProjects = investments.filter(investment => investment.status === InvestmentStatus.Active).length;
    const fundedProjects = investments.filter(investment => investment.status === InvestmentStatus.FullyFunded).length;

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
      // Ensure investments are loaded so founderInvestments computed works
      if (this.investmentService.investments().length === 0) {
        await this.investmentService.loadInvestments();
      }
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

  getInvestmentImage(inv: Investment): string {
    const primary = inv.images?.find(i => i.isPrimary) ?? inv.images?.[0];
    return this.resolveUrl(primary?.url);
  }

  fundingPercent(inv: Investment): number {
    if (!inv.targetFund || inv.targetFund <= 0) return 0;
    return Math.min(((inv.currentFunding ?? 0) / inv.targetFund) * 100, 100);
  }
}
