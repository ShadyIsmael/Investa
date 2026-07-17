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
  readonly sessionTimeoutMinutes = computed(() => this._settings().sessionTimeoutMinutes ?? 30);

  update(partial: Partial<UserSettings>): boolean {
    const next: UserSettings = { ...this._settings(), ...partial };
    if (!this.saveToStorage(next)) return false;
    this._settings.set(next);
    return true;
  }

  setTheme(theme: ThemePreference): boolean {
    return this.update({ theme });
  }

  setLanguage(language: string): boolean {
    return this.update({ language });
  }

  setCurrency(currency: CurrencyPreference): boolean {
    return this.update({ currency });
  }

  setNotifications(notifications: UserSettings['notifications']): boolean {
    return this.update({ notifications });
  }

  setPrivacy(privacy: UserSettings['privacy']): boolean {
    return this.update({ privacy });
  }

  setPersonalization(personalization: UserSettings['personalization']): boolean {
    return this.update({ personalization });
  }

  setSupport(support: SupportSettings): boolean {
    return this.update({ support });
  }

  setSessionTimeout(minutes: number | null): boolean {
    const nextTimeout = minutes && isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : null;
    return this.update({ sessionTimeoutMinutes: nextTimeout ?? undefined });
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

  private saveToStorage(settings: UserSettings): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch {
      return false;
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
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? d.sessionTimeoutMinutes,
    };
  }
}
