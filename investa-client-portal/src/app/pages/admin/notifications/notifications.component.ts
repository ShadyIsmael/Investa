import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  private readonly PAGE_SIZE = 20;
  private currentPage = signal(1);

  activeFilter = signal<'all' | 'unread'>('all');
  isLoading = signal(false);
  isLoadingMore = signal(false);

  totalCount = this.notificationService.totalCount;
  unreadCount = this.notificationService.unreadCount;

  filteredNotifications = computed(() => {
    const notifications = this.notificationService.notifications();
    if (this.activeFilter() === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  });

  hasMore = computed(() =>
    this.notificationService.notifications().length < this.totalCount()
  );

  async ngOnInit() {
    this.isLoading.set(true);
    this.currentPage.set(1);
    await this.notificationService.loadNotifications(this.PAGE_SIZE, 1);
    this.isLoading.set(false);
  }

  setFilter(filter: 'all' | 'unread') {
    this.activeFilter.set(filter);
  }

  async markAsRead(notification: Notification) {
    if (!notification.read) {
      await this.notificationService.markAsRead(notification.id);
    }
  }

  async markAllAsRead() {
    await this.notificationService.markAllAsRead();
  }

  async deleteNotification(id: number, event: MouseEvent) {
    event.stopPropagation();
    await this.notificationService.deleteNotification(id);
  }

  async loadMore() {
    const nextPage = this.currentPage() + 1;
    this.isLoadingMore.set(true);
    await this.notificationService.loadNotifications(this.PAGE_SIZE, nextPage);
    this.currentPage.set(nextPage);
    this.isLoadingMore.set(false);
  }

  formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

