import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Opportunity, OpportunityLookup, OpportunityService, MyParticipation } from '../../../services/opportunity.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { FileStoreService } from '../../../services/file-store.service';
import { CurrencyDisplayPipe } from '../../../pipes/currency-display.pipe';

type ProjectCard = (Opportunity & MyParticipation & Record<string, any>) & {
  name: string;
  description: string;
  projectDisplayName: string;
  projectSummary: string;
  projectDescription: string;
  projectIndustry: string;
  projectLogoUrl: string;
  fundingStatusLabel: string;
  founderDisplay: string;
  founderId: string;
  businessRole: string;
  businessCategoryName: string;
  businessCategoryNameAr: string;
  targetFund: number;
  currentFunding: number | null;
  fundingPercentage: number | null;
  currency: string;
  investedAmount: number | null;
  investorCount: number | null;
  riskLevel: RiskLevel;
  favorited: boolean;
  credibilityScore: number;
  date: Date;
  lastActivityAt?: Date;
  status: string;
  imageUrl: string;
  investors: Array<{ investorId?: string; investorName?: string; investorAvatar?: string; isAnonymous?: boolean }>;

  // MyParticipation-specific (optional)
  opportunityId?: number | string | null;
  approvedContributionAmount?: number | null;
  remainingFundingAmount?: number | null;
  contractAvailable?: boolean;
  currentContractId?: string | null;
  currentContractVersion?: string | null;
  canOpenProjectRoom?: boolean;
  projectTotalInvestment?: number;
  opportunityTotalInvestment?: number;

};

enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0tpZHM9ImV4dGxhbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0wMCAwMmgNDBwLTAgMEwwIDQwIiBmaWxsPSIjMzUwOSIgLz4KICA8cGF0aCBkPSJNMCA0MHY0MCIgZmlsbD0iIzM1MTEiIC8+CiAgPHBhdGggZD0iTTEwMCAxMEw1MCAxMCIgZmlsbD0iIzY2NyIgc3Ryb2tlLXdpZHRoPSIzLjUiIC8+CiAgPHBhdGggZD0iTTEwMCAxNUw1MCAxNSIgcmlnaHQ9NTAiIGZpbGw9IiNmZmYiIHN0cm9rZS13aWR0aD0iMy41IiAvPgogIDxwYXRoIGQ9Ik0xMDAgMjBMNTAgMjAiIHJpZ2h0PSI1MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzLjUiIC8+CiAgPC9nPgogIDx0ZXh0IGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NyIgdGV4dC0tLW0tbW0gbWF0Y2hlcmUgdGV4dCIgZmlsbD0iIzY2NyIvPgo8L3N2Zz4=';

const ITEMS_PER_PAGE = 8;

type InvestmentFilters = {
  searchTerm: string;
  riskLevels: { low: boolean; medium: boolean; high: boolean };
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
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, CurrencyDisplayPipe]
})
export class InvestmentsComponent {
  protected opportunityService = inject(OpportunityService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);
  protected languageService = inject(LanguageService);
  private fileStoreService = inject(FileStoreService);
  
  protected readonly RiskLevel = RiskLevel;

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

