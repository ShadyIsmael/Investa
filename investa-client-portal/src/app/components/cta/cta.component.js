import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
export class CtaComponent {
    static { this.ɵfac = function CtaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CtaComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CtaComponent, selectors: [["app-cta"]], decls: 12, vars: 9, consts: [[1, "py-20", "bg-gray-950"], [1, "container", "mx-auto", "px-6"], [1, "bg-slate-900", "border", "border-slate-800", "rounded-lg", "p-10", "md:p-16", "text-center"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white", "mb-4"], [1, "text-gray-400", "text-lg", "mb-8", "max-w-xl", "mx-auto"], ["routerLink", "/signup", 1, "bg-gradient-to-r", "from-blue-500", "to-purple-600", "text-white", "font-semibold", "py-3", "px-8", "rounded-full", "hover:opacity-90", "transition-opacity", "duration-300", "transform", "hover:scale-105", "inline-block"]], template: function CtaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "a", 5);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "cta.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "cta.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "cta.button"), " ");
        } }, dependencies: [RouterLink, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.cta[_ngcontent-%COMP%] { @include flex-center; padding: $spacing-8 0; }\r\n.cta__button[_ngcontent-%COMP%] { @include button-base; @include button-variant($color-primary); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CtaComponent, [{
        type: Component,
        args: [{ selector: 'app-cta', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterLink, TranslatePipe], template: "<section class=\"py-20 bg-gray-950\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"bg-slate-900 border border-slate-800 rounded-lg p-10 md:p-16 text-center\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white mb-4\">{{ 'cta.title' | translate }}</h2>\r\n      <p class=\"text-gray-400 text-lg mb-8 max-w-xl mx-auto\">{{ 'cta.subtitle' | translate }}</p>\r\n      <a routerLink=\"/signup\" class=\"bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 transform hover:scale-105 inline-block\">\r\n        {{ 'cta.button' | translate }}\r\n      </a>\r\n    </div>\r\n  </div>\r\n</section>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.cta { @include flex-center; padding: $spacing-8 0; }\r\n.cta__button { @include button-base; @include button-variant($color-primary); }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CtaComponent, { className: "CtaComponent", filePath: "src/app/components/cta/cta.component.ts", lineNumber: 12 }); })();
