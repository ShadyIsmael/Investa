import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function SignupComponent_Conditional_72_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 38);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "signup.passwordMismatch"));
} }
function SignupComponent_Conditional_73_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.errorMessage(), " ");
} }
export const passwordMatchValidator = (control) => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) {
        return null;
    }
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};
export class SignupComponent {
    constructor() {
        this.router = inject(Router);
        this.route = inject(ActivatedRoute, { optional: true });
        this.authService = inject(AuthService);
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.isSubmitting = signal(false, ...(ngDevMode ? [{ debugName: "isSubmitting" }] : []));
        this.signupForm = new FormGroup({
            mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)]),
            confirmPassword: new FormControl('', [Validators.required]),
            clientType: new FormControl('Investor', { nonNullable: true, validators: [Validators.required] })
        }, { validators: passwordMatchValidator });
        const requestedRole = this.route?.snapshot.queryParamMap.get('role')?.toLowerCase();
        if (requestedRole === 'founder')
            this.signupForm.controls.clientType.setValue('Founder');
        if (requestedRole === 'investor')
            this.signupForm.controls.clientType.setValue('Investor');
    }
    async onSubmit() {
        if (!this.signupForm.valid || this.isSubmitting())
            return;
        this.errorMessage.set(null);
        this.isSubmitting.set(true);
        const mobile = this.signupForm.get('mobile').value;
        const firstName = this.signupForm.get('firstName').value;
        const lastName = this.signupForm.get('lastName').value;
        const password = this.signupForm.get('password').value;
        const clientType = this.signupForm.get('clientType').value;
        try {
            const result = await this.authService.signupInit(mobile, password, firstName, lastName, clientType);
            this.router.navigate(['/signup-otp'], { queryParams: { session: result.verificationSessionId } });
        }
        catch (err) {
            this.errorMessage.set(err?.message || 'Signup failed. Please try again.');
        }
        finally {
            this.isSubmitting.set(false);
        }
    }
    close() {
        this.router.navigate(['/']);
    }
    static { this.ɵfac = function SignupComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SignupComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SignupComponent, selectors: [["app-signup"]], decls: 85, vars: 63, consts: [[1, "min-h-screen", "bg-gray-950", "text-white", "flex", "items-center", "justify-center", "p-4"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-10", 2, "background-image", "url('assets/boardroom-bg.jpg')"], [1, "absolute", "-top-1/4", "-start-1/4", "w-1/2", "h-1/2", "bg-blue-500/10", "rounded-full", "filter", "blur-3xl", "opacity-50", "animate-pulse"], [1, "absolute", "-bottom-1/4", "-end-1/4", "w-1/2", "h-1/2", "bg-purple-600/10", "rounded-full", "filter", "blur-3xl", "opacity-50", "animate-pulse", "animation-delay-4000"], [1, "relative", "z-10", "w-full", "max-w-md"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-8"], ["type", "button", "aria-label", "Close", 1, "absolute", "top-3", "end-3", "text-gray-400", "hover:text-white", "p-2", "rounded-full", "bg-slate-800/50", 3, "click"], ["viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round", "aria-hidden", "true", 1, "w-5", "h-5"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18"], [1, "text-center", "mb-8"], ["routerLink", "/", 1, "flex", "items-center", "justify-center", "mb-4"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round", 1, "h-10", "w-10", "text-blue-400"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "text-white", "text-3xl", "font-bold", "ms-2"], [1, "text-2xl", "font-bold", "text-white"], [1, "text-gray-400"], [1, "space-y-4", 3, "ngSubmit", "formGroup"], ["for", "mobile", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "mobile", "type", "tel", "formControlName", "mobile", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], [1, "grid", "grid-cols-2", "gap-4"], ["for", "firstName", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "firstName", "type", "text", "formControlName", "firstName", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "lastName", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "lastName", "type", "text", "formControlName", "lastName", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "clientType", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "clientType", "formControlName", "clientType", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500"], ["value", "Investor"], ["value", "Founder"], [1, "text-gray-500", "text-xs", "mt-1"], ["for", "password", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "password", "type", "password", "formControlName", "password", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "confirmPassword", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "confirmPassword", "type", "password", "formControlName", "confirmPassword", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], [1, "text-red-400", "text-sm", "mt-1"], ["role", "alert", 1, "bg-red-900/50", "border", "border-red-700", "text-red-300", "px-4", "py-3", "rounded-md", "text-sm"], [1, "pt-2"], ["type", "submit", 1, "w-full", "flex", "justify-center", "py-3", "px-4", "border", "border-transparent", "rounded-full", "shadow-sm", "text-sm", "font-medium", "text-white", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "hover:opacity-90", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-opacity", "duration-300", 3, "disabled"], [1, "mt-6", "text-center", "text-sm", "text-gray-400"], ["routerLink", "/login", 1, "font-medium", "text-blue-400", "hover:text-blue-300"]], template: function SignupComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "div", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵelementStart(4, "div", 4)(5, "div", 5)(6, "button", 6);
            i0.ɵɵlistener("click", function SignupComponent_Template_button_click_6_listener() { return ctx.close(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(7, "svg", 7);
            i0.ɵɵelement(8, "line", 8)(9, "line", 9);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(10, "div", 10)(11, "a", 11);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(12, "svg", 12);
            i0.ɵɵelement(13, "path", 13)(14, "path", 14)(15, "path", 15)(16, "path", 16)(17, "path", 17);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(18, "span", 18);
            i0.ɵɵtext(19, "FOPX One");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(20, "h2", 19);
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "p", 20);
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(26, "form", 21);
            i0.ɵɵlistener("ngSubmit", function SignupComponent_Template_form_ngSubmit_26_listener() { return ctx.onSubmit(); });
            i0.ɵɵelementStart(27, "div")(28, "label", 22);
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(31, "input", 23);
            i0.ɵɵpipe(32, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "div", 24)(34, "div")(35, "label", 25);
            i0.ɵɵtext(36);
            i0.ɵɵpipe(37, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(38, "input", 26);
            i0.ɵɵpipe(39, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "div")(41, "label", 27);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(44, "input", 28);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(46, "div")(47, "label", 29);
            i0.ɵɵtext(48);
            i0.ɵɵpipe(49, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(50, "select", 30)(51, "option", 31);
            i0.ɵɵtext(52);
            i0.ɵɵpipe(53, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(54, "option", 32);
            i0.ɵɵtext(55);
            i0.ɵɵpipe(56, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(57, "p", 33);
            i0.ɵɵtext(58);
            i0.ɵɵpipe(59, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(60, "div")(61, "label", 34);
            i0.ɵɵtext(62);
            i0.ɵɵpipe(63, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(64, "input", 35);
            i0.ɵɵpipe(65, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(66, "div")(67, "label", 36);
            i0.ɵɵtext(68);
            i0.ɵɵpipe(69, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(70, "input", 37);
            i0.ɵɵpipe(71, "translate");
            i0.ɵɵconditionalCreate(72, SignupComponent_Conditional_72_Template, 3, 3, "p", 38);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(73, SignupComponent_Conditional_73_Template, 2, 1, "div", 39);
            i0.ɵɵelementStart(74, "div", 40)(75, "button", 41);
            i0.ɵɵtext(76);
            i0.ɵɵpipe(77, "translate");
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(79, "p", 42);
            i0.ɵɵtext(80);
            i0.ɵɵpipe(81, "translate");
            i0.ɵɵelementStart(82, "a", 43);
            i0.ɵɵtext(83);
            i0.ɵɵpipe(84, "translate");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            let tmp_17_0;
            i0.ɵɵadvance(21);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 23, "signup.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 25, "signup.subtitle"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("formGroup", ctx.signupForm);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 27, "signup.mobileLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(32, 29, "signup.mobilePlaceholder"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 31, "signup.firstNameLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(39, 33, "signup.firstNamePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 35, "signup.lastNameLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(45, 37, "signup.lastNamePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(49, 39, "signup.accountTypeLabel"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 41, "signup.accountTypes.investor"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(56, 43, "signup.accountTypes.founder"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(59, 45, "signup.accountTypeHint"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(63, 47, "signup.passwordLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(65, 49, "signup.passwordPlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(69, 51, "signup.confirmPasswordLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(71, 53, "signup.confirmPasswordPlaceholder"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.signupForm.hasError("passwordMismatch") && ((tmp_17_0 = ctx.signupForm.get("confirmPassword")) == null ? null : tmp_17_0.touched) ? 72 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorMessage() ? 73 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.signupForm.valid || ctx.isSubmitting());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.isSubmitting() ? i0.ɵɵpipeBind1(77, 55, "signup.signingUp") : i0.ɵɵpipeBind1(78, 57, "signup.signUpButton"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(81, 59, "signup.alreadyHaveAccount"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(84, 61, "signup.signIn"));
        } }, dependencies: [CommonModule, RouterLink, ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'sass:color' as color;\r\n@use 'mixins' as *;\r\n\r\n[_nghost-%COMP%] {\r\n  display: block;\r\n  min-height: 100vh;\r\n}\r\n\r\n.signup-page[_ngcontent-%COMP%] {\r\n  min-height: 100vh;\r\n  @include flex-center;\r\n  background: linear-gradient(135deg, $color-accent 0%, #19a927 100%);\r\n  padding: $spacing-4;\r\n  position: relative;\r\n  overflow: hidden;\r\n\r\n  &::before {\r\n    content: '';\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');\r\n    opacity: 0.1;\r\n  }\r\n}\r\n\r\n.signup-container[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  z-index: 1000;\r\n  width: 100%;\r\n  max-width: 550px;\r\n  @include fade-in(0.4s);\r\n}\r\n\r\n.signup-card[_ngcontent-%COMP%] {\r\n  @include card($spacing-8);\r\n  background: rgba($color-surface, 0.98);\r\n  backdrop-filter: blur(10px);\r\n\r\n  @include respond-to('md') {\r\n    padding: $spacing-10;\r\n  }\r\n}\r\n\r\n.signup-header[_ngcontent-%COMP%] {\r\n  text-align: center;\r\n  margin-bottom: $spacing-8;\r\n\r\n  h1 {\r\n    @include heading('lg');\r\n    color: $color-text-primary;\r\n    margin-bottom: $spacing-2;\r\n  }\r\n\r\n  p {\r\n    color: $color-text-secondary;\r\n    font-size: $font-size-sm;\r\n  }\r\n}\r\n\r\n.form-row[_ngcontent-%COMP%] {\r\n  @include flex-between;\r\n  gap: $spacing-4;\r\n  margin-bottom: $spacing-5;\r\n\r\n  .form-group {\r\n    flex: 1;\r\n    margin-bottom: 0;\r\n  }\r\n\r\n  @media (max-width: $breakpoint-sm) {\r\n    flex-direction: column;\r\n    gap: $spacing-5;\r\n\r\n    .form-group {\r\n      width: 100%;\r\n    }\r\n  }\r\n}\r\n\r\n.form-group[_ngcontent-%COMP%] {\r\n  margin-bottom: $spacing-5;\r\n\r\n  label {\r\n    display: block;\r\n    font-size: $font-size-sm;\r\n    font-weight: $font-weight-medium;\r\n    color: $color-text-primary;\r\n    margin-bottom: $spacing-2;\r\n\r\n    .required {\r\n      color: $color-error;\r\n      margin-left: $spacing-1;\r\n    }\r\n  }\r\n\r\n  input {\r\n    @include input-base;\r\n\r\n    &.error {\r\n      border-color: $color-error;\r\n    }\r\n  }\r\n\r\n  .error-message {\r\n    display: block;\r\n    font-size: $font-size-xs;\r\n    color: $color-error;\r\n    margin-top: $spacing-2;\r\n  }\r\n\r\n  .hint {\r\n    display: block;\r\n    font-size: $font-size-xs;\r\n    color: $color-text-muted;\r\n    margin-top: $spacing-2;\r\n  }\r\n}\r\n\r\n.password-requirements[_ngcontent-%COMP%] {\r\n  margin-top: $spacing-3;\r\n  padding: $spacing-3;\r\n  background: $color-background-alt;\r\n  border-radius: $border-radius-sm;\r\n  font-size: $font-size-xs;\r\n\r\n  ul {\r\n    list-style: none;\r\n    margin: 0;\r\n    padding: 0;\r\n\r\n    li {\r\n      padding: $spacing-1 0;\r\n      color: $color-text-secondary;\r\n      @include flex-start;\r\n      gap: $spacing-2;\r\n\r\n      &.valid {\r\n        color: $color-success;\r\n      }\r\n\r\n      &::before {\r\n        content: '\u2713';\r\n        font-weight: $font-weight-bold;\r\n      }\r\n    }\r\n  }\r\n}\r\n\r\n.terms-checkbox[_ngcontent-%COMP%] {\r\n  @include flex-start;\r\n  gap: $spacing-2;\r\n  margin-bottom: $spacing-6;\r\n\r\n  input[type=\"checkbox\"] {\r\n    width: 18px;\r\n    height: 18px;\r\n    cursor: pointer;\r\n    accent-color: $color-accent;\r\n  }\r\n\r\n  label {\r\n    font-size: $font-size-sm;\r\n    color: $color-text-secondary;\r\n    margin: 0;\r\n\r\n    a {\r\n      color: $color-accent;\r\n      text-decoration: underline;\r\n\r\n      &:hover {\r\n        color: #19a927;\r\n      }\r\n    }\r\n  }\r\n}\r\n\r\n.submit-button[_ngcontent-%COMP%] {\r\n  @include button-base;\r\n  @include button-variant($color-primary);\r\n  width: 100%;\r\n  padding: $spacing-4;\r\n  font-size: $font-size-base;\r\n  font-weight: $font-weight-semibold;\r\n\r\n  &:disabled {\r\n    background: $color-text-muted;\r\n  }\r\n}\r\n\r\n.login-link[_ngcontent-%COMP%] {\r\n  text-align: center;\r\n  margin-top: $spacing-6;\r\n  font-size: $font-size-sm;\r\n  color: $color-text-secondary;\r\n\r\n  a {\r\n    color: $color-primary;\r\n    font-weight: $font-weight-semibold;\r\n    margin-left: $spacing-1;\r\n\r\n    &:hover {\r\n      color: $color-primary-dark;\r\n    }\r\n  }\r\n}\r\n\r\n.alert[_ngcontent-%COMP%] {\r\n  padding: $spacing-3 $spacing-4;\r\n  border-radius: $border-radius-md;\r\n  margin-bottom: $spacing-4;\r\n  font-size: $font-size-sm;\r\n\r\n  &.alert-error {\r\n    background: rgba($color-error, 0.1);\r\n    border: 1px solid rgba($color-error, 0.3);\r\n    color: color.adjust($color-error, $lightness: -10%);\r\n  }\r\n\r\n  &.alert-success {\r\n    background: rgba($color-success, 0.1);\r\n    border: 1px solid rgba($color-success, 0.3);\r\n    color: color.adjust($color-success, $lightness: -10%);\r\n  }\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SignupComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-signup', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe], template: "<div class=\"min-h-screen bg-gray-950 text-white flex items-center justify-center p-4\">\r\n  <div class=\"absolute inset-0 bg-cover bg-center opacity-10\" style=\"background-image: url('assets/boardroom-bg.jpg');\"></div>\r\n  <div class=\"absolute -top-1/4 -start-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse\"></div>\r\n  <div class=\"absolute -bottom-1/4 -end-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000\"></div>\r\n\r\n  <div class=\"relative z-10 w-full max-w-md\">\r\n    <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-8\">\r\n      <button type=\"button\" (click)=\"close()\" aria-label=\"Close\" class=\"absolute top-3 end-3 text-gray-400 hover:text-white p-2 rounded-full bg-slate-800/50\">\r\n        <svg class=\"w-5 h-5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\r\n          <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\r\n          <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\r\n        </svg>\r\n      </button>\r\n      <div class=\"text-center mb-8\">\r\n        <a routerLink=\"/\" class=\"flex items-center justify-center mb-4\">\r\n          <svg class=\"h-10 w-10 text-blue-400\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n            <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\r\n            <path d=\"M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\r\n            <path d=\"M10 14l2 -2l2 -2\"></path>\r\n            <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\r\n            <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\r\n         </svg>\r\n          <span class=\"text-white text-3xl font-bold ms-2\">FOPX One</span>\r\n        </a>\r\n        <h2 class=\"text-2xl font-bold text-white\">{{ 'signup.title' | translate }}</h2>\r\n        <p class=\"text-gray-400\">{{ 'signup.subtitle' | translate }}</p>\r\n      </div>\r\n\r\n      <form [formGroup]=\"signupForm\" (ngSubmit)=\"onSubmit()\" class=\"space-y-4\">\r\n        <div>\r\n          <label for=\"mobile\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.mobileLabel' | translate }}</label>\r\n          <input id=\"mobile\" type=\"tel\" formControlName=\"mobile\" [placeholder]=\"'signup.mobilePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n        </div>\r\n\r\n        <div class=\"grid grid-cols-2 gap-4\">\n          <div>\r\n            <label for=\"firstName\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.firstNameLabel' | translate }}</label>\r\n            <input id=\"firstName\" type=\"text\" formControlName=\"firstName\" [placeholder]=\"'signup.firstNamePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n          </div>\r\n          <div>\r\n            <label for=\"lastName\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.lastNameLabel' | translate }}</label>\r\n            <input id=\"lastName\" type=\"text\" formControlName=\"lastName\" [placeholder]=\"'signup.lastNamePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n          </div>\r\n        </div>\n\n        <div>\n          <label for=\"clientType\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.accountTypeLabel' | translate }}</label>\n          <select id=\"clientType\" formControlName=\"clientType\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\n            <option value=\"Investor\">{{ 'signup.accountTypes.investor' | translate }}</option>\n            <option value=\"Founder\">{{ 'signup.accountTypes.founder' | translate }}</option>\n          </select>\n          <p class=\"text-gray-500 text-xs mt-1\">{{ 'signup.accountTypeHint' | translate }}</p>\n        </div>\n        \n        <div>\n          <label for=\"password\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.passwordLabel' | translate }}</label>\r\n          <input id=\"password\" type=\"password\" formControlName=\"password\" [placeholder]=\"'signup.passwordPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n        </div>\r\n\r\n        <div>\r\n          <label for=\"confirmPassword\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.confirmPasswordLabel' | translate }}</label>\r\n          <input id=\"confirmPassword\" type=\"password\" formControlName=\"confirmPassword\" [placeholder]=\"'signup.confirmPasswordPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n          @if (signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched) {\r\n            <p class=\"text-red-400 text-sm mt-1\">{{ 'signup.passwordMismatch' | translate }}</p>\r\n          }\r\n        </div>\r\n\r\n        @if (errorMessage()) {\r\n          <div class=\"bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm\" role=\"alert\">\r\n            {{ errorMessage() }}\r\n          </div>\r\n        }\r\n\r\n        <div class=\"pt-2\">\r\n          <button type=\"submit\" [disabled]=\"!signupForm.valid || isSubmitting()\" class=\"w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300\">\r\n            {{ isSubmitting() ? ('signup.signingUp' | translate) : ('signup.signUpButton' | translate) }}\r\n          </button>\r\n        </div>\r\n      </form>\r\n\r\n      <p class=\"mt-6 text-center text-sm text-gray-400\">\r\n        {{ 'signup.alreadyHaveAccount' | translate }}\r\n        <a routerLink=\"/login\" class=\"font-medium text-blue-400 hover:text-blue-300\">{{ 'signup.signIn' | translate }}</a>\r\n      </p>\r\n\r\n    </div>\r\n  </div>\r\n</div>\n", styles: ["@use 'variables' as *;\r\n@use 'sass:color' as color;\r\n@use 'mixins' as *;\r\n\r\n:host {\r\n  display: block;\r\n  min-height: 100vh;\r\n}\r\n\r\n.signup-page {\r\n  min-height: 100vh;\r\n  @include flex-center;\r\n  background: linear-gradient(135deg, $color-accent 0%, #19a927 100%);\r\n  padding: $spacing-4;\r\n  position: relative;\r\n  overflow: hidden;\r\n\r\n  &::before {\r\n    content: '';\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');\r\n    opacity: 0.1;\r\n  }\r\n}\r\n\r\n.signup-container {\r\n  position: relative;\r\n  z-index: 1000;\r\n  width: 100%;\r\n  max-width: 550px;\r\n  @include fade-in(0.4s);\r\n}\r\n\r\n.signup-card {\r\n  @include card($spacing-8);\r\n  background: rgba($color-surface, 0.98);\r\n  backdrop-filter: blur(10px);\r\n\r\n  @include respond-to('md') {\r\n    padding: $spacing-10;\r\n  }\r\n}\r\n\r\n.signup-header {\r\n  text-align: center;\r\n  margin-bottom: $spacing-8;\r\n\r\n  h1 {\r\n    @include heading('lg');\r\n    color: $color-text-primary;\r\n    margin-bottom: $spacing-2;\r\n  }\r\n\r\n  p {\r\n    color: $color-text-secondary;\r\n    font-size: $font-size-sm;\r\n  }\r\n}\r\n\r\n.form-row {\r\n  @include flex-between;\r\n  gap: $spacing-4;\r\n  margin-bottom: $spacing-5;\r\n\r\n  .form-group {\r\n    flex: 1;\r\n    margin-bottom: 0;\r\n  }\r\n\r\n  @media (max-width: $breakpoint-sm) {\r\n    flex-direction: column;\r\n    gap: $spacing-5;\r\n\r\n    .form-group {\r\n      width: 100%;\r\n    }\r\n  }\r\n}\r\n\r\n.form-group {\r\n  margin-bottom: $spacing-5;\r\n\r\n  label {\r\n    display: block;\r\n    font-size: $font-size-sm;\r\n    font-weight: $font-weight-medium;\r\n    color: $color-text-primary;\r\n    margin-bottom: $spacing-2;\r\n\r\n    .required {\r\n      color: $color-error;\r\n      margin-left: $spacing-1;\r\n    }\r\n  }\r\n\r\n  input {\r\n    @include input-base;\r\n\r\n    &.error {\r\n      border-color: $color-error;\r\n    }\r\n  }\r\n\r\n  .error-message {\r\n    display: block;\r\n    font-size: $font-size-xs;\r\n    color: $color-error;\r\n    margin-top: $spacing-2;\r\n  }\r\n\r\n  .hint {\r\n    display: block;\r\n    font-size: $font-size-xs;\r\n    color: $color-text-muted;\r\n    margin-top: $spacing-2;\r\n  }\r\n}\r\n\r\n.password-requirements {\r\n  margin-top: $spacing-3;\r\n  padding: $spacing-3;\r\n  background: $color-background-alt;\r\n  border-radius: $border-radius-sm;\r\n  font-size: $font-size-xs;\r\n\r\n  ul {\r\n    list-style: none;\r\n    margin: 0;\r\n    padding: 0;\r\n\r\n    li {\r\n      padding: $spacing-1 0;\r\n      color: $color-text-secondary;\r\n      @include flex-start;\r\n      gap: $spacing-2;\r\n\r\n      &.valid {\r\n        color: $color-success;\r\n      }\r\n\r\n      &::before {\r\n        content: '\u2713';\r\n        font-weight: $font-weight-bold;\r\n      }\r\n    }\r\n  }\r\n}\r\n\r\n.terms-checkbox {\r\n  @include flex-start;\r\n  gap: $spacing-2;\r\n  margin-bottom: $spacing-6;\r\n\r\n  input[type=\"checkbox\"] {\r\n    width: 18px;\r\n    height: 18px;\r\n    cursor: pointer;\r\n    accent-color: $color-accent;\r\n  }\r\n\r\n  label {\r\n    font-size: $font-size-sm;\r\n    color: $color-text-secondary;\r\n    margin: 0;\r\n\r\n    a {\r\n      color: $color-accent;\r\n      text-decoration: underline;\r\n\r\n      &:hover {\r\n        color: #19a927;\r\n      }\r\n    }\r\n  }\r\n}\r\n\r\n.submit-button {\r\n  @include button-base;\r\n  @include button-variant($color-primary);\r\n  width: 100%;\r\n  padding: $spacing-4;\r\n  font-size: $font-size-base;\r\n  font-weight: $font-weight-semibold;\r\n\r\n  &:disabled {\r\n    background: $color-text-muted;\r\n  }\r\n}\r\n\r\n.login-link {\r\n  text-align: center;\r\n  margin-top: $spacing-6;\r\n  font-size: $font-size-sm;\r\n  color: $color-text-secondary;\r\n\r\n  a {\r\n    color: $color-primary;\r\n    font-weight: $font-weight-semibold;\r\n    margin-left: $spacing-1;\r\n\r\n    &:hover {\r\n      color: $color-primary-dark;\r\n    }\r\n  }\r\n}\r\n\r\n.alert {\r\n  padding: $spacing-3 $spacing-4;\r\n  border-radius: $border-radius-md;\r\n  margin-bottom: $spacing-4;\r\n  font-size: $font-size-sm;\r\n\r\n  &.alert-error {\r\n    background: rgba($color-error, 0.1);\r\n    border: 1px solid rgba($color-error, 0.3);\r\n    color: color.adjust($color-error, $lightness: -10%);\r\n  }\r\n\r\n  &.alert-success {\r\n    background: rgba($color-success, 0.1);\r\n    border: 1px solid rgba($color-success, 0.3);\r\n    color: color.adjust($color-success, $lightness: -10%);\r\n  }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SignupComponent, { className: "SignupComponent", filePath: "src/app/pages/signup/signup.component.ts", lineNumber: 28 }); })();
