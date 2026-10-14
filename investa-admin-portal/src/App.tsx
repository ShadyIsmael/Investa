import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Login } from '@/features/auth/Login';
import { ResetPassword } from '@/features/auth/ResetPassword';
import { SplashScreen } from '@/components/common/SplashScreen';
import { User } from '@/types';
import { getUserProfile } from '@/services/profileService';
import { AuthProvider, usePermissions } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { SupportProvider } from '@/context/SupportProvider';
import { RouteGuard } from '@/components/common/RouteGuard';
import { LazyRouteBoundary } from '@/components/common/LazyRouteBoundary';
import { NotFound, PendingModulePage, RouteLoadingBoundary } from '@/components/common/EnterpriseStates';
import { policyForRoute } from '@/core/routeRegistry';
import {
    AccessControlHub,
    AdminUserReviewQueue,
    ApiTester,
    ClientDetails,
    ClientsList,
    CompanyFinancePage,
    CompanyFinanceShell,
    CountryMasterPage,
    CreditSetup,
    CurrencyMasterPage,
    Dashboard,
    FileCategoryMasterPage,
    FinanceAccountsPage,
    FinanceCategoriesSettingsPage,
    FinanceMoneyInCreatePage,
    FinanceMoneyInPage,
    FinanceMoneyOutCreatePage,
    FinanceMoneyOutPage,
    FinanceOverviewPage,
    FinanceReconciliationPage,
    FinanceReviewQueuePage,
    FinanceSuppliersPage,
    FundingGoalMasterPage,
    GlobalOverview,
    CustomerListPage,
    CustomerDetailPage,
    CustomerFormPage,
    CatalogListPage,
    CatalogDetailPage,
    CatalogFormPage,
    SalesOpportunityListPage,
    SalesOpportunityDetailPage,
    SalesOpportunityFormPage,
    QuotationListPage,
    QuotationDetailPage,
    QuotationFormPage,
    QuotationPrintPage,
    ContractListPage,
    ContractFormPage,
    ContractDetailPage,
    ContractPrintPage,
    Groups,
    ModerationReports,
    MyProfile,
    NotificationBroadcasts,
    NotificationTemplates,
    OpportunityTagMasterPage,
    OpportunityDetailPage,
    OpportunityListPage,
    PlatformStatusPage,
    PricingManagement,
    ProjectCategoryMasterPage,
    ProjectStageMetadataPage,
    ReputationRules,
    RiskLevelMasterPage,
    Roles,
    SupportAdmin,
    SupportDashboard,
    SystemConfiguration,
    UsersList,
    ChatView,
} from '@/core/routeLoaders';

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

