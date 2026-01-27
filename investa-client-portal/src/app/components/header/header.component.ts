import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiService } from '../../services/ui.service';

/**
 * HeaderComponent
 * 
 * Main navigation bar displayed on public pages.
 * Features:
 * - Responsive single-line layout
 * - Navigation links (Home, About, Services, Blog, Contact)
 * - Language toggle functionality
 * - Login/Signup action buttons
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

  /** Navigation links displayed in header */
  navLinks = signal([
    { label: 'Home', href: null, routerLink: '/' },
    { label: 'About', href: null, routerLink: '/about' },
    { label: 'Services', href: null, routerLink: '/services' },
    { label: 'Blog', href: null, routerLink: '/blog' },
    { label: 'Contact', href: null, routerLink: '/contact' },
    { label: 'Requests', href: null, routerLink: '/admin/requests' }
  ]);

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
}
