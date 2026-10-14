import { useTranslation } from 'react-i18next';

export interface BackendValidationError {
  success: false;
  code: string;
  message: string;
  errors: string[];
  data: Record<string, string[]>;
}

export interface TranslatedError {
  field: string;
  message: string;
  originalMessage: string;
}

const VALIDATION_PATTERNS: Array<{
  pattern: RegExp;
  translationKey: (field: string) => string;
  fallback: (field: string, original: string) => string;
}> = [
  {
    pattern: /^(The\s+)?(\w+)\s+field\s+is\s+not\s+a\s+valid\s+fully-qualified\s+http.*URL\.$/i,
    translationKey: (field) => `validation.${field.toLowerCase()}.invalidUrl`,
    fallback: (field) => `${field}: Invalid URL format. Must start with http://, https://, or ftp://`,
  },
  {
    pattern: /^The\s+field\s+(\w+)\s+must\s+be\s+a\s+string\s+with\s+a\s+maximum\s+length\s+of\s+(\d+)\.$/i,
    translationKey: (field) => `validation.${field.toLowerCase()}.maxLength`,
    fallback: (field, original) => `${field}: Maximum length exceeded.`,
  },
  {
    pattern: /^The\s+(\w+)\s+field\s+is\s+required\.$/i,
    translationKey: (field) => `validation.${field.toLowerCase()}.required`,
    fallback: (field) => `${field}: This field is required.`,
  },
  {
    pattern: /^The\s+(\w+)\s+field\s+must\s+be\s+a\s+(?:non-)?negative\s+(?:integer|number)\.$/i,
    translationKey: (field) => `validation.${field.toLowerCase()}.nonNegative`,
    fallback: (field) => `${field}: Must be a non-negative number.`,
  },
  {
    pattern: /^The\s+(\w+)\s+field\s+must\s+be\s+between\s+(\d+)\s+and\s+(\d+)\.$/i,
    translationKey: (field) => `validation.${field.toLowerCase()}.range`,
    fallback: (field) => `${field}: Value out of range.`,
  },
];

function getFieldNameFromError(error: string): string | null {
  const match = error.match(/(?:The\s+)?(\w+)\s+field/i) || error.match(/field\s+(\w+)\s+must/i);
  if (match) return match[1];
  const fieldMatch = error.match(/^(\w+):/);
  return fieldMatch ? fieldMatch[1] : null;
}

function translateValidationError(t: ReturnType<typeof useTranslation>['t'], error: string): TranslatedError {
  const field = getFieldNameFromError(error) || 'field';

  for (const { pattern, translationKey, fallback } of VALIDATION_PATTERNS) {
    const match = error.match(pattern);
    if (match) {
      const key = translationKey(field);
      const translated = t(key, { defaultValue: fallback(field, error) });
      return { field, message: translated, originalMessage: error };
    }
  }

  return { field, message: t('validation.unknownError', { defaultValue: error }), originalMessage: error };
}

export function parseAndTranslateErrors(
  t: ReturnType<typeof useTranslation>['t'],
  errorResponse: unknown
): TranslatedError[] {
  if (!errorResponse || typeof errorResponse !== 'object') {
    return [{ field: 'general', message: t('validation.unknownError', { defaultValue: 'An unknown error occurred' }), originalMessage: 'Unknown error' }];
  }

  const response = errorResponse as Partial<BackendValidationError>;

  if (response.data && typeof response.data === 'object') {
    const translated: TranslatedError[] = [];
    for (const [field, messages] of Object.entries(response.data)) {
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          translated.push(translateValidationError(t, msg));
        }
      }
    }
    if (translated.length > 0) return translated;
  }

  if (Array.isArray(response.errors)) {
    return response.errors.map((msg) => translateValidationError(t, msg));
  }

  if (typeof response.message === 'string') {
    return [{ field: 'general', message: t(`errors.${response.message}`, { defaultValue: response.message }), originalMessage: response.message }];
  }

  return [{ field: 'general', message: t('validation.unknownError', { defaultValue: 'An unknown error occurred' }), originalMessage: 'Unknown error' }];
}

export function getUserFriendlyErrorMessage(
  t: ReturnType<typeof useTranslation>['t'],
  errorResponse: unknown
): string {
  const translated = parseAndTranslateErrors(t, errorResponse);
  return translated.map((e) => e.message).join('; ');
}

export function isValidationError(error: unknown): error is BackendValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as Record<string, unknown>).code === 'INVALID_REQUEST'
  );
}