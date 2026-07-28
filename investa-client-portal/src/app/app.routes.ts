import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { founderOnlyGuard } from './guards/founder-only.guard';

export const routes: Routes = [
  // Public routes - eager loaded for fast initial page load
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'FOPX One' 
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutPageComponent),
    title: 'About - FOPX One' 
  },
  { 
    path: 'services', 
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesPageComponent),
    title: 'Services - FOPX One' 
  },
  { 
    path: 'blog', 
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogPageComponent),
    title: 'Blog - FOPX One' 
  },
  { 
    path: 'blog/:slug', 
    loadComponent: () => import('./pages/blog-post/blog-post.component').then(m => m.BlogPostPageComponent),
    title: 'Blog Post - FOPX One' 
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactPageComponent),
    title: 'Contact - FOPX One' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - FOPX One' 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    title: 'Sign Up - FOPX One' 
  },
  { 
    path: 'signup-otp', 
    loadComponent: () => import('./pages/signup-otp/signup-otp.component').then(m => m.SignupOtpComponent),
    title: 'Verify OTP - FOPX One' 
  },
  {
    path: 'opportunities/:id',
    loadComponent: () => import('./pages/admin/investment-preview/investment-preview.component').then(m => m.InvestmentPreviewComponent),
    title: 'Opportunity - FOPX One'
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
        title: 'Dashboard - FOPX One' 
      },
      { 
        path: 'investments', 
        loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.InvestmentsComponent),
        title: 'Discover Opportunities - FOPX One'
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
        title: 'Edit Opportunity - FOPX One'
      },
      {
        path: 'opportunities/:id/room',
        loadComponent: () => import('./pages/admin/opportunity-room/opportunity-room.component').then(m => m.OpportunityRoomComponent),
        title: 'Project Room - FOPX One'
      },
      {
        path: 'opportunities/:id',
        loadComponent: () => import('./pages/admin/opportunities/opportunity-details.component').then(m => m.OpportunityDetailsComponent),
        title: 'Opportunity Details - FOPX One'
      },
      {
        path: 'my-opportunities',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'my-projects',
        loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.InvestmentsComponent),
        title: 'My Participations - FOPX One'
      },
      { 
        path: 'investments/new', 
        loadComponent: () => import('./pages/admin/opportunities/opportunity-editor.component').then(m => m.OpportunityEditorComponent),
        canActivate: [founderOnlyGuard],
        title: 'Create Opportunity - FOPX One'
      },
      {
        path: 'investments/:id/media',
        loadComponent: () => import('./pages/admin/investment-media/investment-media.component').then(m => m.InvestmentMediaComponent),
        title: 'Opportunity Media - FOPX One'
      },
      { 
        path: 'investments/:id', 
        loadComponent: () => import('./pages/admin/investment-preview/investment-preview.component').then(m => m.InvestmentPreviewComponent),
        title: 'Opportunity Details - FOPX One'
      },
      {
        path: 'founders/:id',
        loadComponent: () => import('./pages/admin/founder-profile/founder-profile.component').then(m => m.FounderProfileComponent),
        title: 'Founder Profile - FOPX One'
      },

      { 
        path: 'chat', 
        loadComponent: () => import('./pages/admin/chat/chat.component').then(m => m.ChatComponent),
        title: 'Communication - FOPX One' 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/admin/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Profile - FOPX One' 
      },
      {
        path: 'not-allowed',
        loadComponent: () => import('./pages/admin/not-allowed/not-allowed.component').then(m => m.NotAllowedComponent),
        title: 'Not Allowed - FOPX One'
      },
      {
        path: 'profile/wallet',
        loadComponent: () => import('./pages/admin/wallet/wallet.component').then(m => m.WalletComponent),
        title: 'Wallet - FOPX One'
      },
      {
        path: 'profile/notifications',
        loadComponent: () => import('./pages/admin/notification-center/notification-center.component').then(m => m.NotificationCenterComponent),
        title: 'Notification Center - FOPX One'
      },
      { 
        path: 'transactions', 
        loadComponent: () => import('./pages/admin/transactions/transactions.component').then(m => m.TransactionsComponent),
        title: 'Transactions - FOPX One' 
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./pages/admin/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications - FOPX One' 
      }
      ,
      { 
        path: 'requests', 
        loadComponent: () => import('./pages/admin/requests/requests.component').then(m => m.RequestsComponent),
        title: 'Requests - FOPX One' 
      }
      ,
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings - FOPX One' 
      },
      { 
        path: 'credit-charge', 
        loadComponent: () => import('./pages/admin/credit-charge/credit-charge.component').then(m => m.CreditChargeComponent),
        title: 'Charge Credits - FOPX One' 
      }
    ]
  }
];
