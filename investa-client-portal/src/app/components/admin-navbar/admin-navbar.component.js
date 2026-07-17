import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { ProfileService } from '../../services/profile.service';
import { RoleContextService } from '../../services/role-context.service';
import { get } from 'lodash-es';
import * as i0 from "@angular/core";
const _c0 = () => ({ exact: true });
const _forTrack0 = ($index, $item) => $item.id;
function AdminNavbarComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 42);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 14);
    i0.ɵɵelement(2, "path", 43);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "a", 44);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(7, "svg", 14);
    i0.ɵɵelement(8, "path", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "adminNav.investments"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 4, "adminNav.myParticipations"));
} }
function AdminNavbarComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 16);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 14);
    i0.ɵɵelement(2, "path", 46);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "adminNav.createProject"));
} }
function AdminNavbarComponent_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.unreadCount());
} }
function AdminNavbarComponent_Conditional_56_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 49);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.unreadCount());
} }
function AdminNavbarComponent_Conditional_56_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 59);
    i0.ɵɵlistener("click", function AdminNavbarComponent_Conditional_56_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.markAllRead()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "notifications.markAllRead"));
} }
function AdminNavbarComponent_Conditional_56_For_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 71);
    i0.ɵɵelement(2, "path", 72);
    i0.ɵɵelementEnd()();
} }
function AdminNavbarComponent_Conditional_56_For_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 63);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 71);
    i0.ɵɵelement(2, "path", 73);
    i0.ɵɵelementEnd()();
} }
function AdminNavbarComponent_Conditional_56_For_10_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 64);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 71);
    i0.ɵɵelement(2, "path", 74);
    i0.ɵɵelementEnd()();
} }
function AdminNavbarComponent_Conditional_56_For_10_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 65);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 71);
    i0.ɵɵelement(2, "path", 75);
    i0.ɵɵelementEnd()();
} }
function AdminNavbarComponent_Conditional_56_For_10_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 70);
} }
function AdminNavbarComponent_Conditional_56_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 60)(1, "div", 61);
    i0.ɵɵconditionalCreate(2, AdminNavbarComponent_Conditional_56_For_10_Conditional_2_Template, 3, 0, "div", 62)(3, AdminNavbarComponent_Conditional_56_For_10_Conditional_3_Template, 3, 0, "div", 63)(4, AdminNavbarComponent_Conditional_56_For_10_Conditional_4_Template, 3, 0, "div", 64)(5, AdminNavbarComponent_Conditional_56_For_10_Conditional_5_Template, 3, 0, "div", 65);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 66)(7, "p", 67);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 68);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 69);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, AdminNavbarComponent_Conditional_56_For_10_Conditional_13_Template, 1, 0, "div", 70);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const notification_r4 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("notification-item-unread", !notification_r4.read);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(notification_r4.type === "info" ? 2 : notification_r4.type === "success" ? 3 : notification_r4.type === "warning" ? 4 : 5);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(notification_r4.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(notification_r4.message);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getTimeAgo(notification_r4.timestamp));
    i0.ɵɵadvance();
    i0.ɵɵconditional(!notification_r4.read ? 13 : -1);
} }
function AdminNavbarComponent_Conditional_56_ForEmpty_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 53);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 76);
    i0.ɵɵelement(2, "path", 77);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "notifications.noNotifications.subtitle"));
} }
function AdminNavbarComponent_Conditional_56_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 56);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.totalNotificationCount());
} }
function AdminNavbarComponent_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 36)(1, "div", 47)(2, "div", 48)(3, "h3");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, AdminNavbarComponent_Conditional_56_Conditional_6_Template, 2, 1, "span", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, AdminNavbarComponent_Conditional_56_Conditional_7_Template, 3, 3, "button", 50);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "ul", 51);
    i0.ɵɵrepeaterCreate(9, AdminNavbarComponent_Conditional_56_For_10_Template, 14, 7, "li", 52, _forTrack0, false, AdminNavbarComponent_Conditional_56_ForEmpty_11_Template, 6, 3, "li", 53);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 54)(13, "button", 55);
    i0.ɵɵlistener("click", function AdminNavbarComponent_Conditional_56_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.viewAllNotifications()); });
    i0.ɵɵelementStart(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(17, AdminNavbarComponent_Conditional_56_Conditional_17_Template, 2, 1, "span", 56);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(18, "svg", 57);
    i0.ɵɵelement(19, "path", 58);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "notifications.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.unreadCount() > 0 ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.unreadCount() > 0 ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.recentNotifications());
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 8, "notifications.seeAll"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.totalNotificationCount() > 10 ? 17 : -1);
} }
function AdminNavbarComponent_Conditional_60_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.unreadMessageCount());
} }
function AdminNavbarComponent_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 39);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", ctx_r0.avatarUrl(), i0.ɵɵsanitizeUrl);
} }
function AdminNavbarComponent_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.userInitials());
} }
function AdminNavbarComponent_Conditional_65_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 79);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r0.avatarUrl(), i0.ɵɵsanitizeUrl);
} }
function AdminNavbarComponent_Conditional_65_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 80);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.userInitials());
} }
function AdminNavbarComponent_Conditional_65_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 41)(1, "div", 78);
    i0.ɵɵconditionalCreate(2, AdminNavbarComponent_Conditional_65_Conditional_2_Template, 1, 1, "img", 79)(3, AdminNavbarComponent_Conditional_65_Conditional_3_Template, 2, 1, "div", 80);
    i0.ɵɵelementStart(4, "div", 81)(5, "span", 82);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 83);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelement(9, "div", 84);
    i0.ɵɵelementStart(10, "a", 85);
    i0.ɵɵlistener("click", function AdminNavbarComponent_Conditional_65_Template_a_click_10_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.isUserMenuOpen.set(false)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(11, "svg", 86);
    i0.ɵɵelement(12, "path", 87);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(15, "a", 88);
    i0.ɵɵlistener("click", function AdminNavbarComponent_Conditional_65_Template_a_click_15_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.isUserMenuOpen.set(false)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(16, "svg", 86);
    i0.ɵɵelement(17, "path", 89)(18, "path", 90);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelement(21, "div", 84);
    i0.ɵɵelementStart(22, "button", 91);
    i0.ɵɵlistener("click", function AdminNavbarComponent_Conditional_65_Template_button_click_22_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.logout()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(23, "svg", 86);
    i0.ɵɵelement(24, "path", 92);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.hasProfileImage() ? 2 : 3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.userName());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.userEmail());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 6, "adminNav.userMenu.profile"), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 8, "adminNav.userMenu.settings"), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 10, "adminNav.logout"), " ");
} }
/**
 * AdminNavbarComponent
 *
 * Navigation bar for authenticated users (admin/investor/founder section).
 * Features:
 * - User role-based navigation links
 * - Notification bell with unread count
 * - User dropdown menu with logout
 * - Language toggle functionality
 * - Real-time notification display
 *
 * Automatically hides/shows menus when interacting with other dropdowns.
 * Uses Angular Signals for reactive state management.
 *
 * @example
 * <app-admin-navbar></app-admin-navbar>
 */
