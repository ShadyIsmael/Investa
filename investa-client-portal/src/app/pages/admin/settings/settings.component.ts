import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SettingsService } from '../../../services/settings.service';
import { CurrencyPreference, DashboardDensity, DefaultInvestmentTypePreference, ThemePreference } from '../../../models/settings.model';
import { LanguageService } from '../../../services/language.service';

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
  languageService = inject(LanguageService);

  ThemePreference = ThemePreference;
  DashboardDensity = DashboardDensity;
  DefaultInvestmentTypePreference = DefaultInvestmentTypePreference;
  CurrencyPreference = CurrencyPreference;

  settings = this.settingsService.settings;

  themeOptions = [ThemePreference.System, ThemePreference.Light, ThemePreference.Dark];
  densityOptions = [DashboardDensity.Comfortable, DashboardDensity.Compact];
  investmentTypeOptions = [DefaultInvestmentTypePreference.Any, DefaultInvestmentTypePreference.Founding, DefaultInvestmentTypePreference.Equity];
  currencyOptions = [CurrencyPreference.USD, CurrencyPreference.EUR, CurrencyPreference.SAR];

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
    this.settingsService.setTheme(theme);
  }
  setLanguage(lang: string) {
    // Update LanguageService as well to apply immediately
      this.languageService.setLanguage(lang as any);
      this.settingsService.setLanguage(lang as any);
  }
  setCurrency(cur: CurrencyPreference) {
    this.settingsService.setCurrency(cur as any);
  }
  toggleNotifications(key: 'email'|'push'|'sms', value: boolean) {
    const n = { ...this.settings().notifications, [key]: value };
    this.settingsService.setNotifications(n);
  }
  togglePrivacy(key: 'showPublicProfile'|'sharePortfolioPerformance', value: boolean) {
    const p = { ...this.settings().privacy, [key]: value };
    this.settingsService.setPrivacy(p);
  }
  setPersonalization(partial: Partial<ReturnType<typeof this.settings>['personalization']>) {
    const pers = { ...this.settings().personalization, ...partial };
    this.settingsService.setPersonalization(pers);
  }

  selectSection(id: typeof this.activeSection) {
    this.activeSection = id;
  }

  setSupportAvailability(val: boolean) {
    const s = { ...this.settings().support, available: val };
    this.settingsService.setSupport(s);
  }

  setSupportHours(val: string) {
    const s = { ...this.settings().support, hours: val };
    this.settingsService.setSupport(s);
  }

  // Session timeout (admin configurable)
  setSessionTimeoutMinutes(val: string) {
    const v = parseInt(val, 10);
    if (!isNaN(v) && isFinite(v) && v > 0) {
      this.settingsService.setSessionTimeout(v);
    } else {
      // clear to default
      this.settingsService.setSessionTimeout(null);
    }
  }

  addFunds(amountStr: string) {
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && isFinite(amount) && amount > 0) {
      this.settingsService.addFunds(amount);
    }
  }
}
