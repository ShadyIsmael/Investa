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

  isRoleSelectOpen = this.uiService.isRoleSelectOpen;

  constructor() {
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

    // start session tracking for inactivity timeout
    try {
      this.sessionService.start();
    } catch {
      // ignore if session service can't start in some environments
    }
  }
}
