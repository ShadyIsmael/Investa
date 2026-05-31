import React, { useEffect, useState } from 'react';
import { clientService } from '@/services/clientService';
import { Client, ClientProfile } from '@/types';
import { Icon } from '@/components/common/Icons';
import { useTranslation } from 'react-i18next';

const Missing: React.FC<{ label?: string; small?: boolean }> = ({ label = 'Not provided', small = false }) => (
  <div className={`${small ? 'text-xxs text-muted-foreground flex items-center gap-2' : 'text-sm text-muted-foreground flex items-center gap-2'}`} title={label}>
    <Icon name="shield-check" className={`${small ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground/50`} />
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
          <span className={`
            px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider flex items-center gap-2
            ${status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : ''}
            ${status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : ''}
            ${status === 'Suspended' ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : ''}
            ${status === 'Inactive' ? 'bg-background text-muted-foreground border-border' : ''}
          `}>
            <span className={`w-2 h-2 rounded-full ${
              status === 'Active' ? 'bg-emerald-500' : status === 'Pending' ? 'bg-amber-500' : status === 'Suspended' ? 'bg-rose-500' : 'bg-muted'
            }`} />
            {status}
          </span>

          <button
            className="px-2.5 py-1 text-xs bg-surface border border-border rounded-lg text-muted-foreground hover:text-text transition-colors font-bold uppercase tracking-wider"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full max-w-xs pl-3 pr-8 py-2 bg-surface border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-text">
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
            <option>Inactive</option>
          </select>

          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Apply</button>
            <button onClick={() => { setIsEditing(false); setStatus(currentStatus); }} className="px-3 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-text transition-all">Cancel</button>
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
  const { t } = useTranslation();
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
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-text transition-all">Back</button>
      <p className="text-muted-foreground font-medium">No client selected.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">{t('pages.clientProfile', { defaultValue: 'Client Profile' })}</h2>
          <p className="text-muted-foreground text-sm font-medium">{t('pages.clientProfileDescription', { defaultValue: 'Detailed view for the selected client.' })}</p>
        </div>
        <div>
          <button onClick={onBack} className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-text transition-all shadow-sm">Back to clients</button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        {loading ? (
          <div className="text-muted-foreground animate-pulse font-medium">Loading client...</div>
        ) : client || profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="col-span-1">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl border border-border">
                <img src={profile?.personalImageUrl ?? client?.avatar} alt="avatar" className="w-28 h-28 rounded-2xl object-cover shadow-md mb-4 border border-border" />
                <h3 className="text-lg font-bold text-text">{profile ? `${profile.firstName} ${profile.lastName}` : client?.name}</h3>
                <div className="mt-2 inline-flex items-center gap-2 text-xxs font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-100/80 rounded-full px-3 py-1">
                  <span>Name</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{profile?.businessTitle ?? '-'}</p>

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
                  <div className="bg-surface p-3 rounded-lg border border-border shadow-sm">
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Score</div>
                    <div className="font-bold text-text">{profile?.score ?? client?.verificationPercent ?? 0}</div>
                  </div>
                  <div className="bg-surface p-3 rounded-lg border border-border shadow-sm">
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Credit</div>
                    <div className="font-bold text-text">{profile?.credit != null ? profile.credit : <Missing small />}</div>
                  </div>
                </div>

                <div className="mt-4 w-full text-left">
                  <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Contact</div>
                  <div className="font-medium text-text">{(profile?.mobileNumber ?? profile?.phone ?? profile?.email ?? client?.email) || <Missing small />}</div>
                </div>


                <div className="mt-4 w-full flex gap-2">
                  <a href={`mailto:${profile?.email ?? client?.email ?? ''}`} className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold text-center shadow-lg shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-wider">Email</a>
                  <button
                    className={`px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-text transition-all uppercase tracking-wider ${notified ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10' : ''}`}
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
              <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
                <h4 className="font-bold text-text mb-2 tracking-tight">Overview</h4>
                <p className="text-sm text-muted-foreground">{profile?.businessTitle ? `${profile.businessTitle} — ${profile.categoryIds?.join(', ') ?? ''}` : <Missing small label="No business title" />}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-background p-3 rounded-lg text-sm border border-border/50">
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Registered</div>
                    <div className="font-medium text-text">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : client?.registrationDate ? new Date(client.registrationDate).toLocaleDateString() : <Missing small />}</div>
                  </div>

                  <div className="bg-background p-3 rounded-lg text-sm border border-border/50">
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Last Updated</div>
                    <div className="font-medium text-text">{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : <Missing small />}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
                <h4 className="font-bold text-text mb-2 tracking-tight">Contact & Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Email</div>
                    <div className="font-medium text-text">{profile?.email ?? <Missing small />}</div>
                  </div>
                  <div>
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Mobile</div>
                    <div className="font-medium text-text">{(profile?.mobileNumber ?? profile?.phone) ?? <Missing small />}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Address</div>
                    <div className="font-medium text-text">{profile ? `${profile.address1 ?? ''}${profile.address2 ? ', ' + profile.address2 : ''} ${profile.city ? ', ' + profile.city : ''}` : '-'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
                <h4 className="font-bold text-text mb-2 tracking-tight">Identity & Business</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">National ID</div>
                    <div className="font-medium text-text">{profile?.nationalId ?? <Missing small />}</div>
                  </div>
                  <div>
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Birth Date</div>
                    <div className="font-medium text-text">{profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Business Title</div>
                    <div className="font-medium text-text">{profile?.businessTitle ?? <Missing small />}</div>
                  </div>
                  <div>
                    <div className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Website</div>
                    <div className="font-medium text-text">{profile?.websiteUrl ?? <Missing small />}</div>
                  </div>
                </div>
              </div>

              {/* Global justification & save area */}
              <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
                <h4 className="font-bold text-text mb-2 tracking-tight">Save changes <span className="text-error">*</span></h4>
                <p className="text-sm text-muted-foreground mb-3 font-medium">Justification is <strong>required</strong> to save changes. Provide a justification and click <strong>Save changes</strong> to apply them.</p>
                <textarea 
                  value={justification} 
                  onChange={(e) => setJustification(e.target.value)} 
                  placeholder="Enter justification for these changes (required)" 
                  className={`w-full bg-background border rounded-xl p-3 h-28 text-sm text-text focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 ${saveError && (!justification || justification.trim().length < 5) ? 'border-error' : 'border-border'}`} 
                />

                <div className="mt-4 flex items-center gap-2">
                  <button
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg ${savingGlobal ? 'bg-primary/50 text-white cursor-wait' : (!dirty || (justification || '').trim().length < 5) ? 'bg-muted/10 text-muted-foreground/50 cursor-not-allowed shadow-none' : 'bg-primary text-white shadow-primary/20 hover:opacity-90 active:scale-95'}`}
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
                    className="px-4 py-2 bg-surface border border-border rounded-xl font-bold text-sm text-muted-foreground hover:text-text transition-all"
                  >
                    Cancel
                  </button>
                </div>

                {saveError ? <div className="text-error text-xs font-bold mt-3 animate-in fade-in slide-in-from-top-1">{saveError}</div> : null}
              </div>
          </div>
          </div>
        ) : (
          <div className="text-muted-foreground font-medium flex items-center gap-2 p-10 justify-center">
            <Icon name="search" className="w-5 h-5 opacity-20" />
            Client not found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
