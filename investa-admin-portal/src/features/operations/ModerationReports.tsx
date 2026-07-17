import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icons';
import {
  type ModerationReport,
  type ReportReasonCode,
  type ReportStatus,
  type ReportTargetType,
  reportService,
} from '@/services/reportService';

type ResolutionAction = 'confirm' | 'reject' | 'dismiss';

const statuses: ReportStatus[] = ['Pending', 'Confirmed', 'Rejected', 'Dismissed'];
const targetTypes: ReportTargetType[] = ['Opportunity', 'User', 'Conversation', 'Participant'];
const reasonCodes: ReportReasonCode[] = [
  'SuspiciousOpportunity',
  'MisleadingInformation',
  'Spam',
  'Abuse',
  'FraudConcern',
  'InappropriateContent',
  'Other',
];

const statusStyles: Record<ReportStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  Dismissed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

const formatDate = (value: string | null, locale: string) => {
  if (!value) return '-';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB');
};

const ModerationReports: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [targetType, setTargetType] = useState<ReportTargetType | ''>('');
  const [reasonCode, setReasonCode] = useState<ReportReasonCode | ''>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resolution, setResolution] = useState<{ report: ModerationReport; action: ResolutionAction } | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await reportService.getReports({
        status: status || undefined,
        targetType: targetType || undefined,
      });
      setReports(data);
    } catch (error: any) {
      const message = error?.message ?? t('moderationReports.loadError');
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [status, t, targetType]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const visibleReports = useMemo(
    () => reasonCode ? reports.filter((report) => report.reasonCode === reasonCode) : reports,
    [reasonCode, reports],
  );

  const openResolution = (report: ModerationReport, action: ResolutionAction) => {
    setFeedback(null);
    setNote('');
    setResolution({ report, action });
  };

  const closeResolution = () => {
    if (saving) return;
    setResolution(null);
    setNote('');
  };

  const submitResolution = async () => {
    if (!resolution || saving) return;

    setSaving(true);
    try {
      const { report, action } = resolution;
      if (action === 'confirm') await reportService.confirmReport(report.id, note);
      if (action === 'reject') await reportService.rejectReport(report.id, note);
      if (action === 'dismiss') await reportService.dismissReport(report.id, note);

      setResolution(null);
      setNote('');
      setFeedback({ type: 'success', message: t(`moderationReports.${action}Success`) });
      await loadReports();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error?.message ?? t('moderationReports.resolveError') });
    } finally {
      setSaving(false);
    }
  };

  const actionLabel = (action: ResolutionAction) => t(`moderationReports.${action}Report`);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('moderationReports.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('moderationReports.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void loadReports()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="sync" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {feedback && (
        <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-300'}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-current opacity-70 hover:opacity-100" aria-label={t('common.close')}>
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-2 xl:grid-cols-3 dark:border-slate-700">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('moderationReports.status')}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as ReportStatus | '')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              <option value="">{t('moderationReports.allStatuses')}</option>
              {statuses.map((value) => <option key={value} value={value}>{t(`moderationReports.statuses.${value}`)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('moderationReports.targetType')}</span>
            <select value={targetType} onChange={(event) => setTargetType(event.target.value as ReportTargetType | '')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              <option value="">{t('moderationReports.allTargetTypes')}</option>
              {targetTypes.map((value) => <option key={value} value={value}>{t(`moderationReports.targetTypes.${value}`)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('moderationReports.reasonCode')}</span>
            <select value={reasonCode} onChange={(event) => setReasonCode(event.target.value as ReportReasonCode | '')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              <option value="">{t('moderationReports.allReasonCodes')}</option>
              {reasonCodes.map((value) => <option key={value} value={value}>{t(`moderationReports.reasonCodes.${value}`)}</option>)}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" /></div>
        ) : loadError ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{loadError}</p>
            <button type="button" onClick={() => void loadReports()} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{t('moderationReports.retry')}</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {['targetType', 'targetId', 'reasonCode', 'description', 'status', 'reporter', 'createdDate', 'reviewedBy', 'reviewedAt', 'resolutionNote', 'actions'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t(`moderationReports.${heading}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {visibleReports.map((report) => (
                  <tr key={report.id} className="align-top transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{t(`moderationReports.targetTypes.${report.targetType}`)}</td>
                    <td className="max-w-40 break-all px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{report.targetId}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{t(`moderationReports.reasonCodes.${report.reasonCode}`)}</td>
                    <td className="max-w-xs whitespace-pre-wrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{report.description || '-'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[report.status]}`}>{t(`moderationReports.statuses.${report.status}`)}</span></td>
                    <td className="max-w-44 break-all px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{report.reporterUserId}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(report.createdAt, i18n.language)}</td>
                    <td className="max-w-44 break-all px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{report.reviewedByUserId || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(report.reviewedAt, i18n.language)}</td>
                    <td className="max-w-xs whitespace-pre-wrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{report.resolutionNote || '-'}</td>
                    <td className="px-4 py-3">
                      {report.status === 'Pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openResolution(report, 'confirm')} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">{t('moderationReports.confirm')}</button>
                          <button type="button" onClick={() => openResolution(report, 'reject')} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">{t('moderationReports.reject')}</button>
                          <button type="button" onClick={() => openResolution(report, 'dismiss')} className="rounded-md bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">{t('moderationReports.dismiss')}</button>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
                {visibleReports.length === 0 && <tr><td colSpan={11} className="px-4 py-14 text-center text-sm text-slate-500 dark:text-slate-400">{t('moderationReports.noReports')}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {resolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="report-resolution-title">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 id="report-resolution-title" className="text-lg font-bold text-slate-900 dark:text-white">{actionLabel(resolution.action)}</h2>
              <button type="button" onClick={closeResolution} disabled={saving} className="text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-300" aria-label={t('common.close')}><Icon name="x" className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('moderationReports.resolvePrompt', { id: resolution.report.id })}</p>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('moderationReports.resolutionNote')} <span className="font-normal text-slate-500">({t('common.optional')})</span></span>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={5} disabled={saving} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button type="button" onClick={closeResolution} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">{t('common.cancel')}</button>
              <button type="button" onClick={() => void submitResolution()} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? t('moderationReports.resolving') : actionLabel(resolution.action)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationReports;
