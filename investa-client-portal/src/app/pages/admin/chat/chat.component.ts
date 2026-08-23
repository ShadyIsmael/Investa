import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { API_BASE } from '../../../config/api.token';
import { OfferBuilderComponent } from '../../../components/offer-builder/offer-builder.component';
import { OfferStatus as OfferStatusEnum, OfferVersion } from '../../../models/offer.model';
import { LanguageService } from '../../../services/language.service';
import { CurrencyService } from '../../../services/currency.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ReportReasonCode, ReportService } from '../../../services/report.service';
import { FirebaseClientService, RealtimeEvent } from '../../../services/firebase-client.service';
import { NotificationService } from '../../../services/notification.service';
import {
  SavedConversationMessage,
  updateConversationPreview,
  upsertAuthoritativeMessage
} from './conversation-realtime.reducer';
import { buildConversationTimeline, ConversationTimelineItem } from './conversation-timeline.reducer';
import { scrollToLatest } from './chat-scroll.util';
import {
  normalizeOfferStatus,
  offerConversationId,
  offerRealtimeAction
} from './conversation-offer-realtime.util';

type NegotiationStatus =
  | 'Founder Accepted'
  | 'Negotiation in Progress'
  | 'Declined by Founder'
  | 'You withdrew'
  | 'Ready for Participation'
  | 'Participation Created'
  | 'Participation Approved'
  | 'Participation Rejected'
  | 'Discussion Closed';

interface NegotiationConversation {
  id: string;
  direction?: 'incoming' | 'outgoing' | 'unknown';
  opportunityId?: number | string | null;
  opportunityTitle: string;
  shortDescription?: string;
  founderName?: string;
  founderUserId?: string | number | null;
  investorName?: string;
  investorUserId?: string | number | null;
  requesterUserId?: string | number | null;
  requesterName?: string;
  requesterRole?: string;
  recipientUserId?: string | number | null;
  recipientName?: string;
  recipientRole?: string;
  counterpartyUserId?: string | number | null;
  counterpartyName: string;
  counterpartyRole?: string;
  avatarUrl?: string;
  fundingTarget?: number | null;
  minimumParticipation?: number | null;
  investmentModel?: string;
  status: NegotiationStatus;
  participationStatus?: string | null;
  participationRequestId?: string | null;
  lastMessage?: string;
  lastMessageAt?: string | Date | null;
  unreadCount?: number;
  createdAt?: string | Date | null;
  closedAt?: string | Date | null;
  closedByUserId?: string | number | null;
  closeReason?: string | null;
  founderReady?: boolean;
  investorReady?: boolean;
  currentUserReady?: boolean;
  archived?: boolean;
  readOnly?: boolean;
}

type RequestDirection = 'incoming' | 'outgoing' | 'unknown';
type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

interface ConversationRequest {
  id: string;
  opportunityId: string | number;
  opportunityTitle: string;
  direction: RequestDirection;
  counterpartyUserId?: string | number;
  counterpartyName: string;
  counterpartyRole?: string;
  message?: string;
  status: RequestStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  canAccept: boolean;
  canReject: boolean;
  canWithdraw: boolean;
  acceptedConversationId?: string;
}

interface ViewerState {
  projectRoomUnlocked?: boolean;
  canOpenProjectRoom?: boolean;
  hasPendingParticipationRequest?: boolean;
  participationStatus?: string;
}

type JsonRecord = Record<string, unknown>;

interface NegotiationMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  text: string;
  sentAt: string | Date;
  isSender: boolean;
}

type JourneyStepState = 'completed' | 'current' | 'future';

interface JourneyStep {
  key: string;
  label: string;
  state: JourneyStepState;
}

type OfferLegType = 1 | 2 | 3;
type OfferStatus = 1 | 2 | 3 | 4 | 5;

interface NegotiationOfferLeg {
  id?: number;
  legType: OfferLegType;
  amount: number;
  equityPercentage?: number | null;
  sharesTerms?: string | null;
  returnRate?: number | null;
  termMonths?: number | null;
  repaymentModel?: string | null;
  profitSharePercentage?: number | null;
  exitTerms?: string | null;
}

interface NegotiationOffer {
  id: number;
  conversationId: string;
  createdByUserId?: string | number | null;
  createdByName?: string;
  createdByRole?: string;
  version: number;
  replacesOfferId?: number | null;
  status: OfferStatus;
  note?: string | null;
  currency: string;
  createdAt?: string | Date | null;
  legs: NegotiationOfferLeg[];
  canAccept?: boolean;
  canReject?: boolean;
  canRespond?: boolean;
  canWithdraw?: boolean;
}

type ChatTimelineItem = ConversationTimelineItem<NegotiationMessage, NegotiationOffer>;

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, OfferBuilderComponent, TranslatePipe]
})
export class ChatComponent implements OnInit, OnDestroy {
  private messageStream?: ElementRef<HTMLElement>;
  private messageStreamObserver?: MutationObserver;

  @ViewChild('messageStream')
  set messageStreamElement(element: ElementRef<HTMLElement> | undefined) {
    this.messageStreamObserver?.disconnect();
    this.messageStream = element;
    if (!element) return;

    this.messageStreamObserver = new MutationObserver(() => this.scheduleScrollToLatest());
    this.messageStreamObserver.observe(element.nativeElement, {
      childList: true,
      subtree: true
    });
    this.scheduleScrollToLatest();
  }
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  private reportService = inject(ReportService);
  private firebaseClient = inject(FirebaseClientService);
  private notificationService = inject(NotificationService);
private currencyService = inject(CurrencyService);
  private presenceTimer: ReturnType<typeof setInterval> | null = null;
  private presentConversationId: string | null = null;
  private readonly realtimeSubscriptions = new Subscription();
  private readonly receivedMessageIds = new Set<string>();
  private scrollFrame: number | null = null;

  conversations = signal<NegotiationConversation[]>([]);
  requests = signal<ConversationRequest[]>([]);
  messages = signal<NegotiationMessage[]>([]);
  offers = signal<NegotiationOffer[]>([]);
  selectedConversation = signal<NegotiationConversation | null>(null);
  selectedRequest = signal<ConversationRequest | null>(null);
  loading = signal(true);
  messagesLoading = signal(false);
  sending = signal(false);
  actionProcessing = signal(false);
  offerProcessing = signal(false);
  offerBuilderOpen = signal(false);
  replacingOfferId = signal<number | null>(null);
  replacementOffer = signal<OfferVersion | null>(null);
  error = signal<string | null>(null);
  messagesError = signal<string | null>(null);
  reportModalOpen = signal(false);
  reportSubmitting = signal(false);
  reportSuccess = signal(false);
  reportError = signal<string | null>(null);
  reportReason = signal<ReportReasonCode>('Spam');
  reportDescription = signal('');
  reportReasons: ReportReasonCode[] = [
    'MisleadingInformation',
    'Spam',
    'Abuse',
    'FraudConcern',
    'InappropriateContent',
    'Other'
  ];
  workspaceTab = signal<'incoming' | 'outgoing' | 'conversations'>('conversations');
  conversationFilter = signal<'all' | 'active' | 'closed'>('all');
  mobileView = signal<'list' | 'chat' | 'context'>('list');
  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = signal('');
  viewerStates = signal<Record<string, ViewerState>>({});
  messageControl = new FormControl('');

