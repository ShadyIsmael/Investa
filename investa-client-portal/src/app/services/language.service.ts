import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { SettingsService } from './settings.service';
import { TRANSLATION_DICTIONARIES } from '../i18n/translation-dictionaries';

type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private settingsService = inject(SettingsService);
  private dictionaries = signal(inject(TRANSLATION_DICTIONARIES));
  
  language = signal<Language>(this.getInitialLanguage());
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
