import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/userService';
import { PendingAdminChange, PendingAdminChangeAction } from './types';
import PermissionControl from '@/components/common/PermissionControl';
import { toast } from 'react-toastify';
import { usePermissions } from '@/context/AuthContext';

type TabType = 'pending' | 'my';

export const AdminUserReviewQueue: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [items, setItems] = useState<PendingAdminChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PendingAdminChange | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canView = hasAnyPermission('AdminUsers.ApproveChanges');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = activeTab === 'pending'
        ? await userService.getPendingChanges(page, pageSize)
        : await userService.getMySubmissions(page, pageSize);
      setItems(res.items || []);
    } catch {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleApprove = async (changeId: number) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await userService.approveChange(changeId, actionReason || undefined);
      toast.success('Change approved');
      setPendingAction(null);
      setActionReason('');
      setDetail(null);
      loadItems();
    } catch (err) {
      setActionError('Failed to approve change');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (changeId: number) => {
    if (!actionReason.trim()) {
      setActionError('Rejection reason is required');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await userService.rejectChange(changeId, actionReason.trim());
      toast.success('Change rejected');
      setPendingAction(null);
      setActionReason('');
      setDetail(null);
      loadItems();
    } catch (err) {
      setActionError('Failed to reject change');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (changeId: number) => {
    try {
      await userService.cancelChange(changeId);
      toast.success('Submission cancelled');
      setDetail(null);
      loadItems();
    } catch {
      toast.error('Failed to cancel submission');
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
          You do not have permission to review admin user changes.
        </div>
      </div>
    );
  }

  const actionBadge = (action: PendingAdminChangeAction) => {
    const colors: Record<string, string> = {
      Activate: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Deactivate: 'bg-rose-100 text-rose-700 border-rose-200',
      Lock: 'bg-orange-100 text-orange-700 border-orange-200',
      Unlock: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      ResetPassword: 'bg-red-100 text-red-700 border-red-200',
      AssignRole: 'bg-blue-100 text-blue-700 border-blue-200',
      RemoveRole: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Admin User Changes</h2>
          <p className="text-muted-foreground text-sm">Review and approve pending admin user changes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button onClick={() => { setActiveTab('pending'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-text'}`}>
          Pending Review
        </button>
        <button onClick={() => { setActiveTab('my'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-text'}`}>
          My Submissions
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <p className="text-red-500">{error}</p>
            <button onClick={loadItems} className="px-3 py-1 bg-primary text-white rounded-md text-sm">Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">No pending changes found.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left admin-data-table">
              <thead className="text-muted-foreground text-xs uppercase tracking-widest border-b border-border">
                <tr>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Target User</th>
                  <th className="px-3 py-2">Submitted By</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${actionBadge(item.action)}`}>{item.action}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-text">{item.targetUserName || 'Unknown'}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{item.makerName || 'Unknown'}</td>
                    <td className="px-3 py-3 text-sm text-muted-foreground max-w-xs truncate">{item.description || '\u2014'}</td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{new Date(item.submittedAt).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">
                      <button onClick={() => setDetail(item)} className="px-2 py-1 border border-border rounded-md text-sm text-text hover:bg-background">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted-foreground">{items.length} items</div>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 border border-border rounded-md text-text hover:bg-background disabled:opacity-50">Previous</button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <button onClick={() => setPage(p => p+1)} disabled={items.length < pageSize} className="px-3 py-1 border border-border rounded-md text-text hover:bg-background disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col m-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold text-text">Change Details</h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-background rounded text-muted-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Action</label>
                  <p><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${actionBadge(detail.action)}`}>{detail.action}</span></p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <p className="text-text">{detail.status}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Target User</label>
                  <p className="text-text">{detail.targetUserName || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Submitted By</label>
                  <p className="text-text">{detail.makerName || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Submitted At</label>
                  <p className="text-text">{new Date(detail.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Applied</label>
                  <p className="text-text">{detail.isApplied ? `Yes (${detail.appliedAt ? new Date(detail.appliedAt).toLocaleString() : ''})` : 'No'}</p>
                </div>
              </div>

              {detail.description && (
                <div>
                  <label className="text-xs text-muted-foreground">Description</label>
                  <p className="text-text p-2 bg-background rounded border border-border">{detail.description}</p>
                </div>
              )}

              {detail.reviewReason && (
                <div>
                  <label className="text-xs text-muted-foreground">Review Notes</label>
                  <p className="text-text p-2 bg-background rounded border border-border">{detail.reviewReason}</p>
                </div>
              )}

              {/* Before/After Diff */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Before</label>
                  <pre className="text-xs text-text p-2 bg-background rounded border border-border overflow-auto max-h-40 mt-1 whitespace-pre-wrap">
                    {detail.beforeSnapshot ? JSON.stringify(JSON.parse(detail.beforeSnapshot), null, 2) : '\u2014'}
                  </pre>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">After (Requested)</label>
                  <pre className="text-xs text-text p-2 bg-background rounded border border-border overflow-auto max-h-40 mt-1 whitespace-pre-wrap">
                    {detail.afterSnapshot ? JSON.stringify(JSON.parse(detail.afterSnapshot), null, 2) : '\u2014'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border bg-background/50 rounded-b-2xl">
              {pendingAction === 'approve' && (
                <div className="mb-3 p-3 bg-background rounded-lg border border-border">
                  <textarea value={actionReason} onChange={e => setActionReason(e.target.value)}
                    placeholder="Approval notes (optional)"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2" rows={2} />
                  {actionError && <p className="text-red-500 text-xs mb-2">{actionError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(detail.id)} disabled={actionLoading}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50">{actionLoading ? 'Processing...' : 'Confirm Approve'}</button>
                    <button onClick={() => { setPendingAction(null); setActionReason(''); setActionError(null); }}
                      className="px-4 py-1.5 border border-border rounded-lg text-sm text-text">Cancel</button>
                  </div>
                </div>
              )}

              {pendingAction === 'reject' && (
                <div className="mb-3 p-3 bg-background rounded-lg border border-border">
                  <textarea value={actionReason} onChange={e => setActionReason(e.target.value)}
                    placeholder="Rejection reason (required)"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2" rows={2} />
                  {actionError && <p className="text-red-500 text-xs mb-2">{actionError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(detail.id)} disabled={actionLoading || !actionReason.trim()}
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50">{actionLoading ? 'Processing...' : 'Confirm Reject'}</button>
                    <button onClick={() => { setPendingAction(null); setActionReason(''); setActionError(null); }}
                      className="px-4 py-1.5 border border-border rounded-lg text-sm text-text">Cancel</button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {detail.status === 'Pending' && activeTab === 'pending' && detail.canApprove && (
                    <button onClick={() => setPendingAction('approve')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:opacity-90">Approve</button>
                  )}
                  {detail.status === 'Pending' && activeTab === 'pending' && detail.canReject && (
                    <button onClick={() => setPendingAction('reject')}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm hover:opacity-90">Reject</button>
                  )}
                  {detail.status === 'Pending' && activeTab === 'my' && detail.canCancel && (
                    <PermissionControl permission="AdminUsers.ApproveChanges">
                      <button onClick={() => { if (confirm('Cancel this submission?')) handleCancel(detail.id); }}
                        className="px-3 py-1.5 border border-border rounded-lg text-sm text-text hover:bg-background">Cancel Submission</button>
                    </PermissionControl>
                  )}
                </div>
                <button onClick={() => setDetail(null)}
                  className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm hover:opacity-90">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AdminUserReviewQueue.displayName = 'AdminUserReviewQueue';
export default AdminUserReviewQueue;
