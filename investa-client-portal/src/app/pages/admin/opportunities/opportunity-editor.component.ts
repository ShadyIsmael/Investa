import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OpportunityLookup, OpportunityService, OpportunityUpsert } from '../../../services/opportunity.service';
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

@Component({
  standalone: true,
  selector: 'app-opportunity-editor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './opportunity-editor.component.html',
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

  // Investment Model enum values from backend
  readonly InvestmentModel = {
    Equity: 1,
    CapitalContributionProfitSharing: 2,
    LoanInvestment: 3
  };

  readonly payoutFrequencies = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'At Maturity'] as const;

  step = signal(1);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  stepErrorMessage = signal<string | null>(null);
  categories = signal<OpportunityLookup[]>([]);
  tags = signal<OpportunityLookup[]>([]);
  fundingGoals = signal<OpportunityLookup[]>([]);
  selectedTags = signal<Array<string | number>>([]);
  pendingUploads = signal<PendingUpload[]>([]);
  uploadedFiles = signal<FileStoreFile[]>([]);
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
      title: ['', [Validators.required]],
      shortDescription: ['', [Validators.required]],
      fullDescription: [''],
      categoryId: [null],
      projectStage: [''],
      investmentModel: [null, [Validators.required]],
      fundingGoalId: [null],
      fundingTarget: [null, [Validators.min(1)]],
      minimumInvestment: [null, [Validators.min(1)]],
      maximumInvestment: [null],
      expectedDuration: [null],
      profitSharingPayoutFrequency: [''],
      profitSharingContractStartDate: [''],
      profitSharingContractEndDate: [''],
      coverImageUrl: [''],
      // Equity-specific fields
      equityOfferedPercentage: [null, [Validators.min(0), Validators.max(100)]],
      // Loan-specific fields
      interestRate: [null, [Validators.min(0), Validators.max(100)]],
      repaymentFrequency: [''],
      finalRepaymentDate: [''],
      // Profit Sharing-specific fields
      profitSharePercentage: [null, [Validators.min(0), Validators.max(100)]],
      exitTerms: [''],
      // Common optional fields
      fundingUsage: [''],
      risks: [''],
      exitStrategy: ['']
    });

    // Listen for investment model changes to clear incompatible fields
    this.form.get('investmentModel')?.valueChanges.subscribe(model => {
      this.onInvestmentModelChange(model);
    });

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
        this.form.patchValue({
          title: existing.title || '',
          shortDescription: existing.shortDescription || existing.description || '',
          fullDescription: existing.fullDescription || existing.description || '',
          categoryId: existing.categoryId ?? existing.category?.id ?? null,
          projectStage: existing.projectStage || '',
          investmentModel: this.mapInvestmentModelToEnum(existing.investmentModel),
          fundingGoalId: existing.fundingGoalId ?? existing.fundingGoal?.id ?? null,
          fundingTarget: existing.fundingTarget ?? null,
          minimumInvestment: existing.minimumInvestment ?? existing.minimumInvestmentAmount ?? null,
          maximumInvestment: existing.maximumInvestment ?? existing.maximumInvestmentAmount ?? null,
          expectedDuration: existing.expectedDuration ?? existing.expectedDurationMonths ?? null,
          profitSharingPayoutFrequency: existing.profitSharingPayoutFrequency || '',
          profitSharingContractStartDate: this.formatDateForInput(existing.profitSharingContractStartDate),
          profitSharingContractEndDate: this.formatDateForInput(existing.profitSharingContractEndDate),
          coverImageUrl: existing.coverImageUrl || '',
          equityOfferedPercentage: existing.equityOfferedPercentage ?? null,
          interestRate: existing.interestRate ?? null,
          repaymentFrequency: existing.repaymentFrequency ?? '',
          finalRepaymentDate: this.formatDateForInput(existing.finalRepaymentDate),
          fundingUsage: existing.useOfFunds || existing.fundingPurpose || existing.fundingUsage || '',
          risks: existing.risks || '',
          exitStrategy: existing.exitStrategy || ''
        });
        this.selectedTags.set((existing.tags || []).map(tag => typeof tag === 'string' ? tag : tag.id));
      }
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load opportunity editor.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private formatDateForInput(value: string | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
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
   * Get investment model label for display
   */
  getInvestmentModelLabel(modelValue: number | null): string {
    if (modelValue === this.InvestmentModel.Equity) return 'Equity';
    if (modelValue === this.InvestmentModel.CapitalContributionProfitSharing) return 'Profit Sharing';
    if (modelValue === this.InvestmentModel.LoanInvestment) return 'Loan';
    return '';
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
    const equityFields = ['equityOfferedPercentage'];
    const loanFields = ['interestRate', 'repaymentFrequency', 'finalRepaymentDate'];
    const profitSharingFields = ['profitSharePercentage', 'profitSharingPayoutFrequency', 'profitSharingContractStartDate', 'profitSharingContractEndDate', 'exitTerms'];

    // Clear all model-specific validators
    [...equityFields, ...loanFields, ...profitSharingFields].forEach(field => {
      this.form.get(field)?.clearValidators();
      this.form.get(field)?.updateValueAndValidity();
    });

    // Apply validators for current model
    if (model === this.InvestmentModel.Equity) {
      this.form.get('equityOfferedPercentage')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else if (model === this.InvestmentModel.LoanInvestment) {
      this.form.get('interestRate')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      this.form.get('repaymentFrequency')?.setValidators([Validators.required]);
      this.form.get('finalRepaymentDate')?.setValidators([Validators.required]);
    } else if (model === this.InvestmentModel.CapitalContributionProfitSharing) {
      this.form.get('profitSharePercentage')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      this.form.get('profitSharingPayoutFrequency')?.setValidators([Validators.required]);
      this.form.get('exitTerms')?.setValidators([Validators.required]);
    }

    // Update validity for affected fields
    [...equityFields, ...loanFields, ...profitSharingFields].forEach(field => {
      this.form.get(field)?.updateValueAndValidity();
    });
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
      if (form.get('title')?.invalid) invalidFields.push('Title is required');
      if (form.get('shortDescription')?.invalid) invalidFields.push('Short description is required');
    } else if (currentStep === 2) {
      // Step 2: Funding basics
      if (form.get('investmentModel')?.invalid) invalidFields.push('Investment model is required');
      if (form.get('fundingTarget')?.invalid) invalidFields.push('Funding target must be greater than 0');
      if (form.get('minimumInvestment')?.invalid) invalidFields.push('Minimum investment must be greater than 0');
      
      // Model-specific validation
      const model = form.get('investmentModel')?.value;
      if (model === this.InvestmentModel.Equity) {
        if (form.get('equityOfferedPercentage')?.invalid) invalidFields.push('Equity offered percentage is required');
      } else if (model === this.InvestmentModel.LoanInvestment) {
        if (form.get('interestRate')?.invalid) invalidFields.push('Interest rate is required');
        if (form.get('repaymentFrequency')?.invalid) invalidFields.push('Repayment frequency is required');
        if (form.get('finalRepaymentDate')?.invalid) invalidFields.push('Final repayment date is required');
      } else if (model === this.InvestmentModel.CapitalContributionProfitSharing) {
        if (form.get('profitSharePercentage')?.invalid) invalidFields.push('Profit share percentage is required');
        if (form.get('profitSharingPayoutFrequency')?.invalid) invalidFields.push('Profit sharing payout frequency is required');
        if (!this.hasProfitSharingDurationOrDates()) invalidFields.push('Either expected duration or both contract start and end dates are required');
        if (form.get('profitSharingContractStartDate')?.value && form.get('profitSharingContractEndDate')?.value && new Date(form.get('profitSharingContractStartDate')?.value) >= new Date(form.get('profitSharingContractEndDate')?.value)) invalidFields.push('Contract end date must be after start date');
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
      this.errorMessage.set(null);
      const formValue = this.form.value;
      const expectedDuration = formValue.investmentModel === this.InvestmentModel.LoanInvestment
        ? formValue.expectedDuration
        : formValue.expectedDuration;

      const payload: OpportunityUpsert = {
        title: formValue.title,
        shortDescription: formValue.shortDescription,
        fullDescription: formValue.fullDescription,
        categoryId: formValue.categoryId,
        projectStage: formValue.projectStage,
        tagIds: this.selectedTags(),
        investmentModel: this.mapEnumToInvestmentModel(formValue.investmentModel),
        fundingGoalId: formValue.fundingGoalId,
        fundingTarget: formValue.fundingTarget,
        minimumInvestment: formValue.minimumInvestment,
        maximumInvestment: formValue.maximumInvestment,
        expectedDurationMonths: expectedDuration,
        profitSharePercentage: formValue.profitSharePercentage,
        profitSharingPayoutFrequency: formValue.profitSharingPayoutFrequency || null,
        profitSharingContractStartDate: formValue.profitSharingContractStartDate || null,
        profitSharingContractEndDate: formValue.profitSharingContractEndDate || null,
        coverImageUrl: formValue.coverImageUrl,
        equityOfferedPercentage: formValue.equityOfferedPercentage,
        interestRate: formValue.interestRate,
        repaymentFrequency: formValue.repaymentFrequency || null,
        finalRepaymentDate: formValue.finalRepaymentDate || null,
        fundingUsage: formValue.fundingUsage,
        risks: formValue.risks,
        exitStrategy: formValue.exitStrategy
      };
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
    } catch (error: any) {
      const message = error?.error?.message || error?.message || this.t(submit ? 'opportunityPublish.failureMessage' : 'opportunityEditor.saveFailureMessage');
      this.errorMessage.set(message);
      this.notifications.showToast({ title: this.t(submit ? 'opportunityPublish.failureTitle' : 'opportunityEditor.saveFailureTitle'), message, type: 'error' });
    } finally {
      this.isSaving.set(false);
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

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  private formatCredits(value: number): string {
    return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
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

      const formValue = this.form.value;
      const payload: OpportunityUpsert = {
        title: formValue.title,
        shortDescription: formValue.shortDescription,
        fullDescription: formValue.fullDescription,
        categoryId: formValue.categoryId,
        projectStage: formValue.projectStage,
        tagIds: this.selectedTags(),
        investmentModel: this.mapEnumToInvestmentModel(formValue.investmentModel),
        fundingGoalId: formValue.fundingGoalId,
        fundingTarget: formValue.fundingTarget,
        minimumInvestment: formValue.minimumInvestment,
        maximumInvestment: formValue.maximumInvestment,
        expectedDuration: formValue.expectedDuration,
        coverImageUrl: formValue.coverImageUrl,
        equityOfferedPercentage: formValue.equityOfferedPercentage,
        fundingUsage: formValue.fundingUsage,
        risks: formValue.risks,
        exitStrategy: formValue.exitStrategy
      };
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
      this.uploadMessage.set('Files uploaded and attached to the opportunity.');
      this.notifications.showToast({ title: 'Files uploaded', message: 'FileStore metadata was saved to the opportunity.', type: 'success' });
    } catch (error: any) {
      const message = error?.message || 'Failed to upload files.';
      this.errorMessage.set(message);
      this.notifications.showToast({ title: 'Upload failed', message, type: 'error' });
    } finally {
      this.isUploading.set(false);
    }
  }

  label(item: OpportunityLookup): string {
    return this.service.label(item);
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
