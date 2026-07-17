import React from 'react';
import { useTranslation } from 'react-i18next';
export const FinanceLoading: React.FC = () => <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" /></div>;
export const FinanceEmpty: React.FC = () => { const { t } = useTranslation(); return <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('companyFinance.states.empty')}</div>; };
export const FinanceError: React.FC<{ message?: string }> = ({ message }) => { const { t } = useTranslation(); return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{message || t('companyFinance.states.error')}</div>; };
export const FinancePermissionDenied: React.FC = () => { const { t } = useTranslation(); return <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">{t('companyFinance.states.permissionDenied')}</div>; };
