import { TestBed } from '@angular/core/testing';
import { CurrencyDisplayPipe } from './currency-display.pipe';
import { CurrencyService } from '../services/currency.service';

describe('CurrencyDisplayPipe', () => {
  let pipe: CurrencyDisplayPipe;
  let currencyService: jasmine.SpyObj<CurrencyService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CurrencyService', ['format']);

    TestBed.configureTestingModule({
      providers: [
        CurrencyDisplayPipe,
        { provide: CurrencyService, useValue: spy }
      ]
    });

    pipe = TestBed.inject(CurrencyDisplayPipe);
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
  });

  it('should create pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform number with currency code', () => {
    currencyService.format.and.returnValue('$1,234.56');
    const result = pipe.transform(1234.56, 'USD');
    expect(result).toBe('$1,234.56');
    expect(currencyService.format).toHaveBeenCalledWith(1234.56, 'USD');
  });

  it('should transform string number to number', () => {
    currencyService.format.and.returnValue('$1,234.56');
    const result = pipe.transform('1234.56', 'USD');
    expect(result).toBe('$1,234.56');
    expect(currencyService.format).toHaveBeenCalledWith(1234.56, 'USD');
  });

  it('should handle null value', () => {
    currencyService.format.and.returnValue('-');
    const result = pipe.transform(null, 'USD');
    expect(result).toBe('-');
    expect(currencyService.format).toHaveBeenCalledWith(0, 'USD');
  });

  it('should handle undefined value', () => {
    currencyService.format.and.returnValue('-');
    const result = pipe.transform(undefined, 'USD');
    expect(result).toBe('-');
    expect(currencyService.format).toHaveBeenCalledWith(NaN, 'USD');
  });

  it('should handle zero value', () => {
    currencyService.format.and.returnValue('$0.00');
    const result = pipe.transform(0, 'USD');
    expect(result).toBe('$0.00');
    expect(currencyService.format).toHaveBeenCalledWith(0, 'USD');
  });

  it('should handle negative values', () => {
    currencyService.format.and.returnValue('-$1,234.56');
    const result = pipe.transform(-1234.56, 'USD');
    expect(result).toBe('-$1,234.56');
    expect(currencyService.format).toHaveBeenCalledWith(-1234.56, 'USD');
  });

  it('should work without currency code', () => {
    currencyService.format.and.returnValue('1,234.56');
    const result = pipe.transform(1234.56);
    expect(result).toBe('1,234.56');
    expect(currencyService.format).toHaveBeenCalledWith(1234.56, undefined);
  });

  it('should work with null currency code', () => {
    currencyService.format.and.returnValue('1,234.56');
    const result = pipe.transform(1234.56, null);
    expect(result).toBe('1,234.56');
    expect(currencyService.format).toHaveBeenCalledWith(1234.56, null);
  });

  it('should handle large numbers', () => {
    currencyService.format.and.returnValue('$1,000,000.00');
    const result = pipe.transform(1000000, 'USD');
    expect(result).toBe('$1,000,000.00');
    expect(currencyService.format).toHaveBeenCalledWith(1000000, 'USD');
  });

  it('should handle decimal values', () => {
    currencyService.format.and.returnValue('$1,234.5678');
    const result = pipe.transform(1234.5678, 'USD');
    expect(result).toBe('$1,234.5678');
    expect(currencyService.format).toHaveBeenCalledWith(1234.5678, 'USD');
  });

  it('should handle scientific notation strings', () => {
    currencyService.format.and.returnValue('$1,234.56');
    const result = pipe.transform('1.23456e3', 'USD');
    expect(result).toBe('$1,234.56');
    expect(currencyService.format).toHaveBeenCalledWith(1234.56, 'USD');
  });

  it('should handle invalid string numbers', () => {
    currencyService.format.and.returnValue('-');
    const result = pipe.transform('invalid', 'USD');
    expect(result).toBe('-');
    expect(currencyService.format).toHaveBeenCalledWith(NaN, 'USD');
  });
});
