import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { Router } from '@angular/router';
import {
  walletDirectionKey,
  walletReasonKey,
  walletReferenceTypeKey,
  WalletService,
  WalletTransaction
} from '../../../services/wallet.service';

@Component({
  standalone: true,
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe]
})
export class TransactionsComponent {
  private walletService = inject(WalletService);
  languageService = inject(LanguageService);
  private router = inject(Router);

  transactions = signal<WalletTransaction[]>([]);
  currentBalance = this.walletService.balance;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  itemsPerPage = 10;
  currentPage = signal(1);

  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.transactions().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.transactions().length / this.itemsPerPage));

  constructor() {
    void this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const view = await this.walletService.loadCurrentUserWallet();
      this.transactions.set(view.transactions);
    } catch (error: unknown) {
      const record = typeof error === 'object' && error !== null ? error as Record<string, unknown> : null;
      this.errorMessage.set(typeof record?.['message'] === 'string' ? record['message'] : this.t('wallet.errors.loadFailed'));
    } finally {
      this.isLoading.set(false);
    }
  }

  transactionTitle(transaction: WalletTransaction): string {
    return transaction.description?.trim() || this.t(`wallet.enums.reason.${walletReasonKey(transaction.reason)}`);
  }

  directionLabel(value: string | number): string {
    return this.t(`wallet.enums.direction.${walletDirectionKey(value)}`);
  }

  referenceTypeLabel(value: string | number): string {
    return this.t(`wallet.enums.referenceType.${walletReferenceTypeKey(value)}`);
  }

  isCredit(transaction: WalletTransaction): boolean {
    return walletDirectionKey(transaction.direction) === 'credit';
  }

  signedAmount(transaction: WalletTransaction): number {
    return this.isCredit(transaction) ? transaction.creditAmount : -transaction.creditAmount;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  goBack(): void {
    void this.router.navigate(['/admin/profile']);
  }

  private t(path: string): string {
    return this.languageService.translate(path);
  }
}
