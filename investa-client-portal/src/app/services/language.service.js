import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { SettingsService } from './settings.service';
import * as i0 from "@angular/core";
export class LanguageService {
    constructor() {
        this.http = inject(HttpClient);
        this.settingsService = inject(SettingsService);
        this.language = signal(this.getInitialLanguage(), ...(ngDevMode ? [{ debugName: "language" }] : []));
        this.dictionaries = toSignal(forkJoin({
            en: this.http.get('/assets/i18n/en.json'),
            ar: this.http.get('/assets/i18n/ar.json')
        }), { initialValue: { en: {}, ar: {} } });
        this.dictionary = computed(() => this.dictionaries()[this.language()], ...(ngDevMode ? [{ debugName: "dictionary" }] : []));
        this.direction = computed(() => this.language() === 'ar' ? 'rtl' : 'ltr', ...(ngDevMode ? [{ debugName: "direction" }] : []));
        effect(() => {
            const settingsLanguage = this.settingsService.language();
            if (settingsLanguage === 'en' || settingsLanguage === 'ar') {
                if (this.language() !== settingsLanguage) {
                    this.language.set(settingsLanguage);
                    localStorage.setItem('investa-lang', settingsLanguage);
                }
            }
        });
    }
    getInitialLanguage() {
        const settingsLanguage = this.settingsService.language();
        if (settingsLanguage === 'en' || settingsLanguage === 'ar') {
            return settingsLanguage;
        }
        const saved = localStorage.getItem('investa-lang');
        return (saved === 'ar' || saved === 'en') ? saved : 'en';
    }
    setLanguage(lang) {
        this.language.set(lang);
        localStorage.setItem('investa-lang', lang);
        this.settingsService.setLanguage(lang);
    }
    toggleLanguage() {
        this.setLanguage(this.language() === 'en' ? 'ar' : 'en');
    }
    translate(path) {
        const parts = path.split('.');
        let cur = this.dictionary();
        for (const p of parts) {
            cur = cur?.[p];
            if (!cur)
                return path;
        }
        return cur;
    }
    static { this.ɵfac = function LanguageService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LanguageService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: LanguageService, factory: LanguageService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LanguageService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
