import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/common/Icons';
import { performAiSearch } from '@/services/geminiService';
import { MOCK_USERS, DASHBOARD_STATS, MOCK_COA } from '@/mocks';
import { AiSearchResult, AiStatus, User } from '@/types';
import { useSupport } from '@/context/SupportProvider';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  toggleSidebar: () => void;
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(
  ({ toggleSidebar, currentUser, onLogout, theme, toggleTheme }) => {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<AiSearchResult[]>([]);
    const [searchStatus, setSearchStatus] = useState<AiStatus>(AiStatus.IDLE);
    const [showResults, setShowResults] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [backendOnline, setBackendOnline] = useState(true);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef  = useRef<HTMLDivElement>(null);
    const location    = useLocation();

    // ── Backend health events ──────────────────────────────────────────────
    useEffect(() => {
      const down = () => setBackendOnline(false);
      const up   = () => setBackendOnline(true);
      window.addEventListener('investa:backend:unreachable', down);
      window.addEventListener('investa:backend:reachable', up);
      return () => {
        window.removeEventListener('investa:backend:unreachable', down);
        window.removeEventListener('investa:backend:reachable', up);
      };
    }, []);

    // ── Click-outside close ────────────────────────────────────────────────
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowResults(false);
        if (profileRef.current  && !profileRef.current.contains(e.target as Node))  setShowProfileMenu(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── AI search ─────────────────────────────────────────────────────────
    const handleSearch = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      setSearchStatus(AiStatus.LOADING);
      setShowResults(true);
      try {
        const data = { users: MOCK_USERS, stats: DASHBOARD_STATS, accounts: MOCK_COA };
        setSearchResults(await performAiSearch(searchQuery, data));
        setSearchStatus(AiStatus.SUCCESS);
      } catch {
        setSearchStatus(AiStatus.ERROR);
      }
    }, [searchQuery]);

    const toggleLang = () => {
      const next = i18n.language === 'ar' ? 'en' : 'ar';
      i18n.changeLanguage(next);
    };

    const isRTL = i18n.language === 'ar';

    // ── Breadcrumbs ────────────────────────────────────────────────────────
    const breadcrumb = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
    const crumbLabel = breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1);

    return (
      <header
        className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-card border-b border-border"
        style={{ zIndex: 'var(--z-fixed)' }}
      >
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="btn-ghost p-2 md:hidden">
            <Icon name="menu" className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <span className="text-xs text-muted-foreground font-medium">Admin / </span>
            <span className="text-sm font-semibold text-foreground">{crumbLabel}</span>
          </div>
        </div>

        {/* Center: search */}
        <div className="hidden md:flex relative" ref={dropdownRef}>
          <form onSubmit={handleSearch} className="relative">
            <Icon name="search" className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setShowResults(false); }}
              placeholder={t('header.searchPlaceholder', { defaultValue: 'Search or ask AI…' })}
              className="input-field ps-9 pe-20 w-72 h-9 text-xs"
            />
            <kbd className="absolute end-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 h-5 rounded border border-border bg-secondary text-[10px] font-mono text-muted-foreground">
              {searchStatus === AiStatus.LOADING
                ? <Icon name="sync" className="w-3 h-3 text-primary animate-spin" />
                : <>⌘K</>
              }
            </kbd>
          </form>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 start-0 w-72 card shadow-lg p-2 space-y-1" style={{ zIndex: 'var(--z-dropdown)' }}>
              {searchResults.map((r, i) => (
                <div key={i} className="px-3 py-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                  <p className="text-sm font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1">
          {/* API status pill */}
          <div
            title={backendOnline ? 'API Online' : 'API Offline'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium me-1"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="hidden sm:inline text-muted-foreground text-[11px]">{backendOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Language toggle */}
          <button onClick={toggleLang} className="btn-icon" title="Switch language">
            <span className="text-[11px] font-extrabold tracking-wide">{isRTL ? 'EN' : 'عر'}</span>
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
            <Icon name={theme === 'dark' ? 'light-mode' : 'dark-mode'} className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications */}
          <button className="btn-icon relative" title="Notifications">
            <Icon name="notifications" className="w-[18px] h-[18px]" />
            <span className="absolute top-2 end-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-card" />
          </button>

          {/* Profile */}
          <div className="relative ms-1" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-2 ps-1.5 pe-3 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all"
            >
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0ea5e9&color=fff`}
                alt="avatar"
                className="w-7 h-7 rounded-full bg-secondary object-cover ring-2 ring-border"
              />
              <span className="hidden sm:block text-sm font-semibold text-foreground">{currentUser.name}</span>
              <Icon name="unfold-more" className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {showProfileMenu && (
              <div className="absolute end-0 mt-2 w-56 card shadow-xl p-2 space-y-1" style={{ zIndex: 'var(--z-dropdown)' }}>
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-bold text-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                <button className="w-full text-start px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2.5">
                  <Icon name="person" className="w-4 h-4" /> My Profile
                </button>
                <button
                  onClick={() => { onLogout(); setShowProfileMenu(false); }}
                  className="w-full text-start px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm font-medium text-destructive transition-colors flex items-center gap-2.5"
                >
                  <Icon name="logout" className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
);

(Header as unknown as React.FC).displayName = 'Header';
