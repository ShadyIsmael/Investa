import { Inject, Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
const REPORT_TARGET_TYPE_VALUE = {
    Opportunity: 0,
    User: 1,
    Conversation: 2,
    Participant: 3
};
const REPORT_REASON_CODE_VALUE = {
    SuspiciousOpportunity: 0,
    MisleadingInformation: 1,
    Spam: 2,
    Abuse: 3,
    FraudConcern: 4,
    InappropriateContent: 5,
    Other: 6
};
export class ReportService {
    constructor(http, apiBase) {
        this.http = http;
        this.apiBase = apiBase;
    }
    async createReport(payload) {
        const request = this.toBackendRequest(payload);
        const raw = await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/reports`, request, { headers: this.authHeaders() }));
        const wrapped = raw;
        if (wrapped?.success === false) {
            throw new Error(wrapped.message || 'REPORT_FAILED');
        }
    }
    toBackendRequest(payload) {
        return {
            targetType: REPORT_TARGET_TYPE_VALUE[payload.targetType],
            targetId: String(payload.targetId),
            reasonCode: REPORT_REASON_CODE_VALUE[payload.reasonCode],
            description: payload.description ?? null
        };
    }
    authHeaders() {
        const token = this.getAccessTokenFromLocalStorage();
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    }
    getAccessTokenFromLocalStorage() {
        try {
            return localStorage.getItem('accessToken');
        }
        catch {
            return null;
        }
    }
    static { this.ɵfac = function ReportService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReportService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ReportService, factory: ReportService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReportService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
