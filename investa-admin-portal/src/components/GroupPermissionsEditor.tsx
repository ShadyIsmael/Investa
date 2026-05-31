import React, { useEffect, useState } from 'react';
import { groupService } from '@/services/groupService';

interface Props {
  groupId: number;
  initialPermissions?: string[];
}

const GroupPermissionsEditor: React.FC<Props> = ({ groupId, initialPermissions = [] }) => {
  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initialPermissions || []);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const all = await groupService.getAllPermissions();
        if (!mounted) return;
        setAvailable(all || []);
        setSelected(initialPermissions || []);
      } catch (e) {
        console.warn('Failed to load permissions', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [groupId]);

  useEffect(() => {
    setSelected(initialPermissions || []);
  }, [initialPermissions]);

  const toggle = (p: string) => setSelected(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p]);

  const save = async () => {
    setSaving(true);
    try {
      await groupService.updateGroupPermissions(groupId, selected);
      // minimal, friendly feedback
      alert('Permissions updated successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const filtered = available.filter(a => a.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <div className="text-sm text-muted-foreground">Loading permissions...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-sm font-semibold">Assign Permissions</label>
          <div className="text-xs text-muted-foreground">Choose permissions available to this group</div>
        </div>
        <input
          type="text"
          placeholder="Search permissions"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-2 py-1 border border-border rounded-md text-sm bg-surface"
        />
      </div>

      <div className="border border-border rounded-md bg-background p-3">
        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-sm text-muted-foreground">No permissions found</div>
          ) : (
            filtered.map((p, idx) => (
              <label key={`${p}-${idx}`} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(p)} onChange={() => toggle(p)} />
                <span className="truncate">{p}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setSelected(initialPermissions || [])} disabled={saving} className="px-3 py-1 border border-border rounded-md text-sm hover:bg-background">Reset</button>
        <button onClick={save} disabled={saving} className="px-3 py-1 bg-primary text-white rounded-md text-sm">{saving ? 'Saving...' : 'Save Permissions'}</button>
      </div>
    </div>
  );
};

export default GroupPermissionsEditor;
