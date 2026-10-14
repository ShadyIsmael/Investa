import { Inject, Injectable, isDevMode } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class OpportunityService {
    constructor(http, apiBase) {
        this.http = http;
        this.apiBase = apiBase;
    }
    getPublicOpportunities(filters = {}) {
        return this.getList('/api/v1/public/opportunities', filters);
    }
    getPublicOpportunity(id) {
        return this.getOne(`/api/v1/public/opportunities/${encodeURIComponent(String(id))}`);
    }
    getPublicProjectActivity(id, page = 1, pageSize = 20) {
        return this.getOne(`/api/v1/public/opportunities/${encodeURIComponent(String(id))}/project-activity?page=${page}&pageSize=${pageSize}`);
    }
    getFavoriteOpportunities() {
        return this.getList('/api/v1/opportunities/favorites');
    }
    getFavoriteStatus(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/favorite`);
    }
    setFavorite(id, favorited) {
        return this.send('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}/favorite`, { favorited });
    }
    getViewerState(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/viewer-state`);
    }
    requestConversation(id) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/conversations`, {});
    }
    getMyOpportunities() {
        return this.getList('/api/v1/opportunities/my');
    }
    getMyParticipations() {
        return this.getList('/api/v1/opportunities/my-participations');
    }
    getFounderOpportunity(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}`);
    }
    getOpportunityRoom(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/room`);
    }
    createFundingDeclaration(id, participationId, payload) {
        const form = new FormData();
        form.append('amount', String(payload.amount));
        form.append('currencyCode', payload.currencyCode);
        form.append('receivedDate', payload.receivedDate);
        form.append('paymentMethod', payload.paymentMethod);
        if (payload.externalReference)
            form.append('externalReference', payload.externalReference);
        if (payload.notes)
            form.append('notes', payload.notes);
        if (payload.proofFile)
            form.append('proofFile', payload.proofFile, payload.proofFile.name);
        const headers = new HttpHeaders({ 'Idempotency-Key': `funding-declaration-${Date.now()}-${Math.random().toString(36).slice(2)}` });
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/funding-declarations/opportunities/${encodeURIComponent(String(id))}/participations/${encodeURIComponent(String(participationId))}`, form, { headers })).then(raw => this.extractData(raw, 'Failed to record funding declaration.'));
    }
    async downloadFundingProof(declarationId) {
        return firstValueFrom(this.http.get(`${this.apiBase}/api/v1/funding-declarations/${encodeURIComponent(String(declarationId))}/proof`, { headers: new HttpHeaders({ Accept: 'application/octet-stream' }), responseType: 'blob' }));
    }
    confirmFundingDeclaration(declarationId, comment) {
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/funding-declarations/${encodeURIComponent(String(declarationId))}/confirm`, comment?.trim() ? { comment: comment.trim() } : {})).then(raw => this.extractData(raw, 'Funding declaration could not be confirmed.'));
    }
    disputeFundingDeclaration(declarationId, reason) {
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/funding-declarations/${encodeURIComponent(String(declarationId))}/dispute`, { reason })).then(raw => this.extractData(raw, 'Funding declaration could not be disputed.'));
    }
    createLoanRepaymentDeclaration(opportunityId, obligationId, payload) {
        const form = new FormData();
        form.append('amount', String(payload.amount));
        form.append('currency', payload.currency);
        form.append('externalPaymentDate', payload.externalPaymentDate);
        if (payload.externalReference)
            form.append('externalReference', payload.externalReference);
        if (payload.installmentIds?.length)
            form.append('installmentIdsJson', JSON.stringify(payload.installmentIds));
        if (payload.proofFile)
            form.append('proofFile', payload.proofFile, payload.proofFile.name);
        const headers = new HttpHeaders({ 'Idempotency-Key': `loan-repayment-${Date.now()}-${Math.random().toString(36).slice(2)}` });
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/loan-repayments/opportunities/${encodeURIComponent(String(opportunityId))}/obligations/${encodeURIComponent(String(obligationId))}`, form, { headers })).then(raw => this.extractData(raw, 'Loan repayment could not be declared.'));
    }
    confirmLoanRepayment(declarationId, comment) {
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/loan-repayments/${encodeURIComponent(String(declarationId))}/confirm`, comment?.trim() ? { comment: comment.trim() } : {})).then(raw => this.extractData(raw, 'Loan repayment could not be confirmed.'));
    }
    disputeLoanRepayment(declarationId, reason) {
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/loan-repayments/${encodeURIComponent(String(declarationId))}/dispute`, { reason })).then(raw => this.extractData(raw, 'Loan repayment could not be disputed.'));
    }
    async downloadLoanRepaymentProof(declarationId) {
        return firstValueFrom(this.http.get(`${this.apiBase}/api/v1/loan-repayments/${encodeURIComponent(String(declarationId))}/proof`, { headers: new HttpHeaders({ Accept: 'application/octet-stream' }), responseType: 'blob' }));
    }
    transitionFunding(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/funding-status`, payload);
    }
    getObligationCompletion(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/obligations`);
    }
    initiateObligationCompletion(id) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/obligations/initiate`, {});
    }
    confirmObligationCompletion(id, participationId, statement, idempotencyKey) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/obligations/participations/${participationId}/confirm`, { statement, idempotencyKey, acknowledgeNoPaymentProof: true });
    }
    getApprovedInvestors(id) {
        return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/approved-investors`);
    }
    getOpportunityPayments(id) {
        return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/payments`);
    }
    getInvestorPaymentDetails(id, investorId) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/investors/${encodeURIComponent(investorId)}`);
    }
    recordPayment(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments`, payload);
    }
    reversePayment(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/reverse`, payload);
    }
    getMonthlyUnpaidPreview(id, year, month) {
        let path = `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/monthly-unpaid`;
        const params = [];
        if (year != null)
            params.push(`year=${encodeURIComponent(year)}`);
        if (month != null)
            params.push(`month=${encodeURIComponent(month)}`);
        if (params.length)
            path += '?' + params.join('&');
        return this.getOne(path);
    }
    bulkConfirmMonthlyPayments(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/payments/bulk-confirm-monthly`, payload);
    }
    createOpportunity(payload) {
        const request = this.toOpportunityRequest(payload);
        if (isDevMode())
            console.debug('[Opportunity Create] payload', request);
        return this.send('post', '/api/v1/opportunities', request);
    }
    updateOpportunity(id, payload) {
        const request = this.toOpportunityRequest(payload);
        if (isDevMode())
            console.debug('[Opportunity Update] payload', request);
        return this.send('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}`, request);
    }
    publishOpportunity(id) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/publish`, {});
    }
    getMedia(id) {
        return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/media`);
    }
    getDocuments(id) {
        return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/documents`);
    }
    getEvents(id) {
        return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(id))}/events`);
    }
    createMedia(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/media`, payload);
    }
    createDocument(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/documents`, payload);
    }
    createEvent(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/events`, payload);
    }
    completeMilestone(id, milestoneId) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/milestones/${encodeURIComponent(String(milestoneId))}/complete`, {});
    }
    getTags() {
        return this.getList('/api/v1/lookups/opportunity-tags');
    }
    label(value) {
        if (value === null || value === undefined)
            return '-';
        if (typeof value === 'string' || typeof value === 'number')
            return String(value);
        return value.name || value.nameEn || value.nameAr || value.value || value.label || value.key || String(value.id);
    }
    async getList(path, filters = {}) {
        const raw = await firstValueFrom(this.http.get(`${this.apiBase}${path}`, { headers: this.authHeaders(), params: this.toParams(filters) }));
        const data = this.extractData(raw, 'Failed to load data.');
        return Array.isArray(data) ? data : data?.items ?? [];
    }
    async getOne(path) {
        const raw = await firstValueFrom(this.http.get(`${this.apiBase}${path}`, { headers: this.authHeaders() }));
        return this.extractData(raw, 'Failed to load data.');
    }
    async send(method, path, payload) {
        const request = method === 'post' ? this.http.post : this.http.put;
        const raw = await firstValueFrom(request.call(this.http, `${this.apiBase}${path}`, payload, { headers: this.authHeaders() }));
        return this.extractData(raw, 'Request failed.');
    }
    extractData(raw, fallbackMessage) {
        if (!raw)
            throw new Error(fallbackMessage);
        const wrapped = raw;
        if (wrapped.data !== undefined) {
            if (wrapped.success === false)
                throw new Error(wrapped.message || fallbackMessage);
            return wrapped.data;
        }
        return raw;
    }
    toParams(filters) {
        let params = new HttpParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))
                return;
            if (Array.isArray(value)) {
                value.forEach(item => params = params.append(key, String(item)));
            }
            else {
                params = params.set(key, String(value));
            }
        });
        return params;
    }
    toOpportunityRequest(payload) {
        return {
            projectId: payload.projectId ?? null,
            type: payload.type ?? null,
            title: payload.title,
            description: payload.fullDescription ?? null,
            shortDescription: payload.shortDescription,
            useOfFunds: payload.useOfFunds ?? null,
            fundingTarget: payload.fundingTarget,
            fundingGoalId: payload.fundingGoalId ?? null,
            fundingCurrency: payload.fundingCurrency ?? null,
            tagIds: (payload.tagIds ?? []).map(value => Number(value)).filter(value => Number.isFinite(value)),
            projectStage: this.toNumberOrNull(payload.projectStage),
            projectStageCustomName: payload.projectStageCustomName?.trim() || null,
            coverImageUrl: payload.coverImageUrl ?? null
        };
    }
    toNumberOrNull(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    authHeaders() {
        // Authorization is attached and refreshed centrally by AuthInterceptor.
        // Avoid copying a possibly expired token into this service's request options.
        return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    static { this.ɵfac = function OpportunityService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OpportunityService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: OpportunityService, factory: OpportunityService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OpportunityService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
