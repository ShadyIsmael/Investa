import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Opportunity, OpportunityLookup, OpportunityService } from '../../../services/opportunity.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { UserService } from '../../../services/user.service';
import { FileStoreService } from '../../../services/file-store.service';

type ProjectCard = Opportunity & Record<string, any>;

enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

enum InvestmentType {
  Founding = 1,
  Equity = 2,
  RevenueSharing = 3,
  Loan = 4
}

function getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
  if (type === InvestmentType.Founding) return 'Founding';
  if (type === InvestmentType.Equity) return 'Equity';
  if (type === InvestmentType.RevenueSharing) return 'Revenue Sharing';
  if (type === InvestmentType.Loan) return 'Loan';
  return 'Opportunity';
}

function getInvestmentTypeBadgeClass(type: InvestmentType | number | undefined): string {
  if (type === InvestmentType.Founding) return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25';
  if (type === InvestmentType.Equity) return 'bg-blue-500/15 text-blue-300 border border-blue-500/25';
  if (type === InvestmentType.RevenueSharing) return 'bg-purple-500/15 text-purple-300 border border-purple-500/25';
  if (type === InvestmentType.Loan) return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25';
  return 'bg-slate-700/70 text-slate-300 border border-slate-600/40';
}

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0tpZHM9ImV4dGxhbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0wMCAwMmgNDBwLTAgMEwwIDQwIiBmaWxsPSIjMzUwOSIgLz4KICA8cGF0aCBkPSJNMCA0MHY0MCIgZmlsbD0iIzM1MTEiIC8+CiAgPHBhdGggZD0iTTEwMCAxMEw1MCAxMCIgZmlsbD0iIzY2NyIgc3Ryb2tlLXdpZHRoPSIzLjUiIC8+CiAgPHBhdGggZD0iTTEwMCAxNUw1MCAxNSIgcmlnaHQ9NTAiIGZpbGw9IiNmZmYiIHN0cm9rZS13aWR0aD0iMy41IiAvPgogIDxwYXRoIGQ9Ik0xMDAgMjBMNTAgMjAiIHJpZ2h0PSI1MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzLjUiIC8+CiAgPC9nPgogIDx0ZXh0IGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NyIgdGV4dC0tLW0tbW0gbWF0Y2hlcmUgdGV4dCIgZmlsbD0iIzY2NyIvPgo8L3N2Zz4=';

const ITEMS_PER_PAGE = 8;
const ENGAGEMENT_CREDIT_COST = 5;

