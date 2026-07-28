import { InjectionToken } from '@angular/core';

export type TranslationDictionary = Record<string, unknown>;
export interface TranslationDictionaries {
  en: TranslationDictionary;
  ar: TranslationDictionary;
}

export const TRANSLATION_DICTIONARIES = new InjectionToken<TranslationDictionaries>('translation dictionaries');

const visibleFailureDictionary: TranslationDictionary = { __translationLoadFailed: true };

export async function preloadTranslationDictionaries(): Promise<TranslationDictionaries> {
  const load = async (language: 'en' | 'ar'): Promise<TranslationDictionary> => {
    const response = await fetch(`/assets/i18n/${language}.json`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Translation request failed: ${language} (${response.status})`);
    return response.json() as Promise<TranslationDictionary>;
  };

  const [enResult, arResult] = await Promise.allSettled([load('en'), load('ar')]);
  const en = enResult.status === 'fulfilled' ? enResult.value : undefined;
  const ar = arResult.status === 'fulfilled' ? arResult.value : undefined;

  return {
    en: en ?? ar ?? visibleFailureDictionary,
    ar: ar ?? en ?? visibleFailureDictionary
  };
}
