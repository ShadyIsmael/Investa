import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe]
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);

  activeFilter = signal<'all' | 'unread'>('all');

  filteredNotifications = computed(() => {
    const notifications = this.notificationService.notifications();
    if (this.activeFilter() === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  });

  setFilter(filter: 'all' | 'unread') {
    this.activeFilter.set(filter);
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
  }

  deleteNotification(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
