import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import {
  TrustProfileDto,
  TrustLevel,
  SubmitVerificationRequest,
  UserVerificationDto
} from '../models/trust.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class TrustService {
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE);

  // Reactive trust profile state
  private _profile = signal<TrustProfileDto | null>(null);

  readonly profile = this._profile.asReadonly();
  readonly trustLevel = computed(() => this._profile()?.trustLevel ?? TrustLevel.Visitor);
  readonly permissions = computed(() => this._profile()?.permissions ?? null);
  readonly isLoaded = computed(() => this._profile() !== null);

  private get headers() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Load the current user's trust profile and cache it.
   * Call this after login or after profile updates.
   */
  loadProfile(): Observable<ApiResponse<TrustProfileDto>> {
    return this.http
      .get<ApiResponse<TrustProfileDto>>(`${this.apiBase}/api/v1/trust/me`, { headers: this.headers })
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this._profile.set(res.data);
          }
        }),
        catchError(err => {
          console.error('[TrustService] Failed to load trust profile', err);
          return of({ success: false, data: null, message: 'Failed to load trust profile' } as any);
        })
      );
  }

  /** Trigger a trust recalculation after profile edits. */
  async recalculate(): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<TrustProfileDto>>(
        `${this.apiBase}/trust/me/recalculate`, {},
        { headers: this.headers }
      )
    );
    if (res.success && res.data) {
      this._profile.set(res.data);
    }
  }

  /** Submit a verification document. */
  submitVerification(request: SubmitVerificationRequest): Observable<ApiResponse<UserVerificationDto>> {
    return this.http.post<ApiResponse<UserVerificationDto>>(
      `${this.apiBase}/trust/me/verifications`,
      request,
      { headers: this.headers }
    );
  }

  /** Check if the user meets a minimum trust level. */
  meetsLevel(minLevel: TrustLevel): boolean {
    return (this._profile()?.trustLevel ?? TrustLevel.Visitor) >= minLevel;
  }

  /** Clear cached profile on logout. */
  clearProfile(): void {
    this._profile.set(null);
  }
}
