import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { AboutComponent } from '../../components/about/about.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { BlogComponent } from '../../components/blog/blog.component';
import { FooterComponent } from '../../components/footer/footer.component';
import * as i0 from "@angular/core";
export class HomeComponent {
    static { this.ɵfac = function HomeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HomeComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HomeComponent, selectors: [["app-home"]], decls: 9, vars: 0, consts: [[1, "home-root"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "main");
            i0.ɵɵelement(2, "app-hero")(3, "app-features")(4, "app-about")(5, "app-cta")(6, "app-testimonials")(7, "app-blog");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(8, "app-footer");
            i0.ɵɵelementEnd();
        } }, dependencies: [HeroComponent,
            FeaturesComponent,
            AboutComponent,
            CtaComponent,
            TestimonialsComponent,
            BlogComponent,
            FooterComponent], styles: [".home-root[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  background: var(--investa-bg);\n  color: var(--investa-text-primary);\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HomeComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-home', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                    HeroComponent,
                    FeaturesComponent,
                    AboutComponent,
                    CtaComponent,
                    TestimonialsComponent,
                    BlogComponent,
                    FooterComponent
                ], template: "\n<div class=\"home-root\">\n  <main>\n    <app-hero></app-hero>\n    <app-features></app-features>\n    <app-about></app-about>\n    <app-cta></app-cta>\n    <app-testimonials></app-testimonials>\n    <app-blog></app-blog>\n  </main>\n  <app-footer></app-footer>\n</div>\n", styles: [".home-root {\n  min-height: 100vh;\n  background: var(--investa-bg);\n  color: var(--investa-text-primary);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HomeComponent, { className: "HomeComponent", filePath: "src/app/pages/home/home.component.ts", lineNumber: 27 }); })();
