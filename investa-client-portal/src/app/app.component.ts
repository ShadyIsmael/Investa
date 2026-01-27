import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language.service';
import { NotificationHostComponent } from './components/notification-host/notification-host.component';
import { UiService } from './services/ui.service';
import { RoleSelectComponent } from './components/role-select/role-select.component';
import { ApiBaseSwitcherComponent } from './components/api-base-switcher/api-base-switcher.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-notification-host></app-notification-host>
    <app-role-select *ngIf="isRoleSelectOpen()"></app-role-select>
    <app-api-base-switcher></app-api-base-switcher>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NotificationHostComponent, CommonModule, RoleSelectComponent, ApiBaseSwitcherComponent]
})
export class AppComponent {
  private languageService = inject(LanguageService);
  private uiService = inject(UiService);

  isRoleSelectOpen = this.uiService.isRoleSelectOpen;

  constructor() {
    effect(() => {
      document.documentElement.lang = this.languageService.language();
      document.documentElement.dir = this.languageService.direction();
    });
  }
}
