import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ApiError } from '@/services/api';

export type FieldErrors = Record<string, string>;

export interface ValidationErrors {
  fieldErrors: FieldErrors;
  formErrors: string[];
}

interface FormValidationContextValue {
  fieldErrors: FieldErrors;
  fieldLabels: Record<string, string>;
}

const FormValidationContext = createContext<FormValidationContextValue>({ fieldErrors: {}, fieldLabels: {} });

const objectValue = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
);

const canonicalFieldSegment = (value: string): string => value
  .replace(/[_\-\s]+(.)/g, (_, character: string) => character.toUpperCase())
  .replace(/^[A-Z]/, character => character.toLowerCase());

export const canonicalFieldName = (value: string): string => value
  .split('.')
  .map(segment => {
    const match = segment.match(/^(.+?)\[(\d+)\]$/);
    return match ? `${canonicalFieldSegment(match[1])}[${match[2]}]` : canonicalFieldSegment(segment);
  })
  .join('.');

const displayFieldName = (value: string): string => value
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/[_\-]+/g, ' ')
  .replace(/\b\w/g, character => character.toUpperCase());

export const normalizeValidationMessage = (message: string, field: string, fieldLabel?: string): string => {
  const label = fieldLabel || displayFieldName(field);
  const maxLength = message.match(/maximum length of (\d+)/i);
  if (maxLength) return `Maximum length is ${maxLength[1]} characters.`;
  if (/must not be empty|is required/i.test(message)) return `${label} is required.`;
  if (/valid fully-qualified http.*URL|valid URL/i.test(message)) return 'Enter a valid URL.';
  if (/valid email address/i.test(message)) return 'Enter a valid email address.';
  if (/must be a non-negative (?:integer|number)/i.test(message)) return 'Enter a non-negative number.';
  return message;
};

const errorPayload = (error: unknown): Record<string, unknown> => {
  if (error && typeof error === 'object' && 'response' in error) {
    return objectValue((error as ApiError).response);
  }
  return objectValue(error);
};

export const getFieldError = (fieldErrors: FieldErrors, field: string): string | undefined => {
  const target = canonicalFieldName(field);
  const key = Object.keys(fieldErrors).find(candidate => canonicalFieldName(candidate) === target);
  return key ? fieldErrors[key] : undefined;
};

export const resolveFieldName = (fieldOrLabel: string, fieldLabels: Record<string, string> = {}): string => {
  const direct = Object.keys(fieldLabels).find(key => canonicalFieldName(key) === canonicalFieldName(fieldOrLabel));
  if (direct) return canonicalFieldName(direct);
  const byLabel = Object.entries(fieldLabels).find(([, label]) => label === fieldOrLabel);
  return byLabel ? canonicalFieldName(byLabel[0]) : canonicalFieldName(fieldOrLabel);
};

export const extractValidationErrors = (
  error: unknown,
  fieldLabels: Record<string, string> = {},
  fallback = 'Unable to save your changes.'
): ValidationErrors => {
  const payload = errorPayload(error);
  const fieldErrors: FieldErrors = {};
  const formErrors: string[] = [];
  const data = objectValue(payload.data);

  for (const [rawField, rawMessages] of Object.entries(data)) {
    const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];
    const message = messages.find(value => typeof value === 'string' && value.trim());
    if (typeof message !== 'string') continue;
    const field = canonicalFieldName(rawField);
    const label = fieldLabels[field] || fieldLabels[rawField];
    fieldErrors[field] = normalizeValidationMessage(message, rawField, label);
  }

  const rawErrors = Array.isArray(payload.errors)
    ? payload.errors.filter(value => typeof value === 'string' && value.trim()) as string[]
    : [];
  rawErrors.forEach(message => {
    const belongsToField = Object.keys(data).some(field => new RegExp(`\\b${field}\\b`, 'i').test(message));
    if (!belongsToField && !Object.values(fieldErrors).includes(message)) formErrors.push(message);
  });

  if (Object.keys(fieldErrors).length === 0) {
    const message = typeof payload.message === 'string' && payload.message.trim() ? payload.message : rawErrors[0];
    formErrors.push(message || fallback);
  } else if (typeof payload.message === 'string' && payload.message.trim() && !/validation/i.test(payload.message)) {
    formErrors.push(payload.message);
  }

  return { fieldErrors, formErrors: Array.from(new Set(formErrors)) };
};

