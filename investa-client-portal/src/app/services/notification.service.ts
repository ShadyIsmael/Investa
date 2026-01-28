import { Injectable, signal, computed } from '@angular/core';
import { TOAST_DURATION_MS } from '../config/constants';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: NotificationType;
}

export interface Toast extends Omit<Notification, 'timestamp' | 'read'> {}

/**
 * Service for managing in-app notifications and toast messages.
 * Notifications are persisted in component state; toasts auto-dismiss.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextId = 1;
  private nextToastId = 1;
  
  /** All notifications - fetched from backend on init */
  notifications = signal<Notification[]>([]);

  /** Active toast messages */
  toasts = signal<Toast[]>([]);

  /** Count of unread notifications */
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  /**
   * Displays a toast notification that auto-dismisses.
   * @param toastData - Toast content without id
   */
  showToast(toastData: Omit<Toast, 'id'>) {
    const newToast: Toast = {
      ...toastData,
      id: this.nextToastId++,
    };
    this.toasts.update(current => [newToast, ...current]);
    
    setTimeout(() => {
      this.removeToast(newToast.id);
    }, TOAST_DURATION_MS);
  }
  
  /**
   * Removes a toast by its id.
   * @param id - Toast identifier
   */
  removeToast(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Adds a new notification to the list.
   * @param notificationData - Notification content
   */
  addNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notificationData,
      id: this.nextId++,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.update(current => [newNotification, ...current]);
  }

  /**
   * Sets the notifications list (e.g., from backend fetch).
   * @param notifications - Array of notifications
   */
  setNotifications(notifications: Notification[]) {
    this.notifications.set(notifications);
    // Update nextId to avoid collisions
    const maxId = notifications.reduce((max, n) => Math.max(max, n.id), 0);
    this.nextId = maxId + 1;
  }

  /**
   * Marks a single notification as read.
   * @param id - Notification identifier
   */
  markAsRead(id: number) {
    this.notifications.update(notifications => 
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  /**
   * Marks all notifications as read.
   */
  markAllAsRead() {
    this.notifications.update(notifications => 
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  /**
   * Deletes a notification by id.
   * @param id - Notification identifier
   */
  deleteNotification(id: number) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }
}