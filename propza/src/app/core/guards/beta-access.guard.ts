import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BetaAccessService } from '../services/beta-access.service';

export const betaAccessGuard: CanActivateFn = () => {
  const betaAccess = inject(BetaAccessService);
  const router = inject(Router);
  
  if (!betaAccess.hasAccess()) {
    router.navigateByUrl('/beta-access');
    return false;
  }
  
  return true;
};

