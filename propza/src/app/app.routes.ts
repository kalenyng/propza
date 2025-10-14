import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { TenantsComponent } from './pages/tenants/tenants.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';

export const routes: Routes = [
  // Default route - protected by authGuard; non-auth users redirected to /login by the guard
  { path: '', component: HomeComponent, canActivate: [authGuard] },

  // Protected routes
  { path: 'property/:id', component: PropertyDetailComponent, canActivate: [authGuard] },
  { path: 'tenants', component: TenantsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

  // Auth routes (guests only)
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  { path: '**', redirectTo: '' }
];
