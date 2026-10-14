import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Icon } from '@/components/common/Icons';
import { PageHeader } from '@/components/common/EnterpriseStates';
import { InlineAlert } from '@/components/common/EnterpriseVisuals';
import { useSystemHealth } from '@/core/systemHealth';
import { FOPX_WORKSPACE } from '@/core/workspaces';
import { getConfiguredEnvironment } from '@/core/environment';
import { ApiError } from '@/services/api';
import { customerService } from '@/features/customers/customerService';
import { catalogService } from '@/features/catalog/catalogService';
import { salesOpportunityService, type SalesOpportunityStage } from '@/features/sales/opportunities/salesOpportunityService';
import { quotationService } from '@/features/sales/quotations/quotationService';
import { contractService } from '@/features/sales/contracts/contractService';
import { opportunityAdminService } from '@/features/fopx-opportunities/opportunityAdminService';

type ModuleKey = 'customers' | 'catalog' | 'opportunities' | 'quotations' | 'contracts' | 'fopx';

interface ModuleDatum {
  total: number;
  sub: number;
}

type ModuleData = Record<ModuleKey, ModuleDatum | null>;

const MODULE_ROUTES: Record<ModuleKey, string> = {
  customers: '/admin/customers',
  catalog: '/admin/catalog/products',
  opportunities: '/admin/sales/opportunities',
  quotations: '/admin/sales/quotations',
  contracts: '/admin/sales/contracts',
  fopx: '/admin/fopx/opportunities',
};

const isDenied = (reason: unknown): boolean => reason instanceof ApiError && reason.status === 403;

const totalOf = (result: { total: number }): number => (typeof result.total === 'number' ? result.total : 0);

