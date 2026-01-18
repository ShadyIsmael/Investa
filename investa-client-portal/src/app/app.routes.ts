import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { InvestmentsComponent } from './pages/admin/investments/investments.component';
import { ProfileComponent } from './pages/admin/profile/profile.component';
import { ChatComponent } from './pages/admin/chat/chat.component';
import { AboutPageComponent } from './pages/about/about.component';
import { ServicesPageComponent } from './pages/services/services.component';
import { BlogPageComponent } from './pages/blog/blog.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { BlogPostPageComponent } from './pages/blog-post/blog-post.component';
import { InvestmentPreviewComponent } from './pages/admin/investment-details/investment-details.component';
import { NotificationsComponent } from './pages/admin/notifications/notifications.component';
import { StartInvestigationComponent } from './pages/admin/start-investigation/start-investigation.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Investa' },
  { path: 'about', component: AboutPageComponent, title: 'About - Investa' },
  { path: 'services', component: ServicesPageComponent, title: 'Services - Investa' },
  { path: 'blog', component: BlogPageComponent, title: 'Blog - Investa' },
  { path: 'blog/:slug', component: BlogPostPageComponent, title: 'Blog Post - Investa' },
  { path: 'contact', component: ContactPageComponent, title: 'Contact - Investa' },
  { path: 'login', component: LoginComponent, title: 'Login - Investa' },
  { path: 'signup', component: SignupComponent, title: 'Sign Up - Investa' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - Investa' },
      { path: 'investments', component: InvestmentsComponent, title: 'Investments - Investa' },
      { path: 'investments/:id', component: InvestmentPreviewComponent, title: 'Investment Preview - Investa' },
      { path: 'start-investigation', component: StartInvestigationComponent, title: 'Start Investigation - Investa' },
      { path: 'chat', component: ChatComponent, title: 'Communication - Investa' },
      { path: 'profile', component: ProfileComponent, title: 'My Profile - Investa' },
      { path: 'notifications', component: NotificationsComponent, title: 'Notifications - Investa' }
    ]
  }
];
