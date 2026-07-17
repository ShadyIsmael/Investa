import { Injectable, signal, computed } from '@angular/core';
import { CurrencyPreference, DashboardDensity, DefaultInvestmentTypePreference, ThemePreference } from '../models/settings.model';
import * as i0 from "@angular/core";
const STORAGE_KEY = 'investa:userSettings';
export class SettingsService {
    constructor() {
        this._settings = signal(this.loadFromStorage(), ...(ngDevMode ? [{ debugName: "_settings" }] : []));
        this.settings = this._settings.asReadonly();
        this.theme = computed(() => this._settings().theme, ...(ngDevMode ? [{ debugName: "theme" }] : []));
        this.language = computed(() => this._settings().language, ...(ngDevMode ? [{ debugName: "language" }] : []));
        this.currency = computed(() => this._settings().currency, ...(ngDevMode ? [{ debugName: "currency" }] : []));
        this.notifications = computed(() => this._settings().notifications, ...(ngDevMode ? [{ debugName: "notifications" }] : []));
        this.privacy = computed(() => this._settings().privacy, ...(ngDevMode ? [{ debugName: "privacy" }] : []));
        this.personalization = computed(() => this._settings().personalization, ...(ngDevMode ? [{ debugName: "personalization" }] : []));
        this.support = computed(() => this._settings().support, ...(ngDevMode ? [{ debugName: "support" }] : []));
        this.sessionTimeoutMinutes = computed(() => this._settings().sessionTimeoutMinutes ?? 30, ...(ngDevMode ? [{ debugName: "sessionTimeoutMinutes" }] : []));
    }
    update(partial) {
        const next = { ...this._settings(), ...partial };
        this._settings.set(next);
        this.saveToStorage(next);
    }
    setTheme(theme) {
        this.update({ theme });
    }
    setLanguage(language) {
        this.update({ language });
    }
    setCurrency(currency) {
        this.update({ currency });
    }
    setNotifications(notifications) {
        this.update({ notifications });
    }
    setPrivacy(privacy) {
        this.update({ privacy });
    }
    setPersonalization(personalization) {
        this.update({ personalization });
    }
    setSupport(support) {
        this.update({ support });
    }
    setSessionTimeout(minutes) {
        const nextTimeout = minutes && isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : null;
        this.update({ sessionTimeoutMinutes: nextTimeout ?? undefined });
    }
    loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return this.withDefaults(parsed);
            }
        }
        catch {
            // ignore
        }
        return this.defaultSettings();
    }
    saveToStorage(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
        catch {
            // ignore
        }
    }
    defaultSettings() {
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
    withDefaults(settings) {
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
    static { this.ɵfac = function SettingsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SettingsService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SettingsService, factory: SettingsService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SettingsService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
