import { Injectable, signal, computed, Inject, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TOAST_DURATION_MS } from '../config/constants';
import { API_BASE } from '../config/api.token';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: NotificationType;
  actionUrl?: string | null;
}

export interface Toast extends Omit<Notification, 'timestamp' | 'read'> {}

/** Shape returned by GET /api/v1/user-notifications */
interface BackendNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  icon?: string | null;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
  readAt?: string | null;
}

interface BackendPage {
  items: BackendNotification[];
  totalCount: number;
  unreadCount: number;
}

/**
 * Service for managing in-app notifications and toast messages.
 * Notifications are fetched from the backend (GET /api/v1/user-notifications)
 * and polled every 30 seconds to stay up to date.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextToastId = 1;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private readonly POLL_INTERVAL_MS = 30_000;

  /** All notifications loaded from backend */
  notifications = signal<Notification[]>([]);

  /** Total count from last backend response (may exceed the loaded slice) */
  totalCount = signal<number>(0);

  /** Active toast messages */
  toasts = signal<Toast[]>([]);

  /** Count of unread notifications */
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string,
    private zone: NgZone,
  ) {}

  // ── Backend fetch ─────────────────────────────────────────────────────────

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /** Load (or reload) notifications from the backend. pageSize=10 for navbar. */
  async loadNotifications(pageSize = 10, page = 1): Promise<void> {
    try {
      const url = `${this.apiBase}/api/v1/user-notifications?page=${page}&pageSize=${pageSize}`;
      const resp = await firstValueFrom(
        this.http.get<BackendPage>(url, { headers: this.getHeaders() })
      );
      const mapped = resp.items.map(n => this.mapBackend(n));
      this.zone.run(() => {
        if (page === 1) {
          this.notifications.set(mapped);
        } else {
          this.notifications.update(existing => [...existing, ...mapped]);
        }
        this.totalCount.set(resp.totalCount);
      });
    } catch {
      // Silently ignore – backend may not be running or user not authed
    }
  }

  /** Start background polling (call once after login) */
  startPolling(): void {
    this.stopPolling();
    this.loadNotifications();
    this.pollTimer = setInterval(() => this.loadNotifications(), this.POLL_INTERVAL_MS);
  }

  /** Stop background polling (call on logout) */
  stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private mapBackend(n: BackendNotification): Notification {
    return {
      id: n.id,
      title: n.title,
      message: n.body,
      timestamp: new Date(n.createdAt),
      read: n.isRead,
      type: (n.type as NotificationType) || 'info',
      actionUrl: n.actionUrl,
    };
  }

  // ── Toasts ────────────────────────────────────────────────────────────────

  showToast(toastData: Omit<Toast, 'id'>) {
    const newToast: Toast = { ...toastData, id: this.nextToastId++ };
    this.toasts.update(current => [newToast, ...current]);
    setTimeout(() => this.removeToast(newToast.id), TOAST_DURATION_MS);
  }

  removeToast(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  // ── Mutation helpers ──────────────────────────────────────────────────────

  addNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
    };
    this.notifications.update(current => [newNotification, ...current]);
  }

  setNotifications(notifications: Notification[]) {
    this.notifications.set(notifications);
  }

  async markAsRead(id: number): Promise<void> {
    this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await firstValueFrom(
        this.http.post(`${this.apiBase}/api/v1/user-notifications/mark-read`,
          { ids: [id] },
          { headers: this.getHeaders() }
        )
      );
    } catch { /* optimistic – ignore */ }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
    try {
      await firstValueFrom(
        this.http.post(`${this.apiBase}/api/v1/user-notifications/mark-read`,
          { ids: null },
          { headers: this.getHeaders() }
        )
      );
    } catch { /* optimistic – ignore */ }
  }

  async deleteNotification(id: number): Promise<void> {
    this.notifications.update(ns => ns.filter(n => n.id !== id));
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiBase}/api/v1/user-notifications/${id}`,
          { headers: this.getHeaders() }
        )
      );
    } catch { /* optimistic – ignore */ }
  }

  clear(): void {
    this.notifications.set([]);
    this.totalCount.set(0);
    this.stopPolling();
  }
}