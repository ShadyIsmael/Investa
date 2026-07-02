import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@/components/common/Icons';
import { api } from '@/api/api';

type PricingStatusFilter = 'all' | 'enabled' | 'disabled';
type PricingSort = 'serviceName' | 'price' | 'status';

type PricingItem = {
  serviceCode: string;
  serviceName: string;
  price: number;
  currency: string;
  isEnabled: boolean;
  description: string;
  updatedAt: string | null;
};

type PricingForm = {
  price: number;
  isEnabled: boolean;
  description: string;
};

type ConfirmAction = {
  service: PricingItem;
  action: 'enable' | 'disable';
} | null;

const toBooleanStatus = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['enabled', 'active', 'true', '1'].includes(value.trim().toLowerCase());
  }
  return false;
};

const unwrapApiList = (value: any): any[] => {
  const source = value?.data?.items ?? value?.data ?? value?.items ?? value;
  return Array.isArray(source) ? source : [];
};

const unwrapApiObject = (value: any): any => value?.data ?? value;

const mapPricing = (item: any): PricingItem => ({
  serviceCode: String(item.serviceCode ?? item.ServiceCode ?? ''),
  serviceName: String(item.serviceName ?? item.ServiceName ?? ''),
  price: Number(item.price ?? item.Price ?? 0),
  currency: String(item.currency ?? item.Currency ?? ''),
  isEnabled: toBooleanStatus(item.isEnabled ?? item.IsEnabled ?? item.enabled ?? item.status ?? item.Status),
  description: String(item.description ?? item.Description ?? ''),
  updatedAt: item.updatedAt ?? item.UpdatedAt ?? item.lastUpdated ?? item.LastUpdated ?? null,
});

const formatDate = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatPrice = (price: number, currency: string): string => {
  if (!currency) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  }
};

