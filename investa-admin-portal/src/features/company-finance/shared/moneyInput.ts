/**
 * Shared money/number input helpers for finance create pages.
 * Previously duplicated (with two different local names) in
 * FinanceMoneyInCreatePage and FinanceMoneyInCreatePage-adjacent
 * FinanceMoneyOutCreatePage. The display formatter is intentionally
 * named `formatMoneyInput` so it can never shadow the currency
 * `formatMoney(value, code)` util.
 */

export const MONEY_INPUT = /^\d*(?:\.\d{0,2})?$/;
export const RATE_INPUT = /^\d*(?:\.\d{0,6})?$/;

/** `YYYY-MM-DD` in local time. */
export const todayLocal = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Strip grouping commas; return `null` when the pattern rejects the value. */
export const normalizeNumberInput = (value: string, pattern: RegExp): string | null => {
  const normalized = value.replace(/,/g, '');
  return pattern.test(normalized) ? normalized : null;
};

export const normalizeMoneyInput = (value: string): string | null =>
  normalizeNumberInput(value, MONEY_INPUT);

/** Display grouping for the amount box (`1234.5` → `1,234.5`, empty → `''`). */
export const formatMoneyInput = (value: string): string => {
  if (!value) return '';
  const [whole, fraction] = value.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-US');
  return fraction === undefined ? `${grouped}.00` : `${grouped}.${fraction}`;
};
