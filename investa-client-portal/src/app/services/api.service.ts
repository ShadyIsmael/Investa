import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse, InvestmentDto, CreateInvestmentDto, BusinessCategory } from '../models/api-response.model';
import { AuthService } from './auth.service';

/**
 * API Service for backend communication
 * 
 * Handles all HTTP requests with proper:
 * - Authentication headers
 * - Error handling
 * - Type safety
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBase: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(API_BASE) apiBase: string
  ) {
    this.apiBase = apiBase;
  }

  /**
   * Get authorization headers with JWT token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  /**
   * Safely unwrap an ApiResponse, handling null/empty bodies.
   * Some endpoints return 204 No Content or a bare value without the wrapper.
   */
  private unwrap<T>(response: ApiResponse<T> | null | undefined, fallbackError: string): T {
    if (!response) {
      // 204 / empty body — treat as success with no data
      return null as unknown as T;
    }
    if (!response.success) {
      throw new Error(response.message || fallbackError);
    }
    return response.data;
  }

  /**
   * Get investments by category
   * @param categoryId Optional category filter. If null, returns all investments
   */
  async getInvestmentsByCategory(categoryId?: number): Promise<InvestmentDto[]> {
    const url = `${this.apiBase}/api/v1/investments/GetByCategory`;
    
    let params = new HttpParams();
    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('categoryId', categoryId.toString());
    }
    
    const response = await firstValueFrom(
      this.http.get<ApiResponse<InvestmentDto[]>>(url, {
        headers: this.getHeaders(),
        params
      })
    );
    return this.unwrap(response, 'Failed to fetch investments') ?? [];
  }

  /**
   * Get single investment by ID
   */
  async getInvestmentById(id: number): Promise<InvestmentDto> {
    const url = `${this.apiBase}/api/v1/investments/${id}`;
    
    const response = await firstValueFrom(
      this.http.get<ApiResponse<InvestmentDto>>(url, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch investment');
  }

  async toggleFavorite(investmentId: number, favorited: boolean): Promise<boolean> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/favorite`;
    const response = await firstValueFrom(
      this.http.post<ApiResponse<{ investmentId: number; favorited: boolean }>>(url, { favorited }, {
        headers: this.getHeaders()
      })
    );
    return (this.unwrap(response, 'Failed to update favorite state') ?? { favorited }).favorited;
  }

  /** Upload image for an investment (multipart/form-data) */
  async uploadInvestmentImage(investmentId: number, file: File, caption?: string): Promise<any> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/images`;
    const form = new FormData();
    form.append('file', file, file.name);
    if (caption) form.append('caption', caption);

    const response = await firstValueFrom(
      this.http.post<ApiResponse<any>>(url, form, {
        headers: this.getHeaders().delete('Content-Type') // Let browser set content-type for FormData
      })
    );
    return this.unwrap(response, 'Failed to upload image');
  }

  async deleteInvestmentImage(investmentId: number, imageId: number): Promise<void> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/images/${imageId}`;
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<any>>(url, { headers: this.getHeaders() })
    );
    this.unwrap(response, 'Failed to delete image');
  }

  async setPrimaryInvestmentImage(investmentId: number, imageId: number): Promise<void> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/images/${imageId}/set-primary`;
    const response = await firstValueFrom(
      this.http.put<ApiResponse<any>>(url, null, { headers: this.getHeaders() })
    );
    this.unwrap(response, 'Failed to set primary image');
  }

  async reorderInvestmentImages(investmentId: number, ordering: { imageId: number; sortOrder: number }[]): Promise<void> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/images/reorder`;
    const response = await firstValueFrom(
      this.http.put<ApiResponse<any>>(url, ordering, { headers: this.getHeaders() })
    );
    this.unwrap(response, 'Failed to reorder images');
  }

  /**
   * Create a new investment
   */
  async createInvestment(dto: CreateInvestmentDto): Promise<InvestmentDto> {
    const url = `${this.apiBase}/api/v1/investments`;
    
    const response = await firstValueFrom(
      this.http.post<ApiResponse<InvestmentDto>>(url, dto, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to create investment');
  }

  async updateInvestment(id: number, dto: CreateInvestmentDto): Promise<InvestmentDto> {
    const url = `${this.apiBase}/api/v1/investments/${id}`;
    const response = await firstValueFrom(
      this.http.put<ApiResponse<InvestmentDto>>(url, dto, { headers: this.getHeaders() })
    );
    return this.unwrap(response, 'Failed to update investment');
  }

  /**
   * Get all business categories from lookups
   * Note: Backend doesn't have a dedicated endpoint yet, 
   * so we'll extract unique categories from investments
   */
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const url = `${this.apiBase}/api/v1/lookups/business-categories`;

    const response = await firstValueFrom(
      this.http.get<ApiResponse<BusinessCategory[]>>(url, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch business categories') ?? [];
  }

  /**
   * Get business stages lookup
   */
  async getBusinessStages(): Promise<any[]> {
    const url = `${this.apiBase}/api/v1/lookups/business-stages`;
    
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(url, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch business stages') ?? [];
  }

  /**
   * Get project phases lookup
   */
  async getProjectPhases(): Promise<any[]> {
    const url = `${this.apiBase}/api/v1/lookups/project-phases`;
    
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(url, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch project phases') ?? [];
  }

  /**
   * Purchase shares in an investment opportunity
   */
  async purchaseShares(investmentId: number, sharesPurchased: number): Promise<void> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/purchase`;
    
    const response = await firstValueFrom(
      this.http.post<ApiResponse<any>>(url, { sharesPurchased }, {
        headers: this.getHeaders()
      })
    );
    this.unwrap(response, 'Failed to purchase shares');
  }

  /**
   * Get participants for an investment opportunity
   */
  async getInvestmentParticipants(investmentId: number): Promise<any[]> {
    const url = `${this.apiBase}/api/v1/investments/${investmentId}/participants`;
    
    const response = await firstValueFrom(
      this.http.get<ApiResponse<any[]>>(url, {
        headers: this.getHeaders()
      })
    );
    return this.unwrap(response, 'Failed to fetch participants') ?? [];
  }

  /**
   * Search users by exact phone number. Returns an array with a single user if found.
   * Backend currently supports exact phone lookup via /api/clients/by-phone/{phone}.
   */
  async searchUsersByPhone(phoneQuery: string): Promise<{ results: any[]; available: boolean }> {
    const url = `${this.apiBase}/api/clients/by-phone/${encodeURIComponent(phoneQuery)}`;
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(url, {
          headers: this.getHeaders()
        })
      );

      if (response && response.success) {
        if (Array.isArray(response.data)) {
          return { results: response.data, available: true };
        }
        if (response.data) {
          return { results: [response.data], available: true };
        }
      }

      return { results: [], available: true };
    } catch (err: any) {
      if (err && err.status === 404) {
        return { results: [], available: true };
      }

      console.warn('User search failed for', url, err?.message || err);
      return { results: [], available: false };
    }
  }
}
