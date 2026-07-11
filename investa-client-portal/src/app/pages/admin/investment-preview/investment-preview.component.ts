import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { UserService } from '../../../services/user.service';
import { FileStoreService } from '../../../services/file-store.service';
import { Opportunity, OpportunityLookup, OpportunityMedia, OpportunityDocument, OpportunityEvent, OpportunityService, OpportunityViewerState } from '../../../services/opportunity.service';
import { PaidActionCode, PaidActionQuote, WalletService } from '../../../services/wallet.service';
import { OpportunityRequestKind } from '../../../models/request.model';
import { ParticipationBuilderComponent } from '../../../components/participation-builder/participation-builder.component';
import { get } from 'lodash-es';

declare const ngDevMode: boolean;

type RelationshipStateKey =
  | 'viewer-state-unavailable'
  | 'never-contacted'
  | 'chat-requested'
  | 'negotiation'
  | 'ready-waiting-founder'
  | 'ready-waiting-investor'
  | 'ready-creating-participation'
  | 'participation-pending'
  | 'participant-approved'
  | 'participation-rejected'
  | 'discussion-closed';

interface RelationshipPresentation {
  state: RelationshipStateKey;
  title: string;
  description: string;
  progress: string;
  primaryAction: 'request-chat' | 'open-chat' | 'open-room' | 'none';
  primaryLabel: string;
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

enum InvestmentType {
  Founding = 1,
  Equity = 2,
  RevenueSharing = 3,
  Loan = 4
}

type OpportunityView = Opportunity & Record<string, any>;

/**
 * Investment Preview Component
 * 
 * Displays detailed investment information with engagement and investment actions
 * Integrates with:
 * - OpportunityService: Load opportunity data from API
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
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ParticipationBuilderComponent]
})
export class InvestmentPreviewComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  private requestsService = inject(RequestsService);
  private userService = inject(UserService);
  private fileStoreService = inject(FileStoreService);
  private opportunityService = inject(OpportunityService);
  private walletService = inject(WalletService);

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
  openContactFounder(investment: OpportunityView): void {
    // Open credit confirmation dialog for Contact Founder
    void this.promptContactFounder(investment);
  }

  openInvestNow(investment: OpportunityView): void {
    // Open equity investment dialog for Invest Now
    void this.promptInvestNow(investment);
  }

  openChat(): void {
    const conversationId = this.viewerState()?.conversationId;
    this.router.navigate(['/admin/chat'], conversationId ? { queryParams: { conversationId } } : undefined);
  }

  async requestChat(opportunity: Opportunity): Promise<void> {
    const opportunityId = this.getPublicOpportunityId(opportunity);
    if (!opportunityId || !this.showRequestChatButton()) return;
    await this.promptContactFounder(opportunity as OpportunityView);
  }

  openParticipationBuilder(): void {
    if (!this.canOpenParticipationBuilder()) return;
    this.participationBuilderOpen.set(true);
  }

  closeParticipationBuilder(): void {
    this.participationBuilderOpen.set(false);
  }

  async onParticipationSubmitted(): Promise<void> {
    this.participationBuilderOpen.set(false);
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (opportunityId) {
      await this.loadViewerState(opportunityId);
    }
  }

  openFounderProfile(investment: OpportunityView): void {
    if (!investment?.founderId) return;
    try {
      this.router.navigate(['/admin/founders', investment.founderId]);
    } catch (err) {
      console.error('Navigation error:', err);
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open founder profile', type: 'error' });
    }
  }

  investment = signal<OpportunityView | null>(null);
  publicOpportunity = signal<Opportunity | null>(null);
  viewerState = signal<OpportunityViewerState | null>(null);
  relationshipState = computed(() => this.getRelationshipState());
  participationStatus = this.relationshipState;
  // Cache of founder avatar URLs by userId
  founderAvatarCache = signal<Record<string, string>>({});
  investmentToEngage = signal<OpportunityView | null>(null);
  investmentToInvest = signal<OpportunityView | null>(null);
  loading = signal<boolean>(false);
  engagementCreditCost = 0;
  sharesToPurchaseValue = 1;
  sharesToPurchase = signal(1);
  investmentError = signal<string | null>(null);
  investmentProcessing = signal(false);
  engagementConfirmationOpen = signal(false);
  engagementProcessing = signal(false);
  participationBuilderOpen = signal(false);

  // Contact Founder flow
  contactFounderConfirmationOpen = signal(false);
  contactFounderProcessing = signal(false);
  contactFounderCreditCost = 0;
  contactFounderQuote = signal<PaidActionQuote | null>(null);
  investNowQuote = signal<PaidActionQuote | null>(null);

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
   * Loading rules:
   * - Founder owner + Draft → use authenticated endpoint
   * - Published/public → use public endpoint
   * - Non-owner must never access Draft (enforced by backend)
   */
  private async loadInvestment(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!id || isNaN(id)) {
      this.investment.set(null);
      this.publicOpportunity.set(null);
      return;
    }

