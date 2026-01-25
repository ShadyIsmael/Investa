import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvestmentService } from '../../../services/investment.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { get } from 'lodash-es';
import { Investment, RiskLevel, InvestmentType, getInvestmentTypeDisplay, getInvestmentTypeBadgeClass } from '../../../models/investment.model';

const ITEMS_PER_PAGE = 8;
const ENGAGEMENT_CREDIT_COST = 5;

/**
 * Investments Component
 * 
 * Features:
 * - Dynamic category loading from API
 * - Real-time filtering and search
 * - Pagination
 * - Advanced filters (risk, funding progress, favorites)
 * - Loading and error states
 */
@Component({
  standalone: true,
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe]
})
export class InvestmentsComponent {
  private investmentService = inject(InvestmentService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  
  protected readonly RiskLevel = RiskLevel;
  protected readonly InvestmentType = InvestmentType;

  // Service state
  investments = this.investmentService.investments;
  loading = this.investmentService.loading;
  error = this.investmentService.error;

  /**
   * Navigate to investor/partner profile if available. Stops click propagation so card link won't trigger.
   */
  openInvestorProfile(investorId?: string | null): void {
    if (!investorId) {
      this.notificationService.showToast({ title: 'Profile unavailable', message: 'Investor profile not available', type: 'info' });
      return;
    }

    try {
      // Navigate to client admin profile route
      this.router.navigate(['/admin/clients', investorId]);
    } catch (err) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open profile', type: 'error' });
      console.error('Navigation error:', err);
    }
  }

  // Categories: 'All' + API categories
  categories = computed(() => {
    const apiCategories = this.investmentService.categories();
    return ['All', ...apiCategories.map(cat => cat.value)];
  });

  // UI state
  activeCategory = signal<string>('All');
  currentPage = signal(1);
  isAdvancedSearchOpen = signal(false);
  investmentToEngage = signal<Investment | null>(null);
  engagementCreditCost = ENGAGEMENT_CREDIT_COST;
  
  // Investment dialog state
  investmentToInvest = signal<Investment | null>(null);
  sharesToPurchaseValue = 1;
  sharesToPurchase = computed(() => this.sharesToPurchaseValue);
  investmentError = signal<string | null>(null);
  investmentProcessing = signal(false);
  
  // Helper properties for template
  Math = Math;
  String = String;

  // Infinite scroll
  itemsLoaded = signal(ITEMS_PER_PAGE);
  displayedInvestments = computed(() => this.filteredInvestments().slice(0, this.itemsLoaded()));