export class AdminNavbarComponent {
    constructor() {
        this.authService = inject(AuthService);
        this.router = inject(Router);
        this.languageService = inject(LanguageService);
        this.notificationService = inject(NotificationService);
        this.profileService = inject(ProfileService);
        this.roleContext = inject(RoleContextService);
        /** Current user's role (investor, founder, admin) */
        this.userRole = this.authService.userRole;
        /** Avatar URL sourced from the user's profile, with picsum fallback */
        this.avatarUrl = computed(() => {
            const p = this.profileService.profile();
            if (p?.basicInfo?.avatarUrl)
                return p.basicInfo.avatarUrl;
            const seed = (p?.basicInfo?.firstName || 'user').replace(/\s+/g, '') || 'user';
            return `https://picsum.photos/seed/${seed}/100/100`;
        }, ...(ngDevMode ? [{ debugName: "avatarUrl" }] : []));
        /** User's display name */
        this.userName = computed(() => {
            const p = this.profileService.profile();
            if (p?.basicInfo?.firstName && p?.basicInfo?.lastName) {
                return `${p.basicInfo.firstName} ${p.basicInfo.lastName}`;
            }
            return p?.basicInfo?.firstName || 'User';
        }, ...(ngDevMode ? [{ debugName: "userName" }] : []));
        /** User's email address */
        this.userEmail = computed(() => {
            const p = this.profileService.profile();
            return p?.contactInfo?.email || p?.coreMetrics?.email || '';
        }, ...(ngDevMode ? [{ debugName: "userEmail" }] : []));
        /** User's initials for avatar fallback (e.g., "AM" for Ahmed Mohamed) */
        this.userInitials = computed(() => {
            const p = this.profileService.profile();
            const firstName = p?.basicInfo?.firstName || '';
            const lastName = p?.basicInfo?.lastName || '';
            if (firstName && lastName) {
                return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
            }
            if (firstName) {
                return firstName.charAt(0).toUpperCase();
            }
            return 'U';
        }, ...(ngDevMode ? [{ debugName: "userInitials" }] : []));
        /** Whether user has a profile image */
        this.hasProfileImage = computed(() => {
            const p = this.profileService.profile();
            return !!p?.basicInfo?.avatarUrl;
        }, ...(ngDevMode ? [{ debugName: "hasProfileImage" }] : []));
        /** Unread message count */
        this.unreadMessageCount = computed(() => {
            return this.notificationService.unreadCount();
        }, ...(ngDevMode ? [{ debugName: "unreadMessageCount" }] : []));
        /** Tracks if user dropdown menu is open */
        this.isUserMenuOpen = signal(false, ...(ngDevMode ? [{ debugName: "isUserMenuOpen" }] : []));
        /** Tracks if notifications dropdown is open */
        this.isNotificationsOpen = signal(false, ...(ngDevMode ? [{ debugName: "isNotificationsOpen" }] : []));
        /** Unread notification count */
        this.unreadCount = this.notificationService.unreadCount;
        /** Total notification count from backend */
        this.totalNotificationCount = this.notificationService.totalCount;
        /** Most recent notifications (limited to 10) */
        this.recentNotifications = computed(() => this.notificationService.notifications().slice(0, 10), ...(ngDevMode ? [{ debugName: "recentNotifications" }] : []));
    }
    /**
     * Toggles the user menu dropdown
     * Automatically closes notifications menu when opening user menu
     */
    toggleUserMenu() {
        this.isUserMenuOpen.update(value => !value);
        if (this.isUserMenuOpen()) {
            this.isNotificationsOpen.set(false);
        }
    }
    /**
     * Toggles the notifications dropdown
     * Automatically closes user menu when opening notifications menu
     */
    toggleNotifications() {
        this.isNotificationsOpen.update(value => !value);
        if (this.isNotificationsOpen()) {
            this.isUserMenuOpen.set(false);
        }
    }
    /**
     * Logs out the current user and redirects to login page
     */
    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
    /**
     * Toggles the application language
     * @param event Click event to prevent default behavior
     */
    toggleLanguage(event) {
        event.preventDefault();
        this.languageService.toggleLanguage();
    }
    /**
     * Navigates to the notifications page and closes the dropdown
     */
    viewAllNotifications() {
        this.isNotificationsOpen.set(false);
        this.router.navigate(['/admin/notifications']);
    }
    markAllRead() {
        this.notificationService.markAllAsRead();
    }
    /**
     * Calculates human-readable time difference from current time (localized)
     * @param date The date to calculate time difference from
     * @returns Localized string like "2 hours ago", "3 days ago", etc.
     */
    getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const dictionary = this.languageService.dictionary();
        let interval = seconds / 31536000;
        if (interval > 1) {
            const years = Math.floor(interval);
            const key = years > 1 ? 'common.timeAgo.years' : 'common.timeAgo.year';
            return get(dictionary, key, `${years} year${years > 1 ? 's' : ''} ago`).replace('{count}', String(years));
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            const months = Math.floor(interval);
            const key = months > 1 ? 'common.timeAgo.months' : 'common.timeAgo.month';
            return get(dictionary, key, `${months} month${months > 1 ? 's' : ''} ago`).replace('{count}', String(months));
        }
        interval = seconds / 86400;
        if (interval > 1) {
            const days = Math.floor(interval);
            const key = days > 1 ? 'common.timeAgo.days' : 'common.timeAgo.day';
            return get(dictionary, key, `${days} day${days > 1 ? 's' : ''} ago`).replace('{count}', String(days));
        }
        interval = seconds / 3600;
        if (interval > 1) {
            const hours = Math.floor(interval);
            const key = hours > 1 ? 'common.timeAgo.hours' : 'common.timeAgo.hour';
            return get(dictionary, key, `${hours} hour${hours > 1 ? 's' : ''} ago`).replace('{count}', String(hours));
        }
        interval = seconds / 60;
        if (interval > 1) {
            const minutes = Math.floor(interval);
            const key = minutes > 1 ? 'common.timeAgo.minutes' : 'common.timeAgo.minute';
            return get(dictionary, key, `${minutes} minute${minutes > 1 ? 's' : ''} ago`).replace('{count}', String(minutes));
        }
        const secs = Math.floor(seconds);
        const key = secs > 1 ? 'common.timeAgo.seconds' : 'common.timeAgo.second';
        return get(dictionary, key, `${secs} second${secs > 1 ? 's' : ''} ago`).replace('{count}', String(secs));
    }
    static { this.ɵfac = function AdminNavbarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminNavbarComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminNavbarComponent, selectors: [["app-admin-navbar"]], decls: 66, vars: 28, consts: [[1, "premium-navbar", 3, "dir"], [1, "navbar-container"], [1, "navbar-left"], [1, "navbar-logo"], ["routerLink", "/admin", 1, "logo-link"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round", 1, "logo-icon"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l-1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "logo-text"], [1, "navbar-nav"], ["routerLink", "/admin/dashboard", "routerLinkActive", "nav-link-active", 1, "nav-link", 3, "routerLinkActiveOptions"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "nav-link-icon"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"], ["routerLink", "/admin/investments/new", "routerLinkActive", "nav-link-active", 1, "nav-link"], ["routerLink", "/admin/chat", "routerLinkActive", "nav-link-active", 1, "nav-link"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"], ["routerLink", "/admin/requests", "routerLinkActive", "nav-link-active", 1, "nav-link"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"], [1, "nav-divider"], ["routerLink", "/", 1, "nav-link", "nav-link-secondary"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"], [1, "navbar-center"], [1, "search-container"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "search-icon"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"], ["type", "text", 1, "search-input", 3, "placeholder"], [1, "search-shortcut"], [1, "navbar-right"], [1, "relative", 3, "clickOutside"], ["type", "button", 1, "icon-btn", "notification-btn", 3, "click"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "icon-btn-icon"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"], [1, "icon-badge"], [1, "notifications-dropdown"], ["routerLink", "/admin/chat", "type", "button", 1, "icon-btn", "messages-btn"], ["type", "button", 1, "user-menu-btn", 3, "click"], ["alt", "", 1, "user-avatar", 3, "src"], [1, "user-avatar-initials"], [1, "user-dropdown"], ["routerLink", "/admin/investments", "routerLinkActive", "nav-link-active", 1, "nav-link"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"], ["routerLink", "/admin/my-projects", "routerLinkActive", "nav-link-active", 1, "nav-link"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M7.5 14.25l-2.489-1.867a.75.75 0 010-1.266l2.489-1.867M16.5 14.25l2.489-1.867a.75.75 0 000-1.266l-2.489-1.867"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 4.5v15m7.5-7.5h-15"], [1, "notifications-header"], [1, "notifications-title"], [1, "notifications-count"], [1, "mark-read-btn"], [1, "notifications-list"], [1, "notification-item", 3, "notification-item-unread"], [1, "notifications-empty"], [1, "notifications-footer"], [1, "see-all-btn", 3, "click"], [1, "total-count"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "2", "stroke", "currentColor", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"], [1, "mark-read-btn", 3, "click"], [1, "notification-item"], [1, "notification-icon-wrapper"], [1, "notification-type-icon", "notification-type-info"], [1, "notification-type-icon", "notification-type-success"], [1, "notification-type-icon", "notification-type-warning"], [1, "notification-type-icon", "notification-type-error"], [1, "notification-content"], [1, "notification-title"], [1, "notification-message"], [1, "notification-time"], [1, "notification-indicator"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", 1, "empty-icon"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"], [1, "user-dropdown-header"], ["alt", "", 1, "dropdown-avatar", 3, "src"], [1, "dropdown-avatar-initials"], [1, "dropdown-user-info"], [1, "dropdown-user-name"], [1, "dropdown-user-email"], [1, "user-dropdown-divider"], ["routerLink", "/admin/profile", 1, "dropdown-item", 3, "click"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "dropdown-item-icon"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"], ["routerLink", "/admin/settings", 1, "dropdown-item", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 00-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 00-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], [1, "dropdown-item", "dropdown-item-danger", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"]], template: function AdminNavbarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "nav", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "a", 4);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(5, "svg", 5);
            i0.ɵɵelement(6, "path", 6)(7, "path", 7)(8, "path", 8)(9, "path", 9)(10, "path", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(11, "span", 11);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(14, "div", 12)(15, "a", 13);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(16, "svg", 14);
            i0.ɵɵelement(17, "path", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(18, "span");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(21, AdminNavbarComponent_Conditional_21_Template, 12, 6);
            i0.ɵɵconditionalCreate(22, AdminNavbarComponent_Conditional_22_Template, 6, 3, "a", 16);
            i0.ɵɵelementStart(23, "a", 17);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(24, "svg", 14);
            i0.ɵɵelement(25, "path", 18);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(26, "span");
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "a", 19);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(30, "svg", 14);
            i0.ɵɵelement(31, "path", 20);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(32, "span");
            i0.ɵɵtext(33);
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelement(35, "div", 21);
            i0.ɵɵelementStart(36, "a", 22);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(37, "svg", 14);
            i0.ɵɵelement(38, "path", 23);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(39, "span");
            i0.ɵɵtext(40);
            i0.ɵɵpipe(41, "translate");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(42, "div", 24)(43, "div", 25);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(44, "svg", 26);
            i0.ɵɵelement(45, "path", 27);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelement(46, "input", 28);
            i0.ɵɵpipe(47, "translate");
            i0.ɵɵelementStart(48, "kbd", 29);
            i0.ɵɵtext(49, "\u2318K");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(50, "div", 30)(51, "div", 31);
            i0.ɵɵlistener("clickOutside", function AdminNavbarComponent_Template_div_clickOutside_51_listener() { return ctx.isNotificationsOpen.set(false); });
            i0.ɵɵelementStart(52, "button", 32);
            i0.ɵɵlistener("click", function AdminNavbarComponent_Template_button_click_52_listener() { return ctx.toggleNotifications(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(53, "svg", 33);
            i0.ɵɵelement(54, "path", 34);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(55, AdminNavbarComponent_Conditional_55_Template, 2, 1, "span", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(56, AdminNavbarComponent_Conditional_56_Template, 20, 10, "div", 36);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(57, "button", 37);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(58, "svg", 33);
            i0.ɵɵelement(59, "path", 18);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(60, AdminNavbarComponent_Conditional_60_Template, 2, 1, "span", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(61, "div", 31);
            i0.ɵɵlistener("clickOutside", function AdminNavbarComponent_Template_div_clickOutside_61_listener() { return ctx.isUserMenuOpen.set(false); });
            i0.ɵɵelementStart(62, "button", 38);
            i0.ɵɵlistener("click", function AdminNavbarComponent_Template_button_click_62_listener() { return ctx.toggleUserMenu(); });
            i0.ɵɵconditionalCreate(63, AdminNavbarComponent_Conditional_63_Template, 1, 1, "img", 39)(64, AdminNavbarComponent_Conditional_64_Template, 2, 1, "div", 40);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(65, AdminNavbarComponent_Conditional_65_Template, 27, 12, "div", 41);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵproperty("dir", ctx.languageService.direction());
            i0.ɵɵadvance(12);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 15, "adminNav.panel"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("routerLinkActiveOptions", i0.ɵɵpureFunction0(27, _c0));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 17, "adminNav.dashboard"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.roleContext.isActiveInvestorContext() ? 21 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.roleContext.isActiveFounderContext() ? 22 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 19, "adminNav.communication"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 21, "adminNav.requests"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 23, "adminNav.returnHome"));
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(47, 25, "adminNav.searchPlaceholder"));
            i0.ɵɵadvance(9);
            i0.ɵɵconditional(ctx.unreadCount() > 0 ? 55 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isNotificationsOpen() ? 56 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.unreadMessageCount() > 0 ? 60 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.hasProfileImage() ? 63 : 64);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isUserMenuOpen() ? 65 : -1);
        } }, dependencies: [RouterLink, RouterLinkActive, CommonModule, ClickOutsideDirective, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n@use 'theme' as theme;\r\n\r\n//[_ngcontent-%COMP%]   Premium[_ngcontent-%COMP%]   Navbar[_ngcontent-%COMP%]   Styles\r\n.premium-navbar[_ngcontent-%COMP%] {\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 1060;\r\n  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);\r\n  backdrop-filter: blur(20px);\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.3);\r\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);\r\n}\r\n\r\n.navbar-container[_ngcontent-%COMP%] {\r\n  max-width: 1800px;\r\n  margin: 0 auto;\r\n  padding: 0.5rem 0.875rem;\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 0.75rem;\n  min-width: 0;\n\n  @media (min-width: 768px) {\n    padding: 0.5rem 1.25rem;\n  }\n}\n\r\n//[_ngcontent-%COMP%]   Left[_ngcontent-%COMP%]   Section[_ngcontent-%COMP%]:   Logo[_ngcontent-%COMP%]   &[_ngcontent-%COMP%]   Navigation\r\n.navbar-left[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\n  flex: 1;\n  min-width: 0;\n}\n\r\n//[_ngcontent-%COMP%]   Logo[_ngcontent-%COMP%]   Section\r\n.navbar-logo[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n}\r\n\r\n.logo-link[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.5rem;\n  text-decoration: none;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    transform: scale(1.02);\r\n  }\r\n}\r\n\r\n.logo-icon[_ngcontent-%COMP%] {\r\n  width: 1.75rem;\n  height: 1.75rem;\n  color: #3b82f6;\r\n  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.3));\r\n}\r\n\r\n.logo-text[_ngcontent-%COMP%] {\r\n  font-size: 1rem;\n  font-weight: 700;\r\n  color: #ffffff;\r\n  letter-spacing: -0.02em;\r\n  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);\r\n  -webkit-background-clip: text;\r\n  -webkit-text-fill-color: transparent;\r\n  background-clip: text;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Navigation[_ngcontent-%COMP%]   Links\r\n.navbar-nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n  overflow-x: auto;\n  overflow-y: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n  min-width: 0;\n  padding: 0.125rem;\n\r\n  &::-webkit-scrollbar {\r\n    display: none;\r\n  }\r\n\r\n  @media (min-width: 1024px) {\n    gap: 0.25rem;\n  }\n}\n\r\n.nav-link[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.3125rem;\n  min-height: 2.125rem;\n  padding: 0.375rem 0.5625rem;\n  border-radius: 0.5rem;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #cbd5e1;\n  text-decoration: none;\r\n  white-space: nowrap;\r\n  transition: all 0.2s ease;\r\n  background: rgba(15, 23, 42, 0.2);\n  border: 1px solid transparent;\n  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.04);\n\r\n  &:hover {\r\n    color: #ffffff;\r\n    background: rgba(51, 65, 85, 0.72);\n    border-color: rgba(148, 163, 184, 0.18);\n  }\n\n  &.nav-link-active {\n    color: #eff6ff;\n    background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(14, 165, 233, 0.68));\n    border-color: rgba(147, 197, 253, 0.45);\n    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);\n  }\n\r\n  &.nav-link-secondary {\r\n    color: #64748b;\r\n\r\n    &:hover {\r\n      color: #94a3b8;\r\n    }\r\n  }\r\n}\r\n\r\n.nav-link-icon[_ngcontent-%COMP%] {\r\n  width: 0.9375rem;\n  height: 0.9375rem;\n  flex-shrink: 0;\r\n}\r\n\r\n.nav-divider[_ngcontent-%COMP%] {\r\n  width: 1px;\r\n  height: 1.25rem;\r\n  background: rgba(71, 85, 105, 0.5);\r\n  margin: 0 0.375rem;\r\n  flex-shrink: 0;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Center[_ngcontent-%COMP%]   Section[_ngcontent-%COMP%]:   Search[_ngcontent-%COMP%]   Bar\r\n.navbar-center[_ngcontent-%COMP%] {\n  flex: 0 1 260px;\n  max-width: 260px;\n\n  @media (max-width: 1280px) {\n    display: none;\n  }\n}\n\r\n//[_ngcontent-%COMP%]   Right[_ngcontent-%COMP%]   Section\r\n.navbar-right[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.5rem;\n  flex-shrink: 0;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Professional[_ngcontent-%COMP%]   Search\r\n.search-container[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  width: 100%;\r\n  max-width: 260px;\n  background: rgba(255, 255, 255, 0.05);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-radius: 0.625rem;\r\n  padding: 0.5rem 0.875rem;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.08);\r\n    border-color: rgba(255, 255, 255, 0.15);\r\n  }\r\n\r\n  &:focus-within {\r\n    background: rgba(255, 255, 255, 0.1);\r\n    border-color: rgba(59, 130, 246, 0.5);\r\n    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\r\n  }\r\n\r\n}\n\r\n.search-icon[_ngcontent-%COMP%] {\r\n  width: 1rem;\r\n  height: 1rem;\r\n  color: #64748b;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.search-input[_ngcontent-%COMP%] {\r\n  flex: 1;\r\n  border: none;\r\n  background: transparent;\r\n  color: #ffffff;\r\n  font-size: 0.8125rem;\r\n  font-weight: 400;\r\n  outline: none;\r\n  padding: 0 0.5rem;\r\n\r\n  &::placeholder {\r\n    color: #64748b;\r\n  }\r\n}\r\n\r\n.search-shortcut[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  padding: 0.1875rem 0.4375rem;\r\n  background: rgba(255, 255, 255, 0.1);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-radius: 0.3125rem;\r\n  font-size: 0.6875rem;\r\n  font-weight: 500;\r\n  color: #94a3b8;\r\n  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Icon[_ngcontent-%COMP%]   Buttons[_ngcontent-%COMP%]   (Notifications, Messages)\r\n.icon-btn[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  width: 2rem;\r\n  height: 2rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: rgba(255, 255, 255, 0.05);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-radius: 0.5rem;\r\n  color: #94a3b8;\r\n  cursor: pointer;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.1);\r\n    color: #ffffff;\r\n  }\r\n}\r\n\r\n.icon-btn-icon[_ngcontent-%COMP%] {\r\n  width: 1.125rem;\r\n  height: 1.125rem;\r\n}\r\n\r\n.icon-badge[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: -0.1875rem;\r\n  right: -0.1875rem;\r\n  min-width: 1rem;\r\n  height: 1rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0 0.3125rem;\r\n  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);\r\n  color: #ffffff;\r\n  font-size: 0.625rem;\r\n  font-weight: 700;\r\n  border-radius: 9999px;\r\n  border: 2px solid rgba(15, 23, 42, 0.95);\r\n  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);\r\n}\r\n\r\n.notifications-dropdown[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: calc(100% + 0.75rem);\r\n  right: 0;\r\n  width: 24rem;\r\n  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);\r\n  border: 1px solid rgba(71, 85, 105, 0.5);\r\n  border-radius: 1rem;\r\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);\r\n  overflow: hidden;\r\n  backdrop-filter: blur(20px);\r\n}\r\n\r\n.notifications-header[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  padding: 1rem 1.25rem;\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.3);\r\n  background: rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.notifications-title[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.5rem;\r\n\r\n  h3 {\r\n    font-size: 0.9375rem;\r\n    font-weight: 600;\r\n    color: #ffffff;\r\n    margin: 0;\r\n  }\r\n}\r\n\r\n.notifications-count[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  padding: 0.125rem 0.5rem;\r\n  background: rgba(59, 130, 246, 0.2);\r\n  color: #3b82f6;\r\n  border: 1px solid rgba(59, 130, 246, 0.3);\r\n  border-radius: 9999px;\r\n  font-size: 0.6875rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.mark-read-btn[_ngcontent-%COMP%] {\r\n  padding: 0.375rem 0.75rem;\r\n  background: transparent;\r\n  border: none;\r\n  color: #3b82f6;\r\n  font-size: 0.75rem;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: color 0.2s ease;\r\n\r\n  &:hover {\r\n    color: #60a5fa;\r\n  }\r\n}\r\n\r\n.notifications-list[_ngcontent-%COMP%] {\r\n  max-height: 24rem;\r\n  overflow-y: auto;\r\n  list-style: none;\r\n  margin: 0;\r\n  padding: 0;\r\n\r\n  &::-webkit-scrollbar {\r\n    width: 0.375rem;\r\n  }\r\n\r\n  &::-webkit-scrollbar-track {\r\n    background: rgba(71, 85, 105, 0.2);\r\n  }\r\n\r\n  &::-webkit-scrollbar-thumb {\r\n    background: rgba(71, 85, 105, 0.5);\r\n    border-radius: 0.1875rem;\r\n  }\r\n}\r\n\r\n.notification-item[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.75rem;\r\n  padding: 1rem 1.25rem;\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.2);\r\n  transition: background 0.2s ease;\r\n  cursor: pointer;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.03);\r\n  }\r\n\r\n  &:last-child {\r\n    border-bottom: none;\r\n  }\r\n\r\n  &.notification-item-unread {\r\n    background: rgba(59, 130, 246, 0.05);\r\n  }\r\n}\r\n\r\n.notification-icon-wrapper[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n}\r\n\r\n.notification-type-icon[_ngcontent-%COMP%] {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 0.5rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n\r\n  &.notification-type-info {\r\n    background: rgba(59, 130, 246, 0.2);\r\n    color: #3b82f6;\r\n  }\r\n\r\n  &.notification-type-success {\r\n    background: rgba(16, 185, 129, 0.2);\r\n    color: #10b981;\r\n  }\r\n\r\n  &.notification-type-warning {\r\n    background: rgba(245, 158, 11, 0.2);\r\n    color: #f59e0b;\r\n  }\r\n\r\n  &.notification-type-error {\r\n    background: rgba(239, 68, 68, 0.2);\r\n    color: #ef4444;\r\n  }\r\n}\r\n\r\n.notification-content[_ngcontent-%COMP%] {\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.notification-title[_ngcontent-%COMP%] {\r\n  font-size: 0.875rem;\r\n  font-weight: 600;\r\n  color: #ffffff;\r\n  margin: 0 0 0.25rem 0;\r\n}\r\n\r\n.notification-message[_ngcontent-%COMP%] {\r\n  font-size: 0.75rem;\r\n  color: #94a3b8;\r\n  margin: 0 0 0.25rem 0;\r\n  line-height: 1.4;\r\n}\r\n\r\n.notification-time[_ngcontent-%COMP%] {\r\n  font-size: 0.6875rem;\r\n  color: #64748b;\r\n  margin: 0;\r\n}\r\n\r\n.notification-indicator[_ngcontent-%COMP%] {\r\n  width: 0.5rem;\r\n  height: 0.5rem;\r\n  background: #3b82f6;\r\n  border-radius: 50%;\r\n  flex-shrink: 0;\r\n  margin-top: 0.25rem;\r\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);\r\n}\r\n\r\n.notifications-empty[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 3rem 1.25rem;\r\n  text-align: center;\r\n}\r\n\r\n.empty-icon[_ngcontent-%COMP%] {\r\n  width: 2.5rem;\r\n  height: 2.5rem;\r\n  color: #475569;\r\n  margin-bottom: 0.75rem;\r\n}\r\n\r\n.notifications-empty[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  font-size: 0.875rem;\r\n  color: #64748b;\r\n  margin: 0;\r\n}\r\n\r\n.notifications-footer[_ngcontent-%COMP%] {\r\n  padding: 0.75rem 1.25rem;\r\n  border-top: 1px solid rgba(71, 85, 105, 0.3);\r\n  background: rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.see-all-btn[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 0.5rem;\r\n  width: 100%;\r\n  padding: 0.75rem;\r\n  background: transparent;\r\n  border: none;\r\n  color: #3b82f6;\r\n  font-size: 0.875rem;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: all 0.2s ease;\r\n  border-radius: 0.5rem;\r\n\r\n  &:hover {\r\n    background: rgba(59, 130, 246, 0.1);\r\n  }\r\n}\r\n\r\n.total-count[_ngcontent-%COMP%] {\r\n  padding: 0.125rem 0.5rem;\r\n  background: rgba(71, 85, 105, 0.5);\r\n  color: #94a3b8;\r\n  border-radius: 9999px;\r\n  font-size: 0.6875rem;\r\n  font-weight: 700;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   User[_ngcontent-%COMP%]   Menu\r\n.user-menu-btn[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0;\r\n  background: transparent;\r\n  border: none;\r\n  cursor: pointer;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    transform: scale(1.05);\r\n  }\r\n}\r\n\r\n.user-avatar[_ngcontent-%COMP%] {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 50%;\r\n  object-fit: cover;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.user-avatar-initials[_ngcontent-%COMP%] {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\r\n  color: #ffffff;\r\n  font-size: 0.75rem;\r\n  font-weight: 700;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.user-dropdown[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: calc(100% + 0.75rem);\r\n  right: 0;\r\n  width: 16rem;\r\n  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);\r\n  border: 1px solid rgba(71, 85, 105, 0.5);\r\n  border-radius: 1rem;\r\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);\r\n  overflow: hidden;\r\n  backdrop-filter: blur(20px);\r\n}\r\n\r\n.user-dropdown-header[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n  padding: 1rem 1.25rem;\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.3);\r\n  background: rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.dropdown-avatar[_ngcontent-%COMP%] {\r\n  width: 2.25rem;\r\n  height: 2.25rem;\r\n  border-radius: 50%;\r\n  object-fit: cover;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.dropdown-avatar-initials[_ngcontent-%COMP%] {\r\n  width: 2.25rem;\r\n  height: 2.25rem;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\r\n  color: #ffffff;\r\n  font-size: 0.875rem;\r\n  font-weight: 700;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.dropdown-user-info[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.dropdown-user-name[_ngcontent-%COMP%] {\r\n  font-size: 0.875rem;\r\n  font-weight: 600;\r\n  color: #ffffff;\r\n  line-height: 1.2;\r\n}\r\n\r\n.dropdown-user-email[_ngcontent-%COMP%] {\r\n  font-size: 0.75rem;\r\n  color: #94a3b8;\r\n  line-height: 1.2;\r\n}\r\n\r\n.user-dropdown-divider[_ngcontent-%COMP%] {\r\n  height: 1px;\r\n  background: rgba(71, 85, 105, 0.3);\r\n  margin: 0;\r\n}\r\n\r\n.dropdown-item[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n  padding: 0.875rem 1.25rem;\r\n  color: #e2e8f0;\r\n  text-decoration: none;\r\n  font-size: 0.875rem;\r\n  font-weight: 500;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.05);\r\n    color: #ffffff;\r\n  }\r\n\r\n  &.dropdown-item-danger {\r\n    color: #ef4444;\r\n\r\n    &:hover {\r\n      background: rgba(239, 68, 68, 0.1);\r\n      color: #f87171;\r\n    }\r\n  }\r\n}\r\n\r\n.dropdown-item-icon[_ngcontent-%COMP%] {\r\n  width: 1.125rem;\r\n  height: 1.125rem;\r\n  flex-shrink: 0;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Responsive[_ngcontent-%COMP%]   adjustments\r\n@media[_ngcontent-%COMP%]   (max-width[_ngcontent-%COMP%]: 768px) {\n  .navbar-container {\n    padding: 0.625rem 0.75rem;\n    gap: 0.5rem;\n  }\n\n  .logo-text {\n    display: none;\n  }\n\r\n  .navbar-nav {\r\n    gap: 0.125rem;\r\n  }\r\n\r\n  .nav-link {\n    padding: 0.4375rem 0.5625rem;\n    font-size: 0.75rem;\n\r\n    span {\r\n      @media (max-width: 640px) {\r\n        display: none;\r\n      }\r\n    }\r\n  }\r\n\r\n  .navbar-right {\r\n    gap: 0.5rem;\r\n  }\n}\n\nbody.investa-theme-light[_nghost-%COMP%], body.investa-theme-light   [_nghost-%COMP%] {\n  .premium-navbar {\n    background: rgba(255, 255, 255, 0.94);\n    border-bottom-color: var(--investa-border, #dedede);\n    box-shadow: 0 1px 2px rgba(21, 22, 25, 0.05);\n  }\n\n  .logo-icon {\n    color: var(--investa-accent, #22c532);\n    filter: none;\n  }\n\n  .logo-text {\n    color: var(--investa-text-primary, #212225);\n    background: none;\n    -webkit-text-fill-color: currentColor;\n  }\n\n  .nav-link {\n    color: var(--investa-text-secondary, #66686b);\n    background: transparent;\n    border-color: transparent;\n    box-shadow: none;\n\n    &:hover {\n      color: var(--investa-text-primary, #212225);\n      background: var(--investa-surface-2, #f7f7f7);\n      border-color: var(--investa-border, #dedede);\n    }\n\n    &.nav-link-active {\n      color: var(--investa-text-primary, #212225);\n      background: var(--investa-surface-2, #f7f7f7);\n      border-color: var(--investa-border, #dedede);\n      box-shadow: inset 0 -3px 0 var(--investa-accent, #22c532);\n    }\n\n    &.nav-link-secondary {\n      color: var(--investa-text-muted, #7b7d80);\n\n      &:hover {\n        color: var(--investa-text-primary, #212225);\n      }\n    }\n  }\n\n  .nav-divider {\n    background: var(--investa-border, #dedede);\n  }\n\n  .search-container,\n  .icon-btn {\n    background: var(--investa-surface-2, #f7f7f7);\n    border-color: var(--investa-border, #dedede);\n    color: var(--investa-text-secondary, #66686b);\n\n    &:hover {\n      background: var(--investa-surface, #ffffff);\n      border-color: var(--investa-border-strong, #cfcfcf);\n      color: var(--investa-text-primary, #212225);\n    }\n  }\n\n  .search-container:focus-within {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-accent, #22c532);\n    box-shadow: 0 0 0 3px rgba(34, 197, 50, 0.14);\n  }\n\n  .search-icon,\n  .search-shortcut {\n    color: var(--investa-text-muted, #7b7d80);\n  }\n\n  .search-input {\n    color: var(--investa-text-primary, #212225);\n\n    &::placeholder {\n      color: var(--investa-text-muted, #7b7d80);\n    }\n  }\n\n  .search-shortcut {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .icon-badge {\n    border-color: var(--investa-surface, #ffffff);\n  }\n\n  .notifications-dropdown,\n  .user-dropdown {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n    box-shadow: 0 18px 38px rgba(21, 22, 25, 0.12);\n  }\n\n  .notifications-header,\n  .notifications-footer,\n  .user-dropdown-header {\n    background: var(--investa-surface-2, #f7f7f7);\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .notifications-title h3,\n  .notification-title,\n  .dropdown-user-name {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .notification-message,\n  .notification-time,\n  .notifications-empty p,\n  .dropdown-user-email {\n    color: var(--investa-text-secondary, #66686b);\n  }\n\n  .notifications-count,\n  .see-all-btn,\n  .mark-read-btn {\n    color: var(--investa-brand-700, #158322);\n  }\n\n  .notifications-count {\n    background: var(--investa-brand-50, rgba(34, 197, 50, 0.1));\n    border-color: var(--investa-brand-200, rgba(34, 197, 50, 0.22));\n  }\n\n  .notification-item {\n    border-color: var(--investa-border, #dedede);\n\n    &:hover,\n    &.notification-item-unread {\n      background: var(--investa-surface-2, #f7f7f7);\n    }\n  }\n\n  .notification-indicator {\n    background: var(--investa-accent, #22c532);\n    box-shadow: 0 0 8px rgba(34, 197, 50, 0.35);\n  }\n\n  .user-avatar,\n  .dropdown-avatar {\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .user-avatar-initials,\n  .dropdown-avatar-initials {\n    background: var(--investa-primary, #212225);\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .user-dropdown-divider {\n    background: var(--investa-border, #dedede);\n  }\n\n  .dropdown-item {\n    color: var(--investa-text-secondary, #66686b);\n\n    &:hover {\n      background: var(--investa-surface-2, #f7f7f7);\n      color: var(--investa-text-primary, #212225);\n    }\n  }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminNavbarComponent, [{
        type: Component,
        args: [{ selector: 'app-admin-navbar', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, RouterLinkActive, CommonModule, TranslatePipe, ClickOutsideDirective], template: "<nav class=\"premium-navbar\" [dir]=\"languageService.direction()\">\r\n  <div class=\"navbar-container\">\r\n    <!-- Logo -->\r\n    <div class=\"navbar-left\">\r\n      <div class=\"navbar-logo\">\r\n        <a routerLink=\"/admin\" class=\"logo-link\">\r\n          <svg\r\n            class=\"logo-icon\"\r\n            xmlns=\"http://www.w3.org/2000/svg\"\r\n            viewBox=\"0 0 24 24\"\r\n            stroke-width=\"1.5\"\r\n            stroke=\"currentColor\"\r\n            fill=\"none\"\r\n            stroke-linecap=\"round\"\r\n            stroke-linejoin=\"round\"\r\n          >\r\n            <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\r\n            <path d=\"M14 16.75l-1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\r\n            <path d=\"M10 14l2 -2l2 -2\"></path>\r\n            <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\r\n            <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\r\n          </svg>\r\n          <span class=\"logo-text\">{{ 'adminNav.panel' | translate }}</span>\r\n        </a>\r\n      </div>\r\n\r\n      <!-- Navigation Links -->\r\n      <div class=\"navbar-nav\">\r\n        <a\r\n          routerLink=\"/admin/dashboard\"\r\n          routerLinkActive=\"nav-link-active\"\r\n          [routerLinkActiveOptions]=\"{ exact: true }\"\r\n          class=\"nav-link\"\r\n        >\r\n          <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n            <path\r\n              stroke-linecap=\"round\"\r\n              stroke-linejoin=\"round\"\r\n              d=\"M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z\"\r\n            />\r\n          </svg>\r\n          <span>{{ 'adminNav.dashboard' | translate }}</span>\r\n        </a>\r\n\r\n          @if (roleContext.isActiveInvestorContext()) {\n          <a routerLink=\"/admin/investments\" routerLinkActive=\"nav-link-active\" class=\"nav-link\">\n            <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\n              <path\n                stroke-linecap=\"round\"\n                stroke-linejoin=\"round\"\r\n                d=\"M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z\"\r\n              />\r\n            </svg>\n            <span>{{ 'adminNav.investments' | translate }}</span>\n          </a>\n\n          <a routerLink=\"/admin/my-projects\" routerLinkActive=\"nav-link-active\" class=\"nav-link\">\n            <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M7.5 14.25l-2.489-1.867a.75.75 0 010-1.266l2.489-1.867M16.5 14.25l2.489-1.867a.75.75 0 000-1.266l-2.489-1.867\" />\n            </svg>\n            <span>{{ 'adminNav.myParticipations' | translate }}</span>\n          </a>\n          }\n\n          @if (roleContext.isActiveFounderContext()) {\n          <a routerLink=\"/admin/investments/new\" routerLinkActive=\"nav-link-active\" class=\"nav-link\">\n            <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 4.5v15m7.5-7.5h-15\" />\n            </svg>\n            <span>{{ 'adminNav.createProject' | translate }}</span>\n          </a>\n          }\n\n        <a routerLink=\"/admin/chat\" routerLinkActive=\"nav-link-active\" class=\"nav-link\">\n          <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n            <path\r\n              stroke-linecap=\"round\"\r\n              stroke-linejoin=\"round\"\r\n              d=\"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z\"\r\n            />\r\n          </svg>\r\n          <span>{{ 'adminNav.communication' | translate }}</span>\r\n        </a>\r\n\r\n        <a routerLink=\"/admin/requests\" routerLinkActive=\"nav-link-active\" class=\"nav-link\">\r\n          <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n            <path\r\n              stroke-linecap=\"round\"\r\n              stroke-linejoin=\"round\"\r\n              d=\"M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z\"\r\n            />\r\n          </svg>\r\n          <span>{{ 'adminNav.requests' | translate }}</span>\r\n        </a>\r\n\r\n        <div class=\"nav-divider\"></div>\r\n\r\n        <a routerLink=\"/\" class=\"nav-link nav-link-secondary\">\r\n          <svg class=\"nav-link-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n            <path\r\n              stroke-linecap=\"round\"\r\n              stroke-linejoin=\"round\"\r\n              d=\"M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5\"\r\n            />\r\n          </svg>\r\n          <span>{{ 'adminNav.returnHome' | translate }}</span>\r\n        </a>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Search (language-aware direction maintained) -->\r\n    <div class=\"navbar-center\">\r\n      <div class=\"search-container\">\r\n        <svg class=\"search-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z\" />\r\n        </svg>\r\n        <input type=\"text\" [placeholder]=\"'adminNav.searchPlaceholder' | translate\" class=\"search-input\" />\n        <kbd class=\"search-shortcut\">\u2318K</kbd>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Notifications + User -->\r\n    <div class=\"navbar-right\">\r\n      <div class=\"relative\" (clickOutside)=\"isNotificationsOpen.set(false)\">\r\n        <button (click)=\"toggleNotifications()\" type=\"button\" class=\"icon-btn notification-btn\">\r\n          <svg class=\"icon-btn-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n            <path\r\n              stroke-linecap=\"round\"\r\n              stroke-linejoin=\"round\"\r\n              d=\"M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0\"\r\n            />\r\n          </svg>\r\n          @if (unreadCount() > 0) {\r\n            <span class=\"icon-badge\">{{ unreadCount() }}</span>\r\n          }\r\n        </button>\r\n\r\n        @if (isNotificationsOpen()) {\r\n          <div class=\"notifications-dropdown\">\r\n            <div class=\"notifications-header\">\r\n              <div class=\"notifications-title\">\r\n                <h3>{{ 'notifications.title' | translate }}</h3>\r\n                @if (unreadCount() > 0) {\r\n                  <span class=\"notifications-count\">{{ unreadCount() }}</span>\r\n                }\r\n              </div>\r\n              @if (unreadCount() > 0) {\r\n                <button (click)=\"markAllRead()\" class=\"mark-read-btn\">{{ 'notifications.markAllRead' | translate }}</button>\r\n              }\r\n            </div>\r\n\r\n            <ul class=\"notifications-list\">\r\n              @for (notification of recentNotifications(); track notification.id) {\r\n                <li class=\"notification-item\" [class.notification-item-unread]=\"!notification.read\">\r\n                  <div class=\"notification-icon-wrapper\">\r\n                    @if (notification.type === 'info') {\r\n                      <div class=\"notification-type-icon notification-type-info\">\r\n                        <svg class=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />\r\n                        </svg>\r\n                      </div>\r\n                    } @else if (notification.type === 'success') {\r\n                      <div class=\"notification-type-icon notification-type-success\">\r\n                        <svg class=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />\r\n                        </svg>\r\n                      </div>\r\n                    } @else if (notification.type === 'warning') {\r\n                      <div class=\"notification-type-icon notification-type-warning\">\r\n                        <svg class=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z\" />\r\n                        </svg>\r\n                      </div>\r\n                    } @else {\r\n                      <div class=\"notification-type-icon notification-type-error\">\r\n                        <svg class=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z\" />\r\n                        </svg>\r\n                      </div>\r\n                    }\r\n                  </div>\r\n\r\n                  <div class=\"notification-content\">\r\n                    <p class=\"notification-title\">{{ notification.title }}</p>\r\n                    <p class=\"notification-message\">{{ notification.message }}</p>\r\n                    <p class=\"notification-time\">{{ getTimeAgo(notification.timestamp) }}</p>\r\n                    @if (!notification.read) {\r\n                      <div class=\"notification-indicator\"></div>\r\n                    }\r\n                  </div>\r\n                </li>\r\n              } @empty {\r\n                <li class=\"notifications-empty\">\r\n                  <svg class=\"empty-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\r\n                    <path\r\n                      stroke-linecap=\"round\"\r\n                      stroke-linejoin=\"round\"\r\n                      stroke-width=\"1.5\"\r\n                      d=\"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9\"\r\n                    />\r\n                  </svg>\r\n                  <p>{{ 'notifications.noNotifications.subtitle' | translate }}</p>\r\n                </li>\r\n              }\r\n            </ul>\r\n\r\n            <div class=\"notifications-footer\">\r\n              <button (click)=\"viewAllNotifications()\" class=\"see-all-btn\">\r\n                <span>{{ 'notifications.seeAll' | translate }}</span>\r\n                @if (totalNotificationCount() > 10) {\r\n                  <span class=\"total-count\">{{ totalNotificationCount() }}</span>\r\n                }\r\n                <svg class=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2\" stroke=\"currentColor\">\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3\" />\r\n                </svg>\r\n              </button>\r\n            </div>\r\n          </div>\r\n        }\r\n      </div>\r\n\r\n      <button routerLink=\"/admin/chat\" type=\"button\" class=\"icon-btn messages-btn\">\r\n        <svg class=\"icon-btn-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z\" />\r\n        </svg>\r\n        @if (unreadMessageCount() > 0) {\r\n          <span class=\"icon-badge\">{{ unreadMessageCount() }}</span>\r\n        }\r\n      </button>\r\n\r\n      <!-- User Avatar -->\r\n      <div class=\"relative\" (clickOutside)=\"isUserMenuOpen.set(false)\">\r\n        <button (click)=\"toggleUserMenu()\" type=\"button\" class=\"user-menu-btn\">\r\n          @if (hasProfileImage()) {\r\n            <img class=\"user-avatar\" [src]=\"avatarUrl()\" alt=\"\" />\r\n          } @else {\r\n            <div class=\"user-avatar-initials\">{{ userInitials() }}</div>\r\n          }\r\n        </button>\r\n\r\n        @if (isUserMenuOpen()) {\r\n          <div class=\"user-dropdown\">\r\n            <div class=\"user-dropdown-header\">\r\n              @if (hasProfileImage()) {\r\n                <img class=\"dropdown-avatar\" [src]=\"avatarUrl()\" alt=\"\" />\r\n              } @else {\r\n                <div class=\"dropdown-avatar-initials\">{{ userInitials() }}</div>\r\n              }\r\n              <div class=\"dropdown-user-info\">\r\n                <span class=\"dropdown-user-name\">{{ userName() }}</span>\r\n                <span class=\"dropdown-user-email\">{{ userEmail() }}</span>\r\n              </div>\r\n            </div>\r\n\r\n            <div class=\"user-dropdown-divider\"></div>\r\n\r\n            <a routerLink=\"/admin/profile\" (click)=\"isUserMenuOpen.set(false)\" class=\"dropdown-item\">\r\n              <svg class=\"dropdown-item-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z\" />\r\n              </svg>\r\n              {{ 'adminNav.userMenu.profile' | translate }}\r\n            </a>\r\n\r\n            <a routerLink=\"/admin/settings\" (click)=\"isUserMenuOpen.set(false)\" class=\"dropdown-item\">\r\n              <svg class=\"dropdown-item-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 00-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 00-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z\" />\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" />\r\n              </svg>\r\n              {{ 'adminNav.userMenu.settings' | translate }}\r\n            </a>\r\n\r\n            <div class=\"user-dropdown-divider\"></div>\r\n\r\n            <button (click)=\"logout()\" class=\"dropdown-item dropdown-item-danger\">\r\n              <svg class=\"dropdown-item-icon\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75\" />\r\n              </svg>\r\n              {{ 'adminNav.logout' | translate }}\r\n            </button>\r\n          </div>\r\n        }\r\n      </div>\r\n    </div>\r\n  </div>\r\n</nav>\r\n\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n@use 'theme' as theme;\r\n\r\n// Premium Navbar Styles\r\n.premium-navbar {\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 1060;\r\n  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);\r\n  backdrop-filter: blur(20px);\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.3);\r\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);\r\n}\r\n\r\n.navbar-container {\r\n  max-width: 1800px;\r\n  margin: 0 auto;\r\n  padding: 0.5rem 0.875rem;\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 0.75rem;\n  min-width: 0;\n\n  @media (min-width: 768px) {\n    padding: 0.5rem 1.25rem;\n  }\n}\n\r\n// Left Section: Logo & Navigation\r\n.navbar-left {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\n  flex: 1;\n  min-width: 0;\n}\n\r\n// Logo Section\r\n.navbar-logo {\r\n  flex-shrink: 0;\r\n}\r\n\r\n.logo-link {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.5rem;\n  text-decoration: none;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    transform: scale(1.02);\r\n  }\r\n}\r\n\r\n.logo-icon {\r\n  width: 1.75rem;\n  height: 1.75rem;\n  color: #3b82f6;\r\n  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.3));\r\n}\r\n\r\n.logo-text {\r\n  font-size: 1rem;\n  font-weight: 700;\r\n  color: #ffffff;\r\n  letter-spacing: -0.02em;\r\n  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);\r\n  -webkit-background-clip: text;\r\n  -webkit-text-fill-color: transparent;\r\n  background-clip: text;\r\n}\r\n\r\n// Navigation Links\r\n.navbar-nav {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n  overflow-x: auto;\n  overflow-y: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n  min-width: 0;\n  padding: 0.125rem;\n\r\n  &::-webkit-scrollbar {\r\n    display: none;\r\n  }\r\n\r\n  @media (min-width: 1024px) {\n    gap: 0.25rem;\n  }\n}\n\r\n.nav-link {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.3125rem;\n  min-height: 2.125rem;\n  padding: 0.375rem 0.5625rem;\n  border-radius: 0.5rem;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #cbd5e1;\n  text-decoration: none;\r\n  white-space: nowrap;\r\n  transition: all 0.2s ease;\r\n  background: rgba(15, 23, 42, 0.2);\n  border: 1px solid transparent;\n  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.04);\n\r\n  &:hover {\r\n    color: #ffffff;\r\n    background: rgba(51, 65, 85, 0.72);\n    border-color: rgba(148, 163, 184, 0.18);\n  }\n\n  &.nav-link-active {\n    color: #eff6ff;\n    background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(14, 165, 233, 0.68));\n    border-color: rgba(147, 197, 253, 0.45);\n    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);\n  }\n\r\n  &.nav-link-secondary {\r\n    color: #64748b;\r\n\r\n    &:hover {\r\n      color: #94a3b8;\r\n    }\r\n  }\r\n}\r\n\r\n.nav-link-icon {\r\n  width: 0.9375rem;\n  height: 0.9375rem;\n  flex-shrink: 0;\r\n}\r\n\r\n.nav-divider {\r\n  width: 1px;\r\n  height: 1.25rem;\r\n  background: rgba(71, 85, 105, 0.5);\r\n  margin: 0 0.375rem;\r\n  flex-shrink: 0;\r\n}\r\n\r\n// Center Section: Search Bar\r\n.navbar-center {\n  flex: 0 1 260px;\n  max-width: 260px;\n\n  @media (max-width: 1280px) {\n    display: none;\n  }\n}\n\r\n// Right Section\r\n.navbar-right {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.5rem;\n  flex-shrink: 0;\r\n}\r\n\r\n// Professional Search\r\n.search-container {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  width: 100%;\r\n  max-width: 260px;\n  background: rgba(255, 255, 255, 0.05);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-radius: 0.625rem;\r\n  padding: 0.5rem 0.875rem;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.08);\r\n    border-color: rgba(255, 255, 255, 0.15);\r\n  }\r\n\r\n  &:focus-within {\r\n    background: rgba(255, 255, 255, 0.1);\r\n    border-color: rgba(59, 130, 246, 0.5);\r\n    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\r\n  }\r\n\r\n}\n\r\n.search-icon {\r\n  width: 1rem;\r\n  height: 1rem;\r\n  color: #64748b;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.search-input {\r\n  flex: 1;\r\n  border: none;\r\n  background: transparent;\r\n  color: #ffffff;\r\n  font-size: 0.8125rem;\r\n  font-weight: 400;\r\n  outline: none;\r\n  padding: 0 0.5rem;\r\n\r\n  &::placeholder {\r\n    color: #64748b;\r\n  }\r\n}\r\n\r\n.search-shortcut {\r\n  display: flex;\r\n  align-items: center;\r\n  padding: 0.1875rem 0.4375rem;\r\n  background: rgba(255, 255, 255, 0.1);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-radius: 0.3125rem;\r\n  font-size: 0.6875rem;\r\n  font-weight: 500;\r\n  color: #94a3b8;\r\n  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;\r\n}\r\n\r\n// Icon Buttons (Notifications, Messages)\r\n.icon-btn {\r\n  position: relative;\r\n  width: 2rem;\r\n  height: 2rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: rgba(255, 255, 255, 0.05);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-radius: 0.5rem;\r\n  color: #94a3b8;\r\n  cursor: pointer;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.1);\r\n    color: #ffffff;\r\n  }\r\n}\r\n\r\n.icon-btn-icon {\r\n  width: 1.125rem;\r\n  height: 1.125rem;\r\n}\r\n\r\n.icon-badge {\r\n  position: absolute;\r\n  top: -0.1875rem;\r\n  right: -0.1875rem;\r\n  min-width: 1rem;\r\n  height: 1rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0 0.3125rem;\r\n  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);\r\n  color: #ffffff;\r\n  font-size: 0.625rem;\r\n  font-weight: 700;\r\n  border-radius: 9999px;\r\n  border: 2px solid rgba(15, 23, 42, 0.95);\r\n  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);\r\n}\r\n\r\n.notifications-dropdown {\r\n  position: absolute;\r\n  top: calc(100% + 0.75rem);\r\n  right: 0;\r\n  width: 24rem;\r\n  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);\r\n  border: 1px solid rgba(71, 85, 105, 0.5);\r\n  border-radius: 1rem;\r\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);\r\n  overflow: hidden;\r\n  backdrop-filter: blur(20px);\r\n}\r\n\r\n.notifications-header {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  padding: 1rem 1.25rem;\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.3);\r\n  background: rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.notifications-title {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.5rem;\r\n\r\n  h3 {\r\n    font-size: 0.9375rem;\r\n    font-weight: 600;\r\n    color: #ffffff;\r\n    margin: 0;\r\n  }\r\n}\r\n\r\n.notifications-count {\r\n  display: flex;\r\n  align-items: center;\r\n  padding: 0.125rem 0.5rem;\r\n  background: rgba(59, 130, 246, 0.2);\r\n  color: #3b82f6;\r\n  border: 1px solid rgba(59, 130, 246, 0.3);\r\n  border-radius: 9999px;\r\n  font-size: 0.6875rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.mark-read-btn {\r\n  padding: 0.375rem 0.75rem;\r\n  background: transparent;\r\n  border: none;\r\n  color: #3b82f6;\r\n  font-size: 0.75rem;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: color 0.2s ease;\r\n\r\n  &:hover {\r\n    color: #60a5fa;\r\n  }\r\n}\r\n\r\n.notifications-list {\r\n  max-height: 24rem;\r\n  overflow-y: auto;\r\n  list-style: none;\r\n  margin: 0;\r\n  padding: 0;\r\n\r\n  &::-webkit-scrollbar {\r\n    width: 0.375rem;\r\n  }\r\n\r\n  &::-webkit-scrollbar-track {\r\n    background: rgba(71, 85, 105, 0.2);\r\n  }\r\n\r\n  &::-webkit-scrollbar-thumb {\r\n    background: rgba(71, 85, 105, 0.5);\r\n    border-radius: 0.1875rem;\r\n  }\r\n}\r\n\r\n.notification-item {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.75rem;\r\n  padding: 1rem 1.25rem;\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.2);\r\n  transition: background 0.2s ease;\r\n  cursor: pointer;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.03);\r\n  }\r\n\r\n  &:last-child {\r\n    border-bottom: none;\r\n  }\r\n\r\n  &.notification-item-unread {\r\n    background: rgba(59, 130, 246, 0.05);\r\n  }\r\n}\r\n\r\n.notification-icon-wrapper {\r\n  flex-shrink: 0;\r\n}\r\n\r\n.notification-type-icon {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 0.5rem;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n\r\n  &.notification-type-info {\r\n    background: rgba(59, 130, 246, 0.2);\r\n    color: #3b82f6;\r\n  }\r\n\r\n  &.notification-type-success {\r\n    background: rgba(16, 185, 129, 0.2);\r\n    color: #10b981;\r\n  }\r\n\r\n  &.notification-type-warning {\r\n    background: rgba(245, 158, 11, 0.2);\r\n    color: #f59e0b;\r\n  }\r\n\r\n  &.notification-type-error {\r\n    background: rgba(239, 68, 68, 0.2);\r\n    color: #ef4444;\r\n  }\r\n}\r\n\r\n.notification-content {\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.notification-title {\r\n  font-size: 0.875rem;\r\n  font-weight: 600;\r\n  color: #ffffff;\r\n  margin: 0 0 0.25rem 0;\r\n}\r\n\r\n.notification-message {\r\n  font-size: 0.75rem;\r\n  color: #94a3b8;\r\n  margin: 0 0 0.25rem 0;\r\n  line-height: 1.4;\r\n}\r\n\r\n.notification-time {\r\n  font-size: 0.6875rem;\r\n  color: #64748b;\r\n  margin: 0;\r\n}\r\n\r\n.notification-indicator {\r\n  width: 0.5rem;\r\n  height: 0.5rem;\r\n  background: #3b82f6;\r\n  border-radius: 50%;\r\n  flex-shrink: 0;\r\n  margin-top: 0.25rem;\r\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);\r\n}\r\n\r\n.notifications-empty {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 3rem 1.25rem;\r\n  text-align: center;\r\n}\r\n\r\n.empty-icon {\r\n  width: 2.5rem;\r\n  height: 2.5rem;\r\n  color: #475569;\r\n  margin-bottom: 0.75rem;\r\n}\r\n\r\n.notifications-empty p {\r\n  font-size: 0.875rem;\r\n  color: #64748b;\r\n  margin: 0;\r\n}\r\n\r\n.notifications-footer {\r\n  padding: 0.75rem 1.25rem;\r\n  border-top: 1px solid rgba(71, 85, 105, 0.3);\r\n  background: rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.see-all-btn {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 0.5rem;\r\n  width: 100%;\r\n  padding: 0.75rem;\r\n  background: transparent;\r\n  border: none;\r\n  color: #3b82f6;\r\n  font-size: 0.875rem;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: all 0.2s ease;\r\n  border-radius: 0.5rem;\r\n\r\n  &:hover {\r\n    background: rgba(59, 130, 246, 0.1);\r\n  }\r\n}\r\n\r\n.total-count {\r\n  padding: 0.125rem 0.5rem;\r\n  background: rgba(71, 85, 105, 0.5);\r\n  color: #94a3b8;\r\n  border-radius: 9999px;\r\n  font-size: 0.6875rem;\r\n  font-weight: 700;\r\n}\r\n\r\n// User Menu\r\n.user-menu-btn {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0;\r\n  background: transparent;\r\n  border: none;\r\n  cursor: pointer;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    transform: scale(1.05);\r\n  }\r\n}\r\n\r\n.user-avatar {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 50%;\r\n  object-fit: cover;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.user-avatar-initials {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\r\n  color: #ffffff;\r\n  font-size: 0.75rem;\r\n  font-weight: 700;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.user-dropdown {\r\n  position: absolute;\r\n  top: calc(100% + 0.75rem);\r\n  right: 0;\r\n  width: 16rem;\r\n  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);\r\n  border: 1px solid rgba(71, 85, 105, 0.5);\r\n  border-radius: 1rem;\r\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);\r\n  overflow: hidden;\r\n  backdrop-filter: blur(20px);\r\n}\r\n\r\n.user-dropdown-header {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n  padding: 1rem 1.25rem;\r\n  border-bottom: 1px solid rgba(71, 85, 105, 0.3);\r\n  background: rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.dropdown-avatar {\r\n  width: 2.25rem;\r\n  height: 2.25rem;\r\n  border-radius: 50%;\r\n  object-fit: cover;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.dropdown-avatar-initials {\r\n  width: 2.25rem;\r\n  height: 2.25rem;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\r\n  color: #ffffff;\r\n  font-size: 0.875rem;\r\n  font-weight: 700;\r\n  border: 2px solid rgba(59, 130, 246, 0.3);\r\n}\r\n\r\n.dropdown-user-info {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.dropdown-user-name {\r\n  font-size: 0.875rem;\r\n  font-weight: 600;\r\n  color: #ffffff;\r\n  line-height: 1.2;\r\n}\r\n\r\n.dropdown-user-email {\r\n  font-size: 0.75rem;\r\n  color: #94a3b8;\r\n  line-height: 1.2;\r\n}\r\n\r\n.user-dropdown-divider {\r\n  height: 1px;\r\n  background: rgba(71, 85, 105, 0.3);\r\n  margin: 0;\r\n}\r\n\r\n.dropdown-item {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n  padding: 0.875rem 1.25rem;\r\n  color: #e2e8f0;\r\n  text-decoration: none;\r\n  font-size: 0.875rem;\r\n  font-weight: 500;\r\n  transition: all 0.2s ease;\r\n\r\n  &:hover {\r\n    background: rgba(255, 255, 255, 0.05);\r\n    color: #ffffff;\r\n  }\r\n\r\n  &.dropdown-item-danger {\r\n    color: #ef4444;\r\n\r\n    &:hover {\r\n      background: rgba(239, 68, 68, 0.1);\r\n      color: #f87171;\r\n    }\r\n  }\r\n}\r\n\r\n.dropdown-item-icon {\r\n  width: 1.125rem;\r\n  height: 1.125rem;\r\n  flex-shrink: 0;\r\n}\r\n\r\n// Responsive adjustments\r\n@media (max-width: 768px) {\n  .navbar-container {\n    padding: 0.625rem 0.75rem;\n    gap: 0.5rem;\n  }\n\n  .logo-text {\n    display: none;\n  }\n\r\n  .navbar-nav {\r\n    gap: 0.125rem;\r\n  }\r\n\r\n  .nav-link {\n    padding: 0.4375rem 0.5625rem;\n    font-size: 0.75rem;\n\r\n    span {\r\n      @media (max-width: 640px) {\r\n        display: none;\r\n      }\r\n    }\r\n  }\r\n\r\n  .navbar-right {\r\n    gap: 0.5rem;\r\n  }\n}\n\n:host-context(body.investa-theme-light) {\n  .premium-navbar {\n    background: rgba(255, 255, 255, 0.94);\n    border-bottom-color: var(--investa-border, #dedede);\n    box-shadow: 0 1px 2px rgba(21, 22, 25, 0.05);\n  }\n\n  .logo-icon {\n    color: var(--investa-accent, #22c532);\n    filter: none;\n  }\n\n  .logo-text {\n    color: var(--investa-text-primary, #212225);\n    background: none;\n    -webkit-text-fill-color: currentColor;\n  }\n\n  .nav-link {\n    color: var(--investa-text-secondary, #66686b);\n    background: transparent;\n    border-color: transparent;\n    box-shadow: none;\n\n    &:hover {\n      color: var(--investa-text-primary, #212225);\n      background: var(--investa-surface-2, #f7f7f7);\n      border-color: var(--investa-border, #dedede);\n    }\n\n    &.nav-link-active {\n      color: var(--investa-text-primary, #212225);\n      background: var(--investa-surface-2, #f7f7f7);\n      border-color: var(--investa-border, #dedede);\n      box-shadow: inset 0 -3px 0 var(--investa-accent, #22c532);\n    }\n\n    &.nav-link-secondary {\n      color: var(--investa-text-muted, #7b7d80);\n\n      &:hover {\n        color: var(--investa-text-primary, #212225);\n      }\n    }\n  }\n\n  .nav-divider {\n    background: var(--investa-border, #dedede);\n  }\n\n  .search-container,\n  .icon-btn {\n    background: var(--investa-surface-2, #f7f7f7);\n    border-color: var(--investa-border, #dedede);\n    color: var(--investa-text-secondary, #66686b);\n\n    &:hover {\n      background: var(--investa-surface, #ffffff);\n      border-color: var(--investa-border-strong, #cfcfcf);\n      color: var(--investa-text-primary, #212225);\n    }\n  }\n\n  .search-container:focus-within {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-accent, #22c532);\n    box-shadow: 0 0 0 3px rgba(34, 197, 50, 0.14);\n  }\n\n  .search-icon,\n  .search-shortcut {\n    color: var(--investa-text-muted, #7b7d80);\n  }\n\n  .search-input {\n    color: var(--investa-text-primary, #212225);\n\n    &::placeholder {\n      color: var(--investa-text-muted, #7b7d80);\n    }\n  }\n\n  .search-shortcut {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .icon-badge {\n    border-color: var(--investa-surface, #ffffff);\n  }\n\n  .notifications-dropdown,\n  .user-dropdown {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n    box-shadow: 0 18px 38px rgba(21, 22, 25, 0.12);\n  }\n\n  .notifications-header,\n  .notifications-footer,\n  .user-dropdown-header {\n    background: var(--investa-surface-2, #f7f7f7);\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .notifications-title h3,\n  .notification-title,\n  .dropdown-user-name {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .notification-message,\n  .notification-time,\n  .notifications-empty p,\n  .dropdown-user-email {\n    color: var(--investa-text-secondary, #66686b);\n  }\n\n  .notifications-count,\n  .see-all-btn,\n  .mark-read-btn {\n    color: var(--investa-brand-700, #158322);\n  }\n\n  .notifications-count {\n    background: var(--investa-brand-50, rgba(34, 197, 50, 0.1));\n    border-color: var(--investa-brand-200, rgba(34, 197, 50, 0.22));\n  }\n\n  .notification-item {\n    border-color: var(--investa-border, #dedede);\n\n    &:hover,\n    &.notification-item-unread {\n      background: var(--investa-surface-2, #f7f7f7);\n    }\n  }\n\n  .notification-indicator {\n    background: var(--investa-accent, #22c532);\n    box-shadow: 0 0 8px rgba(34, 197, 50, 0.35);\n  }\n\n  .user-avatar,\n  .dropdown-avatar {\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .user-avatar-initials,\n  .dropdown-avatar-initials {\n    background: var(--investa-primary, #212225);\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .user-dropdown-divider {\n    background: var(--investa-border, #dedede);\n  }\n\n  .dropdown-item {\n    color: var(--investa-text-secondary, #66686b);\n\n    &:hover {\n      background: var(--investa-surface-2, #f7f7f7);\n      color: var(--investa-text-primary, #212225);\n    }\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminNavbarComponent, { className: "AdminNavbarComponent", filePath: "src/app/components/admin-navbar/admin-navbar.component.ts", lineNumber: 37 }); })();
