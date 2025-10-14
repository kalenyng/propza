import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Wait for session to be loaded
  await auth.waitForSession();
  
  const user = auth.user();
  if (user) {
    // User is already logged in, redirect to home
    router.navigateByUrl('/');
    return false;
  }
  return true;
};

