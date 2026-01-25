import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { AuthProvider, usePermissions } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { SupportProvider } from '@/context/SupportProvider';

const ComingSoon = ({ title, subtitle }: { title: string; subtitle: string }) => {
    const navigate = useNavigate();
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
                Return to Overview
            </button>
        </div>
    )
};

const AppContent: React.FC = () => {
    const { isAuthenticated, logout: handleLogout, user: authUser } = usePermissions();
    const [authView, setAuthView] = useState<'login' | 'reset'>('login');
    const navigate = useNavigate();

    // Legacy user state for backward compatibility with existing components
    const [currentUser, setCurrentUser] = useState<User>({
        id: "00000000-0000-0000-0000-000000000999",
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
                                    <Route path="/clients/:clientId" element={<ClientDetails />} />
                                    <Route path="/user-onboarding" element={<ComingSoon title="User Onboarding" subtitle="This feature is coming soon. Stay tuned!" />} />
                                    <Route path="/groups" element={<Groups />} />
                                    <Route path="/users" element={<UsersList />} />
                                    <Route path="/roles" element={<Roles />} />
                                    <Route path="/permissions" element={<ComingSoon title="Permissions" subtitle="This feature is coming soon. Stay tuned!" />} />
                                    <Route path="/support" element={<SupportRequests />} />
                                    <Route path="/support-dashboard" element={<SupportDashboard />} />
                                    <Route path="/admin-support" element={<SupportAdmin />} />
                                    <Route path="/admin-support/chat/:conversationId" element={<ChatView />} />
                                    <Route path="/coa" element={<ChartOfAccounts />} />
                                    <Route path="/billing" element={<InvoicingBilling />} />
                                    <Route path="/journals" element={<JournalEntries />} />
                                    <Route path="/cashflow" element={<CashFlowManagement />} />
                                    <Route path="/bankrec" element={<BankReconciliation />} />
                                    <Route path="/profile" element={<MyProfile user={currentUser} />} />
                                    <Route path="/credit" element={<CreditSetup />} />
                                    <Route path="/apitester" element={<ApiTester />} />
                                    <Route path="/system-config" element={<SystemConfiguration />} />
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
