import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Wallet, WalletService, WalletTransaction } from '../../../services/wallet.service';

@Component({
  standalone: true,
  selector: 'app-wallet',
  imports: [CommonModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent {
  private walletService = inject(WalletService);
  private router = inject(Router);

  wallet = signal<Wallet | null>(null);
  balance = signal<number>(0);
  transactions = signal<WalletTransaction[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  summaryItems = computed(() => {
    const wallet = this.wallet();
    return [
      { label: 'Current Balance', value: this.balance(), tone: 'text-blue-300' },
      { label: 'Total Purchased Credits', value: wallet?.totalPurchasedCredits ?? 0, tone: 'text-emerald-300' },
      { label: 'Total Bonus Credits', value: wallet?.totalBonusCredits ?? 0, tone: 'text-violet-300' },
      { label: 'Total Refund Credits', value: wallet?.totalRefundCredits ?? 0, tone: 'text-amber-300' }
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
      this.balance.set(view.balance ?? view.wallet.currentBalance ?? 0);
      this.transactions.set(view.transactions);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load wallet.');
      this.wallet.set(null);
      this.transactions.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value ?? 0);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  directionTone(direction: string | number): string {
    const text = String(direction).toLowerCase();
    return text.includes('credit') || text === '0'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
      : 'bg-red-500/15 text-red-300 border-red-500/25';
  }

  goBack(): void {
    this.router.navigate(['/admin/profile']);
  }
}
