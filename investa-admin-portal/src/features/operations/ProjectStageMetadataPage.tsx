import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FinanceEmpty, FinanceError, FinanceLoading } from '@/features/company-finance/CompanyFinanceStates';
import { projectStageMetadataService, ProjectStageMetadataItem } from '@/services/projectStageMetadataService';

const ProjectStageMetadataPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<ProjectStageMetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await projectStageMetadataService.list()); }
    catch (e: any) { const message = e?.message ?? t('projectStageMetadata.loadError'); setError(message); toast.error(message); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { void load(); }, [load]);
  return <div className="space-y-5 p-4 sm:p-6" dir={i18n.dir()}>
    <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-bold text-foreground">{t('projectStageMetadata.title')}</h1><p className="mt-1 text-sm text-muted-foreground">{t('projectStageMetadata.description')}</p></div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />{t('common.refresh')}</button>
    </header>
    {error ? <FinanceError message={error} /> : loading ? <FinanceLoading /> : <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-sm"><thead className="bg-muted/60 text-muted-foreground"><tr>{['code','value','names','sortOrder','custom','status'].map(key => <th key={key} className="px-4 py-3 text-start font-bold">{t(`projectStageMetadata.${key}`)}</th>)}</tr></thead><tbody className="divide-y divide-border">{items.map(item => <tr key={item.code}><td className="px-4 py-3 font-mono font-bold" dir="ltr">{item.code}</td><td className="px-4 py-3" dir="ltr">{item.value}</td><td className="px-4 py-3"><div className="font-semibold">{item.nameEn}</div><div className="text-muted-foreground" dir="rtl">{item.nameAr}</div></td><td className="px-4 py-3" dir="ltr">{item.sortOrder}</td><td className="px-4 py-3">{item.allowsCustomName ? t('projectStageMetadata.yes') : t('projectStageMetadata.no')}</td><td className="px-4 py-3">{item.isActive ? t('projectStageMetadata.active') : t('projectStageMetadata.inactive')}</td></tr>)}{items.length === 0 && <tr><td colSpan={6}><FinanceEmpty /></td></tr>}</tbody></table></div></div>}
  </div>;
};

export default ProjectStageMetadataPage;
