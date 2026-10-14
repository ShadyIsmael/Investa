import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icons';
import { usePermissions } from '@/context/AuthContext';
import { canAccessPolicy } from '@/core/routePolicy';
import { PageActions } from '@/components/common/PageActions';

interface StateProps {
  title?: string;
  description?: string;
  actionPath?: string;
}

export const AccessDenied: React.FC<StateProps> = ({ title, description, actionPath = '/admin' }) => {
  const { t } = useTranslation();
  return (
    <div className="enterprise-state" role="alert">
      <div className="enterprise-state-icon"><Icon name="shield-check" className="w-6 h-6" /></div>
      <p className="enterprise-eyebrow">{t('centralAdmin.states.accessEyebrow')}</p>
      <h1 className="enterprise-state-title">{title || t('centralAdmin.states.accessTitle')}</h1>
      <p className="enterprise-state-description">{description || t('centralAdmin.states.accessDescription')}</p>
      <Link className="btn-primary" to={actionPath}>{t('centralAdmin.returnToAdmin')}</Link>
    </div>
  );
};

export const NotFound: React.FC<StateProps> = ({ title, description, actionPath = '/admin' }) => {
  const { t } = useTranslation();
  return (
    <div className="enterprise-state" role="status">
      <div className="enterprise-state-icon"><Icon name="search" className="w-6 h-6" /></div>
      <p className="enterprise-eyebrow">404</p>
      <h1 className="enterprise-state-title">{title || t('centralAdmin.states.notFoundTitle')}</h1>
      <p className="enterprise-state-description">{description || t('centralAdmin.states.notFoundDescription')}</p>
      <Link className="btn-primary" to={actionPath}>{t('centralAdmin.returnToAdmin')}</Link>
    </div>
  );
};

export const BackendUnavailable: React.FC<StateProps> = ({ title, description }) => {
  const { t } = useTranslation();
  return (
    <div className="enterprise-state enterprise-state-compact" role="alert">
      <div className="enterprise-state-icon"><Icon name="cloud-off" className="w-6 h-6" /></div>
      <h2 className="enterprise-state-title">{title || t('centralAdmin.states.backendTitle')}</h2>
      <p className="enterprise-state-description">{description || t('centralAdmin.states.backendDescription')}</p>
    </div>
  );
};

export const RouteLoadingBoundary: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="enterprise-state enterprise-state-compact" role="status" aria-live="polite" aria-busy="true">
      <div className="enterprise-state-icon" aria-hidden="true"><Icon name="sync" className="w-6 h-6 animate-spin" /></div>
      <h2 className="enterprise-state-title">{t('centralAdmin.states.loadingTitle')}</h2>
      <p className="enterprise-state-description">{t('centralAdmin.states.loadingDescription')}</p>
    </div>
  );
};

export const LazyModuleError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="enterprise-state" role="alert">
      <div className="enterprise-state-icon"><Icon name="sync" className="w-6 h-6" /></div>
      <p className="enterprise-eyebrow">{t('centralAdmin.states.moduleErrorEyebrow')}</p>
      <h1 className="enterprise-state-title">{t('centralAdmin.states.moduleErrorTitle')}</h1>
      <p className="enterprise-state-description">{t('centralAdmin.states.moduleErrorDescription')}</p>
      <button className="btn-primary" type="button" onClick={onRetry}>{t('centralAdmin.states.retry')}</button>
    </div>
  );
};

export const UnexpectedError: React.FC<StateProps> = ({ title, description }) => {
  const { t } = useTranslation();
  return (
    <div className="enterprise-state" role="alert">
      <div className="enterprise-state-icon"><Icon name="info" className="w-6 h-6" /></div>
      <h1 className="enterprise-state-title">{title || t('centralAdmin.states.unexpectedTitle')}</h1>
      <p className="enterprise-state-description">{description || t('centralAdmin.states.unexpectedDescription')}</p>
    </div>
  );
};

export const PermissionGate: React.FC<{ permissions: string[]; children: React.ReactNode; fallback?: React.ReactNode }> = ({ permissions, children, fallback }) => {
  const { permissions: actual, isAuthenticated } = usePermissions();
  return <>{canAccessPolicy({ requiredPermissions: permissions }, actual, isAuthenticated) ? children : fallback || <AccessDenied />}</>;
};

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  reference?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, description, reference, status, actions }) => (
  <div className="enterprise-page-header">
    <div className="min-w-0">
      {eyebrow && <p className="enterprise-eyebrow">{eyebrow}</p>}
      <div className="enterprise-page-title-row">
        <h1 className="enterprise-page-title">{title}</h1>
        {reference && (
          <span className="enterprise-reference" dir="ltr">
            {reference}
          </span>
        )}
        {status}
      </div>
      {description && <p className="enterprise-page-description">{description}</p>}
    </div>
    {actions && <PageActions>{actions}</PageActions>}
  </div>
);

export const PendingModulePage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="workspace-page">
      <PageHeader eyebrow={t('centralAdmin.eyebrow')} title={title} description={description} />
      <section className="enterprise-panel mt-6" aria-live="polite">
        <div className="flex items-start gap-3">
          <div className="enterprise-state-icon"><Icon name="clipboard-check" className="w-5 h-5" /></div>
          <div>
            <h2 className="font-semibold text-foreground">{t('centralAdmin.states.moduleUnavailableTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('centralAdmin.states.moduleUnavailableDescription')}</p>
          </div>
        </div>
        <button className="btn-secondary mt-5" onClick={() => navigate(-1)}>{t('common.back')}</button>
      </section>
    </div>
  );
};

