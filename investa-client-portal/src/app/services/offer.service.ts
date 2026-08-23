import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { CreateOfferPayload, OfferStatus, OfferVersion } from '../models/offer.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE);

  getDirectOffers(opportunityId: string | number): Promise<OfferVersion[]> {
    return this.requestList(`/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/offers`);
  }

  getDirectInbox(direction: 'incoming' | 'outgoing'): Promise<OfferVersion[]> {
    return this.requestList(`/api/v1/offers/${direction}`);
  }

  submitDirectOffer(opportunityId: string | number, payload: CreateOfferPayload): Promise<OfferVersion> {
    return this.request<OfferVersion>('post', `/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/offers`, payload);
  }

  acceptDirectOffer(opportunityId: string | number, offerId: number): Promise<OfferVersion> {
    return this.request<OfferVersion>('post', `/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/offers/${offerId}/accept`, {});
  }

  rejectDirectOffer(opportunityId: string | number, offerId: number): Promise<OfferVersion> {
    return this.request<OfferVersion>('post', `/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/offers/${offerId}/reject`, {});
  }

  getConversationOffers(conversationId: string): Promise<OfferVersion[]> {
    return this.requestList(`/api/v1/conversations/${encodeURIComponent(conversationId)}/offers`);
  }

  submitConversationOffer(conversationId: string, payload: CreateOfferPayload, replacesOfferId?: number | null): Promise<OfferVersion> {
    const path = replacesOfferId
      ? `/api/v1/conversations/${encodeURIComponent(conversationId)}/offers/${replacesOfferId}/replace`
      : `/api/v1/conversations/${encodeURIComponent(conversationId)}/offers`;
    return this.request<OfferVersion>('post', path, payload);
  }

  acceptConversationOffer(conversationId: string, offerId: number): Promise<unknown> {
    return this.request('post', `/api/v1/conversations/${encodeURIComponent(conversationId)}/offers/${offerId}/accept`, {});
  }

  rejectConversationOffer(conversationId: string, offerId: number): Promise<OfferVersion> {
    return this.request<OfferVersion>('post', `/api/v1/conversations/${encodeURIComponent(conversationId)}/offers/${offerId}/reject`, {});
  }

  withdrawConversationOffer(conversationId: string, offerId: number): Promise<OfferVersion> {
    return this.request<OfferVersion>('post', `/api/v1/conversations/${encodeURIComponent(conversationId)}/offers/${offerId}/withdraw`, {});
  }

  private async request<T = unknown>(method: 'post', path: string, body: unknown): Promise<T> {
    const raw = await firstValueFrom(this.http.post<any>(`${this.apiBase}${path}`, body, {
      headers: { 'Content-Type': 'application/json' }
    }));
    return this.unwrap<T>(raw);
  }

  private async requestList(path: string): Promise<OfferVersion[]> {
    const raw = await firstValueFrom(this.http.get<any>(`${this.apiBase}${path}`, {
      headers: { 'Content-Type': 'application/json' }
    }));
    const data = this.unwrap<unknown>(raw);
    return Array.isArray(data) ? data.map(value => this.normalize(value)) : [];
  }

  private unwrap<T>(raw: any): T {
    const value = raw?.data ?? raw;
    if (raw?.success === false) throw new Error(raw.message || 'Offer request failed.');
    return value as T;
  }

  private normalize(value: any): OfferVersion {
    const row = value ?? {};
    return {
      ...row,
      opportunityId: row.opportunityId ?? row.opportunity?.id ?? null,
      opportunityTitle: row.opportunityTitle ?? row.opportunity?.title ?? null,
      status: this.enumValue(row.status),
      legs: Array.isArray(row.legs) ? row.legs : []
    };
  }

  private enumValue(value: unknown): OfferStatus {
    if (typeof value === 'number') return value as OfferStatus;
    const normalized = String(value ?? '').toLowerCase();
    if (normalized.includes('accepted')) return OfferStatus.Accepted;
    if (normalized.includes('rejected')) return OfferStatus.Rejected;
    if (normalized.includes('withdrawn')) return OfferStatus.Withdrawn;
    if (normalized.includes('replaced')) return OfferStatus.Replaced;
    return OfferStatus.Pending;
  }
}
