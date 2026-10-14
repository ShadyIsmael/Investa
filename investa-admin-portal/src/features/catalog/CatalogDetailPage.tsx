import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, NotFound, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { CapabilityBadge, InlineAlert, StatusBadge as SharedStatusBadge } from '@/components/common/EnterpriseVisuals';
import { Icon } from '@/components/common/Icons';
import PermissionControl from '@/components/common/PermissionControl';
import { usePermissions } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { CATALOG_PERMISSIONS, catalogService, type CatalogItemDetail, type CatalogItemStatus } from './catalogService';

const dateLabel = (value: string, language: string) => value ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const statusCode = (error: unknown) => error instanceof ApiError ? error.status : 0;

export const CatalogDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { t, i18n } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const [item, setItem] = useState<CatalogItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { if (!itemId) { setError(new ApiError(404, 'Catalog item not found')); setLoading(false); return; } let active = true; setLoading(true); setError(null); void catalogService.get(itemId).then(value => active && setItem(value)).catch(reason => active && setError(reason)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [itemId, reload]);
  const toggleStatus = async () => { if (!item || !itemId) return; const next: CatalogItemStatus = item.status === 'Active' ? 'Inactive' : 'Active'; setActionError(null); try { await catalogService.setStatus(itemId, next); setReload(value => value + 1); } catch (reason) { setActionError(reason instanceof Error ? reason.message : t('centralAdmin.catalog.errors.saveFailed')); } };

  if (loading) return <div className="mx-auto max-w-[1200px] space-y-4" aria-busy="true"><div className="h-32 animate-pulse rounded-xl bg-muted" /><div className="h-72 animate-pulse rounded-xl bg-muted" /><div className="h-64 animate-pulse rounded-xl bg-muted" /></div>;
  if (statusCode(error) === 403) return <AccessDenied title={t('centralAdmin.catalog.errors.forbiddenTitle')} description={t('centralAdmin.catalog.errors.forbiddenDescription')} />;
  if (statusCode(error) === 404 || !item) return <NotFound title={t('centralAdmin.catalog.errors.notFoundTitle')} description={t('centralAdmin.catalog.errors.notFoundDescription')} actionPath="/admin/catalog/products" />;
  if (error) return <UnexpectedError title={t('centralAdmin.catalog.errors.loadTitle')} description={t('centralAdmin.catalog.errors.loadDescription')} />;
  const canEdit = hasAnyPermission(CATALOG_PERMISSIONS.edit, 'Product.Edit', 'Product.Manage');
  const canManage = hasAnyPermission(CATALOG_PERMISSIONS.manage, 'Product.Manage');

  return <div className="workspace-page"><PageHeader eyebrow={t('centralAdmin.catalog.eyebrow')} title={item.name} reference={item.code} status={<StatusBadge status={item.status} t={t} />} description={t('centralAdmin.catalog.detailDescription')} actions={<div className="flex flex-wrap gap-2"><Link to="/admin/catalog/products" className="btn-secondary"><Icon name="back" className="btn-icon" />{t('centralAdmin.catalog.actions.back')}</Link>{canEdit && <Link to={`/admin/catalog/products/${item.id}/edit`} className="btn-secondary"><Icon name="edit" className="btn-icon" />{t('centralAdmin.catalog.actions.edit')}</Link>}{canManage && (item.status === 'Active' ? <button type="button" className="btn-danger-ghost" onClick={() => void toggleStatus()}><Icon name="ban" className="btn-icon" />{t('centralAdmin.catalog.actions.deactivate')}</button> : <button type="button" className="btn-primary" onClick={() => void toggleStatus()}><Icon name="check" className="btn-icon" />{t('centralAdmin.catalog.actions.activate')}</button>)}</div>} />
    <div className="mt-6 space-y-5">{actionError && <InlineAlert tone="danger">{actionError}</InlineAlert>}
      <Section title={t('centralAdmin.catalog.sections.identity')}><dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label={t('centralAdmin.catalog.form.name')} value={item.name} /><Field label={t('centralAdmin.catalog.form.code')} value={item.code} dir="ltr" /><Field label={t('centralAdmin.catalog.form.type')} value={t(`centralAdmin.catalog.types.${item.type}`)} /><Field label={t('centralAdmin.catalog.columns.status')} value={<StatusBadge status={item.status} t={t} />} /></dl></Section>
      <Section title={t('centralAdmin.catalog.sections.commercial')}><dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label={t('centralAdmin.catalog.form.description')} value={item.description} /><Field label={t('centralAdmin.catalog.form.defaultUnit')} value={item.defaultUnit ? t(`centralAdmin.catalog.units.${item.defaultUnit}`) : null} /><Field label={t('centralAdmin.catalog.form.basePrice')} value={item.basePrice == null ? null : <span className="money" dir="ltr">{`${item.basePrice.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.currency || ''}`}</span>} dir="ltr" /></dl></Section>
      <Section title={t('centralAdmin.catalog.sections.capabilities')}><div className="grid gap-3 md:grid-cols-3"><Capability label={t('centralAdmin.catalog.capabilities.license')} enabled={item.supportsLicense} t={t} /><Capability label={t('centralAdmin.catalog.capabilities.subscription')} enabled={item.supportsSubscription} t={t} /><Capability label={t('centralAdmin.catalog.capabilities.workspace')} enabled={item.supportsWorkspace} t={t} /></div></Section>
      {item.supportsWorkspace && <Section title={t('centralAdmin.catalog.sections.workspace')}><Field label={t('centralAdmin.catalog.form.workspaceKey')} value={item.workspaceKey === 'fopx' ? t('centralAdmin.workspaceName') : item.workspaceKey} dir="ltr" /></Section>}
      <Section title={t('centralAdmin.catalog.sections.futureCommercial')}><Future title={t('centralAdmin.catalog.future.quotations')} t={t} /><Future title={t('centralAdmin.catalog.future.contracts')} t={t} /><Future title={t('centralAdmin.catalog.future.customers')} t={t} /></Section>
      <Section title={t('centralAdmin.catalog.sections.futureLicensing')}><Future title={t('centralAdmin.catalog.future.licenses')} t={t} /><Future title={t('centralAdmin.catalog.future.subscriptions')} t={t} /></Section>
      <Section title={t('centralAdmin.catalog.sections.system')}><dl className="grid gap-5 sm:grid-cols-2"><Field label={t('centralAdmin.catalog.created')} value={dateLabel(item.createdAt, i18n.language)} dir="ltr" /><Field label={t('centralAdmin.catalog.updated')} value={dateLabel(item.updatedAt, i18n.language)} dir="ltr" /></dl></Section>
    </div></div>;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <section className="enterprise-panel"><h2 className="detail-section-title">{title}</h2><div className="mt-4">{children}</div></section>;
const Field: React.FC<{ label: string; value: React.ReactNode; dir?: 'ltr' | 'rtl' }> = ({ label, value, dir }) => <div><dt className="detail-label">{label}</dt><dd className="detail-value" dir={dir}>{value || '—'}</dd></div>;
const Capability: React.FC<{ label: string; enabled: boolean; t: (key: string) => string }> = ({ label, enabled, t }) => (
  <div className="rounded-lg border border-border p-4">
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="mt-2"><CapabilityBadge>{enabled ? t('centralAdmin.catalog.capabilities.enabled') : t('centralAdmin.catalog.capabilities.disabled')}</CapabilityBadge></p>
  </div>
);
const Future: React.FC<{ title: string; t: (key: string) => string }> = ({ title, t }) => <div className="flex items-center justify-between border-t border-border py-3 first:border-t-0"><span className="text-sm text-foreground">{title}</span><span className="text-xs text-muted-foreground">{t('centralAdmin.catalog.notAvailable')}</span></div>;
const StatusBadge: React.FC<{ status: CatalogItemStatus; t: (key: string) => string }> = ({ status, t }) => (
  <SharedStatusBadge status={status} label={t(`centralAdmin.catalog.statuses.${status}`)} />
);
