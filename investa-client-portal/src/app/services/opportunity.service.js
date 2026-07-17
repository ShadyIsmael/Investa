import { Inject, Injectable } from '@angular/core';
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
    getViewerState(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/viewer-state`);
    }
    requestConversation(id) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/conversations`, {});
    }
    getParticipationForm(id) {
        return this.getOne(`/api/v1/opportunities/${encodeURIComponent(String(id))}/participation-form`);
    }
    createJoinRequest(id, payload) {
        return this.send('post', `/api/v1/opportunities/${encodeURIComponent(String(id))}/join-requests`, payload);
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
    createOpportunity(payload) {
        return this.send('post', '/api/v1/opportunities', this.toOpportunityRequest(payload));
    }
    updateOpportunity(id, payload) {
        return this.send('put', `/api/v1/opportunities/${encodeURIComponent(String(id))}`, this.toOpportunityRequest(payload));
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
    getCategories() {
        return this.getList('/api/v1/lookups/opportunity-categories');
    }
    getTags() {
        return this.getList('/api/v1/lookups/opportunity-tags');
    }
    getFundingGoals() {
        return this.getList('/api/v1/lookups/funding-goals');
    }
    label(value) {
        if (value === null || value === undefined)
            return '-';
        if (typeof value === 'string' || typeof value === 'number')
            return String(value);
        return value.name || value.value || value.label || value.key || String(value.id);
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
            title: payload.title,
            description: payload.fullDescription ?? null,
            shortDescription: payload.shortDescription,
            useOfFunds: payload.useOfFunds ?? payload.fundingUsage ?? null,
            fundingTarget: payload.fundingTarget,
            categoryId: payload.categoryId ?? null,
            fundingGoalId: payload.fundingGoalId ?? null,
            minimumInvestmentAmount: payload.minimumInvestmentAmount ?? payload.minimumInvestment ?? null,
            maximumInvestmentAmount: payload.maximumInvestmentAmount ?? payload.maximumInvestment ?? null,
            expectedDurationMonths: payload.expectedDurationMonths ?? payload.expectedDuration ?? null,
            profitSharePercentage: payload.profitSharePercentage ?? null,
            profitSharingPayoutFrequency: payload.profitSharingPayoutFrequency ?? null,
            profitSharingContractStartDate: payload.profitSharingContractStartDate ?? null,
            profitSharingContractEndDate: payload.profitSharingContractEndDate ?? null,
            equityOfferedPercentage: payload.equityOfferedPercentage ?? null,
            interestRate: payload.interestRate ?? null,
            repaymentFrequency: payload.repaymentFrequency ?? null,
            finalRepaymentDate: payload.finalRepaymentDate ?? null,
            tagIds: (payload.tagIds ?? []).map(value => Number(value)).filter(value => Number.isFinite(value)),
            investmentModel: this.toNumberOrNull(payload.investmentModel),
            projectStage: this.toNumberOrNull(payload.projectStage),
            coverImageUrl: payload.coverImageUrl ?? null
        };
    }
    toNumberOrNull(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    authHeaders() {
        const token = localStorage.getItem('accessToken');
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }) : new HttpHeaders({ 'Content-Type': 'application/json' });
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
