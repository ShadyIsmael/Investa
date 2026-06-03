import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { TrustService } from '../services/trust.service';
import { TrustLevel } from '../models/trust.model';
import { firstValueFrom } from 'rxjs';

/**
 * Guard that enforces minimum trust level for a route.
 *
 * Usage in routes:
 *   canActivate: [trustLevelGuard],
 *   data: { minTrustLevel: TrustLevel.Interactive }
 */
export const trustLevelGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const trustService = inject(TrustService);
  const router = inject(Router);

  const minLevel: TrustLevel = route.data?.['minTrustLevel'] ?? TrustLevel.Registered;

  // Ensure profile is loaded
  if (!trustService.isLoaded()) {
    await firstValueFrom(trustService.loadProfile());
  }

  if (trustService.meetsLevel(minLevel)) {
    return true;
  }

  // Redirect to trust upgrade page with context
  router.navigate(['/trust-required'], {
    queryParams: { requiredLevel: minLevel }
  });
  return false;
};
