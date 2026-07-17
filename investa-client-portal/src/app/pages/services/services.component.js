import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { ServicesListComponent } from '../../components/services/services.component';
import { ProcessComponent } from '../../components/process/process.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
export class ServicesPageComponent {
    static { this.ɵfac = function ServicesPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ServicesPageComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ServicesPageComponent, selectors: [["app-services-page"]], decls: 18, vars: 6, consts: [[1, "relative", "overflow-x-hidden"], [1, "relative", "bg-gray-950", "text-white", "pt-32", "pb-16", "lg:pt-40", "lg:pb-24", "overflow-hidden"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-10", 2, "background-image", "url('assets/boardroom-bg.jpg')"], [1, "container", "mx-auto", "px-6", "relative", "z-10", "text-center", "animate-fade-in"], [1, "text-4xl", "md:text-6xl", "font-bold", "mb-4", "bg-clip-text", "text-transparent", "bg-gradient-to-r", "from-blue-400", "to-purple-500"], [1, "text-lg", "md:text-xl", "text-gray-300", "max-w-3xl", "mx-auto"]], template: function ServicesPageComponent_Template(rf, ctx) { if (rf & 1) {
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
            i0.ɵɵelement(12, "app-services-list")(13, "app-process")(14, "app-pricing")(15, "app-faq")(16, "app-cta");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(17, "app-footer");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 2, "services.title"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 4, "services.subtitle"), " ");
        } }, dependencies: [HeaderComponent,
            FooterComponent,
            CtaComponent,
            ServicesListComponent,
            ProcessComponent,
            PricingComponent,
            FaqComponent,
            TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.services-page[_ngcontent-%COMP%] { padding: $spacing-8; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ServicesPageComponent, [{
        type: Component,
        args: [{ selector: 'app-services-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                    HeaderComponent,
                    FooterComponent,
                    CtaComponent,
                    ServicesListComponent,
                    ProcessComponent,
                    PricingComponent,
                    FaqComponent,
                    TranslatePipe
                ], template: "<div class=\"relative overflow-x-hidden\">\r\n  <app-header></app-header>\r\n  <main>\r\n    <!-- Page Header -->\r\n    <section class=\"relative bg-gray-950 text-white pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden\">\r\n      <div class=\"absolute inset-0 bg-cover bg-center opacity-10\" style=\"background-image: url('assets/boardroom-bg.jpg');\"></div>\r\n      <div class=\"container mx-auto px-6 relative z-10 text-center animate-fade-in\">\r\n        <h1 class=\"text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500\">\r\n          {{ 'services.title' | translate }}\r\n        </h1>\r\n        <p class=\"text-lg md:text-xl text-gray-300 max-w-3xl mx-auto\">\r\n          {{ 'services.subtitle' | translate }}\r\n        </p>\r\n      </div>\r\n    </section>\r\n\r\n    <app-services-list></app-services-list>\r\n    <app-process></app-process>\r\n    <app-pricing></app-pricing>\r\n    <app-faq></app-faq>\r\n    <app-cta></app-cta>\r\n  </main>\r\n  <app-footer></app-footer>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.services-page { padding: $spacing-8; }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ServicesPageComponent, { className: "ServicesPageComponent", filePath: "src/app/pages/services/services.component.ts", lineNumber: 27 }); })();
