import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, NotFound, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { Icon } from '@/components/common/Icons';
import { ApiError } from '@/services/api';
import { FormErrorSummary, FormValidationProvider, FormField, useFieldError, useFieldName, useFormValidation } from '@/components/common/FormValidation';
import { quotationService, type QuotationDetail } from '../quotations/quotationService';
import { contractService, type ContractDetail, type ContractLine, type ContractMetadataInput } from './contractService';

const inputClass = 'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';
const emptyForm = (): ContractMetadataInput => ({ effectiveDate: null, startDate: null, endDate: null, signedDate: null, paymentTerms: '', commercialTerms: '', notes: '' });
const dateLabel = (value: string | null | undefined, language: string) => value ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium' }).format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '—';
type Source = QuotationDetail | ContractDetail;

export const ContractFormPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { quotationId, contractId } = useParams<{ quotationId: string; contractId: string }>();
  const isEdit = Boolean(contractId);
  const [source, setSource] = useState<Source | null>(null);
  const [form, setForm] = useState<ContractMetadataInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const fieldLabels = {
    effectiveDate: t('centralAdmin.contracts.effectiveDate'),
    startDate: t('centralAdmin.contracts.startDate'),
    endDate: t('centralAdmin.contracts.endDate'),
    signedDate: t('centralAdmin.contracts.signedDate'),
    paymentTerms: t('centralAdmin.contracts.paymentTerms'),
    commercialTerms: t('centralAdmin.contracts.commercialTerms'),
    notes: t('centralAdmin.contracts.notes'),
  };
  const validation = useFormValidation(fieldLabels);
  useEffect(() => {
    const message = validation.formErrors[0] || Object.values(validation.fieldErrors)[0] || null;
    if (message) setFieldError(message);
  }, [validation.fieldErrors, validation.formErrors]);

  useEffect(() => {
    let active = true;
    const request = isEdit && contractId ? contractService.get(contractId) : quotationId ? quotationService.get(quotationId) : Promise.reject(new ApiError(404, 'Contract source not found'));
    void request.then(value => { if (!active) return; setSource(value); if ('createdAt' in value && 'contractNumber' in value && isEdit) setForm({ effectiveDate: value.effectiveDate, startDate: value.startDate, endDate: value.endDate, signedDate: value.signedDate, paymentTerms: value.paymentTerms || '', commercialTerms: value.commercialTerms || '', notes: value.notes || '' }); }).catch(reason => active && setError(reason)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [contractId, isEdit, quotationId]);

  const update = <K extends keyof ContractMetadataInput>(key: K, value: ContractMetadataInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(null); validation.clearValidation();
    if (form.endDate && form.startDate && form.endDate < form.startDate) return validation.setClientFieldError('endDate', t('centralAdmin.contracts.validation.endDate'));
    setSaving(true);
    try {
      const result = isEdit && contractId ? await contractService.update(contractId, form) : quotationId ? await contractService.createFromQuotation(quotationId, form) : null;
      if (!result) throw new Error(t('centralAdmin.contracts.errors.saveFailed'));
      navigate(`/admin/sales/contracts/${result.id}`, { replace: true });
    } catch (reason) { const result = validation.applyValidation(reason, t('centralAdmin.contracts.errors.saveFailed')); setFieldError(result.formErrors[0] || Object.values(result.fieldErrors).join('; ')); } finally { setSaving(false); }
  };

  if (loading) return <div className="workspace-page space-y-4" aria-busy="true"><div className="h-28 animate-pulse rounded-xl bg-muted" /><div className="h-96 animate-pulse rounded-xl bg-muted" /></div>;
  const statusCode = error instanceof ApiError ? error.status : 0;
  if (statusCode === 403) return <AccessDenied title={t('centralAdmin.contracts.errors.forbiddenTitle')} description={t('centralAdmin.contracts.errors.forbiddenDescription')} />;
  if (statusCode === 404 || !source) return <NotFound title={t('centralAdmin.contracts.errors.notFoundTitle')} description={t('centralAdmin.contracts.errors.notFoundDescription')} actionPath="/admin/sales/contracts" />;
  if (error) return <UnexpectedError title={t('centralAdmin.contracts.errors.loadTitle')} description={t('centralAdmin.contracts.errors.loadDescription')} />;
  const isQuotation = 'quotationNumber' in source;
  const lines = source.lines;
  return <div className="workspace-page"><PageHeader eyebrow={t('centralAdmin.contracts.eyebrow')} title={isEdit ? t('centralAdmin.contracts.editTitle') : t('centralAdmin.contracts.createTitle')} description={isEdit ? t('centralAdmin.contracts.editDescription') : t('centralAdmin.contracts.createDescription')} actions={<Link to={isEdit && contractId ? `/admin/sales/contracts/${contractId}` : '/admin/sales/contracts'} className="btn-secondary">{t('centralAdmin.contracts.actions.cancel')}</Link>} />
    <form className="mt-6 space-y-5" onSubmit={submit} noValidate><FormValidationProvider fieldErrors={validation.fieldErrors} fieldLabels={fieldLabels}><FormErrorSummary fieldErrors={validation.fieldErrors} formErrors={validation.formErrors} fieldLabels={fieldLabels} />{fieldError && <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{fieldError}</div>}
      <section className="enterprise-panel"><h2 className="text-base font-semibold text-foreground">{t('centralAdmin.contracts.sections.source')}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ReadOnly label={t('centralAdmin.contracts.contractNumber')} value={isQuotation ? t('centralAdmin.contracts.draftNumber') : source.contractNumber} /><ReadOnly label={t('centralAdmin.contracts.sourceQuotation')} value={isQuotation ? <Link className="text-primary hover:underline" to={`/admin/sales/quotations/${source.id}`}>{source.quotationNumber}</Link> : <Link className="text-primary hover:underline" to={`/admin/sales/quotations/${source.sourceQuotationId}`}>{source.sourceQuotationNumber}</Link>} /><ReadOnly label={t('centralAdmin.contracts.customer')} value={`${source.customerNameSnapshot || source.customerName} (${source.customerCodeSnapshot || source.customerCode})`} /><ReadOnly label={t('centralAdmin.contracts.currency')} value={source.currency} /></div><p className="mt-3 text-sm text-muted-foreground">{t('centralAdmin.contracts.sourceLocked')}</p></section>
      <section className="enterprise-panel"><h2 className="text-base font-semibold text-foreground">{t('centralAdmin.contracts.sections.metadata')}</h2><div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label={t('centralAdmin.contracts.effectiveDate')}><input type="date" value={form.effectiveDate || ''} onChange={event => update('effectiveDate', event.target.value || null)} className={inputClass} dir="ltr" /></Field><Field label={t('centralAdmin.contracts.startDate')}><input type="date" value={form.startDate || ''} onChange={event => update('startDate', event.target.value || null)} className={inputClass} dir="ltr" /></Field><Field label={t('centralAdmin.contracts.endDate')}><input type="date" value={form.endDate || ''} onChange={event => update('endDate', event.target.value || null)} className={inputClass} dir="ltr" /></Field><Field label={t('centralAdmin.contracts.signedDate')}><input type="date" value={form.signedDate || ''} onChange={event => update('signedDate', event.target.value || null)} className={inputClass} dir="ltr" /></Field></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label={t('centralAdmin.contracts.paymentTerms')}><textarea value={form.paymentTerms} onChange={event => update('paymentTerms', event.target.value)} className={`${inputClass} min-h-24`} maxLength={4000} /></Field><Field label={t('centralAdmin.contracts.commercialTerms')}><textarea value={form.commercialTerms} onChange={event => update('commercialTerms', event.target.value)} className={`${inputClass} min-h-24`} maxLength={4000} /></Field><Field label={t('centralAdmin.contracts.notes')}><textarea value={form.notes} onChange={event => update('notes', event.target.value)} className={`${inputClass} min-h-24 md:col-span-2`} maxLength={4000} /></Field></div></section>
      <section className="enterprise-panel"><div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-foreground">{t('centralAdmin.contracts.sections.lines')}</h2><span className="text-sm text-muted-foreground">{lines.length} {t('centralAdmin.contracts.lines')}</span></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-start text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="px-2 py-2 text-start">#</th><th className="px-2 py-2 text-start">{t('centralAdmin.contracts.item')}</th><th className="px-2 py-2 text-start">{t('centralAdmin.contracts.description')}</th><th className="px-2 py-2 text-end">{t('centralAdmin.contracts.quantity')}</th><th className="px-2 py-2 text-end">{t('centralAdmin.contracts.unitPrice')}</th><th className="px-2 py-2 text-end">{t('centralAdmin.contracts.lineTotal')}</th></tr></thead><tbody>{lines.map(line => <tr key={line.id} className="border-b border-border last:border-0"><td className="px-2 py-3">{line.lineNumber}</td><td className="px-2 py-3 font-medium">{line.itemName}{line.itemCode && <span className="mt-1 block font-mono text-xs text-muted-foreground" dir="ltr">{line.itemCode}</span>}</td><td className="max-w-[320px] px-2 py-3 text-muted-foreground">{line.description}</td><td className="px-2 py-3 text-end" dir="ltr">{line.quantity} {line.unit}</td><td className="px-2 py-3 text-end" dir="ltr">{line.unitPrice.toFixed(2)} {source.currency}</td><td className="px-2 py-3 text-end font-semibold" dir="ltr">{line.lineTotal.toFixed(2)} {source.currency}</td></tr>)}</tbody></table></div></section>
      <div className="form-footer"><Link to={isEdit && contractId ? `/admin/sales/contracts/${contractId}` : '/admin/sales/contracts'} className="btn-secondary">{t('centralAdmin.contracts.actions.cancel')}</Link><button type="submit" className="btn-primary" disabled={saving}>{!saving && <Icon name="save" className="btn-icon" />}{saving ? t('centralAdmin.contracts.actions.saving') : t('centralAdmin.contracts.actions.saveDraft')}</button></div>
    </FormValidationProvider></form><p className="mt-3 text-end text-sm text-muted-foreground">{t('centralAdmin.contracts.metadataHelp')} · {dateLabel(isQuotation ? source.issueDate : source.effectiveDate, i18n.language)}</p>
  </div>;
};

const Field: React.FC<{ label: string; children: React.ReactElement }> = ({ label, children }) => { const name = useFieldName(label); return <FormField name={name} label={label} error={useFieldError(name)}>{children}</FormField>; };
const ReadOnly: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><div className="mt-1 text-sm text-foreground">{value || '—'}</div></div>;
