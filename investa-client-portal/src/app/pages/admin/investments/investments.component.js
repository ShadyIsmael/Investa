import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { UserService } from '../../../services/user.service';
import { FileStoreService } from '../../../services/file-store.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => ({ "bg-slate-600/30  text-gray-400   border-slate-600/30": a0, "bg-emerald-500/15 text-emerald-300 border-emerald-500/25": a1, "bg-amber-500/15   text-amber-300   border-amber-500/25": a2, "bg-blue-500/15    text-blue-300    border-blue-500/25": a3, "bg-cyan-500/15    text-cyan-300    border-cyan-500/25": a4, "bg-yellow-500/15  text-yellow-300  border-yellow-500/25": a5, "bg-green-500/15   text-green-300   border-green-500/25": a6, "bg-gray-500/15    text-gray-300    border-gray-500/25": a7, "bg-red-500/15     text-red-300     border-red-500/25": a8 });
const _c1 = () => [];
const _c2 = (a0, a1, a2) => ({ "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-purple-500/30 focus:ring-purple-500 active:scale-[0.98]": a0, "bg-slate-700/50 text-gray-500 border border-slate-600/40 cursor-not-allowed": a1, "bg-slate-700/50 hover:bg-slate-700 text-gray-300 border border-slate-600/40 focus:ring-slate-500": a2 });
const _forTrack0 = ($index, $item) => $item.name;
const _forTrack1 = ($index, $item) => $item.investorId;
function InvestmentsComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 3)(1, "button", 8);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_4_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.refresh()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 9);
    i0.ɵɵelement(3, "path", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "button", 11);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_4_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.exportCsv()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(8, "svg", 9);
    i0.ɵɵelement(9, "path", 12);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 3, "investments.refresh"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(7, 5, "investments.exportCsv"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "investments.exportCsv"), " ");
} }
function InvestmentsComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "div", 13);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 14);
    i0.ɵɵelement(3, "path", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div")(5, "h3", 16);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 17);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 2, "common.error"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function InvestmentsComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5)(1, "div", 18);
    i0.ɵɵelement(2, "div", 19);
    i0.ɵɵelementStart(3, "p", 20);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "common.loading"));
} }
function InvestmentsComponent_Conditional_7_For_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cat_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", cat_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.getCategoryLabel(cat_r4));
} }
function InvestmentsComponent_Conditional_7_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38)(1, "span", 47);
    i0.ɵɵtext(2, " Sorted by newest ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 48);
    i0.ɵɵtext(4);
    i0.ɵɵelementStart(5, "button", 49);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_Conditional_32_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.clearCategoryFilter()); });
    i0.ɵɵtext(6, "x");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" Category: ", ctx_r1.getCategoryLabel(ctx_r1.activeCategory()), " ");
} }
function InvestmentsComponent_Conditional_7_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 38)(1, "span", 47);
    i0.ɵɵtext(2, " Showing newest opportunities ");
    i0.ɵɵelementEnd()();
} }
function InvestmentsComponent_Conditional_7_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 39)(1, "div", 50)(2, "div", 51)(3, "h4", 52);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 53)(7, "label", 54);
    i0.ɵɵelement(8, "input", 55);
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "label", 54);
    i0.ɵɵelement(13, "input", 56);
    i0.ɵɵelementStart(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "label", 54);
    i0.ɵɵelement(18, "input", 57);
    i0.ɵɵelementStart(19, "span");
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(22, "div", 58)(23, "h4", 52);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "div", 53)(27, "label", 54);
    i0.ɵɵelement(28, "input", 59);
    i0.ɵɵelementStart(29, "span");
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(32, "label", 54);
    i0.ɵɵelement(33, "input", 60);
    i0.ɵɵelementStart(34, "span");
    i0.ɵɵtext(35);
    i0.ɵɵpipe(36, "translate");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(37, "div")(38, "h4", 52);
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "div", 3);
    i0.ɵɵelement(42, "input", 61);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementStart(44, "span", 62);
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(47, "input", 63);
    i0.ɵɵpipe(48, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "div", 64)(50, "div")(51, "h4", 52);
    i0.ɵɵtext(52);
    i0.ɵɵpipe(53, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(54, "label", 65)(55, "div", 25);
    i0.ɵɵelement(56, "input", 66)(57, "div", 67);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "div", 68);
    i0.ɵɵtext(59);
    i0.ɵɵpipe(60, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(61, "button", 69);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_Conditional_34_Template_button_click_61_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.resetAdvancedFilters()); });
    i0.ɵɵtext(62);
    i0.ɵɵpipe(63, "translate");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 14, "investments.riskLevel"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 16, "investments.risk.low"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 18, "investments.risk.medium"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 20, "investments.risk.high"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 22, "investments.typeFilter"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 24, "investments.type.founding"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 26, "investments.type.equity"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(40, 28, "investments.fundingProgress"), " (%)");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(43, 30, "investments.min"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 32, "investments.to"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(48, 34, "investments.max"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 36, "investments.showOnly"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(60, 38, "investments.favorites"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(63, 40, "investments.reset"), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 126);
    i0.ɵɵlistener("error", function InvestmentsComponent_Conditional_7_For_37_Conditional_9_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r9); const investment_r8 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFounderAvatarError(investment_r8.founderId)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r1.getFounderAvatarUrl(investment_r8), i0.ɵɵsanitizeUrl)("alt", investment_r8.founderDisplay || "Founder");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    let tmp_13_0;
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", (investment_r8.founderDisplay == null ? null : (tmp_13_0 = investment_r8.founderDisplay.charAt(0)) == null ? null : tmp_13_0.toUpperCase()) || "?", " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 80);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 93);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ngClass", ctx_r1.getInvestmentTypeBadgeClass(investment_r8.investmentType));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, ctx_r1.getInvestmentTypeI18nKey(investment_r8.investmentType)), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 95);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.languageService.language() === "ar" ? investment_r8.businessCategoryNameAr || investment_r8.businessCategoryName : investment_r8.businessCategoryName, " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 103)(1, "p", 127);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 128);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 129);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "investments.roi"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r8.expectedROI, "%");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "investmentPreview.annual"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 104)(1, "p", 130);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 131);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 132);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "number");
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "investmentPreview.sharePrice"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind4(6, 6, investment_r8.sharePrice, investment_r8.currency || "USD", "symbol", "1.0-0"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind2(9, 11, investment_r8.availableShares, "1.0-0"), " ", i0.ɵɵpipeBind1(10, 14, "investmentPreview.available"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 105)(1, "p", 133);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 134);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 135);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "investments.min"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind4(6, 5, investment_r8.minInvestment, investment_r8.currency || "USD", "symbol", "1.0-0"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 10, "investments.toInvest"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 99)(1, "p", 100);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 136);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 102);
    i0.ɵɵtext(7, "credibility");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.score"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.credibilityScore ?? 0);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_61_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 137);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 138);
    i0.ɵɵelement(2, "path", 139);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassMap(ctx_r1.getDaysRemaining(investment_r8.endDate) <= 7 ? "text-red-400" : ctx_r1.getDaysRemaining(investment_r8.endDate) <= 30 ? "text-amber-400" : "text-gray-500");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.getDaysRemaining(investment_r8.endDate), "d ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_73_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 116);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "number");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "investments.target"), " ", i0.ɵɵpipeBind2(3, 4, investment_r8.targetFund, "1.0-0"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 142)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "strong", 145);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 3, "investments.myParticipation.remainingToFund"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind2(6, 5, investment_r8.remainingFundingAmount, "1.0-0"), " ", investment_r8.currency || "USD");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 143)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "strong", 145);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.approvedParticipants"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.approvedParticipantCount);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.loan.interestRate"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r8.interestRate, "%");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.loan.duration"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r8.expectedDurationMonths, "m");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.loan.totalRepayment"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, investment_r8.expectedTotalRepayment, "1.0-0"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 144);
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Conditional_1_Template, 6, 4, "div", 146);
    i0.ɵɵconditionalCreate(2, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Conditional_2_Template, 6, 4, "div", 146);
    i0.ɵɵconditionalCreate(3, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Conditional_3_Template, 7, 7, "div", 146);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.interestRate != null ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.expectedDurationMonths != null ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.expectedTotalRepayment != null ? 3 : -1);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.equity.shares"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, investment_r8.approvedShares));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.equity.ownership"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r8.ownershipPercentage, "%");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.equity.remaining"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, investment_r8.remainingShares));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 144);
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Conditional_1_Template, 7, 6, "div", 146);
    i0.ɵɵconditionalCreate(2, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Conditional_2_Template, 6, 4, "div", 146);
    i0.ɵɵconditionalCreate(3, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Conditional_3_Template, 7, 6, "div", 146);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.approvedShares != null ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.ownershipPercentage != null ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.remainingShares != null ? 3 : -1);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.profitSharing.share"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r8.profitSharePercentage, "%");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.profitSharing.payoutFrequency"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.payoutFrequency);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "p", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 148);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.myParticipation.profitSharing.totalPayout"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, investment_r8.expectedTotalPayout, "1.0-0"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 144);
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Conditional_1_Template, 6, 4, "div", 146);
    i0.ɵɵconditionalCreate(2, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Conditional_2_Template, 6, 4, "div", 146);
    i0.ɵɵconditionalCreate(3, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Conditional_3_Template, 7, 7, "div", 146);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.profitSharePercentage != null ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.payoutFrequency ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.expectedTotalPayout != null ? 3 : -1);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_74_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "p", 130);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 141);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_7_Template, 7, 8, "div", 142);
    i0.ɵɵconditionalCreate(8, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_8_Template, 6, 4, "div", 143);
    i0.ɵɵconditionalCreate(9, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_9_Template, 4, 3, "div", 144);
    i0.ɵɵconditionalCreate(10, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_10_Template, 4, 3, "div", 144);
    i0.ɵɵconditionalCreate(11, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Conditional_11_Template, 4, 3, "div", 144);
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 8, "investments.myParticipation.approvedContribution"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind2(6, 10, investment_r8.approvedContributionAmount, "1.0-0"), " ", investment_r8.currency || "USD");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r8.remainingFundingAmount != null ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.approvedParticipantCount != null ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.investmentType === ctx_r1.InvestmentType.Loan ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.investmentType === ctx_r1.InvestmentType.Equity ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.investmentType === ctx_r1.InvestmentType.RevenueSharing ? 11 : -1);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_75_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "span", 62);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "strong", 149);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "span", 62);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementStart(10, "strong", 149);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "span", 62);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementStart(16, "strong", 149);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "span", 62);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementStart(22, "strong", 149);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "number");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 8, "investmentPreview.sharesOffered"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.offeredShares == null ? "\u2014" : i0.ɵɵpipeBind1(6, 10, investment_r8.offeredShares));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(9, 12, "investmentPreview.sharesSold"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.soldShares == null ? "\u2014" : i0.ɵɵpipeBind1(12, 14, investment_r8.soldShares));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(15, 16, "investmentPreview.sharesRemaining"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.remainingShares == null ? "\u2014" : i0.ɵɵpipeBind1(18, 18, investment_r8.remainingShares));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(21, 20, "investmentPreview.equityAllocated"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.allocatedEquityPercentage == null ? "\u2014" : i0.ɵɵpipeBind2(24, 22, investment_r8.allocatedEquityPercentage, "1.0-2") + "%");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 156);
} if (rf & 2) {
    const p_r11 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("src", p_r11.investorAvatar, i0.ɵɵsanitizeUrl)("alt", p_r11.investorName || "Investor")("title", p_r11.investorName);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 157);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r11 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("title", p_r11.investorName);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", (p_r11.investorName || "?").charAt(0).toUpperCase(), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 155);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r10); const p_r11 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(4); ctx_r1.openInvestorProfile(p_r11.investorId); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Conditional_1_Template, 1, 3, "img", 156)(2, InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Conditional_2_Template, 2, 2, "div", 157);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(p_r11.investorAvatar ? 1 : 2);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 154);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵtext(2, "?");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(1, 1, "investments.anonymousInvestor"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_0_Template, 3, 1, "button", 153)(1, InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Conditional_1_Template, 3, 3, "div", 154);
} if (rf & 2) {
    const p_r11 = ctx.$implicit;
    i0.ɵɵconditional(p_r11 && !p_r11.isAnonymous ? 0 : 1);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 151);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("+", investment_r8.investorCount - 4);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_77_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3)(1, "div", 150);
    i0.ɵɵrepeaterCreate(2, InvestmentsComponent_Conditional_7_For_37_Conditional_77_For_3_Template, 2, 1, null, null, _forTrack1);
    i0.ɵɵconditionalCreate(4, InvestmentsComponent_Conditional_7_For_37_Conditional_77_Conditional_4_Template, 2, 1, "div", 151);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 152);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater((investment_r8.investors || i0.ɵɵpureFunction0(3, _c1)).slice(0, 4));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r8.investorCount > 4 ? 4 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", investment_r8.investorCount, " ", ctx_r1.t(investment_r8.investorCount === 1 ? "investments.investor" : "investments.investors", investment_r8.investorCount === 1 ? "investor" : "investors"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 119);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "investments.beFirstInvestor"));
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_84_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 159);
    i0.ɵɵelement(1, "path", 160);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investmentPreview.fullyFunded"), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_84_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 159);
    i0.ɵɵelement(1, "path", 161);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investmentPreview.learnMore"), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_84_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 162);
    i0.ɵɵelement(3, "path", 163);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "investmentPreview.learnMore"), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_84_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 124)(1, "button", 158);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Conditional_84_Template_button_click_1_listener($event) { i0.ɵɵrestoreView(_r12); const investment_r8 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.navigateToDetails(investment_r8); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵconditionalCreate(2, InvestmentsComponent_Conditional_7_For_37_Conditional_84_Conditional_2_Template, 4, 3)(3, InvestmentsComponent_Conditional_7_For_37_Conditional_84_Conditional_3_Template, 4, 3)(4, InvestmentsComponent_Conditional_7_For_37_Conditional_84_Conditional_4_Template, 4, 3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", investment_r8.status === "Fully Funded" || investment_r8.status === "Completed" || investment_r8.status === "Archived" || investment_r8.status === "Paused")("ngClass", i0.ɵɵpureFunction3(3, _c2, investment_r8.status === "Active" || investment_r8.status === "Reviewing Participants" || investment_r8.status === "In Progress", investment_r8.status === "Fully Funded" || investment_r8.status === "Completed" || investment_r8.status === "Archived" || investment_r8.status === "Paused", investment_r8.status === "Draft"));
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.status === "Fully Funded" || investment_r8.status === "Completed" || investment_r8.status === "Archived" ? 2 : investment_r8.status === "Paused" ? 3 : 4);
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_85_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 166);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Conditional_85_Conditional_1_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r13); const investment_r8 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openProjectRoom(investment_r8); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 31);
    i0.ɵɵelement(2, "path", 167);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "investments.projectRoom"), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_85_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 168);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Conditional_85_Conditional_2_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r14); const investment_r8 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openContract(investment_r8); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 31);
    i0.ɵɵelement(2, "path", 169);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "investments.contract"), " ");
} }
function InvestmentsComponent_Conditional_7_For_37_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 125);
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_7_For_37_Conditional_85_Conditional_1_Template, 5, 3, "button", 164);
    i0.ɵɵconditionalCreate(2, InvestmentsComponent_Conditional_7_For_37_Conditional_85_Conditional_2_Template, 5, 3, "button", 165);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.canOpenProjectRoom ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.contractAvailable ? 2 : -1);
} }
function InvestmentsComponent_Conditional_7_For_37_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 70);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Template_article_click_0_listener() { const investment_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.navigateToDetails(investment_r8)); });
    i0.ɵɵelement(1, "div", 71);
    i0.ɵɵelementStart(2, "div", 72);
    i0.ɵɵelement(3, "img", 73)(4, "div", 74);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 75)(6, "button", 76);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Template_button_click_6_listener($event) { const investment_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openFounderProfile(investment_r8.founderId, $event)); });
    i0.ɵɵelementStart(7, "div", 77)(8, "div", 78);
    i0.ɵɵconditionalCreate(9, InvestmentsComponent_Conditional_7_For_37_Conditional_9_Template, 1, 2, "img", 79)(10, InvestmentsComponent_Conditional_7_For_37_Conditional_10_Template, 1, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, InvestmentsComponent_Conditional_7_For_37_Conditional_11_Template, 1, 0, "span", 80);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 81)(13, "p", 82);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p", 83);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(17, "div", 84)(18, "button", 85);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Template_button_click_18_listener($event) { const investment_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.toggleFavorite(investment_r8); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(20, "svg", 86);
    i0.ɵɵelement(21, "path", 87);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(22, "button", 88);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_For_37_Template_button_click_22_listener($event) { i0.ɵɵrestoreView(_r7); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(24, "svg", 31);
    i0.ɵɵelement(25, "path", 89);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(26, "div", 90)(27, "h3", 91);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 92);
    i0.ɵɵconditionalCreate(30, InvestmentsComponent_Conditional_7_For_37_Conditional_30_Template, 3, 4, "span", 93);
    i0.ɵɵelementStart(31, "span", 94);
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "lowercase");
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(35, InvestmentsComponent_Conditional_7_For_37_Conditional_35_Template, 2, 1, "span", 95);
    i0.ɵɵelementStart(36, "span", 96);
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(39, "p", 97);
    i0.ɵɵtext(40);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(41, "div", 98)(42, "div", 99)(43, "p", 100);
    i0.ɵɵtext(44);
    i0.ɵɵpipe(45, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "p", 101);
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "p", 102);
    i0.ɵɵtext(50);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(51, InvestmentsComponent_Conditional_7_For_37_Conditional_51_Template, 9, 7, "div", 103)(52, InvestmentsComponent_Conditional_7_For_37_Conditional_52_Template, 11, 16, "div", 104)(53, InvestmentsComponent_Conditional_7_For_37_Conditional_53_Template, 10, 12, "div", 105)(54, InvestmentsComponent_Conditional_7_For_37_Conditional_54_Template, 8, 4, "div", 99);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "div", 106)(56, "div", 107)(57, "span", 108);
    i0.ɵɵtext(58);
    i0.ɵɵpipe(59, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(60, "div", 3);
    i0.ɵɵconditionalCreate(61, InvestmentsComponent_Conditional_7_For_37_Conditional_61_Template, 4, 3, "span", 109);
    i0.ɵɵelementStart(62, "span", 110);
    i0.ɵɵtext(63);
    i0.ɵɵpipe(64, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(65, "div", 111);
    i0.ɵɵelement(66, "div", 112);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(67, "div", 113)(68, "span", 114);
    i0.ɵɵtext(69);
    i0.ɵɵpipe(70, "number");
    i0.ɵɵelementStart(71, "span", 115);
    i0.ɵɵtext(72);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(73, InvestmentsComponent_Conditional_7_For_37_Conditional_73_Template, 4, 7, "span", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(74, InvestmentsComponent_Conditional_7_For_37_Conditional_74_Template, 12, 13)(75, InvestmentsComponent_Conditional_7_For_37_Conditional_75_Template, 25, 25, "div", 117);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(76, "div", 118);
    i0.ɵɵconditionalCreate(77, InvestmentsComponent_Conditional_7_For_37_Conditional_77_Template, 7, 4, "div", 3)(78, InvestmentsComponent_Conditional_7_For_37_Conditional_78_Template, 3, 3, "span", 119);
    i0.ɵɵelementStart(79, "div", 120);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(80, "svg", 121);
    i0.ɵɵelement(81, "path", 122);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(82, "span", 123);
    i0.ɵɵtext(83);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(84, InvestmentsComponent_Conditional_7_For_37_Conditional_84_Template, 5, 7, "div", 124);
    i0.ɵɵconditionalCreate(85, InvestmentsComponent_Conditional_7_For_37_Conditional_85_Template, 3, 2, "div", 125);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    const progress_r15 = investment_r8.fundingPercentage;
    i0.ɵɵadvance();
    i0.ɵɵclassMap(investment_r8.status === "Active" ? "bg-gradient-to-r from-emerald-500 to-green-400" : investment_r8.status === "Funded" || investment_r8.status === "Fully Funded" ? "bg-gradient-to-r from-blue-500 to-cyan-400" : investment_r8.status === "Reviewing Participants" ? "bg-gradient-to-r from-amber-400 to-orange-400" : investment_r8.status === "In Progress" ? "bg-gradient-to-r from-blue-500 to-purple-500" : investment_r8.status === "Completed" ? "bg-gradient-to-r from-green-500 to-teal-400" : investment_r8.status === "Paused" ? "bg-gradient-to-r from-yellow-400 to-amber-500" : investment_r8.status === "Archived" ? "bg-gradient-to-r from-gray-500 to-slate-400" : investment_r8.status === "Closed" ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-slate-700");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r1.getCoverImageUrl(investment_r8), i0.ɵɵsanitizeUrl)("alt", investment_r8.name);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !investment_r8.founderId);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.getFounderAvatarUrl(investment_r8) ? 9 : 10);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r8.status === "Active" ? 11 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.founderDisplay || "Unknown");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(investment_r8.businessRole || investment_r8.businessCategoryName || "\u00A0");
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(investment_r8.favorited ? "text-red-400" : "text-gray-500 hover:text-red-400");
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 43, "investments.addToFavorites"));
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("fill", investment_r8.favorited ? "currentColor" : "none");
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(23, 45, "investments.share"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", investment_r8.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r8.investmentType ? 30 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(investment_r8.riskLevel === ctx_r1.RiskLevel.Low ? "bg-emerald-500/15 text-emerald-300" : investment_r8.riskLevel === ctx_r1.RiskLevel.Medium ? "bg-amber-500/15  text-amber-300" : "bg-red-500/15    text-red-300");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(34, 49, "investments.risk." + i0.ɵɵpipeBind1(33, 47, investment_r8.riskLevel)), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(investment_r8.businessCategoryName ? 35 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngClass", i0.ɵɵpureFunctionV(66, _c0, [investment_r8.status === "Draft", investment_r8.status === "Active", investment_r8.status === "Reviewing Participants", investment_r8.status === "In Progress", investment_r8.status === "Fully Funded", investment_r8.status === "Paused", investment_r8.status === "Completed", investment_r8.status === "Archived", investment_r8.status === "Closed"]));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(38, 51, "investments.status." + ctx_r1.getStatusKey(investment_r8.status)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", investment_r8.description);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", investment_r8.description, " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(45, 53, "investments.target"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(48, 55, investment_r8.targetFund, "1.0-0"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.currency || "USD");
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.investmentType === ctx_r1.InvestmentType.Equity && investment_r8.expectedROI && investment_r8.expectedROI > 0 ? 51 : investment_r8.sharePrice && investment_r8.sharePrice > 0 ? 52 : investment_r8.minInvestment && investment_r8.minInvestment > 0 ? 53 : 54);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(59, 58, "investments.funding"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(investment_r8.endDate ? 61 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(progress_r15 === null ? "\u2014" : i0.ɵɵpipeBind2(64, 60, progress_r15, "1.0-0") + "%");
    i0.ɵɵadvance(3);
    i0.ɵɵclassMap(progress_r15 >= 100 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : progress_r15 >= 75 ? "bg-gradient-to-r from-emerald-500 to-green-400" : progress_r15 >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-slate-400 to-slate-500");
    i0.ɵɵstyleProp("width", (progress_r15 === null ? 0 : progress_r15 > 100 ? 100 : progress_r15) + "%");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r8.currentFunding === null ? "\u2014" : i0.ɵɵpipeBind2(70, 63, investment_r8.currentFunding, "1.0-0"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r8.currency || "");
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.targetFund ? 73 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.approvedContributionAmount != null ? 74 : investment_r8.investmentModel === "Equity" || investment_r8.investmentModel === 1 ? 75 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(investment_r8.investorCount && investment_r8.investorCount > 0 ? 77 : 78);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(investment_r8.credibilityScore ?? 0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.approvedContributionAmount == null ? 84 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r8.approvedContributionAmount != null ? 85 : -1);
} }
function InvestmentsComponent_Conditional_7_ForEmpty_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 170);
    i0.ɵɵelement(2, "path", 171);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "h3", 172);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 173);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.emptyTitle());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.emptySubtitle());
} }
function InvestmentsComponent_Conditional_7_button_41_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 174);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_button_41_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r16); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.loadMore()); });
    i0.ɵɵtext(1, " Load more ");
    i0.ɵɵelementEnd();
} }
function InvestmentsComponent_Conditional_7_div_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62);
    i0.ɵɵtext(1, "All results loaded");
    i0.ɵɵelementEnd();
} }
function InvestmentsComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "form", 21)(2, "div", 22)(3, "div", 23)(4, "div")(5, "label", 24);
    i0.ɵɵtext(6, "Search");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 25);
    i0.ɵɵelement(8, "input", 26);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementStart(10, "div", 27);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(11, "svg", 28);
    i0.ɵɵelement(12, "path", 29);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(13, "div")(14, "label", 24);
    i0.ɵɵtext(15, "Sort");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 30);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(17, "svg", 31);
    i0.ɵɵelement(18, "path", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(19, " Newest ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(20, "div")(21, "label", 24);
    i0.ɵɵtext(22, "Category");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "select", 33);
    i0.ɵɵlistener("change", function InvestmentsComponent_Conditional_7_Template_select_change_23_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectCategory($event.target.value)); });
    i0.ɵɵrepeaterCreate(24, InvestmentsComponent_Conditional_7_For_25_Template, 2, 2, "option", 34, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(26, "button", 35);
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_7_Template_button_click_26_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleAdvancedSearch()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(28, "svg", 9);
    i0.ɵɵelement(29, "path", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(30, "span", 37);
    i0.ɵɵtext(31, "Filters");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(32, InvestmentsComponent_Conditional_7_Conditional_32_Template, 7, 1, "div", 38)(33, InvestmentsComponent_Conditional_7_Conditional_33_Template, 3, 0, "div", 38);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(34, InvestmentsComponent_Conditional_7_Conditional_34_Template, 64, 42, "div", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 40);
    i0.ɵɵrepeaterCreate(36, InvestmentsComponent_Conditional_7_For_37_Template, 86, 76, "article", 41, _forTrack0, false, InvestmentsComponent_Conditional_7_ForEmpty_38_Template, 7, 2, "div", 42);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "div", 43)(40, "div", 44);
    i0.ɵɵtemplate(41, InvestmentsComponent_Conditional_7_button_41_Template, 2, 0, "button", 45)(42, InvestmentsComponent_Conditional_7_div_42_Template, 2, 0, "div", 46);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("formGroup", ctx_r1.filterForm);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(9, 9, "investments.filterPlaceholder"));
    i0.ɵɵadvance(15);
    i0.ɵɵproperty("value", ctx_r1.activeCategory());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.categories());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(27, 11, "investments.advancedSearch"));
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r1.activeCategory() !== "All" ? 32 : 33);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isAdvancedSearchOpen() ? 34 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.displayedInvestments());
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r1.displayedInvestments().length < ctx_r1.filteredInvestments().length);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.displayedInvestments().length >= ctx_r1.filteredInvestments().length);
} }
function InvestmentsComponent_Conditional_8_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 184);
    i0.ɵɵelement(1, "circle", 185)(2, "path", 186);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "common.processing"), " ");
} }
function InvestmentsComponent_Conditional_8_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "investments.engageModal.proceedButton"), " ");
} }
function InvestmentsComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "div", 175)(2, "div", 176);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(3, "svg", 177);
    i0.ɵɵelement(4, "path", 178);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "h3", 179);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(8, "p", 180);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementStart(10, "div", 181)(11, "button", 182);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_8_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r17); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cancelEngage()); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 183);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_8_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r17); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.confirmEngage()); });
    i0.ɵɵconditionalCreate(15, InvestmentsComponent_Conditional_8_Conditional_15_Template, 5, 3)(16, InvestmentsComponent_Conditional_8_Conditional_16_Template, 2, 3);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "investments.engageModal.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("innerHTML", i0.ɵɵpipeBind1(9, 7, "investments.engageModal.message").replace("{investmentName}", "<span class='font-bold text-white'>" + ctx.name + "</span>").replace("{creditCost}", "<span class='font-bold text-white'>" + ctx_r1.engagementCreditCost + "</span>"), i0.ɵɵsanitizeHtml);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 9, "investments.engageModal.cancelButton"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.engagementProcessing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.engagementProcessing() ? 15 : 16);
} }
function InvestmentsComponent_Conditional_9_Conditional_27_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "currency");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r19 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Min: ", i0.ɵɵpipeBind4(2, 1, investment_r19.minInvestment, investment_r19.currency || "USD", "symbol", "1.0-0"));
} }
function InvestmentsComponent_Conditional_9_Conditional_27_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "currency");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r19 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Max: ", i0.ɵɵpipeBind4(2, 1, investment_r19.maxInvestment, investment_r19.currency || "USD", "symbol", "1.0-0"));
} }
function InvestmentsComponent_Conditional_9_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 202);
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_9_Conditional_27_Conditional_1_Template, 3, 6, "span");
    i0.ɵɵconditionalCreate(2, InvestmentsComponent_Conditional_9_Conditional_27_Conditional_2_Template, 3, 6, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r19 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r19.minInvestment ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r19.maxInvestment ? 2 : -1);
} }
function InvestmentsComponent_Conditional_9_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 212)(1, "span", 62);
    i0.ɵɵtext(2, "Expected ROI:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 217);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r19 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", investment_r19.expectedROI, "%");
} }
function InvestmentsComponent_Conditional_9_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 213);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 218);
    i0.ɵɵelement(2, "path", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 219);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.investmentError());
} }
function InvestmentsComponent_Conditional_9_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 220);
    i0.ɵɵelement(1, "circle", 185)(2, "path", 186);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, " Processing... ");
} }
function InvestmentsComponent_Conditional_9_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 221);
    i0.ɵɵelement(1, "path", 222);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2, " Confirm Participation ");
} }
function InvestmentsComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 187);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeInvestDialog()); });
    i0.ɵɵelementStart(1, "div", 188);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_div_click_1_listener($event) { i0.ɵɵrestoreView(_r18); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "div", 189)(3, "div", 190)(4, "div")(5, "h3", 191);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 192);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 193);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeInvestDialog()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(10, "svg", 194);
    i0.ɵɵelement(11, "path", 195);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(12, "div", 196)(13, "div", 197)(14, "div", 198)(15, "div")(16, "p", 199);
    i0.ɵɵtext(17, "Share Price");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p", 191);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "currency");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 200)(22, "p", 199);
    i0.ɵɵtext(23, "Available");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "p", 201);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(27, InvestmentsComponent_Conditional_9_Conditional_27_Template, 3, 2, "div", 202);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "div")(29, "label", 203);
    i0.ɵɵtext(30, "Number of Shares");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 13)(32, "button", 204);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_button_click_32_listener() { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.decreaseShares()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(33, "svg", 205);
    i0.ɵɵelement(34, "path", 206);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(35, "input", 207);
    i0.ɵɵtwoWayListener("ngModelChange", function InvestmentsComponent_Conditional_9_Template_input_ngModelChange_35_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.sharesToPurchaseValue, $event) || (ctx_r1.sharesToPurchaseValue = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("change", function InvestmentsComponent_Conditional_9_Template_input_change_35_listener() { const investment_r19 = i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.validateShares(investment_r19)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 204);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_button_click_36_listener() { const investment_r19 = i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.increaseShares(investment_r19)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(37, "svg", 205);
    i0.ɵɵelement(38, "path", 208);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(39, "p", 209);
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(42, "div", 210)(43, "div", 211)(44, "span", 17);
    i0.ɵɵtext(45, "Total Participation:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "span", 191);
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "currency");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(49, InvestmentsComponent_Conditional_9_Conditional_49_Template, 5, 1, "div", 212);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(50, InvestmentsComponent_Conditional_9_Conditional_50_Template, 5, 1, "div", 213);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "div", 214)(52, "button", 215);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_button_click_52_listener() { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeInvestDialog()); });
    i0.ɵɵtext(53, " Cancel ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(54, "button", 216);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_9_Template_button_click_54_listener() { const investment_r19 = i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.showConfirmationDialog(investment_r19)); });
    i0.ɵɵconditionalCreate(55, InvestmentsComponent_Conditional_9_Conditional_55_Template, 4, 0)(56, InvestmentsComponent_Conditional_9_Conditional_56_Template, 3, 0);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const investment_r19 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("Participate in ", investment_r19.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(investment_r19.founderDisplay);
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(20, 15, investment_r19.sharePrice, investment_r19.currency || "USD"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 18, investment_r19.availableShares));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r19.minInvestment || investment_r19.maxInvestment ? 27 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", ctx_r1.sharesToPurchase() <= 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.sharesToPurchaseValue);
    i0.ɵɵproperty("max", investment_r19.availableShares);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.sharesToPurchase() >= (investment_r19.availableShares || 0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Available: ", i0.ɵɵpipeBind1(41, 20, investment_r19.availableShares), " shares");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(48, 22, ctx_r1.calculateRequestedAmount(investment_r19), investment_r19.currency || "USD"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r19.expectedROI && investment_r19.expectedROI > 0 ? 49 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.investmentError() ? 50 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", !!ctx_r1.investmentError() || ctx_r1.investmentProcessing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.investmentProcessing() ? 55 : 56);
} }
function InvestmentsComponent_Conditional_10_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 227)(1, "div", 190)(2, "span", 17);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 228);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 190)(8, "span", 17);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 229);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 230)(14, "span", 231);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span", 191);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "currency");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(20, "div", 232);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(21, "svg", 233);
    i0.ɵɵelement(22, "path", 234);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(23, "div")(24, "p", 235);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 236);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const investment_r21 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 8, "investments.confirmDialog.investmentLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r21.name);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 10, "investments.confirmDialog.sharesLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.sharesToPurchase());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 12, "investments.confirmDialog.totalCostLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(19, 14, ctx_r1.calculateRequestedAmount(investment_r21), investment_r21.currency || "USD"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 17, "investments.confirmDialog.warning"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 19, "investments.confirmDialog.warningMessage"));
} }
function InvestmentsComponent_Conditional_10_Conditional_15_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 220);
    i0.ɵɵelement(1, "circle", 185)(2, "path", 186);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "common.processing"), " ");
} }
function InvestmentsComponent_Conditional_10_Conditional_15_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 221);
    i0.ɵɵelement(1, "path", 222);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investments.confirmDialog.confirmButton"), " ");
} }
function InvestmentsComponent_Conditional_10_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 237);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_10_Conditional_15_Template_button_click_0_listener() { const investment_r23 = i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.proceedWithInvestment(investment_r23)); });
    i0.ɵɵconditionalCreate(1, InvestmentsComponent_Conditional_10_Conditional_15_Conditional_1_Template, 5, 3)(2, InvestmentsComponent_Conditional_10_Conditional_15_Conditional_2_Template, 4, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.investmentProcessing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.investmentProcessing() ? 1 : 2);
} }
function InvestmentsComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 187);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_10_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cancelConfirmation()); });
    i0.ɵɵelementStart(1, "div", 188);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_10_Template_div_click_1_listener($event) { i0.ɵɵrestoreView(_r20); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "div", 223)(3, "h3", 191);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 192);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 196);
    i0.ɵɵconditionalCreate(10, InvestmentsComponent_Conditional_10_Conditional_10_Template, 30, 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 224)(12, "button", 225);
    i0.ɵɵlistener("click", function InvestmentsComponent_Conditional_10_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cancelConfirmation()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, InvestmentsComponent_Conditional_10_Conditional_15_Template, 3, 2, "button", 226);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_4_0;
    let tmp_6_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "investments.confirmDialog.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "investments.confirmDialog.subtitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_4_0 = ctx_r1.investmentToInvest()) ? 10 : -1, tmp_4_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 9, "common.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_6_0 = ctx_r1.investmentToInvest()) ? 15 : -1, tmp_6_0);
} }
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["Low"] = "Low";
    RiskLevel["Medium"] = "Medium";
    RiskLevel["High"] = "High";
})(RiskLevel || (RiskLevel = {}));
var InvestmentType;
(function (InvestmentType) {
    InvestmentType[InvestmentType["Founding"] = 1] = "Founding";
    InvestmentType[InvestmentType["Equity"] = 2] = "Equity";
    InvestmentType[InvestmentType["RevenueSharing"] = 3] = "RevenueSharing";
    InvestmentType[InvestmentType["Loan"] = 4] = "Loan";
})(InvestmentType || (InvestmentType = {}));
function getInvestmentTypeDisplayFallback(type) {
    if (type === InvestmentType.Founding)
        return 'Founding';
    if (type === InvestmentType.Equity)
        return 'Equity';
    if (type === InvestmentType.RevenueSharing)
        return 'Revenue Sharing';
    if (type === InvestmentType.Loan)
        return 'Loan';
    return 'Opportunity';
}
function getInvestmentTypeDisplay(type) {
    return getInvestmentTypeDisplayFallback(type);
}
function getInvestmentTypeBadgeClass(type) {
    if (type === InvestmentType.Founding)
        return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25';
    if (type === InvestmentType.Equity)
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/25';
    if (type === InvestmentType.RevenueSharing)
        return 'bg-purple-500/15 text-purple-300 border border-purple-500/25';
    if (type === InvestmentType.Loan)
        return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25';
    return 'bg-slate-700/70 text-slate-300 border border-slate-600/40';
}
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0tpZHM9ImV4dGxhbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0wMCAwMmgNDBwLTAgMEwwIDQwIiBmaWxsPSIjMzUwOSIgLz4KICA8cGF0aCBkPSJNMCA0MHY0MCIgZmlsbD0iIzM1MTEiIC8+CiAgPHBhdGggZD0iTTEwMCAxMEw1MCAxMCIgZmlsbD0iIzY2NyIgc3Ryb2tlLXdpZHRoPSIzLjUiIC8+CiAgPHBhdGggZD0iTTEwMCAxNUw1MCAxNSIgcmlnaHQ9NTAiIGZpbGw9IiNmZmYiIHN0cm9rZS13aWR0aD0iMy41IiAvPgogIDxwYXRoIGQ9Ik0xMDAgMjBMNTAgMjAiIHJpZ2h0PSI1MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzLjUiIC8+CiAgPC9nPgogIDx0ZXh0IGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NyIgdGV4dC0tLW0tbW0gbWF0Y2hlcmUgdGV4dCIgZmlsbD0iIzY2NyIvPgo8L3N2Zz4=';
const ITEMS_PER_PAGE = 8;
const ENGAGEMENT_CREDIT_COST = 5;
/**
 * Investments Component
 *
 * Features:
 * - Dynamic category loading from API
 * - Real-time filtering and search
 * - Pagination
 * - Advanced filters (risk, funding progress, favorites)
 * - Loading and error states
 */
