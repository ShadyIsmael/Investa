import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslatePipe, ClickOutsideDirective]
})
export class AdminNavbarComponent {
  private authService = inject(AuthService);
  private router: Router = inject(Router);
  languageService = inject(LanguageService);
  notificationService = inject(NotificationService);

  userRole = this.authService.userRole;
  isUserMenuOpen = signal(false);
  isNotificationsOpen = signal(false);
  
  unreadCount = this.notificationService.unreadCount;
  recentNotifications = computed(() => this.notificationService.notifications().slice(0, 3));

  toggleUserMenu() {
    this.isUserMenuOpen.update(value => !value);
    if (this.isUserMenuOpen()) {
      this.isNotificationsOpen.set(false);
    }
  }
  
  toggleNotifications() {
    this.isNotificationsOpen.update(value => !value);
     if (this.isNotificationsOpen()) {
      this.isUserMenuOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleLanguage(event: Event) {
    event.preventDefault();
    this.languageService.toggleLanguage();
  }
  
  viewAllNotifications() {
    this.isNotificationsOpen.set(false);
    this.router.navigate(['/admin/notifications']);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      const years = Math.floor(interval);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      const months = Math.floor(interval);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    return `${Math.floor(seconds)} second${seconds > 1 ? 's' : ''} ago`;
  }
}
