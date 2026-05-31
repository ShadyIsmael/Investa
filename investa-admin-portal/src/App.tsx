import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import NotificationTemplates from '@/features/config/NotificationTemplates';
import { MyProfile } from '@/features/auth/MyProfile';
import Groups from '@/features/rbac/Groups';
import { Roles } from '@/features/rbac/Roles';
import { Login } from '@/features/auth/Login';
import { ResetPassword } from '@/features/auth/ResetPassword';
import { SplashScreen } from '@/components/common/SplashScreen';
import { User } from '@/types';
import { getUserProfile } from '@/services/profileService';
import { AuthProvider, usePermissions } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { SupportProvider } from '@/context/SupportProvider';

const ComingSoon = ({ title, subtitle }: { title: string; subtitle: string }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
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
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
            >
                {t('common.back')}
            </button>
        </div>
    )
};

const ClientDetailsRoute: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    return <ClientDetails clientId={clientId || null} />;
};

const AppContent: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated, logout: handleLogout, user: authUser } = usePermissions();
    const [authView, setAuthView] = useState<'login' | 'reset'>('login');
    const navigate = useNavigate();

    // Legacy user state for backward compatibility with existing components
    const [currentUser, setCurrentUser] = useState<User>({
        id: "00000000-0000-0000-0000-000000000999",
        firstName: null,
        lastName: null,
        name: authUser?.name || "System Admin",
        email: authUser?.email || "admin@investa.com",
        role: "Admin", // Deprecated - kept for backward compatibility
        roleId: null,
        groupName: null,
        groupId: null,
        roleName: null,
        status: "Active",
        lastLogin: "Now",
        createdAt: new Date().toISOString(),
        updatedAt: null,
        avatar: authUser?.avatar || "https://picsum.photos/100/100?random=admin",
        metadata: {}
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

    // Sync currentUser with authUser from context
    useEffect(() => {
        if (authUser) {
            setCurrentUser(prev => ({
                ...prev,
                id: String(authUser.id) || prev.id,
                name: authUser.name || prev.name,
                email: authUser.email || prev.email,
                avatar: authUser.avatar || prev.avatar,
            }));
        }
    }, [authUser]);

    const handleProfileUpdated = useCallback((profileUpdate: { name: string; email: string; avatar: string }) => {
      setCurrentUser(prev => ({
        ...prev,
        name: profileUpdate.name || prev.name,
        email: profileUpdate.email || prev.email,
        avatar: profileUpdate.avatar || prev.avatar,
      }));
    }, []);

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
        const path = window.location.pathname;
        if (path.startsWith('/admin/support')) {
            const parts = path.split('/').filter(Boolean);
            if (parts.length >= 3 && parts[1] === 'support' && parts[2] === 'chat') {
                const convId = parts[3] || parts[2 + 1];
                navigate(`/admin/support/chat/${convId}`);
            } else {
                navigate('/admin/support');
            }
        }
    }, [navigate]);

    if (isBooting) {
        return <SplashScreen />;
    }

    return (
        <Suspense fallback={<SplashScreen />}>
            <Routes>
                <Route path="/login" element={<Login onLogin={() => navigate('/')} onForgotPassword={() => setAuthView('reset')} />} />
                <Route path="/reset-password" element={<ResetPassword onBackToLogin={() => setAuthView('login')} />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/clients" element={<ClientsList />} />
                                    <Route path="/clients/:clientId" element={<ClientDetailsRoute />} />
                                    <Route path="/user-onboarding" element={<ComingSoon title={t('pages.userOnboarding')} subtitle={t('messages.comingSoonSubtitle')} />} />
                                    <Route path="/groups" element={<Groups />} />
                                    <Route path="/users" element={<UsersList />} />
                                    <Route path="/roles" element={<Roles />} />
                                    <Route path="/permissions" element={<ComingSoon title={t('breadcrumb.permissions')} subtitle={t('messages.comingSoonSubtitle')} />} />
                                    <Route path="/support" element={<SupportRequests />} />
                                    <Route path="/support-dashboard" element={<SupportDashboard />} />
                                    <Route path="/admin-support" element={<SupportAdmin />} />
                                    <Route path="/admin-support/chat/:conversationId" element={<ChatView />} />
                                    <Route path="/coa" element={<ChartOfAccounts />} />
                                    <Route path="/billing" element={<InvoicingBilling />} />
                                    <Route path="/journals" element={<JournalEntries />} />
                                    <Route path="/cashflow" element={<CashFlowManagement />} />
                                    <Route path="/bankrec" element={<BankReconciliation />} />
                                    <Route path="/profile" element={<MyProfile user={currentUser} onProfileUpdated={handleProfileUpdated} />} />
                                    <Route path="/credit" element={<CreditSetup />} />
                                    <Route path="/config/credit" element={<CreditSetup />} />
                                    <Route path="/apitester" element={<ApiTester />} />
                                    <Route path="/system-config" element={<SystemConfiguration />} />
                                    <Route path="/config/notification-templates" element={<NotificationTemplates />} />
                                </Routes>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider onRedirect={() => {}}>
            <SupportProvider>
                <AppContent />
            </SupportProvider>
        </AuthProvider>
    );
};

export default App;
