import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icons';
import { PageHeader } from '@/components/common/EnterpriseStates';

const links = [
  { key: 'users', route: '/admin/users', icon: 'users' },
  { key: 'groups', route: '/admin/access/groups', icon: 'users' },
  { key: 'roles', route: '/admin/access/roles', icon: 'handshake' },
  { key: 'approvals', route: '/admin/access/approvals', icon: 'clipboard-check' },
] as const;

export const AccessControlHub: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="workspace-page">
      <PageHeader eyebrow={t('centralAdmin.eyebrow')} title={t('centralAdmin.access.title')} description={t('centralAdmin.access.description')} />
      <div className="grid gap-3 md:grid-cols-2 mt-6">
        {links.map(link => (
          <Link key={link.key} to={link.route} className="enterprise-panel flex items-center gap-3 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring">
            <div className="enterprise-state-icon"><Icon name={link.icon} className="w-5 h-5" /></div>
            <div className="min-w-0"><h2 className="font-semibold text-foreground">{t(`centralAdmin.access.${link.key}`)}</h2><p className="text-sm text-muted-foreground mt-1">{t(`centralAdmin.access.${link.key}Description`)}</p></div>
            <Icon name="chevron-right" className="w-4 h-4 ms-auto text-muted-foreground rtl:rotate-180" />
          </Link>
        ))}
      </div>
    </div>
  );
};