export class InvestmentsComponent {
    /**
     * Navigate to investor/partner profile if available. Stops click propagation so card link won't trigger.
     */
    openInvestorProfile(investorId) {
        if (!investorId) {
            this.notificationService.showToast({ title: 'Profile unavailable', message: 'Investor profile not available', type: 'info' });
            return;
        }
        try {
            // Navigate to client admin profile route
            this.router.navigate(['/admin/clients', investorId]);
        }
        catch (err) {
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open profile', type: 'error' });
            console.error('Navigation error:', err);
        }
    }
    /** Open project room for my participation */
    openProjectRoom(investment) {
        const id = this.resolveOpportunityId(investment);
        if (id == null) {
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open project room: opportunity ID not found', type: 'error' });
            return;
        }
        try {
            this.router.navigate(['/admin/opportunities', id, 'room']);
        }
        catch (err) {
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open project room', type: 'error' });
            console.error('Navigation error:', err);
        }
    }
    /** Open contract for my participation */
    openContract(investment) {
        if (!investment.currentContractId) {
            this.notificationService.showToast({ title: 'Contract unavailable', message: 'No contract found for this participation', type: 'info' });
            return;
        }
        try {
            this.router.navigate(['/admin/contracts', investment.currentContractId]);
        }
        catch (err) {
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open contract', type: 'error' });
            console.error('Navigation error:', err);
        }
    }
    /** Helper method to retrieve localized strings with fallback */
    t(path, fallback) {
        return this.lookupPath(this.languageService.dictionary(), path, fallback);
    }
    getNewestTimestamp(investment) {
        const candidates = [investment.lastActivityAt, investment.date].filter(Boolean);
        for (const candidate of candidates) {
            const timestamp = candidate instanceof Date ? candidate.getTime() : new Date(candidate).getTime();
            if (Number.isFinite(timestamp))
                return timestamp;
        }
        return 0;
    }
    constructor() {
        this.opportunityService = inject(OpportunityService);
        this.fb = inject(FormBuilder);
        this.router = inject(Router);
        this.route = inject(ActivatedRoute);
        this.destroyRef = inject(DestroyRef);
        this.notificationService = inject(NotificationService);
        this.languageService = inject(LanguageService);
        this.requestsService = inject(RequestsService);
        this.userService = inject(UserService);
        this.fileStoreService = inject(FileStoreService);
        this.RiskLevel = RiskLevel;
        this.InvestmentType = InvestmentType;
        // Service state
        this.investments = signal([], ...(ngDevMode ? [{ debugName: "investments" }] : []));
        this.loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
        this.categoryLookups = signal([], ...(ngDevMode ? [{ debugName: "categoryLookups" }] : []));
        // Categories: 'All' + API categories
        this.categories = computed(() => {
            const apiCategories = this.categoryLookups();
            return ['All', ...apiCategories.map(cat => cat.value)];
        }, ...(ngDevMode ? [{ debugName: "categories" }] : []));
        // UI state
        this.activeCategory = signal('All', ...(ngDevMode ? [{ debugName: "activeCategory" }] : []));
        this.currentPage = signal(1, ...(ngDevMode ? [{ debugName: "currentPage" }] : []));
        this.isAdvancedSearchOpen = signal(false, ...(ngDevMode ? [{ debugName: "isAdvancedSearchOpen" }] : []));
        this.investmentToEngage = signal(null, ...(ngDevMode ? [{ debugName: "investmentToEngage" }] : []));
        this.engagementCreditCost = ENGAGEMENT_CREDIT_COST;
        this.engagementProcessing = signal(false, ...(ngDevMode ? [{ debugName: "engagementProcessing" }] : []));
        // Investment dialog state
        this.investmentToInvest = signal(null, ...(ngDevMode ? [{ debugName: "investmentToInvest" }] : []));
        this.sharesToPurchaseValue = 1;
        this.sharesToPurchase = computed(() => this.sharesToPurchaseValue, ...(ngDevMode ? [{ debugName: "sharesToPurchase" }] : []));
        this.investmentError = signal(null, ...(ngDevMode ? [{ debugName: "investmentError" }] : []));
        this.investmentProcessing = signal(false, ...(ngDevMode ? [{ debugName: "investmentProcessing" }] : []));
        this.investmentConfirmationOpen = signal(false, ...(ngDevMode ? [{ debugName: "investmentConfirmationOpen" }] : [])); // Tracks if final confirmation dialog is open
        // User credits from UserService
        this.userCredits = this.userService.credits;
        // Founder avatar cache by user id
        this.founderAvatarCache = signal({}, ...(ngDevMode ? [{ debugName: "founderAvatarCache" }] : []));
        // Helper properties for template
        this.Math = Math;
        this.String = String;
        // Infinite scroll
        this.itemsLoaded = signal(ITEMS_PER_PAGE, ...(ngDevMode ? [{ debugName: "itemsLoaded" }] : []));
        this.displayedInvestments = computed(() => this.filteredInvestments().slice(0, this.itemsLoaded()), ...(ngDevMode ? [{ debugName: "displayedInvestments" }] : []));
        this.isMyProjectsView = computed(() => this.router.url.startsWith('/admin/my-projects'), ...(ngDevMode ? [{ debugName: "isMyProjectsView" }] : []));
        this.pageTitle = computed(() => this.isMyProjectsView() ? this.t('investments.myProjectsTitle', 'My Participations') : this.t('investments.title', 'Discover Opportunities'), ...(ngDevMode ? [{ debugName: "pageTitle" }] : []));
        this.emptyTitle = computed(() => this.isMyProjectsView() ? this.t('investments.noParticipationsTitle', 'No participated projects yet') : this.t('investments.noResultsTitle', 'No results found'), ...(ngDevMode ? [{ debugName: "emptyTitle" }] : []));
        this.emptySubtitle = computed(() => this.isMyProjectsView() ? this.t('investments.noParticipationsSubtitle', 'Approved participations will appear here.') : this.t('investments.noResultsSubtitle', 'Try adjusting your search or filters.'), ...(ngDevMode ? [{ debugName: "emptySubtitle" }] : []));
        this.onScroll = () => {
            try {
                const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 600);
                if (nearBottom) {
                    this.loadMore();
                }
            }
            catch (e) {
                // ignore
            }
        };
        // Filter form
        this.filterForm = this.fb.group({
            searchTerm: [''],
            riskLevels: this.fb.group({
                low: [false],
                medium: [false],
                high: [false]
            }),
            investmentTypes: this.fb.group({
                founding: [false],
                equity: [false]
            }),
            minFunding: [0],
            maxFunding: [100],
            onlyFavorites: [false]
        });
        this.filterState = signal(this.filterForm.value, ...(ngDevMode ? [{ debugName: "filterState" }] : []));
        /**
         * Filtered investments based on all active filters
         */
        this.filteredInvestments = computed(() => {
            const filters = this.filterState();
            const term = (filters.searchTerm ?? '').toLowerCase();
            const category = this.activeCategory();
            const selectedRisks = Object.entries(filters.riskLevels ?? {})
                .filter(([, value]) => value)
                .map(([key]) => key);
            const selectedTypes = Object.entries(filters.investmentTypes ?? {})
                .filter(([, value]) => value)
                .map(([key]) => key === 'founding' ? InvestmentType.Founding : InvestmentType.Equity);
            return this.investments().filter(inv => {
                // Category filter
                let categoryMatch = true;
                if (category !== 'All') {
                    categoryMatch = inv.businessCategoryName === category;
                }
                // Search term filter
                const termMatch = !term ||
                    inv.name.toLowerCase().includes(term) ||
                    inv.description.toLowerCase().includes(term);
                // Risk level filter
                const riskMatch = selectedRisks.length === 0 ||
                    selectedRisks.some(r => r.toLowerCase() === inv.riskLevel.toLowerCase());
                // Funding progress filter
                const progress = inv.fundingPercentage;
                const minFunding = filters.minFunding ?? 0;
                const maxFunding = filters.maxFunding ?? 100;
                const fundingMatch = progress === null || progress === undefined || (progress >= minFunding && progress <= maxFunding);
                // Favorites filter
                const favoriteMatch = !filters.onlyFavorites || inv.favorited;
                const typeMatch = selectedTypes.length === 0 || selectedTypes.some(type => inv.investmentType === type);
                return categoryMatch && termMatch && riskMatch && fundingMatch && favoriteMatch && typeMatch;
            }).sort((a, b) => this.getNewestTimestamp(b) - this.getNewestTimestamp(a));
        }, ...(ngDevMode ? [{ debugName: "filteredInvestments" }] : []));
        /**
         * Total pages for pagination
         */
        this.totalPages = computed(() => {
            const total = this.filteredInvestments().length;
            return total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;
        }, ...(ngDevMode ? [{ debugName: "totalPages" }] : []));
        /**
         * Current page of investments
         */
        this.paginatedInvestments = computed(() => {
            const page = this.currentPage();
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            return this.filteredInvestments().slice(startIndex, endIndex);
        }, ...(ngDevMode ? [{ debugName: "paginatedInvestments" }] : []));
        // Pre-activate onlyFavorites filter when navigated from the watchlist "View All" link
        const snapshot = this.route.snapshot.queryParamMap;
        if (snapshot.get('onlyFavorites') === 'true') {
            this.filterForm.patchValue({ onlyFavorites: true });
        }
        // Reset to page 1 when filters change and update the reactive filter state.
        this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
            this.currentPage.set(1);
            this.filterState.set(value);
        });
        effect(() => {
            const investments = this.investments();
            investments.forEach(inv => {
                if (inv?.founderId) {
                    this.loadFounderAvatar(inv.founderId);
                }
            });
        });
        void this.loadCategories();
        void this.loadOpportunities();
        effect(() => {
            if (this.requestsService.participationRevision() > 0)
                void this.loadOpportunities();
        });
        // attach scroll listener for load-more
        window.addEventListener('scroll', this.onScroll, { passive: true });
        this.destroyRef.onDestroy(() => window.removeEventListener('scroll', this.onScroll));
    }
    /**
     * Load more items for infinite scroll
     */
    loadMore() {
        const total = this.filteredInvestments().length;
        const loaded = this.itemsLoaded();
        if (loaded >= total)
            return;
        this.itemsLoaded.set(Math.min(total, loaded + ITEMS_PER_PAGE));
    }
    /**
     * Export the filtered investments as CSV including investedAmount
     */
    exportCsv() {
        const rows = this.filteredInvestments().map(inv => ({
            id: inv.id,
            name: inv.name || inv.title,
            founderId: inv.founderId,
            founderDisplay: inv.founderDisplay ?? '',
            targetFund: inv.targetFund ?? 0,
            currentFunding: inv.currentFunding ?? 0,
            investedAmount: inv.investedAmount ?? 0,
            investorCount: inv.investorCount ?? 0,
            status: inv.status
        }));
        const header = ['Id', 'Name', 'FounderId', 'FounderDisplay', 'TargetFund', 'CurrentFunding', 'InvestedAmount', 'InvestorCount', 'Status'];
        const csv = [header.join(',')].concat(rows.map(r => [r.id, `"${r.name.replace(/"/g, '""')}"`, r.founderId, `"${(r.founderDisplay || '').replace(/"/g, '""')}"`, r.targetFund, r.currentFunding, r.investedAmount, r.investorCount, r.status].join(','))).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investments_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    /**
     * Select a category filter
     */
    async selectCategory(category) {
        this.activeCategory.set(category);
        this.currentPage.set(1);
        this.itemsLoaded.set(ITEMS_PER_PAGE);
        await this.loadOpportunities();
    }
    clearCategoryFilter() {
        void this.selectCategory('All');
    }
    /**
     * Return a localized label for an API category value.
     * Falls back to the provided `cat` when no Arabic translation is available.
     */
    getCategoryLabel(cat) {
        const lang = this.languageService.language();
        if (lang === 'ar') {
            const found = this.categoryLookups().find(c => c.value === cat);
            return found?.label || found?.value || cat;
        }
        return cat;
    }
    /**
     * Toggle advanced search panel
     */
    toggleAdvancedSearch() {
        this.isAdvancedSearchOpen.update(value => !value);
    }
    async loadFounderAvatar(userId) {
        if (!userId)
            return;
        if (Object.prototype.hasOwnProperty.call(this.founderAvatarCache(), userId))
            return;
        try {
            const url = await this.fileStoreService.getProfilePictureUrl(userId);
            this.founderAvatarCache.update(cache => ({ ...cache, [userId]: url || '' }));
        }
        catch (err) {
            this.founderAvatarCache.update(cache => ({ ...cache, [userId]: '' }));
            console.warn('Failed to load founder avatar for', userId, err);
        }
    }
    onFounderAvatarError(userId) {
        if (!userId)
            return;
        this.founderAvatarCache.update(cache => ({ ...cache, [userId]: '' }));
    }
    getFounderAvatarUrl(investment) {
        const url = investment?.founderId ? this.founderAvatarCache()[investment.founderId] : undefined;
        return url || '';
    }
    getCoverImageUrl(investment) {
        const url = this.fileStoreService.getPublicUrl(investment.coverImageUrl || investment.imageUrl || '');
        return url || DEFAULT_PLACEHOLDER;
    }
    lookupPath(object, path, fallback) {
        return path.split('.').reduce((current, segment) => current?.[segment], object) ?? fallback;
    }
    /**
     * Reset all advanced filters
     */
    resetAdvancedFilters() {
        this.filterForm.patchValue({
            riskLevels: { low: false, medium: false, high: false },
            investmentTypes: { founding: false, equity: false },
            minFunding: 0,
            maxFunding: 100,
            onlyFavorites: false
        });
    }
    /**
     * Toggle favorite status
     */
    async toggleFavorite(investmentToToggle) {
        try {
            const id = investmentToToggle.id;
            this.investments.update(items => items.map(item => item.id === id ? ({ ...item, favorited: !item.favorited }) : item));
        }
        catch (error) {
            console.error('Failed to update favorite status', error);
        }
    }
    /**
     * Navigate to previous page
     */
    previousPage() {
        this.currentPage.update(page => Math.max(page - 1, 1));
    }
    /**
     * Navigate to next page
     */
    nextPage() {
        this.currentPage.update(page => Math.min(page + 1, this.totalPages()));
    }
    /**
     * Show engagement prompt
     */
    promptEngage(investment) {
        this.investmentToEngage.set(investment);
    }
    /**
     * Cancel engagement
     */
    cancelEngage() {
        this.investmentToEngage.set(null);
    }
    /**
     * Confirm engagement for funding-based investments
     */
    async confirmEngage() {
        const investment = this.investmentToEngage();
        if (!investment)
            return;
        if (this.engagementProcessing()) {
            return;
        }
        // Refresh profile to ensure credits are up-to-date
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before engagement confirmation:', err);
        }
        const currentCredits = this.userCredits();
        if (currentCredits < this.engagementCreditCost) {
            this.notificationService.showToast({
                title: 'Insufficient Credits',
                message: 'You do not have enough credits for engagement.',
                type: 'error'
            });
            return;
        }
        this.engagementProcessing.set(true);
        this.requestsService
            .createOpportunityRequest(investment, this.engagementCreditCost, 0)
            .then(() => {
            const { title, message } = this.getRequestSubmittedCopy(investment);
            this.notificationService.showToast({
                title,
                message,
                type: 'success'
            });
            this.investmentToEngage.set(null);
        })
            .catch(error => {
            const apiMessage = error?.error?.message || error?.message;
            this.notificationService.showToast({
                title: 'Request Failed',
                message: apiMessage || 'Failed to submit engagement request. Please try again.',
                type: 'error'
            });
        })
            .finally(() => {
            this.engagementProcessing.set(false);
        });
    }
    getRequestSubmittedCopy(investment) {
        const dictionary = this.languageService.dictionary();
        const title = this.lookupPath(dictionary, 'investments.requestSubmittedTitle', 'Request Sent');
        const messageTemplate = this.lookupPath(dictionary, 'investments.requestSubmittedMessage', 'Your request for {investmentName} was submitted. We will notify you once it is accepted.');
        return {
            title,
            message: messageTemplate.replace('{investmentName}', investment.name || investment.title || 'Opportunity')
        };
    }
    /**
     * Navigate to investment details page
     */
    navigateToDetails(investment) {
        const investmentId = typeof investment === 'number' ? investment : this.resolveOpportunityId(investment);
        if (investmentId == null) {
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to navigate to opportunity details: ID not found', type: 'error' });
            return;
        }
        try {
            this.router.navigate(['/admin/investments', investmentId]);
        }
        catch (err) {
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to navigate to opportunity details', type: 'error' });
            console.error('Navigation error:', err);
        }
    }
    openFounderProfile(founderId, event) {
        event.stopPropagation();
        const id = founderId?.trim();
        if (!id || id === 'undefined' || id === 'null')
            return;
        void this.router.navigate(['/admin/founders', id]);
    }
    /**
     * Refresh investments from API
     */
    async refresh() {
        await this.loadOpportunities();
    }
    /**
     * Calculate days remaining until end date
     */
    getDaysRemaining(endDate) {
        if (!endDate)
            return 0;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }
    /**
     * Open investment dialog
     */
    openInvestDialog(investment) {
        this.investmentToInvest.set(investment);
        this.sharesToPurchaseValue = 1;
        this.investmentError.set(null);
        this.validateShares(investment);
    }
    /**
     * Close investment dialog
     */
    closeInvestDialog() {
        this.investmentToInvest.set(null);
        this.sharesToPurchaseValue = 1;
        this.investmentError.set(null);
        this.investmentProcessing.set(false);
    }
    /**
     * Increase shares to purchase
     */
    increaseShares(investment) {
        if (this.sharesToPurchaseValue < (investment.availableShares || 0)) {
            this.sharesToPurchaseValue++;
            this.validateShares(investment);
        }
    }
    /**
     * Decrease shares to purchase
     */
    decreaseShares() {
        if (this.sharesToPurchaseValue > 1) {
            this.sharesToPurchaseValue--;
            const investment = this.investmentToInvest();
            if (investment) {
                this.validateShares(investment);
            }
        }
    }
    /**
     * Calculate total investment amount
     */
    calculateRequestedAmount(investment) {
        return this.sharesToPurchaseValue * (investment.sharePrice || 0);
    }
    /**
     * Validate shares input
     */
    validateShares(investment) {
        const shares = this.sharesToPurchaseValue;
        const amount = this.calculateRequestedAmount(investment);
        // Reset error
        this.investmentError.set(null);
        // Validate shares range
        if (shares < 1) {
            this.investmentError.set('Must purchase at least 1 share');
            return;
        }
        if (shares > (investment.availableShares || 0)) {
            this.investmentError.set(`Only ${investment.availableShares} shares available`);
            return;
        }
        // Validate min investment
        if (investment.minInvestment && amount < investment.minInvestment) {
            this.investmentError.set(`Minimum investment is ${investment.minInvestment} ${investment.currency || 'USD'}`);
            return;
        }
        // Validate max investment
        if (investment.maxInvestment && amount > investment.maxInvestment) {
            this.investmentError.set(`Maximum investment is ${investment.maxInvestment} ${investment.currency || 'USD'}`);
            return;
        }
    }
    /**
     * Show final confirmation dialog before submitting investment request
     */
    showConfirmationDialog(investment) {
        if (this.investmentError() || this.investmentProcessing()) {
            return;
        }
        const requestedAmount = (investment.sharePrice || 0) * this.sharesToPurchaseValue;
        const currentCredits = this.userCredits();
        // Pre-check credits
        if (currentCredits < requestedAmount) {
            this.investmentError.set('Insufficient credits. Please add more credits to your account.');
            this.notificationService.showToast({
                title: 'Insufficient Credits',
                message: 'You do not have enough credits to complete this investment.',
                type: 'error'
            });
            return;
        }
        // Open final confirmation dialog
        this.investmentConfirmationOpen.set(true);
    }
    /**
     * Cancel final confirmation dialog
     */
    cancelConfirmation() {
        this.investmentConfirmationOpen.set(false);
    }
    /**
     * Proceed with investment request after user confirms in dialog
     */
    async proceedWithInvestment(investment) {
        if (this.investmentError() || this.investmentProcessing()) {
            return;
        }
        this.investmentProcessing.set(true);
        this.investmentError.set(null);
        try {
            const requestedAmount = (investment.sharePrice || 0) * this.sharesToPurchaseValue;
            // Call API to create investment request (deducts credits, creates request in database)
            await this.requestsService.createOpportunityRequest(investment, requestedAmount, this.sharesToPurchaseValue);
            const { title, message } = this.getRequestSubmittedCopy(investment);
            this.notificationService.showToast({
                title,
                message,
                type: 'success'
            });
            // Close dialogs and refresh
            this.investmentConfirmationOpen.set(false);
            this.closeInvestDialog();
            await this.refresh();
        }
        catch (error) {
            const apiMessage = error?.error?.message || error?.message;
            this.investmentError.set(apiMessage || 'Failed to submit investment request');
            this.notificationService.showToast({
                title: 'Request Failed',
                message: apiMessage || 'Failed to submit investment request. Please try again.',
                type: 'error'
            });
        }
        finally {
            this.investmentProcessing.set(false);
        }
    }
    /**
     * Get display name for investment type
     */
    getInvestmentTypeDisplay(type) {
        const key = this.getInvestmentTypeI18nKey(type);
        return key ? this.t(key, getInvestmentTypeDisplayFallback(type)) : getInvestmentTypeDisplayFallback(type);
    }
    getInvestmentTypeI18nKey(type) {
        if (type === InvestmentType.Founding)
            return 'investments.type.founding';
        if (type === InvestmentType.Equity)
            return 'investments.type.equity';
        if (type === InvestmentType.RevenueSharing)
            return 'investments.type.profitSharing';
        if (type === InvestmentType.Loan)
            return 'investments.type.loan';
        return null;
    }
    /**
     * Get badge CSS classes for investment type
     */
    getInvestmentTypeBadgeClass(type) {
        return getInvestmentTypeBadgeClass(type);
    }
    /** Map status value to i18n key */
    getStatusKey(status) {
        if (!status)
            return 'draft';
        const raw = String(status).toLowerCase().replace(/[\s_-]+/g, '');
        if (raw === 'draft' || raw === '1')
            return 'draft';
        if (raw === 'active' || raw === 'published' || raw === 'approved' || raw === '5')
            return 'active';
        if (raw === 'reviewingparticipants' || raw === 'reviewingparticipants')
            return 'reviewingParticipants';
        if (raw === 'inprogress' || raw === '8')
            return 'inProgress';
        if (raw === 'fullyfunded' || raw === 'funded' || raw === '7')
            return 'fullyFunded';
        if (raw === 'paused')
            return 'paused';
        if (raw === 'completed' || raw === '9')
            return 'completed';
        if (raw === 'archived' || raw === '10')
            return 'archived';
        if (raw === 'closed')
            return 'closed';
        if (raw.includes('funded'))
            return 'fullyFunded';
        if (raw.includes('progress'))
            return 'inProgress';
        if (raw.includes('paused'))
            return 'paused';
        if (raw.includes('completed'))
            return 'completed';
        if (raw.includes('archived'))
            return 'archived';
        if (raw.includes('closed'))
            return 'closed';
        if (raw.includes('review'))
            return 'reviewingParticipants';
        if (raw.includes('draft'))
            return 'draft';
        return 'active';
    }
    /** Resolve the opportunity identifier from a ProjectCard.
     *  MyParticipations use opportunityId; Opportunities use id.
     *  Returns null when the identifier is missing or invalid. */
    resolveOpportunityId(card) {
        const raw = card;
        const isMyParticipation = 'opportunityTitle' in raw || raw['approvedContributionAmount'] !== undefined;
        const id = isMyParticipation
            ? raw['opportunityId'] ?? null
            : raw['id'] ?? null;
        if (id == null || id === '')
            return null;
        return id;
    }
    async loadCategories() {
        try {
            this.categoryLookups.set(await this.opportunityService.getCategories());
        }
        catch {
            this.categoryLookups.set([]);
        }
    }
    async loadOpportunities() {
        this.loading.set(true);
        this.error.set(null);
        try {
            const category = this.activeCategory();
            const found = this.categoryLookups().find(c => c.value === category);
            if (this.isMyProjectsView()) {
                const participations = await this.opportunityService.getMyParticipations();
                this.investments.set(participations.map(item => this.toProjectCard(item)));
                return;
            }
            const [publicRecords, myRecords] = await Promise.all([
                this.opportunityService.getPublicOpportunities({ categoryId: category !== 'All' ? found?.id : undefined }),
                this.opportunityService.getMyOpportunities().catch(() => [])
            ]);
            const founderDrafts = myRecords.filter(item => this.isDraftStatus(item.status));
            const mergedById = new Map();
            [...publicRecords, ...founderDrafts].forEach(item => {
                const key = String(item.id);
                if (!mergedById.has(key)) {
                    mergedById.set(key, item);
                }
            });
            this.investments.set(Array.from(mergedById.values()).map(item => this.toProjectCard(item)));
        }
        catch (error) {
            this.error.set(error?.message || 'Failed to load opportunities.');
            this.investments.set([]);
        }
        finally {
            this.loading.set(false);
        }
    }
    toProjectCard(item) {
        const source = item;
        const isMyParticipation = 'opportunityTitle' in source || 'approvedContributionAmount' in source;
        if (isMyParticipation) {
            return this.toProjectCardFromMyParticipation(source);
        }
        return this.toProjectCardFromOpportunity(source);
    }
    toProjectCardFromMyParticipation(source) {
        const targetFund = Number(source.fundingTarget ?? 0);
        const fundingPercentage = this.numberOrNull(source.fundingProgressPercentage);
        const currentFunding = this.numberOrNull(source.fundedAmount);
        return {
            ...source,
            id: source.id,
            name: source.opportunityTitle || 'Untitled Opportunity',
            description: source.shortDescription || '',
            founderDisplay: source.founderDisplayName || 'Founder',
            founderId: source.founderId || '',
            businessRole: source.businessRole || '',
            businessCategoryName: source.categoryName || '',
            businessCategoryNameAr: source.categoryNameAr || '',
            targetFund,
            currentFunding,
            fundingPercentage,
            currency: source.currency || 'USD',
            investedAmount: this.numberOrNull(source.approvedContributionAmount),
            investorCount: this.numberOrNull(source.approvedParticipantCount),
            investmentType: this.toInvestmentType(source.investmentModel),
            riskLevel: (source.riskLevel || RiskLevel.Medium),
            favorited: !!source.favorited,
            minInvestment: Number(source.minimumInvestmentAmount ?? 0),
            maxInvestment: Number(source.maximumInvestmentAmount ?? 0),
            sharePrice: Number(source.sharePrice ?? 0),
            availableShares: this.numberOrNull(source.remainingShares),
            credibilityScore: Number(source.credibilityScore ?? 0),
            date: source.createdAt ? new Date(source.createdAt) : new Date(),
            lastActivityAt: source.updatedAt ? new Date(source.updatedAt) : undefined,
            status: this.normalizeStatusLabel(source.participationStatus),
            imageUrl: source.coverImageUrl || '',
            investors: Array.isArray(source.investors) ? source.investors : [],
            // MyParticipation-specific fields
            approvedContributionAmount: this.numberOrNull(source.approvedContributionAmount),
            remainingFundingAmount: this.numberOrNull(source.remainingFundingAmount),
            contractAvailable: !!source.contractAvailable,
            currentContractId: source.currentContractId ? String(source.currentContractId) : null,
            currentContractVersion: source.currentContractVersion ? String(source.currentContractVersion) : null,
            canOpenProjectRoom: !!source.canOpenProjectRoom,
            // Loan-specific
            principal: this.numberOrNull(source.principal),
            interestRate: this.numberOrNull(source.interestRate),
            expectedDurationMonths: this.numberOrNull(source.expectedDurationMonths),
            repaymentFrequency: source.repaymentFrequency || null,
            finalRepaymentDate: source.finalRepaymentDate || null,
            expectedReturn: this.numberOrNull(source.expectedReturn),
            expectedTotalRepayment: this.numberOrNull(source.expectedTotalRepayment),
            // Equity-specific
            approvedShares: this.numberOrNull(source.approvedShares),
            ownershipPercentage: this.numberOrNull(source.ownershipPercentage),
            soldShares: this.numberOrNull(source.soldShares),
            // Profit Sharing-specific
            contribution: this.numberOrNull(source.contribution),
            profitSharePercentage: this.numberOrNull(source.profitSharePercentage),
            payoutFrequency: source.payoutFrequency || null,
            expectedProfit: this.numberOrNull(source.expectedProfit),
            expectedTotalPayout: this.numberOrNull(source.expectedTotalPayout),
        };
    }
    toProjectCardFromOpportunity(source) {
        const targetFund = Number(source.fundingTarget ?? source.targetFund ?? 0);
        const fundingPercentage = this.numberOrNull(source.fundingProgressPercentage ?? source.fundingProgressPercent);
        const currentFunding = this.numberOrNull(source.fundedAmount);
        return {
            ...source,
            name: source.title || source.name || 'Untitled Opportunity',
            description: source.shortDescription || source.description || source.fullDescription || '',
            founderDisplay: source.founder?.displayName || source.founder?.fullName || source.founder?.name || 'Founder',
            founderId: source.founderId || source.founder?.id || source.founder?.userId || '',
            businessRole: source.founder?.businessRole || source.businessRole || '',
            businessCategoryName: source.categoryName || source.category?.label || source.businessCategoryName || '',
            businessCategoryNameAr: source.businessCategoryNameAr || source.category?.value || '',
            targetFund,
            currentFunding,
            fundingPercentage,
            currency: source.currency || 'USD',
            investedAmount: this.numberOrNull(source.investedAmount),
            investorCount: this.numberOrNull(source.approvedParticipantCount),
            investmentType: this.toInvestmentType(source.investmentModel),
            riskLevel: (source.riskLevel || RiskLevel.Medium),
            favorited: !!source.favorited,
            minInvestment: Number(source.minimumInvestmentAmount ?? source.minimumInvestment ?? 0),
            maxInvestment: Number(source.maximumInvestmentAmount ?? source.maximumInvestment ?? 0),
            sharePrice: Number(source.sharePrice ?? 0),
            availableShares: this.numberOrNull(source.remainingShares),
            credibilityScore: Number(source.credibilityScore ?? 0),
            date: source.createdAt ? new Date(source.createdAt) : new Date(),
            lastActivityAt: source.updatedAt ? new Date(source.updatedAt) : undefined,
            status: this.normalizeStatusLabel(source.status),
            imageUrl: source.coverImageUrl || source.imageUrl || '',
            investors: Array.isArray(source.investors) ? source.investors : []
        };
    }
    normalizeStatusLabel(value) {
        const raw = String(value || 'Active').toLowerCase().replace(/[\s_-]+/g, '');
        if (raw === '1' || raw === 'draft')
            return 'Draft';
        if (raw === '5' || raw === 'published' || raw === 'active' || raw === 'approved')
            return 'Active';
        if (raw === '6' || raw === 'funding')
            return 'Funding';
        if (raw === '7' || raw === 'fullyfunded')
            return 'Fully Funded';
        if (raw === '8' || raw === 'inprogress')
            return 'In Progress';
        if (raw === '9' || raw === 'completed')
            return 'Completed';
        if (raw === '10' || raw === 'archived')
            return 'Archived';
        if (raw.includes('funded'))
            return 'Fully Funded';
        if (raw.includes('progress'))
            return 'In Progress';
        if (raw.includes('paused'))
            return 'Paused';
        if (raw.includes('completed'))
            return 'Completed';
        if (raw.includes('archived'))
            return 'Archived';
        if (raw.includes('closed'))
            return 'Closed';
        if (raw.includes('review'))
            return 'Reviewing Participants';
        if (raw.includes('draft'))
            return 'Draft';
        return 'Active';
    }
    numberOrNull(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    isDraftStatus(value) {
        const raw = String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
        return raw === '1' || raw === 'draft';
    }
    toInvestmentType(model) {
        const key = String(model || '').toLowerCase();
        if (key.includes('founding'))
            return InvestmentType.Founding;
        if (key.includes('loan') || key.includes('debt'))
            return InvestmentType.Loan;
        if (key.includes('profit') || key.includes('revenue'))
            return InvestmentType.RevenueSharing;
        return InvestmentType.Equity;
    }
    static { this.ɵfac = function InvestmentsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvestmentsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvestmentsComponent, selectors: [["app-investments"]], decls: 11, vars: 8, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8"], [1, "flex", "flex-col", "md:flex-row", "justify-between", "items-center", "mb-6", "gap-4"], [1, "text-3xl", "font-bold"], [1, "flex", "items-center", "gap-2"], [1, "bg-red-500/10", "border", "border-red-500/50", "rounded-lg", "p-6", "mb-6", "animate-fade-in"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-6", "md:p-8"], [1, "fixed", "inset-0", "bg-black/60", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "animate-fade-in", 2, "animation-duration", "0.2s"], [1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "animate-fade-in"], ["type", "button", 1, "bg-blue-600", "hover:bg-blue-700", "text-white", "px-4", "py-2", "rounded-lg", "transition-colors", "flex", "items-center", "gap-2", 3, "click"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 20 20", "fill", "currentColor", 1, "h-5", "w-5"], ["fill-rule", "evenodd", "d", "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z", "clip-rule", "evenodd"], ["type", "button", 1, "bg-slate-700", "hover:bg-slate-600", "text-white", "px-4", "py-2", "rounded-lg", "transition-colors", "flex", "items-center", "gap-2", 3, "click", "title"], ["d", "M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V3z"], [1, "flex", "items-center", "gap-3"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 20 20", "fill", "currentColor", 1, "h-6", "w-6", "text-red-400"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", "clip-rule", "evenodd"], [1, "text-lg", "font-semibold", "text-red-400"], [1, "text-gray-300"], [1, "flex", "flex-col", "items-center", "justify-center", "py-20"], [1, "animate-spin", "rounded-full", "h-16", "w-16", "border-t-2", "border-b-2", "border-blue-500", "mb-4"], [1, "text-gray-400", "text-lg"], [3, "formGroup"], [1, "mb-6", "rounded-2xl", "border", "border-slate-800", "bg-slate-950/35", "p-4"], [1, "grid", "grid-cols-1", "lg:grid-cols-[minmax(260px,1fr)_auto_minmax(220px,320px)_auto]", "gap-3", "items-end"], [1, "block", "text-xs", "font-semibold", "uppercase", "tracking-wide", "text-slate-500", "mb-2"], [1, "relative"], ["type", "text", "formControlName", "searchTerm", 1, "w-full", "bg-slate-900", "border", "border-slate-700", "rounded-xl", "shadow-sm", "py-2.5", "ps-10", "pe-4", "text-white", "placeholder-gray-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "placeholder"], [1, "absolute", "inset-y-0", "start-0", "ps-4", "flex", "items-center", "pointer-events-none"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", "xmlns", "http://www.w3.org/2000/svg", 1, "w-5", "h-5", "text-gray-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], ["type", "button", 1, "h-[42px]", "w-full", "lg:w-auto", "px-4", "rounded-xl", "border", "border-blue-500/30", "bg-blue-500/10", "text-blue-200", "inline-flex", "items-center", "justify-center", "gap-2", "text-sm", "font-semibold", "cursor-default"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 5v14m0 0l-5-5m5 5l5-5"], [1, "w-full", "bg-slate-900", "border", "border-slate-700", "rounded-xl", "shadow-sm", "py-2.5", "px-3", "text-white", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "change", "value"], [3, "value"], ["type", "button", 1, "h-[42px]", "px-4", "bg-slate-800", "border", "border-slate-700", "rounded-xl", "text-gray-300", "hover:text-white", "hover:bg-slate-700", "transition-colors", "inline-flex", "items-center", "justify-center", "gap-2", 3, "click", "title"], ["d", "M5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"], [1, "text-sm", "font-semibold"], [1, "mt-4", "flex", "flex-wrap", "items-center", "gap-2"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-lg", "p-6", "mb-6", "animate-fade-in"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "xl:grid-cols-3", "gap-5", "mt-8", "min-h-[550px]"], [1, "group", "relative", "flex", "flex-col", "rounded-2xl", "border", "border-slate-700/50", "bg-slate-900/70", "backdrop-blur-sm", "overflow-hidden", "transition-all", "duration-300", "hover:border-slate-500/60", "hover:-translate-y-1", "hover:shadow-2xl", "hover:shadow-black/50", "animate-fade-in", "cursor-pointer"], [1, "col-span-full", "text-center", "py-20", "text-gray-500", "animate-fade-in", "flex", "flex-col", "items-center", "justify-center"], [1, "flex", "justify-center", "items-center", "mt-8", "pt-6", "border-t", "border-slate-800"], ["id", "investments-load-more", 1, "py-4"], ["class", "bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-full transition-colors", 3, "click", 4, "ngIf"], ["class", "text-gray-400", 4, "ngIf"], [1, "inline-flex", "items-center", "rounded-full", "border", "border-slate-700", "bg-slate-900", "px-3", "py-1.5", "text-sm", "text-slate-300"], [1, "inline-flex", "items-center", "gap-2", "rounded-full", "border", "border-blue-500/30", "bg-blue-500/10", "px-3", "py-1.5", "text-sm", "text-blue-200"], ["type", "button", "aria-label", "Clear category filter", 1, "text-blue-200", "hover:text-white", 3, "click"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-6", "items-end"], ["formGroupName", "riskLevels"], [1, "font-semibold", "text-white", "mb-3"], [1, "flex", "items-center", "space-x-6", "rtl:space-x-reverse"], [1, "flex", "items-center", "space-x-2", "rtl:space-x-reverse", "text-gray-300", "cursor-pointer"], ["type", "checkbox", "formControlName", "low", 1, "h-4", "w-4", "bg-slate-700", "border-slate-600", "text-blue-500", "focus:ring-blue-600", "rounded"], ["type", "checkbox", "formControlName", "medium", 1, "h-4", "w-4", "bg-slate-700", "border-slate-600", "text-blue-500", "focus:ring-blue-600", "rounded"], ["type", "checkbox", "formControlName", "high", 1, "h-4", "w-4", "bg-slate-700", "border-slate-600", "text-blue-500", "focus:ring-blue-600", "rounded"], ["formGroupName", "investmentTypes"], ["type", "checkbox", "formControlName", "founding", 1, "h-4", "w-4", "bg-slate-700", "border-slate-600", "text-blue-500", "focus:ring-blue-600", "rounded"], ["type", "checkbox", "formControlName", "equity", 1, "h-4", "w-4", "bg-slate-700", "border-slate-600", "text-blue-500", "focus:ring-blue-600", "rounded"], ["type", "number", "formControlName", "minFunding", "min", "0", "max", "100", 1, "w-full", "bg-slate-700", "border", "border-slate-600", "rounded-md", "py-1.5", "px-3", "text-white", "focus:outline-none", "focus:ring-1", "focus:ring-blue-500", 3, "placeholder"], [1, "text-gray-400"], ["type", "number", "formControlName", "maxFunding", "min", "0", "max", "100", 1, "w-full", "bg-slate-700", "border", "border-slate-600", "rounded-md", "py-1.5", "px-3", "text-white", "focus:outline-none", "focus:ring-1", "focus:ring-blue-500", 3, "placeholder"], [1, "flex", "items-end", "justify-between", "md:justify-end", "gap-4", "flex-wrap"], ["for", "onlyFavorites", 1, "flex", "items-center", "cursor-pointer"], ["type", "checkbox", "formControlName", "onlyFavorites", "id", "onlyFavorites", 1, "sr-only", "peer"], [1, "w-11", "h-6", "bg-slate-700", "rounded-full", "peer", "peer-focus:ring-2", "peer-focus:ring-blue-500/50", "peer-checked:after:translate-x-full", "rtl:peer-checked:after:-translate-x-full", "after:content-['']", "after:absolute", "after:top-0.5", "after:start-[2px]", "after:bg-white", "after:border-gray-300", "after:border", "after:rounded-full", "after:h-5", "after:w-5", "after:transition-all", "peer-checked:bg-blue-600"], [1, "ms-3", "text-gray-300"], ["type", "button", 1, "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-2", "px-4", "rounded-md", "transition-colors", 3, "click"], [1, "group", "relative", "flex", "flex-col", "rounded-2xl", "border", "border-slate-700/50", "bg-slate-900/70", "backdrop-blur-sm", "overflow-hidden", "transition-all", "duration-300", "hover:border-slate-500/60", "hover:-translate-y-1", "hover:shadow-2xl", "hover:shadow-black/50", "animate-fade-in", "cursor-pointer", 3, "click"], [1, "h-1", "w-full", "flex-shrink-0"], [1, "relative", "h-48", "overflow-hidden"], ["loading", "lazy", 1, "w-full", "h-full", "object-cover", "opacity-80", "group-hover:opacity-100", "transition-opacity", "duration-300", 3, "src", "alt"], [1, "absolute", "inset-0", "bg-gradient-to-t", "from-slate-900/70", "to-transparent"], [1, "flex", "items-start", "justify-between", "px-5", "pt-4", "pb-3"], ["type", "button", 1, "flex", "items-center", "gap-3", "flex-1", "min-w-0", "text-start", 3, "click", "disabled"], [1, "relative", "flex-shrink-0"], [1, "w-10", "h-10", "rounded-xl", "bg-gradient-to-br", "from-blue-500", "to-purple-600", "flex", "items-center", "justify-center", "text-white", "font-bold", "text-sm", "shadow-md", "overflow-hidden"], [1, "w-full", "h-full", "object-cover", 3, "src", "alt"], [1, "absolute", "-bottom-0.5", "-end-0.5", "w-3", "h-3", "rounded-full", "bg-emerald-500", "border-2", "border-slate-900", "shadow-sm", "shadow-emerald-500/50"], [1, "min-w-0"], [1, "text-sm", "font-semibold", "text-white", "truncate", "leading-tight"], [1, "text-xs", "text-gray-400", "truncate", "mt-0.5"], [1, "flex", "items-center", "gap-0.5", "flex-shrink-0", "ms-2", "-mt-0.5"], [1, "p-1.5", "rounded-lg", "transition-colors", "duration-200", "hover:bg-white/5", 3, "click"], ["stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"], [1, "p-1.5", "rounded-lg", "text-gray-500", "hover:text-blue-400", "hover:bg-white/5", "transition-colors", "duration-200", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"], [1, "px-5", "pb-4"], [1, "text-base", "font-bold", "text-white", "leading-snug", "line-clamp-2", "mb-2", "group-hover:text-blue-300", "transition-colors", "duration-200"], [1, "flex", "items-center", "gap-1.5", "flex-wrap"], [1, "inline-flex", "items-center", "gap-1", "px-2", "py-0.5", "text-[11px]", "font-semibold", "rounded-md", 3, "ngClass"], [1, "px-2", "py-0.5", "text-[11px]", "font-semibold", "rounded-md"], [1, "px-2", "py-0.5", "text-[11px]", "font-medium", "rounded-md", "bg-slate-700/70", "text-gray-300"], [1, "ms-auto", "text-[11px]", "font-bold", "px-2", "py-0.5", "rounded-md", "border", 3, "ngClass"], [1, "mt-3", "text-gray-400", "text-xs", "leading-relaxed", "line-clamp-2", 3, "title"], [1, "mx-5", "mb-4", "grid", "grid-cols-2", "gap-2"], [1, "rounded-xl", "bg-slate-800/60", "border", "border-slate-700/30", "p-3"], [1, "text-[10px]", "uppercase", "tracking-wider", "text-gray-500", "mb-1"], [1, "text-sm", "font-bold", "text-white", "leading-none", "tabular-nums"], [1, "text-[10px]", "text-gray-500", "mt-0.5"], [1, "rounded-xl", "bg-emerald-500/10", "border", "border-emerald-500/20", "p-3"], [1, "rounded-xl", "bg-blue-500/10", "border", "border-blue-500/20", "p-3"], [1, "rounded-xl", "bg-purple-500/10", "border", "border-purple-500/20", "p-3"], [1, "px-5", "mb-4"], [1, "flex", "justify-between", "items-center", "mb-1.5"], [1, "text-xs", "text-gray-400"], [1, "flex", "items-center", "gap-1", "text-[11px]", "font-semibold", 3, "class"], [1, "text-sm", "font-bold", "text-white", "tabular-nums"], [1, "w-full", "bg-slate-700/50", "rounded-full", "h-2", "overflow-hidden"], [1, "h-2", "rounded-full", "transition-all", "duration-700", "ease-out"], [1, "flex", "justify-between", "mt-1.5"], [1, "text-[11px]", "text-gray-400", "tabular-nums"], [1, "text-gray-600"], [1, "text-[11px]", "text-gray-500", "tabular-nums"], [1, "mt-3", "grid", "grid-cols-2", "gap-2", "text-[11px]"], [1, "px-5", "pb-4", "flex", "items-center", "justify-between"], [1, "text-[11px]", "text-gray-600", "italic"], [1, "flex", "items-center", "gap-1", "bg-slate-800/60", "border", "border-slate-700/40", "rounded-full", "px-2", "py-1"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3", "text-amber-400"], ["d", "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"], [1, "text-[11px]", "font-semibold", "text-gray-300"], [1, "mt-auto", "px-4", "pb-4"], [1, "mt-2", "grid", "grid-cols-2", "gap-2"], [1, "w-full", "h-full", "object-cover", 3, "error", "src", "alt"], [1, "text-[10px]", "uppercase", "tracking-wider", "text-emerald-400/70", "mb-1"], [1, "text-sm", "font-bold", "text-emerald-300", "leading-none"], [1, "text-[10px]", "text-emerald-400/50", "mt-0.5"], [1, "text-[10px]", "uppercase", "tracking-wider", "text-blue-400/70", "mb-1"], [1, "text-sm", "font-bold", "text-blue-300", "leading-none", "tabular-nums"], [1, "text-[10px]", "text-blue-400/50", "mt-0.5"], [1, "text-[10px]", "uppercase", "tracking-wider", "text-purple-400/70", "mb-1"], [1, "text-sm", "font-bold", "text-purple-300", "leading-none", "tabular-nums"], [1, "text-[10px]", "text-purple-400/50", "mt-0.5"], [1, "text-sm", "font-bold", "text-white", "leading-none"], [1, "flex", "items-center", "gap-1", "text-[11px]", "font-semibold"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z", "clip-rule", "evenodd"], [1, "mt-3", "rounded-xl", "bg-gradient-to-r", "from-blue-500/10", "to-purple-500/10", "border", "border-blue-500/20", "p-3"], [1, "text-lg", "font-bold", "text-white", "tabular-nums"], [1, "mt-2", "flex", "items-center", "gap-1.5", "text-[11px]", "text-gray-400"], [1, "mt-1", "flex", "items-center", "gap-1.5", "text-[11px]", "text-gray-400"], [1, "mt-2", "grid", "grid-cols-3", "gap-2"], [1, "text-white", "tabular-nums"], [1, "rounded-lg", "bg-slate-800/60", "border", "border-slate-700/30", "p-2", "text-center"], [1, "text-[9px]", "uppercase", "tracking-wider", "text-gray-500"], [1, "text-xs", "font-bold", "text-white", "tabular-nums"], [1, "text-white"], [1, "flex", "-space-x-1.5"], [1, "w-6", "h-6", "rounded-full", "border-2", "border-slate-900", "bg-slate-700", "flex", "items-center", "justify-center", "text-gray-300", "text-[9px]", "font-bold"], [1, "text-[11px]", "text-gray-400"], ["type", "button", 1, "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "rounded-full"], [1, "w-6", "h-6", "rounded-full", "border-2", "border-slate-900", "bg-slate-700", "flex", "items-center", "justify-center", "text-gray-400", "text-[9px]", "font-bold", 3, "title"], ["type", "button", 1, "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "rounded-full", 3, "click"], [1, "w-6", "h-6", "rounded-full", "border-2", "border-slate-900", "object-cover", "hover:scale-110", "transition-transform", 3, "src", "alt", "title"], [1, "w-6", "h-6", "rounded-full", "border-2", "border-slate-900", "bg-gradient-to-br", "from-blue-400", "to-purple-500", "flex", "items-center", "justify-center", "text-white", "text-[9px]", "font-bold", "hover:scale-110", "transition-transform", 3, "title"], [1, "w-full", "py-2.5", "rounded-xl", "text-sm", "font-semibold", "transition-all", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-slate-900", "flex", "items-center", "justify-center", "gap-2", 3, "click", "disabled", "ngClass"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-4", "h-4"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-6.707a1 1 0 011.414-1.414L11 11.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-1-1z", "clip-rule", "evenodd"], ["fill-rule", "evenodd", "d", "M6 2a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm8 0a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1z", "clip-rule", "evenodd"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "group-hover:translate-x-0.5", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M13 7l5 5m0 0l-5 5m5-5H6"], [1, "w-full", "py-2", "rounded-xl", "text-sm", "font-medium", "text-white", "bg-slate-700/50", "border", "border-slate-600/40", "hover:bg-slate-700", "hover:border-slate-500/50", "transition-colors", "flex", "items-center", "justify-center", "gap-1.5"], [1, "w-full", "py-2", "rounded-xl", "text-sm", "font-medium", "text-white", "bg-gradient-to-r", "from-blue-600", "to-purple-600", "hover:from-blue-500", "hover:to-purple-500", "transition-colors", "flex", "items-center", "justify-center", "gap-1.5"], [1, "w-full", "py-2", "rounded-xl", "text-sm", "font-medium", "text-white", "bg-slate-700/50", "border", "border-slate-600/40", "hover:bg-slate-700", "hover:border-slate-500/50", "transition-colors", "flex", "items-center", "justify-center", "gap-1.5", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"], [1, "w-full", "py-2", "rounded-xl", "text-sm", "font-medium", "text-white", "bg-gradient-to-r", "from-blue-600", "to-purple-600", "hover:from-blue-500", "hover:to-purple-500", "transition-colors", "flex", "items-center", "justify-center", "gap-1.5", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"], ["fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", "aria-hidden", "true", 1, "mx-auto", "h-12", "w-12"], ["vector-effect", "non-scaling-stroke", "stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"], [1, "mt-2", "text-sm", "font-semibold", "text-white"], [1, "mt-1", "text-sm", "text-gray-500"], [1, "bg-slate-800", "hover:bg-slate-700", "text-white", "font-semibold", "py-2", "px-4", "rounded-full", "transition-colors", 3, "click"], [1, "bg-slate-900", "border", "border-slate-700", "rounded-xl", "shadow-2xl", "w-full", "max-w-lg", "m-4", "p-8", "text-center", "animate-fade-in", 2, "animation-delay", "0.1s", "animation-duration", "0.3s"], [1, "mx-auto", "flex", "h-16", "w-16", "items-center", "justify-center", "rounded-full", "bg-blue-500/10", "border-2", "border-blue-500/30"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-8", "h-8", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-xl", "font-bold", "text-white", "mt-5"], [1, "text-gray-400", "mt-2", 3, "innerHTML"], [1, "mt-8", "flex", "justify-center", "gap-4"], [1, "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-2.5", "px-6", "rounded-full", "transition-colors", 3, "click"], [1, "bg-gradient-to-r", "from-blue-500", "to-purple-600", "text-white", "font-semibold", "py-2.5", "px-6", "rounded-full", "hover:opacity-90", "transition-opacity", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "gap-2", 3, "click", "disabled"], ["fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "h-4", "w-4"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", 1, "opacity-75"], [1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "animate-fade-in", 3, "click"], [1, "bg-gradient-to-br", "from-slate-900", "to-slate-800", "border", "border-slate-700", "rounded-2xl", "shadow-2xl", "w-full", "max-w-md", "m-4", "animate-fade-in", 3, "click"], [1, "p-6", "border-b", "border-slate-700", "bg-gradient-to-r", "from-blue-500/10", "to-purple-500/10"], [1, "flex", "items-center", "justify-between"], [1, "text-2xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400", "mt-1"], [1, "text-gray-400", "hover:text-white", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M6 18L18 6M6 6l12 12"], [1, "p-6", "space-y-5"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-lg", "p-4"], [1, "grid", "grid-cols-2", "gap-4"], [1, "text-xs", "text-gray-400", "uppercase", "tracking-wide", "mb-1"], [1, "text-right"], [1, "text-xl", "font-semibold", "text-blue-300"], [1, "mt-3", "pt-3", "border-t", "border-slate-700/50", "flex", "items-center", "justify-between", "text-xs", "text-gray-400"], [1, "block", "text-sm", "font-medium", "text-gray-300", "mb-2"], [1, "bg-slate-700", "hover:bg-slate-600", "disabled:opacity-30", "disabled:cursor-not-allowed", "text-white", "font-bold", "w-10", "h-10", "rounded-lg", "transition-colors", 3, "click", "disabled"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "mx-auto"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M20 12H4"], ["type", "number", "min", "1", 1, "flex-1", "bg-slate-800", "border", "border-slate-600", "rounded-lg", "py-3", "px-4", "text-white", "text-center", "text-xl", "font-bold", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "ngModelChange", "change", "ngModel", "max"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 4v16m8-8H4"], [1, "text-xs", "text-gray-400", "mt-2", "text-center"], [1, "bg-gradient-to-r", "from-blue-500/10", "to-purple-500/10", "border", "border-blue-500/30", "rounded-lg", "p-4"], [1, "flex", "items-center", "justify-between", "mb-2"], [1, "flex", "items-center", "justify-between", "text-sm"], [1, "bg-red-500/10", "border", "border-red-500/50", "rounded-lg", "p-3", "flex", "items-center", "gap-2"], [1, "p-6", "border-t", "border-slate-700", "flex", "items-center", "justify-between", "bg-slate-800/50"], [1, "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "transition-colors", 3, "click"], [1, "bg-gradient-to-r", "from-blue-500", "to-purple-600", "text-white", "font-semibold", "py-3", "px-8", "rounded-lg", "hover:opacity-90", "transition-opacity", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "gap-2", 3, "click", "disabled"], [1, "text-green-300", "font-semibold"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-red-400", "flex-shrink-0"], [1, "text-sm", "text-red-300"], ["fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "h-5", "w-5"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M5 13l4 4L19 7"], [1, "p-6", "border-b", "border-slate-700", "bg-gradient-to-r", "from-orange-500/10", "to-red-500/10"], [1, "p-6", "border-t", "border-slate-700", "flex", "items-center", "justify-between", "gap-3", "bg-slate-800/50"], [1, "flex-1", "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "transition-colors", 3, "click"], [1, "flex-1", "bg-gradient-to-r", "from-orange-500", "to-red-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "hover:opacity-90", "transition-opacity", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "justify-center", "gap-2", 3, "disabled"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-lg", "p-4", "space-y-3"], [1, "text-lg", "font-semibold", "text-white"], [1, "text-lg", "font-semibold", "text-blue-300"], [1, "border-t", "border-slate-700", "pt-3", "flex", "items-center", "justify-between"], [1, "text-gray-300", "font-medium"], [1, "bg-orange-500/10", "border", "border-orange-500/30", "rounded-lg", "p-4", "flex", "items-start", "gap-3"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-orange-400", "flex-shrink-0", "mt-0.5"], ["fill-rule", "evenodd", "d", "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", "clip-rule", "evenodd"], [1, "text-sm", "font-semibold", "text-orange-300"], [1, "text-xs", "text-orange-200", "mt-1"], [1, "flex-1", "bg-gradient-to-r", "from-orange-500", "to-red-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "hover:opacity-90", "transition-opacity", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "justify-center", "gap-2", 3, "click", "disabled"]], template: function InvestmentsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "h1", 2);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, InvestmentsComponent_Conditional_4_Template, 12, 9, "div", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, InvestmentsComponent_Conditional_5_Template, 10, 4, "div", 4);
            i0.ɵɵconditionalCreate(6, InvestmentsComponent_Conditional_6_Template, 6, 3, "div", 5);
            i0.ɵɵconditionalCreate(7, InvestmentsComponent_Conditional_7_Template, 43, 13, "div", 5);
            i0.ɵɵconditionalCreate(8, InvestmentsComponent_Conditional_8_Template, 17, 11, "div", 6);
            i0.ɵɵconditionalCreate(9, InvestmentsComponent_Conditional_9_Template, 57, 25, "div", 7);
            i0.ɵɵconditionalCreate(10, InvestmentsComponent_Conditional_10_Template, 16, 11, "div", 7);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_5_0;
            let tmp_6_0;
            let tmp_7_0;
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.pageTitle());
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() ? 4 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() ? 7 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_5_0 = ctx.investmentToEngage()) ? 8 : -1, tmp_5_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_6_0 = ctx.investmentToInvest()) ? 9 : -1, tmp_6_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_7_0 = ctx.investmentConfirmationOpen()) ? 10 : -1, tmp_7_0);
        } }, dependencies: [CommonModule, i1.NgClass, i1.NgIf, ReactiveFormsModule, i2.ɵNgNoValidate, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.CheckboxControlValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.MinValidator, i2.MaxValidator, i2.FormGroupDirective, i2.FormControlName, i2.FormGroupName, FormsModule, i2.NgModel, i1.LowerCasePipe, i1.DecimalPipe, i1.CurrencyPipe, TranslatePipe], styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\n\n.investments[_ngcontent-%COMP%] { padding: $spacing-6; }\n.investment-list[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: $spacing-6; }\n\n[_nghost-%COMP%] {\n  display: block;\n  min-height: 100vh;\n}\n\nbody.investa-theme-light[_nghost-%COMP%], body.investa-theme-light   [_nghost-%COMP%] {\n  color: var(--investa-text-primary, #212225);\n  background: var(--investa-bg, #e8e8e8);\n\n  .container {\n    max-width: 1440px;\n  }\n\n  h1,\n  h3,\n  h4,\n  .font-bold,\n  .font-semibold {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  p,\n  label,\n  .text-gray-300,\n  .text-gray-400,\n  .text-slate-300,\n  .text-slate-400 {\n    color: var(--investa-text-secondary, #66686b);\n  }\n\n  .text-gray-500,\n  .text-slate-500,\n  .text-gray-600 {\n    color: var(--investa-text-muted, #7b7d80);\n  }\n\n  [class*='bg-slate-900'],\n  [class*='bg-slate-950'],\n  [class*='bg-slate-800'],\n  [class*='bg-slate-700'],\n  [class*='bg-gray-900'],\n  [class*='bg-gray-800'] {\n    background: var(--investa-surface, #ffffff);\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .bg-slate-950\\/35,\n  .bg-slate-800\\/50,\n  .bg-slate-800\\/60,\n  .bg-slate-700\\/50,\n  .bg-slate-700\\/70,\n  .bg-blue-500\\/10,\n  .bg-purple-500\\/10,\n  .bg-emerald-500\\/10 {\n    background: var(--investa-surface-2, #f7f7f7);\n  }\n\n  [class*='border-slate'],\n  [class*='border-gray'],\n  .border-blue-500\\/20,\n  .border-blue-500\\/30,\n  .border-purple-500\\/20,\n  .border-emerald-500\\/20 {\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .shadow-2xl {\n    box-shadow: var(--investa-shadow-sm, 0 1px 2px rgba(21, 22, 25, 0.05));\n  }\n\n  article.group,\n  .rounded-xl.border,\n  .rounded-2xl.border {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n    box-shadow: var(--investa-shadow-sm, 0 1px 2px rgba(21, 22, 25, 0.05));\n  }\n\n  article.group:hover {\n    border-color: var(--investa-border-strong, #cfcfcf);\n    box-shadow: var(--investa-shadow-md, 0 10px 28px rgba(21, 22, 25, 0.08));\n  }\n\n  input:not([type='checkbox']),\n  select,\n  textarea {\n    min-height: var(--investa-input-height, 2.75rem);\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n    color: var(--investa-text-primary, #212225);\n    border-radius: var(--investa-input-radius, 0.875rem);\n  }\n\n  input:not([type='checkbox'])::placeholder,\n  textarea::placeholder {\n    color: var(--investa-text-muted, #7b7d80);\n  }\n\n  input:focus,\n  select:focus,\n  textarea:focus {\n    border-color: var(--investa-accent, #22c532);\n    box-shadow: 0 0 0 3px rgba(34, 197, 50, 0.14);\n    --tw-ring-color: rgba(34, 197, 50, 0.14);\n  }\n\n  input[type='checkbox'] {\n    accent-color: var(--investa-accent, #22c532);\n  }\n\n  button.bg-blue-600,\n  button[class*='from-blue'],\n  a[class*='from-blue'],\n  button[class*='bg-gradient-to-r'],\n  a[class*='bg-gradient-to-r'] {\n    background: var(--investa-primary, #212225);\n    background-image: none;\n    border-color: var(--investa-primary, #212225);\n    color: #ffffff;\n  }\n\n  button.bg-blue-600:hover,\n  button[class*='from-blue']:hover,\n  a[class*='from-blue']:hover,\n  button[class*='bg-gradient-to-r']:hover,\n  a[class*='bg-gradient-to-r']:hover {\n    background: var(--investa-primary-hover, #151619);\n    border-color: var(--investa-primary-hover, #151619);\n    color: #ffffff;\n  }\n\n  button.bg-slate-700,\n  button.bg-slate-800 {\n    background: var(--investa-surface, #ffffff);\n    border: 1px solid var(--investa-border, #dedede);\n    color: var(--investa-text-primary, #212225);\n  }\n\n  button.bg-slate-700:hover,\n  button.bg-slate-800:hover {\n    background: var(--investa-surface-2, #f7f7f7);\n    color: var(--investa-text-primary, #212225);\n  }\n\n  button,\n  a {\n    border-radius: var(--investa-button-radius, 0.875rem);\n  }\n\n  .text-white,\n  [class*='text-white'] {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .text-blue-200,\n  .text-blue-300,\n  .text-blue-400,\n  .text-purple-300 {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .text-emerald-300,\n  .text-emerald-400,\n  .text-green-300,\n  .text-green-400 {\n    color: var(--investa-brand-700, #158322);\n  }\n\n  .text-amber-300,\n  .text-amber-400,\n  .text-yellow-300,\n  .text-orange-400 {\n    color: #a16207;\n  }\n\n  .text-red-300,\n  .text-red-400 {\n    color: #b91c1c;\n  }\n\n  .bg-blue-500\\/10,\n  .bg-purple-500\\/10 {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .rounded-full.bg-slate-800,\n  .rounded-md.bg-slate-700\\/70,\n  .rounded-xl.bg-slate-800\\/60 {\n    background: var(--investa-surface-2, #f7f7f7);\n    border-color: var(--investa-border, #dedede);\n    color: var(--investa-text-secondary, #66686b);\n  }\n\n  .h-1.w-full {\n    background: var(--investa-accent, #22c532);\n    background-image: none;\n  }\n\n  .w-full.bg-slate-700\\/50 {\n    background: var(--investa-surface-3, #eeeeee);\n  }\n\n  .w-full.bg-slate-700\\/50 > div,\n  [class*='from-emerald'],\n  [class*='from-green'],\n  [class*='from-cyan'],\n  [class*='from-blue'],\n  [class*='to-green'],\n  [class*='to-cyan'] {\n    --tw-gradient-from: var(--investa-accent, #22c532);\n    --tw-gradient-to: var(--investa-accent, #22c532);\n    background: var(--investa-accent, #22c532);\n    background-image: none;\n  }\n\n  .absolute.inset-0.bg-gradient-to-t {\n    background: linear-gradient(to top, rgba(21, 22, 25, 0.42), transparent);\n  }\n\n  .w-10.h-10.rounded-xl.bg-gradient-to-br {\n    background: var(--investa-primary, #212225);\n    background-image: none;\n  }\n\n  .fixed [class*='bg-slate'],\n  .fixed [class*='from-slate'],\n  .fixed [class*='to-slate'] {\n    background: var(--investa-surface, #ffffff);\n    background-image: none;\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .fixed .text-white {\n    color: var(--investa-text-primary, #212225);\n  }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvestmentsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-investments', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe], template: "<div class=\"container mx-auto p-6 lg:p-8\">\r\n  <div class=\"flex flex-col md:flex-row justify-between items-center mb-6 gap-4\">\r\n    <h1 class=\"text-3xl font-bold\">{{ pageTitle() }}</h1>\r\n    @if (!loading()) {\r\n      <div class=\"flex items-center gap-2\">\r\n        <button (click)=\"refresh()\" type=\"button\" \r\n                class=\"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2\">\r\n          <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"currentColor\">\r\n            <path fill-rule=\"evenodd\" d=\"M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z\" clip-rule=\"evenodd\" />\r\n          </svg>\r\n          {{ 'investments.refresh' | translate }}\r\n        </button>\r\n\r\n        <button (click)=\"exportCsv()\" type=\"button\" [title]=\"'investments.exportCsv' | translate\" \r\n                class=\"bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2\">\r\n          <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"currentColor\"><path d=\"M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V3z\"/></svg>\r\n          {{ 'investments.exportCsv' | translate }}\r\n        </button>\r\n      </div>\r\n    }\r\n  </div>\r\n\r\n  <!-- Error State -->\r\n  @if (error()) {\r\n    <div class=\"bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-6 animate-fade-in\">\r\n      <div class=\"flex items-center gap-3\">\r\n        <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-6 w-6 text-red-400\" viewBox=\"0 0 20 20\" fill=\"currentColor\">\r\n          <path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\" />\r\n        </svg>\r\n        <div>\r\n          <h3 class=\"text-lg font-semibold text-red-400\">{{ 'common.error' | translate }}</h3>\r\n          <p class=\"text-gray-300\">{{ error() }}</p>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  }\r\n\r\n  <!-- Loading State -->\r\n  @if (loading()) {\r\n    <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6 md:p-8\">\r\n      <div class=\"flex flex-col items-center justify-center py-20\">\r\n        <div class=\"animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4\"></div>\r\n        <p class=\"text-gray-400 text-lg\">{{ 'common.loading' | translate }}</p>\r\n      </div>\r\n    </div>\r\n  }\r\n\r\n  @if (!loading()) {\r\n    <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6 md:p-8\">\r\n    \r\n    <form [formGroup]=\"filterForm\">\r\n      <div class=\"mb-6 rounded-2xl border border-slate-800 bg-slate-950/35 p-4\">\r\n        <div class=\"grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_auto_minmax(220px,320px)_auto] gap-3 items-end\">\r\n          <div>\r\n            <label class=\"block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2\">Search</label>\r\n            <div class=\"relative\">\r\n              <input\r\n                type=\"text\"\r\n                [placeholder]=\"'investments.filterPlaceholder' | translate\"\r\n                formControlName=\"searchTerm\"\r\n                class=\"w-full bg-slate-900 border border-slate-700 rounded-xl shadow-sm py-2.5 ps-10 pe-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\"\r\n              >\r\n              <div class=\"absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none\">\r\n                <svg class=\"w-5 h-5 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\"></path></svg>\r\n              </div>\r\n            </div>\r\n          </div>\r\n\r\n          <div>\r\n            <label class=\"block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2\">Sort</label>\r\n            <button type=\"button\" class=\"h-[42px] w-full lg:w-auto px-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200 inline-flex items-center justify-center gap-2 text-sm font-semibold cursor-default\">\r\n              <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 5v14m0 0l-5-5m5 5l5-5\"/></svg>\r\n              Newest\r\n            </button>\r\n          </div>\r\n\r\n          <div>\r\n            <label class=\"block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2\">Category</label>\r\n            <select\r\n              class=\"w-full bg-slate-900 border border-slate-700 rounded-xl shadow-sm py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500\"\r\n              [value]=\"activeCategory()\"\r\n              (change)=\"selectCategory($any($event.target).value)\">\r\n              @for(cat of categories(); track cat) {\r\n                <option [value]=\"cat\">{{ getCategoryLabel(cat) }}</option>\r\n              }\r\n            </select>\r\n          </div>\r\n\r\n          <button (click)=\"toggleAdvancedSearch()\" type=\"button\" [title]=\"'investments.advancedSearch' | translate\" class=\"h-[42px] px-4 bg-slate-800 border border-slate-700 rounded-xl text-gray-300 hover:text-white hover:bg-slate-700 transition-colors inline-flex items-center justify-center gap-2\">\r\n            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"currentColor\"><path d=\"M5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z\"></path></svg>\r\n            <span class=\"text-sm font-semibold\">Filters</span>\r\n          </button>\r\n        </div>\r\n\r\n        @if (activeCategory() !== 'All') {\r\n          <div class=\"mt-4 flex flex-wrap items-center gap-2\">\r\n            <span class=\"inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300\">\r\n              Sorted by newest\r\n            </span>\r\n            <span class=\"inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-200\">\r\n              Category: {{ getCategoryLabel(activeCategory()) }}\r\n              <button type=\"button\" (click)=\"clearCategoryFilter()\" class=\"text-blue-200 hover:text-white\" aria-label=\"Clear category filter\">x</button>\r\n            </span>\r\n          </div>\r\n        } @else {\r\n          <div class=\"mt-4 flex flex-wrap items-center gap-2\">\r\n            <span class=\"inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300\">\r\n              Showing newest opportunities\r\n            </span>\r\n          </div>\r\n        }\r\n      </div>\r\n\r\n      <!-- Advanced Search Panel -->\r\n      @if (isAdvancedSearchOpen()) {\r\n        <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 animate-fade-in\">\r\n            <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end\">\r\n                <!-- Risk Level -->\r\n                <div formGroupName=\"riskLevels\">\r\n                    <h4 class=\"font-semibold text-white mb-3\">{{ 'investments.riskLevel' | translate }}</h4>\r\n                    <div class=\"flex items-center space-x-6 rtl:space-x-reverse\">\r\n                        <label class=\"flex items-center space-x-2 rtl:space-x-reverse text-gray-300 cursor-pointer\">\r\n                            <input type=\"checkbox\" formControlName=\"low\" class=\"h-4 w-4 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-600 rounded\">\r\n                            <span>{{ 'investments.risk.low' | translate }}</span>\r\n                        </label>\r\n                        <label class=\"flex items-center space-x-2 rtl:space-x-reverse text-gray-300 cursor-pointer\">\r\n                            <input type=\"checkbox\" formControlName=\"medium\" class=\"h-4 w-4 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-600 rounded\">\r\n                            <span>{{ 'investments.risk.medium' | translate }}</span>\r\n                        </label>\r\n                        <label class=\"flex items-center space-x-2 rtl:space-x-reverse text-gray-300 cursor-pointer\">\r\n                            <input type=\"checkbox\" formControlName=\"high\" class=\"h-4 w-4 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-600 rounded\">\r\n                            <span>{{ 'investments.risk.high' | translate }}</span>\r\n                        </label>\r\n                    </div>\r\n                </div>\r\n\r\n                <!-- Investment Type -->\r\n                <div formGroupName=\"investmentTypes\">\r\n                    <h4 class=\"font-semibold text-white mb-3\">{{ 'investments.typeFilter' | translate }}</h4>\r\n                    <div class=\"flex items-center space-x-6 rtl:space-x-reverse\">\r\n                        <label class=\"flex items-center space-x-2 rtl:space-x-reverse text-gray-300 cursor-pointer\">\r\n                            <input type=\"checkbox\" formControlName=\"founding\" class=\"h-4 w-4 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-600 rounded\">\r\n                            <span>{{ 'investments.type.founding' | translate }}</span>\r\n                        </label>\r\n                        <label class=\"flex items-center space-x-2 rtl:space-x-reverse text-gray-300 cursor-pointer\">\r\n                            <input type=\"checkbox\" formControlName=\"equity\" class=\"h-4 w-4 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-600 rounded\">\r\n                            <span>{{ 'investments.type.equity' | translate }}</span>\r\n                        </label>\r\n                    </div>\r\n                </div>\r\n\r\n                <!-- Funding Progress -->\r\n                <div>\r\n                    <h4 class=\"font-semibold text-white mb-3\">{{ 'investments.fundingProgress' | translate }} (%)</h4>\r\n                    <div class=\"flex items-center gap-2\">\r\n                        <input type=\"number\" formControlName=\"minFunding\" min=\"0\" max=\"100\" [placeholder]=\"'investments.min' | translate\" class=\"w-full bg-slate-700 border border-slate-600 rounded-md py-1.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500\">\r\n                        <span class=\"text-gray-400\">{{ 'investments.to' | translate }}</span>\r\n                        <input type=\"number\" formControlName=\"maxFunding\" min=\"0\" max=\"100\" [placeholder]=\"'investments.max' | translate\" class=\"w-full bg-slate-700 border border-slate-600 rounded-md py-1.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500\">\r\n                    </div>\r\n                </div>\r\n                \r\n                <!-- Favorites & Reset -->\r\n                <div class=\"flex items-end justify-between md:justify-end gap-4 flex-wrap\">\r\n                    <div>\r\n                        <h4 class=\"font-semibold text-white mb-3\">{{ 'investments.showOnly' | translate }}</h4>\r\n                        <label for=\"onlyFavorites\" class=\"flex items-center cursor-pointer\">\r\n                            <div class=\"relative\">\r\n                                <input type=\"checkbox\" formControlName=\"onlyFavorites\" id=\"onlyFavorites\" class=\"sr-only peer\">\r\n                                <div class=\"w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600\"></div>\r\n                            </div>\r\n                            <div class=\"ms-3 text-gray-300\">\r\n                                {{ 'investments.favorites' | translate }}\r\n                            </div>\r\n                        </label>\r\n                    </div>\r\n                    <button (click)=\"resetAdvancedFilters()\" type=\"button\" class=\"bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors\">\r\n                        {{ 'investments.reset' | translate }}\r\n                    </button>\r\n                </div>\r\n            </div>\r\n        </div>\r\n      }\r\n    </form>\r\n    \r\n    <!-- Investment Cards Grid (infinite scroll) -->\r\n    <div class=\"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8 min-h-[550px]\">\r\n      @for (investment of displayedInvestments(); track investment.name) {\r\n\r\n        @let progress = investment.fundingPercentage;\r\n\r\n        <article class=\"group relative flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-slate-500/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 animate-fade-in cursor-pointer\"\r\n                 (click)=\"navigateToDetails(investment)\">\r\n\r\n<!-- Status accent strip \u2014 colour-coded by status for instant recognition -->\r\n          <div class=\"h-1 w-full flex-shrink-0\"\r\n               [class]=\"investment.status === 'Active'                 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :\r\n                         investment.status === 'Funded' || investment.status === 'Fully Funded'  ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :\r\n                         investment.status === 'Reviewing Participants' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :\r\n                         investment.status === 'In Progress'            ? 'bg-gradient-to-r from-blue-500 to-purple-500' :\r\n                         investment.status === 'Completed'              ? 'bg-gradient-to-r from-green-500 to-teal-400' :\r\n                         investment.status === 'Paused'                 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :\r\n                         investment.status === 'Archived'               ? 'bg-gradient-to-r from-gray-500 to-slate-400' :\r\n                         investment.status === 'Closed'                 ? 'bg-gradient-to-r from-red-500 to-rose-400' :\r\n                                                                          'bg-slate-700'\">\r\n          </div>\r\n\r\n          <!-- Cover Image -->\r\n          <div class=\"relative h-48 overflow-hidden\">\r\n            <img [src]=\"getCoverImageUrl(investment)\" [alt]=\"investment.name\" class=\"w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300\" loading=\"lazy\">\r\n            <div class=\"absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent\"></div>\r\n          </div>\r\n\r\n          <!-- \u2500\u2500 Header: Founder + Quick Actions \u2500\u2500 -->\r\n          <div class=\"flex items-start justify-between px-5 pt-4 pb-3\">\r\n            <button type=\"button\" class=\"flex items-center gap-3 flex-1 min-w-0 text-start\" (click)=\"openFounderProfile(investment.founderId, $event)\" [disabled]=\"!investment.founderId\">\n              <!-- Avatar with live-dot for Active -->\r\n              <div class=\"relative flex-shrink-0\">\r\n                <div class=\"w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden\">\r\n                  @if (getFounderAvatarUrl(investment)) {\r\n                    <img [src]=\"getFounderAvatarUrl(investment)\"\r\n                         [alt]=\"investment.founderDisplay || 'Founder'\"\r\n                         (error)=\"onFounderAvatarError(investment.founderId)\"\r\n                         class=\"w-full h-full object-cover\">\r\n                  } @else {\r\n                    {{ investment.founderDisplay?.charAt(0)?.toUpperCase() || '?' }}\r\n                  }\r\n                </div>\r\n                @if (investment.status === 'Active') {\r\n                  <span class=\"absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm shadow-emerald-500/50\"></span>\r\n                }\r\n              </div>\r\n              <div class=\"min-w-0\">\r\n                <p class=\"text-sm font-semibold text-white truncate leading-tight\">{{ investment.founderDisplay || 'Unknown' }}</p>\r\n                <p class=\"text-xs text-gray-400 truncate mt-0.5\">{{ investment.businessRole || investment.businessCategoryName || '&nbsp;' }}</p>\r\n              </div>\r\n            </button>\n            <!-- Micro-actions: favorite + share -->\r\n            <div class=\"flex items-center gap-0.5 flex-shrink-0 ms-2 -mt-0.5\">\r\n              <button (click)=\"toggleFavorite(investment); $event.stopPropagation()\"\r\n                      [attr.aria-label]=\"'investments.addToFavorites' | translate\"\r\n                      class=\"p-1.5 rounded-lg transition-colors duration-200 hover:bg-white/5\"\r\n                      [class]=\"investment.favorited ? 'text-red-400' : 'text-gray-500 hover:text-red-400'\">\r\n                <svg class=\"w-4 h-4\" [attr.fill]=\"investment.favorited ? 'currentColor' : 'none'\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z\"/>\r\n                </svg>\r\n              </button>\r\n              <button [attr.aria-label]=\"'investments.share' | translate\"\r\n                      (click)=\"$event.stopPropagation()\"\r\n                      class=\"p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-white/5 transition-colors duration-200\">\r\n                <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z\"/>\r\n                </svg>\r\n              </button>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- \u2500\u2500 Title + Compact Badges \u2500\u2500 -->\r\n          <div class=\"px-5 pb-4\">\r\n            <h3 class=\"text-base font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors duration-200\">\r\n              {{ investment.name }}\r\n            </h3>\r\n            <!-- Badges: type \u00B7 risk \u00B7 category \u00B7 status -->\r\n            <div class=\"flex items-center gap-1.5 flex-wrap\">\r\n              @if (investment.investmentType) {\r\n                <span class=\"inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md\"\r\n                      [ngClass]=\"getInvestmentTypeBadgeClass(investment.investmentType)\">\r\n                  {{ getInvestmentTypeI18nKey(investment.investmentType) | translate }}\r\n                </span>\r\n              }\r\n              <span class=\"px-2 py-0.5 text-[11px] font-semibold rounded-md\"\r\n                    [class]=\"investment.riskLevel === RiskLevel.Low    ? 'bg-emerald-500/15 text-emerald-300' :\r\n                             investment.riskLevel === RiskLevel.Medium ? 'bg-amber-500/15  text-amber-300'   :\r\n                                                                         'bg-red-500/15    text-red-300'\">\r\n                {{ ('investments.risk.' + (investment.riskLevel | lowercase)) | translate }}\r\n              </span>\r\n              @if (investment.businessCategoryName) {\r\n                <span class=\"px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-700/70 text-gray-300\">\r\n                  {{ languageService.language() === 'ar' ? (investment.businessCategoryNameAr || investment.businessCategoryName) : investment.businessCategoryName }}\r\n                </span>\r\n              }\r\n<span class=\"ms-auto text-[11px] font-bold px-2 py-0.5 rounded-md border\"\r\n                      [ngClass]=\"{\r\n                        'bg-slate-600/30  text-gray-400   border-slate-600/30':                  investment.status === 'Draft',\r\n                        'bg-emerald-500/15 text-emerald-300 border-emerald-500/25':               investment.status === 'Active',\r\n                        'bg-amber-500/15   text-amber-300   border-amber-500/25':                 investment.status === 'Reviewing Participants',\r\n                        'bg-blue-500/15    text-blue-300    border-blue-500/25':                   investment.status === 'In Progress',\r\n                        'bg-cyan-500/15    text-cyan-300    border-cyan-500/25':                   investment.status === 'Fully Funded',\r\n                        'bg-yellow-500/15  text-yellow-300  border-yellow-500/25':                investment.status === 'Paused',\r\n                        'bg-green-500/15   text-green-300   border-green-500/25':                 investment.status === 'Completed',\r\n                        'bg-gray-500/15    text-gray-300    border-gray-500/25':                  investment.status === 'Archived',\r\n                        'bg-red-500/15     text-red-300     border-red-500/25':                   investment.status === 'Closed'\r\n                      }\">\r\n                  {{ ('investments.status.' + getStatusKey(investment.status)) | translate }}\r\n                </span>\r\n            </div>\r\n\r\n            <!-- Description -->\r\n            <p class=\"mt-3 text-gray-400 text-xs leading-relaxed line-clamp-2\" [title]=\"investment.description\">\r\n              {{ investment.description }}\r\n            </p>\r\n          </div>\r\n\r\n          <!-- \u2500\u2500 Key Metrics \u2014 2-tile grid \u2500\u2500 -->\r\n          <div class=\"mx-5 mb-4 grid grid-cols-2 gap-2\">\r\n            <!-- Tile 1: Target -->\r\n            <div class=\"rounded-xl bg-slate-800/60 border border-slate-700/30 p-3\">\r\n              <p class=\"text-[10px] uppercase tracking-wider text-gray-500 mb-1\">{{ 'investments.target' | translate }}</p>\r\n              <p class=\"text-sm font-bold text-white leading-none tabular-nums\">{{ investment.targetFund | number:'1.0-0' }}</p>\r\n              <p class=\"text-[10px] text-gray-500 mt-0.5\">{{ investment.currency || 'USD' }}</p>\r\n            </div>\r\n            <!-- Tile 2: ROI | Share Price | Min Investment | Score -->\r\n            @if (investment.investmentType === InvestmentType.Equity && investment.expectedROI && investment.expectedROI > 0) {\r\n              <div class=\"rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3\">\r\n                <p class=\"text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1\">{{ 'investments.roi' | translate }}</p>\r\n                <p class=\"text-sm font-bold text-emerald-300 leading-none\">{{ investment.expectedROI }}%</p>\r\n                <p class=\"text-[10px] text-emerald-400/50 mt-0.5\">{{ 'investmentPreview.annual' | translate }}</p>\r\n              </div>\r\n            } @else if (investment.sharePrice && investment.sharePrice > 0) {\r\n              <div class=\"rounded-xl bg-blue-500/10 border border-blue-500/20 p-3\">\r\n                <p class=\"text-[10px] uppercase tracking-wider text-blue-400/70 mb-1\">{{ 'investmentPreview.sharePrice' | translate }}</p>\r\n                <p class=\"text-sm font-bold text-blue-300 leading-none tabular-nums\">{{ investment.sharePrice | currency:(investment.currency || 'USD'):'symbol':'1.0-0' }}</p>\r\n                <p class=\"text-[10px] text-blue-400/50 mt-0.5\">{{ investment.availableShares | number:'1.0-0' }} {{ 'investmentPreview.available' | translate }}</p>\r\n              </div>\r\n            } @else if (investment.minInvestment && investment.minInvestment > 0) {\r\n              <div class=\"rounded-xl bg-purple-500/10 border border-purple-500/20 p-3\">\r\n                <p class=\"text-[10px] uppercase tracking-wider text-purple-400/70 mb-1\">{{ 'investments.min' | translate }}</p>\r\n                <p class=\"text-sm font-bold text-purple-300 leading-none tabular-nums\">{{ investment.minInvestment | currency:(investment.currency || 'USD'):'symbol':'1.0-0' }}</p>\r\n                <p class=\"text-[10px] text-purple-400/50 mt-0.5\">{{ 'investments.toInvest' | translate }}</p>\r\n              </div>\r\n            } @else {\r\n              <div class=\"rounded-xl bg-slate-800/60 border border-slate-700/30 p-3\">\r\n                <p class=\"text-[10px] uppercase tracking-wider text-gray-500 mb-1\">{{ 'investments.score' | translate }}</p>\r\n                <p class=\"text-sm font-bold text-white leading-none\">{{ investment.credibilityScore ?? 0 }}</p>\r\n                <p class=\"text-[10px] text-gray-500 mt-0.5\">credibility</p>\r\n              </div>\r\n            }\r\n          </div>\r\n\r\n          <!-- \u2500\u2500 Funding Progress \u2500\u2500 -->\r\n          <div class=\"px-5 mb-4\">\r\n            <div class=\"flex justify-between items-center mb-1.5\">\r\n              <span class=\"text-xs text-gray-400\">{{ 'investments.funding' | translate }}</span>\r\n              <div class=\"flex items-center gap-2\">\r\n                <!-- Urgency: days remaining coloured by proximity -->\r\n                @if (investment.endDate) {\r\n                  <span class=\"flex items-center gap-1 text-[11px] font-semibold\"\r\n                        [class]=\"getDaysRemaining(investment.endDate) <= 7   ? 'text-red-400' :\r\n                                 getDaysRemaining(investment.endDate) <= 30  ? 'text-amber-400' : 'text-gray-500'\">\r\n                    <svg class=\"w-3 h-3\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z\" clip-rule=\"evenodd\"/></svg>\r\n                    {{ getDaysRemaining(investment.endDate) }}d\r\n                  </span>\r\n                }\r\n                <span class=\"text-sm font-bold text-white tabular-nums\">{{ progress === null ? '\u2014' : ((progress | number:'1.0-0') + '%') }}</span>\r\n              </div>\r\n            </div>\r\n            <!-- Segmented progress track \u2014 colour shifts with progress amount -->\r\n            <div class=\"w-full bg-slate-700/50 rounded-full h-2 overflow-hidden\">\r\n              <div class=\"h-2 rounded-full transition-all duration-700 ease-out\"\r\n                   [style.width]=\"(progress === null ? 0 : (progress > 100 ? 100 : progress)) + '%'\"\r\n                   [class]=\"progress >= 100 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :\r\n                            progress >= 75  ? 'bg-gradient-to-r from-emerald-500 to-green-400' :\r\n                            progress >= 40  ? 'bg-gradient-to-r from-amber-400 to-orange-400' :\r\n                                              'bg-gradient-to-r from-slate-400 to-slate-500'\">\r\n              </div>\r\n            </div>\r\n<div class=\"flex justify-between mt-1.5\">\r\n              <span class=\"text-[11px] text-gray-400 tabular-nums\">{{ investment.currentFunding === null ? '\u2014' : (investment.currentFunding | number:'1.0-0') }} <span class=\"text-gray-600\">{{ investment.currency || '' }}</span></span>\r\n              @if (investment.targetFund) {\r\n                <span class=\"text-[11px] text-gray-500 tabular-nums\">{{ 'investments.target' | translate }} {{ investment.targetFund | number:'1.0-0' }}</span>\r\n              }\r\n            </div>\r\n            @if (investment.approvedContributionAmount != null) {\r\n              <div class=\"mt-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-3\">\r\n                <p class=\"text-[10px] uppercase tracking-wider text-blue-400/70 mb-1\">{{ 'investments.myParticipation.approvedContribution' | translate }}</p>\r\n                <p class=\"text-lg font-bold text-white tabular-nums\">{{ investment.approvedContributionAmount | number:'1.0-0' }} {{ investment.currency || 'USD' }}</p>\r\n              </div>\r\n              @if (investment.remainingFundingAmount != null) {\r\n                <div class=\"mt-2 flex items-center gap-1.5 text-[11px] text-gray-400\">\r\n                  <span>{{ 'investments.myParticipation.remainingToFund' | translate }} <strong class=\"text-white tabular-nums\">{{ investment.remainingFundingAmount | number:'1.0-0' }} {{ investment.currency || 'USD' }}</strong></span>\r\n                </div>\r\n              }\r\n              @if (investment.approvedParticipantCount != null) {\r\n                <div class=\"mt-1 flex items-center gap-1.5 text-[11px] text-gray-400\">\r\n                  <span>{{ 'investments.myParticipation.approvedParticipants' | translate }} <strong class=\"text-white tabular-nums\">{{ investment.approvedParticipantCount }}</strong></span>\r\n                </div>\r\n              }\r\n              @if (investment.investmentType === InvestmentType.Loan) {\r\n                <div class=\"mt-2 grid grid-cols-3 gap-2\">\r\n                  @if (investment.interestRate != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.loan.interestRate' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.interestRate }}%</p>\r\n                    </div>\r\n                  }\r\n                  @if (investment.expectedDurationMonths != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.loan.duration' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.expectedDurationMonths }}m</p>\r\n                    </div>\r\n                  }\r\n                  @if (investment.expectedTotalRepayment != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.loan.totalRepayment' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.expectedTotalRepayment | number:'1.0-0' }}</p>\r\n                    </div>\r\n                  }\r\n                </div>\r\n              }\r\n              @if (investment.investmentType === InvestmentType.Equity) {\r\n                <div class=\"mt-2 grid grid-cols-3 gap-2\">\r\n                  @if (investment.approvedShares != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.equity.shares' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.approvedShares | number }}</p>\r\n                    </div>\r\n                  }\r\n                  @if (investment.ownershipPercentage != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.equity.ownership' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.ownershipPercentage }}%</p>\r\n                    </div>\r\n                  }\r\n                  @if (investment.remainingShares != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.equity.remaining' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.remainingShares | number }}</p>\r\n                    </div>\r\n                  }\r\n                </div>\r\n              }\r\n              @if (investment.investmentType === InvestmentType.RevenueSharing) {\r\n                <div class=\"mt-2 grid grid-cols-3 gap-2\">\r\n                  @if (investment.profitSharePercentage != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.profitSharing.share' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.profitSharePercentage }}%</p>\r\n                    </div>\r\n                  }\r\n                  @if (investment.payoutFrequency) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.profitSharing.payoutFrequency' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.payoutFrequency }}</p>\r\n                    </div>\r\n                  }\r\n                  @if (investment.expectedTotalPayout != null) {\r\n                    <div class=\"rounded-lg bg-slate-800/60 border border-slate-700/30 p-2 text-center\">\r\n                      <p class=\"text-[9px] uppercase tracking-wider text-gray-500\">{{ 'investments.myParticipation.profitSharing.totalPayout' | translate }}</p>\r\n                      <p class=\"text-xs font-bold text-white tabular-nums\">{{ investment.expectedTotalPayout | number:'1.0-0' }}</p>\r\n                    </div>\r\n                  }\r\n                </div>\r\n              }\r\n            } @else if (investment.investmentModel === 'Equity' || investment.investmentModel === 1) {\r\n              <div class=\"mt-3 grid grid-cols-2 gap-2 text-[11px]\">\r\n                <span class=\"text-gray-400\">{{ 'investmentPreview.sharesOffered' | translate }} <strong class=\"text-white\">{{ investment.offeredShares == null ? '\u2014' : (investment.offeredShares | number) }}</strong></span>\r\n                <span class=\"text-gray-400\">{{ 'investmentPreview.sharesSold' | translate }} <strong class=\"text-white\">{{ investment.soldShares == null ? '\u2014' : (investment.soldShares | number) }}</strong></span>\r\n                <span class=\"text-gray-400\">{{ 'investmentPreview.sharesRemaining' | translate }} <strong class=\"text-white\">{{ investment.remainingShares == null ? '\u2014' : (investment.remainingShares | number) }}</strong></span>\r\n                <span class=\"text-gray-400\">{{ 'investmentPreview.equityAllocated' | translate }} <strong class=\"text-white\">{{ investment.allocatedEquityPercentage == null ? '\u2014' : ((investment.allocatedEquityPercentage | number:'1.0-2') + '%') }}</strong></span>\r\n              </div>\r\n            }\r\n          </div>\r\n\r\n          <!-- \u2500\u2500 Social Proof: Investors + Credibility \u2500\u2500 -->\r\n          <div class=\"px-5 pb-4 flex items-center justify-between\">\r\n            @if (investment.investorCount && investment.investorCount > 0) {\r\n              <div class=\"flex items-center gap-2\">\r\n                <div class=\"flex -space-x-1.5\">\r\n                  @for (p of (investment.investors || []).slice(0, 4); track p.investorId) {\r\n                    @if (p && !p.isAnonymous) {\r\n                      <button type=\"button\" (click)=\"openInvestorProfile(p.investorId); $event.stopPropagation()\" class=\"focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full\">\r\n                        @if (p.investorAvatar) {\r\n                          <img [src]=\"p.investorAvatar\" [alt]=\"p.investorName || 'Investor'\"\r\n                               class=\"w-6 h-6 rounded-full border-2 border-slate-900 object-cover hover:scale-110 transition-transform\"\r\n                               [title]=\"p.investorName\">\r\n                        } @else {\r\n                          <div class=\"w-6 h-6 rounded-full border-2 border-slate-900 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold hover:scale-110 transition-transform\"\r\n                               [title]=\"p.investorName\">\r\n                            {{ (p.investorName || '?').charAt(0).toUpperCase() }}\r\n                          </div>\r\n                        }\r\n                      </button>\r\n                    } @else {\r\n                      <div class=\"w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-gray-400 text-[9px] font-bold\" [title]=\"'investments.anonymousInvestor' | translate\">?</div>\r\n                    }\r\n                  }\r\n                  @if (investment.investorCount > 4) {\r\n                    <div class=\"w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-gray-300 text-[9px] font-bold\">+{{ investment.investorCount - 4 }}</div>\r\n                  }\r\n                </div>\r\n                <span class=\"text-[11px] text-gray-400\">{{ investment.investorCount }} {{ t(investment.investorCount === 1 ? 'investments.investor' : 'investments.investors', investment.investorCount === 1 ? 'investor' : 'investors') }}</span>\r\n              </div>\r\n            } @else {\r\n              <span class=\"text-[11px] text-gray-600 italic\">{{ 'investments.beFirstInvestor' | translate }}</span>\r\n            }\r\n            <!-- Credibility score pill -->\r\n            <div class=\"flex items-center gap-1 bg-slate-800/60 border border-slate-700/40 rounded-full px-2 py-1\">\r\n              <svg class=\"w-3 h-3 text-amber-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path d=\"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z\"/></svg>\r\n              <span class=\"text-[11px] font-semibold text-gray-300\">{{ investment.credibilityScore ?? 0 }}</span>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- \u2500\u2500 Primary CTA \u2014 full-width, state-aware (Public Opportunities only) \u2500\u2500 -->\r\n            @if (investment.approvedContributionAmount == null) {\r\n              <div class=\"mt-auto px-4 pb-4\">\r\n                <button\r\n                  (click)=\"navigateToDetails(investment); $event.stopPropagation()\"\r\n                  class=\"w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2\"\r\n                  [disabled]=\"\r\n                    investment.status === 'Fully Funded' ||\r\n                    investment.status === 'Completed' ||\r\n                    investment.status === 'Archived' ||\r\n                    investment.status === 'Paused'\r\n                  \"\r\n                  [ngClass]=\"{\r\n                    'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-purple-500/30 focus:ring-purple-500 active:scale-[0.98]':\r\n                      investment.status === 'Active' ||\r\n                      investment.status === 'Reviewing Participants' ||\r\n                      investment.status === 'In Progress',\r\n\r\n                    'bg-slate-700/50 text-gray-500 border border-slate-600/40 cursor-not-allowed':\r\n                      investment.status === 'Fully Funded' ||\r\n                      investment.status === 'Completed' ||\r\n                      investment.status === 'Archived' ||\r\n                      investment.status === 'Paused',\r\n\r\n                    'bg-slate-700/50 hover:bg-slate-700 text-gray-300 border border-slate-600/40 focus:ring-slate-500':\r\n                      investment.status === 'Draft'\r\n                  }\"\r\n                >\r\n                  @if (\r\n                    investment.status === 'Fully Funded' ||\r\n                    investment.status === 'Completed' ||\r\n                    investment.status === 'Archived'\r\n                  ) {\r\n                    <svg class=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n                      <path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-6.707a1 1 0 011.414-1.414L11 11.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-1-1z\" clip-rule=\"evenodd\"/>\r\n                    </svg>\r\n                    {{ 'investmentPreview.fullyFunded' | translate }}\r\n                  } @else if (investment.status === 'Paused') {\r\n                    <svg class=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n                      <path fill-rule=\"evenodd\" d=\"M6 2a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm8 0a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1z\" clip-rule=\"evenodd\"/>\r\n                    </svg>\r\n                    {{ 'investmentPreview.learnMore' | translate }}\r\n                  } @else {\r\n                    {{ 'investmentPreview.learnMore' | translate }}\r\n                    <svg class=\"w-4 h-4 group-hover:translate-x-0.5 transition-transform\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n                      <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13 7l5 5m0 0l-5 5m5-5H6\"/>\r\n                    </svg>\r\n                  }\r\n                </button>\r\n              </div>\r\n            }\r\n\r\n            <!-- MyParticipation actions: Project Room / Contract -->\r\n            @if (investment.approvedContributionAmount != null) {\r\n              <div class=\"mt-2 grid grid-cols-2 gap-2\">\r\n                @if (investment.canOpenProjectRoom) {\r\n                  <button\r\n                    (click)=\"openProjectRoom(investment); $event.stopPropagation()\"\r\n                    class=\"w-full py-2 rounded-xl text-sm font-medium text-white bg-slate-700/50 border border-slate-600/40 hover:bg-slate-700 hover:border-slate-500/50 transition-colors flex items-center justify-center gap-1.5\"\r\n                  >\r\n                    <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n                      <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z\"/>\r\n                    </svg>\r\n                    {{ 'investments.projectRoom' | translate }}\r\n                  </button>\r\n                }\r\n                @if (investment.contractAvailable) {\r\n                  <button\r\n                    (click)=\"openContract(investment); $event.stopPropagation()\"\r\n                    class=\"w-full py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-colors flex items-center justify-center gap-1.5\"\r\n                  >\r\n                    <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n                      <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\"/>\r\n                    </svg>\r\n                    {{ 'investments.contract' | translate }}\r\n                  </button>\r\n                }\r\n              </div>\r\n            }\r\n        </article>\r\n\r\n      } @empty {\r\n        <div class=\"col-span-full text-center py-20 text-gray-500 animate-fade-in flex flex-col items-center justify-center\">\r\n          <svg class=\"mx-auto h-12 w-12\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" aria-hidden=\"true\">\r\n            <path vector-effect=\"non-scaling-stroke\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z\" />\r\n          </svg>\r\n          <h3 class=\"mt-2 text-sm font-semibold text-white\">{{ emptyTitle() }}</h3>\r\n          <p class=\"mt-1 text-sm text-gray-500\">{{ emptySubtitle() }}</p>\r\n        </div>\r\n      }\r\n    </div>\r\n    \r\n    <!-- Infinite scroll sentinel -->\r\n    <div class=\"flex justify-center items-center mt-8 pt-6 border-t border-slate-800\">\r\n      <div id=\"investments-load-more\" class=\"py-4\">\r\n        <button *ngIf=\"displayedInvestments().length < filteredInvestments().length\" (click)=\"loadMore()\" class=\"bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-full transition-colors\">\r\n          Load more\r\n        </button>\r\n        <div *ngIf=\"displayedInvestments().length >= filteredInvestments().length\" class=\"text-gray-400\">All results loaded</div>\r\n      </div>\r\n    </div>\r\n    \r\n    </div>\r\n  }\r\n@if (investmentToEngage(); as investment) {\r\n  <div class=\"fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in\" style=\"animation-duration: 0.2s;\">\r\n    <div class=\"bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg m-4 p-8 text-center animate-fade-in\" style=\"animation-delay: 0.1s; animation-duration: 0.3s;\">\r\n      <div class=\"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500/30\">\r\n        <svg class=\"w-8 h-8 text-blue-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />\r\n        </svg>\r\n      </div>\r\n      <h3 class=\"text-xl font-bold text-white mt-5\">{{ 'investments.engageModal.title' | translate }}</h3>\r\n      <p class=\"text-gray-400 mt-2\" [innerHTML]=\"('investments.engageModal.message' | translate)\r\n        .replace('{investmentName}', '<span class=\\'font-bold text-white\\'>' + investment.name + '</span>')\r\n        .replace('{creditCost}', '<span class=\\'font-bold text-white\\'>' + engagementCreditCost + '</span>')\">\r\n      </p>\r\n      <div class=\"mt-8 flex justify-center gap-4\">\r\n        <button (click)=\"cancelEngage()\" class=\"bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-6 rounded-full transition-colors\">\r\n          {{ 'investments.engageModal.cancelButton' | translate }}\r\n        </button>\r\n        <button (click)=\"confirmEngage()\" [disabled]=\"engagementProcessing()\"\r\n                class=\"bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\">\r\n          @if (engagementProcessing()) {\r\n            <svg class=\"animate-spin h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\">\r\n              <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\r\n              <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\r\n            </svg>\r\n            {{ 'common.processing' | translate }}\r\n          } @else {\r\n            {{ 'investments.engageModal.proceedButton' | translate }}\r\n          }\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n}\r\n\r\n<!-- Participate / Invest Dialog -->\r\n@if (investmentToInvest(); as investment) {\r\n  <div class=\"fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in\" (click)=\"closeInvestDialog()\">\r\n    <div class=\"bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in\" (click)=\"$event.stopPropagation()\">\r\n      <!-- Header -->\r\n      <div class=\"p-6 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10\">\r\n        <div class=\"flex items-center justify-between\">\r\n          <div>\r\n            <h3 class=\"text-2xl font-bold text-white\">Participate in {{ investment.name }}</h3>\r\n            <p class=\"text-sm text-gray-400 mt-1\">{{ investment.founderDisplay }}</p>\r\n          </div>\r\n          <button (click)=\"closeInvestDialog()\" class=\"text-gray-400 hover:text-white transition-colors\">\r\n            <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path>\r\n            </svg>\r\n          </button>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- Body -->\r\n      <div class=\"p-6 space-y-5\">\r\n        <!-- Share Price Info -->\r\n        <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4\">\r\n          <div class=\"grid grid-cols-2 gap-4\">\r\n            <div>\r\n              <p class=\"text-xs text-gray-400 uppercase tracking-wide mb-1\">Share Price</p>\r\n              <p class=\"text-2xl font-bold text-white\">{{ investment.sharePrice | currency:(investment.currency || 'USD') }}</p>\r\n            </div>\r\n            <div class=\"text-right\">\r\n              <p class=\"text-xs text-gray-400 uppercase tracking-wide mb-1\">Available</p>\r\n              <p class=\"text-xl font-semibold text-blue-300\">{{ investment.availableShares | number }}</p>\r\n            </div>\r\n          </div>\r\n          @if (investment.minInvestment || investment.maxInvestment) {\r\n            <div class=\"mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-gray-400\">\r\n              @if (investment.minInvestment) {\r\n                <span>Min: {{ investment.minInvestment | currency:(investment.currency || 'USD'):'symbol':'1.0-0' }}</span>\r\n              }\r\n              @if (investment.maxInvestment) {\r\n                <span>Max: {{ investment.maxInvestment | currency:(investment.currency || 'USD'):'symbol':'1.0-0' }}</span>\r\n              }\r\n            </div>\r\n          }\r\n        </div>\r\n\r\n        <!-- Shares Input -->\r\n        <div>\r\n          <label class=\"block text-sm font-medium text-gray-300 mb-2\">Number of Shares</label>\r\n          <div class=\"flex items-center gap-3\">\r\n            <button (click)=\"decreaseShares()\" [disabled]=\"sharesToPurchase() <= 1\" \r\n                    class=\"bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold w-10 h-10 rounded-lg transition-colors\">\r\n              <svg class=\"w-5 h-5 mx-auto\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M20 12H4\"></path>\r\n              </svg>\r\n            </button>\r\n            <input type=\"number\" \r\n                   [(ngModel)]=\"sharesToPurchaseValue\" \r\n                   (change)=\"validateShares(investment)\"\r\n                   min=\"1\" \r\n                   [max]=\"investment.availableShares\"\r\n                   class=\"flex-1 bg-slate-800 border border-slate-600 rounded-lg py-3 px-4 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500\">\r\n            <button (click)=\"increaseShares(investment)\" [disabled]=\"sharesToPurchase() >= (investment.availableShares || 0)\"\r\n                    class=\"bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold w-10 h-10 rounded-lg transition-colors\">\r\n              <svg class=\"w-5 h-5 mx-auto\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4v16m8-8H4\"></path>\r\n              </svg>\r\n            </button>\r\n          </div>\r\n          <p class=\"text-xs text-gray-400 mt-2 text-center\">Available: {{ investment.availableShares | number }} shares</p>\r\n        </div>\r\n\r\n        <!-- Participation Summary -->\r\n        <div class=\"bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4\">\r\n          <div class=\"flex items-center justify-between mb-2\">\r\n            <span class=\"text-gray-300\">Total Participation:</span>\r\n            <span class=\"text-2xl font-bold text-white\">{{ calculateRequestedAmount(investment) | currency:(investment.currency || 'USD') }}</span>\r\n          </div>\r\n          @if (investment.expectedROI && investment.expectedROI > 0) {\r\n            <div class=\"flex items-center justify-between text-sm\">\r\n              <span class=\"text-gray-400\">Expected ROI:</span>\r\n              <span class=\"text-green-300 font-semibold\">{{ investment.expectedROI }}%</span>\r\n            </div>\r\n          }\r\n        </div>\r\n\r\n        <!-- Error/Warning Messages -->\r\n        @if (investmentError()) {\r\n          <div class=\"bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2\">\r\n            <svg class=\"w-5 h-5 text-red-400 flex-shrink-0\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n              <path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\"/>\r\n            </svg>\r\n            <p class=\"text-sm text-red-300\">{{ investmentError() }}</p>\r\n          </div>\r\n        }\r\n      </div>\r\n\r\n      <!-- Footer -->\r\n      <div class=\"p-6 border-t border-slate-700 flex items-center justify-between bg-slate-800/50\">\r\n        <button (click)=\"closeInvestDialog()\" class=\"bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors\">\r\n          Cancel\r\n        </button>\r\n        <button (click)=\"showConfirmationDialog(investment)\" [disabled]=\"!!investmentError() || investmentProcessing()\"\r\n                class=\"bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\">\r\n          @if (investmentProcessing()) {\r\n            <svg class=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">\r\n              <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\r\n              <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\r\n            </svg>\r\n            Processing...\r\n          } @else {\r\n            <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"></path>\r\n            </svg>\r\n            Confirm Participation\r\n          }\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n}\r\n\r\n<!-- Participation Confirmation Dialog -->\r\n@if (investmentConfirmationOpen(); as _) {\r\n  <div class=\"fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in\" (click)=\"cancelConfirmation()\">\r\n    <div class=\"bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in\" (click)=\"$event.stopPropagation()\">\r\n      <!-- Header -->\r\n      <div class=\"p-6 border-b border-slate-700 bg-gradient-to-r from-orange-500/10 to-red-500/10\">\r\n        <h3 class=\"text-2xl font-bold text-white\">{{ 'investments.confirmDialog.title' | translate }}</h3>\r\n        <p class=\"text-sm text-gray-400 mt-1\">{{ 'investments.confirmDialog.subtitle' | translate }}</p>\r\n      </div>\r\n\r\n      <!-- Body -->\r\n      <div class=\"p-6 space-y-5\">\r\n        <!-- Participation Summary -->\r\n        @if (investmentToInvest(); as investment) {\r\n          <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3\">\r\n            <div class=\"flex items-center justify-between\">\r\n              <span class=\"text-gray-300\">{{ 'investments.confirmDialog.investmentLabel' | translate }}</span>\r\n              <span class=\"text-lg font-semibold text-white\">{{ investment.name }}</span>\r\n            </div>\r\n            <div class=\"flex items-center justify-between\">\r\n              <span class=\"text-gray-300\">{{ 'investments.confirmDialog.sharesLabel' | translate }}</span>\r\n              <span class=\"text-lg font-semibold text-blue-300\">{{ sharesToPurchase() }}</span>\r\n            </div>\r\n            <div class=\"border-t border-slate-700 pt-3 flex items-center justify-between\">\r\n              <span class=\"text-gray-300 font-medium\">{{ 'investments.confirmDialog.totalCostLabel' | translate }}</span>\r\n              <span class=\"text-2xl font-bold text-white\">{{ calculateRequestedAmount(investment) | currency:(investment.currency || 'USD') }}</span>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- Confirmation Message -->\r\n          <div class=\"bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-start gap-3\">\r\n            <svg class=\"w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n              <path fill-rule=\"evenodd\" d=\"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z\" clip-rule=\"evenodd\"/>\r\n            </svg>\r\n            <div>\r\n              <p class=\"text-sm font-semibold text-orange-300\">{{ 'investments.confirmDialog.warning' | translate }}</p>\r\n              <p class=\"text-xs text-orange-200 mt-1\">{{ 'investments.confirmDialog.warningMessage' | translate }}</p>\r\n            </div>\r\n          </div>\r\n        }\r\n      </div>\r\n\r\n      <!-- Footer -->\r\n      <div class=\"p-6 border-t border-slate-700 flex items-center justify-between gap-3 bg-slate-800/50\">\r\n        <button (click)=\"cancelConfirmation()\" class=\"flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors\">\r\n          {{ 'common.cancel' | translate }}\r\n        </button>\r\n        @if (investmentToInvest(); as investment) {\r\n          <button (click)=\"proceedWithInvestment(investment)\" [disabled]=\"investmentProcessing()\"\r\n                  class=\"flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2\">\r\n          @if (investmentProcessing()) {\r\n            <svg class=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">\r\n              <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\r\n              <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\r\n            </svg>\r\n            {{ 'common.processing' | translate }}\r\n          } @else {\r\n            <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"></path>\r\n            </svg>\r\n            {{ 'investments.confirmDialog.confirmButton' | translate }}\r\n          }\r\n          </button>\r\n        }\r\n      </div>\r\n    </div>\r\n  </div>\r\n}\r\n", styles: ["@use 'variables' as *;\r\n@use 'mixins' as *;\n\n.investments { padding: $spacing-6; }\n.investment-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: $spacing-6; }\n\n:host {\n  display: block;\n  min-height: 100vh;\n}\n\n:host-context(body.investa-theme-light) {\n  color: var(--investa-text-primary, #212225);\n  background: var(--investa-bg, #e8e8e8);\n\n  .container {\n    max-width: 1440px;\n  }\n\n  h1,\n  h3,\n  h4,\n  .font-bold,\n  .font-semibold {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  p,\n  label,\n  .text-gray-300,\n  .text-gray-400,\n  .text-slate-300,\n  .text-slate-400 {\n    color: var(--investa-text-secondary, #66686b);\n  }\n\n  .text-gray-500,\n  .text-slate-500,\n  .text-gray-600 {\n    color: var(--investa-text-muted, #7b7d80);\n  }\n\n  [class*='bg-slate-900'],\n  [class*='bg-slate-950'],\n  [class*='bg-slate-800'],\n  [class*='bg-slate-700'],\n  [class*='bg-gray-900'],\n  [class*='bg-gray-800'] {\n    background: var(--investa-surface, #ffffff);\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .bg-slate-950\\/35,\n  .bg-slate-800\\/50,\n  .bg-slate-800\\/60,\n  .bg-slate-700\\/50,\n  .bg-slate-700\\/70,\n  .bg-blue-500\\/10,\n  .bg-purple-500\\/10,\n  .bg-emerald-500\\/10 {\n    background: var(--investa-surface-2, #f7f7f7);\n  }\n\n  [class*='border-slate'],\n  [class*='border-gray'],\n  .border-blue-500\\/20,\n  .border-blue-500\\/30,\n  .border-purple-500\\/20,\n  .border-emerald-500\\/20 {\n    border-color: var(--investa-border, #dedede);\n  }\n\n  .shadow-2xl {\n    box-shadow: var(--investa-shadow-sm, 0 1px 2px rgba(21, 22, 25, 0.05));\n  }\n\n  article.group,\n  .rounded-xl.border,\n  .rounded-2xl.border {\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n    box-shadow: var(--investa-shadow-sm, 0 1px 2px rgba(21, 22, 25, 0.05));\n  }\n\n  article.group:hover {\n    border-color: var(--investa-border-strong, #cfcfcf);\n    box-shadow: var(--investa-shadow-md, 0 10px 28px rgba(21, 22, 25, 0.08));\n  }\n\n  input:not([type='checkbox']),\n  select,\n  textarea {\n    min-height: var(--investa-input-height, 2.75rem);\n    background: var(--investa-surface, #ffffff);\n    border-color: var(--investa-border, #dedede);\n    color: var(--investa-text-primary, #212225);\n    border-radius: var(--investa-input-radius, 0.875rem);\n  }\n\n  input:not([type='checkbox'])::placeholder,\n  textarea::placeholder {\n    color: var(--investa-text-muted, #7b7d80);\n  }\n\n  input:focus,\n  select:focus,\n  textarea:focus {\n    border-color: var(--investa-accent, #22c532);\n    box-shadow: 0 0 0 3px rgba(34, 197, 50, 0.14);\n    --tw-ring-color: rgba(34, 197, 50, 0.14);\n  }\n\n  input[type='checkbox'] {\n    accent-color: var(--investa-accent, #22c532);\n  }\n\n  button.bg-blue-600,\n  button[class*='from-blue'],\n  a[class*='from-blue'],\n  button[class*='bg-gradient-to-r'],\n  a[class*='bg-gradient-to-r'] {\n    background: var(--investa-primary, #212225);\n    background-image: none;\n    border-color: var(--investa-primary, #212225);\n    color: #ffffff;\n  }\n\n  button.bg-blue-600:hover,\n  button[class*='from-blue']:hover,\n  a[class*='from-blue']:hover,\n  button[class*='bg-gradient-to-r']:hover,\n  a[class*='bg-gradient-to-r']:hover {\n    background: var(--investa-primary-hover, #151619);\n    border-color: var(--investa-primary-hover, #151619);\n    color: #ffffff;\n  }\n\n  button.bg-slate-700,\n  button.bg-slate-800 {\n    background: var(--investa-surface, #ffffff);\n    border: 1px solid var(--investa-border, #dedede);\n    color: var(--investa-text-primary, #212225);\n  }\n\n  button.bg-slate-700:hover,\n  button.bg-slate-800:hover {\n    background: var(--investa-surface-2, #f7f7f7);\n    color: var(--investa-text-primary, #212225);\n  }\n\n  button,\n  a {\n    border-radius: var(--investa-button-radius, 0.875rem);\n  }\n\n  .text-white,\n  [class*='text-white'] {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .text-blue-200,\n  .text-blue-300,\n  .text-blue-400,\n  .text-purple-300 {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .text-emerald-300,\n  .text-emerald-400,\n  .text-green-300,\n  .text-green-400 {\n    color: var(--investa-brand-700, #158322);\n  }\n\n  .text-amber-300,\n  .text-amber-400,\n  .text-yellow-300,\n  .text-orange-400 {\n    color: #a16207;\n  }\n\n  .text-red-300,\n  .text-red-400 {\n    color: #b91c1c;\n  }\n\n  .bg-blue-500\\/10,\n  .bg-purple-500\\/10 {\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .rounded-full.bg-slate-800,\n  .rounded-md.bg-slate-700\\/70,\n  .rounded-xl.bg-slate-800\\/60 {\n    background: var(--investa-surface-2, #f7f7f7);\n    border-color: var(--investa-border, #dedede);\n    color: var(--investa-text-secondary, #66686b);\n  }\n\n  .h-1.w-full {\n    background: var(--investa-accent, #22c532);\n    background-image: none;\n  }\n\n  .w-full.bg-slate-700\\/50 {\n    background: var(--investa-surface-3, #eeeeee);\n  }\n\n  .w-full.bg-slate-700\\/50 > div,\n  [class*='from-emerald'],\n  [class*='from-green'],\n  [class*='from-cyan'],\n  [class*='from-blue'],\n  [class*='to-green'],\n  [class*='to-cyan'] {\n    --tw-gradient-from: var(--investa-accent, #22c532);\n    --tw-gradient-to: var(--investa-accent, #22c532);\n    background: var(--investa-accent, #22c532);\n    background-image: none;\n  }\n\n  .absolute.inset-0.bg-gradient-to-t {\n    background: linear-gradient(to top, rgba(21, 22, 25, 0.42), transparent);\n  }\n\n  .w-10.h-10.rounded-xl.bg-gradient-to-br {\n    background: var(--investa-primary, #212225);\n    background-image: none;\n  }\n\n  .fixed [class*='bg-slate'],\n  .fixed [class*='from-slate'],\n  .fixed [class*='to-slate'] {\n    background: var(--investa-surface, #ffffff);\n    background-image: none;\n    color: var(--investa-text-primary, #212225);\n  }\n\n  .fixed .text-white {\n    color: var(--investa-text-primary, #212225);\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvestmentsComponent, { className: "InvestmentsComponent", filePath: "src/app/pages/admin/investments/investments.component.ts", lineNumber: 138 }); })();
