import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { InvestmentRequest, CreditTransaction, InvestmentRequestType } from '../models/request.model';
import { NotificationService } from './notification.service';
import { UserService } from './user.service';
import { Investment } from '../models/investment.model';

/**
 * Requests Service
 * 
 * Manages investment requests and credit transactions
 * Handles:
 * - Creating investment requests
 * - Managing request lifecycle (accept/decline/withdraw)
 * - Credit transaction tracking
 * - API integration for request persistence
 */
@Injectable({ providedIn: 'root' })
export class RequestsService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private notifications = inject(NotificationService);
  private apiBase = inject(API_BASE);

  private _incoming = signal<InvestmentRequest[]>([]);
  private _outgoing = signal<InvestmentRequest[]>([]);
  
  incoming = this._incoming.asReadonly();
  outgoing = this._outgoing.asReadonly();

  private _creditTransactions = signal<CreditTransaction[]>([]);
  creditTransactions = this._creditTransactions.asReadonly();

  constructor() {
    // Load requests on service initialization
    this.loadRequests();
  }

  /**
   * Refresh requests from API
   */
  async refreshRequests(): Promise<void> {
    await this.loadRequests();
  }

  /**
   * Load all requests from API
   */
  private async loadRequests(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiBase}/api/investment-requests`, this.getHttpOptions()));
      
      const incoming: InvestmentRequest[] = (response?.incoming || []).map((r: any) => this.mapRequest(r, 'incoming'));
      const outgoing: InvestmentRequest[] = (response?.outgoing || []).map((r: any) => this.mapRequest(r, 'outgoing'));
      
      this._incoming.set(incoming);
      this._outgoing.set(outgoing);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  }

  /**
   * Map API response to InvestmentRequest model
   */
  private mapRequest(data: any, direction: 'incoming' | 'outgoing'): InvestmentRequest {
    return {
      id: data.id ?? Date.now(),
      type: data.type || 'investment',
      direction: direction,
      projectName: data.investmentTitle || data.investmentName || 'Investment',
      projectImageUrl: '',
      counterpartName: direction === 'incoming' 
        ? (data.investorDisplayName || data.senderName || 'Investor') 
        : (data.founderDisplayName || data.receiverName || 'Founder'),
      senderName: data.investorDisplayName || data.senderName,
      receiverName: data.founderDisplayName || data.receiverName,
      businessName: data.businessName || data.investmentName,
      shortDescription: data.investmentDescription || data.description,
      status: data.status || 'Pending',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      investmentAmount: data.amount || 0,
      shares: data.shares,
      investmentId: data.investmentId,
      investorId: data.investorId,
      founderId: data.founderId,
      requestType: data.requestType,
      requestMetadata: data.requestMetadata
    };
  }

  /**
   * Create an investment request and deduct credits
   * This should call the backend API to:
   * 1. Validate user credits
   * 2. Create credit transaction with audit trail (bilingual justification)
   * 3. Create investment request for founder approval
   * 4. Return updated user balance
   * 
   * @param investment The investment to request
   * @param amount The investment amount (in credits)
   * @param shares Number of shares (for equity investments, 0 for funding)
   * @param requestType Type of request (ContactFounder or InvestmentInterest)
   * @param requestMetadata JSON metadata for investment interest details
   * @returns Promise that resolves when request is created
   */
  async createInvestmentRequest(
    investment: Investment,
    amount: number,
    shares: number,
    requestType?: InvestmentRequestType,
    requestMetadata?: any
  ): Promise<void> {
    const user = this.userService.user();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate credits locally before API call
    if (user.credits < amount) {
      throw new Error('Insufficient credits. Please add more credits to your account.');
    }

    try {
      const payload: any = {
        investmentId: investment.id,
        amount,
        shares: shares > 0 ? shares : undefined
      };

      // Add requestType and requestMetadata if provided
      if (requestType) {
        payload.requestType = requestType;
      }
      if (requestMetadata) {
        payload.requestMetadata = requestMetadata;
      }

      console.log('Investment Request Payload', payload);
      const response = await firstValueFrom(this.http.post<any>(`${this.apiBase}/api/investment-requests`, payload, this.getHttpOptions()));

      // Refresh user credits from API to reflect server-side update
      await this.userService.refreshUser();

      // Use new response shape { request, updatedCreditBalance } with fallback
      const apiRequest = response?.request ?? response?.outgoingRequest;

      const outgoingRequest: InvestmentRequest = {
        id: apiRequest?.id ?? Date.now(),
        type: 'investment',
        direction: 'outgoing',
        projectName: investment.name,
        projectImageUrl: investment.imageUrl || '',
        counterpartName: investment.founderDisplay || 'Founder',
        status: apiRequest?.status ?? 'Pending',
        createdAt: apiRequest?.createdAt ? new Date(apiRequest.createdAt) : new Date(),
        investmentAmount: amount,
        shares: shares > 0 ? shares : undefined,
        investmentId: investment.id,
        investorId: parseInt(user.userId),
        founderId: investment.founderId ? parseInt(investment.founderId) : undefined,
        requestType: requestType,
        requestMetadata: requestMetadata
      };

      this._outgoing.update(list => [...list, outgoingRequest]);

      // Update local balance immediately if server returned it (fallbacks to refreshUser())
      if (response?.updatedCreditBalance != null) {
        if (typeof (this.userService as any)['setCredits'] === 'function') {
          (this.userService as any)['setCredits'](response.updatedCreditBalance);
        } else {
          await this.userService.refreshUser();
        }
      }
    } catch (error) {
      console.error('Failed to create investment request:', error);
      throw error;
    }
  }

  /**
   * Accept an incoming investment request
   * Calls API to update request status and process investment
   */
  async acceptRequest(request: InvestmentRequest): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/investment-requests/${request.id}/approve`, {}, this.getHttpOptions()));

      this._incoming.update(list => list.map(r => r.id === request.id ? { ...r, status: 'Accepted' } : r));
      this.notifications.showToast({
        title: 'Request Accepted',
        message: `${request.projectName} investment request accepted.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to accept request:', error);
      throw error;
    }
  }

  /**
   * Decline an incoming investment request
   * Calls API to update request status and refund credits to investor
   */
  async declineRequest(request: InvestmentRequest): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiBase}/api/investment-requests/${request.id}/reject`, {}, this.getHttpOptions()));

      this._incoming.update(list => list.map(r => r.id === request.id ? { ...r, status: 'Declined' } : r));
      this.notifications.showToast({
        title: 'Request Declined',
        message: `${request.projectName} investment request declined.`,
        type: 'warning'
      });
    } catch (error) {
      console.error('Failed to decline request:', error);
      throw error;
    }
  }

  /**
   * Withdraw an outgoing request
   * Should call API and refund credits to user
   */
  async withdrawRequest(request: InvestmentRequest): Promise<void> {
    try {
      // TODO: Implement API call with credit refund
      // await firstValueFrom(this.http.delete(`${this.apiBase}/api/investment-requests/${request.id}`, this.getHttpOptions()));
      
      this._outgoing.update(list => list.filter(r => r.id !== request.id));
      
      // Refund credits if applicable
      if (request.investmentAmount) {
        this.userService.addCredits(request.investmentAmount);
      }
      
      this.notifications.showToast({ 
        title: 'Request Withdrawn', 
        message: `${request.projectName} request withdrawn and credits refunded.`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Failed to withdraw request:', error);
      throw error;
    }
  }

  /**
   * Get HTTP options with authorization header
   */
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
