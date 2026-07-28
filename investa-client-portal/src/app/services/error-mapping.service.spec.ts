import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMappingService } from './error-mapping.service';
import { LanguageService } from './language.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { TRANSLATION_DICTIONARIES } from '../i18n/translation-dictionaries';

describe('ErrorMappingService', () => {
  let service: ErrorMappingService;
  let languageService: LanguageService;

  const mockDictionaries = {
    en: {
      errors: {
        unknown: 'An unexpected error occurred.',
        validationSummary: 'Please fix the highlighted fields.',
        unauthorized: 'Session expired. Please log in again.',
        forbidden: 'No permission.',
        notFound: 'Not found.',
        conflict: 'Conflict.',
        businessRule: 'Business rule violated.',
        serverError: 'Server error.',
        timeout: 'Request timed out.',
        offline: 'You appear to be offline.',
        required: '{field} is required.',
        minLength: '{field} must be at least {min} characters.',
        maxLength: '{field} must be at most {max} characters.',
        invalidFormat: '{field} is invalid.',
        invalidEmail: 'Invalid email.',
        invalidPhone: 'Invalid phone.',
        invalidOtp: 'Invalid or expired verification code.',
        duplicate: '{field} already exists.',
      },
      fields: {
        phoneNumber: 'Phone Number',
        password: 'Password',
        firstName: 'First Name',
      },
    },
    ar: {
      errors: { unknown: 'حدث خطأ غير متوقع.' },
      fields: {},
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TRANSLATION_DICTIONARIES, useValue: mockDictionaries },
      ],
    });
    service = TestBed.inject(ErrorMappingService);
    languageService = TestBed.inject(LanguageService);
  });

  describe('validation error (400) with field errors array', () => {
    it('should parse FluentValidation-style field errors', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'ValidationFailed',
          errors: [
            { field: 'PhoneNumber', message: 'The field PhoneNumber must be a string with a minimum length of 10' },
            { field: 'Password', message: 'The field Password is required' },
          ],
        },
      });

      const result = service.parseError(httpError);
      expect(result.type).toBe('validation');
      expect(result.fieldErrors.length).toBe(2);
      expect(result.fieldErrors[0].field).toBe('Phone Number');
      expect(result.fieldErrors[1].message).toContain('required');
    });
  });

  describe('validation error with errors object', () => {
    it('should parse object-style field errors', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'ValidationFailed',
          errors: {
            PhoneNumber: ['The PhoneNumber field is required.'],
            Password: ['Password must be at least 8 characters.'],
          },
        },
      });

      const result = service.parseError(httpError);
      expect(result.type).toBe('validation');
      expect(result.fieldErrors.length).toBe(2);
      expect(result.fieldErrors[0].field).toBe('Phone Number');
    });
  });

  describe('401 unauthorized', () => {
    it('should return unauthorized type', () => {
      const httpError = new HttpErrorResponse({ status: 401, error: { message: 'Unauthorized' } });
      const result = service.parseError(httpError);
      expect(result.type).toBe('unauthorized');
      expect(result.message).toBe('Session expired. Please log in again.');
      expect(result.fieldErrors.length).toBe(0);
    });
  });

  describe('403 forbidden', () => {
    it('should return forbidden type', () => {
      const httpError = new HttpErrorResponse({ status: 403, error: { message: 'Forbidden' } });
      const result = service.parseError(httpError);
      expect(result.type).toBe('forbidden');
    });
  });

  describe('409 conflict', () => {
    it('should return conflict type', () => {
      const httpError = new HttpErrorResponse({ status: 409, error: { message: 'Conflict' } });
      const result = service.parseError(httpError);
      expect(result.type).toBe('conflict');
    });
  });

  describe('500 server error', () => {
    it('should return serverError type', () => {
      const httpError = new HttpErrorResponse({ status: 500, error: { message: 'Internal server error' } });
      const result = service.parseError(httpError);
      expect(result.type).toBe('serverError');
      expect(result.message).toBe('Server error.');
    });
  });

  describe('network failure (status 0)', () => {
    it('should return timeout type when online', () => {
      spyOnProperty(navigator, 'onLine').and.returnValue(true);
      const httpError = new HttpErrorResponse({ status: 0, error: new ProgressEvent('timeout') });
      const result = service.parseError(httpError);
      expect(result.type).toBe('timeout');
    });

    it('should return offline type when offline', () => {
      spyOnProperty(navigator, 'onLine').and.returnValue(false);
      const httpError = new HttpErrorResponse({ status: 0, error: new ProgressEvent('offline') });
      const result = service.parseError(httpError);
      expect(result.type).toBe('offline');
    });
  });

  describe('404 not found', () => {
    it('should return notFound type', () => {
      const httpError = new HttpErrorResponse({ status: 404, error: { message: 'Not Found' } });
      const result = service.parseError(httpError);
      expect(result.type).toBe('notFound');
    });
  });

  describe('FluentValidation single message', () => {
    it('should parse a single FluentValidation message', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { message: 'The field ShortDescription must be a string with a minimum length of 10 and a maximum length of 500.' },
      });
      const result = service.parseError(httpError);
      expect(result.type).toBe('validation');
      expect(result.fieldErrors.length).toBe(1);
      expect(result.fieldErrors[0].field).toBe('Short Description');
    });
  });

  describe('non-HTTP error (Error object)', () => {
    it('should return unknown type for generic Error', () => {
      const result = service.parseError(new Error('Something went wrong'));
      expect(result.type).toBe('unknown');
      expect(result.fieldErrors.length).toBe(0);
    });
  });

  describe('field name mapping', () => {
    it('should map camelCase fields to readable names via dictionary', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: {
          errors: [{ field: 'PhoneNumber', message: 'Required' }],
        },
      });
      const result = service.parseError(httpError);
      expect(result.fieldErrors[0].field).toBe('Phone Number');
    });

    it('should fall back to readable words for unmapped fields', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: {
          errors: [{ field: 'SomeArbitraryField', message: 'Required' }],
        },
      });
      const result = service.parseError(httpError);
      expect(result.fieldErrors[0].field).toBe('Some Arbitrary Field');
    });
  });
});
