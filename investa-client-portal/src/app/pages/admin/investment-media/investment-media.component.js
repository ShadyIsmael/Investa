import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OpportunityService } from '../../../services/opportunity.service';
import { FileStoreService } from '../../../services/file-store.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/admin/investments", a0];
const _forTrack0 = ($index, $item) => $item.id;
function InvestmentMediaComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 3);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 10);
    i0.ɵɵelement(2, "path", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r1 = ctx;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, inv_r1.id));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", inv_r1.title || "Opportunity", " ");
} }
function InvestmentMediaComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 4);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 10);
    i0.ɵɵelement(2, "path", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "investmentPreview.backButton"), " ");
} }
function InvestmentMediaComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelement(1, "div", 12);
    i0.ɵɵelementEnd();
} }
function InvestmentMediaComponent_Conditional_9_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", ctx_r2.getPhotos(inv_r2).length, "\u00A0", i0.ɵɵpipeBind1(1, 2, "investmentPreview.images"), " ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " \u00A0\u00B7\u00A0 ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", (inv_r2.videoUrl ? 1 : 0) + ctx_r2.getVideos(inv_r2).length, "\u00A0", i0.ɵɵpipeBind1(1, 2, "investmentPreview.video"), " ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 29);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const img_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", img_r6.caption || img_r6.fileName, " ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "investmentPreview.primaryImage"), " ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 24);
    i0.ɵɵlistener("click", function InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Template_button_click_0_listener() { const ɵ$index_66_r5 = i0.ɵɵrestoreView(_r4).$index; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.openLightbox(ɵ$index_66_r5)); });
    i0.ɵɵelement(1, "img", 25);
    i0.ɵɵelementStart(2, "div", 26);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(3, "svg", 27);
    i0.ɵɵelement(4, "path", 28);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Conditional_5_Template, 2, 1, "div", 29);
    i0.ɵɵconditionalCreate(6, InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Conditional_6_Template, 3, 3, "div", 30);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "div", 31);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const img_r6 = ctx.$implicit;
    const ɵ$index_66_r5 = ctx.$index;
    const inv_r2 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("title", img_r6.caption || img_r6.fileName || "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r2.resolveImageUrl(img_r6.fileUrl || img_r6.previewUrl || img_r6.thumbnailUrl), i0.ɵɵsanitizeUrl)("alt", img_r6.caption || img_r6.fileName || "Photo " + (ɵ$index_66_r5 + 1));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(img_r6.fileName || img_r6.caption ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(img_r6.isPrimary ? 6 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", ɵ$index_66_r5 + 1, "/", ctx_r2.getPhotos(inv_r2).length, " ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 16)(1, "h2", 18);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 19);
    i0.ɵɵelement(3, "path", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, " Photos ");
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "span", 21);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 22);
    i0.ɵɵrepeaterCreate(8, InvestmentMediaComponent_Conditional_9_Conditional_8_For_9_Template, 9, 7, "button", 23, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("(", ctx_r2.getPhotos(inv_r2).length, ")");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.getPhotos(inv_r2));
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 36);
    i0.ɵɵelement(1, "iframe", 38);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", inv_r2.videoUrl, i0.ɵɵsanitizeResourceUrl)("title", inv_r2.title || "Opportunity");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "video", 37);
    i0.ɵɵelement(1, "source", 39);
    i0.ɵɵtext(2, " Your browser does not support the video tag. ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", inv_r2.videoUrl);
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34);
    i0.ɵɵconditionalCreate(1, InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_7_Conditional_1_Template, 2, 2, "div", 36)(2, InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_7_Conditional_2_Template, 3, 1, "video", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isYoutube || ctx_r2.isVimeo ? 1 : 2);
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_8_For_2_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const video_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", video_r7.caption || video_r7.fileName, " ");
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_8_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40)(1, "video", 41);
    i0.ɵɵelement(2, "source", 39);
    i0.ɵɵtext(3, " Your browser does not support the video tag. ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_8_For_2_Conditional_4_Template, 2, 1, "div", 42);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const video_r7 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r2.resolveImageUrl(video_r7.fileUrl || video_r7.previewUrl || video_r7.thumbnailUrl));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(video_r7.fileName || video_r7.caption ? 4 : -1);
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35);
    i0.ɵɵrepeaterCreate(1, InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_8_For_2_Template, 5, 2, "div", 40, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getVideos(inv_r2));
} }
function InvestmentMediaComponent_Conditional_9_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 16)(1, "h2", 18);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 32);
    i0.ɵɵelement(3, "path", 33);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, " Videos ");
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "span", 21);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_7_Template, 3, 1, "div", 34);
    i0.ɵɵconditionalCreate(8, InvestmentMediaComponent_Conditional_9_Conditional_9_Conditional_8_Template, 3, 0, "div", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r2 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("(", (inv_r2.videoUrl ? 1 : 0) + ctx_r2.getVideos(inv_r2).length, ")");
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r2.videoUrl ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.getVideos(inv_r2).length > 0 ? 8 : -1);
} }
function InvestmentMediaComponent_Conditional_9_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17)(1, "div", 43);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 44);
    i0.ɵɵelement(3, "path", 45);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "h3", 46);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 47);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 2, "investmentPreview.noMedia"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 4, "investmentPreview.noMediaSubtitle"));
} }
function InvestmentMediaComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7)(1, "div", 13)(2, "h1", 14);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 15);
    i0.ɵɵconditionalCreate(5, InvestmentMediaComponent_Conditional_9_Conditional_5_Template, 2, 4);
    i0.ɵɵconditionalCreate(6, InvestmentMediaComponent_Conditional_9_Conditional_6_Template, 1, 0);
    i0.ɵɵconditionalCreate(7, InvestmentMediaComponent_Conditional_9_Conditional_7_Template, 2, 4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(8, InvestmentMediaComponent_Conditional_9_Conditional_8_Template, 10, 1, "section", 16);
    i0.ɵɵconditionalCreate(9, InvestmentMediaComponent_Conditional_9_Conditional_9_Template, 9, 3, "section", 16);
    i0.ɵɵconditionalCreate(10, InvestmentMediaComponent_Conditional_9_Conditional_10_Template, 10, 6, "div", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r2 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r2.title || "Opportunity");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.getPhotos(inv_r2).length ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.getPhotos(inv_r2).length && (inv_r2.videoUrl || ctx_r2.getVideos(inv_r2).length > 0) ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r2.videoUrl || ctx_r2.getVideos(inv_r2).length > 0 ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.getPhotos(inv_r2).length > 0 ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r2.videoUrl || ctx_r2.getVideos(inv_r2).length > 0 ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!inv_r2.videoUrl && ctx_r2.getPhotos(inv_r2).length === 0 && ctx_r2.getVideos(inv_r2).length === 0 ? 10 : -1);
} }
function InvestmentMediaComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8)(1, "h2", 48);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "a", 49);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.notFound.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "investmentPreview.backButton"), " ");
} }
function InvestmentMediaComponent_Conditional_11_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 56)(1, "p", 58);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const images_r9 = i0.ɵɵreadContextLet(0);
    const idx_r10 = i0.ɵɵreadContextLet(1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(images_r9[idx_r10].caption || images_r9[idx_r10].fileName);
} }
function InvestmentMediaComponent_Conditional_11_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 59);
    i0.ɵɵlistener("click", function InvestmentMediaComponent_Conditional_11_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); i0.ɵɵnextContext(); const images_r9 = i0.ɵɵreadContextLet(0); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.prevImage(images_r9.length)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 60);
    i0.ɵɵelement(2, "path", 61);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "button", 62);
    i0.ɵɵlistener("click", function InvestmentMediaComponent_Conditional_11_Conditional_9_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r11); i0.ɵɵnextContext(); const images_r9 = i0.ɵɵreadContextLet(0); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.nextImage(images_r9.length)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(4, "svg", 60);
    i0.ɵɵelement(5, "path", 63);
    i0.ɵɵelementEnd()();
} }
function InvestmentMediaComponent_Conditional_11_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const images_r9 = i0.ɵɵreadContextLet(0);
    const idx_r10 = i0.ɵɵreadContextLet(1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", idx_r10 + 1, " / ", images_r9.length, " ");
} }
function InvestmentMediaComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0)(1);
    i0.ɵɵelementStart(2, "div", 50);
    i0.ɵɵlistener("click", function InvestmentMediaComponent_Conditional_11_Template_div_click_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeLightbox()); })("keydown.escape", function InvestmentMediaComponent_Conditional_11_Template_div_keydown_escape_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeLightbox()); })("keydown.arrowLeft", function InvestmentMediaComponent_Conditional_11_Template_div_keydown_arrowLeft_2_listener() { i0.ɵɵrestoreView(_r8); const images_r9 = i0.ɵɵreadContextLet(0); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.prevImage(images_r9.length)); })("keydown.arrowRight", function InvestmentMediaComponent_Conditional_11_Template_div_keydown_arrowRight_2_listener() { i0.ɵɵrestoreView(_r8); const images_r9 = i0.ɵɵreadContextLet(0); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.nextImage(images_r9.length)); });
    i0.ɵɵelementStart(3, "button", 51);
    i0.ɵɵlistener("click", function InvestmentMediaComponent_Conditional_11_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeLightbox()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(4, "svg", 52);
    i0.ɵɵelement(5, "path", 53);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "div", 54);
    i0.ɵɵlistener("click", function InvestmentMediaComponent_Conditional_11_Template_div_click_6_listener($event) { i0.ɵɵrestoreView(_r8); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelement(7, "img", 55);
    i0.ɵɵconditionalCreate(8, InvestmentMediaComponent_Conditional_11_Conditional_8_Template, 3, 1, "div", 56);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, InvestmentMediaComponent_Conditional_11_Conditional_9_Template, 6, 0);
    i0.ɵɵconditionalCreate(10, InvestmentMediaComponent_Conditional_11_Conditional_10_Template, 2, 2, "div", 57);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    const images_r12 = i0.ɵɵstoreLet(ctx_r2.getPhotos(ctx_r2.investment()));
    i0.ɵɵadvance();
    const idx_r13 = i0.ɵɵstoreLet(ctx_r2.lightboxIndex());
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("src", ctx_r2.resolveImageUrl(images_r12[idx_r13].fileUrl || images_r12[idx_r13].previewUrl || images_r12[idx_r13].thumbnailUrl), i0.ɵɵsanitizeUrl)("alt", images_r12[idx_r13].caption || images_r12[idx_r13].fileName || "");
    i0.ɵɵadvance();
    i0.ɵɵconditional(images_r12[idx_r13].caption || images_r12[idx_r13].fileName ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(images_r12.length > 1 ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(images_r12.length > 1 ? 10 : -1);
} }
export class InvestmentMediaComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.opportunityService = inject(OpportunityService);
        this.fileStoreService = inject(FileStoreService);
        this.investment = signal(null, ...(ngDevMode ? [{ debugName: "investment" }] : []));
        this.mediaItems = signal([], ...(ngDevMode ? [{ debugName: "mediaItems" }] : []));
        this.loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.lightboxIndex = signal(null, ...(ngDevMode ? [{ debugName: "lightboxIndex" }] : []));
        this.load();
    }
    async load() {
        const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '', 10);
        if (!id || isNaN(id)) {
            this.loading.set(false);
            return;
        }
        try {
            const inv = await this.opportunityService.getPublicOpportunity(id);
            this.investment.set(inv);
            this.mediaItems.set(await this.opportunityService.getMedia(id));
        }
        catch {
            this.investment.set(null);
            this.mediaItems.set([]);
        }
        finally {
            this.loading.set(false);
        }
    }
    resolveImageUrl(url) {
        if (!url)
            return '';
        if (url.startsWith('http'))
            return url;
        return this.fileStoreService.getPublicUrl(url);
    }
    /**
     * Get project media images (excluding cover images)
     * Cover images (mediaType === 0) are not part of the project media gallery
     */
    getProjectMediaImages(inv) {
        if (!inv)
            return [];
        return this.mediaItems().filter(img => String(img.purpose || '').toLowerCase() !== 'cover');
    }
    /**
     * Get the current active cover image (if any)
     */
    getCoverImage(inv) {
        if (!inv)
            return null;
        return this.mediaItems().find(img => String(img.purpose || '').toLowerCase() === 'cover') || null;
    }
    /**
     * Get photos only (mediaType === 1, excluding cover images)
     */
    getPhotos(inv) {
        if (!inv)
            return [];
        return this.mediaItems().filter(img => (img.mimeType || '').toLowerCase().startsWith('image') && String(img.purpose || '').toLowerCase() !== 'cover');
    }
    /**
     * Get videos only (mediaType === 2)
     */
    getVideos(inv) {
        if (!inv)
            return [];
        return this.mediaItems().filter(img => (img.mimeType || '').toLowerCase().startsWith('video') || /\.(mp4|mov|webm)$/i.test(String(img.fileName || img.fileUrl || '')));
    }
    openLightbox(index) { this.lightboxIndex.set(index); }
    closeLightbox() { this.lightboxIndex.set(null); }
    prevImage(total) {
        const i = this.lightboxIndex();
        if (i !== null)
            this.lightboxIndex.set((i - 1 + total) % total);
    }
    nextImage(total) {
        const i = this.lightboxIndex();
        if (i !== null)
            this.lightboxIndex.set((i + 1) % total);
    }
    get isYoutube() {
        const v = this.investment()?.videoUrl ?? '';
        return v.includes('youtube') || v.includes('youtu.be');
    }
    get isVimeo() {
        return (this.investment()?.videoUrl ?? '').includes('vimeo');
    }
    static { this.ɵfac = function InvestmentMediaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvestmentMediaComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvestmentMediaComponent, selectors: [["app-investment-media"]], decls: 12, vars: 8, consts: [[1, "min-h-screen", "bg-gradient-to-br", "from-slate-950", "via-slate-900", "to-slate-900"], [1, "sticky", "top-0", "z-40", "border-b", "border-slate-800/50", "bg-slate-950/80", "backdrop-blur-md"], [1, "container", "mx-auto", "px-6", "py-4", "flex", "items-center", "justify-between", "gap-4"], [1, "flex", "items-center", "gap-2", "text-gray-400", "hover:text-white", "transition-colors", 3, "routerLink"], ["routerLink", "/admin/investments", 1, "flex", "items-center", "gap-2", "text-gray-400", "hover:text-white", "transition-colors"], [1, "text-sm", "font-semibold", "text-gray-400", "uppercase", "tracking-wider"], [1, "flex", "items-center", "justify-center", "py-40"], [1, "container", "mx-auto", "px-6", "py-12", "animate-fade-in"], [1, "container", "mx-auto", "px-6", "py-40", "text-center"], ["tabindex", "0", "role", "dialog", 1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/95", "backdrop-blur-sm", "animate-fade-in"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "rtl:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "animate-spin", "rounded-full", "h-12", "w-12", "border-t-2", "border-b-2", "border-blue-500"], [1, "mb-10"], [1, "text-3xl", "font-bold", "text-white", "mb-1"], [1, "text-gray-400", "text-sm"], [1, "mb-12"], [1, "flex", "flex-col", "items-center", "justify-center", "py-32", "text-center", "animate-fade-in"], [1, "text-lg", "font-semibold", "text-white", "mb-4", "flex", "items-center", "gap-2"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-purple-400"], ["fill-rule", "evenodd", "d", "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z", "clip-rule", "evenodd"], [1, "ms-1", "text-sm", "font-normal", "text-gray-500"], [1, "grid", "grid-cols-2", "sm:grid-cols-3", "lg:grid-cols-4", "gap-3"], ["type", "button", 1, "relative", "aspect-video", "rounded-xl", "overflow-hidden", "group", "ring-1", "ring-white/5", "hover:ring-2", "hover:ring-blue-400/50", "focus:outline-none", "focus:ring-2", "focus:ring-blue-400", "transition-all", "shadow-lg", 3, "title"], ["type", "button", 1, "relative", "aspect-video", "rounded-xl", "overflow-hidden", "group", "ring-1", "ring-white/5", "hover:ring-2", "hover:ring-blue-400/50", "focus:outline-none", "focus:ring-2", "focus:ring-blue-400", "transition-all", "shadow-lg", 3, "click", "title"], [1, "w-full", "h-full", "object-cover", "transition-transform", "duration-300", "group-hover:scale-105", 3, "src", "alt"], [1, "absolute", "inset-0", "bg-black/0", "group-hover:bg-black/40", "transition-colors", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-8", "h-8", "text-white", "opacity-0", "group-hover:opacity-100", "transition-opacity", "drop-shadow-lg"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803zM10.5 7.5v6m3-3h-6"], [1, "absolute", "bottom-0", "inset-x-0", "px-2.5", "py-2", "bg-gradient-to-t", "from-black/80", "to-transparent", "text-xs", "text-white", "font-medium", "truncate"], [1, "absolute", "top-2", "start-2", "px-1.5", "py-0.5", "rounded", "text-[10px]", "font-bold", "bg-blue-600/90", "text-white", "shadow"], [1, "absolute", "top-2", "end-2", "px-1.5", "py-0.5", "rounded", "text-[10px]", "font-semibold", "bg-black/50", "text-gray-300"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-blue-400"], ["d", "M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"], [1, "mb-6"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "gap-4"], [1, "relative", "w-full", "max-w-4xl", "rounded-2xl", "overflow-hidden", "bg-black", "shadow-2xl", "shadow-black/50", 2, "padding-top", "56.25%"], ["controls", "", "preload", "metadata", 1, "w-full", "max-w-4xl", "rounded-2xl", "shadow-2xl", "shadow-black/50", "bg-black"], ["frameborder", "0", "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", "allowfullscreen", "", 1, "absolute", "inset-0", "w-full", "h-full", 3, "src", "title"], [3, "src"], [1, "relative", "rounded-xl", "overflow-hidden", "bg-black", "shadow-lg"], ["controls", "", "preload", "metadata", 1, "w-full", "aspect-video"], [1, "absolute", "bottom-0", "inset-x-0", "px-3", "py-2", "bg-gradient-to-t", "from-black/80", "to-transparent", "text-sm", "text-white", "font-medium"], [1, "w-20", "h-20", "rounded-full", "bg-slate-800", "border", "border-slate-700", "flex", "items-center", "justify-center", "mb-4"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-9", "h-9", "text-gray-500"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 0111-.75 0 .375 0 01.75 0z"], [1, "text-lg", "font-semibold", "text-white", "mb-1"], [1, "text-sm", "text-gray-500"], [1, "text-2xl", "font-bold", "text-white", "mb-2"], ["routerLink", "/admin/investments", 1, "text-blue-400", "hover:underline", "text-sm"], ["tabindex", "0", "role", "dialog", 1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/95", "backdrop-blur-sm", "animate-fade-in", 3, "click", "keydown.escape", "keydown.arrowLeft", "keydown.arrowRight"], ["type", "button", 1, "absolute", "top-4", "end-4", "z-10", "p-2", "rounded-full", "bg-white/10", "hover:bg-white/20", "text-white", "transition-colors", "focus:outline-none", 3, "click"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M6 18L18 6M6 6l12 12"], [1, "relative", "max-w-5xl", "max-h-[90vh]", "w-full", "mx-4", 3, "click"], [1, "max-w-full", "max-h-[90vh]", "object-contain", "rounded-lg", "shadow-2xl", 3, "src", "alt"], [1, "absolute", "bottom-0", "inset-x-0", "px-4", "py-3", "bg-gradient-to-t", "from-black/90", "to-transparent", "text-center"], [1, "absolute", "bottom-4", "left-1/2", "-translate-x-1/2", "px-3", "py-1", "rounded-full", "bg-black/50", "text-white", "text-xs", "font-medium"], [1, "text-white", "text-sm", "font-medium"], ["type", "button", 1, "absolute", "left-4", "top-1/2", "-translate-y-1/2", "p-3", "rounded-full", "bg-white/10", "hover:bg-white/20", "text-white", "transition-colors", "focus:outline-none", 3, "click"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "rtl:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M15 19l-7-7 7-7"], ["type", "button", 1, "absolute", "right-4", "top-1/2", "-translate-y-1/2", "p-3", "rounded-full", "bg-white/10", "hover:bg-white/20", "text-white", "transition-colors", "focus:outline-none", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 5l7 7-7 7"]], template: function InvestmentMediaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵconditionalCreate(3, InvestmentMediaComponent_Conditional_3_Template, 4, 4, "a", 3)(4, InvestmentMediaComponent_Conditional_4_Template, 5, 3, "a", 4);
            i0.ɵɵelementStart(5, "span", 5);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(8, InvestmentMediaComponent_Conditional_8_Template, 2, 0, "div", 6);
            i0.ɵɵconditionalCreate(9, InvestmentMediaComponent_Conditional_9_Template, 11, 7, "div", 7);
            i0.ɵɵconditionalCreate(10, InvestmentMediaComponent_Conditional_10_Template, 7, 6, "div", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(11, InvestmentMediaComponent_Conditional_11_Template, 11, 7, "div", 9);
        } if (rf & 2) {
            let tmp_0_0;
            let tmp_3_0;
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_0_0 = ctx.investment()) ? 3 : 4, tmp_0_0);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 6, "investmentPreview.media"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = !ctx.loading() && ctx.investment()) ? 9 : -1, tmp_3_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.investment() ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.lightboxIndex() !== null && ctx.getPhotos(ctx.investment()).length ? 11 : -1);
        } }, dependencies: [CommonModule, RouterLink, TranslatePipe], encapsulation: 2, changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvestmentMediaComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-investment-media', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, TranslatePipe], template: "<div class=\"min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900\">\r\n\r\n  <!-- Sticky nav bar -->\r\n  <div class=\"sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md\">\r\n    <div class=\"container mx-auto px-6 py-4 flex items-center justify-between gap-4\">\r\n      @if (investment(); as inv) {\r\n        <a [routerLink]=\"['/admin/investments', inv.id]\"\r\n           class=\"flex items-center gap-2 text-gray-400 hover:text-white transition-colors\">\r\n          <svg class=\"w-5 h-5 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"/>\r\n          </svg>\r\n          {{ inv.title || 'Opportunity' }}\r\n        </a>\r\n      } @else {\r\n        <a routerLink=\"/admin/investments\"\r\n           class=\"flex items-center gap-2 text-gray-400 hover:text-white transition-colors\">\r\n          <svg class=\"w-5 h-5 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"/>\r\n          </svg>\r\n          {{ 'investmentPreview.backButton' | translate }}\r\n        </a>\r\n      }\r\n      <span class=\"text-sm font-semibold text-gray-400 uppercase tracking-wider\">\r\n        {{ 'investmentPreview.media' | translate }}\r\n      </span>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- Loading state -->\r\n  @if (loading()) {\r\n    <div class=\"flex items-center justify-center py-40\">\r\n      <div class=\"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500\"></div>\r\n    </div>\r\n  }\r\n\r\n  @if (!loading() && investment(); as inv) {\r\n    <div class=\"container mx-auto px-6 py-12 animate-fade-in\">\r\n\r\n      <!-- Page header -->\r\n      <div class=\"mb-10\">\r\n        <h1 class=\"text-3xl font-bold text-white mb-1\">{{ inv.title || 'Opportunity' }}</h1>\r\n        <p class=\"text-gray-400 text-sm\">\r\n          @if (getPhotos(inv).length) {\r\n            {{ getPhotos(inv).length }}&nbsp;{{ 'investmentPreview.images' | translate }}\r\n          }\r\n          @if (getPhotos(inv).length && (inv.videoUrl || getVideos(inv).length > 0)) { &nbsp;\u00B7&nbsp; }\r\n          @if (inv.videoUrl || getVideos(inv).length > 0) {\r\n            {{ (inv.videoUrl ? 1 : 0) + getVideos(inv).length }}&nbsp;{{ 'investmentPreview.video' | translate }}\r\n          }\r\n        </p>\r\n      </div>\r\n\r\n      <!-- \u2500\u2500 Photos Section \u2500\u2500 -->\r\n      @if (getPhotos(inv).length > 0) {\r\n        <section class=\"mb-12\">\r\n          <h2 class=\"text-lg font-semibold text-white mb-4 flex items-center gap-2\">\r\n            <svg class=\"w-5 h-5 text-purple-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n              <path fill-rule=\"evenodd\" d=\"M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z\" clip-rule=\"evenodd\"/>\r\n            </svg>\r\n            Photos\r\n            <span class=\"ms-1 text-sm font-normal text-gray-500\">({{ getPhotos(inv).length }})</span>\r\n          </h2>\r\n\r\n          <!-- Masonry-style grid -->\r\n          <div class=\"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3\">\r\n            @for (img of getPhotos(inv); track img.id; let i = $index) {\r\n              <button type=\"button\"\r\n                      (click)=\"openLightbox(i)\"\r\n                      class=\"relative aspect-video rounded-xl overflow-hidden group ring-1 ring-white/5 hover:ring-2 hover:ring-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-lg\"\r\n                      [title]=\"img.caption || img.fileName || ''\">\r\n                    <img [src]=\"resolveImageUrl(img.fileUrl || img.previewUrl || img.thumbnailUrl)\"\r\n                     [alt]=\"img.caption || img.fileName || ('Photo ' + (i + 1))\"\r\n                     class=\"w-full h-full object-cover transition-transform duration-300 group-hover:scale-105\">\r\n                <!-- Hover overlay -->\r\n                <div class=\"absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center\">\r\n                  <svg class=\"w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg\"\r\n                       fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\">\r\n                    <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803zM10.5 7.5v6m3-3h-6\"/>\r\n                  </svg>\r\n                </div>\r\n                <!-- File name or caption -->\r\n                @if (img.fileName || img.caption) {\r\n                  <div class=\"absolute bottom-0 inset-x-0 px-2.5 py-2 bg-gradient-to-t from-black/80 to-transparent text-xs text-white font-medium truncate\">\r\n                    {{ img.caption || img.fileName }}\r\n                  </div>\r\n                }\r\n                <!-- Primary badge -->\r\n                @if (img.isPrimary) {\r\n                  <div class=\"absolute top-2 start-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/90 text-white shadow\">\r\n                    {{ 'investmentPreview.primaryImage' | translate }}\r\n                  </div>\r\n                }\r\n                <!-- Index badge -->\r\n                <div class=\"absolute top-2 end-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/50 text-gray-300\">\r\n                  {{ i + 1 }}/{{ getPhotos(inv).length }}\r\n                </div>\r\n              </button>\r\n            }\r\n          </div>\r\n        </section>\r\n      }\r\n\r\n      <!-- \u2500\u2500 Videos Section \u2500\u2500 -->\r\n      @if (inv.videoUrl || getVideos(inv).length > 0) {\r\n        <section class=\"mb-12\">\r\n          <h2 class=\"text-lg font-semibold text-white mb-4 flex items-center gap-2\">\r\n            <svg class=\"w-5 h-5 text-blue-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n              <path d=\"M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z\"/>\r\n            </svg>\r\n            Videos\r\n            <span class=\"ms-1 text-sm font-normal text-gray-500\">({{ (inv.videoUrl ? 1 : 0) + getVideos(inv).length }})</span>\r\n          </h2>\r\n\r\n          <!-- Pitch video URL -->\r\n          @if (inv.videoUrl) {\r\n            <div class=\"mb-6\">\r\n              @if (isYoutube || isVimeo) {\r\n                <div class=\"relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50\"\r\n                     style=\"padding-top: 56.25%\">\r\n                  <iframe class=\"absolute inset-0 w-full h-full\"\r\n                          [src]=\"inv.videoUrl\"\r\n                          [title]=\"inv.title || 'Opportunity'\"\r\n                          frameborder=\"0\"\r\n                          allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\"\r\n                          allowfullscreen>\r\n                  </iframe>\r\n                </div>\r\n              } @else {\r\n                <!-- Direct video file -->\r\n                <video class=\"w-full max-w-4xl rounded-2xl shadow-2xl shadow-black/50 bg-black\"\r\n                       controls\r\n                       preload=\"metadata\">\r\n                  <source [src]=\"inv.videoUrl\">\r\n                  Your browser does not support the video tag.\r\n                </video>\r\n              }\r\n            </div>\r\n          }\r\n\r\n          <!-- Additional video files from media gallery -->\r\n          @if (getVideos(inv).length > 0) {\r\n            <div class=\"grid grid-cols-1 sm:grid-cols-2 gap-4\">\r\n              @for (video of getVideos(inv); track video.id; let i = $index) {\r\n                <div class=\"relative rounded-xl overflow-hidden bg-black shadow-lg\">\r\n                  <video class=\"w-full aspect-video\"\r\n                         controls\r\n                         preload=\"metadata\">\r\n                    <source [src]=\"resolveImageUrl(video.fileUrl || video.previewUrl || video.thumbnailUrl)\">\r\n                    Your browser does not support the video tag.\r\n                  </video>\r\n                  @if (video.fileName || video.caption) {\r\n                    <div class=\"absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent text-sm text-white font-medium\">\r\n                      {{ video.caption || video.fileName }}\r\n                    </div>\r\n                  }\r\n                </div>\r\n              }\r\n            </div>\r\n          }\r\n        </section>\r\n      }\r\n\r\n      <!-- Empty state -->\r\n      @if (!inv.videoUrl && getPhotos(inv).length === 0 && getVideos(inv).length === 0) {\r\n        <div class=\"flex flex-col items-center justify-center py-32 text-center animate-fade-in\">\r\n          <div class=\"w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4\">\r\n            <svg class=\"w-9 h-9 text-gray-500\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\">\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 0111-.75 0 .375 0 01.75 0z\"/>\r\n            </svg>\r\n          </div>\r\n          <h3 class=\"text-lg font-semibold text-white mb-1\">{{ 'investmentPreview.noMedia' | translate }}</h3>\r\n          <p class=\"text-sm text-gray-500\">{{ 'investmentPreview.noMediaSubtitle' | translate }}</p>\r\n        </div>\r\n      }\r\n\r\n    </div>\r\n  }\r\n\r\n  <!-- Not found -->\r\n  @if (!loading() && !investment()) {\r\n    <div class=\"container mx-auto px-6 py-40 text-center\">\r\n      <h2 class=\"text-2xl font-bold text-white mb-2\">{{ 'investmentPreview.notFound.title' | translate }}</h2>\r\n      <a routerLink=\"/admin/investments\" class=\"text-blue-400 hover:underline text-sm\">\r\n        {{ 'investmentPreview.backButton' | translate }}\r\n      </a>\r\n    </div>\r\n  }\r\n\r\n</div>\r\n\r\n<!-- \u2500\u2500 Lightbox (Photos only) \u2500\u2500 -->\r\n@if (lightboxIndex() !== null && getPhotos(investment()).length) {\r\n  @let images = getPhotos(investment());\r\n  @let idx    = lightboxIndex()!;\r\n\r\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in\"\r\n       (click)=\"closeLightbox()\"\r\n       (keydown.escape)=\"closeLightbox()\"\r\n       (keydown.arrowLeft)=\"prevImage(images.length)\"\r\n       (keydown.arrowRight)=\"nextImage(images.length)\"\r\n       tabindex=\"0\"\r\n       role=\"dialog\">\r\n\r\n    <!-- Close -->\r\n    <button type=\"button\" (click)=\"closeLightbox()\"\r\n            class=\"absolute top-4 end-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none\">\r\n      <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 18L18 6M6 6l12 12\"/>\r\n      </svg>\r\n    </button>\r\n\r\n    <!-- Image -->\r\n    <div class=\"relative max-w-5xl max-h-[90vh] w-full mx-4\" (click)=\"$event.stopPropagation()\">\r\n      <img [src]=\"resolveImageUrl(images[idx].fileUrl || images[idx].previewUrl || images[idx].thumbnailUrl)\"\r\n           [alt]=\"images[idx].caption || images[idx].fileName || ''\"\r\n           class=\"max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl\">\r\n      \r\n      <!-- Caption -->\r\n      @if (images[idx].caption || images[idx].fileName) {\r\n        <div class=\"absolute bottom-0 inset-x-0 px-4 py-3 bg-gradient-to-t from-black/90 to-transparent text-center\">\r\n          <p class=\"text-white text-sm font-medium\">{{ images[idx].caption || images[idx].fileName }}</p>\r\n        </div>\r\n      }\r\n    </div>\r\n\r\n    <!-- Navigation -->\r\n    @if (images.length > 1) {\r\n      <button type=\"button\" (click)=\"prevImage(images.length)\"\r\n              class=\"absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none\">\r\n        <svg class=\"w-6 h-6 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15 19l-7-7 7-7\"/>\r\n        </svg>\r\n      </button>\r\n      <button type=\"button\" (click)=\"nextImage(images.length)\"\r\n              class=\"absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none\">\r\n        <svg class=\"w-6 h-6 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 5l7 7-7 7\"/>\r\n        </svg>\r\n      </button>\r\n    }\r\n\r\n    <!-- Counter -->\r\n    @if (images.length > 1) {\r\n      <div class=\"absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium\">\r\n        {{ idx + 1 }} / {{ images.length }}\r\n      </div>\r\n    }\r\n  </div>\r\n}\r\n" }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvestmentMediaComponent, { className: "InvestmentMediaComponent", filePath: "src/app/pages/admin/investment-media/investment-media.component.ts", lineNumber: 17 }); })();
