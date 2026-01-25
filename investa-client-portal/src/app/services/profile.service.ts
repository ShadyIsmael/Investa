import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';

export interface BasicInfo {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  linkedInUrl?: string | null;
  facebookUrl?: string | null;
}

export interface ContactInfo {
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  workAddress?: string | null;
  address?: string | null;
  linkedInUrl?: string | null;
  facebookUrl?: string | null;
}

export interface CoreMetrics {
  email?: string | null;
  role?: string | null;
  clientType?: string | null;
  credibilityScore?: number | null;
  walletBalance?: number | null;
  currentCredibilityScore?: number | null;
}

export interface IdentityCompliance {
  documentNumber?: string | null;
  documentExpiryDate?: string | null;
  verificationStatus?: string | null; // None | Pending | Verified
  documentFrontImageUrl?: string | null;
  documentBackImageUrl?: string | null;
}

export interface CreditTransaction {
  id: number;
  userId: string;
  amount: number;
  justificationAr: string;
  justificationEn: string;
  createdAt: string;
  adminId?: string | null;
  adminName?: string | null;
}

export interface UserProfile {
  userId: string;
  coreMetrics?: CoreMetrics | null;
  basicInfo?: BasicInfo | null;
  contactInfo?: ContactInfo | null;
  identityCompliance?: IdentityCompliance | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private _profile = signal<UserProfile | null>(null);
  public profile = this._profile.asReadonly();

  constructor(private http: HttpClient, @Inject(API_BASE) private apiBase: string) {}

  async loadMyProfile(): Promise<UserProfile | null> {
    try {
      const url = `${this.apiBase}/api/profile/me`;
      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const resp = await firstValueFrom(this.http.get<UserProfile>(url, options));
      if (resp) {
        this._profile.set(resp);
        return resp;
      }
      this._profile.set(null);
      return null;
    } catch (err) {
      this._profile.set(null);
      throw err;
    }
  }

  async startKyc(): Promise<UserProfile | null> {
    try {
      const url = `${this.apiBase}/api/profile/me/kyc/start`;
      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const resp = await firstValueFrom(this.http.post<UserProfile>(url, {}, options));
      if (resp) {
        this._profile.set(resp);
        return resp;
      }
      return null;
    } catch (err) {
      throw err;
    }
  }

  async updateMyProfile(profile: UserProfile): Promise<UserProfile | null> {
    try {
      const url = `${this.apiBase}/api/profile/me`;
      const payload = {
        basicInfo: {
          fullName: profile.basicInfo?.fullName ?? null,
          firstName: profile.basicInfo?.firstName ?? null,
          lastName: profile.basicInfo?.lastName ?? null,
          bio: profile.basicInfo?.bio ?? null,
          avatarUrl: profile.basicInfo?.avatarUrl ?? null,
          linkedInUrl: profile.basicInfo?.linkedInUrl ?? null,
          facebookUrl: profile.basicInfo?.facebookUrl ?? null
        },
        contactInfo: {
          email: profile.contactInfo?.email ?? null,
          phone1: profile.contactInfo?.phone1 ?? null,
          phone2: profile.contactInfo?.phone2 ?? null,
          workAddress: profile.contactInfo?.workAddress ?? null,
          address: profile.contactInfo?.address ?? null,
          linkedInUrl: profile.contactInfo?.linkedInUrl ?? null,
          facebookUrl: profile.contactInfo?.facebookUrl ?? null
        }
      };

      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const resp = await firstValueFrom(this.http.put<UserProfile>(url, payload, options));
      if (resp) {
        this._profile.set(resp);
        return resp;
      }
      return null;
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  }

  async getCreditHistory(): Promise<CreditTransaction[]> {
    try {
      const url = `${this.apiBase}/api/profile/me/credits`;
      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const resp = await firstValueFrom(this.http.get<CreditTransaction[]>(url, options));
      return resp || [];
    } catch (err) {
      console.error('Failed to fetch credit history', err);
      throw err;
    }
  }

  private getAccessTokenFromLocalStorage(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  clear(): void {
    this._profile.set(null);
  }
}
