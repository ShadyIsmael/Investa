import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiService } from '../../services/ui.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FileStoreService } from '../../services/file-store.service';
import { SettingsService } from '../../services/settings.service';
import { ThemePreference } from '../../models/settings.model';
import { DOCUMENT } from '@angular/common';

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
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  navLinks = signal([
    { label: 'Explore Opportunities', key: 'explore', routerLink: '/admin/investments' },
    { label: 'How It Works', key: 'how', routerLink: '/about' },
  ]);

  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  userMenuItems = signal([
    { label: 'Profile', routerLink: '/admin/profile' },
    { label: 'Settings', routerLink: '/admin/settings' },
    { label: 'Logout', action: 'logout' }
  ]);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.userService.user;

  userDisplayName = computed(() => {
    const currentUser = this.user();
    return currentUser?.name || 'User';
  });

  userInitials = computed(() => {
    const name = this.userDisplayName();
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  userAvatarUrl = computed(() => {
    const currentUser = this.user();
    if (currentUser?.profileImageUrl) {
      return this.fileStoreService.getPublicUrl(currentUser.profileImageUrl);
    }
    return null;
  });

  imageLoadFailed = signal(false);

  isDarkTheme = computed(() => {
    const pref = this.settingsService.theme();
    if (pref === ThemePreference.Dark) return true;
    if (pref === ThemePreference.Light) return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });

  constructor() {
    this.document.addEventListener('click', this.onClickOutside.bind(this));
  }

  ngOnDestroy() {
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

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  openLoginModal(event: Event) {
    event.preventDefault();
    this.uiService.openRoleSelectModal();
  }

  toggleLanguage(event: Event) {
    event.preventDefault();
    this.languageService.toggleLanguage();
  }

  toggleTheme(event: Event) {
    event.preventDefault();
    const current = this.settingsService.theme();
    if (current === ThemePreference.Dark) {
      this.settingsService.setTheme(ThemePreference.Light);
    } else {
      this.settingsService.setTheme(ThemePreference.Dark);
    }
  }

  navigateToMyOffice() {
    this.router.navigate(['/admin/dashboard']);
  }

  toggleUserMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isUserMenuOpen.update(open => !open);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  handleUserMenuItemClick(item: any) {
    this.closeUserMenu();
    if (item.action === 'logout') {
      this.authService.logout();
      this.router.navigate(['/']);
    } else if (item.routerLink) {
      this.router.navigate([item.routerLink]);
    }
  }

  onImageError() {
    this.imageLoadFailed.set(true);
  }
}