  private onScroll = () => {
    try {
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 600);
      if (nearBottom) {
        this.loadMore();
      }
    } catch (e) {
      // ignore
    }
  }

  // Filter form
  filterForm: FormGroup = this.fb.group({
    searchTerm: [''],
    riskLevels: this.fb.group({
      low: [false],
      medium: [false],
      high: [false]
    }),
    minFunding: [0],
    maxFunding: [100],
    onlyFavorites: [false]
  });

  /**
   * Filtered investments based on all active filters
   */
  filteredInvestments = computed(() => {
    const filters = this.filterForm.value;
    const term = (filters.searchTerm ?? '').toLowerCase();
    const category = this.activeCategory();
    
    const selectedRisks = Object.entries(filters.riskLevels ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key);

    return this.investments().filter(inv => {
      // Category filter
      let categoryMatch = true;
      if (category !== 'All') {
        categoryMatch = inv.businessCategoryName === category;
      }
      
      // Search term filter
      const termMatch = !term || 
        inv.name.toLowerCase().includes(term) || 
        inv.description.toLowerCase().includes(term);

      // Risk level filter
      const riskMatch = selectedRisks.length === 0 || 
        selectedRisks.some(r => r.toLowerCase() === inv.riskLevel.toLowerCase());
      
      // Funding progress filter
      const progress = inv.targetFund && inv.targetFund > 0 
        ? (inv.currentFunding / inv.targetFund) * 100 
        : 0;
      const minFunding = filters.minFunding ?? 0;
      const maxFunding = filters.maxFunding ?? 100;
      const fundingMatch = progress >= minFunding && progress <= maxFunding;

      // Favorites filter
      const favoriteMatch = !filters.onlyFavorites || inv.favorited;

      return categoryMatch && termMatch && riskMatch && fundingMatch && favoriteMatch;
    });
  });

  /**
   * Total pages for pagination
   */
  totalPages = computed(() => {
    const total = this.filteredInvestments().length;
    return total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
  });

  /**
   * Current page of investments
   */
  paginatedInvestments = computed(() => {
    const page = this.currentPage();
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return this.filteredInvestments().slice(startIndex, endIndex);
  });

  constructor() {
    // Reset to page 1 when filters change
    this.filterForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage.set(1);
    });

    // attach scroll listener for load-more
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', this.onScroll));
  }

  /**
   * Load more items for infinite scroll
   */
  loadMore(): void {
    const total = this.filteredInvestments().length;
    const loaded = this.itemsLoaded();
    if (loaded >= total) return;
    this.itemsLoaded.set(Math.min(total, loaded + ITEMS_PER_PAGE));
  }

  /**
   * Export the filtered investments as CSV including investedAmount
   */
  exportCsv(): void {
    const rows = this.filteredInvestments().map(inv => ({
      id: inv.id,
      name: inv.name,
      founderId: inv.founderId,
      founderDisplay: inv.founderDisplay ?? '',
      targetFund: inv.targetFund ?? 0,
      currentFunding: inv.currentFunding ?? 0,
      investedAmount: inv.investedAmount ?? 0,
      investorCount: inv.investorCount ?? 0,
      status: inv.status
    }));

    const header = ['Id','Name','FounderId','FounderDisplay','TargetFund','CurrentFunding','InvestedAmount','InvestorCount','Status'];
    const csv = [header.join(',')].concat(rows.map(r => [r.id, `"${r.name.replace(/"/g,'""')}"`, r.founderId, `"${(r.founderDisplay||'').replace(/"/g,'""')}"`, r.targetFund, r.currentFunding, r.investedAmount, r.investorCount, r.status].join(','))).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investments_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Select a category filter
   */
  async selectCategory(category: string): Promise<void> {
    this.activeCategory.set(category);
    this.currentPage.set(1);

    // Load investments for selected category from API when possible
    try {
      const cats = this.investmentService.categories();
      if (category === 'All') {
        await this.investmentService.loadInvestments();
      } else {
        const found = cats.find(c => c.value === category);
        if (found) {
          await this.investmentService.loadInvestments(found.id);
        } else {
          // Fallback: reload all if category not found
          await this.investmentService.loadInvestments();
        }
      }
    } catch (err) {
      console.error('Failed to load investments for category', category, err);
    }
  }
  
  /**
   * Toggle advanced search panel
   */
  toggleAdvancedSearch(): void {
    this.isAdvancedSearchOpen.update(value => !value);
  }

  /**
   * Reset all advanced filters
   */
  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      riskLevels: { low: false, medium: false, high: false },
      minFunding: 0,
      maxFunding: 100,
      onlyFavorites: false
    });
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(investmentToToggle: Investment): void {
    this.investmentService.toggleFavorite(investmentToToggle);
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    this.currentPage.update(page => Math.max(page - 1, 1));
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    this.currentPage.update(page => Math.min(page + 1, this.totalPages()));
  }

  /**
   * Show engagement prompt
   */
  promptEngage(investment: Investment): void {
    this.investmentToEngage.set(investment);
  }

  /**
   * Cancel engagement
   */
  cancelEngage(): void {
    this.investmentToEngage.set(null);
  }

  /**
   * Confirm engagement (placeholder - implement actual logic)
   */
  confirmEngage(): void {
    const investment = this.investmentToEngage();
    if (investment) {
      const dictionary = this.languageService.dictionary();
      const titleTemplate = get(dictionary, 'investments.engageSuccessTitle', 'Request Sent');
      const messageTemplate = get(dictionary, 'investments.engageSuccessMessage', 'Your request has been sent.');
      const message = messageTemplate.replace('{investmentName}', investment.name);

      this.notificationService.showToast({
        title: titleTemplate,
        message: message,
        type: 'success'
      });
      
      this.investmentToEngage.set(null);
    }
  }

  /**
   * Navigate to investment details page
   */
  navigateToDetails(investmentId: number): void {
    try {
      this.router.navigate(['/admin/investments', investmentId]);
    } catch (err) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to navigate to investment details', type: 'error' });
      console.error('Navigation error:', err);
    }
  }

  /**
   * Refresh investments from API
   */
  async refresh(): Promise<void> {
    await this.investmentService.refresh();
  }

  /**
   * Calculate days remaining until end date
   */
  getDaysRemaining(endDate: Date | string | undefined): number {
    if (!endDate) return 0;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Open investment dialog
   */
  openInvestDialog(investment: Investment): void {
    this.investmentToInvest.set(investment);
    this.sharesToPurchaseValue = 1;
    this.investmentError.set(null);
    this.validateShares(investment);
  }

  /**
   * Close investment dialog
   */
  closeInvestDialog(): void {
    this.investmentToInvest.set(null);
    this.sharesToPurchaseValue = 1;
    this.investmentError.set(null);
    this.investmentProcessing.set(false);
  }

  /**
   * Increase shares to purchase
   */
  increaseShares(investment: Investment): void {
    if (this.sharesToPurchaseValue < (investment.availableShares || 0)) {
      this.sharesToPurchaseValue++;
      this.validateShares(investment);
    }
  }

  /**
   * Decrease shares to purchase
   */
  decreaseShares(): void {
    if (this.sharesToPurchaseValue > 1) {
      this.sharesToPurchaseValue--;
      const investment = this.investmentToInvest();
      if (investment) {
        this.validateShares(investment);
      }
    }
  }

  /**
   * Calculate total investment amount
   */
  calculateInvestmentAmount(investment: Investment): number {
    return this.sharesToPurchaseValue * (investment.sharePrice || 0);
  }

  /**
   * Validate shares input
   */
  validateShares(investment: Investment): void {
    const shares = this.sharesToPurchaseValue;
    const amount = this.calculateInvestmentAmount(investment);

    // Reset error
    this.investmentError.set(null);

    // Validate shares range
    if (shares < 1) {
      this.investmentError.set('Must purchase at least 1 share');
      return;
    }

    if (shares > (investment.availableShares || 0)) {
      this.investmentError.set(`Only ${investment.availableShares} shares available`);
      return;
    }

    // Validate min investment
    if (investment.minInvestment && amount < investment.minInvestment) {
      this.investmentError.set(`Minimum investment is ${investment.minInvestment} ${investment.currency || 'USD'}`);
      return;
    }

    // Validate max investment
    if (investment.maxInvestment && amount > investment.maxInvestment) {
      this.investmentError.set(`Maximum investment is ${investment.maxInvestment} ${investment.currency || 'USD'}`);
      return;
    }
  }

  /**
   * Confirm and process investment
   */
  async confirmInvestment(investment: Investment): Promise<void> {
    if (this.investmentError() || this.investmentProcessing()) {
      return;
    }

    this.investmentProcessing.set(true);
    this.investmentError.set(null);

    try {
      const success = await this.investmentService.purchaseShares(
        investment.id,
        this.sharesToPurchaseValue
      );

      if (success) {
        this.notificationService.showToast({
          title: 'Investment Successful',
          message: `You've successfully invested in ${investment.name}!`,
          type: 'success'
        });
        
        this.closeInvestDialog();
        await this.refresh();
      }
    } catch (error: any) {
      this.investmentError.set(error.message || 'Failed to process investment');
      this.notificationService.showToast({
        title: 'Investment Failed',
        message: error.message || 'Unable to complete your investment',
        type: 'error'
      });
    } finally {
      this.investmentProcessing.set(false);
    }
  }

  /**
   * Get display name for investment type
   */
  getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
    return getInvestmentTypeDisplay(type);
  }

  /**
   * Get badge CSS classes for investment type
   */
  getInvestmentTypeBadgeClass(type: InvestmentType | number | undefined): string {
    return getInvestmentTypeBadgeClass(type);
  }
}
