import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { CurrencyDisplayPipe } from '../../../pipes/currency-display.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { FileStoreService } from '../../../services/file-store.service';
import { Opportunity, OpportunityLookup, OpportunityMedia, OpportunityDocument, OpportunityEvent, OpportunityProjectContext, OpportunityRoom, OpportunityService, OpportunityViewerState } from '../../../services/opportunity.service';
import { PaidActionCode, PaidActionQuote, WalletService } from '../../../services/wallet.service';
import { ReportReasonCode, ReportService, ReportTargetType } from '../../../services/report.service';
import { CashFlowService, ParticipationPaymentSchedule, PaymentScheduleStatus } from '../../../services/cash-flow.service';
import { OfferBuilderComponent } from '../../../components/offer-builder/offer-builder.component';
import { OfferVersion } from '../../../models/offer.model';
import { RoleContextService } from '../../../services/role-context.service';
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

type OpportunityView = Opportunity & Record<string, any>;

/**
 * Investment Preview Component
 * 
 * Displays detailed investment information with engagement and investment actions
 * Integrates with:
 * - OpportunityService: Load opportunity data from API
 * - UserService: Load the current user for authorization-aware presentation
 * - NotificationService: User feedback
 * 
 * Business Logic:
 * - Loads the authoritative Project and Opportunity read models
 * - Presents backend-authorized investor actions
 * - Opens the complete Offer builder or existing conversation flow
 */
