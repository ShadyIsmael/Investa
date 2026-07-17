import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { API_BASE } from '../../../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function CreditChargeComponent_div_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 31)(1, "div", 32);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 33);
    i0.ɵɵelement(3, "path", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.errorMessage());
} }
function CreditChargeComponent_div_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 36);
    i0.ɵɵelement(2, "circle", 37)(3, "path", 38);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "p", 39);
    i0.ɵɵtext(5, "Loading plans...");
    i0.ɵɵelementEnd()();
} }
function CreditChargeComponent_div_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 40);
    i0.ɵɵelement(2, "path", 41);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 42);
    i0.ɵɵtext(4, "No plans available at the moment. Please check back later.");
    i0.ɵɵelementEnd()();
} }
function CreditChargeComponent_div_27_div_1_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 58);
    i0.ɵɵelement(2, "path", 59);
    i0.ɵɵelementEnd()();
} }
function CreditChargeComponent_div_27_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 45);
    i0.ɵɵlistener("click", function CreditChargeComponent_div_27_div_1_Template_div_click_0_listener() { const plan_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.selectPlan(plan_r3.id)); });
    i0.ɵɵtemplate(1, CreditChargeComponent_div_27_div_1_div_1_Template, 3, 0, "div", 46);
    i0.ɵɵelementStart(2, "span", 47);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h3", 48);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 49)(7, "span", 50);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 51);
    i0.ɵɵtext(10, "EGP");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 52);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(12, "svg", 53);
    i0.ɵɵelement(13, "path", 54);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(14, "span", 55);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "p", 56);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const plan_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassMap("relative cursor-pointer rounded-xl p-6 border-2 transition-all hover:shadow-lg " + (ctx_r0.selectedPlanId() === plan_r3.id ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r0.selectedPlanId() === plan_r3.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.BILLING_LABELS[plan_r3.billingPeriod], " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(plan_r3.name);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(ctx_r0.selectedPlanId() === plan_r3.id ? "text-blue-400" : "text-white");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", plan_r3.price.toLocaleString(), " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("", plan_r3.credits.toLocaleString(), " Credits");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", (plan_r3.price / plan_r3.credits).toFixed(2), " EGP / credit");
} }
function CreditChargeComponent_div_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43);
    i0.ɵɵtemplate(1, CreditChargeComponent_div_27_div_1_Template, 18, 10, "div", 44);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r0.adminPlans());
} }
function CreditChargeComponent_div_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 60);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 61);
    i0.ɵɵelement(2, "path", 62);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "p", 63);
    i0.ɵɵtext(4, "Select a plan to continue");
    i0.ɵɵelementEnd()();
} }
function CreditChargeComponent_div_33_span_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Purchase Now");
    i0.ɵɵelementEnd();
} }
function CreditChargeComponent_div_33_span_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 72);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 73);
    i0.ɵɵelement(2, "circle", 37)(3, "path", 38);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, " Processing... ");
    i0.ɵɵelementEnd();
} }
function CreditChargeComponent_div_33_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 64)(1, "div", 65)(2, "span", 42);
    i0.ɵɵtext(3, "Plan:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 66);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 65)(7, "span", 42);
    i0.ɵɵtext(8, "Credits:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 66);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 65)(12, "span", 42);
    i0.ɵɵtext(13, "Billing:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "span", 66);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 67)(17, "span", 66);
    i0.ɵɵtext(18, "Total:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 68);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "button", 69);
    i0.ɵɵlistener("click", function CreditChargeComponent_div_33_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.purchasePackage()); });
    i0.ɵɵtemplate(22, CreditChargeComponent_div_33_span_22_Template, 2, 0, "span", 70)(23, CreditChargeComponent_div_33_span_23_Template, 5, 0, "span", 71);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.selectedPlan().name);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.selectedPlan().credits.toLocaleString());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.BILLING_LABELS[ctx_r0.selectedPlan().billingPeriod]);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("", ctx_r0.selectedPlan().price.toLocaleString(), " EGP");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.isLoading());
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", !ctx_r0.isLoading());
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r0.isLoading());
} }
function CreditChargeComponent_div_47_div_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 84)(1, "p", 85);
    i0.ɵɵtext(2, "Reference Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 86);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.referenceNumber());
} }
function CreditChargeComponent_div_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74)(1, "div", 75)(2, "div", 76)(3, "div", 77);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(4, "svg", 78);
    i0.ɵɵelement(5, "path", 79);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "h3", 80);
    i0.ɵɵtext(7, "Purchase Successful!");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 81);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(11, CreditChargeComponent_div_47_div_11_Template, 5, 1, "div", 82);
    i0.ɵɵelementStart(12, "p", 83);
    i0.ɵɵtext(13, "Redirecting to your profile\u2026");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(10, 2, ctx_r0.purchasedCredits()), " credits have been added to your account.");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r0.referenceNumber());
} }
export class CreditChargeComponent {
    constructor() {
        this.router = inject(Router);
        this.userService = inject(UserService);
        this.authService = inject(AuthService);
        this.http = inject(HttpClient);
        this.apiBase = inject(API_BASE);
        // State
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.selectedPlanId = signal(null, ...(ngDevMode ? [{ debugName: "selectedPlanId" }] : []));
        this.showSuccessDialog = signal(false, ...(ngDevMode ? [{ debugName: "showSuccessDialog" }] : []));
        this.plansLoading = signal(true, ...(ngDevMode ? [{ debugName: "plansLoading" }] : []));
        this.referenceNumber = signal(null, ...(ngDevMode ? [{ debugName: "referenceNumber" }] : []));
        this.purchasedCredits = signal(0, ...(ngDevMode ? [{ debugName: "purchasedCredits" }] : []));
        // Current credits from UserService
        this.currentCredits = this.userService.credits;
        // Admin-created plans from API
        this.adminPlans = signal([], ...(ngDevMode ? [{ debugName: "adminPlans" }] : []));
        this.BILLING_LABELS = {
            'monthly': 'Monthly',
            'yearly': 'Yearly',
            'one-time': 'One-Time',
        };
        // Computed values
        this.selectedPlan = computed(() => {
            const id = this.selectedPlanId();
            if (id === null)
                return null;
            return this.adminPlans().find(p => p.id === id) ?? null;
        }, ...(ngDevMode ? [{ debugName: "selectedPlan" }] : []));
    }
    ngOnInit() {
        this.loadPlans();
    }
    async loadPlans() {
        try {
            this.plansLoading.set(true);
            const token = this.authService.getAccessToken();
            const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
            const plans = await firstValueFrom(this.http.get(`${this.apiBase}/api/credit-plans`, { headers }));
            this.adminPlans.set(plans ?? []);
        }
        catch (e) {
            this.errorMessage.set('Could not load credit plans. Please try again later.');
            console.error('Failed to load credit plans:', e);
        }
        finally {
            this.plansLoading.set(false);
        }
    }
    selectPlan(id) {
        this.selectedPlanId.set(id);
    }
    async purchasePackage() {
        const plan = this.selectedPlan();
        if (!plan)
            return;
        await this.processPurchase(plan.credits, plan.price);
    }
    async processPurchase(credits, price) {
        const plan = this.selectedPlan();
        if (!plan)
            return;
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            const token = this.authService.getAccessToken();
            const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
            const result = await firstValueFrom(this.http.post(`${this.apiBase}/api/credit-plans/${plan.id}/purchase`, {}, { headers }));
            // Update credits from server-returned balance
            this.userService.setCredits(result.newBalance);
            this.referenceNumber.set(result.referenceNumber);
            this.purchasedCredits.set(result.creditsAdded);
            // Show success dialog
            this.showSuccessDialog.set(true);
            // Navigate back after 4 seconds
            setTimeout(() => {
                this.showSuccessDialog.set(false);
                this.router.navigate(['/admin/profile']);
            }, 4000);
        }
        catch (e) {
            this.errorMessage.set('Purchase failed. Please try again.');
            console.error('Purchase error:', e);
        }
        finally {
            this.isLoading.set(false);
        }
    }
    goBack() {
        this.router.navigate(['/admin/profile']);
    }
    static { this.ɵfac = function CreditChargeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CreditChargeComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CreditChargeComponent, selectors: [["app-credit-charge"]], decls: 48, vars: 8, consts: [[1, "container", "mx-auto", "p-6", "lg:p-8", "max-w-6xl"], [1, "flex", "items-center", "justify-between", "mb-8"], [1, "text-gray-400", "hover:text-white", "mb-4", "flex", "items-center", "gap-2", "transition-colors", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 19l-7-7m0 0l7-7m-7 7h18"], [1, "text-3xl", "font-bold", "text-white"], [1, "text-gray-400", "mt-2"], [1, "bg-slate-800/50", "rounded-xl", "p-4", "text-center"], [1, "text-sm", "text-gray-400"], [1, "text-3xl", "font-bold", "text-blue-400", "mt-1"], [1, "text-xs", "text-gray-500", "mt-1"], ["class", "mb-6 p-4 rounded-lg bg-red-800/20 border border-red-800 text-red-300", 4, "ngIf"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-8"], [1, "lg:col-span-2"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-6"], [1, "text-xl", "font-bold", "text-white", "mb-6"], ["class", "text-center py-12", 4, "ngIf"], ["class", "grid grid-cols-1 md:grid-cols-2 gap-4", 4, "ngIf"], [1, "lg:col-span-1"], [1, "bg-slate-900/80", "backdrop-blur-sm", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-6", "sticky", "top-8"], ["class", "text-center py-8", 4, "ngIf"], ["class", "space-y-4", 4, "ngIf"], [1, "mt-8", "pt-6", "border-t", "border-slate-800"], [1, "text-xs", "text-gray-500", "mb-4", "text-center"], [1, "flex", "items-center", "justify-center", "gap-4"], [1, "bg-white", "rounded", "px-2", "py-1"], [1, "text-blue-600", "font-bold", "text-sm"], [1, "text-orange-600", "font-bold", "text-sm"], [1, "bg-blue-600", "rounded", "px-2", "py-1"], [1, "text-white", "font-bold", "text-sm"], ["class", "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", 4, "ngIf"], [1, "mb-6", "p-4", "rounded-lg", "bg-red-800/20", "border", "border-red-800", "text-red-300"], [1, "flex", "items-start", "gap-3"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "flex-shrink-0", "mt-0.5"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", "clip-rule", "evenodd"], [1, "text-center", "py-12"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "w-8", "h-8", "mx-auto", "text-blue-400"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", 1, "opacity-75"], [1, "text-gray-400", "mt-3"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-14", "h-14", "mx-auto", "mb-4", "text-gray-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"], [1, "text-gray-400"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-4"], [3, "class", "click", 4, "ngFor", "ngForOf"], [3, "click"], ["class", "absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center", 4, "ngIf"], [1, "inline-block", "mb-4", "px-2", "py-0.5", "rounded-full", "text-[11px]", "font-bold", "uppercase", "tracking-wider", "bg-slate-700", "text-gray-300"], [1, "text-lg", "font-bold", "text-white", "mb-1"], [1, "flex", "items-end", "gap-1", "mt-3", "mb-3"], [1, "text-3xl", "font-black"], [1, "text-gray-400", "mb-1", "text-sm"], [1, "flex", "items-center", "gap-2", "px-3", "py-2", "bg-slate-700/50", "rounded-lg"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-blue-400", "flex-shrink-0"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-sm", "font-semibold", "text-gray-200"], [1, "text-xs", "text-gray-500", "mt-2"], [1, "absolute", "top-3", "right-3", "w-6", "h-6", "bg-blue-500", "rounded-full", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M5 13l4 4L19 7"], [1, "text-center", "py-8"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "mx-auto", "mb-4", "text-gray-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"], [1, "text-gray-400", "text-sm"], [1, "space-y-4"], [1, "flex", "items-center", "justify-between", "py-3", "border-b", "border-slate-700"], [1, "text-white", "font-semibold"], [1, "flex", "items-center", "justify-between", "py-3", "text-lg"], [1, "text-blue-400", "font-bold", "text-2xl"], ["type", "button", 1, "w-full", "bg-gradient-to-r", "from-blue-500", "to-purple-600", "text-white", "font-semibold", "py-3", "px-6", "rounded-lg", "hover:opacity-90", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-all", "mt-6", 3, "click", "disabled"], [4, "ngIf"], ["class", "flex items-center justify-center gap-2", 4, "ngIf"], [1, "flex", "items-center", "justify-center", "gap-2"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "h-5", "w-5", "text-white"], [1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "p-4", "bg-black/60", "backdrop-blur-sm"], [1, "bg-slate-900", "border", "border-slate-800", "rounded-xl", "shadow-2xl", "p-8", "max-w-md", "w-full", "animate-fade-in"], [1, "text-center"], [1, "w-20", "h-20", "mx-auto", "mb-4", "bg-green-500/20", "rounded-full", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-12", "h-12", "text-green-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M5 13l4 4L19 7"], [1, "text-2xl", "font-bold", "text-white", "mb-2"], [1, "text-gray-400", "mb-4"], ["class", "mt-4 bg-slate-800 rounded-lg px-4 py-3", 4, "ngIf"], [1, "text-xs", "text-gray-500", "mt-4"], [1, "mt-4", "bg-slate-800", "rounded-lg", "px-4", "py-3"], [1, "text-xs", "text-gray-500", "mb-1"], [1, "text-blue-400", "font-mono", "font-semibold", "tracking-wider"]], template: function CreditChargeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "button", 2);
            i0.ɵɵlistener("click", function CreditChargeComponent_Template_button_click_3_listener() { return ctx.goBack(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(4, "svg", 3);
            i0.ɵɵelement(5, "path", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(6, "span");
            i0.ɵɵtext(7, "Back");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "h1", 5);
            i0.ɵɵtext(9, "Charge Credits");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "p", 6);
            i0.ɵɵtext(11, "Purchase credits to unlock investment opportunities and features");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "div", 7)(13, "p", 8);
            i0.ɵɵtext(14, "Current Balance");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "p", 9);
            i0.ɵɵtext(16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "p", 10);
            i0.ɵɵtext(18, "Credits");
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(19, CreditChargeComponent_div_19_Template, 6, 1, "div", 11);
            i0.ɵɵelementStart(20, "div", 12)(21, "div", 13)(22, "div", 14)(23, "h2", 15);
            i0.ɵɵtext(24, "Select a Plan");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(25, CreditChargeComponent_div_25_Template, 6, 0, "div", 16)(26, CreditChargeComponent_div_26_Template, 5, 0, "div", 16)(27, CreditChargeComponent_div_27_Template, 2, 1, "div", 17);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(28, "div", 18)(29, "div", 19)(30, "h2", 15);
            i0.ɵɵtext(31, "Order Summary");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(32, CreditChargeComponent_div_32_Template, 5, 0, "div", 20)(33, CreditChargeComponent_div_33_Template, 24, 7, "div", 21);
            i0.ɵɵelementStart(34, "div", 22)(35, "p", 23);
            i0.ɵɵtext(36, "Secure Payment");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "div", 24)(38, "div", 25)(39, "span", 26);
            i0.ɵɵtext(40, "VISA");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(41, "div", 25)(42, "span", 27);
            i0.ɵɵtext(43, "Mastercard");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(44, "div", 28)(45, "span", 29);
            i0.ɵɵtext(46, "PayPal");
            i0.ɵɵelementEnd()()()()()()();
            i0.ɵɵtemplate(47, CreditChargeComponent_div_47_Template, 14, 4, "div", 30);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(16);
            i0.ɵɵtextInterpolate(ctx.currentCredits());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.errorMessage());
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("ngIf", ctx.plansLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", !ctx.plansLoading() && ctx.adminPlans().length === 0);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", !ctx.plansLoading());
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngIf", ctx.selectedPlan() === null);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.selectedPlan());
            i0.ɵɵadvance(14);
            i0.ɵɵproperty("ngIf", ctx.showSuccessDialog());
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, i1.DecimalPipe], styles: ["@keyframes _ngcontent-%COMP%_fade-in {\r\n  from {\r\n    opacity: 0;\r\n    transform: translateY(-10px);\r\n  }\r\n  to {\r\n    opacity: 1;\r\n    transform: translateY(0);\r\n  }\r\n}\r\n\r\n.animate-fade-in[_ngcontent-%COMP%] {\r\n  animation: _ngcontent-%COMP%_fade-in 0.3s ease-out;\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Package[_ngcontent-%COMP%]   card[_ngcontent-%COMP%]   hover[_ngcontent-%COMP%]   effects\r\n.package-card[_ngcontent-%COMP%] {\r\n  transition: all 0.3s ease;\r\n  \r\n  &:hover {\r\n    transform: translateY(-4px);\r\n  }\r\n}\r\n\r\n//[_ngcontent-%COMP%]   Custom[_ngcontent-%COMP%]   number[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]   styling\r\ninput[type=\"number\"][_ngcontent-%COMP%]::-webkit-inner-spin-button, \r\ninput[type=\"number\"][_ngcontent-%COMP%]::-webkit-outer-spin-button {\r\n  opacity: 1;\r\n}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CreditChargeComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-credit-charge', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule], template: "<div class=\"container mx-auto p-6 lg:p-8 max-w-6xl\">\r\n  <!-- Header -->\r\n  <div class=\"flex items-center justify-between mb-8\">\r\n    <div>\r\n      <button (click)=\"goBack()\" class=\"text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors\">\r\n        <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n          <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 19l-7-7m0 0l7-7m-7 7h18\"/>\r\n        </svg>\r\n        <span>Back</span>\r\n      </button>\r\n      <h1 class=\"text-3xl font-bold text-white\">Charge Credits</h1>\r\n      <p class=\"text-gray-400 mt-2\">Purchase credits to unlock investment opportunities and features</p>\r\n    </div>\r\n    <div class=\"bg-slate-800/50 rounded-xl p-4 text-center\">\r\n      <p class=\"text-sm text-gray-400\">Current Balance</p>\r\n      <p class=\"text-3xl font-bold text-blue-400 mt-1\">{{ currentCredits() }}</p>\r\n      <p class=\"text-xs text-gray-500 mt-1\">Credits</p>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- Error Message -->\r\n  <div *ngIf=\"errorMessage()\" class=\"mb-6 p-4 rounded-lg bg-red-800/20 border border-red-800 text-red-300\">\r\n    <div class=\"flex items-start gap-3\">\r\n      <svg class=\"w-5 h-5 flex-shrink-0 mt-0.5\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\r\n        <path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\"/>\r\n      </svg>\r\n      <p>{{ errorMessage() }}</p>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">\r\n    <!-- Left Column: Admin Credit Plans -->\r\n    <div class=\"lg:col-span-2\">\r\n      <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6\">\r\n        <h2 class=\"text-xl font-bold text-white mb-6\">Select a Plan</h2>\r\n\r\n        <!-- No plans available -->\r\n        <div *ngIf=\"plansLoading()\" class=\"text-center py-12\">\r\n          <svg class=\"animate-spin w-8 h-8 mx-auto text-blue-400\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\">\r\n            <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\r\n            <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\r\n          </svg>\r\n          <p class=\"text-gray-400 mt-3\">Loading plans...</p>\r\n        </div>\r\n\r\n        <div *ngIf=\"!plansLoading() && adminPlans().length === 0\" class=\"text-center py-12\">\r\n          <svg class=\"w-14 h-14 mx-auto mb-4 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z\"/>\r\n          </svg>\r\n          <p class=\"text-gray-400\">No plans available at the moment. Please check back later.</p>\r\n        </div>\r\n\r\n        <div *ngIf=\"!plansLoading()\" class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\r\n          <div *ngFor=\"let plan of adminPlans()\"\r\n               (click)=\"selectPlan(plan.id)\"\r\n               [class]=\"'relative cursor-pointer rounded-xl p-6 border-2 transition-all hover:shadow-lg ' +\r\n                        (selectedPlanId() === plan.id\r\n                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'\r\n                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600')\">\r\n\r\n            <!-- Selected indicator -->\r\n            <div *ngIf=\"selectedPlanId() === plan.id\"\r\n                 class=\"absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center\">\r\n              <svg class=\"w-3.5 h-3.5 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3\" d=\"M5 13l4 4L19 7\"/>\r\n              </svg>\r\n            </div>\r\n\r\n            <!-- Billing period badge -->\r\n            <span class=\"inline-block mb-4 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-700 text-gray-300\">\r\n              {{ BILLING_LABELS[plan.billingPeriod] }}\r\n            </span>\r\n\r\n            <h3 class=\"text-lg font-bold text-white mb-1\">{{ plan.name }}</h3>\r\n\r\n            <div class=\"flex items-end gap-1 mt-3 mb-3\">\r\n              <span class=\"text-3xl font-black\" [class]=\"selectedPlanId() === plan.id ? 'text-blue-400' : 'text-white'\">\r\n                {{ plan.price.toLocaleString() }}\r\n              </span>\r\n              <span class=\"text-gray-400 mb-1 text-sm\">EGP</span>\r\n            </div>\r\n\r\n            <div class=\"flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg\">\r\n              <svg class=\"w-4 h-4 text-blue-400 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"/>\r\n              </svg>\r\n              <span class=\"text-sm font-semibold text-gray-200\">{{ plan.credits.toLocaleString() }} Credits</span>\r\n            </div>\r\n\r\n            <p class=\"text-xs text-gray-500 mt-2\">{{ (plan.price / plan.credits).toFixed(2) }} EGP / credit</p>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Right Column: Summary & Purchase -->\r\n    <div class=\"lg:col-span-1\">\r\n      <div class=\"bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6 sticky top-8\">\r\n        <h2 class=\"text-xl font-bold text-white mb-6\">Order Summary</h2>\r\n\r\n        <div *ngIf=\"selectedPlan() === null\" class=\"text-center py-8\">\r\n          <svg class=\"w-16 h-16 mx-auto mb-4 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2\"/>\r\n          </svg>\r\n          <p class=\"text-gray-400 text-sm\">Select a plan to continue</p>\r\n        </div>\r\n\r\n        <div *ngIf=\"selectedPlan()\" class=\"space-y-4\">\r\n          <div class=\"flex items-center justify-between py-3 border-b border-slate-700\">\r\n            <span class=\"text-gray-400\">Plan:</span>\r\n            <span class=\"text-white font-semibold\">{{ selectedPlan()!.name }}</span>\r\n          </div>\r\n          <div class=\"flex items-center justify-between py-3 border-b border-slate-700\">\r\n            <span class=\"text-gray-400\">Credits:</span>\r\n            <span class=\"text-white font-semibold\">{{ selectedPlan()!.credits.toLocaleString() }}</span>\r\n          </div>\r\n          <div class=\"flex items-center justify-between py-3 border-b border-slate-700\">\r\n            <span class=\"text-gray-400\">Billing:</span>\r\n            <span class=\"text-white font-semibold\">{{ BILLING_LABELS[selectedPlan()!.billingPeriod] }}</span>\r\n          </div>\r\n          <div class=\"flex items-center justify-between py-3 text-lg\">\r\n            <span class=\"text-white font-semibold\">Total:</span>\r\n            <span class=\"text-blue-400 font-bold text-2xl\">{{ selectedPlan()!.price.toLocaleString() }} EGP</span>\r\n          </div>\r\n\r\n          <button\r\n            type=\"button\"\r\n            (click)=\"purchasePackage()\"\r\n            [disabled]=\"isLoading()\"\r\n            class=\"w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6\">\r\n            <span *ngIf=\"!isLoading()\">Purchase Now</span>\r\n            <span *ngIf=\"isLoading()\" class=\"flex items-center justify-center gap-2\">\r\n              <svg class=\"animate-spin h-5 w-5 text-white\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\">\r\n                <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>\r\n                <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\r\n              </svg>\r\n              Processing...\r\n            </span>\r\n          </button>\r\n        </div>\r\n\r\n        <!-- Payment Methods -->\r\n        <div class=\"mt-8 pt-6 border-t border-slate-800\">\r\n          <p class=\"text-xs text-gray-500 mb-4 text-center\">Secure Payment</p>\r\n          <div class=\"flex items-center justify-center gap-4\">\r\n            <div class=\"bg-white rounded px-2 py-1\">\r\n              <span class=\"text-blue-600 font-bold text-sm\">VISA</span>\r\n            </div>\r\n            <div class=\"bg-white rounded px-2 py-1\">\r\n              <span class=\"text-orange-600 font-bold text-sm\">Mastercard</span>\r\n            </div>\r\n            <div class=\"bg-blue-600 rounded px-2 py-1\">\r\n              <span class=\"text-white font-bold text-sm\">PayPal</span>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- Success Dialog -->\r\n  <div *ngIf=\"showSuccessDialog()\" class=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm\">\r\n    <div class=\"bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full animate-fade-in\">\r\n      <div class=\"text-center\">\r\n        <div class=\"w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center\">\r\n          <svg class=\"w-12 h-12 text-green-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\r\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"/>\r\n          </svg>\r\n        </div>\r\n        <h3 class=\"text-2xl font-bold text-white mb-2\">Purchase Successful!</h3>\r\n        <p class=\"text-gray-400 mb-4\">{{ purchasedCredits() | number }} credits have been added to your account.</p>\r\n        <div *ngIf=\"referenceNumber()\" class=\"mt-4 bg-slate-800 rounded-lg px-4 py-3\">\r\n          <p class=\"text-xs text-gray-500 mb-1\">Reference Number</p>\r\n          <p class=\"text-blue-400 font-mono font-semibold tracking-wider\">{{ referenceNumber() }}</p>\r\n        </div>\r\n        <p class=\"text-xs text-gray-500 mt-4\">Redirecting to your profile\u2026</p>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n", styles: ["@keyframes fade-in {\r\n  from {\r\n    opacity: 0;\r\n    transform: translateY(-10px);\r\n  }\r\n  to {\r\n    opacity: 1;\r\n    transform: translateY(0);\r\n  }\r\n}\r\n\r\n.animate-fade-in {\r\n  animation: fade-in 0.3s ease-out;\r\n}\r\n\r\n// Package card hover effects\r\n.package-card {\r\n  transition: all 0.3s ease;\r\n  \r\n  &:hover {\r\n    transform: translateY(-4px);\r\n  }\r\n}\r\n\r\n// Custom number input styling\r\ninput[type=\"number\"]::-webkit-inner-spin-button,\r\ninput[type=\"number\"]::-webkit-outer-spin-button {\r\n  opacity: 1;\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CreditChargeComponent, { className: "CreditChargeComponent", filePath: "src/app/pages/admin/credit-charge/credit-charge.component.ts", lineNumber: 29 }); })();
