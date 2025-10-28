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
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { betaAccessGuard } from './core/guards/beta-access.guard';

export const routes: Routes = [
  // Public landing page
  { path: '', component: LandingComponent },

  // Beta access route (not protected by beta access guard)
  { path: 'beta-access', component: BetaAccessComponent },

  // App home - protected by betaAccessGuard and authGuard
  { path: 'home', component: PropertyListComponent, canActivate: [betaAccessGuard, authGuard] },

  // Protected routes (require beta access and authentication)
  { path: 'property/:id', component: PropertyDetailComponent, canActivate: [betaAccessGuard, authGuard] },
  { path: 'tenants', component: TenantListComponent, canActivate: [betaAccessGuard, authGuard] },
  { path: 'tenant/:id', component: TenantDetailComponent, canActivate: [betaAccessGuard, authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [betaAccessGuard, authGuard] },

  // Auth routes (require beta access, guests only for auth)
  { path: 'login', component: LoginComponent, canActivate: [betaAccessGuard, guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [betaAccessGuard, guestGuard] },

  // 404 Not Found - must be last
  { path: '**', component: NotFoundComponent }
];