const PricingManagement: React.FC = () => {
  const [services, setServices] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PricingStatusFilter>('all');
  const [sortBy, setSortBy] = useState<PricingSort>('serviceName');
  const [selected, setSelected] = useState<PricingItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [form, setForm] = useState<PricingForm>({ price: 0, isEnabled: true, description: '' });

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await api.get<any>('/api/v1/pricing');
      setServices(unwrapApiList(result).map(mapPricing));
    } catch (error: any) {
      const message = error?.message ?? 'Failed to load pricing.';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const visibleServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services
      .filter((service) => {
        const matchesSearch =
          !query ||
          service.serviceName.toLowerCase().includes(query) ||
          service.serviceCode.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'enabled' && service.isEnabled) ||
          (statusFilter === 'disabled' && !service.isEnabled);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'status') return Number(b.isEnabled) - Number(a.isEnabled) || a.serviceName.localeCompare(b.serviceName);
        return a.serviceName.localeCompare(b.serviceName);
      });
  }, [services, search, statusFilter, sortBy]);

  const refreshService = async (serviceCode: string) => {
    const result = await api.get<any>(`/api/v1/pricing/${encodeURIComponent(serviceCode)}`);
    const refreshed = mapPricing(unwrapApiObject(result));
    setServices((current) => current.map((item) => (item.serviceCode === serviceCode ? refreshed : item)));
    return refreshed;
  };

  const openView = async (service: PricingItem) => {
    setSelected(service);
    setIsViewOpen(true);
    try {
      const refreshed = await refreshService(service.serviceCode);
      setSelected(refreshed);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to load pricing details.');
    }
  };

  const openEdit = async (service: PricingItem) => {
    setSelected(service);
    setForm({ price: service.price, isEnabled: service.isEnabled, description: service.description });
    setIsEditOpen(true);
    try {
      const refreshed = await refreshService(service.serviceCode);
      setSelected(refreshed);
      setForm({ price: refreshed.price, isEnabled: refreshed.isEnabled, description: refreshed.description });
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to load pricing details.');
    }
  };

  const handleRefresh = async (service: PricingItem) => {
    try {
      await refreshService(service.serviceCode);
      toast.success('Pricing refreshed');
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to refresh pricing.');
    }
  };

  const handleSave = async () => {
    if (!selected || saving) return;

    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error('Price must be greater than or equal to 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        price,
        status: form.isEnabled ? 'Enabled' : 'Disabled',
        isEnabled: form.isEnabled,
        description: form.description,
      };

      const result = await api.put<any>(`/api/v1/pricing/${encodeURIComponent(selected.serviceCode)}`, payload);
      const updated = mapPricing(unwrapApiObject(result) ?? { ...selected, ...payload });
      setServices((current) => current.map((item) => (item.serviceCode === selected.serviceCode ? updated : item)));
      setSelected(updated);
      setIsEditOpen(false);
      toast.success('Price updated');
      await refreshService(selected.serviceCode).catch(() => undefined);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to update price.');
    } finally {
      setSaving(false);
    }
  };

  const executeStatusAction = async () => {
    if (!confirmAction || saving) return;

    setSaving(true);
    try {
      const { service, action } = confirmAction;
      await api.patch(`/api/v1/pricing/${encodeURIComponent(service.serviceCode)}/${action}`, {});
      toast.success(`Service ${action === 'enable' ? 'enabled' : 'disabled'}`);
      setConfirmAction(null);
      await refreshService(service.serviceCode).catch(fetchPricing);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to update service status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage platform service prices and availability.</p>
        </div>

        <button
          type="button"
          onClick={fetchPricing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          <Icon name="sync" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-700 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by service name or code"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PricingStatusFilter)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as PricingSort)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Sort pricing"
          >
            <option value="serviceName">Service Name</option>
            <option value="price">Price</option>
            <option value="status">Status</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
          </div>
        ) : loadError ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <p className="mb-3 font-medium">{loadError}</p>
            <button onClick={fetchPricing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {['Service Name', 'Service Code', 'Price', 'Currency', 'Status', 'Last Updated', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {visibleServices.map((service) => (
                  <tr key={service.serviceCode} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{service.serviceName || '-'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">{service.serviceCode}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(service.price, service.currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{service.currency || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                          service.isEnabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
                        ].join(' ')}
                      >
                        <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                        {service.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(service.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => openView(service)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                          View
                        </button>
                        <button type="button" onClick={() => openEdit(service)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20">
                          Edit Price
                        </button>
                        {service.isEnabled ? (
                          <button type="button" onClick={() => setConfirmAction({ service, action: 'disable' })} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20">
                            Disable
                          </button>
                        ) : (
                          <button type="button" onClick={() => setConfirmAction({ service, action: 'enable' })} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20">
                            Enable
                          </button>
                        )}
                        <button type="button" onClick={() => handleRefresh(service)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                          Refresh
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleServices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No pricing services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isViewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pricing Details</h2>
              <button onClick={() => setIsViewOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Detail label="Service Name" value={selected.serviceName} />
              <Detail label="Service Code" value={selected.serviceCode} />
              <Detail label="Price" value={formatPrice(selected.price, selected.currency)} />
              <Detail label="Currency" value={selected.currency} />
              <Detail label="Status" value={selected.isEnabled ? 'Enabled' : 'Disabled'} />
              <Detail label="Last Updated" value={formatDate(selected.updatedAt)} />
              <div className="sm:col-span-2">
                <Detail label="Description" value={selected.description || '-'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Price</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <ReadOnly label="Service Code" value={selected.serviceCode} />
                <ReadOnly label="Service Name" value={selected.serviceName} />
                <ReadOnly label="Currency" value={selected.currency} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
                  <select
                    value={form.isEnabled ? 'enabled' : 'disabled'}
                    onChange={(event) => setForm((current) => ({ ...current, isEnabled: event.target.value === 'enabled' }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button onClick={() => setIsEditOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {confirmAction.action === 'enable' ? 'Enable Service' : 'Disable Service'}
              </h2>
            </div>
            <div className="p-6 text-sm text-slate-600 dark:text-slate-300">
              Confirm you want to {confirmAction.action} {confirmAction.service.serviceName || confirmAction.service.serviceCode}.
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button onClick={() => setConfirmAction(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={executeStatusAction} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? 'Working...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</p>
  </div>
);

const ReadOnly: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <input
      value={value || '-'}
      disabled
      className="w-full cursor-not-allowed rounded-lg border border-slate-300/60 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
    />
  </label>
);

export default PricingManagement;
