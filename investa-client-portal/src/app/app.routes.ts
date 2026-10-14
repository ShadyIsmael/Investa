import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { founderOnlyGuard } from './guards/founder-only.guard';

export const routes: Routes = [
  // Public routes - eager loaded for fast initial page load
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'pageTitles.app'
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutPageComponent),
    title: 'pageTitles.about'
  },
  { 
    path: 'services', 
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesPageComponent),
    title: 'pageTitles.services'
  },
  { 
    path: 'blog', 
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogPageComponent),
    title: 'pageTitles.blog'
  },
  { 
    path: 'blog/:slug', 
    loadComponent: () => import('./pages/blog-post/blog-post.component').then(m => m.BlogPostPageComponent),
    title: 'pageTitles.blogPost'
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactPageComponent),
    title: 'pageTitles.contact'
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'pageTitles.login'
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    title: 'pageTitles.signUp'
  },
  { 
    path: 'signup-otp', 
    loadComponent: () => import('./pages/signup-otp/signup-otp.component').then(m => m.SignupOtpComponent),
    title: 'pageTitles.verifyOtp'
  },
  {
    path: 'opportunities/:id',
    loadComponent: () => import('./pages/admin/investment-preview/investment-preview.component').then(m => m.InvestmentPreviewComponent),
    title: 'pageTitles.opportunityDetails'
  },
  // Admin routes - lazy loaded (requires authentication)
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'pageTitles.dashboard'
      },
      { 
        path: 'investments', 
        loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.InvestmentsComponent),
        title: 'pageTitles.discoverOpportunities'
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/admin/projects/projects.component').then(m => m.ProjectsComponent),
        canActivate: [founderOnlyGuard],
        title: 'pageTitles.projects'
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./pages/admin/projects/project-editor.component').then(m => m.ProjectEditorComponent),
        canActivate: [founderOnlyGuard],
        title: 'pageTitles.createProject'
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () => import('./pages/admin/projects/project-editor.component').then(m => m.ProjectEditorComponent),
        canActivate: [founderOnlyGuard],
        title: 'pageTitles.editProject'
      },
        {
          path: 'projects/:id/room',
          loadComponent: () => import('./pages/admin/projects/project-room.component').then(m => m.ProjectRoomComponent),
          title: 'pageTitles.projectWorkspace'
        },
        {
          path: 'projects/:id',
        loadComponent: () => import('./pages/admin/projects/project-editor.component').then(m => m.ProjectEditorComponent),
        title: 'pageTitles.projectDetails'
      },
      {
        path: 'opportunities',
        redirectTo: 'investments',
        pathMatch: 'full'
      },
      {
        path: 'opportunities/:id/edit',
        loadComponent: () => import('./pages/admin/opportunities/opportunity-editor.component').then(m => m.OpportunityEditorComponent),
        canActivate: [founderOnlyGuard],
        title: 'pageTitles.editOpportunity'
      },
      {
        path: 'opportunities/:id/room',
        loadComponent: () => import('./pages/admin/opportunity-room/opportunity-room.component').then(m => m.OpportunityRoomComponent),
        title: 'pageTitles.opportunityRoom'
      },
      {
        path: 'opportunities/:id/obligations',
        loadComponent: () => import('./pages/admin/opportunity-obligations/opportunity-obligations.component').then(m => m.OpportunityObligationsComponent),
        title: 'pageTitles.opportunityObligations'
      },
      {
        path: 'opportunities/:id',
        loadComponent: () => import('./pages/admin/investment-preview/investment-preview.component').then(m => m.InvestmentPreviewComponent),
        title: 'pageTitles.opportunityDetails'
      },
      {
        path: 'my-opportunities',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'my-projects',
        loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.InvestmentsComponent),
        title: 'pageTitles.myParticipations'
      },
      { 
        path: 'investments/new', 
        loadComponent: () => import('./pages/admin/opportunities/opportunity-editor.component').then(m => m.OpportunityEditorComponent),
        canActivate: [founderOnlyGuard],
        title: 'pageTitles.createOpportunity'
      },
      {
        path: 'investments/:id/media',
        loadComponent: () => import('./pages/admin/investment-media/investment-media.component').then(m => m.InvestmentMediaComponent),
        title: 'pageTitles.opportunityMedia'
      },
      { 
        path: 'investments/:id', 
        loadComponent: () => import('./pages/admin/investment-preview/investment-preview.component').then(m => m.InvestmentPreviewComponent),
        title: 'pageTitles.opportunityDetails'
      },
      {
        path: 'founders/:id',
        loadComponent: () => import('./pages/admin/founder-profile/founder-profile.component').then(m => m.FounderProfileComponent),
        title: 'pageTitles.founderProfile'
      },

      { 
        path: 'chat', 
        loadComponent: () => import('./pages/admin/chat/chat.component').then(m => m.ChatComponent),
        title: 'pageTitles.conversations'
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/admin/profile/profile.component').then(m => m.ProfileComponent),
        title: 'pageTitles.myProfile'
      },
      {
        path: 'not-allowed',
        loadComponent: () => import('./pages/admin/not-allowed/not-allowed.component').then(m => m.NotAllowedComponent),
        title: 'pageTitles.notAllowed'
      },
      {
        path: 'profile/wallet',
        loadComponent: () => import('./pages/admin/wallet/wallet.component').then(m => m.WalletComponent),
        title: 'pageTitles.wallet'
      },
      {
        path: 'profile/notifications',
        loadComponent: () => import('./pages/admin/notification-center/notification-center.component').then(m => m.NotificationCenterComponent),
        title: 'pageTitles.notificationCenter'
      },
      { 
        path: 'transactions', 
        loadComponent: () => import('./pages/admin/transactions/transactions.component').then(m => m.TransactionsComponent),
        title: 'pageTitles.transactions'
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./pages/admin/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'pageTitles.notifications'
      }
      ,
      { 
        path: 'requests', 
        loadComponent: () => import('./pages/admin/requests/requests.component').then(m => m.RequestsComponent),
        title: 'pageTitles.requests'
      }
      ,
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.SettingsComponent),
        title: 'pageTitles.settings'
      },
      { 
        path: 'credit-charge', 
        loadComponent: () => import('./pages/admin/credit-charge/credit-charge.component').then(m => m.CreditChargeComponent),
        title: 'pageTitles.chargeCredits'
      }
    ]
  }
];
