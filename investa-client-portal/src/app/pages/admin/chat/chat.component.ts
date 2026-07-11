import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../../../config/api.token';
import { ParticipationBuilderComponent } from '../../../components/participation-builder/participation-builder.component';
import { PaidActionCode, WalletService } from '../../../services/wallet.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

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
  avatarUrl: string;
  fundingTarget?: number | null;
  minimumParticipation?: number | null;
  investmentModel?: string;
  status: NegotiationStatus;
  participationStatus?: string | null;
  participationRequestId?: string | null;
  lastMessage?: string;
  lastMessageAt?: string | Date | null;
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

interface NegotiationMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  text: string;
  sentAt: string | Date;
  isSender: boolean;
}

interface TimelineEvent {
  label: string;
  date?: string | Date | null;
  active: boolean;
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
  version: number;
  parentOfferId?: number | null;
  status: OfferStatus;
  note?: string | null;
  currency: string;
  createdAt?: string | Date | null;
  legs: NegotiationOfferLeg[];
}

interface OfferLegDraft {
  enabled: boolean;
  amount: FormControl<number | null>;
  equityPercentage?: FormControl<number | null>;
  sharesTerms?: FormControl<string | null>;
  returnRate?: FormControl<number | null>;
  termMonths?: FormControl<number | null>;
  repaymentModel?: FormControl<string | null>;
  profitSharePercentage?: FormControl<number | null>;
  exitTerms?: FormControl<string | null>;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ParticipationBuilderComponent, TranslatePipe]
})
export class ChatComponent implements OnInit {
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE);
  private route = inject(ActivatedRoute);
  private walletService = inject(WalletService);
  private languageService = inject(LanguageService);

  conversations = signal<NegotiationConversation[]>([]);
  messages = signal<NegotiationMessage[]>([]);
  offers = signal<NegotiationOffer[]>([]);
  selectedConversation = signal<NegotiationConversation | null>(null);
  loading = signal(true);
  messagesLoading = signal(false);
  sending = signal(false);
  actionProcessing = signal(false);
  offerProcessing = signal(false);
  offerBuilderOpen = signal(false);
  counteringOfferId = signal<number | null>(null);
  participationBuilderOpen = signal(false);
  error = signal<string | null>(null);
  messagesError = signal<string | null>(null);
  conversationTab = signal<'active' | 'archived' | 'all'>('active');
  viewerStates = signal<Record<string, any>>({});
  messageControl = new FormControl('');
  offerNoteControl = new FormControl('');
  offerCurrencyControl = new FormControl('USD');
  offerDrafts: Record<OfferLegType, OfferLegDraft> = {
    1: {
      enabled: true,
      amount: new FormControl<number | null>(null),
      equityPercentage: new FormControl<number | null>(null),
      sharesTerms: new FormControl<string | null>('')
    },
    2: {
      enabled: false,
      amount: new FormControl<number | null>(null),
      returnRate: new FormControl<number | null>(null),
      termMonths: new FormControl<number | null>(null),
      repaymentModel: new FormControl<string | null>('Monthly')
    },
    3: {
      enabled: false,
      amount: new FormControl<number | null>(null),
      profitSharePercentage: new FormControl<number | null>(null),
      termMonths: new FormControl<number | null>(null),
      exitTerms: new FormControl<string | null>('')
    }
  };

  visibleConversations = computed(() => {
    const tab = this.conversationTab();
    return this.conversations().filter(conversation => {
      if (tab === 'all') return true;
      if (tab === 'archived') return conversation.archived || this.isReadOnly(conversation);
      return !conversation.archived || this.isReadOnly(conversation);
    });
  });

  private selectionWatcher = effect(() => {
    const selected = this.selectedConversation();
    if (!selected) return;

    const visibleIds = new Set(this.visibleConversations().map(item => item.id));
    if (!visibleIds.has(selected.id)) {
      this.clearSelection();
    }
  }, { allowSignalWrites: true });

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
    const summary = this.buildParticipationSummary(conversation).toLowerCase();
    if (summary.includes('pending') || summary.includes('approved')) return false;
    return !this.isReadOnly(conversation);
  });
  timeline = computed(() => this.buildTimeline(this.activeConversation()));
  stageSummary = computed(() => this.buildStageSummary(this.activeConversation()));
  participationSummary = computed(() => this.buildParticipationSummary(this.activeConversation()));
  nextStep = computed(() => this.buildNextStep(this.activeConversation()));

  async ngOnInit(): Promise<void> {
    await this.loadConversations();
  }

  async loadConversations(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const raw = await this.get<any>('/api/v1/conversations');
      const rows = this.extractArray(raw);
      const conversations = rows.map(row => this.mapConversation(row));
      this.conversations.set(conversations);

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
      this.clearSelection();
    } finally {
      this.loading.set(false);
    }
  }

  async selectConversation(conversation: NegotiationConversation): Promise<void> {
    this.selectedConversation.set(conversation);
    await this.loadViewerState(conversation);
    await this.loadMessages(conversation.id);
    await this.loadOffers(conversation.id);
  }

  async loadViewerState(conversation: NegotiationConversation): Promise<void> {
    if (!conversation.opportunityId) return;
    try {
      const raw = await this.get<any>(`/api/v1/opportunities/${encodeURIComponent(String(conversation.opportunityId))}/viewer-state`);
      const state = raw?.data ?? raw;
      this.viewerStates.update(items => ({ ...items, [String(conversation.opportunityId)]: state }));
    } catch {
      this.viewerStates.update(items => {
        const next = { ...items };
        delete next[String(conversation.opportunityId)];
        return next;
      });
    }
  }

  async loadMessages(conversationId: string): Promise<void> {
    try {
      this.messagesLoading.set(true);
      this.messagesError.set(null);
      const raw = await this.get<any>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`);
      const conversation = this.conversations().find(item => item.id === conversationId) || this.selectedConversation();
      const messages = this.extractArray(raw).map(row => this.mapMessage(row, conversation));
      messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      this.messages.set(messages);
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, 'Unable to load messages.'));
      this.messages.set([]);
    } finally {
      this.messagesLoading.set(false);
    }
  }

  async loadOffers(conversationId: string): Promise<void> {
    try {
      const raw = await this.get<any>(`/api/v1/conversations/${encodeURIComponent(conversationId)}/offers`);
      this.offers.set(this.extractArray(raw).map(row => this.mapOffer(row)));
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

    try {
      this.sending.set(true);
      this.messagesError.set(null);
      const raw = await this.post<any>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/messages`, { message: text });
      this.messages.update(items => [...items, this.mapMessage(raw?.data ?? raw, conversation)]);
      this.messageControl.setValue('');
      this.updateConversationStatus(conversation.id, 'Negotiation in Progress');
    } catch (error) {
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
      const raw = await this.post<any>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/ready-to-proceed`, {});
      const updated = raw?.data ? this.mapConversation(raw.data) : {
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
      const raw = await this.post<any>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/close`, { reason: reason.trim() || null });
      const updated = raw?.data ? this.mapConversation(raw.data) : {
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

  openOfferBuilder(counterOffer?: NegotiationOffer): void {
    if (this.isReadOnly(this.activeConversation()) || this.offerProcessing()) return;
    this.resetOfferBuilder();
    if (counterOffer) {
      this.counteringOfferId.set(counterOffer.id);
      this.seedOfferBuilder(counterOffer);
    } else {
      this.counteringOfferId.set(null);
    }
    this.offerBuilderOpen.set(true);
  }

  closeOfferBuilder(): void {
    this.offerBuilderOpen.set(false);
    this.counteringOfferId.set(null);
  }

  async submitOffer(): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.isReadOnly(conversation) || this.offerProcessing()) return;

    const payload = this.buildOfferPayload();
    if (!payload.legs.length) {
      this.messagesError.set('Select at least one offer leg.');
      return;
    }

    try {
      this.offerProcessing.set(true);
      this.messagesError.set(null);
      const counterId = this.counteringOfferId();
      const actionCode: PaidActionCode = counterId ? 'SendCounterOffer' : 'SendFirstOffer';
      const quote = await this.walletService.getPaidActionQuote(actionCode);
      if (!quote.hasSufficientCredit) {
        this.messagesError.set(
          this.t('paidActions.insufficientMessage')
            .replace('{required}', this.formatCredits(quote.creditCost))
            .replace('{balance}', this.formatCredits(quote.currentBalance))
        );
        return;
      }
      if (!window.confirm(this.confirmationText(quote.displayName || actionCode, quote.creditCost, quote.currentBalance, quote.balanceAfter))) {
        return;
      }
      const path = counterId
        ? `/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers/${counterId}/counter`
        : `/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers`;
      const raw = await this.post<any>(path, payload);
      const offer = this.mapOffer(raw?.data ?? raw);
      if (counterId) {
        this.offers.update(items => [...items.map(item => item.id === counterId ? { ...item, status: 2 as OfferStatus } : item), offer]);
      } else {
        this.offers.update(items => [...items, offer]);
      }
      this.closeOfferBuilder();
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, 'Offer could not be submitted.'));
    } finally {
      this.offerProcessing.set(false);
    }
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
    return offer.status === 1 && !this.isOfferCreator(offer) && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
  }

  canWithdrawOffer(offer: NegotiationOffer): boolean {
    return offer.status === 1 && this.isOfferCreator(offer) && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
  }

  isAcceptedOffer(offer: NegotiationOffer): boolean {
    return offer.status === 3;
  }

  offerStatusLabel(status: OfferStatus): string {
    switch (Number(status)) {
      case 1: return 'Pending';
      case 2: return 'Countered';
      case 3: return 'Accepted';
      case 4: return 'Rejected';
      case 5: return 'Withdrawn';
      default: return 'Unknown';
    }
  }

  offerLegLabel(type: OfferLegType): string {
    switch (Number(type)) {
      case 1: return 'Equity';
      case 2: return 'Loan';
      case 3: return 'Profit Sharing';
      default: return 'Offer';
    }
  }

  openParticipationBuilder(): void {
    if (!this.canCreateParticipationRequest()) return;
    this.participationBuilderOpen.set(true);
  }

  closeParticipationBuilder(): void {
    this.participationBuilderOpen.set(false);
  }

  async onParticipationSubmitted(): Promise<void> {
    this.participationBuilderOpen.set(false);
    const conversation = this.activeConversation();
    if (conversation) {
      await this.loadViewerState(conversation);
    }
    await this.loadConversations();
  }

  setConversationTab(tab: 'active' | 'archived' | 'all'): void {
    this.conversationTab.set(tab);
  }

  canSendMessage(): boolean {
    const conversation = this.activeConversation();
    return !!conversation && !this.isReadOnly(conversation) && !this.sending() && !!this.messageControl.value?.trim();
  }

  composerHint(): string {
    const conversation = this.activeConversation();
    if (!conversation) return 'Select a conversation to begin.';
    if (this.isReadOnly(conversation)) return 'This discussion is closed and read-only.';
    return 'Write a negotiation message...';
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
        return 'border-blue-500/30 bg-blue-500/10 text-blue-200';
      case 'Participation Created':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-200';
      case 'Participation Approved':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
      case 'Declined by Founder':
      case 'You withdrew':
      case 'Participation Rejected':
      case 'Discussion Closed':
        return 'border-red-500/30 bg-red-500/10 text-red-200';
      default:
        return 'border-slate-700 bg-slate-800 text-slate-300';
    }
  }

  money(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
  }

  formatDate(value: string | Date | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }

  formatTime(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private mapConversation(row: any): NegotiationConversation {
    const status = this.normalizeStatus(row.conversationStatus ?? row.status ?? row.negotiationStatus ?? row.state ?? row.statusText);
    const opportunity = row.opportunity || row.investment || {};
    const direction = this.normalizeDirection(row.direction);
    const founder = row.founder || opportunity.founder || {};
    const investor = row.investor || {};
    const requesterName = row.requesterName || row.requester?.name;
    const recipientName = row.recipientName || row.recipient?.name;
    const counterpartyName = row.counterpartyName || row.counterpartName || row.otherUserName || row.otherParticipant?.name || row.counterparty?.name || 'Conversation partner';
    const counterpartyRole = row.counterpartyRole || row.counterpartRole || row.otherParticipant?.role || row.counterparty?.role;
    return {
      id: String(row.id ?? row.conversationId),
      direction,
      opportunityId: row.opportunityId ?? opportunity.id,
      opportunityTitle: row.opportunityTitle || row.title || opportunity.title || opportunity.businessName || 'Opportunity',
      shortDescription: row.shortDescription || opportunity.shortDescription || opportunity.description,
      founderName: row.founderName || founder.name || opportunity.founderName,
      founderUserId: row.founderUserId ?? founder.id ?? opportunity.founderId ?? null,
      investorName: row.investorName || investor.name,
      investorUserId: row.investorUserId ?? investor.id ?? null,
      requesterUserId: row.requesterUserId ?? row.requester?.id ?? null,
      requesterName,
      requesterRole: row.requesterRole || row.requester?.role,
      recipientUserId: row.recipientUserId ?? row.recipient?.id ?? null,
      recipientName,
      recipientRole: row.recipientRole || row.recipient?.role,
      counterpartyUserId: row.counterpartyUserId || row.counterpartUserId || row.otherParticipant?.id || row.counterparty?.id || null,
      counterpartyName,
      counterpartyRole,
      avatarUrl: row.avatarUrl || row.counterparty?.avatarUrl || row.otherParticipant?.avatarUrl || 'https://picsum.photos/seed/negotiation/100/100',
      fundingTarget: this.numberValue(row.fundingTarget ?? opportunity.fundingTarget ?? opportunity.targetFund),
      minimumParticipation: this.numberValue(row.minimumParticipation ?? row.minimumInvestment ?? opportunity.minimumInvestmentAmount ?? opportunity.minimumInvestment),
      investmentModel: row.investmentModel || opportunity.investmentModel || opportunity.investmentType,
      status,
      participationStatus: row.participationStatus ?? row.joinRequestStatus ?? null,
      participationRequestId: row.participationRequestId ?? row.joinRequestId ?? null,
      lastMessage: row.lastMessage || row.preview || 'Start the negotiation',
      lastMessageAt: row.lastMessageAt || row.updatedAt || row.createdAt,
      createdAt: row.createdAt,
      closedAt: row.closedAt,
      closedByUserId: row.closedByUserId ?? row.closedBy ?? null,
      closeReason: row.closeReason ?? row.closedReason ?? row.reason ?? null,
      founderReady: !!(row.founderReady ?? row.isFounderReady),
      investorReady: !!(row.investorReady ?? row.isInvestorReady),
      currentUserReady: this.resolveCurrentUserReady(row, direction),
      archived: !!row.archived,
      readOnly: !!row.readOnly || status === 'Discussion Closed' || status === 'You withdrew' || status === 'Declined by Founder'
    };
  }

  private resolveCurrentUserReady(row: any, direction: 'incoming' | 'outgoing' | 'unknown'): boolean {
    if (row.currentUserReady !== undefined || row.isCurrentUserReady !== undefined) {
      return !!(row.currentUserReady ?? row.isCurrentUserReady);
    }
    const founderReady = !!(row.founderReady ?? row.isFounderReady);
    const investorReady = !!(row.investorReady ?? row.isInvestorReady);
    if (direction === 'incoming') return founderReady;
    if (direction === 'outgoing') return investorReady;
    const currentUserId = localStorage.getItem('userId');
    if (this.sameId(currentUserId, row.founderUserId ?? row.founder?.id)) return founderReady;
    if (this.sameId(currentUserId, row.investorUserId ?? row.investor?.id)) return investorReady;
    return false;
  }

  private mapMessage(row: any, conversation: NegotiationConversation | null): NegotiationMessage {
    const senderId = row.senderUserId ?? row.senderId ?? row.userId ?? row.authorId;
    const currentUserId = this.resolveCurrentUserId(conversation);
    const senderIdentity = this.resolveSenderIdentity(senderId, conversation);
    const isSender = row.isSender ?? (
      !!senderId && !!currentUserId && this.sameId(senderId, currentUserId)
    );
    return {
      id: String(row.id ?? row.messageId ?? Date.now()),
      senderId: senderId === null || senderId === undefined ? undefined : String(senderId),
      senderName: row.senderFullName || row.senderName || row.authorName || senderIdentity.name,
      senderRole: this.normalizeRole(row.senderRole || row.role || senderIdentity.role),
      text: row.text || row.message || row.body || '',
      sentAt: row.sentAt || row.timestamp || row.createdAt || new Date(),
      isSender
    };
  }

  private mapOffer(row: any): NegotiationOffer {
    return {
      id: Number(row.id),
      conversationId: String(row.conversationId),
      createdByUserId: row.createdByUserId ?? null,
      createdByName: row.createdByName,
      version: Number(row.version ?? 1),
      parentOfferId: row.parentOfferId ?? null,
      status: Number(row.status) as OfferStatus,
      note: row.note ?? null,
      currency: row.currency || 'Credits',
      createdAt: row.createdAt,
      legs: this.extractArray(row.legs ?? row.Legs).map(leg => ({
        id: leg.id,
        legType: Number(leg.legType) as OfferLegType,
        amount: Number(leg.amount ?? 0),
        equityPercentage: leg.equityPercentage ?? null,
        sharesTerms: leg.sharesTerms ?? null,
        returnRate: leg.returnRate ?? null,
        termMonths: leg.termMonths ?? null,
        repaymentModel: leg.repaymentModel ?? null,
        profitSharePercentage: leg.profitSharePercentage ?? null,
        exitTerms: leg.exitTerms ?? null
      }))
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
      const raw = await this.post<any>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers/${offer.id}/${action}`, {});
      const updated = this.mapOffer(raw?.data ?? raw);
      this.offers.update(items => items.map(item => item.id === updated.id ? updated : item));
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, `Offer could not be ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'withdrawn'}.`));
    } finally {
      this.offerProcessing.set(false);
    }
  }

  private isOfferCreator(offer: NegotiationOffer): boolean {
    return this.sameId(offer.createdByUserId, this.resolveCurrentUserId(this.activeConversation()));
  }

  private buildOfferPayload(): any {
    const legs: any[] = [];
    const equity = this.offerDrafts[1];
    if (equity.enabled) {
      legs.push({
        legType: 1,
        amount: Number(equity.amount.value || 0),
        equityPercentage: equity.equityPercentage?.value || null,
        sharesTerms: equity.sharesTerms?.value?.trim() || null
      });
    }
    const loan = this.offerDrafts[2];
    if (loan.enabled) {
      legs.push({
        legType: 2,
        amount: Number(loan.amount.value || 0),
        returnRate: loan.returnRate?.value || null,
        termMonths: loan.termMonths?.value || null,
        repaymentModel: loan.repaymentModel?.value?.trim() || null
      });
    }
    const profit = this.offerDrafts[3];
    if (profit.enabled) {
      legs.push({
        legType: 3,
        amount: Number(profit.amount.value || 0),
        profitSharePercentage: profit.profitSharePercentage?.value || null,
        termMonths: profit.termMonths?.value || null,
        exitTerms: profit.exitTerms?.value?.trim() || null
      });
    }
    return {
      note: this.offerNoteControl.value?.trim() || null,
      currency: this.offerCurrencyControl.value?.trim() || 'USD',
      legs
    };
  }

  private resetOfferBuilder(): void {
    this.offerNoteControl.setValue('');
    this.offerCurrencyControl.setValue('USD');
    for (const key of [1, 2, 3] as OfferLegType[]) {
      const draft = this.offerDrafts[key];
      draft.enabled = key === 1;
      draft.amount.setValue(null);
      draft.equityPercentage?.setValue(null);
      draft.sharesTerms?.setValue('');
      draft.returnRate?.setValue(null);
      draft.termMonths?.setValue(null);
      draft.repaymentModel?.setValue('Monthly');
      draft.profitSharePercentage?.setValue(null);
      draft.exitTerms?.setValue('');
    }
  }

  private seedOfferBuilder(offer: NegotiationOffer): void {
    this.offerNoteControl.setValue(offer.note ? `Counter: ${offer.note}` : '');
    this.offerCurrencyControl.setValue(offer.currency || 'USD');
    for (const leg of offer.legs) {
      const draft = this.offerDrafts[leg.legType];
      if (!draft) continue;
      draft.enabled = true;
      draft.amount.setValue(leg.amount || null);
      draft.equityPercentage?.setValue(leg.equityPercentage ?? null);
      draft.sharesTerms?.setValue(leg.sharesTerms || '');
      draft.returnRate?.setValue(leg.returnRate ?? null);
      draft.termMonths?.setValue(leg.termMonths ?? null);
      draft.repaymentModel?.setValue(leg.repaymentModel || 'Monthly');
      draft.profitSharePercentage?.setValue(leg.profitSharePercentage ?? null);
      draft.exitTerms?.setValue(leg.exitTerms || '');
    }
  }

  private normalizeRole(value: unknown): string {
    const role = String(value || '').trim().toLowerCase();
    if (role.includes('founder')) return 'Founder';
    if (role.includes('investor')) return 'Investor';
    return '';
  }

  private buildTimeline(conversation: NegotiationConversation | null): TimelineEvent[] {
    if (!conversation) return [];
    const status = conversation.status;
    return [
      { label: 'Conversation Started', date: conversation.createdAt, active: true },
      { label: 'Founder Accepted', active: this.statusAtLeast(status, ['Founder Accepted', 'Negotiation in Progress', 'Ready for Participation', 'Participation Created', 'Participation Approved', 'Participation Rejected']) },
      { label: 'Negotiation Started', active: this.messages().length > 0 || this.statusAtLeast(status, ['Negotiation in Progress', 'Ready for Participation', 'Participation Created', 'Participation Approved', 'Participation Rejected']) },
      { label: 'Founder Ready', active: !!conversation.founderReady },
      { label: 'Investor Ready', active: !!conversation.investorReady },
      { label: 'Participation Request Created', active: this.statusAtLeast(status, ['Participation Created', 'Participation Approved', 'Participation Rejected']) },
      { label: 'Participation Approved', active: status === 'Participation Approved' },
      { label: 'Participation Rejected', active: status === 'Participation Rejected' },
      { label: 'Discussion Closed', date: conversation.closedAt, active: this.isReadOnly(conversation) }
    ];
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
    if (!conversation) return 'No conversation selected.';
    const state = this.activeViewerState();
    const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);
    if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || participationStatus.includes('approved')) return 'Approved';
    if (state?.hasPendingParticipationRequest || participationStatus.includes('pending')) return 'Pending approval';
    if (participationStatus.includes('rejected') || participationStatus.includes('declined')) return 'Rejected';
    if (conversation.status === 'Participation Approved') return 'Approved';
    if (conversation.status === 'Participation Rejected') return 'Rejected';
    if (conversation.status === 'Participation Created') return 'Pending approval';
    if (conversation.participationStatus) return String(conversation.participationStatus);
    return 'Not yet created';
  }

  private activeViewerState(): any | null {
    const opportunityId = this.activeConversation()?.opportunityId;
    return opportunityId ? this.viewerStates()[String(opportunityId)] ?? null : null;
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
    return !!conversation.investorName || !conversation.founderName;
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

  private async post<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.apiBase}${path}`, body, this.getHttpOptions()));
  }

  private extractArray(raw: any): any[] {
    const data = raw?.data ?? raw;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.conversations)) return data.conversations;
    if (Array.isArray(data?.messages)) return data.messages;
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

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  private confirmationText(action: string, cost: number, balance: number, after: number): string {
    return this.t('paidActions.confirmationText')
      .replace('{action}', action)
      .replace('{cost}', this.formatCredits(cost))
      .replace('{balance}', this.formatCredits(balance))
      .replace('{after}', this.formatCredits(after));
  }

  private formatCredits(value: number): string {
    return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
  }

  private clearSelection(): void {
    this.selectedConversation.set(null);
    this.messages.set([]);
    this.messagesError.set(null);
  }
}
