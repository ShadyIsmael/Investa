import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/common/Icons';
import { api } from '@/api/api';

interface NotificationTemplate {
  id: number;
  key: string;
  name: string;
  titleTemplate: string;
  bodyTemplate: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  category: string;
  isActive: boolean;
  placeholderDocs: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateForm {
  key: string;
  name: string;
  titleTemplate: string;
  bodyTemplate: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  category: string;
  isActive: boolean;
  placeholderDocs: string;
}

const EMPTY_FORM: TemplateForm = {
  key: '',
  name: '',
  titleTemplate: '',
  bodyTemplate: '',
  type: 'info',
  icon: '',
  category: '',
  isActive: true,
  placeholderDocs: '',
};

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
};

const NotificationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Send test notification state
  const [sendModal, setSendModal] = useState(false);
  const [sendTemplate, setSendTemplate] = useState<NotificationTemplate | null>(null);
  const [sendUserId, setSendUserId] = useState('');
  const [sendVars, setSendVars] = useState('{}');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      const result = await api.get<any>(`/api/v1/notification-templates${params.size ? '?' + params : ''}`, []);
      setTemplates(Array.isArray(result) ? result : result?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (t: NotificationTemplate) => {
    setEditingTemplate(t);
    setForm({
      key: t.key,
      name: t.name,
      titleTemplate: t.titleTemplate,
      bodyTemplate: t.bodyTemplate,
      type: t.type,
      icon: t.icon,
      category: t.category,
      isActive: t.isActive,
      placeholderDocs: t.placeholderDocs,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingTemplate) {
        await api.put(`/api/v1/notification-templates/${editingTemplate.id}`, form);
      } else {
        await api.post('/api/v1/notification-templates', form);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (e: any) {
      alert(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/v1/notification-templates/${deleteId}`);
      setDeleteId(null);
      fetchTemplates();
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed');
    }
  };

  const openSend = (t: NotificationTemplate) => {
    setSendTemplate(t);
    setSendUserId('');
    setSendVars('{}');
    setSendResult(null);
    setSendModal(true);
  };

  const handleSend = async () => {
    if (!sendTemplate) return;
    setSending(true);
    setSendResult(null);
    try {
      let variables: Record<string, string> = {};
      try { variables = JSON.parse(sendVars); } catch { /* ignore invalid JSON */ }
      await api.post('/api/v1/notification-templates/send', {
        userId: sendUserId,
        templateKey: sendTemplate.key,
        variables,
      });
      setSendResult('Notification sent successfully!');
    } catch (e: any) {
      setSendResult(`Error: ${e?.message ?? 'Send failed'}`);
    } finally {
      setSending(false);
    }
  };

  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
  const filtered = templates.filter(t =>
    (!filterType || t.type === filterType) &&
    (!filterCategory || t.category === filterCategory)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Templates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage configurable templates for in-app notifications
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Icon name="plus" className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">
            <Icon name="exclamation-circle" className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>{error}</p>
            <button onClick={fetchTemplates} className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Icon name="bell" className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm mt-1">Create your first notification template to get started.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Key / Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title Template</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{t.key}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {t.category || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_COLORS[t.type] ?? 'bg-slate-100 text-slate-600'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.isActive
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-semibold">Active</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 font-semibold">Inactive</span>
                    }
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{t.titleTemplate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openSend(t)}
                        title="Send test notification"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        <Icon name="send" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key *</label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                    placeholder="e.g. kyc.approved"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Display name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title Template *</label>
                <input
                  type="text"
                  value={form.titleTemplate}
                  onChange={e => setForm(f => ({ ...f, titleTemplate: e.target.value }))}
                  placeholder="Use {{variableName}} for dynamic values"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Body Template *</label>
                <textarea
                  rows={3}
                  value={form.bodyTemplate}
                  onChange={e => setForm(f => ({ ...f, bodyTemplate: e.target.value }))}
                  placeholder="Use {{variableName}} for dynamic values"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. KYC, Investment"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="e.g. check-circle"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Placeholder Documentation
                </label>
                <textarea
                  rows={2}
                  value={form.placeholderDocs}
                  onChange={e => setForm(f => ({ ...f, placeholderDocs: e.target.value }))}
                  placeholder="Describe available variables, e.g.: userName - User's full name, amount - Credit amount"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.key || !form.name || !form.titleTemplate || !form.bodyTemplate}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="trash" className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Template</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Modal */}
      {sendModal && sendTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Test Notification</h2>
              <button onClick={() => setSendModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                <p className="font-mono text-xs text-slate-500 mb-1">{sendTemplate.key}</p>
                <p className="font-semibold text-slate-800 dark:text-white">{sendTemplate.titleTemplate}</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 text-xs">{sendTemplate.bodyTemplate}</p>
                {sendTemplate.placeholderDocs && (
                  <p className="mt-2 text-xs text-slate-400 italic">Variables: {sendTemplate.placeholderDocs}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target User ID *</label>
                <input
                  type="text"
                  value={sendUserId}
                  onChange={e => setSendUserId(e.target.value)}
                  placeholder="User GUID"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Variables (JSON)</label>
                <textarea
                  rows={3}
                  value={sendVars}
                  onChange={e => setSendVars(e.target.value)}
                  placeholder='{"userName": "John", "amount": "500"}'
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono resize-none"
                />
              </div>
              {sendResult && (
                <div className={`p-3 rounded-lg text-sm ${sendResult.startsWith('Error') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                  {sendResult}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setSendModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                Close
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !sendUserId.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="send" className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
