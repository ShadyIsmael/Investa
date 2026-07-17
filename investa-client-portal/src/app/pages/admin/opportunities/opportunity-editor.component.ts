import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Opportunity, OpportunityDocument, OpportunityEvent, OpportunityLookup, OpportunityMedia, OpportunityService, OpportunityUpsert } from '../../../services/opportunity.service';
import { NotificationService } from '../../../services/notification.service';
import { FileStoreFile, FileStoreService } from '../../../services/file-store.service';
import { WalletService } from '../../../services/wallet.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

type PendingUploadKind = 'cover' | 'gallery' | 'video' | 'publicDocument' | 'privateDocument';

interface PendingUpload {
  id: number;
  kind: PendingUploadKind;
  category: string;
  file: File;
}

type OpportunityLookupKind = 'categories' | 'tags' | 'fundingGoals';

interface OpportunityEditorFormValue {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string | number | null;
  projectStage: number | null;
  investmentModel: number | null;
  fundingGoalId: string | number | null;
  fundingTarget: number | null;
  minimumInvestment: number | null;
  maximumInvestment: number | null;
  expectedDuration: number | null;
  profitSharingPayoutFrequency: string;
  profitSharingContractStartDate: string;
  profitSharingContractEndDate: string;
  coverImageUrl: string;
  currency: string;
  sharePrice: number | null;
  totalShares: number | null;
  offeredShares: number | null;
  equityOfferedPercentage: number | null;
  interestRate: number | null;
  repaymentFrequency: string;
  finalRepaymentDate: string;
  profitSharePercentage: number | null;
  exitTerms: string;
  fundingUsage: string;
  risks: string;
  exitStrategy: string;
}

