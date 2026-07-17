import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language.service';
import { NotificationHostComponent } from './components/notification-host/notification-host.component';
import { UiService } from './services/ui.service';
import { RoleSelectComponent } from './components/role-select/role-select.component';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { SettingsService } from './services/settings.service';
import { ThemePreference } from './models/settings.model';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-notification-host></app-notification-host>
    <app-role-select *ngIf="isRoleSelectOpen()"></app-role-select>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NotificationHostComponent, CommonModule, RoleSelectComponent]
})
export class AppComponent {
  private languageService = inject(LanguageService);
  private uiService = inject(UiService);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);

  isRoleSelectOpen = this.uiService.isRoleSelectOpen;

  constructor() {
    // Set up effects for reactive state
    effect(() => {
      document.documentElement.lang = this.languageService.language();
      document.documentElement.dir = this.languageService.direction();
    });

    effect(() => {
      const preference = this.settingsService.theme();
      const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false;
      const useLight = preference === ThemePreference.Light || (preference === ThemePreference.System && prefersLight);
      document.body.classList.toggle('investa-theme-light', useLight);
      document.body.classList.toggle('investa-theme-dark', !useLight);
    });

    // Initialize authentication and user state on app startup
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    try {
      // Step 1: Initialize authentication (validate token)
      await this.authService.initialize();

      // Step 2: Initialize user profile (only if authenticated)
      await this.userService.initializeUser();

      // Step 3: Start session service (only if authenticated)
      if (this.authService.isAuthenticated()) {
        try {
          this.sessionService.start();
        } catch {
          // ignore if session service can't start in some environments
        }
      }
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
}
