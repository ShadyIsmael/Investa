import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientNotification, ClientNotificationsService } from '../../../services/client-notifications.service';

@Component({
  standalone: true,
  selector: 'app-notification-center',
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterComponent {
  private notificationsService = inject(ClientNotificationsService);
  private router = inject(Router);

  notifications = signal<ClientNotification[]>([]);
  unreadCount = signal<number>(0);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  markingReadId = signal<number | string | null>(null);
  isMarkingAllRead = signal<boolean>(false);

  hasUnread = computed(() => this.unreadCount() > 0);

  constructor() {
    this.loadNotifications();
  }

  async loadNotifications(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const [notifications, unreadCount] = await Promise.all([
        this.notificationsService.getNotifications(),
        this.notificationsService.getUnreadCount()
      ]);
      this.notifications.set(notifications);
      this.unreadCount.set(unreadCount);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load notifications.');
      this.notifications.set([]);
      this.unreadCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  async markAsRead(notification: ClientNotification): Promise<void> {
    if (notification.isRead || this.markingReadId()) return;

    try {
      this.markingReadId.set(notification.id);
      this.errorMessage.set(null);
      await this.notificationsService.markAsRead(notification.id);
      this.notifications.update(items =>
        items.map(item => item.id === notification.id ? { ...item, isRead: true } : item)
      );
      this.unreadCount.update(count => Math.max(0, count - 1));
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to mark notification as read.');
    } finally {
      this.markingReadId.set(null);
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.hasUnread() || this.isMarkingAllRead()) return;

    try {
      this.isMarkingAllRead.set(true);
      this.errorMessage.set(null);
      await this.notificationsService.markAllAsRead();
      this.notifications.update(items => items.map(item => ({ ...item, isRead: true })));
      this.unreadCount.set(0);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to mark notifications as read.');
    } finally {
      this.isMarkingAllRead.set(false);
    }
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  goBack(): void {
    this.router.navigate(['/admin/profile']);
  }
}
