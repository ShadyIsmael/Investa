import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SettingsService } from '../../../services/settings.service';
import { CurrencyPreference, DashboardDensity, DefaultInvestmentTypePreference, ThemePreference, UserSettings } from '../../../models/settings.model';
import { LanguageService } from '../../../services/language.service';
import { WalletService } from '../../../services/wallet.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);
  private walletService = inject(WalletService);
  languageService = inject(LanguageService);
  platformCreditBalance = this.walletService.balance;
  creditLoading = signal(true);
  creditError = signal(false);

  ThemePreference = ThemePreference;
  DashboardDensity = DashboardDensity;
  DefaultInvestmentTypePreference = DefaultInvestmentTypePreference;
  CurrencyPreference = CurrencyPreference;

  settings = this.settingsService.settings;
  draft = signal<UserSettings>(this.cloneSettings(this.settingsService.settings()));
  feedback = signal<'saved' | 'error' | null>(null);
  feedbackSection = signal<string | null>(null);

  themeOptions = [ThemePreference.System, ThemePreference.Light, ThemePreference.Dark];
  densityOptions = [DashboardDensity.Comfortable, DashboardDensity.Compact];
  investmentTypeOptions = [DefaultInvestmentTypePreference.Any, DefaultInvestmentTypePreference.Founding, DefaultInvestmentTypePreference.Equity];
  currencyOptions = [CurrencyPreference.USD, CurrencyPreference.EUR, CurrencyPreference.SAR];

  constructor() {
    void this.loadCreditBalance();
  }

  // Sidebar navigation
  activeSection: 'appearance'|'localization'|'notifications'|'privacy'|'personalization'|'support'|'wallet'|'security' = 'appearance';
  menuItems = [
    { id: 'appearance', labelKey: 'settings.appearance.title' },
    { id: 'localization', labelKey: 'settings.localization.title' },
    { id: 'notifications', labelKey: 'settings.notifications.title' },
    { id: 'privacy', labelKey: 'settings.privacy.title' },
    { id: 'personalization', labelKey: 'settings.personalization.title' },
    { id: 'support', labelKey: 'settings.support.title' },
    { id: 'security', labelKey: 'settings.security.title' },
    { id: 'wallet', labelKey: 'settings.wallet.title' },
  ] as const;

  setTheme(theme: ThemePreference) {
    this.updateDraft({ theme });
  }
  setLanguage(lang: string) {
    if (lang !== 'en' && lang !== 'ar') return;
    this.updateDraft({ language: lang });
  }
  setCurrency(cur: string) {
    const currency = this.currencyOptions.find(option => option === cur);
    if (currency) this.updateDraft({ currency });
  }
  setLanguageFromEvent(event: Event): void {
    if (event.target instanceof HTMLSelectElement) this.setLanguage(event.target.value);
  }
  setCurrencyFromEvent(event: Event): void {
    if (event.target instanceof HTMLSelectElement) this.setCurrency(event.target.value);
  }
  setNotificationFromEvent(key: 'email'|'push'|'sms', event: Event): void {
    if (event.target instanceof HTMLInputElement) this.toggleNotifications(key, event.target.checked);
  }
  setPrivacyFromEvent(key: 'showPublicProfile'|'sharePortfolioPerformance', event: Event): void {
    if (event.target instanceof HTMLInputElement) this.togglePrivacy(key, event.target.checked);
  }
  setRiskIndicatorsFromEvent(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.setPersonalization({ showRiskIndicators: event.target.checked });
  }
  setSupportAvailabilityFromEvent(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.setSupportAvailability(event.target.checked);
  }
  setSupportHoursFromEvent(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.setSupportHours(event.target.value);
  }
  setSessionTimeoutFromEvent(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.setSessionTimeoutMinutes(event.target.value);
  }
  toggleNotifications(key: 'email'|'push'|'sms', value: boolean) {
    this.updateDraft({ notifications: { ...this.draft().notifications, [key]: value } });
  }
  togglePrivacy(key: 'showPublicProfile'|'sharePortfolioPerformance', value: boolean) {
    this.updateDraft({ privacy: { ...this.draft().privacy, [key]: value } });
  }
  setPersonalization(partial: Partial<ReturnType<typeof this.settings>['personalization']>) {
    this.updateDraft({ personalization: { ...this.draft().personalization, ...partial } });
  }

  selectSection(id: typeof this.activeSection) {
    this.activeSection = id;
    this.feedback.set(null);
  }

  setSupportAvailability(val: boolean) {
    this.updateDraft({ support: { ...this.draft().support, available: val } });
  }

  setSupportHours(val: string) {
    this.updateDraft({ support: { ...this.draft().support, hours: val } });
  }

  // Session timeout (admin configurable)
  setSessionTimeoutMinutes(val: string) {
    const v = parseInt(val, 10);
    if (!isNaN(v) && isFinite(v) && v > 0) {
      this.updateDraft({ sessionTimeoutMinutes: Math.floor(v) });
    } else {
      this.updateDraft({ sessionTimeoutMinutes: undefined });
    }
  }

  saveActiveSection(): void {
    const value = this.draft();
    let saved = false;
    switch (this.activeSection) {
      case 'appearance':
        saved = this.settingsService.setTheme(value.theme);
        break;
      case 'localization':
        saved = this.settingsService.update({ language: value.language, currency: value.currency });
        if (saved && (value.language === 'en' || value.language === 'ar')) this.languageService.setLanguage(value.language);
        break;
      case 'notifications':
        saved = this.settingsService.setNotifications(value.notifications);
        break;
      case 'privacy':
        saved = this.settingsService.setPrivacy(value.privacy);
        break;
      case 'personalization':
        saved = this.settingsService.setPersonalization(value.personalization);
        break;
      case 'support':
        saved = this.settingsService.setSupport(value.support);
        break;
      case 'security':
        saved = this.settingsService.setSessionTimeout(value.sessionTimeoutMinutes ?? null);
        break;
      case 'wallet':
        return;
    }
    this.feedbackSection.set(this.activeSection);
    this.feedback.set(saved ? 'saved' : 'error');
  }

  hasUnsavedChanges(section: typeof this.activeSection): boolean {
    return JSON.stringify(this.sectionValue(this.draft(), section)) !== JSON.stringify(this.sectionValue(this.settings(), section));
  }

  showSaveAction(): boolean {
    return this.activeSection !== 'wallet';
  }

  private updateDraft(partial: Partial<UserSettings>): void {
    this.draft.update(current => ({ ...current, ...partial }));
    this.feedback.set(null);
  }

  private sectionValue(value: UserSettings, section: typeof this.activeSection): unknown {
    switch (section) {
      case 'appearance': return value.theme;
      case 'localization': return { language: value.language, currency: value.currency };
      case 'notifications': return value.notifications;
      case 'privacy': return value.privacy;
      case 'personalization': return value.personalization;
      case 'support': return value.support;
      case 'security': return value.sessionTimeoutMinutes;
      case 'wallet': return null;
    }
  }

  private cloneSettings(value: UserSettings): UserSettings {
    return {
      ...value,
      notifications: { ...value.notifications },
      privacy: { ...value.privacy },
      personalization: { ...value.personalization },
      support: { ...value.support }
    };
  }

  private async loadCreditBalance(): Promise<void> {
    try {
      this.creditError.set(false);
      await this.walletService.loadBalance();
    } catch {
      this.creditError.set(true);
    } finally {
      this.creditLoading.set(false);
    }
  }

  retryCreditBalance(): void {
    this.creditLoading.set(true);
    void this.loadCreditBalance();
  }

}
