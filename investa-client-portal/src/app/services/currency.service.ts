import { Injectable, inject, signal, computed, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { LanguageService } from './language.service';

export interface CurrencyReference {
  isoCode: string;
  englishName: string;
  arabicName: string;
  symbol: string;
  decimalDigits: number;
  isActive: boolean;
  supportsFunding: boolean;
  supportsSettlement: boolean;
  supportsWallet: boolean;
}

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * System-wide shared currency display formatter.
 *
 * Currency symbols, bilingual names, decimal-digit rules and supported capabilities
 * are resolved ONLY from the active Currency Master endpoint (GET /api/currency).
 * No component may hardcode symbols/codes or use a generic number pipe for money.
 *
 * Amounts converted from an investor's preferred currency are approximate display
 * values only; the official amounts always remain in the Opportunity funding currency.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);

  private _master = signal<CurrencyReference[]>([]);
  private loadPromise: Promise<void> | null = null;

  readonly master = this._master.asReadonly();
  readonly ready = computed(() => this._master().length > 0);

  constructor(@Inject(API_BASE) private apiBase: string) {}

  /** Loads the active Currency Master once and caches it. */
  ensureLoaded(): Promise<void> {
    if (this._master().length > 0) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = this.loadCurrencies();
    return this.loadPromise;
  }

  private async loadCurrencies(): Promise<void> {
    try {
      const raw = await firstValueFrom(
        this.http.get<CurrencyReference[] | { data: CurrencyReference[] }>(`${this.apiBase}/api/currency`)
      );
      const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
      this._master.set(Array.isArray(list) ? list.filter(c => c.isActive) : []);
    } catch {
      this._master.set([]);
    }
  }

  private find(code?: string | null): CurrencyReference | undefined {
    const c = code?.trim().toUpperCase();
    if (!c) return undefined;
    return this._master().find(x => x.isoCode.toUpperCase() === c);
  }

  resolve(code?: string | null): CurrencyReference | undefined {
    return this.find(code);
  }

  /** Platform default ISO code (first active funding currency, else 'EGP'). */
  defaultIsoCode(code?: string | null): string {
    const found = this.find(code);
    if (found) return found.isoCode;
    return this.master().find(c => c.supportsFunding)?.isoCode ?? this.master()[0]?.isoCode ?? 'EGP';
  }

  symbol(code?: string | null): string {
    return this.find(code)?.symbol ?? code ?? '';
  }

  decimalDigits(code?: string | null): number {
    const found = this.find(code);
    return found ? Math.min(Math.max(found.decimalDigits, 0), 6) : 2;
  }

  englishName(code?: string | null): string {
    return this.find(code)?.englishName ?? code ?? '';
  }

  arabicName(code?: string | null): string {
    return this.find(code)?.arabicName ?? code ?? '';
  }

  /**
   * Formats an amount using the Currency Master metadata. Uses the configured UI
   * language for localized grouping/decimal separators and Arabic-Indic digits.
   */
  format(amount: number | null | undefined, code?: string | null, options?: { noSymbol?: boolean }): string {
    const value = Number(amount);
    if (!Number.isFinite(value)) return '-';
    const resolved = this.find(code);
    const iso = resolved?.isoCode ?? (code?.trim().toUpperCase() || '');
    const digits = this.decimalDigits(iso);
    const isArabic = this.languageService.language() === 'ar';

    const nf = new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      useGrouping: true
    });
    let numberText = nf.format(value);
    if (isArabic) numberText = this.toArabicIndic(numberText);

    if (options?.noSymbol || !resolved?.symbol) return iso ? `${numberText} ${iso}` : numberText;
    return `${resolved.symbol}\u00a0${numberText}`;
  }

  private toArabicIndic(value: string): string {
    let out = '';
    for (const ch of value) {
      if (ch >= '0' && ch <= '9') out += ARABIC_INDIC_DIGITS[ch.charCodeAt(0) - 48];
      else out += ch;
    }
    return out;
  }
}
