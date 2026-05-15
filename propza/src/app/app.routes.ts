import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { PropertyListComponent } from './features/properties/pages/property-list/home.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { BetaAccessComponent } from './features/auth/pages/beta-access/beta-access.component';
import { PropertyDetailComponent } from './features/properties/pages/property-detail/property-detail.component';
import { TenantListComponent } from './features/tenants/pages/tenant-list/tenants.component';
import { TenantDetailComponent } from './features/tenants/pages/tenant-detail/tenant-detail.component';
import { SettingsComponent } from './features/settings/pages/settings/settings.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { PaymentsComponent } from './features/payments/pages/payments/payments.component';
import { AuthenticatedShellComponent } from './layout/authenticated-shell/authenticated-shell.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { betaAccessGuard } from './core/guards/beta-access.guard';

export const routes: Routes = [
  // Public landing page
  { path: '', component: LandingComponent, pathMatch: 'full' },

  // Beta access route (not protected by beta access guard)
  { path: 'beta-access', component: BetaAccessComponent },

  // Protected app shell routes (require beta access and authentication)
  {
    path: '',
    component: AuthenticatedShellComponent,
    canActivate: [betaAccessGuard, authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { mobileShellTitle: 'Dashboard' } },
      { path: 'properties', component: PropertyListComponent, data: { mobileShellTitle: 'Properties' } },
      { path: 'home', redirectTo: 'properties', pathMatch: 'full' },
      { path: 'property/:id', component: PropertyDetailComponent, data: { mobileShellTitle: 'Property' } },
      { path: 'tenants', component: TenantListComponent, data: { mobileShellTitle: 'Tenants' } },
      { path: 'tenant/:id', component: TenantDetailComponent, data: { mobileShellTitle: 'Tenant' } },
      { path: 'payments', component: PaymentsComponent, data: { mobileShellTitle: 'Payments' } },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { mobileShellTitle: 'Settings', hideMobileHero: true }
      }
    ]
  },

  // Auth routes (require beta access, guests only for auth)
  { path: 'login', component: LoginComponent, canActivate: [betaAccessGuard, guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [betaAccessGuard, guestGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },

  // 404 Not Found - must be last
  { path: '**', component: NotFoundComponent }
];
