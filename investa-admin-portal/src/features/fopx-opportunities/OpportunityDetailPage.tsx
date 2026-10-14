import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, NotFound, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { InlineAlert, StatusBadge as SharedStatusBadge } from '@/components/common/EnterpriseVisuals';
import { Icon } from '@/components/common/Icons';
import { usePermissions } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { formatMoney } from '@/utils/currency';
import { allowedFundingTargets, canManageFunding, canReviewOpportunity, isValidRejectionReason } from './opportunityAdminPolicy';
import { opportunityAdminService, OPPORTUNITY_CLOSURE_REASONS, type OpportunityClosureReason, type OpportunityDetail, type OpportunityFundingStatus } from './opportunityAdminService';

const apiStatus = (error: unknown): number => error instanceof ApiError ? error.status : 0;
const dateLabel = (value: string | null | undefined, language: string): string => value ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const labelFor = (t: (key: string, options?: Record<string, unknown>) => string, group: string, value: string): string => t(`centralAdmin.opportunities.${group}.${value}`, { defaultValue: value });

const StatusValue: React.FC<{ value: string; group: 'lifecycle' | 'moderation' | 'funding'; t: (key: string, options?: Record<string, unknown>) => string }> = ({ value, group, t }) => (
  <SharedStatusBadge status={value} label={labelFor(t, group, value)} />
);