export const FormValidationProvider: React.FC<{ fieldErrors: FieldErrors; fieldLabels?: Record<string, string>; children: React.ReactNode }> = ({ fieldErrors, fieldLabels = {}, children }) => (
  <FormValidationContext.Provider value={{ fieldErrors, fieldLabels }}>{children}</FormValidationContext.Provider>
);

export const useFieldError = (field?: string): string | undefined => {
  const { fieldErrors, fieldLabels } = useContext(FormValidationContext);
  return field ? getFieldError(fieldErrors, resolveFieldName(field, fieldLabels)) : undefined;
};

export const useFieldName = (fieldOrLabel: string): string => {
  const { fieldLabels } = useContext(FormValidationContext);
  return resolveFieldName(fieldOrLabel, fieldLabels);
};

export const FormField: React.FC<{
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactElement<any>;
}> = ({ name, label, required, error, children }) => {
  const id = String(children.props.id || `field-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}`);
  const describedBy = error ? `${id}-error` : children.props['aria-describedby'];
  const className = `${String(children.props.className || '')} ${error ? 'form-control-error' : ''}`.trim();
  return (
    <div className="form-field">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        <span>{label}{required && <span className="ms-1 text-rose-600" aria-hidden="true">*</span>}</span>
        {React.cloneElement(children, {
          id,
          name,
          className,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
          'data-form-field': name,
        })}
      </label>
      {error && <p id={`${id}-error`} className="form-field-error" role="alert">{error}</p>}
    </div>
  );
};

export const FormErrorSummary: React.FC<{
  fieldErrors: FieldErrors;
  formErrors: string[];
  fieldLabels?: Record<string, string>;
}> = ({ fieldErrors, formErrors, fieldLabels = {} }) => {
  const fields = Object.entries(fieldErrors);
  if (!fields.length && !formErrors.length) return null;
  return (
    <div role="alert" aria-live="polite" className="form-error-summary">
      {formErrors.map(message => <p key={message}>{message}</p>)}
      {fields.length > 0 && <ul>{fields.map(([field]) => <li key={field}>{fieldLabels[field] || displayFieldName(field)}</li>)}</ul>}
    </div>
  );
};

export const useFormValidation = (fieldLabels: Record<string, string> = {}) => {
  const [validation, setValidation] = useState<ValidationErrors>({ fieldErrors: {}, formErrors: [] });
  const [focusVersion, setFocusVersion] = useState(0);
  const labels = useMemo(() => fieldLabels, [fieldLabels]);

  useEffect(() => {
    const firstField = Object.keys(validation.fieldErrors)[0];
    if (!firstField || focusVersion === 0 || typeof document === 'undefined') return;
    const element = Array.from(document.querySelectorAll<HTMLElement>('[data-form-field]')).find(candidate => candidate.dataset.formField === firstField);
    if (!element) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }, [focusVersion, validation.fieldErrors]);

  const applyValidation = (error: unknown, fallback?: string) => {
    const result = extractValidationErrors(error, labels, fallback);
    setValidation(result);
    setFocusVersion(version => version + 1);
    return result;
  };

  const setClientFieldError = (field: string, message: string) => {
    setValidation({ fieldErrors: { [canonicalFieldName(field)]: message }, formErrors: [] });
    setFocusVersion(version => version + 1);
  };

  const setClientFormError = (message: string) => {
    setValidation({ fieldErrors: {}, formErrors: [message] });
    setFocusVersion(version => version + 1);
  };

  const clearValidation = () => setValidation({ fieldErrors: {}, formErrors: [] });
  return { ...validation, applyValidation, setClientFieldError, setClientFormError, clearValidation };
};
