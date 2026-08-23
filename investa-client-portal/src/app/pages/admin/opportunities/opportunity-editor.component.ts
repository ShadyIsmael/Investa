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
import { Project, ProjectService } from '../../../services/project.service';

type PendingUploadKind = 'cover' | 'gallery' | 'video' | 'publicDocument' | 'privateDocument';

interface PendingUpload {
  id: number;
  kind: PendingUploadKind;
  category: string;
  file: File;
}

type OpportunityLookupKind = 'tags' | 'fundingGoals';

interface OpportunityEditorFormValue {
  projectId: number | null;
  purpose: string;
  type: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  projectStage: number | null;
  projectStageCustomName: string;
  fundingGoalId: string | number | null;
  fundingTarget: number | null;
  coverImageUrl: string;
  currency: string;
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
  private projectService = inject(ProjectService);
  readonly direction = this.languageService.direction;
  readonly language = this.languageService.language;

  currencies: string[] = [];
  readonly uploadKinds: readonly PendingUploadKind[] = ['cover', 'gallery', 'video', 'publicDocument', 'privateDocument'];
  readonly projectStages = [1, 2, 3, 4, 5, 6] as const;
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
  tags = signal<OpportunityLookup[]>([]);
  fundingGoals = signal<OpportunityLookup[]>([]);
  availableProjects = signal<Project[]>([]);
  preselectedProject = signal<Project | null>(null);
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
      projectId: [this.route.snapshot.queryParamMap.get('projectId') ? Number(this.route.snapshot.queryParamMap.get('projectId')) : null, [Validators.required]],
      purpose: ['General funding', [Validators.required, Validators.maxLength(200)]],
      type: ['Opportunity', [Validators.required, Validators.maxLength(80)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      shortDescription: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(300)]],
      fullDescription: ['', [Validators.maxLength(4000)]],
      projectStage: [null, [Validators.required]],
      projectStageCustomName: ['', [Validators.maxLength(120)]],
      fundingGoalId: [null],
      fundingTarget: [null, [Validators.required, Validators.min(1)]],
      coverImageUrl: ['', [Validators.maxLength(1000)]],
      currency: ['', [Validators.required]],
      fundingUsage: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(2000)]],
      risks: [''],
      exitStrategy: ['']
    });

    this.form.get('projectStage')?.valueChanges.subscribe(() => this.updateCustomStageValidation());
    this.load();
  }

  async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      const initialProjectId = this.route.snapshot.queryParamMap.get('projectId');
      const projectsPromise = this.isEdit() ? Promise.resolve([]) : this.projectService.list();
      const [tags, fundingGoals, currencies, projects] = await Promise.all([
        this.service.getTags(),
        this.service.getFundingGoals(),
        this.service.getCurrencies('funding'),
        projectsPromise
      ]);
      this.fileStore.getCategories().then(items => this.fileStoreCategories.set(items)).catch(() => this.fileStoreCategories.set([]));
      this.tags.set(tags);
      this.fundingGoals.set(fundingGoals);
      this.availableProjects.set(projects.filter(project => project.canCreateOpportunity));
      this.currencies = currencies.map(currency => currency.isoCode);
      if (initialProjectId) {
        const matched = this.availableProjects().find(p => p.id === Number(initialProjectId));
        if (matched) {
          this.preselectedProject.set(matched);
          this.form.get('projectId')?.setValue(matched.id);
          this.form.get('projectId')?.disable();
        }
      }
      if (this.editId) {
        const existing = await this.service.getFounderOpportunity(this.editId);
        this.existingStatus.set(existing.status ?? null);
        const mapped = this.mapOpportunityToForm(existing);
        this.form.patchValue(mapped, { emitEvent: false });
        this.updateCustomStageValidation();
        this.selectedTags.set(this.mapTagIds(existing.tags ?? []));
        this.existingMedia.set(existing.media ?? []);
        this.existingDocuments.set(existing.documents ?? []);
        this.existingEvents.set(existing.events ?? []);
        if (mapped.projectId) {
          const editProjects = await this.projectService.list();
          const matched = editProjects.find(p => p.id === Number(mapped.projectId));
          if (matched) {
            this.preselectedProject.set(matched);
            this.form.get('projectId')?.disable();
          }
        }
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
      projectId: existing.projectId ? Number(existing.projectId) : null,
      purpose: existing.purpose ?? 'General funding',
      type: existing.type ?? 'Opportunity',
      title: existing.title ?? '',
      shortDescription: existing.shortDescription ?? '',
      fullDescription: existing.description ?? '',
      projectStage: this.mapProjectStageToEnum(existing.projectStage),
      projectStageCustomName: existing.projectStageCustomName ?? '',
      fundingGoalId: existing.fundingGoal?.id ?? null,
      fundingTarget: this.toNullableNumber(existing.fundingTarget),
      coverImageUrl: existing.coverImageUrl ?? '',
      currency: existing.currency ?? '',
      fundingUsage: existing.useOfFunds ?? '',
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
   * Validate current step before proceeding
   */
  private validateCurrentStep(): boolean {
    this.stepErrorMessage.set(null);
    const currentStep = this.step();
    const form = this.form;
    const invalidFields: string[] = [];

    if (currentStep === 1) {
      // Step 1: Basic info
      form.get('projectId')?.markAsTouched();
      form.get('title')?.markAsTouched();
      form.get('shortDescription')?.markAsTouched();
      form.get('projectStage')?.markAsTouched();
      form.get('projectStageCustomName')?.markAsTouched();
      if (form.get('projectId')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.projectRequired'));
      if (form.get('title')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.titleRequired'));
      if (form.get('shortDescription')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.shortDescriptionRequired'));
      if (form.get('projectStage')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.projectStageRequired'));
      if (form.get('projectStageCustomName')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.projectStageCustomRequired'));
    } else if (currentStep === 2) {
      // Step 2: Funding basics only. OfferLeg types are selected later by investors.
      ['fundingTarget', 'currency'].forEach(field => form.get(field)?.markAsTouched());
      if (form.get('fundingTarget')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.fundingTargetPositive'));
      if (form.get('currency')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.currencyRequired'));
      form.get('fundingUsage')?.markAsTouched();
      if (form.get('fundingUsage')?.invalid) invalidFields.push(this.t('opportunityEditor.validation.useOfFundsRequired'));
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
      ? ['projectId', 'purpose', 'type', 'title', 'shortDescription', 'projectStage', 'projectStageCustomName']
      : stepId === 2
        ? ['fundingTarget', 'currency', 'fundingUsage']
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
      if (submit && this.pendingUploads().length > 0) {
        this.step.set(3);
        this.stepErrorMessage.set(this.t('opportunityEditor.media.pendingHelp'));
        return;
      }
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
        const chargingEnabled = await this.walletService.loadChargingEnabled();
        if (chargingEnabled) {
          const quote = await this.walletService.getPaidActionQuote('PublishOpportunity');
          if (!quote.hasSufficientCredit) {
            throw new Error(this.t('paidActions.insufficientMessage').replace('{required}', this.formatCredits(quote.creditCost)).replace('{balance}', this.formatCredits(quote.currentBalance)));
          }
          if (!window.confirm(this.t('opportunityPublish.confirmation').replace('{action}', this.t('opportunityPublish.action')).replace('{cost}', this.formatCredits(quote.creditCost)).replace('{balance}', this.formatCredits(quote.currentBalance)).replace('{after}', this.formatCredits(quote.balanceAfter)))) {
            return;
          }
        } else if (!window.confirm(this.t('opportunityPublish.confirmationFree').replace('{action}', this.t('opportunityPublish.action')))) {
          return;
        }
        await this.service.publishOpportunity(saved.id);
      }
      this.notifications.showToast({ title: submit ? this.t('opportunityPublish.successTitle') : this.t('opportunityEditor.savedTitle'), message: submit ? this.t('opportunityPublish.successMessage') : this.t('opportunityEditor.savedMessage'), type: 'success' });
      this.router.navigate(['/admin/my-opportunities']);
    } catch (error: unknown) {
      this.routeCreateError(error);
      const message = this.errorText(error, submit ? 'opportunityPublish.failureMessage' : 'opportunityEditor.saveFailureMessage');
      this.errorMessage.set(message);
      this.notifications.showToast({ title: this.t(submit ? 'opportunityPublish.failureTitle' : 'opportunityEditor.saveFailureTitle'), message, type: 'error' });
    } finally {
      this.isSaving.set(false);
      this.savingMode.set(null);
    }
  }

  projectName(): string {
    const pp = this.preselectedProject();
    if (pp) return pp.displayName;
    const id = this.form.get('projectId')?.value;
    const match = this.availableProjects().find(p => p.id === Number(id));
    return match?.displayName ?? this.t('opportunityEditor.review.notAvailable');
  }

  projectStageKey(value: unknown): string {
    const stage = this.mapProjectStageToEnum(value);
    return stage ? `opportunityEditor.projectStages.${stage}` : 'opportunityEditor.review.notAvailable';
  }

  projectStageDisplay(stage: unknown, customName: unknown): string {
    const translated = this.t(this.projectStageKey(stage));
    const custom = String(customName ?? '').trim();
    return this.mapProjectStageToEnum(stage) === 6 && custom ? `${translated}: ${custom}` : translated;
  }

  isProjectStageUnavailable(stage: number): boolean {
    if (stage === 6) return false;
    const project = this.selectedProject();
    const ownId = Number(this.editId ?? 0);
    return !!project?.opportunities?.some(opportunity =>
      Number(opportunity.id) !== ownId && Number(opportunity.projectStage) === stage
    );
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
    const text = (input: unknown): string | null => String(input ?? '').trim() || null;
    const payload: OpportunityUpsert = {
      projectId: this.isEdit() ? undefined : this.toNullableNumber(value.projectId),
      purpose: text(value.purpose),
      type: text(value.type),
      title: String(value.title ?? '').trim(),
      shortDescription: String(value.shortDescription ?? '').trim(),
      fullDescription: text(value.fullDescription),
      projectStage: value.projectStage,
      projectStageCustomName: Number(value.projectStage) === 6 ? text(value.projectStageCustomName) : null,
      tagIds: this.selectedTags(),
      fundingGoalId: value.fundingGoalId,
      fundingTarget: value.fundingTarget,
      fundingCurrency: text(value.currency),
      coverImageUrl: text(value.coverImageUrl),
      fundingUsage: String(value.fundingUsage ?? '').trim()
    };
    return payload;
  }

  private routeCreateError(error: unknown): void {
    const raw = JSON.stringify(error).toLowerCase();
    const routes: Array<{ step: number; fields: string[] }> = [
      { step: 1, fields: ['projectid', 'title', 'shortdescription', 'projectstage'] },
      { step: 2, fields: ['useoffunds', 'fundingtarget', 'fundingcurrency', 'currency', 'fundinggoalid'] },
      { step: 3, fields: ['coverimageurl'] }
    ];
    for (const route of routes) {
      const rejected = route.fields.filter(field => raw.includes(field));
      if (!rejected.length) continue;
      this.step.set(route.step);
      const controls: Record<string, string> = { useoffunds: 'fundingUsage' };
      rejected.forEach(field => this.form.get(controls[field] ?? field)?.markAsTouched());
      return;
    }
  }

  private mapProjectStageToEnum(value: unknown): number | null {
    const names: Record<string, number> = { idea: 1, mvp: 2, startup: 3, scaling: 4, established: 5, other: 6 };
    const normalized = String(value ?? '').trim().toLowerCase();
    const numeric = Number(normalized);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 6) return numeric;
    return names[normalized] ?? null;
  }

  private selectedProject(): Project | null {
    const selectedId = Number(this.form.getRawValue().projectId);
    return this.preselectedProject()
      ?? this.availableProjects().find(project => project.id === selectedId)
      ?? null;
  }

  private updateCustomStageValidation(): void {
    const customName = this.form.get('projectStageCustomName');
    if (this.mapProjectStageToEnum(this.form.get('projectStage')?.value) === 6) {
      customName?.setValidators([this.trimmedRequired, Validators.maxLength(120)]);
    } else {
      customName?.clearValidators();
    }
    customName?.updateValueAndValidity({ emitEvent: false });
  }

  private readonly trimmedRequired = (control: { value: unknown }) =>
    String(control.value ?? '').trim().length > 0 ? null : { required: true };

  private publishValidationErrors(): string[] {
    const errors: string[] = [];
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
    const fileKey = this.uploadedFileKey(file);
    const purpose = this.purposeFor(item.kind);
    const isPublic = this.isPublicFor(item.kind);
    return {
      fileKey,
      mediaType: item.kind === 'video' ? 'Video' : item.kind === 'cover' ? 'Cover' : 'Gallery',
      purpose,
      isPublic,
      isCover: item.kind === 'cover',
      sortOrder: 0
    };
  }

  private toDocumentPayload(item: PendingUpload, file: FileStoreFile) {
    const fileKey = this.uploadedFileKey(file);
    const purpose = this.purposeFor(item.kind);
    const visibility = this.visibilityFor(item.kind);
    return {
      fileKey,
      documentType: 'Document',
      visibility,
      purpose,
      category: file.category,
      searchTags: ''
    };
  }

  private uploadedFileKey(file: FileStoreFile): string {
    const fileKey = file.fileKey?.trim();
    if (fileKey) return fileKey;

    const storagePath = file.url?.split('/storage/')[1]?.split(/[?#]/)[0];
    if (storagePath) return decodeURIComponent(storagePath);

    if (file.category && file.fileName) return `${file.category}/${file.fileName}`;
    throw new Error('The uploaded file did not return a storage key. Please retry the upload.');
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
