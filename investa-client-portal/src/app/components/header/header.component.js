import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiService } from '../../services/ui.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FileStoreService } from '../../services/file-store.service';
import { SettingsService } from '../../services/settings.service';
import { ThemePreference } from '../../models/settings.model';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.key;
const _forTrack1 = ($index, $item) => $item.label;
function HeaderComponent_For_13_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 20);
    i0.ɵɵlistener("click", function HeaderComponent_For_13_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const link_r3 = ctx.$implicit;
    i0.ɵɵproperty("routerLink", link_r3.routerLink);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "header.nav." + link_r3.key));
} }
function HeaderComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 15);
    i0.ɵɵelement(1, "path", 21);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 15);
    i0.ɵɵelement(1, "circle", 22)(2, "line", 23)(3, "line", 24)(4, "line", 25)(5, "line", 26)(6, "line", 27)(7, "line", 28)(8, "line", 29)(9, "line", 30);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 31);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_21_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openLoginModal($event)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 32);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_21_Template_a_click_3_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "header.login"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 4, "header.signup"), " ");
} }
function HeaderComponent_Conditional_22_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 37);
    i0.ɵɵlistener("error", function HeaderComponent_Conditional_22_Conditional_2_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onImageError()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r1.userAvatarUrl(), i0.ɵɵsanitizeUrl)("alt", ctx_r1.userDisplayName());
} }
function HeaderComponent_Conditional_22_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.userInitials());
} }
function HeaderComponent_Conditional_22_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 39);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_22_Conditional_4_For_2_Template_button_click_0_listener() { const item_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.handleUserMenuItemClick(item_r8)); });
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r8 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r8.label);
} }
function HeaderComponent_Conditional_22_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 36);
    i0.ɵɵrepeaterCreate(1, HeaderComponent_Conditional_22_Conditional_4_For_2_Template, 3, 1, "button", 38, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.userMenuItems());
} }
function HeaderComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "button", 33);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_22_Template_button_click_1_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleUserMenu($event)); });
    i0.ɵɵconditionalCreate(2, HeaderComponent_Conditional_22_Conditional_2_Template, 1, 2, "img", 34)(3, HeaderComponent_Conditional_22_Conditional_3_Template, 2, 1, "div", 35);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, HeaderComponent_Conditional_22_Conditional_4_Template, 3, 0, "div", 36);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.userAvatarUrl() && !ctx_r1.imageLoadFailed() ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isUserMenuOpen() ? 4 : -1);
} }
function HeaderComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 18);
    i0.ɵɵelement(1, "line", 40)(2, "line", 41)(3, "line", 42);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 18);
    i0.ɵɵelement(1, "line", 43)(2, "line", 44);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_26_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 48);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_26_For_2_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const link_r10 = ctx.$implicit;
    i0.ɵɵproperty("routerLink", link_r10.routerLink);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "header.nav." + link_r10.key));
} }
function HeaderComponent_Conditional_26_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 49);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_26_Conditional_4_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openLoginModal($event); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 50);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_26_Conditional_4_Template_a_click_3_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "header.login"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "header.signup"));
} }
function HeaderComponent_Conditional_26_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 51);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_26_Conditional_5_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1, "My Office");
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19);
    i0.ɵɵrepeaterCreate(1, HeaderComponent_Conditional_26_For_2_Template, 3, 4, "a", 45, _forTrack0);
    i0.ɵɵelement(3, "hr", 46);
    i0.ɵɵconditionalCreate(4, HeaderComponent_Conditional_26_Conditional_4_Template, 6, 6)(5, HeaderComponent_Conditional_26_Conditional_5_Template, 2, 0, "a", 47);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.navLinks());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r1.isAuthenticated() ? 4 : 5);
} }
export class HeaderComponent {
    constructor() {
        this.languageService = inject(LanguageService);
        this.uiService = inject(UiService);
        this.authService = inject(AuthService);
        this.userService = inject(UserService);
        this.fileStoreService = inject(FileStoreService);
        this.settingsService = inject(SettingsService);
        this.router = inject(Router);
        this.document = inject(DOCUMENT);
        this.navLinks = signal([
            { label: 'Explore Opportunities', key: 'explore', routerLink: '/admin/investments' },
            { label: 'How It Works', key: 'how', routerLink: '/about' },
        ], ...(ngDevMode ? [{ debugName: "navLinks" }] : []));
        this.isMobileMenuOpen = signal(false, ...(ngDevMode ? [{ debugName: "isMobileMenuOpen" }] : []));
        this.isUserMenuOpen = signal(false, ...(ngDevMode ? [{ debugName: "isUserMenuOpen" }] : []));
        this.userMenuItems = signal([
            { label: 'Profile', routerLink: '/admin/profile' },
            { label: 'Settings', routerLink: '/admin/settings' },
            { label: 'Logout', action: 'logout' }
        ], ...(ngDevMode ? [{ debugName: "userMenuItems" }] : []));
        this.isAuthenticated = this.authService.isAuthenticated;
        this.user = this.userService.user;
        this.userDisplayName = computed(() => {
            const currentUser = this.user();
            return currentUser?.name || 'User';
        }, ...(ngDevMode ? [{ debugName: "userDisplayName" }] : []));
        this.userInitials = computed(() => {
            const name = this.userDisplayName();
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.slice(0, 2).toUpperCase();
        }, ...(ngDevMode ? [{ debugName: "userInitials" }] : []));
        this.userAvatarUrl = computed(() => {
            const currentUser = this.user();
            if (currentUser?.profileImageUrl) {
                return this.fileStoreService.getPublicUrl(currentUser.profileImageUrl);
            }
            return null;
        }, ...(ngDevMode ? [{ debugName: "userAvatarUrl" }] : []));
        this.imageLoadFailed = signal(false, ...(ngDevMode ? [{ debugName: "imageLoadFailed" }] : []));
        this.isDarkTheme = computed(() => {
            const pref = this.settingsService.theme();
            if (pref === ThemePreference.Dark)
                return true;
            if (pref === ThemePreference.Light)
                return false;
            return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
        }, ...(ngDevMode ? [{ debugName: "isDarkTheme" }] : []));
        this.document.addEventListener('click', this.onClickOutside.bind(this));
    }
    ngOnDestroy() {
        this.document.removeEventListener('click', this.onClickOutside.bind(this));
    }
    onClickOutside(event) {
        if (this.isUserMenuOpen()) {
            const target = event.target;
            const userMenuElement = this.document.querySelector('.user-menu-container');
            if (userMenuElement && !userMenuElement.contains(target)) {
                this.closeUserMenu();
            }
        }
    }
    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }
    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }
    openLoginModal(event) {
        event.preventDefault();
        this.uiService.openRoleSelectModal();
    }
    toggleLanguage(event) {
        event.preventDefault();
        this.languageService.toggleLanguage();
    }
    toggleTheme(event) {
        event.preventDefault();
        const current = this.settingsService.theme();
        if (current === ThemePreference.Dark) {
            this.settingsService.setTheme(ThemePreference.Light);
        }
        else {
            this.settingsService.setTheme(ThemePreference.Dark);
        }
    }
    navigateToMyOffice() {
        this.router.navigate(['/admin/dashboard']);
    }
    toggleUserMenu(event) {
        event.preventDefault();
        event.stopPropagation();
        this.isUserMenuOpen.update(open => !open);
    }
    closeUserMenu() {
        this.isUserMenuOpen.set(false);
    }
    handleUserMenuItemClick(item) {
        this.closeUserMenu();
        if (item.action === 'logout') {
            this.authService.logout();
            this.router.navigate(['/']);
        }
        else if (item.routerLink) {
            this.router.navigate([item.routerLink]);
        }
    }
    onImageError() {
        this.imageLoadFailed.set(true);
    }
    static { this.ɵfac = function HeaderComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HeaderComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HeaderComponent, selectors: [["app-header"]], decls: 27, vars: 7, consts: [[1, "header-bar"], [1, "header-inner"], ["routerLink", "/", 1, "header-logo"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round", 1, "header-logo-icon"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l-1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "header-logo-text"], [1, "header-nav"], [1, "header-nav-link", 3, "routerLink"], [1, "header-actions"], ["title", "Toggle language", 1, "header-action-btn", 3, "click"], ["title", "Toggle theme", 1, "header-action-btn", 3, "click"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "relative", "user-menu-container"], ["aria-label", "Menu", 1, "header-mobile-btn", 3, "click"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "header-mobile-menu"], [1, "header-nav-link", 3, "click", "routerLink"], ["d", "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"], ["cx", "12", "cy", "12", "r", "5"], ["x1", "12", "y1", "1", "x2", "12", "y2", "3"], ["x1", "12", "y1", "21", "x2", "12", "y2", "23"], ["x1", "4.22", "y1", "4.22", "x2", "5.64", "y2", "5.64"], ["x1", "18.36", "y1", "18.36", "x2", "19.78", "y2", "19.78"], ["x1", "1", "y1", "12", "x2", "3", "y2", "12"], ["x1", "21", "y1", "12", "x2", "23", "y2", "12"], ["x1", "4.22", "y1", "19.78", "x2", "5.64", "y2", "18.36"], ["x1", "18.36", "y1", "5.64", "x2", "19.78", "y2", "4.22"], ["href", "#", 1, "header-login-link", 3, "click"], ["routerLink", "/signup", 1, "header-signup-btn", 3, "click"], [1, "header-avatar-btn", 3, "click"], [1, "header-avatar-img", 3, "src", "alt"], [1, "header-avatar-fallback"], [1, "header-dropdown"], [1, "header-avatar-img", 3, "error", "src", "alt"], [1, "header-dropdown-item"], [1, "header-dropdown-item", 3, "click"], ["x1", "3", "y1", "12", "x2", "21", "y2", "12"], ["x1", "3", "y1", "6", "x2", "21", "y2", "6"], ["x1", "3", "y1", "18", "x2", "21", "y2", "18"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18"], [1, "header-mobile-link", 3, "routerLink"], [1, "header-mobile-divider"], ["routerLink", "/admin/dashboard", 1, "header-mobile-link"], [1, "header-mobile-link", 3, "click", "routerLink"], ["href", "#", 1, "header-mobile-link", 3, "click"], ["routerLink", "/signup", 1, "header-mobile-link", "header-mobile-signup", 3, "click"], ["routerLink", "/admin/dashboard", 1, "header-mobile-link", 3, "click"]], template: function HeaderComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "header", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(3, "svg", 3);
            i0.ɵɵelement(4, "path", 4)(5, "path", 5)(6, "path", 6)(7, "path", 7)(8, "path", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(9, "span", 9);
            i0.ɵɵtext(10, "Investa");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "nav", 10);
            i0.ɵɵrepeaterCreate(12, HeaderComponent_For_13_Template, 3, 4, "a", 11, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "div", 12)(15, "button", 13);
            i0.ɵɵlistener("click", function HeaderComponent_Template_button_click_15_listener($event) { return ctx.toggleLanguage($event); });
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "button", 14);
            i0.ɵɵlistener("click", function HeaderComponent_Template_button_click_18_listener($event) { return ctx.toggleTheme($event); });
            i0.ɵɵconditionalCreate(19, HeaderComponent_Conditional_19_Template, 2, 0, ":svg:svg", 15)(20, HeaderComponent_Conditional_20_Template, 10, 0, ":svg:svg", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(21, HeaderComponent_Conditional_21_Template, 6, 6)(22, HeaderComponent_Conditional_22_Template, 5, 2, "div", 16);
            i0.ɵɵelementStart(23, "button", 17);
            i0.ɵɵlistener("click", function HeaderComponent_Template_button_click_23_listener() { return ctx.toggleMobileMenu(); });
            i0.ɵɵconditionalCreate(24, HeaderComponent_Conditional_24_Template, 4, 0, ":svg:svg", 18)(25, HeaderComponent_Conditional_25_Template, 3, 0, ":svg:svg", 18);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(26, HeaderComponent_Conditional_26_Template, 6, 1, "div", 19);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(12);
            i0.ɵɵrepeater(ctx.navLinks());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 5, "language.toggle"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.isDarkTheme() ? 19 : 20);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.isAuthenticated() ? 21 : 22);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.isMobileMenuOpen() ? 24 : 25);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isMobileMenuOpen() ? 26 : -1);
        } }, dependencies: [CommonModule, RouterLink, TranslatePipe], styles: ["@use 'variables' as *;\n\n.header-bar[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  z-index: 1060;\n  background: rgba(15, 16, 18, 0.75);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n}\n\nbody.investa-theme-light[_nghost-%COMP%]   .header-bar[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .header-bar[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.8);\n}\n\n.header-inner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: min(100%, 1280px);\n  margin-inline: auto;\n  padding: 0 32px;\n  height: 60px;\n}\n\n.header-logo[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  text-decoration: none;\n  flex-shrink: 0;\n}\n\n.header-logo-icon[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n  color: var(--investa-accent);\n}\n\n.header-logo-text[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 800;\n  color: var(--investa-text-primary);\n  letter-spacing: -0.03em;\n}\n\n.header-nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n\n.header-nav-link[_ngcontent-%COMP%] {\n  padding: 6px 14px;\n  font-size: 0.8125rem;\n  font-weight: 500;\n  color: var(--investa-text-secondary);\n  text-decoration: none;\n  border-radius: 8px;\n  transition: color 150ms ease;\n  white-space: nowrap;\n}\n\n.header-nav-link[_ngcontent-%COMP%]:hover {\n  color: var(--investa-text-primary);\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n\n.header-action-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  background: transparent;\n  color: var(--investa-text-secondary);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-decoration: none;\n  transition: color 150ms ease, background-color 150ms ease;\n}\n\n.header-action-btn[_ngcontent-%COMP%]:hover {\n  color: var(--investa-text-primary);\n  background: rgba(255, 255, 255, 0.06);\n}\n\nbody.investa-theme-light[_nghost-%COMP%]   .header-action-btn[_ngcontent-%COMP%]:hover, body.investa-theme-light   [_nghost-%COMP%]   .header-action-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(0, 0, 0, 0.05);\n}\n\n.header-login-link[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0 14px;\n  min-height: 32px;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--investa-text-secondary);\n  text-decoration: none;\n  border-radius: 8px;\n  transition: color 150ms ease;\n}\n\n.header-login-link[_ngcontent-%COMP%]:hover {\n  color: var(--investa-text-primary);\n}\n\n.header-signup-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 34px;\n  padding: 0 20px;\n  background: var(--investa-accent);\n  color: #ffffff;\n  font-weight: 700;\n  font-size: 0.8125rem;\n  border: none;\n  border-radius: 10px;\n  text-decoration: none;\n  cursor: pointer;\n  transition: background-color 160ms ease, box-shadow 160ms ease;\n}\n\n.header-signup-btn[_ngcontent-%COMP%]:hover {\n  background: var(--investa-accent-hover);\n  box-shadow: 0 4px 16px rgba(34, 197, 50, 0.3);\n}\n\n.header-mobile-btn[_ngcontent-%COMP%] {\n  display: none;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  background: transparent;\n  color: var(--investa-text-secondary);\n  cursor: pointer;\n  border-radius: 8px;\n}\n\n.header-mobile-btn[_ngcontent-%COMP%]:hover {\n  color: var(--investa-text-primary);\n}\n\n.header-avatar-btn[_ngcontent-%COMP%] {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  border: 2px solid var(--investa-border);\n  overflow: hidden;\n  cursor: pointer;\n  padding: 0;\n  background: transparent;\n  transition: border-color 150ms ease;\n}\n\n.header-avatar-btn[_ngcontent-%COMP%]:hover {\n  border-color: var(--investa-accent);\n}\n\n.header-avatar-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.header-avatar-fallback[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--investa-accent);\n  color: #ffffff;\n  font-size: 0.6875rem;\n  font-weight: 700;\n}\n\n.header-dropdown[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n  top: calc(100% + 6px);\n  min-width: 170px;\n  background: var(--investa-surface);\n  border: 1px solid var(--investa-border);\n  border-radius: 12px;\n  box-shadow: var(--investa-shadow-md);\n  padding: 6px;\n  z-index: 50;\n}\n\n.header-dropdown-item[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  padding: 8px 14px;\n  text-align: left;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--investa-text-primary);\n  background: transparent;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: background-color 150ms ease;\n}\n\n.header-dropdown-item[_ngcontent-%COMP%]:hover {\n  background: var(--investa-surface-2);\n}\n\n.header-mobile-menu[_ngcontent-%COMP%] {\n  display: none;\n  padding: 8px 24px 16px;\n  border-top: 1px solid var(--investa-border);\n  background: rgba(15, 16, 18, 0.98);\n}\n\nbody.investa-theme-light[_nghost-%COMP%]   .header-mobile-menu[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .header-mobile-menu[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.98);\n}\n\n.header-mobile-link[_ngcontent-%COMP%] {\n  display: block;\n  padding: 10px 0;\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--investa-text-primary);\n  text-decoration: none;\n}\n\n.header-mobile-link[_ngcontent-%COMP%]:hover {\n  color: var(--investa-accent);\n}\n\n.header-mobile-signup[_ngcontent-%COMP%] {\n  color: var(--investa-accent);\n}\n\n.header-mobile-divider[_ngcontent-%COMP%] {\n  border: none;\n  border-top: 1px solid var(--investa-border);\n  margin: 8px 0;\n}\n\n@media (max-width: 900px) {\n  .header-nav[_ngcontent-%COMP%] {\n    display: none;\n  }\n\n  .header-mobile-btn[_ngcontent-%COMP%] {\n    display: flex;\n  }\n\n  .header-mobile-menu[_ngcontent-%COMP%] {\n    display: block;\n  }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HeaderComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-header', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, TranslatePipe], template: "<header class=\"header-bar\">\n  <div class=\"header-inner\">\n    <a routerLink=\"/\" class=\"header-logo\">\n      <svg class=\"header-logo-icon\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\n        <path d=\"M14 16.75l-1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\n        <path d=\"M10 14l2 -2l2 -2\"></path>\n        <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\n        <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\n      </svg>\n      <span class=\"header-logo-text\">Investa</span>\n    </a>\n\n    <nav class=\"header-nav\">\n      @for(link of navLinks(); track link.key) {\n        <a [routerLink]=\"link.routerLink\" class=\"header-nav-link\" (click)=\"closeMobileMenu()\">{{ 'header.nav.' + link.key | translate }}</a>\n      }\n    </nav>\n\n    <div class=\"header-actions\">\n      <button (click)=\"toggleLanguage($event)\" class=\"header-action-btn\" title=\"Toggle language\">\n        {{ 'language.toggle' | translate }}\n      </button>\n\n      <button (click)=\"toggleTheme($event)\" class=\"header-action-btn\" title=\"Toggle theme\">\n        @if (isDarkTheme()) {\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg>\n        } @else {\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"/><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"/><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"/><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"/></svg>\n        }\n      </button>\n\n      @if (!isAuthenticated()) {\n        <a href=\"#\" (click)=\"openLoginModal($event)\" class=\"header-login-link\">\n          {{ 'header.login' | translate }}\n        </a>\n\n        <a routerLink=\"/signup\" class=\"header-signup-btn\" (click)=\"closeMobileMenu()\">\n          {{ 'header.signup' | translate }}\n        </a>\n      } @else {\n        <div class=\"relative user-menu-container\">\n          <button (click)=\"toggleUserMenu($event)\" class=\"header-avatar-btn\">\n            @if (userAvatarUrl() && !imageLoadFailed()) {\n              <img [src]=\"userAvatarUrl()\" [alt]=\"userDisplayName()\" (error)=\"onImageError()\" class=\"header-avatar-img\">\n            } @else {\n              <div class=\"header-avatar-fallback\">{{ userInitials() }}</div>\n            }\n          </button>\n\n          @if (isUserMenuOpen()) {\n            <div class=\"header-dropdown\">\n              @for (item of userMenuItems(); track item.label) {\n                <button (click)=\"handleUserMenuItemClick(item)\" class=\"header-dropdown-item\">\n                  <span>{{ item.label }}</span>\n                </button>\n              }\n            </div>\n          }\n        </div>\n      }\n\n      <button (click)=\"toggleMobileMenu()\" class=\"header-mobile-btn\" aria-label=\"Menu\">\n        @if (!isMobileMenuOpen()) {\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/></svg>\n        } @else {\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n        }\n      </button>\n    </div>\n  </div>\n\n  @if (isMobileMenuOpen()) {\n    <div class=\"header-mobile-menu\">\n      @for(link of navLinks(); track link.key) {\n        <a [routerLink]=\"link.routerLink\" class=\"header-mobile-link\" (click)=\"closeMobileMenu()\">{{ 'header.nav.' + link.key | translate }}</a>\n      }\n      <hr class=\"header-mobile-divider\">\n      @if (!isAuthenticated()) {\n        <a href=\"#\" (click)=\"openLoginModal($event); closeMobileMenu()\" class=\"header-mobile-link\">{{ 'header.login' | translate }}</a>\n        <a routerLink=\"/signup\" class=\"header-mobile-link header-mobile-signup\" (click)=\"closeMobileMenu()\">{{ 'header.signup' | translate }}</a>\n      } @else {\n        <a routerLink=\"/admin/dashboard\" class=\"header-mobile-link\" (click)=\"closeMobileMenu()\">My Office</a>\n      }\n    </div>\n  }\n</header>\n", styles: ["@use 'variables' as *;\n\n.header-bar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  z-index: 1060;\n  background: rgba(15, 16, 18, 0.75);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n}\n\n:host-context(body.investa-theme-light) .header-bar {\n  background: rgba(255, 255, 255, 0.8);\n}\n\n.header-inner {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: min(100%, 1280px);\n  margin-inline: auto;\n  padding: 0 32px;\n  height: 60px;\n}\n\n.header-logo {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  text-decoration: none;\n  flex-shrink: 0;\n}\n\n.header-logo-icon {\n  width: 26px;\n  height: 26px;\n  color: var(--investa-accent);\n}\n\n.header-logo-text {\n  font-size: 1.25rem;\n  font-weight: 800;\n  color: var(--investa-text-primary);\n  letter-spacing: -0.03em;\n}\n\n.header-nav {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n\n.header-nav-link {\n  padding: 6px 14px;\n  font-size: 0.8125rem;\n  font-weight: 500;\n  color: var(--investa-text-secondary);\n  text-decoration: none;\n  border-radius: 8px;\n  transition: color 150ms ease;\n  white-space: nowrap;\n}\n\n.header-nav-link:hover {\n  color: var(--investa-text-primary);\n}\n\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n\n.header-action-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  background: transparent;\n  color: var(--investa-text-secondary);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-decoration: none;\n  transition: color 150ms ease, background-color 150ms ease;\n}\n\n.header-action-btn:hover {\n  color: var(--investa-text-primary);\n  background: rgba(255, 255, 255, 0.06);\n}\n\n:host-context(body.investa-theme-light) .header-action-btn:hover {\n  background: rgba(0, 0, 0, 0.05);\n}\n\n.header-login-link {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0 14px;\n  min-height: 32px;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--investa-text-secondary);\n  text-decoration: none;\n  border-radius: 8px;\n  transition: color 150ms ease;\n}\n\n.header-login-link:hover {\n  color: var(--investa-text-primary);\n}\n\n.header-signup-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 34px;\n  padding: 0 20px;\n  background: var(--investa-accent);\n  color: #ffffff;\n  font-weight: 700;\n  font-size: 0.8125rem;\n  border: none;\n  border-radius: 10px;\n  text-decoration: none;\n  cursor: pointer;\n  transition: background-color 160ms ease, box-shadow 160ms ease;\n}\n\n.header-signup-btn:hover {\n  background: var(--investa-accent-hover);\n  box-shadow: 0 4px 16px rgba(34, 197, 50, 0.3);\n}\n\n.header-mobile-btn {\n  display: none;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  background: transparent;\n  color: var(--investa-text-secondary);\n  cursor: pointer;\n  border-radius: 8px;\n}\n\n.header-mobile-btn:hover {\n  color: var(--investa-text-primary);\n}\n\n.header-avatar-btn {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  border: 2px solid var(--investa-border);\n  overflow: hidden;\n  cursor: pointer;\n  padding: 0;\n  background: transparent;\n  transition: border-color 150ms ease;\n}\n\n.header-avatar-btn:hover {\n  border-color: var(--investa-accent);\n}\n\n.header-avatar-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.header-avatar-fallback {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--investa-accent);\n  color: #ffffff;\n  font-size: 0.6875rem;\n  font-weight: 700;\n}\n\n.header-dropdown {\n  position: absolute;\n  right: 0;\n  top: calc(100% + 6px);\n  min-width: 170px;\n  background: var(--investa-surface);\n  border: 1px solid var(--investa-border);\n  border-radius: 12px;\n  box-shadow: var(--investa-shadow-md);\n  padding: 6px;\n  z-index: 50;\n}\n\n.header-dropdown-item {\n  display: block;\n  width: 100%;\n  padding: 8px 14px;\n  text-align: left;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--investa-text-primary);\n  background: transparent;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: background-color 150ms ease;\n}\n\n.header-dropdown-item:hover {\n  background: var(--investa-surface-2);\n}\n\n.header-mobile-menu {\n  display: none;\n  padding: 8px 24px 16px;\n  border-top: 1px solid var(--investa-border);\n  background: rgba(15, 16, 18, 0.98);\n}\n\n:host-context(body.investa-theme-light) .header-mobile-menu {\n  background: rgba(255, 255, 255, 0.98);\n}\n\n.header-mobile-link {\n  display: block;\n  padding: 10px 0;\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--investa-text-primary);\n  text-decoration: none;\n}\n\n.header-mobile-link:hover {\n  color: var(--investa-accent);\n}\n\n.header-mobile-signup {\n  color: var(--investa-accent);\n}\n\n.header-mobile-divider {\n  border: none;\n  border-top: 1px solid var(--investa-border);\n  margin: 8px 0;\n}\n\n@media (max-width: 900px) {\n  .header-nav {\n    display: none;\n  }\n\n  .header-mobile-btn {\n    display: flex;\n  }\n\n  .header-mobile-menu {\n    display: block;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HeaderComponent, { className: "HeaderComponent", filePath: "src/app/components/header/header.component.ts", lineNumber: 22 }); })();
