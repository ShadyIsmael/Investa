import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { BlogService } from '../../services/blog.service';
import { RouterLink } from '@angular/router';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/blog", a0];
const _forTrack0 = ($index, $item) => $item.titleKey;
function BlogComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7)(1, "a", 8);
    i0.ɵɵelement(2, "img", 9);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 10)(5, "span", 11);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "h3", 12)(9, "a", 13);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "p", 14);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "a", 15);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const post_r1 = ctx.$implicit;
    const ɵ$index_17_r2 = ctx.$index;
    i0.ɵɵstyleProp("animation-delay", 150 * ɵ$index_17_r2 + "ms");
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(22, _c0, post_r1.slug));
    i0.ɵɵadvance();
    i0.ɵɵproperty("alt", i0.ɵɵinterpolate(i0.ɵɵpipeBind1(3, 12, post_r1.titleKey)))("src", post_r1.imageUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 14, post_r1.categoryKey));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(24, _c0, post_r1.slug));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 16, post_r1.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 18, post_r1.excerptKey));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(26, _c0, post_r1.slug));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 20, "blog.readMore"), " \u2192 ");
} }
export class BlogComponent {
    constructor() {
        this.blogService = inject(BlogService);
        this.posts = this.blogService.getLatestPosts(3);
    }
    static { this.ɵfac = function BlogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BlogComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BlogComponent, selectors: [["app-blog"]], decls: 12, vars: 6, consts: [[1, "py-20", "bg-gray-950"], [1, "container", "mx-auto", "px-6"], [1, "text-center", "mb-12", "animate-fade-in"], [1, "text-3xl", "md:text-4xl", "font-bold", "text-white"], [1, "text-lg", "text-gray-400", "mt-4", "max-w-2xl", "mx-auto"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-8"], [1, "bg-slate-900", "rounded-lg", "overflow-hidden", "border", "border-slate-800", "group", "animate-fade-in", 3, "animation-delay"], [1, "bg-slate-900", "rounded-lg", "overflow-hidden", "border", "border-slate-800", "group", "animate-fade-in"], [1, "block", 3, "routerLink"], [1, "w-full", "h-48", "object-cover", "group-hover:scale-105", "transition-transform", "duration-300", 3, "src", "alt"], [1, "p-6"], [1, "text-sm", "font-semibold", "text-blue-400"], [1, "text-xl", "font-semibold", "text-white", "mt-2", "mb-3"], [1, "hover:text-blue-400", "transition-colors", "duration-300", 3, "routerLink"], [1, "text-gray-400", "mb-4"], [1, "font-semibold", "text-white", "group-hover:text-blue-400", "transition-colors", "duration-300", 3, "routerLink"]], template: function BlogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "div", 5);
            i0.ɵɵrepeaterCreate(10, BlogComponent_For_11_Template, 18, 28, "div", 6, _forTrack0);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "blog.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "blog.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.posts());
        } }, dependencies: [RouterLink, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.blog-component[_ngcontent-%COMP%] { padding: $spacing-6; }\r\n.blog-post[_ngcontent-%COMP%] { @include card($spacing-4); }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BlogComponent, [{
        type: Component,
        args: [{ selector: 'app-blog', changeDetection: ChangeDetectionStrategy.OnPush, imports: [TranslatePipe, RouterLink], template: "<section class=\"py-20 bg-gray-950\">\r\n  <div class=\"container mx-auto px-6\">\r\n    <div class=\"text-center mb-12 animate-fade-in\">\r\n      <h2 class=\"text-3xl md:text-4xl font-bold text-white\">{{ 'blog.title' | translate }}</h2>\r\n      <p class=\"text-lg text-gray-400 mt-4 max-w-2xl mx-auto\">{{ 'blog.subtitle' | translate }}</p>\r\n    </div>\r\n    <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\r\n      @for(post of posts(); track post.titleKey; let i = $index) {\r\n        <div class=\"bg-slate-900 rounded-lg overflow-hidden border border-slate-800 group animate-fade-in\" [style.animation-delay]=\"150 * i + 'ms'\">\r\n          <a [routerLink]=\"['/blog', post.slug]\" class=\"block\">\r\n            <img [src]=\"post.imageUrl\" alt=\"{{ post.titleKey | translate }}\" class=\"w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300\">\r\n          </a>\r\n          <div class=\"p-6\">\r\n            <span class=\"text-sm font-semibold text-blue-400\">{{ post.categoryKey | translate }}</span>\r\n            <h3 class=\"text-xl font-semibold text-white mt-2 mb-3\">\r\n              <a [routerLink]=\"['/blog', post.slug]\" class=\"hover:text-blue-400 transition-colors duration-300\">{{ post.titleKey | translate }}</a>\r\n            </h3>\r\n            <p class=\"text-gray-400 mb-4\">{{ post.excerptKey | translate }}</p>\r\n            <a [routerLink]=\"['/blog', post.slug]\" class=\"font-semibold text-white group-hover:text-blue-400 transition-colors duration-300\">\r\n              {{ 'blog.readMore' | translate }} &rarr;\r\n            </a>\r\n          </div>\r\n        </div>\r\n      }\r\n    </div>\r\n  </div>\r\n</section>", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.blog-component { padding: $spacing-6; }\r\n.blog-post { @include card($spacing-4); }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BlogComponent, { className: "BlogComponent", filePath: "src/app/components/blog/blog.component.ts", lineNumber: 13 }); })();
