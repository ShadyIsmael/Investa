import React, { useEffect, useState } from 'react';
import { clientService } from '@/services/clientService';
import { Client, ClientProfile } from '@/types';
import { Icon } from '@/components/common/Icons';

const Missing: React.FC<{ label?: string; small?: boolean }> = ({ label = 'Not provided', small = false }) => (
  <div className={`${small ? 'text-xs text-slate-400 flex items-center gap-2' : 'text-sm text-slate-400 flex items-center gap-2'}`} title={label}>
    <Icon name="shield-check" className={`${small ? 'w-3 h-3' : 'w-4 h-4'} text-slate-400`} />
    <span>{label}</span>
  </div>
);

// Inline small editor to select a status; actual save & justification is handled by the parent as a global action
const StatusEditor: React.FC<{
  currentStatus: string;
  onChange: (newStatus: string) => void;
}> = ({ currentStatus, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string>(currentStatus);

  useEffect(() => setStatus(currentStatus), [currentStatus]);

  const handleSave = () => {
    onChange(status);
    setIsEditing(false);
  };

  return (
    <div>
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
              status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : ''
            } ${status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : ''} ${status === 'Suspended' ? 'bg-rose-50 text-rose-700 border border-rose-100' : ''}`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: status === 'Active' ? '#10b981' : status === 'Pending' ? '#f59e0b' : '#ef4444' }} />
            {status}
          </span>

          <button
            className="px-2 py-1 text-sm bg-white border rounded-lg"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 bg-white text-sm w-full max-w-xs">
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
            <option>Inactive</option>
          </select>

          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Apply</button>
            <button onClick={() => { setIsEditing(false); setStatus(currentStatus); }} className="px-3 py-2 bg-white border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ClientDetails: React.FC<{ clientId: string | number | null; onBack?: () => void }> = ({ clientId, onBack }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Local edit state for changes that will be submitted with a global justification
  const [editedStatus, setEditedStatus] = useState<string | null>(null);
  const [justification, setJustification] = useState<string>('');
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // Notify button state
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const fetchedProfile = await clientService.getClientProfile(clientId);
        if (!mounted) return;
        setProfile(fetchedProfile);

        const mapped: Client | null = fetchedProfile
          ? {
              id: String(fetchedProfile.userId ?? fetchedProfile.id ?? ''),
              name: `${fetchedProfile.firstName || ''} ${fetchedProfile.lastName || ''}`.trim(),
              email: fetchedProfile.email ?? '',
              registrationDate: fetchedProfile.createdAt ?? fetchedProfile.RegisteredDate ?? '',
              status: (fetchedProfile.statusName ?? 'Pending') as Client['status'],
              verificationPercent: typeof fetchedProfile.score === 'number' ? Math.round(Math.min(100, fetchedProfile.score)) : 0,
              avatar: fetchedProfile.personalImageUrl ?? `https://picsum.photos/seed/${String(fetchedProfile.userId ?? fetchedProfile.id ?? '')}/100/100`,
            }
          : null;
        setClient(mapped);
      } catch (e) {
        console.error('ClientDetails load error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [clientId]);

  // Keep editedStatus in sync with loaded profile
  useEffect(() => {
    setEditedStatus(profile?.statusName ?? client?.status ?? null);
    setDirty(false);
    setSaveError(null);
  }, [profile, client]);

  if (!clientId) return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-white border rounded-xl">Back</button>
      <p className="text-slate-600">No client selected.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Client Profile</h2>
          <p className="text-slate-500 text-[13px]">Detailed view for the selected client.</p>
        </div>
        <div>
          <button onClick={onBack} className="px-4 py-2 bg-white border border-slate-200 rounded-xl">Back to clients</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="text-slate-400">Loading client...</div>
        ) : client || profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="col-span-1">
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <img src={profile?.personalImageUrl ?? client?.avatar} alt="avatar" className="w-28 h-28 rounded-2xl object-cover shadow-md mb-4" />
                <h3 className="text-lg font-bold">{profile ? `${profile.firstName} ${profile.lastName}` : client?.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{profile?.businessTitle ?? '-'}</p>

                <div className="mt-3">
                  <StatusEditor
                    currentStatus={profile?.statusName ?? client?.status ?? 'Pending'}
                    onChange={(newStatus: string) => {
                      setEditedStatus(newStatus);
                      setDirty(true);
                      // reflect change visually immediately
                      setProfile((p) => (p ? { ...p, statusName: newStatus } : p));
                      setClient((c) => (c ? { ...c, status: newStatus as Client['status'] } : c));
                    }}
                  />
                </div>

                <div className="mt-4 w-full grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-400">Score</div>
                    <div className="font-bold">{profile?.score ?? client?.verificationPercent ?? 0}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-400">Credit</div>
                    <div className="font-bold">{profile?.credit != null ? profile.credit : <Missing small />}</div>
                  </div>
                </div>

                <div className="mt-4 w-full text-left">
                  <div className="text-xs text-slate-400">Contact</div>
                  <div className="font-medium">{(profile?.mobileNumber ?? profile?.phone ?? profile?.email ?? client?.email) || <Missing small />}</div>
                </div>

                <div className="mt-4 w-full flex gap-2">
                  <a href={`mailto:${profile?.email ?? client?.email ?? ''}`} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm text-center">Email</a>
                  <button
                    className={`px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm ${notified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}`}
                    onClick={async () => {
                      setSaveError(null);
                      if (!profile?.email && !profile?.mobileNumber && !profile?.phone && !client?.email) {
                        return setSaveError('No contact details available to notify');
                      }
                      setNotifying(true);
                      try {
                        // simulate notify call; replace with real API if available
                        await new Promise((r) => setTimeout(r, 700));
                        setNotified(true);
                        // ensure Save button becomes enabled by marking dirty and pre-filling justification if empty
                        setDirty(true);
                        if (!justification || justification.trim().length < 5) setJustification('Notified user');
                      } catch (e) {
                        console.error('notify error', e);
                        setSaveError('Failed to notify user.');
                      } finally {
                        setNotifying(false);
                      }
                    }}
                    type="button"
                    disabled={notifying}
                  >
                    {notifying ? 'Notifying...' : notified ? 'Notified' : 'Notify'}
                  </button>
                </div>
              </div>
            </aside>

            <div className="col-span-1 lg:col-span-2 space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-800 mb-2">Overview</h4>
                <p className="text-sm text-slate-600">{profile?.businessTitle ? `${profile.businessTitle} — ${profile.categoryIds?.join(', ') ?? ''}` : <Missing small label="No business title" />}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    <div className="text-xs text-slate-400">Registered</div>
                    <div className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : client?.registrationDate ? new Date(client.registrationDate).toLocaleDateString() : <Missing small />}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    <div className="text-xs text-slate-400">Last Updated</div>
                    <div className="font-medium">{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : <Missing small />}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-800 mb-2">Contact & Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">Email</div>
                    <div className="font-medium">{profile?.email ?? <Missing small />}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Mobile</div>
                    <div className="font-medium">{(profile?.mobileNumber ?? profile?.phone) ?? <Missing small />}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-slate-400">Address</div>
                    <div className="font-medium">{profile ? `${profile.address1 ?? ''}${profile.address2 ? ', ' + profile.address2 : ''} ${profile.city ? ', ' + profile.city : ''}` : '-'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-800 mb-2">Identity & Business</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">National ID</div>
                    <div className="font-medium">{profile?.nationalId ?? <Missing small />}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Birth Date</div>
                    <div className="font-medium">{profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Business Title</div>
                    <div className="font-medium">{profile?.businessTitle ?? <Missing small />}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Website</div>
                    <div className="font-medium">{profile?.websiteUrl ?? <Missing small />}</div>
                  </div>
                </div>
              </div>

              {/* Global justification & save area */}
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-800 mb-2">Save changes <span className="text-rose-600">*</span></h4>
                <p className="text-sm text-slate-600 mb-3">Justification is <strong>required</strong> to save changes. Provide a justification and click <strong>Save changes</strong> to apply them.</p>
                <textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Enter justification for these changes (required)" className={`w-full border rounded-lg p-2 h-28 text-sm ${saveError && (!justification || justification.trim().length < 5) ? 'border-rose-500' : ''}`} />

                <div className="mt-3 flex items-center gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg ${savingGlobal ? 'bg-indigo-500 text-white' : (!dirty || (justification || '').trim().length < 5) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
                    onClick={async () => {
                      if (!clientId) return;
                      if (!dirty) return setSaveError('No changes to save');
                      if (!justification || justification.trim().length < 5) return setSaveError('Please provide a justification (min 5 chars)');
                      setSavingGlobal(true);
                      setSaveError(null);
                      const prevProfile = profile;
                      const prevClient = client;
                      try {
                        const resp = await clientService.updateClientStatus(clientId as string | number, editedStatus ?? (profile?.statusName ?? client?.status), justification.trim());
                        // assume success; clear dirty and justification
                        setDirty(false);
                        setJustification('');
                      } catch (err) {
                        console.error('global save error', err);
                        setSaveError('Failed to save changes.');
                        // revert UI
                        setProfile(prevProfile);
                        setClient(prevClient);
                      } finally {
                        setSavingGlobal(false);
                      }
                    }}
                    disabled={savingGlobal || !dirty || (justification || '').trim().length < 5}
                  >
                    {savingGlobal ? 'Saving...' : 'Save changes'}
                  </button>

                  <button
                    onClick={() => {
                      // revert edits
                      setEditedStatus(profile?.statusName ?? client?.status ?? null);
                      setJustification('');
                      setDirty(false);
                      setSaveError(null);
                      // reload visual status
                      setProfile((p) => p ? { ...p } : p);
                      setClient((c) => c ? { ...c } : c);
                    }}
                    className="px-3 py-2 bg-white border rounded-lg"
                  >
                    Cancel
                  </button>
                </div>

                {saveError ? <div className="text-rose-600 text-sm mt-2">{saveError}</div> : null}
              </div>
          </div>
          </div>
        ) : (
          <div className="text-slate-500">Client not found.</div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
