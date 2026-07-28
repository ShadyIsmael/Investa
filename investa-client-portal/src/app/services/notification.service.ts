import { Injectable, signal, Inject, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TOAST_DURATION_MS } from '../config/constants';
import { API_BASE } from '../config/api.token';
import { Router } from '@angular/router';
import { ClientNotification, ClientNotificationsService } from './client-notifications.service';

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
 * Notifications are fetched from the backend (GET /api/v1/user-notifications).
 * Refresh orchestration is handled by NotificationRefreshCoordinator.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextToastId = 1;
  private readonly openingIds = new Set<number>();

  /** All notifications loaded from backend */
  notifications = signal<Notification[]>([]);

  /** Total count from last backend response (may exceed the loaded slice) */
  totalCount = signal<number>(0);

  /** Active toast messages */
  toasts = signal<Toast[]>([]);

  /** Authoritative unread count returned by the backend. */
  unreadCount = signal<number>(0);

  /** Unread chat/message notifications only. */
  unreadMessageCount = signal<number>(0);

  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string,
    private zone: NgZone,
    private router: Router,
    private clientNotifications: ClientNotificationsService,
  ) {}

  // ── Backend fetch ─────────────────────────────────────────────────────────

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /** Load (or reload) notifications from the backend. pageSize=10 for navbar. */
  async loadNotifications(pageSize = 10, page = 1): Promise<void> {
    try {
      const [items, backendUnreadCount, unreadMessageCount] = await Promise.all([
        this.clientNotifications.getNotifications(),
        this.clientNotifications.getUnreadCounts().catch(() => null),
        this.clientNotifications.getUnreadMessageCount().catch(() => null),
      ]);
      const start = (page - 1) * pageSize;
      const mapped = items.slice(start, start + pageSize).map(n => this.mapClient(n));
      this.zone.run(() => {
        if (page === 1) {
          this.notifications.set(mapped);
        } else {
          this.notifications.update(existing => [...existing, ...mapped]);
        }
        this.totalCount.set(items.length);
        this.unreadCount.set(backendUnreadCount?.notificationCount ?? items.filter(notification => !notification.isRead && !this.isChatAction(notification.actionUrl)).length);
        this.unreadMessageCount.set(unreadMessageCount ?? backendUnreadCount?.messageCount ?? 0);
      });
    } catch {
      // Silently ignore – coordinator handles retry
    }
  }

  /** Called by coordinator to apply backend data */
  setFromBackend(items: BackendNotification[], totalCount: number, unreadCount?: number): void {
    const mapped = items.map(n => this.mapBackend(n));
    this.notifications.set(mapped);
    this.totalCount.set(totalCount);
    this.unreadCount.set(mapped.filter(notification => !notification.read && !this.isChatAction(notification.actionUrl)).length);
    this.unreadMessageCount.set(mapped.filter(notification => !notification.read && this.isChatAction(notification.actionUrl)).length);
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

  private mapClient(n: ClientNotification): Notification {
    return {
      id: Number(n.id),
      title: n.title,
      message: n.message,
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
    this.totalCount.update(count => count + 1);
    this.unreadCount.update(count => count + 1);
    if (this.isChatAction(newNotification.actionUrl)) {
      this.unreadMessageCount.update(count => count + 1);
      this.unreadCount.update(count => Math.max(0, count - 1));
    }
  }

  setNotifications(notifications: Notification[]) {
    this.notifications.set(notifications);
    this.totalCount.set(notifications.length);
    this.unreadCount.set(notifications.filter(notification => !notification.read && !this.isChatAction(notification.actionUrl)).length);
    this.unreadMessageCount.set(notifications.filter(notification => !notification.read && this.isChatAction(notification.actionUrl)).length);
  }

  async markAsRead(id: number): Promise<void> {
    const notification = this.notifications().find(n => n.id === id);
    if (!notification || notification.read) return;
    this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    if (this.isChatAction(notification.actionUrl)) this.unreadMessageCount.update(count => Math.max(0, count - 1));
    else this.unreadCount.update(count => Math.max(0, count - 1));
    try {
      await this.clientNotifications.markAsRead(id);
    } catch (error) {
      console.warn('[NotificationService] Failed to mark notification as read.', error);
    }
  }

  isOpening(id: number): boolean {
    return this.openingIds.has(id);
  }

  async openNotification(notification: Notification): Promise<void> {
    if (this.openingIds.has(notification.id)) return;
    this.openingIds.add(notification.id);
    try {
      if (!notification.read) {
        await this.markAsRead(notification.id);
      }
      await this.router.navigateByUrl(this.resolveTargetUrl(notification.actionUrl));
    } finally {
      this.openingIds.delete(notification.id);
    }
  }

  resolveTargetUrl(actionUrl?: string | null): string {
    const fallback = '/admin/notifications';
    if (!actionUrl) return fallback;

    const value = actionUrl.trim();
    if (!value.startsWith('/admin/') || value.includes('\\') || value.startsWith('//')) {
      return fallback;
    }

    const path = value.split(/[?#]/, 1)[0];
    const allowed = [
      /^\/admin\/notifications$/,
      /^\/admin\/requests$/,
      /^\/admin\/chat$/,
      /^\/admin\/investments\/\d+(?:\/requests)?$/,
      /^\/admin\/opportunities\/\d+(?:\/room)?$/,
      /^\/admin\/my-projects$/
    ];
    return allowed.some(pattern => pattern.test(path)) ? value : fallback;
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
    this.unreadCount.set(0);
    this.unreadMessageCount.set(0);
    try {
      await this.clientNotifications.markAllAsRead();
    } catch { /* optimistic – ignore */ }
  }

  async deleteNotification(id: number): Promise<void> {
    const deleted = this.notifications().find(notification => notification.id === id);
    this.notifications.update(ns => ns.filter(n => n.id !== id));
    if (deleted) {
      this.totalCount.update(count => Math.max(0, count - 1));
      if (!deleted.read) {
        if (this.isChatAction(deleted.actionUrl)) this.unreadMessageCount.update(count => Math.max(0, count - 1));
        else this.unreadCount.update(count => Math.max(0, count - 1));
      }
    }
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
    this.unreadCount.set(0);
    this.unreadMessageCount.set(0);
  }

  private isChatAction(actionUrl?: string | null): boolean {
    return !!actionUrl?.trim().startsWith('/admin/chat');
  }
}
