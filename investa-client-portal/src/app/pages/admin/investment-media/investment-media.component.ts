import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Opportunity, OpportunityMedia, OpportunityService } from '../../../services/opportunity.service';
import { FileStoreService } from '../../../services/file-store.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

type MediaOpportunity = Opportunity & Record<string, any>;

@Component({
  standalone: true,
  selector: 'app-investment-media',
  templateUrl: './investment-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class InvestmentMediaComponent {
  private route = inject(ActivatedRoute);
  private opportunityService = inject(OpportunityService);
  private fileStoreService = inject(FileStoreService);

  investment = signal<MediaOpportunity | null>(null);
  mediaItems = signal<OpportunityMedia[]>([]);
  loading = signal(true);
  lightboxIndex = signal<number | null>(null);

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '', 10);
    if (!id || isNaN(id)) { this.loading.set(false); return; }
    try {
      const inv = await this.opportunityService.getPublicOpportunity(id);
      this.investment.set(inv as MediaOpportunity);
      this.mediaItems.set(await this.opportunityService.getMedia(id));
    } catch {
      this.investment.set(null);
      this.mediaItems.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return this.fileStoreService.getPublicUrl(url);
  }

  /**
   * Get project media images (excluding cover images)
   * Cover images (mediaType === 0) are not part of the project media gallery
   */
  getProjectMediaImages(inv: MediaOpportunity | null): OpportunityMedia[] {
    if (!inv) return [];
    return this.mediaItems().filter(img => String(img.purpose || '').toLowerCase() !== 'cover');
  }

  /**
   * Get the current active cover image (if any)
   */
  getCoverImage(inv: MediaOpportunity | null): OpportunityMedia | null {
    if (!inv) return null;
    return this.mediaItems().find(img => String(img.purpose || '').toLowerCase() === 'cover') || null;
  }

  /**
   * Get photos only (mediaType === 1, excluding cover images)
   */
  getPhotos(inv: MediaOpportunity | null): OpportunityMedia[] {
    if (!inv) return [];
    return this.mediaItems().filter(img => (img.mimeType || '').toLowerCase().startsWith('image') && String(img.purpose || '').toLowerCase() !== 'cover');
  }

  /**
   * Get videos only (mediaType === 2)
   */
  getVideos(inv: MediaOpportunity | null): OpportunityMedia[] {
    if (!inv) return [];
    return this.mediaItems().filter(img => (img.mimeType || '').toLowerCase().startsWith('video') || /\.(mp4|mov|webm)$/i.test(String(img.fileName || img.fileUrl || '')));
  }

  openLightbox(index: number): void { this.lightboxIndex.set(index); }
  closeLightbox(): void { this.lightboxIndex.set(null); }

  prevImage(total: number): void {
    const i = this.lightboxIndex();
    if (i !== null) this.lightboxIndex.set((i - 1 + total) % total);
  }

  nextImage(total: number): void {
    const i = this.lightboxIndex();
    if (i !== null) this.lightboxIndex.set((i + 1) % total);
  }

  get isYoutube(): boolean {
    const v = this.investment()?.videoUrl ?? '';
    return v.includes('youtube') || v.includes('youtu.be');
  }

  get isVimeo(): boolean {
    return (this.investment()?.videoUrl ?? '').includes('vimeo');
  }
}
