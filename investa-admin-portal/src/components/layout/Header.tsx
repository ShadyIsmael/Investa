import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icons';
import { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { WorkspaceContext } from '@/components/layout/WorkspaceContext';
import { getConfiguredEnvironment } from '@/core/environment';
import { isFopxPath } from '@/core/navigation';
import { useSystemHealth } from '@/core/systemHealth';

interface HeaderProps {
  toggleSidebar: () => void;
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ toggleSidebar, currentUser, onLogout, theme, toggleTheme }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const health = useSystemHealth();
  const environment = getConfiguredEnvironment();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';
  const inWorkspace = isFopxPath(location.pathname);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLang = () => i18n.changeLanguage(isRTL ? 'en' : 'ar');
  const notificationRoute = inWorkspace ? '/admin/fopx/notifications' : '/admin/notifications';

  return (
    <header className="min-h-14 flex-shrink-0 flex items-center justify-between gap-3 px-4 lg:px-5 bg-card border-b border-border" style={{ zIndex: 'var(--z-fixed)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={toggleSidebar} className="btn-ghost p-2 md:hidden" aria-label={t('centralAdmin.openNavigation')}>
          <Icon name="menu" className="w-5 h-5" />
        </button>
        <div className="hidden lg:block"><Breadcrumbs /></div>
        <div className="lg:hidden max-w-[40vw]"><WorkspaceContext /></div>
      </div>

      <button type="button" disabled className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background text-muted-foreground text-xs opacity-90 cursor-not-allowed" aria-label={t('centralAdmin.commandSearch')} title={t('centralAdmin.commandSearchUnavailable')}>
        <Icon name="search" className="w-4 h-4" />
        <span>{t('centralAdmin.commandSearch')}</span>
        <kbd className="ms-5 text-[10px] font-mono">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md border border-border text-[11px]" title={t('centralAdmin.environment.source')}>
          <span className="text-muted-foreground">{t('centralAdmin.environment.label')}</span>
          <span className="font-semibold text-foreground">{t(`centralAdmin.environment.${environment}`)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-[11px]" title={t(`centralAdmin.health.${health}`)}>
          <span className={`status-dot status-dot-${health}`} aria-hidden="true" />
          <span className="text-muted-foreground">{t(`centralAdmin.health.${health}`)}</span>
        </div>
        <button onClick={toggleLang} className="btn-icon" title={t('header.switchLanguage')} aria-label={t('header.switchLanguage')}><span className="text-[11px] font-extrabold tracking-wide">{isRTL ? 'EN' : 'عر'}</span></button>
        <button onClick={toggleTheme} className="btn-icon" title={t('header.toggleTheme')} aria-label={t('header.toggleTheme')}><Icon name={theme === 'dark' ? 'light-mode' : 'dark-mode'} className="w-[18px] h-[18px]" /></button>
        <button onClick={() => navigate(notificationRoute)} className="btn-icon" title={t('header.notifications')} aria-label={t('header.notifications')}><Icon name="notifications" className="w-[18px] h-[18px]" /></button>
        <div className="relative ms-1" ref={profileRef}>
          <button onClick={() => setShowProfileMenu(value => !value)} aria-expanded={showProfileMenu} aria-haspopup="menu" className="flex items-center gap-2 ps-1.5 pe-2 py-1 rounded-md border border-border hover:border-primary/40 hover:bg-secondary/50 transition-colors">
            <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=334155&color=fff`} alt="" className="w-7 h-7 rounded-full bg-secondary object-cover" />
            <span className="hidden xl:block text-sm font-semibold text-foreground max-w-32 truncate">{currentUser.name}</span>
            <Icon name="unfold-more" className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showProfileMenu && <div className="absolute end-0 mt-2 w-56 enterprise-panel p-2" role="menu">
            <div className="px-3 py-2 border-b border-border mb-1"><p className="text-sm font-bold text-foreground">{currentUser.name}</p><p className="text-xs text-muted-foreground truncate">{currentUser.email}</p></div>
            <button role="menuitem" onClick={() => { navigate('/profile'); setShowProfileMenu(false); }} className="w-full text-start px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2.5"><Icon name="person" className="w-4 h-4" />{t('header.myProfile')}</button>
            <button role="menuitem" onClick={() => { onLogout(); setShowProfileMenu(false); }} className="w-full text-start px-3 py-2 rounded-md hover:bg-destructive/10 text-sm font-medium text-destructive transition-colors flex items-center gap-2.5"><Icon name="logout" className="w-4 h-4" />{t('header.signOut')}</button>
          </div>}
        </div>
      </div>
    </header>
  );
});

(Header as unknown as React.FC).displayName = 'Header';
