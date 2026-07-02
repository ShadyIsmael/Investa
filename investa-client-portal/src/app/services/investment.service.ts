import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Investment, RiskLevel, InvestmentCategory, InvestmentType, InvestmentStatus, EquityExitType } from '../models/investment.model';
import { ApiService } from './api.service';
import { InvestmentDto } from '../models/api-response.model';
import { AuthService } from './auth.service';
import { FileStoreService } from './file-store.service';
import { Opportunity, OpportunityLookup, OpportunityService } from './opportunity.service';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';

/**
 * Investment Service
 * 
 * Manages investment data with:
 * - API integration for real-time data
 * - Signal-based reactive state
 * - Category-based filtering
 * - Error handling
 */
@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private fileStoreService = inject(FileStoreService);
  private opportunityService = inject(OpportunityService);
  private destroyRef = inject(DestroyRef);
  
  // Sequence counter — any loadInvestments call that starts before the latest one is discarded
  private _loadSeq = 0;
  
  // State signals
  private _investments = signal<Investment[]>([]);
  private _categories = signal<InvestmentCategory[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly investments = this._investments.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.loadCategories();
    this.loadInvestments(); // Initial load using current auth state

    // Re-load whenever auth state changes AFTER the initial load.
    // skip(1) ignores the first emission so we don't double-load on startup.
    toObservable(this.authService.isAuthenticated)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadInvestments());
  }

  /**
   * Load categories from API (preferred) and fall back to extracting from investments
   */
  async loadCategories(): Promise<void> {
    try {
      const cats = await this.opportunityService.getCategories();
      const mapped = cats.map(c => ({
        id: Number(c.id),
        key: c.key || String(c.id),
        value: this.opportunityService.label(c),
        valueAr: this.opportunityService.label(c)
      }));
      this._categories.set(mapped);
    } catch (error) {
      console.warn('Failed to load opportunity categories from API, falling back to extract from investments', error);
      // Fallback: extract from currently loaded investments
      this.extractCategories(this._investments());
    }
  }

  /**
   * Load all investments from API
   */
  async loadInvestments(categoryId?: number): Promise<void> {
    const seq = ++this._loadSeq;

    this._loading.set(true);
    this._error.set(null);

    try {
      const opportunities = await this.opportunityService.getPublicOpportunities(categoryId ? { categoryId } : {});
      if (seq !== this._loadSeq) return;
      const investments = opportunities.map(opportunity => this.mapOpportunityToInvestment(opportunity));
      this._investments.set(investments);
    } catch (error) {
      try {
        const dtos = await this.apiService.getInvestmentsByCategory(categoryId);
        if (seq !== this._loadSeq) return;
        const investments = dtos.map(dto => this.mapDtoToInvestment(dto));
        this._investments.set(investments);
      } catch (legacyError) {
        if (seq !== this._loadSeq) return;
        const errorMsg = error instanceof Error ? error.message : 'Failed to load opportunities';
        this._error.set(errorMsg);
        console.error('Error loading public opportunities:', error);
        console.warn('Legacy investment fallback also failed:', legacyError);
        this._investments.set([]);
      }
    } finally {
      if (seq === this._loadSeq) this._loading.set(false);
    }
  }

  /**
   * Get investment by ID
   */
  async getInvestmentById(id: number, source: Investment['readSource'] = 'legacy-investment'): Promise<Investment | null> {
    return source === 'public-opportunity'
      ? this.getOpportunityThenLegacyInvestment(id)
      : this.getLegacyThenOpportunityInvestment(id);
  }

  private async getOpportunityThenLegacyInvestment(id: number): Promise<Investment | null> {
    try {
      const opportunity = await this.opportunityService.getPublicOpportunity(id);
      return this.mapOpportunityToInvestment(opportunity);
    } catch (error) {
      try {
        const dto = await this.apiService.getInvestmentById(id);
        return this.mapDtoToInvestment(dto);
      } catch (legacyError) {
        console.error(`Error fetching public opportunity ${id}:`, error);
        console.warn(`Legacy investment fallback also failed for ${id}:`, legacyError);
        return null;
      }
    }
  }

  private async getLegacyThenOpportunityInvestment(id: number): Promise<Investment | null> {
    try {
      const dto = await this.apiService.getInvestmentById(id);
      return this.mapDtoToInvestment(dto);
    } catch (legacyError) {
      try {
        const opportunity = await this.opportunityService.getPublicOpportunity(id);
        return this.mapOpportunityToInvestment(opportunity);
      } catch (error) {
        console.error(`Error fetching legacy investment ${id}:`, legacyError);
        console.warn(`Public opportunity fallback also failed for ${id}:`, error);
        return null;
      }
    }
  }

  async toggleFavorite(investmentToToggle: Investment): Promise<void> {
    if (investmentToToggle.readSource === 'public-opportunity' && !investmentToToggle.legacyInvestmentId) {
      this._investments.update(investments =>
        investments.map(inv =>
          inv.id === investmentToToggle.id ? { ...inv, favorited: !investmentToToggle.favorited } : inv
        )
      );
      return;
    }

    const updatedFavorited = !investmentToToggle.favorited;

    // Optimistic update — reflect change immediately for snappy UX
    this._investments.update(investments =>
      investments.map(inv =>
        inv.id === investmentToToggle.id ? { ...inv, favorited: updatedFavorited } : inv
      )
    );

    try {
      const confirmedFavorited = await this.apiService.toggleFavorite(investmentToToggle.legacyInvestmentId ?? investmentToToggle.id, updatedFavorited);
      // Reconcile with server-confirmed value (handles concurrent edits)
      this._investments.update(investments =>
        investments.map(inv =>
          inv.id === investmentToToggle.id ? { ...inv, favorited: confirmedFavorited } : inv
        )
      );
    } catch (error) {
      // Revert optimistic update on failure
      this._investments.update(investments =>
        investments.map(inv =>
          inv.id === investmentToToggle.id ? { ...inv, favorited: investmentToToggle.favorited } : inv
        )
      );
      throw error;
    }
  }

  /**
   * Reload investments (useful for refresh)
   */
  async refresh(): Promise<void> {
    await this.loadInvestments();
  }


  /**
   * Purchase shares in an investment opportunity
   */
  async purchaseShares(investmentId: number, sharesPurchased: number): Promise<boolean> {
    try {
      await this.apiService.purchaseShares(investmentId, sharesPurchased);
      // Refresh investments to update available shares
      await this.refresh();
      return true;
    } catch (error) {
      console.error('Error purchasing shares:', error);
      throw error;
    }
  }

  // --- Image management wrappers ---
