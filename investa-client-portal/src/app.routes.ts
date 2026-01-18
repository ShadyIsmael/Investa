import { Routes } from '@angular/router';
import { HomeComponent } from './app/pages/home/home.component';
import { LoginComponent } from './app/pages/login/login.component';
import { SignupComponent } from './app/pages/signup/signup.component';
import { AdminLayoutComponent } from './app/pages/admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './app/pages/admin/dashboard/dashboard.component';
import { authGuard } from './app/guards/auth.guard';
import { InvestmentsComponent } from './app/pages/admin/investments/investments.component';
import { ProfileComponent } from './app/pages/admin/profile/profile.component';
import { ChatComponent } from './app/pages/admin/chat/chat.component';
import { AboutPageComponent } from './app/pages/about/about.component';
import { ServicesPageComponent } from './app/pages/services/services.component';
import { BlogPageComponent } from './app/pages/blog/blog.component';
import { ContactPageComponent } from './app/pages/contact/contact.component';
import { BlogPostPageComponent } from './app/pages/blog-post/blog-post.component';
import { InvestmentPreviewComponent } from './app/pages/admin/investment-details/investment-details.component';
import { NotificationsComponent } from './app/pages/admin/notifications/notifications.component';
import { StartInvestigationComponent } from './app/pages/admin/start-investigation/start-investigation.component';

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
