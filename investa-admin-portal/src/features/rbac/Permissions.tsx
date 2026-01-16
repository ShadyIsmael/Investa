import React from 'react';

export const Permissions: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permissions Management</h2>
          <p className="text-slate-500 text-sm">View and manage permission assignments</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Permissions Are Role-Based</h3>
          <p className="text-slate-600">
            Permissions are automatically managed through the Group-Bound RBAC system. 
            Users inherit permissions based on their assigned Role within a Group.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-left text-sm space-y-2">
            <p className="font-semibold">To manage permissions:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Navigate to the <strong>Roles</strong> screen</li>
              <li>Create or edit a role within a specific Group</li>
              <li>Assign the role to users via <strong>Users</strong> screen</li>
            </ol>
          </div>
          <p className="text-xs text-slate-500">
            This ensures that permissions are strictly bound to organizational groups, 
            preventing unauthorized cross-departmental access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
