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
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function AppComponent_app_role_select_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-role-select");
} }
export class AppComponent {
    constructor() {
        this.languageService = inject(LanguageService);
        this.uiService = inject(UiService);
        this.sessionService = inject(SessionService);
        this.authService = inject(AuthService);
        this.userService = inject(UserService);
        this.settingsService = inject(SettingsService);
        this.firebaseClient = inject(FirebaseClientService);
        this.coordinator = inject(NotificationRefreshCoordinator);
        this.fcmService = inject(FcmService);
        this.isRoleSelectOpen = this.uiService.isRoleSelectOpen;
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
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[AppComponent] Service workers not supported in this browser');
            return;
        }
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            if (registration.active) {
                console.info('[AppComponent] Firebase messaging service worker registered successfully, scope:', registration.scope);
            }
            else {
                console.info('[AppComponent] Firebase messaging service worker registered (waiting for activation)');
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[AppComponent] SERVICE WORKER REGISTRATION FAILED:', msg);
            if (msg.includes('404') || msg.includes('Not Found')) {
                console.error('[AppComponent] /firebase-messaging-sw.js was not found at the application root. Ensure the file is deployed to the output root.');
            }
        }
    }
    async initializeApp() {
        try {
            await this.authService.initialize();
            await this.userService.initializeUser();
            if (this.authService.isAuthenticated()) {
                try {
                    this.sessionService.start();
                }
                catch {
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
                        }
                        catch {
                            // FCM failure must not block the app
                        }
                    }
                    catch {
                        // Firebase failure must not block the app
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }
    static { this.ɵfac = function AppComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["app-root"]], decls: 3, vars: 1, consts: [[4, "ngIf"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "router-outlet")(1, "app-notification-host");
            i0.ɵɵtemplate(2, AppComponent_app_role_select_2_Template, 1, 0, "app-role-select", 0);
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.isRoleSelectOpen());
        } }, dependencies: [RouterOutlet, NotificationHostComponent, CommonModule, i1.NgIf, RoleSelectComponent], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n  min-height: 100vh;\r\n  background: var(--investa-bg);\r\n}\r\n\r\n\n"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-root', template: `
    <router-outlet></router-outlet>
    <app-notification-host></app-notification-host>
    <app-role-select *ngIf="isRoleSelectOpen()"></app-role-select>
  `, changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterOutlet, NotificationHostComponent, CommonModule, RoleSelectComponent], styles: [":host {\r\n  display: block;\r\n  min-height: 100vh;\r\n  background: var(--investa-bg);\r\n}\r\n\r\n/* Keep empty \u2014 component-specific styles live in child components */\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src/app/app.component.ts", lineNumber: 29 }); })();
