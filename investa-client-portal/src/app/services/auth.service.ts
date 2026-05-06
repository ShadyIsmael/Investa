import { Injectable, signal, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { UserRoles } from '../config/constants';

export type UserRole = string; // All external users are 'Client' type

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

interface AuthResponseDto {
  token: string;
  expiresAt: string;
  phoneNumber: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = signal<boolean>(false);
  userRole = signal<UserRole | null>(null);

  constructor(private http: HttpClient, @Inject(API_BASE) private apiBase: string) {
    // Restore authentication state from localStorage if present
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole') as UserRole | null;
    if (token) {
      this.isAuthenticated.set(true);
    }
    if (role) {
      this.userRole.set(role);
    }
  }

  /**
   * Call backend login API and persist returned tokens
   */
  async login(phoneNumber: string, password: string, role?: UserRole): Promise<void> {
    const url = `${this.apiBase}/api/v1/auth/login`;
    const payload = { phoneNumber, password };

    const resp = await firstValueFrom(this.http.post<ApiResponse<AuthResponseDto>>(url, payload));

    if (!resp || !resp.success || !resp.data) {
      throw new Error(resp?.message || 'Login failed');
    }

    const data = resp.data;

    localStorage.setItem('accessToken', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('tokenExpiresAt', data.expiresAt);
    localStorage.setItem('phoneNumber', data.phoneNumber);

    if (role) {
      localStorage.setItem('userRole', role);
      this.userRole.set(role);
    }

    localStorage.setItem('isLoggedIn', 'true');
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('phoneNumber');
    this.isAuthenticated.set(false);
    this.userRole.set(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getTokenExpiry(): Date | null {
    const v = localStorage.getItem('tokenExpiresAt');
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  isTokenExpiringSoon(thresholdSeconds = 60): boolean {
    const exp = this.getTokenExpiry();
    if (!exp) return false;
    const now = new Date();
    return (exp.getTime() - now.getTime()) / 1000 < thresholdSeconds;
  }

  async refresh(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    const url = `${this.apiBase}/api/v1/auth/refresh`;
    const resp = await firstValueFrom(this.http.post<ApiResponse<AuthResponseDto>>(url, { refreshToken }));

    if (!resp || !resp.success || !resp.data) {
      this.logout();
      throw new Error(resp?.message || 'Refresh failed');
    }

    const data = resp.data;
    localStorage.setItem('accessToken', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('tokenExpiresAt', data.expiresAt);
    if (data.phoneNumber) localStorage.setItem('phoneNumber', data.phoneNumber);
    this.isAuthenticated.set(true);
  }
}

