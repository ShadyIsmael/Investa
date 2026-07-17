import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RoleContextService } from '../services/role-context.service';
export const founderOnlyGuard = async () => {
    const roleContext = inject(RoleContextService);
    const router = inject(Router);
    try {
        await roleContext.ensureProfileLoaded();
    }
    catch {
        // Auth guard owns authentication. This guard only protects founder UX.
    }
    return roleContext.canCreateOpportunity()
        ? true
        : router.createUrlTree(['/admin/not-allowed'], {
            queryParams: { returnUrl: router.url || '/admin/investments' }
        });
};
