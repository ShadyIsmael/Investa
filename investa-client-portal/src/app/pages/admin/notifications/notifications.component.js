import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = () => [1, 2, 3, 4, 5];
const _forTrack0 = ($index, $item) => $item.id;
function NotificationsComponent_Conditional_6_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " \u00A0\u2022\u00A0");
    i0.ɵɵdomElementStart(1, "span", 11);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "lowercase");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r0.unreadCount(), " ", i0.ɵɵpipeBind1(4, 4, i0.ɵɵpipeBind1(3, 2, "notifications.unread")));
} }
function NotificationsComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 3);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "lowercase");
    i0.ɵɵconditionalCreate(4, NotificationsComponent_Conditional_6_Conditional_4_Template, 5, 6);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", ctx_r0.totalCount(), " ", i0.ɵɵpipeBind1(3, 5, i0.ɵɵpipeBind1(2, 3, "notifications.title")), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.unreadCount() > 0 ? 4 : -1);
} }
function NotificationsComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 12);
    i0.ɵɵdomListener("click", function NotificationsComponent_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.markAllAsRead()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 13);
    i0.ɵɵdomElement(2, "path", 14);
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "notifications.markAllRead"), " ");
} }
function NotificationsComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 8);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.unreadCount());
} }
function NotificationsComponent_Conditional_17_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 15);
    i0.ɵɵdomElement(1, "div", 16);
    i0.ɵɵdomElementStart(2, "div", 17);
    i0.ɵɵdomElement(3, "div", 18)(4, "div", 19);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElement(5, "div", 20);
    i0.ɵɵdomElementEnd();
} }
function NotificationsComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 9);
    i0.ɵɵrepeaterCreate(1, NotificationsComponent_Conditional_17_For_2_Template, 6, 0, "div", 15, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵrepeater(i0.ɵɵpureFunction0(0, _c0));
} }
function NotificationsComponent_Conditional_18_For_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 27);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 41);
    i0.ɵɵdomElement(2, "path", 42);
    i0.ɵɵdomElementEnd()();
} }
function NotificationsComponent_Conditional_18_For_3_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 28);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 43);
    i0.ɵɵdomElement(2, "path", 44);
    i0.ɵɵdomElementEnd()();
} }
function NotificationsComponent_Conditional_18_For_3_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 29);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 45);
    i0.ɵɵdomElement(2, "path", 46);
    i0.ɵɵdomElementEnd()();
} }
function NotificationsComponent_Conditional_18_For_3_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 30);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 47);
    i0.ɵɵdomElement(2, "path", 48);
    i0.ɵɵdomElementEnd()();
} }
function NotificationsComponent_Conditional_18_For_3_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "a", 49);
    i0.ɵɵdomListener("click", function NotificationsComponent_Conditional_18_For_3_Conditional_14_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r5); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(1, " View details \u2192 ");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const notification_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵdomProperty("href", notification_r4.actionUrl, i0.ɵɵsanitizeUrl);
} }
function NotificationsComponent_Conditional_18_For_3_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElement(0, "div", 37);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵdomProperty("title", i0.ɵɵpipeBind1(1, 1, "notifications.unread"));
} }
function NotificationsComponent_Conditional_18_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "li", 25);
    i0.ɵɵdomListener("click", function NotificationsComponent_Conditional_18_For_3_Template_li_click_0_listener() { const notification_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.markAsRead(notification_r4)); });
    i0.ɵɵdomElementStart(1, "div", 26);
    i0.ɵɵconditionalCreate(2, NotificationsComponent_Conditional_18_For_3_Conditional_2_Template, 3, 0, "div", 27)(3, NotificationsComponent_Conditional_18_For_3_Conditional_3_Template, 3, 0, "div", 28)(4, NotificationsComponent_Conditional_18_For_3_Conditional_4_Template, 3, 0, "div", 29)(5, NotificationsComponent_Conditional_18_For_3_Conditional_5_Template, 3, 0, "div", 30);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(6, "div", 31)(7, "div", 32)(8, "h3", 33);
    i0.ɵɵtext(9);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(10, "p", 34);
    i0.ɵɵtext(11);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(12, "p", 3);
    i0.ɵɵtext(13);
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(14, NotificationsComponent_Conditional_18_For_3_Conditional_14_Template, 2, 1, "a", 35);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(15, "div", 36);
    i0.ɵɵconditionalCreate(16, NotificationsComponent_Conditional_18_For_3_Conditional_16_Template, 2, 3, "div", 37);
    i0.ɵɵdomElementStart(17, "button", 38);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵdomListener("click", function NotificationsComponent_Conditional_18_For_3_Template_button_click_17_listener($event) { const notification_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.deleteNotification(notification_r4.id, $event)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(19, "svg", 39);
    i0.ɵɵdomElement(20, "path", 40);
    i0.ɵɵdomElementEnd()()()();
} if (rf & 2) {
    const notification_r4 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("hover:bg-slate-800/50", !notification_r4.read)("cursor-pointer", !notification_r4.read)("bg-blue-950/10", !notification_r4.read);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(notification_r4.type === "info" ? 2 : notification_r4.type === "success" ? 3 : notification_r4.type === "warning" ? 4 : 5);
    i0.ɵɵadvance(6);
    i0.ɵɵclassProp("opacity-60", notification_r4.read);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", notification_r4.title, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.formatDate(notification_r4.timestamp));
    i0.ɵɵadvance();
    i0.ɵɵclassProp("opacity-60", notification_r4.read);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", notification_r4.message, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(notification_r4.actionUrl ? 14 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!notification_r4.read ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("title", i0.ɵɵpipeBind1(18, 17, "notifications.delete"));
} }
function NotificationsComponent_Conditional_18_ForEmpty_4_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "notifications.noNotifications.allCaughtUp"), " ");
} }
function NotificationsComponent_Conditional_18_ForEmpty_4_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "notifications.noNotifications.subtitle"), " ");
} }
function NotificationsComponent_Conditional_18_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "li", 23);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 50);
    i0.ɵɵdomElement(2, "path", 51);
    i0.ɵɵdomElementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵdomElementStart(3, "h3", 52);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(6, "p", 53);
    i0.ɵɵconditionalCreate(7, NotificationsComponent_Conditional_18_ForEmpty_4_Conditional_7_Template, 2, 3)(8, NotificationsComponent_Conditional_18_ForEmpty_4_Conditional_8_Template, 2, 3);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "notifications.noNotifications.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.activeFilter() === "unread" ? 7 : 8);
} }
function NotificationsComponent_Conditional_18_Conditional_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(0, "svg", 55);
    i0.ɵɵdomElement(1, "circle", 56)(2, "path", 57);
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(3, " Loading... ");
} }
function NotificationsComponent_Conditional_18_Conditional_5_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Load more notifications ");
} }
function NotificationsComponent_Conditional_18_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 24)(1, "button", 54);
    i0.ɵɵdomListener("click", function NotificationsComponent_Conditional_18_Conditional_5_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.loadMore()); });
    i0.ɵɵconditionalCreate(2, NotificationsComponent_Conditional_18_Conditional_5_Conditional_2_Template, 4, 0)(3, NotificationsComponent_Conditional_18_Conditional_5_Conditional_3_Template, 1, 0);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("disabled", ctx_r0.isLoadingMore());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.isLoadingMore() ? 2 : 3);
} }
function NotificationsComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 10)(1, "ul", 21);
    i0.ɵɵrepeaterCreate(2, NotificationsComponent_Conditional_18_For_3_Template, 21, 19, "li", 22, _forTrack0, false, NotificationsComponent_Conditional_18_ForEmpty_4_Template, 9, 4, "li", 23);
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(5, NotificationsComponent_Conditional_18_Conditional_5_Template, 4, 2, "div", 24);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.filteredNotifications());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.hasMore() && ctx_r0.activeFilter() === "all" ? 5 : -1);
} }
export class NotificationsComponent {
    constructor() {
        this.notificationService = inject(NotificationService);
        this.PAGE_SIZE = 20;
        this.currentPage = signal(1, ...(ngDevMode ? [{ debugName: "currentPage" }] : []));
        this.activeFilter = signal('all', ...(ngDevMode ? [{ debugName: "activeFilter" }] : []));
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.isLoadingMore = signal(false, ...(ngDevMode ? [{ debugName: "isLoadingMore" }] : []));
        this.totalCount = this.notificationService.totalCount;
        this.unreadCount = this.notificationService.unreadCount;
        this.filteredNotifications = computed(() => {
            const notifications = this.notificationService.notifications();
            if (this.activeFilter() === 'unread') {
                return notifications.filter(n => !n.read);
            }
            return notifications;
        }, ...(ngDevMode ? [{ debugName: "filteredNotifications" }] : []));
        this.hasMore = computed(() => this.notificationService.notifications().length < this.totalCount(), ...(ngDevMode ? [{ debugName: "hasMore" }] : []));
    }
    async ngOnInit() {
        this.isLoading.set(true);
        this.currentPage.set(1);
        await this.notificationService.loadNotifications(this.PAGE_SIZE, 1);
        this.isLoading.set(false);
    }
    setFilter(filter) {
        this.activeFilter.set(filter);
    }
    async markAsRead(notification) {
        if (!notification.read) {
            await this.notificationService.markAsRead(notification.id);
        }
    }
    async markAllAsRead() {
        await this.notificationService.markAllAsRead();
    }
    async deleteNotification(id, event) {
        event.stopPropagation();
        await this.notificationService.deleteNotification(id);
    }
    async loadMore() {
        const nextPage = this.currentPage() + 1;
        this.isLoadingMore.set(true);
        await this.notificationService.loadNotifications(this.PAGE_SIZE, nextPage);
        this.currentPage.set(nextPage);
        this.isLoadingMore.set(false);
    }
    formatDate(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    static { this.ɵfac = function NotificationsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationsComponent, selectors: [["app-notifications"]], decls: 19, vars: 17, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8", "max-w-4xl"], [1, "flex", "flex-col", "sm:flex-row", "justify-between", "items-start", "sm:items-center", "mb-6", "gap-4"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400", "mt-1"], [1, "flex", "items-center", "gap-3"], [1, "inline-flex", "items-center", "gap-2", "px-4", "py-2", "rounded-lg", "bg-blue-600/20", "text-blue-400", "text-sm", "font-semibold", "border", "border-blue-500/30", "hover:bg-blue-600/30", "transition-colors"], [1, "flex", "items-center", "gap-1", "p-1", "bg-slate-800", "rounded-lg"], [1, "px-4", "py-1.5", "rounded-md", "font-semibold", "text-sm", "transition-colors", 3, "click"], [1, "ml-1", "px-1.5", "py-0.5", "rounded-full", "bg-blue-500", "text-white", "text-[10px]", "font-bold", "leading-none"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-xl", "overflow-hidden", "divide-y", "divide-slate-800"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "overflow-hidden"], [1, "text-blue-400", "font-medium"], [1, "inline-flex", "items-center", "gap-2", "px-4", "py-2", "rounded-lg", "bg-blue-600/20", "text-blue-400", "text-sm", "font-semibold", "border", "border-blue-500/30", "hover:bg-blue-600/30", "transition-colors", 3, "click"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "2", "stroke", "currentColor", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M4.5 12.75l6 6 9-13.5"], [1, "p-5", "flex", "items-start", "gap-4", "animate-pulse"], [1, "w-10", "h-10", "rounded-full", "bg-slate-700", "flex-shrink-0"], [1, "flex-1", "space-y-2"], [1, "h-4", "bg-slate-700", "rounded", "w-1/3"], [1, "h-3", "bg-slate-700/70", "rounded", "w-2/3"], [1, "h-3", "bg-slate-700/50", "rounded", "w-20"], [1, "divide-y", "divide-slate-800"], [1, "group", "p-4", "sm:p-5", "flex", "items-start", "gap-4", "transition-colors", "duration-200", 3, "hover:bg-slate-800/50", "cursor-pointer", "bg-blue-950/10"], [1, "py-20", "text-center"], [1, "border-t", "border-slate-800", "p-4", "text-center"], [1, "group", "p-4", "sm:p-5", "flex", "items-start", "gap-4", "transition-colors", "duration-200", 3, "click"], [1, "flex-shrink-0", "mt-0.5"], [1, "w-10", "h-10", "rounded-full", "bg-blue-500/20", "flex", "items-center", "justify-center"], [1, "w-10", "h-10", "rounded-full", "bg-green-500/20", "flex", "items-center", "justify-center"], [1, "w-10", "h-10", "rounded-full", "bg-yellow-500/20", "flex", "items-center", "justify-center"], [1, "w-10", "h-10", "rounded-full", "bg-red-500/20", "flex", "items-center", "justify-center"], [1, "flex-1", "min-w-0"], [1, "flex", "flex-wrap", "justify-between", "items-start", "gap-2"], [1, "text-sm", "font-semibold", "text-white"], [1, "text-xs", "text-gray-500", "flex-shrink-0"], [1, "inline-block", "mt-2", "text-xs", "font-medium", "text-blue-400", "hover:text-blue-300", "transition-colors", 3, "href"], [1, "flex-shrink-0", "flex", "items-center", "gap-2", "opacity-0", "group-hover:opacity-100", "transition-opacity"], [1, "w-2.5", "h-2.5", "bg-blue-500", "rounded-full", "opacity-100", 3, "title"], [1, "text-gray-500", "hover:text-white", "p-1.5", "rounded-full", "hover:bg-slate-700", "transition-colors", 3, "click", "title"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M6 18L18 6M6 6l12 12"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-5", "h-5", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-5", "h-5", "text-green-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-5", "h-5", "text-yellow-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-5", "h-5", "text-red-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"], [1, "inline-block", "mt-2", "text-xs", "font-medium", "text-blue-400", "hover:text-blue-300", "transition-colors", 3, "click", "href"], ["fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", 1, "mx-auto", "h-12", "w-12", "text-slate-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"], [1, "mt-3", "text-sm", "font-semibold", "text-white"], [1, "mt-1", "text-sm", "text-gray-500"], [1, "inline-flex", "items-center", "gap-2", "px-6", "py-2.5", "rounded-lg", "bg-slate-800", "text-gray-300", "text-sm", "font-medium", "hover:bg-slate-700", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-colors", 3, "click", "disabled"], ["fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "w-4", "h-4"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8v8H4z", 1, "opacity-75"]], template: function NotificationsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "h1", 2);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(6, NotificationsComponent_Conditional_6_Template, 5, 7, "p", 3);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(7, "div", 4);
            i0.ɵɵconditionalCreate(8, NotificationsComponent_Conditional_8_Template, 5, 3, "button", 5);
            i0.ɵɵdomElementStart(9, "div", 6)(10, "button", 7);
            i0.ɵɵdomListener("click", function NotificationsComponent_Template_button_click_10_listener() { return ctx.setFilter("all"); });
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(13, "button", 7);
            i0.ɵɵdomListener("click", function NotificationsComponent_Template_button_click_13_listener() { return ctx.setFilter("unread"); });
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵconditionalCreate(16, NotificationsComponent_Conditional_16_Template, 2, 1, "span", 8);
            i0.ɵɵdomElementEnd()()()();
            i0.ɵɵconditionalCreate(17, NotificationsComponent_Conditional_17_Template, 3, 1, "div", 9)(18, NotificationsComponent_Conditional_18_Template, 6, 2, "div", 10);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 11, "notifications.title"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.totalCount() > 0 ? 6 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.unreadCount() > 0 ? 8 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap(ctx.activeFilter() === "all" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-700");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 13, "notifications.all"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap(ctx.activeFilter() === "unread" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-700");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 15, "notifications.unread"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.unreadCount() > 0 ? 16 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isLoading() ? 17 : 18);
        } }, dependencies: [CommonModule, i1.LowerCasePipe, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.notifications[_ngcontent-%COMP%] { padding: $spacing-6; }\r\n.notification-item[_ngcontent-%COMP%] { @include card($spacing-4); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-notifications', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, TranslatePipe], template: "<div class=\"container mx-auto p-6 lg:p-8 max-w-4xl\">\r\n\r\n  <!-- Header -->\r\n  <div class=\"flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4\">\r\n    <div>\r\n      <h1 class=\"text-3xl font-bold text-white\">{{ 'notifications.title' | translate }}</h1>\r\n      @if (totalCount() > 0) {\r\n        <p class=\"text-sm text-gray-400 mt-1\">\r\n          {{ totalCount() }} {{ 'notifications.title' | translate | lowercase }}\r\n          @if (unreadCount() > 0) {\r\n            &nbsp;&bull;&nbsp;<span class=\"text-blue-400 font-medium\">{{ unreadCount() }} {{ 'notifications.unread' | translate | lowercase }}</span>\r\n          }\r\n        </p>\r\n      }\r\n    </div>\r\n    <div class=\"flex items-center gap-3\">\r\n      @if (unreadCount() > 0) {\r\n        <button (click)=\"markAllAsRead()\"\r\n                class=\"inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 text-sm font-semibold border border-blue-500/30 hover:bg-blue-600/30 transition-colors\">\r\n          <svg class=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.5 12.75l6 6 9-13.5\" /></svg>\r\n          {{ 'notifications.markAllRead' | translate }}\r\n        </button>\r\n      }\r\n      <!-- Filter toggle -->\r\n      <div class=\"flex items-center gap-1 p-1 bg-slate-800 rounded-lg\">\r\n        <button (click)=\"setFilter('all')\"\r\n                [class]=\"activeFilter() === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-700'\"\r\n                class=\"px-4 py-1.5 rounded-md font-semibold text-sm transition-colors\">\r\n          {{ 'notifications.all' | translate }}\r\n        </button>\r\n        <button (click)=\"setFilter('unread')\"\r\n                [class]=\"activeFilter() === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-700'\"\r\n                class=\"px-4 py-1.5 rounded-md font-semibold text-sm transition-colors\">\r\n          {{ 'notifications.unread' | translate }}\r\n          @if (unreadCount() > 0) {\r\n            <span class=\"ml-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none\">{{ unreadCount() }}</span>\r\n          }\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- Loading skeleton -->\r\n  @if (isLoading()) {\r\n    <div class=\"bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800\">\r\n      @for(_ of [1,2,3,4,5]; track $index) {\r\n        <div class=\"p-5 flex items-start gap-4 animate-pulse\">\r\n          <div class=\"w-10 h-10 rounded-full bg-slate-700 flex-shrink-0\"></div>\r\n          <div class=\"flex-1 space-y-2\">\r\n            <div class=\"h-4 bg-slate-700 rounded w-1/3\"></div>\r\n            <div class=\"h-3 bg-slate-700/70 rounded w-2/3\"></div>\r\n          </div>\r\n          <div class=\"h-3 bg-slate-700/50 rounded w-20\"></div>\r\n        </div>\r\n      }\r\n    </div>\r\n  } @else {\r\n\r\n    <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl overflow-hidden\">\r\n      <ul class=\"divide-y divide-slate-800\">\r\n        @for(notification of filteredNotifications(); track notification.id) {\r\n          <li (click)=\"markAsRead(notification)\"\r\n              class=\"group p-4 sm:p-5 flex items-start gap-4 transition-colors duration-200\"\r\n              [class.hover:bg-slate-800/50]=\"!notification.read\"\r\n              [class.cursor-pointer]=\"!notification.read\"\r\n              [class.bg-blue-950/10]=\"!notification.read\">\r\n\r\n            <!-- Type icon -->\r\n            <div class=\"flex-shrink-0 mt-0.5\">\r\n              @if (notification.type === 'info') {\r\n                <div class=\"w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center\">\r\n                  <svg class=\"w-5 h-5 text-blue-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /></svg>\r\n                </div>\r\n              } @else if (notification.type === 'success') {\r\n                <div class=\"w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center\">\r\n                  <svg class=\"w-5 h-5 text-green-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /></svg>\r\n                </div>\r\n              } @else if (notification.type === 'warning') {\r\n                <div class=\"w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center\">\r\n                  <svg class=\"w-5 h-5 text-yellow-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z\" /></svg>\r\n                </div>\r\n              } @else {\r\n                <div class=\"w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center\">\r\n                  <svg class=\"w-5 h-5 text-red-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z\" /></svg>\r\n                </div>\r\n              }\r\n            </div>\r\n\r\n            <!-- Content -->\r\n            <div class=\"flex-1 min-w-0\">\r\n              <div class=\"flex flex-wrap justify-between items-start gap-2\">\r\n                <h3 class=\"text-sm font-semibold text-white\" [class.opacity-60]=\"notification.read\">\r\n                  {{ notification.title }}\r\n                </h3>\r\n                <p class=\"text-xs text-gray-500 flex-shrink-0\">{{ formatDate(notification.timestamp) }}</p>\r\n              </div>\r\n              <p class=\"text-sm text-gray-400 mt-1\" [class.opacity-60]=\"notification.read\">\r\n                {{ notification.message }}\r\n              </p>\r\n              @if (notification.actionUrl) {\r\n                <a [href]=\"notification.actionUrl\"\r\n                   (click)=\"$event.stopPropagation()\"\r\n                   class=\"inline-block mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors\">\r\n                  View details \u2192\r\n                </a>\r\n              }\r\n            </div>\r\n\r\n            <!-- Unread indicator + delete -->\r\n            <div class=\"flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity\">\r\n              @if(!notification.read) {\r\n                <div class=\"w-2.5 h-2.5 bg-blue-500 rounded-full opacity-100\" [title]=\"'notifications.unread' | translate\"></div>\r\n              }\r\n              <button (click)=\"deleteNotification(notification.id, $event)\"\r\n                      [title]=\"'notifications.delete' | translate\"\r\n                      class=\"text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-slate-700 transition-colors\">\r\n                <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\" /></svg>\r\n              </button>\r\n            </div>\r\n          </li>\r\n        } @empty {\r\n          <li class=\"py-20 text-center\">\r\n            <svg class=\"mx-auto h-12 w-12 text-slate-600\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9\" />\r\n            </svg>\r\n            <h3 class=\"mt-3 text-sm font-semibold text-white\">{{ 'notifications.noNotifications.title' | translate }}</h3>\r\n            <p class=\"mt-1 text-sm text-gray-500\">\r\n              @if(activeFilter() === 'unread') {\r\n                {{ 'notifications.noNotifications.allCaughtUp' | translate }}\r\n              } @else {\r\n                {{ 'notifications.noNotifications.subtitle' | translate }}\r\n              }\r\n            </p>\r\n          </li>\r\n        }\r\n      </ul>\r\n\r\n      <!-- Load More -->\r\n      @if (hasMore() && activeFilter() === 'all') {\r\n        <div class=\"border-t border-slate-800 p-4 text-center\">\r\n          <button (click)=\"loadMore()\"\r\n                  [disabled]=\"isLoadingMore()\"\r\n                  class=\"inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-800 text-gray-300 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors\">\r\n            @if (isLoadingMore()) {\r\n              <svg class=\"animate-spin w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8v8H4z\"></path></svg>\r\n              Loading...\r\n            } @else {\r\n              Load more notifications\r\n            }\r\n          </button>\r\n        </div>\r\n      }\r\n    </div>\r\n  }\r\n\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.notifications { padding: $spacing-6; }\r\n.notification-item { @include card($spacing-4); }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationsComponent, { className: "NotificationsComponent", filePath: "src/app/pages/admin/notifications/notifications.component.ts", lineNumber: 14 }); })();
