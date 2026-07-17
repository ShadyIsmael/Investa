import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { RoleContextService } from '../../../services/role-context.service';
import { FileStoreService } from '../../../services/file-store.service';
import { OpportunityRequestKind } from '../../../models/request.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = a0 => [a0];
const _forTrack0 = ($index, $item) => $item.id;
function RequestsComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "lowercase");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", ctx_r0.incomingCount(), " ", i0.ɵɵpipeBind1(2, 4, i0.ɵɵpipeBind1(1, 2, "requests.incoming")), " ");
} }
function RequestsComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "lowercase");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", ctx_r0.outgoingCount(), " ", i0.ɵɵpipeBind1(2, 4, i0.ɵɵpipeBind1(1, 2, "requests.outgoing")), " ");
} }
function RequestsComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 32);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-white/20", ctx_r0.tab() === "incoming")("bg-slate-700", ctx_r0.tab() !== "incoming")("text-white", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.incomingCount());
} }
function RequestsComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 32);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-white/20", ctx_r0.tab() === "outgoing")("bg-slate-700", ctx_r0.tab() !== "outgoing")("text-white", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.outgoingCount());
} }
function RequestsComponent_Conditional_101_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 36)(1, "h2", 73);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 74);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵpipe(6, "lowercase");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getSectionTitle(request_r2));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r0.getSectionCount(request_r2), " ", i0.ɵɵpipeBind1(6, 5, i0.ɵɵpipeBind1(5, 3, "requests.filters.requests")));
} }
function RequestsComponent_Conditional_101_For_2_Conditional_48_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 77);
    i0.ɵɵtext(1, " Investment Model: Loan ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 78)(3, "div", 79)(4, "p", 80);
    i0.ɵɵtext(5, "Contribution Amount");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 81);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 79)(10, "p", 80);
    i0.ɵɵtext(11, "Return Rate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 81);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 79)(15, "p", 80);
    i0.ɵɵtext(16, "Term");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 81);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 79)(20, "p", 80);
    i0.ɵɵtext(21, "Repayment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p", 81);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 79)(25, "p", 80);
    i0.ɵɵtext(26, "Expected Return");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 81);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div", 79)(31, "p", 80);
    i0.ɵɵtext(32, "Total Repayment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "p", 81);
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "number");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r2 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r2), " ", i0.ɵɵpipeBind2(8, 9, ctx_r0.getLoanContributionAmount(request_r2), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.getLoanReturnRate(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getLoanTerm(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getLoanRepaymentModel(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r2), " ", i0.ɵɵpipeBind2(29, 12, ctx_r0.getLoanExpectedReturn(request_r2), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r2), " ", i0.ɵɵpipeBind2(35, 15, ctx_r0.getLoanExpectedTotalRepayment(request_r2), "1.2-2"));
} }
function RequestsComponent_Conditional_101_For_2_Conditional_48_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 82);
    i0.ɵɵtext(1, " Investment Model: Profit Sharing ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 78)(3, "div", 79)(4, "p", 80);
    i0.ɵɵtext(5, "Contribution Amount");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 81);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 79)(10, "p", 80);
    i0.ɵɵtext(11, "Profit Share %");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 81);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 79)(15, "p", 80);
    i0.ɵɵtext(16, "Duration / Term");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 81);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 79)(20, "p", 80);
    i0.ɵɵtext(21, "Exit Terms");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p", 81);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 79)(25, "p", 80);
    i0.ɵɵtext(26, "Expected Profit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 81);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "div", 79)(30, "p", 80);
    i0.ɵɵtext(31, "Expected Payout");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "p", 81);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 79)(35, "p", 80);
    i0.ɵɵtext(36, "Opportunity Payout");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "p", 81);
    i0.ɵɵtext(38);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(39, "div", 79)(40, "p", 80);
    i0.ɵɵtext(41, "Contract Period");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "p", 81);
    i0.ɵɵtext(43);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r2 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r2), " ", i0.ɵɵpipeBind2(8, 9, ctx_r0.getProfitSharingContributionAmount(request_r2), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharePercentage(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharingTerm(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharingExitTerms(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatOptionalMoney(request_r2, ctx_r0.getProfitSharingExpectedProfit(request_r2)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatOptionalMoney(request_r2, ctx_r0.getProfitSharingExpectedTotalPayout(request_r2)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatOptionalMoney(request_r2, ctx_r0.getProfitSharingOpportunityTotalPayout(request_r2)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharingContractPeriod(request_r2));
} }
function RequestsComponent_Conditional_101_For_2_Conditional_48_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 83);
    i0.ɵɵtext(1, " Investment Model: Equity ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 84)(3, "div", 79)(4, "p", 80);
    i0.ɵɵtext(5, "Shares");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 81);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 79)(10, "p", 80);
    i0.ɵɵtext(11, "Price");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 81);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 79)(16, "p", 80);
    i0.ɵɵtext(17, "Total");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p", 81);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "number");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r2 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, ctx_r0.getSharesRequested(request_r2)));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r2), " ", i0.ɵɵpipeBind2(14, 7, ctx_r0.getSharePrice(request_r2), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r2), " ", i0.ɵɵpipeBind2(20, 10, ctx_r0.getTotalValue(request_r2), "1.2-2"));
} }
function RequestsComponent_Conditional_101_For_2_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 71)(1, "div", 58);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 59);
    i0.ɵɵelement(3, "path", 75);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span", 76);
    i0.ɵɵtext(5, "Opportunity Details");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, RequestsComponent_Conditional_101_For_2_Conditional_48_Conditional_6_Template, 36, 18)(7, RequestsComponent_Conditional_101_For_2_Conditional_48_Conditional_7_Template, 44, 12)(8, RequestsComponent_Conditional_101_For_2_Conditional_48_Conditional_8_Template, 21, 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r0.isLoanRequest(request_r2) ? 6 : ctx_r0.isProfitSharingRequest(request_r2) ? 7 : 8);
} }
function RequestsComponent_Conditional_101_For_2_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 72)(1, "button", 85);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_101_For_2_Conditional_49_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r3); const request_r2 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.accept(request_r2)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 86);
    i0.ɵɵelement(3, "path", 87);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "button", 88);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_101_For_2_Conditional_49_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r3); const request_r2 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.decline(request_r2)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(6, "svg", 86);
    i0.ɵɵelement(7, "path", 89);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getPrimaryActionLabel(request_r2), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", request_r2.requestType === ctx_r0.OpportunityRequestKind.Conversation ? i0.ɵɵpipeBind1(9, 2, "requests.actions.rejectChat") : i0.ɵɵpipeBind1(10, 4, "requests.actions.rejectParticipation"), " ");
} }
function RequestsComponent_Conditional_101_For_2_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 72)(1, "button", 90);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_101_For_2_Conditional_50_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const request_r2 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.withdraw(request_r2)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 86);
    i0.ɵɵelement(3, "path", 89);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "requests.actions.withdraw"), " ");
} }
function RequestsComponent_Conditional_101_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, RequestsComponent_Conditional_101_For_2_Conditional_0_Template, 7, 7, "div", 36);
    i0.ɵɵelementStart(1, "article", 37);
    i0.ɵɵelement(2, "div", 38);
    i0.ɵɵelementStart(3, "div", 39)(4, "div", 40)(5, "div", 41)(6, "div", 42);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(7, "svg", 43);
    i0.ɵɵelement(8, "path", 44);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(9, "div", 45)(10, "div", 46)(11, "div", 45)(12, "h3", 47);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 48)(15, "span", 49);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(16, "svg", 50);
    i0.ɵɵelement(17, "path", 51);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(19, "span", 52);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(20, "svg", 53);
    i0.ɵɵelement(21, "path", 54);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(23, "span", 55);
    i0.ɵɵelement(24, "span", 56);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(26, "div", 57)(27, "div", 58);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(28, "svg", 59);
    i0.ɵɵelement(29, "path", 60);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(30, "span", 13);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "h4", 61);
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "p", 62);
    i0.ɵɵtext(36);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div", 63)(38, "span", 64);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(39, "svg", 65);
    i0.ɵɵelement(40, "path", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(41);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(42, "span", 67);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(43, "svg", 68);
    i0.ɵɵelement(44, "path", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(45);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(46, "span", 70);
    i0.ɵɵtext(47);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(48, RequestsComponent_Conditional_101_For_2_Conditional_48_Template, 9, 1, "div", 71);
    i0.ɵɵconditionalCreate(49, RequestsComponent_Conditional_101_For_2_Conditional_49_Template, 11, 6, "div", 72);
    i0.ɵɵconditionalCreate(50, RequestsComponent_Conditional_101_For_2_Conditional_50_Template, 6, 3, "div", 72);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r2 = ctx.$implicit;
    const $index_r5 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r0.shouldShowSectionHeader(request_r2, $index_r5) ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("bg-amber-500", ctx_r0.isPendingRequest(request_r2))("bg-green-500", request_r2.status === "Accepted" || request_r2.status === "Partner")("bg-red-500", request_r2.status === "Declined" || request_r2.status === "Rejected");
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(ctx_r0.getCounterpartyName(request_r2));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getCredibilityScore(request_r2), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getTrustLevel(request_r2), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-amber-500/15", ctx_r0.isPendingRequest(request_r2))("text-amber-300", ctx_r0.isPendingRequest(request_r2))("border-amber-500/30", ctx_r0.isPendingRequest(request_r2))("bg-green-500/15", request_r2.status === "Accepted" || request_r2.status === "Partner")("text-green-300", request_r2.status === "Accepted" || request_r2.status === "Partner")("border-green-500/30", request_r2.status === "Accepted" || request_r2.status === "Partner")("bg-red-500/15", request_r2.status === "Declined" || request_r2.status === "Rejected")("text-red-300", request_r2.status === "Declined" || request_r2.status === "Rejected")("border-red-500/30", request_r2.status === "Declined" || request_r2.status === "Rejected");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-amber-400", ctx_r0.isPendingRequest(request_r2))("bg-green-400", request_r2.status === "Accepted" || request_r2.status === "Partner")("bg-red-400", request_r2.status === "Declined" || request_r2.status === "Rejected");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getStatusDisplay(request_r2), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 45, "requests.opportunityLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r2.projectName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getDirectionCopy(request_r2));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", ctx_r0.getRequestTypeBadgeClass(request_r2));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getRequestTypeDisplay(request_r2), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getTimeAgo(request_r2.createdAt), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getExactDateTime(request_r2.createdAt));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.hasParticipationMetadata(request_r2) ? 48 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.canShowAcceptReject(request_r2) ? 49 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.canShowWithdraw(request_r2) ? 50 : -1);
} }
function RequestsComponent_Conditional_101_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "div", 91);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 92);
    i0.ɵɵelement(3, "path", 7);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "p", 93);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 94);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getEmptyTitle());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getEmptySubtitle());
} }
function RequestsComponent_Conditional_101_Conditional_4_For_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 98);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_101_Conditional_4_For_4_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const page_r8 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.goToPage(page_r8)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const page_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("bg-blue-600", ctx_r0.currentPage() === page_r8)("text-white", ctx_r0.currentPage() === page_r8)("bg-slate-800", ctx_r0.currentPage() !== page_r8)("text-gray-400", ctx_r0.currentPage() !== page_r8)("hover:bg-slate-700", ctx_r0.currentPage() !== page_r8);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", page_r8, " ");
} }
function RequestsComponent_Conditional_101_Conditional_4_For_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 97);
    i0.ɵɵtext(1, "...");
    i0.ɵɵelementEnd();
} }
function RequestsComponent_Conditional_101_Conditional_4_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, RequestsComponent_Conditional_101_Conditional_4_For_4_Conditional_0_Template, 2, 11, "button", 96)(1, RequestsComponent_Conditional_101_Conditional_4_For_4_Conditional_1_Template, 2, 0, "span", 97);
} if (rf & 2) {
    const page_r8 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(page_r8 <= 7 || page_r8 === ctx_r0.totalPages() || page_r8 >= ctx_r0.currentPage() - 2 && page_r8 <= ctx_r0.currentPage() + 2 ? 0 : page_r8 === ctx_r0.currentPage() + 3 || page_r8 === ctx_r0.currentPage() - 3 ? 1 : -1);
} }
function RequestsComponent_Conditional_101_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 35)(1, "button", 95);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_101_Conditional_4_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.previousPage()); });
    i0.ɵɵtext(2, " Previous ");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(3, RequestsComponent_Conditional_101_Conditional_4_For_4_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(5, "button", 95);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_101_Conditional_4_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.nextPage()); });
    i0.ɵɵtext(6, " Next ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.currentPage() === 1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵpureFunction1(2, _c0, ctx_r0.totalPages()));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.currentPage() === ctx_r0.totalPages());
} }
function RequestsComponent_Conditional_101_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33);
    i0.ɵɵrepeaterCreate(1, RequestsComponent_Conditional_101_For_2_Template, 51, 47, null, null, _forTrack0, false, RequestsComponent_Conditional_101_ForEmpty_3_Template, 8, 2, "div", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, RequestsComponent_Conditional_101_Conditional_4_Template, 7, 4, "div", 35);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.paginatedRequests());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.totalPages() > 1 ? 4 : -1);
} }
function RequestsComponent_Conditional_102_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 36)(1, "h2", 73);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 74);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵpipe(6, "lowercase");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r9 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getSectionTitle(request_r9));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r0.getSectionCount(request_r9), " ", i0.ɵɵpipeBind1(6, 5, i0.ɵɵpipeBind1(5, 3, "requests.filters.requests")));
} }
function RequestsComponent_Conditional_102_For_2_Conditional_47_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 77);
    i0.ɵɵtext(1, " Investment Model: Loan ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 78)(3, "div", 79)(4, "p", 80);
    i0.ɵɵtext(5, "Contribution Amount");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 81);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 79)(10, "p", 80);
    i0.ɵɵtext(11, "Return Rate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 81);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 79)(15, "p", 80);
    i0.ɵɵtext(16, "Term");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 81);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 79)(20, "p", 80);
    i0.ɵɵtext(21, "Repayment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p", 81);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 79)(25, "p", 80);
    i0.ɵɵtext(26, "Expected Return");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 81);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div", 79)(31, "p", 80);
    i0.ɵɵtext(32, "Total Repayment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "p", 81);
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "number");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r9 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r9), " ", i0.ɵɵpipeBind2(8, 9, ctx_r0.getLoanContributionAmount(request_r9), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.getLoanReturnRate(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getLoanTerm(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getLoanRepaymentModel(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r9), " ", i0.ɵɵpipeBind2(29, 12, ctx_r0.getLoanExpectedReturn(request_r9), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r9), " ", i0.ɵɵpipeBind2(35, 15, ctx_r0.getLoanExpectedTotalRepayment(request_r9), "1.2-2"));
} }
function RequestsComponent_Conditional_102_For_2_Conditional_47_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 82);
    i0.ɵɵtext(1, " Investment Model: Profit Sharing ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 78)(3, "div", 79)(4, "p", 80);
    i0.ɵɵtext(5, "Contribution Amount");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 81);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 79)(10, "p", 80);
    i0.ɵɵtext(11, "Profit Share %");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 81);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 79)(15, "p", 80);
    i0.ɵɵtext(16, "Duration / Term");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 81);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 79)(20, "p", 80);
    i0.ɵɵtext(21, "Exit Terms");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p", 81);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 79)(25, "p", 80);
    i0.ɵɵtext(26, "Expected Profit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 81);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "div", 79)(30, "p", 80);
    i0.ɵɵtext(31, "Expected Payout");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "p", 81);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 79)(35, "p", 80);
    i0.ɵɵtext(36, "Opportunity Payout");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "p", 81);
    i0.ɵɵtext(38);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(39, "div", 79)(40, "p", 80);
    i0.ɵɵtext(41, "Contract Period");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "p", 81);
    i0.ɵɵtext(43);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r9 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r9), " ", i0.ɵɵpipeBind2(8, 9, ctx_r0.getProfitSharingContributionAmount(request_r9), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharePercentage(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharingTerm(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharingExitTerms(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatOptionalMoney(request_r9, ctx_r0.getProfitSharingExpectedProfit(request_r9)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatOptionalMoney(request_r9, ctx_r0.getProfitSharingExpectedTotalPayout(request_r9)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatOptionalMoney(request_r9, ctx_r0.getProfitSharingOpportunityTotalPayout(request_r9)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getProfitSharingContractPeriod(request_r9));
} }
function RequestsComponent_Conditional_102_For_2_Conditional_47_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 83);
    i0.ɵɵtext(1, " Investment Model: Equity ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 84)(3, "div", 79)(4, "p", 80);
    i0.ɵɵtext(5, "Shares");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 81);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 79)(10, "p", 80);
    i0.ɵɵtext(11, "Price");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 81);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 79)(16, "p", 80);
    i0.ɵɵtext(17, "Total");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p", 81);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "number");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r9 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, ctx_r0.getSharesRequested(request_r9)));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r9), " ", i0.ɵɵpipeBind2(14, 7, ctx_r0.getSharePrice(request_r9), "1.2-2"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate2("", ctx_r0.getRequestCurrency(request_r9), " ", i0.ɵɵpipeBind2(20, 10, ctx_r0.getTotalValue(request_r9), "1.2-2"));
} }
function RequestsComponent_Conditional_102_For_2_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 71)(1, "div", 58);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 59);
    i0.ɵɵelement(3, "path", 75);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span", 76);
    i0.ɵɵtext(5, "Opportunity Details");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, RequestsComponent_Conditional_102_For_2_Conditional_47_Conditional_6_Template, 36, 18)(7, RequestsComponent_Conditional_102_For_2_Conditional_47_Conditional_7_Template, 44, 12)(8, RequestsComponent_Conditional_102_For_2_Conditional_47_Conditional_8_Template, 21, 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r9 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r0.isLoanRequest(request_r9) ? 6 : ctx_r0.isProfitSharingRequest(request_r9) ? 7 : 8);
} }
function RequestsComponent_Conditional_102_For_2_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 72)(1, "button", 90);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_102_For_2_Conditional_53_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r10); const request_r9 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.withdraw(request_r9)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 6);
    i0.ɵɵelement(3, "path", 89);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "requests.actions.withdrawRequest"), " ");
} }
function RequestsComponent_Conditional_102_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, RequestsComponent_Conditional_102_For_2_Conditional_0_Template, 7, 7, "div", 36);
    i0.ɵɵelementStart(1, "article", 37);
    i0.ɵɵelement(2, "div", 38);
    i0.ɵɵelementStart(3, "div", 39)(4, "div", 40)(5, "div", 41)(6, "div", 99);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(7, "svg", 100);
    i0.ɵɵelement(8, "path", 44);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(9, "div", 45)(10, "div", 46)(11, "div", 45)(12, "h3", 47);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 48)(15, "span", 49);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(16, "svg", 50);
    i0.ɵɵelement(17, "path", 51);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(19, "span", 52);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(20, "svg", 53);
    i0.ɵɵelement(21, "path", 54);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(23, "span", 55);
    i0.ɵɵelement(24, "span", 56);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(26, "div", 57)(27, "div", 58);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(28, "svg", 59);
    i0.ɵɵelement(29, "path", 60);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(30, "span", 13);
    i0.ɵɵtext(31, "Opportunity");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(32, "h4", 61);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "p", 62);
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(36, "div", 63)(37, "span", 64);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(38, "svg", 65);
    i0.ɵɵelement(39, "path", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(40);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(41, "span", 67);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(42, "svg", 68);
    i0.ɵɵelement(43, "path", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(45, "span", 70);
    i0.ɵɵtext(46);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(47, RequestsComponent_Conditional_102_For_2_Conditional_47_Template, 9, 1, "div", 71);
    i0.ɵɵelementStart(48, "div", 63)(49, "div", 101);
    i0.ɵɵelement(50, "div", 102);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "span", 103);
    i0.ɵɵtext(52);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(53, RequestsComponent_Conditional_102_For_2_Conditional_53_Template, 6, 3, "div", 72);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r9 = ctx.$implicit;
    const $index_r11 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r0.shouldShowSectionHeader(request_r9, $index_r11) ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("bg-amber-500", ctx_r0.isPendingRequest(request_r9))("bg-green-500", request_r9.status === "Accepted" || request_r9.status === "Partner")("bg-red-500", request_r9.status === "Declined" || request_r9.status === "Rejected");
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(ctx_r0.getCounterpartyName(request_r9));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getFounderScore(request_r9), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getTrustLevel(request_r9), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-amber-500/15", ctx_r0.isPendingRequest(request_r9))("text-amber-300", ctx_r0.isPendingRequest(request_r9))("border-amber-500/30", ctx_r0.isPendingRequest(request_r9))("bg-green-500/15", request_r9.status === "Accepted" || request_r9.status === "Partner")("text-green-300", request_r9.status === "Accepted" || request_r9.status === "Partner")("border-green-500/30", request_r9.status === "Accepted" || request_r9.status === "Partner")("bg-red-500/15", request_r9.status === "Declined" || request_r9.status === "Rejected")("text-red-300", request_r9.status === "Declined" || request_r9.status === "Rejected")("border-red-500/30", request_r9.status === "Declined" || request_r9.status === "Rejected");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-amber-400", ctx_r0.isPendingRequest(request_r9))("bg-green-400", request_r9.status === "Accepted" || request_r9.status === "Partner")("bg-red-400", request_r9.status === "Declined" || request_r9.status === "Rejected");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getStatusDisplay(request_r9), " ");
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(request_r9.projectName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getDirectionCopy(request_r9));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", ctx_r0.getRequestTypeBadgeClass(request_r9));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getRequestTypeDisplay(request_r9), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getTimeAgo(request_r9.createdAt), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getExactDateTime(request_r9.createdAt));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.hasParticipationMetadata(request_r9) ? 47 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵstyleProp("width", ctx_r0.getProgressPercentage(request_r9), "%");
    i0.ɵɵclassProp("bg-amber-500", ctx_r0.isPendingRequest(request_r9))("bg-green-500", request_r9.status === "Accepted" || request_r9.status === "Partner")("bg-red-500", request_r9.status === "Declined" || request_r9.status === "Rejected");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getProgressLabel(request_r9));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.canShowWithdraw(request_r9) ? 53 : -1);
} }
function RequestsComponent_Conditional_102_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "div", 91);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 92);
    i0.ɵɵelement(3, "path", 9);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "p", 93);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 94);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.getEmptyTitle());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getEmptySubtitle());
} }
function RequestsComponent_Conditional_102_Conditional_4_For_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 98);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_102_Conditional_4_For_4_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const page_r14 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.goToPage(page_r14)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const page_r14 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("bg-blue-600", ctx_r0.currentPage() === page_r14)("text-white", ctx_r0.currentPage() === page_r14)("bg-slate-800", ctx_r0.currentPage() !== page_r14)("text-gray-400", ctx_r0.currentPage() !== page_r14)("hover:bg-slate-700", ctx_r0.currentPage() !== page_r14);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", page_r14, " ");
} }
function RequestsComponent_Conditional_102_Conditional_4_For_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 97);
    i0.ɵɵtext(1, "...");
    i0.ɵɵelementEnd();
} }
function RequestsComponent_Conditional_102_Conditional_4_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, RequestsComponent_Conditional_102_Conditional_4_For_4_Conditional_0_Template, 2, 11, "button", 96)(1, RequestsComponent_Conditional_102_Conditional_4_For_4_Conditional_1_Template, 2, 0, "span", 97);
} if (rf & 2) {
    const page_r14 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(page_r14 <= 7 || page_r14 === ctx_r0.totalPages() || page_r14 >= ctx_r0.currentPage() - 2 && page_r14 <= ctx_r0.currentPage() + 2 ? 0 : page_r14 === ctx_r0.currentPage() + 3 || page_r14 === ctx_r0.currentPage() - 3 ? 1 : -1);
} }
function RequestsComponent_Conditional_102_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 35)(1, "button", 95);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_102_Conditional_4_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r12); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.previousPage()); });
    i0.ɵɵtext(2, " Previous ");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(3, RequestsComponent_Conditional_102_Conditional_4_For_4_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(5, "button", 95);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_102_Conditional_4_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r12); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.nextPage()); });
    i0.ɵɵtext(6, " Next ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.currentPage() === 1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵpureFunction1(2, _c0, ctx_r0.totalPages()));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.currentPage() === ctx_r0.totalPages());
} }
function RequestsComponent_Conditional_102_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33);
    i0.ɵɵrepeaterCreate(1, RequestsComponent_Conditional_102_For_2_Template, 54, 52, null, null, _forTrack0, false, RequestsComponent_Conditional_102_ForEmpty_3_Template, 8, 2, "div", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, RequestsComponent_Conditional_102_Conditional_4_Template, 7, 4, "div", 35);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.paginatedRequests());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.totalPages() > 1 ? 4 : -1);
} }
export class RequestsComponent {
    constructor() {
        this.requestsService = inject(RequestsService);
        this.router = inject(Router);
        this.languageService = inject(LanguageService);
        this.fileStoreService = inject(FileStoreService);
        this.roleContext = inject(RoleContextService);
        this.tab = signal('incoming', ...(ngDevMode ? [{ debugName: "tab" }] : []));
        this.incoming = this.requestsService.incoming;
        this.outgoing = this.requestsService.outgoing;
        this.incomingCount = computed(() => this.incoming().length, ...(ngDevMode ? [{ debugName: "incomingCount" }] : []));
        this.outgoingCount = computed(() => this.outgoing().length, ...(ngDevMode ? [{ debugName: "outgoingCount" }] : []));
        this.currentConversationCount = computed(() => this.currentTabRequests().filter(request => request.requestType === OpportunityRequestKind.Conversation).length, ...(ngDevMode ? [{ debugName: "currentConversationCount" }] : []));
        this.currentParticipationCount = computed(() => this.currentTabRequests().filter(request => request.requestType === OpportunityRequestKind.Participation).length, ...(ngDevMode ? [{ debugName: "currentParticipationCount" }] : []));
        // Filter state
        this.statusFilter = signal('pending', ...(ngDevMode ? [{ debugName: "statusFilter" }] : []));
        this.typeFilter = signal('all', ...(ngDevMode ? [{ debugName: "typeFilter" }] : []));
        this.dateFilter = signal('all', ...(ngDevMode ? [{ debugName: "dateFilter" }] : []));
        // Pagination state
        this.currentPage = signal(1, ...(ngDevMode ? [{ debugName: "currentPage" }] : []));
        this.pageSize = 6;
        // Computed filtered requests
        this.filteredRequests = computed(() => {
            const requests = this.tab() === 'incoming' ? this.incoming() : this.outgoing();
            return requests.filter(request => {
                // Status filter
                if (this.statusFilter() !== 'all') {
                    if (this.statusFilter() === 'pending' && !this.isPendingRequest(request))
                        return false;
                    if (this.statusFilter() === 'accepted' && request.status !== 'Accepted' && request.status !== 'Partner')
                        return false;
                    if (this.statusFilter() === 'rejected' && request.status !== 'Declined' && request.status !== 'Rejected')
                        return false;
                }
                // Type filter
                if (this.typeFilter() !== 'all') {
                    if (this.typeFilter() === 'conversation' && request.requestType !== OpportunityRequestKind.Conversation)
                        return false;
                    if (this.typeFilter() === 'participation' && request.requestType !== OpportunityRequestKind.Participation)
                        return false;
                }
                // Date filter
                if (this.dateFilter() !== 'all') {
                    const now = new Date();
                    const requestDate = new Date(request.createdAt);
                    const daysDiff = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (this.dateFilter() === 'today' && daysDiff > 0)
                        return false;
                    if (this.dateFilter() === '7days' && daysDiff > 7)
                        return false;
                    if (this.dateFilter() === '30days' && daysDiff > 30)
                        return false;
                }
                return true;
            }).sort((a, b) => {
                const typeDelta = this.requestTypeOrder(a) - this.requestTypeOrder(b);
                return typeDelta || b.createdAt.getTime() - a.createdAt.getTime();
            });
        }, ...(ngDevMode ? [{ debugName: "filteredRequests" }] : []));
        // Computed paginated requests
        this.paginatedRequests = computed(() => {
            const filtered = this.filteredRequests();
            const startIndex = (this.currentPage() - 1) * this.pageSize;
            return filtered.slice(startIndex, startIndex + this.pageSize);
        }, ...(ngDevMode ? [{ debugName: "paginatedRequests" }] : []));
        // Computed total pages
        this.totalPages = computed(() => {
            return Math.ceil(this.filteredRequests().length / this.pageSize);
        }, ...(ngDevMode ? [{ debugName: "totalPages" }] : []));
        // Computed display range
        this.displayRange = computed(() => {
            const filtered = this.filteredRequests();
            const startIndex = (this.currentPage() - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, filtered.length);
            return filtered.length > 0 ? `${startIndex + 1}-${endIndex}` : '0-0';
        }, ...(ngDevMode ? [{ debugName: "displayRange" }] : []));
        void this.refresh();
    }
    t(path, fallback) {
        const result = this.languageService.translate(path);
        return result === path ? (fallback ?? path) : result;
    }
    async refresh() {
        await this.requestsService.refreshRequests();
    }
    currentTabRequests() {
        return this.tab() === 'incoming' ? this.incoming() : this.outgoing();
    }
    shouldShowSectionHeader(request, index) {
        if (this.typeFilter() !== 'all')
            return index === 0;
        const previous = this.paginatedRequests()[index - 1];
        return !previous || previous.requestType !== request.requestType;
    }
    getSectionTitle(request) {
        return request.requestType === OpportunityRequestKind.Conversation
            ? this.t('requests.sections.conversationRequests', 'Conversation Requests')
            : this.t('requests.sections.participationRequests', 'Participation Requests');
    }
    getSectionCount(request) {
        return request.requestType === OpportunityRequestKind.Conversation
            ? this.currentConversationCount()
            : this.currentParticipationCount();
    }
    getEmptyTitle() {
        if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
            return this.t('requests.empty.noMatch', 'No requests match the selected filters.');
        }
        if (this.typeFilter() === 'participation') {
            if (this.tab() === 'incoming' && this.roleContext.isActiveFounderContext()) {
                return this.t('requests.empty.noIncomingParticipation', 'No incoming participation requests');
            }
            if (this.tab() === 'outgoing') {
                return this.t('requests.empty.noOutgoingParticipation', 'No participation requests submitted');
            }
        }
        return this.tab() === 'incoming'
            ? this.t('requests.noIncoming', 'No incoming requests.')
            : this.t('requests.noOutgoing', 'No outgoing requests.');
    }
    getEmptySubtitle() {
        if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
            return this.t('requests.empty.tryAdjustFilters', 'Try adjusting your filter criteria.');
        }
        if (this.typeFilter() === 'participation') {
            return this.t('requests.empty.participationHelper', 'Participation requests are shown separately from conversation requests.');
        }
        return this.tab() === 'incoming'
            ? this.t('requests.noIncomingSubtitle', 'Incoming requests will appear here.')
            : this.t('requests.noOutgoingSubtitle', 'Outgoing requests will appear here.');
    }
    switchTab(tab) {
        this.tab.set(tab);
        this.currentPage.set(1);
    }
    setStatusFilter(status) {
        this.statusFilter.set(status);
        this.currentPage.set(1);
    }
    setTypeFilter(type) {
        this.typeFilter.set(type);
        this.currentPage.set(1);
    }
    setDateFilter(date) {
        this.dateFilter.set(date);
        this.currentPage.set(1);
    }
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }
    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.set(this.currentPage() + 1);
        }
    }
    previousPage() {
        if (this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
        }
    }
    async accept(request) {
        const acceptedConversationId = await this.requestsService.acceptRequest(request);
        if (request.requestType === OpportunityRequestKind.Conversation && acceptedConversationId) {
            await this.router.navigate(['/admin/chat'], { queryParams: { conversationId: acceptedConversationId } });
        }
    }
    decline(request) {
        this.requestsService.declineRequest(request);
    }
    withdraw(request) {
        this.requestsService.withdrawRequest(request);
    }
    resolveImageUrl(url) {
        return this.fileStoreService.getPublicUrl(url);
    }
    getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            const years = Math.floor(interval);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            const months = Math.floor(interval);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            const days = Math.floor(interval);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            const hours = Math.floor(interval);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            const minutes = Math.floor(interval);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        return `${Math.floor(seconds)} second${seconds > 1 ? 's' : ''} ago`;
    }
    /**
  
     * Get display text for request type
  
     */
    getRequestTypeDisplay(request) {
        if (!request.requestType)
            return this.t('requests.types.participationRequest', 'Participation Request');
        switch (request.requestType) {
            case OpportunityRequestKind.Conversation:
                return this.t('requests.types.conversationRequest', 'Conversation Request');
            case OpportunityRequestKind.Participation:
                return `${this.getInvestmentModelDisplay(request)} ${this.t('requests.types.participation', 'Participation')}`;
            default:
                return this.t('requests.types.participationRequest', 'Participation Request');
        }
    }
    /**
  
     * Get badge class for request type
  
     */
    getRequestTypeBadgeClass(request) {
        if (!request.requestType)
            return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
        switch (request.requestType) {
            case OpportunityRequestKind.Conversation:
                return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
            case OpportunityRequestKind.Participation:
                if (this.isLoanRequest(request))
                    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                if (this.isProfitSharingRequest(request))
                    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
            default:
                return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
        }
    }
    /**
  
     * Check if request has investment interest metadata
  
     */
    hasParticipationMetadata(request) {
        return request.requestType === OpportunityRequestKind.Participation && request.requestMetadata;
    }
    /**
  
     * Get shares requested from metadata
  
     */
    getSharesRequested(request) {
        return request.shares || request.requestMetadata?.sharesRequested || request.requestMetadata?.numberOfShares || request.requestMetadata?.termsSnapshot?.SelectedShares || 0;
    }
    /**
  
     * Get share price from metadata
  
     */
    getSharePrice(request) {
        return request.sharePriceSnapshot || request.requestMetadata?.sharePrice || request.requestMetadata?.termsSnapshot?.SharePriceSnapshot || 0;
    }
    isLoanRequest(request) {
        const model = request.investmentModel ?? request.loanTermsSnapshot?.investmentModel ?? request.requestMetadata?.termsSnapshot?.InvestmentModel;
        const key = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        return key === 'loaninvestment' || key === 'loan' || key === '3' || !!request.loanTermsSnapshot;
    }
    isProfitSharingRequest(request) {
        const model = request.investmentModel ?? request.profitSharingTermsSnapshot?.investmentModel ?? request.requestMetadata?.termsSnapshot?.InvestmentModel;
        const key = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        return key === 'capitalcontributionprofitsharing'
            || key === 'profitsharing'
            || key === 'profitshare'
            || key === '2'
            || !!request.profitSharingTermsSnapshot;
    }
    getInvestmentModelDisplay(request) {
        if (this.isLoanRequest(request))
            return this.t('requests.types.loan', 'Loan');
        if (this.isProfitSharingRequest(request))
            return this.t('requests.types.profitSharing', 'Profit Sharing');
        return this.t('requests.types.equity', 'Equity');
    }
    getLoanContributionAmount(request) {
        return request.loanTermsSnapshot?.contributionAmount
            ?? request.loanTermsSnapshot?.requestedAmount
            ?? request.requestedAmount
            ?? 0;
    }
    getLoanReturnRate(request) {
        const snapshot = request.loanTermsSnapshot;
        const rate = snapshot?.returnRateSnapshot;
        if (rate === null || rate === undefined)
            return 'Unavailable';
        const suffix = snapshot?.returnRateTypeSnapshot ? ` ${snapshot.returnRateTypeSnapshot}` : '';
        return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(rate)}%${suffix}`;
    }
    getLoanTerm(request) {
        const snapshot = request.loanTermsSnapshot;
        if (!snapshot?.termValueSnapshot)
            return 'Unavailable';
        return `${snapshot.termValueSnapshot} ${snapshot.termUnitSnapshot || ''}`.trim();
    }
    getLoanRepaymentModel(request) {
        return request.loanTermsSnapshot?.repaymentModelSnapshot || 'Unavailable';
    }
    getLoanExpectedReturn(request) {
        return request.loanTermsSnapshot?.expectedReturnAmount ?? 0;
    }
    getLoanExpectedTotalRepayment(request) {
        return request.loanTermsSnapshot?.expectedTotalRepaymentAmount
            ?? request.loanTermsSnapshot?.calculatedTotalAmount
            ?? request.calculatedTotalAmount
            ?? 0;
    }
    getProfitSharingContributionAmount(request) {
        return request.profitSharingTermsSnapshot?.contributionAmount
            ?? request.profitSharingTermsSnapshot?.requestedAmount
            ?? request.requestedAmount
            ?? 0;
    }
    getProfitSharePercentage(request) {
        const percentage = request.profitSharingTermsSnapshot?.profitSharePercentageSnapshot
            ?? request.profitSharingTermsSnapshot?.proposedSharePercentage
            ?? request.requestMetadata?.termsSnapshot?.ProfitSharePercentageSnapshot
            ?? request.requestMetadata?.termsSnapshot?.ProposedSharePercentage;
        if (percentage === null || percentage === undefined)
            return 'Unavailable';
        return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(Number(percentage))}%`;
    }
    getProfitSharingTerm(request) {
        const snapshot = request.profitSharingTermsSnapshot;
        const term = snapshot?.termValueSnapshot ?? snapshot?.expectedDurationMonthsSnapshot;
        if (!term)
            return 'Unavailable';
        return `${term} ${snapshot?.termUnitSnapshot || 'Months'}`.trim();
    }
    getProfitSharingExitTerms(request) {
        return request.profitSharingTermsSnapshot?.exitTermsSnapshot
            ?? request.requestMetadata?.termsSnapshot?.ExitTermsSnapshot
            ?? request.requestMetadata?.termsSnapshot?.ExitTerms
            ?? 'Unavailable';
    }
    getProfitSharingExpectedProfit(request) {
        return request.profitSharingTermsSnapshot?.expectedProfitAmount
            ?? request.requestMetadata?.termsSnapshot?.ExpectedProfitAmount
            ?? null;
    }
    getProfitSharingExpectedTotalPayout(request) {
        return request.profitSharingTermsSnapshot?.expectedTotalPayoutAmount
            ?? request.requestMetadata?.termsSnapshot?.ExpectedTotalPayoutAmount
            ?? request.calculatedTotalAmount
            ?? null;
    }
    getProfitSharingOpportunityTotalPayout(request) {
        return request.profitSharingTermsSnapshot?.opportunityTotalExpectedPayout
            ?? request.requestMetadata?.termsSnapshot?.OpportunityTotalExpectedPayout
            ?? null;
    }
    getProfitSharingContractPeriod(request) {
        const start = this.formatSnapshotDate(request.profitSharingTermsSnapshot?.contractStartDate ?? request.requestMetadata?.termsSnapshot?.ContractStartDate);
        const end = this.formatSnapshotDate(request.profitSharingTermsSnapshot?.contractEndDate ?? request.requestMetadata?.termsSnapshot?.ContractEndDate);
        if (start === 'Unavailable' && end === 'Unavailable')
            return 'Unavailable';
        if (start !== 'Unavailable' && end !== 'Unavailable')
            return `${start} - ${end}`;
        return start !== 'Unavailable' ? `Starts ${start}` : `Ends ${end}`;
    }
    requestTypeOrder(request) {
        return request.requestType === OpportunityRequestKind.Participation ? 0 : 1;
    }
    formatOptionalMoney(request, value) {
        if (value === null || value === undefined)
            return 'Unavailable';
        return `${this.getRequestCurrency(request)} ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value))}`;
    }
    formatSnapshotDate(value) {
        if (!value)
            return 'Unavailable';
        const date = new Date(String(value));
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    }
    /**
  
     * Get total value from metadata
  
     */
    getTotalValue(request) {
        return request.calculatedTotalAmount || request.requestedAmount || request.requestMetadata?.totalValue || request.requestMetadata?.termsSnapshot?.TotalInvestmentAmount || request.requestMetadata?.termsSnapshot?.CalculatedTotalAmount || 0;
    }
    getRequestCurrency(request) {
        return request.currencySnapshot || request.requestMetadata?.termsSnapshot?.CurrencySnapshot || 'Credits';
    }
    /**
  
     * Get credibility score display
  
     */
    getCredibilityScore(request) {
        const score = request.investorCredibilityScore ?? 0;
        return `${Math.round(score)}/100`;
    }
    /**
  
     * Get founder score display
  
     */
    getFounderScore(request) {
        const score = request.founderCredibilityScore ?? 0;
        return `${Math.round(score)}/100`;
    }
    /**
  
     * Get trust level display
  
     */
    getTrustLevel(request) {
        // Use appropriate trust level based on request direction
        if (request.direction === 'incoming') {
            return request.investorTrustLevel ?? 'Basic';
        }
        else {
            return request.founderTrustLevel ?? 'Basic';
        }
    }
    /**
  
     * Get status display with friendly labels
  
     */
    getStatusDisplay(request) {
        const status = request.status;
        switch (status) {
            case 'Pending':
            case 'Requested':
                return request.requestType === OpportunityRequestKind.Conversation
                    ? this.t('requests.status.waitingFounderResponse', 'Waiting for founder response')
                    : this.t('requests.status.participationPending', 'Participation pending');
            case 'Negotiating':
                return this.t('requests.status.negotiationInProgress', 'Negotiation in progress');
            case 'Partner':
                return this.t('requests.status.projectParticipant', 'Project Participant');
            case 'Accepted':
                return request.requestType === OpportunityRequestKind.Conversation
                    ? this.t('requests.status.chatAccepted', 'Chat accepted')
                    : this.t('requests.status.participationApproved', 'Participation approved');
            case 'Declined':
            case 'Rejected':
                return this.t('requests.status.declined', 'Declined');
            case 'Cancelled':
            case 'Withdrawn':
                return this.t('requests.status.withdrawn', 'Withdrawn');
            default:
                return status;
        }
    }
    getDirectionCopy(request) {
        if (request.type === 'conversation') {
            if (request.direction === 'incoming') {
                return this.t('requests.direction.incomingConversation', 'This Investor wants to start a conversation about your Opportunity.');
            }
            return this.t('requests.direction.outgoingConversation', 'Conversation request sent. Waiting for the Founder to respond.');
        }
        if (request.direction === 'incoming') {
            return this.t('requests.direction.incomingParticipation', '{model} participation request received. Review the final submitted terms.')
                .replace('{model}', this.getInvestmentModelDisplay(request));
        }
        return this.t('requests.direction.outgoingParticipation', '{model} participation request sent. Waiting for Founder review.')
            .replace('{model}', this.getInvestmentModelDisplay(request));
    }
    getPrimaryActionLabel(request) {
        if (request.type === 'conversation') {
            return request.direction === 'incoming'
                ? this.t('requests.actions.acceptChat', 'Accept Chat')
                : this.t('requests.actions.withdraw', 'Withdraw');
        }
        return request.direction === 'incoming'
            ? this.t('requests.actions.approveParticipation', 'Approve {model}').replace('{model}', this.getInvestmentModelDisplay(request))
            : this.t('requests.actions.withdraw', 'Withdraw');
    }
    canShowWithdraw(request) {
        if (request.type === 'conversation') {
            return request.direction === 'outgoing' && request.status === 'Pending' && request.canWithdraw !== false;
        }
        return request.direction === 'outgoing' && request.status === 'Pending';
    }
    canShowAcceptReject(request) {
        if (request.type === 'conversation') {
            return request.direction === 'incoming' && request.status === 'Pending' && request.canAccept !== false && request.canReject !== false;
        }
        return request.direction === 'incoming' && request.status === 'Pending';
    }
    isPendingRequest(request) {
        return request.type === 'conversation'
            ? request.status === 'Pending'
            : request.status === 'Pending';
    }
    getCounterpartyName(request) {
        if (request.direction === 'incoming') {
            return request.senderName || request.counterpartName || 'Investor';
        }
        return request.receiverName || request.counterpartName || 'Founder';
    }
    /**
  
     * Get exact date/time display
  
     */
    getExactDateTime(date) {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
    }
    /**
  
     * Get progress percentage for timeline
  
     */
    getProgressPercentage(request) {
        const status = request.status;
        switch (status) {
            case 'Pending':
                return 33;
            case 'Negotiating':
                return 66;
            case 'Partner':
            case 'Accepted':
                return 100;
            case 'Declined':
            case 'Rejected':
                return 100;
            default:
                return 33;
        }
    }
    /**
  
     * Get progress label for timeline
  
     */
    getProgressLabel(request) {
        const status = request.status;
        switch (status) {
            case 'Pending':
                return this.t('requests.progress.inReview', 'In Review');
            case 'Negotiating':
                return this.t('requests.progress.negotiating', 'Negotiating');
            case 'Partner':
            case 'Accepted':
                return this.t('requests.progress.completed', 'Completed');
            case 'Declined':
            case 'Rejected':
                return this.t('requests.progress.ended', 'Ended');
            default:
                return this.t('requests.progress.inReview', 'In Review');
        }
    }
    static { this.ɵfac = function RequestsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RequestsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RequestsComponent, selectors: [["app-requests"]], decls: 103, vars: 102, consts: [[1, "container", "mx-auto", "px-6", "py-8"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-4", "mb-8"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400", "mt-1"], [1, "flex", "items-center", "gap-1", "p-1", "bg-slate-800/60", "border", "border-slate-700/50", "rounded-xl"], [1, "relative", "flex", "items-center", "gap-2", "px-5", "py-2", "rounded-lg", "text-sm", "font-semibold", "transition-all", 3, "click"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"], [1, "ms-1", "px-1.5", "py-0.5", "rounded-full", "text-[10px]", "font-bold", 3, "bg-white/20", "bg-slate-700", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-xl", "p-4", "mb-6"], [1, "flex", "flex-wrap", "items-center", "gap-4"], [1, "flex", "items-center", "gap-2"], [1, "text-xs", "font-semibold", "text-gray-400", "uppercase", "tracking-wide"], [1, "bg-slate-900/80", "border", "border-slate-700", "text-white", "text-sm", "rounded-lg", "px-3", "py-2", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500/50", 3, "change", "value"], ["value", "all"], ["value", "pending"], ["value", "accepted"], ["value", "rejected"], ["value", "conversation"], ["value", "participation"], ["value", "today"], ["value", "7days"], ["value", "30days"], [1, "ml-auto", "text-sm", "text-gray-400"], [1, "mb-6", "grid", "grid-cols-1", "gap-3", "md:grid-cols-2"], [1, "rounded-xl", "border", "border-slate-700/60", "bg-slate-900/50", "p-4"], [1, "flex", "items-center", "justify-between", "gap-3"], [1, "text-xs", "font-semibold", "uppercase", "tracking-wide", "text-slate-400"], [1, "mt-1", "text-sm", "text-slate-500"], [1, "rounded-full", "border", "border-blue-500/30", "bg-blue-500/15", "px-3", "py-1", "text-sm", "font-bold", "text-blue-200"], [1, "rounded-full", "border", "border-purple-500/30", "bg-purple-500/15", "px-3", "py-1", "text-sm", "font-bold", "text-purple-200"], [1, "ms-1", "px-1.5", "py-0.5", "rounded-full", "text-[10px]", "font-bold"], [1, "grid", "grid-cols-1", "lg:grid-cols-2", "gap-5", "animate-fade-in"], [1, "col-span-full", "flex", "flex-col", "items-center", "justify-center", "py-24", "text-center", "animate-fade-in"], [1, "flex", "items-center", "justify-center", "gap-2", "mt-8"], [1, "col-span-full", "mt-2", "flex", "items-center", "justify-between", "border-b", "border-slate-800", "pb-2"], [1, "relative", "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-2xl", "overflow-hidden", "hover:border-slate-600/60", "hover:shadow-xl", "hover:shadow-black/30", "transition-all", "duration-200", "group"], [1, "absolute", "top-0", "inset-x-0", "h-1", "rounded-t-2xl"], [1, "p-5"], [1, "flex", "items-start", "gap-4", "mb-4"], [1, "relative", "flex-shrink-0"], [1, "w-14", "h-14", "rounded-xl", "bg-gradient-to-br", "from-blue-500/20", "to-purple-500/20", "border", "border-slate-600", "flex", "items-center", "justify-center", "ring-2", "ring-slate-700", "group-hover:ring-slate-500", "transition-all"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-7", "h-7", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"], [1, "flex-1", "min-w-0"], [1, "flex", "items-start", "justify-between", "gap-2", "mb-1"], [1, "text-white", "font-bold", "text-base", "truncate"], [1, "flex", "flex-wrap", "items-center", "gap-2", "mt-1.5"], [1, "inline-flex", "items-center", "gap-1", "text-[10px]", "font-semibold", "px-2", "py-0.5", "rounded-full", "bg-emerald-500/15", "text-emerald-300", "border", "border-emerald-500/30"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3"], ["d", "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"], [1, "inline-flex", "items-center", "gap-1", "text-[10px]", "font-semibold", "px-2", "py-0.5", "rounded-full", "bg-cyan-500/15", "text-cyan-300", "border", "border-cyan-500/30"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-3", "h-3"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"], [1, "flex-shrink-0", "inline-flex", "items-center", "gap-1.5", "text-[11px]", "font-bold", "px-2.5", "py-1", "rounded-full", "border"], [1, "w-1.5", "h-1.5", "rounded-full"], [1, "bg-slate-800/50", "rounded-xl", "p-3", "mb-3"], [1, "flex", "items-center", "gap-2", "mb-2"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-purple-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"], [1, "text-white", "font-semibold", "text-sm", "mb-1"], [1, "text-xs", "leading-5", "text-slate-400", "mt-2"], [1, "flex", "items-center", "gap-2", "mb-3"], [1, "inline-flex", "items-center", "gap-1.5", "text-[11px]", "font-semibold", "px-3", "py-1", "rounded-lg", "border", 3, "ngClass"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"], [1, "text-xs", "text-gray-500"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "inline", "mr-1"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-xs", "text-gray-600", "ml-auto"], [1, "bg-purple-500/10", "border", "border-purple-500/30", "rounded-xl", "p-3", "mb-3"], [1, "flex", "gap-3", "pt-3", "border-t", "border-slate-800"], [1, "text-sm", "font-bold", "uppercase", "tracking-wide", "text-slate-300"], [1, "text-xs", "font-semibold", "text-slate-500"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-xs", "font-semibold", "text-purple-300", "uppercase", "tracking-wide"], [1, "mb-3", "inline-flex", "rounded-full", "border", "border-blue-500/30", "bg-blue-500/10", "px-2.5", "py-1", "text-[11px]", "font-bold", "text-blue-200"], [1, "grid", "grid-cols-2", "gap-3"], [1, "bg-slate-800/50", "rounded-lg", "p-2", "text-center"], [1, "text-[10px]", "text-gray-400", "uppercase", "tracking-wide", "mb-1"], [1, "text-white", "font-bold", "text-sm"], [1, "mb-3", "inline-flex", "rounded-full", "border", "border-emerald-500/30", "bg-emerald-500/10", "px-2.5", "py-1", "text-[11px]", "font-bold", "text-emerald-200"], [1, "mb-3", "inline-flex", "rounded-full", "border", "border-purple-500/30", "bg-purple-500/10", "px-2.5", "py-1", "text-[11px]", "font-bold", "text-purple-200"], [1, "grid", "grid-cols-3", "gap-3"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "bg-emerald-600/90", "hover:bg-emerald-600", "text-white", "text-sm", "font-semibold", "px-4", "py-2.5", "rounded-xl", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2.5", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M4.5 12.75l6 6 9-13.5"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "bg-slate-800", "hover:bg-red-500/20", "border", "border-slate-700", "hover:border-red-500/40", "text-gray-300", "hover:text-red-400", "text-sm", "font-semibold", "px-4", "py-2.5", "rounded-xl", "transition-all", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M6 18L18 6M6 6l12 12"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "bg-slate-800", "hover:bg-red-500/20", "border", "border-slate-700", "hover:border-red-500/40", "text-gray-400", "hover:text-red-400", "text-sm", "font-semibold", "px-4", "py-2.5", "rounded-xl", "transition-all", 3, "click"], [1, "w-16", "h-16", "rounded-full", "bg-slate-800", "border", "border-slate-700", "flex", "items-center", "justify-center", "mb-4"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-7", "h-7", "text-gray-500"], [1, "text-lg", "font-semibold", "text-white", "mb-1"], [1, "text-sm", "text-gray-500"], [1, "px-4", "py-2", "bg-slate-800", "border", "border-slate-700", "rounded-lg", "text-sm", "text-white", "hover:bg-slate-700", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-all", 3, "click", "disabled"], [1, "px-4", "py-2", "border", "border-slate-700", "rounded-lg", "text-sm", "transition-all", 3, "bg-blue-600", "text-white", "bg-slate-800", "text-gray-400", "hover:bg-slate-700"], [1, "text-gray-500"], [1, "px-4", "py-2", "border", "border-slate-700", "rounded-lg", "text-sm", "transition-all", 3, "click"], [1, "w-14", "h-14", "rounded-xl", "bg-gradient-to-br", "from-orange-500/20", "to-red-500/20", "border", "border-slate-600", "flex", "items-center", "justify-center", "ring-2", "ring-slate-700", "group-hover:ring-slate-500", "transition-all"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-7", "h-7", "text-orange-400"], [1, "flex-1", "h-1.5", "bg-slate-800", "rounded-full", "overflow-hidden"], [1, "h-full", "rounded-full", "transition-all", "duration-500"], [1, "text-[10px]", "text-gray-500"]], template: function RequestsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div")(3, "h1", 2);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 3);
            i0.ɵɵconditionalCreate(7, RequestsComponent_Conditional_7_Template, 3, 6)(8, RequestsComponent_Conditional_8_Template, 3, 6);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "div", 4)(10, "button", 5);
            i0.ɵɵlistener("click", function RequestsComponent_Template_button_click_10_listener() { return ctx.switchTab("incoming"); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(11, "svg", 6);
            i0.ɵɵelement(12, "path", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵconditionalCreate(15, RequestsComponent_Conditional_15_Template, 2, 7, "span", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(16, "button", 5);
            i0.ɵɵlistener("click", function RequestsComponent_Template_button_click_16_listener() { return ctx.switchTab("outgoing"); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(17, "svg", 6);
            i0.ɵɵelement(18, "path", 9);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵconditionalCreate(21, RequestsComponent_Conditional_21_Template, 2, 7, "span", 8);
            i0.ɵɵelementEnd()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(22, "div", 10)(23, "div", 11)(24, "div", 12)(25, "label", 13);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "select", 14);
            i0.ɵɵlistener("change", function RequestsComponent_Template_select_change_28_listener($event) { return ctx.setStatusFilter($event.target.value); });
            i0.ɵɵelementStart(29, "option", 15);
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "option", 16);
            i0.ɵɵtext(33);
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "option", 17);
            i0.ɵɵtext(36);
            i0.ɵɵpipe(37, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "option", 18);
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(41, "div", 12)(42, "label", 13);
            i0.ɵɵtext(43);
            i0.ɵɵpipe(44, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "select", 14);
            i0.ɵɵlistener("change", function RequestsComponent_Template_select_change_45_listener($event) { return ctx.setTypeFilter($event.target.value); });
            i0.ɵɵelementStart(46, "option", 15);
            i0.ɵɵtext(47);
            i0.ɵɵpipe(48, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(49, "option", 19);
            i0.ɵɵtext(50);
            i0.ɵɵpipe(51, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "option", 20);
            i0.ɵɵtext(53);
            i0.ɵɵpipe(54, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(55, "div", 12)(56, "label", 13);
            i0.ɵɵtext(57);
            i0.ɵɵpipe(58, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "select", 14);
            i0.ɵɵlistener("change", function RequestsComponent_Template_select_change_59_listener($event) { return ctx.setDateFilter($event.target.value); });
            i0.ɵɵelementStart(60, "option", 15);
            i0.ɵɵtext(61);
            i0.ɵɵpipe(62, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(63, "option", 21);
            i0.ɵɵtext(64);
            i0.ɵɵpipe(65, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(66, "option", 22);
            i0.ɵɵtext(67);
            i0.ɵɵpipe(68, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(69, "option", 23);
            i0.ɵɵtext(70);
            i0.ɵɵpipe(71, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(72, "div", 24);
            i0.ɵɵtext(73);
            i0.ɵɵpipe(74, "translate");
            i0.ɵɵpipe(75, "translate");
            i0.ɵɵpipe(76, "translate");
            i0.ɵɵpipe(77, "lowercase");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(78, "div", 25)(79, "div", 26)(80, "div", 27)(81, "div")(82, "p", 28);
            i0.ɵɵtext(83);
            i0.ɵɵpipe(84, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(85, "p", 29);
            i0.ɵɵtext(86);
            i0.ɵɵpipe(87, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(88, "span", 30);
            i0.ɵɵtext(89);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(90, "div", 26)(91, "div", 27)(92, "div")(93, "p", 28);
            i0.ɵɵtext(94);
            i0.ɵɵpipe(95, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(96, "p", 29);
            i0.ɵɵtext(97);
            i0.ɵɵpipe(98, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(99, "span", 31);
            i0.ɵɵtext(100);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(101, RequestsComponent_Conditional_101_Template, 5, 2);
            i0.ɵɵconditionalCreate(102, RequestsComponent_Conditional_102_Template, 5, 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 52, "requests.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.tab() === "incoming" ? 7 : 8);
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("bg-blue-600", ctx.tab() === "incoming")("text-white", ctx.tab() === "incoming")("text-gray-400", ctx.tab() !== "incoming")("hover:text-white", ctx.tab() !== "incoming");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 54, "requests.incoming"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.incomingCount() > 0 ? 15 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("bg-blue-600", ctx.tab() === "outgoing")("text-white", ctx.tab() === "outgoing")("text-gray-400", ctx.tab() !== "outgoing")("hover:text-white", ctx.tab() !== "outgoing");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 56, "requests.outgoing"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.outgoingCount() > 0 ? 21 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 58, "requests.filters.status"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.statusFilter());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 60, "requests.filters.all"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 62, "requests.filters.pending"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 64, "requests.filters.accepted"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 66, "requests.filters.rejected"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 68, "requests.filters.type"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.typeFilter());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 70, "requests.filters.all"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 72, "requests.filters.conversation"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(54, 74, "requests.filters.participation"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(58, 76, "requests.filters.date"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.dateFilter());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(62, 78, "requests.filters.allTime"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(65, 80, "requests.filters.today"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(68, 82, "requests.filters.last7Days"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(71, 84, "requests.filters.last30Days"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate5(" ", i0.ɵɵpipeBind1(74, 86, "requests.filters.showing"), " ", ctx.displayRange(), " ", i0.ɵɵpipeBind1(75, 88, "requests.filters.of"), " ", ctx.filteredRequests().length, " ", i0.ɵɵpipeBind1(77, 92, i0.ɵɵpipeBind1(76, 90, "requests.filters.requests")), " ");
            i0.ɵɵadvance(10);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(84, 94, "requests.sections.conversationRequests"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(87, 96, "requests.sections.conversationHelper"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.currentConversationCount());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(95, 98, "requests.sections.participationRequests"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(98, 100, "requests.sections.participationHelper"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.currentParticipationCount());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.tab() === "incoming" ? 101 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.tab() === "outgoing" ? 102 : -1);
        } }, dependencies: [CommonModule, i1.NgClass, i1.LowerCasePipe, i1.DecimalPipe, TranslatePipe], styles: ["\n\r\n.badge[_ngcontent-%COMP%] {\r\n  border-radius: 9999px;\r\n  padding: 0.25rem 0.5rem;\r\n  font-size: 0.75rem;\r\n}\r\n\r\n\n\r\n\r\n\r\n\r\n\r\n\n\r\n\r\n\n\r\n.status-badge[_ngcontent-%COMP%] {\r\n  &.pending {\r\n    background: rgba(245, 158, 11, 0.15);\r\n    color: #fbbf24;\r\n    border-color: rgba(245, 158, 11, 0.3);\r\n  }\r\n\r\n  &.accepted {\r\n    background: rgba(16, 185, 129, 0.15);\r\n    color: #34d399;\r\n    border-color: rgba(16, 185, 129, 0.3);\r\n  }\r\n\r\n  &.declined {\r\n    background: rgba(239, 68, 68, 0.15);\r\n    color: #f87171;\r\n    border-color: rgba(239, 68, 68, 0.3);\r\n  }\r\n}\r\n\r\n\n\r\n.request-type-badge[_ngcontent-%COMP%] {\r\n  &.contact-founder {\r\n    background: rgba(59, 130, 246, 0.15);\r\n    color: #60a5fa;\r\n    border-color: rgba(59, 130, 246, 0.3);\r\n  }\r\n\r\n  &.investment-interest {\r\n    background: rgba(168, 85, 247, 0.15);\r\n    color: #c084fc;\r\n    border-color: rgba(168, 85, 247, 0.3);\r\n  }\r\n}\r\n\r\n\n\r\n.score-badge[_ngcontent-%COMP%] {\r\n  background: rgba(16, 185, 129, 0.15);\r\n  color: #34d399;\r\n  border-color: rgba(16, 185, 129, 0.3);\r\n}\r\n\r\n.trust-badge[_ngcontent-%COMP%] {\r\n  background: rgba(6, 182, 212, 0.15);\r\n  color: #22d3ee;\r\n  border-color: rgba(6, 182, 212, 0.3);\r\n}\r\n\r\n\n\r\n.investment-details[_ngcontent-%COMP%] {\r\n  background: rgba(168, 85, 247, 0.1);\r\n  border-color: rgba(168, 85, 247, 0.3);\r\n\r\n  .detail-box {\r\n    background: rgba(30, 41, 59, 0.5);\r\n  }\r\n}\r\n\r\n\n\r\n.project-info[_ngcontent-%COMP%] {\r\n  background: rgba(30, 41, 59, 0.5);\r\n}\r\n\r\n\n\r\n.avatar[_ngcontent-%COMP%] {\r\n  &.investor {\r\n    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2));\r\n  }\r\n\r\n  &.founder {\r\n    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2));\r\n  }\r\n}\r\n\r\n\n\r\n\r\n\r\n\r\n\r\n\n\r\n\r\n\n\r\n.action-button[_ngcontent-%COMP%] {\r\n  &.approve {\r\n    background: rgba(16, 185, 129, 0.9);\r\n  }\r\n\r\n  &.reject,\r\n  &.withdraw {\r\n    background: rgba(30, 41, 59, 1);\r\n    border-color: rgba(51, 65, 85, 1);\r\n  }\r\n}\r\n\r\n\n\r\n.empty-state[_ngcontent-%COMP%] {\r\n  .empty-icon {\r\n    background: rgba(30, 41, 59, 1);\r\n    border-color: rgba(51, 65, 85, 1);\r\n  }\r\n}\r\n\r\n\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\n\r\n\r\n\r\n\r\n\n\r\n\r\nbody.investa-theme-light[_nghost-%COMP%], body.investa-theme-light   [_nghost-%COMP%] {\r\n  .status-badge {\r\n    &.pending {\r\n      background: rgba(245, 158, 11, 0.12);\r\n      color: #92400e;\r\n      border-color: rgba(245, 158, 11, 0.28);\r\n    }\r\n\r\n    &.accepted {\r\n      background: rgba(16, 185, 129, 0.12);\r\n      color: #047857;\r\n      border-color: rgba(16, 185, 129, 0.28);\r\n    }\r\n\r\n    &.declined {\r\n      background: rgba(239, 68, 68, 0.1);\r\n      color: #b91c1c;\r\n      border-color: rgba(239, 68, 68, 0.24);\r\n    }\r\n  }\r\n\r\n  .request-type-badge.contact-founder {\r\n    background: rgba(37, 99, 235, 0.1);\r\n    color: #1d4ed8;\r\n    border-color: rgba(37, 99, 235, 0.24);\r\n  }\r\n\r\n  .request-type-badge.investment-interest {\r\n    background: rgba(126, 34, 206, 0.1);\r\n    color: #6b21a8;\r\n    border-color: rgba(126, 34, 206, 0.22);\r\n  }\r\n\r\n  .score-badge {\r\n    background: rgba(16, 185, 129, 0.12);\r\n    color: #047857;\r\n    border-color: rgba(16, 185, 129, 0.24);\r\n  }\r\n\r\n  .trust-badge {\r\n    background: rgba(8, 145, 178, 0.1);\r\n    color: #0e7490;\r\n    border-color: rgba(8, 145, 178, 0.24);\r\n  }\r\n\r\n  .investment-details,\r\n  .investment-details .detail-box,\r\n  .project-info,\r\n  .empty-state .empty-icon {\r\n    background: var(--investa-surface-2);\r\n    border-color: var(--investa-border);\r\n  }\r\n\r\n  .action-button.reject,\r\n  .action-button.withdraw {\r\n    background: #ffffff;\r\n    color: var(--investa-text-primary);\r\n    border-color: var(--investa-border);\r\n  }\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RequestsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-requests', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, TranslatePipe], template: "<section class=\"container mx-auto px-6 py-8\">\r\n\r\n\r\n\r\n  <!-- Page Header -->\r\n\r\n  <div class=\"flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8\">\r\n\r\n    <div>\r\n\r\n      <h1 class=\"text-3xl font-bold text-white\">{{ 'requests.title' | translate }}</h1>\r\n\r\n      <p class=\"text-sm text-gray-400 mt-1\">\r\n\r\n        @if (tab() === 'incoming') {\r\n\r\n          {{ incomingCount() }} {{ 'requests.incoming' | translate | lowercase }}\r\n\r\n        } @else {\r\n\r\n          {{ outgoingCount() }} {{ 'requests.outgoing' | translate | lowercase }}\r\n\r\n        }\r\n\r\n      </p>\r\n\r\n    </div>\r\n\r\n\r\n\r\n    <!-- Tab toggle -->\r\n\r\n    <div class=\"flex items-center gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl\">\r\n\r\n      <button (click)=\"switchTab('incoming')\"\r\n\r\n              class=\"relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all\"\r\n\r\n              [class.bg-blue-600]=\"tab() === 'incoming'\"\r\n\r\n              [class.text-white]=\"tab() === 'incoming'\"\r\n\r\n              [class.text-gray-400]=\"tab() !== 'incoming'\"\r\n\r\n              [class.hover:text-white]=\"tab() !== 'incoming'\">\r\n\r\n        <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6\"/>\r\n\r\n        </svg>\r\n\r\n        {{ 'requests.incoming' | translate }}\r\n\r\n        @if (incomingCount() > 0) {\r\n\r\n          <span class=\"ms-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold\"\r\n\r\n                [class.bg-white/20]=\"tab() === 'incoming'\"\r\n\r\n                [class.bg-slate-700]=\"tab() !== 'incoming'\"\r\n\r\n                [class.text-white]=\"true\">{{ incomingCount() }}</span>\r\n\r\n        }\r\n\r\n      </button>\r\n\r\n      <button (click)=\"switchTab('outgoing')\"\r\n\r\n              class=\"relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all\"\r\n\r\n              [class.bg-blue-600]=\"tab() === 'outgoing'\"\r\n\r\n              [class.text-white]=\"tab() === 'outgoing'\"\r\n\r\n              [class.text-gray-400]=\"tab() !== 'outgoing'\"\r\n\r\n              [class.hover:text-white]=\"tab() !== 'outgoing'\">\r\n\r\n        <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6\"/>\r\n\r\n        </svg>\r\n\r\n        {{ 'requests.outgoing' | translate }}\r\n\r\n        @if (outgoingCount() > 0) {\r\n\r\n          <span class=\"ms-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold\"\r\n\r\n                [class.bg-white/20]=\"tab() === 'outgoing'\"\r\n\r\n                [class.bg-slate-700]=\"tab() !== 'outgoing'\"\r\n\r\n                [class.text-white]=\"true\">{{ outgoingCount() }}</span>\r\n\r\n        }\r\n\r\n      </button>\r\n\r\n    </div>\r\n\r\n\r\n\r\n\r\n  </div>\r\n\r\n\r\n\r\n  <!-- Filter Toolbar -->\r\n\r\n  <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-6\">\r\n\r\n    <div class=\"flex flex-wrap items-center gap-4\">\r\n\r\n      <!-- Status Filter -->\r\n\r\n      <div class=\"flex items-center gap-2\">\r\n\r\n        <label class=\"text-xs font-semibold text-gray-400 uppercase tracking-wide\">{{ 'requests.filters.status' | translate }}</label>\r\n\r\n        <select (change)=\"setStatusFilter($any($event.target).value)\"\r\n\r\n                [value]=\"statusFilter()\"\r\n\r\n                class=\"bg-slate-900/80 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50\">\r\n\r\n          <option value=\"all\">{{ 'requests.filters.all' | translate }}</option>\r\n\r\n          <option value=\"pending\">{{ 'requests.filters.pending' | translate }}</option>\r\n\r\n          <option value=\"accepted\">{{ 'requests.filters.accepted' | translate }}</option>\r\n\r\n          <option value=\"rejected\">{{ 'requests.filters.rejected' | translate }}</option>\r\n\r\n        </select>\r\n\r\n      </div>\r\n\r\n\r\n\r\n      <!-- Type Filter -->\r\n\r\n      <div class=\"flex items-center gap-2\">\r\n\r\n        <label class=\"text-xs font-semibold text-gray-400 uppercase tracking-wide\">{{ 'requests.filters.type' | translate }}</label>\r\n\r\n        <select (change)=\"setTypeFilter($any($event.target).value)\"\r\n\r\n                [value]=\"typeFilter()\"\r\n\r\n                class=\"bg-slate-900/80 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50\">\r\n\r\n          <option value=\"all\">{{ 'requests.filters.all' | translate }}</option>\r\n\r\n          <option value=\"conversation\">{{ 'requests.filters.conversation' | translate }}</option>\r\n\r\n          <option value=\"participation\">{{ 'requests.filters.participation' | translate }}</option>\r\n\r\n        </select>\r\n\r\n      </div>\r\n\r\n\r\n\r\n      <!-- Date Filter -->\r\n\r\n      <div class=\"flex items-center gap-2\">\r\n\r\n        <label class=\"text-xs font-semibold text-gray-400 uppercase tracking-wide\">{{ 'requests.filters.date' | translate }}</label>\r\n\r\n        <select (change)=\"setDateFilter($any($event.target).value)\"\r\n\r\n                [value]=\"dateFilter()\"\r\n\r\n                class=\"bg-slate-900/80 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50\">\r\n\r\n          <option value=\"all\">{{ 'requests.filters.allTime' | translate }}</option>\r\n\r\n          <option value=\"today\">{{ 'requests.filters.today' | translate }}</option>\r\n\r\n          <option value=\"7days\">{{ 'requests.filters.last7Days' | translate }}</option>\r\n\r\n          <option value=\"30days\">{{ 'requests.filters.last30Days' | translate }}</option>\r\n\r\n        </select>\r\n\r\n      </div>\r\n\r\n\r\n\r\n      <!-- Results Count -->\r\n\r\n      <div class=\"ml-auto text-sm text-gray-400\">\r\n\r\n        {{ 'requests.filters.showing' | translate }} {{ displayRange() }} {{ 'requests.filters.of' | translate }} {{ filteredRequests().length }} {{ 'requests.filters.requests' | translate | lowercase }}\r\n\r\n      </div>\r\n\r\n    </div>\r\n\r\n  </div>\r\n\r\n\r\n\r\n  <div class=\"mb-6 grid grid-cols-1 gap-3 md:grid-cols-2\">\r\n    <div class=\"rounded-xl border border-slate-700/60 bg-slate-900/50 p-4\">\r\n      <div class=\"flex items-center justify-between gap-3\">\r\n        <div>\r\n          <p class=\"text-xs font-semibold uppercase tracking-wide text-slate-400\">{{ 'requests.sections.conversationRequests' | translate }}</p>\r\n          <p class=\"mt-1 text-sm text-slate-500\">{{ 'requests.sections.conversationHelper' | translate }}</p>\r\n        </div>\r\n        <span class=\"rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-sm font-bold text-blue-200\">{{ currentConversationCount() }}</span>\r\n      </div>\r\n    </div>\r\n    <div class=\"rounded-xl border border-slate-700/60 bg-slate-900/50 p-4\">\r\n      <div class=\"flex items-center justify-between gap-3\">\r\n        <div>\r\n          <p class=\"text-xs font-semibold uppercase tracking-wide text-slate-400\">{{ 'requests.sections.participationRequests' | translate }}</p>\r\n          <p class=\"mt-1 text-sm text-slate-500\">{{ 'requests.sections.participationHelper' | translate }}</p>\r\n        </div>\r\n        <span class=\"rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-sm font-bold text-purple-200\">{{ currentParticipationCount() }}</span>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- \u2500\u2500 INCOMING (Founder Requests) \u2500\u2500 -->\r\n\r\n  @if (tab() === 'incoming') {\r\n\r\n    <div class=\"grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in\">\r\n\r\n      @for (request of paginatedRequests(); track request.id) {\r\n\r\n        @if (shouldShowSectionHeader(request, $index)) {\r\n\r\n          <div class=\"col-span-full mt-2 flex items-center justify-between border-b border-slate-800 pb-2\">\r\n\r\n            <h2 class=\"text-sm font-bold uppercase tracking-wide text-slate-300\">{{ getSectionTitle(request) }}</h2>\r\n\r\n            <span class=\"text-xs font-semibold text-slate-500\">{{ getSectionCount(request) }} {{ 'requests.filters.requests' | translate | lowercase }}</span>\r\n\r\n          </div>\r\n\r\n        }\r\n        <article class=\"relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600/60 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 group\">\r\n\r\n\r\n\r\n          <!-- Status accent strip -->\r\n\r\n          <div class=\"absolute top-0 inset-x-0 h-1 rounded-t-2xl\"\r\n\r\n               [class.bg-amber-500]=\"isPendingRequest(request)\"\r\n\r\n               [class.bg-green-500]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n               [class.bg-red-500]=\"request.status === 'Declined' || request.status === 'Rejected'\"></div>\r\n\r\n\r\n\r\n          <div class=\"p-5\">\r\n\r\n            <!-- Investor Header -->\r\n\r\n            <div class=\"flex items-start gap-4 mb-4\">\r\n\r\n              <!-- Investor Avatar -->\r\n\r\n              <div class=\"relative flex-shrink-0\">\r\n\r\n                <div class=\"w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-600 flex items-center justify-center ring-2 ring-slate-700 group-hover:ring-slate-500 transition-all\">\r\n\r\n                  <svg class=\"w-7 h-7 text-blue-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\">\r\n\r\n                    <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\"/>\r\n\r\n                  </svg>\r\n\r\n                </div>\r\n\r\n              </div>\r\n\r\n\r\n\r\n              <div class=\"flex-1 min-w-0\">\r\n\r\n                <!-- Investor Name + Badges -->\r\n\r\n                <div class=\"flex items-start justify-between gap-2 mb-1\">\r\n\r\n                  <div class=\"flex-1 min-w-0\">\r\n\r\n                    <h3 class=\"text-white font-bold text-base truncate\">{{ getCounterpartyName(request) }}</h3>\r\n\r\n                    <div class=\"flex flex-wrap items-center gap-2 mt-1.5\">\r\n\r\n                      <!-- Credibility Score Badge -->\r\n\r\n                      <span class=\"inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30\">\r\n\r\n                        <svg class=\"w-3 h-3\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n\r\n                          <path d=\"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z\"/>\r\n\r\n                        </svg>\r\n\r\n                        {{ getCredibilityScore(request) }}\r\n\r\n                      </span>\r\n\r\n                      <!-- Trust Level Badge -->\r\n\r\n                      <span class=\"inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30\">\r\n\r\n                        <svg class=\"w-3 h-3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\"/>\r\n\r\n                        </svg>\r\n\r\n                        {{ getTrustLevel(request) }}\r\n\r\n                      </span>\r\n\r\n                    </div>\r\n\r\n                  </div>\r\n\r\n                  <!-- Status Badge -->\r\n\r\n                  <span class=\"flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border\"\r\n\r\n                        [class.bg-amber-500/15]=\"isPendingRequest(request)\"\r\n\r\n                        [class.text-amber-300]=\"isPendingRequest(request)\"\r\n\r\n                        [class.border-amber-500/30]=\"isPendingRequest(request)\"\r\n\r\n                        [class.bg-green-500/15]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                        [class.text-green-300]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                        [class.border-green-500/30]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                        [class.bg-red-500/15]=\"request.status === 'Declined' || request.status === 'Rejected'\"\r\n\r\n                        [class.text-red-300]=\"request.status === 'Declined' || request.status === 'Rejected'\"\r\n\r\n                        [class.border-red-500/30]=\"request.status === 'Declined' || request.status === 'Rejected'\">\r\n\r\n                    <span class=\"w-1.5 h-1.5 rounded-full\"\r\n\r\n                          [class.bg-amber-400]=\"isPendingRequest(request)\"\r\n\r\n                          [class.bg-green-400]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                          [class.bg-red-400]=\"request.status === 'Declined' || request.status === 'Rejected'\"></span>\r\n\r\n                    {{ getStatusDisplay(request) }}\r\n\r\n                  </span>\r\n\r\n                </div>\r\n\r\n              </div>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Project Info -->\r\n\r\n            <div class=\"bg-slate-800/50 rounded-xl p-3 mb-3\">\r\n\r\n              <div class=\"flex items-center gap-2 mb-2\">\r\n\r\n                <svg class=\"w-4 h-4 text-purple-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4\"/>\r\n\r\n                </svg>\r\n\r\n                <span class=\"text-xs font-semibold text-gray-400 uppercase tracking-wide\">{{ 'requests.opportunityLabel' | translate }}</span>\r\n\r\n              </div>\r\n\r\n              <h4 class=\"text-white font-semibold text-sm mb-1\">{{ request.projectName }}</h4>\r\n\r\n              <p class=\"text-xs leading-5 text-slate-400 mt-2\">{{ getDirectionCopy(request) }}</p>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Request Type Badge -->\r\n\r\n            <div class=\"flex items-center gap-2 mb-3\">\r\n\r\n              <span class=\"inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-lg border\"\r\n\r\n                    [ngClass]=\"getRequestTypeBadgeClass(request)\">\r\n\r\n                <svg class=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z\"/>\r\n\r\n                </svg>\r\n\r\n                {{ getRequestTypeDisplay(request) }}\r\n\r\n              </span>\r\n\r\n              <span class=\"text-xs text-gray-500\">\r\n\r\n                <svg class=\"w-3 h-3 inline mr-1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\"/>\r\n\r\n                </svg>\r\n\r\n                {{ getTimeAgo(request.createdAt) }}\r\n\r\n              </span>\r\n\r\n              <span class=\"text-xs text-gray-600 ml-auto\">{{ getExactDateTime(request.createdAt) }}</span>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Investment Interest Metadata -->\r\n\r\n            @if (hasParticipationMetadata(request)) {\r\n\r\n              <div class=\"bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-3\">\r\n\r\n                <div class=\"flex items-center gap-2 mb-2\">\r\n\r\n                  <svg class=\"w-4 h-4 text-purple-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                    <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"/>\r\n\r\n                  </svg>\r\n\r\n                  <span class=\"text-xs font-semibold text-purple-300 uppercase tracking-wide\">Opportunity Details</span>\r\n\r\n                </div>\r\n\r\n                @if (isLoanRequest(request)) {\r\n                  <div class=\"mb-3 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-200\">\r\n                    Investment Model: Loan\r\n                  </div>\r\n                  <div class=\"grid grid-cols-2 gap-3\">\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Contribution Amount</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getLoanContributionAmount(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Return Rate</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getLoanReturnRate(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Term</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getLoanTerm(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Repayment</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getLoanRepaymentModel(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Expected Return</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getLoanExpectedReturn(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Total Repayment</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getLoanExpectedTotalRepayment(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                  </div>\r\n                } @else if (isProfitSharingRequest(request)) {\r\n                  <div class=\"mb-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200\">\r\n                    Investment Model: Profit Sharing\r\n                  </div>\r\n                  <div class=\"grid grid-cols-2 gap-3\">\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Contribution Amount</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getProfitSharingContributionAmount(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Profit Share %</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharePercentage(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Duration / Term</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharingTerm(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Exit Terms</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharingExitTerms(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Expected Profit</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ formatOptionalMoney(request, getProfitSharingExpectedProfit(request)) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Expected Payout</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ formatOptionalMoney(request, getProfitSharingExpectedTotalPayout(request)) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Opportunity Payout</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ formatOptionalMoney(request, getProfitSharingOpportunityTotalPayout(request)) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Contract Period</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharingContractPeriod(request) }}</p>\r\n                    </div>\r\n                  </div>\r\n                } @else {\r\n                <div class=\"mb-3 inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-200\">\r\n                  Investment Model: Equity\r\n                </div>\r\n                <div class=\"grid grid-cols-3 gap-3\">\r\n\r\n                  <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n\r\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Shares</p>\r\n\r\n                    <p class=\"text-white font-bold text-sm\">{{ getSharesRequested(request) | number }}</p>\r\n\r\n                  </div>\r\n\r\n                  <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n\r\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Price</p>\r\n\r\n                    <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getSharePrice(request) | number:'1.2-2' }}</p>\r\n\r\n                  </div>\r\n\r\n                  <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n\r\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Total</p>\r\n\r\n                    <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getTotalValue(request) | number:'1.2-2' }}</p>\r\n\r\n                  </div>\r\n\r\n                </div>\r\n                }\r\n\r\n              </div>\r\n\r\n            }\r\n\r\n\r\n\r\n            <!-- Action buttons -->\r\n\r\n            @if (canShowAcceptReject(request)) {\r\n\r\n              <div class=\"flex gap-3 pt-3 border-t border-slate-800\">\r\n\r\n                <button (click)=\"accept(request)\"\r\n\r\n                        class=\"flex-1 flex items-center justify-center gap-2 bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors\">\r\n\r\n                  <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.5 12.75l6 6 9-13.5\"/></svg>\r\n\r\n                  {{ getPrimaryActionLabel(request) }}\r\n\r\n                </button>\r\n\r\n                <button (click)=\"decline(request)\"\r\n\r\n                        class=\"flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-gray-300 hover:text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all\">\r\n\r\n                  <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 18L18 6M6 6l12 12\"/></svg>\r\n\r\n                  {{ request.requestType === OpportunityRequestKind.Conversation ? ('requests.actions.rejectChat' | translate) : ('requests.actions.rejectParticipation' | translate) }}\r\n\r\n                </button>\r\n\r\n              </div>\r\n\r\n            }\r\n\r\n            @if (canShowWithdraw(request)) {\r\n              <div class=\"flex gap-3 pt-3 border-t border-slate-800\">\r\n                <button (click)=\"withdraw(request)\"\r\n                        class=\"flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-gray-400 hover:text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all\">\r\n                  <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 18L18 6M6 6l12 12\"/></svg>\r\n                  {{ 'requests.actions.withdraw' | translate }}\r\n                </button>\r\n              </div>\r\n            }\r\n\r\n          </div>\r\n\r\n        </article>\r\n\r\n      } @empty {\r\n\r\n        <div class=\"col-span-full flex flex-col items-center justify-center py-24 text-center animate-fade-in\">\r\n\r\n          <div class=\"w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4\">\r\n\r\n            <svg class=\"w-7 h-7 text-gray-500\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\">\r\n\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6\"/>\r\n\r\n            </svg>\r\n\r\n          </div>\r\n\r\n          <p class=\"text-lg font-semibold text-white mb-1\">{{ getEmptyTitle() }}</p>\r\n\r\n          <p class=\"text-sm text-gray-500\">{{ getEmptySubtitle() }}</p>\r\n\r\n        </div>\r\n\r\n      }\r\n\r\n    </div>\r\n\r\n\r\n\r\n    <!-- Pagination -->\r\n\r\n    @if (totalPages() > 1) {\r\n\r\n      <div class=\"flex items-center justify-center gap-2 mt-8\">\r\n\r\n        <button (click)=\"previousPage()\"\r\n\r\n                [disabled]=\"currentPage() === 1\"\r\n\r\n                class=\"px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all\">\r\n\r\n          Previous\r\n\r\n        </button>\r\n\r\n        @for (page of [totalPages()]; track page) {\r\n\r\n          @if (page <= 7 || page === totalPages() || (page >= currentPage() - 2 && page <= currentPage() + 2)) {\r\n\r\n            <button (click)=\"goToPage(page)\"\r\n\r\n                    [class.bg-blue-600]=\"currentPage() === page\"\r\n\r\n                    [class.text-white]=\"currentPage() === page\"\r\n\r\n                    [class.bg-slate-800]=\"currentPage() !== page\"\r\n\r\n                    [class.text-gray-400]=\"currentPage() !== page\"\r\n\r\n                    [class.hover:bg-slate-700]=\"currentPage() !== page\"\r\n\r\n                    class=\"px-4 py-2 border border-slate-700 rounded-lg text-sm transition-all\">\r\n\r\n              {{ page }}\r\n\r\n            </button>\r\n\r\n          } @else if (page === currentPage() + 3 || page === currentPage() - 3) {\r\n\r\n            <span class=\"text-gray-500\">...</span>\r\n\r\n          }\r\n\r\n        }\r\n\r\n        <button (click)=\"nextPage()\"\r\n\r\n                [disabled]=\"currentPage() === totalPages()\"\r\n\r\n                class=\"px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all\">\r\n\r\n          Next\r\n\r\n        </button>\r\n\r\n      </div>\r\n\r\n    }\r\n\r\n  }\r\n\r\n\r\n\r\n  <!-- \u2500\u2500 OUTGOING (Investor Requests) \u2500\u2500 -->\r\n\r\n  @if (tab() === 'outgoing') {\r\n\r\n    <div class=\"grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in\">\r\n\r\n      @for (request of paginatedRequests(); track request.id) {\r\n\r\n        @if (shouldShowSectionHeader(request, $index)) {\r\n\r\n          <div class=\"col-span-full mt-2 flex items-center justify-between border-b border-slate-800 pb-2\">\r\n\r\n            <h2 class=\"text-sm font-bold uppercase tracking-wide text-slate-300\">{{ getSectionTitle(request) }}</h2>\r\n\r\n            <span class=\"text-xs font-semibold text-slate-500\">{{ getSectionCount(request) }} {{ 'requests.filters.requests' | translate | lowercase }}</span>\r\n\r\n          </div>\r\n\r\n        }\r\n        <article class=\"relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600/60 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 group\">\r\n\r\n\r\n\r\n          <!-- Status accent strip -->\r\n\r\n          <div class=\"absolute top-0 inset-x-0 h-1 rounded-t-2xl\"\r\n\r\n               [class.bg-amber-500]=\"isPendingRequest(request)\"\r\n\r\n               [class.bg-green-500]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n               [class.bg-red-500]=\"request.status === 'Declined' || request.status === 'Rejected'\"></div>\r\n\r\n\r\n\r\n          <div class=\"p-5\">\r\n\r\n            <!-- Founder Header -->\r\n\r\n            <div class=\"flex items-start gap-4 mb-4\">\r\n\r\n              <!-- Founder Avatar -->\r\n\r\n              <div class=\"relative flex-shrink-0\">\r\n\r\n                <div class=\"w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-slate-600 flex items-center justify-center ring-2 ring-slate-700 group-hover:ring-slate-500 transition-all\">\r\n\r\n                  <svg class=\"w-7 h-7 text-orange-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\">\r\n\r\n                    <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\"/>\r\n\r\n                  </svg>\r\n\r\n                </div>\r\n\r\n              </div>\r\n\r\n\r\n\r\n              <div class=\"flex-1 min-w-0\">\r\n\r\n                <!-- Founder Name + Badges -->\r\n\r\n                <div class=\"flex items-start justify-between gap-2 mb-1\">\r\n\r\n                  <div class=\"flex-1 min-w-0\">\r\n\r\n                    <h3 class=\"text-white font-bold text-base truncate\">{{ getCounterpartyName(request) }}</h3>\r\n\r\n                    <div class=\"flex flex-wrap items-center gap-2 mt-1.5\">\r\n\r\n                      <!-- Founder Score Badge -->\r\n\r\n                      <span class=\"inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30\">\r\n\r\n                        <svg class=\"w-3 h-3\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n\r\n                          <path d=\"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z\"/>\r\n\r\n                        </svg>\r\n\r\n                        {{ getFounderScore(request) }}\r\n\r\n                      </span>\r\n\r\n                      <!-- Trust Level Badge -->\r\n\r\n                      <span class=\"inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30\">\r\n\r\n                        <svg class=\"w-3 h-3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\"/>\r\n\r\n                        </svg>\r\n\r\n                        {{ getTrustLevel(request) }}\r\n\r\n                      </span>\r\n\r\n                    </div>\r\n\r\n                  </div>\r\n\r\n                  <!-- Status Badge -->\r\n\r\n                  <span class=\"flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border\"\r\n\r\n                        [class.bg-amber-500/15]=\"isPendingRequest(request)\"\r\n\r\n                        [class.text-amber-300]=\"isPendingRequest(request)\"\r\n\r\n                        [class.border-amber-500/30]=\"isPendingRequest(request)\"\r\n\r\n                        [class.bg-green-500/15]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                        [class.text-green-300]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                        [class.border-green-500/30]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                        [class.bg-red-500/15]=\"request.status === 'Declined' || request.status === 'Rejected'\"\r\n\r\n                        [class.text-red-300]=\"request.status === 'Declined' || request.status === 'Rejected'\"\r\n\r\n                        [class.border-red-500/30]=\"request.status === 'Declined' || request.status === 'Rejected'\">\r\n\r\n                    <span class=\"w-1.5 h-1.5 rounded-full\"\r\n\r\n                          [class.bg-amber-400]=\"isPendingRequest(request)\"\r\n\r\n                          [class.bg-green-400]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                          [class.bg-red-400]=\"request.status === 'Declined' || request.status === 'Rejected'\"></span>\r\n\r\n                    {{ getStatusDisplay(request) }}\r\n\r\n                  </span>\r\n\r\n                </div>\r\n\r\n              </div>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Project Info -->\r\n\r\n            <div class=\"bg-slate-800/50 rounded-xl p-3 mb-3\">\r\n\r\n              <div class=\"flex items-center gap-2 mb-2\">\r\n\r\n                <svg class=\"w-4 h-4 text-purple-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4\"/>\r\n\r\n                </svg>\r\n\r\n                <span class=\"text-xs font-semibold text-gray-400 uppercase tracking-wide\">Opportunity</span>\r\n\r\n              </div>\r\n\r\n              <h4 class=\"text-white font-semibold text-sm mb-1\">{{ request.projectName }}</h4>\r\n              <p class=\"text-xs leading-5 text-slate-400 mt-2\">{{ getDirectionCopy(request) }}</p>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Request Type Badge -->\r\n\r\n            <div class=\"flex items-center gap-2 mb-3\">\r\n\r\n              <span class=\"inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-lg border\"\r\n\r\n                    [ngClass]=\"getRequestTypeBadgeClass(request)\">\r\n\r\n                <svg class=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z\"/>\r\n\r\n                </svg>\r\n\r\n                {{ getRequestTypeDisplay(request) }}\r\n\r\n              </span>\r\n\r\n              <span class=\"text-xs text-gray-500\">\r\n\r\n                <svg class=\"w-3 h-3 inline mr-1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\"/>\r\n\r\n                </svg>\r\n\r\n                {{ getTimeAgo(request.createdAt) }}\r\n\r\n              </span>\r\n\r\n              <span class=\"text-xs text-gray-600 ml-auto\">{{ getExactDateTime(request.createdAt) }}</span>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Investment Interest Metadata -->\r\n\r\n            @if (hasParticipationMetadata(request)) {\r\n\r\n              <div class=\"bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-3\">\r\n\r\n                <div class=\"flex items-center gap-2 mb-2\">\r\n\r\n                  <svg class=\"w-4 h-4 text-purple-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\r\n\r\n                    <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"/>\r\n\r\n                  </svg>\r\n\r\n                  <span class=\"text-xs font-semibold text-purple-300 uppercase tracking-wide\">Opportunity Details</span>\r\n\r\n                </div>\r\n\r\n                @if (isLoanRequest(request)) {\r\n                  <div class=\"mb-3 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-200\">\r\n                    Investment Model: Loan\r\n                  </div>\r\n                  <div class=\"grid grid-cols-2 gap-3\">\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Contribution Amount</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getLoanContributionAmount(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Return Rate</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getLoanReturnRate(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Term</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getLoanTerm(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Repayment</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getLoanRepaymentModel(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Expected Return</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getLoanExpectedReturn(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Total Repayment</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getLoanExpectedTotalRepayment(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                  </div>\r\n                } @else if (isProfitSharingRequest(request)) {\r\n                  <div class=\"mb-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200\">\r\n                    Investment Model: Profit Sharing\r\n                  </div>\r\n                  <div class=\"grid grid-cols-2 gap-3\">\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Contribution Amount</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getProfitSharingContributionAmount(request) | number:'1.2-2' }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Profit Share %</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharePercentage(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Duration / Term</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharingTerm(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Exit Terms</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharingExitTerms(request) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Expected Profit</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ formatOptionalMoney(request, getProfitSharingExpectedProfit(request)) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Expected Payout</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ formatOptionalMoney(request, getProfitSharingExpectedTotalPayout(request)) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Opportunity Payout</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ formatOptionalMoney(request, getProfitSharingOpportunityTotalPayout(request)) }}</p>\r\n                    </div>\r\n                    <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Contract Period</p>\r\n                      <p class=\"text-white font-bold text-sm\">{{ getProfitSharingContractPeriod(request) }}</p>\r\n                    </div>\r\n                  </div>\r\n                } @else {\r\n                <div class=\"mb-3 inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-200\">\r\n                  Investment Model: Equity\r\n                </div>\r\n                <div class=\"grid grid-cols-3 gap-3\">\r\n\r\n                  <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n\r\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Shares</p>\r\n\r\n                    <p class=\"text-white font-bold text-sm\">{{ getSharesRequested(request) | number }}</p>\r\n\r\n                  </div>\r\n\r\n                  <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n\r\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Price</p>\r\n\r\n                    <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getSharePrice(request) | number:'1.2-2' }}</p>\r\n\r\n                  </div>\r\n\r\n                  <div class=\"bg-slate-800/50 rounded-lg p-2 text-center\">\r\n\r\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">Total</p>\r\n\r\n                    <p class=\"text-white font-bold text-sm\">{{ getRequestCurrency(request) }} {{ getTotalValue(request) | number:'1.2-2' }}</p>\r\n\r\n                  </div>\r\n\r\n                </div>\r\n                }\r\n\r\n              </div>\r\n\r\n            }\r\n\r\n\r\n\r\n            <!-- Timeline Progress -->\r\n\r\n            <div class=\"flex items-center gap-2 mb-3\">\r\n\r\n              <div class=\"flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden\">\r\n\r\n                <div class=\"h-full rounded-full transition-all duration-500\"\r\n\r\n                     [class.bg-amber-500]=\"isPendingRequest(request)\"\r\n\r\n                     [class.bg-green-500]=\"request.status === 'Accepted' || request.status === 'Partner'\"\r\n\r\n                     [class.bg-red-500]=\"request.status === 'Declined' || request.status === 'Rejected'\"\r\n\r\n                     [style.width.%]=\"getProgressPercentage(request)\"></div>\r\n\r\n              </div>\r\n\r\n              <span class=\"text-[10px] text-gray-500\">{{ getProgressLabel(request) }}</span>\r\n\r\n            </div>\r\n\r\n\r\n\r\n            <!-- Withdraw button -->\r\n\r\n            @if (canShowWithdraw(request)) {\r\n\r\n              <div class=\"flex gap-3 pt-3 border-t border-slate-800\">\r\n\r\n                <button (click)=\"withdraw(request)\"\r\n\r\n                        class=\"flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-gray-400 hover:text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all\">\r\n\r\n                  <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 18L18 6M6 6l12 12\"/></svg>\r\n\r\n                  {{ 'requests.actions.withdrawRequest' | translate }}\r\n\r\n                </button>\r\n\r\n              </div>\r\n\r\n            }\r\n\r\n          </div>\r\n\r\n        </article>\r\n\r\n      } @empty {\r\n\r\n        <div class=\"col-span-full flex flex-col items-center justify-center py-24 text-center animate-fade-in\">\r\n\r\n          <div class=\"w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4\">\r\n\r\n            <svg class=\"w-7 h-7 text-gray-500\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\">\r\n\r\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6\"/>\r\n\r\n            </svg>\r\n\r\n          </div>\r\n\r\n          <p class=\"text-lg font-semibold text-white mb-1\">{{ getEmptyTitle() }}</p>\r\n\r\n          <p class=\"text-sm text-gray-500\">{{ getEmptySubtitle() }}</p>\r\n\r\n        </div>\r\n\r\n      }\r\n\r\n    </div>\r\n\r\n\r\n\r\n    <!-- Pagination -->\r\n\r\n    @if (totalPages() > 1) {\r\n\r\n      <div class=\"flex items-center justify-center gap-2 mt-8\">\r\n\r\n        <button (click)=\"previousPage()\"\r\n\r\n                [disabled]=\"currentPage() === 1\"\r\n\r\n                class=\"px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all\">\r\n\r\n          Previous\r\n\r\n        </button>\r\n\r\n        @for (page of [totalPages()]; track page) {\r\n\r\n          @if (page <= 7 || page === totalPages() || (page >= currentPage() - 2 && page <= currentPage() + 2)) {\r\n\r\n            <button (click)=\"goToPage(page)\"\r\n\r\n                    [class.bg-blue-600]=\"currentPage() === page\"\r\n\r\n                    [class.text-white]=\"currentPage() === page\"\r\n\r\n                    [class.bg-slate-800]=\"currentPage() !== page\"\r\n\r\n                    [class.text-gray-400]=\"currentPage() !== page\"\r\n\r\n                    [class.hover:bg-slate-700]=\"currentPage() !== page\"\r\n\r\n                    class=\"px-4 py-2 border border-slate-700 rounded-lg text-sm transition-all\">\r\n\r\n              {{ page }}\r\n\r\n            </button>\r\n\r\n          } @else if (page === currentPage() + 3 || page === currentPage() - 3) {\r\n\r\n            <span class=\"text-gray-500\">...</span>\r\n\r\n          }\r\n\r\n        }\r\n\r\n        <button (click)=\"nextPage()\"\r\n\r\n                [disabled]=\"currentPage() === totalPages()\"\r\n\r\n                class=\"px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all\">\r\n\r\n          Next\r\n\r\n        </button>\r\n\r\n      </div>\r\n\r\n    }\r\n\r\n  }\r\n\r\n\r\n\r\n</section>\r\n\r\n\r\n", styles: ["/* Badge Styles */\r\n.badge {\r\n  border-radius: 9999px;\r\n  padding: 0.25rem 0.5rem;\r\n  font-size: 0.75rem;\r\n}\r\n\r\n/* Card Hover Effects - DISABLED */\r\n/* article {\r\n  &:hover {\r\n    transform: translateY(-2px);\r\n  }\r\n} */\r\n\r\n/* Status Badge Colors */\r\n.status-badge {\r\n  &.pending {\r\n    background: rgba(245, 158, 11, 0.15);\r\n    color: #fbbf24;\r\n    border-color: rgba(245, 158, 11, 0.3);\r\n  }\r\n\r\n  &.accepted {\r\n    background: rgba(16, 185, 129, 0.15);\r\n    color: #34d399;\r\n    border-color: rgba(16, 185, 129, 0.3);\r\n  }\r\n\r\n  &.declined {\r\n    background: rgba(239, 68, 68, 0.15);\r\n    color: #f87171;\r\n    border-color: rgba(239, 68, 68, 0.3);\r\n  }\r\n}\r\n\r\n/* Request Type Badge Colors */\r\n.request-type-badge {\r\n  &.contact-founder {\r\n    background: rgba(59, 130, 246, 0.15);\r\n    color: #60a5fa;\r\n    border-color: rgba(59, 130, 246, 0.3);\r\n  }\r\n\r\n  &.investment-interest {\r\n    background: rgba(168, 85, 247, 0.15);\r\n    color: #c084fc;\r\n    border-color: rgba(168, 85, 247, 0.3);\r\n  }\r\n}\r\n\r\n/* Credibility/Trust Badge Colors */\r\n.score-badge {\r\n  background: rgba(16, 185, 129, 0.15);\r\n  color: #34d399;\r\n  border-color: rgba(16, 185, 129, 0.3);\r\n}\r\n\r\n.trust-badge {\r\n  background: rgba(6, 182, 212, 0.15);\r\n  color: #22d3ee;\r\n  border-color: rgba(6, 182, 212, 0.3);\r\n}\r\n\r\n/* Investment Details Section */\r\n.investment-details {\r\n  background: rgba(168, 85, 247, 0.1);\r\n  border-color: rgba(168, 85, 247, 0.3);\r\n\r\n  .detail-box {\r\n    background: rgba(30, 41, 59, 0.5);\r\n  }\r\n}\r\n\r\n/* Project Info Section */\r\n.project-info {\r\n  background: rgba(30, 41, 59, 0.5);\r\n}\r\n\r\n/* Avatar Styles */\r\n.avatar {\r\n  &.investor {\r\n    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2));\r\n  }\r\n\r\n  &.founder {\r\n    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2));\r\n  }\r\n}\r\n\r\n/* Timeline Progress - DISABLED TRANSITION */\r\n/* .timeline-progress {\r\n  .progress-bar {\r\n    transition: width 0.5s ease-in-out;\r\n  }\r\n} */\r\n\r\n/* Button Styles - DISABLED HOVER TRANSITIONS */\r\n.action-button {\r\n  &.approve {\r\n    background: rgba(16, 185, 129, 0.9);\r\n  }\r\n\r\n  &.reject,\r\n  &.withdraw {\r\n    background: rgba(30, 41, 59, 1);\r\n    border-color: rgba(51, 65, 85, 1);\r\n  }\r\n}\r\n\r\n/* Empty State */\r\n.empty-state {\r\n  .empty-icon {\r\n    background: rgba(30, 41, 59, 1);\r\n    border-color: rgba(51, 65, 85, 1);\r\n  }\r\n}\r\n\r\n/* Animation - DISABLED */\r\n/* @keyframes fade-in {\r\n  from {\r\n    opacity: 0;\r\n    transform: translateY(10px);\r\n  }\r\n  to {\r\n    opacity: 1;\r\n    transform: translateY(0);\r\n  }\r\n} */\r\n\r\n/* .animate-fade-in {\r\n  animation: fade-in 0.3s ease-out;\r\n} */\r\n\r\n:host-context(body.investa-theme-light) {\r\n  .status-badge {\r\n    &.pending {\r\n      background: rgba(245, 158, 11, 0.12);\r\n      color: #92400e;\r\n      border-color: rgba(245, 158, 11, 0.28);\r\n    }\r\n\r\n    &.accepted {\r\n      background: rgba(16, 185, 129, 0.12);\r\n      color: #047857;\r\n      border-color: rgba(16, 185, 129, 0.28);\r\n    }\r\n\r\n    &.declined {\r\n      background: rgba(239, 68, 68, 0.1);\r\n      color: #b91c1c;\r\n      border-color: rgba(239, 68, 68, 0.24);\r\n    }\r\n  }\r\n\r\n  .request-type-badge.contact-founder {\r\n    background: rgba(37, 99, 235, 0.1);\r\n    color: #1d4ed8;\r\n    border-color: rgba(37, 99, 235, 0.24);\r\n  }\r\n\r\n  .request-type-badge.investment-interest {\r\n    background: rgba(126, 34, 206, 0.1);\r\n    color: #6b21a8;\r\n    border-color: rgba(126, 34, 206, 0.22);\r\n  }\r\n\r\n  .score-badge {\r\n    background: rgba(16, 185, 129, 0.12);\r\n    color: #047857;\r\n    border-color: rgba(16, 185, 129, 0.24);\r\n  }\r\n\r\n  .trust-badge {\r\n    background: rgba(8, 145, 178, 0.1);\r\n    color: #0e7490;\r\n    border-color: rgba(8, 145, 178, 0.24);\r\n  }\r\n\r\n  .investment-details,\r\n  .investment-details .detail-box,\r\n  .project-info,\r\n  .empty-state .empty-icon {\r\n    background: var(--investa-surface-2);\r\n    border-color: var(--investa-border);\r\n  }\r\n\r\n  .action-button.reject,\r\n  .action-button.withdraw {\r\n    background: #ffffff;\r\n    color: var(--investa-text-primary);\r\n    border-color: var(--investa-border);\r\n  }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RequestsComponent, { className: "RequestsComponent", filePath: "src/app/pages/admin/requests/requests.component.ts", lineNumber: 34 }); })();