async uploadInvestmentImage(investmentId: number, file: File, caption?: string, mediaType?: number): Promise<any> {
     return this.apiService.uploadInvestmentImage(investmentId, file, caption, mediaType);
   }

  async uploadProjectImage(projectId: number, file: File): Promise<string> {
    return this.fileStoreService.uploadProjectImage(projectId, file);
  }

  async deleteInvestmentImage(investmentId: number, imageId: number): Promise<void> {
    return this.apiService.deleteInvestmentImage(investmentId, imageId);
  }

  async setPrimaryInvestmentImage(investmentId: number, imageId: number): Promise<void> {
    return this.apiService.setPrimaryInvestmentImage(investmentId, imageId);
  }

  async reorderInvestmentImages(investmentId: number, ordering: { imageId: number; sortOrder: number }[]): Promise<void> {
    return this.apiService.reorderInvestmentImages(investmentId, ordering);
  }

  async uploadInvestmentVideo(investmentId: number, file: File, caption?: string): Promise<any> {
    return this.apiService.uploadInvestmentVideo(investmentId, file, caption);
  }

  /**
   * Get participants for an investment opportunity
   */
  async getParticipants(investmentId: number) {
    try {
      return await this.apiService.getInvestmentParticipants(investmentId);
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

/**
    * Get the cover image URL for an investment.
    * Priority: coverImage type -> isPrimary flag -> first image -> ImageUrl fallback
    */
   getCoverImageUrl(investment: Investment): string | null {
     if (!investment) return null;
     
     // Priority 1: Find CoverImage type
     if (investment.images && investment.images.length > 0) {
       const coverImage = investment.images.find(img => img.mediaType === 0); // MediaType.CoverImage = 0
       if (coverImage) return this.fileStoreService.getPublicUrl(coverImage.url);
       
       // Priority 2: Find primary image
       const primary = investment.images.find(img => img.isPrimary === true);
       if (primary) return this.fileStoreService.getPublicUrl(primary.url);
       
       // Priority 3: First image
       return this.fileStoreService.getPublicUrl(investment.images[0].url);
     }
     
     // Priority 4: Fallback to ImageUrl
     if (investment.imageUrl) {
       return this.fileStoreService.getPublicUrl(investment.imageUrl);
     }
     
     return null;
   }

   /**
    * Map backend DTO to UI Investment model
    * Supports Founding, Equity, Revenue Sharing, and Loan/Debt investment types
    */
   private mapDtoToInvestment(dto: InvestmentDto): Investment {
    // Look up category name from loaded categories
    const category = this._categories().find(c => c.id === dto.businessCategoryId);
    
    return {
      id: dto.id,
      legacyInvestmentId: dto.id,
      readSource: 'legacy-investment',
      founderId: dto.founderId,
      name: dto.businessName || 'Unnamed Opportunity',
      description: dto.description || '',
      initialCapital: dto.initialCapital ?? 0,
      date: new Date(dto.date),
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,

      businessCategoryId: dto.businessCategoryId,
      businessCategoryName: dto.businessCategoryName ?? category?.value,
      businessCategoryNameAr: dto.businessCategoryNameAr ?? category?.valueAr ?? category?.value,
      businessStageId: dto.businessStageId,
      projectPhaseId: dto.projectPhaseId,

      // Equity crowdfunding fields
      sharePrice: dto.sharePrice || 0,
      totalShares: dto.totalShares || 0,
      availableShares: dto.availableShares || 0,
      soldShares: dto.soldShares || 0,
      minInvestment: dto.minInvestment,
      maxInvestment: dto.maxInvestment,
      valuationCap: dto.valuationCap,
      expectedROI: dto.expectedROI,
      investmentType: dto.investmentTypeId ?? InvestmentType.Equity,
      status: (dto.status as InvestmentStatus) ?? InvestmentStatus.Draft,

      targetFund: dto.targetFund,
      currentFunding: dto.currentFunding ?? ((dto.soldShares ?? 0) * (dto.sharePrice ?? 0)),
      fundingPercentage: dto.fundingPercentage ?? 0,
      investorCount: dto.investorCount ?? 0,
      investedAmount: dto.investedAmount ?? 0,

      riskLevel: this.parseRiskLevel(dto.riskLevel),
      currency: dto.currency,
      momentumScore: dto.momentumScore ?? 0,
      momentumLabel: dto.momentumLabel ?? 'Building Momentum',
      lastActivityAt: dto.lastActivityAt ? new Date(dto.lastActivityAt) : undefined,
      publicActivityCount: dto.publicActivityCount ?? 0,
      participantOnlyActivityCount: dto.participantOnlyActivityCount ?? 0,
      visibilityLabel: dto.visibilityLabel ?? 'Public Overview',
      durationMonths: dto.durationMonths,
      profitPercentage: dto.profitPercentage,
      payoutFrequency: dto.payoutFrequency,

      founderDisplay: dto.founderDisplay,
      businessRole: (() => {
        let br = (dto as any).businessRole || (dto as any).founderRole || (dto as any).founderBusinessRole || '';
        if (!br && dto.founderDisplay) {
          const parts = (dto.founderDisplay as string).split(' - ');
          if (parts.length > 1) br = parts[parts.length - 1].trim();
        }
        return br;
      })(),
      credibilityScore: dto.credibilityScore || 0,

imageUrl: dto.imageUrl,
       videoUrl: dto.videoUrl,
       milestone: dto.milestone,

       // Map the images array from DTO for cover image lookup
       images: dto.images?.map(img => ({
         id: img.id,
         mediaType: img.mediaType,
         url: img.url,
         thumbnailUrl: img.thumbnailUrl,
         fileName: img.fileName,
         caption: img.caption,
         sortOrder: img.sortOrder,
         isPrimary: img.isPrimary,
         uploadedBy: img.uploadedBy
       })),

       investors: dto.participants || [],
      
      teamMembers: dto.teamMembers?.map(tm => ({
        id: tm.userId,
        name: tm.name,
        role: tm.role,
        avatar: tm.avatar,
        linkedIn: tm.linkedIn,
        bio: tm.bio,
        clientType: tm.clientType
      })) || [],
      favorited: dto.favorited ?? false,

      // ==================== Equity Exit Strategy Fields ====================
      currentValuation: dto.currentValuation,
      estimatedFutureValuation: dto.estimatedFutureValuation,
      equityExitType: dto.equityExitType as EquityExitType | undefined,
      exitTargetDate: dto.exitTargetDate ? new Date(dto.exitTargetDate) : undefined,
      expectedExitStrategy: dto.expectedExitStrategy,

      // ==================== Revenue Sharing Exit Strategy Fields ====================
      contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : undefined,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
      totalExpectedPayout: dto.totalExpectedPayout,
      remainingPayoutAmount: dto.remainingPayoutAmount,
      revenueDistributionFrequency: dto.revenueDistributionFrequency,
      contractCompletionStatus: dto.contractCompletionStatus,

      // ==================== Loan/Debt Exit Strategy Fields ====================
      repaymentStartDate: dto.repaymentStartDate ? new Date(dto.repaymentStartDate) : undefined,
      finalRepaymentDate: dto.finalRepaymentDate ? new Date(dto.finalRepaymentDate) : undefined,
      remainingBalance: dto.remainingBalance,
      totalPaidAmount: dto.totalPaidAmount,
      nextInstallmentDate: dto.nextInstallmentDate ? new Date(dto.nextInstallmentDate) : undefined,
      defaultRiskLevel: dto.defaultRiskLevel,
      loanCompletionStatus: dto.loanCompletionStatus
    } as Investment;
  }

  private mapOpportunityToInvestment(opportunity: Opportunity): Investment {
    const category = opportunity.category ?? (opportunity.categoryId ? { id: opportunity.categoryId, name: opportunity.categoryName } : null);
    const fundingTarget = Number(opportunity.fundingTarget ?? 0);
    const progress = Number(opportunity.fundingProgressPercent ?? 0);
    const founder = opportunity.founder;
    const categoryName = category ? this.lookupLabel(category) : (opportunity.categoryName || undefined);
    const created = opportunity.createdAt ? new Date(opportunity.createdAt) : new Date();
    const legacyInvestmentId = this.getLegacyInvestmentId(opportunity);

    return {
      id: Number(opportunity.id),
      opportunityId: opportunity.id,
      legacyInvestmentId,
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
      expectedReturnSummary: opportunity.expectedReturnSummary || undefined,
      publicInvestmentTermsSummary: opportunity.publicInvestmentTermsSummary || undefined,
      fundingPurpose: opportunity.fundingPurpose || opportunity.fundingUsage || undefined,
      tags: opportunity.tags?.map(tag => this.lookupLabel(tag)).filter(Boolean),
      images: this.mapOpportunityMedia(opportunity),
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

  private getLegacyInvestmentId(opportunity: Opportunity): number | undefined {
    const raw = opportunity.legacyInvestmentId ?? opportunity.investmentId ?? (opportunity as any).linkedInvestmentId;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  private mapInvestmentModel(model?: string | null): InvestmentType {
    switch ((model || '').toLowerCase()) {
      case 'equity':
        return InvestmentType.Equity;
      case 'loaninvestment':
      case 'loan':
      case 'debt':
        return InvestmentType.Loan;
      case 'capitalcontributionprofitsharing':
      case 'revenuesharing':
      case 'profitsharing':
        return InvestmentType.RevenueSharing;
      default:
        return InvestmentType.Equity;
    }
  }

  private mapOpportunityStatus(status?: string | null): InvestmentStatus {
    switch ((status || '').toLowerCase()) {
      case 'published':
      case 'active':
      case 'approved':
        return InvestmentStatus.Active;
      case 'funded':
      case 'fullyfunded':
        return InvestmentStatus.FullyFunded;
      case 'inprogress':
        return InvestmentStatus.InProgress;
      case 'paused':
        return InvestmentStatus.Paused;
      case 'completed':
        return InvestmentStatus.Completed;
      case 'archived':
        return InvestmentStatus.Archived;
      default:
        return InvestmentStatus.Draft;
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
  
  /**
   * Parse risk level from string to enum
   */
  private parseRiskLevel(risk?: string): RiskLevel {
    if (!risk) return RiskLevel.Medium;
    
    const normalized = risk.toLowerCase();
    if (normalized.includes('low')) return RiskLevel.Low;
    if (normalized.includes('high')) return RiskLevel.High;
    return RiskLevel.Medium;
  }

  /**
   * Extract unique categories from investments
   * TODO: Replace with dedicated category API endpoint when available
   */
  private extractCategories(investments: Investment[]): void {
    const categoryMap = new Map<number, InvestmentCategory>();
    
    investments.forEach(inv => {
      if (inv.businessCategoryId && inv.businessCategoryName) {
        categoryMap.set(inv.businessCategoryId, {
          id: inv.businessCategoryId,
          key: `category_${inv.businessCategoryId}`,
          value: inv.businessCategoryName,
          valueAr: inv.businessCategoryNameAr ?? inv.businessCategoryName
        });
      }
    });
    
    this._categories.set(Array.from(categoryMap.values()));
  }
}
