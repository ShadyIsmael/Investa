import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AboutComponent } from '../../components/about/about.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
export class AboutPageComponent {
    static { this.ɵfac = function AboutPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AboutPageComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AboutPageComponent, selectors: [["app-about-page"]], decls: 16, vars: 6, consts: [[1, "relative", "overflow-x-hidden"], [1, "relative", "bg-gray-950", "text-white", "pt-32", "pb-16", "lg:pt-40", "lg:pb-24", "overflow-hidden"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-10", 2, "background-image", "url('assets/boardroom-bg.jpg')"], [1, "container", "mx-auto", "px-6", "relative", "z-10", "text-center", "animate-fade-in"], [1, "text-4xl", "md:text-6xl", "font-bold", "mb-4", "bg-clip-text", "text-transparent", "bg-gradient-to-r", "from-blue-400", "to-purple-500"], [1, "text-lg", "md:text-xl", "text-gray-300", "max-w-3xl", "mx-auto"]], template: function AboutPageComponent_Template(rf, ctx) { if (rf & 1) {
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
            i0.ɵɵelement(12, "app-about")(13, "app-testimonials")(14, "app-cta");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(15, "app-footer");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 2, "about.title"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 4, "about.description"), " ");
        } }, dependencies: [HeaderComponent,
            FooterComponent,
            AboutComponent,
            CtaComponent,
            TestimonialsComponent,
            TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.about-page[_ngcontent-%COMP%] { padding: $spacing-8; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AboutPageComponent, [{
        type: Component,
        args: [{ selector: 'app-about-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                    HeaderComponent,
                    FooterComponent,
                    AboutComponent,
                    CtaComponent,
                    TestimonialsComponent,
                    TranslatePipe
                ], template: "<div class=\"relative overflow-x-hidden\">\r\n  <app-header></app-header>\r\n  <main>\r\n    <!-- Page Header -->\r\n    <section class=\"relative bg-gray-950 text-white pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden\">\r\n      <div class=\"absolute inset-0 bg-cover bg-center opacity-10\" style=\"background-image: url('assets/boardroom-bg.jpg');\"></div>\r\n      <div class=\"container mx-auto px-6 relative z-10 text-center animate-fade-in\">\r\n        <h1 class=\"text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500\">\r\n          {{ 'about.title' | translate }}\r\n        </h1>\r\n        <p class=\"text-lg md:text-xl text-gray-300 max-w-3xl mx-auto\">\r\n          {{ 'about.description' | translate }}\r\n        </p>\r\n      </div>\r\n    </section>\r\n\r\n    <!-- Re-use the existing about component, it has more detailed pillar info -->\r\n    <app-about></app-about>\r\n\r\n    <!-- Social proof is great on an about page -->\r\n    <app-testimonials></app-testimonials>\r\n\r\n    <!-- Always have a call to action -->\r\n    <app-cta></app-cta>\r\n  </main>\r\n  <app-footer></app-footer>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.about-page { padding: $spacing-8; }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AboutPageComponent, { className: "AboutPageComponent", filePath: "src/app/pages/about/about.component.ts", lineNumber: 23 }); })();
