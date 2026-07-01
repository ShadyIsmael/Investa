import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@/components/common/Icons';
import {
  OpportunityLookupItem,
  OpportunityLookupKind,
  opportunityLookupService,
} from '@/services/opportunityLookupService';

interface OpportunityLookupPageProps {
  kind: OpportunityLookupKind;
  title: string;
  description: string;
  showSortOrder?: boolean;
}

const OpportunityLookupPage: React.FC<OpportunityLookupPageProps> = ({
  kind,
  title,
  description,
  showSortOrder = true,
}) => {
  const [items, setItems] = useState<OpportunityLookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await opportunityLookupService.getLookups(kind);
      setItems(result);
    } catch (e: any) {
      const message = e?.message ?? `Failed to load ${title.toLowerCase()}.`;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [kind, title]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? items.filter((item) =>
          [item.name, item.description ?? ''].some((value) => value.toLowerCase().includes(query))
        )
      : items;

    return [...filtered].sort((a, b) => {
      const left = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const right = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (left !== right) return left - right;
      return a.name.localeCompare(b.name);
    });
  }, [items, search]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <button
          type="button"
          onClick={fetchItems}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="sync" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="relative max-w-md">
            <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or description"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <p className="mb-3 font-medium">{error}</p>
            <button onClick={fetchItems} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Active</th>
                  {showSortOrder && (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sort Order</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {visibleItems.map((item) => (
                  <tr key={`${item.id}-${item.name}`} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{item.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.description || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusPill active={item.active} />
                    </td>
                    {showSortOrder && (
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {typeof item.sortOrder === 'number' ? item.sortOrder : '-'}
                      </td>
                    )}
                  </tr>
                ))}

                {visibleItems.length === 0 && (
                  <tr>
                    <td colSpan={showSortOrder ? 4 : 3} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No lookup data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusPill: React.FC<{ active?: boolean | null }> = ({ active }) => {
  if (active === null || typeof active === 'undefined') {
    return <span className="text-sm text-slate-500 dark:text-slate-400">-</span>;
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
        active
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
      ].join(' ')}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

export default OpportunityLookupPage;
