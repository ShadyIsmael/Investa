import { Injectable, signal, computed, inject } from '@angular/core';
import { Investment, RiskLevel, InvestmentCategory, InvestmentType, InvestmentStatus } from '../models/investment.model';
import { ApiService } from './api.service';
import { InvestmentDto } from '../models/api-response.model';

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
    // Auto-load investments and categories on service initialization
    this.loadInvestments();
    this.loadCategories();
  }

  /**
   * Load categories from API (preferred) and fall back to extracting from investments
   */
  async loadCategories(): Promise<void> {
    try {
      const cats = await this.apiService.getBusinessCategories();
      // Map API BusinessCategory to InvestmentCategory
      const mapped = cats.map(c => ({ id: c.id, key: c.key, value: c.value, valueAr: c.valueAr }));
      this._categories.set(mapped);
    } catch (error) {
      console.warn('Failed to load categories from API, falling back to extract from investments', error);
      // Fallback: extract from currently loaded investments
      this.extractCategories(this._investments());
    }
  }

  /**
   * Load all investments from API
   */
  async loadInvestments(categoryId?: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const dtos = await this.apiService.getInvestmentsByCategory(categoryId);
      // Load categories first to have them available for mapping
      await this.loadCategories();
      
      const investments = dtos.map(dto => this.mapDtoToInvestment(dto));
      this._investments.set(investments);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load investments';
      this._error.set(errorMsg);
      console.error('Error loading investments:', error);
      
      // Set empty array on error to prevent UI issues
      this._investments.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Get investment by ID
   */
  async getInvestmentById(id: number): Promise<Investment | null> {
    try {
      const dto = await this.apiService.getInvestmentById(id);
      return this.mapDtoToInvestment(dto);
    } catch (error) {
      console.error(`Error fetching investment ${id}:`, error);
      return null;
    }
  }

  /**
   * Toggle favorite status for an investment
   * Note: This is client-side only until backend implements favorites
   */
  toggleFavorite(investmentToToggle: Investment): void {
    const updatedInvestment = { 
      ...investmentToToggle, 
      favorited: !investmentToToggle.favorited 
    };

    this._investments.update(investments =>
      investments.map(inv =>
        inv.id === investmentToToggle.id ? updatedInvestment : inv
      )
    );
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
  async uploadInvestmentImage(investmentId: number, file: File, caption?: string): Promise<any> {
    return this.apiService.uploadInvestmentImage(investmentId, file, caption);
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
   * Map backend DTO to UI Investment model
   */
  private mapDtoToInvestment(dto: InvestmentDto): Investment {
    // Look up category name from loaded categories
    const category = this._categories().find(c => c.id === dto.businessCategoryId);
    
    return {
      id: dto.id,
      founderId: dto.founderId,
      name: dto.businessName || 'Unnamed Investment',
      description: dto.description || '',
      initialCapital: dto.initialCapital ?? 0,
      date: new Date(dto.date),
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,

      businessCategoryId: dto.businessCategoryId,
      businessCategoryName: category?.value,
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

      founderDisplay: dto.founderDisplay,
      // Prefer explicit businessRole from DTO, fall back to older fields, or parse from FounderDisplay when present
      businessRole: (() => {
        let br = (dto as any).businessRole || (dto as any).founderRole || (dto as any).founderBusinessRole || '';
        if (!br && dto.founderDisplay) {
          // FounderDisplay may include role like "Name - Role"; extract the trailing part
          const parts = (dto.founderDisplay as string).split(' - ');
          if (parts.length > 1) br = parts[parts.length - 1].trim();
        }
        return br;
      })(),
      credibilityScore: dto.credibilityScore || 0,

      imageUrl: dto.imageUrl,
      videoUrl: dto.videoUrl,

      favorited: false,  // Default to false, can be enhanced later
      milestone: dto.milestone,

      investors: dto.participants || [],
      
      // Map team members from backend - registered Founder/Partner users only
      teamMembers: dto.teamMembers?.map(tm => ({
        id: tm.userId,  // Required - team members must be registered users
        name: tm.name,
        role: tm.role,
        avatar: tm.avatar,
        linkedIn: tm.linkedIn,
        bio: tm.bio,
        clientType: tm.clientType
      })) || []
    } as Investment;
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
          valueAr: inv.businessCategoryName  // TODO: Add Arabic support
        });
      }
    });
    
    this._categories.set(Array.from(categoryMap.values()));
  }
}
