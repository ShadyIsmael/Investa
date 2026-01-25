import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

/**
 * AdminNavbarComponent
 * 
 * Navigation bar for authenticated users (admin/investor/founder section).
 * Features:
 * - User role-based navigation links
 * - Notification bell with unread count
 * - User dropdown menu with logout
 * - Language toggle functionality
 * - Real-time notification display
 * 
 * Automatically hides/shows menus when interacting with other dropdowns.
 * Uses Angular Signals for reactive state management.
 * 
 * @example
 * <app-admin-navbar></app-admin-navbar>
 */
@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslatePipe, ClickOutsideDirective]
})
export class AdminNavbarComponent {
  private authService = inject(AuthService);
  private router: Router = inject(Router);
  languageService = inject(LanguageService);
  notificationService = inject(NotificationService);

  /** Current user's role (investor, founder, admin) */
  userRole = this.authService.userRole;
  
  /** Tracks if user dropdown menu is open */
  isUserMenuOpen = signal(false);
  
  /** Tracks if notifications dropdown is open */
  isNotificationsOpen = signal(false);
  
  /** Unread notification count */
  unreadCount = this.notificationService.unreadCount;
  
  /** Most recent notifications (limited to 3) */
  recentNotifications = computed(() => this.notificationService.notifications().slice(0, 3));

  /**
   * Toggles the user menu dropdown
   * Automatically closes notifications menu when opening user menu
   */
  toggleUserMenu() {
    this.isUserMenuOpen.update(value => !value);
    if (this.isUserMenuOpen()) {
      this.isNotificationsOpen.set(false);
    }
  }
  
  /**
   * Toggles the notifications dropdown
   * Automatically closes user menu when opening notifications menu
   */
  toggleNotifications() {
    this.isNotificationsOpen.update(value => !value);
     if (this.isNotificationsOpen()) {
      this.isUserMenuOpen.set(false);
    }
  }

  /**
   * Logs out the current user and redirects to login page
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Toggles the application language
   * @param event Click event to prevent default behavior
   */
  toggleLanguage(event: Event) {
    event.preventDefault();
    this.languageService.toggleLanguage();
  }
  
  /**
   * Navigates to the notifications page and closes the dropdown
   */
  viewAllNotifications() {
    this.isNotificationsOpen.set(false);
    this.router.navigate(['/admin/notifications']);
  }

  /**
   * Calculates human-readable time difference from current time
   * @param date The date to calculate time difference from
   * @returns String like "2 hours ago", "3 days ago", etc.
   */
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
