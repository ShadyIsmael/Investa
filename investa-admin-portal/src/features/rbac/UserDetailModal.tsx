import React, { useEffect, useState, useCallback } from 'react';
import { userService } from '@/services/userService';
import { UserDetail, AuditLogEntry } from '@/types';
import PermissionControl from '@/components/common/PermissionControl';
import { toast } from 'react-toastify';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose, onUserUpdated }) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'roles' | 'permissions' | 'audit'>('details');
  const [permSearch, setPermSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, permData, auditData] = await Promise.all([
        userService.getUserById(userId),
        userService.getEffectivePermissions(userId),
        userService.getUserAuditLog(userId, auditPage)
      ]);
      if (userData) setUser(userData);
      setPermissions(permData);
      setAuditLog(auditData.items || []);
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId, auditPage]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLock = async () => {
    if (!confirm('Lock this user account? They will be unable to login.')) return;
    try {
      const res = await userService.lockUser(userId);
      toast.success(res?.message || 'Lock request submitted for approval');
      loadData();
      onUserUpdated?.();
    } catch { toast.error('Failed to submit lock request'); }
  };

  const handleUnlock = async () => {
    if (!confirm('Unlock this user account?')) return;
    try {
      const res = await userService.unlockUser(userId);
      toast.success(res?.message || 'Unlock request submitted for approval');
      loadData();
      onUserUpdated?.();
    } catch { toast.error('Failed to submit unlock request'); }
  };

  const handleResetPassword = async () => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!confirm(`Reset password for ${user?.name || 'this user'}?`)) return;
    try {
      const res = await userService.resetUserPassword(userId, newPassword);
      toast.success(res?.message || 'Password reset request submitted for approval');
    } catch { toast.error('Failed to submit password reset request'); }
  };

  const handleInvite = async () => {
    try {
      await userService.inviteUser(userId);
      toast.success('Invitation sent');
    } catch { toast.error('Failed to send invitation'); }
  };

  const filteredPermissions = permissions.filter(p =>
    p.toLowerCase().includes(permSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-surface rounded-2xl border border-border p-6 shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
          <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-surface rounded-2xl border border-border p-6 shadow-xl w-full max-w-3xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">User not found</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'details' as const, label: 'Details' },
    { key: 'roles' as const, label: 'Roles & Groups' },
    { key: 'permissions' as const, label: `Permissions (${permissions.length})` },
    { key: 'audit' as const, label: `Audit Log (${auditLog.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface text-muted-foreground border border-border'}`}>{user.status}</span>
            {user.isLocked && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Locked</span>}
            <button onClick={onClose} className="p-2 hover:bg-background rounded-lg text-muted-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-text'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Account Information</h4>
                <dl className="space-y-3">
                  <div><dt className="text-xs text-muted-foreground">Full Name</dt><dd className="text-text">{user.name}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="text-text">{user.email || '—'}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Phone</dt><dd className="text-text">{user.phoneNumber || '—'}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="text-text">{user.status}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Locked</dt><dd className="text-text">{user.isLocked ? `Yes (until ${user.lockoutEnd ? new Date(user.lockoutEnd).toLocaleString() : 'indefinite'})` : 'No'}</dd></div>
                </dl>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Activity</h4>
                <dl className="space-y-3">
                  <div><dt className="text-xs text-muted-foreground">Last Login</dt><dd className="text-text">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Created</dt><dd className="text-text">{new Date(user.createdAt).toLocaleString()}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Updated</dt><dd className="text-text">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'}</dd></div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Current Role</h4>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="font-semibold text-text">{user.roleName || user.role || 'No role'}</div>
                  {user.groupName && <div className="text-sm text-muted-foreground">Group: {user.groupName}</div>}
                </div>
              </div>
              {user.groups && user.groups.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">All Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.groups.map((g, i) => (
                      <span key={i} className="px-3 py-1 bg-background border border-border rounded-full text-sm text-text">{g}</span>
                    ))}
                  </div>
                </div>
              )}
              {user.roles && user.roles.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">All Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <input type="search" placeholder="Search permissions..." value={permSearch} onChange={e => setPermSearch(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <div className="flex flex-wrap gap-2">
                {filteredPermissions.length === 0 && <p className="text-muted-foreground text-sm">No permissions found.</p>}
                {filteredPermissions.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-background border border-border rounded-full text-xs text-text font-mono">{p}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              {auditLog.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No audit entries found.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-left">
                    <thead className="text-muted-foreground text-xs uppercase tracking-widest border-b border-border">
                      <tr>
                        <th className="px-3 py-2">Action</th>
                        <th className="px-3 py-2">Changes</th>
                        <th className="px-3 py-2">Performed By</th>
                        <th className="px-3 py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {auditLog.map(entry => (
                        <tr key={entry.id} className="hover:bg-background/50">
                          <td className="px-3 py-2 font-medium text-text">{entry.action}</td>
                          <td className="px-3 py-2 text-sm text-muted-foreground max-w-xs truncate">{entry.changes || '—'}</td>
                          <td className="px-3 py-2 text-sm text-muted-foreground">{entry.performedBy || 'System'}</td>
                          <td className="px-3 py-2 text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center mt-3">
                    <button onClick={() => setAuditPage(p => Math.max(1, p-1))} disabled={auditPage <= 1}
                      className="px-3 py-1 border border-border rounded-md text-text hover:bg-background disabled:opacity-50">Previous</button>
                    <span className="text-sm text-muted-foreground">Page {auditPage}</span>
                    <button onClick={() => setAuditPage(p => p+1)} disabled={auditLog.length < 20}
                      className="px-3 py-1 border border-border rounded-md text-text hover:bg-background disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-background/50 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <PermissionControl permission="User.Manage">
              {user.isLocked ? (
                <button onClick={handleUnlock} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:opacity-90">Unlock User</button>
              ) : (
                <button onClick={handleLock} className="px-3 py-1.5 bg-warning text-white rounded-lg text-sm hover:opacity-90">Lock User</button>
              )}
              <button onClick={handleResetPassword} className="px-3 py-1.5 border border-border rounded-lg text-sm text-text hover:bg-background">Reset Password</button>
              <button onClick={handleInvite} className="px-3 py-1.5 border border-border rounded-lg text-sm text-text hover:bg-background">Send Invite</button>
            </PermissionControl>
          </div>
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm hover:opacity-90">Close</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
