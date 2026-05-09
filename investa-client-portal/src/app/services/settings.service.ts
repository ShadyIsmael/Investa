import { Injectable, signal, computed } from '@angular/core';
import { CurrencyPreference, DashboardDensity, DefaultInvestmentTypePreference, ThemePreference, UserSettings, SupportSettings } from '../models/settings.model';

const STORAGE_KEY = 'investa:userSettings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _settings = signal<UserSettings>(this.loadFromStorage());

  readonly settings = this._settings.asReadonly();

  readonly theme = computed(() => this._settings().theme);
  readonly language = computed(() => this._settings().language);
  readonly currency = computed(() => this._settings().currency);
  readonly notifications = computed(() => this._settings().notifications);
  readonly privacy = computed(() => this._settings().privacy);
  readonly personalization = computed(() => this._settings().personalization);
  readonly support = computed(() => this._settings().support);
  readonly walletBalance = computed(() => this._settings().walletBalance);
  readonly sessionTimeoutMinutes = computed(() => this._settings().sessionTimeoutMinutes ?? 30);

  update(partial: Partial<UserSettings>) {
    const next: UserSettings = { ...this._settings(), ...partial };
    this._settings.set(next);
    this.saveToStorage(next);
  }

  setTheme(theme: ThemePreference) {
    this.update({ theme });
  }

  setLanguage(language: string) {
    this.update({ language });
  }

  setCurrency(currency: CurrencyPreference) {
    this.update({ currency });
  }

  setNotifications(notifications: UserSettings['notifications']) {
    this.update({ notifications });
  }

  setPrivacy(privacy: UserSettings['privacy']) {
    this.update({ privacy });
  }

  setPersonalization(personalization: UserSettings['personalization']) {
    this.update({ personalization });
  }

  setSupport(support: SupportSettings) {
    this.update({ support });
  }

  setWalletBalance(walletBalance: number) {
    this.update({ walletBalance });
  }

  setSessionTimeout(minutes: number | null) {
    const nextTimeout = minutes && isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : null;
    this.update({ sessionTimeoutMinutes: nextTimeout ?? undefined });
  }

  addFunds(amount: number) {
    const current = this._settings().walletBalance ?? 0;
    const next = Math.max(0, current + (isFinite(amount) ? amount : 0));
    this.update({ walletBalance: next });
  }

  private loadFromStorage(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserSettings;
        return this.withDefaults(parsed);
      }
    } catch {
      // ignore
    }
    return this.defaultSettings();
  }

  private saveToStorage(settings: UserSettings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  private defaultSettings(): UserSettings {
    return {
      theme: ThemePreference.System,
      language: 'en',
      currency: CurrencyPreference.USD,
      notifications: { email: true, push: true, sms: false },
      privacy: { showPublicProfile: true, sharePortfolioPerformance: false },
      personalization: {
        dashboardDensity: DashboardDensity.Comfortable,
        defaultInvestmentType: DefaultInvestmentTypePreference.Any,
        showRiskIndicators: true,
      },
      support: { available: true, hours: '' },
      walletBalance: 0,
      sessionTimeoutMinutes: 30,
    };
  }

  private withDefaults(settings: Partial<UserSettings>): UserSettings {
    const d = this.defaultSettings();
    return {
      theme: settings.theme ?? d.theme,
      language: settings.language ?? d.language,
      currency: settings.currency ?? d.currency,
      notifications: {
        email: settings.notifications?.email ?? d.notifications.email,
        push: settings.notifications?.push ?? d.notifications.push,
        sms: settings.notifications?.sms ?? d.notifications.sms,
      },
      privacy: {
        showPublicProfile: settings.privacy?.showPublicProfile ?? d.privacy.showPublicProfile,
        sharePortfolioPerformance: settings.privacy?.sharePortfolioPerformance ?? d.privacy.sharePortfolioPerformance,
      },
      personalization: {
        dashboardDensity: settings.personalization?.dashboardDensity ?? d.personalization.dashboardDensity,
        defaultInvestmentType: settings.personalization?.defaultInvestmentType ?? d.personalization.defaultInvestmentType,
        showRiskIndicators: settings.personalization?.showRiskIndicators ?? d.personalization.showRiskIndicators,
      },
      support: {
        available: settings.support?.available ?? d.support.available,
        hours: settings.support?.hours ?? d.support.hours,
      },
      walletBalance: settings.walletBalance ?? d.walletBalance,
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? d.sessionTimeoutMinutes,
    };
  }
}
