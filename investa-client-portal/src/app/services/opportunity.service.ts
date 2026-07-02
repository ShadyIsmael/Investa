import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export interface OpportunityLookup {
  id: number | string;
  name?: string | null;
  value?: string | null;
  label?: string | null;
  key?: string | null;
}

export interface OpportunityMedia {
  id?: number | string;
  fileId?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  fileExtension?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  previewUrl?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  purpose?: string | null;
  isPublic?: boolean | null;
  sortOrder?: number | null;
  caption?: string | null;
  mediaType?: string | number | null;
  isCover?: boolean | null;
  isPrimary?: boolean | null;
}

export interface OpportunityDocument {
  id?: number | string;
  fileId?: string | null;
  fileKey?: string | null;
  title?: string | null;
  name?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  fileExtension?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  category?: string | null;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  fileUrl?: string | null;
  purpose?: string | null;
  visibility?: 'Public' | 'Private' | string | null;
  searchTags?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
}

export interface OpportunityEvent {
  id?: number | string;
  title?: string | null;
  description?: string | null;
  eventDate?: string | null;
  date?: string | null;
  createdAt?: string | null;
  eventType?: string | null;
  type?: string | null;
  isPublic?: boolean | null;
}

export interface Opportunity {
  id: number | string;
  founderId?: string | null;
  legacyInvestmentId?: number | null;
  investmentId?: number | null;
  title?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  description?: string | null;
  categoryId?: number | string | null;
  categoryName?: string | null;
  investmentModel?: string | null;
  projectStage?: string | null;
  fundingGoalId?: number | string | null;
  fundingGoalName?: string | null;
  fundingPurpose?: string | null;
  fundingTarget?: number | null;
  minimumInvestment?: number | null;
  minimumInvestmentAmount?: number | null;
  maximumInvestment?: number | null;
  maximumInvestmentAmount?: number | null;
  expectedDuration?: string | number | null;
  expectedDurationMonths?: string | number | null;
  coverImageUrl?: string | null;
  founder?: {
    id?: string | null;
    userId?: string | null;
    displayName?: string | null;
    name?: string | null;
    fullName?: string | null;
    businessRole?: string | null;
    summary?: string | null;
    avatarUrl?: string | null;
  } | null;
  category?: OpportunityLookup | null;
  fundingGoal?: OpportunityLookup | null;
  publicInvestmentTermsSummary?: string | null;
  expectedReturnSummary?: string | null;
  fundingProgressPercent?: number | null;
  mediaCount?: number | null;
  documentCount?: number | null;
  hasCover?: boolean | null;
  hasMedia?: boolean | null;
  hasDocuments?: boolean | null;
  founderSummary?: string | null;
  status?: string | null;
  createdAt?: string | null;
  tags?: Array<string | OpportunityLookup>;
  latestPublicUpdate?: string | null;
  fundingUsage?: string | null;
  risks?: string | null;
  exitStrategy?: string | null;
}

export interface OpportunityFilters {
  search?: string;
  investmentModel?: string;
  categoryId?: string | number;
  fundingGoalId?: string | number;
  projectStage?: string;
  minFunding?: number | null;
  maxFunding?: number | null;
  minimumInvestment?: number | null;
  tagIds?: Array<string | number>;
}

export interface OpportunityUpsert {
  title: string;
  shortDescription: string;
  fullDescription?: string | null;
  categoryId?: string | number | null;
  projectStage?: string | null;
  tagIds?: Array<string | number>;
  investmentModel?: string | null;
  fundingGoalId?: string | number | null;
  fundingTarget?: number | null;
  minimumInvestment?: number | null;
  maximumInvestment?: number | null;
  expectedDuration?: string | number | null;
  coverImageUrl?: string | null;
  fundingUsage?: string | null;
  risks?: string | null;
  exitStrategy?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  constructor(private http: HttpClient, @Inject(API_BASE) private apiBase: string) {}

  getPublicOpportunities(filters: OpportunityFilters = {}): Promise<Opportunity[]> {
    return this.getList('/api/v1/public/opportunities', filters);
  }

  getPublicOpportunity(id: string | number): Promise<Opportunity> {
    return this.getOne(`/api/v1/public/opportunities/${encodeURIComponent(String(id))}`);
  }

  getMyOpportunities(): Promise<Opportunity[]> {
    return this.getList('/api/v1/opportunities/my');
  }

  getFounderOpportunity(id: string | number): Promise<Opportunity> {
    return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}`);
  }

  createOpportunity(payload: OpportunityUpsert): Promise<Opportunity> {
    return this.send<Opportunity>('post', '/api/v1/opportunities', payload);
  }

  updateOpportunity(id: string | number, payload: OpportunityUpsert): Promise<Opportunity> {
    return this.send<Opportunity>('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}`, payload);
  }

  submitForReview(id: string | number): Promise<void> {
    return this.send<void>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/submit-review`, {});
  }

  getMedia(id: string | number): Promise<OpportunityMedia[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/media`);
  }

  getDocuments(id: string | number): Promise<OpportunityDocument[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/documents`);
  }

  getEvents(id: string | number): Promise<OpportunityEvent[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/events`);
  }

  createMedia(id: string | number, payload: Partial<OpportunityMedia>): Promise<OpportunityMedia> {
    return this.send<OpportunityMedia>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/media`, payload);
  }

  createDocument(id: string | number, payload: Partial<OpportunityDocument>): Promise<OpportunityDocument> {
    return this.send<OpportunityDocument>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/documents`, payload);
  }

  createEvent(id: string | number, payload: Partial<OpportunityEvent>): Promise<OpportunityEvent> {
    return this.send<OpportunityEvent>('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/events`, payload);
  }

  getCategories(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/opportunity-categories');
  }

  getTags(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/opportunity-tags');
  }

  getFundingGoals(): Promise<OpportunityLookup[]> {
    return this.getList('/api/v1/lookups/funding-goals');
  }

  label(value: OpportunityLookup | string | number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return value.name || value.value || value.label || value.key || String(value.id);
  }

  private async getList<T = any>(path: string, filters: OpportunityFilters = {}): Promise<T[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<T[] | { items: T[] }> | T[] | { items: T[] }>(
        `${this.apiBase}${path}`,
        { headers: this.authHeaders(), params: this.toParams(filters) }
      )
    );
    const data = this.extractData<T[] | { items: T[] }>(raw, 'Failed to load data.');
    return Array.isArray(data) ? data : data?.items ?? [];
  }

  private async getOne<T = any>(path: string): Promise<T> {
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<T> | T>(`${this.apiBase}${path}`, { headers: this.authHeaders() })
    );
    return this.extractData<T>(raw, 'Failed to load data.');
  }

  private async send<T>(method: 'post' | 'put', path: string, payload: any): Promise<T> {
    const request = method === 'post' ? this.http.post : this.http.put;
    const raw = await firstValueFrom(
      request.call(this.http, `${this.apiBase}${path}`, payload, { headers: this.authHeaders() })
    );
    return this.extractData<T>(raw as ApiResponse<T> | T, 'Request failed.');
  }

  private extractData<T>(raw: ApiResponse<T> | T | null | undefined, fallbackMessage: string): T {
    if (!raw) throw new Error(fallbackMessage);
    const wrapped = raw as ApiResponse<T>;
    if (wrapped.data !== undefined) {
      if (wrapped.success === false) throw new Error(wrapped.message || fallbackMessage);
      return wrapped.data;
    }
    return raw as T;
  }

  private toParams(filters: OpportunityFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return;
      if (Array.isArray(value)) {
        value.forEach(item => params = params.append(key, String(item)));
      } else {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }) : new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}
