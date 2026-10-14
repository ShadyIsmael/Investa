import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, NotFound, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { Icon } from '@/components/common/Icons';
import { ApiError } from '@/services/api';
import { FormErrorSummary, FormValidationProvider, FormField, useFieldError, useFormValidation } from '@/components/common/FormValidation';
import { catalogService, type CatalogItemDetail, type CatalogItemInput, type CatalogItemType, type CatalogUnit } from './catalogService';

const emptyForm: CatalogItemInput = { name: '', description: '', type: 'Product', defaultUnit: '', basePrice: null, currency: '', supportsLicense: false, supportsSubscription: false, supportsWorkspace: false, workspaceKey: '' };
const inputClass = 'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';
const units: CatalogUnit[] = ['Unit', 'User', 'Seat', 'Month', 'Year', 'Project', 'Hour', 'Day'];
const currencies = ['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'JPY'];
const statusCode = (error: unknown) => error instanceof ApiError ? error.status : 0;

export const CatalogFormPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const isEdit = Boolean(itemId);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState<CatalogItemInput>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const fieldLabels = {
    name: t('centralAdmin.catalog.form.name'),
    basePrice: t('centralAdmin.catalog.form.basePrice'),
    currency: t('centralAdmin.catalog.form.currency'),
    workspaceKey: t('centralAdmin.catalog.form.workspaceKey'),
  };
  const validation = useFormValidation(fieldLabels);

  useEffect(() => { if (!itemId) return; let active = true; void catalogService.get(itemId).then(item => active && setForm(toInput(item))).catch(reason => active && setError(reason)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [itemId]);
  const update = <K extends keyof CatalogItemInput>(key: K, value: CatalogItemInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const toggleWorkspace = (value: boolean) => setForm(current => ({ ...current, supportsWorkspace: value, workspaceKey: value ? current.workspaceKey : '' }));
  const updatePrice = (value: string) => setForm(current => ({ ...current, basePrice: value === '' ? null : Number(value), currency: value === '' ? '' : current.currency }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) { validation.setClientFieldError('name', t('centralAdmin.catalog.validation.name')); return; }
    if (form.basePrice != null && (Number.isNaN(form.basePrice) || form.basePrice < 0)) { validation.setClientFieldError('basePrice', t('centralAdmin.catalog.validation.price')); return; }
    if (form.basePrice != null && !form.currency) { validation.setClientFieldError('currency', t('centralAdmin.catalog.validation.currency')); return; }
    if (form.supportsWorkspace && !form.workspaceKey) { validation.setClientFieldError('workspaceKey', t('centralAdmin.catalog.validation.workspace')); return; }
    setSaving(true); validation.clearValidation();
    try { const result = isEdit && itemId ? await catalogService.update(itemId, form) : await catalogService.create(form); navigate(`/admin/catalog/products/${result.id}`, { replace: true }); }
    catch (reason) { validation.applyValidation(reason, t('centralAdmin.catalog.errors.saveFailed')); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="workspace-page space-y-4" aria-busy="true"><div className="h-28 animate-pulse rounded-xl bg-muted" /><div className="h-[520px] animate-pulse rounded-xl bg-muted" /></div>;
  if (statusCode(error) === 403) return <AccessDenied title={t('centralAdmin.catalog.errors.forbiddenTitle')} description={t('centralAdmin.catalog.errors.forbiddenDescription')} />;
  if (statusCode(error) === 404) return <NotFound title={t('centralAdmin.catalog.errors.notFoundTitle')} description={t('centralAdmin.catalog.errors.notFoundDescription')} actionPath="/admin/catalog/products" />;
  if (error) return <div className="workspace-page"><UnexpectedError title={t('centralAdmin.catalog.errors.loadTitle')} description={t('centralAdmin.catalog.errors.loadDescription')} /></div>;

  return <div className="workspace-page"><PageHeader eyebrow={t('centralAdmin.catalog.eyebrow')} title={isEdit ? t('centralAdmin.catalog.editTitle') : t('centralAdmin.catalog.newTitle')} description={isEdit ? t('centralAdmin.catalog.editDescription') : t('centralAdmin.catalog.newDescription')} actions={<Link to={isEdit && itemId ? `/admin/catalog/products/${itemId}` : '/admin/catalog/products'} className="btn-secondary">{t('centralAdmin.catalog.actions.cancel')}</Link>} />
    <form className="mt-6 space-y-5" onSubmit={submit} noValidate><FormValidationProvider fieldErrors={validation.fieldErrors}><FormErrorSummary fieldErrors={validation.fieldErrors} formErrors={validation.formErrors} fieldLabels={fieldLabels} />
      <FormSection title={t('centralAdmin.catalog.form.identity')}><div className="grid gap-4 md:grid-cols-3"><Field name="name" label={t('centralAdmin.catalog.form.name')} required><input value={form.name} onChange={event => update('name', event.target.value)} className={inputClass} required /></Field><Field name="type" label={t('centralAdmin.catalog.form.type')}><select value={form.type} onChange={event => update('type', event.target.value as CatalogItemType)} className={inputClass}>{(['Product', 'Service'] as const).map(value => <option key={value} value={value}>{t(`centralAdmin.catalog.types.${value}`)}</option>)}</select></Field><Field name="description" label={t('centralAdmin.catalog.form.description')}><textarea value={form.description || ''} onChange={event => update('description', event.target.value)} className={`${inputClass} min-h-24`} /></Field></div></FormSection>
      <FormSection title={t('centralAdmin.catalog.form.commercial')}><div className="grid gap-4 md:grid-cols-3"><Field name="defaultUnit" label={t('centralAdmin.catalog.form.defaultUnit')}><select value={form.defaultUnit || ''} onChange={event => update('defaultUnit', event.target.value as CatalogUnit | '')} className={inputClass}><option value="">{t('centralAdmin.catalog.form.noUnit')}</option>{units.map(value => <option key={value} value={value}>{t(`centralAdmin.catalog.units.${value}`)}</option>)}</select></Field><Field name="basePrice" label={t('centralAdmin.catalog.form.basePrice')}><input type="number" min="0" step="0.01" value={form.basePrice ?? ''} onChange={event => updatePrice(event.target.value)} className={inputClass} dir="ltr" /></Field><Field name="currency" label={t('centralAdmin.catalog.form.currency')}><select value={form.currency || ''} onChange={event => update('currency', event.target.value)} className={inputClass} disabled={form.basePrice == null}><option value="">{t('centralAdmin.catalog.form.selectCurrency')}</option>{currencies.map(value => <option key={value} value={value}>{value}</option>)}</select></Field></div><p className="mt-3 text-xs text-muted-foreground">{t('centralAdmin.catalog.form.priceNote')}</p></FormSection>
      <FormSection title={t('centralAdmin.catalog.form.capabilities')}><div className="grid gap-3 md:grid-cols-3"><Switch label={t('centralAdmin.catalog.capabilities.license')} checked={form.supportsLicense} onChange={value => update('supportsLicense', value)} /><Switch label={t('centralAdmin.catalog.capabilities.subscription')} checked={form.supportsSubscription} onChange={value => update('supportsSubscription', value)} /><Switch label={t('centralAdmin.catalog.capabilities.workspace')} checked={form.supportsWorkspace} onChange={toggleWorkspace} /></div></FormSection>
      {form.supportsWorkspace && <FormSection title={t('centralAdmin.catalog.form.workspace')}><Field name="workspaceKey" label={t('centralAdmin.catalog.form.workspaceKey')}><select value={form.workspaceKey || ''} onChange={event => update('workspaceKey', event.target.value)} className={inputClass}><option value="">{t('centralAdmin.catalog.form.selectWorkspace')}</option><option value="fopx">{t('centralAdmin.workspaceName')}</option></select></Field></FormSection>}
      <div className="form-footer"><Link to={isEdit && itemId ? `/admin/catalog/products/${itemId}` : '/admin/catalog/products'} className="btn-secondary">{t('centralAdmin.catalog.actions.cancel')}</Link><button type="submit" className="btn-primary" disabled={saving}>{!saving && <Icon name="save" className="btn-icon" />}{saving ? t('centralAdmin.catalog.actions.saving') : t('centralAdmin.catalog.actions.save')}</button></div>
      </FormValidationProvider>
    </form></div>;
};

const toInput = (item: CatalogItemDetail): CatalogItemInput => ({ name: item.name, description: item.description || '', type: item.type, defaultUnit: item.defaultUnit || '', basePrice: item.basePrice, currency: item.currency || '', supportsLicense: item.supportsLicense, supportsSubscription: item.supportsSubscription, supportsWorkspace: item.supportsWorkspace, workspaceKey: item.workspaceKey || '' });
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <section className="enterprise-panel"><h2 className="text-base font-semibold text-foreground">{title}</h2><div className="mt-4">{children}</div></section>;
const Field: React.FC<{ name: string; label: string; required?: boolean; children: React.ReactElement }> = ({ name, label, required, children }) => <FormField name={name} label={label} required={required} error={useFieldError(name)}>{children}</FormField>;
const Switch: React.FC<{ label: string; checked: boolean; onChange: (value: boolean) => void }> = ({ label, checked, onChange }) => <label className="flex items-start gap-3 rounded-lg border border-border p-4 text-sm text-foreground"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-0.5 h-4 w-4" />{label}</label>;