  /** Open project room for my participation */
  openProjectRoom(investment: ProjectCard): void {
    const id = this.resolveOpportunityId(investment);
    if (id == null) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open project room: opportunity ID not found', type: 'error' });
      return;
    }
    try {
      this.router.navigate(['/admin/opportunities', id, 'room']);
    } catch (err) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open project room', type: 'error' });
      console.error('Navigation error:', err);
    }
  }

  /** Open contract for my participation */
  openContract(investment: ProjectCard): void {
    if (!investment.currentContractId) {
      this.notificationService.showToast({ title: 'Contract unavailable', message: 'No contract found for this participation', type: 'info' });
      return;
    }
    try {
      this.router.navigate(['/admin/contracts', investment.currentContractId]);
    } catch (err) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open contract', type: 'error' });
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
      const progress = inv.fundingPercentage;
      const minFunding = filters.minFunding ?? 0;
      const maxFunding = filters.maxFunding ?? 100;
      const fundingMatch = progress === null || progress === undefined || (progress >= minFunding && progress <= maxFunding);

      // Favorites filter
      const favoriteMatch = !filters.onlyFavorites || inv.favorited;
      return categoryMatch && termMatch && riskMatch && fundingMatch && favoriteMatch;
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
      this.filterState.set(this.filterForm.getRawValue() as InvestmentFilters);
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

  getProjectImageUrl(investment: ProjectCard): string {
    const url = this.fileStoreService.getPublicUrl(investment.projectLogoUrl || '');
    return url || DEFAULT_PLACEHOLDER;
  }

  onProjectImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (image && image.src !== DEFAULT_PLACEHOLDER) image.src = DEFAULT_PLACEHOLDER;
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
      minFunding: 0,
      maxFunding: 100,
      onlyFavorites: false
    });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(investmentToToggle: ProjectCard): Promise<void> {
    const id = this.resolveOpportunityId(investmentToToggle);
    if (id == null) return;
    const previous = investmentToToggle.favorited;
    this.investments.update(items => items.map(item => this.resolveOpportunityId(item) === id ? ({ ...item, favorited: !previous }) : item));
    try {
      const result = await this.opportunityService.setFavorite(id, !previous);
      this.investments.update(items => items.map(item => this.resolveOpportunityId(item) === id ? ({ ...item, favorited: result.favorited }) : item));
    } catch (error) {
      this.investments.update(items => items.map(item => this.resolveOpportunityId(item) === id ? ({ ...item, favorited: previous }) : item));
      console.error('Failed to update favorite status', error);
    }
  }

  openParticipationContract(contractId: number | null): void {
    if (contractId) this.router.navigate(['/admin/contracts', contractId]);
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

  navigateToDetails(investment: ProjectCard | number): void {
    const investmentId = typeof investment === 'number' ? investment : this.resolveOpportunityId(investment);
    if (investmentId == null) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to navigate to opportunity details: ID not found', type: 'error' });
      return;
    }
    try {
      this.router.navigate(['/admin/investments', investmentId]);
    } catch (err) {
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to navigate to opportunity details', type: 'error' });
      console.error('Navigation error:', err);
    }
  }

  openFounderProfile(founderId: string | null | undefined, event: Event): void {
    event.stopPropagation();
    const id = founderId?.trim();
    if (!id || id === 'undefined' || id === 'null') return;
    void this.router.navigate(['/admin/founders', id]);
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

  /** Map status value to i18n key */
  getStatusKey(status: string | null | undefined): string {
    if (!status) return 'draft';
    const raw = String(status).toLowerCase().replace(/[\s_-]+/g, '');
    if (raw === 'draft' || raw === '1') return 'draft';
    if (raw === 'active' || raw === 'published' || raw === 'approved' || raw === '5') return 'active';
    if (raw === 'reviewingparticipants' || raw === 'reviewingparticipants') return 'reviewingParticipants';
    if (raw === 'inprogress' || raw === '8') return 'inProgress';
    if (raw === 'fullyfunded' || raw === 'funded' || raw === '7') return 'fullyFunded';
    if (raw === 'paused') return 'paused';
    if (raw === 'completed' || raw === '9') return 'completed';
    if (raw === 'archived' || raw === '10') return 'archived';
    if (raw === 'closed') return 'closed';
    if (raw.includes('funded')) return 'fullyFunded';
    if (raw.includes('progress')) return 'inProgress';
    if (raw.includes('paused')) return 'paused';
    if (raw.includes('completed')) return 'completed';
    if (raw.includes('archived')) return 'archived';
    if (raw.includes('closed')) return 'closed';
    if (raw.includes('review')) return 'reviewingParticipants';
    if (raw.includes('draft')) return 'draft';
    return 'active';
  }

  /** Resolve the opportunity identifier from a ProjectCard.
   *  MyParticipations use opportunityId; Opportunities use id.
   *  Returns null when the identifier is missing or invalid. */
  private resolveOpportunityId(card: ProjectCard): number | string | null {
    const raw = card as Record<string, unknown>;
    const isMyParticipation = 'opportunityTitle' in raw || raw['approvedContributionAmount'] !== undefined;
    const id = isMyParticipation
      ? (raw['opportunityId'] as number | string | null | undefined) ?? null
      : (raw['id'] as number | string | null | undefined) ?? null;
    if (id == null || id === '') return null;
    return id;
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
      if (this.isMyProjectsView()) {
        const participations = await this.opportunityService.getMyParticipations();
        this.investments.set(participations.map(item => this.toProjectCard(item)));
        return;
      }

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

private toProjectCard(item: Opportunity | MyParticipation): ProjectCard {
    const source = item as Opportunity & MyParticipation & Record<string, any>;
    const isMyParticipation = 'opportunityTitle' in source || 'approvedContributionAmount' in source;

    if (isMyParticipation) {
      return this.toProjectCardFromMyParticipation(source as MyParticipation);
    }

    return this.toProjectCardFromOpportunity(source as Opportunity);
  }

  private toProjectCardFromMyParticipation(source: MyParticipation & Record<string, any>): ProjectCard {
    const targetFund = Number(source.fundingTarget ?? 0);
    const fundingPercentage = this.numberOrNull(source.fundingProgressPercentage);
    const currentFunding = this.numberOrNull(source.fundedAmount);

    return {
      ...source,
      id: source.id,
      name: source.opportunityTitle || 'Untitled Opportunity',
      description: source.shortDescription || '',
      projectDisplayName: source.projectDisplayName || 'Project',
      projectSummary: source.projectSummary || source.shortDescription || '',
      projectDescription: source.projectDescription || '',
      projectIndustry: source.projectIndustry || source.categoryName || '',
      projectLogoUrl: source.projectLogoUrl || '',
      fundingStatusLabel: this.normalizeFundingStatusLabel(source.fundingStatus || source.participationStatus),
      founderDisplay: source.founderDisplayName || 'Founder',
      founderId: source.founderId || '',
      businessRole: source.businessRole || '',
      businessCategoryName: source.categoryName || '',
      businessCategoryNameAr: source.categoryNameAr || '',
      targetFund,
      currentFunding,
      fundingPercentage,
      currency: source.currency || 'USD',
      investedAmount: this.numberOrNull(source.approvedContributionAmount),
      investorCount: this.numberOrNull(source.approvedParticipantCount),
      riskLevel: (source.riskLevel || RiskLevel.Medium) as RiskLevel,
      favorited: !!source.favorited,
      credibilityScore: Number(source.credibilityScore ?? 0),
      date: source.createdAt ? new Date(source.createdAt) : new Date(),
      lastActivityAt: source.updatedAt ? new Date(source.updatedAt) : undefined,
      status: this.normalizeStatusLabel(source.participationStatus),
      imageUrl: source.coverImageUrl || '',
      investors: Array.isArray(source.investors) ? source.investors : [],

      // MyParticipation-specific fields
      approvedContributionAmount: this.numberOrNull(source.approvedContributionAmount),
      remainingFundingAmount: this.numberOrNull(source.remainingFundingAmount),
      contractAvailable: !!source.contractAvailable,
      currentContractId: source.currentContractId ? String(source.currentContractId) : null,
      currentContractVersion: source.currentContractVersion ? String(source.currentContractVersion) : null,
      canOpenProjectRoom: !!source.canOpenProjectRoom,

    } as ProjectCard;
  }

  private toProjectCardFromOpportunity(source: Opportunity & Record<string, any>): ProjectCard {
    const targetFund = Number(source.fundingTarget ?? source.targetFund ?? 0);
    const fundingPercentage = this.numberOrNull(source.fundingProgressPercentage ?? source.fundingProgressPercent);
    const currentFunding = this.numberOrNull(source.fundedAmount);

    return {
      ...source,
      name: source.title || source.name || 'Untitled Opportunity',
      description: source.shortDescription || source.description || source.fullDescription || '',
      projectDisplayName: source.projectDisplayName || 'Project',
      projectSummary: source.projectSummary || '',
      projectDescription: source.projectDescription || '',
      projectIndustry: source.projectIndustry || source.projectContext?.category?.name || '',
      projectLogoUrl: source.projectLogoUrl || '',
      fundingStatusLabel: this.normalizeFundingStatusLabel(source.fundingStatus || source.status),
      founderDisplay: source.founder?.displayName || source.founder?.fullName || source.founder?.name || 'Founder',
      founderId: source.founderId || source.founder?.id || source.founder?.userId || '',
      businessRole: source.founder?.businessRole || source.businessRole || '',
      businessCategoryName: source.projectContext?.category?.name || source.businessCategoryName || '',
      businessCategoryNameAr: source.projectContext?.category?.name || source.businessCategoryNameAr || '',
      targetFund,
      currentFunding,
      fundingPercentage,
      currency: source.currency || 'USD',
      investedAmount: this.numberOrNull(source.investedAmount),
      investorCount: this.numberOrNull(source.approvedParticipantCount),
      riskLevel: (source.riskLevel || RiskLevel.Medium) as RiskLevel,
      favorited: !!source.favorited,
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

  private normalizeFundingStatusLabel(value: unknown): string {
    const raw = String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw === '1' || raw === 'draft') return 'Draft';
    if (raw === '6' || raw === 'funding' || raw === 'open') return 'Open';
    if (raw === '7' || raw === 'fullyfunded' || raw === 'funded') return 'Fully funded';
    if (raw === '8' || raw === 'inprogress') return 'In progress';
    if (raw === '9' || raw === 'completed' || raw === 'closed') return 'Closed';
    if (raw === 'paused') return 'Paused';
    return value ? String(value) : 'Open';
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private isDraftStatus(value: unknown): boolean {
    const raw = String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
    return raw === '1' || raw === 'draft';
  }

}
