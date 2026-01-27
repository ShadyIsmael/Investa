import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { InvestmentRequest, CreditTransaction } from '../models/request.model';
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
   * Load all requests from API
   */
  private async loadRequests(): Promise<void> {
    try {
      // TODO: Implement API endpoints for requests
      // const incoming = await this.getIncomingRequests();
      // const outgoing = await this.getOutgoingRequests();
      // this._incoming.set(incoming);
      // this._outgoing.set(outgoing);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
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
   * @returns Promise that resolves when request is created
   */
  async createInvestmentRequest(
    investment: Investment,
    amount: number,
    shares: number
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
      // TODO: Replace with actual API endpoint
      // const response = await firstValueFrom(this.http.post(`${this.apiBase}/api/investment-requests`, {
      //   investmentId: investment.id,
      //   amount,
      //   shares: shares > 0 ? shares : undefined,
      //   type: 'investment'
      // }, this.getHttpOptions()));

      // For now, simulate the transaction locally
      // Deduct credits from user account
      this.userService.deductCredits(amount);

      // Create credit transaction record
      const transaction: CreditTransaction = {
        id: Date.now(),
        userId: parseInt(user.userId),
        amount: -amount,
        type: 'debit',
        reason: `Investment request for ${investment.name}`,
        investmentId: investment.id,
        createdAt: new Date()
      };

      this._creditTransactions.update(txs => [...txs, transaction]);

      // Create outgoing request for investor
      const outgoingRequest: InvestmentRequest = {
        id: Date.now() + 1,
        type: 'investment',
        direction: 'outgoing',
        projectName: investment.name,
        projectImageUrl: investment.imageUrl || '',
        counterpartName: investment.founderDisplay || 'Founder',
        status: 'Pending',
        createdAt: new Date(),
        investmentAmount: amount,
        shares: shares > 0 ? shares : undefined,
        investmentId: investment.id,
        investorId: parseInt(user.userId),
        founderId: investment.founderId ? parseInt(investment.founderId) : undefined
      };

      this._outgoing.update(list => [...list, outgoingRequest]);

      // Note: Backend API should create the incoming request for the founder
      // We don't create it client-side in production
    } catch (error) {
      console.error('Failed to create investment request:', error);
      throw error;
    }
  }

  /**
   * Accept an incoming investment request
   * Should call API to update request status and process investment
   */
  async acceptRequest(request: InvestmentRequest): Promise<void> {
    try {
      // TODO: Implement API call
      // await firstValueFrom(this.http.put(`${this.apiBase}/api/investment-requests/${request.id}/accept`, {}, this.getHttpOptions()));
      
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
   * Should call API and potentially refund credits to investor
   */
  async declineRequest(request: InvestmentRequest): Promise<void> {
    try {
      // TODO: Implement API call
      // await firstValueFrom(this.http.put(`${this.apiBase}/api/investment-requests/${request.id}/decline`, {}, this.getHttpOptions()));
      
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
