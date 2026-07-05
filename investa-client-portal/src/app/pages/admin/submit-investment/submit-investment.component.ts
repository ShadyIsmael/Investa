import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { InvestmentService } from '../../../services/investment.service';
import { FileStoreService } from '../../../services/file-store.service';
import { OpportunityService } from '../../../services/opportunity.service';
import { BusinessCategory, BusinessStage, ProjectPhase } from '../../../models/api-response.model';
import { InvestmentType, EquityExitType } from '../../../models/investment.model';

/**
 * Risk Level options for investment opportunities
 */
const RISK_LEVELS = ['Low', 'Medium', 'High'] as const;

/**
 * Supported currencies
 */
const CURRENCIES = [ 
  { code: 'USD', symbol: '$', name: 'US Dollar', nameAr: 'دولار أمريكي' },
  { code: 'EUR', symbol: '€', name: 'Euro', nameAr: 'يورو' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', nameAr: 'الريال السعودي' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', nameAr: 'الجنيه المصري' }
] as const;

/**
 * Payout/distribution frequency options
 */
const PAYOUT_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'At Maturity'] as const;

/**
 * Revenue distribution frequency options
 */
const REVENUE_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'] as const;

/**
 * Loan repayment frequency options
 */
const REPAYMENT_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'] as const;

/**
 * Submit Investment Component
 * 
 * Allows founders to create new investment opportunities with:
 * - Multi-step form wizard
 * - Dynamic fields based on investment type (Founding, Equity, Revenue Sharing, Loan)
 * - Comprehensive validations
 * - Toast notifications for feedback
 */
