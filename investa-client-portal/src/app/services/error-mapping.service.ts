import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from './language.service';

export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResult {
  type: 'validation' | 'unauthorized' | 'forbidden' | 'notFound' | 'conflict' | 'businessRule' | 'serverError' | 'network' | 'timeout' | 'offline' | 'unknown';
  message: string;
  fieldErrors: FieldError[];
  statusCode?: number;
}

@Injectable({ providedIn: 'root' })
export class ErrorMappingService {
  private languageService = inject(LanguageService);

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  parseError(error: unknown): ErrorResult {
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error);
    }
    if (error instanceof Error) {
      return { type: 'unknown', message: this.t('errors.unknown'), fieldErrors: [] };
    }
    return { type: 'unknown', message: this.t('errors.unknown'), fieldErrors: [] };
  }

  private parseHttpError(response: HttpErrorResponse): ErrorResult {
    const status = response.status;
    const body = response.error;

    if (status === 0) {
      if (!navigator.onLine) {
        return { type: 'offline', message: this.t('errors.offline'), fieldErrors: [], statusCode: 0 };
      }
      return { type: 'timeout', message: this.t('errors.timeout'), fieldErrors: [], statusCode: 0 };
    }

    const fieldErrors = this.parseFieldErrors(body);
    const message = this.buildMessage(status, body, fieldErrors);

    return {
      type: this.mapErrorType(status, body),
      message,
      fieldErrors,
      statusCode: status,
    };
  }

  private parseFieldErrors(body: any): FieldError[] {
    if (!body) return [];

    if (body.errors) {
      if (Array.isArray(body.errors)) {
        return body.errors.map((e: any) => ({
          field: this.mapFieldName(e.field || e.propertyName || ''),
          message: this.mapValidationMessage(e.field || e.propertyName || '', e.message || ''),
        })).filter(e => e.field || e.message);
      }
      if (typeof body.errors === 'object' && !Array.isArray(body.errors)) {
        const result: FieldError[] = [];
        for (const [field, messages] of Object.entries(body.errors)) {
          const msg = Array.isArray(messages) ? messages[0] : String(messages);
          result.push({
            field: this.mapFieldName(field),
            message: this.mapValidationMessage(field, msg),
          });
        }
        return result;
      }
    }

    if (body.message) {
      const parsed = this.tryParseFluentMessage(body.message);
      if (parsed) return [parsed];
    }

    return [];
  }

  private tryParseFluentMessage(message: string): FieldError | null {
    const match = message.match(/^The field (\w+) must (?:be a string with )?(.+)$/i);
    if (match) {
      const field = match[1];
      return {
        field: this.mapFieldName(field),
        message: this.mapValidationMessage(field, message),
      };
    }
    return null;
  }

  private mapFieldName(field: string): string {
    const key = 'fields.' + field.charAt(0).toLowerCase() + field.slice(1);
    const translated = this.t(key);
    if (translated !== key) return translated;

    const readable = field.replace(/([A-Z])/g, ' $1').trim();
    return readable;
  }

  private mapValidationMessage(field: string, rawMessage: string): string {
    const lower = rawMessage.toLowerCase();

    if (lower.includes('minimum length') || lower.includes('min length') || lower.includes('at least')) {
      const match = rawMessage.match(/(\d+)/);
      const min = match ? match[1] : '';
      return min ? this.t('errors.minLength').replace('{field}', this.mapFieldName(field)).replace('{min}', min) : this.t('errors.invalidFormat').replace('{field}', this.mapFieldName(field));
    }
    if (lower.includes('maximum length') || lower.includes('max length') || lower.includes('at most')) {
      const match = rawMessage.match(/(\d+)/);
      const max = match ? match[1] : '';
      return max ? this.t('errors.maxLength').replace('{field}', this.mapFieldName(field)).replace('{max}', max) : this.t('errors.invalidFormat').replace('{field}', this.mapFieldName(field));
    }
    if (lower.includes('required')) {
      return this.t('errors.required').replace('{field}', this.mapFieldName(field));
    }
    if (lower.includes('duplicate') || lower.includes('already exists') || lower.includes('unique') || lower.includes('already taken')) {
      return this.t('errors.duplicate').replace('{field}', this.mapFieldName(field));
    }
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('invalid phone')) {
      return this.t('errors.invalidPhone');
    }
    if (lower.includes('email') || lower.includes('invalid email')) {
      return this.t('errors.invalidEmail');
    }
    if (lower.includes('otp') || lower.includes('verification code') || lower.includes('verification failed')) {
      return this.t('errors.invalidOtp');
    }
    if (lower.includes('format') || lower.includes('invalid')) {
      return this.t('errors.invalidFormat').replace('{field}', this.mapFieldName(field));
    }

    return this.t('errors.invalidFormat').replace('{field}', this.mapFieldName(field));
  }

  private buildMessage(status: number, body: any, fieldErrors: FieldError[]): string {
    if (fieldErrors.length > 1) {
      return this.t('errors.validationSummary');
    }

    if (body?.message && fieldErrors.length === 0) {
      const lower = body.message.toLowerCase();
      if (lower.includes('validationfailed') || lower.includes('validation failed') || lower.includes('fluentvalidation')) {
        return this.t('errors.validationSummary');
      }
      if (lower.includes('business') || lower.includes('rule')) {
        return this.t('errors.businessRule');
      }
      if (lower.includes('conflict') || lower.includes('already exists') || lower.includes('duplicate')) {
        return this.t('errors.conflict');
      }
    }

    const key = this.statusMessageKey(status);
    return this.t(key);
  }

  private statusMessageKey(status: number): string {
    switch (status) {
      case 400: return 'errors.validationSummary';
      case 401: return 'errors.unauthorized';
      case 403: return 'errors.forbidden';
      case 404: return 'errors.notFound';
      case 409: return 'errors.conflict';
      default:
        if (status >= 500) return 'errors.serverError';
        return 'errors.unknown';
    }
  }

  private mapErrorType(status: number, body: any): ErrorResult['type'] {
    if (body?.message && typeof body.message === 'string') {
      const lower = body.message.toLowerCase();
      if (lower.includes('unauthorized')) return 'unauthorized';
      if (lower.includes('forbidden')) return 'forbidden';
      if (lower.includes('not found')) return 'notFound';
      if (lower.includes('conflict')) return 'conflict';
      if (lower.includes('business') || lower.includes('rule')) return 'businessRule';
    }
    switch (status) {
      case 400: return 'validation';
      case 401: return 'unauthorized';
      case 403: return 'forbidden';
      case 404: return 'notFound';
      case 409: return 'conflict';
      default:
        if (status >= 500) return 'serverError';
        return 'unknown';
    }
  }
}
