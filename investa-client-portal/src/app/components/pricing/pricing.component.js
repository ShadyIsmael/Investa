import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.nameKey;
function PricingComponent_For_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "pricing.popular"));
} }
function PricingComponent_For_11_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const tier_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("/ ", i0.ɵɵpipeBind1(2, 1, tier_r1.priceSuffixKey));
} }
function PricingComponent_For_11_For_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "li", 16);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(1, "svg", 18);
    i0.ɵɵdomElement(2, "path", 19);
    i0.ɵɵdomElementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵdomElementStart(3, "span", 20);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const feature_r2 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, feature_r2));
} }
function PricingComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7);
    i0.ɵɵconditionalCreate(1, PricingComponent_For_11_Conditional_1_Template, 3, 3, "div", 8);
    i0.ɵɵdomElementStart(2, "div", 9)(3, "h3", 10);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(6, "p", 11);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(9, "div", 12)(10, "span", 13);
    i0.ɵɵtext(11);
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(12, PricingComponent_For_11_Conditional_12_Template, 3, 3, "span", 14);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(13, "ul", 15);
    i0.ɵɵrepeaterCreate(14, PricingComponent_For_11_For_15_Template, 6, 3, "li", 16, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(16, "a", 17);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const tier_r1 = ctx.$implicit;
    const ɵ$index_17_r3 = ctx.$index;
    i0.ɵɵclassMap(tier_r1.isPopular ? "border-blue-500 lg:scale-105" : "border-slate-700");
    i0.ɵɵstyleProp("animation-delay", 150 * ɵ$index_17_r3 + "ms");
    i0.ɵɵclassProp("relative", tier_r1.isPopular);
    i0.ɵɵadvance();
    i0.ɵɵconditional(tier_r1.isPopular ? 1 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 14, tier_r1.nameKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 16, tier_r1.descriptionKey));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(tier_r1.price);
    i0.ɵɵadvance();
    i0.ɵɵconditional(tier_r1.priceSuffixKey ? 12 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(tier_r1.features);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(tier_r1.isPopular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-700 text-white hover:bg-slate-600");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 18, tier_r1.buttonKey), " ");
} }
export class PricingComponent {
    constructor() {
        this.tiers = signal([
            {
                nameKey: 'pricing.starter.name',
                price: '$29',
                priceSuffixKey: 'pricing.monthly',
                descriptionKey: 'pricing.starter.description',
                features: [
                    'pricing.starter.features.0',
                    'pricing.starter.features.1',
                    'pricing.starter.features.2',
                    'pricing.starter.features.3',
                ],
                isPopular: false,
                buttonKey: 'pricing.starter.button'
            },
            {
                nameKey: 'pricing.pro.name',
                price: '$99',
                priceSuffixKey: 'pricing.monthly',
                descriptionKey: 'pricing.pro.description',
                features: [
                    'pricing.pro.features.0',
                    'pricing.pro.features.1',
                    'pricing.pro.features.2',
                    'pricing.pro.features.3',
                ],
                isPopular: true,
                buttonKey: 'pricing.pro.button'
            },
            {
                nameKey: 'pricing.enterprise.name',
                price: 'Custom',
                priceSuffixKey: '',
                descriptionKey: 'pricing.enterprise.description',
                features: [
                    'pricing.enterprise.features.0',
                    'pricing.enterprise.features.1',
                    'pricing.enterprise.features.2',
                    'pricing.enterprise.features.3',
                ],
                isPopular: false,
                buttonKey: 'pricing.enterprise.button'
            }
        ], ...(ngDevMode ? [{ debugName: "tiers" }] : []));
    }
    static { this.ɵfac = function PricingComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PricingComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PricingComponent, selectors: [["app-pricing"]], decls: 12, vars: 6, consts: [[1, "py-20", "bg-gray-900"], [1, "container", "mx-auto", "px-6"], [1, "text-center", "mb-16", "animate-fade-in"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white"], [1, "text-lg", "text-gray-400", "mt-4", "max-w-2xl", "mx-auto"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-8", "items-center", "lg:items-stretch"], [1, "bg-slate-800", "p-8", "rounded-lg", "border", "flex", "flex-col", "transition-transform", "duration-300", "animate-fade-in", 3, "class", "relative", "animation-delay"], [1, "bg-slate-800", "p-8", "rounded-lg", "border", "flex", "flex-col", "transition-transform", "duration-300", "animate-fade-in"], [1, "absolute", "top-0", "end-6", "-translate-y-1/2", "bg-blue-500", "text-white", "text-xs", "font-semibold", "px-3", "py-1", "rounded-full", "uppercase", "tracking-wider"], [1, "flex-grow"], [1, "text-2xl", "font-semibold", "text-white"], [1, "text-gray-400", "mt-2", "h-12"], [1, "mt-6"], [1, "text-5xl", "font-bold", "text-white"], [1, "text-gray-400"], [1, "mt-8", "space-y-4"], [1, "flex", "items-center"], ["routerLink", "/signup", 1, "mt-8", "w-full", "block", "text-center", "py-3", "px-6", "rounded-full", "font-semibold", "transition-colors", "duration-300"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "2.5", "stroke", "currentColor", 1, "w-5", "h-5", "text-green-400", "me-3", "flex-shrink-0"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M4.5 12.75l6 6 9-13.5"], [1, "text-gray-300"]], template: function PricingComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(9, "div", 5);
            i0.ɵɵrepeaterCreate(10, PricingComponent_For_11_Template, 19, 20, "div", 6, _forTrack0);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "pricing.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "pricing.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.tiers());
        } }, dependencies: [CommonModule, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.pricing[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: $spacing-6; }\r\n.pricing__card[_ngcontent-%COMP%] { @include card($spacing-6); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PricingComponent, [{
        type: Component,
        args: [{ selector: 'app-pricing', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe, CommonModule], template: "<section class=\"py-20 bg-gray-900\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"text-center mb-16 animate-fade-in\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white\">{{ 'pricing.title' | translate }}</h2>\r\n      <p class=\"text-lg text-gray-400 mt-4 max-w-2xl mx-auto\">{{ 'pricing.subtitle' | translate }}</p>\r\n    </div>\r\n    <div class=\"grid grid-cols-1 lg:grid-cols-3 gap-8 items-center lg:items-stretch\">\r\n      @for(tier of tiers(); track tier.nameKey; let i = $index) {\r\n        <div class=\"bg-slate-800 p-8 rounded-lg border flex flex-col transition-transform duration-300 animate-fade-in\" \r\n             [class]=\"tier.isPopular ? 'border-blue-500 lg:scale-105' : 'border-slate-700'\" \r\n             [class.relative]=\"tier.isPopular\"\r\n             [style.animation-delay]=\"150 * i + 'ms'\">\r\n          @if(tier.isPopular) {\r\n            <div class=\"absolute top-0 end-6 -translate-y-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider\">{{ 'pricing.popular' | translate }}</div>\r\n          }\r\n          <div class=\"flex-grow\">\r\n            <h3 class=\"text-2xl font-semibold text-white\">{{ tier.nameKey | translate }}</h3>\r\n            <p class=\"text-gray-400 mt-2 h-12\">{{ tier.descriptionKey | translate }}</p>\r\n            <div class=\"mt-6\">\r\n              <span class=\"text-5xl font-bold text-white\">{{ tier.price }}</span>\r\n              @if(tier.priceSuffixKey) {\r\n                <span class=\"text-gray-400\">/ {{ tier.priceSuffixKey | translate }}</span>\r\n              }\r\n            </div>\r\n            <ul class=\"mt-8 space-y-4\">\r\n              @for(feature of tier.features; track feature) {\r\n                <li class=\"flex items-center\">\r\n                  <svg class=\"w-5 h-5 text-green-400 me-3 flex-shrink-0\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2.5\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.5 12.75l6 6 9-13.5\" /></svg>\r\n                  <span class=\"text-gray-300\">{{ feature | translate }}</span>\r\n                </li>\r\n              }\r\n            </ul>\r\n          </div>\r\n          <a routerLink=\"/signup\" class=\"mt-8 w-full block text-center py-3 px-6 rounded-full font-semibold transition-colors duration-300\"\r\n            [class]=\"tier.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-700 text-white hover:bg-slate-600'\">\r\n            {{ tier.buttonKey | translate }}\r\n          </a>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: $spacing-6; }\r\n.pricing__card { @include card($spacing-6); }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PricingComponent, { className: "PricingComponent", filePath: "src/app/components/pricing/pricing.component.ts", lineNumber: 22 }); })();
