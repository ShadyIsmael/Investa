import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.titleKey;
function AboutComponent_For_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 11)(1, "div", 12);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(2, "svg", 13);
    i0.ɵɵdomElement(3, "path", 14);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵdomElementStart(4, "div")(5, "h3", 15);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(8, "p", 16);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const pillar_r1 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("d", pillar_r1.iconPath);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 3, pillar_r1.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 5, pillar_r1.descriptionKey));
} }
export class AboutComponent {
    constructor() {
        this.pillars = signal([
            {
                iconPath: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
                titleKey: 'about.pillars.discover.title',
                descriptionKey: 'about.pillars.discover.description',
            },
            {
                iconPath: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023.57-2.206 0-3.228m-5.545 2.083a9.093 9.093 0 010-3.228m5.545 2.083c.57-1.023.57-2.206 0-3.228m0 0l-2.182-3.822a5.25 5.25 0 00-9.132 0L3 8.544a9.093 9.093 0 010 3.228m0 0l2.182 3.822a5.25 5.25 0 009.132 0L12 11.772z',
                titleKey: 'about.pillars.connect.title',
                descriptionKey: 'about.pillars.connect.description',
            },
            {
                iconPath: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-3.75M21 12l-3.75-3.75',
                titleKey: 'about.pillars.grow.title',
                descriptionKey: 'about.pillars.grow.description',
            }
        ], ...(ngDevMode ? [{ debugName: "pillars" }] : []));
    }
    static { this.ɵfac = function AboutComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AboutComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AboutComponent, selectors: [["app-about"]], decls: 18, vars: 6, consts: [[1, "py-20", "bg-gray-900"], [1, "container", "mx-auto", "px-6"], [1, "grid", "grid-cols-1", "lg:grid-cols-2", "gap-16", "items-center"], [1, "relative", "min-h-[450px]"], ["src", "https://picsum.photos/seed/com1/250/250", "alt", "Community member 1", 1, "relative", "rounded-lg", "shadow-2xl", "w-48", "h-48", "object-cover", "border-4", "border-slate-700", "z-10", "transform", "-rotate-6", "hover:rotate-0", "hover:scale-110", "transition-transform", "duration-300"], ["src", "https://picsum.photos/seed/com2/300/300", "alt", "Community member 2", 1, "absolute", "top-10", "end-0", "lg:end-10", "rounded-lg", "shadow-2xl", "w-64", "h-64", "object-cover", "border-4", "border-slate-700", "z-20", "transform", "rotate-3", "hover:rotate-0", "hover:scale-110", "transition-transform", "duration-300"], ["src", "https://picsum.photos/seed/com3/200/200", "alt", "Community member 3", 1, "absolute", "bottom-0", "start-1/4", "rounded-lg", "shadow-2xl", "w-40", "h-40", "object-cover", "border-4", "border-slate-700", "z-30", "transform", "rotate-2", "hover:rotate-0", "hover:scale-110", "transition-transform", "duration-300"], [1, "absolute", "inset-0", "bg-gradient-to-r", "from-blue-600/20", "to-purple-600/20", "rounded-full", "filter", "blur-3xl", "-z-10"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white", "mb-6"], [1, "text-gray-300", "mb-8", "text-lg"], [1, "space-y-6"], [1, "flex", "items-start", "gap-4"], [1, "flex-shrink-0", "w-12", "h-12", "bg-slate-800", "rounded-lg", "flex", "items-center", "justify-center", "text-blue-400"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-7", "h-7"], ["stroke-linecap", "round", "stroke-linejoin", "round"], [1, "font-semibold", "text-white", "text-lg"], [1, "text-gray-400"]], template: function AboutComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵdomElement(4, "img", 4)(5, "img", 5)(6, "img", 6)(7, "div", 7);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(8, "div")(9, "h2", 8);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(12, "p", 9);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(15, "div", 10);
            i0.ɵɵrepeaterCreate(16, AboutComponent_For_17_Template, 11, 7, "div", 11, _forTrack0);
            i0.ɵɵdomElementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(10);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 2, "about.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 4, "about.description"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.pillars());
        } }, dependencies: [TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.about[_ngcontent-%COMP%] { padding: $spacing-6; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AboutComponent, [{
        type: Component,
        args: [{ selector: 'app-about', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe], template: "<section class=\"py-20 bg-gray-900\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"grid grid-cols-1 lg:grid-cols-2 gap-16 items-center\">\r\n      <div class=\"relative min-h-[450px]\">\r\n        <img src=\"https://picsum.photos/seed/com1/250/250\" alt=\"Community member 1\" class=\"relative rounded-lg shadow-2xl w-48 h-48 object-cover border-4 border-slate-700 z-10 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-transform duration-300\">\r\n        <img src=\"https://picsum.photos/seed/com2/300/300\" alt=\"Community member 2\" class=\"absolute top-10 end-0 lg:end-10 rounded-lg shadow-2xl w-64 h-64 object-cover border-4 border-slate-700 z-20 transform rotate-3 hover:rotate-0 hover:scale-110 transition-transform duration-300\">\r\n        <img src=\"https://picsum.photos/seed/com3/200/200\" alt=\"Community member 3\" class=\"absolute bottom-0 start-1/4 rounded-lg shadow-2xl w-40 h-40 object-cover border-4 border-slate-700 z-30 transform rotate-2 hover:rotate-0 hover:scale-110 transition-transform duration-300\">\r\n        <div class=\"absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full filter blur-3xl -z-10\"></div>\r\n      </div>\r\n      <div>\r\n        <h2 class=\"text-3xl md:text-4xl font-bold text-white mb-6\">{{ 'about.title' | translate }}</h2>\r\n        <p class=\"text-gray-300 mb-8 text-lg\">\r\n          {{ 'about.description' | translate }}\r\n        </p>\r\n        <div class=\"space-y-6\">\r\n          @for(pillar of pillars(); track pillar.titleKey) {\r\n            <div class=\"flex items-start gap-4\">\r\n              <div class=\"flex-shrink-0 w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400\">\r\n                <svg class=\"w-7 h-7\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" [attr.d]=\"pillar.iconPath\" />\r\n                </svg>\r\n              </div>\r\n              <div>\r\n                <h3 class=\"font-semibold text-white text-lg\">{{ pillar.titleKey | translate }}</h3>\r\n                <p class=\"text-gray-400\">{{ pillar.descriptionKey | translate }}</p>\r\n              </div>\r\n            </div>\r\n          }\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</section>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.about { padding: $spacing-6; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AboutComponent, { className: "AboutComponent", filePath: "src/app/components/about/about.component.ts", lineNumber: 17 }); })();
