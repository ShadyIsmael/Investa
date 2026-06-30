import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoleContextService } from '../../../services/role-context.service';

@Component({
  standalone: true,
  selector: 'app-not-allowed',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto p-6 lg:p-8">
      <div class="mx-auto max-w-2xl rounded-xl border border-slate-800 bg-slate-900/80 p-8 text-center">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m0 3.75h.008v.008H12V16.5zm9-4.5a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">Not allowed</h1>
        <p class="mt-3 text-gray-400">
          This action is available for founder accounts. You can still discover opportunities, manage your wallet, notifications, and profile.
        </p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a routerLink="/admin/opportunities" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Discover Opportunities</a>
          <a *ngIf="roleContext.isFounderUser()" routerLink="/admin/my-opportunities" class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700">My Opportunities</a>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotAllowedComponent {
  roleContext = inject(RoleContextService);
}
