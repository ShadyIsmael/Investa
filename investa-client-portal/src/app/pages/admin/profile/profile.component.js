import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, DestroyRef, ViewChild, NgZone } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ProfileService } from '../../../services/profile.service';
import { LanguageService } from '../../../services/language.service';
import { Router, RouterLink } from '@angular/router';
import { FileStoreService } from '../../../services/file-store.service';
import { OpportunityService } from '../../../services/opportunity.service';
import { SettingsService } from '../../../services/settings.service';
import { DashboardDensity, DefaultInvestmentTypePreference, ThemePreference } from '../../../models/settings.model';
import { walletReasonKey, WalletService } from '../../../services/wallet.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = ["avatarInput"];
const _c1 = ["nationalIdInput"];
const _c2 = a0 => ["/admin/investments", a0];
const _forTrack0 = ($index, $item) => $item.code;
const _forTrack1 = ($index, $item) => $item.fileName;
const _forTrack2 = ($index, $item) => $item.id;
function ProfileComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 4);
    i0.ɵɵelement(1, "span", 5);
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "userProfile.loading"));
} }
function ProfileComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 6);
    i0.ɵɵtext(2, "!");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h1");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "button", 7);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_3_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadProfile()); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "profile.loadErrorTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 5, "profile.buttons.retry"));
} }
function ProfileComponent_Conditional_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 10);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r1.avatarUrl(), i0.ɵɵsanitizeUrl)("alt", i0.ɵɵpipeBind1(1, 2, "profile.avatarAlt"));
} }
function ProfileComponent_Conditional_4_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.avatarInitials());
} }
function ProfileComponent_Conditional_4_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 12);
} }
function ProfileComponent_Conditional_4_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u00B7 ", person_r4.basicInfo == null ? null : person_r4.basicInfo.jobTitle);
} }
function ProfileComponent_Conditional_4_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(person_r4.basicInfo == null ? null : person_r4.basicInfo.companyName);
} }
function ProfileComponent_Conditional_4_Conditional_22_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, ", ");
} }
function ProfileComponent_Conditional_4_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, ProfileComponent_Conditional_4_Conditional_22_Conditional_2_Template, 1, 0);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(person_r4.contactInfo == null ? null : person_r4.contactInfo.city);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.city) && (person_r4.basicInfo == null ? null : person_r4.basicInfo.country) ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(person_r4.basicInfo == null ? null : person_r4.basicInfo.country);
} }
function ProfileComponent_Conditional_4_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 33)(1, "div", 35)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "p", 38);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "userProfile.sections.about"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.basicInfo == null ? null : person_r4.basicInfo.bio);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "profile.communication.email"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.contactInfo == null ? null : person_r4.contactInfo.email);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 39);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "profile.communication.mobile"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.contactInfo == null ? null : person_r4.contactInfo.phone1);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "profile.communication.city"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.contactInfo == null ? null : person_r4.contactInfo.city);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "profile.communication.address"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.contactInfo == null ? null : person_r4.contactInfo.address);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "userProfile.fields.jobTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.basicInfo == null ? null : person_r4.basicInfo.jobTitle);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "userProfile.fields.company"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(person_r4.basicInfo == null ? null : person_r4.basicInfo.companyName);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd")(5, "a", 40);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "userProfile.fields.website"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("href", person_r4.basicInfo == null ? null : person_r4.basicInfo.websiteUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(person_r4.basicInfo == null ? null : person_r4.basicInfo.websiteUrl);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd")(5, "a", 40);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "userProfile.fields.linkedin"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("href", person_r4.contactInfo == null ? null : person_r4.contactInfo.linkedInUrl, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "userProfile.openLinkedIn"));
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 28)(1, "article", 29)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "article", 29)(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "article", 29)(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "strong");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "article", 29)(20, "span");
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "strong", 30);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "div", 31)(27, "div", 32);
    i0.ɵɵconditionalCreate(28, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_28_Template, 7, 4, "section", 33);
    i0.ɵɵelementStart(29, "section", 34)(30, "div", 35)(31, "div")(32, "span", 36);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "h2");
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(38, "dl", 37);
    i0.ɵɵconditionalCreate(39, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_39_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(40, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_40_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(41, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_41_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(42, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_42_Template, 6, 4, "div");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(43, "aside", 32)(44, "section", 33)(45, "div", 35)(46, "h2");
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "dl", 37);
    i0.ɵɵconditionalCreate(50, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_50_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(51, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_51_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(52, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_52_Template, 7, 5, "div");
    i0.ɵɵconditionalCreate(53, ProfileComponent_Conditional_4_Case_50_Conditional_0_Conditional_53_Template, 8, 7, "div");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const person_r4 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 20, "userProfile.stats.opportunities"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.myOpportunities().length));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 22, "userProfile.stats.participations"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.myParticipations().length));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 24, "userProfile.stats.credibility"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.reputationScore()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 26, "userProfile.fields.memberSince"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernDate(person_r4.createdAt) || i0.ɵɵpipeBind1(25, 28, "userProfile.notAvailable"));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional((person_r4.basicInfo == null ? null : person_r4.basicInfo.bio) ? 28 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 30, "userProfile.ownerOnly"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 32, "userProfile.sections.contact"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.email) ? 39 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.phone1) ? 40 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.city) ? 41 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.address) ? 42 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 34, "userProfile.sections.professional"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((person_r4.basicInfo == null ? null : person_r4.basicInfo.jobTitle) ? 50 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.basicInfo == null ? null : person_r4.basicInfo.companyName) ? 51 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.basicInfo == null ? null : person_r4.basicInfo.websiteUrl) ? 52 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.linkedInUrl) ? 53 : -1);
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_1_For_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 53);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const country_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", country_r6.code);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, country_r6.key));
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_1_For_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 53);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const country_r7 = ctx.$implicit;
    i0.ɵɵproperty("value", country_r7.code);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, country_r7.key));
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_1_Conditional_82_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article")(1, "a", 40);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 60);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Conditional_82_For_2_Template_button_click_3_listener() { const ɵ$index_422_r9 = i0.ɵɵrestoreView(_r8).$index; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.triggerNationalIdSelect(ɵ$index_422_r9)); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const file_r10 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", file_r10.url, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(file_r10.fileName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "profile.personalInfo.replaceFile"));
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_1_Conditional_82_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62);
    i0.ɵɵrepeaterCreate(1, ProfileComponent_Conditional_4_Case_50_Conditional_1_Conditional_82_For_2_Template, 6, 5, "article", null, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.nationalIdFiles());
} }
function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 41);
    i0.ɵɵlistener("ngSubmit", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onProfileSubmit()); });
    i0.ɵɵelementStart(1, "div", 35)(2, "div")(3, "span", 36);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 42);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onAvatarClick()); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 43)(13, "div", 44)(14, "label");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelement(17, "input", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "label");
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelement(21, "input", 46);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "label");
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelement(25, "input", 47);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "label");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementStart(29, "select", 48)(30, "option", 49);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "option", 50);
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "option", 51);
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(39, "label");
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementStart(42, "select", 52)(43, "option", 49);
    i0.ɵɵtext(44);
    i0.ɵɵpipe(45, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(46, ProfileComponent_Conditional_4_Case_50_Conditional_1_For_47_Template, 3, 4, "option", 53, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(48, "label");
    i0.ɵɵtext(49);
    i0.ɵɵpipe(50, "translate");
    i0.ɵɵelementStart(51, "select", 54)(52, "option", 49);
    i0.ɵɵtext(53);
    i0.ɵɵpipe(54, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(55, ProfileComponent_Conditional_4_Case_50_Conditional_1_For_56_Template, 3, 4, "option", 53, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "label", 55);
    i0.ɵɵtext(58);
    i0.ɵɵpipe(59, "translate");
    i0.ɵɵelement(60, "textarea", 56);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(61, "div", 57)(62, "h3");
    i0.ɵɵtext(63);
    i0.ɵɵpipe(64, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(65, "div", 44)(66, "label");
    i0.ɵɵtext(67);
    i0.ɵɵpipe(68, "translate");
    i0.ɵɵelement(69, "input", 58);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(70, "div", 59)(71, "span");
    i0.ɵɵtext(72);
    i0.ɵɵpipe(73, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(74, "button", 60);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template_button_click_74_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.triggerNationalIdSelect()); });
    i0.ɵɵtext(75);
    i0.ɵɵpipe(76, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(77, "small");
    i0.ɵɵtext(78);
    i0.ɵɵpipe(79, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(80, "input", 61, 1);
    i0.ɵɵlistener("change", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template_input_change_80_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onFileChange($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(82, ProfileComponent_Conditional_4_Case_50_Conditional_1_Conditional_82_Template, 3, 0, "div", 62);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(83, "div", 63)(84, "h3");
    i0.ɵɵtext(85);
    i0.ɵɵpipe(86, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(87, "div", 44)(88, "label");
    i0.ɵɵtext(89);
    i0.ɵɵpipe(90, "translate");
    i0.ɵɵelement(91, "input", 64);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(92, "label");
    i0.ɵɵtext(93);
    i0.ɵɵpipe(94, "translate");
    i0.ɵɵelement(95, "input", 65);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(96, "label");
    i0.ɵɵtext(97);
    i0.ɵɵpipe(98, "translate");
    i0.ɵɵelement(99, "input", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(100, "label");
    i0.ɵɵtext(101);
    i0.ɵɵpipe(102, "translate");
    i0.ɵɵelement(103, "input", 67);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(104, "label");
    i0.ɵɵtext(105);
    i0.ɵɵpipe(106, "translate");
    i0.ɵɵelement(107, "input", 68);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(108, "label");
    i0.ɵɵtext(109);
    i0.ɵɵpipe(110, "translate");
    i0.ɵɵelement(111, "input", 69);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(112, "div", 43)(113, "h3");
    i0.ɵɵtext(114);
    i0.ɵɵpipe(115, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(116, "div", 44)(117, "label");
    i0.ɵɵtext(118);
    i0.ɵɵpipe(119, "translate");
    i0.ɵɵelement(120, "input", 70);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(121, "label");
    i0.ɵɵtext(122);
    i0.ɵɵpipe(123, "translate");
    i0.ɵɵelement(124, "input", 71);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(125, "label");
    i0.ɵɵtext(126);
    i0.ɵɵpipe(127, "translate");
    i0.ɵɵelement(128, "input", 72);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(129, "label");
    i0.ɵɵtext(130);
    i0.ɵɵpipe(131, "translate");
    i0.ɵɵelement(132, "input", 73);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(133, "label");
    i0.ɵɵtext(134);
    i0.ɵɵpipe(135, "translate");
    i0.ɵɵelement(136, "input", 74);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(137, "div", 59)(138, "span");
    i0.ɵɵtext(139);
    i0.ɵɵpipe(140, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(141, "label", 75);
    i0.ɵɵtext(142);
    i0.ɵɵpipe(143, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(144, "input", 76);
    i0.ɵɵlistener("change", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template_input_change_144_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onHrLetterChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(145, "small");
    i0.ɵɵtext(146);
    i0.ɵɵpipe(147, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(148, "label");
    i0.ɵɵtext(149);
    i0.ɵɵpipe(150, "translate");
    i0.ɵɵelement(151, "input", 77);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(152, "label");
    i0.ɵɵtext(153);
    i0.ɵɵpipe(154, "translate");
    i0.ɵɵelement(155, "input", 78);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(156, "footer", 79)(157, "button", 60);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_50_Conditional_1_Template_button_click_157_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.cancelEdit()); });
    i0.ɵɵtext(158);
    i0.ɵɵpipe(159, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(160, "button", 80);
    i0.ɵɵtext(161);
    i0.ɵɵpipe(162, "translate");
    i0.ɵɵpipe(163, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("formGroup", ctx_r1.profileForm);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 44, "userProfile.ownerOnly"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 46, "profile.personalInfo.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 48, "profile.changePhoto"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 50, "profile.personalInfo.firstName"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 52, "profile.personalInfo.lastName"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 54, "profile.personalInfo.dateOfBirth"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 56, "profile.personalInfo.gender"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 58, "profile.personalInfo.genderSelect"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 60, "profile.personalInfo.male"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 62, "profile.personalInfo.female"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 64, "profile.personalInfo.nationality"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(45, 66, "profile.personalInfo.nationalitySelect"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.nationalityOptions);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(50, 68, "profile.personalInfo.country"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(54, 70, "profile.personalInfo.countrySelect"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.nationalityOptions);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(59, 72, "profile.personalInfo.bio"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(64, 74, "profile.identityDocuments"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(68, 76, "profile.personalInfo.nationalId"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(73, 78, "profile.personalInfo.uploadId"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(76, 80, "profile.personalInfo.chooseFile"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.nationalIdFileName() || i0.ɵɵpipeBind1(79, 82, "profile.personalInfo.noFileChosen"));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.nationalIdFiles().length ? 82 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("formGroup", ctx_r1.communicationForm);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(86, 84, "profile.communication.title"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(90, 86, "profile.communication.email"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(94, 88, "profile.communication.mobile"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(98, 90, "profile.communication.address"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(102, 92, "profile.communication.city"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(106, 94, "profile.communication.state"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(110, 96, "profile.communication.businessAddress"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(115, 98, "profile.company.title"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(119, 100, "profile.company.name"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(123, 102, "profile.personalInfo.businessRole"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(127, 104, "profile.company.email"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(131, 106, "profile.company.address"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(135, 108, "userProfile.fields.website"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(140, 110, "profile.company.hrLetter"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(143, 112, "profile.personalInfo.chooseFile"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.hrLetterFileName() || i0.ɵɵpipeBind1(147, 114, "profile.personalInfo.noFileChosen"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(150, 116, "profile.personalInfo.linkedin"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(154, 118, "profile.personalInfo.facebook"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(159, 120, "common.cancel"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.isLoading() || ctx_r1.profileForm.invalid || !ctx_r1.isProfileChanged() && !ctx_r1.isCommunicationChanged());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.isLoading() ? i0.ɵɵpipeBind1(162, 122, "profile.notifications.saving") : i0.ɵɵpipeBind1(163, 124, "profile.saveButton"));
} }
function ProfileComponent_Conditional_4_Case_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ProfileComponent_Conditional_4_Case_50_Conditional_0_Template, 54, 36)(1, ProfileComponent_Conditional_4_Case_50_Conditional_1_Template, 164, 126, "form", 27);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(!ctx_r1.editMode() ? 0 : 1);
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_1_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 85)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r11 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(5, _c2, item_r11.id));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r11.title || i0.ɵɵpipeBind1(3, 3, "userProfile.opportunity"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.enumLabel("opportunityStatus", item_r11.status, "unknown"));
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 33)(1, "div", 35)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 83);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 84);
    i0.ɵɵrepeaterCreate(8, ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_1_For_9_Template, 6, 7, "a", 85, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "userProfile.sections.opportunities"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.myOpportunities().length));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.limitedOpportunities());
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_For_17_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 85)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r12 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(5, _c2, item_r12.opportunityId));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r12.opportunityTitle || i0.ɵɵpipeBind1(3, 3, "userProfile.opportunity"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.enumLabel("participationStatus", item_r12.participationStatus, "unknown"));
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_For_17_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 88)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r12 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r12.opportunityTitle || i0.ɵɵpipeBind1(3, 2, "userProfile.opportunity"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.enumLabel("participationStatus", item_r12.participationStatus, "unknown"));
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_For_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_For_17_Conditional_0_Template, 6, 7, "a", 85)(1, ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_For_17_Conditional_1_Template, 6, 4, "div", 88);
} if (rf & 2) {
    const item_r12 = ctx.$implicit;
    i0.ɵɵconditional(item_r12.opportunityId ? 0 : 1);
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 34)(1, "div", 35)(2, "div")(3, "span", 36);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 86)(10, "span", 83);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "a", 87);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "div", 84);
    i0.ɵɵrepeaterCreate(16, ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_For_17_Template, 2, 1, null, null, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "userProfile.ownerOnly"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 6, "userProfile.sections.participation"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.myParticipations().length));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 8, "profile.viewAllParticipations"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.limitedParticipations());
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 81);
    i0.ɵɵconditionalCreate(1, ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_1_Template, 10, 4, "section", 33);
    i0.ɵɵconditionalCreate(2, ProfileComponent_Conditional_4_Case_51_Conditional_0_Conditional_2_Template, 18, 10, "section", 34);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.myOpportunities().length ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.myParticipations().length ? 2 : -1);
} }
function ProfileComponent_Conditional_4_Case_51_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 82)(1, "p", 89);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "profile.activityEmpty"));
} }
function ProfileComponent_Conditional_4_Case_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ProfileComponent_Conditional_4_Case_51_Conditional_0_Template, 3, 2, "div", 81)(1, ProfileComponent_Conditional_4_Case_51_Conditional_1_Template, 4, 3, "section", 82);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.myOpportunities().length || ctx_r1.myParticipations().length ? 0 : 1);
} }
function ProfileComponent_Conditional_4_Case_52_For_15_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_52_For_15_Template_button_click_0_listener() { const option_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.setTheme(option_r15)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r15 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("selected", ctx_r1.settings().theme === option_r15);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "settings.appearance.theme.options." + option_r15));
} }
function ProfileComponent_Conditional_4_Case_52_For_22_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_52_For_22_Template_button_click_0_listener() { const option_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.setPersonalization({ dashboardDensity: option_r17 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r17 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("selected", ctx_r1.settings().personalization.dashboardDensity === option_r17);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "settings.personalization.dashboardDensity.options." + option_r17));
} }
function ProfileComponent_Conditional_4_Case_52_For_29_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_52_For_29_Template_button_click_0_listener() { const option_r19 = i0.ɵɵrestoreView(_r18).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.setPersonalization({ defaultInvestmentType: option_r19 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r19 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("selected", ctx_r1.settings().personalization.defaultInvestmentType === option_r19);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "settings.personalization.defaultInvestmentType.options." + option_r19));
} }
function ProfileComponent_Conditional_4_Case_52_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 23)(1, "div", 35)(2, "div")(3, "span", 36);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 90)(10, "h3");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 91);
    i0.ɵɵrepeaterCreate(14, ProfileComponent_Conditional_4_Case_52_For_15_Template, 3, 5, "button", 92, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 90)(17, "h3");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 91);
    i0.ɵɵrepeaterCreate(21, ProfileComponent_Conditional_4_Case_52_For_22_Template, 3, 5, "button", 92, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div", 90)(24, "h3");
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "div", 91);
    i0.ɵɵrepeaterCreate(28, ProfileComponent_Conditional_4_Case_52_For_29_Template, 3, 5, "button", 92, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "label", 93)(31, "span");
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "input", 94);
    i0.ɵɵlistener("change", function ProfileComponent_Conditional_4_Case_52_Template_input_change_34_listener() { i0.ɵɵrestoreView(_r13); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setPersonalization({ showRiskIndicators: !ctx_r1.settings().personalization.showRiskIndicators })); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "a", 95);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 8, "userProfile.ownerOnly"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 10, "settings.personalization.title"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 12, "settings.appearance.theme.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.themeOptions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 14, "settings.personalization.dashboardDensity.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.densityOptions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 16, "settings.personalization.defaultInvestmentType.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.investmentTypeOptions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 18, "settings.personalization.showRiskIndicators"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.settings().personalization.showRiskIndicators);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 20, "profile.openAllSettings"));
} }
function ProfileComponent_Conditional_4_Case_53_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 97);
    i0.ɵɵlistener("ngSubmit", function ProfileComponent_Conditional_4_Case_53_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onNotificationSettingsSubmit()); });
    i0.ɵɵelementStart(1, "div", 35)(2, "div")(3, "h2");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 60);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_53_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.navigateToNotificationCenter()); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "label", 93)(13, "span")(14, "strong");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "small");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(20, "input", 98);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "label", 93)(22, "span")(23, "strong");
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "small");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(29, "input", 99);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "label", 93)(31, "span")(32, "strong");
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "small");
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(38, "input", 100);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "label", 93)(40, "span")(41, "strong");
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "small");
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(47, "input", 101);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "footer", 79)(49, "button", 80);
    i0.ɵɵtext(50);
    i0.ɵɵpipe(51, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("formGroup", ctx_r1.notificationSettingsForm);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 14, "profile.notifications.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 16, "profile.notifications.subtitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 18, "profile.openNotifications"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 20, "profile.notifications.opportunities.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 22, "profile.notifications.opportunities.description"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 24, "profile.notifications.portfolio.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 26, "profile.notifications.portfolio.description"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 28, "profile.notifications.security.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 30, "profile.notifications.security.description"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 32, "profile.notifications.news.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 34, "profile.notifications.news.description"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.notificationSettingsForm.pristine);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 36, "profile.saveButton"));
} }
function ProfileComponent_Conditional_4_Case_54_Conditional_19_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 109);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "profile.password.mismatch"));
} }
function ProfileComponent_Conditional_4_Case_54_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "label", 55);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelement(3, "input", 106);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "label");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelement(7, "input", 107);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "label");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelement(11, "input", 108);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, ProfileComponent_Conditional_4_Case_54_Conditional_19_Conditional_12_Template, 3, 3, "p", 109);
} if (rf & 2) {
    let tmp_8_0;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 4, "profile.password.otp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "profile.password.new"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 8, "profile.password.confirm"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.passwordForm.hasError("passwordMismatch") && ((tmp_8_0 = ctx_r1.passwordForm.get("confirmNewPassword")) == null ? null : tmp_8_0.touched) ? 12 : -1);
} }
function ProfileComponent_Conditional_4_Case_54_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "footer", 79)(1, "button", 80);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.passwordForm.invalid || ctx_r1.isLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "profile.saveButton"));
} }
function ProfileComponent_Conditional_4_Case_54_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 102);
    i0.ɵɵlistener("ngSubmit", function ProfileComponent_Conditional_4_Case_54_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r21); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onPasswordSubmit()); });
    i0.ɵɵelementStart(1, "div", 35)(2, "div")(3, "h2");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 44)(10, "label", 55);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementStart(13, "span", 103);
    i0.ɵɵelement(14, "input", 104);
    i0.ɵɵelementStart(15, "button", 105);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_54_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r21); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.sendPasswordOtp()); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(19, ProfileComponent_Conditional_4_Case_54_Conditional_19_Template, 13, 10);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, ProfileComponent_Conditional_4_Case_54_Conditional_20_Template, 4, 4, "footer", 79);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("formGroup", ctx_r1.passwordForm);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 8, "profile.password.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 10, "profile.password.description"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 12, "profile.password.current"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.isLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.otpSent() ? i0.ɵɵpipeBind1(17, 14, "profile.password.resendOtp") : i0.ɵɵpipeBind1(18, 16, "profile.password.sendOtp"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.otpSent() ? 19 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.otpSent() ? 20 : -1);
} }
function ProfileComponent_Conditional_4_Case_55_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 115);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_55_Conditional_27_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r23); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.viewAllTransactions()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "profile.viewAll"));
} }
function ProfileComponent_Conditional_4_Case_55_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 89);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "wallet.transactions.empty"));
} }
function ProfileComponent_Conditional_4_Case_55_Conditional_29_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article")(1, "div")(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const transaction_r24 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.walletTransactionTitle(transaction_r24));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.westernDate(transaction_r24.createdAt));
    i0.ɵɵadvance();
    i0.ɵɵclassProp("positive", ctx_r1.isWalletCredit(transaction_r24));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r1.signedWalletAmount(transaction_r24) > 0 ? "+" : "", "", ctx_r1.westernNumber(ctx_r1.signedWalletAmount(transaction_r24)));
} }
function ProfileComponent_Conditional_4_Case_55_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 114);
    i0.ɵɵrepeaterCreate(1, ProfileComponent_Conditional_4_Case_55_Conditional_29_For_2_Template, 8, 6, "article", null, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.limitedCreditHistory());
} }
function ProfileComponent_Conditional_4_Case_55_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 23)(1, "div", 35)(2, "div")(3, "span", 36);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 110)(10, "div")(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "strong");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 111)(17, "button", 60);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_55_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.navigateToWallet()); });
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "button", 7);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Case_55_Template_button_click_20_listener() { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.navigateToChargeCredits()); });
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(23, "div", 112)(24, "h3");
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(27, ProfileComponent_Conditional_4_Case_55_Conditional_27_Template, 3, 3, "button", 113);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(28, ProfileComponent_Conditional_4_Case_55_Conditional_28_Template, 3, 3, "p", 89)(29, ProfileComponent_Conditional_4_Case_55_Conditional_29_Template, 3, 0, "div", 114);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 9, "userProfile.ownerOnly"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 11, "profile.creditManagement.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 13, "profile.credits.available"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.currentScorePts()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 15, "profile.viewWallet"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 17, "profile.credits.chargeNow"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 19, "profile.credibilityHistory"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.creditHistory().length ? 27 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.limitedCreditHistory().length ? 28 : 29);
} }
function ProfileComponent_Conditional_4_Case_56_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "strong", 116);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.westernNumber(ctx_r1.reputationScore()));
} }
function ProfileComponent_Conditional_4_Case_56_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "strong", 117);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "profile.score.unavailable"));
} }
function ProfileComponent_Conditional_4_Case_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 26)(1, "div", 35)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, ProfileComponent_Conditional_4_Case_56_Conditional_5_Template, 2, 1, "strong", 116)(6, ProfileComponent_Conditional_4_Case_56_Conditional_6_Template, 3, 3, "strong", 117);
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "small");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "profile.score.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.reputationScore() !== null ? 5 : 6);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 6, "profile.score.description"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "profile.score.activityHelper"));
} }
function ProfileComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "header", 8)(1, "button", 9);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onAvatarClick()); });
    i0.ɵɵconditionalCreate(3, ProfileComponent_Conditional_4_Conditional_3_Template, 2, 4, "img", 10)(4, ProfileComponent_Conditional_4_Conditional_4_Template, 2, 1, "span", 11);
    i0.ɵɵconditionalCreate(5, ProfileComponent_Conditional_4_Conditional_5_Template, 1, 0, "span", 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "input", 13, 0);
    i0.ɵɵlistener("change", function ProfileComponent_Conditional_4_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onAvatarFileSelected($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 14)(9, "div", 15)(10, "div")(11, "h1");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "p", 16);
    i0.ɵɵtext(15);
    i0.ɵɵconditionalCreate(16, ProfileComponent_Conditional_4_Conditional_16_Template, 2, 1, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "button", 7);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); ctx_r1.selectSection("personal"); return i0.ɵɵresetView(ctx_r1.editMode.set(true)); });
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "div", 17);
    i0.ɵɵconditionalCreate(21, ProfileComponent_Conditional_4_Conditional_21_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(22, ProfileComponent_Conditional_4_Conditional_22_Template, 4, 3, "span");
    i0.ɵɵelementStart(23, "span", 18);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(25, "nav", 19);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementStart(27, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_27_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("personal")); });
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_30_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("investment")); });
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_33_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("personalization")); });
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("notifications")); });
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_39_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("security")); });
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_42_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("credit")); });
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "button", 20);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_4_Template_button_click_45_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection("score")); });
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(48, ProfileComponent_Conditional_4_Conditional_48_Template, 2, 1, "p", 21);
    i0.ɵɵelementStart(49, "section", 22);
    i0.ɵɵconditionalCreate(50, ProfileComponent_Conditional_4_Case_50_Template, 2, 1)(51, ProfileComponent_Conditional_4_Case_51_Template, 2, 1)(52, ProfileComponent_Conditional_4_Case_52_Template, 38, 22, "section", 23)(53, ProfileComponent_Conditional_4_Case_53_Template, 52, 38, "form", 24)(54, ProfileComponent_Conditional_4_Case_54_Template, 21, 18, "form", 25)(55, ProfileComponent_Conditional_4_Case_55_Template, 30, 21, "section", 23)(56, ProfileComponent_Conditional_4_Case_56_Template, 13, 10, "section", 26);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_36_0;
    const person_r4 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 41, "profile.changePhoto"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.avatarUrl() ? 3 : 4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isUploadingAvatar() ? 5 : -1);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r1.fullName() || i0.ɵɵpipeBind1(13, 43, "userProfile.member"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", ctx_r1.roleLabel(), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.basicInfo == null ? null : person_r4.basicInfo.jobTitle) ? 16 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 45, "userProfile.editProfile"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((person_r4.basicInfo == null ? null : person_r4.basicInfo.companyName) ? 21 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((person_r4.contactInfo == null ? null : person_r4.contactInfo.city) || (person_r4.basicInfo == null ? null : person_r4.basicInfo.country) ? 22 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.verificationLabel());
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(26, 47, "profile.ownerSettings"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "personal");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "personal");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 49, "profile.tabs.editProfile"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "investment");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "investment");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 51, "profile.tabs.investment"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "personalization");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "personalization");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 53, "profile.tabs.personalization"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "notifications");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "notifications");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 55, "profile.tabs.notifications"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "security");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "security");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 57, "profile.tabs.security"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "credit");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "credit");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 59, "profile.tabs.credit"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.activeSection() === "score");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeSection() === "score");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 61, "profile.tabs.score"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.errorMessage() ? 48 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_36_0 = ctx_r1.activeSection()) === "personal" ? 50 : tmp_36_0 === "investment" ? 51 : tmp_36_0 === "personalization" ? 52 : tmp_36_0 === "notifications" ? 53 : tmp_36_0 === "security" ? 54 : tmp_36_0 === "credit" ? 55 : tmp_36_0 === "score" ? 56 : -1);
} }
export const passwordMatchValidator = (control) => {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmNewPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
};
export class ProfileComponent {
    t(path) {
        return this.languageService.translate(path);
    }
    toggleDobCalendar() {
        const current = this.profileForm.get('dateOfBirth')?.value;
        if (!this.dobCalendarOpen()) {
            if (current) {
                const d = new Date(current);
                if (!isNaN(d.getTime())) {
                    this.dobCalendarMonth.set(d.getMonth());
                    this.dobCalendarYear.set(d.getFullYear());
                }
            }
        }
        this.dobCalendarOpen.set(!this.dobCalendarOpen());
    }
    closeDobCalendar() {
        this.dobCalendarOpen.set(false);
    }
    getYears(rangePast = 100, rangeFuture = 10) {
        const current = new Date().getFullYear();
        const years = [];
        for (let y = current - rangePast; y <= current + rangeFuture; y++)
            years.push(y);
        return years;
    }
    getMonths() {
        const dict = this.languageService.dictionary();
        const m = dict?.common?.months;
        const names = [
            m?.jan ?? 'Jan',
            m?.feb ?? 'Feb',
            m?.mar ?? 'Mar',
            m?.apr ?? 'Apr',
            m?.may ?? 'May',
            m?.jun ?? 'Jun',
            m?.jul ?? 'Jul',
            m?.aug ?? 'Aug',
            m?.sep ?? 'Sep',
            m?.oct ?? 'Oct',
            m?.nov ?? 'Nov',
            m?.dec ?? 'Dec'
        ];
        return names.map((n, i) => ({ idx: i, name: n }));
    }
    getDaysForMonth(year, month) {
        const last = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let d = 1; d <= last; d++)
            days.push(d);
        return days;
    }
    onSelectYear(y) {
        this.dobCalendarYear.set(y);
    }
    onSelectMonth(m) {
        this.dobCalendarMonth.set(m);
    }
    selectDob(day) {
        const iso = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())).toISOString().substr(0, 10);
        this.profileForm.patchValue({ dateOfBirth: iso });
        this.profileForm.get('dateOfBirth')?.markAsDirty();
        this.closeDobCalendar();
    }
    onSelectDayNumber(d) {
        const y = this.dobCalendarYear();
        const m = this.dobCalendarMonth();
        this.selectDob(new Date(y, m, d));
    }
    isSelectedDob(day) {
        const v = this.profileForm.get('dateOfBirth')?.value;
        if (!v)
            return false;
        const dt = new Date(v);
        if (isNaN(dt.getTime()))
            return false;
        return (dt.getFullYear() === this.dobCalendarYear() &&
            dt.getMonth() === this.dobCalendarMonth() &&
            dt.getDate() === day);
    }
    scrollToTop() {
        try {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
        catch {
            try {
                window.scrollTo(0, 0);
            }
            catch { }
        }
    }
    constructor() {
        this.activeSection = signal('personal', ...(ngDevMode ? [{ debugName: "activeSection" }] : []));
        this.editMode = signal(false, ...(ngDevMode ? [{ debugName: "editMode" }] : []));
        this.myOpportunities = signal([], ...(ngDevMode ? [{ debugName: "myOpportunities" }] : []));
        this.myParticipations = signal([], ...(ngDevMode ? [{ debugName: "myParticipations" }] : []));
        this.nationalIdFileName = signal(null, ...(ngDevMode ? [{ debugName: "nationalIdFileName" }] : []));
        this.nationalIdImageUrl = signal(null, ...(ngDevMode ? [{ debugName: "nationalIdImageUrl" }] : []));
        this.isUploadingNationalId = signal(false, ...(ngDevMode ? [{ debugName: "isUploadingNationalId" }] : []));
        this.nationalIdFiles = signal([], ...(ngDevMode ? [{ debugName: "nationalIdFiles" }] : []));
        this.replaceNationalIdIndex = signal(null, ...(ngDevMode ? [{ debugName: "replaceNationalIdIndex" }] : []));
        this.isNationalIdVerified = signal(false, ...(ngDevMode ? [{ debugName: "isNationalIdVerified" }] : []));
        this.isIdCopyVerified = signal(false, ...(ngDevMode ? [{ debugName: "isIdCopyVerified" }] : []));
        this.isUploadingAvatar = signal(false, ...(ngDevMode ? [{ debugName: "isUploadingAvatar" }] : []));
        this.pendingAvatarUrl = signal(null, ...(ngDevMode ? [{ debugName: "pendingAvatarUrl" }] : []));
        this.destroyRef = inject(DestroyRef);
        this.ngZone = inject(NgZone);
        this.profileService = inject(ProfileService);
        this.notificationService = inject(NotificationService);
        this.languageService = inject(LanguageService);
        this.router = inject(Router);
        this.fileStoreService = inject(FileStoreService);
        this.opportunityService = inject(OpportunityService);
        this.walletService = inject(WalletService);
        this.fullName = computed(() => {
            const formFirst = this.profileForm.get('firstName')?.value || '';
            const formLast = this.profileForm.get('lastName')?.value || '';
            if (formFirst || formLast) {
                return `${formFirst} ${formLast}`.trim();
            }
            const p = this.profileService.profile();
            if (!p)
                return '';
            if (p.basicInfo?.fullName)
                return p.basicInfo.fullName;
            return `${p.basicInfo?.firstName ?? ''} ${p.basicInfo?.lastName ?? ''}`.trim();
        }, ...(ngDevMode ? [{ debugName: "fullName" }] : []));
        this.avatarUrl = computed(() => {
            if (this.pendingAvatarUrl())
                return this.resolveMediaUrl(this.pendingAvatarUrl());
            const p = this.profileService.profile();
            if (p?.basicInfo?.avatarUrl)
                return this.resolveMediaUrl(p.basicInfo.avatarUrl);
            return '';
        }, ...(ngDevMode ? [{ debugName: "avatarUrl" }] : []));
        this.avatarInitials = computed(() => this.fullName().split(/\s+/u).filter(Boolean).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() || 'U', ...(ngDevMode ? [{ debugName: "avatarInitials" }] : []));
        this.roleLabel = computed(() => this.enumLabel('roles', this.profileService.profile()?.coreMetrics?.clientType || this.profileService.profile()?.coreMetrics?.role, 'member'), ...(ngDevMode ? [{ debugName: "roleLabel" }] : []));
        this.verificationLabel = computed(() => this.enumLabel('verification', this.profileService.profile()?.basicInfo?.verificationStatus, 'none'), ...(ngDevMode ? [{ debugName: "verificationLabel" }] : []));
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.currentScorePts = this.walletService.balance;
        this.reputationScore = computed(() => {
            const profile = this.profileService.profile();
            if (!profile?.coreMetrics)
                return null;
            if (profile.coreMetrics.credibilityScore !== undefined && profile.coreMetrics.credibilityScore !== null) {
                return profile.coreMetrics.credibilityScore;
            }
            if (profile.coreMetrics.currentCredibilityScore !== undefined && profile.coreMetrics.currentCredibilityScore !== null) {
                return profile.coreMetrics.currentCredibilityScore;
            }
            return null;
        }, ...(ngDevMode ? [{ debugName: "reputationScore" }] : []));
        this.creditHistory = signal([], ...(ngDevMode ? [{ debugName: "creditHistory" }] : []));
        this.limitedCreditHistory = computed(() => this.creditHistory().slice(0, 5), ...(ngDevMode ? [{ debugName: "limitedCreditHistory" }] : []));
        this.limitedOpportunities = computed(() => this.myOpportunities().slice(0, 5), ...(ngDevMode ? [{ debugName: "limitedOpportunities" }] : []));
        this.limitedParticipations = computed(() => this.myParticipations().slice(0, 5), ...(ngDevMode ? [{ debugName: "limitedParticipations" }] : []));
        this.profileSnapshot = signal('', ...(ngDevMode ? [{ debugName: "profileSnapshot" }] : []));
        this.communicationSnapshot = signal('', ...(ngDevMode ? [{ debugName: "communicationSnapshot" }] : []));
        this.profileForm = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            dateOfBirth: new FormControl(null),
            gender: new FormControl(''),
            nationality: new FormControl(''),
            country: new FormControl(''),
            nationalId: new FormControl(''),
            nationalIdCopy: new FormControl(null),
            companyName: new FormControl(''),
            jobTitle: new FormControl(''),
            websiteUrl: new FormControl(''),
            companyEmail: new FormControl(''),
            companyAddress: new FormControl(''),
            hrLetterCopy: new FormControl(null),
            bio: new FormControl('', [Validators.maxLength(500)]),
            linkedinUrl: new FormControl(''),
            facebookUrl: new FormControl(''),
        });
        this.profileFormValues = toSignal(this.profileForm.valueChanges, { initialValue: this.profileForm.value });
        this.communicationForm = new FormGroup({
            email: new FormControl(''),
            mobile: new FormControl({ value: '', disabled: true }),
            address: new FormControl(''),
            city: new FormControl(''),
            state: new FormControl(''),
            businessAddress: new FormControl(''),
            businessLocationSearch: new FormControl(''),
            businessLat: new FormControl(null),
            businessLng: new FormControl(null),
        });
        this.communicationFormValues = toSignal(this.communicationForm.valueChanges, { initialValue: this.communicationForm.value });
        this.hrLetterFileName = signal('', ...(ngDevMode ? [{ debugName: "hrLetterFileName" }] : []));
        this.hrLetterBase64 = signal(null, ...(ngDevMode ? [{ debugName: "hrLetterBase64" }] : []));
        this.deviceMacAddress = signal(null, ...(ngDevMode ? [{ debugName: "deviceMacAddress" }] : []));
        this.otpSent = signal(false, ...(ngDevMode ? [{ debugName: "otpSent" }] : []));
        this.passwordOtpMessage = signal('', ...(ngDevMode ? [{ debugName: "passwordOtpMessage" }] : []));
        this.passwordForm = new FormGroup({
            currentPassword: new FormControl('', [Validators.required]),
            otpToken: new FormControl(''),
            newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
            confirmNewPassword: new FormControl('', [Validators.required])
        }, { validators: passwordMatchValidator });
        this.notificationSettingsForm = new FormGroup({
            newOpportunities: new FormControl(true),
            portfolioUpdates: new FormControl(false),
            securityAlerts: new FormControl(true),
            marketNews: new FormControl(true),
        });
        this.settingsService = inject(SettingsService);
        this.settings = this.settingsService.settings;
        this.themeOptions = [ThemePreference.System, ThemePreference.Light, ThemePreference.Dark];
        this.densityOptions = [DashboardDensity.Comfortable, DashboardDensity.Compact];
        this.investmentTypeOptions = [
            DefaultInvestmentTypePreference.Any,
            DefaultInvestmentTypePreference.Founding,
            DefaultInvestmentTypePreference.Equity
        ];
        this.dobCalendarOpen = signal(false, ...(ngDevMode ? [{ debugName: "dobCalendarOpen" }] : []));
        this.dobCalendarMonth = signal(new Date().getMonth(), ...(ngDevMode ? [{ debugName: "dobCalendarMonth" }] : []));
        this.dobCalendarYear = signal(new Date().getFullYear(), ...(ngDevMode ? [{ debugName: "dobCalendarYear" }] : []));
        this.isRtl = computed(() => this.languageService.direction() === 'rtl', ...(ngDevMode ? [{ debugName: "isRtl" }] : []));
        this.nationalityOptions = [
            { code: 'EG', key: 'profile.personalInfo.country_egypt' },
            { code: 'SA', key: 'profile.personalInfo.country_saudi_arabia' },
            { code: 'AE', key: 'profile.personalInfo.country_uae' },
            { code: 'JO', key: 'profile.personalInfo.country_jordan' },
            { code: 'LB', key: 'profile.personalInfo.country_lebanon' },
            { code: 'US', key: 'profile.personalInfo.country_usa' },
            { code: 'GB', key: 'profile.personalInfo.country_uk' },
            { code: 'IN', key: 'profile.personalInfo.country_india' },
            { code: 'CA', key: 'profile.personalInfo.country_canada' },
            { code: 'AU', key: 'profile.personalInfo.country_australia' },
            { code: 'OT', key: 'profile.personalInfo.country_other' },
        ];
        this.isProfileChanged = computed(() => {
            const formValues = this.profileFormValues();
            const current = {
                firstName: formValues.firstName ?? '',
                lastName: formValues.lastName ?? '',
                nationalId: formValues.nationalId ?? '',
                companyName: formValues.companyName ?? '',
                jobTitle: formValues.jobTitle ?? '',
                websiteUrl: formValues.websiteUrl ?? '',
                companyEmail: formValues.companyEmail ?? '',
                companyAddress: formValues.companyAddress ?? '',
                hrLetterFileName: this.hrLetterFileName() ?? '',
                bio: formValues.bio ?? '',
                linkedinUrl: formValues.linkedinUrl ?? '',
                facebookUrl: formValues.facebookUrl ?? ''
            };
            try {
                return JSON.stringify(current) !== this.profileSnapshot();
            }
            catch {
                return false;
            }
        }, ...(ngDevMode ? [{ debugName: "isProfileChanged" }] : []));
        this.isCommunicationChanged = computed(() => {
            const values = this.communicationFormValues();
            const current = {
                email: values.email ?? '',
                address: values.address ?? '',
                city: values.city ?? '',
                state: values.state ?? '',
                businessAddress: values.businessAddress ?? '',
                businessLocationSearch: values.businessLocationSearch ?? '',
                businessLat: values.businessLat ?? null,
                businessLng: values.businessLng ?? null
            };
            return JSON.stringify(current) !== this.communicationSnapshot();
        }, ...(ngDevMode ? [{ debugName: "isCommunicationChanged" }] : []));
        this.profileForm.get('nationalId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.isNationalIdVerified.set(false);
        });
        this.profileForm.get('nationalIdCopy')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.isIdCopyVerified.set(false);
        });
        this.loadProfile();
        effect(() => {
            const p = this.profileService.profile();
            if (!p || this.profileSnapshot())
                return;
            this.syncProfileToForms(p);
            this.initializeSnapshots(p);
        });
        this.loadProfileNotificationPreferences();
    }
    // Google Maps removed (Profile V2)
    getCountryLabel(code) {
        if (!code)
            return '';
        const found = this.nationalityOptions.find(c => c.code === code);
        if (found)
            return this.t(found.key);
        const foundByLabel = this.nationalityOptions.find(c => this.t(c.key) === code);
        if (foundByLabel)
            return this.t(foundByLabel.key);
        return code;
    }
    async loadCreditHistory() {
        try {
            const view = await this.walletService.loadCurrentUserWallet();
            this.creditHistory.set(view.transactions);
        }
        catch {
            // non-critical
        }
    }
    async loadNationalIdFiles() {
        try {
            const userId = this.profileService.profile()?.userId;
            if (!userId)
                return;
            const files = await this.fileStoreService.getNationalIdFiles(userId);
            const items = (files || []).map(f => ({ fileName: f.fileName, url: f.url }));
            const withThumbs = await this.generateThumbnails(items);
            this.nationalIdFiles.set(withThumbs);
            if (withThumbs.length > 0)
                this.nationalIdImageUrl.set(withThumbs[0].url);
        }
        catch {
            // non-critical
        }
    }
    async generateThumbnails(items) {
        const results = [];
        await Promise.all(items.map(async (it) => {
            try {
                const thumb = await this.createThumbnailFromUrl(it.url, 240, 160);
                results.push({ ...it, thumbUrl: thumb });
            }
            catch {
                results.push({ ...it, thumbUrl: undefined });
            }
        }));
        return results;
    }
    createThumbnailFromUrl(url, maxWidth = 240, maxHeight = 160) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
                    const w = Math.round(img.width * ratio);
                    const h = Math.round(img.height * ratio);
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (!ctx)
                        return reject(new Error('Canvas 2D not supported'));
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                }
                catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
            img.src = url;
        });
    }
    initializeSnapshots(p) {
        const snapshotObj = {
            firstName: p?.basicInfo?.firstName ?? '',
            lastName: p?.basicInfo?.lastName ?? '',
            dateOfBirth: p?.basicInfo?.dateOfBirth ? new Date(p.basicInfo.dateOfBirth).toISOString().substr(0, 10) : null,
            gender: (p?.basicInfo?.gender ?? ''),
            nationality: p?.basicInfo?.nationality ?? '',
            country: p?.basicInfo?.country ?? '',
            nationalId: p?.identityCompliance?.documentNumber ?? '',
            companyName: p?.basicInfo?.companyName ?? '',
            jobTitle: p?.basicInfo?.jobTitle ?? '',
            websiteUrl: p?.basicInfo?.websiteUrl ?? '',
            companyEmail: p?.contactInfo?.companyEmail ?? '',
            companyAddress: p?.contactInfo?.companyAddress ?? '',
            hrLetterFileName: p?.identityCompliance?.hrLetterFileName ?? '',
            bio: p?.basicInfo?.bio ?? '',
            linkedinUrl: p?.basicInfo?.linkedInUrl ?? p?.contactInfo?.linkedInUrl ?? '',
            facebookUrl: p?.basicInfo?.facebookUrl ?? p?.contactInfo?.facebookUrl ?? ''
        };
        this.profileSnapshot.set(JSON.stringify(snapshotObj));
        const commSnapshotObj = {
            email: p?.contactInfo?.email ?? '',
            address: p?.contactInfo?.address ?? '',
            city: p?.contactInfo?.city ?? '',
            state: p?.contactInfo?.phone2 ?? '',
            businessAddress: p?.contactInfo?.workAddress ?? p?.contactInfo?.companyAddress ?? '',
            businessLocationSearch: '',
            businessLat: null,
            businessLng: null
        };
        this.communicationSnapshot.set(JSON.stringify(commSnapshotObj));
    }
    syncProfileToForms(p) {
        const incomingGender = p?.basicInfo?.gender ?? '';
        const normalizedGender = incomingGender
            ? incomingGender.toString().toLowerCase().startsWith('m')
                ? 'M'
                : incomingGender.toString().toLowerCase().startsWith('f')
                    ? 'F'
                    : incomingGender
            : '';
        const incomingNationality = p?.basicInfo?.nationality ?? '';
        let nationalityCode = '';
        if (incomingNationality) {
            const found = this.nationalityOptions.find(c => c.code === incomingNationality || this.t(c.key) === incomingNationality);
            nationalityCode = found ? found.code : incomingNationality;
        }
        this.profileForm.patchValue({
            firstName: p?.basicInfo?.firstName ?? '',
            lastName: p?.basicInfo?.lastName ?? '',
            dateOfBirth: p?.basicInfo?.dateOfBirth ? new Date(p.basicInfo.dateOfBirth).toISOString().substr(0, 10) : null,
            gender: normalizedGender ?? '',
            nationality: nationalityCode ?? '',
            country: p?.basicInfo?.country ?? '',
            nationalId: p?.identityCompliance?.documentNumber ?? '',
            companyName: p?.basicInfo?.companyName ?? '',
            jobTitle: p?.basicInfo?.jobTitle ?? '',
            websiteUrl: p?.basicInfo?.websiteUrl ?? '',
            companyEmail: p?.contactInfo?.companyEmail ?? '',
            companyAddress: p?.contactInfo?.companyAddress ?? '',
            bio: p?.basicInfo?.bio ?? '',
            linkedinUrl: p?.basicInfo?.linkedInUrl ?? p?.contactInfo?.linkedInUrl ?? '',
            facebookUrl: p?.basicInfo?.facebookUrl ?? p?.contactInfo?.facebookUrl ?? ''
        }, { emitEvent: false });
        this.hrLetterFileName.set(p?.identityCompliance?.hrLetterFileName ?? '');
        this.hrLetterBase64.set(p?.identityCompliance?.hrLetterBase64 ?? null);
        // Communication fields retained but Google Places removed.
        this.communicationForm.patchValue({
            email: p?.contactInfo?.email ?? '',
            mobile: p?.contactInfo?.phone1 ?? '',
            address: p?.contactInfo?.address ?? '',
            city: p?.contactInfo?.city ?? '',
            state: p?.contactInfo?.phone2 ?? '',
            businessAddress: p?.contactInfo?.workAddress ?? p?.contactInfo?.companyAddress ?? ''
        }, { emitEvent: false });
        const vs = p?.identityCompliance?.verificationStatus;
        const verified = vs === 'Verified';
        this.isNationalIdVerified.set(verified);
        this.isIdCopyVerified.set(verified);
    }
    async loadProfile() {
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            const p = await this.profileService.loadMyProfile();
            if (!p) {
                this.errorMessage.set(this.t('profile.errors.notFound'));
            }
            else {
                await Promise.all([this.loadCreditHistory(), this.loadNationalIdFiles(), this.loadActivity()]);
            }
        }
        catch {
            this.errorMessage.set(this.t('profile.errors.loadFailed'));
            this.profileService.clear();
        }
        finally {
            this.isLoading.set(false);
        }
    }
    async loadActivity() {
        const [opportunities, participations] = await Promise.all([
            this.opportunityService.getMyOpportunities().catch(() => []),
            this.opportunityService.getMyParticipations().catch(() => [])
        ]);
        this.myOpportunities.set(opportunities);
        this.myParticipations.set(participations);
    }
    westernNumber(value) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
    }
    westernDate(value) {
        if (!value)
            return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date);
    }
    enumLabel(group, value, fallback) {
        const normalized = String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/gu, '') || fallback;
        const key = `userProfile.enums.${group}.${normalized}`;
        const translated = this.t(key);
        return translated === key ? this.t(`userProfile.enums.${group}.${fallback}`) : translated;
    }
    walletTransactionTitle(transaction) {
        if (transaction.description?.trim())
            return transaction.description.trim();
        const reason = walletReasonKey(transaction.reason);
        return this.t(`wallet.enums.reason.${reason}`);
    }
    isWalletCredit(transaction) {
        const direction = String(transaction.direction).trim().toLowerCase();
        return direction === 'credit' || direction === '1';
    }
    signedWalletAmount(transaction) {
        return this.isWalletCredit(transaction) ? transaction.creditAmount : -transaction.creditAmount;
    }
    loadProfileNotificationPreferences() {
        try {
            const raw = localStorage.getItem('investa:profileNotifications');
            if (!raw)
                return;
            const parsed = JSON.parse(raw);
            this.notificationSettingsForm.patchValue({
                newOpportunities: parsed.newOpportunities ?? this.notificationSettingsForm.get('newOpportunities')?.value,
                portfolioUpdates: parsed.portfolioUpdates ?? this.notificationSettingsForm.get('portfolioUpdates')?.value,
                securityAlerts: parsed.securityAlerts ?? this.notificationSettingsForm.get('securityAlerts')?.value,
                marketNews: parsed.marketNews ?? this.notificationSettingsForm.get('marketNews')?.value
            }, { emitEvent: false });
        }
        catch {
            // ignore
        }
    }
    selectSection(section) {
        this.activeSection.set(section);
        this.scrollToTop();
    }
    setTheme(theme) {
        this.settingsService.setTheme(theme);
    }
    setPersonalization(partial) {
        this.settingsService.setPersonalization({ ...this.settings().personalization, ...partial });
    }
    viewAllTransactions() {
        this.router.navigate(['/admin/transactions']);
    }
    navigateToWallet() {
        this.router.navigate(['/admin/profile/wallet']);
    }
    navigateToNotificationCenter() {
        this.router.navigate(['/admin/profile/notifications']);
    }
    navigateToChargeCredits() {
        this.router.navigate(['/admin/credit-charge']);
    }
    onAvatarClick() {
        this.avatarInput.nativeElement.click();
    }
    cancelEdit() {
        const profile = this.profileService.profile();
        if (profile)
            this.syncProfileToForms(profile);
        this.editMode.set(false);
    }
    resolveMediaUrl(value) {
        if (!value)
            return '';
        return value.startsWith('http') || value.startsWith('data:') ? value : this.fileStoreService.getPublicUrl(value);
    }
    async onAvatarFileSelected(event) {
        const input = event.target;
        const file = input.files?.[0];
        if (!file)
            return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            this.notificationService.showToast({
                title: this.t('profile.toasts.invalidFileTypeTitle'),
                message: this.t('profile.toasts.invalidFileTypeMessage'),
                type: 'error'
            });
            return;
        }
        const userId = this.profileService.profile()?.userId;
        if (!userId)
            return;
        try {
            this.isUploadingAvatar.set(true);
            const url = await this.fileStoreService.uploadProfilePicture(userId, file);
            this.pendingAvatarUrl.set(url);
            const existing = this.profileService.profile();
            await this.profileService.updateMyProfile({
                ...existing,
                basicInfo: { ...(existing.basicInfo ?? {}), avatarUrl: url }
            });
            await this.profileService.loadMyProfile();
            this.pendingAvatarUrl.set(null);
            this.notificationService.showToast({
                title: this.t('profile.toasts.avatarUpdatedTitle'),
                message: this.t('profile.toasts.avatarUpdatedMessage'),
                type: 'success'
            });
        }
        catch (e) {
            this.notificationService.showToast({
                title: this.t('profile.toasts.avatarUploadFailedTitle'),
                message: this.errorMessageFrom(e, 'profile.toasts.avatarUploadFailedMessage'),
                type: 'error'
            });
        }
        finally {
            this.isUploadingAvatar.set(false);
            input.value = '';
        }
    }
    onFileChange(event) {
        const input = event.target;
        if (!input.files || input.files.length === 0)
            return;
        const files = Array.from(input.files);
        this.nationalIdFileName.set(files[files.length - 1].name);
        this.profileForm.patchValue({ nationalIdCopy: files[files.length - 1] });
        this.profileForm.get('nationalIdCopy')?.markAsDirty();
        const userId = this.profileService.profile()?.userId;
        if (!userId) {
            input.value = '';
            return;
        }
        (async () => {
            const latestFiles = this.nationalIdFiles();
            let replaceIndex = this.replaceNationalIdIndex();
            try {
                this.isUploadingNationalId.set(true);
                for (const file of files) {
                    let targetReplaceIndex = replaceIndex;
                    const current = this.nationalIdFiles() || latestFiles || [];
                    if (targetReplaceIndex === null) {
                        targetReplaceIndex = current.length < 2 ? null : 0;
                    }
                    const url = await this.fileStoreService.uploadNationalId(userId, file);
                    this.nationalIdImageUrl.set(url);
                    if (targetReplaceIndex !== null) {
                        const old = current[targetReplaceIndex];
                        if (old) {
                            try {
                                await this.fileStoreService.deleteNationalId(userId, old.fileName);
                            }
                            catch {
                                // ignore
                            }
                        }
                    }
                    await this.loadNationalIdFiles();
                    replaceIndex = null;
                }
            }
            catch (e) {
                this.notificationService.showToast({
                    title: this.t('profile.toasts.uploadFailedTitle'),
                    message: this.t('profile.toasts.uploadFailedMessage'),
                    type: 'error'
                });
            }
            finally {
                this.isUploadingNationalId.set(false);
                this.replaceNationalIdIndex.set(null);
                input.value = '';
            }
        })();
    }
    triggerNationalIdSelect(index) {
        try {
            this.replaceNationalIdIndex.set(typeof index === 'number' ? index : null);
            this.nationalIdInput?.nativeElement?.click();
        }
        catch {
            // ignore
        }
    }
    async onProfileSubmit() {
        if (this.profileForm.invalid)
            return;
        const profileDto = this.buildProfileUpdatePayload();
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            this.notificationService.showToast({
                title: this.t('profile.toasts.savingTitle'),
                message: this.t('profile.toasts.savingMessage'),
                type: 'info'
            });
            const updated = await this.profileService.updateMyProfile(profileDto);
            if (updated) {
                await this.profileService.loadMyProfile();
                const p = this.profileService.profile();
                if (p)
                    this.initializeSnapshots(p);
                this.profileForm.markAsPristine();
                this.communicationForm.markAsPristine();
                this.editMode.set(false);
                this.notificationService.showToast({
                    title: this.t('profile.toasts.savedTitle'),
                    message: this.t('profile.toasts.savedMessage'),
                    type: 'success'
                });
            }
        }
        catch (e) {
            const message = this.errorMessageFrom(e, 'profile.toasts.saveFailedMessage');
            this.errorMessage.set(message);
            this.notificationService.showToast({ title: this.t('profile.toasts.saveFailedTitle'), message, type: 'error' });
        }
        finally {
            this.isLoading.set(false);
        }
    }
    // Communication submit removed (Profile V2 removes Communication tab logic)
    async sendPasswordOtp() {
        const currentPassword = this.passwordForm.get('currentPassword')?.value || '';
        if (!currentPassword) {
            this.passwordForm.get('currentPassword')?.markAsTouched();
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordValidationFailed') || 'Invalid password fields',
                message: this.t('profile.toasts.passwordValidationMessage') || 'Please fix the highlighted password fields before saving.',
                type: 'error'
            });
            return;
        }
        try {
            this.isLoading.set(true);
            await this.profileService.sendPasswordChangeOtp(currentPassword);
            this.otpSent.set(true);
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordOtpSentTitle') || 'OTP Sent',
                message: this.t('profile.toasts.passwordOtpSentMessage') || 'An OTP was sent to your mobile phone.',
                type: 'success'
            });
        }
        catch (e) {
            const message = this.errorMessageFrom(e, 'profile.toasts.passwordSendOtpFailedMessage');
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordSendOtpFailedTitle') || 'OTP send failed',
                message,
                type: 'error'
            });
        }
        finally {
            this.isLoading.set(false);
        }
    }
    async onPasswordSubmit() {
        if (!this.otpSent()) {
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordOtpRequiredTitle') || 'OTP Required',
                message: this.t('profile.toasts.passwordOtpRequiredMessage') || 'Please request an OTP before changing your password.',
                type: 'error'
            });
            return;
        }
        if (this.passwordForm.invalid) {
            Object.values(this.passwordForm.controls).forEach(control => {
                control.markAsTouched();
                control.updateValueAndValidity();
            });
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordValidationFailed') || 'Invalid password fields',
                message: this.t('profile.toasts.passwordValidationMessage') || 'Please fix the highlighted password fields before saving.',
                type: 'error'
            });
            return;
        }
        const otpToken = this.passwordForm.get('otpToken')?.value || '';
        const newPassword = this.passwordForm.get('newPassword')?.value || '';
        if (!otpToken) {
            this.passwordForm.get('otpToken')?.markAsTouched();
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordOtpRequiredTitle') || 'OTP Required',
                message: this.t('profile.toasts.passwordOtpRequiredMessage') || 'Please enter the OTP sent to your mobile.',
                type: 'error'
            });
            return;
        }
        try {
            this.isLoading.set(true);
            await this.profileService.confirmPasswordChange(otpToken, newPassword);
            this.passwordForm.reset();
            this.otpSent.set(false);
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordChangedTitle') || 'Password changed',
                message: this.t('profile.toasts.passwordChangedMessage') || 'Your password was updated successfully.',
                type: 'success'
            });
        }
        catch (e) {
            const message = this.errorMessageFrom(e, 'profile.toasts.passwordChangeFailedMessage');
            this.notificationService.showToast({
                title: this.t('profile.toasts.passwordChangeFailedTitle') || 'Password change failed',
                message,
                type: 'error'
            });
        }
        finally {
            this.isLoading.set(false);
        }
    }
    onNotificationSettingsSubmit() {
        if (this.notificationSettingsForm.invalid)
            return;
        try {
            const vals = this.notificationSettingsForm.getRawValue();
            localStorage.setItem('investa:profileNotifications', JSON.stringify(vals));
            this.notificationSettingsForm.markAsPristine();
            this.notificationService.showToast({ title: this.t('profile.toasts.savedTitle'), message: this.t('profile.toasts.savedMessage'), type: 'success' });
        }
        catch {
            this.notificationService.showToast({ title: this.t('profile.toasts.saveFailedTitle'), message: this.t('profile.toasts.saveFailedMessage'), type: 'error' });
        }
    }
    buildProfileUpdatePayload() {
        const existing = this.profileService.profile() ?? { userId: '', coreMetrics: null, basicInfo: null, contactInfo: null, identityCompliance: null };
        const communicationRaw = this.communicationForm.getRawValue();
        const currentDocumentNumber = this.profileForm.get('nationalId')?.value ?? existing.identityCompliance?.documentNumber ?? null;
        const currentDocumentFrontImageUrl = this.nationalIdImageUrl() ?? existing.identityCompliance?.documentFrontImageUrl ?? null;
        const currentDocumentBackImageUrl = existing.identityCompliance?.documentBackImageUrl ?? null;
        return {
            ...existing,
            coreMetrics: {
                ...(existing.coreMetrics ?? {})
            },
            nationalId: currentDocumentNumber,
            basicInfo: {
                ...(existing.basicInfo ?? {}),
                firstName: this.profileForm.get('firstName')?.value ?? '',
                lastName: this.profileForm.get('lastName')?.value ?? '',
                dateOfBirth: this.profileForm.get('dateOfBirth')?.value ? new Date(this.profileForm.get('dateOfBirth')?.value).toISOString() : null,
                gender: this.profileForm.get('gender')?.value ?? null,
                nationality: this.profileForm.get('nationality')?.value ?? null,
                country: this.profileForm.get('country')?.value ?? null,
                companyName: this.profileForm.get('companyName')?.value ?? existing.basicInfo?.companyName ?? null,
                jobTitle: this.profileForm.get('jobTitle')?.value ?? existing.basicInfo?.jobTitle ?? null,
                websiteUrl: this.profileForm.get('websiteUrl')?.value ?? existing.basicInfo?.websiteUrl ?? null,
                bio: this.profileForm.get('bio')?.value ?? '',
                linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? '',
                facebookUrl: this.profileForm.get('facebookUrl')?.value ?? '',
                avatarUrl: existing.basicInfo?.avatarUrl ?? null,
            },
            contactInfo: {
                ...(existing.contactInfo ?? {}),
                email: communicationRaw.email ?? existing.contactInfo?.email ?? null,
                phone1: existing.contactInfo?.phone1 ?? null,
                phone2: communicationRaw.state ?? existing.contactInfo?.phone2 ?? null,
                address: communicationRaw.address ?? existing.contactInfo?.address ?? null,
                city: communicationRaw.city ?? existing.contactInfo?.city ?? null,
                workAddress: communicationRaw.businessAddress ?? existing.contactInfo?.workAddress ?? null,
                companyEmail: this.profileForm.get('companyEmail')?.value ?? existing.contactInfo?.companyEmail ?? null,
                companyAddress: this.profileForm.get('companyAddress')?.value ?? communicationRaw.businessAddress ?? existing.contactInfo?.companyAddress ?? null,
                linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? existing.contactInfo?.linkedInUrl ?? null,
                facebookUrl: this.profileForm.get('facebookUrl')?.value ?? existing.contactInfo?.facebookUrl ?? null
            },
            identityCompliance: {
                ...(existing.identityCompliance ?? {}),
                documentNumber: currentDocumentNumber,
                verificationStatus: this.computeIdentityVerificationStatus(existing.identityCompliance, currentDocumentNumber, currentDocumentFrontImageUrl, currentDocumentBackImageUrl),
                documentFrontImageUrl: currentDocumentFrontImageUrl,
                documentBackImageUrl: currentDocumentBackImageUrl,
                hrLetterFileName: (this.hrLetterFileName() || existing.identityCompliance?.hrLetterFileName) ?? null,
                hrLetterBase64: (this.hrLetterBase64() || existing.identityCompliance?.hrLetterBase64) ?? null,
                deviceMacAddress: (this.deviceMacAddress() || existing.identityCompliance?.deviceMacAddress) ?? null
            }
        };
    }
    // KYC/Verification logic removed; keep only backend-driven verification status passthrough.
    computeIdentityVerificationStatus(existingIdentityCompliance, documentNumber, documentFrontImageUrl, documentBackImageUrl) {
        return existingIdentityCompliance?.verificationStatus ?? null;
    }
    onHrLetterChange(event) {
        const input = event.target;
        const file = input.files?.[0];
        if (!file)
            return;
        this.hrLetterFileName.set(file.name);
        this.profileForm.patchValue({ hrLetterCopy: file });
        this.profileForm.get('hrLetterCopy')?.markAsDirty();
        const reader = new FileReader();
        reader.onload = () => {
            this.ngZone.run(() => this.hrLetterBase64.set(typeof reader.result === 'string' ? reader.result : null));
        };
        reader.onerror = () => {
            this.ngZone.run(() => {
                this.hrLetterBase64.set(null);
                this.notificationService.showToast({
                    title: this.t('profile.toasts.uploadFailedTitle'),
                    message: this.t('profile.toasts.uploadFailedMessage'),
                    type: 'error'
                });
            });
        };
        reader.readAsDataURL(file);
    }
    errorMessageFrom(error, fallbackKey) {
        const record = typeof error === 'object' && error !== null ? error : null;
        const nested = record && typeof record['error'] === 'object' && record['error'] !== null
            ? record['error']
            : null;
        const direct = typeof record?.['message'] === 'string' ? record['message'] : '';
        return nested?.message || direct || this.t(fallbackKey);
    }
    static { this.ɵfac = function ProfileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProfileComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProfileComponent, selectors: [["app-profile"]], viewQuery: function ProfileComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5)(_c1, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.avatarInput = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.nationalIdInput = _t.first);
        } }, decls: 5, vars: 2, consts: [["avatarInput", ""], ["nationalIdInput", ""], [1, "user-profile-page"], [1, "profile-shell"], [1, "state-card"], ["aria-hidden", "true", 1, "profile-spinner"], [1, "state-icon"], ["type", "button", 1, "primary-action", 3, "click"], [1, "profile-header", "profile-card"], ["type", "button", 1, "avatar-wrap", 3, "click"], [3, "src", "alt"], ["aria-hidden", "true"], ["aria-hidden", "true", 1, "avatar-loading", "profile-spinner"], ["type", "file", "accept", "image/jpeg,image/png,image/webp,image/gif", "hidden", "", 3, "change"], [1, "identity-block"], [1, "identity-title"], [1, "role-line"], [1, "header-meta"], [1, "status-badge", "status-badge--green"], ["role", "tablist", 1, "profile-tabs", "profile-card"], ["type", "button", "role", "tab", 3, "click"], [1, "error-banner"], ["role", "tabpanel", 1, "tab-panel"], [1, "profile-card", "settings-card"], [1, "profile-card", "settings-card", 3, "formGroup"], [1, "profile-card", "settings-card", "security-form", 3, "formGroup"], [1, "profile-card", "settings-card", "score-card"], [1, "profile-card", "edit-card", 3, "formGroup"], [1, "stats-grid"], [1, "stat-card", "profile-card"], [1, "date-stat"], [1, "content-grid"], [1, "main-column"], [1, "profile-card", "section-card"], [1, "profile-card", "section-card", "owner-section"], [1, "section-heading"], [1, "eyebrow"], [1, "detail-grid"], [1, "bio-copy"], ["dir", "ltr"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href"], [1, "profile-card", "edit-card", 3, "ngSubmit", "formGroup"], ["type", "button", 1, "photo-action", 3, "click"], [1, "form-section"], [1, "form-grid"], ["formControlName", "firstName", "autocomplete", "given-name"], ["formControlName", "lastName", "autocomplete", "family-name"], ["type", "date", "formControlName", "dateOfBirth"], ["formControlName", "gender"], ["value", ""], ["value", "M"], ["value", "F"], ["formControlName", "nationality"], [3, "value"], ["formControlName", "country"], [1, "span-2"], ["rows", "4", "formControlName", "bio"], [1, "form-section", "identity-section"], ["formControlName", "nationalId", "inputmode", "numeric"], [1, "file-field"], ["type", "button", 1, "quiet-action", 3, "click"], ["type", "file", "accept", "image/*,.pdf", "hidden", "", "multiple", "", 3, "change"], [1, "file-list", "span-2"], [1, "form-section", 3, "formGroup"], ["type", "email", "formControlName", "email", "autocomplete", "email"], ["formControlName", "mobile", "autocomplete", "tel"], ["formControlName", "address", "autocomplete", "street-address"], ["formControlName", "city", "autocomplete", "address-level2"], ["formControlName", "state", "autocomplete", "address-level1"], ["formControlName", "businessAddress"], ["formControlName", "companyName"], ["formControlName", "jobTitle"], ["type", "email", "formControlName", "companyEmail"], ["formControlName", "companyAddress"], ["type", "url", "formControlName", "websiteUrl", "inputmode", "url"], ["for", "hrLetterCopy", 1, "quiet-action"], ["id", "hrLetterCopy", "type", "file", "hidden", "", 3, "change"], ["type", "url", "formControlName", "linkedinUrl", "inputmode", "url"], ["type", "url", "formControlName", "facebookUrl", "inputmode", "url"], [1, "form-actions"], ["type", "submit", 1, "primary-action", 3, "disabled"], [1, "content-grid", "activity-grid"], [1, "profile-card", "section-card", "compact-empty"], [1, "count-badge"], [1, "activity-list"], [3, "routerLink"], [1, "section-actions"], ["routerLink", "/admin/my-projects", 1, "text-action"], [1, "activity-row"], [1, "empty-copy"], [1, "settings-group"], [1, "choice-row"], ["type", "button", 3, "selected"], [1, "toggle-row"], ["type", "checkbox", 3, "change", "checked"], ["routerLink", "/admin/settings", 1, "quiet-action", "inline-link"], ["type", "button", 3, "click"], [1, "profile-card", "settings-card", 3, "ngSubmit", "formGroup"], ["type", "checkbox", "formControlName", "newOpportunities"], ["type", "checkbox", "formControlName", "portfolioUpdates"], ["type", "checkbox", "formControlName", "securityAlerts"], ["type", "checkbox", "formControlName", "marketNews"], [1, "profile-card", "settings-card", "security-form", 3, "ngSubmit", "formGroup"], [1, "input-action"], ["type", "password", "formControlName", "currentPassword", "autocomplete", "current-password"], ["type", "button", 1, "quiet-action", 3, "click", "disabled"], ["type", "text", "formControlName", "otpToken", "inputmode", "numeric", "autocomplete", "one-time-code"], ["type", "password", "formControlName", "newPassword", "autocomplete", "new-password"], ["type", "password", "formControlName", "confirmNewPassword", "autocomplete", "new-password"], [1, "error-message", "span-2"], [1, "wallet-summary"], [1, "wallet-actions"], [1, "section-heading", "history-heading"], ["type", "button", 1, "text-action"], [1, "transaction-list"], ["type", "button", 1, "text-action", 3, "click"], [1, "score-value"], [1, "score-value", "score-unavailable"]], template: function ProfileComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 2)(1, "div", 3);
            i0.ɵɵconditionalCreate(2, ProfileComponent_Conditional_2_Template, 5, 3, "section", 4)(3, ProfileComponent_Conditional_3_Template, 11, 7, "section", 4)(4, ProfileComponent_Conditional_4_Template, 57, 63);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵattribute("dir", ctx.isRtl() ? "rtl" : "ltr");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isLoading() && !ctx.profileService.profile() ? 2 : ctx.errorMessage() && !ctx.profileService.profile() ? 3 : (tmp_1_0 = ctx.profileService.profile()) ? 4 : -1, tmp_1_0);
        } }, dependencies: [CommonModule, ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.CheckboxControlValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, RouterLink, TranslatePipe], styles: ["[_nghost-%COMP%] { display: block; }\n.user-profile-page[_ngcontent-%COMP%] { --color-background:var(--investa-bg); --color-surface:var(--investa-surface); --color-surface-muted:var(--investa-surface-soft); --color-border:var(--investa-border); --color-text-primary:var(--investa-text-primary); --color-text-secondary:var(--investa-text-secondary); min-height: 100%; padding: 24px; background: var(--color-background, #f5f6f3); color: var(--color-text-primary, #20231f); }\n.profile-shell[_ngcontent-%COMP%] { max-width: 1180px; margin: 0 auto; }\n.profile-card[_ngcontent-%COMP%] { background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; box-shadow: 0 12px 32px rgb(20 24 20 / 5%); }\n.profile-header[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 20px; padding: 22px; }\n.avatar-wrap[_ngcontent-%COMP%] { position: relative; width: 88px; height: 88px; flex: 0 0 88px; padding: 0; border-radius: 22px; overflow: hidden; display: grid; place-items: center; background: #dff3e5; color: #185c35; font-size: 26px; font-weight: 800; border: 1px solid #b8dfc4; cursor: pointer; }\n.avatar-wrap[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\n.avatar-loading[_ngcontent-%COMP%] { position: absolute; inset: 0; margin: auto; border-color: rgb(255 255 255 / 45%); border-top-color: #fff; }\n.identity-block[_ngcontent-%COMP%] { min-width: 0; flex: 1; }\n.identity-title[_ngcontent-%COMP%] { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }\nh1[_ngcontent-%COMP%] { margin: 0; font-size: clamp(24px, 3vw, 34px); line-height: 1.15; letter-spacing: -.03em; }\n.role-line[_ngcontent-%COMP%] { margin: 7px 0 0; color: var(--color-text-secondary, #667067); font-size: 14px; }\n.header-meta[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-top: 15px; color: var(--color-text-secondary, #667067); font-size: 13px; }\n.header-actions[_ngcontent-%COMP%] { flex: 0 0 auto; }\n.primary-action[_ngcontent-%COMP%], .quiet-action[_ngcontent-%COMP%], .photo-action[_ngcontent-%COMP%] { min-height: 40px; border-radius: 11px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; font: inherit; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }\n.primary-action[_ngcontent-%COMP%] { background: #242824; color: #fff; }.primary-action[_ngcontent-%COMP%]:hover { background: #111411; }\n.quiet-action[_ngcontent-%COMP%], .photo-action[_ngcontent-%COMP%] { background: var(--color-surface, #fff); color: var(--color-text-primary, #20231f); border-color: var(--color-border, #dde1da); }\nbutton[_ngcontent-%COMP%]:disabled { cursor: not-allowed; opacity: .55; }\n.status-badge[_ngcontent-%COMP%], .count-badge[_ngcontent-%COMP%] { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 700; background: var(--color-surface-muted, #eef0ec); color: var(--color-text-secondary, #596159); border: 1px solid var(--color-border, #dde1da); }\n.status-badge--green[_ngcontent-%COMP%] { background: #e7f6eb; color: #176838; border-color: #bde4c8; }\n.stats-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0; }\n.profile-tabs[_ngcontent-%COMP%] { display: flex; gap: 4px; margin-top: 14px; padding: 6px; overflow-x: auto; scrollbar-width: thin; }\n.profile-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { flex: 0 0 auto; min-height: 38px; padding: 0 13px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--color-text-secondary, #667067); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }\n.profile-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { color: var(--color-text-primary, #20231f); background: var(--color-surface-muted, #eef0ec); }\n.profile-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { color: #176838; background: #e7f6eb; border-color: #bde4c8; }\n.tab-panel[_ngcontent-%COMP%] { margin-top: 14px; }\n.error-banner[_ngcontent-%COMP%] { margin: 14px 0 0; padding: 11px 14px; border: 1px solid #e8bcbc; border-radius: 12px; background: #f9e8e8; color: #8c2525; font-size: 13px; }\n.stat-card[_ngcontent-%COMP%] { padding: 16px 18px; }.stat-card[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; color: var(--color-text-secondary, #667067); font-size: 12px; }.stat-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-top: 5px; font-size: 22px; font-variant-numeric: tabular-nums; }.stat-card[_ngcontent-%COMP%]   .date-stat[_ngcontent-%COMP%] { font-size: 16px; line-height: 1.65; }\n.content-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .72fr); gap: 14px; align-items: start; }\n.main-column[_ngcontent-%COMP%] { display: grid; gap: 14px; }.section-card[_ngcontent-%COMP%], .edit-card[_ngcontent-%COMP%] { padding: 20px; }\n.section-heading[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }.section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 2px 0 0; font-size: 17px; letter-spacing: -.015em; }.eyebrow[_ngcontent-%COMP%] { color: #27834c; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\n.bio-copy[_ngcontent-%COMP%], .empty-copy[_ngcontent-%COMP%] { margin: 0; color: var(--color-text-secondary, #667067); font-size: 14px; line-height: 1.75; white-space: pre-line; }\n.detail-grid[_ngcontent-%COMP%] { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }.detail-grid[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { min-width: 0; }.detail-grid[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { color: var(--color-text-secondary, #667067); font-size: 11px; margin-bottom: 5px; }.detail-grid[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0; font-size: 14px; overflow-wrap: anywhere; }.detail-grid[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: #187642; }\n.owner-section[_ngcontent-%COMP%] { border-inline-start: 3px solid #61ad78; }\n.activity-grid[_ngcontent-%COMP%] { align-items: start; }.activity-grid[_ngcontent-%COMP%]   .section-card[_ngcontent-%COMP%] { padding: 16px; }.activity-grid[_ngcontent-%COMP%]   .section-heading[_ngcontent-%COMP%] { margin-bottom: 11px; }.section-actions[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 10px; }.section-actions[_ngcontent-%COMP%]   .text-action[_ngcontent-%COMP%] { text-decoration: none; }.compact-empty[_ngcontent-%COMP%] { padding: 18px; text-align: center; }\n.activity-list[_ngcontent-%COMP%] { display: grid; gap: 8px; }.activity-list[_ngcontent-%COMP%]   a[_ngcontent-%COMP%], .activity-row[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; border: 1px solid var(--color-border, #dde1da); border-radius: 12px; color: inherit; text-decoration: none; }.activity-list[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover { border-color: #6caf7e; }.activity-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 650; }.activity-list[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { flex: 0 0 auto; color: #27834c; font-size: 11px; }\n.edit-card[_ngcontent-%COMP%] { margin-top: 0; }.form-section[_ngcontent-%COMP%] { padding: 18px 0; border-top: 1px solid var(--color-border, #dde1da); }.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 14px; font-size: 14px; }.form-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.form-grid[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: block; color: var(--color-text-secondary, #667067); font-size: 12px; font-weight: 650; }.form-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .form-grid[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], .form-grid[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { width: 100%; box-sizing: border-box; margin-top: 7px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border, #dde1da); background: var(--color-background, #f5f6f3); color: var(--color-text-primary, #20231f); font: inherit; outline: none; }.form-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, .form-grid[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus, .form-grid[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus { border-color: #55a66e; box-shadow: 0 0 0 3px rgb(58 145 86 / 12%); }.form-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:disabled { opacity: .7; }.span-2[_ngcontent-%COMP%] { grid-column: 1 / -1; }.form-actions[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid var(--color-border, #dde1da); }\n.file-field[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--color-text-secondary, #667067); font-size: 12px; font-weight: 650; }.file-field[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { flex-basis: 100%; }.file-field[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.file-list[_ngcontent-%COMP%] { display: grid; gap: 8px; }.file-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px; border: 1px solid var(--color-border); border-radius: 10px; }.file-list[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: #187642; }\n.settings-card[_ngcontent-%COMP%] { padding: 20px; }.settings-card[_ngcontent-%COMP%]   .section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .score-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .score-card[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { margin: 5px 0 0; color: var(--color-text-secondary); font-size: 13px; }.settings-group[_ngcontent-%COMP%] { padding: 16px 0; border-top: 1px solid var(--color-border); }.settings-group[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], .history-heading[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 10px; font-size: 13px; }.choice-row[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 8px; }.choice-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-height: 38px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-background); color: var(--color-text-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }.choice-row[_ngcontent-%COMP%]   button.selected[_ngcontent-%COMP%] { background: #e7f6eb; color: #176838; border-color: #78bd8d; }\n.toggle-row[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 15px 0; border-top: 1px solid var(--color-border); color: var(--color-text-primary); font-size: 13px; cursor: pointer; }.toggle-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: grid; gap: 4px; }.toggle-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--color-text-secondary); font-weight: 400; }.toggle-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: 42px; height: 22px; accent-color: #27834c; flex: 0 0 auto; }.inline-link[_ngcontent-%COMP%] { margin-top: 16px; }.input-action[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: end; }.input-action[_ngcontent-%COMP%]   .quiet-action[_ngcontent-%COMP%] { margin-top: 7px; }\n.wallet-summary[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px; border-radius: 14px; background: var(--color-surface-muted); }.wallet-summary[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; color: var(--color-text-secondary); font-size: 12px; }.wallet-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-top: 4px; font-size: 28px; font-variant-numeric: tabular-nums; }.wallet-actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 8px; }.history-heading[_ngcontent-%COMP%] { margin-top: 22px; }.text-action[_ngcontent-%COMP%] { border: 0; background: transparent; color: #187642; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }.transaction-list[_ngcontent-%COMP%] { display: grid; gap: 8px; }.transaction-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 11px 12px; border: 1px solid var(--color-border); border-radius: 11px; }.transaction-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { display: grid; gap: 3px; }.transaction-list[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 12px; }.transaction-list[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--color-text-secondary); }.transaction-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: #8c2525; font-weight: 800; font-variant-numeric: tabular-nums; }.transaction-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]    > span.positive[_ngcontent-%COMP%] { color: #187642; }.score-card[_ngcontent-%COMP%] { text-align: center; }.score-card[_ngcontent-%COMP%]   .section-heading[_ngcontent-%COMP%] { text-align: start; }.score-value[_ngcontent-%COMP%] { display: block; margin: 20px 0 10px; color: #27834c; font-size: clamp(38px, 8vw, 64px); font-variant-numeric: tabular-nums; }.score-unavailable[_ngcontent-%COMP%] { color: var(--color-text-secondary); font-size: 30px; }\n.state-card[_ngcontent-%COMP%] { min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; }.state-card[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }.state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { color: var(--color-text-secondary, #667067); }.state-icon[_ngcontent-%COMP%] { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #f9e8e8; color: #9c2727; font-weight: 800; }.profile-spinner[_ngcontent-%COMP%] { width: 28px; height: 28px; border: 3px solid var(--color-border, #dde1da); border-top-color: #23824b; border-radius: 50%; animation: _ngcontent-%COMP%_spin .75s linear infinite; }.error-message[_ngcontent-%COMP%] { color: #a52727; font-size: 13px; }\n[dir='rtl'][_ngcontent-%COMP%]   .profile-header[_ngcontent-%COMP%], [dir='rtl'][_ngcontent-%COMP%]   .identity-title[_ngcontent-%COMP%] { text-align: right; }\n@media (prefers-color-scheme: dark) { .status-badge--green[_ngcontent-%COMP%], .avatar-wrap[_ngcontent-%COMP%], .profile-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%], .choice-row[_ngcontent-%COMP%]   button.selected[_ngcontent-%COMP%] { background: rgb(35 130 75 / 16%); color: #75d69c; border-color: rgb(80 175 116 / 35%); } }\nbody.investa-theme-dark[_nghost-%COMP%]   .status-badge--green[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .status-badge--green[_ngcontent-%COMP%], \nbody.investa-theme-dark[_nghost-%COMP%]   .avatar-wrap[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .avatar-wrap[_ngcontent-%COMP%], \nbody.investa-theme-dark[_nghost-%COMP%]   .profile-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .profile-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%], \nbody.investa-theme-dark[_nghost-%COMP%]   .choice-row[_ngcontent-%COMP%]   button.selected[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .choice-row[_ngcontent-%COMP%]   button.selected[_ngcontent-%COMP%] { background: rgb(35 130 75 / 16%); color: #75d69c; border-color: rgb(80 175 116 / 35%); }\n.form-grid[_ngcontent-%COMP%]   input[type='date'][_ngcontent-%COMP%], .form-grid[_ngcontent-%COMP%]   input[inputmode='numeric'][_ngcontent-%COMP%], .transaction-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%], .wallet-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .score-value[_ngcontent-%COMP%] { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }\n@media (max-width: 820px) { .user-profile-page[_ngcontent-%COMP%] { padding: 14px; }.content-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }.stats-grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, 1fr); } }\n@media (max-width: 560px) { .profile-header[_ngcontent-%COMP%] { align-items: flex-start; padding: 17px; }.avatar-wrap[_ngcontent-%COMP%] { width: 64px; height: 64px; flex-basis: 64px; border-radius: 17px; font-size: 20px; }.identity-title[_ngcontent-%COMP%] { display: block; }.identity-title[_ngcontent-%COMP%]    > .primary-action[_ngcontent-%COMP%] { margin-top: 12px; }.detail-grid[_ngcontent-%COMP%], .form-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }.span-2[_ngcontent-%COMP%] { grid-column: auto; }.section-card[_ngcontent-%COMP%], .edit-card[_ngcontent-%COMP%], .settings-card[_ngcontent-%COMP%] { padding: 17px; }.wallet-summary[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; }.input-action[_ngcontent-%COMP%] { grid-template-columns: 1fr; }.input-action[_ngcontent-%COMP%]   .quiet-action[_ngcontent-%COMP%] { margin-top: 0; }.profile-tabs[_ngcontent-%COMP%] { margin-inline: -2px; }.profile-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding-inline: 11px; } }\n@keyframes _ngcontent-%COMP%_spin { to { transform: rotate(360deg); } }"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProfileComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-profile', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe], template: "<main class=\"user-profile-page\" [attr.dir]=\"isRtl() ? 'rtl' : 'ltr'\">\n  <div class=\"profile-shell\">\n    @if (isLoading() && !profileService.profile()) {\n      <section class=\"state-card\"><span class=\"profile-spinner\" aria-hidden=\"true\"></span><p>{{ 'userProfile.loading' | translate }}</p></section>\n    } @else if (errorMessage() && !profileService.profile()) {\n      <section class=\"state-card\"><div class=\"state-icon\">!</div><h1>{{ 'profile.loadErrorTitle' | translate }}</h1><p>{{ errorMessage() }}</p><button type=\"button\" class=\"primary-action\" (click)=\"loadProfile()\">{{ 'profile.buttons.retry' | translate }}</button></section>\n    } @else if (profileService.profile(); as person) {\n      <header class=\"profile-header profile-card\">\n        <button type=\"button\" class=\"avatar-wrap\" (click)=\"onAvatarClick()\" [attr.aria-label]=\"'profile.changePhoto' | translate\">\n          @if (avatarUrl()) { <img [src]=\"avatarUrl()\" [alt]=\"'profile.avatarAlt' | translate\"> }\n          @else { <span aria-hidden=\"true\">{{ avatarInitials() }}</span> }\n          @if (isUploadingAvatar()) { <span class=\"avatar-loading profile-spinner\" aria-hidden=\"true\"></span> }\n        </button>\n        <input #avatarInput type=\"file\" accept=\"image/jpeg,image/png,image/webp,image/gif\" hidden (change)=\"onAvatarFileSelected($event)\">\n        <div class=\"identity-block\">\n          <div class=\"identity-title\">\n            <div>\n              <h1>{{ fullName() || ('userProfile.member' | translate) }}</h1>\n              <p class=\"role-line\">{{ roleLabel() }} @if (person.basicInfo?.jobTitle) { <span>\u00B7 {{ person.basicInfo?.jobTitle }}</span> }</p>\n            </div>\n            <button type=\"button\" class=\"primary-action\" (click)=\"selectSection('personal'); editMode.set(true)\">{{ 'userProfile.editProfile' | translate }}</button>\n          </div>\n          <div class=\"header-meta\">\n            @if (person.basicInfo?.companyName) { <span>{{ person.basicInfo?.companyName }}</span> }\n            @if (person.contactInfo?.city || person.basicInfo?.country) { <span>{{ person.contactInfo?.city }}@if (person.contactInfo?.city && person.basicInfo?.country) {, }{{ person.basicInfo?.country }}</span> }\n            <span class=\"status-badge status-badge--green\">{{ verificationLabel() }}</span>\n          </div>\n        </div>\n      </header>\n\n      <nav class=\"profile-tabs profile-card\" role=\"tablist\" [attr.aria-label]=\"'profile.ownerSettings' | translate\">\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'personal'\" [class.active]=\"activeSection() === 'personal'\" (click)=\"selectSection('personal')\">{{ 'profile.tabs.editProfile' | translate }}</button>\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'investment'\" [class.active]=\"activeSection() === 'investment'\" (click)=\"selectSection('investment')\">{{ 'profile.tabs.investment' | translate }}</button>\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'personalization'\" [class.active]=\"activeSection() === 'personalization'\" (click)=\"selectSection('personalization')\">{{ 'profile.tabs.personalization' | translate }}</button>\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'notifications'\" [class.active]=\"activeSection() === 'notifications'\" (click)=\"selectSection('notifications')\">{{ 'profile.tabs.notifications' | translate }}</button>\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'security'\" [class.active]=\"activeSection() === 'security'\" (click)=\"selectSection('security')\">{{ 'profile.tabs.security' | translate }}</button>\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'credit'\" [class.active]=\"activeSection() === 'credit'\" (click)=\"selectSection('credit')\">{{ 'profile.tabs.credit' | translate }}</button>\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"activeSection() === 'score'\" [class.active]=\"activeSection() === 'score'\" (click)=\"selectSection('score')\">{{ 'profile.tabs.score' | translate }}</button>\n      </nav>\n\n      @if (errorMessage()) { <p class=\"error-banner\">{{ errorMessage() }}</p> }\n\n      <section class=\"tab-panel\" role=\"tabpanel\">\n        @switch (activeSection()) {\n          @case ('personal') {\n            @if (!editMode()) {\n              <section class=\"stats-grid\">\n                <article class=\"stat-card profile-card\"><span>{{ 'userProfile.stats.opportunities' | translate }}</span><strong>{{ westernNumber(myOpportunities().length) }}</strong></article>\n                <article class=\"stat-card profile-card\"><span>{{ 'userProfile.stats.participations' | translate }}</span><strong>{{ westernNumber(myParticipations().length) }}</strong></article>\n                <article class=\"stat-card profile-card\"><span>{{ 'userProfile.stats.credibility' | translate }}</span><strong>{{ westernNumber(reputationScore()) }}</strong></article>\n                <article class=\"stat-card profile-card\"><span>{{ 'userProfile.fields.memberSince' | translate }}</span><strong class=\"date-stat\">{{ westernDate(person.createdAt) || ('userProfile.notAvailable' | translate) }}</strong></article>\n              </section>\n              <div class=\"content-grid\">\n                <div class=\"main-column\">\n                  @if (person.basicInfo?.bio) { <section class=\"profile-card section-card\"><div class=\"section-heading\"><h2>{{ 'userProfile.sections.about' | translate }}</h2></div><p class=\"bio-copy\">{{ person.basicInfo?.bio }}</p></section> }\n                  <section class=\"profile-card section-card owner-section\">\n                    <div class=\"section-heading\"><div><span class=\"eyebrow\">{{ 'userProfile.ownerOnly' | translate }}</span><h2>{{ 'userProfile.sections.contact' | translate }}</h2></div></div>\n                    <dl class=\"detail-grid\">\n                      @if (person.contactInfo?.email) { <div><dt>{{ 'profile.communication.email' | translate }}</dt><dd>{{ person.contactInfo?.email }}</dd></div> }\n                      @if (person.contactInfo?.phone1) { <div><dt>{{ 'profile.communication.mobile' | translate }}</dt><dd dir=\"ltr\">{{ person.contactInfo?.phone1 }}</dd></div> }\n                      @if (person.contactInfo?.city) { <div><dt>{{ 'profile.communication.city' | translate }}</dt><dd>{{ person.contactInfo?.city }}</dd></div> }\n                      @if (person.contactInfo?.address) { <div><dt>{{ 'profile.communication.address' | translate }}</dt><dd>{{ person.contactInfo?.address }}</dd></div> }\n                    </dl>\n                  </section>\n                </div>\n                <aside class=\"main-column\">\n                  <section class=\"profile-card section-card\"><div class=\"section-heading\"><h2>{{ 'userProfile.sections.professional' | translate }}</h2></div>\n                    <dl class=\"detail-grid\">\n                      @if (person.basicInfo?.jobTitle) { <div><dt>{{ 'userProfile.fields.jobTitle' | translate }}</dt><dd>{{ person.basicInfo?.jobTitle }}</dd></div> }\n                      @if (person.basicInfo?.companyName) { <div><dt>{{ 'userProfile.fields.company' | translate }}</dt><dd>{{ person.basicInfo?.companyName }}</dd></div> }\n                      @if (person.basicInfo?.websiteUrl) { <div><dt>{{ 'userProfile.fields.website' | translate }}</dt><dd><a [href]=\"person.basicInfo?.websiteUrl\" target=\"_blank\" rel=\"noopener noreferrer\">{{ person.basicInfo?.websiteUrl }}</a></dd></div> }\n                      @if (person.contactInfo?.linkedInUrl) { <div><dt>{{ 'userProfile.fields.linkedin' | translate }}</dt><dd><a [href]=\"person.contactInfo?.linkedInUrl\" target=\"_blank\" rel=\"noopener noreferrer\">{{ 'userProfile.openLinkedIn' | translate }}</a></dd></div> }\n                    </dl>\n                  </section>\n                </aside>\n              </div>\n            } @else {\n              <form class=\"profile-card edit-card\" [formGroup]=\"profileForm\" (ngSubmit)=\"onProfileSubmit()\">\n                <div class=\"section-heading\"><div><span class=\"eyebrow\">{{ 'userProfile.ownerOnly' | translate }}</span><h2>{{ 'profile.personalInfo.title' | translate }}</h2></div><button type=\"button\" class=\"photo-action\" (click)=\"onAvatarClick()\">{{ 'profile.changePhoto' | translate }}</button></div>\n                <div class=\"form-section\"><div class=\"form-grid\">\n                  <label>{{ 'profile.personalInfo.firstName' | translate }}<input formControlName=\"firstName\" autocomplete=\"given-name\"></label>\n                  <label>{{ 'profile.personalInfo.lastName' | translate }}<input formControlName=\"lastName\" autocomplete=\"family-name\"></label>\n                  <label>{{ 'profile.personalInfo.dateOfBirth' | translate }}<input type=\"date\" formControlName=\"dateOfBirth\"></label>\n                  <label>{{ 'profile.personalInfo.gender' | translate }}<select formControlName=\"gender\"><option value=\"\">{{ 'profile.personalInfo.genderSelect' | translate }}</option><option value=\"M\">{{ 'profile.personalInfo.male' | translate }}</option><option value=\"F\">{{ 'profile.personalInfo.female' | translate }}</option></select></label>\n                  <label>{{ 'profile.personalInfo.nationality' | translate }}<select formControlName=\"nationality\"><option value=\"\">{{ 'profile.personalInfo.nationalitySelect' | translate }}</option>@for (country of nationalityOptions; track country.code) { <option [value]=\"country.code\">{{ country.key | translate }}</option> }</select></label>\n                  <label>{{ 'profile.personalInfo.country' | translate }}<select formControlName=\"country\"><option value=\"\">{{ 'profile.personalInfo.countrySelect' | translate }}</option>@for (country of nationalityOptions; track country.code) { <option [value]=\"country.code\">{{ country.key | translate }}</option> }</select></label>\n                  <label class=\"span-2\">{{ 'profile.personalInfo.bio' | translate }}<textarea rows=\"4\" formControlName=\"bio\"></textarea></label>\n                </div></div>\n\n                <div class=\"form-section identity-section\"><h3>{{ 'profile.identityDocuments' | translate }}</h3><div class=\"form-grid\">\n                  <label>{{ 'profile.personalInfo.nationalId' | translate }}<input formControlName=\"nationalId\" inputmode=\"numeric\"></label>\n                  <div class=\"file-field\"><span>{{ 'profile.personalInfo.uploadId' | translate }}</span><button type=\"button\" class=\"quiet-action\" (click)=\"triggerNationalIdSelect()\">{{ 'profile.personalInfo.chooseFile' | translate }}</button><small>{{ nationalIdFileName() || ('profile.personalInfo.noFileChosen' | translate) }}</small><input #nationalIdInput type=\"file\" accept=\"image/*,.pdf\" hidden multiple (change)=\"onFileChange($event)\"></div>\n                  @if (nationalIdFiles().length) { <div class=\"file-list span-2\">@for (file of nationalIdFiles(); track file.fileName; let index = $index) { <article><a [href]=\"file.url\" target=\"_blank\" rel=\"noopener noreferrer\">{{ file.fileName }}</a><button type=\"button\" class=\"quiet-action\" (click)=\"triggerNationalIdSelect(index)\">{{ 'profile.personalInfo.replaceFile' | translate }}</button></article> }</div> }\n                </div></div>\n\n                <div class=\"form-section\" [formGroup]=\"communicationForm\"><h3>{{ 'profile.communication.title' | translate }}</h3><div class=\"form-grid\">\n                  <label>{{ 'profile.communication.email' | translate }}<input type=\"email\" formControlName=\"email\" autocomplete=\"email\"></label>\n                  <label>{{ 'profile.communication.mobile' | translate }}<input formControlName=\"mobile\" autocomplete=\"tel\"></label>\n                  <label>{{ 'profile.communication.address' | translate }}<input formControlName=\"address\" autocomplete=\"street-address\"></label>\n                  <label>{{ 'profile.communication.city' | translate }}<input formControlName=\"city\" autocomplete=\"address-level2\"></label>\n                  <label>{{ 'profile.communication.state' | translate }}<input formControlName=\"state\" autocomplete=\"address-level1\"></label>\n                  <label>{{ 'profile.communication.businessAddress' | translate }}<input formControlName=\"businessAddress\"></label>\n                </div></div>\n\n                <div class=\"form-section\"><h3>{{ 'profile.company.title' | translate }}</h3><div class=\"form-grid\">\n                  <label>{{ 'profile.company.name' | translate }}<input formControlName=\"companyName\"></label>\n                  <label>{{ 'profile.personalInfo.businessRole' | translate }}<input formControlName=\"jobTitle\"></label>\n                  <label>{{ 'profile.company.email' | translate }}<input type=\"email\" formControlName=\"companyEmail\"></label>\n                  <label>{{ 'profile.company.address' | translate }}<input formControlName=\"companyAddress\"></label>\n                  <label>{{ 'userProfile.fields.website' | translate }}<input type=\"url\" formControlName=\"websiteUrl\" inputmode=\"url\"></label>\n                  <div class=\"file-field\"><span>{{ 'profile.company.hrLetter' | translate }}</span><label class=\"quiet-action\" for=\"hrLetterCopy\">{{ 'profile.personalInfo.chooseFile' | translate }}</label><input id=\"hrLetterCopy\" type=\"file\" hidden (change)=\"onHrLetterChange($event)\"><small>{{ hrLetterFileName() || ('profile.personalInfo.noFileChosen' | translate) }}</small></div>\n                  <label>{{ 'profile.personalInfo.linkedin' | translate }}<input type=\"url\" formControlName=\"linkedinUrl\" inputmode=\"url\"></label>\n                  <label>{{ 'profile.personalInfo.facebook' | translate }}<input type=\"url\" formControlName=\"facebookUrl\" inputmode=\"url\"></label>\n                </div></div>\n                <footer class=\"form-actions\"><button type=\"button\" class=\"quiet-action\" (click)=\"cancelEdit()\">{{ 'common.cancel' | translate }}</button><button type=\"submit\" class=\"primary-action\" [disabled]=\"isLoading() || profileForm.invalid || (!isProfileChanged() && !isCommunicationChanged())\">{{ isLoading() ? ('profile.notifications.saving' | translate) : ('profile.saveButton' | translate) }}</button></footer>\n              </form>\n            }\n          }\n\n          @case ('investment') {\n            @if (myOpportunities().length || myParticipations().length) {\n              <div class=\"content-grid activity-grid\">\n                @if (myOpportunities().length) {\n                  <section class=\"profile-card section-card\"><div class=\"section-heading\"><h2>{{ 'userProfile.sections.opportunities' | translate }}</h2><span class=\"count-badge\">{{ westernNumber(myOpportunities().length) }}</span></div>\n                    <div class=\"activity-list\">@for (item of limitedOpportunities(); track item.id) { <a [routerLink]=\"['/admin/investments', item.id]\"><span>{{ item.title || ('userProfile.opportunity' | translate) }}</span><small>{{ enumLabel('opportunityStatus', item.status, 'unknown') }}</small></a> }</div>\n                  </section>\n                }\n                @if (myParticipations().length) {\n                  <section class=\"profile-card section-card owner-section\"><div class=\"section-heading\"><div><span class=\"eyebrow\">{{ 'userProfile.ownerOnly' | translate }}</span><h2>{{ 'userProfile.sections.participation' | translate }}</h2></div><div class=\"section-actions\"><span class=\"count-badge\">{{ westernNumber(myParticipations().length) }}</span><a class=\"text-action\" routerLink=\"/admin/my-projects\">{{ 'profile.viewAllParticipations' | translate }}</a></div></div>\n                    <div class=\"activity-list\">@for (item of limitedParticipations(); track item.id) { @if (item.opportunityId) { <a [routerLink]=\"['/admin/investments', item.opportunityId]\"><span>{{ item.opportunityTitle || ('userProfile.opportunity' | translate) }}</span><small>{{ enumLabel('participationStatus', item.participationStatus, 'unknown') }}</small></a> } @else { <div class=\"activity-row\"><span>{{ item.opportunityTitle || ('userProfile.opportunity' | translate) }}</span><small>{{ enumLabel('participationStatus', item.participationStatus, 'unknown') }}</small></div> } }</div>\n                  </section>\n                }\n              </div>\n            } @else {\n              <section class=\"profile-card section-card compact-empty\"><p class=\"empty-copy\">{{ 'profile.activityEmpty' | translate }}</p></section>\n            }\n          }\n\n          @case ('personalization') {\n            <section class=\"profile-card settings-card\"><div class=\"section-heading\"><div><span class=\"eyebrow\">{{ 'userProfile.ownerOnly' | translate }}</span><h2>{{ 'settings.personalization.title' | translate }}</h2></div></div>\n              <div class=\"settings-group\"><h3>{{ 'settings.appearance.theme.label' | translate }}</h3><div class=\"choice-row\">@for (option of themeOptions; track option) { <button type=\"button\" [class.selected]=\"settings().theme === option\" (click)=\"setTheme(option)\">{{ ('settings.appearance.theme.options.' + option) | translate }}</button> }</div></div>\n              <div class=\"settings-group\"><h3>{{ 'settings.personalization.dashboardDensity.label' | translate }}</h3><div class=\"choice-row\">@for (option of densityOptions; track option) { <button type=\"button\" [class.selected]=\"settings().personalization.dashboardDensity === option\" (click)=\"setPersonalization({ dashboardDensity: option })\">{{ ('settings.personalization.dashboardDensity.options.' + option) | translate }}</button> }</div></div>\n              <div class=\"settings-group\"><h3>{{ 'settings.personalization.defaultInvestmentType.label' | translate }}</h3><div class=\"choice-row\">@for (option of investmentTypeOptions; track option) { <button type=\"button\" [class.selected]=\"settings().personalization.defaultInvestmentType === option\" (click)=\"setPersonalization({ defaultInvestmentType: option })\">{{ ('settings.personalization.defaultInvestmentType.options.' + option) | translate }}</button> }</div></div>\n              <label class=\"toggle-row\"><span>{{ 'settings.personalization.showRiskIndicators' | translate }}</span><input type=\"checkbox\" [checked]=\"settings().personalization.showRiskIndicators\" (change)=\"setPersonalization({ showRiskIndicators: !settings().personalization.showRiskIndicators })\"></label>\n              <a class=\"quiet-action inline-link\" routerLink=\"/admin/settings\">{{ 'profile.openAllSettings' | translate }}</a>\n            </section>\n          }\n\n          @case ('notifications') {\n            <form class=\"profile-card settings-card\" [formGroup]=\"notificationSettingsForm\" (ngSubmit)=\"onNotificationSettingsSubmit()\"><div class=\"section-heading\"><div><h2>{{ 'profile.notifications.title' | translate }}</h2><p>{{ 'profile.notifications.subtitle' | translate }}</p></div><button type=\"button\" class=\"quiet-action\" (click)=\"navigateToNotificationCenter()\">{{ 'profile.openNotifications' | translate }}</button></div>\n              <label class=\"toggle-row\"><span><strong>{{ 'profile.notifications.opportunities.title' | translate }}</strong><small>{{ 'profile.notifications.opportunities.description' | translate }}</small></span><input type=\"checkbox\" formControlName=\"newOpportunities\"></label>\n              <label class=\"toggle-row\"><span><strong>{{ 'profile.notifications.portfolio.title' | translate }}</strong><small>{{ 'profile.notifications.portfolio.description' | translate }}</small></span><input type=\"checkbox\" formControlName=\"portfolioUpdates\"></label>\n              <label class=\"toggle-row\"><span><strong>{{ 'profile.notifications.security.title' | translate }}</strong><small>{{ 'profile.notifications.security.description' | translate }}</small></span><input type=\"checkbox\" formControlName=\"securityAlerts\"></label>\n              <label class=\"toggle-row\"><span><strong>{{ 'profile.notifications.news.title' | translate }}</strong><small>{{ 'profile.notifications.news.description' | translate }}</small></span><input type=\"checkbox\" formControlName=\"marketNews\"></label>\n              <footer class=\"form-actions\"><button type=\"submit\" class=\"primary-action\" [disabled]=\"notificationSettingsForm.pristine\">{{ 'profile.saveButton' | translate }}</button></footer>\n            </form>\n          }\n\n          @case ('security') {\n            <form class=\"profile-card settings-card security-form\" [formGroup]=\"passwordForm\" (ngSubmit)=\"onPasswordSubmit()\"><div class=\"section-heading\"><div><h2>{{ 'profile.password.title' | translate }}</h2><p>{{ 'profile.password.description' | translate }}</p></div></div>\n              <div class=\"form-grid\"><label class=\"span-2\">{{ 'profile.password.current' | translate }}<span class=\"input-action\"><input type=\"password\" formControlName=\"currentPassword\" autocomplete=\"current-password\"><button type=\"button\" class=\"quiet-action\" (click)=\"sendPasswordOtp()\" [disabled]=\"isLoading()\">{{ otpSent() ? ('profile.password.resendOtp' | translate) : ('profile.password.sendOtp' | translate) }}</button></span></label>\n                @if (otpSent()) { <label class=\"span-2\">{{ 'profile.password.otp' | translate }}<input type=\"text\" formControlName=\"otpToken\" inputmode=\"numeric\" autocomplete=\"one-time-code\"></label><label>{{ 'profile.password.new' | translate }}<input type=\"password\" formControlName=\"newPassword\" autocomplete=\"new-password\"></label><label>{{ 'profile.password.confirm' | translate }}<input type=\"password\" formControlName=\"confirmNewPassword\" autocomplete=\"new-password\"></label>@if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmNewPassword')?.touched) { <p class=\"error-message span-2\">{{ 'profile.password.mismatch' | translate }}</p> } }\n              </div>@if (otpSent()) { <footer class=\"form-actions\"><button type=\"submit\" class=\"primary-action\" [disabled]=\"passwordForm.invalid || isLoading()\">{{ 'profile.saveButton' | translate }}</button></footer> }\n            </form>\n          }\n\n          @case ('credit') {\n            <section class=\"profile-card settings-card\"><div class=\"section-heading\"><div><span class=\"eyebrow\">{{ 'userProfile.ownerOnly' | translate }}</span><h2>{{ 'profile.creditManagement.title' | translate }}</h2></div></div>\n              <div class=\"wallet-summary\"><div><span>{{ 'profile.credits.available' | translate }}</span><strong>{{ westernNumber(currentScorePts()) }}</strong></div><div class=\"wallet-actions\"><button type=\"button\" class=\"quiet-action\" (click)=\"navigateToWallet()\">{{ 'profile.viewWallet' | translate }}</button><button type=\"button\" class=\"primary-action\" (click)=\"navigateToChargeCredits()\">{{ 'profile.credits.chargeNow' | translate }}</button></div></div>\n              <div class=\"section-heading history-heading\"><h3>{{ 'profile.credibilityHistory' | translate }}</h3>@if (creditHistory().length) { <button type=\"button\" class=\"text-action\" (click)=\"viewAllTransactions()\">{{ 'profile.viewAll' | translate }}</button> }</div>\n              @if (!limitedCreditHistory().length) { <p class=\"empty-copy\">{{ 'wallet.transactions.empty' | translate }}</p> } @else { <div class=\"transaction-list\">@for (transaction of limitedCreditHistory(); track transaction.id) { <article><div><strong>{{ walletTransactionTitle(transaction) }}</strong><small>{{ westernDate(transaction.createdAt) }}</small></div><span [class.positive]=\"isWalletCredit(transaction)\">{{ signedWalletAmount(transaction) > 0 ? '+' : '' }}{{ westernNumber(signedWalletAmount(transaction)) }}</span></article> }</div> }\n            </section>\n          }\n\n          @case ('score') {\n            <section class=\"profile-card settings-card score-card\"><div class=\"section-heading\"><h2>{{ 'profile.score.title' | translate }}</h2></div>@if (reputationScore() !== null) { <strong class=\"score-value\">{{ westernNumber(reputationScore()) }}</strong> } @else { <strong class=\"score-value score-unavailable\">{{ 'profile.score.unavailable' | translate }}</strong> }<p>{{ 'profile.score.description' | translate }}</p><small>{{ 'profile.score.activityHelper' | translate }}</small></section>\n          }\n        }\n      </section>\n    }\n  </div>\n</main>\n", styles: [":host { display: block; }\n.user-profile-page { --color-background:var(--investa-bg); --color-surface:var(--investa-surface); --color-surface-muted:var(--investa-surface-soft); --color-border:var(--investa-border); --color-text-primary:var(--investa-text-primary); --color-text-secondary:var(--investa-text-secondary); min-height: 100%; padding: 24px; background: var(--color-background, #f5f6f3); color: var(--color-text-primary, #20231f); }\n.profile-shell { max-width: 1180px; margin: 0 auto; }\n.profile-card { background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; box-shadow: 0 12px 32px rgb(20 24 20 / 5%); }\n.profile-header { display: flex; align-items: center; gap: 20px; padding: 22px; }\n.avatar-wrap { position: relative; width: 88px; height: 88px; flex: 0 0 88px; padding: 0; border-radius: 22px; overflow: hidden; display: grid; place-items: center; background: #dff3e5; color: #185c35; font-size: 26px; font-weight: 800; border: 1px solid #b8dfc4; cursor: pointer; }\n.avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }\n.avatar-loading { position: absolute; inset: 0; margin: auto; border-color: rgb(255 255 255 / 45%); border-top-color: #fff; }\n.identity-block { min-width: 0; flex: 1; }\n.identity-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }\nh1 { margin: 0; font-size: clamp(24px, 3vw, 34px); line-height: 1.15; letter-spacing: -.03em; }\n.role-line { margin: 7px 0 0; color: var(--color-text-secondary, #667067); font-size: 14px; }\n.header-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-top: 15px; color: var(--color-text-secondary, #667067); font-size: 13px; }\n.header-actions { flex: 0 0 auto; }\n.primary-action, .quiet-action, .photo-action { min-height: 40px; border-radius: 11px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; font: inherit; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }\n.primary-action { background: #242824; color: #fff; }.primary-action:hover { background: #111411; }\n.quiet-action, .photo-action { background: var(--color-surface, #fff); color: var(--color-text-primary, #20231f); border-color: var(--color-border, #dde1da); }\nbutton:disabled { cursor: not-allowed; opacity: .55; }\n.status-badge, .count-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 700; background: var(--color-surface-muted, #eef0ec); color: var(--color-text-secondary, #596159); border: 1px solid var(--color-border, #dde1da); }\n.status-badge--green { background: #e7f6eb; color: #176838; border-color: #bde4c8; }\n.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0; }\n.profile-tabs { display: flex; gap: 4px; margin-top: 14px; padding: 6px; overflow-x: auto; scrollbar-width: thin; }\n.profile-tabs button { flex: 0 0 auto; min-height: 38px; padding: 0 13px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--color-text-secondary, #667067); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }\n.profile-tabs button:hover { color: var(--color-text-primary, #20231f); background: var(--color-surface-muted, #eef0ec); }\n.profile-tabs button.active { color: #176838; background: #e7f6eb; border-color: #bde4c8; }\n.tab-panel { margin-top: 14px; }\n.error-banner { margin: 14px 0 0; padding: 11px 14px; border: 1px solid #e8bcbc; border-radius: 12px; background: #f9e8e8; color: #8c2525; font-size: 13px; }\n.stat-card { padding: 16px 18px; }.stat-card span { display: block; color: var(--color-text-secondary, #667067); font-size: 12px; }.stat-card strong { display: block; margin-top: 5px; font-size: 22px; font-variant-numeric: tabular-nums; }.stat-card .date-stat { font-size: 16px; line-height: 1.65; }\n.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .72fr); gap: 14px; align-items: start; }\n.main-column { display: grid; gap: 14px; }.section-card, .edit-card { padding: 20px; }\n.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }.section-heading h2 { margin: 2px 0 0; font-size: 17px; letter-spacing: -.015em; }.eyebrow { color: #27834c; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\n.bio-copy, .empty-copy { margin: 0; color: var(--color-text-secondary, #667067); font-size: 14px; line-height: 1.75; white-space: pre-line; }\n.detail-grid { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }.detail-grid div { min-width: 0; }.detail-grid dt { color: var(--color-text-secondary, #667067); font-size: 11px; margin-bottom: 5px; }.detail-grid dd { margin: 0; font-size: 14px; overflow-wrap: anywhere; }.detail-grid a { color: #187642; }\n.owner-section { border-inline-start: 3px solid #61ad78; }\n.activity-grid { align-items: start; }.activity-grid .section-card { padding: 16px; }.activity-grid .section-heading { margin-bottom: 11px; }.section-actions { display: flex; align-items: center; gap: 10px; }.section-actions .text-action { text-decoration: none; }.compact-empty { padding: 18px; text-align: center; }\n.activity-list { display: grid; gap: 8px; }.activity-list a, .activity-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; border: 1px solid var(--color-border, #dde1da); border-radius: 12px; color: inherit; text-decoration: none; }.activity-list a:hover { border-color: #6caf7e; }.activity-list span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 650; }.activity-list small { flex: 0 0 auto; color: #27834c; font-size: 11px; }\n.edit-card { margin-top: 0; }.form-section { padding: 18px 0; border-top: 1px solid var(--color-border, #dde1da); }.form-section h3 { margin: 0 0 14px; font-size: 14px; }.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.form-grid label { display: block; color: var(--color-text-secondary, #667067); font-size: 12px; font-weight: 650; }.form-grid input, .form-grid textarea, .form-grid select { width: 100%; box-sizing: border-box; margin-top: 7px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border, #dde1da); background: var(--color-background, #f5f6f3); color: var(--color-text-primary, #20231f); font: inherit; outline: none; }.form-grid input:focus, .form-grid textarea:focus, .form-grid select:focus { border-color: #55a66e; box-shadow: 0 0 0 3px rgb(58 145 86 / 12%); }.form-grid input:disabled { opacity: .7; }.span-2 { grid-column: 1 / -1; }.form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid var(--color-border, #dde1da); }\n.file-field { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--color-text-secondary, #667067); font-size: 12px; font-weight: 650; }.file-field > span { flex-basis: 100%; }.file-field small { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.file-list { display: grid; gap: 8px; }.file-list article { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px; border: 1px solid var(--color-border); border-radius: 10px; }.file-list a { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: #187642; }\n.settings-card { padding: 20px; }.settings-card .section-heading p, .score-card p, .score-card small { margin: 5px 0 0; color: var(--color-text-secondary); font-size: 13px; }.settings-group { padding: 16px 0; border-top: 1px solid var(--color-border); }.settings-group h3, .history-heading h3 { margin: 0 0 10px; font-size: 13px; }.choice-row { display: flex; flex-wrap: wrap; gap: 8px; }.choice-row button { min-height: 38px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-background); color: var(--color-text-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }.choice-row button.selected { background: #e7f6eb; color: #176838; border-color: #78bd8d; }\n.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 15px 0; border-top: 1px solid var(--color-border); color: var(--color-text-primary); font-size: 13px; cursor: pointer; }.toggle-row span { display: grid; gap: 4px; }.toggle-row small { color: var(--color-text-secondary); font-weight: 400; }.toggle-row input { width: 42px; height: 22px; accent-color: #27834c; flex: 0 0 auto; }.inline-link { margin-top: 16px; }.input-action { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: end; }.input-action .quiet-action { margin-top: 7px; }\n.wallet-summary { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px; border-radius: 14px; background: var(--color-surface-muted); }.wallet-summary span { display: block; color: var(--color-text-secondary); font-size: 12px; }.wallet-summary strong { display: block; margin-top: 4px; font-size: 28px; font-variant-numeric: tabular-nums; }.wallet-actions { display: flex; flex-wrap: wrap; gap: 8px; }.history-heading { margin-top: 22px; }.text-action { border: 0; background: transparent; color: #187642; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }.transaction-list { display: grid; gap: 8px; }.transaction-list article { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 11px 12px; border: 1px solid var(--color-border); border-radius: 11px; }.transaction-list article div { display: grid; gap: 3px; }.transaction-list strong { font-size: 12px; }.transaction-list small { color: var(--color-text-secondary); }.transaction-list article > span { color: #8c2525; font-weight: 800; font-variant-numeric: tabular-nums; }.transaction-list article > span.positive { color: #187642; }.score-card { text-align: center; }.score-card .section-heading { text-align: start; }.score-value { display: block; margin: 20px 0 10px; color: #27834c; font-size: clamp(38px, 8vw, 64px); font-variant-numeric: tabular-nums; }.score-unavailable { color: var(--color-text-secondary); font-size: 30px; }\n.state-card { min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #dde1da); border-radius: 18px; }.state-card h1, .state-card p { margin: 0; }.state-card p { color: var(--color-text-secondary, #667067); }.state-icon { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #f9e8e8; color: #9c2727; font-weight: 800; }.profile-spinner { width: 28px; height: 28px; border: 3px solid var(--color-border, #dde1da); border-top-color: #23824b; border-radius: 50%; animation: spin .75s linear infinite; }.error-message { color: #a52727; font-size: 13px; }\n[dir='rtl'] .profile-header, [dir='rtl'] .identity-title { text-align: right; }\n@media (prefers-color-scheme: dark) { .status-badge--green, .avatar-wrap, .profile-tabs button.active, .choice-row button.selected { background: rgb(35 130 75 / 16%); color: #75d69c; border-color: rgb(80 175 116 / 35%); } }\n:host-context(body.investa-theme-dark) .status-badge--green,\n:host-context(body.investa-theme-dark) .avatar-wrap,\n:host-context(body.investa-theme-dark) .profile-tabs button.active,\n:host-context(body.investa-theme-dark) .choice-row button.selected { background: rgb(35 130 75 / 16%); color: #75d69c; border-color: rgb(80 175 116 / 35%); }\n.form-grid input[type='date'], .form-grid input[inputmode='numeric'], .transaction-list article > span, .wallet-summary strong, .score-value { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }\n@media (max-width: 820px) { .user-profile-page { padding: 14px; }.content-grid { grid-template-columns: 1fr; }.stats-grid { grid-template-columns: repeat(2, 1fr); } }\n@media (max-width: 560px) { .profile-header { align-items: flex-start; padding: 17px; }.avatar-wrap { width: 64px; height: 64px; flex-basis: 64px; border-radius: 17px; font-size: 20px; }.identity-title { display: block; }.identity-title > .primary-action { margin-top: 12px; }.detail-grid, .form-grid { grid-template-columns: 1fr; }.span-2 { grid-column: auto; }.section-card, .edit-card, .settings-card { padding: 17px; }.wallet-summary { align-items: flex-start; flex-direction: column; }.input-action { grid-template-columns: 1fr; }.input-action .quiet-action { margin-top: 0; }.profile-tabs { margin-inline: -2px; }.profile-tabs button { padding-inline: 11px; } }\n@keyframes spin { to { transform: rotate(360deg); } }\n"] }]
    }], () => [], { avatarInput: [{
            type: ViewChild,
            args: ['avatarInput']
        }], nationalIdInput: [{
            type: ViewChild,
            args: ['nationalIdInput']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProfileComponent, { className: "ProfileComponent", filePath: "src/app/pages/admin/profile/profile.component.ts", lineNumber: 40 }); })();
