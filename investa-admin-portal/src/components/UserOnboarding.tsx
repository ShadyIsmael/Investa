import React, { useState } from 'react';import { useTranslation } from 'react-i18next';import { userService } from '@/services/userService';
import { User } from '@/types';
import { toast } from 'react-toastify';

interface UserOnboardingProps {
  editingUser?: User | null;
  onClose: (created?: boolean) => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ editingUser, onClose }) => {
  const [name, setName] = useState(editingUser?.name || '');
  const [email, setEmail] = useState(editingUser?.email || '');
  const [groupId, setGroupId] = useState<number | null>(editingUser?.groupId ?? null);
  const [roleId, setRoleId] = useState<string | null>(editingUser?.roleId ?? null);
  const [status, setStatus] = useState<'Active' | 'Inactive'>(editingUser?.status || 'Active');
  const [groups, setGroups] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = { name, email, status };
      if (groupId) payload.groupId = groupId;
      if (roleId) {
        payload.roleId = roleId;
        const r = roles.find(x => String(x.id) === String(roleId));
        if (r) {
          payload.roleName = r.name;
          payload.groupName = r.groupName || groups.find(g => g.id === r.groupId)?.name;
        }
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
        toast.success('User updated');
      } else {
        await userService.createUser(payload);
        toast.success('User created');
      }
      onClose(true);
    } catch (err) {
      setError('Failed to save user');
      setLoading(false);
    }
  };

  const { t } = useTranslation();

  React.useEffect(() => {
    (async () => {
      try {
        const gs = await (await import('@/services/groupService')).groupService.getGroups();
        setGroups(gs || []);
        if (editingUser?.groupId) {
          const rs = await (await import('@/services/groupService')).groupService.getRolesByGroup(editingUser.groupId);
          setRoles(rs || []);
          setRoleId(editingUser.roleId ?? (rs[0]?.id ?? null));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [editingUser]);

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xl text-text">
      <h3 className="text-xl font-bold mb-4">{editingUser ? t('pages.editUser', { defaultValue: 'Edit User' }) : t('pages.newUser', { defaultValue: 'New User' })}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Group</label>
          <select
            value={groupId ?? ''}
            onChange={async (e) => {
              const gid = e.target.value ? Number(e.target.value) : null;
              setGroupId(gid);
              setRoleId(null);
              if (gid) {
                try {
                  const rs = await (await import('@/services/groupService')).groupService.getRolesByGroup(gid);
                  setRoles(rs || []);
                  setRoleId(rs[0]?.id ?? null);
                } catch {
                  setRoles([]);
                }
              } else {
                setRoles([]);
              }
            }}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={loading}
          >
            <option value="">Select group...</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Role</label>
          <select
            value={roleId ?? ''}
            onChange={(e) => setRoleId(e.target.value || null)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={loading || !groupId}
          >
            <option value="">Select role...</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={loading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 border border-border rounded-lg text-text hover:bg-background transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
            disabled={loading}
          >
            {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserOnboarding;
