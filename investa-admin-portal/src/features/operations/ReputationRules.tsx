import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icons';
import { api } from '@/api/api';
import { toast } from 'react-toastify';

type ReputationRule = {
  id: number;
  ruleCode: string;
  description: string;
  points: number;
  isEnabled: boolean;
  isSystem: boolean;
  isAutomatic: boolean;
  canRepeat: boolean;
  maximumOccurrences: number;
  sortOrder: number;
};

type CreateReputationRuleRequest = {
  ruleCode: string;
  description: string;
  points: number;
  sortOrder: number;
  canRepeat: boolean;
  maximumOccurrences: number;
  isAutomatic: boolean;
};

type UpdateReputationRuleRequest = {
  description: string;
  points: number;
  isEnabled: boolean;
  sortOrder: number;
  canRepeat: boolean;
  maximumOccurrences: number;
};

const EMPTY_CREATE: CreateReputationRuleRequest = {
  ruleCode: '',
  description: '',
  points: 0,
  sortOrder: 0,
  canRepeat: false,
  maximumOccurrences: 0,
  isAutomatic: true,
};

const mapRule = (d: any): ReputationRule => ({
  id: d.id,
  ruleCode: d.ruleCode,
  description: d.description,
  points: d.points,
  isEnabled: d.isEnabled,
  isSystem: d.isSystem,
  isAutomatic: d.isAutomatic,
  canRepeat: d.canRepeat,
  maximumOccurrences: d.maximumOccurrences,
  sortOrder: d.sortOrder,
});

const ReputationRules: React.FC = () => {
  console.log('ReputationRules mounted');
  const { t } = useTranslation();

  // DEBUG: avoid any possible typing/overload issues in i18n during routing debug.

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rules, setRules] = useState<ReputationRule[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateReputationRuleRequest>(EMPTY_CREATE);

  // Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReputationRule | null>(null);
  const [editForm, setEditForm] = useState<UpdateReputationRuleRequest>({
    description: '',
    points: 0,
    isEnabled: true,
    sortOrder: 0,
    canRepeat: false,
    maximumOccurrences: 0,
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await api.get<any>('/api/v1/reputation/rules?includeDisabled=true');
      const list = Array.isArray(result) ? result : result?.data ?? [];
      setRules(list.map(mapRule));
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to load reputation rules';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const rulesSorted = useMemo(() => {
    return [...rules].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rules]);

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setIsCreateOpen(true);
  };

  const openEdit = (rule: ReputationRule) => {
    setEditingRule(rule);
    setEditForm({
      description: rule.description,
      points: rule.points,
      isEnabled: rule.isEnabled,
      sortOrder: rule.sortOrder,
      canRepeat: rule.canRepeat,
      maximumOccurrences: rule.maximumOccurrences,
    });
    setIsEditOpen(true);
  };

  const closeCreate = () => setIsCreateOpen(false);

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingRule(null);
  };

  const handleCreate = async () => {
    if (saving) return;

    const payload: CreateReputationRuleRequest = {
      ruleCode: createForm.ruleCode.trim(),
      description: createForm.description,
      points: Number(createForm.points),
      sortOrder: Number(createForm.sortOrder),
      canRepeat: !!createForm.canRepeat,
      maximumOccurrences: Number(createForm.maximumOccurrences),
      isAutomatic: !!createForm.isAutomatic,
    };

    if (!payload.ruleCode) {
      toast.error('Rule Code is required');
      return;
    }

    setSaving(true);
    try {
      await api.post('/api/v1/reputation/rules', payload);
      toast.success('Reputation rule created');
      setIsCreateOpen(false);
      await fetchRules();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create reputation rule');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingRule || saving) return;

    const payload: UpdateReputationRuleRequest = {
      description: editForm.description,
      points: Number(editForm.points),
      isEnabled: !!editForm.isEnabled,
      sortOrder: Number(editForm.sortOrder),
      canRepeat: !!editForm.canRepeat,
      maximumOccurrences: Number(editForm.maximumOccurrences),
    };

    setSaving(true);
    try {
      await api.put(`/api/v1/reputation/rules/${editingRule.id}`, payload);
      toast.success('Reputation rule updated');
      setIsEditOpen(false);
      setEditingRule(null);
      await fetchRules();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update reputation rule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: ReputationRule) => {
    try {
      await api.patch(`/api/v1/reputation/rules/${rule.id}/toggle`);
      toast.success('Reputation rule updated');
      await fetchRules();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to toggle reputation rule');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>REPUTATION PAGE</h1>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reputation Rules
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage reputation scoring rules.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            New Rule
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : loadError ? (
            <div className="text-center py-16 text-slate-500">
              <p className="font-medium mb-3">{loadError}</p>
              <button
                onClick={fetchRules}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Rule Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Enabled
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {rulesSorted.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{r.ruleCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md truncate">
                        {r.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.points}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(r)}
                        className={[
                          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                          r.isEnabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
                        ].join(' ')}
                        aria-label={r.isEnabled ? 'Disable rule' : 'Enable rule'}
                      >
                        <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                        {r.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {rulesSorted.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No reputation rules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Dialog */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Reputation Rule</h2>
                <button onClick={closeCreate} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rule Code
                    </label>
                    <input
                      type="text"
                      value={createForm.ruleCode}
                      onChange={(e) => setCreateForm((f) => ({ ...f, ruleCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      value={createForm.points}
                      onChange={(e) => setCreateForm((f) => ({ ...f, points: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={createForm.isAutomatic}
                      onChange={(e) => setCreateForm((f) => ({ ...f, isAutomatic: e.target.checked }))}
                      className="rounded"
                      id="isAutomaticCreate"
                    />
                    <label htmlFor="isAutomaticCreate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Is Automatic
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={createForm.canRepeat}
                      onChange={(e) => setCreateForm((f) => ({ ...f, canRepeat: e.target.checked }))}
                      className="rounded"
                      id="canRepeatCreate"
                    />
                    <label htmlFor="canRepeatCreate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Can Repeat
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Maximum Occurrences
                    </label>
                    <input
                      type="number"
                      value={createForm.maximumOccurrences}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, maximumOccurrences: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={createForm.sortOrder}
                      onChange={(e) => setCreateForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={closeCreate}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {isEditOpen && editingRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Reputation Rule</h2>
                <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rule Code</label>
                    <input
                      type="text"
                      value={editingRule.ruleCode}
                      disabled
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300/60 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Is System</label>
                    <input
                      type="text"
                      value={editingRule.isSystem ? 'Yes' : 'No'}
                      disabled
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300/60 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Points</label>
                    <input
                      type="number"
                      value={editForm.points}
                      onChange={(e) => setEditForm((f) => ({ ...f, points: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={editForm.isEnabled}
                      onChange={(e) => setEditForm((f) => ({ ...f, isEnabled: e.target.checked }))}
                      className="rounded"
                      id="enabledEdit"
                    />
                    <label htmlFor="enabledEdit" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Enabled
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    checked={editingRule.isAutomatic}
                    disabled
                    className="rounded cursor-not-allowed"
                    id="isAutomaticEdit"
                  />
                  <label htmlFor="isAutomaticEdit" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Is Automatic (Read Only)
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={editForm.canRepeat}
                      onChange={(e) => setEditForm((f) => ({ ...f, canRepeat: e.target.checked }))}
                      className="rounded"
                      id="canRepeatEdit"
                    />
                    <label htmlFor="canRepeatEdit" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Can Repeat
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Maximum Occurrences
                    </label>
                    <input
                      type="number"
                      value={editForm.maximumOccurrences}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, maximumOccurrences: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editForm.sortOrder}
                    onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationRules;
