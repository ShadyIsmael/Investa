import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { walletDirectionKey, walletReasonKey, walletReferenceTypeKey, Wallet, WalletService, WalletTransaction } from '../../../services/wallet.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-wallet',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent {
  private walletService = inject(WalletService);
  private router = inject(Router);
  private languageService = inject(LanguageService);

  wallet = signal<Wallet | null>(null);
  balance = this.walletService.balance;
  transactions = signal<WalletTransaction[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  summaryItems = computed(() => {
    const wallet = this.wallet();
    return [
      { labelKey: 'wallet.summary.currentBalance', value: this.balance(), tone: 'text-blue-300' },
      { labelKey: 'wallet.summary.purchased', value: wallet?.totalPurchasedCredits ?? 0, tone: 'text-emerald-300' },
      { labelKey: 'wallet.summary.bonus', value: wallet?.totalBonusCredits ?? 0, tone: 'text-violet-300' },
      { labelKey: 'wallet.summary.refunds', value: wallet?.totalRefundCredits ?? 0, tone: 'text-amber-300' }
    ];
  });

  constructor() {
    this.loadWallet();
  }

  async loadWallet(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const view = await this.walletService.loadCurrentUserWallet();
      this.wallet.set(view.wallet);
      this.transactions.set(view.transactions);
    } catch (error: unknown) {
      this.errorMessage.set(this.errorText(error));
      this.wallet.set(null);
      this.transactions.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value ?? 0);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  directionTone(direction: string | number): string {
    return walletDirectionKey(direction) === 'credit'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
      : 'bg-red-500/15 text-red-300 border-red-500/25';
  }

  goBack(): void {
    this.router.navigate(['/admin/profile']);
  }

  t(path: string): string {
    return this.languageService.translate(path);
  }

  directionLabel(value: string | number): string {
    return this.t(`wallet.enums.direction.${walletDirectionKey(value)}`);
  }

  reasonLabel(value: string | number): string {
    return this.t(`wallet.enums.reason.${walletReasonKey(value)}`);
  }

  referenceTypeLabel(value: string | number): string {
    return this.t(`wallet.enums.referenceType.${walletReferenceTypeKey(value)}`);
  }

  private errorText(error: unknown): string {
    const record = typeof error === 'object' && error !== null ? error as Record<string, unknown> : null;
    return typeof record?.['message'] === 'string' ? record['message'] : this.t('wallet.errors.loadFailed');
  }
}
