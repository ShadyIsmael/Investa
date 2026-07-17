import { Injectable, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class UiService {
    constructor() {
        this.isRoleSelectOpen = signal(false, ...(ngDevMode ? [{ debugName: "isRoleSelectOpen" }] : []));
    }
    openRoleSelectModal() {
        this.isRoleSelectOpen.set(true);
    }
    closeRoleSelectModal() {
        this.isRoleSelectOpen.set(false);
    }
    static { this.ɵfac = function UiService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UiService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UiService, factory: UiService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UiService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();