async function fetchModuleData(): Promise<ModuleData> {
  const calls: Record<ModuleKey, [Promise<{ total: number }>, Promise<{ total: number }>]> = {
    customers: [
      customerService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' }),
      customerService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc', status: 'Active' }),
    ],
    catalog: [
      catalogService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' }),
      catalogService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc', status: 'Active' }),
    ],
    opportunities: [
      salesOpportunityService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' }),
      salesOpportunityService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc', status: 'Open' }),
    ],
    quotations: [
      quotationService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' }),
      quotationService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc', status: 'Draft' }),
    ],
    contracts: [
      contractService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' }),
      contractService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc', status: 'Draft' }),
    ],
    fopx: [
      opportunityAdminService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' }),
      opportunityAdminService.list({ page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc', moderationStatus: 'UnderReview' }),
    ],
  };
  const keys = Object.keys(calls) as ModuleKey[];
  const settled = await Promise.allSettled(keys.flatMap(key => calls[key]));
  const data = {} as ModuleData;
  keys.forEach((key, index) => {
    const totalResult = settled[index * 2];
    const subResult = settled[index * 2 + 1];
    if (totalResult.status === 'rejected' && isDenied(totalResult.reason) && subResult.status === 'rejected' && isDenied(subResult.reason)) {
      data[key] = null;
      return;
    }
    if (totalResult.status === 'rejected' || subResult.status === 'rejected') {
      const reason = totalResult.status === 'rejected' ? totalResult.reason : (subResult as PromiseRejectedResult).reason;
      if (isDenied(reason)) {
        data[key] = null;
        return;
      }
      throw reason;
    }
    data[key] = {
      total: totalOf((totalResult as PromiseFulfilledResult<{ total: number }>).value),
      sub: totalOf((subResult as PromiseFulfilledResult<{ total: number }>).value),
    };
  });
  return data;
}

const SUB_LABEL: Record<ModuleKey, string> = {
  customers: 'active',
  catalog: 'active',
  opportunities: 'open',
  quotations: 'draft',
  contracts: 'draft',
  fopx: 'pendingReview',
};

const PIPELINE_STAGES: SalesOpportunityStage[] = ['New', 'Qualified', 'Proposal', 'Negotiation'];

const PIPELINE_FILLS: Record<string, string> = {
  New: '#a5b4fc',
  Qualified: '#818cf8',
  Proposal: '#6366f1',
  Negotiation: '#4f46e5',
  Won: '#10b981',
  Lost: '#ef4444',
};

interface PipelineDatum {
  key: string;
  label: string;
  count: number;
  fill: string;
  [prop: string]: string | number;
}

/** Live opportunity counts per pipeline stage plus final outcomes. Null when the sales module is not accessible. */
async function fetchPipeline(
  t: (key: string) => string,
): Promise<PipelineDatum[] | null> {
  const base = { page: 1, pageSize: 1, sortBy: 'createdAt', sortDirection: 'desc' } as const;
  const stageCalls = PIPELINE_STAGES.map(stage =>
    salesOpportunityService.list({ ...base, status: 'Open', stage }),
  );
  const outcomeCalls = (['Won', 'Lost'] as const).map(status =>
    salesOpportunityService.list({ ...base, status }),
  );
  const settled = await Promise.allSettled([...stageCalls, ...outcomeCalls]);
  if (settled.some(result => result.status === 'rejected' && isDenied(result.reason))) return null;
  const counts = settled.map(result => {
    if (result.status === 'rejected') throw result.reason;
    return totalOf(result.value);
  });
  const rows: PipelineDatum[] = PIPELINE_STAGES.map((stage, index) => ({
    key: stage,
    label: t(`centralAdmin.salesOpportunities.stages.${stage}`),
    count: counts[index],
    fill: PIPELINE_FILLS[stage],
  }));
  (['Won', 'Lost'] as const).forEach((status, offset) => {
    rows.push({
      key: status,
      label: t(`centralAdmin.salesOpportunities.statuses.${status}`),
      count: counts[PIPELINE_STAGES.length + offset],
      fill: PIPELINE_FILLS[status],
    });
  });
  return rows;
}

export const GlobalOverview: React.FC = () => {
  const { t, i18n } = useTranslation();
  const health = useSystemHealth();
  const environment = getConfiguredEnvironment();
  const [data, setData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [pipeline, setPipeline] = useState<PipelineDatum[] | null | undefined>(undefined);
  const [pipelineFailed, setPipelineFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    void fetchModuleData()
      .then(result => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  useEffect(() => {
    let active = true;
    setPipeline(undefined);
    setPipelineFailed(false);
    void fetchPipeline((key: string) => t(key))
      .then(result => {
        if (active) setPipeline(result);
      })
      .catch(() => {
        if (active) setPipelineFailed(true);
      });
    return () => {
      active = false;
    };
  }, [reload, t]);

  const formatCount = (value: number): string =>
    new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 0 }).format(value);

  const visibleKeys = (Object.keys(MODULE_ROUTES) as ModuleKey[]).filter(key => data?.[key]);
  const hiddenCount = (Object.keys(MODULE_ROUTES) as ModuleKey[]).filter(key => data && !data[key]).length;
  const attention: { key: ModuleKey; count: number }[] = [];
  if (data?.opportunities) attention.push({ key: 'opportunities', count: data.opportunities.sub });
  if (data?.quotations) attention.push({ key: 'quotations', count: data.quotations.sub });
  if (data?.contracts) attention.push({ key: 'contracts', count: data.contracts.sub });
  if (data?.fopx) attention.push({ key: 'fopx', count: data.fopx.sub });
  const pendingAttention = attention.filter(item => item.count > 0);

  return (
    <div className="workspace-page">
      <PageHeader eyebrow={t('centralAdmin.eyebrow')} title={t('centralAdmin.globalOverview.title')} description={t('centralAdmin.globalOverview.description')} actions={<Link className="btn-secondary" to={FOPX_WORKSPACE.routePrefix}><Icon name="briefcase" className="btn-icon" />{t('centralAdmin.globalOverview.openWorkspace')}</Link>} />

      <section className="enterprise-panel mt-6">
        <div className="flex items-start gap-3">
          <div className="enterprise-state-icon"><Icon name="activity" className="w-5 h-5" /></div>
          <div>
            <p className="enterprise-eyebrow">{t('centralAdmin.globalOverview.coreEyebrow')}</p>
            <h2 className="form-section-title mt-1">{t('centralAdmin.globalOverview.coreTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('centralAdmin.globalOverview.coreDescription')}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label={t('centralAdmin.globalOverview.flowLabel')}>
          {['customer', 'opportunity', 'quotation', 'contract', 'subscription', 'invoice', 'collection', 'accounting'].map((key, index, flow) => (
            <React.Fragment key={key}>
              <span className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground">{t(`centralAdmin.globalOverview.flow.${key}`)}</span>
              {index < flow.length - 1 && <Icon name="arrow-right" className="h-3.5 w-3.5 text-muted-foreground icon-directional" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="enterprise-panel mt-4" aria-live="polite" aria-busy={loading}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Icon name="chart" className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold text-foreground">{t('centralAdmin.globalOverview.liveMetricsTitle')}</h2></div>
          {!loading && !failed && data && (
            <button type="button" className="btn-ghost btn-sm" onClick={() => setReload(value => value + 1)}>
              <Icon name="reset" className="btn-icon" />{t('centralAdmin.globalOverview.retry')}
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{t('centralAdmin.globalOverview.liveMetricsDescription')}</p>
        {loading ? (
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3" aria-label={t('centralAdmin.globalOverview.loadingMetrics')}>
            {[1, 2, 3, 4, 5, 6].map(row => <div key={row} className="h-24 animate-pulse rounded-md bg-muted" />)}
          </div>
        ) : failed || !data ? (
          <div className="mt-4">
            <InlineAlert tone="danger">{t('centralAdmin.globalOverview.metricsError')}</InlineAlert>
            <div className="mt-3 flex justify-start">
              <button type="button" className="btn-secondary" onClick={() => setReload(value => value + 1)}>
                <Icon name="reset" className="btn-icon" />{t('centralAdmin.globalOverview.retry')}
              </button>
            </div>
          </div>
        ) : visibleKeys.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('centralAdmin.globalOverview.noAccess')}</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
              {visibleKeys.map(key => {
                const datum = data[key];
                if (!datum) return null;
                return (
                  <div key={key} className="rounded-md border border-border px-3 py-3">
                    <p className="text-xs text-muted-foreground">{t(`centralAdmin.globalOverview.cards.${key}`)}</p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">
                      {formatCount(datum.total)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('centralAdmin.globalOverview.subCount', {
                        value: formatCount(datum.sub),
                        state: t(`centralAdmin.globalOverview.states.${SUB_LABEL[key]}`),
                      })}
                    </p>
                    <Link
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      to={MODULE_ROUTES[key]}
                    >
                      {t('centralAdmin.globalOverview.openModule')}
                      <Icon name="arrow-right" className="h-3 w-3 icon-directional" />
                    </Link>
                  </div>
                );
              })}
            </div>
            {hiddenCount > 0 && <p className="mt-3 text-xs text-muted-foreground">{t('centralAdmin.globalOverview.partialData')}</p>}
          </>
        )}
      </section>

      {pipeline !== null && (
        <section className="enterprise-panel mt-4" aria-live="polite" aria-busy={pipeline === undefined}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="chart" className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">{t('centralAdmin.globalOverview.pipelineTitle')}</h2>
            </div>
            <Link className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" to={MODULE_ROUTES.opportunities}>
              {t('centralAdmin.globalOverview.openModule')}
              <Icon name="arrow-right" className="h-3 w-3 icon-directional" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{t('centralAdmin.globalOverview.pipelineDescription')}</p>
          {pipeline === undefined && !pipelineFailed ? (
            <div className="mt-4 h-64 animate-pulse rounded-md bg-muted" aria-label={t('centralAdmin.globalOverview.loadingMetrics')} />
          ) : pipelineFailed || pipeline === undefined ? (
            <div className="mt-4">
              <InlineAlert tone="danger">{t('centralAdmin.globalOverview.metricsError')}</InlineAlert>
              <div className="mt-3 flex justify-start">
                <button type="button" className="btn-secondary" onClick={() => setReload(value => value + 1)}>
                  <Icon name="reset" className="btn-icon" />{t('centralAdmin.globalOverview.retry')}
                </button>
              </div>
            </div>
          ) : pipeline.reduce((sum, row) => sum + row.count, 0) === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t('centralAdmin.globalOverview.pipelineEmpty')}</p>
          ) : (
            <>
              <div className="relative mx-auto mt-4 h-64 max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipeline}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={102}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pipeline.map(row => (
                        <Cell key={row.key} fill={row.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.625rem',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                      formatter={(value: number | undefined) => [formatCount(value ?? 0), ''] as [string, string]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                  <span className="text-3xl font-extrabold tabular-nums text-foreground">
                    {formatCount(pipeline.reduce((sum, row) => sum + row.count, 0))}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">{t('centralAdmin.globalOverview.cards.opportunities')}</span>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
                {pipeline.map(row => (
                  <li key={row.key} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.fill }} aria-hidden="true" />
                      <span className="truncate">{row.label}</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">{formatCount(row.count)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <section className="enterprise-panel" aria-live="polite">
          <div className="flex items-center gap-2"><Icon name="alert" className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold text-foreground">{t('centralAdmin.globalOverview.attentionTitle')}</h2></div>
          {loading ? (
            <div className="mt-3 space-y-2" aria-busy="true">{[1, 2].map(row => <div key={row} className="h-10 animate-pulse rounded-md bg-muted" />)}</div>
          ) : failed || !data ? (
            <p className="text-sm text-muted-foreground mt-3">{t('centralAdmin.globalOverview.noAttentionData')}</p>
          ) : pendingAttention.length === 0 ? (
            <div className="mt-3 flex items-start gap-2">
              <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-muted-foreground">{t('centralAdmin.globalOverview.attentionAllClear')}</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {pendingAttention.map(item => (
                <li key={item.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="status-badge status-badge-warning">
                      <span className="status-badge-dot" aria-hidden="true" />
                      <span className="tabular-nums">{formatCount(item.count)}</span>
                    </span>
                    <span className="truncate text-sm text-foreground">
                      {t(`centralAdmin.globalOverview.cards.${item.key}`)}
                      {' · '}
                      <span className="text-muted-foreground">{t(`centralAdmin.globalOverview.states.${SUB_LABEL[item.key]}`)}</span>
                    </span>
                  </div>
                  <Link className="shrink-0 text-xs font-semibold text-primary hover:underline" to={MODULE_ROUTES[item.key]}>
                    {t('centralAdmin.globalOverview.openModule')}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="enterprise-panel">
          <div className="flex items-center gap-2"><Icon name="cloud-done" className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold text-foreground">{t('centralAdmin.globalOverview.platformStatus')}</h2></div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`status-dot status-dot-${health}`} aria-hidden="true" />
            <span className="font-semibold text-foreground">{t(`centralAdmin.health.${health}`)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t('centralAdmin.globalOverview.healthSource')}</p>
        </section>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">{t('centralAdmin.environment.label')}: <span className="font-semibold text-foreground">{t(`centralAdmin.environment.${environment}`)}</span></div>
    </div>
  );
};
