import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language.service';
import { NotificationHostComponent } from './components/notification-host/notification-host.component';
import { UiService } from './services/ui.service';
import { RoleSelectComponent } from './components/role-select/role-select.component';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';
import { RequestsService } from './services/requests.service';
import { UserService } from './services/user.service';

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
  private requestsService = inject(RequestsService);
  private userService = inject(UserService);

  isRoleSelectOpen = this.uiService.isRoleSelectOpen;

  constructor() {
    // Set up effects for reactive state
    effect(() => {
      document.documentElement.lang = this.languageService.language();
      document.documentElement.dir = this.languageService.direction();
    });

    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      if (!isAuthenticated) {
        this.requestsService.clearState();
      } else {
        this.requestsService.refreshRequests();
      }
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