type InvestmentFilters = {
  searchTerm: string;
  riskLevels: { low: boolean; medium: boolean; high: boolean };
  investmentTypes: { founding: boolean; equity: boolean; revenueSharing: boolean; loan: boolean };
  minFunding: number;
  maxFunding: number;
  onlyFavorites: boolean;
};

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
  protected opportunityService = inject(OpportunityService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);
  protected languageService = inject(LanguageService);
  private requestsService = inject(RequestsService);
  private userService = inject(UserService);
  private fileStoreService = inject(FileStoreService);
  
  protected readonly RiskLevel = RiskLevel;
  protected readonly InvestmentType = InvestmentType;

  // Service state
  investments = signal<ProjectCard[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  categoryLookups = signal<OpportunityLookup[]>([]);

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
    const apiCategories = this.categoryLookups();
    return ['All', ...apiCategories.map(cat => cat.value)];
  });

  // UI state
  activeCategory = signal<string>('All');
  currentPage = signal(1);
  isAdvancedSearchOpen = signal(false);
  investmentToEngage = signal<ProjectCard | null>(null);
  engagementCreditCost = ENGAGEMENT_CREDIT_COST;
  engagementProcessing = signal(false);
  
  // Investment dialog state
  investmentToInvest = signal<ProjectCard | null>(null);
  sharesToPurchaseValue = 1;
  sharesToPurchase = computed(() => this.sharesToPurchaseValue);
  investmentError = signal<string | null>(null);
  investmentProcessing = signal(false);
  investmentConfirmationOpen = signal(false);  // Tracks if final confirmation dialog is open

  // User credits from UserService
  userCredits = this.userService.credits;

  // Founder avatar cache by user id
  founderAvatarCache = signal<Record<string, string | undefined>>({});
  
  // Helper properties for template
  Math = Math;
  String = String;

  /** Helper method to retrieve localized strings with fallback */
  t(path: string, fallback: string): string {
    return this.lookupPath(this.languageService.dictionary(), path, fallback);
  }

  // Infinite scroll
  itemsLoaded = signal(ITEMS_PER_PAGE);
  displayedInvestments = computed(() => this.filteredInvestments().slice(0, this.itemsLoaded()));
  isMyProjectsView = computed(() => this.router.url.startsWith('/admin/my-projects'));
  pageTitle = computed(() => this.isMyProjectsView() ? this.t('investments.myProjectsTitle', 'My Participations') : this.t('investments.title', 'Discover Opportunities'));
  emptyTitle = computed(() => this.isMyProjectsView() ? this.t('investments.noParticipationsTitle', 'No participated projects yet') : this.t('investments.noResultsTitle', 'No results found'));
  emptySubtitle = computed(() => this.isMyProjectsView() ? this.t('investments.noParticipationsSubtitle', 'Approved participations will appear here.') : this.t('investments.noResultsSubtitle', 'Try adjusting your search or filters.'));

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
    investmentTypes: this.fb.group({
      founding: [false],
      equity: [false]
    }),
    minFunding: [0],
    maxFunding: [100],
    onlyFavorites: [false]
  });

  filterState = signal<InvestmentFilters>(this.filterForm.value as InvestmentFilters);

  /**
   * Filtered investments based on all active filters
   */
  filteredInvestments = computed(() => {
    const filters = this.filterState();
    const term = (filters.searchTerm ?? '').toLowerCase();
    const category = this.activeCategory();
    
    const selectedRisks = Object.entries(filters.riskLevels ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key);

    const selectedTypes = Object.entries(filters.investmentTypes ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key === 'founding' ? InvestmentType.Founding : InvestmentType.Equity);

    return this.investments().filter(inv => {
      if (this.isMyProjectsView() && !((inv.investedAmount ?? 0) > 0)) {
        return false;
      }

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
      const typeMatch = selectedTypes.length === 0 || selectedTypes.some(type => inv.investmentType === type);

      return categoryMatch && termMatch && riskMatch && fundingMatch && favoriteMatch && typeMatch;
    }).sort((a, b) => this.getNewestTimestamp(b) - this.getNewestTimestamp(a));
  });

  private getNewestTimestamp(investment: ProjectCard): number {
    const candidates = [investment.lastActivityAt, investment.date].filter(Boolean) as Date[];
    for (const candidate of candidates) {
      const timestamp = candidate instanceof Date ? candidate.getTime() : new Date(candidate).getTime();
      if (Number.isFinite(timestamp)) return timestamp;
    }
    return 0;
  }

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
    // Pre-activate onlyFavorites filter when navigated from the watchlist "View All" link
    const snapshot = this.route.snapshot.queryParamMap;
    if (snapshot.get('onlyFavorites') === 'true') {
      this.filterForm.patchValue({ onlyFavorites: true });
    }

    // Reset to page 1 when filters change and update the reactive filter state.
    this.filterForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.currentPage.set(1);
      this.filterState.set(value as InvestmentFilters);
    });

    effect(() => {
      const investments = this.investments();
      investments.forEach(inv => {
        if (inv?.founderId) {
          this.loadFounderAvatar(inv.founderId);
        }
      });
    });

    void this.loadCategories();
    void this.loadOpportunities();

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
      name: inv.name || inv.title,
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
    this.itemsLoaded.set(ITEMS_PER_PAGE);

    await this.loadOpportunities();
  }

  clearCategoryFilter(): void {
    void this.selectCategory('All');
  }

  /**
   * Return a localized label for an API category value.
   * Falls back to the provided `cat` when no Arabic translation is available.
   */
  getCategoryLabel(cat: string): string {
    const lang = this.languageService.language();
    if (lang === 'ar') {
      const found = this.categoryLookups().find(c => c.value === cat);
      return found?.label || found?.value || cat;
    }
    return cat;
  }
  
  /**
   * Toggle advanced search panel
   */
  toggleAdvancedSearch(): void {
    this.isAdvancedSearchOpen.update(value => !value);
  }

  private async loadFounderAvatar(userId: string): Promise<void> {
    if (!userId) return;
    if (Object.prototype.hasOwnProperty.call(this.founderAvatarCache(), userId)) return;

    try {
      const url = await this.fileStoreService.getProfilePictureUrl(userId);
      this.founderAvatarCache.update(cache => ({ ...cache, [userId]: url || '' }));
    } catch (err) {
      this.founderAvatarCache.update(cache => ({ ...cache, [userId]: '' }));
      console.warn('Failed to load founder avatar for', userId, err);
    }
  }

  onFounderAvatarError(userId?: string): void {
    if (!userId) return;
    this.founderAvatarCache.update(cache => ({ ...cache, [userId]: '' }));
  }

  getFounderAvatarUrl(investment: ProjectCard): string {
    const url = investment?.founderId ? this.founderAvatarCache()[investment.founderId] : undefined;
    return url || '';
  }

  getCoverImageUrl(investment: ProjectCard): string {
    const url = this.fileStoreService.getPublicUrl(investment.coverImageUrl || investment.imageUrl || '');
    return url || DEFAULT_PLACEHOLDER;
  }

  private lookupPath(object: any, path: string, fallback: any): any {
    return path.split('.').reduce((current: any, segment: string) => current?.[segment], object) ?? fallback;
  }

  /**
   * Reset all advanced filters
   */
  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      riskLevels: { low: false, medium: false, high: false },
      investmentTypes: { founding: false, equity: false },
      minFunding: 0,
      maxFunding: 100,
      onlyFavorites: false
    });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(investmentToToggle: ProjectCard): Promise<void> {
    try {
      const id = investmentToToggle.id;
      this.investments.update(items => items.map(item => item.id === id ? ({ ...item, favorited: !item.favorited }) : item));
    } catch (error) {
      console.error('Failed to update favorite status', error);
    }
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
  promptEngage(investment: ProjectCard): void {
    this.investmentToEngage.set(investment);
  }

  /**
   * Cancel engagement
   */
  cancelEngage(): void {
    this.investmentToEngage.set(null);
  }

  /**
   * Confirm engagement for funding-based investments
   */
  async confirmEngage(): Promise<void> {
    const investment = this.investmentToEngage();
    if (!investment) return;

    if (this.engagementProcessing()) {
      return;
    }

    // Refresh profile to ensure credits are up-to-date
    try {
      await this.userService.refreshUser();
    } catch (err) {
      console.warn('Failed to refresh user before engagement confirmation:', err);
    }

    const currentCredits = this.userCredits();
    if (currentCredits < this.engagementCreditCost) {
      this.notificationService.showToast({
        title: 'Insufficient Credits',
        message: 'You do not have enough credits for engagement.',
        type: 'error'
      });
      return;
    }

    this.engagementProcessing.set(true);
    this.requestsService
      .createOpportunityRequest(investment, this.engagementCreditCost, 0)
      .then(() => {
        const { title, message } = this.getRequestSubmittedCopy(investment);
        this.notificationService.showToast({
          title,
          message,
          type: 'success'
        });
        this.investmentToEngage.set(null);
      })
      .catch(error => {
        const apiMessage = error?.error?.message || error?.message;
        this.notificationService.showToast({
          title: 'Request Failed',
          message: apiMessage || 'Failed to submit engagement request. Please try again.',
          type: 'error'
        });
      })
      .finally(() => {
        this.engagementProcessing.set(false);
      });
  }

  private getRequestSubmittedCopy(investment: ProjectCard): { title: string; message: string } {
    const dictionary = this.languageService.dictionary();
    const title = this.lookupPath(dictionary, 'investments.requestSubmittedTitle', 'Request Sent');
    const messageTemplate = this.lookupPath(
      dictionary,
      'investments.requestSubmittedMessage',
      'Your request for {investmentName} was submitted. We will notify you once it is accepted.'
    );

    return {
      title,
      message: messageTemplate.replace('{investmentName}', investment.name || investment.title || 'Opportunity')
    };
  }

  /**
   * Navigate to investment details page
   */
  navigateToDetails(investment: ProjectCard | number): void {
    try {
      const investmentId = typeof investment === 'number' ? investment : investment.id;
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
    await this.loadOpportunities();
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
  openInvestDialog(investment: ProjectCard): void {
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
  increaseShares(investment: ProjectCard): void {
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
  calculateRequestedAmount(investment: ProjectCard): number {
    return this.sharesToPurchaseValue * (investment.sharePrice || 0);
  }

  /**
   * Validate shares input
   */
  validateShares(investment: ProjectCard): void {
    const shares = this.sharesToPurchaseValue;
    const amount = this.calculateRequestedAmount(investment);

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
   * Show final confirmation dialog before submitting investment request
   */
  showConfirmationDialog(investment: ProjectCard): void {
    if (this.investmentError() || this.investmentProcessing()) {
      return;
    }

    const requestedAmount = (investment.sharePrice || 0) * this.sharesToPurchaseValue;
    const currentCredits = this.userCredits();

    // Pre-check credits
    if (currentCredits < requestedAmount) {
      this.investmentError.set('Insufficient credits. Please add more credits to your account.');
      this.notificationService.showToast({
        title: 'Insufficient Credits',
        message: 'You do not have enough credits to complete this investment.',
        type: 'error'
      });
      return;
    }

    // Open final confirmation dialog
    this.investmentConfirmationOpen.set(true);
  }

  /**
   * Cancel final confirmation dialog
   */
  cancelConfirmation(): void {
    this.investmentConfirmationOpen.set(false);
  }

  /**
   * Proceed with investment request after user confirms in dialog
   */
  async proceedWithInvestment(investment: ProjectCard): Promise<void> {
    if (this.investmentError() || this.investmentProcessing()) {
      return;
    }

    this.investmentProcessing.set(true);
    this.investmentError.set(null);

    try {
      const requestedAmount = (investment.sharePrice || 0) * this.sharesToPurchaseValue;

      // Call API to create investment request (deducts credits, creates request in database)
      await this.requestsService.createOpportunityRequest(
        investment,
        requestedAmount,
        this.sharesToPurchaseValue
      );

      const { title, message } = this.getRequestSubmittedCopy(investment);
      this.notificationService.showToast({
        title,
        message,
        type: 'success'
      });

      // Close dialogs and refresh
      this.investmentConfirmationOpen.set(false);
      this.closeInvestDialog();
      await this.refresh();
    } catch (error: any) {
      const apiMessage = error?.error?.message || error?.message;
      this.investmentError.set(apiMessage || 'Failed to submit investment request');
      this.notificationService.showToast({
        title: 'Request Failed',
        message: apiMessage || 'Failed to submit investment request. Please try again.',
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

  private async loadCategories(): Promise<void> {
    try {
      this.categoryLookups.set(await this.opportunityService.getCategories());
    } catch {
      this.categoryLookups.set([]);
    }
  }

  private async loadOpportunities(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const category = this.activeCategory();
      const found = this.categoryLookups().find(c => c.value === category);
      const [publicRecords, myRecords] = await Promise.all([
        this.opportunityService.getPublicOpportunities({ categoryId: category !== 'All' ? found?.id : undefined }),
        this.opportunityService.getMyOpportunities().catch(() => [])
      ]);

      const founderDrafts = myRecords.filter(item => this.isDraftStatus(item.status));
      const mergedById = new Map<string, Opportunity>();

      [...publicRecords, ...founderDrafts].forEach(item => {
        const key = String(item.id);
        if (!mergedById.has(key)) {
          mergedById.set(key, item);
        }
      });

      this.investments.set(Array.from(mergedById.values()).map(item => this.toProjectCard(item)));
    } catch (error: any) {
      this.error.set(error?.message || 'Failed to load opportunities.');
      this.investments.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private toProjectCard(item: Opportunity): ProjectCard {
    const source = item as Opportunity & Record<string, any>;
    const targetFund = Number(source.fundingTarget ?? source.targetFund ?? 0);
    const fundingPercentage = Number(source.fundingProgressPercent ?? source.fundingPercentage ?? 0);
    const currentFunding = targetFund > 0 ? targetFund * (fundingPercentage / 100) : Number(source.currentFunding ?? 0);

    return {
      ...source,
      name: source.title || source.name || 'Untitled Opportunity',
      description: source.shortDescription || source.description || source.fullDescription || '',
      founderDisplay: source.founder?.displayName || source.founder?.fullName || source.founder?.name || 'Founder',
      founderId: source.founderId || source.founder?.id || source.founder?.userId || '',
      businessRole: source.founder?.businessRole || source.businessRole || '',
      businessCategoryName: source.categoryName || source.category?.label || source.businessCategoryName || '',
      businessCategoryNameAr: source.businessCategoryNameAr || source.category?.value || '',
      targetFund,
      currentFunding,
      fundingPercentage,
      currency: source.currency || 'USD',
      investedAmount: Number(source.investedAmount ?? 0),
      investorCount: Number(source.investorCount ?? 0),
      investmentType: this.toInvestmentType(source.investmentModel),
      riskLevel: (source.riskLevel || RiskLevel.Medium) as RiskLevel,
      favorited: !!source.favorited,
      minInvestment: Number(source.minimumInvestmentAmount ?? source.minimumInvestment ?? 0),
      maxInvestment: Number(source.maximumInvestmentAmount ?? source.maximumInvestment ?? 0),
      sharePrice: Number(source.sharePrice ?? 0),
      availableShares: Number(source.availableShares ?? 0),
      credibilityScore: Number(source.credibilityScore ?? 0),
      date: source.createdAt ? new Date(source.createdAt) : new Date(),
      lastActivityAt: source.updatedAt ? new Date(source.updatedAt) : undefined,
      status: this.normalizeStatusLabel(source.status),
      imageUrl: source.coverImageUrl || source.imageUrl || '',
      investors: Array.isArray(source.investors) ? source.investors : []
    } as ProjectCard;
  }

  private normalizeStatusLabel(value: unknown): string {
    const raw = String(value || 'Active').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw === '1' || raw === 'draft') return 'Draft';
    if (raw === '5' || raw === 'published' || raw === 'active' || raw === 'approved') return 'Active';
    if (raw === '6' || raw === 'funding') return 'Funding';
    if (raw === '7' || raw === 'fullyfunded') return 'Fully Funded';
    if (raw === '8' || raw === 'inprogress') return 'In Progress';
    if (raw === '9' || raw === 'completed') return 'Completed';
    if (raw === '10' || raw === 'archived') return 'Archived';
    if (raw.includes('funded')) return 'Fully Funded';
    if (raw.includes('progress')) return 'In Progress';
    if (raw.includes('paused')) return 'Paused';
    if (raw.includes('completed')) return 'Completed';
    if (raw.includes('archived')) return 'Archived';
    if (raw.includes('closed')) return 'Closed';
    if (raw.includes('review')) return 'Reviewing Participants';
    if (raw.includes('draft')) return 'Draft';
    return 'Active';
  }

  private isDraftStatus(value: unknown): boolean {
    const raw = String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
    return raw === '1' || raw === 'draft';
  }

  private toInvestmentType(model: unknown): InvestmentType {
    const key = String(model || '').toLowerCase();
    if (key.includes('founding')) return InvestmentType.Founding;
    if (key.includes('loan') || key.includes('debt')) return InvestmentType.Loan;
    if (key.includes('profit') || key.includes('revenue')) return InvestmentType.RevenueSharing;
    return InvestmentType.Equity;
  }

}
