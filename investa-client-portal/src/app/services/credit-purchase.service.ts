import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export type CreditPurchaseStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled' | 'Expired' | 'Refunded';

export interface CreditPackage {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  credits: number;
  price: number;
  currency: string;
  bonusCredits: number;
  activeFrom?: string | null;
  activeUntil?: string | null;
  isActive: boolean;
  displayOrder: number;
  isFeatured: boolean;
}

export interface CreditPurchaseOrder {
  id: string;
  referenceNumber: string;
  planId: string;
  planCode: string;
  planName: string;
  planNameAr: string;
  credits: number;
  bonusCredits: number;
  pricePaid: number;
  currency: string;
  paymentStatus: CreditPurchaseStatus;
  paymentProvider?: string | null;
  providerReference?: string | null;
  redirectUrl?: string | null;
  providerConfigured?: boolean;
  walletTransactionId?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CreditPurchaseService {
  constructor(private http: HttpClient, @Inject(API_BASE) private apiBase: string) {}

  async getActivePackages(): Promise<CreditPackage[]> {
    const raw = await firstValueFrom(this.http.get<ApiResponse<CreditPackage[]> | CreditPackage[]>(
      `${this.apiBase}/api/credit-plans`
    ));
    return (this.unwrap(raw) ?? []).filter(item => item.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createOrder(packageId: string): Promise<CreditPurchaseOrder> {
    const raw = await firstValueFrom(this.http.post<ApiResponse<CreditPurchaseOrder> | CreditPurchaseOrder>(
      `${this.apiBase}/api/credit-plans/${encodeURIComponent(packageId)}/orders`, {}
    ));
    return this.unwrap(raw);
  }

  async getMyOrders(): Promise<CreditPurchaseOrder[]> {
    const raw = await firstValueFrom(this.http.get<ApiResponse<CreditPurchaseOrder[]> | CreditPurchaseOrder[]>(
      `${this.apiBase}/api/credit-plans/orders`
    ));
    return this.unwrap(raw) ?? [];
  }

  async getOrder(orderId: string): Promise<CreditPurchaseOrder> {
    const raw = await firstValueFrom(this.http.get<ApiResponse<CreditPurchaseOrder> | CreditPurchaseOrder>(
      `${this.apiBase}/api/credit-plans/orders/${encodeURIComponent(orderId)}`
    ));
    return this.unwrap(raw);
  }

  private unwrap<T>(raw: ApiResponse<T> | T): T {
    const wrapped = raw as ApiResponse<T>;
    if (wrapped?.data !== undefined) {
      if (wrapped.success === false) throw new Error(wrapped.message || 'Request failed.');
      return wrapped.data;
    }
    return raw as T;
  }
}
