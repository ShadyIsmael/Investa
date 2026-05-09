import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private settingsService = inject(SettingsService);

  private timeoutId: any = null;
  private boundReset = this.resetTimer.bind(this);

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

  private clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private resetTimer() {
    this.clearTimer();

    // Only enforce when authenticated
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const minutes = this.settingsService.sessionTimeoutMinutes();
    if (!minutes || !isFinite(minutes) || minutes <= 0) return;

    const ms = minutes * 60 * 1000;
    this.timeoutId = setTimeout(() => {
      // on timeout, logout and navigate to home
      this.authService.logout();
      try {
        this.router.navigate(['/']);
      } catch {
        // ignore navigation errors during teardown
      }
    }, ms);
  }
}
