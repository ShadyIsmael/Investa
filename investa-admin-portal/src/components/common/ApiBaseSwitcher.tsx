import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const PRESET_URLS = [
  'http://desktop-dih7cqh:5235',
  'http://desktop-dih7cqh:5000',
  'http://localhost:5235',
  'http://localhost:5000'
];

export default function ApiBaseSwitcher() {
  const [apiBase, setApiBase] = useLocalStorage<string>('apiBase', 'http://desktop-dih7cqh:5235');
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(apiBase);

  function apply(url: string) {
    setApiBase(url.replace(/\/+$/, ''));
    updateRuntime(url);
    setOpen(false);
  }

  function updateRuntime(url: string) {
    try {
      // set global and meta tag for runtime pickup
      (window as unknown as { __INVESTA_API_BASE?: string }).__INVESTA_API_BASE = url;
      let m = document.querySelector('meta[name="investa-api-base"]');
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute('name', 'investa-api-base');
        document.head.appendChild(m);
      }
      m.setAttribute('content', url);
      // Only log in development
      if (import.meta.env.DEV) {
        console.info('[Admin] API base set to', url);
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('Failed to set runtime API base', e);
      }
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="px-2 py-1 rounded bg-slate-800 text-sm text-white hover:bg-slate-700">
        API: {apiBase}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded shadow p-3 z-50">
          <div className="mb-2 text-sm font-semibold">Select API Base</div>
          <div className="space-y-2">
            {PRESET_URLS.map(u => (
              <div key={u} className="flex justify-between items-center">
                <div className="truncate mr-2">{u}</div>
                <button onClick={() => apply(u)} className="text-blue-600 text-sm">Use</button>
              </div>
            ))}
            <div className="border-t pt-2">
              <label className="block text-xs text-slate-500">Custom</label>
              <input value={custom} onChange={e => setCustom(e.target.value)} className="mt-1 w-full rounded border px-2 py-1 text-sm" />
              <div className="flex justify-end mt-2">
                <button onClick={() => apply(custom)} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
