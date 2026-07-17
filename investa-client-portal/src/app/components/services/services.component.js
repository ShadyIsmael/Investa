import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.titleKey;
function ServicesListComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 3);
    i0.ɵɵdomElement(1, "div", 4);
    i0.ɵɵdomElementStart(2, "h3", 5);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "p", 6);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const service_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("innerHTML", service_r1.icon, i0.ɵɵsanitizeHtml);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, service_r1.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, service_r1.descriptionKey));
} }
export class ServicesListComponent {
    constructor() {
        this.services = signal([
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>`,
                titleKey: 'services.list.aiTrading.title',
                descriptionKey: 'services.list.aiTrading.description'
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`,
                titleKey: 'services.list.analytics.title',
                descriptionKey: 'services.list.analytics.description'
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>`,
                titleKey: 'services.list.portfolio.title',
                descriptionKey: 'services.list.portfolio.description'
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>`,
                titleKey: 'services.list.research.title',
                descriptionKey: 'services.list.research.description'
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.956 11.956 0 013.586 21a11.956 11.956 0 0110.106-12.716z" /></svg>`,
                titleKey: 'services.list.security.title',
                descriptionKey: 'services.list.security.description'
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>`,
                titleKey: 'services.list.api.title',
                descriptionKey: 'services.list.api.description'
            }
        ], ...(ngDevMode ? [{ debugName: "services" }] : []));
    }
    static { this.ɵfac = function ServicesListComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ServicesListComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ServicesListComponent, selectors: [["app-services-list"]], decls: 5, vars: 0, consts: [[1, "py-20", "bg-gray-900"], [1, "container", "mx-auto", "px-6"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-8"], [1, "bg-slate-800", "p-8", "rounded-lg", "border", "border-slate-700", "text-center", "transform", "hover:-translate-y-2", "transition-transform", "duration-300"], [1, "text-blue-400", "w-12", "h-12", "mx-auto", 3, "innerHTML"], [1, "text-xl", "font-semibold", "text-white", "mt-6", "mb-3"], [1, "text-gray-400"]], template: function ServicesListComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵrepeaterCreate(3, ServicesListComponent_For_4_Template, 8, 7, "div", 3, _forTrack0);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.services());
        } }, dependencies: [TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.services[_ngcontent-%COMP%] { padding: $spacing-8 0; }\r\n.service-item[_ngcontent-%COMP%] { @include card($spacing-4); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ServicesListComponent, [{
        type: Component,
        args: [{ selector: 'app-services-list', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe], template: "<section class=\"py-20 bg-gray-900\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\r\n      @for(service of services(); track service.titleKey) {\r\n        <div class=\"bg-slate-800 p-8 rounded-lg border border-slate-700 text-center transform hover:-translate-y-2 transition-transform duration-300\">\r\n          <div class=\"text-blue-400 w-12 h-12 mx-auto\" [innerHTML]=\"service.icon\"></div>\r\n          <h3 class=\"text-xl font-semibold text-white mt-6 mb-3\">{{ service.titleKey | translate }}</h3>\r\n          <p class=\"text-gray-400\">{{ service.descriptionKey | translate }}</p>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.services { padding: $spacing-8 0; }\r\n.service-item { @include card($spacing-4); }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ServicesListComponent, { className: "ServicesListComponent", filePath: "src/app/components/services/services.component.ts", lineNumber: 17 }); })();
