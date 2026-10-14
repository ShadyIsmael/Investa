import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

export type ActiveClientContext = 'founder' | 'investor';
export type AccountCapability = ActiveClientContext | 'both';

@Injectable({ providedIn: 'root' })
export class RoleContextService {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private selectedContext = signal<ActiveClientContext | null>(this.readStoredContext());

  private accountCapability = computed<AccountCapability | null>(() => {
    const profileClientType = this.profileService.profile()?.coreMetrics?.clientType;
    if (!this.hasKnownCapability(profileClientType)) return null;
    const founder = this.matchesFounder(profileClientType);
    const investor = this.matchesInvestor(profileClientType);
    if (founder && investor) return 'both';
    return founder ? 'founder' : 'investor';
  });

  constructor() {
    // The backend rejects founder endpoints (403 FOUNDER_ACCESS_REQUIRED) for
    // accounts that are not Founder/Both. Once the profile reveals an
    // investor-only account, drop any stored founder context so founder screens
    // are never rendered for it.
    effect(() => {
      if (this.accountCapability() !== 'investor') return;
      const requested = this.selectedContext() || this.normalizeContext(this.authService.userRole());
      if (requested === 'founder') {
        this.setActiveContext('investor');
      }
    });
  }

  clientType = computed(() => {
    const profileClientType = this.profileService.profile()?.coreMetrics?.clientType;
    return this.hasKnownCapability(profileClientType)
      ? profileClientType
      : this.authService.userRole() || profileClientType || '';
  });

  isFounderUser = computed(() => this.matchesFounder(this.clientType()));
  isInvestorUser = computed(() => this.matchesInvestor(this.clientType()));
  isBothUser = computed(() => this.isFounderUser() && this.isInvestorUser());
  isFounderOnlyUser = computed(() => this.isFounderUser() && !this.isInvestorUser());
  isInvestorOnlyUser = computed(() => this.isInvestorUser() && !this.isFounderUser());
  activeContext = computed<ActiveClientContext>(() => this.resolveActiveContext());
  isActiveFounderContext = computed(() => this.activeContext() === 'founder');
  isActiveInvestorContext = computed(() => this.activeContext() === 'investor');
  canCreateOpportunity = computed(() => this.isActiveFounderContext());

  async ensureProfileLoaded(): Promise<void> {
    if (!this.profileService.profile() && this.authService.isAuthenticated()) {
      await this.profileService.loadMyProfile();
    }
  }

  setActiveContext(context: string | null | undefined): ActiveClientContext {
    const requested = this.normalizeContext(context);
    const normalized = requested ? this.clampToCapability(requested) : null;
    this.selectedContext.set(normalized);
    if (normalized) {
      localStorage.setItem('activeClientContext', normalized);
    } else {
      localStorage.removeItem('activeClientContext');
    }
    return this.resolveActiveContext();
  }

  clearActiveContext(): void {
    this.selectedContext.set(null);
    localStorage.removeItem('activeClientContext');
  }

  private resolveActiveContext(): ActiveClientContext {
    const selected = this.selectedContext() || this.normalizeContext(this.authService.userRole());
    return this.clampToCapability(selected || 'investor');
  }

  private clampToCapability(context: ActiveClientContext): ActiveClientContext {
    // Investor-only accounts have no founder capability: founder screens would
    // answer 403 from every founder endpoint. Founder-only accounts keep the
    // historical behavior and may browse the investor workspace.
    return this.accountCapability() === 'investor' && context === 'founder' ? 'investor' : context;
  }

  private matchesFounder(value: string | null | undefined): boolean {
    const normalized = this.normalize(value);
    return normalized.includes('founder') || normalized.includes('both');
  }

  private matchesInvestor(value: string | null | undefined): boolean {
    const normalized = this.normalize(value);
    return normalized.includes('investor') || normalized.includes('partner') || normalized.includes('both');
  }

  private normalize(value: string | null | undefined): string {
    return (value || '').toString().trim().toLowerCase();
  }

  private normalizeContext(value: string | null | undefined): ActiveClientContext | null {
    const normalized = this.normalize(value);
    if (normalized.includes('founder')) return 'founder';
    if (normalized.includes('investor') || normalized.includes('partner')) return 'investor';
    return null;
  }

  private hasKnownCapability(value: string | null | undefined): boolean {
    return this.matchesFounder(value) || this.matchesInvestor(value);
  }

  private readStoredContext(): ActiveClientContext | null {
    return this.normalizeContext(localStorage.getItem('activeClientContext'));
  }
}
