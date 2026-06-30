import { computed, Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class RoleContextService {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  clientType = computed(() =>
    this.profileService.profile()?.coreMetrics?.clientType ||
    this.authService.userRole() ||
    ''
  );

  isFounderUser = computed(() => this.matchesFounder(this.clientType()));
  isInvestorUser = computed(() => this.matchesInvestor(this.clientType()));
  canCreateOpportunity = this.isFounderUser;

  async ensureProfileLoaded(): Promise<void> {
    if (!this.profileService.profile() && this.authService.isAuthenticated()) {
      await this.profileService.loadMyProfile();
    }
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
}
