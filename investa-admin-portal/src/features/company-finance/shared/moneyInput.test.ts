import { describe, expect, it } from 'vitest';
import {
  formatMoneyInput,
  MONEY_INPUT,
  normalizeMoneyInput,
  normalizeNumberInput,
  RATE_INPUT,
  todayLocal,
} from './moneyInput';

describe('moneyInput', () => {
  it('accepts up to 2 decimals for money and 6 for rates', () => {
    expect(normalizeMoneyInput('1,234.56')).toBe('1234.56');
    expect(normalizeMoneyInput('12.345')).toBeNull();
    expect(normalizeNumberInput('1.123456', RATE_INPUT)).toBe('1.123456');
    expect(normalizeNumberInput('1.1234567', RATE_INPUT)).toBeNull();
    expect(MONEY_INPUT.test('')).toBe(true);
  });

  it('formatMoneyInput groups thousands and keeps the typed fraction', () => {
    expect(formatMoneyInput('')).toBe('');
    expect(formatMoneyInput('1234')).toBe('1,234.00');
    expect(formatMoneyInput('1234.5')).toBe('1,234.5');
  });

  it('todayLocal returns YYYY-MM-DD', () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
