import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService, CurrencyReference } from './currency.service';
import { LanguageService } from './language.service';
import { API_BASE } from '../config/api.token';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;
  let languageService: LanguageService;

  const mockCurrencies: CurrencyReference[] = [
    {
      isoCode: 'USD',
      englishName: 'US Dollar',
      arabicName: 'دولار أمريكي',
      symbol: '$',
      decimalDigits: 2,
      isActive: true,
      supportsFunding: true,
      supportsSettlement: true,
      supportsWallet: true
    },
    {
      isoCode: 'EGP',
      englishName: 'Egyptian Pound',
      arabicName: 'جنيه مصري',
      symbol: 'EGP',
      decimalDigits: 2,
      isActive: true,
      supportsFunding: true,
      supportsSettlement: true,
      supportsWallet: true
    },
    {
      isoCode: 'SAR',
      englishName: 'Saudi Riyal',
      arabicName: 'ريال سعودي',
      symbol: 'SAR',
      decimalDigits: 2,
      isActive: true,
      supportsFunding: true,
      supportsSettlement: true,
      supportsWallet: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CurrencyService,
        {
          provide: API_BASE,
          useValue: 'http://localhost:3000'
        },
        {
          provide: LanguageService,
          useValue: {
            language: () => 'en',
            direction: () => 'ltr'
          }
        }
      ]
    });

    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
    languageService = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ensureLoaded', () => {
    it('should load currencies from API', async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;

      expect(service.master()).toEqual(mockCurrencies.filter(c => c.isActive));
      expect(service.ready()).toBe(true);
    });

    it('should handle API response with data wrapper', async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush({ data: mockCurrencies });
      await loadPromise;

      expect(service.master()).toEqual(mockCurrencies.filter(c => c.isActive));
    });

    it('should handle API errors gracefully', async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      await loadPromise;

      expect(service.master()).toEqual([]);
      expect(service.ready()).toBe(false);
    });

    it('should not reload if already loaded', async () => {
      const loadPromise1 = service.ensureLoaded();
      const req1 = httpMock.expectOne('http://localhost:3000/api/currency');
      req1.flush(mockCurrencies);
      await loadPromise1;

      const loadPromise2 = service.ensureLoaded();
      httpMock.expectNone('http://localhost:3000/api/currency');
      await loadPromise2;

      expect(service.master()).toEqual(mockCurrencies.filter(c => c.isActive));
    });
  });

  describe('resolve', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should resolve currency by code', () => {
      const resolved = service.resolve('USD');
      expect(resolved).toEqual(mockCurrencies[0]);
    });

    it('should resolve currency case-insensitively', () => {
      const resolved = service.resolve('usd');
      expect(resolved).toEqual(mockCurrencies[0]);
    });

    it('should return undefined for unknown currency', () => {
      const resolved = service.resolve('XXX');
      expect(resolved).toBeUndefined();
    });

    it('should return undefined for null/empty code', () => {
      expect(service.resolve(null)).toBeUndefined();
      expect(service.resolve('')).toBeUndefined();
      expect(service.resolve(undefined)).toBeUndefined();
    });
  });

  describe('defaultIsoCode', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should return the code if found', () => {
      expect(service.defaultIsoCode('USD')).toBe('USD');
    });

    it('should return first funding currency if code not found', () => {
      expect(service.defaultIsoCode('XXX')).toBe('USD');
    });

    it('should return first active currency if no funding currency', () => {
      const noFundingCurrencies = mockCurrencies.map(c => ({ ...c, supportsFunding: false }));
      service['_master'].set(noFundingCurrencies);
      expect(service.defaultIsoCode('XXX')).toBe('USD');
    });

    it('should return EGP as fallback when no currencies loaded', () => {
      service['_master'].set([]);
      expect(service.defaultIsoCode('XXX')).toBe('EGP');
    });
  });

  describe('symbol', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should return symbol for known currency', () => {
      expect(service.symbol('USD')).toBe('$');
      expect(service.symbol('EGP')).toBe('EGP');
    });

    it('should return code for unknown currency', () => {
      expect(service.symbol('XXX')).toBe('XXX');
    });

    it('should return empty string for null/empty code', () => {
      expect(service.symbol(null)).toBe('');
      expect(service.symbol('')).toBe('');
    });
  });

  describe('decimalDigits', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should return decimal digits for known currency', () => {
      expect(service.decimalDigits('USD')).toBe(2);
    });

    it('should default to 2 for unknown currency', () => {
      expect(service.decimalDigits('XXX')).toBe(2);
    });

    it('should clamp decimal digits between 0 and 6', () => {
      const extremeCurrencies: CurrencyReference[] = [
        { ...mockCurrencies[0], decimalDigits: -1 },
        { ...mockCurrencies[0], decimalDigits: 10 }
      ];
      service['_master'].set(extremeCurrencies);
      expect(service.decimalDigits('USD')).toBe(0);
      expect(service.decimalDigits('USD')).toBeGreaterThanOrEqual(0);
      expect(service.decimalDigits('USD')).toBeLessThanOrEqual(6);
    });
  });

  describe('englishName', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should return English name for known currency', () => {
      expect(service.englishName('USD')).toBe('US Dollar');
    });

    it('should return code for unknown currency', () => {
      expect(service.englishName('XXX')).toBe('XXX');
    });
  });

  describe('arabicName', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should return Arabic name for known currency', () => {
      expect(service.arabicName('USD')).toBe('دولار أمريكي');
    });

    it('should return code for unknown currency', () => {
      expect(service.arabicName('XXX')).toBe('XXX');
    });
  });

  describe('format', () => {
    beforeEach(async () => {
      const loadPromise = service.ensureLoaded();
      const req = httpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;
    });

    it('should format amount with symbol', () => {
      const formatted = service.format(1234.56, 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,234.56');
    });

    it('should format amount with ISO code when no symbol', () => {
      const formatted = service.format(1234.56, 'XXX');
      expect(formatted).toContain('XXX');
      expect(formatted).toContain('1,234.56');
    });

    it('should format without symbol when noSymbol option is true', () => {
      const formatted = service.format(1234.56, 'USD', { noSymbol: true });
      expect(formatted).not.toContain('$');
      expect(formatted).toContain('USD');
    });

    it('should handle null/undefined amounts', () => {
      expect(service.format(null, 'USD')).toBe('-');
      expect(service.format(undefined, 'USD')).toBe('-');
    });

    it('should handle invalid amounts', () => {
      expect(service.format(NaN, 'USD')).toBe('-');
      expect(service.format(Infinity, 'USD')).toBe('-');
    });

    it('should use correct decimal digits', () => {
      const customCurrency: CurrencyReference = {
        ...mockCurrencies[0],
        isoCode: 'JPY',
        decimalDigits: 0
      };
      service['_master'].set([...mockCurrencies, customCurrency]);
      const formatted = service.format(1234.56, 'JPY');
      expect(formatted).toContain('1,235');
    });

    it('should handle Arabic language with Arabic-Indic digits', async () => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          CurrencyService,
          { provide: API_BASE, useValue: 'http://localhost:3000' },
          {
            provide: LanguageService,
            useValue: {
              language: () => 'ar',
              direction: () => 'rtl'
            }
          }
        ]
      });

      const arService = TestBed.inject(CurrencyService);
      const arHttpMock = TestBed.inject(HttpTestingController);
      const arLanguageService = TestBed.inject(LanguageService);

      const loadPromise = arService.ensureLoaded();
      const req = arHttpMock.expectOne('http://localhost:3000/api/currency');
      req.flush(mockCurrencies);
      await loadPromise;

      const formatted = arService.format(1234.56, 'USD');
      expect(formatted).toContain('١٬٢٣٤٫٥٦');
    });
  });
});
