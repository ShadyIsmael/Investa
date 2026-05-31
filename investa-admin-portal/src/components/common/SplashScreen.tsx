
import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icons';

export const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Core...');

  useEffect(() => {
    const statusMessages = [
      'Initializing Core...',
      'Securing Neural Handshake...',
      'Syncing Ledger Data...',
      'Loading Financial Assets...',
      'System Ready.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 1;
        
        // Update status message based on progress
        const step = Math.floor(next / 25);
        if (step !== currentStep && step < statusMessages.length) {
          currentStep = step;
          setStatus(statusMessages[step]);
        }
        
        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Animated Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/20 mb-8 animate-in zoom-in duration-1000">
          <Icon name="hands" className="text-white w-10 h-10 animate-pulse" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-text tracking-tighter mb-2">INVESTA</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">Institutional Ledger Portal</p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-4">
          <div className="h-1 w-full bg-surface border border-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/60 text-[9px] font-black uppercase tracking-widest animate-pulse">
              {status}
            </span>
            <span className="text-text font-mono text-[10px] font-bold">
              {progress}%
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 opacity-30">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-text uppercase tracking-widest">Secure Environment</span>
          </div>
          <p className="text-muted-foreground/50 text-[8px] font-bold uppercase tracking-widest mt-2">v4.0.12 Stable Build</p>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
    </div>
  );
};
