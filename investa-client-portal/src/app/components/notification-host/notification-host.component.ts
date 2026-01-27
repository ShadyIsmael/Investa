import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-host',
  templateUrl: './notification-host.component.html',
  styleUrls: ['./notification-host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class NotificationHostComponent {
  notificationService = inject(NotificationService);
  toasts = this.notificationService.toasts;

  removeToast(id: number) {
    this.notificationService.removeToast(id);
  }
}
