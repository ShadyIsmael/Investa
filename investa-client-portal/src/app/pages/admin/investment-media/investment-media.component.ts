import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InvestmentService } from '../../../services/investment.service';
import { FileStoreService } from '../../../services/file-store.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Investment } from '../../../models/investment.model';

@Component({
  standalone: true,
  selector: 'app-investment-media',
  templateUrl: './investment-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class InvestmentMediaComponent {
  private route = inject(ActivatedRoute);
  private investmentService = inject(InvestmentService);
  private fileStoreService = inject(FileStoreService);

  investment = signal<Investment | null>(null);
  loading = signal(true);
  lightboxIndex = signal<number | null>(null);

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '', 10);
    if (!id || isNaN(id)) { this.loading.set(false); return; }
    try {
      const inv = await this.investmentService.getInvestmentById(id);
      this.investment.set(inv);
    } catch {
      this.investment.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return this.fileStoreService.getPublicUrl(url);
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
