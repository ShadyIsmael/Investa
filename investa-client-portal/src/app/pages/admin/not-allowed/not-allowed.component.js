import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoleContextService } from '../../../services/role-context.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function NotAllowedComponent_a_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 10);
    i0.ɵɵtext(1, "My Opportunities");
    i0.ɵɵelementEnd();
} }
export class NotAllowedComponent {
    constructor() {
        this.roleContext = inject(RoleContextService);
    }
    static { this.ɵfac = function NotAllowedComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotAllowedComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotAllowedComponent, selectors: [["app-not-allowed"]], decls: 13, vars: 1, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8"], [1, "mx-auto", "max-w-2xl", "rounded-xl", "border", "border-slate-800", "bg-slate-900/80", "p-8", "text-center"], [1, "mx-auto", "mb-5", "flex", "h-14", "w-14", "items-center", "justify-center", "rounded-xl", "border", "border-amber-500/30", "bg-amber-500/10", "text-amber-300"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "h-7", "w-7"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M12 9v3.75m0 3.75h.008v.008H12V16.5zm9-4.5a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-2xl", "font-bold", "text-white"], [1, "mt-3", "text-gray-400"], [1, "mt-6", "flex", "flex-col", "justify-center", "gap-3", "sm:flex-row"], ["routerLink", "/admin/investments", 1, "rounded-lg", "bg-blue-600", "px-4", "py-2", "text-sm", "font-semibold", "text-white", "hover:bg-blue-500"], ["routerLink", "/admin/my-opportunities", "class", "rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700", 4, "ngIf"], ["routerLink", "/admin/my-opportunities", 1, "rounded-lg", "bg-slate-800", "px-4", "py-2", "text-sm", "font-semibold", "text-gray-200", "hover:bg-slate-700"]], template: function NotAllowedComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(3, "svg", 3);
            i0.ɵɵelement(4, "path", 4);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(5, "h1", 5);
            i0.ɵɵtext(6, "Not allowed");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 6);
            i0.ɵɵtext(8, " This action is available for founder accounts. You can still discover opportunities, manage your wallet, notifications, and profile. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "div", 7)(10, "a", 8);
            i0.ɵɵtext(11, "Discover Opportunities");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(12, NotAllowedComponent_a_12_Template, 2, 0, "a", 9);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(12);
            i0.ɵɵproperty("ngIf", ctx.roleContext.isActiveFounderContext());
        } }, dependencies: [CommonModule, i1.NgIf, RouterLink], encapsulation: 2, changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotAllowedComponent, [{
        type: Component,
        args: [{
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
          <a routerLink="/admin/investments" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Discover Opportunities</a>
          <a *ngIf="roleContext.isActiveFounderContext()" routerLink="/admin/my-opportunities" class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700">My Opportunities</a>
        </div>
      </div>
    </div>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotAllowedComponent, { className: "NotAllowedComponent", filePath: "src/app/pages/admin/not-allowed/not-allowed.component.ts", lineNumber: 31 }); })();
