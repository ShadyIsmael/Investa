import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../../../config/api.token';

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

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ChatComponent implements OnInit {
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE);
  private route = inject(ActivatedRoute);

  conversations = signal<NegotiationConversation[]>([]);
  messages = signal<NegotiationMessage[]>([]);
  selectedConversation = signal<NegotiationConversation | null>(null);
  loading = signal(true);
  messagesLoading = signal(false);
  sending = signal(false);
  actionProcessing = signal(false);
  error = signal<string | null>(null);
  messagesError = signal<string | null>(null);
  conversationTab = signal<'active' | 'archived' | 'all'>('active');
  messageControl = new FormControl('');

  visibleConversations = computed(() => {
    const tab = this.conversationTab();
    return this.conversations().filter(conversation => {
      if (tab === 'all') return true;
      if (tab === 'archived') return conversation.archived || this.isReadOnly(conversation);
      return !conversation.archived && !this.isReadOnly(conversation);
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
  projectRoomUnlocked = computed(() => this.activeConversation()?.status === 'Participation Approved');
  canMarkReady = computed(() => {
    const conversation = this.activeConversation();
    return !!conversation && !this.isReadOnly(conversation) && !this.isCurrentUserReady() && !this.actionProcessing();
  });
  canCloseDiscussion = computed(() => {
    const conversation = this.activeConversation();
    return !!conversation && !this.isReadOnly(conversation) && !this.actionProcessing();
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
    await this.loadMessages(conversation.id);
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
      this.messagesError.set(this.errorMessage(error, 'Message could not be sent.'));
    } finally {
      this.sending.set(false);
    }
  }

  async markReadyToProceed(): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.isCurrentUserReady() || this.isReadOnly(conversation) || this.actionProcessing()) return;

    const confirmation = window.confirm(
      'You are confirming that you are ready to move beyond negotiation. This does not mean final participation approval yet. Continue?'
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
      this.messagesError.set(this.errorMessage(error, 'Could not mark ready to proceed.'));
    } finally {
      this.actionProcessing.set(false);
    }
  }

  async closeDiscussion(): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation || this.isReadOnly(conversation) || this.actionProcessing()) return;

    const confirmation = window.confirm(
      'Close this discussion? Messaging will stop for this conversation. This does not approve or reject participation.'
    );
    if (!confirmation) return;

    try {
      this.actionProcessing.set(true);
      const raw = await this.post<any>(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/close`, {});
      const updated = raw?.data ? this.mapConversation(raw.data) : {
        ...conversation,
        status: 'Discussion Closed' as NegotiationStatus,
        closedAt: new Date(),
        readOnly: true,
        archived: true
      };
      this.replaceConversation(updated);
      this.selectedConversation.set(updated);
    } catch (error) {
      this.messagesError.set(this.errorMessage(error, 'Could not close discussion.'));
    } finally {
      this.actionProcessing.set(false);
    }
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
    if (this.isReadOnly(conversation)) return 'This discussion is closed.';
    return 'Write a negotiation message...';
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
      founderReady: !!(row.founderReady ?? row.isFounderReady),
      investorReady: !!(row.investorReady ?? row.isInvestorReady),
      currentUserReady: !!(row.currentUserReady ?? row.isCurrentUserReady),
      archived: !!row.archived || status === 'Discussion Closed' || status === 'You withdrew' || status === 'Declined by Founder',
      readOnly: !!row.readOnly || status === 'Discussion Closed' || status === 'You withdrew' || status === 'Declined by Founder'
    };
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
    if (conversation.status === 'Participation Approved') return 'Approved';
    if (conversation.status === 'Participation Rejected') return 'Rejected';
    if (conversation.status === 'Participation Created') return 'Pending approval';
    if (conversation.participationStatus) return String(conversation.participationStatus);
    return 'Not yet created';
  }

  private buildNextStep(conversation: NegotiationConversation | null): string {
    if (!conversation) return 'No conversation selected.';
    if (this.isReadOnly(conversation)) return 'This conversation is read-only.';
    if (conversation.status === 'Founder Accepted') return 'Continue the discussion and negotiate the details.';
    if (conversation.status === 'Negotiation in Progress' && !this.isCurrentUserReady()) return 'Mark yourself ready when you are prepared to proceed.';
    if (conversation.status === 'Ready for Participation' && !this.bothReady()) return 'Wait for the other party to mark themselves ready.';
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

  private clearSelection(): void {
    this.selectedConversation.set(null);
    this.messages.set([]);
    this.messagesError.set(null);
  }
}
