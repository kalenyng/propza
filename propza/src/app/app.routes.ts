import { Routes } from '@angular/router';
import { PropertyListComponent } from './features/properties/pages/property-list/home.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { PropertyDetailComponent } from './features/properties/pages/property-detail/property-detail.component';
import { TenantListComponent } from './features/tenants/pages/tenant-list/tenants.component';
import { TenantDetailComponent } from './features/tenants/pages/tenant-detail/tenant-detail.component';
import { SettingsComponent } from './features/settings/pages/settings/settings.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Default route - protected by authGuard; non-auth users redirected to /login by the guard
  { path: '', component: PropertyListComponent, canActivate: [authGuard] },

  // Protected routes
  { path: 'property/:id', component: PropertyDetailComponent, canActivate: [authGuard] },
  { path: 'tenants', component: TenantListComponent, canActivate: [authGuard] },
  { path: 'tenant/:id', component: TenantDetailComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

  // Auth routes (guests only)
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  { path: '**', redirectTo: '' }
];
