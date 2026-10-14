import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormErrorSummary, FormField, FormValidationProvider, extractValidationErrors, useFormValidation } from './FormValidation';

describe('shared form validation', () => {
  it('maps structured backend field errors and normalizes framework length text', () => {
    const result = extractValidationErrors({
      code: 'INVALID_REQUEST',
      message: 'Validation failed',
      data: { CommercialRegistrationNumber: ['The field CommercialRegistrationNumber must be a string with a maximum length of 80.'] },
    }, { commercialRegistrationNumber: 'Commercial registration number' });

    expect(result.fieldErrors).toEqual({ commercialRegistrationNumber: 'Maximum length is 80 characters.' });
    expect(result.formErrors).toEqual([]);
  });

  it('keeps non-field errors at form level and supports multiple fields', () => {
    const result = extractValidationErrors({
      message: 'Validation failed',
      errors: ['The request cannot be completed.'],
      data: { LegalName: ['The LegalName field is required.'], PrimaryEmail: ['The field PrimaryEmail must be a valid email address.'] },
    });

    expect(Object.keys(result.fieldErrors)).toEqual(['legalName', 'primaryEmail']);
    expect(result.fieldErrors.legalName).toBe('Legal Name is required.');
    expect(result.fieldErrors.primaryEmail).toBe('Enter a valid email address.');
    expect(result.formErrors).toEqual(['The request cannot be completed.']);
  });

  it('renders field error semantics and focuses the first invalid field', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    const Harness: React.FC = () => {
      const validation = useFormValidation({ commercialRegistrationNumber: 'Commercial registration number' });
      return <>
        <button type="button" onClick={() => validation.applyValidation({ data: { commercialRegistrationNumber: ['Too long'] } })}>Validate</button>
        <FormValidationProvider fieldErrors={validation.fieldErrors}>
          <FormErrorSummary fieldErrors={validation.fieldErrors} formErrors={validation.formErrors} />
          <FormField name="commercialRegistrationNumber" label="Commercial registration number" error={validation.fieldErrors.commercialRegistrationNumber}>
            <input />
          </FormField>
        </FormValidationProvider>
      </>;
    };

    render(<Harness />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Validate' }));
    const field = await screen.findByRole('textbox');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('aria-describedby', 'field-commercialRegistrationNumber-error');
    expect(screen.getByText('Too long')).toBeInTheDocument();
    expect(document.activeElement).toBe(field);
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
