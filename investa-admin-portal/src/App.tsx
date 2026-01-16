import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { UsersList } from '@/features/rbac/UsersList';
import { ClientsList } from '@/features/clients/ClientsList';
import ClientDetails from '@/features/clients/ClientDetails';
import { SupportRequests } from '@/features/support/SupportRequests';
import SupportAdmin from '@/features/support/SupportAdmin';
import SupportDashboard from '@/features/support/SupportDashboard';
import ChatView from '@/features/support/ChatView';
import { ChartOfAccounts } from '@/features/finance/ChartOfAccounts';
import { InvoicingBilling } from '@/features/finance/InvoicingBilling';
import { JournalEntries } from '@/features/finance/JournalEntries';
import { CashFlowManagement } from '@/features/finance/CashFlowManagement';
import { BankReconciliation } from '@/features/finance/BankReconciliation';
import { CreditSetup } from '@/features/finance/CreditSetup';
import { ApiTester } from '@/components/common/ApiTester';
import SystemConfiguration from '@/features/config/SystemConfiguration';
import { MyProfile } from '@/features/auth/MyProfile';
import Groups from '@/features/rbac/Groups';
import { Roles } from '@/features/rbac/Roles';
import { Login } from '@/features/auth/Login';
import { ResetPassword } from '@/features/auth/ResetPassword';
import { SplashScreen } from '@/components/common/SplashScreen';
import { User } from '@/types';
import { getUserProfile } from '@/services/profileService';
import ChatRequestListener from '@/features/support/ChatRequestListener';
import ChatConversationsListener from '@/features/support/ChatConversationsListener';
import BackendHealthMonitor from '@/services/backendHealth';
import { AuthProvider, usePermissions } from '@/context/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout: handleLogout, user: authUser } = usePermissions();
  const [authView, setAuthView] = useState<'login' | 'reset'>('login');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Theme preference: 'light' | 'dark' | 'system' (system follows OS setting)
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('portal-theme-pref') as 'light' | 'dark' | 'system') || 'light';
  });

  const getEffectiveTheme = (pref: 'light' | 'dark' | 'system') => {
    if (pref === 'system') {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        return 'light';
      }
    }
    return pref;
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => getEffectiveTheme(themePref));
  
  // Legacy user state for backward compatibility with existing components
  const [currentUser, setCurrentUser] = useState<User>({
    id: 999,
    name: authUser?.name || "System Admin",
    email: authUser?.email || "admin@investa.com",
    role: "Admin", // Deprecated - kept for backward compatibility
    status: "Active",
    lastLogin: "Now",
    avatar: authUser?.avatar || "https://picsum.photos/100/100?random=admin"
  });

  // Splash screen - show on initial boot only
  const [isBooting, setIsBooting] = useState(true);

  // Splash screen duration simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Persist effective theme (for compatibility) and preference
    localStorage.setItem('portal-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Persist the user's preference and update the effective theme
    localStorage.setItem('portal-theme-pref', themePref);
    setTheme(getEffectiveTheme(themePref));
  }, [themePref]);

  // If the user selects 'system', listen to OS preference changes
  useEffect(() => {
    if (themePref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme(getEffectiveTheme('system'));
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [themePref]);

  // Apply 'dark' class to the document root so Tailwind's class strategy works
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply a temporary transition helper to smooth component-level changes
      document.documentElement.classList.add('theme-transition');
      const t = setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
      return () => clearTimeout(t);
    } catch (e) {
      // ignore (SSR or older browsers)
    }
  }, [theme]);

  // Sync currentUser with authUser from context
  useEffect(() => {
    if (authUser) {
      setCurrentUser(prev => ({
        ...prev,
        id: Number(authUser.id) || prev.id,
        name: authUser.name || prev.name,
        email: authUser.email || prev.email,
        avatar: authUser.avatar || prev.avatar,
      }));
    }
  }, [authUser]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setThemePref(prev => (prev === 'dark' ? 'light' : 'dark'));
  
  // Deprecated - kept for backward compatibility
  const handleLogin = (redirect?: string) => {
    if (redirect) setActiveTab(redirect);
  };
  

  // When authenticated, fetch the full profile for the current user and update UI
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // getUserProfile returns the profile for the current authenticated user
        const profile = await getUserProfile();
        if (!profile) return;

        setCurrentUser(prev => ({
          ...prev,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || prev.name,
          email: profile.email || prev.email,
          avatar: profile.avatarUrl || prev.avatar,
        }));
      } catch (err) {
        console.warn('Failed to load user profile', err);
      }
    };

    if (isAuthenticated) loadProfile();
  }, [isAuthenticated]);

  // Handle direct navigation to support pages (deep links)
  useEffect(() => {
    const handleLocation = (loc?: Location) => {
      const path = (loc || window.location).pathname;
      if (path.startsWith('/admin/support')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 3 && parts[1] === 'support' && parts[2] === 'chat') {
          const convId = parts[3] || parts[2+1];
          setActiveTab('admin-support-chat');
          if (convId) {
            try { window.dispatchEvent(new CustomEvent('investa:ui:open-conversation', { detail: { conversationId: convId } })); } catch (e) { /* ignore */ }
          }
        } else {
          setActiveTab('admin-support');
        }
      }
    };

    handleLocation();
    const onPop = () => handleLocation(window.location);
    window.addEventListener('popstate', onPop);

    const onNav = (e: any) => handleLocation({ pathname: e?.detail?.path || window.location.pathname } as Location);
    window.addEventListener('investa:navigate', onNav as EventListener);

    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('investa:navigate', onNav as EventListener);
    };
  }, []);

  const ComingSoon = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 text-center space-y-4 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-lg flex items-center justify-center text-slate-200 dark:text-slate-700 border border-slate-100 dark:border-slate-800 mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-[13px] font-medium">{subtitle}</p>
      </div>
      <button 
        onClick={() => setActiveTab('dashboard')}
        className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
      >
        Return to Overview
      </button>
    </div>
  );

  // Refactored renderContent function to organize screens and ensure updated paths
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <ClientsList onViewClient={(id) => { setSelectedClientId(id); setActiveTab('client'); }} />;
      case 'client': return <ClientDetails clientId={selectedClientId} onBack={() => setActiveTab('clients')} />;
      case 'user-onboarding': return <ComingSoon title="User Onboarding" subtitle="This feature is coming soon. Stay tuned!" />;
      case 'groups': return <Groups />;
      case 'users': return <UsersList />;
      case 'roles': return <Roles />;
      case 'permissions': return <Permissions />;
      case 'support':
      case 'customer-tickets': return <SupportRequests />;
      case 'support-dashboard': return <SupportDashboard />;
      case 'admin-support': return <SupportAdmin />;
      case 'admin-support-chat': return <ChatView />;
      case 'coa': return <ChartOfAccounts />;
      case 'billing': return <InvoicingBilling />;
      case 'journals': return <JournalEntries />;
      case 'cashflow': return <CashFlowManagement />;
      case 'bankrec': return <BankReconciliation />;
      case 'profile': return <MyProfile user={currentUser} />;
      case 'credit': return <CreditSetup />;
      case 'apitester': return <ApiTester />;
      case 'system-config': return <SystemConfiguration themePref={themePref} setThemePref={setThemePref} />;
      default: return <Dashboard />;
    }
  };

  if (isBooting) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className={theme}>
        {/* Backend health monitor runs even on the login screen so devs see connectivity */}
        <BackendHealthMonitor />
        <div className="animate-in fade-in duration-1000">
          {authView === 'login' ? (
            <Login onLogin={handleLogin} onForgotPassword={() => setAuthView('reset')} />
          ) : (
            <ResetPassword onBackToLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme} h-screen flex overflow-hidden`}>
      {/* Backend health monitor runs in background and emits events for UI */}
      <BackendHealthMonitor />
      <div className="flex w-full h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans antialiased text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-700">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300`}>
          <Header 
            toggleSidebar={toggleSidebar} 
            activeTabId={activeTab}
            currentUser={currentUser}
            onLogout={handleLogout}
            setActiveTab={setActiveTab}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          {/* Global chat request listener - displays incoming server chat requests */}
          <ChatRequestListener />
          {/* Conversation listener for AssignedNewUser / ReceiveMessage */}
          <ChatConversationsListener />

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-5 lg:p-6 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Wrap with AuthProvider for enterprise-grade permission management
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleRedirect = (path: string) => {
    setActiveTab(path);
  };

  return (
    <AuthProvider onRedirect={handleRedirect}>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
