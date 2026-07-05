import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

interface RoomError {
  status?: number;
  title: string;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-opportunity-room',
  imports: [CommonModule, RouterLink],
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

  documentGroups = computed(() => this.groupDocuments(this.documents()));
  mediaGroups = computed(() => this.groupMedia(this.media()));

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
    if (item.previewUrl) return item.previewUrl;
    if (item.fileUrl) return item.fileUrl;
    return item.category && item.fileName ? this.fileStore.getPreviewUrl(item.category, item.fileName) : '';
  }

  downloadUrl(item: OpportunityMedia | OpportunityDocument): string {
    if (item.category && item.fileName) return this.fileStore.getDownloadUrl(item.category, item.fileName);
    return item.fileUrl || '';
  }

  mediaUrl(item: OpportunityMedia): string {
    return item.thumbnailUrl || item.previewUrl || item.fileUrl || '';
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

  private flattenLibrary<T>(library: T[] | Record<string, T[]> | null | undefined): T[] {
    if (!library) return [];
    if (Array.isArray(library)) return library;
    return Object.values(library).flat().filter(Boolean);
  }

  private groupDocuments(documents: OpportunityDocument[]): Array<{ label: string; items: OpportunityDocument[] }> {
    const groups = [
      { label: 'Public Documents', keys: ['PublicDocument'] },
      { label: 'Private Documents', keys: ['PrivateDocument'] },
      { label: 'Financial Reports', keys: ['FinancialReport'] },
      { label: 'Contracts', keys: ['Contract'] },
      { label: 'Legal', keys: ['Legal'] },
      { label: 'Internal Files', keys: ['InternalFile'] },
      { label: 'General', keys: ['General'] }
    ];
    return groups
      .map(group => ({ label: group.label, items: documents.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
      .filter(group => group.items.length > 0);
  }

  private groupMedia(media: OpportunityMedia[]): Array<{ label: string; items: OpportunityMedia[] }> {
    const groups = [
      { label: 'Cover', keys: ['Cover'] },
      { label: 'Gallery', keys: ['Gallery'] },
      { label: 'Pitch Video', keys: ['PitchVideo'] },
      { label: 'Project Update Media', keys: ['ProjectUpdateMedia'] },
      { label: 'General', keys: ['General'] }
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
