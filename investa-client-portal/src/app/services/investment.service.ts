import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { Investment, RiskLevel, InvestmentCategory, InvestmentType, InvestmentStatus } from '../models/investment.model';
import { AuthService } from './auth.service';
import { FileStoreService } from './file-store.service';
import { Opportunity, OpportunityLookup, OpportunityService } from './opportunity.service';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private authService = inject(AuthService);
  private fileStoreService = inject(FileStoreService);
  private opportunityService = inject(OpportunityService);
  private destroyRef = inject(DestroyRef);

  private _loadSeq = 0;
  private _investments = signal<Investment[]>([]);
  private _categories = signal<InvestmentCategory[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly investments = this._investments.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.loadCategories();
    this.loadInvestments();

    toObservable(this.authService.isAuthenticated)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadInvestments());
  }

  async loadCategories(): Promise<void> {
    try {
      const cats = await this.opportunityService.getCategories();
      this._categories.set(cats.map(c => ({
        id: Number(c.id),
        key: c.key || String(c.id),
        value: this.opportunityService.label(c),
        valueAr: this.opportunityService.label(c)
      })));
    } catch (error) {
      console.warn('Failed to load opportunity categories from API, falling back to loaded opportunities', error);
      this.extractCategories(this._investments());
    }
  }

  async loadInvestments(categoryId?: number): Promise<void> {
    const seq = ++this._loadSeq;
    this._loading.set(true);
    this._error.set(null);

    try {
      const opportunities = await this.opportunityService.getPublicOpportunities(categoryId ? { categoryId } : {});
      if (seq !== this._loadSeq) return;
      this._investments.set(opportunities.map(opportunity => this.mapOpportunityToInvestment(opportunity)));
    } catch (error) {
      if (seq !== this._loadSeq) return;
      const errorMsg = error instanceof Error ? error.message : 'Failed to load opportunities';
      this._error.set(errorMsg);
      console.error('Error loading public opportunities:', error);
      this._investments.set([]);
    } finally {
      if (seq === this._loadSeq) this._loading.set(false);
    }
  }

  async getInvestmentById(id: number): Promise<Investment | null> {
    try {
      const opportunity = await this.opportunityService.getPublicOpportunity(id);
      return this.mapOpportunityToInvestment(opportunity);
    } catch (error) {
      console.error(`Error fetching public opportunity ${id}:`, error);
      return null;
    }
  }

  async toggleFavorite(investmentToToggle: Investment): Promise<void> {
    this._investments.update(investments =>
      investments.map(inv =>
        inv.id === investmentToToggle.id ? { ...inv, favorited: !investmentToToggle.favorited } : inv
      )
    );
  }

  async refresh(): Promise<void> {
    await this.loadInvestments();
  }

  async purchaseShares(..._args: any[]): Promise<boolean> {
    throw new Error('Participation is handled through Opportunity negotiations.');
  }

  async uploadInvestmentImage(..._args: any[]): Promise<any> {
    throw new Error('Opportunity media is managed through FileStore and Opportunity media APIs.');
  }

  async uploadProjectImage(projectId: number, file: File): Promise<string> {
    return this.fileStoreService.uploadProjectImage(projectId, file);
  }

  async deleteInvestmentImage(..._args: any[]): Promise<void> {
    throw new Error('Opportunity media deletion is not available from this screen.');
  }

  async setPrimaryInvestmentImage(..._args: any[]): Promise<void> {
    throw new Error('Opportunity media ordering is not available from this screen.');
  }

  async reorderInvestmentImages(..._args: any[]): Promise<void> {
    throw new Error('Opportunity media ordering is not available from this screen.');
  }

  async uploadInvestmentVideo(..._args: any[]): Promise<any> {
    throw new Error('Opportunity video upload is managed through FileStore and Opportunity media APIs.');
  }

  async getParticipants(..._args: any[]) {
    return [];
  }

  getCoverImageUrl(investment: Investment): string | null {
    if (!investment) return null;
    const coverImage = investment.images?.find(img => img.mediaType === 0) || investment.images?.find(img => img.isPrimary) || investment.images?.[0];
    if (coverImage?.url) return this.fileStoreService.getPublicUrl(coverImage.url);
    return investment.imageUrl ? this.fileStoreService.getPublicUrl(investment.imageUrl) : null;
  }

  private mapOpportunityToInvestment(opportunity: Opportunity): Investment {
    const opportunityId = this.getOpportunityId(opportunity);
    const category = opportunity.category ?? (opportunity.categoryId ? { id: opportunity.categoryId, name: opportunity.categoryName } : null);
    const fundingTarget = Number(opportunity.fundingTarget ?? 0);
    const progress = Number(opportunity.fundingProgressPercent ?? 0);
    const founder = opportunity.founder;
    const categoryName = category ? this.lookupLabel(category) : (opportunity.categoryName || undefined);
    const created = opportunity.createdAt ? new Date(opportunity.createdAt) : new Date();

    return {
      id: opportunityId,
      opportunityId,
      readSource: 'public-opportunity',
      founderId: String(founder?.id || founder?.userId || opportunity.founderId || ''),
      founderDisplay: founder?.displayName || founder?.fullName || founder?.name || 'Founder',
      businessRole: founder?.businessRole || founder?.summary || categoryName || '',
      name: opportunity.title || 'Untitled Opportunity',
      description: opportunity.shortDescription || opportunity.description || opportunity.fullDescription || '',
      initialCapital: 0,
      date: created,
      startDate: created,
      businessCategoryId: category ? Number(category.id) : this.toNumber(opportunity.categoryId),
      businessCategoryName: categoryName,
      businessCategoryNameAr: categoryName,
      minInvestment: this.toNumber(opportunity.minimumInvestmentAmount ?? opportunity.minimumInvestment),
      maxInvestment: this.toNumber(opportunity.maximumInvestmentAmount ?? opportunity.maximumInvestment),
      expectedROI: this.extractPercent(opportunity.expectedReturnSummary),
      investmentType: this.mapInvestmentModel(opportunity.investmentModel),
      status: this.mapOpportunityStatus(opportunity.status),
      targetFund: fundingTarget,
      currentFunding: fundingTarget > 0 ? fundingTarget * (progress / 100) : 0,
      fundingPercentage: progress,
      investorCount: 0,
      investedAmount: 0,
      riskLevel: RiskLevel.Medium,
      currency: 'USD',
      momentumScore: 0,
      momentumLabel: opportunity.latestPublicUpdate || 'Public Opportunity',
      publicActivityCount: opportunity.latestPublicUpdate ? 1 : 0,
      participantOnlyActivityCount: 0,
      visibilityLabel: 'Public Overview',
      credibilityScore: 0,
      imageUrl: opportunity.coverImageUrl || undefined,
      videoUrl: this.findPitchVideo(opportunity),
      milestone: opportunity.latestPublicUpdate || undefined,
      projectStage: opportunity.projectStage || undefined,
      shortDescription: opportunity.shortDescription || undefined,
      fullDescription: opportunity.fullDescription || opportunity.description || undefined,
      fundingGoalName: opportunity.fundingGoal ? this.lookupLabel(opportunity.fundingGoal) : opportunity.fundingGoalName || undefined,
      expectedReturnSummary: opportunity.expectedReturnSummary || undefined,
      publicInvestmentTermsSummary: opportunity.publicInvestmentTermsSummary || undefined,
      fundingPurpose: opportunity.fundingPurpose || opportunity.fundingUsage || undefined,
      tags: opportunity.tags?.map(tag => this.lookupLabel(tag)).filter(Boolean),
      images: this.mapOpportunityMedia(opportunity),
      publicEvents: this.mapOpportunityEvents(opportunity),
      publicDocuments: this.mapOpportunityDocuments(opportunity),
      investors: [],
      teamMembers: [],
      favorited: false
    } as Investment;
  }

  private mapOpportunityMedia(opportunity: Opportunity): Investment['images'] {
    const media = (opportunity as any).media;
    const images = Array.isArray(media) ? media : [];
    return images
      .filter((item: any) => this.isImageMedia(item))
      .map((item: any, index: number) => ({
        id: Number(item.id ?? index),
        mediaType: item.isCover || item.purpose === 'Cover' ? 0 : 1,
        url: item.fileUrl || item.url || item.previewUrl || item.thumbnailUrl || '',
        thumbnailUrl: item.thumbnailUrl || item.previewUrl,
        fileName: item.fileName || item.originalFileName,
        caption: item.caption,
        sortOrder: item.sortOrder ?? index,
        isPrimary: item.isCover,
        uploadedBy: item.createdByUserId
      }));
  }

  private findPitchVideo(opportunity: Opportunity): string | undefined {
    const media = (opportunity as any).media;
    if (!Array.isArray(media)) return undefined;
    const video = media.find((item: any) => item.purpose === 'PitchVideo' || String(item.mimeType || '').startsWith('video'));
    return video?.fileUrl || video?.url || video?.previewUrl || undefined;
  }

  private isImageMedia(item: any): boolean {
    return item?.isCover || item?.purpose === 'Cover' || item?.purpose === 'Gallery' || String(item?.mimeType || '').startsWith('image');
  }

  private mapOpportunityEvents(opportunity: Opportunity): Investment['publicEvents'] {
    const raw = (opportunity as any).timeline ?? (opportunity as any).events ?? [];
    const events = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
    return events
      .filter((event: any) => event?.isPublic !== false)
      .map((event: any) => ({
        id: event.id,
        title: event.title || event.eventType || event.type || 'Update',
        description: event.description,
        date: event.eventDate || event.date || event.createdAt,
        type: event.eventType || event.type,
        isPublic: event.isPublic
      }));
  }

  private mapOpportunityDocuments(opportunity: Opportunity): Investment['publicDocuments'] {
    const raw = (opportunity as any).documents ?? (opportunity as any).documentsLibrary ?? [];
    const documents = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
    return documents
      .filter((document: any) => document?.visibility !== 'Private' && document?.isPublic !== false)
      .map((document: any) => ({
        id: document.id,
        fileName: document.fileName || document.originalFileName || document.name || document.title,
        fileExtension: document.fileExtension || document.extension,
        fileSize: document.fileSize,
        fileUrl: document.fileUrl || document.url,
        previewUrl: document.previewUrl,
        purpose: document.purpose,
        visibility: document.visibility || (document.isPublic === false ? 'Private' : 'Public')
      }));
  }

  private getOpportunityId(opportunity: Opportunity): number {
    const raw = opportunity.id ?? (opportunity as any).Id ?? (opportunity as any).opportunityId;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private mapInvestmentModel(model?: string | number | null): InvestmentType {
    switch (String(model || '').toLowerCase()) {
      case 'loan':
      case 'loaninvestment':
      case 'debt':
        return InvestmentType.Loan;
      case 'capitalcontributionprofitsharing':
      case 'profitsharing':
      case 'revenuesharing':
        return InvestmentType.RevenueSharing;
      case 'equity':
      default:
        return InvestmentType.Equity;
    }
  }

  private mapOpportunityStatus(status?: string | number | null): InvestmentStatus {
    switch (String(status || '').toLowerCase()) {
      case 'published':
      case 'active':
      case 'approved':
        return InvestmentStatus.Active;
      case 'funded':
      case 'fullyfunded':
        return InvestmentStatus.FullyFunded;
      case 'paused':
        return InvestmentStatus.Paused;
      case 'completed':
        return InvestmentStatus.Completed;
      case 'archived':
        return InvestmentStatus.Archived;
      default:
        return InvestmentStatus.Active;
    }
  }

  private lookupLabel(value: OpportunityLookup | string | number | null | undefined): string {
    return this.opportunityService.label(value);
  }

  private toNumber(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private extractPercent(value?: string | null): number | undefined {
    if (!value) return undefined;
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : undefined;
  }

  private extractCategories(investments: Investment[]): void {
    const unique = new Map<number, InvestmentCategory>();
    investments.forEach(inv => {
      if (inv.businessCategoryId && inv.businessCategoryName) {
        unique.set(inv.businessCategoryId, {
          id: inv.businessCategoryId,
          key: String(inv.businessCategoryId),
          value: inv.businessCategoryName,
          valueAr: inv.businessCategoryNameAr || inv.businessCategoryName
        });
      }
    });
    this._categories.set(Array.from(unique.values()));
  }
}
