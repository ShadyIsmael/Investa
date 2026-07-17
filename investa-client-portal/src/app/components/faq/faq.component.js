import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.questionKey;
function FaqComponent_For_11_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 11);
    i0.ɵɵdomElement(1, "p", 12);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const faq_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("innerHTML", i0.ɵɵpipeBind1(2, 1, faq_r4.answerKey), i0.ɵɵsanitizeHtml);
} }
function FaqComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 6)(1, "button", 7);
    i0.ɵɵdomListener("click", function FaqComponent_For_11_Template_button_click_1_listener() { const ɵ$index_17_r2 = i0.ɵɵrestoreView(_r1).$index; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleFaq(ɵ$index_17_r2)); });
    i0.ɵɵdomElementStart(2, "span", 8);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElementStart(5, "svg", 9);
    i0.ɵɵdomElement(6, "path", 10);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵconditionalCreate(7, FaqComponent_For_11_Conditional_7_Template, 3, 3, "div", 11);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const faq_r4 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, faq_r4.questionKey));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("rotate-180", faq_r4.isOpen);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(faq_r4.isOpen ? 7 : -1);
} }
export class FaqComponent {
    constructor() {
        this.faqs = signal([
            { questionKey: 'faq.q1', answerKey: 'faq.a1', isOpen: false },
            { questionKey: 'faq.q2', answerKey: 'faq.a2', isOpen: false },
            { questionKey: 'faq.q3', answerKey: 'faq.a3', isOpen: false },
            { questionKey: 'faq.q4', answerKey: 'faq.a4', isOpen: false },
            { questionKey: 'faq.q5', answerKey: 'faq.a5', isOpen: false },
        ], ...(ngDevMode ? [{ debugName: "faqs" }] : []));
    }
    toggleFaq(index) {
        this.faqs.update(currentFaqs => {
            return currentFaqs.map((faq, i) => {
                if (i === index) {
                    return { ...faq, isOpen: !faq.isOpen };
                }
                // Uncomment the line below to close other FAQs when one is opened
                // return { ...faq, isOpen: false };
                return faq;
            });
        });
    }
    static { this.ɵfac = function FaqComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FaqComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FaqComponent, selectors: [["app-faq"]], decls: 12, vars: 6, consts: [[1, "py-20", "bg-gray-950"], [1, "container", "mx-auto", "px-6", "max-w-4xl"], [1, "text-center", "mb-16"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white"], [1, "text-lg", "text-gray-400", "mt-4"], [1, "space-y-4"], [1, "bg-slate-900", "border", "border-slate-800", "rounded-lg", "overflow-hidden"], [1, "w-full", "flex", "justify-between", "items-center", "text-start", "p-6", "focus:outline-none", "focus-visible:ring-2", "focus-visible:ring-blue-500", 3, "click"], [1, "font-semibold", "text-white", "text-lg"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "2", "stroke", "currentColor", 1, "w-6", "h-6", "text-gray-400", "transition-transform", "duration-300", "flex-shrink-0"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M19 9l-7 7-7-7"], [1, "px-6", "pb-6", "text-gray-300", "animate-fade-in"], [3, "innerHTML"]], template: function FaqComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(9, "div", 5);
            i0.ɵɵrepeaterCreate(10, FaqComponent_For_11_Template, 8, 6, "div", 6, _forTrack0);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "faq.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "faq.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.faqs());
        } }, dependencies: [TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.faq[_ngcontent-%COMP%] { padding: $spacing-8 0; }\r\n.faq-item[_ngcontent-%COMP%] { border-bottom: 1px solid $color-border; padding: $spacing-4 0; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FaqComponent, [{
        type: Component,
        args: [{ selector: 'app-faq', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe], template: "<section class=\"py-20 bg-gray-950\">\r\n  <div class=\"container mx-auto px-6 max-w-4xl\">\r\n    <div class=\"text-center mb-16\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white\">{{ 'faq.title' | translate }}</h2>\r\n      <p class=\"text-lg text-gray-400 mt-4\">{{ 'faq.subtitle' | translate }}</p>\r\n    </div>\r\n    <div class=\"space-y-4\">\r\n      @for(faq of faqs(); track faq.questionKey; let i = $index) {\r\n        <div class=\"bg-slate-900 border border-slate-800 rounded-lg overflow-hidden\">\r\n          <button (click)=\"toggleFaq(i)\" class=\"w-full flex justify-between items-center text-start p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500\">\r\n            <span class=\"font-semibold text-white text-lg\">{{ faq.questionKey | translate }}</span>\r\n            <svg class=\"w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0\" [class.rotate-180]=\"faq.isOpen\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>\r\n          </button>\r\n          @if(faq.isOpen) {\r\n            <div class=\"px-6 pb-6 text-gray-300 animate-fade-in\">\r\n              <p [innerHTML]=\"faq.answerKey | translate\"></p>\r\n            </div>\r\n          }\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.faq { padding: $spacing-8 0; }\r\n.faq-item { border-bottom: 1px solid $color-border; padding: $spacing-4 0; }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FaqComponent, { className: "FaqComponent", filePath: "src/app/components/faq/faq.component.ts", lineNumber: 17 }); })();