@Component({
  standalone: true,
  selector: 'app-investment-preview',
  templateUrl: './investment-preview.component.html', styleUrls: ['./investment-preview.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, OfferBuilderComponent, CurrencyDisplayPipe]
})
export class InvestmentPreviewComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fileStoreService = inject(FileStoreService);
  private opportunityService = inject(OpportunityService);
  private walletService = inject(WalletService);
  private reportService = inject(ReportService);
  private cashFlowService = inject(CashFlowService);
  private roleContext = inject(RoleContextService);

  // User credits from UserService
  userCredits = this.userService.credits;

  /** Back link: founders go to dashboard, investors go to opportunity exploration */
  backLink = computed(() =>
    this.roleContext.isFounderUser() ? '/admin/dashboard' : '/admin/investments'
  );

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

  openChat(): void {
    const conversationId = this.viewerState()?.conversationId;
    this.router.navigate(['/admin/chat'], conversationId ? { queryParams: { conversationId } } : undefined);
  }

  async requestChat(opportunity: Opportunity): Promise<void> {
    const opportunityId = this.getPublicOpportunityId(opportunity);
    if (!opportunityId || !this.showRequestChatButton()) return;
    await this.promptContactFounder(opportunity as OpportunityView);
  }

  closeDirectOfferBuilder(): void {
    this.participationBuilderOpen.set(false);
  }

  openDirectOfferBuilder(opportunity: OpportunityView): void {
    if (!this.canSubmitDirectOffer()) return;
    this.participationBuilderOpen.set(true);
  }

  openOpportunityReport(opportunity: Opportunity): void {
    const id = this.getPublicOpportunityId(opportunity);
    if (!id) return;
    this.openReport('Opportunity', id, opportunity.title || this.t('reports.targets.opportunity'));
  }

  closeReportModal(): void {
    if (this.reportSubmitting()) return;
    this.reportModalOpen.set(false);
    this.reportError.set(null);
    this.reportSuccess.set(false);
  }

  setReportReason(reason: string): void {
    this.reportReason.set(reason as ReportReasonCode);
  }

  setReportDescription(description: string): void {
    this.reportDescription.set(description);
  }

  async submitReport(): Promise<void> {
    const target = this.reportTarget();
    if (!target || this.reportSubmitting()) return;

    try {
      this.reportSubmitting.set(true);
      this.reportError.set(null);
      await this.reportService.createReport({
        targetType: target.type,
        targetId: target.id,
        reasonCode: this.reportReason(),
        description: this.reportDescription().trim() || null
      });
      this.reportSuccess.set(true);
    } catch (error: any) {
      this.reportError.set(this.reportErrorMessage(error));
    } finally {
      this.reportSubmitting.set(false);
    }
  }

  openFounderProfile(source: OpportunityView | string | null | undefined, event?: Event): void {
    event?.stopPropagation();
    const founderId = typeof source === 'string' ? source : source?.founderId;
    if (!founderId || founderId === 'undefined' || founderId === 'null') return;
    try {
      this.router.navigate(['/admin/founders', founderId]);
    } catch (err) {
      console.error('Navigation error:', err);
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open founder profile', type: 'error' });
    }
  }

  investment = signal<OpportunityView | null>(null);
  publicOpportunity = signal<Opportunity | null>(null);
publicActivity = signal<OpportunityEvent[]>([]);
publicActivityTotal = signal(0);
publicActivityExpanded = signal(false);
publicActivityLoading = signal(false);
publicActivityPage = signal(1);
readonly publicActivityPageSize = 10;
publicActivityTotalPages = computed(() => Math.max(1, Math.ceil(this.publicActivityTotal() / this.publicActivityPageSize)));
publicActivityHasPrevious = computed(() => this.publicActivityPage() > 1);
publicActivityHasNext = computed(() => this.publicActivityPage() < this.publicActivityTotalPages());
publicActivityError = signal<string | null>(null);
  viewerState = signal<OpportunityViewerState | null>(null);
  paymentSchedule = signal<ParticipationPaymentSchedule | null>(null);
  paymentScheduleLoading = signal(false);
  paymentScheduleUnavailable = signal(false);
  favoriteUpdating = signal(false);
  paymentSchedulePage = signal(1);
  paymentSchedulePageSize = signal(10);
  readonly paymentSchedulePageSizes = [10, 25, 50];
  paymentScheduleTotalPages = computed(() => Math.max(1, Math.ceil((this.paymentSchedule()?.items.length ?? 0) / this.paymentSchedulePageSize())));
  visiblePaymentScheduleItems = computed(() => {
    const items = this.paymentSchedule()?.items ?? [];
    const start = (this.paymentSchedulePage() - 1) * this.paymentSchedulePageSize();
    return items.slice(start, start + this.paymentSchedulePageSize());
  });
  relationshipState = computed(() => this.getRelationshipState());
  participationStatus = this.relationshipState;
  // Cache of founder avatar URLs by userId
  founderAvatarCache = signal<Record<string, string>>({});
  investmentToEngage = signal<OpportunityView | null>(null);
  loading = signal<boolean>(false);
  /** Set only when the backend actually reports the Opportunity as not found / unavailable. */
  notFound = signal<boolean>(false);
  engagementProcessing = signal(false);
  participationBuilderOpen = signal(false);
  directOffer = signal<OfferVersion | null>(null);
  reportModalOpen = signal(false);
  reportSubmitting = signal(false);
  reportSuccess = signal(false);
  reportError = signal<string | null>(null);
  reportTarget = signal<{ type: ReportTargetType; id: string | number; title: string } | null>(null);
  reportReason = signal<ReportReasonCode>('SuspiciousOpportunity');
  reportDescription = signal('');
  reportReasons: ReportReasonCode[] = [
    'SuspiciousOpportunity',
    'MisleadingInformation',
    'Spam',
    'Abuse',
    'FraudConcern',
    'InappropriateContent',
    'Other'
  ];

  // Contact Founder flow
  contactFounderConfirmationOpen = signal(false);
  contactFounderProcessing = signal(false);
  contactFounderCreditCost = 0;
  contactFounderQuote = signal<PaidActionQuote | null>(null);
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

    this.notFound.set(false);

    if (!id || isNaN(id)) {
      this.investment.set(null);
      this.publicOpportunity.set(null);
      this.viewerState.set(null);
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.loading.set(true);
    try {
      const opportunityId = id;
      this.viewerState.set(null);

      // The public URL is also the authenticated investor entry point. Load the
      // protected viewer state whenever a session exists so the backend can decide
      // which actions are available. Anonymous visitors continue to use the public
      // projection only.
      let viewerState: OpportunityViewerState | null = null;
      await this.authService.initialize();
      if (this.authService.isAuthenticated()) {
        try {
          viewerState = await this.opportunityService.getViewerState(opportunityId);
          this.viewerState.set(viewerState);
        } catch {
          this.viewerState.set(null);
        }
      }

      // Load opportunity data
      let opportunity: Opportunity;
      if (viewerState?.isFounder || viewerState?.canViewAuthorizedDetails) {
        // Authorized founder/admin viewing - use authenticated endpoint.
        // This allows Draft opportunities to be previewed without weakening public visibility.
        opportunity = await this.opportunityService.getFounderOpportunity(opportunityId);
      } else {
        // Public or non-founder - use public endpoint
        opportunity = await this.opportunityService.getPublicOpportunity(opportunityId);
      }

      if (viewerState?.isFounder || viewerState?.canOpenProjectRoom || viewerState?.projectRoomUnlocked) {
        const room = await this.opportunityService.getOpportunityRoom(opportunityId);
        opportunity = this.mergeAuthorizedRoomSummary(opportunity, room);
      }

      // Use the public projection for activity only when the opportunity is
      // actually public. Founder-owned drafts are intentionally unavailable
      // from /api/v1/public/opportunities/{id}; their authenticated detail
      // payload remains the authoritative source for the page in that state.
      if (viewerState?.isFounder && this.isPublicOpportunityStatus(opportunity.status)) {
        const publicProjection = await this.opportunityService.getPublicOpportunity(opportunityId);
        opportunity.recentProjectActivity = publicProjection.recentProjectActivity;
        opportunity.projectActivityTotalCount = publicProjection.projectActivityTotalCount;
      }

      this.publicOpportunity.set(opportunity);
      this.publicActivity.set([...(opportunity.recentProjectActivity ?? [])]);
      this.publicActivityTotal.set(opportunity.projectActivityTotalCount ?? opportunity.recentProjectActivity?.length ?? 0);
      this.publicActivityExpanded.set(false);
      this.publicActivityPage.set(1);
      this.investment.set(this.toOpportunityView(opportunity));
      await this.loadPaymentSchedule(viewerState);

      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        console.log('Opportunity loaded', opportunity, 'isFounder:', viewerState?.isFounder);
      }
      
      // The Opportunity DTO is authoritative for founder media. Avoid probing the
      // file-store profile endpoint when the DTO has no avatar; the UI uses initials.
      const founderId = this.getFounderId(opportunity);
      if (founderId) {
        const avatarUrl = this.resolveImageUrl(opportunity.founder?.avatarUrl);
        this.founderAvatarCache.update(cache => ({ ...cache, [founderId]: avatarUrl }));
      }
    } catch (error) {
      console.error('Error loading investment:', error);
      this.investment.set(null);
      this.publicOpportunity.set(null);
      this.viewerState.set(null);
      this.notFound.set(this.isNotFoundError(error));
    } finally {
      this.loading.set(false);
    }
  }

  /** Reload the Opportunity after a transient load failure. */
  retryLoad(): void {
    void this.loadInvestment();
  }

  private isNotFoundError(error: unknown): boolean {
    const record = typeof error === 'object' && error !== null ? error as Record<string, unknown> : null;
    const status = typeof record?.['status'] === 'number' ? record['status'] : null;
    if (status === 404 || status === 410) return true;
    const message = String(record?.['error']?.['message'] ?? record?.['message'] ?? '').toLowerCase();
    return message.includes('not found')
      || message.includes('unavailable')
      || message.includes('does not exist')
      || message.includes('no longer available');
  }

  async onDirectOfferSubmitted(offer: OfferVersion): Promise<void> {
    this.directOffer.set(offer);
    this.participationBuilderOpen.set(false);
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (opportunityId) await this.loadViewerState(opportunityId);
  }

  private isPublicOpportunityStatus(status: Opportunity['status']): boolean {
    const normalized = String(status ?? '').trim().toLowerCase();
    return normalized === '5'
      || normalized === '6'
      || normalized === '7'
      || normalized === '8'
      || normalized === '9'
      || normalized === 'published'
      || normalized === 'funding'
      || normalized === 'fullyfunded'
      || normalized === 'inprogress'
      || normalized === 'completed';
  }

  private async loadPaymentSchedule(state: OpportunityViewerState | null): Promise<void> {
    this.paymentScheduleUnavailable.set(false);
    const participationId = state?.participationRequestId;
    const approved = String(state?.participationStatus ?? '').toLowerCase().includes('approved') || state?.projectRoomUnlocked === true;
    if (!participationId || !approved) {
      this.paymentSchedule.set(null);
      return;
    }
    this.paymentScheduleLoading.set(true);
    try {
      this.paymentSchedule.set(await this.cashFlowService.getParticipationSchedule(participationId));
      this.paymentSchedulePage.set(1);
    } catch (error) {
      console.warn('Payment schedule is not available for this participation.', error);
      this.paymentSchedule.set(null);
      this.paymentScheduleUnavailable.set(true);
    } finally {
      this.paymentScheduleLoading.set(false);
    }
  }

  scheduleStatusKey(status: PaymentScheduleStatus): string {
    return `investmentPreview.cashFlow.status.${status}`;
  }

  async toggleOpportunityFavorite(opportunity: Opportunity): Promise<void> {
    if (this.favoriteUpdating()) return;
    const id = this.getPublicOpportunityId(opportunity);
    if (id == null) return;
    const previous = !!opportunity.favorited;
    this.favoriteUpdating.set(true);
    this.publicOpportunity.update(current => current ? { ...current, favorited: !previous } : current);
    this.investment.update(current => current ? { ...current, favorited: !previous } : current);
    try {
      const result = await this.opportunityService.setFavorite(id, !previous);
      this.publicOpportunity.update(current => current ? { ...current, favorited: result.favorited } : current);
      this.investment.update(current => current ? { ...current, favorited: result.favorited } : current);
    } catch (error) {
      this.publicOpportunity.update(current => current ? { ...current, favorited: previous } : current);
      this.investment.update(current => current ? { ...current, favorited: previous } : current);
      console.error('Failed to update favorite status', error);
    } finally {
      this.favoriteUpdating.set(false);
    }
  }

  paymentScheduleRangeStart(): number {
    return this.paymentSchedule()?.items.length ? (this.paymentSchedulePage() - 1) * this.paymentSchedulePageSize() + 1 : 0;
  }

  paymentScheduleRangeEnd(): number {
    return Math.min(this.paymentSchedulePage() * this.paymentSchedulePageSize(), this.paymentSchedule()?.items.length ?? 0);
  }

  setPaymentSchedulePage(page: number): void {
    this.paymentSchedulePage.set(Math.min(Math.max(1, page), this.paymentScheduleTotalPages()));
  }

  setPaymentSchedulePageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    if (!this.paymentSchedulePageSizes.includes(size)) return;
    this.paymentSchedulePageSize.set(size);
    this.paymentSchedulePage.set(1);
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
        return 'investments.status.draft';
      case '5':
      case 'published':
      case 'active':
      case '4':
      case 'approved':
        return 'investments.status.active';
      case '6':
      case 'funding':
        return 'investments.status.funding';
      case '7':
      case 'fullyfunded':
        return 'investments.status.fullyFunded';
      case '8':
      case 'inprogress':
        return 'investments.status.inProgress';
      case '9':
      case 'completed':
        return 'investments.status.completed';
      case '10':
      case 'archived':
        return 'investments.status.archived';
      default:
        return statusStr ? `investments.status.${statusStr}` : 'investments.status.active';
    }
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
    return this.viewerState()?.canRequestChat === true;
  }

  showOpenChatButton(): boolean {
    const state = this.viewerState();
    return this.relationshipState().primaryAction === 'open-chat' && state?.hasConversation === true && !!state.conversationId;
  }

  canSubmitDirectOffer(): boolean {
    const state = this.viewerState();
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (!opportunityId || state?.isFounder) return false;
    return state?.canSubmitDirectOffer === true;
  }

  getProjectCoverUrl(opportunity: Opportunity | null): string {
    return this.resolveImageUrl(opportunity?.projectContext?.logoUrl || opportunity?.projectLogoUrl || '');
  }

  getProjectContext(opportunity: Opportunity | null): OpportunityProjectContext | null {
    return opportunity?.projectContext ?? null;
  }

  getProjectName(opportunity: Opportunity | null): string {
    return opportunity?.projectContext?.displayName || opportunity?.projectDisplayName || this.t('investmentPreview.projectFallback');
  }

  getProjectSummary(opportunity: Opportunity | null): string {
    return opportunity?.projectContext?.summary || opportunity?.projectSummary || this.t('investmentPreview.projectDescriptionFallback');
  }

  getProjectDescription(opportunity: Opportunity | null): string {
    return opportunity?.projectContext?.description || opportunity?.projectDescription || this.getProjectSummary(opportunity);
  }

  getProjectIndustry(opportunity: Opportunity | null): string {
    return opportunity?.projectContext?.industry || opportunity?.projectIndustry || '';
  }

  getProjectCategory(opportunity: Opportunity | null): string {
    const category = opportunity?.projectContext?.category;
    return this.getOpportunityLabel(category);
  }

  getProjectStage(opportunity: Opportunity | null): string {
    const value = opportunity?.projectContext?.businessStage ?? opportunity?.projectStage;
    if (value === null || value === undefined || value === '') return '';
    const raw = String(value).toLowerCase().replace(/[\s_-]+/g, '');
    const key = raw === '0' || raw === '1' || raw === 'idea' ? 'idea'
      : raw === '2' || raw === 'mvp' ? 'mvp'
      : raw === '3' || raw === 'startup' ? 'startup'
      : raw === '4' || raw === 'scaling' ? 'scaling'
      : raw === '5' || raw === 'established' ? 'established'
      : raw;
    return this.t(`investmentPreview.projectStages.${key}`) || String(value);
  }

  getProjectStatus(opportunity: Opportunity | null): string {
    const value = opportunity?.projectContext?.status;
    if (value === null || value === undefined || value === '') return '';
    const raw = String(value).toLowerCase().replace(/[\s_-]+/g, '');
    const key = raw === '0' || raw === 'draft' ? 'draft'
      : raw === '1' || raw === 'active' ? 'active'
      : raw === '2' || raw === 'paused' ? 'paused'
      : raw === '3' || raw === 'completed' ? 'completed'
      : raw === '4' || raw === 'archived' ? 'archived'
      : raw;
    return this.t(`investmentPreview.projectStatuses.${key}`) || String(value);
  }

  getProjectUpdates(opportunity: Opportunity | null): OpportunityEvent[] {
    const recent = opportunity?.recentProjectActivity;
    if (Array.isArray(recent) && recent.length > 0) return recent;
    return this.getOpportunityEvents(opportunity);
  }

  getProjectMedia(opportunity: Opportunity | null): OpportunityMedia[] {
    return this.getOpportunityMedia(opportunity).filter(item => {
      const purpose = String(item.purpose ?? '').toLowerCase();
      return item.isCover === true || purpose === 'cover' || purpose === 'gallery' || purpose === 'projectupdatemedia'
        || String(item.mimeType ?? '').toLowerCase().startsWith('image');
    });
  }

  getProjectDocuments(opportunity: Opportunity | null): OpportunityDocument[] {
    return this.getOpportunityDocuments(opportunity).filter(document => {
      const purpose = String(document.purpose ?? '').toLowerCase();
      return purpose === 'publicdocument' || purpose === 'general' || purpose === 'projectdocument';
    });
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

  async viewMoreProjectActivity(): Promise<void> {
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (!opportunityId || this.publicActivityLoading()) return;
    this.publicActivityLoading.set(true);
    this.publicActivityError.set(null);
    try {
      const page = await this.opportunityService.getPublicProjectActivity(opportunityId, 1, this.publicActivityPageSize);
      this.publicActivity.set(page.items ?? []);
      this.publicActivityTotal.set(page.total ?? 0);
      this.publicActivityPage.set(1);
      this.publicActivityExpanded.set(true);
    } catch (e) {
      this.publicActivityError.set('Failed to load project activity.');
    } finally {
      this.publicActivityLoading.set(false);
    }
  }

  async goToProjectActivityPage(pageNum: number): Promise<void> {
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (!opportunityId || this.publicActivityLoading()) return;
    this.publicActivityLoading.set(true);
    this.publicActivityError.set(null);
    try {
      const page = await this.opportunityService.getPublicProjectActivity(opportunityId, pageNum, this.publicActivityPageSize);
      this.publicActivity.set(page.items ?? []);
      this.publicActivityTotal.set(page.total ?? 0);
      this.publicActivityPage.set(page.page ?? pageNum);
    } catch (e) {
      this.publicActivityError.set('Failed to load project activity.');
    } finally {
      this.publicActivityLoading.set(false);
    }
  }

  previousProjectActivityPage(): void {
    const prev = this.publicActivityPage() - 1;
    if (prev >= 1) this.goToProjectActivityPage(prev);
  }

  nextProjectActivityPage(): void {
    const next = this.publicActivityPage() + 1;
    if (next <= this.publicActivityTotalPages()) this.goToProjectActivityPage(next);
  }

  publicActivityTitle(event: OpportunityEvent): string {
    return this.publicActivityText(event.titleKey || event.title, event.metadata)
      || this.t('investmentPreview.public.projectActivityFallback');
  }

  publicActivityDescription(event: OpportunityEvent): string {
    return this.publicActivityText(event.descriptionKey || event.description, event.metadata);
  }

  publicActivityDate(event: OpportunityEvent): string | null {
    return event.occurredAt || event.createdAt || null;
  }

  private publicActivityText(key: string | null | undefined, metadata: Record<string, string | null> | null | undefined): string {
    if (!key) return '';
    let value = this.t(key);
    for (const [name, replacement] of Object.entries(metadata ?? {})) {
      value = value.split(`{{${name}}}`).join(replacement ?? '');
    }
    return value;
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

  onFounderAvatarError(userId: string): void {
    if (!userId) return;
    this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: '' }));
  }

  founderAvatar(inv: OpportunityView | null): string {
    if (!inv) return '';
    const uid = this.getFounderId(inv);
    const cached = uid ? this.founderAvatarCache()[uid] : undefined;
    if (cached) return cached;
    return '';
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
   * Uses the direct founder publish flow.
   */
  async publishOpportunity(): Promise<void> {
    const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
    if (!opportunityId) return;

    try {
      this.engagementProcessing.set(true);
      const chargingEnabled = await this.walletService.loadChargingEnabled();
      if (!chargingEnabled) {
        if (!window.confirm(this.t('opportunityPublish.confirmationFree').replace('{action}', this.t('opportunityPublish.action')))) {
          return;
        }
      } else {
        const quote = await this.walletService.getPaidActionQuote('PublishOpportunity');
        if (!quote.hasSufficientCredit) {
          this.notificationService.showToast({ title: this.t('paidActions.insufficientTitle'), message: this.insufficientCreditText(quote), type: 'error' });
          return;
        }
        const confirmation = this.t('opportunityPublish.confirmation')
          .replace('{action}', this.t('opportunityPublish.action'))
          .replace('{cost}', this.formatCredits(quote.creditCost))
          .replace('{balance}', this.formatCredits(quote.currentBalance))
          .replace('{after}', this.formatCredits(quote.balanceAfter));
        if (!window.confirm(confirmation)) return;
      }
      await this.opportunityService.publishOpportunity(opportunityId);
      this.notificationService.showToast({
        title: this.t('opportunityPublish.successTitle'),
        message: this.t('opportunityPublish.successMessage'),
        type: 'success'
      });
      // Reload to get updated status
      await this.loadInvestment();
    } catch (error: any) {
      this.notificationService.showToast({
        title: this.t('opportunityPublish.failureTitle'),
        message: error?.error?.message || error?.message || this.t('opportunityPublish.failureMessage'),
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

  private toOpportunityView(opportunity: Opportunity): OpportunityView {
    const source = opportunity as Opportunity & Record<string, any>;
    const targetFund = Number(source.fundingTarget ?? source.targetFund ?? 0);
    const fundingPercentage = this.numberOrNull(source.fundingProgressPercentage ?? source.fundingProgressPercent);
    const currentFunding = this.numberOrNull(source.fundedAmount);

    return {
      ...source,
      name: source.title || source.name || 'Untitled Opportunity',
      targetFund,
      currentFunding,
      fundingPercentage,
      remainingFundingAmount: this.numberOrNull(source.remainingFundingAmount),
      investorCount: this.numberOrNull(source.approvedParticipantCount),
      currency: source.currency || '',
      imageUrl: source.coverImageUrl || source.imageUrl || ''
    };
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private mergeAuthorizedRoomSummary(opportunity: Opportunity, room: OpportunityRoom): Opportunity {
    const overview = (room.overview ?? {}) as Opportunity & Record<string, any>;
    const context = room.participantContext ?? {};
    return {
      ...opportunity,
      ...overview,
      approvedParticipantCount: context.approvedParticipantCount ?? opportunity.approvedParticipantCount,
      canAccessProjectRoom: context.canAccessProjectRoom ?? opportunity.canAccessProjectRoom
    };
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

reportReasonLabel(reason: ReportReasonCode): string {
  return this.t(`reports.reasons.${reason}`);
}

private openReport(type: ReportTargetType, id: string | number, title: string): void {
  this.reportTarget.set({ type, id, title });
  this.reportReason.set(type === 'Opportunity' ? 'SuspiciousOpportunity' : 'Spam');
  this.reportDescription.set('');
  this.reportError.set(null);
  this.reportSuccess.set(false);
  this.reportModalOpen.set(true);
}

private reportErrorMessage(error: any): string {
  const raw = String(error?.error?.message || error?.message || '').toLowerCase();
  if (raw.includes('duplicate') || raw.includes('pending')) return this.t('reports.errors.duplicatePending');
  if (raw.includes('invalid') || raw.includes('target')) return this.t('reports.errors.invalidTarget');
  if (raw.includes('self')) return this.t('reports.errors.selfReport');
  return this.t('reports.errors.generic');
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
    'Closed': 'Funding ended'
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

scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
