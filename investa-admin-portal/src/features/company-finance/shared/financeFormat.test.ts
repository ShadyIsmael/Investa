import { describe, expect, it } from 'vitest';
import {
  amountText,
  dateLabel,
  dateTimeLabel,
  defaultPeriod,
  localDate,
  localizedCategoryName,
  percentText,
  safeText,
  text,
} from './financeFormat';

describe('financeFormat', () => {
  it('safeText falls back to dash for empty values', () => {
    expect(safeText('  hello  ')).toBe('hello');
    expect(safeText('')).toBe('-');
    expect(safeText(null)).toBe('-');
    expect(safeText(undefined)).toBe('-');
    expect(text(null)).toBe('-');
  });

  it('dateLabel/dateTimeLabel use en-GB and dash fallback', () => {
    expect(dateLabel('2026-03-05T10:00:00Z')).toContain('2026');
    expect(dateLabel(undefined)).toBe('-');
    expect(dateTimeLabel(null)).toBe('-');
  });

  it('localDate formats YYYY-MM-DD and defaultPeriod spans month start to today', () => {
    expect(localDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    const period = defaultPeriod();
    expect(period.dateFrom.slice(8)).toBe('01');
    expect(period.dateFrom <= period.dateTo).toBe(true);
  });

  it('amountText/percentText format in latin digits', () => {
    expect(amountText(1234.5)).toContain('1,234');
    expect(percentText(12.345)).toBe('12.35%');
  });

  it('localizedCategoryName prefers the active locale with fallbacks', () => {
    expect(localizedCategoryName('Travel', 'Travel', 'سفر', true)).toBe('سفر');
    expect(localizedCategoryName('Travel', 'Travel', null, false)).toBe('Travel');
    expect(localizedCategoryName(null, null, null, false)).toBe('-');
  });
});
