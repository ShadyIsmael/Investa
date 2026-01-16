import React, { useState } from 'react';
import { Icon } from '@/components/common/Icons';

const CONFIG_OPTIONS = [
  { key: 'theme', label: 'System Theme', icon: 'moon-stars', description: 'Light/Dark mode for the portal.' },
  { key: 'currency', label: 'Default Currency', icon: 'currency-dollar', description: 'Set the default currency for all financial operations.' },
  { key: 'timezone', label: 'Timezone', icon: 'clock', description: 'Set the system timezone.' },
  { key: 'notifications', label: 'Notifications', icon: 'bell', description: 'Enable/disable system notifications.' },
  { key: 'language', label: 'Language', icon: 'language', description: 'Set the default language.' },
];

interface SystemConfigurationProps {
  themePref: 'light' | 'dark' | 'system';
  setThemePref: (theme: 'light' | 'dark' | 'system') => void;
}

const SystemConfiguration: React.FC<SystemConfigurationProps> = ({ themePref, setThemePref }) => {
  const [selected, setSelected] = useState(CONFIG_OPTIONS[0].key);
  const [saved, setSaved] = useState<string | null>(null);

  // show a small saved confirmation when preference changes
  React.useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(null), 1800);
    return () => clearTimeout(t);
  }, [saved]);

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setThemePref(value);
    setSaved('Theme updated');
  };

  return (
    <div className="flex gap-8">
      {/* Configuration List */}
      <aside className="w-64 bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Configuration List</h2>
        <ul className="space-y-2">
          {CONFIG_OPTIONS.map(option => (
            <li key={option.key}>
              <button
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors duration-150 ${selected === option.key ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
                onClick={() => setSelected(option.key)}
              >
                <Icon name={option.icon} className="w-5 h-5" />
                <span className="font-semibold">{option.label}</span>
              </button>
              <p className="ml-8 text-xs text-slate-400 dark:text-slate-500">{option.description}</p>
            </li>
          ))}
        </ul>
      </aside>

      {/* Configuration Panel */}
      <section className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-md">
        <h2 className="text-lg font-bold mb-4">{CONFIG_OPTIONS.find(o => o.key === selected)?.label} Settings</h2>
        <div>
          {selected === 'theme' && (
            <div>
              <label className="block mb-2 font-medium">Theme</label>
              <div className="flex items-center gap-3">
                <select
                  className="px-3 py-2 rounded border w-64"
                  value={themePref}
                  onChange={e => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
                <div className="text-sm text-slate-500 dark:text-slate-400">Preview</div>
                <div className="w-10 h-6 rounded flex items-center justify-center border border-slate-200 dark:border-slate-800" aria-hidden>
                  <div className={`${themePref === 'dark' ? 'w-full h-full rounded bg-slate-900' : 'w-full h-full rounded bg-white'}`}></div>
                </div>
              </div>
              <div className="theme-hint">"System Default" follows your operating system preference.</div>
              {saved && <div className="mt-4 inline-block bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded">{saved}</div>}
            </div>
          )}
          {selected === 'currency' && (
            <div>
              <label className="block mb-2 font-medium">Default Currency</label>
              <select className="px-3 py-2 rounded border w-64">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
          )}
          {selected === 'timezone' && (
            <div>
              <label className="block mb-2 font-medium">Timezone</label>
              <select className="px-3 py-2 rounded border w-64">
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>
          )}
          {selected === 'notifications' && (
            <div>
              <label className="block mb-2 font-medium">Notifications</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox" />
                  Enable System Notifications
                </label>
              </div>
            </div>
          )}
          {selected === 'language' && (
            <div>
              <label className="block mb-2 font-medium">Language</label>
              <select className="px-3 py-2 rounded border w-64">
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SystemConfiguration;
