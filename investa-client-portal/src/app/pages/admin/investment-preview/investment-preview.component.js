import { Component, ChangeDetectionStrategy, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { UserService } from '../../../services/user.service';
import { FileStoreService } from '../../../services/file-store.service';
import { OpportunityService } from '../../../services/opportunity.service';
import { WalletService } from '../../../services/wallet.service';
import { ReportService } from '../../../services/report.service';
import { OpportunityRequestKind } from '../../../models/request.model';
import { ParticipationBuilderComponent } from '../../../components/participation-builder/participation-builder.component';
import { get } from 'lodash-es';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = a0 => ["/admin/opportunities", a0, "room"];
const _c1 = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => ({ "bg-slate-600/30 text-gray-300 border-slate-600/30": a0, "bg-emerald-500/15 text-emerald-300 border-emerald-500/25": a1, "bg-amber-500/15 text-amber-300 border-amber-500/25": a2, "bg-blue-500/15 text-blue-300 border-blue-500/25": a3, "bg-cyan-500/15 text-cyan-300 border-cyan-500/25": a4, "bg-yellow-500/15 text-yellow-300 border-yellow-500/25": a5, "bg-green-500/15 text-green-300 border-green-500/25": a6, "bg-gray-500/15 text-gray-300 border-gray-500/25": a7, "bg-red-500/15 text-red-300 border-red-500/25": a8 });
const _c2 = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => ({ "bg-slate-600/30 text-gray-400 border-slate-600/30": a0, "bg-emerald-500/15 text-emerald-300 border-emerald-500/25": a1, "bg-amber-500/15 text-amber-300 border-amber-500/25": a2, "bg-blue-500/15 text-blue-300 border-blue-500/25": a3, "bg-cyan-500/15 text-cyan-300 border-cyan-500/25": a4, "bg-yellow-500/15 text-yellow-300 border-yellow-500/25": a5, "bg-green-500/15 text-green-300 border-green-500/25": a6, "bg-gray-500/15 text-gray-300 border-gray-500/25": a7, "bg-red-500/15 text-red-300 border-red-500/25": a8 });
const _c3 = a0 => ["/admin/founders", a0];
const _c4 = (a0, a1) => ({ "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/30 active:scale-[0.98] focus:ring-purple-500": a0, "bg-slate-700/50 text-gray-200 border border-slate-600/40": a1 });
const _c5 = () => [];
const _c6 = a0 => ["/admin/investments", a0, "media"];
const _forTrack0 = ($index, $item) => $item.id || $index;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.name;
const _forTrack3 = ($index, $item) => $item.investorId;
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 14)(1, "div", 69)(2, "div")(3, "strong");
    i0.ɵɵtext(4, "Draft opportunity");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6, "This opportunity is not visible to investors yet.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 70)(8, "button", 71);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_1_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.editOpportunity()); });
    i0.ɵɵtext(9, "Edit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 72);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_1_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.publishOpportunity()); });
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("disabled", ctx_r2.engagementProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.engagementProcessing() ? "Publishing..." : "Publish", " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 73);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const opp_r5 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.openOpportunityReport(opp_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "reports.actions.reportOpportunity"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 22);
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r2.getOpportunityCoverUrl(opp_r5), i0.ɵɵsanitizeUrl)("alt", opp_r5.title || "Opportunity cover");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(opp_r5.category ? ctx_r2.getOpportunityLabel(opp_r5.category) : opp_r5.categoryName);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 27);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(opp_r5.projectStage);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(opp_r5.fundingGoal ? ctx_r2.getOpportunityLabel(opp_r5.fundingGoal) : opp_r5.fundingGoalName);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, opp_r5.createdAt, "MMM d, yyyy"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Business category");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opp_r5.category ? ctx_r2.getOpportunityLabel(opp_r5.category) : opp_r5.categoryName);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Project stage");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opp_r5.projectStage);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_113_For_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "time");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const event_r6 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r2.getEventDate(event_r6), "MMM d, yyyy"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_113_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 74)(1, "span", 75);
    i0.ɵɵtext(2, "\u2197");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div")(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(8, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_113_For_2_Conditional_8_Template, 3, 4, "time");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const event_r6 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(event_r6.title || event_r6.type || "Update");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(event_r6.description || "A new update was published.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.getEventDate(event_r6) ? 8 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_113_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_113_For_2_Template, 9, 3, "article", 74, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getUpdateEvents(opp_r5).slice(0, 4));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_114_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No updates have been published yet.");
    i0.ɵɵelementEnd();
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_123_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 76)(1, "span", 77);
    i0.ɵɵtext(2, "PDF");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span")(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "small");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "span", 78);
    i0.ɵɵtext(9, "\u2192");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const doc_r7 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("href", ctx_r2.getOpportunityFileUrl(doc_r7) || null, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(doc_r7.fileName || doc_r7.title || doc_r7.name || "Document");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r7.fileExtension || doc_r7.purpose || "Public document");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_123_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 52);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_123_For_2_Template, 10, 3, "a", 76, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getOpportunityDocuments(opp_r5).slice(0, 5));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_124_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No public documents are available.");
    i0.ɵɵelementEnd();
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_132_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 80);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_132_For_2_Template_button_click_0_listener() { const img_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.openLightbox(ctx_r2.getOpportunityFileUrl(img_r9))); });
    i0.ɵɵelement(1, "img", 81);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const img_r9 = ctx.$implicit;
    const ɵ$index_331_r10 = ctx.$index;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r2.getOpportunityFileUrl(img_r9), i0.ɵɵsanitizeUrl)("alt", img_r9.caption || "Public media " + (ɵ$index_331_r10 + 1));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_132_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 54);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_132_For_2_Template, 2, 2, "button", 79, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getOpportunityGallery(opp_r5).slice(0, 4));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_133_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No public media is available.");
    i0.ɵɵelementEnd();
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_188_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 72);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_188_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const opp_r5 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.requestChat(opp_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r5 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.engagementProcessing() || !ctx_r2.getPublicOpportunityId(opp_r5));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.engagementProcessing() ? "Requesting..." : ctx_r2.relationshipState().primaryLabel);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_189_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 82);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_189_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.openChat()); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.relationshipState().primaryLabel);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_190_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 82);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_190_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.openParticipationBuilder()); });
    i0.ɵɵtext(1, "Participate");
    i0.ɵɵelementEnd();
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_191_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 66);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, ctx));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.relationshipState().primaryLabel);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_192_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 71);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_192_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.endDiscussion()); });
    i0.ɵɵtext(1, "Close discussion");
    i0.ɵɵelementEnd();
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵconditionalCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_1_Template, 12, 2, "div", 14);
    i0.ɵɵelementStart(2, "div", 15)(3, "a", 16);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(4, "svg", 17);
    i0.ɵɵelement(5, "path", 5);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_8_Template, 3, 3, "button", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(9, "div", 19)(10, "main", 20)(11, "section", 21);
    i0.ɵɵconditionalCreate(12, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_12_Template, 1, 2, "img", 22);
    i0.ɵɵelement(13, "div", 23);
    i0.ɵɵelementStart(14, "div", 24)(15, "div", 25);
    i0.ɵɵconditionalCreate(16, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_16_Template, 2, 1, "span", 26);
    i0.ɵɵelementStart(17, "span", 27);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(19, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_19_Template, 2, 1, "span", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "h1");
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p");
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "button", 28);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_0_Template_button_click_24_listener($event) { const opp_r5 = i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.openFounderProfile(opp_r5.founderId || (opp_r5.founder == null ? null : opp_r5.founder.id), $event)); });
    i0.ɵɵelementStart(25, "span", 29);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "span");
    i0.ɵɵtext(28, "By ");
    i0.ɵɵelementStart(29, "strong");
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(31, "div", 30);
    i0.ɵɵconditionalCreate(32, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_32_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(33, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_33_Template, 3, 4, "span");
    i0.ɵɵelementStart(34, "span");
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(36, "nav", 31)(37, "a", 32);
    i0.ɵɵtext(38, "Overview");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "a", 33);
    i0.ɵɵtext(40, "Investment Terms");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "a", 34);
    i0.ɵɵtext(42, "Updates ");
    i0.ɵɵelementStart(43, "span");
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "a", 35);
    i0.ɵɵtext(46, "Documents ");
    i0.ɵɵelementStart(47, "span");
    i0.ɵɵtext(48);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "a", 36);
    i0.ɵɵtext(50, "Media ");
    i0.ɵɵelementStart(51, "span");
    i0.ɵɵtext(52);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(53, "section", 37)(54, "article", 38)(55, "div", 39)(56, "div")(57, "span");
    i0.ɵɵtext(58, "Opportunity overview");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "h2");
    i0.ɵɵtext(60, "About this opportunity");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(61, "p", 40);
    i0.ɵɵtext(62);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "div", 41);
    i0.ɵɵconditionalCreate(64, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_64_Template, 5, 1, "div");
    i0.ɵɵconditionalCreate(65, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_65_Template, 5, 1, "div");
    i0.ɵɵelementStart(66, "div")(67, "strong");
    i0.ɵɵtext(68);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(69, "span");
    i0.ɵɵtext(70, "Investment model");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(71, "article", 42)(72, "div", 39)(73, "div")(74, "span");
    i0.ɵɵtext(75, "Capital allocation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(76, "h2");
    i0.ɵɵtext(77, "Use of funds");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(78, "p", 43);
    i0.ɵɵtext(79);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(80, "section", 44)(81, "div", 39)(82, "div")(83, "span");
    i0.ɵɵtext(84, "Participation structure");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(85, "h2");
    i0.ɵɵtext(86, "Investment terms");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(87, "span", 26);
    i0.ɵɵtext(88);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(89, "div", 45)(90, "div")(91, "span");
    i0.ɵɵtext(92, "Minimum participation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(93, "strong");
    i0.ɵɵtext(94);
    i0.ɵɵpipe(95, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(96, "div")(97, "span");
    i0.ɵɵtext(98, "Expected return");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(99, "strong");
    i0.ɵɵtext(100);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(101, "div", 46)(102, "span");
    i0.ɵɵtext(103, "Public terms");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(104, "strong");
    i0.ɵɵtext(105);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(106, "section", 47)(107, "div", 39)(108, "div")(109, "span");
    i0.ɵɵtext(110, "Founder activity");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(111, "h2");
    i0.ɵɵtext(112, "Recent updates");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(113, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_113_Template, 3, 0, "div", 48)(114, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_114_Template, 2, 0, "p", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(115, "div", 50)(116, "section", 51)(117, "div", 39)(118, "div")(119, "span");
    i0.ɵɵtext(120, "Due diligence");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(121, "h2");
    i0.ɵɵtext(122, "Documents");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(123, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_123_Template, 3, 0, "div", 52)(124, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_124_Template, 2, 0, "p", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(125, "section", 53)(126, "div", 39)(127, "div")(128, "span");
    i0.ɵɵtext(129, "Visual library");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(130, "h2");
    i0.ɵɵtext(131, "Media");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(132, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_132_Template, 3, 0, "div", 54)(133, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_133_Template, 2, 0, "p", 49);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(134, "aside", 55)(135, "section", 56)(136, "div", 57)(137, "span");
    i0.ɵɵtext(138, "Investment summary");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(139, "span");
    i0.ɵɵtext(140);
    i0.ɵɵpipe(141, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(142, "div", 58)(143, "div")(144, "span");
    i0.ɵɵtext(145, "Funded");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(146, "strong");
    i0.ɵɵtext(147);
    i0.ɵɵpipe(148, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(149, "div")(150, "span");
    i0.ɵɵtext(151, "Target");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(152, "strong");
    i0.ɵɵtext(153);
    i0.ɵɵpipe(154, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(155, "div", 59);
    i0.ɵɵelement(156, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(157, "div", 60)(158, "div")(159, "span");
    i0.ɵɵtext(160, "Minimum participation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(161, "strong");
    i0.ɵɵtext(162);
    i0.ɵɵpipe(163, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(164, "div")(165, "span");
    i0.ɵɵtext(166, "Investment model");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(167, "strong");
    i0.ɵɵtext(168);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(169, "div")(170, "span");
    i0.ɵɵtext(171, "Approved participants");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(172, "strong");
    i0.ɵɵtext(173);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(174, "div")(175, "span");
    i0.ɵɵtext(176, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(177, "strong");
    i0.ɵɵtext(178);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(179, "section", 61)(180, "div", 62)(181, "span");
    i0.ɵɵtext(182, "Your participation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(183, "span", 26);
    i0.ɵɵtext(184);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(185, "p");
    i0.ɵɵtext(186);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(187, "div", 63);
    i0.ɵɵconditionalCreate(188, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_188_Template, 2, 2, "button", 64);
    i0.ɵɵconditionalCreate(189, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_189_Template, 2, 1, "button", 65);
    i0.ɵɵconditionalCreate(190, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_190_Template, 2, 0, "button", 65);
    i0.ɵɵconditionalCreate(191, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_191_Template, 2, 4, "a", 66);
    i0.ɵɵconditionalCreate(192, InvestmentPreviewComponent_Conditional_8_Conditional_0_Conditional_192_Template, 2, 0, "button", 67);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(193, "small");
    i0.ɵɵtext(194, "Chat history remains available for negotiation context.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(195, "button", 68);
    i0.ɵɵtext(196, "View term sheet");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    let tmp_47_0;
    const opp_r5 = ctx;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isFounder() && ctx_r2.isDraft() ? 1 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 45, "investmentPreview.backButton"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r2.isFounder() ? 8 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r2.getOpportunityCoverUrl(opp_r5) ? 12 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(opp_r5.category || opp_r5.categoryName ? 16 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityInvestmentModelLabel(opp_r5));
    i0.ɵɵadvance();
    i0.ɵɵconditional(opp_r5.projectStage ? 19 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opp_r5.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opp_r5.shortDescription || opp_r5.description);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.getFounderName(opp_r5).charAt(0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.getFounderName(opp_r5));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(opp_r5.fundingGoal || opp_r5.fundingGoalName ? 32 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(opp_r5.createdAt ? 33 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityStatus(opp_r5));
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(ctx_r2.getUpdateEvents(opp_r5).length);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityDocuments(opp_r5).length);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityGallery(opp_r5).length);
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate(opp_r5.description || opp_r5.shortDescription || "Opportunity information will be added by the founder.");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(opp_r5.category || opp_r5.categoryName ? 64 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(opp_r5.projectStage ? 65 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityInvestmentModelLabel(opp_r5));
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(ctx_r2.getUseOfFunds(opp_r5) || "The founder has not published a use-of-funds summary yet.");
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityInvestmentModelLabel(opp_r5));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(95, 47, opp_r5.minimumInvestmentAmount || opp_r5.minimumInvestment || 0, "1.0-0"), " USD");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(opp_r5.expectedReturnSummary || "To be confirmed");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opp_r5.publicInvestmentTermsSummary || "Terms will be shared by the founder.");
    i0.ɵɵadvance(8);
    i0.ɵɵconditional(ctx_r2.getUpdateEvents(opp_r5).length > 0 ? 113 : 114);
    i0.ɵɵadvance(10);
    i0.ɵɵconditional(ctx_r2.getOpportunityDocuments(opp_r5).length > 0 ? 123 : 124);
    i0.ɵɵadvance(9);
    i0.ɵɵconditional(ctx_r2.getOpportunityGallery(opp_r5).length > 0 ? 132 : 133);
    const progress_r15 = ctx_r2.getOpportunityFundingProgress(opp_r5);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(141, 50, progress_r15, "1.0-0"), "%");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(148, 53, opp_r5.fundedAmount || 0, "1.0-0"), " USD");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(154, 56, opp_r5.fundingTarget || 0, "1.0-0"), " USD");
    i0.ɵɵadvance(3);
    i0.ɵɵstyleProp("width", progress_r15, "%");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(163, 59, opp_r5.minimumInvestmentAmount || opp_r5.minimumInvestment || 0, "1.0-0"), " USD");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityInvestmentModelLabel(opp_r5));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opp_r5.approvedParticipantCount || 0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r2.getOpportunityStatus(opp_r5));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r2.relationshipState().title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.relationshipState().description);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.showRequestChatButton() ? 188 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.showOpenChatButton() ? 189 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.showParticipateButton() ? 190 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_47_0 = ctx_r2.showProjectRoomButton() && ctx_r2.getPublicOpportunityId(opp_r5)) ? 191 : -1, tmp_47_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.canEndDiscussion() ? 192 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 85);
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", ctx_r2.getHeroImageUrl(inv_r17), i0.ɵɵsanitizeUrl)("alt", inv_r17.name);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 93);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 181);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 182);
    i0.ɵɵelement(2, "path", 183);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassMap(ctx_r2.getDaysRemaining(inv_r17.endDate) <= 7 ? "text-red-400 border-red-500/30" : ctx_r2.getDaysRemaining(inv_r17.endDate) <= 30 ? "text-amber-400 border-amber-500/30" : "text-gray-400 border-slate-600/30");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", ctx_r2.getDaysRemaining(inv_r17.endDate), "d ", i0.ɵɵpipeBind1(4, 4, "investmentPreview.daysLeft"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_28_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 185);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_28_For_2_Template_button_click_0_listener() { const img_r19 = i0.ɵɵrestoreView(_r18).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.openLightbox(ctx_r2.resolveImageUrl(img_r19.fileUrl || img_r19.previewUrl || img_r19.thumbnailUrl))); });
    i0.ɵɵelement(1, "img", 186);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const img_r19 = ctx.$implicit;
    const ɵ$index_515_r20 = ctx.$index;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r2.resolveImageUrl(img_r19.fileUrl || img_r19.previewUrl || img_r19.thumbnailUrl), i0.ɵɵsanitizeUrl)("alt", img_r19.caption || "Image " + (ɵ$index_515_r20 + 1));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 101);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_28_For_2_Template, 2, 2, "button", 184, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getProjectMediaImages(inv_r17));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 114);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_For_77_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 190);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "investmentPreview.current"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_For_77_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 191);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u2713 ", i0.ɵɵpipeBind1(2, 1, "investmentPreview.complete"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_For_77_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 120)(1, "div", 187)(2, "div", 188);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "p", 189);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, InvestmentPreviewComponent_Conditional_8_Conditional_1_For_77_Conditional_6_Template, 3, 3, "span", 190)(7, InvestmentPreviewComponent_Conditional_8_Conditional_1_For_77_Conditional_7_Template, 3, 3, "span", 191);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const stage_r21 = ctx.$implicit;
    const $index_r22 = ctx.$index;
    i0.ɵɵnextContext();
    const currentStageIndex_r23 = i0.ɵɵreadContextLet(75);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap($index_r22 <= currentStageIndex_r23 ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ring-purple-500/30" : "bg-slate-700 text-gray-400 ring-slate-700/50");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", $index_r22 + 1, " ");
    i0.ɵɵadvance();
    i0.ɵɵclassMap($index_r22 === currentStageIndex_r23 ? "text-white" : $index_r22 < currentStageIndex_r23 ? "text-gray-400" : "text-gray-500");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", stage_r21, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional($index_r22 === currentStageIndex_r23 ? 6 : $index_r22 < currentStageIndex_r23 ? 7 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 121)(1, "p", 192);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 193);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.currentMilestone"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.milestone);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 197);
    i0.ɵɵelement(1, "iframe", 199);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", i0.ɵɵinterpolate(inv_r17.name))("src", inv_r17.videoUrl, i0.ɵɵsanitizeResourceUrl);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 198)(1, "div", 200);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 201);
    i0.ɵɵelement(3, "path", 202)(4, "path", 203);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "div", 204)(6, "p", 205);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 206);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(11, "svg", 207);
    i0.ɵɵelement(12, "path", 208);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("href", inv_r17.videoUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 3, "investmentPreview.watchProjectVideo"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.videoUrl);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 195);
    i0.ɵɵconditionalCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_4_Conditional_1_Template, 2, 3, "div", 197)(2, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_4_Conditional_2_Template, 13, 5, "a", 198);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(3);
    const isYoutube_r24 = inv_r17.videoUrl.includes("youtube") || inv_r17.videoUrl.includes("youtu.be");
    const isVimeo_r25 = inv_r17.videoUrl.includes("vimeo");
    i0.ɵɵadvance();
    i0.ɵɵconditional(isYoutube_r24 || isVimeo_r25 ? 1 : 2);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 215);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const img_r27 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", img_r27.caption, " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 216);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "investmentPreview.primaryImage"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 210);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Template_button_click_0_listener() { const img_r27 = i0.ɵɵrestoreView(_r26).$implicit; const ctx_r2 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r2.openLightbox(ctx_r2.resolveImageUrl(img_r27.url))); });
    i0.ɵɵelement(2, "img", 211);
    i0.ɵɵelementStart(3, "div", 212);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(4, "svg", 213);
    i0.ɵɵelement(5, "path", 214);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Conditional_6_Template, 2, 1, "div", 215);
    i0.ɵɵconditionalCreate(7, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Conditional_7_Template, 3, 3, "div", 216);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const img_r27 = ctx.$implicit;
    const ɵ$index_669_r28 = ctx.$index;
    const ctx_r2 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("title", img_r27.caption || i0.ɵɵpipeBind1(1, 5, "investmentPreview.imageAlt"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r2.resolveImageUrl(img_r27.url), i0.ɵɵsanitizeUrl)("alt", img_r27.caption || "Image " + (ɵ$index_669_r28 + 1));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(img_r27.caption ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(img_r27.isPrimary ? 7 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 196);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_For_2_Template, 8, 7, "button", 209, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(3);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getProjectMediaImages(inv_r17));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 122)(1, "h3", 194);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_4_Template, 3, 1, "div", 195);
    i0.ɵɵconditionalCreate(5, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Conditional_5_Template, 3, 0, "div", 196);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "investmentPreview.media"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.videoUrl ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.getProjectMediaImages(inv_r17).length > 0 ? 5 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "p", 217);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 218);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.sharePrice"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(6, 4, inv_r17.sharePrice, "1.2-2"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_82_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "p", 217);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 219);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.minInvestment"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(6, 4, inv_r17.minInvestment, "1.0-0"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "p", 217);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 220);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.expectedROI"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", inv_r17.expectedROI, "%");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_84_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "p", 217);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 221);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.totalShares"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, inv_r17.totalShares));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "p", 217);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 222);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.available"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, inv_r17.availableShares));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_86_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "p", 217);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 223);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.valuationCap"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(6, 4, inv_r17.valuationCap, "1.0-0"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_118_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 224);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassMap(ctx_r2.getDaysRemaining(inv_r17.endDate) <= 7 ? "text-red-400" : ctx_r2.getDaysRemaining(inv_r17.endDate) <= 30 ? "text-amber-400" : "text-gray-500");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", ctx_r2.getDaysRemaining(inv_r17.endDate), "d ", i0.ɵɵpipeBind1(2, 4, "investmentPreview.daysLeft"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_133_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 137)(1, "dt", 138);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 139);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 137)(8, "dt", 138);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "dd", 139);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 137)(15, "dt", 138);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "dd", 139);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 137)(22, "dt", 138);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "dd", 139);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 137)(29, "dt", 138);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "dd", 139);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 10, "investmentPreview.sharesSold"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.soldShares == null ? "\u2014" : i0.ɵɵpipeBind1(6, 12, inv_r17.soldShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 14, "investmentPreview.sharesRemaining"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.remainingShares == null ? "\u2014" : i0.ɵɵpipeBind1(13, 16, inv_r17.remainingShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 18, "investmentPreview.sharesOffered"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.offeredShares == null ? "\u2014" : i0.ɵɵpipeBind1(20, 20, inv_r17.offeredShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 22, "investmentPreview.equityAllocated"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.allocatedEquityPercentage == null ? "\u2014" : i0.ɵɵpipeBind2(27, 24, inv_r17.allocatedEquityPercentage, "1.0-2") + "%");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 27, "investmentPreview.equityRemaining"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.remainingEquityPercentage == null ? "\u2014" : i0.ɵɵpipeBind2(34, 29, inv_r17.remainingEquityPercentage, "1.0-2") + "%");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_134_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 140)(1, "p", 225);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 226);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "number");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.yourInvestment"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind1(6, 4, inv_r17.investedAmount));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 229);
} if (rf & 2) {
    const member_r30 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", member_r30.avatar, i0.ɵɵsanitizeUrl)("alt", member_r30.name);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 230);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const member_r30 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(member_r30.name.charAt(0).toUpperCase());
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 234);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const member_r30 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(member_r30.bio);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 228);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Template_button_click_0_listener($event) { const member_r30 = i0.ɵɵrestoreView(_r29).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); ctx_r2.navigateToMemberProfile(member_r30.id); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵconditionalCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Conditional_1_Template, 1, 2, "img", 229)(2, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Conditional_2_Template, 2, 1, "div", 230);
    i0.ɵɵelementStart(3, "div", 231)(4, "p", 232);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 233);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Conditional_8_Template, 2, 1, "p", 234);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(9, "svg", 235);
    i0.ɵɵelement(10, "path", 236);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const member_r30 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(member_r30.avatar ? 1 : 2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(member_r30.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(member_r30.role);
    i0.ɵɵadvance();
    i0.ɵɵconditional(member_r30.bio ? 8 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 141);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_For_2_Template, 11, 4, "button", 227, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(inv_r17.teamMembers);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_140_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 142);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "investmentPreview.noTeamMembers"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_147_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "span", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 148);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.started"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, inv_r17.startDate, "MMM d, yyyy"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_148_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "span", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 148);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.targetEnd"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, inv_r17.endDate, "MMM d, yyyy"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_173_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 146)(1, "span", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 237);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investmentPreview.currency"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.currency);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_180_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 157);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_184_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 160);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(inv_r17.businessRole);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 240);
} if (rf & 2) {
    const investor_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", investor_r31.investorAvatar, i0.ɵɵsanitizeUrl)("alt", investor_r31.investorName);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 241);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_21_0;
    const investor_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", investor_r31.isAnonymous ? "?" : (investor_r31.investorName == null ? null : (tmp_21_0 = investor_r31.investorName.charAt(0)) == null ? null : tmp_21_0.toUpperCase()) || "?", " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 243);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "number");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investor_r31 = i0.ɵɵnextContext().$implicit;
    const inv_r17 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind2(2, 2, investor_r31.amountInvested, "1.0-0"), " ", inv_r17.currency || "USD");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 97);
    i0.ɵɵconditionalCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Conditional_1_Template, 1, 2, "img", 240)(2, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Conditional_2_Template, 2, 1, "div", 241);
    i0.ɵɵelementStart(3, "div", 204)(4, "p", 242);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Conditional_7_Template, 3, 5, "p", 243);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investor_r31 = ctx.$implicit;
    const ɵ$index_1073_r32 = ctx.$index;
    const ɵ$count_1073_r33 = ctx.$count;
    i0.ɵɵclassProp("pb-3", !(ɵ$index_1073_r32 === ɵ$count_1073_r33 - 1))("border-b", !(ɵ$index_1073_r32 === ɵ$count_1073_r33 - 1))("border-slate-700/50", !(ɵ$index_1073_r32 === ɵ$count_1073_r33 - 1));
    i0.ɵɵadvance();
    i0.ɵɵconditional(!investor_r31.isAnonymous && investor_r31.investorAvatar ? 1 : 2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", investor_r31.isAnonymous ? i0.ɵɵpipeBind1(6, 9, "investments.anonymousInvestor") : investor_r31.investorName, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investor_r31.amountInvested ? 7 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 239);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("+", inv_r17.investors.length - 5, " ", i0.ɵɵpipeBind1(2, 2, "investments.investors"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 145);
    i0.ɵɵrepeaterCreate(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_For_2_Template, 8, 11, "div", 238, _forTrack3);
    i0.ɵɵconditionalCreate(3, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_Conditional_3_Template, 3, 4, "p", 239);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater((inv_r17.investors || i0.ɵɵpureFunction0(1, _c5)).slice(0, 5));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.investors.length > 5 ? 3 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_207_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 171);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "investmentPreview.noInvestors"));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(3);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", ctx_r2.getProjectMediaImages(inv_r17).length, "\u00A0", i0.ɵɵpipeBind1(1, 2, "investmentPreview.images"), "\u00A0 ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" \u00B7 1\u00A0", i0.ɵɵpipeBind1(1, 1, "investmentPreview.video"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "investmentPreview.noMediaYet"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 244)(1, "div", 245);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 246);
    i0.ɵɵelement(3, "path", 247);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div", 204)(5, "p", 248);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 249);
    i0.ɵɵconditionalCreate(9, InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Conditional_9_Template, 2, 4);
    i0.ɵɵconditionalCreate(10, InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Conditional_10_Template, 2, 3);
    i0.ɵɵconditionalCreate(11, InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Conditional_11_Template, 2, 3);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(12, "svg", 250);
    i0.ɵɵelement(13, "path", 251);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const inv_r17 = i0.ɵɵnextContext(2);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c6, inv_r17.id));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "investmentPreview.viewAllMedia"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.getProjectMediaImages(inv_r17).length ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.videoUrl ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.getProjectMediaImages(inv_r17).length === 0 && !inv_r17.videoUrl ? 11 : -1);
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_210_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 173);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 252);
    i0.ɵɵelement(2, "path", 253);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, " Project Room ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(1, _c0, ctx));
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_223_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 201);
    i0.ɵɵelement(1, "path", 254);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investmentPreview.fullyFunded"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_224_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 201);
    i0.ɵɵelement(1, "path", 255);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investmentPreview.closed"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_225_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 175);
    i0.ɵɵelement(1, "path", 256);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investmentPreview.investNow"), " ");
} }
function InvestmentPreviewComponent_Conditional_8_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵtext(1, "\n// Hero Section with Image --> ");
    i0.ɵɵelementStart(2, "div", 83);
    i0.ɵɵelement(3, "div", 84);
    i0.ɵɵconditionalCreate(4, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_4_Template, 1, 2, "img", 85);
    i0.ɵɵelement(5, "div", 86);
    i0.ɵɵelementStart(6, "div", 87)(7, "div", 88)(8, "div")(9, "div", 89)(10, "span", 90);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "span", 91);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "lowercase");
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span", 92);
    i0.ɵɵconditionalCreate(17, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_17_Template, 1, 0, "span", 93);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(19, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_19_Template, 5, 6, "span", 94);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "h1", 95);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p", 96);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 97)(25, "button", 98);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(26, "svg", 99);
    i0.ɵɵelement(27, "path", 100);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(28, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_28_Template, 3, 0, "div", 101);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(29, "div", 102)(30, "div", 103)(31, "div", 104)(32, "div", 105)(33, "div", 106)(34, "div", 107)(35, "span", 108);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "span", 109);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "span", 110);
    i0.ɵɵtext(41);
    i0.ɵɵpipe(42, "translate");
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(44, "div", 111);
    i0.ɵɵelementStart(45, "div", 107)(46, "span", 108);
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "span", 112);
    i0.ɵɵtext(50);
    i0.ɵɵpipe(51, "lowercase");
    i0.ɵɵpipe(52, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "span", 110);
    i0.ɵɵtext(54);
    i0.ɵɵpipe(55, "translate");
    i0.ɵɵpipe(56, "translate");
    i0.ɵɵpipe(57, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(58, "div", 111);
    i0.ɵɵelementStart(59, "div", 107)(60, "span", 108);
    i0.ɵɵtext(61);
    i0.ɵɵpipe(62, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "span", 113);
    i0.ɵɵconditionalCreate(64, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_64_Template, 1, 0, "span", 114);
    i0.ɵɵtext(65);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(66, "span", 110);
    i0.ɵɵtext(67);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(68, "div", 115)(69, "h3", 116);
    i0.ɵɵtext(70);
    i0.ɵɵpipe(71, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(72, "div", 117);
    i0.ɵɵelement(73, "div", 118);
    i0.ɵɵelementStart(74, "div", 119);
    i0.ɵɵdeclareLet(75);
    i0.ɵɵrepeaterCreate(76, InvestmentPreviewComponent_Conditional_8_Conditional_1_For_77_Template, 8, 7, "div", 120, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(78, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_78_Template, 6, 4, "div", 121);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(79, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_79_Template, 6, 5, "div", 122);
    i0.ɵɵelementStart(80, "div", 123);
    i0.ɵɵconditionalCreate(81, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_81_Template, 7, 7, "div", 124);
    i0.ɵɵconditionalCreate(82, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_82_Template, 7, 7, "div", 124);
    i0.ɵɵconditionalCreate(83, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_83_Template, 6, 4, "div", 124);
    i0.ɵɵconditionalCreate(84, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_84_Template, 7, 6, "div", 124);
    i0.ɵɵconditionalCreate(85, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_85_Template, 7, 6, "div", 124);
    i0.ɵɵconditionalCreate(86, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_86_Template, 7, 7, "div", 124);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(87, "div", 115)(88, "h3", 116);
    i0.ɵɵtext(89);
    i0.ɵɵpipe(90, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(91, "div", 125)(92, "div", 126)(93, "div")(94, "p", 127);
    i0.ɵɵtext(95);
    i0.ɵɵpipe(96, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(97, "p", 128);
    i0.ɵɵtext(98);
    i0.ɵɵpipe(99, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(100, "div", 129)(101, "p", 127);
    i0.ɵɵtext(102);
    i0.ɵɵpipe(103, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(104, "p", 130);
    i0.ɵɵtext(105);
    i0.ɵɵpipe(106, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(107, "div", 131);
    i0.ɵɵelement(108, "div", 132);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(109, "div", 133)(110, "span", 134);
    i0.ɵɵtext(111);
    i0.ɵɵpipe(112, "number");
    i0.ɵɵpipe(113, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(114, "div", 97)(115, "span", 134);
    i0.ɵɵtext(116);
    i0.ɵɵpipe(117, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(118, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_118_Template, 3, 6, "span", 135);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(119, "dl", 136)(120, "div", 137)(121, "dt", 138);
    i0.ɵɵtext(122);
    i0.ɵɵpipe(123, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(124, "dd", 139);
    i0.ɵɵtext(125);
    i0.ɵɵpipe(126, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(127, "div", 137)(128, "dt", 138);
    i0.ɵɵtext(129);
    i0.ɵɵpipe(130, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(131, "dd", 139);
    i0.ɵɵtext(132);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(133, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_133_Template, 35, 32);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(134, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_134_Template, 7, 6, "div", 140);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(135, "div", 115)(136, "h3", 116);
    i0.ɵɵtext(137);
    i0.ɵɵpipe(138, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(139, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_139_Template, 3, 0, "div", 141)(140, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_140_Template, 3, 3, "p", 142);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(141, "div", 143)(142, "div", 122)(143, "h4", 144);
    i0.ɵɵtext(144);
    i0.ɵɵpipe(145, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(146, "div", 145);
    i0.ɵɵconditionalCreate(147, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_147_Template, 7, 7, "div", 146);
    i0.ɵɵconditionalCreate(148, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_148_Template, 7, 7, "div", 146);
    i0.ɵɵelementStart(149, "div", 146)(150, "span", 147);
    i0.ɵɵtext(151);
    i0.ɵɵpipe(152, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(153, "span", 148);
    i0.ɵɵtext(154);
    i0.ɵɵpipe(155, "date");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(156, "div", 122)(157, "h4", 144);
    i0.ɵɵtext(158);
    i0.ɵɵpipe(159, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(160, "div", 145)(161, "div", 146)(162, "span", 147);
    i0.ɵɵtext(163);
    i0.ɵɵpipe(164, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(165, "span", 149);
    i0.ɵɵtext(166);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(167, "div", 146)(168, "span", 147);
    i0.ɵɵtext(169);
    i0.ɵɵpipe(170, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(171, "span", 150);
    i0.ɵɵtext(172);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(173, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_173_Template, 6, 4, "div", 146);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(174, "div", 151)(175, "div", 152)(176, "div", 153)(177, "div", 154)(178, "a", 155);
    i0.ɵɵelement(179, "img", 156);
    i0.ɵɵconditionalCreate(180, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_180_Template, 1, 0, "span", 157);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(181, "a", 158)(182, "p", 159);
    i0.ɵɵtext(183);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(184, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_184_Template, 2, 1, "p", 160);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(185, "div", 161)(186, "div", 162)(187, "div", 163);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(188, "svg", 164);
    i0.ɵɵelement(189, "path", 165);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(190, "p", 166);
    i0.ɵɵtext(191);
    i0.ɵɵpipe(192, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(193, "p", 167);
    i0.ɵɵtext(194);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(195, "div", 162)(196, "p", 168);
    i0.ɵɵtext(197);
    i0.ɵɵpipe(198, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(199, "p", 169);
    i0.ɵɵtext(200);
    i0.ɵɵpipe(201, "number");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(202, "div", 105)(203, "h3", 170);
    i0.ɵɵtext(204);
    i0.ɵɵpipe(205, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(206, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_206_Template, 4, 2, "div", 145)(207, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_207_Template, 3, 3, "p", 171);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(208, InvestmentPreviewComponent_Conditional_8_Conditional_1_a_208_Template, 14, 9, "a", 172);
    i0.ɵɵelementStart(209, "div", 145);
    i0.ɵɵconditionalCreate(210, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_210_Template, 4, 3, "a", 173);
    i0.ɵɵelementStart(211, "button", 174);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_1_Template_button_click_211_listener() { i0.ɵɵrestoreView(_r16); const inv_r17 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openFounderProfile(inv_r17)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(212, "svg", 175);
    i0.ɵɵelement(213, "path", 176)(214, "path", 177);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(215);
    i0.ɵɵpipe(216, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(217, "button", 178);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_1_Template_button_click_217_listener() { i0.ɵɵrestoreView(_r16); const inv_r17 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openContactFounder(inv_r17)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(218, "svg", 175);
    i0.ɵɵelement(219, "path", 179);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(220);
    i0.ɵɵpipe(221, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(222, "button", 180);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_8_Conditional_1_Template_button_click_222_listener() { i0.ɵɵrestoreView(_r16); const inv_r17 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openInvestNow(inv_r17)); });
    i0.ɵɵconditionalCreate(223, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_223_Template, 4, 3)(224, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_224_Template, 4, 3)(225, InvestmentPreviewComponent_Conditional_8_Conditional_1_Conditional_225_Template, 4, 3);
    i0.ɵɵelementEnd()()()()()()();
} if (rf & 2) {
    let tmp_88_0;
    const inv_r17 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵclassMap(inv_r17.status === "Active" ? "bg-gradient-to-r from-emerald-500 to-green-400" : inv_r17.status === "Fully Funded" ? "bg-gradient-to-r from-blue-500 to-cyan-400" : inv_r17.status === "Reviewing Participants" ? "bg-gradient-to-r from-amber-400 to-orange-400" : inv_r17.status === "In Progress" ? "bg-gradient-to-r from-blue-500 to-purple-500" : inv_r17.status === "Completed" ? "bg-gradient-to-r from-green-500 to-teal-400" : inv_r17.status === "Paused" ? "bg-gradient-to-r from-yellow-400 to-amber-500" : inv_r17.status === "Archived" ? "bg-gradient-to-r from-gray-500 to-slate-400" : inv_r17.status === "Closed" ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-slate-700");
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.images && inv_r17.images.length > 0 || inv_r17.imageUrl ? 4 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngClass", ctx_r2.getInvestmentTypeBadgeClass(inv_r17.investmentType));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.getInvestmentTypeDisplay(inv_r17.investmentType), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassMap(inv_r17.riskLevel === ctx_r2.RiskLevel.Low ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : inv_r17.riskLevel === ctx_r2.RiskLevel.Medium ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 97, "investments.risk." + i0.ɵɵpipeBind1(14, 95, inv_r17.riskLevel)), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngClass", i0.ɵɵpureFunctionV(176, _c1, [inv_r17.status === "Draft", inv_r17.status === "Active", inv_r17.status === "Reviewing Participants", inv_r17.status === "In Progress" || inv_r17.status === "Funded", inv_r17.status === "Fully Funded", inv_r17.status === "Paused", inv_r17.status === "Completed", inv_r17.status === "Archived", inv_r17.status === "Closed"]));
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.status === "Active" || inv_r17.status === "In Progress" ? 17 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", inv_r17.status, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.endDate && ctx_r2.getDaysRemaining(inv_r17.endDate) >= 0 ? 19 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(inv_r17.title || inv_r17.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.languageService.language() === "ar" ? inv_r17.businessCategoryNameAr || inv_r17.businessCategoryName : inv_r17.businessCategoryName || "");
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.getProjectMediaImages(inv_r17).length > 0 ? 28 : -1);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 99, "investmentPreview.investmentType"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", ctx_r2.getInvestmentTypeBadgeClass(inv_r17.investmentType));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.getInvestmentTypeDisplay(inv_r17.investmentType), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(inv_r17.investmentType === ctx_r2.InvestmentType.Founding ? i0.ɵɵpipeBind1(42, 101, "investmentPreview.earlyStage") : i0.ɵɵpipeBind1(43, 103, "investmentPreview.equityOpportunity"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 105, "investmentPreview.riskLevel"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(inv_r17.riskLevel === ctx_r2.RiskLevel.Low ? "bg-emerald-500/15 text-emerald-300" : inv_r17.riskLevel === ctx_r2.RiskLevel.Medium ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(52, 109, "investments.risk." + i0.ɵɵpipeBind1(51, 107, inv_r17.riskLevel)), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(inv_r17.riskLevel === ctx_r2.RiskLevel.Low ? i0.ɵɵpipeBind1(55, 111, "investmentPreview.conservativeProfile") : inv_r17.riskLevel === ctx_r2.RiskLevel.Medium ? i0.ɵɵpipeBind1(56, 113, "investmentPreview.moderateExposure") : i0.ɵɵpipeBind1(57, 115, "investmentPreview.highVolatility"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(62, 117, "investmentPreview.campaignStatus"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", i0.ɵɵpureFunctionV(186, _c2, [inv_r17.status === "Draft", inv_r17.status === "Active", inv_r17.status === "Reviewing Participants", inv_r17.status === "In Progress" || inv_r17.status === "Funded", inv_r17.status === "Fully Funded", inv_r17.status === "Paused", inv_r17.status === "Completed", inv_r17.status === "Archived", inv_r17.status === "Closed"]));
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.status === "Active" || inv_r17.status === "In Progress" ? 64 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", inv_r17.status, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.getStatusDescription(inv_r17.status));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(71, 119, "investmentPreview.projectRoadmap"));
    const stages_r34 = ctx_r2.getProjectStages();
    i0.ɵɵadvance(5);
    i0.ɵɵstoreLet(ctx_r2.getCurrentStageIndex());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(stages_r34);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.milestone ? 78 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.images && inv_r17.images.length > 0 || inv_r17.videoUrl ? 79 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.investmentType === ctx_r2.InvestmentType.Equity && inv_r17.sharePrice ? 81 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.minInvestment ? 82 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.investmentType === ctx_r2.InvestmentType.Equity && inv_r17.expectedROI ? 83 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.investmentType === ctx_r2.InvestmentType.Equity && inv_r17.totalShares ? 84 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.investmentType === ctx_r2.InvestmentType.Equity && inv_r17.availableShares ? 85 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.investmentType === ctx_r2.InvestmentType.Equity && inv_r17.valuationCap ? 86 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(90, 122, "investmentPreview.fundingProgress"));
    const rawProgress_r35 = inv_r17.fundingPercentage;
    const progress_r36 = rawProgress_r35 === null ? null : rawProgress_r35 > 100 ? 100 : rawProgress_r35;
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(96, 124, "investmentPreview.amountRaised"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.currentFunding === null ? "\u2014" : i0.ɵɵpipeBind2(99, 126, inv_r17.currentFunding, "1.0-0"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(103, 129, "investmentPreview.target"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(106, 131, inv_r17.targetFund, "1.0-0"));
    i0.ɵɵadvance(3);
    i0.ɵɵclassMap(rawProgress_r35 >= 100 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : rawProgress_r35 >= 75 ? "bg-gradient-to-r from-emerald-500 to-green-400" : rawProgress_r35 >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-slate-400 to-slate-500");
    i0.ɵɵstyleProp("width", (progress_r36 ?? 0) + "%");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", progress_r36 === null ? "\u2014" : i0.ɵɵpipeBind2(112, 134, progress_r36, "1.0-0") + "%", " ", i0.ɵɵpipeBind1(113, 137, "investmentPreview.funded"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("", inv_r17.investorCount, " ", i0.ɵɵpipeBind1(117, 139, "investments.investors"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.endDate ? 118 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(123, 141, "investmentPreview.remainingFunding"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.remainingFundingAmount === null ? "\u2014" : i0.ɵɵpipeBind2(126, 143, inv_r17.remainingFundingAmount, "1.0-0"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(130, 146, "investmentPreview.approvedParticipants"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.investorCount === null ? "\u2014" : inv_r17.investorCount);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.investmentModel === "Equity" || inv_r17.investmentModel === 1 ? 133 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.investedAmount && inv_r17.investedAmount > 0 ? 134 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(138, 148, "investmentPreview.projectTeam"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.teamMembers && inv_r17.teamMembers.length > 0 ? 139 : 140);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(145, 150, "investmentPreview.timeline"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(inv_r17.startDate ? 147 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.endDate ? 148 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(152, 152, "investmentPreview.posted"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(155, 154, inv_r17.date, "MMM d, yyyy"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(159, 157, "investmentPreview.quickStats"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(164, 159, "investmentPreview.credibilityScore"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", inv_r17.credibilityScore, "/100");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(170, 161, "investmentPreview.activeInvestors"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.investorCount);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.currency ? 173 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(196, _c3, inv_r17.founderId));
    i0.ɵɵadvance();
    i0.ɵɵproperty("alt", i0.ɵɵinterpolate(inv_r17.founderDisplay))("src", ctx_r2.founderAvatar(inv_r17), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.status === "Active" ? 180 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(198, _c3, inv_r17.founderId));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(inv_r17.founderDisplay);
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.businessRole ? 184 : -1);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(192, 163, "investmentPreview.credibilityScore"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(inv_r17.credibilityScore);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(198, 165, "investmentPreview.fundingProgress"));
    const fp_r37 = inv_r17.fundingPercentage;
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(fp_r37 >= 75 ? "text-emerald-300" : fp_r37 >= 40 ? "text-amber-300" : "text-white");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", fp_r37 === null ? "\u2014" : i0.ɵɵpipeBind2(201, 167, fp_r37, "1.0-0") + "%", " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(205, 170, "investmentPreview.recentInvestors"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(inv_r17.investors && inv_r17.investors.length > 0 ? 206 : 207);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", false);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_88_0 = ctx_r2.getRoomOpportunityId(inv_r17)) ? 210 : -1, tmp_88_0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(216, 172, "investmentPreview.viewProfile"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", inv_r17.status === "Funded" || inv_r17.status === "Closed");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(221, 174, "investmentPreview.contactFounder"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", inv_r17.status === "Funded" || inv_r17.status === "Closed")("ngClass", i0.ɵɵpureFunction2(200, _c4, inv_r17.status === "Active" || inv_r17.status === "Draft", inv_r17.status === "Funded" || inv_r17.status === "Closed"));
    i0.ɵɵadvance();
    i0.ɵɵconditional(inv_r17.status === "Funded" ? 223 : inv_r17.status === "Closed" ? 224 : 225);
} }
function InvestmentPreviewComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, InvestmentPreviewComponent_Conditional_8_Conditional_0_Template, 197, 62, "div", 12)(1, InvestmentPreviewComponent_Conditional_8_Conditional_1_Template, 226, 203, "div", 13);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_2_0 = ctx_r2.publicOpportunity()) ? 0 : 1, tmp_2_0);
} }
function InvestmentPreviewComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "div", 120)(2, "div", 257)(3, "div", 258);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(4, "svg", 259);
    i0.ɵɵelement(5, "path", 260);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "h1", 261);
    i0.ɵɵtext(7, "This opportunity is not available.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 262);
    i0.ɵɵtext(9, "The public Opportunity page could not be found for this record.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "a", 263);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 1, "investmentPreview.backButton"), " ");
} }
function InvestmentPreviewComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r38 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 264);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_10_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r38); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeLightbox()); })("keydown.escape", function InvestmentPreviewComponent_Conditional_10_Template_div_keydown_escape_0_listener() { i0.ɵɵrestoreView(_r38); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeLightbox()); });
    i0.ɵɵelementStart(2, "button", 265);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_10_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r38); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeLightbox()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(3, "svg", 266);
    i0.ɵɵelement(4, "path", 267);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "img", 268);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_10_Template_img_click_5_listener($event) { i0.ɵɵrestoreView(_r38); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 2, "investmentPreview.imageAlt"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("src", ctx_r2.lightboxUrl(), i0.ɵɵsanitizeUrl);
} }
function InvestmentPreviewComponent_Conditional_11_Conditional_0_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 295);
    i0.ɵɵelement(1, "circle", 296)(2, "path", 297);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "paidActions.processing"), " ");
} }
function InvestmentPreviewComponent_Conditional_11_Conditional_0_Conditional_60_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "paidActions.confirmAndProceed"), " ");
} }
function InvestmentPreviewComponent_Conditional_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r39 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 269)(1, "div", 271);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_11_Conditional_0_Template_div_click_1_listener($event) { i0.ɵɵrestoreView(_r39); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "div", 272)(3, "div", 97)(4, "div", 273);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(5, "svg", 274);
    i0.ɵɵelement(6, "path", 275);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "div", 276)(8, "h3", 167);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 277);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(14, "div", 278)(15, "div", 279)(16, "div", 280)(17, "span", 147);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "span", 281);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 280)(23, "span", 147);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "span", 282);
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "div", 283)(30, "span", 147);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "span", 284);
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(36, "div", 280)(37, "span", 147);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "span", 285);
    i0.ɵɵtext(41);
    i0.ɵɵpipe(42, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(43, "div", 286)(44, "div", 287);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(45, "svg", 288);
    i0.ɵɵelement(46, "path", 289);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(47, "div")(48, "p", 290);
    i0.ɵɵtext(49);
    i0.ɵɵpipe(50, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "p", 291);
    i0.ɵɵtext(52);
    i0.ɵɵpipe(53, "translate");
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(54, "div", 292)(55, "button", 293);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_11_Conditional_0_Template_button_click_55_listener() { i0.ɵɵrestoreView(_r39); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.cancelEngagementConfirmation()); });
    i0.ɵɵtext(56);
    i0.ɵɵpipe(57, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "button", 294);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_11_Conditional_0_Template_button_click_58_listener() { i0.ɵɵrestoreView(_r39); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.confirmEngage()); });
    i0.ɵɵconditionalCreate(59, InvestmentPreviewComponent_Conditional_11_Conditional_0_Conditional_59_Template, 5, 3)(60, InvestmentPreviewComponent_Conditional_11_Conditional_0_Conditional_60_Template, 2, 3);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const investment_r40 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 18, "paidActions.conversationRequest"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 20, "paidActions.conversationHelper"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(19, 22, "participationBuilder.opportunityFallback"), ":");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r40.name);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(25, 24, "paidActions.fixedCost"), ":");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(28, 26, ctx_r2.paidActionCost(ctx_r2.contactFounderQuote()), "1.2-2"), " CREDIT");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(32, 29, "paidActions.currentBalance"), ":");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(35, 31, ctx_r2.paidActionBalance(ctx_r2.contactFounderQuote()), "1.2-2"), " CREDIT");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(39, 34, "paidActions.balanceAfter"), ":");
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r2.paidActionInsufficient(ctx_r2.contactFounderQuote()) ? "text-red-300" : "text-green-300");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(42, 36, ctx_r2.paidActionAfter(ctx_r2.contactFounderQuote()), "1.2-2"), " CREDIT ");
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(50, 39, "paidActions.platformFeeNoticeTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 41, "paidActions.platformFeeNotice"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r2.engagementProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(57, 43, "paidActions.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.engagementProcessing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.engagementProcessing() ? 59 : 60);
} }
function InvestmentPreviewComponent_Conditional_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r41 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 270)(1, "div", 298)(2, "div", 299);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(3, "svg", 300);
    i0.ɵɵelement(4, "path", 301);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "h3", 302);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(8, "p", 303);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementStart(10, "div", 145)(11, "button", 304);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_11_Conditional_1_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r41); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.engagementConfirmationOpen.set(true)); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 305);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_11_Conditional_1_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r41); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.cancelEngage()); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const investment_r40 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 4, "investments.engageModal.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("innerHTML", i0.ɵɵpipeBind1(9, 6, "investments.engageModal.message").replace("{investmentName}", "<span class='font-bold text-blue-300'>" + investment_r40.name + "</span>").replace("{creditCost}", "<span class='font-bold text-white'>" + ctx_r2.engagementCreditCost + "</span>"), i0.ɵɵsanitizeHtml);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 8, "investments.engageModal.proceedButton"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 10, "investments.engageModal.cancelButton"), " ");
} }
function InvestmentPreviewComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, InvestmentPreviewComponent_Conditional_11_Conditional_0_Template, 61, 45, "div", 269)(1, InvestmentPreviewComponent_Conditional_11_Conditional_1_Template, 17, 12, "div", 270);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r2.engagementConfirmationOpen() ? 0 : 1);
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_30_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "currency");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r43 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "investments.investDialog.minLabel"), ": ", i0.ɵɵpipeBind4(3, 4, investment_r43.minInvestment, investment_r43.currency || "USD", "symbol", "1.0-0"));
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_30_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "currency");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r43 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "investments.investDialog.maxLabel"), ": ", i0.ɵɵpipeBind4(3, 4, investment_r43.maxInvestment, investment_r43.currency || "USD", "symbol", "1.0-0"));
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 317);
    i0.ɵɵconditionalCreate(1, InvestmentPreviewComponent_Conditional_12_Conditional_30_Conditional_1_Template, 4, 9, "span");
    i0.ɵɵconditionalCreate(2, InvestmentPreviewComponent_Conditional_12_Conditional_30_Conditional_2_Template, 4, 9, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const investment_r43 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r43.minInvestment ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(investment_r43.maxInvestment ? 2 : -1);
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 328)(1, "span", 147);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 333);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const investment_r43 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "investments.investDialog.expectedROI"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", investment_r43.expectedROI, "%");
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 329);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 334);
    i0.ɵɵelement(2, "path", 335);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 336);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.investmentError());
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 295);
    i0.ɵɵelement(1, "circle", 296)(2, "path", 297);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "investments.investDialog.processing"), " ");
} }
function InvestmentPreviewComponent_Conditional_12_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 175);
    i0.ɵɵelement(1, "path", 337);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "investments.investDialog.confirm"), " ");
} }
function InvestmentPreviewComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r42 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 306);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeInvestDialog()); });
    i0.ɵɵelementStart(1, "div", 307);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_div_click_1_listener($event) { i0.ɵɵrestoreView(_r42); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "div", 272)(3, "div", 280)(4, "div")(5, "h3", 308);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 277);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "button", 309);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeInvestDialog()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(11, "svg", 310);
    i0.ɵɵelement(12, "path", 311);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(13, "div", 312)(14, "div", 313)(15, "div", 314)(16, "div")(17, "p", 315);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "p", 308);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "currency");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div", 129)(24, "p", 315);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "p", 316);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(30, InvestmentPreviewComponent_Conditional_12_Conditional_30_Template, 3, 2, "div", 317);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div")(32, "label", 318);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 97)(36, "button", 319);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.decreaseShares()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(37, "svg", 320);
    i0.ɵɵelement(38, "path", 321);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(39, "input", 322);
    i0.ɵɵtwoWayListener("ngModelChange", function InvestmentPreviewComponent_Conditional_12_Template_input_ngModelChange_39_listener($event) { i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.sharesToPurchaseValue, $event) || (ctx_r2.sharesToPurchaseValue = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("change", function InvestmentPreviewComponent_Conditional_12_Template_input_change_39_listener() { const investment_r43 = i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.validateShares(investment_r43)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "button", 319);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_button_click_40_listener() { const investment_r43 = i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.increaseShares(investment_r43)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(41, "svg", 320);
    i0.ɵɵelement(42, "path", 323);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(43, "p", 324);
    i0.ɵɵtext(44);
    i0.ɵɵpipe(45, "translate");
    i0.ɵɵpipe(46, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(47, "div", 325)(48, "div", 326)(49, "span", 327);
    i0.ɵɵtext(50);
    i0.ɵɵpipe(51, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(52, "span", 308);
    i0.ɵɵtext(53);
    i0.ɵɵpipe(54, "currency");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(55, InvestmentPreviewComponent_Conditional_12_Conditional_55_Template, 6, 4, "div", 328);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(56, InvestmentPreviewComponent_Conditional_12_Conditional_56_Template, 5, 1, "div", 329);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "div", 330)(58, "button", 331);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_button_click_58_listener() { i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeInvestDialog()); });
    i0.ɵɵtext(59);
    i0.ɵɵpipe(60, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(61, "button", 332);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_12_Template_button_click_61_listener() { const investment_r43 = i0.ɵɵrestoreView(_r42); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.confirmInvestment(investment_r43)); });
    i0.ɵɵconditionalCreate(62, InvestmentPreviewComponent_Conditional_12_Conditional_62_Template, 5, 3)(63, InvestmentPreviewComponent_Conditional_12_Conditional_63_Template, 4, 3);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    let tmp_2_0;
    let tmp_14_0;
    const investment_r43 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate((tmp_2_0 = i0.ɵɵpipeBind1(7, 20, "investments.investDialog.title")) == null ? null : tmp_2_0.replace("{investmentName}", investment_r43.name));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r43.founderDisplay);
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 22, "investments.investDialog.sharePrice"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(22, 24, investment_r43.sharePrice, investment_r43.currency || "USD"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 27, "investments.investDialog.available"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 29, investment_r43.availableShares));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r43.minInvestment || investment_r43.maxInvestment ? 30 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 31, "investments.investDialog.sharesLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r2.sharesToPurchase() <= 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.sharesToPurchaseValue);
    i0.ɵɵproperty("max", investment_r43.availableShares);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.sharesToPurchase() >= (investment_r43.availableShares || 0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", (tmp_14_0 = i0.ɵɵpipeBind1(45, 33, "investments.investDialog.availableLine")) == null ? null : tmp_14_0.replace("{available}", i0.ɵɵpipeBind1(46, 35, investment_r43.availableShares)), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 37, "investments.investDialog.totalInvestment"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(54, 39, ctx_r2.calculateInvestmentAmount(investment_r43), investment_r43.currency || "USD"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(investment_r43.expectedROI && investment_r43.expectedROI > 0 ? 55 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.investmentError() ? 56 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(60, 42, "investments.investDialog.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !!ctx_r2.investmentError() || ctx_r2.investmentProcessing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.investmentProcessing() ? 62 : 63);
} }
function InvestmentPreviewComponent_Conditional_13_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r45 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 349);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "button", 354);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_13_Conditional_37_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r45); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.addCredits()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "paidActions.insufficientInline"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "paidActions.addCredits"));
} }
function InvestmentPreviewComponent_Conditional_13_Conditional_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 295);
    i0.ɵɵelement(1, "circle", 296)(2, "path", 297);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "paidActions.processing"), " ");
} }
function InvestmentPreviewComponent_Conditional_13_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "paidActions.sendConversationRequest"), " ");
} }
function InvestmentPreviewComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r44 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "div", 338)(2, "div", 339)(3, "div", 154)(4, "div", 340);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(5, "svg", 341);
    i0.ɵɵelement(6, "path", 342)(7, "path", 343);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(8, "div")(9, "h3", 167);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 233);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "div", 344)(15, "div", 326)(16, "span", 147);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 345);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 326)(23, "span", 147);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "span", 346);
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(29, "div", 347);
    i0.ɵɵelementStart(30, "div", 280)(31, "span", 348);
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "span");
    i0.ɵɵtext(35);
    i0.ɵɵpipe(36, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(37, InvestmentPreviewComponent_Conditional_13_Conditional_37_Template, 6, 6, "div", 349);
    i0.ɵɵelementStart(38, "p", 350);
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "div", 351)(42, "button", 352);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_13_Template_button_click_42_listener() { i0.ɵɵrestoreView(_r44); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.cancelContactFounder()); });
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "button", 353);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_13_Template_button_click_45_listener() { i0.ɵɵrestoreView(_r44); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.confirmContactFounder()); });
    i0.ɵɵconditionalCreate(46, InvestmentPreviewComponent_Conditional_13_Conditional_46_Template, 5, 3)(47, InvestmentPreviewComponent_Conditional_13_Conditional_47_Template, 2, 3);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 15, "paidActions.conversationRequest"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.name);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 17, "paidActions.currentBalance"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 19, ctx_r2.paidActionBalance(ctx_r2.contactFounderQuote())));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 21, "paidActions.fixedCost"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 23, ctx_r2.paidActionCost(ctx_r2.contactFounderQuote())));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 25, "paidActions.balanceAfter"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r2.paidActionInsufficient(ctx_r2.contactFounderQuote()) ? "text-lg font-bold text-red-400" : "text-lg font-bold text-green-400");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 27, ctx_r2.paidActionAfter(ctx_r2.contactFounderQuote())));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.paidActionInsufficient(ctx_r2.contactFounderQuote()) ? 37 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(40, 29, "paidActions.conversationHelper"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(44, 31, "paidActions.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.contactFounderProcessing() || ctx_r2.paidActionInsufficient(ctx_r2.contactFounderQuote()));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.contactFounderProcessing() ? 46 : 47);
} }
function InvestmentPreviewComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r46 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-participation-builder", 355);
    i0.ɵɵlistener("closed", function InvestmentPreviewComponent_Conditional_14_Template_app_participation_builder_closed_0_listener() { i0.ɵɵrestoreView(_r46); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeParticipationBuilder()); })("submitted", function InvestmentPreviewComponent_Conditional_14_Template_app_participation_builder_submitted_0_listener() { i0.ɵɵrestoreView(_r46); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onParticipationSubmitted()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opp_r47 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("opportunityId", ctx_r2.getPublicOpportunityId(opp_r47))("opportunityTitle", opp_r47.title || "Opportunity");
} }
function InvestmentPreviewComponent_Conditional_15_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 366);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 334);
    i0.ɵɵelement(2, "path", 335);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 336);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.investmentError());
} }
function InvestmentPreviewComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r48 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "div", 356)(2, "div", 339)(3, "div", 357)(4, "div", 358);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(5, "svg", 359);
    i0.ɵɵelement(6, "path", 360);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "div")(8, "h3", 167);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 233);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "div", 361)(14, "div", 313)(15, "p", 315);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p", 218);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 313)(22, "p", 315);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "p", 219);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(28, "div", 125)(29, "label", 362);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "div", 97)(33, "button", 363);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_15_Template_button_click_33_listener() { const investment_r49 = i0.ɵɵrestoreView(_r48); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.adjustShares(investment_r49, -1)); });
    i0.ɵɵtext(34, " - ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 364)(36, "span", 308);
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "button", 363);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_15_Template_button_click_38_listener() { const investment_r49 = i0.ɵɵrestoreView(_r48); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.adjustShares(investment_r49, 1)); });
    i0.ɵɵtext(39, " + ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(40, "div", 365)(41, "div", 280)(42, "span", 327);
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "span", 128);
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(48, InvestmentPreviewComponent_Conditional_15_Conditional_48_Template, 5, 1, "div", 366);
    i0.ɵɵelementStart(49, "div", 351)(50, "button", 352);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_15_Template_button_click_50_listener() { i0.ɵɵrestoreView(_r48); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeInvestNowDialog()); });
    i0.ɵɵtext(51);
    i0.ɵɵpipe(52, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "button", 367);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_15_Template_button_click_53_listener() { const investment_r49 = i0.ɵɵrestoreView(_r48); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.proceedToInvestConfirmation(investment_r49)); });
    i0.ɵɵtext(54);
    i0.ɵɵpipe(55, "translate");
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const investment_r49 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 16, "participationBuilder.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r49.name);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 18, "participationBuilder.labels.pricePerShare"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(20, 20, investment_r49.sharePrice, "1.2-2"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 23, "participationBuilder.labels.availableShares"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 25, investment_r49.availableShares));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 27, "participationBuilder.labels.numberOfShares"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r2.equitySharesRequested() <= 1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.equitySharesRequested());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.equitySharesRequested() >= (investment_r49.availableShares || 0));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 29, "paidActions.investmentValue"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(47, 31, ctx_r2.calculateEquityTotalValue(investment_r49), "1.2-2"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.investmentError() ? 48 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(52, 34, "paidActions.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !!ctx_r2.investmentError());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(55, 36, "common.next"), " ");
} }
function InvestmentPreviewComponent_Conditional_16_Conditional_67_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 295);
    i0.ɵɵelement(1, "circle", 296)(2, "path", 297);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, " Processing... ");
} }
function InvestmentPreviewComponent_Conditional_16_Conditional_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Submit ");
} }
function InvestmentPreviewComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r50 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "div", 338)(2, "div", 339)(3, "div", 154)(4, "div", 358);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(5, "svg", 359);
    i0.ɵɵelement(6, "path", 360);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "div")(8, "h3", 167);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 233);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "div", 344)(14, "div", 326)(15, "span", 147);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span", 345);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 326)(22, "span", 147);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "span", 346);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(28, "div", 347);
    i0.ɵɵelementStart(29, "div", 280)(30, "span", 348);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "span");
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(36, "div", 368)(37, "p", 369);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "div", 328)(41, "span", 147);
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "span", 281);
    i0.ɵɵtext(45);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(46, "div", 370)(47, "span", 147);
    i0.ɵɵtext(48);
    i0.ɵɵpipe(49, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(50, "span", 281);
    i0.ɵɵtext(51);
    i0.ɵɵpipe(52, "number");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(53, "div", 370)(54, "span", 147);
    i0.ɵɵtext(55);
    i0.ɵɵpipe(56, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "span", 281);
    i0.ɵɵtext(58);
    i0.ɵɵpipe(59, "number");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(60, "p", 350);
    i0.ɵɵtext(61);
    i0.ɵɵpipe(62, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "div", 351)(64, "button", 352);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_16_Template_button_click_64_listener() { i0.ɵɵrestoreView(_r50); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.cancelInvestConfirmation()); });
    i0.ɵɵtext(65, " Cancel ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(66, "button", 371);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_16_Template_button_click_66_listener() { const investment_r51 = i0.ɵɵrestoreView(_r50); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.confirmInvestNow(investment_r51)); });
    i0.ɵɵconditionalCreate(67, InvestmentPreviewComponent_Conditional_16_Conditional_67_Template, 4, 0)(68, InvestmentPreviewComponent_Conditional_16_Conditional_68_Template, 1, 0);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const investment_r51 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 20, "participationBuilder.labels.participationSummary"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(investment_r51.name);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 22, "paidActions.currentBalance"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(20, 24, ctx_r2.paidActionBalance(ctx_r2.investNowQuote()), "1.2-2"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 27, "paidActions.fixedCost"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(27, 29, ctx_r2.paidActionCost(ctx_r2.investNowQuote()), "1.2-2"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 32, "paidActions.balanceAfter"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r2.paidActionInsufficient(ctx_r2.investNowQuote()) ? "text-lg font-bold text-red-400" : "text-lg font-bold text-green-400");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(35, 34, ctx_r2.paidActionAfter(ctx_r2.investNowQuote()), "1.2-2"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(39, 37, "participationBuilder.labels.participationSummary"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 39, "participationBuilder.labels.selectedShares"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.equitySharesRequested());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(49, 41, "participationBuilder.labels.pricePerShare"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(52, 43, investment_r51.sharePrice, "1.2-2"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(56, 46, "paidActions.investmentValue"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("$", i0.ɵɵpipeBind2(59, 48, ctx_r2.calculateEquityTotalValue(investment_r51), "1.2-2"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(62, 51, "paidActions.participationHelper"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", ctx_r2.investNowProcessing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.investNowProcessing() ? 67 : 68);
} }
function InvestmentPreviewComponent_Conditional_17_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 378);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "reports.success"), " ");
} }
function InvestmentPreviewComponent_Conditional_17_Conditional_13_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 384);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reason_r54 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", reason_r54);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.reportReasonLabel(reason_r54));
} }
function InvestmentPreviewComponent_Conditional_17_Conditional_13_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 386);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.reportError());
} }
function InvestmentPreviewComponent_Conditional_17_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r53 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 382);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "select", 383);
    i0.ɵɵlistener("ngModelChange", function InvestmentPreviewComponent_Conditional_17_Conditional_13_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r53); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setReportReason($event)); });
    i0.ɵɵrepeaterCreate(4, InvestmentPreviewComponent_Conditional_17_Conditional_13_For_5_Template, 2, 2, "option", 384, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "label", 382);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementStart(9, "textarea", 385);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("ngModelChange", function InvestmentPreviewComponent_Conditional_17_Conditional_13_Template_textarea_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r53); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.setReportDescription($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, InvestmentPreviewComponent_Conditional_17_Conditional_13_Conditional_11_Template, 2, 1, "div", 386);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 6, "reports.reason"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r2.reportReason());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.reportReasons);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 8, "reports.description"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 10, "reports.descriptionPlaceholder"))("ngModel", ctx_r2.reportDescription());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.reportError() ? 11 : -1);
} }
function InvestmentPreviewComponent_Conditional_17_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r55 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 387);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_17_Conditional_19_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r55); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.submitReport()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.reportSubmitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.reportSubmitting() ? i0.ɵɵpipeBind1(2, 2, "reports.submitting") : i0.ɵɵpipeBind1(3, 4, "reports.submit"), " ");
} }
function InvestmentPreviewComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r52 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 11)(1, "section", 372)(2, "header", 373)(3, "p", 374);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2", 375);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 376);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 377);
    i0.ɵɵconditionalCreate(12, InvestmentPreviewComponent_Conditional_17_Conditional_12_Template, 3, 3, "div", 378)(13, InvestmentPreviewComponent_Conditional_17_Conditional_13_Template, 12, 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "footer", 379)(15, "button", 380);
    i0.ɵɵlistener("click", function InvestmentPreviewComponent_Conditional_17_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r52); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeReportModal()); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(19, InvestmentPreviewComponent_Conditional_17_Conditional_19_Template, 4, 6, "button", 381);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "reports.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 8, "reports.sendReport"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.title);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.reportSuccess() ? 12 : 13);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.reportSuccess() ? i0.ɵɵpipeBind1(17, 10, "common.close") : i0.ɵɵpipeBind1(18, 12, "reports.cancel"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r2.reportSuccess() ? 19 : -1);
} }
var InvestmentType;
(function (InvestmentType) {
    InvestmentType[InvestmentType["Founding"] = 1] = "Founding";
    InvestmentType[InvestmentType["Equity"] = 2] = "Equity";
    InvestmentType[InvestmentType["RevenueSharing"] = 3] = "RevenueSharing";
    InvestmentType[InvestmentType["Loan"] = 4] = "Loan";
})(InvestmentType || (InvestmentType = {}));
/**
 * Investment Preview Component
 *
 * Displays detailed investment information with engagement and investment actions
 * Integrates with:
 * - OpportunityService: Load opportunity data from API
 * - UserService: Manage user credits
 * - RequestsService: Create investment requests
 * - NotificationService: User feedback
 *
 * Business Logic:
 * - Validates user credits before investment
 * - Creates investment requests for founder approval
 * - Handles both equity (share-based) and funding investments
 * - Provides real-time credit balance updates
 */
