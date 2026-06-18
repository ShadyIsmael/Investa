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
import { AnalyticsService } from '../../../services/analytics.service';
import { InvestmentRequestType } from '../../../models/request.model';
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
  templateUrl: './investment-preview.component.html', styleUrls: ['./investment-preview.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush,
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
  private analyticsService = inject(AnalyticsService);

  protected readonly RiskLevel = RiskLevel;
  protected readonly InvestmentType = InvestmentType;

  // User credits from UserService
  userCredits = this.userService.credits;

  /** URL of the image currently shown in the lightbox (null = closed) */
  lightboxUrl = signal<string | null>(null);

  openLightbox(url: string): void { this.lightboxUrl.set(url); }
  closeLightbox(): void { this.lightboxUrl.set(null); }

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

  /** Founder actions */
  openContactFounder(investment: Investment): void {
    // Open credit confirmation dialog for Contact Founder
    void this.promptContactFounder(investment);
  }

  openInvestNow(investment: Investment): void {
    // Open equity investment dialog for Invest Now
    void this.promptInvestNow(investment);
  }

  openFounderProfile(investment: Investment): void {
    if (!investment?.founderId) return;
    try {
      this.router.navigate(['/admin/founders', investment.founderId]);
    } catch (err) {
      console.error('Navigation error:', err);
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open founder profile', type: 'error' });
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

  // Contact Founder flow
  contactFounderConfirmationOpen = signal(false);
  contactFounderProcessing = signal(false);
  contactFounderCreditCost = 5;

  // Invest Now flow (Equity)
  investNowDialogOpen = signal(false);
  investNowConfirmationOpen = signal(false);
  investNowProcessing = signal(false);
  equitySharesRequested = signal(1);

  // Invest Now form data
  investNowForm = signal<{
    shares: number;
    participationAmount: number;
    fundingAmount: number;
    interestMessage: string;
  }>({
    shares: 1,
    participationAmount: 0,
    fundingAmount: 0,
    interestMessage: ''
  });

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
      
      // Record view for analytics
      try {
        this.analyticsService.recordView(id).subscribe();
      } catch (err) {
        // Don't block main functionality if analytics fails
        console.warn('Failed to record view:', err);
      }
      
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
    // Try cover image first
    const coverImg = inv.images?.find(i => i.mediaType === 0);
    if (coverImg) return this.fileStoreService.getPublicUrl(coverImg.url);
    // Then try primary image
    const primary = inv.images?.find(i => i.isPrimary === true);
    if (primary) return this.fileStoreService.getPublicUrl(primary.url);
    // Then first image
    if (inv.images && inv.images.length > 0) return this.fileStoreService.getPublicUrl(inv.images[0].url);
    // Finally fall back to imageUrl
    return this.resolveImageUrl(inv.imageUrl) || '';
  }

  getHeroImageUrl(inv: Investment | null): string {
    if (!inv) return '';
    // Priority: cover image -> primary image -> first image -> imageUrl
    const coverImg = inv.images?.find(i => i.mediaType === 0);
    if (coverImg) return this.fileStoreService.getPublicUrl(coverImg.url);
    const primary = inv.images?.find(i => i.isPrimary === true);
    if (primary) return this.fileStoreService.getPublicUrl(primary.url);
    if (inv.images && inv.images.length > 0) return this.fileStoreService.getPublicUrl(inv.images[0].url);
    return this.resolveImageUrl(inv.imageUrl) || '';
  }

  resolveImageUrl(url?: string | null): string {
    return this.fileStoreService.getPublicUrl(url);
  }

  /**
   * Get project media images (excluding cover images)
   * Cover images (mediaType === 0) are not part of the project media gallery
   */
  getProjectMediaImages(inv: Investment | null): any[] {
    if (!inv || !inv.images) return [];
    return inv.images.filter(img => img.mediaType !== 0); // Filter out CoverImage type
  }

  /**
   * Get the current active cover image (if any)
   */
  getCoverImage(inv: Investment | null): any {
    if (!inv || !inv.images) return null;
    return inv.images.find(img => img.mediaType === 0); // MediaType.CoverImage = 0
  }
  
  async promptEngage(investment: Investment): Promise < void> {
  // Ensure profile is fresh so dialog shows correct credits
  try {
    await this.userService.refreshUser();
  } catch(err) {
    console.warn('Failed to refresh user before engagement dialog:', err);
  }

    // Set investment and open initial engagement modal
    this.investmentToEngage.set(investment);
}

  /**
   * Contact Founder Flow
   * Opens credit confirmation dialog, then creates request with ContactFounder type
   */
  async promptContactFounder(investment: Investment): Promise<void> {
    // Ensure profile is fresh so dialog shows correct credits
    try {
      await this.userService.refreshUser();
    } catch(err) {
      console.warn('Failed to refresh user before contact founder dialog:', err);
    }

    this.investmentToEngage.set(investment);
    this.contactFounderConfirmationOpen.set(true);
  }

  /**
   * Invest Now Flow (Equity)
   * Opens equity investment dialog for share selection
   */
  async promptInvestNow(investment: Investment): Promise<void> {
    // Ensure profile is fresh so dialog shows correct credits
    try {
      await this.userService.refreshUser();
    } catch(err) {
      console.warn('Failed to refresh user before invest now dialog:', err);
    }

    // Reset shares to 1
    this.equitySharesRequested.set(1);
    this.investmentToInvest.set(investment);
    this.investNowDialogOpen.set(true);
  }

  // --- Image Management ---
  async openManageImages(investment: Investment): Promise < void> {
  // Open a simple dialog via prompt for demo (replace with modal in future)
  try {
    const input = document.createElement('input') as HTMLInputElement;
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
  } catch(err) {
    console.error('Failed to open image picker', err);
    this.notificationService.showToast({ title: 'Error', message: 'Unable to open file picker', type: 'error' });
  }
}

  async deleteImage(investment: Investment, imageId: number): Promise < void> {
  try {
    await this.investmentService.deleteInvestmentImage(investment.id, imageId);
    this.notificationService.showToast({ title: 'Deleted', message: 'Image deleted', type: 'success' });
    await this.loadInvestment();
  } catch(err: any) {
    this.notificationService.showToast({ title: 'Failed', message: err?.message || 'Delete failed', type: 'error' });
  }
}

  async setPrimaryImage(investment: Investment, imageId: number): Promise < void> {
  try {
    await this.investmentService.setPrimaryInvestmentImage(investment.id, imageId);
    this.notificationService.showToast({ title: 'Updated', message: 'Primary image set', type: 'success' });
    await this.loadInvestment();
  } catch(err: any) {
    this.notificationService.showToast({ title: 'Failed', message: err?.message || 'Operation failed', type: 'error' });
  }
}

  async reorderImage(investment: Investment, fromIndex: number, toIndex: number): Promise < void> {
  const imgs = [...(investment.images || [])];
  if(fromIndex < 0 || toIndex < 0 || fromIndex >= imgs.length || toIndex >= imgs.length) return;
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
   * Open invest dialog for all investment types (UX validation only)
   * This is a UX flow only - no backend persistence
   */
  async promptInvest(investment: Investment): Promise < void> {
  // Refresh profile first so credits are up-to-date
  try {
    await this.userService.refreshUser();
  } catch(err) {
    console.warn('Failed to refresh user before invest dialog:', err);
  }

    // Reset form data
    this.investNowForm.update(form => ({
      ...form,
      shares: 1,
      participationAmount: 0,
      fundingAmount: 0,
      interestMessage: ''
    }));

    // Open invest dialog for all investment types
    this.investmentToInvest.set(investment);
  }

closeInvestDialog(): void {
  this.investmentToInvest.set(null);
  this.investmentError.set(null);
  this.investmentProcessing.set(false);
  this.sharesToPurchaseValue = 1;
}

submitInvestNow(investment: Investment): void {
  // UX validation only - no backend persistence
  this.notificationService.showToast({
    title: 'Interest Submitted',
    message: 'Your investment interest has been recorded (UX validation only)',
    type: 'success'
  });
  this.closeInvestDialog();
}

increaseShares(investment: Investment): void {
  if(this.sharesToPurchaseValue < (investment.availableShares || 0)) {
  this.sharesToPurchaseValue++;
}
  }

decreaseShares(): void {
  if(this.sharesToPurchaseValue > 1) {
  this.sharesToPurchaseValue--;
}
  }

validateShares(investment: Investment): void {
  const val = this.sharesToPurchaseValue;
  const dictionary = this.languageService.dictionary();
  const minError = get(dictionary, 'investments.shareValidation.minError', 'Shares must be at least 1');
  const maxErrorTemplate = get(dictionary, 'investments.shareValidation.maxError', 'Maximum {available} shares available');

  if(isNaN(val) || val < 1) {
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
  async confirmInvestment(investment: Investment): Promise < void> {
  if(this.investmentProcessing() || this.investmentError()) return;

  this.investmentProcessing.set(true);
  this.investmentError.set(null);

  // Refresh user profile to get latest credits before checking
  try {
    await this.userService.refreshUser();
  } catch(err) {
    console.warn('Failed to refresh user before confirming investment:', err);
  }

    const investmentAmount = this.calculateInvestmentAmount(investment);
  const currentCredits = this.userCredits();

  // Validate sufficient credits
  if(currentCredits <investmentAmount) {
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
  } catch(error: any) {
    console.error('Investment request failed:', error);
    const apiMessage = error?.error?.message || error?.message;
    this.investmentError.set(apiMessage || 'Failed to submit investment request');
    // Map backend error message to localized key
    const localizedMessage = apiMessage === 'You already have a pending request for this investment'
      ? this.languageService.translate('requests.pendingRequestExists')
      : (apiMessage || 'Failed to submit investment request. Please try again.');
    this.notificationService.showToast({ title: 'Request Failed', message: localizedMessage, type: 'error' });
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
 * Contact Founder Flow - Cancel
 */
cancelContactFounder(): void {
  this.investmentToEngage.set(null);
  this.contactFounderConfirmationOpen.set(false);
}

/**
 * Contact Founder Flow - Confirm
 * Creates request with ContactFounder type and null metadata
 */
async confirmContactFounder(): Promise<void> {
  const investment = this.investmentToEngage();
  if (!investment || this.contactFounderProcessing()) return;

  // Refresh user profile to ensure latest credits
  try {
    await this.userService.refreshUser();
  } catch (err) {
    console.warn('Failed to refresh user before contact founder confirmation:', err);
  }

  const currentCredits = this.userCredits();

  // Validate sufficient credits for contact founder
  if (currentCredits < this.contactFounderCreditCost) {
    this.notificationService.showToast({
      title: 'Insufficient Credits',
      message: 'You do not have enough credits to contact the founder.',
      type: 'error'
    });
    return;
  }

  this.contactFounderProcessing.set(true);

  try {
    // Create request with ContactFounder type and null metadata
    await this.requestsService.createInvestmentRequest(
      investment,
      this.contactFounderCreditCost,
      0,
      InvestmentRequestType.ContactFounder,
      null
    );

    const { title, message } = this.getRequestSubmittedCopy(investment);
    this.notificationService.showToast({ title, message, type: 'success' });
    this.investmentToEngage.set(null);
    this.contactFounderConfirmationOpen.set(false);
  } catch (error: any) {
    console.error('Contact founder request failed:', error);
    const apiMessage = error?.error?.message || error?.message;
    // Map backend error message to localized key
    const localizedMessage = apiMessage === 'You already have a pending request for this investment'
      ? this.languageService.translate('requests.pendingRequestExists')
      : (apiMessage || 'Failed to submit request. Please try again.');
    this.notificationService.showToast({ title: 'Request Failed', message: localizedMessage, type: 'error' });
  } finally {
    this.contactFounderProcessing.set(false);
  }
}

/**
 * Invest Now Flow - Close dialog
 */
closeInvestNowDialog(): void {
  this.investmentToInvest.set(null);
  this.investNowDialogOpen.set(false);
  this.investNowConfirmationOpen.set(false);
  this.investmentError.set(null);
  this.equitySharesRequested.set(1);
}

/**
 * Invest Now Flow - Proceed to confirmation
 */
proceedToInvestConfirmation(investment: Investment): void {
  const shares = this.equitySharesRequested();
  if (!investment.sharePrice || shares < 1) {
    this.investmentError.set('Invalid share selection');
    return;
  }

  const totalValue = investment.sharePrice * shares;
  const currentCredits = this.userCredits();

  if (currentCredits < totalValue) {
    this.investmentError.set('Insufficient credits for this investment');
    return;
  }

  this.investNowDialogOpen.set(false);
  this.investNowConfirmationOpen.set(true);
  this.investmentError.set(null);
}

/**
 * Invest Now Flow - Cancel confirmation
 */
cancelInvestConfirmation(): void {
  this.investNowConfirmationOpen.set(false);
  this.investNowDialogOpen.set(true);
  this.investmentError.set(null);
}

/**
 * Invest Now Flow - Confirm investment
 * Creates request with InvestmentInterest type and equity metadata
 */
async confirmInvestNow(investment: Investment): Promise<void> {
  if (this.investNowProcessing() || this.investmentError()) return;

  this.investNowProcessing.set(true);
  this.investmentError.set(null);

  // Refresh user profile to get latest credits before checking
  try {
    await this.userService.refreshUser();
  } catch(err) {
    console.warn('Failed to refresh user before confirming investment:', err);
  }

  const shares = this.equitySharesRequested();
  const totalValue = (investment.sharePrice || 0) * shares;
  const currentCredits = this.userCredits();

  // Validate sufficient credits
  if (currentCredits < totalValue) {
    this.investmentError.set('Insufficient credits. Please add more credits to your account.');
    this.investNowProcessing.set(false);
    this.notificationService.showToast({
      title: 'Insufficient Credits',
      message: 'You do not have enough credits to complete this investment.',
      type: 'error'
    });
    return;
  }

  // Create investment request with metadata
  const metadata = {
    investmentType: 'equity',
    sharesRequested: shares,
    sharePrice: investment.sharePrice,
    totalValue: totalValue
  };

  try {
    await this.requestsService.createInvestmentRequest(
      investment,
      totalValue,
      shares,
      InvestmentRequestType.InvestmentInterest,
      metadata
    );

    const { title, message } = this.getRequestSubmittedCopy(investment);
    this.notificationService.showToast({ title, message, type: 'success' });
    this.closeInvestNowDialog();
  } catch (error: any) {
    console.error('Investment request failed:', error);
    const apiMessage = error?.error?.message || error?.message;
    this.investmentError.set(apiMessage || 'Failed to submit investment request');
    this.notificationService.showToast({ title: 'Request Failed', message: apiMessage || 'Failed to submit investment request. Please try again.', type: 'error' });
  } finally {
    this.investNowProcessing.set(false);
  }
}

/**
 * Invest Now Flow - Adjust shares
 */
adjustShares(investment: Investment, delta: number): void {
  const newShares = this.equitySharesRequested() + delta;
  const maxShares = investment.availableShares || 0;

  if (newShares >= 1 && newShares <= maxShares) {
    this.equitySharesRequested.set(newShares);
    this.investmentError.set(null);
  }
}

/**
 * Invest Now Flow - Calculate total value
 */
calculateEquityTotalValue(investment: Investment): number {
  return (investment.sharePrice || 0) * this.equitySharesRequested();
}

  /**
   * Confirm engagement for funding-based investments
   * 
   * For funding/debt investments, engagement costs a fixed credit amount
   * Creates investment request similar to equity investment
   */
  async confirmEngage(): Promise < void> {
  const investment = this.investmentToEngage();
  if(!investment || this.engagementProcessing()) return;

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
  // Record learn more for analytics
  try {
    this.analyticsService.recordLearnMore(investment.id).subscribe();
  } catch (err) {
    // Don't block main functionality if analytics fails
    console.warn('Failed to record learn more:', err);
  }

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

getDaysRemaining(endDate: string | Date | undefined): number {
  if (!endDate) return -1;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/**
 * Get a human-readable description for the current status
 */
getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'Draft': 'Draft - Not yet published',
    'Active': 'Currently accepting participants',
    'Reviewing Participants': 'Reviewing participation requests',
    'In Progress': 'Project is in progress',
    'Fully Funded': 'Funding target reached',
    'Paused': 'Temporarily paused',
    'Completed': 'Project completed',
    'Archived': 'Archived',
    'Closed': 'Campaign ended'
  };
  return descriptions[status] || status || 'Unknown';
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

  /**
   * Get founder's total opportunities count
   */
  getFounderTotalOpportunities(): number {
    const inv = this.investment();
    // Use investorCount as a proxy for total opportunities for now
    return inv?.investorCount || 0;
  }

  /**
   * Get founder's active opportunities count
   */
  getFounderActiveOpportunities(): number {
    const inv = this.investment();
    return inv?.investorCount || 0;
  }

/**
    * Check if investment type is Equity
    */
  isEquity(inv: Investment | null): boolean {
    return inv?.investmentType === InvestmentType.Equity;
  }

   /**
    * Check if investment type is Revenue Sharing
    */
   isRevenueSharing(inv: Investment | null): boolean {
     return inv?.investmentType === InvestmentType.RevenueSharing;
   }

  /**
   * Check if investment type is Loan
   */
  isLoan(inv: Investment | null): boolean {
    return inv?.investmentType === InvestmentType.Loan;
  }

  /**
   * Check if investment type is Founding
   */
  isFounding(inv: Investment | null): boolean {
    return inv?.investmentType === InvestmentType.Founding;
  }
}
