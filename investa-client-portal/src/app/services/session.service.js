import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';
import * as i0 from "@angular/core";
export class SessionService {
    constructor() {
        this.authService = inject(AuthService);
        this.router = inject(Router);
        this.settingsService = inject(SettingsService);
        this.timeoutId = null;
        this.boundReset = this.resetTimer.bind(this);
    }
    start() {
        // listen to user activity
        window.addEventListener('mousemove', this.boundReset);
        window.addEventListener('keydown', this.boundReset);
        window.addEventListener('click', this.boundReset);
        window.addEventListener('touchstart', this.boundReset);
        // React to changes in configured timeout
        // Restart timer when settings change
        this.resetTimer();
    }
    stop() {
        window.removeEventListener('mousemove', this.boundReset);
        window.removeEventListener('keydown', this.boundReset);
        window.removeEventListener('click', this.boundReset);
        window.removeEventListener('touchstart', this.boundReset);
        this.clearTimer();
    }
    clearTimer() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    resetTimer() {
        this.clearTimer();
        // Only enforce when authenticated
        if (!this.authService.isAuthenticated()) {
            return;
        }
        const minutes = this.settingsService.sessionTimeoutMinutes();
        if (!minutes || !isFinite(minutes) || minutes <= 0)
            return;
        const ms = minutes * 60 * 1000;
        this.timeoutId = setTimeout(() => {
            // on timeout, logout and navigate to home
            this.authService.logout();
            try {
                this.router.navigate(['/']);
            }
            catch {
                // ignore navigation errors during teardown
            }
        }, ms);
    }
    static { this.ɵfac = function SessionService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SessionService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SessionService, factory: SessionService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SessionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
