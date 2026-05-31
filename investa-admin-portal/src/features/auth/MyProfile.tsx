
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/api/api';
import { getUserProfile } from '@/services/profileService';
import { User } from '@/types';
import { Icon } from '@/components/common/Icons';

interface MyProfileProps {
  user: User;
  onProfileUpdated?: (profile: { name: string; email: string; avatar: string }) => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({ user, onProfileUpdated }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [avatar, setAvatar] = useState<string>(user.avatar);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const split = (full: string) => {
    const parts = String(full || '').trim().split(/\s+/);
    return {
      firstName: parts.slice(0, -1).length ? parts.slice(0, -1).join(' ') : (parts[0] || ''),
      lastName: parts.length > 1 ? parts[parts.length - 1] : ''
    };
  };

  const nameParts = split(user.name || '');

  const [formData, setFormData] = useState({
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    email: user.email || '',
    phoneCountry: '+1',
    phoneNumber: '',
    gender: '',
    nationality: '',
    country: '',
    dateOfBirth: ''
  });


  const parsePhone = (value: string) => {
    const cleaned = String(value || '').replace(/[^\d+]/g, '');
    const knownCodes = ['+234', '+91', '+61', '+44', '+20', '+1'];
    let phoneCountry = '+1';
    let phoneNumber = cleaned.replace(/^\+/, '');

    if (cleaned.startsWith('+')) {
      const match = knownCodes.find(code => cleaned.startsWith(code));
      if (match) {
        phoneCountry = match;
        phoneNumber = cleaned.slice(match.length).replace(/[^\d]/g, '');
      }
    } else {
      const digits = cleaned.replace(/\D/g, '');
      if (digits.startsWith('20')) {
        phoneCountry = '+20';
        phoneNumber = digits.slice(2);
      } else if (digits.startsWith('234')) {
        phoneCountry = '+234';
        phoneNumber = digits.slice(3);
      } else if (digits.startsWith('91')) {
        phoneCountry = '+91';
        phoneNumber = digits.slice(2);
      } else if (digits.startsWith('61')) {
        phoneCountry = '+61';
        phoneNumber = digits.slice(2);
      } else if (digits.startsWith('44')) {
        phoneCountry = '+44';
        phoneNumber = digits.slice(2);
      } else if (digits.startsWith('1')) {
        phoneCountry = '+1';
        phoneNumber = digits.slice(1);
      } else {
        phoneCountry = '+1';
        phoneNumber = digits;
      }
    }

    return { phoneCountry, phoneNumber };
  };

  // When the parent updates the `user` prop (e.g. after fetching profile), sync form and avatar
  useEffect(() => {
    const parts = split(user.name || '');
    setFormData(prev => ({
      ...prev,
      firstName: parts.firstName,
      lastName: parts.lastName,
      email: user.email || prev.email
    }));
    if (user.avatar) setAvatar(user.avatar);
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (!profile) return;

        setFormData(prev => ({
          ...prev,
          firstName: profile.firstName || prev.firstName,
          lastName: profile.lastName || prev.lastName,
          email: profile.email || prev.email,
          gender: profile.gender || prev.gender,
          nationality: profile.nationality || prev.nationality,
          country: profile.country || prev.country,
          dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : prev.dateOfBirth,
          ...parsePhone(profile.phone || ''),
        }));

        if (profile.avatarUrl) setAvatar(profile.avatarUrl);
        onProfileUpdated?.({
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.name,
          email: profile.email || user.email || '',
          avatar: profile.avatarUrl || user.avatar || '',
        });
      } catch (err) {
        console.warn('Failed to load profile details', err);
      }
    };

    loadProfile();
  }, []);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formattedPhone = (formData.phoneNumber || '').replace(/\s+/g, '');
      const mobile = formattedPhone ? `${formData.phoneCountry || ''}${formattedPhone}` : null;
      const payload: Record<string, any> = {
        basicInfo: {
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          gender: formData.gender || null,
          nationality: formData.nationality || null,
          country: formData.country || null,
          dateOfBirth: formData.dateOfBirth || null,
          avatarUrl: avatar || null,
        },
        contactInfo: {
          email: formData.email || null,
          phone1: mobile || null,
        }
      };

      await api.put('/api/profile/me', payload);
      const updatedProfile = await getUserProfile();
      if (updatedProfile) {
        const updatedName = `${updatedProfile.firstName || ''} ${updatedProfile.lastName || ''}`.trim() || user.name;
        setFormData(prev => ({
          ...prev,
          firstName: updatedProfile.firstName || prev.firstName,
          lastName: updatedProfile.lastName || prev.lastName,
          email: updatedProfile.email || prev.email,
          gender: updatedProfile.gender || prev.gender,
          nationality: updatedProfile.nationality || prev.nationality,
          country: updatedProfile.country || prev.country,
          dateOfBirth: updatedProfile.dateOfBirth ? String(updatedProfile.dateOfBirth).slice(0, 10) : prev.dateOfBirth,
          ...parsePhone(updatedProfile.phone || ''),
        }));
        setAvatar(updatedProfile.avatarUrl || avatar);
        onProfileUpdated?.({
          name: updatedName,
          email: updatedProfile.email || user.email || '',
          avatar: updatedProfile.avatarUrl || avatar,
        });
      }

      showToast('Profile saved successfully', 'success');
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Failed to save profile', err);
      showToast(err?.message ? `Save failed: ${err.message}` : 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInput = (k: string, v: string) => setFormData(prev => ({ ...prev, [k]: v }));

  const handleImageClick = () => {
    try { fileInputRef.current?.click(); } catch (e) { /* ignore */ }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setSelectedFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ''));
    };
    reader.readAsDataURL(f);
  };

  const rolePermissions = {
    Admin: ["Full System Access", "User Management", "Financial Configuration", "Audit Logs"],
    Editor: ["Content Management", "Support Ticket Handling", "Financial View Access"],
    Viewer: ["Read-only Dashboard", "Reporting Export", "Support View"]
  };

  const { t } = useTranslation();

  return (
    <>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{t('pages.myProfile', { defaultValue: 'My Profile' })}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium">{t('pages.myProfileDescription', { defaultValue: 'Manage your personal identity and security preferences.' })}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-[13px] font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Icon name="shield-check" className="w-4 h-4" />
          )}
          {isSaving ? 'Syncing...' : 'Save Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <img 
                  src={avatar}
                  alt="Profile" 
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-50 dark:border-slate-800 shadow-inner" 
                />
                <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/20 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 dark:bg-slate-800/90 text-[12px] px-3 py-1 rounded-full font-bold">Change</div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{`${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim() || user.name}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900 text-[10px] font-black uppercase tracking-widest">
                {user.role} Status
              </div>
            </div>
          </div>
          <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Role Privileges</h4>
            <div className="space-y-3 relative z-10">
              {rolePermissions[user.role].map((perm, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-200">
                  <Icon name="shield-check" className="w-4 h-4 text-emerald-400" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex items-center gap-2">
              <Icon name="user-circle" className="w-4 h-4 text-indigo-600" />
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Account Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInput('firstName', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInput('lastName', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInput('email', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInput('gender', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInput('nationality', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInput('country', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInput('dateOfBirth', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>


              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Mobile Phone</label>
                <div className="flex gap-2">
                  <select value={formData.phoneCountry} onChange={(e) => handleInput('phoneCountry', e.target.value)} className="px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm">
                    <option value="+1">+1</option>
                    <option value="+20">+20</option>
                    <option value="+44">+44</option>
                    <option value="+61">+61</option>
                    <option value="+234">+234</option>
                    <option value="+91">+91</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInput('phoneNumber', e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {toast && (
      <div className={`fixed right-6 bottom-6 z-50 max-w-xs w-full`}>
        <div className={`px-4 py-3 rounded-xl shadow-lg text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.message}
        </div>
      </div>
    )}
    </>
  );
};
