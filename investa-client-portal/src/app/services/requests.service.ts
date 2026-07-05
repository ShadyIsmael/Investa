import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { OpportunityRequest, OpportunityRequestKind } from '../models/request.model';
import { NotificationService } from './notification.service';
import { Investment } from '../models/investment.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private apiBase = inject(API_BASE);

  private _incoming = signal<OpportunityRequest[]>([]);
  private _outgoing = signal<OpportunityRequest[]>([]);

  incoming = this._incoming.asReadonly();
  outgoing = this._outgoing.asReadonly();

  constructor() {
    this.loadRequests();
  }

  async refreshRequests(): Promise<void> {
    await this.loadRequests();
  }

  clearState(): void {
    this._incoming.set([]);
    this._outgoing.set([]);
  }

  async createOpportunityRequest(investment: Investment, ..._args: any[]): Promise<void> {
    const opportunityId = investment.opportunityId ?? investment.id;
    if (!opportunityId) {
      throw new Error('Opportunity is not available.');
    }

    await firstValueFrom(
      this.http.post(`${this.apiBase}/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/conversations`, {}, this.getHttpOptions())
    );
    await this.loadRequests();
  }

  async acceptRequest(request: OpportunityRequest): Promise<string | number | null | undefined> {
    let acceptedConversationId: string | number | null | undefined;
    if (request.requestType === OpportunityRequestKind.Conversation) {
      const raw = await this.postConversationRequestAction(request.id, 'accept');
      const data = raw?.data ?? raw;
      acceptedConversationId = data?.acceptedConversationId;
    } else {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/approve`, {}, this.getHttpOptions()));
    }

    await this.loadRequests();
    this.notifications.showToast({
      title: request.requestType === OpportunityRequestKind.Conversation ? 'Chat Accepted' : 'Participation Approved',
      message: `${request.projectName} request accepted.`,
      type: 'success'
    });
    return acceptedConversationId;
  }

  async declineRequest(request: OpportunityRequest): Promise<void> {
    if (request.requestType === OpportunityRequestKind.Conversation) {
      await this.postConversationRequestAction(request.id, 'reject');
    } else {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/reject`, { reason: 'Declined from Client Portal' }, this.getHttpOptions()));
    }

    await this.loadRequests();
    this.notifications.showToast({
      title: request.requestType === OpportunityRequestKind.Conversation ? 'Chat Declined' : 'Participation Rejected',
      message: `${request.projectName} request declined.`,
      type: 'warning'
    });
  }

  async withdrawRequest(request: OpportunityRequest): Promise<void> {
    if (request.requestType === OpportunityRequestKind.Conversation) {
      await this.postConversationRequestAction(request.id, 'withdraw');
    } else {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/cancel`, {}, this.getHttpOptions()));
    }

    await this.loadRequests();
    this.notifications.showToast({
      title: 'Request Withdrawn',
      message: `${request.projectName} request withdrawn.`,
      type: 'success'
    });
  }

  private async loadRequests(): Promise<void> {
    try {
      const [conversationRequestRaw, joinRaw] = await Promise.all([
        firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/conversation-requests`, this.getHttpOptions())),
        firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/opportunities/my-join-requests`, this.getHttpOptions()))
      ]);

      const conversationRequests = this.extractArray(conversationRequestRaw).map(row => this.mapConversationRequest(row));
      const joinRequests = this.extractArray(joinRaw).map(row => this.mapJoinRequest(row));
      const all = [...conversationRequests, ...joinRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this._incoming.set(all.filter(request => request.direction === 'incoming'));
      this._outgoing.set(all.filter(request => request.direction === 'outgoing'));
    } catch (error) {
      console.error('Failed to load opportunity requests:', error);
      this._incoming.set([]);
      this._outgoing.set([]);
    }
  }

  private mapConversationRequest(data: any): OpportunityRequest {
    const opportunity = data.opportunity || {};
    return {
      id: data.id ?? data.conversationRequestId ?? data.requestId,
      type: 'conversation',
      direction: this.normalizeDirection(data.direction),
      projectName: data.opportunityTitle || data.title || opportunity.title || 'Opportunity',
      projectImageUrl: '',
      counterpartName: data.counterpartyName || 'Participant',
      senderName: data.requesterName,
      receiverName: data.recipientName,
      businessName: data.businessName || opportunity.businessName,
      shortDescription: data.message || data.shortDescription || opportunity.shortDescription,
      status: this.normalizeConversationRequestStatus(data.status ?? data.requestStatus ?? data.statusText),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      opportunityId: this.toNumber(data.opportunityId ?? opportunity.id),
      investorId: data.requesterUserId,
      founderId: data.recipientUserId,
      requestType: OpportunityRequestKind.Conversation,
      acceptedConversationId: data.acceptedConversationId ?? null,
      canAccept: !!data.canAccept,
      canReject: !!data.canReject,
      canWithdraw: !!data.canWithdraw,
      requestMetadata: data
    };
  }

  private mapJoinRequest(data: any): OpportunityRequest {
    return {
      id: data.id,
      type: 'participation',
      direction: this.normalizeDirection(data.direction),
      projectName: data.opportunityTitle || 'Opportunity',
      projectImageUrl: '',
      counterpartName: data.counterpartyName || data.investorName || data.founderName || 'Participant',
      senderName: data.requesterName || data.investorName,
      receiverName: data.recipientName || data.founderName,
      status: this.normalizeStatus(data.status),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      requestedAmount: data.requestedAmount ?? data.calculatedTotalAmount,
      shares: data.numberOfShares ?? data.shares,
      opportunityId: this.toNumber(data.opportunityId),
      investorId: data.investorId,
      founderId: data.founderId,
      requestType: OpportunityRequestKind.Participation,
      requestMetadata: data
    };
  }

  private normalizeStatus(value: unknown): OpportunityRequest['status'] {
    const raw = String(value || 'Pending').toLowerCase();
    if (raw === '0') return 'Pending';
    if (raw.includes('accepted') || raw.includes('approved')) return 'Accepted';
    if (raw.includes('partner')) return 'Partner';
    if (raw.includes('reject')) return 'Rejected';
    if (raw.includes('declin')) return 'Declined';
    if (raw.includes('withdraw')) return 'Withdrawn';
    if (raw.includes('cancel')) return 'Cancelled';
    if (raw.includes('clos')) return 'Closed';
    if (raw.includes('negotiat') || raw.includes('progress')) return 'Negotiating';
    return 'Pending';
  }

  private normalizeConversationRequestStatus(value: unknown): OpportunityRequest['status'] {
    const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    switch (raw) {
      case '0':
      case 'pending':
        return 'Pending';
      case '1':
      case 'accepted':
        return 'Accepted';
      case '2':
      case 'rejected':
        return 'Rejected';
      case '3':
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return this.normalizeStatus(value);
    }
  }

  private async postConversationRequestAction(id: string | number, action: 'accept' | 'reject' | 'withdraw'): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/api/v1/conversation-requests/${encodeURIComponent(String(id))}/${action}`, {}, this.getHttpOptions())
    );
  }

  private extractArray(raw: any): any[] {
    const data = raw?.data ?? raw;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.conversations)) return data.conversations;
    if (Array.isArray(data?.requests)) return data.requests;
    return [];
  }

  private normalizeId(value: unknown): string | null {
    const text = String(value ?? '').trim();
    return text ? text.toLowerCase() : null;
  }

  private normalizeDirection(value: unknown): 'incoming' | 'outgoing' {
    const raw = String(value || '').toLowerCase();
    return raw.includes('incoming') ? 'incoming' : 'outgoing';
  }

  private toNumber(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
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
}
