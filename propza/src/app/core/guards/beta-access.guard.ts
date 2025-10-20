import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { BetaAccessService } from '../services/beta-access.service';

export const betaAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const betaAccess = inject(BetaAccessService);
  const router = inject(Router);
  
  // Check if beta parameter is in URL (from OAuth redirect)
  const betaParam = route.queryParamMap.get('beta');
  if (betaParam === 'granted') {
    // Grant beta access and store it
    betaAccess.grantAccess();
    // Clean up URL by removing the parameter
    const urlWithoutBeta = router.url.split('?')[0].split('#')[0];
    router.navigateByUrl(urlWithoutBeta, { replaceUrl: true });
    return true;
  }
  
  // Check if this is an OAuth callback (has hash with tokens)
  if (window.location.hash && window.location.hash.includes('access_token')) {
    // User is returning from OAuth, grant beta access to avoid redirect loop
    betaAccess.grantAccess();
    return true;
  }
  
  if (!betaAccess.hasAccess()) {
    router.navigateByUrl('/beta-access');
    return false;
  }
  
  return true;
};

