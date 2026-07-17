import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiService } from '../../services/ui.service';
import * as i0 from "@angular/core";
export class RoleSelectComponent {
    constructor() {
        // Fix: Explicitly type injected Router to resolve a type inference issue.
        this.router = inject(Router);
        this.uiService = inject(UiService);
    }
    selectRole(role) {
        this.uiService.closeRoleSelectModal();
        this.router.navigate(['/login'], { queryParams: { role } });
    }
    closeModal() {
        this.uiService.closeRoleSelectModal();
    }
    static { this.ɵfac = function RoleSelectComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RoleSelectComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RoleSelectComponent, selectors: [["app-role-select"]], decls: 41, vars: 27, consts: [[1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-[99]", "flex", "items-center", "justify-center", "p-4", "animate-fade-in", 2, "animation-duration", "0.3s", 3, "click"], [1, "relative", "bg-slate-900", "border", "border-slate-800", "rounded-2xl", "shadow-2xl", "w-full", "max-w-4xl", "m-4", "p-8", "md:p-12", "text-center", "animate-fade-in", 2, "animation-delay", "0.1s", "animation-duration", "0.4s", 3, "click"], [1, "absolute", "top-4", "end-4", "text-gray-400", "hover:text-white", "transition-colors", "p-2", "rounded-full", "hover:bg-slate-700", 3, "click"], [1, "sr-only"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M6 18L18 6M6 6l12 12"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white", "mb-4"], [1, "text-gray-400", "mb-10", "max-w-2xl", "mx-auto"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-8"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-xl", "p-8", "flex", "flex-col", "items-center", "hover:bg-slate-800", "hover:border-blue-500/50", "transition-all", "duration-300", "transform", "hover:-translate-y-1", "cursor-pointer", "group", 3, "click"], [1, "w-16", "h-16", "rounded-full", "bg-blue-500/10", "flex", "items-center", "justify-center", "border-2", "border-blue-500/20", "text-blue-400", "mb-6"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-8", "h-8"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-3.75M21 12l-3.75-3.75"], [1, "text-2xl", "font-bold", "text-white", "mb-3"], [1, "text-gray-400", "mb-6", "flex-grow"], [1, "w-full", "bg-slate-700", "group-hover:bg-blue-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-full", "transition-colors", "duration-300"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-xl", "p-8", "flex", "flex-col", "items-center", "hover:bg-slate-800", "hover:border-purple-500/50", "transition-all", "duration-300", "transform", "hover:-translate-y-1", "cursor-pointer", "group", 3, "click"], [1, "w-16", "h-16", "rounded-full", "bg-purple-500/10", "flex", "items-center", "justify-center", "border-2", "border-purple-500/20", "text-purple-400", "mb-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9.75 3.104v5.714a2.25 2.25 0 01-.512 1.424L6.25 13.5h11.5l-3.002-3.258a2.25 2.25 0 01-.512-1.424V3.104a2.25 2.25 0 00-4.5 0v.001zM9.75 3.104c0-.563.458-1.02 1.02-1.02h2.46c.563 0 1.02.457 1.02 1.02v.001M12 21a6.75 6.75 0 01-6.75-6.75v-1.5a6.75 6.75 0 0113.5 0v1.5a6.75 6.75 0 01-6.75 6.75z"], [1, "w-full", "bg-slate-700", "group-hover:bg-purple-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-full", "transition-colors", "duration-300"]], template: function RoleSelectComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 0);
            i0.ɵɵdomListener("click", function RoleSelectComponent_Template_div_click_0_listener() { return ctx.closeModal(); });
            i0.ɵɵdomElementStart(1, "div", 1);
            i0.ɵɵdomListener("click", function RoleSelectComponent_Template_div_click_1_listener($event) { return $event.stopPropagation(); });
            i0.ɵɵdomElementStart(2, "button", 2);
            i0.ɵɵdomListener("click", function RoleSelectComponent_Template_button_click_2_listener() { return ctx.closeModal(); });
            i0.ɵɵdomElementStart(3, "span", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵnamespaceSVG();
            i0.ɵɵdomElementStart(6, "svg", 4);
            i0.ɵɵdomElement(7, "path", 5);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵdomElementStart(8, "h2", 6);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(11, "p", 7);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(14, "div", 8)(15, "div", 9);
            i0.ɵɵdomListener("click", function RoleSelectComponent_Template_div_click_15_listener() { return ctx.selectRole("investor"); });
            i0.ɵɵdomElementStart(16, "div", 10);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵdomElementStart(17, "svg", 11);
            i0.ɵɵdomElement(18, "path", 12);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵdomElementStart(19, "h3", 13);
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(22, "p", 14);
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(25, "button", 15);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(28, "div", 16);
            i0.ɵɵdomListener("click", function RoleSelectComponent_Template_div_click_28_listener() { return ctx.selectRole("founder"); });
            i0.ɵɵdomElementStart(29, "div", 17);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵdomElementStart(30, "svg", 11);
            i0.ɵɵdomElement(31, "path", 18);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵdomElementStart(32, "h3", 13);
            i0.ɵɵtext(33);
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(35, "p", 14);
            i0.ɵɵtext(36);
            i0.ɵɵpipe(37, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(38, "button", 19);
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵdomElementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 9, "roleSelect.close"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 11, "roleSelect.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 13, "roleSelect.subtitle"));
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 15, "roleSelect.investor.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 17, "roleSelect.investor.description"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 19, "roleSelect.investor.button"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 21, "roleSelect.founder.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 23, "roleSelect.founder.description"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(40, 25, "roleSelect.founder.button"), " ");
        } }, dependencies: [CommonModule, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.role-select[_ngcontent-%COMP%] { @include card($spacing-4); padding: $spacing-4; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RoleSelectComponent, [{
        type: Component,
        args: [{ selector: 'app-role-select', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, TranslatePipe], template: "<div class=\"fixed inset-0 bg-black/70 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-fade-in\" style=\"animation-duration: 0.3s;\" (click)=\"closeModal()\">\r\n  <div class=\"relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl m-4 p-8 md:p-12 text-center animate-fade-in\" style=\"animation-delay: 0.1s; animation-duration: 0.4s;\" (click)=\"$event.stopPropagation()\">\r\n    \r\n    <button (click)=\"closeModal()\" class=\"absolute top-4 end-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700\">\r\n      <span class=\"sr-only\">{{ 'roleSelect.close' | translate }}</span>\r\n      <svg class=\"w-6 h-6\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 18L18 6M6 6l12 12\" /></svg>\r\n    </button>\r\n    \r\n    <h2 class=\"text-3xl md:text-4xl font-bold text-white mb-4\">{{ 'roleSelect.title' | translate }}</h2>\r\n    <p class=\"text-gray-400 mb-10 max-w-2xl mx-auto\">{{ 'roleSelect.subtitle' | translate }}</p>\r\n\r\n    <div class=\"grid grid-cols-1 md:grid-cols-2 gap-8\">\r\n      <!-- Investor Card -->\r\n      <div class=\"bg-slate-800/50 border border-slate-700 rounded-xl p-8 flex flex-col items-center hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group\" (click)=\"selectRole('investor')\">\r\n        <div class=\"w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/20 text-blue-400 mb-6\">\r\n          <svg class=\"w-8 h-8\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-3.75M21 12l-3.75-3.75\" /></svg>\r\n        </div>\r\n        <h3 class=\"text-2xl font-bold text-white mb-3\">{{ 'roleSelect.investor.title' | translate }}</h3>\r\n        <p class=\"text-gray-400 mb-6 flex-grow\">{{ 'roleSelect.investor.description' | translate }}</p>\r\n        <button class=\"w-full bg-slate-700 group-hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300\">\r\n          {{ 'roleSelect.investor.button' | translate }}\r\n        </button>\r\n      </div>\r\n\r\n      <!-- Founder Card -->\r\n      <div class=\"bg-slate-800/50 border border-slate-700 rounded-xl p-8 flex flex-col items-center hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group\" (click)=\"selectRole('founder')\">\r\n        <div class=\"w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/20 text-purple-400 mb-6\">\r\n           <svg class=\"w-8 h-8\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.75 3.104v5.714a2.25 2.25 0 01-.512 1.424L6.25 13.5h11.5l-3.002-3.258a2.25 2.25 0 01-.512-1.424V3.104a2.25 2.25 0 00-4.5 0v.001zM9.75 3.104c0-.563.458-1.02 1.02-1.02h2.46c.563 0 1.02.457 1.02 1.02v.001M12 21a6.75 6.75 0 01-6.75-6.75v-1.5a6.75 6.75 0 0113.5 0v1.5a6.75 6.75 0 01-6.75 6.75z\" /></svg>\r\n        </div>\r\n        <h3 class=\"text-2xl font-bold text-white mb-3\">{{ 'roleSelect.founder.title' | translate }}</h3>\r\n        <p class=\"text-gray-400 mb-6 flex-grow\">{{ 'roleSelect.founder.description' | translate }}</p>\r\n        <button class=\"w-full bg-slate-700 group-hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300\">\r\n          {{ 'roleSelect.founder.button' | translate }}\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.role-select { @include card($spacing-4); padding: $spacing-4; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RoleSelectComponent, { className: "RoleSelectComponent", filePath: "src/app/components/role-select/role-select.component.ts", lineNumber: 14 }); })();
