import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, SecurityContext, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { FileStoreService } from '../../../services/file-store.service';
import { ReportService } from '../../../services/report.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { RequestsService } from '../../../services/requests.service';
import { ContractService } from '../../../services/contract.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = a0 => ["/admin/founders", a0];
const _c1 = a0 => ["/admin/opportunities", a0, "edit"];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.contractId;
const _forTrack2 = ($index, $item) => $item.versionNumber;
const _forTrack3 = ($index, $item) => $item.label;
const _forTrack4 = ($index, $item) => $item.id || $index;
const _forTrack5 = ($index, $item) => $item.id || $item.fileId || $item.fileName;
function OpportunityRoomComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 2);
    i0.ɵɵelement(1, "div", 6)(2, "div", 7);
    i0.ɵɵelementEnd();
} }
function OpportunityRoomComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 3)(1, "h1");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div")(6, "button", 8);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_3_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "a", 9);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const roomError_r3 = ctx;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(roomError_r3.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(roomError_r3.message);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "opportunityRoom.errors.retry"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 6, "opportunityRoom.backToOpportunities"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, ctx_r1.founderProfileId()));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.founderSummary());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.founderSummary());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 33);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_29_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openProjectReport()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "reports.actions.reportProject"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.actionSuccess());
} }
function OpportunityRoomComponent_Conditional_4_For_69_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.updates().length);
} }
function OpportunityRoomComponent_Conditional_4_For_69_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.documents().length);
} }
function OpportunityRoomComponent_Conditional_4_For_69_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.media().length);
} }
function OpportunityRoomComponent_Conditional_4_For_69_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 34);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_For_69_Template_button_click_0_listener() { const tab_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setTab(tab_r6.id)); });
    i0.ɵɵelementStart(1, "span", 35);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, OpportunityRoomComponent_Conditional_4_For_69_Conditional_7_Template, 2, 1, "small");
    i0.ɵɵconditionalCreate(8, OpportunityRoomComponent_Conditional_4_For_69_Conditional_8_Template, 2, 1, "small");
    i0.ɵɵconditionalCreate(9, OpportunityRoomComponent_Conditional_4_For_69_Conditional_9_Template, 2, 1, "small");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active", ctx_r1.activeTab() === tab_r6.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tab_r6.id === "overview" ? "\u2302" : tab_r6.id === "timeline" ? "\u2301" : tab_r6.id === "updates" ? "\u2197" : tab_r6.id === "documents" ? "\u25A1" : tab_r6.id === "media" ? "\u25A7" : "\u25A4");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tab_r6.id === "contracts" ? i0.ɵɵpipeBind1(5, 7, "contracts.title") : i0.ɵɵpipeBind1(6, 9, "opportunityRoom.tabs." + tab_r6.id));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(tab_r6.id === "updates" && ctx_r1.updates().length ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(tab_r6.id === "documents" && ctx_r1.documents().length ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(tab_r6.id === "media" && ctx_r1.media().length ? 9 : -1);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 38);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openUpdateModal()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", !ctx_r1.canAddUpdate());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "opportunityRoom.founderWorkspace.addUpdate"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 38);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openMilestoneModal()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", !ctx_r1.canAddMilestone());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "opportunityRoom.founderWorkspace.addMilestone"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 38);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openDocumentModal()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", !ctx_r1.canAddDocument());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "opportunityRoom.founderWorkspace.addDocument"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_79_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 29);
    i0.ɵɵconditionalCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_1_Template, 3, 4, "button", 36);
    i0.ɵɵconditionalCreate(2, OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_2_Template, 3, 4, "button", 36);
    i0.ɵɵconditionalCreate(3, OpportunityRoomComponent_Conditional_4_Conditional_79_Conditional_3_Template, 3, 4, "button", 36);
    i0.ɵɵelementStart(4, "a", 37);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "updates" || ctx_r1.activeTab() === "overview" ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "timeline" || ctx_r1.activeTab() === "overview" ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "documents" || ctx_r1.activeTab() === "overview" ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("disabled", !ctx_r1.canEditCoreProject());
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(9, _c1, ctx_r1.opportunityId()));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 7, "opportunityRoom.founderWorkspace.editProject"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_80_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "dt", 42);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 43);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 41)(8, "dt", 42);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "dd", 43);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 41)(15, "dt", 42);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "dd", 43);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 41)(22, "dt", 42);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "dd", 43);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 41)(29, "dt", 42);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "dd", 43);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 10, "investmentPreview.sharesOffered"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().offeredShares == null ? "\u2014" : i0.ɵɵpipeBind1(6, 12, ctx_r1.overview().offeredShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 14, "investmentPreview.sharesSold"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().soldShares == null ? "\u2014" : i0.ɵɵpipeBind1(13, 16, ctx_r1.overview().soldShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 18, "investmentPreview.sharesRemaining"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().remainingShares == null ? "\u2014" : i0.ɵɵpipeBind1(20, 20, ctx_r1.overview().remainingShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 22, "investmentPreview.equityAllocated"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().allocatedEquityPercentage == null ? "\u2014" : i0.ɵɵpipeBind2(27, 24, ctx_r1.overview().allocatedEquityPercentage, "1.0-2") + "%");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 27, "investmentPreview.equityRemaining"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().remainingEquityPercentage == null ? "\u2014" : i0.ɵɵpipeBind2(34, 29, ctx_r1.overview().remainingEquityPercentage, "1.0-2") + "%");
} }
function OpportunityRoomComponent_Conditional_4_Conditional_80_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 30)(1, "article", 32)(2, "h2", 39);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "dl", 40)(6, "div", 41)(7, "dt", 42);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "dd", 43);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 41)(14, "dt", 42);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "dd", 43);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "div", 41)(21, "dt", 42);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "dd", 43);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "div", 41)(28, "dt", 42);
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "dd", 43);
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(33, OpportunityRoomComponent_Conditional_4_Conditional_80_Conditional_33_Template, 35, 32);
    i0.ɵɵelementStart(34, "div", 41)(35, "dt", 42);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "dd", 44);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "div", 41)(41, "dt", 42);
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "dd", 44);
    i0.ɵɵtext(45);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(46, "div", 45)(47, "dt", 42);
    i0.ɵɵtext(48);
    i0.ɵɵpipe(49, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(50, "dd", 44);
    i0.ɵɵtext(51);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(52, "article", 32)(53, "h2", 39);
    i0.ɵɵtext(54, "Participation Summary");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "div", 46)(56, "div", 47)(57, "span", 48);
    i0.ɵɵtext(58, "Room role");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "span", 49);
    i0.ɵɵtext(60);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(61, "div", 47)(62, "span", 48);
    i0.ɵɵtext(63, "Room access");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(64, "span", 49);
    i0.ɵɵtext(65);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(66, "div", 47)(67, "span", 48);
    i0.ɵɵtext(68, "View private files");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(69, "span", 49);
    i0.ɵɵtext(70);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(71, "div", 47)(72, "span", 48);
    i0.ɵɵtext(73, "Download files");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(74, "span", 49);
    i0.ɵɵtext(75);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 20, "opportunityRoom.overview.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 22, "investmentPreview.amountRaised"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().fundedAmount == null ? "\u2014" : i0.ɵɵpipeBind2(12, 24, ctx_r1.overview().fundedAmount, "1.0-0"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 27, "investmentPreview.remainingFunding"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().remainingFundingAmount == null ? "\u2014" : i0.ɵɵpipeBind2(19, 29, ctx_r1.overview().remainingFundingAmount, "1.0-0"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 32, "investmentPreview.fundingProgress"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().fundingProgressPercentage == null ? "\u2014" : i0.ɵɵpipeBind2(26, 34, ctx_r1.overview().fundingProgressPercentage, "1.0-2") + "%");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 37, "investmentPreview.approvedParticipants"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().approvedParticipantCount == null ? "\u2014" : ctx_r1.overview().approvedParticipantCount);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.overview().investmentModel === "Equity" || ctx_r1.overview().investmentModel === 1 ? 33 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 39, "opportunityRoom.overview.useOfFunds"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().fundingUsage || ctx_r1.overview().fundingPurpose || ctx_r1.overview().useOfFunds || "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 41, "opportunityRoom.overview.expectedReturn"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().expectedReturnSummary || "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(49, 43, "opportunityRoom.overview.publicTerms"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.overview().publicInvestmentTermsSummary || "-");
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(ctx_r1.roomRole());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.participationAccessText());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.permissionLabel(ctx_r1.participantContext().canViewPrivateFiles));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.permissionLabel(ctx_r1.participantContext().canDownloadFiles));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 53);
    i0.ɵɵelement(1, "div", 59)(2, "div", 59);
    i0.ɵɵelementEnd();
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 54);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.contractsError());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 55)(1, "p", 60);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 51);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "contracts.empty.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "contracts.empty.helper"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_15_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 62);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_15_For_2_Template_button_click_0_listener() { const contract_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openContractDetails(contract_r12)); });
    i0.ɵɵelementStart(1, "div", 63)(2, "div", 64)(3, "p", 65);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 66);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "span", 67);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "dl", 68)(10, "div")(11, "dt", 69);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "dd", 70);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div")(17, "dt", 69);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "dd", 70);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div")(23, "dt", 69);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "dd", 70);
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div")(29, "dt", 69);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "dd", 70);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    let tmp_13_0;
    let tmp_14_0;
    let tmp_15_0;
    let tmp_16_0;
    const contract_r12 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵclassProp("border-emerald-500\\/50", ((tmp_13_0 = ctx_r1.selectedContract()) == null ? null : tmp_13_0.contract == null ? null : tmp_13_0.contract.contractId) === contract_r12.contractId)("bg-emerald-500\\/10", ((tmp_14_0 = ctx_r1.selectedContract()) == null ? null : tmp_14_0.contract == null ? null : tmp_14_0.contract.contractId) === contract_r12.contractId)("border-transparent", ((tmp_15_0 = ctx_r1.selectedContract()) == null ? null : tmp_15_0.contract == null ? null : tmp_15_0.contract.contractId) !== contract_r12.contractId)("bg-transparent", ((tmp_16_0 = ctx_r1.selectedContract()) == null ? null : tmp_16_0.contract == null ? null : tmp_16_0.contract.contractId) !== contract_r12.contractId);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(contract_r12.contractNumber);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isFounder() ? contract_r12.investorDisplayName : contract_r12.founderDisplayName, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.contractStatusLabel(contract_r12.status), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 19, "contracts.fields.investmentModel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(contract_r12.investmentModel);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 21, "contracts.fields.currentVersion"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("V", contract_r12.currentVersionNumber);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 23, "contracts.fields.latestAgreementDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.contractDate(contract_r12.latestAgreementDate));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 25, "contracts.fields.versionCount"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(contract_r12.versionCount);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 53);
    i0.ɵɵrepeaterCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_15_For_2_Template, 34, 27, "button", 61, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.contracts());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 56);
    i0.ɵɵelement(1, "div", 71)(2, "div", 72)(3, "div", 73);
    i0.ɵɵelementEnd();
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.contractDetailsError());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 77)(1, "button", 8);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_9_Template_button_click_1_listener() { const version_r14 = i0.ɵɵrestoreView(_r13); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openContractPreview(version_r14)); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 85);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_9_Template_button_click_4_listener() { const version_r14 = i0.ɵɵrestoreView(_r13); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.downloadContractPdf(version_r14)); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const version_r14 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, "contracts.actions.preview"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.isPdfDownloading(version_r14));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isPdfDownloading(version_r14) ? i0.ɵɵpipeBind1(6, 5, "contracts.pdf.preparing") : i0.ɵɵpipeBind1(7, 7, "contracts.actions.downloadPdf"), " ");
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_69_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 81);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "contracts.empty.noTerms"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_70_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 86)(1, "dt", 87);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd", 88);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const term_r15 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(term_r15.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(term_r15.value);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_70_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 82);
    i0.ɵɵrepeaterCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_70_For_2_Template, 5, 2, "div", 86, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.selectedTermsSummary());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_For_77_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 41)(1, "div", 89)(2, "div")(3, "div", 90)(4, "p", 91);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 92);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 93);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "p", 94);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 95);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 77)(15, "button", 96);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_For_77_Template_button_click_15_listener() { const version_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openContractVersion(version_r17)); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "button", 97);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_For_77_Template_button_click_18_listener() { const version_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openContractPreview(version_r17)); });
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "button", 52);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_For_77_Template_button_click_21_listener() { const version_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.downloadContractPdf(version_r17)); });
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const version_r17 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("V", version_r17.versionNumber);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.versionBadgeLabel(version_r17));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.versionStatusLabel(version_r17.status));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.versionTypeLabel(version_r17.versionType));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.contractDate(version_r17.activatedAt || version_r17.createdAt));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 9, "contracts.actions.openVersion"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 11, "contracts.actions.preview"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.isPdfDownloading(version_r17));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isPdfDownloading(version_r17) ? i0.ɵɵpipeBind1(23, 13, "contracts.pdf.preparing") : i0.ɵɵpipeBind1(24, 15, "contracts.actions.downloadPdf"), " ");
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 84)(1, "p", 98);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 44);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "contracts.fields.changesSummary"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.selectedChangesSummary());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74)(1, "div")(2, "p", 75);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2", 76);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 51);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_9_Template, 8, 9, "div", 77);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "dl", 78)(11, "div", 41)(12, "dt", 42);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "dd", 43);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "div", 41)(18, "dt", 42);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dd", 43);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div", 41)(24, "dt", 42);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "dd", 43);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "div", 41)(30, "dt", 42);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "dd", 43);
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "div", 41)(36, "dt", 42);
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "dd", 43);
    i0.ɵɵtext(40);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(41, "div", 41)(42, "dt", 42);
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "dd", 43);
    i0.ɵɵtext(46);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(47, "div", 41)(48, "dt", 42);
    i0.ɵɵtext(49);
    i0.ɵɵpipe(50, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "dd", 43);
    i0.ɵɵtext(52);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(53, "div", 41)(54, "dt", 42);
    i0.ɵɵtext(55);
    i0.ɵɵpipe(56, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "dd", 43);
    i0.ɵɵtext(58);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(59, "div", 41)(60, "dt", 42);
    i0.ɵɵtext(61);
    i0.ɵɵpipe(62, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "dd", 43);
    i0.ɵɵtext(64);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(65, "section", 79)(66, "h3", 80);
    i0.ɵɵtext(67);
    i0.ɵɵpipe(68, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(69, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_69_Template, 3, 3, "p", 81)(70, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_70_Template, 3, 0, "dl", 82);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(71, "section", 79)(72, "h3", 80);
    i0.ɵɵtext(73);
    i0.ɵɵpipe(74, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(75, "div", 83);
    i0.ɵɵrepeaterCreate(76, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_For_77_Template, 25, 17, "article", 41, _forTrack2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(78, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Conditional_78_Template, 6, 4, "div", 84);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_7_0;
    const detail_r18 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 26, "contracts.investmentAgreement"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(detail_r18.contract.contractNumber);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.title());
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_7_0 = ctx_r1.selectedVersion()) ? 9 : -1, tmp_7_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 28, "contracts.fields.founder"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(detail_r18.contract.founderDisplayName || "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 30, "contracts.fields.investor"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(detail_r18.contract.investorDisplayName || "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 32, "contracts.fields.investmentModel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(detail_r18.contract.investmentModel);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 34, "contracts.fields.currentVersion"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("V", detail_r18.contract.currentVersionNumber);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 36, "contracts.fields.effectiveDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.effectiveDate());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 38, "contracts.fields.pdfStatus"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.pdfStatusLabel(ctx_r1.currentPdfStatus(ctx_r1.selectedVersion())));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(50, 40, "contracts.fields.sourceParticipation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.sourceParticipationReference());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(56, 42, "contracts.fields.acceptedOffer"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.acceptedOfferReference());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(62, 44, "contracts.fields.status"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.contractStatusLabel(detail_r18.contract.status));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(68, 46, "contracts.sections.agreedTerms"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.selectedTermsSummary().length === 0 ? 69 : 70);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(74, 48, "contracts.sections.versionHistory"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(detail_r18.versionHistory);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.selectedVersion() ? 78 : -1);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 58)(1, "p", 60);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 51);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "contracts.empty.selectTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "contracts.empty.selectHelper"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_81_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 31)(1, "article", 32)(2, "div", 50)(3, "div")(4, "h2", 39);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 51);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 52);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_4_Conditional_81_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.loadContracts(true)); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(12, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_12_Template, 3, 0, "div", 53)(13, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_13_Template, 2, 1, "div", 54)(14, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_14_Template, 7, 6, "div", 55)(15, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_15_Template, 3, 0, "div", 53);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "article", 32);
    i0.ɵɵconditionalCreate(17, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_17_Template, 4, 0, "div", 56)(18, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_18_Template, 2, 1, "div", 57)(19, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_19_Template, 79, 50)(20, OpportunityRoomComponent_Conditional_4_Conditional_81_Conditional_20_Template, 7, 6, "div", 58);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_7_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "contracts.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.contractListSubtitle());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.contractsLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 8, "contracts.actions.refresh"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.contractsLoading() ? 12 : ctx_r1.contractsError() ? 13 : ctx_r1.contracts().length === 0 ? 14 : 15);
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r1.contractDetailsLoading() ? 17 : ctx_r1.contractDetailsError() ? 18 : (tmp_7_0 = ctx_r1.selectedContract()) ? 19 : 20, tmp_7_0);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_82_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 99);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "opportunityRoom.milestones.empty"));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_82_Conditional_6_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 41)(1, "div", 101)(2, "div")(3, "p", 60);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 95);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "span", 102);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "p", 103);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const event_r19 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.eventTitle(event_r19));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r1.eventType(event_r19), " \u00B7 ", ctx_r1.eventDate(event_r19));
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-emerald-500\\/10", event_r19.isPublic === true)("text-emerald-300", event_r19.isPublic === true)("bg-amber-500\\/10", event_r19.isPublic === false)("text-amber-300", event_r19.isPublic === false)("bg-transparent", event_r19.isPublic === null || event_r19.isPublic === undefined)("investa-muted", event_r19.isPublic === null || event_r19.isPublic === undefined);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", event_r19.isPublic === true ? "Public" : event_r19.isPublic === false ? "Private" : "Room", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(event_r19.description || "-");
} }
function OpportunityRoomComponent_Conditional_4_Conditional_82_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ol", 100);
    i0.ɵɵrepeaterCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_82_Conditional_6_For_2_Template, 11, 17, "li", 41, _forTrack4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.timelineSorted());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_82_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 32)(1, "h2", 39);
    i0.ɵɵtext(2, "Milestones Timeline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 51);
    i0.ɵɵtext(4, "Strategic milestones only. Operational updates are listed in the Updates tab.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, OpportunityRoomComponent_Conditional_4_Conditional_82_Conditional_5_Template, 3, 3, "p", 99)(6, OpportunityRoomComponent_Conditional_4_Conditional_82_Conditional_6_Template, 3, 0, "ol", 100);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r1.timelineSorted().length === 0 ? 5 : 6);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_83_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 99);
    i0.ɵɵtext(1, "No updates yet.");
    i0.ɵɵelementEnd();
} }
function OpportunityRoomComponent_Conditional_4_Conditional_83_Conditional_6_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 41)(1, "p", 60);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 95);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 103);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const update_r20 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.eventTitle(update_r20));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.eventDate(update_r20));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(update_r20.description || "-");
} }
function OpportunityRoomComponent_Conditional_4_Conditional_83_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 100);
    i0.ɵɵrepeaterCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_83_Conditional_6_For_2_Template, 7, 3, "article", 41, _forTrack4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.updatesSorted());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 32)(1, "h2", 39);
    i0.ɵɵtext(2, "Founder Updates");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 51);
    i0.ɵɵtext(4, "Progress notes, announcements, and operational updates.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, OpportunityRoomComponent_Conditional_4_Conditional_83_Conditional_5_Template, 2, 0, "p", 99)(6, OpportunityRoomComponent_Conditional_4_Conditional_83_Conditional_6_Template, 3, 0, "div", 100);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r1.updatesSorted().length === 0 ? 5 : 6);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 99);
    i0.ɵɵtext(1, "No documents uploaded yet.");
    i0.ɵɵelementEnd();
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_For_5_a_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 113);
    i0.ɵɵtext(1, "Preview");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r21 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("href", ctx_r1.previewUrl(doc_r21), i0.ɵɵsanitizeUrl);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_For_5_a_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 113);
    i0.ɵɵtext(1, "Download");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r21 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("href", ctx_r1.downloadUrl(doc_r21), i0.ɵɵsanitizeUrl);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 41)(1, "div", 107)(2, "div", 108);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 109)(5, "h4", 110);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 95);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 95);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 111);
    i0.ɵɵtemplate(12, OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_For_5_a_12_Template, 2, 1, "a", 112)(13, OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_For_5_a_13_Template, 2, 1, "a", 112);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const doc_r21 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.extension(doc_r21));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.fileTitle(doc_r21));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3("", ctx_r1.fileSize(doc_r21.fileSize), " \u00B7 ", ctx_r1.visibility(doc_r21), " \u00B7 ", ctx_r1.uploadedDate(doc_r21));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r21.category || doc_r21.purpose || "General");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r1.previewUrl(doc_r21));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.downloadUrl(doc_r21));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "h3", 105);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 106);
    i0.ɵɵrepeaterCreate(4, OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_For_5_Template, 14, 8, "article", 41, _forTrack5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const group_r22 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(group_r22.label);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(group_r22.items);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 104);
    i0.ɵɵrepeaterCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_For_2_Template, 6, 1, "div", null, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.documentGroups());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_84_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 32)(1, "h2", 39);
    i0.ɵɵtext(2, "Documents");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_3_Template, 2, 0, "p", 99)(4, OpportunityRoomComponent_Conditional_4_Conditional_84_Conditional_4_Template, 3, 0, "div", 104);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.documents().length === 0 ? 3 : 4);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 99);
    i0.ɵɵtext(1, "No media available yet.");
    i0.ɵɵelementEnd();
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 116);
} if (rf & 2) {
    const item_r23 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("src", ctx_r1.mediaUrl(item_r23), i0.ɵɵsanitizeUrl)("alt", ctx_r1.fileTitle(item_r23));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r23 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isVideo(item_r23) ? "Video" : ctx_r1.extension(item_r23), " ");
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_a_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 113);
    i0.ɵɵtext(1, "Preview");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r23 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("href", ctx_r1.previewUrl(item_r23), i0.ɵɵsanitizeUrl);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_a_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 113);
    i0.ɵɵtext(1, "Download");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r23 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("href", ctx_r1.downloadUrl(item_r23), i0.ɵɵsanitizeUrl);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 115);
    i0.ɵɵconditionalCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_Conditional_1_Template, 1, 2, "img", 116)(2, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_Conditional_2_Template, 2, 1, "div", 117);
    i0.ɵɵelementStart(3, "div", 118)(4, "h4", 110);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 95);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 111);
    i0.ɵɵtemplate(9, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_a_9_Template, 2, 1, "a", 112)(10, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_a_10_Template, 2, 1, "a", 112);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r23 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isImage(item_r23) && ctx_r1.mediaUrl(item_r23) ? 1 : 2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.fileTitle(item_r23));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r1.visibility(item_r23), " \u00B7 ", ctx_r1.uploadedDate(item_r23));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r1.previewUrl(item_r23));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.downloadUrl(item_r23));
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "h3", 105);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 114);
    i0.ɵɵrepeaterCreate(4, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_For_5_Template, 11, 6, "article", 115, _forTrack5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const group_r24 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(group_r24.label);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(group_r24.items);
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 104);
    i0.ɵɵrepeaterCreate(1, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_For_2_Template, 6, 1, "div", null, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.mediaGroups());
} }
function OpportunityRoomComponent_Conditional_4_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 32)(1, "h2", 39);
    i0.ɵɵtext(2, "Media");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_3_Template, 2, 0, "p", 99)(4, OpportunityRoomComponent_Conditional_4_Conditional_85_Conditional_4_Template, 3, 0, "div", 104);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.media().length === 0 ? 3 : 4);
} }
function OpportunityRoomComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 10);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "header", 11)(4, "div", 12)(5, "div", 13);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 14)(8, "div", 15)(9, "h1");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 16);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(13, OpportunityRoomComponent_Conditional_4_Conditional_13_Template, 2, 4, "a", 17)(14, OpportunityRoomComponent_Conditional_4_Conditional_14_Template, 2, 1, "p");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 18)(16, "div")(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "strong");
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div")(23, "span");
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "strong");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(29, OpportunityRoomComponent_Conditional_4_Conditional_29_Template, 3, 3, "button", 19);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "section", 20)(31, "div")(32, "span");
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "strong");
    i0.ɵɵtext(36);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div")(38, "span");
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "strong");
    i0.ɵɵtext(42);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(43, "div")(44, "span");
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "strong");
    i0.ɵɵtext(48);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "div")(50, "span");
    i0.ɵɵtext(51);
    i0.ɵɵpipe(52, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "strong");
    i0.ɵɵtext(54);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(55, "div", 21)(56, "span");
    i0.ɵɵtext(57);
    i0.ɵɵpipe(58, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "strong");
    i0.ɵɵtext(60);
    i0.ɵɵpipe(61, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(62, "div", 22);
    i0.ɵɵelement(63, "i");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(64, OpportunityRoomComponent_Conditional_4_Conditional_64_Template, 2, 1, "div", 23);
    i0.ɵɵelementStart(65, "div", 24)(66, "aside", 25)(67, "nav");
    i0.ɵɵrepeaterCreate(68, OpportunityRoomComponent_Conditional_4_For_69_Template, 10, 11, "button", 26, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(70, "main", 27)(71, "div", 28)(72, "div")(73, "span");
    i0.ɵɵtext(74);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(75, "h2");
    i0.ɵɵtext(76);
    i0.ɵɵpipe(77, "translate");
    i0.ɵɵpipe(78, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(79, OpportunityRoomComponent_Conditional_4_Conditional_79_Template, 7, 11, "div", 29);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(80, OpportunityRoomComponent_Conditional_4_Conditional_80_Template, 76, 45, "section", 30);
    i0.ɵɵconditionalCreate(81, OpportunityRoomComponent_Conditional_4_Conditional_81_Template, 21, 10, "section", 31);
    i0.ɵɵconditionalCreate(82, OpportunityRoomComponent_Conditional_4_Conditional_82_Template, 7, 1, "section", 32);
    i0.ɵɵconditionalCreate(83, OpportunityRoomComponent_Conditional_4_Conditional_83_Template, 7, 1, "section", 32);
    i0.ɵɵconditionalCreate(84, OpportunityRoomComponent_Conditional_4_Conditional_84_Template, 5, 1, "section", 32);
    i0.ɵɵconditionalCreate(85, OpportunityRoomComponent_Conditional_4_Conditional_85_Template, 5, 1, "section", 32);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u2190 ", i0.ɵɵpipeBind1(2, 32, "opportunityRoom.backToOpportunities"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.title().charAt(0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.title());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.status());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.founderProfileId() ? 13 : 14);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 34, "opportunityRoom.stats.participation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.roomRole());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 36, "opportunityRoom.overview.status"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.stageKey() ? i0.ɵɵpipeBind1(28, 38, ctx_r1.stageKey()) : ctx_r1.stage());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canReportProject() ? 29 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 40, "opportunityRoom.funding.funded"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(ctx_r1.fundedAmount()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 42, "opportunityRoom.funding.target"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(ctx_r1.fundingTarget()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 44, "opportunityRoom.funding.remaining"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(ctx_r1.remainingFundingAmount()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(52, 46, "opportunityRoom.funding.participants"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.approvedParticipantCount() ?? "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(58, 48, "opportunityRoom.funding.progress"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.fundingProgress() == null ? "-" : i0.ɵɵpipeBind2(61, 50, ctx_r1.fundingProgress(), "1.0-2") + "%");
    i0.ɵɵadvance(3);
    i0.ɵɵstyleProp("width", ctx_r1.fundingProgressBarWidth(), "%");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.actionSuccess() ? 64 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r1.tabs);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r1.roomRole());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.activeTab() === "contracts" ? i0.ɵɵpipeBind1(77, 53, "contracts.title") : i0.ɵɵpipeBind1(78, 55, "opportunityRoom.tabs." + ctx_r1.activeTab()));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.isFounder() ? 79 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "overview" ? 80 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "contracts" ? 81 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "timeline" ? 82 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "updates" ? 83 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "documents" ? 84 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "media" ? 85 : -1);
} }
function OpportunityRoomComponent_Conditional_5_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 125);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "contracts.preview.loading"));
} }
function OpportunityRoomComponent_Conditional_5_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 126);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.previewError());
} }
function OpportunityRoomComponent_Conditional_5_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 127);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("innerHTML", ctx_r1.previewHtml(), i0.ɵɵsanitizeHtml);
} }
function OpportunityRoomComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "section", 119)(2, "header", 120)(3, "div")(4, "p", 121);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "h2", 122);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "div", 77)(11, "button", 85);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_5_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.printContractPreview()); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 123);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_5_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.downloadContractPdf(ctx_r1.selectedVersion())); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "button", 33);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_5_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeContractPreview()); });
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "div", 124);
    i0.ɵɵconditionalCreate(22, OpportunityRoomComponent_Conditional_5_Conditional_22_Template, 3, 3, "div", 125)(23, OpportunityRoomComponent_Conditional_5_Conditional_23_Template, 2, 1, "div", 126)(24, OpportunityRoomComponent_Conditional_5_Conditional_24_Template, 1, 1, "div", 127);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "contracts.actions.preview"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(((tmp_2_0 = ctx_r1.selectedContract()) == null ? null : tmp_2_0.contract == null ? null : tmp_2_0.contract.contractNumber) || i0.ɵɵpipeBind1(9, 10, "contracts.investmentAgreement"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !ctx_r1.previewHtml());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 12, "contracts.actions.print"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.selectedVersion() || ctx_r1.isPdfDownloading(ctx_r1.selectedVersion()));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isPdfDownloading(ctx_r1.selectedVersion()) ? i0.ɵɵpipeBind1(16, 14, "contracts.pdf.preparing") : i0.ɵɵpipeBind1(17, 16, "contracts.actions.downloadPdf"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 18, "common.close"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.previewLoading() ? 22 : ctx_r1.previewError() ? 23 : ctx_r1.previewHtml() ? 24 : -1);
} }
function OpportunityRoomComponent_Conditional_6_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 133);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "reports.success"), " ");
} }
function OpportunityRoomComponent_Conditional_6_Conditional_13_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 139);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reason_r28 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", reason_r28);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportReasonLabel(reason_r28));
} }
function OpportunityRoomComponent_Conditional_6_Conditional_13_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 141);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportError());
} }
function OpportunityRoomComponent_Conditional_6_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 137);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "select", 138);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_6_Conditional_13_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReportReason($event)); });
    i0.ɵɵrepeaterCreate(4, OpportunityRoomComponent_Conditional_6_Conditional_13_For_5_Template, 2, 2, "option", 139, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "label", 137);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementStart(9, "textarea", 140);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_6_Conditional_13_Template_textarea_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReportDescription($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, OpportunityRoomComponent_Conditional_6_Conditional_13_Conditional_11_Template, 2, 1, "div", 141);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 6, "reports.reason"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.reportReason());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.reportReasons);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 8, "reports.description"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 10, "reports.descriptionPlaceholder"))("ngModel", ctx_r1.reportDescription());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.reportError() ? 11 : -1);
} }
function OpportunityRoomComponent_Conditional_6_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 142);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_6_Conditional_19_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.submitProjectReport()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.reportSubmitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.reportSubmitting() ? i0.ɵɵpipeBind1(2, 2, "reports.submitting") : i0.ɵɵpipeBind1(3, 4, "reports.submit"), " ");
} }
function OpportunityRoomComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "section", 128)(2, "header", 129)(3, "p", 130);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2", 122);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 131);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 132);
    i0.ɵɵconditionalCreate(12, OpportunityRoomComponent_Conditional_6_Conditional_12_Template, 3, 3, "div", 133)(13, OpportunityRoomComponent_Conditional_6_Conditional_13_Template, 12, 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "footer", 134)(15, "button", 135);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_6_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(19, OpportunityRoomComponent_Conditional_6_Conditional_19_Template, 4, 6, "button", 136);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "reports.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 8, "reports.actions.reportProject"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.title());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.reportSuccess() ? 12 : 13);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.reportSuccess() ? i0.ɵɵpipeBind1(17, 10, "common.close") : i0.ɵɵpipeBind1(18, 12, "reports.cancel"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r1.reportSuccess() ? 19 : -1);
} }
function OpportunityRoomComponent_Conditional_7_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 149);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.actionError());
} }
function OpportunityRoomComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "section", 143)(2, "h2", 39);
    i0.ɵɵtext(3, "Add Update");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 51);
    i0.ɵɵtext(5, "Operational communication for participants.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 144)(7, "input", 145);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_7_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setUpdateTitle($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "textarea", 146);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_7_Template_textarea_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setUpdateContent($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "label", 147)(10, "input", 148);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_7_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setUpdateIsPublic($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵtext(11, " Public update ");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(12, OpportunityRoomComponent_Conditional_7_Conditional_12_Template, 2, 1, "p", 149);
    i0.ɵɵelementStart(13, "div", 150)(14, "button", 33);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_7_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeActionModals()); });
    i0.ɵɵtext(15, "Cancel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 123);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_7_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.submitUpdate()); });
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngModel", ctx_r1.updateForm().title);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngModel", ctx_r1.updateForm().content);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.updateForm().isPublic);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.actionError() ? 12 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.isSubmittingAction());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.isSubmittingAction() ? "Saving..." : "Add Update");
} }
function OpportunityRoomComponent_Conditional_8_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 149);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.actionError());
} }
function OpportunityRoomComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r31 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "section", 143)(2, "h2", 39);
    i0.ɵɵtext(3, "Add Milestone");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 51);
    i0.ɵɵtext(5, "Strategic project evolution. This creates a real Timeline event.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 144)(7, "input", 151);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_8_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setMilestoneTitle($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "textarea", 152);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_8_Template_textarea_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setMilestoneDescription($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "label", 147)(10, "input", 148);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_8_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setMilestoneIsPublic($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵtext(11, " Public milestone ");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(12, OpportunityRoomComponent_Conditional_8_Conditional_12_Template, 2, 1, "p", 149);
    i0.ɵɵelementStart(13, "div", 150)(14, "button", 33);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_8_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeActionModals()); });
    i0.ɵɵtext(15, "Cancel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 123);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_8_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.submitMilestone()); });
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngModel", ctx_r1.milestoneForm().title);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngModel", ctx_r1.milestoneForm().description);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.milestoneForm().isPublic);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.actionError() ? 12 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.isSubmittingAction());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.isSubmittingAction() ? "Saving..." : "Add Milestone");
} }
function OpportunityRoomComponent_Conditional_9_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 149);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.actionError());
} }
function OpportunityRoomComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "section", 143)(2, "h2", 39);
    i0.ɵɵtext(3, "Add Document");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 51);
    i0.ɵɵtext(5, "Uploads use Investa FileStore, then the document reference is attached to the Opportunity.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 144)(7, "input", 153);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_9_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setDocumentTitle($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "input", 154);
    i0.ɵɵlistener("change", function OpportunityRoomComponent_Conditional_9_Template_input_change_8_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onDocumentFileSelected($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "select", 155);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_9_Template_select_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setDocumentVisibility($event)); });
    i0.ɵɵelementStart(10, "option", 156);
    i0.ɵɵtext(11, "Private");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option", 157);
    i0.ɵɵtext(13, "Public");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "select", 155);
    i0.ɵɵlistener("ngModelChange", function OpportunityRoomComponent_Conditional_9_Template_select_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setDocumentPurpose($event)); });
    i0.ɵɵelementStart(15, "option", 158);
    i0.ɵɵtext(16, "Private Document");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "option", 159);
    i0.ɵɵtext(18, "Public Document");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "option", 160);
    i0.ɵɵtext(20, "Financial Report");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "option", 161);
    i0.ɵɵtext(22, "Contract");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "option", 162);
    i0.ɵɵtext(24, "Legal");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option", 163);
    i0.ɵɵtext(26, "Internal File");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "option", 164);
    i0.ɵɵtext(28, "General");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(29, OpportunityRoomComponent_Conditional_9_Conditional_29_Template, 2, 1, "p", 149);
    i0.ɵɵelementStart(30, "div", 150)(31, "button", 33);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_9_Template_button_click_31_listener() { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeActionModals()); });
    i0.ɵɵtext(32, "Cancel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "button", 123);
    i0.ɵɵlistener("click", function OpportunityRoomComponent_Conditional_9_Template_button_click_33_listener() { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.submitDocument()); });
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngModel", ctx_r1.documentForm().title);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.documentForm().visibility);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngModel", ctx_r1.documentForm().purpose);
    i0.ɵɵadvance(15);
    i0.ɵɵconditional(ctx_r1.actionError() ? 29 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.isSubmittingAction());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.isSubmittingAction() ? "Uploading..." : "Add Document");
} }
const RECENT_ACTIVITY_LIMIT = 5;
export class OpportunityRoomComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.opportunityService = inject(OpportunityService);
        this.fileStore = inject(FileStoreService);
        this.reportService = inject(ReportService);
        this.languageService = inject(LanguageService);
        this.contractService = inject(ContractService);
        this.sanitizer = inject(DomSanitizer);
        this.requestsService = inject(RequestsService);
        this.room = signal(null, ...(ngDevMode ? [{ debugName: "room" }] : []));
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
        this.activeTab = signal('overview', ...(ngDevMode ? [{ debugName: "activeTab" }] : []));
        this.actionError = signal(null, ...(ngDevMode ? [{ debugName: "actionError" }] : []));
        this.actionSuccess = signal(null, ...(ngDevMode ? [{ debugName: "actionSuccess" }] : []));
        this.isSubmittingAction = signal(false, ...(ngDevMode ? [{ debugName: "isSubmittingAction" }] : []));
        this.showAllRecentActivity = signal(false, ...(ngDevMode ? [{ debugName: "showAllRecentActivity" }] : []));
        this.updateModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "updateModalOpen" }] : []));
        this.documentModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "documentModalOpen" }] : []));
        this.milestoneModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "milestoneModalOpen" }] : []));
        this.updateForm = signal({ title: '', content: '', isPublic: false }, ...(ngDevMode ? [{ debugName: "updateForm" }] : []));
        this.milestoneForm = signal({ title: '', description: '', isPublic: true }, ...(ngDevMode ? [{ debugName: "milestoneForm" }] : []));
        this.documentForm = signal({
            title: '',
            visibility: 'Private',
            purpose: 'PrivateDocument',
            category: 'OpportunityPrivateDocument',
            searchTags: ''
        }, ...(ngDevMode ? [{ debugName: "documentForm" }] : []));
        this.selectedDocumentFile = signal(null, ...(ngDevMode ? [{ debugName: "selectedDocumentFile" }] : []));
        this.reportModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "reportModalOpen" }] : []));
        this.reportSubmitting = signal(false, ...(ngDevMode ? [{ debugName: "reportSubmitting" }] : []));
        this.reportSuccess = signal(false, ...(ngDevMode ? [{ debugName: "reportSuccess" }] : []));
        this.reportError = signal(null, ...(ngDevMode ? [{ debugName: "reportError" }] : []));
        this.reportReason = signal('Spam', ...(ngDevMode ? [{ debugName: "reportReason" }] : []));
        this.reportDescription = signal('', ...(ngDevMode ? [{ debugName: "reportDescription" }] : []));
        this.contracts = signal([], ...(ngDevMode ? [{ debugName: "contracts" }] : []));
        this.contractsLoading = signal(false, ...(ngDevMode ? [{ debugName: "contractsLoading" }] : []));
        this.contractsLoaded = signal(false, ...(ngDevMode ? [{ debugName: "contractsLoaded" }] : []));
        this.contractsError = signal(null, ...(ngDevMode ? [{ debugName: "contractsError" }] : []));
        this.selectedContract = signal(null, ...(ngDevMode ? [{ debugName: "selectedContract" }] : []));
        this.selectedVersion = signal(null, ...(ngDevMode ? [{ debugName: "selectedVersion" }] : []));
        this.contractDetailsLoading = signal(false, ...(ngDevMode ? [{ debugName: "contractDetailsLoading" }] : []));
        this.contractDetailsError = signal(null, ...(ngDevMode ? [{ debugName: "contractDetailsError" }] : []));
        this.previewModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "previewModalOpen" }] : []));
        this.previewHtml = signal(null, ...(ngDevMode ? [{ debugName: "previewHtml" }] : []));
        this.previewLoading = signal(false, ...(ngDevMode ? [{ debugName: "previewLoading" }] : []));
        this.previewError = signal(null, ...(ngDevMode ? [{ debugName: "previewError" }] : []));
        this.pdfDownloading = signal(null, ...(ngDevMode ? [{ debugName: "pdfDownloading" }] : []));
        this.pdfStatusOverrides = signal({}, ...(ngDevMode ? [{ debugName: "pdfStatusOverrides" }] : []));
        this.reportReasons = [
            'SuspiciousOpportunity',
            'MisleadingInformation',
            'Spam',
            'Abuse',
            'FraudConcern',
            'InappropriateContent',
            'Other'
        ];
        this.tabs = [
            { id: 'overview', label: 'Overview' },
            { id: 'contracts', label: '' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'documents', label: 'Documents' },
            { id: 'media', label: 'Media' },
            { id: 'updates', label: 'Updates' }
        ];
        this.overview = computed(() => (this.room()?.overview ?? {}), ...(ngDevMode ? [{ debugName: "overview" }] : []));
        this.participantContext = computed(() => (this.room()?.participantContext ?? {}), ...(ngDevMode ? [{ debugName: "participantContext" }] : []));
        this.documents = computed(() => this.flattenLibrary(this.room()?.documentsLibrary ?? this.room()?.documents), ...(ngDevMode ? [{ debugName: "documents" }] : []));
        this.media = computed(() => this.flattenLibrary(this.room()?.mediaLibrary ?? this.room()?.media), ...(ngDevMode ? [{ debugName: "media" }] : []));
        this.milestones = computed(() => this.flattenLibrary(this.room()?.milestones), ...(ngDevMode ? [{ debugName: "milestones" }] : []));
        this.timeline = computed(() => {
            return this.milestones().map(milestone => this.milestoneToEvent(milestone));
        }, ...(ngDevMode ? [{ debugName: "timeline" }] : []));
        this.updates = computed(() => {
            const updateTypes = ['update', 'projectupdate', 'founderupdate', 'announcement', 'progressupdate'];
            return this.flattenLibrary(this.room()?.timeline ?? this.room()?.events)
                .filter(item => updateTypes.includes(this.eventType(item).toLowerCase().replace(/\s+/g, '')));
        }, ...(ngDevMode ? [{ debugName: "updates" }] : []));
        this.milestonesSorted = computed(() => this.sortMilestonesByDateDesc(this.milestones()), ...(ngDevMode ? [{ debugName: "milestonesSorted" }] : []));
        this.timelineSorted = computed(() => this.milestonesSorted().map(milestone => this.milestoneToEvent(milestone)), ...(ngDevMode ? [{ debugName: "timelineSorted" }] : []));
        this.updatesSorted = computed(() => this.sortEventsByDateDesc(this.updates()), ...(ngDevMode ? [{ debugName: "updatesSorted" }] : []));
        this.documentsSorted = computed(() => this.sortByDateDesc(this.documents(), item => this.documentRawDate(item)), ...(ngDevMode ? [{ debugName: "documentsSorted" }] : []));
        this.mediaSorted = computed(() => this.sortByDateDesc(this.media(), item => this.mediaRawDate(item)), ...(ngDevMode ? [{ debugName: "mediaSorted" }] : []));
        this.documentGroups = computed(() => this.groupDocuments(this.documents()), ...(ngDevMode ? [{ debugName: "documentGroups" }] : []));
        this.mediaGroups = computed(() => this.groupMedia(this.media()), ...(ngDevMode ? [{ debugName: "mediaGroups" }] : []));
        this.latestMilestone = computed(() => this.room()?.latestMilestone ?? this.milestonesSorted()[0] ?? null, ...(ngDevMode ? [{ debugName: "latestMilestone" }] : []));
        this.recentActivity = computed(() => this.activityFeed().sort((a, b) => b.dateValue - a.dateValue), ...(ngDevMode ? [{ debugName: "recentActivity" }] : []));
        this.displayedRecentActivity = computed(() => {
            const items = this.recentActivity();
            return this.showAllRecentActivity() ? items : items.slice(0, RECENT_ACTIVITY_LIMIT);
        }, ...(ngDevMode ? [{ debugName: "displayedRecentActivity" }] : []));
        this.hasMoreRecentActivity = computed(() => this.recentActivity().length > RECENT_ACTIVITY_LIMIT, ...(ngDevMode ? [{ debugName: "hasMoreRecentActivity" }] : []));
        this.recommendedNextSteps = computed(() => {
            const steps = [];
            const context = this.participantContext();
            const latest = this.latestMilestone();
            if (!context.canViewPrivateFiles) {
                steps.push('Review public documents first, then request private-room permissions if needed.');
            }
            if (this.documents().length === 0) {
                steps.push('No documents are available yet. Watch this room for founder uploads.');
            }
            else if (!context.canDownloadFiles) {
                steps.push('Use in-browser preview links while downloads are restricted for your current role.');
            }
            else {
                steps.push('Download and review the latest documents before your next founder conversation.');
            }
            if (this.timeline().length > 0) {
                steps.push('Review milestones to understand strategic progress before evaluating new updates.');
            }
            if (latest) {
                steps.push('Review the latest milestone to understand what changed most recently.');
            }
            if (steps.length === 0) {
                steps.push('Check back soon for new milestones, updates, or documents in this room.');
            }
            return steps.slice(0, 4);
        }, ...(ngDevMode ? [{ debugName: "recommendedNextSteps" }] : []));
        void this.load();
        effect(() => {
            if (this.requestsService.participationRevision() > 0)
                void this.load();
        });
    }
    async load() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id)
            return;
        try {
            this.isLoading.set(true);
            this.error.set(null);
            this.room.set(await this.opportunityService.getOpportunityRoom(id));
            this.resetContractState();
            await this.loadContracts(true);
        }
        catch (error) {
            this.room.set(null);
            this.error.set(this.toRoomError(error));
        }
        finally {
            this.isLoading.set(false);
        }
    }
    setTab(tab) {
        this.activeTab.set(tab);
        if (tab === 'contracts') {
            void this.loadContracts();
        }
    }
    showAllRecent() {
        this.showAllRecentActivity.set(true);
    }
    showRecentSummary() {
        this.showAllRecentActivity.set(false);
    }
    opportunityId() {
        return this.overview().id || this.route.snapshot.paramMap.get('id');
    }
    isFounder() {
        return this.participantContext().isFounder === true || this.roomRole() === 'Founder';
    }
    canReportProject() {
        return !!this.opportunityId() && !this.isFounder();
    }
    approvedParticipantCount() {
        return this.numberValue(this.overview().approvedParticipantCount);
    }
    canEditCoreProject() {
        return this.participantContext().canEditCoreProject === true;
    }
    canAddUpdate() {
        return this.participantContext().canAddUpdate === true;
    }
    canAddDocument() {
        return this.participantContext().canAddDocument === true;
    }
    canAddMilestone() {
        return this.participantContext().canAddMilestone === true;
    }
    coreEditMessage() {
        return this.canEditCoreProject()
            ? this.t('opportunityRoom.founderWorkspace.editAvailable')
            : this.t('opportunityRoom.founderWorkspace.lockedMessage');
    }
    openUpdateModal() {
        this.actionError.set(null);
        this.actionSuccess.set(null);
        this.updateModalOpen.set(true);
    }
    openDocumentModal() {
        this.actionError.set(null);
        this.actionSuccess.set(null);
        this.documentModalOpen.set(true);
    }
    openProjectReport() {
        if (!this.canReportProject())
            return;
        this.reportReason.set('Spam');
        this.reportDescription.set('');
        this.reportError.set(null);
        this.reportSuccess.set(false);
        this.reportModalOpen.set(true);
    }
    closeReportModal() {
        if (this.reportSubmitting())
            return;
        this.reportModalOpen.set(false);
        this.reportError.set(null);
        this.reportSuccess.set(false);
    }
    setReportReason(reason) {
        this.reportReason.set(reason);
    }
    setReportDescription(description) {
        this.reportDescription.set(description);
    }
    reportReasonLabel(reason) {
        return this.t(`reports.reasons.${reason}`);
    }
    async submitProjectReport() {
        const opportunityId = this.opportunityId();
        if (!opportunityId || this.reportSubmitting() || !this.canReportProject())
            return;
        try {
            this.reportSubmitting.set(true);
            this.reportError.set(null);
            await this.reportService.createReport({
                targetType: 'Opportunity',
                targetId: opportunityId,
                reasonCode: this.reportReason(),
                description: this.reportDescription().trim() || null
            });
            this.reportSuccess.set(true);
        }
        catch (error) {
            this.reportError.set(this.reportErrorMessage(error));
        }
        finally {
            this.reportSubmitting.set(false);
        }
    }
    async loadContracts(force = false) {
        const opportunityId = this.opportunityId();
        if (!opportunityId || this.contractsLoading() || (this.contractsLoaded() && !force))
            return;
        try {
            this.contractsLoading.set(true);
            this.contractsError.set(null);
            const contracts = await this.contractService.getOpportunityContracts(opportunityId);
            this.contracts.set(contracts);
            this.contractsLoaded.set(true);
            if (!this.selectedContract() && contracts.length > 0) {
                await this.openContractDetails(contracts[0]);
            }
        }
        catch (error) {
            this.contracts.set([]);
            this.contractsLoaded.set(true);
            this.contractsError.set(this.contractErrorMessage(error));
        }
        finally {
            this.contractsLoading.set(false);
        }
    }
    resetContractState() {
        this.contracts.set([]);
        this.contractsLoaded.set(false);
        this.contractsError.set(null);
        this.selectedContract.set(null);
        this.selectedVersion.set(null);
        this.contractDetailsError.set(null);
    }
    async openContractDetails(contract) {
        if (this.contractDetailsLoading())
            return;
        try {
            this.contractDetailsLoading.set(true);
            this.contractDetailsError.set(null);
            const detail = await this.contractService.getContract(contract.contractId);
            this.selectedContract.set(detail);
            this.selectedVersion.set(detail.currentVersion);
        }
        catch (error) {
            this.contractDetailsError.set(this.contractErrorMessage(error));
        }
        finally {
            this.contractDetailsLoading.set(false);
        }
    }
    async openContractVersion(version) {
        const detail = this.selectedContract();
        if (!detail || this.contractDetailsLoading())
            return;
        try {
            this.contractDetailsLoading.set(true);
            this.contractDetailsError.set(null);
            this.selectedVersion.set(await this.contractService.getVersion(detail.contract.contractId, version.versionNumber));
        }
        catch (error) {
            this.contractDetailsError.set(this.contractErrorMessage(error));
        }
        finally {
            this.contractDetailsLoading.set(false);
        }
    }
    async openContractPreview(version = this.selectedVersion()) {
        const detail = this.selectedContract();
        if (!detail || !version)
            return;
        this.previewModalOpen.set(true);
        this.previewLoading.set(true);
        this.previewError.set(null);
        this.previewHtml.set(null);
        try {
            const html = await this.contractService.getPreviewHtml(detail.contract.contractId, version.versionNumber);
            this.previewHtml.set(this.sanitizeContractHtml(html));
        }
        catch (error) {
            this.previewError.set(this.contractErrorMessage(error));
        }
        finally {
            this.previewLoading.set(false);
        }
    }
    closeContractPreview() {
        this.previewModalOpen.set(false);
        this.previewHtml.set(null);
        this.previewError.set(null);
    }
    printContractPreview() {
        const html = this.previewHtml();
        if (!html)
            return;
        const frame = document.createElement('iframe');
        frame.style.position = 'fixed';
        frame.style.right = '0';
        frame.style.bottom = '0';
        frame.style.width = '0';
        frame.style.height = '0';
        frame.style.border = '0';
        document.body.appendChild(frame);
        frame.contentDocument?.open();
        frame.contentDocument?.write(html);
        frame.contentDocument?.close();
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => frame.remove(), 1000);
    }
    async downloadContractPdf(version = this.selectedVersion()) {
        const detail = this.selectedContract();
        if (!detail || !version)
            return;
        const key = this.contractVersionKey(detail.contract.contractId, version.versionNumber);
        try {
            this.pdfDownloading.set(key);
            this.previewError.set(null);
            const file = await this.contractService.downloadPdf(detail.contract.contractId, version.versionNumber);
            this.saveBlob(file.blob, file.fileName);
            this.pdfStatusOverrides.update(items => ({ ...items, [key]: 2 }));
        }
        catch (error) {
            this.pdfStatusOverrides.update(items => ({ ...items, [key]: 3 }));
            this.previewError.set(this.contractErrorMessage(error));
        }
        finally {
            this.pdfDownloading.set(null);
        }
    }
    openMilestoneModal() {
        this.actionError.set(null);
        this.actionSuccess.set(null);
        this.milestoneModalOpen.set(true);
    }
    closeActionModals() {
        if (this.isSubmittingAction())
            return;
        this.updateModalOpen.set(false);
        this.documentModalOpen.set(false);
        this.milestoneModalOpen.set(false);
        this.actionError.set(null);
    }
    setUpdateTitle(title) {
        this.updateForm.update(form => ({ ...form, title }));
    }
    setUpdateContent(content) {
        this.updateForm.update(form => ({ ...form, content }));
    }
    setUpdateIsPublic(isPublic) {
        this.updateForm.update(form => ({ ...form, isPublic }));
    }
    setMilestoneTitle(title) {
        this.milestoneForm.update(form => ({ ...form, title }));
    }
    setMilestoneDescription(description) {
        this.milestoneForm.update(form => ({ ...form, description }));
    }
    setMilestoneIsPublic(isPublic) {
        this.milestoneForm.update(form => ({ ...form, isPublic }));
    }
    setDocumentTitle(title) {
        this.documentForm.update(form => ({ ...form, title }));
    }
    setDocumentVisibility(visibility) {
        this.documentForm.update(form => ({ ...form, visibility }));
    }
    setDocumentPurpose(purpose) {
        this.documentForm.update(form => ({ ...form, purpose }));
    }
    onDocumentFileSelected(event) {
        const input = event.target;
        this.selectedDocumentFile.set(input.files?.[0] ?? null);
    }
    async submitUpdate() {
        const form = this.updateForm();
        if (!form.title.trim()) {
            this.actionError.set(this.t('opportunityRoom.validation.updateTitleRequired'));
            return;
        }
        await this.createEvent('ProjectUpdate', form.title, form.content, form.isPublic, this.t('opportunityRoom.toasts.updateAdded'), () => {
            this.updateForm.set({ title: '', content: '', isPublic: false });
            this.updateModalOpen.set(false);
            this.activeTab.set('updates');
        });
    }
    async submitMilestone() {
        const form = this.milestoneForm();
        if (!form.title.trim()) {
            this.actionError.set(this.t('opportunityRoom.validation.milestoneTitleRequired'));
            return;
        }
        await this.createEvent('Milestone', form.title, form.description, form.isPublic, this.t('opportunityRoom.toasts.milestoneAdded'), () => {
            this.milestoneForm.set({ title: '', description: '', isPublic: true });
            this.milestoneModalOpen.set(false);
            this.activeTab.set('timeline');
        });
    }
    async submitDocument() {
        const opportunityId = this.opportunityId();
        const file = this.selectedDocumentFile();
        const form = this.documentForm();
        if (!opportunityId || !file) {
            this.actionError.set(this.t('opportunityRoom.validation.documentFileRequired'));
            return;
        }
        try {
            this.isSubmittingAction.set(true);
            this.actionError.set(null);
            const category = this.documentCategory(form.purpose, form.visibility);
            const uploaded = await this.fileStore.uploadFile(category, file, {
                purpose: form.purpose,
                visibility: form.visibility,
                isPublic: form.visibility === 'Public'
            });
            await this.opportunityService.createDocument(opportunityId, {
                fileId: uploaded.fileId,
                fileKey: uploaded.fileKey,
                fileUrl: uploaded.url,
                title: form.title || uploaded.originalFileName || uploaded.fileName,
                fileName: uploaded.fileName,
                fileExtension: uploaded.extension || this.extensionFromName(uploaded.fileName),
                mimeType: uploaded.mimeType,
                fileSize: uploaded.fileSize,
                category: uploaded.category,
                documentType: form.purpose,
                previewUrl: uploaded.previewUrl,
                thumbnailUrl: uploaded.thumbnailUrl,
                purpose: this.documentPurposeValue(form.purpose),
                visibility: this.documentVisibilityValue(form.visibility),
                searchTags: form.searchTags
            });
            this.actionSuccess.set(this.t('opportunityRoom.toasts.documentAdded'));
            this.documentForm.set({ title: '', visibility: 'Private', purpose: 'PrivateDocument', category: 'OpportunityPrivateDocument', searchTags: '' });
            this.selectedDocumentFile.set(null);
            this.documentModalOpen.set(false);
            this.activeTab.set('documents');
            await this.refreshRoomData();
        }
        catch (error) {
            this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.toasts.documentAddFailed'));
        }
        finally {
            this.isSubmittingAction.set(false);
        }
    }
    title() {
        const overview = this.overview();
        return overview.title || overview.name || overview.businessName || this.t('opportunityRoom.title');
    }
    description() {
        const overview = this.overview();
        return overview.shortDescription || overview.description || overview.fullDescription || '-';
    }
    status() {
        return this.overview().status || '-';
    }
    stage() {
        return this.overview().projectStage || this.overview().stage || '-';
    }
    investmentModel() {
        return this.overview().investmentModel || this.overview().model || '-';
    }
    investmentModelKey() {
        const model = this.overview().investmentModel || this.overview().model || '';
        if (model === 'Equity' || model === '1' || model === 1)
            return 'investments.type.equity';
        if (model === 'Loan' || model === '2' || model === 2)
            return 'investments.type.loan';
        if (model === 'ProfitSharing' || model === '3' || model === 3)
            return 'investments.type.revenueSharing';
        if (model === 'Founding' || model === 'Founding')
            return 'investments.type.founding';
        return '';
    }
    statusKey() {
        const status = this.overview().status || '';
        return status ? `investments.status.${status.toLowerCase()}` : '';
    }
    stageKey() {
        const stage = this.overview().projectStage || this.overview().stage || '';
        return stage ? `opportunity.stage.${stage.toLowerCase()}` : '';
    }
    fundingTarget() {
        return this.numberValue(this.overview().fundingTarget);
    }
    fundedAmount() {
        return this.numberValue(this.overview().fundedAmount);
    }
    remainingFundingAmount() {
        return this.numberValue(this.overview().remainingFundingAmount);
    }
    fundingProgress() {
        return this.numberValue(this.overview().fundingProgressPercentage);
    }
    fundingProgressBarWidth() {
        const progress = this.fundingProgress();
        if (progress === null)
            return 0;
        return Math.max(0, Math.min(100, progress));
    }
    minimumParticipation() {
        return this.numberValue(this.overview().minimumInvestment ?? this.overview().minimumInvestmentAmount ?? this.overview().minInvestment);
    }
    founderSummary() {
        const overview = this.overview();
        const founder = overview.founder;
        if (overview.founderSummary)
            return overview.founderSummary;
        if (founder?.summary)
            return founder.summary;
        if (founder?.displayName || founder?.fullName || founder?.name)
            return founder.displayName || founder.fullName || founder.name || '';
        return '-';
    }
    founderProfileId() {
        const overview = this.overview();
        const id = overview.founderId ?? overview.founder?.userId ?? overview.founder?.id;
        const value = String(id ?? '').trim();
        return value === 'undefined' || value === 'null' ? '' : value;
    }
    roomRole() {
        const context = this.participantContext();
        if (context.isFounder)
            return this.t('opportunityRoom.role.founder');
        if (context.isApprovedParticipant)
            return this.t('opportunityRoom.role.approvedInvestor');
        const role = context.role || context.userRole || context.roomRole;
        if (!role)
            return '-';
        return role === 'ApprovedInvestor' ? this.t('opportunityRoom.role.approvedInvestor') : String(role);
    }
    roomRoleKey() {
        const context = this.participantContext();
        if (context.isFounder)
            return 'opportunityRoom.role.founder';
        if (context.isApprovedParticipant)
            return 'opportunityRoom.role.approvedInvestor';
        const role = context.role || context.userRole || context.roomRole;
        if (!role)
            return '';
        return role === 'ApprovedInvestor' ? 'opportunityRoom.role.approvedInvestor' : '';
    }
    permissionLabel(value) {
        return value ? this.t('opportunityRoom.fallback.allowed') : this.t('opportunityRoom.fallback.notAllowed');
    }
    money(value) {
        if (value === null || value === undefined || Number.isNaN(value))
            return '-';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    }
    fileSize(bytes) {
        if (!bytes)
            return '-';
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    fileTitle(item) {
        const file = item;
        return file.title || file.name || file.originalFileName || file.fileName || this.t('opportunityRoom.fallback.file');
    }
    extension(item) {
        return (item.fileExtension || this.extensionFromName(item.fileName) || 'FILE').replace('.', '').toUpperCase();
    }
    visibility(item) {
        if ('visibility' in item && item.visibility) {
            const vis = String(item.visibility);
            if (vis === 'Public')
                return this.t('opportunityRoom.badges.public');
            if (vis === 'Private')
                return this.t('opportunityRoom.badges.private');
            return vis;
        }
        if (item.isPublic === true)
            return this.t('opportunityRoom.badges.public');
        if (item.isPublic === false)
            return this.t('opportunityRoom.badges.private');
        return '-';
    }
    uploadedDate(item) {
        const raw = item.uploadedAt || item.createdAt || item.date;
        if (!raw)
            return '-';
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
    }
    previewUrl(item) {
        if (item.previewUrl)
            return this.fileStore.getPublicUrl(item.previewUrl);
        if (item.fileUrl)
            return this.fileStore.getPublicUrl(item.fileUrl);
        return item.category && item.fileName ? this.fileStore.getPreviewUrl(item.category, item.fileName) : '';
    }
    downloadUrl(item) {
        if (item.category && item.fileName)
            return this.fileStore.getDownloadUrl(item.category, item.fileName);
        return item.fileUrl || '';
    }
    contractListSubtitle() {
        return this.isFounder() ? this.t('contracts.room.founderListHelper') : this.t('contracts.room.investorListHelper');
    }
    contractStatusLabel(status) {
        return this.contractEnumLabel('contracts.status', status);
    }
    versionTypeLabel(type) {
        return this.contractEnumLabel('contracts.versionTypes', type);
    }
    versionStatusLabel(status) {
        return this.contractEnumLabel('contracts.versionStatus', status);
    }
    pdfStatusLabel(status) {
        return this.contractEnumLabel('contracts.pdfStatus', status);
    }
    currentPdfStatus(version) {
        const detail = this.selectedContract();
        if (!detail || !version)
            return 0;
        const key = this.contractVersionKey(detail.contract.contractId, version.versionNumber);
        return this.pdfStatusOverrides()[key] ?? ('pdfStatus' in version ? version.pdfStatus : 0);
    }
    contractVersionKey(contractId, versionNumber) {
        return `${contractId}:${versionNumber}`;
    }
    versionBadgeLabel(version) {
        return version.versionNumber === this.selectedContract()?.contract.currentVersionNumber
            ? this.t('contracts.badges.current')
            : this.t('contracts.badges.previous');
    }
    contractDate(raw) {
        if (!raw)
            return '-';
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
    }
    selectedTermsSummary() {
        return this.termsSummary(this.selectedVersion()?.termsSnapshotJson);
    }
    selectedChangesSummary() {
        const changes = this.parseJsonRecord(this.selectedVersion()?.changesSnapshotJson);
        if (!changes)
            return this.t('contracts.empty.noChangesSummary');
        const lines = Object.entries(changes)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${this.humanizeKey(key)}: ${this.displayJsonValue(value)}`);
        return lines.length ? lines.join('\n') : this.t('contracts.empty.noChangesSummary');
    }
    sourceParticipationReference() {
        return this.readTermsValue(['sourceParticipationRequestId', 'SourceParticipationRequestId', 'participationRequestId', 'ParticipationRequestId']);
    }
    acceptedOfferReference() {
        return this.readTermsValue(['acceptedOfferId', 'AcceptedOfferId', 'acceptedOfferReference', 'AcceptedOfferReference']);
    }
    effectiveDate() {
        return this.contractDate(this.selectedVersion()?.activatedAt || this.selectedVersion()?.createdAt);
    }
    isPdfDownloading(version) {
        const detail = this.selectedContract();
        return !!detail && !!version && this.pdfDownloading() === this.contractVersionKey(detail.contract.contractId, version.versionNumber);
    }
    mediaUrl(item) {
        return this.fileStore.getPublicUrl(item.thumbnailUrl || item.previewUrl || item.fileUrl || '');
    }
    isImage(item) {
        return (item.mimeType || '').toLowerCase().startsWith('image') || /\.(png|jpe?g|webp|gif)$/i.test(item.fileName || item.fileUrl || '');
    }
    isVideo(item) {
        return (item.mimeType || '').toLowerCase().startsWith('video') || /\.(mp4|mov|webm)$/i.test(item.fileName || item.fileUrl || '');
    }
    eventTitle(item) {
        return item.title || this.eventType(item) || this.t('opportunityRoom.fallback.projectUpdate');
    }
    eventType(item) {
        return item.eventType || item.type || this.t('opportunityRoom.fallback.update');
    }
    eventDate(item) {
        const raw = item.eventDate || item.date || item.createdAt;
        if (!raw)
            return '-';
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
    }
    milestoneTitle(item) {
        return item.title || this.t('opportunityRoom.milestones.untitled');
    }
    milestoneDescription(item) {
        return item.description || this.t('opportunityRoom.milestones.noDescription');
    }
    milestoneDate(item) {
        const raw = item.completedAt || item.targetDate || item.createdAt;
        if (!raw)
            return '-';
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
    }
    activityKindLabel(kind) {
        if (kind === 'milestone')
            return this.t('opportunityRoom.fallback.milestoneUpdate');
        if (kind === 'update')
            return this.t('opportunityRoom.fallback.update');
        if (kind === 'document')
            return this.t('opportunityRoom.fallback.publicDocument');
        return this.t('opportunityRoom.fallback.publicMedia');
    }
    activityKindClass(kind) {
        if (kind === 'milestone')
            return 'investa-badge-accent';
        if (kind === 'update')
            return '';
        if (kind === 'document')
            return 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-200';
        return '';
    }
    participationAccessText() {
        const context = this.participantContext();
        if (context.isApprovedParticipant || context.canAccessProjectRoom) {
            return this.t('opportunityRoom.participationSummary.activeAccess');
        }
        return this.t('opportunityRoom.participationSummary.limitedAccess');
    }
    investmentTermsSummary() {
        const overview = this.overview();
        if (overview.publicInvestmentTermsSummary)
            return overview.publicInvestmentTermsSummary;
        if (overview.expectedReturnSummary)
            return overview.expectedReturnSummary;
        return this.t('opportunityRoom.investmentTerms.fallback');
    }
    latestPublicUpdateSummary() {
        const overview = this.overview();
        return overview.latestPublicUpdate || this.t('opportunityRoom.publicUpdate.empty');
    }
    flattenLibrary(library) {
        if (!library)
            return [];
        if (Array.isArray(library)) {
            return library.flatMap((item) => Array.isArray(item?.items) ? item.items : [item]).filter(Boolean);
        }
        return Object.values(library).flat().filter(Boolean);
    }
    sortEventsByDateDesc(items) {
        return [...items].sort((a, b) => this.dateValueFromRaw(b.eventDate || b.date || b.createdAt) - this.dateValueFromRaw(a.eventDate || a.date || a.createdAt));
    }
    sortMilestonesByDateDesc(items) {
        return [...items].sort((a, b) => this.milestoneDateValue(b) - this.milestoneDateValue(a));
    }
    sortByDateDesc(items, getRawDate) {
        return [...items].sort((a, b) => this.dateValueFromRaw(getRawDate(b)) - this.dateValueFromRaw(getRawDate(a)));
    }
    activityFeed() {
        const milestones = this.timeline().map((item, index) => ({
            trackKey: `milestone:${item.id ?? item.eventDate ?? item.createdAt ?? 'na'}:${index}`,
            kind: 'milestone',
            title: this.eventTitle(item),
            detail: item.description || 'Milestone update.',
            dateText: this.eventDate(item),
            dateValue: this.dateValueFromRaw(item.eventDate || item.date || item.createdAt)
        }));
        const updates = this.updates().map((item, index) => ({
            trackKey: `update:${item.id ?? item.eventDate ?? item.createdAt ?? 'na'}:${index}`,
            kind: 'update',
            title: this.eventTitle(item),
            detail: item.description || 'Founder update.',
            dateText: this.eventDate(item),
            dateValue: this.dateValueFromRaw(item.eventDate || item.date || item.createdAt)
        }));
        const documents = this.documents().map((item, index) => ({
            trackKey: `document:${item.id ?? item.fileId ?? item.fileKey ?? item.fileName ?? 'na'}:${index}`,
            kind: 'document',
            title: this.fileTitle(item),
            detail: `${this.visibility(item)} document`,
            dateText: this.uploadedDate(item),
            dateValue: this.dateValueFromRaw(this.documentRawDate(item))
        }));
        const media = this.media().map((item, index) => ({
            trackKey: `media:${item.id ?? item.fileId ?? item.fileKey ?? item.fileName ?? 'na'}:${index}`,
            kind: 'media',
            title: this.fileTitle(item),
            detail: `${this.visibility(item)} media`,
            dateText: this.uploadedDate(item),
            dateValue: this.dateValueFromRaw(this.mediaRawDate(item))
        }));
        return [...milestones, ...updates, ...documents, ...media].filter(item => item.dateValue > 0);
    }
    milestoneToEvent(milestone) {
        return {
            id: milestone.milestoneId ?? milestone.id,
            title: milestone.title,
            description: milestone.description,
            eventDate: milestone.completedAt ?? milestone.targetDate ?? milestone.createdAt,
            createdAt: milestone.createdAt,
            eventType: 'Milestone',
            type: milestone.status ?? 'Milestone',
            isPublic: true
        };
    }
    milestoneDateValue(milestone) {
        return this.dateValueFromRaw(milestone.completedAt || milestone.targetDate || milestone.createdAt);
    }
    dateValueFromRaw(raw) {
        if (!raw)
            return 0;
        const date = new Date(String(raw));
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    }
    documentRawDate(item) {
        const source = item;
        return source.uploadedAt || source.createdAt || source.date;
    }
    mediaRawDate(item) {
        const source = item;
        return source.uploadedAt || source.createdAt || source.date;
    }
    async createEvent(eventType, title, description, isPublic, successMessage, onSuccess) {
        const opportunityId = this.opportunityId();
        if (!opportunityId)
            return;
        try {
            this.isSubmittingAction.set(true);
            this.actionError.set(null);
            await this.opportunityService.createEvent(opportunityId, {
                eventType,
                title: title.trim(),
                description: description?.trim() || null,
                isPublic
            });
            this.actionSuccess.set(successMessage);
            onSuccess();
            await this.refreshRoomData();
        }
        catch (error) {
            this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.toasts.saveFailed'));
        }
        finally {
            this.isSubmittingAction.set(false);
        }
    }
    documentCategory(purpose, visibility) {
        if (purpose === 'PublicDocument' || visibility === 'Public')
            return 'OpportunityPublicDocument';
        if (purpose === 'FinancialReport')
            return 'FinancialReport';
        if (purpose === 'Contract')
            return 'Contract';
        if (purpose === 'Legal')
            return 'Legal';
        return 'OpportunityPrivateDocument';
    }
    documentPurposeValue(purpose) {
        const values = {
            Cover: 1,
            Gallery: 2,
            PitchVideo: 3,
            PublicDocument: 4,
            PrivateDocument: 5,
            FinancialReport: 6,
            Contract: 7,
            Legal: 8,
            InternalFile: 9,
            ProjectUpdateMedia: 10,
            General: 11
        };
        return values[purpose] ?? values.PrivateDocument;
    }
    documentVisibilityValue(visibility) {
        return visibility === 'Public' ? 1 : 2;
    }
    async refreshRoomData() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id)
            return;
        this.room.set(await this.opportunityService.getOpportunityRoom(id));
    }
    groupDocuments(documents) {
        const groups = [
            { label: 'Public Documents', keys: ['PublicDocument', 'OpportunityPublicDocument', '4'] },
            { label: 'Private Documents', keys: ['PrivateDocument', 'OpportunityPrivateDocument', '5'] },
            { label: 'Financial Reports', keys: ['FinancialReport', '6'] },
            { label: 'Contracts', keys: ['Contract', '7'] },
            { label: 'Legal', keys: ['Legal', '8'] },
            { label: 'Internal Files', keys: ['InternalFile', '9'] },
            { label: 'General', keys: ['General', '11'] }
        ];
        return groups
            .map(group => ({ label: group.label, items: documents.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
            .filter(group => group.items.length > 0);
    }
    groupMedia(media) {
        const groups = [
            { label: 'Cover', keys: ['Cover', '1'] },
            { label: 'Gallery', keys: ['Gallery', '2'] },
            { label: 'Pitch Video', keys: ['PitchVideo', '3'] },
            { label: 'Project Update Media', keys: ['ProjectUpdateMedia', '10'] },
            { label: 'General', keys: ['General', '11'] }
        ];
        return groups
            .map(group => ({ label: group.label, items: media.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
            .filter(group => group.items.length > 0);
    }
    numberValue(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    }
    extensionFromName(name) {
        if (!name || !name.includes('.'))
            return '';
        return name.split('.').pop() || '';
    }
    reportErrorMessage(error) {
        const raw = error?.error?.message || error?.message || '';
        const status = error?.status;
        const normalized = String(raw).toLowerCase();
        if (status === 409 || normalized.includes('duplicate') || normalized.includes('pending report')) {
            return this.t('reports.errors.duplicate');
        }
        if (status === 400 && (normalized.includes('self') || normalized.includes('own'))) {
            return this.t('reports.errors.selfReport');
        }
        if (status === 404 || normalized.includes('invalid target')) {
            return this.t('reports.errors.invalidTarget');
        }
        return this.t('reports.errors.generic');
    }
    contractErrorMessage(error) {
        const status = error?.status;
        const raw = error?.error?.message || error?.message || '';
        const normalized = String(raw).toLowerCase();
        if (status === 403 || normalized.includes('access denied'))
            return this.t('contracts.errors.accessDenied');
        if (status === 404 || normalized.includes('not found'))
            return this.t('contracts.errors.notFound');
        if (status === 409 || normalized.includes('generating'))
            return this.t('contracts.errors.pdfGenerating');
        return this.t('contracts.errors.generic');
    }
    sanitizeContractHtml(html) {
        const withoutScripts = html
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
            .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
            .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '');
        return this.sanitizer.sanitize(SecurityContext.HTML, withoutScripts) ?? '';
    }
    saveBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
    termsSummary(raw) {
        const terms = this.parseJsonRecord(raw);
        if (!terms)
            return [];
        const preferredKeys = [
            'contractNumber',
            'investmentModel',
            'requestedAmount',
            'numberOfShares',
            'sharePrice',
            'proposedSharePercentage',
            'profitSharePercentage',
            'returnRate',
            'termMonths',
            'repaymentModel',
            'contractStartDate',
            'contractEndDate',
            'acceptedOfferId',
            'sourceParticipationRequestId'
        ];
        const entries = preferredKeys
            .filter(key => terms[key] !== null && terms[key] !== undefined && terms[key] !== '')
            .map(key => ({ label: this.humanizeKey(key), value: this.displayJsonValue(terms[key]) }));
        if (entries.length > 0)
            return entries;
        return Object.entries(terms)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .slice(0, 8)
            .map(([key, value]) => ({ label: this.humanizeKey(key), value: this.displayJsonValue(value) }));
    }
    readTermsValue(keys) {
        const terms = this.parseJsonRecord(this.selectedVersion()?.termsSnapshotJson);
        if (!terms)
            return '-';
        for (const key of keys) {
            const value = terms[key];
            if (value !== null && value !== undefined && value !== '')
                return this.displayJsonValue(value);
        }
        return '-';
    }
    parseJsonRecord(raw) {
        if (!raw)
            return null;
        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
    displayJsonValue(value) {
        if (value === null || value === undefined || value === '')
            return '-';
        if (typeof value === 'number')
            return Number.isFinite(value) ? String(value) : '-';
        if (typeof value === 'boolean')
            return value ? this.t('common.yes') : this.t('common.no');
        if (Array.isArray(value))
            return value.map(item => this.displayJsonValue(item)).join(', ');
        if (typeof value === 'object')
            return JSON.stringify(value);
        const text = String(value);
        const date = /^\d{4}-\d{2}-\d{2}/.test(text) ? new Date(text) : null;
        return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : text;
    }
    humanizeKey(key) {
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }
    contractEnumLabel(prefix, value) {
        const normalized = String(value ?? '').trim();
        const key = normalized === '' ? 'unknown' : normalized;
        const translated = this.t(`${prefix}.${key}`);
        return translated === `${prefix}.${key}` ? key : translated;
    }
    t(path) {
        return this.languageService.translate(path);
    }
    toRoomError(error) {
        const status = error instanceof HttpErrorResponse ? error.status : error?.status;
        if (status === 403) {
            return {
                status,
                title: this.t('opportunityRoom.errors.approvalRequired'),
                message: this.t('opportunityRoom.errors.approvalRequiredMessage')
            };
        }
        if (status === 404) {
            return {
                status,
                title: this.t('opportunityRoom.errors.notFound'),
                message: this.t('opportunityRoom.errors.notFoundMessage')
            };
        }
        return {
            status,
            title: this.t('opportunityRoom.errors.genericTitle'),
            message: error?.error?.message || error?.message || this.t('opportunityRoom.errors.genericMessage')
        };
    }
    static { this.ɵfac = function OpportunityRoomComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OpportunityRoomComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OpportunityRoomComponent, selectors: [["app-opportunity-room"]], decls: 10, vars: 6, consts: [[1, "room-workspace", "investa-page"], [1, "room-shell"], [1, "room-loading"], [1, "room-error", "investa-card"], [1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/70", "p-4", "backdrop-blur-sm"], [1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/60", "p-4", "backdrop-blur-sm"], [1, "room-loading-header"], [1, "room-loading-body"], ["type", "button", 1, "investa-btn-primary", 3, "click"], ["routerLink", "/admin/investments", 1, "investa-btn-secondary"], ["routerLink", "/admin/investments", 1, "room-back-link"], [1, "room-header", "investa-card"], [1, "room-identity"], [1, "room-thumbnail"], [1, "room-title-block"], [1, "room-title-line"], [1, "investa-badge", "investa-badge-accent"], [1, "room-founder-link", 3, "routerLink"], [1, "room-header-meta"], ["type", "button", 1, "investa-btn-secondary"], [1, "room-metrics", "investa-card"], [1, "room-progress-metric"], [1, "room-progress"], [1, "room-success"], [1, "room-workspace-grid"], [1, "room-navigation", "investa-card"], ["type", "button", 3, "active"], [1, "room-content"], [1, "room-content-toolbar"], [1, "room-founder-actions"], [1, "grid", "gap-6", "lg:grid-cols-[minmax(0,1fr)_340px]"], [1, "grid", "gap-6", "xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]"], [1, "investa-card", "p-6"], ["type", "button", 1, "investa-btn-secondary", 3, "click"], ["type", "button", 3, "click"], [1, "room-nav-icon"], ["type", "button", 1, "investa-btn-secondary", 3, "disabled"], [1, "investa-btn-secondary", 3, "routerLink"], ["type", "button", 1, "investa-btn-secondary", 3, "click", "disabled"], [1, "text-xl", "font-bold", "text-current"], [1, "mt-5", "grid", "gap-4", "md:grid-cols-2"], [1, "investa-card-soft", "p-4"], [1, "text-xs", "uppercase", "tracking-[0.16em]", "investa-meta"], [1, "mt-2", "text-sm", "font-semibold", "text-current"], [1, "mt-2", "whitespace-pre-line", "text-sm", "investa-muted"], [1, "investa-card-soft", "p-4", "md:col-span-2"], [1, "mt-5", "space-y-3", "text-sm"], [1, "flex", "items-center", "justify-between", "investa-card-soft", "p-3"], [1, "investa-muted"], [1, "font-semibold", "text-current"], [1, "flex", "items-start", "justify-between", "gap-4"], [1, "mt-2", "text-sm", "investa-meta"], ["type", "button", 1, "rounded-lg", "border", "border-slate-700", "px-3", "py-2", "text-xs", "font-semibold", "investa-muted", "hover:bg-transparent", "disabled:opacity-50", 3, "click", "disabled"], [1, "mt-6", "space-y-3"], [1, "mt-5", "rounded-xl", "border", "border-red-500/30", "bg-red-500/10", "p-4", "text-sm", "text-red-100"], [1, "mt-6", "investa-empty", "p-6"], [1, "space-y-4"], [1, "rounded-xl", "border", "border-red-500/30", "bg-red-500/10", "p-4", "text-sm", "text-red-100"], [1, "investa-empty", "p-8"], [1, "h-24", "animate-pulse", "rounded-xl", "investa-card-soft"], [1, "text-sm", "font-semibold", "text-current"], ["type", "button", 1, "w-full", "rounded-xl", "border", "p-4", "text-start", "transition", "hover:bg-transparent", 3, "border-emerald-500\\/50", "bg-emerald-500\\/10", "border-transparent", "bg-transparent"], ["type", "button", 1, "w-full", "rounded-xl", "border", "p-4", "text-start", "transition", "hover:bg-transparent", 3, "click"], [1, "flex", "items-start", "justify-between", "gap-3"], [1, "min-w-0"], [1, "truncate", "text-sm", "font-bold", "text-current"], [1, "mt-1", "truncate", "text-xs", "investa-meta"], [1, "rounded-full", "border", "border-emerald-500/30", "bg-emerald-500/10", "px-2.5", "py-1", "text-xs", "font-semibold", "text-emerald-200"], [1, "mt-4", "grid", "grid-cols-2", "gap-3", "text-xs"], [1, "investa-meta"], [1, "mt-1", "font-semibold", "investa-muted"], [1, "h-10", "animate-pulse", "rounded-lg", "investa-card-soft"], [1, "h-44", "animate-pulse", "rounded-xl", "investa-card-soft"], [1, "h-32", "animate-pulse", "rounded-xl", "investa-card-soft"], [1, "flex", "flex-col", "gap-4", "lg:flex-row", "lg:items-start", "lg:justify-between"], [1, "text-xs", "font-semibold", "uppercase", "tracking-[0.16em]", "text-current"], [1, "mt-2", "text-2xl", "font-bold", "text-current"], [1, "flex", "flex-wrap", "gap-2"], [1, "mt-6", "grid", "gap-4", "md:grid-cols-2", "xl:grid-cols-3"], [1, "mt-6", "investa-card-soft", "p-5"], [1, "text-lg", "font-bold", "text-current"], [1, "mt-3", "text-sm", "investa-meta"], [1, "mt-4", "grid", "gap-3", "md:grid-cols-2"], [1, "mt-4", "space-y-3"], [1, "mt-4", "investa-card-soft", "p-4"], ["type", "button", 1, "rounded-lg", "border", "border-slate-700", "px-4", "py-2", "text-sm", "font-semibold", "investa-muted", "hover:bg-transparent", "disabled:opacity-50", 3, "click", "disabled"], [1, "investa-card-soft", "p-3"], [1, "text-xs", "investa-meta"], [1, "mt-1", "text-sm", "font-semibold", "text-slate-100"], [1, "flex", "flex-col", "gap-3", "md:flex-row", "md:items-start", "md:justify-between"], [1, "flex", "flex-wrap", "items-center", "gap-2"], [1, "text-sm", "font-bold", "text-current"], [1, "rounded-full", "border", "border-slate-700", "px-2.5", "py-1", "text-xs", "font-semibold", "investa-muted"], [1, "rounded-full", "border", "border-blue-500/30", "bg-blue-500/10", "px-2.5", "py-1", "text-xs", "font-semibold", "text-blue-200"], [1, "mt-2", "text-sm", "investa-muted"], [1, "mt-1", "text-xs", "investa-meta"], ["type", "button", 1, "rounded-lg", "border", "border-slate-700", "px-3", "py-2", "text-xs", "font-semibold", "investa-muted", "hover:bg-transparent", 3, "click"], ["type", "button", 1, "rounded-lg", "border", "border-emerald-500/40", "px-3", "py-2", "text-xs", "font-semibold", "text-current", "hover:bg-emerald-500/10", 3, "click"], [1, "text-xs", "font-semibold", "uppercase", "tracking-[0.16em]", "investa-meta"], [1, "mt-5", "investa-card-soft", "p-6", "text-center", "text-sm", "investa-meta"], [1, "mt-6", "space-y-4"], [1, "flex", "flex-wrap", "items-center", "justify-between", "gap-3"], [1, "rounded-full", "px-2.5", "py-1", "text-xs", "font-semibold"], [1, "mt-3", "whitespace-pre-line", "text-sm", "investa-muted"], [1, "mt-6", "space-y-6"], [1, "text-sm", "font-semibold", "uppercase", "tracking-[0.16em]", "investa-meta"], [1, "mt-3", "grid", "gap-3", "lg:grid-cols-2"], [1, "flex", "gap-4"], [1, "flex", "h-12", "w-12", "flex-shrink-0", "items-center", "justify-center", "rounded-xl", "investa-card-soft", "text-xs", "font-bold", "investa-muted"], [1, "min-w-0", "flex-1"], [1, "truncate", "text-sm", "font-semibold", "text-current"], [1, "mt-3", "flex", "gap-3"], ["target", "_blank", "rel", "noopener", "class", "text-xs font-semibold text-current underline-offset-4 hover:underline", 3, "href", 4, "ngIf"], ["target", "_blank", "rel", "noopener", 1, "text-xs", "font-semibold", "text-current", "underline-offset-4", "hover:underline", 3, "href"], [1, "mt-3", "grid", "gap-4", "md:grid-cols-2", "xl:grid-cols-3"], [1, "overflow-hidden", "investa-card-soft"], [1, "h-44", "w-full", "object-cover", 3, "src", "alt"], [1, "flex", "h-44", "items-center", "justify-center", "investa-card-soft", "text-sm", "font-semibold", "investa-meta"], [1, "p-4"], [1, "flex", "max-h-[92vh]", "w-full", "max-w-5xl", "flex-col", "rounded-2xl", "investa-modal", "shadow-2xl"], [1, "flex", "flex-col", "gap-4", "border-b", "border-neutral-700/40", "p-5", "md:flex-row", "md:items-center", "md:justify-between"], [1, "text-xs", "font-semibold", "uppercase", "tracking-[0.18em]", "text-current"], [1, "mt-2", "text-xl", "font-bold", "text-current"], ["type", "button", 1, "investa-btn-primary", "disabled:opacity-50", 3, "click", "disabled"], [1, "min-h-0", "flex-1", "overflow-y-auto", "bg-white", "p-6", "text-slate-950"], [1, "flex", "min-h-80", "items-center", "justify-center", "text-sm", "font-semibold", "investa-meta"], [1, "rounded-xl", "border", "border-red-200", "bg-red-50", "p-4", "text-sm", "text-red-700"], [1, "contract-preview-html", 3, "innerHTML"], [1, "w-full", "max-w-lg", "rounded-2xl", "investa-modal", "shadow-2xl"], [1, "border-b", "border-neutral-700/40", "p-5"], [1, "text-xs", "font-semibold", "uppercase", "tracking-[0.18em]", "text-red-300"], [1, "mt-1", "text-sm", "investa-meta"], [1, "space-y-4", "p-5"], [1, "rounded-xl", "border", "border-emerald-500/30", "bg-emerald-500/10", "p-4", "text-sm", "text-emerald-100"], [1, "flex", "gap-3", "border-t", "border-neutral-700/40", "p-5"], ["type", "button", 1, "flex-1", "investa-btn-secondary", 3, "click"], ["type", "button", 1, "flex-1", "rounded-lg", "bg-red-600", "px-4", "py-2", "text-sm", "font-bold", "text-current", "hover:bg-red-500", "disabled:cursor-not-allowed", "disabled:opacity-50", 3, "disabled"], [1, "block", "text-sm", "font-semibold", "investa-muted"], [1, "mt-2", "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], [3, "value"], ["rows", "4", 1, "mt-2", "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "placeholder", "ngModel"], [1, "rounded-xl", "border", "border-red-500/40", "bg-red-500/10", "p-3", "text-sm", "text-red-100"], ["type", "button", 1, "flex-1", "rounded-lg", "bg-red-600", "px-4", "py-2", "text-sm", "font-bold", "text-current", "hover:bg-red-500", "disabled:cursor-not-allowed", "disabled:opacity-50", 3, "click", "disabled"], [1, "w-full", "max-w-xl", "rounded-2xl", "investa-modal", "p-6", "shadow-2xl"], [1, "mt-5", "space-y-4"], ["placeholder", "Update title", 1, "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], ["rows", "5", "placeholder", "Update content", 1, "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], [1, "flex", "items-center", "gap-3", "text-sm", "investa-muted"], ["type", "checkbox", 1, "rounded", "border-neutral-400", "accent-green-500", 3, "ngModelChange", "ngModel"], [1, "mt-4", "rounded-lg", "border", "border-red-500/30", "bg-red-500/10", "p-3", "text-sm", "text-red-200"], [1, "mt-6", "flex", "justify-end", "gap-3"], ["placeholder", "Milestone title", 1, "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], ["rows", "5", "placeholder", "Milestone description", 1, "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], ["placeholder", "Document title optional", 1, "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], ["type", "file", 1, "w-full", "rounded-lg", "investa-input", 3, "change"], [1, "w-full", "rounded-lg", "investa-input", 3, "ngModelChange", "ngModel"], ["value", "Private"], ["value", "Public"], ["value", "PrivateDocument"], ["value", "PublicDocument"], ["value", "FinancialReport"], ["value", "Contract"], ["value", "Legal"], ["value", "InternalFile"], ["value", "General"]], template: function OpportunityRoomComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, OpportunityRoomComponent_Conditional_2_Template, 3, 0, "section", 2)(3, OpportunityRoomComponent_Conditional_3_Template, 12, 8, "section", 3)(4, OpportunityRoomComponent_Conditional_4_Template, 86, 57);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(5, OpportunityRoomComponent_Conditional_5_Template, 25, 20, "div", 4);
            i0.ɵɵconditionalCreate(6, OpportunityRoomComponent_Conditional_6_Template, 20, 14, "div", 5);
            i0.ɵɵconditionalCreate(7, OpportunityRoomComponent_Conditional_7_Template, 18, 6, "div", 4);
            i0.ɵɵconditionalCreate(8, OpportunityRoomComponent_Conditional_8_Template, 18, 6, "div", 4);
            i0.ɵɵconditionalCreate(9, OpportunityRoomComponent_Conditional_9_Template, 35, 6, "div", 4);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isLoading() ? 2 : (tmp_0_0 = ctx.error()) ? 3 : ctx.room() ? 4 : -1, tmp_0_0);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.previewModalOpen() ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.reportModalOpen() ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.updateModalOpen() ? 7 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.milestoneModalOpen() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.documentModalOpen() ? 9 : -1);
        } }, dependencies: [CommonModule, i1.NgIf, FormsModule, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.CheckboxControlValueAccessor, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.NgModel, RouterLink, i1.DecimalPipe, TranslatePipe], styles: ["[_nghost-%COMP%] { display:block; }\n.room-workspace[_ngcontent-%COMP%] { min-height:100vh; background:var(--investa-bg); color:var(--investa-text-primary); padding:18px 0 36px; }\n.room-shell[_ngcontent-%COMP%] { width:min(1380px, calc(100% - 32px)); margin-inline:auto; }\n.room-back-link[_ngcontent-%COMP%] { display:inline-flex; align-items:center; min-height:34px; margin-bottom:8px; color:var(--investa-text-secondary); font-size:.75rem; font-weight:700; }\n.room-header[_ngcontent-%COMP%] { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:16px 18px; border-radius:15px; }\n.room-identity[_ngcontent-%COMP%] { display:flex; align-items:center; min-width:0; gap:12px; }\n.room-thumbnail[_ngcontent-%COMP%] { width:58px; height:44px; flex:0 0 auto; display:grid; place-items:center; border-radius:9px; background:linear-gradient(135deg, var(--investa-primary), #394047); color:#fff; font-size:1.15rem; font-weight:900; }\n.room-title-block[_ngcontent-%COMP%] { min-width:0; }\n.room-title-line[_ngcontent-%COMP%] { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }\n.room-title-line[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin:0; overflow:hidden; text-overflow:ellipsis; color:var(--investa-text-primary); font-size:1.08rem; line-height:1.25; font-weight:850; }\n.room-title-block[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin:4px 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--investa-text-muted); font-size:.6875rem; }\n.room-founder-link[_ngcontent-%COMP%] { display:block; margin-top:4px; overflow:hidden; color:var(--investa-text-muted); font-size:.6875rem; text-overflow:ellipsis; white-space:nowrap; text-decoration:none; }\n.room-founder-link[_ngcontent-%COMP%]:hover { color:var(--investa-accent); text-decoration:underline; text-underline-offset:3px; }\n.room-header-meta[_ngcontent-%COMP%] { display:flex; align-items:center; gap:24px; }\n.room-header-meta[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { min-width:94px; padding-inline-start:20px; border-inline-start:1px solid var(--investa-border); }\n.room-header-meta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .room-header-meta[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display:block; }\n.room-header-meta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color:var(--investa-text-muted); font-size:.6rem; }\n.room-header-meta[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { margin-top:3px; color:var(--investa-text-primary); font-size:.75rem; }\n.room-metrics[_ngcontent-%COMP%] { display:grid; grid-template-columns:repeat(4, minmax(110px,1fr)) minmax(210px,1.35fr); gap:0; margin-top:10px; padding:0; overflow:hidden; border-radius:13px; }\n.room-metrics[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { min-width:0; padding:13px 15px; border-inline-start:1px solid var(--investa-border); }\n.room-metrics[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:first-child { border-inline-start:0; }\n.room-metrics[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .room-metrics[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display:block; }\n.room-metrics[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color:var(--investa-text-muted); font-size:.6rem; }\n.room-metrics[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { margin-top:5px; color:var(--investa-text-primary); font-size:.78rem; white-space:nowrap; }\n.room-progress-metric[_ngcontent-%COMP%] { display:grid; grid-template-columns:1fr auto; align-items:center; gap:4px 10px; }\n.room-progress-metric[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { margin:0; }\n.room-progress[_ngcontent-%COMP%] { grid-column:1 / -1; height:5px; overflow:hidden; border-radius:999px; background:var(--investa-surface-soft); }\n.room-progress[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] { display:block; height:100%; border-radius:inherit; background:var(--investa-accent); }\n.room-success[_ngcontent-%COMP%] { margin-top:10px; padding:9px 12px; border-radius:9px; border:1px solid rgba(34,197,50,.25); background:rgba(34,197,50,.09); color:var(--investa-text-primary); font-size:.72rem; }\n.room-workspace-grid[_ngcontent-%COMP%] { display:grid; grid-template-columns:150px minmax(0,1fr); gap:12px; margin-top:12px; align-items:start; }\n.room-navigation[_ngcontent-%COMP%] { position:sticky; top:70px; padding:6px; border-radius:13px; }\n.room-navigation[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%] { display:flex; flex-direction:column; gap:3px; }\n.room-navigation[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display:grid; grid-template-columns:22px minmax(0,1fr) auto; align-items:center; min-height:38px; padding:7px 9px; border-radius:9px; color:var(--investa-text-secondary); font-size:.7rem; font-weight:750; text-align:start; transition:background .16s ease,color .16s ease; }\n.room-navigation[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background:var(--investa-surface-soft); color:var(--investa-text-primary); }\n.room-navigation[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { background:var(--investa-primary); color:var(--investa-primary-contrast, #fff); }\n.room-nav-icon[_ngcontent-%COMP%] { font-size:.85rem; opacity:.85; }\n.room-navigation[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { min-width:18px; height:18px; display:grid; place-items:center; padding:0 4px; border-radius:6px; background:var(--investa-accent-soft); color:#167c24; font-size:.56rem; }\n.room-navigation[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { background:rgba(255,255,255,.15); color:#fff; }\n.room-content[_ngcontent-%COMP%] { min-width:0; }\n.room-content-toolbar[_ngcontent-%COMP%] { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:48px; margin-bottom:10px; padding:0 2px; }\n.room-content-toolbar[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color:var(--investa-text-muted); font-size:.58rem; text-transform:uppercase; letter-spacing:.12em; font-weight:800; }\n.room-content-toolbar[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin:2px 0 0; color:var(--investa-text-primary); font-size:1rem; font-weight:850; }\n.room-founder-actions[_ngcontent-%COMP%] { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }\n.room-founder-actions[_ngcontent-%COMP%]   .investa-btn-secondary[_ngcontent-%COMP%] { min-height:34px; padding:7px 10px; font-size:.67rem; }\n.room-founder-actions[_ngcontent-%COMP%]   .disabled[_ngcontent-%COMP%] { pointer-events:none; opacity:.45; }\n.room-content[_ngcontent-%COMP%]    > section[_ngcontent-%COMP%] { margin:0; }\n.room-content[_ngcontent-%COMP%]   .investa-card[_ngcontent-%COMP%] { border-radius:13px; box-shadow:var(--investa-shadow-sm); }\n.room-content[_ngcontent-%COMP%]   .investa-card.p-6[_ngcontent-%COMP%] { padding:16px; }\n.room-content[_ngcontent-%COMP%]   .investa-card-soft[_ngcontent-%COMP%] { border-radius:10px; }\n.room-content[_ngcontent-%COMP%]   .investa-card-soft.p-4[_ngcontent-%COMP%], .room-content[_ngcontent-%COMP%]   .investa-card-soft.p-5[_ngcontent-%COMP%] { padding:12px; }\n.room-content[_ngcontent-%COMP%]   h2.text-xl[_ngcontent-%COMP%] { font-size:1rem; }\n.room-content[_ngcontent-%COMP%]   h2.text-lg[_ngcontent-%COMP%] { font-size:.95rem; }\n.room-content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { font-size:.85rem; }\n.room-content[_ngcontent-%COMP%]   .text-sm[_ngcontent-%COMP%] { font-size:.75rem; line-height:1.5; }\n.room-content[_ngcontent-%COMP%]   .text-xs[_ngcontent-%COMP%] { font-size:.64rem; }\n.room-content[_ngcontent-%COMP%]   .gap-6[_ngcontent-%COMP%] { gap:12px; }\n.room-content[_ngcontent-%COMP%]   .gap-4[_ngcontent-%COMP%] { gap:9px; }\n.room-content[_ngcontent-%COMP%]   .mt-5[_ngcontent-%COMP%] { margin-top:12px; }\n.room-content[_ngcontent-%COMP%]   .mt-4[_ngcontent-%COMP%] { margin-top:10px; }\n.room-content[_ngcontent-%COMP%]   .space-y-6[_ngcontent-%COMP%]    > [_ngcontent-%COMP%]:not([hidden])    ~ [_ngcontent-%COMP%]:not([hidden]) { margin-top:12px; }\n.room-loading[_ngcontent-%COMP%] { display:grid; gap:12px; }\n.room-loading-header[_ngcontent-%COMP%], .room-loading-body[_ngcontent-%COMP%] { border-radius:14px; background:var(--investa-surface); border:1px solid var(--investa-border); animation:_ngcontent-%COMP%_pulse 1.4s ease-in-out infinite; }\n.room-loading-header[_ngcontent-%COMP%] { height:120px; }\n.room-loading-body[_ngcontent-%COMP%] { height:460px; }\n.room-error[_ngcontent-%COMP%] { max-width:620px; margin:80px auto; padding:24px; text-align:center; }\n.room-error[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { font-size:1.25rem; }\n.room-error[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top:8px; color:var(--investa-text-secondary); font-size:.8rem; }\n.room-error[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display:flex; justify-content:center; gap:8px; margin-top:16px; }\n@keyframes _ngcontent-%COMP%_pulse { 50% { opacity:.6; } }\n\n@media (max-width: 980px) {\n  .room-header[_ngcontent-%COMP%] { align-items:flex-start; }\n  .room-header-meta[_ngcontent-%COMP%] { gap:12px; flex-wrap:wrap; justify-content:flex-end; }\n  .room-header-meta[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { min-width:auto; padding-inline-start:12px; }\n  .room-metrics[_ngcontent-%COMP%] { grid-template-columns:repeat(2,1fr); }\n  .room-metrics[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { border-top:1px solid var(--investa-border); }\n  .room-progress-metric[_ngcontent-%COMP%] { grid-column:1 / -1; }\n  .room-workspace-grid[_ngcontent-%COMP%] { grid-template-columns:1fr; }\n  .room-navigation[_ngcontent-%COMP%] { position:static; overflow:auto; }\n  .room-navigation[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%] { flex-direction:row; min-width:max-content; }\n  .room-navigation[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { grid-template-columns:20px auto auto; }\n}\n@media (max-width: 680px) {\n  .room-shell[_ngcontent-%COMP%] { width:calc(100% - 20px); }\n  .room-workspace[_ngcontent-%COMP%] { padding-top:10px; }\n  .room-header[_ngcontent-%COMP%] { flex-direction:column; padding:13px; }\n  .room-header-meta[_ngcontent-%COMP%] { width:100%; justify-content:flex-start; }\n  .room-header-meta[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:first-child { border-inline-start:0; padding-inline-start:0; }\n  .room-metrics[_ngcontent-%COMP%] { grid-template-columns:1fr 1fr; }\n  .room-metrics[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { padding:11px; }\n  .room-content-toolbar[_ngcontent-%COMP%] { align-items:flex-start; flex-direction:column; }\n  .room-founder-actions[_ngcontent-%COMP%] { justify-content:flex-start; }\n  .room-title-line[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { font-size:1rem; }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OpportunityRoomComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-opportunity-room', imports: [CommonModule, FormsModule, RouterLink, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"room-workspace investa-page\">\n  <div class=\"room-shell\">\n    @if (isLoading()) {\n      <section class=\"room-loading\">\n        <div class=\"room-loading-header\"></div>\n        <div class=\"room-loading-body\"></div>\n      </section>\n    } @else if (error(); as roomError) {\n      <section class=\"room-error investa-card\">\n        <h1>{{ roomError.title }}</h1>\n        <p>{{ roomError.message }}</p>\n        <div>\n          <button type=\"button\" (click)=\"load()\" class=\"investa-btn-primary\">{{ 'opportunityRoom.errors.retry' | translate }}</button>\n          <a routerLink=\"/admin/investments\" class=\"investa-btn-secondary\">{{ 'opportunityRoom.backToOpportunities' | translate }}</a>\n        </div>\n      </section>\n    } @else if (room()) {\n      <a routerLink=\"/admin/investments\" class=\"room-back-link\">\u2190 {{ 'opportunityRoom.backToOpportunities' | translate }}</a>\n\n      <header class=\"room-header investa-card\">\n        <div class=\"room-identity\">\n          <div class=\"room-thumbnail\">{{ title().charAt(0) }}</div>\n          <div class=\"room-title-block\">\n            <div class=\"room-title-line\">\n              <h1>{{ title() }}</h1>\n              <span class=\"investa-badge investa-badge-accent\">{{ status() }}</span>\n            </div>\n            @if (founderProfileId()) {\n              <a class=\"room-founder-link\" [routerLink]=\"['/admin/founders', founderProfileId()]\">{{ founderSummary() }}</a>\n            } @else {\n              <p>{{ founderSummary() }}</p>\n            }\n          </div>\n        </div>\n        <div class=\"room-header-meta\">\n          <div><span>{{ 'opportunityRoom.stats.participation' | translate }}</span><strong>{{ roomRole() }}</strong></div>\n          <div><span>{{ 'opportunityRoom.overview.status' | translate }}</span><strong>{{ stageKey() ? (stageKey() | translate) : stage() }}</strong></div>\n          @if (canReportProject()) {\n            <button type=\"button\" (click)=\"openProjectReport()\" class=\"investa-btn-secondary\">{{ 'reports.actions.reportProject' | translate }}</button>\n          }\n        </div>\n      </header>\n\n      <section class=\"room-metrics investa-card\">\n        <div><span>{{ 'opportunityRoom.funding.funded' | translate }}</span><strong>{{ money(fundedAmount()) }}</strong></div>\n        <div><span>{{ 'opportunityRoom.funding.target' | translate }}</span><strong>{{ money(fundingTarget()) }}</strong></div>\n        <div><span>{{ 'opportunityRoom.funding.remaining' | translate }}</span><strong>{{ money(remainingFundingAmount()) }}</strong></div>\n        <div><span>{{ 'opportunityRoom.funding.participants' | translate }}</span><strong>{{ approvedParticipantCount() ?? '-' }}</strong></div>\n        <div class=\"room-progress-metric\">\n          <span>{{ 'opportunityRoom.funding.progress' | translate }}</span>\n          <strong>{{ fundingProgress() == null ? '-' : ((fundingProgress() | number:'1.0-2') + '%') }}</strong>\n          <div class=\"room-progress\"><i [style.width.%]=\"fundingProgressBarWidth()\"></i></div>\n        </div>\n      </section>\n\n      @if (actionSuccess()) { <div class=\"room-success\">{{ actionSuccess() }}</div> }\n\n      <div class=\"room-workspace-grid\">\n        <aside class=\"room-navigation investa-card\">\n          <nav>\n            @for (tab of tabs; track tab.id) {\n              <button type=\"button\" (click)=\"setTab(tab.id)\" [class.active]=\"activeTab() === tab.id\">\n                <span class=\"room-nav-icon\">{{ tab.id === 'overview' ? '\u2302' : tab.id === 'timeline' ? '\u2301' : tab.id === 'updates' ? '\u2197' : tab.id === 'documents' ? '\u25A1' : tab.id === 'media' ? '\u25A7' : '\u25A4' }}</span>\n                <span>{{ tab.id === 'contracts' ? ('contracts.title' | translate) : (('opportunityRoom.tabs.' + tab.id) | translate) }}</span>\n                @if (tab.id === 'updates' && updates().length) { <small>{{ updates().length }}</small> }\n                @if (tab.id === 'documents' && documents().length) { <small>{{ documents().length }}</small> }\n                @if (tab.id === 'media' && media().length) { <small>{{ media().length }}</small> }\n              </button>\n            }\n          </nav>\n        </aside>\n\n        <main class=\"room-content\">\n          <div class=\"room-content-toolbar\">\n            <div>\n              <span>{{ roomRole() }}</span>\n              <h2>{{ activeTab() === 'contracts' ? ('contracts.title' | translate) : (('opportunityRoom.tabs.' + activeTab()) | translate) }}</h2>\n            </div>\n            @if (isFounder()) {\n              <div class=\"room-founder-actions\">\n                @if (activeTab() === 'updates' || activeTab() === 'overview') { <button type=\"button\" (click)=\"openUpdateModal()\" [disabled]=\"!canAddUpdate()\" class=\"investa-btn-secondary\">{{ 'opportunityRoom.founderWorkspace.addUpdate' | translate }}</button> }\n                @if (activeTab() === 'timeline' || activeTab() === 'overview') { <button type=\"button\" (click)=\"openMilestoneModal()\" [disabled]=\"!canAddMilestone()\" class=\"investa-btn-secondary\">{{ 'opportunityRoom.founderWorkspace.addMilestone' | translate }}</button> }\n                @if (activeTab() === 'documents' || activeTab() === 'overview') { <button type=\"button\" (click)=\"openDocumentModal()\" [disabled]=\"!canAddDocument()\" class=\"investa-btn-secondary\">{{ 'opportunityRoom.founderWorkspace.addDocument' | translate }}</button> }\n                <a [routerLink]=\"['/admin/opportunities', opportunityId(), 'edit']\" [class.disabled]=\"!canEditCoreProject()\" class=\"investa-btn-secondary\">{{ 'opportunityRoom.founderWorkspace.editProject' | translate }}</a>\n              </div>\n            }\n          </div>\n    @if (activeTab() === 'overview') {\n      <section class=\"grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]\">\n        <article class=\"investa-card p-6\">\n          <h2 class=\"text-xl font-bold text-current\">{{ 'opportunityRoom.overview.title' | translate }}</h2>\n          <dl class=\"mt-5 grid gap-4 md:grid-cols-2\">\n            <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.amountRaised' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().fundedAmount == null ? '\u2014' : (overview().fundedAmount | number:'1.0-0') }}</dd></div>\n            <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.remainingFunding' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().remainingFundingAmount == null ? '\u2014' : (overview().remainingFundingAmount | number:'1.0-0') }}</dd></div>\n            <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.fundingProgress' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().fundingProgressPercentage == null ? '\u2014' : ((overview().fundingProgressPercentage | number:'1.0-2') + '%') }}</dd></div>\n            <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.approvedParticipants' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().approvedParticipantCount == null ? '\u2014' : overview().approvedParticipantCount }}</dd></div>\n            @if (overview().investmentModel === 'Equity' || overview().investmentModel === 1) {\n              <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.sharesOffered' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().offeredShares == null ? '\u2014' : (overview().offeredShares | number) }}</dd></div>\n              <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.sharesSold' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().soldShares == null ? '\u2014' : (overview().soldShares | number) }}</dd></div>\n              <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.sharesRemaining' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().remainingShares == null ? '\u2014' : (overview().remainingShares | number) }}</dd></div>\n              <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.equityAllocated' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().allocatedEquityPercentage == null ? '\u2014' : ((overview().allocatedEquityPercentage | number:'1.0-2') + '%') }}</dd></div>\n              <div class=\"investa-card-soft p-4\"><dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'investmentPreview.equityRemaining' | translate }}</dt><dd class=\"mt-2 text-sm font-semibold text-current\">{{ overview().remainingEquityPercentage == null ? '\u2014' : ((overview().remainingEquityPercentage | number:'1.0-2') + '%') }}</dd></div>\n            }\n            <div class=\"investa-card-soft p-4\">\n              <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'opportunityRoom.overview.useOfFunds' | translate }}</dt>\n              <dd class=\"mt-2 whitespace-pre-line text-sm investa-muted\">{{ overview().fundingUsage || overview().fundingPurpose || overview().useOfFunds || '-' }}</dd>\n            </div>\n            <div class=\"investa-card-soft p-4\">\n              <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'opportunityRoom.overview.expectedReturn' | translate }}</dt>\n              <dd class=\"mt-2 whitespace-pre-line text-sm investa-muted\">{{ overview().expectedReturnSummary || '-' }}</dd>\n            </div>\n            <div class=\"investa-card-soft p-4 md:col-span-2\">\n              <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'opportunityRoom.overview.publicTerms' | translate }}</dt>\n              <dd class=\"mt-2 whitespace-pre-line text-sm investa-muted\">{{ overview().publicInvestmentTermsSummary || '-' }}</dd>\n            </div>\n          </dl>\n        </article>\n\n        <article class=\"investa-card p-6\">\n          <h2 class=\"text-xl font-bold text-current\">Participation Summary</h2>\n          <div class=\"mt-5 space-y-3 text-sm\">\n            <div class=\"flex items-center justify-between investa-card-soft p-3\">\n              <span class=\"investa-muted\">Room role</span>\n              <span class=\"font-semibold text-current\">{{ roomRole() }}</span>\n            </div>\n            <div class=\"flex items-center justify-between investa-card-soft p-3\">\n              <span class=\"investa-muted\">Room access</span>\n              <span class=\"font-semibold text-current\">{{ participationAccessText() }}</span>\n            </div>\n            <div class=\"flex items-center justify-between investa-card-soft p-3\">\n              <span class=\"investa-muted\">View private files</span>\n              <span class=\"font-semibold text-current\">{{ permissionLabel(participantContext().canViewPrivateFiles) }}</span>\n            </div>\n            <div class=\"flex items-center justify-between investa-card-soft p-3\">\n              <span class=\"investa-muted\">Download files</span>\n              <span class=\"font-semibold text-current\">{{ permissionLabel(participantContext().canDownloadFiles) }}</span>\n            </div>\n          </div>\n        </article>\n      </section>\n    }\n\n    @if (activeTab() === 'contracts') {\n      <section class=\"grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]\">\n        <article class=\"investa-card p-6\">\n          <div class=\"flex items-start justify-between gap-4\">\n            <div>\n              <h2 class=\"text-xl font-bold text-current\">{{ 'contracts.title' | translate }}</h2>\n              <p class=\"mt-2 text-sm investa-meta\">{{ contractListSubtitle() }}</p>\n            </div>\n            <button type=\"button\"\n                    (click)=\"loadContracts(true)\"\n                    [disabled]=\"contractsLoading()\"\n                    class=\"rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold investa-muted hover:bg-transparent disabled:opacity-50\">\n              {{ 'contracts.actions.refresh' | translate }}\n            </button>\n          </div>\n\n          @if (contractsLoading()) {\n            <div class=\"mt-6 space-y-3\">\n              <div class=\"h-24 animate-pulse rounded-xl investa-card-soft\"></div>\n              <div class=\"h-24 animate-pulse rounded-xl investa-card-soft\"></div>\n            </div>\n          } @else if (contractsError()) {\n            <div class=\"mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100\">{{ contractsError() }}</div>\n          } @else if (contracts().length === 0) {\n            <div class=\"mt-6 investa-empty p-6\">\n              <p class=\"text-sm font-semibold text-current\">{{ 'contracts.empty.title' | translate }}</p>\n              <p class=\"mt-2 text-sm investa-meta\">{{ 'contracts.empty.helper' | translate }}</p>\n            </div>\n          } @else {\n            <div class=\"mt-6 space-y-3\">\n              @for (contract of contracts(); track contract.contractId) {\n                <button type=\"button\"\n                        (click)=\"openContractDetails(contract)\"\n                        class=\"w-full rounded-xl border p-4 text-start transition hover:bg-transparent\"\n                        [class.border-emerald-500\\/50]=\"selectedContract()?.contract?.contractId === contract.contractId\"\n                        [class.bg-emerald-500\\/10]=\"selectedContract()?.contract?.contractId === contract.contractId\"\n                        [class.border-transparent]=\"selectedContract()?.contract?.contractId !== contract.contractId\"\n                        [class.bg-transparent]=\"selectedContract()?.contract?.contractId !== contract.contractId\">\n                  <div class=\"flex items-start justify-between gap-3\">\n                    <div class=\"min-w-0\">\n                      <p class=\"truncate text-sm font-bold text-current\">{{ contract.contractNumber }}</p>\n                      <p class=\"mt-1 truncate text-xs investa-meta\">\n                        {{ isFounder() ? contract.investorDisplayName : contract.founderDisplayName }}\n                      </p>\n                    </div>\n                    <span class=\"rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200\">\n                      {{ contractStatusLabel(contract.status) }}\n                    </span>\n                  </div>\n                  <dl class=\"mt-4 grid grid-cols-2 gap-3 text-xs\">\n                    <div>\n                      <dt class=\"investa-meta\">{{ 'contracts.fields.investmentModel' | translate }}</dt>\n                      <dd class=\"mt-1 font-semibold investa-muted\">{{ contract.investmentModel }}</dd>\n                    </div>\n                    <div>\n                      <dt class=\"investa-meta\">{{ 'contracts.fields.currentVersion' | translate }}</dt>\n                      <dd class=\"mt-1 font-semibold investa-muted\">V{{ contract.currentVersionNumber }}</dd>\n                    </div>\n                    <div>\n                      <dt class=\"investa-meta\">{{ 'contracts.fields.latestAgreementDate' | translate }}</dt>\n                      <dd class=\"mt-1 font-semibold investa-muted\">{{ contractDate(contract.latestAgreementDate) }}</dd>\n                    </div>\n                    <div>\n                      <dt class=\"investa-meta\">{{ 'contracts.fields.versionCount' | translate }}</dt>\n                      <dd class=\"mt-1 font-semibold investa-muted\">{{ contract.versionCount }}</dd>\n                    </div>\n                  </dl>\n                </button>\n              }\n            </div>\n          }\n        </article>\n\n        <article class=\"investa-card p-6\">\n          @if (contractDetailsLoading()) {\n            <div class=\"space-y-4\">\n              <div class=\"h-10 animate-pulse rounded-lg investa-card-soft\"></div>\n              <div class=\"h-44 animate-pulse rounded-xl investa-card-soft\"></div>\n              <div class=\"h-32 animate-pulse rounded-xl investa-card-soft\"></div>\n            </div>\n          } @else if (contractDetailsError()) {\n            <div class=\"rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100\">{{ contractDetailsError() }}</div>\n          } @else if (selectedContract(); as detail) {\n            <div class=\"flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between\">\n              <div>\n                <p class=\"text-xs font-semibold uppercase tracking-[0.16em] text-current\">{{ 'contracts.investmentAgreement' | translate }}</p>\n                <h2 class=\"mt-2 text-2xl font-bold text-current\">{{ detail.contract.contractNumber }}</h2>\n                <p class=\"mt-2 text-sm investa-meta\">{{ title() }}</p>\n              </div>\n              @if (selectedVersion(); as version) {\n                <div class=\"flex flex-wrap gap-2\">\n                  <button type=\"button\"\n                          (click)=\"openContractPreview(version)\"\n                          class=\"investa-btn-primary\">\n                    {{ 'contracts.actions.preview' | translate }}\n                  </button>\n                  <button type=\"button\"\n                          (click)=\"downloadContractPdf(version)\"\n                          [disabled]=\"isPdfDownloading(version)\"\n                          class=\"rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold investa-muted hover:bg-transparent disabled:opacity-50\">\n                    {{ isPdfDownloading(version) ? ('contracts.pdf.preparing' | translate) : ('contracts.actions.downloadPdf' | translate) }}\n                  </button>\n                </div>\n              }\n            </div>\n\n            <dl class=\"mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3\">\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.founder' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ detail.contract.founderDisplayName || '-' }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.investor' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ detail.contract.investorDisplayName || '-' }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.investmentModel' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ detail.contract.investmentModel }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.currentVersion' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">V{{ detail.contract.currentVersionNumber }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.effectiveDate' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ effectiveDate() }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.pdfStatus' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ pdfStatusLabel(currentPdfStatus(selectedVersion())) }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.sourceParticipation' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ sourceParticipationReference() }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.acceptedOffer' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ acceptedOfferReference() }}</dd>\n              </div>\n              <div class=\"investa-card-soft p-4\">\n                <dt class=\"text-xs uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.status' | translate }}</dt>\n                <dd class=\"mt-2 text-sm font-semibold text-current\">{{ contractStatusLabel(detail.contract.status) }}</dd>\n              </div>\n            </dl>\n\n            <section class=\"mt-6 investa-card-soft p-5\">\n              <h3 class=\"text-lg font-bold text-current\">{{ 'contracts.sections.agreedTerms' | translate }}</h3>\n              @if (selectedTermsSummary().length === 0) {\n                <p class=\"mt-3 text-sm investa-meta\">{{ 'contracts.empty.noTerms' | translate }}</p>\n              } @else {\n                <dl class=\"mt-4 grid gap-3 md:grid-cols-2\">\n                  @for (term of selectedTermsSummary(); track term.label) {\n                    <div class=\"investa-card-soft p-3\">\n                      <dt class=\"text-xs investa-meta\">{{ term.label }}</dt>\n                      <dd class=\"mt-1 text-sm font-semibold text-slate-100\">{{ term.value }}</dd>\n                    </div>\n                  }\n                </dl>\n              }\n            </section>\n\n            <section class=\"mt-6 investa-card-soft p-5\">\n              <h3 class=\"text-lg font-bold text-current\">{{ 'contracts.sections.versionHistory' | translate }}</h3>\n              <div class=\"mt-4 space-y-3\">\n                @for (version of detail.versionHistory; track version.versionNumber) {\n                  <article class=\"investa-card-soft p-4\">\n                    <div class=\"flex flex-col gap-3 md:flex-row md:items-start md:justify-between\">\n                      <div>\n                        <div class=\"flex flex-wrap items-center gap-2\">\n                          <p class=\"text-sm font-bold text-current\">V{{ version.versionNumber }}</p>\n                          <span class=\"rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold investa-muted\">{{ versionBadgeLabel(version) }}</span>\n                          <span class=\"rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-200\">{{ versionStatusLabel(version.status) }}</span>\n                        </div>\n                        <p class=\"mt-2 text-sm investa-muted\">{{ versionTypeLabel(version.versionType) }}</p>\n                        <p class=\"mt-1 text-xs investa-meta\">{{ contractDate(version.activatedAt || version.createdAt) }}</p>\n                      </div>\n                      <div class=\"flex flex-wrap gap-2\">\n                        <button type=\"button\" (click)=\"openContractVersion(version)\" class=\"rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold investa-muted hover:bg-transparent\">\n                          {{ 'contracts.actions.openVersion' | translate }}\n                        </button>\n                        <button type=\"button\" (click)=\"openContractPreview(version)\" class=\"rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-current hover:bg-emerald-500/10\">\n                          {{ 'contracts.actions.preview' | translate }}\n                        </button>\n                        <button type=\"button\" (click)=\"downloadContractPdf(version)\" [disabled]=\"isPdfDownloading(version)\" class=\"rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold investa-muted hover:bg-transparent disabled:opacity-50\">\n                          {{ isPdfDownloading(version) ? ('contracts.pdf.preparing' | translate) : ('contracts.actions.downloadPdf' | translate) }}\n                        </button>\n                      </div>\n                    </div>\n                  </article>\n                }\n              </div>\n              @if (selectedVersion()) {\n                <div class=\"mt-4 investa-card-soft p-4\">\n                  <p class=\"text-xs font-semibold uppercase tracking-[0.16em] investa-meta\">{{ 'contracts.fields.changesSummary' | translate }}</p>\n                  <p class=\"mt-2 whitespace-pre-line text-sm investa-muted\">{{ selectedChangesSummary() }}</p>\n                </div>\n              }\n            </section>\n          } @else {\n            <div class=\"investa-empty p-8\">\n              <p class=\"text-sm font-semibold text-current\">{{ 'contracts.empty.selectTitle' | translate }}</p>\n              <p class=\"mt-2 text-sm investa-meta\">{{ 'contracts.empty.selectHelper' | translate }}</p>\n            </div>\n          }\n        </article>\n      </section>\n    }\n\n    @if (activeTab() === 'timeline') {\n      <section class=\"investa-card p-6\">\n        <h2 class=\"text-xl font-bold text-current\">Milestones Timeline</h2>\n        <p class=\"mt-2 text-sm investa-meta\">Strategic milestones only. Operational updates are listed in the Updates tab.</p>\n        @if (timelineSorted().length === 0) {\n          <p class=\"mt-5 investa-card-soft p-6 text-center text-sm investa-meta\">{{ 'opportunityRoom.milestones.empty' | translate }}</p>\n        } @else {\n          <ol class=\"mt-6 space-y-4\">\n            @for (event of timelineSorted(); track event.id || $index) {\n              <li class=\"investa-card-soft p-4\">\n                <div class=\"flex flex-wrap items-center justify-between gap-3\">\n                  <div>\n                    <p class=\"text-sm font-semibold text-current\">{{ eventTitle(event) }}</p>\n                    <p class=\"mt-1 text-xs investa-meta\">{{ eventType(event) }} \u00B7 {{ eventDate(event) }}</p>\n                  </div>\n                  <span class=\"rounded-full px-2.5 py-1 text-xs font-semibold\"\n                        [class.bg-emerald-500\\/10]=\"event.isPublic === true\"\n                        [class.text-emerald-300]=\"event.isPublic === true\"\n                        [class.bg-amber-500\\/10]=\"event.isPublic === false\"\n                        [class.text-amber-300]=\"event.isPublic === false\"\n                        [class.bg-transparent]=\"event.isPublic === null || event.isPublic === undefined\"\n                        [class.investa-muted]=\"event.isPublic === null || event.isPublic === undefined\">\n                    {{ event.isPublic === true ? 'Public' : event.isPublic === false ? 'Private' : 'Room' }}\n                  </span>\n                </div>\n                <p class=\"mt-3 whitespace-pre-line text-sm investa-muted\">{{ event.description || '-' }}</p>\n              </li>\n            }\n          </ol>\n        }\n      </section>\n    }\n\n    @if (activeTab() === 'updates') {\n      <section class=\"investa-card p-6\">\n        <h2 class=\"text-xl font-bold text-current\">Founder Updates</h2>\n        <p class=\"mt-2 text-sm investa-meta\">Progress notes, announcements, and operational updates.</p>\n        @if (updatesSorted().length === 0) {\n          <p class=\"mt-5 investa-card-soft p-6 text-center text-sm investa-meta\">No updates yet.</p>\n        } @else {\n          <div class=\"mt-6 space-y-4\">\n            @for (update of updatesSorted(); track update.id || $index) {\n              <article class=\"investa-card-soft p-4\">\n                <p class=\"text-sm font-semibold text-current\">{{ eventTitle(update) }}</p>\n                <p class=\"mt-1 text-xs investa-meta\">{{ eventDate(update) }}</p>\n                <p class=\"mt-3 whitespace-pre-line text-sm investa-muted\">{{ update.description || '-' }}</p>\n              </article>\n            }\n          </div>\n        }\n      </section>\n    }\n\n    @if (activeTab() === 'documents') {\n      <section class=\"investa-card p-6\">\n        <h2 class=\"text-xl font-bold text-current\">Documents</h2>\n        @if (documents().length === 0) {\n          <p class=\"mt-5 investa-card-soft p-6 text-center text-sm investa-meta\">No documents uploaded yet.</p>\n        } @else {\n          <div class=\"mt-6 space-y-6\">\n            @for (group of documentGroups(); track group.label) {\n              <div>\n                <h3 class=\"text-sm font-semibold uppercase tracking-[0.16em] investa-meta\">{{ group.label }}</h3>\n                <div class=\"mt-3 grid gap-3 lg:grid-cols-2\">\n                  @for (doc of group.items; track doc.id || doc.fileId || doc.fileName) {\n                    <article class=\"investa-card-soft p-4\">\n                      <div class=\"flex gap-4\">\n                        <div class=\"flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl investa-card-soft text-xs font-bold investa-muted\">{{ extension(doc) }}</div>\n                        <div class=\"min-w-0 flex-1\">\n                          <h4 class=\"truncate text-sm font-semibold text-current\">{{ fileTitle(doc) }}</h4>\n                          <p class=\"mt-1 text-xs investa-meta\">{{ fileSize(doc.fileSize) }} \u00B7 {{ visibility(doc) }} \u00B7 {{ uploadedDate(doc) }}</p>\n                          <p class=\"mt-1 text-xs investa-meta\">{{ doc.category || doc.purpose || 'General' }}</p>\n                          <div class=\"mt-3 flex gap-3\">\n                            <a *ngIf=\"previewUrl(doc)\" [href]=\"previewUrl(doc)\" target=\"_blank\" rel=\"noopener\" class=\"text-xs font-semibold text-current underline-offset-4 hover:underline\">Preview</a>\n                            <a *ngIf=\"downloadUrl(doc)\" [href]=\"downloadUrl(doc)\" target=\"_blank\" rel=\"noopener\" class=\"text-xs font-semibold text-current underline-offset-4 hover:underline\">Download</a>\n                          </div>\n                        </div>\n                      </div>\n                    </article>\n                  }\n                </div>\n              </div>\n            }\n          </div>\n        }\n      </section>\n    }\n\n    @if (activeTab() === 'media') {\n      <section class=\"investa-card p-6\">\n        <h2 class=\"text-xl font-bold text-current\">Media</h2>\n        @if (media().length === 0) {\n          <p class=\"mt-5 investa-card-soft p-6 text-center text-sm investa-meta\">No media available yet.</p>\n        } @else {\n          <div class=\"mt-6 space-y-6\">\n            @for (group of mediaGroups(); track group.label) {\n              <div>\n                <h3 class=\"text-sm font-semibold uppercase tracking-[0.16em] investa-meta\">{{ group.label }}</h3>\n                <div class=\"mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3\">\n                  @for (item of group.items; track item.id || item.fileId || item.fileName) {\n                    <article class=\"overflow-hidden investa-card-soft\">\n                      @if (isImage(item) && mediaUrl(item)) {\n                        <img [src]=\"mediaUrl(item)\" [alt]=\"fileTitle(item)\" class=\"h-44 w-full object-cover\">\n                      } @else {\n                        <div class=\"flex h-44 items-center justify-center investa-card-soft text-sm font-semibold investa-meta\">\n                          {{ isVideo(item) ? 'Video' : extension(item) }}\n                        </div>\n                      }\n                      <div class=\"p-4\">\n                        <h4 class=\"truncate text-sm font-semibold text-current\">{{ fileTitle(item) }}</h4>\n                        <p class=\"mt-1 text-xs investa-meta\">{{ visibility(item) }} \u00B7 {{ uploadedDate(item) }}</p>\n                        <div class=\"mt-3 flex gap-3\">\n                          <a *ngIf=\"previewUrl(item)\" [href]=\"previewUrl(item)\" target=\"_blank\" rel=\"noopener\" class=\"text-xs font-semibold text-current underline-offset-4 hover:underline\">Preview</a>\n                          <a *ngIf=\"downloadUrl(item)\" [href]=\"downloadUrl(item)\" target=\"_blank\" rel=\"noopener\" class=\"text-xs font-semibold text-current underline-offset-4 hover:underline\">Download</a>\n                        </div>\n                      </div>\n                    </article>\n                  }\n                </div>\n              </div>\n            }\n          </div>\n        }\n      </section>\n    }\n\n        </main>\n      </div>\n    }\n  </div>\n</div>\n\n@if (previewModalOpen()) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm\">\n    <section class=\"flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl investa-modal shadow-2xl\">\n      <header class=\"flex flex-col gap-4 border-b border-neutral-700/40 p-5 md:flex-row md:items-center md:justify-between\">\n        <div>\n          <p class=\"text-xs font-semibold uppercase tracking-[0.18em] text-current\">{{ 'contracts.actions.preview' | translate }}</p>\n          <h2 class=\"mt-2 text-xl font-bold text-current\">{{ selectedContract()?.contract?.contractNumber || ('contracts.investmentAgreement' | translate) }}</h2>\n        </div>\n        <div class=\"flex flex-wrap gap-2\">\n          <button type=\"button\"\n                  (click)=\"printContractPreview()\"\n                  [disabled]=\"!previewHtml()\"\n                  class=\"rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold investa-muted hover:bg-transparent disabled:opacity-50\">\n            {{ 'contracts.actions.print' | translate }}\n          </button>\n          <button type=\"button\"\n                  (click)=\"downloadContractPdf(selectedVersion())\"\n                  [disabled]=\"!selectedVersion() || isPdfDownloading(selectedVersion())\"\n                  class=\"investa-btn-primary disabled:opacity-50\">\n            {{ isPdfDownloading(selectedVersion()) ? ('contracts.pdf.preparing' | translate) : ('contracts.actions.downloadPdf' | translate) }}\n          </button>\n          <button type=\"button\" (click)=\"closeContractPreview()\" class=\"investa-btn-secondary\">\n            {{ 'common.close' | translate }}\n          </button>\n        </div>\n      </header>\n      <div class=\"min-h-0 flex-1 overflow-y-auto bg-white p-6 text-slate-950\">\n        @if (previewLoading()) {\n          <div class=\"flex min-h-80 items-center justify-center text-sm font-semibold investa-meta\">{{ 'contracts.preview.loading' | translate }}</div>\n        } @else if (previewError()) {\n          <div class=\"rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700\">{{ previewError() }}</div>\n        } @else if (previewHtml()) {\n          <div class=\"contract-preview-html\" [innerHTML]=\"previewHtml()\"></div>\n        }\n      </div>\n    </section>\n  </div>\n}\n\n@if (reportModalOpen()) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm\">\n    <section class=\"w-full max-w-lg rounded-2xl investa-modal shadow-2xl\">\n      <header class=\"border-b border-neutral-700/40 p-5\">\n        <p class=\"text-xs font-semibold uppercase tracking-[0.18em] text-red-300\">{{ 'reports.title' | translate }}</p>\n        <h2 class=\"mt-2 text-xl font-bold text-current\">{{ 'reports.actions.reportProject' | translate }}</h2>\n        <p class=\"mt-1 text-sm investa-meta\">{{ title() }}</p>\n      </header>\n      <div class=\"space-y-4 p-5\">\n        @if (reportSuccess()) {\n          <div class=\"rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100\">\n            {{ 'reports.success' | translate }}\n          </div>\n        } @else {\n          <label class=\"block text-sm font-semibold investa-muted\">\n            {{ 'reports.reason' | translate }}\n            <select class=\"mt-2 w-full rounded-lg investa-input\"\n                    [ngModel]=\"reportReason()\"\n                    (ngModelChange)=\"setReportReason($event)\">\n              @for (reason of reportReasons; track reason) {\n                <option [value]=\"reason\">{{ reportReasonLabel(reason) }}</option>\n              }\n            </select>\n          </label>\n          <label class=\"block text-sm font-semibold investa-muted\">\n            {{ 'reports.description' | translate }}\n            <textarea rows=\"4\"\n                      class=\"mt-2 w-full rounded-lg investa-input\"\n                      [placeholder]=\"'reports.descriptionPlaceholder' | translate\"\n                      [ngModel]=\"reportDescription()\"\n                      (ngModelChange)=\"setReportDescription($event)\"></textarea>\n          </label>\n          @if (reportError()) {\n            <div class=\"rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100\">{{ reportError() }}</div>\n          }\n        }\n      </div>\n      <footer class=\"flex gap-3 border-t border-neutral-700/40 p-5\">\n        <button type=\"button\" (click)=\"closeReportModal()\" class=\"flex-1 investa-btn-secondary\">\n          {{ reportSuccess() ? ('common.close' | translate) : ('reports.cancel' | translate) }}\n        </button>\n        @if (!reportSuccess()) {\n          <button type=\"button\"\n                  (click)=\"submitProjectReport()\"\n                  [disabled]=\"reportSubmitting()\"\n                  class=\"flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-current hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50\">\n            {{ reportSubmitting() ? ('reports.submitting' | translate) : ('reports.submit' | translate) }}\n          </button>\n        }\n      </footer>\n    </section>\n  </div>\n}\n\n@if (updateModalOpen()) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm\">\n    <section class=\"w-full max-w-xl rounded-2xl investa-modal p-6 shadow-2xl\">\n      <h2 class=\"text-xl font-bold text-current\">Add Update</h2>\n      <p class=\"mt-2 text-sm investa-meta\">Operational communication for participants.</p>\n      <div class=\"mt-5 space-y-4\">\n        <input [ngModel]=\"updateForm().title\" (ngModelChange)=\"setUpdateTitle($event)\" placeholder=\"Update title\" class=\"w-full rounded-lg investa-input\">\n        <textarea [ngModel]=\"updateForm().content\" (ngModelChange)=\"setUpdateContent($event)\" rows=\"5\" placeholder=\"Update content\" class=\"w-full rounded-lg investa-input\"></textarea>\n        <label class=\"flex items-center gap-3 text-sm investa-muted\">\n          <input type=\"checkbox\" [ngModel]=\"updateForm().isPublic\" (ngModelChange)=\"setUpdateIsPublic($event)\" class=\"rounded border-neutral-400 accent-green-500\">\n          Public update\n        </label>\n      </div>\n      @if (actionError()) { <p class=\"mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200\">{{ actionError() }}</p> }\n      <div class=\"mt-6 flex justify-end gap-3\">\n        <button type=\"button\" (click)=\"closeActionModals()\" class=\"investa-btn-secondary\">Cancel</button>\n        <button type=\"button\" (click)=\"submitUpdate()\" [disabled]=\"isSubmittingAction()\" class=\"investa-btn-primary disabled:opacity-50\">{{ isSubmittingAction() ? 'Saving...' : 'Add Update' }}</button>\n      </div>\n    </section>\n  </div>\n}\n\n@if (milestoneModalOpen()) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm\">\n    <section class=\"w-full max-w-xl rounded-2xl investa-modal p-6 shadow-2xl\">\n      <h2 class=\"text-xl font-bold text-current\">Add Milestone</h2>\n      <p class=\"mt-2 text-sm investa-meta\">Strategic project evolution. This creates a real Timeline event.</p>\n      <div class=\"mt-5 space-y-4\">\n        <input [ngModel]=\"milestoneForm().title\" (ngModelChange)=\"setMilestoneTitle($event)\" placeholder=\"Milestone title\" class=\"w-full rounded-lg investa-input\">\n        <textarea [ngModel]=\"milestoneForm().description\" (ngModelChange)=\"setMilestoneDescription($event)\" rows=\"5\" placeholder=\"Milestone description\" class=\"w-full rounded-lg investa-input\"></textarea>\n        <label class=\"flex items-center gap-3 text-sm investa-muted\">\n          <input type=\"checkbox\" [ngModel]=\"milestoneForm().isPublic\" (ngModelChange)=\"setMilestoneIsPublic($event)\" class=\"rounded border-neutral-400 accent-green-500\">\n          Public milestone\n        </label>\n      </div>\n      @if (actionError()) { <p class=\"mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200\">{{ actionError() }}</p> }\n      <div class=\"mt-6 flex justify-end gap-3\">\n        <button type=\"button\" (click)=\"closeActionModals()\" class=\"investa-btn-secondary\">Cancel</button>\n        <button type=\"button\" (click)=\"submitMilestone()\" [disabled]=\"isSubmittingAction()\" class=\"investa-btn-primary disabled:opacity-50\">{{ isSubmittingAction() ? 'Saving...' : 'Add Milestone' }}</button>\n      </div>\n    </section>\n  </div>\n}\n\n@if (documentModalOpen()) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm\">\n    <section class=\"w-full max-w-xl rounded-2xl investa-modal p-6 shadow-2xl\">\n      <h2 class=\"text-xl font-bold text-current\">Add Document</h2>\n      <p class=\"mt-2 text-sm investa-meta\">Uploads use Investa FileStore, then the document reference is attached to the Opportunity.</p>\n      <div class=\"mt-5 space-y-4\">\n        <input [ngModel]=\"documentForm().title\" (ngModelChange)=\"setDocumentTitle($event)\" placeholder=\"Document title optional\" class=\"w-full rounded-lg investa-input\">\n        <input type=\"file\" (change)=\"onDocumentFileSelected($event)\" class=\"w-full rounded-lg investa-input\">\n        <select [ngModel]=\"documentForm().visibility\" (ngModelChange)=\"setDocumentVisibility($event)\" class=\"w-full rounded-lg investa-input\">\n          <option value=\"Private\">Private</option>\n          <option value=\"Public\">Public</option>\n        </select>\n        <select [ngModel]=\"documentForm().purpose\" (ngModelChange)=\"setDocumentPurpose($event)\" class=\"w-full rounded-lg investa-input\">\n          <option value=\"PrivateDocument\">Private Document</option>\n          <option value=\"PublicDocument\">Public Document</option>\n          <option value=\"FinancialReport\">Financial Report</option>\n          <option value=\"Contract\">Contract</option>\n          <option value=\"Legal\">Legal</option>\n          <option value=\"InternalFile\">Internal File</option>\n          <option value=\"General\">General</option>\n        </select>\n      </div>\n      @if (actionError()) { <p class=\"mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200\">{{ actionError() }}</p> }\n      <div class=\"mt-6 flex justify-end gap-3\">\n        <button type=\"button\" (click)=\"closeActionModals()\" class=\"investa-btn-secondary\">Cancel</button>\n        <button type=\"button\" (click)=\"submitDocument()\" [disabled]=\"isSubmittingAction()\" class=\"investa-btn-primary disabled:opacity-50\">{{ isSubmittingAction() ? 'Uploading...' : 'Add Document' }}</button>\n      </div>\n    </section>\n  </div>\n}\n", styles: [":host { display:block; }\n.room-workspace { min-height:100vh; background:var(--investa-bg); color:var(--investa-text-primary); padding:18px 0 36px; }\n.room-shell { width:min(1380px, calc(100% - 32px)); margin-inline:auto; }\n.room-back-link { display:inline-flex; align-items:center; min-height:34px; margin-bottom:8px; color:var(--investa-text-secondary); font-size:.75rem; font-weight:700; }\n.room-header { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:16px 18px; border-radius:15px; }\n.room-identity { display:flex; align-items:center; min-width:0; gap:12px; }\n.room-thumbnail { width:58px; height:44px; flex:0 0 auto; display:grid; place-items:center; border-radius:9px; background:linear-gradient(135deg, var(--investa-primary), #394047); color:#fff; font-size:1.15rem; font-weight:900; }\n.room-title-block { min-width:0; }\n.room-title-line { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }\n.room-title-line h1 { margin:0; overflow:hidden; text-overflow:ellipsis; color:var(--investa-text-primary); font-size:1.08rem; line-height:1.25; font-weight:850; }\n.room-title-block p { margin:4px 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--investa-text-muted); font-size:.6875rem; }\n.room-founder-link { display:block; margin-top:4px; overflow:hidden; color:var(--investa-text-muted); font-size:.6875rem; text-overflow:ellipsis; white-space:nowrap; text-decoration:none; }\n.room-founder-link:hover { color:var(--investa-accent); text-decoration:underline; text-underline-offset:3px; }\n.room-header-meta { display:flex; align-items:center; gap:24px; }\n.room-header-meta > div { min-width:94px; padding-inline-start:20px; border-inline-start:1px solid var(--investa-border); }\n.room-header-meta span,.room-header-meta strong { display:block; }\n.room-header-meta span { color:var(--investa-text-muted); font-size:.6rem; }\n.room-header-meta strong { margin-top:3px; color:var(--investa-text-primary); font-size:.75rem; }\n.room-metrics { display:grid; grid-template-columns:repeat(4, minmax(110px,1fr)) minmax(210px,1.35fr); gap:0; margin-top:10px; padding:0; overflow:hidden; border-radius:13px; }\n.room-metrics > div { min-width:0; padding:13px 15px; border-inline-start:1px solid var(--investa-border); }\n.room-metrics > div:first-child { border-inline-start:0; }\n.room-metrics span,.room-metrics strong { display:block; }\n.room-metrics span { color:var(--investa-text-muted); font-size:.6rem; }\n.room-metrics strong { margin-top:5px; color:var(--investa-text-primary); font-size:.78rem; white-space:nowrap; }\n.room-progress-metric { display:grid; grid-template-columns:1fr auto; align-items:center; gap:4px 10px; }\n.room-progress-metric strong { margin:0; }\n.room-progress { grid-column:1 / -1; height:5px; overflow:hidden; border-radius:999px; background:var(--investa-surface-soft); }\n.room-progress i { display:block; height:100%; border-radius:inherit; background:var(--investa-accent); }\n.room-success { margin-top:10px; padding:9px 12px; border-radius:9px; border:1px solid rgba(34,197,50,.25); background:rgba(34,197,50,.09); color:var(--investa-text-primary); font-size:.72rem; }\n.room-workspace-grid { display:grid; grid-template-columns:150px minmax(0,1fr); gap:12px; margin-top:12px; align-items:start; }\n.room-navigation { position:sticky; top:70px; padding:6px; border-radius:13px; }\n.room-navigation nav { display:flex; flex-direction:column; gap:3px; }\n.room-navigation button { display:grid; grid-template-columns:22px minmax(0,1fr) auto; align-items:center; min-height:38px; padding:7px 9px; border-radius:9px; color:var(--investa-text-secondary); font-size:.7rem; font-weight:750; text-align:start; transition:background .16s ease,color .16s ease; }\n.room-navigation button:hover { background:var(--investa-surface-soft); color:var(--investa-text-primary); }\n.room-navigation button.active { background:var(--investa-primary); color:var(--investa-primary-contrast, #fff); }\n.room-nav-icon { font-size:.85rem; opacity:.85; }\n.room-navigation small { min-width:18px; height:18px; display:grid; place-items:center; padding:0 4px; border-radius:6px; background:var(--investa-accent-soft); color:#167c24; font-size:.56rem; }\n.room-navigation button.active small { background:rgba(255,255,255,.15); color:#fff; }\n.room-content { min-width:0; }\n.room-content-toolbar { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:48px; margin-bottom:10px; padding:0 2px; }\n.room-content-toolbar span { color:var(--investa-text-muted); font-size:.58rem; text-transform:uppercase; letter-spacing:.12em; font-weight:800; }\n.room-content-toolbar h2 { margin:2px 0 0; color:var(--investa-text-primary); font-size:1rem; font-weight:850; }\n.room-founder-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }\n.room-founder-actions .investa-btn-secondary { min-height:34px; padding:7px 10px; font-size:.67rem; }\n.room-founder-actions .disabled { pointer-events:none; opacity:.45; }\n.room-content > section { margin:0; }\n.room-content .investa-card { border-radius:13px; box-shadow:var(--investa-shadow-sm); }\n.room-content .investa-card.p-6 { padding:16px; }\n.room-content .investa-card-soft { border-radius:10px; }\n.room-content .investa-card-soft.p-4,.room-content .investa-card-soft.p-5 { padding:12px; }\n.room-content h2.text-xl { font-size:1rem; }\n.room-content h2.text-lg { font-size:.95rem; }\n.room-content h3 { font-size:.85rem; }\n.room-content .text-sm { font-size:.75rem; line-height:1.5; }\n.room-content .text-xs { font-size:.64rem; }\n.room-content .gap-6 { gap:12px; }\n.room-content .gap-4 { gap:9px; }\n.room-content .mt-5 { margin-top:12px; }\n.room-content .mt-4 { margin-top:10px; }\n.room-content .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top:12px; }\n.room-loading { display:grid; gap:12px; }\n.room-loading-header,.room-loading-body { border-radius:14px; background:var(--investa-surface); border:1px solid var(--investa-border); animation:pulse 1.4s ease-in-out infinite; }\n.room-loading-header { height:120px; }\n.room-loading-body { height:460px; }\n.room-error { max-width:620px; margin:80px auto; padding:24px; text-align:center; }\n.room-error h1 { font-size:1.25rem; }\n.room-error p { margin-top:8px; color:var(--investa-text-secondary); font-size:.8rem; }\n.room-error > div { display:flex; justify-content:center; gap:8px; margin-top:16px; }\n@keyframes pulse { 50% { opacity:.6; } }\n\n@media (max-width: 980px) {\n  .room-header { align-items:flex-start; }\n  .room-header-meta { gap:12px; flex-wrap:wrap; justify-content:flex-end; }\n  .room-header-meta > div { min-width:auto; padding-inline-start:12px; }\n  .room-metrics { grid-template-columns:repeat(2,1fr); }\n  .room-metrics > div { border-top:1px solid var(--investa-border); }\n  .room-progress-metric { grid-column:1 / -1; }\n  .room-workspace-grid { grid-template-columns:1fr; }\n  .room-navigation { position:static; overflow:auto; }\n  .room-navigation nav { flex-direction:row; min-width:max-content; }\n  .room-navigation button { grid-template-columns:20px auto auto; }\n}\n@media (max-width: 680px) {\n  .room-shell { width:calc(100% - 20px); }\n  .room-workspace { padding-top:10px; }\n  .room-header { flex-direction:column; padding:13px; }\n  .room-header-meta { width:100%; justify-content:flex-start; }\n  .room-header-meta > div:first-child { border-inline-start:0; padding-inline-start:0; }\n  .room-metrics { grid-template-columns:1fr 1fr; }\n  .room-metrics > div { padding:11px; }\n  .room-content-toolbar { align-items:flex-start; flex-direction:column; }\n  .room-founder-actions { justify-content:flex-start; }\n  .room-title-line h1 { font-size:1rem; }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OpportunityRoomComponent, { className: "OpportunityRoomComponent", filePath: "src/app/pages/admin/opportunity-room/opportunity-room.component.ts", lineNumber: 58 }); })();
