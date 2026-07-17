import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.nameKey;
function TestimonialsComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7)(1, "p", 8);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(4, "div", 9);
    i0.ɵɵdomElement(5, "img", 10);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵdomElementStart(7, "div")(8, "p", 11);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(11, "p", 12);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵdomElementEnd()()()();
} if (rf & 2) {
    const testimonial_r1 = ctx.$implicit;
    const ɵ$index_17_r2 = ctx.$index;
    i0.ɵɵstyleProp("animation-delay", 150 * ɵ$index_17_r2 + "ms");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("\"", i0.ɵɵpipeBind1(3, 7, testimonial_r1.quoteKey), "\"");
    i0.ɵɵadvance(3);
    i0.ɵɵdomProperty("src", testimonial_r1.avatarUrl, i0.ɵɵsanitizeUrl)("alt", i0.ɵɵpipeBind1(6, 9, testimonial_r1.nameKey));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 11, testimonial_r1.nameKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 13, testimonial_r1.titleKey));
} }
export class TestimonialsComponent {
    constructor() {
        this.testimonials = signal([
            {
                quoteKey: 'testimonials.sarah',
                nameKey: 'testimonials.sarahName',
                titleKey: 'testimonials.sarahTitle',
                avatarUrl: 'https://picsum.photos/seed/person1/100/100'
            },
            {
                quoteKey: 'testimonials.michael',
                nameKey: 'testimonials.michaelName',
                titleKey: 'testimonials.michaelTitle',
                avatarUrl: 'https://picsum.photos/seed/person2/100/100'
            },
            {
                quoteKey: 'testimonials.jessica',
                nameKey: 'testimonials.jessicaName',
                titleKey: 'testimonials.jessicaTitle',
                avatarUrl: 'https://picsum.photos/seed/person3/100/100'
            }
        ], ...(ngDevMode ? [{ debugName: "testimonials" }] : []));
    }
    static { this.ɵfac = function TestimonialsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestimonialsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TestimonialsComponent, selectors: [["app-testimonials"]], decls: 12, vars: 6, consts: [[1, "py-20", "bg-gray-900"], [1, "container", "mx-auto", "px-6"], [1, "text-center", "mb-12", "animate-fade-in"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white"], [1, "text-lg", "text-gray-400", "mt-4", "max-w-2xl", "mx-auto"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-8"], [1, "bg-slate-800", "p-8", "rounded-lg", "flex", "flex-col", "animate-fade-in", 3, "animation-delay"], [1, "bg-slate-800", "p-8", "rounded-lg", "flex", "flex-col", "animate-fade-in"], [1, "text-gray-300", "italic", "mb-6", "flex-grow"], [1, "flex", "items-center", "mt-auto"], [1, "w-12", "h-12", "rounded-full", "me-4", 3, "src", "alt"], [1, "font-semibold", "text-white"], [1, "text-sm", "text-gray-400"]], template: function TestimonialsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(9, "div", 5);
            i0.ɵɵrepeaterCreate(10, TestimonialsComponent_For_11_Template, 14, 15, "div", 6, _forTrack0);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "testimonials.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "testimonials.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.testimonials());
        } }, dependencies: [TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.testimonials[_ngcontent-%COMP%] { padding: $spacing-8 0; }\r\n.testimonial[_ngcontent-%COMP%] { @include card($spacing-4); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TestimonialsComponent, [{
        type: Component,
        args: [{ selector: 'app-testimonials', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe], template: "<section class=\"py-20 bg-gray-900\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"text-center mb-12 animate-fade-in\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white\">{{ 'testimonials.title' | translate }}</h2>\r\n      <p class=\"text-lg text-gray-400 mt-4 max-w-2xl mx-auto\">{{ 'testimonials.subtitle' | translate }}</p>\r\n    </div>\r\n    <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\r\n      @for(testimonial of testimonials(); track testimonial.nameKey; let i = $index) {\r\n        <div class=\"bg-slate-800 p-8 rounded-lg flex flex-col animate-fade-in\" [style.animation-delay]=\"150 * i + 'ms'\">\r\n          <p class=\"text-gray-300 italic mb-6 flex-grow\">\"{{ testimonial.quoteKey | translate }}\"</p>\r\n          <div class=\"flex items-center mt-auto\">\r\n            <img class=\"w-12 h-12 rounded-full me-4\" [src]=\"testimonial.avatarUrl\" [alt]=\"testimonial.nameKey | translate\">\r\n            <div>\r\n              <p class=\"font-semibold text-white\">{{ testimonial.nameKey | translate }}</p>\r\n              <p class=\"text-sm text-gray-400\">{{ testimonial.titleKey | translate }}</p>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.testimonials { padding: $spacing-8 0; }\r\n.testimonial { @include card($spacing-4); }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TestimonialsComponent, { className: "TestimonialsComponent", filePath: "src/app/components/testimonials/testimonials.component.ts", lineNumber: 18 }); })();
