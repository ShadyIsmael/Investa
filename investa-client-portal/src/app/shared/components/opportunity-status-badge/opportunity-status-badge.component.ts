import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-opportunity-status-badge',
  imports: [CommonModule],
  template: `
    <span class="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold" [ngClass]="tone">
      {{ label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityStatusBadgeComponent {
  @Input() status: string | null | undefined = 'Draft';

  get label(): string {
    return this.status || 'Draft';
  }

  get tone(): string {
    switch ((this.status || '').toLowerCase()) {
      case 'published':
      case 'approved':
      case 'funding':
      case 'fullyfunded':
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
      case 'underreview':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/25';
      case 'rejected':
        return 'bg-red-500/15 text-red-300 border-red-500/25';
      case 'archived':
        return 'bg-slate-800 text-gray-400 border-slate-700';
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/25';
    }
  }
}
