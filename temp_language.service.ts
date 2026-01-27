import { Injectable, signal, computed } from '@angular/core';

const TRANSLATIONS = {
  en: {
    header: { nav: { home: 'Home', about: 'About', services: 'Services' }, login: 'Login', signup: 'Sign Up' },
    profile: { title: 'Profile details', saveButton: 'Save Changes' }
  },
  ar: {
    header: { nav: { home: 'الرئيسية', about: 'عنا', services: 'الخدمات' }, login: 'تسجيل الدخول', signup: 'إنشاء حساب' },
    profile: { title: 'Profile details', saveButton: 'حفظ التغييرات' }
  }
};

type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  language = signal<Language>(this.getInitialLanguage());
  private dictionaries: any = TRANSLATIONS;
  dictionary = computed<any>(() => this.dictionaries[this.language()]);
  direction = computed<'ltr'|'rtl'>(() => this.language() === 'ar' ? 'rtl' : 'ltr');

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