const Section: React.FC<{ title: string; eyebrow?: string; children: React.ReactNode }> = ({ title, eyebrow, children }) => (
  <section className="enterprise-panel">
    {eyebrow && <p className="enterprise-eyebrow">{eyebrow}</p>}
    <h2 className="detail-section-title">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const Field: React.FC<{ label: string; value: React.ReactNode; dir?: 'ltr' | 'rtl' }> = ({ label, value, dir }) => (
  <div><dt className="detail-label">{label}</dt><dd className="detail-value" dir={dir}>{value || '—'}</dd></div>
);

const DetailError: React.FC<{ error: unknown; onRetry: () => void }> = ({ error, onRetry }) => {
  const { t } = useTranslation();
  if (apiStatus(error) === 403) return <AccessDenied title={t('centralAdmin.opportunities.errors.forbiddenTitle')} description={t('centralAdmin.opportunities.errors.forbiddenDescription')} />;
  if (apiStatus(error) === 404) return <NotFound title={t('centralAdmin.opportunities.errors.notFoundTitle')} description={t('centralAdmin.opportunities.errors.notFoundDescription')} actionPath="/admin/fopx/opportunities" />;
  return <div><UnexpectedError title={t('centralAdmin.opportunities.errors.loadTitle')} description={t('centralAdmin.opportunities.errors.loadDescription')} /><div className="flex justify-center"><button type="button" className="btn-secondary" onClick={onRetry}><Icon name="reset" className="btn-icon" />{t('centralAdmin.opportunities.actions.retry')}</button></div></div>;
};

type ActionKind = 'approve' | 'reject' | 'funding';

export const OpportunityDetailPage: React.FC = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { permissions } = usePermissions();
  const [detail, setDetail] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [action, setAction] = useState<ActionKind | null>(null);
  const [reason, setReason] = useState('');
  const [targetStatus, setTargetStatus] = useState<OpportunityFundingStatus | ''>('');
  const [closureReason, setClosureReason] = useState<OpportunityClosureReason | ''>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const actionTriggerRef = useRef<HTMLButtonElement | null>(null);
  const actionInputRef = useRef<HTMLTextAreaElement | HTMLSelectElement | null>(null);

  const id = Number(opportunityId);
  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) { setLoading(false); setError(new ApiError(404, 'Opportunity not found')); return; }
    let active = true;
    setLoading(true);
    setError(null);
    void opportunityAdminService.get(id).then(value => {
      if (active) setDetail(value);
    }).catch(reasonValue => {
      if (active) setError(reasonValue);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id, reloadToken]);

  useEffect(() => {
    if (action) window.setTimeout(() => actionInputRef.current?.focus(), 0);
  }, [action]);

  const openAction = (kind: ActionKind, trigger: HTMLButtonElement) => {
    setAction(kind);
    setReason('');
    setActionError(null);
    setTargetStatus(kind === 'funding' && detail ? allowedFundingTargets(detail.fundingStatus)[0] || '' : '');
    setClosureReason('');
    actionTriggerRef.current = trigger;
  };

  const closeAction = () => {
    if (submitting) return;
    setAction(null);
    setActionError(null);
    window.setTimeout(() => actionTriggerRef.current?.focus(), 0);
  };

  const submitAction = async () => {
    if (!detail || !action) return;
    if (action === 'reject' && !isValidRejectionReason(reason)) { setActionError(t('centralAdmin.opportunities.validation.rejectionReason')); return; }
    if (action === 'funding' && (!targetStatus || (targetStatus === 'Closed' && !closureReason))) { setActionError(t('centralAdmin.opportunities.validation.fundingDetails')); return; }
    setSubmitting(true);
    setActionError(null);
    try {
      if (action === 'approve') await opportunityAdminService.approve(detail.id);
      if (action === 'reject') await opportunityAdminService.reject(detail.id, reason.trim());
      if (action === 'funding' && targetStatus) await opportunityAdminService.transitionFunding(detail.id, {
        targetStatus,
        closureReason: closureReason || undefined,
        reason: reason.trim() || undefined,
      });
      const refreshed = await opportunityAdminService.get(detail.id);
      setDetail(refreshed);
      setAction(null);
      window.setTimeout(() => actionTriggerRef.current?.focus(), 0);
    } catch (actionFailure) {
      setActionError(actionFailure instanceof Error ? actionFailure.message : t('centralAdmin.opportunities.errors.actionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="workspace-page space-y-4" aria-busy="true"><div className="h-28 animate-pulse rounded-xl bg-muted" /><div className="h-48 animate-pulse rounded-xl bg-muted" /><div className="h-64 animate-pulse rounded-xl bg-muted" /></div>;
  if (error || !detail) return <div className="workspace-page"><DetailError error={error || new Error('Missing detail')} onRetry={() => setReloadToken(value => value + 1)} /></div>;

  const reviewAvailable = canReviewOpportunity(detail, permissions);
  const fundingTargets = allowedFundingTargets(detail.fundingStatus);
  const fundingAvailable = canManageFunding(permissions) && fundingTargets.length > 0;

  return (
    <div className="workspace-page">
      <div className="mb-4"><button type="button" className="btn-secondary btn-sm" onClick={() => navigate('/admin/fopx/opportunities')}><Icon name="back" className="btn-icon" />{t('centralAdmin.opportunities.actions.backToList')}</button></div>
      <PageHeader
        eyebrow={`${t('centralAdmin.opportunities.detailEyebrow')} · #${detail.id}`}
        title={detail.title}
        description={detail.shortDescription || t('centralAdmin.opportunities.detailDescription')}
        actions={<div className="flex flex-wrap gap-2" aria-label={t('centralAdmin.opportunities.actionGroup')}>
          {reviewAvailable && <><button ref={element => { if (element) actionTriggerRef.current = element; }} type="button" className="btn-primary" onClick={event => openAction('approve', event.currentTarget)}><Icon name="check" className="btn-icon" />{t('centralAdmin.opportunities.actions.approve')}</button><button type="button" className="btn-danger-ghost" onClick={event => openAction('reject', event.currentTarget)}><Icon name="x" className="btn-icon" />{t('centralAdmin.opportunities.actions.reject')}</button></>}
          {fundingAvailable && <button type="button" className="btn-secondary" onClick={event => openAction('funding', event.currentTarget)}>{t('centralAdmin.opportunities.actions.fundingStatus')}</button>}
        </div>}
      />

      <section className="enterprise-panel mt-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div><p className="enterprise-eyebrow">{t('centralAdmin.opportunities.lifecycle')}</p><StatusValue value={detail.status} group="lifecycle" t={t} /></div>
          <div><p className="enterprise-eyebrow">{t('centralAdmin.opportunities.moderation')}</p><StatusValue value={detail.moderationStatus} group="moderation" t={t} /></div>
          <div><p className="enterprise-eyebrow">{t('centralAdmin.opportunities.fundingStatus')}</p><StatusValue value={detail.fundingStatus} group="funding" t={t} /></div>
          <div><p className="enterprise-eyebrow">{t('centralAdmin.opportunities.founder')}</p><p className="text-sm font-semibold text-foreground">{detail.founder.name}</p>{detail.founder.email && <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{detail.founder.email}</p>}</div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Section title={t('centralAdmin.opportunities.sections.project')} eyebrow={t('centralAdmin.opportunities.sections.identity')}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label={t('centralAdmin.opportunities.project')} value={detail.projectContext?.displayName || detail.projectDisplayName} />
            <Field label={t('centralAdmin.opportunities.projectId')} value={<span dir="ltr">#{detail.projectContext?.id || detail.projectId}</span>} />
            <Field label={t('centralAdmin.opportunities.projectStage')} value={labelFor(t, 'projectStage', detail.projectStage)} />
            <Field label={t('centralAdmin.opportunities.projectIndustry')} value={detail.projectContext?.industry || detail.projectIndustry} />
          </dl>
          {(detail.projectContext?.summary || detail.projectSummary) && <p className="mt-5 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">{detail.projectContext?.summary || detail.projectSummary}</p>}
          <p className="mt-4 text-xs text-muted-foreground">{t('centralAdmin.opportunities.projectContextNote')}</p>
        </Section>

        <Section title={t('centralAdmin.opportunities.sections.system')}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label={t('centralAdmin.opportunities.opportunityId')} value={<span dir="ltr">#{detail.id}</span>} />
            <Field label={t('centralAdmin.opportunities.sequence')} value={<span dir="ltr">#{detail.sequenceNumber}</span>} />
            <Field label={t('centralAdmin.opportunities.created')} value={dateLabel(detail.createdAt, i18n.language)} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.updated')} value={dateLabel(detail.updatedAt, i18n.language)} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.founderId')} value={<span dir="ltr">{detail.founder.id}</span>} />
          </dl>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Section title={t('centralAdmin.opportunities.sections.overview')}>
          <div className="space-y-5 text-sm leading-6 text-muted-foreground">
            {detail.description && <p className="whitespace-pre-wrap">{detail.description}</p>}
            <div><h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">{t('centralAdmin.opportunities.useOfFunds')}</h3><p className="mt-1 whitespace-pre-wrap">{detail.useOfFunds || '—'}</p></div>
          </div>
        </Section>
        <Section title={t('centralAdmin.opportunities.sections.funding')}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label={t('centralAdmin.opportunities.fundingTarget')} value={`${formatMoney(detail.fundingTarget, detail.fundingCurrency, { bare: true })} ${detail.fundingCurrency}`} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.fundedAmount')} value={`${formatMoney(detail.fundedAmount, detail.fundingCurrency, { bare: true })} ${detail.fundingCurrency}`} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.committedAmount')} value={`${formatMoney(detail.committedAmount, detail.fundingCurrency, { bare: true })} ${detail.fundingCurrency}`} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.confirmedReceivedAmount')} value={`${formatMoney(detail.confirmedReceivedAmount, detail.fundingCurrency, { bare: true })} ${detail.fundingCurrency}`} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.remainingFundingAmount')} value={`${formatMoney(detail.remainingFundingAmount, detail.fundingCurrency, { bare: true })} ${detail.fundingCurrency}`} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.progress')} value={`${detail.fundingProgressPercent || detail.fundingProgress}%`} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.participants')} value={detail.approvedParticipantCount} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.opens')} value={dateLabel(detail.fundingOpensAt, i18n.language)} dir="ltr" />
            <Field label={t('centralAdmin.opportunities.closes')} value={dateLabel(detail.fundingClosesAt, i18n.language)} dir="ltr" />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">{t('centralAdmin.opportunities.fundingBoundary')}</p>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Section title={t('centralAdmin.opportunities.sections.media')}>
          {detail.media.length === 0 ? <EmptySection text={t('centralAdmin.opportunities.noMedia')} /> : <div className="grid gap-3 sm:grid-cols-2">{detail.media.map(item => <div key={item.id} className="rounded-md border border-border p-3">{item.thumbnailUrl || item.previewUrl ? <img src={item.thumbnailUrl || item.previewUrl || ''} alt="" className="mb-3 h-28 w-full rounded object-cover" /> : <div className="mb-3 flex h-28 items-center justify-center rounded bg-muted text-muted-foreground"><Icon name="sparkles" className="h-5 w-5" /></div>}<p className="truncate text-sm font-medium text-foreground">{item.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{item.mediaType} · {dateLabel(item.createdAt, i18n.language)}</p>{item.fileUrl && <a className="mt-2 inline-block text-xs font-semibold text-primary hover:underline" href={item.fileUrl} target="_blank" rel="noreferrer">{t('centralAdmin.opportunities.actions.openMedia')}</a>}</div>)}</div>}
        </Section>
        <Section title={t('centralAdmin.opportunities.sections.documents')}>
          {detail.documents.length === 0 ? <EmptySection text={t('centralAdmin.opportunities.noDocuments')} /> : <div className="divide-y divide-border">{detail.documents.map(item => <div key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{item.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{item.documentType} · {item.visibility} · {dateLabel(item.createdAt, i18n.language)}</p></div>{item.fileUrl && <a className="shrink-0 text-xs font-semibold text-primary hover:underline" href={item.fileUrl} target="_blank" rel="noreferrer">{t('centralAdmin.opportunities.actions.openDocument')}</a>}</div>)}</div>}
        </Section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Section title={t('centralAdmin.opportunities.sections.reviewHistory')}>
          {detail.reviewHistory.length === 0 ? <EmptySection text={t('centralAdmin.opportunities.noReviewHistory')} /> : <EventList events={detail.reviewHistory} language={i18n.language} t={t} />}
        </Section>
        <Section title={t('centralAdmin.opportunities.sections.events')}>
          {detail.events.length === 0 ? <EmptySection text={t('centralAdmin.opportunities.noEvents')} /> : <EventList events={detail.events} language={i18n.language} t={t} />}
        </Section>
      </div>

      {action && <ActionDialog action={action} reason={reason} setReason={setReason} targetStatus={targetStatus} setTargetStatus={setTargetStatus} closureReason={closureReason} setClosureReason={setClosureReason} submitting={submitting} error={actionError} onClose={closeAction} onSubmit={() => void submitAction()} inputRef={actionInputRef} detail={detail} t={t} />}
    </div>
  );
};

