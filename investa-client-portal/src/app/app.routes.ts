import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { founderOnlyGuard } from './guards/founder-only.guard';

export const routes: Routes = [
  // Public routes - eager loaded for fast initial page load
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Investa' 
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutPageComponent),
    title: 'About - Investa' 
  },
  { 
    path: 'services', 
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesPageComponent),
    title: 'Services - Investa' 
  },
  { 
    path: 'blog', 
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogPageComponent),
    title: 'Blog - Investa' 
  },
  { 
    path: 'blog/:slug', 
    loadComponent: () => import('./pages/blog-post/blog-post.component').then(m => m.BlogPostPageComponent),
    title: 'Blog Post - Investa' 
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactPageComponent),
    title: 'Contact - Investa' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Investa' 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    title: 'Sign Up - Investa' 
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
        title: 'Dashboard - Investa' 
      },
      { 
        path: 'investments', 
        loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.InvestmentsComponent),
        title: 'Discover Opportunities - Investa'
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
        title: 'Edit Opportunity - Investa'
      },
      {
        path: 'opportunities/:id/room',
        loadComponent: () => import('./pages/admin/opportunity-room/opportunity-room.component').then(m => m.OpportunityRoomComponent),
        title: 'Project Room - Investa'
      },
      {
        path: 'opportunities/:id',
        loadComponent: () => import('./pages/admin/opportunities/opportunity-details.component').then(m => m.OpportunityDetailsComponent),
        title: 'Opportunity Details - Investa'
      },
      {
        path: 'my-opportunities',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'my-projects',
        loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.InvestmentsComponent),
        title: 'My Participations - Investa'
      },
      { 
        path: 'investments/new', 
        loadComponent: () => import('./pages/admin/opportunities/opportunity-editor.component').then(m => m.OpportunityEditorComponent),
        canActivate: [founderOnlyGuard],
        title: 'Create Opportunity - Investa'
      },
      {
        path: 'investments/:id/media',
        loadComponent: () => import('./pages/admin/investment-media/investment-media.component').then(m => m.InvestmentMediaComponent),
        title: 'Opportunity Media - Investa'
      },
      { 
        path: 'investments/:id', 
        loadComponent: () => import('./pages/admin/investment-preview/investment-preview.component').then(m => m.InvestmentPreviewComponent),
        title: 'Opportunity Details - Investa'
      },
      {
        path: 'founders/:id',
        loadComponent: () => import('./pages/admin/founder-profile/founder-profile.component').then(m => m.FounderProfileComponent),
        title: 'Founder Profile - Investa'
      },

      { 
        path: 'chat', 
        loadComponent: () => import('./pages/admin/chat/chat.component').then(m => m.ChatComponent),
        title: 'Communication - Investa' 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/admin/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Profile - Investa' 
      },
      {
        path: 'not-allowed',
        loadComponent: () => import('./pages/admin/not-allowed/not-allowed.component').then(m => m.NotAllowedComponent),
        title: 'Not Allowed - Investa'
      },
      {
        path: 'profile/wallet',
        loadComponent: () => import('./pages/admin/wallet/wallet.component').then(m => m.WalletComponent),
        title: 'Wallet - Investa'
      },
      {
        path: 'profile/notifications',
        loadComponent: () => import('./pages/admin/notification-center/notification-center.component').then(m => m.NotificationCenterComponent),
        title: 'Notification Center - Investa'
      },
      { 
        path: 'transactions', 
        loadComponent: () => import('./pages/admin/transactions/transactions.component').then(m => m.TransactionsComponent),
        title: 'Transactions - Investa' 
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./pages/admin/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications - Investa' 
      }
      ,
      { 
        path: 'requests', 
        loadComponent: () => import('./pages/admin/requests/requests.component').then(m => m.RequestsComponent),
        title: 'Requests - Investa' 
      }
      ,
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings - Investa' 
      },
      { 
        path: 'credit-charge', 
        loadComponent: () => import('./pages/admin/credit-charge/credit-charge.component').then(m => m.CreditChargeComponent),
        title: 'Charge Credits - Investa' 
      }
    ]
  }
];
