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
  
  transform(key: string): string {
    const currentDictionary = this.languageService.dictionary();
    return get(currentDictionary, key, key);
  }
}