import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { ContactDetailsComponent } from '../../components/contact-details/contact-details.component';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
export class ContactPageComponent {
    static { this.ɵfac = function ContactPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContactPageComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ContactPageComponent, selectors: [["app-contact-page"]], decls: 19, vars: 6, consts: [[1, "relative", "overflow-x-hidden"], [1, "relative", "bg-gray-950", "text-white", "pt-32", "pb-16", "lg:pt-40", "lg:pb-24", "overflow-hidden"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-10", 2, "background-image", "url('assets/boardroom-bg.jpg')"], [1, "container", "mx-auto", "px-6", "relative", "z-10", "text-center", "animate-fade-in"], [1, "text-4xl", "md:text-6xl", "font-bold", "mb-4", "bg-clip-text", "text-transparent", "bg-gradient-to-r", "from-blue-400", "to-purple-500"], [1, "text-lg", "md:text-xl", "text-gray-300", "max-w-3xl", "mx-auto"], [1, "py-20", "bg-gray-900"], [1, "container", "mx-auto", "px-6"], [1, "grid", "grid-cols-1", "lg:grid-cols-2", "gap-12", "items-start"]], template: function ContactPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "app-header");
            i0.ɵɵelementStart(2, "main")(3, "section", 1);
            i0.ɵɵelement(4, "div", 2);
            i0.ɵɵelementStart(5, "div", 3)(6, "h1", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p", 5);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(12, "section", 6)(13, "div", 7)(14, "div", 8);
            i0.ɵɵelement(15, "app-contact-details")(16, "app-contact-form");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelement(17, "app-cta");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(18, "app-footer");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 2, "contactPage.title"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 4, "contactPage.subtitle"), " ");
        } }, dependencies: [HeaderComponent,
            FooterComponent,
            CtaComponent,
            ContactDetailsComponent,
            ContactFormComponent,
            TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.contact[_ngcontent-%COMP%] { padding: $spacing-8 0; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContactPageComponent, [{
        type: Component,
        args: [{ selector: 'app-contact-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                    HeaderComponent,
                    FooterComponent,
                    CtaComponent,
                    ContactDetailsComponent,
                    ContactFormComponent,
                    TranslatePipe
                ], template: "<div class=\"relative overflow-x-hidden\">\r\n  <app-header></app-header>\r\n  <main>\r\n    <!-- Page Header -->\r\n    <section class=\"relative bg-gray-950 text-white pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden\">\r\n      <div class=\"absolute inset-0 bg-cover bg-center opacity-10\" style=\"background-image: url('assets/boardroom-bg.jpg');\"></div>\r\n      <div class=\"container mx-auto px-6 relative z-10 text-center animate-fade-in\">\r\n        <h1 class=\"text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500\">\r\n          {{ 'contactPage.title' | translate }}\r\n        </h1>\r\n        <p class=\"text-lg md:text-xl text-gray-300 max-w-3xl mx-auto\">\r\n          {{ 'contactPage.subtitle' | translate }}\r\n        </p>\r\n      </div>\r\n    </section>\r\n\r\n    <section class=\"py-20 bg-gray-900\">\r\n      <div class=\"container mx-auto px-6\">\r\n        <div class=\"grid grid-cols-1 lg:grid-cols-2 gap-12 items-start\">\r\n          <app-contact-details></app-contact-details>\r\n          <app-contact-form></app-contact-form>\r\n        </div>\r\n      </div>\r\n    </section>\r\n\r\n    <app-cta></app-cta>\r\n  </main>\r\n  <app-footer></app-footer>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.contact { padding: $spacing-8 0; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ContactPageComponent, { className: "ContactPageComponent", filePath: "src/app/pages/contact/contact.component.ts", lineNumber: 23 }); })();