const LegacyClientDetailsRedirect: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    return <Navigate to={`/admin/fopx/users/${clientId || ''}`} replace />;
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
                                <LazyRouteBoundary>
                                    <Suspense fallback={<RouteLoadingBoundary />}>
                                        <Routes>
                                    <Route path="/" element={<Navigate to="/admin" replace />} />

                                    {/* Company Core routes. Business modules are intentionally structural placeholders in Phase 1. */}
                                    <Route path="/admin" element={<RouteGuard policy={policyForRoute('/admin')}><GlobalOverview /></RouteGuard>} />
                                    <Route path="/admin/customers" element={<RouteGuard policy={policyForRoute('/admin/customers')}><CustomerListPage /></RouteGuard>} />
                                    <Route path="/admin/customers/new" element={<RouteGuard policy={policyForRoute('/admin/customers/new')}><CustomerFormPage /></RouteGuard>} />
                                    <Route path="/admin/customers/:customerId" element={<RouteGuard policy={policyForRoute('/admin/customers/:customerId')}><CustomerDetailPage /></RouteGuard>} />
                                    <Route path="/admin/customers/:customerId/edit" element={<RouteGuard policy={policyForRoute('/admin/customers/:customerId/edit')}><CustomerFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/opportunities" element={<RouteGuard policy={policyForRoute('/admin/sales/opportunities')}><SalesOpportunityListPage /></RouteGuard>} />
                                    <Route path="/admin/sales/opportunities/new" element={<RouteGuard policy={policyForRoute('/admin/sales/opportunities/new')}><SalesOpportunityFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/opportunities/:opportunityId" element={<RouteGuard policy={policyForRoute('/admin/sales/opportunities/:opportunityId')}><SalesOpportunityDetailPage /></RouteGuard>} />
                                    <Route path="/admin/sales/opportunities/:opportunityId/edit" element={<RouteGuard policy={policyForRoute('/admin/sales/opportunities/:opportunityId/edit')}><SalesOpportunityFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/quotations" element={<RouteGuard policy={policyForRoute('/admin/sales/quotations')}><QuotationListPage /></RouteGuard>} />
                                    <Route path="/admin/sales/quotations/new" element={<RouteGuard policy={policyForRoute('/admin/sales/quotations/new')}><QuotationFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/quotations/:quotationId" element={<RouteGuard policy={policyForRoute('/admin/sales/quotations/:quotationId')}><QuotationDetailPage /></RouteGuard>} />
                                    <Route path="/admin/sales/quotations/:quotationId/edit" element={<RouteGuard policy={policyForRoute('/admin/sales/quotations/:quotationId/edit')}><QuotationFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/quotations/:quotationId/print" element={<RouteGuard policy={policyForRoute('/admin/sales/quotations/:quotationId/print')}><QuotationPrintPage /></RouteGuard>} />
                                    <Route path="/admin/sales/contracts" element={<RouteGuard policy={policyForRoute('/admin/sales/contracts')}><ContractListPage /></RouteGuard>} />
                                    <Route path="/admin/sales/contracts/from-quotation/:quotationId" element={<RouteGuard policy={policyForRoute('/admin/sales/contracts/from-quotation/:quotationId')}><ContractFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/contracts/:contractId/edit" element={<RouteGuard policy={policyForRoute('/admin/sales/contracts/:contractId/edit')}><ContractFormPage /></RouteGuard>} />
                                    <Route path="/admin/sales/contracts/:contractId/print" element={<RouteGuard policy={policyForRoute('/admin/sales/contracts/:contractId/print')}><ContractPrintPage /></RouteGuard>} />
                                    <Route path="/admin/sales/contracts/:contractId" element={<RouteGuard policy={policyForRoute('/admin/sales/contracts/:contractId')}><ContractDetailPage /></RouteGuard>} />
                                    <Route path="/admin/catalog/products" element={<RouteGuard policy={policyForRoute('/admin/catalog/products')}><CatalogListPage /></RouteGuard>} />
                                    <Route path="/admin/catalog/products/new" element={<RouteGuard policy={policyForRoute('/admin/catalog/products/new')}><CatalogFormPage /></RouteGuard>} />
                                    <Route path="/admin/catalog/products/:itemId" element={<RouteGuard policy={policyForRoute('/admin/catalog/products/:itemId')}><CatalogDetailPage /></RouteGuard>} />
                                    <Route path="/admin/catalog/products/:itemId/edit" element={<RouteGuard policy={policyForRoute('/admin/catalog/products/:itemId/edit')}><CatalogFormPage /></RouteGuard>} />
                                    <Route path="/admin/licensing/licenses" element={<RouteGuard policy={policyForRoute('/admin/licensing/licenses')}><PendingModulePage title={t('centralAdmin.companyNav.licenses')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/licensing/subscriptions" element={<RouteGuard policy={policyForRoute('/admin/licensing/subscriptions')}><PendingModulePage title={t('centralAdmin.companyNav.subscriptions')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/licensing/renewals" element={<RouteGuard policy={policyForRoute('/admin/licensing/renewals')}><PendingModulePage title={t('centralAdmin.companyNav.renewals')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/finance/invoices" element={<RouteGuard policy={policyForRoute('/admin/finance/invoices')}><PendingModulePage title={t('centralAdmin.companyNav.invoices')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/finance/collections" element={<RouteGuard policy={policyForRoute('/admin/finance/collections')}><PendingModulePage title={t('centralAdmin.companyNav.collections')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/finance/expenses" element={<RouteGuard policy={policyForRoute('/admin/finance/expenses')}><PendingModulePage title={t('centralAdmin.companyNav.expenses')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/accounting/chart-of-accounts" element={<RouteGuard policy={policyForRoute('/admin/accounting/chart-of-accounts')}><PendingModulePage title={t('centralAdmin.companyNav.chartOfAccounts')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/accounting/journals" element={<RouteGuard policy={policyForRoute('/admin/accounting/journals')}><PendingModulePage title={t('centralAdmin.companyNav.journals')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/accounting/general-ledger" element={<RouteGuard policy={policyForRoute('/admin/accounting/general-ledger')}><PendingModulePage title={t('centralAdmin.companyNav.generalLedger')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/accounting/trial-balance" element={<RouteGuard policy={policyForRoute('/admin/accounting/trial-balance')}><PendingModulePage title={t('centralAdmin.companyNav.trialBalance')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/accounting/statements" element={<RouteGuard policy={policyForRoute('/admin/accounting/statements')}><PendingModulePage title={t('centralAdmin.companyNav.statements')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/company" element={<RouteGuard policy={policyForRoute('/admin/company')}><PendingModulePage title={t('centralAdmin.companyNav.company')} description={t('centralAdmin.placeholders.companyModule')} /></RouteGuard>} />
                                    <Route path="/admin/users" element={<RouteGuard policy={policyForRoute('/admin/users')}><UsersList /></RouteGuard>} />
                                    <Route path="/admin/access" element={<RouteGuard policy={policyForRoute('/admin/access')}><AccessControlHub /></RouteGuard>} />
                                    <Route path="/admin/access/groups" element={<RouteGuard policy={policyForRoute('/admin/access/groups')}><Groups /></RouteGuard>} />
                                    <Route path="/admin/access/roles" element={<RouteGuard policy={policyForRoute('/admin/access/roles')}><Roles /></RouteGuard>} />
                                    <Route path="/admin/access/approvals" element={<RouteGuard policy={policyForRoute('/admin/access/approvals')}><AdminUserReviewQueue /></RouteGuard>} />
                                    <Route path="/admin/audit" element={<RouteGuard policy={policyForRoute('/admin/audit')}><PendingModulePage title={t('centralAdmin.nav.audit')} description={t('centralAdmin.placeholders.globalAudit')} /></RouteGuard>} />
                                    <Route path="/admin/notifications" element={<RouteGuard policy={policyForRoute('/admin/notifications')}><NotificationTemplates /></RouteGuard>} />
                                    <Route path="/admin/system" element={<RouteGuard policy={policyForRoute('/admin/system')}><SystemConfiguration /></RouteGuard>} />
                                    <Route path="/admin/integrations" element={<RouteGuard policy={policyForRoute('/admin/integrations')}><PlatformStatusPage /></RouteGuard>} />
                                    <Route path="/admin/settings" element={<RouteGuard policy={policyForRoute('/admin/settings')}><PendingModulePage title={t('centralAdmin.nav.settings')} description={t('centralAdmin.placeholders.globalSettings')} /></RouteGuard>} />

                                    {/* FOPX workspace routes. Existing domain screens remain the source of truth. */}
                                    <Route path="/admin/fopx" element={<Navigate to="/admin/fopx/overview" replace />} />
                                    <Route path="/admin/fopx/overview" element={<RouteGuard policy={policyForRoute('/admin/fopx/overview')}><Dashboard /></RouteGuard>} />
                                    <Route path="/admin/fopx/projects" element={<RouteGuard policy={policyForRoute('/admin/fopx/projects')}><PendingModulePage title={t('centralAdmin.fopxNav.projects')} description={t('centralAdmin.placeholders.projects')} /></RouteGuard>} />
                                    <Route path="/admin/fopx/opportunities" element={<RouteGuard policy={policyForRoute('/admin/fopx/opportunities')}><OpportunityListPage /></RouteGuard>} />
                                    <Route path="/admin/fopx/opportunities/:opportunityId" element={<RouteGuard policy={policyForRoute('/admin/fopx/opportunities/:opportunityId')}><OpportunityDetailPage /></RouteGuard>} />
                                    <Route path="/admin/fopx/conversations" element={<RouteGuard policy={policyForRoute('/admin/fopx/conversations')}><SupportAdmin /></RouteGuard>} />
                                    <Route path="/admin/fopx/deals" element={<RouteGuard policy={policyForRoute('/admin/fopx/deals')}><PendingModulePage title={t('centralAdmin.fopxNav.deals')} description={t('centralAdmin.placeholders.deals')} /></RouteGuard>} />
                                    <Route path="/admin/fopx/funding" element={<RouteGuard policy={policyForRoute('/admin/fopx/funding')}><PendingModulePage title={t('centralAdmin.fopxNav.funding')} description={t('centralAdmin.placeholders.funding')} /></RouteGuard>} />
                                    <Route path="/admin/fopx/contracts" element={<RouteGuard policy={policyForRoute('/admin/fopx/contracts')}><PendingModulePage title={t('centralAdmin.fopxNav.contracts')} description={t('centralAdmin.placeholders.contracts')} /></RouteGuard>} />
                                    <Route path="/admin/fopx/moderation" element={<RouteGuard policy={policyForRoute('/admin/fopx/moderation')}><ModerationReports /></RouteGuard>} />
                                    <Route path="/admin/fopx/users" element={<RouteGuard policy={policyForRoute('/admin/fopx/users')}><ClientsList /></RouteGuard>} />
                                    <Route path="/admin/fopx/users/:clientId" element={<RouteGuard policy={policyForRoute('/admin/fopx/users/:clientId')}><ClientDetailsRoute /></RouteGuard>} />
                                    <Route path="/admin/fopx/notifications" element={<RouteGuard policy={policyForRoute('/admin/fopx/notifications')}><NotificationBroadcasts /></RouteGuard>} />
                                    <Route path="/admin/fopx/audit" element={<RouteGuard policy={policyForRoute('/admin/fopx/audit')}><PendingModulePage title={t('centralAdmin.fopxNav.audit')} description={t('centralAdmin.placeholders.workspaceAudit')} /></RouteGuard>} />
                                    <Route path="/admin/fopx/integrations" element={<RouteGuard policy={policyForRoute('/admin/fopx/integrations')}><PlatformStatusPage /></RouteGuard>} />
                                    <Route path="/admin/fopx/settings" element={<RouteGuard policy={policyForRoute('/admin/fopx/settings')}><PendingModulePage title={t('centralAdmin.fopxNav.settings')} description={t('centralAdmin.placeholders.workspaceSettings')} /></RouteGuard>} />

                                    {/* Legacy aliases retained for existing bookmarks and workflows. */}
                                    <Route path="/dashboard" element={<Navigate to="/admin/fopx/overview" replace />} />
                                    <Route path="/clients" element={<Navigate to="/admin/fopx/users" replace />} />
                                    <Route path="/clients/:clientId" element={<LegacyClientDetailsRedirect />} />
                                    <Route path="/user-onboarding" element={<ComingSoon title={t('pages.userOnboarding')} subtitle={t('messages.comingSoonSubtitle')} />} />
                                    <Route path="/groups" element={<Navigate to="/admin/access/groups" replace />} />
                                    <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                                    <Route path="/roles" element={<Navigate to="/admin/access/roles" replace />} />
                                    <Route path="/permissions" element={<ComingSoon title={t('breadcrumb.permissions')} subtitle={t('messages.comingSoonSubtitle')} />} />
                                    <Route path="/support" element={<Navigate to="/admin-support" replace />} />
                                    <Route path="/support-dashboard" element={<SupportDashboard />} />
                                    <Route path="/admin-support" element={<SupportAdmin />} />
                                    <Route path="/admin-support/chat/:conversationId" element={<ChatView />} />
                                    <Route path="/operations/reputation-rules" element={<ReputationRules />} />
                                    <Route path="/operations/pricing" element={<PricingManagement />} />
                                    <Route path="/operations/notifications" element={<NotificationBroadcasts />} />
                                    <Route path="/operations/reports" element={<ModerationReports />} />
                                    <Route path="/reference-data/file-categories" element={<FileCategoryMasterPage />} />
                                    <Route path="/company-finance" element={<CompanyFinanceShell />}>
                                        <Route index element={<FinanceOverviewPage />} />
                                        <Route path="overview" element={<FinanceOverviewPage />} />
                                        <Route path="money-in" element={<FinanceMoneyInPage />} />
                                        <Route path="money-in/new" element={<FinanceMoneyInCreatePage />} />
                                        <Route path="money-in/:transactionId/edit" element={<FinanceMoneyInCreatePage />} />
                                        <Route path="money-out" element={<FinanceMoneyOutPage />} />
                                        <Route path="money-out/new" element={<FinanceMoneyOutCreatePage />} />
                                        <Route path="money-out/:transactionId/edit" element={<FinanceMoneyOutCreatePage />} />
                                        <Route path="founder-payments" element={<CompanyFinancePage page="founderPayments" />} />
                                        <Route path="accounts" element={<FinanceAccountsPage />} />
                                        <Route path="suppliers" element={<FinanceSuppliersPage />} />
                                        <Route path="subscriptions" element={<CompanyFinancePage page="subscriptions" />} />
                                        <Route path="assets" element={<CompanyFinancePage page="assets" />} />
                                        <Route path="documents" element={<CompanyFinancePage page="documents" />} />
                                        <Route path="reports" element={<CompanyFinancePage page="reports" />} />
                                        <Route path="reconciliations" element={<FinanceReconciliationPage />} />
                                        <Route path="review-queue" element={<FinanceReviewQueuePage />} />
                                        <Route path="settings" element={<FinanceCategoriesSettingsPage />} />
                                    </Route>
                                    <Route path="/admin/company-finance" element={<CompanyFinanceShell />}>
                                        <Route path="overview" element={<FinanceOverviewPage />} />
                                        <Route path="money-in" element={<FinanceMoneyInPage />} />
                                        <Route path="money-in/new" element={<FinanceMoneyInCreatePage />} />
                                        <Route path="money-in/:transactionId/edit" element={<FinanceMoneyInCreatePage />} />
                                        <Route path="money-out" element={<FinanceMoneyOutPage />} />
                                        <Route path="money-out/new" element={<FinanceMoneyOutCreatePage />} />
                                        <Route path="money-out/:transactionId/edit" element={<FinanceMoneyOutCreatePage />} />
                                        <Route path="reconciliations" element={<FinanceReconciliationPage />} />
                                        <Route path="review-queue" element={<FinanceReviewQueuePage />} />
                                    </Route>
                                    <Route path="/reference-data/project-categories" element={<ProjectCategoryMasterPage />} />
                                    <Route path="/reference-data/opportunity-tags" element={<OpportunityTagMasterPage />} />
                                    <Route path="/reference-data/funding-goals" element={<FundingGoalMasterPage />} />
                                    <Route path="/reference-data/currencies" element={<CurrencyMasterPage />} />
                                    <Route path="/reference-data/countries" element={<CountryMasterPage />} />
                                    <Route path="/reference-data/project-stages" element={<ProjectStageMetadataPage />} />
                                    <Route path="/reference-data/risk-levels" element={<RiskLevelMasterPage />} />
                                    <Route path="/finance/*" element={<Navigate to="/company-finance" replace />} />
                                    <Route path="/reporting/*" element={<Navigate to="/company-finance/reports" replace />} />
                                    <Route path="/profile" element={<MyProfile user={currentUser} onProfileUpdated={handleProfileUpdated} />} />
                                    <Route path="/credit" element={<CreditSetup />} />
                                    <Route path="/config/credit" element={<CreditSetup />} />
                                    <Route path="/apitester" element={<ApiTester />} />
                                    <Route path="/system-config" element={<Navigate to="/admin/system" replace />} />
                                    <Route path="/config/notification-templates" element={<Navigate to="/admin/notifications" replace />} />
                                    <Route path="/admin-users/approval" element={<Navigate to="/admin/access/approvals" replace />} />
                                    <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </Suspense>
                                </LazyRouteBoundary>
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
