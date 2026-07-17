import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from './language.service';
import * as i0 from "@angular/core";
export class HeroService {
    constructor() {
        this.http = inject(HttpClient);
        this.languageService = inject(LanguageService);
        this._hero = signal(null, ...(ngDevMode ? [{ debugName: "_hero" }] : []));
        this.hero = this._hero.asReadonly();
        this._loading = signal(false, ...(ngDevMode ? [{ debugName: "_loading" }] : []));
        this.loading = this._loading.asReadonly();
        this._error = signal(null, ...(ngDevMode ? [{ debugName: "_error" }] : []));
        this.error = this._error.asReadonly();
        this.defaults = {
            titleEn: 'Smart Investing, Powered by AI',
            titleAr: 'استثمار ذكي، مدعوم بالذكاء الاصطناعي',
            subtitleEn: 'Join the future of investment with our AI-powered platform. Make data-driven decisions and maximize your returns.',
            subtitleAr: 'انضم إلى مستقبل الاستثمار مع منصتنا المدعومة بالذكاء الاصطناعي. اتخذ قرارات مستندة إلى البيانات وعظّم عوائدك.',
            primaryCtaLabelEn: 'Explore Opportunities',
            primaryCtaLabelAr: 'استكشف الفرص',
            primaryCtaUrl: '/admin/investments',
            secondaryCtaLabelEn: 'List Your Project',
            secondaryCtaLabelAr: 'أدرج مشروعك',
            secondaryCtaUrl: '/signup',
            heroImageUrl: '',
            enabled: true,
        };
    }
    load() {
        this._loading.set(true);
        this._error.set(null);
        this.http.get('/api/hero').subscribe({
            next: (data) => {
                if (data && data.enabled) {
                    this._hero.set({ ...this.defaults, ...data });
                }
                else {
                    this._hero.set(this.defaults);
                }
                this._loading.set(false);
            },
            error: () => {
                this._hero.set(this.defaults);
                this._loading.set(false);
            },
        });
    }
    get title() {
        const h = this._hero();
        if (!h)
            return this.defaults.titleEn;
        const key = this.languageService.language() === 'ar' ? 'titleAr' : 'titleEn';
        return h[key] || this.defaults.titleEn;
    }
    get subtitle() {
        const h = this._hero();
        if (!h)
            return this.defaults.subtitleEn;
        const key = this.languageService.language() === 'ar' ? 'subtitleAr' : 'subtitleEn';
        return h[key] || this.defaults.subtitleEn;
    }
    get primaryCtaLabel() {
        const h = this._hero();
        if (!h)
            return this.defaults.primaryCtaLabelEn;
        const key = this.languageService.language() === 'ar' ? 'primaryCtaLabelAr' : 'primaryCtaLabelEn';
        return h[key] || this.defaults.primaryCtaLabelEn;
    }
    get primaryCtaUrl() {
        return this._hero()?.primaryCtaUrl || this.defaults.primaryCtaUrl;
    }
    get secondaryCtaLabel() {
        const h = this._hero();
        if (!h)
            return this.defaults.secondaryCtaLabelEn;
        const key = this.languageService.language() === 'ar' ? 'secondaryCtaLabelAr' : 'secondaryCtaLabelEn';
        return h[key] || this.defaults.secondaryCtaLabelEn;
    }
    get secondaryCtaUrl() {
        return this._hero()?.secondaryCtaUrl || this.defaults.secondaryCtaUrl;
    }
    static { this.ɵfac = function HeroService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HeroService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: HeroService, factory: HeroService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HeroService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
