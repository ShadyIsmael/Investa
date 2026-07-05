import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse, BusinessCategory } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(API_BASE) private apiBase: string
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  private unwrap<T>(response: ApiResponse<T> | null | undefined, fallbackError: string): T {
    if (!response) return null as unknown as T;
    if (!response.success) throw new Error(response.message || fallbackError);
    return response.data;
  }

  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<BusinessCategory[]>>(`${this.apiBase}/api/v1/lookups/business-categories`, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch business categories') ?? [];
  }

  async getOpportunityCategories(): Promise<BusinessCategory[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<BusinessCategory[]>>(`${this.apiBase}/api/v1/lookups/opportunity-categories`, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch opportunity categories') ?? [];
  }

  async getOpportunityTags(): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(`${this.apiBase}/api/v1/lookups/opportunity-tags`, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch opportunity tags') ?? [];
  }

  async getFundingGoals(): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(`${this.apiBase}/api/v1/lookups/funding-goals`, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch funding goals') ?? [];
  }

  async getBusinessStages(): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(`${this.apiBase}/api/v1/lookups/business-stages`, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch business stages') ?? [];
  }

  async getProjectPhases(): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(`${this.apiBase}/api/v1/lookups/project-phases`, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch project phases') ?? [];
  }

  async searchUsersByPhone(phoneQuery: string): Promise<{ results: any[]; available: boolean }> {
    const url = `${this.apiBase}/api/clients/by-phone/${encodeURIComponent(phoneQuery)}`;
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(url, { headers: this.getHeaders() })
      );

      if (response?.success) {
        if (Array.isArray(response.data)) return { results: response.data, available: true };
        if (response.data) return { results: [response.data], available: true };
      }

      return { results: [], available: true };
    } catch (err: any) {
      if (err?.status === 404) return { results: [], available: true };
      console.warn('User search failed for', url, err?.message || err);
      return { results: [], available: false };
    }
  }
}
