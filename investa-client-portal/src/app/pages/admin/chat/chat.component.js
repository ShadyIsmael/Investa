import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { API_BASE } from '../../../config/api.token';
import { OfferBuilderComponent } from '../../../components/offer-builder/offer-builder.component';
import { repaymentModelLabelKey } from '../../../models/offer.model';
import { LanguageService } from '../../../services/language.service';
import { CurrencyService } from '../../../services/currency.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ReportService } from '../../../services/report.service';
import { FirebaseClientService } from '../../../services/firebase-client.service';
import { NotificationService } from '../../../services/notification.service';
import { updateConversationPreview, upsertAuthoritativeMessage } from './conversation-realtime.reducer';
import { buildConversationTimeline } from './conversation-timeline.reducer';
import { scrollToLatest } from './chat-scroll.util';
import { normalizeOfferStatus, offerConversationId, offerRealtimeAction } from './conversation-offer-realtime.util';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = ["messageStream"];
const _c1 = a0 => ["/admin/founders", a0];
const _c2 = a0 => ["/admin/investments", a0];
const _c3 = a0 => ["/admin/opportunities", a0, "room"];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.key;
const _forTrack2 = ($index, $item) => $item.id || $item.legType;
function ChatComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "select", 24);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("change", function ChatComponent_Conditional_37_Template_select_change_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setConversationFilter($event.target.value)); });
    i0.ɵɵelementStart(2, "option", 25);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "option", 26);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 27);
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
    i0.ɵɵelementStart(0, "div", 16);
    i0.ɵɵelement(1, "span", 28);
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
    i0.ɵɵelementStart(0, "div", 17)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 3);
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
    i0.ɵɵelement(0, "img", 33);
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
function ChatComponent_Conditional_41_For_1_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 2, "notifications.unread"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r5.unreadCount);
} }
function ChatComponent_Conditional_41_For_1_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r5.lastMessage);
} }
function ChatComponent_Conditional_41_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 30)(1, "button", 31);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_41_For_1_Template_button_click_1_listener() { const conversation_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectConversation(conversation_r5)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 32);
    i0.ɵɵconditionalCreate(3, ChatComponent_Conditional_41_For_1_Conditional_3_Template, 1, 2, "img", 33)(4, ChatComponent_Conditional_41_For_1_Conditional_4_Template, 2, 1, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 34)(6, "div", 35)(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 36)(10, "time");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, ChatComponent_Conditional_41_For_1_Conditional_12_Template, 3, 4, "span", 37);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "p", 38);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, ChatComponent_Conditional_41_For_1_Conditional_15_Template, 2, 1, "p", 39);
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
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
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.formatTime(conversation_r5.lastMessageAt));
    i0.ɵɵadvance();
    i0.ɵɵconditional((conversation_r5.unreadCount ?? 0) > 0 ? 12 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r5.opportunityTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r5.lastMessage ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r1.statusBadgeClass(conversation_r5.status));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.statusLabel(conversation_r5.status));
} }
function ChatComponent_Conditional_41_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.empty.conversations"));
} }
function ChatComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ChatComponent_Conditional_41_For_1_Template, 18, 12, "article", 29, _forTrack0, false, ChatComponent_Conditional_41_ForEmpty_2_Template, 4, 3, "div", 16);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r1.visibleConversations());
} }
function ChatComponent_Conditional_42_For_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(request_r7.message);
} }
function ChatComponent_Conditional_42_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 30)(1, "button", 31);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_42_For_1_Template_button_click_1_listener() { const request_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectRequest(request_r7)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 32)(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 34)(6, "div", 35)(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "time");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "p", 38);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ChatComponent_Conditional_42_For_1_Conditional_13_Template, 2, 1, "p", 39);
    i0.ɵɵelementStart(14, "span", 40);
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
    i0.ɵɵelementStart(0, "div", 16)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.empty.requests"));
} }
function ChatComponent_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ChatComponent_Conditional_42_For_1_Template, 16, 13, "article", 29, _forTrack0, false, ChatComponent_Conditional_42_ForEmpty_2_Template, 4, 3, "div", 16);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r1.visibleRequests());
} }
function ChatComponent_Conditional_44_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const conversation_r10 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openConversationReport(conversation_r10)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.report"));
} }
function ChatComponent_Conditional_44_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 47);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.terminalJourneyStatus());
} }
function ChatComponent_Conditional_44_For_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span", 56);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 57);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const step_r11 = ctx.$implicit;
    const $index_r12 = ctx.$index;
    i0.ɵɵclassProp("completed", step_r11.state === "completed")("current", step_r11.state === "current")("future", step_r11.state === "future");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(step_r11.state === "completed" ? "\u2713" : $index_r12 + 1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(step_r11.label);
} }
function ChatComponent_Conditional_44_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16);
    i0.ɵɵelement(1, "span", 28);
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "conversationWorkspace.messages.loading"));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 63);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.initials(item_r13.message.senderName));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_3_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.roleLabel(item_r13.message.senderRole));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 65)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_3_Conditional_4_Template, 2, 1, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r13.message.isSender ? i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.messages.you") : item_r13.message.senderName);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r13.message.senderRole ? 4 : -1);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 63);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.initials(item_r13.message.senderName));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 62);
    i0.ɵɵconditionalCreate(1, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_1_Template, 2, 1, "span", 63);
    i0.ɵɵelementStart(2, "div", 64);
    i0.ɵɵconditionalCreate(3, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_3_Template, 5, 4, "div", 65);
    i0.ɵɵelementStart(4, "div", 66)(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "time");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(9, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Conditional_9_Template, 2, 1, "span", 63);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r13 = i0.ɵɵnextContext();
    const item_r13 = ctx_r13.$implicit;
    const ɵ$index_244_r15 = ctx_r13.$index;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("own", item_r13.message.isSender)("grouped", !ctx_r1.isMessageGroupStart(ɵ$index_244_r15));
    i0.ɵɵadvance();
    i0.ɵɵconditional(!item_r13.message.isSender ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isMessageGroupStart(ɵ$index_244_r15) ? 3 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r13.message.text);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatTime(item_r13.message.sentAt));
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r13.message.isSender ? 9 : -1);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_9_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵtextInterpolate1(" \u00B7 ", ctx_r1.roleLabel(item_r13.offer.createdByRole), " ");
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 68);
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_9_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r13.offer.createdByName);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r13.offer.createdByRole ? 2 : -1);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 68);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("\u21B3 ", i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.replaces"), " ", ctx);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.equityPercentage"), ": ", leg_r16.equityPercentage, "%");
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(leg_r16.sharesTerms);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.returnRate"), ": ", leg_r16.returnRate, "%");
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate3("", i0.ɵɵpipeBind1(2, 3, "conversationWorkspace.offers.term"), ": ", leg_r16.termMonths, " ", i0.ɵɵpipeBind1(3, 5, "conversationWorkspace.offers.months"));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.repayment"), ": ", ctx_r1.repaymentModelLabel(leg_r16.repaymentModel));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.offers.profitPercentage"), ": ", leg_r16.profitSharePercentage, "%");
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(leg_r16.exitTerms);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_5_Template, 3, 4, "small");
    i0.ɵɵconditionalCreate(6, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_6_Template, 2, 1, "small");
    i0.ɵɵconditionalCreate(7, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_7_Template, 3, 4, "small");
    i0.ɵɵconditionalCreate(8, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_8_Template, 4, 7, "small");
    i0.ɵɵconditionalCreate(9, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_9_Template, 3, 4, "small");
    i0.ɵɵconditionalCreate(10, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_10_Template, 3, 4, "small");
    i0.ɵɵconditionalCreate(11, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Conditional_11_Template, 2, 1, "small");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const leg_r16 = ctx.$implicit;
    const item_r13 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.offerLegLabel(leg_r16.legType));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.money(leg_r16.amount, item_r13.offer.currency));
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.equityPercentage ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.sharesTerms ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.returnRate ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.termMonths ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.repaymentModel ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.profitSharePercentage ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(leg_r16.exitTerms ? 11 : -1);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r13.offer.note);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 73);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_21_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r17); const item_r13 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.acceptOffer(item_r13.offer)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.accept"));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_22_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r18); const item_r13 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openOfferBuilder(item_r13.offer)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.respondWithOffer"));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 74);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_23_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r19); const item_r13 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.rejectOffer(item_r13.offer)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.reject"));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 74);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r20); const item_r13 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.withdrawOffer(item_r13.offer)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "conversationWorkspace.actions.withdraw"));
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 67)(1, "header")(2, "div")(3, "p", 7);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "strong");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_9_Template, 3, 2, "p", 68);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span", 40);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(12, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_12_Template, 3, 4, "p", 68);
    i0.ɵɵelementStart(13, "div", 69);
    i0.ɵɵrepeaterCreate(14, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_For_15_Template, 12, 9, "div", null, _forTrack2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(16, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_16_Template, 2, 1, "p", 70);
    i0.ɵɵelementStart(17, "footer")(18, "time");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div");
    i0.ɵɵconditionalCreate(21, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_21_Template, 3, 3, "button", 71);
    i0.ɵɵconditionalCreate(22, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_22_Template, 3, 3, "button", 44);
    i0.ɵɵconditionalCreate(23, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_23_Template, 3, 3, "button", 72);
    i0.ɵɵconditionalCreate(24, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Conditional_24_Template, 3, 3, "button", 72);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_22_0;
    const item_r13 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("offer-card--accepted", ctx_r1.isAcceptedOffer(item_r13.offer));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(5, 17, "conversationWorkspace.offers.version"), " ", item_r13.offer.version);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 19, "conversationWorkspace.offers.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r13.offer.createdByName ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("status-badge--success", ctx_r1.isAcceptedOffer(item_r13.offer));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.offerStatusLabel(item_r13.offer.status));
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = ctx_r1.replacedOfferVersion(item_r13.offer)) ? 12 : -1, tmp_22_0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(item_r13.offer.legs);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r13.offer.note ? 16 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r1.formatDate(item_r13.offer.createdAt), " \u00B7 ", ctx_r1.formatTime(item_r13.offer.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canReceiveOfferAction(item_r13.offer) ? 21 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canRespondOfferAction(item_r13.offer) ? 22 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canRejectOfferAction(item_r13.offer) ? 23 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canWithdrawOffer(item_r13.offer) ? 24 : -1);
} }
function ChatComponent_Conditional_44_Conditional_23_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_0_Template, 10, 9, "article", 60)(1, ChatComponent_Conditional_44_Conditional_23_For_5_Conditional_1_Template, 25, 21, "article", 61);
} if (rf & 2) {
    const item_r13 = ctx.$implicit;
    i0.ɵɵconditional(item_r13.kind === "message" ? 0 : 1);
} }
function ChatComponent_Conditional_44_Conditional_23_ForEmpty_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.messages.empty"));
} }
function ChatComponent_Conditional_44_Conditional_23_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 59)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r10 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.events.closed"), " \u00B7 ", ctx_r1.formatDate(conversation_r10.closedAt));
} }
function ChatComponent_Conditional_44_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 58)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(4, ChatComponent_Conditional_44_Conditional_23_For_5_Template, 2, 1, null, null, _forTrack0, false, ChatComponent_Conditional_44_Conditional_23_ForEmpty_6_Template, 4, 3, "div", 16);
    i0.ɵɵconditionalCreate(7, ChatComponent_Conditional_44_Conditional_23_Conditional_7_Template, 4, 4, "div", 59);
} if (rf & 2) {
    const conversation_r10 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(3, 4, "conversationWorkspace.events.started"), " \u00B7 ", ctx_r1.formatDate(conversation_r10.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.chatItems());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.isClosed() ? 7 : -1);
} }
function ChatComponent_Conditional_44_Conditional_24_Template(rf, ctx) { if (rf & 1) {
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
    i0.ɵɵelementStart(0, "header", 41)(1, "div", 42)(2, "button", 43);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_44_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openOfferBuilder()); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ChatComponent_Conditional_44_Conditional_5_Template, 3, 3, "button", 44);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "section", 45);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementStart(8, "div", 46)(9, "div")(10, "p", 7);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "h2");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(16, ChatComponent_Conditional_44_Conditional_16_Template, 2, 1, "span", 47);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "ol", 48);
    i0.ɵɵrepeaterCreate(18, ChatComponent_Conditional_44_For_19_Template, 5, 8, "li", 49, _forTrack1);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "div", 50, 0);
    i0.ɵɵconditionalCreate(22, ChatComponent_Conditional_44_Conditional_22_Template, 5, 3, "div", 16)(23, ChatComponent_Conditional_44_Conditional_23_Template, 8, 6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(24, ChatComponent_Conditional_44_Conditional_24_Template, 2, 1, "p", 51);
    i0.ɵɵelementStart(25, "form", 52);
    i0.ɵɵlistener("submit", function ChatComponent_Conditional_44_Template_form_submit_25_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onMessageSubmit($event)); });
    i0.ɵɵelement(26, "input", 53);
    i0.ɵɵelementStart(27, "button", 54);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.isClosed() || ctx_r1.offerProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 14, "conversationWorkspace.actions.createOffer"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canReportConversationUser(ctx) ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 16, "conversationWorkspace.journey.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 18, "conversationWorkspace.journey.eyebrow"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 20, "conversationWorkspace.journey.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.terminalJourneyStatus() ? 16 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.journeySteps());
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.messagesLoading() ? 22 : 23);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.messagesError() ? 24 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r1.messageControl)("placeholder", ctx_r1.composerHint())("readonly", ctx_r1.isClosed());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r1.canSendMessage());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.sending() ? i0.ɵɵpipeBind1(29, 22, "conversationWorkspace.composer.sending") : i0.ɵɵpipeBind1(30, 24, "conversationWorkspace.composer.send"));
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
    i0.ɵɵelementStart(0, "button", 43);
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
    i0.ɵɵelementStart(0, "button", 79);
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
function ChatComponent_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "div", 75)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "p", 7);
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
    i0.ɵɵelementStart(14, "span", 40);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 76);
    i0.ɵɵconditionalCreate(17, ChatComponent_Conditional_45_Conditional_17_Template, 3, 4, "button", 77);
    i0.ɵɵconditionalCreate(18, ChatComponent_Conditional_45_Conditional_18_Template, 3, 4, "button", 78);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r21 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.initials(request_r21.counterpartyName));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.workspaceTab() === "incoming" ? i0.ɵɵpipeBind1(6, 9, "conversationWorkspace.tabs.incoming") : i0.ɵɵpipeBind1(7, 11, "conversationWorkspace.tabs.outgoing"));
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
} }
function ChatComponent_Conditional_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20)(1, "div", 80);
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
    const conversation_r24 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r24.shortDescription);
} }
function ChatComponent_Conditional_48_Conditional_16_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 93)(1, "span", 32);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(3, _c1, ctx));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r24.founderName));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r24.founderName);
} }
function ChatComponent_Conditional_48_Conditional_16_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 94)(1, "span", 32);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r24.founderName));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversation_r24.founderName);
} }
function ChatComponent_Conditional_48_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 84)(1, "h3");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_48_Conditional_16_Conditional_4_Template, 5, 5, "a", 93)(5, ChatComponent_Conditional_48_Conditional_16_Conditional_5_Template, 5, 2, "div", 94);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_4_0;
    const conversation_r24 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.founder"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_4_0 = ctx_r1.founderProfileId(conversation_r24)) ? 4 : 5, tmp_4_0);
} }
function ChatComponent_Conditional_48_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.model"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.investmentModelLabel(conversation_r24.investmentModel));
} }
function ChatComponent_Conditional_48_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.target"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(conversation_r24.fundingTarget, ctx_r1.conversationCurrency(conversation_r24)));
} }
function ChatComponent_Conditional_48_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.context.minimum"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.money(conversation_r24.minimumParticipation, ctx_r1.conversationCurrency(conversation_r24)));
} }
function ChatComponent_Conditional_48_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 95);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_48_Conditional_62_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.markReadyToProceed()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.ready"));
} }
function ChatComponent_Conditional_48_Conditional_63_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversation_r24.closeReason);
} }
function ChatComponent_Conditional_48_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 88)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ChatComponent_Conditional_48_Conditional_63_Conditional_4_Template, 2, 1, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.events.closed"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(conversation_r24.closeReason ? 4 : -1);
} }
function ChatComponent_Conditional_48_Conditional_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 90);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c2, conversation_r24.opportunityId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.viewOpportunity"));
} }
function ChatComponent_Conditional_48_Conditional_66_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 91);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r24 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c3, conversation_r24.opportunityId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.openRoom"));
} }
function ChatComponent_Conditional_48_Conditional_67_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_48_Conditional_67_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeDiscussion()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.close"));
} }
function ChatComponent_Conditional_48_Conditional_68_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_48_Conditional_68_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r27); const conversation_r24 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.removeClosedConversation(conversation_r24)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "conversationWorkspace.actions.remove"));
} }
function ChatComponent_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 6)(1, "div")(2, "p", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 81)(9, "section", 82)(10, "div", 83);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div")(13, "h3");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, ChatComponent_Conditional_48_Conditional_15_Template, 2, 1, "p");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(16, ChatComponent_Conditional_48_Conditional_16_Template, 6, 4, "section", 84);
    i0.ɵɵelementStart(17, "section", 84)(18, "h3");
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dl", 85)(22, "div")(23, "dt");
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "dd");
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(28, ChatComponent_Conditional_48_Conditional_28_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(29, ChatComponent_Conditional_48_Conditional_29_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(30, ChatComponent_Conditional_48_Conditional_30_Template, 6, 4, "div");
    i0.ɵɵelementStart(31, "div")(32, "dt");
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "dd");
    i0.ɵɵtext(36);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(37, "section", 84)(38, "h3");
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "div", 86)(42, "span");
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "strong");
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(48, "div", 86)(49, "span");
    i0.ɵɵtext(50);
    i0.ɵɵpipe(51, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(52, "strong");
    i0.ɵɵtext(53);
    i0.ɵɵpipe(54, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(55, "div", 86)(56, "span");
    i0.ɵɵtext(57);
    i0.ɵɵpipe(58, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "strong");
    i0.ɵɵtext(60);
    i0.ɵɵpipe(61, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(62, ChatComponent_Conditional_48_Conditional_62_Template, 3, 4, "button", 87);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(63, ChatComponent_Conditional_48_Conditional_63_Template, 5, 4, "section", 88);
    i0.ɵɵelementStart(64, "div", 89);
    i0.ɵɵconditionalCreate(65, ChatComponent_Conditional_48_Conditional_65_Template, 3, 6, "a", 90);
    i0.ɵɵconditionalCreate(66, ChatComponent_Conditional_48_Conditional_66_Template, 3, 6, "a", 91);
    i0.ɵɵconditionalCreate(67, ChatComponent_Conditional_48_Conditional_67_Template, 3, 4, "button", 92);
    i0.ɵɵconditionalCreate(68, ChatComponent_Conditional_48_Conditional_68_Template, 3, 4, "button", 92);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r24 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 33, "conversationWorkspace.context.eyebrow"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 35, "conversationWorkspace.context.title"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.initials(conversation_r24.opportunityTitle));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(conversation_r24.opportunityTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r24.shortDescription ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r24.founderName ? 16 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 37, "conversationWorkspace.context.details"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 39, "conversationWorkspace.context.conversationStatus"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.statusLabel(conversation_r24.status));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.investmentModelLabel(conversation_r24.investmentModel) ? 28 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r24.fundingTarget ? 29 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversation_r24.minimumParticipation ? 30 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 41, "conversationWorkspace.context.participation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.participationSummary());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 43, "conversationWorkspace.context.readiness"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 45, "conversationWorkspace.roles.founder"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("ready", conversation_r24.founderReady);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 47, conversation_r24.founderReady ? "conversationWorkspace.status.readyShort" : "conversationWorkspace.status.notReady"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 49, "conversationWorkspace.roles.investor"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("ready", conversation_r24.investorReady);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(54, 51, conversation_r24.investorReady ? "conversationWorkspace.status.readyShort" : "conversationWorkspace.status.notReady"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(58, 53, "conversationWorkspace.context.yourReadyState"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("ready", ctx_r1.isCurrentUserReady());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(61, 55, ctx_r1.isCurrentUserReady() ? "conversationWorkspace.status.readyShort" : "conversationWorkspace.status.notReady"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canMarkReady() ? 62 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isClosed() ? 63 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(conversation_r24.opportunityId ? 65 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.projectRoomUnlocked() && conversation_r24.opportunityId ? 66 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canCloseDiscussion() ? 67 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isClosed() ? 68 : -1);
} }
function ChatComponent_Conditional_49_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r28 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.roleLabel(request_r28.counterpartyRole));
} }
function ChatComponent_Conditional_49_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 89)(1, "button", 96);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_49_Conditional_44_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r29); const request_r28 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.withdrawRequest(request_r28)); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.actionProcessing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "conversationWorkspace.actions.withdraw"));
} }
function ChatComponent_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 6)(1, "div")(2, "p", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 81)(9, "section", 82)(10, "div", 83);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div")(13, "h3");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "section", 84)(16, "h3");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 94)(20, "span", 32);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "div")(23, "strong");
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(25, ChatComponent_Conditional_49_Conditional_25_Template, 2, 1, "small");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "section", 84)(27, "h3");
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "dl", 85)(31, "div")(32, "dt");
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "dd");
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "div")(39, "dt");
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "dd");
    i0.ɵɵtext(43);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(44, ChatComponent_Conditional_49_Conditional_44_Template, 4, 4, "div", 89);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r28 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 14, "conversationWorkspace.context.requestEyebrow"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 16, "conversationWorkspace.context.requestTitle"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.initials(request_r28.opportunityTitle));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r28.opportunityTitle);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 18, "conversationWorkspace.context.participant"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.initials(request_r28.counterpartyName));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r28.counterpartyName);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.roleLabel(request_r28.counterpartyRole) ? 25 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 20, "conversationWorkspace.context.requestState"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 22, "conversationWorkspace.context.direction"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 24, request_r28.direction === "incoming" ? "conversationWorkspace.tabs.incoming" : "conversationWorkspace.tabs.outgoing"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 26, "conversationWorkspace.context.statusLabel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.requestStatusLabel(request_r28.status));
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r28.canWithdraw ? 44 : -1);
} }
function ChatComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "conversationWorkspace.context.empty"));
} }
function ChatComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-offer-builder", 97);
    i0.ɵɵlistener("closed", function ChatComponent_Conditional_51_Template_app_offer_builder_closed_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeOfferBuilder()); })("submitted", function ChatComponent_Conditional_51_Template_app_offer_builder_submitted_0_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onSharedOfferSubmitted($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversation_r31 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("opportunityId", conversation_r31.opportunityId || 0)("opportunityTitle", conversation_r31.opportunityTitle)("conversationId", conversation_r31.id)("replacementOffer", ctx_r1.replacementOffer());
} }
function ChatComponent_Conditional_52_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 101);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "reports.success"));
} }
function ChatComponent_Conditional_52_Conditional_11_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reason_r34 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", reason_r34);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportReasonLabel(reason_r34));
} }
function ChatComponent_Conditional_52_Conditional_11_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.reportError());
} }
function ChatComponent_Conditional_52_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "select", 24);
    i0.ɵɵlistener("change", function ChatComponent_Conditional_52_Conditional_11_Template_select_change_3_listener($event) { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReportReason($event.target.value)); });
    i0.ɵɵrepeaterCreate(4, ChatComponent_Conditional_52_Conditional_11_For_5_Template, 2, 2, "option", 14, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "label");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementStart(9, "textarea", 102);
    i0.ɵɵlistener("input", function ChatComponent_Conditional_52_Conditional_11_Template_textarea_input_9_listener($event) { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReportDescription($event.target.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, ChatComponent_Conditional_52_Conditional_11_Conditional_10_Template, 2, 1, "p", 51);
    i0.ɵɵelementStart(11, "footer")(12, "button", 55);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_52_Conditional_11_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "button", 43);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_52_Conditional_11_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.submitConversationReport()); });
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
function ChatComponent_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 98);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_52_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵelementStart(1, "section", 99);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_52_Template_section_click_1_listener($event) { i0.ɵɵrestoreView(_r32); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "header")(3, "div")(4, "p", 7);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 100);
    i0.ɵɵlistener("click", function ChatComponent_Conditional_52_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r32); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeReportModal()); });
    i0.ɵɵtext(9, "\u00D7");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, ChatComponent_Conditional_52_Conditional_10_Template, 3, 3, "div", 101)(11, ChatComponent_Conditional_52_Conditional_11_Template, 19, 18);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conversation_r35 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.conversationReportLabel(conversation_r35));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.conversationReportTargetName(conversation_r35));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.reportSuccess() ? 10 : 11);
} }
export class ChatComponent {
    constructor() {
        this.http = inject(HttpClient);
        this.apiBase = inject(API_BASE);
        this.route = inject(ActivatedRoute);
        this.languageService = inject(LanguageService);
        this.reportService = inject(ReportService);
        this.firebaseClient = inject(FirebaseClientService);
        this.notificationService = inject(NotificationService);
        this.currencyService = inject(CurrencyService);
        this.presenceTimer = null;
        this.presentConversationId = null;
        this.realtimeSubscriptions = new Subscription();
        this.receivedMessageIds = new Set();
        this.scrollFrame = null;
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
        this.replacingOfferId = signal(null, ...(ngDevMode ? [{ debugName: "replacingOfferId" }] : []));
        this.replacementOffer = signal(null, ...(ngDevMode ? [{ debugName: "replacementOffer" }] : []));
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
            const conversationId = this.selectedConversation()?.id;
            return conversationId
                ? buildConversationTimeline(conversationId, this.messages(), this.offers())
                : [];
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
        }, ...(ngDevMode ? [{ debugName: "selectionWatcher" }] : []));
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
        this.journeySteps = computed(() => this.buildJourney(this.activeConversation()), ...(ngDevMode ? [{ debugName: "journeySteps" }] : []));
        this.terminalJourneyStatus = computed(() => this.buildTerminalJourneyStatus(this.activeConversation()), ...(ngDevMode ? [{ debugName: "terminalJourneyStatus" }] : []));
        this.stageSummary = computed(() => this.buildStageSummary(this.activeConversation()), ...(ngDevMode ? [{ debugName: "stageSummary" }] : []));
        this.participationSummary = computed(() => this.buildParticipationSummary(this.activeConversation()), ...(ngDevMode ? [{ debugName: "participationSummary" }] : []));
        this.nextStep = computed(() => this.buildNextStep(this.activeConversation()), ...(ngDevMode ? [{ debugName: "nextStep" }] : []));
    }
    set messageStreamElement(element) {
        this.messageStreamObserver?.disconnect();
        this.messageStream = element;
        if (!element)
            return;
        this.messageStreamObserver = new MutationObserver(() => this.scheduleScrollToLatest());
        this.messageStreamObserver.observe(element.nativeElement, {
            childList: true,
            subtree: true
        });
        this.scheduleScrollToLatest();
    }
    async ngOnInit() {
        this.realtimeSubscriptions.add(this.firebaseClient.onRealtimeEvent.subscribe(event => this.handleRealtimeEvent(event)));
        this.realtimeSubscriptions.add(this.firebaseClient.hasRealtimeConnectionChange.subscribe(connected => {
            if (connected)
                void this.refreshAfterRealtimeReconnect();
        }));
        await this.loadConversations();
    }
    ngOnDestroy() {
        this.realtimeSubscriptions.unsubscribe();
        this.messageStreamObserver?.disconnect();
        if (this.scrollFrame !== null)
            cancelAnimationFrame(this.scrollFrame);
        void this.leaveConversationPresence();
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
        if (this.presentConversationId !== conversation.id) {
            await this.leaveConversationPresence();
        }
        this.selectedRequest.set(null);
        const selected = { ...conversation, unreadCount: 0 };
        this.selectedConversation.set(selected);
        this.messages.set([]);
        this.offers.set([]);
        this.messagesError.set(null);
        this.receivedMessageIds.clear();
        this.conversations.update(items => items.map(item => item.id === selected.id ? selected : item));
        this.mobileView.set('chat');
        await this.startConversationPresence(conversation.id);
        await this.loadViewerState(conversation);
        await this.loadMessages(conversation.id);
        await this.loadOffers(conversation.id);
    }
    selectRequest(request) {
        void this.leaveConversationPresence();
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
            const raw = await this.get(`/api/v1/opportunities/${encodeURIComponent(String(conversation.opportunityId))}/viewer-state?conversationId=${encodeURIComponent(conversation.id)}`);
            const wrapped = this.asRecord(raw);
            const state = this.mapViewerState(wrapped['data'] ?? raw);
            this.viewerStates.update(items => ({ ...items, [conversation.id]: state }));
        }
        catch {
            this.viewerStates.update(items => {
                const next = { ...items };
                delete next[conversation.id];
                return next;
            });
        }
    }
    async loadMessages(conversationId) {
        try {
            this.messagesLoading.set(true);
            this.messagesError.set(null);
            const raw = await this.get(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`);
            if (this.selectedConversation()?.id !== conversationId)
                return;
            const conversation = this.conversations().find(item => item.id === conversationId) || this.selectedConversation();
            const messages = this.extractArray(raw).map(row => this.mapMessage(row, conversation));
            messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
            this.messages.set(messages);
            this.scheduleScrollToLatest();
            messages.forEach(message => this.receivedMessageIds.add(message.id));
            await this.patch(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages/read`, {});
            if (this.selectedConversation()?.id === conversationId) {
                this.conversations.update(items => items.map(item => item.id === conversationId ? { ...item, unreadCount: 0 } : item));
                await this.notificationService.loadNotifications();
            }
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
            if (this.selectedConversation()?.id !== conversationId)
                return;
            const conversation = this.conversations().find(item => item.id === conversationId) || this.selectedConversation();
            this.offers.set(this.extractArray(raw).map(row => this.mapOffer(row, conversation)));
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
        const clientMessageId = crypto.randomUUID();
        const currentUserId = this.resolveCurrentUserId(conversation);
        const optimisticMessage = this.mapMessage({
            id: clientMessageId,
            senderId: currentUserId,
            message: text,
            sentAt: new Date().toISOString()
        }, conversation);
        this.receivedMessageIds.add(clientMessageId);
        this.messages.update(items => upsertAuthoritativeMessage(items, optimisticMessage).items);
        this.scheduleScrollToLatest();
        this.conversations.update(items => updateConversationPreview(items, {
            messageId: clientMessageId,
            conversationId: conversation.id,
            senderUserId: String(currentUserId ?? ''),
            body: text,
            createdAt: optimisticMessage.sentAt
        }, String(currentUserId ?? ''), conversation.id, true));
        this.messageControl.setValue('');
        try {
            this.sending.set(true);
            this.messagesError.set(null);
            const raw = await this.post(`/api/v1/conversations/${encodeURIComponent(conversation.id)}/messages`, { message: text, clientMessageId });
            const wrapped = this.asRecord(raw);
            const saved = this.mapMessage(wrapped['data'] ?? raw, conversation);
            this.messages.update(items => upsertAuthoritativeMessage(items, saved).items);
            this.scheduleScrollToLatest();
            this.updatePreviewFromMessage(saved, conversation.id, false);
            this.updateConversationStatus(conversation.id, 'Negotiation in Progress');
        }
        catch (error) {
            this.receivedMessageIds.delete(clientMessageId);
            this.messages.update(items => items.filter(item => item.id !== clientMessageId));
            this.messageControl.setValue(text);
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
    openOfferBuilder(replacementOffer) {
        if (this.isReadOnly(this.activeConversation()) || this.offerProcessing())
            return;
        if (replacementOffer) {
            this.replacingOfferId.set(replacementOffer.id);
            this.replacementOffer.set(this.toOfferVersion(replacementOffer));
        }
        else {
            this.replacingOfferId.set(null);
            this.replacementOffer.set(null);
        }
        this.offerBuilderOpen.set(true);
    }
    closeOfferBuilder() {
        this.offerBuilderOpen.set(false);
        this.replacingOfferId.set(null);
        this.replacementOffer.set(null);
    }
    onSharedOfferSubmitted(offer) {
        const mapped = this.mapOffer(offer);
        const replacementId = this.replacingOfferId();
        if (replacementId) {
            this.offers.update(items => [...items.map(item => item.id === replacementId ? { ...item, status: 2 } : item), mapped]);
        }
        else {
            this.offers.update(items => [...items, mapped]);
        }
        this.closeOfferBuilder();
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
        return offer.status === 1 && offer.canAccept === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
    }
    canRejectOfferAction(offer) {
        return offer.status === 1 && offer.canReject === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
    }
    canRespondOfferAction(offer) {
        return offer.status === 1 && offer.canRespond === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
    }
    canWithdrawOffer(offer) {
        return offer.status === 1 && offer.canWithdraw === true && !this.isReadOnly(this.activeConversation()) && !this.offerProcessing();
    }
    isAcceptedOffer(offer) {
        return offer.status === 3;
    }
    offerStatusLabel(status) {
        switch (Number(status)) {
            case 1: return this.t('conversationWorkspace.offerStatus.pending');
            case 2: return this.t('conversationWorkspace.offerStatus.replaced');
            case 3: return this.t('conversationWorkspace.offerStatus.accepted');
            case 4: return this.t('conversationWorkspace.offerStatus.rejected');
            case 5: return this.t('conversationWorkspace.offerStatus.withdrawn');
            default: return this.t('conversationWorkspace.status.unavailable');
        }
    }
    repaymentModelLabel(value) {
        const key = repaymentModelLabelKey(value);
        return key ? this.t(key) : String(value ?? '');
    }
    offerLegLabel(type) {
        switch (Number(type)) {
            case 1: return this.t('conversationWorkspace.offerTypes.equity');
            case 2: return this.t('conversationWorkspace.offerTypes.loan');
            case 3: return this.t('conversationWorkspace.offerTypes.profitSharing');
            default: return this.t('conversationWorkspace.offers.title');
        }
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
            return conversation.founderName || this.t('conversationWorkspace.roles.founder');
        if (this.sameId(conversation.closedByUserId, conversation.investorUserId))
            return conversation.investorName || this.t('conversationWorkspace.roles.investor');
        if (this.sameId(conversation.closedByUserId, conversation.requesterUserId))
            return conversation.requesterName || this.t('conversationWorkspace.roles.requester');
        if (this.sameId(conversation.closedByUserId, conversation.recipientUserId))
            return conversation.recipientName || this.t('conversationWorkspace.roles.recipient');
        if (conversation.status === 'Declined by Founder')
            return conversation.founderName || this.t('conversationWorkspace.roles.founder');
        if (conversation.status === 'You withdrew')
            return this.t('conversationWorkspace.roles.you');
        return this.t('conversationWorkspace.roles.participant');
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
    money(value, currency) {
        if (value === null || value === undefined || Number.isNaN(Number(value)))
            return '-';
        return this.currencyService.format(Number(value), currency);
    }
    conversationCurrency(conversation) {
        const latest = [...this.offers()]
            .filter(o => o.conversationId === conversation.id)
            .reduce((acc, o) => (acc === null || o.version > acc.version ? o : acc), null);
        return latest?.currency ?? null;
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
            unreadCount: this.numberValue(row['unreadCount']) ?? 0,
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
            conversationId: this.optionalString(row['conversationId']) || conversation?.id,
            senderId: senderId === null || senderId === undefined ? undefined : String(senderId),
            senderName: this.optionalString(row['senderName']) || senderIdentity.name,
            senderRole: this.normalizeRole(row['senderRole'] ?? senderIdentity.role),
            text: this.stringValue(row['message'] ?? row['text']),
            sentAt: this.dateValue(row['sentAt']) || new Date(0),
            isSender
        };
    }
    mapOffer(value, conversation = this.activeConversation()) {
        const row = this.asRecord(value);
        const actor = this.resolveSenderIdentity(row['createdByUserId'], conversation);
        return {
            id: Number(row['id']),
            conversationId: this.stringValue(row['conversationId']),
            createdByUserId: this.idValue(row['createdByUserId']),
            createdByName: this.optionalString(row['createdByName']) || actor.name,
            createdByRole: this.normalizeRole(row['createdByRole'] ?? actor.role),
            version: Number(row['version'] ?? 1),
            replacesOfferId: this.numberValue(row['replacesOfferId']),
            status: this.offerStatusValue(row['status']),
            note: this.optionalString(row['note']),
            currency: this.optionalString(row['currency']) || this.currencyService.defaultIsoCode(),
            createdAt: this.dateValue(row['createdAt']),
            canAccept: row['canAccept'] === true,
            canReject: row['canReject'] === true,
            canRespond: row['canRespond'] === true,
            canWithdraw: row['canWithdraw'] === true,
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
            return { name: conversation.requesterName || conversation.investorName || this.t('conversationWorkspace.roles.investor'), role: this.normalizeRole(conversation.requesterRole || 'Investor') };
        }
        if (this.sameId(senderId, conversation.recipientUserId)) {
            return { name: conversation.recipientName || conversation.founderName || this.t('conversationWorkspace.roles.founder'), role: this.normalizeRole(conversation.recipientRole || 'Founder') };
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
            const wrapped = this.asRecord(raw)['data'] ?? raw;
            if (action === 'accept') {
                const record = this.asRecord(wrapped);
                const updated = this.mapOffer(record['offer'] ?? wrapped);
                this.offers.update(items => items.map(item => item.id === updated.id ? updated : item));
                const participationRequestId = record['participationRequestId'];
                if (participationRequestId) {
                    this.conversations.update(items => items.map(item => item.id === conversation.id ? { ...item, participationRequestId: String(participationRequestId) } : item));
                }
                await this.loadConversations();
            }
            else {
                const updated = this.mapOffer(wrapped);
                this.offers.update(items => items.map(item => item.id === updated.id ? updated : item));
            }
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
    normalizeRole(value) {
        const role = String(value || '').trim().toLowerCase();
        if (role.includes('founder'))
            return 'Founder';
        if (role.includes('investor'))
            return 'Investor';
        return '';
    }
    buildJourney(conversation) {
        if (!conversation)
            return [];
        const viewerState = this.activeViewerState();
        const participation = this.normalizeParticipationStatus(viewerState?.participationStatus ?? conversation.participationStatus);
        const offerSent = this.offers().length > 0;
        const offerAccepted = this.offers().some(offer => offer.status === 3);
        const participationRequested = !!conversation.participationRequestId
            || !!viewerState?.hasPendingParticipationRequest
            || participation === 'pending'
            || participation === 'approved'
            || participation === 'rejected'
            || this.statusAtLeast(conversation.status, ['Participation Created', 'Participation Approved', 'Participation Rejected']);
        const participationApproved = participation === 'approved'
            || conversation.status === 'Participation Approved';
        const negotiationStarted = this.messages().length > 0
            || offerSent
            || !!conversation.founderReady
            || !!conversation.investorReady
            || participationRequested
            || this.statusAtLeast(conversation.status, ['Negotiation in Progress', 'Ready for Participation', 'Participation Created', 'Participation Approved', 'Participation Rejected']);
        const terminal = !!this.buildTerminalJourneyStatus(conversation);
        const completed = new Set(['requested']);
        if (conversation.status !== 'Declined by Founder')
            completed.add('accepted');
        if (negotiationStarted)
            completed.add('negotiation');
        if (offerSent)
            completed.add('offerSent');
        if (offerAccepted)
            completed.add('offerAccepted');
        if (conversation.founderReady)
            completed.add('founderReady');
        if (conversation.investorReady)
            completed.add('investorReady');
        if (participationRequested)
            completed.add('participationRequest');
        if (participationApproved)
            completed.add('participationApproved');
        if (participationApproved)
            completed.add('projectRoomUnlocked');
        let currentKey = 'accepted';
        if (participationApproved)
            currentKey = 'projectRoomUnlocked';
        else if (participationRequested)
            currentKey = 'participationApproved';
        else if (conversation.founderReady && conversation.investorReady)
            currentKey = 'participationRequest';
        else if (conversation.founderReady)
            currentKey = 'investorReady';
        else if (conversation.investorReady)
            currentKey = 'founderReady';
        else if (offerAccepted)
            currentKey = 'founderReady';
        else if (offerSent)
            currentKey = 'offerAccepted';
        else if (negotiationStarted || completed.has('accepted'))
            currentKey = 'negotiation';
        if (terminal)
            currentKey = '';
        const definitions = [
            { key: 'requested', label: this.t('conversationWorkspace.journey.requested') },
            { key: 'accepted', label: this.t('conversationWorkspace.journey.accepted') },
            { key: 'negotiation', label: this.t('conversationWorkspace.journey.negotiation') },
            { key: 'offerSent', label: this.t('conversationWorkspace.journey.offerSent'), optional: true },
            { key: 'offerAccepted', label: this.t('conversationWorkspace.journey.offerAccepted'), optional: true },
            { key: 'founderReady', label: this.t('conversationWorkspace.journey.founderReady') },
            { key: 'investorReady', label: this.t('conversationWorkspace.journey.investorReady') },
            { key: 'participationRequest', label: this.t('conversationWorkspace.journey.participationRequest') },
            { key: 'participationApproved', label: this.t('conversationWorkspace.journey.participationApproved') },
            { key: 'projectRoomUnlocked', label: this.t('conversationWorkspace.journey.projectRoomUnlocked') }
        ];
        return definitions
            .filter(step => !step.optional || offerSent)
            .filter(step => !(participationRequested && (step.key === 'founderReady' || step.key === 'investorReady') && !completed.has(step.key)))
            .filter(step => !terminal || completed.has(step.key))
            .map(step => ({
            key: step.key,
            label: step.label,
            state: step.key === currentKey ? 'current' : completed.has(step.key) ? 'completed' : 'future'
        }));
    }
    buildTerminalJourneyStatus(conversation) {
        if (!conversation)
            return '';
        if (conversation.status === 'Participation Rejected')
            return this.t('conversationWorkspace.journey.terminalParticipationRejected');
        if (conversation.status === 'Declined by Founder')
            return this.t('conversationWorkspace.journey.terminalDeclined');
        if (conversation.status === 'You withdrew')
            return this.t('conversationWorkspace.journey.terminalWithdrawn');
        if (conversation.status === 'Discussion Closed')
            return this.t('conversationWorkspace.journey.terminalClosed');
        return '';
    }
    buildStageSummary(conversation) {
        if (!conversation)
            return this.t('conversationWorkspace.stageSummary.select');
        switch (conversation.status) {
            case 'Founder Accepted':
                return this.t('conversationWorkspace.stageSummary.founderAccepted');
            case 'Negotiation in Progress':
                return this.t('conversationWorkspace.stageSummary.inProgress');
            case 'Ready for Participation':
                return this.t('conversationWorkspace.stageSummary.ready');
            case 'Participation Created':
                return this.t('conversationWorkspace.stageSummary.participationCreated');
            case 'Participation Approved':
                return this.t('conversationWorkspace.stageSummary.participationApproved');
            case 'Participation Rejected':
                return this.t('conversationWorkspace.stageSummary.participationRejected');
            case 'Declined by Founder':
                return this.t('conversationWorkspace.stageSummary.declined');
            case 'You withdrew':
                return this.t('conversationWorkspace.stageSummary.withdrawn');
            case 'Discussion Closed':
                return this.t('conversationWorkspace.stageSummary.closed');
            default:
                return this.t('conversationWorkspace.stageSummary.default');
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
        const conversationId = this.activeConversation()?.id;
        return conversationId ? this.viewerStates()[conversationId] ?? null : null;
    }
    buildNextStep(conversation) {
        if (!conversation)
            return this.t('conversationWorkspace.nextStep.select');
        if (this.isReadOnly(conversation))
            return this.t('conversationWorkspace.nextStep.readOnly');
        if (conversation.status === 'Founder Accepted')
            return this.t('conversationWorkspace.nextStep.founderAccepted');
        if (conversation.status === 'Negotiation in Progress' && !this.isCurrentUserReady())
            return this.t('conversationWorkspace.nextStep.markReady');
        if (conversation.status === 'Ready for Participation' && !this.bothReady())
            return this.t('conversationWorkspace.nextStep.readyState');
        if (this.bothReady() && !this.buildParticipationSummary(conversation).toLowerCase().includes('pending'))
            return this.t('conversationWorkspace.nextStep.submitRequest');
        if (conversation.status === 'Participation Created')
            return this.t('conversationWorkspace.nextStep.waitApproval');
        if (conversation.status === 'Participation Approved')
            return this.t('conversationWorkspace.nextStep.openRoom');
        if (conversation.status === 'Participation Rejected')
            return this.t('conversationWorkspace.nextStep.rejected');
        return this.t('conversationWorkspace.nextStep.default');
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
        return this.sameId(this.resolveCurrentUserId(conversation), conversation.investorUserId);
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
    async startConversationPresence(conversationId) {
        this.presentConversationId = conversationId;
        const heartbeat = () => firstValueFrom(this.http.put(`${this.apiBase}/api/v1/conversations/${conversationId}/presence`, {}, this.getHttpOptions())).catch(() => undefined);
        await heartbeat();
        this.presenceTimer = setInterval(() => void heartbeat(), 30_000);
    }
    handleRealtimeEvent(event) {
        const changedOffersConversationId = offerConversationId(event);
        if (changedOffersConversationId) {
            if (offerRealtimeAction(event) === 'accepted') {
                void this.loadConversations();
                return;
            }
            if (this.selectedConversation()?.id === changedOffersConversationId) {
                void this.loadOffers(changedOffersConversationId);
            }
            return;
        }
        if (event.type !== 'ConversationMessageSaved' || !event.data)
            return;
        const data = event.data;
        const saved = {
            messageId: this.stringValue(data['messageId'] ?? event.entityId),
            conversationId: this.stringValue(data['conversationId']),
            senderUserId: this.stringValue(data['senderUserId']),
            body: this.stringValue(data['body']),
            createdAt: this.dateValue(data['createdAt']) ?? new Date(event.createdAt)
        };
        if (!saved.messageId || !saved.conversationId || !saved.senderUserId)
            return;
        const firstReceipt = !this.receivedMessageIds.has(saved.messageId);
        this.receivedMessageIds.add(saved.messageId);
        const conversation = this.conversations().find(item => item.id === saved.conversationId);
        if (!conversation) {
            void this.loadConversations();
            return;
        }
        if (this.selectedConversation()?.id === saved.conversationId) {
            const message = this.mapMessage({
                id: saved.messageId,
                conversationId: saved.conversationId,
                senderId: saved.senderUserId,
                senderName: data['senderName'],
                senderRole: data['senderRole'],
                message: saved.body,
                sentAt: saved.createdAt
            }, conversation);
            this.messages.update(items => upsertAuthoritativeMessage(items, message).items);
            this.scheduleScrollToLatest();
        }
        this.updatePreviewFromSavedMessage(saved, firstReceipt);
    }
    updatePreviewFromMessage(message, conversationId, inserted) {
        this.updatePreviewFromSavedMessage({
            messageId: message.id,
            conversationId,
            senderUserId: String(message.senderId ?? ''),
            body: message.text,
            createdAt: message.sentAt
        }, inserted);
    }
    updatePreviewFromSavedMessage(saved, inserted) {
        const currentConversation = this.conversations().find(item => item.id === saved.conversationId) ?? null;
        const currentUserId = this.resolveCurrentUserId(currentConversation);
        this.conversations.update(items => updateConversationPreview(items, saved, currentUserId === null ? null : String(currentUserId), this.presentConversationId, inserted));
        const selected = this.selectedConversation();
        if (selected?.id === saved.conversationId) {
            this.selectedConversation.set({
                ...selected,
                lastMessage: saved.body,
                lastMessageAt: saved.createdAt,
                unreadCount: 0
            });
        }
    }
    async refreshAfterRealtimeReconnect() {
        const selectedId = this.selectedConversation()?.id;
        await this.loadConversations();
        if (selectedId && this.selectedConversation()?.id === selectedId) {
            await Promise.all([
                this.loadMessages(selectedId),
                this.loadOffers(selectedId)
            ]);
        }
    }
    toOfferVersion(offer) {
        return {
            id: offer.id,
            conversationId: offer.conversationId,
            createdByUserId: offer.createdByUserId == null ? null : String(offer.createdByUserId),
            createdByName: offer.createdByName,
            createdByRole: offer.createdByRole,
            version: offer.version,
            replacesOfferId: offer.replacesOfferId,
            status: offer.status,
            note: offer.note,
            currency: offer.currency,
            createdAt: offer.createdAt || new Date(),
            legs: offer.legs,
            canAccept: offer.canAccept,
            canReject: offer.canReject,
            canRespond: offer.canRespond,
            canWithdraw: offer.canWithdraw
        };
    }
    async patch(path, body) {
        return await firstValueFrom(this.http.patch(`${this.apiBase}${path}`, body, this.getHttpOptions()));
    }
    async leaveConversationPresence() {
        if (this.presenceTimer) {
            clearInterval(this.presenceTimer);
            this.presenceTimer = null;
        }
        const conversationId = this.presentConversationId;
        this.presentConversationId = null;
        if (!conversationId)
            return;
        await firstValueFrom(this.http.delete(`${this.apiBase}/api/v1/conversations/${conversationId}/presence`, this.getHttpOptions())).catch(() => undefined);
    }
    scheduleScrollToLatest() {
        if (this.scrollFrame !== null)
            cancelAnimationFrame(this.scrollFrame);
        this.scrollFrame = requestAnimationFrame(() => {
            this.scrollFrame = requestAnimationFrame(() => {
                this.scrollFrame = null;
                scrollToLatest(this.messageStream?.nativeElement);
            });
        });
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
        void this.leaveConversationPresence();
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
        return normalizeOfferStatus(value);
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
    replacedOfferVersion(offer) {
        if (!offer.replacesOfferId)
            return null;
        return this.offers().find(item => item.id === offer.replacesOfferId)?.version ?? null;
    }
    static { this.ɵfac = function ChatComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChatComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChatComponent, selectors: [["app-chat"]], viewQuery: function ChatComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.messageStreamElement = _t.first);
        } }, decls: 53, vars: 57, consts: [["messageStream", ""], [1, "conversation-page"], [1, "mobile-switcher"], ["type", "button", 3, "click"], ["type", "button", 3, "click", "disabled"], [1, "workspace-panel", "list-panel"], [1, "panel-heading"], [1, "eyebrow"], ["role", "tablist", 1, "workspace-tabs"], ["type", "button", "role", "tab", 3, "click"], [1, "list-tools"], [1, "search-field"], ["aria-hidden", "true"], ["type", "search", 3, "input", "value", "placeholder"], [3, "value"], [1, "conversation-list"], [1, "compact-state"], [1, "compact-state", "compact-state--error"], [1, "workspace-panel", "chat-panel"], [1, "request-detail"], [1, "empty-workspace"], [1, "workspace-panel", "context-panel"], ["mode", "conversation", 3, "opportunityId", "opportunityTitle", "conversationId", "replacementOffer"], [1, "modal-backdrop"], [3, "change", "value"], ["value", "all"], ["value", "active"], ["value", "closed"], [1, "spinner"], [1, "list-card", 3, "selected"], [1, "list-card"], ["type", "button", 1, "list-card__select", 3, "click"], [1, "avatar", "avatar--small"], [3, "src", "alt"], [1, "list-card__body"], [1, "list-card__top"], [1, "list-card__activity"], [1, "unread-badge"], [1, "opportunity-line"], [1, "message-preview"], [1, "status-badge"], [1, "chat-header"], [1, "header-actions"], ["type", "button", 1, "primary-button", 3, "click", "disabled"], ["type", "button", 1, "secondary-button"], [1, "journey-panel"], [1, "journey-heading"], [1, "terminal-status"], [1, "journey-steps"], [3, "completed", "current", "future"], [1, "message-stream"], [1, "inline-error"], [1, "message-composer", 3, "submit"], [3, "formControl", "placeholder", "readonly"], ["type", "submit", 1, "primary-button", 3, "disabled"], ["type", "button", 1, "secondary-button", 3, "click"], [1, "journey-dot"], [1, "journey-label"], [1, "system-event"], [1, "system-event", "system-event--closed"], [1, "message-row", 3, "own", "grouped"], [1, "offer-card", 3, "offer-card--accepted"], [1, "message-row"], [1, "avatar", "avatar--message"], [1, "message-content"], [1, "message-meta"], [1, "message-bubble"], [1, "offer-card"], [1, "offer-relation"], [1, "offer-terms"], [1, "offer-note"], ["type", "button", 1, "primary-button"], ["type", "button", 1, "text-button"], ["type", "button", 1, "primary-button", 3, "click"], ["type", "button", 1, "text-button", 3, "click"], [1, "avatar"], [1, "request-actions"], ["type", "button", 1, "primary-button", 3, "disabled"], ["type", "button", 1, "secondary-button", 3, "disabled"], ["type", "button", 1, "secondary-button", 3, "click", "disabled"], [1, "empty-icon"], [1, "context-scroll"], [1, "opportunity-summary"], [1, "opportunity-mark"], [1, "context-section"], [1, "detail-rows"], [1, "readiness-row"], ["type", "button", 1, "secondary-button", "context-ready-action", 3, "disabled"], [1, "closed-note"], [1, "context-actions"], [1, "secondary-button", 3, "routerLink"], [1, "primary-button", "primary-button--green", 3, "routerLink"], ["type", "button", 1, "secondary-button", "context-danger-action", 3, "disabled"], [1, "founder-row", 3, "routerLink"], [1, "founder-row"], ["type", "button", 1, "secondary-button", "context-ready-action", 3, "click", "disabled"], ["type", "button", 1, "secondary-button", "context-danger-action", 3, "click", "disabled"], ["mode", "conversation", 3, "closed", "submitted", "opportunityId", "opportunityTitle", "conversationId", "replacementOffer"], [1, "modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", 1, "modal-card", "report-modal", 3, "click"], ["type", "button", 1, "icon-button", 3, "click"], [1, "success-note"], ["rows", "4", 3, "input", "value"]], template: function ChatComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 1)(1, "nav", 2);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementStart(3, "button", 3);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_3_listener() { return ctx.setMobileView("list"); });
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "button", 4);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_6_listener() { return ctx.setMobileView("chat"); });
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "button", 4);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_9_listener() { return ctx.setMobileView("context"); });
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "section", 5)(13, "header", 6)(14, "div")(15, "p", 7);
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "h1");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(21, "div", 8)(22, "button", 9);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_22_listener() { return ctx.setWorkspaceTab("incoming"); });
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "button", 9);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_25_listener() { return ctx.setWorkspaceTab("outgoing"); });
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "button", 9);
            i0.ɵɵlistener("click", function ChatComponent_Template_button_click_28_listener() { return ctx.setWorkspaceTab("conversations"); });
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(31, "div", 10)(32, "label", 11)(33, "span", 12);
            i0.ɵɵtext(34, "\u2315");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "input", 13);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵlistener("input", function ChatComponent_Template_input_input_35_listener($event) { return ctx.setSearchTerm($event.target.value); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(37, ChatComponent_Conditional_37_Template, 11, 13, "select", 14);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "div", 15);
            i0.ɵɵconditionalCreate(39, ChatComponent_Conditional_39_Template, 5, 3, "div", 16)(40, ChatComponent_Conditional_40_Template, 6, 4, "div", 17)(41, ChatComponent_Conditional_41_Template, 3, 1)(42, ChatComponent_Conditional_42_Template, 3, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(43, "section", 18);
            i0.ɵɵconditionalCreate(44, ChatComponent_Conditional_44_Template, 31, 26)(45, ChatComponent_Conditional_45_Template, 19, 13, "div", 19)(46, ChatComponent_Conditional_46_Template, 9, 6, "div", 20);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "aside", 21);
            i0.ɵɵconditionalCreate(48, ChatComponent_Conditional_48_Template, 69, 57)(49, ChatComponent_Conditional_49_Template, 45, 28)(50, ChatComponent_Conditional_50_Template, 4, 3, "div", 16);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(51, ChatComponent_Conditional_51_Template, 1, 4, "app-offer-builder", 22);
            i0.ɵɵconditionalCreate(52, ChatComponent_Conditional_52_Template, 12, 3, "div", 23);
        } if (rf & 2) {
            let tmp_24_0;
            let tmp_25_0;
            let tmp_26_0;
            let tmp_27_0;
            i0.ɵɵclassProp("mobile-list", ctx.mobileView() === "list")("mobile-chat", ctx.mobileView() === "chat")("mobile-context", ctx.mobileView() === "context");
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 37, "conversationWorkspace.mobile.navigation"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.mobileView() === "list");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 39, "conversationWorkspace.mobile.list"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.mobileView() === "chat");
            i0.ɵɵproperty("disabled", !ctx.activeConversation() && !ctx.selectedRequest());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 41, "conversationWorkspace.mobile.chat"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.mobileView() === "context");
            i0.ɵɵproperty("disabled", !ctx.activeConversation());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 43, "conversationWorkspace.mobile.context"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 45, "conversationWorkspace.eyebrow"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 47, "conversationWorkspace.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("active", ctx.workspaceTab() === "incoming");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(24, 49, "conversationWorkspace.tabs.incoming"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.workspaceTab() === "outgoing");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 51, "conversationWorkspace.tabs.outgoing"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.workspaceTab() === "conversations");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(30, 53, "conversationWorkspace.tabs.conversations"), " ");
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("value", ctx.searchTerm())("placeholder", i0.ɵɵpipeBind1(36, 55, "conversationWorkspace.search"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.workspaceTab() === "conversations" ? 37 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 39 : ctx.error() ? 40 : ctx.workspaceTab() === "conversations" ? 41 : 42);
            i0.ɵɵadvance(5);
            i0.ɵɵconditional((tmp_24_0 = ctx.activeConversation()) ? 44 : (tmp_24_0 = ctx.selectedRequest()) ? 45 : 46, tmp_24_0);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional((tmp_25_0 = ctx.activeConversation()) ? 48 : (tmp_25_0 = ctx.selectedRequest()) ? 49 : 50, tmp_25_0);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_26_0 = ctx.offerBuilderOpen() && ctx.activeConversation()) ? 51 : -1, tmp_26_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_27_0 = ctx.reportModalOpen() && ctx.activeConversation()) ? 52 : -1, tmp_27_0);
        } }, dependencies: [CommonModule, FormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.NgForm, ReactiveFormsModule, i1.FormControlDirective, RouterLink, OfferBuilderComponent, TranslatePipe], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n  color: var(--investa-text-primary);\r\n  background: var(--investa-bg);\r\n  min-height: 100vh;\r\n}\r\n\r\n*[_ngcontent-%COMP%] { box-sizing: border-box; }\r\nbutton[_ngcontent-%COMP%], input[_ngcontent-%COMP%], select[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] { font: inherit; }\r\nbutton[_ngcontent-%COMP%], a[_ngcontent-%COMP%] { -webkit-tap-highlight-color: transparent; }\r\n\r\n.conversation-page[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: grid;\r\n  grid-template-columns: minmax(260px, 0.78fr) minmax(440px, 1.65fr) minmax(270px, 0.82fr);\r\n  height: calc(100dvh - 5.25rem);\r\n  min-height: 620px;\r\n  overflow: hidden;\r\n  background:\r\n    linear-gradient(145deg, rgba(30, 41, 59, 0.93) 0%, rgba(15, 23, 42, 0.97) 100%);\r\n  border: 1px solid rgba(100, 116, 139, 0.38);\r\n  border-radius: 0.85rem;\r\n  box-shadow: 0 14px 34px rgba(2, 6, 23, 0.22);\r\n}\r\n\r\n.conversation-page[_ngcontent-%COMP%]::before {\r\n  content: '';\r\n  position: absolute;\r\n  inset: 0;\r\n  pointer-events: none;\r\n  background: radial-gradient(circle at 18% 0%, rgba(56, 189, 248, 0.1), transparent 34%);\r\n  opacity: 0.78;\r\n}\r\n\r\n.conversation-page[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  z-index: 1;\r\n}\r\n\r\n.workspace-panel[_ngcontent-%COMP%] { min-width: 0; min-height: 0; background: rgba(21, 27, 32, 0.55); }\r\n.list-panel[_ngcontent-%COMP%], .context-panel[_ngcontent-%COMP%] { display: flex; flex-direction: column; }\r\n.list-panel[_ngcontent-%COMP%] { border-inline-end: 1px solid var(--investa-border); }\r\n.context-panel[_ngcontent-%COMP%] { border-inline-start: 1px solid var(--investa-border); }\r\n.chat-panel[_ngcontent-%COMP%] { display: flex; flex-direction: column; background: rgba(36, 39, 43, 0.4); }\r\n\r\n.panel-heading[_ngcontent-%COMP%] { min-height: 74px; padding: 14px 16px; border-bottom: 1px solid var(--investa-border); }\r\n.chat-header[_ngcontent-%COMP%] { display: flex; min-height: 52px; align-items: center; justify-content: flex-end; padding: 8px 14px; border-bottom: 1px solid var(--investa-border); }\r\n.panel-heading[_ngcontent-%COMP%] { display: flex; align-items: center; }\r\n.panel-heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .panel-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .chat-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 2px 0 0; font-size: 1.05rem; line-height: 1.25; }\r\n.eyebrow[_ngcontent-%COMP%] { margin: 0; color: var(--investa-accent); font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\r\n\r\n.workspace-tabs[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 8px; border-bottom: 1px solid var(--investa-border); }\r\n.workspace-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-width: 0; padding: 8px 5px; border: 0; border-radius: 9px; color: var(--investa-text-secondary); background: transparent; font-size: .74rem; font-weight: 750; cursor: pointer; }\r\n.workspace-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { color: var(--investa-text-primary); background: var(--investa-surface-2); }\r\n\r\n.list-tools[_ngcontent-%COMP%] { display: flex; gap: 7px; padding: 9px; border-bottom: 1px solid var(--investa-border); }\r\n.search-field[_ngcontent-%COMP%] { position: relative; display: flex; flex: 1; align-items: center; min-width: 0; }\r\n.search-field[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { position: absolute; inset-inline-start: 10px; color: var(--investa-text-secondary); }\r\n.search-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: 100%; padding: 8px 9px 8px 30px; }\r\n[dir='rtl'][_ngcontent-%COMP%]   .search-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { padding: 8px 30px 8px 9px; }\r\ninput[_ngcontent-%COMP%], select[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] { border: 1px solid var(--investa-border); border-radius: 9px; color: var(--investa-text-primary); background: var(--investa-surface); outline: none; }\r\ninput[_ngcontent-%COMP%]:focus, select[_ngcontent-%COMP%]:focus, textarea[_ngcontent-%COMP%]:focus { border-color: var(--investa-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--investa-accent) 14%, transparent); }\r\n.list-tools[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { width: 92px; padding: 7px; color: var(--investa-text-secondary); }\r\n\r\n.conversation-list[_ngcontent-%COMP%] { flex: 1; min-height: 0; overflow-y: auto; padding: 7px; }\r\n.list-card[_ngcontent-%COMP%] { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 10px; margin-bottom: 4px; padding: 10px; border: 1px solid transparent; border-radius: 11px; transition: .16s ease; }\r\n.list-card[_ngcontent-%COMP%]:hover { background: var(--investa-surface-soft); }\r\n.list-card.selected[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.list-card__select[_ngcontent-%COMP%] { position: absolute; inset: 0; z-index: 0; border: 0; border-radius: inherit; background: transparent; cursor: pointer; }\r\n.list-card[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:not(.list-card__select) { position: relative; z-index: 1; pointer-events: none; }\r\n.list-card__body[_ngcontent-%COMP%] { min-width: 0; }\r\n.list-card__top[_ngcontent-%COMP%] { display: flex; justify-content: space-between; gap: 8px; }\r\n.list-card__top[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { overflow: hidden; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }\r\n.list-card__activity[_ngcontent-%COMP%] { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 6px; }\r\n.unread-badge[_ngcontent-%COMP%] { display: inline-grid; min-width: 19px; height: 19px; place-items: center; padding: 0 5px; border-radius: 999px; color: var(--investa-primary-contrast); background: var(--investa-primary); font-size: .66rem; font-weight: 800; }\r\n.list-card[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { flex: none; color: var(--investa-text-secondary); font-size: .65rem; }\r\n.opportunity-line[_ngcontent-%COMP%], .message-preview[_ngcontent-%COMP%] { overflow: hidden; margin: 3px 0 0; color: var(--investa-text-secondary); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }\r\n.opportunity-line[_ngcontent-%COMP%] { color: var(--investa-text-primary); font-weight: 650; }\r\n\r\n.avatar[_ngcontent-%COMP%] { display: inline-flex; width: 43px; height: 43px; flex: none; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--investa-border); border-radius: 50%; color: var(--investa-accent); background: var(--investa-accent-soft); font-size: .74rem; font-weight: 850; }\r\n.avatar--small[_ngcontent-%COMP%] { width: 38px; height: 38px; }\r\n.avatar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\r\n\r\n.status-badge[_ngcontent-%COMP%], .ready-chip[_ngcontent-%COMP%] { display: inline-flex; width: fit-content; align-items: center; margin-top: 6px; padding: 3px 7px; border: 1px solid var(--investa-border); border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: .64rem; font-weight: 800; }\r\n.status-badge--active[_ngcontent-%COMP%], .status-badge--pending[_ngcontent-%COMP%] { color: var(--investa-text-primary); }\r\n.status-badge--success[_ngcontent-%COMP%], .ready-chip[_ngcontent-%COMP%] { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.status-badge--closed[_ngcontent-%COMP%] { color: var(--investa-error); border-color: color-mix(in srgb, var(--investa-error) 35%, var(--investa-border)); background: var(--investa-error-soft); }\r\n\r\n.chat-header[_ngcontent-%COMP%] { gap: 8px; }\r\n.participant[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 10px; min-width: 0; }\r\n.participant[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:last-child { min-width: 0; }\r\n.participant-name[_ngcontent-%COMP%] { display: block; overflow: hidden; color: var(--investa-text-primary); font-size: .9rem; font-weight: 800; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }\r\na.participant-name[_ngcontent-%COMP%]:hover { color: var(--investa-accent); }\r\n.participant[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 2px 0 0; color: var(--investa-text-secondary); font-size: .7rem; }\r\n.participant[_ngcontent-%COMP%]   .chat-opportunity[_ngcontent-%COMP%] { overflow: hidden; max-width: 32rem; color: var(--investa-text-primary); font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }\r\n.header-actions[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 7px; }\r\n.header-actions[_ngcontent-%COMP%]   .status-badge[_ngcontent-%COMP%] { margin: 0; }\r\n\r\n.journey-panel[_ngcontent-%COMP%] { flex: 0 0 auto; padding: 11px 14px 10px; border-bottom: 1px solid var(--investa-border); }\r\n.journey-heading[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 12px; }\r\n.journey-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 2px 0 0; font-size: .78rem; }\r\n.terminal-status[_ngcontent-%COMP%] { display: inline-flex; align-items: center; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--investa-error) 35%, var(--investa-border)); border-radius: 999px; color: var(--investa-error); background: var(--investa-error-soft); font-size: .62rem; font-weight: 800; }\r\n.journey-steps[_ngcontent-%COMP%] { display: flex; gap: 0; margin: 10px 0 0; padding: 0 0 3px; overflow-x: auto; list-style: none; scrollbar-width: thin; }\r\n.journey-steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { position: relative; display: grid; min-width: 92px; flex: 1 0 92px; justify-items: center; gap: 5px; color: var(--investa-text-secondary); text-align: center; }\r\n.journey-steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]::after { position: absolute; z-index: 0; top: 10px; inset-inline-start: calc(50% + 11px); width: calc(100% - 22px); height: 2px; content: ''; background: var(--investa-border); }\r\n.journey-steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:last-child::after { display: none; }\r\n.journey-dot[_ngcontent-%COMP%] { position: relative; z-index: 1; display: grid; width: 22px; height: 22px; place-items: center; border: 1px solid var(--investa-border); border-radius: 50%; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: .58rem; font-weight: 850; font-variant-numeric: tabular-nums; }\r\n.journey-label[_ngcontent-%COMP%] { max-width: 90px; font-size: .58rem; font-weight: 700; line-height: 1.25; }\r\n.journey-steps[_ngcontent-%COMP%]   li.completed[_ngcontent-%COMP%] { color: var(--investa-accent); }\r\n.journey-steps[_ngcontent-%COMP%]   li.completed[_ngcontent-%COMP%]   .journey-dot[_ngcontent-%COMP%] { color: var(--investa-primary-contrast); border-color: var(--investa-accent); background: var(--investa-accent); }\r\n.journey-steps[_ngcontent-%COMP%]   li.completed[_ngcontent-%COMP%]::after { background: color-mix(in srgb, var(--investa-accent) 55%, var(--investa-border)); }\r\n.journey-steps[_ngcontent-%COMP%]   li.current[_ngcontent-%COMP%] { color: var(--investa-text-primary); }\r\n.journey-steps[_ngcontent-%COMP%]   li.current[_ngcontent-%COMP%]   .journey-dot[_ngcontent-%COMP%] { color: var(--investa-primary-contrast); border-color: var(--investa-primary); background: var(--investa-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--investa-accent) 16%, transparent); }\r\n.journey-steps[_ngcontent-%COMP%]   li.current[_ngcontent-%COMP%]   .journey-label[_ngcontent-%COMP%] { font-weight: 850; }\r\n\r\n.primary-button[_ngcontent-%COMP%], .secondary-button[_ngcontent-%COMP%], .text-button[_ngcontent-%COMP%] { display: inline-flex; min-height: 34px; align-items: center; justify-content: center; padding: 7px 12px; border-radius: 9px; font-size: .75rem; font-weight: 800; text-decoration: none; cursor: pointer; }\r\n.primary-button[_ngcontent-%COMP%] { border: 1px solid var(--investa-primary); color: var(--investa-primary-contrast); background: var(--investa-primary); }\r\n.primary-button--green[_ngcontent-%COMP%] { border-color: var(--investa-accent); color: var(--investa-primary-contrast); background: var(--investa-accent); }\r\n.secondary-button[_ngcontent-%COMP%] { border: 1px solid var(--investa-border); color: var(--investa-text-primary); background: var(--investa-surface); }\r\n.text-button[_ngcontent-%COMP%] { border: 0; color: var(--investa-text-secondary); background: transparent; }\r\nbutton[_ngcontent-%COMP%]:disabled { opacity: .45; cursor: not-allowed; }\r\n\r\n.actions-menu[_ngcontent-%COMP%] { position: relative; }\r\n.actions-menu[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--investa-border); border-radius: 9px; background: var(--investa-surface); cursor: pointer; list-style: none; }\r\n.actions-menu[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]::-webkit-details-marker { display: none; }\r\n.actions-menu[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { position: absolute; z-index: 20; inset-inline-end: 0; top: 39px; width: 190px; padding: 5px; border: 1px solid var(--investa-border); border-radius: 10px; background: var(--investa-surface); box-shadow: var(--investa-shadow-lg); }\r\n.actions-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 100%; padding: 8px; border: 0; border-radius: 7px; color: var(--investa-text-primary); text-align: start; background: transparent; cursor: pointer; }\r\n.actions-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--investa-surface-soft); }\r\n.actions-menu[_ngcontent-%COMP%]   .danger-text[_ngcontent-%COMP%] { color: var(--investa-error); }\r\n\r\n.message-stream[_ngcontent-%COMP%] { flex: 1; min-height: 0; overflow-y: auto; padding: 18px clamp(14px, 3vw, 42px); }\r\n.system-event[_ngcontent-%COMP%] { display: flex; justify-content: center; margin: 8px 0 18px; }\r\n.system-event[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { padding: 4px 9px; border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-2); font-size: .65rem; font-weight: 700; }\r\n.system-event--closed[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--investa-error); background: var(--investa-error-soft); }\r\n.message-row[_ngcontent-%COMP%] { display: flex; gap: 8px; align-items: flex-start; margin-top: 14px; }\r\n.message-row.own[_ngcontent-%COMP%] { justify-content: flex-end; }\r\n.message-row.grouped[_ngcontent-%COMP%] { margin-top: 4px; }\r\n.message-row[_ngcontent-%COMP%]   .avatar--message[_ngcontent-%COMP%] { width: 32px; height: 32px; flex: none; margin-top: 2px; font-size: .65rem; }\r\n.message-content[_ngcontent-%COMP%] { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }\r\n.message-row.own[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%] { align-items: flex-end; }\r\n.message-meta[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 6px; margin: 0 7px 4px; font-size: .68rem; }\r\n.message-meta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--investa-text-secondary); }\r\n.message-bubble[_ngcontent-%COMP%] { max-width: min(76%, 570px); padding: 9px 11px 6px; border: 1px solid var(--investa-border); border-radius: 13px 13px 13px 4px; background: var(--investa-surface); box-shadow: var(--investa-shadow-sm); }\r\n[dir='rtl'][_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { border-radius: 13px 13px 4px 13px; }\r\n.message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { border-radius: 13px 13px 4px 13px; }\r\n[dir='rtl'][_ngcontent-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { border-radius: 13px 13px 13px 4px; }\r\nbody.investa-theme-dark[_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { background: color-mix(in srgb, var(--investa-info) 15%, transparent); border-color: color-mix(in srgb, var(--investa-info) 30%, transparent); color: #fff; }\r\nbody.investa-theme-light[_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%] { background: var(--investa-primary); border-color: var(--investa-primary); color: var(--investa-primary-contrast); }\r\n.message-bubble[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; font-size: .82rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }\r\n.message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { display: block; margin-top: 3px; color: var(--investa-text-secondary); font-size: .58rem; text-align: end; }\r\nbody.investa-theme-dark[_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { color: var(--investa-text-muted); }\r\nbody.investa-theme-light[_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .message-row.own[_ngcontent-%COMP%]   .message-bubble[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { color: var(--investa-text-muted); }\r\n\r\n.offer-card[_ngcontent-%COMP%] { max-width: 590px; margin: 18px auto; padding: 14px; border: 1px solid var(--investa-border); border-inline-start: 3px solid var(--investa-primary); border-radius: 13px; background: var(--investa-surface); }\r\n.offer-card--accepted[_ngcontent-%COMP%] { border-inline-start-color: var(--investa-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--investa-accent) 8%, transparent); }\r\n.offer-card[_ngcontent-%COMP%]   header[_ngcontent-%COMP%], .offer-card[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\r\n.offer-card[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   .status-badge[_ngcontent-%COMP%] { margin: 0; }\r\n.offer-card[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .85rem; }\r\n.offer-relation[_ngcontent-%COMP%], .offer-note[_ngcontent-%COMP%] { margin: 8px 0 0; color: var(--investa-text-secondary); font-size: .7rem; }\r\n.offer-terms[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 7px; margin-top: 10px; }\r\n.offer-terms[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: grid; gap: 2px; padding: 8px; border-radius: 8px; background: var(--investa-surface-soft); }\r\n.offer-terms[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .offer-terms[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--investa-text-secondary); font-size: .66rem; }\r\n.offer-terms[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .8rem; }\r\n.offer-card[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%] { margin-top: 11px; padding-top: 9px; border-top: 1px solid var(--investa-border); }\r\n.offer-card[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 5px; }\r\n\r\n.message-composer[_ngcontent-%COMP%] { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--investa-border); }\r\n.message-composer[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 1; min-width: 0; padding: 9px 11px; }\r\n.inline-error[_ngcontent-%COMP%] { margin: 0; padding: 7px 14px; color: var(--investa-error); background: var(--investa-error-soft); font-size: .72rem; }\r\n\r\n.context-scroll[_ngcontent-%COMP%] { min-height: 0; overflow-y: auto; padding: 12px; }\r\n.opportunity-summary[_ngcontent-%COMP%] { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 10px; align-items: start; padding: 4px 0 13px; }\r\n.opportunity-mark[_ngcontent-%COMP%] { display: grid; width: 54px; height: 54px; place-items: center; border-radius: 12px; color: var(--investa-accent); background: var(--investa-accent-soft); font-weight: 900; }\r\n.opportunity-summary[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], .context-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0; font-size: .82rem; }\r\n.opportunity-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { display: -webkit-box; overflow: hidden; margin: 4px 0 0; color: var(--investa-text-secondary); font-size: .7rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }\r\n.context-section[_ngcontent-%COMP%] { padding: 12px 0; border-top: 1px solid var(--investa-border); }\r\n.founder-row[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: var(--investa-text-primary); font-size: .75rem; text-decoration: none; }\r\n.detail-rows[_ngcontent-%COMP%] { margin: 7px 0 0; }\r\n.detail-rows[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%], .readiness-row[_ngcontent-%COMP%] { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: .72rem; }\r\n.detail-rows[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .readiness-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--investa-text-secondary); }\r\n.detail-rows[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0; font-weight: 750; text-align: end; }\r\n.readiness-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--investa-text-secondary); }\r\n.readiness-row[_ngcontent-%COMP%]   strong.ready[_ngcontent-%COMP%] { color: var(--investa-accent); }\r\n.context-ready-action[_ngcontent-%COMP%] { width: 100%; margin-top: 8px; }\r\n.closed-note[_ngcontent-%COMP%] { padding: 10px; border-radius: 9px; color: var(--investa-error); background: var(--investa-error-soft); font-size: .72rem; }\r\n.closed-note[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 4px 0 0; }\r\n.context-actions[_ngcontent-%COMP%] { display: grid; gap: 7px; padding-top: 12px; border-top: 1px solid var(--investa-border); }\r\n.context-danger-action[_ngcontent-%COMP%] { color: var(--investa-error); }\r\n.founder-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; margin-top: 2px; color: var(--investa-text-secondary); font-size: .65rem; }\r\n\r\n.compact-state[_ngcontent-%COMP%], .empty-workspace[_ngcontent-%COMP%], .request-detail[_ngcontent-%COMP%] { display: flex; height: 100%; min-height: 180px; align-items: center; justify-content: center; flex-direction: column; padding: 24px; color: var(--investa-text-secondary); text-align: center; }\r\n.compact-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .empty-workspace[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 6px 0; font-size: .76rem; }\r\n.compact-state[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding: 6px 10px; border: 1px solid var(--investa-border); border-radius: 8px; color: var(--investa-text-primary); background: var(--investa-surface); }\r\n.compact-state--error[_ngcontent-%COMP%] { color: var(--investa-error); }\r\n.spinner[_ngcontent-%COMP%] { width: 20px; height: 20px; border: 2px solid var(--investa-border); border-top-color: var(--investa-accent); border-radius: 50%; animation: _ngcontent-%COMP%_spin .8s linear infinite; }\r\n@keyframes _ngcontent-%COMP%_spin { to { transform: rotate(360deg); } }\r\n.empty-icon[_ngcontent-%COMP%] { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; color: var(--investa-accent); background: var(--investa-accent-soft); }\r\n.empty-workspace[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .request-detail[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 12px 0 0; color: var(--investa-text-primary); font-size: 1rem; }\r\n.request-detail[_ngcontent-%COMP%] { max-width: 580px; margin: auto; }\r\n.request-detail[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 18px 0 0; color: var(--investa-text-primary); font-size: .86rem; }\r\n.request-detail[_ngcontent-%COMP%]   blockquote[_ngcontent-%COMP%] { margin: 12px 0; padding: 12px; border-inline-start: 3px solid var(--investa-accent); border-radius: 8px; color: var(--investa-text-primary); background: var(--investa-surface); font-size: .8rem; }\r\n.request-actions[_ngcontent-%COMP%] { display: flex; gap: 7px; margin-top: 18px; }\r\n\r\n.modal-backdrop[_ngcontent-%COMP%] { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 18px; background: var(--investa-overlay); backdrop-filter: blur(3px); }\r\n.modal-card[_ngcontent-%COMP%] { width: min(680px, 100%); max-height: min(720px, 92dvh); overflow-y: auto; padding: 18px; border: 1px solid var(--investa-border); border-radius: 16px; color: var(--investa-text-primary); background: var(--investa-surface); box-shadow: var(--investa-shadow-lg); }\r\n.modal-card[_ngcontent-%COMP%]    > header[_ngcontent-%COMP%], .modal-card[_ngcontent-%COMP%]    > footer[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\r\n.modal-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 2px 0 0; font-size: 1rem; }\r\n.modal-card[_ngcontent-%COMP%]    > footer[_ngcontent-%COMP%] { justify-content: flex-end; margin-top: 15px; }\r\n.modal-card[_ngcontent-%COMP%]    > label[_ngcontent-%COMP%] { display: grid; gap: 6px; margin-top: 12px; color: var(--investa-text-secondary); font-size: .72rem; font-weight: 700; }\r\n.modal-card[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .modal-card[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .modal-card[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { width: 100%; padding: 9px; }\r\n.icon-button[_ngcontent-%COMP%] { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--investa-border); border-radius: 9px; color: var(--investa-text-primary); background: var(--investa-surface); cursor: pointer; }\r\n.builder-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }\r\n.leg-editor[_ngcontent-%COMP%] { padding: 10px; border: 1px solid var(--investa-border); border-radius: 10px; background: var(--investa-surface-soft); }\r\n.leg-editor.enabled[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); }\r\n.leg-editor[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: grid; gap: 5px; margin-top: 8px; color: var(--investa-text-secondary); font-size: .68rem; }\r\n.leg-editor[_ngcontent-%COMP%]   .check-row[_ngcontent-%COMP%] { display: flex; align-items: center; margin: 0; color: var(--investa-text-primary); }\r\n.check-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: auto !important; }\r\n.success-note[_ngcontent-%COMP%] { margin-top: 14px; padding: 10px; border-radius: 9px; color: var(--investa-accent); background: var(--investa-accent-soft); }\r\n\r\n.mobile-switcher[_ngcontent-%COMP%] { display: none; }\r\n\r\n@media (max-width: 1080px) {\r\n  .conversation-page[_ngcontent-%COMP%] { grid-template-columns: 250px minmax(400px, 1fr) 260px; }\r\n  .journey-steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { min-width: 86px; flex-basis: 86px; }\r\n}\r\n\r\n@media (max-width: 820px) {\r\n  .conversation-page[_ngcontent-%COMP%] { position: relative; display: block; height: calc(100dvh - 4.5rem); min-height: 480px; padding-top: 46px; border-radius: 0; }\r\n  .mobile-switcher[_ngcontent-%COMP%] { position: absolute; z-index: 30; inset: 0 0 auto; display: grid; height: 46px; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 6px; border-bottom: 1px solid var(--investa-border); background: var(--investa-surface); }\r\n  .mobile-switcher[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { border: 0; border-radius: 8px; color: var(--investa-text-secondary); background: transparent; font-size: .72rem; font-weight: 800; }\r\n  .mobile-switcher[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { color: var(--investa-text-primary); background: var(--investa-surface-2); }\r\n  .workspace-panel[_ngcontent-%COMP%] { display: none; height: 100%; border: 0; }\r\n  .mobile-list[_ngcontent-%COMP%]   .list-panel[_ngcontent-%COMP%], .mobile-chat[_ngcontent-%COMP%]   .chat-panel[_ngcontent-%COMP%], .mobile-context[_ngcontent-%COMP%]   .context-panel[_ngcontent-%COMP%] { display: flex; }\r\n  .message-stream[_ngcontent-%COMP%] { padding: 14px 12px; }\r\n  .message-bubble[_ngcontent-%COMP%] { max-width: 88%; }\r\n  .chat-header[_ngcontent-%COMP%] { min-height: 48px; padding: 7px 9px; }\r\n  .journey-panel[_ngcontent-%COMP%] { padding-inline: 10px; }\r\n  .primary-button[_ngcontent-%COMP%] { min-height: 32px; padding: 6px 9px; }\r\n  .message-composer[_ngcontent-%COMP%] { position: sticky; bottom: 0; padding: 8px; }\r\n  .builder-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .conversation-page[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .conversation-page[_ngcontent-%COMP%] {\r\n  background: var(--investa-bg);\r\n  border-color: var(--investa-border);\r\n  box-shadow: var(--investa-shadow-md);\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .conversation-page[_ngcontent-%COMP%]::before, body.investa-theme-light   [_nghost-%COMP%]   .conversation-page[_ngcontent-%COMP%]::before {\r\n  background: radial-gradient(circle at 18% 0%, rgba(16, 185, 129, 0.08), transparent 34%);\r\n  opacity: 1;\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .workspace-panel[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .workspace-panel[_ngcontent-%COMP%] {\r\n  background: var(--investa-surface);\r\n}\r\n\r\nbody.investa-theme-light[_nghost-%COMP%]   .chat-panel[_ngcontent-%COMP%], body.investa-theme-light   [_nghost-%COMP%]   .chat-panel[_ngcontent-%COMP%] {\r\n  background: var(--investa-surface-soft);\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChatComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-chat', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, OfferBuilderComponent, TranslatePipe], template: "<main class=\"conversation-page\" [class.mobile-list]=\"mobileView() === 'list'\" [class.mobile-chat]=\"mobileView() === 'chat'\" [class.mobile-context]=\"mobileView() === 'context'\">\r\n  <nav class=\"mobile-switcher\" [attr.aria-label]=\"'conversationWorkspace.mobile.navigation' | translate\">\r\n    <button type=\"button\" [class.active]=\"mobileView() === 'list'\" (click)=\"setMobileView('list')\">{{ 'conversationWorkspace.mobile.list' | translate }}</button>\r\n    <button type=\"button\" [class.active]=\"mobileView() === 'chat'\" [disabled]=\"!activeConversation() && !selectedRequest()\" (click)=\"setMobileView('chat')\">{{ 'conversationWorkspace.mobile.chat' | translate }}</button>\r\n    <button type=\"button\" [class.active]=\"mobileView() === 'context'\" [disabled]=\"!activeConversation()\" (click)=\"setMobileView('context')\">{{ 'conversationWorkspace.mobile.context' | translate }}</button>\r\n  </nav>\r\n\r\n  <section class=\"workspace-panel list-panel\">\r\n    <header class=\"panel-heading\">\r\n      <div>\r\n        <p class=\"eyebrow\">{{ 'conversationWorkspace.eyebrow' | translate }}</p>\r\n        <h1>{{ 'conversationWorkspace.title' | translate }}</h1>\r\n      </div>\r\n    </header>\r\n\r\n    <div class=\"workspace-tabs\" role=\"tablist\">\r\n      <button type=\"button\" role=\"tab\" [class.active]=\"workspaceTab() === 'incoming'\" (click)=\"setWorkspaceTab('incoming')\">\r\n        {{ 'conversationWorkspace.tabs.incoming' | translate }}\r\n      </button>\r\n      <button type=\"button\" role=\"tab\" [class.active]=\"workspaceTab() === 'outgoing'\" (click)=\"setWorkspaceTab('outgoing')\">\r\n        {{ 'conversationWorkspace.tabs.outgoing' | translate }}\r\n      </button>\r\n      <button type=\"button\" role=\"tab\" [class.active]=\"workspaceTab() === 'conversations'\" (click)=\"setWorkspaceTab('conversations')\">\r\n        {{ 'conversationWorkspace.tabs.conversations' | translate }}\r\n      </button>\r\n    </div>\r\n\r\n    <div class=\"list-tools\">\r\n      <label class=\"search-field\">\r\n        <span aria-hidden=\"true\">\u2315</span>\r\n        <input type=\"search\" [value]=\"searchTerm()\" (input)=\"setSearchTerm($event.target.value)\" [placeholder]=\"'conversationWorkspace.search' | translate\">\r\n      </label>\r\n      @if (workspaceTab() === 'conversations') {\r\n        <select [value]=\"conversationFilter()\" (change)=\"setConversationFilter($event.target.value)\" [attr.aria-label]=\"'conversationWorkspace.filter.label' | translate\">\r\n          <option value=\"all\">{{ 'conversationWorkspace.filter.all' | translate }}</option>\r\n          <option value=\"active\">{{ 'conversationWorkspace.filter.active' | translate }}</option>\r\n          <option value=\"closed\">{{ 'conversationWorkspace.filter.closed' | translate }}</option>\r\n        </select>\r\n      }\r\n    </div>\r\n\r\n    <div class=\"conversation-list\">\r\n      @if (loading()) {\r\n        <div class=\"compact-state\"><span class=\"spinner\"></span><p>{{ 'conversationWorkspace.loading' | translate }}</p></div>\r\n      } @else if (error()) {\r\n        <div class=\"compact-state compact-state--error\"><p>{{ error() }}</p><button type=\"button\" (click)=\"loadConversations()\">{{ 'conversationWorkspace.retry' | translate }}</button></div>\r\n      } @else if (workspaceTab() === 'conversations') {\r\n        @for (conversation of visibleConversations(); track conversation.id) {\r\n          <article class=\"list-card\" [class.selected]=\"activeConversation()?.id === conversation.id\">\r\n            <button type=\"button\" class=\"list-card__select\" (click)=\"selectConversation(conversation)\" [attr.aria-label]=\"conversation.counterpartyName\"></button>\r\n            <div class=\"avatar avatar--small\">\r\n              @if (conversation.avatarUrl) { <img [src]=\"conversation.avatarUrl\" [alt]=\"conversation.counterpartyName\"> }\r\n              @else { <span>{{ initials(conversation.counterpartyName) }}</span> }\r\n            </div>\r\n            <div class=\"list-card__body\">\r\n              <div class=\"list-card__top\">\r\n                <strong>{{ conversation.counterpartyName }}</strong>\r\n                <span class=\"list-card__activity\">\r\n                  <time>{{ formatTime(conversation.lastMessageAt) }}</time>\r\n                  @if ((conversation.unreadCount ?? 0) > 0) {\r\n                    <span class=\"unread-badge\" [attr.aria-label]=\"'notifications.unread' | translate\">{{ conversation.unreadCount }}</span>\r\n                  }\r\n                </span>\r\n              </div>\r\n              <p class=\"opportunity-line\">{{ conversation.opportunityTitle }}</p>\r\n              @if (conversation.lastMessage) { <p class=\"message-preview\">{{ conversation.lastMessage }}</p> }\r\n              <span [class]=\"statusBadgeClass(conversation.status)\">{{ statusLabel(conversation.status) }}</span>\r\n            </div>\r\n          </article>\r\n        } @empty {\r\n          <div class=\"compact-state\"><p>{{ 'conversationWorkspace.empty.conversations' | translate }}</p></div>\r\n        }\r\n      } @else {\r\n        @for (request of visibleRequests(); track request.id) {\r\n          <article class=\"list-card\" [class.selected]=\"selectedRequest()?.id === request.id\">\r\n            <button type=\"button\" class=\"list-card__select\" (click)=\"selectRequest(request)\" [attr.aria-label]=\"request.counterpartyName\"></button>\r\n            <div class=\"avatar avatar--small\"><span>{{ initials(request.counterpartyName) }}</span></div>\r\n            <div class=\"list-card__body\">\r\n              <div class=\"list-card__top\"><strong>{{ request.counterpartyName }}</strong><time>{{ formatDate(request.updatedAt || request.createdAt) }}</time></div>\r\n              <p class=\"opportunity-line\">{{ request.opportunityTitle }}</p>\r\n              @if (request.message) { <p class=\"message-preview\">{{ request.message }}</p> }\r\n              <span class=\"status-badge\" [class.status-badge--success]=\"request.status === 'accepted'\" [class.status-badge--closed]=\"request.status === 'rejected' || request.status === 'withdrawn'\">{{ requestStatusLabel(request.status) }}</span>\r\n            </div>\r\n          </article>\r\n        } @empty {\r\n          <div class=\"compact-state\"><p>{{ 'conversationWorkspace.empty.requests' | translate }}</p></div>\r\n        }\r\n      }\r\n    </div>\r\n  </section>\r\n\r\n  <section class=\"workspace-panel chat-panel\">\r\n    @if (activeConversation(); as conversation) {\r\n      <header class=\"chat-header\">\r\n        <div class=\"header-actions\">\r\n          <button type=\"button\" class=\"primary-button\" (click)=\"openOfferBuilder()\" [disabled]=\"isClosed() || offerProcessing()\">{{ 'conversationWorkspace.actions.createOffer' | translate }}</button>\r\n          @if (canReportConversationUser(conversation)) {\r\n            <button type=\"button\" class=\"secondary-button\" (click)=\"openConversationReport(conversation)\">{{ 'conversationWorkspace.actions.report' | translate }}</button>\r\n          }\r\n        </div>\r\n      </header>\r\n\r\n      <section class=\"journey-panel\" [attr.aria-label]=\"'conversationWorkspace.journey.title' | translate\">\r\n        <div class=\"journey-heading\">\r\n          <div><p class=\"eyebrow\">{{ 'conversationWorkspace.journey.eyebrow' | translate }}</p><h2>{{ 'conversationWorkspace.journey.title' | translate }}</h2></div>\r\n          @if (terminalJourneyStatus()) { <span class=\"terminal-status\">{{ terminalJourneyStatus() }}</span> }\r\n        </div>\r\n        <ol class=\"journey-steps\">\r\n          @for (step of journeySteps(); track step.key) {\r\n            <li [class.completed]=\"step.state === 'completed'\" [class.current]=\"step.state === 'current'\" [class.future]=\"step.state === 'future'\">\r\n              <span class=\"journey-dot\">{{ step.state === 'completed' ? '\u2713' : $index + 1 }}</span>\r\n              <span class=\"journey-label\">{{ step.label }}</span>\r\n            </li>\r\n          }\r\n        </ol>\r\n      </section>\r\n\r\n      <div #messageStream class=\"message-stream\">\r\n        @if (messagesLoading()) {\r\n          <div class=\"compact-state\"><span class=\"spinner\"></span><p>{{ 'conversationWorkspace.messages.loading' | translate }}</p></div>\r\n        } @else {\r\n          <div class=\"system-event\"><span>{{ 'conversationWorkspace.events.started' | translate }} \u00B7 {{ formatDate(conversation.createdAt) }}</span></div>\r\n          @for (item of chatItems(); track item.id; let index = $index) {\r\n            @if (item.kind === 'message') {\r\n              <article class=\"message-row\" [class.own]=\"item.message.isSender\" [class.grouped]=\"!isMessageGroupStart(index)\">\r\n                @if (!item.message.isSender) {\r\n                  <span class=\"avatar avatar--message\">{{ initials(item.message.senderName) }}</span>\r\n                }\r\n                <div class=\"message-content\">\r\n                  @if (isMessageGroupStart(index)) {\r\n                    <div class=\"message-meta\"><strong>{{ item.message.isSender ? ('conversationWorkspace.messages.you' | translate) : item.message.senderName }}</strong>@if (item.message.senderRole) { <span>{{ roleLabel(item.message.senderRole) }}</span> }</div>\r\n                  }\r\n                  <div class=\"message-bubble\"><p>{{ item.message.text }}</p><time>{{ formatTime(item.message.sentAt) }}</time></div>\r\n                </div>\r\n                @if (item.message.isSender) {\r\n                  <span class=\"avatar avatar--message\">{{ initials(item.message.senderName) }}</span>\r\n                }\r\n              </article>\r\n            } @else {\r\n            <article class=\"offer-card\" [class.offer-card--accepted]=\"isAcceptedOffer(item.offer)\">\r\n              <header>\r\n                <div>\r\n                  <p class=\"eyebrow\">{{ 'conversationWorkspace.offers.version' | translate }} {{ item.offer.version }}</p>\r\n                  <strong>{{ 'conversationWorkspace.offers.title' | translate }}</strong>\r\n                  @if (item.offer.createdByName) {\r\n                    <p class=\"offer-relation\">{{ item.offer.createdByName }}@if (item.offer.createdByRole) { \u00B7 {{ roleLabel(item.offer.createdByRole) }} }</p>\r\n                  }\r\n                </div>\r\n                <span class=\"status-badge\" [class.status-badge--success]=\"isAcceptedOffer(item.offer)\">{{ offerStatusLabel(item.offer.status) }}</span>\r\n              </header>\r\n              @if (replacedOfferVersion(item.offer); as replacedVersion) { <p class=\"offer-relation\">\u21B3 {{ 'conversationWorkspace.offers.replaces' | translate }} {{ replacedVersion }}</p> }\n              <div class=\"offer-terms\">\r\n                @for (leg of item.offer.legs; track leg.id || leg.legType) {\r\n                  <div><span>{{ offerLegLabel(leg.legType) }}</span><strong>{{ money(leg.amount, item.offer.currency) }}</strong>\r\n                    @if (leg.equityPercentage) { <small>{{ 'conversationWorkspace.offers.equityPercentage' | translate }}: {{ leg.equityPercentage }}%</small> }\n                    @if (leg.sharesTerms) { <small>{{ leg.sharesTerms }}</small> }\n                    @if (leg.returnRate) { <small>{{ 'conversationWorkspace.offers.returnRate' | translate }}: {{ leg.returnRate }}%</small> }\n                    @if (leg.termMonths) { <small>{{ 'conversationWorkspace.offers.term' | translate }}: {{ leg.termMonths }} {{ 'conversationWorkspace.offers.months' | translate }}</small> }\n                    @if (leg.repaymentModel) { <small>{{ 'conversationWorkspace.offers.repayment' | translate }}: {{ repaymentModelLabel(leg.repaymentModel) }}</small> }\n                    @if (leg.profitSharePercentage) { <small>{{ 'conversationWorkspace.offers.profitPercentage' | translate }}: {{ leg.profitSharePercentage }}%</small> }\n                    @if (leg.exitTerms) { <small>{{ leg.exitTerms }}</small> }\n                  </div>\r\n                }\r\n              </div>\r\n              @if (item.offer.note) { <p class=\"offer-note\">{{ item.offer.note }}</p> }\r\n              <footer><time>{{ formatDate(item.offer.createdAt) }} \u00B7 {{ formatTime(item.offer.createdAt) }}</time><div>\r\n                @if (canReceiveOfferAction(item.offer)) {\n                  <button type=\"button\" class=\"primary-button\" (click)=\"acceptOffer(item.offer)\">{{ 'conversationWorkspace.actions.accept' | translate }}</button>\n                }\n                @if (canRespondOfferAction(item.offer)) {\n                  <button type=\"button\" class=\"secondary-button\" (click)=\"openOfferBuilder(item.offer)\">{{ 'conversationWorkspace.actions.respondWithOffer' | translate }}</button>\n                }\n                @if (canRejectOfferAction(item.offer)) {\n                  <button type=\"button\" class=\"text-button\" (click)=\"rejectOffer(item.offer)\">{{ 'conversationWorkspace.actions.reject' | translate }}</button>\n                }\n                @if (canWithdrawOffer(item.offer)) {\n                  <button type=\"button\" class=\"text-button\" (click)=\"withdrawOffer(item.offer)\">{{ 'conversationWorkspace.actions.withdraw' | translate }}</button>\n                }\n              </div></footer>\r\n            </article>\r\n            }\r\n          } @empty {\r\n            <div class=\"compact-state\"><p>{{ 'conversationWorkspace.messages.empty' | translate }}</p></div>\r\n          }\r\n          @if (isClosed()) {\r\n            <div class=\"system-event system-event--closed\"><span>{{ 'conversationWorkspace.events.closed' | translate }} \u00B7 {{ formatDate(conversation.closedAt) }}</span></div>\r\n          }\r\n        }\r\n      </div>\r\n\r\n      @if (messagesError()) { <p class=\"inline-error\">{{ messagesError() }}</p> }\r\n      <form class=\"message-composer\" (submit)=\"onMessageSubmit($event)\">\r\n        <input [formControl]=\"messageControl\" [placeholder]=\"composerHint()\" [readonly]=\"isClosed()\">\r\n        <button type=\"submit\" class=\"primary-button\" [disabled]=\"!canSendMessage()\">{{ sending() ? ('conversationWorkspace.composer.sending' | translate) : ('conversationWorkspace.composer.send' | translate) }}</button>\r\n      </form>\r\n    } @else if (selectedRequest(); as request) {\r\n      <div class=\"request-detail\">\r\n        <div class=\"avatar\"><span>{{ initials(request.counterpartyName) }}</span></div>\r\n        <p class=\"eyebrow\">{{ workspaceTab() === 'incoming' ? ('conversationWorkspace.tabs.incoming' | translate) : ('conversationWorkspace.tabs.outgoing' | translate) }}</p>\r\n        <h2>{{ request.counterpartyName }}</h2>\r\n        @if (roleLabel(request.counterpartyRole)) { <p>{{ roleLabel(request.counterpartyRole) }}</p> }\r\n        <h3>{{ request.opportunityTitle }}</h3>\r\n        @if (request.message) { <blockquote>{{ request.message }}</blockquote> }\r\n        <span class=\"status-badge\">{{ requestStatusLabel(request.status) }}</span>\r\n        <div class=\"request-actions\">\r\n          @if (request.canAccept) { <button type=\"button\" class=\"primary-button\" (click)=\"acceptRequest(request)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.accept' | translate }}</button> }\r\n          @if (request.canReject) { <button type=\"button\" class=\"secondary-button\" (click)=\"rejectRequest(request)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.reject' | translate }}</button> }\r\n        </div>\r\n      </div>\r\n    } @else {\r\n      <div class=\"empty-workspace\"><div class=\"empty-icon\">\u2194</div><h2>{{ 'chat.empty.noConversationTitle' | translate }}</h2><p>{{ 'chat.empty.noConversationSubtitle' | translate }}</p></div>\r\n    }\r\n  </section>\r\n\r\n  <aside class=\"workspace-panel context-panel\">\r\n    @if (activeConversation(); as conversation) {\r\n      <header class=\"panel-heading\"><div><p class=\"eyebrow\">{{ 'conversationWorkspace.context.eyebrow' | translate }}</p><h2>{{ 'conversationWorkspace.context.title' | translate }}</h2></div></header>\r\n      <div class=\"context-scroll\">\r\n        <section class=\"opportunity-summary\">\r\n          <div class=\"opportunity-mark\">{{ initials(conversation.opportunityTitle) }}</div>\r\n          <div><h3>{{ conversation.opportunityTitle }}</h3>@if (conversation.shortDescription) { <p>{{ conversation.shortDescription }}</p> }</div>\r\n        </section>\r\n        @if (conversation.founderName) {\r\n          <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.founder' | translate }}</h3>\r\n            @if (founderProfileId(conversation); as founderId) { <a class=\"founder-row\" [routerLink]=\"['/admin/founders', founderId]\"><span class=\"avatar avatar--small\">{{ initials(conversation.founderName) }}</span><strong>{{ conversation.founderName }}</strong></a> }\r\n            @else { <div class=\"founder-row\"><span class=\"avatar avatar--small\">{{ initials(conversation.founderName) }}</span><strong>{{ conversation.founderName }}</strong></div> }\r\n          </section>\r\n        }\r\n        <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.details' | translate }}</h3><dl class=\"detail-rows\">\r\n          <div><dt>{{ 'conversationWorkspace.context.conversationStatus' | translate }}</dt><dd>{{ statusLabel(conversation.status) }}</dd></div>\r\n          @if (investmentModelLabel(conversation.investmentModel)) { <div><dt>{{ 'conversationWorkspace.context.model' | translate }}</dt><dd>{{ investmentModelLabel(conversation.investmentModel) }}</dd></div> }\r\n          @if (conversation.fundingTarget) { <div><dt>{{ 'conversationWorkspace.context.target' | translate }}</dt><dd>{{ money(conversation.fundingTarget, conversationCurrency(conversation)) }}</dd></div> }\r\n          @if (conversation.minimumParticipation) { <div><dt>{{ 'conversationWorkspace.context.minimum' | translate }}</dt><dd>{{ money(conversation.minimumParticipation, conversationCurrency(conversation)) }}</dd></div> }\r\n          <div><dt>{{ 'conversationWorkspace.context.participation' | translate }}</dt><dd>{{ participationSummary() }}</dd></div>\r\n        </dl></section>\r\n        <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.readiness' | translate }}</h3><div class=\"readiness-row\"><span>{{ 'conversationWorkspace.roles.founder' | translate }}</span><strong [class.ready]=\"conversation.founderReady\">{{ (conversation.founderReady ? 'conversationWorkspace.status.readyShort' : 'conversationWorkspace.status.notReady') | translate }}</strong></div><div class=\"readiness-row\"><span>{{ 'conversationWorkspace.roles.investor' | translate }}</span><strong [class.ready]=\"conversation.investorReady\">{{ (conversation.investorReady ? 'conversationWorkspace.status.readyShort' : 'conversationWorkspace.status.notReady') | translate }}</strong></div><div class=\"readiness-row\"><span>{{ 'conversationWorkspace.context.yourReadyState' | translate }}</span><strong [class.ready]=\"isCurrentUserReady()\">{{ (isCurrentUserReady() ? 'conversationWorkspace.status.readyShort' : 'conversationWorkspace.status.notReady') | translate }}</strong></div>@if (canMarkReady()) { <button type=\"button\" class=\"secondary-button context-ready-action\" (click)=\"markReadyToProceed()\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.ready' | translate }}</button> }</section>\r\n        @if (isClosed()) { <section class=\"closed-note\"><strong>{{ 'conversationWorkspace.events.closed' | translate }}</strong>@if (conversation.closeReason) { <p>{{ conversation.closeReason }}</p> }</section> }\r\n        <div class=\"context-actions\">\r\n          @if (conversation.opportunityId) { <a class=\"secondary-button\" [routerLink]=\"['/admin/investments', conversation.opportunityId]\">{{ 'conversationWorkspace.actions.viewOpportunity' | translate }}</a> }\r\n          @if (projectRoomUnlocked() && conversation.opportunityId) { <a class=\"primary-button primary-button--green\" [routerLink]=\"['/admin/opportunities', conversation.opportunityId, 'room']\">{{ 'conversationWorkspace.actions.openRoom' | translate }}</a> }\n          @if (canCloseDiscussion()) { <button type=\"button\" class=\"secondary-button context-danger-action\" (click)=\"closeDiscussion()\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.close' | translate }}</button> }\r\n          @if (isClosed()) { <button type=\"button\" class=\"secondary-button context-danger-action\" (click)=\"removeClosedConversation(conversation)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.remove' | translate }}</button> }\r\n        </div>\r\n      </div>\r\n    } @else if (selectedRequest(); as request) {\r\n      <header class=\"panel-heading\"><div><p class=\"eyebrow\">{{ 'conversationWorkspace.context.requestEyebrow' | translate }}</p><h2>{{ 'conversationWorkspace.context.requestTitle' | translate }}</h2></div></header>\r\n      <div class=\"context-scroll\">\r\n        <section class=\"opportunity-summary\"><div class=\"opportunity-mark\">{{ initials(request.opportunityTitle) }}</div><div><h3>{{ request.opportunityTitle }}</h3></div></section>\r\n        <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.participant' | translate }}</h3><div class=\"founder-row\"><span class=\"avatar avatar--small\">{{ initials(request.counterpartyName) }}</span><div><strong>{{ request.counterpartyName }}</strong>@if (roleLabel(request.counterpartyRole)) { <small>{{ roleLabel(request.counterpartyRole) }}</small> }</div></div></section>\r\n        <section class=\"context-section\"><h3>{{ 'conversationWorkspace.context.requestState' | translate }}</h3><dl class=\"detail-rows\"><div><dt>{{ 'conversationWorkspace.context.direction' | translate }}</dt><dd>{{ (request.direction === 'incoming' ? 'conversationWorkspace.tabs.incoming' : 'conversationWorkspace.tabs.outgoing') | translate }}</dd></div><div><dt>{{ 'conversationWorkspace.context.statusLabel' | translate }}</dt><dd>{{ requestStatusLabel(request.status) }}</dd></div></dl></section>\r\n        @if (request.canWithdraw) { <div class=\"context-actions\"><button type=\"button\" class=\"secondary-button context-danger-action\" (click)=\"withdrawRequest(request)\" [disabled]=\"actionProcessing()\">{{ 'conversationWorkspace.actions.withdraw' | translate }}</button></div> }\r\n      </div>\r\n    } @else { <div class=\"compact-state\"><p>{{ 'conversationWorkspace.context.empty' | translate }}</p></div> }\r\n  </aside>\r\n</main>\r\n\r\n@if (offerBuilderOpen() && activeConversation(); as conversation) {\n  <app-offer-builder\n    [opportunityId]=\"conversation.opportunityId || 0\"\n    [opportunityTitle]=\"conversation.opportunityTitle\"\n    [conversationId]=\"conversation.id\"\n    mode=\"conversation\"\n    [replacementOffer]=\"replacementOffer()\"\n    (closed)=\"closeOfferBuilder()\"\n    (submitted)=\"onSharedOfferSubmitted($event)\">\n  </app-offer-builder>\n}\n@if (reportModalOpen() && activeConversation(); as conversation) {\r\n  <div class=\"modal-backdrop\" (click)=\"closeReportModal()\"><section class=\"modal-card report-modal\" (click)=\"$event.stopPropagation()\" role=\"dialog\" aria-modal=\"true\"><header><div><p class=\"eyebrow\">{{ conversationReportLabel(conversation) }}</p><h2>{{ conversationReportTargetName(conversation) }}</h2></div><button type=\"button\" class=\"icon-button\" (click)=\"closeReportModal()\">\u00D7</button></header>\r\n    @if (reportSuccess()) { <div class=\"success-note\">{{ 'reports.success' | translate }}</div> }\r\n    @else { <label>{{ 'reports.reason' | translate }}<select [value]=\"reportReason()\" (change)=\"setReportReason($event.target.value)\">@for (reason of reportReasons; track reason) { <option [value]=\"reason\">{{ reportReasonLabel(reason) }}</option> }</select></label><label>{{ 'reports.description' | translate }}<textarea rows=\"4\" [value]=\"reportDescription()\" (input)=\"setReportDescription($event.target.value)\"></textarea></label>@if (reportError()) { <p class=\"inline-error\">{{ reportError() }}</p> }<footer><button type=\"button\" class=\"secondary-button\" (click)=\"closeReportModal()\">{{ 'conversationWorkspace.actions.cancel' | translate }}</button><button type=\"button\" class=\"primary-button\" (click)=\"submitConversationReport()\" [disabled]=\"reportSubmitting()\">{{ reportSubmitting() ? ('reports.submitting' | translate) : ('reports.submit' | translate) }}</button></footer> }\r\n  </section></div>\n}\n", styles: [":host {\r\n  display: block;\r\n  color: var(--investa-text-primary);\r\n  background: var(--investa-bg);\r\n  min-height: 100vh;\r\n}\r\n\r\n* { box-sizing: border-box; }\r\nbutton, input, select, textarea { font: inherit; }\r\nbutton, a { -webkit-tap-highlight-color: transparent; }\r\n\r\n.conversation-page {\r\n  position: relative;\r\n  display: grid;\r\n  grid-template-columns: minmax(260px, 0.78fr) minmax(440px, 1.65fr) minmax(270px, 0.82fr);\r\n  height: calc(100dvh - 5.25rem);\r\n  min-height: 620px;\r\n  overflow: hidden;\r\n  background:\r\n    linear-gradient(145deg, rgba(30, 41, 59, 0.93) 0%, rgba(15, 23, 42, 0.97) 100%);\r\n  border: 1px solid rgba(100, 116, 139, 0.38);\r\n  border-radius: 0.85rem;\r\n  box-shadow: 0 14px 34px rgba(2, 6, 23, 0.22);\r\n}\r\n\r\n.conversation-page::before {\r\n  content: '';\r\n  position: absolute;\r\n  inset: 0;\r\n  pointer-events: none;\r\n  background: radial-gradient(circle at 18% 0%, rgba(56, 189, 248, 0.1), transparent 34%);\r\n  opacity: 0.78;\r\n}\r\n\r\n.conversation-page > * {\r\n  position: relative;\r\n  z-index: 1;\r\n}\r\n\r\n.workspace-panel { min-width: 0; min-height: 0; background: rgba(21, 27, 32, 0.55); }\r\n.list-panel, .context-panel { display: flex; flex-direction: column; }\r\n.list-panel { border-inline-end: 1px solid var(--investa-border); }\r\n.context-panel { border-inline-start: 1px solid var(--investa-border); }\r\n.chat-panel { display: flex; flex-direction: column; background: rgba(36, 39, 43, 0.4); }\r\n\r\n.panel-heading { min-height: 74px; padding: 14px 16px; border-bottom: 1px solid var(--investa-border); }\r\n.chat-header { display: flex; min-height: 52px; align-items: center; justify-content: flex-end; padding: 8px 14px; border-bottom: 1px solid var(--investa-border); }\r\n.panel-heading { display: flex; align-items: center; }\r\n.panel-heading h1, .panel-heading h2, .chat-header h2 { margin: 2px 0 0; font-size: 1.05rem; line-height: 1.25; }\r\n.eyebrow { margin: 0; color: var(--investa-accent); font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\r\n\r\n.workspace-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 8px; border-bottom: 1px solid var(--investa-border); }\r\n.workspace-tabs button { min-width: 0; padding: 8px 5px; border: 0; border-radius: 9px; color: var(--investa-text-secondary); background: transparent; font-size: .74rem; font-weight: 750; cursor: pointer; }\r\n.workspace-tabs button.active { color: var(--investa-text-primary); background: var(--investa-surface-2); }\r\n\r\n.list-tools { display: flex; gap: 7px; padding: 9px; border-bottom: 1px solid var(--investa-border); }\r\n.search-field { position: relative; display: flex; flex: 1; align-items: center; min-width: 0; }\r\n.search-field span { position: absolute; inset-inline-start: 10px; color: var(--investa-text-secondary); }\r\n.search-field input { width: 100%; padding: 8px 9px 8px 30px; }\r\n[dir='rtl'] .search-field input { padding: 8px 30px 8px 9px; }\r\ninput, select, textarea { border: 1px solid var(--investa-border); border-radius: 9px; color: var(--investa-text-primary); background: var(--investa-surface); outline: none; }\r\ninput:focus, select:focus, textarea:focus { border-color: var(--investa-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--investa-accent) 14%, transparent); }\r\n.list-tools select { width: 92px; padding: 7px; color: var(--investa-text-secondary); }\r\n\r\n.conversation-list { flex: 1; min-height: 0; overflow-y: auto; padding: 7px; }\r\n.list-card { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 10px; margin-bottom: 4px; padding: 10px; border: 1px solid transparent; border-radius: 11px; transition: .16s ease; }\r\n.list-card:hover { background: var(--investa-surface-soft); }\r\n.list-card.selected { border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.list-card__select { position: absolute; inset: 0; z-index: 0; border: 0; border-radius: inherit; background: transparent; cursor: pointer; }\r\n.list-card > *:not(.list-card__select) { position: relative; z-index: 1; pointer-events: none; }\r\n.list-card__body { min-width: 0; }\r\n.list-card__top { display: flex; justify-content: space-between; gap: 8px; }\r\n.list-card__top strong { overflow: hidden; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }\r\n.list-card__activity { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 6px; }\r\n.unread-badge { display: inline-grid; min-width: 19px; height: 19px; place-items: center; padding: 0 5px; border-radius: 999px; color: var(--investa-primary-contrast); background: var(--investa-primary); font-size: .66rem; font-weight: 800; }\r\n.list-card time { flex: none; color: var(--investa-text-secondary); font-size: .65rem; }\r\n.opportunity-line, .message-preview { overflow: hidden; margin: 3px 0 0; color: var(--investa-text-secondary); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }\r\n.opportunity-line { color: var(--investa-text-primary); font-weight: 650; }\r\n\r\n.avatar { display: inline-flex; width: 43px; height: 43px; flex: none; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--investa-border); border-radius: 50%; color: var(--investa-accent); background: var(--investa-accent-soft); font-size: .74rem; font-weight: 850; }\r\n.avatar--small { width: 38px; height: 38px; }\r\n.avatar img { width: 100%; height: 100%; object-fit: cover; }\r\n\r\n.status-badge, .ready-chip { display: inline-flex; width: fit-content; align-items: center; margin-top: 6px; padding: 3px 7px; border: 1px solid var(--investa-border); border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: .64rem; font-weight: 800; }\r\n.status-badge--active, .status-badge--pending { color: var(--investa-text-primary); }\r\n.status-badge--success, .ready-chip { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.status-badge--closed { color: var(--investa-error); border-color: color-mix(in srgb, var(--investa-error) 35%, var(--investa-border)); background: var(--investa-error-soft); }\r\n\r\n.chat-header { gap: 8px; }\r\n.participant { display: flex; align-items: center; gap: 10px; min-width: 0; }\r\n.participant > div:last-child { min-width: 0; }\r\n.participant-name { display: block; overflow: hidden; color: var(--investa-text-primary); font-size: .9rem; font-weight: 800; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }\r\na.participant-name:hover { color: var(--investa-accent); }\r\n.participant p { margin: 2px 0 0; color: var(--investa-text-secondary); font-size: .7rem; }\r\n.participant .chat-opportunity { overflow: hidden; max-width: 32rem; color: var(--investa-text-primary); font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }\r\n.header-actions { display: flex; align-items: center; gap: 7px; }\r\n.header-actions .status-badge { margin: 0; }\r\n\r\n.journey-panel { flex: 0 0 auto; padding: 11px 14px 10px; border-bottom: 1px solid var(--investa-border); }\r\n.journey-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }\r\n.journey-heading h2 { margin: 2px 0 0; font-size: .78rem; }\r\n.terminal-status { display: inline-flex; align-items: center; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--investa-error) 35%, var(--investa-border)); border-radius: 999px; color: var(--investa-error); background: var(--investa-error-soft); font-size: .62rem; font-weight: 800; }\r\n.journey-steps { display: flex; gap: 0; margin: 10px 0 0; padding: 0 0 3px; overflow-x: auto; list-style: none; scrollbar-width: thin; }\r\n.journey-steps li { position: relative; display: grid; min-width: 92px; flex: 1 0 92px; justify-items: center; gap: 5px; color: var(--investa-text-secondary); text-align: center; }\r\n.journey-steps li::after { position: absolute; z-index: 0; top: 10px; inset-inline-start: calc(50% + 11px); width: calc(100% - 22px); height: 2px; content: ''; background: var(--investa-border); }\r\n.journey-steps li:last-child::after { display: none; }\r\n.journey-dot { position: relative; z-index: 1; display: grid; width: 22px; height: 22px; place-items: center; border: 1px solid var(--investa-border); border-radius: 50%; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: .58rem; font-weight: 850; font-variant-numeric: tabular-nums; }\r\n.journey-label { max-width: 90px; font-size: .58rem; font-weight: 700; line-height: 1.25; }\r\n.journey-steps li.completed { color: var(--investa-accent); }\r\n.journey-steps li.completed .journey-dot { color: var(--investa-primary-contrast); border-color: var(--investa-accent); background: var(--investa-accent); }\r\n.journey-steps li.completed::after { background: color-mix(in srgb, var(--investa-accent) 55%, var(--investa-border)); }\r\n.journey-steps li.current { color: var(--investa-text-primary); }\r\n.journey-steps li.current .journey-dot { color: var(--investa-primary-contrast); border-color: var(--investa-primary); background: var(--investa-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--investa-accent) 16%, transparent); }\r\n.journey-steps li.current .journey-label { font-weight: 850; }\r\n\r\n.primary-button, .secondary-button, .text-button { display: inline-flex; min-height: 34px; align-items: center; justify-content: center; padding: 7px 12px; border-radius: 9px; font-size: .75rem; font-weight: 800; text-decoration: none; cursor: pointer; }\r\n.primary-button { border: 1px solid var(--investa-primary); color: var(--investa-primary-contrast); background: var(--investa-primary); }\r\n.primary-button--green { border-color: var(--investa-accent); color: var(--investa-primary-contrast); background: var(--investa-accent); }\r\n.secondary-button { border: 1px solid var(--investa-border); color: var(--investa-text-primary); background: var(--investa-surface); }\r\n.text-button { border: 0; color: var(--investa-text-secondary); background: transparent; }\r\nbutton:disabled { opacity: .45; cursor: not-allowed; }\r\n\r\n.actions-menu { position: relative; }\r\n.actions-menu summary { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--investa-border); border-radius: 9px; background: var(--investa-surface); cursor: pointer; list-style: none; }\r\n.actions-menu summary::-webkit-details-marker { display: none; }\r\n.actions-menu > div { position: absolute; z-index: 20; inset-inline-end: 0; top: 39px; width: 190px; padding: 5px; border: 1px solid var(--investa-border); border-radius: 10px; background: var(--investa-surface); box-shadow: var(--investa-shadow-lg); }\r\n.actions-menu button { width: 100%; padding: 8px; border: 0; border-radius: 7px; color: var(--investa-text-primary); text-align: start; background: transparent; cursor: pointer; }\r\n.actions-menu button:hover { background: var(--investa-surface-soft); }\r\n.actions-menu .danger-text { color: var(--investa-error); }\r\n\r\n.message-stream { flex: 1; min-height: 0; overflow-y: auto; padding: 18px clamp(14px, 3vw, 42px); }\r\n.system-event { display: flex; justify-content: center; margin: 8px 0 18px; }\r\n.system-event span { padding: 4px 9px; border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-2); font-size: .65rem; font-weight: 700; }\r\n.system-event--closed span { color: var(--investa-error); background: var(--investa-error-soft); }\r\n.message-row { display: flex; gap: 8px; align-items: flex-start; margin-top: 14px; }\r\n.message-row.own { justify-content: flex-end; }\r\n.message-row.grouped { margin-top: 4px; }\r\n.message-row .avatar--message { width: 32px; height: 32px; flex: none; margin-top: 2px; font-size: .65rem; }\r\n.message-content { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }\r\n.message-row.own .message-content { align-items: flex-end; }\r\n.message-meta { display: flex; align-items: center; gap: 6px; margin: 0 7px 4px; font-size: .68rem; }\r\n.message-meta span { color: var(--investa-text-secondary); }\r\n.message-bubble { max-width: min(76%, 570px); padding: 9px 11px 6px; border: 1px solid var(--investa-border); border-radius: 13px 13px 13px 4px; background: var(--investa-surface); box-shadow: var(--investa-shadow-sm); }\r\n[dir='rtl'] .message-bubble { border-radius: 13px 13px 4px 13px; }\r\n.message-row.own .message-bubble { border-radius: 13px 13px 4px 13px; }\r\n[dir='rtl'] .message-row.own .message-bubble { border-radius: 13px 13px 13px 4px; }\r\n:host-context(body.investa-theme-dark) .message-row.own .message-bubble { background: color-mix(in srgb, var(--investa-info) 15%, transparent); border-color: color-mix(in srgb, var(--investa-info) 30%, transparent); color: #fff; }\r\n:host-context(body.investa-theme-light) .message-row.own .message-bubble { background: var(--investa-primary); border-color: var(--investa-primary); color: var(--investa-primary-contrast); }\r\n.message-bubble p { margin: 0; font-size: .82rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }\r\n.message-bubble time { display: block; margin-top: 3px; color: var(--investa-text-secondary); font-size: .58rem; text-align: end; }\r\n:host-context(body.investa-theme-dark) .message-row.own .message-bubble time { color: var(--investa-text-muted); }\r\n:host-context(body.investa-theme-light) .message-row.own .message-bubble time { color: var(--investa-text-muted); }\r\n\r\n.offer-card { max-width: 590px; margin: 18px auto; padding: 14px; border: 1px solid var(--investa-border); border-inline-start: 3px solid var(--investa-primary); border-radius: 13px; background: var(--investa-surface); }\r\n.offer-card--accepted { border-inline-start-color: var(--investa-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--investa-accent) 8%, transparent); }\r\n.offer-card header, .offer-card footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\r\n.offer-card header .status-badge { margin: 0; }\r\n.offer-card header strong { font-size: .85rem; }\r\n.offer-relation, .offer-note { margin: 8px 0 0; color: var(--investa-text-secondary); font-size: .7rem; }\r\n.offer-terms { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 7px; margin-top: 10px; }\r\n.offer-terms > div { display: grid; gap: 2px; padding: 8px; border-radius: 8px; background: var(--investa-surface-soft); }\r\n.offer-terms span, .offer-terms small { color: var(--investa-text-secondary); font-size: .66rem; }\r\n.offer-terms strong { font-size: .8rem; }\r\n.offer-card footer { margin-top: 11px; padding-top: 9px; border-top: 1px solid var(--investa-border); }\r\n.offer-card footer > div { display: flex; flex-wrap: wrap; gap: 5px; }\r\n\r\n.message-composer { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--investa-border); }\r\n.message-composer input { flex: 1; min-width: 0; padding: 9px 11px; }\r\n.inline-error { margin: 0; padding: 7px 14px; color: var(--investa-error); background: var(--investa-error-soft); font-size: .72rem; }\r\n\r\n.context-scroll { min-height: 0; overflow-y: auto; padding: 12px; }\r\n.opportunity-summary { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 10px; align-items: start; padding: 4px 0 13px; }\r\n.opportunity-mark { display: grid; width: 54px; height: 54px; place-items: center; border-radius: 12px; color: var(--investa-accent); background: var(--investa-accent-soft); font-weight: 900; }\r\n.opportunity-summary h3, .context-section h3 { margin: 0; font-size: .82rem; }\r\n.opportunity-summary p { display: -webkit-box; overflow: hidden; margin: 4px 0 0; color: var(--investa-text-secondary); font-size: .7rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }\r\n.context-section { padding: 12px 0; border-top: 1px solid var(--investa-border); }\r\n.founder-row { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: var(--investa-text-primary); font-size: .75rem; text-decoration: none; }\r\n.detail-rows { margin: 7px 0 0; }\r\n.detail-rows > div, .readiness-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: .72rem; }\r\n.detail-rows dt, .readiness-row span { color: var(--investa-text-secondary); }\r\n.detail-rows dd { margin: 0; font-weight: 750; text-align: end; }\r\n.readiness-row strong { color: var(--investa-text-secondary); }\r\n.readiness-row strong.ready { color: var(--investa-accent); }\r\n.context-ready-action { width: 100%; margin-top: 8px; }\r\n.closed-note { padding: 10px; border-radius: 9px; color: var(--investa-error); background: var(--investa-error-soft); font-size: .72rem; }\r\n.closed-note p { margin: 4px 0 0; }\r\n.context-actions { display: grid; gap: 7px; padding-top: 12px; border-top: 1px solid var(--investa-border); }\r\n.context-danger-action { color: var(--investa-error); }\r\n.founder-row small { display: block; margin-top: 2px; color: var(--investa-text-secondary); font-size: .65rem; }\r\n\r\n.compact-state, .empty-workspace, .request-detail { display: flex; height: 100%; min-height: 180px; align-items: center; justify-content: center; flex-direction: column; padding: 24px; color: var(--investa-text-secondary); text-align: center; }\r\n.compact-state p, .empty-workspace p { margin: 6px 0; font-size: .76rem; }\r\n.compact-state button { padding: 6px 10px; border: 1px solid var(--investa-border); border-radius: 8px; color: var(--investa-text-primary); background: var(--investa-surface); }\r\n.compact-state--error { color: var(--investa-error); }\r\n.spinner { width: 20px; height: 20px; border: 2px solid var(--investa-border); border-top-color: var(--investa-accent); border-radius: 50%; animation: spin .8s linear infinite; }\r\n@keyframes spin { to { transform: rotate(360deg); } }\r\n.empty-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; color: var(--investa-accent); background: var(--investa-accent-soft); }\r\n.empty-workspace h2, .request-detail h2 { margin: 12px 0 0; color: var(--investa-text-primary); font-size: 1rem; }\r\n.request-detail { max-width: 580px; margin: auto; }\r\n.request-detail h3 { margin: 18px 0 0; color: var(--investa-text-primary); font-size: .86rem; }\r\n.request-detail blockquote { margin: 12px 0; padding: 12px; border-inline-start: 3px solid var(--investa-accent); border-radius: 8px; color: var(--investa-text-primary); background: var(--investa-surface); font-size: .8rem; }\r\n.request-actions { display: flex; gap: 7px; margin-top: 18px; }\r\n\r\n.modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 18px; background: var(--investa-overlay); backdrop-filter: blur(3px); }\r\n.modal-card { width: min(680px, 100%); max-height: min(720px, 92dvh); overflow-y: auto; padding: 18px; border: 1px solid var(--investa-border); border-radius: 16px; color: var(--investa-text-primary); background: var(--investa-surface); box-shadow: var(--investa-shadow-lg); }\r\n.modal-card > header, .modal-card > footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\r\n.modal-card h2 { margin: 2px 0 0; font-size: 1rem; }\r\n.modal-card > footer { justify-content: flex-end; margin-top: 15px; }\r\n.modal-card > label { display: grid; gap: 6px; margin-top: 12px; color: var(--investa-text-secondary); font-size: .72rem; font-weight: 700; }\r\n.modal-card label input, .modal-card label select, .modal-card label textarea { width: 100%; padding: 9px; }\r\n.icon-button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--investa-border); border-radius: 9px; color: var(--investa-text-primary); background: var(--investa-surface); cursor: pointer; }\r\n.builder-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }\r\n.leg-editor { padding: 10px; border: 1px solid var(--investa-border); border-radius: 10px; background: var(--investa-surface-soft); }\r\n.leg-editor.enabled { border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); }\r\n.leg-editor label { display: grid; gap: 5px; margin-top: 8px; color: var(--investa-text-secondary); font-size: .68rem; }\r\n.leg-editor .check-row { display: flex; align-items: center; margin: 0; color: var(--investa-text-primary); }\r\n.check-row input { width: auto !important; }\r\n.success-note { margin-top: 14px; padding: 10px; border-radius: 9px; color: var(--investa-accent); background: var(--investa-accent-soft); }\r\n\r\n.mobile-switcher { display: none; }\r\n\r\n@media (max-width: 1080px) {\r\n  .conversation-page { grid-template-columns: 250px minmax(400px, 1fr) 260px; }\r\n  .journey-steps li { min-width: 86px; flex-basis: 86px; }\r\n}\r\n\r\n@media (max-width: 820px) {\r\n  .conversation-page { position: relative; display: block; height: calc(100dvh - 4.5rem); min-height: 480px; padding-top: 46px; border-radius: 0; }\r\n  .mobile-switcher { position: absolute; z-index: 30; inset: 0 0 auto; display: grid; height: 46px; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 6px; border-bottom: 1px solid var(--investa-border); background: var(--investa-surface); }\r\n  .mobile-switcher button { border: 0; border-radius: 8px; color: var(--investa-text-secondary); background: transparent; font-size: .72rem; font-weight: 800; }\r\n  .mobile-switcher button.active { color: var(--investa-text-primary); background: var(--investa-surface-2); }\r\n  .workspace-panel { display: none; height: 100%; border: 0; }\r\n  .mobile-list .list-panel, .mobile-chat .chat-panel, .mobile-context .context-panel { display: flex; }\r\n  .message-stream { padding: 14px 12px; }\r\n  .message-bubble { max-width: 88%; }\r\n  .chat-header { min-height: 48px; padding: 7px 9px; }\r\n  .journey-panel { padding-inline: 10px; }\r\n  .primary-button { min-height: 32px; padding: 6px 9px; }\r\n  .message-composer { position: sticky; bottom: 0; padding: 8px; }\r\n  .builder-grid { grid-template-columns: 1fr; }\r\n}\r\n\r\n:host-context(body.investa-theme-light) .conversation-page {\r\n  background: var(--investa-bg);\r\n  border-color: var(--investa-border);\r\n  box-shadow: var(--investa-shadow-md);\r\n}\r\n\r\n:host-context(body.investa-theme-light) .conversation-page::before {\r\n  background: radial-gradient(circle at 18% 0%, rgba(16, 185, 129, 0.08), transparent 34%);\r\n  opacity: 1;\r\n}\r\n\r\n:host-context(body.investa-theme-light) .workspace-panel {\r\n  background: var(--investa-surface);\r\n}\r\n\r\n:host-context(body.investa-theme-light) .chat-panel {\r\n  background: var(--investa-surface-soft);\r\n}\r\n"] }]
    }], null, { messageStreamElement: [{
            type: ViewChild,
            args: ['messageStream']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ChatComponent, { className: "ChatComponent", filePath: "src/app/pages/admin/chat/chat.component.ts", lineNumber: 174 }); })();
