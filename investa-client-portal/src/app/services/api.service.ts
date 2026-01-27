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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch investments');
    }
    
    return response.data;
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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch investment');
    }
    
    return response.data;
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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create investment');
    }
    
    return response.data;
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

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch business categories');
    }

    return response.data;
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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch business stages');
    }
    
    return response.data;
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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch project phases');
    }
    
    return response.data;
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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to purchase shares');
    }
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
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch participants');
    }
    
    return response.data;
  }
}
