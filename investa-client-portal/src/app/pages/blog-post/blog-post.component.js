import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { BlogService } from '../../services/blog.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { FileStoreService } from '../../services/file-store.service';
import { get } from 'lodash-es';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/blog", a0];
const _forTrack0 = ($index, $item) => $item.slug;
function BlogPostPageComponent_Conditional_3_For_40_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "p", 33);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const content_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("innerHTML", i0.ɵɵpipeBind1(1, 1, content_r2.text), i0.ɵɵsanitizeHtml);
} }
function BlogPostPageComponent_Conditional_3_For_40_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "h2", 33);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const content_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("innerHTML", i0.ɵɵpipeBind1(1, 1, content_r2.text), i0.ɵɵsanitizeHtml);
} }
function BlogPostPageComponent_Conditional_3_For_40_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "li", 33);
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵproperty("innerHTML", item_r3, i0.ɵɵsanitizeHtml);
} }
function BlogPostPageComponent_Conditional_3_For_40_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul");
    i0.ɵɵrepeaterCreate(1, BlogPostPageComponent_Conditional_3_For_40_Conditional_2_For_2_Template, 1, 1, "li", 33, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const content_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵrepeater(content_r2.items);
} }
function BlogPostPageComponent_Conditional_3_For_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, BlogPostPageComponent_Conditional_3_For_40_Conditional_0_Template, 2, 3, "p", 33)(1, BlogPostPageComponent_Conditional_3_For_40_Conditional_1_Template, 2, 3, "h2", 33)(2, BlogPostPageComponent_Conditional_3_For_40_Conditional_2_Template, 3, 0, "ul");
} if (rf & 2) {
    const content_r2 = ctx.$implicit;
    i0.ɵɵconditional(content_r2.type === "p" ? 0 : content_r2.type === "h2" ? 1 : content_r2.type === "ul" ? 2 : -1);
} }
function BlogPostPageComponent_Conditional_3_ForEmpty_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 34);
    i0.ɵɵtext(4, "Full article coming soon...");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, p_r1.excerptKey));
} }
function BlogPostPageComponent_Conditional_3_For_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 32);
    i0.ɵɵelement(1, "img", 35);
    i0.ɵɵelementStart(2, "div")(3, "h4", 36);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 37);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const related_r4 = ctx.$implicit;
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(6, _c0, related_r4.slug));
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r4.resolveImageUrl(related_r4.imageUrl), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, related_r4.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(related_r4.publishedDate);
} }
function BlogPostPageComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "header", 2);
    i0.ɵɵelement(2, "div", 3)(3, "div", 4);
    i0.ɵɵelementStart(4, "div", 5)(5, "p", 6);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "h1", 7);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 8);
    i0.ɵɵelement(11, "img", 9);
    i0.ɵɵelementStart(12, "div")(13, "p", 10);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "p", 11);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(19, "div", 12)(20, "div", 13)(21, "div", 14)(22, "div", 15)(23, "div", 16)(24, "h3", 17);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "div", 18)(28, "a", 19);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(29, "svg", 20);
    i0.ɵɵelement(30, "path", 21);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(31, "a", 22);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(32, "svg", 20);
    i0.ɵɵelement(33, "path", 23);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(34, "a", 24);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(35, "svg", 20);
    i0.ɵɵelement(36, "path", 25);
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(37, "main", 26)(38, "article", 27);
    i0.ɵɵrepeaterCreate(39, BlogPostPageComponent_Conditional_3_For_40_Template, 3, 1, null, null, i0.ɵɵrepeaterTrackByIndex, false, BlogPostPageComponent_Conditional_3_ForEmpty_41_Template, 5, 3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(42, "aside", 28)(43, "div", 29)(44, "div")(45, "h3", 30);
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "div", 31);
    i0.ɵɵrepeaterCreate(49, BlogPostPageComponent_Conditional_3_For_50_Template, 8, 8, "a", 32, _forTrack0);
    i0.ɵɵelementEnd()()()()()()()();
} if (rf & 2) {
    const p_r1 = ctx;
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("background-image", "url(" + ctx_r4.resolveImageUrl(p_r1.imageUrl) + ")");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(p_r1.category);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 12, p_r1.titleKey), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("src", p_r1.authorAvatar, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(15, 14, "blogPostPage.publishedBy"), " ", p_r1.author);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(18, 16, "blogPostPage.on"), " ", p_r1.publishedDate);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 18, "blogPostPage.shareArticle"));
    i0.ɵɵadvance(14);
    i0.ɵɵrepeater(ctx_r4.postContent());
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 20, "blogPostPage.relatedPosts"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r4.relatedPosts());
} }
function BlogPostPageComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "h1", 38);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 39);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "a", 40);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "blogPostPage.notFound.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 5, "blogPostPage.notFound.subtitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 7, "blogPostPage.notFound.backButton"), " ");
} }
export class BlogPostPageComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.blogService = inject(BlogService);
        this.languageService = inject(LanguageService);
        this.fileStoreService = inject(FileStoreService);
        this.post = signal(undefined, ...(ngDevMode ? [{ debugName: "post" }] : []));
        this.relatedPosts = signal([], ...(ngDevMode ? [{ debugName: "relatedPosts" }] : []));
        this.postContent = computed(() => {
            const p = this.post();
            if (!p || !p.contentKey) {
                return [];
            }
            const dictionary = this.languageService.dictionary();
            const content = get(dictionary, p.contentKey, []);
            return content.map(item => {
                if (item.type === 'ul' && Array.isArray(item.items)) {
                    return { ...item, items: item.items.map((key) => get(dictionary, key, key)) };
                }
                return item;
            });
        }, ...(ngDevMode ? [{ debugName: "postContent" }] : []));
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                // We must get the value from the computed signal inside the subscription
                const foundPost = this.blogService.getPostBySlug(slug)();
                this.post.set(foundPost);
                const related = this.blogService.getRelatedPosts(slug, 3)();
                this.relatedPosts.set(related);
                // Scroll to top on post change
                window.scrollTo(0, 0);
            }
        });
    }
    resolveImageUrl(url) {
        return this.fileStoreService.getPublicUrl(url);
    }
    static { this.ɵfac = function BlogPostPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BlogPostPageComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BlogPostPageComponent, selectors: [["app-blog-post-page"]], decls: 7, vars: 1, consts: [[1, "relative", "overflow-x-hidden"], [1, "text-center", "py-40", "text-white"], [1, "relative", "bg-gray-950", "text-white", "pt-32", "pb-16", "lg:pt-40", "lg:pb-24", "overflow-hidden"], [1, "absolute", "inset-0", "bg-cover", "bg-center", "opacity-20"], [1, "absolute", "inset-0", "bg-gradient-to-t", "from-gray-950", "via-gray-950/80", "to-transparent"], [1, "container", "mx-auto", "px-6", "relative", "z-10", "text-center", "animate-fade-in"], [1, "text-sm", "font-semibold", "text-blue-400", "uppercase", "tracking-wider", "mb-4"], [1, "text-4xl", "md:text-6xl", "font-bold", "mb-4", "text-white", "max-w-4xl", "mx-auto"], [1, "mt-8", "flex", "items-center", "justify-center", "gap-4"], [1, "w-12", "h-12", "rounded-full", "ring-2", "ring-slate-700", 3, "src"], [1, "font-semibold", "text-white"], [1, "text-sm", "text-gray-400"], [1, "bg-gray-950", "py-16", "lg:py-24"], [1, "container", "mx-auto", "px-6", "max-w-7xl"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-8", "lg:gap-12"], [1, "hidden", "lg:block", "lg:col-span-2"], [1, "sticky", "top-28"], [1, "font-semibold", "text-white", "mb-4", "uppercase", "text-sm", "tracking-wider"], [1, "flex", "lg:flex-col", "gap-2"], ["href", "#", 1, "w-10", "h-10", "flex", "items-center", "justify-center", "bg-slate-800", "hover:bg-blue-600", "rounded-full", "text-gray-400", "hover:text-white", "transition-colors"], ["fill", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["d", "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"], ["href", "#", 1, "w-10", "h-10", "flex", "items-center", "justify-center", "bg-slate-800", "hover:bg-sky-500", "rounded-full", "text-gray-400", "hover:text-white", "transition-colors"], ["d", "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085c.645 1.956 2.52 3.379 4.738 3.419a9.9 9.9 0 01-6.115 2.107c-.398 0-.79-.023-1.175-.068a13.963 13.963 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"], ["href", "#", 1, "w-10", "h-10", "flex", "items-center", "justify-center", "bg-slate-800", "hover:bg-blue-700", "rounded-full", "text-gray-400", "hover:text-white", "transition-colors"], ["d", "M21 2H3a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zM8.09 18.91H5.5V9.45h2.59v9.46zM6.79 8.35a1.56 1.56 0 110-3.12 1.56 1.56 0 010 3.12zm11.21 10.56h-2.58v-4.6c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.2-1.77 2.43v4.68H9.53V9.45h2.47v1.14h.04a2.71 2.71 0 012.44-1.34c2.61 0 3.09 1.72 3.09 3.95v4.71z"], [1, "lg:col-span-7"], [1, "prose", "prose-invert", "prose-lg", "max-w-none", "text-gray-300", "prose-h2:text-white", "prose-h2:font-bold", "prose-h2:border-b", "prose-h2:border-slate-700", "prose-h2:pb-4", "prose-strong:text-white", "prose-a:text-blue-400", "hover:prose-a:text-blue-300", "prose-ul:list-disc", "prose-ul:ms-6"], [1, "lg:col-span-3"], [1, "sticky", "top-28", "space-y-8"], [1, "font-semibold", "text-white", "mb-4", "text-xl"], [1, "space-y-4"], [1, "flex", "items-center", "gap-4", "group", 3, "routerLink"], [3, "innerHTML"], [1, "mt-8", "text-center", "text-gray-500"], ["alt", "", 1, "w-20", "h-16", "object-cover", "rounded-md", "flex-shrink-0", 3, "src"], [1, "font-semibold", "text-white", "group-hover:text-blue-400", "transition-colors", "text-sm", "line-clamp-2"], [1, "text-xs", "text-gray-500"], [1, "text-4xl", "font-bold", "mb-4"], [1, "text-lg", "text-gray-400"], ["routerLink", "/blog", 1, "mt-8", "inline-block", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "font-semibold", "py-3", "px-8", "rounded-full", "hover:opacity-90", "transition-opacity"]], template: function BlogPostPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "app-header");
            i0.ɵɵelementStart(2, "main");
            i0.ɵɵconditionalCreate(3, BlogPostPageComponent_Conditional_3_Template, 51, 22, "div")(4, BlogPostPageComponent_Conditional_4_Template, 10, 9, "div", 1);
            i0.ɵɵelement(5, "app-cta");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(6, "app-footer");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_0_0 = ctx.post()) ? 3 : 4, tmp_0_0);
        } }, dependencies: [CommonModule,
            HeaderComponent,
            FooterComponent,
            CtaComponent,
            RouterLink,
            TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.blog-post[_ngcontent-%COMP%] { padding: $spacing-8 0; }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BlogPostPageComponent, [{
        type: Component,
        args: [{ selector: 'app-blog-post-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                    CommonModule,
                    HeaderComponent,
                    FooterComponent,
                    CtaComponent,
                    TranslatePipe,
                    RouterLink
                ], template: "<div class=\"relative overflow-x-hidden\">\r\n  <app-header></app-header>\r\n  <main>\r\n    @if(post(); as p) {\r\n      <div>\r\n        <!-- Post Header -->\r\n        <header class=\"relative bg-gray-950 text-white pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden\">\r\n          <div class=\"absolute inset-0 bg-cover bg-center opacity-20\" [style.background-image]=\"'url(' + resolveImageUrl(p.imageUrl) + ')'\"></div>\r\n          <div class=\"absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent\"></div>\r\n          <div class=\"container mx-auto px-6 relative z-10 text-center animate-fade-in\">\r\n            <p class=\"text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4\">{{ p.category }}</p>\r\n            <h1 class=\"text-4xl md:text-6xl font-bold mb-4 text-white max-w-4xl mx-auto\">\r\n              {{ p.titleKey | translate }}\r\n            </h1>\r\n            <div class=\"mt-8 flex items-center justify-center gap-4\">\r\n                <img [src]=\"p.authorAvatar\" class=\"w-12 h-12 rounded-full ring-2 ring-slate-700\"/>\r\n                <div>\r\n                    <p class=\"font-semibold text-white\">{{ 'blogPostPage.publishedBy' | translate }} {{ p.author }}</p>\r\n                    <p class=\"text-sm text-gray-400\">{{ 'blogPostPage.on' | translate }} {{ p.publishedDate }}</p>\r\n                </div>\r\n            </div>\r\n          </div>\r\n        </header>\r\n\r\n        <!-- Post Content -->\r\n        <div class=\"bg-gray-950 py-16 lg:py-24\">\r\n          <div class=\"container mx-auto px-6 max-w-7xl\">\r\n            <div class=\"grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12\">\r\n              \r\n              <!-- Left Sidebar: Social Share -->\r\n              <div class=\"hidden lg:block lg:col-span-2\">\r\n                <div class=\"sticky top-28\">\r\n                  <h3 class=\"font-semibold text-white mb-4 uppercase text-sm tracking-wider\">{{ 'blogPostPage.shareArticle' | translate }}</h3>\r\n                  <div class=\"flex lg:flex-col gap-2\">\r\n                    <a href=\"#\" class=\"w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-blue-600 rounded-full text-gray-400 hover:text-white transition-colors\"><svg class=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z\"/></svg></a>\r\n                    <a href=\"#\" class=\"w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-sky-500 rounded-full text-gray-400 hover:text-white transition-colors\"><svg class=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085c.645 1.956 2.52 3.379 4.738 3.419a9.9 9.9 0 01-6.115 2.107c-.398 0-.79-.023-1.175-.068a13.963 13.963 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z\"/></svg></a>\r\n                    <a href=\"#\" class=\"w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-blue-700 rounded-full text-gray-400 hover:text-white transition-colors\"><svg class=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 2H3a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zM8.09 18.91H5.5V9.45h2.59v9.46zM6.79 8.35a1.56 1.56 0 110-3.12 1.56 1.56 0 010 3.12zm11.21 10.56h-2.58v-4.6c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.2-1.77 2.43v4.68H9.53V9.45h2.47v1.14h.04a2.71 2.71 0 012.44-1.34c2.61 0 3.09 1.72 3.09 3.95v4.71z\"/></svg></a>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n\r\n              <!-- Main Article Content -->\r\n              <main class=\"lg:col-span-7\">\r\n                <article class=\"prose prose-invert prose-lg max-w-none text-gray-300 prose-h2:text-white prose-h2:font-bold prose-h2:border-b prose-h2:border-slate-700 prose-h2:pb-4 prose-strong:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-ul:list-disc prose-ul:ms-6\">\r\n                  @for(content of postContent(); track $index) {\r\n                    @if (content.type === 'p') {\r\n                      <p [innerHTML]=\"content.text | translate\"></p>\r\n                    } @else if (content.type === 'h2') {\r\n                      <h2 [innerHTML]=\"content.text | translate\"></h2>\r\n                    } @else if (content.type === 'ul') {\r\n                      <ul>\r\n                        @for(item of content.items; track item) {\r\n                          <li [innerHTML]=\"item\"></li>\r\n                        }\r\n                      </ul>\r\n                    }\r\n                  } @empty {\r\n                    <p>{{ p.excerptKey | translate }}</p>\r\n                    <p class=\"mt-8 text-center text-gray-500\">Full article coming soon...</p>\r\n                  }\r\n                </article>\r\n              </main>\r\n\r\n              <!-- Right Sidebar: Related Posts -->\r\n              <aside class=\"lg:col-span-3\">\r\n                <div class=\"sticky top-28 space-y-8\">\r\n                  <div>\r\n                    <h3 class=\"font-semibold text-white mb-4 text-xl\">{{ 'blogPostPage.relatedPosts' | translate }}</h3>\r\n                    <div class=\"space-y-4\">\r\n                      @for(related of relatedPosts(); track related.slug) {\r\n                        <a [routerLink]=\"['/blog', related.slug]\" class=\"flex items-center gap-4 group\">\r\n                          <img [src]=\"resolveImageUrl(related.imageUrl)\" alt=\"\" class=\"w-20 h-16 object-cover rounded-md flex-shrink-0\">\r\n                          <div>\r\n                            <h4 class=\"font-semibold text-white group-hover:text-blue-400 transition-colors text-sm line-clamp-2\">{{ related.titleKey | translate }}</h4>\r\n                            <p class=\"text-xs text-gray-500\">{{ related.publishedDate }}</p>\r\n                          </div>\r\n                        </a>\r\n                      }\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n              </aside>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    } @else {\r\n      <div class=\"text-center py-40 text-white\">\r\n        <h1 class=\"text-4xl font-bold mb-4\">{{ 'blogPostPage.notFound.title' | translate }}</h1>\r\n        <p class=\"text-lg text-gray-400\">{{ 'blogPostPage.notFound.subtitle' | translate }}</p>\r\n        <a routerLink=\"/blog\" class=\"mt-8 inline-block bg-gradient-to-r from-blue-500 to-purple-600 font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-opacity\">\r\n          {{ 'blogPostPage.notFound.backButton' | translate }}\r\n        </a>\r\n      </div>\r\n    }\r\n\r\n    <app-cta></app-cta>\r\n  </main>\r\n  <app-footer></app-footer>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\r\n\r\n.blog-post { padding: $spacing-8 0; }"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BlogPostPageComponent, { className: "BlogPostPageComponent", filePath: "src/app/pages/blog-post/blog-post.component.ts", lineNumber: 27 }); })();
