import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.titleKey;
function FeaturesComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7)(1, "div", 8);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(2, "svg", 9);
    i0.ɵɵdomElement(3, "path", 10);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵdomElementStart(4, "h3", 11);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "p", 12);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const feature_r1 = ctx.$implicit;
    const ɵ$index_17_r2 = ctx.$index;
    i0.ɵɵstyleProp("animation-delay", 150 * ɵ$index_17_r2 + "ms");
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("d", feature_r1.iconPath);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 5, feature_r1.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 7, feature_r1.descriptionKey));
} }
export class FeaturesComponent {
    constructor() {
        this.features = signal([
            {
                iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
                titleKey: 'features.realTime.title',
                descriptionKey: 'features.realTime.description'
            },
            {
                iconPath: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
                titleKey: 'features.automatedTrading.title',
                descriptionKey: 'features.automatedTrading.description'
            },
            {
                iconPath: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
                titleKey: 'features.portfolioOptimization.title',
                descriptionKey: 'features.portfolioOptimization.description'
            }
        ], ...(ngDevMode ? [{ debugName: "features" }] : []));
    }
    static { this.ɵfac = function FeaturesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FeaturesComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FeaturesComponent, selectors: [["app-features"]], decls: 12, vars: 6, consts: [[1, "py-20", "bg-gray-950"], [1, "container", "mx-auto", "px-6"], [1, "text-center", "mb-12", "animate-fade-in"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white"], [1, "text-lg", "text-gray-400", "mt-4", "max-w-2xl", "mx-auto"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-8"], [1, "bg-slate-900", "p-8", "rounded-lg", "border", "border-slate-800", "transform", "hover:-translate-y-2", "transition-all", "duration-300", "hover:border-blue-500/50", "hover:shadow-xl", "hover:shadow-blue-500/10", "animate-fade-in", 3, "animation-delay"], [1, "bg-slate-900", "p-8", "rounded-lg", "border", "border-slate-800", "transform", "hover:-translate-y-2", "transition-all", "duration-300", "hover:border-blue-500/50", "hover:shadow-xl", "hover:shadow-blue-500/10", "animate-fade-in"], [1, "text-blue-400"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-10", "h-10", "mb-4"], ["stroke-linecap", "round", "stroke-linejoin", "round"], [1, "text-xl", "font-semibold", "text-white", "mt-4", "mb-2"], [1, "text-gray-400"]], template: function FeaturesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(9, "div", 5);
            i0.ɵɵrepeaterCreate(10, FeaturesComponent_For_11_Template, 10, 9, "div", 6, _forTrack0);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "features.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "features.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.features());
        } }, dependencies: [TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.features[_ngcontent-%COMP%] { padding: $spacing-8 0; }\r\n.features__item[_ngcontent-%COMP%] { @include card($spacing-4); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FeaturesComponent, [{
        type: Component,
        args: [{ selector: 'app-features', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe], template: "<section class=\"py-20 bg-gray-950\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"text-center mb-12 animate-fade-in\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white\">{{ 'features.title' | translate }}</h2>\r\n      <p class=\"text-lg text-gray-400 mt-4 max-w-2xl mx-auto\">{{ 'features.subtitle' | translate }}</p>\r\n    </div>\r\n    <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\r\n      @for(feature of features(); track feature.titleKey; let i = $index) {\r\n        <div class=\"bg-slate-900 p-8 rounded-lg border border-slate-800 transform hover:-translate-y-2 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in\" [style.animation-delay]=\"150 * i + 'ms'\">\r\n          <div class=\"text-blue-400\">\r\n            <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-10 h-10 mb-4\">\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" [attr.d]=\"feature.iconPath\" />\r\n            </svg>\r\n          </div>\r\n          <h3 class=\"text-xl font-semibold text-white mt-4 mb-2\">{{ feature.titleKey | translate }}</h3>\r\n          <p class=\"text-gray-400\">{{ feature.descriptionKey | translate }}</p>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.features { padding: $spacing-8 0; }\r\n.features__item { @include card($spacing-4); }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FeaturesComponent, { className: "FeaturesComponent", filePath: "src/app/components/features/features.component.ts", lineNumber: 17 }); })();
