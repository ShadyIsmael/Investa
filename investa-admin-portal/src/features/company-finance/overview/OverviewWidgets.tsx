/**
 * Overview KPI widgets extracted from FinanceOverviewPage.
 * Purely presentational: skeleton, change indicator, KPI card.
 */
import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { percentText } from '../shared/financeFormat';

export const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4" aria-hidden="true">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-28 rounded-lg bg-slate-200/70 dark:bg-slate-800"
        />
      ))}
    </div>
    <div className="h-80 rounded-lg bg-slate-200/70 dark:bg-slate-800" />
    <div className="grid gap-3 xl:grid-cols-2">
      <div className="h-72 rounded-lg bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-72 rounded-lg bg-slate-200/70 dark:bg-slate-800" />
    </div>
  </div>
);

export const ChangeIndicator: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => {
  const positive = value > 0;
  const negative = value < 0;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const color = positive
    ? 'text-emerald-600 dark:text-emerald-400'
    : negative
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-500 dark:text-slate-400';
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}
      dir="ltr"
    >
      <Icon size={14} />
      {percentText(value)}{' '}
      <span
        className="font-normal text-slate-500 dark:text-slate-400"
        dir="auto"
      >
        {label}
      </span>
    </span>
  );
};

export interface KpiCardProps {
  title: string;
  value: string;
  currencyLabel: string;
  change?: number;
  changeLabel: string;
  tone: 'positive' | 'negative' | 'neutral';
  children?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  currencyLabel,
  change,
  changeLabel,
  tone,
  children,
}) => {
  const accent =
    tone === 'positive'
      ? 'border-s-emerald-500'
      : tone === 'negative'
        ? 'border-s-rose-500'
        : 'border-s-slate-400';
  return (
    <article
      className={`rounded-lg border border-border border-s-4 bg-card p-4 shadow-sm ${accent}`}
    >
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p
        className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        dir="ltr"
      >
        {value}
      </p>
      <div className="mt-1 min-h-5 text-xs text-slate-500 dark:text-slate-400">
        {currencyLabel}
      </div>
      <div className="mt-2 min-h-5">
        {change !== undefined ? (
          <ChangeIndicator value={change} label={changeLabel} />
        ) : (
          children
        )}
      </div>
    </article>
  );
};