@Component({
  standalone: true,
  selector: 'app-opportunity-editor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './opportunity-editor.component.html',
  styleUrls: ['./opportunity-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityEditorComponent {
  private service = inject(OpportunityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private fileStore = inject(FileStoreService);
  private fb = inject(FormBuilder);
  private walletService = inject(WalletService);
  private languageService = inject(LanguageService);
  readonly direction = this.languageService.direction;
  readonly language = this.languageService.language;

  // Investment Model enum values from backend
  readonly InvestmentModel = {
    Equity: 1,
    CapitalContributionProfitSharing: 2,
    LoanInvestment: 3
  };

  readonly payoutFrequencies = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'At Maturity'] as const;
  readonly currencies = ['USD', 'EUR', 'SAR', 'EGP'] as const;
  readonly uploadKinds: readonly PendingUploadKind[] = ['cover', 'gallery', 'video', 'publicDocument', 'privateDocument'];
  readonly projectStages = [1, 2, 3, 4, 5] as const;
  readonly wizardSteps = [
    { id: 1, key: 'details' },
    { id: 2, key: 'funding' },
    { id: 3, key: 'media' },
    { id: 4, key: 'review' }
  ] as const;

  step = signal(1);
  isLoading = signal(false);
  isSaving = signal(false);
  savingMode = signal<'draft' | 'publish' | null>(null);
  errorMessage = signal<string | null>(null);
  stepErrorMessage = signal<string | null>(null);
  categories = signal<OpportunityLookup[]>([]);
  tags = signal<OpportunityLookup[]>([]);
  fundingGoals = signal<OpportunityLookup[]>([]);
  selectedTags = signal<Array<string | number>>([]);
  pendingUploads = signal<PendingUpload[]>([]);
  uploadedFiles = signal<FileStoreFile[]>([]);
  existingMedia = signal<OpportunityMedia[]>([]);
  existingDocuments = signal<OpportunityDocument[]>([]);
  existingEvents = signal<OpportunityEvent[]>([]);
  isUploading = signal(false);
  uploadMessage = signal<string | null>(null);
  fileStoreCategories = signal<string[]>([]);
  editId = this.route.snapshot.paramMap.get('id');
  isEdit = computed(() => !!this.editId);
  existingStatus = signal<string | number | null>(null);
  canPublish = computed(() => !this.isEdit() || ['1', 'draft'].includes(String(this.existingStatus() ?? '').trim().toLowerCase()));

  // Reactive Form
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      shortDescription: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(300)]],
      fullDescription: ['', [Validators.maxLength(4000)]],
      categoryId: [null],
      projectStage: [null, [Validators.required]],
      investmentModel: [null, [Validators.required]],
      fundingGoalId: [null],
      fundingTarget: [null, [Validators.required, Validators.min(1)]],
      minimumInvestment: [null, [Validators.min(1)]],
      maximumInvestment: [null],
      expectedDuration: [null],
      profitSharingPayoutFrequency: [''],
      profitSharingContractStartDate: [''],
      profitSharingContractEndDate: [''],
      coverImageUrl: ['', [Validators.maxLength(1000)]],
      // Equity-specific fields
      currency: [''],
      sharePrice: [null],
      totalShares: [null],
      offeredShares: [null],
      equityOfferedPercentage: [null, [Validators.min(0), Validators.max(100)]],
      // Loan-specific fields
      interestRate: [null, [Validators.min(0), Validators.max(100)]],
      repaymentFrequency: [''],
      finalRepaymentDate: [''],
      // Profit Sharing-specific fields
      profitSharePercentage: [null, [Validators.min(0), Validators.max(100)]],
      exitTerms: [''],
      // Common optional fields
      fundingUsage: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(2000)]],
      risks: [''],
      exitStrategy: ['']
    });

    // Listen for investment model changes to clear incompatible fields
    this.form.get('investmentModel')?.valueChanges.subscribe(model => {
      this.onInvestmentModelChange(model);
    });
    this.form.get('totalShares')?.valueChanges.subscribe(() => this.updateEquityPercentage());
    this.form.get('offeredShares')?.valueChanges.subscribe(() => this.updateEquityPercentage());

    this.load();
  }

  async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      const [categories, tags, fundingGoals] = await Promise.all([
        this.service.getCategories(),
        this.service.getTags(),
        this.service.getFundingGoals()
      ]);
      this.fileStore.getCategories().then(items => this.fileStoreCategories.set(items)).catch(() => this.fileStoreCategories.set([]));
      this.categories.set(categories);
      this.tags.set(tags);
      this.fundingGoals.set(fundingGoals);
      if (this.editId) {
        const existing = await this.service.getFounderOpportunity(this.editId);
        this.existingStatus.set(existing.status ?? null);
        const mapped = this.mapOpportunityToForm(existing);
        this.updateValidatorsByModel(mapped.investmentModel);
        this.form.patchValue(mapped, { emitEvent: false });
        this.selectedTags.set(this.mapTagIds(existing.tags ?? []));
        this.existingMedia.set(existing.media ?? []);
        this.existingDocuments.set(existing.documents ?? []);
        this.existingEvents.set(existing.events ?? []);
      }
    } catch (error: unknown) {
      this.errorMessage.set(this.errorText(error, 'opportunityEditor.errors.load'));
    } finally {
      this.isLoading.set(false);
    }
  }

  private formatDateForInput(value: string | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (typeof value === 'string') {
      const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateOnly) return dateOnly[1] ?? '';
    }
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private mapOpportunityToForm(existing: Opportunity): OpportunityEditorFormValue {
    return {
      title: existing.title ?? '',
      shortDescription: existing.shortDescription ?? '',
      fullDescription: existing.description ?? '',
      categoryId: existing.category?.id ?? null,
      projectStage: this.mapProjectStageToEnum(existing.projectStage),
      investmentModel: this.mapInvestmentModelToEnum(existing.investmentModel),
      fundingGoalId: existing.fundingGoal?.id ?? null,
      fundingTarget: this.toNullableNumber(existing.fundingTarget),
      minimumInvestment: this.toNullableNumber(existing.minimumInvestmentAmount),
      maximumInvestment: this.toNullableNumber(existing.maximumInvestmentAmount),
      expectedDuration: this.toNullableNumber(existing.expectedDurationMonths),
      profitSharingPayoutFrequency: existing.profitSharingPayoutFrequency ?? '',
      profitSharingContractStartDate: this.formatDateForInput(existing.profitSharingContractStartDate),
      profitSharingContractEndDate: this.formatDateForInput(existing.profitSharingContractEndDate),
      coverImageUrl: existing.coverImageUrl ?? '',
      currency: existing.currency ?? '',
      sharePrice: this.toNullableNumber(existing.sharePrice),
      totalShares: this.toNullableNumber(existing.totalShares),
      offeredShares: this.toNullableNumber(existing.offeredShares),
      equityOfferedPercentage: this.toNullableNumber(existing.equityOfferedPercentage),
      interestRate: this.toNullableNumber(existing.interestRate),
      repaymentFrequency: existing.repaymentFrequency ?? '',
      finalRepaymentDate: this.formatDateForInput(existing.finalRepaymentDate),
      profitSharePercentage: this.toNullableNumber(existing.profitSharePercentage),
      fundingUsage: existing.useOfFunds ?? '',
      // These three controls are draft-only UI notes and are intentionally absent
      // from both the Opportunity DTO and the update payload.
      exitTerms: '',
      risks: '',
      exitStrategy: ''
    };
  }

  private mapTagIds(values: Array<string | OpportunityLookup>): Array<string | number> {
    const ids = values
      .map(value => {
        if (typeof value !== 'string') return value.id;
        const normalized = value.trim();
        const reference = this.tags().find(tag =>
          [tag.id, tag.name, tag.value, tag.label, tag.key]
            .some(candidate => candidate !== null && candidate !== undefined && String(candidate) === normalized)
        );
        if (reference) return reference.id;
        return /^\d+$/.test(normalized) ? normalized : null;
      })
      .filter((value): value is string | number => value !== null && value !== undefined);

    return ids.filter((value, index) => ids.findIndex(candidate => String(candidate) === String(value)) === index);
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  /**
   * Map string investment model to enum value
   */
  private mapInvestmentModelToEnum(model?: string | number | null): number | null {
    if (!model) return null;
    const modelStr = String(model).toLowerCase();
    if (modelStr === 'equity' || modelStr === '1') return this.InvestmentModel.Equity;
    if (modelStr === 'capitalcontributionprofitsharing' || modelStr === 'profitsharing' || modelStr === '2') return this.InvestmentModel.CapitalContributionProfitSharing;
    if (modelStr === 'loaninvestment' || modelStr === 'loan' || modelStr === '3') return this.InvestmentModel.LoanInvestment;
    return null;
  }

  /**
   * Check if current model is Equity
   */
  isEquityModel(): boolean {
    return this.form.get('investmentModel')?.value === this.InvestmentModel.Equity;
  }

  /**
   * Check if current model is Loan
   */
  isLoanModel(): boolean {
    return this.form.get('investmentModel')?.value === this.InvestmentModel.LoanInvestment;
  }

  /**
   * Check if current model is Profit Sharing
   */
  isProfitSharingModel(): boolean {
    return this.form.get('investmentModel')?.value === this.InvestmentModel.CapitalContributionProfitSharing;
  }

  /**
   * Clear incompatible fields when investment model changes
   */
  private onInvestmentModelChange(model: number | null): void {
    // Clear all model-specific fields first
    this.form.patchValue({
      equityOfferedPercentage: null,
      currency: '',
      sharePrice: null,
      totalShares: null,
      offeredShares: null,
      interestRate: null,
      repaymentFrequency: '',
      finalRepaymentDate: '',
      profitSharePercentage: null,
      profitSharingPayoutFrequency: '',
      profitSharingContractStartDate: '',
      profitSharingContractEndDate: '',
      exitTerms: ''
    });

    // Re-apply validators based on new model
    this.updateValidatorsByModel(model);
  }

  /**
   * Update field validators based on investment model
   */
  private updateValidatorsByModel(model: number | null): void {
    const equityFields = ['currency', 'sharePrice', 'totalShares', 'offeredShares', 'equityOfferedPercentage'];
    const loanFields = ['interestRate', 'repaymentFrequency', 'finalRepaymentDate'];
    const profitSharingFields = ['profitSharePercentage', 'profitSharingPayoutFrequency', 'profitSharingContractStartDate', 'profitSharingContractEndDate', 'exitTerms'];

    // Clear all model-specific validators
    [...equityFields, ...loanFields, ...profitSharingFields].forEach(field => {
      this.form.get(field)?.clearValidators();
      this.form.get(field)?.updateValueAndValidity();
    });
    this.form.get('expectedDuration')?.clearValidators();

    // Apply validators for current model
    if (model === this.InvestmentModel.Equity) {
      this.form.get('currency')?.setValidators([Validators.required]);
      this.form.get('sharePrice')?.setValidators([Validators.required, Validators.min(0.01)]);
      this.form.get('totalShares')?.setValidators([Validators.required, Validators.min(1)]);
      this.form.get('offeredShares')?.setValidators([Validators.required, Validators.min(1)]);
      this.form.get('equityOfferedPercentage')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
    } else if (model === this.InvestmentModel.LoanInvestment) {
      this.form.get('expectedDuration')?.setValidators([Validators.required, Validators.min(1)]);
      this.form.get('interestRate')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      this.form.get('repaymentFrequency')?.setValidators([Validators.required]);
      this.form.get('finalRepaymentDate')?.setValidators([Validators.required]);
    } else if (model === this.InvestmentModel.CapitalContributionProfitSharing) {
      this.form.get('profitSharePercentage')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      this.form.get('profitSharingPayoutFrequency')?.setValidators([Validators.required]);
    }

    // Update validity for affected fields
    [...equityFields, ...loanFields, ...profitSharingFields].forEach(field => {
      this.form.get(field)?.updateValueAndValidity();
    });
    this.form.get('expectedDuration')?.updateValueAndValidity();
  }

  private updateEquityPercentage(): void {
    const totalShares = Number(this.form.get('totalShares')?.value);
    const offeredShares = Number(this.form.get('offeredShares')?.value);
    const percentage = Number.isFinite(totalShares) && totalShares > 0 && Number.isFinite(offeredShares) && offeredShares > 0
      ? Math.round((offeredShares * 100 / totalShares) * 100) / 100
      : null;
    this.form.get('equityOfferedPercentage')?.setValue(percentage, { emitEvent: false });
  }

  /**
   * Validate current step before proceeding
   */
  private validateCurrentStep(): boolean {
    this.stepErrorMessage.set(null);
    const currentStep = this.step();
    const form = this.form;
    const invalidFields: string[] = [];

    if (currentStep === 1) {
      // Step 1: Basic info
      form.get('title')?.markAsTouched();
      form.get('shortDescription')?.markAsTouched();
      form.get('projectStage')?.markAsTouched();
      if (form.get('title')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.titleRequired'));
      if (form.get('shortDescription')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.shortDescriptionRequired'));
      if (form.get('projectStage')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.projectStageRequired'));
    } else if (currentStep === 2) {
      // Step 2: Funding basics
      ['investmentModel', 'fundingTarget', 'minimumInvestment'].forEach(field => form.get(field)?.markAsTouched());
      if (form.get('investmentModel')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.investmentModelRequired'));
      if (form.get('fundingTarget')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.fundingTargetPositive'));
      if (form.get('minimumInvestment')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.minimumInvestmentPositive'));
      form.get('fundingUsage')?.markAsTouched();
      if (form.get('fundingUsage')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.useOfFundsRequired'));
      
      // Model-specific validation
      const model = form.get('investmentModel')?.value;
      if (model === this.InvestmentModel.Equity) {
        ['currency', 'sharePrice', 'totalShares', 'offeredShares', 'equityOfferedPercentage'].forEach(field => form.get(field)?.markAsTouched());
        if (form.get('equityOfferedPercentage')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.equityRequired'));
        if (['currency', 'sharePrice', 'totalShares', 'offeredShares'].some(field => form.get(field)?.invalid)) invalidFields.push(this.t('opportunityEditor.validation.equityConfigurationRequired'));
        const sharePrice = Number(form.get('sharePrice')?.value);
        const minimum = Number(form.get('minimumInvestment')?.value);
        if (minimum > 0 && sharePrice > 0 && Math.abs(minimum / sharePrice - Math.round(minimum / sharePrice)) > 0.000001) invalidFields.push(this.t('opportunityEditor.validation.minimumShareAligned'));
      } else if (model === this.InvestmentModel.LoanInvestment) {
        ['expectedDuration', 'interestRate', 'repaymentFrequency', 'finalRepaymentDate'].forEach(field => form.get(field)?.markAsTouched());
        if (form.get('expectedDuration')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.loanDurationRequired'));
        if (form.get('interestRate')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.interestRateRequired'));
        if (form.get('repaymentFrequency')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.repaymentFrequencyRequired'));
        if (form.get('finalRepaymentDate')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.finalRepaymentDateRequired'));
        const repaymentDate = form.get('finalRepaymentDate')?.value;
        if (repaymentDate && new Date(repaymentDate) <= new Date()) invalidFields.push(this.t('opportunityEditor.validation.finalRepaymentDateFuture'));
      } else if (model === this.InvestmentModel.CapitalContributionProfitSharing) {
        ['profitSharePercentage', 'profitSharingPayoutFrequency', 'profitSharingContractStartDate', 'profitSharingContractEndDate'].forEach(field => form.get(field)?.markAsTouched());
        if (form.get('profitSharePercentage')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.profitShareRequired'));
        if (form.get('profitSharingPayoutFrequency')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.payoutFrequencyRequired'));
        if (!this.hasProfitSharingDurationOrDates()) invalidFields.push(this.t('opportunityEditor.validation.durationOrDatesRequired'));
        if (form.get('profitSharingContractStartDate')?.value && form.get('profitSharingContractEndDate')?.value && new Date(form.get('profitSharingContractStartDate')?.value) >= new Date(form.get('profitSharingContractEndDate')?.value)) invalidFields.push(this.t('opportunityEditor.validation.endAfterStart'));
      }
    }
    // Step 3 and 4 have no required validation

    if (invalidFields.length > 0) {
      this.stepErrorMessage.set(invalidFields.join('. '));
      return false;
    }
    return true;
  }

  next(): void {
    if (!this.validateCurrentStep()) return;
    this.step.update(value => Math.min(4, value + 1));
  }

  back(): void {
    this.step.update(value => Math.max(1, value - 1));
  }

  goToStep(target: number): void {
    if (target <= this.step()) {
      this.step.set(Math.max(1, target));
      this.stepErrorMessage.set(null);
      return;
    }
    if (target === this.step() + 1) this.next();
  }

  isStepCompleted(stepId: number): boolean {
    return stepId < this.step();
  }

  isStepInvalid(stepId: number): boolean {
    const names = stepId === 1
      ? ['title', 'shortDescription', 'projectStage']
      : stepId === 2
        ? ['investmentModel', 'fundingTarget', 'minimumInvestment', 'currency', 'sharePrice', 'totalShares', 'offeredShares', 'equityOfferedPercentage', 'expectedDuration', 'interestRate', 'repaymentFrequency', 'finalRepaymentDate', 'profitSharePercentage', 'profitSharingPayoutFrequency']
        : [];
    return names.some(name => {
      const control = this.form.get(name);
      return !!control?.touched && control.invalid;
    });
  }

  isControlInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  toggleTag(id: string | number): void {
    this.selectedTags.update(current => current.some(item => String(item) === String(id))
      ? current.filter(item => String(item) !== String(id))
      : [...current, id]
    );
  }

  isTagSelected(id: string | number): boolean {
    return this.selectedTags().some(item => String(item) === String(id));
  }

  async save(submit = false): Promise<void> {
    try {
      this.isSaving.set(true);
      this.savingMode.set(submit ? 'publish' : 'draft');
      this.errorMessage.set(null);
      const publishErrors = submit ? this.publishValidationErrors() : [];
      if (submit && (!this.validateCurrentStep() || this.form.invalid || publishErrors.length > 0)) {
        this.form.markAllAsTouched();
        this.stepErrorMessage.set(publishErrors.length ? publishErrors.join(' ') : this.t('opportunityEditor.validation.reviewInvalid'));
        return;
      }
      const payload = this.buildPayload();
      const saved = this.editId
        ? await this.service.updateOpportunity(this.editId, payload)
        : await this.service.createOpportunity(payload);
      if (submit) {
        const quote = await this.walletService.getPaidActionQuote('PublishOpportunity');
        if (!quote.hasSufficientCredit) {
          throw new Error(this.t('paidActions.insufficientMessage').replace('{required}', this.formatCredits(quote.creditCost)).replace('{balance}', this.formatCredits(quote.currentBalance)));
        }
        if (!window.confirm(this.t('opportunityPublish.confirmation').replace('{action}', this.t('opportunityPublish.action')).replace('{cost}', this.formatCredits(quote.creditCost)).replace('{balance}', this.formatCredits(quote.currentBalance)).replace('{after}', this.formatCredits(quote.balanceAfter)))) {
          return;
        }
        await this.service.publishOpportunity(saved.id);
      }
      this.notifications.showToast({ title: submit ? this.t('opportunityPublish.successTitle') : this.t('opportunityEditor.savedTitle'), message: submit ? this.t('opportunityPublish.successMessage') : this.t('opportunityEditor.savedMessage'), type: 'success' });
      this.router.navigate(['/admin/my-opportunities']);
    } catch (error: unknown) {
      const message = this.errorText(error, submit ? 'opportunityPublish.failureMessage' : 'opportunityEditor.saveFailureMessage');
      this.errorMessage.set(message);
      this.notifications.showToast({ title: this.t(submit ? 'opportunityPublish.failureTitle' : 'opportunityEditor.saveFailureTitle'), message, type: 'error' });
    } finally {
      this.isSaving.set(false);
      this.savingMode.set(null);
    }
  }

  /**
   * Map enum value to investment model string for API
   */
  private mapEnumToInvestmentModel(modelValue: number | null): string {
    if (modelValue === this.InvestmentModel.Equity) return 'Equity';
    if (modelValue === this.InvestmentModel.CapitalContributionProfitSharing) return 'CapitalContributionProfitSharing';
    if (modelValue === this.InvestmentModel.LoanInvestment) return 'LoanInvestment';
    return '';
  }

  investmentModelKey(): string {
    const model = this.form.get('investmentModel')?.value;
    if (model === this.InvestmentModel.Equity) return 'opportunityEditor.models.equity';
    if (model === this.InvestmentModel.CapitalContributionProfitSharing) return 'opportunityEditor.models.profitSharing';
    if (model === this.InvestmentModel.LoanInvestment) return 'opportunityEditor.models.loan';
    return 'opportunityEditor.review.notAvailable';
  }

  projectStageKey(value: unknown): string {
    const stage = this.mapProjectStageToEnum(value);
    return stage ? `opportunityEditor.projectStages.${stage}` : 'opportunityEditor.review.notAvailable';
  }

  payoutFrequencyKey(value: string): string {
    const keys: Record<string, string> = {
      'Monthly': 'monthly',
      'Quarterly': 'quarterly',
      'Semi-Annually': 'semiAnnually',
      'Annually': 'annually',
      'At Maturity': 'atMaturity'
    };
    return `opportunityEditor.payoutFrequencies.${keys[value] ?? 'unknown'}`;
  }

  lookupLabel(items: OpportunityLookup[], id: string | number | null | undefined, kind: OpportunityLookupKind): string {
    const item = items.find(candidate => String(candidate.id) === String(id));
    return item ? this.localizedLookupLabel(item, kind) : this.t('opportunityEditor.review.notAvailable');
  }

  selectedTagLabels(): string {
    const labels = this.tags()
      .filter(tag => this.isTagSelected(tag.id))
      .map(tag => this.localizedLookupLabel(tag, 'tags'));
    return labels.length ? labels.join(', ') : this.t('opportunityEditor.review.notAvailable');
  }

  westernNumber(value: unknown): string {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric) : this.t('opportunityEditor.review.notAvailable');
  }

  existingMediaName(item: OpportunityMedia): string {
    return item.caption?.trim()
      || item.originalFileName?.trim()
      || item.fileName?.trim()
      || this.t('opportunityEditor.media.unnamedMedia');
  }

  existingDocumentName(item: OpportunityDocument): string {
    return item.title?.trim()
      || item.name?.trim()
      || item.originalFileName?.trim()
      || item.fileName?.trim()
      || this.t('opportunityEditor.media.unnamedDocument');
  }

  existingEventName(item: OpportunityEvent): string {
    return item.title?.trim() || this.t('opportunityEditor.media.untitledEvent');
  }

  existingEventDate(item: OpportunityEvent): string {
    return this.formatDateForInput(item.eventDate ?? item.date ?? item.createdAt);
  }

  private buildPayload(): OpportunityUpsert {
    const value = this.form.getRawValue();
    return {
      title: value.title,
      shortDescription: value.shortDescription,
      fullDescription: value.fullDescription,
      categoryId: value.categoryId,
      projectStage: value.projectStage,
      tagIds: this.selectedTags(),
      investmentModel: this.mapEnumToInvestmentModel(value.investmentModel),
      fundingGoalId: value.fundingGoalId,
      fundingTarget: value.fundingTarget,
      minimumInvestment: value.minimumInvestment,
      maximumInvestment: value.maximumInvestment,
      expectedDurationMonths: value.expectedDuration,
      currency: value.currency || null,
      sharePrice: value.sharePrice,
      totalShares: value.totalShares,
      offeredShares: value.offeredShares,
      profitSharePercentage: value.profitSharePercentage,
      profitSharingPayoutFrequency: value.profitSharingPayoutFrequency || null,
      profitSharingContractStartDate: value.profitSharingContractStartDate || null,
      profitSharingContractEndDate: value.profitSharingContractEndDate || null,
      coverImageUrl: value.coverImageUrl,
      equityOfferedPercentage: value.equityOfferedPercentage,
      interestRate: value.interestRate,
      repaymentFrequency: value.repaymentFrequency || null,
      finalRepaymentDate: value.finalRepaymentDate || null,
      fundingUsage: value.fundingUsage
    };
  }

  private mapProjectStageToEnum(value: unknown): number | null {
    const names: Record<string, number> = { idea: 1, mvp: 2, startup: 3, scaling: 4, established: 5 };
    const normalized = String(value ?? '').trim().toLowerCase();
    const numeric = Number(normalized);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) return numeric;
    return names[normalized] ?? null;
  }

  private publishValidationErrors(): string[] {
    const errors: string[] = [];
    if (!this.form.get('categoryId')?.value) errors.push(this.t('opportunityEditor.validation.categoryRequired'));
    if (!this.form.get('fundingGoalId')?.value) errors.push(this.t('opportunityEditor.validation.fundingGoalRequired'));
    return errors;
  }

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  private formatCredits(value: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
  }

  private errorText(error: unknown, fallbackKey: string): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'object' && error !== null) {
      const response = error as { error?: { message?: unknown }; message?: unknown };
      if (typeof response.error?.message === 'string') return response.error.message;
      if (typeof response.message === 'string') return response.message;
    }
    return this.t(fallbackKey);
  }

  private hasProfitSharingDurationOrDates(): boolean {
    const duration = Number(this.form.get('expectedDuration')?.value);
    const start = this.form.get('profitSharingContractStartDate')?.value;
    const end = this.form.get('profitSharingContractEndDate')?.value;
    const hasDuration = Number.isFinite(duration) && duration > 0;
    const hasDates = !!start && !!end && new Date(start) < new Date(end);
    return hasDuration || hasDates;
  }

  onFilesSelected(event: Event, kind: PendingUploadKind): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;
    this.queueFiles(files, kind);
    input.value = '';
  }

  onDrop(event: DragEvent, kind: PendingUploadKind): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    this.queueFiles(files, kind);
  }

  removePendingUpload(id: number): void {
    this.pendingUploads.update(items => items.filter(item => item.id !== id));
  }

  async uploadAndAttach(): Promise<void> {
    if (this.pendingUploads().length === 0) return;
    try {
      this.isUploading.set(true);
      this.uploadMessage.set(null);
      this.errorMessage.set(null);

      const payload = this.buildPayload();
      const saved = this.editId
        ? await this.service.updateOpportunity(this.editId, payload)
        : await this.service.createOpportunity(payload);
      this.editId = String(saved.id);

      const attached: FileStoreFile[] = [];
      for (const item of this.pendingUploads()) {
        const uploaded = await this.fileStore.uploadFile(item.category, item.file, this.uploadMetadataFor(item.kind));
        attached.push(uploaded);
        if (item.kind === 'cover') {
          this.form.patchValue({ coverImageUrl: uploaded.url });
          await this.service.updateOpportunity(saved.id, { ...payload, coverImageUrl: uploaded.url });
        }

        if (item.kind === 'cover' || item.kind === 'gallery' || item.kind === 'video') {
          await this.service.createMedia(saved.id, this.toMediaPayload(item, uploaded));
        } else {
          await this.service.createDocument(saved.id, this.toDocumentPayload(item, uploaded));
        }
      }

      this.uploadedFiles.update(items => [...items, ...attached]);
      this.pendingUploads.set([]);
      this.uploadMessage.set(this.t('opportunityEditor.upload.successMessage'));
      this.notifications.showToast({ title: this.t('opportunityEditor.upload.successTitle'), message: this.t('opportunityEditor.upload.successMessage'), type: 'success' });
    } catch (error: unknown) {
      const message = this.errorText(error, 'opportunityEditor.upload.failureMessage');
      this.errorMessage.set(message);
      this.notifications.showToast({ title: this.t('opportunityEditor.upload.failureTitle'), message, type: 'error' });
    } finally {
      this.isUploading.set(false);
    }
  }

  label(item: OpportunityLookup): string {
    return this.service.label(item);
  }

  localizedLookupLabel(item: OpportunityLookup, kind: OpportunityLookupKind): string {
    const key = `opportunityEditor.lookups.${kind}.${item.id}`;
    const translated = this.t(key);
    if (translated !== key) return translated;
    const apiLabel = this.label(item);
    if (this.language() === 'ar' && !/[\u0600-\u06ff]/.test(apiLabel)) {
      return this.t('opportunityEditor.review.notAvailable');
    }
    return apiLabel;
  }

  categoryFor(kind: PendingUploadKind): string {
    switch (kind) {
      case 'cover': return 'OpportunityCover';
      case 'gallery': return 'OpportunityGallery';
      case 'video': return 'Video';
      case 'publicDocument': return 'OpportunityPublicDocument';
      case 'privateDocument': return 'OpportunityPrivateDocument';
    }
  }

  uploadKindKey(kind: PendingUploadKind): string {
    return `opportunityEditor.media.types.${kind}`;
  }

  uploadedCategoryKey(category: string): string {
    const keys: Record<string, string> = {
      OpportunityCover: 'cover',
      OpportunityGallery: 'gallery',
      Video: 'video',
      OpportunityPublicDocument: 'publicDocument',
      OpportunityPrivateDocument: 'privateDocument'
    };
    return `opportunityEditor.media.types.${keys[category] ?? 'document'}`;
  }

  private queueFiles(files: File[], kind: PendingUploadKind): void {
    const items = files.map(file => ({
      id: Date.now() + Math.floor(Math.random() * 100000),
      kind,
      category: this.categoryFor(kind),
      file
    }));
    this.pendingUploads.update(current => [...current, ...items]);
  }

  private toMediaPayload(item: PendingUpload, file: FileStoreFile) {
    const purpose = this.purposeFor(item.kind);
    const isPublic = this.isPublicFor(item.kind);
    return {
      fileId: file.fileId,
      fileKey: file.fileKey,
      fileUrl: file.url,
      fileName: file.fileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      previewUrl: file.previewUrl,
      thumbnailUrl: file.thumbnailUrl,
      purpose,
      isPublic,
      caption: file.originalFileName,
      mediaType: item.kind === 'video' ? 'Video' : item.kind === 'cover' ? 'Cover' : 'Gallery',
      isCover: item.kind === 'cover',
      sortOrder: 0
    };
  }

  private toDocumentPayload(item: PendingUpload, file: FileStoreFile) {
    const purpose = this.purposeFor(item.kind);
    const visibility = this.visibilityFor(item.kind);
    return {
      fileId: file.fileId,
      fileKey: file.fileKey,
      fileUrl: file.url,
      title: file.originalFileName,
      fileName: file.fileName,
      fileExtension: file.extension,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      category: file.category,
      previewUrl: file.previewUrl,
      thumbnailUrl: file.thumbnailUrl,
      purpose,
      visibility,
      searchTags: '',
      isPublic: visibility === 'Public'
    };
  }

  private uploadMetadataFor(kind: PendingUploadKind) {
    const visibility = this.visibilityFor(kind);
    return {
      purpose: this.purposeFor(kind),
      visibility,
      isPublic: visibility === 'Public'
    };
  }

  private purposeFor(kind: PendingUploadKind): string {
    switch (kind) {
      case 'cover': return 'Cover';
      case 'gallery': return 'Gallery';
      case 'video': return 'PitchVideo';
      case 'publicDocument': return 'PublicDocument';
      case 'privateDocument': return 'PrivateDocument';
    }
  }

  private visibilityFor(kind: PendingUploadKind): 'Public' | 'Private' {
    return kind === 'publicDocument' || kind === 'cover' || kind === 'gallery' || kind === 'video'
      ? 'Public'
      : 'Private';
  }

  private isPublicFor(kind: PendingUploadKind): boolean {
    return this.visibilityFor(kind) === 'Public';
  }
}
