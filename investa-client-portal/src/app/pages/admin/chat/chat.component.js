import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../../../config/api.token';
import { ParticipationBuilderComponent } from '../../../components/participation-builder/participation-builder.component';
import { WalletService } from '../../../services/wallet.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ReportService } from '../../../services/report.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = a0 => ["/admin/founders", a0];
const _c1 = a0 => ["/admin/investments", a0];
const _c2 = a0 => ["/admin/opportunities", a0, "room"];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.id || $item.legType;
function ChatComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "select", 22);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("change", function ChatComponent_Conditional_37_Template_select_change_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setConversationFilter($event.target.value)); });
    i0.ɵɵelementStart(2, "option", 23);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "option", 24);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 25);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("value", ctx_r1.conversationFilter());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 5, "conversationWorkspace.filter.label"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "conversationWorkspace.filter.all"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 9, "conversationWorkspace.filter.active"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 11, "conversationWorkspace.filter.closed"));
} }
function ChatComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵelement(1, "span", 26);
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "conversationWorkspace.loading"));
} }
function ChatComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 2);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_40_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadConversations()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.error());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "conversationWorkspace.retry"));
} }
function ChatComponent_Conditional_41_For_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 31);
} if (rf & 2) {
    const conversation_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", conversation_r5.avatarUrl, i0.ɵɵsanitizeUrl)("alt", conversation_r5.counterpartyName);
} }
function ChatComponent_Conditional_41_For_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r5.counterpartyName));
} }
function ChatComponent_Conditional_41_For_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r5.lastMessage);
} }
function ChatComponent_Conditional_41_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 28)(1, "button", 29);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_41_For_1_Template_button_click_1_listener() { const conversation_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectConversation(conversation_r5)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 30);
    i0.ɵɵconditionalCreate(3, ChatComponent_Conditional_41_For_1_Conditional_3_Template, 1, 2, "img", 31)(4, ChatComponent_Conditional_41_For_1_Conditional_4_Template, 2, 1, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 32)(6, "div", 33)(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "time");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "p", 34);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ChatComponent_Conditional_41_For_1_Conditional_13_Template, 2, 1, "p", 35);
    i0.ɵɵelementStart(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_11_0;
    const conversation_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ((tmp_11_0 = ctx_r1.activeConversation()) == null ? null : tmp_11_0.id) === conversation_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", conversation_r5.counterpartyName);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(conversation_r5.avatarUrl ? 3 : 4);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(conversation_r5.counterpartyName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatTime(conversation_r5.lastMessageAt));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r5.opportunityTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r5.lastMessage ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r1.statusBadgeClass(conversation_r5.status));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.statusLabel(conversation_r5.status));
} }
function ChatComponent_Conditional_41_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.empty.conversations"));
} }
function ChatComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ChatComponent_Conditional_41_For_1_Template, 16, 11, "article", 27, _forTrack0, false, ChatComponent_Conditional_41_ForEmpty_2_Template, 4, 3, "div", 15);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r1.visibleConversations());
} }
function ChatComponent_Conditional_42_For_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(request_r7.message);
} }
function ChatComponent_Conditional_42_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 28)(1, "button", 29);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_42_For_1_Template_button_click_1_listener() { const request_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectRequest(request_r7)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 30)(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 32)(6, "div", 33)(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "time");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "p", 34);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ChatComponent_Conditional_42_For_1_Conditional_13_Template, 2, 1, "p", 35);
    i0.ɵɵelementStart(14, "span", 36);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_11_0;
    const request_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ((tmp_11_0 = ctx_r1.selectedRequest()) == null ? null : tmp_11_0.id) === request_r7.id);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", request_r7.counterpartyName);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.initials(request_r7.counterpartyName));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(request_r7.counterpartyName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(request_r7.updatedAt || request_r7.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r7.opportunityTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r7.message ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("status-badge--success", request_r7.status === "accepted")("status-badge--closed", request_r7.status === "rejected" || request_r7.status === "withdrawn");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.requestStatusLabel(request_r7.status));
} }
function ChatComponent_Conditional_42_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.empty.requests"));
} }
function ChatComponent_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ChatComponent_Conditional_42_For_1_Template, 16, 13, "article", 27, _forTrack0, false, ChatComponent_Conditional_42_ForEmpty_2_Template, 4, 3, "div", 15);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r1.visibleRequests());
} }
function ChatComponent_Conditional_44_Conditional_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 31);
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", conversation_r9.avatarUrl, i0.ɵɵsanitizeUrl)("alt", conversation_r9.counterpartyName);
} }
function ChatComponent_Conditional_44_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r9.counterpartyName));
} }
function ChatComponent_Conditional_44_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 39);
    i0.ɵɵconditionalCreate(1, ChatComponent_Conditional_44_Conditional_2_Conditional_1_Template, 1, 2, "img", 31)(2, ChatComponent_Conditional_44_Conditional_2_Conditional_2_Template, 2, 1, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, ctx));
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r9.avatarUrl ? 1 : 2);
} }
function ChatComponent_Conditional_44_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 31);
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", conversation_r9.avatarUrl, i0.ɵɵsanitizeUrl)("alt", conversation_r9.counterpartyName);
} }
function ChatComponent_Conditional_44_Conditional_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r9.counterpartyName));
} }
function ChatComponent_Conditional_44_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵconditionalCreate(1, ChatComponent_Conditional_44_Conditional_3_Conditional_1_Template, 1, 2, "img", 31)(2, ChatComponent_Conditional_44_Conditional_3_Conditional_2_Template, 2, 1, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r9.avatarUrl ? 1 : 2);
} }
function ChatComponent_Conditional_44_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, ctx));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r9.counterpartyName);
} }
function ChatComponent_Conditional_44_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "strong", 42);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r9.counterpartyName);
} }
function ChatComponent_Conditional_44_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.roleLabel(conversation_r9.counterpartyRole));
} }
function ChatComponent_Conditional_44_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_13_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.markReadyToProceed()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.ready"));
} }
function ChatComponent_Conditional_44_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 46);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u2713 ", i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.status.youReady"));
} }
function ChatComponent_Conditional_44_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 2);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_20_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openOfferBuilder()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.makeOffer"));
} }
function ChatComponent_Conditional_44_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 2);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_21_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeDiscussion()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.close"));
} }
function ChatComponent_Conditional_44_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 2);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_22_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const conversation_r9 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openConversationReport(conversation_r9)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.conversationReportLabel(conversation_r9));
} }
function ChatComponent_Conditional_44_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_23_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r14); const conversation_r9 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.removeClosedConversation(conversation_r9)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.remove"));
} }
function ChatComponent_Conditional_44_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵelement(1, "span", 26);
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "conversationWorkspace.messages.loading"));
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_0_Conditional_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r15 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.roleLabel(item_r15.message.senderRole));
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_0_Conditional_1_Conditional_4_Template, 2, 1, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r15 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r15.message.isSender ? i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.messages.you") : item_r15.message.senderName);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r15.message.senderRole ? 4 : -1);
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 61);
    i0.ɵɵconditionalCreate(1, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_0_Conditional_1_Template, 5, 4, "div", 62);
    i0.ɵɵelementStart(2, "div", 63)(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "time");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r15 = i0.ɵɵnextContext();
    const item_r15 = ctx_r15.$implicit;
    const ɵ$index_277_r17 = ctx_r15.$index;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("own", item_r15.message.isSender)("grouped", !ctx_r1.isMessageGroupStart(ɵ$index_277_r17));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isMessageGroupStart(ɵ$index_277_r17) ? 1 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r15.message.text);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatTime(item_r15.message.sentAt));
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 65);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("\u21B3 ", i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.counters"), " ", ctx);
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r18 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", leg_r18.equityPercentage, "%");
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r18 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", leg_r18.returnRate, "%");
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r18 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", leg_r18.profitSharePercentage, "%");
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Conditional_5_Template, 2, 1, "small");
    i0.ɵɵconditionalCreate(6, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Conditional_6_Template, 2, 1, "small");
    i0.ɵɵconditionalCreate(7, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Conditional_7_Template, 2, 1, "small");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r18 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.offerLegLabel(leg_r18.legType));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.money(leg_r18.amount));
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r18.equityPercentage ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r18.returnRate ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r18.profitSharePercentage ? 7 : -1);
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 67);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r15 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r15.offer.note);
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 69);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_20_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r19); const item_r15 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.acceptOffer(item_r15.offer)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 70);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_20_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r19); const item_r15 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openOfferBuilder(item_r15.offer)); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 71);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_20_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r19); const item_r15 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.rejectOffer(item_r15.offer)); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "conversationWorkspace.actions.accept"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "conversationWorkspace.actions.counter"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "conversationWorkspace.actions.reject"));
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 71);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_21_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r20); const item_r15 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.withdrawOffer(item_r15.offer)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.withdraw"));
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 64)(1, "header")(2, "div")(3, "p", 6);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "strong");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span", 36);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_11_Template, 3, 4, "p", 65);
    i0.ɵɵelementStart(12, "div", 66);
    i0.ɵɵrepeaterCreate(13, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_For_14_Template, 8, 5, "div", null, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_15_Template, 2, 1, "p", 67);
    i0.ɵɵelementStart(16, "footer")(17, "time");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div");
    i0.ɵɵconditionalCreate(20, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_20_Template, 9, 9)(21, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Conditional_21_Template, 3, 3, "button", 68);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_20_0;
    const item_r15 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("offer-card--accepted", ctx_r1.isAcceptedOffer(item_r15.offer));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(5, 13, "conversationWorkspace.offers.version"), " ", item_r15.offer.version);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 15, "conversationWorkspace.offers.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("status-badge--success", ctx_r1.isAcceptedOffer(item_r15.offer));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.offerStatusLabel(item_r15.offer.status));
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_20_0 = ctx_r1.parentOfferVersion(item_r15.offer)) ? 11 : -1, tmp_20_0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(item_r15.offer.legs);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r15.offer.note ? 15 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r1.formatDate(item_r15.offer.createdAt), " \u00B7 ", ctx_r1.formatTime(item_r15.offer.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canReceiveOfferAction(item_r15.offer) ? 20 : ctx_r1.canWithdrawOffer(item_r15.offer) ? 21 : -1);
} }
function ChatComponent_Conditional_44_Conditional_26_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_0_Template, 7, 7, "article", 59)(1, ChatComponent_Conditional_44_Conditional_26_For_5_Conditional_1_Template, 22, 17, "article", 60);
} if (rf & 2) {
    const item_r15 = ctx.$implicit;
    i0.ɵɵconditional(item_r15.kind === "message" ? 0 : 1);
} }
function ChatComponent_Conditional_44_Conditional_26_ForEmpty_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.messages.empty"));
} }
function ChatComponent_Conditional_44_Conditional_26_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 58)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.events.closed"), " \u00B7 ", ctx_r1.formatDate(conversation_r9.closedAt));
} }
function ChatComponent_Conditional_44_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(4, ChatComponent_Conditional_44_Conditional_26_For_5_Template, 2, 1, null, null, _forTrack0, false, ChatComponent_Conditional_44_Conditional_26_ForEmpty_6_Template, 4, 3, "div", 15);
    i0.ɵɵconditionalCreate(7, ChatComponent_Conditional_44_Conditional_26_Conditional_7_Template, 4, 4, "div", 58);
} if (rf & 2) {
    const conversation_r9 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(3, 4, "conversationWorkspace.events.started"), " \u00B7 ", ctx_r1.formatDate(conversation_r9.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.chatItems());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.isClosed() ? 7 : -1);
} }
function ChatComponent_Conditional_44_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.messagesError());
} }
function ChatComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "header", 37)(1, "div", 38);
    i0.ɵɵconditionalCreate(2, ChatComponent_Conditional_44_Conditional_2_Template, 3, 4, "a", 39)(3, ChatComponent_Conditional_44_Conditional_3_Template, 3, 1, "div", 40);
    i0.ɵɵelementStart(4, "div");
    i0.ɵɵconditionalCreate(5, ChatComponent_Conditional_44_Conditional_5_Template, 2, 4, "a", 41)(6, ChatComponent_Conditional_44_Conditional_6_Template, 2, 1, "strong", 42);
    i0.ɵɵconditionalCreate(7, ChatComponent_Conditional_44_Conditional_7_Template, 2, 1, "p");
    i0.ɵɵelementStart(8, "p", 43);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "div", 44)(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ChatComponent_Conditional_44_Conditional_13_Template, 3, 4, "button", 45)(14, ChatComponent_Conditional_44_Conditional_14_Template, 3, 3, "span", 46);
    i0.ɵɵelementStart(15, "details", 47)(16, "summary");
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵtext(18, "\u2022\u2022\u2022");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div");
    i0.ɵɵconditionalCreate(20, ChatComponent_Conditional_44_Conditional_20_Template, 3, 3, "button", 48);
    i0.ɵɵconditionalCreate(21, ChatComponent_Conditional_44_Conditional_21_Template, 3, 3, "button", 48);
    i0.ɵɵconditionalCreate(22, ChatComponent_Conditional_44_Conditional_22_Template, 2, 1, "button", 48);
    i0.ɵɵconditionalCreate(23, ChatComponent_Conditional_44_Conditional_23_Template, 3, 3, "button", 49);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(24, "div", 50);
    i0.ɵɵconditionalCreate(25, ChatComponent_Conditional_44_Conditional_25_Template, 5, 3, "div", 15)(26, ChatComponent_Conditional_44_Conditional_26_Template, 8, 6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(27, ChatComponent_Conditional_44_Conditional_27_Template, 2, 1, "p", 51);
    i0.ɵɵelementStart(28, "form", 52);
    i0.ɵɵlistener("submit", function ChatComponent_Conditional_44_Template_form_submit_28_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onMessageSubmit($event)); });
    i0.ɵɵelement(29, "input", 53);
    i0.ɵɵelementStart(30, "button", 54);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵpipe(33, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_2_0;
    let tmp_3_0;
    const conversation_r9 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_2_0 = ctx_r1.participantFounderProfileId(conversation_r9)) ? 2 : 3, tmp_2_0);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_3_0 = ctx_r1.participantFounderProfileId(conversation_r9)) ? 5 : 6, tmp_3_0);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.roleLabel(conversation_r9.counterpartyRole) ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r9.opportunityTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r1.statusBadgeClass(conversation_r9.status));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.statusLabel(conversation_r9.status));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canMarkReady() ? 13 : ctx_r1.isCurrentUserReady() && !ctx_r1.isClosed() ? 14 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(17, 20, "conversationWorkspace.actions.more"));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(!ctx_r1.isClosed() ? 20 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canCloseDiscussion() ? 21 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canReportConversationUser(conversation_r9) ? 22 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isClosed() ? 23 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.messagesLoading() ? 25 : 26);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.messagesError() ? 27 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.messageControl)("placeholder", ctx_r1.composerHint())("readonly", ctx_r1.isClosed());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r1.canSendMessage());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.sending() ? i0.ɵɵpipeBind1(32, 22, "conversationWorkspace.composer.sending") : i0.ɵɵpipeBind1(33, 24, "conversationWorkspace.composer.send"));
} }
function ChatComponent_Conditional_45_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r21 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.roleLabel(request_r21.counterpartyRole));
} }
function ChatComponent_Conditional_45_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "blockquote");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r21 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(request_r21.message);
} }
function ChatComponent_Conditional_45_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_45_Conditional_17_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r22); const request_r21 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.acceptRequest(request_r21)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.accept"));
} }
function ChatComponent_Conditional_45_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 74);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_45_Conditional_18_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r23); const request_r21 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.rejectRequest(request_r21)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.reject"));
} }
function ChatComponent_Conditional_45_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 74);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_45_Conditional_19_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r24); const request_r21 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.withdrawRequest(request_r21)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.withdraw"));
} }
function ChatComponent_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18)(1, "div", 40)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "p", 6);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "h2");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, ChatComponent_Conditional_45_Conditional_10_Template, 2, 1, "p");
    i0.ɵɵelementStart(11, "h3");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ChatComponent_Conditional_45_Conditional_13_Template, 2, 1, "blockquote");
    i0.ɵɵelementStart(14, "span", 36);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 72);
    i0.ɵɵconditionalCreate(17, ChatComponent_Conditional_45_Conditional_17_Template, 3, 4, "button", 45);
    i0.ɵɵconditionalCreate(18, ChatComponent_Conditional_45_Conditional_18_Template, 3, 4, "button", 73);
    i0.ɵɵconditionalCreate(19, ChatComponent_Conditional_45_Conditional_19_Template, 3, 4, "button", 73);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r21 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.initials(request_r21.counterpartyName));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.workspaceTab() === "incoming" ? i0.ɵɵpipeBind1(6, 10, "conversationWorkspace.tabs.incoming") : i0.ɵɵpipeBind1(7, 12, "conversationWorkspace.tabs.outgoing"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(request_r21.counterpartyName);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.roleLabel(request_r21.counterpartyRole) ? 10 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r21.opportunityTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r21.message ? 13 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.requestStatusLabel(request_r21.status));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(request_r21.canAccept ? 17 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r21.canReject ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r21.canWithdraw ? 19 : -1);
} }
function ChatComponent_Conditional_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "div", 75);
    i0.ɵɵtext(2, "\u2194");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "chat.empty.noConversationTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "chat.empty.noConversationSubtitle"));
} }
function ChatComponent_Conditional_48_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r25.shortDescription);
} }
function ChatComponent_Conditional_48_Conditional_16_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 87)(1, "span", 30);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(3, _c0, ctx));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r25.founderName));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r25.founderName);
} }
function ChatComponent_Conditional_48_Conditional_16_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 88)(1, "span", 30);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r25.founderName));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r25.founderName);
} }
function ChatComponent_Conditional_48_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 79)(1, "h3");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_48_Conditional_16_Conditional_4_Template, 5, 5, "a", 87)(5, ChatComponent_Conditional_48_Conditional_16_Conditional_5_Template, 5, 2, "div", 88);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_4_0;
    const conversation_r25 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.founder"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_4_0 = ctx_r1.founderProfileId(conversation_r25)) ? 4 : 5, tmp_4_0);
} }
function ChatComponent_Conditional_48_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.model"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.investmentModelLabel(conversation_r25.investmentModel));
} }
function ChatComponent_Conditional_48_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.target"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(conversation_r25.fundingTarget));
} }
function ChatComponent_Conditional_48_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.minimum"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(conversation_r25.minimumParticipation));
} }
function ChatComponent_Conditional_48_Conditional_49_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r25.closeReason);
} }
function ChatComponent_Conditional_48_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 82)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_48_Conditional_49_Conditional_4_Template, 2, 1, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.events.closed"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(conversation_r25.closeReason ? 4 : -1);
} }
function ChatComponent_Conditional_48_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 84);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c1, conversation_r25.opportunityId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.viewOpportunity"));
} }
function ChatComponent_Conditional_48_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 69);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_48_Conditional_52_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openParticipationBuilder()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.participate"));
} }
function ChatComponent_Conditional_48_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 86);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r25 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c2, conversation_r25.opportunityId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.openRoom"));
} }
function ChatComponent_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 5)(1, "div")(2, "p", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 76)(9, "section", 77)(10, "div", 78);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div")(13, "h3");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, ChatComponent_Conditional_48_Conditional_15_Template, 2, 1, "p");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(16, ChatComponent_Conditional_48_Conditional_16_Template, 6, 4, "section", 79);
    i0.ɵɵelementStart(17, "section", 79)(18, "h3");
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dl", 80);
    i0.ɵɵconditionalCreate(22, ChatComponent_Conditional_48_Conditional_22_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(23, ChatComponent_Conditional_48_Conditional_23_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(24, ChatComponent_Conditional_48_Conditional_24_Template, 6, 4, "div");
    i0.ɵɵelementStart(25, "div")(26, "dt");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "dd");
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(31, "section", 79)(32, "h3");
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 81)(36, "span");
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "strong");
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(42, "div", 81)(43, "span");
    i0.ɵɵtext(44);
    i0.ɵɵpipe(45, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "strong");
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(49, ChatComponent_Conditional_48_Conditional_49_Template, 5, 4, "section", 82);
    i0.ɵɵelementStart(50, "div", 83);
    i0.ɵɵconditionalCreate(51, ChatComponent_Conditional_48_Conditional_51_Template, 3, 6, "a", 84);
    i0.ɵɵconditionalCreate(52, ChatComponent_Conditional_48_Conditional_52_Template, 3, 3, "button", 85);
    i0.ɵɵconditionalCreate(53, ChatComponent_Conditional_48_Conditional_53_Template, 3, 6, "a", 86);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r25 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 25, "conversationWorkspace.context.eyebrow"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 27, "conversationWorkspace.context.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r25.opportunityTitle));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(conversation_r25.opportunityTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r25.shortDescription ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r25.founderName ? 16 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 29, "conversationWorkspace.context.details"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.investmentModelLabel(conversation_r25.investmentModel) ? 22 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r25.fundingTarget ? 23 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r25.minimumParticipation ? 24 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 31, "conversationWorkspace.context.participation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.participationSummary());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 33, "conversationWorkspace.context.readiness"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 35, "conversationWorkspace.roles.founder"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("ready", conversation_r25.founderReady);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 37, conversation_r25.founderReady ? "conversationWorkspace.status.readyShort" : "conversationWorkspace.status.notReady"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(45, 39, "conversationWorkspace.roles.investor"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("ready", conversation_r25.investorReady);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 41, conversation_r25.investorReady ? "conversationWorkspace.status.readyShort" : "conversationWorkspace.status.notReady"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isClosed() ? 49 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(conversation_r25.opportunityId ? 51 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canCreateParticipationRequest() ? 52 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.projectRoomUnlocked() && conversation_r25.opportunityId ? 53 : -1);
} }
function ChatComponent_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.context.empty"));
} }
function ChatComponent_Conditional_50_For_15_Conditional_5_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelement(3, "input", 99);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "chat.offerBuilder.equityPercentage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.offerDrafts[1].equityPercentage);
} }
function ChatComponent_Conditional_50_For_15_Conditional_5_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelement(3, "input", 98);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "chat.offerBuilder.returnPercentage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.offerDrafts[2].returnRate);
} }
function ChatComponent_Conditional_50_For_15_Conditional_5_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelement(3, "input", 99);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.profitPercentage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.offerDrafts[3].profitSharePercentage);
} }
function ChatComponent_Conditional_50_For_15_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelement(3, "input", 98);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_50_For_15_Conditional_5_Conditional_4_Template, 4, 4, "label");
    i0.ɵɵconditionalCreate(5, ChatComponent_Conditional_50_For_15_Conditional_5_Conditional_5_Template, 4, 4, "label");
    i0.ɵɵconditionalCreate(6, ChatComponent_Conditional_50_For_15_Conditional_5_Conditional_6_Template, 4, 4, "label");
} if (rf & 2) {
    const type_r29 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 5, "chat.offerBuilder.amount"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.offerDrafts[type_r29].amount);
    i0.ɵɵadvance();
    i0.ɵɵconditional(type_r29 === 1 ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(type_r29 === 2 ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(type_r29 === 3 ? 6 : -1);
} }
function ChatComponent_Conditional_50_For_15_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 95)(1, "label", 96)(2, "input", 97);
    i0.ɵɵlistener("change", function ChatComponent_Conditional_50_For_15_Template_input_change_2_listener($event) { const type_r29 = i0.ɵɵrestoreView(_r28).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setOfferLegEnabled(type_r29, $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, ChatComponent_Conditional_50_For_15_Conditional_5_Template, 7, 7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const type_r29 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("enabled", ctx_r1.offerDrafts[type_r29].enabled);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.offerDrafts[type_r29].enabled);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.offerLegLabel(type_r29));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.offerDrafts[type_r29].enabled ? 5 : -1);
} }
function ChatComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 89);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_50_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeOfferBuilder()); });
    i0.ɵɵelementStart(1, "section", 90);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_50_Template_section_click_1_listener($event) { i0.ɵɵrestoreView(_r27); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "header")(3, "div")(4, "p", 6);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "h2");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "button", 91);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_50_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeOfferBuilder()); });
    i0.ɵɵtext(12, "\u00D7");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 92);
    i0.ɵɵrepeaterCreate(14, ChatComponent_Conditional_50_For_15_Template, 6, 5, "section", 93, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "label");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelement(19, "textarea", 94);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "footer")(21, "button", 70);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_50_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeOfferBuilder()); });
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_50_Template_button_click_24_listener() { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.submitOffer()); });
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.counteringOfferId() ? i0.ɵɵpipeBind1(6, 7, "chat.offerBuilder.counterOffer") : i0.ɵɵpipeBind1(7, 9, "chat.offerBuilder.makeOffer"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 11, "conversationWorkspace.offers.terms"));
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(ctx_r1.offerLegTypes);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 13, "chat.offerBuilder.offerNote"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.offerNoteControl);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 15, "conversationWorkspace.actions.cancel"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.offerProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.counteringOfferId() ? i0.ɵɵpipeBind1(26, 17, "chat.offerBuilder.sendCounter") : i0.ɵɵpipeBind1(27, 19, "chat.offerBuilder.sendOffer"));
} }
function ChatComponent_Conditional_51_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 101);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "reports.success"));
} }
function ChatComponent_Conditional_51_Conditional_11_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reason_r32 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", reason_r32);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportReasonLabel(reason_r32));
} }
function ChatComponent_Conditional_51_Conditional_11_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportError());
} }
function ChatComponent_Conditional_51_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r31 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "select", 22);
    i0.ɵɵlistener("change", function ChatComponent_Conditional_51_Conditional_11_Template_select_change_3_listener($event) { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReportReason($event.target.value)); });
    i0.ɵɵrepeaterCreate(4, ChatComponent_Conditional_51_Conditional_11_For_5_Template, 2, 2, "option", 13, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "label");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementStart(9, "textarea", 102);
    i0.ɵɵlistener("input", function ChatComponent_Conditional_51_Conditional_11_Template_textarea_input_9_listener($event) { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReportDescription($event.target.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, ChatComponent_Conditional_51_Conditional_11_Conditional_10_Template, 2, 1, "p", 51);
    i0.ɵɵelementStart(11, "footer")(12, "button", 70);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_51_Conditional_11_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_51_Conditional_11_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r31); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.submitConversationReport()); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 8, "reports.reason"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.reportReason());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.reportReasons);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 10, "reports.description"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.reportDescription());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.reportError() ? 10 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 12, "conversationWorkspace.actions.cancel"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.reportSubmitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportSubmitting() ? i0.ɵɵpipeBind1(17, 14, "reports.submitting") : i0.ɵɵpipeBind1(18, 16, "reports.submit"));
} }
function ChatComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 89);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_51_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵelementStart(1, "section", 100);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_51_Template_section_click_1_listener($event) { i0.ɵɵrestoreView(_r30); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "header")(3, "div")(4, "p", 6);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 91);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_51_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵtext(9, "\u00D7");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, ChatComponent_Conditional_51_Conditional_10_Template, 3, 3, "div", 101)(11, ChatComponent_Conditional_51_Conditional_11_Template, 19, 18);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r33 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.conversationReportLabel(conversation_r33));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.conversationReportTargetName(conversation_r33));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.reportSuccess() ? 10 : 11);
} }
function ChatComponent_Conditional_52_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r34 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-participation-builder", 104);
    i0.ɵɵlistener("closed", function ChatComponent_Conditional_52_Conditional_0_Template_app_participation_builder_closed_0_listener() { i0.ɵɵrestoreView(_r34); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeParticipationBuilder()); })("submitted", function ChatComponent_Conditional_52_Conditional_0_Template_app_participation_builder_submitted_0_listener() { i0.ɵɵrestoreView(_r34); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onParticipationSubmitted()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r35 = i0.ɵɵnextContext();
    i0.ɵɵproperty("opportunityId", ctx)("opportunityTitle", conversation_r35.opportunityTitle)("conversationId", conversation_r35.id);
} }
function ChatComponent_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ChatComponent_Conditional_52_Conditional_0_Template, 1, 3, "app-participation-builder", 103);
} if (rf & 2) {
    let tmp_2_0;
    i0.ɵɵconditional((tmp_2_0 = ctx.opportunityId) ? 0 : -1, tmp_2_0);
} }
export class ChatComponent {
    constructor() {
        this.http = inject(HttpClient);
        this.apiBase = inject(API_BASE);
        this.route = inject(ActivatedRoute);
        this.walletService = inject(WalletService);
        this.languageService = inject(LanguageService);
        this.reportService = inject(ReportService);
        this.conversations = signal([], ...(ngDevMode ? [{ debugName: "conversations" }] : []));
        this.requests = signal([], ...(ngDevMode ? [{ debugName: "requests" }] : []));
        this.messages = signal([], ...(ngDevMode ? [{ debugName: "messages" }] : []));
        this.offers = signal([], ...(ngDevMode ? [{ debugName: "offers" }] : []));
        this.selectedConversation = signal(null, ...(ngDevMode ? [{ debugName: "selectedConversation" }] : []));
        this.selectedRequest = signal(null, ...(ngDevMode ? [{ debugName: "selectedRequest" }] : []));
        this.loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.messagesLoading = signal(false, ...(ngDevMode ? [{ debugName: "messagesLoading" }] : []));
        this.sending = signal(false, ...(ngDevMode ? [{ debugName: "sending" }] : []));
        this.actionProcessing = signal(false, ...(ngDevMode ? [{ debugName: "actionProcessing" }] : []));
        this.offerProcessing = signal(false, ...(ngDevMode ? [{ debugName: "offerProcessing" }] : []));
        this.offerBuilderOpen = signal(false, ...(ngDevMode ? [{ debugName: "offerBuilderOpen" }] : []));
        this.counteringOfferId = signal(null, ...(ngDevMode ? [{ debugName: "counteringOfferId" }] : []));
        this.participationBuilderOpen = signal(false, ...(ngDevMode ? [{ debugName: "participationBuilderOpen" }] : []));
        this.error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
        this.messagesError = signal(null, ...(ngDevMode ? [{ debugName: "messagesError" }] : []));
        this.reportModalOpen = signal(false, ...(ngDevMode ? [{ debugName: "reportModalOpen" }] : []));
        this.reportSubmitting = signal(false, ...(ngDevMode ? [{ debugName: "reportSubmitting" }] : []));
        this.reportSuccess = signal(false, ...(ngDevMode ? [{ debugName: "reportSuccess" }] : []));
        this.reportError = signal(null, ...(ngDevMode ? [{ debugName: "reportError" }] : []));
        this.reportReason = signal('Spam', ...(ngDevMode ? [{ debugName: "reportReason" }] : []));
        this.reportDescription = signal('', ...(ngDevMode ? [{ debugName: "reportDescription" }] : []));
        this.reportReasons = [
            'MisleadingInformation',
            'Spam',
            'Abuse',
            'FraudConcern',
            'InappropriateContent',
            'Other'
        ];
        this.workspaceTab = signal('conversations', ...(ngDevMode ? [{ debugName: "workspaceTab" }] : []));
        this.conversationFilter = signal('all', ...(ngDevMode ? [{ debugName: "conversationFilter" }] : []));
        this.mobileView = signal('list', ...(ngDevMode ? [{ debugName: "mobileView" }] : []));
        this.searchControl = new FormControl('', { nonNullable: true });
        this.searchTerm = signal('', ...(ngDevMode ? [{ debugName: "searchTerm" }] : []));
        this.viewerStates = signal({}, ...(ngDevMode ? [{ debugName: "viewerStates" }] : []));
        this.messageControl = new FormControl('');
        this.offerNoteControl = new FormControl('');
        this.offerCurrencyControl = new FormControl('USD');
        this.offerDrafts = {
            1: {
                enabled: true,
                amount: new FormControl(null),
                equityPercentage: new FormControl(null),
                sharesTerms: new FormControl('')
            },
            2: {
                enabled: false,
                amount: new FormControl(null),
                returnRate: new FormControl(null),
                termMonths: new FormControl(null),
                repaymentModel: new FormControl('Monthly')
            },
            3: {
                enabled: false,
                amount: new FormControl(null),
                profitSharePercentage: new FormControl(null),
                termMonths: new FormControl(null),
                exitTerms: new FormControl('')
            }
        };
        this.offerLegTypes = [1, 2, 3];
        this.visibleConversations = computed(() => {
            const query = this.searchTerm().trim().toLocaleLowerCase('en');
            const filter = this.conversationFilter();
            return this.conversations().filter(conversation => {
                const closed = this.isReadOnly(conversation);
                if (filter === 'active' && closed)
                    return false;
                if (filter === 'closed' && !closed)
                    return false;
                return !query || [conversation.counterpartyName, conversation.opportunityTitle, conversation.lastMessage]
                    .filter((value) => !!value)
                    .some(value => value.toLocaleLowerCase('en').includes(query));
            });
        }, ...(ngDevMode ? [{ debugName: "visibleConversations" }] : []));
        this.visibleRequests = computed(() => {
            const tab = this.workspaceTab();
            const query = this.searchTerm().trim().toLocaleLowerCase('en');
            if (tab === 'conversations')
                return [];
            return this.requests().filter(request => request.direction === tab && (!query || [request.counterpartyName, request.opportunityTitle, request.message]
                .filter((value) => !!value)
                .some(value => value.toLocaleLowerCase('en').includes(query))));
        }, ...(ngDevMode ? [{ debugName: "visibleRequests" }] : []));
        this.chatItems = computed(() => {
            const messageItems = this.messages().map(message => ({ kind: 'message', id: `message-${message.id}`, date: message.sentAt, message }));
            const offerItems = this.offers().map(offer => ({ kind: 'offer', id: `offer-${offer.id}`, date: offer.createdAt || new Date(0), offer }));
            return [...messageItems, ...offerItems].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
        }, ...(ngDevMode ? [{ debugName: "chatItems" }] : []));
        this.selectionWatcher = effect(() => {
            const selected = this.selectedConversation();
            if (!selected)
                return;
            if (this.workspaceTab() !== 'conversations')
                return;
            const visibleIds = new Set(this.visibleConversations().map(item => item.id));
            if (!visibleIds.has(selected.id)) {
                this.clearSelection();
            }
        }, { ...(ngDevMode ? { debugName: "selectionWatcher" } : {}), allowSignalWrites: true });
        this.activeConversation = computed(() => {
            const selected = this.selectedConversation();
            if (!selected)
                return null;
            const currentIds = new Set(this.conversations().map(item => item.id));
            return currentIds.has(selected.id) ? selected : null;
        }, ...(ngDevMode ? [{ debugName: "activeConversation" }] : []));
        this.isCurrentUserReady = computed(() => !!this.activeConversation()?.currentUserReady, ...(ngDevMode ? [{ debugName: "isCurrentUserReady" }] : []));
        this.isClosed = computed(() => this.isReadOnly(this.activeConversation()), ...(ngDevMode ? [{ debugName: "isClosed" }] : []));
        this.bothReady = computed(() => !!this.activeConversation()?.founderReady && !!this.activeConversation()?.investorReady, ...(ngDevMode ? [{ debugName: "bothReady" }] : []));
        this.projectRoomUnlocked = computed(() => {
            const conversation = this.activeConversation();
            const state = this.activeViewerState();
            return !!state?.projectRoomUnlocked || !!state?.canOpenProjectRoom || conversation?.status === 'Participation Approved';
        }, ...(ngDevMode ? [{ debugName: "projectRoomUnlocked" }] : []));
        this.canMarkReady = computed(() => {
            const conversation = this.activeConversation();
            return !!conversation && !this.isReadOnly(conversation) && !this.isCurrentUserReady() && !this.actionProcessing();
        }, ...(ngDevMode ? [{ debugName: "canMarkReady" }] : []));
        this.canCloseDiscussion = computed(() => {
            const conversation = this.activeConversation();
            return !!conversation && !this.isReadOnly(conversation) && !this.actionProcessing();
        }, ...(ngDevMode ? [{ debugName: "canCloseDiscussion" }] : []));
        this.canCreateParticipationRequest = computed(() => {
            const conversation = this.activeConversation();
            const state = this.activeViewerState();
            if (!conversation?.opportunityId || this.actionProcessing())
                return false;
            if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || state?.hasPendingParticipationRequest)
                return false;
            const participation = this.normalizeParticipationStatus(state?.participationStatus ?? conversation.participationStatus);
            if (participation === 'pending' || participation === 'approved')
                return false;
            if (conversation.status === 'Participation Created' || conversation.status === 'Participation Approved')
                return false;
            return !this.isReadOnly(conversation);
        }, ...(ngDevMode ? [{ debugName: "canCreateParticipationRequest" }] : []));
        this.timeline = computed(() => this.buildTimeline(this.activeConversation()), ...(ngDevMode ? [{ debugName: "timeline" }] : []));
        this.stageSummary = computed(() => this.buildStageSummary(this.activeConversation()), ...(ngDevMode ? [{ debugName: "stageSummary" }] : []));
        this.participationSummary = computed(() => this.buildParticipationSummary(this.activeConversation()), ...(ngDevMode ? [{ debugName: "participationSummary" }] : []));
        this.nextStep = computed(() => this.buildNextStep(this.activeConversation()), ...(ngDevMode ? [{ debugName: "nextStep" }] : []));
    }
    async ngOnInit() {
        await this.loadConversations();
    }
    async loadConversations() {
        try {
            this.loading.set(true);
            this.error.set(null);
            const [raw, requestRaw] = await Promise.all([
                this.get('/api/v1/conversations'),
                this.get('/api/v1/conversation-requests')
            ]);
            const rows = this.extractArray(raw);
            const conversations = await Promise.all(rows.map(row => this.hydrateConversationPreview(this.mapConversation(row))));
            this.conversations.set(conversations);
            this.requests.set(this.extractArray(requestRaw).map(row => this.mapRequest(row)));
            const current = this.selectedConversation();
            const requestedConversationId = this.route.snapshot.queryParamMap.get('conversationId');
            const selected = requestedConversationId
                ? conversations.find(item => item.id === requestedConversationId)
                : current ? conversations.find(item => item.id === current.id) : conversations[0];
            if (selected && conversations.find(item => item.id === selected.id)) {
                await this.selectConversation(selected);
            }
            else {
                this.clearSelection();
            }
        }
        catch (error) {
            this.error.set(this.errorMessage(error, 'Unable to load conversations.'));
            this.conversations.set([]);
            this.requests.set([]);
            this.clearSelection();
        }
        finally {
            this.loading.set(false);
        }
    }
    async selectConversation(conversation) {
        this.selectedRequest.set(null);
        this.selectedConversation.set(conversation);
        this.mobileView.set('chat');
        await this.loadViewerState(conversation);
        await this.loadMessages(conversation.id);
        await this.loadOffers(conversation.id);
    }
    selectRequest(request) {
        this.selectedConversation.set(null);
        this.selectedRequest.set(request);
        this.messages.set([]);
        this.offers.set([]);
        this.mobileView.set('chat');
    }
    async acceptRequest(request) {
        await this.requestAction(request, 'accept');
    }
    async rejectRequest(request) {
        await this.requestAction(request, 'reject');
    }
    async withdrawRequest(request) {
        await this.requestAction(request, 'withdraw');
    }
    openConversationReport(conversation) {
        if (!this.resolveConversationCounterpartyUserId(conversation)) {
            this.reportError.set(this.t('reports.errors.counterpartyUnavailable'));
            return;
        }
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
    async submitConversationReport() {
        const conversation = this.activeConversation();
        if (!conversation || this.reportSubmitting())
            return;
        const counterpartyUserId = this.resolveConversationCounterpartyUserId(conversation);
        if (!counterpartyUserId) {
            this.reportError.set(this.t('reports.errors.counterpartyUnavailable'));
            return;
        }
        try {
            this.reportSubmitting.set(true);
            this.reportError.set(null);
            await this.reportService.createReport({
                targetType: 'User',
                targetId: counterpartyUserId,
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
    async loadViewerState(conversation) {
        if (!conversation.opportunityId)
            return;
        try {
            const raw = await this.get(`/api/v1/opportunities/${encodeURIComponent(String(conversation.opportunityId))}/viewer-state`);
            const wrapped = this.asRecord(raw);
            const state = this.mapViewerState(wrapped['data'] ?? raw);
            this.viewerStates.update(items => ({ ...items, [String(conversation.opportunityId)]: state }));
        }
        catch {
            this.viewerStates.update(items => {
                const next = { ...items };
                delete next[String(conversation.opportunityId)];
                return next;
            });
        }
    }
    async loadMessages(conversationId) {
        try {
            this.messagesLoading.set(true);
            this.messagesError.set(null);
            const raw = await this.get(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`);
            const conversation = this.conversations().find(item => item.id === conversationId) || this.selectedConversation();
            const messages = this.extractArray(raw).map(row => this.mapMessage(row, conversation));
            messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
            this.messages.set(messages);
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, 'Unable to load messages.'));
            this.messages.set([]);
        }
        finally {
            this.messagesLoading.set(false);
        }
    }
    async loadOffers(conversationId) {
        try {
            const raw = await this.get(`/api/v1/conversations/${encodeURIComponent(conversationId)}/offers`);
            this.offers.set(this.extractArray(raw).map(row => this.mapOffer(row)));
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, 'Unable to load structured offers.'));
            this.offers.set([]);
        }
    }
    onMessageSubmit(event) {
        event.preventDefault();
        void this.sendMessage();
    }
    async sendMessage() {
        const text = this.messageControl.value?.trim();
        const conversation = this.activeConversation();
        if (!text || !conversation || this.isReadOnly(conversation) || this.sending())
            return;
        try {
            this.sending.set(true);
            this.messagesError.set(null);
            const raw = await this.post(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/messages`, { message: text });
            const wrapped = this.asRecord(raw);
            this.messages.update(items => [...items, this.mapMessage(wrapped['data'] ?? raw, conversation)]);
            this.messageControl.setValue('');
            this.updateConversationStatus(conversation.id, 'Negotiation in Progress');
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, this.t('chat.errors.messageFailed')));
        }
        finally {
            this.sending.set(false);
        }
    }
    async markReadyToProceed() {
        const conversation = this.activeConversation();
        if (!conversation || this.isCurrentUserReady() || this.isReadOnly(conversation) || this.actionProcessing())
            return;
        const confirmation = window.confirm(this.t('chat.confirm.readyToProceed'));
        if (!confirmation)
            return;
        try {
            this.actionProcessing.set(true);
            const raw = await this.post(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/ready-to-proceed`, {});
            const data = this.asRecord(raw)['data'];
            const updated = data ? this.mapConversation(data) : {
                ...conversation,
                currentUserReady: true,
                investorReady: conversation.investorReady || this.currentUserLooksInvestor(conversation),
                founderReady: conversation.founderReady || !this.currentUserLooksInvestor(conversation),
                status: 'Ready for Participation'
            };
            this.replaceConversation(updated);
            this.selectedConversation.set(updated);
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, this.t('chat.errors.readyFailed')));
        }
        finally {
            this.actionProcessing.set(false);
        }
    }
    async closeDiscussion() {
        const conversation = this.activeConversation();
        if (!conversation || this.isReadOnly(conversation) || this.actionProcessing())
            return;
        const reason = window.prompt(this.t('chat.confirm.closeDiscussion'), '');
        if (reason === null)
            return;
        try {
            this.actionProcessing.set(true);
            const raw = await this.post(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/close`, { reason: reason.trim() || null });
            const data = this.asRecord(raw)['data'];
            const updated = data ? this.mapConversation(data) : {
                ...conversation,
                status: 'Discussion Closed',
                closedAt: new Date(),
                closeReason: reason.trim() || null,
                closedByUserId: this.resolveCurrentUserId(conversation),
                readOnly: true,
                archived: false
            };
            this.replaceConversation(updated);
            this.selectedConversation.set(updated);
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, this.t('chat.errors.closeFailed')));
        }
        finally {
            this.actionProcessing.set(false);
        }
    }
    async removeClosedConversation(conversation) {
        if (!this.isReadOnly(conversation) || this.actionProcessing())
            return;
        const confirmation = window.confirm(this.t('chat.confirm.removeClosed'));
        if (!confirmation)
            return;
        try {
            this.actionProcessing.set(true);
            await this.post(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/hide`, {});
            this.conversations.update(items => items.filter(item => item.id !== conversation.id));
            if (this.selectedConversation()?.id === conversation.id) {
                this.clearSelection();
            }
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, this.t('chat.errors.removeFailed')));
        }
        finally {
            this.actionProcessing.set(false);
        }
    }
    openOfferBuilder(counterOffer) {
        if (this.isReadOnly(this.activeConversation()) || this.offerProcessing())
            return;
        this.resetOfferBuilder();
        if (counterOffer) {
            this.counteringOfferId.set(counterOffer.id);
            this.seedOfferBuilder(counterOffer);
        }
        else {
            this.counteringOfferId.set(null);
        }
        this.offerBuilderOpen.set(true);
    }
    closeOfferBuilder() {
        this.offerBuilderOpen.set(false);
        this.counteringOfferId.set(null);
    }
    async submitOffer() {
        const conversation = this.activeConversation();
        if (!conversation || this.isReadOnly(conversation) || this.offerProcessing())
            return;
        const payload = this.buildOfferPayload();
        if (!payload.legs.length) {
            this.messagesError.set('Select at least one offer leg.');
            return;
        }
        try {
            this.offerProcessing.set(true);
            this.messagesError.set(null);
            const counterId = this.counteringOfferId();
            const actionCode = counterId ? 'SendCounterOffer' : 'SendFirstOffer';
            const quote = await this.walletService.getPaidActionQuote(actionCode);
            if (!quote.hasSufficientCredit) {
                this.messagesError.set(this.t('paidActions.insufficientMessage')
                    .replace('{required}', this.formatCredits(quote.creditCost))
                    .replace('{balance}', this.formatCredits(quote.currentBalance)));
                return;
            }
            if (!window.confirm(this.confirmationText(quote.displayName || actionCode, quote.creditCost, quote.currentBalance, quote.balanceAfter))) {
                return;
            }
            const path = counterId
                ? `/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers/${counterId}/counter`
                : `/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers`;
            const raw = await this.post(path, payload);
            const wrapped = this.asRecord(raw);
            const offer = this.mapOffer(wrapped['data'] ?? raw);
            if (counterId) {
                this.offers.update(items => [...items.map(item => item.id === counterId ? { ...item, status: 2 } : item), offer]);
            }
            else {
                this.offers.update(items => [...items, offer]);
            }
            this.closeOfferBuilder();
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, 'Offer could not be submitted.'));
        }
        finally {
            this.offerProcessing.set(false);
        }
    }
    async acceptOffer(offer) {
        await this.offerAction(offer, 'accept');
    }
    async rejectOffer(offer) {
        await this.offerAction(offer, 'reject');
    }
    async withdrawOffer(offer) {
        await this.offerAction(offer, 'withdraw');
    }
    canReceiveOfferAction(offer) {
        return offer.status === 1 && !this.isOfferCreator(offer) && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
    }
    canWithdrawOffer(offer) {
        return offer.status === 1 && this.isOfferCreator(offer) && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
    }
    isAcceptedOffer(offer) {
        return offer.status === 3;
    }
    offerStatusLabel(status) {
        switch (Number(status)) {
            case 1: return this.t('conversationWorkspace.offerStatus.pending');
            case 2: return this.t('conversationWorkspace.offerStatus.countered');
            case 3: return this.t('conversationWorkspace.offerStatus.accepted');
            case 4: return this.t('conversationWorkspace.offerStatus.rejected');
            case 5: return this.t('conversationWorkspace.offerStatus.withdrawn');
            default: return this.t('conversationWorkspace.status.unavailable');
        }
    }
    offerLegLabel(type) {
        switch (Number(type)) {
            case 1: return this.t('conversationWorkspace.offerTypes.equity');
            case 2: return this.t('conversationWorkspace.offerTypes.loan');
            case 3: return this.t('conversationWorkspace.offerTypes.profitSharing');
            default: return this.t('conversationWorkspace.offers.title');
        }
    }
    openParticipationBuilder() {
        if (!this.canCreateParticipationRequest())
            return;
        this.participationBuilderOpen.set(true);
    }
    closeParticipationBuilder() {
        this.participationBuilderOpen.set(false);
    }
    async onParticipationSubmitted() {
        this.participationBuilderOpen.set(false);
        const conversation = this.activeConversation();
        if (conversation) {
            await this.loadViewerState(conversation);
        }
        await this.loadConversations();
    }
    setWorkspaceTab(tab) {
        this.workspaceTab.set(tab);
        this.clearSelection();
    }
    setSearchTerm(value) {
        this.searchControl.setValue(value, { emitEvent: false });
        this.searchTerm.set(value);
    }
    setConversationFilter(value) {
        if (value === 'active' || value === 'closed' || value === 'all')
            this.conversationFilter.set(value);
    }
    setMobileView(view) {
        this.mobileView.set(view);
    }
    canSendMessage() {
        const conversation = this.activeConversation();
        return !!conversation && !this.isReadOnly(conversation) && !this.sending() && !!this.messageControl.value?.trim();
    }
    composerHint() {
        const conversation = this.activeConversation();
        if (!conversation)
            return this.t('conversationWorkspace.composer.select');
        if (this.isReadOnly(conversation))
            return this.t('conversationWorkspace.composer.closed');
        return this.t('conversationWorkspace.composer.placeholder');
    }
    closedByLabel(conversation) {
        if (this.sameId(conversation.closedByUserId, conversation.founderUserId))
            return conversation.founderName || 'Founder';
        if (this.sameId(conversation.closedByUserId, conversation.investorUserId))
            return conversation.investorName || 'Investor';
        if (this.sameId(conversation.closedByUserId, conversation.requesterUserId))
            return conversation.requesterName || 'Requester';
        if (this.sameId(conversation.closedByUserId, conversation.recipientUserId))
            return conversation.recipientName || 'Recipient';
        if (conversation.status === 'Declined by Founder')
            return conversation.founderName || 'Founder';
        if (conversation.status === 'You withdrew')
            return 'You';
        return 'A participant';
    }
    statusBadgeClass(status) {
        switch (status) {
            case 'Founder Accepted':
            case 'Negotiation in Progress':
            case 'Ready for Participation':
                return 'status-badge status-badge--active';
            case 'Participation Created':
                return 'status-badge status-badge--pending';
            case 'Participation Approved':
                return 'status-badge status-badge--success';
            case 'Declined by Founder':
            case 'You withdrew':
            case 'Participation Rejected':
            case 'Discussion Closed':
                return 'status-badge status-badge--closed';
            default:
                return 'status-badge';
        }
    }
    money(value) {
        if (value === null || value === undefined || Number.isNaN(Number(value)))
            return '-';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
    }
    formatDate(value) {
        if (!value)
            return '-';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    }
    formatTime(value) {
        if (!value)
            return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    }
    mapConversation(value) {
        const row = this.asRecord(value);
        const opportunity = this.asRecord(row['opportunity']);
        const founder = this.asRecord(row['founder']);
        const investor = this.asRecord(row['investor']);
        const status = this.normalizeStatus(row['conversationStatus'] ?? row['statusText'] ?? row['status']);
        const direction = this.normalizeDirection(row['direction']);
        return {
            id: this.stringValue(row['id'] ?? row['conversationId']),
            direction,
            opportunityId: this.idValue(row['opportunityId'] ?? opportunity['id']),
            opportunityTitle: this.stringValue(row['opportunityTitle'] ?? opportunity['title']),
            shortDescription: this.optionalString(row['shortDescription'] ?? opportunity['shortDescription']),
            founderName: this.optionalString(row['founderName'] ?? founder['name']),
            founderUserId: this.idValue(row['founderUserId'] ?? founder['id']),
            investorName: this.optionalString(row['investorName'] ?? investor['name']),
            investorUserId: this.idValue(row['investorUserId'] ?? investor['id']),
            requesterUserId: this.idValue(row['requesterUserId']),
            requesterName: this.optionalString(row['requesterName']),
            requesterRole: this.optionalString(row['requesterRole']),
            recipientUserId: this.idValue(row['recipientUserId']),
            recipientName: this.optionalString(row['recipientName']),
            recipientRole: this.optionalString(row['recipientRole']),
            counterpartyUserId: this.idValue(row['counterpartyUserId']),
            counterpartyName: this.stringValue(row['counterpartyName']),
            counterpartyRole: this.optionalString(row['counterpartyRole']),
            avatarUrl: this.optionalString(row['avatarUrl'] ?? this.asRecord(row['counterparty'])['avatarUrl']),
            fundingTarget: this.numberValue(row['fundingTarget'] ?? opportunity['fundingTarget']),
            minimumParticipation: this.numberValue(row['minimumParticipation'] ?? opportunity['minimumInvestmentAmount']),
            investmentModel: this.optionalString(row['investmentModel'] ?? opportunity['investmentModel']),
            status,
            participationStatus: this.optionalString(row['participationStatus']),
            participationRequestId: this.optionalString(row['participationRequestId']),
            lastMessage: this.optionalString(row['lastMessage']),
            lastMessageAt: this.dateValue(row['lastMessageAt'] ?? row['updatedAt'] ?? row['createdAt']),
            createdAt: this.dateValue(row['createdAt']),
            closedAt: this.dateValue(row['closedAt']),
            closedByUserId: this.idValue(row['closedByUserId']),
            closeReason: this.optionalString(row['closeReason']),
            founderReady: this.booleanValue(row['founderReady']),
            investorReady: this.booleanValue(row['investorReady']),
            currentUserReady: this.resolveCurrentUserReady(row, direction),
            archived: this.booleanValue(row['archived']),
            readOnly: this.booleanValue(row['readOnly']) || status === 'Discussion Closed' || status === 'You withdrew' || status === 'Declined by Founder'
        };
    }
    resolveCurrentUserReady(row, direction) {
        if (row['currentUserReady'] !== undefined) {
            return this.booleanValue(row['currentUserReady']);
        }
        const founderReady = this.booleanValue(row['founderReady']);
        const investorReady = this.booleanValue(row['investorReady']);
        if (direction === 'incoming')
            return founderReady;
        if (direction === 'outgoing')
            return investorReady;
        const currentUserId = localStorage.getItem('userId');
        if (this.sameId(currentUserId, row['founderUserId']))
            return founderReady;
        if (this.sameId(currentUserId, row['investorUserId']))
            return investorReady;
        return false;
    }
    mapMessage(value, conversation) {
        const row = this.asRecord(value);
        const senderId = row['senderUserId'] ?? row['senderId'];
        const currentUserId = this.resolveCurrentUserId(conversation);
        const senderIdentity = this.resolveSenderIdentity(senderId, conversation);
        const isSender = this.booleanValue(row['isSender']) || (!!senderId && !!currentUserId && this.sameId(senderId, currentUserId));
        return {
            id: this.stringValue(row['id'] ?? row['messageId']),
            senderId: senderId === null || senderId === undefined ? undefined : String(senderId),
            senderName: this.optionalString(row['senderName']) || senderIdentity.name,
            senderRole: this.normalizeRole(row['senderRole'] ?? senderIdentity.role),
            text: this.stringValue(row['message'] ?? row['text']),
            sentAt: this.dateValue(row['sentAt']) || new Date(0),
            isSender
        };
    }
    mapOffer(value) {
        const row = this.asRecord(value);
        return {
            id: Number(row['id']),
            conversationId: this.stringValue(row['conversationId']),
            createdByUserId: this.idValue(row['createdByUserId']),
            createdByName: this.optionalString(row['createdByName']),
            version: Number(row['version'] ?? 1),
            parentOfferId: this.numberValue(row['parentOfferId']),
            status: this.offerStatusValue(row['status']),
            note: this.optionalString(row['note']),
            currency: this.optionalString(row['currency']) || 'USD',
            createdAt: this.dateValue(row['createdAt']),
            legs: this.extractArray(row['legs']).map(value => {
                const leg = this.asRecord(value);
                return {
                    id: this.numberValue(leg['id']) ?? undefined,
                    legType: this.offerLegTypeValue(leg['legType']),
                    amount: Number(leg['amount'] ?? 0),
                    equityPercentage: this.numberValue(leg['equityPercentage']),
                    sharesTerms: this.optionalString(leg['sharesTerms']),
                    returnRate: this.numberValue(leg['returnRate']),
                    termMonths: this.numberValue(leg['termMonths']),
                    repaymentModel: this.optionalString(leg['repaymentModel']),
                    profitSharePercentage: this.numberValue(leg['profitSharePercentage']),
                    exitTerms: this.optionalString(leg['exitTerms'])
                };
            })
        };
    }
    resolveCurrentUserId(conversation) {
        const storedUserId = localStorage.getItem('userId');
        if (!conversation)
            return null;
        if (storedUserId &&
            (this.sameId(storedUserId, conversation.requesterUserId) ||
                this.sameId(storedUserId, conversation.recipientUserId) ||
                this.sameId(storedUserId, conversation.founderUserId) ||
                this.sameId(storedUserId, conversation.investorUserId))) {
            return storedUserId;
        }
        if (conversation.direction === 'outgoing')
            return conversation.requesterUserId ?? conversation.investorUserId ?? null;
        if (conversation.direction === 'incoming')
            return conversation.recipientUserId ?? conversation.founderUserId ?? null;
        return null;
    }
    canReportConversationUser(conversation) {
        return !!this.resolveConversationCounterpartyUserId(conversation);
    }
    conversationReportLabel(conversation) {
        const counterpartyUserId = this.resolveConversationCounterpartyUserId(conversation);
        if (this.sameId(counterpartyUserId, conversation.founderUserId))
            return this.t('reports.actions.reportFounder');
        if (this.sameId(counterpartyUserId, conversation.investorUserId))
            return this.t('reports.actions.reportInvestor');
        return this.t('reports.actions.reportUser');
    }
    conversationReportTargetName(conversation) {
        const counterpartyUserId = this.resolveConversationCounterpartyUserId(conversation);
        if (this.sameId(counterpartyUserId, conversation.founderUserId)) {
            return conversation.founderName || conversation.recipientName || conversation.counterpartyName;
        }
        if (this.sameId(counterpartyUserId, conversation.investorUserId)) {
            return conversation.investorName || conversation.requesterName || conversation.counterpartyName;
        }
        return conversation.counterpartyName;
    }
    resolveConversationCounterpartyUserId(conversation) {
        if (!conversation)
            return null;
        const currentUserId = this.resolveCurrentUserId(conversation);
        if (!currentUserId)
            return null;
        const candidates = [
            conversation.counterpartyUserId,
            this.sameId(currentUserId, conversation.founderUserId) ? conversation.investorUserId : null,
            this.sameId(currentUserId, conversation.investorUserId) ? conversation.founderUserId : null,
            this.sameId(currentUserId, conversation.requesterUserId) ? conversation.recipientUserId : null,
            this.sameId(currentUserId, conversation.recipientUserId) ? conversation.requesterUserId : null,
            conversation.founderUserId,
            conversation.investorUserId,
            conversation.requesterUserId,
            conversation.recipientUserId
        ];
        return candidates.find(candidate => !!candidate && !this.sameId(candidate, currentUserId)) ?? null;
    }
    resolveSenderIdentity(senderId, conversation) {
        if (!conversation)
            return { name: 'Unknown sender', role: '' };
        if (this.sameId(senderId, conversation.founderUserId)) {
            return { name: conversation.founderName || conversation.recipientName || 'Founder', role: 'Founder' };
        }
        if (this.sameId(senderId, conversation.investorUserId)) {
            return { name: conversation.investorName || conversation.requesterName || 'Investor', role: 'Investor' };
        }
        if (this.sameId(senderId, conversation.requesterUserId)) {
            return { name: conversation.requesterName || conversation.investorName || 'Investor', role: this.normalizeRole(conversation.requesterRole || 'Investor') };
        }
        if (this.sameId(senderId, conversation.recipientUserId)) {
            return { name: conversation.recipientName || conversation.founderName || 'Founder', role: this.normalizeRole(conversation.recipientRole || 'Founder') };
        }
        if (this.sameId(senderId, conversation.counterpartyUserId)) {
            return { name: conversation.counterpartyName, role: this.normalizeRole(conversation.counterpartyRole || '') };
        }
        return { name: 'Unknown sender', role: '' };
    }
    sameId(left, right) {
        if (left === null || left === undefined || right === null || right === undefined)
            return false;
        return String(left).toLowerCase() === String(right).toLowerCase();
    }
    async offerAction(offer, action) {
        const conversation = this.activeConversation();
        if (!conversation || this.offerProcessing())
            return;
        try {
            this.offerProcessing.set(true);
            this.messagesError.set(null);
            const raw = await this.post(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/offers/${offer.id}/${action}`, {});
            const updated = this.mapOffer(this.asRecord(raw)['data'] ?? raw);
            this.offers.update(items => items.map(item => item.id === updated.id ? updated : item));
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, `Offer could not be ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'withdrawn'}.`));
        }
        finally {
            this.offerProcessing.set(false);
        }
    }
    isOfferCreator(offer) {
        return this.sameId(offer.createdByUserId, this.resolveCurrentUserId(this.activeConversation()));
    }
    buildOfferPayload() {
        const legs = [];
        const equity = this.offerDrafts[1];
        if (equity.enabled) {
            legs.push({
                legType: 1,
                amount: Number(equity.amount.value || 0),
                equityPercentage: equity.equityPercentage?.value || null,
                sharesTerms: equity.sharesTerms?.value?.trim() || null
            });
        }
        const loan = this.offerDrafts[2];
        if (loan.enabled) {
            legs.push({
                legType: 2,
                amount: Number(loan.amount.value || 0),
                returnRate: loan.returnRate?.value || null,
                termMonths: loan.termMonths?.value || null,
                repaymentModel: loan.repaymentModel?.value?.trim() || null
            });
        }
        const profit = this.offerDrafts[3];
        if (profit.enabled) {
            legs.push({
                legType: 3,
                amount: Number(profit.amount.value || 0),
                profitSharePercentage: profit.profitSharePercentage?.value || null,
                termMonths: profit.termMonths?.value || null,
                exitTerms: profit.exitTerms?.value?.trim() || null
            });
        }
        return {
            note: this.offerNoteControl.value?.trim() || null,
            currency: this.offerCurrencyControl.value?.trim() || 'USD',
            legs
        };
    }
    resetOfferBuilder() {
        this.offerNoteControl.setValue('');
        this.offerCurrencyControl.setValue('USD');
        for (const key of [1, 2, 3]) {
            const draft = this.offerDrafts[key];
            draft.enabled = key === 1;
            draft.amount.setValue(null);
            draft.equityPercentage?.setValue(null);
            draft.sharesTerms?.setValue('');
            draft.returnRate?.setValue(null);
            draft.termMonths?.setValue(null);
            draft.repaymentModel?.setValue('Monthly');
            draft.profitSharePercentage?.setValue(null);
            draft.exitTerms?.setValue('');
        }
    }
    seedOfferBuilder(offer) {
        this.offerNoteControl.setValue(offer.note ? `Counter: ${offer.note}` : '');
        this.offerCurrencyControl.setValue(offer.currency || 'USD');
        for (const leg of offer.legs) {
            const draft = this.offerDrafts[leg.legType];
            if (!draft)
                continue;
            draft.enabled = true;
            draft.amount.setValue(leg.amount || null);
            draft.equityPercentage?.setValue(leg.equityPercentage ?? null);
            draft.sharesTerms?.setValue(leg.sharesTerms || '');
            draft.returnRate?.setValue(leg.returnRate ?? null);
            draft.termMonths?.setValue(leg.termMonths ?? null);
            draft.repaymentModel?.setValue(leg.repaymentModel || 'Monthly');
            draft.profitSharePercentage?.setValue(leg.profitSharePercentage ?? null);
            draft.exitTerms?.setValue(leg.exitTerms || '');
        }
    }
    normalizeRole(value) {
        const role = String(value || '').trim().toLowerCase();
        if (role.includes('founder'))
            return 'Founder';
        if (role.includes('investor'))
            return 'Investor';
        return '';
    }
    buildTimeline(conversation) {
        if (!conversation)
            return [];
        const status = conversation.status;
        return [
            { label: 'Conversation Started', date: conversation.createdAt, active: true },
            { label: 'Founder Accepted', active: this.statusAtLeast(status, ['Founder Accepted', 'Negotiation in Progress', 'Ready for Participation', 'Participation Created', 'Participation Approved', 'Participation Rejected']) },
            { label: 'Negotiation Started', active: this.messages().length > 0 || this.statusAtLeast(status, ['Negotiation in Progress', 'Ready for Participation', 'Participation Created', 'Participation Approved', 'Participation Rejected']) },
            { label: 'Founder Ready', active: !!conversation.founderReady },
            { label: 'Investor Ready', active: !!conversation.investorReady },
            { label: 'Participation Request Created', active: this.statusAtLeast(status, ['Participation Created', 'Participation Approved', 'Participation Rejected']) },
            { label: 'Participation Approved', active: status === 'Participation Approved' },
            { label: 'Participation Rejected', active: status === 'Participation Rejected' },
            { label: 'Discussion Closed', date: conversation.closedAt, active: this.isReadOnly(conversation) }
        ];
    }
    buildStageSummary(conversation) {
        if (!conversation)
            return 'Select a conversation to see its current stage.';
        switch (conversation.status) {
            case 'Founder Accepted':
                return 'Negotiation is open and ready for discussion.';
            case 'Negotiation in Progress':
                return 'Negotiation is active. Keep the discussion focused on the opportunity.';
            case 'Ready for Participation':
                return 'One or both parties are ready to proceed.';
            case 'Participation Created':
                return 'A participation request has been created and is waiting for approval.';
            case 'Participation Approved':
                return 'Participation is approved and Project Room is unlocked.';
            case 'Participation Rejected':
                return 'The participation request was not approved.';
            case 'Declined by Founder':
                return 'The Founder declined this discussion.';
            case 'You withdrew':
                return 'You withdrew from this discussion.';
            case 'Discussion Closed':
                return 'This discussion is closed.';
            default:
                return 'Review the conversation thread and the readiness state below.';
        }
    }
    buildParticipationSummary(conversation) {
        if (!conversation)
            return '';
        const state = this.activeViewerState();
        const participationStatus = this.normalizeParticipationStatus(state?.participationStatus);
        if (state?.projectRoomUnlocked || state?.canOpenProjectRoom || participationStatus.includes('approved'))
            return this.t('conversationWorkspace.participation.approved');
        if (state?.hasPendingParticipationRequest || participationStatus.includes('pending'))
            return this.t('conversationWorkspace.participation.pending');
        if (participationStatus.includes('rejected') || participationStatus.includes('declined'))
            return this.t('conversationWorkspace.participation.rejected');
        if (conversation.status === 'Participation Approved')
            return this.t('conversationWorkspace.participation.approved');
        if (conversation.status === 'Participation Rejected')
            return this.t('conversationWorkspace.participation.rejected');
        if (conversation.status === 'Participation Created')
            return this.t('conversationWorkspace.participation.pending');
        return this.t('conversationWorkspace.participation.notCreated');
    }
    activeViewerState() {
        const opportunityId = this.activeConversation()?.opportunityId;
        return opportunityId ? this.viewerStates()[String(opportunityId)] ?? null : null;
    }
    buildNextStep(conversation) {
        if (!conversation)
            return 'No conversation selected.';
        if (this.isReadOnly(conversation))
            return 'This conversation is read-only.';
        if (conversation.status === 'Founder Accepted')
            return 'Continue the discussion and negotiate the details.';
        if (conversation.status === 'Negotiation in Progress' && !this.isCurrentUserReady())
            return 'Mark yourself ready when you are prepared to proceed.';
        if (conversation.status === 'Ready for Participation' && !this.bothReady())
            return 'Readiness helps the negotiation, but an Investor must still submit a Participation Request explicitly.';
        if (this.bothReady() && !this.buildParticipationSummary(conversation).toLowerCase().includes('pending'))
            return 'Both parties are ready. You can now submit your Participation Request.';
        if (conversation.status === 'Participation Created')
            return 'Wait for Founder approval of the participation request.';
        if (conversation.status === 'Participation Approved')
            return 'Open Project Room to continue collaboration.';
        if (conversation.status === 'Participation Rejected')
            return 'The participation request was declined.';
        return 'Use the message thread to continue the discussion.';
    }
    normalizeStatus(value) {
        const raw = String(value || '').toLowerCase().replace(/[\s_-]+/g, '');
        if (raw === '1' || raw.includes('accepted') || raw.includes('founderaccepted'))
            return 'Founder Accepted';
        if (raw === '2' || raw.includes('negotiat') || raw.includes('inprogress'))
            return 'Negotiation in Progress';
        if (raw === '3' || raw === '4' || raw === '6' || raw.includes('closed') || raw.includes('completed'))
            return 'Discussion Closed';
        if (raw === '5' || raw.includes('cancel') || raw.includes('withdraw'))
            return 'You withdrew';
        if (raw === '7' || raw.includes('ready'))
            return 'Ready for Participation';
        if (raw === '8' || raw.includes('participationcreated'))
            return 'Participation Created';
        if (raw === '9' || (raw.includes('approved') && raw.includes('participation')))
            return 'Participation Approved';
        if (raw === '10' || (raw.includes('rejected') && raw.includes('participation')))
            return 'Participation Rejected';
        if (raw === '11' || raw.includes('declined'))
            return 'Declined by Founder';
        if (raw.includes('approved') && raw.includes('participation'))
            return 'Participation Approved';
        if (raw.includes('rejected') && raw.includes('participation'))
            return 'Participation Rejected';
        if (raw.includes('created') && raw.includes('participation'))
            return 'Participation Created';
        if (raw.includes('ready'))
            return 'Ready for Participation';
        if (raw.includes('declined') || raw.includes('rejected'))
            return 'Declined by Founder';
        return 'Negotiation in Progress';
    }
    normalizeParticipationStatus(value) {
        const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        if (raw === '0' || raw.includes('pending'))
            return 'pending';
        if (raw === '1' || raw.includes('approved') || raw.includes('accepted'))
            return 'approved';
        if (raw === '2' || raw.includes('rejected') || raw.includes('declined'))
            return 'rejected';
        if (raw === '3' || raw.includes('cancelled') || raw.includes('canceled'))
            return 'cancelled';
        return raw;
    }
    statusAtLeast(status, states) {
        return states.includes(status);
    }
    isReadOnly(conversation) {
        return !!conversation?.readOnly || conversation?.status === 'Discussion Closed' || conversation?.status === 'Declined by Founder' || conversation?.status === 'You withdrew';
    }
    currentUserLooksInvestor(conversation) {
        return !!conversation.investorName || !conversation.founderName;
    }
    replaceConversation(updated) {
        this.conversations.update(items => items.map(item => item.id === updated.id ? updated : item));
    }
    updateConversationStatus(id, status) {
        this.conversations.update(items => items.map(item => item.id === id ? { ...item, status } : item));
        const selected = this.selectedConversation();
        if (selected?.id === id)
            this.selectedConversation.set({ ...selected, status });
    }
    async get(path) {
        return firstValueFrom(this.http.get(`${this.apiBase}${path}`, this.getHttpOptions()));
    }
    async post(path, body) {
        return firstValueFrom(this.http.post(`${this.apiBase}${path}`, body, this.getHttpOptions()));
    }
    extractArray(raw) {
        const wrapped = this.asRecord(raw);
        const data = wrapped['data'] ?? raw;
        if (Array.isArray(data))
            return data;
        const record = this.asRecord(data);
        if (Array.isArray(record['items']))
            return record['items'];
        if (Array.isArray(record['conversations']))
            return record['conversations'];
        if (Array.isArray(record['messages']))
            return record['messages'];
        return [];
    }
    errorMessage(error, fallback) {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 403)
                return 'You do not have access to this negotiation.';
            if (error.status === 404)
                return 'This negotiation was not found.';
            return error.error?.message || error.message || fallback;
        }
        return error instanceof Error ? error.message : fallback;
    }
    numberValue(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    }
    getHttpOptions() {
        const token = localStorage.getItem('accessToken');
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            })
        };
    }
    normalizeDirection(value) {
        const raw = String(value || '').toLowerCase();
        if (raw.includes('incoming'))
            return 'incoming';
        if (raw.includes('outgoing'))
            return 'outgoing';
        return 'unknown';
    }
    t(path) {
        return this.languageService.translate(path);
    }
    reportReasonLabel(reason) {
        return this.t(`reports.reasons.${reason}`);
    }
    reportErrorMessage(error) {
        const errorRecord = this.asRecord(error);
        const response = this.asRecord(errorRecord['error']);
        const raw = String(response['message'] ?? errorRecord['message'] ?? '').toLowerCase();
        if (raw.includes('duplicate') || raw.includes('pending'))
            return this.t('reports.errors.duplicatePending');
        if (raw.includes('invalid') || raw.includes('target'))
            return this.t('reports.errors.invalidTarget');
        if (raw.includes('self'))
            return this.t('reports.errors.selfReport');
        return this.t('reports.errors.generic');
    }
    confirmationText(action, cost, balance, after) {
        return this.t('paidActions.confirmationText')
            .replace('{action}', action)
            .replace('{cost}', this.formatCredits(cost))
            .replace('{balance}', this.formatCredits(balance))
            .replace('{after}', this.formatCredits(after));
    }
    formatCredits(value) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
    }
    clearSelection() {
        this.selectedConversation.set(null);
        this.selectedRequest.set(null);
        this.messages.set([]);
        this.messagesError.set(null);
    }
    asRecord(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
    }
    stringValue(value) {
        return value === null || value === undefined ? '' : String(value).trim();
    }
    optionalString(value) {
        const result = this.stringValue(value);
        return result || undefined;
    }
    idValue(value) {
        if (typeof value === 'number' && Number.isFinite(value))
            return value;
        return this.optionalString(value);
    }
    dateValue(value) {
        return value instanceof Date || typeof value === 'string' ? value : undefined;
    }
    booleanValue(value) {
        return value === true || value === 1 || String(value).toLowerCase() === 'true';
    }
    offerStatusValue(value) {
        const status = Number(value);
        return status >= 1 && status <= 5 ? status : 1;
    }
    offerLegTypeValue(value) {
        const type = Number(value);
        return type === 2 || type === 3 ? type : 1;
    }
    mapViewerState(value) {
        const row = this.asRecord(value);
        return {
            projectRoomUnlocked: this.booleanValue(row['projectRoomUnlocked']),
            canOpenProjectRoom: this.booleanValue(row['canOpenProjectRoom']),
            hasPendingParticipationRequest: this.booleanValue(row['hasPendingParticipationRequest']),
            participationStatus: this.optionalString(row['participationStatus'])
        };
    }
    mapRequest(value) {
        const row = this.asRecord(value);
        const opportunity = this.asRecord(row['opportunity']);
        const statusRaw = String(row['statusText'] ?? row['status'] ?? '').toLowerCase();
        const status = statusRaw.includes('accept') || statusRaw === '1' ? 'accepted'
            : statusRaw.includes('reject') || statusRaw === '2' ? 'rejected'
                : statusRaw.includes('withdraw') || statusRaw.includes('cancel') || statusRaw === '3' ? 'withdrawn'
                    : 'pending';
        return {
            id: this.stringValue(row['id']),
            opportunityId: this.idValue(row['opportunityId'] ?? opportunity['id']) ?? '',
            opportunityTitle: this.stringValue(opportunity['title']),
            direction: this.normalizeDirection(row['direction']),
            counterpartyUserId: this.idValue(row['counterpartyUserId']),
            counterpartyName: this.stringValue(row['counterpartyName']),
            counterpartyRole: this.optionalString(row['counterpartyRole']),
            message: this.optionalString(row['message']),
            status,
            createdAt: this.dateValue(row['createdAt']),
            updatedAt: this.dateValue(row['updatedAt']),
            canAccept: this.booleanValue(row['canAccept']),
            canReject: this.booleanValue(row['canReject']),
            canWithdraw: this.booleanValue(row['canWithdraw']),
            acceptedConversationId: this.optionalString(row['acceptedConversationId'])
        };
    }
    async hydrateConversationPreview(conversation) {
        if (conversation.lastMessage)
            return conversation;
        try {
            const raw = await this.get(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/messages`);
            const rows = this.extractArray(raw);
            if (!rows.length)
                return conversation;
            const lastMessage = this.mapMessage(rows[rows.length - 1], conversation);
            return { ...conversation, lastMessage: lastMessage.text, lastMessageAt: lastMessage.sentAt };
        }
        catch {
            return conversation;
        }
    }
    async requestAction(request, action) {
        if (this.actionProcessing())
            return;
        try {
            this.actionProcessing.set(true);
            this.messagesError.set(null);
            const body = action === 'reject' ? { reason: '' } : {};
            const raw = await this.post(`/api/v1/conversation-requests/${encodeURIComponent(request.id)}/${action}`, body);
            const data = this.asRecord(raw)['data'];
            const acceptedConversationId = this.optionalString(this.asRecord(data)['acceptedConversationId']);
            await this.loadConversations();
            if (action === 'accept' && acceptedConversationId) {
                this.workspaceTab.set('conversations');
                const conversation = this.conversations().find(item => item.id === acceptedConversationId);
                if (conversation)
                    await this.selectConversation(conversation);
            }
        }
        catch (error) {
            this.messagesError.set(this.errorMessage(error, this.t('conversationWorkspace.errors.requestAction')));
        }
        finally {
            this.actionProcessing.set(false);
        }
    }
    statusLabel(status) {
        const key = {
            'Founder Accepted': 'founderAccepted',
            'Negotiation in Progress': 'inProgress',
            'Declined by Founder': 'declined',
            'You withdrew': 'withdrawn',
            'Ready for Participation': 'ready',
            'Participation Created': 'participationCreated',
            'Participation Approved': 'participationApproved',
            'Participation Rejected': 'participationRejected',
            'Discussion Closed': 'closed'
        };
        return this.t(`conversationWorkspace.status.${key[status]}`);
    }
    requestStatusLabel(status) {
        return this.t(`conversationWorkspace.requestStatus.${status}`);
    }
    roleLabel(role) {
        const normalized = this.normalizeRole(role);
        return normalized ? this.t(`conversationWorkspace.roles.${normalized.toLowerCase()}`) : '';
    }
    investmentModelLabel(value) {
        const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        if (raw.includes('equity') || raw === '1')
            return this.t('conversationWorkspace.offerTypes.equity');
        if (raw.includes('loan') || raw.includes('debt') || raw === '2')
            return this.t('conversationWorkspace.offerTypes.loan');
        if (raw.includes('profit') || raw === '3')
            return this.t('conversationWorkspace.offerTypes.profitSharing');
        return '';
    }
    initials(name) {
        return (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '—';
    }
    founderProfileId(conversation) {
        return conversation.founderUserId ?? null;
    }
    participantFounderProfileId(conversation) {
        return this.sameId(conversation.counterpartyUserId, conversation.founderUserId) ? conversation.founderUserId ?? null : null;
    }
    isMessageGroupStart(index) {
        const current = this.chatItems()[index];
        const previous = this.chatItems()[index - 1];
        return current?.kind === 'message' && (previous?.kind !== 'message' || previous.message.senderId !== current.message.senderId);
    }
    parentOfferVersion(offer) {
        if (!offer.parentOfferId)
            return null;
        return this.offers().find(item => item.id === offer.parentOfferId)?.version ?? null;
    }
    setOfferLegEnabled(type, checked) {
        this.offerDrafts[type].enabled = checked;
    }
    static { this.ɵfac = function ChatComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChatComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChatComponent, selectors: [["app-chat"]], decls: 53, vars: 58, consts: [[1, "conversation-page"], [1, "mobile-switcher"], ["type", "button", 3, "click"], ["type", "button", 3, "click", "disabled"], [1, "workspace-panel", "list-panel"], [1, "panel-heading"], [1, "eyebrow"], ["role", "tablist", 1, "workspace-tabs"], ["type", "button", "role", "tab", 3, "click"], [1, "list-tools"], [1, "search-field"], ["aria-hidden", "true"], ["type", "search", 3, "input", "value", "placeholder"], [3, "value"], [1, "conversation-list"], [1, "compact-state"], [1, "compact-state", "compact-state--error"], [1, "workspace-panel", "chat-panel"], [1, "request-detail"], [1, "empty-workspace"], [1, "workspace-panel", "context-panel"], [1, "modal-backdrop"], [3, "change", "value"], ["value", "all"], ["value", "active"], ["value", "closed"], [1, "spinner"], [1, "list-card", 3, "selected"], [1, "list-card"], ["type", "button", 1, "list-card__select", 3, "click"], [1, "avatar", "avatar--small"], [3, "src", "alt"], [1, "list-card__body"], [1, "list-card__top"], [1, "opportunity-line"], [1, "message-preview"], [1, "status-badge"], [1, "chat-header"], [1, "participant"], [1, "avatar", 3, "routerLink"], [1, "avatar"], [1, "participant-name", 3, "routerLink"], [1, "participant-name"], [1, "chat-opportunity"], [1, "header-actions"], ["type", "button", 1, "primary-button", 3, "disabled"], [1, "ready-chip"], [1, "actions-menu"], ["type", "button"], ["type", "button", 1, "danger-text"], [1, "message-stream"], [1, "inline-error"], [1, "message-composer", 3, "submit"], [3, "formControl", "placeholder", "readonly"], ["type", "submit", 1, "primary-button", 3, "disabled"], ["type", "button", 1, "primary-button", 3, "click", "disabled"], ["type", "button", 1, "danger-text", 3, "click"], [1, "system-event"], [1, "system-event", "system-event--closed"], [1, "message-row", 3, "own", "grouped"], [1, "offer-card", 3, "offer-card--accepted"], [1, "message-row"], [1, "message-meta"], [1, "message-bubble"], [1, "offer-card"], [1, "offer-relation"], [1, "offer-terms"], [1, "offer-note"], ["type", "button", 1, "text-button"], ["type", "button", 1, "primary-button", 3, "click"], ["type", "button", 1, "secondary-button", 3, "click"], ["type", "button", 1, "text-button", 3, "click"], [1, "request-actions"], ["type", "button", 1, "secondary-button", 3, "disabled"], ["type", "button", 1, "secondary-button", 3, "click", "disabled"], [1, "empty-icon"], [1, "context-scroll"], [1, "opportunity-summary"], [1, "opportunity-mark"], [1, "context-section"], [1, "detail-rows"], [1, "readiness-row"], [1, "closed-note"], [1, "context-actions"], [1, "secondary-button", 3, "routerLink"], ["type", "button", 1, "primary-button"], [1, "primary-button", "primary-button--green", 3, "routerLink"], [1, "founder-row", 3, "routerLink"], [1, "founder-row"], [1, "modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", 1, "modal-card", "offer-builder", 3, "click"], ["type", "button", 1, "icon-button", 3, "click"], [1, "builder-grid"], [1, "leg-editor", 3, "enabled"], ["rows", "3", 3, "formControl"], [1, "leg-editor"], [1, "check-row"], ["type", "checkbox", 3, "change", "checked"], ["type", "number", "min", "0", 3, "formControl"], ["type", "number", "min", "0", "max", "100", 3, "formControl"], ["role", "dialog", "aria-modal", "true", 1, "modal-card", "report-modal", 3, "click"], [1, "success-note"], ["rows", "4", 3, "input", "value"], ["source", "Conversation", 3, "opportunityId", "opportunityTitle", "conversationId"], ["source", "Conversation", 3, "closed", "submitted", "opportunityId", "opportunityTitle", "conversationId"]], template: function ChatComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "nav", 1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementStart(3, "button", 2);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_3_listener() { return ctx.setMobileView("list"); });
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "button", 3);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_6_listener() { return ctx.setMobileView("chat"); });
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "button", 3);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_9_listener() { return ctx.setMobileView("context"); });
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "section", 4)(13, "header", 5)(14, "div")(15, "p", 6);
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "h1");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(21, "div", 7)(22, "button", 8);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_22_listener() { return ctx.setWorkspaceTab("incoming"); });
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "button", 8);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_25_listener() { return ctx.setWorkspaceTab("outgoing"); });
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "button", 8);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_28_listener() { return ctx.setWorkspaceTab("conversations"); });
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(31, "div", 9)(32, "label", 10)(33, "span", 11);
            i0.ɵɵtext(34, "\u2315");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "input", 12);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵlistener("input", function ChatComponent_Template_input_input_35_listener($event) { return ctx.setSearchTerm($event.target.value); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(37, ChatComponent_Conditional_37_Template, 11, 13, "select", 13);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "div", 14);
            i0.ɵɵconditionalCreate(39, ChatComponent_Conditional_39_Template, 5, 3, "div", 15)(40, ChatComponent_Conditional_40_Template, 6, 4, "div", 16)(41, ChatComponent_Conditional_41_Template, 3, 1)(42, ChatComponent_Conditional_42_Template, 3, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(43, "section", 17);
            i0.ɵɵconditionalCreate(44, ChatComponent_Conditional_44_Template, 34, 26)(45, ChatComponent_Conditional_45_Template, 20, 14, "div", 18)(46, ChatComponent_Conditional_46_Template, 9, 6, "div", 19);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "aside", 20);
            i0.ɵɵconditionalCreate(48, ChatComponent_Conditional_48_Template, 54, 43)(49, ChatComponent_Conditional_49_Template, 4, 3, "div", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(50, ChatComponent_Conditional_50_Template, 28, 21, "div", 21);
            i0.ɵɵconditionalCreate(51, ChatComponent_Conditional_51_Template, 12, 3, "div", 21);
            i0.ɵɵconditionalCreate(52, ChatComponent_Conditional_52_Template, 1, 1);
        } if (rf & 2) {
            let tmp_24_0;
            let tmp_25_0;
            let tmp_27_0;
            let tmp_28_0;
            i0.ɵɵclassProp("mobile-list", ctx.mobileView() === "list")("mobile-chat", ctx.mobileView() === "chat")("mobile-context", ctx.mobileView() === "context");
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 38, "conversationWorkspace.mobile.navigation"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.mobileView() === "list");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 40, "conversationWorkspace.mobile.list"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.mobileView() === "chat");
            i0.ɵɵproperty("disabled", !ctx.activeConversation() && !ctx.selectedRequest());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 42, "conversationWorkspace.mobile.chat"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.mobileView() === "context");
            i0.ɵɵproperty("disabled", !ctx.activeConversation());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 44, "conversationWorkspace.mobile.context"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 46, "conversationWorkspace.eyebrow"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 48, "conversationWorkspace.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("active", ctx.workspaceTab() === "incoming");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(24, 50, "conversationWorkspace.tabs.incoming"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.workspaceTab() === "outgoing");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 52, "conversationWorkspace.tabs.outgoing"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.workspaceTab() === "conversations");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(30, 54, "conversationWorkspace.tabs.conversations"), " ");
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("value", ctx.searchTerm())("placeholder", i0.ɵɵpipeBind1(36, 56, "conversationWorkspace.search"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.workspaceTab() === "conversations" ? 37 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 39 : ctx.error() ? 40 : ctx.workspaceTab() === "conversations" ? 41 : 42);
            i0.ɵɵadvance(5);
            i0.ɵɵconditional((tmp_24_0 = ctx.activeConversation()) ? 44 : (tmp_24_0 = ctx.selectedRequest()) ? 45 : 46, tmp_24_0);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional((tmp_25_0 = ctx.activeConversation()) ? 48 : 49, tmp_25_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.offerBuilderOpen() ? 50 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_27_0 = ctx.reportModalOpen() && ctx.activeConversation()) ? 51 : -1, tmp_27_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_28_0 = ctx.participationBuilderOpen() && ctx.activeConversation()) ? 52 : -1, tmp_28_0);
        } }, dependencies: [CommonModule, FormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MinValidator, i1.MaxValidator, i1.NgForm, ReactiveFormsModule, i1.FormControlDirective, RouterLink, ParticipationBuilderComponent, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --page: #f3f4f2;\n  --surface: #fff;\n  --surface-soft: #f7f8f6;\n  --surface-strong: #eceeeb;\n  --line: #dfe2dd;\n  --text: #1d211f;\n  --muted: #69706c;\n  --charcoal: #242927;\n  --green: #2f8f62;\n  --green-soft: #e8f5ee;\n  --danger: #b74848;\n  --danger-soft: #fbebeb;\n  display: block;\n  color: var(--text);\n}\n\nbody.investa-theme-dark[_nghost-%COMP%], body.investa-theme-dark   [_nghost-%COMP%], .dark[_nghost-%COMP%], .dark   [_nghost-%COMP%] {\n  --page: #151816;\n  --surface: #1d211f;\n  --surface-soft: #242927;\n  --surface-strong: #2d322f;\n  --line: #343a36;\n  --text: #f2f4f1;\n  --muted: #a4aaa6;\n  --charcoal: #f0f2ef;\n  --green: #52b984;\n  --green-soft: #20382b;\n  --danger: #ef8989;\n  --danger-soft: #402727;\n}\n\n*[_ngcontent-%COMP%] { box-sizing: border-box; }\nbutton[_ngcontent-%COMP%], input[_ngcontent-%COMP%], select[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] { font: inherit; }\nbutton[_ngcontent-%COMP%], a[_ngcontent-%COMP%] { -webkit-tap-highlight-color: transparent; }\n\n.conversation-page[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(260px, 0.78fr) minmax(440px, 1.65fr) minmax(270px, 0.82fr);\n  height: calc(100dvh - 5.25rem);\n  min-height: 620px;\n  overflow: hidden;\n  background: var(--page);\n  border: 1px solid var(--line);\n  border-radius: 18px;\n  box-shadow: 0 8px 28px rgb(20 30 24 / 6%);\n}\n\n.workspace-panel[_ngcontent-%COMP%] { min-width: 0; min-height: 0; background: var(--surface); }\n.list-panel[_ngcontent-%COMP%], .context-panel[_ngcontent-%COMP%] { display: flex; flex-direction: column; }\n.list-panel[_ngcontent-%COMP%] { border-inline-end: 1px solid var(--line); }\n.context-panel[_ngcontent-%COMP%] { border-inline-start: 1px solid var(--line); }\n.chat-panel[_ngcontent-%COMP%] { display: flex; flex-direction: column; background: var(--surface-soft); }\n\n.panel-heading[_ngcontent-%COMP%], .chat-header[_ngcontent-%COMP%] { min-height: 74px; padding: 14px 16px; border-bottom: 1px solid var(--line); background: var(--surface); }\n.panel-heading[_ngcontent-%COMP%] { display: flex; align-items: center; }\n.panel-heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .panel-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .chat-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 2px 0 0; font-size: 1.05rem; line-height: 1.25; }\n.eyebrow[_ngcontent-%COMP%] { margin: 0; color: var(--green); font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\n\n.workspace-tabs[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 8px; border-bottom: 1px solid var(--line); background: var(--surface); }\n.workspace-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-width: 0; padding: 8px 5px; border: 0; border-radius: 9px; color: var(--muted); background: transparent; font-size: .74rem; font-weight: 750; cursor: pointer; }\n.workspace-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { color: var(--text); background: var(--surface-strong); }\n\n.list-tools[_ngcontent-%COMP%] { display: flex; gap: 7px; padding: 9px; border-bottom: 1px solid var(--line); }\n.search-field[_ngcontent-%COMP%] { position: relative; display: flex; flex: 1; align-items: center; min-width: 0; }\n.search-field[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { position: absolute; inset-inline-start: 10px; color: var(--muted); }\n.search-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: 100%; padding: 8px 9px 8px 30px; }\n[dir='rtl'][_ngcontent-%COMP%]   .search-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { padding: 8px 30px 8px 9px; }\ninput[_ngcontent-%COMP%], select[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] { border: 1px solid var(--line); border-radius: 9px; color: var(--text); background: var(--surface); outline: none; }\ninput[_ngcontent-%COMP%]:focus, select[_ngcontent-%COMP%]:focus, textarea[_ngcontent-%COMP%]:focus { border-color: var(--green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--green) 14%, transparent); }\n.list-tools[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { width: 92px; padding: 7px; color: var(--muted); }\n\n.conversation-list[_ngcontent-%COMP%] { flex: 1; min-height: 0; overflow-y: auto; padding: 7px; }\n.list-card[_ngcontent-%COMP%] { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 10px; margin-bottom: 4px; padding: 10px; border: 1px solid transparent; border-radius: 11px; transition: .16s ease; }\n.list-card[_ngcontent-%COMP%]:hover { background: var(--surface-soft); }\n.list-card.selected[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--green) 35%, var(--line)); background: var(--green-soft); }\n.list-card__select[_ngcontent-%COMP%] { position: absolute; inset: 0; z-index: 0; border: 0; border-radius: inherit; background: transparent; cursor: pointer; }\n.list-card[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:not(.list-card__select) { position: relative; z-index: 1; pointer-events: none; }\n.list-card__body[_ngcontent-%COMP%] { min-width: 0; }\n.list-card__top[_ngcontent-%COMP%] { display: flex; justify-content: space-between; gap: 8px; }\n.list-card__top[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { overflow: hidden; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }\n.list-card[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { flex: none; color: var(--muted); font-size: .65rem; }\n.opportunity-line[_ngcontent-%COMP%], .message-preview[_ngcontent-%COMP%] { overflow: hidden; margin: 3px 0 0; color: var(--muted); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }\n.opportunity-line[_ngcontent-%COMP%] { color: var(--text); font-weight: 650; }\n\n.avatar[_ngcontent-%COMP%] { display: inline-flex; width: 43px; height: 43px; flex: none; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--line); border-radius: 50%; color: var(--green); background: var(--green-soft); font-size: .74rem; font-weight: 850; }\n.avatar--small[_ngcontent-%COMP%] { width: 38px; height: 38px; }\n.avatar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\n\n.status-badge[_ngcontent-%COMP%], .ready-chip[_ngcontent-%COMP%] { display: inline-flex; width: fit-content; align-items: center; margin-top: 6px; padding: 3px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); background: var(--surface-soft); font-size: .64rem; font-weight: 800; }\n.status-badge--active[_ngcontent-%COMP%], .status-badge--pending[_ngcontent-%COMP%] { color: var(--text); }\n.status-badge--success[_ngcontent-%COMP%], .ready-chip[_ngcontent-%COMP%] { color: var(--green); border-color: color-mix(in srgb, var(--green) 35%, var(--line)); background: var(--green-soft); }\n.status-badge--closed[_ngcontent-%COMP%] { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 35%, var(--line)); background: var(--danger-soft); }\n\n.chat-header[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 14px; }\n.participant[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 10px; min-width: 0; }\n.participant[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:last-child { min-width: 0; }\n.participant-name[_ngcontent-%COMP%] { display: block; overflow: hidden; color: var(--text); font-size: .9rem; font-weight: 800; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }\na.participant-name[_ngcontent-%COMP%]:hover { color: var(--green); }\n.participant[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 2px 0 0; color: var(--muted); font-size: .7rem; }\n.participant[_ngcontent-%COMP%]   .chat-opportunity[_ngcontent-%COMP%] { overflow: hidden; max-width: 32rem; color: var(--text); font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }\n.header-actions[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 7px; }\n.header-actions[_ngcontent-%COMP%]   .status-badge[_ngcontent-%COMP%] { margin: 0; }\n\n.primary-button[_ngcontent-%COMP%], .secondary-button[_ngcontent-%COMP%], .text-button[_ngcontent-%COMP%] { display: inline-flex; min-height: 34px; align-items: center; justify-content: center; padding: 7px 12px; border-radius: 9px; font-size: .75rem; font-weight: 800; text-decoration: none; cursor: pointer; }\n.primary-button[_ngcontent-%COMP%] { border: 1px solid var(--charcoal); color: var(--surface); background: var(--charcoal); }\nbody.investa-theme-dark[_nghost-%COMP%]   .primary-button[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .primary-button[_ngcontent-%COMP%], .dark[_nghost-%COMP%]   .primary-button[_ngcontent-%COMP%], .dark   [_nghost-%COMP%]   .primary-button[_ngcontent-%COMP%] { color: #1d211f; }\n.primary-button--green[_ngcontent-%COMP%] { border-color: var(--green); color: #fff !important; background: var(--green); }\n.secondary-button[_ngcontent-%COMP%] { border: 1px solid var(--line); color: var(--text); background: var(--surface); }\n.text-button[_ngcontent-%COMP%] { border: 0; color: var(--muted); background: transparent; }\nbutton[_ngcontent-%COMP%]:disabled { opacity: .45; cursor: not-allowed; }\n\n.actions-menu[_ngcontent-%COMP%] { position: relative; }\n.actions-menu[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 9px; background: var(--surface); cursor: pointer; list-style: none; }\n.actions-menu[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]::-webkit-details-marker { display: none; }\n.actions-menu[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { position: absolute; z-index: 20; inset-inline-end: 0; top: 39px; width: 190px; padding: 5px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); box-shadow: 0 14px 34px rgb(0 0 0 / 15%); }\n.actions-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 100%; padding: 8px; border: 0; border-radius: 7px; color: var(--text); text-align: start; background: transparent; cursor: pointer; }\n.actions-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--surface-soft); }\n.actions-menu[_ngcontent-%COMP%]   .danger-text[_ngcontent-%COMP%] { color: var(--danger); }\n\n.message-stream[_ngcontent-%COMP%] { flex: 1; min-height: 0; overflow-y: auto; padding: 18px clamp(14px, 3vw, 42px); }\n.system-event[_ngcontent-%COMP%] { display: flex; justify-content: center; margin: 8px 0 18px; }\n.system-event[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { padding: 4px 9px; border-radius: 999px; color: var(--muted); background: var(--surface-strong); font-size: .65rem; font-weight: 700; }\n.system-event--closed[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--danger); background: var(--danger-soft); }\n.message-row[_ngcontent-%COMP%] { display: flex; flex-direction: column; align-items: flex-start; margin-top: 14px; }\n.message-row.own[_ngcontent-%COMP%] { align-items: flex-end; }\n.message-row.grouped[_ngcontent-%COMP%] { margin-top: 4px; }\n.message-meta[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 6px; margin: 0 7px 4px; font-size: .68rem; }\n.message-meta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--muted); }\n.message-bubble[_ngcontent-%COMP%] { max-width: min(76%, 570px); padding: 9px 11px 6px; border: 1px solid var(--line); border-radius: 13px 13px 13px 4px; background: var(--surface); box-shadow: 0 2px 5px rgb(20 30 24 / 4%); }\n[dir='rtl'][_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { border-radius: 13px 13px 4px 13px; }\n.message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { color: #fff; border-color: #242927; border-radius: 13px 13px 4px 13px; background: #242927; }\n[dir='rtl'][_ngcontent-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { border-radius: 13px 13px 13px 4px; }\n.message-bubble[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; font-size: .82rem; line-height: 1.5; white-space: pre-wrap; }\n.message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { display: block; margin-top: 3px; color: var(--muted); font-size: .58rem; text-align: end; }\n.message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { color: #bfc5c1; }\n\n.offer-card[_ngcontent-%COMP%] { max-width: 590px; margin: 18px auto; padding: 14px; border: 1px solid var(--line); border-inline-start: 3px solid var(--charcoal); border-radius: 13px; background: var(--surface); }\n.offer-card--accepted[_ngcontent-%COMP%] { border-inline-start-color: var(--green); box-shadow: 0 0 0 2px color-mix(in srgb, var(--green) 8%, transparent); }\n.offer-card[_ngcontent-%COMP%]   header[_ngcontent-%COMP%], .offer-card[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\n.offer-card[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   .status-badge[_ngcontent-%COMP%] { margin: 0; }\n.offer-card[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .85rem; }\n.offer-relation[_ngcontent-%COMP%], .offer-note[_ngcontent-%COMP%] { margin: 8px 0 0; color: var(--muted); font-size: .7rem; }\n.offer-terms[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 7px; margin-top: 10px; }\n.offer-terms[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: grid; gap: 2px; padding: 8px; border-radius: 8px; background: var(--surface-soft); }\n.offer-terms[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .offer-terms[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--muted); font-size: .66rem; }\n.offer-terms[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .8rem; }\n.offer-card[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%] { margin-top: 11px; padding-top: 9px; border-top: 1px solid var(--line); }\n.offer-card[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 5px; }\n\n.message-composer[_ngcontent-%COMP%] { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 94%, transparent); }\n.message-composer[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 1; min-width: 0; padding: 9px 11px; }\n.inline-error[_ngcontent-%COMP%] { margin: 0; padding: 7px 14px; color: var(--danger); background: var(--danger-soft); font-size: .72rem; }\n\n.context-scroll[_ngcontent-%COMP%] { min-height: 0; overflow-y: auto; padding: 12px; }\n.opportunity-summary[_ngcontent-%COMP%] { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 10px; align-items: start; padding: 4px 0 13px; }\n.opportunity-mark[_ngcontent-%COMP%] { display: grid; width: 54px; height: 54px; place-items: center; border-radius: 12px; color: var(--green); background: var(--green-soft); font-weight: 900; }\n.opportunity-summary[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], .context-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0; font-size: .82rem; }\n.opportunity-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { display: -webkit-box; overflow: hidden; margin: 4px 0 0; color: var(--muted); font-size: .7rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }\n.context-section[_ngcontent-%COMP%] { padding: 12px 0; border-top: 1px solid var(--line); }\n.founder-row[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: var(--text); font-size: .75rem; text-decoration: none; }\n.detail-rows[_ngcontent-%COMP%] { margin: 7px 0 0; }\n.detail-rows[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%], .readiness-row[_ngcontent-%COMP%] { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: .72rem; }\n.detail-rows[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .readiness-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--muted); }\n.detail-rows[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0; font-weight: 750; text-align: end; }\n.readiness-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--muted); }\n.readiness-row[_ngcontent-%COMP%]   strong.ready[_ngcontent-%COMP%] { color: var(--green); }\n.closed-note[_ngcontent-%COMP%] { padding: 10px; border-radius: 9px; color: var(--danger); background: var(--danger-soft); font-size: .72rem; }\n.closed-note[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 4px 0 0; }\n.context-actions[_ngcontent-%COMP%] { display: grid; gap: 7px; padding-top: 12px; border-top: 1px solid var(--line); }\n\n.compact-state[_ngcontent-%COMP%], .empty-workspace[_ngcontent-%COMP%], .request-detail[_ngcontent-%COMP%] { display: flex; height: 100%; min-height: 180px; align-items: center; justify-content: center; flex-direction: column; padding: 24px; color: var(--muted); text-align: center; }\n.compact-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .empty-workspace[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 6px 0; font-size: .76rem; }\n.compact-state[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding: 6px 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--text); background: var(--surface); }\n.compact-state--error[_ngcontent-%COMP%] { color: var(--danger); }\n.spinner[_ngcontent-%COMP%] { width: 20px; height: 20px; border: 2px solid var(--line); border-top-color: var(--green); border-radius: 50%; animation: _ngcontent-%COMP%_spin .8s linear infinite; }\n@keyframes _ngcontent-%COMP%_spin { to { transform: rotate(360deg); } }\n.empty-icon[_ngcontent-%COMP%] { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; color: var(--green); background: var(--green-soft); }\n.empty-workspace[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .request-detail[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 12px 0 0; color: var(--text); font-size: 1rem; }\n.request-detail[_ngcontent-%COMP%] { max-width: 580px; margin: auto; }\n.request-detail[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 18px 0 0; color: var(--text); font-size: .86rem; }\n.request-detail[_ngcontent-%COMP%]   blockquote[_ngcontent-%COMP%] { margin: 12px 0; padding: 12px; border-inline-start: 3px solid var(--green); border-radius: 8px; color: var(--text); background: var(--surface); font-size: .8rem; }\n.request-actions[_ngcontent-%COMP%] { display: flex; gap: 7px; margin-top: 18px; }\n\n.modal-backdrop[_ngcontent-%COMP%] { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 18px; background: rgb(10 14 12 / 62%); backdrop-filter: blur(3px); }\n.modal-card[_ngcontent-%COMP%] { width: min(680px, 100%); max-height: min(720px, 92dvh); overflow-y: auto; padding: 18px; border: 1px solid var(--line); border-radius: 16px; color: var(--text); background: var(--surface); box-shadow: 0 26px 70px rgb(0 0 0 / 28%); }\n.modal-card[_ngcontent-%COMP%]    > header[_ngcontent-%COMP%], .modal-card[_ngcontent-%COMP%]    > footer[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\n.modal-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 2px 0 0; font-size: 1rem; }\n.modal-card[_ngcontent-%COMP%]    > footer[_ngcontent-%COMP%] { justify-content: flex-end; margin-top: 15px; }\n.modal-card[_ngcontent-%COMP%]    > label[_ngcontent-%COMP%] { display: grid; gap: 6px; margin-top: 12px; color: var(--muted); font-size: .72rem; font-weight: 700; }\n.modal-card[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .modal-card[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .modal-card[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { width: 100%; padding: 9px; }\n.icon-button[_ngcontent-%COMP%] { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 9px; color: var(--text); background: var(--surface); cursor: pointer; }\n.builder-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }\n.leg-editor[_ngcontent-%COMP%] { padding: 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-soft); }\n.leg-editor.enabled[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--green) 35%, var(--line)); }\n.leg-editor[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: grid; gap: 5px; margin-top: 8px; color: var(--muted); font-size: .68rem; }\n.leg-editor[_ngcontent-%COMP%]   .check-row[_ngcontent-%COMP%] { display: flex; align-items: center; margin: 0; color: var(--text); }\n.check-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: auto !important; }\n.success-note[_ngcontent-%COMP%] { margin-top: 14px; padding: 10px; border-radius: 9px; color: var(--green); background: var(--green-soft); }\n\n.mobile-switcher[_ngcontent-%COMP%] { display: none; }\n\n@media (max-width: 1080px) {\n  .conversation-page[_ngcontent-%COMP%] { grid-template-columns: 250px minmax(400px, 1fr) 260px; }\n  .header-actions[_ngcontent-%COMP%]   .status-badge[_ngcontent-%COMP%] { display: none; }\n}\n\n@media (max-width: 820px) {\n  .conversation-page[_ngcontent-%COMP%] { position: relative; display: block; height: calc(100dvh - 4.5rem); min-height: 480px; padding-top: 46px; border-radius: 0; }\n  .mobile-switcher[_ngcontent-%COMP%] { position: absolute; z-index: 30; inset: 0 0 auto; display: grid; height: 46px; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 6px; border-bottom: 1px solid var(--line); background: var(--surface); }\n  .mobile-switcher[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { border: 0; border-radius: 8px; color: var(--muted); background: transparent; font-size: .72rem; font-weight: 800; }\n  .mobile-switcher[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { color: var(--text); background: var(--surface-strong); }\n  .workspace-panel[_ngcontent-%COMP%] { display: none; height: 100%; border: 0; }\n  .mobile-list[_ngcontent-%COMP%]   .list-panel[_ngcontent-%COMP%], .mobile-chat[_ngcontent-%COMP%]   .chat-panel[_ngcontent-%COMP%], .mobile-context[_ngcontent-%COMP%]   .context-panel[_ngcontent-%COMP%] { display: flex; }\n  .message-stream[_ngcontent-%COMP%] { padding: 14px 12px; }\n  .message-bubble[_ngcontent-%COMP%] { max-width: 88%; }\n  .chat-header[_ngcontent-%COMP%] { min-height: 68px; padding: 10px; }\n  .chat-header[_ngcontent-%COMP%]   .avatar[_ngcontent-%COMP%] { width: 38px; height: 38px; }\n  .header-actions[_ngcontent-%COMP%]   .ready-chip[_ngcontent-%COMP%] { display: none; }\n  .primary-button[_ngcontent-%COMP%] { min-height: 32px; padding: 6px 9px; }\n  .message-composer[_ngcontent-%COMP%] { position: sticky; bottom: 0; padding: 8px; }\n  .builder-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChatComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-chat', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ParticipationBuilderComponent, TranslatePipe], template: "<main class=\"conversation-page\" [class.mobile-list]=\"mobileView() === 'list'\" [class.mobile-chat]=\"mobileView() === 'chat'\" [class.mobile-context]=\"mobileView() === 'context'\">\n  <nav class=\"mobile-switcher\" [attr.aria-label]=\"'conversationWorkspace.mobile.navigation' | translate\">\n    <button type=\"button\" [class.active]=\"mobileView() === 'list'\" (click)=\"setMobileView('list')\">{{ 'conversationWorkspace.mobile.list' | translate }}</button>\n    <button type=\"button\" [class.active]=\"mobileView() === 'chat'\" [disabled]=\"!activeConversation() && !selectedRequest()\" (click)=\"setMobileView('chat')\">{{ 'conversationWorkspace.mobile.chat' | translate }}</button>\n    <button type=\"button\" [class.active]=\"mobileView() === 'context'\" [disabled]=\"!activeConversation()\" (click)=\"setMobileView('context')\">{{ 'conversationWorkspace.mobile.context' | translate }}</button>\n  </nav>\n\n  <section class=\"workspace-panel list-panel\">\n    <header class=\"panel-heading\">\n      <div>\n        <p class=\"eyebrow\">{{ 'conversationWorkspace.eyebrow' | translate }}</p>\n        <h1>{{ 'conversationWorkspace.title' | translate }}</h1>\n      </div>\n    </header>\n\n    <div class=\"workspace-tabs\" role=\"tablist\">\n      <button type=\"button\" role=\"tab\" [class.active]=\"workspaceTab() === 'incoming'\" (click)=\"setWorkspaceTab('incoming')\">\n        {{ 'conversationWorkspace.tabs.incoming' | translate }}\n      </button>\n      <button type=\"button\" role=\"tab\" [class.active]=\"workspaceTab() === 'outgoing'\" (click)=\"setWorkspaceTab('outgoing')\">\n        {{ 'conversationWorkspace.tabs.outgoing' | translate }}\n      </button>\n      <button type=\"button\" role=\"tab\" [class.active]=\"workspaceTab() === 'conversations'\" (click)=\"setWorkspaceTab('conversations')\">\n        {{ 'conversationWorkspace.tabs.conversations' | translate }}\n      </button>\n    </div>\n\n    <div class=\"list-tools\">\n      <label class=\"search-field\">\n        <span aria-hidden=\"true\">\u2315</span>\n        <input type=\"search\" [value]=\"searchTerm()\" (input)=\"setSearchTerm($event.target.value)\" [placeholder]=\"'conversationWorkspace.search' | translate\">\n      </label>\n      @if (workspaceTab() === 'conversations') {\n        <select [value]=\"conversationFilter()\" (change)=\"setConversationFilter($event.target.value)\" [attr.aria-label]=\"'conversationWorkspace.filter.label' | translate\">\n          <option value=\"all\">{{ 'conversationWorkspace.filter.all' | translate }}</option>\n          <option value=\"active\">{{ 'conversationWorkspace.filter.active' | translate }}</option>\n          <option value=\"closed\">{{ 'conversationWorkspace.filter.closed' | translate }}</option>\n        </select>\n      }\n    </div>\n\n    <div class=\"conversation-list\">\n      @if (loading()) {\n        <div class=\"compact-state\"><span class=\"spinner\"></span><p>{{ 'conversationWorkspace.loading' | translate }}</p></div>\n      } @else if (error()) {\n        <div class=\"compact-state compact-state--error\"><p>{{ error() }}</p><button type=\"button\" (click)=\"loadConversations()\">{{ 'conversationWorkspace.retry' | translate }}</button></div>\n      } @else if (workspaceTab() === 'conversations') {\n        @for (conversation of visibleConversations(); track conversation.id) {\n          <article class=\"list-card\" [class.selected]=\"activeConversation()?.id === conversation.id\">\n            <button type=\"button\" class=\"list-card__select\" (click)=\"selectConversation(conversation)\" [attr.aria-label]=\"conversation.counterpartyName\"></button>\n            <div class=\"avatar avatar--small\">\n              @if (conversation.avatarUrl) { <img [src]=\"conversation.avatarUrl\" [alt]=\"conversation.counterpartyName\"> }\n              @else { <span>{{ initials(conversation.counterpartyName) }}</span> }\n            </div>\n            <div class=\"list-card__body\">\n              <div class=\"list-card__top\"><strong>{{ conversation.counterpartyName }}</strong><time>{{ formatTime(conversation.lastMessageAt) }}</time></div>\n              <p class=\"opportunity-line\">{{ conversation.opportunityTitle }}</p>\n              @if (conversation.lastMessage) { <p class=\"message-preview\">{{ conversation.lastMessage }}</p> }\n              <span [class]=\"statusBadgeClass(conversation.status)\">{{ statusLabel(conversation.status) }}</span>\n            </div>\n          </article>\n        } @empty {\n          <div class=\"compact-state\"><p>{{ 'conversationWorkspace.empty.conversations' | translate }}</p></div>\n        }\n      } @else {\n        @for (request of visibleRequests(); track request.id) {\n          <article class=\"list-card\" [class.selected]=\"selectedRequest()?.id === request.id\">\n            <button type=\"button\" class=\"list-card__select\" (click)=\"selectRequest(request)\" [attr.aria-label]=\"request.counterpartyName\"></button>\n            <div class=\"avatar avatar--small\"><span>{{ initials(request.counterpartyName) }}</span></div>\n            <div class=\"list-card__body\">\n              <div class=\"list-card__top\"><strong>{{ request.counterpartyName }}</strong><time>{{ formatDate(request.updatedAt || request.createdAt) }}</time></div>\n              <p class=\"opportunity-line\">{{ request.opportunityTitle }}</p>\n              @if (request.message) { <p class=\"message-preview\">{{ request.message }}</p> }\n              <span class=\"status-badge\" [class.status-badge--success]=\"request.status === 'accepted'\" [class.status-badge--closed]=\"request.status === 'rejected' || request.status === 'withdrawn'\">{{ requestStatusLabel(request.status) }}</span>\n            </div>\n          </article>\n        } @empty {\n          <div class=\"compact-state\"><p>{{ 'conversationWorkspace.empty.requests' | translate }}</p></div>\n        }\n      }\n    </div>\n  </section>\n\n  <section class=\"workspace-panel chat-panel\">\n    @if (activeConversation(); as conversation) {\n      <header class=\"chat-header\">\n        <div class=\"participant\">\n          @if (participantFounderProfileId(conversation); as founderId) {\n            <a class=\"avatar\" [routerLink]=\"['/admin/founders', founderId]\">\n              @if (conversation.avatarUrl) { <img [src]=\"conversation.avatarUrl\" [alt]=\"conversation.counterpartyName\"> }\n              @else { <span>{{ initials(conversation.counterpartyName) }}</span> }\n            </a>\n          } @else {\n            <div class=\"avatar\">\n              @if (conversation.avatarUrl) { <img [src]=\"conversation.avatarUrl\" [alt]=\"conversation.counterpartyName\"> }\n              @else { <span>{{ initials(conversation.counterpartyName) }}</span> }\n            </div>\n          }\n          <div>\n            @if (participantFounderProfileId(conversation); as founderId) {\n              <a class=\"participant-name\" [routerLink]=\"['/admin/founders', founderId]\">{{ conversation.counterpartyName }}</a>\n            } @else { <strong class=\"participant-name\">{{ conversation.counterpartyName }}</strong> }\n            @if (roleLabel(conversation.counterpartyRole)) { <p>{{ roleLabel(conversation.counterpartyRole) }}</p> }\n            <p class=\"chat-opportunity\">{{ conversation.opportunityTitle }}</p>\n          </div>\n        </div>\n        <div class=\"header-actions\">\n          <span [class]=\"statusBadgeClass(conversation.status)\">{{ statusLabel(conversation.status) }}</span>\n          @if (canMarkReady()) {\n            <button type=\"button\" class=\"primary-button\" (click)=\"markReadyToProceed()\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.ready' | translate }}</button>\n          } @else if (isCurrentUserReady() && !isClosed()) {\n            <span class=\"ready-chip\">\u2713 {{ 'conversationWorkspace.status.youReady' | translate }}</span>\n          }\n          <details class=\"actions-menu\">\n            <summary [attr.aria-label]=\"'conversationWorkspace.actions.more' | translate\">\u2022\u2022\u2022</summary>\n            <div>\n              @if (!isClosed()) { <button type=\"button\" (click)=\"openOfferBuilder()\">{{ 'conversationWorkspace.actions.makeOffer' | translate }}</button> }\n              @if (canCloseDiscussion()) { <button type=\"button\" (click)=\"closeDiscussion()\">{{ 'conversationWorkspace.actions.close' | translate }}</button> }\n              @if (canReportConversationUser(conversation)) { <button type=\"button\" (click)=\"openConversationReport(conversation)\">{{ conversationReportLabel(conversation) }}</button> }\n              @if (isClosed()) { <button type=\"button\" class=\"danger-text\" (click)=\"removeClosedConversation(conversation)\">{{ 'conversationWorkspace.actions.remove' | translate }}</button> }\n            </div>\n          </details>\n        </div>\n      </header>\n\n      <div class=\"message-stream\">\n        @if (messagesLoading()) {\n          <div class=\"compact-state\"><span class=\"spinner\"></span><p>{{ 'conversationWorkspace.messages.loading' | translate }}</p></div>\n        } @else {\n          <div class=\"system-event\"><span>{{ 'conversationWorkspace.events.started' | translate }} \u00B7 {{ formatDate(conversation.createdAt) }}</span></div>\n          @for (item of chatItems(); track item.id; let index = $index) {\n            @if (item.kind === 'message') {\n              <article class=\"message-row\" [class.own]=\"item.message.isSender\" [class.grouped]=\"!isMessageGroupStart(index)\">\n                @if (isMessageGroupStart(index)) {\n                  <div class=\"message-meta\"><strong>{{ item.message.isSender ? ('conversationWorkspace.messages.you' | translate) : item.message.senderName }}</strong>@if (item.message.senderRole) { <span>{{ roleLabel(item.message.senderRole) }}</span> }</div>\n                }\n                <div class=\"message-bubble\"><p>{{ item.message.text }}</p><time>{{ formatTime(item.message.sentAt) }}</time></div>\n              </article>\n            } @else {\n            <article class=\"offer-card\" [class.offer-card--accepted]=\"isAcceptedOffer(item.offer)\">\n              <header>\n                <div><p class=\"eyebrow\">{{ 'conversationWorkspace.offers.version' | translate }} {{ item.offer.version }}</p><strong>{{ 'conversationWorkspace.offers.title' | translate }}</strong></div>\n                <span class=\"status-badge\" [class.status-badge--success]=\"isAcceptedOffer(item.offer)\">{{ offerStatusLabel(item.offer.status) }}</span>\n              </header>\n              @if (parentOfferVersion(item.offer); as parentVersion) { <p class=\"offer-relation\">\u21B3 {{ 'conversationWorkspace.offers.counters' | translate }} {{ parentVersion }}</p> }\n              <div class=\"offer-terms\">\n                @for (leg of item.offer.legs; track leg.id || leg.legType) {\n                  <div><span>{{ offerLegLabel(leg.legType) }}</span><strong>{{ money(leg.amount) }}</strong>\n                    @if (leg.equityPercentage) { <small>{{ leg.equityPercentage }}%</small> }\n                    @if (leg.returnRate) { <small>{{ leg.returnRate }}%</small> }\n                    @if (leg.profitSharePercentage) { <small>{{ leg.profitSharePercentage }}%</small> }\n                  </div>\n                }\n              </div>\n              @if (item.offer.note) { <p class=\"offer-note\">{{ item.offer.note }}</p> }\n              <footer><time>{{ formatDate(item.offer.createdAt) }} \u00B7 {{ formatTime(item.offer.createdAt) }}</time><div>\n                @if (canReceiveOfferAction(item.offer)) {\n                  <button type=\"button\" class=\"primary-button\" (click)=\"acceptOffer(item.offer)\">{{ 'conversationWorkspace.actions.accept' | translate }}</button>\n                  <button type=\"button\" class=\"secondary-button\" (click)=\"openOfferBuilder(item.offer)\">{{ 'conversationWorkspace.actions.counter' | translate }}</button>\n                  <button type=\"button\" class=\"text-button\" (click)=\"rejectOffer(item.offer)\">{{ 'conversationWorkspace.actions.reject' | translate }}</button>\n                } @else if (canWithdrawOffer(item.offer)) {\n                  <button type=\"button\" class=\"text-button\" (click)=\"withdrawOffer(item.offer)\">{{ 'conversationWorkspace.actions.withdraw' | translate }}</button>\n                }\n              </div></footer>\n            </article>\n            }\n          } @empty {\n            <div class=\"compact-state\"><p>{{ 'conversationWorkspace.messages.empty' | translate }}</p></div>\n          }\n          @if (isClosed()) {\n            <div class=\"system-event system-event--closed\"><span>{{ 'conversationWorkspace.events.closed' | translate }} \u00B7 {{ formatDate(conversation.closedAt) }}</span></div>\n          }\n        }\n      </div>\n\n      @if (messagesError()) { <p class=\"inline-error\">{{ messagesError() }}</p> }\n      <form class=\"message-composer\" (submit)=\"onMessageSubmit($event)\">\n        <input [formControl]=\"messageControl\" [placeholder]=\"composerHint()\" [readonly]=\"isClosed()\">\n        <button type=\"submit\" class=\"primary-button\" [disabled]=\"!canSendMessage()\">{{ sending() ? ('conversationWorkspace.composer.sending' | translate) : ('conversationWorkspace.composer.send' | translate) }}</button>\n      </form>\n    } @else if (selectedRequest(); as request) {\n      <div class=\"request-detail\">\n        <div class=\"avatar\"><span>{{ initials(request.counterpartyName) }}</span></div>\n        <p class=\"eyebrow\">{{ workspaceTab() === 'incoming' ? ('conversationWorkspace.tabs.incoming' | translate) : ('conversationWorkspace.tabs.outgoing' | translate) }}</p>\n        <h2>{{ request.counterpartyName }}</h2>\n        @if (roleLabel(request.counterpartyRole)) { <p>{{ roleLabel(request.counterpartyRole) }}</p> }\n        <h3>{{ request.opportunityTitle }}</h3>\n        @if (request.message) { <blockquote>{{ request.message }}</blockquote> }\n        <span class=\"status-badge\">{{ requestStatusLabel(request.status) }}</span>\n        <div class=\"request-actions\">\n          @if (request.canAccept) { <button type=\"button\" class=\"primary-button\" (click)=\"acceptRequest(request)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.accept' | translate }}</button> }\n          @if (request.canReject) { <button type=\"button\" class=\"secondary-button\" (click)=\"rejectRequest(request)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.reject' | translate }}</button> }\n          @if (request.canWithdraw) { <button type=\"button\" class=\"secondary-button\" (click)=\"withdrawRequest(request)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.withdraw' | translate }}</button> }\n        </div>\n      </div>\n    } @else {\n      <div class=\"empty-workspace\"><div class=\"empty-icon\">\u2194</div><h2>{{ 'chat.empty.noConversationTitle' | translate }}</h2><p>{{ 'chat.empty.noConversationSubtitle' | translate }}</p></div>\n    }\n  </section>\n\n  <aside class=\"workspace-panel context-panel\">\n    @if (activeConversation(); as conversation) {\n      <header class=\"panel-heading\"><div><p class=\"eyebrow\">{{ 'conversationWorkspace.context.eyebrow' | translate }}</p><h2>{{ 'conversationWorkspace.context.title' | translate }}</h2></div></header>\n      <div class=\"context-scroll\">\n        <section class=\"opportunity-summary\">\n          <div class=\"opportunity-mark\">{{ initials(conversation.opportunityTitle) }}</div>\n          <div><h3>{{ conversation.opportunityTitle }}</h3>@if (conversation.shortDescription) { <p>{{ conversation.shortDescription }}</p> }</div>\n        </section>\n        @if (conversation.founderName) {\n          <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.founder' | translate }}</h3>\n            @if (founderProfileId(conversation); as founderId) { <a class=\"founder-row\" [routerLink]=\"['/admin/founders', founderId]\"><span class=\"avatar avatar--small\">{{ initials(conversation.founderName) }}</span><strong>{{ conversation.founderName }}</strong></a> }\n            @else { <div class=\"founder-row\"><span class=\"avatar avatar--small\">{{ initials(conversation.founderName) }}</span><strong>{{ conversation.founderName }}</strong></div> }\n          </section>\n        }\n        <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.details' | translate }}</h3><dl class=\"detail-rows\">\n          @if (investmentModelLabel(conversation.investmentModel)) { <div><dt>{{ 'conversationWorkspace.context.model' | translate }}</dt><dd>{{ investmentModelLabel(conversation.investmentModel) }}</dd></div> }\n          @if (conversation.fundingTarget) { <div><dt>{{ 'conversationWorkspace.context.target' | translate }}</dt><dd>{{ money(conversation.fundingTarget) }}</dd></div> }\n          @if (conversation.minimumParticipation) { <div><dt>{{ 'conversationWorkspace.context.minimum' | translate }}</dt><dd>{{ money(conversation.minimumParticipation) }}</dd></div> }\n          <div><dt>{{ 'conversationWorkspace.context.participation' | translate }}</dt><dd>{{ participationSummary() }}</dd></div>\n        </dl></section>\n        <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.readiness' | translate }}</h3><div class=\"readiness-row\"><span>{{ 'conversationWorkspace.roles.founder' | translate }}</span><strong [class.ready]=\"conversation.founderReady\">{{ (conversation.founderReady ? 'conversationWorkspace.status.readyShort' : 'conversationWorkspace.status.notReady') | translate }}</strong></div><div class=\"readiness-row\"><span>{{ 'conversationWorkspace.roles.investor' | translate }}</span><strong [class.ready]=\"conversation.investorReady\">{{ (conversation.investorReady ? 'conversationWorkspace.status.readyShort' : 'conversationWorkspace.status.notReady') | translate }}</strong></div></section>\n        @if (isClosed()) { <section class=\"closed-note\"><strong>{{ 'conversationWorkspace.events.closed' | translate }}</strong>@if (conversation.closeReason) { <p>{{ conversation.closeReason }}</p> }</section> }\n        <div class=\"context-actions\">\n          @if (conversation.opportunityId) { <a class=\"secondary-button\" [routerLink]=\"['/admin/investments', conversation.opportunityId]\">{{ 'conversationWorkspace.actions.viewOpportunity' | translate }}</a> }\n          @if (canCreateParticipationRequest()) { <button type=\"button\" class=\"primary-button\" (click)=\"openParticipationBuilder()\">{{ 'conversationWorkspace.actions.participate' | translate }}</button> }\n          @if (projectRoomUnlocked() && conversation.opportunityId) { <a class=\"primary-button primary-button--green\" [routerLink]=\"['/admin/opportunities', conversation.opportunityId, 'room']\">{{ 'conversationWorkspace.actions.openRoom' | translate }}</a> }\n        </div>\n      </div>\n    } @else { <div class=\"compact-state\"><p>{{ 'conversationWorkspace.context.empty' | translate }}</p></div> }\n  </aside>\n</main>\n\n@if (offerBuilderOpen()) {\n  <div class=\"modal-backdrop\" (click)=\"closeOfferBuilder()\">\n    <section class=\"modal-card offer-builder\" (click)=\"$event.stopPropagation()\" role=\"dialog\" aria-modal=\"true\">\n      <header><div><p class=\"eyebrow\">{{ counteringOfferId() ? ('chat.offerBuilder.counterOffer' | translate) : ('chat.offerBuilder.makeOffer' | translate) }}</p><h2>{{ 'conversationWorkspace.offers.terms' | translate }}</h2></div><button type=\"button\" class=\"icon-button\" (click)=\"closeOfferBuilder()\">\u00D7</button></header>\n      <div class=\"builder-grid\">\n        @for (type of offerLegTypes; track type) {\n          <section class=\"leg-editor\" [class.enabled]=\"offerDrafts[type].enabled\">\n            <label class=\"check-row\"><input type=\"checkbox\" [checked]=\"offerDrafts[type].enabled\" (change)=\"setOfferLegEnabled(type, $event.target.checked)\"><strong>{{ offerLegLabel(type) }}</strong></label>\n            @if (offerDrafts[type].enabled) {\n              <label>{{ 'chat.offerBuilder.amount' | translate }}<input type=\"number\" min=\"0\" [formControl]=\"offerDrafts[type].amount\"></label>\n              @if (type === 1) { <label>{{ 'chat.offerBuilder.equityPercentage' | translate }}<input type=\"number\" min=\"0\" max=\"100\" [formControl]=\"offerDrafts[1].equityPercentage!\"></label> }\n              @if (type === 2) { <label>{{ 'chat.offerBuilder.returnPercentage' | translate }}<input type=\"number\" min=\"0\" [formControl]=\"offerDrafts[2].returnRate!\"></label> }\n              @if (type === 3) { <label>{{ 'conversationWorkspace.offers.profitPercentage' | translate }}<input type=\"number\" min=\"0\" max=\"100\" [formControl]=\"offerDrafts[3].profitSharePercentage!\"></label> }\n            }\n          </section>\n        }\n      </div>\n      <label>{{ 'chat.offerBuilder.offerNote' | translate }}<textarea rows=\"3\" [formControl]=\"offerNoteControl\"></textarea></label>\n      <footer><button type=\"button\" class=\"secondary-button\" (click)=\"closeOfferBuilder()\">{{ 'conversationWorkspace.actions.cancel' | translate }}</button><button type=\"button\" class=\"primary-button\" (click)=\"submitOffer()\" [disabled]=\"offerProcessing()\">{{ counteringOfferId() ? ('chat.offerBuilder.sendCounter' | translate) : ('chat.offerBuilder.sendOffer' | translate) }}</button></footer>\n    </section>\n  </div>\n}\n\n@if (reportModalOpen() && activeConversation(); as conversation) {\n  <div class=\"modal-backdrop\" (click)=\"closeReportModal()\"><section class=\"modal-card report-modal\" (click)=\"$event.stopPropagation()\" role=\"dialog\" aria-modal=\"true\"><header><div><p class=\"eyebrow\">{{ conversationReportLabel(conversation) }}</p><h2>{{ conversationReportTargetName(conversation) }}</h2></div><button type=\"button\" class=\"icon-button\" (click)=\"closeReportModal()\">\u00D7</button></header>\n    @if (reportSuccess()) { <div class=\"success-note\">{{ 'reports.success' | translate }}</div> }\n    @else { <label>{{ 'reports.reason' | translate }}<select [value]=\"reportReason()\" (change)=\"setReportReason($event.target.value)\">@for (reason of reportReasons; track reason) { <option [value]=\"reason\">{{ reportReasonLabel(reason) }}</option> }</select></label><label>{{ 'reports.description' | translate }}<textarea rows=\"4\" [value]=\"reportDescription()\" (input)=\"setReportDescription($event.target.value)\"></textarea></label>@if (reportError()) { <p class=\"inline-error\">{{ reportError() }}</p> }<footer><button type=\"button\" class=\"secondary-button\" (click)=\"closeReportModal()\">{{ 'conversationWorkspace.actions.cancel' | translate }}</button><button type=\"button\" class=\"primary-button\" (click)=\"submitConversationReport()\" [disabled]=\"reportSubmitting()\">{{ reportSubmitting() ? ('reports.submitting' | translate) : ('reports.submit' | translate) }}</button></footer> }\n  </section></div>\n}\n\n@if (participationBuilderOpen() && activeConversation(); as conversation) {\n  @if (conversation.opportunityId; as opportunityId) {\n    <app-participation-builder [opportunityId]=\"opportunityId\" [opportunityTitle]=\"conversation.opportunityTitle\" source=\"Conversation\" [conversationId]=\"conversation.id\" (closed)=\"closeParticipationBuilder()\" (submitted)=\"onParticipationSubmitted()\"></app-participation-builder>\n  }\n}\n", styles: [":host {\n  --page: #f3f4f2;\n  --surface: #fff;\n  --surface-soft: #f7f8f6;\n  --surface-strong: #eceeeb;\n  --line: #dfe2dd;\n  --text: #1d211f;\n  --muted: #69706c;\n  --charcoal: #242927;\n  --green: #2f8f62;\n  --green-soft: #e8f5ee;\n  --danger: #b74848;\n  --danger-soft: #fbebeb;\n  display: block;\n  color: var(--text);\n}\n\n:host-context(body.investa-theme-dark), :host-context(.dark) {\n  --page: #151816;\n  --surface: #1d211f;\n  --surface-soft: #242927;\n  --surface-strong: #2d322f;\n  --line: #343a36;\n  --text: #f2f4f1;\n  --muted: #a4aaa6;\n  --charcoal: #f0f2ef;\n  --green: #52b984;\n  --green-soft: #20382b;\n  --danger: #ef8989;\n  --danger-soft: #402727;\n}\n\n* { box-sizing: border-box; }\nbutton, input, select, textarea { font: inherit; }\nbutton, a { -webkit-tap-highlight-color: transparent; }\n\n.conversation-page {\n  display: grid;\n  grid-template-columns: minmax(260px, 0.78fr) minmax(440px, 1.65fr) minmax(270px, 0.82fr);\n  height: calc(100dvh - 5.25rem);\n  min-height: 620px;\n  overflow: hidden;\n  background: var(--page);\n  border: 1px solid var(--line);\n  border-radius: 18px;\n  box-shadow: 0 8px 28px rgb(20 30 24 / 6%);\n}\n\n.workspace-panel { min-width: 0; min-height: 0; background: var(--surface); }\n.list-panel, .context-panel { display: flex; flex-direction: column; }\n.list-panel { border-inline-end: 1px solid var(--line); }\n.context-panel { border-inline-start: 1px solid var(--line); }\n.chat-panel { display: flex; flex-direction: column; background: var(--surface-soft); }\n\n.panel-heading, .chat-header { min-height: 74px; padding: 14px 16px; border-bottom: 1px solid var(--line); background: var(--surface); }\n.panel-heading { display: flex; align-items: center; }\n.panel-heading h1, .panel-heading h2, .chat-header h2 { margin: 2px 0 0; font-size: 1.05rem; line-height: 1.25; }\n.eyebrow { margin: 0; color: var(--green); font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\n\n.workspace-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 8px; border-bottom: 1px solid var(--line); background: var(--surface); }\n.workspace-tabs button { min-width: 0; padding: 8px 5px; border: 0; border-radius: 9px; color: var(--muted); background: transparent; font-size: .74rem; font-weight: 750; cursor: pointer; }\n.workspace-tabs button.active { color: var(--text); background: var(--surface-strong); }\n\n.list-tools { display: flex; gap: 7px; padding: 9px; border-bottom: 1px solid var(--line); }\n.search-field { position: relative; display: flex; flex: 1; align-items: center; min-width: 0; }\n.search-field span { position: absolute; inset-inline-start: 10px; color: var(--muted); }\n.search-field input { width: 100%; padding: 8px 9px 8px 30px; }\n[dir='rtl'] .search-field input { padding: 8px 30px 8px 9px; }\ninput, select, textarea { border: 1px solid var(--line); border-radius: 9px; color: var(--text); background: var(--surface); outline: none; }\ninput:focus, select:focus, textarea:focus { border-color: var(--green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--green) 14%, transparent); }\n.list-tools select { width: 92px; padding: 7px; color: var(--muted); }\n\n.conversation-list { flex: 1; min-height: 0; overflow-y: auto; padding: 7px; }\n.list-card { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 10px; margin-bottom: 4px; padding: 10px; border: 1px solid transparent; border-radius: 11px; transition: .16s ease; }\n.list-card:hover { background: var(--surface-soft); }\n.list-card.selected { border-color: color-mix(in srgb, var(--green) 35%, var(--line)); background: var(--green-soft); }\n.list-card__select { position: absolute; inset: 0; z-index: 0; border: 0; border-radius: inherit; background: transparent; cursor: pointer; }\n.list-card > *:not(.list-card__select) { position: relative; z-index: 1; pointer-events: none; }\n.list-card__body { min-width: 0; }\n.list-card__top { display: flex; justify-content: space-between; gap: 8px; }\n.list-card__top strong { overflow: hidden; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }\n.list-card time { flex: none; color: var(--muted); font-size: .65rem; }\n.opportunity-line, .message-preview { overflow: hidden; margin: 3px 0 0; color: var(--muted); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }\n.opportunity-line { color: var(--text); font-weight: 650; }\n\n.avatar { display: inline-flex; width: 43px; height: 43px; flex: none; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--line); border-radius: 50%; color: var(--green); background: var(--green-soft); font-size: .74rem; font-weight: 850; }\n.avatar--small { width: 38px; height: 38px; }\n.avatar img { width: 100%; height: 100%; object-fit: cover; }\n\n.status-badge, .ready-chip { display: inline-flex; width: fit-content; align-items: center; margin-top: 6px; padding: 3px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); background: var(--surface-soft); font-size: .64rem; font-weight: 800; }\n.status-badge--active, .status-badge--pending { color: var(--text); }\n.status-badge--success, .ready-chip { color: var(--green); border-color: color-mix(in srgb, var(--green) 35%, var(--line)); background: var(--green-soft); }\n.status-badge--closed { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 35%, var(--line)); background: var(--danger-soft); }\n\n.chat-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; }\n.participant { display: flex; align-items: center; gap: 10px; min-width: 0; }\n.participant > div:last-child { min-width: 0; }\n.participant-name { display: block; overflow: hidden; color: var(--text); font-size: .9rem; font-weight: 800; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }\na.participant-name:hover { color: var(--green); }\n.participant p { margin: 2px 0 0; color: var(--muted); font-size: .7rem; }\n.participant .chat-opportunity { overflow: hidden; max-width: 32rem; color: var(--text); font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }\n.header-actions { display: flex; align-items: center; gap: 7px; }\n.header-actions .status-badge { margin: 0; }\n\n.primary-button, .secondary-button, .text-button { display: inline-flex; min-height: 34px; align-items: center; justify-content: center; padding: 7px 12px; border-radius: 9px; font-size: .75rem; font-weight: 800; text-decoration: none; cursor: pointer; }\n.primary-button { border: 1px solid var(--charcoal); color: var(--surface); background: var(--charcoal); }\n:host-context(body.investa-theme-dark) .primary-button, :host-context(.dark) .primary-button { color: #1d211f; }\n.primary-button--green { border-color: var(--green); color: #fff !important; background: var(--green); }\n.secondary-button { border: 1px solid var(--line); color: var(--text); background: var(--surface); }\n.text-button { border: 0; color: var(--muted); background: transparent; }\nbutton:disabled { opacity: .45; cursor: not-allowed; }\n\n.actions-menu { position: relative; }\n.actions-menu summary { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 9px; background: var(--surface); cursor: pointer; list-style: none; }\n.actions-menu summary::-webkit-details-marker { display: none; }\n.actions-menu > div { position: absolute; z-index: 20; inset-inline-end: 0; top: 39px; width: 190px; padding: 5px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); box-shadow: 0 14px 34px rgb(0 0 0 / 15%); }\n.actions-menu button { width: 100%; padding: 8px; border: 0; border-radius: 7px; color: var(--text); text-align: start; background: transparent; cursor: pointer; }\n.actions-menu button:hover { background: var(--surface-soft); }\n.actions-menu .danger-text { color: var(--danger); }\n\n.message-stream { flex: 1; min-height: 0; overflow-y: auto; padding: 18px clamp(14px, 3vw, 42px); }\n.system-event { display: flex; justify-content: center; margin: 8px 0 18px; }\n.system-event span { padding: 4px 9px; border-radius: 999px; color: var(--muted); background: var(--surface-strong); font-size: .65rem; font-weight: 700; }\n.system-event--closed span { color: var(--danger); background: var(--danger-soft); }\n.message-row { display: flex; flex-direction: column; align-items: flex-start; margin-top: 14px; }\n.message-row.own { align-items: flex-end; }\n.message-row.grouped { margin-top: 4px; }\n.message-meta { display: flex; align-items: center; gap: 6px; margin: 0 7px 4px; font-size: .68rem; }\n.message-meta span { color: var(--muted); }\n.message-bubble { max-width: min(76%, 570px); padding: 9px 11px 6px; border: 1px solid var(--line); border-radius: 13px 13px 13px 4px; background: var(--surface); box-shadow: 0 2px 5px rgb(20 30 24 / 4%); }\n[dir='rtl'] .message-bubble { border-radius: 13px 13px 4px 13px; }\n.message-row.own .message-bubble { color: #fff; border-color: #242927; border-radius: 13px 13px 4px 13px; background: #242927; }\n[dir='rtl'] .message-row.own .message-bubble { border-radius: 13px 13px 13px 4px; }\n.message-bubble p { margin: 0; font-size: .82rem; line-height: 1.5; white-space: pre-wrap; }\n.message-bubble time { display: block; margin-top: 3px; color: var(--muted); font-size: .58rem; text-align: end; }\n.message-row.own .message-bubble time { color: #bfc5c1; }\n\n.offer-card { max-width: 590px; margin: 18px auto; padding: 14px; border: 1px solid var(--line); border-inline-start: 3px solid var(--charcoal); border-radius: 13px; background: var(--surface); }\n.offer-card--accepted { border-inline-start-color: var(--green); box-shadow: 0 0 0 2px color-mix(in srgb, var(--green) 8%, transparent); }\n.offer-card header, .offer-card footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\n.offer-card header .status-badge { margin: 0; }\n.offer-card header strong { font-size: .85rem; }\n.offer-relation, .offer-note { margin: 8px 0 0; color: var(--muted); font-size: .7rem; }\n.offer-terms { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 7px; margin-top: 10px; }\n.offer-terms > div { display: grid; gap: 2px; padding: 8px; border-radius: 8px; background: var(--surface-soft); }\n.offer-terms span, .offer-terms small { color: var(--muted); font-size: .66rem; }\n.offer-terms strong { font-size: .8rem; }\n.offer-card footer { margin-top: 11px; padding-top: 9px; border-top: 1px solid var(--line); }\n.offer-card footer > div { display: flex; flex-wrap: wrap; gap: 5px; }\n\n.message-composer { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 94%, transparent); }\n.message-composer input { flex: 1; min-width: 0; padding: 9px 11px; }\n.inline-error { margin: 0; padding: 7px 14px; color: var(--danger); background: var(--danger-soft); font-size: .72rem; }\n\n.context-scroll { min-height: 0; overflow-y: auto; padding: 12px; }\n.opportunity-summary { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 10px; align-items: start; padding: 4px 0 13px; }\n.opportunity-mark { display: grid; width: 54px; height: 54px; place-items: center; border-radius: 12px; color: var(--green); background: var(--green-soft); font-weight: 900; }\n.opportunity-summary h3, .context-section h3 { margin: 0; font-size: .82rem; }\n.opportunity-summary p { display: -webkit-box; overflow: hidden; margin: 4px 0 0; color: var(--muted); font-size: .7rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }\n.context-section { padding: 12px 0; border-top: 1px solid var(--line); }\n.founder-row { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: var(--text); font-size: .75rem; text-decoration: none; }\n.detail-rows { margin: 7px 0 0; }\n.detail-rows > div, .readiness-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: .72rem; }\n.detail-rows dt, .readiness-row span { color: var(--muted); }\n.detail-rows dd { margin: 0; font-weight: 750; text-align: end; }\n.readiness-row strong { color: var(--muted); }\n.readiness-row strong.ready { color: var(--green); }\n.closed-note { padding: 10px; border-radius: 9px; color: var(--danger); background: var(--danger-soft); font-size: .72rem; }\n.closed-note p { margin: 4px 0 0; }\n.context-actions { display: grid; gap: 7px; padding-top: 12px; border-top: 1px solid var(--line); }\n\n.compact-state, .empty-workspace, .request-detail { display: flex; height: 100%; min-height: 180px; align-items: center; justify-content: center; flex-direction: column; padding: 24px; color: var(--muted); text-align: center; }\n.compact-state p, .empty-workspace p { margin: 6px 0; font-size: .76rem; }\n.compact-state button { padding: 6px 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--text); background: var(--surface); }\n.compact-state--error { color: var(--danger); }\n.spinner { width: 20px; height: 20px; border: 2px solid var(--line); border-top-color: var(--green); border-radius: 50%; animation: spin .8s linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }\n.empty-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; color: var(--green); background: var(--green-soft); }\n.empty-workspace h2, .request-detail h2 { margin: 12px 0 0; color: var(--text); font-size: 1rem; }\n.request-detail { max-width: 580px; margin: auto; }\n.request-detail h3 { margin: 18px 0 0; color: var(--text); font-size: .86rem; }\n.request-detail blockquote { margin: 12px 0; padding: 12px; border-inline-start: 3px solid var(--green); border-radius: 8px; color: var(--text); background: var(--surface); font-size: .8rem; }\n.request-actions { display: flex; gap: 7px; margin-top: 18px; }\n\n.modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 18px; background: rgb(10 14 12 / 62%); backdrop-filter: blur(3px); }\n.modal-card { width: min(680px, 100%); max-height: min(720px, 92dvh); overflow-y: auto; padding: 18px; border: 1px solid var(--line); border-radius: 16px; color: var(--text); background: var(--surface); box-shadow: 0 26px 70px rgb(0 0 0 / 28%); }\n.modal-card > header, .modal-card > footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\n.modal-card h2 { margin: 2px 0 0; font-size: 1rem; }\n.modal-card > footer { justify-content: flex-end; margin-top: 15px; }\n.modal-card > label { display: grid; gap: 6px; margin-top: 12px; color: var(--muted); font-size: .72rem; font-weight: 700; }\n.modal-card label input, .modal-card label select, .modal-card label textarea { width: 100%; padding: 9px; }\n.icon-button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 9px; color: var(--text); background: var(--surface); cursor: pointer; }\n.builder-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }\n.leg-editor { padding: 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-soft); }\n.leg-editor.enabled { border-color: color-mix(in srgb, var(--green) 35%, var(--line)); }\n.leg-editor label { display: grid; gap: 5px; margin-top: 8px; color: var(--muted); font-size: .68rem; }\n.leg-editor .check-row { display: flex; align-items: center; margin: 0; color: var(--text); }\n.check-row input { width: auto !important; }\n.success-note { margin-top: 14px; padding: 10px; border-radius: 9px; color: var(--green); background: var(--green-soft); }\n\n.mobile-switcher { display: none; }\n\n@media (max-width: 1080px) {\n  .conversation-page { grid-template-columns: 250px minmax(400px, 1fr) 260px; }\n  .header-actions .status-badge { display: none; }\n}\n\n@media (max-width: 820px) {\n  .conversation-page { position: relative; display: block; height: calc(100dvh - 4.5rem); min-height: 480px; padding-top: 46px; border-radius: 0; }\n  .mobile-switcher { position: absolute; z-index: 30; inset: 0 0 auto; display: grid; height: 46px; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 6px; border-bottom: 1px solid var(--line); background: var(--surface); }\n  .mobile-switcher button { border: 0; border-radius: 8px; color: var(--muted); background: transparent; font-size: .72rem; font-weight: 800; }\n  .mobile-switcher button.active { color: var(--text); background: var(--surface-strong); }\n  .workspace-panel { display: none; height: 100%; border: 0; }\n  .mobile-list .list-panel, .mobile-chat .chat-panel, .mobile-context .context-panel { display: flex; }\n  .message-stream { padding: 14px 12px; }\n  .message-bubble { max-width: 88%; }\n  .chat-header { min-height: 68px; padding: 10px; }\n  .chat-header .avatar { width: 38px; height: 38px; }\n  .header-actions .ready-chip { display: none; }\n  .primary-button { min-height: 32px; padding: 6px 9px; }\n  .message-composer { position: sticky; bottom: 0; padding: 8px; }\n  .builder-grid { grid-template-columns: 1fr; }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ChatComponent, { className: "ChatComponent", filePath: "src/app/pages/admin/chat/chat.component.ts", lineNumber: 182 }); })();
