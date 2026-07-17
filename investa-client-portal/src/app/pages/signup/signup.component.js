import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function SignupComponent_Conditional_67_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "signup.passwordMismatch"));
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
        this.signupForm = new FormGroup({
            mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.email]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)]),
            confirmPassword: new FormControl('', [Validators.required])
        }, { validators: passwordMatchValidator });
    }
    onSubmit() {
        if (this.signupForm.valid) {
            // Handle signup logic here
        }
    }
    close() {
        this.router.navigate(['/']);
    }
    static { this.ɵfac = function SignupComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SignupComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SignupComponent, selectors: [["app-signup"]], decls: 78, vars: 57, consts: [[1, "min-h-screen", "bg-gray-950", "text-white", "flex", "items-center", "justify-center", "p-4"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-10", 2, "background-image", "url('assets/boardroom-bg.jpg')"], [1, "absolute", "-top-1/4", "-start-1/4", "w-1/2", "h-1/2", "bg-blue-500/10", "rounded-full", "filter", "blur-3xl", "opacity-50", "animate-pulse"], [1, "absolute", "-bottom-1/4", "-end-1/4", "w-1/2", "h-1/2", "bg-purple-600/10", "rounded-full", "filter", "blur-3xl", "opacity-50", "animate-pulse", "animation-delay-4000"], [1, "relative", "z-10", "w-full", "max-w-md"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-8"], ["type", "button", "aria-label", "Close", 1, "absolute", "top-3", "end-3", "text-gray-400", "hover:text-white", "p-2", "rounded-full", "bg-slate-800/50", 3, "click"], ["viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round", "aria-hidden", "true", 1, "w-5", "h-5"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18"], [1, "text-center", "mb-8"], ["routerLink", "/", 1, "flex", "items-center", "justify-center", "mb-4"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round", 1, "h-10", "w-10", "text-blue-400"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "text-white", "text-3xl", "font-bold", "ms-2"], [1, "text-2xl", "font-bold", "text-white"], [1, "text-gray-400"], [1, "space-y-4", 3, "ngSubmit", "formGroup"], ["for", "mobile", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "mobile", "type", "tel", "formControlName", "mobile", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], [1, "grid", "grid-cols-2", "gap-4"], ["for", "firstName", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "firstName", "type", "text", "formControlName", "firstName", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "lastName", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "lastName", "type", "text", "formControlName", "lastName", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "email", 1, "block", "text-sm", "font-medium", "text-gray-300"], [1, "text-gray-500"], ["id", "email", "type", "email", "formControlName", "email", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "password", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "password", "type", "password", "formControlName", "password", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], ["for", "confirmPassword", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "confirmPassword", "type", "password", "formControlName", "confirmPassword", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500", 3, "placeholder"], [1, "text-red-400", "text-sm", "mt-1"], [1, "pt-2"], ["type", "submit", 1, "w-full", "flex", "justify-center", "py-3", "px-4", "border", "border-transparent", "rounded-full", "shadow-sm", "text-sm", "font-medium", "text-white", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "hover:opacity-90", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-opacity", "duration-300", 3, "disabled"], [1, "mt-6", "text-center", "text-sm", "text-gray-400"], ["routerLink", "/login", 1, "font-medium", "text-blue-400", "hover:text-blue-300"]], template: function SignupComponent_Template(rf, ctx) { if (rf & 1) {
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
            i0.ɵɵtext(19, "Investa");
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
            i0.ɵɵelementStart(50, "span", 30);
            i0.ɵɵtext(51);
            i0.ɵɵpipe(52, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelement(53, "input", 31);
            i0.ɵɵpipe(54, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "div")(56, "label", 32);
            i0.ɵɵtext(57);
            i0.ɵɵpipe(58, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(59, "input", 33);
            i0.ɵɵpipe(60, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(61, "div")(62, "label", 34);
            i0.ɵɵtext(63);
            i0.ɵɵpipe(64, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(65, "input", 35);
            i0.ɵɵpipe(66, "translate");
            i0.ɵɵconditionalCreate(67, SignupComponent_Conditional_67_Template, 3, 3, "p", 36);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(68, "div", 37)(69, "button", 38);
            i0.ɵɵtext(70);
            i0.ɵɵpipe(71, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(72, "p", 39);
            i0.ɵɵtext(73);
            i0.ɵɵpipe(74, "translate");
            i0.ɵɵelementStart(75, "a", 40);
            i0.ɵɵtext(76);
            i0.ɵɵpipe(77, "translate");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            let tmp_16_0;
            i0.ɵɵadvance(21);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 21, "signup.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 23, "signup.subtitle"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("formGroup", ctx.signupForm);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 25, "signup.mobileLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(32, 27, "signup.mobilePlaceholder"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 29, "signup.firstNameLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(39, 31, "signup.firstNamePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 33, "signup.lastNameLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(45, 35, "signup.lastNamePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(49, 37, "signup.emailLabel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1("(", i0.ɵɵpipeBind1(52, 39, "signup.optional"), ")");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(54, 41, "signup.emailPlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(58, 43, "signup.passwordLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(60, 45, "signup.passwordPlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(64, 47, "signup.confirmPasswordLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(66, 49, "signup.confirmPasswordPlaceholder"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.signupForm.hasError("passwordMismatch") && ((tmp_16_0 = ctx.signupForm.get("confirmPassword")) == null ? null : tmp_16_0.touched) ? 67 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.signupForm.valid);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(71, 51, "signup.signUpButton"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(74, 53, "signup.alreadyHaveAccount"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(77, 55, "signup.signIn"));
        } }, dependencies: [CommonModule, RouterLink, ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, TranslatePipe], styles: ["@use 'variables' as *;\n@use 'sass:color' as color;\n@use 'mixins' as *;\n\n[_nghost-%COMP%] {\n  display: block;\n  min-height: 100vh;\n}\n\n.signup-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  @include flex-center;\n  background: linear-gradient(135deg, $color-accent 0%, #19a927 100%);\n  padding: $spacing-4;\n  position: relative;\n  overflow: hidden;\n\n  &::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');\n    opacity: 0.1;\n  }\n}\n\n.signup-container[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1000;\n  width: 100%;\n  max-width: 550px;\n  @include fade-in(0.4s);\n}\n\n.signup-card[_ngcontent-%COMP%] {\n  @include card($spacing-8);\n  background: rgba($color-surface, 0.98);\n  backdrop-filter: blur(10px);\n\n  @include respond-to('md') {\n    padding: $spacing-10;\n  }\n}\n\n.signup-header[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: $spacing-8;\n\n  h1 {\n    @include heading('lg');\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n  }\n\n  p {\n    color: $color-text-secondary;\n    font-size: $font-size-sm;\n  }\n}\n\n.form-row[_ngcontent-%COMP%] {\n  @include flex-between;\n  gap: $spacing-4;\n  margin-bottom: $spacing-5;\n\n  .form-group {\n    flex: 1;\n    margin-bottom: 0;\n  }\n\n  @media (max-width: $breakpoint-sm) {\n    flex-direction: column;\n    gap: $spacing-5;\n\n    .form-group {\n      width: 100%;\n    }\n  }\n}\n\n.form-group[_ngcontent-%COMP%] {\n  margin-bottom: $spacing-5;\n\n  label {\n    display: block;\n    font-size: $font-size-sm;\n    font-weight: $font-weight-medium;\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n\n    .required {\n      color: $color-error;\n      margin-left: $spacing-1;\n    }\n  }\n\n  input {\n    @include input-base;\n\n    &.error {\n      border-color: $color-error;\n    }\n  }\n\n  .error-message {\n    display: block;\n    font-size: $font-size-xs;\n    color: $color-error;\n    margin-top: $spacing-2;\n  }\n\n  .hint {\n    display: block;\n    font-size: $font-size-xs;\n    color: $color-text-muted;\n    margin-top: $spacing-2;\n  }\n}\n\n.password-requirements[_ngcontent-%COMP%] {\n  margin-top: $spacing-3;\n  padding: $spacing-3;\n  background: $color-background-alt;\n  border-radius: $border-radius-sm;\n  font-size: $font-size-xs;\n\n  ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n\n    li {\n      padding: $spacing-1 0;\n      color: $color-text-secondary;\n      @include flex-start;\n      gap: $spacing-2;\n\n      &.valid {\n        color: $color-success;\n      }\n\n      &::before {\n        content: '\u2713';\n        font-weight: $font-weight-bold;\n      }\n    }\n  }\n}\n\n.terms-checkbox[_ngcontent-%COMP%] {\n  @include flex-start;\n  gap: $spacing-2;\n  margin-bottom: $spacing-6;\n\n  input[type=\"checkbox\"] {\n    width: 18px;\n    height: 18px;\n    cursor: pointer;\n    accent-color: $color-accent;\n  }\n\n  label {\n    font-size: $font-size-sm;\n    color: $color-text-secondary;\n    margin: 0;\n\n    a {\n      color: $color-accent;\n      text-decoration: underline;\n\n      &:hover {\n        color: #19a927;\n      }\n    }\n  }\n}\n\n.submit-button[_ngcontent-%COMP%] {\n  @include button-base;\n  @include button-variant($color-primary);\n  width: 100%;\n  padding: $spacing-4;\n  font-size: $font-size-base;\n  font-weight: $font-weight-semibold;\n\n  &:disabled {\n    background: $color-text-muted;\n  }\n}\n\n.login-link[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-top: $spacing-6;\n  font-size: $font-size-sm;\n  color: $color-text-secondary;\n\n  a {\n    color: $color-primary;\n    font-weight: $font-weight-semibold;\n    margin-left: $spacing-1;\n\n    &:hover {\n      color: $color-primary-dark;\n    }\n  }\n}\n\n.alert[_ngcontent-%COMP%] {\n  padding: $spacing-3 $spacing-4;\n  border-radius: $border-radius-md;\n  margin-bottom: $spacing-4;\n  font-size: $font-size-sm;\n\n  &.alert-error {\n    background: rgba($color-error, 0.1);\n    border: 1px solid rgba($color-error, 0.3);\n    color: color.adjust($color-error, $lightness: -10%);\n  }\n\n  &.alert-success {\n    background: rgba($color-success, 0.1);\n    border: 1px solid rgba($color-success, 0.3);\n    color: color.adjust($color-success, $lightness: -10%);\n  }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SignupComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-signup', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe], template: "<div class=\"min-h-screen bg-gray-950 text-white flex items-center justify-center p-4\">\r\n  <div class=\"absolute inset-0 bg-cover bg-center opacity-10\" style=\"background-image: url('assets/boardroom-bg.jpg');\"></div>\r\n  <div class=\"absolute -top-1/4 -start-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse\"></div>\r\n  <div class=\"absolute -bottom-1/4 -end-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000\"></div>\r\n\r\n  <div class=\"relative z-10 w-full max-w-md\">\r\n    <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-8\">\r\n      <button type=\"button\" (click)=\"close()\" aria-label=\"Close\" class=\"absolute top-3 end-3 text-gray-400 hover:text-white p-2 rounded-full bg-slate-800/50\">\r\n        <svg class=\"w-5 h-5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\r\n          <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\r\n          <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\r\n        </svg>\r\n      </button>\r\n      <div class=\"text-center mb-8\">\r\n        <a routerLink=\"/\" class=\"flex items-center justify-center mb-4\">\r\n          <svg class=\"h-10 w-10 text-blue-400\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n            <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\r\n            <path d=\"M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\r\n            <path d=\"M10 14l2 -2l2 -2\"></path>\r\n            <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\r\n            <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\r\n         </svg>\r\n          <span class=\"text-white text-3xl font-bold ms-2\">Investa</span>\r\n        </a>\r\n        <h2 class=\"text-2xl font-bold text-white\">{{ 'signup.title' | translate }}</h2>\r\n        <p class=\"text-gray-400\">{{ 'signup.subtitle' | translate }}</p>\r\n      </div>\r\n\r\n      <form [formGroup]=\"signupForm\" (ngSubmit)=\"onSubmit()\" class=\"space-y-4\">\r\n        <div>\r\n          <label for=\"mobile\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.mobileLabel' | translate }}</label>\r\n          <input id=\"mobile\" type=\"tel\" formControlName=\"mobile\" [placeholder]=\"'signup.mobilePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n        </div>\r\n\r\n        <div class=\"grid grid-cols-2 gap-4\">\r\n          <div>\r\n            <label for=\"firstName\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.firstNameLabel' | translate }}</label>\r\n            <input id=\"firstName\" type=\"text\" formControlName=\"firstName\" [placeholder]=\"'signup.firstNamePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n          </div>\r\n          <div>\r\n            <label for=\"lastName\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.lastNameLabel' | translate }}</label>\r\n            <input id=\"lastName\" type=\"text\" formControlName=\"lastName\" [placeholder]=\"'signup.lastNamePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n          </div>\r\n        </div>\r\n        \r\n        <div>\r\n          <label for=\"email\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.emailLabel' | translate }} <span class=\"text-gray-500\">({{ 'signup.optional' | translate }})</span></label>\r\n          <input id=\"email\" type=\"email\" formControlName=\"email\" [placeholder]=\"'signup.emailPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n        </div>\r\n\r\n        <div>\r\n          <label for=\"password\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.passwordLabel' | translate }}</label>\r\n          <input id=\"password\" type=\"password\" formControlName=\"password\" [placeholder]=\"'signup.passwordPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n        </div>\r\n\r\n        <div>\r\n          <label for=\"confirmPassword\" class=\"block text-sm font-medium text-gray-300\">{{ 'signup.confirmPasswordLabel' | translate }}</label>\r\n          <input id=\"confirmPassword\" type=\"password\" formControlName=\"confirmPassword\" [placeholder]=\"'signup.confirmPasswordPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\">\r\n          @if (signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched) {\r\n            <p class=\"text-red-400 text-sm mt-1\">{{ 'signup.passwordMismatch' | translate }}</p>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"pt-2\">\r\n          <button type=\"submit\" [disabled]=\"!signupForm.valid\" class=\"w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300\">\r\n            {{ 'signup.signUpButton' | translate }}\r\n          </button>\r\n        </div>\r\n      </form>\r\n\r\n      <p class=\"mt-6 text-center text-sm text-gray-400\">\r\n        {{ 'signup.alreadyHaveAccount' | translate }}\r\n        <a routerLink=\"/login\" class=\"font-medium text-blue-400 hover:text-blue-300\">{{ 'signup.signIn' | translate }}</a>\r\n      </p>\r\n\r\n    </div>\r\n  </div>\r\n</div>", styles: ["@use 'variables' as *;\n@use 'sass:color' as color;\n@use 'mixins' as *;\n\n:host {\n  display: block;\n  min-height: 100vh;\n}\n\n.signup-page {\n  min-height: 100vh;\n  @include flex-center;\n  background: linear-gradient(135deg, $color-accent 0%, #19a927 100%);\n  padding: $spacing-4;\n  position: relative;\n  overflow: hidden;\n\n  &::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');\n    opacity: 0.1;\n  }\n}\n\n.signup-container {\n  position: relative;\n  z-index: 1000;\n  width: 100%;\n  max-width: 550px;\n  @include fade-in(0.4s);\n}\n\n.signup-card {\n  @include card($spacing-8);\n  background: rgba($color-surface, 0.98);\n  backdrop-filter: blur(10px);\n\n  @include respond-to('md') {\n    padding: $spacing-10;\n  }\n}\n\n.signup-header {\n  text-align: center;\n  margin-bottom: $spacing-8;\n\n  h1 {\n    @include heading('lg');\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n  }\n\n  p {\n    color: $color-text-secondary;\n    font-size: $font-size-sm;\n  }\n}\n\n.form-row {\n  @include flex-between;\n  gap: $spacing-4;\n  margin-bottom: $spacing-5;\n\n  .form-group {\n    flex: 1;\n    margin-bottom: 0;\n  }\n\n  @media (max-width: $breakpoint-sm) {\n    flex-direction: column;\n    gap: $spacing-5;\n\n    .form-group {\n      width: 100%;\n    }\n  }\n}\n\n.form-group {\n  margin-bottom: $spacing-5;\n\n  label {\n    display: block;\n    font-size: $font-size-sm;\n    font-weight: $font-weight-medium;\n    color: $color-text-primary;\n    margin-bottom: $spacing-2;\n\n    .required {\n      color: $color-error;\n      margin-left: $spacing-1;\n    }\n  }\n\n  input {\n    @include input-base;\n\n    &.error {\n      border-color: $color-error;\n    }\n  }\n\n  .error-message {\n    display: block;\n    font-size: $font-size-xs;\n    color: $color-error;\n    margin-top: $spacing-2;\n  }\n\n  .hint {\n    display: block;\n    font-size: $font-size-xs;\n    color: $color-text-muted;\n    margin-top: $spacing-2;\n  }\n}\n\n.password-requirements {\n  margin-top: $spacing-3;\n  padding: $spacing-3;\n  background: $color-background-alt;\n  border-radius: $border-radius-sm;\n  font-size: $font-size-xs;\n\n  ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n\n    li {\n      padding: $spacing-1 0;\n      color: $color-text-secondary;\n      @include flex-start;\n      gap: $spacing-2;\n\n      &.valid {\n        color: $color-success;\n      }\n\n      &::before {\n        content: '\u2713';\n        font-weight: $font-weight-bold;\n      }\n    }\n  }\n}\n\n.terms-checkbox {\n  @include flex-start;\n  gap: $spacing-2;\n  margin-bottom: $spacing-6;\n\n  input[type=\"checkbox\"] {\n    width: 18px;\n    height: 18px;\n    cursor: pointer;\n    accent-color: $color-accent;\n  }\n\n  label {\n    font-size: $font-size-sm;\n    color: $color-text-secondary;\n    margin: 0;\n\n    a {\n      color: $color-accent;\n      text-decoration: underline;\n\n      &:hover {\n        color: #19a927;\n      }\n    }\n  }\n}\n\n.submit-button {\n  @include button-base;\n  @include button-variant($color-primary);\n  width: 100%;\n  padding: $spacing-4;\n  font-size: $font-size-base;\n  font-weight: $font-weight-semibold;\n\n  &:disabled {\n    background: $color-text-muted;\n  }\n}\n\n.login-link {\n  text-align: center;\n  margin-top: $spacing-6;\n  font-size: $font-size-sm;\n  color: $color-text-secondary;\n\n  a {\n    color: $color-primary;\n    font-weight: $font-weight-semibold;\n    margin-left: $spacing-1;\n\n    &:hover {\n      color: $color-primary-dark;\n    }\n  }\n}\n\n.alert {\n  padding: $spacing-3 $spacing-4;\n  border-radius: $border-radius-md;\n  margin-bottom: $spacing-4;\n  font-size: $font-size-sm;\n\n  &.alert-error {\n    background: rgba($color-error, 0.1);\n    border: 1px solid rgba($color-error, 0.3);\n    color: color.adjust($color-error, $lightness: -10%);\n  }\n\n  &.alert-success {\n    background: rgba($color-success, 0.1);\n    border: 1px solid rgba($color-success, 0.3);\n    color: color.adjust($color-success, $lightness: -10%);\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SignupComponent, { className: "SignupComponent", filePath: "src/app/pages/signup/signup.component.ts", lineNumber: 26 }); })();
