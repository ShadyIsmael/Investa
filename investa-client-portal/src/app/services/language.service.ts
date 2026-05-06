import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map } from 'rxjs';
import { SettingsService } from './settings.service';

type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private http = inject(HttpClient);
  private settingsService = inject(SettingsService);
  
  language = signal<Language>(this.getInitialLanguage());
  private dictionaries = toSignal(
    forkJoin({
      en: this.http.get('/assets/i18n/en.json'),
      ar: this.http.get('/assets/i18n/ar.json')
    }),
    { initialValue: { en: {}, ar: {} } }
  );
  
  dictionary = computed<any>(() => this.dictionaries()[this.language()]);
  direction = computed<'ltr'|'rtl'>(() => this.language() === 'ar' ? 'rtl' : 'ltr');

  constructor() {
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

  private getInitialLanguage(): Language {
    const settingsLanguage = this.settingsService.language();
    if (settingsLanguage === 'en' || settingsLanguage === 'ar') {
      return settingsLanguage;
    }
    const saved = localStorage.getItem('investa-lang');
    return (saved === 'ar' || saved === 'en') ? (saved as Language) : 'en';
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
    localStorage.setItem('investa-lang', lang);
    this.settingsService.setLanguage(lang);
  }

  toggleLanguage() {
    this.setLanguage(this.language() === 'en' ? 'ar' : 'en');
  }

  translate(path: string) {
    const parts = path.split('.');
    let cur: any = this.dictionary();
    for (const p of parts) { cur = cur?.[p]; if (!cur) return path; }
    return cur as string;
  }
}
