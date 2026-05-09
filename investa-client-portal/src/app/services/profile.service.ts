import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse, ApiErrorResponse } from '../models/api-response.model';

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
  city?: string | null;
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
      console.debug('[ProfileService] loadMyProfile: GET', url);
      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const raw = await firstValueFrom(this.http.get<any>(url, options));
      const resp = this.extractData<UserProfile>(raw);
      console.debug('[ProfileService] loadMyProfile: response', resp || raw);
      if (resp) {
        // Compute KYC completion percentage client-side if backend doesn't provide it
        try {
          const pct = this.computeKycCompletion(resp);
          if (!resp.basicInfo) resp.basicInfo = {} as BasicInfo;
          resp.basicInfo.kycCompletionPercentage = pct;
        } catch (e) {
          // ignore compute errors
        }
        this._profile.set(resp);
        return resp;
      }
      this._profile.set(null);
      return null;
    } catch (err: any) {
      this._profile.set(null);
      throw err;
    }
  }

  async startKyc(): Promise<UserProfile | null> {
    try {
      const url = `${this.apiBase}/api/profile/me/kyc/start`;
      console.debug('[ProfileService] startKyc: POST', url);
      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const raw = await firstValueFrom(this.http.post<any>(url, {}, options));
      const resp = this.extractData<UserProfile>(raw);
      console.debug('[ProfileService] startKyc: response', resp || raw);
      if (resp) {
        try {
          const pct = this.computeKycCompletion(resp);
          if (!resp.basicInfo) resp.basicInfo = {} as BasicInfo;
          resp.basicInfo.kycCompletionPercentage = pct;
        } catch {}
        this._profile.set(resp);
        return resp;
      }
      return null;
    } catch (err: any) {
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
          gender: profile.basicInfo?.gender ?? null,
          nationality: profile.basicInfo?.nationality ?? null,
          country: profile.basicInfo?.country ?? null,
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
          city: profile.contactInfo?.city ?? null,
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

      console.debug('[ProfileService] updateMyProfile: PUT', url, 'payload:', payload);
      const cleanedPayload = this.removeNulls(payload);
      console.debug('[ProfileService] updateMyProfile: cleanedPayload:', cleanedPayload);

      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const raw = await firstValueFrom(this.http.put<any>(url, cleanedPayload, options));
      if (raw && (raw as any).success === false) {
        console.error('[ProfileService] updateMyProfile: API returned success=false', raw);
        throw new Error((raw as any).message || 'API returned an error');
      }
      const resp = this.extractData<UserProfile>(raw);
      console.debug('[ProfileService] updateMyProfile: response', resp || raw);
      if (resp) {
        try {
          const pct = this.computeKycCompletion(resp);
          if (!resp.basicInfo) resp.basicInfo = {} as BasicInfo;
          resp.basicInfo.kycCompletionPercentage = pct;
        } catch {}
        this._profile.set(resp);
        return resp;
      }
      return null;
    } catch (err: any) {
      // Log detailed error info for debugging and include structured API error if present
      try {
        const apiErr = (err as any)?.error as ApiErrorResponse | undefined;
        console.error('Failed to update profile', {
          message: err?.message,
          status: (err as any)?.status,
          apiMessage: apiErr?.message,
          apiCode: apiErr?.code,
          apiErrors: apiErr?.errors,
          rawError: err
        });
      } catch (logErr) {
        console.error('Failed to update profile (logging failed)', logErr);
      }
      throw err;
    }
  }

  async getCreditHistory(): Promise<CreditTransaction[]> {
    try {
      const url = `${this.apiBase}/api/profile/me/credits`;
      console.debug('[ProfileService] getCreditHistory: GET', url);
      const token = this.getAccessTokenFromLocalStorage();
      const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
      const raw = await firstValueFrom(this.http.get<any>(url, options));
      const resp = this.extractData<CreditTransaction[]>(raw);
      console.debug('[ProfileService] getCreditHistory: response', resp || raw);
      return resp || [];
    } catch (err: any) {
      console.error('Failed to fetch credit history', err);
      throw err;
    }
  }

  private extractData<T>(raw: any): T | null {
    if (!raw) return null;
    // If backend returns ApiResponse<T> wrapper, extract .data
    if ((raw as ApiResponse<T>).data !== undefined) {
      return (raw as ApiResponse<T>).data;
    }
    // Otherwise assume raw is the payload
    return raw as T;
  }

  private removeNulls(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(v => this.removeNulls(v)).filter(v => v !== undefined && v !== null);
    if (typeof obj !== 'object') return obj;
    const out: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val === null || val === undefined) return;
      const cleaned = this.removeNulls(val);
      if (cleaned === null || cleaned === undefined) return;
      out[key] = cleaned;
    });
    return out;
  }

  /**
   * Compute a simple KYC completion percentage based on presence of key profile fields.
   * This is a client-side heuristic used when backend doesn't provide an explicit percentage.
   */
  private computeKycCompletion(profile: UserProfile): number {
    if (!profile) return 0;

    // New KYC rules (client-side heuristic): count these five fields equally:
    // - name (first and/or last or fullName)
    // - mobile (contactInfo.phone1)
    // - email (contactInfo.email)
    // - national ID (identityCompliance.documentNumber)
    // - ID images (documentFrontImageUrl or documentBackImageUrl)

    const checks: Array<() => boolean> = [
      // Name: either fullName or both/one of first/last
      () => !!(profile.basicInfo?.fullName || profile.basicInfo?.firstName || profile.basicInfo?.lastName),
      // Mobile
      () => !!(profile.contactInfo?.phone1 || profile.contactInfo?.phone2),
      // Email
      () => !!profile.contactInfo?.email,
      // National ID number
      () => !!profile.identityCompliance?.documentNumber,
      // ID images uploaded (front or back)
      () => !!(profile.identityCompliance?.documentFrontImageUrl || profile.identityCompliance?.documentBackImageUrl)
    ];

    const total = checks.length;
    let filled = 0;
    for (const fn of checks) {
      try { if (fn()) filled++; } catch {}
    }

    const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
    return Math.min(100, Math.max(0, pct));
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