@Component({
  standalone: true,
  selector: 'app-submit-investment',
  templateUrl: './submit-investment.component.html',
  styleUrls: ['./submit-investment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SubmitInvestmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  private fileStoreService = inject(FileStoreService);
  private opportunityService = inject(OpportunityService);

  // Form state
  investmentForm!: FormGroup;
  formValid = signal(false);
  currentStep = signal(1);
  totalSteps = 5;
  isSubmitting = signal(false);

  // Edit mode
  editingInvestmentId = signal<number | null>(null);
  editMode = computed(() => this.editingInvestmentId() !== null);
  pageTitle = computed(() => this.editMode() ? this.t('submitInvestment.editTitle') : this.t('submitInvestment.title'));
  submitButtonLabel = computed(() => this.editMode() ? this.t('submitInvestment.actions.save') : this.t('submitInvestment.actions.submit'));
  
  // Lookup data
  categories = signal<BusinessCategory[]>([]);
  tags = signal<any[]>([]);
  fundingGoals = signal<any[]>([]);
  stages = signal<BusinessStage[]>([]);
  phases = signal<ProjectPhase[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  // Static data
  readonly riskLevels = RISK_LEVELS;
  readonly currencies = CURRENCIES;
  readonly InvestmentType = InvestmentType;
  readonly EquityExitType = EquityExitType;
  readonly payoutFrequencies = PAYOUT_FREQUENCIES;
  readonly revenueFrequencies = REVENUE_FREQUENCIES;
  readonly repaymentFrequencies = REPAYMENT_FREQUENCIES;
  readonly investmentTypes = [
    { id: InvestmentType.Founding, name: 'Profit Sharing', nameAr: 'مشاركة الأرباح', description: 'Fixed duration with profit-based returns', descriptionAr: 'مدة محددة مع عوائد قائمة على الأرباح' },
    { id: InvestmentType.Equity, name: 'Equity', nameAr: 'أسهم', description: 'Share-based participation from multiple investors', descriptionAr: 'مشاركة قائمة على الأسهم من عدة مستثمرين' },
    { id: InvestmentType.RevenueSharing, name: 'Profit Sharing', nameAr: 'مشاركة الأرباح', description: 'Share a percentage of profit with investors', descriptionAr: 'مشاركة نسبة من الأرباح مع المستثمرين' },
    { id: InvestmentType.Loan, name: 'Loan', nameAr: 'قرض', description: 'Loan-based funding with return payments', descriptionAr: 'تمويل قائم على القرض مع دفعات عائد' }
  ];

  readonly equityExitTypes = [
    { id: EquityExitType.Acquisition, name: 'Acquisition', nameAr: 'استحواذ' },
    { id: EquityExitType.StrategicBuyout, name: 'Strategic Buyout', nameAr: 'شراء استراتيجي' },
    { id: EquityExitType.SecondaryShareSale, name: 'Secondary Share Sale', nameAr: 'بيع أسهم ثانوي' },
    { id: EquityExitType.IPO, name: 'IPO', nameAr: 'طرح عام أولي' },
    { id: EquityExitType.FounderBuyback, name: 'Founder Buyback', nameAr: 'إعادة شراء المؤسس' },
    { id: EquityExitType.Undetermined, name: 'Undetermined', nameAr: 'غير محدد' }
  ];

  // Computed values for equity metrics
  targetFundCalculated = computed(() => {
    const sharePrice = this.investmentForm?.get('sharePrice')?.value || 0;
    const totalShares = this.investmentForm?.get('totalShares')?.value || 0;
    return sharePrice * totalShares;
  });

  // Language direction
  isRtl = computed(() => this.languageService.direction() === 'rtl');

  // Form step labels
  stepLabels = ['Identity', 'Funding', 'Investors', 'Advanced', 'Review'];

  // helper to translate keys in templates and TS
  t(path: string) { return this.languageService.translate(path); }

  // Display helper for lookup items
  displayLookup(item: any): string {
    if (!item) return '';
    if (item.key) return this.t(item.key);
    const dir = this.languageService.direction();
    if (dir === 'rtl') {
      if (item.valueAr) return item.valueAr;
      if (item.nameAr) return item.nameAr;
      if (item.descriptionAr) return item.descriptionAr;
    }
    return item.value || item.name || item.description || '';
  }

  // Computed values for review step
  selectedCategoryName = computed(() => {
    const categoryId = this.investmentForm?.get('businessCategoryId')?.value;
    return this.displayLookup(this.categories().find(c => c.id === categoryId)) || '-';
  });

  selectedFundingPurposeName = computed(() => {
    const fundingGoalId = this.investmentForm?.get('fundingGoalId')?.value;
    return this.displayLookup(this.fundingGoals().find(g => g.id === fundingGoalId)) || '-';
  });

  selectedTagNames = computed(() => {
    const selectedIds = new Set<number>(this.investmentForm?.get('tagIds')?.value || []);
    return this.tags().filter(tag => selectedIds.has(tag.id)).map(tag => this.displayLookup(tag));
  });

  selectedStageName = computed(() => {
    const stageId = this.investmentForm?.get('businessStageId')?.value;
    return this.displayLookup(this.stages().find(s => s.id === stageId)) || '-';
  });

  selectedPhaseName = computed(() => {
    const phaseId = this.investmentForm?.get('projectPhaseId')?.value;
    return this.displayLookup(this.phases().find(p => p.id === phaseId)) || '-';
  });

  selectedInvestmentTypeName = computed(() => {
    const typeId = this.investmentForm?.get('investmentTypeId')?.value;
    return this.getInvestmentModelName(typeId) || '-';
  });

  equityFundingPreview = computed(() => {
    const sharePrice = Number(this.investmentForm?.get('sharePrice')?.value || 0);
    const availableShares = Number(this.investmentForm?.get('availableShares')?.value || this.investmentForm?.get('totalShares')?.value || 0);
    return sharePrice * availableShares;
  });

  loanReturnPreview = computed(() => {
    const principal = Number(this.investmentForm?.get('targetFund')?.value || this.investmentForm?.get('totalRepaymentAmount')?.value || 0);
    const rate = Number(this.investmentForm?.get('interestRate')?.value || 0);
    return principal + (principal * rate / 100);
  });

  profitSharePreview = computed(() => {
    const payout = Number(this.investmentForm?.get('totalExpectedPayout')?.value || 0);
    const share = Number(this.investmentForm?.get('revenueSharePercentage')?.value || 0);
    return payout * share / 100;
  });

  getInvestmentModelName(typeId: InvestmentType | number): string {
    if (typeId === InvestmentType.Equity) return 'Equity';
    if (typeId === InvestmentType.Loan) return 'LoanInvestment';
    if (typeId === InvestmentType.RevenueSharing) return 'CapitalContributionProfitSharing';
    return this.displayLookup(this.investmentTypes.find(t => t.id === typeId));
  }

  getInvestmentModelDescription(typeId: InvestmentType | number): string {
    if (typeId === InvestmentType.Equity) return 'Offer shares in return for capital.';
    if (typeId === InvestmentType.Loan) return 'Raise debt funding with a return rate and repayment term.';
    if (typeId === InvestmentType.RevenueSharing) return 'Accept contributions and share a defined percentage of profits.';
    return this.investmentTypes.find(t => t.id === typeId)?.description || '';
  }

  selectedInvestmentType = computed(() => this.investmentForm?.get('investmentTypeId')?.value as InvestmentType);
  selectedFundingPurposeDetails = computed(() => this.investmentForm?.get('fundingPurposeDetails')?.value as string);

  ngOnInit(): void {
    this.initForm();

    // Bridge form status into a signal so OnPush template re-renders on validity change.
    this.investmentForm.statusChanges.subscribe(status => {
      this.formValid.set(status === 'VALID');
    });

    this.loadLookupData();

    // If an investment id is present in the route, load it for editing.
    this.route.paramMap.subscribe(params => {
      const idValue = params.get('id');
      if (idValue !== null) {
        const investmentId = Number(idValue);
        if (!Number.isNaN(investmentId)) {
          void this.loadInvestmentForEdit(investmentId);
        }
      }
    });

    // Keep risk internal. It is not shown to founders, but legacy create still accepts it.
    const stageControl = this.investmentForm.get('businessStageId');
    stageControl?.valueChanges.subscribe(id => {
      const stage = this.stages().find(s => s.id === id);
      const computed = this.computeRiskFromStage(stage);
      this.investmentForm.get('riskLevel')?.setValue(computed, { emitEvent: false });
    });
  }

  private async loadInvestmentForEdit(id: number): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);
    try {
      const investment = await this.investmentService.getInvestmentById(id);
      if (!investment) {
        this.loadError.set('Opportunity not found.');
        return;
      }
      this.editingInvestmentId.set(id);
      this.investmentForm.patchValue({
        businessName: investment.name,
        description: investment.description,
        businessCategoryId: investment.businessCategoryId ?? null,
        businessStageId: investment.businessStageId ?? null,
        projectPhaseId: investment.projectPhaseId ?? null,
        milestone: investment.milestone ?? '',
        riskLevel: investment.riskLevel ?? 'Medium',
        investmentTypeId: investment.investmentType ?? InvestmentType.Equity,
        initialCapital: investment.initialCapital,
        minInvestment: investment.minInvestment ?? null,
        maxInvestment: investment.maxInvestment ?? null,
        currency: investment.currency ?? 'USD',
        targetFund: investment.targetFund ?? null,
        sharePrice: investment.sharePrice ?? null,
        totalShares: investment.totalShares ?? null,
        valuationCap: investment.valuationCap ?? null,
        durationMonths: investment.durationMonths ?? null,
        profitPercentage: investment.profitPercentage ?? investment.expectedROI ?? null,
        payoutFrequency: investment.payoutFrequency ?? 'Monthly',
        expectedROI: investment.expectedROI ?? null,

        // Equity exit strategy
        currentValuation: investment.currentValuation ?? null,
        estimatedFutureValuation: investment.estimatedFutureValuation ?? null,
        equityExitType: investment.equityExitType ?? null,
        exitTargetDate: this.formatDateForInput(investment.exitTargetDate),
        expectedExitStrategy: investment.expectedExitStrategy ?? '',

        // Revenue Sharing fields
        contractStartDate: this.formatDateForInput(investment.contractStartDate),
        contractEndDate: this.formatDateForInput(investment.contractEndDate),
        totalExpectedPayout: investment.totalExpectedPayout ?? null,
        revenueDistributionFrequency: investment.revenueDistributionFrequency ?? 'Monthly',
        revenueSharePercentage: null, // estimated from profitPercentage if available

        // Loan fields
        interestRate: null,
        loanDurationMonths: null,
        repaymentFrequency: 'Monthly',
        gracePeriodMonths: null,
        estimatedInstallment: null,
        repaymentStartDate: this.formatDateForInput(investment.repaymentStartDate),
        finalRepaymentDate: this.formatDateForInput(investment.finalRepaymentDate),

        startDate: this.formatDateForInput(investment.startDate),
        endDate: this.formatDateForInput(investment.endDate),
        imageUrl: investment.imageUrl ?? '',
        videoUrl: investment.videoUrl ?? ''
      });
      const typeId = this.investmentForm.get('investmentTypeId')?.value;
      this.updateValidatorsByType(typeId as InvestmentType);
      Object.values(this.investmentForm.controls).forEach(c => c.updateValueAndValidity({ onlySelf: true }));
      this.investmentForm.updateValueAndValidity();
      this.cdr.markForCheck();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load investment for editing.';
      this.loadError.set(msg);
      this.notificationService.showToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      this.isLoading.set(false);
    }
  }

  private formatDateForInput(value?: Date | string): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }

  /**
   * Initialize the reactive form with all fields and validations
   */
  private initForm(): void {
    this.investmentForm = this.fb.group({
      // Step 1: Business Details
      businessName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      shortDescription: ['', [Validators.required, Validators.maxLength(240)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(5000)]],
      businessCategoryId: [null, [Validators.required]],
      tagIds: [[]],
      fundingGoalId: [null, [Validators.required]],
      businessStageId: [null],
      projectPhaseId: [null],
      milestone: ['', [Validators.maxLength(200)]],
      riskLevel: ['Medium'],
      investmentTypeId: [InvestmentType.Equity, [Validators.required]],
      
      // Step 2: Financial Structure - Common
      initialCapital: [null, [Validators.min(1)]],
      minInvestment: [null, [Validators.min(1)]],
      maxInvestment: [null, [Validators.min(1)]],
      currency: ['USD', [Validators.required]],
      targetFund: [null, [Validators.required, Validators.min(1)]],
      fundingPurposeDetails: ['', [Validators.maxLength(500)]],

      // Equity-specific fields
      sharePrice: [null],
      totalShares: [null],
      availableShares: [null],
      equityOfferedPercentage: [null, [Validators.min(0.1), Validators.max(100)]],
      valuationCap: [null, [Validators.min(1)]],

      // Equity Exit Strategy
      currentValuation: [null, [Validators.min(1)]],
      estimatedFutureValuation: [null, [Validators.min(1)]],
      equityExitType: [null],
      exitTargetDate: [''],
      expectedExitStrategy: ['', [Validators.maxLength(2000)]],

      // Founding-specific fields
      durationMonths: [null],
      profitPercentage: [null],
      payoutFrequency: ['Monthly'],
      expectedROI: [null, [Validators.min(0), Validators.max(1000)]],

      // Revenue Sharing-specific fields
      contractStartDate: [''],
      contractEndDate: [''],
      totalExpectedPayout: [null, [Validators.min(1)]],
      revenueDistributionFrequency: ['Monthly'],
      revenueSharePercentage: [null, [Validators.min(0.1), Validators.max(100)]],
      minimumContribution: [null, [Validators.min(1)]],

      // Loan-specific fields
      interestRate: [null, [Validators.min(0.1), Validators.max(100)]],
      loanDurationMonths: [null, [Validators.min(1)]],
      repaymentFrequency: ['Monthly'],
      gracePeriodMonths: [null, [Validators.min(0)]],
      estimatedInstallment: [null, [Validators.min(1)]],
      totalRepaymentAmount: [null, [Validators.min(1)]],

      // Timeline
      startDate: ['', [Validators.required]],
      endDate: [''],
      
      // Media (optional)
      imageUrl: ['', [this.urlValidator]],
      videoUrl: ['', [this.urlValidator]]
    }, {
      validators: [this.minMaxInvestmentValidator, this.dateRangeValidator]
    });

    // Update validators dynamically based on investment type
    this.investmentForm.get('investmentTypeId')?.valueChanges.subscribe(typeId => {
      this.updateValidatorsByType(typeId);
    });
    
    // Initialize validators for default type
    this.updateValidatorsByType(InvestmentType.Equity);
  }
  
  /**
   * Update field validators based on investment type
   */
  private updateValidatorsByType(typeId: InvestmentType): void {
    // Clear all dynamic validators first
    const allDynamicFields = [
      'sharePrice', 'totalShares', 'availableShares', 'equityOfferedPercentage', 'valuationCap',
      'currentValuation', 'estimatedFutureValuation', 'equityExitType', 'exitTargetDate', 'expectedExitStrategy',
      'durationMonths', 'profitPercentage', 'payoutFrequency',
      'contractStartDate', 'contractEndDate', 'totalExpectedPayout', 'revenueDistributionFrequency', 'revenueSharePercentage', 'minimumContribution',
      'interestRate', 'loanDurationMonths', 'repaymentFrequency', 'gracePeriodMonths', 'estimatedInstallment', 'totalRepaymentAmount'
    ];
    
    allDynamicFields.forEach(f => {
      this.investmentForm.get(f)?.clearValidators();
    });

    switch (typeId) {
      case InvestmentType.Equity:
        // Equity: require share fields
        this.investmentForm.get('sharePrice')?.setValidators([Validators.required, Validators.min(1)]);
        this.investmentForm.get('totalShares')?.setValidators([Validators.required, Validators.min(100)]);
        this.investmentForm.get('availableShares')?.setValidators([Validators.min(1)]);
        this.investmentForm.get('equityOfferedPercentage')?.setValidators([Validators.min(0.1), Validators.max(100)]);
        this.investmentForm.get('valuationCap')?.setValidators([Validators.min(1)]);
        break;

      case InvestmentType.Founding:
        // Founding: require duration and profit fields
        this.investmentForm.get('durationMonths')?.setValidators([Validators.required, Validators.min(1)]);
        this.investmentForm.get('profitPercentage')?.setValidators([Validators.required, Validators.min(0.1), Validators.max(100)]);
        this.investmentForm.get('payoutFrequency')?.setValidators([Validators.required]);
        break;

      case InvestmentType.RevenueSharing:
        // Profit sharing: keep only the simple product fields required.
        this.investmentForm.get('revenueSharePercentage')?.setValidators([Validators.required, Validators.min(0.1), Validators.max(100)]);
        this.investmentForm.get('minimumContribution')?.setValidators([Validators.required, Validators.min(1)]);
        this.investmentForm.get('revenueDistributionFrequency')?.setValidators([Validators.required]);
        break;

      case InvestmentType.Loan:
        // Loan: require only the simple terms shown in Step 2.
        this.investmentForm.get('interestRate')?.setValidators([Validators.required, Validators.min(0.1), Validators.max(100)]);
        this.investmentForm.get('loanDurationMonths')?.setValidators([Validators.required, Validators.min(1)]);
        this.investmentForm.get('repaymentFrequency')?.setValidators([Validators.required]);
        break;
    }

    // Update validity for all dynamic fields
    allDynamicFields.forEach(f => {
      this.investmentForm.get(f)?.updateValueAndValidity();
    });
  }

  /**
   * Custom validator for URL fields (optional but must be valid if provided)
   */
  private urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  /**
   * Cross-field validator: minInvestment must be less than maxInvestment
   */
  private minMaxInvestmentValidator(group: FormGroup): ValidationErrors | null {
    const min = group.get('minInvestment')?.value;
    const max = group.get('maxInvestment')?.value;
    if (min && max && min > max) {
      return { minGreaterThanMax: true };
    }
    return null;
  }

  /**
   * Cross-field validator: startDate must be before endDate
   */
  private dateRangeValidator(group: FormGroup): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  /**
   * Compute risk level from business stage lookup value/key
   */
  private computeRiskFromStage(stage?: BusinessStage | null): 'Low' | 'Medium' | 'High' {
    if (!stage) return 'Medium';
    const hint = (stage.key || stage.value || '').toLowerCase();

    if (hint.includes('idea') || hint.includes('mvp')) return 'High';
    if (hint.includes('startup') || hint.includes('early')) return 'Medium';
    if (hint.includes('running') || hint.includes('operational') || hint.includes('growth') || hint.includes('scale')) return 'Low';

    return 'Medium';
  }

// Team members (client-side list)
  teamMembers = signal<{ mobile?: string; name?: string; role?: string; userId?: string }[]>([]);

  private investmentService = inject(InvestmentService);

  // Cover image upload state
  coverFile: File | null = null;
  coverPreview = signal<string | null>(null);
  isUploadingCover = signal(false);

  // Gallery images (up to 5)
  galleryFiles: File[] = [];
  galleryPreviews = signal<string[]>([]);
  readonly maxGalleryImages = 5;

  // Video upload state
  videoFile: File | null = null;
  videoPreview = signal<string | null>(null);
  isUploadingVideo = signal(false);

  addTeamMember(): void {
    this.teamMembers.update(arr => [...arr, { mobile: '', name: '', role: '' }]);
  }

  updateTeamMember(index: number, field: 'mobile' | 'name' | 'role' | 'userId', value: string): void {
    this.teamMembers.update(arr => {
      const copy = [...arr];
      const existing = copy[index] || { mobile: '', name: '', role: '' };
      (existing as any)[field] = value;
      copy[index] = existing;
      return copy;
    });
  }

  // Search UI state (per-row)
  private searchTimers = new Map<number, any>();
  searchResults = signal<Record<number, any[]>>({});
  isSearchingMap = signal<Record<number, boolean>>({});
  activeSearchIndex = signal<number | null>(null);
  searchUnavailableMap = signal<Record<number, boolean>>({});

  onMobileInput(index: number, value: string): void {
    this.updateTeamMember(index, 'mobile', value);
    this.updateTeamMember(index, 'userId', '');

    const prev = this.searchTimers.get(index);
    if (prev) clearTimeout(prev);

    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 4) {
      const prev = { ...(this.searchResults() || {}) };
      if (prev[index]) { prev[index] = []; this.searchResults.set(prev); }
      const prevSearch = { ...(this.isSearchingMap() || {}) };
      prevSearch[index] = false;
      this.isSearchingMap.set(prevSearch);
      if (this.activeSearchIndex() === index) { this.activeSearchIndex.set(null); }
      return;
    }

    const timer = setTimeout(async () => {
      this.activeSearchIndex.set(index);
      const prevSearch = { ...(this.isSearchingMap() || {}) };
      prevSearch[index] = true;
      this.isSearchingMap.set(prevSearch);
      try {
        const resp = await this.apiService.searchUsersByPhone(value);
        const prev = { ...(this.searchResults() || {}) };
        prev[index] = resp.results || [];
        this.searchResults.set(prev);
        const prevUnavailable = { ...(this.searchUnavailableMap() || {}) };
        prevUnavailable[index] = !resp.available;
        this.searchUnavailableMap.set(prevUnavailable);
      } catch (e) {
        console.warn('User search failed', e);
        const prev = { ...(this.searchResults() || {}) };
        prev[index] = [];
        this.searchResults.set(prev);
        const prevUnavailable = { ...(this.searchUnavailableMap() || {}) };
        prevUnavailable[index] = true;
        this.searchUnavailableMap.set(prevUnavailable);
      } finally {
        const prevSearch2 = { ...(this.isSearchingMap() || {}) };
        prevSearch2[index] = false;
        this.isSearchingMap.set(prevSearch2);
      }
    }, 350);

    this.searchTimers.set(index, timer);
  }

  private isTeamMemberDuplicate(user: any, excludeIndex?: number): boolean {
    const userId = String(user.userId || user.id || '').trim();
    const mobile = String(user.mobileNumber || user.phone || user.mobile || user.phoneNumber || '').replace(/\D/g, '');

    return this.teamMembers().some((member, idx) => {
      if (excludeIndex !== undefined && idx === excludeIndex) return false;
      const memberId = String(member.userId || '').trim();
      const memberMobile = String(member.mobile || '').replace(/\D/g, '');
      return (userId && memberId && userId === memberId) || (mobile && memberMobile && mobile === memberMobile);
    });
  }

  assignSearchResult(index: number, user: any): void {
    if (this.isTeamMemberDuplicate(user, index)) {
      this.notificationService.showToast({
        title: 'Duplicate Team Member',
        message: 'This team member has already been added. Please choose a different member.',
        type: 'warning'
      });
      return;
    }

    this.updateTeamMember(index, 'mobile', user.mobileNumber || user.phone || user.mobile || user.phoneNumber || '');
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.fullName || user.displayName || '';
    this.updateTeamMember(index, 'name', displayName);
    const userId = user.userId || user.id;
    if (userId) this.updateTeamMember(index, 'userId', String(userId));
    const prev = { ...(this.searchResults() || {}) };
    prev[index] = [];
    this.searchResults.set(prev);
    const prevSearch = { ...(this.isSearchingMap() || {}) };
    prevSearch[index] = false;
    this.isSearchingMap.set(prevSearch);
    if (this.activeSearchIndex() === index) this.activeSearchIndex.set(null);
  }

  // Helpers for template
  getSearchResults(index: number): any[] {
    return (this.searchResults()[index] || []).filter(item => !this.isTeamMemberDuplicate(item, index));
  }

  getSearchResultLabel(item: any): string {
    return `${item?.firstName || ''} ${item?.lastName || ''}`.trim() || item?.name || item?.fullName || item?.displayName || '';
  }

  isSearchingFor(index: number): boolean {
    return !!(this.isSearchingMap()[index]);
  }

  isSearchUnavailable(index: number): boolean {
    return !!(this.searchUnavailableMap()[index]);
  }

  private hasDuplicateTeamMembers(): boolean {
    const seenIds = new Set<string>();
    const seenMobiles = new Set<string>();

    for (const member of this.teamMembers()) {
      const memberId = String(member.userId || '').trim();
      const memberMobile = String(member.mobile || '').replace(/\D/g, '');

      if (memberId) { if (seenIds.has(memberId)) return true; seenIds.add(memberId); }
      if (memberMobile) { if (seenMobiles.has(memberMobile)) return true; seenMobiles.add(memberMobile); }
    }

    return false;
  }

  removeTeamMember(index: number): void {
    this.teamMembers.update(arr => arr.filter((_, i) => i !== index));
  }

  toggleTag(tagId: number, checked: boolean): void {
    const current = new Set<number>(this.investmentForm.get('tagIds')?.value || []);
    if (checked) {
      current.add(tagId);
    } else {
      current.delete(tagId);
    }
    this.investmentForm.get('tagIds')?.setValue(Array.from(current));
    this.investmentForm.get('tagIds')?.markAsDirty();
  }

  /**
   * Load lookup data from API (categories, stages, phases)
   */
  async loadLookupData(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const [categories, stages, phases, tags, fundingGoals] = await Promise.all([
        this.apiService.getOpportunityCategories(),
        this.apiService.getBusinessStages(),
        this.apiService.getProjectPhases(),
        this.apiService.getOpportunityTags(),
        this.apiService.getFundingGoals()
      ]);

      this.categories.set(categories);
      this.stages.set(stages);
      this.phases.set(phases);
      this.tags.set(tags);
      this.fundingGoals.set(fundingGoals);

      const selectedStageId = this.investmentForm.get('businessStageId')?.value;
      if (selectedStageId) {
        const stage = stages.find(s => s.id === selectedStageId);
        const computed = this.computeRiskFromStage(stage);
        this.investmentForm.get('riskLevel')?.setValue(computed, { emitEvent: false });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load form data';
      this.loadError.set(errorMsg);
      this.notificationService.showToast({
        title: 'Error',
        message: 'Failed to load form options. Please refresh the page.',
        type: 'error'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigate to next step with validation
   */
  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep.update(step => Math.min(step + 1, this.totalSteps));
    }
  }

  /**
   * Navigate to previous step
   */
  prevStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  /**
   * Go to specific step (for stepper navigation)
   */
  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    } else if (step === this.currentStep() + 1 && this.validateCurrentStep()) {
      this.currentStep.set(step);
    }
  }

  /**
   * Validate fields for current step
   */
  private validateCurrentStep(): boolean {
    const step = this.currentStep();
    let fieldsToValidate: string[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['businessName', 'shortDescription', 'businessCategoryId', 'investmentTypeId', 'imageUrl'];
        break;
      case 2:
        fieldsToValidate = ['targetFund', 'fundingGoalId'];
        switch (this.investmentForm.get('investmentTypeId')?.value as InvestmentType) {
          case InvestmentType.Equity:
            fieldsToValidate.push('sharePrice', 'totalShares', 'equityOfferedPercentage');
            break;
          case InvestmentType.Loan:
            fieldsToValidate.push('interestRate', 'loanDurationMonths', 'repaymentFrequency');
            break;
          case InvestmentType.RevenueSharing:
            fieldsToValidate.push('minimumContribution', 'revenueSharePercentage', 'revenueDistributionFrequency');
            break;
        }
        break;
      case 3:
        fieldsToValidate = ['description'];
        break;
      case 4:
        fieldsToValidate = ['startDate'];
        break;
      case 5:
        return this.investmentForm.valid && this.hasCoverImage();
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const control = this.investmentForm.get(field);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      this.notificationService.showToast({
        title: 'Validation Error',
        message: 'Please fill in all required fields correctly.',
        type: 'warning'
      });
    }

    if (step === 1 && !this.hasCoverImage()) {
      this.notificationService.showToast({
        title: 'Cover Image Required',
        message: 'Please upload a cover image or provide an image URL before continuing.',
        type: 'warning'
      });
      isValid = false;
    }

    // Additional check: ensure team members (if any) provide a mobile number
    if (step === 1 && this.teamMembers().length > 0) {
      const invalidMember = this.teamMembers().find(tm => !tm.mobile || tm.mobile.trim() === '');
      if (invalidMember) {
        this.notificationService.showToast({
          title: 'Team Members',
          message: 'All team members must include a mobile number. Please provide a mobile number for each member or remove anonymous entries.',
          type: 'warning'
        });
        isValid = false;
      }

      if (this.hasDuplicateTeamMembers()) {
        this.notificationService.showToast({
          title: 'Team Members',
          message: 'Each team member must be unique. Please remove duplicate members before proceeding.',
          type: 'warning'
        });
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Check if a field has error and is touched
   */
  hasError(fieldName: string): boolean {
    const control = this.investmentForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.investmentForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['invalidUrl']) return 'Please enter a valid URL (starting with http:// or https://)';
    
    return 'Invalid value';
  }

  /**
   * Get form-level error messages
   */
  getFormError(): string | null {
    const errors = this.investmentForm.errors;
    if (!errors) return null;
    
    if (errors['minGreaterThanMax']) return 'Minimum investment cannot be greater than maximum investment';
    if (errors['invalidDateRange']) return 'End date must be after start date';
    
    return null;
  }

  hasCoverImage(): boolean {
    return !!this.coverFile || !!this.investmentForm.get('imageUrl')?.value;
  }

  /**
   * Submit the investment opportunity
   */
  async onSubmit(): Promise<void> {
    if (!this.investmentForm.valid) {
      if (this.investmentForm.get('startDate')?.invalid) {
        this.notificationService.showToast({
          title: 'Validation Error',
          message: 'Start date is required.',
          type: 'error'
        });
        return;
      }

      this.notificationService.showToast({
        title: 'Validation Error',
        message: 'Please correct all errors before submitting.',
        type: 'error'
      });
      return;
    }

    if (this.teamMembers().length > 0 && this.teamMembers().some(tm => !tm.mobile || tm.mobile.trim() === '')) {
      this.notificationService.showToast({
        title: 'Team Members',
        message: 'Please ensure all team members have a valid mobile number or remove anonymous entries before submitting.',
        type: 'error'
      });
      return;
    }

    if (this.hasDuplicateTeamMembers()) {
      this.notificationService.showToast({
        title: 'Team Members',
        message: 'Please remove duplicate team members before submitting. Each member must be selected only once.',
        type: 'error'
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.investmentForm.value;
      const typeId = formValue.investmentTypeId as InvestmentType;
      const startDate = this.toIsoDateString(formValue.startDate);

      if (!startDate) {
        this.notificationService.showToast({
          title: 'Validation Error',
          message: 'Start date is required.',
          type: 'error'
        });
        return;
      }

      const payload: any = {
        title: formValue.businessName.trim(),
        shortDescription: formValue.shortDescription?.trim() || formValue.description.trim(),
        fullDescription: formValue.fullDescription?.trim() || formValue.description.trim(),
        description: formValue.description.trim(),
        categoryId: formValue.businessCategoryId,
        projectStage: formValue.businessStageId ? String(formValue.businessStageId) : undefined,
        tagIds: formValue.tagIds || [],
        investmentModel: this.getInvestmentModelName(typeId),
        fundingGoalId: formValue.fundingGoalId || undefined,
        fundingTarget: formValue.targetFund || (typeId === InvestmentType.Equity ? this.targetFundCalculated() : undefined),
        minimumInvestment: formValue.minInvestment || undefined,
        maximumInvestment: formValue.maxInvestment || undefined,
        expectedDuration: typeId === InvestmentType.Founding ? formValue.durationMonths || undefined : (typeId === InvestmentType.Loan ? formValue.loanDurationMonths || undefined : undefined),
        coverImageUrl: formValue.imageUrl?.trim() || undefined,
        fundingUsage: formValue.fundingPurposeDetails?.trim() || undefined,
        exitStrategy: typeId === InvestmentType.Equity ? formValue.expectedExitStrategy?.trim() || undefined : undefined,
        businessStageId: formValue.businessStageId || this.defaultBusinessStageId(),
        projectPhaseId: formValue.projectPhaseId || undefined,
        milestone: formValue.milestone?.trim() || 'Initial opportunity launch',
        riskLevel: formValue.riskLevel || 'Medium',
        
        initialCapital: formValue.initialCapital || formValue.targetFund || formValue.minimumContribution || 1,
        targetFund: formValue.targetFund || (typeId === InvestmentType.Equity ? this.targetFundCalculated() : undefined),
        minInvestment: formValue.minInvestment || undefined,
        maxInvestment: formValue.maxInvestment || undefined,
        expectedROI: formValue.expectedROI || undefined,
        currency: formValue.currency,
        investmentTypeId: typeId,
        fundingPurposeDetails: formValue.fundingPurposeDetails?.trim() || undefined,

        // Common to all types
        startDate,
        endDate: this.toIsoDateString(formValue.endDate),
        imageUrl: formValue.imageUrl?.trim() || undefined,
        videoUrl: formValue.videoUrl?.trim() || undefined,
        
        // Duration - used for both Founding and Loan
        durationMonths: typeId === InvestmentType.Founding ? formValue.durationMonths || undefined : (typeId === InvestmentType.Loan ? formValue.loanDurationMonths || undefined : undefined),
        
        // Founding-specific fields (profit sharing)
        profitPercentage: typeId === InvestmentType.Founding ? formValue.profitPercentage || undefined : undefined,
        payoutFrequency: typeId === InvestmentType.Founding ? formValue.payoutFrequency || undefined : undefined,

        // Equity fields
        sharePrice: typeId === InvestmentType.Equity ? formValue.sharePrice || undefined : undefined,
        totalShares: typeId === InvestmentType.Equity ? formValue.totalShares || undefined : undefined,
        valuationCap: typeId === InvestmentType.Equity ? formValue.valuationCap || undefined : undefined,
        
        // Equity exit strategy
        currentValuation: typeId === InvestmentType.Equity ? formValue.currentValuation || undefined : undefined,
        estimatedFutureValuation: typeId === InvestmentType.Equity ? formValue.estimatedFutureValuation || undefined : undefined,
        equityExitType: typeId === InvestmentType.Equity ? formValue.equityExitType || undefined : undefined,
        exitTargetDate: typeId === InvestmentType.Equity ? this.toIsoDateString(formValue.exitTargetDate) : undefined,
        expectedExitStrategy: typeId === InvestmentType.Equity ? formValue.expectedExitStrategy?.trim() || undefined : undefined,

        // Revenue Sharing fields
        contractStartDate: typeId === InvestmentType.RevenueSharing ? this.toIsoDateString(formValue.contractStartDate) : undefined,
        contractEndDate: typeId === InvestmentType.RevenueSharing ? this.toIsoDateString(formValue.contractEndDate) : undefined,
        totalExpectedPayout: typeId === InvestmentType.RevenueSharing ? formValue.totalExpectedPayout || undefined : undefined,
        revenueDistributionFrequency: typeId === InvestmentType.RevenueSharing ? formValue.revenueDistributionFrequency || undefined : undefined,

        // Loan fields
        interestRate: typeId === InvestmentType.Loan ? formValue.interestRate || undefined : undefined,
        repaymentFrequency: typeId === InvestmentType.Loan ? formValue.repaymentFrequency || undefined : undefined,
        gracePeriodMonths: typeId === InvestmentType.Loan ? formValue.gracePeriodMonths || undefined : undefined,
        estimatedInstallment: typeId === InvestmentType.Loan ? formValue.estimatedInstallment || undefined : undefined,
        totalRepaymentAmount: typeId === InvestmentType.Loan ? formValue.totalRepaymentAmount || undefined : undefined
      };

      const editId = this.editingInvestmentId();
      const result = editId
        ? await this.opportunityService.updateOpportunity(editId, payload)
        : await this.opportunityService.createOpportunity(payload);

      const investmentId = Number(result?.id ?? editId!);

      // Handle file uploads...
      if (this.coverFile) {
        this.isUploadingCover.set(true);
        try {
          const uploadResult = await this.fileStoreService.uploadFile('OpportunityCover', this.coverFile, {
            purpose: 'Cover',
            visibility: 'Public',
            isPublic: true
          });
          const imageUrl = uploadResult.previewUrl || uploadResult.url || uploadResult.fileKey;
          if (imageUrl) {
            await this.opportunityService.updateOpportunity(investmentId, { ...payload, coverImageUrl: imageUrl });
          }
        } catch (err) {
          console.error('Cover upload failed', err);
          this.notificationService.showToast({
            title: 'Warning',
            message: 'Cover image upload failed. Opportunity saved without cover.',
            type: 'warning'
          });
        } finally {
          this.isUploadingCover.set(false);
        }
      }

      if (this.galleryFiles.length > 0) {
        this.isUploadingCover.set(true);
        try {
          const uploadPromises = this.galleryFiles.map(f => this.fileStoreService.uploadFile('OpportunityGallery', f, {
            purpose: 'Gallery',
            visibility: 'Public',
            isPublic: true
          }));
          const settled = await Promise.allSettled(uploadPromises);
          const failed = settled.filter(s => s.status === 'rejected');
          if (failed.length) {
            this.notificationService.showToast({ title: 'Warning', message: `${failed.length} gallery image(s) failed to upload.`, type: 'warning' });
          }
          if (settled.some(s => s.status === 'fulfilled')) {
            this.notificationService.showToast({ title: 'Gallery uploaded', message: 'Gallery files were uploaded to FileStore, but the current opportunity save flow has no metadata attach endpoint for gallery references.', type: 'warning' });
          }
        } catch (e) {
          console.error('Gallery upload error', e);
          this.notificationService.showToast({ title: 'Warning', message: 'Failed to upload gallery images.', type: 'warning' });
        } finally {
          this.isUploadingCover.set(false);
        }
      }

      if (this.videoFile) {
        this.isUploadingVideo.set(true);
        try {
          const videoResult = await this.fileStoreService.uploadFile('Video', this.videoFile, {
            purpose: 'PitchVideo',
            visibility: 'Public',
            isPublic: true
          });
          const videoUrl = videoResult.previewUrl || videoResult.url || videoResult.fileKey;
          if (videoUrl) {
            await this.opportunityService.updateOpportunity(investmentId, { ...payload, videoUrl });
          }
        } catch (err) {
          console.error('Video upload failed', err);
          this.notificationService.showToast({
            title: 'Warning',
            message: 'Video upload failed. Opportunity saved without video.',
            type: 'warning'
          });
        } finally {
          this.isUploadingVideo.set(false);
        }
      }

      this.notificationService.showToast({
        title: 'Success!',
        message: editId ? 'Opportunity updated successfully.' : 'Your opportunity has been created successfully.',
        type: 'success'
      });

      this.notificationService.addNotification({
        title: editId ? 'Opportunity Updated' : 'Opportunity Created',
        message: editId
          ? `"${payload.title}" has been updated.`
          : `"${payload.title}" is now live and visible to investors.`,
        type: 'success'
      });

      this.router.navigate(['/admin/investments', investmentId]);

    } catch (error) {
      console.error('Error saving investment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create opportunity. Please try again.';
      
      this.notificationService.showToast({
        title: 'Error',
        message: errorMsg,
        type: 'error'
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private toIsoDateString(value: unknown): string | undefined {
    if (value === null || value === undefined || value === '') return undefined;

    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return undefined;

    return date.toISOString();
  }

  private defaultBusinessStageId(): number {
    const firstStage = this.stages().find(stage => Number(stage.id) > 0);
    return Number(firstStage?.id || 1);
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    if (this.investmentForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/admin/investments']);
      }
    } else {
      this.router.navigate(['/admin/investments']);
    }
  }

  /**
   * Handle cover image file selection and show local preview
   */
  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.notificationService.showToast({ title: 'Invalid File', message: 'Please select an image file.', type: 'warning' });
      return;
    }

    this.coverFile = file;
    const url = URL.createObjectURL(file);
    this.coverPreview.set(url);
    this.investmentForm.patchValue({ imageUrl: '' });
  }

  removeCover(): void {
    const url = this.coverPreview();
    if (url) URL.revokeObjectURL(url);
    this.coverPreview.set(null);
    this.coverFile = null;
  }

  resolveImageUrl(url?: string | null): string {
    return this.fileStoreService.getPublicUrl(url);
  }

  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;

    const remaining = this.maxGalleryImages - this.galleryFiles.length;
    const toAdd = files.slice(0, remaining);

    for (const file of toAdd) {
      if (!file.type.startsWith('image/')) continue;
      this.galleryFiles.push(file);
      const url = URL.createObjectURL(file);
      this.galleryPreviews.update(arr => [...arr, url]);
    }

    if (files.length > remaining) {
      this.notificationService.showToast({ title: 'Limit Reached', message: `Only ${this.maxGalleryImages} images are allowed.`, type: 'warning' });
    }

    if (input) input.value = '';
  }

  removeGalleryImage(index: number): void {
    const previews = this.galleryPreviews();
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);

    this.galleryPreviews.update(arr => arr.filter((_, i) => i !== index));
    this.galleryFiles.splice(index, 1);
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      this.notificationService.showToast({ title: 'Invalid File', message: 'Please select a video file.', type: 'warning' });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      this.notificationService.showToast({ title: 'File Too Large', message: 'Video must be under 100MB.', type: 'warning' });
      return;
    }

    this.videoFile = file;
    const url = URL.createObjectURL(file);
    this.videoPreview.set(url);
    this.investmentForm.patchValue({ videoUrl: '' });
  }

  removeVideo(): void {
    const url = this.videoPreview();
    if (url) URL.revokeObjectURL(url);
    this.videoPreview.set(null);
    this.videoFile = null;
  }

  /**
   * Get currency symbol for display
   */
  getCurrencySymbol(): string {
    const code = this.investmentForm.get('currency')?.value;
    return this.currencies.find(c => c.code === code)?.symbol || '$';
  }

  /**
   * Format number with currency
   */
  formatCurrency(value: number | null): string {
    if (!value) return '-';
    const symbol = this.getCurrencySymbol();
    return `${symbol}${value.toLocaleString()}`;
  }
}
