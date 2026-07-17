import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.title;
const _forTrack1 = ($index, $item) => $item.key;
function FooterComponent_For_17_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 18);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const link_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", link_r1.routerLink)("href", link_r1.href, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, link_r1.key));
} }
function FooterComponent_For_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "h3", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 17);
    i0.ɵɵrepeaterCreate(5, FooterComponent_For_17_For_6_Template, 4, 5, "li", null, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const group_r2 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, group_r2.title));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(group_r2.links);
} }
export class FooterComponent {
    constructor() {
        this.year = new Date().getFullYear();
        this.linkGroups = signal([
            {
                title: 'footer.solutions.title',
                links: [
                    { key: 'footer.solutions.ai', routerLink: '/services' },
                    { key: 'footer.solutions.analytics', routerLink: '/services' },
                    { key: 'footer.solutions.portfolio', routerLink: '/services' },
                    { key: 'footer.solutions.api', routerLink: '/services' }
                ]
            },
            {
                title: 'footer.support.title',
                links: [
                    { key: 'footer.support.pricing', routerLink: '/services' },
                    { key: 'footer.support.docs', href: '#' },
                    { key: 'footer.support.guides', href: '#' },
                    { key: 'footer.support.center', routerLink: '/contact' }
                ]
            },
            {
                title: 'footer.company.title',
                links: [
                    { key: 'footer.company.about', routerLink: '/about' },
                    { key: 'footer.company.blog', routerLink: '/blog' },
                    { key: 'footer.company.careers', href: '#' },
                    { key: 'footer.company.press', href: '#' }
                ]
            },
            {
                title: 'footer.legal.title',
                links: [
                    { key: 'footer.legal.claim', href: '#' },
                    { key: 'footer.legal.privacy', href: '#' },
                    { key: 'footer.legal.terms', href: '#' },
                    { key: 'footer.legal.risk', href: '#' }
                ]
            }
        ], ...(ngDevMode ? [{ debugName: "linkGroups" }] : []));
    }
    static { this.ɵfac = function FooterComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FooterComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FooterComponent, selectors: [["app-footer"]], decls: 29, vars: 7, consts: [[1, "bg-slate-900", "text-gray-400"], [1, "container", "mx-auto", "px-6", "pt-16", "pb-8"], [1, "grid", "grid-cols-2", "md:grid-cols-4", "lg:grid-cols-5", "gap-8"], [1, "col-span-2", "lg:col-span-1", "mb-8", "lg:mb-0"], [1, "flex", "items-center", "mb-4"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", "fill", "none", "stroke-linecap", "round", "stroke-linejoin", "round", 1, "h-8", "w-8", "text-blue-400"], ["d", "M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82"], ["d", "M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82"], ["d", "M10 14l2 -2l2 -2"], ["d", "M12 12l3.5 -4.5l2.5 -2.5"], ["d", "M12 12l-3.5 -4.5l-2.5 -2.5"], [1, "text-white", "text-2xl", "font-bold", "ms-2"], [1, "text-sm"], [1, "mt-12", "border-t", "border-slate-800", "pt-8", "flex", "flex-col", "md:flex-row", "justify-between", "items-center", "text-sm"], [1, "flex", "space-x-4", "mt-4", "md:mt-0"], ["href", "#", 1, "hover:text-white"], [1, "text-white", "font-semibold", "mb-4", "tracking-wider"], [1, "space-y-3"], [1, "hover:text-white", "transition-colors", "duration-300", 3, "routerLink", "href"]], template: function FooterComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "footer", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "div", 4);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(5, "svg", 5);
            i0.ɵɵelement(6, "path", 6)(7, "path", 7)(8, "path", 8)(9, "path", 9)(10, "path", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(11, "span", 11);
            i0.ɵɵtext(12, "Investa");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "p", 12);
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵrepeaterCreate(16, FooterComponent_For_17_Template, 7, 3, "div", null, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "div", 13)(19, "p");
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "div", 14)(23, "a", 15);
            i0.ɵɵtext(24, "X");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "a", 15);
            i0.ɵɵtext(26, "LinkedIn");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "a", 15);
            i0.ɵɵtext(28, "GitHub");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(14);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 3, "footer.tagline"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.linkGroups());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate2("\u00A9 ", ctx.year, " ", i0.ɵɵpipeBind1(21, 5, "footer.copyright"));
        } }, dependencies: [RouterLink, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n[_nghost-%COMP%] { display:block; }\r\n\r\n.footer[_ngcontent-%COMP%] {\r\n  padding: $spacing-6;\r\n  background: $color-background;\r\n  color: $color-text-secondary;\r\n  text-align: center;\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooterComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-footer', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe, RouterLink], template: "<footer class=\"bg-slate-900 text-gray-400\">\r\n  <div class=\"container mx-auto px-6 pt-16 pb-8\">\r\n    <div class=\"grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8\">\r\n      <div class=\"col-span-2 lg:col-span-1 mb-8 lg:mb-0\">\r\n        <div class=\"flex items-center mb-4\">\r\n          <svg class=\"h-8 w-8 text-blue-400\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n            <path d=\"M10 16.75l-1.53 -1.22a2 2 0 0 0 -2.94 0l-3.53 2.82\"></path>\r\n            <path d=\"M14 16.75l1.53 -1.22a2 2 0 0 1 2.94 0l3.53 2.82\"></path>\r\n            <path d=\"M10 14l2 -2l2 -2\"></path>\r\n            <path d=\"M12 12l3.5 -4.5l2.5 -2.5\"></path>\r\n            <path d=\"M12 12l-3.5 -4.5l-2.5 -2.5\"></path>\r\n         </svg>\r\n          <span class=\"text-white text-2xl font-bold ms-2\">Investa</span>\r\n        </div>\r\n        <p class=\"text-sm\">{{ 'footer.tagline' | translate }}</p>\r\n      </div>\r\n      @for(group of linkGroups(); track group.title) {\r\n        <div>\r\n          <h3 class=\"text-white font-semibold mb-4 tracking-wider\">{{ group.title | translate }}</h3>\r\n          <ul class=\"space-y-3\">\r\n            @for(link of group.links; track link.key) {\r\n              <li><a [routerLink]=\"link.routerLink\" [href]=\"link.href\" class=\"hover:text-white transition-colors duration-300\">{{ link.key | translate }}</a></li>\r\n            }\r\n          </ul>\r\n        </div>\r\n      }\r\n    </div>\r\n    <div class=\"mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm\">\r\n      <p>&copy; {{ year }} {{ 'footer.copyright' | translate }}</p>\r\n      <div class=\"flex space-x-4 mt-4 md:mt-0\">\r\n        <!-- Icons can be added here -->\r\n        <a href=\"#\" class=\"hover:text-white\">X</a>\r\n        <a href=\"#\" class=\"hover:text-white\">LinkedIn</a>\r\n        <a href=\"#\" class=\"hover:text-white\">GitHub</a>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</footer>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n:host { display:block; }\r\n\r\n.footer {\r\n  padding: $spacing-6;\r\n  background: $color-background;\r\n  color: $color-text-secondary;\r\n  text-align: center;\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FooterComponent, { className: "FooterComponent", filePath: "src/app/components/footer/footer.component.ts", lineNumber: 24 }); })();
