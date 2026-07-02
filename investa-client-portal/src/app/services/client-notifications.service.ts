import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export interface ClientNotification {
  id: number | string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface BackendNotification {
  id: number | string;
  title?: string | null;
  message?: string | null;
  body?: string | null;
  createdAt?: string | null;
  timestamp?: string | null;
  isRead?: boolean | null;
  read?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class ClientNotificationsService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string
  ) {}

  async getNotifications(): Promise<ClientNotification[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<BackendNotification[] | { items: BackendNotification[] }> | BackendNotification[] | { items: BackendNotification[] }>(
          `${this.apiBase}/api/v1/notifications/me`,
          { headers: this.authHeaders() }
        )
      );

      const data = this.extractData(raw, 'Failed to load notifications.');
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(item => this.mapNotification(item));
    } catch (error) {
      throw this.toNotificationError(error, 'Failed to load notifications.');
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiResponse<number | { count?: number; unreadCount?: number }> | number | { count?: number; unreadCount?: number }>(
          `${this.apiBase}/api/v1/notifications/me/unread-count`,
          { headers: this.authHeaders() }
        )
      );

      const data = this.extractData(raw, 'Failed to load unread notification count.');
      if (typeof data === 'number') return data;
      return data?.unreadCount ?? data?.count ?? 0;
    } catch (error) {
      throw this.toNotificationError(error, 'Failed to load unread notification count.');
    }
  }

  async markAsRead(id: number | string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiBase}/api/v1/notifications/me/${encodeURIComponent(String(id))}/read`,
          {},
          { headers: this.authHeaders() }
        )
      );
    } catch (error) {
      throw this.toNotificationError(error, 'Failed to mark notification as read.');
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiBase}/api/v1/notifications/me/read-all`,
          {},
          { headers: this.authHeaders() }
        )
      );
    } catch (error) {
      throw this.toNotificationError(error, 'Failed to mark notifications as read.');
    }
  }

  private mapNotification(notification: BackendNotification): ClientNotification {
    return {
      id: notification.id,
      title: notification.title || 'Notification',
      message: notification.message || notification.body || '',
      createdAt: notification.createdAt || notification.timestamp || '',
      isRead: notification.isRead ?? notification.read ?? false
    };
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

  private toNotificationError(error: any, fallbackMessage: string): Error {
    if (error?.status === 401) {
      return new Error('You must be signed in to view notifications.');
    }

    if (error?.status === 403) {
      return new Error('Your account is not allowed to view these notifications.');
    }

    const apiMessage = error?.error?.message || error?.message;
    return new Error(apiMessage || fallbackMessage);
  }
}
