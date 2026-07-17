import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.step;
function ProcessComponent_For_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElement(0, "div", 8);
} }
function ProcessComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7);
    i0.ɵɵconditionalCreate(1, ProcessComponent_For_11_Conditional_1_Template, 1, 0, "div", 8);
    i0.ɵɵdomElementStart(2, "div", 9)(3, "div", 10)(4, "span", 11);
    i0.ɵɵtext(5);
    i0.ɵɵdomElementEnd()()();
    i0.ɵɵdomElementStart(6, "h3", 12);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(9, "p", 13);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const step_r1 = ctx.$implicit;
    const ɵ$index_17_r2 = ctx.$index;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("animation-delay", ɵ$index_17_r2 * 200 + "ms");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ɵ$index_17_r2 < ctx_r2.steps().length - 1 ? 1 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(step_r1.step);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 6, step_r1.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 8, step_r1.descriptionKey));
} }
export class ProcessComponent {
    constructor() {
        this.steps = signal([
            {
                step: '01',
                titleKey: 'process.step1.title',
                descriptionKey: 'process.step1.description'
            },
            {
                step: '02',
                titleKey: 'process.step2.title',
                descriptionKey: 'process.step2.description'
            },
            {
                step: '03',
                titleKey: 'process.step3.title',
                descriptionKey: 'process.step3.description'
            },
            {
                step: '04',
                titleKey: 'process.step4.title',
                descriptionKey: 'process.step4.description'
            }
        ], ...(ngDevMode ? [{ debugName: "steps" }] : []));
    }
    static { this.ɵfac = function ProcessComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProcessComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProcessComponent, selectors: [["app-process"]], decls: 12, vars: 6, consts: [[1, "py-20", "bg-gray-950"], [1, "container", "mx-auto", "px-6"], [1, "text-center", "mb-20"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white"], [1, "text-lg", "text-gray-400", "mt-4", "max-w-2xl", "mx-auto"], [1, "relative", "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-4", "gap-y-12", "md:gap-x-8"], [1, "relative", "flex", "flex-col", "items-center", "text-center", "animate-fade-in", 3, "animation-delay"], [1, "relative", "flex", "flex-col", "items-center", "text-center", "animate-fade-in"], [1, "hidden", "lg:block", "absolute", "top-10", "start-1/2", "w-full", "h-px", "bg-slate-700", "border-t", "border-dashed", "border-slate-600"], [1, "relative", "z-10"], [1, "w-20", "h-20", "flex", "items-center", "justify-center", "bg-gray-950", "border-2", "border-slate-700", "rounded-full", "mb-6"], [1, "text-3xl", "font-bold", "text-blue-400"], [1, "text-xl", "font-semibold", "text-white", "mb-2"], [1, "text-gray-400", "px-2"]], template: function ProcessComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(9, "div", 5);
            i0.ɵɵrepeaterCreate(10, ProcessComponent_For_11_Template, 12, 10, "div", 6, _forTrack0);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "process.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "process.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.steps());
        } }, dependencies: [TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.process[_ngcontent-%COMP%] { padding: $spacing-6; }\r\n.process-step[_ngcontent-%COMP%] { @include card($spacing-4); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProcessComponent, [{
        type: Component,
        args: [{ selector: 'app-process', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe], template: "<section class=\"py-20 bg-gray-950\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"text-center mb-20\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white\">{{ 'process.title' | translate }}</h2>\r\n      <p class=\"text-lg text-gray-400 mt-4 max-w-2xl mx-auto\">{{ 'process.subtitle' | translate }}</p>\r\n    </div>\r\n    <div class=\"relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-x-8\">\r\n      @for(step of steps(); track step.step; let i = $index) {\r\n        <div class=\"relative flex flex-col items-center text-center animate-fade-in\" [style.animation-delay]=\"i * 200 + 'ms'\">\r\n          <!-- Connecting line -->\r\n          @if (i < steps().length - 1) {\r\n            <div class=\"hidden lg:block absolute top-10 start-1/2 w-full h-px bg-slate-700 border-t border-dashed border-slate-600\"></div>\r\n          }\r\n          <div class=\"relative z-10\">\r\n            <div class=\"w-20 h-20 flex items-center justify-center bg-gray-950 border-2 border-slate-700 rounded-full mb-6\">\r\n              <span class=\"text-3xl font-bold text-blue-400\">{{ step.step }}</span>\r\n            </div>\r\n          </div>\r\n          <h3 class=\"text-xl font-semibold text-white mb-2\">{{ step.titleKey | translate }}</h3>\r\n          <p class=\"text-gray-400 px-2\">{{ step.descriptionKey | translate }}</p>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.process { padding: $spacing-6; }\r\n.process-step { @include card($spacing-4); }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProcessComponent, { className: "ProcessComponent", filePath: "src/app/components/process/process.component.ts", lineNumber: 17 }); })();
