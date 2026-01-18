import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentService } from '../../../services/investment.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { get } from 'lodash-es';
import { RouterLink } from '@angular/router';
import { Investment, InvestmentType, RiskLevel } from '../../../models/investment.model';

const ITEMS_PER_PAGE = 8;
const ENGAGEMENT_CREDIT_COST = 5;

@Component({
  standalone: true,
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink]
})
export class InvestmentsComponent {
  private investmentService = inject(InvestmentService);
  private fb: FormBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  
  protected readonly InvestmentType = InvestmentType;
  protected readonly RiskLevel = RiskLevel;

  investments = this.investmentService.investments;

  categories = signal(['All', ...Object.values(InvestmentType)]);
  activeCategory = signal<string>('All');
  currentPage = signal(1);
  isAdvancedSearchOpen = signal(false);
  
  investmentToEngage = signal<Investment | null>(null);
  engagementCreditCost = ENGAGEMENT_CREDIT_COST;

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

  filteredInvestments = computed(() => {
    const filters = this.filterForm.value;
    const term = (filters.searchTerm ?? '').toLowerCase();
    const category = this.activeCategory();
    
    const selectedRisks = Object.entries(filters.riskLevels ?? {})
      .filter(([, value]) => value)
      .map(([key]) => key);

    return this.investments().filter(inv => {
      // Basic filters
      const categoryMatch = category === 'All' || inv.type === category;
      const termMatch = inv.name.toLowerCase().includes(term) || inv.description.toLowerCase().includes(term);

      // Advanced filters
      const riskMatch = selectedRisks.length === 0 || selectedRisks.some(r => r.toLowerCase() === inv.riskLevel.toLowerCase());
      
      const progress = (inv.targetFund > 0) ? (inv.currentFund / inv.targetFund) * 100 : 0;
      const minFunding = filters.minFunding ?? 0;
      const maxFunding = filters.maxFunding ?? 100;
      const fundingMatch = progress >= minFunding && progress <= maxFunding;

      const favoriteMatch = !filters.onlyFavorites || inv.favorited;

      return categoryMatch && termMatch && riskMatch && fundingMatch && favoriteMatch;
    });
  });

  totalPages = computed(() => {
    const total = this.filteredInvestments().length;
    return total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
  });

  paginatedInvestments = computed(() => {
    const page = this.currentPage();
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return this.filteredInvestments().slice(startIndex, endIndex);
  });

  constructor() {
    this.filterForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage.set(1);
    });
  }

  selectCategory(category: string) {
    this.activeCategory.set(category);
    this.currentPage.set(1);
  }
  
  toggleAdvancedSearch() {
    this.isAdvancedSearchOpen.update(value => !value);
  }

  resetAdvancedFilters() {
    this.filterForm.patchValue({
        riskLevels: { low: false, medium: false, high: false },
        minFunding: 0,
        maxFunding: 100,
        onlyFavorites: false
    });
  }

  toggleFavorite(investmentToToggle: Investment) {
    this.investmentService.toggleFavorite(investmentToToggle);
  }

  previousPage() {
    this.currentPage.update(page => Math.max(page - 1, 1));
  }

  nextPage() {
    this.currentPage.update(page => Math.min(page + 1, this.totalPages()));
  }

  promptEngage(investment: Investment) {
    this.investmentToEngage.set(investment);
  }

  cancelEngage() {
    this.investmentToEngage.set(null);
  }

  confirmEngage() {
    const investment = this.investmentToEngage();
    if (investment) {
      console.log(`Engaging with ${investment.name} for ${this.engagementCreditCost} credits.`);
      
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
}
