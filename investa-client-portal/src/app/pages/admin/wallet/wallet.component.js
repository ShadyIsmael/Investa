import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { walletDirectionKey, walletReasonKey, walletReferenceTypeKey, WalletService } from '../../../services/wallet.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function WalletComponent_div_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵelement(1, "div", 13);
    i0.ɵɵelementStart(2, "p", 14);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "wallet.loading"));
} }
function WalletComponent_div_18_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "div", 16)(2, "p", 17);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 18);
    i0.ɵɵlistener("click", function WalletComponent_div_18_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadWallet()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "wallet.retry"), " ");
} }
function WalletComponent_ng_container_19_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27)(1, "p", 28);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 29);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, item_r3.labelKey));
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(item_r3.tone);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(item_r3.value));
} }
function WalletComponent_ng_container_19_div_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 31);
    i0.ɵɵelement(2, "path", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 14);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "wallet.transactions.empty"));
} }
function WalletComponent_ng_container_19_div_16_tr_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr", 40)(1, "td", 41);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td", 42)(4, "span", 43);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td", 41);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "td", 44);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td", 45);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td", 45);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "td", 41);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "td", 46);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "td", 47);
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const transaction_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(transaction_r4.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r1.directionTone(transaction_r4.direction));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.directionLabel(transaction_r4.direction), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.reasonLabel(transaction_r4.reason));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(transaction_r4.creditAmount));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(transaction_r4.balanceBefore));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatNumber(transaction_r4.balanceAfter));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.referenceTypeLabel(transaction_r4.referenceType));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.displayValue(transaction_r4.referenceId));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.displayValue(transaction_r4.description));
} }
function WalletComponent_ng_container_19_div_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33)(1, "table", 34)(2, "thead", 35)(3, "tr")(4, "th", 36);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "th", 36);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th", 36);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "th", 37);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "th", 37);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "th", 37);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "th", 36);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "th", 36);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "th", 36);
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(31, "tbody", 38);
    i0.ɵɵtemplate(32, WalletComponent_ng_container_19_div_16_tr_32_Template, 20, 11, "tr", 39);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 10, "wallet.transactions.createdAt"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 12, "wallet.transactions.direction"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 14, "wallet.transactions.reason"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 16, "wallet.transactions.creditAmount"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 18, "wallet.transactions.balanceBefore"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 20, "wallet.transactions.balanceAfter"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 22, "wallet.transactions.referenceType"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 24, "wallet.transactions.referenceId"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 26, "wallet.transactions.description"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r1.transactions());
} }
function WalletComponent_ng_container_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "section", 19);
    i0.ɵɵtemplate(2, WalletComponent_ng_container_19_div_2_Template, 6, 6, "div", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 21);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "section", 22)(7, "div", 23)(8, "div")(9, "h2", 24);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 7);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(15, WalletComponent_ng_container_19_div_15_Template, 6, 3, "div", 25)(16, WalletComponent_ng_container_19_div_16_Template, 33, 28, "div", 26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r1.summaryItems());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 7, "wallet.platformCreditHelper"), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 9, "wallet.transactions.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(14, 11, "wallet.transactions.recordCount"), " ", ctx_r1.transactions().length);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r1.transactions().length === 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.transactions().length > 0);
} }
export class WalletComponent {
    constructor() {
        this.walletService = inject(WalletService);
        this.router = inject(Router);
        this.languageService = inject(LanguageService);
        this.wallet = signal(null, ...(ngDevMode ? [{ debugName: "wallet" }] : []));
        this.balance = this.walletService.balance;
        this.transactions = signal([], ...(ngDevMode ? [{ debugName: "transactions" }] : []));
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.summaryItems = computed(() => {
            const wallet = this.wallet();
            return [
                { labelKey: 'wallet.summary.currentBalance', value: this.balance(), tone: 'text-blue-300' },
                { labelKey: 'wallet.summary.purchased', value: wallet?.totalPurchasedCredits ?? 0, tone: 'text-emerald-300' },
                { labelKey: 'wallet.summary.bonus', value: wallet?.totalBonusCredits ?? 0, tone: 'text-violet-300' },
                { labelKey: 'wallet.summary.refunds', value: wallet?.totalRefundCredits ?? 0, tone: 'text-amber-300' }
            ];
        }, ...(ngDevMode ? [{ debugName: "summaryItems" }] : []));
        this.loadWallet();
    }
    async loadWallet() {
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            const view = await this.walletService.loadCurrentUserWallet();
            this.wallet.set(view.wallet);
            this.transactions.set(view.transactions);
        }
        catch (error) {
            this.errorMessage.set(this.errorText(error));
            this.wallet.set(null);
            this.transactions.set([]);
        }
        finally {
            this.isLoading.set(false);
        }
    }
    formatNumber(value) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value ?? 0);
    }
    formatDate(value) {
        if (!value)
            return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            return value;
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }
    displayValue(value) {
        if (value === null || value === undefined || value === '')
            return '-';
        return String(value);
    }
    directionTone(direction) {
        return walletDirectionKey(direction) === 'credit'
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
            : 'bg-red-500/15 text-red-300 border-red-500/25';
    }
    goBack() {
        this.router.navigate(['/admin/profile']);
    }
    t(path) {
        return this.languageService.translate(path);
    }
    directionLabel(value) {
        return this.t(`wallet.enums.direction.${walletDirectionKey(value)}`);
    }
    reasonLabel(value) {
        return this.t(`wallet.enums.reason.${walletReasonKey(value)}`);
    }
    referenceTypeLabel(value) {
        return this.t(`wallet.enums.referenceType.${walletReferenceTypeKey(value)}`);
    }
    errorText(error) {
        const record = typeof error === 'object' && error !== null ? error : null;
        return typeof record?.['message'] === 'string' ? record['message'] : this.t('wallet.errors.loadFailed');
    }
    static { this.ɵfac = function WalletComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WalletComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WalletComponent, selectors: [["app-wallet"]], decls: 20, vars: 16, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8"], [1, "mb-8", "flex", "flex-col", "gap-4", "md:flex-row", "md:items-center", "md:justify-between"], [1, "flex", "items-center", "gap-3"], ["type", "button", 1, "p-2", "hover:bg-slate-700", "rounded-lg", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-gray-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400", "mt-1"], ["type", "button", 1, "inline-flex", "items-center", "justify-center", "rounded-lg", "bg-slate-800", "px-4", "py-2", "text-sm", "font-semibold", "text-gray-200", "hover:bg-slate-700", "disabled:opacity-50", 3, "click", "disabled"], ["class", "text-center py-12", 4, "ngIf"], ["class", "bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6", 4, "ngIf"], [4, "ngIf"], [1, "text-center", "py-12"], [1, "w-12", "h-12", "border-4", "border-blue-400", "border-t-transparent", "rounded-full", "animate-spin", "mx-auto", "mb-4"], [1, "text-gray-400"], [1, "bg-red-500/20", "border", "border-red-500/50", "rounded-lg", "p-4", "mb-6"], [1, "flex", "flex-col", "gap-3", "md:flex-row", "md:items-center", "md:justify-between"], [1, "text-red-200"], ["type", "button", 1, "rounded-md", "bg-red-500/20", "px-3", "py-2", "text-sm", "font-semibold", "text-red-100", "hover:bg-red-500/30", 3, "click"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "xl:grid-cols-4", "gap-4", "mb-8"], ["class", "bg-slate-900/80 border border-slate-800 rounded-xl p-5", 4, "ngFor", "ngForOf"], [1, "mb-4", "rounded-xl", "border", "border-blue-500/20", "bg-blue-500/10", "px-4", "py-3", "text-sm", "text-blue-100"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-xl", "overflow-hidden"], [1, "p-5", "border-b", "border-slate-800", "flex", "items-center", "justify-between"], [1, "text-xl", "font-bold", "text-white"], ["class", "p-12 text-center", 4, "ngIf"], ["class", "overflow-x-auto", 4, "ngIf"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-xl", "p-5"], [1, "text-xs", "font-medium", "text-gray-500", "uppercase", "tracking-wider", "mb-2"], [1, "text-3xl", "font-bold"], [1, "p-12", "text-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "mx-auto", "mb-4", "text-gray-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"], [1, "overflow-x-auto"], [1, "min-w-full", "divide-y", "divide-slate-800"], [1, "bg-slate-950/50"], [1, "px-4", "py-3", "text-left", "text-xs", "font-semibold", "uppercase", "tracking-wider", "text-gray-400"], [1, "px-4", "py-3", "text-right", "text-xs", "font-semibold", "uppercase", "tracking-wider", "text-gray-400"], [1, "divide-y", "divide-slate-800"], ["class", "hover:bg-slate-800/30 transition-colors", 4, "ngFor", "ngForOf"], [1, "hover:bg-slate-800/30", "transition-colors"], [1, "px-4", "py-4", "whitespace-nowrap", "text-sm", "text-gray-300"], [1, "px-4", "py-4", "whitespace-nowrap"], [1, "inline-flex", "rounded-full", "border", "px-2.5", "py-1", "text-xs", "font-semibold"], [1, "px-4", "py-4", "whitespace-nowrap", "text-right", "text-sm", "font-semibold", "text-white"], [1, "px-4", "py-4", "whitespace-nowrap", "text-right", "text-sm", "text-gray-300"], [1, "px-4", "py-4", "whitespace-nowrap", "text-sm", "text-gray-400"], [1, "px-4", "py-4", "min-w-64", "text-sm", "text-gray-300"]], template: function WalletComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "button", 3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵlistener("click", function WalletComponent_Template_button_click_3_listener() { return ctx.goBack(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(5, "svg", 4);
            i0.ɵɵelement(6, "path", 5);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(7, "div")(8, "h1", 6);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "p", 7);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(14, "button", 8);
            i0.ɵɵlistener("click", function WalletComponent_Template_button_click_14_listener() { return ctx.loadWallet(); });
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(17, WalletComponent_div_17_Template, 5, 3, "div", 9)(18, WalletComponent_div_18_Template, 7, 4, "div", 10)(19, WalletComponent_ng_container_19_Template, 17, 13, "ng-container", 11);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 8, "wallet.backToProfile"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 10, "wallet.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 12, "wallet.subtitle"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 14, "wallet.refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.errorMessage() && !ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", !ctx.isLoading() && !ctx.errorMessage());
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WalletComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-wallet', imports: [CommonModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"container mx-auto p-6 lg:p-8\">\r\n  <div class=\"mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between\">\r\n    <div class=\"flex items-center gap-3\">\r\n      <button type=\"button\" (click)=\"goBack()\" class=\"p-2 hover:bg-slate-700 rounded-lg transition-colors\" [attr.aria-label]=\"'wallet.backToProfile' | translate\">\r\n        <svg class=\"w-6 h-6 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\"/>\r\n        </svg>\r\n      </button>\r\n      <div>\r\n        <h1 class=\"text-3xl font-bold text-white\">{{ 'wallet.title' | translate }}</h1>\r\n        <p class=\"text-sm text-gray-400 mt-1\">{{ 'wallet.subtitle' | translate }}</p>\r\n      </div>\r\n    </div>\r\n\r\n    <button type=\"button\" (click)=\"loadWallet()\" [disabled]=\"isLoading()\" class=\"inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-slate-700 disabled:opacity-50\">\r\n      {{ 'wallet.refresh' | translate }}\r\n    </button>\r\n  </div>\r\n\r\n  <div *ngIf=\"isLoading()\" class=\"text-center py-12\">\r\n    <div class=\"w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4\"></div>\r\n    <p class=\"text-gray-400\">{{ 'wallet.loading' | translate }}</p>\r\n  </div>\r\n\r\n  <div *ngIf=\"errorMessage() && !isLoading()\" class=\"bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6\">\r\n    <div class=\"flex flex-col gap-3 md:flex-row md:items-center md:justify-between\">\r\n      <p class=\"text-red-200\">{{ errorMessage() }}</p>\r\n      <button type=\"button\" (click)=\"loadWallet()\" class=\"rounded-md bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/30\">\r\n        {{ 'wallet.retry' | translate }}\r\n      </button>\r\n    </div>\r\n  </div>\r\n\r\n  <ng-container *ngIf=\"!isLoading() && !errorMessage()\">\r\n    <section class=\"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8\">\r\n      <div *ngFor=\"let item of summaryItems()\" class=\"bg-slate-900/80 border border-slate-800 rounded-xl p-5\">\r\n        <p class=\"text-xs font-medium text-gray-500 uppercase tracking-wider mb-2\">{{ item.labelKey | translate }}</p>\r\n        <p class=\"text-3xl font-bold\" [class]=\"item.tone\">{{ formatNumber(item.value) }}</p>\r\n      </div>\r\n    </section>\r\n\r\n    <p class=\"mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100\">\r\n      {{ 'wallet.platformCreditHelper' | translate }}\r\n    </p>\r\n\r\n    <section class=\"bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden\">\r\n      <div class=\"p-5 border-b border-slate-800 flex items-center justify-between\">\r\n        <div>\r\n          <h2 class=\"text-xl font-bold text-white\">{{ 'wallet.transactions.title' | translate }}</h2>\r\n          <p class=\"text-sm text-gray-400 mt-1\">{{ 'wallet.transactions.recordCount' | translate }} {{ transactions().length }}</p>\r\n        </div>\r\n      </div>\r\n\r\n      <div *ngIf=\"transactions().length === 0\" class=\"p-12 text-center\">\r\n        <svg class=\"w-16 h-16 mx-auto mb-4 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\"/>\r\n        </svg>\r\n        <p class=\"text-gray-400\">{{ 'wallet.transactions.empty' | translate }}</p>\r\n      </div>\r\n\r\n      <div *ngIf=\"transactions().length > 0\" class=\"overflow-x-auto\">\r\n        <table class=\"min-w-full divide-y divide-slate-800\">\r\n          <thead class=\"bg-slate-950/50\">\r\n            <tr>\r\n              <th class=\"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.createdAt' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.direction' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.reason' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.creditAmount' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.balanceBefore' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.balanceAfter' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.referenceType' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.referenceId' | translate }}</th>\r\n              <th class=\"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400\">{{ 'wallet.transactions.description' | translate }}</th>\r\n            </tr>\r\n          </thead>\r\n          <tbody class=\"divide-y divide-slate-800\">\r\n            <tr *ngFor=\"let transaction of transactions()\" class=\"hover:bg-slate-800/30 transition-colors\">\r\n              <td class=\"px-4 py-4 whitespace-nowrap text-sm text-gray-300\">{{ formatDate(transaction.createdAt) }}</td>\r\n              <td class=\"px-4 py-4 whitespace-nowrap\">\r\n                <span class=\"inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold\" [class]=\"directionTone(transaction.direction)\">\r\n                  {{ directionLabel(transaction.direction) }}\n                </span>\r\n              </td>\r\n              <td class=\"px-4 py-4 whitespace-nowrap text-sm text-gray-300\">{{ reasonLabel(transaction.reason) }}</td>\n              <td class=\"px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-white\">{{ formatNumber(transaction.creditAmount) }}</td>\r\n              <td class=\"px-4 py-4 whitespace-nowrap text-right text-sm text-gray-300\">{{ formatNumber(transaction.balanceBefore) }}</td>\r\n              <td class=\"px-4 py-4 whitespace-nowrap text-right text-sm text-gray-300\">{{ formatNumber(transaction.balanceAfter) }}</td>\r\n              <td class=\"px-4 py-4 whitespace-nowrap text-sm text-gray-300\">{{ referenceTypeLabel(transaction.referenceType) }}</td>\n              <td class=\"px-4 py-4 whitespace-nowrap text-sm text-gray-400\">{{ displayValue(transaction.referenceId) }}</td>\r\n              <td class=\"px-4 py-4 min-w-64 text-sm text-gray-300\">{{ displayValue(transaction.description) }}</td>\r\n            </tr>\r\n          </tbody>\r\n        </table>\r\n      </div>\r\n    </section>\r\n  </ng-container>\r\n</div>\r\n", styles: [":host {\n  display: block;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WalletComponent, { className: "WalletComponent", filePath: "src/app/pages/admin/wallet/wallet.component.ts", lineNumber: 16 }); })();
