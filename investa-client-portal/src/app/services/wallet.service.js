import { Inject, Injectable, signal } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class WalletService {
    constructor(http, apiBase) {
        this.http = http;
        this.apiBase = apiBase;
        this._balance = signal(0, ...(ngDevMode ? [{ debugName: "_balance" }] : []));
        this.balance = this._balance.asReadonly();
    }
    async loadCurrentUserWallet() {
        const [wallet, balance, transactions] = await Promise.all([
            this.getWallet(),
            this.loadBalance(),
            this.getTransactions()
        ]);
        return { wallet, balance, transactions };
    }
    async getPaidActionQuote(actionCode) {
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/wallet/me/paid-actions/${encodeURIComponent(actionCode)}/quote`, { headers: this.authHeaders() }));
            return this.extractData(raw, 'Failed to load paid action pricing.');
        }
        catch (error) {
            throw this.toWalletError(error, 'Failed to load paid action pricing.');
        }
    }
    async getWallet() {
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/wallet/me`, { headers: this.authHeaders() }));
            return this.extractData(raw, 'Failed to load wallet.');
        }
        catch (error) {
            throw this.toWalletError(error, 'Failed to load wallet.');
        }
    }
    async loadBalance() {
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/wallet/me/balance`, { headers: this.authHeaders() }));
            const balance = this.extractData(raw, 'Failed to load wallet balance.') ?? 0;
            this._balance.set(balance);
            return balance;
        }
        catch (error) {
            throw this.toWalletError(error, 'Failed to load wallet balance.');
        }
    }
    setBalance(balance) {
        this._balance.set(Number.isFinite(balance) ? balance : 0);
    }
    async getTransactions() {
        const params = new HttpParams().set('skip', '0').set('take', '100');
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/wallet/me/transactions`, { headers: this.authHeaders(), params }));
            return this.extractData(raw, 'Failed to load wallet transactions.') ?? [];
        }
        catch (error) {
            throw this.toWalletError(error, 'Failed to load wallet transactions.');
        }
    }
    extractData(raw, fallbackMessage) {
        if (!raw) {
            throw new Error(fallbackMessage);
        }
        const wrapped = raw;
        if (wrapped.data !== undefined) {
            if (wrapped.success === false) {
                throw new Error(wrapped.message || fallbackMessage);
            }
            return wrapped.data;
        }
        return raw;
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
    toWalletError(error, fallbackMessage) {
        const record = typeof error === 'object' && error !== null ? error : null;
        const status = typeof record?.['status'] === 'number' ? record['status'] : null;
        if (status === 401) {
            return new Error('You must be signed in to view your wallet.');
        }
        if (status === 403) {
            return new Error('Your account is not allowed to view this wallet.');
        }
        const nested = typeof record?.['error'] === 'object' && record['error'] !== null
            ? record['error']
            : null;
        const apiMessage = typeof nested?.['message'] === 'string'
            ? nested['message']
            : typeof record?.['message'] === 'string' ? record['message'] : '';
        return new Error(apiMessage || fallbackMessage);
    }
    static { this.ɵfac = function WalletService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WalletService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: WalletService, factory: WalletService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WalletService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
const WALLET_REASON_KEYS = {
    '1': 'purchase', '2': 'bonus', '3': 'refund', '4': 'adminadjustmentcredit',
    '10': 'investment', '11': 'publishopportunity', '12': 'featuredopportunity',
    '13': 'subscription', '14': 'adminadjustmentdebit', '15': 'platformservicefee'
};
const WALLET_REFERENCE_KEYS = {
    '0': 'none', '1': 'investment', '2': 'opportunity', '3': 'subscription',
    '4': 'wallet', '5': 'admin', '6': 'system', '7': 'conversationrequest',
    '8': 'conversation', '9': 'opportunityjoinrequest'
};
function normalizeWalletEnum(value) {
    return String(value).trim().toLowerCase().replace(/[\s_-]+/gu, '');
}
export function walletDirectionKey(value) {
    const normalized = normalizeWalletEnum(value);
    return normalized === '1' ? 'credit' : normalized === '2' ? 'debit' : normalized;
}
export function walletReasonKey(value) {
    const normalized = normalizeWalletEnum(value);
    return WALLET_REASON_KEYS[normalized] ?? normalized;
}
export function walletReferenceTypeKey(value) {
    const normalized = normalizeWalletEnum(value);
    return WALLET_REFERENCE_KEYS[normalized] ?? normalized;
}
