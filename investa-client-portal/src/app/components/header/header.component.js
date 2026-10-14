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
function HeaderComponent_For_13_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 19);
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
function HeaderComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 14);
    i0.ɵɵelement(1, "path", 20);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 14);
    i0.ɵɵelement(1, "circle", 21)(2, "line", 22)(3, "line", 23)(4, "line", 24)(5, "line", 25)(6, "line", 26)(7, "line", 27)(8, "line", 28)(9, "line", 29);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 30);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_23_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openLoginModal($event)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 31);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_23_Template_a_click_3_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "header.login"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 4, "header.signup"), " ");
} }
function HeaderComponent_Conditional_24_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 36);
    i0.ɵɵlistener("error", function HeaderComponent_Conditional_24_Conditional_2_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onImageError()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r1.userAvatarUrl(), i0.ɵɵsanitizeUrl)("alt", ctx_r1.userDisplayName());
} }
function HeaderComponent_Conditional_24_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.userInitials());
} }
function HeaderComponent_Conditional_24_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 38);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_24_Conditional_4_For_2_Template_button_click_0_listener() { const item_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.handleUserMenuItemClick(item_r8)); });
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r8 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, item_r8.key === "logout" ? "adminNav.logout" : "adminNav.userMenu." + item_r8.key));
} }
function HeaderComponent_Conditional_24_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35);
    i0.ɵɵrepeaterCreate(1, HeaderComponent_Conditional_24_Conditional_4_For_2_Template, 4, 3, "button", 37, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.userMenuItems());
} }
function HeaderComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "button", 32);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_24_Template_button_click_1_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleUserMenu($event)); });
    i0.ɵɵconditionalCreate(2, HeaderComponent_Conditional_24_Conditional_2_Template, 1, 2, "img", 33)(3, HeaderComponent_Conditional_24_Conditional_3_Template, 2, 1, "div", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, HeaderComponent_Conditional_24_Conditional_4_Template, 3, 0, "div", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.userAvatarUrl() && !ctx_r1.imageLoadFailed() ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isUserMenuOpen() ? 4 : -1);
} }
function HeaderComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 17);
    i0.ɵɵelement(1, "line", 39)(2, "line", 40)(3, "line", 41);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 17);
    i0.ɵɵelement(1, "line", 42)(2, "line", 43);
    i0.ɵɵelementEnd();
} }
function HeaderComponent_Conditional_28_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 47);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_28_For_2_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const link_r10 = ctx.$implicit;
    i0.ɵɵproperty("routerLink", link_r10.routerLink);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "header.nav." + link_r10.key));
} }
function HeaderComponent_Conditional_28_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 48);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_28_Conditional_4_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openLoginModal($event); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 49);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_28_Conditional_4_Template_a_click_3_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "header.login"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "header.signup"));
} }
function HeaderComponent_Conditional_28_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 50);
    i0.ɵɵlistener("click", function HeaderComponent_Conditional_28_Conditional_5_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMobileMenu()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "adminNav.dashboard"));
} }
function HeaderComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵrepeaterCreate(1, HeaderComponent_Conditional_28_For_2_Template, 3, 4, "a", 44, _forTrack0);
    i0.ɵɵelement(3, "hr", 45);
    i0.ɵɵconditionalCreate(4, HeaderComponent_Conditional_28_Conditional_4_Template, 6, 6)(5, HeaderComponent_Conditional_28_Conditional_5_Template, 3, 3, "a", 46);
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
            { key: 'profile', routerLink: '/admin/profile' },
            { key: 'settings', routerLink: '/admin/settings' },
            { key: 'logout', action: 'logout' }
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
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HeaderComponent, selectors: [["app-header"]], decls: 29, vars: 13, consts: [[1, "header-bar"], [1, "header-inner"], ["routerLink", "/", 1, "header-logo"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round", 1, "header-logo-icon"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l-1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "header-logo-text"], [1, "header-nav"], [1, "header-nav-link", 3, "routerLink"], [1, "header-actions"], [1, "header-action-btn", 3, "click", "title"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "relative", "user-menu-container"], ["aria-label", "Menu", 1, "header-mobile-btn", 3, "click"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "header-mobile-menu"], [1, "header-nav-link", 3, "click", "routerLink"], ["d", "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"], ["cx", "12", "cy", "12", "r", "5"], ["x1", "12", "y1", "1", "x2", "12", "y2", "3"], ["x1", "12", "y1", "21", "x2", "12", "y2", "23"], ["x1", "4.22", "y1", "4.22", "x2", "5.64", "y2", "5.64"], ["x1", "18.36", "y1", "18.36", "x2", "19.78", "y2", "19.78"], ["x1", "1", "y1", "12", "x2", "3", "y2", "12"], ["x1", "21", "y1", "12", "x2", "23", "y2", "12"], ["x1", "4.22", "y1", "19.78", "x2", "5.64", "y2", "18.36"], ["x1", "18.36", "y1", "5.64", "x2", "19.78", "y2", "4.22"], ["href", "#", 1, "header-login-link", 3, "click"], ["routerLink", "/signup", 1, "header-signup-btn", 3, "click"], [1, "header-avatar-btn", 3, "click"], [1, "header-avatar-img", 3, "src", "alt"], [1, "header-avatar-fallback"], [1, "header-dropdown"], [1, "header-avatar-img", 3, "error", "src", "alt"], [1, "header-dropdown-item"], [1, "header-dropdown-item", 3, "click"], ["x1", "3", "y1", "12", "x2", "21", "y2", "12"], ["x1", "3", "y1", "6", "x2", "21", "y2", "6"], ["x1", "3", "y1", "18", "x2", "21", "y2", "18"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18"], [1, "header-mobile-link", 3, "routerLink"], [1, "header-mobile-divider"], ["routerLink", "/admin/dashboard", 1, "header-mobile-link"], [1, "header-mobile-link", 3, "click", "routerLink"], ["href", "#", 1, "header-mobile-link", 3, "click"], ["routerLink", "/signup", 1, "header-mobile-link", "header-mobile-signup", 3, "click"], ["routerLink", "/admin/dashboard", 1, "header-mobile-link", 3, "click"]], template: function HeaderComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "header", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(3, "svg", 3);
            i0.ɵɵelement(4, "path", 4)(5, "path", 5)(6, "path", 6)(7, "path", 7)(8, "path", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(9, "span", 9);
            i0.ɵɵtext(10, "FOPX One");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "nav", 10);
            i0.ɵɵrepeaterCreate(12, HeaderComponent_For_13_Template, 3, 4, "a", 11, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "div", 12)(15, "button", 13);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵlistener("click", function HeaderComponent_Template_button_click_15_listener($event) { return ctx.toggleLanguage($event); });
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "button", 13);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵlistener("click", function HeaderComponent_Template_button_click_19_listener($event) { return ctx.toggleTheme($event); });
            i0.ɵɵconditionalCreate(21, HeaderComponent_Conditional_21_Template, 2, 0, ":svg:svg", 14)(22, HeaderComponent_Conditional_22_Template, 10, 0, ":svg:svg", 14);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(23, HeaderComponent_Conditional_23_Template, 6, 6)(24, HeaderComponent_Conditional_24_Template, 5, 2, "div", 15);
            i0.ɵɵelementStart(25, "button", 16);
            i0.ɵɵlistener("click", function HeaderComponent_Template_button_click_25_listener() { return ctx.toggleMobileMenu(); });
            i0.ɵɵconditionalCreate(26, HeaderComponent_Conditional_26_Template, 4, 0, ":svg:svg", 17)(27, HeaderComponent_Conditional_27_Template, 3, 0, ":svg:svg", 17);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(28, HeaderComponent_Conditional_28_Template, 6, 1, "div", 18);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(12);
            i0.ɵɵrepeater(ctx.navLinks());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("title", i0.ɵɵpipeBind1(16, 7, "header.toggleLanguage"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 9, "language.toggle"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("title", i0.ɵɵpipeBind1(20, 11, "header.toggleTheme"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isDarkTheme() ? 21 : 22);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.isAuthenticated() ? 23 : 24);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.isMobileMenuOpen() ? 26 : 27);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isMobileMenuOpen() ? 28 : -1);
        } }, dependencies: [CommonModule, RouterLink, TranslatePipe], styles: ["@use 'variables' as *;\r\n\r\n.header-bar[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  right: 0;\r\n  z-index: 1060;\r\n  background: rgba(15, 16, 18, 0.75);\r\n  backdrop-filter: blur(16px);\r\n  -webkit-backdrop-filter: blur(16px);\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .header-bar[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .header-bar[_ngcontent-%COMP%] {\r\n  background: rgba(255, 255, 255, 0.8);\r\n}\r\n\r\n.header-inner[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  width: min(100%, 1280px);\r\n  margin-inline: auto;\r\n  padding: 0 32px;\r\n  height: 60px;\r\n}\r\n\r\n.header-logo[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  text-decoration: none;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.header-logo-icon[_ngcontent-%COMP%] {\r\n  width: 26px;\r\n  height: 26px;\r\n  color: var(--investa-accent);\r\n}\r\n\r\n.header-logo-text[_ngcontent-%COMP%] {\r\n  font-size: 1.25rem;\r\n  font-weight: 800;\r\n  color: var(--investa-text-primary);\r\n  letter-spacing: -0.03em;\r\n}\r\n\r\n.header-nav[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 2px;\r\n}\r\n\r\n.header-nav-link[_ngcontent-%COMP%] {\r\n  padding: 6px 14px;\r\n  font-size: 0.8125rem;\r\n  font-weight: 500;\r\n  color: var(--investa-text-secondary);\r\n  text-decoration: none;\r\n  border-radius: 8px;\r\n  transition: color 150ms ease;\r\n  white-space: nowrap;\r\n}\r\n\r\n.header-nav-link[_ngcontent-%COMP%]:hover {\r\n  color: var(--investa-text-primary);\r\n}\r\n\r\n.header-actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.header-action-btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 32px;\r\n  height: 32px;\r\n  border: none;\r\n  background: transparent;\r\n  color: var(--investa-text-secondary);\r\n  border-radius: 8px;\r\n  cursor: pointer;\r\n  font-size: 0.75rem;\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n  transition: color 150ms ease, background-color 150ms ease;\r\n}\r\n\r\n.header-action-btn[_ngcontent-%COMP%]:hover {\r\n  color: var(--investa-text-primary);\r\n  background: rgba(255, 255, 255, 0.06);\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .header-action-btn[_ngcontent-%COMP%]:hover, body.investa-theme-light   [_nghost-%COMP%]   .header-action-btn[_ngcontent-%COMP%]:hover {\r\n  background: rgba(0, 0, 0, 0.05);\r\n}\r\n\r\n.header-login-link[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0 14px;\r\n  min-height: 32px;\r\n  font-size: 0.8125rem;\r\n  font-weight: 600;\r\n  color: var(--investa-text-secondary);\r\n  text-decoration: none;\r\n  border-radius: 8px;\r\n  transition: color 150ms ease;\r\n}\r\n\r\n.header-login-link[_ngcontent-%COMP%]:hover {\r\n  color: var(--investa-text-primary);\r\n}\r\n\r\n.header-signup-btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  min-height: 34px;\r\n  padding: 0 20px;\r\n  background: var(--investa-accent);\r\n  color: #ffffff;\r\n  font-weight: 700;\r\n  font-size: 0.8125rem;\r\n  border: none;\r\n  border-radius: 10px;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n  transition: background-color 160ms ease, box-shadow 160ms ease;\r\n}\r\n\r\n.header-signup-btn[_ngcontent-%COMP%]:hover {\r\n  background: var(--investa-accent-hover);\r\n  box-shadow: 0 4px 16px rgba(34, 197, 50, 0.3);\r\n}\r\n\r\n.header-mobile-btn[_ngcontent-%COMP%] {\r\n  display: none;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 32px;\r\n  height: 32px;\r\n  border: none;\r\n  background: transparent;\r\n  color: var(--investa-text-secondary);\r\n  cursor: pointer;\r\n  border-radius: 8px;\r\n}\r\n\r\n.header-mobile-btn[_ngcontent-%COMP%]:hover {\r\n  color: var(--investa-text-primary);\r\n}\r\n\r\n.header-avatar-btn[_ngcontent-%COMP%] {\r\n  width: 30px;\r\n  height: 30px;\r\n  border-radius: 50%;\r\n  border: 2px solid var(--investa-border);\r\n  overflow: hidden;\r\n  cursor: pointer;\r\n  padding: 0;\r\n  background: transparent;\r\n  transition: border-color 150ms ease;\r\n}\r\n\r\n.header-avatar-btn[_ngcontent-%COMP%]:hover {\r\n  border-color: var(--investa-accent);\r\n}\r\n\r\n.header-avatar-img[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;\r\n}\r\n\r\n.header-avatar-fallback[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  height: 100%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: var(--investa-accent);\r\n  color: #ffffff;\r\n  font-size: 0.6875rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.header-dropdown[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  right: 0;\r\n  top: calc(100% + 6px);\r\n  min-width: 170px;\r\n  background: var(--investa-surface);\r\n  border: 1px solid var(--investa-border);\r\n  border-radius: 12px;\r\n  box-shadow: var(--investa-shadow-md);\r\n  padding: 6px;\r\n  z-index: 50;\r\n}\r\n\r\n.header-dropdown-item[_ngcontent-%COMP%] {\r\n  display: block;\r\n  width: 100%;\r\n  padding: 8px 14px;\r\n  text-align: left;\r\n  font-size: 0.8125rem;\r\n  font-weight: 600;\r\n  color: var(--investa-text-primary);\r\n  background: transparent;\r\n  border: none;\r\n  border-radius: 8px;\r\n  cursor: pointer;\r\n  transition: background-color 150ms ease;\r\n}\r\n\r\n.header-dropdown-item[_ngcontent-%COMP%]:hover {\r\n  background: var(--investa-surface-2);\r\n}\r\n\r\n.header-mobile-menu[_ngcontent-%COMP%] {\r\n  display: none;\r\n  padding: 8px 24px 16px;\r\n  border-top: 1px solid var(--investa-border);\r\n  background: rgba(15, 16, 18, 0.98);\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .header-mobile-menu[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .header-mobile-menu[_ngcontent-%COMP%] {\r\n  background: rgba(255, 255, 255, 0.98);\r\n}\r\n\r\n.header-mobile-link[_ngcontent-%COMP%] {\r\n  display: block;\r\n  padding: 10px 0;\r\n  font-size: 0.9375rem;\r\n  font-weight: 600;\r\n  color: var(--investa-text-primary);\r\n  text-decoration: none;\r\n}\r\n\r\n.header-mobile-link[_ngcontent-%COMP%]:hover {\r\n  color: var(--investa-accent);\r\n}\r\n\r\n.header-mobile-signup[_ngcontent-%COMP%] {\r\n  color: var(--investa-accent);\r\n}\r\n\r\n.header-mobile-divider[_ngcontent-%COMP%] {\r\n  border: none;\r\n  border-top: 1px solid var(--investa-border);\r\n  margin: 8px 0;\r\n}\r\n\r\n@media (max-width: 900px) {\r\n  .header-nav[_ngcontent-%COMP%] {\r\n    display: none;\r\n  }\r\n\r\n  .header-mobile-btn[_ngcontent-%COMP%] {\r\n    display: flex;\r\n  }\r\n\r\n  .header-mobile-menu[_ngcontent-%COMP%] {\r\n    display: block;\r\n  }\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HeaderComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-header', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, TranslatePipe], template: "<header class=\"header-bar\">\r\n  <div class=\"header-inner\">\r\n    <a routerLink=\"/\" class=\"header-logo\">\r\n      <svg class=\"header-logo-icon\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n        <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\r\n        <path d=\"M14 16.75l-1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\r\n        <path d=\"M10 14l2 -2l2 -2\"></path>\r\n        <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\r\n        <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\r\n      </svg>\r\n      <span class=\"header-logo-text\">FOPX One</span>\r\n    </a>\r\n\r\n    <nav class=\"header-nav\">\r\n      @for(link of navLinks(); track link.key) {\r\n        <a [routerLink]=\"link.routerLink\" class=\"header-nav-link\" (click)=\"closeMobileMenu()\">{{ 'header.nav.' + link.key | translate }}</a>\r\n      }\r\n    </nav>\r\n\r\n    <div class=\"header-actions\">\r\n      <button (click)=\"toggleLanguage($event)\" class=\"header-action-btn\" [title]=\"'header.toggleLanguage' | translate\">\n        {{ 'language.toggle' | translate }}\r\n      </button>\r\n\r\n      <button (click)=\"toggleTheme($event)\" class=\"header-action-btn\" [title]=\"'header.toggleTheme' | translate\">\n        @if (isDarkTheme()) {\r\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg>\r\n        } @else {\r\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"/><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"/><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"/><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"/></svg>\r\n        }\r\n      </button>\r\n\r\n      @if (!isAuthenticated()) {\r\n        <a href=\"#\" (click)=\"openLoginModal($event)\" class=\"header-login-link\">\r\n          {{ 'header.login' | translate }}\r\n        </a>\r\n\r\n        <a routerLink=\"/signup\" class=\"header-signup-btn\" (click)=\"closeMobileMenu()\">\r\n          {{ 'header.signup' | translate }}\r\n        </a>\r\n      } @else {\r\n        <div class=\"relative user-menu-container\">\r\n          <button (click)=\"toggleUserMenu($event)\" class=\"header-avatar-btn\">\r\n            @if (userAvatarUrl() && !imageLoadFailed()) {\r\n              <img [src]=\"userAvatarUrl()\" [alt]=\"userDisplayName()\" (error)=\"onImageError()\" class=\"header-avatar-img\">\r\n            } @else {\r\n              <div class=\"header-avatar-fallback\">{{ userInitials() }}</div>\r\n            }\r\n          </button>\r\n\r\n          @if (isUserMenuOpen()) {\r\n            <div class=\"header-dropdown\">\r\n          @for (item of userMenuItems(); track item.key) {\n            <button (click)=\"handleUserMenuItemClick(item)\" class=\"header-dropdown-item\">\n              <span>{{ (item.key === 'logout' ? 'adminNav.logout' : 'adminNav.userMenu.' + item.key) | translate }}</span>\n                </button>\r\n              }\r\n            </div>\r\n          }\r\n        </div>\r\n      }\r\n\r\n      <button (click)=\"toggleMobileMenu()\" class=\"header-mobile-btn\" aria-label=\"Menu\">\r\n        @if (!isMobileMenuOpen()) {\r\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/></svg>\r\n        } @else {\r\n          <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\r\n        }\r\n      </button>\r\n    </div>\r\n  </div>\r\n\r\n  @if (isMobileMenuOpen()) {\r\n    <div class=\"header-mobile-menu\">\r\n      @for(link of navLinks(); track link.key) {\r\n        <a [routerLink]=\"link.routerLink\" class=\"header-mobile-link\" (click)=\"closeMobileMenu()\">{{ 'header.nav.' + link.key | translate }}</a>\r\n      }\r\n      <hr class=\"header-mobile-divider\">\r\n      @if (!isAuthenticated()) {\r\n        <a href=\"#\" (click)=\"openLoginModal($event); closeMobileMenu()\" class=\"header-mobile-link\">{{ 'header.login' | translate }}</a>\r\n        <a routerLink=\"/signup\" class=\"header-mobile-link header-mobile-signup\" (click)=\"closeMobileMenu()\">{{ 'header.signup' | translate }}</a>\r\n      } @else {\r\n        <a routerLink=\"/admin/dashboard\" class=\"header-mobile-link\" (click)=\"closeMobileMenu()\">{{ 'adminNav.dashboard' | translate }}</a>\n      }\r\n    </div>\r\n  }\r\n</header>\r\n", styles: ["@use 'variables' as *;\r\n\r\n.header-bar {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  right: 0;\r\n  z-index: 1060;\r\n  background: rgba(15, 16, 18, 0.75);\r\n  backdrop-filter: blur(16px);\r\n  -webkit-backdrop-filter: blur(16px);\r\n}\r\n\r\n:host-context(body.investa-theme-light) .header-bar {\r\n  background: rgba(255, 255, 255, 0.8);\r\n}\r\n\r\n.header-inner {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  width: min(100%, 1280px);\r\n  margin-inline: auto;\r\n  padding: 0 32px;\r\n  height: 60px;\r\n}\r\n\r\n.header-logo {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  text-decoration: none;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.header-logo-icon {\r\n  width: 26px;\r\n  height: 26px;\r\n  color: var(--investa-accent);\r\n}\r\n\r\n.header-logo-text {\r\n  font-size: 1.25rem;\r\n  font-weight: 800;\r\n  color: var(--investa-text-primary);\r\n  letter-spacing: -0.03em;\r\n}\r\n\r\n.header-nav {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 2px;\r\n}\r\n\r\n.header-nav-link {\r\n  padding: 6px 14px;\r\n  font-size: 0.8125rem;\r\n  font-weight: 500;\r\n  color: var(--investa-text-secondary);\r\n  text-decoration: none;\r\n  border-radius: 8px;\r\n  transition: color 150ms ease;\r\n  white-space: nowrap;\r\n}\r\n\r\n.header-nav-link:hover {\r\n  color: var(--investa-text-primary);\r\n}\r\n\r\n.header-actions {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.header-action-btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 32px;\r\n  height: 32px;\r\n  border: none;\r\n  background: transparent;\r\n  color: var(--investa-text-secondary);\r\n  border-radius: 8px;\r\n  cursor: pointer;\r\n  font-size: 0.75rem;\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n  transition: color 150ms ease, background-color 150ms ease;\r\n}\r\n\r\n.header-action-btn:hover {\r\n  color: var(--investa-text-primary);\r\n  background: rgba(255, 255, 255, 0.06);\r\n}\r\n\r\n:host-context(body.investa-theme-light) .header-action-btn:hover {\r\n  background: rgba(0, 0, 0, 0.05);\r\n}\r\n\r\n.header-login-link {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0 14px;\r\n  min-height: 32px;\r\n  font-size: 0.8125rem;\r\n  font-weight: 600;\r\n  color: var(--investa-text-secondary);\r\n  text-decoration: none;\r\n  border-radius: 8px;\r\n  transition: color 150ms ease;\r\n}\r\n\r\n.header-login-link:hover {\r\n  color: var(--investa-text-primary);\r\n}\r\n\r\n.header-signup-btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  min-height: 34px;\r\n  padding: 0 20px;\r\n  background: var(--investa-accent);\r\n  color: #ffffff;\r\n  font-weight: 700;\r\n  font-size: 0.8125rem;\r\n  border: none;\r\n  border-radius: 10px;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n  transition: background-color 160ms ease, box-shadow 160ms ease;\r\n}\r\n\r\n.header-signup-btn:hover {\r\n  background: var(--investa-accent-hover);\r\n  box-shadow: 0 4px 16px rgba(34, 197, 50, 0.3);\r\n}\r\n\r\n.header-mobile-btn {\r\n  display: none;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 32px;\r\n  height: 32px;\r\n  border: none;\r\n  background: transparent;\r\n  color: var(--investa-text-secondary);\r\n  cursor: pointer;\r\n  border-radius: 8px;\r\n}\r\n\r\n.header-mobile-btn:hover {\r\n  color: var(--investa-text-primary);\r\n}\r\n\r\n.header-avatar-btn {\r\n  width: 30px;\r\n  height: 30px;\r\n  border-radius: 50%;\r\n  border: 2px solid var(--investa-border);\r\n  overflow: hidden;\r\n  cursor: pointer;\r\n  padding: 0;\r\n  background: transparent;\r\n  transition: border-color 150ms ease;\r\n}\r\n\r\n.header-avatar-btn:hover {\r\n  border-color: var(--investa-accent);\r\n}\r\n\r\n.header-avatar-img {\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;\r\n}\r\n\r\n.header-avatar-fallback {\r\n  width: 100%;\r\n  height: 100%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: var(--investa-accent);\r\n  color: #ffffff;\r\n  font-size: 0.6875rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.header-dropdown {\r\n  position: absolute;\r\n  right: 0;\r\n  top: calc(100% + 6px);\r\n  min-width: 170px;\r\n  background: var(--investa-surface);\r\n  border: 1px solid var(--investa-border);\r\n  border-radius: 12px;\r\n  box-shadow: var(--investa-shadow-md);\r\n  padding: 6px;\r\n  z-index: 50;\r\n}\r\n\r\n.header-dropdown-item {\r\n  display: block;\r\n  width: 100%;\r\n  padding: 8px 14px;\r\n  text-align: left;\r\n  font-size: 0.8125rem;\r\n  font-weight: 600;\r\n  color: var(--investa-text-primary);\r\n  background: transparent;\r\n  border: none;\r\n  border-radius: 8px;\r\n  cursor: pointer;\r\n  transition: background-color 150ms ease;\r\n}\r\n\r\n.header-dropdown-item:hover {\r\n  background: var(--investa-surface-2);\r\n}\r\n\r\n.header-mobile-menu {\r\n  display: none;\r\n  padding: 8px 24px 16px;\r\n  border-top: 1px solid var(--investa-border);\r\n  background: rgba(15, 16, 18, 0.98);\r\n}\r\n\r\n:host-context(body.investa-theme-light) .header-mobile-menu {\r\n  background: rgba(255, 255, 255, 0.98);\r\n}\r\n\r\n.header-mobile-link {\r\n  display: block;\r\n  padding: 10px 0;\r\n  font-size: 0.9375rem;\r\n  font-weight: 600;\r\n  color: var(--investa-text-primary);\r\n  text-decoration: none;\r\n}\r\n\r\n.header-mobile-link:hover {\r\n  color: var(--investa-accent);\r\n}\r\n\r\n.header-mobile-signup {\r\n  color: var(--investa-accent);\r\n}\r\n\r\n.header-mobile-divider {\r\n  border: none;\r\n  border-top: 1px solid var(--investa-border);\r\n  margin: 8px 0;\r\n}\r\n\r\n@media (max-width: 900px) {\r\n  .header-nav {\r\n    display: none;\r\n  }\r\n\r\n  .header-mobile-btn {\r\n    display: flex;\r\n  }\r\n\r\n  .header-mobile-menu {\r\n    display: block;\r\n  }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HeaderComponent, { className: "HeaderComponent", filePath: "src/app/components/header/header.component.ts", lineNumber: 22 }); })();
