import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/common/Icons';
import { performAiSearch } from '@/services/geminiService';
import { NAV_ITEMS } from '@/utils/constants';
import { MOCK_USERS, DASHBOARD_STATS, MOCK_COA } from '@/mocks';
import { AiSearchResult, AiStatus, User } from '@/types';
import { useSupport } from '@/context/SupportProvider';
import { usePermissions } from '@/context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  activeTabId: string;
  currentUser: User;
  onLogout: () => void;
  setActiveTab: (tabId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, activeTabId, currentUser, onLogout, setActiveTab, theme, toggleTheme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AiSearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<AiStatus>(AiStatus.IDLE);
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = () => setBackendOnline(false);
    const onUp = () => setBackendOnline(true);
    window.addEventListener('investa:backend:unreachable', onDown as EventListener);
    window.addEventListener('investa:backend:reachable', onUp as EventListener);
    return () => {
      window.removeEventListener('investa:backend:unreachable', onDown as EventListener);
      window.removeEventListener('investa:backend:reachable', onUp as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchStatus(AiStatus.LOADING);
    setShowResults(true);

    try {
      const data = { users: MOCK_USERS, stats: DASHBOARD_STATS, accounts: MOCK_COA };
      const results = await performAiSearch(searchQuery, data);
      setSearchResults(results);
      setSearchStatus(AiStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setSearchStatus(AiStatus.ERROR);
    }
  };

  const findBreadcrumbs = () => {
    if (activeTabId === 'profile') {
      return [{ label: 'Home', active: false }, { label: 'My Profile', active: true }];
    }

    const crumbs: { label: string; active: boolean }[] = [{ label: 'Home', active: false }];
    
    for (const item of NAV_ITEMS) {
      if (item.id === activeTabId) {
        crumbs.push({ label: item.label, active: true });
        return crumbs;
      }
      if (item.children) {
        const child = item.children.find(c => c.id === activeTabId);
        if (child) {
          crumbs.push({ label: item.label, active: false });
          crumbs.push({ label: child.label, active: true });
          return crumbs;
        }
      }
    }
    return crumbs;
  };

  const breadcrumbs = findBreadcrumbs();

  const SignalRIndicator: React.FC = () => {
    const { connectionStatus, host, connect } = useSupport();
    const [showMsg, setShowMsg] = useState(false);
    const [msg, setMsg] = useState('');

    const handleClick = async () => {
      const message = `Server: ${host} | Status: ${connectionStatus}`;
      setMsg(message);
      setShowMsg(true);
      if (connectionStatus === 'Disconnected') {
        try {
          await connect();
          setMsg(`Attempting to connect to ${host}...`);
        } catch (e) {
          setMsg(`Failed to connect to ${host}`);
        }
      }
      window.setTimeout(() => setShowMsg(false), 3000);
    };

    const iconName = connectionStatus === 'Connected' ? 'cloud-done' : connectionStatus === 'Disconnected' ? 'cloud-off' : 'sync';
    const iconColor = connectionStatus === 'Connected' ? 'bg-emerald-500' : connectionStatus === 'Disconnected' ? 'bg-rose-500' : 'bg-amber-400';
    const spin = connectionStatus === 'Connecting' || connectionStatus === 'Reconnecting';

    return (
      <div className="relative">
        <button onClick={handleClick} title={`SignalR: ${connectionStatus}`} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${iconColor} text-white`}> 
            <Icon name={iconName} className={`w-4.5 h-4.5 ${spin ? 'animate-spin' : ''}`} />
          </div>
        </button>
        {showMsg && (
          <div className="absolute right-0 mt-2 w-max bg-slate-800 text-white text-[13px] px-3 py-2 rounded shadow-lg">
            {msg}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-5 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center text-[13px] font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>}
              <button 
                onClick={() => !crumb.active && setActiveTab('dashboard')}
                className={`transition-colors outline-none ${crumb.active ? 'text-slate-900 dark:text-slate-100 font-semibold cursor-default' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 relative">
        {/* AI Search Bar */}
        <div className="relative" ref={dropdownRef}>
          <form 
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-slate-100/80 dark:bg-slate-950/50 rounded-full px-3.5 py-1.5 w-60 xl:w-72 border border-transparent focus-within:border-indigo-300 dark:focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all shadow-sm"
          >
            <Icon name="sparkles" className={`w-3.5 h-3.5 mr-2 ${searchStatus === AiStatus.LOADING ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="AI Neural Command..." 
              className="bg-transparent border-none outline-none text-[11px] w-full text-slate-700 dark:text-slate-300 placeholder-slate-400 font-medium"
            />
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full right-0 mt-2.5 w-[420px] max-h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon name="sparkles" className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Neural Search</span>
                </div>
                <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Icon name="grid" className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                {searchStatus === AiStatus.LOADING && (
                  <div className="p-10 text-center">
                    <div className="w-8 h-8 border-[3px] border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-[13px] font-medium text-slate-600">Processing neural data snapshot...</p>
                  </div>
                )}
                {searchStatus === AiStatus.SUCCESS && searchResults.length === 0 && (
                  <div className="p-10 text-center text-slate-500">
                    <Icon name="search" className="w-10 h-10 mx-auto mb-2 opacity-10" />
                    <p className="text-[13px] font-medium">No results for "{searchQuery}"</p>
                  </div>
                )}
                {searchStatus === AiStatus.SUCCESS && searchResults.map((result, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 p-2 rounded-lg transition-colors ${
                        result.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 
                        result.type === 'stat' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                        result.type === 'account' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                      }`}>
                        <Icon name={result.type === 'user' ? 'users' : result.type === 'stat' ? 'chart' : result.type === 'account' ? 'grid' : 'sparkles'} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[13px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{result.title}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">{result.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mb-2 truncate">{result.subtitle}</p>
                        <div className="py-2 px-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-lg text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-all">
                          <span className="font-bold text-indigo-600 mr-1">Insight:</span> {result.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Tools */}
        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1.5">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-4.5 h-4.5" />
          </button>

          <div title={backendOnline ? 'API Online' : 'API Offline'} className="p-1 rounded-md ml-1 mr-1 flex items-center">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-rose-500'} border-2 border-white dark:border-slate-900 shadow-sm`}></span>
          </div>

          {/* SignalR Status Icon */}
          <SignalRIndicator />

          <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group">
            <Icon name="bell" className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-indigo-600 text-white text-[8px] flex items-center justify-center font-bold rounded-full border-2 border-white dark:border-slate-900">3</span>
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 ml-1 p-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all border border-transparent"
          >
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div className="hidden lg:block text-left ml-0.5">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-none">{currentUser.name}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-500 font-medium mt-0.5">{currentUser.role}</p>
            </div>
            <Icon name="chevron-down" className={`w-2.5 h-2.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Logged in as</p>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="py-1">
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-1.5 text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <Icon name="user-circle" className="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </button>
              </div>
              <div className="pt-1 mt-1 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-1.5 text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-semibold text-left"
                >
                  <Icon name="logout" className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
