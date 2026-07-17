import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpportunityService } from '../../services/opportunity.service';
import { NotificationService } from '../../services/notification.service';
import { WalletService } from '../../services/wallet.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/common";
function ParticipationBuilderComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.loading"));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_0_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "number");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const f_r3 = i0.ɵɵnextContext(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.minimumShares"), ": ", i0.ɵɵpipeBind1(2, 2, f_r3.minimumShares));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_0_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "number");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const f_r3 = i0.ɵɵnextContext(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.maximumShares"), ": ", i0.ɵɵpipeBind1(2, 2, f_r3.maximumShares));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_0_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.validationMessage());
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 22)(1, "div", 23)(2, "p", 24);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 25);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 26);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 23)(9, "p", 24);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 4);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 23)(15, "p", 24);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 27);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(20, "div", 28)(21, "div", 29)(22, "div")(23, "p", 24);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "p", 30);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "div", 31);
    i0.ɵɵconditionalCreate(28, ParticipationBuilderComponent_Conditional_14_Conditional_0_Conditional_28_Template, 3, 4, "p");
    i0.ɵɵconditionalCreate(29, ParticipationBuilderComponent_Conditional_14_Conditional_0_Conditional_29_Template, 3, 4, "p");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(30, "div", 28)(31, "label", 32);
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "div", 33)(34, "button", 34);
    i0.ɵɵlistener("click", function ParticipationBuilderComponent_Conditional_14_Conditional_0_Template_button_click_34_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.decrease()); });
    i0.ɵɵtext(35, " - ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "input", 35);
    i0.ɵɵlistener("ngModelChange", function ParticipationBuilderComponent_Conditional_14_Conditional_0_Template_input_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onSharesInput($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "button", 34);
    i0.ɵɵlistener("click", function ParticipationBuilderComponent_Conditional_14_Conditional_0_Template_button_click_37_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.increase()); });
    i0.ɵɵtext(38, " + ");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(39, ParticipationBuilderComponent_Conditional_14_Conditional_0_Conditional_39_Template, 2, 1, "p", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "div", 37)(41, "p", 38);
    i0.ɵɵtext(42);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "div", 39)(44, "div", 11)(45, "span");
    i0.ɵɵtext(46);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "strong", 13);
    i0.ɵɵtext(48);
    i0.ɵɵpipe(49, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div", 11)(51, "span");
    i0.ɵɵtext(52);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "strong", 13);
    i0.ɵɵtext(54);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(55, "div", 40)(56, "span", 41);
    i0.ɵɵtext(57);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "strong", 13);
    i0.ɵɵtext(59);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(60, "p", 42);
    i0.ɵɵtext(61);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const f_r3 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.investmentModel"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.models.equity"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(f_r3.currency || ctx_r0.t("participationBuilder.currencyFallback"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.totalShares"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 26, f_r3.totalShares || 0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.availableShares"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 28, f_r3.availableShares || 0));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.pricePerShare"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.sharePrice));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(f_r3.minimumShares ? 28 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(f_r3.maximumShares ? 29 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.numberOfShares"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r0.canDecrease());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r0.selectedShares())("min", ctx_r0.minShares())("max", ctx_r0.maxShares());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r0.canIncrease());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.validationMessage() ? 39 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.calculatedTotal"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.selectedShares"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(49, 30, ctx_r0.selectedShares()));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.pricePerShare"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.sharePrice));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.estimatedInvestment"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(ctx_r0.estimatedTotal()));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.previewHelper"));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.minimum"), ": ", ctx_r0.money(ctx_r0.minContribution()));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.maximum"), ": ", ctx_r0.money(ctx_r0.maxContribution()));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.remainingFundingLimit"), ": ", ctx_r0.money(ctx_r0.remainingFunding()));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.validationMessage());
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 43)(1, "p", 24);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 44)(4, "p", 45);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 46);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "p", 47);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "div", 48)(11, "div", 23)(12, "p", 24);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "p", 4);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 23)(17, "p", 24);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "p", 4);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 23)(22, "p", 24);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "p", 27);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "div", 28)(27, "label", 32);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 49)(30, "input", 50);
    i0.ɵɵlistener("ngModelChange", function ParticipationBuilderComponent_Conditional_14_Conditional_1_Template_input_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onContributionInput($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(31, "div", 51);
    i0.ɵɵconditionalCreate(32, ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_32_Template, 2, 2, "p");
    i0.ɵɵconditionalCreate(33, ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_33_Template, 2, 2, "p");
    i0.ɵɵconditionalCreate(34, ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_34_Template, 2, 2, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(35, ParticipationBuilderComponent_Conditional_14_Conditional_1_Conditional_35_Template, 2, 1, "p", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "div", 28)(37, "p", 52);
    i0.ɵɵtext(38);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "div", 53)(40, "div", 11)(41, "span", 12);
    i0.ɵɵtext(42);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "strong", 13);
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 11)(46, "span", 12);
    i0.ɵɵtext(47);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "strong", 13);
    i0.ɵɵtext(49);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div", 11)(51, "span", 12);
    i0.ɵɵtext(52);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "strong", 13);
    i0.ɵɵtext(54);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(55, "div", 11)(56, "span", 12);
    i0.ɵɵtext(57);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "strong", 13);
    i0.ɵɵtext(59);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(60, "div", 37)(61, "p", 38);
    i0.ɵɵtext(62);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "div", 39)(64, "div", 11)(65, "span");
    i0.ɵɵtext(66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(67, "strong", 13);
    i0.ɵɵtext(68);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(69, "div", 11)(70, "span");
    i0.ɵɵtext(71);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(72, "strong", 13);
    i0.ɵɵtext(73);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(74, "div", 40)(75, "span", 41);
    i0.ɵɵtext(76);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(77, "strong", 13);
    i0.ɵɵtext(78);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(79, "p", 42);
    i0.ɵɵtext(80);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const f_r3 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.opportunityContext"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(f_r3.opportunityTitle || ctx_r0.opportunityTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.modelLabel());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(f_r3.currency || ctx_r0.t("participationBuilder.currencyFallback"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.fundingTarget"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.fundingTarget));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.alreadyFunded"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.alreadyFundedAmount));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.remainingFunding"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.remainingFundingAmount));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.yourContribution"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r0.contributionAmount())("min", ctx_r0.minContribution() || 0)("max", ctx_r0.remainingFunding() || ctx_r0.maxContribution() || null);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.minContribution() !== null ? 32 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.maxContribution() !== null ? 33 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.remainingFunding() !== null ? 34 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.validationMessage() ? 35 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.loanTerms"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.returnRate"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.returnRateText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.term"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.termText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.repaymentModel"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(f_r3.repaymentModel || ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.maturityDate"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.maturityDateText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.expectedOutcome"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.yourContribution"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(ctx_r0.contributionAmount()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.expectedReturn"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(ctx_r0.expectedReturn()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.expectedRepayment"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(ctx_r0.expectedTotalRepayment()));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.backendTermsHelper"));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.minimum"), ": ", ctx_r0.money(ctx_r0.minContribution()));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.maximum"), ": ", ctx_r0.money(ctx_r0.maxContribution()));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.t("participationBuilder.labels.remainingFundingLimit"), ": ", ctx_r0.money(ctx_r0.remainingFunding()));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.validationMessage());
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 43)(1, "p", 24);
    i0.ɵɵtext(2, "Opportunity Context");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 44)(4, "p", 45);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 54);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "p", 47);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "div", 48)(11, "div", 23)(12, "p", 24);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "p", 4);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 23)(17, "p", 24);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "p", 4);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 23)(22, "p", 24);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "p", 27);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "div", 28)(27, "label", 32);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 49)(30, "input", 55);
    i0.ɵɵlistener("ngModelChange", function ParticipationBuilderComponent_Conditional_14_Conditional_2_Template_input_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onContributionInput($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(31, "div", 51);
    i0.ɵɵconditionalCreate(32, ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_32_Template, 2, 2, "p");
    i0.ɵɵconditionalCreate(33, ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_33_Template, 2, 2, "p");
    i0.ɵɵconditionalCreate(34, ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_34_Template, 2, 2, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(35, ParticipationBuilderComponent_Conditional_14_Conditional_2_Conditional_35_Template, 2, 1, "p", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "div", 28)(37, "p", 52);
    i0.ɵɵtext(38);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "div", 53)(40, "div", 11)(41, "span", 12);
    i0.ɵɵtext(42);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "strong", 13);
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 11)(46, "span", 12);
    i0.ɵɵtext(47);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "strong", 13);
    i0.ɵɵtext(49);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div", 11)(51, "span", 12);
    i0.ɵɵtext(52);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "strong", 13);
    i0.ɵɵtext(54);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(55, "div", 11)(56, "span", 12);
    i0.ɵɵtext(57);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "strong", 13);
    i0.ɵɵtext(59);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(60, "div", 11)(61, "span", 12);
    i0.ɵɵtext(62);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "strong", 13);
    i0.ɵɵtext(64);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(65, "div", 11)(66, "span", 12);
    i0.ɵɵtext(67);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(68, "strong", 13);
    i0.ɵɵtext(69);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(70, "div", 56)(71, "p", 12);
    i0.ɵɵtext(72);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(73, "p", 57);
    i0.ɵɵtext(74);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(75, "div", 58)(76, "p", 59);
    i0.ɵɵtext(77);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(78, "div", 39)(79, "div", 11)(80, "span");
    i0.ɵɵtext(81);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(82, "strong", 13);
    i0.ɵɵtext(83);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(84, "div", 11)(85, "span");
    i0.ɵɵtext(86);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(87, "strong", 13);
    i0.ɵɵtext(88);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(89, "div", 11)(90, "span");
    i0.ɵɵtext(91);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(92, "strong", 13);
    i0.ɵɵtext(93);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(94, "div", 11)(95, "span");
    i0.ɵɵtext(96);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(97, "strong", 13);
    i0.ɵɵtext(98);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(99, "div", 11)(100, "span");
    i0.ɵɵtext(101);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(102, "strong", 13);
    i0.ɵɵtext(103);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(104, "div", 11)(105, "span");
    i0.ɵɵtext(106);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(107, "strong", 13);
    i0.ɵɵtext(108);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(109, "div", 11)(110, "span");
    i0.ɵɵtext(111);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(112, "strong", 13);
    i0.ɵɵtext(113);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(114, "div", 60)(115, "p", 61);
    i0.ɵɵtext(116);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(117, "p", 62);
    i0.ɵɵtext(118);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(119, "p", 63);
    i0.ɵɵtext(120);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const f_r3 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(f_r3.opportunityTitle || ctx_r0.opportunityTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.modelLabel());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(f_r3.currency || ctx_r0.t("participationBuilder.currencyFallback"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.fundingTarget"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.fundingTarget));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.alreadyFunded"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.alreadyFundedAmount));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.remaining"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(f_r3.remainingFundingAmount));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.contributionAmount"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r0.contributionAmount())("min", ctx_r0.minContribution() || 0)("max", ctx_r0.remainingFunding() || ctx_r0.maxContribution() || null);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.minContribution() !== null ? 32 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.maxContribution() !== null ? 33 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.remainingFunding() !== null ? 34 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.validationMessage() ? 35 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.profitSharingTerms"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.profitShare"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.profitShareText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.durationTerm"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.profitSharingTermText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.illustrativeExpectedProfit"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.expectedProfitAmount() !== null ? ctx_r0.money(ctx_r0.expectedProfitAmount()) : ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.expectedPayout"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.expectedTotalPayoutAmount() !== null ? ctx_r0.money(ctx_r0.expectedTotalPayoutAmount()) : ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.opportunityPayout"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.opportunityTotalExpectedPayout() !== null ? ctx_r0.money(ctx_r0.opportunityTotalExpectedPayout()) : ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.contractPeriod"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.contractPeriodText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.exitTerms"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.exitTermsText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.participationSummary"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.yourContribution"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.money(ctx_r0.contributionAmount()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.profitShare"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.profitShareText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.durationTerm"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.profitSharingTermText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.illustrativeExpectedProfit"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.expectedProfitAmount() !== null ? ctx_r0.money(ctx_r0.expectedProfitAmount()) : ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.expectedPayout"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.expectedTotalPayoutAmount() !== null ? ctx_r0.money(ctx_r0.expectedTotalPayoutAmount()) : ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.opportunityPayout"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.opportunityTotalExpectedPayout() !== null ? ctx_r0.money(ctx_r0.opportunityTotalExpectedPayout()) : ctx_r0.t("common.unavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.contractPeriod"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.contractPeriodText());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.labels.exitTerms"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.exitTermsText());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.t("participationBuilder.backendTermsHelper"));
} }
function ParticipationBuilderComponent_Conditional_14_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.t("participationBuilder.validation.unsupportedModel"), " ");
} }
function ParticipationBuilderComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ParticipationBuilderComponent_Conditional_14_Conditional_0_Template, 62, 32)(1, ParticipationBuilderComponent_Conditional_14_Conditional_1_Template, 81, 35)(2, ParticipationBuilderComponent_Conditional_14_Conditional_2_Template, 121, 50)(3, ParticipationBuilderComponent_Conditional_14_Conditional_3_Template, 2, 1, "div", 21);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.isEquity() ? 0 : ctx_r0.isLoan() ? 1 : ctx_r0.isProfitSharing() ? 2 : 3);
} }
function ParticipationBuilderComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function ParticipationBuilderComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 64);
    i0.ɵɵlistener("click", function ParticipationBuilderComponent_Conditional_40_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.addCredits()); });
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.t("paidActions.insufficientInline"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.t("paidActions.addCredits"));
} }
export class ParticipationBuilderComponent {
    constructor() {
        this.opportunityService = inject(OpportunityService);
        this.notifications = inject(NotificationService);
        this.walletService = inject(WalletService);
        this.languageService = inject(LanguageService);
        this.router = inject(Router);
        this.opportunityTitle = '';
        this.source = 'PublicOpportunity';
        this.closed = new EventEmitter();
        this.submitted = new EventEmitter();
        this.form = signal(null, ...(ngDevMode ? [{ debugName: "form" }] : []));
        this.loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.submitting = signal(false, ...(ngDevMode ? [{ debugName: "submitting" }] : []));
        this.error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
        this.selectedShares = signal(1, ...(ngDevMode ? [{ debugName: "selectedShares" }] : []));
        this.contributionAmount = signal(null, ...(ngDevMode ? [{ debugName: "contributionAmount" }] : []));
        this.estimatedTotal = signal(0, ...(ngDevMode ? [{ debugName: "estimatedTotal" }] : []));
        this.expectedReturn = signal(0, ...(ngDevMode ? [{ debugName: "expectedReturn" }] : []));
        this.expectedTotalRepayment = signal(0, ...(ngDevMode ? [{ debugName: "expectedTotalRepayment" }] : []));
        this.paidActionQuote = signal(null, ...(ngDevMode ? [{ debugName: "paidActionQuote" }] : []));
    }
    ngOnChanges(changes) {
        if (changes['opportunityId'] && this.opportunityId) {
            void this.loadForm();
        }
    }
    async loadForm() {
        try {
            this.loading.set(true);
            this.error.set(null);
            const form = await this.opportunityService.getParticipationForm(this.opportunityId);
            this.paidActionQuote.set(await this.walletService.getPaidActionQuote('SubmitParticipationRequest'));
            this.form.set(form);
            this.selectedShares.set(this.initialShares(form));
            this.contributionAmount.set(this.initialContribution(form));
            this.recalculate();
        }
        catch (error) {
            this.error.set(error?.error?.message || error?.message || this.t('participationBuilder.errors.loadFailed'));
        }
        finally {
            this.loading.set(false);
        }
    }
    close() {
        if (this.submitting())
            return;
        this.closed.emit();
    }
    decrease() {
        this.setShares(this.selectedShares() - 1);
    }
    increase() {
        this.setShares(this.selectedShares() + 1);
    }
    onSharesInput(value) {
        this.setShares(Number(value));
    }
    canDecrease() {
        return this.selectedShares() > this.minShares();
    }
    canIncrease() {
        return this.selectedShares() < this.maxShares();
    }
    validationMessage() {
        if (this.isLoan())
            return this.loanValidationMessage();
        if (this.isProfitSharing())
            return this.profitSharingValidationMessage();
        if (!this.isEquity())
            return this.t('participationBuilder.validation.unsupportedModel');
        const form = this.form();
        if (!form)
            return null;
        const shares = this.selectedShares();
        if (!Number.isFinite(shares) || shares <= 0)
            return this.t('participationBuilder.validation.sharesGreaterThanZero');
        if (shares < this.minShares())
            return this.t('participationBuilder.validation.minimumShares').replace('{count}', this.formatNumber(this.minShares()));
        if (shares > this.maxShares())
            return this.t('participationBuilder.validation.maximumShares').replace('{count}', this.formatNumber(this.maxShares()));
        if (form.availableShares !== null && form.availableShares !== undefined && shares > Number(form.availableShares)) {
            return this.t('participationBuilder.validation.availableShares').replace('{count}', this.formatNumber(Number(form.availableShares)));
        }
        return null;
    }
    async submit() {
        const validation = this.validationMessage();
        if (validation || this.submitting()) {
            this.error.set(validation);
            return;
        }
        if (this.paidActionInsufficient()) {
            this.error.set(this.t('paidActions.insufficientMessage')
                .replace('{required}', String(this.paidActionCost()))
                .replace('{balance}', String(this.paidActionBalance())));
            return;
        }
        try {
            this.submitting.set(true);
            this.error.set(null);
            await this.opportunityService.createJoinRequest(this.opportunityId, this.submitPayload());
            this.notifications.showToast({
                title: this.t('paidActions.success.participationTitle'),
                message: this.t('paidActions.success.participationMessage'),
                type: 'success'
            });
            this.submitted.emit();
        }
        catch (error) {
            const attemptedContribution = this.contributionAmount();
            this.error.set(this.backendErrorMessage(error));
            await this.loadForm();
            if ((this.isLoan() || this.isProfitSharing()) && attemptedContribution !== null) {
                this.contributionAmount.set(attemptedContribution);
                this.recalculate();
            }
        }
        finally {
            this.submitting.set(false);
        }
    }
    minShares() {
        const form = this.form();
        const min = Number(form?.minimumShares ?? 1);
        return Number.isFinite(min) && min > 0 ? min : 1;
    }
    maxShares() {
        const form = this.form();
        const available = Number(form?.availableShares ?? 0);
        const max = Number(form?.maximumShares ?? available);
        const effective = Math.min(Number.isFinite(available) && available > 0 ? available : Number.MAX_SAFE_INTEGER, Number.isFinite(max) && max > 0 ? max : Number.MAX_SAFE_INTEGER);
        return effective === Number.MAX_SAFE_INTEGER ? this.minShares() : Math.max(effective, this.minShares());
    }
    money(value) {
        const amount = Number(value ?? 0);
        const currency = this.form()?.currency || this.t('participationBuilder.currencyFallback');
        return `${currency} ${this.formatNumber(amount)}`;
    }
    paidActionCost() {
        return Number(this.paidActionQuote()?.creditCost ?? 0);
    }
    paidActionBalance() {
        return Number(this.paidActionQuote()?.currentBalance ?? 0);
    }
    paidActionAfter() {
        return Number(this.paidActionQuote()?.balanceAfter ?? this.paidActionBalance() - this.paidActionCost());
    }
    paidActionInsufficient() {
        return !!this.paidActionQuote() && !this.paidActionQuote()?.hasSufficientCredit;
    }
    addCredits() {
        this.router.navigate(['/admin/credit-charge']);
    }
    t(path) {
        return this.languageService.translate(path);
    }
    modelLabel() {
        if (this.isLoan())
            return this.t('participationBuilder.models.loan');
        if (this.isProfitSharing())
            return this.t('participationBuilder.models.profitSharing');
        if (this.isEquity())
            return this.t('participationBuilder.models.equity');
        return String(this.form()?.investmentModel ?? this.t('participationBuilder.models.unsupported'));
    }
    isEquity() {
        return this.modelKey() === 'equity' || this.modelKey() === '1';
    }
    isLoan() {
        return this.modelKey() === 'loaninvestment' || this.modelKey() === 'loan' || this.modelKey() === '3';
    }
    isProfitSharing() {
        const key = this.modelKey();
        return key === 'capitalcontributionprofitsharing'
            || key === 'profitsharing'
            || key === 'profitshare'
            || key === '2';
    }
    onContributionInput(value) {
        const amount = Number(value);
        this.contributionAmount.set(Number.isFinite(amount) ? amount : null);
        this.error.set(null);
        this.recalculate();
    }
    minContribution() {
        return this.numberOrNull(this.form()?.minimumContribution ?? this.form()?.minimumInvestmentAmount);
    }
    maxContribution() {
        return this.numberOrNull(this.form()?.maximumContribution ?? this.form()?.maximumInvestmentAmount);
    }
    remainingFunding() {
        return this.numberOrNull(this.form()?.remainingFundingAmount);
    }
    returnRateText() {
        const form = this.form();
        if (form?.returnRate === null || form?.returnRate === undefined)
            return this.t('common.unavailable');
        const suffix = form.returnRateType ? ` ${form.returnRateType}` : '';
        return `${this.formatNumber(Number(form.returnRate), 4)}%${suffix}`;
    }
    termText() {
        const form = this.form();
        if (!form?.termValue)
            return this.t('common.unavailable');
        return `${form.termValue} ${form.termUnit || ''}`.trim();
    }
    profitShareText() {
        const percentage = this.profitSharePercentage();
        if (percentage === null)
            return this.t('common.unavailable');
        return `${this.formatNumber(percentage, 4)}%`;
    }
    profitSharingTermText() {
        const form = this.form();
        const termValue = this.numberOrNull(form?.termValue ?? form?.expectedDurationMonths ?? form?.durationMonths);
        if (termValue === null)
            return this.t('common.unavailable');
        return `${termValue} ${form?.termUnit || this.t('participationBuilder.months')}`.trim();
    }
    expectedProfitAmount() {
        return this.numberOrNull(this.form()?.expectedProfitAmount);
    }
    expectedTotalPayoutAmount() {
        return this.numberOrNull(this.form()?.expectedTotalPayoutAmount);
    }
    opportunityTotalExpectedPayout() {
        return this.numberOrNull(this.form()?.opportunityTotalExpectedPayout);
    }
    contractPeriodText() {
        const start = this.dateText(this.form()?.contractStartDate);
        const end = this.dateText(this.form()?.contractEndDate);
        const unavailable = this.t('common.unavailable');
        if (start === unavailable && end === unavailable)
            return unavailable;
        if (start !== unavailable && end !== unavailable)
            return `${start} - ${end}`;
        return start !== unavailable
            ? this.t('participationBuilder.startsAt').replace('{date}', start)
            : this.t('participationBuilder.endsAt').replace('{date}', end);
    }
    exitTermsText() {
        return this.form()?.exitTerms || this.form()?.exitStrategy || this.t('common.unavailable');
    }
    maturityDateText() {
        const raw = this.form()?.expectedMaturityDate;
        if (!raw)
            return this.t('common.unavailable');
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US');
    }
    hasRequiredLoanTerms() {
        const form = this.form();
        return this.numberOrNull(form?.returnRate) !== null && this.numberOrNull(form?.termValue) !== null;
    }
    hasProfitSharingTerms() {
        const unavailable = this.t('common.unavailable');
        return this.profitSharePercentage() !== null || this.profitSharingTermText() !== unavailable || this.exitTermsText() !== unavailable;
    }
    setShares(value) {
        const rounded = Math.floor(Number(value));
        const next = Number.isFinite(rounded) ? Math.min(Math.max(rounded, this.minShares()), this.maxShares()) : this.minShares();
        this.selectedShares.set(next);
        this.error.set(null);
        this.recalculate();
    }
    initialShares(form) {
        const min = Number(form.minimumShares ?? 1);
        const available = Number(form.availableShares ?? min);
        return Math.max(1, Math.min(Number.isFinite(min) ? min : 1, Number.isFinite(available) ? available : min));
    }
    recalculate() {
        if (this.isLoan() || this.isProfitSharing()) {
            const contribution = Number(this.contributionAmount() ?? 0);
            if (this.isProfitSharing()) {
                this.estimatedTotal.set(contribution);
                this.expectedReturn.set(this.expectedProfitAmount() ?? 0);
                this.expectedTotalRepayment.set(this.expectedTotalPayoutAmount() ?? contribution);
                return;
            }
            const rate = Number(this.form()?.returnRate ?? 0);
            const term = Number(this.form()?.termValue ?? 0);
            const expected = contribution > 0 && rate > 0 && term > 0 ? contribution * (rate / 100) * (term / 12) : 0;
            this.expectedReturn.set(expected);
            this.expectedTotalRepayment.set(contribution + expected);
            this.estimatedTotal.set(contribution);
            return;
        }
        this.estimatedTotal.set(this.selectedShares() * Number(this.form()?.sharePrice ?? 0));
        this.expectedReturn.set(0);
        this.expectedTotalRepayment.set(0);
    }
    initialContribution(form) {
        return this.numberOrNull(form.minimumContribution ?? form.minimumInvestmentAmount);
    }
    loanValidationMessage() {
        if (!this.hasRequiredLoanTerms())
            return this.t('participationBuilder.validation.incompleteLoanTerms');
        return this.contributionValidationMessage();
    }
    profitSharingValidationMessage() {
        return this.contributionValidationMessage();
    }
    contributionValidationMessage() {
        const amount = Number(this.contributionAmount());
        if (!Number.isFinite(amount) || amount <= 0)
            return this.t('participationBuilder.validation.contributionGreaterThanZero');
        const min = this.minContribution();
        if (min !== null && amount < min)
            return this.t('participationBuilder.validation.minimumContribution').replace('{amount}', this.money(min));
        const max = this.maxContribution();
        if (max !== null && amount > max)
            return this.t('participationBuilder.validation.maximumContribution').replace('{amount}', this.money(max));
        const remaining = this.remainingFunding();
        if (remaining !== null && amount > remaining)
            return this.t('participationBuilder.validation.remainingFunding').replace('{amount}', this.money(remaining));
        return null;
    }
    submitPayload() {
        if (this.isLoan() || this.isProfitSharing()) {
            return {
                requestType: 2,
                requestedAmount: Number(this.contributionAmount())
            };
        }
        return {
            requestType: 2,
            numberOfShares: this.selectedShares()
        };
    }
    modelKey() {
        return String(this.form()?.investmentModel ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    }
    numberOrNull(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }
    profitSharePercentage() {
        const form = this.form();
        return this.numberOrNull(form?.profitSharePercentage ?? form?.profitSharingPercentage ?? form?.proposedSharePercentage ?? form?.returnRate);
    }
    dateText(raw) {
        if (!raw)
            return this.t('common.unavailable');
        const date = new Date(String(raw));
        return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US');
    }
    backendErrorMessage(error) {
        const errors = error?.error?.errors;
        if (Array.isArray(errors) && errors.length > 0)
            return errors.join(' ');
        return error?.error?.message || error?.message || this.t('participationBuilder.errors.submitFailed');
    }
    formatNumber(value, maximumFractionDigits = 2) {
        return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits }).format(value);
    }
    static { this.ɵfac = function ParticipationBuilderComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ParticipationBuilderComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ParticipationBuilderComponent, selectors: [["app-participation-builder"]], inputs: { opportunityId: "opportunityId", opportunityTitle: "opportunityTitle", source: "source", conversationId: "conversationId" }, outputs: { closed: "closed", submitted: "submitted" }, features: [i0.ɵɵNgOnChangesFeature], decls: 46, vars: 29, consts: [[1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/70", "p-4", "backdrop-blur-sm"], [1, "max-h-[92vh]", "w-full", "max-w-2xl", "overflow-y-auto", "rounded-2xl", "border", "border-slate-700", "bg-slate-900", "shadow-2xl"], [1, "flex", "items-start", "justify-between", "gap-4", "border-b", "border-slate-800", "p-6"], [1, "text-xs", "font-semibold", "uppercase", "tracking-[0.18em]", "text-blue-300"], [1, "mt-2", "text-2xl", "font-bold", "text-white"], [1, "mt-1", "text-sm", "text-slate-400"], ["type", "button", 1, "rounded-lg", "border", "border-slate-700", "bg-slate-800", "px-3", "py-2", "text-sm", "font-semibold", "text-slate-300", "hover:bg-slate-700", 3, "click"], [1, "p-6"], [1, "rounded-xl", "border", "border-slate-800", "bg-slate-950", "p-8", "text-center", "text-sm", "text-slate-400"], [1, "mt-5", "rounded-xl", "border", "border-red-500/40", "bg-red-500/10", "p-4", "text-sm", "text-red-200"], [1, "mt-5", "rounded-xl", "border", "border-slate-700", "bg-slate-950", "p-4", "text-sm"], [1, "flex", "justify-between", "gap-4"], [1, "text-slate-400"], [1, "text-white"], [1, "mt-2", "flex", "justify-between", "gap-4"], [1, "mt-3", "border-t", "border-slate-800", "pt-3", "flex", "justify-between", "gap-4"], [1, "font-semibold", "text-slate-200"], [1, "mt-3", "text-red-200"], [1, "mt-6", "flex", "flex-col-reverse", "gap-3", "sm:flex-row", "sm:justify-end"], ["type", "button", 1, "rounded-xl", "border", "border-slate-700", "bg-slate-800", "px-5", "py-3", "text-sm", "font-semibold", "text-slate-200", "hover:bg-slate-700", 3, "click"], ["type", "button", 1, "rounded-xl", "bg-blue-600", "px-5", "py-3", "text-sm", "font-bold", "text-white", "hover:bg-blue-500", "disabled:cursor-not-allowed", "disabled:opacity-50", 3, "click", "disabled"], [1, "rounded-xl", "border", "border-amber-500/30", "bg-amber-500/10", "p-5", "text-sm", "text-amber-100"], [1, "grid", "grid-cols-1", "gap-4", "md:grid-cols-3"], [1, "rounded-xl", "border", "border-slate-800", "bg-slate-950", "p-4"], [1, "text-xs", "uppercase", "tracking-wide", "text-slate-500"], [1, "mt-2", "text-lg", "font-bold", "text-white"], [1, "mt-1", "text-sm", "text-slate-500"], [1, "mt-2", "text-2xl", "font-bold", "text-emerald-300"], [1, "mt-5", "rounded-xl", "border", "border-slate-800", "bg-slate-950", "p-5"], [1, "flex", "flex-col", "gap-4", "md:flex-row", "md:items-center", "md:justify-between"], [1, "mt-2", "text-3xl", "font-bold", "text-blue-300"], [1, "text-sm", "text-slate-400"], [1, "block", "text-sm", "font-semibold", "text-white"], [1, "mt-3", "flex", "items-center", "gap-3"], ["type", "button", 1, "h-12", "w-12", "rounded-xl", "border", "border-slate-700", "bg-slate-800", "text-2xl", "font-bold", "text-white", "hover:bg-slate-700", "disabled:cursor-not-allowed", "disabled:opacity-50", 3, "click", "disabled"], ["type", "number", 1, "min-w-0", "flex-1", "rounded-xl", "border", "border-slate-700", "bg-slate-800", "px-4", "py-3", "text-center", "text-2xl", "font-bold", "text-white", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "ngModelChange", "ngModel", "min", "max"], [1, "mt-3", "text-sm", "text-red-300"], [1, "mt-5", "rounded-xl", "border", "border-blue-500/30", "bg-blue-500/10", "p-5"], [1, "text-sm", "font-semibold", "text-blue-200"], [1, "mt-4", "space-y-2", "text-sm", "text-slate-300"], [1, "border-t", "border-blue-500/20", "pt-3", "flex", "justify-between", "gap-4", "text-lg"], [1, "text-blue-100"], [1, "mt-3", "text-xs", "leading-5", "text-blue-200/80"], [1, "rounded-xl", "border", "border-slate-800", "bg-slate-950", "p-5"], [1, "mt-3", "flex", "flex-col", "gap-2", "sm:flex-row", "sm:items-center", "sm:justify-between"], [1, "text-lg", "font-bold", "text-white"], [1, "inline-flex", "w-fit", "rounded-full", "border", "border-blue-500/30", "bg-blue-500/10", "px-3", "py-1", "text-xs", "font-bold", "text-blue-200"], [1, "mt-2", "text-sm", "text-slate-500"], [1, "mt-5", "grid", "grid-cols-1", "gap-4", "md:grid-cols-3"], [1, "mt-3"], ["type", "number", "step", "0.01", 1, "w-full", "rounded-xl", "border", "border-slate-700", "bg-slate-800", "px-4", "py-3", "text-2xl", "font-bold", "text-white", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "ngModelChange", "ngModel", "min", "max"], [1, "mt-3", "text-sm", "text-slate-400"], [1, "text-sm", "font-semibold", "text-white"], [1, "mt-4", "grid", "grid-cols-1", "gap-3", "sm:grid-cols-2"], [1, "inline-flex", "w-fit", "rounded-full", "border", "border-emerald-500/30", "bg-emerald-500/10", "px-3", "py-1", "text-xs", "font-bold", "text-emerald-200"], ["type", "number", "step", "0.01", 1, "w-full", "rounded-xl", "border", "border-slate-700", "bg-slate-800", "px-4", "py-3", "text-2xl", "font-bold", "text-white", "focus:outline-none", "focus:ring-2", "focus:ring-emerald-500", 3, "ngModelChange", "ngModel", "min", "max"], [1, "sm:col-span-2"], [1, "mt-1", "text-sm", "leading-6", "text-white"], [1, "mt-5", "rounded-xl", "border", "border-emerald-500/30", "bg-emerald-500/10", "p-5"], [1, "text-sm", "font-semibold", "text-emerald-200"], [1, "border-t", "border-emerald-500/20", "pt-3"], [1, "text-emerald-100"], [1, "mt-1", "text-white"], [1, "mt-3", "text-xs", "leading-5", "text-emerald-200/80"], ["type", "button", 1, "ms-2", "font-bold", "text-white", "underline", 3, "click"]], template: function ParticipationBuilderComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "section", 1)(2, "header", 2)(3, "div")(4, "p", 3);
            i0.ɵɵtext(5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h2", 4);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p", 5);
            i0.ɵɵtext(9);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "button", 6);
            i0.ɵɵlistener("click", function ParticipationBuilderComponent_Template_button_click_10_listener() { return ctx.close(); });
            i0.ɵɵtext(11);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "div", 7);
            i0.ɵɵconditionalCreate(13, ParticipationBuilderComponent_Conditional_13_Template, 2, 1, "div", 8)(14, ParticipationBuilderComponent_Conditional_14_Template, 4, 1);
            i0.ɵɵconditionalCreate(15, ParticipationBuilderComponent_Conditional_15_Template, 2, 1, "div", 9);
            i0.ɵɵelementStart(16, "div", 10)(17, "div", 11)(18, "span", 12);
            i0.ɵɵtext(19);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "strong", 13);
            i0.ɵɵtext(21);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "div", 14)(23, "span", 12);
            i0.ɵɵtext(24);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "strong", 13);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "number");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(28, "div", 14)(29, "span", 12);
            i0.ɵɵtext(30);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "strong", 13);
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "number");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(34, "div", 15)(35, "span", 16);
            i0.ɵɵtext(36);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "strong");
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "number");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(40, ParticipationBuilderComponent_Conditional_40_Template, 4, 2, "p", 17);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "div", 18)(42, "button", 19);
            i0.ɵɵlistener("click", function ParticipationBuilderComponent_Template_button_click_42_listener() { return ctx.close(); });
            i0.ɵɵtext(43);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(44, "button", 20);
            i0.ɵɵlistener("click", function ParticipationBuilderComponent_Template_button_click_44_listener() { return ctx.submit(); });
            i0.ɵɵtext(45);
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.t("participationBuilder.title"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.opportunityTitle || ctx.t("participationBuilder.opportunityFallback"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.t("participationBuilder.subtitle"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", ctx.t("common.close"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 13 : (tmp_4_0 = ctx.form()) ? 14 : -1, tmp_4_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.error() ? 15 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.t("paidActions.investmentValue"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.money(ctx.estimatedTotal()));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.t("paidActions.fixedCost"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(27, 20, ctx.paidActionCost(), "1.2-2"), " CREDIT");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.t("paidActions.currentBalance"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(33, 23, ctx.paidActionBalance(), "1.2-2"), " CREDIT");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.t("paidActions.balanceAfter"));
            i0.ɵɵadvance();
            i0.ɵɵclassMap(ctx.paidActionInsufficient() ? "text-red-300" : "text-emerald-300");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(39, 26, ctx.paidActionAfter(), "1.2-2"), " CREDIT");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.paidActionInsufficient() ? 40 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", ctx.t("paidActions.cancel"), " ");
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.loading() || ctx.submitting() || !!ctx.validationMessage() || !ctx.form() || ctx.paidActionInsufficient());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.submitting() ? ctx.t("paidActions.processing") : ctx.t("paidActions.submitParticipationRequest"), " ");
        } }, dependencies: [CommonModule, FormsModule, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.MinValidator, i1.MaxValidator, i1.NgModel, i2.DecimalPipe], encapsulation: 2, changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ParticipationBuilderComponent, [{
        type: Component,
        args: [{ selector: 'app-participation-builder', standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm\">\r\n  <section class=\"max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl\">\r\n    <header class=\"flex items-start justify-between gap-4 border-b border-slate-800 p-6\">\r\n      <div>\r\n        <p class=\"text-xs font-semibold uppercase tracking-[0.18em] text-blue-300\">{{ t('participationBuilder.title') }}</p>\r\n        <h2 class=\"mt-2 text-2xl font-bold text-white\">{{ opportunityTitle || t('participationBuilder.opportunityFallback') }}</h2>\r\n        <p class=\"mt-1 text-sm text-slate-400\">{{ t('participationBuilder.subtitle') }}</p>\r\n      </div>\r\n      <button type=\"button\"\r\n              (click)=\"close()\"\r\n              class=\"rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700\">\r\n        {{ t('common.close') }}\r\n      </button>\r\n    </header>\r\n\r\n    <div class=\"p-6\">\r\n      @if (loading()) {\r\n        <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400\">{{ t('participationBuilder.loading') }}</div>\r\n      } @else if (form(); as f) {\r\n        @if (isEquity()) {\r\n          <div class=\"grid grid-cols-1 gap-4 md:grid-cols-3\">\r\n            <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n              <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.investmentModel') }}</p>\r\n              <p class=\"mt-2 text-lg font-bold text-white\">{{ t('participationBuilder.models.equity') }}</p>\r\n              <p class=\"mt-1 text-sm text-slate-500\">{{ f.currency || t('participationBuilder.currencyFallback') }}</p>\r\n            </div>\r\n            <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n              <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.totalShares') }}</p>\r\n              <p class=\"mt-2 text-2xl font-bold text-white\">{{ f.totalShares || 0 | number }}</p>\r\n            </div>\r\n            <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n              <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.availableShares') }}</p>\r\n              <p class=\"mt-2 text-2xl font-bold text-emerald-300\">{{ f.availableShares || 0 | number }}</p>\r\n            </div>\r\n          </div>\r\n\r\n          <div class=\"mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n            <div class=\"flex flex-col gap-4 md:flex-row md:items-center md:justify-between\">\r\n              <div>\r\n                <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.pricePerShare') }}</p>\r\n                <p class=\"mt-2 text-3xl font-bold text-blue-300\">{{ money(f.sharePrice) }}</p>\r\n              </div>\r\n              <div class=\"text-sm text-slate-400\">\r\n                @if (f.minimumShares) { <p>{{ t('participationBuilder.labels.minimumShares') }}: {{ f.minimumShares | number }}</p> }\r\n                @if (f.maximumShares) { <p>{{ t('participationBuilder.labels.maximumShares') }}: {{ f.maximumShares | number }}</p> }\r\n              </div>\r\n            </div>\r\n          </div>\r\n\r\n          <div class=\"mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n            <label class=\"block text-sm font-semibold text-white\">{{ t('participationBuilder.labels.numberOfShares') }}</label>\r\n            <div class=\"mt-3 flex items-center gap-3\">\r\n              <button type=\"button\"\r\n                      (click)=\"decrease()\"\r\n                      [disabled]=\"!canDecrease()\"\r\n                      class=\"h-12 w-12 rounded-xl border border-slate-700 bg-slate-800 text-2xl font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50\">\r\n                -\r\n              </button>\r\n              <input type=\"number\"\r\n                     class=\"min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500\"\r\n                     [ngModel]=\"selectedShares()\"\r\n                     (ngModelChange)=\"onSharesInput($event)\"\r\n                     [min]=\"minShares()\"\r\n                     [max]=\"maxShares()\">\r\n              <button type=\"button\"\r\n                      (click)=\"increase()\"\r\n                      [disabled]=\"!canIncrease()\"\r\n                      class=\"h-12 w-12 rounded-xl border border-slate-700 bg-slate-800 text-2xl font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50\">\r\n                +\r\n              </button>\r\n            </div>\r\n            @if (validationMessage()) {\r\n              <p class=\"mt-3 text-sm text-red-300\">{{ validationMessage() }}</p>\r\n            }\r\n          </div>\r\n\r\n          <div class=\"mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5\">\r\n            <p class=\"text-sm font-semibold text-blue-200\">{{ t('participationBuilder.labels.calculatedTotal') }}</p>\r\n            <div class=\"mt-4 space-y-2 text-sm text-slate-300\">\r\n              <div class=\"flex justify-between gap-4\">\r\n                <span>{{ t('participationBuilder.labels.selectedShares') }}</span>\r\n                <strong class=\"text-white\">{{ selectedShares() | number }}</strong>\r\n              </div>\r\n              <div class=\"flex justify-between gap-4\">\r\n                <span>{{ t('participationBuilder.labels.pricePerShare') }}</span>\r\n                <strong class=\"text-white\">{{ money(f.sharePrice) }}</strong>\r\n              </div>\r\n              <div class=\"border-t border-blue-500/20 pt-3 flex justify-between gap-4 text-lg\">\r\n                <span class=\"text-blue-100\">{{ t('participationBuilder.labels.estimatedInvestment') }}</span>\r\n                <strong class=\"text-white\">{{ money(estimatedTotal()) }}</strong>\r\n              </div>\r\n            </div>\r\n            <p class=\"mt-3 text-xs leading-5 text-blue-200/80\">{{ t('participationBuilder.previewHelper') }}</p>\r\n          </div>\r\n        } @else if (isLoan()) {\r\n        <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n          <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.opportunityContext') }}</p>\r\n          <div class=\"mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between\">\r\n            <p class=\"text-lg font-bold text-white\">{{ f.opportunityTitle || opportunityTitle }}</p>\r\n            <span class=\"inline-flex w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-200\">{{ modelLabel() }}</span>\r\n          </div>\r\n          <p class=\"mt-2 text-sm text-slate-500\">{{ f.currency || t('participationBuilder.currencyFallback') }}</p>\r\n        </div>\r\n\r\n        <div class=\"mt-5 grid grid-cols-1 gap-4 md:grid-cols-3\">\r\n          <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n            <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.fundingTarget') }}</p>\r\n            <p class=\"mt-2 text-2xl font-bold text-white\">{{ money(f.fundingTarget) }}</p>\r\n          </div>\r\n          <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n            <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.alreadyFunded') }}</p>\r\n            <p class=\"mt-2 text-2xl font-bold text-white\">{{ money(f.alreadyFundedAmount) }}</p>\r\n          </div>\r\n          <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n            <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.remainingFunding') }}</p>\r\n            <p class=\"mt-2 text-2xl font-bold text-emerald-300\">{{ money(f.remainingFundingAmount) }}</p>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n          <label class=\"block text-sm font-semibold text-white\">{{ t('participationBuilder.labels.yourContribution') }}</label>\r\n          <div class=\"mt-3\">\r\n            <input type=\"number\"\r\n                   class=\"w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500\"\r\n                   [ngModel]=\"contributionAmount()\"\r\n                   (ngModelChange)=\"onContributionInput($event)\"\r\n                   [min]=\"minContribution() || 0\"\r\n                   [max]=\"remainingFunding() || maxContribution() || null\"\r\n                   step=\"0.01\">\r\n          </div>\r\n          <div class=\"mt-3 text-sm text-slate-400\">\r\n            @if (minContribution() !== null) { <p>{{ t('participationBuilder.labels.minimum') }}: {{ money(minContribution()) }}</p> }\r\n            @if (maxContribution() !== null) { <p>{{ t('participationBuilder.labels.maximum') }}: {{ money(maxContribution()) }}</p> }\r\n            @if (remainingFunding() !== null) { <p>{{ t('participationBuilder.labels.remainingFundingLimit') }}: {{ money(remainingFunding()) }}</p> }\r\n          </div>\r\n          @if (validationMessage()) {\r\n            <p class=\"mt-3 text-sm text-red-300\">{{ validationMessage() }}</p>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n          <p class=\"text-sm font-semibold text-white\">{{ t('participationBuilder.labels.loanTerms') }}</p>\r\n          <div class=\"mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2\">\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.returnRate') }}</span>\r\n              <strong class=\"text-white\">{{ returnRateText() }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.term') }}</span>\r\n              <strong class=\"text-white\">{{ termText() }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.repaymentModel') }}</span>\r\n              <strong class=\"text-white\">{{ f.repaymentModel || t('common.unavailable') }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.maturityDate') }}</span>\r\n              <strong class=\"text-white\">{{ maturityDateText() }}</strong>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5\">\r\n          <p class=\"text-sm font-semibold text-blue-200\">{{ t('participationBuilder.labels.expectedOutcome') }}</p>\r\n          <div class=\"mt-4 space-y-2 text-sm text-slate-300\">\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.yourContribution') }}</span><strong class=\"text-white\">{{ money(contributionAmount()) }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.expectedReturn') }}</span><strong class=\"text-white\">{{ money(expectedReturn()) }}</strong></div>\r\n            <div class=\"border-t border-blue-500/20 pt-3 flex justify-between gap-4 text-lg\"><span class=\"text-blue-100\">{{ t('participationBuilder.labels.expectedRepayment') }}</span><strong class=\"text-white\">{{ money(expectedTotalRepayment()) }}</strong></div>\r\n          </div>\r\n          <p class=\"mt-3 text-xs leading-5 text-blue-200/80\">{{ t('participationBuilder.backendTermsHelper') }}</p>\r\n        </div>\r\n        } @else if (isProfitSharing()) {\r\n        <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n          <p class=\"text-xs uppercase tracking-wide text-slate-500\">Opportunity Context</p>\r\n          <div class=\"mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between\">\r\n            <p class=\"text-lg font-bold text-white\">{{ f.opportunityTitle || opportunityTitle }}</p>\r\n            <span class=\"inline-flex w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200\">{{ modelLabel() }}</span>\r\n          </div>\r\n          <p class=\"mt-2 text-sm text-slate-500\">{{ f.currency || t('participationBuilder.currencyFallback') }}</p>\r\n        </div>\r\n\r\n        <div class=\"mt-5 grid grid-cols-1 gap-4 md:grid-cols-3\">\r\n          <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n            <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.fundingTarget') }}</p>\r\n            <p class=\"mt-2 text-2xl font-bold text-white\">{{ money(f.fundingTarget) }}</p>\r\n          </div>\r\n          <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n            <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.alreadyFunded') }}</p>\r\n            <p class=\"mt-2 text-2xl font-bold text-white\">{{ money(f.alreadyFundedAmount) }}</p>\r\n          </div>\r\n          <div class=\"rounded-xl border border-slate-800 bg-slate-950 p-4\">\r\n            <p class=\"text-xs uppercase tracking-wide text-slate-500\">{{ t('participationBuilder.labels.remaining') }}</p>\r\n            <p class=\"mt-2 text-2xl font-bold text-emerald-300\">{{ money(f.remainingFundingAmount) }}</p>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n          <label class=\"block text-sm font-semibold text-white\">{{ t('participationBuilder.labels.contributionAmount') }}</label>\r\n          <div class=\"mt-3\">\r\n            <input type=\"number\"\r\n                   class=\"w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500\"\r\n                   [ngModel]=\"contributionAmount()\"\r\n                   (ngModelChange)=\"onContributionInput($event)\"\r\n                   [min]=\"minContribution() || 0\"\r\n                   [max]=\"remainingFunding() || maxContribution() || null\"\r\n                   step=\"0.01\">\r\n          </div>\r\n          <div class=\"mt-3 text-sm text-slate-400\">\r\n            @if (minContribution() !== null) { <p>{{ t('participationBuilder.labels.minimum') }}: {{ money(minContribution()) }}</p> }\r\n            @if (maxContribution() !== null) { <p>{{ t('participationBuilder.labels.maximum') }}: {{ money(maxContribution()) }}</p> }\r\n            @if (remainingFunding() !== null) { <p>{{ t('participationBuilder.labels.remainingFundingLimit') }}: {{ money(remainingFunding()) }}</p> }\r\n          </div>\r\n          @if (validationMessage()) {\r\n            <p class=\"mt-3 text-sm text-red-300\">{{ validationMessage() }}</p>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5\">\r\n          <p class=\"text-sm font-semibold text-white\">{{ t('participationBuilder.labels.profitSharingTerms') }}</p>\r\n          <div class=\"mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2\">\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.profitShare') }}</span>\r\n              <strong class=\"text-white\">{{ profitShareText() }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.durationTerm') }}</span>\r\n              <strong class=\"text-white\">{{ profitSharingTermText() }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.illustrativeExpectedProfit') }}</span>\r\n              <strong class=\"text-white\">{{ expectedProfitAmount() !== null ? money(expectedProfitAmount()) : t('common.unavailable') }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.expectedPayout') }}</span>\r\n              <strong class=\"text-white\">{{ expectedTotalPayoutAmount() !== null ? money(expectedTotalPayoutAmount()) : t('common.unavailable') }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.opportunityPayout') }}</span>\r\n              <strong class=\"text-white\">{{ opportunityTotalExpectedPayout() !== null ? money(opportunityTotalExpectedPayout()) : t('common.unavailable') }}</strong>\r\n            </div>\r\n            <div class=\"flex justify-between gap-4\">\r\n              <span class=\"text-slate-400\">{{ t('participationBuilder.labels.contractPeriod') }}</span>\r\n              <strong class=\"text-white\">{{ contractPeriodText() }}</strong>\r\n            </div>\r\n            <div class=\"sm:col-span-2\">\r\n              <p class=\"text-slate-400\">{{ t('participationBuilder.labels.exitTerms') }}</p>\r\n              <p class=\"mt-1 text-sm leading-6 text-white\">{{ exitTermsText() }}</p>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5\">\r\n          <p class=\"text-sm font-semibold text-emerald-200\">{{ t('participationBuilder.labels.participationSummary') }}</p>\r\n          <div class=\"mt-4 space-y-2 text-sm text-slate-300\">\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.yourContribution') }}</span><strong class=\"text-white\">{{ money(contributionAmount()) }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.profitShare') }}</span><strong class=\"text-white\">{{ profitShareText() }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.durationTerm') }}</span><strong class=\"text-white\">{{ profitSharingTermText() }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.illustrativeExpectedProfit') }}</span><strong class=\"text-white\">{{ expectedProfitAmount() !== null ? money(expectedProfitAmount()) : t('common.unavailable') }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.expectedPayout') }}</span><strong class=\"text-white\">{{ expectedTotalPayoutAmount() !== null ? money(expectedTotalPayoutAmount()) : t('common.unavailable') }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.opportunityPayout') }}</span><strong class=\"text-white\">{{ opportunityTotalExpectedPayout() !== null ? money(opportunityTotalExpectedPayout()) : t('common.unavailable') }}</strong></div>\r\n            <div class=\"flex justify-between gap-4\"><span>{{ t('participationBuilder.labels.contractPeriod') }}</span><strong class=\"text-white\">{{ contractPeriodText() }}</strong></div>\r\n            <div class=\"border-t border-emerald-500/20 pt-3\">\r\n              <p class=\"text-emerald-100\">{{ t('participationBuilder.labels.exitTerms') }}</p>\r\n              <p class=\"mt-1 text-white\">{{ exitTermsText() }}</p>\r\n            </div>\r\n          </div>\r\n          <p class=\"mt-3 text-xs leading-5 text-emerald-200/80\">{{ t('participationBuilder.backendTermsHelper') }}</p>\r\n        </div>\r\n        } @else {\r\n          <div class=\"rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100\">\r\n            {{ t('participationBuilder.validation.unsupportedModel') }}\r\n          </div>\r\n        }\r\n      }\r\n\r\n      @if (error()) {\r\n        <div class=\"mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200\">{{ error() }}</div>\r\n      }\r\n\r\n      <div class=\"mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm\">\r\n        <div class=\"flex justify-between gap-4\">\r\n          <span class=\"text-slate-400\">{{ t('paidActions.investmentValue') }}</span>\r\n          <strong class=\"text-white\">{{ money(estimatedTotal()) }}</strong>\r\n        </div>\r\n        <div class=\"mt-2 flex justify-between gap-4\">\r\n          <span class=\"text-slate-400\">{{ t('paidActions.fixedCost') }}</span>\r\n          <strong class=\"text-white\">{{ paidActionCost() | number:'1.2-2' }} CREDIT</strong>\r\n        </div>\r\n        <div class=\"mt-2 flex justify-between gap-4\">\r\n          <span class=\"text-slate-400\">{{ t('paidActions.currentBalance') }}</span>\r\n          <strong class=\"text-white\">{{ paidActionBalance() | number:'1.2-2' }} CREDIT</strong>\r\n        </div>\r\n        <div class=\"mt-3 border-t border-slate-800 pt-3 flex justify-between gap-4\">\r\n          <span class=\"font-semibold text-slate-200\">{{ t('paidActions.balanceAfter') }}</span>\r\n          <strong [class]=\"paidActionInsufficient() ? 'text-red-300' : 'text-emerald-300'\">{{ paidActionAfter() | number:'1.2-2' }} CREDIT</strong>\r\n        </div>\r\n        @if (paidActionInsufficient()) {\r\n          <p class=\"mt-3 text-red-200\">\r\n            {{ t('paidActions.insufficientInline') }}\r\n            <button type=\"button\" (click)=\"addCredits()\" class=\"ms-2 font-bold text-white underline\">{{ t('paidActions.addCredits') }}</button>\r\n          </p>\r\n        }\r\n      </div>\r\n\r\n      <div class=\"mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end\">\r\n        <button type=\"button\"\r\n                (click)=\"close()\"\r\n                class=\"rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700\">\r\n          {{ t('paidActions.cancel') }}\r\n        </button>\r\n        <button type=\"button\"\r\n                (click)=\"submit()\"\r\n                [disabled]=\"loading() || submitting() || !!validationMessage() || !form() || paidActionInsufficient()\"\r\n                class=\"rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50\">\r\n          {{ submitting() ? t('paidActions.processing') : t('paidActions.submitParticipationRequest') }}\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </section>\r\n</div>\r\n" }]
    }], null, { opportunityId: [{
            type: Input,
            args: [{ required: true }]
        }], opportunityTitle: [{
            type: Input
        }], source: [{
            type: Input
        }], conversationId: [{
            type: Input
        }], closed: [{
            type: Output
        }], submitted: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ParticipationBuilderComponent, { className: "ParticipationBuilderComponent", filePath: "src/app/components/participation-builder/participation-builder.component.ts", lineNumber: 19 }); })();
