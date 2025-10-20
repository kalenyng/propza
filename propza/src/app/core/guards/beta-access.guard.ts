import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { BetaAccessService } from '../services/beta-access.service';

export const betaAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const betaAccess = inject(BetaAccessService);
  const router = inject(Router);
  
  console.log('[BETA GUARD] Current URL:', window.location.href);
  console.log('[BETA GUARD] Current hash:', window.location.hash);
  console.log('[BETA GUARD] Route URL:', router.url);
  console.log('[BETA GUARD] Has beta access:', betaAccess.hasAccess());
  
  // Check if beta parameter is in URL (from OAuth redirect)
  const betaParam = route.queryParamMap.get('beta');
  console.log('[BETA GUARD] Beta param:', betaParam);
  
  if (betaParam === 'granted') {
    console.log('[BETA GUARD] Granting beta access from URL param');
    // Grant beta access and store it
    betaAccess.grantAccess();
    // Clean up URL by removing the parameter
    const urlWithoutBeta = router.url.split('?')[0].split('#')[0];
    router.navigateByUrl(urlWithoutBeta, { replaceUrl: true });
    return true;
  }
  
  // Check if this is an OAuth callback (has hash with tokens)
  if (window.location.hash && window.location.hash.includes('access_token')) {
    console.log('[BETA GUARD] OAuth callback detected - granting beta access');
    // User is returning from OAuth, grant beta access to avoid redirect loop
    betaAccess.grantAccess();
    return true;
  }
  
  if (!betaAccess.hasAccess()) {
    console.log('[BETA GUARD] No beta access - redirecting to /beta-access');
    router.navigateByUrl('/beta-access');
    return false;
  }
  
  console.log('[BETA GUARD] Beta access granted - allowing navigation');
  return true;
};

