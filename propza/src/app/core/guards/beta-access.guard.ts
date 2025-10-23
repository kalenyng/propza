import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BetaAccessService } from '../services/beta-access.service';

export const betaAccessGuard: CanActivateFn = async () => {
  const betaAccess = inject(BetaAccessService);
  const router = inject(Router);
  
  // If beta access is not required, allow all traffic
  if (!betaAccess.isBetaAccessRequired()) {
    return true;
  }
  
  // Check if user has beta access
  if (!betaAccess.hasAccess()) {
    router.navigateByUrl('/beta-access');
    return false;
  }
  
  return true;
};

