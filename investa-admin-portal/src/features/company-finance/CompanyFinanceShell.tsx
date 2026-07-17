import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const CompanyFinanceShell: React.FC = () => {
  const { t } = useTranslation();
  return <div className="space-y-4">
    <div><p className="text-xs font-medium text-primary">{t('companyFinance.breadcrumb')}</p><h1 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">{t('companyFinance.title')}</h1></div>
    <Outlet />
  </div>;
};
