import React, { useEffect, useState } from 'react';
import { Check, CheckCircle2, Pencil, RotateCcw, Send, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { FinanceTransaction } from './types';

type WorkflowAction = 'submit' | 'approve' | 'reject' | 'confirm' | 'reverse';

interface Props {
  transaction: FinanceTransaction;
  compact?: boolean;
  onUpdated: (transaction: FinanceTransaction) => void;
  onEdit?: () => void;
}

const actionIcons = {
  submit: Send,
  approve: Check,
  reject: XCircle,
  confirm: CheckCircle2,
  reverse: RotateCcw,
};

export const FinanceWorkflowActions: React.FC<Props> = ({ transaction, compact = false, onUpdated, onEdit }) => {
  const { t } = useTranslation();
  const [pendingAction, setPendingAction] = useState<WorkflowAction | null>(null);
  const [running, setRunning] = useState<WorkflowAction | null>(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const available: WorkflowAction[] = [];
  if (transaction.canSubmit) available.push('submit');
  if (transaction.canApprove) available.push('approve');
  if (transaction.canReject) available.push('reject');
  if (transaction.canConfirm) available.push('confirm');
  if (transaction.canReverse) available.push('reverse');

  const begin = (action: WorkflowAction) => {
    if (running) return;
    setError('');
    setMessage('');
    setReason('');
    setPendingAction(action);
  };

  const execute = async () => {
    if (!pendingAction || running) return;
    if ((pendingAction === 'reject' || pendingAction === 'reverse') && !reason.trim()) {
      setError(t('companyFinance.workflow.reasonRequired'));
      return;
    }
    setRunning(pendingAction);
    setError('');
    try {
      const updated = pendingAction === 'submit'
        ? await companyFinanceService.submitTransaction(transaction.id)
        : pendingAction === 'approve'
          ? await companyFinanceService.approveTransaction(transaction.id)
          : pendingAction === 'reject'
            ? await companyFinanceService.rejectTransaction(transaction.id, reason.trim())
            : pendingAction === 'confirm'
              ? await companyFinanceService.confirmTransaction(transaction.id)
              : await companyFinanceService.reverseTransaction(transaction.id, reason.trim());
      setMessage(t(`companyFinance.workflow.success.${pendingAction}`));
      setPendingAction(null);
      setReason('');
      onUpdated(updated);
    } catch {
      setError(t('companyFinance.workflow.actionError'));
    } finally {
      setRunning(null);
    }
  };

  if (!transaction.canEdit && !available.length && !message && !error) return null;

  return <>
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? 'justify-center' : ''}`}>
      {transaction.canEdit && onEdit && <button type="button" disabled={Boolean(running)} onClick={onEdit} className={compact ? 'inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800' : 'inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-slate-800'} title={t('companyFinance.workflow.edit')} aria-label={t('companyFinance.workflow.edit')}><Pencil size={14} />{!compact && t('companyFinance.workflow.edit')}</button>}
      {available.map((action) => {
        const Icon = actionIcons[action];
        return <button key={action} type="button" disabled={Boolean(running)} onClick={() => begin(action)} className={compact ? 'inline-flex h-7 w-7 items-center justify-center rounded-md text-primary hover:bg-primary/10 disabled:opacity-50' : `inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold disabled:opacity-50 ${action === 'reject' || action === 'reverse' ? 'border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30' : 'bg-primary text-white hover:bg-primary/90'}`} title={t(`companyFinance.workflow.${action}`)} aria-label={t(`companyFinance.workflow.${action}`)}><Icon size={14} />{!compact && t(`companyFinance.workflow.${action}`)}</button>;
      })}
    </div>
    {!compact && message && <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">{message}</p>}
    {!compact && error && !pendingAction && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    {compact && message && <div role="status" className="fixed end-4 top-4 z-[80] max-w-sm rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-start text-xs font-semibold text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{message}</div>}
    {compact && error && !pendingAction && <div role="alert" className="fixed end-4 top-4 z-[80] max-w-sm rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-start text-xs font-semibold text-rose-800 shadow-lg dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">{error}</div>}
    {pendingAction && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="finance-workflow-dialog-title">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 text-foreground shadow-2xl">
        <h3 id="finance-workflow-dialog-title" className="text-base font-bold">{t(`companyFinance.workflow.dialogTitle.${pendingAction}`)}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(`companyFinance.workflow.explanation.${pendingAction}`)}</p>
        {(pendingAction === 'reject' || pendingAction === 'reverse') && <label className="mt-4 block text-sm font-medium">{t(`companyFinance.workflow.${pendingAction}Reason`)}<textarea autoFocus value={reason} onChange={(event) => setReason(event.target.value)} rows={3} maxLength={1000} className="mt-1.5 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>}
        {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={Boolean(running)} onClick={() => { setPendingAction(null); setError(''); }} className="h-9 rounded-md border border-border px-3 text-sm font-semibold disabled:opacity-50">{t('companyFinance.workflow.cancel')}</button>
          <button type="button" disabled={Boolean(running)} onClick={() => void execute()} className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{running ? t('companyFinance.workflow.processing') : t('companyFinance.workflow.continue')}</button>
        </div>
      </div>
    </div>}
  </>;
};