    this.loading.set(true);
    try {
      const opportunityId = id;
      
      // First try to load viewer state to determine if user is founder
      let viewerState: OpportunityViewerState | null = null;
      try {
        viewerState = await this.opportunityService.getViewerState(opportunityId);
        this.viewerState.set(viewerState);
      } catch (error) {
        // Viewer state might fail for public opportunities, continue
        console.warn('Could not load viewer state, will try public endpoint');
      }

      // Load opportunity data
      let opportunity: Opportunity;
      if (viewerState?.isFounder) {
        // Founder viewing their own opportunity - use authenticated endpoint
        // This allows founders to view their Draft opportunities
        opportunity = await this.opportunityService.getFounderOpportunity(opportunityId);
      } else {
        // Public or non-founder - use public endpoint
        opportunity = await this.opportunityService.getPublicOpportunity(opportunityId);
      }

      this.publicOpportunity.set(opportunity);
      this.investment.set(opportunity as OpportunityView);

      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        console.log('Opportunity loaded', opportunity, 'isFounder:', viewerState?.isFounder);
      }
      
      // Load founder avatar if founderId present
      try {
        const founderId = this.getFounderId(opportunity);
        if (founderId) {
          this.loadFounderAvatar(founderId);
        }
      } catch (err) {
        // ignore
      }
    } catch (error) {
      console.error('Error loading investment:', error);
      this.investment.set(null);
      this.publicOpportunity.set(null);
      this.viewerState.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadViewerState(opportunityId: number): Promise<void> {
    // Viewer state is now loaded in loadInvestment() to determine endpoint
    // This method is kept for refresh scenarios
    try {
      const state = await this.opportunityService.getViewerState(opportunityId);
      this.viewerState.set(state);
    } catch (error) {
      console.warn(`Could not load viewer state for Opportunity ${opportunityId}.`, error);
      this.viewerState.set(null);
    }
  }

  getPublicOpportunityId(opportunity: Opportunity | null): number | null {
    return this.parsePositiveNumber(opportunity?.id ?? (opportunity as any)?.opportunityId);
  }

  getFounderId(opportunity: Opportunity | null): string {
    return String(opportunity?.founder?.id || opportunity?.founder?.userId || opportunity?.founderId || '');
  }

  getFounderName(opportunity: Opportunity | null): string {
    const founder = opportunity?.founder;
    return founder?.name || founder?.displayName || founder?.fullName || 'Founder';
  }

  getOpportunityLabel(value: OpportunityLookup | string | number | null | undefined): string {
    return this.opportunityService.label(value);
  }

  getOpportunityStatus(opportunity: Opportunity | null): any {
    const status = opportunity?.status;
    const statusStr = String(status || '').toLowerCase();
    
    // Handle numeric enum values from backend
    // Draft = 1, Published = 5, Funding = 6, FullyFunded = 7, InProgress = 8, Completed = 9, Archived = 10
    // Review states (UnderReview=2, Rejected=3, Approved=4) are no longer used
    switch (statusStr) {
      case '1':
      case 'draft':
        return 'Draft';
      case '5':
      case 'published':
      case 'active':
      case '4':
      case 'approved':
        return 'Active';
      case '6':
      case 'funding':
        return 'Funding';
      case '7':
      case 'fullyfunded':
        return 'Fully Funded';
      case '8':
      case 'inprogress':
        return 'In Progress';
      case '9':
      case 'completed':
        return 'Completed';
      case '10':
      case 'archived':
        return 'Archived';
      default:
        return statusStr || 'Active';
    }
  }

  getOpportunityInvestmentType(opportunity: Opportunity | null): InvestmentType {
    switch (String(opportunity?.investmentModel || '').toLowerCase()) {
      case 'loaninvestment':
      case 'loan':
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

  getOpportunityInvestmentModelLabel(opportunity: Opportunity | null): string {
    return this.getInvestmentTypeDisplay(this.getOpportunityInvestmentType(opportunity));
  }

  getOpportunityCoverUrl(opportunity: Opportunity | null): string {
    const media = this.getOpportunityMedia(opportunity);
    const cover = media.find(item => item.isCover || item.purpose === 'Cover');
    return this.resolveImageUrl(cover?.fileUrl || cover?.previewUrl || cover?.thumbnailUrl || opportunity?.coverImageUrl || '');
  }

  getOpportunityGallery(opportunity: Opportunity | null): OpportunityMedia[] {
    return this.getOpportunityMedia(opportunity).filter(item => {
      const mime = String(item.mimeType || '');
      return item.purpose === 'Gallery' || (!!mime && mime.startsWith('image') && item.purpose !== 'Cover' && !item.isCover);
    });
  }

  getOpportunityPitchVideo(opportunity: Opportunity | null): OpportunityMedia | null {
    return this.getOpportunityMedia(opportunity).find(item => item.purpose === 'PitchVideo' || String(item.mimeType || '').startsWith('video')) || null;
  }

  getOpportunityDocuments(opportunity: Opportunity | null): OpportunityDocument[] {
    const raw = (opportunity as any)?.documents ?? (opportunity as any)?.documentsLibrary ?? [];
    const docs = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
    return (docs as OpportunityDocument[]).filter(doc => doc.visibility !== 'Private' && doc.isPublic !== false);
  }

  getOpportunityEvents(opportunity: Opportunity | null): OpportunityEvent[] {
    const raw = (opportunity as any)?.events ?? (opportunity as any)?.timeline ?? [];
    const events = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
    return (events as OpportunityEvent[]).filter(event => event.isPublic !== false);
  }

  getOpportunityFileUrl(file: OpportunityMedia | OpportunityDocument | null): string {
    return this.resolveImageUrl(file?.fileUrl || file?.previewUrl || file?.thumbnailUrl || '');
  }

  getOpportunityFundingProgress(opportunity: Opportunity | null): number {
    const parsed = Number(opportunity?.fundingProgressPercent ?? 0);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, parsed));
  }

  getUseOfFunds(opportunity: Opportunity | null): string {
    return (opportunity as any)?.useOfFunds || opportunity?.fundingPurpose || opportunity?.fundingUsage || '';
  }

  getRelationshipState(): RelationshipPresentation {
    const state = this.viewerState();
    const conversationStatus = this.normalizeConversationStatus(state?.conversationStatus, state?.conversationStatusText);
    const conversationRequestStatus = this.normalizeConversationRequestStatus(state?.conversationRequestStatus, state?.conversationRequestStatusText);
    const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);

    if (!state) {
      return {
        state: 'viewer-state-unavailable',
        title: 'Relationship status unavailable',
        description: 'We could not load your current relationship with this opportunity.',
        progress: 'Refresh the page or sign in to see your next action.',
        primaryAction: 'none',
        primaryLabel: 'Unavailable',
        tone: 'warning'
      };
    }

    if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || participationStatus.includes('approved')) {
      return {
        state: 'participant-approved',
        title: 'Participation approved',
        description: 'You are now an approved Project Participant.',
        progress: 'Project Room access is unlocked for private documents, updates, downloads, and collaboration.',
        primaryAction: 'open-room',
        primaryLabel: 'Open Project Room',
        tone: 'success'
      };
    }
    if (participationStatus.includes('rejected') || participationStatus.includes('declined')) {
      return {
        state: 'participation-rejected',
        title: 'Participation not approved',
        description: 'The Participation Request was declined by the Founder.',
        progress: 'Project Room remains locked. Continue only through the existing conversation if both sides agree.',
        primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
        primaryLabel: state.hasConversation && state.conversationId ? 'View Conversation' : 'No action available',
        tone: 'danger'
      };
    }
    if (state.hasPendingParticipationRequest || participationStatus.includes('pending') || conversationStatus.includes('participationcreated')) {
      return {
        state: 'participation-pending',
        title: 'Participation Request Pending',
        description: 'Your Participation Request is waiting for Founder approval.',
        progress: 'Project Room remains locked until the Founder gives final approval.',
        primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
        primaryLabel: state.hasConversation && state.conversationId ? 'View Conversation' : 'Waiting for Founder',
        tone: 'warning'
      };
    }
    if (conversationStatus.includes('closed') || conversationStatus.includes('withdraw') || conversationStatus.includes('reject') || conversationStatus.includes('declin') || conversationStatus.includes('cancel')) {
      return {
        state: 'discussion-closed',
        title: 'Discussion Closed',
        description: 'The conversation for this opportunity is closed.',
        progress: 'There is no active participation workflow from this discussion.',
        primaryAction: state.canRequestChat ? 'request-chat' : 'none',
        primaryLabel: state.canRequestChat ? 'Request Chat' : 'No action available',
        tone: 'neutral'
      };
    }
    if (conversationStatus.includes('readyforparticipation')) {
      if (state.investorReady && !state.founderReady) {
        return {
          state: 'ready-waiting-founder',
          title: 'You are ready to proceed',
          description: 'You marked yourself ready after negotiation.',
          progress: 'Waiting for the Founder to confirm readiness before a Participation Request is created.',
          primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
          primaryLabel: state.hasConversation && state.conversationId ? 'Continue Conversation' : 'Waiting for Founder',
          tone: 'info'
        };
      }

      if (state.founderReady && !state.investorReady) {
        return {
          state: 'ready-waiting-investor',
          title: 'Founder is ready to proceed',
          description: 'Review the negotiation and confirm when you are ready.',
          progress: 'Participation is not created until both sides are ready.',
          primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
          primaryLabel: state.hasConversation && state.conversationId ? 'Continue Conversation' : 'Review Conversation',
          tone: 'info'
        };
      }

      return {
        state: 'ready-creating-participation',
        title: 'Ready for participation',
        description: 'Both sides are ready to proceed.',
        progress: 'The formal Participation Request is being prepared or already created by the backend workflow.',
        primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
        primaryLabel: state.hasConversation && state.conversationId ? 'View Conversation' : 'Waiting',
        tone: 'info'
      };
    }
    if (conversationStatus.includes('accepted') || conversationStatus.includes('progress') || conversationStatus.includes('negotiation')) {
      return {
        state: 'negotiation',
        title: 'Negotiation in Progress',
        description: 'You and the Founder are discussing this opportunity.',
        progress: 'Chat is not participation. Project Room unlocks only after a Participation Request is approved.',
        primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
        primaryLabel: state.hasConversation && state.conversationId ? 'Continue Conversation' : 'Conversation unavailable',
        tone: 'info'
      };
    }
    if (state.hasConversationRequest && !state.hasConversation && (conversationRequestStatus.includes('pending') || conversationRequestStatus.includes('requested'))) {
      return {
        state: 'chat-requested',
        title: 'Waiting for Founder response',
        description: 'Your chat request has been sent to the Founder.',
        progress: 'No duplicate request is needed. Participation actions appear only after negotiation progresses.',
        primaryAction: 'none',
        primaryLabel: 'Waiting for Founder',
        tone: 'warning'
      };
    }

    return {
      state: 'never-contacted',
      title: 'Start the discussion',
      description: 'Request a chat to learn more and discuss this opportunity with the Founder.',
      progress: 'Chat opens negotiation only. It does not make you a Participant.',
      primaryAction: state.canRequestChat ? 'request-chat' : 'none',
      primaryLabel: state.canRequestChat ? 'Request Chat' : 'No action available',
      tone: 'neutral'
    };
  }

  showRequestChatButton(): boolean {
    return this.relationshipState().primaryAction === 'request-chat' && this.viewerState()?.canRequestChat === true;
  }

  showOpenChatButton(): boolean {
    const state = this.viewerState();
    return this.relationshipState().primaryAction === 'open-chat' && state?.hasConversation === true && !!state.conversationId;
  }

  showParticipateButton(): boolean {
    return this.canOpenParticipationBuilder();
  }

  canOpenParticipationBuilder(): boolean {
    const state = this.viewerState();
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (!opportunityId || state?.isFounder) return false;
    if (state?.projectRoomUnlocked || state?.canOpenProjectRoom) return false;
    if (state?.hasPendingParticipationRequest) return false;
    const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);
    return !participationStatus.includes('pending') && !participationStatus.includes('approved');
  }

  showProjectRoomButton(): boolean {
    return this.relationshipState().primaryAction === 'open-room';
  }

  canEndDiscussion(): boolean {
    return false;
  }

  endDiscussion(): void {
    this.notificationService.showToast({
      title: 'Discussion close coming soon',
      message: 'Closing a discussion needs a backend negotiation endpoint.',
      type: 'info'
    });
  }

  private getOpportunityMedia(opportunity: Opportunity | null): OpportunityMedia[] {
    const raw = (opportunity as any)?.media ?? (opportunity as any)?.mediaLibrary ?? [];
    const media = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
    return (media as OpportunityMedia[]).filter(item => item.isPublic !== false);
  }

  getTimelineEvents(opportunity: Opportunity | null): OpportunityEvent[] {
    return this.getOpportunityEvents(opportunity).filter(event => !this.isOperationalUpdate(event));
  }

  getUpdateEvents(opportunity: Opportunity | null): OpportunityEvent[] {
    return this.getOpportunityEvents(opportunity).filter(event => this.isOperationalUpdate(event));
  }

  getEventDate(event: OpportunityEvent | null): string | null {
    return event?.eventDate || event?.date || event?.createdAt || null;
  }

  getRelationshipToneClass(tone: RelationshipPresentation['tone']): string {
    switch (tone) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
      case 'danger':
        return 'border-red-500/30 bg-red-500/10 text-red-100';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-100';
      default:
        return 'border-slate-600/60 bg-slate-900/60 text-slate-100';
    }
  }

  private isOperationalUpdate(event: OpportunityEvent): boolean {
    const type = String(event.eventType || event.type || event.title || '').toLowerCase();
    return ['update', 'announcement', 'document', 'uploaded', 'purchased', 'supplier', 'equipment', 'photo', 'progress'].some(token => type.includes(token));
  }

  private normalizeConversationStatus(value: unknown, statusText?: string | null): string {
    if (typeof value === 'number') {
      switch (value) {
        case 0: return 'requested';
        case 1: return 'accepted';
        case 2: return 'negotiation';
        case 3: return 'closedbyfounder';
        case 4: return 'closedbyinvestor';
        case 5: return 'cancelled';
        case 6: return 'closed';
        case 7: return 'readyforparticipation';
        case 8: return 'participationcreated';
        case 9: return 'participationapproved';
        case 10: return 'participationrejected';
        case 11: return 'declinedbyfounder';
      }
    }

    const raw = `${value ?? ''} ${statusText ?? ''}`;
    return raw.toLowerCase().replace(/[\s_-]+/g, '');
  }

  private normalizeConversationRequestStatus(value: unknown, statusText?: string | null): string {
    if (typeof value === 'number') {
      switch (value) {
        case 0: return 'pending';
        case 1: return 'accepted';
        case 2: return 'rejected';
        case 3: return 'withdrawn';
      }
    }

    const raw = `${value ?? ''} ${statusText ?? ''}`;
    return raw.toLowerCase().replace(/[\s_-]+/g, '');
  }

  private normalizeParticipationStatus(value: unknown): string {
    if (typeof value === 'number') {
      switch (value) {
        case 0: return 'pending';
        case 1: return 'approved';
        case 2: return 'rejected';
        case 3: return 'cancelled';
      }
    }

    return String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
  }

  private parsePositiveNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private extractPercent(value?: string | null): number | undefined {
    if (!value) return undefined;
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : undefined;
  }

  private async loadFounderAvatar(userId: string): Promise<void> {
    if (!userId) return;
    // Already cached
    if (Object.prototype.hasOwnProperty.call(this.founderAvatarCache(), userId)) return;
    try {
      const url = await this.fileStoreService.getProfilePictureUrl(userId);
      this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: url || '' }));
    } catch (err) {
      this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: '' }));
      console.warn('Failed to load founder avatar for', userId, err);
    }
  }

  onFounderAvatarError(userId: string): void {
    if (!userId) return;
    this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: '' }));
  }

  founderAvatar(inv: OpportunityView | null): string {
    if (!inv) return '';
    const uid = this.getFounderId(inv);
    const cached = uid ? this.founderAvatarCache()[uid] : undefined;
    if (cached) return cached;
    return this.getOpportunityCoverUrl(inv);
  }

  getHeroImageUrl(inv: OpportunityView | null): string {
    if (!inv) return '';
    return this.getOpportunityCoverUrl(inv);
  }

  getRoomOpportunityId(inv: OpportunityView | null): string | number | null {
    if (!inv) return null;
    return inv.id ?? null;
  }

  resolveImageUrl(url?: string | null): string {
    return this.fileStoreService.getPublicUrl(url);
  }

  /**
   * Get project media images (excluding cover images)
   * Cover images (mediaType === 0) are not part of the project media gallery
   */
  getProjectMediaImages(inv: OpportunityView | null): OpportunityMedia[] {
    return this.getOpportunityGallery(inv);
  }

  /**
   * Get the current active cover image (if any)
   */
  getCoverImage(inv: OpportunityView | null): OpportunityMedia | null {
    return this.getOpportunityPitchVideo(inv);
  }

  /**
   * Check if the current opportunity is in Draft status
   * Backend sends numeric enum: Draft = 1, UnderReview = 2, etc.
   */
  isDraft(): boolean {
    const status = this.publicOpportunity()?.status;
    const statusStr = String(status || '').toLowerCase();
    // Handle both numeric enum (1 = Draft) and string values
    return statusStr === '1' || statusStr === 'draft';
  }

  /**
   * Check if the current user is the founder of this opportunity
   * Compares current user ID with opportunity founderId directly
   * Does not depend on viewer state which may fail for Draft opportunities
   */
  isFounder(): boolean {
    const currentUserId = this.userService.user()?.userId;
    const opportunityFounderId = this.getFounderId(this.publicOpportunity());
    return currentUserId === opportunityFounderId;
  }

  /**
   * Publish the opportunity directly
   * Note: Backend currently only supports submit-review workflow
   * This method uses submit-review as a workaround until direct publish API is available
   */
  async publishOpportunity(): Promise<void> {
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (!opportunityId) return;

    try {
      this.engagementProcessing.set(true);
      await this.opportunityService.submitForReview(opportunityId);
      this.notificationService.showToast({
        title: 'Opportunity Published',
        message: 'Your opportunity has been published and is now visible to investors.',
        type: 'success'
      });
      // Reload to get updated status
      await this.loadInvestment();
    } catch (error: any) {
      this.notificationService.showToast({
        title: 'Publish Failed',
        message: error?.error?.message || error?.message || 'Unable to publish opportunity.',
        type: 'error'
      });
    } finally {
      this.engagementProcessing.set(false);
    }
  }

  /**
   * Navigate to edit the opportunity
   */
  editOpportunity(): void {
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (opportunityId) {
      this.router.navigate(['/admin/opportunities', opportunityId, 'edit']);
    }
  }
  
  async promptEngage(investment: OpportunityView): Promise < void> {
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
  async promptContactFounder(investment: OpportunityView): Promise<void> {
    // Ensure profile is fresh so dialog shows correct credits
    try {
      await this.userService.refreshUser();
    } catch(err) {
      console.warn('Failed to refresh user before contact founder dialog:', err);
    }

    this.investmentToEngage.set(investment);
    try {
      this.contactFounderQuote.set(await this.loadPaidActionQuote('SendConversationRequest'));
    } catch (error: any) {
      this.notificationService.showToast({
        title: this.t('paidActions.pricingUnavailableTitle'),
        message: error?.message || this.t('paidActions.pricingUnavailableMessage'),
        type: 'error'
      });
      return;
    }
    this.contactFounderConfirmationOpen.set(true);
  }

  /**
   * Invest Now Flow (Equity)
   * Opens equity investment dialog for share selection
   */
  async promptInvestNow(investment: OpportunityView): Promise<void> {
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

  /**
   * Open invest dialog for all investment types (UX validation only)
   * This is a UX flow only - no backend persistence
   */
  async promptInvest(investment: OpportunityView): Promise < void> {
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

submitInvestNow(investment: OpportunityView): void {
  // UX validation only - no backend persistence
  this.notificationService.showToast({
    title: 'Interest Submitted',
    message: 'Your investment interest has been recorded (UX validation only)',
    type: 'success'
  });
  this.closeInvestDialog();
}

increaseShares(investment: OpportunityView): void {
  if(this.sharesToPurchaseValue < (investment.availableShares || 0)) {
  this.sharesToPurchaseValue++;
}
  }

decreaseShares(): void {
  if(this.sharesToPurchaseValue > 1) {
  this.sharesToPurchaseValue--;
}
  }

validateShares(investment: OpportunityView): void {
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

calculateRequestedAmount(investment: OpportunityView): number {
  return (investment.sharePrice || 0) * this.sharesToPurchaseValue;
}

  /**
   * Confirm investment request
   * 
   * Validates user has sufficient credits, then creates investment request
   * Credits are deducted immediately and request is sent to founder for approval
   * If founder accepts, investment is processed; if declined, credits are refunded
   */
  async confirmInvestment(investment: OpportunityView): Promise < void> {
  if(this.investmentProcessing() || this.investmentError()) return;

  this.investmentProcessing.set(true);
  this.investmentError.set(null);

  // Refresh user profile to get latest credits before checking
  try {
    await this.userService.refreshUser();
  } catch(err) {
    console.warn('Failed to refresh user before confirming investment:', err);
  }

    const requestedAmount = this.calculateRequestedAmount(investment);
  const quote = await this.loadPaidActionQuote('SubmitParticipationRequest');

  // Validate sufficient credits
  if(!quote.hasSufficientCredit) {
    this.investmentError.set(this.insufficientCreditText(quote));
    this.investmentProcessing.set(false);
    this.notificationService.showToast({
      title: this.t('paidActions.insufficientTitle'),
      message: this.insufficientCreditText(quote),
      type: 'error'
    });
    return;
  }

    // Create investment request via API
    try {
    await this.requestsService.createOpportunityRequest(
      investment,
      requestedAmount,
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

  const quote = this.contactFounderQuote() || await this.loadPaidActionQuote('SendConversationRequest');

  // Validate sufficient credits for contact founder
  if (!quote.hasSufficientCredit) {
    this.notificationService.showToast({
      title: this.t('paidActions.insufficientTitle'),
      message: this.insufficientCreditText(quote),
      type: 'error'
    });
    return;
  }

  this.contactFounderProcessing.set(true);

  try {
    const opportunityId = this.getPublicOpportunityId(investment);
    if (opportunityId) {
      await this.opportunityService.requestConversation(opportunityId);
      await this.loadViewerState(opportunityId);
    }

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
async proceedToInvestConfirmation(investment: OpportunityView): Promise<void> {
  const shares = this.equitySharesRequested();
  if (!investment.sharePrice || shares < 1) {
    this.investmentError.set(this.t('paidActions.errors.invalidShareSelection'));
    return;
  }

  try {
    const quote = await this.loadPaidActionQuote('SubmitParticipationRequest');
    this.investNowQuote.set(quote);
    if (!quote.hasSufficientCredit) {
      this.investmentError.set(this.insufficientCreditText(quote));
      return;
    }
  } catch (error: any) {
    this.investmentError.set(error?.message || this.t('paidActions.pricingUnavailableMessage'));
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
async confirmInvestNow(investment: OpportunityView): Promise<void> {
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
  const quote = this.investNowQuote() || await this.loadPaidActionQuote('SubmitParticipationRequest');

  // Validate sufficient credits
  if (!quote.hasSufficientCredit) {
    this.investmentError.set(this.insufficientCreditText(quote));
    this.investNowProcessing.set(false);
    this.notificationService.showToast({
      title: this.t('paidActions.insufficientTitle'),
      message: this.insufficientCreditText(quote),
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
    await this.requestsService.createOpportunityRequest(
      investment,
      totalValue,
      shares,
      OpportunityRequestKind.Participation,
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
adjustShares(investment: OpportunityView, delta: number): void {
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
calculateEquityTotalValue(investment: OpportunityView): number {
  return (investment.sharePrice || 0) * this.equitySharesRequested();
}

paidActionCost(quote: PaidActionQuote | null): number {
  return Number(quote?.creditCost ?? 0);
}

paidActionBalance(quote: PaidActionQuote | null): number {
  return Number(quote?.currentBalance ?? this.userCredits());
}

paidActionAfter(quote: PaidActionQuote | null): number {
  return Number(quote?.balanceAfter ?? this.paidActionBalance(quote) - this.paidActionCost(quote));
}

paidActionInsufficient(quote: PaidActionQuote | null): boolean {
  return !!quote && !quote.hasSufficientCredit;
}

addCredits(): void {
  this.router.navigate(['/admin/credit-charge']);
}

t(path: string): string {
  return this.languageService.translate(path);
}

private async loadPaidActionQuote(actionCode: PaidActionCode): Promise<PaidActionQuote> {
  return this.walletService.getPaidActionQuote(actionCode);
}

private insufficientCreditText(quote: PaidActionQuote): string {
  return this.t('paidActions.insufficientMessage')
    .replace('{required}', this.formatCredits(quote.creditCost))
    .replace('{balance}', this.formatCredits(quote.currentBalance));
}

private formatCredits(value: number): string {
  return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
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

const quote = await this.loadPaidActionQuote('SendConversationRequest');

// Validate sufficient credits for engagement
if (!quote.hasSufficientCredit) {
  this.notificationService.showToast({
    title: this.t('paidActions.insufficientTitle'),
    message: this.insufficientCreditText(quote),
    type: 'error'
  });
  return;
}

this.engagementProcessing.set(true);

try {
  const opportunityId = this.getPublicOpportunityId(investment);
  if (opportunityId) {
    await this.opportunityService.requestConversation(opportunityId);
    await this.loadViewerState(opportunityId);
  }
  const { title, message } = this.getRequestSubmittedCopy(investment);
  this.notificationService.showToast({ title, message, type: 'success' });
  this.investmentToEngage.set(null);
  this.engagementConfirmationOpen.set(false);
} catch (error: any) {
  console.error('Engagement request failed:', error);
  this.notificationService.showToast({ title: this.t('paidActions.requestFailed'), message: error.message || this.t('paidActions.errors.chatRequestFailed'), type: 'error' });
} finally {
  this.engagementProcessing.set(false);
}
  }

  private getRequestSubmittedCopy(investment: OpportunityView): { title: string; message: string } {
  const dictionary = this.languageService.dictionary();
  const title = get(dictionary, 'investments.requestSubmittedTitle', 'Request Sent');
  const messageTemplate = get(
    dictionary,
    'investments.requestSubmittedMessage',
    'Your request for {investmentName} was submitted. We will notify you once it is accepted.'
  );

  return {
    title,
    message: messageTemplate.replace('{investmentName}', investment.title || investment.name || 'Opportunity')
  };
}

// Helpers for template
getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
  if (type === InvestmentType.Founding) return 'Founding';
  if (type === InvestmentType.Equity) return 'Equity';
  if (type === InvestmentType.RevenueSharing) return 'Revenue Sharing';
  if (type === InvestmentType.Loan) return 'Loan';
  return 'Opportunity';
}

getInvestmentTypeBadgeClass(type: InvestmentType | number | undefined): string {
  if (type === InvestmentType.Founding) return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25';
  if (type === InvestmentType.Equity) return 'bg-blue-500/15 text-blue-300 border border-blue-500/25';
  if (type === InvestmentType.RevenueSharing) return 'bg-purple-500/15 text-purple-300 border border-purple-500/25';
  if (type === InvestmentType.Loan) return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25';
  return 'bg-slate-700/70 text-slate-300 border border-slate-600/40';
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
  isEquity(inv: OpportunityView | null): boolean {
    return inv?.investmentType === InvestmentType.Equity;
  }

   /**
    * Check if investment type is Revenue Sharing
    */
   isRevenueSharing(inv: OpportunityView | null): boolean {
     return inv?.investmentType === InvestmentType.RevenueSharing;
   }

  /**
   * Check if investment type is Loan
   */
  isLoan(inv: OpportunityView | null): boolean {
    return inv?.investmentType === InvestmentType.Loan;
  }

  /**
   * Check if investment type is Founding
   */
  isFounding(inv: OpportunityView | null): boolean {
    return inv?.investmentType === InvestmentType.Founding;
  }

}
