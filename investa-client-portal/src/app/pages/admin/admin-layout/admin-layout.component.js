import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../../../components/admin-navbar/admin-navbar.component';
import * as i0 from "@angular/core";
export class AdminLayoutComponent {
    static { this.ɵfac = function AdminLayoutComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminLayoutComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminLayoutComponent, selectors: [["app-admin-layout"]], decls: 4, vars: 0, consts: [[1, "admin-shell", "investa-page"]], template: function AdminLayoutComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "app-admin-navbar");
            i0.ɵɵelementStart(2, "main");
            i0.ɵɵelement(3, "router-outlet");
            i0.ɵɵelementEnd()();
        } }, dependencies: [RouterOutlet, AdminNavbarComponent], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.admin-layout[_ngcontent-%COMP%] { min-height: 100vh; display: flex; }\r\n.admin-layout[_ngcontent-%COMP%]   .content[_ngcontent-%COMP%] { flex: 1; padding: $spacing-6; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminLayoutComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-admin-layout', changeDetection: ChangeDetectionStrategy.OnPush, imports: [RouterOutlet, AdminNavbarComponent], template: "\r\n<div class=\"admin-shell investa-page\">\n  <app-admin-navbar></app-admin-navbar>\n  <main>\n    <router-outlet></router-outlet>\n  </main>\n</div>\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.admin-layout { min-height: 100vh; display: flex; }\r\n.admin-layout .content { flex: 1; padding: $spacing-6; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminLayoutComponent, { className: "AdminLayoutComponent", filePath: "src/app/pages/admin/admin-layout/admin-layout.component.ts", lineNumber: 14 }); })();
