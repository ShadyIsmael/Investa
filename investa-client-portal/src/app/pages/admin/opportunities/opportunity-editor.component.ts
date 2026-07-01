import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OpportunityLookup, OpportunityService, OpportunityUpsert } from '../../../services/opportunity.service';
import { NotificationService } from '../../../services/notification.service';
import { FileStoreFile, FileStoreService } from '../../../services/file-store.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './opportunity-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityEditorComponent {
  private service = inject(OpportunityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private fileStore = inject(FileStoreService);

  step = signal(1);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
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

  form: OpportunityUpsert = {
    title: '',
    shortDescription: '',
    fullDescription: '',
    categoryId: null,
    projectStage: '',
    tagIds: [],
    investmentModel: '',
    fundingGoalId: null,
    fundingTarget: null,
    minimumInvestment: null,
    maximumInvestment: null,
    expectedDuration: null,
    coverImageUrl: '',
    fundingUsage: '',
    risks: '',
    exitStrategy: ''
  };

  constructor() {
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
        this.form = {
          title: existing.title || '',
          shortDescription: existing.shortDescription || existing.description || '',
          fullDescription: existing.fullDescription || existing.description || '',
          categoryId: existing.categoryId ?? null,
          projectStage: existing.projectStage || '',
          tagIds: [],
          investmentModel: existing.investmentModel || '',
          fundingGoalId: existing.fundingGoalId ?? null,
          fundingTarget: existing.fundingTarget ?? null,
          minimumInvestment: existing.minimumInvestment ?? null,
          maximumInvestment: existing.maximumInvestment ?? null,
          expectedDuration: existing.expectedDuration ?? null,
          coverImageUrl: existing.coverImageUrl || '',
          fundingUsage: existing.fundingUsage || '',
          risks: existing.risks || '',
          exitStrategy: existing.exitStrategy || ''
        };
        this.selectedTags.set((existing.tags || []).map(tag => typeof tag === 'string' ? tag : tag.id));
      }
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load opportunity editor.');
    } finally {
      this.isLoading.set(false);
    }
  }

  next(): void {
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
      const payload = { ...this.form, tagIds: this.selectedTags() };
      const saved = this.editId
        ? await this.service.updateOpportunity(this.editId, payload)
        : await this.service.createOpportunity(payload);
      if (submit) {
        await this.service.submitForReview(saved.id);
      }
      this.notifications.showToast({ title: submit ? 'Submitted' : 'Saved', message: submit ? 'Opportunity submitted for review.' : 'Opportunity draft saved.', type: 'success' });
      this.router.navigate(['/admin/my-opportunities']);
    } catch (error: any) {
      const message = error?.message || 'Failed to save opportunity.';
      this.errorMessage.set(message);
      this.notifications.showToast({ title: 'Save failed', message, type: 'error' });
    } finally {
      this.isSaving.set(false);
    }
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

      const payload = { ...this.form, tagIds: this.selectedTags() };
      const saved = this.editId
        ? await this.service.updateOpportunity(this.editId, payload)
        : await this.service.createOpportunity(payload);
      this.editId = String(saved.id);

      const attached: FileStoreFile[] = [];
      for (const item of this.pendingUploads()) {
        const uploaded = await this.fileStore.uploadFile(item.category, item.file, this.uploadMetadataFor(item.kind));
        attached.push(uploaded);
        if (item.kind === 'cover') {
          this.form.coverImageUrl = uploaded.url;
          await this.service.updateOpportunity(saved.id, { ...this.form, tagIds: this.selectedTags(), coverImageUrl: uploaded.url });
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
