import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { get } from 'lodash-es';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);
  
  transform(key: string, params?: Record<string, string | number>): string {
    const currentLanguage = this.languageService.language();
    const currentDictionary = this.languageService.dictionary();
    // Return the key if dictionary is empty (still loading)
    if (!currentDictionary || Object.keys(currentDictionary).length === 0) {
      return key;
    }
    let value = get(currentDictionary, key, key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.split(`{{${k}}}`).join(String(v));
      }
    }
    return value;
  }
}