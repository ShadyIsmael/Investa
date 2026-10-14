import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientNotificationsService } from '../../../services/client-notifications.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = a0 => ({ count: a0 });
const _c1 = () => [1, 2, 3, 4];
function NotificationCenterComponent_div_21_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16);
    i0.ɵɵelement(1, "div", 17);
    i0.ɵɵelementStart(2, "div", 18);
    i0.ɵɵelement(3, "div", 19)(4, "div", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(5, "div", 21);
    i0.ɵɵelementEnd();
} }
function NotificationCenterComponent_div_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵtemplate(1, NotificationCenterComponent_div_21_div_1_Template, 6, 0, "div", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", i0.ɵɵpureFunction0(1, _c1));
} }
function NotificationCenterComponent_div_22_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 22)(1, "div", 23)(2, "p", 24);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 25);
    i0.ɵɵlistener("click", function NotificationCenterComponent_div_22_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadNotifications()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "common.retry"), " ");
} }
function NotificationCenterComponent_ng_container_23_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 28);
    i0.ɵɵelement(2, "path", 29);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 30);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "notifications.noNotifications.title"));
} }
function NotificationCenterComponent_ng_container_23_div_2_li_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 33)(1, "div", 34)(2, "div", 35)(3, "div", 8)(4, "h2", 36);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 37);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "p", 38);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p", 39);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 9);
    i0.ɵɵlistener("click", function NotificationCenterComponent_ng_container_23_div_2_li_2_Template_button_click_12_listener() { const notification_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.markAsRead(notification_r4)); });
    i0.ɵɵtext(13, " Mark Read ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const notification_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("bg-blue-950/10", !notification_r4.isRead);
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("opacity-70", notification_r4.isRead);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", notification_r4.title, " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-blue-500/15", !notification_r4.isRead)("text-blue-300", !notification_r4.isRead)("border-blue-500/25", !notification_r4.isRead)("bg-slate-800", notification_r4.isRead)("text-gray-400", notification_r4.isRead)("border-slate-700", notification_r4.isRead);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", notification_r4.isRead ? "Read" : "Unread", " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("opacity-70", notification_r4.isRead);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", notification_r4.message, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(notification_r4.createdAt));
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", notification_r4.isRead || ctx_r1.markingReadId() === notification_r4.id);
} }
function NotificationCenterComponent_ng_container_23_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14)(1, "ul", 31);
    i0.ɵɵtemplate(2, NotificationCenterComponent_ng_container_23_div_2_li_2_Template, 14, 23, "li", 32);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r1.notifications());
} }
function NotificationCenterComponent_ng_container_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, NotificationCenterComponent_ng_container_23_div_1_Template, 6, 3, "div", 26)(2, NotificationCenterComponent_ng_container_23_div_2_Template, 3, 1, "div", 11);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.notifications().length === 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.notifications().length > 0);
} }
export class NotificationCenterComponent {
    constructor() {
        this.notificationsService = inject(ClientNotificationsService);
        this.router = inject(Router);
        this.notifications = signal([], ...(ngDevMode ? [{ debugName: "notifications" }] : []));
        this.unreadCount = signal(0, ...(ngDevMode ? [{ debugName: "unreadCount" }] : []));
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.markingReadId = signal(null, ...(ngDevMode ? [{ debugName: "markingReadId" }] : []));
        this.isMarkingAllRead = signal(false, ...(ngDevMode ? [{ debugName: "isMarkingAllRead" }] : []));
        this.hasUnread = computed(() => this.unreadCount() > 0, ...(ngDevMode ? [{ debugName: "hasUnread" }] : []));
        this.loadNotifications();
    }
    async loadNotifications() {
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            const [notifications, unreadCount] = await Promise.all([
                this.notificationsService.getNotifications(),
                this.notificationsService.getUnreadCount()
            ]);
            this.notifications.set(notifications);
            this.unreadCount.set(unreadCount);
        }
        catch (error) {
            this.errorMessage.set(error?.message || 'Failed to load notifications.');
            this.notifications.set([]);
            this.unreadCount.set(0);
        }
        finally {
            this.isLoading.set(false);
        }
    }
    async markAsRead(notification) {
        if (notification.isRead || this.markingReadId())
            return;
        try {
            this.markingReadId.set(notification.id);
            this.errorMessage.set(null);
            await this.notificationsService.markAsRead(notification.id);
            this.notifications.update(items => items.map(item => item.id === notification.id ? { ...item, isRead: true } : item));
            this.unreadCount.update(count => Math.max(0, count - 1));
        }
        catch (error) {
            this.errorMessage.set(error?.message || 'Failed to mark notification as read.');
        }
        finally {
            this.markingReadId.set(null);
        }
    }
    async markAllAsRead() {
        if (!this.hasUnread() || this.isMarkingAllRead())
            return;
        try {
            this.isMarkingAllRead.set(true);
            this.errorMessage.set(null);
            await this.notificationsService.markAllAsRead();
            this.notifications.update(items => items.map(item => ({ ...item, isRead: true })));
            this.unreadCount.set(0);
        }
        catch (error) {
            this.errorMessage.set(error?.message || 'Failed to mark notifications as read.');
        }
        finally {
            this.isMarkingAllRead.set(false);
        }
    }
    formatDate(value) {
        if (!value)
            return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            return value;
        return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }
    goBack() {
        this.router.navigate(['/admin/profile']);
    }
    static { this.ɵfac = function NotificationCenterComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationCenterComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationCenterComponent, selectors: [["app-notification-center"]], decls: 24, vars: 23, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8", "max-w-5xl"], [1, "mb-8", "flex", "flex-col", "gap-4", "md:flex-row", "md:items-center", "md:justify-between"], [1, "flex", "items-center", "gap-3"], ["type", "button", 1, "p-2", "hover:bg-slate-700", "rounded-lg", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-gray-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400", "mt-1"], [1, "flex", "flex-wrap", "items-center", "gap-3"], ["type", "button", 1, "inline-flex", "items-center", "justify-center", "rounded-lg", "bg-slate-800", "px-4", "py-2", "text-sm", "font-semibold", "text-gray-200", "hover:bg-slate-700", "disabled:opacity-50", 3, "click", "disabled"], ["type", "button", 1, "inline-flex", "items-center", "justify-center", "rounded-lg", "bg-blue-600", "px-4", "py-2", "text-sm", "font-semibold", "text-white", "hover:bg-blue-500", "disabled:opacity-50", 3, "click", "disabled"], ["class", "investa-panel p-0 overflow-hidden", 4, "ngIf"], ["class", "bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6", 4, "ngIf"], [4, "ngIf"], [1, "investa-panel", "p-0", "overflow-hidden"], ["class", "p-5 flex items-start gap-4 animate-pulse", 4, "ngFor", "ngForOf"], [1, "p-5", "flex", "items-start", "gap-4", "animate-pulse"], [1, "w-10", "h-10", "rounded-full", "bg-slate-700", "flex-shrink-0"], [1, "flex-1", "space-y-3"], [1, "h-4", "bg-slate-700", "rounded", "w-1/3"], [1, "h-3", "bg-slate-700/70", "rounded", "w-2/3"], [1, "h-6", "bg-slate-700/50", "rounded-full", "w-20"], [1, "bg-red-500/20", "border", "border-red-500/50", "rounded-lg", "p-4", "mb-6"], [1, "flex", "flex-col", "gap-3", "md:flex-row", "md:items-center", "md:justify-between"], [1, "text-red-200"], ["type", "button", 1, "rounded-md", "bg-red-500/20", "px-3", "py-2", "text-sm", "font-semibold", "text-red-100", "hover:bg-red-500/30", 3, "click"], ["class", "investa-panel p-12 text-center", 4, "ngIf"], [1, "investa-panel", "p-12", "text-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "mx-auto", "mb-4", "text-gray-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0"], [1, "text-gray-400"], [1, "divide-y", "divide-slate-800"], ["class", "p-5 transition-colors", 3, "bg-blue-950/10", 4, "ngFor", "ngForOf"], [1, "p-5", "transition-colors"], [1, "flex", "flex-col", "gap-4", "md:flex-row", "md:items-start", "md:justify-between"], [1, "min-w-0", "flex-1"], [1, "text-base", "font-semibold", "text-white"], [1, "inline-flex", "rounded-full", "border", "px-2.5", "py-1", "text-xs", "font-semibold"], [1, "text-sm", "text-gray-400", "mt-2"], [1, "text-xs", "text-gray-500", "mt-3"]], template: function NotificationCenterComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "button", 3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵlistener("click", function NotificationCenterComponent_Template_button_click_3_listener() { return ctx.goBack(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(5, "svg", 4);
            i0.ɵɵelement(6, "path", 5);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(7, "div")(8, "h1", 6);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "p", 7);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(14, "div", 8)(15, "button", 9);
            i0.ɵɵlistener("click", function NotificationCenterComponent_Template_button_click_15_listener() { return ctx.loadNotifications(); });
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "button", 10);
            i0.ɵɵlistener("click", function NotificationCenterComponent_Template_button_click_18_listener() { return ctx.markAllAsRead(); });
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(21, NotificationCenterComponent_div_21_Template, 2, 2, "div", 11)(22, NotificationCenterComponent_div_22_Template, 7, 4, "div", 12)(23, NotificationCenterComponent_ng_container_23_Template, 3, 2, "ng-container", 13);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 10, "common.backToProfile"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 12, "notifications.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(13, 14, "notifications.unreadCount", i0.ɵɵpureFunction1(21, _c0, ctx.unreadCount())), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 17, "common.refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.hasUnread() || ctx.isMarkingAllRead());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 19, "notifications.markAllRead"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.errorMessage() && !ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", !ctx.isLoading() && !ctx.errorMessage());
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, TranslatePipe], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationCenterComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-notification-center', imports: [CommonModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"container mx-auto p-6 lg:p-8 max-w-5xl\">\r\n  <div class=\"mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between\">\r\n    <div class=\"flex items-center gap-3\">\r\n      <button type=\"button\" (click)=\"goBack()\" class=\"p-2 hover:bg-slate-700 rounded-lg transition-colors\" [attr.aria-label]=\"'common.backToProfile' | translate\">\n        <svg class=\"w-6 h-6 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"/>\r\n        </svg>\r\n      </button>\r\n      <div>\r\n        <h1 class=\"text-3xl font-bold text-white\">{{ 'notifications.title' | translate }}</h1>\n        <p class=\"text-sm text-gray-400 mt-1\">\r\n          {{ 'notifications.unreadCount' | translate:{ count: unreadCount() } }}\n        </p>\r\n      </div>\r\n    </div>\r\n\r\n    <div class=\"flex flex-wrap items-center gap-3\">\r\n      <button type=\"button\" (click)=\"loadNotifications()\" [disabled]=\"isLoading()\" class=\"inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700 disabled:opacity-50\">\r\n        {{ 'common.refresh' | translate }}\n      </button>\r\n      <button type=\"button\" (click)=\"markAllAsRead()\" [disabled]=\"!hasUnread() || isMarkingAllRead()\" class=\"inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50\">\r\n        {{ 'notifications.markAllRead' | translate }}\n      </button>\r\n    </div>\r\n  </div>\r\n\r\n  <div *ngIf=\"isLoading()\" class=\"investa-panel p-0 overflow-hidden\">\r\n    <div *ngFor=\"let item of [1,2,3,4]\" class=\"p-5 flex items-start gap-4 animate-pulse\">\r\n      <div class=\"w-10 h-10 rounded-full bg-slate-700 flex-shrink-0\"></div>\r\n      <div class=\"flex-1 space-y-3\">\r\n        <div class=\"h-4 bg-slate-700 rounded w-1/3\"></div>\r\n        <div class=\"h-3 bg-slate-700/70 rounded w-2/3\"></div>\r\n      </div>\r\n      <div class=\"h-6 bg-slate-700/50 rounded-full w-20\"></div>\r\n    </div>\r\n  </div>\r\n\r\n  <div *ngIf=\"errorMessage() && !isLoading()\" class=\"bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6\">\r\n    <div class=\"flex flex-col gap-3 md:flex-row md:items-center md:justify-between\">\r\n      <p class=\"text-red-200\">{{ errorMessage() }}</p>\r\n      <button type=\"button\" (click)=\"loadNotifications()\" class=\"rounded-md bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/30\">\r\n        {{ 'common.retry' | translate }}\n      </button>\r\n    </div>\r\n  </div>\r\n\r\n  <ng-container *ngIf=\"!isLoading() && !errorMessage()\">\r\n    <div *ngIf=\"notifications().length === 0\" class=\"investa-panel p-12 text-center\">\r\n      <svg class=\"w-16 h-16 mx-auto mb-4 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0\"/>\r\n      </svg>\r\n      <p class=\"text-gray-400\">{{ 'notifications.noNotifications.title' | translate }}</p>\n    </div>\r\n\r\n    <div *ngIf=\"notifications().length > 0\" class=\"investa-panel p-0 overflow-hidden\">\r\n      <ul class=\"divide-y divide-slate-800\">\r\n        <li *ngFor=\"let notification of notifications()\" class=\"p-5 transition-colors\" [class.bg-blue-950/10]=\"!notification.isRead\">\r\n          <div class=\"flex flex-col gap-4 md:flex-row md:items-start md:justify-between\">\r\n            <div class=\"min-w-0 flex-1\">\r\n              <div class=\"flex flex-wrap items-center gap-3\">\r\n                <h2 class=\"text-base font-semibold text-white\" [class.opacity-70]=\"notification.isRead\">\r\n                  {{ notification.title }}\r\n                </h2>\r\n                <span class=\"inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold\"\r\n                      [class.bg-blue-500/15]=\"!notification.isRead\"\r\n                      [class.text-blue-300]=\"!notification.isRead\"\r\n                      [class.border-blue-500/25]=\"!notification.isRead\"\r\n                      [class.bg-slate-800]=\"notification.isRead\"\r\n                      [class.text-gray-400]=\"notification.isRead\"\r\n                      [class.border-slate-700]=\"notification.isRead\">\r\n                  {{ notification.isRead ? 'Read' : 'Unread' }}\r\n                </span>\r\n              </div>\r\n              <p class=\"text-sm text-gray-400 mt-2\" [class.opacity-70]=\"notification.isRead\">\r\n                {{ notification.message }}\r\n              </p>\r\n              <p class=\"text-xs text-gray-500 mt-3\">{{ formatDate(notification.createdAt) }}</p>\r\n            </div>\r\n\r\n            <button type=\"button\"\r\n                    (click)=\"markAsRead(notification)\"\r\n                    [disabled]=\"notification.isRead || markingReadId() === notification.id\"\r\n                    class=\"inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700 disabled:opacity-50\">\r\n              Mark Read\r\n            </button>\r\n          </div>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n  </ng-container>\r\n</div>\r\n", styles: [":host {\r\n  display: block;\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationCenterComponent, { className: "NotificationCenterComponent", filePath: "src/app/pages/admin/notification-center/notification-center.component.ts", lineNumber: 15 }); })();
