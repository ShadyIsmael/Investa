import { Injectable, signal, computed } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextId = 4;
  private nextToastId = 1;
  
  notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'New Investment Opportunity',
      message: 'Quantum Leap AI stock has been added. Check it out!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Portfolio Milestone',
      message: 'Congratulations! Your portfolio has reached a new high of $150,000.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'Security Alert',
      message: 'A new device has logged into your account. If this was not you, please secure your account immediately.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      type: 'warning'
    }
  ]);

  toasts = signal<Toast[]>([]);

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  showToast(toastData: Omit<Toast, 'id'>) {
    const newToast: Toast = {
      ...toastData,
      id: this.nextToastId++,
    };
    this.toasts.update(current => [newToast, ...current]);
    
    setTimeout(() => {
      this.removeToast(newToast.id);
    }, 5000);
  }
  
  removeToast(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  addNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notificationData,
      id: this.nextId++,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.update(current => [newNotification, ...current]);
  }

  markAsRead(id: number) {
    this.notifications.update(notifications => 
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead() {
    this.notifications.update(notifications => 
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  deleteNotification(id: number) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }
}