import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@/components/common/Icons';
import { api } from '@/api/api';

type Audience = 'All' | 'Clients' | 'Founders' | 'Investors' | 'SpecificUser';

type BroadcastForm = {
  audience: Audience;
  userId: string;
  title: string;
  message: string;
};

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdAt: string | null;
  createdBy: string;
  status: string;
};

const EMPTY_FORM: BroadcastForm = {
  audience: 'All',
  userId: '',
  title: '',
  message: '',
};

const AUDIENCES: Audience[] = ['All', 'Clients', 'Founders', 'Investors', 'SpecificUser'];

const unwrapList = (value: any): any[] => {
  const source = value?.data?.items ?? value?.data ?? value?.items ?? value;
  return Array.isArray(source) ? source : [];
};

const unwrapObject = (value: any): any => value?.data ?? value;

const mapNotification = (item: any): NotificationRecord => ({
  id: String(item.id ?? item.notificationId ?? item.NotificationId ?? ''),
  title: String(item.title ?? item.Title ?? ''),
  message: String(item.message ?? item.body ?? item.Message ?? item.Body ?? ''),
  audience: String(item.audience ?? item.targetAudience ?? item.Audience ?? item.TargetAudience ?? 'All'),
  createdAt: item.createdAt ?? item.sentAt ?? item.CreatedAt ?? item.SentAt ?? null,
  createdBy: String(item.createdBy ?? item.senderName ?? item.CreatedBy ?? item.SenderName ?? '-'),
  status: String(item.status ?? item.Status ?? 'Sent'),
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

const NotificationBroadcasts: React.FC = () => {
  const [form, setForm] = useState<BroadcastForm>(EMPTY_FORM);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selected, setSelected] = useState<NotificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.get<any>('/api/v1/notifications');
      setNotifications(unwrapList(result).map(mapNotification));
    } catch (e: any) {
      const message = e?.message ?? 'Failed to load notifications.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }, [notifications]);

  const handleSend = async () => {
    if (sending) return;

    const title = form.title.trim();
    const message = form.message.trim();
    const userId = form.userId.trim();

    if (!title) {
      toast.error('Title is required');
      return;
    }

    if (!message) {
      toast.error('Message is required');
      return;
    }

    if (form.audience === 'SpecificUser' && !userId) {
      toast.error('Specific user ID is required');
      return;
    }

    setSending(true);
    try {
      const payload = {
        audience: form.audience,
        title,
        message,
        userId: form.audience === 'SpecificUser' ? userId : undefined,
      };

      await api.post('/api/v1/notifications/broadcast', payload);
      toast.success('Notification sent');
      setForm(EMPTY_FORM);
      await fetchHistory();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  const openDetails = async (notification: NotificationRecord) => {
    setSelected(notification);
    if (!notification.id) return;

    setDetailsLoading(true);
    try {
      const result = await api.get<any>(`/api/v1/notifications/${encodeURIComponent(notification.id)}`);
      setSelected(mapNotification(unwrapObject(result)));
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to load notification details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Broadcast Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Send in-app notifications and review broadcast history.</p>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="sync" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Broadcast</h2>
          </div>

          <div className="space-y-4 p-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Audience</span>
              <select
                value={form.audience}
                onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value as Audience }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {AUDIENCES.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>
            </label>

            {form.audience === 'SpecificUser' && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">User ID</span>
                <input
                  value={form.userId}
                  onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                  placeholder="Enter target user ID"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Notification title"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</span>
              <textarea
                rows={6}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Write the in-app notification message"
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="bell" className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sent Notifications History</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              <p className="mb-3 font-medium">{error}</p>
              <button onClick={fetchHistory} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {['Title', 'Audience', 'Status', 'Sent At', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {sortedNotifications.map((notification) => (
                    <tr key={notification.id || `${notification.title}-${notification.createdAt}`} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title || '-'}</p>
                        <p className="mt-1 max-w-md truncate text-xs text-slate-500 dark:text-slate-400">{notification.message || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{notification.audience}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(notification.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openDetails(notification)}
                          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {sortedNotifications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                        No sent notifications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>
            {detailsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
              </div>
            ) : (
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Detail label="Title" value={selected.title} />
                <Detail label="Audience" value={selected.audience} />
                <Detail label="Status" value={selected.status} />
                <Detail label="Sent At" value={formatDate(selected.createdAt)} />
                <Detail label="Created By" value={selected.createdBy} />
                <Detail label="Notification ID" value={selected.id || '-'} />
                <div className="sm:col-span-2">
                  <Detail label="Message" value={selected.message || '-'} />
                </div>
              </div>
            )}
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

export default NotificationBroadcasts;
