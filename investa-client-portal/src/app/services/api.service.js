import { Injectable, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./auth.service";
export class ApiService {
    constructor(http, authService, apiBase) {
        this.http = http;
        this.authService = authService;
        this.apiBase = apiBase;
    }
    getHeaders() {
        const token = this.authService.getAccessToken();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (token)
            headers = headers.set('Authorization', `Bearer ${token}`);
        return headers;
    }
    unwrap(response, fallbackError) {
        if (!response)
            return null;
        if (!response.success)
            throw new Error(response.message || fallbackError);
        return response.data;
    }
    async getBusinessCategories() {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/lookups/business-categories`, {
            headers: this.getHeaders()
        }));
        return this.unwrap(response, 'Failed to fetch business categories') ?? [];
    }
    async getOpportunityCategories() {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/lookups/opportunity-categories`, {
            headers: this.getHeaders()
        }));
        return this.unwrap(response, 'Failed to fetch opportunity categories') ?? [];
    }
    async getOpportunityTags() {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/lookups/opportunity-tags`, {
            headers: this.getHeaders()
        }));
        return this.unwrap(response, 'Failed to fetch opportunity tags') ?? [];
    }
    async getFundingGoals() {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/lookups/funding-goals`, {
            headers: this.getHeaders()
        }));
        return this.unwrap(response, 'Failed to fetch funding goals') ?? [];
    }
    async getBusinessStages() {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/lookups/business-stages`, {
            headers: this.getHeaders()
        }));
        return this.unwrap(response, 'Failed to fetch business stages') ?? [];
    }
    async getProjectPhases() {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/lookups/project-phases`, {
            headers: this.getHeaders()
        }));
        return this.unwrap(response, 'Failed to fetch project phases') ?? [];
    }
    async searchUsersByPhone(phoneQuery) {
        const url = `${this.apiBase}/api/clients/by-phone/${encodeURIComponent(phoneQuery)}`;
        try {
            const response = await firstValueFrom(this.http.get(url, { headers: this.getHeaders() }));
            if (response?.success) {
                if (Array.isArray(response.data))
                    return { results: response.data, available: true };
                if (response.data)
                    return { results: [response.data], available: true };
            }
            return { results: [], available: true };
        }
        catch (err) {
            if (err?.status === 404)
                return { results: [], available: true };
            console.warn('User search failed for', url, err?.message || err);
            return { results: [], available: false };
        }
    }
    static { this.ɵfac = function ApiService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ApiService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i2.AuthService), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ApiService, factory: ApiService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ApiService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [{ type: i1.HttpClient }, { type: i2.AuthService }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
