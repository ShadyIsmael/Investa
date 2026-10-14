import { Pipe, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { get } from 'lodash-es';
import * as i0 from "@angular/core";
export class TranslatePipe {
    constructor() {
        this.languageService = inject(LanguageService);
    }
    transform(key, params) {
        const currentLanguage = this.languageService.language();
        const currentDictionary = this.languageService.dictionary();
        // Return the key if dictionary is empty (still loading)
        if (!currentDictionary || Object.keys(currentDictionary).length === 0) {
            return key;
        }
        let value = get(currentDictionary, key, key);
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                value = value.split(`{{${k}}}`).join(String(v));
            }
        }
        return value;
    }
    static { this.ɵfac = function TranslatePipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TranslatePipe)(); }; }
    static { this.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "translate", type: TranslatePipe, pure: false }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TranslatePipe, [{
        type: Pipe,
        args: [{
                name: 'translate',
                standalone: true,
                pure: false,
            }]
    }], null, null); })();
