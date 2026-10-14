import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SettingsService } from '../../../services/settings.service';
import { DashboardDensity, DefaultInvestmentTypePreference, ThemePreference } from '../../../models/settings.model';
import { LanguageService } from '../../../services/language.service';
import { WalletService } from '../../../services/wallet.service';
import { FcmService } from '../../../services/fcm.service';
import { CurrencyService } from '../../../services/currency.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.isoCode;
function SettingsComponent_For_22_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 20);
} }
function SettingsComponent_For_22_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function SettingsComponent_For_22_Template_button_click_0_listener() { const item_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.selectSection(item_r2.id)); });
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, SettingsComponent_For_22_Conditional_4_Template, 1, 0, "span", 20);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r2.activeSection === item_r2.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, item_r2.labelKey));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.hasUnsavedChanges(item_r2.id) ? 4 : -1);
} }
function SettingsComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("feedback-error", ctx_r2.feedback() === "error");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, ctx_r2.feedback() === "saved" ? "settings.actions.saved" : "settings.actions.saveError"), " ");
} }
function SettingsComponent_Case_36_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 24);
    i0.ɵɵlistener("click", function SettingsComponent_Case_36_For_6_Template_button_click_0_listener() { const opt_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setTheme(opt_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r2.draft().theme === opt_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, "settings.appearance.theme.options." + opt_r5), " ");
} }
function SettingsComponent_Case_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14)(1, "label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 22);
    i0.ɵɵrepeaterCreate(5, SettingsComponent_Case_36_For_6_Template, 3, 5, "button", 23, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "settings.appearance.theme.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.themeOptions);
} }
function SettingsComponent_Case_37_For_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 29);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cur_r7 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", cur_r7.isoCode);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.currencyLabel(cur_r7));
} }
function SettingsComponent_Case_37_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "label", 25)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "select", 26);
    i0.ɵɵlistener("change", function SettingsComponent_Case_37_Template_select_change_5_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setLanguageFromEvent($event)); });
    i0.ɵɵelementStart(6, "option", 27);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 28);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "label", 25)(13, "span");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "select", 26);
    i0.ɵɵlistener("change", function SettingsComponent_Case_37_Template_select_change_16_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setCurrencyFromEvent($event)); });
    i0.ɵɵrepeaterCreate(17, SettingsComponent_Case_37_For_18_Template, 2, 2, "option", 29, _forTrack1);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 6, "settings.localization.language.label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.draft().language);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 8, "settings.localization.language.options.en"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 10, "settings.localization.language.options.ar"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 12, "settings.localization.currency.label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.draft().currency);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.currencyOptions);
} }
function SettingsComponent_Case_38_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "settings.notifications.permissionNotGranted"), " ");
} }
function SettingsComponent_Case_38_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 38);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "settings.notifications.permissionGranted"), " ");
} }
function SettingsComponent_Case_38_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 39);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "settings.notifications.pushActive"), " ");
} }
function SettingsComponent_Case_38_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 43);
    i0.ɵɵlistener("click", function SettingsComponent_Case_38_Conditional_29_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.enableFcm()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.fcmLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, ctx_r2.fcmLoading() ? "settings.notifications.enabling" : "settings.notifications.enablePush"), " ");
} }
function SettingsComponent_Case_38_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 44);
    i0.ɵɵlistener("click", function SettingsComponent_Case_38_Conditional_30_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.disableFcm()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.fcmLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, ctx_r2.fcmLoading() ? "settings.notifications.disabling" : "settings.notifications.disablePush"), " ");
} }
function SettingsComponent_Case_38_Conditional_31_For_5_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const device_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(device_r11.platform);
} }
function SettingsComponent_Case_38_Conditional_31_For_5_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const device_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "settings.notifications.lastUsed"), ": ", device_r11.lastUsedAt);
} }
function SettingsComponent_Case_38_Conditional_31_For_5_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 49);
    i0.ɵɵlistener("click", function SettingsComponent_Case_38_Conditional_31_For_5_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const device_r11 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.deactivateDevice(device_r11.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r2.fcmLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "settings.notifications.disableDevice"), " ");
} }
function SettingsComponent_Case_38_Conditional_31_For_5_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 48);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "settings.notifications.inactive"));
} }
function SettingsComponent_Case_38_Conditional_31_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 45)(1, "span", 46)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, SettingsComponent_Case_38_Conditional_31_For_5_Conditional_4_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(5, SettingsComponent_Case_38_Conditional_31_For_5_Conditional_5_Template, 3, 4, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, SettingsComponent_Case_38_Conditional_31_For_5_Conditional_6_Template, 3, 4, "button", 47)(7, SettingsComponent_Case_38_Conditional_31_For_5_Conditional_7_Template, 3, 3, "span", 48);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const device_r11 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(device_r11.browser || "Browser");
    i0.ɵɵadvance();
    i0.ɵɵconditional(device_r11.platform ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(device_r11.lastUsedAt ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(device_r11.isActive ? 6 : 7);
} }
function SettingsComponent_Case_38_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42)(1, "label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, SettingsComponent_Case_38_Conditional_31_For_5_Template, 8, 4, "div", 45, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "settings.notifications.registeredDevices"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.fcmDevices());
} }
function SettingsComponent_Case_38_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "label", 30)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 31)(6, "input", 32);
    i0.ɵɵlistener("change", function SettingsComponent_Case_38_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setNotificationFromEvent("email", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 33);
    i0.ɵɵelement(8, "span");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "label", 30)(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span", 31)(14, "input", 32);
    i0.ɵɵlistener("change", function SettingsComponent_Case_38_Template_input_change_14_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setNotificationFromEvent("sms", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "span", 33);
    i0.ɵɵelement(16, "span");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelement(17, "hr", 34);
    i0.ɵɵelementStart(18, "div", 14)(19, "label");
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p", 35);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 36);
    i0.ɵɵconditionalCreate(26, SettingsComponent_Case_38_Conditional_26_Template, 3, 3, "span", 37)(27, SettingsComponent_Case_38_Conditional_27_Template, 3, 3, "span", 38)(28, SettingsComponent_Case_38_Conditional_28_Template, 3, 3, "span", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(29, SettingsComponent_Case_38_Conditional_29_Template, 3, 4, "button", 40)(30, SettingsComponent_Case_38_Conditional_30_Template, 3, 4, "button", 41);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(31, SettingsComponent_Case_38_Conditional_31_Template, 6, 3, "div", 42);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, "settings.notifications.email"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.draft().notifications.email);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 11, "settings.notifications.sms"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.draft().notifications.sms);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 13, "settings.notifications.browserPush"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 15, "settings.notifications.browserPushHint"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r2.fcmEnabled() && !ctx_r2.fcmService.permissionGranted ? 26 : ctx_r2.fcmService.permissionGranted && !ctx_r2.fcmEnabled() ? 27 : ctx_r2.fcmEnabled() ? 28 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r2.fcmEnabled() ? 29 : 30);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.fcmDevices().length > 0 ? 31 : -1);
} }
function SettingsComponent_Case_39_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "label", 30)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 31)(6, "input", 32);
    i0.ɵɵlistener("change", function SettingsComponent_Case_39_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setPrivacyFromEvent("showPublicProfile", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 33);
    i0.ɵɵelement(8, "span");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "label", 30)(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span", 31)(14, "input", 32);
    i0.ɵɵlistener("change", function SettingsComponent_Case_39_Template_input_change_14_listener($event) { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setPrivacyFromEvent("sharePortfolioPerformance", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "span", 33);
    i0.ɵɵelement(16, "span");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "settings.privacy.showPublicProfile"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.draft().privacy.showPublicProfile);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 6, "settings.privacy.sharePortfolioPerformance"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.draft().privacy.sharePortfolioPerformance);
} }
function SettingsComponent_Case_40_For_7_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 24);
    i0.ɵɵlistener("click", function SettingsComponent_Case_40_For_7_Template_button_click_0_listener() { const opt_r16 = i0.ɵɵrestoreView(_r15).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setPersonalization({ dashboardDensity: opt_r16 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r16 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r2.draft().personalization.dashboardDensity === opt_r16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "settings.personalization.dashboardDensity.options." + opt_r16));
} }
function SettingsComponent_Case_40_For_14_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 24);
    i0.ɵɵlistener("click", function SettingsComponent_Case_40_For_14_Template_button_click_0_listener() { const opt_r18 = i0.ɵɵrestoreView(_r17).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setPersonalization({ defaultInvestmentType: opt_r18 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r18 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r2.draft().personalization.defaultInvestmentType === opt_r18);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "settings.personalization.defaultInvestmentType.options." + opt_r18));
} }
function SettingsComponent_Case_40_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "div", 14)(2, "label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 22);
    i0.ɵɵrepeaterCreate(6, SettingsComponent_Case_40_For_7_Template, 3, 5, "button", 23, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 14)(9, "label");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 22);
    i0.ɵɵrepeaterCreate(13, SettingsComponent_Case_40_For_14_Template, 3, 5, "button", 23, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "label", 50)(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 31)(20, "input", 32);
    i0.ɵɵlistener("change", function SettingsComponent_Case_40_Template_input_change_20_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setRiskIndicatorsFromEvent($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "span", 33);
    i0.ɵɵelement(22, "span");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "settings.personalization.dashboardDensity.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.densityOptions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 6, "settings.personalization.defaultInvestmentType.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.investmentTypeOptions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 8, "settings.personalization.showRiskIndicators"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.draft().personalization.showRiskIndicators);
} }
function SettingsComponent_Case_41_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "label", 30)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 31)(6, "input", 32);
    i0.ɵɵlistener("change", function SettingsComponent_Case_41_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r19); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setSupportAvailabilityFromEvent($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 33);
    i0.ɵɵelement(8, "span");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(9, "label", 51)(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "input", 52);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵlistener("input", function SettingsComponent_Case_41_Template_input_input_13_listener($event) { i0.ɵɵrestoreView(_r19); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setSupportHoursFromEvent($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "settings.support.available"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.draft().support.available);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 7, "settings.support.hours"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.draft().support.hours ?? "")("placeholder", i0.ɵɵpipeBind1(14, 9, "settings.placeholders.supportHours"));
} }
function SettingsComponent_Case_42_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 17)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 53)(5, "input", 54);
    i0.ɵɵlistener("input", function SettingsComponent_Case_42_Template_input_input_5_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setSessionTimeoutFromEvent($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "small");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "settings.security.sessionTimeout.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r2.draft().sessionTimeoutMinutes ?? "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 6, "settings.security.sessionTimeout.minutes"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 8, "settings.security.sessionTimeout.help"));
} }
function SettingsComponent_Case_43_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 55);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "settings.wallet.loading"));
} }
function SettingsComponent_Case_43_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 56)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 61);
    i0.ɵɵlistener("click", function SettingsComponent_Case_43_Conditional_1_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r21); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.retryCreditBalance()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "settings.wallet.loadError"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "settings.actions.retry"));
} }
function SettingsComponent_Case_43_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong", 62);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "settings.wallet.availableCredit"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(6, 4, ctx_r2.platformCreditBalance(), "1.0-2", "en-US"));
} }
function SettingsComponent_Case_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SettingsComponent_Case_43_Conditional_0_Template, 3, 3, "div", 55)(1, SettingsComponent_Case_43_Conditional_1_Template, 7, 6, "div", 56)(2, SettingsComponent_Case_43_Conditional_2_Template, 7, 8, "div", 57);
    i0.ɵɵelementStart(3, "div", 58)(4, "a", 59);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "a", 60);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r2.creditLoading() ? 0 : ctx_r2.creditError() ? 1 : 2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 3, "profile.viewWallet"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 5, "profile.credits.chargeNow"));
} }
function SettingsComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "footer", 18)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 43);
    i0.ɵɵlistener("click", function SettingsComponent_Conditional_44_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r22); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.saveActiveSection()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵclassProp("unsaved-label", ctx_r2.hasUnsavedChanges(ctx_r2.activeSection));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, ctx_r2.hasUnsavedChanges(ctx_r2.activeSection) ? "settings.actions.unsaved" : "settings.actions.upToDate"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r2.hasUnsavedChanges(ctx_r2.activeSection));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 7, "settings.actions.save"));
} }
export class SettingsComponent {
    constructor() {
        this.settingsService = inject(SettingsService);
        this.walletService = inject(WalletService);
        this.currencyService = inject(CurrencyService);
        this.languageService = inject(LanguageService);
        this.fcmService = inject(FcmService);
        this.platformCreditBalance = this.walletService.balance;
        this.creditLoading = signal(true, ...(ngDevMode ? [{ debugName: "creditLoading" }] : []));
        this.creditError = signal(false, ...(ngDevMode ? [{ debugName: "creditError" }] : []));
        this.fcmEnabled = signal(false, ...(ngDevMode ? [{ debugName: "fcmEnabled" }] : []));
        this.fcmDevices = signal([], ...(ngDevMode ? [{ debugName: "fcmDevices" }] : []));
        this.fcmLoading = signal(false, ...(ngDevMode ? [{ debugName: "fcmLoading" }] : []));
        this.ThemePreference = ThemePreference;
        this.DashboardDensity = DashboardDensity;
        this.DefaultInvestmentTypePreference = DefaultInvestmentTypePreference;
        this.settings = this.settingsService.settings;
        this.draft = signal(this.cloneSettings(this.settingsService.settings()), ...(ngDevMode ? [{ debugName: "draft" }] : []));
        this.feedback = signal(null, ...(ngDevMode ? [{ debugName: "feedback" }] : []));
        this.feedbackSection = signal(null, ...(ngDevMode ? [{ debugName: "feedbackSection" }] : []));
        this.themeOptions = [ThemePreference.System, ThemePreference.Light, ThemePreference.Dark];
        this.densityOptions = [DashboardDensity.Comfortable, DashboardDensity.Compact];
        this.investmentTypeOptions = [DefaultInvestmentTypePreference.Any, DefaultInvestmentTypePreference.Founding, DefaultInvestmentTypePreference.Equity];
        this.currencyOptions = [];
        // Sidebar navigation
        this.activeSection = 'appearance';
        this.menuItems = [
            { id: 'appearance', labelKey: 'settings.appearance.title' },
            { id: 'localization', labelKey: 'settings.localization.title' },
            { id: 'notifications', labelKey: 'settings.notifications.title' },
            { id: 'privacy', labelKey: 'settings.privacy.title' },
            { id: 'personalization', labelKey: 'settings.personalization.title' },
            { id: 'support', labelKey: 'settings.support.title' },
            { id: 'security', labelKey: 'settings.security.title' },
            { id: 'wallet', labelKey: 'settings.wallet.title' },
        ];
        void this.loadCreditBalance();
        void this.loadCurrencies();
    }
    async loadCurrencies() {
        try {
            await this.currencyService.ensureLoaded();
            const currencies = this.currencyService.master().filter(currency => currency.isActive);
            this.currencyOptions = currencies;
            if (!this.draft().currency && currencies[0])
                this.updateDraft({ currency: currencies[0].isoCode });
        }
        catch {
            this.currencyOptions = [];
        }
    }
    currencyLabel(currency) {
        const name = this.languageService.language() === 'ar' ? currency.arabicName : currency.englishName;
        return `${currency.symbol} ${currency.isoCode} — ${name}`;
    }
    setTheme(theme) {
        this.updateDraft({ theme });
    }
    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'ar')
            return;
        this.updateDraft({ language: lang });
    }
    setCurrency(cur) {
        const currency = this.currencyOptions.find(option => option.isoCode === cur);
        if (currency)
            this.updateDraft({ currency: currency.isoCode });
    }
    setLanguageFromEvent(event) {
        if (event.target instanceof HTMLSelectElement)
            this.setLanguage(event.target.value);
    }
    setCurrencyFromEvent(event) {
        if (event.target instanceof HTMLSelectElement)
            this.setCurrency(event.target.value);
    }
    setNotificationFromEvent(key, event) {
        if (event.target instanceof HTMLInputElement)
            this.toggleNotifications(key, event.target.checked);
    }
    setPrivacyFromEvent(key, event) {
        if (event.target instanceof HTMLInputElement)
            this.togglePrivacy(key, event.target.checked);
    }
    setRiskIndicatorsFromEvent(event) {
        if (event.target instanceof HTMLInputElement)
            this.setPersonalization({ showRiskIndicators: event.target.checked });
    }
    setSupportAvailabilityFromEvent(event) {
        if (event.target instanceof HTMLInputElement)
            this.setSupportAvailability(event.target.checked);
    }
    setSupportHoursFromEvent(event) {
        if (event.target instanceof HTMLInputElement)
            this.setSupportHours(event.target.value);
    }
    setSessionTimeoutFromEvent(event) {
        if (event.target instanceof HTMLInputElement)
            this.setSessionTimeoutMinutes(event.target.value);
    }
    toggleNotifications(key, value) {
        this.updateDraft({ notifications: { ...this.draft().notifications, [key]: value } });
    }
    togglePrivacy(key, value) {
        this.updateDraft({ privacy: { ...this.draft().privacy, [key]: value } });
    }
    setPersonalization(partial) {
        this.updateDraft({ personalization: { ...this.draft().personalization, ...partial } });
    }
    selectSection(id) {
        this.activeSection = id;
        this.feedback.set(null);
    }
    setSupportAvailability(val) {
        this.updateDraft({ support: { ...this.draft().support, available: val } });
    }
    setSupportHours(val) {
        this.updateDraft({ support: { ...this.draft().support, hours: val } });
    }
    // Session timeout (admin configurable)
    setSessionTimeoutMinutes(val) {
        const v = parseInt(val, 10);
        if (!isNaN(v) && isFinite(v) && v > 0) {
            this.updateDraft({ sessionTimeoutMinutes: Math.floor(v) });
        }
        else {
            this.updateDraft({ sessionTimeoutMinutes: undefined });
        }
    }
    async enableFcm() {
        this.fcmLoading.set(true);
        try {
            const ok = await this.fcmService.enable();
            this.fcmEnabled.set(ok);
            if (ok) {
                this.settingsService.setNotifications({ ...this.settings().notifications, push: true });
                this.draft.update(d => ({ ...d, notifications: { ...d.notifications, push: true } }));
                await this.loadFcmDevices();
            }
        }
        finally {
            this.fcmLoading.set(false);
        }
    }
    async disableFcm() {
        this.fcmLoading.set(true);
        try {
            await this.fcmService.disable();
            this.fcmEnabled.set(false);
            this.settingsService.setNotifications({ ...this.settings().notifications, push: false });
            this.draft.update(d => ({ ...d, notifications: { ...d.notifications, push: false } }));
            this.fcmDevices.set([]);
        }
        finally {
            this.fcmLoading.set(false);
        }
    }
    async loadFcmDevices() {
        try {
            const devices = await this.fcmService.getMyDevices();
            this.fcmDevices.set(devices);
            this.fcmEnabled.set(devices.some(d => d.isActive));
        }
        catch {
            // ignore
        }
    }
    async deactivateDevice(deviceId) {
        this.fcmLoading.set(true);
        try {
            await this.fcmService.disable();
            this.fcmEnabled.set(false);
            this.fcmDevices.update(devices => devices.map(d => d.id === deviceId ? { ...d, isActive: false } : d));
        }
        finally {
            this.fcmLoading.set(false);
        }
    }
    saveActiveSection() {
        const value = this.draft();
        let saved = false;
        switch (this.activeSection) {
            case 'appearance':
                saved = this.settingsService.setTheme(value.theme);
                break;
            case 'localization':
                saved = this.settingsService.update({ language: value.language, currency: value.currency });
                if (saved && (value.language === 'en' || value.language === 'ar'))
                    this.languageService.setLanguage(value.language);
                break;
            case 'notifications':
                saved = this.settingsService.setNotifications(value.notifications);
                break;
            case 'privacy':
                saved = this.settingsService.setPrivacy(value.privacy);
                break;
            case 'personalization':
                saved = this.settingsService.setPersonalization(value.personalization);
                break;
            case 'support':
                saved = this.settingsService.setSupport(value.support);
                break;
            case 'security':
                saved = this.settingsService.setSessionTimeout(value.sessionTimeoutMinutes ?? null);
                break;
            case 'wallet':
                return;
        }
        this.feedbackSection.set(this.activeSection);
        this.feedback.set(saved ? 'saved' : 'error');
    }
    hasUnsavedChanges(section) {
        return JSON.stringify(this.sectionValue(this.draft(), section)) !== JSON.stringify(this.sectionValue(this.settings(), section));
    }
    showSaveAction() {
        return this.activeSection !== 'wallet';
    }
    updateDraft(partial) {
        this.draft.update(current => ({ ...current, ...partial }));
        this.feedback.set(null);
    }
    sectionValue(value, section) {
        switch (section) {
            case 'appearance': return value.theme;
            case 'localization': return { language: value.language, currency: value.currency };
            case 'notifications': return value.notifications;
            case 'privacy': return value.privacy;
            case 'personalization': return value.personalization;
            case 'support': return value.support;
            case 'security': return value.sessionTimeoutMinutes;
            case 'wallet': return null;
        }
    }
    cloneSettings(value) {
        return {
            ...value,
            notifications: { ...value.notifications },
            privacy: { ...value.privacy },
            personalization: { ...value.personalization },
            support: { ...value.support }
        };
    }
    async loadCreditBalance() {
        try {
            this.creditError.set(false);
            await this.walletService.loadBalance();
        }
        catch {
            this.creditError.set(true);
        }
        finally {
            this.creditLoading.set(false);
        }
    }
    retryCreditBalance() {
        this.creditLoading.set(true);
        void this.loadCreditBalance();
    }
    static { this.ɵfac = function SettingsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SettingsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SettingsComponent, selectors: [["app-settings"]], decls: 45, vars: 27, consts: [[1, "settings-page"], [1, "settings-shell"], ["routerLink", "/admin/dashboard", 1, "back-link"], ["aria-hidden", "true", "viewBox", "0 0 24 24"], ["d", "m15 19-7-7 7-7"], [1, "settings-header", "investa-panel"], [1, "eyebrow"], [1, "settings-workspace"], [1, "settings-nav", "investa-panel"], ["type", "button", 3, "active"], [1, "settings-panel", "investa-panel"], [1, "section-header"], ["role", "status", 1, "feedback", 3, "feedback-error"], [1, "settings-content"], [1, "setting-group"], [1, "form-grid"], [1, "toggle-list"], [1, "field", "compact-field"], [1, "section-actions"], ["type", "button", 3, "click"], ["aria-hidden", "true", 1, "unsaved-dot"], ["role", "status", 1, "feedback"], [1, "choice-group"], ["type", "button", 1, "choice-button", 3, "selected"], ["type", "button", 1, "choice-button", 3, "click"], [1, "field"], [3, "change", "value"], ["value", "en"], ["value", "ar"], [3, "value"], [1, "toggle-row"], [1, "switch-control"], ["type", "checkbox", 3, "change", "checked"], [1, "switch-track"], [1, "settings-divider"], [1, "setting-hint"], [1, "fcm-status"], [1, "fcm-permission-badge", "fcm-denied"], [1, "fcm-permission-badge", "fcm-granted"], [1, "fcm-permission-badge", "fcm-active"], ["type", "button", 1, "primary-button", 3, "disabled"], ["type", "button", 1, "secondary-button", 3, "disabled"], [1, "device-list"], ["type", "button", 1, "primary-button", 3, "click", "disabled"], ["type", "button", 1, "secondary-button", 3, "click", "disabled"], [1, "device-row"], [1, "device-info"], ["type", "button", 1, "small-button", 3, "disabled"], [1, "inactive-badge"], ["type", "button", 1, "small-button", 3, "click", "disabled"], [1, "toggle-row", "standalone-toggle"], [1, "field", "spaced-field"], ["type", "text", 3, "input", "value", "placeholder"], [1, "number-field"], ["type", "number", "min", "1", "inputmode", "numeric", "dir", "ltr", 3, "input", "value"], ["role", "status", 1, "credit-state"], [1, "credit-state", "credit-error"], [1, "credit-summary"], [1, "wallet-actions"], ["routerLink", "/admin/profile/wallet", 1, "secondary-button"], ["routerLink", "/admin/credit-charge", 1, "primary-button"], ["type", "button", 1, "secondary-button", 3, "click"], ["dir", "ltr"]], template: function SettingsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(3, "svg", 3);
            i0.ɵɵelement(4, "path", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(7, "header", 5)(8, "p", 6);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "h1");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "p");
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 7)(18, "aside", 8);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementStart(20, "nav");
            i0.ɵɵrepeaterCreate(21, SettingsComponent_For_22_Template, 5, 6, "button", 9, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "section", 10)(24, "header", 11)(25, "p", 6);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "h2");
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "p");
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(34, SettingsComponent_Conditional_34_Template, 3, 5, "div", 12);
            i0.ɵɵelementStart(35, "div", 13);
            i0.ɵɵconditionalCreate(36, SettingsComponent_Case_36_Template, 7, 3, "div", 14)(37, SettingsComponent_Case_37_Template, 19, 14, "div", 15)(38, SettingsComponent_Case_38_Template, 32, 17)(39, SettingsComponent_Case_39_Template, 17, 8, "div", 16)(40, SettingsComponent_Case_40_Template, 23, 10)(41, SettingsComponent_Case_41_Template, 15, 11)(42, SettingsComponent_Case_42_Template, 12, 10, "label", 17)(43, SettingsComponent_Case_43_Template, 10, 7);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(44, SettingsComponent_Conditional_44_Template, 7, 9, "footer", 18);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_10_0;
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 11, "settings.backToDashboard"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 13, "settings.eyebrow"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 15, "settings.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 17, "settings.subtitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 19, "settings.navigationLabel"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.menuItems);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 21, "settings.sectionEyebrow"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 23, "settings." + ctx.activeSection + ".title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 25, "settings.sections." + ctx.activeSection + ".description"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.feedbackSection() === ctx.activeSection && ctx.feedback() ? 34 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_10_0 = ctx.activeSection) === "appearance" ? 36 : tmp_10_0 === "localization" ? 37 : tmp_10_0 === "notifications" ? 38 : tmp_10_0 === "privacy" ? 39 : tmp_10_0 === "personalization" ? 40 : tmp_10_0 === "support" ? 41 : tmp_10_0 === "security" ? 42 : tmp_10_0 === "wallet" ? 43 : -1);
            i0.ɵɵadvance(8);
            i0.ɵɵconditional(ctx.showSaveAction() ? 44 : -1);
        } }, dependencies: [CommonModule, RouterLink, i1.DecimalPipe, TranslatePipe], styles: ["[_nghost-%COMP%] {\r\n  --settings-page: var(--investa-bg, #f4f5f2);\r\n  --settings-surface: var(--investa-surface, #ffffff);\r\n  --settings-soft: var(--investa-surface-soft, #f7f8f6);\r\n  --settings-border: var(--investa-border, #dfe3dd);\r\n  --settings-text: var(--investa-text, #202522);\r\n  --settings-muted: var(--investa-text-muted, #69716c);\r\n  --settings-charcoal: #242925;\r\n  --settings-green: #168447;\r\n  --settings-green-soft: #e8f5ec;\r\n  --settings-danger: #b42318;\r\n  display: block;\r\n  color: var(--settings-text);\r\n}\r\n\r\nbody.investa-theme-dark[_nghost-%COMP%], body.investa-theme-dark   [_nghost-%COMP%], \r\n.dark[_nghost-%COMP%], .dark   [_nghost-%COMP%] {\r\n  --settings-page: var(--investa-bg, #101310);\r\n  --settings-surface: var(--investa-surface, #191d1a);\r\n  --settings-soft: var(--investa-surface-soft, #202521);\r\n  --settings-border: var(--investa-border, #343a35);\r\n  --settings-text: var(--investa-text, #f3f5f3);\r\n  --settings-muted: var(--investa-text-muted, #aab1ac);\r\n  --settings-charcoal: #f3f5f3;\r\n  --settings-green: #4fc578;\r\n  --settings-green-soft: rgba(42, 154, 83, .16);\r\n  --settings-danger: #ff8a80;\r\n}\r\n\r\n*[_ngcontent-%COMP%] { box-sizing: border-box; }\r\n\r\n.settings-page[_ngcontent-%COMP%] {\r\n  min-height: 100%;\r\n  padding: 24px;\r\n  background: var(--settings-page);\r\n}\r\n\r\n.settings-shell[_ngcontent-%COMP%] { width: min(1180px, 100%); margin-inline: auto; }\r\n\r\n.back-link[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 7px;\r\n  margin-block-end: 12px;\r\n  color: var(--settings-muted);\r\n  font-size: .84rem;\r\n  font-weight: 650;\r\n  text-decoration: none;\r\n}\r\n\r\n.back-link[_ngcontent-%COMP%]:hover { color: var(--settings-green); }\r\n.back-link[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; }\r\n[dir='rtl'][_nghost-%COMP%]   .back-link[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%], [dir='rtl']   [_nghost-%COMP%]   .back-link[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { transform: rotate(180deg); }\r\n\r\n.settings-header[_ngcontent-%COMP%] { padding: 20px 22px; }\r\n.eyebrow[_ngcontent-%COMP%] { margin: 0 0 5px; color: var(--settings-green); font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\r\n.settings-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; color: var(--settings-text); font-weight: 760; letter-spacing: -.02em; }\r\n.settings-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { font-size: clamp(1.35rem, 2.4vw, 1.75rem); }\r\n.settings-header[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%]:last-child, .section-header[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%]:last-child { margin: 6px 0 0; color: var(--settings-muted); font-size: .88rem; line-height: 1.55; }\r\n\r\n.settings-workspace[_ngcontent-%COMP%] { display: grid; grid-template-columns: 215px minmax(0, 1fr); gap: 14px; margin-block-start: 14px; align-items: start; }\r\n.settings-nav[_ngcontent-%COMP%] { position: sticky; top: 16px; padding: 6px; }\r\n.settings-nav[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%] { display: grid; gap: 3px; }\r\n.settings-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 8px;\r\n  min-height: 40px;\r\n  padding: 9px 11px;\r\n  border: 1px solid transparent;\r\n  border-radius: 10px;\r\n  background: transparent;\r\n  color: var(--settings-muted);\r\n  font: inherit;\r\n  font-size: .84rem;\r\n  font-weight: 650;\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.settings-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--settings-soft); color: var(--settings-text); }\r\n.settings-nav[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--settings-green) 28%, transparent); background: var(--settings-green-soft); color: var(--settings-green); }\r\n.unsaved-dot[_ngcontent-%COMP%] { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: var(--settings-green); }\r\n\r\n.settings-panel[_ngcontent-%COMP%] { min-width: 0; overflow: hidden; }\r\n.section-header[_ngcontent-%COMP%] { padding: 19px 21px 17px; border-block-end: 1px solid var(--settings-border); }\r\n.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { font-size: 1.12rem; }\r\n.settings-content[_ngcontent-%COMP%] { min-height: 235px; padding: 20px 21px; }\r\n\r\n.feedback[_ngcontent-%COMP%] { margin: 14px 21px 0; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--settings-green) 32%, transparent); border-radius: 10px; background: var(--settings-green-soft); color: var(--settings-green); font-size: .82rem; font-weight: 700; }\r\n.feedback-error[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--settings-danger) 32%, transparent); background: color-mix(in srgb, var(--settings-danger) 8%, transparent); color: var(--settings-danger); }\r\n\r\n.setting-group[_ngcontent-%COMP%]    > label[_ngcontent-%COMP%], .field[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%]:first-child { display: block; margin-block-end: 8px; color: var(--settings-text); font-size: .79rem; font-weight: 720; }\r\n.choice-group[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 7px; }\r\n.choice-button[_ngcontent-%COMP%], .secondary-button[_ngcontent-%COMP%], .primary-button[_ngcontent-%COMP%] {\r\n  min-height: 38px;\r\n  padding: 8px 13px;\r\n  border-radius: 10px;\r\n  font: inherit;\r\n  font-size: .8rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n}\r\n.choice-button[_ngcontent-%COMP%], .secondary-button[_ngcontent-%COMP%] { border: 1px solid var(--settings-border); background: var(--settings-soft); color: var(--settings-text); }\r\n.choice-button[_ngcontent-%COMP%]:hover, .secondary-button[_ngcontent-%COMP%]:hover { border-color: color-mix(in srgb, var(--settings-green) 50%, var(--settings-border)); }\r\n.choice-button.selected[_ngcontent-%COMP%] { border-color: var(--settings-green); background: var(--settings-green-soft); color: var(--settings-green); }\r\n.primary-button[_ngcontent-%COMP%] { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--settings-charcoal); background: var(--settings-charcoal); color: var(--settings-surface); }\r\n.primary-button[_ngcontent-%COMP%]:hover:not(:disabled) { opacity: .88; }\r\n.primary-button[_ngcontent-%COMP%]:disabled { opacity: .42; cursor: not-allowed; }\r\n\r\n.form-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }\r\n.field[_ngcontent-%COMP%] { display: block; }\r\n.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  min-height: 40px;\r\n  padding: 8px 11px;\r\n  border: 1px solid var(--settings-border);\r\n  border-radius: 10px;\r\n  outline: none;\r\n  background: var(--settings-soft);\r\n  color: var(--settings-text);\r\n  font: inherit;\r\n  font-size: .84rem;\r\n}\r\n.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, .field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus, button[_ngcontent-%COMP%]:focus-visible, a[_ngcontent-%COMP%]:focus-visible { outline: 3px solid color-mix(in srgb, var(--settings-green) 22%, transparent); outline-offset: 2px; border-color: var(--settings-green); }\r\n.field[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; margin-block-start: 7px; color: var(--settings-muted); font-size: .76rem; line-height: 1.45; }\r\n.spaced-field[_ngcontent-%COMP%] { max-width: 520px; margin-block-start: 16px; }\r\n.compact-field[_ngcontent-%COMP%] { max-width: 560px; }\r\n.number-field[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; }\r\n.number-field[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--settings-muted); font-size: .8rem; }\r\n\r\n.toggle-list[_ngcontent-%COMP%] { display: grid; gap: 9px; }\r\n.toggle-row[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 50px; padding: 10px 12px; border: 1px solid var(--settings-border); border-radius: 12px; background: var(--settings-soft); color: var(--settings-text); font-size: .84rem; font-weight: 650; cursor: pointer; }\r\n.standalone-toggle[_ngcontent-%COMP%] { margin-block-start: 16px; }\r\n.switch-control[_ngcontent-%COMP%] { position: relative; display: inline-flex; flex: 0 0 auto; }\r\n.switch-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { position: absolute; width: 1px; height: 1px; opacity: 0; }\r\n.switch-track[_ngcontent-%COMP%] { position: relative; width: 42px; height: 24px; border: 1px solid var(--settings-border); border-radius: 999px; background: color-mix(in srgb, var(--settings-muted) 25%, var(--settings-surface)); transition: .18s ease; }\r\n.switch-track[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { position: absolute; inset-block-start: 2px; inset-inline-start: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.22); transition: inset-inline-start .18s ease; }\r\n.switch-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .switch-track[_ngcontent-%COMP%] { border-color: var(--settings-green); background: var(--settings-green); }\r\n.switch-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .switch-track[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { inset-inline-start: 20px; }\r\n.switch-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus-visible    + .switch-track[_ngcontent-%COMP%] { outline: 3px solid color-mix(in srgb, var(--settings-green) 22%, transparent); outline-offset: 2px; }\r\n\r\n.section-actions[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: flex-end; gap: 14px; min-height: 66px; padding: 12px 21px; border-block-start: 1px solid var(--settings-border); background: var(--settings-soft); }\r\n.section-actions[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--settings-muted); font-size: .76rem; }\r\n.section-actions[_ngcontent-%COMP%]   .unsaved-label[_ngcontent-%COMP%] { color: var(--settings-green); font-weight: 700; }\r\n\r\n.credit-summary[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; border: 1px solid var(--settings-border); border-radius: 14px; background: var(--settings-soft); }\r\n.credit-summary[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--settings-muted); font-size: .82rem; }\r\n.credit-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--settings-text); font-size: 1.3rem; }\r\n.credit-state[_ngcontent-%COMP%] { padding: 16px; border: 1px solid var(--settings-border); border-radius: 14px; background: var(--settings-soft); color: var(--settings-muted); font-size: .84rem; }\r\n.credit-error[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--settings-danger); }\r\n.wallet-actions[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-block-start: 14px; }\r\n\r\n@media (max-width: 780px) {\r\n  .settings-page[_ngcontent-%COMP%] { padding: 16px; }\r\n  .settings-workspace[_ngcontent-%COMP%] { display: block; }\r\n  .settings-nav[_ngcontent-%COMP%] { position: static; margin-block-end: 12px; overflow: hidden; }\r\n  .settings-nav[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%] { display: flex; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-width: thin; }\r\n  .settings-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { flex: 0 0 auto; white-space: nowrap; }\r\n}\r\n\r\n@media (max-width: 560px) {\r\n  .settings-page[_ngcontent-%COMP%] { padding: 12px; }\r\n  .settings-header[_ngcontent-%COMP%], .section-header[_ngcontent-%COMP%], .settings-content[_ngcontent-%COMP%] { padding-inline: 15px; }\r\n  .form-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .section-actions[_ngcontent-%COMP%] { padding-inline: 15px; }\r\n  .credit-summary[_ngcontent-%COMP%], .credit-error[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; }\r\n  .wallet-actions[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] { flex: 1 1 auto; }\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  *[_ngcontent-%COMP%], *[_ngcontent-%COMP%]::before, *[_ngcontent-%COMP%]::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SettingsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-settings', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, TranslatePipe], template: "<main class=\"settings-page\">\r\n  <div class=\"settings-shell\">\r\n    <a routerLink=\"/admin/dashboard\" class=\"back-link\">\r\n      <svg aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"m15 19-7-7 7-7\"></path></svg>\r\n      {{ 'settings.backToDashboard' | translate }}\r\n    </a>\r\n\r\n    <header class=\"settings-header investa-panel\">\r\n      <p class=\"eyebrow\">{{ 'settings.eyebrow' | translate }}</p>\r\n      <h1>{{ 'settings.title' | translate }}</h1>\r\n      <p>{{ 'settings.subtitle' | translate }}</p>\r\n    </header>\r\n\r\n    <div class=\"settings-workspace\">\r\n      <aside class=\"settings-nav investa-panel\" [attr.aria-label]=\"'settings.navigationLabel' | translate\">\r\n        <nav>\r\n          @for (item of menuItems; track item.id) {\r\n            <button type=\"button\" (click)=\"selectSection(item.id)\" [class.active]=\"activeSection === item.id\">\r\n              <span>{{ item.labelKey | translate }}</span>\r\n              @if (hasUnsavedChanges(item.id)) { <span class=\"unsaved-dot\" aria-hidden=\"true\"></span> }\r\n            </button>\r\n          }\r\n        </nav>\r\n      </aside>\r\n\r\n      <section class=\"settings-panel investa-panel\">\r\n        <header class=\"section-header\">\r\n          <p class=\"eyebrow\">{{ 'settings.sectionEyebrow' | translate }}</p>\r\n          <h2>{{ ('settings.' + activeSection + '.title') | translate }}</h2>\r\n          <p>{{ ('settings.sections.' + activeSection + '.description') | translate }}</p>\r\n        </header>\r\n\r\n        @if (feedbackSection() === activeSection && feedback()) {\r\n          <div class=\"feedback\" [class.feedback-error]=\"feedback() === 'error'\" role=\"status\">\r\n            {{ (feedback() === 'saved' ? 'settings.actions.saved' : 'settings.actions.saveError') | translate }}\r\n          </div>\r\n        }\r\n\r\n        <div class=\"settings-content\">\r\n          @switch (activeSection) {\r\n            @case ('appearance') {\r\n              <div class=\"setting-group\">\r\n                <label>{{ 'settings.appearance.theme.label' | translate }}</label>\r\n                <div class=\"choice-group\">\r\n                  @for (opt of themeOptions; track opt) {\r\n                    <button type=\"button\" class=\"choice-button\" [class.selected]=\"draft().theme === opt\" (click)=\"setTheme(opt)\">\r\n                      {{ ('settings.appearance.theme.options.' + opt) | translate }}\r\n                    </button>\r\n                  }\r\n                </div>\r\n              </div>\r\n            }\r\n            @case ('localization') {\r\n              <div class=\"form-grid\">\r\n                <label class=\"field\">\r\n                  <span>{{ 'settings.localization.language.label' | translate }}</span>\r\n                  <select [value]=\"draft().language\" (change)=\"setLanguageFromEvent($event)\">\r\n                    <option value=\"en\">{{ 'settings.localization.language.options.en' | translate }}</option>\r\n                    <option value=\"ar\">{{ 'settings.localization.language.options.ar' | translate }}</option>\r\n                  </select>\r\n                </label>\r\n                <label class=\"field\">\r\n                  <span>{{ 'settings.localization.currency.label' | translate }}</span>\r\n                  <select [value]=\"draft().currency\" (change)=\"setCurrencyFromEvent($event)\">\r\n                    @for (cur of currencyOptions; track cur.isoCode) {\n                      <option [value]=\"cur.isoCode\">{{ currencyLabel(cur) }}</option>\n                    }\n                  </select>\r\n                </label>\r\n              </div>\r\n            }\r\n            @case ('notifications') {\r\n              <div class=\"toggle-list\">\r\n                <label class=\"toggle-row\"><span>{{ 'settings.notifications.email' | translate }}</span><span class=\"switch-control\"><input type=\"checkbox\" [checked]=\"draft().notifications.email\" (change)=\"setNotificationFromEvent('email', $event)\"><span class=\"switch-track\"><span></span></span></span></label>\r\n                <label class=\"toggle-row\"><span>{{ 'settings.notifications.sms' | translate }}</span><span class=\"switch-control\"><input type=\"checkbox\" [checked]=\"draft().notifications.sms\" (change)=\"setNotificationFromEvent('sms', $event)\"><span class=\"switch-track\"><span></span></span></span></label>\r\n              </div>\r\n\r\n              <hr class=\"settings-divider\">\r\n\r\n              <div class=\"setting-group\">\r\n                <label>{{ 'settings.notifications.browserPush' | translate }}</label>\r\n                <p class=\"setting-hint\">{{ 'settings.notifications.browserPushHint' | translate }}</p>\r\n                <div class=\"fcm-status\">\r\n                  @if (!fcmEnabled() && !fcmService.permissionGranted) {\r\n                    <span class=\"fcm-permission-badge fcm-denied\">\r\n                      {{ 'settings.notifications.permissionNotGranted' | translate }}\r\n                    </span>\r\n                  } @else if (fcmService.permissionGranted && !fcmEnabled()) {\r\n                    <span class=\"fcm-permission-badge fcm-granted\">\r\n                      {{ 'settings.notifications.permissionGranted' | translate }}\r\n                    </span>\r\n                  } @else if (fcmEnabled()) {\r\n                    <span class=\"fcm-permission-badge fcm-active\">\r\n                      {{ 'settings.notifications.pushActive' | translate }}\r\n                    </span>\r\n                  }\r\n                </div>\r\n\r\n                @if (!fcmEnabled()) {\r\n                  <button type=\"button\" class=\"primary-button\" [disabled]=\"fcmLoading()\" (click)=\"enableFcm()\">\r\n                    {{ (fcmLoading() ? 'settings.notifications.enabling' : 'settings.notifications.enablePush') | translate }}\r\n                  </button>\r\n                } @else {\r\n                  <button type=\"button\" class=\"secondary-button\" [disabled]=\"fcmLoading()\" (click)=\"disableFcm()\">\r\n                    {{ (fcmLoading() ? 'settings.notifications.disabling' : 'settings.notifications.disablePush') | translate }}\r\n                  </button>\r\n                }\r\n              </div>\r\n\r\n              @if (fcmDevices().length > 0) {\r\n                <div class=\"device-list\">\r\n                  <label>{{ 'settings.notifications.registeredDevices' | translate }}</label>\r\n                  @for (device of fcmDevices(); track device.id) {\r\n                    <div class=\"device-row\">\r\n                      <span class=\"device-info\">\r\n                        <strong>{{ device.browser || 'Browser' }}</strong>\r\n                        @if (device.platform) { <span>{{ device.platform }}</span> }\r\n                        @if (device.lastUsedAt) { <small>{{ 'settings.notifications.lastUsed' | translate }}: {{ device.lastUsedAt }}</small> }\r\n                      </span>\r\n                      @if (device.isActive) {\r\n                        <button type=\"button\" class=\"small-button\" [disabled]=\"fcmLoading()\" (click)=\"deactivateDevice(device.id)\">\r\n                          {{ 'settings.notifications.disableDevice' | translate }}\r\n                        </button>\r\n                      } @else {\r\n                        <span class=\"inactive-badge\">{{ 'settings.notifications.inactive' | translate }}</span>\r\n                      }\r\n                    </div>\r\n                  }\r\n                </div>\r\n              }\r\n            }\r\n            @case ('privacy') {\r\n              <div class=\"toggle-list\">\r\n                <label class=\"toggle-row\"><span>{{ 'settings.privacy.showPublicProfile' | translate }}</span><span class=\"switch-control\"><input type=\"checkbox\" [checked]=\"draft().privacy.showPublicProfile\" (change)=\"setPrivacyFromEvent('showPublicProfile', $event)\"><span class=\"switch-track\"><span></span></span></span></label>\r\n                <label class=\"toggle-row\"><span>{{ 'settings.privacy.sharePortfolioPerformance' | translate }}</span><span class=\"switch-control\"><input type=\"checkbox\" [checked]=\"draft().privacy.sharePortfolioPerformance\" (change)=\"setPrivacyFromEvent('sharePortfolioPerformance', $event)\"><span class=\"switch-track\"><span></span></span></span></label>\r\n              </div>\r\n            }\r\n            @case ('personalization') {\r\n              <div class=\"form-grid\">\r\n                <div class=\"setting-group\">\r\n                  <label>{{ 'settings.personalization.dashboardDensity.label' | translate }}</label>\r\n                  <div class=\"choice-group\">\r\n                    @for (opt of densityOptions; track opt) {\r\n                      <button type=\"button\" class=\"choice-button\" [class.selected]=\"draft().personalization.dashboardDensity === opt\" (click)=\"setPersonalization({ dashboardDensity: opt })\">{{ ('settings.personalization.dashboardDensity.options.' + opt) | translate }}</button>\r\n                    }\r\n                  </div>\r\n                </div>\r\n                <div class=\"setting-group\">\r\n                  <label>{{ 'settings.personalization.defaultInvestmentType.label' | translate }}</label>\r\n                  <div class=\"choice-group\">\r\n                    @for (opt of investmentTypeOptions; track opt) {\r\n                      <button type=\"button\" class=\"choice-button\" [class.selected]=\"draft().personalization.defaultInvestmentType === opt\" (click)=\"setPersonalization({ defaultInvestmentType: opt })\">{{ ('settings.personalization.defaultInvestmentType.options.' + opt) | translate }}</button>\r\n                    }\r\n                  </div>\r\n                </div>\r\n              </div>\r\n              <label class=\"toggle-row standalone-toggle\"><span>{{ 'settings.personalization.showRiskIndicators' | translate }}</span><span class=\"switch-control\"><input type=\"checkbox\" [checked]=\"draft().personalization.showRiskIndicators\" (change)=\"setRiskIndicatorsFromEvent($event)\"><span class=\"switch-track\"><span></span></span></span></label>\r\n            }\r\n            @case ('support') {\r\n              <div class=\"toggle-list\">\r\n                <label class=\"toggle-row\"><span>{{ 'settings.support.available' | translate }}</span><span class=\"switch-control\"><input type=\"checkbox\" [checked]=\"draft().support.available\" (change)=\"setSupportAvailabilityFromEvent($event)\"><span class=\"switch-track\"><span></span></span></span></label>\r\n              </div>\r\n              <label class=\"field spaced-field\">\r\n                <span>{{ 'settings.support.hours' | translate }}</span>\r\n                <input type=\"text\" [value]=\"draft().support.hours ?? ''\" (input)=\"setSupportHoursFromEvent($event)\" [placeholder]=\"'settings.placeholders.supportHours' | translate\">\r\n              </label>\r\n            }\r\n            @case ('security') {\r\n              <label class=\"field compact-field\">\r\n                <span>{{ 'settings.security.sessionTimeout.label' | translate }}</span>\r\n                <span class=\"number-field\"><input type=\"number\" min=\"1\" inputmode=\"numeric\" dir=\"ltr\" [value]=\"draft().sessionTimeoutMinutes ?? ''\" (input)=\"setSessionTimeoutFromEvent($event)\"><span>{{ 'settings.security.sessionTimeout.minutes' | translate }}</span></span>\r\n                <small>{{ 'settings.security.sessionTimeout.help' | translate }}</small>\r\n              </label>\r\n            }\r\n            @case ('wallet') {\r\n              @if (creditLoading()) {\r\n                <div class=\"credit-state\" role=\"status\">{{ 'settings.wallet.loading' | translate }}</div>\r\n              } @else if (creditError()) {\r\n                <div class=\"credit-state credit-error\">\r\n                  <span>{{ 'settings.wallet.loadError' | translate }}</span>\r\n                  <button type=\"button\" class=\"secondary-button\" (click)=\"retryCreditBalance()\">{{ 'settings.actions.retry' | translate }}</button>\r\n                </div>\r\n              } @else {\r\n                <div class=\"credit-summary\">\r\n                  <span>{{ 'settings.wallet.availableCredit' | translate }}</span>\r\n                  <strong dir=\"ltr\">{{ platformCreditBalance() | number:'1.0-2':'en-US' }}</strong>\r\n                </div>\r\n              }\r\n              <div class=\"wallet-actions\">\r\n                <a routerLink=\"/admin/profile/wallet\" class=\"secondary-button\">{{ 'profile.viewWallet' | translate }}</a>\r\n                <a routerLink=\"/admin/credit-charge\" class=\"primary-button\">{{ 'profile.credits.chargeNow' | translate }}</a>\r\n              </div>\r\n            }\r\n          }\r\n        </div>\r\n\r\n        @if (showSaveAction()) {\r\n          <footer class=\"section-actions\">\r\n            <span [class.unsaved-label]=\"hasUnsavedChanges(activeSection)\">{{ (hasUnsavedChanges(activeSection) ? 'settings.actions.unsaved' : 'settings.actions.upToDate') | translate }}</span>\r\n            <button type=\"button\" class=\"primary-button\" [disabled]=\"!hasUnsavedChanges(activeSection)\" (click)=\"saveActiveSection()\">{{ 'settings.actions.save' | translate }}</button>\r\n          </footer>\r\n        }\r\n      </section>\r\n    </div>\r\n  </div>\r\n</main>\r\n", styles: [":host {\r\n  --settings-page: var(--investa-bg, #f4f5f2);\r\n  --settings-surface: var(--investa-surface, #ffffff);\r\n  --settings-soft: var(--investa-surface-soft, #f7f8f6);\r\n  --settings-border: var(--investa-border, #dfe3dd);\r\n  --settings-text: var(--investa-text, #202522);\r\n  --settings-muted: var(--investa-text-muted, #69716c);\r\n  --settings-charcoal: #242925;\r\n  --settings-green: #168447;\r\n  --settings-green-soft: #e8f5ec;\r\n  --settings-danger: #b42318;\r\n  display: block;\r\n  color: var(--settings-text);\r\n}\r\n\r\n:host-context(body.investa-theme-dark),\r\n:host-context(.dark) {\r\n  --settings-page: var(--investa-bg, #101310);\r\n  --settings-surface: var(--investa-surface, #191d1a);\r\n  --settings-soft: var(--investa-surface-soft, #202521);\r\n  --settings-border: var(--investa-border, #343a35);\r\n  --settings-text: var(--investa-text, #f3f5f3);\r\n  --settings-muted: var(--investa-text-muted, #aab1ac);\r\n  --settings-charcoal: #f3f5f3;\r\n  --settings-green: #4fc578;\r\n  --settings-green-soft: rgba(42, 154, 83, .16);\r\n  --settings-danger: #ff8a80;\r\n}\r\n\r\n* { box-sizing: border-box; }\r\n\r\n.settings-page {\r\n  min-height: 100%;\r\n  padding: 24px;\r\n  background: var(--settings-page);\r\n}\r\n\r\n.settings-shell { width: min(1180px, 100%); margin-inline: auto; }\r\n\r\n.back-link {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 7px;\r\n  margin-block-end: 12px;\r\n  color: var(--settings-muted);\r\n  font-size: .84rem;\r\n  font-weight: 650;\r\n  text-decoration: none;\r\n}\r\n\r\n.back-link:hover { color: var(--settings-green); }\r\n.back-link svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; }\r\n:host-context([dir='rtl']) .back-link svg { transform: rotate(180deg); }\r\n\r\n.settings-header { padding: 20px 22px; }\r\n.eyebrow { margin: 0 0 5px; color: var(--settings-green); font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\r\n.settings-header h1, .section-header h2 { margin: 0; color: var(--settings-text); font-weight: 760; letter-spacing: -.02em; }\r\n.settings-header h1 { font-size: clamp(1.35rem, 2.4vw, 1.75rem); }\r\n.settings-header > p:last-child, .section-header > p:last-child { margin: 6px 0 0; color: var(--settings-muted); font-size: .88rem; line-height: 1.55; }\r\n\r\n.settings-workspace { display: grid; grid-template-columns: 215px minmax(0, 1fr); gap: 14px; margin-block-start: 14px; align-items: start; }\r\n.settings-nav { position: sticky; top: 16px; padding: 6px; }\r\n.settings-nav nav { display: grid; gap: 3px; }\r\n.settings-nav button {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 8px;\r\n  min-height: 40px;\r\n  padding: 9px 11px;\r\n  border: 1px solid transparent;\r\n  border-radius: 10px;\r\n  background: transparent;\r\n  color: var(--settings-muted);\r\n  font: inherit;\r\n  font-size: .84rem;\r\n  font-weight: 650;\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.settings-nav button:hover { background: var(--settings-soft); color: var(--settings-text); }\r\n.settings-nav button.active { border-color: color-mix(in srgb, var(--settings-green) 28%, transparent); background: var(--settings-green-soft); color: var(--settings-green); }\r\n.unsaved-dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: var(--settings-green); }\r\n\r\n.settings-panel { min-width: 0; overflow: hidden; }\r\n.section-header { padding: 19px 21px 17px; border-block-end: 1px solid var(--settings-border); }\r\n.section-header h2 { font-size: 1.12rem; }\r\n.settings-content { min-height: 235px; padding: 20px 21px; }\r\n\r\n.feedback { margin: 14px 21px 0; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--settings-green) 32%, transparent); border-radius: 10px; background: var(--settings-green-soft); color: var(--settings-green); font-size: .82rem; font-weight: 700; }\r\n.feedback-error { border-color: color-mix(in srgb, var(--settings-danger) 32%, transparent); background: color-mix(in srgb, var(--settings-danger) 8%, transparent); color: var(--settings-danger); }\r\n\r\n.setting-group > label, .field > span:first-child { display: block; margin-block-end: 8px; color: var(--settings-text); font-size: .79rem; font-weight: 720; }\r\n.choice-group { display: flex; flex-wrap: wrap; gap: 7px; }\r\n.choice-button, .secondary-button, .primary-button {\r\n  min-height: 38px;\r\n  padding: 8px 13px;\r\n  border-radius: 10px;\r\n  font: inherit;\r\n  font-size: .8rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n}\r\n.choice-button, .secondary-button { border: 1px solid var(--settings-border); background: var(--settings-soft); color: var(--settings-text); }\r\n.choice-button:hover, .secondary-button:hover { border-color: color-mix(in srgb, var(--settings-green) 50%, var(--settings-border)); }\r\n.choice-button.selected { border-color: var(--settings-green); background: var(--settings-green-soft); color: var(--settings-green); }\r\n.primary-button { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--settings-charcoal); background: var(--settings-charcoal); color: var(--settings-surface); }\r\n.primary-button:hover:not(:disabled) { opacity: .88; }\r\n.primary-button:disabled { opacity: .42; cursor: not-allowed; }\r\n\r\n.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }\r\n.field { display: block; }\r\n.field input, .field select {\r\n  width: 100%;\r\n  min-height: 40px;\r\n  padding: 8px 11px;\r\n  border: 1px solid var(--settings-border);\r\n  border-radius: 10px;\r\n  outline: none;\r\n  background: var(--settings-soft);\r\n  color: var(--settings-text);\r\n  font: inherit;\r\n  font-size: .84rem;\r\n}\r\n.field input:focus, .field select:focus, button:focus-visible, a:focus-visible { outline: 3px solid color-mix(in srgb, var(--settings-green) 22%, transparent); outline-offset: 2px; border-color: var(--settings-green); }\r\n.field small { display: block; margin-block-start: 7px; color: var(--settings-muted); font-size: .76rem; line-height: 1.45; }\r\n.spaced-field { max-width: 520px; margin-block-start: 16px; }\r\n.compact-field { max-width: 560px; }\r\n.number-field { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; }\r\n.number-field > span { color: var(--settings-muted); font-size: .8rem; }\r\n\r\n.toggle-list { display: grid; gap: 9px; }\r\n.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 50px; padding: 10px 12px; border: 1px solid var(--settings-border); border-radius: 12px; background: var(--settings-soft); color: var(--settings-text); font-size: .84rem; font-weight: 650; cursor: pointer; }\r\n.standalone-toggle { margin-block-start: 16px; }\r\n.switch-control { position: relative; display: inline-flex; flex: 0 0 auto; }\r\n.switch-control input { position: absolute; width: 1px; height: 1px; opacity: 0; }\r\n.switch-track { position: relative; width: 42px; height: 24px; border: 1px solid var(--settings-border); border-radius: 999px; background: color-mix(in srgb, var(--settings-muted) 25%, var(--settings-surface)); transition: .18s ease; }\r\n.switch-track > span { position: absolute; inset-block-start: 2px; inset-inline-start: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.22); transition: inset-inline-start .18s ease; }\r\n.switch-control input:checked + .switch-track { border-color: var(--settings-green); background: var(--settings-green); }\r\n.switch-control input:checked + .switch-track > span { inset-inline-start: 20px; }\r\n.switch-control input:focus-visible + .switch-track { outline: 3px solid color-mix(in srgb, var(--settings-green) 22%, transparent); outline-offset: 2px; }\r\n\r\n.section-actions { display: flex; align-items: center; justify-content: flex-end; gap: 14px; min-height: 66px; padding: 12px 21px; border-block-start: 1px solid var(--settings-border); background: var(--settings-soft); }\r\n.section-actions > span { color: var(--settings-muted); font-size: .76rem; }\r\n.section-actions .unsaved-label { color: var(--settings-green); font-weight: 700; }\r\n\r\n.credit-summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; border: 1px solid var(--settings-border); border-radius: 14px; background: var(--settings-soft); }\r\n.credit-summary span { color: var(--settings-muted); font-size: .82rem; }\r\n.credit-summary strong { color: var(--settings-text); font-size: 1.3rem; }\r\n.credit-state { padding: 16px; border: 1px solid var(--settings-border); border-radius: 14px; background: var(--settings-soft); color: var(--settings-muted); font-size: .84rem; }\r\n.credit-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--settings-danger); }\r\n.wallet-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-block-start: 14px; }\r\n\r\n@media (max-width: 780px) {\r\n  .settings-page { padding: 16px; }\r\n  .settings-workspace { display: block; }\r\n  .settings-nav { position: static; margin-block-end: 12px; overflow: hidden; }\r\n  .settings-nav nav { display: flex; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-width: thin; }\r\n  .settings-nav button { flex: 0 0 auto; white-space: nowrap; }\r\n}\r\n\r\n@media (max-width: 560px) {\r\n  .settings-page { padding: 12px; }\r\n  .settings-header, .section-header, .settings-content { padding-inline: 15px; }\r\n  .form-grid { grid-template-columns: 1fr; }\r\n  .section-actions { padding-inline: 15px; }\r\n  .credit-summary, .credit-error { align-items: flex-start; flex-direction: column; }\r\n  .wallet-actions > * { flex: 1 1 auto; }\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SettingsComponent, { className: "SettingsComponent", filePath: "src/app/pages/admin/settings/settings.component.ts", lineNumber: 20 }); })();
