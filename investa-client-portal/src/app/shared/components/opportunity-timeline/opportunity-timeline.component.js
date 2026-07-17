import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function OpportunityTimelineComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵtext(1, " No timeline events yet. ");
    i0.ɵɵelementEnd();
} }
function OpportunityTimelineComponent_div_2_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const event_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", event_r1.isPublic ? "Public" : "Private", " ");
} }
function OpportunityTimelineComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "div", 5)(2, "h3", 6);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 7);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "p", 8);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 9)(9, "span", 10);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(11, OpportunityTimelineComponent_div_2_span_11_Template, 2, 1, "span", 11);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const event_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(event_r1.title || "Timeline event");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(event_r1.eventDate || event_r1.date || event_r1.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(event_r1.description || "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(event_r1.eventType || event_r1.type || "Update");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", event_r1.isPublic !== null && event_r1.isPublic !== undefined);
} }
export class OpportunityTimelineComponent {
    constructor() {
        this.events = [];
    }
    get orderedEvents() {
        return [...(this.events || [])].sort((a, b) => new Date(b.eventDate || b.date || b.createdAt || 0).getTime() - new Date(a.eventDate || a.date || a.createdAt || 0).getTime());
    }
    formatDate(value) {
        if (!value)
            return '-';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
    }
    static { this.ɵfac = function OpportunityTimelineComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OpportunityTimelineComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OpportunityTimelineComponent, selectors: [["app-opportunity-timeline"]], inputs: { events: "events" }, decls: 3, vars: 2, consts: [[1, "space-y-4"], ["class", "rounded-lg border border-slate-800 bg-slate-800/40 p-5 text-sm text-gray-400", 4, "ngIf"], ["class", "rounded-lg border border-slate-800 bg-slate-800/40 p-5", 4, "ngFor", "ngForOf"], [1, "rounded-lg", "border", "border-slate-800", "bg-slate-800/40", "p-5", "text-sm", "text-gray-400"], [1, "rounded-lg", "border", "border-slate-800", "bg-slate-800/40", "p-5"], [1, "flex", "flex-wrap", "items-center", "justify-between", "gap-3"], [1, "text-white", "font-semibold"], [1, "text-xs", "text-gray-500"], [1, "mt-2", "text-sm", "text-gray-400"], [1, "mt-3", "flex", "flex-wrap", "gap-2"], [1, "rounded-full", "bg-slate-900", "px-2.5", "py-1", "text-xs", "text-gray-300"], ["class", "rounded-full bg-slate-900 px-2.5 py-1 text-xs text-gray-300", 4, "ngIf"]], template: function OpportunityTimelineComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵtemplate(1, OpportunityTimelineComponent_div_1_Template, 2, 0, "div", 1)(2, OpportunityTimelineComponent_div_2_Template, 12, 5, "div", 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.orderedEvents.length === 0);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngForOf", ctx.orderedEvents);
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf], encapsulation: 2, changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OpportunityTimelineComponent, [{
        type: Component,
        args: [{
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
            }]
    }], null, { events: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OpportunityTimelineComponent, { className: "OpportunityTimelineComponent", filePath: "src/app/shared/components/opportunity-timeline/opportunity-timeline.component.ts", lineNumber: 31 }); })();
