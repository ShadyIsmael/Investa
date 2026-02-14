import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';

export interface BasicInfo {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  linkedInUrl?: string | null;
  facebookUrl?: string | null;
  gender?: string | null;
  nationality?: string | null;
  country?: string | null;
  companyName?: string | null;
  isKycVerified?: boolean;
  kycCompletionPercentage?: number;
}

export interface ContactInfo {
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  workAddress?: string | null;
  address?: string | null;
  linkedInUrl?: string | null;
  facebookUrl?: string | null;
  companyAddress?: string | null;
  companyEmail?: string | null;
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
  hrLetterFileName?: string | null;
  hrLetterBase64?: string | null;
  deviceMacAddress?: string | null;
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
      console.debug('loadMyProfile response walletBalance:', resp?.coreMetrics?.walletBalance);
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
            birthDate: profile.basicInfo?.birthDate ?? null,
            dateOfBirth: profile.basicInfo?.dateOfBirth ?? profile.basicInfo?.birthDate ?? null,
          lastName: profile.basicInfo?.lastName ?? null,
          bio: profile.basicInfo?.bio ?? null,
          avatarUrl: profile.basicInfo?.avatarUrl ?? null,
          companyName: profile.basicInfo?.companyName ?? null,
          linkedInUrl: profile.basicInfo?.linkedInUrl ?? null,
          facebookUrl: profile.basicInfo?.facebookUrl ?? null
        },
        contactInfo: {
          email: profile.contactInfo?.email ?? null,
          phone1: profile.contactInfo?.phone1 ?? null,
          phone2: profile.contactInfo?.phone2 ?? null,
          workAddress: profile.contactInfo?.workAddress ?? null,
          address: profile.contactInfo?.address ?? null,
          companyAddress: profile.contactInfo?.companyAddress ?? null,
          companyEmail: profile.contactInfo?.companyEmail ?? null,
          linkedInUrl: profile.contactInfo?.linkedInUrl ?? null,
          facebookUrl: profile.contactInfo?.facebookUrl ?? null
        },
        identityCompliance: {
          documentNumber: profile.identityCompliance?.documentNumber ?? null,
          documentExpiryDate: profile.identityCompliance?.documentExpiryDate ?? null,
          verificationStatus: profile.identityCompliance?.verificationStatus ?? null,
          documentFrontImageUrl: profile.identityCompliance?.documentFrontImageUrl ?? null,
          documentBackImageUrl: profile.identityCompliance?.documentBackImageUrl ?? null,
          hrLetterFileName: profile.identityCompliance?.hrLetterFileName ?? null,
          hrLetterBase64: profile.identityCompliance?.hrLetterBase64 ?? null,
          deviceMacAddress: profile.identityCompliance?.deviceMacAddress ?? null
        }
      };

      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      console.debug('updateMyProfile payload:', payload);
      const resp = await firstValueFrom(this.http.put<UserProfile>(url, payload, options));
      console.debug('updateMyProfile response:', resp);
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
