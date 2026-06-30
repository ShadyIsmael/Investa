import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export interface Wallet {
  id: string;
  userId: string;
  currentBalance: number;
  totalPurchasedCredits: number;
  totalBonusCredits: number;
  totalRefundCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  direction: string | number;
  reason: string | number;
  creditAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | number;
  referenceId?: string | null;
  description?: string | null;
  createdByUserId?: string | null;
  createdAt: string;
}

export interface WalletView {
  wallet: Wallet;
  balance: number;
  transactions: WalletTransaction[];
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string
  ) {}

  async loadCurrentUserWallet(): Promise<WalletView> {
    const [wallet, balance, transactions] = await Promise.all([
      this.getWallet(),
      this.getBalance(),
      this.getTransactions()
    ]);

    return { wallet, balance, transactions };
  }

  private async getWallet(): Promise<Wallet> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<Wallet> | Wallet>(
          `${this.apiBase}/api/v1/wallet/me`,
          { headers: this.authHeaders() }
        )
      );

      return this.extractData<Wallet>(raw, 'Failed to load wallet.');
    } catch (error) {
      throw this.toWalletError(error, 'Failed to load wallet.');
    }
  }

  private async getBalance(): Promise<number> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<number> | number>(
          `${this.apiBase}/api/v1/wallet/me/balance`,
          { headers: this.authHeaders() }
        )
      );

      return this.extractData<number>(raw, 'Failed to load wallet balance.') ?? 0;
    } catch (error) {
      throw this.toWalletError(error, 'Failed to load wallet balance.');
    }
  }

  private async getTransactions(): Promise<WalletTransaction[]> {
    const params = new HttpParams().set('skip', '0').set('take', '100');
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<WalletTransaction[]> | WalletTransaction[]>(
          `${this.apiBase}/api/v1/wallet/me/transactions`,
          { headers: this.authHeaders(), params }
        )
      );

      return this.extractData<WalletTransaction[]>(raw, 'Failed to load wallet transactions.') ?? [];
    } catch (error) {
      throw this.toWalletError(error, 'Failed to load wallet transactions.');
    }
  }

  private extractData<T>(raw: ApiResponse<T> | T | null | undefined, fallbackMessage: string): T {
    if (!raw) {
      throw new Error(fallbackMessage);
    }

    const wrapped = raw as ApiResponse<T>;
    if (wrapped.data !== undefined) {
      if (wrapped.success === false) {
        throw new Error(wrapped.message || fallbackMessage);
      }
      return wrapped.data;
    }

    return raw as T;
  }

  private authHeaders(): HttpHeaders {
    const token = this.getAccessTokenFromLocalStorage();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private getAccessTokenFromLocalStorage(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  private toWalletError(error: any, fallbackMessage: string): Error {
    if (error?.status === 401) {
      return new Error('You must be signed in to view your wallet.');
    }

    if (error?.status === 403) {
      return new Error('Your account is not allowed to view this wallet.');
    }

    const apiMessage = error?.error?.message || error?.message;
    return new Error(apiMessage || fallbackMessage);
  }
}
