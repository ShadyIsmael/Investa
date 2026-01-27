import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map } from 'rxjs';

type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private http = inject(HttpClient);
  
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
