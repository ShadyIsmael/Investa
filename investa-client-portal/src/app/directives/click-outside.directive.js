import { Directive, Output, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export class ClickOutsideDirective {
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.clickOutside = new EventEmitter();
    }
    onClick(event) {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInside) {
            this.clickOutside.emit(event);
        }
    }
    static { this.ɵfac = function ClickOutsideDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ClickOutsideDirective)(i0.ɵɵdirectiveInject(i0.ElementRef)); }; }
    static { this.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: ClickOutsideDirective, selectors: [["", "clickOutside", ""]], hostBindings: function ClickOutsideDirective_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function ClickOutsideDirective_click_HostBindingHandler($event) { return ctx.onClick($event); }, i0.ɵɵresolveDocument);
        } }, outputs: { clickOutside: "clickOutside" } }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ClickOutsideDirective, [{
        type: Directive,
        args: [{
                selector: '[clickOutside]',
                standalone: true,
                host: {
                    '(document:click)': 'onClick($event)'
                }
            }]
    }], () => [{ type: i0.ElementRef }], { clickOutside: [{
            type: Output
        }] }); })();
