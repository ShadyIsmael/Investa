import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { CurrencyService } from '../../../services/currency.service';
import { WalletService } from '../../../services/wallet.service';
import { CreditPurchaseService } from '../../../services/credit-purchase.service';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function CreditChargeComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementStart(2, "button", 9);
    i0.ɵɵdomListener("click", function CreditChargeComponent_Conditional_28_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", ctx_r1.error(), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "creditPurchase.retry"));
} }
function CreditChargeComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditPurchase.loading"));
} }
function CreditChargeComponent_Conditional_30_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditPurchase.noPackages"));
} }
function CreditChargeComponent_Conditional_30_Conditional_6_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 20);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditPurchase.featured"));
} }
function CreditChargeComponent_Conditional_30_Conditional_6_For_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 22);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("+ ", ctx_r1.formatNumber(item_r5.bonusCredits), " ", i0.ɵɵpipeBind1(2, 2, "creditPurchase.bonus"));
} }
function CreditChargeComponent_Conditional_30_Conditional_6_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 19);
    i0.ɵɵdomListener("click", function CreditChargeComponent_Conditional_30_Conditional_6_For_2_Template_button_click_0_listener() { const item_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.selectPackage(item_r5.id)); });
    i0.ɵɵconditionalCreate(1, CreditChargeComponent_Conditional_30_Conditional_6_For_2_Conditional_1_Template, 3, 3, "span", 20);
    i0.ɵɵdomElementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(4, "span", 21);
    i0.ɵɵtext(5);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(8, CreditChargeComponent_Conditional_30_Conditional_6_For_2_Conditional_8_Template, 3, 4, "span", 22);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("package--selected", ctx_r1.selectedPackageId() === item_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r5.isFeatured ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.packageName(item_r5));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatMoney(item_r5.price, item_r5.currency));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r1.formatNumber(item_r5.credits), " CREDIT");
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r5.bonusCredits > 0 ? 8 : -1);
} }
function CreditChargeComponent_Conditional_30_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 12);
    i0.ɵɵrepeaterCreate(1, CreditChargeComponent_Conditional_30_Conditional_6_For_2_Template, 9, 7, "button", 18, _forTrack0);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.packages());
} }
function CreditChargeComponent_Conditional_30_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "dl")(1, "div")(2, "dt");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "dd");
    i0.ɵɵtext(6);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(7, "div")(8, "dt");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(11, "dd");
    i0.ɵɵtext(12);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(13, "div")(14, "dt");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(17, "dd");
    i0.ɵɵtext(18);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(19, "div", 23)(20, "dt");
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(23, "dd");
    i0.ɵɵtext(24);
    i0.ɵɵdomElementEnd()()();
    i0.ɵɵdomElementStart(25, "button", 24);
    i0.ɵɵdomListener("click", function CreditChargeComponent_Conditional_30_Conditional_11_Template_button_click_25_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.createOrder()); });
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(28, "p", 25);
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const item_r7 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 11, "creditPurchase.package"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.packageName(item_r7));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 13, "creditPurchase.credits"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(item_r7.credits));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 15, "creditPurchase.bonus"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(item_r7.bonusCredits));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 17, "creditPurchase.total"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatMoney(item_r7.price, item_r7.currency));
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("disabled", ctx_r1.submitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 19, ctx_r1.submitting() ? "creditPurchase.creating" : "creditPurchase.buy"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 21, "creditPurchase.verificationNote"));
} }
function CreditChargeComponent_Conditional_30_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditPurchase.selectPrompt"));
} }
function CreditChargeComponent_Conditional_30_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditPurchase.noOrders"));
} }
function CreditChargeComponent_Conditional_30_Conditional_22_For_25_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(9, "td")(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(13, "td");
    i0.ɵɵtext(14);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(15, "td")(16, "button", 26);
    i0.ɵɵdomListener("click", function CreditChargeComponent_Conditional_30_Conditional_22_For_25_Template_button_click_16_listener() { const order_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.viewReceipt(order_r9)); });
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const order_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(order_r9.referenceNumber);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.packageName(order_r9));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(order_r9.credits + order_r9.bonusCredits));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatMoney(order_r9.pricePaid, order_r9.currency));
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r1.statusTone(order_r9.paymentStatus));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 9, ctx_r1.statusKey(order_r9.paymentStatus)));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(order_r9.createdAt));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 11, "creditPurchase.details"));
} }
function CreditChargeComponent_Conditional_30_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 17)(1, "table")(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "th");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(10, "th");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(13, "th");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(16, "th");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(19, "th");
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElement(22, "th");
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(23, "tbody");
    i0.ɵɵrepeaterCreate(24, CreditChargeComponent_Conditional_30_Conditional_22_For_25_Template, 19, 13, "tr", null, _forTrack0);
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "creditPurchase.reference"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 8, "creditPurchase.package"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 10, "creditPurchase.totalCredits"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 12, "creditPurchase.amount"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 14, "creditPurchase.statusLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 16, "creditPurchase.date"));
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r1.orders());
} }
function CreditChargeComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "section", 10)(1, "div", 11)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(5, CreditChargeComponent_Conditional_30_Conditional_5_Template, 3, 3, "div", 7)(6, CreditChargeComponent_Conditional_30_Conditional_6_Template, 3, 0, "div", 12);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "aside", 13)(8, "h2");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(11, CreditChargeComponent_Conditional_30_Conditional_11_Template, 31, 23)(12, CreditChargeComponent_Conditional_30_Conditional_12_Template, 3, 3, "div", 14);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(13, "section", 15)(14, "div", 16)(15, "h2");
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(18, "button", 9);
    i0.ɵɵdomListener("click", function CreditChargeComponent_Conditional_30_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵdomElementEnd()();
    i0.ɵɵconditionalCreate(21, CreditChargeComponent_Conditional_30_Conditional_21_Template, 3, 3, "div", 7)(22, CreditChargeComponent_Conditional_30_Conditional_22_Template, 26, 18, "div", 17);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "creditPurchase.packages"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.packages().length === 0 ? 5 : 6);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 9, "creditPurchase.review"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_4_0 = ctx_r1.selectedPackage()) ? 11 : 12, tmp_4_0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 11, "creditPurchase.history"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 13, "creditPurchase.refresh"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.orders().length === 0 ? 21 : 22);
} }
function CreditChargeComponent_Conditional_31_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 29);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditPurchase.providerUnavailable"));
} }
function CreditChargeComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 8)(1, "article", 27)(2, "button", 28);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵdomListener("click", function CreditChargeComponent_Conditional_31_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReceipt()); });
    i0.ɵɵtext(4, "\u00D7");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "p", 3);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(8, "h2");
    i0.ɵɵtext(9);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(13, "dl")(14, "div")(15, "dt");
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(18, "dd");
    i0.ɵɵtext(19);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(20, "div")(21, "dt");
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(24, "dd");
    i0.ɵɵtext(25);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(26, "div")(27, "dt");
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(30, "dd");
    i0.ɵɵtext(31);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(32, "div")(33, "dt");
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(36, "dd");
    i0.ɵɵtext(37);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(38, "div")(39, "dt");
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(42, "dd");
    i0.ɵɵtext(43);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(44, "div")(45, "dt");
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(48, "dd");
    i0.ɵɵtext(49);
    i0.ɵɵdomElementEnd()()();
    i0.ɵɵconditionalCreate(50, CreditChargeComponent_Conditional_31_Conditional_50_Template, 3, 3, "p", 29);
    i0.ɵɵdomElementStart(51, "p", 25);
    i0.ɵɵtext(52);
    i0.ɵɵpipe(53, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const order_r11 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 20, "creditPurchase.close"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 22, "creditPurchase.receipt"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(order_r11.referenceNumber);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r1.statusTone(order_r11.paymentStatus));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 24, ctx_r1.statusKey(order_r11.paymentStatus)));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 26, "creditPurchase.package"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.packageName(order_r11));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 28, "creditPurchase.credits"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(order_r11.credits));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 30, "creditPurchase.bonus"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(order_r11.bonusCredits));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 32, "creditPurchase.amount"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatMoney(order_r11.pricePaid, order_r11.currency));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 34, "creditPurchase.date"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(order_r11.createdAt));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 36, "creditPurchase.paidAt"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(order_r11.paidAt));
    i0.ɵɵadvance();
    i0.ɵɵconditional(!order_r11.providerConfigured && order_r11.paymentStatus === "Pending" ? 50 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 38, "creditPurchase.receiptNote"));
} }
export class CreditChargeComponent {
    constructor() {
        this.purchases = inject(CreditPurchaseService);
        this.wallet = inject(WalletService);
        this.language = inject(LanguageService);
        this.route = inject(ActivatedRoute);
        this.router = inject(Router);
        this.currencyService = inject(CurrencyService);
        this.packages = signal([], ...(ngDevMode ? [{ debugName: "packages" }] : []));
        this.orders = signal([], ...(ngDevMode ? [{ debugName: "orders" }] : []));
        this.selectedPackageId = signal(null, ...(ngDevMode ? [{ debugName: "selectedPackageId" }] : []));
        this.selectedOrder = signal(null, ...(ngDevMode ? [{ debugName: "selectedOrder" }] : []));
        this.loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.submitting = signal(false, ...(ngDevMode ? [{ debugName: "submitting" }] : []));
        this.error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
        this.currentBalance = this.wallet.balance;
        this.selectedPackage = computed(() => this.packages().find(item => item.id === this.selectedPackageId()) ?? null, ...(ngDevMode ? [{ debugName: "selectedPackage" }] : []));
    }
    async ngOnInit() {
        await this.load();
        const orderId = this.route.snapshot.queryParamMap.get('orderId');
        if (orderId)
            await this.refreshOrder(orderId);
    }
    async load() {
        this.loading.set(true);
        this.error.set(null);
        try {
            const [packages, orders] = await Promise.all([
                this.purchases.getActivePackages(),
                this.purchases.getMyOrders(),
                this.wallet.loadBalance()
            ]);
            this.packages.set(packages);
            this.orders.set(orders.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
        }
        catch (error) {
            this.error.set(this.errorText(error));
        }
        finally {
            this.loading.set(false);
        }
    }
    selectPackage(id) { this.selectedPackageId.set(id); }
    async createOrder() {
        const selected = this.selectedPackage();
        if (!selected || this.submitting())
            return;
        this.submitting.set(true);
        this.error.set(null);
        try {
            const order = await this.purchases.createOrder(selected.id);
            this.selectedOrder.set(order);
            this.orders.update(items => [order, ...items.filter(item => item.id !== order.id)]);
            if (order.redirectUrl)
                window.location.assign(order.redirectUrl);
        }
        catch (error) {
            this.error.set(this.errorText(error));
        }
        finally {
            this.submitting.set(false);
        }
    }
    async refreshOrder(id) {
        try {
            const order = await this.purchases.getOrder(id);
            this.selectedOrder.set(order);
            this.orders.update(items => [order, ...items.filter(item => item.id !== order.id)]);
            if (order.paymentStatus === 'Paid')
                await this.wallet.loadBalance();
        }
        catch (error) {
            this.error.set(this.errorText(error));
        }
    }
    viewReceipt(order) { this.selectedOrder.set(order); }
    closeReceipt() { this.selectedOrder.set(null); }
    goBack() { this.router.navigate(['/admin/profile/wallet']); }
    packageName(item) {
        if ('planName' in item)
            return this.language.language() === 'ar' ? item.planNameAr : item.planName;
        return this.language.language() === 'ar' ? item.nameAr : item.name;
    }
    formatMoney(value, currency) {
        return this.currencyService.format(value, currency);
    }
    formatNumber(value) { return new Intl.NumberFormat(this.language.language() === 'ar' ? 'ar-EG' : 'en-US').format(value); }
    formatDate(value) { return value ? new Intl.DateTimeFormat(this.language.language() === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
    statusKey(status) { return `creditPurchase.status.${status}`; }
    statusTone(status) {
        if (status === 'Paid')
            return 'status status--paid';
        if (status === 'Failed' || status === 'Cancelled' || status === 'Expired')
            return 'status status--failed';
        if (status === 'Refunded')
            return 'status status--refunded';
        return 'status status--pending';
    }
    errorText(error) {
        const value = error;
        return value?.error?.message || value?.message || this.language.translate('creditPurchase.error');
    }
    static { this.ɵfac = function CreditChargeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CreditChargeComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CreditChargeComponent, selectors: [["app-credit-charge"]], decls: 32, vars: 23, consts: [[1, "credit-page"], [1, "page-header"], ["type", "button", 1, "back", 3, "click"], [1, "eyebrow"], [1, "balance"], [1, "service-note"], [1, "alert", "alert--error"], [1, "state"], ["role", "dialog", "aria-modal", "true", 1, "modal"], ["type", "button", 3, "click"], [1, "purchase-grid"], [1, "panel"], [1, "package-grid"], [1, "panel", "summary"], [1, "state", "state--compact"], [1, "panel", "history"], [1, "section-heading"], [1, "table-wrap"], ["type", "button", 1, "package", 3, "package--selected"], ["type", "button", 1, "package", 3, "click"], [1, "featured"], [1, "price"], [1, "bonus"], [1, "total"], ["type", "button", 1, "primary", 3, "click", "disabled"], [1, "verification-note"], ["type", "button", 1, "link", 3, "click"], [1, "receipt"], ["type", "button", 1, "close", 3, "click"], [1, "alert"]], template: function CreditChargeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "main", 0)(1, "header", 1)(2, "button", 2);
            i0.ɵɵdomListener("click", function CreditChargeComponent_Template_button_click_2_listener() { return ctx.goBack(); });
            i0.ɵɵtext(3, "\u2039 ");
            i0.ɵɵdomElementStart(4, "span");
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(7, "div")(8, "p", 3);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(11, "h1");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(14, "p");
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(17, "aside", 4)(18, "span");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(21, "strong");
            i0.ɵɵtext(22);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(23, "small");
            i0.ɵɵtext(24, "CREDIT");
            i0.ɵɵdomElementEnd()()();
            i0.ɵɵdomElementStart(25, "p", 5);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(28, CreditChargeComponent_Conditional_28_Template, 5, 4, "div", 6);
            i0.ɵɵconditionalCreate(29, CreditChargeComponent_Conditional_29_Template, 3, 3, "div", 7)(30, CreditChargeComponent_Conditional_30_Template, 23, 15);
            i0.ɵɵconditionalCreate(31, CreditChargeComponent_Conditional_31_Template, 54, 40, "div", 8);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            let tmp_10_0;
            i0.ɵɵattribute("dir", ctx.language.direction());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 11, "creditPurchase.back"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 13, "creditPurchase.eyebrow"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 15, "creditPurchase.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 17, "creditPurchase.subtitle"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 19, "creditPurchase.balance"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.formatNumber(ctx.currentBalance()));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 21, "creditPurchase.serviceOnly"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.error() ? 28 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 29 : 30);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_10_0 = ctx.selectedOrder()) ? 31 : -1, tmp_10_0);
        } }, dependencies: [CommonModule, TranslatePipe], styles: ["[_nghost-%COMP%]{display:block;color:var(--text-primary,#e5e7eb)}.credit-page[_ngcontent-%COMP%]{max-width:1200px;margin:auto;padding:2rem}.page-header[_ngcontent-%COMP%]{display:flex;gap:1.25rem;align-items:center;margin-bottom:1rem}.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:2rem;margin:.2rem 0}.page-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--text-secondary,#94a3b8)}.eyebrow[_ngcontent-%COMP%]{text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;color:var(--primary-color,#60a5fa)!important}.back[_ngcontent-%COMP%], .link[_ngcontent-%COMP%], .section-heading[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{border:0;background:transparent;color:var(--primary-color,#60a5fa);cursor:pointer}.balance[_ngcontent-%COMP%]{margin-inline-start:auto;text-align:center;background:var(--surface-card,#0f172a);border:1px solid var(--border-color,#334155);border-radius:1rem;padding:1rem;min-width:130px}.balance[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .balance[_ngcontent-%COMP%]   small[_ngcontent-%COMP%]{display:block;color:var(--text-secondary,#94a3b8)}.balance[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]{display:block;font-size:1.8rem;color:var(--primary-color,#60a5fa)}.service-note[_ngcontent-%COMP%], .alert[_ngcontent-%COMP%]{padding:1rem;border-radius:.75rem;background:color-mix(in srgb,var(--primary-color,#3b82f6) 12%,transparent);border:1px solid color-mix(in srgb,var(--primary-color,#3b82f6) 25%,transparent)}.alert--error[_ngcontent-%COMP%]{border-color:#ef4444;color:#fca5a5;margin:1rem 0}.alert[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{float:inline-end}.purchase-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:2fr 1fr;gap:1.25rem;margin:1.25rem 0}.panel[_ngcontent-%COMP%]{background:var(--surface-card,#0f172a);border:1px solid var(--border-color,#334155);border-radius:1rem;padding:1.25rem}.package-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.package[_ngcontent-%COMP%]{position:relative;text-align:start;padding:1.25rem;border-radius:.9rem;border:2px solid var(--border-color,#334155);background:var(--surface-ground,#111827);color:inherit;cursor:pointer;display:flex;flex-direction:column;gap:.55rem}.package--selected[_ngcontent-%COMP%]{border-color:var(--primary-color,#3b82f6)}.price[_ngcontent-%COMP%]{font-size:1.7rem;font-weight:800}.bonus[_ngcontent-%COMP%]{color:#34d399}.featured[_ngcontent-%COMP%]{position:absolute;inset-block-start:.5rem;inset-inline-end:.5rem;font-size:.7rem;background:#7c3aed;color:#fff;padding:.25rem .5rem;border-radius:99px}.summary[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%], .receipt[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%]{margin:0}.summary[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%]   div[_ngcontent-%COMP%], .receipt[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{display:flex;justify-content:space-between;gap:1rem;padding:.75rem 0;border-bottom:1px solid var(--border-color,#334155)}dt[_ngcontent-%COMP%]{color:var(--text-secondary,#94a3b8)}dd[_ngcontent-%COMP%]{margin:0;font-weight:650}.total[_ngcontent-%COMP%]{font-size:1.15rem}.primary[_ngcontent-%COMP%]{width:100%;padding:.85rem;border:0;border-radius:.7rem;background:var(--primary-color,#2563eb);color:white;font-weight:700;cursor:pointer}.primary[_ngcontent-%COMP%]:disabled{opacity:.55}.verification-note[_ngcontent-%COMP%]{font-size:.8rem;line-height:1.5;color:var(--text-secondary,#94a3b8)}.state[_ngcontent-%COMP%]{text-align:center;padding:3rem;color:var(--text-secondary,#94a3b8)}.state--compact[_ngcontent-%COMP%]{padding:2rem}.section-heading[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center}.table-wrap[_ngcontent-%COMP%]{overflow:auto}table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse}th[_ngcontent-%COMP%], td[_ngcontent-%COMP%]{text-align:start;padding:.8rem;border-bottom:1px solid var(--border-color,#334155);white-space:nowrap}.status[_ngcontent-%COMP%]{display:inline-flex;padding:.25rem .6rem;border-radius:99px;font-size:.75rem;font-weight:700}.status--paid[_ngcontent-%COMP%]{background:#064e3b;color:#a7f3d0}.status--pending[_ngcontent-%COMP%]{background:#78350f;color:#fde68a}.status--failed[_ngcontent-%COMP%]{background:#7f1d1d;color:#fecaca}.status--refunded[_ngcontent-%COMP%]{background:#4c1d95;color:#ddd6fe}.modal[_ngcontent-%COMP%]{position:fixed;inset:0;background:#000a;display:grid;place-items:center;padding:1rem;z-index:1000}.receipt[_ngcontent-%COMP%]{position:relative;width:min(520px,100%);max-height:90vh;overflow:auto;background:var(--surface-card,#0f172a);border:1px solid var(--border-color,#334155);border-radius:1rem;padding:1.5rem}.close[_ngcontent-%COMP%]{position:absolute;inset-block-start:.8rem;inset-inline-end:.8rem;border:0;background:transparent;color:inherit;font-size:1.7rem;cursor:pointer}[dir=rtl][_ngcontent-%COMP%]   th[_ngcontent-%COMP%], [dir=rtl][_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{text-align:right}@media(max-width:800px){.credit-page[_ngcontent-%COMP%]{padding:1rem}.page-header[_ngcontent-%COMP%]{align-items:flex-start;flex-wrap:wrap}.balance[_ngcontent-%COMP%]{margin-inline-start:0}.purchase-grid[_ngcontent-%COMP%]{grid-template-columns:1fr}.package-grid[_ngcontent-%COMP%]{grid-template-columns:1fr}}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CreditChargeComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-credit-charge', imports: [CommonModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "<main class=\"credit-page\" [attr.dir]=\"language.direction()\">\n  <header class=\"page-header\">\n    <button type=\"button\" class=\"back\" (click)=\"goBack()\">\u2039 <span>{{ 'creditPurchase.back' | translate }}</span></button>\n    <div>\n      <p class=\"eyebrow\">{{ 'creditPurchase.eyebrow' | translate }}</p>\n      <h1>{{ 'creditPurchase.title' | translate }}</h1>\n      <p>{{ 'creditPurchase.subtitle' | translate }}</p>\n    </div>\n    <aside class=\"balance\"><span>{{ 'creditPurchase.balance' | translate }}</span><strong>{{ formatNumber(currentBalance()) }}</strong><small>CREDIT</small></aside>\n  </header>\n\n  <p class=\"service-note\">{{ 'creditPurchase.serviceOnly' | translate }}</p>\n  @if (error()) { <div class=\"alert alert--error\">{{ error() }} <button type=\"button\" (click)=\"load()\">{{ 'creditPurchase.retry' | translate }}</button></div> }\n\n  @if (loading()) {\n    <div class=\"state\">{{ 'creditPurchase.loading' | translate }}</div>\n  } @else {\n    <section class=\"purchase-grid\">\n      <div class=\"panel\">\n        <h2>{{ 'creditPurchase.packages' | translate }}</h2>\n        @if (packages().length === 0) {\n          <div class=\"state\">{{ 'creditPurchase.noPackages' | translate }}</div>\n        } @else {\n          <div class=\"package-grid\">\n            @for (item of packages(); track item.id) {\n              <button type=\"button\" class=\"package\" [class.package--selected]=\"selectedPackageId() === item.id\" (click)=\"selectPackage(item.id)\">\n                @if (item.isFeatured) { <span class=\"featured\">{{ 'creditPurchase.featured' | translate }}</span> }\n                <strong>{{ packageName(item) }}</strong>\n                <span class=\"price\">{{ formatMoney(item.price, item.currency) }}</span>\n                <span>{{ formatNumber(item.credits) }} CREDIT</span>\n                @if (item.bonusCredits > 0) { <span class=\"bonus\">+ {{ formatNumber(item.bonusCredits) }} {{ 'creditPurchase.bonus' | translate }}</span> }\n              </button>\n            }\n          </div>\n        }\n      </div>\n\n      <aside class=\"panel summary\">\n        <h2>{{ 'creditPurchase.review' | translate }}</h2>\n        @if (selectedPackage(); as item) {\n          <dl>\n            <div><dt>{{ 'creditPurchase.package' | translate }}</dt><dd>{{ packageName(item) }}</dd></div>\n            <div><dt>{{ 'creditPurchase.credits' | translate }}</dt><dd>{{ formatNumber(item.credits) }}</dd></div>\n            <div><dt>{{ 'creditPurchase.bonus' | translate }}</dt><dd>{{ formatNumber(item.bonusCredits) }}</dd></div>\n            <div class=\"total\"><dt>{{ 'creditPurchase.total' | translate }}</dt><dd>{{ formatMoney(item.price, item.currency) }}</dd></div>\n          </dl>\n          <button type=\"button\" class=\"primary\" [disabled]=\"submitting()\" (click)=\"createOrder()\">{{ (submitting() ? 'creditPurchase.creating' : 'creditPurchase.buy') | translate }}</button>\n          <p class=\"verification-note\">{{ 'creditPurchase.verificationNote' | translate }}</p>\n        } @else { <div class=\"state state--compact\">{{ 'creditPurchase.selectPrompt' | translate }}</div> }\n      </aside>\n    </section>\n\n    <section class=\"panel history\">\n      <div class=\"section-heading\"><h2>{{ 'creditPurchase.history' | translate }}</h2><button type=\"button\" (click)=\"load()\">{{ 'creditPurchase.refresh' | translate }}</button></div>\n      @if (orders().length === 0) { <div class=\"state\">{{ 'creditPurchase.noOrders' | translate }}</div> }\n      @else {\n        <div class=\"table-wrap\"><table><thead><tr><th>{{ 'creditPurchase.reference' | translate }}</th><th>{{ 'creditPurchase.package' | translate }}</th><th>{{ 'creditPurchase.totalCredits' | translate }}</th><th>{{ 'creditPurchase.amount' | translate }}</th><th>{{ 'creditPurchase.statusLabel' | translate }}</th><th>{{ 'creditPurchase.date' | translate }}</th><th></th></tr></thead>\n          <tbody>@for (order of orders(); track order.id) { <tr><td>{{ order.referenceNumber }}</td><td>{{ packageName(order) }}</td><td>{{ formatNumber(order.credits + order.bonusCredits) }}</td><td>{{ formatMoney(order.pricePaid, order.currency) }}</td><td><span [class]=\"statusTone(order.paymentStatus)\">{{ statusKey(order.paymentStatus) | translate }}</span></td><td>{{ formatDate(order.createdAt) }}</td><td><button type=\"button\" class=\"link\" (click)=\"viewReceipt(order)\">{{ 'creditPurchase.details' | translate }}</button></td></tr> }</tbody>\n        </table></div>\n      }\n    </section>\n  }\n\n  @if (selectedOrder(); as order) {\n    <div class=\"modal\" role=\"dialog\" aria-modal=\"true\"><article class=\"receipt\">\n      <button type=\"button\" class=\"close\" (click)=\"closeReceipt()\" [attr.aria-label]=\"'creditPurchase.close' | translate\">\u00D7</button>\n      <p class=\"eyebrow\">{{ 'creditPurchase.receipt' | translate }}</p><h2>{{ order.referenceNumber }}</h2>\n      <span [class]=\"statusTone(order.paymentStatus)\">{{ statusKey(order.paymentStatus) | translate }}</span>\n      <dl><div><dt>{{ 'creditPurchase.package' | translate }}</dt><dd>{{ packageName(order) }}</dd></div><div><dt>{{ 'creditPurchase.credits' | translate }}</dt><dd>{{ formatNumber(order.credits) }}</dd></div><div><dt>{{ 'creditPurchase.bonus' | translate }}</dt><dd>{{ formatNumber(order.bonusCredits) }}</dd></div><div><dt>{{ 'creditPurchase.amount' | translate }}</dt><dd>{{ formatMoney(order.pricePaid, order.currency) }}</dd></div><div><dt>{{ 'creditPurchase.date' | translate }}</dt><dd>{{ formatDate(order.createdAt) }}</dd></div><div><dt>{{ 'creditPurchase.paidAt' | translate }}</dt><dd>{{ formatDate(order.paidAt) }}</dd></div></dl>\n      @if (!order.providerConfigured && order.paymentStatus === 'Pending') { <p class=\"alert\">{{ 'creditPurchase.providerUnavailable' | translate }}</p> }\n      <p class=\"verification-note\">{{ 'creditPurchase.receiptNote' | translate }}</p>\n    </article></div>\n  }\n</main>\n", styles: [":host{display:block;color:var(--text-primary,#e5e7eb)}.credit-page{max-width:1200px;margin:auto;padding:2rem}.page-header{display:flex;gap:1.25rem;align-items:center;margin-bottom:1rem}.page-header h1{font-size:2rem;margin:.2rem 0}.page-header p{color:var(--text-secondary,#94a3b8)}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;color:var(--primary-color,#60a5fa)!important}.back,.link,.section-heading button{border:0;background:transparent;color:var(--primary-color,#60a5fa);cursor:pointer}.balance{margin-inline-start:auto;text-align:center;background:var(--surface-card,#0f172a);border:1px solid var(--border-color,#334155);border-radius:1rem;padding:1rem;min-width:130px}.balance span,.balance small{display:block;color:var(--text-secondary,#94a3b8)}.balance strong{display:block;font-size:1.8rem;color:var(--primary-color,#60a5fa)}.service-note,.alert{padding:1rem;border-radius:.75rem;background:color-mix(in srgb,var(--primary-color,#3b82f6) 12%,transparent);border:1px solid color-mix(in srgb,var(--primary-color,#3b82f6) 25%,transparent)}.alert--error{border-color:#ef4444;color:#fca5a5;margin:1rem 0}.alert button{float:inline-end}.purchase-grid{display:grid;grid-template-columns:2fr 1fr;gap:1.25rem;margin:1.25rem 0}.panel{background:var(--surface-card,#0f172a);border:1px solid var(--border-color,#334155);border-radius:1rem;padding:1.25rem}.package-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.package{position:relative;text-align:start;padding:1.25rem;border-radius:.9rem;border:2px solid var(--border-color,#334155);background:var(--surface-ground,#111827);color:inherit;cursor:pointer;display:flex;flex-direction:column;gap:.55rem}.package--selected{border-color:var(--primary-color,#3b82f6)}.price{font-size:1.7rem;font-weight:800}.bonus{color:#34d399}.featured{position:absolute;inset-block-start:.5rem;inset-inline-end:.5rem;font-size:.7rem;background:#7c3aed;color:#fff;padding:.25rem .5rem;border-radius:99px}.summary dl,.receipt dl{margin:0}.summary dl div,.receipt dl div{display:flex;justify-content:space-between;gap:1rem;padding:.75rem 0;border-bottom:1px solid var(--border-color,#334155)}dt{color:var(--text-secondary,#94a3b8)}dd{margin:0;font-weight:650}.total{font-size:1.15rem}.primary{width:100%;padding:.85rem;border:0;border-radius:.7rem;background:var(--primary-color,#2563eb);color:white;font-weight:700;cursor:pointer}.primary:disabled{opacity:.55}.verification-note{font-size:.8rem;line-height:1.5;color:var(--text-secondary,#94a3b8)}.state{text-align:center;padding:3rem;color:var(--text-secondary,#94a3b8)}.state--compact{padding:2rem}.section-heading{display:flex;justify-content:space-between;align-items:center}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:start;padding:.8rem;border-bottom:1px solid var(--border-color,#334155);white-space:nowrap}.status{display:inline-flex;padding:.25rem .6rem;border-radius:99px;font-size:.75rem;font-weight:700}.status--paid{background:#064e3b;color:#a7f3d0}.status--pending{background:#78350f;color:#fde68a}.status--failed{background:#7f1d1d;color:#fecaca}.status--refunded{background:#4c1d95;color:#ddd6fe}.modal{position:fixed;inset:0;background:#000a;display:grid;place-items:center;padding:1rem;z-index:1000}.receipt{position:relative;width:min(520px,100%);max-height:90vh;overflow:auto;background:var(--surface-card,#0f172a);border:1px solid var(--border-color,#334155);border-radius:1rem;padding:1.5rem}.close{position:absolute;inset-block-start:.8rem;inset-inline-end:.8rem;border:0;background:transparent;color:inherit;font-size:1.7rem;cursor:pointer}[dir=rtl] th,[dir=rtl] td{text-align:right}@media(max-width:800px){.credit-page{padding:1rem}.page-header{align-items:flex-start;flex-wrap:wrap}.balance{margin-inline-start:0}.purchase-grid{grid-template-columns:1fr}.package-grid{grid-template-columns:1fr}}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CreditChargeComponent, { className: "CreditChargeComponent", filePath: "src/app/pages/admin/credit-charge/credit-charge.component.ts", lineNumber: 18 }); })();
