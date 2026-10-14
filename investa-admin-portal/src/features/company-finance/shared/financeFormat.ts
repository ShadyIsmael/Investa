/**
 * Shared presentational formatting for company-finance pages.
 * Single home for the helpers previously copy-pasted across
 * FinanceOverviewPage / FinanceReviewQueuePage / FinanceMoneyInPage.
 */
import { formatMoney, defaultIsoCode } from '../../../utils/currency';

/** `value?.trim() || '-'` placeholder used by every finance table. */
export const safeText = (value?: string | null): string => value?.trim() || '-';

/** Alias kept for pages that named it `text`. */
export const text = safeText;

export const dateLabel = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('en-GB') : '-';

export const dateTimeLabel = (value?: string | null): string =>
  value ? new Date(value).toLocaleString('en-GB') : '-';

/** `YYYY-MM-DD` in local time (for `<input type="date">`). */
export const localDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** First day of current month → today. */
export const defaultPeriod = (): { dateFrom: string; dateTo: string } => {
  const today = new Date();
  return {
    dateFrom: localDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    dateTo: localDate(today),
  };
};

/** Bare money amount in the base currency (KPI cards). */
export const amountText = (value: number): string =>
  formatMoney(value, defaultIsoCode(), { bare: true });

export const percentText = (value: number): string =>
  `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;

/**
 * Bilingual category-name resolution shared by overview breakdowns,
 * review-queue details and money-in tables.
 */
export const localizedCategoryName = (
  nameEn: string | null | undefined,
  nameFallback: string | null | undefined,
  nameAr: string | null | undefined,
  isArabic: boolean,
): string => {
  const primary = isArabic ? nameAr || nameEn : nameEn || nameFallback || nameAr;
  return safeText(primary || nameFallback);
};
