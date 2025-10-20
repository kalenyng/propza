import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { BetaAccessService } from '../services/beta-access.service';
import { AuthService } from '../services/auth.service';

export const betaAccessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const betaAccess = inject(BetaAccessService);
  const router = inject(Router);
  const auth = inject(AuthService);
  
  await auth.waitForSession();
  const user = auth.user();
  
  const betaParam = route.queryParamMap.get('beta');
  
  if (betaParam === 'granted') {
    betaAccess.grantAccess();
    return true;
  }
  
  if (window.location.hash && window.location.hash.includes('access_token')) {
    betaAccess.grantAccess();
    return true;
  }
  
  if (user && !betaAccess.hasAccess()) {
    betaAccess.grantAccess();
    return true;
  }
  
  if (!betaAccess.hasAccess()) {
    router.navigateByUrl('/beta-access');
    return false;
  }
  
  return true;
};

