import React from 'react';
import { useTranslation } from 'react-i18next';
import { FinanceEmpty } from './CompanyFinanceStates';
export const CompanyFinancePage: React.FC<{ page: string }> = ({ page }) => { const { t } = useTranslation(); return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h2 className="text-lg font-bold text-slate-900 dark:text-white">{t(`companyFinance.nav.${page}`)}</h2><FinanceEmpty /></section>; };
