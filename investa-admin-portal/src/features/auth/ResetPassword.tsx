
import React, { useState } from 'react';
import { Icon } from '@/components/common/Icons';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 p-8 md:p-10 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="help-circle" className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight text-center">{t('pages.identityRecovery', { defaultValue: 'Identity Recovery' })}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 text-center">{t('pages.identityRecoveryDescription', { defaultValue: 'Securely reset your terminal access credentials' })}</p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Associated Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Icon name="user-circle" className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder="name@investa.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all dark:text-slate-200"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-[0.15em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Generate Recovery Link'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900 rounded-3xl text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="shield-check" className="text-white w-6 h-6" />
                </div>
                <h3 className="text-emerald-900 dark:text-emerald-400 font-bold text-[15px] mb-2">Request Sent</h3>
                <p className="text-emerald-700 dark:text-emerald-500/80 text-[13px] leading-relaxed">
                  If <span className="font-bold text-emerald-800 dark:text-emerald-400">{email}</span> is in our system, you will receive instructions shortly.
                </p>
              </div>
            </div>
          )}

          <button 
            onClick={onBackToLogin}
            className="w-full mt-6 text-[11px] font-black text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="chevron-right" className="w-3 h-3 rotate-180" />
            Back to Authentication
          </button>
        </div>
      </div>
    </div>
  );
};
