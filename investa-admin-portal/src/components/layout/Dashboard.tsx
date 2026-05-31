import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { financeService } from '@/services/financeService';
import { clientService } from '@/services/clientService';
import { generateExecutiveSummary } from '@/services/geminiService';
import { AiStatus, DashboardStat, ChartDataPoint, Client } from '@/types';
import { Icon } from '@/components/common/Icons';
import { useTranslation } from 'react-i18next';

const ACCENT_COLORS = ['#0ea5e9','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const ICON_MAP: Record<string, { icon: string; color: string; bg: string }> = {
  users:    { icon: 'group',       color: 'text-sky-500',    bg: 'bg-sky-500/10' },
  revenue:  { icon: 'payments',    color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  activity: { icon: 'trending-up', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  orders:   { icon: 'receipt',     color: 'text-amber-500',  bg: 'bg-amber-500/10' },
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, change, trend, iconName }: DashboardStat) => {
  const pos      = trend !== 'down' && change >= 0;
  const iconMeta = ICON_MAP[iconName] ?? ICON_MAP.activity;

  return (
    <div className="card card-hover p-5 flex flex-col gap-4 relative overflow-hidden">
      {/* subtle top accent line */}
      <div className={`absolute inset-x-0 top-0 h-[3px] rounded-t-2xl ${pos ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />

      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconMeta.bg}`}>
          <Icon name={iconMeta.icon} className={`w-5 h-5 ${iconMeta.color}`} />
        </div>
        <span className={`badge ${pos ? 'badge-success' : 'badge-error'}`}>
          {pos ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>

      <div>
        <div className="text-2xl font-black tracking-tight text-foreground leading-none">{value}</div>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1.5">{label}</div>
      </div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState<DashboardStat[]>([]);
  const [revenue, setRevenue] = useState<ChartDataPoint[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<{ name: string; value: number }[]>([]);
  const [creditPlanStats, setCreditPlanStats] = useState<{ name: string; value: number; credits: number }[]>([]);
  const [aiStatus,   setAiStatus]   = useState<AiStatus>(AiStatus.IDLE);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [rev, st, cl, cps] = await Promise.allSettled([
          financeService.getRevenueData(),
          financeService.getDashboardStats(),
          clientService.getTopClients(),
          financeService.getCreditPlanPurchaseStats(),
        ]);
        if (rev.status === 'fulfilled') setRevenue(rev.value);
        if (st.status  === 'fulfilled') setStats(st.value);
        if (cps.status === 'fulfilled') setCreditPlanStats(cps.value);
        if (cl.status  === 'fulfilled') {
          setClients(cl.value);
          setCategories([
            { name: 'Technology',   value: 15_400_000 },
            { name: 'Real Estate',  value: 12_100_000 },
            { name: 'Healthcare',   value:  8_900_000 },
            { name: 'Green Energy', value:  4_200_000 },
          ]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAi = async () => {
    setAiStatus(AiStatus.LOADING);
    try {
      setAiResponse((await generateExecutiveSummary({ metrics: stats })) ?? null);
      setAiStatus(AiStatus.SUCCESS);
    } catch {
      setAiStatus(AiStatus.ERROR);
      setAiResponse('AI model unavailable. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1">Admin Portal</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t('dashboard.title', { defaultValue: 'Overview' })}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('dashboard.subtitle', { defaultValue: 'Real-time metrics and operational insights' })}
          </p>
        </div>
        <button
          onClick={handleAi}
          disabled={aiStatus === AiStatus.LOADING}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
        >
          <Icon name={aiStatus === AiStatus.LOADING ? 'sync' : 'auto-awesome'}
            className={`w-4 h-4 ${aiStatus === AiStatus.LOADING ? 'animate-spin' : ''}`}
          />
          {aiStatus === AiStatus.LOADING ? 'Analyzing…' : t('dashboard.aiInsights', { defaultValue: 'AI Insights' })}
        </button>
      </div>

      {/* AI panel */}
      {aiStatus !== AiStatus.IDLE && (
        <div className={`card p-5 border-s-4 ${aiStatus === AiStatus.ERROR ? 'border-s-destructive' : 'border-s-primary'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name={aiStatus === AiStatus.ERROR ? 'error' : 'analytics'}
              className={`w-5 h-5 ${aiStatus === AiStatus.ERROR ? 'text-destructive' : 'text-primary'}`}
            />
            <h3 className="font-bold text-sm text-foreground">
              {aiStatus === AiStatus.ERROR ? 'Error' : 'Strategic Analysis'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiResponse || 'Processing…'}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.id ?? i} {...s} />)}
      </div>

      {/* Pie charts row — Market Mix + Credit Plan Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Market Mix */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Market Mix</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Investment categories</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Icon name="pie-chart" className="w-5 h-5 text-violet-500" />
            </div>
          </div>
          <div className="h-[280px]">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {categories.map((_, i) => (
                      <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number | undefined) => [`${((v ?? 0) / 1_000_000).toFixed(1)}M EGP`, ''] as [string, string]}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Credit Plan Purchases */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Credit Plan Purchases</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Purchase count by plan</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Icon name="payments" className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="h-[280px]">
            {creditPlanStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditPlanStats}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {creditPlanStats.map((_, i) => (
                      <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString()} purchases`, 'Count'] as [string, string]}
                    contentStyle={{
                      borderRadius: '0.75rem', border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))', fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Icon name="pie-chart" className="w-10 h-10 opacity-20" />
                <p className="text-sm">No purchases yet</p>
              </div>
            )}
          </div>
          {creditPlanStats.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {creditPlanStats.map((plan, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                    />
                    <span className="text-foreground font-medium truncate max-w-[120px]">{plan.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="font-semibold text-foreground">{plan.value.toLocaleString()} purchases</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Stream — full width */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground">Revenue Stream</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly performance</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Icon name="trending-up" className="w-5 h-5 text-sky-500" />
          </div>
        </div>
        <div className="h-[280px]">
          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem', border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
                    fontSize: '12px', fontWeight: '600',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Top Clients */}
      {clients.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Top Clients</h2>
            <span className="badge badge-info">{clients.length} active</span>
          </div>
          <div className="divide-y divide-border">
            {clients.slice(0, 6).map((client, i) => {
              const pct = client.verificationPercent ?? 0;
              return (
                <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                  {/* Rank */}
                  <span className="w-5 text-xs font-bold text-muted-foreground tabular-nums">{i + 1}</span>
                  {/* Avatar */}
                  <img src={client.avatar} alt="" className="w-8 h-8 rounded-full bg-secondary object-cover flex-shrink-0 ring-2 ring-border" />
                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                  </div>
                  {/* Verification progress */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-primary w-8 text-end">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
