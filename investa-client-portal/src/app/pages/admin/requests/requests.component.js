import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { RequestsService } from '../../../services/requests.service';
import { FileStoreService } from '../../../services/file-store.service';
import { OpportunityRequestKind } from '../../../models/request.model';
import { DirectOfferInboxComponent } from '../../../components/direct-offer-inbox/direct-offer-inbox.component';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function RequestsComponent_Conditional_97_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 24);
    i0.ɵɵelement(1, "span", 26);
    i0.ɵɵelementStart(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "requests.states.loading"));
} }
function RequestsComponent_Conditional_98_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 25)(1, "span", 27);
    i0.ɵɵtext(2, "!");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 28);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_98_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.refresh()); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.loadError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 2, "requests.states.retry"));
} }
function RequestsComponent_Conditional_99_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 31)(1, "div")(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, "requests.sections.conversationRequests"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "requests.sections.conversationHelper"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.currentConversationCount());
} }
function RequestsComponent_Conditional_99_For_2_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 44);
} if (rf & 2) {
    const request_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r1.resolveImageUrl(request_r4.projectImageUrl), i0.ɵɵsanitizeUrl)("alt", request_r4.projectName);
} }
function RequestsComponent_Conditional_99_For_2_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 45);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.initials(request_r4.projectName));
} }
function RequestsComponent_Conditional_99_For_2_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(request_r4.businessName);
} }
function RequestsComponent_Conditional_99_For_2_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 47);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(request_r4.shortDescription);
} }
function RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 52);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const request_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.accept(request_r4)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 53);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_1_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r5); const request_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.decline(request_r4)); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r4 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.getPrimaryActionLabel(request_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "requests.actions.rejectChat"));
} }
function RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 28);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const request_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.withdraw(request_r4)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "requests.actions.withdrawRequest"));
} }
function RequestsComponent_Conditional_99_For_2_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "footer", 50);
    i0.ɵɵconditionalCreate(1, RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_1_Template, 5, 4);
    i0.ɵɵconditionalCreate(2, RequestsComponent_Conditional_99_For_2_Conditional_44_Conditional_2_Template, 3, 3, "button", 51);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canShowAcceptReject(request_r4) ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canShowWithdraw(request_r4) ? 2 : -1);
} }
function RequestsComponent_Conditional_99_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, RequestsComponent_Conditional_99_For_2_Conditional_0_Template, 10, 7, "header", 31);
    i0.ɵɵelementStart(1, "article", 32);
    i0.ɵɵelement(2, "div", 33);
    i0.ɵɵelementStart(3, "header", 34)(4, "div", 35)(5, "button", 36);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_99_For_2_Template_button_click_5_listener() { const request_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openCounterpartyProfile(request_r4)); });
    i0.ɵɵelementStart(6, "span", 37);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 38)(9, "span", 39);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "strong");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "time");
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(17, "div", 40)(18, "span", 41);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "span", 42);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(23, "section", 43);
    i0.ɵɵconditionalCreate(24, RequestsComponent_Conditional_99_For_2_Conditional_24_Template, 1, 2, "img", 44)(25, RequestsComponent_Conditional_99_For_2_Conditional_25_Template, 2, 1, "div", 45);
    i0.ɵɵelementStart(26, "div")(27, "span");
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "strong");
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(32, RequestsComponent_Conditional_99_For_2_Conditional_32_Template, 2, 1, "small");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "p", 46);
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(35, RequestsComponent_Conditional_99_For_2_Conditional_35_Template, 2, 1, "p", 47);
    i0.ɵɵelementStart(36, "div", 48)(37, "div")(38, "span");
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "strong");
    i0.ɵɵtext(41);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(42, "div", 49);
    i0.ɵɵelement(43, "span");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(44, RequestsComponent_Conditional_99_For_2_Conditional_44_Template, 3, 2, "footer", 50);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r4 = ctx.$implicit;
    const $index_r7 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.shouldShowSectionHeader(request_r4, $index_r7) ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("pending", ctx_r1.statusTone(request_r4) === "pending")("success", ctx_r1.statusTone(request_r4) === "success")("danger", ctx_r1.statusTone(request_r4) === "danger");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("counterparty-link--disabled", !ctx_r1.canOpenCounterpartyProfile(request_r4));
    i0.ɵɵproperty("disabled", !ctx_r1.canOpenCounterpartyProfile(request_r4));
    i0.ɵɵattribute("aria-label", ctx_r1.getCounterpartyName(request_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.initials(ctx_r1.getCounterpartyName(request_r4)));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r4.direction === "incoming" ? i0.ɵɵpipeBind1(11, 36, "requests.from") : i0.ɵɵpipeBind1(12, 38, "requests.to"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.getCounterpartyName(request_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.getExactDateTime(request_r4.createdAt));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 40, "requests.types.conversationRequest"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("pending", ctx_r1.statusTone(request_r4) === "pending")("success", ctx_r1.statusTone(request_r4) === "success")("danger", ctx_r1.statusTone(request_r4) === "danger");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.getStatusDisplay(request_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(request_r4.projectImageUrl ? 24 : 25);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 42, "requests.opportunityLabelShort"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(request_r4.projectName);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r4.businessName ? 32 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.getDirectionCopy(request_r4));
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r4.shortDescription ? 35 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.getProgressLabel(request_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r1.getProgressPercentage(request_r4), "%");
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("width", ctx_r1.getProgressPercentage(request_r4), "%");
    i0.ɵɵclassProp("danger", ctx_r1.statusTone(request_r4) === "danger");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canShowAcceptReject(request_r4) || ctx_r1.canShowWithdraw(request_r4) ? 44 : -1);
} }
function RequestsComponent_Conditional_99_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 24)(1, "span", 27);
    i0.ɵɵtext(2, "\u2194");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.getEmptyTitle());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.getEmptySubtitle());
} }
function RequestsComponent_Conditional_99_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nav", 30);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "button", 54);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_99_Conditional_4_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.previousPage()); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "button", 54);
    i0.ɵɵlistener("click", function RequestsComponent_Conditional_99_Conditional_4_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.nextPage()); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 8, "requests.workspace.pagination"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.currentPage() === 1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 10, "requests.workspace.previous"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate3("", i0.ɵɵpipeBind1(7, 12, "requests.workspace.page"), " ", ctx_r1.currentPage(), " / ", ctx_r1.totalPages());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.currentPage() === ctx_r1.totalPages());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 14, "requests.workspace.next"));
} }
function RequestsComponent_Conditional_99_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 29);
    i0.ɵɵrepeaterCreate(1, RequestsComponent_Conditional_99_For_2_Template, 45, 44, null, null, _forTrack0, false, RequestsComponent_Conditional_99_ForEmpty_3_Template, 7, 2, "section", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, RequestsComponent_Conditional_99_Conditional_4_Template, 11, 16, "nav", 30);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.paginatedRequests());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.totalPages() > 1 ? 4 : -1);
} }
export class RequestsComponent {
    constructor() {
        this.requestsService = inject(RequestsService);
        this.router = inject(Router);
        this.languageService = inject(LanguageService);
        this.fileStoreService = inject(FileStoreService);
        this.tab = signal('incoming', ...(ngDevMode ? [{ debugName: "tab" }] : []));
        this.incoming = this.requestsService.incoming;
        this.outgoing = this.requestsService.outgoing;
        this.incomingCount = computed(() => this.incoming().length, ...(ngDevMode ? [{ debugName: "incomingCount" }] : []));
        this.outgoingCount = computed(() => this.outgoing().length, ...(ngDevMode ? [{ debugName: "outgoingCount" }] : []));
        this.currentConversationCount = computed(() => this.currentTabRequests().filter(request => request.requestType === OpportunityRequestKind.Conversation).length, ...(ngDevMode ? [{ debugName: "currentConversationCount" }] : []));
        // Filter state
        this.statusFilter = signal('pending', ...(ngDevMode ? [{ debugName: "statusFilter" }] : []));
        this.typeFilter = signal('all', ...(ngDevMode ? [{ debugName: "typeFilter" }] : []));
        this.dateFilter = signal('all', ...(ngDevMode ? [{ debugName: "dateFilter" }] : []));
        this.searchTerm = signal('', ...(ngDevMode ? [{ debugName: "searchTerm" }] : []));
        this.loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
        this.loadError = signal(null, ...(ngDevMode ? [{ debugName: "loadError" }] : []));
        // Pagination state
        this.currentPage = signal(1, ...(ngDevMode ? [{ debugName: "currentPage" }] : []));
        this.pageSize = 6;
        // Computed filtered requests
        this.filteredRequests = computed(() => {
            const requests = this.tab() === 'incoming' ? this.incoming() : this.outgoing();
            return requests.filter(request => {
                const query = this.searchTerm().trim().toLocaleLowerCase('en');
                if (query && ![
                    request.projectName,
                    request.counterpartName,
                    request.senderName,
                    request.receiverName,
                    request.businessName
                ].filter((value) => !!value).some(value => value.toLocaleLowerCase('en').includes(query)))
                    return false;
                // Status filter
                if (this.statusFilter() !== 'all') {
                    if (this.statusFilter() === 'pending' && !this.isPendingRequest(request))
                        return false;
                    if (this.statusFilter() === 'accepted' && request.status !== 'Accepted' && request.status !== 'Partner')
                        return false;
                    if (this.statusFilter() === 'rejected' && request.status !== 'Declined' && request.status !== 'Rejected')
                        return false;
                }
                // Type filter
                if (this.typeFilter() !== 'all') {
                    if (this.typeFilter() === 'conversation' && request.requestType !== OpportunityRequestKind.Conversation)
                        return false;
                }
                // Date filter
                if (this.dateFilter() !== 'all') {
                    const now = new Date();
                    const requestDate = new Date(request.createdAt);
                    const daysDiff = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (this.dateFilter() === 'today' && daysDiff > 0)
                        return false;
                    if (this.dateFilter() === '7days' && daysDiff > 7)
                        return false;
                    if (this.dateFilter() === '30days' && daysDiff > 30)
                        return false;
                }
                return true;
            }).sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
        }, ...(ngDevMode ? [{ debugName: "filteredRequests" }] : []));
        // Computed paginated requests
        this.paginatedRequests = computed(() => {
            const filtered = this.filteredRequests();
            const startIndex = (this.currentPage() - 1) * this.pageSize;
            return filtered.slice(startIndex, startIndex + this.pageSize);
        }, ...(ngDevMode ? [{ debugName: "paginatedRequests" }] : []));
        // Computed total pages
        this.totalPages = computed(() => {
            return Math.ceil(this.filteredRequests().length / this.pageSize);
        }, ...(ngDevMode ? [{ debugName: "totalPages" }] : []));
        // Computed display range
        this.displayRange = computed(() => {
            const filtered = this.filteredRequests();
            const startIndex = (this.currentPage() - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, filtered.length);
            return filtered.length > 0 ? `${startIndex + 1}-${endIndex}` : '0-0';
        }, ...(ngDevMode ? [{ debugName: "displayRange" }] : []));
        void this.refresh();
    }
    t(path, fallback) {
        const result = this.languageService.translate(path);
        return result === path ? (fallback ?? path) : result;
    }
    async refresh() {
        try {
            this.loading.set(true);
            this.loadError.set(null);
            await this.requestsService.refreshRequests();
        }
        catch {
            this.loadError.set(this.t('requests.states.loadError', 'Unable to load requests.'));
        }
        finally {
            this.loading.set(false);
        }
    }
    currentTabRequests() {
        return this.tab() === 'incoming' ? this.incoming() : this.outgoing();
    }
    shouldShowSectionHeader(request, index) {
        if (this.typeFilter() !== 'all')
            return index === 0;
        const previous = this.paginatedRequests()[index - 1];
        return !previous || previous.requestType !== request.requestType;
    }
    getEmptyTitle() {
        if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
            return this.t('requests.empty.noMatch', 'No requests match the selected filters.');
        }
        return this.tab() === 'incoming'
            ? this.t('requests.noIncoming', 'No incoming requests.')
            : this.t('requests.noOutgoing', 'No outgoing requests.');
    }
    getEmptySubtitle() {
        if (this.filteredRequests().length === 0 && this.currentTabRequests().length > 0) {
            return this.t('requests.empty.tryAdjustFilters', 'Try adjusting your filter criteria.');
        }
        return this.tab() === 'incoming'
            ? this.t('requests.noIncomingSubtitle', 'Incoming requests will appear here.')
            : this.t('requests.noOutgoingSubtitle', 'Outgoing requests will appear here.');
    }
    switchTab(tab) {
        this.tab.set(tab);
        this.currentPage.set(1);
    }
    setStatusFilter(status) {
        this.statusFilter.set(status);
        this.currentPage.set(1);
    }
    setTypeFilter(type) {
        this.typeFilter.set(type);
        this.currentPage.set(1);
    }
    setDateFilter(date) {
        this.dateFilter.set(date);
        this.currentPage.set(1);
    }
    setSearchTerm(value) {
        this.searchTerm.set(value);
        this.currentPage.set(1);
    }
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }
    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.set(this.currentPage() + 1);
        }
    }
    previousPage() {
        if (this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
        }
    }
    async accept(request) {
        const acceptedConversationId = await this.requestsService.acceptRequest(request);
        if (request.requestType === OpportunityRequestKind.Conversation && acceptedConversationId) {
            await this.router.navigate(['/admin/chat'], { queryParams: { conversationId: acceptedConversationId } });
        }
    }
    decline(request) {
        this.requestsService.declineRequest(request);
    }
    withdraw(request) {
        this.requestsService.withdrawRequest(request);
    }
    resolveImageUrl(url) {
        return this.fileStoreService.getPublicUrl(url);
    }
    getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            const years = Math.floor(interval);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            const months = Math.floor(interval);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            const days = Math.floor(interval);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            const hours = Math.floor(interval);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            const minutes = Math.floor(interval);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        return `${Math.floor(seconds)} second${seconds > 1 ? 's' : ''} ago`;
    }
    /**
  
     * Get display text for request type
  
     */
    getStatusDisplay(request) {
        const status = request.status;
        switch (status) {
            case 'Pending':
            case 'Requested':
                return this.t('requests.status.waitingFounderResponse', 'Waiting for founder response');
            case 'Negotiating':
                return this.t('requests.status.negotiationInProgress', 'Negotiation in progress');
            case 'Partner':
                return this.t('requests.status.projectParticipant', 'Project Participant');
            case 'Accepted':
                return this.t('requests.status.chatAccepted', 'Chat accepted');
            case 'Declined':
            case 'Rejected':
                return this.t('requests.status.declined', 'Declined');
            case 'Cancelled':
            case 'Withdrawn':
                return this.t('requests.status.withdrawn', 'Withdrawn');
            default:
                return this.t('requests.status.closed', 'Closed');
        }
    }
    getDirectionCopy(request) {
        if (request.direction === 'incoming') {
            return this.t('requests.direction.incomingConversation', 'This Investor wants to start a conversation about your Opportunity.');
        }
        return this.t('requests.direction.outgoingConversation', 'Conversation request sent. Waiting for the Founder to respond.');
    }
    getPrimaryActionLabel(request) {
        return request.direction === 'incoming'
            ? this.t('requests.actions.acceptChat', 'Accept Chat')
            : this.t('requests.actions.withdraw', 'Withdraw');
    }
    canShowWithdraw(request) {
        return request.direction === 'outgoing' && request.status === 'Pending' && request.canWithdraw !== false;
    }
    canShowAcceptReject(request) {
        return request.direction === 'incoming' && request.status === 'Pending' && request.canAccept !== false && request.canReject !== false;
    }
    isPendingRequest(request) {
        return request.status === 'Pending';
    }
    getCounterpartyName(request) {
        if (request.direction === 'incoming') {
            return request.senderName || request.counterpartName || 'Investor';
        }
        return request.receiverName || request.counterpartName || 'Founder';
    }
    getCounterpartyUserId(request) {
        const id = request.direction === 'incoming' ? request.investorId : request.founderId;
        if (id === null || id === undefined)
            return null;
        const normalized = String(id).trim();
        return normalized && normalized !== 'undefined' && normalized !== 'null' ? id : null;
    }
    canOpenCounterpartyProfile(request) {
        return this.getCounterpartyUserId(request) !== null;
    }
    openCounterpartyProfile(request) {
        const userId = this.getCounterpartyUserId(request);
        if (userId === null)
            return;
        void this.router.navigate(['/admin/founders', String(userId)]);
    }
    /**
  
     * Get exact date/time display
  
     */
    getExactDateTime(date) {
        const d = new Date(date);
        if (Number.isNaN(d.getTime()))
            return this.unavailableLabel();
        const locale = this.languageService.language() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
        return new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(d);
    }
    initials(name) {
        return (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '—';
    }
    statusTone(request) {
        if (request.status === 'Accepted' || request.status === 'Partner')
            return 'success';
        if (request.status === 'Declined' || request.status === 'Rejected' || request.status === 'Withdrawn' || request.status === 'Cancelled')
            return 'danger';
        if (this.isPendingRequest(request) || request.status === 'Negotiating')
            return 'pending';
        return 'neutral';
    }
    unavailableLabel() {
        return this.t('requests.values.unavailable', 'Unavailable');
    }
    localizedTermValue(value) {
        const key = value.trim().toLowerCase().replace(/[\s_-]+/g, '');
        const known = {
            month: 'month', months: 'months', year: 'year', years: 'years',
            monthly: 'monthly', quarterly: 'quarterly', annually: 'annually', bullet: 'bullet',
            fixed: 'fixed', variable: 'variable', simple: 'simple', compound: 'compound'
        };
        return known[key] ? this.t(`requests.values.${known[key]}`, value) : value;
    }
    /**
  
     * Get progress percentage for timeline
  
     */
    getProgressPercentage(request) {
        const status = request.status;
        switch (status) {
            case 'Pending':
                return 33;
            case 'Negotiating':
                return 66;
            case 'Partner':
            case 'Accepted':
                return 100;
            case 'Declined':
            case 'Rejected':
                return 100;
            default:
                return 33;
        }
    }
    /**
  
     * Get progress label for timeline
  
     */
    getProgressLabel(request) {
        const status = request.status;
        switch (status) {
            case 'Pending':
                return this.t('requests.progress.inReview', 'In Review');
            case 'Negotiating':
                return this.t('requests.progress.negotiating', 'Negotiating');
            case 'Partner':
            case 'Accepted':
                return this.t('requests.progress.completed', 'Completed');
            case 'Declined':
            case 'Rejected':
                return this.t('requests.progress.ended', 'Ended');
            default:
                return this.t('requests.progress.inReview', 'In Review');
        }
    }
    static { this.ɵfac = function RequestsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RequestsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RequestsComponent, selectors: [["app-requests"]], decls: 100, vars: 91, consts: [[1, "requests-page"], [1, "requests-shell"], [1, "page-header", "investa-panel"], [1, "title-block"], [1, "eyebrow"], ["role", "tablist", 1, "header-counts"], ["type", "button", "role", "tab", 3, "click"], [1, "filter-bar", "investa-panel"], [1, "search-control"], ["aria-hidden", "true"], ["type", "search", 3, "input", "value", "placeholder"], [3, "change", "value"], ["value", "all"], ["value", "pending"], ["value", "accepted"], ["value", "rejected"], ["value", "conversation"], ["value", "today"], ["value", "7days"], ["value", "30days"], [1, "results-copy"], [1, "type-overview"], [1, "type-summary", "conversation-summary", "investa-panel"], ["aria-hidden", "true", 1, "summary-icon"], [1, "state-card", "investa-panel"], [1, "state-card", "state-card--error", "investa-panel"], [1, "spinner"], [1, "state-icon"], ["type", "button", 1, "secondary-button", 3, "click"], [1, "request-sections"], [1, "pagination", "investa-panel"], [1, "section-heading"], [1, "request-card", "request-card--conversation", "investa-panel"], [1, "status-rail"], [1, "request-header"], [1, "person-block"], ["type", "button", 1, "counterparty-link", 3, "click", "disabled"], [1, "avatar"], [1, "counterparty-copy"], [1, "direction-label"], [1, "badges"], [1, "type-badge"], [1, "status-badge"], [1, "opportunity-row"], [3, "src", "alt"], [1, "opportunity-mark"], [1, "direction-copy"], [1, "request-message"], [1, "request-progress"], [1, "progress-track"], [1, "request-actions"], ["type", "button", 1, "secondary-button"], ["type", "button", 1, "primary-button", 3, "click"], ["type", "button", 1, "secondary-button", "danger-button", 3, "click"], ["type", "button", 1, "secondary-button", 3, "click", "disabled"]], template: function RequestsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "div", 1)(2, "header", 2)(3, "div", 3)(4, "p", 4);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "h1");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "p");
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "div", 5);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementStart(15, "button", 6);
            i0.ɵɵlistener("click", function RequestsComponent_Template_button_click_15_listener() { return ctx.switchTab("incoming"); });
            i0.ɵɵelementStart(16, "span");
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "strong");
            i0.ɵɵtext(20);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "button", 6);
            i0.ɵɵlistener("click", function RequestsComponent_Template_button_click_21_listener() { return ctx.switchTab("outgoing"); });
            i0.ɵɵelementStart(22, "span");
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "strong");
            i0.ɵɵtext(26);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(27, "section", 7);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementStart(29, "label", 8)(30, "span", 9);
            i0.ɵɵtext(31, "\u2315");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "input", 10);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵlistener("input", function RequestsComponent_Template_input_input_32_listener($event) { return ctx.setSearchTerm($event.target.value); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(34, "label")(35, "span");
            i0.ɵɵtext(36);
            i0.ɵɵpipe(37, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "select", 11);
            i0.ɵɵlistener("change", function RequestsComponent_Template_select_change_38_listener($event) { return ctx.setStatusFilter($event.target.value); });
            i0.ɵɵelementStart(39, "option", 12);
            i0.ɵɵtext(40);
            i0.ɵɵpipe(41, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(42, "option", 13);
            i0.ɵɵtext(43);
            i0.ɵɵpipe(44, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "option", 14);
            i0.ɵɵtext(46);
            i0.ɵɵpipe(47, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(48, "option", 15);
            i0.ɵɵtext(49);
            i0.ɵɵpipe(50, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(51, "label")(52, "span");
            i0.ɵɵtext(53);
            i0.ɵɵpipe(54, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "select", 11);
            i0.ɵɵlistener("change", function RequestsComponent_Template_select_change_55_listener($event) { return ctx.setTypeFilter($event.target.value); });
            i0.ɵɵelementStart(56, "option", 12);
            i0.ɵɵtext(57);
            i0.ɵɵpipe(58, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "option", 16);
            i0.ɵɵtext(60);
            i0.ɵɵpipe(61, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(62, "label")(63, "span");
            i0.ɵɵtext(64);
            i0.ɵɵpipe(65, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(66, "select", 11);
            i0.ɵɵlistener("change", function RequestsComponent_Template_select_change_66_listener($event) { return ctx.setDateFilter($event.target.value); });
            i0.ɵɵelementStart(67, "option", 12);
            i0.ɵɵtext(68);
            i0.ɵɵpipe(69, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(70, "option", 17);
            i0.ɵɵtext(71);
            i0.ɵɵpipe(72, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(73, "option", 18);
            i0.ɵɵtext(74);
            i0.ɵɵpipe(75, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(76, "option", 19);
            i0.ɵɵtext(77);
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(79, "p", 20);
            i0.ɵɵtext(80);
            i0.ɵɵpipe(81, "translate");
            i0.ɵɵpipe(82, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelement(83, "app-direct-offer-inbox");
            i0.ɵɵelementStart(84, "section", 21)(85, "article", 22)(86, "div", 23);
            i0.ɵɵtext(87, "\u2194");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(88, "div")(89, "h2");
            i0.ɵɵtext(90);
            i0.ɵɵpipe(91, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(92, "p");
            i0.ɵɵtext(93);
            i0.ɵɵpipe(94, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(95, "strong");
            i0.ɵɵtext(96);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(97, RequestsComponent_Conditional_97_Template, 5, 3, "section", 24)(98, RequestsComponent_Conditional_98_Template, 8, 4, "section", 25)(99, RequestsComponent_Conditional_99_Template, 5, 2);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 41, "requests.workspace.eyebrow"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 43, "requests.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 45, "requests.workspace.subtitle"));
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 47, "requests.workspace.filtersLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.tab() === "incoming");
            i0.ɵɵattribute("aria-selected", ctx.tab() === "incoming");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 49, "requests.incoming"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.incomingCount());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("active", ctx.tab() === "outgoing");
            i0.ɵɵattribute("aria-selected", ctx.tab() === "outgoing");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 51, "requests.outgoing"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.outgoingCount());
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(28, 53, "requests.workspace.filtersLabel"));
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("value", ctx.searchTerm())("placeholder", i0.ɵɵpipeBind1(33, 55, "requests.workspace.search"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 57, "requests.filters.status"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.statusFilter());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 59, "requests.filters.all"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 61, "requests.filters.pending"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 63, "requests.filters.accepted"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(50, 65, "requests.filters.rejected"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(54, 67, "requests.filters.type"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.typeFilter());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(58, 69, "requests.filters.all"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(61, 71, "requests.filters.conversation"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(65, 73, "requests.filters.date"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.dateFilter());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(69, 75, "requests.filters.allTime"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(72, 77, "requests.filters.today"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(75, 79, "requests.filters.last7Days"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(78, 81, "requests.filters.last30Days"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate4("", i0.ɵɵpipeBind1(81, 83, "requests.filters.showing"), " ", ctx.displayRange(), " ", i0.ɵɵpipeBind1(82, 85, "requests.filters.of"), " ", ctx.filteredRequests().length);
            i0.ɵɵadvance(10);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(91, 87, "requests.sections.conversationRequests"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(94, 89, "requests.sections.conversationHelper"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.currentConversationCount());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 97 : ctx.loadError() ? 98 : 99);
        } }, dependencies: [CommonModule, DirectOfferInboxComponent, TranslatePipe], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n  color: var(--investa-text-primary);\r\n  background: var(--investa-bg);\r\n  min-height: 100vh;\r\n}\r\n\r\n*[_ngcontent-%COMP%] { box-sizing: border-box; }\r\nbutton[_ngcontent-%COMP%], input[_ngcontent-%COMP%], select[_ngcontent-%COMP%] { font: inherit; }\r\n\r\n.requests-page[_ngcontent-%COMP%] { min-height: 100%; padding: 24px; color: var(--investa-text-primary); background: var(--investa-bg); }\r\n.requests-shell[_ngcontent-%COMP%] { width: min(1180px, 100%); margin: 0 auto; }\r\n\r\n.page-header[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 20px 22px; }\r\n.eyebrow[_ngcontent-%COMP%] { margin: 0 0 4px; color: var(--investa-accent); font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\r\n.title-block[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0; font-size: clamp(22px, 3vw, 28px); line-height: 1.2; }\n.title-block[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%]:last-child { margin: 5px 0 0; color: var(--investa-text-secondary); font-size: 13px; }\n.header-counts[_ngcontent-%COMP%] { display: flex; gap: 8px; }\n.header-counts[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%] { min-width: 92px; padding: 10px 12px; border: 1px solid var(--investa-border); border-radius: 12px; color: inherit; background: var(--investa-surface-soft); text-align: start; cursor: pointer; transition: border-color .16s ease, background .16s ease, transform .16s ease; }\n.header-counts[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%]:hover { border-color: color-mix(in srgb, var(--investa-accent) 45%, var(--investa-border)); transform: translateY(-1px); }\n.header-counts[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%]:focus-visible { outline: 3px solid color-mix(in srgb, var(--investa-accent) 24%, transparent); outline-offset: 2px; }\n.header-counts[_ngcontent-%COMP%]    > button.active[_ngcontent-%COMP%] { border-color: var(--investa-accent); background: var(--investa-accent-soft); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--investa-accent) 18%, transparent); }\n.header-counts[_ngcontent-%COMP%]    > button.active[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .header-counts[_ngcontent-%COMP%]    > button.active[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--investa-accent); }\n.header-counts[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; color: var(--investa-text-secondary); font-size: 11px; font-weight: 700; }\n.header-counts[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-top: 2px; color: var(--investa-text-primary); font-size: 18px; font-variant-numeric: tabular-nums; }\n.count-badge[_ngcontent-%COMP%] { display: inline-flex; min-width: 22px; height: 20px; align-items: center; justify-content: center; padding: 0 6px; border: 1px solid var(--investa-border); border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums; }\n\r\n.filter-bar[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(200px, 1fr) repeat(3, minmax(130px, auto)) auto; gap: 10px; align-items: end; margin-top: 12px; padding: 13px; border-radius: 14px; box-shadow: none; }\r\n.filter-bar[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: grid; gap: 6px; color: var(--investa-text-secondary); font-size: 10px; font-weight: 750; letter-spacing: .04em; text-transform: uppercase; }\r\n.filter-bar[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .filter-bar[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { width: 100%; height: 38px; padding: 0 10px; border: 1px solid var(--investa-border); border-radius: 10px; outline: none; color: var(--investa-text-primary); background: var(--investa-surface-soft); font-size: 12px; text-transform: none; }\r\n.filter-bar[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, .filter-bar[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus { border-color: var(--investa-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--investa-accent) 13%, transparent); }\r\n.search-control[_ngcontent-%COMP%] { position: relative; }\r\n.search-control[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { position: absolute; z-index: 1; inset-inline-start: 11px; bottom: 9px; color: var(--investa-text-secondary); font-size: 16px; }\r\n.search-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { padding-inline-start: 32px; }\r\n.results-copy[_ngcontent-%COMP%] { align-self: center; margin: 15px 0 0; color: var(--investa-text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }\r\n\r\n.type-overview[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }\r\n.type-summary[_ngcontent-%COMP%] { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; gap: 11px; align-items: center; padding: 13px 15px; border-radius: 14px; box-shadow: none; }\r\n.summary-icon[_ngcontent-%COMP%] { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--investa-border); border-radius: 11px; color: var(--investa-text-primary); background: var(--investa-surface-soft); font-weight: 900; }\r\n.participation-summary[_ngcontent-%COMP%]   .summary-icon[_ngcontent-%COMP%] { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 32%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.type-summary[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 12px; }\r\n.type-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 3px 0 0; color: var(--investa-text-secondary); font-size: 11px; }\r\n.type-summary[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] { display: grid; min-width: 30px; height: 30px; place-items: center; border: 1px solid var(--investa-border); border-radius: 999px; font-size: 12px; font-variant-numeric: tabular-nums; }\r\n.participation-summary[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 32%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n\r\n.request-sections[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }\r\n.section-heading[_ngcontent-%COMP%] { grid-column: 1 / -1; display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-top: 3px; padding: 0 3px 8px; border-bottom: 1px solid var(--investa-border); }\r\n.section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 13px; }\r\n.section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 3px 0 0; color: var(--investa-text-secondary); font-size: 11px; }\r\n.section-heading[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--investa-accent); font-size: 12px; font-weight: 850; font-variant-numeric: tabular-nums; }\r\n\r\n.request-card[_ngcontent-%COMP%] { position: relative; overflow: hidden; padding: 16px; border-radius: 15px; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }\r\n.request-card[_ngcontent-%COMP%]:hover { border-color: color-mix(in srgb, var(--investa-accent) 30%, var(--investa-border)); box-shadow: var(--investa-shadow-md); transform: translateY(-1px); }\r\n.status-rail[_ngcontent-%COMP%] { position: absolute; inset-block: 0; inset-inline-start: 0; width: 3px; background: var(--investa-border); }\r\n.status-rail.pending[_ngcontent-%COMP%] { background: #a57c27; }\r\n.status-rail.success[_ngcontent-%COMP%] { background: var(--investa-accent); }\r\n.status-rail.danger[_ngcontent-%COMP%] { background: var(--investa-error); }\r\n.request-header[_ngcontent-%COMP%] { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }\r\n.person-block[_ngcontent-%COMP%] { display: flex; gap: 10px; min-width: 0; }\n.counterparty-link[_ngcontent-%COMP%] { display: flex; min-width: 0; align-items: center; gap: 10px; padding: 0; border: 0; color: inherit; background: transparent; text-align: start; cursor: pointer; }\n.counterparty-link[_ngcontent-%COMP%]:hover   strong[_ngcontent-%COMP%] { color: var(--investa-accent); text-decoration: underline; }\n.counterparty-link[_ngcontent-%COMP%]:hover   .avatar[_ngcontent-%COMP%] { border-color: var(--investa-accent); transform: translateY(-1px); }\n.counterparty-link[_ngcontent-%COMP%]:focus-visible { border-radius: 12px; outline: 2px solid var(--investa-accent); outline-offset: 4px; }\n.counterparty-link--disabled[_ngcontent-%COMP%] { cursor: default; }\n.counterparty-link--disabled[_ngcontent-%COMP%]:hover   strong[_ngcontent-%COMP%] { color: inherit; text-decoration: none; }\n.counterparty-link--disabled[_ngcontent-%COMP%]:hover   .avatar[_ngcontent-%COMP%] { border-color: color-mix(in srgb, var(--investa-accent) 28%, var(--investa-border)); transform: none; }\n.counterparty-copy[_ngcontent-%COMP%] { display: block; min-width: 0; }\n.counterparty-copy[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; overflow: hidden; margin-top: 2px; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; transition: color .15s ease; }\n.avatar[_ngcontent-%COMP%] { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border: 1px solid color-mix(in srgb, var(--investa-accent) 28%, var(--investa-border)); border-radius: 12px; color: var(--investa-accent); background: var(--investa-accent-soft); font-size: 12px; font-weight: 850; }\n.direction-label[_ngcontent-%COMP%] { margin: 0; color: var(--investa-text-secondary); font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }\r\n.person-block[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] { display: block; margin-top: 3px; color: var(--investa-text-secondary); font-size: 10px; font-variant-numeric: tabular-nums; }\n.badges[_ngcontent-%COMP%] { display: flex; flex: 0 1 auto; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }\r\n.type-badge[_ngcontent-%COMP%], .status-badge[_ngcontent-%COMP%] { display: inline-flex; align-items: center; padding: 4px 8px; border: 1px solid var(--investa-border); border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: 9px; font-weight: 800; }\r\n.type-badge.participation[_ngcontent-%COMP%] { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 30%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.status-badge.pending[_ngcontent-%COMP%] { color: #7a5a18; border-color: #e4d3a8; background: #fbf5e6; }\r\n.status-badge.success[_ngcontent-%COMP%] { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 32%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.status-badge.danger[_ngcontent-%COMP%] { color: var(--investa-error); border-color: color-mix(in srgb, var(--investa-error) 28%, var(--investa-border)); background: var(--investa-error-soft); }\r\nbody.investa-theme-dark[_nghost-%COMP%]   .status-badge.pending[_ngcontent-%COMP%], body.investa-theme-dark   [_nghost-%COMP%]   .status-badge.pending[_ngcontent-%COMP%] { color: #dfbd6b; border-color: #5c4a25; background: #352f20; }\r\n\r\n.opportunity-row[_ngcontent-%COMP%] { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 9px; align-items: center; margin-top: 14px; padding: 10px; border: 1px solid var(--investa-border); border-radius: 11px; background: var(--investa-surface-soft); }\r\n.opportunity-row[_ngcontent-%COMP%]   img[_ngcontent-%COMP%], .opportunity-mark[_ngcontent-%COMP%] { width: 38px; height: 38px; border-radius: 9px; }\r\n.opportunity-row[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { object-fit: cover; }\r\n.opportunity-mark[_ngcontent-%COMP%] { display: grid; place-items: center; color: var(--investa-text-primary); background: var(--investa-surface); font-size: 10px; font-weight: 850; }\r\n.opportunity-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .opportunity-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; color: var(--investa-text-secondary); font-size: 9px; }\r\n.opportunity-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; overflow: hidden; margin-top: 2px; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }\r\n.direction-copy[_ngcontent-%COMP%], .request-message[_ngcontent-%COMP%] { margin: 11px 0 0; color: var(--investa-text-secondary); font-size: 11px; line-height: 1.5; }\r\n.request-message[_ngcontent-%COMP%] { padding: 9px 10px; border-inline-start: 3px solid var(--investa-border); border-radius: 8px; color: var(--investa-text-primary); background: var(--investa-surface-soft); }\r\n\r\n.terms-panel[_ngcontent-%COMP%] { margin-top: 12px; padding: 11px; border: 1px solid var(--investa-border); border-radius: 11px; background: var(--investa-surface-soft); }\r\n.terms-panel[_ngcontent-%COMP%]    > header[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--investa-border); }\r\n.terms-panel[_ngcontent-%COMP%]    > header[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--investa-text-secondary); font-size: 10px; font-weight: 750; }\r\n.terms-panel[_ngcontent-%COMP%]    > header[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--investa-accent); font-size: 10px; }\r\n.terms-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 14px; margin: 5px 0 0; }\r\n.terms-grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: flex; justify-content: space-between; gap: 8px; padding: 7px 0; border-bottom: 1px solid color-mix(in srgb, var(--investa-border) 65%, transparent); }\r\n.terms-grid[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { color: var(--investa-text-secondary); font-size: 9px; }\r\n.terms-grid[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { overflow: hidden; margin: 0; font-size: 10px; font-weight: 750; text-align: end; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }\r\n\r\n.request-progress[_ngcontent-%COMP%] { margin-top: 12px; }\r\n.request-progress[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:first-child { display: flex; justify-content: space-between; gap: 10px; color: var(--investa-text-secondary); font-size: 9px; font-weight: 750; }\r\n.request-progress[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--investa-text-primary); font-variant-numeric: tabular-nums; }\r\n.progress-track[_ngcontent-%COMP%] { height: 5px; margin-top: 6px; overflow: hidden; border-radius: 99px; background: var(--investa-surface-soft); }\r\n.progress-track[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; height: 100%; border-radius: inherit; background: var(--investa-accent); }\r\n.progress-track[_ngcontent-%COMP%]   span.danger[_ngcontent-%COMP%] { background: var(--investa-error); }\r\n\r\n.request-actions[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; gap: 7px; margin: 13px -16px -16px; padding: 11px 16px; border-top: 1px solid var(--investa-border); background: var(--investa-surface-soft); }\r\n.primary-button[_ngcontent-%COMP%], .secondary-button[_ngcontent-%COMP%] { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; padding: 0 13px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; }\r\n.primary-button[_ngcontent-%COMP%] { border: 1px solid var(--investa-primary); color: var(--investa-primary-contrast); background: var(--investa-primary); }\r\n.secondary-button[_ngcontent-%COMP%] { border: 1px solid var(--investa-border); color: var(--investa-text-primary); background: var(--investa-surface); }\r\n.danger-button[_ngcontent-%COMP%] { color: var(--investa-error); }\r\n.primary-button[_ngcontent-%COMP%]:hover { background: var(--investa-primary-hover); }\r\n.secondary-button[_ngcontent-%COMP%]:hover { border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); }\r\n.primary-button[_ngcontent-%COMP%]:focus-visible, .secondary-button[_ngcontent-%COMP%]:focus-visible { outline: 3px solid color-mix(in srgb, var(--investa-accent) 20%, transparent); outline-offset: 1px; }\r\nbutton[_ngcontent-%COMP%]:disabled { opacity: .45; cursor: not-allowed; }\r\n\r\n.state-card[_ngcontent-%COMP%] { grid-column: 1 / -1; display: flex; min-height: 250px; align-items: center; justify-content: center; flex-direction: column; gap: 8px; margin-top: 16px; padding: 30px; text-align: center; }\r\n.state-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 14px; }\r\n.state-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--investa-text-secondary); font-size: 11px; }\r\n.state-icon[_ngcontent-%COMP%] { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 12px; color: var(--investa-accent); background: var(--investa-accent-soft); font-weight: 850; }\r\n.state-card--error[_ngcontent-%COMP%]   .state-icon[_ngcontent-%COMP%] { color: var(--investa-error); background: var(--investa-error-soft); }\r\n.spinner[_ngcontent-%COMP%] { width: 26px; height: 26px; border: 3px solid var(--investa-border); border-top-color: var(--investa-accent); border-radius: 50%; animation: _ngcontent-%COMP%_spin .75s linear infinite; }\r\n@keyframes _ngcontent-%COMP%_spin { to { transform: rotate(360deg); } }\r\n\r\n.pagination[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: center; gap: 14px; width: fit-content; margin: 14px auto 0; padding: 7px; border-radius: 12px; box-shadow: none; }\r\n.pagination[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--investa-text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }\r\n\r\n@media (max-width: 900px) {\r\n  .filter-bar[_ngcontent-%COMP%] { grid-template-columns: repeat(3, 1fr); }\r\n  .search-control[_ngcontent-%COMP%] { grid-column: 1 / -1; }\r\n  .results-copy[_ngcontent-%COMP%] { grid-column: 1 / -1; margin: 0; }\r\n}\r\n\r\n@media (max-width: 720px) {\r\n  .requests-page[_ngcontent-%COMP%] { padding: 14px; }\r\n  .page-header[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; padding: 17px; }\n  .header-counts[_ngcontent-%COMP%] { width: 100%; }\n  .header-counts[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%] { flex: 1; }\n  .type-overview[_ngcontent-%COMP%], .request-sections[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .type-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { display: none; }\r\n  .request-header[_ngcontent-%COMP%] { align-items: stretch; flex-direction: column; }\r\n  .badges[_ngcontent-%COMP%] { justify-content: flex-start; }\r\n}\r\n\r\n@media (max-width: 520px) {\r\n  .filter-bar[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .search-control[_ngcontent-%COMP%], .results-copy[_ngcontent-%COMP%] { grid-column: auto; }\r\n  .terms-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .request-actions[_ngcontent-%COMP%] { flex-direction: column; }\r\n  .request-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 100%; }\r\n  .pagination[_ngcontent-%COMP%] { width: 100%; justify-content: space-between; }\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RequestsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-requests', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, TranslatePipe, DirectOfferInboxComponent], template: "<main class=\"requests-page\">\r\n  <div class=\"requests-shell\">\r\n    <header class=\"page-header investa-panel\">\r\n      <div class=\"title-block\">\r\n        <p class=\"eyebrow\">{{ 'requests.workspace.eyebrow' | translate }}</p>\r\n        <h1>{{ 'requests.title' | translate }}</h1>\r\n        <p>{{ 'requests.workspace.subtitle' | translate }}</p>\r\n      </div>\r\n      <div class=\"header-counts\" role=\"tablist\" [attr.aria-label]=\"'requests.workspace.filtersLabel' | translate\">\n        <button type=\"button\"\n                role=\"tab\"\n                [attr.aria-selected]=\"tab() === 'incoming'\"\n                [class.active]=\"tab() === 'incoming'\"\n                (click)=\"switchTab('incoming')\">\n          <span>{{ 'requests.incoming' | translate }}</span>\n          <strong>{{ incomingCount() }}</strong>\n        </button>\n        <button type=\"button\"\n                role=\"tab\"\n                [attr.aria-selected]=\"tab() === 'outgoing'\"\n                [class.active]=\"tab() === 'outgoing'\"\n                (click)=\"switchTab('outgoing')\">\n          <span>{{ 'requests.outgoing' | translate }}</span>\n          <strong>{{ outgoingCount() }}</strong>\n        </button>\n      </div>\n    </header>\n\n    <section class=\"filter-bar investa-panel\" [attr.aria-label]=\"'requests.workspace.filtersLabel' | translate\">\n      <label class=\"search-control\">\r\n        <span aria-hidden=\"true\">\u2315</span>\r\n        <input type=\"search\" [value]=\"searchTerm()\" (input)=\"setSearchTerm($event.target.value)\" [placeholder]=\"'requests.workspace.search' | translate\">\r\n      </label>\r\n      <label>\r\n        <span>{{ 'requests.filters.status' | translate }}</span>\r\n        <select [value]=\"statusFilter()\" (change)=\"setStatusFilter($event.target.value)\">\r\n          <option value=\"all\">{{ 'requests.filters.all' | translate }}</option>\r\n          <option value=\"pending\">{{ 'requests.filters.pending' | translate }}</option>\r\n          <option value=\"accepted\">{{ 'requests.filters.accepted' | translate }}</option>\r\n          <option value=\"rejected\">{{ 'requests.filters.rejected' | translate }}</option>\r\n        </select>\r\n      </label>\r\n      <label>\r\n        <span>{{ 'requests.filters.type' | translate }}</span>\r\n        <select [value]=\"typeFilter()\" (change)=\"setTypeFilter($event.target.value)\">\r\n          <option value=\"all\">{{ 'requests.filters.all' | translate }}</option>\r\n          <option value=\"conversation\">{{ 'requests.filters.conversation' | translate }}</option>\r\n        </select>\r\n      </label>\r\n      <label>\r\n        <span>{{ 'requests.filters.date' | translate }}</span>\r\n        <select [value]=\"dateFilter()\" (change)=\"setDateFilter($event.target.value)\">\r\n          <option value=\"all\">{{ 'requests.filters.allTime' | translate }}</option>\r\n          <option value=\"today\">{{ 'requests.filters.today' | translate }}</option>\r\n          <option value=\"7days\">{{ 'requests.filters.last7Days' | translate }}</option>\r\n          <option value=\"30days\">{{ 'requests.filters.last30Days' | translate }}</option>\r\n        </select>\r\n      </label>\r\n      <p class=\"results-copy\">{{ 'requests.filters.showing' | translate }} {{ displayRange() }} {{ 'requests.filters.of' | translate }} {{ filteredRequests().length }}</p>\r\n    </section>\n\n    <app-direct-offer-inbox></app-direct-offer-inbox>\n\r\n    <section class=\"type-overview\">\r\n      <article class=\"type-summary conversation-summary investa-panel\">\r\n        <div class=\"summary-icon\" aria-hidden=\"true\">\u2194</div>\r\n        <div><h2>{{ 'requests.sections.conversationRequests' | translate }}</h2><p>{{ 'requests.sections.conversationHelper' | translate }}</p></div>\r\n        <strong>{{ currentConversationCount() }}</strong>\r\n      </article>\r\n    </section>\r\n\r\n    @if (loading()) {\r\n      <section class=\"state-card investa-panel\"><span class=\"spinner\"></span><h2>{{ 'requests.states.loading' | translate }}</h2></section>\r\n    } @else if (loadError()) {\r\n      <section class=\"state-card state-card--error investa-panel\"><span class=\"state-icon\">!</span><h2>{{ loadError() }}</h2><button type=\"button\" class=\"secondary-button\" (click)=\"refresh()\">{{ 'requests.states.retry' | translate }}</button></section>\r\n    } @else {\r\n      <section class=\"request-sections\">\r\n        @for (request of paginatedRequests(); track request.id) {\r\n          @if (shouldShowSectionHeader(request, $index)) {\n            <header class=\"section-heading\">\n              <div><h2>{{ 'requests.sections.conversationRequests' | translate }}</h2><p>{{ 'requests.sections.conversationHelper' | translate }}</p></div>\n              <span>{{ currentConversationCount() }}</span>\n            </header>\n          }\n\n          <article class=\"request-card request-card--conversation investa-panel\">\n            <div class=\"status-rail\" [class.pending]=\"statusTone(request) === 'pending'\" [class.success]=\"statusTone(request) === 'success'\" [class.danger]=\"statusTone(request) === 'danger'\"></div>\r\n            <header class=\"request-header\">\r\n              <div class=\"person-block\">\n                <button type=\"button\"\n                        class=\"counterparty-link\"\n                        [class.counterparty-link--disabled]=\"!canOpenCounterpartyProfile(request)\"\n                        [disabled]=\"!canOpenCounterpartyProfile(request)\"\n                        (click)=\"openCounterpartyProfile(request)\"\n                        [attr.aria-label]=\"getCounterpartyName(request)\">\n                  <span class=\"avatar\">{{ initials(getCounterpartyName(request)) }}</span>\n                  <span class=\"counterparty-copy\">\n                    <span class=\"direction-label\">{{ request.direction === 'incoming' ? ('requests.from' | translate) : ('requests.to' | translate) }}</span>\n                    <strong>{{ getCounterpartyName(request) }}</strong>\n                    <time>{{ getExactDateTime(request.createdAt) }}</time>\n                  </span>\n                </button>\n              </div>\n              <div class=\"badges\">\r\n                <span class=\"type-badge\">{{ 'requests.types.conversationRequest' | translate }}</span>\n                <span class=\"status-badge\" [class.pending]=\"statusTone(request) === 'pending'\" [class.success]=\"statusTone(request) === 'success'\" [class.danger]=\"statusTone(request) === 'danger'\">{{ getStatusDisplay(request) }}</span>\r\n              </div>\r\n            </header>\r\n\r\n            <section class=\"opportunity-row\">\r\n              @if (request.projectImageUrl) {\r\n                <img [src]=\"resolveImageUrl(request.projectImageUrl)\" [alt]=\"request.projectName\">\r\n              } @else {\r\n                <div class=\"opportunity-mark\">{{ initials(request.projectName) }}</div>\r\n              }\r\n              <div><span>{{ 'requests.opportunityLabelShort' | translate }}</span><strong>{{ request.projectName }}</strong>@if (request.businessName) { <small>{{ request.businessName }}</small> }</div>\r\n            </section>\r\n\r\n            <p class=\"direction-copy\">{{ getDirectionCopy(request) }}</p>\r\n            @if (request.shortDescription) { <p class=\"request-message\">{{ request.shortDescription }}</p> }\r\n\r\n            <div class=\"request-progress\">\r\n              <div><span>{{ getProgressLabel(request) }}</span><strong>{{ getProgressPercentage(request) }}%</strong></div>\r\n              <div class=\"progress-track\"><span [style.width.%]=\"getProgressPercentage(request)\" [class.danger]=\"statusTone(request) === 'danger'\"></span></div>\r\n            </div>\r\n\r\n            @if (canShowAcceptReject(request) || canShowWithdraw(request)) {\r\n              <footer class=\"request-actions\">\r\n                @if (canShowAcceptReject(request)) {\r\n                  <button type=\"button\" class=\"primary-button\" (click)=\"accept(request)\">{{ getPrimaryActionLabel(request) }}</button>\r\n                  <button type=\"button\" class=\"secondary-button danger-button\" (click)=\"decline(request)\">{{ 'requests.actions.rejectChat' | translate }}</button>\n                }\r\n                @if (canShowWithdraw(request)) {\r\n                  <button type=\"button\" class=\"secondary-button\" (click)=\"withdraw(request)\">{{ 'requests.actions.withdrawRequest' | translate }}</button>\r\n                }\r\n              </footer>\r\n            }\r\n          </article>\r\n        } @empty {\r\n          <section class=\"state-card investa-panel\"><span class=\"state-icon\">\u2194</span><h2>{{ getEmptyTitle() }}</h2><p>{{ getEmptySubtitle() }}</p></section>\r\n        }\r\n      </section>\r\n\r\n      @if (totalPages() > 1) {\r\n        <nav class=\"pagination investa-panel\" [attr.aria-label]=\"'requests.workspace.pagination' | translate\">\r\n          <button type=\"button\" class=\"secondary-button\" (click)=\"previousPage()\" [disabled]=\"currentPage() === 1\">{{ 'requests.workspace.previous' | translate }}</button>\r\n          <span>{{ 'requests.workspace.page' | translate }} {{ currentPage() }} / {{ totalPages() }}</span>\r\n          <button type=\"button\" class=\"secondary-button\" (click)=\"nextPage()\" [disabled]=\"currentPage() === totalPages()\">{{ 'requests.workspace.next' | translate }}</button>\r\n        </nav>\r\n      }\r\n    }\r\n  </div>\r\n</main>\r\n", styles: [":host {\r\n  display: block;\r\n  color: var(--investa-text-primary);\r\n  background: var(--investa-bg);\r\n  min-height: 100vh;\r\n}\r\n\r\n* { box-sizing: border-box; }\r\nbutton, input, select { font: inherit; }\r\n\r\n.requests-page { min-height: 100%; padding: 24px; color: var(--investa-text-primary); background: var(--investa-bg); }\r\n.requests-shell { width: min(1180px, 100%); margin: 0 auto; }\r\n\r\n.page-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 20px 22px; }\r\n.eyebrow { margin: 0 0 4px; color: var(--investa-accent); font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\r\n.title-block h1 { margin: 0; font-size: clamp(22px, 3vw, 28px); line-height: 1.2; }\n.title-block > p:last-child { margin: 5px 0 0; color: var(--investa-text-secondary); font-size: 13px; }\n.header-counts { display: flex; gap: 8px; }\n.header-counts > button { min-width: 92px; padding: 10px 12px; border: 1px solid var(--investa-border); border-radius: 12px; color: inherit; background: var(--investa-surface-soft); text-align: start; cursor: pointer; transition: border-color .16s ease, background .16s ease, transform .16s ease; }\n.header-counts > button:hover { border-color: color-mix(in srgb, var(--investa-accent) 45%, var(--investa-border)); transform: translateY(-1px); }\n.header-counts > button:focus-visible { outline: 3px solid color-mix(in srgb, var(--investa-accent) 24%, transparent); outline-offset: 2px; }\n.header-counts > button.active { border-color: var(--investa-accent); background: var(--investa-accent-soft); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--investa-accent) 18%, transparent); }\n.header-counts > button.active span, .header-counts > button.active strong { color: var(--investa-accent); }\n.header-counts span { display: block; color: var(--investa-text-secondary); font-size: 11px; font-weight: 700; }\n.header-counts strong { display: block; margin-top: 2px; color: var(--investa-text-primary); font-size: 18px; font-variant-numeric: tabular-nums; }\n.count-badge { display: inline-flex; min-width: 22px; height: 20px; align-items: center; justify-content: center; padding: 0 6px; border: 1px solid var(--investa-border); border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums; }\n\r\n.filter-bar { display: grid; grid-template-columns: minmax(200px, 1fr) repeat(3, minmax(130px, auto)) auto; gap: 10px; align-items: end; margin-top: 12px; padding: 13px; border-radius: 14px; box-shadow: none; }\r\n.filter-bar label { display: grid; gap: 6px; color: var(--investa-text-secondary); font-size: 10px; font-weight: 750; letter-spacing: .04em; text-transform: uppercase; }\r\n.filter-bar input, .filter-bar select { width: 100%; height: 38px; padding: 0 10px; border: 1px solid var(--investa-border); border-radius: 10px; outline: none; color: var(--investa-text-primary); background: var(--investa-surface-soft); font-size: 12px; text-transform: none; }\r\n.filter-bar input:focus, .filter-bar select:focus { border-color: var(--investa-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--investa-accent) 13%, transparent); }\r\n.search-control { position: relative; }\r\n.search-control > span { position: absolute; z-index: 1; inset-inline-start: 11px; bottom: 9px; color: var(--investa-text-secondary); font-size: 16px; }\r\n.search-control input { padding-inline-start: 32px; }\r\n.results-copy { align-self: center; margin: 15px 0 0; color: var(--investa-text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }\r\n\r\n.type-overview { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }\r\n.type-summary { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; gap: 11px; align-items: center; padding: 13px 15px; border-radius: 14px; box-shadow: none; }\r\n.summary-icon { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--investa-border); border-radius: 11px; color: var(--investa-text-primary); background: var(--investa-surface-soft); font-weight: 900; }\r\n.participation-summary .summary-icon { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 32%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.type-summary h2 { margin: 0; font-size: 12px; }\r\n.type-summary p { margin: 3px 0 0; color: var(--investa-text-secondary); font-size: 11px; }\r\n.type-summary > strong { display: grid; min-width: 30px; height: 30px; place-items: center; border: 1px solid var(--investa-border); border-radius: 999px; font-size: 12px; font-variant-numeric: tabular-nums; }\r\n.participation-summary > strong { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 32%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n\r\n.request-sections { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }\r\n.section-heading { grid-column: 1 / -1; display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-top: 3px; padding: 0 3px 8px; border-bottom: 1px solid var(--investa-border); }\r\n.section-heading h2 { margin: 0; font-size: 13px; }\r\n.section-heading p { margin: 3px 0 0; color: var(--investa-text-secondary); font-size: 11px; }\r\n.section-heading > span { color: var(--investa-accent); font-size: 12px; font-weight: 850; font-variant-numeric: tabular-nums; }\r\n\r\n.request-card { position: relative; overflow: hidden; padding: 16px; border-radius: 15px; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }\r\n.request-card:hover { border-color: color-mix(in srgb, var(--investa-accent) 30%, var(--investa-border)); box-shadow: var(--investa-shadow-md); transform: translateY(-1px); }\r\n.status-rail { position: absolute; inset-block: 0; inset-inline-start: 0; width: 3px; background: var(--investa-border); }\r\n.status-rail.pending { background: #a57c27; }\r\n.status-rail.success { background: var(--investa-accent); }\r\n.status-rail.danger { background: var(--investa-error); }\r\n.request-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }\r\n.person-block { display: flex; gap: 10px; min-width: 0; }\n.counterparty-link { display: flex; min-width: 0; align-items: center; gap: 10px; padding: 0; border: 0; color: inherit; background: transparent; text-align: start; cursor: pointer; }\n.counterparty-link:hover strong { color: var(--investa-accent); text-decoration: underline; }\n.counterparty-link:hover .avatar { border-color: var(--investa-accent); transform: translateY(-1px); }\n.counterparty-link:focus-visible { border-radius: 12px; outline: 2px solid var(--investa-accent); outline-offset: 4px; }\n.counterparty-link--disabled { cursor: default; }\n.counterparty-link--disabled:hover strong { color: inherit; text-decoration: none; }\n.counterparty-link--disabled:hover .avatar { border-color: color-mix(in srgb, var(--investa-accent) 28%, var(--investa-border)); transform: none; }\n.counterparty-copy { display: block; min-width: 0; }\n.counterparty-copy strong { display: block; overflow: hidden; margin-top: 2px; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; transition: color .15s ease; }\n.avatar { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border: 1px solid color-mix(in srgb, var(--investa-accent) 28%, var(--investa-border)); border-radius: 12px; color: var(--investa-accent); background: var(--investa-accent-soft); font-size: 12px; font-weight: 850; }\n.direction-label { margin: 0; color: var(--investa-text-secondary); font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }\r\n.person-block time { display: block; margin-top: 3px; color: var(--investa-text-secondary); font-size: 10px; font-variant-numeric: tabular-nums; }\n.badges { display: flex; flex: 0 1 auto; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }\r\n.type-badge, .status-badge { display: inline-flex; align-items: center; padding: 4px 8px; border: 1px solid var(--investa-border); border-radius: 999px; color: var(--investa-text-secondary); background: var(--investa-surface-soft); font-size: 9px; font-weight: 800; }\r\n.type-badge.participation { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 30%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.status-badge.pending { color: #7a5a18; border-color: #e4d3a8; background: #fbf5e6; }\r\n.status-badge.success { color: var(--investa-accent); border-color: color-mix(in srgb, var(--investa-accent) 32%, var(--investa-border)); background: var(--investa-accent-soft); }\r\n.status-badge.danger { color: var(--investa-error); border-color: color-mix(in srgb, var(--investa-error) 28%, var(--investa-border)); background: var(--investa-error-soft); }\r\n:host-context(body.investa-theme-dark) .status-badge.pending { color: #dfbd6b; border-color: #5c4a25; background: #352f20; }\r\n\r\n.opportunity-row { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 9px; align-items: center; margin-top: 14px; padding: 10px; border: 1px solid var(--investa-border); border-radius: 11px; background: var(--investa-surface-soft); }\r\n.opportunity-row img, .opportunity-mark { width: 38px; height: 38px; border-radius: 9px; }\r\n.opportunity-row img { object-fit: cover; }\r\n.opportunity-mark { display: grid; place-items: center; color: var(--investa-text-primary); background: var(--investa-surface); font-size: 10px; font-weight: 850; }\r\n.opportunity-row span, .opportunity-row small { display: block; color: var(--investa-text-secondary); font-size: 9px; }\r\n.opportunity-row strong { display: block; overflow: hidden; margin-top: 2px; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }\r\n.direction-copy, .request-message { margin: 11px 0 0; color: var(--investa-text-secondary); font-size: 11px; line-height: 1.5; }\r\n.request-message { padding: 9px 10px; border-inline-start: 3px solid var(--investa-border); border-radius: 8px; color: var(--investa-text-primary); background: var(--investa-surface-soft); }\r\n\r\n.terms-panel { margin-top: 12px; padding: 11px; border: 1px solid var(--investa-border); border-radius: 11px; background: var(--investa-surface-soft); }\r\n.terms-panel > header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--investa-border); }\r\n.terms-panel > header span { color: var(--investa-text-secondary); font-size: 10px; font-weight: 750; }\r\n.terms-panel > header strong { color: var(--investa-accent); font-size: 10px; }\r\n.terms-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 14px; margin: 5px 0 0; }\r\n.terms-grid > div { display: flex; justify-content: space-between; gap: 8px; padding: 7px 0; border-bottom: 1px solid color-mix(in srgb, var(--investa-border) 65%, transparent); }\r\n.terms-grid dt { color: var(--investa-text-secondary); font-size: 9px; }\r\n.terms-grid dd { overflow: hidden; margin: 0; font-size: 10px; font-weight: 750; text-align: end; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }\r\n\r\n.request-progress { margin-top: 12px; }\r\n.request-progress > div:first-child { display: flex; justify-content: space-between; gap: 10px; color: var(--investa-text-secondary); font-size: 9px; font-weight: 750; }\r\n.request-progress strong { color: var(--investa-text-primary); font-variant-numeric: tabular-nums; }\r\n.progress-track { height: 5px; margin-top: 6px; overflow: hidden; border-radius: 99px; background: var(--investa-surface-soft); }\r\n.progress-track span { display: block; height: 100%; border-radius: inherit; background: var(--investa-accent); }\r\n.progress-track span.danger { background: var(--investa-error); }\r\n\r\n.request-actions { display: flex; justify-content: flex-end; gap: 7px; margin: 13px -16px -16px; padding: 11px 16px; border-top: 1px solid var(--investa-border); background: var(--investa-surface-soft); }\r\n.primary-button, .secondary-button { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; padding: 0 13px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; }\r\n.primary-button { border: 1px solid var(--investa-primary); color: var(--investa-primary-contrast); background: var(--investa-primary); }\r\n.secondary-button { border: 1px solid var(--investa-border); color: var(--investa-text-primary); background: var(--investa-surface); }\r\n.danger-button { color: var(--investa-error); }\r\n.primary-button:hover { background: var(--investa-primary-hover); }\r\n.secondary-button:hover { border-color: color-mix(in srgb, var(--investa-accent) 35%, var(--investa-border)); }\r\n.primary-button:focus-visible, .secondary-button:focus-visible { outline: 3px solid color-mix(in srgb, var(--investa-accent) 20%, transparent); outline-offset: 1px; }\r\nbutton:disabled { opacity: .45; cursor: not-allowed; }\r\n\r\n.state-card { grid-column: 1 / -1; display: flex; min-height: 250px; align-items: center; justify-content: center; flex-direction: column; gap: 8px; margin-top: 16px; padding: 30px; text-align: center; }\r\n.state-card h2 { margin: 0; font-size: 14px; }\r\n.state-card p { margin: 0; color: var(--investa-text-secondary); font-size: 11px; }\r\n.state-icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 12px; color: var(--investa-accent); background: var(--investa-accent-soft); font-weight: 850; }\r\n.state-card--error .state-icon { color: var(--investa-error); background: var(--investa-error-soft); }\r\n.spinner { width: 26px; height: 26px; border: 3px solid var(--investa-border); border-top-color: var(--investa-accent); border-radius: 50%; animation: spin .75s linear infinite; }\r\n@keyframes spin { to { transform: rotate(360deg); } }\r\n\r\n.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; width: fit-content; margin: 14px auto 0; padding: 7px; border-radius: 12px; box-shadow: none; }\r\n.pagination span { color: var(--investa-text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }\r\n\r\n@media (max-width: 900px) {\r\n  .filter-bar { grid-template-columns: repeat(3, 1fr); }\r\n  .search-control { grid-column: 1 / -1; }\r\n  .results-copy { grid-column: 1 / -1; margin: 0; }\r\n}\r\n\r\n@media (max-width: 720px) {\r\n  .requests-page { padding: 14px; }\r\n  .page-header { align-items: flex-start; flex-direction: column; padding: 17px; }\n  .header-counts { width: 100%; }\n  .header-counts > button { flex: 1; }\n  .type-overview, .request-sections { grid-template-columns: 1fr; }\r\n  .type-summary p, .section-heading p { display: none; }\r\n  .request-header { align-items: stretch; flex-direction: column; }\r\n  .badges { justify-content: flex-start; }\r\n}\r\n\r\n@media (max-width: 520px) {\r\n  .filter-bar { grid-template-columns: 1fr; }\r\n  .search-control, .results-copy { grid-column: auto; }\r\n  .terms-grid { grid-template-columns: 1fr; }\r\n  .request-actions { flex-direction: column; }\r\n  .request-actions button { width: 100%; }\r\n  .pagination { width: 100%; justify-content: space-between; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RequestsComponent, { className: "RequestsComponent", filePath: "src/app/pages/admin/requests/requests.component.ts", lineNumber: 34 }); })();
