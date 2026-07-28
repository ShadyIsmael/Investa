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
import { FirebaseClientService } from './services/firebase-client.service';
import { NotificationRefreshCoordinator } from './services/notification-refresh-coordinator.service';
import { FcmService } from './services/fcm.service';

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
  private firebaseClient = inject(FirebaseClientService);
  private coordinator = inject(NotificationRefreshCoordinator);
  private fcmService = inject(FcmService);

  isRoleSelectOpen = this.uiService.isRoleSelectOpen;

  constructor() {
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

    this.initializeApp();
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[AppComponent] Service workers not supported in this browser');
      return;
    }
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      if (registration.active) {
        console.info('[AppComponent] Firebase messaging service worker registered successfully, scope:', registration.scope);
      } else {
        console.info('[AppComponent] Firebase messaging service worker registered (waiting for activation)');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AppComponent] SERVICE WORKER REGISTRATION FAILED:', msg);
      if (msg.includes('404') || msg.includes('Not Found')) {
        console.error('[AppComponent] /firebase-messaging-sw.js was not found at the application root. Ensure the file is deployed to the output root.');
      }
    }
  }

  private async initializeApp(): Promise<void> {
    try {
      await this.authService.initialize();

      await this.userService.initializeUser();

      if (this.authService.isAuthenticated()) {
        try {
          this.sessionService.start();
        } catch {
          // ignore
        }
      }

      if (this.authService.isAuthenticated()) {
        const currentUser = this.userService.user();
        if (currentUser?.userId) {
          try {
            await this.authService.startNotificationSession(currentUser.userId);

            try {
              await this.registerServiceWorker();
              await this.fcmService.initialize();
            } catch {
              // FCM failure must not block the app
            }
          } catch {
            // Firebase failure must not block the app
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
}
