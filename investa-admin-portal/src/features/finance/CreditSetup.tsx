
import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/common/Icons';

export const CreditSetup: React.FC = () => {
  const [credits, setCredits] = useState<string>('');
  // Persistable standard rate: default bundle 10 credits => 100 EGP
  const [standardCredits, setStandardCredits] = useState<number>(() => {
    try {
      const v = localStorage.getItem('standardCredits');
      return v ? Number(v) : 10;
    } catch (e) {
      return 10;
    }
  });
  const [standardPrice, setStandardPrice] = useState<number>(() => {
    try {
      const v = localStorage.getItem('standardPrice');
      return v ? Number(v) : 100;
    } catch (e) {
      return 100;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editCredits, setEditCredits] = useState<string>(String(standardCredits));
  const [editPrice, setEditPrice] = useState<string>(String(standardPrice));
  const [saving, setSaving] = useState(false);

  const EXCHANGE_RATE = useMemo(() => {
    if (!standardCredits || standardCredits === 0) return 0;
    return standardPrice / standardCredits;
  }, [standardCredits, standardPrice]);

  const egpAmount = useMemo(() => {
    const val = parseFloat(credits);
    if (isNaN(val) || val < 0) return 0;
    return val * EXCHANGE_RATE;
  }, [credits, EXCHANGE_RATE]);

  const isValid = useMemo(() => {
    const val = parseFloat(credits);
    return !isNaN(val) && val > 0;
  }, [credits]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Credit Pricing Setup</h2>
          <p className="text-slate-500 text-[13px] font-medium">Configure exchange rates and purchasing logic for system credits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Icon name="adjustments" className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-800">Exchange Rate Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Standard Rate
              </label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {!isEditing ? (
                  <>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Credits</p>
                      <p className="text-lg font-black text-slate-800">{standardCredits}</p>
                    </div>
                    <div className="text-slate-300">
                      <Icon name="chevron-right" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Price (EGP)</p>
                      <p className="text-lg font-black text-indigo-600">{standardPrice.toFixed(2)}</p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          setEditCredits(String(standardCredits));
                          setEditPrice(String(standardPrice));
                          setIsEditing(true);
                        }}
                        className="text-sm font-semibold px-3 py-1 bg-indigo-600 text-white rounded-lg"
                      >
                        Edit
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Credits</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={editCredits}
                        onChange={(e) => setEditCredits(e.target.value)}
                        className="w-full mt-1 p-2 rounded-md border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Price (EGP)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full mt-1 p-2 rounded-md border border-slate-200"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2 justify-end mt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 rounded-md bg-white text-slate-700 border"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const c = Number(editCredits);
                          const p = Number(editPrice);
                          if (isNaN(c) || c <= 0 || isNaN(p) || p < 0) return;
                          setSaving(true);
                          try {
                            // persist to localStorage
                            localStorage.setItem('standardCredits', String(c));
                            localStorage.setItem('standardPrice', String(p));
                            setStandardCredits(c);
                            setStandardPrice(p);
                            setIsEditing(false);
                          } catch (e) {
                            console.error('Failed to save standard rate', e);
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="px-3 py-1 rounded-md bg-indigo-600 text-white"
                        disabled={saving}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-400 italic">Effective rate: 1 Credit = {EXCHANGE_RATE.toFixed(2)} EGP</p>
            </div>

            <div className="pt-4">
              <label htmlFor="credits-input" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Purchase Simulation
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="cash" className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="credits-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter credit amount (e.g. 50)"
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all shadow-sm ${
                    credits && !isValid 
                      ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' 
                      : 'border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500'
                  }`}
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                />
              </div>
              {credits && !isValid && (
                <p className="mt-2 text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <Icon name="activity" className="w-3 h-3" />
                  Please enter a positive credit amount.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-indigo-100 font-bold text-[13px] uppercase tracking-[0.2em] mb-8">Purchase Summary</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-indigo-100/70 text-sm font-medium">Credits to Buy</span>
                <span className="text-2xl font-black">{isValid ? credits : '0'}</span>
              </div>
              
              <div className="flex justify-between items-end">
                <span className="text-indigo-100/70 text-sm font-medium">Total Cost</span>
                <div className="text-right">
                  <span className="text-4xl font-black">£{egpAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1">Egyptian Pounds</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-6 border-t border-white/10">
             <button 
              disabled={!isValid}
              className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95"
             >
               Apply Pricing Logic
             </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        </div>
      </div>
    </div>
  );
};
