import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe, ClickOutsideDirective]
})
export class HeaderComponent {
  languageService = inject(LanguageService);
  private uiService = inject(UiService);

  navLinks = signal([
    { label: 'Home', href: null, routerLink: '/' },
    { label: 'About', href: null, routerLink: '/about' },
    { label: 'Services', href: null, routerLink: '/services' },
    { label: 'Blog', href: null, routerLink: '/blog' },
    { label: 'Contact', href: null, routerLink: '/contact' }
  ]);

  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  openLoginModal(event: Event) {
    event.preventDefault();
    this.isMobileMenuOpen.set(false); // Close mobile menu if open
    this.uiService.openRoleSelectModal();
  }

  toggleLanguage(event: Event) {
    event.preventDefault();
    this.languageService.toggleLanguage();
  }
}
