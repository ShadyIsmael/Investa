import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SettingsService } from '../../../services/settings.service';
import { CurrencyPreference, DashboardDensity, DefaultInvestmentTypePreference, ThemePreference } from '../../../models/settings.model';
import { LanguageService } from '../../../services/language.service';
import { WalletService } from '../../../services/wallet.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _forTrack0 = ($index, $item) => $item.id;
function SettingsComponent_For_17_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵlistener("click", function SettingsComponent_For_17_Template_button_click_0_listener() { const item_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.selectSection(item_r2.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-blue-500/20", ctx_r2.activeSection === item_r2.id)("border-blue-500", ctx_r2.activeSection === item_r2.id)("text-blue-300", ctx_r2.activeSection === item_r2.id)("bg-slate-700/50", ctx_r2.activeSection !== item_r2.id)("border-slate-600", ctx_r2.activeSection !== item_r2.id)("text-gray-300", ctx_r2.activeSection !== item_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 13, item_r2.labelKey), " ");
} }
function SettingsComponent_Case_19_For_10_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function SettingsComponent_Case_19_For_10_Template_button_click_0_listener() { const opt_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setTheme(opt_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("bg-blue-500/20", ctx_r2.settings().theme === opt_r5)("border-blue-500", ctx_r2.settings().theme === opt_r5)("text-blue-300", ctx_r2.settings().theme === opt_r5)("bg-slate-700/50", ctx_r2.settings().theme !== opt_r5)("border-slate-600", ctx_r2.settings().theme !== opt_r5)("text-gray-300", ctx_r2.settings().theme !== opt_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 13, "settings.appearance.theme.options." + opt_r5), " ");
} }
function SettingsComponent_Case_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 15)(5, "label", 16);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 17);
    i0.ɵɵrepeaterCreate(9, SettingsComponent_Case_19_For_10_Template, 3, 15, "button", 18, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "settings.appearance.title"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 4, "settings.appearance.theme.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.themeOptions);
} }
function SettingsComponent_Case_20_For_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cur_r7 = ctx.$implicit;
    i0.ɵɵproperty("value", cur_r7);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "settings.localization.currency.options." + cur_r7));
} }
function SettingsComponent_Case_20_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 20)(5, "div")(6, "label", 16);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "select", 21);
    i0.ɵɵlistener("change", function SettingsComponent_Case_20_Template_select_change_9_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setLanguage($event.target.value)); });
    i0.ɵɵelementStart(10, "option", 22);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 23);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "div")(17, "label", 16);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "select", 21);
    i0.ɵɵlistener("change", function SettingsComponent_Case_20_Template_select_change_20_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setCurrency($event.target.value)); });
    i0.ɵɵrepeaterCreate(21, SettingsComponent_Case_20_For_22_Template, 3, 4, "option", 24, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, "settings.localization.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 9, "settings.localization.language.label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.languageService.language());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 11, "settings.localization.language.options.en"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 13, "settings.localization.language.options.ar"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 15, "settings.localization.currency.label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.settings().currency);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.currencyOptions);
} }
function SettingsComponent_Case_21_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 25)(5, "label", 26)(6, "span", 27);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 28)(10, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_21_Template_input_change_10_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleNotifications("email", $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(11, "div", 30)(12, "div", 31);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "label", 26)(14, "span", 27);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 28)(18, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_21_Template_input_change_18_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleNotifications("push", $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(19, "div", 30)(20, "div", 31);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "label", 26)(22, "span", 27);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 28)(26, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_21_Template_input_change_26_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleNotifications("sms", $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(27, "div", 30)(28, "div", 31);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, "settings.notifications.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 9, "settings.notifications.email"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.settings().notifications.email);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 11, "settings.notifications.push"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.settings().notifications.push);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 13, "settings.notifications.sms"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.settings().notifications.sms);
} }
function SettingsComponent_Case_22_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 25)(5, "label", 26)(6, "span", 27);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 28)(10, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_22_Template_input_change_10_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.togglePrivacy("showPublicProfile", $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(11, "div", 30)(12, "div", 31);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "label", 26)(14, "span", 27);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 28)(18, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_22_Template_input_change_18_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.togglePrivacy("sharePortfolioPerformance", $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(19, "div", 30)(20, "div", 31);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "settings.privacy.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "settings.privacy.showPublicProfile"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.settings().privacy.showPublicProfile);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 9, "settings.privacy.sharePortfolioPerformance"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.settings().privacy.sharePortfolioPerformance);
} }
function SettingsComponent_Case_23_For_11_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function SettingsComponent_Case_23_For_11_Template_button_click_0_listener() { const opt_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setPersonalization({ dashboardDensity: opt_r12 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r12 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("bg-blue-500/20", ctx_r2.settings().personalization.dashboardDensity === opt_r12)("border-blue-500", ctx_r2.settings().personalization.dashboardDensity === opt_r12)("text-blue-300", ctx_r2.settings().personalization.dashboardDensity === opt_r12)("bg-slate-700/50", ctx_r2.settings().personalization.dashboardDensity !== opt_r12)("border-slate-600", ctx_r2.settings().personalization.dashboardDensity !== opt_r12)("text-gray-300", ctx_r2.settings().personalization.dashboardDensity !== opt_r12);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 13, "settings.personalization.dashboardDensity.options." + opt_r12), " ");
} }
function SettingsComponent_Case_23_For_18_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function SettingsComponent_Case_23_For_18_Template_button_click_0_listener() { const opt_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setPersonalization({ defaultInvestmentType: opt_r14 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r14 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("bg-blue-500/20", ctx_r2.settings().personalization.defaultInvestmentType === opt_r14)("border-blue-500", ctx_r2.settings().personalization.defaultInvestmentType === opt_r14)("text-blue-300", ctx_r2.settings().personalization.defaultInvestmentType === opt_r14)("bg-slate-700/50", ctx_r2.settings().personalization.defaultInvestmentType !== opt_r14)("border-slate-600", ctx_r2.settings().personalization.defaultInvestmentType !== opt_r14)("text-gray-300", ctx_r2.settings().personalization.defaultInvestmentType !== opt_r14);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 13, "settings.personalization.defaultInvestmentType.options." + opt_r14), " ");
} }
function SettingsComponent_Case_23_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 20)(5, "div")(6, "label", 16);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 17);
    i0.ɵɵrepeaterCreate(10, SettingsComponent_Case_23_For_11_Template, 3, 15, "button", 18, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div")(13, "label", 16);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 17);
    i0.ɵɵrepeaterCreate(17, SettingsComponent_Case_23_For_18_Template, 3, 15, "button", 18, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 32)(20, "label", 26)(21, "span", 27);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "div", 28)(25, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_23_Template_input_change_25_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setPersonalization({ showRiskIndicators: $event.target.checked })); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(26, "div", 30)(27, "div", 31);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "settings.personalization.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "settings.personalization.dashboardDensity.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.densityOptions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 9, "settings.personalization.defaultInvestmentType.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.investmentTypeOptions);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 11, "settings.personalization.showRiskIndicators"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r2.settings().personalization.showRiskIndicators);
} }
function SettingsComponent_Case_24_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 33)(5, "label", 26)(6, "span", 27);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 28)(10, "input", 29);
    i0.ɵɵlistener("change", function SettingsComponent_Case_24_Template_input_change_10_listener($event) { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setSupportAvailability($event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(11, "div", 30)(12, "div", 31);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div")(14, "label", 16);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "input", 34);
    i0.ɵɵlistener("change", function SettingsComponent_Case_24_Template_input_change_17_listener($event) { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setSupportHours($event.target.value)); });
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    let tmp_3_0;
    let tmp_5_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "settings.support.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "settings.support.available"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", (tmp_3_0 = ctx_r2.settings().support) == null ? null : tmp_3_0.available);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 9, "settings.support.hours"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ((tmp_5_0 = ctx_r2.settings().support) == null ? null : tmp_5_0.hours) || "");
} }
function SettingsComponent_Case_25_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div")(5, "label", 16);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 35)(9, "input", 36);
    i0.ɵɵlistener("change", function SettingsComponent_Case_25_Template_input_change_9_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setSessionTimeoutMinutes($event.target.value)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span", 37);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "p", 38);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "settings.security.title"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 7, "settings.security.sessionTimeout.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r2.settings().sessionTimeoutMinutes || 30);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 9, "settings.security.sessionTimeout.minutes"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 11, "settings.security.sessionTimeout.help"));
} }
function SettingsComponent_Case_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12)(1, "h2", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 33)(5, "div", 39)(6, "span", 40);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 41);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 42)(13, "a", 43);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "a", 44);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "settings.wallet.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(8, 7, "settings.wallet.balance"), ":");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(11, 9, ctx_r2.platformCreditBalance(), "1.0-2", "en-US"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 13, "profile.viewWallet"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 15, "profile.credits.chargeNow"));
} }
export class SettingsComponent {
    constructor() {
        this.settingsService = inject(SettingsService);
        this.walletService = inject(WalletService);
        this.languageService = inject(LanguageService);
        this.platformCreditBalance = this.walletService.balance;
        this.ThemePreference = ThemePreference;
        this.DashboardDensity = DashboardDensity;
        this.DefaultInvestmentTypePreference = DefaultInvestmentTypePreference;
        this.CurrencyPreference = CurrencyPreference;
        this.settings = this.settingsService.settings;
        this.themeOptions = [ThemePreference.System, ThemePreference.Light, ThemePreference.Dark];
        this.densityOptions = [DashboardDensity.Comfortable, DashboardDensity.Compact];
        this.investmentTypeOptions = [DefaultInvestmentTypePreference.Any, DefaultInvestmentTypePreference.Founding, DefaultInvestmentTypePreference.Equity];
        this.currencyOptions = [CurrencyPreference.USD, CurrencyPreference.EUR, CurrencyPreference.SAR];
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
        void this.walletService.loadBalance().catch(() => this.walletService.setBalance(0));
    }
    setTheme(theme) {
        this.settingsService.setTheme(theme);
    }
    setLanguage(lang) {
        // Update LanguageService as well to apply immediately
        if (lang !== 'en' && lang !== 'ar')
            return;
        this.languageService.setLanguage(lang);
        this.settingsService.setLanguage(lang);
    }
    setCurrency(cur) {
        if (this.currencyOptions.includes(cur))
            this.settingsService.setCurrency(cur);
    }
    toggleNotifications(key, value) {
        const n = { ...this.settings().notifications, [key]: value };
        this.settingsService.setNotifications(n);
    }
    togglePrivacy(key, value) {
        const p = { ...this.settings().privacy, [key]: value };
        this.settingsService.setPrivacy(p);
    }
    setPersonalization(partial) {
        const pers = { ...this.settings().personalization, ...partial };
        this.settingsService.setPersonalization(pers);
    }
    selectSection(id) {
        this.activeSection = id;
    }
    setSupportAvailability(val) {
        const s = { ...this.settings().support, available: val };
        this.settingsService.setSupport(s);
    }
    setSupportHours(val) {
        const s = { ...this.settings().support, hours: val };
        this.settingsService.setSupport(s);
    }
    // Session timeout (admin configurable)
    setSessionTimeoutMinutes(val) {
        const v = parseInt(val, 10);
        if (!isNaN(v) && isFinite(v) && v > 0) {
            this.settingsService.setSessionTimeout(v);
        }
        else {
            // clear to default
            this.settingsService.setSessionTimeout(null);
        }
    }
    static { this.ɵfac = function SettingsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SettingsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SettingsComponent, selectors: [["app-settings"]], decls: 27, vars: 10, consts: [[1, "container", "mx-auto", "px-4", "py-6"], [1, "mb-6"], ["routerLink", "/admin/dashboard", 1, "flex", "items-center", "gap-2", "text-gray-400", "hover:text-white", "transition-colors"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "rtl:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "text-2xl", "font-bold", "text-white", "mb-2"], [1, "text-gray-300", "mb-6", "text-sm"], [1, "grid", "grid-cols-1", "lg:grid-cols-[240px_1fr]", "gap-5"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-xl", "p-4"], [1, "space-y-1"], ["type", "button", 1, "w-full", "text-left", "px-3", "py-2", "rounded-md", "border", "transition-colors", 3, "bg-blue-500/20", "border-blue-500", "text-blue-300", "bg-slate-700/50", "border-slate-600", "text-gray-300"], [1, "space-y-6"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-xl", "p-5"], ["type", "button", 1, "w-full", "text-left", "px-3", "py-2", "rounded-md", "border", "transition-colors", 3, "click"], [1, "text-lg", "font-semibold", "text-white", "mb-3"], [1, "mb-4"], [1, "block", "text-sm", "font-medium", "text-gray-300", "mb-2"], [1, "flex", "flex-wrap", "gap-2"], ["type", "button", 1, "px-4", "py-2", "rounded-md", "border", "transition-colors", 3, "bg-blue-500/20", "border-blue-500", "text-blue-300", "bg-slate-700/50", "border-slate-600", "text-gray-300"], ["type", "button", 1, "px-4", "py-2", "rounded-md", "border", "transition-colors", 3, "click"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-4"], [1, "w-full", "bg-slate-900", "border", "border-slate-700", "rounded-md", "p-2", "text-gray-200", 3, "change", "value"], ["value", "en"], ["value", "ar"], [3, "value"], [1, "space-y-3"], [1, "flex", "items-center", "justify-between", "gap-4", "cursor-pointer", "group", "py-1"], [1, "text-sm", "text-gray-300", "group-hover:text-white", "transition-colors"], [1, "relative", "flex-shrink-0"], ["type", "checkbox", 1, "sr-only", "peer", 3, "change", "checked"], [1, "w-11", "h-6", "bg-slate-700", "peer-checked:bg-blue-600", "rounded-full", "transition-colors", "border", "border-slate-600", "peer-checked:border-blue-500"], [1, "absolute", "left-0.5", "top-0.5", "w-5", "h-5", "bg-white", "rounded-full", "transition-transform", "peer-checked:translate-x-5", "shadow-sm"], [1, "md:col-span-2"], [1, "space-y-4"], ["type", "text", "placeholder", "e.g. 9:00-17:00", 1, "w-full", "bg-slate-900", "border", "border-slate-700", "rounded-md", "p-2", "text-gray-200", 3, "change", "value"], [1, "grid", "grid-cols-[1fr_auto]", "gap-3", "items-center"], ["type", "number", "min", "1", 1, "w-full", "bg-slate-900", "border", "border-slate-700", "rounded-md", "p-2", "text-gray-200", 3, "change", "value"], [1, "text-gray-300", "pl-2"], [1, "text-sm", "text-gray-400", "mt-2"], [1, "text-gray-300"], [1, "font-medium"], [1, "ml-2"], [1, "flex", "flex-wrap", "gap-3"], ["routerLink", "/admin/profile/wallet", 1, "px-4", "py-2", "rounded-md", "border", "border-slate-600", "text-gray-200", "transition-colors"], ["routerLink", "/admin/credit-charge", 1, "px-4", "py-2", "rounded-md", "bg-slate-900", "text-white", "transition-colors"]], template: function SettingsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(3, "svg", 3);
            i0.ɵɵelement(4, "path", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(7, "h1", 5);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "p", 6);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 7)(14, "aside", 8)(15, "nav", 9);
            i0.ɵɵrepeaterCreate(16, SettingsComponent_For_17_Template, 3, 15, "button", 10, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "section", 11);
            i0.ɵɵconditionalCreate(19, SettingsComponent_Case_19_Template, 11, 6, "div", 12)(20, SettingsComponent_Case_20_Template, 23, 17, "div", 12)(21, SettingsComponent_Case_21_Template, 29, 15, "div", 12)(22, SettingsComponent_Case_22_Template, 21, 11, "div", 12)(23, SettingsComponent_Case_23_Template, 28, 13, "div", 12)(24, SettingsComponent_Case_24_Template, 18, 11, "div", 12)(25, SettingsComponent_Case_25_Template, 16, 13, "div", 12)(26, SettingsComponent_Case_26_Template, 19, 17, "div", 12);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "settings.backToDashboard"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 6, "settings.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "settings.subtitle"));
            i0.ɵɵadvance(5);
            i0.ɵɵrepeater(ctx.menuItems);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_4_0 = ctx.activeSection) === "appearance" ? 19 : tmp_4_0 === "localization" ? 20 : tmp_4_0 === "notifications" ? 21 : tmp_4_0 === "privacy" ? 22 : tmp_4_0 === "personalization" ? 23 : tmp_4_0 === "support" ? 24 : tmp_4_0 === "security" ? 25 : tmp_4_0 === "wallet" ? 26 : -1);
        } }, dependencies: [CommonModule, RouterLink, i1.DecimalPipe, TranslatePipe], styles: ["@use 'variables' as *;\r\n\r\n.settings-section[_ngcontent-%COMP%] {\r\n  @media (min-width: 1024px) {\r\n    .grid { grid-template-columns: 1fr 1fr; }\r\n  }\r\n}\r\n\r\n.option-active[_ngcontent-%COMP%] {\r\n  background-color: rgba(59, 130, 246, 0.2);\r\n  border-color: rgba(59, 130, 246, 0.6);\r\n  color: rgb(191, 219, 254);\r\n}\r\n\r\n.option-inactive[_ngcontent-%COMP%] {\r\n  background-color: rgba(51, 65, 85, 0.5);\r\n  border-color: rgba(71, 85, 105, 0.7);\r\n  color: rgb(203, 213, 225);\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SettingsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-settings', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterLink, TranslatePipe], template: "<div class=\"container mx-auto px-4 py-6\">\r\n  <div class=\"mb-6\">\r\n    <a routerLink=\"/admin/dashboard\" class=\"flex items-center gap-2 text-gray-400 hover:text-white transition-colors\">\r\n      <svg class=\"w-5 h-5 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"></path></svg>\r\n      {{ 'settings.backToDashboard' | translate }}\r\n    </a>\r\n  </div>\r\n\r\n  <h1 class=\"text-2xl font-bold text-white mb-2\">{{ 'settings.title' | translate }}</h1>\r\n  <p class=\"text-gray-300 mb-6 text-sm\">{{ 'settings.subtitle' | translate }}</p>\r\n\r\n  <div class=\"grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5\">\r\n    <!-- Sidebar -->\r\n    <aside class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-4\">\r\n      <nav class=\"space-y-1\">\r\n        @for (item of menuItems; track item.id) {\r\n          <button type=\"button\" (click)=\"selectSection(item.id)\"\r\n            class=\"w-full text-left px-3 py-2 rounded-md border transition-colors\"\r\n            [class.bg-blue-500/20]=\"activeSection === item.id\"\r\n            [class.border-blue-500]=\"activeSection === item.id\"\r\n            [class.text-blue-300]=\"activeSection === item.id\"\r\n            [class.bg-slate-700/50]=\"activeSection !== item.id\"\r\n            [class.border-slate-600]=\"activeSection !== item.id\"\r\n            [class.text-gray-300]=\"activeSection !== item.id\">\r\n            {{ item.labelKey | translate }}\r\n          </button>\r\n        }\r\n      </nav>\r\n    </aside>\r\n\r\n    <!-- Content -->\r\n    <section class=\"space-y-6\">\r\n      @switch (activeSection) {\r\n        @case ('appearance') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.appearance.title' | translate }}</h2>\r\n            <div class=\"mb-4\">\r\n              <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.appearance.theme.label' | translate }}</label>\r\n              <div class=\"flex flex-wrap gap-2\">\r\n                @for (opt of themeOptions; track opt) {\r\n                  <button type=\"button\" (click)=\"setTheme(opt)\"\r\n                    class=\"px-4 py-2 rounded-md border transition-colors\"\r\n                    [class.bg-blue-500/20]=\"settings().theme === opt\"\r\n                    [class.border-blue-500]=\"settings().theme === opt\"\r\n                    [class.text-blue-300]=\"settings().theme === opt\"\r\n                    [class.bg-slate-700/50]=\"settings().theme !== opt\"\r\n                    [class.border-slate-600]=\"settings().theme !== opt\"\r\n                    [class.text-gray-300]=\"settings().theme !== opt\">\r\n                    {{ ('settings.appearance.theme.options.' + opt) | translate }}\r\n                  </button>\r\n                }\r\n              </div>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('localization') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.localization.title' | translate }}</h2>\r\n            <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\r\n              <div>\r\n                <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.localization.language.label' | translate }}</label>\r\n                <select class=\"w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-gray-200\"\r\n                  [value]=\"languageService.language()\" (change)=\"setLanguage($any($event.target).value)\">\r\n                  <option value=\"en\">{{ 'settings.localization.language.options.en' | translate }}</option>\r\n                  <option value=\"ar\">{{ 'settings.localization.language.options.ar' | translate }}</option>\r\n                </select>\r\n              </div>\r\n              <div>\r\n                <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.localization.currency.label' | translate }}</label>\r\n                <select class=\"w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-gray-200\"\r\n                  [value]=\"settings().currency\" (change)=\"setCurrency($any($event.target).value)\">\r\n                  @for (cur of currencyOptions; track cur) {\r\n                    <option [value]=\"cur\">{{ ('settings.localization.currency.options.' + cur) | translate }}</option>\r\n                  }\r\n                </select>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('notifications') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.notifications.title' | translate }}</h2>\r\n            <div class=\"space-y-3\">\r\n              <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.notifications.email' | translate }}</span>\r\n                <div class=\"relative flex-shrink-0\">\r\n                  <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().notifications.email\" (change)=\"toggleNotifications('email', $any($event.target).checked)\">\r\n                  <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                  <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                </div>\r\n              </label>\r\n              <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.notifications.push' | translate }}</span>\r\n                <div class=\"relative flex-shrink-0\">\r\n                  <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().notifications.push\" (change)=\"toggleNotifications('push', $any($event.target).checked)\">\r\n                  <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                  <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                </div>\r\n              </label>\r\n              <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.notifications.sms' | translate }}</span>\r\n                <div class=\"relative flex-shrink-0\">\r\n                  <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().notifications.sms\" (change)=\"toggleNotifications('sms', $any($event.target).checked)\">\r\n                  <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                  <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                </div>\r\n              </label>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('privacy') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.privacy.title' | translate }}</h2>\r\n            <div class=\"space-y-3\">\r\n              <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.privacy.showPublicProfile' | translate }}</span>\r\n                <div class=\"relative flex-shrink-0\">\r\n                  <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().privacy.showPublicProfile\" (change)=\"togglePrivacy('showPublicProfile', $any($event.target).checked)\">\r\n                  <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                  <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                </div>\r\n              </label>\r\n              <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.privacy.sharePortfolioPerformance' | translate }}</span>\r\n                <div class=\"relative flex-shrink-0\">\r\n                  <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().privacy.sharePortfolioPerformance\" (change)=\"togglePrivacy('sharePortfolioPerformance', $any($event.target).checked)\">\r\n                  <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                  <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                </div>\r\n              </label>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('personalization') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.personalization.title' | translate }}</h2>\r\n            <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\r\n              <div>\r\n                <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.personalization.dashboardDensity.label' | translate }}</label>\r\n                <div class=\"flex flex-wrap gap-2\">\r\n                  @for (opt of densityOptions; track opt) {\r\n                    <button type=\"button\" (click)=\"setPersonalization({ dashboardDensity: opt })\"\r\n                      class=\"px-4 py-2 rounded-md border transition-colors\"\r\n                      [class.bg-blue-500/20]=\"settings().personalization.dashboardDensity === opt\"\r\n                      [class.border-blue-500]=\"settings().personalization.dashboardDensity === opt\"\r\n                      [class.text-blue-300]=\"settings().personalization.dashboardDensity === opt\"\r\n                      [class.bg-slate-700/50]=\"settings().personalization.dashboardDensity !== opt\"\r\n                      [class.border-slate-600]=\"settings().personalization.dashboardDensity !== opt\"\r\n                      [class.text-gray-300]=\"settings().personalization.dashboardDensity !== opt\">\r\n                      {{ ('settings.personalization.dashboardDensity.options.' + opt) | translate }}\r\n                    </button>\r\n                  }\r\n                </div>\r\n              </div>\r\n              <div>\r\n                <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.personalization.defaultInvestmentType.label' | translate }}</label>\r\n                <div class=\"flex flex-wrap gap-2\">\r\n                  @for (opt of investmentTypeOptions; track opt) {\r\n                    <button type=\"button\" (click)=\"setPersonalization({ defaultInvestmentType: opt })\"\r\n                      class=\"px-4 py-2 rounded-md border transition-colors\"\r\n                      [class.bg-blue-500/20]=\"settings().personalization.defaultInvestmentType === opt\"\r\n                      [class.border-blue-500]=\"settings().personalization.defaultInvestmentType === opt\"\r\n                      [class.text-blue-300]=\"settings().personalization.defaultInvestmentType === opt\"\r\n                      [class.bg-slate-700/50]=\"settings().personalization.defaultInvestmentType !== opt\"\r\n                      [class.border-slate-600]=\"settings().personalization.defaultInvestmentType !== opt\"\r\n                      [class.text-gray-300]=\"settings().personalization.defaultInvestmentType !== opt\">\r\n                      {{ ('settings.personalization.defaultInvestmentType.options.' + opt) | translate }}\r\n                    </button>\r\n                  }\r\n                </div>\r\n              </div>\r\n              <div class=\"md:col-span-2\">\r\n                <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                  <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.personalization.showRiskIndicators' | translate }}</span>\r\n                  <div class=\"relative flex-shrink-0\">\r\n                    <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().personalization.showRiskIndicators\" (change)=\"setPersonalization({ showRiskIndicators: $any($event.target).checked })\">\r\n                    <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                    <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                  </div>\r\n                </label>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('support') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.support.title' | translate }}</h2>\r\n            <div class=\"space-y-4\">\r\n              <label class=\"flex items-center justify-between gap-4 cursor-pointer group py-1\">\r\n                <span class=\"text-sm text-gray-300 group-hover:text-white transition-colors\">{{ 'settings.support.available' | translate }}</span>\r\n                <div class=\"relative flex-shrink-0\">\r\n                  <input type=\"checkbox\" class=\"sr-only peer\" [checked]=\"settings().support?.available\" (change)=\"setSupportAvailability($any($event.target).checked)\">\r\n                  <div class=\"w-11 h-6 bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors border border-slate-600 peer-checked:border-blue-500\"></div>\r\n                  <div class=\"absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm\"></div>\r\n                </div>\r\n              </label>\r\n              <div>\r\n                <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.support.hours' | translate }}</label>\r\n                <input type=\"text\" class=\"w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-gray-200\"\r\n                  [value]=\"settings().support?.hours || ''\" (change)=\"setSupportHours($any($event.target).value)\" placeholder=\"e.g. 9:00-17:00\">\r\n              </div>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('security') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.security.title' | translate }}</h2>\r\n            <div>\r\n              <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'settings.security.sessionTimeout.label' | translate }}</label>\r\n              <div class=\"grid grid-cols-[1fr_auto] gap-3 items-center\">\r\n                <input type=\"number\" min=\"1\" class=\"w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-gray-200\"\r\n                  [value]=\"settings().sessionTimeoutMinutes || 30\" (change)=\"setSessionTimeoutMinutes($any($event.target).value)\">\r\n                <span class=\"text-gray-300 pl-2\">{{ 'settings.security.sessionTimeout.minutes' | translate }}</span>\r\n              </div>\r\n              <p class=\"text-sm text-gray-400 mt-2\">{{ 'settings.security.sessionTimeout.help' | translate }}</p>\r\n            </div>\r\n          </div>\r\n        }\r\n        @case ('wallet') {\r\n          <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\r\n            <h2 class=\"text-lg font-semibold text-white mb-3\">{{ 'settings.wallet.title' | translate }}</h2>\r\n            <div class=\"space-y-4\">\r\n              <div class=\"text-gray-300\">\n                <span class=\"font-medium\">{{ 'settings.wallet.balance' | translate }}:</span>\n                <span class=\"ml-2\">{{ platformCreditBalance() | number:'1.0-2':'en-US' }}</span>\n              </div>\n              <div class=\"flex flex-wrap gap-3\">\n                <a routerLink=\"/admin/profile/wallet\" class=\"px-4 py-2 rounded-md border border-slate-600 text-gray-200 transition-colors\">{{ 'profile.viewWallet' | translate }}</a>\n                <a routerLink=\"/admin/credit-charge\" class=\"px-4 py-2 rounded-md bg-slate-900 text-white transition-colors\">{{ 'profile.credits.chargeNow' | translate }}</a>\n              </div>\n            </div>\r\n          </div>\r\n        }\r\n      }\r\n    </section>\r\n  </div>\r\n</div>\r\n", styles: ["@use 'variables' as *;\r\n\r\n.settings-section {\r\n  @media (min-width: 1024px) {\r\n    .grid { grid-template-columns: 1fr 1fr; }\r\n  }\r\n}\r\n\r\n.option-active {\r\n  background-color: rgba(59, 130, 246, 0.2);\r\n  border-color: rgba(59, 130, 246, 0.6);\r\n  color: rgb(191, 219, 254);\r\n}\r\n\r\n.option-inactive {\r\n  background-color: rgba(51, 65, 85, 0.5);\r\n  border-color: rgba(71, 85, 105, 0.7);\r\n  color: rgb(203, 213, 225);\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SettingsComponent, { className: "SettingsComponent", filePath: "src/app/pages/admin/settings/settings.component.ts", lineNumber: 18 }); })();
