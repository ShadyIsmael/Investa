import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FOPX_WORKSPACE } from '@/core/workspaces';
import { isFopxPath } from '@/core/navigation';
import { Icon } from '@/components/common/Icons';

export const WorkspaceContext: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const inWorkspace = isFopxPath(pathname);
  return (
    <div className="enterprise-workspace-context" aria-label={t('centralAdmin.workspaceContext')}>
      <div className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground">
        <Icon name={inWorkspace ? FOPX_WORKSPACE.icon : 'shield-check'} className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t(inWorkspace ? 'centralAdmin.workspaceLabel' : 'centralAdmin.identityLabel')}</span>
        <span className="block truncate text-sm font-semibold text-foreground">{inWorkspace ? FOPX_WORKSPACE.name : t('centralAdmin.identity')}</span>
      </div>
      {inWorkspace && <Link to="/admin" className="ms-auto text-muted-foreground hover:text-foreground" title={t('centralAdmin.backToGlobal')} aria-label={t('centralAdmin.backToGlobal')}><Icon name="chevron-right" className="w-4 h-4 rtl:rotate-180" /></Link>}
    </div>
  );
};

