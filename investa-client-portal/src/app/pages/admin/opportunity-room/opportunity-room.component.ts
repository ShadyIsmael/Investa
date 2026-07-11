import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Opportunity,
  OpportunityDocument,
  OpportunityEvent,
  OpportunityMedia,
  OpportunityRoom,
  OpportunityRoomParticipantContext,
  OpportunityService
} from '../../../services/opportunity.service';
import { FileStoreService } from '../../../services/file-store.service';

type RoomTab = 'overview' | 'timeline' | 'documents' | 'media' | 'updates';

interface ActivityFeedItem {
  trackKey: string;
  kind: 'milestone' | 'update' | 'document' | 'media';
  title: string;
  detail: string;
  dateText: string;
  dateValue: number;
}

interface RoomError {
  status?: number;
  title: string;
  message: string;
}

const RECENT_ACTIVITY_LIMIT = 5;

@Component({
  standalone: true,
  selector: 'app-opportunity-room',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './opportunity-room.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityRoomComponent {
  private route = inject(ActivatedRoute);
  private opportunityService = inject(OpportunityService);
  private fileStore = inject(FileStoreService);

  room = signal<OpportunityRoom | null>(null);
  isLoading = signal(false);
  error = signal<RoomError | null>(null);
  activeTab = signal<RoomTab>('overview');
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  isSubmittingAction = signal(false);
  showAllRecentActivity = signal(false);
  updateModalOpen = signal(false);
  documentModalOpen = signal(false);
  milestoneModalOpen = signal(false);
  updateForm = signal({ title: '', content: '', isPublic: false });
  milestoneForm = signal({ title: '', description: '', isPublic: true });
  documentForm = signal({
    title: '',
    visibility: 'Private' as 'Public' | 'Private',
    purpose: 'PrivateDocument',
    category: 'OpportunityPrivateDocument',
    searchTags: ''
  });
  selectedDocumentFile = signal<File | null>(null);

  tabs: Array<{ id: RoomTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' },
    { id: 'media', label: 'Media' },
    { id: 'updates', label: 'Updates' }
  ];

  overview = computed(() => (this.room()?.overview ?? {}) as Opportunity & Record<string, any>);
  participantContext = computed(() => (this.room()?.participantContext ?? {}) as OpportunityRoomParticipantContext);
  documents = computed(() => this.flattenLibrary<OpportunityDocument>(this.room()?.documentsLibrary ?? this.room()?.documents));
  media = computed(() => this.flattenLibrary<OpportunityMedia>(this.room()?.mediaLibrary ?? this.room()?.media));
  timeline = computed(() => {
    const operationalTypes = ['update', 'projectupdate', 'founderupdate', 'announcement', 'progressupdate'];
    return this.flattenLibrary<OpportunityEvent>(this.room()?.timeline ?? this.room()?.events)
      .filter(item => !operationalTypes.includes(this.eventType(item).toLowerCase().replace(/\s+/g, '')));
  });
  updates = computed(() => {
    const updateTypes = ['update', 'projectupdate', 'founderupdate', 'announcement', 'progressupdate'];
    return this.flattenLibrary<OpportunityEvent>(this.room()?.timeline ?? this.room()?.events)
      .filter(item => updateTypes.includes(this.eventType(item).toLowerCase().replace(/\s+/g, '')));
  });

  timelineSorted = computed(() => this.sortEventsByDateDesc(this.timeline()));
  updatesSorted = computed(() => this.sortEventsByDateDesc(this.updates()));
  documentsSorted = computed(() => this.sortByDateDesc(this.documents(), item => this.documentRawDate(item)));
  mediaSorted = computed(() => this.sortByDateDesc(this.media(), item => this.mediaRawDate(item)));

  documentGroups = computed(() => this.groupDocuments(this.documents()));
  mediaGroups = computed(() => this.groupMedia(this.media()));

  latestActivity = computed(() => {
    const items = this.activityFeed().sort((a, b) => b.dateValue - a.dateValue);
    return items[0] ?? null;
  });

  recentActivity = computed(() => this.activityFeed().sort((a, b) => b.dateValue - a.dateValue));
  displayedRecentActivity = computed(() => {
    const items = this.recentActivity();
    return this.showAllRecentActivity() ? items : items.slice(0, RECENT_ACTIVITY_LIMIT);
  });
  hasMoreRecentActivity = computed(() => this.recentActivity().length > RECENT_ACTIVITY_LIMIT);

  recommendedNextSteps = computed(() => {
    const steps: string[] = [];
    const context = this.participantContext();
    const latest = this.latestActivity();

    if (!context.canViewPrivateFiles) {
      steps.push('Review public documents first, then request private-room permissions if needed.');
    }

    if (this.documents().length === 0) {
      steps.push('No documents are available yet. Watch this room for founder uploads.');
    } else if (!context.canDownloadFiles) {
      steps.push('Use in-browser preview links while downloads are restricted for your current role.');
    } else {
      steps.push('Download and review the latest documents before your next founder conversation.');
    }

    if (this.timeline().length > 0) {
      steps.push('Review milestones to understand strategic progress before evaluating new updates.');
    }

    if (latest?.kind === 'update') {
      steps.push('Start with the latest founder update to understand what changed most recently.');
    }

    if (steps.length === 0) {
      steps.push('Check back soon for new milestones, updates, or documents in this room.');
    }

    return steps.slice(0, 4);
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      this.isLoading.set(true);
      this.error.set(null);
      this.room.set(await this.opportunityService.getOpportunityRoom(id));
    } catch (error) {
      this.room.set(null);
      this.error.set(this.toRoomError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  setTab(tab: RoomTab): void {
    this.activeTab.set(tab);
  }

  showAllRecent(): void {
    this.showAllRecentActivity.set(true);
  }

  showRecentSummary(): void {
    this.showAllRecentActivity.set(false);
  }

  opportunityId(): string | number | null {
    return this.overview().id || this.route.snapshot.paramMap.get('id');
  }

  isFounder(): boolean {
    return this.participantContext().isFounder === true || this.roomRole() === 'Founder';
  }

  approvedParticipantCount(): number {
    return Number(this.participantContext().approvedParticipantCount ?? 0);
  }

  canEditCoreProject(): boolean {
    return this.participantContext().canEditCoreProject === true;
  }

  canAddUpdate(): boolean {
    return this.participantContext().canAddUpdate === true;
  }

  canAddDocument(): boolean {
    return this.participantContext().canAddDocument === true;
  }

  canAddMilestone(): boolean {
    return this.participantContext().canAddMilestone === true;
  }

  coreEditMessage(): string {
    return this.canEditCoreProject()
      ? 'Core project editing is available until the first participant joins.'
      : 'Core project details are locked after the first participant joins.';
  }

  openUpdateModal(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.updateModalOpen.set(true);
  }

  openDocumentModal(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.documentModalOpen.set(true);
  }

  openMilestoneModal(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.milestoneModalOpen.set(true);
  }

  closeActionModals(): void {
    if (this.isSubmittingAction()) return;
    this.updateModalOpen.set(false);
    this.documentModalOpen.set(false);
    this.milestoneModalOpen.set(false);
    this.actionError.set(null);
  }

  setUpdateTitle(title: string): void {
    this.updateForm.update(form => ({ ...form, title }));
  }

  setUpdateContent(content: string): void {
    this.updateForm.update(form => ({ ...form, content }));
  }

  setUpdateIsPublic(isPublic: boolean): void {
    this.updateForm.update(form => ({ ...form, isPublic }));
  }

  setMilestoneTitle(title: string): void {
    this.milestoneForm.update(form => ({ ...form, title }));
  }

  setMilestoneDescription(description: string): void {
    this.milestoneForm.update(form => ({ ...form, description }));
  }

  setMilestoneIsPublic(isPublic: boolean): void {
    this.milestoneForm.update(form => ({ ...form, isPublic }));
  }

  setDocumentTitle(title: string): void {
    this.documentForm.update(form => ({ ...form, title }));
  }

  setDocumentVisibility(visibility: 'Public' | 'Private'): void {
    this.documentForm.update(form => ({ ...form, visibility }));
  }

  setDocumentPurpose(purpose: string): void {
    this.documentForm.update(form => ({ ...form, purpose }));
  }

  onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDocumentFile.set(input.files?.[0] ?? null);
  }

  async submitUpdate(): Promise<void> {
    const form = this.updateForm();
    if (!form.title.trim()) {
      this.actionError.set('Update title is required.');
      return;
    }
    await this.createEvent('ProjectUpdate', form.title, form.content, form.isPublic, 'Update added.', () => {
      this.updateForm.set({ title: '', content: '', isPublic: false });
      this.updateModalOpen.set(false);
      this.activeTab.set('updates');
    });
  }

  async submitMilestone(): Promise<void> {
    const form = this.milestoneForm();
    if (!form.title.trim()) {
      this.actionError.set('Milestone title is required.');
      return;
    }
    await this.createEvent('Milestone', form.title, form.description, form.isPublic, 'Milestone added.', () => {
      this.milestoneForm.set({ title: '', description: '', isPublic: true });
      this.milestoneModalOpen.set(false);
      this.activeTab.set('timeline');
    });
  }

  async submitDocument(): Promise<void> {
    const opportunityId = this.opportunityId();
    const file = this.selectedDocumentFile();
    const form = this.documentForm();
    if (!opportunityId || !file) {
      this.actionError.set('Select a document file first.');
      return;
    }

    try {
      this.isSubmittingAction.set(true);
      this.actionError.set(null);
      const category = this.documentCategory(form.purpose, form.visibility);
      const uploaded = await this.fileStore.uploadFile(category, file, {
        purpose: form.purpose,
        visibility: form.visibility,
        isPublic: form.visibility === 'Public'
      });
      await this.opportunityService.createDocument(opportunityId, {
        fileId: uploaded.fileId,
        fileKey: uploaded.fileKey,
        fileUrl: uploaded.url,
        title: form.title || uploaded.originalFileName || uploaded.fileName,
        fileName: uploaded.fileName,
        fileExtension: uploaded.extension || this.extensionFromName(uploaded.fileName),
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
        category: uploaded.category,
        documentType: form.purpose,
        previewUrl: uploaded.previewUrl,
        thumbnailUrl: uploaded.thumbnailUrl,
        purpose: this.documentPurposeValue(form.purpose),
        visibility: this.documentVisibilityValue(form.visibility),
        searchTags: form.searchTags
      } as any);
      this.actionSuccess.set('Document added.');
      this.documentForm.set({ title: '', visibility: 'Private', purpose: 'PrivateDocument', category: 'OpportunityPrivateDocument', searchTags: '' });
      this.selectedDocumentFile.set(null);
      this.documentModalOpen.set(false);
      this.activeTab.set('documents');
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Failed to add document.');
    } finally {
      this.isSubmittingAction.set(false);
    }
  }

  title(): string {
    const overview = this.overview();
    return overview.title || overview.name || overview.businessName || 'Project Room';
  }

  description(): string {
    const overview = this.overview();
    return overview.shortDescription || overview.description || overview.fullDescription || '-';
  }

  status(): string {
    return this.overview().status || '-';
  }

  stage(): string {
    return this.overview().projectStage || this.overview().stage || '-';
  }

  investmentModel(): string {
    return this.overview().investmentModel || this.overview().model || '-';
  }

  fundingTarget(): number | null {
    return this.numberValue(this.overview().fundingTarget ?? this.overview().targetFund);
  }

  fundingProgress(): number {
    const overview = this.overview();
    const explicit = this.numberValue(overview.fundingProgressPercent ?? overview.fundingPercentage);
    if (explicit !== null) return Math.max(0, Math.min(100, explicit));

    const raised = this.numberValue(overview.currentFunding ?? overview.amountRaised);
    const target = this.fundingTarget();
    if (!raised || !target) return 0;
    return Math.max(0, Math.min(100, (raised / target) * 100));
  }

  minimumParticipation(): number | null {
    return this.numberValue(this.overview().minimumInvestment ?? this.overview().minimumInvestmentAmount ?? this.overview().minInvestment);
  }

  founderSummary(): string {
    const overview = this.overview();
    const founder = overview.founder;
    if (overview.founderSummary) return overview.founderSummary;
    if (founder?.summary) return founder.summary;
    if (founder?.displayName || founder?.fullName || founder?.name) return founder.displayName || founder.fullName || founder.name || '';
    return '-';
  }

  roomRole(): string {
    const context = this.participantContext();
    if (context.isFounder) return 'Founder';
    if (context.isApprovedParticipant) return 'Approved Investor';
    const role = context.role || context.userRole || context.roomRole;
    if (!role) return '-';
    return role === 'ApprovedInvestor' ? 'Approved Investor' : String(role);
  }

  permissionLabel(value: boolean | null | undefined): string {
    return value ? 'Allowed' : 'Not allowed';
  }

  money(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  fileSize(bytes: number | null | undefined): string {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  fileTitle(item: OpportunityDocument | OpportunityMedia): string {
    const file = item as OpportunityDocument & OpportunityMedia;
    return file.title || file.name || file.originalFileName || file.fileName || 'File';
  }

  extension(item: OpportunityDocument | OpportunityMedia): string {
    return (item.fileExtension || this.extensionFromName(item.fileName) || 'FILE').replace('.', '').toUpperCase();
  }

  visibility(item: OpportunityDocument | OpportunityMedia): string {
    if ('visibility' in item && item.visibility) return String(item.visibility);
    if (item.isPublic === true) return 'Public';
    if (item.isPublic === false) return 'Private';
    return '-';
  }

  uploadedDate(item: any): string {
    const raw = item.uploadedAt || item.createdAt || item.date;
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
  }

  previewUrl(item: OpportunityMedia | OpportunityDocument): string {
    if (item.previewUrl) return this.fileStore.getPublicUrl(item.previewUrl);
    if (item.fileUrl) return this.fileStore.getPublicUrl(item.fileUrl);
    return item.category && item.fileName ? this.fileStore.getPreviewUrl(item.category, item.fileName) : '';
  }

  downloadUrl(item: OpportunityMedia | OpportunityDocument): string {
    if (item.category && item.fileName) return this.fileStore.getDownloadUrl(item.category, item.fileName);
    return item.fileUrl || '';
  }

  mediaUrl(item: OpportunityMedia): string {
    return this.fileStore.getPublicUrl(item.thumbnailUrl || item.previewUrl || item.fileUrl || '');
  }

  isImage(item: OpportunityMedia): boolean {
    return (item.mimeType || '').toLowerCase().startsWith('image') || /\.(png|jpe?g|webp|gif)$/i.test(item.fileName || item.fileUrl || '');
  }

  isVideo(item: OpportunityMedia): boolean {
    return (item.mimeType || '').toLowerCase().startsWith('video') || /\.(mp4|mov|webm)$/i.test(item.fileName || item.fileUrl || '');
  }

  eventTitle(item: OpportunityEvent): string {
    return item.title || this.eventType(item) || 'Project update';
  }

  eventType(item: OpportunityEvent): string {
    return item.eventType || item.type || 'Update';
  }

  eventDate(item: OpportunityEvent): string {
    const raw = item.eventDate || item.date || item.createdAt;
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
  }

  activityKindLabel(kind: ActivityFeedItem['kind']): string {
    if (kind === 'milestone') return 'Milestone';
    if (kind === 'update') return 'Update';
    if (kind === 'document') return 'Document';
    return 'Media';
  }

  activityKindClass(kind: ActivityFeedItem['kind']): string {
    if (kind === 'milestone') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
    if (kind === 'update') return 'border-blue-500/30 bg-blue-500/10 text-blue-200';
    if (kind === 'document') return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
    return 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200';
  }

  participationAccessText(): string {
    const context = this.participantContext();
    if (context.isApprovedParticipant || context.canAccessProjectRoom) {
      return 'Active room access';
    }
    return 'Limited room access';
  }

  investmentTermsSummary(): string {
    const overview = this.overview();
    if (overview.publicInvestmentTermsSummary) return overview.publicInvestmentTermsSummary;
    if (overview.expectedReturnSummary) return overview.expectedReturnSummary;
    return 'Investment terms are available from the founder summary and room documents.';
  }

  latestPublicUpdateSummary(): string {
    const overview = this.overview();
    return overview.latestPublicUpdate || 'No public update summary yet.';
  }

  private flattenLibrary<T>(library: T[] | Record<string, T[]> | null | undefined): T[] {
    if (!library) return [];
    if (Array.isArray(library)) {
      return library.flatMap((item: any) => Array.isArray(item?.items) ? item.items : [item]).filter(Boolean);
    }
    return Object.values(library).flat().filter(Boolean);
  }

  private sortEventsByDateDesc(items: OpportunityEvent[]): OpportunityEvent[] {
    return [...items].sort((a, b) => this.dateValueFromRaw(b.eventDate || b.date || b.createdAt) - this.dateValueFromRaw(a.eventDate || a.date || a.createdAt));
  }

  private sortByDateDesc<T>(items: T[], getRawDate: (item: T) => unknown): T[] {
    return [...items].sort((a, b) => this.dateValueFromRaw(getRawDate(b)) - this.dateValueFromRaw(getRawDate(a)));
  }

  private activityFeed(): ActivityFeedItem[] {
    const milestones: ActivityFeedItem[] = this.timeline().map((item, index) => ({
      trackKey: `milestone:${item.id ?? item.eventDate ?? item.createdAt ?? 'na'}:${index}`,
      kind: 'milestone',
      title: this.eventTitle(item),
      detail: item.description || 'Milestone update.',
      dateText: this.eventDate(item),
      dateValue: this.dateValueFromRaw(item.eventDate || item.date || item.createdAt)
    }));

    const updates: ActivityFeedItem[] = this.updates().map((item, index) => ({
      trackKey: `update:${item.id ?? item.eventDate ?? item.createdAt ?? 'na'}:${index}`,
      kind: 'update',
      title: this.eventTitle(item),
      detail: item.description || 'Founder update.',
      dateText: this.eventDate(item),
      dateValue: this.dateValueFromRaw(item.eventDate || item.date || item.createdAt)
    }));

    const documents: ActivityFeedItem[] = this.documents().map((item, index) => ({
      trackKey: `document:${item.id ?? item.fileId ?? item.fileKey ?? item.fileName ?? 'na'}:${index}`,
      kind: 'document',
      title: this.fileTitle(item),
      detail: `${this.visibility(item)} document`,
      dateText: this.uploadedDate(item),
      dateValue: this.dateValueFromRaw(this.documentRawDate(item))
    }));

    const media: ActivityFeedItem[] = this.media().map((item, index) => ({
      trackKey: `media:${item.id ?? item.fileId ?? item.fileKey ?? item.fileName ?? 'na'}:${index}`,
      kind: 'media',
      title: this.fileTitle(item),
      detail: `${this.visibility(item)} media`,
      dateText: this.uploadedDate(item),
      dateValue: this.dateValueFromRaw(this.mediaRawDate(item))
    }));

    return [...milestones, ...updates, ...documents, ...media].filter(item => item.dateValue > 0);
  }

  private dateValueFromRaw(raw: unknown): number {
    if (!raw) return 0;
    const date = new Date(String(raw));
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  private documentRawDate(item: OpportunityDocument): unknown {
    const source = item as OpportunityDocument & { uploadedAt?: unknown; createdAt?: unknown; date?: unknown };
    return source.uploadedAt || source.createdAt || source.date;
  }

  private mediaRawDate(item: OpportunityMedia): unknown {
    const source = item as OpportunityMedia & { uploadedAt?: unknown; createdAt?: unknown; date?: unknown };
    return source.uploadedAt || source.createdAt || source.date;
  }

  private async createEvent(eventType: string, title: string, description: string, isPublic: boolean, successMessage: string, onSuccess: () => void): Promise<void> {
    const opportunityId = this.opportunityId();
    if (!opportunityId) return;
    try {
      this.isSubmittingAction.set(true);
      this.actionError.set(null);
      await this.opportunityService.createEvent(opportunityId, {
        eventType,
        title: title.trim(),
        description: description?.trim() || null,
        isPublic
      });
      this.actionSuccess.set(successMessage);
      onSuccess();
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Failed to save project activity.');
    } finally {
      this.isSubmittingAction.set(false);
    }
  }

  private documentCategory(purpose: string, visibility: 'Public' | 'Private'): string {
    if (purpose === 'PublicDocument' || visibility === 'Public') return 'OpportunityPublicDocument';
    if (purpose === 'FinancialReport') return 'FinancialReport';
    if (purpose === 'Contract') return 'Contract';
    if (purpose === 'Legal') return 'Legal';
    return 'OpportunityPrivateDocument';
  }

  private documentPurposeValue(purpose: string): number {
    const values: Record<string, number> = {
      Cover: 1,
      Gallery: 2,
      PitchVideo: 3,
      PublicDocument: 4,
      PrivateDocument: 5,
      FinancialReport: 6,
      Contract: 7,
      Legal: 8,
      InternalFile: 9,
      ProjectUpdateMedia: 10,
      General: 11
    };
    return values[purpose] ?? values.PrivateDocument;
  }

  private documentVisibilityValue(visibility: 'Public' | 'Private'): number {
    return visibility === 'Public' ? 1 : 2;
  }

  private async refreshRoomData(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.room.set(await this.opportunityService.getOpportunityRoom(id));
  }

  private groupDocuments(documents: OpportunityDocument[]): Array<{ label: string; items: OpportunityDocument[] }> {
    const groups = [
      { label: 'Public Documents', keys: ['PublicDocument', 'OpportunityPublicDocument', '4'] },
      { label: 'Private Documents', keys: ['PrivateDocument', 'OpportunityPrivateDocument', '5'] },
      { label: 'Financial Reports', keys: ['FinancialReport', '6'] },
      { label: 'Contracts', keys: ['Contract', '7'] },
      { label: 'Legal', keys: ['Legal', '8'] },
      { label: 'Internal Files', keys: ['InternalFile', '9'] },
      { label: 'General', keys: ['General', '11'] }
    ];
    return groups
      .map(group => ({ label: group.label, items: documents.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
      .filter(group => group.items.length > 0);
  }

  private groupMedia(media: OpportunityMedia[]): Array<{ label: string; items: OpportunityMedia[] }> {
    const groups = [
      { label: 'Cover', keys: ['Cover', '1'] },
      { label: 'Gallery', keys: ['Gallery', '2'] },
      { label: 'Pitch Video', keys: ['PitchVideo', '3'] },
      { label: 'Project Update Media', keys: ['ProjectUpdateMedia', '10'] },
      { label: 'General', keys: ['General', '11'] }
    ];
    return groups
      .map(group => ({ label: group.label, items: media.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
      .filter(group => group.items.length > 0);
  }

  private numberValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private extensionFromName(name: string | null | undefined): string {
    if (!name || !name.includes('.')) return '';
    return name.split('.').pop() || '';
  }

  private toRoomError(error: unknown): RoomError {
    const status = error instanceof HttpErrorResponse ? error.status : (error as any)?.status;
    if (status === 403) {
      return {
        status,
        title: 'Approval required',
        message: 'Project Room is available after final participation approval.'
      };
    }
    if (status === 404) {
      return {
        status,
        title: 'Project Room not found',
        message: 'We could not find a Project Room for this opportunity.'
      };
    }
    return {
      status,
      title: 'Unable to load Project Room',
      message: (error as any)?.error?.message || (error as any)?.message || 'Please try again.'
    };
  }
}
