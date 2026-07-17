import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
export class ContactFormComponent {
    constructor() {
        this.contactForm = new FormGroup({
            fullName: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            subject: new FormControl('', [Validators.required]),
            message: new FormControl('', [Validators.required, Validators.minLength(10)])
        });
    }
    onSubmit() {
        if (this.contactForm.valid) {
            // TODO: Send contact form data to server
            this.contactForm.reset();
        }
    }
    static { this.ɵfac = function ContactFormComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContactFormComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ContactFormComponent, selectors: [["app-contact-form"]], decls: 33, vars: 32, consts: [[1, "bg-slate-800/50", "border", "border-slate-700", "rounded-xl", "p-8"], [1, "text-3xl", "font-bold", "text-white", "mb-6"], [1, "space-y-6", 3, "ngSubmit", "formGroup"], ["for", "fullName", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "fullName", "type", "text", "formControlName", "fullName", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "placeholder"], ["for", "email", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "email", "type", "email", "formControlName", "email", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "placeholder"], ["for", "subject", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "subject", "type", "text", "formControlName", "subject", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "placeholder"], ["for", "message", 1, "block", "text-sm", "font-medium", "text-gray-300"], ["id", "message", "formControlName", "message", "rows", "5", 1, "mt-1", "block", "w-full", "bg-slate-800", "border", "border-slate-700", "rounded-md", "shadow-sm", "py-3", "px-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "placeholder"], ["type", "submit", 1, "w-full", "flex", "justify-center", "py-3", "px-4", "border", "border-transparent", "rounded-full", "shadow-sm", "text-sm", "font-medium", "text-white", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "hover:opacity-90", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-opacity", "duration-300", 3, "disabled"]], template: function ContactFormComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "h2", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "form", 2);
            i0.ɵɵlistener("ngSubmit", function ContactFormComponent_Template_form_ngSubmit_4_listener() { return ctx.onSubmit(); });
            i0.ɵɵelementStart(5, "div")(6, "label", 3);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(9, "input", 4);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "div")(12, "label", 5);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(15, "input", 6);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "div")(18, "label", 7);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(21, "input", 8);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "div")(24, "label", 9);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(27, "textarea", 10);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "div")(30, "button", 11);
            i0.ɵɵtext(31);
            i0.ɵɵpipe(32, "translate");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 12, "contactPage.form.title"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("formGroup", ctx.contactForm);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 14, "contactPage.form.nameLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 16, "contactPage.form.namePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 18, "contactPage.form.emailLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(16, 20, "contactPage.form.emailPlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 22, "contactPage.form.subjectLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(22, 24, "contactPage.form.subjectPlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 26, "contactPage.form.messageLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(28, 28, "contactPage.form.messagePlaceholder"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", !ctx.contactForm.valid);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(32, 30, "contactPage.form.button"), " ");
        } }, dependencies: [CommonModule, ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.contact-form[_ngcontent-%COMP%] { @include card($spacing-6); padding: $spacing-6; }\r\n.contact-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] { margin-bottom: $spacing-4; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContactFormComponent, [{
        type: Component,
        args: [{ selector: 'app-contact-form', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, ReactiveFormsModule, TranslatePipe], template: "<div class=\"bg-slate-800/50 border border-slate-700 rounded-xl p-8\">\r\n  <h2 class=\"text-3xl font-bold text-white mb-6\">{{ 'contactPage.form.title' | translate }}</h2>\r\n  <form [formGroup]=\"contactForm\" (ngSubmit)=\"onSubmit()\" class=\"space-y-6\">\r\n    <div>\r\n      <label for=\"fullName\" class=\"block text-sm font-medium text-gray-300\">{{ 'contactPage.form.nameLabel' | translate }}</label>\r\n      <input id=\"fullName\" type=\"text\" formControlName=\"fullName\" [placeholder]=\"'contactPage.form.namePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\">\r\n    </div>\r\n\r\n    <div>\r\n      <label for=\"email\" class=\"block text-sm font-medium text-gray-300\">{{ 'contactPage.form.emailLabel' | translate }}</label>\r\n      <input id=\"email\" type=\"email\" formControlName=\"email\" [placeholder]=\"'contactPage.form.emailPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\">\r\n    </div>\r\n\r\n    <div>\r\n      <label for=\"subject\" class=\"block text-sm font-medium text-gray-300\">{{ 'contactPage.form.subjectLabel' | translate }}</label>\r\n      <input id=\"subject\" type=\"text\" formControlName=\"subject\" [placeholder]=\"'contactPage.form.subjectPlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\">\r\n    </div>\r\n\r\n    <div>\r\n      <label for=\"message\" class=\"block text-sm font-medium text-gray-300\">{{ 'contactPage.form.messageLabel' | translate }}</label>\r\n      <textarea id=\"message\" formControlName=\"message\" rows=\"5\" [placeholder]=\"'contactPage.form.messagePlaceholder' | translate\" class=\"mt-1 block w-full bg-slate-800 border border-slate-700 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\"></textarea>\r\n    </div>\r\n\r\n    <div>\r\n      <button type=\"submit\" [disabled]=\"!contactForm.valid\" class=\"w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300\">\r\n        {{ 'contactPage.form.button' | translate }}\r\n      </button>\r\n    </div>\r\n  </form>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.contact-form { @include card($spacing-6); padding: $spacing-6; }\r\n.contact-form .form-group { margin-bottom: $spacing-4; }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ContactFormComponent, { className: "ContactFormComponent", filePath: "src/app/components/contact-form/contact-form.component.ts", lineNumber: 13 }); })();
