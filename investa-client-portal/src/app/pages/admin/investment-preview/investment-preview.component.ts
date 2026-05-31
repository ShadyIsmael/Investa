import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../services/investment.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Investment, RiskLevel, InvestmentType, getInvestmentTypeDisplay, getInvestmentTypeBadgeClass } from '../../../models/investment.model';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { UserService } from '../../../services/user.service';
import { FileStoreService } from '../../../services/file-store.service';
import { get } from 'lodash-es';

/**
 * Investment Preview Component
 * 
 * Displays detailed investment information with engagement and investment actions
 * Integrates with:
 * - InvestmentService: Load investment data from API
 * - UserService: Manage user credits
 * - RequestsService: Create investment requests
 * - NotificationService: User feedback
 * 
 * Business Logic:
 * - Validates user credits before investment
 * - Creates investment requests for founder approval
 * - Handles both equity (share-based) and funding investments
 * - Provides real-time credit balance updates
 */
@Component({
  standalone: true,
  selector: 'app-investment-preview',
  templateUrl: './investment-preview.component.html',  styleUrls: ['./investment-preview.component.scss'],  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe]
})
export class InvestmentPreviewComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private investmentService = inject(InvestmentService);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  private requestsService = inject(RequestsService);
  private userService = inject(UserService);
  private fileStoreService = inject(FileStoreService);
  
  protected readonly RiskLevel = RiskLevel;
  protected readonly InvestmentType = InvestmentType;

  // User credits from UserService
  userCredits = this.userService.credits;

  /**
   * Navigate to a team member's profile if an id is available
   */
  navigateToMemberProfile(memberId?: string | undefined): void {
    if (!memberId) {
      const msg = this.languageService.dictionary().investmentPreview?.noTeamMembers || 'Profile unavailable';
      this.notificationService.showToast({ title: 'Profile unavailable', message: msg, type: 'info' });
      return;
    }

    try {
      this.router.navigate(['/admin/clients', memberId]);
    } catch (err) {
      console.error('Navigation error:', err);
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open member profile', type: 'error' });
    }
  }

  investment = signal<Investment | null>(null);
  // Cache of founder avatar URLs by userId
  founderAvatarCache = signal<Record<string, string>>({});
  investmentToEngage = signal<Investment | null>(null);
  investmentToInvest = signal<Investment | null>(null);
  loading = signal<boolean>(false);
  engagementCreditCost = 5;
  sharesToPurchaseValue = 1;
  sharesToPurchase = signal(1);
  investmentError = signal<string | null>(null);
  investmentProcessing = signal(false);
  engagementConfirmationOpen = signal(false);
  engagementProcessing = signal(false);

  constructor() {
    this.loadInvestment();
  }

  /**
   * Load investment from API
   */
  private async loadInvestment(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!id || isNaN(id)) {
      this.investment.set(null);
      return;
    }

    this.loading.set(true);
    try {
      const inv = await this.investmentService.getInvestmentById(id);
      this.investment.set(inv);
      // Load founder avatar if founderId present
      try {
        if (inv?.founderId) {
          this.loadFounderAvatar(inv.founderId);
        }
      } catch (err) {
        // ignore
      }
    } catch (error) {
      console.error('Error loading investment:', error);
      this.investment.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadFounderAvatar(userId: string): Promise<void> {
    if (!userId) return;
    // Already cached
    if (this.founderAvatarCache()[userId]) return;
    try {
      const url = await this.fileStoreService.getProfilePictureUrl(userId);
      if (url) {
        this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: url }));
      }
    } catch (err) {
      console.warn('Failed to load founder avatar for', userId, err);
    }
  }

  founderAvatar(inv: Investment | null): string {
    if (!inv) return '';
    const uid = inv.founderId;
    const cached = uid ? this.founderAvatarCache()[uid] : undefined;
    return cached || this.resolveImageUrl(inv.imageUrl) || '';
  }

  resolveImageUrl(url?: string | null): string {
    return this.fileStoreService.getPublicUrl(url);
  }
  
  async promptEngage(investment: Investment): Promise<void> {
    // Ensure profile is fresh so dialog shows correct credits
    try {
      await this.userService.refreshUser();
    } catch (err) {
      console.warn('Failed to refresh user before engagement dialog:', err);
    }

    // Set investment and open initial engagement modal
    this.investmentToEngage.set(investment);
  }

  // --- Image Management ---
  async openManageImages(investment: Investment): Promise<void> {
    // Open a simple dialog via prompt for demo (replace with modal in future)
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          await this.investmentService.uploadInvestmentImage(investment.id, file as File);
          this.notificationService.showToast({ title: 'Success', message: 'Image uploaded', type: 'success' });
          await this.loadInvestment();
        } catch (err: any) {
          this.notificationService.showToast({ title: 'Upload failed', message: err?.message || 'Failed to upload', type: 'error' });
        }
      };
      input.click();
    } catch (err) {
      console.error('Failed to open image picker', err);
      this.notificationService.showToast({ title: 'Error', message: 'Unable to open file picker', type: 'error' });
    }
  }

  async deleteImage(investment: Investment, imageId: number): Promise<void> {
    try {
      await this.investmentService.deleteInvestmentImage(investment.id, imageId);
      this.notificationService.showToast({ title: 'Deleted', message: 'Image deleted', type: 'success' });
      await this.loadInvestment();
    } catch (err: any) {
      this.notificationService.showToast({ title: 'Failed', message: err?.message || 'Delete failed', type: 'error' });
    }
  }

  async setPrimaryImage(investment: Investment, imageId: number): Promise<void> {
    try {
      await this.investmentService.setPrimaryInvestmentImage(investment.id, imageId);
      this.notificationService.showToast({ title: 'Updated', message: 'Primary image set', type: 'success' });
      await this.loadInvestment();
    } catch (err: any) {
      this.notificationService.showToast({ title: 'Failed', message: err?.message || 'Operation failed', type: 'error' });
    }
  }

  async reorderImage(investment: Investment, fromIndex: number, toIndex: number): Promise<void> {
    const imgs = [...(investment.images || [])];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= imgs.length || toIndex >= imgs.length) return;
    const [item] = imgs.splice(fromIndex, 1);
    imgs.splice(toIndex, 0, item);
    const ordering = imgs.map((img, idx) => ({ imageId: img.id, sortOrder: idx }));
    try {
      await this.investmentService.reorderInvestmentImages(investment.id, ordering);
      this.notificationService.showToast({ title: 'Reordered', message: 'Images reordered', type: 'success' });
      await this.loadInvestment();
    } catch (err: any) {
      this.notificationService.showToast({ title: 'Failed', message: err?.message || 'Reorder failed', type: 'error' });
    }
  }

  /**
   * Open invest dialog for equity, or engagement for funding
   */
  async promptInvest(investment: Investment): Promise<void> {
    // Refresh profile first so credits are up-to-date
    try {
      await this.userService.refreshUser();
    } catch (err) {
      console.warn('Failed to refresh user before invest dialog:', err);
    }

    // Show user info
    const user = this.userService.user();
    if (user) {
      this.notificationService.showToast({
        title: 'User Information',
        message: `User ID: ${user.userId} | Credits: ${this.userCredits()}`,
        type: 'info'
      });
    }

    if (investment.investmentType === InvestmentType.Equity) {
      this.sharesToPurchaseValue = 1;
      this.investmentToInvest.set(investment);
    } else {
      await this.promptEngage(investment);
    }
  }

  closeInvestDialog(): void {
    this.investmentToInvest.set(null);
    this.investmentError.set(null);
    this.investmentProcessing.set(false);
    this.sharesToPurchaseValue = 1;
  }

  increaseShares(investment: Investment): void {
    if (this.sharesToPurchaseValue < (investment.availableShares || 0)) {
      this.sharesToPurchaseValue++;
    }
  }

  decreaseShares(): void {
    if (this.sharesToPurchaseValue > 1) {
      this.sharesToPurchaseValue--;
    }
  }

  validateShares(investment: Investment): void {
    const val = this.sharesToPurchaseValue;
    const dictionary = this.languageService.dictionary();
    const minError = get(dictionary, 'investments.shareValidation.minError', 'Shares must be at least 1');
    const maxErrorTemplate = get(dictionary, 'investments.shareValidation.maxError', 'Maximum {available} shares available');

    if (isNaN(val) || val < 1) {
      this.sharesToPurchaseValue = 1;
      this.investmentError.set(minError);
    } else if (val > (investment.availableShares || 0)) {
      this.sharesToPurchaseValue = investment.availableShares || 1;
      const available = investment.availableShares || 0;
      this.investmentError.set(maxErrorTemplate.replace('{available}', String(available)));
    } else {
      this.investmentError.set(null);
    }
  }

  calculateInvestmentAmount(investment: Investment): number {
    return (investment.sharePrice || 0) * this.sharesToPurchaseValue;
  }

  /**
   * Confirm investment request
   * 
   * Validates user has sufficient credits, then creates investment request
   * Credits are deducted immediately and request is sent to founder for approval
   * If founder accepts, investment is processed; if declined, credits are refunded
   */
  async confirmInvestment(investment: Investment): Promise<void> {
    if (this.investmentProcessing() || this.investmentError()) return;

    this.investmentProcessing.set(true);
    this.investmentError.set(null);

    // Refresh user profile to get latest credits before checking
    try {
      await this.userService.refreshUser();
    } catch (err) {
      console.warn('Failed to refresh user before confirming investment:', err);
    }

    const investmentAmount = this.calculateInvestmentAmount(investment);
    const currentCredits = this.userCredits();

    // Validate sufficient credits
    if (currentCredits < investmentAmount) {
      this.investmentError.set('Insufficient credits. Please add more credits to your account.');
      this.investmentProcessing.set(false);
      this.notificationService.showToast({
        title: 'Insufficient Credits',
        message: 'You do not have enough credits to complete this investment.',
        type: 'error'
      });
      return;
    }

    // Create investment request via API
    try {
      await this.requestsService.createInvestmentRequest(
        investment,
        investmentAmount,
        this.sharesToPurchaseValue
      );

      const { title, message } = this.getRequestSubmittedCopy(investment);
      this.notificationService.showToast({ title, message, type: 'success' });
      this.closeInvestDialog();
    } catch (error: any) {
      console.error('Investment request failed:', error);
      const apiMessage = error?.error?.message || error?.message;
      this.investmentError.set(apiMessage || 'Failed to submit investment request');
      this.notificationService.showToast({ title: 'Request Failed', message: apiMessage || 'Failed to submit investment request. Please try again.', type: 'error' });
    } finally {
      this.investmentProcessing.set(false);
    }
  }

  cancelEngage(): void {
    this.investmentToEngage.set(null);
    this.engagementConfirmationOpen.set(false);
  }

  /**
   * Cancel engagement confirmation and return to initial modal
   */
  cancelEngagementConfirmation(): void {
    this.engagementConfirmationOpen.set(false);
  }

  /**
   * Confirm engagement for funding-based investments
   * 
   * For funding/debt investments, engagement costs a fixed credit amount
   * Creates investment request similar to equity investment
   */
  async confirmEngage(): Promise<void> {
    const investment = this.investmentToEngage();
    if (!investment || this.engagementProcessing()) return;

    // Refresh user profile to ensure latest credits
    try {
      await this.userService.refreshUser();
    } catch (err) {
      console.warn('Failed to refresh user before engagement confirmation:', err);
    }

    const currentCredits = this.userCredits();

    // Validate sufficient credits for engagement
    if (currentCredits < this.engagementCreditCost) {
      this.notificationService.showToast({
        title: 'Insufficient Credits',
        message: 'You do not have enough credits for engagement.',
        type: 'error'
      });
      return;
    }

    this.engagementProcessing.set(true);

    try {
      await this.requestsService.createInvestmentRequest(investment, this.engagementCreditCost, 0);
      const { title, message } = this.getRequestSubmittedCopy(investment);
      this.notificationService.showToast({ title, message, type: 'success' });
      this.investmentToEngage.set(null);
      this.engagementConfirmationOpen.set(false);
    } catch (error: any) {
      console.error('Engagement request failed:', error);
      this.notificationService.showToast({ title: 'Request Failed', message: error.message || 'Failed to submit engagement request. Please try again.', type: 'error' });
    } finally {
      this.engagementProcessing.set(false);
    }
  }

  private getRequestSubmittedCopy(investment: Investment): { title: string; message: string } {
    const dictionary = this.languageService.dictionary();
    const title = get(dictionary, 'investments.requestSubmittedTitle', 'Request Sent');
    const messageTemplate = get(
      dictionary,
      'investments.requestSubmittedMessage',
      'Your request for {investmentName} was submitted. We will notify you once it is accepted.'
    );

    return {
      title,
      message: messageTemplate.replace('{investmentName}', investment.name)
    };
  }

  // Helpers for template
  getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
    return getInvestmentTypeDisplay(type);
  }

  getInvestmentTypeBadgeClass(type: InvestmentType | number | undefined): string {
    return getInvestmentTypeBadgeClass(type);
  }

  /**
   * Get project stages for the roadmap
   */
  getProjectStages(): string[] {
    return [
      'MVP Development',
      'Beta Testing',
      'Market Launch',
      'User Acquisition',
      'Revenue Generation',
      'Scale Operations'
    ];
  }

  /**
   * Get the current stage index based on projectPhaseId
   * Maps projectPhaseId (6-11) to stage index (0-5)
   */
  getCurrentStageIndex(): number {
    const inv = this.investment();
    if (!inv || inv.projectPhaseId === undefined || inv.projectPhaseId === null) {
      return 0;
    }

    // projectPhaseId ranges from 6 to 11 (6 phases total)
    // Map to index 0-5
    const index = inv.projectPhaseId - 6;
    return Math.max(0, Math.min(5, index));
  }
}
