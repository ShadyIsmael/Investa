import { Inject, Injectable, signal } from '@angular/core';
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

export type PaidActionCode =
  | 'SendConversationRequest'
  | 'SendFirstOffer'
  | 'SendCounterOffer'
  | 'SubmitParticipationRequest'
  | 'PublishOpportunity';

export interface PaidActionQuote {
  actionCode: PaidActionCode | string;
  displayName: string;
  creditCost: number;
  currentBalance: number;
  balanceAfter: number;
  hasSufficientCredit: boolean;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly _balance = signal(0);
  readonly balance = this._balance.asReadonly();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string
  ) {}

  async loadCurrentUserWallet(): Promise<WalletView> {
    const [wallet, balance, transactions] = await Promise.all([
      this.getWallet(),
      this.loadBalance(),
      this.getTransactions()
    ]);

    return { wallet, balance, transactions };
  }

  async getPaidActionQuote(actionCode: PaidActionCode): Promise<PaidActionQuote> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<PaidActionQuote> | PaidActionQuote>(
          `${this.apiBase}/api/v1/wallet/me/paid-actions/${encodeURIComponent(actionCode)}/quote`,
          { headers: this.authHeaders() }
        )
      );

      return this.extractData<PaidActionQuote>(raw, 'Failed to load paid action pricing.');
    } catch (error) {
      throw this.toWalletError(error, 'Failed to load paid action pricing.');
    }
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

  async loadBalance(): Promise<number> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<number> | number>(
          `${this.apiBase}/api/v1/wallet/me/balance`,
          { headers: this.authHeaders() }
        )
      );

      const balance = this.extractData<number>(raw, 'Failed to load wallet balance.') ?? 0;
      this._balance.set(balance);
      return balance;
    } catch (error) {
      throw this.toWalletError(error, 'Failed to load wallet balance.');
    }
  }

  setBalance(balance: number): void {
    this._balance.set(Number.isFinite(balance) ? balance : 0);
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

  private toWalletError(error: unknown, fallbackMessage: string): Error {
    const record = typeof error === 'object' && error !== null ? error as Record<string, unknown> : null;
    const status = typeof record?.['status'] === 'number' ? record['status'] : null;
    if (status === 401) {
      return new Error('You must be signed in to view your wallet.');
    }

    if (status === 403) {
      return new Error('Your account is not allowed to view this wallet.');
    }

    const nested = typeof record?.['error'] === 'object' && record['error'] !== null
      ? record['error'] as Record<string, unknown>
      : null;
    const apiMessage = typeof nested?.['message'] === 'string'
      ? nested['message']
      : typeof record?.['message'] === 'string' ? record['message'] : '';
    return new Error(apiMessage || fallbackMessage);
  }
}

const WALLET_REASON_KEYS: Record<string, string> = {
  '1': 'purchase', '2': 'bonus', '3': 'refund', '4': 'adminadjustmentcredit',
  '10': 'investment', '11': 'publishopportunity', '12': 'featuredopportunity',
  '13': 'subscription', '14': 'adminadjustmentdebit', '15': 'platformservicefee'
};

const WALLET_REFERENCE_KEYS: Record<string, string> = {
  '0': 'none', '1': 'investment', '2': 'opportunity', '3': 'subscription',
  '4': 'wallet', '5': 'admin', '6': 'system', '7': 'conversationrequest',
  '8': 'conversation', '9': 'opportunityjoinrequest'
};

function normalizeWalletEnum(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/[\s_-]+/gu, '');
}

export function walletDirectionKey(value: string | number): string {
  const normalized = normalizeWalletEnum(value);
  return normalized === '1' ? 'credit' : normalized === '2' ? 'debit' : normalized;
}

export function walletReasonKey(value: string | number): string {
  const normalized = normalizeWalletEnum(value);
  return WALLET_REASON_KEYS[normalized] ?? normalized;
}

export function walletReferenceTypeKey(value: string | number): string {
  const normalized = normalizeWalletEnum(value);
  return WALLET_REFERENCE_KEYS[normalized] ?? normalized;
}
