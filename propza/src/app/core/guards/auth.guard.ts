import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Wait for session to be loaded from localStorage
  await auth.waitForSession();
  
  const user = auth.user();
  if (!user) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};


