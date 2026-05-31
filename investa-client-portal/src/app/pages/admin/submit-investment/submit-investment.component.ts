import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { InvestmentService } from '../../../services/investment.service';
import { CreateInvestmentDto, BusinessCategory, BusinessStage, ProjectPhase } from '../../../models/api-response.model';
import { InvestmentType } from '../../../models/investment.model';

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
 * Submit Investment Component
 * 
 * Allows founders to create new investment opportunities with:
 * - Multi-step form wizard
 * - Comprehensive validations
 * - Real-time calculation of equity metrics
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

  // Form state
  investmentForm!: FormGroup;
  formValid = signal(false);
  currentStep = signal(1);
  totalSteps = 3;
  isSubmitting = signal(false);

  // Edit mode
  editingInvestmentId = signal<number | null>(null);
  editMode = computed(() => this.editingInvestmentId() !== null);
  pageTitle = computed(() => this.editMode() ? this.t('submitInvestment.editTitle') : this.t('submitInvestment.title'));
  submitButtonLabel = computed(() => this.editMode() ? this.t('submitInvestment.actions.save') : this.t('submitInvestment.actions.submit'));
  
  // Lookup data
  categories = signal<BusinessCategory[]>([]);
  stages = signal<BusinessStage[]>([]);
  phases = signal<ProjectPhase[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  // Static data
  readonly riskLevels = RISK_LEVELS;
  readonly currencies = CURRENCIES;
  readonly investmentTypes = [
    { id: InvestmentType.Founding, name: 'Founding Investment', nameAr: 'استثمار تأسيسي', description: 'Initial capital from founders', descriptionAr: 'تمويل مبدئي من المؤسسين' },
    { id: InvestmentType.Equity, name: 'Equity Crowdfunding', nameAr: 'تمويل جماعي مقابل أسهم', description: 'Share-based investment from multiple investors', descriptionAr: 'استثمار قائم على الأسهم من عدة مستثمرين' }
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
  // stepLabels holds translation keys; template will call `t()` to translate
  stepLabels = ['submitInvestment.step.businessDetails', 'submitInvestment.step.financialStructure', 'submitInvestment.step.reviewSubmit'];

  // helper to translate keys in templates and TS
  t(path: string) { return this.languageService.translate(path); }

  // Display helper for lookup items (categories, stages, phases, types, currencies)
  displayLookup(item: any): string {
    if (!item) return '';
    // Prefer explicit translation key if present
    if (item.key) return this.t(item.key);
    // If Arabic is active and an Arabic field exists, use it
    const dir = this.languageService.direction();
    if (dir === 'rtl') {
      if (item.valueAr) return item.valueAr;
      if (item.nameAr) return item.nameAr;
      if (item.descriptionAr) return item.descriptionAr;
    }
    // Fallback to common fields
    return item.value || item.name || item.description || '';
  }

  // Computed values for review step - needed because templates don't support arrow functions
  selectedCategoryName = computed(() => {
    const categoryId = this.investmentForm?.get('businessCategoryId')?.value;
    return this.displayLookup(this.categories().find(c => c.id === categoryId)) || '-';
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
    return this.displayLookup(this.investmentTypes.find(t => t.id === typeId)) || '-';
  });

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

    // Auto-update risk level when business stage changes
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
        this.loadError.set('Investment not found.');
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
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(5000)]],
      businessCategoryId: [null, [Validators.required]],
      businessStageId: [null, [Validators.required]],
      projectPhaseId: [null],
      milestone: ['', [Validators.maxLength(200)]],
      riskLevel: ['Medium', [Validators.required]],
      investmentTypeId: [InvestmentType.Equity, [Validators.required]],
      
      // Step 2: Financial Structure - Common
      initialCapital: [null, [Validators.required, Validators.min(1000)]],
      minInvestment: [null, [Validators.min(1)]],
      maxInvestment: [null, [Validators.min(1)]],
      currency: ['USD', [Validators.required]],
      targetFund: [null],
      
      // Equity-specific fields
      sharePrice: [null],
      totalShares: [null],
      valuationCap: [null, [Validators.min(1)]],
      
      // Founding-specific fields
      durationMonths: [null],
      profitPercentage: [null],
      payoutFrequency: ['Monthly'],
      expectedROI: [null, [Validators.min(0), Validators.max(1000)]],
      
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

    // Auto-calculate target fund for Equity type
    this.investmentForm.get('sharePrice')?.valueChanges.subscribe(() => {
      if (this.investmentForm.get('investmentTypeId')?.value === InvestmentType.Equity) {
        this.updateTargetFund();
      }
    });
    this.investmentForm.get('totalShares')?.valueChanges.subscribe(() => {
      if (this.investmentForm.get('investmentTypeId')?.value === InvestmentType.Equity) {
        this.updateTargetFund();
      }
    });
  }
  
  /**
   * Update field validators based on investment type
   */
  private updateValidatorsByType(typeId: InvestmentType): void {
    const sharePrice = this.investmentForm.get('sharePrice');
    const totalShares = this.investmentForm.get('totalShares');
    const valuationCap = this.investmentForm.get('valuationCap');
    const durationMonths = this.investmentForm.get('durationMonths');
    const profitPercentage = this.investmentForm.get('profitPercentage');
    const payoutFrequency = this.investmentForm.get('payoutFrequency');

    if (typeId === InvestmentType.Equity) {
      // Equity: require share fields
      sharePrice?.setValidators([Validators.required, Validators.min(1)]);
      totalShares?.setValidators([Validators.required, Validators.min(100)]);
      valuationCap?.setValidators([Validators.min(1)]);
      
      // Clear Founding validators
      durationMonths?.clearValidators();
      profitPercentage?.clearValidators();
      payoutFrequency?.clearValidators();
    } else {
      // Founding: require duration and profit fields
      durationMonths?.setValidators([Validators.required, Validators.min(1)]);
      profitPercentage?.setValidators([Validators.required, Validators.min(0.1), Validators.max(100)]);
      payoutFrequency?.setValidators([Validators.required]);
      
      // Clear Equity validators
      sharePrice?.clearValidators();
      totalShares?.clearValidators();
      valuationCap?.clearValidators();
    }

    // Update validity
    sharePrice?.updateValueAndValidity();
    totalShares?.updateValueAndValidity();
    valuationCap?.updateValueAndValidity();
    durationMonths?.updateValueAndValidity();
    profitPercentage?.updateValueAndValidity();
    payoutFrequency?.updateValueAndValidity();
  }

  /**
   * Update target fund based on share price and total shares
   */
  private updateTargetFund(): void {
    const sharePrice = this.investmentForm.get('sharePrice')?.value || 0;
    const totalShares = this.investmentForm.get('totalShares')?.value || 0;
    const targetFund = sharePrice * totalShares;
    this.investmentForm.patchValue({ targetFund }, { emitEvent: false });
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

    // Idea / MVP -> High
    if (hint.includes('idea') || hint.includes('mvp')) return 'High';

    // Startup / early -> Medium
    if (hint.includes('startup') || hint.includes('early')) return 'Medium';

    // Running / growth / scale / operational -> Low
    if (hint.includes('running') || hint.includes('operational') || hint.includes('growth') || hint.includes('scale')) return 'Low';

    // Default
    return 'Medium';
  }

  // Team members (client-side list). Backend endpoint to persist team members will be added separately.
  teamMembers = signal<{ mobile?: string; name?: string; role?: string; userId?: string }[]>([]);

  // Cover image upload state
  private investmentService = inject(InvestmentService);
  coverFile: File | null = null;
  coverPreview = signal<string | null>(null);
  isUploadingCover = signal(false);
  
  // Gallery images (up to 5)
  galleryFiles: File[] = [];
  galleryPreviews = signal<string[]>([]);
  readonly maxGalleryImages = 5;

  addTeamMember(): void {
    this.teamMembers.update(arr => [...arr, { mobile: '', name: '', role: '' }]);
  }

  updateTeamMember(index: number, field: 'mobile' | 'name' | 'role' | 'userId', value: string): void {
    this.teamMembers.update(arr => {
      const copy = [...arr];
      // mutate the existing member object to preserve its identity so the DOM element isn't replaced on each keystroke
      const existing = copy[index] || { mobile: '', name: '', role: '' };
      // assign the field directly
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
    // update mobile immediately
    this.updateTeamMember(index, 'mobile', value);
    // clear userId if user edited the mobile manually
    this.updateTeamMember(index, 'userId', '');

    // cancel previous timer for this index
    const prev = this.searchTimers.get(index);
    if (prev) clearTimeout(prev);

    // only search when 4+ digits
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 4) {
      // clear only this index's results
      const prev = { ...(this.searchResults() || {}) };
      if (prev[index]) {
        prev[index] = [];
        this.searchResults.set(prev);
      }
      // clear searching flag for this index
      const prevSearch = { ...(this.isSearchingMap() || {}) };
      prevSearch[index] = false;
      this.isSearchingMap.set(prevSearch);
      if (this.activeSearchIndex() === index) {
        this.activeSearchIndex.set(null);
      }
      return;
    }

    // debounce 350ms
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

    // user expected to have firstName, lastName, mobileNumber, and id/userId
    this.updateTeamMember(index, 'mobile', user.mobileNumber || user.phone || user.mobile || user.phoneNumber || '');
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.fullName || user.displayName || '';
    this.updateTeamMember(index, 'name', displayName);
    const userId = user.userId || user.id;
    if (userId) this.updateTeamMember(index, 'userId', String(userId));
    // close dropdown for this index
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

      if (memberId) {
        if (seenIds.has(memberId)) return true;
        seenIds.add(memberId);
      }

      if (memberMobile) {
        if (seenMobiles.has(memberMobile)) return true;
        seenMobiles.add(memberMobile);
      }
    }

    return false;
  }

  removeTeamMember(index: number): void {
    this.teamMembers.update(arr => arr.filter((_, i) => i !== index));
  }

  /**
   * Load lookup data from API (categories, stages, phases)
   */
  async loadLookupData(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const [categories, stages, phases] = await Promise.all([
        this.apiService.getBusinessCategories(),
        this.apiService.getBusinessStages(),
        this.apiService.getProjectPhases()
      ]);

      this.categories.set(categories);
      this.stages.set(stages);
      this.phases.set(phases);

      // If a stage is already selected (e.g., returning to the form), recompute the risk level
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
    // Can only go back or to already validated steps
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
        fieldsToValidate = ['businessName', 'description', 'businessCategoryId', 'businessStageId', 'riskLevel'];
        break; // Team members are validated below (must be registered users)

      case 2:
        fieldsToValidate = ['initialCapital', 'sharePrice', 'totalShares', 'currency', 'investmentTypeId', 'startDate'];
        break;
      case 3:
        return this.investmentForm.valid;
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

  /**
   * Submit the investment opportunity
   */
  async onSubmit(): Promise<void> {
    if (!this.investmentForm.valid) {
      this.notificationService.showToast({
        title: 'Validation Error',
        message: 'Please correct all errors before submitting.',
        type: 'error'
      });
      return;
    }

    // Validate team members before submit: all must have a mobile number
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
      
      // Build the DTO
      const dto: CreateInvestmentDto = {
        businessName: formValue.businessName.trim(),
        description: formValue.description.trim(),
        businessCategoryId: formValue.businessCategoryId,
        businessStageId: formValue.businessStageId,
        projectPhaseId: formValue.projectPhaseId || undefined,
        milestone: formValue.milestone?.trim() || undefined,
        riskLevel: formValue.riskLevel,
        
        initialCapital: formValue.initialCapital,
        sharePrice: formValue.sharePrice,
        totalShares: formValue.totalShares,
        targetFund: formValue.targetFund || (formValue.sharePrice * formValue.totalShares),
        minInvestment: formValue.minInvestment || undefined,
        maxInvestment: formValue.maxInvestment || undefined,
        valuationCap: formValue.valuationCap || undefined,
        expectedROI: formValue.expectedROI || undefined,
        currency: formValue.currency,
        investmentTypeId: formValue.investmentTypeId,
        durationMonths: formValue.durationMonths || undefined,
        profitPercentage: formValue.profitPercentage || undefined,
        payoutFrequency: formValue.payoutFrequency || undefined,
        
        startDate: formValue.startDate,
        endDate: formValue.endDate || undefined,
        
        imageUrl: formValue.imageUrl?.trim() || undefined,
        videoUrl: formValue.videoUrl?.trim() || undefined
      };

      // Submit to API (create or update)
      const editId = this.editingInvestmentId();
      const result = editId
        ? await this.apiService.updateInvestment(editId, dto)
        : await this.apiService.createInvestment(dto);

      // Resolve the investment id — PUT may return 204 (null body), so fall back to editId.
      const investmentId: number = result?.id ?? editId!;

      // If a cover file was selected, upload it to InvestafileStore and save the file URL to the investment record.
      if (this.coverFile) {
        this.isUploadingCover.set(true);
        try {
          const coverUrl = await this.investmentService.uploadProjectImage(investmentId, this.coverFile);
          await this.apiService.updateInvestment(investmentId, { ...dto, imageUrl: coverUrl });
        } catch (err) {
          console.error('Cover upload failed', err);
          this.notificationService.showToast({
            title: 'Warning',
            message: 'Cover image upload failed. Investment saved without cover.',
            type: 'warning'
          });
        } finally {
          this.isUploadingCover.set(false);
        }
      }

      // Upload gallery images (if any) through backend as before
      if (this.galleryFiles.length > 0) {
        this.isUploadingCover.set(true);
        try {
          const uploadPromises = this.galleryFiles.map(f => this.investmentService.uploadInvestmentImage(investmentId, f));
          const settled = await Promise.allSettled(uploadPromises);
          const failed = settled.filter(s => s.status === 'rejected');
          if (failed.length) {
            this.notificationService.showToast({ title: 'Warning', message: `${failed.length} gallery image(s) failed to upload.`, type: 'warning' });
          }
        } catch (e) {
          console.error('Gallery upload error', e);
          this.notificationService.showToast({ title: 'Warning', message: 'Failed to upload gallery images.', type: 'warning' });
        } finally {
          this.isUploadingCover.set(false);
        }
      }

      // Success notification
      this.notificationService.showToast({
        title: 'Success!',
        message: editId ? 'Investment updated successfully.' : 'Your investment opportunity has been created successfully.',
        type: 'success'
      });

      // Add to notification center
      this.notificationService.addNotification({
        title: editId ? 'Investment Updated' : 'Investment Created',
        message: editId
          ? `"${dto.businessName}" has been updated.`
          : `"${dto.businessName}" is now live and visible to investors.`,
        type: 'success'
      });

      // Navigate to the investment detail
      this.router.navigate(['/admin/investments', investmentId]);

    } catch (error) {
      console.error('Error saving investment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create investment. Please try again.';
      
      this.notificationService.showToast({
        title: 'Error',
        message: errorMsg,
        type: 'error'
      });
    } finally {
      this.isSubmitting.set(false);
    }
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

    // Accept only images
    if (!file.type.startsWith('image/')) {
      this.notificationService.showToast({ title: 'Invalid File', message: 'Please select an image file.', type: 'warning' });
      return;
    }

    this.coverFile = file;
    // Create preview URL
    const url = URL.createObjectURL(file);
    this.coverPreview.set(url);
    // Clear any manual URL field to avoid confusion
    this.investmentForm.patchValue({ imageUrl: '' });
  }

  removeCover(): void {
    const url = this.coverPreview();
    if (url) URL.revokeObjectURL(url);
    this.coverPreview.set(null);
    this.coverFile = null;
  }

  /** Handle multiple gallery image selection (max 5) */
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

    // Clear input value so selecting same file again triggers change
    if (input) input.value = '';
  }

  removeGalleryImage(index: number): void {
    const previews = this.galleryPreviews();
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);

    // remove from previews and files
    this.galleryPreviews.update(arr => arr.filter((_, i) => i !== index));
    this.galleryFiles.splice(index, 1);
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
