import { Component, Input, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrustService } from '../../services/trust.service';
import { TrustLevel, TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS, TrustProfileDto } from '../../models/trust.model';

@Component({
  selector: 'app-trust-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="trust-badge"
      [class]="badgeClass()"
      [title]="tooltip()"
    >
      <span class="trust-icon">{{ icon() }}</span>
      <span class="trust-label">{{ label() }}</span>
    </span>
  `,
  styles: [`
    .trust-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .trust-badge.level-0 { background: #f3f4f6; color: #6b7280; }
    .trust-badge.level-1 { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }
    .trust-badge.level-2 { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .trust-badge.level-3 { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  `]
})
export class TrustBadgeComponent implements OnInit {
  /** Override with a specific user's profile. If omitted, uses the current user. */
  @Input() profile?: TrustProfileDto;

  /** Language: 'en' | 'ar' */
  @Input() lang: 'en' | 'ar' = 'en';

  private trustService = inject(TrustService);

  private effectiveLevel = computed<TrustLevel>(() =>
    this.profile?.trustLevel ?? this.trustService.trustLevel()
  );

  badgeClass = computed(() => `level-${this.effectiveLevel()}`);
  label = computed(() => TRUST_LEVEL_LABELS[this.effectiveLevel()][this.lang]);
  icon = computed(() => {
    const icons: Record<TrustLevel, string> = {
      [TrustLevel.Visitor]: '👤',
      [TrustLevel.Registered]: '✅',
      [TrustLevel.Interactive]: '⭐',
      [TrustLevel.TrustedActive]: '🛡️'
    };
    return icons[this.effectiveLevel()];
  });

  tooltip = computed(() => {
    const level = this.effectiveLevel();
    const reputation = this.profile?.reputationLevel ?? this.trustService.profile()?.reputationLevel ?? 'Rising Member';
    return `Trust Level ${level} • Reputation: ${reputation}`;
  });

  ngOnInit() {
    if (!this.profile && !this.trustService.isLoaded()) {
      this.trustService.loadProfile().subscribe();
    }
  }
}
