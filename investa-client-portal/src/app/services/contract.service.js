import { Inject, Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class ContractService {
    constructor(http, apiBase) {
        this.http = http;
        this.apiBase = apiBase;
    }
    getOpportunityContracts(opportunityId) {
        return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/contracts`);
    }
    getContract(contractId) {
        return this.getOne(`/api/v1/contracts/${encodeURIComponent(String(contractId))}`);
    }
    getVersion(contractId, versionNumber) {
        return this.getOne(`/api/v1/contracts/${encodeURIComponent(String(contractId))}/versions/${encodeURIComponent(String(versionNumber))}`);
    }
    getPreviewHtml(contractId, versionNumber) {
        return firstValueFrom(this.http.get(`${this.apiBase}/api/v1/contracts/${encodeURIComponent(String(contractId))}/versions/${encodeURIComponent(String(versionNumber))}/preview`, { headers: this.authHeaders(false), responseType: 'text' }));
    }
    async downloadPdf(contractId, versionNumber) {
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/contracts/${encodeURIComponent(String(contractId))}/versions/${encodeURIComponent(String(versionNumber))}/pdf`, { headers: this.authHeaders(false), observe: 'response', responseType: 'blob' }));
        return {
            blob: response.body ?? new Blob([], { type: 'application/pdf' }),
            fileName: this.fileNameFromResponse(response) || `contract-v${versionNumber}.pdf`
        };
    }
    async getList(path) {
        const raw = await firstValueFrom(this.http.get(`${this.apiBase}${path}`, { headers: this.authHeaders() }));
        return this.extractData(raw, 'Failed to load contracts.') ?? [];
    }
    async getOne(path) {
        const raw = await firstValueFrom(this.http.get(`${this.apiBase}${path}`, { headers: this.authHeaders() }));
        return this.extractData(raw, 'Failed to load contract.');
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
    fileNameFromResponse(response) {
        const disposition = response.headers.get('content-disposition');
        const match = disposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
        return match ? decodeURIComponent(match[1].replace(/"/g, '')) : null;
    }
    authHeaders(json = true) {
        const token = localStorage.getItem('accessToken');
        let headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
        return json ? headers.set('Content-Type', 'application/json') : headers;
    }
    static { this.ɵfac = function ContractService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContractService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ContractService, factory: ContractService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContractService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
