import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Opportunity, OpportunityDocument, OpportunityEvent, OpportunityLookup, OpportunityMedia, OpportunityService } from '../../../services/opportunity.service';
import { OpportunityTimelineComponent } from '../../../shared/components/opportunity-timeline/opportunity-timeline.component';
import { lookupLabel, money, opportunityDescription, opportunityTitle } from './opportunity-utils';
import { FileStoreService } from '../../../services/file-store.service';

@Component({
  standalone: true,
  selector: 'app-opportunity-details',
  imports: [CommonModule, OpportunityTimelineComponent],
  templateUrl: './opportunity-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityDetailsComponent {
  private route = inject(ActivatedRoute);
  private service = inject(OpportunityService);
  private fileStore = inject(FileStoreService);

  opportunity = signal<Opportunity | null>(null);
  categories = signal<OpportunityLookup[]>([]);
  fundingGoals = signal<OpportunityLookup[]>([]);
  media = signal<OpportunityMedia[]>([]);
  documents = signal<OpportunityDocument[]>([]);
  events = signal<OpportunityEvent[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  title = opportunityTitle;
  description = opportunityDescription;
  money = money;

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const [categories, fundingGoals, opportunity] = await Promise.all([
        this.service.getCategories(),
        this.service.getFundingGoals(),
        this.service.getPublicOpportunity(id)
      ]);
      this.categories.set(categories);
      this.fundingGoals.set(fundingGoals);
      this.opportunity.set(opportunity);
      const [media, documents, events] = await Promise.all([
        this.service.getMedia(id).catch(() => []),
        this.service.getDocuments(id).catch(() => []),
        this.service.getEvents(id).catch(() => [])
      ]);
      this.media.set(media);
      this.documents.set(documents);
      this.events.set(events);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load opportunity.');
    } finally {
      this.isLoading.set(false);
    }
  }

  label(items: OpportunityLookup[], id: string | number | null | undefined, fallback?: string | null): string {
    return lookupLabel(items, id, fallback);
  }

  tagLabel(tag: string | OpportunityLookup): string {
    return typeof tag === 'string' ? tag : this.service.label(tag);
  }

  cover(opportunity: Opportunity): string {
    return opportunity.coverImageUrl || this.mediaUrl(this.media().find(item => item.isCover || item.isPrimary)) || 'assets/boardroom-bg.jpg';
  }

  mediaUrl(item: OpportunityMedia | undefined): string {
    if (!item) return '';
    return item.fileUrl || item.previewUrl || item.thumbnailUrl || '';
  }

  previewUrl(item: OpportunityMedia | OpportunityDocument): string {
    if (item.previewUrl) return item.previewUrl;
    const category = item.category;
    const fileName = item.fileName;
    return category && fileName ? this.fileStore.getPreviewUrl(category, fileName) : (item.fileUrl || '#');
  }

  downloadUrl(item: OpportunityMedia | OpportunityDocument): string {
    const category = item.category;
    const fileName = item.fileName;
    return category && fileName ? this.fileStore.getDownloadUrl(category, fileName) : (item.fileUrl || '#');
  }

  fileTitle(item: OpportunityDocument): string {
    return item.title || item.name || item.originalFileName || item.fileName || 'Document';
  }

  fileSize(bytes: number | null | undefined): string {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