const EmptySection: React.FC<{ text: string }> = ({ text }) => <p className="rounded-md border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">{text}</p>;

const EventList: React.FC<{ events: OpportunityDetail['events']; language: string; t: (key: string, options?: Record<string, unknown>) => string }> = ({ events, language, t }) => (
  <ol className="space-y-4" aria-label={t('centralAdmin.opportunities.timelineLabel')}>
    {events.map(event => <li key={event.id} className="relative border-s border-border ps-4 last:border-s-0"><span className="absolute -start-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" /><p className="text-sm font-semibold text-foreground">{event.title}</p><p className="mt-1 text-xs text-muted-foreground" dir="ltr">{dateLabel(event.createdAt, language)}</p>{event.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{event.description}</p>}<p className="mt-1 text-[11px] text-muted-foreground">{event.eventType}{event.isPublic ? ` · ${t('centralAdmin.opportunities.publicEvent')}` : ''}</p></li>)}
  </ol>
);

interface ActionDialogProps {
  action: ActionKind;
  reason: string;
  setReason: (value: string) => void;
  targetStatus: OpportunityFundingStatus | '';
  setTargetStatus: (value: OpportunityFundingStatus) => void;
  closureReason: OpportunityClosureReason | '';
  setClosureReason: (value: OpportunityClosureReason) => void;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
  inputRef: React.MutableRefObject<HTMLTextAreaElement | HTMLSelectElement | null>;
  detail: OpportunityDetail;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const ActionDialog: React.FC<ActionDialogProps> = ({ action, reason, setReason, targetStatus, setTargetStatus, closureReason, setClosureReason, submitting, error, onClose, onSubmit, inputRef, detail, t }) => {
  const targets = allowedFundingTargets(detail.fundingStatus);
  const title = action === 'approve' ? t('centralAdmin.opportunities.actions.approve') : action === 'reject' ? t('centralAdmin.opportunities.actions.reject') : t('centralAdmin.opportunities.actions.fundingStatus');
  return <div className="dialog-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && !submitting && onClose()}><div role="dialog" aria-modal="true" aria-labelledby="opportunity-action-title" className="dialog-panel"><div className="flex items-start justify-between gap-4"><div><p className="enterprise-eyebrow">{t('centralAdmin.opportunities.actionGroup')}</p><h2 id="opportunity-action-title" className="text-lg font-semibold text-foreground">{title}</h2></div><button type="button" className="btn-ghost p-1" onClick={onClose} disabled={submitting} aria-label={t('centralAdmin.opportunities.actions.close')} title={t('centralAdmin.opportunities.actions.close')}><Icon name="x" className="h-5 w-5" /></button></div>
    {action === 'approve' && <p className="mt-5 text-sm text-muted-foreground">{t('centralAdmin.opportunities.confirmApprove')}</p>}
    {action === 'reject' && <label className="mt-5 block text-sm font-medium text-foreground">{t('centralAdmin.opportunities.rejectionReason')}<textarea ref={element => { inputRef.current = element; }} value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} rows={5} className="mt-1 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" required /></label>}
    {action === 'funding' && <div className="mt-5 space-y-4"><label className="block text-sm font-medium text-foreground">{t('centralAdmin.opportunities.targetFundingStatus')}<select ref={element => { inputRef.current = element; }} value={targetStatus} onChange={event => setTargetStatus(event.target.value as OpportunityFundingStatus)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">{t('centralAdmin.opportunities.chooseStatus')}</option>{targets.map(status => <option key={status} value={status}>{labelFor(t, 'funding', status)}</option>)}</select></label>{targetStatus === 'Closed' && <label className="block text-sm font-medium text-foreground">{t('centralAdmin.opportunities.closureReason')}<select value={closureReason} onChange={event => setClosureReason(event.target.value as OpportunityClosureReason)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">{t('centralAdmin.opportunities.chooseClosureReason')}</option>{OPPORTUNITY_CLOSURE_REASONS.map(value => <option key={value} value={value}>{labelFor(t, 'closure', value)}</option>)}</select></label>}<label className="block text-sm font-medium text-foreground">{t('centralAdmin.opportunities.actionReason')}<textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} rows={3} className="mt-1 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label></div>}
    {error && <div className="mt-4"><InlineAlert tone="danger">{error}</InlineAlert></div>}
    <div className="form-footer"><button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>{t('common.cancel')}</button><button type="button" className={action === 'reject' ? 'btn-danger' : 'btn-primary'} onClick={onSubmit} disabled={submitting} data-testid={action === 'reject' ? 'confirm-destructive' : 'confirm-primary'}>{submitting ? t('centralAdmin.opportunities.actions.saving') : t('centralAdmin.opportunities.actions.confirm')}</button></div>
  </div></div>;
};