export class InvestmentPreviewComponent {
    openLightbox(url) { this.lightboxUrl.set(url); }
    closeLightbox() { this.lightboxUrl.set(null); }
    /**
     * Navigate to a team member's profile if an id is available
     */
    navigateToMemberProfile(memberId) {
        if (!memberId) {
            const msg = this.languageService.dictionary().investmentPreview?.noTeamMembers || 'Profile unavailable';
            this.notificationService.showToast({ title: 'Profile unavailable', message: msg, type: 'info' });
            return;
        }
        try {
            this.router.navigate(['/admin/clients', memberId]);
        }
        catch (err) {
            console.error('Navigation error:', err);
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open member profile', type: 'error' });
        }
    }
    /** Founder actions */
    openContactFounder(investment) {
        // Open credit confirmation dialog for Contact Founder
        void this.promptContactFounder(investment);
    }
    openInvestNow(investment) {
        // Open equity investment dialog for Invest Now
        void this.promptInvestNow(investment);
    }
    openChat() {
        const conversationId = this.viewerState()?.conversationId;
        this.router.navigate(['/admin/chat'], conversationId ? { queryParams: { conversationId } } : undefined);
    }
    async requestChat(opportunity) {
        const opportunityId = this.getPublicOpportunityId(opportunity);
        if (!opportunityId || !this.showRequestChatButton())
            return;
        await this.promptContactFounder(opportunity);
    }
    openParticipationBuilder() {
        if (!this.canOpenParticipationBuilder())
            return;
        this.participationBuilderOpen.set(true);
    }
    closeParticipationBuilder() {
        this.participationBuilderOpen.set(false);
    }
    openOpportunityReport(opportunity) {
        const id = this.getPublicOpportunityId(opportunity);
        if (!id)
            return;
        this.openReport('Opportunity', id, opportunity.title || this.t('reports.targets.opportunity'));
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
    async submitReport() {
        const target = this.reportTarget();
        if (!target || this.reportSubmitting())
            return;
        try {
            this.reportSubmitting.set(true);
            this.reportError.set(null);
            await this.reportService.createReport({
                targetType: target.type,
                targetId: target.id,
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
    async onParticipationSubmitted() {
        this.participationBuilderOpen.set(false);
        const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
        if (opportunityId) {
            await this.loadViewerState(opportunityId);
        }
    }
    openFounderProfile(source, event) {
        event?.stopPropagation();
        const founderId = typeof source === 'string' ? source : source?.founderId;
        if (!founderId || founderId === 'undefined' || founderId === 'null')
            return;
        try {
            this.router.navigate(['/admin/founders', founderId]);
        }
        catch (err) {
            console.error('Navigation error:', err);
            this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open founder profile', type: 'error' });
        }
    }
    constructor() {
        this.route = inject(ActivatedRoute);
        this.router = inject(Router);
        this.notificationService = inject(NotificationService);
        this.languageService = inject(LanguageService);
        this.requestsService = inject(RequestsService);
        this.userService = inject(UserService);
        this.fileStoreService = inject(FileStoreService);
        this.opportunityService = inject(OpportunityService);
        this.walletService = inject(WalletService);
        this.reportService = inject(ReportService);
        this.InvestmentType = InvestmentType;
        // User credits from UserService
        this.userCredits = this.userService.credits;
        /** URL of the image currently shown in the lightbox (null = closed) */
        this.lightboxUrl = signal(null, ...(ngDevMode ? [{ debugName: "lightboxUrl" }] : []));
        this.investment = signal(null, ...(ngDevMode ? [{ debugName: "investment" }] : []));
        this.publicOpportunity = signal(null, ...(ngDevMode ? [{ debugName: "publicOpportunity" }] : []));
        this.viewerState = signal(null, ...(ngDevMode ? [{ debugName: "viewerState" }] : []));
        this.relationshipState = computed(() => this.getRelationshipState(), ...(ngDevMode ? [{ debugName: "relationshipState" }] : []));
        this.participationStatus = this.relationshipState;
        // Cache of founder avatar URLs by userId
        this.founderAvatarCache = signal({}, ...(ngDevMode ? [{ debugName: "founderAvatarCache" }] : []));
        this.investmentToEngage = signal(null, ...(ngDevMode ? [{ debugName: "investmentToEngage" }] : []));
        this.investmentToInvest = signal(null, ...(ngDevMode ? [{ debugName: "investmentToInvest" }] : []));
        this.loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.engagementCreditCost = 0;
        this.sharesToPurchaseValue = 1;
        this.sharesToPurchase = signal(1, ...(ngDevMode ? [{ debugName: "sharesToPurchase" }] : []));
        this.investmentError = signal(null, ...(ngDevMode ? [{ debugName: "investmentError" }] : []));
        this.investmentProcessing = signal(false, ...(ngDevMode ? [{ debugName: "investmentProcessing" }] : []));
        this.engagementConfirmationOpen = signal(false, ...(ngDevMode ? [{ debugName: "engagementConfirmationOpen" }] : []));
        this.engagementProcessing = signal(false, ...(ngDevMode ? [{ debugName: "engagementProcessing" }] : []));
        this.participationBuilderOpen = signal(false, ...(ngDevMode ? [{ debugName: "participationBuilderOpen" }] : []));
        this.reportModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "reportModalOpen" }] : []));
        this.reportSubmitting = signal(false, ...(ngDevMode ? [{ debugName: "reportSubmitting" }] : []));
        this.reportSuccess = signal(false, ...(ngDevMode ? [{ debugName: "reportSuccess" }] : []));
        this.reportError = signal(null, ...(ngDevMode ? [{ debugName: "reportError" }] : []));
        this.reportTarget = signal(null, ...(ngDevMode ? [{ debugName: "reportTarget" }] : []));
        this.reportReason = signal('SuspiciousOpportunity', ...(ngDevMode ? [{ debugName: "reportReason" }] : []));
        this.reportDescription = signal('', ...(ngDevMode ? [{ debugName: "reportDescription" }] : []));
        this.reportReasons = [
            'SuspiciousOpportunity',
            'MisleadingInformation',
            'Spam',
            'Abuse',
            'FraudConcern',
            'InappropriateContent',
            'Other'
        ];
        // Contact Founder flow
        this.contactFounderConfirmationOpen = signal(false, ...(ngDevMode ? [{ debugName: "contactFounderConfirmationOpen" }] : []));
        this.contactFounderProcessing = signal(false, ...(ngDevMode ? [{ debugName: "contactFounderProcessing" }] : []));
        this.contactFounderCreditCost = 0;
        this.contactFounderQuote = signal(null, ...(ngDevMode ? [{ debugName: "contactFounderQuote" }] : []));
        this.investNowQuote = signal(null, ...(ngDevMode ? [{ debugName: "investNowQuote" }] : []));
        // Invest Now flow (Equity)
        this.investNowDialogOpen = signal(false, ...(ngDevMode ? [{ debugName: "investNowDialogOpen" }] : []));
        this.investNowConfirmationOpen = signal(false, ...(ngDevMode ? [{ debugName: "investNowConfirmationOpen" }] : []));
        this.investNowProcessing = signal(false, ...(ngDevMode ? [{ debugName: "investNowProcessing" }] : []));
        this.equitySharesRequested = signal(1, ...(ngDevMode ? [{ debugName: "equitySharesRequested" }] : []));
        // Invest Now form data
        this.investNowForm = signal({
            shares: 1,
            participationAmount: 0,
            fundingAmount: 0,
            interestMessage: ''
        }, ...(ngDevMode ? [{ debugName: "investNowForm" }] : []));
        this.loadInvestment();
        effect(() => {
            if (this.requestsService.participationRevision() > 0)
                void this.loadInvestment();
        });
    }
    /**
     * Load investment from API
     * Loading rules:
     * - Founder owner + Draft → use authenticated endpoint
     * - Published/public → use public endpoint
     * - Non-owner must never access Draft (enforced by backend)
     */
    async loadInvestment() {
        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? parseInt(idParam, 10) : NaN;
        if (!id || isNaN(id)) {
            this.investment.set(null);
            this.publicOpportunity.set(null);
            return;
        }
        this.loading.set(true);
        try {
            const opportunityId = id;
            // First try to load viewer state to determine if user is founder
            let viewerState = null;
            try {
                viewerState = await this.opportunityService.getViewerState(opportunityId);
                this.viewerState.set(viewerState);
            }
            catch (error) {
                // Viewer state might fail for public opportunities, continue
                console.warn('Could not load viewer state, will try public endpoint');
            }
            // Load opportunity data
            let opportunity;
            if (viewerState?.isFounder) {
                // Founder viewing their own opportunity - use authenticated endpoint
                // This allows founders to view their Draft opportunities
                opportunity = await this.opportunityService.getFounderOpportunity(opportunityId);
            }
            else {
                // Public or non-founder - use public endpoint
                opportunity = await this.opportunityService.getPublicOpportunity(opportunityId);
            }
            if (viewerState?.isFounder || viewerState?.canOpenProjectRoom || viewerState?.projectRoomUnlocked) {
                const room = await this.opportunityService.getOpportunityRoom(opportunityId);
                opportunity = this.mergeAuthorizedRoomSummary(opportunity, room);
            }
            this.publicOpportunity.set(opportunity);
            this.investment.set(this.toOpportunityView(opportunity));
            if (typeof ngDevMode !== 'undefined' && ngDevMode) {
                console.log('Opportunity loaded', opportunity, 'isFounder:', viewerState?.isFounder);
            }
            // Load founder avatar if founderId present
            try {
                const founderId = this.getFounderId(opportunity);
                if (founderId) {
                    this.loadFounderAvatar(founderId);
                }
            }
            catch (err) {
                // ignore
            }
        }
        catch (error) {
            console.error('Error loading investment:', error);
            this.investment.set(null);
            this.publicOpportunity.set(null);
            this.viewerState.set(null);
        }
        finally {
            this.loading.set(false);
        }
    }
    async loadViewerState(opportunityId) {
        // Viewer state is now loaded in loadInvestment() to determine endpoint
        // This method is kept for refresh scenarios
        try {
            const state = await this.opportunityService.getViewerState(opportunityId);
            this.viewerState.set(state);
        }
        catch (error) {
            console.warn(`Could not load viewer state for Opportunity ${opportunityId}.`, error);
            this.viewerState.set(null);
        }
    }
    getPublicOpportunityId(opportunity) {
        return this.parsePositiveNumber(opportunity?.id ?? opportunity?.opportunityId);
    }
    getFounderId(opportunity) {
        return String(opportunity?.founder?.id || opportunity?.founder?.userId || opportunity?.founderId || '');
    }
    getFounderName(opportunity) {
        const founder = opportunity?.founder;
        return founder?.name || founder?.displayName || founder?.fullName || 'Founder';
    }
    getOpportunityLabel(value) {
        return this.opportunityService.label(value);
    }
    getOpportunityStatus(opportunity) {
        const status = opportunity?.status;
        const statusStr = String(status || '').toLowerCase();
        // Handle numeric enum values from backend
        // Draft = 1, Published = 5, Funding = 6, FullyFunded = 7, InProgress = 8, Completed = 9, Archived = 10
        // Review states (UnderReview=2, Rejected=3, Approved=4) are no longer used
        switch (statusStr) {
            case '1':
            case 'draft':
                return 'Draft';
            case '5':
            case 'published':
            case 'active':
            case '4':
            case 'approved':
                return 'Active';
            case '6':
            case 'funding':
                return 'Funding';
            case '7':
            case 'fullyfunded':
                return 'Fully Funded';
            case '8':
            case 'inprogress':
                return 'In Progress';
            case '9':
            case 'completed':
                return 'Completed';
            case '10':
            case 'archived':
                return 'Archived';
            default:
                return statusStr || 'Active';
        }
    }
    getOpportunityInvestmentType(opportunity) {
        switch (String(opportunity?.investmentModel || '').toLowerCase()) {
            case 'loaninvestment':
            case 'loan':
            case 'debt':
                return InvestmentType.Loan;
            case 'capitalcontributionprofitsharing':
            case 'profitsharing':
            case 'revenuesharing':
                return InvestmentType.RevenueSharing;
            case 'equity':
            default:
                return InvestmentType.Equity;
        }
    }
    getOpportunityInvestmentModelLabel(opportunity) {
        return this.getInvestmentTypeDisplay(this.getOpportunityInvestmentType(opportunity));
    }
    getOpportunityCoverUrl(opportunity) {
        const media = this.getOpportunityMedia(opportunity);
        const cover = media.find(item => item.isCover || item.purpose === 'Cover');
        return this.resolveImageUrl(cover?.fileUrl || cover?.previewUrl || cover?.thumbnailUrl || opportunity?.coverImageUrl || '');
    }
    getOpportunityGallery(opportunity) {
        return this.getOpportunityMedia(opportunity).filter(item => {
            const mime = String(item.mimeType || '');
            return item.purpose === 'Gallery' || (!!mime && mime.startsWith('image') && item.purpose !== 'Cover' && !item.isCover);
        });
    }
    getOpportunityPitchVideo(opportunity) {
        return this.getOpportunityMedia(opportunity).find(item => item.purpose === 'PitchVideo' || String(item.mimeType || '').startsWith('video')) || null;
    }
    getOpportunityDocuments(opportunity) {
        const raw = opportunity?.documents ?? opportunity?.documentsLibrary ?? [];
        const docs = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
        return docs.filter(doc => doc.visibility !== 'Private' && doc.isPublic !== false);
    }
    getOpportunityEvents(opportunity) {
        const raw = opportunity?.events ?? opportunity?.timeline ?? [];
        const events = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
        return events.filter(event => event.isPublic !== false);
    }
    getOpportunityFileUrl(file) {
        return this.resolveImageUrl(file?.fileUrl || file?.previewUrl || file?.thumbnailUrl || '');
    }
    getOpportunityFundingProgress(opportunity) {
        const parsed = Number(opportunity?.fundingProgressPercent ?? 0);
        if (!Number.isFinite(parsed))
            return 0;
        return Math.max(0, Math.min(100, parsed));
    }
    getUseOfFunds(opportunity) {
        return opportunity?.useOfFunds || opportunity?.fundingPurpose || opportunity?.fundingUsage || '';
    }
    getRelationshipState() {
        const state = this.viewerState();
        const conversationStatus = this.normalizeConversationStatus(state?.conversationStatus, state?.conversationStatusText);
        const conversationRequestStatus = this.normalizeConversationRequestStatus(state?.conversationRequestStatus, state?.conversationRequestStatusText);
        const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);
        if (!state) {
            return {
                state: 'viewer-state-unavailable',
                title: 'Relationship status unavailable',
                description: 'We could not load your current relationship with this opportunity.',
                progress: 'Refresh the page or sign in to see your next action.',
                primaryAction: 'none',
                primaryLabel: 'Unavailable',
                tone: 'warning'
            };
        }
        if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || participationStatus.includes('approved')) {
            return {
                state: 'participant-approved',
                title: 'Participation approved',
                description: 'You are now an approved Project Participant.',
                progress: 'Project Room access is unlocked for private documents, updates, downloads, and collaboration.',
                primaryAction: 'open-room',
                primaryLabel: 'Open Project Room',
                tone: 'success'
            };
        }
        if (participationStatus.includes('rejected') || participationStatus.includes('declined')) {
            return {
                state: 'participation-rejected',
                title: 'Participation not approved',
                description: 'The Participation Request was declined by the Founder.',
                progress: 'Project Room remains locked. Continue only through the existing conversation if both sides agree.',
                primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
                primaryLabel: state.hasConversation && state.conversationId ? 'View Conversation' : 'No action available',
                tone: 'danger'
            };
        }
        if (state.hasPendingParticipationRequest || participationStatus.includes('pending') || conversationStatus.includes('participationcreated')) {
            return {
                state: 'participation-pending',
                title: 'Participation Request Pending',
                description: 'Your Participation Request is waiting for Founder approval.',
                progress: 'Project Room remains locked until the Founder gives final approval.',
                primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
                primaryLabel: state.hasConversation && state.conversationId ? 'View Conversation' : 'Waiting for Founder',
                tone: 'warning'
            };
        }
        if (conversationStatus.includes('closed') || conversationStatus.includes('withdraw') || conversationStatus.includes('reject') || conversationStatus.includes('declin') || conversationStatus.includes('cancel')) {
            return {
                state: 'discussion-closed',
                title: 'Discussion Closed',
                description: 'The conversation for this opportunity is closed.',
                progress: 'There is no active participation workflow from this discussion.',
                primaryAction: state.canRequestChat ? 'request-chat' : 'none',
                primaryLabel: state.canRequestChat ? 'Request Chat' : 'No action available',
                tone: 'neutral'
            };
        }
        if (conversationStatus.includes('readyforparticipation')) {
            if (state.investorReady && !state.founderReady) {
                return {
                    state: 'ready-waiting-founder',
                    title: 'You are ready to proceed',
                    description: 'You marked yourself ready after negotiation.',
                    progress: 'Waiting for the Founder to confirm readiness before a Participation Request is created.',
                    primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
                    primaryLabel: state.hasConversation && state.conversationId ? 'Continue Conversation' : 'Waiting for Founder',
                    tone: 'info'
                };
            }
            if (state.founderReady && !state.investorReady) {
                return {
                    state: 'ready-waiting-investor',
                    title: 'Founder is ready to proceed',
                    description: 'Review the negotiation and confirm when you are ready.',
                    progress: 'Participation is not created until both sides are ready.',
                    primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
                    primaryLabel: state.hasConversation && state.conversationId ? 'Continue Conversation' : 'Review Conversation',
                    tone: 'info'
                };
            }
            return {
                state: 'ready-creating-participation',
                title: 'Ready for participation',
                description: 'Both sides are ready to proceed.',
                progress: 'The formal Participation Request is being prepared or already created by the backend workflow.',
                primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
                primaryLabel: state.hasConversation && state.conversationId ? 'View Conversation' : 'Waiting',
                tone: 'info'
            };
        }
        if (conversationStatus.includes('accepted') || conversationStatus.includes('progress') || conversationStatus.includes('negotiation')) {
            return {
                state: 'negotiation',
                title: 'Negotiation in Progress',
                description: 'You and the Founder are discussing this opportunity.',
                progress: 'Chat is not participation. Project Room unlocks only after a Participation Request is approved.',
                primaryAction: state.hasConversation && state.conversationId ? 'open-chat' : 'none',
                primaryLabel: state.hasConversation && state.conversationId ? 'Continue Conversation' : 'Conversation unavailable',
                tone: 'info'
            };
        }
        if (state.hasConversationRequest && !state.hasConversation && (conversationRequestStatus.includes('pending') || conversationRequestStatus.includes('requested'))) {
            return {
                state: 'chat-requested',
                title: 'Waiting for Founder response',
                description: 'Your chat request has been sent to the Founder.',
                progress: 'No duplicate request is needed. Participation actions appear only after negotiation progresses.',
                primaryAction: 'none',
                primaryLabel: 'Waiting for Founder',
                tone: 'warning'
            };
        }
        return {
            state: 'never-contacted',
            title: 'Start the discussion',
            description: 'Request a chat to learn more and discuss this opportunity with the Founder.',
            progress: 'Chat opens negotiation only. It does not make you a Participant.',
            primaryAction: state.canRequestChat ? 'request-chat' : 'none',
            primaryLabel: state.canRequestChat ? 'Request Chat' : 'No action available',
            tone: 'neutral'
        };
    }
    showRequestChatButton() {
        return this.relationshipState().primaryAction === 'request-chat' && this.viewerState()?.canRequestChat === true;
    }
    showOpenChatButton() {
        const state = this.viewerState();
        return this.relationshipState().primaryAction === 'open-chat' && state?.hasConversation === true && !!state.conversationId;
    }
    showParticipateButton() {
        return this.canOpenParticipationBuilder();
    }
    canOpenParticipationBuilder() {
        const state = this.viewerState();
        const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
        if (!opportunityId || state?.isFounder)
            return false;
        if (state?.projectRoomUnlocked || state?.canOpenProjectRoom)
            return false;
        if (state?.hasPendingParticipationRequest)
            return false;
        const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);
        return !participationStatus.includes('pending') && !participationStatus.includes('approved');
    }
    showProjectRoomButton() {
        return this.relationshipState().primaryAction === 'open-room';
    }
    canEndDiscussion() {
        return false;
    }
    endDiscussion() {
        this.notificationService.showToast({
            title: 'Discussion close coming soon',
            message: 'Closing a discussion needs a backend negotiation endpoint.',
            type: 'info'
        });
    }
    getOpportunityMedia(opportunity) {
        const raw = opportunity?.media ?? opportunity?.mediaLibrary ?? [];
        const media = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
        return media.filter(item => item.isPublic !== false);
    }
    getTimelineEvents(opportunity) {
        return this.getOpportunityEvents(opportunity).filter(event => !this.isOperationalUpdate(event));
    }
    getUpdateEvents(opportunity) {
        return this.getOpportunityEvents(opportunity).filter(event => this.isOperationalUpdate(event));
    }
    getEventDate(event) {
        return event?.eventDate || event?.date || event?.createdAt || null;
    }
    getRelationshipToneClass(tone) {
        switch (tone) {
            case 'success':
                return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
            case 'danger':
                return 'border-red-500/30 bg-red-500/10 text-red-100';
            case 'warning':
                return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
            case 'info':
                return 'border-blue-500/30 bg-blue-500/10 text-blue-100';
            default:
                return 'border-slate-600/60 bg-slate-900/60 text-slate-100';
        }
    }
    isOperationalUpdate(event) {
        const type = String(event.eventType || event.type || event.title || '').toLowerCase();
        return ['update', 'announcement', 'document', 'uploaded', 'purchased', 'supplier', 'equipment', 'photo', 'progress'].some(token => type.includes(token));
    }
    normalizeConversationStatus(value, statusText) {
        if (typeof value === 'number') {
            switch (value) {
                case 0: return 'requested';
                case 1: return 'accepted';
                case 2: return 'negotiation';
                case 3: return 'closedbyfounder';
                case 4: return 'closedbyinvestor';
                case 5: return 'cancelled';
                case 6: return 'closed';
                case 7: return 'readyforparticipation';
                case 8: return 'participationcreated';
                case 9: return 'participationapproved';
                case 10: return 'participationrejected';
                case 11: return 'declinedbyfounder';
            }
        }
        const raw = `${value ?? ''} ${statusText ?? ''}`;
        return raw.toLowerCase().replace(/[\s_-]+/g, '');
    }
    normalizeConversationRequestStatus(value, statusText) {
        if (typeof value === 'number') {
            switch (value) {
                case 0: return 'pending';
                case 1: return 'accepted';
                case 2: return 'rejected';
                case 3: return 'withdrawn';
            }
        }
        const raw = `${value ?? ''} ${statusText ?? ''}`;
        return raw.toLowerCase().replace(/[\s_-]+/g, '');
    }
    normalizeParticipationStatus(value) {
        if (typeof value === 'number') {
            switch (value) {
                case 0: return 'pending';
                case 1: return 'approved';
                case 2: return 'rejected';
                case 3: return 'cancelled';
            }
        }
        return String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
    }
    parsePositiveNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    extractPercent(value) {
        if (!value)
            return undefined;
        const match = value.match(/(\d+(?:\.\d+)?)/);
        return match ? Number(match[1]) : undefined;
    }
    async loadFounderAvatar(userId) {
        if (!userId)
            return;
        // Already cached
        if (Object.prototype.hasOwnProperty.call(this.founderAvatarCache(), userId))
            return;
        try {
            const url = await this.fileStoreService.getProfilePictureUrl(userId);
            this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: url || '' }));
        }
        catch (err) {
            this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: '' }));
            console.warn('Failed to load founder avatar for', userId, err);
        }
    }
    onFounderAvatarError(userId) {
        if (!userId)
            return;
        this.founderAvatarCache.update(m => ({ ...(m || {}), [userId]: '' }));
    }
    founderAvatar(inv) {
        if (!inv)
            return '';
        const uid = this.getFounderId(inv);
        const cached = uid ? this.founderAvatarCache()[uid] : undefined;
        if (cached)
            return cached;
        return this.getOpportunityCoverUrl(inv);
    }
    getHeroImageUrl(inv) {
        if (!inv)
            return '';
        return this.getOpportunityCoverUrl(inv);
    }
    getRoomOpportunityId(inv) {
        if (!inv)
            return null;
        return inv.id ?? null;
    }
    resolveImageUrl(url) {
        return this.fileStoreService.getPublicUrl(url);
    }
    /**
     * Get project media images (excluding cover images)
     * Cover images (mediaType === 0) are not part of the project media gallery
     */
    getProjectMediaImages(inv) {
        return this.getOpportunityGallery(inv);
    }
    /**
     * Get the current active cover image (if any)
     */
    getCoverImage(inv) {
        return this.getOpportunityPitchVideo(inv);
    }
    /**
     * Check if the current opportunity is in Draft status
     * Backend sends numeric enum: Draft = 1, UnderReview = 2, etc.
     */
    isDraft() {
        const status = this.publicOpportunity()?.status;
        const statusStr = String(status || '').toLowerCase();
        // Handle both numeric enum (1 = Draft) and string values
        return statusStr === '1' || statusStr === 'draft';
    }
    /**
     * Check if the current user is the founder of this opportunity
     * Compares current user ID with opportunity founderId directly
     * Does not depend on viewer state which may fail for Draft opportunities
     */
    isFounder() {
        const currentUserId = this.userService.user()?.userId;
        const opportunityFounderId = this.getFounderId(this.publicOpportunity());
        return currentUserId === opportunityFounderId;
    }
    /**
     * Publish the opportunity directly
     * Uses the direct founder publish flow.
     */
    async publishOpportunity() {
        const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
        if (!opportunityId)
            return;
        try {
            this.engagementProcessing.set(true);
            const quote = await this.walletService.getPaidActionQuote('PublishOpportunity');
            if (!quote.hasSufficientCredit) {
                this.notificationService.showToast({ title: this.t('paidActions.insufficientTitle'), message: this.insufficientCreditText(quote), type: 'error' });
                return;
            }
            const confirmation = this.t('opportunityPublish.confirmation')
                .replace('{action}', this.t('opportunityPublish.action'))
                .replace('{cost}', this.formatCredits(quote.creditCost))
                .replace('{balance}', this.formatCredits(quote.currentBalance))
                .replace('{after}', this.formatCredits(quote.balanceAfter));
            if (!window.confirm(confirmation))
                return;
            await this.opportunityService.publishOpportunity(opportunityId);
            this.notificationService.showToast({
                title: this.t('opportunityPublish.successTitle'),
                message: this.t('opportunityPublish.successMessage'),
                type: 'success'
            });
            // Reload to get updated status
            await this.loadInvestment();
        }
        catch (error) {
            this.notificationService.showToast({
                title: this.t('opportunityPublish.failureTitle'),
                message: error?.error?.message || error?.message || this.t('opportunityPublish.failureMessage'),
                type: 'error'
            });
        }
        finally {
            this.engagementProcessing.set(false);
        }
    }
    /**
     * Navigate to edit the opportunity
     */
    editOpportunity() {
        const opportunityId = this.getPublicOpportunityId(this.publicOpportunity());
        if (opportunityId) {
            this.router.navigate(['/admin/opportunities', opportunityId, 'edit']);
        }
    }
    async promptEngage(investment) {
        // Ensure profile is fresh so dialog shows correct credits
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before engagement dialog:', err);
        }
        // Set investment and open initial engagement modal
        this.investmentToEngage.set(investment);
    }
    /**
     * Contact Founder Flow
     * Opens credit confirmation dialog, then creates request with ContactFounder type
     */
    async promptContactFounder(investment) {
        // Ensure profile is fresh so dialog shows correct credits
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before contact founder dialog:', err);
        }
        this.investmentToEngage.set(investment);
        try {
            this.contactFounderQuote.set(await this.loadPaidActionQuote('SendConversationRequest'));
        }
        catch (error) {
            this.notificationService.showToast({
                title: this.t('paidActions.pricingUnavailableTitle'),
                message: error?.message || this.t('paidActions.pricingUnavailableMessage'),
                type: 'error'
            });
            return;
        }
        this.contactFounderConfirmationOpen.set(true);
    }
    toOpportunityView(opportunity) {
        const source = opportunity;
        const targetFund = Number(source.fundingTarget ?? source.targetFund ?? 0);
        const fundingPercentage = this.numberOrNull(source.fundingProgressPercentage ?? source.fundingProgressPercent);
        const currentFunding = this.numberOrNull(source.fundedAmount);
        return {
            ...source,
            name: source.title || source.name || 'Untitled Opportunity',
            targetFund,
            currentFunding,
            fundingPercentage,
            remainingFundingAmount: this.numberOrNull(source.remainingFundingAmount),
            investorCount: this.numberOrNull(source.approvedParticipantCount),
            minInvestment: Number(source.minimumInvestmentAmount ?? source.minimumInvestment ?? 0),
            maxInvestment: Number(source.maximumInvestmentAmount ?? source.maximumInvestment ?? 0),
            currency: source.currency || '',
            imageUrl: source.coverImageUrl || source.imageUrl || ''
        };
    }
    numberOrNull(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    mergeAuthorizedRoomSummary(opportunity, room) {
        const overview = (room.overview ?? {});
        const context = room.participantContext ?? {};
        return {
            ...opportunity,
            ...overview,
            approvedParticipantCount: context.approvedParticipantCount ?? opportunity.approvedParticipantCount,
            canAccessProjectRoom: context.canAccessProjectRoom ?? opportunity.canAccessProjectRoom
        };
    }
    /**
     * Invest Now Flow (Equity)
     * Opens equity investment dialog for share selection
     */
    async promptInvestNow(investment) {
        // Ensure profile is fresh so dialog shows correct credits
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before invest now dialog:', err);
        }
        // Reset shares to 1
        this.equitySharesRequested.set(1);
        this.investmentToInvest.set(investment);
        this.investNowDialogOpen.set(true);
    }
    /**
     * Open invest dialog for all investment types (UX validation only)
     * This is a UX flow only - no backend persistence
     */
    async promptInvest(investment) {
        // Refresh profile first so credits are up-to-date
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before invest dialog:', err);
        }
        // Reset form data
        this.investNowForm.update(form => ({
            ...form,
            shares: 1,
            participationAmount: 0,
            fundingAmount: 0,
            interestMessage: ''
        }));
        // Open invest dialog for all investment types
        this.investmentToInvest.set(investment);
    }
    closeInvestDialog() {
        this.investmentToInvest.set(null);
        this.investmentError.set(null);
        this.investmentProcessing.set(false);
        this.sharesToPurchaseValue = 1;
    }
    submitInvestNow(investment) {
        // UX validation only - no backend persistence
        this.notificationService.showToast({
            title: 'Interest Submitted',
            message: 'Your investment interest has been recorded (UX validation only)',
            type: 'success'
        });
        this.closeInvestDialog();
    }
    increaseShares(investment) {
        if (this.sharesToPurchaseValue < (investment.availableShares || 0)) {
            this.sharesToPurchaseValue++;
        }
    }
    decreaseShares() {
        if (this.sharesToPurchaseValue > 1) {
            this.sharesToPurchaseValue--;
        }
    }
    validateShares(investment) {
        const val = this.sharesToPurchaseValue;
        const dictionary = this.languageService.dictionary();
        const minError = get(dictionary, 'investments.shareValidation.minError', 'Shares must be at least 1');
        const maxErrorTemplate = get(dictionary, 'investments.shareValidation.maxError', 'Maximum {available} shares available');
        if (isNaN(val) || val < 1) {
            this.sharesToPurchaseValue = 1;
            this.investmentError.set(minError);
        }
        else if (val > (investment.availableShares || 0)) {
            this.sharesToPurchaseValue = investment.availableShares || 1;
            const available = investment.availableShares || 0;
            this.investmentError.set(maxErrorTemplate.replace('{available}', String(available)));
        }
        else {
            this.investmentError.set(null);
        }
    }
    calculateRequestedAmount(investment) {
        return (investment.sharePrice || 0) * this.sharesToPurchaseValue;
    }
    /**
     * Confirm investment request
     *
     * Validates user has sufficient credits, then creates investment request
     * Credits are deducted immediately and request is sent to founder for approval
     * If founder accepts, investment is processed; if declined, credits are refunded
     */
    async confirmInvestment(investment) {
        if (this.investmentProcessing() || this.investmentError())
            return;
        this.investmentProcessing.set(true);
        this.investmentError.set(null);
        // Refresh user profile to get latest credits before checking
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before confirming investment:', err);
        }
        const requestedAmount = this.calculateRequestedAmount(investment);
        const quote = await this.loadPaidActionQuote('SubmitParticipationRequest');
        // Validate sufficient credits
        if (!quote.hasSufficientCredit) {
            this.investmentError.set(this.insufficientCreditText(quote));
            this.investmentProcessing.set(false);
            this.notificationService.showToast({
                title: this.t('paidActions.insufficientTitle'),
                message: this.insufficientCreditText(quote),
                type: 'error'
            });
            return;
        }
        // Create investment request via API
        try {
            await this.requestsService.createOpportunityRequest(investment, requestedAmount, this.sharesToPurchaseValue);
            const { title, message } = this.getRequestSubmittedCopy(investment);
            this.notificationService.showToast({ title, message, type: 'success' });
            this.closeInvestDialog();
        }
        catch (error) {
            console.error('Investment request failed:', error);
            const apiMessage = error?.error?.message || error?.message;
            this.investmentError.set(apiMessage || 'Failed to submit investment request');
            // Map backend error message to localized key
            const localizedMessage = apiMessage === 'You already have a pending request for this investment'
                ? this.languageService.translate('requests.pendingRequestExists')
                : (apiMessage || 'Failed to submit investment request. Please try again.');
            this.notificationService.showToast({ title: 'Request Failed', message: localizedMessage, type: 'error' });
        }
        finally {
            this.investmentProcessing.set(false);
        }
    }
    cancelEngage() {
        this.investmentToEngage.set(null);
        this.engagementConfirmationOpen.set(false);
    }
    /**
     * Cancel engagement confirmation and return to initial modal
     */
    cancelEngagementConfirmation() {
        this.engagementConfirmationOpen.set(false);
    }
    /**
     * Contact Founder Flow - Cancel
     */
    cancelContactFounder() {
        this.investmentToEngage.set(null);
        this.contactFounderConfirmationOpen.set(false);
    }
    /**
     * Contact Founder Flow - Confirm
     * Creates request with ContactFounder type and null metadata
     */
    async confirmContactFounder() {
        const investment = this.investmentToEngage();
        if (!investment || this.contactFounderProcessing())
            return;
        // Refresh user profile to ensure latest credits
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before contact founder confirmation:', err);
        }
        const quote = this.contactFounderQuote() || await this.loadPaidActionQuote('SendConversationRequest');
        // Validate sufficient credits for contact founder
        if (!quote.hasSufficientCredit) {
            this.notificationService.showToast({
                title: this.t('paidActions.insufficientTitle'),
                message: this.insufficientCreditText(quote),
                type: 'error'
            });
            return;
        }
        this.contactFounderProcessing.set(true);
        try {
            const opportunityId = this.getPublicOpportunityId(investment);
            if (opportunityId) {
                await this.opportunityService.requestConversation(opportunityId);
                await this.loadViewerState(opportunityId);
            }
            const { title, message } = this.getRequestSubmittedCopy(investment);
            this.notificationService.showToast({ title, message, type: 'success' });
            this.investmentToEngage.set(null);
            this.contactFounderConfirmationOpen.set(false);
        }
        catch (error) {
            console.error('Contact founder request failed:', error);
            const apiMessage = error?.error?.message || error?.message;
            // Map backend error message to localized key
            const localizedMessage = apiMessage === 'You already have a pending request for this investment'
                ? this.languageService.translate('requests.pendingRequestExists')
                : (apiMessage || 'Failed to submit request. Please try again.');
            this.notificationService.showToast({ title: 'Request Failed', message: localizedMessage, type: 'error' });
        }
        finally {
            this.contactFounderProcessing.set(false);
        }
    }
    /**
     * Invest Now Flow - Close dialog
     */
    closeInvestNowDialog() {
        this.investmentToInvest.set(null);
        this.investNowDialogOpen.set(false);
        this.investNowConfirmationOpen.set(false);
        this.investmentError.set(null);
        this.equitySharesRequested.set(1);
    }
    /**
     * Invest Now Flow - Proceed to confirmation
     */
    async proceedToInvestConfirmation(investment) {
        const shares = this.equitySharesRequested();
        if (!investment.sharePrice || shares < 1) {
            this.investmentError.set(this.t('paidActions.errors.invalidShareSelection'));
            return;
        }
        try {
            const quote = await this.loadPaidActionQuote('SubmitParticipationRequest');
            this.investNowQuote.set(quote);
            if (!quote.hasSufficientCredit) {
                this.investmentError.set(this.insufficientCreditText(quote));
                return;
            }
        }
        catch (error) {
            this.investmentError.set(error?.message || this.t('paidActions.pricingUnavailableMessage'));
            return;
        }
        this.investNowDialogOpen.set(false);
        this.investNowConfirmationOpen.set(true);
        this.investmentError.set(null);
    }
    /**
     * Invest Now Flow - Cancel confirmation
     */
    cancelInvestConfirmation() {
        this.investNowConfirmationOpen.set(false);
        this.investNowDialogOpen.set(true);
        this.investmentError.set(null);
    }
    /**
     * Invest Now Flow - Confirm investment
     * Creates request with InvestmentInterest type and equity metadata
     */
    async confirmInvestNow(investment) {
        if (this.investNowProcessing() || this.investmentError())
            return;
        this.investNowProcessing.set(true);
        this.investmentError.set(null);
        // Refresh user profile to get latest credits before checking
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before confirming investment:', err);
        }
        const shares = this.equitySharesRequested();
        const totalValue = (investment.sharePrice || 0) * shares;
        const quote = this.investNowQuote() || await this.loadPaidActionQuote('SubmitParticipationRequest');
        // Validate sufficient credits
        if (!quote.hasSufficientCredit) {
            this.investmentError.set(this.insufficientCreditText(quote));
            this.investNowProcessing.set(false);
            this.notificationService.showToast({
                title: this.t('paidActions.insufficientTitle'),
                message: this.insufficientCreditText(quote),
                type: 'error'
            });
            return;
        }
        // Create investment request with metadata
        const metadata = {
            investmentType: 'equity',
            sharesRequested: shares,
            sharePrice: investment.sharePrice,
            totalValue: totalValue
        };
        try {
            await this.requestsService.createOpportunityRequest(investment, totalValue, shares, OpportunityRequestKind.Participation, metadata);
            const { title, message } = this.getRequestSubmittedCopy(investment);
            this.notificationService.showToast({ title, message, type: 'success' });
            this.closeInvestNowDialog();
        }
        catch (error) {
            console.error('Investment request failed:', error);
            const apiMessage = error?.error?.message || error?.message;
            this.investmentError.set(apiMessage || 'Failed to submit investment request');
            this.notificationService.showToast({ title: 'Request Failed', message: apiMessage || 'Failed to submit investment request. Please try again.', type: 'error' });
        }
        finally {
            this.investNowProcessing.set(false);
        }
    }
    /**
     * Invest Now Flow - Adjust shares
     */
    adjustShares(investment, delta) {
        const newShares = this.equitySharesRequested() + delta;
        const maxShares = investment.availableShares || 0;
        if (newShares >= 1 && newShares <= maxShares) {
            this.equitySharesRequested.set(newShares);
            this.investmentError.set(null);
        }
    }
    /**
     * Invest Now Flow - Calculate total value
     */
    calculateEquityTotalValue(investment) {
        return (investment.sharePrice || 0) * this.equitySharesRequested();
    }
    paidActionCost(quote) {
        return Number(quote?.creditCost ?? 0);
    }
    paidActionBalance(quote) {
        return Number(quote?.currentBalance ?? this.userCredits());
    }
    paidActionAfter(quote) {
        return Number(quote?.balanceAfter ?? this.paidActionBalance(quote) - this.paidActionCost(quote));
    }
    paidActionInsufficient(quote) {
        return !!quote && !quote.hasSufficientCredit;
    }
    addCredits() {
        this.router.navigate(['/admin/credit-charge']);
    }
    t(path) {
        return this.languageService.translate(path);
    }
    reportReasonLabel(reason) {
        return this.t(`reports.reasons.${reason}`);
    }
    openReport(type, id, title) {
        this.reportTarget.set({ type, id, title });
        this.reportReason.set(type === 'Opportunity' ? 'SuspiciousOpportunity' : 'Spam');
        this.reportDescription.set('');
        this.reportError.set(null);
        this.reportSuccess.set(false);
        this.reportModalOpen.set(true);
    }
    reportErrorMessage(error) {
        const raw = String(error?.error?.message || error?.message || '').toLowerCase();
        if (raw.includes('duplicate') || raw.includes('pending'))
            return this.t('reports.errors.duplicatePending');
        if (raw.includes('invalid') || raw.includes('target'))
            return this.t('reports.errors.invalidTarget');
        if (raw.includes('self'))
            return this.t('reports.errors.selfReport');
        return this.t('reports.errors.generic');
    }
    async loadPaidActionQuote(actionCode) {
        return this.walletService.getPaidActionQuote(actionCode);
    }
    insufficientCreditText(quote) {
        return this.t('paidActions.insufficientMessage')
            .replace('{required}', this.formatCredits(quote.creditCost))
            .replace('{balance}', this.formatCredits(quote.currentBalance));
    }
    formatCredits(value) {
        return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
    }
    /**
     * Confirm engagement for funding-based investments
     *
     * For funding/debt investments, engagement costs a fixed credit amount
     * Creates investment request similar to equity investment
     */
    async confirmEngage() {
        const investment = this.investmentToEngage();
        if (!investment || this.engagementProcessing())
            return;
        // Refresh user profile to ensure latest credits
        try {
            await this.userService.refreshUser();
        }
        catch (err) {
            console.warn('Failed to refresh user before engagement confirmation:', err);
        }
        const quote = await this.loadPaidActionQuote('SendConversationRequest');
        // Validate sufficient credits for engagement
        if (!quote.hasSufficientCredit) {
            this.notificationService.showToast({
                title: this.t('paidActions.insufficientTitle'),
                message: this.insufficientCreditText(quote),
                type: 'error'
            });
            return;
        }
        this.engagementProcessing.set(true);
        try {
            const opportunityId = this.getPublicOpportunityId(investment);
            if (opportunityId) {
                await this.opportunityService.requestConversation(opportunityId);
                await this.loadViewerState(opportunityId);
            }
            const { title, message } = this.getRequestSubmittedCopy(investment);
            this.notificationService.showToast({ title, message, type: 'success' });
            this.investmentToEngage.set(null);
            this.engagementConfirmationOpen.set(false);
        }
        catch (error) {
            console.error('Engagement request failed:', error);
            this.notificationService.showToast({ title: this.t('paidActions.requestFailed'), message: error.message || this.t('paidActions.errors.chatRequestFailed'), type: 'error' });
        }
        finally {
            this.engagementProcessing.set(false);
        }
    }
    getRequestSubmittedCopy(investment) {
        const dictionary = this.languageService.dictionary();
        const title = get(dictionary, 'investments.requestSubmittedTitle', 'Request Sent');
        const messageTemplate = get(dictionary, 'investments.requestSubmittedMessage', 'Your request for {investmentName} was submitted. We will notify you once it is accepted.');
        return {
            title,
            message: messageTemplate.replace('{investmentName}', investment.title || investment.name || 'Opportunity')
        };
    }
    // Helpers for template
    getInvestmentTypeDisplay(type) {
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
    getInvestmentTypeBadgeClass(type) {
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
    getDaysRemaining(endDate) {
        if (!endDate)
            return -1;
        const diff = new Date(endDate).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / 86400000));
    }
    /**
     * Get a human-readable description for the current status
     */
    getStatusDescription(status) {
        const descriptions = {
            'Draft': 'Draft - Not yet published',
            'Active': 'Currently accepting participants',
            'Reviewing Participants': 'Reviewing participation requests',
            'In Progress': 'Project is in progress',
            'Fully Funded': 'Funding target reached',
            'Paused': 'Temporarily paused',
            'Completed': 'Project completed',
            'Archived': 'Archived',
            'Closed': 'Campaign ended'
        };
        return descriptions[status] || status || 'Unknown';
    }
    /**
     * Get project stages for the roadmap
     */
    getProjectStages() {
        return [
            'MVP Development',
            'Beta Testing',
            'Market Launch',
            'User Acquisition',
            'Revenue Generation',
            'Scale Operations'
        ];
    }
    /**
     * Get the current stage index based on projectPhaseId
     * Maps projectPhaseId (6-11) to stage index (0-5)
     */
    getCurrentStageIndex() {
        const inv = this.investment();
        if (!inv || inv.projectPhaseId === undefined || inv.projectPhaseId === null) {
            return 0;
        }
        // projectPhaseId ranges from 6 to 11 (6 phases total)
        // Map to index 0-5
        const index = inv.projectPhaseId - 6;
        return Math.max(0, Math.min(5, index));
    }
    /**
     * Get founder's total opportunities count
     */
    getFounderTotalOpportunities() {
        const inv = this.investment();
        // Use investorCount as a proxy for total opportunities for now
        return inv?.investorCount || 0;
    }
    /**
     * Get founder's active opportunities count
     */
    getFounderActiveOpportunities() {
        const inv = this.investment();
        return inv?.investorCount || 0;
    }
    /**
        * Check if investment type is Equity
        */
    isEquity(inv) {
        return inv?.investmentType === InvestmentType.Equity;
    }
    /**
     * Check if investment type is Revenue Sharing
     */
    isRevenueSharing(inv) {
        return inv?.investmentType === InvestmentType.RevenueSharing;
    }
    /**
     * Check if investment type is Loan
     */
    isLoan(inv) {
        return inv?.investmentType === InvestmentType.Loan;
    }
    /**
     * Check if investment type is Founding
     */
    isFounding(inv) {
        return inv?.investmentType === InvestmentType.Founding;
    }
    static { this.ɵfac = function InvestmentPreviewComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvestmentPreviewComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvestmentPreviewComponent, selectors: [["app-investment-preview"]], decls: 18, vars: 12, consts: [[1, "investment-preview-page"], [1, "investment-preview-routebar"], [1, "investment-preview-routebar-inner"], ["routerLink", "/admin/investments", 1, "investment-preview-routebar-link"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "rtl:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "container", "mx-auto", "px-6", "py-40"], ["tabindex", "0", "role", "dialog", 1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/90", "backdrop-blur-sm", "animate-fade-in"], [1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "animate-fade-in"], [1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "p-4", "bg-black/60", "backdrop-blur-sm", "animate-fade-in"], ["source", "PublicOpportunity", 3, "opportunityId", "opportunityTitle"], [1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/60", "p-4", "backdrop-blur-sm"], [1, "public-opportunity", "animate-fade-in"], [1, "animate-fade-in"], [1, "public-draft-banner"], [1, "public-shell", "public-topbar"], ["routerLink", "/admin/investments", 1, "public-back-link"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "h-4", "w-4", "rtl:rotate-180"], ["type", "button", 1, "investa-btn-ghost"], [1, "public-shell", "public-layout"], [1, "public-main"], [1, "public-hero"], [1, "public-hero-image", 3, "src", "alt"], [1, "public-hero-overlay"], [1, "public-hero-content"], [1, "public-badges"], [1, "public-badge", "public-badge-green"], [1, "public-badge"], ["type", "button", 1, "public-founder", 3, "click"], [1, "public-founder-avatar"], [1, "public-hero-meta"], ["aria-label", "Opportunity sections", 1, "public-section-nav"], ["href", "#overview"], ["href", "#terms"], ["href", "#updates"], ["href", "#documents"], ["href", "#media"], ["id", "overview", 1, "public-content-grid"], [1, "public-card", "public-card-wide"], [1, "public-section-heading"], [1, "public-body-copy"], [1, "public-highlights"], [1, "public-card"], [1, "public-body-copy", "compact"], ["id", "terms", 1, "public-card"], [1, "public-terms-grid"], [1, "public-term-wide"], ["id", "updates", 1, "public-card"], [1, "public-list"], [1, "public-empty"], [1, "public-two-column"], ["id", "documents", 1, "public-card"], [1, "public-file-list"], ["id", "media", 1, "public-card"], [1, "public-media-grid"], [1, "public-investment-panel"], [1, "public-summary-card"], [1, "public-summary-heading"], [1, "public-summary-numbers"], [1, "public-progress"], [1, "public-summary-grid"], ["id", "relationship-state", 1, "public-relationship-card"], [1, "public-relationship-heading"], [1, "public-relationship-actions"], ["type", "button", 1, "investa-btn-primary", 3, "disabled"], ["type", "button", 1, "investa-btn-primary"], [1, "investa-btn-primary", 3, "routerLink"], ["type", "button", 1, "investa-btn-secondary"], ["type", "button", 1, "investa-btn-secondary", "public-full-button"], [1, "public-shell", "public-draft-inner"], [1, "public-actions-row"], ["type", "button", 1, "investa-btn-secondary", 3, "click"], ["type", "button", 1, "investa-btn-primary", 3, "click", "disabled"], ["type", "button", 1, "investa-btn-ghost", 3, "click"], [1, "public-list-row"], [1, "public-list-icon"], ["target", "_blank", "rel", "noopener noreferrer", 1, "public-file-row", 3, "href"], [1, "public-file-icon"], ["aria-hidden", "true"], ["type", "button"], ["type", "button", 3, "click"], [3, "src", "alt"], ["type", "button", 1, "investa-btn-primary", 3, "click"], [1, "relative", "h-96", "bg-gradient-to-b", "from-slate-800", "to-slate-900", "overflow-hidden"], [1, "absolute", "top-0", "inset-x-0", "h-1", "z-10"], [1, "w-full", "h-full", "object-cover", "opacity-30", 3, "src", "alt"], [1, "absolute", "inset-0", "bg-gradient-to-t", "from-slate-950", "to-transparent"], [1, "absolute", "inset-0", "flex", "flex-col", "justify-end", "p-8"], [1, "flex", "items-start", "justify-between", "mb-4"], [1, "flex", "flex-wrap", "items-center", "gap-2", "mb-3"], [1, "px-3", "py-1", "text-sm", "font-semibold", "rounded-full", "inline-flex", 3, "ngClass"], [1, "px-3", "py-1", "text-sm", "font-semibold", "rounded-full", "inline-flex"], [1, "inline-flex", "items-center", "gap-1.5", "px-3", "py-1", "text-sm", "font-semibold", "rounded-full", "border", 3, "ngClass"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-emerald-400"], [1, "inline-flex", "items-center", "gap-1", "px-3", "py-1", "text-sm", "font-semibold", "rounded-full", "bg-slate-800/60", "border", 3, "class"], [1, "text-5xl", "font-bold", "text-white", "mb-2"], [1, "text-gray-400", "text-lg", "max-w-2xl"], [1, "flex", "items-center", "gap-3"], ["type", "button", 1, "p-3", "rounded-full", "hover:bg-white/10", "transition-colors", "text-gray-400", "hover:text-white"], ["fill", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["d", "M11.645 20.761A9.865 9.865 0 015.12 5.12a9.865 9.865 0 0115.625 13.625 9.865 9.865 0 01-9.1 1.016zM12 1a11 11 0 110 22 11 11 0 010-22z"], [1, "flex", "gap-2", "overflow-x-auto", "pb-1"], [1, "container", "mx-auto", "px-6", "py-12"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-8"], [1, "lg:col-span-2", "space-y-8"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-xl", "p-5"], [1, "flex", "flex-wrap", "items-center", "gap-x-6", "gap-y-3"], [1, "flex", "items-center", "gap-2"], [1, "text-xs", "uppercase", "tracking-wider", "text-gray-500"], [1, "px-2.5", "py-0.5", "text-xs", "font-bold", "rounded-md", 3, "ngClass"], [1, "text-xs", "text-gray-500"], [1, "w-px", "h-4", "bg-slate-700", "hidden", "md:block"], [1, "px-2.5", "py-0.5", "text-xs", "font-bold", "rounded-md"], [1, "inline-flex", "items-center", "gap-1.5", "px-2.5", "py-0.5", "text-xs", "font-bold", "rounded-md", "border", 3, "ngClass"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-emerald-400", "flex-shrink-0"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-xl", "p-8"], [1, "text-xl", "font-bold", "text-white", "mb-6"], [1, "relative"], [1, "absolute", "top-6", "left-0", "right-0", "h-1", "bg-gradient-to-r", "from-slate-700", "to-slate-700"], [1, "grid", "grid-cols-2", "md:grid-cols-6", "gap-4", "relative", "z-10"], [1, "text-center"], [1, "mt-8", "p-4", "bg-blue-500/10", "border", "border-blue-500/30", "rounded-lg"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-xl", "p-6"], [1, "grid", "grid-cols-2", "md:grid-cols-3", "gap-4"], [1, "bg-slate-800/40", "border", "border-slate-700/50", "rounded-lg", "p-4"], [1, "mb-6"], [1, "flex", "justify-between", "items-end", "mb-3"], [1, "text-gray-400", "text-sm", "mb-1"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-right"], [1, "text-2xl", "font-bold", "text-gray-300"], [1, "w-full", "bg-slate-700/50", "rounded-full", "h-4", "overflow-hidden", "border", "border-slate-600/50"], [1, "h-full", "transition-all", "duration-700", "ease-out"], [1, "flex", "justify-between", "items-center", "mt-3"], [1, "text-gray-400", "text-sm"], [1, "text-xs", "font-semibold", 3, "class"], [1, "mt-5", "grid", "grid-cols-2", "gap-3", "lg:grid-cols-4"], [1, "rounded-lg", "bg-slate-900/50", "p-3"], [1, "text-xs", "text-gray-400"], [1, "mt-1", "font-bold", "text-white"], [1, "bg-blue-500/10", "border", "border-blue-500/30", "rounded-lg", "p-4", "mt-4"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-4"], [1, "text-gray-500", "text-center", "py-8"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-6"], [1, "font-semibold", "text-white", "mb-4"], [1, "space-y-3"], [1, "flex", "justify-between", "text-sm"], [1, "text-gray-400"], [1, "text-white", "font-medium"], [1, "text-blue-300", "font-bold"], [1, "text-green-300", "font-bold"], [1, "lg:col-span-1"], [1, "sticky", "top-24", "space-y-6"], [1, "bg-slate-800/50", "border", "border-slate-700/50", "rounded-xl", "p-5", "backdrop-blur-sm"], [1, "flex", "items-center", "gap-3", "mb-4"], [1, "relative", "flex-shrink-0", "rounded-xl", "ring-2", "ring-slate-700", "hover:ring-blue-500/50", "transition-all", 3, "routerLink"], [1, "w-12", "h-12", "rounded-xl", "object-cover", 3, "src", "alt"], [1, "absolute", "-bottom-0.5", "-end-0.5", "w-3", "h-3", "rounded-full", "bg-emerald-500", "border-2", "border-slate-900"], [1, "flex-1", "min-w-0", "group", 3, "routerLink"], [1, "font-bold", "text-white", "truncate", "group-hover:text-blue-300", "transition-colors"], [1, "text-xs", "text-gray-400", "truncate", "mt-0.5"], [1, "grid", "grid-cols-2", "gap-2"], [1, "rounded-lg", "bg-slate-700/40", "border", "border-slate-700/30", "p-3", "text-center"], [1, "flex", "items-center", "justify-center", "gap-1", "mb-1"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3.5", "h-3.5", "text-amber-400"], ["d", "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"], [1, "text-[10px]", "text-gray-400", "uppercase", "tracking-wide"], [1, "text-xl", "font-bold", "text-white"], [1, "text-[10px]", "text-gray-400", "uppercase", "tracking-wide", "mb-1"], [1, "text-xl", "font-bold"], [1, "text-base", "font-bold", "text-white", "mb-4"], [1, "text-gray-500", "text-center", "py-4"], ["class", "flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/25 hover:border-purple-500/50 hover:bg-purple-500/15 transition-all group", 3, "routerLink", 4, "ngIf"], [1, "w-full", "bg-emerald-500/10", "hover:bg-emerald-500/15", "text-emerald-200", "font-bold", "py-3", "px-6", "rounded-lg", "border", "border-emerald-500/25", "hover:border-emerald-500/45", "transition-all", "flex", "items-center", "justify-center", "gap-2", 3, "routerLink"], ["type", "button", 1, "w-full", "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "transition-colors", "flex", "items-center", "justify-center", "gap-2", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 6.253a3 3 0 110 5.494a3 3 0 010-5.494z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M17.982 17.982A6.5 6.5 0 0012 15.5a6.5 6.5 0 00-5.982 2.482"], ["type", "button", 1, "w-full", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "hover:from-blue-600", "hover:to-purple-700", "text-white", "font-bold", "py-3", "px-6", "rounded-lg", "transition-all", "flex", "items-center", "justify-center", "gap-2", "disabled:opacity-50", "disabled:cursor-not-allowed", 3, "click", "disabled"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a10.77 10.77 0 01-4.67-1.03L3 20l1.03-3.33A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"], ["type", "button", 1, "w-full", "font-bold", "py-3", "px-6", "rounded-lg", "transition-all", "flex", "items-center", "justify-center", "gap-2", "text-base", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-slate-900", "disabled:opacity-50", "disabled:cursor-not-allowed", 3, "click", "disabled", "ngClass"], [1, "inline-flex", "items-center", "gap-1", "px-3", "py-1", "text-sm", "font-semibold", "rounded-full", "bg-slate-800/60", "border"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3.5", "h-3.5"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z", "clip-rule", "evenodd"], ["type", "button", 1, "flex-shrink-0", "h-24", "w-36", "rounded-lg", "overflow-hidden", "ring-1", "ring-white/10", "hover:ring-2", "hover:ring-blue-400/70", "transition-all", "focus:outline-none", "focus:ring-2", "focus:ring-blue-400"], ["type", "button", 1, "flex-shrink-0", "h-24", "w-36", "rounded-lg", "overflow-hidden", "ring-1", "ring-white/10", "hover:ring-2", "hover:ring-blue-400/70", "transition-all", "focus:outline-none", "focus:ring-2", "focus:ring-blue-400", 3, "click"], [1, "w-full", "h-full", "object-cover", 3, "src", "alt"], [1, "flex", "justify-center", "mb-3"], [1, "w-12", "h-12", "rounded-full", "flex", "items-center", "justify-center", "font-bold", "text-sm", "ring-4"], [1, "text-sm", "font-semibold"], [1, "inline-block", "mt-2", "px-2", "py-1", "text-xs", "font-bold", "bg-blue-500/20", "text-blue-300", "border", "border-blue-500/30", "rounded-full"], [1, "inline-block", "mt-2", "px-2", "py-1", "text-xs", "font-semibold", "text-green-400"], [1, "text-blue-300", "text-sm", "font-semibold", "mb-1"], [1, "text-blue-100", "text-lg", "font-bold"], [1, "text-xl", "font-bold", "text-white", "mb-5"], [1, "mb-5"], [1, "grid", "grid-cols-2", "sm:grid-cols-3", "gap-3"], [1, "relative", "w-full", "rounded-xl", "overflow-hidden", "bg-black", 2, "padding-top", "56.25%"], ["target", "_blank", "rel", "noopener noreferrer", 1, "flex", "items-center", "gap-3", "px-4", "py-3", "rounded-xl", "bg-blue-500/10", "border", "border-blue-500/20", "text-blue-300", "hover:bg-blue-500/20", "hover:text-blue-200", "transition-colors", "group", 3, "href"], ["frameborder", "0", "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", "allowfullscreen", "", 1, "absolute", "inset-0", "w-full", "h-full", 3, "src", "title"], [1, "w-10", "h-10", "rounded-full", "bg-blue-500/20", "flex", "items-center", "justify-center", "flex-shrink-0"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5"], ["d", "M10 12a2 2 0 100-4 2 2 0 000 4z"], ["fill-rule", "evenodd", "d", "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", "clip-rule", "evenodd"], [1, "flex-1", "min-w-0"], [1, "text-sm", "font-semibold", "truncate"], [1, "text-xs", "text-blue-400/60", "truncate", "mt-0.5"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-blue-400/70", "flex-shrink-0", "group-hover:translate-x-0.5", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"], ["type", "button", 1, "relative", "aspect-video", "rounded-lg", "overflow-hidden", "group/img", "ring-1", "ring-white/5", "hover:ring-2", "hover:ring-blue-400/50", "transition-all", "focus:outline-none", "focus:ring-2", "focus:ring-blue-400", 3, "title"], ["type", "button", 1, "relative", "aspect-video", "rounded-lg", "overflow-hidden", "group/img", "ring-1", "ring-white/5", "hover:ring-2", "hover:ring-blue-400/50", "transition-all", "focus:outline-none", "focus:ring-2", "focus:ring-blue-400", 3, "click", "title"], [1, "w-full", "h-full", "object-cover", "transition-transform", "duration-300", "group-hover/img:scale-105", 3, "src", "alt"], [1, "absolute", "inset-0", "bg-black/0", "group-hover/img:bg-black/30", "transition-colors", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-7", "h-7", "text-white", "opacity-0", "group-hover/img:opacity-100", "transition-opacity", "drop-shadow-lg"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803zM10.5 7.5v6m3-3h-6"], [1, "absolute", "bottom-0", "inset-x-0", "px-2", "py-1.5", "bg-gradient-to-t", "from-black/70", "to-transparent", "text-[11px]", "text-white", "font-medium", "truncate"], [1, "absolute", "top-1.5", "start-1.5", "px-1.5", "py-0.5", "rounded", "text-[10px]", "font-bold", "bg-blue-500/80", "text-white"], [1, "text-sm", "text-gray-400", "mb-2"], [1, "text-2xl", "font-bold", "text-blue-400"], [1, "text-2xl", "font-bold", "text-purple-400"], [1, "text-2xl", "font-bold", "text-green-400"], [1, "text-2xl", "font-bold", "text-blue-300"], [1, "text-2xl", "font-bold", "text-cyan-400"], [1, "text-2xl", "font-bold", "text-indigo-400"], [1, "text-xs", "font-semibold"], [1, "text-blue-300", "text-sm"], [1, "text-2xl", "font-bold", "text-blue-200"], ["type", "button", 1, "flex", "items-center", "gap-4", "p-4", "bg-slate-700/30", "hover:bg-slate-700/50", "rounded-lg", "transition-all", "hover:border-blue-500/50", "border", "border-slate-600/50"], ["type", "button", 1, "flex", "items-center", "gap-4", "p-4", "bg-slate-700/30", "hover:bg-slate-700/50", "rounded-lg", "transition-all", "hover:border-blue-500/50", "border", "border-slate-600/50", 3, "click"], [1, "w-14", "h-14", "rounded-lg", "object-cover", 3, "src", "alt"], [1, "w-14", "h-14", "rounded-lg", "bg-gradient-to-br", "from-blue-500", "to-purple-500", "flex", "items-center", "justify-center", "text-white", "text-lg", "font-bold"], [1, "flex-1", "text-left"], [1, "font-semibold", "text-white"], [1, "text-sm", "text-gray-400"], [1, "text-xs", "text-gray-500", "mt-1", "line-clamp-1"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-gray-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 5l7 7-7 7"], [1, "text-gray-300", "font-medium"], [1, "flex", "items-center", "gap-3", 3, "pb-3", "border-b", "border-slate-700/50"], [1, "text-center", "text-sm", "text-gray-400", "pt-2"], [1, "w-9", "h-9", "rounded-full", "object-cover", "ring-2", "ring-slate-700", "flex-shrink-0", 3, "src", "alt"], [1, "w-9", "h-9", "rounded-full", "bg-slate-700", "flex", "items-center", "justify-center", "text-gray-400", "text-xs", "font-bold", "flex-shrink-0", "ring-2", "ring-slate-600"], [1, "text-sm", "font-medium", "text-white", "truncate"], [1, "text-xs", "text-gray-400", "tabular-nums"], [1, "flex", "items-center", "gap-3", "px-4", "py-3", "rounded-xl", "bg-purple-500/10", "border", "border-purple-500/25", "hover:border-purple-500/50", "hover:bg-purple-500/15", "transition-all", "group", 3, "routerLink"], [1, "w-9", "h-9", "rounded-lg", "bg-purple-500/20", "border", "border-purple-500/30", "flex", "items-center", "justify-center", "flex-shrink-0"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-4", "h-4", "text-purple-400"], ["fill-rule", "evenodd", "d", "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z", "clip-rule", "evenodd"], [1, "text-sm", "font-semibold", "text-purple-300", "group-hover:text-purple-200", "transition-colors"], [1, "text-[11px]", "text-gray-500", "mt-0.5"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-purple-500", "group-hover:text-purple-300", "transition-colors", "flex-shrink-0", "rtl:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M9 5l7 7-7 7"], ["fill", "none", "stroke", "currentColor", "stroke-width", "1.5", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M3.75 21h16.5M4.5 3h15l-.75 18H5.25L4.5 3zm4.5 4.5h6m-6 4.5h6m-6 4.5h3"], ["fill-rule", "evenodd", "d", "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", "clip-rule", "evenodd"], ["fill-rule", "evenodd", "d", "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", "clip-rule", "evenodd"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "mb-6", "flex", "justify-center"], [1, "w-20", "h-20", "bg-red-500/10", "border-2", "border-red-500/30", "rounded-full", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-10", "h-10", "text-red-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 9v2m0 4v2m0 0v2m0-12V5m0 12V9m0-12h.01"], [1, "text-4xl", "font-bold", "text-white", "mb-2"], [1, "text-lg", "text-gray-400", "mb-8"], ["routerLink", "/admin/investments", 1, "inline-block", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "font-semibold", "py-3", "px-8", "rounded-full", "hover:opacity-90", "transition-opacity", "text-white"], ["tabindex", "0", "role", "dialog", 1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-black/90", "backdrop-blur-sm", "animate-fade-in", 3, "click", "keydown.escape"], ["type", "button", 1, "absolute", "top-4", "end-4", "p-2", "rounded-full", "bg-white/10", "hover:bg-white/20", "text-white", "transition-colors", "focus:outline-none", "focus:ring-2", "focus:ring-white/50", 3, "click"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M6 18L18 6M6 6l12 12"], ["alt", "", 1, "max-h-[90vh]", "max-w-[90vw]", "rounded-xl", "shadow-2xl", "object-contain", 3, "click", "src"], [1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "p-4", "animate-fade-in"], [1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "p-4", "animate-fade-in", 2, "animation-duration", "0.2s"], [1, "bg-gradient-to-br", "from-slate-900", "to-slate-800", "border", "border-slate-700", "rounded-2xl", "shadow-2xl", "w-full", "max-w-md", "animate-fade-in", 3, "click"], [1, "p-6", "border-b", "border-slate-700", "bg-gradient-to-r", "from-blue-500/10", "to-purple-500/10"], [1, "w-12", "h-12", "rounded-full", "bg-blue-500/20", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"], [1, "flex-1"], [1, "text-sm", "text-gray-400", "mt-1"], [1, "p-6", "space-y-4"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-lg", "p-4", "space-y-3"], [1, "flex", "items-center", "justify-between"], [1, "text-white", "font-semibold"], [1, "text-white", "font-bold", "text-lg"], [1, "flex", "items-center", "justify-between", "pt-3", "border-t", "border-slate-700/50"], [1, "text-blue-300", "font-semibold"], [1, "font-semibold"], [1, "bg-orange-500/10", "border", "border-orange-500/30", "rounded-lg", "p-4"], [1, "flex", "items-start", "gap-3"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-orange-400", "flex-shrink-0", "mt-0.5"], ["fill-rule", "evenodd", "d", "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", "clip-rule", "evenodd"], [1, "text-sm", "font-semibold", "text-orange-300", "mb-1"], [1, "text-sm", "text-orange-200/80"], [1, "p-6", "border-t", "border-slate-700", "flex", "items-center", "justify-between", "gap-3", "bg-slate-800/50"], [1, "flex-1", "bg-slate-700", "hover:bg-slate-600", "disabled:opacity-50", "disabled:cursor-not-allowed", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "transition-colors", 3, "click", "disabled"], [1, "flex-1", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "hover:from-blue-600", "hover:to-purple-700", "disabled:opacity-50", "disabled:cursor-not-allowed", "text-white", "font-bold", "py-3", "px-6", "rounded-lg", "transition-all", "flex", "items-center", "justify-center", "gap-2", 3, "click", "disabled"], ["fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "h-5", "w-5"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", 1, "opacity-75"], [1, "bg-slate-900", "border", "border-slate-700", "rounded-2xl", "shadow-2xl", "w-full", "max-w-lg", "p-8", "animate-fade-in", 2, "animation-delay", "0.1s", "animation-duration", "0.3s"], [1, "mx-auto", "flex", "h-16", "w-16", "items-center", "justify-center", "rounded-full", "bg-blue-500/10", "border-2", "border-blue-500/30", "mb-4"], ["fill", "none", "viewBox", "0 0 24 24", "stroke-width", "1.5", "stroke", "currentColor", 1, "w-8", "h-8", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-2xl", "font-bold", "text-white", "text-center", "mb-2"], [1, "text-gray-400", "text-center", "mb-6", 3, "innerHTML"], [1, "w-full", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "hover:from-blue-600", "hover:to-purple-700", "text-white", "font-bold", "py-3", "px-6", "rounded-lg", "transition-all", 3, "click"], [1, "w-full", "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "transition-colors", 3, "click"], [1, "fixed", "inset-0", "bg-black/70", "backdrop-blur-sm", "z-50", "flex", "items-center", "justify-center", "animate-fade-in", 3, "click"], [1, "bg-gradient-to-br", "from-slate-900", "to-slate-800", "border", "border-slate-700", "rounded-2xl", "shadow-2xl", "w-full", "max-w-md", "m-4", "animate-fade-in", 3, "click"], [1, "text-2xl", "font-bold", "text-white"], [1, "text-gray-400", "hover:text-white", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M6 18L18 6M6 6l12 12"], [1, "p-6", "space-y-5"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-lg", "p-4"], [1, "grid", "grid-cols-2", "gap-4"], [1, "text-xs", "text-gray-400", "uppercase", "tracking-wide", "mb-1"], [1, "text-xl", "font-semibold", "text-blue-300"], [1, "mt-3", "pt-3", "border-t", "border-slate-700/50", "flex", "items-center", "justify-between", "text-xs", "text-gray-400"], [1, "block", "text-sm", "font-medium", "text-gray-300", "mb-2"], [1, "bg-slate-700", "hover:bg-slate-600", "disabled:opacity-30", "disabled:cursor-not-allowed", "text-white", "font-bold", "w-10", "h-10", "rounded-lg", "transition-colors", 3, "click", "disabled"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "mx-auto"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M20 12H4"], ["type", "number", "min", "1", 1, "flex-1", "bg-slate-800", "border", "border-slate-600", "rounded-lg", "py-3", "px-4", "text-white", "text-center", "text-xl", "font-bold", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "ngModelChange", "change", "ngModel", "max"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 4v16m8-8H4"], [1, "text-xs", "text-gray-400", "mt-2", "text-center"], [1, "bg-gradient-to-r", "from-blue-500/10", "to-purple-500/10", "border", "border-blue-500/30", "rounded-lg", "p-4"], [1, "flex", "items-center", "justify-between", "mb-2"], [1, "text-gray-300"], [1, "flex", "items-center", "justify-between", "text-sm"], [1, "bg-red-500/10", "border", "border-red-500/50", "rounded-lg", "p-3", "flex", "items-center", "gap-2"], [1, "p-6", "border-t", "border-slate-700", "flex", "items-center", "justify-between", "bg-slate-800/50"], [1, "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "transition-colors", 3, "click"], [1, "bg-gradient-to-r", "from-blue-500", "to-purple-600", "text-white", "font-semibold", "py-3", "px-8", "rounded-lg", "hover:opacity-90", "transition-opacity", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "gap-2", 3, "click", "disabled"], [1, "text-green-300", "font-semibold"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-red-400", "flex-shrink-0"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", "clip-rule", "evenodd"], [1, "text-sm", "text-red-300"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M5 13l4 4L19 7"], [1, "bg-slate-900", "border", "border-slate-700", "rounded-2xl", "max-w-md", "w-full", "shadow-2xl", "animate-scale-in"], [1, "p-6"], [1, "w-12", "h-12", "rounded-xl", "bg-blue-500/20", "flex", "items-center", "justify-center", "flex-shrink-0"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-blue-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M8 12h.01M12 12h.01M16 12h.01"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M21 12c0 4.418-4.03 8-9 8a10.77 10.77 0 0 1-4.67-1.03L3 20l1.03-3.33A7.96 7.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"], [1, "bg-slate-800/50", "border", "border-slate-700", "rounded-lg", "p-4", "mb-4"], [1, "text-lg", "font-bold", "text-white"], [1, "text-lg", "font-bold", "text-red-400"], [1, "h-px", "bg-slate-700", "my-2"], [1, "text-gray-300", "font-semibold"], [1, "mb-4", "rounded-lg", "border", "border-red-500/40", "bg-red-500/10", "p-3", "text-sm", "text-red-200"], [1, "text-sm", "text-gray-400", "mb-6"], [1, "flex", "gap-3"], [1, "flex-1", "bg-slate-700", "hover:bg-slate-600", "text-white", "font-semibold", "py-3", "px-4", "rounded-lg", "transition-colors", 3, "click"], [1, "flex-1", "bg-blue-600", "hover:bg-blue-700", "text-white", "font-semibold", "py-3", "px-4", "rounded-lg", "transition-colors", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "justify-center", "gap-2", 3, "click", "disabled"], ["type", "button", 1, "ms-2", "font-bold", "text-white", "underline", 3, "click"], ["source", "PublicOpportunity", 3, "closed", "submitted", "opportunityId", "opportunityTitle"], [1, "bg-slate-900", "border", "border-slate-700", "rounded-2xl", "max-w-lg", "w-full", "shadow-2xl", "animate-scale-in"], [1, "flex", "items-center", "gap-3", "mb-6"], [1, "w-12", "h-12", "rounded-xl", "bg-purple-500/20", "flex", "items-center", "justify-center", "flex-shrink-0"], ["fill", "none", "stroke", "currentColor", "stroke-width", "2", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-purple-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "d", "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"], [1, "grid", "grid-cols-2", "gap-4", "mb-6"], [1, "block", "text-sm", "font-semibold", "text-white", "mb-3"], [1, "w-12", "h-12", "rounded-lg", "bg-slate-700", "hover:bg-slate-600", "text-white", "font-bold", "text-xl", "transition-colors", "disabled:opacity-50", "disabled:cursor-not-allowed", 3, "click", "disabled"], [1, "flex-1", "bg-slate-800", "border", "border-slate-700", "rounded-lg", "px-4", "py-3", "text-center"], [1, "bg-gradient-to-r", "from-purple-500/10", "to-blue-500/10", "border", "border-purple-500/30", "rounded-lg", "p-4", "mb-6"], [1, "bg-red-500/10", "border", "border-red-500/50", "rounded-lg", "p-3", "mb-4", "flex", "items-center", "gap-2"], [1, "flex-1", "bg-gradient-to-r", "from-purple-600", "to-blue-600", "hover:from-purple-700", "hover:to-blue-700", "text-white", "font-semibold", "py-3", "px-4", "rounded-lg", "transition-all", "disabled:opacity-50", "disabled:cursor-not-allowed", 3, "click", "disabled"], [1, "bg-blue-500/10", "border", "border-blue-500/30", "rounded-lg", "p-4", "mb-6"], [1, "text-sm", "text-blue-300", "mb-2"], [1, "flex", "items-center", "justify-between", "text-sm", "mt-1"], [1, "flex-1", "bg-gradient-to-r", "from-purple-600", "to-blue-600", "hover:from-purple-700", "hover:to-blue-700", "text-white", "font-semibold", "py-3", "px-4", "rounded-lg", "transition-all", "disabled:opacity-50", "disabled:cursor-not-allowed", "flex", "items-center", "justify-center", "gap-2", 3, "click", "disabled"], [1, "w-full", "max-w-lg", "rounded-2xl", "border", "border-slate-700", "bg-slate-900", "shadow-2xl"], [1, "border-b", "border-slate-800", "p-5"], [1, "text-xs", "font-semibold", "uppercase", "tracking-[0.18em]", "text-red-300"], [1, "mt-2", "text-xl", "font-bold", "text-white"], [1, "mt-1", "text-sm", "text-slate-400"], [1, "space-y-4", "p-5"], [1, "rounded-xl", "border", "border-emerald-500/30", "bg-emerald-500/10", "p-4", "text-sm", "text-emerald-100"], [1, "flex", "gap-3", "border-t", "border-slate-800", "p-5"], ["type", "button", 1, "flex-1", "rounded-lg", "bg-slate-800", "px-4", "py-2", "text-sm", "font-semibold", "text-slate-200", "hover:bg-slate-700", 3, "click"], ["type", "button", 1, "flex-1", "rounded-lg", "bg-red-600", "px-4", "py-2", "text-sm", "font-bold", "text-white", "hover:bg-red-500", "disabled:cursor-not-allowed", "disabled:opacity-50", 3, "disabled"], [1, "block", "text-sm", "font-semibold", "text-slate-200"], [1, "mt-2", "w-full", "rounded-lg", "border", "border-slate-700", "bg-slate-800", "px-3", "py-2", "text-white", 3, "ngModelChange", "ngModel"], [3, "value"], ["rows", "4", 1, "mt-2", "w-full", "rounded-lg", "border", "border-slate-700", "bg-slate-800", "px-3", "py-2", "text-white", 3, "ngModelChange", "placeholder", "ngModel"], [1, "rounded-xl", "border", "border-red-500/40", "bg-red-500/10", "p-3", "text-sm", "text-red-100"], ["type", "button", 1, "flex-1", "rounded-lg", "bg-red-600", "px-4", "py-2", "text-sm", "font-bold", "text-white", "hover:bg-red-500", "disabled:cursor-not-allowed", "disabled:opacity-50", 3, "click", "disabled"]], template: function InvestmentPreviewComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "a", 3);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(4, "svg", 4);
            i0.ɵɵelement(5, "path", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(8, InvestmentPreviewComponent_Conditional_8_Template, 2, 1)(9, InvestmentPreviewComponent_Conditional_9_Template, 13, 3, "div", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(10, InvestmentPreviewComponent_Conditional_10_Template, 6, 4, "div", 7);
            i0.ɵɵconditionalCreate(11, InvestmentPreviewComponent_Conditional_11_Template, 2, 1);
            i0.ɵɵconditionalCreate(12, InvestmentPreviewComponent_Conditional_12_Template, 64, 44, "div", 8);
            i0.ɵɵconditionalCreate(13, InvestmentPreviewComponent_Conditional_13_Template, 48, 33, "div", 9);
            i0.ɵɵconditionalCreate(14, InvestmentPreviewComponent_Conditional_14_Template, 1, 2, "app-participation-builder", 10);
            i0.ɵɵconditionalCreate(15, InvestmentPreviewComponent_Conditional_15_Template, 56, 38, "div", 9);
            i0.ɵɵconditionalCreate(16, InvestmentPreviewComponent_Conditional_16_Template, 69, 53, "div", 9);
            i0.ɵɵconditionalCreate(17, InvestmentPreviewComponent_Conditional_17_Template, 20, 14, "div", 11);
        } if (rf & 2) {
            let tmp_1_0;
            let tmp_3_0;
            let tmp_4_0;
            let tmp_5_0;
            let tmp_6_0;
            let tmp_7_0;
            let tmp_8_0;
            let tmp_9_0;
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 10, "investmentPreview.backButton"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_1_0 = ctx.investment()) ? 8 : 9, tmp_1_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.lightboxUrl() ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.investmentToEngage()) ? 11 : -1, tmp_3_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.investmentToInvest()) ? 12 : -1, tmp_4_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_5_0 = ctx.contactFounderConfirmationOpen() && ctx.investmentToEngage()) ? 13 : -1, tmp_5_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_6_0 = ctx.participationBuilderOpen() && ctx.publicOpportunity()) ? 14 : -1, tmp_6_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_7_0 = ctx.investNowDialogOpen() && ctx.investmentToInvest()) ? 15 : -1, tmp_7_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_8_0 = ctx.investNowConfirmationOpen() && ctx.investmentToInvest()) ? 16 : -1, tmp_8_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_9_0 = ctx.reportModalOpen() && ctx.reportTarget()) ? 17 : -1, tmp_9_0);
        } }, dependencies: [CommonModule, i1.NgClass, i1.NgIf, FormsModule, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.MinValidator, i2.MaxValidator, i2.NgModel, RouterLink, ParticipationBuilderComponent, i1.LowerCasePipe, i1.DecimalPipe, i1.CurrencyPipe, i1.DatePipe, TranslatePipe], styles: ["@use 'variables' as *;\n@use 'mixins' as *;\n\n//[_ngcontent-%COMP%]   Animations\n@keyframes[_ngcontent-%COMP%]   fadeIn[_ngcontent-%COMP%] {\n  from {\n    opacity: 0;\n    transform: translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n//[_ngcontent-%COMP%]   Utility[_ngcontent-%COMP%]   Classes\n.animate-fade-in[_ngcontent-%COMP%] {\n  animation: fadeIn var(--animation-duration, 0.3s) ease-out forwards;\n}\n\n.line-clamp-1[_ngcontent-%COMP%] {\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 1;\n  -webkit-box-orient: vertical;\n}\n\nbody.investa-theme-light[_nghost-%COMP%], body.investa-theme-light   [_nghost-%COMP%] {\n  .project-stages {\n    .stages-line {\n      background: linear-gradient(90deg, #dbe3ef, #cbd5e1, #dbe3ef);\n    }\n\n    .stage-item {\n      .stage-circle.upcoming {\n        background: var(--investa-surface-2);\n        color: var(--investa-text-muted);\n        border: 1px solid var(--investa-border);\n      }\n\n      .stage-label.active,\n      .stage-label.completed,\n      .milestone-box .milestone-value {\n        color: var(--investa-text-primary);\n      }\n\n      .stage-label.upcoming {\n        color: var(--investa-text-muted);\n      }\n\n      .current-badge {\n        background: rgba(37, 99, 235, 0.1);\n        color: #1d4ed8;\n        border-color: rgba(37, 99, 235, 0.22);\n      }\n    }\n\n    .milestone-box {\n      background: rgba(37, 99, 235, 0.06);\n      border-color: rgba(37, 99, 235, 0.18);\n\n      .milestone-label {\n        color: #1d4ed8;\n      }\n    }\n  }\n\n  .investment-preview {\n    .metric-card,\n    .section-card,\n    .team-member,\n    .document-card,\n    .timeline-item,\n    .funding-progress-card,\n    .modal-content {\n      background: var(--investa-surface);\n      border-color: var(--investa-border);\n      color: var(--investa-text-primary);\n      box-shadow: var(--investa-shadow-sm);\n    }\n\n    .metric-card:hover,\n    .section-card:hover,\n    .team-member:hover,\n    .document-card:hover {\n      background: var(--investa-surface-2);\n      border-color: rgba(16, 185, 129, 0.22);\n    }\n\n    .metric-card .label,\n    .timeline-date,\n    .document-meta,\n    .member-role {\n      color: var(--investa-text-muted);\n    }\n\n    .tab-button {\n      background: var(--investa-surface);\n      color: var(--investa-text-secondary);\n      border-color: var(--investa-border);\n\n      &.active {\n        background: rgba(16, 185, 129, 0.1);\n        color: #047857;\n        border-color: rgba(16, 185, 129, 0.24);\n      }\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Glassmorphism[_ngcontent-%COMP%]   effect[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   cards\n.backdrop-blur-md[_ngcontent-%COMP%] {\n  backdrop-filter: blur(12px);\n}\n\n//[_ngcontent-%COMP%]   Project[_ngcontent-%COMP%]   Stages[_ngcontent-%COMP%]   Timeline\n.project-stages[_ngcontent-%COMP%] {\n  position: relative;\n  \n  // Connecting line between stages\n  .stages-line {\n    position: absolute;\n    top: 1.5rem;\n    left: 0;\n    right: 0;\n    height: 4px;\n    background: linear-gradient(90deg, rgb(51, 65, 85), rgb(71, 85, 105), rgb(51, 65, 85));\n    z-index: 0;\n  }\n  \n  // Individual stage containers\n  .stage-item {\n    position: relative;\n    z-index: 10;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    \n    // Stage circle indicator\n    .stage-circle {\n      width: 3rem;\n      height: 3rem;\n      border-radius: 50%;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-weight: bold;\n      font-size: 0.875rem;\n      margin-bottom: 0.75rem;\n      transition: all 0.3s ease;\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n      \n      // Active/completed stages\n      &.active {\n        background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));\n        color: white;\n        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);\n      }\n      \n      // Completed stages\n      &.completed {\n        background: linear-gradient(135deg, rgb(34, 197, 94), rgb(59, 130, 246));\n        color: white;\n        box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);\n      }\n      \n      // Upcoming stages\n      &.upcoming {\n        background: rgb(51, 65, 85);\n        color: rgb(156, 163, 175);\n      }\n    }\n    \n    // Stage label\n    .stage-label {\n      font-size: 0.875rem;\n      font-weight: 600;\n      text-align: center;\n      transition: color 0.3s ease;\n      \n      &.active {\n        color: white;\n      }\n      \n      &.completed {\n        color: rgb(156, 163, 175);\n      }\n      \n      &.upcoming {\n        color: rgb(107, 114, 128);\n      }\n    }\n    \n    // Current badge\n    .current-badge {\n      display: inline-block;\n      margin-top: 0.5rem;\n      padding: 0.25rem 0.75rem;\n      font-size: 0.75rem;\n      font-weight: bold;\n      background: rgba(59, 130, 246, 0.2);\n      color: rgb(147, 210, 255);\n      border: 1px solid rgba(59, 130, 246, 0.3);\n      border-radius: 9999px;\n      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n    }\n    \n    // Completed checkmark\n    .completed-badge {\n      display: inline-block;\n      margin-top: 0.5rem;\n      font-size: 0.875rem;\n      font-weight: 600;\n      color: rgb(74, 222, 128);\n    }\n  }\n  \n  // Milestone info box\n  .milestone-box {\n    margin-top: 2rem;\n    padding: 1rem;\n    background: rgba(59, 130, 246, 0.1);\n    border: 1px solid rgba(59, 130, 246, 0.3);\n    border-radius: 0.5rem;\n    \n    .milestone-label {\n      font-size: 0.875rem;\n      color: rgb(147, 210, 255);\n      font-weight: 600;\n      margin-bottom: 0.25rem;\n    }\n    \n    .milestone-value {\n      font-size: 1.125rem;\n      color: rgb(219, 234, 254);\n      font-weight: bold;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Pulse[_ngcontent-%COMP%]   animation[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   current[_ngcontent-%COMP%]   stage\n@keyframes[_ngcontent-%COMP%]   pulse[_ngcontent-%COMP%] {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.7;\n  }\n}\n\n//[_ngcontent-%COMP%]   Improved[_ngcontent-%COMP%]   hero[_ngcontent-%COMP%]   section[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   gradient[_ngcontent-%COMP%]   overlay\n.investment-preview[_ngcontent-%COMP%] {\n  // Hero image overlay improvements\n  .hero-image {\n    position: relative;\n    \n    img {\n      object-fit: cover;\n      object-position: center;\n    }\n  }\n  \n  // Enhanced badge styling\n  .badge {\n    display: inline-flex;\n    align-items: center;\n    gap: 0.5rem;\n    font-weight: 600;\n    font-size: 0.875rem;\n    padding: 0.5rem 1rem;\n    border-radius: 9999px;\n    transition: all 0.3s ease;\n    \n    &:hover {\n      transform: translateY(-2px);\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n    }\n  }\n  \n  // Enhanced metric cards\n  .metric-card {\n    background: rgba(30, 41, 59, 0.4);\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    border-radius: 0.5rem;\n    padding: 1rem;\n    transition: all 0.3s ease;\n    \n    &:hover {\n      background: rgba(30, 41, 59, 0.6);\n      border-color: rgba(71, 85, 105, 0.8);\n      transform: translateY(-2px);\n    }\n    \n    .label {\n      font-size: 0.875rem;\n      color: rgb(156, 163, 175);\n      margin-bottom: 0.5rem;\n      display: block;\n    }\n    \n    .value {\n      font-size: 1.5rem;\n      font-weight: bold;\n      color: inherit;\n    }\n  }\n  \n  // Section cards with subtle hover effect\n  .section-card {\n    background: rgba(30, 41, 59, 0.4);\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    border-radius: 0.75rem;\n    padding: 2rem;\n    transition: all 0.3s ease;\n    \n    &:hover {\n      background: rgba(30, 41, 59, 0.5);\n      border-color: rgba(71, 85, 105, 0.7);\n    }\n  }\n  \n  // Team member cards with interactive effects\n  .team-member {\n    display: flex;\n    align-items: center;\n    gap: 1rem;\n    padding: 1rem;\n    background: rgba(51, 65, 85, 0.3);\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    border-radius: 0.5rem;\n    transition: all 0.3s ease;\n    cursor: pointer;\n    \n    &:hover {\n      background: rgba(51, 65, 85, 0.5);\n      border-color: rgb(59, 130, 246);\n      transform: translateX(4px);\n    }\n    \n    .avatar {\n      flex-shrink: 0;\n      width: 3.5rem;\n      height: 3.5rem;\n      border-radius: 0.5rem;\n      object-fit: cover;\n    }\n    \n    .info {\n      flex: 1;\n      min-width: 0;\n      \n      .name {\n        font-weight: 600;\n        color: white;\n        margin-bottom: 0.25rem;\n      }\n      \n      .role {\n        font-size: 0.875rem;\n        color: rgb(156, 163, 175);\n      }\n      \n      .bio {\n        font-size: 0.75rem;\n        color: rgb(107, 114, 128);\n        margin-top: 0.25rem;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n    }\n  }\n  \n  // Investor list items\n  .investor-item {\n    display: flex;\n    align-items: center;\n    gap: 0.75rem;\n    padding: 0.75rem 0;\n    \n    .avatar {\n      flex-shrink: 0;\n      width: 2.5rem;\n      height: 2.5rem;\n      border-radius: 9999px;\n      object-fit: cover;\n      border: 2px solid rgba(71, 85, 105, 0.5);\n    }\n    \n    .info {\n      flex: 1;\n      min-width: 0;\n      \n      .name {\n        font-size: 0.875rem;\n        font-weight: 500;\n        color: white;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n      \n      .amount {\n        font-size: 0.75rem;\n        color: rgb(156, 163, 175);\n      }\n    }\n  }\n  \n  // Funding progress bar\n  .progress-bar {\n    height: 1rem;\n    background: rgba(51, 65, 85, 0.5);\n    border-radius: 9999px;\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    overflow: hidden;\n    \n    .fill {\n      height: 100%;\n      background: linear-gradient(90deg, rgb(59, 130, 246), rgb(147, 51, 234), rgb(236, 72, 153));\n      border-radius: 9999px;\n      transition: width 0.5s ease-out;\n    }\n  }\n  \n  // Modal styles\n  .modal-overlay {\n    position: fixed;\n    inset: 0;\n    background: rgba(0, 0, 0, 0.7);\n    backdrop-filter: blur(4px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 50;\n    padding: 1rem;\n  }\n  \n  .modal {\n    background: rgb(15, 23, 42);\n    border: 1px solid rgb(71, 85, 105);\n    border-radius: 1.5rem;\n    padding: 2rem;\n    width: 100%;\n    max-width: 32rem;\n    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);\n    \n    .modal-icon {\n      width: 4rem;\n      height: 4rem;\n      background: rgba(59, 130, 246, 0.1);\n      border: 2px solid rgba(59, 130, 246, 0.3);\n      border-radius: 9999px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      margin: 0 auto 1rem;\n      \n      svg {\n        width: 2rem;\n        height: 2rem;\n        color: rgb(96, 165, 250);\n      }\n    }\n    \n    .modal-title {\n      font-size: 1.5rem;\n      font-weight: bold;\n      color: white;\n      text-align: center;\n      margin-bottom: 0.5rem;\n    }\n    \n    .modal-message {\n      color: rgb(156, 163, 175);\n      text-align: center;\n      margin-bottom: 1.5rem;\n    }\n  }\n  \n  // Button styling\n  .btn {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    gap: 0.5rem;\n    padding: 1rem 1.5rem;\n    border: none;\n    border-radius: 0.5rem;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.3s ease;\n    \n    &.btn-primary {\n      background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));\n      color: white;\n      \n      &:hover {\n        transform: translateY(-2px);\n        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);\n      }\n      \n      &:active {\n        transform: translateY(0);\n      }\n    }\n    \n    &.btn-secondary {\n      background: rgb(51, 65, 85);\n      color: white;\n      \n      &:hover {\n        background: rgb(71, 85, 105);\n      }\n    }\n  }\n  \n  // Responsive improvements\n  @media (max-width: 1024px) {\n    .team-member {\n      grid-column: span 1;\n    }\n  }\n  \n  @media (max-width: 640px) {\n    .metric-card {\n      padding: 0.75rem;\n      \n      .label {\n        font-size: 0.75rem;\n      }\n      \n      .value {\n        font-size: 1.25rem;\n      }\n    }\n    \n    .team-member {\n      .avatar {\n        width: 2.5rem;\n        height: 2.5rem;\n      }\n    }\n  }\n}\n\n\n\n\n.investment-preview-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  background: var(--investa-bg);\n  color: var(--investa-text-primary);\n}\n.investment-preview-routebar[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 40;\n  border-bottom: 1px solid var(--investa-border);\n  background: color-mix(in srgb, var(--investa-surface) 92%, transparent);\n  backdrop-filter: blur(14px);\n}\n.investment-preview-routebar-inner[_ngcontent-%COMP%] {\n  width: min(1380px, calc(100% - 32px));\n  min-height: 48px;\n  margin-inline: auto;\n  display: flex;\n  align-items: center;\n}\n.investment-preview-routebar-link[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: var(--investa-text-secondary);\n  font-size: .75rem;\n  font-weight: 750;\n  transition: color .16s ease;\n}\n.investment-preview-routebar-link[_ngcontent-%COMP%]:hover { color: var(--investa-text-primary); }\n@media (max-width: 760px) {\n  .investment-preview-routebar-inner[_ngcontent-%COMP%] { width: min(100% - 20px, 1380px); }\n}\n\n\n\n.public-opportunity[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  background: var(--investa-bg, #e8e8e8);\n  color: var(--investa-text-primary, #212225);\n  padding-bottom: 3rem;\n}\n\n.public-shell[_ngcontent-%COMP%] { width: min(1380px, calc(100% - 32px)); margin-inline: auto; }\n.public-topbar[_ngcontent-%COMP%] { display:flex; align-items:center; justify-content:space-between; min-height:56px; }\n.public-back-link[_ngcontent-%COMP%] { display:inline-flex; align-items:center; gap:.5rem; color:var(--investa-text-secondary); font-size:.8125rem; font-weight:700; }\n.public-draft-banner[_ngcontent-%COMP%] { background:#fff7ed; border-bottom:1px solid #fed7aa; color:#9a3412; }\n.public-draft-inner[_ngcontent-%COMP%] { min-height:54px; display:flex; align-items:center; justify-content:space-between; gap:16px; font-size:.8125rem; }\n.public-draft-inner[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:first-child { display:flex; gap:10px; align-items:center; }\n.public-actions-row[_ngcontent-%COMP%] { display:flex; gap:8px; }\n\n.public-layout[_ngcontent-%COMP%] { display:grid; grid-template-columns:minmax(0, 1fr) 330px; gap:18px; align-items:start; }\n.public-main[_ngcontent-%COMP%] { min-width:0; display:flex; flex-direction:column; gap:16px; }\n.public-hero[_ngcontent-%COMP%] { position:relative; min-height:330px; border-radius:18px; overflow:hidden; background:#15171a; box-shadow:var(--investa-shadow-md); }\n.public-hero-image[_ngcontent-%COMP%] { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }\n.public-hero-overlay[_ngcontent-%COMP%] { position:absolute; inset:0; background:linear-gradient(90deg, rgba(7,12,16,.95) 0%, rgba(7,12,16,.75) 52%, rgba(7,12,16,.35) 100%), linear-gradient(0deg, rgba(7,12,16,.72), transparent 58%); }\n.public-hero-content[_ngcontent-%COMP%] { position:relative; z-index:1; min-height:330px; padding:30px; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-start; color:#fff; }\n.public-badges[_ngcontent-%COMP%] { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }\n.public-badge[_ngcontent-%COMP%] { display:inline-flex; align-items:center; max-width:100%; min-height:24px; border-radius:999px; padding:4px 9px; border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.1); color:inherit; font-size:.6875rem; line-height:1; font-weight:750; }\n.public-badge-green[_ngcontent-%COMP%] { background:rgba(34,197,50,.15); border-color:rgba(34,197,50,.32); color:#167c24; }\n.public-hero[_ngcontent-%COMP%]   .public-badge-green[_ngcontent-%COMP%] { color:#d8ffdd; }\n.public-hero[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { max-width:740px; margin:0; font-size:clamp(2rem, 4vw, 3rem); line-height:1.02; letter-spacing:-.04em; font-weight:800; text-shadow:0 3px 18px rgba(0,0,0,.55); }\n.public-hero[_ngcontent-%COMP%]    > .public-hero-content[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { max-width:650px; margin:12px 0 0; color:rgba(255,255,255,.82); font-size:.9rem; line-height:1.65; }\n.public-founder[_ngcontent-%COMP%] { display:inline-flex; align-items:center; gap:9px; margin-top:17px; color:rgba(255,255,255,.86); font-size:.75rem; }\n.public-founder-avatar[_ngcontent-%COMP%] { width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:#fff; color:#17191b; font-weight:800; border:2px solid rgba(255,255,255,.45); }\n.public-hero-meta[_ngcontent-%COMP%] { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }\n.public-hero-meta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { padding:5px 9px; border-radius:8px; border:1px solid rgba(255,255,255,.14); background:rgba(8,12,16,.35); color:rgba(255,255,255,.78); font-size:.6875rem; }\n\n.public-section-nav[_ngcontent-%COMP%] { display:flex; align-items:center; gap:4px; overflow:auto; padding:5px; border:1px solid var(--investa-border); border-radius:13px; background:var(--investa-surface); box-shadow:var(--investa-shadow-sm); }\n.public-section-nav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { flex:0 0 auto; display:inline-flex; align-items:center; gap:6px; min-height:34px; padding:7px 12px; border-radius:9px; color:var(--investa-text-secondary); font-size:.75rem; font-weight:700; }\n.public-section-nav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:first-child { background:var(--investa-primary); color:var(--investa-primary-contrast, #fff); }\n.public-section-nav[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display:inline-grid; min-width:18px; height:18px; place-items:center; border-radius:6px; background:var(--investa-surface-soft); font-size:.625rem; }\n.public-section-nav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:first-child   span[_ngcontent-%COMP%] { background:rgba(255,255,255,.14); }\n\n.public-card[_ngcontent-%COMP%] { border:1px solid var(--investa-border); border-radius:15px; background:var(--investa-surface); padding:18px; box-shadow:var(--investa-shadow-sm); }\n.public-content-grid[_ngcontent-%COMP%] { display:grid; grid-template-columns:minmax(0, 1.6fr) minmax(260px, .8fr); gap:14px; }\n.public-card-wide[_ngcontent-%COMP%] { min-width:0; }\n.public-two-column[_ngcontent-%COMP%] { display:grid; grid-template-columns:1fr 1fr; gap:14px; }\n.public-section-heading[_ngcontent-%COMP%] { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }\n.public-section-heading[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child { display:block; color:var(--investa-text-muted); font-size:.625rem; text-transform:uppercase; letter-spacing:.13em; font-weight:800; }\n.public-section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin:3px 0 0; color:var(--investa-text-primary); font-size:1rem; line-height:1.3; font-weight:800; }\n.public-body-copy[_ngcontent-%COMP%] { color:var(--investa-text-secondary); font-size:.8125rem; line-height:1.72; white-space:pre-line; }\n.public-body-copy.compact[_ngcontent-%COMP%] { line-height:1.62; }\n.public-highlights[_ngcontent-%COMP%] { display:grid; grid-template-columns:repeat(3, 1fr); gap:9px; margin-top:16px; }\n.public-highlights[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { min-width:0; padding:10px; border-radius:10px; background:var(--investa-surface-soft); border:1px solid var(--investa-border); }\n.public-highlights[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .public-highlights[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n.public-highlights[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size:.75rem; color:var(--investa-text-primary); }\n.public-highlights[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { margin-top:2px; font-size:.625rem; color:var(--investa-text-muted); }\n.public-terms-grid[_ngcontent-%COMP%] { display:grid; grid-template-columns:1fr 1fr; gap:10px; }\n.public-terms-grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { padding:11px 12px; border:1px solid var(--investa-border); border-radius:10px; background:var(--investa-surface-soft); }\n.public-terms-grid[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .public-terms-grid[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display:block; }\n.public-terms-grid[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color:var(--investa-text-muted); font-size:.6875rem; }\n.public-terms-grid[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { margin-top:5px; color:var(--investa-text-primary); font-size:.8125rem; line-height:1.5; }\n.public-term-wide[_ngcontent-%COMP%] { grid-column:1 / -1; }\n.public-list[_ngcontent-%COMP%], .public-file-list[_ngcontent-%COMP%] { display:flex; flex-direction:column; }\n.public-list-row[_ngcontent-%COMP%] { display:grid; grid-template-columns:32px minmax(0, 1fr) auto; gap:10px; align-items:center; padding:10px 0; border-top:1px solid var(--investa-border); }\n.public-list-row[_ngcontent-%COMP%]:first-child { border-top:0; }\n.public-list-icon[_ngcontent-%COMP%] { width:28px; height:28px; display:grid; place-items:center; border-radius:9px; background:var(--investa-accent-soft); color:var(--investa-accent); font-weight:900; }\n.public-list-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .public-list-row[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { display:block; }\n.public-list-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color:var(--investa-text-primary); font-size:.75rem; }\n.public-list-row[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top:2px; color:var(--investa-text-muted); font-size:.6875rem; line-height:1.45; }\n.public-list-row[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { color:var(--investa-text-muted); font-size:.625rem; white-space:nowrap; }\n.public-file-row[_ngcontent-%COMP%] { display:grid; grid-template-columns:34px minmax(0,1fr) auto; gap:10px; align-items:center; padding:9px 0; border-top:1px solid var(--investa-border); color:var(--investa-text-primary); }\n.public-file-row[_ngcontent-%COMP%]:first-child { border-top:0; }\n.public-file-icon[_ngcontent-%COMP%] { width:31px; height:31px; display:grid; place-items:center; border-radius:8px; background:#fff1f2; color:#dc2626; font-size:.55rem; font-weight:900; }\n.public-file-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .public-file-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n.public-file-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size:.72rem; }\n.public-file-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { margin-top:2px; color:var(--investa-text-muted); font-size:.625rem; }\n.public-media-grid[_ngcontent-%COMP%] { display:grid; grid-template-columns:1fr 1fr; gap:8px; }\n.public-media-grid[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { overflow:hidden; aspect-ratio:16/10; border-radius:9px; background:var(--investa-surface-soft); }\n.public-media-grid[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width:100%; height:100%; object-fit:cover; transition:transform .2s ease; }\n.public-media-grid[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover   img[_ngcontent-%COMP%] { transform:scale(1.04); }\n.public-empty[_ngcontent-%COMP%] { padding:18px; border-radius:10px; background:var(--investa-surface-soft); color:var(--investa-text-muted); font-size:.75rem; text-align:center; }\n\n.public-investment-panel[_ngcontent-%COMP%] { position:sticky; top:72px; display:flex; flex-direction:column; gap:12px; }\n.public-summary-card[_ngcontent-%COMP%], .public-relationship-card[_ngcontent-%COMP%] { border:1px solid var(--investa-border); border-radius:15px; background:var(--investa-surface); padding:17px; box-shadow:var(--investa-shadow-sm); }\n.public-summary-heading[_ngcontent-%COMP%], .public-relationship-heading[_ngcontent-%COMP%] { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:.75rem; font-weight:800; color:var(--investa-text-primary); }\n.public-summary-numbers[_ngcontent-%COMP%] { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }\n.public-summary-numbers[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:last-child { text-align:end; }\n.public-summary-numbers[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .public-summary-numbers[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .public-summary-grid[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .public-summary-grid[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display:block; }\n.public-summary-numbers[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .public-summary-grid[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color:var(--investa-text-muted); font-size:.625rem; }\n.public-summary-numbers[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { margin-top:4px; color:var(--investa-text-primary); font-size:.875rem; }\n.public-progress[_ngcontent-%COMP%] { height:5px; overflow:hidden; margin:12px 0 16px; border-radius:999px; background:var(--investa-surface-soft); }\n.public-progress[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display:block; height:100%; border-radius:inherit; background:var(--investa-accent); }\n.public-summary-grid[_ngcontent-%COMP%] { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding-top:14px; border-top:1px solid var(--investa-border); }\n.public-summary-grid[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { margin-top:3px; color:var(--investa-text-primary); font-size:.72rem; line-height:1.35; }\n.public-relationship-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin:12px 0; color:var(--investa-text-secondary); font-size:.75rem; line-height:1.55; }\n.public-relationship-actions[_ngcontent-%COMP%] { display:flex; flex-direction:column; gap:8px; }\n.public-relationship-actions[_ngcontent-%COMP%]   .investa-btn-primary[_ngcontent-%COMP%], .public-relationship-actions[_ngcontent-%COMP%]   .investa-btn-secondary[_ngcontent-%COMP%] { width:100%; min-height:40px; }\n.public-relationship-card[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display:block; margin-top:11px; color:var(--investa-text-muted); font-size:.625rem; line-height:1.45; }\n.public-full-button[_ngcontent-%COMP%] { width:100%; }\n\nbody.investa-theme-light[_nghost-%COMP%], body.investa-theme-light   [_nghost-%COMP%] {\n  .public-hero h1 { color:#ffffff; text-shadow:0 2px 8px rgba(0,0,0,.55); }\n  .public-founder { color:rgba(255,255,255,.86); text-shadow:0 1px 4px rgba(0,0,0,.4); }\n}\n\nbody:not(.investa-theme-light)[_nghost-%COMP%], body:not(.investa-theme-light)   [_nghost-%COMP%] {\n  .public-opportunity { background:var(--investa-bg); }\n  .public-badge-green { color:#9cf7a7; }\n  .public-file-icon { background:rgba(220,38,38,.14); color:#fda4af; }\n  .public-hero h1 { color:#ffffff; text-shadow:0 2px 8px rgba(0,0,0,.55); }\n  .public-founder { color:rgba(255,255,255,.86); text-shadow:0 1px 4px rgba(0,0,0,.4); }\n}\n\n@media (max-width: 1100px) {\n  .public-layout[_ngcontent-%COMP%] { grid-template-columns:1fr; }\n  .public-investment-panel[_ngcontent-%COMP%] { position:static; display:grid; grid-template-columns:1fr 1fr; }\n  .public-full-button[_ngcontent-%COMP%] { grid-column:1 / -1; }\n}\n@media (max-width: 760px) {\n  .public-shell[_ngcontent-%COMP%] { width:min(100% - 20px, 1380px); }\n  .public-topbar[_ngcontent-%COMP%] { min-height:48px; }\n  .public-hero[_ngcontent-%COMP%], .public-hero-content[_ngcontent-%COMP%] { min-height:270px; }\n  .public-hero-content[_ngcontent-%COMP%] { padding:20px; }\n  .public-hero[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { font-size:clamp(1.65rem, 8vw, 2.25rem); }\n  .public-content-grid[_ngcontent-%COMP%], .public-two-column[_ngcontent-%COMP%], .public-investment-panel[_ngcontent-%COMP%] { grid-template-columns:1fr; }\n  .public-highlights[_ngcontent-%COMP%] { grid-template-columns:1fr; }\n  .public-terms-grid[_ngcontent-%COMP%] { grid-template-columns:1fr; }\n  .public-term-wide[_ngcontent-%COMP%] { grid-column:auto; }\n  .public-card[_ngcontent-%COMP%] { padding:15px; }\n  .public-list-row[_ngcontent-%COMP%] { grid-template-columns:30px minmax(0,1fr); }\n  .public-list-row[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { grid-column:2; }\n  .public-draft-inner[_ngcontent-%COMP%] { align-items:flex-start; padding-block:10px; }\n  .public-draft-inner[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:first-child { align-items:flex-start; flex-direction:column; gap:2px; }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvestmentPreviewComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-investment-preview', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ParticipationBuilderComponent], template: "<div class=\"investment-preview-page\">\n  <!-- Compact route header -->\n  <div class=\"investment-preview-routebar\">\n    <div class=\"investment-preview-routebar-inner\">\n      <a routerLink=\"/admin/investments\" class=\"investment-preview-routebar-link\">\n        <svg class=\"w-5 h-5 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"></path></svg>\n        {{ 'investmentPreview.backButton' | translate }}\n      </a>\n    </div>\n  </div>\n\n  @if (investment(); as inv) {\n    @if (publicOpportunity(); as opp) {\n      <div class=\"public-opportunity animate-fade-in\">\n        @if (isFounder() && isDraft()) {\n          <div class=\"public-draft-banner\">\n            <div class=\"public-shell public-draft-inner\">\n              <div>\n                <strong>Draft opportunity</strong>\n                <span>This opportunity is not visible to investors yet.</span>\n              </div>\n              <div class=\"public-actions-row\">\n                <button type=\"button\" (click)=\"editOpportunity()\" class=\"investa-btn-secondary\">Edit</button>\n                <button type=\"button\" (click)=\"publishOpportunity()\" [disabled]=\"engagementProcessing()\" class=\"investa-btn-primary\">\n                  {{ engagementProcessing() ? 'Publishing...' : 'Publish' }}\n                </button>\n              </div>\n            </div>\n          </div>\n        }\n\n        <div class=\"public-shell public-topbar\">\n          <a routerLink=\"/admin/investments\" class=\"public-back-link\">\n            <svg class=\"h-4 w-4 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"></path></svg>\n            {{ 'investmentPreview.backButton' | translate }}\n          </a>\n          @if (!isFounder()) {\n            <button type=\"button\" (click)=\"openOpportunityReport(opp)\" class=\"investa-btn-ghost\">\n              {{ 'reports.actions.reportOpportunity' | translate }}\n            </button>\n          }\n        </div>\n\n        <div class=\"public-shell public-layout\">\n          <main class=\"public-main\">\n            <section class=\"public-hero\">\n              @if (getOpportunityCoverUrl(opp)) {\n                <img [src]=\"getOpportunityCoverUrl(opp)\" [alt]=\"opp.title || 'Opportunity cover'\" class=\"public-hero-image\">\n              }\n              <div class=\"public-hero-overlay\"></div>\n              <div class=\"public-hero-content\">\n                <div class=\"public-badges\">\n                  @if (opp.category || opp.categoryName) {\n                    <span class=\"public-badge public-badge-green\">{{ opp.category ? getOpportunityLabel(opp.category) : opp.categoryName }}</span>\n                  }\n                  <span class=\"public-badge\">{{ getOpportunityInvestmentModelLabel(opp) }}</span>\n                  @if (opp.projectStage) { <span class=\"public-badge\">{{ opp.projectStage }}</span> }\n                </div>\n                <h1>{{ opp.title }}</h1>\n                <p>{{ opp.shortDescription || opp.description }}</p>\n                <button type=\"button\" class=\"public-founder\" (click)=\"openFounderProfile(opp.founderId || opp.founder?.id, $event)\">\n                  <span class=\"public-founder-avatar\">{{ getFounderName(opp).charAt(0) }}</span>\n                  <span>By <strong>{{ getFounderName(opp) }}</strong></span>\n                </button>\n                <div class=\"public-hero-meta\">\n                  @if (opp.fundingGoal || opp.fundingGoalName) { <span>{{ opp.fundingGoal ? getOpportunityLabel(opp.fundingGoal) : opp.fundingGoalName }}</span> }\n                  @if (opp.createdAt) { <span>{{ opp.createdAt | date:'MMM d, yyyy' }}</span> }\n                  <span>{{ getOpportunityStatus(opp) }}</span>\n                </div>\n              </div>\n            </section>\n\n            <nav class=\"public-section-nav\" aria-label=\"Opportunity sections\">\n              <a href=\"#overview\">Overview</a>\n              <a href=\"#terms\">Investment Terms</a>\n              <a href=\"#updates\">Updates <span>{{ getUpdateEvents(opp).length }}</span></a>\n              <a href=\"#documents\">Documents <span>{{ getOpportunityDocuments(opp).length }}</span></a>\n              <a href=\"#media\">Media <span>{{ getOpportunityGallery(opp).length }}</span></a>\n            </nav>\n\n            <section id=\"overview\" class=\"public-content-grid\">\n              <article class=\"public-card public-card-wide\">\n                <div class=\"public-section-heading\">\n                  <div><span>Opportunity overview</span><h2>About this opportunity</h2></div>\n                </div>\n                <p class=\"public-body-copy\">{{ opp.description || opp.shortDescription || 'Opportunity information will be added by the founder.' }}</p>\n                <div class=\"public-highlights\">\n                  @if (opp.category || opp.categoryName) { <div><strong>{{ opp.category ? getOpportunityLabel(opp.category) : opp.categoryName }}</strong><span>Business category</span></div> }\n                  @if (opp.projectStage) { <div><strong>{{ opp.projectStage }}</strong><span>Project stage</span></div> }\n                  <div><strong>{{ getOpportunityInvestmentModelLabel(opp) }}</strong><span>Investment model</span></div>\n                </div>\n              </article>\n\n              <article class=\"public-card\">\n                <div class=\"public-section-heading\"><div><span>Capital allocation</span><h2>Use of funds</h2></div></div>\n                <p class=\"public-body-copy compact\">{{ getUseOfFunds(opp) || 'The founder has not published a use-of-funds summary yet.' }}</p>\n              </article>\n            </section>\n\n            <section id=\"terms\" class=\"public-card\">\n              <div class=\"public-section-heading\">\n                <div><span>Participation structure</span><h2>Investment terms</h2></div>\n                <span class=\"public-badge public-badge-green\">{{ getOpportunityInvestmentModelLabel(opp) }}</span>\n              </div>\n              <div class=\"public-terms-grid\">\n                <div><span>Minimum participation</span><strong>{{ opp.minimumInvestmentAmount || opp.minimumInvestment || 0 | number:'1.0-0' }} USD</strong></div>\n                <div><span>Expected return</span><strong>{{ opp.expectedReturnSummary || 'To be confirmed' }}</strong></div>\n                <div class=\"public-term-wide\"><span>Public terms</span><strong>{{ opp.publicInvestmentTermsSummary || 'Terms will be shared by the founder.' }}</strong></div>\n              </div>\n            </section>\n\n            <section id=\"updates\" class=\"public-card\">\n              <div class=\"public-section-heading\"><div><span>Founder activity</span><h2>Recent updates</h2></div></div>\n              @if (getUpdateEvents(opp).length > 0) {\n                <div class=\"public-list\">\n                  @for (event of getUpdateEvents(opp).slice(0, 4); track event.id || $index) {\n                    <article class=\"public-list-row\">\n                      <span class=\"public-list-icon\">\u2197</span>\n                      <div><strong>{{ event.title || event.type || 'Update' }}</strong><p>{{ event.description || 'A new update was published.' }}</p></div>\n                      @if (getEventDate(event)) { <time>{{ getEventDate(event) | date:'MMM d, yyyy' }}</time> }\n                    </article>\n                  }\n                </div>\n              } @else { <p class=\"public-empty\">No updates have been published yet.</p> }\n            </section>\n\n            <div class=\"public-two-column\">\n              <section id=\"documents\" class=\"public-card\">\n                <div class=\"public-section-heading\"><div><span>Due diligence</span><h2>Documents</h2></div></div>\n                @if (getOpportunityDocuments(opp).length > 0) {\n                  <div class=\"public-file-list\">\n                    @for (doc of getOpportunityDocuments(opp).slice(0, 5); track doc.id || $index) {\n                      <a [href]=\"getOpportunityFileUrl(doc) || null\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"public-file-row\">\n                        <span class=\"public-file-icon\">PDF</span>\n                        <span><strong>{{ doc.fileName || doc.title || doc.name || 'Document' }}</strong><small>{{ doc.fileExtension || doc.purpose || 'Public document' }}</small></span>\n                        <span aria-hidden=\"true\">\u2192</span>\n                      </a>\n                    }\n                  </div>\n                } @else { <p class=\"public-empty\">No public documents are available.</p> }\n              </section>\n\n              <section id=\"media\" class=\"public-card\">\n                <div class=\"public-section-heading\"><div><span>Visual library</span><h2>Media</h2></div></div>\n                @if (getOpportunityGallery(opp).length > 0) {\n                  <div class=\"public-media-grid\">\n                    @for (img of getOpportunityGallery(opp).slice(0, 4); track img.id; let i = $index) {\n                      <button type=\"button\" (click)=\"openLightbox(getOpportunityFileUrl(img))\"><img [src]=\"getOpportunityFileUrl(img)\" [alt]=\"img.caption || ('Public media ' + (i + 1))\"></button>\n                    }\n                  </div>\n                } @else { <p class=\"public-empty\">No public media is available.</p> }\n              </section>\n            </div>\n          </main>\n\n          <aside class=\"public-investment-panel\">\n            @let progress = getOpportunityFundingProgress(opp);\n            <section class=\"public-summary-card\">\n              <div class=\"public-summary-heading\"><span>Investment summary</span><span>{{ progress | number:'1.0-0' }}%</span></div>\n              <div class=\"public-summary-numbers\">\n                <div><span>Funded</span><strong>{{ opp.fundedAmount || 0 | number:'1.0-0' }} USD</strong></div>\n                <div><span>Target</span><strong>{{ opp.fundingTarget || 0 | number:'1.0-0' }} USD</strong></div>\n              </div>\n              <div class=\"public-progress\"><span [style.width.%]=\"progress\"></span></div>\n              <div class=\"public-summary-grid\">\n                <div><span>Minimum participation</span><strong>{{ opp.minimumInvestmentAmount || opp.minimumInvestment || 0 | number:'1.0-0' }} USD</strong></div>\n                <div><span>Investment model</span><strong>{{ getOpportunityInvestmentModelLabel(opp) }}</strong></div>\n                <div><span>Approved participants</span><strong>{{ opp.approvedParticipantCount || 0 }}</strong></div>\n                <div><span>Status</span><strong>{{ getOpportunityStatus(opp) }}</strong></div>\n              </div>\n            </section>\n\n            <section id=\"relationship-state\" class=\"public-relationship-card\">\n              <div class=\"public-relationship-heading\"><span>Your participation</span><span class=\"public-badge public-badge-green\">{{ relationshipState().title }}</span></div>\n              <p>{{ relationshipState().description }}</p>\n              <div class=\"public-relationship-actions\">\n                @if (showRequestChatButton()) {\n                  <button type=\"button\" (click)=\"requestChat(opp)\" [disabled]=\"engagementProcessing() || !getPublicOpportunityId(opp)\" class=\"investa-btn-primary\">{{ engagementProcessing() ? 'Requesting...' : relationshipState().primaryLabel }}</button>\n                }\n                @if (showOpenChatButton()) { <button type=\"button\" (click)=\"openChat()\" class=\"investa-btn-primary\">{{ relationshipState().primaryLabel }}</button> }\n                @if (showParticipateButton()) { <button type=\"button\" (click)=\"openParticipationBuilder()\" class=\"investa-btn-primary\">Participate</button> }\n                @if (showProjectRoomButton() && getPublicOpportunityId(opp); as roomOpportunityId) {\n                  <a [routerLink]=\"['/admin/opportunities', roomOpportunityId, 'room']\" class=\"investa-btn-primary\">{{ relationshipState().primaryLabel }}</a>\n                }\n                @if (canEndDiscussion()) { <button type=\"button\" (click)=\"endDiscussion()\" class=\"investa-btn-secondary\">Close discussion</button> }\n              </div>\n              <small>Chat history remains available for negotiation context.</small>\n            </section>\n\n            <button type=\"button\" class=\"investa-btn-secondary public-full-button\">View term sheet</button>\n          </aside>\n        </div>\n      </div>\n    } @else {\n    <div class=\"animate-fade-in\">\n// Hero Section with Image -->\n       <div class=\"relative h-96 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden\">\n         <!-- Status accent strip -->\n          <div class=\"absolute top-0 inset-x-0 h-1 z-10\"\n               [class]=\"inv.status === 'Active'                 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :\n                        inv.status === 'Fully Funded'           ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :\n                        inv.status === 'Reviewing Participants' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :\n                        inv.status === 'In Progress'            ? 'bg-gradient-to-r from-blue-500 to-purple-500' :\n                        inv.status === 'Completed'              ? 'bg-gradient-to-r from-green-500 to-teal-400' :\n                        inv.status === 'Paused'                 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :\n                        inv.status === 'Archived'               ? 'bg-gradient-to-r from-gray-500 to-slate-400' :\n                        inv.status === 'Closed'                 ? 'bg-gradient-to-r from-red-500 to-rose-400' :\n                                                                 'bg-slate-700'\">\n          </div>\n          <!-- Hero cover image -->\n          @if (inv.images && inv.images.length > 0 || inv.imageUrl) {\n            <img [src]=\"getHeroImageUrl(inv)\" [alt]=\"inv.name\" class=\"w-full h-full object-cover opacity-30\">\n          }\n        <div class=\"absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent\"></div>\n        \n        <div class=\"absolute inset-0 flex flex-col justify-end p-8\">\n          <div class=\"flex items-start justify-between mb-4\">\n            <div>\n              <div class=\"flex flex-wrap items-center gap-2 mb-3\">\n                <span class=\"px-3 py-1 text-sm font-semibold rounded-full inline-flex\" [ngClass]=\"getInvestmentTypeBadgeClass(inv.investmentType)\">\n                  {{ getInvestmentTypeDisplay(inv.investmentType) }}\n                </span>\n                <span class=\"px-3 py-1 text-sm font-semibold rounded-full inline-flex\"\n                      [class]=\"inv.riskLevel === RiskLevel.Low ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : inv.riskLevel === RiskLevel.Medium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'\">\n                  {{ ('investments.risk.' + (inv.riskLevel | lowercase)) | translate }}\n                </span>\n                <span class=\"inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border\"\n                      [ngClass]=\"{\n                        'bg-slate-600/30 text-gray-300 border-slate-600/30': inv.status === 'Draft',\n                        'bg-emerald-500/15 text-emerald-300 border-emerald-500/25': inv.status === 'Active',\n                        'bg-amber-500/15 text-amber-300 border-amber-500/25': inv.status === 'Reviewing Participants',\n                        'bg-blue-500/15 text-blue-300 border-blue-500/25': inv.status === 'In Progress' || inv.status === 'Funded',\n                        'bg-cyan-500/15 text-cyan-300 border-cyan-500/25': inv.status === 'Fully Funded',\n                        'bg-yellow-500/15 text-yellow-300 border-yellow-500/25': inv.status === 'Paused',\n                        'bg-green-500/15 text-green-300 border-green-500/25': inv.status === 'Completed',\n                        'bg-gray-500/15 text-gray-300 border-gray-500/25': inv.status === 'Archived',\n                        'bg-red-500/15 text-red-300 border-red-500/25': inv.status === 'Closed'\n                      }\">\n                  @if (inv.status === 'Active' || inv.status === 'In Progress') {\n                    <span class=\"w-1.5 h-1.5 rounded-full bg-emerald-400\"></span>\n                  }\n                  {{ inv.status }}\n                </span>\n                @if (inv.endDate && getDaysRemaining(inv.endDate) >= 0) {\n                  <span class=\"inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-slate-800/60 border\"\n                        [class]=\"getDaysRemaining(inv.endDate) <= 7  ? 'text-red-400 border-red-500/30' :\n                                 getDaysRemaining(inv.endDate) <= 30 ? 'text-amber-400 border-amber-500/30' : 'text-gray-400 border-slate-600/30'\">\n                    <svg class=\"w-3.5 h-3.5\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z\" clip-rule=\"evenodd\"/></svg>\n                    {{ getDaysRemaining(inv.endDate) }}d {{ 'investmentPreview.daysLeft' | translate }}\n                  </span>\n                }\n              </div>\n              <h1 class=\"text-5xl font-bold text-white mb-2\">{{ inv.title || inv.name }}</h1>\n              <p class=\"text-gray-400 text-lg max-w-2xl\">{{ languageService.language() === 'ar' ? (inv.businessCategoryNameAr || inv.businessCategoryName) : (inv.businessCategoryName || '') }}</p>\n            </div>\n            <div class=\"flex items-center gap-3\">\n              <button type=\"button\" class=\"p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white\">\n                <svg class=\"w-6 h-6\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M11.645 20.761A9.865 9.865 0 015.12 5.12a9.865 9.865 0 0115.625 13.625 9.865 9.865 0 01-9.1 1.016zM12 1a11 11 0 110 22 11 11 0 010-22z\"></path></svg>\n              </button>\n            </div>\n          </div>\n\n          <!-- Gallery Thumbnails -->\n          @if (getProjectMediaImages(inv).length > 0) {\n            <div class=\"flex gap-2 overflow-x-auto pb-1\">\n              @for (img of getProjectMediaImages(inv); track img.id; let i = $index) {\n                <button type=\"button\" (click)=\"openLightbox(resolveImageUrl(img.fileUrl || img.previewUrl || img.thumbnailUrl))\"\n                        class=\"flex-shrink-0 h-24 w-36 rounded-lg overflow-hidden ring-1 ring-white/10 hover:ring-2 hover:ring-blue-400/70 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400\">\n                  <img [src]=\"resolveImageUrl(img.fileUrl || img.previewUrl || img.thumbnailUrl)\" [alt]=\"img.caption || ('Image ' + (i + 1))\" class=\"w-full h-full object-cover\">\n                </button>\n              }\n            </div>\n          }\n        </div>\n      </div>\n\n      <!-- Main Content -->\n      <div class=\"container mx-auto px-6 py-12\">\n        <div class=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">\n          <!-- Left Column: Main Details -->\n          <div class=\"lg:col-span-2 space-y-8\">\n            <!-- Quick Info Strip -->\n            <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\n              <div class=\"flex flex-wrap items-center gap-x-6 gap-y-3\">\n                <!-- Type -->\n                <div class=\"flex items-center gap-2\">\n                  <span class=\"text-xs uppercase tracking-wider text-gray-500\">{{ 'investmentPreview.investmentType' | translate }}</span>\n                  <span class=\"px-2.5 py-0.5 text-xs font-bold rounded-md\" [ngClass]=\"getInvestmentTypeBadgeClass(inv.investmentType)\">\n                    {{ getInvestmentTypeDisplay(inv.investmentType) }}\n                  </span>\n                  <span class=\"text-xs text-gray-500\">{{ inv.investmentType === InvestmentType.Founding ? ('investmentPreview.earlyStage' | translate) : ('investmentPreview.equityOpportunity' | translate) }}</span>\n                </div>\n                <div class=\"w-px h-4 bg-slate-700 hidden md:block\"></div>\n                <!-- Risk -->\n                <div class=\"flex items-center gap-2\">\n                  <span class=\"text-xs uppercase tracking-wider text-gray-500\">{{ 'investmentPreview.riskLevel' | translate }}</span>\n                  <span class=\"px-2.5 py-0.5 text-xs font-bold rounded-md\"\n                        [class]=\"inv.riskLevel === RiskLevel.Low ? 'bg-emerald-500/15 text-emerald-300' : inv.riskLevel === RiskLevel.Medium ? 'bg-amber-500/15 text-amber-300' : 'bg-red-500/15 text-red-300'\">\n                    {{ ('investments.risk.' + (inv.riskLevel | lowercase)) | translate }}\n                  </span>\n                  <span class=\"text-xs text-gray-500\">{{ inv.riskLevel === RiskLevel.Low ? ('investmentPreview.conservativeProfile' | translate) : inv.riskLevel === RiskLevel.Medium ? ('investmentPreview.moderateExposure' | translate) : ('investmentPreview.highVolatility' | translate) }}</span>\n                </div>\n                <div class=\"w-px h-4 bg-slate-700 hidden md:block\"></div>\n                <!-- Status -->\n                <div class=\"flex items-center gap-2\">\n                  <span class=\"text-xs uppercase tracking-wider text-gray-500\">{{ 'investmentPreview.campaignStatus' | translate }}</span>\n                  <span class=\"inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-md border\"\n                        [ngClass]=\"{\n                          'bg-slate-600/30 text-gray-400 border-slate-600/30': inv.status === 'Draft',\n                          'bg-emerald-500/15 text-emerald-300 border-emerald-500/25': inv.status === 'Active',\n                          'bg-amber-500/15 text-amber-300 border-amber-500/25': inv.status === 'Reviewing Participants',\n                          'bg-blue-500/15 text-blue-300 border-blue-500/25': inv.status === 'In Progress' || inv.status === 'Funded',\n                          'bg-cyan-500/15 text-cyan-300 border-cyan-500/25': inv.status === 'Fully Funded',\n                          'bg-yellow-500/15 text-yellow-300 border-yellow-500/25': inv.status === 'Paused',\n                          'bg-green-500/15 text-green-300 border-green-500/25': inv.status === 'Completed',\n                          'bg-gray-500/15 text-gray-300 border-gray-500/25': inv.status === 'Archived',\n                          'bg-red-500/15 text-red-300 border-red-500/25': inv.status === 'Closed'\n                        }\">\n                    @if (inv.status === 'Active' || inv.status === 'In Progress') {\n                      <span class=\"w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0\"></span>\n                    }\n                    {{ inv.status }}\n                  </span>\n                  <span class=\"text-xs text-gray-500\">{{ getStatusDescription(inv.status) }}</span>\n                </div>\n              </div>\n            </div>\n\n            <!-- Project Stages Timeline -->\n            <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-8\">\n              <h3 class=\"text-xl font-bold text-white mb-6\">{{ 'investmentPreview.projectRoadmap' | translate }}</h3>\n              \n              <div class=\"relative\">\n                <!-- Horizontal line connecting stages -->\n                <div class=\"absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 to-slate-700\"></div>\n\n                <!-- Stages -->\n                <div class=\"grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10\">\n                  @let stages = getProjectStages();\n                  @let currentStageIndex = getCurrentStageIndex();\n                  \n                  @for (stage of stages; track $index; let first = $first; let last = $last) {\n                    <div class=\"text-center\">\n                      <!-- Stage Circle -->\n                      <div class=\"flex justify-center mb-3\">\n                        <div class=\"w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ring-4\" \n                          [class]=\"$index <= currentStageIndex \n                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ring-purple-500/30' \n                            : 'bg-slate-700 text-gray-400 ring-slate-700/50'\">\n                          {{ $index + 1 }}\n                        </div>\n                      </div>\n\n                      <!-- Stage Name -->\n                      <p class=\"text-sm font-semibold\" [class]=\"$index === currentStageIndex ? 'text-white' : $index < currentStageIndex ? 'text-gray-400' : 'text-gray-500'\">\n                        {{ stage }}\n                      </p>\n\n                      <!-- Current Stage Badge -->\n                      @if ($index === currentStageIndex) {\n                        <span class=\"inline-block mt-2 px-2 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full\">\n                          {{ 'investmentPreview.current' | translate }}\n                        </span>\n                      } @else if ($index < currentStageIndex) {\n                        <span class=\"inline-block mt-2 px-2 py-1 text-xs font-semibold text-green-400\">\n                          \u2713 {{ 'investmentPreview.complete' | translate }}\n                        </span>\n                      }\n                    </div>\n                  }\n                </div>\n\n                <!-- Milestone Display -->\n                @if (inv.milestone) {\n                  <div class=\"mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg\">\n                    <p class=\"text-blue-300 text-sm font-semibold mb-1\">{{ 'investmentPreview.currentMilestone' | translate }}</p>\n                    <p class=\"text-blue-100 text-lg font-bold\">{{ inv.milestone }}</p>\n                  </div>\n                }\n              </div>\n            </div>\n\n            <!-- Description -->\n\n            <!-- \u2500\u2500 Media Gallery \u2500\u2500 -->\n            @if ((inv.images && inv.images.length > 0) || inv.videoUrl) {\n              <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-6\">\n                <h3 class=\"text-xl font-bold text-white mb-5\">{{ 'investmentPreview.media' | translate }}</h3>\n\n                <!-- Video -->\n                @if (inv.videoUrl) {\n                  <div class=\"mb-5\">\n                    @let isYoutube = inv.videoUrl.includes('youtube') || inv.videoUrl.includes('youtu.be');\n                    @let isVimeo   = inv.videoUrl.includes('vimeo');\n                    @if (isYoutube || isVimeo) {\n                      <!-- Embeddable iframe -->\n                      <div class=\"relative w-full rounded-xl overflow-hidden bg-black\" style=\"padding-top:56.25%\">\n                        <iframe class=\"absolute inset-0 w-full h-full\"\n                                [src]=\"inv.videoUrl\"\n                                title=\"{{ inv.name }}\"\n                                frameborder=\"0\"\n                                allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\"\n                                allowfullscreen>\n                        </iframe>\n                      </div>\n                    } @else {\n                      <!-- Direct video file link -->\n                      <a [href]=\"inv.videoUrl\" target=\"_blank\" rel=\"noopener noreferrer\"\n                         class=\"flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 transition-colors group\">\n                        <div class=\"w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0\">\n                          <svg class=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path d=\"M10 12a2 2 0 100-4 2 2 0 000 4z\"/><path fill-rule=\"evenodd\" d=\"M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z\" clip-rule=\"evenodd\"/></svg>\n                        </div>\n                        <div class=\"flex-1 min-w-0\">\n                          <p class=\"text-sm font-semibold truncate\">{{ 'investmentPreview.watchProjectVideo' | translate }}</p>\n                          <p class=\"text-xs text-blue-400/60 truncate mt-0.5\">{{ inv.videoUrl }}</p>\n                        </div>\n                        <svg class=\"w-4 h-4 text-blue-400/70 flex-shrink-0 group-hover:translate-x-0.5 transition-transform\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14\"/></svg>\n                      </a>\n                    }\n                  </div>\n                }\n\n                <!-- Image grid -->\n                @if (getProjectMediaImages(inv).length > 0) {\n                  <div class=\"grid grid-cols-2 sm:grid-cols-3 gap-3\">\n                    @for (img of getProjectMediaImages(inv); track img.id; let i = $index) {\n                      <button type=\"button\" (click)=\"openLightbox(resolveImageUrl(img.url))\"\n                              [title]=\"img.caption || ('investmentPreview.imageAlt' | translate)\"\n                              class=\"relative aspect-video rounded-lg overflow-hidden group/img ring-1 ring-white/5 hover:ring-2 hover:ring-blue-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400\">\n                        <img [src]=\"resolveImageUrl(img.url)\" [alt]=\"img.caption || ('Image ' + (i + 1))\" class=\"w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105\">\n                        <!-- Hover overlay -->\n                        <div class=\"absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center\">\n                          <svg class=\"w-7 h-7 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803zM10.5 7.5v6m3-3h-6\"/></svg>\n                        </div>\n                        @if (img.caption) {\n                          <div class=\"absolute bottom-0 inset-x-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent text-[11px] text-white font-medium truncate\">\n                            {{ img.caption }}\n                          </div>\n                        }\n                        @if (img.isPrimary) {\n                          <div class=\"absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/80 text-white\">\n                            {{ 'investmentPreview.primaryImage' | translate }}\n                          </div>\n                        }\n                      </button>\n                    }\n                  </div>\n                }\n              </div>\n            }\n\n            <!-- Key Metrics Grid -->\n            <div class=\"grid grid-cols-2 md:grid-cols-3 gap-4\">\n              <!-- Share Price (Equity Only) -->\n              @if (inv.investmentType === InvestmentType.Equity && inv.sharePrice) {\n                <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-lg p-4\">\n                  <p class=\"text-sm text-gray-400 mb-2\">{{ 'investmentPreview.sharePrice' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-blue-400\">${{ inv.sharePrice | number:'1.2-2' }}</p>\n                </div>\n              }\n              <!-- Min Investment -->\n              @if (inv.minInvestment) {\n                <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-lg p-4\">\n                  <p class=\"text-sm text-gray-400 mb-2\">{{ 'investmentPreview.minInvestment' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-purple-400\">${{ inv.minInvestment | number:'1.0-0' }}</p>\n                </div>\n              }\n              <!-- Expected ROI (Equity Only) -->\n              @if (inv.investmentType === InvestmentType.Equity && inv.expectedROI) {\n                <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-lg p-4\">\n                  <p class=\"text-sm text-gray-400 mb-2\">{{ 'investmentPreview.expectedROI' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-green-400\">{{ inv.expectedROI }}%</p>\n                </div>\n              }\n              <!-- Total Shares (Equity Only) -->\n              @if (inv.investmentType === InvestmentType.Equity && inv.totalShares) {\n                <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-lg p-4\">\n                  <p class=\"text-sm text-gray-400 mb-2\">{{ 'investmentPreview.totalShares' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-blue-300\">{{ inv.totalShares | number }}</p>\n                </div>\n              }\n              <!-- Available Shares (Equity Only) -->\n              @if (inv.investmentType === InvestmentType.Equity && inv.availableShares) {\n                <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-lg p-4\">\n                  <p class=\"text-sm text-gray-400 mb-2\">{{ 'investmentPreview.available' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-cyan-400\">{{ inv.availableShares | number }}</p>\n                </div>\n              }\n              <!-- Valuation Cap (Equity Only) -->\n              @if (inv.investmentType === InvestmentType.Equity && inv.valuationCap) {\n                <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-lg p-4\">\n                  <p class=\"text-sm text-gray-400 mb-2\">{{ 'investmentPreview.valuationCap' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-indigo-400\">${{ inv.valuationCap | number:'1.0-0' }}</p>\n                </div>\n              }\n            </div>\n\n            <!-- Funding Progress Section -->\n            <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-8\">\n              <h3 class=\"text-xl font-bold text-white mb-6\">{{ 'investmentPreview.fundingProgress' | translate }}</h3>\n              @let rawProgress = inv.fundingPercentage;\n              @let progress = rawProgress === null ? null : (rawProgress > 100 ? 100 : rawProgress);\n              \n              <div class=\"mb-6\">\n                <div class=\"flex justify-between items-end mb-3\">\n                  <div>\n                    <p class=\"text-gray-400 text-sm mb-1\">{{ 'investmentPreview.amountRaised' | translate }}</p>\n                    <p class=\"text-3xl font-bold text-white\">{{ inv.currentFunding === null ? '\u2014' : (inv.currentFunding | number:'1.0-0') }}</p>\n                  </div>\n                  <div class=\"text-right\">\n                    <p class=\"text-gray-400 text-sm mb-1\">{{ 'investmentPreview.target' | translate }}</p>\n                    <p class=\"text-2xl font-bold text-gray-300\">${{ inv.targetFund | number:'1.0-0' }}</p>\n                  </div>\n                </div>\n                \n                <div class=\"w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600/50\">\n                  <div class=\"h-full transition-all duration-700 ease-out\"\n                       [style.width]=\"(progress ?? 0) + '%'\"\n                       [class]=\"rawProgress >= 100 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :\n                                rawProgress >= 75  ? 'bg-gradient-to-r from-emerald-500 to-green-400' :\n                                rawProgress >= 40  ? 'bg-gradient-to-r from-amber-400 to-orange-400' :\n                                                    'bg-gradient-to-r from-slate-400 to-slate-500'\">\n                  </div>\n                </div>\n                \n                <div class=\"flex justify-between items-center mt-3\">\n                  <span class=\"text-gray-400 text-sm\">{{ progress === null ? '\u2014' : ((progress | number:'1.0-0') + '%') }} {{ 'investmentPreview.funded' | translate }}</span>\n                  <div class=\"flex items-center gap-3\">\n                    <span class=\"text-gray-400 text-sm\">{{ inv.investorCount }} {{ 'investments.investors' | translate }}</span>\n                    @if (inv.endDate) {\n                      <span class=\"text-xs font-semibold\"\n                            [class]=\"getDaysRemaining(inv.endDate) <= 7  ? 'text-red-400' :\n                                     getDaysRemaining(inv.endDate) <= 30 ? 'text-amber-400' : 'text-gray-500'\">\n                        {{ getDaysRemaining(inv.endDate) }}d {{ 'investmentPreview.daysLeft' | translate }}\n                      </span>\n                    }\n                  </div>\n                </div>\n                <dl class=\"mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4\">\n                  <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.remainingFunding' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.remainingFundingAmount === null ? '\u2014' : (inv.remainingFundingAmount | number:'1.0-0') }}</dd></div>\n                  <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.approvedParticipants' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.investorCount === null ? '\u2014' : inv.investorCount }}</dd></div>\n                  @if (inv.investmentModel === 'Equity' || inv.investmentModel === 1) {\n                    <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.sharesSold' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.soldShares == null ? '\u2014' : (inv.soldShares | number) }}</dd></div>\n                    <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.sharesRemaining' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.remainingShares == null ? '\u2014' : (inv.remainingShares | number) }}</dd></div>\n                    <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.sharesOffered' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.offeredShares == null ? '\u2014' : (inv.offeredShares | number) }}</dd></div>\n                    <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.equityAllocated' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.allocatedEquityPercentage == null ? '\u2014' : ((inv.allocatedEquityPercentage | number:'1.0-2') + '%') }}</dd></div>\n                    <div class=\"rounded-lg bg-slate-900/50 p-3\"><dt class=\"text-xs text-gray-400\">{{ 'investmentPreview.equityRemaining' | translate }}</dt><dd class=\"mt-1 font-bold text-white\">{{ inv.remainingEquityPercentage == null ? '\u2014' : ((inv.remainingEquityPercentage | number:'1.0-2') + '%') }}</dd></div>\n                  }\n                </dl>\n              </div>\n\n              <!-- Your Investment -->\n              @if (inv.investedAmount && inv.investedAmount > 0) {\n                <div class=\"bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4\">\n                  <p class=\"text-blue-300 text-sm\">{{ 'investmentPreview.yourInvestment' | translate }}</p>\n                  <p class=\"text-2xl font-bold text-blue-200\">${{ inv.investedAmount | number }}</p>\n                </div>\n              }\n            </div>\n\n            <!-- Team Section -->\n            <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-8\">\n              <h3 class=\"text-xl font-bold text-white mb-6\">{{ 'investmentPreview.projectTeam' | translate }}</h3>\n\n              @if (inv.teamMembers && inv.teamMembers.length > 0) {\n                <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                  @for (member of inv.teamMembers; track member.name) {\n                    <button type=\"button\" (click)=\"navigateToMemberProfile(member.id); $event.stopPropagation()\" class=\"flex items-center gap-4 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all hover:border-blue-500/50 border border-slate-600/50\">\n                      @if (member.avatar) {\n                        <img [src]=\"member.avatar\" [alt]=\"member.name\" class=\"w-14 h-14 rounded-lg object-cover\">\n                      } @else {\n                        <div class=\"w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold\">{{ member.name.charAt(0).toUpperCase() }}</div>\n                      }\n                      <div class=\"flex-1 text-left\">\n                        <p class=\"font-semibold text-white\">{{ member.name }}</p>\n                        <p class=\"text-sm text-gray-400\">{{ member.role }}</p>\n                        @if (member.bio) {\n                          <p class=\"text-xs text-gray-500 mt-1 line-clamp-1\">{{ member.bio }}</p>\n                        }\n                      </div>\n                      <svg class=\"w-4 h-4 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 5l7 7-7 7\"></path></svg>\n                    </button>\n                  }\n                </div>\n              } @else {\n                <p class=\"text-gray-500 text-center py-8\">{{ 'investmentPreview.noTeamMembers' | translate }}</p>\n              }\n            </div>\n\n            <!-- Additional Info -->\n            <div class=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n              <!-- Timeline -->\n              <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-6\">\n                <h4 class=\"font-semibold text-white mb-4\">{{ 'investmentPreview.timeline' | translate }}</h4>\n                <div class=\"space-y-3\">\n                  @if (inv.startDate) {\n                    <div class=\"flex justify-between text-sm\">\n                      <span class=\"text-gray-400\">{{ 'investmentPreview.started' | translate }}</span>\n                      <span class=\"text-white font-medium\">{{ inv.startDate | date:'MMM d, yyyy' }}</span>\n                    </div>\n                  }\n                  @if (inv.endDate) {\n                    <div class=\"flex justify-between text-sm\">\n                      <span class=\"text-gray-400\">{{ 'investmentPreview.targetEnd' | translate }}</span>\n                      <span class=\"text-white font-medium\">{{ inv.endDate | date:'MMM d, yyyy' }}</span>\n                    </div>\n                  }\n                  <div class=\"flex justify-between text-sm\">\n                    <span class=\"text-gray-400\">{{ 'investmentPreview.posted' | translate }}</span>\n                    <span class=\"text-white font-medium\">{{ inv.date | date:'MMM d, yyyy' }}</span>\n                  </div>\n                </div>\n              </div>\n\n              <!-- Quick Stats -->\n              <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-6\">\n                <h4 class=\"font-semibold text-white mb-4\">{{ 'investmentPreview.quickStats' | translate }}</h4>\n                <div class=\"space-y-3\">\n                  <div class=\"flex justify-between text-sm\">\n                    <span class=\"text-gray-400\">{{ 'investmentPreview.credibilityScore' | translate }}</span>\n                    <span class=\"text-blue-300 font-bold\">{{ inv.credibilityScore }}/100</span>\n                  </div>\n                  <div class=\"flex justify-between text-sm\">\n                    <span class=\"text-gray-400\">{{ 'investmentPreview.activeInvestors' | translate }}</span>\n                    <span class=\"text-green-300 font-bold\">{{ inv.investorCount }}</span>\n                  </div>\n                  @if (inv.currency) {\n                    <div class=\"flex justify-between text-sm\">\n                      <span class=\"text-gray-400\">{{ 'investmentPreview.currency' | translate }}</span>\n                      <span class=\"text-gray-300 font-medium\">{{ inv.currency }}</span>\n                    </div>\n                  }\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <!-- Right Sidebar -->\n          <div class=\"lg:col-span-1\">\n            <!-- Founder Card -->\n            <div class=\"sticky top-24 space-y-6\">\n              <div class=\"bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm\">\n                <!-- Founder header -->\n                <div class=\"flex items-center gap-3 mb-4\">\n                  <a [routerLink]=\"['/admin/founders', inv.founderId]\"\n                     class=\"relative flex-shrink-0 rounded-xl ring-2 ring-slate-700 hover:ring-blue-500/50 transition-all\">\n                    <img [src]=\"founderAvatar(inv)\" alt=\"{{ inv.founderDisplay }}\" class=\"w-12 h-12 rounded-xl object-cover\">\n                    @if (inv.status === 'Active') {\n                      <span class=\"absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900\"></span>\n                    }\n                  </a>\n                  <a [routerLink]=\"['/admin/founders', inv.founderId]\" class=\"flex-1 min-w-0 group\">\n                    <p class=\"font-bold text-white truncate group-hover:text-blue-300 transition-colors\">{{ inv.founderDisplay }}</p>\n                    @if (inv.businessRole) {\n                      <p class=\"text-xs text-gray-400 truncate mt-0.5\">{{ inv.businessRole }}</p>\n                    }\n                  </a>\n                </div>\n                <!-- Credibility + Funding metrics -->\n                <div class=\"grid grid-cols-2 gap-2\">\n                  <div class=\"rounded-lg bg-slate-700/40 border border-slate-700/30 p-3 text-center\">\n                    <div class=\"flex items-center justify-center gap-1 mb-1\">\n                      <svg class=\"w-3.5 h-3.5 text-amber-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path d=\"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z\"/></svg>\n                      <p class=\"text-[10px] text-gray-400 uppercase tracking-wide\">{{ 'investmentPreview.credibilityScore' | translate }}</p>\n                    </div>\n                    <p class=\"text-xl font-bold text-white\">{{ inv.credibilityScore }}</p>\n                  </div>\n                  <div class=\"rounded-lg bg-slate-700/40 border border-slate-700/30 p-3 text-center\">\n                    <p class=\"text-[10px] text-gray-400 uppercase tracking-wide mb-1\">{{ 'investmentPreview.fundingProgress' | translate }}</p>\n                    @let fp = inv.fundingPercentage;\n                    <p class=\"text-xl font-bold\"\n                       [class]=\"fp >= 75 ? 'text-emerald-300' : fp >= 40 ? 'text-amber-300' : 'text-white'\">\n                      {{ fp === null ? '\u2014' : ((fp | number:'1.0-0') + '%') }}\n                    </p>\n                  </div>\n                </div>\n              </div>\n\n              <!-- Investors -->\n              <div class=\"bg-slate-800/40 border border-slate-700/50 rounded-xl p-5\">\n                <h3 class=\"text-base font-bold text-white mb-4\">{{ 'investmentPreview.recentInvestors' | translate }}</h3>\n                @if (inv.investors && inv.investors.length > 0) {\n                  <div class=\"space-y-3\">\n                    @for (investor of (inv.investors || []).slice(0, 5); track investor.investorId; let last = $last) {\n                      <div class=\"flex items-center gap-3\" [class.pb-3]=\"!last\" [class.border-b]=\"!last\" [class.border-slate-700/50]=\"!last\">\n                        @if (!investor.isAnonymous && investor.investorAvatar) {\n                          <img [src]=\"investor.investorAvatar\" [alt]=\"investor.investorName\" class=\"w-9 h-9 rounded-full object-cover ring-2 ring-slate-700 flex-shrink-0\">\n                        } @else {\n                          <div class=\"w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0 ring-2 ring-slate-600\">\n                            {{ investor.isAnonymous ? '?' : (investor.investorName?.charAt(0)?.toUpperCase() || '?') }}\n                          </div>\n                        }\n                        <div class=\"flex-1 min-w-0\">\n                          <p class=\"text-sm font-medium text-white truncate\">\n                            {{ investor.isAnonymous ? ('investments.anonymousInvestor' | translate) : investor.investorName }}\n                          </p>\n                          @if (investor.amountInvested) {\n                            <p class=\"text-xs text-gray-400 tabular-nums\">{{ investor.amountInvested | number:'1.0-0' }} {{ inv.currency || 'USD' }}</p>\n                          }\n                        </div>\n                      </div>\n                    }\n                    @if (inv.investors.length > 5) {\n                      <p class=\"text-center text-sm text-gray-400 pt-2\">+{{ inv.investors.length - 5 }} {{ 'investments.investors' | translate }}</p>\n                    }\n                  </div>\n                } @else {\n                  <p class=\"text-gray-500 text-center py-4\">{{ 'investmentPreview.noInvestors' | translate }}</p>\n                }\n              </div>\n\n              <!-- View Media Link -->\n              <a *ngIf=\"false\" [routerLink]=\"['/admin/investments', inv.id, 'media']\"\n                 class=\"flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/25 hover:border-purple-500/50 hover:bg-purple-500/15 transition-all group\">\n                <div class=\"w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0\">\n                  <svg class=\"w-4 h-4 text-purple-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n                    <path fill-rule=\"evenodd\" d=\"M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z\" clip-rule=\"evenodd\"/>\n                  </svg>\n                </div>\n                <div class=\"flex-1 min-w-0\">\n                  <p class=\"text-sm font-semibold text-purple-300 group-hover:text-purple-200 transition-colors\">{{ 'investmentPreview.viewAllMedia' | translate }}</p>\n                  <p class=\"text-[11px] text-gray-500 mt-0.5\">\n                    @if (getProjectMediaImages(inv).length) { {{ getProjectMediaImages(inv).length }}&nbsp;{{ 'investmentPreview.images' | translate }}&nbsp; }\n                    @if (inv.videoUrl) { \u00B7 1&nbsp;{{ 'investmentPreview.video' | translate }} }\n                    @if (getProjectMediaImages(inv).length === 0 && !inv.videoUrl) { {{ 'investmentPreview.noMediaYet' | translate }} }\n                  </p>\n                </div>\n                <svg class=\"w-4 h-4 text-purple-500 group-hover:text-purple-300 transition-colors flex-shrink-0 rtl:rotate-180\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 5l7 7-7 7\"/>\n                </svg>\n              </a>\n\n              <!-- Sidebar CTA Cards (state-aware) -->\n              <div class=\"space-y-3\">\n                @if (getRoomOpportunityId(inv); as roomOpportunityId) {\n                  <a [routerLink]=\"['/admin/opportunities', roomOpportunityId, 'room']\"\n                     class=\"w-full bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 font-bold py-3 px-6 rounded-lg border border-emerald-500/25 hover:border-emerald-500/45 transition-all flex items-center justify-center gap-2\">\n                    <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.75 21h16.5M4.5 3h15l-.75 18H5.25L4.5 3zm4.5 4.5h6m-6 4.5h6m-6 4.5h3\"/></svg>\n                    Project Room\n                  </a>\n                }\n\n                <!-- View Founder Profile -->\n                <button type=\"button\"\n                        (click)=\"openFounderProfile(inv)\"\n                        class=\"w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2\">\n                  <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 6.253a3 3 0 110 5.494a3 3 0 010-5.494z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17.982 17.982A6.5 6.5 0 0012 15.5a6.5 6.5 0 00-5.982 2.482\"/></svg>\n                  {{ 'investmentPreview.viewProfile' | translate }}\n                </button>\n\n                <!-- Contact Founder -->\n                <button type=\"button\"\n                        (click)=\"openContactFounder(inv)\"\n                        [disabled]=\"inv.status === 'Funded' || inv.status === 'Closed'\"\n                        class=\"w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed\">\n                  <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a10.77 10.77 0 01-4.67-1.03L3 20l1.03-3.33A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z\"/></svg>\n                  {{ 'investmentPreview.contactFounder' | translate }}\n                </button>\n\n                <!-- Invest Now -->\n                <button type=\"button\"\n                        (click)=\"openInvestNow(inv)\"\n                        [disabled]=\"inv.status === 'Funded' || inv.status === 'Closed'\"\n                        class=\"w-full font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed\"\n                        [ngClass]=\"{\n                          'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/30 active:scale-[0.98] focus:ring-purple-500': inv.status === 'Active' || inv.status === 'Draft',\n                          'bg-slate-700/50 text-gray-200 border border-slate-600/40': inv.status === 'Funded' || inv.status === 'Closed'\n                        }\">\n                  @if (inv.status === 'Funded') {\n                    <svg class=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z\" clip-rule=\"evenodd\"/></svg>\n                    {{ 'investmentPreview.fullyFunded' | translate }}\n                  } @else if (inv.status === 'Closed') {\n                    <svg class=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z\" clip-rule=\"evenodd\"/></svg>\n                    {{ 'investmentPreview.closed' | translate }}\n                  } @else {\n                    <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"/></svg>\n                    {{ 'investmentPreview.investNow' | translate }}\n                  }\n                </button>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    }\n  } @else {\n    <!-- Not Found State -->\n    <div class=\"container mx-auto px-6 py-40\">\n      <div class=\"text-center\">\n        <div class=\"mb-6 flex justify-center\">\n          <div class=\"w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center\">\n            <svg class=\"w-10 h-10 text-red-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 9v2m0 4v2m0 0v2m0-12V5m0 12V9m0-12h.01\"></path></svg>\n          </div>\n        </div>\n        <h1 class=\"text-4xl font-bold text-white mb-2\">This opportunity is not available.</h1>\n        <p class=\"text-lg text-gray-400 mb-8\">The public Opportunity page could not be found for this record.</p>\n        <a routerLink=\"/admin/investments\" class=\"inline-block bg-gradient-to-r from-blue-500 to-purple-600 font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-opacity text-white\">\n          {{ 'investmentPreview.backButton' | translate }}\n        </a>\n      </div>\n    </div>\n  }\n</div>\n\n<!-- Image Lightbox -->\n@if (lightboxUrl()) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in\"\n       (click)=\"closeLightbox()\"\n       (keydown.escape)=\"closeLightbox()\"\n       tabindex=\"0\"\n       role=\"dialog\"\n       [attr.aria-label]=\"'investmentPreview.imageAlt' | translate\">\n    <button type=\"button\" (click)=\"closeLightbox()\"\n            class=\"absolute top-4 end-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50\">\n      <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 18L18 6M6 6l12 12\"/></svg>\n    </button>\n    <img [src]=\"lightboxUrl()\" alt=\"\" class=\"max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain\" (click)=\"$event.stopPropagation()\">\n  </div>\n}\n\n<!-- Engagement Modal -->\n@if (investmentToEngage(); as investment) {\n  @if (engagementConfirmationOpen()) {\n    <!-- Confirmation Dialog -->\n    <div class=\"fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in\">\n      <div class=\"bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in\" (click)=\"$event.stopPropagation()\">\n        <!-- Header -->\n        <div class=\"p-6 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10\">\n          <div class=\"flex items-center gap-3\">\n            <div class=\"w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center\">\n              <svg class=\"w-6 h-6 text-blue-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\"></path>\n              </svg>\n            </div>\n            <div class=\"flex-1\">\n              <h3 class=\"text-xl font-bold text-white\">{{ 'paidActions.conversationRequest' | translate }}</h3>\n              <p class=\"text-sm text-gray-400 mt-1\">{{ 'paidActions.conversationHelper' | translate }}</p>\n            </div>\n          </div>\n        </div>\n\n        <!-- Body -->\n        <div class=\"p-6 space-y-4\">\n          <!-- Opportunity Details -->\n          <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3\">\n            <div class=\"flex items-center justify-between\">\n              <span class=\"text-gray-400\">{{ 'participationBuilder.opportunityFallback' | translate }}:</span>\n              <span class=\"text-white font-semibold\">{{ investment.name }}</span>\n            </div>\n            <div class=\"flex items-center justify-between\">\n              <span class=\"text-gray-400\">{{ 'paidActions.fixedCost' | translate }}:</span>\n              <span class=\"text-white font-bold text-lg\">{{ paidActionCost(contactFounderQuote()) | number:'1.2-2' }} CREDIT</span>\n            </div>\n            <div class=\"flex items-center justify-between pt-3 border-t border-slate-700/50\">\n              <span class=\"text-gray-400\">{{ 'paidActions.currentBalance' | translate }}:</span>\n              <span class=\"text-blue-300 font-semibold\">{{ paidActionBalance(contactFounderQuote()) | number:'1.2-2' }} CREDIT</span>\n            </div>\n            <div class=\"flex items-center justify-between\">\n              <span class=\"text-gray-400\">{{ 'paidActions.balanceAfter' | translate }}:</span>\n              <span [class]=\"paidActionInsufficient(contactFounderQuote()) ? 'text-red-300' : 'text-green-300'\" class=\"font-semibold\">\n                {{ paidActionAfter(contactFounderQuote()) | number:'1.2-2' }} CREDIT\n              </span>\n            </div>\n          </div>\n\n          <!-- Warning Message -->\n          <div class=\"bg-orange-500/10 border border-orange-500/30 rounded-lg p-4\">\n            <div class=\"flex items-start gap-3\">\n              <svg class=\"w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n                <path fill-rule=\"evenodd\" d=\"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z\" clip-rule=\"evenodd\"></path>\n              </svg>\n              <div>\n                <p class=\"text-sm font-semibold text-orange-300 mb-1\">{{ 'paidActions.platformFeeNoticeTitle' | translate }}</p>\n                <p class=\"text-sm text-orange-200/80\">{{ 'paidActions.platformFeeNotice' | translate }}</p>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <!-- Footer -->\n        <div class=\"p-6 border-t border-slate-700 flex items-center justify-between gap-3 bg-slate-800/50\">\n          <button (click)=\"cancelEngagementConfirmation()\" \n                  [disabled]=\"engagementProcessing()\"\n                  class=\"flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors\">\n            {{ 'paidActions.cancel' | translate }}\n          </button>\n          <button (click)=\"confirmEngage()\" \n                  [disabled]=\"engagementProcessing()\"\n                  class=\"flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2\">\n            @if (engagementProcessing()) {\n              <svg class=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">\n                <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\n                <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\n              </svg>\n              {{ 'paidActions.processing' | translate }}\n            } @else {\n              {{ 'paidActions.confirmAndProceed' | translate }}\n            }\n          </button>\n        </div>\n      </div>\n    </div>\n  } @else {\n    <!-- Initial Engagement Modal -->\n    <div class=\"fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in\" style=\"animation-duration: 0.2s;\">\n      <div class=\"bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in\" style=\"animation-delay: 0.1s; animation-duration: 0.3s;\">\n        <div class=\"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500/30 mb-4\">\n          <svg class=\"w-8 h-8 text-blue-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />\n          </svg>\n        </div>\n        <h3 class=\"text-2xl font-bold text-white text-center mb-2\">{{ 'investments.engageModal.title' | translate }}</h3>\n        <p class=\"text-gray-400 text-center mb-6\" [innerHTML]=\"('investments.engageModal.message' | translate)\n          .replace('{investmentName}', '<span class=\\'font-bold text-blue-300\\'>' + investment.name + '</span>')\n          .replace('{creditCost}', '<span class=\\'font-bold text-white\\'>' + engagementCreditCost + '</span>')\">\n        </p>\n        <div class=\"space-y-3\">\n          <button (click)=\"engagementConfirmationOpen.set(true)\" class=\"w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all\">\n            {{ 'investments.engageModal.proceedButton' | translate }}\n          </button>\n          <button (click)=\"cancelEngage()\" class=\"w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors\">\n            {{ 'investments.engageModal.cancelButton' | translate }}\n          </button>\n        </div>\n      </div>\n    </div>\n  }\n}\n\n<!-- Participate / Invest Dialog (Shares Selection for Equity) -->\n@if (investmentToInvest(); as investment) {\n  <div class=\"fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in\" (click)=\"closeInvestDialog()\">\n    <div class=\"bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in\" (click)=\"$event.stopPropagation()\">\n      <!-- Header -->\n      <div class=\"p-6 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10\">\n        <div class=\"flex items-center justify-between\">\n          <div>\n            <h3 class=\"text-2xl font-bold text-white\">{{ ('investments.investDialog.title' | translate)?.replace('{investmentName}', investment.name) }}</h3>\n            <p class=\"text-sm text-gray-400 mt-1\">{{ investment.founderDisplay }}</p>\n          </div>\n          <button (click)=\"closeInvestDialog()\" class=\"text-gray-400 hover:text-white transition-colors\">\n            <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path>\n            </svg>\n          </button>\n        </div>\n      </div>\n\n      <!-- Body -->\n      <div class=\"p-6 space-y-5\">\n        <!-- Share Price Info -->\n        <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4\">\n          <div class=\"grid grid-cols-2 gap-4\">\n            <div>\n              <p class=\"text-xs text-gray-400 uppercase tracking-wide mb-1\">{{ 'investments.investDialog.sharePrice' | translate }}</p>\n              <p class=\"text-2xl font-bold text-white\">{{ investment.sharePrice | currency:(investment.currency || 'USD') }}</p>\n            </div>\n            <div class=\"text-right\">\n              <p class=\"text-xs text-gray-400 uppercase tracking-wide mb-1\">{{ 'investments.investDialog.available' | translate }}</p>\n              <p class=\"text-xl font-semibold text-blue-300\">{{ investment.availableShares | number }}</p>\n            </div>\n          </div>\n          @if (investment.minInvestment || investment.maxInvestment) {\n            <div class=\"mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-gray-400\">\n              @if (investment.minInvestment) {\n                <span>{{ 'investments.investDialog.minLabel' | translate }}: {{ investment.minInvestment | currency:(investment.currency || 'USD'):'symbol':'1.0-0' }}</span>\n              }\n              @if (investment.maxInvestment) {\n                <span>{{ 'investments.investDialog.maxLabel' | translate }}: {{ investment.maxInvestment | currency:(investment.currency || 'USD'):'symbol':'1.0-0' }}</span>\n              }\n            </div>\n          }\n        </div>\n\n        <!-- Shares Input -->\n        <div>\n          <label class=\"block text-sm font-medium text-gray-300 mb-2\">{{ 'investments.investDialog.sharesLabel' | translate }}</label>\n          <div class=\"flex items-center gap-3\">\n            <button (click)=\"decreaseShares()\" [disabled]=\"sharesToPurchase() <= 1\" \n                    class=\"bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold w-10 h-10 rounded-lg transition-colors\">\n              <svg class=\"w-5 h-5 mx-auto\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M20 12H4\"></path>\n              </svg>\n            </button>\n            <input type=\"number\" \n                   [(ngModel)]=\"sharesToPurchaseValue\" \n                   (change)=\"validateShares(investment)\"\n                   min=\"1\" \n                   [max]=\"investment.availableShares\"\n                   class=\"flex-1 bg-slate-800 border border-slate-600 rounded-lg py-3 px-4 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500\">\n            <button (click)=\"increaseShares(investment)\" [disabled]=\"sharesToPurchase() >= (investment.availableShares || 0)\"\n                    class=\"bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold w-10 h-10 rounded-lg transition-colors\">\n              <svg class=\"w-5 h-5 mx-auto\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4v16m8-8H4\"></path>\n              </svg>\n            </button>\n          </div>\n          <p class=\"text-xs text-gray-400 mt-2 text-center\">\n            {{ ('investments.investDialog.availableLine' | translate)?.replace('{available}', (investment.availableShares | number)) }}\n          </p>\n        </div>\n\n        <!-- Participation Summary -->\n        <div class=\"bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4\">\n          <div class=\"flex items-center justify-between mb-2\">\n            <span class=\"text-gray-300\">{{ 'investments.investDialog.totalInvestment' | translate }}</span>\n            <span class=\"text-2xl font-bold text-white\">{{ calculateInvestmentAmount(investment) | currency:(investment.currency || 'USD') }}</span>\n          </div>\n          @if (investment.expectedROI && investment.expectedROI > 0) {\n            <div class=\"flex items-center justify-between text-sm\">\n              <span class=\"text-gray-400\">{{ 'investments.investDialog.expectedROI' | translate }}</span>\n              <span class=\"text-green-300 font-semibold\">{{ investment.expectedROI }}%</span>\n            </div>\n          }\n        </div>\n\n        <!-- Error/Warning Messages -->\n        @if (investmentError()) {\n          <div class=\"bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2\">\n            <svg class=\"w-5 h-5 text-red-400 flex-shrink-0\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n              <path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\"/>\n            </svg>\n            <p class=\"text-sm text-red-300\">{{ investmentError() }}</p>\n          </div>\n        }\n      </div>\n\n      <!-- Footer -->\n      <div class=\"p-6 border-t border-slate-700 flex items-center justify-between bg-slate-800/50\">\n        <button (click)=\"closeInvestDialog()\" class=\"bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors\">\n          {{ 'investments.investDialog.cancel' | translate }}\n        </button>\n        <button (click)=\"confirmInvestment(investment)\" [disabled]=\"!!investmentError() || investmentProcessing()\"\n                class=\"bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\">\n          @if (investmentProcessing()) {\n            <svg class=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">\n              <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\n              <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\n            </svg>\n            {{ 'investments.investDialog.processing' | translate }}\n          } @else {\n            <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"></path>\n            </svg>\n            {{ 'investments.investDialog.confirm' | translate }}\n          }\n        </button>\n      </div>\n    </div>\n  </div>\n}\n\n<!-- Chat Request Credit Confirmation Dialog -->\n@if (contactFounderConfirmationOpen() && investmentToEngage(); as investment) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in\">\n    <div class=\"bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in\">\n      <div class=\"p-6\">\n        <div class=\"flex items-center gap-3 mb-4\">\n          <div class=\"w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0\">\n            <svg class=\"w-6 h-6 text-blue-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8 12h.01M12 12h.01M16 12h.01\"/>\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21 12c0 4.418-4.03 8-9 8a10.77 10.77 0 0 1-4.67-1.03L3 20l1.03-3.33A7.96 7.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z\"/>\n            </svg>\n          </div>\n          <div>\n            <h3 class=\"text-xl font-bold text-white\">{{ 'paidActions.conversationRequest' | translate }}</h3>\n            <p class=\"text-sm text-gray-400\">{{ investment.name }}</p>\n          </div>\n        </div>\n\n        <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4\">\n          <div class=\"flex items-center justify-between mb-2\">\n            <span class=\"text-gray-400\">{{ 'paidActions.currentBalance' | translate }}</span>\n            <span class=\"text-lg font-bold text-white\">{{ paidActionBalance(contactFounderQuote()) | number }}</span>\n          </div>\n          <div class=\"flex items-center justify-between mb-2\">\n            <span class=\"text-gray-400\">{{ 'paidActions.fixedCost' | translate }}</span>\n            <span class=\"text-lg font-bold text-red-400\">{{ paidActionCost(contactFounderQuote()) | number }}</span>\n          </div>\n          <div class=\"h-px bg-slate-700 my-2\"></div>\n          <div class=\"flex items-center justify-between\">\n            <span class=\"text-gray-300 font-semibold\">{{ 'paidActions.balanceAfter' | translate }}</span>\n            <span [class]=\"paidActionInsufficient(contactFounderQuote()) ? 'text-lg font-bold text-red-400' : 'text-lg font-bold text-green-400'\">{{ paidActionAfter(contactFounderQuote()) | number }}</span>\n          </div>\n        </div>\n\n        @if (paidActionInsufficient(contactFounderQuote())) {\n          <div class=\"mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200\">\n            {{ 'paidActions.insufficientInline' | translate }}\n            <button type=\"button\" (click)=\"addCredits()\" class=\"ms-2 font-bold text-white underline\">{{ 'paidActions.addCredits' | translate }}</button>\n          </div>\n        }\n\n        <p class=\"text-sm text-gray-400 mb-6\">\n          {{ 'paidActions.conversationHelper' | translate }}\n        </p>\n\n        <div class=\"flex gap-3\">\n          <button (click)=\"cancelContactFounder()\" class=\"flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors\">\n            {{ 'paidActions.cancel' | translate }}\n          </button>\n          <button (click)=\"confirmContactFounder()\" [disabled]=\"contactFounderProcessing() || paidActionInsufficient(contactFounderQuote())\"\n                  class=\"flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2\">\n            @if (contactFounderProcessing()) {\n              <svg class=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">\n                <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\n                <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\n              </svg>\n              {{ 'paidActions.processing' | translate }}\n            } @else {\n              {{ 'paidActions.sendConversationRequest' | translate }}\n            }\n          </button>\n        </div>\n      </div>\n    </div>\n  </div>\n}\n\n@if (participationBuilderOpen() && publicOpportunity(); as opp) {\n  <app-participation-builder\n    [opportunityId]=\"getPublicOpportunityId(opp)!\"\n    [opportunityTitle]=\"opp.title || 'Opportunity'\"\n    source=\"PublicOpportunity\"\n    (closed)=\"closeParticipationBuilder()\"\n    (submitted)=\"onParticipationSubmitted()\">\n  </app-participation-builder>\n}\n\n<!-- Participate / Invest Equity Dialog -->\n@if (investNowDialogOpen() && investmentToInvest(); as investment) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in\">\n    <div class=\"bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl animate-scale-in\">\n      <div class=\"p-6\">\n        <div class=\"flex items-center gap-3 mb-6\">\n          <div class=\"w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0\">\n            <svg class=\"w-6 h-6 text-purple-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6\"/>\n            </svg>\n          </div>\n          <div>\n            <h3 class=\"text-xl font-bold text-white\">{{ 'participationBuilder.title' | translate }}</h3>\n            <p class=\"text-sm text-gray-400\">{{ investment.name }}</p>\n          </div>\n        </div>\n\n        <div class=\"grid grid-cols-2 gap-4 mb-6\">\n          <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4\">\n            <p class=\"text-xs text-gray-400 uppercase tracking-wide mb-1\">{{ 'participationBuilder.labels.pricePerShare' | translate }}</p>\n            <p class=\"text-2xl font-bold text-blue-400\">${{ investment.sharePrice | number:'1.2-2' }}</p>\n          </div>\n          <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4\">\n            <p class=\"text-xs text-gray-400 uppercase tracking-wide mb-1\">{{ 'participationBuilder.labels.availableShares' | translate }}</p>\n            <p class=\"text-2xl font-bold text-purple-400\">{{ investment.availableShares | number }}</p>\n          </div>\n        </div>\n\n        <!-- Share Selection -->\n        <div class=\"mb-6\">\n          <label class=\"block text-sm font-semibold text-white mb-3\">{{ 'participationBuilder.labels.numberOfShares' | translate }}</label>\n          <div class=\"flex items-center gap-3\">\n            <button (click)=\"adjustShares(investment, -1)\" [disabled]=\"equitySharesRequested() <= 1\"\n                    class=\"w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed\">\n              -\n            </button>\n            <div class=\"flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-center\">\n              <span class=\"text-2xl font-bold text-white\">{{ equitySharesRequested() }}</span>\n            </div>\n            <button (click)=\"adjustShares(investment, 1)\" [disabled]=\"equitySharesRequested() >= (investment.availableShares || 0)\"\n                    class=\"w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed\">\n              +\n            </button>\n          </div>\n        </div>\n\n        <!-- Total Value Calculation -->\n        <div class=\"bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-6\">\n          <div class=\"flex items-center justify-between\">\n            <span class=\"text-gray-300\">{{ 'paidActions.investmentValue' | translate }}</span>\n            <span class=\"text-3xl font-bold text-white\">${{ calculateEquityTotalValue(investment) | number:'1.2-2' }}</span>\n          </div>\n        </div>\n\n        <!-- Error Message -->\n        @if (investmentError()) {\n          <div class=\"bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2\">\n            <svg class=\"w-5 h-5 text-red-400 flex-shrink-0\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n              <path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\"/>\n            </svg>\n            <p class=\"text-sm text-red-300\">{{ investmentError() }}</p>\n          </div>\n        }\n\n        <div class=\"flex gap-3\">\n          <button (click)=\"closeInvestNowDialog()\" class=\"flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors\">\n            {{ 'paidActions.cancel' | translate }}\n          </button>\n          <button (click)=\"proceedToInvestConfirmation(investment)\" [disabled]=\"!!investmentError()\"\n                  class=\"flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed\">\n            {{ 'common.next' | translate }}\n          </button>\n        </div>\n      </div>\n    </div>\n  </div>\n}\n\n<!-- Participate / Invest Credit Confirmation Dialog -->\n@if (investNowConfirmationOpen() && investmentToInvest(); as investment) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in\">\n    <div class=\"bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in\">\n      <div class=\"p-6\">\n        <div class=\"flex items-center gap-3 mb-4\">\n          <div class=\"w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0\">\n            <svg class=\"w-6 h-6 text-purple-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6\"/>\n            </svg>\n          </div>\n          <div>\n            <h3 class=\"text-xl font-bold text-white\">{{ 'participationBuilder.labels.participationSummary' | translate }}</h3>\n            <p class=\"text-sm text-gray-400\">{{ investment.name }}</p>\n          </div>\n        </div>\n\n        <div class=\"bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4\">\n          <div class=\"flex items-center justify-between mb-2\">\n            <span class=\"text-gray-400\">{{ 'paidActions.currentBalance' | translate }}</span>\n            <span class=\"text-lg font-bold text-white\">{{ paidActionBalance(investNowQuote()) | number:'1.2-2' }}</span>\n          </div>\n          <div class=\"flex items-center justify-between mb-2\">\n            <span class=\"text-gray-400\">{{ 'paidActions.fixedCost' | translate }}</span>\n            <span class=\"text-lg font-bold text-red-400\">{{ paidActionCost(investNowQuote()) | number:'1.2-2' }}</span>\n          </div>\n          <div class=\"h-px bg-slate-700 my-2\"></div>\n          <div class=\"flex items-center justify-between\">\n            <span class=\"text-gray-300 font-semibold\">{{ 'paidActions.balanceAfter' | translate }}</span>\n            <span [class]=\"paidActionInsufficient(investNowQuote()) ? 'text-lg font-bold text-red-400' : 'text-lg font-bold text-green-400'\">{{ paidActionAfter(investNowQuote()) | number:'1.2-2' }}</span>\n          </div>\n        </div>\n\n        <div class=\"bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6\">\n          <p class=\"text-sm text-blue-300 mb-2\">{{ 'participationBuilder.labels.participationSummary' | translate }}</p>\n          <div class=\"flex items-center justify-between text-sm\">\n            <span class=\"text-gray-400\">{{ 'participationBuilder.labels.selectedShares' | translate }}</span>\n            <span class=\"text-white font-semibold\">{{ equitySharesRequested() }}</span>\n          </div>\n          <div class=\"flex items-center justify-between text-sm mt-1\">\n            <span class=\"text-gray-400\">{{ 'participationBuilder.labels.pricePerShare' | translate }}</span>\n            <span class=\"text-white font-semibold\">${{ investment.sharePrice | number:'1.2-2' }}</span>\n          </div>\n          <div class=\"flex items-center justify-between text-sm mt-1\">\n            <span class=\"text-gray-400\">{{ 'paidActions.investmentValue' | translate }}</span>\n            <span class=\"text-white font-semibold\">${{ calculateEquityTotalValue(investment) | number:'1.2-2' }}</span>\n          </div>\n        </div>\n\n        <p class=\"text-sm text-gray-400 mb-6\">\n          {{ 'paidActions.participationHelper' | translate }}\n        </p>\n\n        <div class=\"flex gap-3\">\n          <button (click)=\"cancelInvestConfirmation()\" class=\"flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors\">\n            Cancel\n          </button>\n          <button (click)=\"confirmInvestNow(investment)\" [disabled]=\"investNowProcessing()\"\n                  class=\"flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2\">\n            @if (investNowProcessing()) {\n              <svg class=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">\n                <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\n                <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\n              </svg>\n              Processing...\n            } @else {\n              Submit\n            }\n          </button>\n        </div>\n      </div>\n    </div>\n  </div>\n}\n\n@if (reportModalOpen() && reportTarget(); as target) {\n  <div class=\"fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm\">\n    <section class=\"w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl\">\n      <header class=\"border-b border-slate-800 p-5\">\n        <p class=\"text-xs font-semibold uppercase tracking-[0.18em] text-red-300\">{{ 'reports.title' | translate }}</p>\n        <h2 class=\"mt-2 text-xl font-bold text-white\">{{ 'reports.sendReport' | translate }}</h2>\n        <p class=\"mt-1 text-sm text-slate-400\">{{ target.title }}</p>\n      </header>\n      <div class=\"space-y-4 p-5\">\n        @if (reportSuccess()) {\n          <div class=\"rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100\">\n            {{ 'reports.success' | translate }}\n          </div>\n        } @else {\n          <label class=\"block text-sm font-semibold text-slate-200\">\n            {{ 'reports.reason' | translate }}\n            <select class=\"mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white\"\n                    [ngModel]=\"reportReason()\"\n                    (ngModelChange)=\"setReportReason($event)\">\n              @for (reason of reportReasons; track reason) {\n                <option [value]=\"reason\">{{ reportReasonLabel(reason) }}</option>\n              }\n            </select>\n          </label>\n          <label class=\"block text-sm font-semibold text-slate-200\">\n            {{ 'reports.description' | translate }}\n            <textarea rows=\"4\"\n                      class=\"mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white\"\n                      [placeholder]=\"'reports.descriptionPlaceholder' | translate\"\n                      [ngModel]=\"reportDescription()\"\n                      (ngModelChange)=\"setReportDescription($event)\"></textarea>\n          </label>\n          @if (reportError()) {\n            <div class=\"rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100\">{{ reportError() }}</div>\n          }\n        }\n      </div>\n      <footer class=\"flex gap-3 border-t border-slate-800 p-5\">\n        <button type=\"button\" (click)=\"closeReportModal()\" class=\"flex-1 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700\">\n          {{ reportSuccess() ? ('common.close' | translate) : ('reports.cancel' | translate) }}\n        </button>\n        @if (!reportSuccess()) {\n          <button type=\"button\"\n                  (click)=\"submitReport()\"\n                  [disabled]=\"reportSubmitting()\"\n                  class=\"flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50\">\n            {{ reportSubmitting() ? ('reports.submitting' | translate) : ('reports.submit' | translate) }}\n          </button>\n        }\n      </footer>\n    </section>\n  </div>\n}\n", styles: ["@use 'variables' as *;\n@use 'mixins' as *;\n\n// Animations\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n// Utility Classes\n.animate-fade-in {\n  animation: fadeIn var(--animation-duration, 0.3s) ease-out forwards;\n}\n\n.line-clamp-1 {\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 1;\n  -webkit-box-orient: vertical;\n}\n\n:host-context(body.investa-theme-light) {\n  .project-stages {\n    .stages-line {\n      background: linear-gradient(90deg, #dbe3ef, #cbd5e1, #dbe3ef);\n    }\n\n    .stage-item {\n      .stage-circle.upcoming {\n        background: var(--investa-surface-2);\n        color: var(--investa-text-muted);\n        border: 1px solid var(--investa-border);\n      }\n\n      .stage-label.active,\n      .stage-label.completed,\n      .milestone-box .milestone-value {\n        color: var(--investa-text-primary);\n      }\n\n      .stage-label.upcoming {\n        color: var(--investa-text-muted);\n      }\n\n      .current-badge {\n        background: rgba(37, 99, 235, 0.1);\n        color: #1d4ed8;\n        border-color: rgba(37, 99, 235, 0.22);\n      }\n    }\n\n    .milestone-box {\n      background: rgba(37, 99, 235, 0.06);\n      border-color: rgba(37, 99, 235, 0.18);\n\n      .milestone-label {\n        color: #1d4ed8;\n      }\n    }\n  }\n\n  .investment-preview {\n    .metric-card,\n    .section-card,\n    .team-member,\n    .document-card,\n    .timeline-item,\n    .funding-progress-card,\n    .modal-content {\n      background: var(--investa-surface);\n      border-color: var(--investa-border);\n      color: var(--investa-text-primary);\n      box-shadow: var(--investa-shadow-sm);\n    }\n\n    .metric-card:hover,\n    .section-card:hover,\n    .team-member:hover,\n    .document-card:hover {\n      background: var(--investa-surface-2);\n      border-color: rgba(16, 185, 129, 0.22);\n    }\n\n    .metric-card .label,\n    .timeline-date,\n    .document-meta,\n    .member-role {\n      color: var(--investa-text-muted);\n    }\n\n    .tab-button {\n      background: var(--investa-surface);\n      color: var(--investa-text-secondary);\n      border-color: var(--investa-border);\n\n      &.active {\n        background: rgba(16, 185, 129, 0.1);\n        color: #047857;\n        border-color: rgba(16, 185, 129, 0.24);\n      }\n    }\n  }\n}\n\n// Glassmorphism effect for cards\n.backdrop-blur-md {\n  backdrop-filter: blur(12px);\n}\n\n// Project Stages Timeline\n.project-stages {\n  position: relative;\n  \n  // Connecting line between stages\n  .stages-line {\n    position: absolute;\n    top: 1.5rem;\n    left: 0;\n    right: 0;\n    height: 4px;\n    background: linear-gradient(90deg, rgb(51, 65, 85), rgb(71, 85, 105), rgb(51, 65, 85));\n    z-index: 0;\n  }\n  \n  // Individual stage containers\n  .stage-item {\n    position: relative;\n    z-index: 10;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    \n    // Stage circle indicator\n    .stage-circle {\n      width: 3rem;\n      height: 3rem;\n      border-radius: 50%;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-weight: bold;\n      font-size: 0.875rem;\n      margin-bottom: 0.75rem;\n      transition: all 0.3s ease;\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n      \n      // Active/completed stages\n      &.active {\n        background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));\n        color: white;\n        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);\n      }\n      \n      // Completed stages\n      &.completed {\n        background: linear-gradient(135deg, rgb(34, 197, 94), rgb(59, 130, 246));\n        color: white;\n        box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);\n      }\n      \n      // Upcoming stages\n      &.upcoming {\n        background: rgb(51, 65, 85);\n        color: rgb(156, 163, 175);\n      }\n    }\n    \n    // Stage label\n    .stage-label {\n      font-size: 0.875rem;\n      font-weight: 600;\n      text-align: center;\n      transition: color 0.3s ease;\n      \n      &.active {\n        color: white;\n      }\n      \n      &.completed {\n        color: rgb(156, 163, 175);\n      }\n      \n      &.upcoming {\n        color: rgb(107, 114, 128);\n      }\n    }\n    \n    // Current badge\n    .current-badge {\n      display: inline-block;\n      margin-top: 0.5rem;\n      padding: 0.25rem 0.75rem;\n      font-size: 0.75rem;\n      font-weight: bold;\n      background: rgba(59, 130, 246, 0.2);\n      color: rgb(147, 210, 255);\n      border: 1px solid rgba(59, 130, 246, 0.3);\n      border-radius: 9999px;\n      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n    }\n    \n    // Completed checkmark\n    .completed-badge {\n      display: inline-block;\n      margin-top: 0.5rem;\n      font-size: 0.875rem;\n      font-weight: 600;\n      color: rgb(74, 222, 128);\n    }\n  }\n  \n  // Milestone info box\n  .milestone-box {\n    margin-top: 2rem;\n    padding: 1rem;\n    background: rgba(59, 130, 246, 0.1);\n    border: 1px solid rgba(59, 130, 246, 0.3);\n    border-radius: 0.5rem;\n    \n    .milestone-label {\n      font-size: 0.875rem;\n      color: rgb(147, 210, 255);\n      font-weight: 600;\n      margin-bottom: 0.25rem;\n    }\n    \n    .milestone-value {\n      font-size: 1.125rem;\n      color: rgb(219, 234, 254);\n      font-weight: bold;\n    }\n  }\n}\n\n// Pulse animation for current stage\n@keyframes pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.7;\n  }\n}\n\n// Improved hero section with gradient overlay\n.investment-preview {\n  // Hero image overlay improvements\n  .hero-image {\n    position: relative;\n    \n    img {\n      object-fit: cover;\n      object-position: center;\n    }\n  }\n  \n  // Enhanced badge styling\n  .badge {\n    display: inline-flex;\n    align-items: center;\n    gap: 0.5rem;\n    font-weight: 600;\n    font-size: 0.875rem;\n    padding: 0.5rem 1rem;\n    border-radius: 9999px;\n    transition: all 0.3s ease;\n    \n    &:hover {\n      transform: translateY(-2px);\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n    }\n  }\n  \n  // Enhanced metric cards\n  .metric-card {\n    background: rgba(30, 41, 59, 0.4);\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    border-radius: 0.5rem;\n    padding: 1rem;\n    transition: all 0.3s ease;\n    \n    &:hover {\n      background: rgba(30, 41, 59, 0.6);\n      border-color: rgba(71, 85, 105, 0.8);\n      transform: translateY(-2px);\n    }\n    \n    .label {\n      font-size: 0.875rem;\n      color: rgb(156, 163, 175);\n      margin-bottom: 0.5rem;\n      display: block;\n    }\n    \n    .value {\n      font-size: 1.5rem;\n      font-weight: bold;\n      color: inherit;\n    }\n  }\n  \n  // Section cards with subtle hover effect\n  .section-card {\n    background: rgba(30, 41, 59, 0.4);\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    border-radius: 0.75rem;\n    padding: 2rem;\n    transition: all 0.3s ease;\n    \n    &:hover {\n      background: rgba(30, 41, 59, 0.5);\n      border-color: rgba(71, 85, 105, 0.7);\n    }\n  }\n  \n  // Team member cards with interactive effects\n  .team-member {\n    display: flex;\n    align-items: center;\n    gap: 1rem;\n    padding: 1rem;\n    background: rgba(51, 65, 85, 0.3);\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    border-radius: 0.5rem;\n    transition: all 0.3s ease;\n    cursor: pointer;\n    \n    &:hover {\n      background: rgba(51, 65, 85, 0.5);\n      border-color: rgb(59, 130, 246);\n      transform: translateX(4px);\n    }\n    \n    .avatar {\n      flex-shrink: 0;\n      width: 3.5rem;\n      height: 3.5rem;\n      border-radius: 0.5rem;\n      object-fit: cover;\n    }\n    \n    .info {\n      flex: 1;\n      min-width: 0;\n      \n      .name {\n        font-weight: 600;\n        color: white;\n        margin-bottom: 0.25rem;\n      }\n      \n      .role {\n        font-size: 0.875rem;\n        color: rgb(156, 163, 175);\n      }\n      \n      .bio {\n        font-size: 0.75rem;\n        color: rgb(107, 114, 128);\n        margin-top: 0.25rem;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n    }\n  }\n  \n  // Investor list items\n  .investor-item {\n    display: flex;\n    align-items: center;\n    gap: 0.75rem;\n    padding: 0.75rem 0;\n    \n    .avatar {\n      flex-shrink: 0;\n      width: 2.5rem;\n      height: 2.5rem;\n      border-radius: 9999px;\n      object-fit: cover;\n      border: 2px solid rgba(71, 85, 105, 0.5);\n    }\n    \n    .info {\n      flex: 1;\n      min-width: 0;\n      \n      .name {\n        font-size: 0.875rem;\n        font-weight: 500;\n        color: white;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n      \n      .amount {\n        font-size: 0.75rem;\n        color: rgb(156, 163, 175);\n      }\n    }\n  }\n  \n  // Funding progress bar\n  .progress-bar {\n    height: 1rem;\n    background: rgba(51, 65, 85, 0.5);\n    border-radius: 9999px;\n    border: 1px solid rgba(71, 85, 105, 0.5);\n    overflow: hidden;\n    \n    .fill {\n      height: 100%;\n      background: linear-gradient(90deg, rgb(59, 130, 246), rgb(147, 51, 234), rgb(236, 72, 153));\n      border-radius: 9999px;\n      transition: width 0.5s ease-out;\n    }\n  }\n  \n  // Modal styles\n  .modal-overlay {\n    position: fixed;\n    inset: 0;\n    background: rgba(0, 0, 0, 0.7);\n    backdrop-filter: blur(4px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 50;\n    padding: 1rem;\n  }\n  \n  .modal {\n    background: rgb(15, 23, 42);\n    border: 1px solid rgb(71, 85, 105);\n    border-radius: 1.5rem;\n    padding: 2rem;\n    width: 100%;\n    max-width: 32rem;\n    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);\n    \n    .modal-icon {\n      width: 4rem;\n      height: 4rem;\n      background: rgba(59, 130, 246, 0.1);\n      border: 2px solid rgba(59, 130, 246, 0.3);\n      border-radius: 9999px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      margin: 0 auto 1rem;\n      \n      svg {\n        width: 2rem;\n        height: 2rem;\n        color: rgb(96, 165, 250);\n      }\n    }\n    \n    .modal-title {\n      font-size: 1.5rem;\n      font-weight: bold;\n      color: white;\n      text-align: center;\n      margin-bottom: 0.5rem;\n    }\n    \n    .modal-message {\n      color: rgb(156, 163, 175);\n      text-align: center;\n      margin-bottom: 1.5rem;\n    }\n  }\n  \n  // Button styling\n  .btn {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    gap: 0.5rem;\n    padding: 1rem 1.5rem;\n    border: none;\n    border-radius: 0.5rem;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.3s ease;\n    \n    &.btn-primary {\n      background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));\n      color: white;\n      \n      &:hover {\n        transform: translateY(-2px);\n        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);\n      }\n      \n      &:active {\n        transform: translateY(0);\n      }\n    }\n    \n    &.btn-secondary {\n      background: rgb(51, 65, 85);\n      color: white;\n      \n      &:hover {\n        background: rgb(71, 85, 105);\n      }\n    }\n  }\n  \n  // Responsive improvements\n  @media (max-width: 1024px) {\n    .team-member {\n      grid-column: span 1;\n    }\n  }\n  \n  @media (max-width: 640px) {\n    .metric-card {\n      padding: 0.75rem;\n      \n      .label {\n        font-size: 0.75rem;\n      }\n      \n      .value {\n        font-size: 1.25rem;\n      }\n    }\n    \n    .team-member {\n      .avatar {\n        width: 2.5rem;\n        height: 2.5rem;\n      }\n    }\n  }\n}\n\n\n/* Route-level shell shared by public and legacy opportunity views */\n.investment-preview-page {\n  min-height: 100vh;\n  background: var(--investa-bg);\n  color: var(--investa-text-primary);\n}\n.investment-preview-routebar {\n  position: sticky;\n  top: 0;\n  z-index: 40;\n  border-bottom: 1px solid var(--investa-border);\n  background: color-mix(in srgb, var(--investa-surface) 92%, transparent);\n  backdrop-filter: blur(14px);\n}\n.investment-preview-routebar-inner {\n  width: min(1380px, calc(100% - 32px));\n  min-height: 48px;\n  margin-inline: auto;\n  display: flex;\n  align-items: center;\n}\n.investment-preview-routebar-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: var(--investa-text-secondary);\n  font-size: .75rem;\n  font-weight: 750;\n  transition: color .16s ease;\n}\n.investment-preview-routebar-link:hover { color: var(--investa-text-primary); }\n@media (max-width: 760px) {\n  .investment-preview-routebar-inner { width: min(100% - 20px, 1380px); }\n}\n\n/* Public opportunity \u2014 decision-first redesign */\n.public-opportunity {\n  min-height: 100vh;\n  background: var(--investa-bg, #e8e8e8);\n  color: var(--investa-text-primary, #212225);\n  padding-bottom: 3rem;\n}\n\n.public-shell { width: min(1380px, calc(100% - 32px)); margin-inline: auto; }\n.public-topbar { display:flex; align-items:center; justify-content:space-between; min-height:56px; }\n.public-back-link { display:inline-flex; align-items:center; gap:.5rem; color:var(--investa-text-secondary); font-size:.8125rem; font-weight:700; }\n.public-draft-banner { background:#fff7ed; border-bottom:1px solid #fed7aa; color:#9a3412; }\n.public-draft-inner { min-height:54px; display:flex; align-items:center; justify-content:space-between; gap:16px; font-size:.8125rem; }\n.public-draft-inner div:first-child { display:flex; gap:10px; align-items:center; }\n.public-actions-row { display:flex; gap:8px; }\n\n.public-layout { display:grid; grid-template-columns:minmax(0, 1fr) 330px; gap:18px; align-items:start; }\n.public-main { min-width:0; display:flex; flex-direction:column; gap:16px; }\n.public-hero { position:relative; min-height:330px; border-radius:18px; overflow:hidden; background:#15171a; box-shadow:var(--investa-shadow-md); }\n.public-hero-image { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }\n.public-hero-overlay { position:absolute; inset:0; background:linear-gradient(90deg, rgba(7,12,16,.95) 0%, rgba(7,12,16,.75) 52%, rgba(7,12,16,.35) 100%), linear-gradient(0deg, rgba(7,12,16,.72), transparent 58%); }\n.public-hero-content { position:relative; z-index:1; min-height:330px; padding:30px; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-start; color:#fff; }\n.public-badges { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }\n.public-badge { display:inline-flex; align-items:center; max-width:100%; min-height:24px; border-radius:999px; padding:4px 9px; border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.1); color:inherit; font-size:.6875rem; line-height:1; font-weight:750; }\n.public-badge-green { background:rgba(34,197,50,.15); border-color:rgba(34,197,50,.32); color:#167c24; }\n.public-hero .public-badge-green { color:#d8ffdd; }\n.public-hero h1 { max-width:740px; margin:0; font-size:clamp(2rem, 4vw, 3rem); line-height:1.02; letter-spacing:-.04em; font-weight:800; text-shadow:0 3px 18px rgba(0,0,0,.55); }\n.public-hero > .public-hero-content > p { max-width:650px; margin:12px 0 0; color:rgba(255,255,255,.82); font-size:.9rem; line-height:1.65; }\n.public-founder { display:inline-flex; align-items:center; gap:9px; margin-top:17px; color:rgba(255,255,255,.86); font-size:.75rem; }\n.public-founder-avatar { width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:#fff; color:#17191b; font-weight:800; border:2px solid rgba(255,255,255,.45); }\n.public-hero-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }\n.public-hero-meta span { padding:5px 9px; border-radius:8px; border:1px solid rgba(255,255,255,.14); background:rgba(8,12,16,.35); color:rgba(255,255,255,.78); font-size:.6875rem; }\n\n.public-section-nav { display:flex; align-items:center; gap:4px; overflow:auto; padding:5px; border:1px solid var(--investa-border); border-radius:13px; background:var(--investa-surface); box-shadow:var(--investa-shadow-sm); }\n.public-section-nav a { flex:0 0 auto; display:inline-flex; align-items:center; gap:6px; min-height:34px; padding:7px 12px; border-radius:9px; color:var(--investa-text-secondary); font-size:.75rem; font-weight:700; }\n.public-section-nav a:first-child { background:var(--investa-primary); color:var(--investa-primary-contrast, #fff); }\n.public-section-nav span { display:inline-grid; min-width:18px; height:18px; place-items:center; border-radius:6px; background:var(--investa-surface-soft); font-size:.625rem; }\n.public-section-nav a:first-child span { background:rgba(255,255,255,.14); }\n\n.public-card { border:1px solid var(--investa-border); border-radius:15px; background:var(--investa-surface); padding:18px; box-shadow:var(--investa-shadow-sm); }\n.public-content-grid { display:grid; grid-template-columns:minmax(0, 1.6fr) minmax(260px, .8fr); gap:14px; }\n.public-card-wide { min-width:0; }\n.public-two-column { display:grid; grid-template-columns:1fr 1fr; gap:14px; }\n.public-section-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }\n.public-section-heading span:first-child { display:block; color:var(--investa-text-muted); font-size:.625rem; text-transform:uppercase; letter-spacing:.13em; font-weight:800; }\n.public-section-heading h2 { margin:3px 0 0; color:var(--investa-text-primary); font-size:1rem; line-height:1.3; font-weight:800; }\n.public-body-copy { color:var(--investa-text-secondary); font-size:.8125rem; line-height:1.72; white-space:pre-line; }\n.public-body-copy.compact { line-height:1.62; }\n.public-highlights { display:grid; grid-template-columns:repeat(3, 1fr); gap:9px; margin-top:16px; }\n.public-highlights div { min-width:0; padding:10px; border-radius:10px; background:var(--investa-surface-soft); border:1px solid var(--investa-border); }\n.public-highlights strong,.public-highlights span { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n.public-highlights strong { font-size:.75rem; color:var(--investa-text-primary); }\n.public-highlights span { margin-top:2px; font-size:.625rem; color:var(--investa-text-muted); }\n.public-terms-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }\n.public-terms-grid > div { padding:11px 12px; border:1px solid var(--investa-border); border-radius:10px; background:var(--investa-surface-soft); }\n.public-terms-grid span,.public-terms-grid strong { display:block; }\n.public-terms-grid span { color:var(--investa-text-muted); font-size:.6875rem; }\n.public-terms-grid strong { margin-top:5px; color:var(--investa-text-primary); font-size:.8125rem; line-height:1.5; }\n.public-term-wide { grid-column:1 / -1; }\n.public-list,.public-file-list { display:flex; flex-direction:column; }\n.public-list-row { display:grid; grid-template-columns:32px minmax(0, 1fr) auto; gap:10px; align-items:center; padding:10px 0; border-top:1px solid var(--investa-border); }\n.public-list-row:first-child { border-top:0; }\n.public-list-icon { width:28px; height:28px; display:grid; place-items:center; border-radius:9px; background:var(--investa-accent-soft); color:var(--investa-accent); font-weight:900; }\n.public-list-row strong,.public-list-row p { display:block; }\n.public-list-row strong { color:var(--investa-text-primary); font-size:.75rem; }\n.public-list-row p { margin-top:2px; color:var(--investa-text-muted); font-size:.6875rem; line-height:1.45; }\n.public-list-row time { color:var(--investa-text-muted); font-size:.625rem; white-space:nowrap; }\n.public-file-row { display:grid; grid-template-columns:34px minmax(0,1fr) auto; gap:10px; align-items:center; padding:9px 0; border-top:1px solid var(--investa-border); color:var(--investa-text-primary); }\n.public-file-row:first-child { border-top:0; }\n.public-file-icon { width:31px; height:31px; display:grid; place-items:center; border-radius:8px; background:#fff1f2; color:#dc2626; font-size:.55rem; font-weight:900; }\n.public-file-row strong,.public-file-row small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n.public-file-row strong { font-size:.72rem; }\n.public-file-row small { margin-top:2px; color:var(--investa-text-muted); font-size:.625rem; }\n.public-media-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }\n.public-media-grid button { overflow:hidden; aspect-ratio:16/10; border-radius:9px; background:var(--investa-surface-soft); }\n.public-media-grid img { width:100%; height:100%; object-fit:cover; transition:transform .2s ease; }\n.public-media-grid button:hover img { transform:scale(1.04); }\n.public-empty { padding:18px; border-radius:10px; background:var(--investa-surface-soft); color:var(--investa-text-muted); font-size:.75rem; text-align:center; }\n\n.public-investment-panel { position:sticky; top:72px; display:flex; flex-direction:column; gap:12px; }\n.public-summary-card,.public-relationship-card { border:1px solid var(--investa-border); border-radius:15px; background:var(--investa-surface); padding:17px; box-shadow:var(--investa-shadow-sm); }\n.public-summary-heading,.public-relationship-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:.75rem; font-weight:800; color:var(--investa-text-primary); }\n.public-summary-numbers { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }\n.public-summary-numbers div:last-child { text-align:end; }\n.public-summary-numbers span,.public-summary-numbers strong,.public-summary-grid span,.public-summary-grid strong { display:block; }\n.public-summary-numbers span,.public-summary-grid span { color:var(--investa-text-muted); font-size:.625rem; }\n.public-summary-numbers strong { margin-top:4px; color:var(--investa-text-primary); font-size:.875rem; }\n.public-progress { height:5px; overflow:hidden; margin:12px 0 16px; border-radius:999px; background:var(--investa-surface-soft); }\n.public-progress span { display:block; height:100%; border-radius:inherit; background:var(--investa-accent); }\n.public-summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding-top:14px; border-top:1px solid var(--investa-border); }\n.public-summary-grid strong { margin-top:3px; color:var(--investa-text-primary); font-size:.72rem; line-height:1.35; }\n.public-relationship-card p { margin:12px 0; color:var(--investa-text-secondary); font-size:.75rem; line-height:1.55; }\n.public-relationship-actions { display:flex; flex-direction:column; gap:8px; }\n.public-relationship-actions .investa-btn-primary,.public-relationship-actions .investa-btn-secondary { width:100%; min-height:40px; }\n.public-relationship-card small { display:block; margin-top:11px; color:var(--investa-text-muted); font-size:.625rem; line-height:1.45; }\n.public-full-button { width:100%; }\n\n:host-context(body.investa-theme-light) {\n  .public-hero h1 { color:#ffffff; text-shadow:0 2px 8px rgba(0,0,0,.55); }\n  .public-founder { color:rgba(255,255,255,.86); text-shadow:0 1px 4px rgba(0,0,0,.4); }\n}\n\n:host-context(body:not(.investa-theme-light)) {\n  .public-opportunity { background:var(--investa-bg); }\n  .public-badge-green { color:#9cf7a7; }\n  .public-file-icon { background:rgba(220,38,38,.14); color:#fda4af; }\n  .public-hero h1 { color:#ffffff; text-shadow:0 2px 8px rgba(0,0,0,.55); }\n  .public-founder { color:rgba(255,255,255,.86); text-shadow:0 1px 4px rgba(0,0,0,.4); }\n}\n\n@media (max-width: 1100px) {\n  .public-layout { grid-template-columns:1fr; }\n  .public-investment-panel { position:static; display:grid; grid-template-columns:1fr 1fr; }\n  .public-full-button { grid-column:1 / -1; }\n}\n@media (max-width: 760px) {\n  .public-shell { width:min(100% - 20px, 1380px); }\n  .public-topbar { min-height:48px; }\n  .public-hero,.public-hero-content { min-height:270px; }\n  .public-hero-content { padding:20px; }\n  .public-hero h1 { font-size:clamp(1.65rem, 8vw, 2.25rem); }\n  .public-content-grid,.public-two-column,.public-investment-panel { grid-template-columns:1fr; }\n  .public-highlights { grid-template-columns:1fr; }\n  .public-terms-grid { grid-template-columns:1fr; }\n  .public-term-wide { grid-column:auto; }\n  .public-card { padding:15px; }\n  .public-list-row { grid-template-columns:30px minmax(0,1fr); }\n  .public-list-row time { grid-column:2; }\n  .public-draft-inner { align-items:flex-start; padding-block:10px; }\n  .public-draft-inner div:first-child { align-items:flex-start; flex-direction:column; gap:2px; }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvestmentPreviewComponent, { className: "InvestmentPreviewComponent", filePath: "src/app/pages/admin/investment-preview/investment-preview.component.ts", lineNumber: 74 }); })();
