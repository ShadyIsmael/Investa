import React, { useState } from 'react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { toast } from 'react-toastify';

interface UserOnboardingProps {
  editingUser?: User | null;
  onClose: (created?: boolean) => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ editingUser, onClose }) => {
  const [name, setName] = useState(editingUser?.name || '');
  const [email, setEmail] = useState(editingUser?.email || '');
  const [role, setRole] = useState<'Admin' | 'Editor' | 'Viewer'>(editingUser?.role || 'Viewer');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Pending'>(editingUser?.status || 'Active');
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
      if (editingUser) {
        await userService.updateUser(editingUser.id, { name, email, role, status });
        toast.success('User updated');
      } else {
        await userService.createUser({ name, email, role, status });
        toast.success('User created');
      }
      onClose(true);
    } catch (err) {
      setError('Failed to save user');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'New User'}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'Admin' | 'Editor' | 'Viewer')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Pending')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
