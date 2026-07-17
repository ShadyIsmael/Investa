import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { BlogService } from '../../services/blog.service';
import { RouterLink } from '@angular/router';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/blog", a0];
const _forTrack0 = ($index, $item) => $item.titleKey;
function AllPostsComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "a", 5);
    i0.ɵɵelement(2, "img", 6);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 7)(5, "span", 8);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "h3", 9)(8, "a", 10);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "p", 11);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "a", 12);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const post_r1 = ctx.$implicit;
    const ɵ$index_7_r2 = ctx.$index;
    i0.ɵɵstyleProp("animation-delay", 100 * ɵ$index_7_r2 + "ms");
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(20, _c0, post_r1.slug));
    i0.ɵɵadvance();
    i0.ɵɵproperty("alt", i0.ɵɵinterpolate(i0.ɵɵpipeBind1(3, 12, post_r1.titleKey)))("src", post_r1.imageUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(post_r1.category);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(22, _c0, post_r1.slug));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 14, post_r1.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 16, post_r1.excerptKey));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(24, _c0, post_r1.slug));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 18, "blog.readMore"), " \u2192 ");
} }
export class AllPostsComponent {
    constructor() {
        this.blogService = inject(BlogService);
        this.posts = this.blogService.getAllPosts();
    }
    static { this.ɵfac = function AllPostsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AllPostsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AllPostsComponent, selectors: [["app-all-posts"]], decls: 5, vars: 0, consts: [[1, "py-20", "bg-gray-900"], [1, "container", "mx-auto", "px-6"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-8"], [1, "bg-slate-900", "rounded-lg", "overflow-hidden", "border", "border-slate-800", "group", "animate-fade-in", 3, "animation-delay"], [1, "bg-slate-900", "rounded-lg", "overflow-hidden", "border", "border-slate-800", "group", "animate-fade-in"], [1, "block", 3, "routerLink"], [1, "w-full", "h-48", "object-cover", "group-hover:scale-105", "transition-transform", "duration-300", 3, "src", "alt"], [1, "p-6"], [1, "text-sm", "font-semibold", "text-blue-400"], [1, "text-xl", "font-semibold", "text-white", "mt-2", "mb-3", "h-20"], [1, "hover:text-blue-400", "transition-colors", "duration-300", 3, "routerLink"], [1, "text-gray-400", "mb-4", "h-24"], [1, "font-semibold", "text-white", "group-hover:text-blue-400", "transition-colors", "duration-300", 3, "routerLink"]], template: function AllPostsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵrepeaterCreate(3, AllPostsComponent_For_4_Template, 17, 26, "div", 3, _forTrack0);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.posts());
        } }, dependencies: [RouterLink, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.all-posts[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: $spacing-6; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AllPostsComponent, [{
        type: Component,
        args: [{ selector: 'app-all-posts', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe, RouterLink], template: "<section class=\"py-20 bg-gray-900\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\r\n      @for(post of posts(); track post.titleKey; let i = $index) {\r\n        <div class=\"bg-slate-900 rounded-lg overflow-hidden border border-slate-800 group animate-fade-in\" [style.animation-delay]=\"100 * i + 'ms'\">\r\n          <a [routerLink]=\"['/blog', post.slug]\" class=\"block\">\r\n            <img [src]=\"post.imageUrl\" alt=\"{{ post.titleKey | translate }}\" class=\"w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300\">\r\n          </a>\r\n          <div class=\"p-6\">\r\n            <span class=\"text-sm font-semibold text-blue-400\">{{ post.category }}</span>\r\n            <h3 class=\"text-xl font-semibold text-white mt-2 mb-3 h-20\">\r\n              <a [routerLink]=\"['/blog', post.slug]\" class=\"hover:text-blue-400 transition-colors duration-300\">{{ post.titleKey | translate }}</a>\r\n            </h3>\r\n            <p class=\"text-gray-400 mb-4 h-24\">{{ post.excerptKey | translate }}</p>\r\n            <a [routerLink]=\"['/blog', post.slug]\" class=\"font-semibold text-white group-hover:text-blue-400 transition-colors duration-300\">\r\n              {{ 'blog.readMore' | translate }} &rarr;\r\n            </a>\r\n          </div>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.all-posts { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: $spacing-6; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AllPostsComponent, { className: "AllPostsComponent", filePath: "src/app/components/all-posts/all-posts.component.ts", lineNumber: 13 }); })();
