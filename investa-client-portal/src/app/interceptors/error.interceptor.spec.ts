import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';
import { ErrorMappingService, ErrorResult } from '../services/error-mapping.service';
import { LanguageService } from '../services/language.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { TRANSLATION_DICTIONARIES } from '../i18n/translation-dictionaries';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let errorMapping: ErrorMappingService;

  const mockDictionaries = {
    en: {
      errors: {
        unknown: 'An unexpected error occurred.',
        validationSummary: 'Please fix the highlighted fields.',
        unauthorized: 'Session expired. Please log in again.',
        serverError: 'Server error.',
        required: '{field} is required.',
      },
      fields: {},
    },
    ar: { errors: { unknown: 'حدث خطأ غير متوقع.' }, fields: {} },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TRANSLATION_DICTIONARIES, useValue: mockDictionaries },
        ErrorInterceptor,
      ],
    });
    interceptor = TestBed.inject(ErrorInterceptor);
    errorMapping = TestBed.inject(ErrorMappingService);
  });

  it('should transform HttpErrorResponse into ErrorResult', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: { message: 'Unauthorized' } });

    const next: HttpHandler = {
      handle: () => throwError(() => httpError),
    };

    interceptor.intercept(req, next).subscribe({
      error: (err: any) => {
        expect(err.fieldErrors).toBeDefined();
        expect(err.type).toBe('unauthorized');
        done();
      },
    });
  });

  it('should re-throw existing ErrorResult without mapping', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const existing: ErrorResult = { type: 'validation', message: 'Validation', fieldErrors: [{ field: 'test', message: 'Error' }] };

    const next: HttpHandler = {
      handle: () => throwError(() => existing),
    };

    interceptor.intercept(req, next).subscribe({
      error: (err: any) => {
        expect(err.type).toBe('validation');
        expect(err.fieldErrors.length).toBe(1);
        done();
      },
    });
  });

  it('should pass through non-error HTTP events', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandler = {
      handle: () => of({ type: 0 } as HttpEvent<any>),
    };

    interceptor.intercept(req, next).subscribe({
      next: (event) => {
        expect(event.type).toBe(0);
        done();
      },
    });
  });
});
