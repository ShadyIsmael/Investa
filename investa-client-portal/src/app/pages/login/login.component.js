import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RoleContextService } from '../../services/role-context.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
function LoginComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 59)(1, "div", 60)(2, "button", 25);
    i0.ɵɵlistener("click", function LoginComponent_div_10_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.role.set("founder")); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 25);
    i0.ɵɵlistener("click", function LoginComponent_div_10_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.role.set("investor")); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap("px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-300 " + (ctx_r1.role() === "founder" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-gray-400 hover:text-gray-200"));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 6, "login.founder"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap("px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-300 " + (ctx_r1.role() === "investor" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-400 hover:text-gray-200"));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 8, "login.investor"), " ");
} }
function LoginComponent_div_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 61)(1, "div", 62);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.errorMessage(), " ");
} }
function LoginComponent_div_43_a_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 65);
    i0.ɵɵlistener("click", function LoginComponent_div_43_a_1_Template_a_click_0_listener() { const country_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectCountry(country_r4)); });
    i0.ɵɵelement(1, "span");
    i0.ɵɵelementStart(2, "span", 66);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 67);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const country_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("fi fi-", country_r4.flag, " fi-sm mr-4 rounded"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, country_r4.nameKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(country_r4.code);
} }
function LoginComponent_div_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 63);
    i0.ɵɵtemplate(1, LoginComponent_div_43_a_1_Template, 7, 7, "a", 64);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r1.countries);
} }
function LoginComponent_span_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "login.signInButton"));
} }
function LoginComponent_span_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "login.signingIn"));
} }
export class LoginComponent {
    constructor() {
        this.authService = inject(AuthService);
        // Fix: Explicitly type injected Router and ActivatedRoute to resolve type inference issues.
        this.router = inject(Router);
        this.route = inject(ActivatedRoute);
        this.profileService = inject(ProfileService);
        this.languageService = inject(LanguageService);
        this.roleContext = inject(RoleContextService);
        this.role = signal('investor', ...(ngDevMode ? [{ debugName: "role" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.isSubmitting = signal(false, ...(ngDevMode ? [{ debugName: "isSubmitting" }] : []));
        this.isDropdownOpen = signal(false, ...(ngDevMode ? [{ debugName: "isDropdownOpen" }] : []));
        this.theme = computed(() => {
            const isFounder = this.role() === 'founder';
            return {
                primaryGradient: isFounder
                    ? 'from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                    : 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
                textAccent: isFounder ? 'text-violet-400' : 'text-emerald-400',
                textHover: isFounder ? 'hover:text-violet-300' : 'hover:text-emerald-300',
                ringFocus: isFounder ? 'focus:ring-violet-500' : 'focus:ring-emerald-500',
                borderFocus: isFounder ? 'focus:border-violet-500' : 'focus:border-emerald-500',
                bgGlow: isFounder ? 'bg-violet-500/10' : 'bg-emerald-500/10',
                bgGlowSecond: isFounder ? 'bg-indigo-500/10' : 'bg-teal-500/10',
                iconColor: isFounder ? 'text-violet-400' : 'text-emerald-400',
                checkboxText: isFounder ? 'text-violet-500 focus:ring-violet-600' : 'text-emerald-500 focus:ring-emerald-600'
            };
        }, ...(ngDevMode ? [{ debugName: "theme" }] : []));
        this.countries = [
            { code: '+20', flag: 'eg', nameKey: 'login.countries.egypt' },
            { code: '+1', flag: 'us', nameKey: 'login.countries.usa' },
            { code: '+44', flag: 'gb', nameKey: 'login.countries.uk' },
            { code: '+91', flag: 'in', nameKey: 'login.countries.india' },
            { code: '+61', flag: 'au', nameKey: 'login.countries.australia' },
            { code: '+81', flag: 'jp', nameKey: 'login.countries.japan' },
            { code: '+49', flag: 'de', nameKey: 'login.countries.germany' },
        ];
        // Default to Egypt
        this.loginForm = new FormGroup({
            countryCode: new FormControl(this.countries[0].code, [Validators.required]),
            mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6,15}$')]),
            password: new FormControl('', [Validators.required, Validators.minLength(6)])
        });
        this.selectedCountry = computed(() => {
            const countryCode = this.loginForm.get('countryCode').value;
            return this.countries.find(c => c.code === countryCode);
        }, ...(ngDevMode ? [{ debugName: "selectedCountry" }] : []));
        this.isFounder = computed(() => this.role() === 'founder', ...(ngDevMode ? [{ debugName: "isFounder" }] : []));
        // initialize role from query param snapshot (handles direct navigation)
        const initial = this.route.snapshot.queryParamMap.get('role');
        if (initial === 'investor' || initial === 'founder') {
            this.role.set(initial);
        }
        // also react to query param changes
        this.route.queryParamMap.subscribe(params => {
            const roleParam = params.get('role');
            if (roleParam === 'investor' || roleParam === 'founder') {
                this.role.set(roleParam);
            }
        });
    }
    selectCountry(country) {
        this.loginForm.get('countryCode').setValue(country.code);
        this.isDropdownOpen.set(false);
    }
    async onSubmit() {
        if (!this.loginForm.valid || this.isSubmitting())
            return;
        this.errorMessage.set(null);
        this.isSubmitting.set(true);
        const countryCode = this.loginForm.get('countryCode').value;
        const mobile = this.loginForm.get('mobile').value;
        const password = this.loginForm.get('password').value;
        const role = this.role();
        const fullMobile = `${countryCode}${mobile}`;
        try {
            await this.authService.login(fullMobile, password, role);
            // Load profile from backend after successful login
            try {
                await this.profileService.loadMyProfile();
            }
            catch (profileErr) {
                // Non-fatal: continue navigation even if profile load fails
            }
            const activeContext = this.roleContext.setActiveContext(role);
            this.router.navigate([activeContext === 'investor' ? '/admin/investments' : '/admin/dashboard']);
        }
        catch (err) {
            let key = 'login.errorGeneric';
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401)
                    key = 'login.invalidCredentials';
            }
            else if (typeof err?.message === 'string') {
                const m = err.message.toLowerCase();
                if (m.includes('invalid') || m.includes('credential') || m.includes('wrong') || m.includes('incorrect') || m.includes('not found')) {
                    key = 'login.invalidCredentials';
                }
            }
            this.errorMessage.set(this.languageService.translate(key));
        }
        finally {
            this.isSubmitting.set(false);
        }
    }
    close() {
        try {
            this.router.navigate(['/']);
        }
        catch {
            // ignore navigation errors
        }
    }
    static { this.ɵfac = function LoginComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginComponent, selectors: [["app-login"]], decls: 96, vars: 70, consts: [[1, "min-h-screen", "bg-gray-950", "text-white", "flex", "items-center", "justify-center", "p-4"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-10", 2, "background-image", "url('/assets/boardroom-bg.jpg')"], [1, "relative", "z-10", "w-full", "max-w-sm"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-6"], ["type", "button", "aria-label", "Close", 1, "absolute", "top-3", "end-3", "z-50", "text-gray-200", "hover:text-white", "p-2", "rounded-full", "bg-slate-800/70", "hover:bg-slate-700", "ring-1", "ring-white/5", 3, "click"], ["viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round", "aria-hidden", "true", 1, "w-5", "h-5"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18"], ["class", "flex justify-center mb-5", 4, "ngIf"], [1, "text-center", "mb-5"], ["routerLink", "/", 1, "flex", "items-center", "justify-center", "mb-4"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "text-white", "text-3xl", "font-bold", "ms-2"], [1, "text-xl", "font-bold", "text-white"], [1, "text-gray-300", "text-sm"], [1, "space-y-5", 3, "ngSubmit", "formGroup"], ["class", "mb-2", 4, "ngIf"], ["for", "mobile", 1, "block", "text-sm", "font-medium", "text-gray-300"], [1, "mt-1", "flex", "rounded-md", "shadow-sm"], [1, "relative"], ["type", "button", 3, "click"], [1, "flex", "items-center", "country-button"], [1, "block", "truncate", "text-base", "text-white"], [1, "ms-3", "absolute", "inset-y-0", "end-0", "flex", "items-center", "pr-3", "pointer-events-none"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 20 20", "fill", "currentColor", "aria-hidden", "true", 1, "h-6", "w-6", "text-gray-400"], ["fill-rule", "evenodd", "d", "M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z", "clip-rule", "evenodd"], ["class", "absolute z-20 mt-2 w-72 bg-slate-800 border border-slate-700 shadow-lg max-h-64 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm", 4, "ngIf"], ["id", "mobile", "type", "tel", "formControlName", "mobile", 3, "placeholder"], ["for", "password", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "password", "type", "password", "formControlName", "password", 3, "placeholder"], [1, "flex", "items-center", "justify-between"], [1, "flex", "items-center"], ["id", "remember-me", "name", "remember-me", "type", "checkbox"], ["for", "remember-me", 1, "ms-2", "block", "text-sm", "text-gray-400"], [1, "text-sm"], ["href", "#"], ["type", "submit", 3, "disabled"], [4, "ngIf"], [1, "mt-5"], [1, "absolute", "inset-0", "flex", "items-center"], [1, "w-full", "border-t", "border-slate-700"], [1, "relative", "flex", "justify-center", "text-sm"], [1, "px-2", "bg-slate-900", "text-gray-400"], [1, "mt-5", "grid", "grid-cols-2", "gap-4"], ["href", "#", 1, "w-full", "inline-flex", "justify-center", "py-2.5", "px-4", "border", "border-slate-700", "rounded-md", "shadow-sm", "bg-slate-800", "text-sm", "font-medium", "text-gray-300", "hover:bg-slate-700"], [1, "sr-only"], ["aria-hidden", "true", "fill", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["d", "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", "fill", "#4285F4"], ["d", "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", "fill", "#34A853"], ["d", "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z", "fill", "#FBBC05"], ["d", "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", "fill", "#EA4335"], ["fill-rule", "evenodd", "d", "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z", "clip-rule", "evenodd"], [1, "mt-8", "text-center", "text-sm", "text-gray-400"], ["routerLink", "/signup"], [1, "flex", "justify-center", "mb-5"], [1, "bg-slate-950/50", "p-1", "rounded-lg", "flex", "border", "border-slate-700/50"], [1, "mb-2"], [1, "rounded-md", "bg-red-600/20", "border", "border-red-600", "text-red-200", "px-4", "py-2", "text-sm"], [1, "absolute", "z-20", "mt-2", "w-72", "bg-slate-800", "border", "border-slate-700", "shadow-lg", "max-h-64", "rounded-md", "py-1", "text-base", "ring-1", "ring-black", "ring-opacity-5", "overflow-auto", "focus:outline-none", "sm:text-sm"], ["class", "text-gray-200 cursor-pointer select-none relative px-4 py-2 hover:bg-slate-700 flex items-center transition-colors duration-150", 3, "click", 4, "ngFor", "ngForOf"], [1, "text-gray-200", "cursor-pointer", "select-none", "relative", "px-4", "py-2", "hover:bg-slate-700", "flex", "items-center", "transition-colors", "duration-150", 3, "click"], [1, "font-semibold", "block", "truncate"], [1, "text-gray-400", "ml-auto", "pl-3"]], template: function LoginComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "div", 1)(2, "div")(3, "div");
            i0.ɵɵelementStart(4, "div", 2)(5, "div", 3)(6, "button", 4);
            i0.ɵɵlistener("click", function LoginComponent_Template_button_click_6_listener() { return ctx.close(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(7, "svg", 5);
            i0.ɵɵelement(8, "line", 6)(9, "line", 7);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(10, LoginComponent_div_10_Template, 8, 10, "div", 8);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(11, "div", 9)(12, "a", 10);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(13, "svg", 11);
            i0.ɵɵelement(14, "path", 12)(15, "path", 13)(16, "path", 14)(17, "path", 15)(18, "path", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(19, "span", 17);
            i0.ɵɵtext(20, "Investa");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "h2", 18);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "p", 19);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(27, "form", 20);
            i0.ɵɵlistener("ngSubmit", function LoginComponent_Template_form_ngSubmit_27_listener() { return ctx.onSubmit(); });
            i0.ɵɵtemplate(28, LoginComponent_div_28_Template, 3, 1, "div", 21);
            i0.ɵɵelementStart(29, "div")(30, "label", 22);
            i0.ɵɵtext(31);
            i0.ɵɵpipe(32, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "div", 23)(34, "div", 24)(35, "button", 25);
            i0.ɵɵlistener("click", function LoginComponent_Template_button_click_35_listener() { return ctx.isDropdownOpen.set(!ctx.isDropdownOpen()); });
            i0.ɵɵelementStart(36, "span", 26);
            i0.ɵɵelement(37, "span");
            i0.ɵɵelementStart(38, "span", 27);
            i0.ɵɵtext(39);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(40, "span", 28);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(41, "svg", 29);
            i0.ɵɵelement(42, "path", 30);
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(43, LoginComponent_div_43_Template, 2, 1, "div", 31);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelement(44, "input", 32);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(46, "div")(47, "label", 33);
            i0.ɵɵtext(48);
            i0.ɵɵpipe(49, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(50, "input", 34);
            i0.ɵɵpipe(51, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "div", 35)(53, "div", 36);
            i0.ɵɵelement(54, "input", 37);
            i0.ɵɵelementStart(55, "label", 38);
            i0.ɵɵtext(56);
            i0.ɵɵpipe(57, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(58, "div", 39)(59, "a", 40);
            i0.ɵɵtext(60);
            i0.ɵɵpipe(61, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(62, "div")(63, "button", 41);
            i0.ɵɵtemplate(64, LoginComponent_span_64_Template, 3, 3, "span", 42)(65, LoginComponent_span_65_Template, 3, 3, "span", 42);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(66, "div", 43)(67, "div", 24)(68, "div", 44);
            i0.ɵɵelement(69, "div", 45);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(70, "div", 46)(71, "span", 47);
            i0.ɵɵtext(72);
            i0.ɵɵpipe(73, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(74, "div", 48)(75, "a", 49)(76, "span", 50);
            i0.ɵɵtext(77);
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(79, "svg", 51);
            i0.ɵɵelement(80, "path", 52)(81, "path", 53)(82, "path", 54)(83, "path", 55);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(84, "a", 49)(85, "span", 50);
            i0.ɵɵtext(86);
            i0.ɵɵpipe(87, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(88, "svg", 51);
            i0.ɵɵelement(89, "path", 56);
            i0.ɵɵelementEnd()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(90, "p", 57);
            i0.ɵɵtext(91);
            i0.ɵɵpipe(92, "translate");
            i0.ɵɵelementStart(93, "a", 58);
            i0.ɵɵtext(94);
            i0.ɵɵpipe(95, "translate");
            i0.ɵɵelementEnd()()()()()();
        } if (rf & 2) {
            let tmp_10_0;
            let tmp_11_0;
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap("absolute -top-1/4 -start-1/4 w-1/2 h-1/2 rounded-full filter blur-3xl opacity-50 animate-pulse " + ctx.theme().bgGlow);
            i0.ɵɵadvance();
            i0.ɵɵclassMap("absolute -bottom-1/4 -end-1/4 w-1/2 h-1/2 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000 " + ctx.theme().bgGlowSecond);
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("ngIf", false);
            i0.ɵɵadvance(3);
            i0.ɵɵclassMap("h-10 w-10 " + ctx.theme().iconColor);
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 44, "login.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 46, ctx.isFounder() ? "login.subtitleFounder" : "login.subtitleInvestor"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("formGroup", ctx.loginForm);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.errorMessage());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 48, ctx.isFounder() ? "login.mobileLabelFounder" : "login.mobileLabel"));
            i0.ɵɵadvance(4);
            i0.ɵɵclassMap("relative z-10 w-full bg-slate-800 border border-slate-700 rounded-l-md shadow-sm pl-4 pr-12 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 sm:text-sm transition-colors duration-200 " + ctx.theme().ringFocus + " " + ctx.theme().borderFocus);
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap(i0.ɵɵinterpolate1("fi fi-", (tmp_10_0 = ctx.selectedCountry()) == null ? null : tmp_10_0.flag, " fi-sm country-flag rounded"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate((tmp_11_0 = ctx.selectedCountry()) == null ? null : tmp_11_0.code);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngIf", ctx.isDropdownOpen());
            i0.ɵɵadvance();
            i0.ɵɵclassMap("block w-full bg-slate-800 border-y border-r border-slate-700 rounded-r-md shadow-sm py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 " + ctx.theme().ringFocus + " " + ctx.theme().borderFocus);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(45, 50, "login.mobilePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(49, 52, "login.passwordLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap("mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 " + ctx.theme().ringFocus + " " + ctx.theme().borderFocus);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(51, 54, ctx.isFounder() ? "login.passwordPlaceholderFounder" : "login.passwordPlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵclassMap("h-4 w-4 bg-slate-700 border-slate-600 rounded " + ctx.theme().checkboxText);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(57, 56, "login.rememberMe"));
            i0.ɵɵadvance(3);
            i0.ɵɵclassMap("font-medium " + ctx.theme().textAccent + " " + ctx.theme().textHover);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(61, 58, "login.forgotPassword"));
            i0.ɵɵadvance(3);
            i0.ɵɵclassMap("w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 " + ctx.theme().primaryGradient);
            i0.ɵɵproperty("disabled", !ctx.loginForm.valid || ctx.isSubmitting());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", !ctx.isSubmitting());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.isSubmitting());
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(73, 60, "login.orContinueWith"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(78, 62, "login.social.google"));
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(87, 64, "login.social.facebook"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(92, 66, "login.notAMember"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap("font-medium " + ctx.theme().textAccent + " " + ctx.theme().textHover);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(95, 68, "login.signUpNow"));
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, RouterLink, ReactiveFormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.FormGroupDirective, i2.FormControlName, TranslatePipe], styles: ["@use \"variables\" as *;\n@use \"sass:color\" as color;\n@use \"mixins\" as *;\n\n[_nghost-%COMP%] {\n  display: block;\n  min-height: 100vh;\n}\n\n.login-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  @include flex-center;\n  background: linear-gradient(135deg, $color-accent 0%, #19a927 100%);\n  padding: $spacing-4;\n  position: relative;\n  overflow: hidden;\n\n  &::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');\n    opacity: 0.1;\n  }\n}\n\n.login-container[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1000;\n  width: 100%;\n  max-width: 440px;\n  @include fade-in(0.4s);\n}\n\n.login-card[_ngcontent-%COMP%] {\n  @include card($spacing-8);\n  background: rgba($color-surface, 0.98);\n  backdrop-filter: blur(10px);\n\n  @include respond-to('md') {\n    padding: $spacing-10;\n  }\n}\n\n.login-header[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: $spacing-8;\n\n  h1 {\n    @include heading('lg');\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n  }\n\n  p {\n    color: $color-text-secondary;\n    font-size: $font-size-sm;\n  }\n}\n\n.role-selector[_ngcontent-%COMP%] {\n  @include flex-between;\n  gap: $spacing-3;\n  margin-bottom: $spacing-6;\n  padding: $spacing-1;\n  background: $color-background-alt;\n  border-radius: $border-radius-md;\n\n  button {\n    flex: 1;\n    @include button-base;\n    @include button-size('md');\n    background: transparent;\n    color: $color-text-secondary;\n    font-weight: $font-weight-medium;\n    transition: all $transition-base;\n\n    &.active {\n      background: $color-surface;\n      color: $color-accent;\n      box-shadow: $shadow-sm;\n    }\n\n    &:hover:not(.active) {\n      background: rgba($color-surface, 0.5);\n    }\n  }\n}\n\n.form-group[_ngcontent-%COMP%] {\n  margin-bottom: $spacing-5;\n\n  label {\n    display: block;\n    font-size: $font-size-sm;\n    font-weight: $font-weight-medium;\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n  }\n\n  input, select {\n    @include input-base;\n\n    &.error {\n      border-color: $color-error;\n    }\n  }\n\n  .error-message {\n    display: block;\n    font-size: $font-size-xs;\n    color: $color-error;\n    margin-top: $spacing-2;\n  }\n}\n\n.country-selector[_ngcontent-%COMP%] {\n  position: relative;\n\n  .country-button {\n    @include input-base;\n    @include flex-between;\n    cursor: pointer;\n    transition: all $transition-base;\n\n    &:hover {\n      border-color: $color-accent;\n    }\n\n    .fi-sm {\n      font-size: 0.95rem;\n      margin-right: $spacing-2;\n    }\n  }\n\n  .country-dropdown {\n    position: absolute;\n    top: calc(100% + $spacing-1);\n    left: 0;\n    right: 0;\n    max-height: 250px;\n    overflow-y: auto;\n    background: $color-surface;\n    border: 1px solid $color-border;\n    border-radius: $border-radius-md;\n    box-shadow: $shadow-lg;\n    z-index: 1000;\n    @include custom-scrollbar;\n\n    .country-option {\n      @include flex-start;\n      padding: $spacing-3 $spacing-4;\n      cursor: pointer;\n      transition: background $transition-fast;\n\n      &:hover {\n        background: $color-background-alt;\n      }\n\n      .fi-sm {\n        font-size: 0.95rem;\n        margin-right: $spacing-3;\n      }\n\n      span {\n        font-size: $font-size-sm;\n        color: $color-text-primary;\n      }\n    }\n  }\n}\n\n.forgot-password[_ngcontent-%COMP%] {\n  display: block;\n  text-align: right;\n  font-size: $font-size-sm;\n  color: $color-primary;\n  margin-bottom: $spacing-6;\n  transition: color $transition-base;\n\n  &:hover {\n    color: #19a927;\n  }\n}\n\n.submit-button[_ngcontent-%COMP%] {\n  @include button-base;\n  @include button-variant($color-accent);\n  width: 100%;\n  padding: $spacing-4;\n  font-size: $font-size-base;\n  font-weight: $font-weight-semibold;\n\n  &:disabled {\n    background: $color-text-muted;\n  }\n\n  .loading-spinner {\n    margin-right: $spacing-2;\n  }\n}\n\n.alert[_ngcontent-%COMP%] {\n  padding: $spacing-3 $spacing-4;\n  border-radius: $border-radius-md;\n  margin-bottom: $spacing-4;\n  font-size: $font-size-sm;\n\n  &.alert-error {\n    background: rgba($color-error, 0.1);\n    border: 1px solid rgba($color-error, 0.3);\n    color: color.adjust($color-error, $lightness: -10%);\n  }\n\n  &.alert-success {\n    background: rgba($color-success, 0.1);\n    border: 1px solid rgba($color-success, 0.3);\n    color: color.adjust($color-success, $lightness: -10%);\n  }\n}\n\n.signup-link[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-top: $spacing-6;\n  font-size: $font-size-sm;\n  color: $color-text-secondary;\n\n  a {\n    color: $color-primary;\n    font-weight: $font-weight-semibold;\n    margin-left: $spacing-1;\n\n    &:hover {\n      color: $color-primary-dark;\n    }\n  }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-login', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe], template: "<div class=\"min-h-screen bg-gray-950 text-white flex items-center justify-center p-4\">\r\n  <div class=\"absolute inset-0 bg-cover bg-center opacity-10\" style=\"background-image: url('/assets/boardroom-bg.jpg');\"></div>\r\n  <div [class]=\"'absolute -top-1/4 -start-1/4 w-1/2 h-1/2 rounded-full filter blur-3xl opacity-50 animate-pulse ' + theme().bgGlow\"></div>\r\n  <div [class]=\"'absolute -bottom-1/4 -end-1/4 w-1/2 h-1/2 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000 ' + theme().bgGlowSecond\"></div>\r\n\r\n  <div class=\"relative z-10 w-full max-w-sm\">\r\n    <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6\">\r\n      <button type=\"button\" (click)=\"close()\" aria-label=\"Close\" class=\"absolute top-3 end-3 z-50 text-gray-200 hover:text-white p-2 rounded-full bg-slate-800/70 hover:bg-slate-700 ring-1 ring-white/5\">\r\n        <svg class=\"w-5 h-5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\r\n          <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\r\n          <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\r\n        </svg>\r\n      </button>\r\n      \r\n      <!-- Role Toggle (hidden) -->\r\n      <div *ngIf=\"false\" class=\"flex justify-center mb-5\">\r\n        <div class=\"bg-slate-950/50 p-1 rounded-lg flex border border-slate-700/50\">\r\n          <button type=\"button\" \r\n            (click)=\"role.set('founder')\"\r\n            [class]=\"'px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ' + (role() === 'founder' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-gray-200')\">\r\n            {{ 'login.founder' | translate }}\r\n          </button>\r\n          <button type=\"button\" \r\n            (click)=\"role.set('investor')\"\r\n            [class]=\"'px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ' + (role() === 'investor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-200')\">\r\n            {{ 'login.investor' | translate }}\r\n          </button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"text-center mb-5\">\r\n        <a routerLink=\"/\" class=\"flex items-center justify-center mb-4\">\r\n          <svg [class]=\"'h-10 w-10 ' + theme().iconColor\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n            <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\r\n            <path d=\"M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\r\n            <path d=\"M10 14l2 -2l2 -2\"></path>\r\n            <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\r\n            <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\r\n         </svg>\r\n          <span class=\"text-white text-3xl font-bold ms-2\">Investa</span>\r\n        </a>\r\n        <h2 class=\"text-xl font-bold text-white\">{{ 'login.title' | translate }}</h2>\r\n        <p class=\"text-gray-300 text-sm\">{{ (isFounder() ? 'login.subtitleFounder' : 'login.subtitleInvestor') | translate }}</p>\r\n      </div>\r\n\r\n      <form [formGroup]=\"loginForm\" (ngSubmit)=\"onSubmit()\" class=\"space-y-5\">\r\n        <div *ngIf=\"errorMessage()\" class=\"mb-2\">\r\n          <div class=\"rounded-md bg-red-600/20 border border-red-600 text-red-200 px-4 py-2 text-sm\">\r\n            {{ errorMessage() }}\r\n          </div>\r\n        </div>\r\n\r\n        <div>\r\n          <label for=\"mobile\" class=\"block text-sm font-medium text-gray-300\">{{ (isFounder() ? 'login.mobileLabelFounder' : 'login.mobileLabel') | translate }}</label>\r\n          <div class=\"mt-1 flex rounded-md shadow-sm\">\r\n            <div class=\"relative\">\r\n              <button type=\"button\" (click)=\"isDropdownOpen.set(!isDropdownOpen())\" \r\n                [class]=\"'relative z-10 w-full bg-slate-800 border border-slate-700 rounded-l-md shadow-sm pl-4 pr-12 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 sm:text-sm transition-colors duration-200 ' + theme().ringFocus + ' ' + theme().borderFocus\">\r\n                  <span class=\"flex items-center country-button\">\r\n                  <span class=\"fi fi-{{ selectedCountry()?.flag }} fi-sm country-flag rounded\"></span>\r\n                  <span class=\"block truncate text-base text-white\">{{ selectedCountry()?.code }}</span>\r\n                </span>\r\n                <span class=\"ms-3 absolute inset-y-0 end-0 flex items-center pr-3 pointer-events-none\">\r\n                  <svg class=\"h-6 w-6 text-gray-400\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" fill=\"currentColor\" aria-hidden=\"true\">\r\n                    <path fill-rule=\"evenodd\" d=\"M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z\" clip-rule=\"evenodd\" />\r\n                  </svg>\r\n                </span>\r\n              </button>\r\n              <div *ngIf=\"isDropdownOpen()\" class=\"absolute z-20 mt-2 w-72 bg-slate-800 border border-slate-700 shadow-lg max-h-64 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm\">\r\n                <a *ngFor=\"let country of countries\" (click)=\"selectCountry(country)\" class=\"text-gray-200 cursor-pointer select-none relative px-4 py-2 hover:bg-slate-700 flex items-center transition-colors duration-150\">\r\n                  <span class=\"fi fi-{{ country.flag }} fi-sm mr-4 rounded\"></span>\r\n                  <span class=\"font-semibold block truncate\">{{ country.nameKey | translate }}</span>\r\n                  <span class=\"text-gray-400 ml-auto pl-3\">{{ country.code }}</span>\r\n                </a>\r\n              </div>\r\n            </div>\r\n            <input id=\"mobile\" type=\"tel\" formControlName=\"mobile\" [placeholder]=\"'login.mobilePlaceholder' | translate\" \r\n              [class]=\"'block w-full bg-slate-800 border-y border-r border-slate-700 rounded-r-md shadow-sm py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ' + theme().ringFocus + ' ' + theme().borderFocus\">\r\n          </div>\r\n        </div>\r\n\r\n        <div>\r\n          <label for=\"password\" class=\"block text-sm font-medium text-gray-300\">{{ 'login.passwordLabel' | translate }}</label>\r\n            <input id=\"password\" type=\"password\" formControlName=\"password\" [placeholder]=\"(isFounder() ? 'login.passwordPlaceholderFounder' : 'login.passwordPlaceholder') | translate\" \r\n            [class]=\"'mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ' + theme().ringFocus + ' ' + theme().borderFocus\">\r\n        </div>\r\n\r\n        <div class=\"flex items-center justify-between\">\r\n          <div class=\"flex items-center\">\r\n            <input id=\"remember-me\" name=\"remember-me\" type=\"checkbox\" [class]=\"'h-4 w-4 bg-slate-700 border-slate-600 rounded ' + theme().checkboxText\">\r\n            <label for=\"remember-me\" class=\"ms-2 block text-sm text-gray-400\">{{ 'login.rememberMe' | translate }}</label>\r\n          </div>\r\n          <div class=\"text-sm\">\r\n            <a href=\"#\" [class]=\"'font-medium ' + theme().textAccent + ' ' + theme().textHover\">{{ 'login.forgotPassword' | translate }}</a>\r\n          </div>\r\n        </div>\r\n\r\n        <div>\r\n          <button type=\"submit\" [disabled]=\"!loginForm.valid || isSubmitting()\" \r\n            [class]=\"'w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 ' + theme().primaryGradient\">\r\n            <span *ngIf=\"!isSubmitting()\">{{ 'login.signInButton' | translate }}</span>\r\n            <span *ngIf=\"isSubmitting()\">{{ 'login.signingIn' | translate }}</span>\r\n          </button>\r\n        </div>\r\n      </form>\r\n\r\n      <div class=\"mt-5\">\r\n        <div class=\"relative\">\r\n          <div class=\"absolute inset-0 flex items-center\">\r\n            <div class=\"w-full border-t border-slate-700\"></div>\r\n          </div>\r\n          <div class=\"relative flex justify-center text-sm\">\r\n            <span class=\"px-2 bg-slate-900 text-gray-400\">{{ 'login.orContinueWith' | translate }}</span>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"mt-5 grid grid-cols-2 gap-4\">\r\n          <a href=\"#\" class=\"w-full inline-flex justify-center py-2.5 px-4 border border-slate-700 rounded-md shadow-sm bg-slate-800 text-sm font-medium text-gray-300 hover:bg-slate-700\">\r\n            <span class=\"sr-only\">{{ 'login.social.google' | translate }}</span>\r\n            <svg class=\"w-5 h-5\" aria-hidden=\"true\" fill=\"currentColor\" viewBox=\"0 0 24 24\">\r\n              <path d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\" fill=\"#4285F4\"/>\r\n              <path d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\" fill=\"#34A853\"/>\r\n              <path d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z\" fill=\"#FBBC05\"/>\r\n              <path d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\" fill=\"#EA4335\"/>\r\n            </svg>\r\n          </a>\r\n          <a href=\"#\" class=\"w-full inline-flex justify-center py-2.5 px-4 border border-slate-700 rounded-md shadow-sm bg-slate-800 text-sm font-medium text-gray-300 hover:bg-slate-700\">\r\n            <span class=\"sr-only\">{{ 'login.social.facebook' | translate }}</span>\r\n            <svg class=\"w-5 h-5\" aria-hidden=\"true\" fill=\"currentColor\" viewBox=\"0 0 24 24\">\r\n                <path fill-rule=\"evenodd\" d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z\" clip-rule=\"evenodd\" />\r\n            </svg>\r\n          </a>\r\n        </div>\r\n\r\n        <p class=\"mt-8 text-center text-sm text-gray-400\">\r\n          {{ 'login.notAMember' | translate }}\r\n          <a routerLink=\"/signup\" [class]=\"'font-medium ' + theme().textAccent + ' ' + theme().textHover\">{{ 'login.signUpNow' | translate }}</a>\r\n        </p>\r\n\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>", styles: ["@use \"variables\" as *;\n@use \"sass:color\" as color;\n@use \"mixins\" as *;\n\n:host {\n  display: block;\n  min-height: 100vh;\n}\n\n.login-page {\n  min-height: 100vh;\n  @include flex-center;\n  background: linear-gradient(135deg, $color-accent 0%, #19a927 100%);\n  padding: $spacing-4;\n  position: relative;\n  overflow: hidden;\n\n  &::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');\n    opacity: 0.1;\n  }\n}\n\n.login-container {\n  position: relative;\n  z-index: 1000;\n  width: 100%;\n  max-width: 440px;\n  @include fade-in(0.4s);\n}\n\n.login-card {\n  @include card($spacing-8);\n  background: rgba($color-surface, 0.98);\n  backdrop-filter: blur(10px);\n\n  @include respond-to('md') {\n    padding: $spacing-10;\n  }\n}\n\n.login-header {\n  text-align: center;\n  margin-bottom: $spacing-8;\n\n  h1 {\n    @include heading('lg');\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n  }\n\n  p {\n    color: $color-text-secondary;\n    font-size: $font-size-sm;\n  }\n}\n\n.role-selector {\n  @include flex-between;\n  gap: $spacing-3;\n  margin-bottom: $spacing-6;\n  padding: $spacing-1;\n  background: $color-background-alt;\n  border-radius: $border-radius-md;\n\n  button {\n    flex: 1;\n    @include button-base;\n    @include button-size('md');\n    background: transparent;\n    color: $color-text-secondary;\n    font-weight: $font-weight-medium;\n    transition: all $transition-base;\n\n    &.active {\n      background: $color-surface;\n      color: $color-accent;\n      box-shadow: $shadow-sm;\n    }\n\n    &:hover:not(.active) {\n      background: rgba($color-surface, 0.5);\n    }\n  }\n}\n\n.form-group {\n  margin-bottom: $spacing-5;\n\n  label {\n    display: block;\n    font-size: $font-size-sm;\n    font-weight: $font-weight-medium;\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n  }\n\n  input, select {\n    @include input-base;\n\n    &.error {\n      border-color: $color-error;\n    }\n  }\n\n  .error-message {\n    display: block;\n    font-size: $font-size-xs;\n    color: $color-error;\n    margin-top: $spacing-2;\n  }\n}\n\n.country-selector {\n  position: relative;\n\n  .country-button {\n    @include input-base;\n    @include flex-between;\n    cursor: pointer;\n    transition: all $transition-base;\n\n    &:hover {\n      border-color: $color-accent;\n    }\n\n    .fi-sm {\n      font-size: 0.95rem;\n      margin-right: $spacing-2;\n    }\n  }\n\n  .country-dropdown {\n    position: absolute;\n    top: calc(100% + $spacing-1);\n    left: 0;\n    right: 0;\n    max-height: 250px;\n    overflow-y: auto;\n    background: $color-surface;\n    border: 1px solid $color-border;\n    border-radius: $border-radius-md;\n    box-shadow: $shadow-lg;\n    z-index: 1000;\n    @include custom-scrollbar;\n\n    .country-option {\n      @include flex-start;\n      padding: $spacing-3 $spacing-4;\n      cursor: pointer;\n      transition: background $transition-fast;\n\n      &:hover {\n        background: $color-background-alt;\n      }\n\n      .fi-sm {\n        font-size: 0.95rem;\n        margin-right: $spacing-3;\n      }\n\n      span {\n        font-size: $font-size-sm;\n        color: $color-text-primary;\n      }\n    }\n  }\n}\n\n.forgot-password {\n  display: block;\n  text-align: right;\n  font-size: $font-size-sm;\n  color: $color-primary;\n  margin-bottom: $spacing-6;\n  transition: color $transition-base;\n\n  &:hover {\n    color: #19a927;\n  }\n}\n\n.submit-button {\n  @include button-base;\n  @include button-variant($color-accent);\n  width: 100%;\n  padding: $spacing-4;\n  font-size: $font-size-base;\n  font-weight: $font-weight-semibold;\n\n  &:disabled {\n    background: $color-text-muted;\n  }\n\n  .loading-spinner {\n    margin-right: $spacing-2;\n  }\n}\n\n.alert {\n  padding: $spacing-3 $spacing-4;\n  border-radius: $border-radius-md;\n  margin-bottom: $spacing-4;\n  font-size: $font-size-sm;\n\n  &.alert-error {\n    background: rgba($color-error, 0.1);\n    border: 1px solid rgba($color-error, 0.3);\n    color: color.adjust($color-error, $lightness: -10%);\n  }\n\n  &.alert-success {\n    background: rgba($color-success, 0.1);\n    border: 1px solid rgba($color-success, 0.3);\n    color: color.adjust($color-success, $lightness: -10%);\n  }\n}\n\n.signup-link {\n  text-align: center;\n  margin-top: $spacing-6;\n  font-size: $font-size-sm;\n  color: $color-text-secondary;\n\n  a {\n    color: $color-primary;\n    font-weight: $font-weight-semibold;\n    margin-left: $spacing-1;\n\n    &:hover {\n      color: $color-primary-dark;\n    }\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginComponent, { className: "LoginComponent", filePath: "src/app/pages/login/login.component.ts", lineNumber: 20 }); })();
