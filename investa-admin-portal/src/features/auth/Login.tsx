
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icons';
import {
  api,
  getBaseUrl,
  setBaseUrl,
  setUseMocks,
  ADMIN_REFRESH_TOKEN_KEY,
  ADMIN_TOKEN_EXPIRES_AT_KEY,
  ADMIN_REFRESH_EXPIRES_AT_KEY,
} from '@/api/api';
import { parseJWT, usePermissions } from '@/context/AuthContext';

interface LoginProps {
  onLogin?: (redirect?: string) => void; // Deprecated - kept for backward compatibility
  onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onForgotPassword }) => {
  const { t } = useTranslation();
  const { login } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: 'admin@investa.com', password: 'P@ssw0rd' });
  const [error, setError] = useState<string | null>(null);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(getBaseUrl());
  const [useMocksLocal, setUseMocksLocal] = useState(localStorage.getItem('useMocks') !== 'false');

  const handleSaveApi = () => {
    setBaseUrl(apiUrlInput || '');
    setUseMocks(useMocksLocal);
    try { localStorage.setItem('useMocks', String(useMocksLocal)); } catch {}
    setShowApiSettings(false);
  };

  const performLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // Endpoint provided: /api/Auth/login-email
      const payload = { email: formData.email, password: formData.password };
      const resp = await api.post<any>('/api/v1/Auth/login-email', payload);

      // Try common token fields (support nested data)
      const token = resp?.token || resp?.access_token || resp?.data?.token || resp?.authToken || resp?.tokenId || resp?.data?.accessToken;
      if (token) {
        const parsed = parseJWT(token);
        const isOrganizationalUser = parsed?.user?.userType?.toLowerCase() === 'orguser';
        const hasPortalPermission = Boolean(parsed?.permissions?.some((permission) => permission.trim().length > 0));
        if (!isOrganizationalUser || !hasPortalPermission) {
          setError('This account is not eligible to access the Admin Portal.');
          return;
        }

        // Use new permission-based login (this persists token via AuthContext)
        login(token, 'dashboard');
        
        // Store additional metadata if available
        if (resp?.data?.refreshToken) localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, resp.data.refreshToken);
        if (resp?.data?.expiresAt) localStorage.setItem(ADMIN_TOKEN_EXPIRES_AT_KEY, resp.data.expiresAt);
        if (resp?.data?.refreshExpiresAt) localStorage.setItem(ADMIN_REFRESH_EXPIRES_AT_KEY, resp.data.refreshExpiresAt);
        // Clean legacy shared keys to avoid collisions with Client Portal auth state.
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('refreshExpiresAt');
        
        // Backward compatibility - call legacy handler if provided
        if (onLogin) onLogin('dashboard');
        
        return;
      }

      // Show backend message if available
      const serverMsg = resp?.message || resp?.data?.message;
      if (serverMsg) {
        setError(String(serverMsg));
      } else {
        setError('Login failed: no token returned');
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin();
  };

  const quickConnectAndLogin = async () => {
    const configuredBaseUrl = getBaseUrl();
    setApiUrlInput(configuredBaseUrl);
    setBaseUrl(configuredBaseUrl);
    setUseMocks(false);
    setUseMocksLocal(false);
    // small timeout to ensure state propagation
    setTimeout(() => performLogin(), 50);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="bg-surface rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-border p-8 md:p-10 relative z-10">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4 transform hover:scale-110 transition-transform duration-300">
              <Icon name="hands" className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-text tracking-tight">{t('pages.investaPortal', { defaultValue: 'Investa Portal' })}</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">{t('pages.investaPortalDescription', { defaultValue: 'Institutional Grade Financial Access' })}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xxs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Corporate Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Icon name="user-circle" className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="name@investa.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-text"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xxs font-black text-muted-foreground uppercase tracking-[0.2em]">Security Key</label>
                <button 
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xxs font-black text-primary uppercase tracking-widest hover:underline"
                >
                  Lost Access?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Icon name="shield-check" className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-text"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 dark:text-slate-400">Keep session active for 30 days</label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-[0.15em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Icon name="logout" className="w-4 h-4 rotate-180" />
                  Initialize Session
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="text-xxs font-black text-muted-foreground uppercase tracking-widest">Enterprise Auth v3.1</span>
              <div className="flex gap-2">
                 <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                 <span className="text-xxs font-black text-emerald-600 uppercase tracking-widest">Network Stable</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowApiSettings(s => !s)} className="text-xxs font-black text-primary uppercase tracking-widest hover:underline">
                API Settings
              </button>
            </div>
          </div>

          {showApiSettings && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-slate-500">Base URL</label>
                <input value={apiUrlInput} onChange={e => setApiUrlInput(e.target.value)} className="ml-2 flex-1 py-1 px-2 bg-white dark:bg-slate-950 border border-slate-200 rounded text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500">Use Real API</label>
                <input type="checkbox" checked={!useMocksLocal} onChange={e => { setUseMocksLocal(!e.target.checked); setUseMocks(!e.target.checked); }} />
                <div className="flex-1 text-right">
                  <button type="button" onClick={handleSaveApi} className="text-sm font-black text-indigo-600 hover:underline">Save</button>
                  <button type="button" onClick={quickConnectAndLogin} className="ml-4 text-sm font-black text-emerald-600 hover:underline">Quick Connect & Login</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
