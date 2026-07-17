import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import * as i0 from "@angular/core";
const _c0 = (a0, a1, a2, a3) => ({ "border-green-500": a0, "border-blue-500": a1, "border-yellow-500": a2, "border-red-500": a3 });
const _c1 = (a0, a1, a2, a3) => ({ "bg-green-500": a0, "bg-blue-500": a1, "bg-yellow-500": a2, "bg-red-500": a3 });
const _forTrack0 = ($index, $item) => $item.id;
function NotificationHostComponent_For_2_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 6);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 16);
    i0.ɵɵdomElement(2, "path", 17);
    i0.ɵɵdomElementEnd()();
} }
function NotificationHostComponent_For_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 6);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 18);
    i0.ɵɵdomElement(2, "path", 19);
    i0.ɵɵdomElementEnd()();
} }
function NotificationHostComponent_For_2_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 6);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 20);
    i0.ɵɵdomElement(2, "path", 21);
    i0.ɵɵdomElementEnd()();
} }
function NotificationHostComponent_For_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 6);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 22);
    i0.ɵɵdomElement(2, "path", 23);
    i0.ɵɵdomElementEnd()();
} }
function NotificationHostComponent_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 2)(1, "div", 3)(2, "div", 4)(3, "div", 5);
    i0.ɵɵconditionalCreate(4, NotificationHostComponent_For_2_Conditional_4_Template, 3, 0, "div", 6)(5, NotificationHostComponent_For_2_Conditional_5_Template, 3, 0, "div", 6)(6, NotificationHostComponent_For_2_Conditional_6_Template, 3, 0, "div", 6)(7, NotificationHostComponent_For_2_Conditional_7_Template, 3, 0, "div", 6);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(8, "div", 7)(9, "p", 8);
    i0.ɵɵtext(10);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(11, "p", 9);
    i0.ɵɵtext(12);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(13, "div", 10)(14, "button", 11);
    i0.ɵɵdomListener("click", function NotificationHostComponent_For_2_Template_button_click_14_listener() { const toast_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.removeToast(toast_r2.id)); });
    i0.ɵɵdomElementStart(15, "span", 12);
    i0.ɵɵtext(16, "Close");
    i0.ɵɵdomElementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(17, "svg", 13);
    i0.ɵɵdomElement(18, "path", 14);
    i0.ɵɵdomElementEnd()()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵdomElement(19, "div", 15);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const toast_r2 = ctx.$implicit;
    i0.ɵɵclassMap(i0.ɵɵpureFunction4(7, _c0, toast_r2.type === "success", toast_r2.type === "info", toast_r2.type === "warning", toast_r2.type === "error"));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(toast_r2.type === "success" ? 4 : toast_r2.type === "info" ? 5 : toast_r2.type === "warning" ? 6 : toast_r2.type === "error" ? 7 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(toast_r2.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(toast_r2.message);
    i0.ɵɵadvance(7);
    i0.ɵɵclassMap(i0.ɵɵpureFunction4(12, _c1, toast_r2.type === "success", toast_r2.type === "info", toast_r2.type === "warning", toast_r2.type === "error"));
} }
export class NotificationHostComponent {
    constructor() {
        this.notificationService = inject(NotificationService);
        this.toasts = this.notificationService.toasts;
    }
    removeToast(id) {
        this.notificationService.removeToast(id);
    }
    static { this.ɵfac = function NotificationHostComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationHostComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationHostComponent, selectors: [["app-notification-host"]], decls: 3, vars: 0, consts: [[1, "fixed", "top-6", "end-6", "z-[100]", "space-y-4", "w-full", "max-w-sm"], ["role", "alert", 1, "relative", "w-full", "bg-slate-900", "rounded-lg", "shadow-2xl", "pointer-events-auto", "overflow-hidden", "animate-slide-in-right", "border-s-4", 3, "class"], ["role", "alert", 1, "relative", "w-full", "bg-slate-900", "rounded-lg", "shadow-2xl", "pointer-events-auto", "overflow-hidden", "animate-slide-in-right", "border-s-4"], [1, "p-4"], [1, "flex", "items-start"], [1, "flex-shrink-0"], [1, "w-10", "h-10", "rounded-full", "bg-slate-800", "flex", "items-center", "justify-center"], [1, "ms-4", "w-0", "flex-1"], [1, "text-base", "font-semibold", "text-white"], [1, "mt-1", "text-sm", "text-gray-300"], [1, "ms-4", "flex-shrink-0", "flex"], ["type", "button", 1, "inline-flex", "rounded-full", "p-1.5", "text-gray-400", "hover:text-white", "hover:bg-slate-700", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-slate-900", "focus:ring-white", 3, "click"], [1, "sr-only"], ["viewBox", "0 0 20 20", "fill", "currentColor", 1, "h-5", "w-5"], ["d", "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"], [1, "absolute", "bottom-0", "start-0", "h-1", "animate-progress-bar"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "h-6", "w-6", "text-green-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "h-6", "w-6", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "h-6", "w-6", "text-yellow-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "h-6", "w-6", "text-red-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"]], template: function NotificationHostComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 0);
            i0.ɵɵrepeaterCreate(1, NotificationHostComponent_For_2_Template, 20, 17, "div", 1, _forTrack0);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.toasts());
        } }, dependencies: [CommonModule], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.notification-host[_ngcontent-%COMP%] { position: fixed; bottom: $spacing-6; right: $spacing-6; display:flex; flex-direction:column; gap:$spacing-3; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationHostComponent, [{
        type: Component,
        args: [{ selector: 'app-notification-host', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule], template: "<div class=\"fixed top-6 end-6 z-[100] space-y-4 w-full max-w-sm\">\r\n  @for(toast of toasts(); track toast.id) {\r\n    <div \r\n      class=\"relative w-full bg-slate-900 rounded-lg shadow-2xl pointer-events-auto overflow-hidden animate-slide-in-right border-s-4\"\r\n      [class]=\"{\r\n        'border-green-500': toast.type === 'success',\r\n        'border-blue-500': toast.type === 'info',\r\n        'border-yellow-500': toast.type === 'warning',\r\n        'border-red-500': toast.type === 'error'\r\n      }\"\r\n      role=\"alert\">\r\n\r\n      <div class=\"p-4\">\r\n        <div class=\"flex items-start\">\r\n          <!-- Icon -->\r\n          <div class=\"flex-shrink-0\">\r\n            @if(toast.type === 'success') {\r\n              <div class=\"w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center\">\r\n                <svg class=\"h-6 w-6 text-green-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /></svg>\r\n              </div>\r\n            } @else if(toast.type === 'info') {\r\n              <div class=\"w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center\">\r\n                <svg class=\"h-6 w-6 text-blue-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /></svg>\r\n              </div>\r\n            } @else if(toast.type === 'warning') {\r\n              <div class=\"w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center\">\r\n                <svg class=\"h-6 w-6 text-yellow-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z\" /></svg>\r\n              </div>\r\n            } @else if(toast.type === 'error') {\r\n              <div class=\"w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center\">\r\n                <svg class=\"h-6 w-6 text-red-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z\" /></svg>\r\n              </div>\r\n            }\r\n          </div>\r\n          <!-- Text -->\r\n          <div class=\"ms-4 w-0 flex-1\">\r\n            <p class=\"text-base font-semibold text-white\">{{ toast.title }}</p>\r\n            <p class=\"mt-1 text-sm text-gray-300\">{{ toast.message }}</p>\r\n          </div>\r\n          <!-- Close Button -->\r\n          <div class=\"ms-4 flex-shrink-0 flex\">\r\n            <button (click)=\"removeToast(toast.id)\" type=\"button\" class=\"inline-flex rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white\">\r\n              <span class=\"sr-only\">Close</span>\r\n              <svg class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"currentColor\"><path d=\"M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z\" /></svg>\r\n            </button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      \r\n      <!-- Progress Bar -->\r\n      <div \r\n        class=\"absolute bottom-0 start-0 h-1 animate-progress-bar\"\r\n        [class]=\"{\r\n          'bg-green-500': toast.type === 'success',\r\n          'bg-blue-500': toast.type === 'info',\r\n          'bg-yellow-500': toast.type === 'warning',\r\n          'bg-red-500': toast.type === 'error'\r\n        }\">\r\n      </div>\r\n    </div>\r\n  }\r\n</div>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.notification-host { position: fixed; bottom: $spacing-6; right: $spacing-6; display:flex; flex-direction:column; gap:$spacing-3; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationHostComponent, { className: "NotificationHostComponent", filePath: "src/app/components/notification-host/notification-host.component.ts", lineNumber: 12 }); })();
