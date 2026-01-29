import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ProfileService, CreditTransaction } from '../../../services/profile.service';
import { LanguageService } from '../../../services/language.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class TransactionsComponent {
  private destroyRef = inject(DestroyRef);
  private profileService = inject(ProfileService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  // Credit history
  creditHistory = signal<CreditTransaction[]>([]);

  // Current language preference
  currentLanguage = signal<'ar' | 'en'>('en');

  // Loading and error state
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Pagination
  itemsPerPage = 10;
  currentPage = signal<number>(1);

  // Computed values
  paginatedTransactions = computed(() => {
    const transactions = this.creditHistory();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return transactions.slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => {
    const total = this.creditHistory().length;
    return Math.ceil(total / this.itemsPerPage);
  });

  currentScore = computed(() => {
    const transactions = this.creditHistory();
    if (!transactions || transactions.length === 0) return 0;
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  });

  constructor() {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const history = await this.profileService.getCreditHistory();
      this.creditHistory.set(history);
    } catch (e) {
      this.errorMessage.set('Failed to load transactions');
      console.error('Failed to fetch transactions', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  getJustification = (transaction: CreditTransaction): string => {
    return this.currentLanguage() === 'ar' ? transaction.justificationAr : transaction.justificationEn;
  };

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/profile']);
  }

  private t(path: string): string {
    return this.languageService.translate(path);
  }
}
