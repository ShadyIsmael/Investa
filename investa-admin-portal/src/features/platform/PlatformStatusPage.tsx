import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/EnterpriseStates';
import { useSystemHealth } from '@/core/systemHealth';

export const PlatformStatusPage: React.FC = () => {
  const { t } = useTranslation();
  const health = useSystemHealth();
  return (
    <div className="workspace-page">
      <PageHeader eyebrow={t('centralAdmin.eyebrow')} title={t('centralAdmin.integrations.title')} description={t('centralAdmin.integrations.description')} />
      <section className="enterprise-panel mt-6">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="font-semibold text-foreground">{t('centralAdmin.integrations.apiTitle')}</h2><p className="text-sm text-muted-foreground mt-1">{t('centralAdmin.integrations.apiDescription')}</p></div>
          <span className={`enterprise-status enterprise-status-${health}`}><span className={`status-dot status-dot-${health}`} aria-hidden="true" />{t(`centralAdmin.health.${health}`)}</span>
        </div>
      </section>
    </div>
  );
};

