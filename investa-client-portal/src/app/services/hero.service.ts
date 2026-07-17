import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeroContent } from '../models/hero.model';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);

  private _hero = signal<HeroContent | null>(null);
  readonly hero = this._hero.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private defaults: HeroContent = {
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

  load() {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<HeroContent>('/api/hero').subscribe({
      next: (data) => {
        if (data && data.enabled) {
          this._hero.set({ ...this.defaults, ...data });
        } else {
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

  get title(): string {
    const h = this._hero();
    if (!h) return this.defaults.titleEn;
    const key = this.languageService.language() === 'ar' ? 'titleAr' : 'titleEn';
    return (h as any)[key] || this.defaults.titleEn;
  }

  get subtitle(): string {
    const h = this._hero();
    if (!h) return this.defaults.subtitleEn;
    const key = this.languageService.language() === 'ar' ? 'subtitleAr' : 'subtitleEn';
    return (h as any)[key] || this.defaults.subtitleEn;
  }

  get primaryCtaLabel(): string {
    const h = this._hero();
    if (!h) return this.defaults.primaryCtaLabelEn;
    const key = this.languageService.language() === 'ar' ? 'primaryCtaLabelAr' : 'primaryCtaLabelEn';
    return (h as any)[key] || this.defaults.primaryCtaLabelEn;
  }

  get primaryCtaUrl(): string {
    return this._hero()?.primaryCtaUrl || this.defaults.primaryCtaUrl;
  }

  get secondaryCtaLabel(): string {
    const h = this._hero();
    if (!h) return this.defaults.secondaryCtaLabelEn;
    const key = this.languageService.language() === 'ar' ? 'secondaryCtaLabelAr' : 'secondaryCtaLabelEn';
    return (h as any)[key] || this.defaults.secondaryCtaLabelEn;
  }

  get secondaryCtaUrl(): string {
    return this._hero()?.secondaryCtaUrl || this.defaults.secondaryCtaUrl;
  }
}
