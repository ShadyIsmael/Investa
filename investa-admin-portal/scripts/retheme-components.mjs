/**
 * Component theme writer – run with: node scripts/retheme-components.mjs
 * Writes MainLayout, Sidebar, Header, Dashboard with the new Obsidian theme.
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, '..');
const layout    = resolve(root, 'src', 'components', 'layout');

// ---------------------------------------------------------------------------
// MainLayout.tsx
// ---------------------------------------------------------------------------
writeFileSync(resolve(layout, 'MainLayout.tsx'),
`import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { User } from '@/types';
import ChatRequestListener from '@/features/support/ChatRequestListener';
import ChatConversationsListener from '@/features/support/ChatConversationsListener';
import BackendHealthMonitor from '@/services/backendHealth';
import Notifications from '@/components/common/Notifications';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
  currentUser: User;
  handleLogout: () => void;
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, handleLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar  = () => setIsSidebarOpen(o => !o);
  const toggleCollapse = () => setIsCollapsed(c => !c);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <BackendHealthMonitor />
      <Notifications />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* Main canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <ChatRequestListener />
        <ChatConversationsListener />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div className="max-w-[1400px] mx-auto px-6 py-8 animate-in fade-in slide-up duration-500">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
`);

// ---------------------------------------------------------------------------
// Sidebar.tsx
// ---------------------------------------------------------------------------
writeFileSync(resolve(layout, 'Sidebar.tsx'),
`import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '@/types';
import { NAV_ITEMS } from '@/utils/constants';
import { Icon } from '@/components/common/Icons';
import { usePermissions } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, toggleSidebar, isCollapsed, toggleCollapse,
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  const location = useLocation();
  const { t } = useTranslation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    if (isCollapsed) return;
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(c => c.path === location.pathname)) {
        setExpandedMenu(item.id);
      }
    });
  }, [location.pathname, isCollapsed]);

  const toggleExpand = (id: string) => !isCollapsed && setExpandedMenu(p => p === id ? null : id);

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    if (item.permissions?.length) {
      const ok = item.requireAll
        ? hasAllPermissions(...item.permissions)
        : hasAnyPermission(...item.permissions);
      if (!ok) return null;
    }

    const hasChildren = !!item.children?.length;
    const isExpanded  = expandedMenu === item.id;
    const isActive    = location.pathname === item.path;
    const isParent    = item.children?.some(c => location.pathname.startsWith(c.path || ''));

    const inner = (
      <div
        className={[
          'flex items-center justify-between gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
          isActive  ? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/30' : '',
          isParent && !hasChildren ? 'text-foreground font-medium' : '',
          !isActive && !isParent   ? 'text-muted-foreground hover:text-foreground hover:bg-secondary font-medium' : '',
          isSubItem ? 'ps-5 text-[13px] py-2' : '',
          isCollapsed ? '!px-2 justify-center' : '',
        ].join(' ')}
      >
        <div className={['flex items-center gap-2.5', isCollapsed ? 'justify-center w-full' : ''].join(' ')}>
          <Icon
            name={item.iconName}
            className={['w-[18px] h-[18px] flex-shrink-0',
              isActive ? 'text-current' : 'group-hover:text-primary transition-colors',
              isSubItem ? 'w-4 h-4 opacity-70' : '',
            ].join(' ')}
          />
          {!isCollapsed && (
            <span className="truncate leading-none">{t(item.label, { defaultValue: item.label })}</span>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <Icon name="chevron-right"
            className={['w-3.5 h-3.5 opacity-40 transition-transform duration-200', isExpanded ? 'rotate-90' : ''].join(' ')}
          />
        )}
      </div>
    );

    return (
      <div key={item.id} className="w-full">
        {hasChildren
          ? <button className="w-full text-start" title={isCollapsed ? item.label : undefined} onClick={() => toggleExpand(item.id)}>{inner}</button>
          : <Link to={item.path || '/'} title={isCollapsed ? item.label : undefined} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>{inner}</Link>
        }
        {!isCollapsed && hasChildren && (
          <div className={['overflow-hidden transition-all duration-300', isExpanded ? 'max-h-96 mt-0.5 mb-1' : 'max-h-0'].join(' ')}>
            <div className="ms-5 border-s border-border ps-2 space-y-0.5 py-1">
              {item.children!.map(c => renderNavItem(c, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{ zIndex: 'var(--z-fixed)' }}
        className={[
          'fixed md:static inset-y-0 start-0 flex flex-col bg-card border-e border-border transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={['h-16 flex items-center border-b border-border px-4 flex-shrink-0', isCollapsed ? 'justify-center' : 'gap-3'].join(' ')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="trending-up" className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-black tracking-tighter text-foreground select-none">Investa</span>
          )}
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground px-3 pt-2 pb-3">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map(item => renderNavItem(item))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-border">
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs font-medium"
          >
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
`);

// ---------------------------------------------------------------------------
// Header.tsx
// ---------------------------------------------------------------------------
writeFileSync(resolve(layout, 'Header.tsx'),
`import React, { useState, useRef, useEffect, useCallback } from 'react';
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
              className="input-field ps-9 pe-4 w-72 h-9 text-xs"
            />
            {searchStatus === AiStatus.LOADING && (
              <Icon name="sync" className="w-3.5 h-3.5 absolute end-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            )}
          </form>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 start-0 w-72 card shadow-lg p-2 space-y-1" style={{ zIndex: 'var(--z-dropdown)' }}>
              {searchResults.map((r, i) => (
                <div key={i} className="px-3 py-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                  <p className="text-sm font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* API status dot */}
          <div
            title={backendOnline ? 'API Online' : 'API Offline'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium"
          >
            <span className={['w-2 h-2 rounded-full', backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'].join(' ')} />
            <span className="hidden sm:inline text-muted-foreground">{backendOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Language toggle */}
          <button onClick={toggleLang} className="btn-ghost p-2" title="Switch language">
            <span className="text-xs font-bold">{isRTL ? 'EN' : 'عر'}</span>
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn-ghost p-2" title="Toggle theme">
            <Icon name={theme === 'dark' ? 'light-mode' : 'dark-mode'} className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="btn-ghost p-2 relative" title="Notifications">
            <Icon name="notifications" className="w-5 h-5" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-2.5 ps-2 pe-3 py-1.5 rounded-full border border-border hover:border-primary/50 transition-colors"
            >
              <img
                src={currentUser.avatar || 'https://ui-avatars.com/api/?name=Admin'}
                alt="avatar"
                className="w-7 h-7 rounded-full bg-secondary object-cover"
              />
              <span className="hidden sm:block text-sm font-semibold text-foreground">{currentUser.name}</span>
              <Icon name="chevron-down" className="w-3.5 h-3.5 text-muted-foreground" />
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
`);

// ---------------------------------------------------------------------------
// Dashboard.tsx
// ---------------------------------------------------------------------------
writeFileSync(resolve(layout, 'Dashboard.tsx'),
`import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { financeService } from '@/services/financeService';
import { clientService } from '@/services/clientService';
import { generateExecutiveSummary } from '@/services/geminiService';
import { AiStatus, DashboardStat, ChartDataPoint, Client } from '@/types';
import { Icon } from '@/components/common/Icons';
import { useTranslation } from 'react-i18next';

const ACCENT_COLORS = ['#0ea5e9','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change }: DashboardStat) => {
  const raw = parseFloat((change || '0').replace(/[^0-9.-]+/g, ''));
  const pos = raw >= 0;
  return (
    <div className="card card-hover p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className={\`badge \${pos ? 'badge-success' : 'badge-error'}\`}>
          {pos ? '↗' : '↘'} {change}
        </span>
      </div>
      <div className="text-3xl font-black tracking-tight text-foreground">{value}</div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState<DashboardStat[]>([]);
  const [revenue, setRevenue] = useState<ChartDataPoint[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<{ name: string; value: number }[]>([]);
  const [aiStatus,   setAiStatus]   = useState<AiStatus>(AiStatus.IDLE);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [rev, st, cl] = await Promise.allSettled([
          financeService.getRevenueData(),
          financeService.getDashboardStats(),
          clientService.getTopClients(),
        ]);
        if (rev.status === 'fulfilled') setRevenue(rev.value);
        if (st.status  === 'fulfilled') setStats(st.value);
        if (cl.status  === 'fulfilled') {
          setClients(cl.value);
          setCategories([
            { name: 'Technology',   value: 15_400_000 },
            { name: 'Real Estate',  value: 12_100_000 },
            { name: 'Healthcare',   value:  8_900_000 },
            { name: 'Green Energy', value:  4_200_000 },
          ]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAi = async () => {
    setAiStatus(AiStatus.LOADING);
    try {
      setAiResponse(await generateExecutiveSummary({ metrics: stats }));
      setAiStatus(AiStatus.SUCCESS);
    } catch {
      setAiStatus(AiStatus.ERROR);
      setAiResponse('AI model unavailable. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1">Admin Portal</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t('dashboard.title', { defaultValue: 'Overview' })}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('dashboard.subtitle', { defaultValue: 'Real-time metrics and operational insights' })}
          </p>
        </div>
        <button
          onClick={handleAi}
          disabled={aiStatus === AiStatus.LOADING}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
        >
          <Icon name={aiStatus === AiStatus.LOADING ? 'sync' : 'auto-awesome'}
            className={\`w-4 h-4 \${aiStatus === AiStatus.LOADING ? 'animate-spin' : ''}\`}
          />
          {aiStatus === AiStatus.LOADING ? 'Analyzing…' : t('dashboard.aiInsights', { defaultValue: 'AI Insights' })}
        </button>
      </div>

      {/* AI panel */}
      {aiStatus !== AiStatus.IDLE && (
        <div className={\`card p-5 border-s-4 \${aiStatus === AiStatus.ERROR ? 'border-s-destructive' : 'border-s-primary'}\`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name={aiStatus === AiStatus.ERROR ? 'error' : 'analytics'}
              className={\`w-5 h-5 \${aiStatus === AiStatus.ERROR ? 'text-destructive' : 'text-primary'}\`}
            />
            <h3 className="font-bold text-sm text-foreground">
              {aiStatus === AiStatus.ERROR ? 'Error' : 'Strategic Analysis'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiResponse || 'Processing…'}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue – 2/3 width */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Revenue Stream</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly performance</p>
            </div>
            <Icon name="trending-up" className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[280px]">
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={v => \`\${v/1000}k\`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem', border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
                      fontSize: '12px', fontWeight: '600',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Pie – 1/3 width */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Market Mix</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Investment categories</p>
            </div>
          </div>
          <div className="h-[280px]">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {categories.map((_, i) => (
                      <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [\`\${(v/1_000_000).toFixed(1)}M EGP\`, '']}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      {clients.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Top Clients</h2>
            <span className="badge badge-info">{clients.length} active</span>
          </div>
          <div className="divide-y divide-border">
            {clients.slice(0, 6).map((client, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={client.avatar} alt="" className="w-8 h-8 rounded-full bg-secondary object-cover" />
                  <span className="text-sm font-semibold text-foreground">{client.name}</span>
                </div>
                <span className="text-xs font-bold text-primary">{client.score ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
`);

console.log('✅  Component files rewritten:\n  • MainLayout.tsx\n  • Sidebar.tsx\n  • Header.tsx\n  • Dashboard.tsx');
