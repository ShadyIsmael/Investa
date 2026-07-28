import { Injectable, signal, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { UserRoles } from '../config/constants';
import { NotificationService } from './notification.service';
import { FirebaseClientService } from './firebase-client.service';
import { NotificationRefreshCoordinator } from './notification-refresh-coordinator.service';
import { FcmService } from './fcm.service';

export type UserRole = string;

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
  private initialized = false;
  private notificationUserId: string | null = null;
  private notificationConnectionVersion = 0;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string,
    private notificationService: NotificationService,
    private firebaseClient: FirebaseClientService,
    private coordinator: NotificationRefreshCoordinator,
    private fcmService: FcmService,
  ) {
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const token = this.getAccessToken();
    const expiry = this.getTokenExpiry();

    if (!token) {
      this.isAuthenticated.set(false);
      this.userRole.set(null);
      this.initialized = true;
      return;
    }

    if (expiry && expiry < new Date()) {
      this.logout();
      this.initialized = true;
      return;
    }

    const role = localStorage.getItem('userRole') as UserRole | null;
    this.isAuthenticated.set(true);
    if (role) {
      this.userRole.set(role);
    }
    this.initialized = true;
  }

  async login(phoneNumber: string, password: string, role?: UserRole): Promise<void> {
    const url = `${this.apiBase}/api/v1/auth/login`;
    const payload = { phoneNumber, password };

    const resp = await firstValueFrom(this.http.post<ApiResponse<AuthResponseDto>>(url, payload));

    if (!resp || !resp.success || !resp.data) {
      throw new Error('Login failed');
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

  startNotificationLoading(): void {
    if (this.isAuthenticated() && this.getAccessToken()) {
      this.coordinator.start();
    }
  }

  async startNotificationSession(userId: string, reconnect = false): Promise<void> {
    if (!this.isAuthenticated() || !this.getAccessToken() || !userId) return;

    this.startNotificationLoading();
    if (!reconnect && this.notificationUserId === userId) return;

    this.notificationUserId = userId;
    const connectionVersion = ++this.notificationConnectionVersion;
    try {
      this.firebaseClient.initialize();
      await this.firebaseClient.connectForUser(userId);
    } catch {
      // API polling remains active when realtime is unavailable.
    }

    if (connectionVersion !== this.notificationConnectionVersion) {
      this.firebaseClient.disconnect();
    }
  }

  logout(): void {
    this.notificationUserId = null;
    this.notificationConnectionVersion++;
    this.coordinator.stop();
    this.notificationService.clear();
    this.fcmService.disable();
    this.firebaseClient.disconnect();

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('activeClientContext');
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

  getAuthorizationHeaderValue(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const normalized = token.replace(/^Bearer\s+/i, '').trim();
    return normalized ? `Bearer ${normalized}` : null;
  }

  getAuthorizedJsonOptions(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const authorization = this.getAuthorizationHeaderValue();
    if (authorization) {
      headers = headers.set('Authorization', authorization);
    }
    return { headers };
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

  async signupInit(phoneNumber: string, password: string, firstName: string, lastName: string): Promise<{ verificationSessionId: string }> {
    const url = `${this.apiBase}/api/v1/auth/signup-init`;
    const payload = { phoneNumber, password, firstName, lastName };
    const resp = await firstValueFrom(this.http.post<{ success: boolean; data: { verificationSessionId: string }; message?: string }>(url, payload));
    if (!resp || !resp.success || !resp.data) {
      throw new Error('Signup initiation failed');
    }
    return resp.data;
  }

  async signupVerify(verificationSessionId: string, otpCode: string): Promise<void> {
    const url = `${this.apiBase}/api/v1/auth/signup-verify`;
    const payload = { verificationSessionId, otpCode };
    const resp = await firstValueFrom(this.http.post<{ success: boolean; message?: string }>(url, payload));
    if (!resp || !resp.success) {
      throw new Error('OTP verification failed');
    }
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
      throw new Error('Refresh failed');
    }

    const data = resp.data;
    localStorage.setItem('accessToken', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('tokenExpiresAt', data.expiresAt);
    if (data.phoneNumber) localStorage.setItem('phoneNumber', data.phoneNumber);
    this.isAuthenticated.set(true);
    if (this.notificationUserId) {
      await this.startNotificationSession(this.notificationUserId, true);
    }
  }
}
