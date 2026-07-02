import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityEvent } from '../../../services/opportunity.service';

@Component({
  standalone: true,
  selector: 'app-opportunity-timeline',
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div *ngIf="orderedEvents.length === 0" class="rounded-lg border border-slate-800 bg-slate-800/40 p-5 text-sm text-gray-400">
        No timeline events yet.
      </div>
      <div *ngFor="let event of orderedEvents" class="rounded-lg border border-slate-800 bg-slate-800/40 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-white font-semibold">{{ event.title || 'Timeline event' }}</h3>
          <span class="text-xs text-gray-500">{{ formatDate(event.eventDate || event.date || event.createdAt) }}</span>
        </div>
        <p class="mt-2 text-sm text-gray-400">{{ event.description || '-' }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-gray-300">{{ event.eventType || event.type || 'Update' }}</span>
          <span *ngIf="event.isPublic !== null && event.isPublic !== undefined" class="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-gray-300">
            {{ event.isPublic ? 'Public' : 'Private' }}
          </span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityTimelineComponent {
  @Input() events: OpportunityEvent[] = [];

  get orderedEvents(): OpportunityEvent[] {
    return [...(this.events || [])].sort((a, b) =>
      new Date(b.eventDate || b.date || b.createdAt || 0).getTime() - new Date(a.eventDate || a.date || a.createdAt || 0).getTime()
    );
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
  }
}
