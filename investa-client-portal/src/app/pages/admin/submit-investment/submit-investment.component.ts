import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
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
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' }
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
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class SubmitInvestmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);

  // Form state
  investmentForm!: FormGroup;
  currentStep = signal(1);
  totalSteps = 3;
  isSubmitting = signal(false);
  
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
    { id: InvestmentType.Founding, name: 'Founding Investment', description: 'Initial capital from founders' },
    { id: InvestmentType.Equity, name: 'Equity Crowdfunding', description: 'Share-based investment from multiple investors' }
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
  stepLabels = ['Business Details', 'Financial Structure', 'Review & Submit'];

  // Computed values for review step - needed because templates don't support arrow functions
  selectedCategoryName = computed(() => {
    const categoryId = this.investmentForm?.get('businessCategoryId')?.value;
    return this.categories().find(c => c.id === categoryId)?.value || '-';
  });

  selectedStageName = computed(() => {
    const stageId = this.investmentForm?.get('businessStageId')?.value;
    return this.stages().find(s => s.id === stageId)?.value || '-';
  });

  selectedPhaseName = computed(() => {
    const phaseId = this.investmentForm?.get('projectPhaseId')?.value;
    return this.phases().find(p => p.id === phaseId)?.value || '-';
  });

  selectedInvestmentTypeName = computed(() => {
    const typeId = this.investmentForm?.get('investmentTypeId')?.value;
    return this.investmentTypes.find(t => t.id === typeId)?.name || '-';
  });

  ngOnInit(): void {
    this.initForm();
    this.loadLookupData();

    // Auto-update risk level when business stage changes
    const stageControl = this.investmentForm.get('businessStageId');
    stageControl?.valueChanges.subscribe(id => {
      const stage = this.stages().find(s => s.id === id);
      const computed = this.computeRiskFromStage(stage);
      this.investmentForm.get('riskLevel')?.setValue(computed, { emitEvent: false });
    });
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
      
      // Step 2: Financial Structure
      initialCapital: [null, [Validators.required, Validators.min(1000)]],
      sharePrice: [null, [Validators.required, Validators.min(1)]],
      totalShares: [null, [Validators.required, Validators.min(100)]],
      targetFund: [null],
      minInvestment: [null, [Validators.min(1)]],
      maxInvestment: [null, [Validators.min(1)]],
      valuationCap: [null, [Validators.min(1)]],
      expectedROI: [null, [Validators.min(0), Validators.max(1000)]],
      currency: ['USD', [Validators.required]],
      investmentTypeId: [InvestmentType.Equity, [Validators.required]],
      
      // Timeline
      startDate: ['', [Validators.required]],
      endDate: [''],
      
      // Media (optional)
      imageUrl: ['', [this.urlValidator]],
      videoUrl: ['', [this.urlValidator]]
    }, {
      validators: [this.minMaxInvestmentValidator, this.dateRangeValidator]
    });

    // Auto-calculate target fund when share price or total shares change
    this.investmentForm.get('sharePrice')?.valueChanges.subscribe(() => this.updateTargetFund());
    this.investmentForm.get('totalShares')?.valueChanges.subscribe(() => this.updateTargetFund());
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
  teamMembers = signal<{ userId?: string; name?: string; role?: string }[]>([]);

  addTeamMember(): void {
    this.teamMembers.update(arr => [...arr, { userId: '', name: '', role: '' }]);
  }

  updateTeamMember(index: number, field: 'userId' | 'name' | 'role', value: string): void {
    this.teamMembers.update(arr => {
      const copy = [...arr];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
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

    // Additional check: ensure team members (if any) are registered users with a userId
    if (step === 1 && this.teamMembers().length > 0) {
      const invalidMember = this.teamMembers().find(tm => !tm.userId || tm.userId.trim() === '');
      if (invalidMember) {
        this.notificationService.showToast({
          title: 'Team Members',
          message: 'All team members must be registered users. Please provide a User ID for each member or remove anonymous entries.',
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

    // Validate team members before submit: all must have a User ID (registered users)
    if (this.teamMembers().length > 0 && this.teamMembers().some(tm => !tm.userId || tm.userId.trim() === '')) {
      this.notificationService.showToast({
        title: 'Team Members',
        message: 'Please ensure all team members have a valid User ID or remove anonymous entries before submitting.',
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
        
        startDate: formValue.startDate,
        endDate: formValue.endDate || undefined,
        
        imageUrl: formValue.imageUrl?.trim() || undefined,
        videoUrl: formValue.videoUrl?.trim() || undefined
      };

      // Submit to API
      const result = await this.apiService.createInvestment(dto);

      // Success notification
      this.notificationService.showToast({
        title: 'Success!',
        message: 'Your investment opportunity has been created successfully.',
        type: 'success'
      });

      // Add to notification center
      this.notificationService.addNotification({
        title: 'Investment Created',
        message: `"${dto.businessName}" is now live and visible to investors.`,
        type: 'success'
      });

      // Navigate to the new investment or investments list
      this.router.navigate(['/admin/investments', result.id]);

    } catch (error) {
      console.error('Error creating investment:', error);
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
