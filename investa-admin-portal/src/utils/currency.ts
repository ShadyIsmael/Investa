/**
 * System-wide shared currency display formatter (admin portal).
 *
 * Currency symbols, bilingual names, decimal-digit rules and supported
 * capabilities are resolved ONLY from the active Currency Master endpoint
 * (GET /api/currency). No component may hardcode symbols/codes or use a
 * generic number formatter for money.
 */
import { api } from '../services/api';
import i18n from '../i18n/config';

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

let master: CurrencyReference[] = [];
let loadPromise: Promise<void> | null = null;

/** Loads the active Currency Master once and caches it. */
export async function ensureCurrenciesLoaded(): Promise<void> {
  if (master.length > 0) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await api.get<CurrencyReference[] | { data?: CurrencyReference[] }>('/api/currency');
      const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
      master = (Array.isArray(list) ? list : []).filter(c => c.isActive);
    } catch {
      master = [];
    } finally {
      loadPromise = null;
    }
  })();
  return loadPromise;
}

/** Active master list (already cached; call ensureCurrenciesLoaded first if needed). */
export function getCurrencies(): CurrencyReference[] {
  return master;
}

function find(code?: string | null): CurrencyReference | undefined {
  const c = (code || '').trim().toUpperCase();
  if (!c) return undefined;
  return master.find(x => x.isoCode.toUpperCase() === c);
}

export function currencySymbol(code?: string | null): string {
  return find(code)?.symbol ?? code ?? '';
}

export function decimalDigits(code?: string | null): number {
  const f = find(code);
  return f ? Math.min(Math.max(f.decimalDigits, 0), 6) : 2;
}

/** Language-aware display name from the Currency Master. */
export function currencyName(code?: string | null): string {
  const f = find(code);
  if (f) return i18n.language === 'ar' ? f.arabicName : f.englishName;
  return code ?? '';
}

/** Platform default ISO code (first active funding currency, else 'EGP'). */
export function defaultIsoCode(code?: string | null): string {
  const f = find(code);
  if (f) return f.isoCode;
  return master.find(c => c.supportsFunding)?.isoCode ?? master[0]?.isoCode ?? 'EGP';
}

function toArabicIndic(value: string): string {
  let out = '';
  for (const ch of value) {
    if (ch >= '0' && ch <= '9') out += ARABIC_INDIC_DIGITS[ch.charCodeAt(0) - 48];
    else out += ch;
  }
  return out;
}

export interface FormatMoneyOptions {
  /** Suppress the currency symbol (still appends the ISO code when known). */
  noSymbol?: boolean;
  /** Bare number only — no symbol and no ISO code (used when a currency label is shown separately). */
  bare?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formats an amount using the Currency Master metadata. Uses the configured UI
 * language for localized grouping/decimal separators and Arabic-Indic digits.
 * When the code is unknown, falls back to the plain grouped number.
 */
export function formatMoney(value: number | null | undefined, code?: string | null, options?: FormatMoneyOptions): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const resolved = find(code);
  const iso = resolved?.isoCode ?? (code || '').trim().toUpperCase();
  const digits = options?.maximumFractionDigits ?? decimalDigits(iso);
  const minDigits = options?.minimumFractionDigits ?? digits;
  const isArabic = i18n.language === 'ar';

  const nf = new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: digits,
    useGrouping: true
  });
  let text = nf.format(num);
  if (isArabic) text = toArabicIndic(text);

  if (options?.bare) return text;
  if (options?.noSymbol || !resolved?.symbol) return iso ? `${text} ${iso}` : text;
  return `${resolved.symbol}\u00a0${text}`;
}
