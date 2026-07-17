import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { Router } from '@angular/router';
import { walletDirectionKey, walletReasonKey, walletReferenceTypeKey, WalletService } from '../../../services/wallet.service';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function TransactionsComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 14);
    i0.ɵɵdomElement(1, "div", 17);
    i0.ɵɵdomElementStart(2, "p", 18);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "wallet.loading"));
} }
function TransactionsComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 15)(1, "p", 19);
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "button", 20);
    i0.ɵɵdomListener("click", function TransactionsComponent_Conditional_35_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.loadTransactions()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "wallet.retry"));
} }
function TransactionsComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 16)(1, "p", 18);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "wallet.transactions.empty"));
} }
function TransactionsComponent_Conditional_37_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "article", 22)(1, "div", 24)(2, "div", 25)(3, "h2", 26);
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "p", 27);
    i0.ɵɵtext(6);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "div", 28)(8, "span", 29);
    i0.ɵɵtext(9);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(10, "span", 29);
    i0.ɵɵtext(11);
    i0.ɵɵdomElementEnd()()();
    i0.ɵɵdomElementStart(12, "strong", 30);
    i0.ɵɵtext(13);
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const transaction_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.transactionTitle(transaction_r3));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(transaction_r3.createdAt));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.directionLabel(transaction_r3.direction));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.referenceTypeLabel(transaction_r3.referenceType));
    i0.ɵɵadvance();
    i0.ɵɵclassProp("text-emerald-400", ctx_r1.isCredit(transaction_r3))("text-red-400", !ctx_r1.isCredit(transaction_r3));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r1.signedAmount(transaction_r3) > 0 ? "+" : "", "", ctx_r1.formatNumber(ctx_r1.signedAmount(transaction_r3)));
} }
function TransactionsComponent_Conditional_37_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "nav", 23);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵdomElementStart(2, "button", 31);
    i0.ɵɵdomListener("click", function TransactionsComponent_Conditional_37_Conditional_3_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.goToPage(ctx_r1.currentPage() - 1)); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "span", 32);
    i0.ɵɵtext(6);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "button", 31);
    i0.ɵɵdomListener("click", function TransactionsComponent_Conditional_37_Conditional_3_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.goToPage(ctx_r1.currentPage() + 1)); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 7, "transactions.pages"));
    i0.ɵɵadvance(2);
    i0.ɵɵdomProperty("disabled", ctx_r1.currentPage() === 1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, "wallet.pagination.previous"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r1.formatNumber(ctx_r1.currentPage()), " / ", ctx_r1.formatNumber(ctx_r1.totalPages()));
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("disabled", ctx_r1.currentPage() === ctx_r1.totalPages());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 11, "wallet.pagination.next"));
} }
function TransactionsComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "section", 21);
    i0.ɵɵrepeaterCreate(1, TransactionsComponent_Conditional_37_For_2_Template, 14, 10, "article", 22, _forTrack0);
    i0.ɵɵdomElementEnd();
    i0.ɵɵconditionalCreate(3, TransactionsComponent_Conditional_37_Conditional_3_Template, 10, 13, "nav", 23);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.paginatedTransactions());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.totalPages() > 1 ? 3 : -1);
} }
export class TransactionsComponent {
    constructor() {
        this.walletService = inject(WalletService);
        this.languageService = inject(LanguageService);
        this.router = inject(Router);
        this.transactions = signal([], ...(ngDevMode ? [{ debugName: "transactions" }] : []));
        this.currentBalance = this.walletService.balance;
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.itemsPerPage = 10;
        this.currentPage = signal(1, ...(ngDevMode ? [{ debugName: "currentPage" }] : []));
        this.paginatedTransactions = computed(() => {
            const start = (this.currentPage() - 1) * this.itemsPerPage;
            return this.transactions().slice(start, start + this.itemsPerPage);
        }, ...(ngDevMode ? [{ debugName: "paginatedTransactions" }] : []));
        this.totalPages = computed(() => Math.ceil(this.transactions().length / this.itemsPerPage), ...(ngDevMode ? [{ debugName: "totalPages" }] : []));
        void this.loadTransactions();
    }
    async loadTransactions() {
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            const view = await this.walletService.loadCurrentUserWallet();
            this.transactions.set(view.transactions);
        }
        catch (error) {
            const record = typeof error === 'object' && error !== null ? error : null;
            this.errorMessage.set(typeof record?.['message'] === 'string' ? record['message'] : this.t('wallet.errors.loadFailed'));
        }
        finally {
            this.isLoading.set(false);
        }
    }
    transactionTitle(transaction) {
        return transaction.description?.trim() || this.t(`wallet.enums.reason.${walletReasonKey(transaction.reason)}`);
    }
    directionLabel(value) {
        return this.t(`wallet.enums.direction.${walletDirectionKey(value)}`);
    }
    referenceTypeLabel(value) {
        return this.t(`wallet.enums.referenceType.${walletReferenceTypeKey(value)}`);
    }
    isCredit(transaction) {
        return walletDirectionKey(transaction.direction) === 'credit';
    }
    signedAmount(transaction) {
        return this.isCredit(transaction) ? transaction.creditAmount : -transaction.creditAmount;
    }
    formatNumber(value) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
    }
    formatDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages())
            this.currentPage.set(page);
    }
    goBack() {
        void this.router.navigate(['/admin/profile']);
    }
    t(path) {
        return this.languageService.translate(path);
    }
    static { this.ɵfac = function TransactionsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TransactionsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TransactionsComponent, selectors: [["app-transactions"]], decls: 38, vars: 23, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8"], [1, "mb-8"], [1, "flex", "items-center", "justify-between", "gap-4", "mb-6"], [1, "flex", "items-center", "gap-3"], ["type", "button", 1, "p-2", "hover:bg-slate-700", "rounded-lg", "transition-colors", 3, "click"], ["aria-hidden", "true"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-sm", "text-gray-400"], [1, "text-end"], [1, "text-2xl", "font-bold", "text-emerald-400"], [1, "grid", "grid-cols-2", "gap-4", "max-w-md"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-2xl", "p-4"], [1, "text-xs", "text-gray-500", "mb-1"], [1, "text-2xl", "font-bold", "text-white"], [1, "text-center", "py-12"], [1, "bg-red-500/20", "border", "border-red-500/50", "rounded-lg", "p-4"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-xl", "p-10", "text-center"], [1, "w-10", "h-10", "border-4", "border-emerald-400", "border-t-transparent", "rounded-full", "animate-spin", "mx-auto", "mb-4"], [1, "text-gray-400"], [1, "text-red-300"], ["type", "button", 1, "mt-3", "px-4", "py-2", "rounded-lg", "bg-slate-900", "text-white", 3, "click"], [1, "space-y-3", "mb-8"], [1, "bg-slate-900/80", "border", "border-slate-800", "rounded-2xl", "p-5"], [1, "flex", "items-center", "justify-center", "gap-2"], [1, "flex", "items-start", "justify-between", "gap-4"], [1, "min-w-0"], [1, "text-white", "font-semibold"], [1, "mt-2", "text-sm", "text-gray-400"], [1, "mt-2", "flex", "flex-wrap", "gap-2", "text-xs"], [1, "rounded-full", "border", "border-slate-700", "px-2", "py-1", "text-gray-300"], [1, "shrink-0"], ["type", "button", 1, "px-3", "py-2", "rounded-lg", "bg-slate-800", "text-gray-300", "disabled:opacity-50", 3, "click", "disabled"], [1, "px-3", "text-gray-300"]], template: function TransactionsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "main", 0)(1, "header", 1)(2, "div", 2)(3, "div", 3)(4, "button", 4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵdomListener("click", function TransactionsComponent_Template_button_click_4_listener() { return ctx.goBack(); });
            i0.ɵɵdomElementStart(6, "span", 5);
            i0.ɵɵtext(7, "\u2190");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(8, "div")(9, "h1", 6);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(12, "p", 7);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵdomElementEnd()()();
            i0.ɵɵdomElementStart(15, "div", 8)(16, "p", 7);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(19, "p", 9);
            i0.ɵɵtext(20);
            i0.ɵɵdomElementEnd()()();
            i0.ɵɵdomElementStart(21, "div", 10)(22, "div", 11)(23, "p", 12);
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(26, "p", 13);
            i0.ɵɵtext(27);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(28, "div", 11)(29, "p", 12);
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(32, "p", 13);
            i0.ɵɵtext(33);
            i0.ɵɵdomElementEnd()()()();
            i0.ɵɵconditionalCreate(34, TransactionsComponent_Conditional_34_Template, 5, 3, "div", 14)(35, TransactionsComponent_Conditional_35_Template, 6, 4, "div", 15)(36, TransactionsComponent_Conditional_36_Template, 4, 3, "div", 16)(37, TransactionsComponent_Conditional_37_Template, 4, 1);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("dir", ctx.languageService.direction());
            i0.ɵɵadvance(4);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 11, "wallet.backToProfile"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 13, "wallet.transactions.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 15, "wallet.platformCreditHelper"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 17, "wallet.summary.currentBalance"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.formatNumber(ctx.currentBalance()));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 19, "transactions.total"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.formatNumber(ctx.transactions().length));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 21, "transactions.pages"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.formatNumber(ctx.totalPages()));
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isLoading() ? 34 : ctx.errorMessage() ? 35 : !ctx.transactions().length ? 36 : 37);
        } }, dependencies: [CommonModule, TranslatePipe], encapsulation: 2, changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TransactionsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-transactions', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, TranslatePipe], template: "<main class=\"container mx-auto p-6 lg:p-8\" [attr.dir]=\"languageService.direction()\">\n  <header class=\"mb-8\">\n    <div class=\"flex items-center justify-between gap-4 mb-6\">\n      <div class=\"flex items-center gap-3\">\n        <button type=\"button\" (click)=\"goBack()\" class=\"p-2 hover:bg-slate-700 rounded-lg transition-colors\" [attr.aria-label]=\"'wallet.backToProfile' | translate\">\n          <span aria-hidden=\"true\">\u2190</span>\n        </button>\n        <div><h1 class=\"text-3xl font-bold text-white\">{{ 'wallet.transactions.title' | translate }}</h1><p class=\"text-sm text-gray-400\">{{ 'wallet.platformCreditHelper' | translate }}</p></div>\n      </div>\n      <div class=\"text-end\"><p class=\"text-sm text-gray-400\">{{ 'wallet.summary.currentBalance' | translate }}</p><p class=\"text-2xl font-bold text-emerald-400\">{{ formatNumber(currentBalance()) }}</p></div>\n    </div>\n    <div class=\"grid grid-cols-2 gap-4 max-w-md\">\n      <div class=\"bg-slate-900/80 border border-slate-800 rounded-2xl p-4\"><p class=\"text-xs text-gray-500 mb-1\">{{ 'transactions.total' | translate }}</p><p class=\"text-2xl font-bold text-white\">{{ formatNumber(transactions().length) }}</p></div>\n      <div class=\"bg-slate-900/80 border border-slate-800 rounded-2xl p-4\"><p class=\"text-xs text-gray-500 mb-1\">{{ 'transactions.pages' | translate }}</p><p class=\"text-2xl font-bold text-white\">{{ formatNumber(totalPages()) }}</p></div>\n    </div>\n  </header>\n\n  @if (isLoading()) {\n    <div class=\"text-center py-12\"><div class=\"w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4\"></div><p class=\"text-gray-400\">{{ 'wallet.loading' | translate }}</p></div>\n  } @else if (errorMessage()) {\n    <div class=\"bg-red-500/20 border border-red-500/50 rounded-lg p-4\"><p class=\"text-red-300\">{{ errorMessage() }}</p><button type=\"button\" (click)=\"loadTransactions()\" class=\"mt-3 px-4 py-2 rounded-lg bg-slate-900 text-white\">{{ 'wallet.retry' | translate }}</button></div>\n  } @else if (!transactions().length) {\n    <div class=\"bg-slate-900/80 border border-slate-800 rounded-xl p-10 text-center\"><p class=\"text-gray-400\">{{ 'wallet.transactions.empty' | translate }}</p></div>\n  } @else {\n    <section class=\"space-y-3 mb-8\">\n      @for (transaction of paginatedTransactions(); track transaction.id) {\n        <article class=\"bg-slate-900/80 border border-slate-800 rounded-2xl p-5\">\n          <div class=\"flex items-start justify-between gap-4\">\n            <div class=\"min-w-0\"><h2 class=\"text-white font-semibold\">{{ transactionTitle(transaction) }}</h2><p class=\"mt-2 text-sm text-gray-400\">{{ formatDate(transaction.createdAt) }}</p><div class=\"mt-2 flex flex-wrap gap-2 text-xs\"><span class=\"rounded-full border border-slate-700 px-2 py-1 text-gray-300\">{{ directionLabel(transaction.direction) }}</span><span class=\"rounded-full border border-slate-700 px-2 py-1 text-gray-300\">{{ referenceTypeLabel(transaction.referenceType) }}</span></div></div>\n            <strong class=\"shrink-0\" [class.text-emerald-400]=\"isCredit(transaction)\" [class.text-red-400]=\"!isCredit(transaction)\">{{ signedAmount(transaction) > 0 ? '+' : '' }}{{ formatNumber(signedAmount(transaction)) }}</strong>\n          </div>\n        </article>\n      }\n    </section>\n\n    @if (totalPages() > 1) {\n      <nav class=\"flex items-center justify-center gap-2\" [attr.aria-label]=\"'transactions.pages' | translate\">\n        <button type=\"button\" (click)=\"goToPage(currentPage() - 1)\" [disabled]=\"currentPage() === 1\" class=\"px-3 py-2 rounded-lg bg-slate-800 text-gray-300 disabled:opacity-50\">{{ 'wallet.pagination.previous' | translate }}</button>\n        <span class=\"px-3 text-gray-300\">{{ formatNumber(currentPage()) }} / {{ formatNumber(totalPages()) }}</span>\n        <button type=\"button\" (click)=\"goToPage(currentPage() + 1)\" [disabled]=\"currentPage() === totalPages()\" class=\"px-3 py-2 rounded-lg bg-slate-800 text-gray-300 disabled:opacity-50\">{{ 'wallet.pagination.next' | translate }}</button>\n      </nav>\n    }\n  }\n</main>\n", styles: ["/* Transactions component styles */\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TransactionsComponent, { className: "TransactionsComponent", filePath: "src/app/pages/admin/transactions/transactions.component.ts", lineNumber: 22 }); })();
