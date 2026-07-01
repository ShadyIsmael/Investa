import { computed, Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

export type ActiveClientContext = 'founder' | 'investor';

@Injectable({ providedIn: 'root' })
export class RoleContextService {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private selectedContext = signal<ActiveClientContext | null>(this.readStoredContext());

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
    const normalized = this.normalizeContext(context);
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
    return selected || 'investor';
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
