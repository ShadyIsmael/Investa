import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FinanceTransaction } from './types';

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString('en-GB') : '-';
const safe = (value?: string | null) => value?.trim() || '-';

export const FinanceTransactionHistory: React.FC<{ transaction: FinanceTransaction; statusLabel: string }> = ({ transaction, statusLabel }) => {
  const { t } = useTranslation();
  const rows: Array<[string, string]> = [
    [t('companyFinance.workflow.currentStatus'), statusLabel],
    [t('companyFinance.workflow.createdBy'), safe(transaction.makerDisplayName)],
  ];
  if (transaction.submittedAt) {
    rows.push([t('companyFinance.workflow.submittedBy'), safe(transaction.makerDisplayName)]);
    rows.push([t('companyFinance.workflow.submittedAt'), formatDate(transaction.submittedAt)]);
  }
  if (transaction.reviewedAt || transaction.reviewDecision) {
    rows.push([transaction.reviewDecision === 'Rejected' ? t('companyFinance.workflow.rejectedBy') : t('companyFinance.workflow.approvedBy'), safe(transaction.checkerDisplayName)]);
    rows.push([transaction.reviewDecision === 'Rejected' ? t('companyFinance.workflow.rejectedAt') : t('companyFinance.workflow.approvedAt'), formatDate(transaction.reviewedAt)]);
  }
  if (transaction.reviewReason) rows.push([t('companyFinance.workflow.rejectionReason'), transaction.reviewReason]);
  if (transaction.confirmedAt) rows.push([t('companyFinance.workflow.confirmedAt'), formatDate(transaction.confirmedAt)]);

  return <section className="mt-5 border-t border-border pt-4">
    <h4 className="text-sm font-bold">{t('companyFinance.workflow.statusHistory')}</h4>
    <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
      {rows.map(([label, value], index) => <React.Fragment key={`${label}-${index}`}><dt className="text-slate-500 dark:text-slate-400">{label}</dt><dd dir={value === '-' ? 'ltr' : 'auto'}>{value}</dd></React.Fragment>)}
    </dl>
  </section>;
};
