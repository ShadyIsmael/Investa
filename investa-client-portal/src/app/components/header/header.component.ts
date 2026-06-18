import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiService } from '../../services/ui.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FileStoreService } from '../../services/file-store.service';
import { DOCUMENT } from '@angular/common';

/**
 * HeaderComponent
 *
 * Main navigation bar displayed on public pages.
 * Features:
 * - Responsive single-line layout
 * - Navigation links (Home, About, Services, Blog, Contact)
 * - Language toggle functionality
 * - Login/Signup action buttons (when not authenticated)
 * - My Office button (when authenticated)
 * - User account icon with lightweight menu (when authenticated)
 *
 * Uses Tailwind CSS for styling with dark theme (slate-900).
 * Navigation automatically scrolls on mobile devices (overflow-x-auto).
 *
 * @example
 * <app-header></app-header>
 */
@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class HeaderComponent {
  languageService = inject(LanguageService);
  private uiService = inject(UiService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fileStoreService = inject(FileStoreService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  /** Navigation links displayed in header */
  navLinks = signal([
    { label: 'Home', href: null, routerLink: '/' },
    { label: 'About', href: null, routerLink: '/about' },
    { label: 'Services', href: null, routerLink: '/services' },
    { label: 'Blog', href: null, routerLink: '/blog' },
    { label: 'Contact', href: null, routerLink: '/contact' },
    { label: 'Requests', href: null, routerLink: '/admin/requests' }
  ]);

  /** User menu state */
  isUserMenuOpen = signal(false);

  /** User menu items */
  userMenuItems = signal([
    { label: 'Profile', routerLink: '/admin/profile' },
    { label: 'Settings', routerLink: '/admin/settings' },
    { label: 'Logout', action: 'logout' }
  ]);

  /** Computed authentication state */
  isAuthenticated = this.authService.isAuthenticated;

  /** Computed user data */
  user = this.userService.user;

  /** Computed user display name */
  userDisplayName = computed(() => {
    const currentUser = this.user();
    return currentUser?.name || 'User';
  });

  /** Computed user initials (first letter of first name + first letter of last name) */
  userInitials = computed(() => {
    const name = this.userDisplayName();
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  /** Computed user avatar URL */
  userAvatarUrl = computed(() => {
    const currentUser = this.user();
    if (currentUser?.profileImageUrl) {
      return this.fileStoreService.getPublicUrl(currentUser.profileImageUrl);
    }
    return null;
  });

  /** Signal to track if image failed to load */
  imageLoadFailed = signal(false);

  constructor() {
    // Add click-outside listener to close user menu
    this.document.addEventListener('click', this.onClickOutside.bind(this));
  }

  ngOnDestroy() {
    // Remove click-outside listener
    this.document.removeEventListener('click', this.onClickOutside.bind(this));
  }

  private onClickOutside(event: Event) {
    if (this.isUserMenuOpen()) {
      const target = event.target as HTMLElement;
      const userMenuElement = this.document.querySelector('.user-menu-container');
      if (userMenuElement && !userMenuElement.contains(target)) {
        this.closeUserMenu();
      }
    }
  }

  /**
   * Opens the role selection modal for authentication
   * @param event Click event to prevent default behavior
   */
  openLoginModal(event: Event) {
    event.preventDefault();
    this.uiService.openRoleSelectModal();
  }

  /**
   * Toggles the application language between supported locales
   * @param event Click event to prevent default behavior
   */
  toggleLanguage(event: Event) {
    event.preventDefault();
    this.languageService.toggleLanguage();
  }

  /**
   * Navigates to user dashboard (My Office)
   */
  navigateToMyOffice() {
    this.router.navigate(['/admin/dashboard']);
  }

  /**
   * Toggles the user menu
   */
  toggleUserMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isUserMenuOpen.update(open => !open);
  }

  /**
   * Closes the user menu
   */
  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  /**
   * Handles user menu item clicks
   * @param item Menu item to handle
   */
  handleUserMenuItemClick(item: any) {
    this.closeUserMenu();

    if (item.action === 'logout') {
      this.authService.logout();
      this.router.navigate(['/']);
    } else if (item.routerLink) {
      this.router.navigate([item.routerLink]);
    }
  }

  /**
   * Handles image load error - switches to initials avatar
   */
  onImageError() {
    this.imageLoadFailed.set(true);
  }
}
