import { Injectable, signal, computed } from '@angular/core';

const TRANSLATIONS = {
  en: { language: { toggle: 'العربية' }, adminNav: { submitInvestment: 'Submit Investment' }, buttons: { back: 'Back', next: 'Next' } },
  ar: { language: { toggle: 'English' }, adminNav: { submitInvestment: 'تقديم استثمار' }, buttons: { back: 'رجوع', next: 'التالي' } }
};

type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language = signal<Language>(this.getInitialLanguage());
  private dictionaries: any = TRANSLATIONS;
  dictionary = computed<any>(() => this.dictionaries[this.language()]);
  direction = computed<'ltr' | 'rtl'>(() => this.language() === 'ar' ? 'rtl' : 'ltr');

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem('investa-lang');
    return (saved === 'ar' || saved === 'en') ? (saved as Language) : 'en';
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
    localStorage.setItem('investa-lang', lang);
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

