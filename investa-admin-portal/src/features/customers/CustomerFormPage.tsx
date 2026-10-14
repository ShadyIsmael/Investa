import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { Icon } from '@/components/common/Icons';
import { ApiError } from '@/services/api';
import { FormErrorSummary, FormValidationProvider, FormField, useFieldError, useFormValidation } from '@/components/common/FormValidation';
import { customerService, type CustomerDetail, type CustomerInput, type CustomerType } from './customerService';

const emptyForm: CustomerInput = { type: 'Organization', legalName: '', displayName: '', taxId: '', commercialRegistrationNumber: '', primaryEmail: '', primaryPhone: '', website: '', country: '', city: '', address: '', notes: '' };
const inputClass = 'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const CustomerFormPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const isEdit = Boolean(customerId);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const fieldLabels = {
    legalName: t('centralAdmin.customers.form.legalName'),
    displayName: t('centralAdmin.customers.form.displayName'),
    commercialRegistrationNumber: t('centralAdmin.customers.form.registrationNumber'),
    primaryEmail: t('centralAdmin.customers.form.email'),
    website: t('centralAdmin.customers.form.website'),
  };
  const validation = useFormValidation(fieldLabels);

  useEffect(() => {
    if (!customerId) return;
    let active = true;
    void customerService.get(customerId).then(customer => active && setForm(toInput(customer))).catch(reason => active && setError(reason)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [customerId]);

  const update = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.legalName.trim()) { validation.setClientFieldError('legalName', t('centralAdmin.customers.validation.names')); return; }
    if (!form.displayName.trim()) { validation.setClientFieldError('displayName', t('centralAdmin.customers.validation.names')); return; }
    setSaving(true); validation.clearValidation();
    try { const result = isEdit && customerId ? await customerService.update(customerId, form) : await customerService.create(form); navigate(`/admin/customers/${result.id}`, { replace: true }); }
    catch (reason) { validation.applyValidation(reason, t('centralAdmin.customers.errors.saveFailed')); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="workspace-page space-y-4" aria-busy="true"><div className="h-28 animate-pulse rounded-xl bg-muted" /><div className="h-[520px] animate-pulse rounded-xl bg-muted" /></div>;
  if (error) return <div className="workspace-page"><UnexpectedError title={t('centralAdmin.customers.errors.loadTitle')} description={t('centralAdmin.customers.errors.loadDescription')} /></div>;

  return <div className="workspace-page"><PageHeader eyebrow={t('centralAdmin.customers.eyebrow')} title={isEdit ? t('centralAdmin.customers.editTitle') : t('centralAdmin.customers.newTitle')} description={isEdit ? t('centralAdmin.customers.editDescription') : t('centralAdmin.customers.newDescription')} actions={<Link to={isEdit && customerId ? `/admin/customers/${customerId}` : '/admin/customers'} className="btn-secondary">{t('centralAdmin.customers.actions.cancel')}</Link>} />
    <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
      <FormValidationProvider fieldErrors={validation.fieldErrors}><FormErrorSummary fieldErrors={validation.fieldErrors} formErrors={validation.formErrors} fieldLabels={fieldLabels} />
      <FormSection title={t('centralAdmin.customers.form.identity')}><div className="grid gap-4 md:grid-cols-3"><Field name="type" label={t('centralAdmin.customers.form.type')}><select value={form.type} onChange={event => update('type', event.target.value as CustomerType)} className={inputClass}>{(['Organization', 'Individual'] as const).map(value => <option key={value} value={value}>{t(`centralAdmin.customers.types.${value}`)}</option>)}</select></Field><Field name="legalName" label={t('centralAdmin.customers.form.legalName')} required><input value={form.legalName} onChange={event => update('legalName', event.target.value)} className={inputClass} required /></Field><Field name="displayName" label={t('centralAdmin.customers.form.displayName')} required><input value={form.displayName} onChange={event => update('displayName', event.target.value)} className={inputClass} required /></Field></div></FormSection>
      <FormSection title={t('centralAdmin.customers.form.registration')}><div className="grid gap-4 md:grid-cols-2"><Field name="taxId" label={t('centralAdmin.customers.form.taxId')}><input value={form.taxId || ''} onChange={event => update('taxId', event.target.value)} className={inputClass} /></Field><Field name="commercialRegistrationNumber" label={t('centralAdmin.customers.form.registrationNumber')}><input value={form.commercialRegistrationNumber || ''} onChange={event => update('commercialRegistrationNumber', event.target.value)} className={inputClass} maxLength={80} /></Field></div></FormSection>
      <FormSection title={t('centralAdmin.customers.form.contact')}><div className="grid gap-4 md:grid-cols-3"><Field name="primaryEmail" label={t('centralAdmin.customers.form.email')}><input type="email" dir="ltr" value={form.primaryEmail || ''} onChange={event => update('primaryEmail', event.target.value)} className={inputClass} /></Field><Field name="primaryPhone" label={t('centralAdmin.customers.form.phone')}><input type="tel" dir="ltr" value={form.primaryPhone || ''} onChange={event => update('primaryPhone', event.target.value)} className={inputClass} /></Field><Field name="website" label={t('centralAdmin.customers.form.website')}><input type="url" dir="ltr" value={form.website || ''} onChange={event => update('website', event.target.value)} className={inputClass} placeholder="https://" /></Field></div></FormSection>
      <FormSection title={t('centralAdmin.customers.form.address')}><div className="grid gap-4 md:grid-cols-3"><Field name="country" label={t('centralAdmin.customers.form.country')}><input value={form.country || ''} onChange={event => update('country', event.target.value)} className={inputClass} /></Field><Field name="city" label={t('centralAdmin.customers.form.city')}><input value={form.city || ''} onChange={event => update('city', event.target.value)} className={inputClass} /></Field><Field name="address" label={t('centralAdmin.customers.form.addressLine')}><input value={form.address || ''} onChange={event => update('address', event.target.value)} className={inputClass} /></Field></div></FormSection>
      <FormSection title={t('centralAdmin.customers.form.notes')}><Field name="notes" label={t('centralAdmin.customers.form.notesLabel')}><textarea value={form.notes || ''} onChange={event => update('notes', event.target.value)} className={`${inputClass} min-h-24`} /></Field></FormSection>
      <div className="form-footer"><Link to={isEdit && customerId ? `/admin/customers/${customerId}` : '/admin/customers'} className="btn-secondary">{t('centralAdmin.customers.actions.cancel')}</Link><button type="submit" className="btn-primary" disabled={saving}>{!saving && <Icon name="save" className="btn-icon" />}{saving ? t('centralAdmin.customers.actions.saving') : t('centralAdmin.customers.actions.save')}</button></div>
      </FormValidationProvider>
    </form>
  </div>;
};

const toInput = (customer: CustomerDetail): CustomerInput => ({ type: customer.type, legalName: customer.legalName, displayName: customer.displayName, taxId: customer.taxId || '', commercialRegistrationNumber: customer.commercialRegistrationNumber || '', primaryEmail: customer.primaryEmail || '', primaryPhone: customer.primaryPhone || '', website: customer.website || '', address: customer.address || '', country: customer.country || '', city: customer.city || '', notes: customer.notes || '' });
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <section className="enterprise-panel"><h2 className="text-base font-semibold text-foreground">{title}</h2><div className="mt-4">{children}</div></section>;
const Field: React.FC<{ name: string; label: string; required?: boolean; children: React.ReactElement }> = ({ name, label, required, children }) => <FormField name={name} label={label} required={required} error={useFieldError(name)}>{children}</FormField>;