  visibleConversations = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('en');
    const filter = this.conversationFilter();
    return this.conversations().filter(conversation => {
      const closed = this.isReadOnly(conversation);
      if (filter === 'active' && closed) return false;
      if (filter === 'closed' && !closed) return false;
      return !query || [conversation.counterpartyName, conversation.opportunityTitle, conversation.lastMessage]
        .filter((value): value is string => !!value)
        .some(value => value.toLocaleLowerCase('en').includes(query));
    });
  });

  visibleRequests = computed(() => {
    const tab = this.workspaceTab();
    const query = this.searchTerm().trim().toLocaleLowerCase('en');
    if (tab === 'conversations') return [];
    return this.requests().filter(request => request.direction === tab && (
      !query || [request.counterpartyName, request.opportunityTitle, request.message]
        .filter((value): value is string => !!value)
        .some(value => value.toLocaleLowerCase('en').includes(query))
    ));
  });

  chatItems = computed<ChatTimelineItem[]>(() => {
    const conversationId = this.selectedConversation()?.id;
    return conversationId
      ? buildConversationTimeline(conversationId, this.messages(), this.offers())
      : [];
  });

  private selectionWatcher = effect(() => {
    const selected = this.selectedConversation();
    if (!selected) return;

    if (this.workspaceTab() !== 'conversations') return;
    const visibleIds = new Set(this.visibleConversations().map(item => item.id));
    if (!visibleIds.has(selected.id)) {
      this.clearSelection();
    }
  });

  activeConversation = computed(() => {
    const selected = this.selectedConversation();
    if (!selected) return null;
    const currentIds = new Set(this.conversations().map(item => item.id));
    return currentIds.has(selected.id) ? selected : null;
  });
  isCurrentUserReady = computed(() => !!this.activeConversation()?.currentUserReady);
  isClosed = computed(() => this.isReadOnly(this.activeConversation()));
  bothReady = computed(() => !!this.activeConversation()?.founderReady && !!this.activeConversation()?.investorReady);
  projectRoomUnlocked = computed(() => {
    const conversation = this.activeConversation();
    const state = this.activeViewerState();
    return !!state?.projectRoomUnlocked || !!state?.canOpenProjectRoom || conversation?.status === 'Participation Approved';
  });
  canMarkReady = computed(() => {
    const conversation = this.activeConversation();
    return !!conversation && !this.isReadOnly(conversation) && !this.isCurrentUserReady() && !this.actionProcessing();
  });
  canCloseDiscussion = computed(() => {
    const conversation = this.activeConversation();
    return !!conversation && !this.isReadOnly(conversation) && !this.actionProcessing();
  });
  canCreateParticipationRequest = computed(() => {
    const conversation = this.activeConversation();
    const state = this.activeViewerState();
    if (!conversation?.opportunityId || this.actionProcessing()) return false;
    if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || state?.hasPendingParticipationRequest) return false;
    const participation = this.normalizeParticipationStatus(state?.participationStatus ?? conversation.participationStatus);
    if (participation === 'pending' || participation === 'approved') return false;
    if (conversation.status === 'Participation Created' || conversation.status === 'Participation Approved') return false;
    return !this.isReadOnly(conversation);
  });
  journeySteps = computed(() => this.buildJourney(this.activeConversation()));
  terminalJourneyStatus = computed(() => this.buildTerminalJourneyStatus(this.activeConversation()));
  stageSummary = computed(() => this.buildStageSummary(this.activeConversation()));
  participationSummary = computed(() => this.buildParticipationSummary(this.activeConversation()));
  nextStep = computed(() => this.buildNextStep(this.activeConversation()));

  async ngOnInit(): Promise<void> {
    this.realtimeSubscriptions.add(
      this.firebaseClient.onRealtimeEvent.subscribe(event => this.handleRealtimeEvent(event))
    );
    this.realtimeSubscriptions.add(
      this.firebaseClient.hasRealtimeConnectionChange.subscribe(connected => {
        if (connected) void this.refreshAfterRealtimeReconnect();
      })
    );
    await this.loadConversations();
  }

  ngOnDestroy(): void {
    this.realtimeSubscriptions.unsubscribe();
    this.messageStreamObserver?.disconnect();
    if (this.scrollFrame !== null) cancelAnimationFrame(this.scrollFrame);
    void this.leaveConversationPresence();
  }

  async loadConversations(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const [raw, requestRaw] = await Promise.all([
        this.get<unknown>('/api/v1/conversations'),
        this.get<unknown>('/api/v1/conversation-requests')
      ]);
      const rows = this.extractArray(raw);
      const conversations = await Promise.all(rows.map(row => this.hydrateConversationPreview(this.mapConversation(row))));
      this.conversations.set(conversations);
      this.requests.set(this.extractArray(requestRaw).map(row => this.mapRequest(row)));

      const current = this.selectedConversation();
      const requestedConversationId = this.route.snapshot.queryParamMap.get('conversationId');
      const selected = requestedConversationId
        ? conversations.find(item => item.id === requestedConversationId)
        : current ? conversations.find(item => item.id === current.id) : conversations[0];
      if (selected && conversations.find(item => item.id === selected.id)) {
        await this.selectConversation(selected);
      } else {
        this.clearSelection();
      }
    } catch (error) {
      this.error.set(this.errorMessage(error, 'Unable to load conversations.'));
      this.conversations.set([]);
      this.requests.set([]);
      this.clearSelection();
    } finally {
      this.loading.set(false);
    }
  }

  async selectConversation(conversation: NegotiationConversation): Promise<void> {
    if (this.presentConversationId !== conversation.id) {
      await this.leaveConversationPresence();
    }
    this.selectedRequest.set(null);
    const selected = { ...conversation, unreadCount: 0 };
    this.selectedConversation.set(selected);
    this.messages.set([]);
    this.offers.set([]);
    this.messagesError.set(null);
    this.receivedMessageIds.clear();
    this.conversations.update(items => items.map(item => item.id === selected.id ? selected : item));
    this.mobileView.set('chat');
    await this.startConversationPresence(conversation.id);
    await this.loadViewerState(conversation);
    await this.loadMessages(conversation.id);
    await this.loadOffers(conversation.id);
  }

  selectRequest(request: ConversationRequest): void {
    void this.leaveConversationPresence();
    this.selectedConversation.set(null);
    this.selectedRequest.set(request);
    this.messages.set([]);
    this.offers.set([]);
    this.mobileView.set('chat');
  }

  async acceptRequest(request: ConversationRequest): Promise<void> {
    await this.requestAction(request, 'accept');
  }

  async rejectRequest(request: ConversationRequest): Promise<void> {
    await this.requestAction(request, 'reject');
  }

  async withdrawRequest(request: ConversationRequest): Promise<void> {
    await this.requestAction(request, 'withdraw');
  }

  openConversationReport(conversation: NegotiationConversation): void {
    if (!this.resolveConversationCounterpartyUserId(conversation)) {
      this.reportError.set(this.t('reports.errors.counterpartyUnavailable'));
      return;
    }
    this.reportReason.set('Spam');
    this.reportDescription.set('');
    this.reportError.set(null);
    this.reportSuccess.set(false);
    this.reportModalOpen.set(true);
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

  async submitConversationReport(): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.reportSubmitting()) return;
    const counterpartyUserId = this.resolveConversationCounterpartyUserId(conversation);
    if (!counterpartyUserId) {
      this.reportError.set(this.t('reports.errors.counterpartyUnavailable'));
      return;
    }

    try {
      this.reportSubmitting.set(true);
      this.reportError.set(null);
      await this.reportService.createReport({
        targetType: 'User',
        targetId: counterpartyUserId,
        reasonCode: this.reportReason(),
        description: this.reportDescription().trim() || null
      });
      this.reportSuccess.set(true);
    } catch (error: unknown) {
      this.reportError.set(this.reportErrorMessage(error));
    } finally {
      this.reportSubmitting.set(false);
    }
  }

  async loadViewerState(conversation: NegotiationConversation): Promise<void> {
    if (!conversation.opportunityId) return;
    try {
      const raw = await this.get<unknown>(
        `/api/v1/opportunities/${encodeURIComponent(String(conversation.opportunityId))}/viewer-state?conversationId=${encodeURIComponent(conversation.id)}`
      );
      const wrapped = this.asRecord(raw);
      const state = this.mapViewerState(wrapped['data'] ?? raw);
      this.viewerStates.update(items => ({ ...items, [conversation.id]: state }));
    } catch {
      this.viewerStates.update(items => {
        const next = { ...items };
        delete next[conversation.id];
        return next;
      });
    }
  }

  async loadMessages(conversationId: string): Promise<void> {
    try {
      this.messagesLoading.set(true);
      this.messagesError.set(null);
      const raw = await this.get<unknown>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`);
      if (this.selectedConversation()?.id !== conversationId) return;
      const conversation = this.conversations().find(item => item.id === conversationId) || this.selectedConversation();
      const messages = this.extractArray(raw).map(row => this.mapMessage(row, conversation));
      messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      this.messages.set(messages);
      this.scheduleScrollToLatest();
      messages.forEach(message => this.receivedMessageIds.add(message.id));
      await this.patch(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages/read`, {});
      if (this.selectedConversation()?.id === conversationId) {
        this.conversations.update(items => items.map(item => item.id === conversationId ? { ...item, unreadCount: 0 } : item));
        await this.notificationService.loadNotifications();
      }
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, 'Unable to load messages.'));
      this.messages.set([]);
    } finally {
      this.messagesLoading.set(false);
    }
  }

  async loadOffers(conversationId: string): Promise<void> {
    try {
      const raw = await this.get<unknown>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/offers`);
      if (this.selectedConversation()?.id !== conversationId) return;
      const conversation = this.conversations().find(item => item.id === conversationId) || this.selectedConversation();
      this.offers.set(this.extractArray(raw).map(row => this.mapOffer(row, conversation)));
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, 'Unable to load structured offers.'));
      this.offers.set([]);
    }
  }

  onMessageSubmit(event: SubmitEvent): void {
    event.preventDefault();
    void this.sendMessage();
  }

  async sendMessage(): Promise<void> {
    const text = this.messageControl.value?.trim();
    const conversation = this.activeConversation();
    if (!text || !conversation || this.isReadOnly(conversation) || this.sending()) return;

    const clientMessageId = crypto.randomUUID();
    const currentUserId = this.resolveCurrentUserId(conversation);
    const optimisticMessage = this.mapMessage({
      id: clientMessageId,
      senderId: currentUserId,
      message: text,
      sentAt: new Date().toISOString()
    }, conversation);

    this.receivedMessageIds.add(clientMessageId);
    this.messages.update(items => upsertAuthoritativeMessage(items, optimisticMessage).items);
    this.scheduleScrollToLatest();
    this.conversations.update(items => updateConversationPreview(
      items,
      {
        messageId: clientMessageId,
        conversationId: conversation.id,
        senderUserId: String(currentUserId ?? ''),
        body: text,
        createdAt: optimisticMessage.sentAt
      },
      String(currentUserId ?? ''),
      conversation.id,
      true
    ));
    this.messageControl.setValue('');

    try {
      this.sending.set(true);
      this.messagesError.set(null);
      const raw = await this.post<unknown>(
        `/api/v1/conversations/${encodeURIComponent(conversation.id)}/messages`,
        { message: text, clientMessageId }
      );
      const wrapped = this.asRecord(raw);
      const saved = this.mapMessage(wrapped['data'] ?? raw, conversation);
      this.messages.update(items => upsertAuthoritativeMessage(items, saved).items);
      this.scheduleScrollToLatest();
      this.updatePreviewFromMessage(saved, conversation.id, false);
      this.updateConversationStatus(conversation.id, 'Negotiation in Progress');
    } catch (error) {
      this.receivedMessageIds.delete(clientMessageId);
      this.messages.update(items => items.filter(item => item.id !== clientMessageId));
      this.messageControl.setValue(text);
      this.messagesError.set(this.errorMessage(error, this.t('chat.errors.messageFailed')));
    } finally {
      this.sending.set(false);
    }
  }

  async markReadyToProceed(): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.isCurrentUserReady() || this.isReadOnly(conversation) || this.actionProcessing()) return;

    const confirmation = window.confirm(
      this.t('chat.confirm.readyToProceed')
    );
    if (!confirmation) return;

    try {
      this.actionProcessing.set(true);
      const raw = await this.post<unknown>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/ready-to-proceed`, {});
      const data = this.asRecord(raw)['data'];
      const updated = data ? this.mapConversation(data) : {
        ...conversation,
        currentUserReady: true,
        investorReady: conversation.investorReady || this.currentUserLooksInvestor(conversation),
        founderReady: conversation.founderReady || !this.currentUserLooksInvestor(conversation),
        status: 'Ready for Participation' as NegotiationStatus
      };
      this.replaceConversation(updated);
      this.selectedConversation.set(updated);
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, this.t('chat.errors.readyFailed')));
    } finally {
      this.actionProcessing.set(false);
    }
  }

  async closeDiscussion(): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.isReadOnly(conversation) || this.actionProcessing()) return;

    const reason = window.prompt(
      this.t('chat.confirm.closeDiscussion'),
      ''
    );
    if (reason === null) return;

    try {
      this.actionProcessing.set(true);
      const raw = await this.post<unknown>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/close`, { reason: reason.trim() || null });
      const data = this.asRecord(raw)['data'];
      const updated = data ? this.mapConversation(data) : {
        ...conversation,
        status: 'Discussion Closed' as NegotiationStatus,
        closedAt: new Date(),
        closeReason: reason.trim() || null,
        closedByUserId: this.resolveCurrentUserId(conversation),
        readOnly: true,
        archived: false
      };
      this.replaceConversation(updated);
      this.selectedConversation.set(updated);
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, this.t('chat.errors.closeFailed')));
    } finally {
      this.actionProcessing.set(false);
    }
  }

  async removeClosedConversation(conversation: NegotiationConversation): Promise<void> {
    if (!this.isReadOnly(conversation) || this.actionProcessing()) return;
    const confirmation = window.confirm(this.t('chat.confirm.removeClosed'));
    if (!confirmation) return;

    try {
      this.actionProcessing.set(true);
      await this.post<object>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/hide`, {});
      this.conversations.update(items => items.filter(item => item.id !== conversation.id));
      if (this.selectedConversation()?.id === conversation.id) {
        this.clearSelection();
      }
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, this.t('chat.errors.removeFailed')));
    } finally {
      this.actionProcessing.set(false);
    }
  }

  openOfferBuilder(replacementOffer?: NegotiationOffer): void {
    if (this.isReadOnly(this.activeConversation()) || this.offerProcessing()) return;
    if (replacementOffer) {
      this.replacingOfferId.set(replacementOffer.id);
      this.replacementOffer.set(this.toOfferVersion(replacementOffer));
    } else {
      this.replacingOfferId.set(null);
      this.replacementOffer.set(null);
    }
    this.offerBuilderOpen.set(true);
  }

  closeOfferBuilder(): void {
    this.offerBuilderOpen.set(false);
    this.replacingOfferId.set(null);
    this.replacementOffer.set(null);
  }

  onSharedOfferSubmitted(offer: OfferVersion): void {
    const mapped = this.mapOffer(offer);
    const replacementId = this.replacingOfferId();
    if (replacementId) {
      this.offers.update(items => [...items.map(item => item.id === replacementId ? { ...item, status: 2 as OfferStatus } : item), mapped]);
    } else {
      this.offers.update(items => [...items, mapped]);
    }
    this.closeOfferBuilder();
  }

  async acceptOffer(offer: NegotiationOffer): Promise<void> {
    await this.offerAction(offer, 'accept');
  }

  async rejectOffer(offer: NegotiationOffer): Promise<void> {
    await this.offerAction(offer, 'reject');
  }

  async withdrawOffer(offer: NegotiationOffer): Promise<void> {
    await this.offerAction(offer, 'withdraw');
  }

  canReceiveOfferAction(offer: NegotiationOffer): boolean {
    return offer.status === 1 && offer.canAccept === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
  }

  canRejectOfferAction(offer: NegotiationOffer): boolean {
    return offer.status === 1 && offer.canReject === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
  }

  canRespondOfferAction(offer: NegotiationOffer): boolean {
    return offer.status === 1 && offer.canRespond === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
  }

  canWithdrawOffer(offer: NegotiationOffer): boolean {
    return offer.status === 1 && offer.canWithdraw === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
  }

  isAcceptedOffer(offer: NegotiationOffer): boolean {
    return offer.status === 3;
  }

  offerStatusLabel(status: OfferStatus): string {
    switch (Number(status)) {
      case 1: return this.t('conversationWorkspace.offerStatus.pending');
      case 2: return this.t('conversationWorkspace.offerStatus.replaced');
      case 3: return this.t('conversationWorkspace.offerStatus.accepted');
      case 4: return this.t('conversationWorkspace.offerStatus.rejected');
      case 5: return this.t('conversationWorkspace.offerStatus.withdrawn');
      default: return this.t('conversationWorkspace.status.unavailable');
    }
  }

  offerLegLabel(type: OfferLegType): string {
    switch (Number(type)) {
      case 1: return this.t('conversationWorkspace.offerTypes.equity');
      case 2: return this.t('conversationWorkspace.offerTypes.loan');
      case 3: return this.t('conversationWorkspace.offerTypes.profitSharing');
      default: return this.t('conversationWorkspace.offers.title');
    }
  }

  setWorkspaceTab(tab: 'incoming' | 'outgoing' | 'conversations'): void {
    this.workspaceTab.set(tab);
    this.clearSelection();
  }

  setSearchTerm(value: string): void {
    this.searchControl.setValue(value, { emitEvent: false });
    this.searchTerm.set(value);
  }

  setConversationFilter(value: string): void {
    if (value === 'active' || value === 'closed' || value === 'all') this.conversationFilter.set(value);
  }

  setMobileView(view: 'list' | 'chat' | 'context'): void {
    this.mobileView.set(view);
  }

  canSendMessage(): boolean {
    const conversation = this.activeConversation();
    return !!conversation && !this.isReadOnly(conversation) && !this.sending() && !!this.messageControl.value?.trim();
  }

  composerHint(): string {
    const conversation = this.activeConversation();
    if (!conversation) return this.t('conversationWorkspace.composer.select');
    if (this.isReadOnly(conversation)) return this.t('conversationWorkspace.composer.closed');
    return this.t('conversationWorkspace.composer.placeholder');
  }

  closedByLabel(conversation: NegotiationConversation): string {
    if (this.sameId(conversation.closedByUserId, conversation.founderUserId)) return conversation.founderName || 'Founder';
    if (this.sameId(conversation.closedByUserId, conversation.investorUserId)) return conversation.investorName || 'Investor';
    if (this.sameId(conversation.closedByUserId, conversation.requesterUserId)) return conversation.requesterName || 'Requester';
    if (this.sameId(conversation.closedByUserId, conversation.recipientUserId)) return conversation.recipientName || 'Recipient';
    if (conversation.status === 'Declined by Founder') return conversation.founderName || 'Founder';
    if (conversation.status === 'You withdrew') return 'You';
    return 'A participant';
  }

  statusBadgeClass(status: NegotiationStatus): string {
    switch (status) {
      case 'Founder Accepted':
      case 'Negotiation in Progress':
      case 'Ready for Participation':
        return 'status-badge status-badge--active';
      case 'Participation Created':
        return 'status-badge status-badge--pending';
      case 'Participation Approved':
        return 'status-badge status-badge--success';
      case 'Declined by Founder':
      case 'You withdrew':
      case 'Participation Rejected':
      case 'Discussion Closed':
        return 'status-badge status-badge--closed';
      default:
        return 'status-badge';
    }
  }

  money(value: number | null | undefined, currency?: string | null): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return this.currencyService.format(Number(value), currency);
  }

  conversationCurrency(conversation: NegotiationConversation): string | null {
    const latest = [...this.offers()]
      .filter(o => o.conversationId === conversation.id)
      .reduce<NegotiationOffer | null>((acc, o) => (acc === null || o.version > acc.version ? o : acc), null);
    return latest?.currency ?? null;
  }

  formatDate(value: string | Date | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  formatTime(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
  }

  private mapConversation(value: unknown): NegotiationConversation {
    const row = this.asRecord(value);
    const opportunity = this.asRecord(row['opportunity']);
    const founder = this.asRecord(row['founder']);
    const investor = this.asRecord(row['investor']);
    const status = this.normalizeStatus(row['conversationStatus'] ?? row['statusText'] ?? row['status']);
    const direction = this.normalizeDirection(row['direction']);
    return {
      id: this.stringValue(row['id'] ?? row['conversationId']),
      direction,
      opportunityId: this.idValue(row['opportunityId'] ?? opportunity['id']),
      opportunityTitle: this.stringValue(row['opportunityTitle'] ?? opportunity['title']),
      shortDescription: this.optionalString(row['shortDescription'] ?? opportunity['shortDescription']),
      founderName: this.optionalString(row['founderName'] ?? founder['name']),
      founderUserId: this.idValue(row['founderUserId'] ?? founder['id']),
      investorName: this.optionalString(row['investorName'] ?? investor['name']),
      investorUserId: this.idValue(row['investorUserId'] ?? investor['id']),
      requesterUserId: this.idValue(row['requesterUserId']),
      requesterName: this.optionalString(row['requesterName']),
      requesterRole: this.optionalString(row['requesterRole']),
      recipientUserId: this.idValue(row['recipientUserId']),
      recipientName: this.optionalString(row['recipientName']),
      recipientRole: this.optionalString(row['recipientRole']),
      counterpartyUserId: this.idValue(row['counterpartyUserId']),
      counterpartyName: this.stringValue(row['counterpartyName']),
      counterpartyRole: this.optionalString(row['counterpartyRole']),
      avatarUrl: this.optionalString(row['avatarUrl'] ?? this.asRecord(row['counterparty'])['avatarUrl']),
      fundingTarget: this.numberValue(row['fundingTarget'] ?? opportunity['fundingTarget']),
      minimumParticipation: this.numberValue(row['minimumParticipation'] ?? opportunity['minimumInvestmentAmount']),
      investmentModel: this.optionalString(row['investmentModel'] ?? opportunity['investmentModel']),
      status,
      participationStatus: this.optionalString(row['participationStatus']),
      participationRequestId: this.optionalString(row['participationRequestId']),
      lastMessage: this.optionalString(row['lastMessage']),
      lastMessageAt: this.dateValue(row['lastMessageAt'] ?? row['updatedAt'] ?? row['createdAt']),
      unreadCount: this.numberValue(row['unreadCount']) ?? 0,
      createdAt: this.dateValue(row['createdAt']),
      closedAt: this.dateValue(row['closedAt']),
      closedByUserId: this.idValue(row['closedByUserId']),
      closeReason: this.optionalString(row['closeReason']),
      founderReady: this.booleanValue(row['founderReady']),
      investorReady: this.booleanValue(row['investorReady']),
      currentUserReady: this.resolveCurrentUserReady(row, direction),
      archived: this.booleanValue(row['archived']),
      readOnly: this.booleanValue(row['readOnly']) || status === 'Discussion Closed' || status === 'You withdrew' || status === 'Declined by Founder'
    };
  }

  private resolveCurrentUserReady(row: JsonRecord, direction: RequestDirection): boolean {
    if (row['currentUserReady'] !== undefined) {
      return this.booleanValue(row['currentUserReady']);
    }
    const founderReady = this.booleanValue(row['founderReady']);
    const investorReady = this.booleanValue(row['investorReady']);
    if (direction === 'incoming') return founderReady;
    if (direction === 'outgoing') return investorReady;
    const currentUserId = localStorage.getItem('userId');
    if (this.sameId(currentUserId, row['founderUserId'])) return founderReady;
    if (this.sameId(currentUserId, row['investorUserId'])) return investorReady;
    return false;
  }

  private mapMessage(value: unknown, conversation: NegotiationConversation | null): NegotiationMessage {
    const row = this.asRecord(value);
    const senderId = row['senderUserId'] ?? row['senderId'];
    const currentUserId = this.resolveCurrentUserId(conversation);
    const senderIdentity = this.resolveSenderIdentity(senderId, conversation);
    const isSender = this.booleanValue(row['isSender']) || (
      !!senderId && !!currentUserId && this.sameId(senderId, currentUserId)
    );
    return {
      id: this.stringValue(row['id'] ?? row['messageId']),
      conversationId: this.optionalString(row['conversationId']) || conversation?.id,
      senderId: senderId === null || senderId === undefined ? undefined : String(senderId),
      senderName: this.optionalString(row['senderName']) || senderIdentity.name,
      senderRole: this.normalizeRole(row['senderRole'] ?? senderIdentity.role),
      text: this.stringValue(row['message'] ?? row['text']),
      sentAt: this.dateValue(row['sentAt']) || new Date(0),
      isSender
    };
  }

  private mapOffer(value: unknown, conversation: NegotiationConversation | null = this.activeConversation()): NegotiationOffer {
    const row = this.asRecord(value);
    const actor = this.resolveSenderIdentity(row['createdByUserId'], conversation);
    return {
      id: Number(row['id']),
      conversationId: this.stringValue(row['conversationId']),
      createdByUserId: this.idValue(row['createdByUserId']),
      createdByName: this.optionalString(row['createdByName']) || actor.name,
      createdByRole: this.normalizeRole(row['createdByRole'] ?? actor.role),
      version: Number(row['version'] ?? 1),
      replacesOfferId: this.numberValue(row['replacesOfferId']),
      status: this.offerStatusValue(row['status']),
      note: this.optionalString(row['note']),
      currency: this.optionalString(row['currency']) || this.currencyService.defaultIsoCode(),
      createdAt: this.dateValue(row['createdAt']),
      canAccept: row['canAccept'] === true,
      canReject: row['canReject'] === true,
      canRespond: row['canRespond'] === true,
      canWithdraw: row['canWithdraw'] === true,
      legs: this.extractArray(row['legs']).map(value => {
        const leg = this.asRecord(value);
        return {
        id: this.numberValue(leg['id']) ?? undefined,
        legType: this.offerLegTypeValue(leg['legType']),
        amount: Number(leg['amount'] ?? 0),
        equityPercentage: this.numberValue(leg['equityPercentage']),
        sharesTerms: this.optionalString(leg['sharesTerms']),
        returnRate: this.numberValue(leg['returnRate']),
        termMonths: this.numberValue(leg['termMonths']),
        repaymentModel: this.optionalString(leg['repaymentModel']),
        profitSharePercentage: this.numberValue(leg['profitSharePercentage']),
        exitTerms: this.optionalString(leg['exitTerms'])
      };
      })
    };
  }

  private resolveCurrentUserId(conversation: NegotiationConversation | null): string | number | null {
    const storedUserId = localStorage.getItem('userId');
    if (!conversation) return null;
    if (
      storedUserId &&
      (
        this.sameId(storedUserId, conversation.requesterUserId) ||
        this.sameId(storedUserId, conversation.recipientUserId) ||
        this.sameId(storedUserId, conversation.founderUserId) ||
        this.sameId(storedUserId, conversation.investorUserId)
      )
    ) {
      return storedUserId;
    }
    if (conversation.direction === 'outgoing') return conversation.requesterUserId ?? conversation.investorUserId ?? null;
    if (conversation.direction === 'incoming') return conversation.recipientUserId ?? conversation.founderUserId ?? null;
    return null;
  }

  canReportConversationUser(conversation: NegotiationConversation): boolean {
    return !!this.resolveConversationCounterpartyUserId(conversation);
  }

  conversationReportLabel(conversation: NegotiationConversation): string {
    const counterpartyUserId = this.resolveConversationCounterpartyUserId(conversation);
    if (this.sameId(counterpartyUserId, conversation.founderUserId)) return this.t('reports.actions.reportFounder');
    if (this.sameId(counterpartyUserId, conversation.investorUserId)) return this.t('reports.actions.reportInvestor');
    return this.t('reports.actions.reportUser');
  }

  conversationReportTargetName(conversation: NegotiationConversation): string {
    const counterpartyUserId = this.resolveConversationCounterpartyUserId(conversation);
    if (this.sameId(counterpartyUserId, conversation.founderUserId)) {
      return conversation.founderName || conversation.recipientName || conversation.counterpartyName;
    }
    if (this.sameId(counterpartyUserId, conversation.investorUserId)) {
      return conversation.investorName || conversation.requesterName || conversation.counterpartyName;
    }
    return conversation.counterpartyName;
  }

  private resolveConversationCounterpartyUserId(conversation: NegotiationConversation | null): string | number | null {
    if (!conversation) return null;
    const currentUserId = this.resolveCurrentUserId(conversation);
    if (!currentUserId) return null;
    const candidates = [
      conversation.counterpartyUserId,
      this.sameId(currentUserId, conversation.founderUserId) ? conversation.investorUserId : null,
      this.sameId(currentUserId, conversation.investorUserId) ? conversation.founderUserId : null,
      this.sameId(currentUserId, conversation.requesterUserId) ? conversation.recipientUserId : null,
      this.sameId(currentUserId, conversation.recipientUserId) ? conversation.requesterUserId : null,
      conversation.founderUserId,
      conversation.investorUserId,
      conversation.requesterUserId,
      conversation.recipientUserId
    ];
    return candidates.find(candidate => !!candidate && !this.sameId(candidate, currentUserId)) ?? null;
  }

  private resolveSenderIdentity(senderId: unknown, conversation: NegotiationConversation | null): { name: string; role: string } {
    if (!conversation) return { name: 'Unknown sender', role: '' };
    if (this.sameId(senderId, conversation.founderUserId)) {
      return { name: conversation.founderName || conversation.recipientName || 'Founder', role: 'Founder' };
    }
    if (this.sameId(senderId, conversation.investorUserId)) {
      return { name: conversation.investorName || conversation.requesterName || 'Investor', role: 'Investor' };
    }
    if (this.sameId(senderId, conversation.requesterUserId)) {
      return { name: conversation.requesterName || conversation.investorName || 'Investor', role: this.normalizeRole(conversation.requesterRole || 'Investor') };
    }
    if (this.sameId(senderId, conversation.recipientUserId)) {
      return { name: conversation.recipientName || conversation.founderName || 'Founder', role: this.normalizeRole(conversation.recipientRole || 'Founder') };
    }
    if (this.sameId(senderId, conversation.counterpartyUserId)) {
      return { name: conversation.counterpartyName, role: this.normalizeRole(conversation.counterpartyRole || '') };
    }
    return { name: 'Unknown sender', role: '' };
  }

  private sameId(left: unknown, right: unknown): boolean {
    if (left === null || left === undefined || right === null || right === undefined) return false;
    return String(left).toLowerCase() === String(right).toLowerCase();
  }

  private async offerAction(offer: NegotiationOffer, action: 'accept' | 'reject' | 'withdraw'): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.offerProcessing()) return;
    try {
      this.offerProcessing.set(true);
      this.messagesError.set(null);
      const raw = await this.post<unknown>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers/${offer.id}/${action}`, {});
      const wrapped = this.asRecord(raw)['data'] ?? raw;
      if (action === 'accept') {
        const record = this.asRecord(wrapped);
        const updated = this.mapOffer(record['offer'] ?? wrapped);
        this.offers.update(items => items.map(item => item.id === updated.id ? updated : item));
        const participationRequestId = record['participationRequestId'];
        if (participationRequestId) {
          this.conversations.update(items => items.map(item =>
            item.id === conversation.id ? { ...item, participationRequestId: String(participationRequestId) } : item
          ));
        }
        await this.loadConversations();
      } else {
        const updated = this.mapOffer(wrapped);
        this.offers.update(items => items.map(item => item.id === updated.id ? updated : item));
      }
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, `Offer could not be ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'withdrawn'}.`));
    } finally {
      this.offerProcessing.set(false);
    }
  }

  private isOfferCreator(offer: NegotiationOffer): boolean {
    return this.sameId(offer.createdByUserId, this.resolveCurrentUserId(this.activeConversation()));
  }

  private normalizeRole(value: unknown): string {
    const role = String(value || '').trim().toLowerCase();
    if (role.includes('founder')) return 'Founder';
    if (role.includes('investor')) return 'Investor';
    return '';
  }

  private buildJourney(conversation: NegotiationConversation | null): JourneyStep[] {
    if (!conversation) return [];
    const viewerState = this.activeViewerState();
    const participation = this.normalizeParticipationStatus(viewerState?.participationStatus ?? conversation.participationStatus);
    const offerSent = this.offers().length > 0;
    const offerAccepted = this.offers().some(offer => offer.status === 3);
    const participationRequested = !!conversation.participationRequestId
      || !!viewerState?.hasPendingParticipationRequest
      || participation === 'pending'
      || participation === 'approved'
      || participation === 'rejected'
      || this.statusAtLeast(conversation.status, ['Participation Created', 'Participation Approved', 'Participation Rejected']);
    const participationApproved = participation === 'approved'
      || conversation.status === 'Participation Approved';
    const negotiationStarted = this.messages().length > 0
      || offerSent
      || !!conversation.founderReady
      || !!conversation.investorReady
      || participationRequested
      || this.statusAtLeast(conversation.status, ['Negotiation in Progress', 'Ready for Participation', 'Participation Created', 'Participation Approved', 'Participation Rejected']);
    const terminal = !!this.buildTerminalJourneyStatus(conversation);

    const completed = new Set<string>(['requested']);
    if (conversation.status !== 'Declined by Founder') completed.add('accepted');
    if (negotiationStarted) completed.add('negotiation');
    if (offerSent) completed.add('offerSent');
    if (offerAccepted) completed.add('offerAccepted');
    if (conversation.founderReady) completed.add('founderReady');
    if (conversation.investorReady) completed.add('investorReady');
    if (participationRequested) completed.add('participationRequest');
    if (participationApproved) completed.add('participationApproved');
    if (participationApproved) completed.add('projectRoomUnlocked');

    let currentKey = 'accepted';
    if (participationApproved) currentKey = 'projectRoomUnlocked';
    else if (participationRequested) currentKey = 'participationApproved';
    else if (conversation.founderReady && conversation.investorReady) currentKey = 'participationRequest';
    else if (conversation.founderReady) currentKey = 'investorReady';
    else if (conversation.investorReady) currentKey = 'founderReady';
    else if (offerAccepted) currentKey = 'founderReady';
    else if (offerSent) currentKey = 'offerAccepted';
    else if (negotiationStarted || completed.has('accepted')) currentKey = 'negotiation';
    if (terminal) currentKey = '';

    const definitions: Array<{ key: string; label: string; optional?: boolean }> = [
      { key: 'requested', label: this.t('conversationWorkspace.journey.requested') },
      { key: 'accepted', label: this.t('conversationWorkspace.journey.accepted') },
      { key: 'negotiation', label: this.t('conversationWorkspace.journey.negotiation') },
      { key: 'offerSent', label: this.t('conversationWorkspace.journey.offerSent'), optional: true },
      { key: 'offerAccepted', label: this.t('conversationWorkspace.journey.offerAccepted'), optional: true },
      { key: 'founderReady', label: this.t('conversationWorkspace.journey.founderReady') },
      { key: 'investorReady', label: this.t('conversationWorkspace.journey.investorReady') },
      { key: 'participationRequest', label: this.t('conversationWorkspace.journey.participationRequest') },
      { key: 'participationApproved', label: this.t('conversationWorkspace.journey.participationApproved') },
      { key: 'projectRoomUnlocked', label: this.t('conversationWorkspace.journey.projectRoomUnlocked') }
    ];

    return definitions
      .filter(step => !step.optional || offerSent)
      .filter(step => !(participationRequested && (step.key === 'founderReady' || step.key === 'investorReady') && !completed.has(step.key)))
      .filter(step => !terminal || completed.has(step.key))
      .map(step => ({
        key: step.key,
        label: step.label,
        state: step.key === currentKey ? 'current' : completed.has(step.key) ? 'completed' : 'future'
      }));
  }

  private buildTerminalJourneyStatus(conversation: NegotiationConversation | null): string {
    if (!conversation) return '';
    if (conversation.status === 'Participation Rejected') return this.t('conversationWorkspace.journey.terminalParticipationRejected');
    if (conversation.status === 'Declined by Founder') return this.t('conversationWorkspace.journey.terminalDeclined');
    if (conversation.status === 'You withdrew') return this.t('conversationWorkspace.journey.terminalWithdrawn');
    if (conversation.status === 'Discussion Closed') return this.t('conversationWorkspace.journey.terminalClosed');
    return '';
  }

  private buildStageSummary(conversation: NegotiationConversation | null): string {
    if (!conversation) return 'Select a conversation to see its current stage.';
    switch (conversation.status) {
      case 'Founder Accepted':
        return 'Negotiation is open and ready for discussion.';
      case 'Negotiation in Progress':
        return 'Negotiation is active. Keep the discussion focused on the opportunity.';
      case 'Ready for Participation':
        return 'One or both parties are ready to proceed.';
      case 'Participation Created':
        return 'A participation request has been created and is waiting for approval.';
      case 'Participation Approved':
        return 'Participation is approved and Project Room is unlocked.';
      case 'Participation Rejected':
        return 'The participation request was not approved.';
      case 'Declined by Founder':
        return 'The Founder declined this discussion.';
      case 'You withdrew':
        return 'You withdrew from this discussion.';
      case 'Discussion Closed':
        return 'This discussion is closed.';
      default:
        return 'Review the conversation thread and the readiness state below.';
    }
  }

  private buildParticipationSummary(conversation: NegotiationConversation | null): string {
    if (!conversation) return '';
    const state = this.activeViewerState();
    const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);
    if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || participationStatus.includes('approved')) return this.t('conversationWorkspace.participation.approved');
    if (state?.hasPendingParticipationRequest || participationStatus.includes('pending')) return this.t('conversationWorkspace.participation.pending');
    if (participationStatus.includes('rejected') || participationStatus.includes('declined')) return this.t('conversationWorkspace.participation.rejected');
    if (conversation.status === 'Participation Approved') return this.t('conversationWorkspace.participation.approved');
    if (conversation.status === 'Participation Rejected') return this.t('conversationWorkspace.participation.rejected');
    if (conversation.status === 'Participation Created') return this.t('conversationWorkspace.participation.pending');
    return this.t('conversationWorkspace.participation.notCreated');
  }

  private activeViewerState(): ViewerState | null {
    const conversationId = this.activeConversation()?.id;
    return conversationId ? this.viewerStates()[conversationId] ?? null : null;
  }

  private buildNextStep(conversation: NegotiationConversation | null): string {
    if (!conversation) return 'No conversation selected.';
    if (this.isReadOnly(conversation)) return 'This conversation is read-only.';
    if (conversation.status === 'Founder Accepted') return 'Continue the discussion and negotiate the details.';
    if (conversation.status === 'Negotiation in Progress' && !this.isCurrentUserReady()) return 'Mark yourself ready when you are prepared to proceed.';
    if (conversation.status === 'Ready for Participation' && !this.bothReady()) return 'Readiness helps the negotiation, but an Investor must still submit a Participation Request explicitly.';
    if (this.bothReady() && !this.buildParticipationSummary(conversation).toLowerCase().includes('pending')) return 'Both parties are ready. You can now submit your Participation Request.';
    if (conversation.status === 'Participation Created') return 'Wait for Founder approval of the participation request.';
    if (conversation.status === 'Participation Approved') return 'Open Project Room to continue collaboration.';
    if (conversation.status === 'Participation Rejected') return 'The participation request was declined.';
    return 'Use the message thread to continue the discussion.';
  }

  private normalizeStatus(value: unknown): NegotiationStatus {
    const raw = String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw === '1' || raw.includes('accepted') || raw.includes('founderaccepted')) return 'Founder Accepted';
    if (raw === '2' || raw.includes('negotiat') || raw.includes('inprogress')) return 'Negotiation in Progress';
    if (raw === '3' || raw === '4' || raw === '6' || raw.includes('closed') || raw.includes('completed')) return 'Discussion Closed';
    if (raw === '5' || raw.includes('cancel') || raw.includes('withdraw')) return 'You withdrew';
    if (raw === '7' || raw.includes('ready')) return 'Ready for Participation';
    if (raw === '8' || raw.includes('participationcreated')) return 'Participation Created';
    if (raw === '9' || (raw.includes('approved') && raw.includes('participation'))) return 'Participation Approved';
    if (raw === '10' || (raw.includes('rejected') && raw.includes('participation'))) return 'Participation Rejected';
    if (raw === '11' || raw.includes('declined')) return 'Declined by Founder';
    if (raw.includes('approved') && raw.includes('participation')) return 'Participation Approved';
    if (raw.includes('rejected') && raw.includes('participation')) return 'Participation Rejected';
    if (raw.includes('created') && raw.includes('participation')) return 'Participation Created';
    if (raw.includes('ready')) return 'Ready for Participation';
    if (raw.includes('declined') || raw.includes('rejected')) return 'Declined by Founder';
    return 'Negotiation in Progress';
  }

  private normalizeParticipationStatus(value: unknown): string {
    const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw === '0' || raw.includes('pending')) return 'pending';
    if (raw === '1' || raw.includes('approved') || raw.includes('accepted')) return 'approved';
    if (raw === '2' || raw.includes('rejected') || raw.includes('declined')) return 'rejected';
    if (raw === '3' || raw.includes('cancelled') || raw.includes('canceled')) return 'cancelled';
    return raw;
  }

  private statusAtLeast(status: NegotiationStatus, states: NegotiationStatus[]): boolean {
    return states.includes(status);
  }

  private isReadOnly(conversation: NegotiationConversation | null): boolean {
    return !!conversation?.readOnly || conversation?.status === 'Discussion Closed' || conversation?.status === 'Declined by Founder' || conversation?.status === 'You withdrew';
  }

  private currentUserLooksInvestor(conversation: NegotiationConversation): boolean {
    return this.sameId(this.resolveCurrentUserId(conversation), conversation.investorUserId);
  }

  private replaceConversation(updated: NegotiationConversation): void {
    this.conversations.update(items => items.map(item => item.id === updated.id ? updated : item));
  }

  private updateConversationStatus(id: string, status: NegotiationStatus): void {
    this.conversations.update(items => items.map(item => item.id === id ? { ...item, status } : item));
    const selected = this.selectedConversation();
    if (selected?.id === id) this.selectedConversation.set({ ...selected, status });
  }

  private async get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.apiBase}${path}`, this.getHttpOptions()));
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.apiBase}${path}`, body, this.getHttpOptions()));
  }

  private async startConversationPresence(conversationId: string): Promise<void> {
    this.presentConversationId = conversationId;
    const heartbeat = () => firstValueFrom(
      this.http.put<void>(
        `${this.apiBase}/api/v1/conversations/${conversationId}/presence`,
        {},
        this.getHttpOptions()
      )
    ).catch(() => undefined);
    await heartbeat();
    this.presenceTimer = setInterval(() => void heartbeat(), 30_000);
  }

  private handleRealtimeEvent(event: RealtimeEvent): void {
    const changedOffersConversationId = offerConversationId(event);
    if (changedOffersConversationId) {
      if (offerRealtimeAction(event) === 'accepted') {
        void this.loadConversations();
        return;
      }
      if (this.selectedConversation()?.id === changedOffersConversationId) {
        void this.loadOffers(changedOffersConversationId);
      }
      return;
    }

    if (event.type !== 'ConversationMessageSaved' || !event.data) return;

    const data = event.data;
    const saved: SavedConversationMessage = {
      messageId: this.stringValue(data['messageId'] ?? event.entityId),
      conversationId: this.stringValue(data['conversationId']),
      senderUserId: this.stringValue(data['senderUserId']),
      body: this.stringValue(data['body']),
      createdAt: this.dateValue(data['createdAt']) ?? new Date(event.createdAt)
    };
    if (!saved.messageId || !saved.conversationId || !saved.senderUserId) return;

    const firstReceipt = !this.receivedMessageIds.has(saved.messageId);
    this.receivedMessageIds.add(saved.messageId);
    const conversation = this.conversations().find(item => item.id === saved.conversationId);
    if (!conversation) {
      void this.loadConversations();
      return;
    }

    if (this.selectedConversation()?.id === saved.conversationId) {
      const message = this.mapMessage({
        id: saved.messageId,
        conversationId: saved.conversationId,
        senderId: saved.senderUserId,
        senderName: data['senderName'],
        senderRole: data['senderRole'],
        message: saved.body,
        sentAt: saved.createdAt
      }, conversation);
      this.messages.update(items => upsertAuthoritativeMessage(items, message).items);
      this.scheduleScrollToLatest();
    }

    this.updatePreviewFromSavedMessage(saved, firstReceipt);
  }

  private updatePreviewFromMessage(
    message: NegotiationMessage,
    conversationId: string,
    inserted: boolean
  ): void {
    this.updatePreviewFromSavedMessage({
      messageId: message.id,
      conversationId,
      senderUserId: String(message.senderId ?? ''),
      body: message.text,
      createdAt: message.sentAt
    }, inserted);
  }

  private updatePreviewFromSavedMessage(
    saved: SavedConversationMessage,
    inserted: boolean
  ): void {
    const currentConversation = this.conversations().find(item => item.id === saved.conversationId) ?? null;
    const currentUserId = this.resolveCurrentUserId(currentConversation);
    this.conversations.update(items => updateConversationPreview(
      items,
      saved,
      currentUserId === null ? null : String(currentUserId),
      this.presentConversationId,
      inserted
    ));

    const selected = this.selectedConversation();
    if (selected?.id === saved.conversationId) {
      this.selectedConversation.set({
        ...selected,
        lastMessage: saved.body,
        lastMessageAt: saved.createdAt,
        unreadCount: 0
      });
    }
  }

  private async refreshAfterRealtimeReconnect(): Promise<void> {
    const selectedId = this.selectedConversation()?.id;
    await this.loadConversations();
    if (selectedId && this.selectedConversation()?.id === selectedId) {
      await Promise.all([
        this.loadMessages(selectedId),
        this.loadOffers(selectedId)
      ]);
    }
  }

  private toOfferVersion(offer: NegotiationOffer): OfferVersion {
    return {
      id: offer.id,
      conversationId: offer.conversationId,
      createdByUserId: offer.createdByUserId == null ? null : String(offer.createdByUserId),
      createdByName: offer.createdByName,
      createdByRole: offer.createdByRole,
      version: offer.version,
      replacesOfferId: offer.replacesOfferId,
      status: offer.status as OfferStatusEnum,
      note: offer.note,
      currency: offer.currency,
      createdAt: offer.createdAt || new Date(),
      legs: offer.legs,
      canAccept: offer.canAccept,
      canReject: offer.canReject,
      canRespond: offer.canRespond,
      canWithdraw: offer.canWithdraw
    };
  }

  private async patch<T>(path: string, body: unknown): Promise<T> {
    return await firstValueFrom(this.http.patch<T>(`${this.apiBase}${path}`, body, this.getHttpOptions()));
  }

  private async leaveConversationPresence(): Promise<void> {
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
    const conversationId = this.presentConversationId;
    this.presentConversationId = null;
    if (!conversationId) return;
    await firstValueFrom(
      this.http.delete<void>(
        `${this.apiBase}/api/v1/conversations/${conversationId}/presence`,
        this.getHttpOptions()
      )
    ).catch(() => undefined);
  }

  private scheduleScrollToLatest(): void {
    if (this.scrollFrame !== null) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = null;
        scrollToLatest(this.messageStream?.nativeElement);
      });
    });
  }

  private extractArray(raw: unknown): unknown[] {
    const wrapped = this.asRecord(raw);
    const data = wrapped['data'] ?? raw;
    if (Array.isArray(data)) return data;
    const record = this.asRecord(data);
    if (Array.isArray(record['items'])) return record['items'];
    if (Array.isArray(record['conversations'])) return record['conversations'];
    if (Array.isArray(record['messages'])) return record['messages'];
    return [];
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) return 'You do not have access to this negotiation.';
      if (error.status === 404) return 'This negotiation was not found.';
      return error.error?.message || error.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
  }

  private numberValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private getHttpOptions() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      })
    };
  }

  private normalizeDirection(value: unknown): 'incoming' | 'outgoing' | 'unknown' {
    const raw = String(value || '').toLowerCase();
    if (raw.includes('incoming')) return 'incoming';
    if (raw.includes('outgoing')) return 'outgoing';
    return 'unknown';
  }

  t(path: string): string {
    return this.languageService.translate(path);
  }

  reportReasonLabel(reason: ReportReasonCode): string {
    return this.t(`reports.reasons.${reason}`);
  }

  private reportErrorMessage(error: unknown): string {
    const errorRecord = this.asRecord(error);
    const response = this.asRecord(errorRecord['error']);
    const raw = String(response['message'] ?? errorRecord['message'] ?? '').toLowerCase();
    if (raw.includes('duplicate') || raw.includes('pending')) return this.t('reports.errors.duplicatePending');
    if (raw.includes('invalid') || raw.includes('target')) return this.t('reports.errors.invalidTarget');
    if (raw.includes('self')) return this.t('reports.errors.selfReport');
    return this.t('reports.errors.generic');
  }

  private confirmationText(action: string, cost: number, balance: number, after: number): string {
    return this.t('paidActions.confirmationText')
      .replace('{action}', action)
      .replace('{cost}', this.formatCredits(cost))
      .replace('{balance}', this.formatCredits(balance))
      .replace('{after}', this.formatCredits(after));
  }

  private formatCredits(value: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
  }

  private clearSelection(): void {
    void this.leaveConversationPresence();
    this.selectedConversation.set(null);
    this.selectedRequest.set(null);
    this.messages.set([]);
    this.messagesError.set(null);
  }

  private asRecord(value: unknown): JsonRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
  }

  private stringValue(value: unknown): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private optionalString(value: unknown): string | undefined {
    const result = this.stringValue(value);
    return result || undefined;
  }

  private idValue(value: unknown): string | number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return this.optionalString(value);
  }

  private dateValue(value: unknown): string | Date | undefined {
    return value instanceof Date || typeof value === 'string' ? value : undefined;
  }

  private booleanValue(value: unknown): boolean {
    return value === true || value === 1 || String(value).toLowerCase() === 'true';
  }

  private offerStatusValue(value: unknown): OfferStatus {
    return normalizeOfferStatus(value);
  }

  private offerLegTypeValue(value: unknown): OfferLegType {
    const type = Number(value);
    return type === 2 || type === 3 ? type : 1;
  }

  private mapViewerState(value: unknown): ViewerState {
    const row = this.asRecord(value);
    return {
      projectRoomUnlocked: this.booleanValue(row['projectRoomUnlocked']),
      canOpenProjectRoom: this.booleanValue(row['canOpenProjectRoom']),
      hasPendingParticipationRequest: this.booleanValue(row['hasPendingParticipationRequest']),
      participationStatus: this.optionalString(row['participationStatus'])
    };
  }

  private mapRequest(value: unknown): ConversationRequest {
    const row = this.asRecord(value);
    const opportunity = this.asRecord(row['opportunity']);
    const statusRaw = String(row['statusText'] ?? row['status'] ?? '').toLowerCase();
    const status: RequestStatus = statusRaw.includes('accept') || statusRaw === '1' ? 'accepted'
      : statusRaw.includes('reject') || statusRaw === '2' ? 'rejected'
      : statusRaw.includes('withdraw') || statusRaw.includes('cancel') || statusRaw === '3' ? 'withdrawn'
      : 'pending';
    return {
      id: this.stringValue(row['id']),
      opportunityId: this.idValue(row['opportunityId'] ?? opportunity['id']) ?? '',
      opportunityTitle: this.stringValue(opportunity['title']),
      direction: this.normalizeDirection(row['direction']),
      counterpartyUserId: this.idValue(row['counterpartyUserId']),
      counterpartyName: this.stringValue(row['counterpartyName']),
      counterpartyRole: this.optionalString(row['counterpartyRole']),
      message: this.optionalString(row['message']),
      status,
      createdAt: this.dateValue(row['createdAt']),
      updatedAt: this.dateValue(row['updatedAt']),
      canAccept: this.booleanValue(row['canAccept']),
      canReject: this.booleanValue(row['canReject']),
      canWithdraw: this.booleanValue(row['canWithdraw']),
      acceptedConversationId: this.optionalString(row['acceptedConversationId'])
    };
  }

  private async hydrateConversationPreview(conversation: NegotiationConversation): Promise<NegotiationConversation> {
    if (conversation.lastMessage) return conversation;
    try {
      const raw = await this.get<unknown>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/messages`);
      const rows = this.extractArray(raw);
      if (!rows.length) return conversation;
      const lastMessage = this.mapMessage(rows[rows.length - 1], conversation);
      return { ...conversation, lastMessage: lastMessage.text, lastMessageAt: lastMessage.sentAt };
    } catch {
      return conversation;
    }
  }

  private async requestAction(request: ConversationRequest, action: 'accept' | 'reject' | 'withdraw'): Promise<void> {
    if (this.actionProcessing()) return;
    try {
      this.actionProcessing.set(true);
      this.messagesError.set(null);
      const body = action === 'reject' ? { reason: '' } : {};
      const raw = await this.post<unknown>(`/api/v1/conversation-requests/${encodeURIComponent(request.id)}/${action}`, body);
      const data = this.asRecord(raw)['data'];
      const acceptedConversationId = this.optionalString(this.asRecord(data)['acceptedConversationId']);
      await this.loadConversations();
      if (action === 'accept' && acceptedConversationId) {
        this.workspaceTab.set('conversations');
        const conversation = this.conversations().find(item => item.id === acceptedConversationId);
        if (conversation) await this.selectConversation(conversation);
      }
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, this.t('conversationWorkspace.errors.requestAction')));
    } finally {
      this.actionProcessing.set(false);
    }
  }

  statusLabel(status: NegotiationStatus): string {
    const key: Record<NegotiationStatus, string> = {
      'Founder Accepted': 'founderAccepted',
      'Negotiation in Progress': 'inProgress',
      'Declined by Founder': 'declined',
      'You withdrew': 'withdrawn',
      'Ready for Participation': 'ready',
      'Participation Created': 'participationCreated',
      'Participation Approved': 'participationApproved',
      'Participation Rejected': 'participationRejected',
      'Discussion Closed': 'closed'
    };
    return this.t(`conversationWorkspace.status.${key[status]}`);
  }

  requestStatusLabel(status: RequestStatus): string {
    return this.t(`conversationWorkspace.requestStatus.${status}`);
  }

  roleLabel(role?: string): string {
    const normalized = this.normalizeRole(role);
    return normalized ? this.t(`conversationWorkspace.roles.${normalized.toLowerCase()}`) : '';
  }

  investmentModelLabel(value?: string): string {
    const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw.includes('equity') || raw === '1') return this.t('conversationWorkspace.offerTypes.equity');
    if (raw.includes('loan') || raw.includes('debt') || raw === '2') return this.t('conversationWorkspace.offerTypes.loan');
    if (raw.includes('profit') || raw === '3') return this.t('conversationWorkspace.offerTypes.profitSharing');
    return '';
  }

  initials(name?: string): string {
    return (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '—';
  }

  founderProfileId(conversation: NegotiationConversation): string | number | null {
    return conversation.founderUserId ?? null;
  }

  participantFounderProfileId(conversation: NegotiationConversation): string | number | null {
    return this.sameId(conversation.counterpartyUserId, conversation.founderUserId) ? conversation.founderUserId ?? null : null;
  }

  isMessageGroupStart(index: number): boolean {
    const current = this.chatItems()[index];
    const previous = this.chatItems()[index - 1];
    return current?.kind === 'message' && (previous?.kind !== 'message' || previous.message.senderId !== current.message.senderId);
  }

  replacedOfferVersion(offer: NegotiationOffer): number | null {
    if (!offer.replacesOfferId) return null;
    return this.offers().find(item => item.id === offer.replacesOfferId)?.version ?? null;
  }

}
