import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientNotificationsService } from '../../../services/client-notifications.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = () => [1, 2, 3, 4];
function NotificationCenterComponent_div_16_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16);
    i0.ɵɵelement(1, "div", 17);
    i0.ɵɵelementStart(2, "div", 18);
    i0.ɵɵelement(3, "div", 19)(4, "div", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(5, "div", 21);
    i0.ɵɵelementEnd();
} }
function NotificationCenterComponent_div_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵtemplate(1, NotificationCenterComponent_div_16_div_1_Template, 6, 0, "div", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", i0.ɵɵpureFunction0(1, _c0));
} }
function NotificationCenterComponent_div_17_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 22)(1, "div", 23)(2, "p", 24);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 25);
    i0.ɵɵlistener("click", function NotificationCenterComponent_div_17_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadNotifications()); });
    i0.ɵɵtext(5, " Retry ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
} }
function NotificationCenterComponent_ng_container_18_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 28);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 29);
    i0.ɵɵelement(2, "path", 30);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 31);
    i0.ɵɵtext(4, "No notifications found.");
    i0.ɵɵelementEnd()();
} }
function NotificationCenterComponent_ng_container_18_div_2_li_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 35)(1, "div", 36)(2, "div", 37)(3, "div", 8)(4, "h2", 38);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 39);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "p", 40);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p", 41);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 9);
    i0.ɵɵlistener("click", function NotificationCenterComponent_ng_container_18_div_2_li_2_Template_button_click_12_listener() { const notification_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.markAsRead(notification_r4)); });
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
function NotificationCenterComponent_ng_container_18_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 32)(1, "ul", 33);
    i0.ɵɵtemplate(2, NotificationCenterComponent_ng_container_18_div_2_li_2_Template, 14, 23, "li", 34);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r1.notifications());
} }
function NotificationCenterComponent_ng_container_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, NotificationCenterComponent_ng_container_18_div_1_Template, 5, 0, "div", 26)(2, NotificationCenterComponent_ng_container_18_div_2_Template, 3, 1, "div", 27);
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
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationCenterComponent, selectors: [["app-notification-center"]], decls: 19, vars: 7, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8", "max-w-5xl"], [1, "mb-8", "flex", "flex-col", "gap-4", "md:flex-row", "md:items-center", "md:justify-between"], [1, "flex", "items-center", "gap-3"], ["type", "button", "aria-label", "Back to profile", 1, "p-2", "hover:bg-slate-700", "rounded-lg", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-gray-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400", "mt-1"], [1, "flex", "flex-wrap", "items-center", "gap-3"], ["type", "button", 1, "inline-flex", "items-center", "justify-center", "rounded-lg", "bg-slate-800", "px-4", "py-2", "text-sm", "font-semibold", "text-gray-200", "hover:bg-slate-700", "disabled:opacity-50", 3, "click", "disabled"], ["type", "button", 1, "inline-flex", "items-center", "justify-center", "rounded-lg", "bg-blue-600", "px-4", "py-2", "text-sm", "font-semibold", "text-white", "hover:bg-blue-500", "disabled:opacity-50", 3, "click", "disabled"], ["class", "bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800", 4, "ngIf"], ["class", "bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6", 4, "ngIf"], [4, "ngIf"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-xl", "overflow-hidden", "divide-y", "divide-slate-800"], ["class", "p-5 flex items-start gap-4 animate-pulse", 4, "ngFor", "ngForOf"], [1, "p-5", "flex", "items-start", "gap-4", "animate-pulse"], [1, "w-10", "h-10", "rounded-full", "bg-slate-700", "flex-shrink-0"], [1, "flex-1", "space-y-3"], [1, "h-4", "bg-slate-700", "rounded", "w-1/3"], [1, "h-3", "bg-slate-700/70", "rounded", "w-2/3"], [1, "h-6", "bg-slate-700/50", "rounded-full", "w-20"], [1, "bg-red-500/20", "border", "border-red-500/50", "rounded-lg", "p-4", "mb-6"], [1, "flex", "flex-col", "gap-3", "md:flex-row", "md:items-center", "md:justify-between"], [1, "text-red-200"], ["type", "button", 1, "rounded-md", "bg-red-500/20", "px-3", "py-2", "text-sm", "font-semibold", "text-red-100", "hover:bg-red-500/30", 3, "click"], ["class", "bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center", 4, "ngIf"], ["class", "bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl overflow-hidden", 4, "ngIf"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-xl", "p-12", "text-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "mx-auto", "mb-4", "text-gray-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0"], [1, "text-gray-400"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "overflow-hidden"], [1, "divide-y", "divide-slate-800"], ["class", "p-5 transition-colors", 3, "bg-blue-950/10", 4, "ngFor", "ngForOf"], [1, "p-5", "transition-colors"], [1, "flex", "flex-col", "gap-4", "md:flex-row", "md:items-start", "md:justify-between"], [1, "min-w-0", "flex-1"], [1, "text-base", "font-semibold", "text-white"], [1, "inline-flex", "rounded-full", "border", "px-2.5", "py-1", "text-xs", "font-semibold"], [1, "text-sm", "text-gray-400", "mt-2"], [1, "text-xs", "text-gray-500", "mt-3"]], template: function NotificationCenterComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "button", 3);
            i0.ɵɵlistener("click", function NotificationCenterComponent_Template_button_click_3_listener() { return ctx.goBack(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(4, "svg", 4);
            i0.ɵɵelement(5, "path", 5);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(6, "div")(7, "h1", 6);
            i0.ɵɵtext(8, "Notification Center");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p", 7);
            i0.ɵɵtext(10);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(11, "div", 8)(12, "button", 9);
            i0.ɵɵlistener("click", function NotificationCenterComponent_Template_button_click_12_listener() { return ctx.loadNotifications(); });
            i0.ɵɵtext(13, " Refresh ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "button", 10);
            i0.ɵɵlistener("click", function NotificationCenterComponent_Template_button_click_14_listener() { return ctx.markAllAsRead(); });
            i0.ɵɵtext(15, " Mark All Read ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(16, NotificationCenterComponent_div_16_Template, 2, 2, "div", 11)(17, NotificationCenterComponent_div_17_Template, 6, 1, "div", 12)(18, NotificationCenterComponent_ng_container_18_Template, 3, 2, "ng-container", 13);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(10);
            i0.ɵɵtextInterpolate2(" ", ctx.unreadCount(), " unread notification", ctx.unreadCount() === 1 ? "" : "s", " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.isLoading());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.hasUnread() || ctx.isMarkingAllRead());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.errorMessage() && !ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", !ctx.isLoading() && !ctx.errorMessage());
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf], styles: ["[_nghost-%COMP%] {\n  display: block;\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationCenterComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-notification-center', imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"container mx-auto p-6 lg:p-8 max-w-5xl\">\n  <div class=\"mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between\">\n    <div class=\"flex items-center gap-3\">\n      <button type=\"button\" (click)=\"goBack()\" class=\"p-2 hover:bg-slate-700 rounded-lg transition-colors\" aria-label=\"Back to profile\">\n        <svg class=\"w-6 h-6 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"/>\n        </svg>\n      </button>\n      <div>\n        <h1 class=\"text-3xl font-bold text-white\">Notification Center</h1>\n        <p class=\"text-sm text-gray-400 mt-1\">\n          {{ unreadCount() }} unread notification{{ unreadCount() === 1 ? '' : 's' }}\n        </p>\n      </div>\n    </div>\n\n    <div class=\"flex flex-wrap items-center gap-3\">\n      <button type=\"button\" (click)=\"loadNotifications()\" [disabled]=\"isLoading()\" class=\"inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700 disabled:opacity-50\">\n        Refresh\n      </button>\n      <button type=\"button\" (click)=\"markAllAsRead()\" [disabled]=\"!hasUnread() || isMarkingAllRead()\" class=\"inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50\">\n        Mark All Read\n      </button>\n    </div>\n  </div>\n\n  <div *ngIf=\"isLoading()\" class=\"bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800\">\n    <div *ngFor=\"let item of [1,2,3,4]\" class=\"p-5 flex items-start gap-4 animate-pulse\">\n      <div class=\"w-10 h-10 rounded-full bg-slate-700 flex-shrink-0\"></div>\n      <div class=\"flex-1 space-y-3\">\n        <div class=\"h-4 bg-slate-700 rounded w-1/3\"></div>\n        <div class=\"h-3 bg-slate-700/70 rounded w-2/3\"></div>\n      </div>\n      <div class=\"h-6 bg-slate-700/50 rounded-full w-20\"></div>\n    </div>\n  </div>\n\n  <div *ngIf=\"errorMessage() && !isLoading()\" class=\"bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6\">\n    <div class=\"flex flex-col gap-3 md:flex-row md:items-center md:justify-between\">\n      <p class=\"text-red-200\">{{ errorMessage() }}</p>\n      <button type=\"button\" (click)=\"loadNotifications()\" class=\"rounded-md bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/30\">\n        Retry\n      </button>\n    </div>\n  </div>\n\n  <ng-container *ngIf=\"!isLoading() && !errorMessage()\">\n    <div *ngIf=\"notifications().length === 0\" class=\"bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center\">\n      <svg class=\"w-16 h-16 mx-auto mb-4 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0\"/>\n      </svg>\n      <p class=\"text-gray-400\">No notifications found.</p>\n    </div>\n\n    <div *ngIf=\"notifications().length > 0\" class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl overflow-hidden\">\n      <ul class=\"divide-y divide-slate-800\">\n        <li *ngFor=\"let notification of notifications()\" class=\"p-5 transition-colors\" [class.bg-blue-950/10]=\"!notification.isRead\">\n          <div class=\"flex flex-col gap-4 md:flex-row md:items-start md:justify-between\">\n            <div class=\"min-w-0 flex-1\">\n              <div class=\"flex flex-wrap items-center gap-3\">\n                <h2 class=\"text-base font-semibold text-white\" [class.opacity-70]=\"notification.isRead\">\n                  {{ notification.title }}\n                </h2>\n                <span class=\"inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold\"\n                      [class.bg-blue-500/15]=\"!notification.isRead\"\n                      [class.text-blue-300]=\"!notification.isRead\"\n                      [class.border-blue-500/25]=\"!notification.isRead\"\n                      [class.bg-slate-800]=\"notification.isRead\"\n                      [class.text-gray-400]=\"notification.isRead\"\n                      [class.border-slate-700]=\"notification.isRead\">\n                  {{ notification.isRead ? 'Read' : 'Unread' }}\n                </span>\n              </div>\n              <p class=\"text-sm text-gray-400 mt-2\" [class.opacity-70]=\"notification.isRead\">\n                {{ notification.message }}\n              </p>\n              <p class=\"text-xs text-gray-500 mt-3\">{{ formatDate(notification.createdAt) }}</p>\n            </div>\n\n            <button type=\"button\"\n                    (click)=\"markAsRead(notification)\"\n                    [disabled]=\"notification.isRead || markingReadId() === notification.id\"\n                    class=\"inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700 disabled:opacity-50\">\n              Mark Read\n            </button>\n          </div>\n        </li>\n      </ul>\n    </div>\n  </ng-container>\n</div>\n", styles: [":host {\n  display: block;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationCenterComponent, { className: "NotificationCenterComponent", filePath: "src/app/pages/admin/notification-center/notification-center.component.ts", lineNumber: 14 }); })();
