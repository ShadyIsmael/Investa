import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FileStoreService } from '../../../services/file-store.service';
import { LanguageService } from '../../../services/language.service';
import { OpportunityService } from '../../../services/opportunity.service';
import { ProfileService } from '../../../services/profile.service';
import { ReportService } from '../../../services/report.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = a0 => ["/admin/investments", a0];
const _forTrack0 = ($index, $item) => $item.id;
function FounderProfileComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 2);
    i0.ɵɵelement(1, "span", 5);
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "userProfile.loading"));
} }
function FounderProfileComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 6);
    i0.ɵɵtext(2, "!");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h1");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "a", 7);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "founderProfile.notFound"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "founderProfile.notFoundSubtitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "userProfile.browseOpportunities"));
} }
function FounderProfileComponent_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 31);
    i0.ɵɵlistener("error", function FounderProfileComponent_Conditional_4_Conditional_2_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.avatarFailed.set(true)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", ctx_r1.avatarUrl(person_r3.avatarUrl), i0.ɵɵsanitizeUrl)("alt", ctx_r1.displayName);
} }
function FounderProfileComponent_Conditional_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.avatarInitials);
} }
function FounderProfileComponent_Conditional_4_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u00B7 ", person_r3.jobTitle);
} }
function FounderProfileComponent_Conditional_4_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 16);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "userProfile.editProfile"));
} }
function FounderProfileComponent_Conditional_4_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 32);
    i0.ɵɵlistener("click", function FounderProfileComponent_Conditional_4_Conditional_14_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openUserReport()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "reports.actions.reportUser"));
} }
function FounderProfileComponent_Conditional_4_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(person_r3.companyName);
} }
function FounderProfileComponent_Conditional_4_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.location(person_r3));
} }
function FounderProfileComponent_Conditional_4_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 25)(1, "div", 27)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "p", 33);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "userProfile.sections.about"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r3.bio);
} }
function FounderProfileComponent_Conditional_4_Conditional_50_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "userProfile.fields.jobTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r3.jobTitle);
} }
function FounderProfileComponent_Conditional_4_Conditional_50_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "userProfile.fields.company"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r3.companyName);
} }
function FounderProfileComponent_Conditional_4_Conditional_50_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd")(5, "a", 35);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "userProfile.fields.website"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("href", person_r3.websiteUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(person_r3.websiteUrl);
} }
function FounderProfileComponent_Conditional_4_Conditional_50_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd")(5, "a", 35);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "userProfile.fields.linkedin"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("href", person_r3.linkedInUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "userProfile.openLinkedIn"));
} }
function FounderProfileComponent_Conditional_4_Conditional_50_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "userProfile.fields.memberSince"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernDate(person_r3.createdAt));
} }
function FounderProfileComponent_Conditional_4_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 25)(1, "div", 27)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "dl", 34);
    i0.ɵɵconditionalCreate(6, FounderProfileComponent_Conditional_4_Conditional_50_Conditional_6_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(7, FounderProfileComponent_Conditional_4_Conditional_50_Conditional_7_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(8, FounderProfileComponent_Conditional_4_Conditional_50_Conditional_8_Template, 7, 5, "div");
    i0.ɵɵconditionalCreate(9, FounderProfileComponent_Conditional_4_Conditional_50_Conditional_9_Template, 8, 7, "div");
    i0.ɵɵconditionalCreate(10, FounderProfileComponent_Conditional_4_Conditional_50_Conditional_10_Template, 6, 4, "div");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r3 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 6, "userProfile.sections.professional"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(person_r3.jobTitle ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(person_r3.companyName ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(person_r3.websiteUrl ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(person_r3.linkedInUrl ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.westernDate(person_r3.createdAt) ? 10 : -1);
} }
function FounderProfileComponent_Conditional_4_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 28);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.founderOpportunities().length));
} }
function FounderProfileComponent_Conditional_4_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 29);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "founderProfile.noProjects"));
} }
function FounderProfileComponent_Conditional_4_Conditional_58_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 10);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("src", ctx_r1.opportunityImage(item_r5), i0.ɵɵsanitizeUrl)("alt", item_r5.title || i0.ɵɵpipeBind1(1, 2, "userProfile.opportunity"));
} }
function FounderProfileComponent_Conditional_4_Conditional_58_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1, "\u2197");
    i0.ɵɵelementEnd();
} }
function FounderProfileComponent_Conditional_4_Conditional_58_For_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r5.shortDescription || item_r5.description);
} }
function FounderProfileComponent_Conditional_4_Conditional_58_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 36)(1, "div", 37);
    i0.ɵɵconditionalCreate(2, FounderProfileComponent_Conditional_4_Conditional_58_For_2_Conditional_2_Template, 2, 4, "img", 10)(3, FounderProfileComponent_Conditional_4_Conditional_58_For_2_Conditional_3_Template, 2, 0, "span", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 38)(5, "h3");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, FounderProfileComponent_Conditional_4_Conditional_58_For_2_Conditional_8_Template, 2, 1, "p");
    i0.ɵɵelementStart(9, "span", 19);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c0, item_r5.id));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.opportunityImage(item_r5) ? 2 : 3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r5.title || i0.ɵɵpipeBind1(7, 5, "userProfile.opportunity"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r5.shortDescription || item_r5.description ? 8 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.opportunityStatusLabel(item_r5.status));
} }
function FounderProfileComponent_Conditional_4_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30);
    i0.ɵɵrepeaterCreate(1, FounderProfileComponent_Conditional_4_Conditional_58_For_2_Template, 11, 9, "a", 36, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.founderOpportunities());
} }
function FounderProfileComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 8)(1, "div", 9);
    i0.ɵɵconditionalCreate(2, FounderProfileComponent_Conditional_4_Conditional_2_Template, 1, 2, "img", 10)(3, FounderProfileComponent_Conditional_4_Conditional_3_Template, 2, 1, "span", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 12)(5, "div", 13)(6, "div")(7, "h1");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 14);
    i0.ɵɵtext(10);
    i0.ɵɵconditionalCreate(11, FounderProfileComponent_Conditional_4_Conditional_11_Template, 2, 1, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 15);
    i0.ɵɵconditionalCreate(13, FounderProfileComponent_Conditional_4_Conditional_13_Template, 3, 3, "a", 16)(14, FounderProfileComponent_Conditional_4_Conditional_14_Template, 3, 3, "button", 17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 18);
    i0.ɵɵconditionalCreate(16, FounderProfileComponent_Conditional_4_Conditional_16_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(17, FounderProfileComponent_Conditional_4_Conditional_17_Template, 2, 1, "span");
    i0.ɵɵelementStart(18, "span", 19);
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "span", 20);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(22, "section", 21)(23, "article", 22)(24, "span");
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "strong");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "article", 22)(30, "span");
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "strong");
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "article", 22)(36, "span");
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "strong");
    i0.ɵɵtext(40);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(41, "article", 22)(42, "span");
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "strong");
    i0.ɵɵtext(46);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(47, "div", 23)(48, "div", 24);
    i0.ɵɵconditionalCreate(49, FounderProfileComponent_Conditional_4_Conditional_49_Template, 7, 4, "section", 25);
    i0.ɵɵconditionalCreate(50, FounderProfileComponent_Conditional_4_Conditional_50_Template, 11, 8, "section", 25);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "aside", 26)(52, "div", 27)(53, "h2");
    i0.ɵɵtext(54);
    i0.ɵɵpipe(55, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(56, FounderProfileComponent_Conditional_4_Conditional_56_Template, 2, 1, "span", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(57, FounderProfileComponent_Conditional_4_Conditional_57_Template, 3, 3, "p", 29)(58, FounderProfileComponent_Conditional_4_Conditional_58_Template, 3, 0, "div", 30);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r3 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.avatarUrl(person_r3.avatarUrl) ? 2 : 3);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r1.displayName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.roleLabel(person_r3.role), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(person_r3.jobTitle ? 11 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isOwner() ? 13 : 14);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(person_r3.companyName ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.location(person_r3) ? 17 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.accountLabel(person_r3.accountStatus));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.verificationLabel(person_r3.verificationStatus));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 22, "userProfile.stats.opportunities"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.stats().total));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 24, "userProfile.stats.active"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.stats().active));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 26, "userProfile.stats.funded"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.stats().funded));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 28, "userProfile.stats.credibility"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(person_r3.credibilityScore));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(person_r3.bio ? 49 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(person_r3.companyName || person_r3.jobTitle || person_r3.websiteUrl || person_r3.linkedInUrl || ctx_r1.westernDate(person_r3.createdAt) ? 50 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(55, 30, "userProfile.sections.opportunities"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.founderOpportunities().length ? 56 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.founderOpportunities().length === 0 ? 57 : 58);
} }
function FounderProfileComponent_Conditional_5_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 40);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "reports.success"));
} }
function FounderProfileComponent_Conditional_5_Conditional_10_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 43);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reason_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", reason_r8);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportReasonLabel(reason_r8));
} }
function FounderProfileComponent_Conditional_5_Conditional_10_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 45);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportError());
} }
function FounderProfileComponent_Conditional_5_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "select", 42);
    i0.ɵɵlistener("ngModelChange", function FounderProfileComponent_Conditional_5_Conditional_10_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.reportReason.set($event)); });
    i0.ɵɵrepeaterCreate(4, FounderProfileComponent_Conditional_5_Conditional_10_For_5_Template, 2, 2, "option", 43, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "label");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementStart(9, "textarea", 44);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("ngModelChange", function FounderProfileComponent_Conditional_5_Conditional_10_Template_textarea_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.reportDescription.set($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, FounderProfileComponent_Conditional_5_Conditional_10_Conditional_11_Template, 2, 1, "p", 45);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(2, 6, "reports.reason"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.reportReason());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.reportReasons);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(8, 8, "reports.description"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.reportDescription())("placeholder", i0.ɵɵpipeBind1(10, 10, "reports.descriptionPlaceholder"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.reportError() ? 11 : -1);
} }
function FounderProfileComponent_Conditional_5_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 46);
    i0.ɵɵlistener("click", function FounderProfileComponent_Conditional_5_Conditional_16_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.submitUserReport()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.reportSubmitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportSubmitting() ? i0.ɵɵpipeBind1(2, 2, "reports.submitting") : i0.ɵɵpipeBind1(3, 4, "reports.submit"));
} }
function FounderProfileComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "section", 39);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "header")(4, "h2");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, FounderProfileComponent_Conditional_5_Conditional_9_Template, 3, 3, "p", 40)(10, FounderProfileComponent_Conditional_5_Conditional_10_Template, 12, 12);
    i0.ɵɵelementStart(11, "footer")(12, "button", 32);
    i0.ɵɵlistener("click", function FounderProfileComponent_Conditional_5_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(16, FounderProfileComponent_Conditional_5_Conditional_16_Template, 4, 6, "button", 41);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 6, "reports.sendReport"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "reports.sendReport"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.displayName);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.reportSuccess() ? 9 : 10);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.reportSuccess() ? i0.ɵɵpipeBind1(14, 10, "common.close") : i0.ɵɵpipeBind1(15, 12, "reports.cancel"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r1.reportSuccess() ? 16 : -1);
} }
export class FounderProfileComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.profileService = inject(ProfileService);
        this.opportunityService = inject(OpportunityService);
        this.fileStoreService = inject(FileStoreService);
        this.reportService = inject(ReportService);
        this.languageService = inject(LanguageService);
        this.founderId = signal('', ...(ngDevMode ? [{ debugName: "founderId" }] : []));
        this.profile = signal(null, ...(ngDevMode ? [{ debugName: "profile" }] : []));
        this.opportunities = signal([], ...(ngDevMode ? [{ debugName: "opportunities" }] : []));
        this.loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.error = signal(false, ...(ngDevMode ? [{ debugName: "error" }] : []));
        this.avatarFailed = signal(false, ...(ngDevMode ? [{ debugName: "avatarFailed" }] : []));
        this.reportModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "reportModalOpen" }] : []));
        this.reportSubmitting = signal(false, ...(ngDevMode ? [{ debugName: "reportSubmitting" }] : []));
        this.reportSuccess = signal(false, ...(ngDevMode ? [{ debugName: "reportSuccess" }] : []));
        this.reportError = signal(null, ...(ngDevMode ? [{ debugName: "reportError" }] : []));
        this.reportReason = signal('Spam', ...(ngDevMode ? [{ debugName: "reportReason" }] : []));
        this.reportDescription = signal('', ...(ngDevMode ? [{ debugName: "reportDescription" }] : []));
        this.reportReasons = ['Spam', 'Abuse', 'FraudConcern', 'InappropriateContent', 'Other'];
        this.isOwner = computed(() => this.profileService.profile()?.userId === this.founderId(), ...(ngDevMode ? [{ debugName: "isOwner" }] : []));
        this.founderOpportunities = computed(() => this.opportunities().filter(item => this.opportunityFounderId(item) === this.founderId()), ...(ngDevMode ? [{ debugName: "founderOpportunities" }] : []));
        this.stats = computed(() => {
            const projects = this.founderOpportunities();
            return {
                total: projects.length,
                active: projects.filter(item => this.normalizedStatus(item.status) === 'active').length,
                funded: projects.filter(item => this.normalizedStatus(item.status) === 'funded').length
            };
        }, ...(ngDevMode ? [{ debugName: "stats" }] : []));
        void this.load();
    }
    async load() {
        const id = (this.route.snapshot.paramMap.get('id') ?? '').trim();
        this.founderId.set(id);
        if (!id || id === 'undefined' || id === 'null') {
            this.error.set(true);
            this.loading.set(false);
            return;
        }
        try {
            const [profile, opportunities] = await Promise.all([
                this.profileService.getPublicProfile(id),
                this.opportunityService.getPublicOpportunities()
            ]);
            this.profile.set(profile);
            this.opportunities.set(opportunities);
            this.error.set(!profile);
        }
        catch {
            this.error.set(true);
        }
        finally {
            this.loading.set(false);
        }
    }
    get displayName() {
        const profile = this.profile();
        return this.clean(profile?.displayName) || this.clean(profile?.fullName) ||
            [profile?.firstName, profile?.lastName].map(value => this.clean(value)).filter(Boolean).join(' ') ||
            this.t('userProfile.member');
    }
    get avatarInitials() {
        return this.displayName.split(/\s+/u).filter(Boolean).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() || 'U';
    }
    avatarUrl(value) {
        if (!value || this.avatarFailed())
            return '';
        return value.startsWith('http') ? value : this.fileStoreService.getPublicUrl(value);
    }
    opportunityImage(item) {
        const value = this.clean(item.coverImageUrl);
        return value ? (value.startsWith('http') ? value : this.fileStoreService.getPublicUrl(value)) : '';
    }
    location(profile) {
        return this.clean(profile.location) || [profile.city, profile.country].map(value => this.clean(value)).filter(Boolean).join(', ');
    }
    roleLabel(value) {
        return this.enumLabel('roles', value, 'member');
    }
    verificationLabel(value) {
        return this.enumLabel('verification', value, 'none');
    }
    accountLabel(value) {
        return this.enumLabel('account', value, 'inactive');
    }
    opportunityStatusLabel(value) {
        return this.enumLabel('opportunityStatus', value, 'unknown');
    }
    westernNumber(value) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
    }
    westernDate(value) {
        if (!value)
            return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date);
    }
    openUserReport() {
        if (!this.profile()?.userId || this.isOwner())
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
    async submitUserReport() {
        const targetId = this.profile()?.userId;
        if (!targetId || this.reportSubmitting())
            return;
        try {
            this.reportSubmitting.set(true);
            this.reportError.set(null);
            await this.reportService.createReport({
                targetType: 'User', targetId, reasonCode: this.reportReason(), description: this.reportDescription().trim() || null
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
    reportReasonLabel(reason) {
        return this.t(`reports.reasons.${reason}`);
    }
    opportunityFounderId(item) {
        return String(item.founderId ?? item.founder?.userId ?? item.founder?.id ?? '');
    }
    normalizedStatus(value) {
        return String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/gu, '');
    }
    enumLabel(group, value, fallback) {
        const normalized = this.normalizedStatus(value) || fallback;
        const key = `userProfile.enums.${group}.${normalized}`;
        const translated = this.t(key);
        return translated === key ? this.t(`userProfile.enums.${group}.${fallback}`) : translated;
    }
    clean(value) {
        const result = value?.trim() ?? '';
        return result === 'null' || result === 'undefined' ? '' : result;
    }
    t(path) {
        return this.languageService.translate(path);
    }
    reportErrorMessage(error) {
        const record = typeof error === 'object' && error !== null ? error : null;
        const nested = record && typeof record['error'] === 'object' && record['error'] !== null ? record['error'] : null;
        const raw = String(nested?.['message'] ?? record?.['message'] ?? '').toLowerCase();
        if (raw.includes('duplicate') || raw.includes('pending'))
            return this.t('reports.errors.duplicatePending');
        if (raw.includes('invalid') || raw.includes('target'))
            return this.t('reports.errors.invalidTarget');
        if (raw.includes('self'))
            return this.t('reports.errors.selfReport');
        return this.t('reports.errors.generic');
    }
    static { this.ɵfac = function FounderProfileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FounderProfileComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FounderProfileComponent, selectors: [["app-founder-profile"]], decls: 6, vars: 3, consts: [[1, "user-profile-page"], [1, "profile-shell"], ["aria-live", "polite", 1, "state-card"], [1, "state-card"], ["role", "presentation", 1, "modal-backdrop"], ["aria-hidden", "true", 1, "profile-spinner"], ["aria-hidden", "true", 1, "state-icon"], ["routerLink", "/admin/investments", 1, "primary-action"], [1, "profile-header", "profile-card"], [1, "avatar-wrap"], [3, "src", "alt"], ["aria-hidden", "true"], [1, "identity-block"], [1, "identity-title"], [1, "role-line"], [1, "header-actions"], ["routerLink", "/admin/profile", 1, "primary-action"], ["type", "button", 1, "quiet-action"], [1, "header-meta"], [1, "status-badge", "status-badge--green"], [1, "status-badge"], ["aria-label", "Profile statistics", 1, "stats-grid"], [1, "stat-card", "profile-card"], [1, "content-grid"], [1, "main-column"], [1, "profile-card", "section-card"], [1, "profile-card", "section-card", "opportunities-card"], [1, "section-heading"], [1, "count-badge"], [1, "empty-copy"], [1, "opportunity-list"], [3, "error", "src", "alt"], ["type", "button", 1, "quiet-action", 3, "click"], [1, "bio-copy"], [1, "detail-grid"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href"], [1, "opportunity-row", 3, "routerLink"], [1, "opportunity-thumb"], [1, "opportunity-copy"], ["role", "dialog", "aria-modal", "true", 1, "report-modal"], [1, "success-message"], ["type", "button", 1, "primary-action", 3, "disabled"], [3, "ngModelChange", "ngModel"], [3, "value"], ["rows", "4", 3, "ngModelChange", "ngModel", "placeholder"], [1, "error-message"], ["type", "button", 1, "primary-action", 3, "click", "disabled"]], template: function FounderProfileComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, FounderProfileComponent_Conditional_2_Template, 5, 3, "section", 2)(3, FounderProfileComponent_Conditional_3_Template, 12, 9, "section", 3)(4, FounderProfileComponent_Conditional_4_Template, 59, 32);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, FounderProfileComponent_Conditional_5_Template, 17, 14, "div", 4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵattribute("dir", ctx.languageService.direction());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 2 : ctx.error() || !ctx.profile() ? 3 : (tmp_1_0 = ctx.profile()) ? 4 : -1, tmp_1_0);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.reportModalOpen() && ctx.profile() ? 5 : -1);
        } }, dependencies: [CommonModule, FormsModule, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgModel, RouterLink, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.user-profile-page[_ngcontent-%COMP%] {\n  --color-background: var(--investa-bg);\n  --color-surface: var(--investa-surface);\n  --color-surface-muted: var(--investa-surface-soft);\n  --color-border: var(--investa-border);\n  --color-text-primary: var(--investa-text-primary);\n  --color-text-secondary: var(--investa-text-secondary);\n  min-height: 100%;\n  background: var(--color-background, #f5f6f3);\n  color: var(--color-text-primary, #20231f);\n  padding: 24px;\n}\n\n.profile-shell[_ngcontent-%COMP%] { max-width: 1180px; margin: 0 auto; }\n.profile-card[_ngcontent-%COMP%] { background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; box-shadow: 0 12px 32px rgb(20 24 20 / 5%); }\n.profile-header[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 20px; padding: 22px; }\n.avatar-wrap[_ngcontent-%COMP%] { width: 88px; height: 88px; flex: 0 0 88px; border-radius: 22px; overflow: hidden; display: grid; place-items: center; background: #dff3e5; color: #185c35; font-size: 26px; font-weight: 800; border: 1px solid #b8dfc4; }\n.avatar-wrap[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\n.identity-block[_ngcontent-%COMP%] { min-width: 0; flex: 1; }\n.identity-title[_ngcontent-%COMP%] { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }\nh1[_ngcontent-%COMP%] { margin: 0; font-size: clamp(24px, 3vw, 34px); line-height: 1.15; letter-spacing: -.03em; }\n.role-line[_ngcontent-%COMP%] { margin: 7px 0 0; color: var(--color-text-secondary, #667067); font-size: 14px; }\n.header-meta[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-top: 15px; color: var(--color-text-secondary, #667067); font-size: 13px; }\n.header-actions[_ngcontent-%COMP%] { flex: 0 0 auto; }\n.primary-action[_ngcontent-%COMP%], .quiet-action[_ngcontent-%COMP%] { min-height: 40px; border-radius: 11px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; font: inherit; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }\n.primary-action[_ngcontent-%COMP%] { background: #242824; color: #fff; }\n.primary-action[_ngcontent-%COMP%]:hover { background: #111411; }\n.quiet-action[_ngcontent-%COMP%] { background: var(--color-surface, #fff); color: var(--color-text-primary, #20231f); border-color: var(--color-border, #dde1da); }\n.status-badge[_ngcontent-%COMP%], .count-badge[_ngcontent-%COMP%] { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 700; background: var(--color-surface-muted, #eef0ec); color: var(--color-text-secondary, #596159); border: 1px solid var(--color-border, #dde1da); }\n.status-badge--green[_ngcontent-%COMP%] { background: #e7f6eb; color: #176838; border-color: #bde4c8; }\n.stats-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0; }\n.stat-card[_ngcontent-%COMP%] { padding: 16px 18px; }\n.stat-card[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; color: var(--color-text-secondary, #667067); font-size: 12px; }\n.stat-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-top: 5px; font-size: 22px; font-variant-numeric: tabular-nums; }\n.content-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .72fr); gap: 14px; align-items: start; }\n.main-column[_ngcontent-%COMP%] { display: grid; gap: 14px; }\n.section-card[_ngcontent-%COMP%] { padding: 20px; }\n.section-heading[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }\n.section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 17px; letter-spacing: -.015em; }\n.bio-copy[_ngcontent-%COMP%], .empty-copy[_ngcontent-%COMP%] { margin: 0; color: var(--color-text-secondary, #667067); font-size: 14px; line-height: 1.75; white-space: pre-line; }\n.detail-grid[_ngcontent-%COMP%] { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }\n.detail-grid[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { min-width: 0; }\n.detail-grid[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { color: var(--color-text-secondary, #667067); font-size: 11px; margin-bottom: 5px; }\n.detail-grid[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0; font-size: 14px; overflow-wrap: anywhere; }\n.detail-grid[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: #187642; }\n.opportunity-list[_ngcontent-%COMP%] { display: grid; gap: 10px; }\n.opportunity-row[_ngcontent-%COMP%] { display: flex; gap: 12px; padding: 11px; color: inherit; text-decoration: none; border: 1px solid var(--color-border, #dde1da); border-radius: 14px; transition: border-color .2s, transform .2s; }\n.opportunity-row[_ngcontent-%COMP%]:hover { border-color: #6caf7e; transform: translateY(-1px); }\n.opportunity-thumb[_ngcontent-%COMP%] { width: 72px; height: 72px; flex: 0 0 72px; border-radius: 11px; overflow: hidden; display: grid; place-items: center; background: #e7f6eb; color: #176838; font-size: 20px; }\n.opportunity-thumb[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\n.opportunity-copy[_ngcontent-%COMP%] { min-width: 0; }\n.opportunity-copy[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 1px 0 4px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.opportunity-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0 0 7px; color: var(--color-text-secondary, #667067); font-size: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n.state-card[_ngcontent-%COMP%] { min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; }\n.state-card[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\n.state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { color: var(--color-text-secondary, #667067); }\n.state-icon[_ngcontent-%COMP%] { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #f9e8e8; color: #9c2727; font-weight: 800; }\n.profile-spinner[_ngcontent-%COMP%] { width: 28px; height: 28px; border: 3px solid var(--color-border, #dde1da); border-top-color: #23824b; border-radius: 50%; animation: _ngcontent-%COMP%_spin .75s linear infinite; }\n.modal-backdrop[_ngcontent-%COMP%] { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 16px; background: rgb(0 0 0 / 55%); }\n.report-modal[_ngcontent-%COMP%] { width: min(480px, 100%); border-radius: 18px; padding: 20px; background: var(--color-surface, #fff); color: var(--color-text-primary, #20231f); }\n.report-modal[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .report-modal[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\n.report-modal[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top: 4px; color: var(--color-text-secondary, #667067); }\n.report-modal[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: block; margin-top: 16px; font-size: 13px; font-weight: 700; }\n.report-modal[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .report-modal[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { width: 100%; margin-top: 7px; padding: 10px 12px; border: 1px solid var(--color-border, #dde1da); border-radius: 10px; background: var(--color-background, #f5f6f3); color: inherit; font: inherit; box-sizing: border-box; }\n.report-modal[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }\n.success-message[_ngcontent-%COMP%] { color: #176838; }.error-message[_ngcontent-%COMP%] { color: #a52727; }\n[dir='rtl'][_ngcontent-%COMP%]   .identity-title[_ngcontent-%COMP%], [dir='rtl'][_ngcontent-%COMP%]   .profile-header[_ngcontent-%COMP%], [dir='rtl'][_ngcontent-%COMP%]   .opportunity-row[_ngcontent-%COMP%] { text-align: right; }\n\n@media (prefers-color-scheme: dark) {\n  .status-badge--green[_ngcontent-%COMP%], .opportunity-thumb[_ngcontent-%COMP%] { background: rgb(35 130 75 / 16%); color: #75d69c; border-color: rgb(80 175 116 / 35%); }\n}\n\n@media (max-width: 820px) {\n  .user-profile-page[_ngcontent-%COMP%] { padding: 14px; }\n  .content-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n  .stats-grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, 1fr); }\n}\n\n@media (max-width: 560px) {\n  .profile-header[_ngcontent-%COMP%] { align-items: flex-start; padding: 17px; }\n  .avatar-wrap[_ngcontent-%COMP%] { width: 64px; height: 64px; flex-basis: 64px; border-radius: 17px; font-size: 20px; }\n  .identity-title[_ngcontent-%COMP%] { display: block; }\n  .header-actions[_ngcontent-%COMP%] { margin-top: 12px; }\n  .detail-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n  .section-card[_ngcontent-%COMP%] { padding: 17px; }\n}\n\n@keyframes _ngcontent-%COMP%_spin { to { transform: rotate(360deg); } }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FounderProfileComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-founder-profile', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, FormsModule, RouterLink, TranslatePipe], template: "<main class=\"user-profile-page\" [attr.dir]=\"languageService.direction()\">\n  <div class=\"profile-shell\">\n    @if (loading()) {\n      <section class=\"state-card\" aria-live=\"polite\">\n        <span class=\"profile-spinner\" aria-hidden=\"true\"></span>\n        <p>{{ 'userProfile.loading' | translate }}</p>\n      </section>\n    } @else if (error() || !profile()) {\n      <section class=\"state-card\">\n        <div class=\"state-icon\" aria-hidden=\"true\">!</div>\n        <h1>{{ 'founderProfile.notFound' | translate }}</h1>\n        <p>{{ 'founderProfile.notFoundSubtitle' | translate }}</p>\n        <a routerLink=\"/admin/investments\" class=\"primary-action\">{{ 'userProfile.browseOpportunities' | translate }}</a>\n      </section>\n    } @else if (profile(); as person) {\n      <header class=\"profile-header profile-card\">\n        <div class=\"avatar-wrap\">\n          @if (avatarUrl(person.avatarUrl)) {\n            <img [src]=\"avatarUrl(person.avatarUrl)\" [alt]=\"displayName\" (error)=\"avatarFailed.set(true)\">\n          } @else {\n            <span aria-hidden=\"true\">{{ avatarInitials }}</span>\n          }\n        </div>\n\n        <div class=\"identity-block\">\n          <div class=\"identity-title\">\n            <div>\n              <h1>{{ displayName }}</h1>\n              <p class=\"role-line\">\n                {{ roleLabel(person.role) }}\n                @if (person.jobTitle) { <span>\u00B7 {{ person.jobTitle }}</span> }\n              </p>\n            </div>\n            <div class=\"header-actions\">\n              @if (isOwner()) {\n                <a routerLink=\"/admin/profile\" class=\"primary-action\">{{ 'userProfile.editProfile' | translate }}</a>\n              } @else {\n                <button type=\"button\" class=\"quiet-action\" (click)=\"openUserReport()\">{{ 'reports.actions.reportUser' | translate }}</button>\n              }\n            </div>\n          </div>\n\n          <div class=\"header-meta\">\n            @if (person.companyName) { <span>{{ person.companyName }}</span> }\n            @if (location(person)) { <span>{{ location(person) }}</span> }\n            <span class=\"status-badge status-badge--green\">{{ accountLabel(person.accountStatus) }}</span>\n            <span class=\"status-badge\">{{ verificationLabel(person.verificationStatus) }}</span>\n          </div>\n        </div>\n      </header>\n\n      <section class=\"stats-grid\" aria-label=\"Profile statistics\">\n        <article class=\"stat-card profile-card\">\n          <span>{{ 'userProfile.stats.opportunities' | translate }}</span>\n          <strong>{{ westernNumber(stats().total) }}</strong>\n        </article>\n        <article class=\"stat-card profile-card\">\n          <span>{{ 'userProfile.stats.active' | translate }}</span>\n          <strong>{{ westernNumber(stats().active) }}</strong>\n        </article>\n        <article class=\"stat-card profile-card\">\n          <span>{{ 'userProfile.stats.funded' | translate }}</span>\n          <strong>{{ westernNumber(stats().funded) }}</strong>\n        </article>\n        <article class=\"stat-card profile-card\">\n          <span>{{ 'userProfile.stats.credibility' | translate }}</span>\n          <strong>{{ westernNumber(person.credibilityScore) }}</strong>\n        </article>\n      </section>\n\n      <div class=\"content-grid\">\n        <div class=\"main-column\">\n          @if (person.bio) {\n            <section class=\"profile-card section-card\">\n              <div class=\"section-heading\"><h2>{{ 'userProfile.sections.about' | translate }}</h2></div>\n              <p class=\"bio-copy\">{{ person.bio }}</p>\n            </section>\n          }\n\n          @if (person.companyName || person.jobTitle || person.websiteUrl || person.linkedInUrl || westernDate(person.createdAt)) {\n            <section class=\"profile-card section-card\">\n              <div class=\"section-heading\"><h2>{{ 'userProfile.sections.professional' | translate }}</h2></div>\n              <dl class=\"detail-grid\">\n                @if (person.jobTitle) { <div><dt>{{ 'userProfile.fields.jobTitle' | translate }}</dt><dd>{{ person.jobTitle }}</dd></div> }\n                @if (person.companyName) { <div><dt>{{ 'userProfile.fields.company' | translate }}</dt><dd>{{ person.companyName }}</dd></div> }\n                @if (person.websiteUrl) { <div><dt>{{ 'userProfile.fields.website' | translate }}</dt><dd><a [href]=\"person.websiteUrl\" target=\"_blank\" rel=\"noopener noreferrer\">{{ person.websiteUrl }}</a></dd></div> }\n                @if (person.linkedInUrl) { <div><dt>{{ 'userProfile.fields.linkedin' | translate }}</dt><dd><a [href]=\"person.linkedInUrl\" target=\"_blank\" rel=\"noopener noreferrer\">{{ 'userProfile.openLinkedIn' | translate }}</a></dd></div> }\n                @if (westernDate(person.createdAt)) { <div><dt>{{ 'userProfile.fields.memberSince' | translate }}</dt><dd>{{ westernDate(person.createdAt) }}</dd></div> }\n              </dl>\n            </section>\n          }\n        </div>\n\n        <aside class=\"profile-card section-card opportunities-card\">\n          <div class=\"section-heading\">\n            <h2>{{ 'userProfile.sections.opportunities' | translate }}</h2>\n            @if (founderOpportunities().length) { <span class=\"count-badge\">{{ westernNumber(founderOpportunities().length) }}</span> }\n          </div>\n          @if (founderOpportunities().length === 0) {\n            <p class=\"empty-copy\">{{ 'founderProfile.noProjects' | translate }}</p>\n          } @else {\n            <div class=\"opportunity-list\">\n              @for (item of founderOpportunities(); track item.id) {\n                <a class=\"opportunity-row\" [routerLink]=\"['/admin/investments', item.id]\">\n                  <div class=\"opportunity-thumb\">\n                    @if (opportunityImage(item)) { <img [src]=\"opportunityImage(item)\" [alt]=\"item.title || ('userProfile.opportunity' | translate)\"> }\n                    @else { <span aria-hidden=\"true\">\u2197</span> }\n                  </div>\n                  <div class=\"opportunity-copy\">\n                    <h3>{{ item.title || ('userProfile.opportunity' | translate) }}</h3>\n                    @if (item.shortDescription || item.description) { <p>{{ item.shortDescription || item.description }}</p> }\n                    <span class=\"status-badge status-badge--green\">{{ opportunityStatusLabel(item.status) }}</span>\n                  </div>\n                </a>\n              }\n            </div>\n          }\n        </aside>\n      </div>\n    }\n  </div>\n\n  @if (reportModalOpen() && profile()) {\n    <div class=\"modal-backdrop\" role=\"presentation\">\n      <section class=\"report-modal\" role=\"dialog\" aria-modal=\"true\" [attr.aria-label]=\"'reports.sendReport' | translate\">\n        <header><h2>{{ 'reports.sendReport' | translate }}</h2><p>{{ displayName }}</p></header>\n        @if (reportSuccess()) {\n          <p class=\"success-message\">{{ 'reports.success' | translate }}</p>\n        } @else {\n          <label>{{ 'reports.reason' | translate }}\n            <select [ngModel]=\"reportReason()\" (ngModelChange)=\"reportReason.set($event)\">\n              @for (reason of reportReasons; track reason) { <option [value]=\"reason\">{{ reportReasonLabel(reason) }}</option> }\n            </select>\n          </label>\n          <label>{{ 'reports.description' | translate }}\n            <textarea rows=\"4\" [ngModel]=\"reportDescription()\" (ngModelChange)=\"reportDescription.set($event)\" [placeholder]=\"'reports.descriptionPlaceholder' | translate\"></textarea>\n          </label>\n          @if (reportError()) { <p class=\"error-message\">{{ reportError() }}</p> }\n        }\n        <footer>\n          <button type=\"button\" class=\"quiet-action\" (click)=\"closeReportModal()\">{{ reportSuccess() ? ('common.close' | translate) : ('reports.cancel' | translate) }}</button>\n          @if (!reportSuccess()) { <button type=\"button\" class=\"primary-action\" [disabled]=\"reportSubmitting()\" (click)=\"submitUserReport()\">{{ reportSubmitting() ? ('reports.submitting' | translate) : ('reports.submit' | translate) }}</button> }\n        </footer>\n      </section>\n    </div>\n  }\n</main>\n", styles: [":host {\n  display: block;\n}\n\n.user-profile-page {\n  --color-background: var(--investa-bg);\n  --color-surface: var(--investa-surface);\n  --color-surface-muted: var(--investa-surface-soft);\n  --color-border: var(--investa-border);\n  --color-text-primary: var(--investa-text-primary);\n  --color-text-secondary: var(--investa-text-secondary);\n  min-height: 100%;\n  background: var(--color-background, #f5f6f3);\n  color: var(--color-text-primary, #20231f);\n  padding: 24px;\n}\n\n.profile-shell { max-width: 1180px; margin: 0 auto; }\n.profile-card { background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; box-shadow: 0 12px 32px rgb(20 24 20 / 5%); }\n.profile-header { display: flex; align-items: center; gap: 20px; padding: 22px; }\n.avatar-wrap { width: 88px; height: 88px; flex: 0 0 88px; border-radius: 22px; overflow: hidden; display: grid; place-items: center; background: #dff3e5; color: #185c35; font-size: 26px; font-weight: 800; border: 1px solid #b8dfc4; }\n.avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }\n.identity-block { min-width: 0; flex: 1; }\n.identity-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }\nh1 { margin: 0; font-size: clamp(24px, 3vw, 34px); line-height: 1.15; letter-spacing: -.03em; }\n.role-line { margin: 7px 0 0; color: var(--color-text-secondary, #667067); font-size: 14px; }\n.header-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-top: 15px; color: var(--color-text-secondary, #667067); font-size: 13px; }\n.header-actions { flex: 0 0 auto; }\n.primary-action, .quiet-action { min-height: 40px; border-radius: 11px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; font: inherit; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }\n.primary-action { background: #242824; color: #fff; }\n.primary-action:hover { background: #111411; }\n.quiet-action { background: var(--color-surface, #fff); color: var(--color-text-primary, #20231f); border-color: var(--color-border, #dde1da); }\n.status-badge, .count-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 700; background: var(--color-surface-muted, #eef0ec); color: var(--color-text-secondary, #596159); border: 1px solid var(--color-border, #dde1da); }\n.status-badge--green { background: #e7f6eb; color: #176838; border-color: #bde4c8; }\n.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0; }\n.stat-card { padding: 16px 18px; }\n.stat-card span { display: block; color: var(--color-text-secondary, #667067); font-size: 12px; }\n.stat-card strong { display: block; margin-top: 5px; font-size: 22px; font-variant-numeric: tabular-nums; }\n.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .72fr); gap: 14px; align-items: start; }\n.main-column { display: grid; gap: 14px; }\n.section-card { padding: 20px; }\n.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }\n.section-heading h2 { margin: 0; font-size: 17px; letter-spacing: -.015em; }\n.bio-copy, .empty-copy { margin: 0; color: var(--color-text-secondary, #667067); font-size: 14px; line-height: 1.75; white-space: pre-line; }\n.detail-grid { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }\n.detail-grid div { min-width: 0; }\n.detail-grid dt { color: var(--color-text-secondary, #667067); font-size: 11px; margin-bottom: 5px; }\n.detail-grid dd { margin: 0; font-size: 14px; overflow-wrap: anywhere; }\n.detail-grid a { color: #187642; }\n.opportunity-list { display: grid; gap: 10px; }\n.opportunity-row { display: flex; gap: 12px; padding: 11px; color: inherit; text-decoration: none; border: 1px solid var(--color-border, #dde1da); border-radius: 14px; transition: border-color .2s, transform .2s; }\n.opportunity-row:hover { border-color: #6caf7e; transform: translateY(-1px); }\n.opportunity-thumb { width: 72px; height: 72px; flex: 0 0 72px; border-radius: 11px; overflow: hidden; display: grid; place-items: center; background: #e7f6eb; color: #176838; font-size: 20px; }\n.opportunity-thumb img { width: 100%; height: 100%; object-fit: cover; }\n.opportunity-copy { min-width: 0; }\n.opportunity-copy h3 { margin: 1px 0 4px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.opportunity-copy p { margin: 0 0 7px; color: var(--color-text-secondary, #667067); font-size: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n.state-card { min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; }\n.state-card h1, .state-card p { margin: 0; }\n.state-card p { color: var(--color-text-secondary, #667067); }\n.state-icon { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #f9e8e8; color: #9c2727; font-weight: 800; }\n.profile-spinner { width: 28px; height: 28px; border: 3px solid var(--color-border, #dde1da); border-top-color: #23824b; border-radius: 50%; animation: spin .75s linear infinite; }\n.modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 16px; background: rgb(0 0 0 / 55%); }\n.report-modal { width: min(480px, 100%); border-radius: 18px; padding: 20px; background: var(--color-surface, #fff); color: var(--color-text-primary, #20231f); }\n.report-modal header h2, .report-modal header p { margin: 0; }\n.report-modal header p { margin-top: 4px; color: var(--color-text-secondary, #667067); }\n.report-modal label { display: block; margin-top: 16px; font-size: 13px; font-weight: 700; }\n.report-modal select, .report-modal textarea { width: 100%; margin-top: 7px; padding: 10px 12px; border: 1px solid var(--color-border, #dde1da); border-radius: 10px; background: var(--color-background, #f5f6f3); color: inherit; font: inherit; box-sizing: border-box; }\n.report-modal footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }\n.success-message { color: #176838; }.error-message { color: #a52727; }\n[dir='rtl'] .identity-title, [dir='rtl'] .profile-header, [dir='rtl'] .opportunity-row { text-align: right; }\n\n@media (prefers-color-scheme: dark) {\n  .status-badge--green, .opportunity-thumb { background: rgb(35 130 75 / 16%); color: #75d69c; border-color: rgb(80 175 116 / 35%); }\n}\n\n@media (max-width: 820px) {\n  .user-profile-page { padding: 14px; }\n  .content-grid { grid-template-columns: 1fr; }\n  .stats-grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n@media (max-width: 560px) {\n  .profile-header { align-items: flex-start; padding: 17px; }\n  .avatar-wrap { width: 64px; height: 64px; flex-basis: 64px; border-radius: 17px; font-size: 20px; }\n  .identity-title { display: block; }\n  .header-actions { margin-top: 12px; }\n  .detail-grid { grid-template-columns: 1fr; }\n  .section-card { padding: 17px; }\n}\n\n@keyframes spin { to { transform: rotate(360deg); } }\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FounderProfileComponent, { className: "FounderProfileComponent", filePath: "src/app/pages/admin/founder-profile/founder-profile.component.ts", lineNumber: 20 }); })();
